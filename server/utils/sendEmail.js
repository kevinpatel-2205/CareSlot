import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transporter } from "../config/mail.config.js";
import { EMAIL_USER } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendDoctorEmail = async ({ doctorName, email, password }) => {
  const filePath = path.join(__dirname, "doctorWelcomeEmail.html");

  let html = fs.readFileSync(filePath, "utf-8");

  html = html
    .replace("{{doctorName}}", doctorName)
    .replace("{{email}}", email)
    .replace("{{password}}", password)
    .replace("{{dashboardLink}}", "http://localhost:5173/login")
    .replace("{{year}}", new Date().getFullYear());

  await transporter.sendMail({
    from: `"CareSlot" <${EMAIL_USER}>`,
    to: email,
    subject: "Welcome to CareSlot - Doctor Account Created",
    html,
  });
};

export const sendAppointmentBookedEmailToDoctor = async ({
  doctorName,
  doctorEmail,
  patientName,
  patientEmail,
  patientAge,
  dateOfBirth,
  appointmentDate,
  timeSlot,
  reason,
  medicalHistory,
}) => {
  const filePath = path.join(__dirname, "doctorAppointmentBooked.html");

  let html = fs.readFileSync(filePath, "utf-8");

  html = html
    .replace("{{doctorName}}", doctorName)
    .replace("{{patientName}}", patientName)
    .replace("{{patientEmail}}", patientEmail)
    .replace("{{patientAge}}", patientAge || "N/A")
    .replace("{{dateOfBirth}}", dateOfBirth || "N/A")
    .replace("{{appointmentDate}}", appointmentDate)
    .replace("{{timeSlot}}", timeSlot)
    .replace("{{reason}}", reason || "N/A")
    .replace("{{medicalHistory}}", medicalHistory || "N/A")
    .replace("{{dashboardLink}}", "http://localhost:5173/doctor/appointments")
    .replace("{{year}}", new Date().getFullYear());

   transporter.sendMail({
    from: `"CareSlot" <${EMAIL_USER}>`,
    to: doctorEmail,
    subject: "New Appointment Booked - CareSlot",
    html,
  });
};
