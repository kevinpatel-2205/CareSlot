import express from "express";
import { createDoctor } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/createDoctor", createDoctor);

export default router;
