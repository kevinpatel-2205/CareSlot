import { Stethoscope, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/auth";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
    await dispatch(loginUser(form)).unwrap();
    navigate("/", { replace: true });
    } catch (err) {
    toast.error();
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-[#d8e2fb] bg-white/80 p-7 shadow-soft backdrop-blur-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#2e7df2] text-white">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a4a97]">
              CareSlot
            </h1>
            <p className="text-xs text-[#6f8bc0]">Welcome back</p>
          </div>
        </div>

        <h2 className="font-['Averia_Serif_Libre'] text-4xl font-semibold text-[#1a3f7b]">
          Login
        </h2>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            className="soft-input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            required
          />

          <input
            className="soft-input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] font-bold text-white disabled:opacity-70"
          >
            <LogIn size={18} />
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#5c79ad]">
          No account?{" "}
          <Link to="/register" className="font-bold text-[#2d7cf2]">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
