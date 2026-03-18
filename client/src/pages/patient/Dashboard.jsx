import {
  BookX,
  CalendarClock,
  CheckCircle2,
  NotebookTabs,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import StatCard from "../../components/StatCard.jsx";
import { fetchPatientDashboard } from "../../store/patient";
import { formatDate, statusTone } from "../../lib/format.js";

function PatientDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { dashboard } = useSelector((state) => state.patient);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPatientDashboard());
  }, [dispatch]);

  const stats = useMemo(
    () => [
      {
        label: "Total Bookings",
        value: dashboard?.totalBookings || 0,
        icon: NotebookTabs,
        note: "All time",
        tone: "blue",
      },
      {
        label: "Upcoming",
        value: dashboard?.upcomingBookings || 0,
        icon: CalendarClock,
        note: "Confirmed visits",
        tone: "mint",
      },
      {
        label: "Completed",
        value: dashboard?.completedBookings || 0,
        icon: CheckCircle2,
        note: "Past visits",
        tone: "violet",
      },
      {
        label: "Cancelled",
        value: dashboard?.cancelledBookings || 0,
        icon: BookX,
        note: "Missed slots",
        tone: "amber",
      },
    ],
    [dashboard],
  );

  const upcomingAppointments = useMemo(() => {
    return dashboard?.upcomingAppointments || [];
  }, [dashboard]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
            Hello, {user?.name?.split(" ")[0] || "Patient"}!
          </h2>
          <p className="text-[#6b87b8] mt-2 font-medium">
            Here's what's happening with your health appointments today.
          </p>
        </div>
        <button
          onClick={() => navigate("/patient/book-doctor")}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 w-full md:w-auto"
        >
          <Plus size={18} /> Book New Appointment
        </button>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.label}
            value={stat.value}
            note={stat.note}
            tone={stat.tone}
          />
        ))}
      </div>

      {/* ================= UPCOMING APPOINTMENTS ================= */}
      <section className="bg-white rounded-[2.5rem] border border-[#d9e3fa] overflow-hidden shadow-sm">
        <div className="border-b border-[#f0f4ff] px-8 py-6 flex items-center justify-between bg-white">
          <h3 className="font-['Averia_Serif_Libre'] text-2xl font-semibold text-[#1a3f7b]">
            Upcoming Appointments
          </h3>
          <button
            onClick={() => navigate("/patient/appointments")}
            className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#f8faff] text-[#5f7db2] uppercase text-[11px] font-bold tracking-widest">
              <tr>
                <th className="px-8 py-4">Doctor Details</th>
                <th className="px-8 py-4">Appointment Date</th>
                <th className="px-8 py-4">Time Slot</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0f4ff]">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((item, index) => (
                  <tr
                    key={`${item.appointmentDate}-${index}`}
                    className="group hover:bg-[#fcfdff] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                          {item.doctorImage ? (
                            <img
                              src={item.doctorImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-bold text-xs">
                              Dr.
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a3f7b]">
                            {item.doctorName}
                          </p>
                          <p className="text-xs text-[#7f98c6]">
                            {item.specialization || "Medical Specialist"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-[#2e4f86] font-medium">
                      {formatDate(item.appointmentDate)}
                    </td>

                    <td className="px-8 py-5">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm font-semibold">
                        {item.timeSlot}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-center">
                      <span
                        className={`inline-flex rounded-full border px-4 py-1 text-xs font-black uppercase tracking-wider ${statusTone(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-8 py-12 text-center" colSpan={4}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                        <CalendarClock size={40} />
                      </div>
                      <p className="text-[#6b87b8] font-medium">
                        No upcoming appointments scheduled.
                      </p>
                      <button
                        onClick={() => navigate("/patient/book-doctor")}
                        className="text-blue-600 font-bold text-sm hover:underline"
                      >
                        Find a doctor today
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboardPage;
