import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Review from "../models/review.model.js";
import Prescription from "../models/prescription.model.js";
import { sendDoctorEmail } from "../utils/sendEmail.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { generatePDFReport } from "../utils/generatePDFReport .js";
import { generateExcelReport } from "../utils/generateExcelReport.js";
// import redisClient, { deleteByPattern } from "../config/redis.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const cacheKey = "admin:dashboard";

    // const cachedData = await redisClient.get(cacheKey);

    // if (cachedData) {
    //   return res.status(200).json({
    //     success: true,
    //     data: JSON.parse(cachedData),
    //     source: "redis",
    //   });
    // }

    const [
      totalDoctors,
      totalPatients,
      topEarningDoctors,
      topBookedDoctors,
      monthlyAppointments,
      commissionData,
    ] = await Promise.all([
      Doctor.countDocuments({ isDeleted: false }),

      Patient.countDocuments({ isDeleted: false }),

      Appointment.aggregate([
        {
          $match: {
            status: "completed",
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$doctorId",
            totalEarning: {
              $sum: {
                $subtract: ["$consultationFee", "$adminCommission"],
              },
            },
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
      ]),

      Appointment.aggregate([
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
      ]),

      Appointment.aggregate([
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
      ]),

      Appointment.aggregate([
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
      ]),
    ]);

    const totalCommission = commissionData?.[0]?.totalCommission || 0;

    const dashboardData = {
      totalDoctors,
      totalPatients,
      topEarningDoctors,
      topBookedDoctors,
      monthlyAppointments,
      totalCommission,
    };

    // await redisClient.set(cacheKey, JSON.stringify(dashboardData), {
    //   EX: 300,
    // });

    res.status(200).json({
      success: true,
      data: dashboardData,
      source: "mongodb",
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
      phone,
      specialization,
      experience,
      about,
      consultationFee,
      availableSlots,
      aCommission,
    } = req.body;

    name = name?.trim();
    email = email?.trim();
    phone = phone?.trim();
    specialization = specialization?.trim();
    about = about?.trim();

    function generatePassword() {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

      let password;
      do {
        password = Array.from(
          { length: Math.floor(Math.random() * 5) + 8 },
          () => chars[Math.floor(Math.random() * chars.length)],
        ).join("");
      } while (password.length < 8 || password.length > 12);

      return password;
    }
    let password = generatePassword();

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

    if (aCommission === undefined) {
      res.status(400);
      throw new Error("Commission is required");
    }

    const percent = Number(aCommission);

    if (percent < 5 || percent > 35) {
      res.status(400);
      throw new Error("Commission must be between 5% and 35%");
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
        availableSlots: validatedSlots,
        isApproved: true,
        aCommission: aCommission,
        commissionHistory: [
          {
            commission: aCommission,
            changedAt: new Date(),
          },
        ],
      });

      await sendDoctorEmail({
        doctorName: name,
        email,
        password,
      });

      // await deleteByPattern("admin:doctors:page:*");
      // await redisClient.del("admin:dashboard");

      // await redisClient.del("admin:dashboard");

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
          aCommission: doctor.aCommission,
        },
      });
    } catch (err) {
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const cacheKey = `admin:doctors:page:${page}:limit:${limit}`;

    // const cachedData = await redisClient.get(cacheKey);

    // if (cachedData) {
    //   return res.status(200).json({
    //     ...JSON.parse(cachedData),
    //     source: "redis",
    //   });
    // }

    const doctors = await Doctor.find({ isDeleted: false })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "userId",
        select: "name email phone image isActive",
      })
      .select("specialization experience aCommission")
      .lean();

    const doctorIds = doctors.map((doc) => doc._id);

    const commissionData = await Appointment.aggregate([
      {
        $match: {
          doctorId: { $in: doctorIds },
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
      aCommission: doc.aCommission,
      totalCommission: commissionMap[doc._id.toString()] || 0,
    }));

    const totalDoctors = await Doctor.countDocuments({ isDeleted: false });

    const responseData = {
      success: true,
      data: formattedDoctors,
      currentPage: Number(page),
      totalPages: Math.ceil(totalDoctors / limit),
      total: totalDoctors,
    };

    // await redisClient.set(cacheKey, JSON.stringify(responseData), {
    //   EX: 300,
    // });

    res.status(200).json(responseData);
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

    // await deleteByPattern("admin:doctors:page:*");
    // await redisClient.del("admin:dashboard");

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

    // await deleteByPattern("admin:doctors:page:*");
    // await deleteByPattern("admin:appointments:page:*");
    // await deleteByPattern("admin:patients:page:*");

    // await redisClient.del("admin:dashboard");

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
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const cacheKey = `admin:patients:page:${page}:limit:${limit}`;

    // const cachedData = await redisClient.get(cacheKey);

    // if (cachedData) {
    //   return res.status(200).json({
    //     ...JSON.parse(cachedData),
    //     source: "redis",
    //   });
    // }

    const totalPatients = await Patient.countDocuments({
      isDeleted: false,
    });

    const patients = await Patient.find({ isDeleted: false })
      .skip(skip)
      .limit(Number(limit))
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

    const responseData = {
      success: true,
      data: formattedPatients,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPatients / Number(limit)),
      total: totalPatients,
    };

    // await redisClient.set(cacheKey, JSON.stringify(responseData), {
    //   EX: 300,
    // });

    res.status(200).json(responseData);
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

    await Review.updateMany({ patientId: patient._id }, { isDeleted: true });

    await Prescription.updateMany(
      { patientId: patient._id },
      { isDeleted: true },
    );

    // await deleteByPattern("admin:patients:page:*");
    // await deleteByPattern("admin:appointments:page:*");

    // await redisClient.del("admin:dashboard");

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
    let { status, page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const cacheKey = `admin:appointments:page:${page}:limit:${limit}:status:${status}`;

    // const cachedData = await redisClient.get(cacheKey);

    // if (cachedData) {
    //   return res.status(200).json({
    //     ...JSON.parse(cachedData),
    //     source: "redis",
    //   });
    // }

    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    const [appointments, totalAppointments] = await Promise.all([
      Appointment.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ appointmentDate: -1, timeSlot: 1 })
        .select(
          "appointmentDate timeSlot status adminCommission prescriptionAdded patientId doctorId",
        )
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
        .lean(),

      Appointment.countDocuments(filter),
    ]);

    const formattedAppointments = appointments.map((appt) => ({
      appointmentId: appt._id,
      patientName: appt.patientId?.userId?.name,
      doctorName: appt.doctorId?.userId?.name,
      appointmentDate: appt.appointmentDate,
      timeSlot: appt.timeSlot,
      status: appt.status,
      adminCommission: appt.adminCommission,
      prescriptionAdded: appt.prescriptionAdded,
    }));

    const responseData = {
      success: true,
      total: totalAppointments,
      data: formattedAppointments,
      currentPage: Number(page),
      totalPages: Math.ceil(totalAppointments / limit),
    };

    // await redisClient.set(cacheKey, JSON.stringify(responseData), {
    //   EX: 300,
    // });

    res.status(200).json(responseData);
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

    const [totalDoctors, totalPatients, totalAppointments, commissionData] =
      await Promise.all([
        Doctor.countDocuments({ isDeleted: false }),
        Patient.countDocuments({ isDeleted: false }),
        Appointment.countDocuments({ isDeleted: false }),
        Appointment.aggregate([
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
        ]),
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
      "Commission %",
      "Total Appointment",
      "Total Patient",
      "Total Commission",
      "Total Earning",
      "Net Earning",
      "Approved",
      "Created At",
    ]);

    doctorSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

    const [doctors, doctorAppointments] = await Promise.all([
      Doctor.find({ isDeleted: false }).populate("userId").lean(),
      Appointment.find({ isDeleted: false }).lean(),
    ]);

    let index = 1;

    for (const doc of doctors) {
      const appointments = doctorAppointments.filter(
        (a) => a.doctorId.toString() === doc._id.toString(),
      );

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

      const netEarning = totalEarning - totalCommission;

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
        doc.aCommission + "%",
        appointments.length,
        uniquePatients.size,
        totalCommission,
        totalEarning,
        netEarning,
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

    const [patients, patientAppointments] = await Promise.all([
      Patient.find({ isDeleted: false }).populate("userId").lean(),
      Appointment.find({ isDeleted: false }).lean(),
    ]);

    index = 1;

    for (const patient of patients) {
      const appointments = patientAppointments.filter(
        (a) => a.patientId.toString() === patient._id.toString(),
      );

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
      "Commission %",
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
      const commissionPercent =
        a.consultationFee > 0
          ? ((a.adminCommission / a.consultationFee) * 100).toFixed(2)
          : 0;
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
        commissionPercent + "%",
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

    const prescriptionSheet = workbook.addWorksheet("Prescriptions");

    prescriptionSheet.addRow([
      "No",
      "Appointment Date",
      "Appointment Time",
      "Doctor Name",
      "Doctor Email",
      "Patient Name",
      "Patient Email",
      "Medicines",
      "Additional Notes",
      "Created At",
    ]);

    prescriptionSheet
      .getRow(1)
      .eachCell((cell) => Object.assign(cell, headerStyle));

    const prescriptions = await Prescription.find({ isDeleted: false })
      .populate({
        path: "doctorId",
        populate: { path: "userId" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId" },
      })
      .populate("appointmentId");

    let pIndex = 1;

    for (const p of prescriptions) {
      const medicines = p.medicines
        ?.map((m) => `${m.medicineName} (${m.dosage})`)
        .join(", ");

      const row = prescriptionSheet.addRow([
        pIndex++,
        p.appointmentId?.appointmentDate,
        p.appointmentId?.timeSlot,
        p.doctorId?.userId?.name,
        p.doctorId?.userId?.email,
        p.patientId?.userId?.name,
        p.patientId?.userId?.email,
        medicines,
        p.additionalNotes,
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

export const getPendingReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const filter = { isApprove: false, isDeleted: false };

    const skip = (page - 1) * limit;

    const totalReviews = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
      currentPage: Number(page),
      totalPages: Math.ceil(totalReviews / limit),
      total: totalReviews,
    });
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review || review.isDeleted) {
      res.status(404);
      throw new Error("Review not found");
    }

    review.isApprove = true;
    await review.save();

    const doctorId = review.doctorId;

    const ratingData = await Review.aggregate([
      {
        $match: {
          doctorId: doctorId,
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

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      reviewId,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review || review.isDeleted) {
      res.status(404);
      throw new Error("Review not found");
    }

    review.isDeleted = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      reviewId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorCommission = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { commission } = req.body;

    if (commission === undefined) {
      res.status(400);
      throw new Error("Commission is required");
    }

    const percent = Number(commission);

    if (percent < 5 || percent > 35) {
      res.status(400);
      throw new Error("Commission must be between 5% and 35%");
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    if (doctor.aCommission !== percent) {
      doctor.aCommission = percent;

      doctor.commissionHistory.push({
        commission: percent,
        changedAt: new Date(),
      });

      await doctor.save();
    }
    // await deleteByPattern("admin:doctors:page:*");
    // await redisClient.del("admin:dashboard");

    res.status(200).json({
      success: true,
      message: "Doctor commission updated successfully",
      doctorId,
      commission: percent,
    });
  } catch (error) {
    next(error);
  }
};

export const exportAdminDataToPDF = async (req, res, next) => {
  try {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=admin-data.pdf");

    doc.pipe(res);

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-IN");
    };

    let isFirstTable = true;

    const drawTable = (title, headers, rows) => {
      if (!isFirstTable) doc.addPage();
      isFirstTable = false;

      doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
      doc.moveDown();

      const pageWidth = doc.page.width - 80;
      const columnWidth = pageWidth / headers.length;

      const drawRow = (row, y, isHeader = false) => {
        let x = 40;

        const heights = row.map((cell) =>
          doc.heightOfString(String(cell ?? ""), {
            width: columnWidth - 10,
          }),
        );

        const rowHeight = Math.max(...heights) + 10;

        row.forEach((cell) => {
          doc.rect(x, y, columnWidth, rowHeight).stroke();

          doc
            .fontSize(isHeader ? 10 : 9)
            .font(isHeader ? "Helvetica-Bold" : "Helvetica")
            .text(String(cell ?? ""), x + 5, y + 5, {
              width: columnWidth - 10,
            });

          x += columnWidth;
        });

        return rowHeight;
      };

      let y = doc.y;

      const headerHeight = drawRow(headers, y, true);
      y += headerHeight;

      rows.forEach((row) => {
        const heights = row.map((cell) =>
          doc.heightOfString(String(cell ?? ""), {
            width: columnWidth - 10,
          }),
        );

        const rowHeight = Math.max(...heights) + 10;

        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 40;
          y += drawRow(headers, y, true);
        }

        const h = drawRow(row, y);
        y += h;
      });
    };

    /* ================= DASHBOARD SUMMARY ================= */

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

    drawTable(
      "Dashboard Summary",
      ["Total Doctors", "Total Patients", "Appointments", "Admin Commission"],
      [[totalDoctors, totalPatients, totalAppointments, totalCommission]],
    );

    /* ================= DOCTORS ================= */

    const doctors = await Doctor.find({ isDeleted: false }).populate("userId");

    let index = 1;
    const doctorRows = [];

    for (const d of doctors) {
      const appointments = await Appointment.find({
        doctorId: d._id,
        isDeleted: false,
      });

      const completed = appointments.filter((a) =>
        ["confirmed", "completed"].includes(a.status),
      );

      const totalEarning = completed.reduce(
        (sum, a) => sum + a.consultationFee,
        0,
      );

      const totalCommission = completed.reduce(
        (sum, a) => sum + a.adminCommission,
        0,
      );

      const netEarning = totalEarning - totalCommission;

      const uniquePatients = new Set(
        appointments.map((a) => a.patientId.toString()),
      );

      doctorRows.push([
        index++,
        d.userId?.name,
        d.userId?.email,
        d.userId?.phone,
        d.specialization,
        d.experience,
        d.consultationFee,
        d.aCommission + "%",
        appointments.length,
        uniquePatients.size,
        totalCommission,
        totalEarning,
        netEarning,
        d.isApproved ? "Yes" : "No",
        formatDate(d.createdAt),
      ]);
    }

    drawTable(
      "Doctors",
      [
        "No",
        "Name",
        "Email",
        "Phone",
        "Specialization",
        "Experience",
        "Fee",
        "Commission %",
        "Appointments",
        "Patients",
        "Admin Commission",
        "Total Earning",
        "Net Earning",
        "Approved",
        "Created",
      ],
      doctorRows,
    );

    /* ================= PATIENTS ================= */

    const patients = await Patient.find({ isDeleted: false }).populate(
      "userId",
    );

    index = 1;
    const patientRows = [];

    for (const p of patients) {
      const appointments = await Appointment.find({
        patientId: p._id,
        isDeleted: false,
      });

      const completed = appointments.filter((a) =>
        ["confirmed", "completed"].includes(a.status),
      );

      const totalPay = completed.reduce((sum, a) => sum + a.consultationFee, 0);

      patientRows.push([
        index++,
        p.userId?.name,
        p.userId?.email,
        p.gender,
        formatDate(p.dateOfBirth),
        appointments.length,
        totalPay,
        formatDate(p.createdAt),
      ]);
    }

    drawTable(
      "Patients",
      [
        "No",
        "Name",
        "Email",
        "Gender",
        "DOB",
        "Appointments",
        "Total Pay",
        "Created",
      ],
      patientRows,
    );

    /* ================= APPOINTMENTS ================= */

    const appointments = await Appointment.find({ isDeleted: false })
      .populate({ path: "doctorId", populate: { path: "userId" } })
      .populate({ path: "patientId", populate: { path: "userId" } });

    index = 1;
    const appointmentRows = [];

    for (const a of appointments) {
      const commissionPercent =
        a.consultationFee > 0
          ? ((a.adminCommission / a.consultationFee) * 100).toFixed(2)
          : 0;

      appointmentRows.push([
        index++,
        a.doctorId?.userId?.name,
        a.doctorId?.userId?.email,
        a.patientId?.userId?.name,
        a.patientId?.userId?.email,
        formatDate(a.appointmentDate),
        a.timeSlot,
        a.status,
        a.notes,
        a.consultationFee,
        commissionPercent + "%",
        a.adminCommission,
      ]);
    }

    drawTable(
      "Appointments",
      [
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
        "Commission %",
        "Commission",
      ],
      appointmentRows,
    );

    /* ================= PAYMENTS ================= */

    const payments = await Payment.find()
      .populate({ path: "doctorId", populate: { path: "userId" } })
      .populate({ path: "patientId", populate: { path: "userId" } });

    index = 1;
    const paymentRows = [];

    for (const p of payments) {
      paymentRows.push([
        index++,
        p.appointmentId,
        p.doctorId?.userId?.name,
        p.doctorId?.userId?.email,
        p.patientId?.userId?.name,
        p.patientId?.userId?.email,
        p.amount,
        p.paymentMethod,
        p.status,
        formatDate(p.createdAt),
      ]);
    }

    drawTable(
      "Payments",
      [
        "No",
        "Appointment ID",
        "Doctor Name",
        "Doctor Email",
        "Patient Name",
        "Patient Email",
        "Amount",
        "Method",
        "Status",
        "Created",
      ],
      paymentRows,
    );

    doc.end();
  } catch (error) {
    next(error);
  }
};

// its For Generate PDF Or Excel

export const exportDoctorsPDF = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isDeleted: false })
      .populate({
        path: "userId",
        select: "name email phone isActive",
      })
      .select("specialization experience aCommission");

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

    const headers = [
      "No",
      "Name",
      "Email",
      "Phone",
      "IsActive",
      "Specialization",
      "Experience",
      "Admin Commission",
    ];

    const rows = doctors.map((doc, index) => [
      index + 1,
      doc.userId?.name,
      doc.userId?.email,
      doc.userId?.phone,
      doc.userId?.isActive ? "Yes" : "No",
      doc.specialization,
      doc.experience,
      doc.aCommission + "%",
    ]);

    generatePDFReport(res, "Doctors Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportDoctorsExcel = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isDeleted: false })
      .populate({
        path: "userId",
        select: "name email phone isActive",
      })
      .select("specialization experience aCommission");

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

    const headers = [
      "No",
      "Name",
      "Email",
      "Phone",
      "IsActive",
      "Specialization",
      "Experience",
      "Admin Commission",
    ];

    const rows = doctors.map((doc, index) => [
      index + 1,
      doc.userId?.name,
      doc.userId?.email,
      doc.userId?.phone,
      doc.userId?.isActive ? "Yes" : "No",
      doc.specialization,
      doc.experience,
      doc.aCommission + "%",
    ]);

    generateExcelReport(res, "Doctors Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportPatientsPDF = async (req, res, next) => {
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
    bookingCounts.forEach((item) => {
      bookingMap[item._id.toString()] = item.totalBookings;
    });

    const headers = ["No", "Name", "Email", "Total Bookings"];
    const rows = patients.map((p, index) => [
      index + 1,
      p.userId?.name,
      p.userId?.email,
      bookingMap[p._id.toString()] || 0,
    ]);

    generatePDFReport(res, "Patients Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportPatientsExcel = async (req, res, next) => {
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
    bookingCounts.forEach((item) => {
      bookingMap[item._id.toString()] = item.totalBookings;
    });

    const headers = ["No", "Name", "Email", "Total Bookings"];
    const rows = patients.map((p, index) => [
      index + 1,
      p.userId?.name,
      p.userId?.email,
      bookingMap[p._id.toString()] || 0,
    ]);

    generateExcelReport(res, "Patients Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportAppointmentsPDF = async (req, res, next) => {
  try {
    let { status } = req.query;

    const filter = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1, timeSlot: 1 })
      .select(
        "appointmentDate timeSlot status adminCommission prescriptionAdded patientId doctorId notes consultationFee",
      )
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .lean();

    const headers = [
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
      "Commission %",
      "Commission",
    ];
    const rows = appointments.map((a, index) => {
      const commissionPercent =
        a.consultationFee > 0
          ? ((a.adminCommission / a.consultationFee) * 100).toFixed(2)
          : 0;
      return [
        index + 1,
        a.doctorId?.userId?.name,
        a.doctorId?.userId?.email,
        a.patientId?.userId?.name,
        a.patientId?.userId?.email,
        new Date(a.appointmentDate).toLocaleDateString("en-IN"),
        a.timeSlot,
        a.status,
        a.notes,
        a.consultationFee,
        commissionPercent + "%",
        a.adminCommission,
      ];
    });

    generatePDFReport(res, "Appointments Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportAppointmentsExcel = async (req, res, next) => {
  try {
    let { status } = req.query;

    const filter = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1, timeSlot: 1 })
      .select(
        "appointmentDate timeSlot status adminCommission prescriptionAdded patientId doctorId notes consultationFee",
      )
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .lean();

    const headers = [
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
      "Commission %",
      "Commission",
    ];
    const rows = appointments.map((a, index) => {
      const commissionPercent =
        a.consultationFee > 0
          ? ((a.adminCommission / a.consultationFee) * 100).toFixed(2)
          : 0;
      return [
        index + 1,
        a.doctorId?.userId?.name,
        a.doctorId?.userId?.email,
        a.patientId?.userId?.name,
        a.patientId?.userId?.email,
        new Date(a.appointmentDate).toLocaleDateString("en-IN"),
        a.timeSlot,
        a.status,
        a.notes,
        a.consultationFee,
        commissionPercent + "%",
        a.adminCommission,
      ];
    });
    generateExcelReport(res, "Appointments Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportReviewsPDF = async (req, res, next) => {
  try {
    const filter = { isApprove: false, isDeleted: false };

    const reviews = await Review.find(filter)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    const headers = [
      "No",
      "Patient Name",
      "Doctor Name",
      "Rating",
      "Comment",
      "aiReason",
      "Created At",
    ];
    const rows = reviews.map((r, index) => [
      index + 1,
      r.patientId?.userId?.name,
      r.doctorId?.userId?.name,
      r.rating,
      r.comment,
      r.aiReason,
      new Date(r.createdAt).toLocaleDateString("en-IN"),
    ]);
    generatePDFReport(res, "Reviews Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportReviewsExcel = async (req, res, next) => {
  try {
    const filter = { isApprove: false, isDeleted: false };
    const totalReviews = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    const headers = [
      "No",
      "Patient Name",
      "Doctor Name",
      "Rating",
      "Comment",
      "aiReason",
      "Created At",
    ];
    const rows = reviews.map((r, index) => [
      index + 1,
      r.patientId?.userId?.name,
      r.doctorId?.userId?.name,
      r.rating,
      r.comment,
      r.aiReason,
      new Date(r.createdAt).toLocaleDateString("en-IN"),
    ]);
    generateExcelReport(res, "Reviews Report", headers, rows);
  } catch (error) {
    next(error);
  }
};
