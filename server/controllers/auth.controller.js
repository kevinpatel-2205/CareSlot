import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../utils/cloudinary.js";
import { NODE_ENV } from "../utils/env.js";

export const registerUser = async (req, res, next) => {
  try {
    let { name, email, password, phone } = req.body;

    name = name?.trim();
    email = email?.trim();
    password = password?.trim();
    phone = phone?.trim();

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All required fields must be provided");
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
    if (phone) {
      if (!phoneRegex.test(phone)) {
        res.status(400);
        throw new Error("Phone number must contain only digits");
      }

      if (phone.length !== 10) {
        res.status(400);
        throw new Error("Phone number must be exactly 10 digits");
      }
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

    await Patient.create({ userId: user._id });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: NODE_ENV === "production",
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

    if (user.isDeleted) {
      res.status(403);
      throw new Error("Account is Deleted");
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
      secure: NODE_ENV === "production",
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
        image: user.image,
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
      secure: NODE_ENV === "production",
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

export const updateProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("Image file is required");
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "doctor-app/users",
    });

    user.image = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error(
        "Current password, new password is required",
      );
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error("New password must be at least 8 characters");
    }

    if (newPassword == currentPassword) {
      res.status(400);
      throw new Error("New password and Current password is Same");
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
