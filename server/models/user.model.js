import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dqkbv1knl/image/upload/v1771043942/upload_area_qnbfyw.png",
    },

    phone: {
      type: String,
      default: "0000000000",
    },

    address: {
      type: addressSchema,
      default: () => ({}),
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Not Selected"],
      default: "Not Selected",
    },

    dob: {
      type: Date,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
