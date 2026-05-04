import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import Review from "../models/review.model.js";
import razorpayInstance from "../config/RazorPay.js";
import { CURRENCY, RAZORPAY_KEY_SECRET } from "../utils/env.js";
import crypto from "crypto";
import { sendAppointmentBookedEmailToDoctor } from "../utils/sendEmail.js";
import { checkReviewWithAI } from "../utils/aiModeration.js";
import mongoose from "mongoose";
import { generatePDFReport } from "../utils/generatePDFReport.js";
import { generateExcelReport } from "../utils/generateExcelReport.js";
import redisClient, { deleteByPattern } from "../config/redis.js";

export const getPatientDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const patient = await Patient.findOne({
      userId,
      isDeleted: false,
    }).lean();

    if (!patient) {
      return res.status(200).json({
        success: true,
        data: {
          totalBookings: 0,
          upcomingBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0,
          upcomingAppointments: [],
        },
      });
    }

    const cacheKey = `patient:${patient._id}:dashboard`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...JSON.parse(cachedData),
        source: "redis",
      });
    }

    const today = new Date();

    const totalBookings = await Appointment.countDocuments({
      patientId: patient._id,
      isDeleted: false,
    });

    const upcomingBookings = await Appointment.countDocuments({
      patientId: patient._id,
      appointmentDate: { $gte: today },
      status: { $in: ["pending", "confirmed"] },
      isDeleted: false,
    });

    const cancelledBookings = await Appointment.countDocuments({
      patientId: patient._id,
      status: "cancelled",
      isDeleted: false,
    });

    const completedBookings = await Appointment.countDocuments({
      patientId: patient._id,
      status: "completed",
      isDeleted: false,
    });

    const upcomingAppointments = await Appointment.find({
      patientId: patient._id,
      appointmentDate: { $gte: today },
      status: { $in: ["pending", "confirmed"] },
      isDeleted: false,
    })
      .sort({ appointmentDate: 1 })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .select("appointmentDate timeSlot status")
      .lean();

    const formattedAppointments = upcomingAppointments.map((apt) => ({
      doctorName: apt.doctorId?.userId?.name || null,
      doctorEmail: apt.doctorId?.userId?.email || null,
      appointmentDate: apt.appointmentDate,
      timeSlot: apt.timeSlot,
      status: apt.status,
    }));

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        success: true,
        data: {
          totalBookings,
          upcomingBookings,
          cancelledBookings,
          completedBookings,
          upcomingAppointments: formattedAppointments,
        },
      }),
      {
        EX: 300,
      },
    );

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcomingBookings,
        cancelledBookings,
        completedBookings,
        upcomingAppointments: formattedAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;

    const doctorFilter = {
      isDeleted: false,
    };

    if (specialization) {
      doctorFilter.specialization = {
        $regex: specialization,
        $options: "i",
      };
    }

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    const cacheKey = `patient:${patient._id}:doctors:search:${search || ""}:specialization:${specialization || ""}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...JSON.parse(cachedData),
        source: "redis",
      });
    }

    const doctors = await Doctor.find(doctorFilter)
      .populate({
        path: "userId",
        match: {
          role: "doctor",
          isDeleted: false,
          ...(search && {
            name: { $regex: search, $options: "i" },
          }),
        },
        select: "name email isActive image",
      })
      .lean();

    const filteredDoctors = doctors.filter((doc) => doc.userId !== null);

    const formattedDoctors = filteredDoctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId.name,
      email: doc.userId.email,
      isActive: doc.userId.isActive,
      image: doc.userId.image,
      specialization: doc.specialization,
      consultationFee: doc.consultationFee,
      availableSlots: doc.availableSlots,
      availabilityStatus:
        doc.availableSlots && doc.availableSlots.length > 0
          ? "Available"
          : "Unavailable",
      averageRating: doc.averageRating || 0,
      totalReviews: doc.totalReviews || 0,
    }));

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        success: true,
        count: formattedDoctors.length,
        data: formattedDoctors,
      }),
      {
        EX: 300,
      },
    );

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorDetails = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    const cacheKey = `patient:${patient._id}:doctor:${doctorId}:details`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...JSON.parse(cachedData),
        source: "redis",
      });
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
      isApproved: true,
    })
      .populate({
        path: "userId",
        select: "name email image isActive",
      })
      .lean();

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const validSlots = (doctor.availableSlots || []).filter((slot) => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      if (slotDate > today) return true;

      if (slotDate.getTime() === today.getTime()) {
        slot.times = (slot.times || []).filter((t) => {
          const [hours, minutes] = t.split(":").map(Number);
          const slotTime = new Date();
          slotTime.setHours(hours, minutes, 0, 0);
          return slotTime > now;
        });
        return slot.times.length > 0;
      }

      return false;
    });

    const originalCount = (doctor.availableSlots || []).length;
    if (validSlots.length !== originalCount) {
      await Doctor.findByIdAndUpdate(doctor._id, {
        $set: { availableSlots: validSlots },
      });
    }

    doctor.availableSlots = validSlots;

    const reviews = await Review.find({
      doctorId: doctor._id,
      isApprove: true,
      isDeleted: false,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image",
        },
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedReviews = reviews.map((review) => ({
      reviewId: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      patientName: review.patientId?.userId?.name || null,
      patientImage: review.patientId?.userId?.image || null,
    }));

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        success: true,
        data: {
          doctorId: doctor._id,
          name: doctor.userId.name,
          email: doctor.userId.email,
          image: doctor.userId.image,
          isActive: doctor.userId.isActive,
          specialization: doctor.specialization,
          experience: doctor.experience,
          about: doctor.about,
          consultationFee: doctor.consultationFee,
          availableSlots: doctor.availableSlots,
          averageRating: doctor.averageRating,
          totalReviews: doctor.totalReviews,
          reviews: formattedReviews,
        },
      }),
      {
        EX: 300,
      },
    );

    res.status(200).json({
      success: true,
      data: {
        doctorId: doctor._id,
        name: doctor.userId.name,
        email: doctor.userId.email,
        image: doctor.userId.image,
        isActive: doctor.userId.isActive,
        specialization: doctor.specialization,
        experience: doctor.experience,
        about: doctor.about,
        consultationFee: doctor.consultationFee,
        availableSlots: doctor.availableSlots,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews,
        reviews: formattedReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  try {
    let { doctorId, appointmentDate, timeSlot, notes } = req.body;

    appointmentDate = appointmentDate?.trim();
    timeSlot = timeSlot?.trim();
    notes = notes?.trim();

    if (!doctorId || !appointmentDate || !timeSlot) {
      res.status(400);
      throw new Error("All required fields must be provided");
    }

    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      res.status(400);
      throw new Error("Invalid appointment date");
    }

    if (selectedDate <= today) {
      res.status(400);
      throw new Error("Appointment date must be greater than today");
    }

    const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

    if (!timeRegex.test(timeSlot)) {
      res.status(400);
      throw new Error(
        "Time must be in proper format like 09:10 AM or 10:30 PM",
      );
    }

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient profile not found");
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
      isApproved: true,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const isActiveDoctor = await User.findOne({
      _id: doctor.userId,
      isActive: true,
      isDeleted: false,
    });

    if (!isActiveDoctor) {
      res.status(404);
      throw new Error("Doctor is not active");
    }

    const slot = doctor.availableSlots.find(
      (s) => new Date(s.date).toDateString() === selectedDate.toDateString(),
    );

    if (!slot || !slot.times.includes(timeSlot)) {
      res.status(400);
      throw new Error("Selected slot is not available");
    }

    const conflictingAppointment = await Appointment.findOne({
      patientId: patient._id,
      appointmentDate: selectedDate,
      timeSlot: timeSlot,
      status: { $nin: ["cancelled"] },
      isDeleted: false,
    });

    if (conflictingAppointment) {
      res.status(409);
      throw new Error(
        "You already have an appointment scheduled at this date and time",
      );
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      appointmentDate: selectedDate,
      timeSlot,
      consultationFee: doctor.consultationFee,
      paymentMethod: "cash",
      notes,
      status: "pending",
      paymentStatus: "pending",
    });

    await Payment.create({
      appointmentId: appointment._id,
      doctorId,
      patientId: patient._id,
      amount: doctor.consultationFee,
      paymentMethod: "cash",
      status: "created",
    });

    sendAppointmentBookedEmailToDoctor({
      doctorName: isActiveDoctor.name,
      doctorEmail: isActiveDoctor.email,
      patientName: req.user.name,
      patientEmail: req.user.email,
      patientAge: patient.age,
      dateOfBirth: patient.dateOfBirth,
      appointmentDate,
      timeSlot,
      reason: notes,
      medicalHistory: patient.medicalHistory,
    });

    slot.times = slot.times.filter((t) => t !== timeSlot);

    if (slot.times.length === 0) {
      doctor.availableSlots = doctor.availableSlots.filter(
        (s) => new Date(s.date).toDateString() !== selectedDate.toDateString(),
      );
    }

    await doctor.save();

    await redisClient.del(`patient:${patient._id}:dashboard`);
    await deleteByPattern(`patient:${patient._id}:appointments:*`);
    await deleteByPattern(`patient:${patient._id}:doctors:*`);
    await deleteByPattern(`patient:${patient._id}:doctor:*`);

    await redisClient.del(`doctor:${doctor._id}:dashboard`);
    await deleteByPattern(`doctor:${doctor._id}:appointments:*`);
    await deleteByPattern(`doctor:${doctor._id}:availableSlots:*`);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 5 } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient profile not found");
    }

    const cacheKey = `patient:${patient._id}:appointments:page:${currentPage}:limit:${perPage}:status:${status || "all"}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...JSON.parse(cachedData),
        source: "redis",
      });
    }

    const filter = {
      patientId: patient._id,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate({
        path: "doctorId",
        select: "specialization",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ appointmentDate: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    const now = new Date();

    const expiredAppointments = appointments.filter((apt) => {
      const [time, modifier] = apt.timeSlot.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

      const appointmentDateTime = new Date(apt.appointmentDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      return (
        appointmentDateTime < now &&
        (apt.status === "pending" || apt.status === "confirmed")
      );
    });

    if (expiredAppointments.length > 0) {
      const pendingIds = expiredAppointments
        .filter((apt) => apt.status === "pending")
        .map((apt) => apt._id);

      const confirmedExpired = expiredAppointments.filter(
        (apt) => apt.status === "confirmed",
      );

      if (pendingIds.length > 0) {
        await Appointment.updateMany(
          { _id: { $in: pendingIds } },
          { $set: { status: "cancelled" } },
        );
      }

      for (const apt of confirmedExpired) {
        const doctor = await Doctor.findById(apt.doctorId);

        const fee = apt.consultationFee;
        const adminCommission = doctor ? (fee * doctor.aCommission) / 100 : 0;

        await Appointment.findByIdAndUpdate(apt._id, {
          $set: {
            status: "completed",
            paymentStatus: "paid",
            adminCommission,
          },
        });

        await Payment.findOneAndUpdate(
          { appointmentId: apt._id },
          { status: "success" },
        );
      }

      const confirmedIds = confirmedExpired.map((apt) => apt._id);

      // Update local appointment objects to reflect new status
      appointments.forEach((apt) => {
        if (pendingIds.some((id) => id.equals(apt._id))) {
          apt.status = "cancelled";
        }
        if (confirmedIds.some((id) => id.equals(apt._id))) {
          apt.status = "completed";
          apt.paymentStatus = "paid";
        }
      });

      // Invalidate cache since statuses changed
      await deleteByPattern(`patient:${patient._id}:appointments:*`);
    }

    const formattedAppointments = appointments.map((apt) => ({
      appointmentId: apt._id,
      doctorName: apt.doctorId?.userId?.name,
      doctorEmail: apt.doctorId?.userId?.email,
      specialization: apt.doctorId?.specialization,
      appointmentDate: apt.appointmentDate,
      timeSlot: apt.timeSlot,
      status: apt.status,
      paymentStatus: apt.paymentStatus,
      paymentMethod: apt.paymentMethod,
      consultationFee: apt.consultationFee,
      prescriptionAdded: apt.prescriptionAdded,
    }));

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        success: true,
        data: formattedAppointments,
        currentPage,
        totalPages: Math.ceil(total / perPage),
        totalItems: total,
      }),
      {
        EX: 300,
      },
    );

    res.status(200).json({
      success: true,
      data: formattedAppointments,
      currentPage,
      totalPages: Math.ceil(total / perPage),
      totalItems: total,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.user._id,
      isDeleted: false,
    }).select("name email phone role image");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const patient = await Patient.findOne({
      userId: user._id,
      isDeleted: false,
    }).select("dateOfBirth gender geolocation medicalHistory");

    const geo = patient?.geolocation;

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
        dateOfBirth: patient?.dateOfBirth || null,
        gender: patient?.gender || null,
        geolocation: geo
          ? {
              latitude: geo.coordinates?.[1],
              longitude: geo.coordinates?.[0],
              address: geo.address,
            }
          : null,
        medicalHistory: patient?.medicalHistory || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    let { name, phone, dateOfBirth, gender, medicalHistory, geolocation } =
      req.body;

    name = name?.trim();
    phone = phone?.trim();
    medicalHistory = medicalHistory?.trim();

    const user = await User.findOne({
      _id: req.user._id,
      isDeleted: false,
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (name !== undefined) {
      if (name.length < 2 || name.length > 20) {
        res.status(400);
        throw new Error("Name must be between 2 and 20 characters");
      }
      user.name = name;
    }

    if (phone !== undefined) {
      const phoneRegex = /^[0-9]+$/;

      if (!phoneRegex.test(phone)) {
        res.status(400);
        throw new Error("Phone number must contain only digits");
      }

      if (phone.length !== 10) {
        res.status(400);
        throw new Error("Phone number must be exactly 10 digits");
      }

      user.phone = phone;
    }

    await user.save();

    const patient = await Patient.findOne({
      userId: user._id,
      isDeleted: false,
    });

    if (patient) {
      if (dateOfBirth !== undefined) {
        const dob = new Date(dateOfBirth);
        const today = new Date();

        if (isNaN(dob.getTime())) {
          res.status(400);
          throw new Error("Invalid date of birth");
        }

        if (dob >= today) {
          res.status(400);
          throw new Error("Date of birth must be in the past");
        }

        patient.dateOfBirth = dob;
      }

      if (gender !== undefined) {
        const allowedGenders = ["male", "female", "other"];

        if (!allowedGenders.includes(gender.toLowerCase())) {
          res.status(400);
          throw new Error("Gender must be male, female, or other");
        }

        patient.gender = gender.toLowerCase();
      }

      if (medicalHistory !== undefined) {
        if (medicalHistory === "") {
          res.status(400);
          throw new Error("Medical history cannot be empty");
        }

        patient.medicalHistory = medicalHistory;
      }

      if (geolocation !== undefined) {
        const { latitude, longitude, address } = geolocation;

        if (!latitude || !longitude) {
          res.status(400);
          throw new Error("Invalid geolocation data");
        }

        patient.geolocation = {
          type: "Point",
          coordinates: [longitude, latitude],
          address: address || "",
        };
      }

      await patient.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const paymentRazorpay = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await Appointment.findById(appointmentId);

    if (!appointmentData || appointmentData.status === "cancelled") {
      res.status(404);
      throw new Error("Appointment Cancelled or not found");
    }

    if (appointmentData.paymentStatus === "paid") {
      res.status(400);
      throw new Error("Payment already paid");
    }

    const options = {
      amount: appointmentData.consultationFee * 100,
      currency: CURRENCY,
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);

    await Payment.findOneAndUpdate(
      { appointmentId },
      {
        appointmentId,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        amount: appointmentData.consultationFee,
        paymentMethod: "razorpay",
        razorpayOrderId: order.id,
        status: "created",
      },
      { returnDocument: "after", upsert: true },
    );

    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      status: "pending",
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpay = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (payment) {
        if (payment.status !== "success") {
          payment.status = "failed";
          await payment.save();

          await Appointment.findByIdAndUpdate(payment.appointmentId, {
            paymentStatus: "failed",
            status: "pending",
          });
        }
      }

      res.status(400);
      throw new Error("Invalid Payment Signature");
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      res.status(404);
      throw new Error("Payment record not found");
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "success";
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId);

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found");
    }

    const doctor = await Doctor.findById(appointment.doctorId);

    const fee = appointment.consultationFee;
    const commissionPercent = doctor?.aCommission || 0;

    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
    appointment.adminCommission = (fee * commissionPercent) / 100;

    await appointment.save();

    await deleteByPattern(`patient:${appointment.patientId}:appointments:*`);
    await redisClient.del(`patient:${appointment.patientId}:dashboard`);

    await deleteByPattern(`doctor:${appointment.doctorId}:appointments:*`);
    await redisClient.del(`doctor:${appointment.doctorId}:dashboard`);

    res.json({
      success: true,
      message: "Payment Successful",
    });
  } catch (error) {
    next(error);
  }
};

export const markRazorpayFailed = async (req, res, next) => {
  try {
    const { appointmentId, razorpay_order_id } = req.body;

    if (!appointmentId && !razorpay_order_id) {
      res.status(400);
      throw new Error("appointmentId or razorpay_order_id is required");
    }

    const payment = razorpay_order_id
      ? await Payment.findOne({ razorpayOrderId: razorpay_order_id })
      : await Payment.findOne({ appointmentId });

    if (!payment) {
      res.status(404);
      throw new Error("Payment record not found");
    }

    if (payment.status === "success") {
      return res.status(200).json({
        success: true,
        message: "Payment already marked as successful",
      });
    }

    payment.status = "failed";
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointmentId, {
      paymentStatus: "failed",
      status: "pending",
      paymentMethod: "razorpay",
    });

    res.status(200).json({
      success: true,
      message: "Payment marked as failed",
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { doctorId, rating, comment } = req.body;

    if (!doctorId || !rating) {
      res.status(400);
      throw new Error("rating is required");
    }

    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient profile not found");
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const appointment = await Appointment.findOne({
      doctorId,
      patientId: patient._id,
      status: "completed",
      isDeleted: false,
    });

    if (!appointment) {
      res.status(400);
      throw new Error(
        "You can review only after completing appointment with this doctor",
      );
    }

    const reviewCount = await Review.countDocuments({
      doctorId,
      patientId: patient._id,
    });

    if (reviewCount >= 100) {
      res.status(400);
      throw new Error("You can only submit 1 reviews for this doctor");
    }

    const aiResult = await checkReviewWithAI(comment || "");

    const review = await Review.create({
      doctorId,
      patientId: patient._id,
      rating,
      comment,
      isApprove: aiResult.approved,
      aiReason: aiResult.approved ? "" : aiResult.reason,
    });

    if (aiResult.approved) {
      const ratingData = await Review.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            isApprove: true,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$doctorId",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      const averageRating = ratingData[0]?.averageRating || 0;
      const totalReviews = ratingData[0]?.totalReviews || 0;

      await Doctor.findByIdAndUpdate(doctorId, {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
      });
    }

    await redisClient.del(`patient:${patient._id}:doctor:${doctorId}:details`);
    await deleteByPattern(`patient:${patient._id}:doctors:*`);
    await deleteByPattern(`doctor:${doctorId}:reviews:*`);

    res.status(201).json({
      success: true,
      message: aiResult.approved
        ? "Review submitted and approved"
        : "Review submitted and waiting for admin approval",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// its For Generate PDF Or Excel

export const exportAppointmentsPDF = async (req, res, next) => {
  try {
    const { status } = req.query;

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient profile not found");
    }

    const filter = {
      patientId: patient._id,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: "doctorId",
        select: "specialization",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ appointmentDate: -1 })
      .lean();

    const headers = [
      "No",
      "Doctor Name",
      "Doctor Email",
      "Specialization",
      "Date",
      "Time",
      "Status",
      "Payment",
      "Fee",
    ];

    const rows = appointments.map((apt, i) => [
      i + 1,
      apt.doctorId?.userId?.name || "",
      apt.doctorId?.userId?.email || "",
      apt.doctorId?.specialization || "",
      new Date(apt.appointmentDate).toLocaleDateString("en-IN"),
      apt.timeSlot,
      apt.status,
      apt.paymentStatus,
      apt.consultationFee,
    ]);

    generatePDFReport(res, "Appointments Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportAppointmentsExcel = async (req, res, next) => {
  try {
    const { status } = req.query;

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient profile not found");
    }

    const filter = {
      patientId: patient._id,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: "doctorId",
        select: "specialization",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ appointmentDate: -1 })
      .lean();

    const headers = [
      "No",
      "Doctor Name",
      "Doctor Email",
      "Specialization",
      "Date",
      "Time",
      "Status",
      "Payment",
      "Fee",
    ];

    const rows = appointments.map((apt, i) => [
      i + 1,
      apt.doctorId?.userId?.name || "",
      apt.doctorId?.userId?.email || "",
      apt.doctorId?.specialization || "",
      new Date(apt.appointmentDate).toLocaleDateString("en-IN"),
      apt.timeSlot,
      apt.status,
      apt.paymentStatus,
      apt.consultationFee,
    ]);

    await generateExcelReport(res, "Appointments Report", headers, rows);
  } catch (error) {
    next(error);
  }
};
