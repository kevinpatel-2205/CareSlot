import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableSlots,
  addAvailableSlots,
  deleteAvailableSlot,
  addBulkAvailableSlots,
} from "../../store/doctor";
import { formatDate } from "../../lib/format.js";
import { CalendarPlus, ClockPlus } from "lucide-react";
import Pagination from "../../components/Pagination.jsx";

function DoctorSlotsPage() {
  const dispatch = useDispatch();

  const { availableSlots, currentPage, totalPages } = useSelector(
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

    if (!date || !parsedTimes.length) {
      return;
    }

    dispatch(
      addAvailableSlots({
        date,
        times: parsedTimes,
      }),
    );

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          Available Slots
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowBulkModal(true)}
            className="group flex items-center justify-center gap-2 rounded-2xl border border-[#d8e4ff] bg-white/50 backdrop-blur-md px-3 py-3 sm:px-5 text-[#1a3f7b] shadow-sm transition-all duration-300 hover:bg-green-100 hover:border-green-300 hover:shadow-md active:scale-95"
          >
            <CalendarPlus
              size={20}
              className="text-[#30579f] transition-colors duration-300 group-hover:text-green-700"
            />

            <span className="hidden sm:inline font-semibold transition-colors duration-300 group-hover:text-green-700">
              Bulk Add
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={addSlots} className="glass-card p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_auto]">
          <input
            type="date"
            className="soft-input"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <input
            className="soft-input"
            placeholder="Times comma separated (e.g. 09:00 AM, 10:30 AM)"
            value={times}
            onChange={(e) => setTimes(e.target.value)}
            required
          />

          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-6 font-bold text-white"
          >
            Add
            <ClockPlus className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>

      <div className="glass-card max-h-[56vh] overflow-auto p-4">
        <div className="space-y-3">
          {availableSlots.map((slot, idx) => (
            <article
              key={`${slot.date}-${idx}`}
              className="rounded-xl border border-[#d7e2fb] bg-white/70 p-3"
            >
              <p className="font-semibold text-[#1d3f80]">
                {formatDate(slot.date)}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {(slot.times || []).map((time) => (
                    <span
                      key={time}
                      className="rounded-full border border-[#c6d8fc] bg-[#eff4ff] px-3 py-1 text-xs font-semibold text-[#335eaa]"
                    >
                      {time}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => dispatch(deleteAvailableSlot(slot.date))}
                  className="whitespace-nowrap rounded-xl border border-[#f3b8c3] bg-white px-5 py-2 text-sm font-semibold text-[#d83b5a] shadow-sm hover:bg-[#fff7f9]"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!availableSlots.length ? (
            <p className="text-[#6b87b8]">No slots available.</p>
          ) : null}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[95%] max-w-lg rounded-2xl border border-[#d7e2fb] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-[#1a3f7b]">
                Bulk Slot Generator
              </h3>

              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-500 hover:text-red-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addBulkSlots} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1a3f7b]">
                  Start Date
                </label>
                <input
                  type="date"
                  className="soft-input w-full"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1a3f7b]">
                  End Date
                </label>
                <input
                  type="date"
                  className="soft-input w-full"
                  value={endDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1a3f7b]">
                  Start Time
                </label>
                <input
                  className="soft-input w-full"
                  placeholder="Example: 10:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1a3f7b]">
                  End Time
                </label>
                <input
                  className="soft-input w-full"
                  placeholder="Example: 05:00 PM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1a3f7b]">
                  Slot Interval (Minutes)
                </label>
                <input
                  type="number"
                  className="soft-input w-full"
                  placeholder="Example: 30"
                  min={5}
                  max={60}
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  required
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-semibold text-white"
              >
                Generate Slots
                <CalendarPlus className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorSlotsPage;
