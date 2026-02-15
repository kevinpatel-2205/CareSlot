import express from "express";
import { getAdminDashboard } from "../controllers/admin.controller.js";

const router = express.Router();

// Admin Dashboard
router.get("/dashboard", getAdminDashboard);

export default router;
