export const formatMoney = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const statusTone = (status) => {
  const normalizedStatus = (status || "").toLowerCase();

  switch (normalizedStatus) {
    case "completed":
      return "bg-cyan-50 text-cyan-700 border-cyan-100";

    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-100";

    case "active":
      return "bg-blue-50 text-blue-700 border-blue-100";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};
