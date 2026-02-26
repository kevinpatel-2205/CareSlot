import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import RoleRedirectPage from "../pages/RoleRedirectPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import PageLoader from "../components/PageLoader.jsx";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { adminNav, doctorNav, patientNav } from "../config/navigation.js";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import AdminProfilePage from "../pages/admin/AdminProfilePage.jsx";
import AdminAddDoctorPage from "../pages/admin/AdminAddDoctorPage.jsx";
import AdminDoctorsPage from "../pages/admin/AdminDoctorsPage.jsx";
import AdminPatientsPage from "../pages/admin/AdminPatientsPage.jsx";
import AdminAppointmentsPage from "../pages/admin/AdminAppointmentsPage.jsx";

// Doctor Pages
import DoctorDashboard from "../pages/doctor/Dashboard.jsx";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage.jsx";
import DoctorAppointmentsPage from "../pages/doctor/DoctorAppointmentsPage.jsx";
import DoctorPatientsPage from "../pages/doctor/DoctorPatientsPage.jsx";
import DoctorPatientDetailPage from "../pages/doctor/DoctorPatientDetailPage.jsx";
import DoctorSlotsPage from "../pages/doctor/DoctorSlotsPage.jsx";

// Patient Pages
import PatientDashboard from "../pages/patient/Dashboard.jsx";
import PatientBookDoctorsPage from "../pages/patient/PatientBookDoctorsPage.jsx";
import PatientAppointmentsPage from "../pages/patient/PatientAppointmentsPage.jsx";
import PatientDoctorDetailPage from "../pages/patient/PatientDoctorDetailPage.jsx";
import PatientProfilePage from "../pages/patient/PatientProfilePage.jsx";

const AppRoutes = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <PageLoader />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/redirect" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/redirect" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/redirect" replace /> : <RegisterPage />}
      />

      <Route path="/redirect" element={<RoleRedirectPage />} />

      <Route element={<RoleProtectedRoute allowedRole="admin" />}>
        <Route
          path="/admin"
          element={<DashboardLayout navItems={adminNav} roleLabel="Admin" />}
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="add-doctor" element={<AdminAddDoctorPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="patients" element={<AdminPatientsPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
        </Route>
      </Route>

      <Route element={<RoleProtectedRoute allowedRole="doctor" />}>
        <Route
          path="/doctor"
          element={<DashboardLayout navItems={doctorNav} roleLabel="Doctor" />}
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointmentsPage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route
            path="patients/:patientId"
            element={<DoctorPatientDetailPage />}
          />
          <Route path="slots" element={<DoctorSlotsPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
        </Route>
      </Route>

      <Route element={<RoleProtectedRoute allowedRole="patient" />}>
        <Route
          path="/patient"
          element={
            <DashboardLayout navItems={patientNav} roleLabel="Patient" />
          }
        >
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book-doctor" element={<PatientBookDoctorsPage />} />
          <Route path="appointments" element={<PatientAppointmentsPage />} />
          <Route
            path="doctors/:doctorId"
            element={<PatientDoctorDetailPage />}
          />
          <Route path="profile" element={<PatientProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
