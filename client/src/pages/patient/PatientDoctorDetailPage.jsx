import { CalendarDays, Clock3, NotebookText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorDetails,
  bookAppointment,
} from "../../store/patient";
import { formatMoney } from "../../lib/format.js";

function PatientDoctorDetailPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { doctorDetails: doctor } = useSelector((state) => state.patient);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (doctorId) {
      dispatch(fetchDoctorDetails(doctorId));
    }
  }, [dispatch, doctorId]);

  const dateOptions = useMemo(
    () =>
      (doctor?.availableSlots || []).map((slot) =>
        new Date(slot.date).toISOString().slice(0, 10),
      ),
    [doctor],
  );

  const timeOptions = useMemo(() => {
    if (!selectedDate) return [];

    const target = new Date(selectedDate).toDateString();

    const slot = (doctor?.availableSlots || []).find(
      (item) => new Date(item.date).toDateString() === target,
    );

    return slot?.times || [];
  }, [doctor, selectedDate]);

  const submit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(
      bookAppointment({
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedTime,
        notes,
      }),
    );

    if (bookAppointment.fulfilled.match(resultAction)) {
      setTimeout(() => navigate("/patient/appointments"), 1000);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Doctor Detail
      </h2>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <section className="glass-card overflow-hidden p-5">
          <div className="flex flex-wrap items-start gap-4">
            <img
              src={
                doctor?.image ||
                "https://placehold.co/120x120/e6efff/2e5fae?text=DR"
              }
              alt={doctor?.name || "Doctor"}
              className="h-24 w-24 rounded-2xl border border-[#d7e2fb] object-cover"
            />

            <div>
              <h3 className="font-['Averia_Serif_Libre'] text-4xl font-semibold text-[#1a3f7b]">
                {doctor?.name || "--"}
              </h3>

              <p className="mt-1 text-[#6280b6]">
                {doctor?.specialization || "--"}
              </p>

              <p className="mt-2 text-sm text-[#45659d]">
                {doctor?.email || "--"}
              </p>

              <p className="mt-1 text-sm font-semibold">
                Status:{" "}
                <span
                  className={
                    doctor?.isActive ? "text-emerald-600" : "text-rose-600"
                  }
                >
                  {doctor?.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-[#36598f]">
            <p>
              <span className="font-semibold">Experience:</span>{" "}
              {doctor?.experience ?? "--"} years
            </p>

            <p>
              <span className="font-semibold">Consultation Fee:</span>{" "}
              {formatMoney(doctor?.consultationFee || 0)}
            </p>

            <p className="break-words whitespace-pre-wrap break-all">
              <span className="font-semibold">About:</span>{" "}
              {doctor?.about || "--"}
            </p>
          </div>
        </section>

        <aside className="glass-card p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Appointment Booking
          </h3>

          <form className="mt-4 space-y-4" onSubmit={submit}>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4b6aa1]">Date</span>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f98c6]"
                />

                <select
                  className="soft-input !pl-14"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }}
                  required
                >
                  <option value="">Choose a date</option>

                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4b6aa1]">Time</span>

              <div className="relative">
                <Clock3
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f98c6]"
                />

                <select
                  className="soft-input !pl-14"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  <option value="">Choose a time slot</option>

                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4b6aa1]">
                Reason
              </span>

              <div className="relative">
                <NotebookText
                  size={16}
                  className="absolute left-4 top-3 text-[#7f98c6]"
                />

                <textarea
                  className="min-h-28 w-full rounded-xl border border-[#cfdbf8] bg-white/80 !pl-14 pr-3 pt-2 text-[#1d3f80] placeholder:text-[#7a94c6] focus:border-[#4d88ff] focus:outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for visit"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={!doctor?.isActive}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Book Appointment
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

export default PatientDoctorDetailPage;
