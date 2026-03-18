import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableSlots,
  addAvailableSlots,
  deleteAvailableSlot,
  addBulkAvailableSlots,
} from "../../store/doctor";
import { formatDate } from "../../lib/format.js";
import {
  CalendarPlus,
  ClockPlus,
  Trash2,
  X,
  Calendar as CalendarIcon,
  Clock,
  Layers,
} from "lucide-react";
import Pagination from "../../components/Pagination.jsx";
import PageLoader from "../../components/PageLoader.jsx";

function DoctorSlotsPage() {
  const dispatch = useDispatch();

  const { availableSlots, currentPage, totalPages, loading } = useSelector(
    (state) => state.doctor,
  );

  const [date, setDate] = useState("");
  const [times, setTimes] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [interval, setInterval] = useState(30);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAvailableSlots(page));
  }, [page, dispatch]);

  const addSlots = (e) => {
    e.preventDefault();
    const parsedTimes = times
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!date || !parsedTimes.length) return;

    dispatch(addAvailableSlots({ date, times: parsedTimes }));
    setDate("");
    setTimes("");
  };

  const addBulkSlots = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !interval) return;

    dispatch(
      addBulkAvailableSlots({
        startDate,
        endDate,
        startTime,
        endTime,
        interval,
      }),
    );
    setStartDate("");
    setEndDate("");
    setInterval(30);
    setShowBulkModal(false);
  };

  if (loading && availableSlots.length === 0)
    return <PageLoader label="Fetching Schedule..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Clinical Availability
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Define your consulting hours and patient time slots.
          </p>
        </div>

        <button
          onClick={() => setShowBulkModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
        >
          <Layers size={18} />
          Bulk Generate
        </button>
      </div>

      {/* QUICK ADD BAR */}
      <section className="bg-white rounded-[2.5rem] p-6 border border-blue-100 shadow-sm">
        <form
          onSubmit={addSlots}
          className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 items-end"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Select Date
            </label>
            <input
              type="date"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Comma Separated Times
            </label>
            <input
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
              placeholder="09:00 AM, 11:30 AM, 02:00 PM"
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ClockPlus size={18} />
            Add Slots
          </button>
        </form>
      </section>

      {/* SLOTS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {availableSlots.map((slot, idx) => (
          <article
            key={`${slot.date}-${idx}`}
            className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CalendarIcon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Scheduled Date
                </p>
                <p className="text-xl font-black text-blue-900">
                  {formatDate(slot.date)}
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap gap-2">
              {(slot.times || []).map((time) => (
                <span
                  key={time}
                  className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl text-[11px] font-black tracking-tight"
                >
                  {time}
                </span>
              ))}
            </div>

            <button
              onClick={() => dispatch(deleteAvailableSlot(slot.date))}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
              <Trash2 size={14} />
              Clear Day
            </button>
          </article>
        ))}

        {availableSlots.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Clock size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-bold text-slate-400">
              No available slots published for your patients.
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />

      {/* BULK GENERATOR MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-[3rem] border border-blue-100 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-100">
                  <Layers size={20} />
                </div>
                <h3 className="text-2xl font-black text-blue-900 tracking-tight">
                  Bulk Generator
                </h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={addBulkSlots} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                    value={endDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Start Time
                  </label>
                  <input
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    End Time
                  </label>
                  <input
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="05:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Slot Duration (Min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700"
                    value={interval}
                    min={5}
                    max={60}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    required
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest">
                    Minutes
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CalendarPlus size={20} />
                Generate Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorSlotsPage;
