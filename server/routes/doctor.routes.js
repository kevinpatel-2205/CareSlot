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
} from "../controllers/doctor.controller.js";

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

export default router;
