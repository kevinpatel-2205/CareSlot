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
