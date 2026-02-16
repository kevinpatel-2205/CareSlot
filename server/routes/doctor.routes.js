import express, { Router } from "express";
import {
  getAllAppointments,
  getDoctorDashboard,
  getUpcomingAppointments,
  changeAppointmentStatus,
  cancelAppointment,
  getDoctorPatients,
  getDoctorPatientDetails,
  getAvailableSlots,
  addAvailableSlots,
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctor.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/dashboard", getDoctorDashboard);
router.get("/upcomingAppointments", getUpcomingAppointments);
router.get("/allAppointments", getAllAppointments);
router.put("/changeStatus/:appointmentId", changeAppointmentStatus);
router.delete("/cancel/:appointmentId", cancelAppointment);
router.get("/patients", getDoctorPatients);
router.get("/patients/:patientId", getDoctorPatientDetails);
router.get("/availableSlots", getAvailableSlots);
router.post("/addAvailableSlots", addAvailableSlots);
router.get("/profile", getDoctorProfile);
router.put("/updateProfile", upload.single("image"), updateDoctorProfile);

export default router;
