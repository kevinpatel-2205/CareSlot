import {
  CalendarDays,
  ClipboardClock,
  Clock3,
  NotebookText,
  Star,
  ChevronRight,
  Award,
  CheckCircle2,
  Stethoscope,
  Briefcase,
  IndianRupee,
  ChevronDown,
  Mail,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorDetails,
  bookAppointment,
  createDoctorReview,
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
  const [rating, setRating] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  // States for the custom dropdowns
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  useEffect(() => {
    if (doctorId) {
      dispatch(fetchDoctorDetails(doctorId));
    }
  }, [dispatch, doctorId]);

  const visualDates = useMemo(() => {
    return (doctor?.availableSlots || []).map((slot) => {
      const dateObj = new Date(slot.date);
      return {
        full: slot.date.slice(0, 10),
        formatted: dateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          weekday: "short",
        }),
      };
    });
  }, [doctor]);

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

  const submitReview = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(
      createDoctorReview({ doctorId, rating, comment: reviewComment }),
    );
    if (createDoctorReview.fulfilled.match(resultAction)) {
      setRating("");
      setReviewComment("");
      dispatch(fetchDoctorDetails(doctorId));
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto px-2">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>

      {/* ================= BREADCRUMBS ================= */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate("/patient/book-doctor")}
        >
          Doctors
        </span>
        <ChevronRight size={14} />
        <span className="text-blue-600 font-bold">
          {doctor?.name || "Doctor Details"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -z-0"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <img
                src={
                  doctor?.image ||
                  `https://ui-avatars.com/api/?name=${doctor?.name}&background=dbeafe&color=2563eb&size=128`
                }
                className="h-36 w-36 rounded-[2rem] object-cover border-4 border-white shadow-2xl"
                alt={doctor?.name}
              />
              <div className="space-y-4">
                <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Top Rated Specialist
                </span>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                  {doctor?.name || "--"}
                </h3>
                <p className="text-blue-600 font-bold flex items-center gap-2 text-lg italic">
                  <Stethoscope size={20} /> {doctor?.specialization || "--"}
                </p>
                <p className="text-slate-500 font-semibold flex items-center gap-2 text-sm break-all">
                  <Mail size={16} className="text-blue-500" />
                  {doctor?.email || "no-email@example.com"}
                </p>
                <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                  <span className="flex items-center gap-1 font-bold text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <Star size={16} fill="currentColor" />{" "}
                    {doctor?.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span>{doctor?.totalReviews || 0} Patient Reviews</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-100 relative z-10 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Experience
                </p>
                <div className="text-slate-800 font-black text-lg">
                  {doctor?.experience || 0} Yrs
                </div>
              </div>
              <div className="border-x border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Consult Fee
                </p>
                <div className="text-blue-600 font-black text-lg">
                  {formatMoney(doctor?.consultationFee || 0)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </p>
                <p
                  className={`text-lg font-black ${doctor?.isActive ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {doctor?.isActive ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              About Doctor
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line break-words max-h-[220px] overflow-y-auto pr-2">
              {doctor?.about || "No information provided."}
            </p>
          </section>

          {/* REVIEWS LIST */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              Patient Stories
            </h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
              {(doctor?.reviews || []).map((rev) => (
                <div
                  key={rev.reviewId}
                  className="bg-slate-50 p-6 rounded-3xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        rev.patientImage ||
                        `https://ui-avatars.com/api/?name=${rev.patientName}`
                      }
                      className="h-10 w-10 rounded-full"
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {rev.patientName}
                      </p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < rev.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-4 italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: BOOKING FLOW */}
        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-blue-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                <CalendarDays size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Schedule Visit
              </h3>
            </div>

            <form className="space-y-6" onSubmit={submit}>
              {/* DATE DROPDOWN PICKER */}
              <div className="space-y-2 relative">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  1. Choose Date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsDateOpen(!isDateOpen);
                    setIsTimeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                    isDateOpen
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                    <CalendarDays size={18} className="text-blue-500" />
                    {selectedDate
                      ? visualDates.find((d) => d.full === selectedDate)
                          ?.formatted
                      : "Select an available date"}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${isDateOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDateOpen && (
                  <div className="absolute top-[105%] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-2">
                      {visualDates.map((date) => (
                        <button
                          key={date.full}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date.full);
                            setSelectedTime("");
                            setIsDateOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl mb-1 transition-all flex items-center justify-between ${
                            selectedDate === date.full
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-50 text-slate-600"
                          }`}
                        >
                          <span className="font-bold text-sm">
                            {date.formatted}
                          </span>
                          {selectedDate === date.full && (
                            <CheckCircle2 size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TIME DROPDOWN PICKER */}
              <div className="space-y-2 relative">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  2. Choose Time Slot
                </label>
                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => {
                    setIsTimeOpen(!isTimeOpen);
                    setIsDateOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                    !selectedDate
                      ? "opacity-50 cursor-not-allowed bg-slate-100"
                      : isTimeOpen
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                    <Clock3 size={18} className="text-blue-500" />
                    {selectedTime || "Select a time slot"}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${isTimeOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isTimeOpen && (
                  <div className="absolute top-[105%] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-2">
                      {timeOptions.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setSelectedTime(time);
                            setIsTimeOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl mb-1 transition-all flex items-center justify-between ${
                            selectedTime === time
                              ? "bg-slate-900 text-white"
                              : "hover:bg-blue-50 text-slate-600"
                          }`}
                        >
                          <span className="font-bold text-sm">{time}</span>
                          {selectedTime === time && <CheckCircle2 size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  3. Appointment Note
                </label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[90px]"
                  placeholder="Reason for visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !doctor?.isActive}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                <ClipboardClock size={24} /> Confirm Booking
              </button>
            </form>
          </div>

          {/* REVIEW SUBMIT */}
          <section className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-slate-900 mb-4 text-center">
              Post Your Review
            </h4>
            <div className="flex gap-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`cursor-pointer transition-all hover:scale-125 ${
                    s <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300"
                  }`}
                  onClick={() => setRating(s)}
                  size={32}
                />
              ))}
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">
                Share your experience
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Review comment..."
                className="w-full p-6 bg-white border-2 border-slate-200 rounded-[1.5rem] text-md font-medium text-black focus:border-black focus:ring-0 outline-none transition-all min-h-[150px] placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={!rating || !reviewComment.trim()}
              className="w-full py-3 bg-white border border-slate-200 text-slate-800 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
            >
              Submit Review
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default PatientDoctorDetailPage;
