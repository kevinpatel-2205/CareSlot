import { Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import AdminDashboard from "../pages/admin/Dashboard.jsx";

const AdminRoutes = () => {
  return (
    <RoleProtectedRoute allowedRole="admin">
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Routes>
    </RoleProtectedRoute>
  );
};

export default AdminRoutes;
