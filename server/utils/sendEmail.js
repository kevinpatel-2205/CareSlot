import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transporter } from "../config/mail.config.js";
import { EMAIL_USER } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendDoctorEmail = async ({
  doctorName,
  email,
  password,
}) => {

  const filePath = path.join(__dirname, "doctorWelcomeEmail.html");

  let html = fs.readFileSync(filePath, "utf-8");

  html = html
    .replace("{{doctorName}}", doctorName)
    .replace("{{email}}", email)
    .replace("{{password}}", password)
    .replace("{{dashboardLink}}", "http://localhost:5173/doctor/login")
    .replace("{{year}}", new Date().getFullYear());

  await transporter.sendMail({
    from: `"CareSlot" <${EMAIL_USER}>`,
    to: email,
    subject: "Welcome to CareSlot - Doctor Account Created",
    html,
  });
};