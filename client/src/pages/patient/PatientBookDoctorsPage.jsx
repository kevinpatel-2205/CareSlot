import {
  Info,
  Search,
  Stethoscope,
  UserLock,
  Star,
  IndianRupee,
  MapPin,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SPECIALIZATIONS } from "../../config/specializations.js";
import { fetchAllDoctors } from "../../store/patient";
import { formatMoney } from "../../lib/format.js";

function PatientBookDoctorsPage() {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.patient);

  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return doctors.filter((item) => {
      const okName = (item.name || "")
        .toLowerCase()
        .includes(query.toLowerCase());
      const okSpecialization = specialization
        ? item.specialization === specialization
        : true;
      return okName && okSpecialization;
    });
  }, [doctors, query, specialization]);

  return (
    <div className="space-y-8 pb-10">
      {/* ================= HEADER & SEARCH ================= */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-bold tracking-tight text-[#1a3f7b]">
            Find Your Specialist
          </h2>
          <p className="text-slate-500 mt-2">
            Search from our verified team of expert doctors.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="relative group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              placeholder="Search doctor by name or keyword..."
            />
          </div>

          <div className="relative">
            <select
              className="w-full appearance-none px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-600 shadow-sm cursor-pointer"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DOCTOR CARDS GRID ================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((doctor) => (
            <article
              key={doctor.doctorId}
              className={`relative bg-white rounded-[2.5rem] border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 group ${!doctor.isActive ? "opacity-75 grayscale-[0.5]" : ""}`}
            >
              {/* Fee Badge */}
              <div className="absolute top-6 right-6 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                {formatMoney(doctor.consultationFee || 500)}
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden border border-blue-100 shadow-inner">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Stethoscope size={32} className="text-blue-600" />
                    )}
                  </div>
                  {doctor.isActive && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1a3f7b] leading-tight">
                    {doctor.name}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wide">
                    {doctor.specialization}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-slate-700">
                    {doctor.averageRating || 0}
                  </span>
                  <span>({doctor.totalReviews || 0} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Info size={16} className="text-slate-400" />
                  <span className="truncate">{doctor.email}</span>
                </div>

                <div className="text-xs font-bold uppercase tracking-widest mt-2">
                  Status:{" "}
                  <span
                    className={
                      doctor.isActive ? "text-emerald-600" : "text-rose-600"
                    }
                  >
                    {doctor.isActive ? "Available Now" : "Currently Away"}
                  </span>
                </div>
              </div>

              {doctor.isActive ? (
                <Link
                  to={`/patient/doctors/${doctor.doctorId}`}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  Book Appointment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 font-bold text-slate-400 border border-slate-200"
                >
                  <UserLock className="w-4 h-4" />
                  Currently Offline
                </button>
              )}
            </article>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-600">
              No Doctors Found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Arrow Component for the button
const ArrowRight = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

export default PatientBookDoctorsPage;
