import express from "express";
import { getDoctorDashboard } from "../controllers/doctor.controller.js";

const router = express.Router();

router.get("/dashboard", getDoctorDashboard);

export default router;
