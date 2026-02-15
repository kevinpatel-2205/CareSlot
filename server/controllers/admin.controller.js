import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";

export const getAdminDashboard = async (req, res) => {
  try {

    // =====================================
    // 1️⃣ Basic Counts
    // =====================================
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();

    // =====================================
    // 2️⃣ Top 5 Highest Earning Doctors
    // =====================================
    const topEarningDoctors = await Payment.aggregate([
      {
        $match: { status: "success" }
      },
      {
        $group: {
          _id: "$doctor",
          totalEarnings: { $sum: "$amount" }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "user",
          localField: "_id",
          foreignField: "_id",
          as: "doctor"
        }
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 0,
          doctorId: "$doctor._id",
          doctorName: "$doctor.name",
          totalEarnings: 1
        }
      }
    ]);

    const topPatientDoctors = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctor",
          totalAppointments: { $sum: 1 }
        }
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor"
        }
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 0,
          doctorId: "$doctor._id",
          doctorName: "$doctor.name",
          totalAppointments: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        topEarningDoctors,
        topPatientDoctors
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
