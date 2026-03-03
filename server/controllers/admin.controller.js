import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import { sendDoctorEmail } from "../utils/sendEmail.js";
import ExcelJS from "exceljs";

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

    const commissionData = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$adminCommission" },
        },
      },
    ]);

    const totalCommission =
      commissionData.length > 0 ? commissionData[0].totalCommission : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        topEarningDoctors,
        topBookedDoctors,
        monthlyAppointments,
        totalCommission,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    let {
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

    name = name?.trim();
    email = email?.trim();
    password = password?.trim();
    phone = phone?.trim();
    specialization = specialization?.trim();
    about = about?.trim();

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !specialization ||
      experience === undefined ||
      !about ||
      consultationFee === undefined ||
      !availableSlots
    ) {
      res.status(400);
      throw new Error("All fields are required");
    }

    if (name.length < 2 || name.length > 20) {
      res.status(400);
      throw new Error("Name must be between 2 and 20 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Invalid email format");
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters");
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone)) {
      res.status(400);
      throw new Error("Phone number must contain only digits");
    }

    if (phone.length !== 10) {
      res.status(400);
      throw new Error("Phone number must be exactly 10 digits");
    }

    if (experience < 1 || experience > 50) {
      res.status(400);
      throw new Error("Experience must be between 1 and 50 years");
    }

    if (consultationFee <= 100 || consultationFee >= 2000) {
      res.status(400);
      throw new Error(
        "Consultation fee must be greater than 100 and less than 2000",
      );
    }

    if (!Array.isArray(availableSlots) || availableSlots.length === 0) {
      res.status(400);
      throw new Error("Available slots must be a non-empty array");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

    const validatedSlots = availableSlots.map((slot) => {
      if (!slot.date || !slot.times) {
        res.status(400);
        throw new Error("Each slot must contain date and times");
      }

      const slotDate = new Date(slot.date);

      if (isNaN(slotDate.getTime())) {
        res.status(400);
        throw new Error("Invalid date format in available slots");
      }

      if (slotDate <= today) {
        res.status(400);
        throw new Error("All slot dates must be greater than today");
      }

      if (!Array.isArray(slot.times) || slot.times.length === 0) {
        res.status(400);
        throw new Error("Each slot must have a non-empty times array");
      }

      const trimmedTimes = slot.times.map((time) => time.trim());

      const invalidTime = trimmedTimes.find((time) => !timeRegex.test(time));

      if (invalidTime) {
        res.status(400);
        throw new Error(
          "Time must be in proper format like 09:10 AM or 10:30 PM",
        );
      }

      const uniqueTimes = [...new Set(trimmedTimes)];

      return {
        date: slotDate,
        times: uniqueTimes,
      };
    });

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
        availableSlots: validatedSlots,
        isApproved: true,
      });

      await sendDoctorEmail({
        doctorName: name,
        email,
        password,
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

    const commissionData = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$doctorId",
          totalCommission: { $sum: "$adminCommission" },
        },
      },
    ]);

    const commissionMap = {};
    commissionData.forEach((item) => {
      commissionMap[item._id.toString()] = item.totalCommission;
    });

    const formattedDoctors = doctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId?.name,
      email: doc.userId?.email,
      phone: doc.userId?.phone,
      image: doc.userId?.image,
      isActive: doc.userId?.isActive,
      specialization: doc.specialization,
      experience: doc.experience,
      totalCommission: commissionMap[doc._id.toString()] || 0,
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
      isActive,
      doctorId,
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
      doctorId,
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
      patientId,
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
      .select("appointmentDate timeSlot status adminCommission")
      .sort({ appointmentDate: -1, timeSlot: 1 });

    const formattedAppointments = appointments.map((appt) => ({
      appointmentId: appt._id,
      patientName: appt.patientId?.userId?.name,
      doctorName: appt.doctorId?.userId?.name,
      appointmentDate: appt.appointmentDate,
      timeSlot: appt.timeSlot,
      status: appt.status,
      adminCommission: appt.adminCommission,
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

export const exportAdminDataToExcel = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();

    const headerStyle = {
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      },
    };

    const dataBorder = {
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const metaSheet = workbook.addWorksheet("Dashboard_Meta");

    const totalDoctors = await Doctor.countDocuments({ isDeleted: false });
    const totalPatients = await Patient.countDocuments({ isDeleted: false });
    const totalAppointments = await Appointment.countDocuments({
      isDeleted: false,
    });

    const commissionData = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$adminCommission" },
        },
      },
    ]);

    const totalCommission =
      commissionData.length > 0 ? commissionData[0].totalCommission : 0;

    const metaHeaders = [
      "Total Doctors",
      "Total Patients",
      "Total Appointments",
      "Total Commission",
    ];

    const metaValues = [
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalCommission,
    ];

    metaSheet.addRow(metaHeaders);
    metaSheet.addRow(metaValues);

    metaSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));
    metaSheet.getRow(2).eachCell((cell) => Object.assign(cell, dataBorder));

    const doctorSheet = workbook.addWorksheet("Doctors");

    doctorSheet.addRow([
      "No",
      "Name",
      "Email",
      "Phone",
      "Specialization",
      "Experience",
      "Consultation Fee",
      "Total Appointment",
      "Total Patient",
      "Total Commission",
      "Total Earning",
      "Approved",
      "Created At",
    ]);

    doctorSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

    const doctors = await Doctor.find({ isDeleted: false }).populate("userId");

    let index = 1;

    for (const doc of doctors) {
      const appointments = await Appointment.find({
        doctorId: doc._id,
        isDeleted: false,
      });

      const completedAppointments = appointments.filter((a) =>
        ["confirmed", "completed"].includes(a.status),
      );

      const totalEarning = completedAppointments.reduce(
        (sum, a) => sum + a.consultationFee,
        0,
      );

      const totalCommission = completedAppointments.reduce(
        (sum, a) => sum + a.adminCommission,
        0,
      );

      const uniquePatients = new Set(
        appointments.map((a) => a.patientId.toString()),
      );

      const row = doctorSheet.addRow([
        index++,
        doc.userId?.name,
        doc.userId?.email,
        doc.userId?.phone,
        doc.specialization,
        doc.experience,
        doc.consultationFee,
        appointments.length,
        uniquePatients.size,
        totalCommission,
        totalEarning,
        doc.isApproved,
        doc.createdAt,
      ]);

      row.eachCell((cell) => Object.assign(cell, dataBorder));
    }

    const patientSheet = workbook.addWorksheet("Patients");

    patientSheet.addRow([
      "No",
      "Name",
      "Email",
      "Gender",
      "DOB",
      "Total Appointment",
      "Total Pay",
      "Created At",
    ]);

    patientSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

    const patients = await Patient.find({ isDeleted: false }).populate(
      "userId",
    );

    index = 1;

    for (const patient of patients) {
      const appointments = await Appointment.find({
        patientId: patient._id,
        isDeleted: false,
      });

      const completedAppointments = appointments.filter((a) =>
        ["confirmed", "completed"].includes(a.status),
      );

      const totalPay = completedAppointments.reduce(
        (sum, a) => sum + a.consultationFee,
        0,
      );

      const row = patientSheet.addRow([
        index++,
        patient.userId?.name,
        patient.userId?.email,
        patient.gender,
        patient.dateOfBirth,
        appointments.length,
        totalPay,
        patient.createdAt,
      ]);

      row.eachCell((cell) => Object.assign(cell, dataBorder));
    }

    const appointmentSheet = workbook.addWorksheet("Appointments");

    appointmentSheet.addRow([
      "No",
      "Doctor Name",
      "Doctor Email",
      "Patient Name",
      "Patient Email",
      "Date",
      "Time",
      "Status",
      "Note",
      "Fee",
      "Commission",
    ]);

    appointmentSheet
      .getRow(1)
      .eachCell((cell) => Object.assign(cell, headerStyle));

    const appointments = await Appointment.find({ isDeleted: false })
      .populate({
        path: "doctorId",
        populate: { path: "userId" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId" },
      });

    index = 1;

    for (const a of appointments) {
      const row = appointmentSheet.addRow([
        index++,
        a.doctorId?.userId?.name,
        a.doctorId?.userId?.email,
        a.patientId?.userId?.name,
        a.patientId?.userId?.email,
        a.appointmentDate,
        a.timeSlot,
        a.status,
        a.notes,
        a.consultationFee,
        a.adminCommission,
      ]);

      row.eachCell((cell) => Object.assign(cell, dataBorder));
    }

    const paymentSheet = workbook.addWorksheet("Payments");

    paymentSheet.addRow([
      "No",
      "Appointment ID",
      "Doctor Name",
      "Doctor Email",
      "Patient Name",
      "Patient Email",
      "Amount",
      "Method",
      "Status",
      "Created At",
    ]);

    paymentSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

    const payments = await Payment.find()
      .populate({
        path: "doctorId",
        populate: { path: "userId" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId" },
      });

    index = 1;

    for (const p of payments) {
      const row = paymentSheet.addRow([
        index++,
        p.appointmentId,
        p.doctorId?.userId?.name,
        p.doctorId?.userId?.email,
        p.patientId?.userId?.name,
        p.patientId?.userId?.email,
        p.amount,
        p.paymentMethod,
        p.status,
        p.createdAt,
      ]);

      row.eachCell((cell) => Object.assign(cell, dataBorder));
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=admin-data.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
