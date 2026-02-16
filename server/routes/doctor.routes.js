import express from "express";
import { getDoctorDashboard, getUpcomingAppointments } from "../controllers/doctor.controller.js";

const router = express.Router();

router.get("/dashboard", getDoctorDashboard);
router.get("/upcomingAppointments", getUpcomingAppointments);

export default router;
