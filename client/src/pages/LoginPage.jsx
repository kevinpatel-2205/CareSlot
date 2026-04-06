import {
  Stethoscope,
  LogIn,
  Mail,
  Lock,
  Home as HomeIcon,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/auth";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginUser(form)).unwrap();
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-400/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>

      <div className="z-10 relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-white p-8 md:p-10 transition-all">
        <button
          onClick={() => navigate("/")}
          className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-all"
        >
          <X size={24} />
        </button>
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 mb-4 transform hover:rotate-12 transition-transform">
            <Stethoscope className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            CareSlot
          </h1>
          <p className="text-slate-500 font-medium">Welcome back, Specialist</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Sign In
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              "Verifying..."
            ) : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-100 md:hidden z-50 px-6 py-4 flex justify-around items-center">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-slate-400 hover:text-blue-600"
        >
          <HomeIcon size={22} />
          <span className="text-[10px] font-bold uppercase mt-1">Home</span>
        </button>
        <button
          onClick={() => navigate("/login")}
          className="flex flex-col items-center text-blue-600 scale-110"
        >
          <LogIn size={22} />
          <span className="text-[10px] font-bold uppercase mt-1">Login</span>
        </button>
        <button
          onClick={() => navigate("/register")}
          className="flex flex-col items-center text-slate-400 hover:text-blue-600"
        >
          <UserPlus size={22} />
          <span className="text-[10px] font-bold uppercase mt-1">Join</span>
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
