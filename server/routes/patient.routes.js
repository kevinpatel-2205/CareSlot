import express from "express";
import {
  getPatientDashboard,
  getAllDoctors,
  getDoctorDetails,
  bookAppointment,
  getAppointments,
  getProfile,
  updateProfile,
  paymentRazorpay,
  verifyRazorpay,
  markRazorpayFailed,
  createReview,
} from "../controllers/patient.controller.js";
import { downloadPrescription } from "../controllers/prescriptionDownload.controller.js";

const router = express.Router();

router.get("/dashboard", getPatientDashboard);
router.get("/getAlldoctors", getAllDoctors);
router.get("/doctorDetails/:doctorId", getDoctorDetails);
router.post("/bookAppointment", bookAppointment);
router.get("/myAppointments", getAppointments);
router.get("/profile", getProfile);
router.put("/updateProfile", updateProfile);
router.post("/create-order", paymentRazorpay);
router.post("/verify-payment", verifyRazorpay);
router.post("/payment-failed", markRazorpayFailed);
router.post("/reviews", createReview);
router.get("/prescription/:appointmentId", downloadPrescription);

export default router;
