import express from "express";
import {
  getPatientDashboard,
  // getAllDoctors,
  // bookAppointment,
  // getMyAppointments,
  // cancelAppointment,
  // rescheduleAppointment,
  // getPaymentHistory,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/dashboard", getPatientDashboard);
// router.get("/doctors", getAllDoctors);
// router.post("/book", bookAppointment);
// router.get("/appointments", getMyAppointments);
// router.patch("/cancel/:id", cancelAppointment);
// router.patch("/reschedule/:id", rescheduleAppointment);
// router.get("/payments", getPaymentHistory);

export default router;
