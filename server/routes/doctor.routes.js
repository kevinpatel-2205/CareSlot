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
  exportDoctorExcel,
  deleteAvailableSlot,
  getDoctorReviews,
  addPrescription,
} from "../controllers/doctor.controller.js";
import { downloadPrescription } from "../controllers/prescriptionDownload.controller.js";

const router = express.Router();

router.get("/dashboard", getDoctorDashboard);
router.get("/upcomingAppointments", getUpcomingAppointments);
router.get("/allAppointments", getAllAppointments);
router.put("/changeStatus/:appointmentId", changeAppointmentStatus);
router.put("/cancel/:appointmentId", cancelAppointment);
router.get("/patients", getDoctorPatients);
router.get("/patients/:patientId", getDoctorPatientDetails);
router.get("/availableSlots", getAvailableSlots);
router.post("/addAvailableSlots", addAvailableSlots);
router.get("/profile", getDoctorProfile);
router.put("/updateProfile", updateDoctorProfile);
router.delete("/slots/:date", deleteAvailableSlot);
router.get("/reviews", getDoctorReviews);
router.get("/export-excel", exportDoctorExcel);
router.post("/prescription/:appointmentId", addPrescription);
router.get("/prescription/:appointmentId", downloadPrescription);
export default router;
