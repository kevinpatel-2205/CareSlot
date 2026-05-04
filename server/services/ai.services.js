import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Review from "../models/review.model.js";
import Appointment from "../models/appointment.model.js";
import Prescription from "../models/prescription.model.js";

// For Guest
export const getGuestData = async () => {
  try {
    const doctors = await Doctor.find({ isDeleted: false })
      .select(
        "userId specialization experience about consultationFee averageRating totalReviews geolocation.address",
      )
      .populate({
        path: "userId",
        match: { isDeleted: false, isActive: true },
        select: "name email phone",
      })
      .lean();

    const filteredDoctors = doctors.filter((doc) => doc.userId !== null);

    return filteredDoctors;
  } catch (error) {
    throw new Error("Error fetching doctors: " + error.message);
  }
};

// For Patient

export const getPatientData = async (userId) => {
  const patient = await Patient.findOne({ userId, isDeleted: false })
    .select("userId dateOfBirth gender geolocation.address medicalHistory")
    .populate("userId", "name email phone ")
    .lean();

  if (!patient) throw new Error("Patient not found");

  const patientId = patient._id;

  const totalAppointments = await Appointment.countDocuments({
    patientId,
    isDeleted: false,
  });
  const pendingAppointments = await Appointment.countDocuments({
    patientId,
    status: "pending",
    isDeleted: false,
  });
  const completedAppointments = await Appointment.estimatedDocumentCount({
    patientId,
    status: "completed",
    isDeleted: false,
  });

  const upcomingAppointments = await Appointment.estimatedDocumentCount({
    patientId,
    appointmentDate: { $gte: new Date() },
    isDeleted: false,
    status: { $in: ["pending", "confirmed"] },
  });

  const reviews = await Review.find({ patientId })
    .select("rating comment createdAt doctorId")
    .populate({
      path: "doctorId",
      match: { isDeleted: false },
      select:
        "userId specialization experience about consultationFee averageRating totalReviews geolocation.address",
      populate: { path: "userId", select: "name email phone" },
    });

  return {
    patient,
    meta: {
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      upcomingAppointments,
    },
    reviews,
  };
};

export const getPatientAllDoctors = async () => {
  const doctors = await Doctor.find({ isDeleted: false })
    .select(
      "userId specialization experience about consultationFee averageRating totalReviews geolocation.address",
    )
    .populate("userId", "name email phone")
    .lean();

  return doctors;
};

export const getPatientAppointments = async (userId) => {
  const patient = await Patient.findOne({ userId, isDeleted: false });
  if (!patient) throw new Error("Patient not found");

  const appointments = await Appointment.find({
    patientId: patient._id,
    isDeleted: false,
  })
    .select(
      "appointmentDate timeSlot status consultationFee prescriptionAdded paymentStatus paymentMethod notes doctorId",
    )
    .populate({
      path: "doctorId",
      match: { isDeleted: false },
      select:
        "userId specialization experience about consultationFee averageRating totalReviews geolocation.address",
      populate: {
        path: "userId",
        match: { isDeleted: false },
        select: "name email phone",
      },
    })
    .lean();

  for (let appt of appointments) {
    const prescription = await Prescription.findOne({
      appointmentId: appt._id,
    });

    appt.prescription = prescription;
  }

  return appointments;
};

export const getPatientNearDoctors = async (userId) => {
  const patient = await Patient.findOne({ userId, isDeleted: false });
  if (!patient) throw new Error("Patient not found");

  if (!patient.geolocation?.coordinates?.length) {
    throw new Error("Patient location not set");
  }

  const [longitude, latitude] = patient.geolocation.coordinates;

  const nearDoctors = await Doctor.find({
    isDeleted: false,
    isApproved: true,
    geolocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: 5000,
      },
    },
  })
    .select(
      "userId specialization experience about consultationFee averageRating totalReviews geolocation",
    )
    .populate("userId", "name email phone image");

  const formatedNearDoctors = nearDoctors.map((doc) => ({
    doctorId: doc._id,
    name: doc.userId.name,
    email: doc.userId.email,
    phone: doc.userId.phone,
    specialization: doc.specialization,
    experience: doc.experience,
    about: doc.about,
    consultationFee: doc.consultationFee,
    averageRating: doc.averageRating,
    totalReviews: doc.totalReviews,
    address: doc.geolocation.address,
  }));

  return formatedNearDoctors;
};

// For Doctor

export const getDoctorData = async (userId) => {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);

    const result = await Doctor.aggregate([
      // Match Doctor by userId
      {
        $match: {
          userId: objectId,
          isDeleted: false,
        },
      },

      // Join User (doctor's own user info)
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
                isDeleted: false,
                isActive: true,
              },
            },
          ],
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },

      // Join Appointments
      {
        $lookup: {
          from: "appointments",
          let: { doctorId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$doctorId", "$$doctorId"] },
                isDeleted: false,
              },
            },

            // Join Patient
            {
              $lookup: {
                from: "patients",
                let: { patientId: "$patientId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$patientId"] },
                      isDeleted: false,
                    },
                  },
                ],
                as: "patientInfo",
              },
            },
            {
              $unwind: {
                path: "$patientInfo",
                preserveNullAndEmptyArrays: true,
              },
            },

            // Join Patient's User
            {
              $lookup: {
                from: "users",
                let: { userId: "$patientInfo.userId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$userId"] },
                      isDeleted: false,
                      isActive: true,
                    },
                  },
                ],
                as: "patientUserInfo",
              },
            },
            {
              $unwind: {
                path: "$patientUserInfo",
                preserveNullAndEmptyArrays: true,
              },
            },

            // Join Prescription
            {
              $lookup: {
                from: "prescriptions",
                let: { appointmentId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$appointmentId", "$$appointmentId"] },
                      isDeleted: false,
                    },
                  },
                ],
                as: "prescription",
              },
            },
            {
              $unwind: {
                path: "$prescription",
                preserveNullAndEmptyArrays: true,
              },
            },

            // Join Payment (no isDeleted on Payment model)
            {
              $lookup: {
                from: "payments",
                localField: "_id",
                foreignField: "appointmentId",
                as: "payment",
              },
            },
            {
              $unwind: {
                path: "$payment",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                _id: 1,
                appointmentDate: 1,
                timeSlot: 1,
                status: 1,
                consultationFee: 1,
                adminCommission: 1,
                paymentStatus: 1,
                paymentMethod: 1,
                notes: 1,
                prescriptionAdded: 1,
                createdAt: 1,

                patient: {
                  patientId: "$patientInfo._id",
                  name: "$patientUserInfo.name",
                  email: "$patientUserInfo.email",
                  image: "$patientUserInfo.image",
                  phone: "$patientUserInfo.phone",
                  dateOfBirth: "$patientInfo.dateOfBirth",
                  gender: "$patientInfo.gender",
                  address: "$patientInfo.address",
                  medicalHistory: "$patientInfo.medicalHistory",
                },

                prescription: {
                  $cond: {
                    if: {
                      $gt: [{ $ifNull: ["$prescription._id", null] }, null],
                    },
                    then: {
                      prescriptionId: "$prescription._id",
                      medicines: "$prescription.medicines",
                      additionalNotes: "$prescription.additionalNotes",
                      createdAt: "$prescription.createdAt",
                    },
                    else: null,
                  },
                },

                payment: {
                  $cond: {
                    if: { $gt: [{ $ifNull: ["$payment._id", null] }, null] },
                    then: {
                      paymentId: "$payment._id",
                      amount: "$payment.amount",
                      paymentMethod: "$payment.paymentMethod",
                      status: "$payment.status",
                      razorpayOrderId: "$payment.razorpayOrderId",
                      razorpayPaymentId: "$payment.razorpayPaymentId",
                    },
                    else: null,
                  },
                },
              },
            },

            { $sort: { appointmentDate: -1 } },
          ],
          as: "appointments",
        },
      },

      // Join Reviews received by this doctor
      {
        $lookup: {
          from: "reviews",
          let: { doctorId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$doctorId", "$$doctorId"] },
                isDeleted: false,
              },
            },

            // Join Patient who gave the review
            {
              $lookup: {
                from: "patients",
                let: { patientId: "$patientId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$patientId"] },
                      isDeleted: false,
                    },
                  },
                ],
                as: "patientInfo",
              },
            },
            {
              $unwind: {
                path: "$patientInfo",
                preserveNullAndEmptyArrays: true,
              },
            },

            // Join Patient's User
            {
              $lookup: {
                from: "users",
                let: { userId: "$patientInfo.userId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$userId"] },
                      isDeleted: false,
                      isActive: true,
                    },
                  },
                ],
                as: "patientUserInfo",
              },
            },
            {
              $unwind: {
                path: "$patientUserInfo",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                _id: 1,
                rating: 1,
                comment: 1,
                isApprove: 1,
                aiReason: 1,
                createdAt: 1,
                patient: {
                  name: "$patientUserInfo.name",
                  image: "$patientUserInfo.image",
                  gender: "$patientInfo.gender",
                },
              },
            },

            { $sort: { createdAt: -1 } },
          ],
          as: "reviews",
        },
      },

      // Final shape
      {
        $project: {
          _id: 1,
          doctorId: "$_id",
          specialization: 1,
          experience: 1,
          about: 1,
          consultationFee: 1,
          availableSlots: {
            $map: {
              input: "$availableSlots",
              as: "slot",
              in: {
                date: "$$slot.date",
              },
            },
          },
          isApproved: 1,
          averageRating: 1,
          totalReviews: 1,
          aCommission: 1,
          commissionHistory: 1,
          createdAt: 1,

          personalInfo: {
            userId: "$userInfo._id",
            name: "$userInfo.name",
            email: "$userInfo.email",
            phone: "$userInfo.phone",
            isActive: "$userInfo.isActive",
          },

          summary: {
            totalAppointments: { $size: "$appointments" },
            totalReviews: { $size: "$reviews" },

            completedAppointments: {
              $size: {
                $filter: {
                  input: "$appointments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "completed"] },
                },
              },
            },
            pendingAppointments: {
              $size: {
                $filter: {
                  input: "$appointments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "pending"] },
                },
              },
            },
            confirmedAppointments: {
              $size: {
                $filter: {
                  input: "$appointments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "confirmed"] },
                },
              },
            },
            cancelledAppointments: {
              $size: {
                $filter: {
                  input: "$appointments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "cancelled"] },
                },
              },
            },

            totalEarnings: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$appointments",
                      as: "a",
                      cond: { $eq: ["$$a.payment.status", "success"] },
                    },
                  },
                  as: "a",
                  in: "$$a.payment.amount",
                },
              },
            },

            totalCommissionPaid: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$appointments",
                      as: "a",
                      cond: { $eq: ["$$a.status", "completed"] },
                    },
                  },
                  as: "a",
                  in: "$$a.adminCommission",
                },
              },
            },
          },

          appointments: 1,
          reviews: 1,
        },
      },
    ]);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching doctor full data:", error);
    throw error;
  }
};

// For Admin

export const getAdminDoctorData = async () => {
  try {
    const doctors = await Doctor.find({ isDeleted: false })
      .select(
        "userId specialization experience about consultationFee averageRating totalReviews aCommission",
      )
      .populate({
        path: "userId",
        match: { isDeleted: false, isActive: true },
        select: "name email phone isActive",
      })
      .lean();
    return doctors;
  } catch (error) {
    throw new Error("Error fetching doctors: " + error.message);
  }
};

export const getAdminPatientData = async () => {
  try {
    const patients = await Patient.find({ isDeleted: false })
      .select("userId dateOfBirth gender address medicalHistory")
      .populate({
        path: "userId",
        match: { isDeleted: false, isActive: true },
        select: "name email phone isActive",
      })
      .lean();
    return patients;
  } catch (error) {
    throw new Error("Error fetching patients: " + error.message);
  }
};

export const getAdminAppointmentData = async () => {
  try {
    const appointments = await Appointment.find({ isDeleted: false })
      .sort({ appointmentDate: -1, timeSlot: 1 })
      .select(
        "appointmentDate timeSlot status adminCommission prescriptionAdded patientId doctorId",
      )
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .lean();
    return appointments;
  } catch (error) {
    throw new Error("Error fetching appointments: " + error.message);
  }
};

export const getAdminReviewData = async () => {
  try {
    const reviews = await Review.find({
      isApprove: true,
      isDeleted: false,
    })
      .select("rating comment createdAt patientId doctorId")
      .sort({ createdAt: -1 })
      .populate({
        path: "patientId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate({
        path: "doctorId",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      });
    return reviews;
  } catch (error) {
    throw new Error("Error fetching reviews: " + error.message);
  }
};
