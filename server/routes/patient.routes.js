import express from "express";
import { getPatientDashboard } from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/dashboard",getPatientDashboard,);

export default router;
