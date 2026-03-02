function StatCard({ icon: Icon, title, value, note, tone = "blue" }) {
  const tones = {
    blue: "from-[#e6f0ff] to-[#d5e6ff] text-[#2a69d9]",
    mint: "from-[#e4f9f5] to-[#cff5ec] text-[#149e82]",
    amber: "from-[#fff2de] to-[#ffe8c5] text-[#cb7a14]",
    violet: "from-[#ece7ff] to-[#ddd4ff] text-[#7055d8]",
    rose: "from-[#ffe6e9] to-[#ffd6dc] text-[#d6455d]",
  };

  return (
    <article className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#6e89bc]">{title}</p>
          <h3 className="mt-1 text-4xl font-extrabold tracking-tight text-[#17386e]">
            {value}
          </h3>
          {note ? (
            <p className="mt-1 text-sm font-semibold text-[#5f7db2]">{note}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tones[tone] || tones.blue}`}
          >
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default StatCard;
