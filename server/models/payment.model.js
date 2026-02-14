import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "razorpay"],
      required: true
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success"
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
