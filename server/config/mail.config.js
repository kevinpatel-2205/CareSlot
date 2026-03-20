import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../utils/env.js";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP ERROR:", err);
  } else {
    console.log("✅ SMTP READY");
  }
});
