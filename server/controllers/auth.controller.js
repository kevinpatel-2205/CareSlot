import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All required fields must be provided");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "patient",
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    if (!user.isActive || user.isDeleted) {
      res.status(403);
      throw new Error("Account is inactive");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    let data = { user };

    if (user.role === "patient") {
      const patientProfile = await Patient.findOne({ userId: user._id }).lean();
      data = { ...data, profile: patientProfile || null };
    } else if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: user._id }).lean();
      data = { ...data, profile: doctorProfile || null };
    }
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getMe error:", error);
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
