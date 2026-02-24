import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ allowedRole, children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== allowedRole)
    return <Navigate to="/login" replace />;

  return children;
};

export default RoleProtectedRoute;