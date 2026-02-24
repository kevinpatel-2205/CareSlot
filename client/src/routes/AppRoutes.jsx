import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import RoleRedirectPage from "../pages/RoleRedirectPage.jsx";
import AdminRoutes from "./AdminRoutes";
import DoctorRoutes from "./DoctorRoutes";
import PatientRoutes from "./PatientRoutes";
import NotFoundPage from "../pages/NotFoundPage.jsx";

const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  const getDashboardPath = (role) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "doctor") return "/doctor/dashboard";
    return "/patient/dashboard";
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      <Route path="/redirect" element={<RoleRedirectPage />} />

      <Route
        path="/admin/*"
        element={
          user?.role === "admin" ? (
            <AdminRoutes />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/doctor/*"
        element={
          user?.role === "doctor" ? (
            <DoctorRoutes />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/patient/*"
        element={
          user?.role === "patient" ? (
            <PatientRoutes />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
