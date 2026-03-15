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
  updateDoctorCommission,
  exportAdminDataToPDF,
  exportDoctorsExcel,
  exportDoctorsPDF,
} from "../controllers/admin.controller.js";
import { downloadPrescription } from "../controllers/prescriptionDownload.controller.js";

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
router.get("/pendingReviews", getPendingReviews);
router.patch("/reviews/:reviewId", approveReview);
router.delete("/reviews/:reviewId", deleteReview);
router.put("/commission/:doctorId", updateDoctorCommission);
router.get("/prescription/:appointmentId", downloadPrescription);
router.get("/export-pdf", exportAdminDataToPDF);

router.get("/doctors/export/pdf", exportDoctorsPDF);
router.get("/doctors/export/excel", exportDoctorsExcel);
export default router;
