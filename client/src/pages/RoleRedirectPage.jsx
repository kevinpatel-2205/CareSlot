import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader.jsx"

function RoleRedirectPage() {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "doctor":
          navigate("/doctor/dashboard", { replace: true });
          break;
        case "patient":
          navigate("/patient/dashboard", { replace: true });
          break;
        default:
          navigate("/login", { replace: true });
      }
    }

    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-lg font-semibold text-[#1a3f7b]">
        <PageLoader fullScreen label="Loading app..." />
      </div>
    </div>
  );
}

export default RoleRedirectPage;