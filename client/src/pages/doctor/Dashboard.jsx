import { DollarSign, NotebookTabs, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import StatCard from "../../components/StatCard.jsx";
import EarningsLineChart from "../../components/charts/EarningsLineChart.jsx";
import StatusDonutChart from "../../components/charts/StatusDonutChart.jsx";

import {
  fetchDoctorDashboard,
  fetchUpcomingAppointments,
  fetchDoctorPatients,
} from "../../store/doctor";

import { formatDate, formatMoney, statusTone } from "../../lib/format.js";

function DoctorDashboardPage() {
  const dispatch = useDispatch();

  const { dashboard, upcomingAppointments, patients } = useSelector(
    (state) => state.doctor,
  );

  useEffect(() => {
    dispatch(fetchDoctorDashboard());
    dispatch(fetchUpcomingAppointments());
    dispatch(fetchDoctorPatients());
  }, [dispatch]);

  const monthly = useMemo(() => {
    const series = dashboard?.monthlyEarnings || [];
    return {
      labels: series.map((x) => x.month),
      values: series.map((x) => x.total),
    };
  }, [dashboard]);

  return (
    <div className="space-y-6">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Doctor Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Patients"
          value={patients.length}
          note="Unique patients"
          tone="blue"
        />
        <StatCard
          icon={NotebookTabs}
          title="Total Appointments"
          value={
            (dashboard?.appointmentCounts?.pending || 0) +
            (dashboard?.appointmentCounts?.confirmed || 0)
          }
          note="Pending + Confirmed"
          tone="mint"
        />
        <StatCard
          icon={NotebookTabs}
          title="Completed Appointments"
          value={dashboard?.appointmentCounts?.completed || 0}
          note="Completed visits"
          tone="violet"
        />
        <StatCard
          icon={DollarSign}
          title="Total Earnings"
          value={formatMoney(dashboard?.totalEarnings || 0)}
          note="All time"
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="glass-card p-4 sm:p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Monthly Earnings
          </h3>
          <div className="mt-4 h-80">
            <EarningsLineChart
              labels={monthly.labels}
              values={monthly.values}
            />
          </div>
        </section>

        <section className="glass-card p-4 sm:p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Appointment Overview
          </h3>
          <div className="mt-4 h-80">
            <StatusDonutChart
              completed={dashboard?.appointmentCounts?.completed || 0}
              pending={dashboard?.appointmentCounts?.pending || 0}
              cancelled={dashboard?.appointmentCounts?.cancelled || 0}
            />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="glass-card overflow-hidden">
          <div className="border-b border-[#d9e3fa] px-4 py-3">
            <h4 className="font-['Averia_Serif_Libre'] text-2xl text-[#1a3f7b]">
              Upcoming Appointments
            </h4>
          </div>
          <div className="max-h-[48vh] overflow-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-[#eff4ff] text-[#5f7db2]">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.slice(0, 7).map((item) => (
                  <tr key={item._id} className="border-t border-[#e0e8fc]">
                    <td className="px-4 py-3 text-[#1c3f7a]">
                      {item.patientId?.userId?.name || "--"}
                    </td>
                    <td className="px-4 py-3 text-[#46659b]">
                      {formatDate(item.appointmentDate)}
                    </td>
                    <td className="px-4 py-3 text-[#46659b]">
                      {item.timeSlot}
                    </td>
                    <td className="px-4 py-3 capitalize text-[#46659b]">
                      {item.paymentMethod || "--"}
                    </td>
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
                {!upcomingAppointments.length ? (
                  <tr>
                    <td className="px-4 py-5 text-[#6985b8]" colSpan={5}>
                      No upcoming appointments.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-4">
          <h4 className="font-['Averia_Serif_Libre'] text-2xl text-[#1a3f7b]">
            Recent Patients
          </h4>
          <div className="mt-3 space-y-3">
            {patients.slice(0, 5).map((item) => (
              <article
                key={item.patientId}
                className="rounded-xl border border-[#d7e2fb] bg-white/70 p-3 text-[#36598f]"
              >
                <p className="font-bold text-[#1d3f80]">{item.name}</p>
                <p className="text-sm">{item.email}</p>
                <p className="mt-1 text-xs font-semibold text-[#6381b7]">
                  Total appointments: {item.totalAppointments}
                </p>
                <Link
                  to={`/doctor/patients/${item.patientId}`}
                  className="mt-2 inline-block text-sm font-semibold text-[#2d7cf2]"
                >
                  View Details
                </Link>
              </article>
            ))}
            {!patients.length ? (
              <p className="text-sm text-[#6381b7]">No patients found.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
