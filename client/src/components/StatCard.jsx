import React from "react";

function StatCard({ icon: Icon, title, value, note, tone = "blue" }) {
  const tones = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
      shadow: "shadow-blue-100/50",
    },
    mint: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
      shadow: "shadow-emerald-100/50",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-100",
      shadow: "shadow-amber-100/50",
    },
    rose: {
      bg: "bg-rose-50",
      icon: "text-rose-600",
      border: "border-rose-100",
      shadow: "shadow-rose-100/50",
    },
    violet: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
      border: "border-violet-100",
      shadow: "shadow-violet-100/50",
    },
  };

  const selectedTone = tones[tone] || tones.blue;

  return (
    <article className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
          {note && (
            <div className="flex items-center gap-1.5 mt-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${selectedTone.icon} animate-pulse`}
              />
              <p className="text-xs font-bold text-slate-500 italic">{note}</p>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl border transition-all duration-300 group-hover:scale-110 shadow-lg ${selectedTone.bg} ${selectedTone.border} ${selectedTone.icon} ${selectedTone.shadow}`}
          >
            <Icon size={26} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Decorative Progress Bar Accent */}
      <div className="mt-6 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
        <div
          className={`h-full w-2/3 rounded-full opacity-60 ${selectedTone.bg.replace("bg-", "bg-").split("-")[1] === "50" ? selectedTone.icon.replace("text-", "bg-") : "bg-blue-500"}`}
        />
      </div>
    </article>
  );
}

export default StatCard;
