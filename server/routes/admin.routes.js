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

export default router;
