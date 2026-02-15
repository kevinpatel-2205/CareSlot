import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    specialization: {
      type: String,
      required: true,
      index: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    about: {
      type: String,
      maxlength: 1000,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    availableSlots: [
      {
        _id: false,
        date: {
          type: Date,
          required: true,
        },
        times: {
          type: [String],
          required: true,
        },
      },
    ],

    totalEarnings: {
      type: Number,
      default: 0,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
