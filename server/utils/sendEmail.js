// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { transporter } from "../config/mail.config.js";
// import { EMAIL_USER } from "./env.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const sendDoctorEmail = async ({ doctorName, email, password }) => {
//   const filePath = path.join(__dirname, "doctorWelcomeEmail.html");

//   let html = fs.readFileSync(filePath, "utf-8");

//   html = html
//     .replace("{{doctorName}}", doctorName)
//     .replace("{{email}}", email)
//     .replace("{{password}}", password)
//     .replace("{{dashboardLink}}", "https://careslot-ql85.onrender.com")
//     .replace("{{year}}", new Date().getFullYear());

//   try {
//     const info = await transporter.sendMail({
//       from: `"CareSlot" <${EMAIL_USER}>`,
//       to: email,
//       subject: "Welcome to CareSlot - Doctor Account Created",
//       html,
//     });

//     console.log("✅ Email sent:", info.response);
//   } catch (err) {
//     console.error("❌ Email failed:", err);
//     throw new Error("Failed to send welcome email to doctor");
//   }
// };

// export const sendAppointmentBookedEmailToDoctor = async ({
//   doctorName,
//   doctorEmail,
//   patientName,
//   patientEmail,
//   patientAge,
//   dateOfBirth,
//   appointmentDate,
//   timeSlot,
//   reason,
//   medicalHistory,
// }) => {
//   const filePath = path.join(__dirname, "doctorAppointmentBooked.html");

//   let html = fs.readFileSync(filePath, "utf-8");

//   html = html
//     .replace("{{doctorName}}", doctorName)
//     .replace("{{patientName}}", patientName)
//     .replace("{{patientEmail}}", patientEmail)
//     .replace("{{patientAge}}", patientAge || "N/A")
//     .replace("{{dateOfBirth}}", dateOfBirth || "N/A")
//     .replace("{{appointmentDate}}", appointmentDate)
//     .replace("{{timeSlot}}", timeSlot)
//     .replace("{{reason}}", reason || "N/A")
//     .replace("{{medicalHistory}}", medicalHistory || "N/A")
//     .replace("{{dashboardLink}}", "https://careslot-ql85.onrender.com")
//     .replace("{{year}}", new Date().getFullYear());

//   try {
//     const info = await transporter.sendMail({
//       from: `"CareSlot" <${EMAIL_USER}>`,
//       to: doctorEmail,
//       subject: "New Appointment Booked - CareSlot",
//       html,
//     });
//     console.log("✅ Email sent:", info.response);
//   } catch (err) {
//     console.error("❌ Email failed:", err);
//     throw new Error("Failed to send appointment booked email to doctor");
//   }
// };

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resend } from "../config/mail.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FROM_EMAIL = "onboarding@resend.dev";

export const sendDoctorEmail = async ({ doctorName, email, password }) => {
  const filePath = path.join(__dirname, "doctorWelcomeEmail.html");

  let html = fs.readFileSync(filePath, "utf-8");

  html = html
    .replace("{{doctorName}}", doctorName)
    .replace("{{email}}", email)
    .replace("{{password}}", password)
    .replace("{{dashboardLink}}", "https://careslot-ql85.onrender.com")
    .replace("{{year}}", new Date().getFullYear());

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to CareSlot - Doctor Account Created",
      html,
    });

    if (error) {
      console.error("❌ Email failed:", error);
      throw new Error("Failed to send welcome email to doctor");
    }

    console.log("✅ Email sent:", data);
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
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
    .replace("{{dashboardLink}}", "https://careslot-ql85.onrender.com")
    .replace("{{year}}", new Date().getFullYear());

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: doctorEmail,
      subject: "New Appointment Booked - CareSlot",
      html,
    });

    if (error) {
      console.error("❌ Email failed:", error);
      throw new Error("Failed to send appointment booked email to doctor");
    }

    console.log("✅ Email sent:", data);
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
};
