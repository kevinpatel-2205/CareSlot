import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TOAST_EVENT } from "../lib/toastBus.js";

function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (event) => {
      const { type = "success", message = "" } = event.detail || {};
      if (!message) return;

      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  const rendered = useMemo(() => toasts.slice(-5), [toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] space-y-2">
      {rendered.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex min-w-[280px] max-w-sm items-start gap-2 rounded-xl border px-3 py-2 shadow-soft ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}
          <p className="flex-1 text-sm font-semibold">{toast.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
            className="rounded p-0.5 hover:bg-white/60"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
