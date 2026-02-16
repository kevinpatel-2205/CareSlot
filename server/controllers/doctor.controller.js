import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Doctor from "../models/doctor.model.js";

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
      status: { $ne: "cancelled" },
      isDeleted: false,
    })
      .select("appointmentDate timeSlot paymentMethod patientId")
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
