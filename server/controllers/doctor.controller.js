import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import mongoose from "mongoose";

export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = new mongoose.Types.ObjectId(req.user._id);

    const appointmentStats = await Appointment.aggregate([
      {
        $match: { doctor: doctorId },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      totalAppointments: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointmentStats.forEach((stat) => {
      stats[stat._id] = stat.count;
      stats.totalAppointments += stat.count;
    });

    const earnings = await Payment.aggregate([
      {
        $match: {
          doctor: doctorId,
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

    const totalEarnings = earnings[0]?.totalEarnings || 0;

    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          doctor: doctorId,
          status: "success",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const today = new Date();

    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: today }, // future dates only
      status: { $in: ["pending", "confirmed"] }, // only active appointments
    })
      .populate("patient", "name email")
      .sort({ appointmentDate: 1 }) // nearest first
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        totalEarnings,
        monthlyEarnings,
        upcomingAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
