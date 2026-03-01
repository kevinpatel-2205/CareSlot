import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import PageLoader from "./PageLoader";

const RoleProtectedRoute = ({ allowedRole }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/redirect" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
