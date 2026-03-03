import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import ExcelJS from "exceljs";

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

    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: "success",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            method: "$paymentMethod",
          },
          total: { $sum: "$amount" },
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

      const fee = appointment.consultationFee;
      let commissionPercent = 0;

      if (fee < 500) {
        commissionPercent = 20;
      } else if (fee < 1000) {
        commissionPercent = 15;
      } else if (fee < 2000) {
        commissionPercent = 10;
      } else {
        commissionPercent = 5;
      }

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
        "_id patientId appointmentDate timeSlot status paymentStatus paymentMethod consultationFee adminCommission notes",
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
        new Date(slot.date).toDateString() !== selectedDate.toDateString()
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
