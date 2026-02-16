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

export const getDoctorDetails = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
      isApproved: true,
    })
      .populate({
        path: "userId",
        select: "name email",
      })
      .lean();

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    res.status(200).json({
      success: true,
      data: {
        doctorId: doctor._id,
        name: doctor.userId.name,
        email: doctor.userId.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        about: doctor.about,
        consultationFee: doctor.consultationFee,
        availableSlots: doctor.availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, paymentMethod, notes } =
      req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !paymentMethod) {
      res.status(400);
      throw new Error("All required fields must be provided");
    }

    const patient = await Patient.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient profile not found");
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isDeleted: false,
      isApproved: true,
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const slot = doctor.availableSlots.find(
      (s) =>
        new Date(s.date).toDateString() ===
        new Date(appointmentDate).toDateString(),
    );

    if (!slot || !slot.times.includes(timeSlot)) {
      res.status(400);
      throw new Error("Selected slot is not available");
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      appointmentDate,
      timeSlot,
      consultationFee: doctor.consultationFee,
      paymentMethod,
      notes,
      status: "pending",
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
    });

    slot.times = slot.times.filter((t) => t !== timeSlot);
    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

