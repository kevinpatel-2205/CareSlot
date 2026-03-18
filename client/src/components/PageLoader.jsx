import { Stethoscope } from "lucide-react";

function PageLoader({ fullScreen = false, label = "Loading..." }) {
  // Use a softer background if full screen to make it feel like a transition
  const wrapperClass = fullScreen
    ? "min-h-screen bg-slate-50/50 backdrop-blur-sm"
    : "min-h-[40vh]";

  return (
    <div
      className={`grid ${wrapperClass} place-items-center transition-all duration-500`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center">
          {/* Outer Rotating Ring */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          {/* Inner Pulsing Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-2 rounded-xl shadow-sm animate-pulse">
              <Stethoscope size={22} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Loading Label */}
        <div className="bg-white/80 border border-blue-100 px-6 py-2 rounded-full shadow-xl shadow-blue-100/50 backdrop-blur-md">
          <span className="text-sm font-black uppercase tracking-widest text-blue-900 animate-pulse">
            {label}
          </span>
        </div>

        {/* Subtle decorative blurs for full screen mode */}
        {fullScreen && (
          <>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/5 blur-[100px] rounded-full -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -z-10" />
          </>
        )}
      </div>
    </div>
  );
}

export default PageLoader;
