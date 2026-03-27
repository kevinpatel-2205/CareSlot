// import nodemailer from "nodemailer";
// import { EMAIL_USER, EMAIL_PASS } from "../utils/env.js";

// export const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: true,
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
//   connectionTimeout: 15000,
// });

// transporter.verify((err, success) => {
//   if (err) {
//     console.error("❌ SMTP ERROR:", err);
//   } else {
//     console.log("✅ SMTP READY");
//   }
// });

// import { Resend } from "resend";
// import { RESEND_API_KEY } from "../utils/env.js";

// export const resend = new Resend(RESEND_API_KEY);

import nodemailer from "nodemailer";
import { BREVO_USER, BREVO_PASS } from "../utils/env.js";

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  auth: {
    user: BREVO_USER,
    pass: BREVO_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP ERROR:", err);
  } else {
    console.log("✅ SMTP READY");
  }
});
