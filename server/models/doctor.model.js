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

    isApproved: {
      type: Boolean,
      default: false,
    },

    geolocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
      },
      address: {
        type: String,
        maxlength: 500,
        default: "",
      },
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    aCommission: {
      type: Number,
      default: 10,
    },

    commissionHistory: [
      {
        commission: {
          type: Number,
          required: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

doctorSchema.index({ geolocation: "2dsphere" });

export default mongoose.model("Doctor", doctorSchema);
