import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalDoctors = await Doctor.countDocuments({
      isDeleted: false,
    });

    const totalPatients = await Patient.countDocuments({
      isDeleted: false,
    });

    const topEarningDoctors = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$doctorId",
          totalEarning: { $sum: "$consultationFee" },
          totalAppointments: { $sum: 1 },
        },
      },
      { $sort: { totalEarning: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $lookup: {
          from: "users",
          localField: "doctor.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          doctorId: "$_id",
          name: "$user.name",
          totalEarning: 1,
          totalAppointments: 1,
        },
      },
    ]);

    const topBookedDoctors = await Appointment.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$doctorId",
          totalAppointments: { $sum: 1 },
        },
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $lookup: {
          from: "users",
          localField: "doctor.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          doctorId: "$_id",
          name: "$user.name",
          totalAppointments: 1,
        },
      },
    ]);

    const monthlyAppointments = await Appointment.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAppointments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        topEarningDoctors,
        topBookedDoctors,
        monthlyAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      about,
      consultationFee,
      availableSlots,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      experience === undefined ||
      !about ||
      consultationFee === undefined ||
      !availableSlots
    ) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Doctor with this email already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "doctor",
    });

    try {
      const doctor = await Doctor.create({
        userId: user._id,
        specialization,
        experience,
        about,
        consultationFee,
        availableSlots,
        isApproved: true,
      });

      res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        data: {
          doctorId: doctor._id,
          name: user.name,
          email: user.email,
          specialization: doctor.specialization,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          isApproved: doctor.isApproved,
        },
      });
    } catch (err) {
      await User.findByIdAndDelete(user._id);
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isDeleted: false })
      .populate({
        path: "userId",
        select: "name email phone image isActive",
      })
      .select("specialization experience");

    const formattedDoctors = doctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId?.name,
      email: doc.userId?.email,
      phone: doc.userId?.phone,
      image: doc.userId?.image,
      isActive: doc.userId?.isActive,
      specialization: doc.specialization,
      experience: doc.experience,
    }));

    res.status(200).json({
      success: true,
      total: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleDoctorStatus = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { isActive } = req.body;

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const user = await User.findById(doctor.userId);

    if (!user) {
      res.status(404);
      throw new Error("Associated user not found");
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    doctor.isDeleted = true;
    await doctor.save();

    await User.findByIdAndUpdate(doctor.userId, {
      isDeleted: true,
    });

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      isDeleted: false,
    });

    const appointmentIds = appointments.map((a) => a._id);

    await Appointment.updateMany({ doctorId: doctor._id }, { isDeleted: true });

    await Payment.updateMany(
      { appointmentId: { $in: appointmentIds } },
      { isDeleted: true },
    );

    res.status(200).json({
      success: true,
      message: "Doctor and related data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ isDeleted: false })
      .populate({
        path: "userId",
        select: "name email image",
      })
      .lean();

    const patientIds = patients.map((p) => p._id);

    const bookingCounts = await Appointment.aggregate([
      {
        $match: {
          patientId: { $in: patientIds },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$patientId",
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    const bookingMap = {};
    bookingCounts.forEach((b) => {
      bookingMap[b._id.toString()] = b.totalBookings;
    });

    const formattedPatients = patients.map((p) => ({
      patientId: p._id,
      name: p.userId?.name,
      email: p.userId?.email,
      image: p.userId?.image,
      totalBookings: bookingMap[p._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      total: formattedPatients.length,
      data: formattedPatients,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    patient.isDeleted = true;
    await patient.save();

    await User.findByIdAndUpdate(patient.userId, {
      isDeleted: true,
    });

    const appointments = await Appointment.find({
      patientId: patient._id,
      isDeleted: false,
    });

    const appointmentIds = appointments.map((a) => a._id);

    await Appointment.updateMany(
      { patientId: patient._id },
      { isDeleted: true },
    );

    await Payment.updateMany(
      { appointmentId: { $in: appointmentIds } },
      { isDeleted: true },
    );

    res.status(200).json({
      success: true,
      message: "Patient and related data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .select("date time status")
      .sort({ date: -1 });

    const formattedAppointments = appointments.map((appt) => ({
      appointmentId: appt._id,
      patientName: appt.patientId?.userId?.name,
      doctorName: appt.doctorId?.userId?.name,
      date: appt.date,
      time: appt.time,
      status: appt.status,
    }));

    res.status(200).json({
      success: true,
      total: formattedAppointments.length,
      data: formattedAppointments,
    });
  } catch (error) {
    next(error);
  }
};
