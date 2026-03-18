import { Link } from "react-router-dom";
import { Stethoscope, ArrowLeft, Home } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-400/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>

      <section className="z-10 w-full max-w-2xl bg-white rounded-[3rem] border border-blue-100 p-12 text-center shadow-2xl shadow-blue-100/50 animate-in fade-in zoom-in duration-500">
        {/* Visual Icon */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-blue-50 rounded-[2.5rem] rotate-12 transition-transform group-hover:rotate-0"></div>
          <div className="relative grid place-items-center w-full h-full bg-white border-2 border-blue-100 rounded-[2.5rem] text-blue-600 shadow-sm">
            <Stethoscope size={50} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
            404
          </div>
        </div>

        <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">
          Lost in the System
        </p>

        <h2 className="font-['Averia_Serif_Libre'] text-5xl md:text-6xl font-black text-blue-900 tracking-tight">
          Page Not Found
        </h2>

        <p className="mt-6 text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
          The medical record or page you're searching for isn't in our database.
          It might have been moved or the URL is incorrect.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-blue-300 transition-all active:scale-95"
          >
            <Home size={18} />
            Go to Home
          </Link>
        </div>

        <p className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          CareSlot Medical Appointment Systems
        </p>
      </section>
    </div>
  );
}

export default NotFoundPage;
