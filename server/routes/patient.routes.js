import express from "express";
import {
  getPatientDashboard,
  getAllDoctors,
  getDoctorDetails,
  bookAppointment,
  getAppointments,
  getProfile,
  updateProfile,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/dashboard", getPatientDashboard);
router.get("/getAlldoctors", getAllDoctors);
router.get("/doctorDetails/:doctorId", getDoctorDetails);
router.post("/bookAppointment", bookAppointment);
router.get("/myAppointments", getAppointments);
router.get("/profile", getProfile);
router.put("/updateProfile", updateProfile);

export default router;
