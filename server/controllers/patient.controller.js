import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import razorpayInstance from "../utils/RazorPay.js";
import { CURRENCY, RAZORPAY_KEY_SECRET } from "../utils/env.js";
import crypto from "crypto";
import { sendAppointmentBookedEmailToDoctor } from "../utils/sendEmail.js";

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
        select: "name email isActive",
      })
      .lean();

    const filteredDoctors = doctors.filter((doc) => doc.userId !== null);

    const formattedDoctors = filteredDoctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId.name,
      email: doc.userId.email,
      isActive: doc.userId.isActive,
      specialization: doc.specialization,
      availabilityStatus:
        doc.availableSlots && doc.availableSlots.length > 0
          ? "Available"
          : "Unavailable",
    }));

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

    if (notes !== undefined && notes === "") {
      res.status(400);
      throw new Error("Notes cannot be empty");
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
    }));

    res.status(200).json({
      success: true,
      count: formattedAppointments.length,
      data: formattedAppointments,
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
    }).select("dateOfBirth gender address medicalHistory");

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
        address: patient?.address || null,
        medicalHistory: patient?.medicalHistory || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    let { name, phone, dateOfBirth, gender, address, medicalHistory } =
      req.body;

    name = name?.trim();
    phone = phone?.trim();
    address = address?.trim();
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

      if (address) {
        if (address.length < 5) {
          res.status(400);
          throw new Error("Address must be at least 5 characters long");
        }

        patient.address = address;
      }

      if (medicalHistory !== undefined) {
        if (medicalHistory === "") {
          res.status(400);
          throw new Error("Medical history cannot be empty");
        }

        patient.medicalHistory = medicalHistory;
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
      throw new Error("Payment already completed");
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

    const fee = appointment.consultationFee;
    let commissionPercent = 0;

    if (fee < 500) {
      commissionPercent = 20;
    } else if (fee < 1000) {
      commissionPercent = 15;
    } else if (fee < 2000) {
      commissionPercent = 10;
    } else {
      commissionPercent = 5;
    }

    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
    appointment.adminCommission = (fee * commissionPercent) / 100;

    await appointment.save();

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
