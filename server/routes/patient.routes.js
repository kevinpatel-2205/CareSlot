import express from "express";
import {
  getPatientDashboard,
  getAllDoctors,
  getDoctorDetails,
  bookAppointment,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/dashboard", getPatientDashboard);
router.get("/getAlldoctors", getAllDoctors);
router.get("/doctorDetails/:doctorId", getDoctorDetails);
router.post("/bookAppointment", bookAppointment);

export default router;
