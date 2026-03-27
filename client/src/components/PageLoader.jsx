import { Stethoscope } from "lucide-react";

function PageLoader({ fullScreen = false, label = "Loading..." }) {
  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-md"
          : "min-h-[40vh]"
      } flex items-center justify-center transition-all duration-500`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Glow Background */}
        <div className="absolute w-40 h-40 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />

        {/* Loader Ring */}
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-[5px] border-blue-200 border-t-blue-600 animate-spin" />

          <div className="absolute flex items-center justify-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg animate-[pulse_1.5s_ease-in-out_infinite]">
              <Stethoscope size={26} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="px-6 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-blue-100 shadow-md">
          <span className="text-sm font-semibold tracking-widest text-blue-900 animate-pulse">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
