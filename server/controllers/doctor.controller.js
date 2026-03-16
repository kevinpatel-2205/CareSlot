import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import ExcelJS from "exceljs";
import Review from "../models/review.model.js";
import Prescription from "../models/prescription.model.js";
import PDFDocument from "pdfkit";
import { generatePDFReport } from "../utils/generatePDFReport .js";
import { generateExcelReport } from "../utils/generateExcelReport.js";

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

    // TOTAL ADMIN COMMISSION
    const commissionData = await Appointment.aggregate([
      {
        $match: {
          doctorId,
          isDeleted: false,
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$adminCommission" },
        },
      },
    ]);

    const totalAdminCommission =
      commissionData.length > 0 ? commissionData[0].totalCommission : 0;

    // DOCTOR TOTAL EARNINGS (AFTER COMMISSION)
    const earningsData = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: "success",
        },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $unwind: "$appointment",
      },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $subtract: ["$amount", "$appointment.adminCommission"],
            },
          },
        },
      },
    ]);

    const totalEarnings =
      earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    // MONTHLY EARNINGS (AFTER COMMISSION)
    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: "success",
        },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $unwind: "$appointment",
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            method: "$paymentMethod",
          },
          total: {
            $sum: {
              $subtract: ["$amount", "$appointment.adminCommission"],
            },
          },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const monthNames = [
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

    const monthlyData = Array(12)
      .fill()
      .map(() => ({
        cash: 0,
        razorpay: 0,
      }));

    monthlyEarnings.forEach((item) => {
      const monthIndex = item._id.month - 1;
      const method = item._id.method;

      if (method === "cash") {
        monthlyData[monthIndex].cash = item.total;
      }

      if (method === "razorpay") {
        monthlyData[monthIndex].razorpay = item.total;
      }
    });

    const formattedMonthly = {
      labels: monthNames,
      cash: monthlyData.map((m) => m.cash),
      razorpay: monthlyData.map((m) => m.razorpay),
    };

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        appointmentCounts: formattedStatus,
        monthlyEarnings: formattedMonthly,
        totalAdminCommission,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).select("_id");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

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
      .sort({ appointmentDate: 1, timeSlot: 1 })
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

    const { status, page = 1, limit = 5 } = req.query;

    const filter = {
      doctorId,
      isDeleted: false,
    };
    const skip = (page - 1) * limit;
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .select(
        "appointmentDate timeSlot paymentMethod patientId status prescriptionAdded",
      )
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
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

      const fee = appointment.consultationFee;
      let commissionPercent = doctor.aCommission;

      appointment.adminCommission = (fee * commissionPercent) / 100;
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
      appointmentId,
      appointmentStatus: appointment.status,
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
      appointmentId,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

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

      { $skip: skip },

      { $limit: parseInt(limit) },
    ]);

    const totalPatients = await Appointment.aggregate([
      {
        $match: {
          doctorId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$patientId",
        },
      },
    ]);

    const totalPages = Math.ceil(totalPatients.length / limit);

    res.status(200).json({
      success: true,
      data: patients,
      currentPage: Number(page),
      totalPages,
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
        "_id patientId appointmentDate timeSlot status paymentStatus paymentMethod consultationFee prescriptionAdded adminCommission notes ",
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
    const { page = 1, limit = 5 } = req.query;

    const doctor = await Doctor.findOne({
      userId: req.user._id,
      isDeleted: false,
    }).select("availableSlots");

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    let slots = doctor.availableSlots || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validSlots = slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);

      return slotDate >= today;
    });

    if (validSlots.length !== slots.length) {
      doctor.availableSlots = validSlots;
      await doctor.save();
    }

    slots = validSlots;

    const start = (page - 1) * limit;
    const end = start + Number(limit);

    const paginatedSlots = slots.slice(start, end);

    res.status(200).json({
      success: true,
      data: paginatedSlots,
      currentPage: Number(page),
      totalPages: Math.ceil(slots.length / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const addAvailableSlots = async (req, res, next) => {
  try {
    const { date, times } = req.body;

    if (!date || !times || !Array.isArray(times) || times.length === 0) {
      res.status(400);
      throw new Error("Date and times are required");
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      res.status(400);
      throw new Error("Invalid date format");
    }

    if (selectedDate <= today) {
      res.status(400);
      throw new Error("Date must be greater than today");
    }

    const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

    const invalidTime = times.find((time) => !timeRegex.test(time.trim()));

    if (invalidTime) {
      res.status(400);
      throw new Error(
        "Time must be in proper format like 09:10 AM or 10:30 PM",
      );
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
        new Date(slot.date).toDateString() === selectedDate.toDateString(),
    );

    if (existingSlot) {
      const uniqueTimes = times.filter(
        (time) => !existingSlot.times.includes(time),
      );

      existingSlot.times.push(...uniqueTimes);
    } else {
      doctor.availableSlots.push({
        date: selectedDate,
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

export const addBulkAvailableSlots = async (req, res, next) => {
  try {
    let { startDate, endDate, startTime, endTime, interval } = req.body;

    if (!startDate || !endDate || !interval) {
      res.status(400);
      throw new Error("Start date, end date and interval are required");
    }

    // Default Times
    startTime = startTime || "10:00 AM";
    endTime = endTime || "05:00 PM";

    const start = new Date(startDate);
    const end = new Date(endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today || end < today) {
      res.status(400);
      throw new Error("Dates cannot be less than today");
    }

    if (end < start) {
      res.status(400);
      throw new Error("End date must be greater than start date");
    }

    // 1 Month limit
    const maxEnd = new Date(start);
    maxEnd.setMonth(maxEnd.getMonth() + 1);

    if (end > maxEnd) {
      res.status(400);
      throw new Error("Doctor cannot create slots for more than 1 month");
    }

    const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      res.status(400);
      throw new Error("Time must be in format like 09:00 AM");
    }

    if (interval <= 0) {
      res.status(400);
      throw new Error("Interval must be greater than 0");
    }

    const convertTo24 = (time) => {
      let [timePart, period] = time.split(" ");
      let [hour, min] = timePart.split(":").map(Number);

      if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

      return hour * 60 + min;
    };

    const convertTo12 = (minutes) => {
      let h = Math.floor(minutes / 60);
      let m = minutes % 60;

      const period = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;

      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
    };

    const startMinutes = convertTo24(startTime);
    const endMinutes = convertTo24(endTime);

    const doctor = await Doctor.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const generatedTimes = [];

    for (let t = startMinutes; t < endMinutes; t += interval) {
      generatedTimes.push(convertTo12(t));
    }

    let current = new Date(start);

    while (current <= end) {
      const dateString = current.toDateString();

      const existingSlot = doctor.availableSlots.find(
        (slot) => new Date(slot.date).toDateString() === dateString,
      );

      if (existingSlot) {
        const uniqueTimes = generatedTimes.filter(
          (time) => !existingSlot.times.includes(time),
        );

        existingSlot.times.push(...uniqueTimes);
      } else {
        doctor.availableSlots.push({
          date: new Date(current),
          times: generatedTimes,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Bulk slots created successfully",
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
    }).select(
      "specialization experience about consultationFee isApproved aCommission commissionHistory",
    );

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
        aCommission: doctor.aCommission,
        commissionHistory: doctor.commissionHistory || [],
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

    const user = await User.findOne({
      _id: req.user._id,
      isDeleted: false,
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        res.status(400);
        throw new Error("Name cannot be empty");
      }
      if (trimmedName.length < 2 || trimmedName.length > 20) {
        res.status(400);
        throw new Error("Name must be between 2 and 20 characters");
      }
      user.name = trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim();

      if (!trimmedPhone) {
        res.status(400);
        throw new Error("Phone cannot be empty");
      }

      const phoneRegex = /^[0-9]+$/;

      if (!phoneRegex.test(trimmedPhone)) {
        res.status(400);
        throw new Error("Phone number must contain only digits");
      }

      if (trimmedPhone.length !== 10) {
        res.status(400);
        throw new Error("Phone number must be exactly 10 digits");
      }

      user.phone = trimmedPhone;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
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

    // =========================
    // DOCTOR VALIDATIONS
    // =========================

    if (specialization !== undefined) {
      const trimmedSpecialization = specialization.trim();
      if (!trimmedSpecialization) {
        res.status(400);
        throw new Error("Specialization cannot be empty");
      }
      doctor.specialization = trimmedSpecialization;
    }

    if (experience !== undefined) {
      if (experience < 1 || experience > 50) {
        res.status(400);
        throw new Error("Experience must be between 1 and 50 years");
      }
      doctor.experience = experience;
    }

    if (about !== undefined) {
      const trimmedAbout = about.trim();
      if (!trimmedAbout) {
        res.status(400);
        throw new Error("About section cannot be empty");
      }
      doctor.about = trimmedAbout;
    }

    if (consultationFee !== undefined) {
      if (consultationFee <= 100 || consultationFee >= 2000) {
        res.status(400);
        throw new Error(
          "Consultation fee must be greater than 100 and less than 2000",
        );
      }
      doctor.consultationFee = consultationFee;
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvailableSlot = async (req, res, next) => {
  try {
    const { date } = req.params;

    if (!date) {
      res.status(400);
      throw new Error("Date is required");
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      res.status(400);
      throw new Error("Invalid date format");
    }

    const doctor = await Doctor.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    doctor.availableSlots = doctor.availableSlots.filter(
      (slot) =>
        new Date(slot.date).toDateString() !== selectedDate.toDateString(),
    );

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
      data: doctor.availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

export const exportDoctorExcel = async (req, res, next) => {
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

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const doctorId = doctor._id;

    const appointmentSheet = workbook.addWorksheet("Appointments");

    appointmentSheet.addRow([
      "No",
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

    const appointments = await Appointment.find({
      doctorId,
      isDeleted: false,
    })
      .populate({
        path: "patientId",
        populate: { path: "userId" },
      })
      .lean();

    let index = 1;

    for (const a of appointments) {
      const row = appointmentSheet.addRow([
        index++,
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

    const patientSheet = workbook.addWorksheet("Patients");

    patientSheet.addRow([
      "No",
      "Name",
      "Email",
      "Gender",
      "DOB",
      "Total Appointment",
      "Total Pay",
      "Address",
      "Medical History",
      "Created At",
    ]);

    patientSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

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
          gender: "$patient.gender",
          dateOfBirth: "$patient.dateOfBirth",
          address: "$patient.address",
          medicalHistory: "$patient.medicalHistory",
        },
      },
    ]);

    index = 1;

    for (const p of patients) {
      const payments = await Payment.aggregate([
        {
          $match: {
            patientId: p.patientId,
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            totalPay: { $sum: "$amount" },
          },
        },
      ]);

      const totalPay = payments.length > 0 ? payments[0].totalPay : 0;

      const row = patientSheet.addRow([
        index++,
        p.name,
        p.email,
        p.gender,
        p.dateOfBirth,
        p.totalAppointments,
        totalPay,
        p.address,
        p.medicalHistory,
        doctor.createdAt,
      ]);

      row.eachCell((cell) => Object.assign(cell, dataBorder));
    }

    const commissionSheet = workbook.addWorksheet("Commission History");

    commissionSheet.addRow([
      "No",
      "Commission %",
      "Start Date",
      "End Date",
      "Appointments",
      "Total Fee",
      "Total Commission",
    ]);

    commissionSheet
      .getRow(1)
      .eachCell((cell) => Object.assign(cell, headerStyle));

    const history = doctor.commissionHistory || [];

    let commissionIndex = 1;

    for (let i = 0; i < history.length; i++) {
      const startDate = history[i].changedAt;

      const endDate = i + 1 < history.length ? history[i + 1].changedAt : null;

      const commissionPercent = history[i].commission;

      const matchStage = {
        doctorId,
        isDeleted: false,
        status: { $in: ["confirmed", "completed"] },
        createdAt: {
          $gte: startDate,
        },
      };

      if (endDate) {
        matchStage.createdAt.$lt = endDate;
      }

      const appointments = await Appointment.find(matchStage);

      let totalFee = 0;
      let totalCommission = 0;

      for (const a of appointments) {
        totalFee += a.consultationFee;

        const commissionAmount = (a.consultationFee * commissionPercent) / 100;

        totalCommission += commissionAmount;
      }

      const row = commissionSheet.addRow([
        commissionIndex++,
        commissionPercent + "%",
        startDate.toLocaleDateString("en-IN"),
        endDate ? endDate.toLocaleDateString("en-IN") : "Present",
        appointments.length,
        totalFee,
        totalCommission,
      ]);

      row.eachCell((cell) => Object.assign(cell, dataBorder));
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=doctor-data.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const getDoctorReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const reviews = await Review.find({
      doctorId: doctor._id,
      isApprove: true,
      isDeleted: false,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image email",
        },
      })
      .select("rating comment createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const formattedReviews = reviews.map((rev) => ({
      reviewId: rev._id,
      patientName: rev.patientId?.userId?.name,
      patientImage: rev.patientId?.userId?.image,
      patientEmail: rev.patientId?.userId?.email,
      rating: rev.rating,
      comment: rev.comment,
      createdAt: rev.createdAt,
    }));

    const totalReviewsCount = await Review.countDocuments({
      doctorId: doctor._id,
      isApprove: true,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      data: {
        totalReviews: doctor.totalReviews,
        averageRating: doctor.averageRating,
        reviews: formattedReviews,
      },
      currentPage: Number(page),
      totalPages: Math.ceil(totalReviewsCount / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const addPrescription = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const doctorId = doctor._id;
    const { appointmentId } = req.params;

    const { medicines, additionalNotes } = req.body;

    if (!medicines || medicines.length === 0) {
      res.status(400);
      throw new Error("At least one medicine is required");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
      isDeleted: false,
    });

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found");
    }

    if (appointment.status !== "completed") {
      res.status(400);
      throw new Error(
        "Prescription can only be added after appointment is completed",
      );
    }

    if (appointment.prescriptionAdded) {
      res.status(400);
      throw new Error("Prescription already added for this appointment");
    }

    const prescription = await Prescription.create({
      appointmentId: appointment._id,
      doctorId,
      patientId: appointment.patientId,
      medicines,
      additionalNotes,
    });

    appointment.prescriptionAdded = true;
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Prescription added successfully",
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const exportDoctorPDF = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const doctorId = doctor._id;

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=doctor-report.pdf",
    );

    doc.pipe(res);

    const pageWidth = 515;
    const startX = 40;
    const rowHeight = 22;
    const bottomMargin = 760;

    let y = 120;

    const checkPageBreak = () => {
      if (y > bottomMargin) {
        doc.addPage();
        y = 60;
      }
    };

    const drawRow = (row, columnWidths, isHeader = false) => {
      let x = startX;

      row.forEach((text, i) => {
        doc.rect(x, y, columnWidths[i], rowHeight).stroke();

        doc
          .font(isHeader ? "Helvetica-Bold" : "Helvetica")
          .fontSize(9)
          .text(String(text), x + 3, y + 6, {
            width: columnWidths[i] - 6,
            align: "center",
          });

        x += columnWidths[i];
      });

      y += rowHeight;
    };

    // HEADER
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Doctor Report", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Doctor Name: ${doctor.name || ""}`)
      .text(`Generated: ${new Date().toLocaleDateString("en-IN")}`);

    y = doc.y + 20;

    // ================================
    // APPOINTMENTS
    // ================================

    doc
      .moveTo(startX, y - 10)
      .lineTo(startX + pageWidth, y - 10)
      .stroke();

    doc.fontSize(14).font("Helvetica-Bold").text("Appointments", startX, y);

    y += 20;

    const appointmentHeaders = [
      "No",
      "Patient",
      "Email",
      "Date",
      "Time",
      "Status",
      "Fee",
      "Commission",
    ];

    const appointmentWidths = [30, 80, 130, 70, 60, 70, 40, 60];

    drawRow(appointmentHeaders, appointmentWidths, true);

    const appointments = await Appointment.find({
      doctorId,
      isDeleted: false,
    })
      .populate({
        path: "patientId",
        populate: { path: "userId" },
      })
      .lean();

    let index = 1;

    for (const a of appointments) {
      checkPageBreak();

      const row = [
        index++,
        a.patientId?.userId?.name || "",
        a.patientId?.userId?.email || "",
        new Date(a.appointmentDate).toLocaleDateString("en-IN"),
        a.timeSlot,
        a.status,
        a.consultationFee,
        a.adminCommission,
      ];

      drawRow(row, appointmentWidths);
    }

    y += 30;
    checkPageBreak();

    // ================================
    // PATIENTS
    // ================================

    doc.fontSize(14).font("Helvetica-Bold").text("Patients", startX, y);

    y += 20;

    const patientHeaders = [
      "No",
      "Name",
      "Email",
      "Gender",
      "DOB",
      "Appointments",
      "Total Pay",
    ];

    const patientWidths = [30, 90, 140, 60, 70, 60, 65];

    drawRow(patientHeaders, patientWidths, true);

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
          gender: "$patient.gender",
          dateOfBirth: "$patient.dateOfBirth",
        },
      },
    ]);

    index = 1;

    for (const p of patients) {
      checkPageBreak();

      const payments = await Payment.aggregate([
        {
          $match: {
            patientId: p.patientId,
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            totalPay: { $sum: "$amount" },
          },
        },
      ]);

      const totalPay = payments.length ? payments[0].totalPay : 0;

      const row = [
        index++,
        p.name,
        p.email,
        p.gender,
        p.dateOfBirth
          ? new Date(p.dateOfBirth).toLocaleDateString("en-IN")
          : "",
        p.totalAppointments,
        totalPay,
      ];

      drawRow(row, patientWidths);
    }

    y += 30;
    checkPageBreak();

    // ================================
    // COMMISSION HISTORY
    // ================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Commission History", startX, y);

    y += 20;

    const commissionHeaders = [
      "No",
      "Commission %",
      "Start Date",
      "End Date",
      "Appointments",
      "Total Fee",
      "Total Commission",
    ];

    const commissionWidths = [30, 80, 90, 90, 80, 70, 75];

    drawRow(commissionHeaders, commissionWidths, true);

    const history = doctor.commissionHistory || [];

    let cIndex = 1;

    for (let i = 0; i < history.length; i++) {
      checkPageBreak();

      const startDate = history[i].changedAt;
      const endDate = i + 1 < history.length ? history[i + 1].changedAt : null;

      const commissionPercent = history[i].commission;

      const matchStage = {
        doctorId,
        isDeleted: false,
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate },
      };

      if (endDate) matchStage.createdAt.$lt = endDate;

      const apps = await Appointment.find(matchStage);

      let totalFee = 0;
      let totalCommission = 0;

      for (const a of apps) {
        totalFee += a.consultationFee;
        totalCommission += (a.consultationFee * commissionPercent) / 100;
      }

      const row = [
        cIndex++,
        commissionPercent + "%",
        startDate.toLocaleDateString("en-IN"),
        endDate ? endDate.toLocaleDateString("en-IN") : "Present",
        apps.length,
        totalFee,
        totalCommission,
      ];

      drawRow(row, commissionWidths);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

// its For Generate PDF Or Excel

export const exportAppointmentsPDF = async (req, res, next) => {
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

    const headers = [
      "No",
      "Patient Name",
      "Patient Email",
      "Date",
      "Time",
      "Status",
      "Payment",
    ];

    const rows = appointments.map((apt, i) => [
      i + 1,
      apt.patientId?.userId?.name || "",
      apt.patientId?.userId?.email || "",
      new Date(apt.appointmentDate).toLocaleDateString("en-IN"),
      apt.timeSlot,
      apt.status,
      apt.paymentMethod,
    ]);

    generatePDFReport(res, "Appointments Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportAppointmentsExcel = async (req, res, next) => {
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
      .select(
        "appointmentDate timeSlot paymentMethod consultationFee patientId status",
      )
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

    const headers = [
      "No",
      "Patient Name",
      "Patient Email",
      "Date",
      "Time",
      "Status",
      "Payment",
    ];

    const rows = appointments.map((apt, i) => [
      i + 1,
      apt.patientId?.userId?.name || "",
      apt.patientId?.userId?.email || "",
      new Date(apt.appointmentDate).toLocaleDateString("en-IN"),
      apt.timeSlot,
      apt.status,
      apt.paymentMethod,
    ]);

    await generateExcelReport(res, "Appointments Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportPatientsPDF = async (req, res, next) => {
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

    const headers = ["No", "Name", "Email", "Phone", "Total Appointments"];
    const rows = patients.map((p, i) => [
      i + 1,
      p.name,
      p.email,
      p.phone,
      p.totalAppointments,
    ]);
    generatePDFReport(res, "Patients Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportPatientsExcel = async (req, res, next) => {
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

    const headers = ["No", "Name", "Email", "Phone", "Total Appointments"];
    const rows = patients.map((p, i) => [
      i + 1,
      p.name,
      p.email,
      p.phone,
      p.totalAppointments,
    ]);
    await generateExcelReport(res, "Patients Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportReviewsPDF = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const reviews = await Review.find({
      doctorId: doctor._id,
      isApprove: true,
      isDeleted: false,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image email",
        },
      })
      .select("rating comment createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "No",
      "Patient Name",
      "Email",
      "Rating",
      "Comment",
      "Date",
    ];
    const rows = reviews.map((rev, i) => [
      i + 1,
      rev.patientId?.userId?.name || "",
      rev.patientId?.userId?.email || "",
      rev.rating,
      rev.comment,
      new Date(rev.createdAt).toLocaleDateString("en-IN"),
    ]);
    generatePDFReport(res, "Reviews Report", headers, rows);
  } catch (error) {
    next(error);
  }
};

export const exportReviewsExcel = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const reviews = await Review.find({
      doctorId: doctor._id,
      isApprove: true,
      isDeleted: false,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name image email",
        },
      })
      .select("rating comment createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "No",
      "Patient Name",
      "Email",
      "Rating",
      "Comment",
      "Date",
    ];
    const rows = reviews.map((rev, i) => [
      i + 1,
      rev.patientId?.userId?.name || "",
      rev.patientId?.userId?.email || "",
      rev.rating,
      rev.comment,
      new Date(rev.createdAt).toLocaleDateString("en-IN"),
    ]);
    generateExcelReport(res, "Reviews Report", headers, rows);
  } catch (error) {
    next(error);
  }
};
