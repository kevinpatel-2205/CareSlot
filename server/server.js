import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { protect } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/role.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { CLIENT_URL, PORT } from "./utils/env.js";

connectDB();

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
// app.use(morgan("dev"));

// Test Route
app.get("/", (req, res) => {
  res.send("Doctor Appointment API Running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", protect, authorizeRoles("patient"), patientRoutes);
app.use("/api/doctor", protect, authorizeRoles("doctor"), doctorRoutes);
app.use("/api/admin", protect, authorizeRoles("admin"), adminRoutes);

// Error Middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
