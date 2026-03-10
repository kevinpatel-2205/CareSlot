import PDFDocument from "pdfkit";
import axios from "axios";

import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Prescription from "../models/prescription.model.js";
import User from "../models/user.model.js";

export const downloadPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);

    const doctor = await Doctor.findById(appointment.doctorId);
    const patient = await Patient.findById(appointment.patientId);

    const doctorUser = await User.findById(doctor.userId);
    const patientUser = await User.findById(patient.userId);

    const prescription = await Prescription.findOne({ appointmentId });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription-${appointmentId}.pdf`,
    );

    doc.pipe(res);

    // ---------------- Colors ----------------
    const primaryColor = "#2e7df2"; // blue
    const tableHeaderColor = "#6c757d"; // gray for table header

    // ---------------- PAGE BORDER ----------------
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    doc
      .lineWidth(2)
      .strokeColor(primaryColor)
      .rect(10, 10, pageWidth - 20, pageHeight - 20)
      .stroke();

    // ---------------- LOGO ----------------
    const logoUrl =
      "https://res.cloudinary.com/dqkbv1knl/image/upload/v1772173127/logo_pfynmy.png";
    const response = await axios.get(logoUrl, { responseType: "arraybuffer" });
    const logoBuffer = Buffer.from(response.data, "binary");
    doc.image(logoBuffer, 40, 30, { width: 60 });

    // ---------------- HEADER ----------------
    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .text("CareSlot", 110, 40);

    doc
      .fontSize(11)
      .fillColor("gray")
      .text("Doctor Appointment Management System", 110, 65);

    doc.moveTo(40, 95).lineTo(550, 95).strokeColor(primaryColor).stroke();

    // ---------------- DOCTOR BOX ----------------
    doc
      .strokeColor(primaryColor)
      .lineWidth(1.5)
      .roundedRect(40, 110, 510, 80, 6)
      .stroke();

    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .text("Doctor Information", 50, 120);

    doc
      .fillColor("black")
      .fontSize(12)
      .text(`Dr. ${doctorUser.name}`, 50, 140)
      .text(`Specialization: ${doctor.specialization}`, 250, 140)
      .text(`Email: ${doctorUser.email}`, 50, 160)
      .text(`Experience: ${doctor.experience} Years`, 250, 160);

    // ---------------- PATIENT BOX ----------------
    doc
      .strokeColor(tableHeaderColor)
      .lineWidth(1.5)
      .roundedRect(40, 210, 510, 90, 6)
      .stroke();

    doc
      .fillColor(tableHeaderColor)
      .fontSize(14)
      .text("Patient Information", 50, 220);

    const age = patient.dateOfBirth
      ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
      : "-";

    doc
      .fillColor("black")
      .fontSize(12)
      .text(`Name: ${patientUser.name}`, 50, 240)
      .text(`Email: ${patientUser.email}`, 250, 240)
      .text(`Age: ${age}`, 50, 260)
      .text(
        `Appointment: ${appointment.appointmentDate.toDateString()}`,
        250,
        260,
      )
      .text(`Time: ${appointment.timeSlot}`, 50, 280);

    // ---------------- MEDICINE TABLE ----------------
    const tableTop = 330;
    const tableLeft = 40;
    const tableWidth = 510;
    const rowHeight = 25;

    // Columns with X positions
    const columns = [
      { label: "Medicine", x: 50 },
      { label: "Dosage", x: 170 },
      { label: "Timing", x: 260 },
      { label: "Meal", x: 360 },
      { label: "Duration", x: 440 },
    ];

    // ---------------- Header ----------------
    doc
      .fillColor(tableHeaderColor)
      .rect(tableLeft, tableTop, tableWidth, rowHeight)
      .fill();

    doc.fillColor("white").fontSize(11);
    columns.forEach((col) => {
      doc.text(col.label, col.x, tableTop + 7);
    });

    // Draw header borders
    doc.strokeColor(tableHeaderColor).lineWidth(1.2);
    doc.rect(tableLeft, tableTop, tableWidth, rowHeight).stroke();

    // Draw vertical lines in header
    for (let i = 1; i < columns.length; i++) {
      const x = columns[i].x - 10;
      doc
        .moveTo(x, tableTop)
        .lineTo(x, tableTop + rowHeight)
        .stroke();
    }

    // ---------------- Rows ----------------
    let y = tableTop + rowHeight;

    prescription.medicines.forEach((med) => {
      // Draw row border
      doc.strokeColor(tableHeaderColor).lineWidth(1);
      doc.rect(tableLeft, y, tableWidth, rowHeight).stroke();

      // Draw vertical lines for columns
      for (let i = 1; i < columns.length; i++) {
        const x = columns[i].x - 10;
        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
      }

      // Add text
      doc.fillColor("black").fontSize(12);
      doc.text(med.medicineName, columns[0].x, y + 7);
      doc.text(med.dosage, columns[1].x, y + 7);
      doc.text(med.timing.join(", "), columns[2].x, y + 7);
      doc.text(med.mealTime || "-", columns[3].x, y + 7);
      doc.text(med.duration || "-", columns[4].x, y + 7);

      y += rowHeight;
    });

    // ---------------- NOTES ----------------
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .text("Additional Notes", 40, y + 20);

    doc
      .fillColor("black")
      .fontSize(12)
      .text(prescription.additionalNotes || "-", 40, y + 40);

    // ---------------- SIGNATURE ----------------
    const signatureY = y + 80;
    doc
      .strokeColor(primaryColor)
      .lineWidth(1)
      .moveTo(400, signatureY)
      .lineTo(540, signatureY)
      .stroke();

    doc.text("Doctor Signature", 420, signatureY + 10);

    // ---------------- FOOTER ----------------
    const footerLineY = 730;
    const footerTextY = 735;

    doc
      .strokeColor(primaryColor)
      .lineWidth(1)
      .moveTo(40, footerLineY)
      .lineTo(550, footerLineY)
      .stroke();

    doc
      .fillColor("gray")
      .fontSize(10)
      .text("Ahmedabad, Gujarat", 40, footerTextY)
      .text("www.careslot.com", 220, footerTextY)
      .text("support@careslot.com", 400, footerTextY);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF generation failed" });
  }
};
