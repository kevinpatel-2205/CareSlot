import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Review from "../models/review.model.js";

export const getHomeData = async (req, res) => {
  try {
    const [
      topDoctors,
      topReviews,
      totalDoctors,
      totalPatients,
      totalAppointments,
    ] = await Promise.all([
      Doctor.find({
        isApproved: true,
        isDeleted: false,
      })
        .sort({ averageRating: -1 })
        .limit(5)
        .populate({
          path: "userId",
          select: "name email image",
        }),

      Review.find({
        rating: 5,
        isApprove: true,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .limit(5)
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
        }),

      Doctor.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false }),
      Appointment.countDocuments({ isDeleted: false }),
    ]);

    const formattedDoctors = topDoctors.map((doc) => ({
      _id: doc._id,
      name: doc.userId?.name,
      email: doc.userId?.email,
      image: doc.userId?.image,
      specialization: doc.specialization,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      rating: doc.averageRating,
      totalReviews: doc.totalReviews,
    }));

    const formattedReviews = topReviews.map((rev) => ({
      _id: rev._id,
      rating: rev.rating,
      comment: rev.comment,
      patientName: rev.patientId?.userId?.name,
      patientImage: rev.patientId?.userId?.image,
      doctorName: rev.doctorId?.userId?.name,
      createdAt: rev.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        topDoctors: formattedDoctors,
        topReviews: formattedReviews,
        stats: {
          totalDoctors,
          totalPatients,
          totalAppointments,
        },
      },
    });
  } catch (error) {
    console.error("Home API Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load home page data",
    });
  }
};
