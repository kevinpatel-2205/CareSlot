import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";

export const getPatientDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const patient = await Patient.findOne({
      userId,
      isDeleted: false,
    }).lean();

    if (!patient) {
      return res.status(200).json({
        success: true,
        data: {
          totalBookings: 0,
          upcomingBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0,
          upcomingAppointments: [],
        },
      });
    }

    const today = new Date();

    const totalBookings = await Appointment.countDocuments({
      patientId: patient._id,
      isDeleted: false,
    });

    const upcomingBookings = await Appointment.countDocuments({
      patientId: patient._id,
      appointmentDate: { $gte: today },
      status: { $in: ["pending", "confirmed"] },
      isDeleted: false,
    });

    const cancelledBookings = await Appointment.countDocuments({
      patientId: patient._id,
      status: "cancelled",
      isDeleted: false,
    });

    const completedBookings = await Appointment.countDocuments({
      patientId: patient._id,
      status: "completed",
      isDeleted: false,
    });

    const upcomingAppointments = await Appointment.find({
      patientId: patient._id,
      appointmentDate: { $gte: today },
      status: { $in: ["pending", "confirmed"] },
      isDeleted: false,
    })
      .sort({ appointmentDate: 1 })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .select("appointmentDate timeSlot status")
      .lean();

    const formattedAppointments = upcomingAppointments.map((apt) => ({
      doctorName: apt.doctorId?.userId?.name || null,
      doctorEmail: apt.doctorId?.userId?.email || null,
      appointmentDate: apt.appointmentDate,
      timeSlot: apt.timeSlot,
      status: apt.status,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcomingBookings,
        cancelledBookings,
        completedBookings,
        upcomingAppointments: formattedAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;

    const doctorFilter = {
      isDeleted: false,
    };

    if (specialization) {
      doctorFilter.specialization = {
        $regex: specialization,
        $options: "i",
      };
    }

    const doctors = await Doctor.find(doctorFilter)
      .populate({
        path: "userId",
        match: {
          role: "doctor",
          isDeleted: false,
          ...(search && {
            name: { $regex: search, $options: "i" },
          }),
        },
        select: "name email",
      })
      .lean();

    const filteredDoctors = doctors.filter((doc) => doc.userId !== null);

    const formattedDoctors = filteredDoctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId.name,
      email: doc.userId.email,
      specialization: doc.specialization,
      availabilityStatus:
        doc.availableSlots && doc.availableSlots.length > 0
          ? "Available"
          : "Unavailable",
    }));

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

