function PageLoader({ fullScreen = false, label = "Loading..." }) {
  const wrapperClass = fullScreen ? "min-h-screen" : "min-h-[40vh]";

  return (
    <div className={`grid ${wrapperClass} place-items-center`}>
      <div className="glass-card flex items-center gap-3 px-5 py-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2d7cf2] border-t-transparent" />
        <span className="font-semibold text-[#2f5ea8]">{label}</span>
      </div>
    </div>
  );
}

export default PageLoader;
