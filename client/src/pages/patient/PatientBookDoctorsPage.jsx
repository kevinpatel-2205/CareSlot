import { MapPin, Search, Stethoscope } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SPECIALIZATIONS } from "../../config/specializations.js";
import { fetchAllDoctors } from "../../store/patient";

function PatientBookDoctorsPage() {
  const dispatch = useDispatch();

  const { doctors } = useSelector((state) => state.patient);

  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  // filtering stays local (UI concern)
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
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Book Appointment
      </h2>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
        <label className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7f98c6]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="soft-input !pl-14"
            placeholder="Search doctor by name..."
          />
        </label>

        <select
          className="soft-input"
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doctor) => (
          <article key={doctor.doctorId} className="glass-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-[#d7e7ff] text-[#1f4fa2]">
                <Stethoscope />
              </div>

              <div className="min-w-0">
                <h3 className="text-3xl font-bold text-[#1a3f7b]">
                  {doctor.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#5f7db2]">
                  {doctor.specialization}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[#45659d]">
              <p className="text-sm">{doctor.email}</p>

              <p className="flex items-center gap-2 text-sm">
                <MapPin size={16} /> {doctor.availabilityStatus}
              </p>

              <p className="text-sm font-semibold">
                Status:{" "}
                <span
                  className={
                    doctor.isActive ? "text-emerald-600" : "text-rose-600"
                  }
                >
                  {doctor.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            {doctor.isActive ? (
              <Link
                to={`/patient/doctors/${doctor.doctorId}`}
                className="mt-5 block rounded-xl border border-[#2d7cf2] bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-3 py-2 text-center font-semibold text-white"
              >
                Book Appointment
              </Link>
            ) : (
              <button
                disabled
                className="mt-5 block w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-200 px-3 py-2 text-center font-semibold text-slate-600"
              >
                Booking Disabled
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default PatientBookDoctorsPage;
