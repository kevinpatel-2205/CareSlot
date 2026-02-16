import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import mongoose from "mongoose";

export const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const statusCounts = await Appointment.aggregate([
      {
        $match: {
          doctorId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStatus = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      formattedStatus[item._id] = item.count;
    });

    const earningsData = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
        },
      },
    ]);

    const totalEarnings =
      earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: "success",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthly = monthlyEarnings.map((item) => ({
      month: monthNames[item._id],
      total: item.total,
    }));

    const paymentDistribution = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: "success",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const formattedPayment = {
      cash: 0,
      razorpay: 0,
    };

    paymentDistribution.forEach((item) => {
      formattedPayment[item._id] = item.total;
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        appointmentCounts: formattedStatus,
        monthlyEarnings: formattedMonthly,
        paymentDistribution: formattedPayment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: new Date() },
      status: { $nin: ["cancelled", "completed"] },
      isDeleted: false,
    })
      .select("appointmentDate timeSlot paymentMethod patientId status")
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ appointmentDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const { status } = req.query;

    const filter = {
      doctorId,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .select("appointmentDate timeSlot paymentMethod patientId status")
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const changeAppointmentStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
      isDeleted: false,
    });

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found");
    }

    if (appointment.status === "cancelled") {
      res.status(400);
      throw new Error("Cancelled appointment cannot be updated");
    }

    if (appointment.status === "pending") {
      appointment.status = "confirmed";
    } else if (appointment.status === "confirmed") {
      appointment.status = "completed";
      appointment.paymentStatus = "paid";

      if (appointment.paymentMethod === "cash") {
        await Payment.findOneAndUpdate(
          { appointmentId: appointment._id },
          { status: "success" },
        );
      }
    } else if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Appointment already completed",
      });
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${appointment.status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
      isDeleted: false,
    });

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found");
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    const slot = doctor.availableSlots.find(
      (s) =>
        new Date(s.date).toDateString() ===
        new Date(appointment.appointmentDate).toDateString(),
    );

    if (slot && !slot.times.includes(appointment.timeSlot)) {
      slot.times.push(appointment.timeSlot);
    }

    await doctor.save();

    const payment = await Payment.findOne({
      appointmentId: appointment._id,
    });

    if (payment && payment.paymentMethod === "razorpay") {
      payment.status = "failed";
      await payment.save();
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const patients = await Appointment.aggregate([
      {
        $match: {
          doctorId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$patientId",
          totalAppointments: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $lookup: {
          from: "users",
          localField: "patient.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          patientId: "$_id",
          totalAppointments: 1,
          name: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
          image: "$user.image",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorPatientDetails = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const doctorId = doctor._id;

    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).populate(
      "userId",
      "name email phone image",
    );

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    let age = null;
    if (patient.dateOfBirth) {
      const diff = Date.now() - new Date(patient.dateOfBirth).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    const appointments = await Appointment.find({
      doctorId,
      patientId,
      isDeleted: false,
    })
      .select(
        "_id patientId appointmentDate timeSlot status paymentStatus paymentMethod consultationFee notes",
      )
      .sort({ appointmentDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        patientDetails: {
          patientId: patient._id,
          name: patient.userId.name,
          email: patient.userId.email,
          phone: patient.userId.phone,
          image: patient.userId.image,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth,
          age,
          medicalHistory: patient.medicalHistory,
        },
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.user._id,
      isDeleted: false,
    }).select("availableSlots");

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    res.status(200).json({
      success: true,
      data: doctor.availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

export const addAvailableSlots = async (req, res, next) => {
  try {
    const { date, times } = req.body;

    if (!date || !times || !Array.isArray(times)) {
      res.status(400);
      throw new Error("Date and times are required");
    }

    const doctor = await Doctor.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const existingSlot = doctor.availableSlots.find(
      (slot) =>
        new Date(slot.date).toDateString() === new Date(date).toDateString(),
    );

    if (existingSlot) {
      const uniqueTimes = times.filter(
        (time) => !existingSlot.times.includes(time),
      );

      existingSlot.times.push(...uniqueTimes);
    } else {
      doctor.availableSlots.push({
        date,
        times,
      });
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Available slots added successfully",
      data: doctor.availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.user._id,
      isDeleted: false,
    }).select("name email phone role image isActive");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const doctor = await Doctor.findOne({
      userId: user._id,
      isDeleted: false,
    }).select("specialization experience about consultationFee isApproved");

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor profile not found");
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
        isActive: user.isActive,
        specialization: doctor.specialization,
        experience: doctor.experience,
        about: doctor.about,
        consultationFee: doctor.consultationFee,
        isApproved: doctor.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      specialization,
      experience,
      about,
      consultationFee,
      isActive,
    } = req.body;

    const imageFile = req.file;

    const user = await User.findOne({
      _id: req.user._id,
      isDeleted: false,
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
        folder: "doctor-app/doctors",
      });

      user.image = imageUpload.secure_url;
    }

    await user.save();

    const doctor = await Doctor.findOne({
      userId: user._id,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor profile not found");
    }

    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (about) doctor.about = about;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
