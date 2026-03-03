import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableSlots,
  addAvailableSlots,
  deleteAvailableSlot,
} from "../../store/doctor";
import { formatDate } from "../../lib/format.js";
import { ClockPlus } from "lucide-react";

function DoctorSlotsPage() {
  const dispatch = useDispatch();

  const { availableSlots } = useSelector((state) => state.doctor);

  const [date, setDate] = useState("");
  const [times, setTimes] = useState("");

  useEffect(() => {
    dispatch(fetchAvailableSlots());
  }, [dispatch]);

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

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Available Slots
      </h2>

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
    </div>
  );
}

export default DoctorSlotsPage;
