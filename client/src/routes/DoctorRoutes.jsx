import { Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import DoctorDashboard from "../pages/doctor/Dashboard.jsx";

const DoctorRoutes = () => {
  return (
    <RoleProtectedRoute allowedRole="doctor">
      <Routes>
        <Route path="dashboard" element={<DoctorDashboard />} />
      </Routes>
    </RoleProtectedRoute>
  );
};

export default DoctorRoutes;
