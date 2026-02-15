import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import mongoose from "mongoose";

export const getPatientDashboard = async (req, res) => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await Appointment.aggregate([
      {
        $match: { patient: patientId },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const appointmentStats = {
      totalAppointments: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    stats.forEach((stat) => {
      appointmentStats[stat._id] = stat.count;
      appointmentStats.totalAppointments += stat.count;
    });

    const paymentStats = await Payment.aggregate([
      {
        $match: {
          patient: patientId,
          status: "success",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let cashTotal = 0;
    let razorpayTotal = 0;

    paymentStats.forEach((p) => {
      if (p._id === "cash") cashTotal = p.totalAmount;
      if (p._id === "razorpay") razorpayTotal = p.totalAmount;
    });

    const totalPaid = cashTotal + razorpayTotal;

    res.status(200).json({
      success: true,
      data: {
        ...appointmentStats,
        totalPaid,
        paymentBreakdown: {
          cash: cashTotal,
          razorpay: razorpayTotal,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const specialization = req.query.specialization || "";

    const query = {
      role: "doctor",
      name: { $regex: search, $options: "i" },
    };

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: doctors,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const date = new Date(appointmentDate);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: {
        $gte: date,
        $lt: nextDay,
      },
      timeSlot: timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: date,
      timeSlot,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        success: false,
        message: "New date and time slot are required",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled appointments can be rescheduled",
      });
    }

    const date = new Date(newDate);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor, 
      appointmentDate: {
        $gte: date,
        $lt: nextDay,
      },
      timeSlot: newTimeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Time slot already booked",
      });
    }

    appointment.appointmentDate = date;
    appointment.timeSlot = newTimeSlot;
    appointment.status = "pending"; 

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({
      patient: req.user._id,
    })
      .populate("doctor", "name specialization")
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Appointment.countDocuments({
      patient: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: appointments,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        patient: req.user._id,
      },
      { status: "cancelled" },
      { new: true },
    );

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      patient: req.user._id,
    })
      .populate("doctor", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
