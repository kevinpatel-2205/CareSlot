import express from "express";
import {
  createDoctor,
  getAdminDashboard,
  getAllDoctors,
  toggleDoctorStatus,
  deleteDoctor,
  getAllPatients,
  deletePatient,
  getAllAppointments,
  exportAdminDataToExcel,
  getPendingReviews,
  approveReview,
  deleteReview,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", getAdminDashboard);
router.post("/createDoctor", createDoctor);
router.get("/allDoctors", getAllDoctors);
router.put("/toggleDoctorStatus/:doctorId", toggleDoctorStatus);
router.delete("/deleteDoctor/:doctorId", deleteDoctor);
router.get("/allPatients", getAllPatients);
router.delete("/deletePatient/:patientId", deletePatient);
router.get("/allAppointments", getAllAppointments);
router.get("/export-excel", exportAdminDataToExcel);
router.get("/reviews", getPendingReviews);
router.patch("/reviews/:reviewId", approveReview);
router.delete("/reviews/:reviewId", deleteReview);

export default router;
