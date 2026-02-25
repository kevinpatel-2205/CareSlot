import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import PageLoader from "./PageLoader";

const RoleProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/redirect" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
