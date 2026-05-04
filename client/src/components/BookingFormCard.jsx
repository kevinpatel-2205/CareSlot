import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  ChevronDown,
  ClipboardClock,
  Loader2,
  User,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { bookAppointment, fetchAllDoctors } from "../store/patient";

const SCROLL_CSS = `
  .cs-scroll::-webkit-scrollbar { width: 4px }
  .cs-scroll::-webkit-scrollbar-track { background: transparent }
  .cs-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px }
  .cs-scroll::-webkit-scrollbar-thumb:hover { background: #2e7df2 }
`;

function Dropdown({
  label,
  icon: Icon,
  placeholder,
  value,
  options,
  disabled,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
        {label}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all
          ${
            disabled
              ? "opacity-40 cursor-not-allowed bg-slate-100 border-slate-200"
              : "bg-white border-slate-200 hover:border-blue-300"
          }
          ${open ? "border-blue-500 ring-2 ring-blue-100" : ""}
        `}
      >
        <span className="flex items-center gap-2 font-semibold text-slate-700 truncate">
          <Icon size={15} className="text-blue-500 shrink-0" />
          <span className="truncate">{value || placeholder}</span>
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-blue-100/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-[180px] overflow-y-auto cs-scroll p-1.5">
            {options.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">
                No options available
              </p>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between mb-0.5
                    ${
                      value === opt.value
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-blue-50"
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && (
                    <CheckCircle2 size={14} className="shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingFormCard({ onBooked }) {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.patient);

  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      dispatch(fetchAllDoctors());
    }
  }, [dispatch]);

  const selectedDoctor = doctors.find((d) => d.doctorId === doctorId);

  const availableSlots = selectedDoctor?.availableSlots || [];

  useEffect(() => {
    setDate("");
    setTimeSlot("");
  }, [doctorId]);

  useEffect(() => {
    setTimeSlot("");
  }, [date]);

  const dateOptions = availableSlots.map((s) => {
    const d = new Date(s.date);
    return {
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });

  const timeOptions = (() => {
    if (!date) return [];
    const target = new Date(date).toDateString();
    const slot = availableSlots.find(
      (s) => new Date(s.date).toISOString().slice(0, 10) === date,
    );
    return (slot?.times || []).map((t) => ({ value: t, label: t }));
  })();

  const handleConfirm = async () => {
    if (!doctorId || !date || !timeSlot) return;
    setSubmitting(true);

    try {
      const result = await dispatch(
        bookAppointment({ doctorId, appointmentDate: date, timeSlot }),
      );

      if (bookAppointment.fulfilled.match(result)) {
        setDone(true);

        onBooked?.(
          `✅ Appointment confirmed with **${selectedDoctor?.name}** on **${date}** at **${timeSlot}**.`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
          <CheckCircle2 size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-emerald-800 text-sm">
            Booking Confirmed!
          </p>
          <p className="text-emerald-600 text-xs mt-0.5">
            {selectedDoctor?.name} · {date} · {timeSlot}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{SCROLL_CSS}</style>
      <div className="bg-white border border-blue-100 rounded-3xl shadow-xl shadow-blue-100/40 overflow-hidden w-full">
        {/* Card header */}
        <div className="bg-gradient-to-r from-[#2e7df2] to-[#1a5fd4] px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <CalendarDays size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              Book an Appointment
            </p>
            <p className="text-blue-200 text-[11px]">
              Fill in the details below
            </p>
          </div>
          <Sparkles size={14} className="text-blue-200 ml-auto" />
        </div>

        <div className="p-4 space-y-3">
          {/* Dropdown 1 — Doctor */}
          <Dropdown
            label="1. Select Doctor"
            icon={User}
            placeholder="Choose a doctor"
            value={
              selectedDoctor
                ? `${selectedDoctor.name} — ${selectedDoctor.specialization}`
                : ""
            }
            options={doctors.map((d) => ({
              value: d.doctorId,
              label: `${d.name} · ${d.specialization}`,
            }))}
            onChange={setDoctorId}
          />

          {/* Dropdown 2 — Date (locked until doctor selected) */}
          <Dropdown
            label="2. Select Date"
            icon={CalendarDays}
            placeholder="Choose a date"
            value={dateOptions.find((o) => o.value === date)?.label || ""}
            options={dateOptions}
            disabled={!doctorId}
            onChange={setDate}
          />

          <Dropdown
            label="3. Select Time Slot"
            icon={Clock3}
            placeholder="Choose a time slot"
            value={timeSlot}
            options={timeOptions}
            disabled={!date}
            onChange={setTimeSlot}
          />

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!doctorId || !date || !timeSlot || submitting}
            className="w-full mt-1 bg-[#2e7df2] hover:bg-[#1a5fd4] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Booking…
              </>
            ) : (
              <>
                <ClipboardClock size={16} /> Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default BookingFormCard;
