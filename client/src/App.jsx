import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "./store/auth";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: "1.2rem",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)",
        }}
        bodyStyle={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#334155",
          fontFamily: "Inter, sans-serif",
        }}
      />
    </BrowserRouter>
  );
}

export default App;
