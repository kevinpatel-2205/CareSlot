import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
    },

    timing: [
      {
        type: String,
        enum: ["morning", "afternoon", "night"],
      },
    ],

    mealTime: {
      type: String,
      enum: ["before_meal", "after_meal"],
    },

    duration: {
      type: String,
    },
  },
  { _id: false },
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    medicines: [medicineSchema],

    additionalNotes: {
      type: String,
      maxlength: 1000,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Prescription", prescriptionSchema);
