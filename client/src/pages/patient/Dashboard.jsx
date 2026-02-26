import { CalendarClock, CheckCircle2, NotebookTabs } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatCard from "../../components/StatCard.jsx";
import { fetchPatientDashboard } from "../../store/patient";
import { formatDate, statusTone } from "../../lib/format.js";

function PatientDashboardPage() {
  const dispatch = useDispatch();

  const { dashboard } = useSelector((state) => state.patient);

  useEffect(() => {
    dispatch(fetchPatientDashboard());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Patient Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          icon={NotebookTabs}
          title="Total Bookings"
          value={dashboard?.totalBookings || 0}
          tone="blue"
        />
        <StatCard
          icon={CalendarClock}
          title="Upcoming"
          value={dashboard?.upcomingBookings || 0}
          note="Pending + Confirmed"
          tone="mint"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={dashboard?.completedBookings || 0}
          note="Finished visits"
          tone="violet"
        />
        <StatCard
          title="Cancelled"
          value={dashboard?.cancelledBookings || 0}
          note="Cancelled bookings"
          tone="amber"
        />
      </div>

      <section className="glass-card overflow-auto">
        <div className="border-b border-[#d9e3fa] px-4 py-3">
          <h3 className="font-['Averia_Serif_Libre'] text-2xl text-[#1a3f7b]">
            Upcoming Appointments
          </h3>
        </div>

        <table className="min-w-full text-left">
          <thead className="bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {(dashboard?.upcomingAppointments || []).map((item, index) => (
              <tr
                key={`${item.appointmentDate}-${index}`}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">{item.doctorName}</td>
                <td className="px-4 py-3">
                  {formatDate(item.appointmentDate)}
                </td>
                <td className="px-4 py-3">{item.timeSlot}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}

            {!dashboard?.upcomingAppointments?.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={4}>
                  No upcoming appointments.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default PatientDashboardPage;
