import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";

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
