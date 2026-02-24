import { Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "../components/RoleProtectedRoute";

import PatientDashboard from "../pages/patient/Dashboard.jsx";

const PatientRoutes = () => {
  return (
    <RoleProtectedRoute allowedRole="patient">
      <Routes>
        <Route path="dashboard" element={<PatientDashboard />} />
      </Routes>
    </RoleProtectedRoute>
  );
};

export default PatientRoutes;
