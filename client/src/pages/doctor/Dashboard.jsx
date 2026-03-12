import { DollarSign, FileSpreadsheet, NotebookTabs, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import StatCard from "../../components/StatCard.jsx";
import EarningsLineChart from "../../components/charts/EarningsLineChart.jsx";
import StatusDonutChart from "../../components/charts/StatusDonutChart.jsx";

import {
  fetchDoctorDashboard,
  fetchUpcomingAppointments,
  fetchDoctorPatients,
  exportDoctorExcel,
  exportDoctorPDF,
} from "../../store/doctor";

import { formatDate, formatMoney, statusTone } from "../../lib/format.js";

function DoctorDashboardPage() {
  const dispatch = useDispatch();

  const { dashboard, upcomingAppointments, patients } = useSelector(
    (state) => state.doctor,
  );

  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorDashboard());
    dispatch(fetchUpcomingAppointments());
    dispatch(fetchDoctorPatients());
  }, [dispatch]);

  const monthly = useMemo(() => {
    const series = dashboard?.monthlyEarnings || {};
    return {
      labels: series.labels || [],
      cash: series.cash || [],
      razorpay: series.razorpay || [],
    };
  }, [dashboard]);

  const totalCash = useMemo(() => {
    return Array.isArray(monthly.cash)
      ? monthly.cash.reduce((sum, value) => sum + value, 0)
      : 0;
  }, [monthly.cash]);

  const totalRazorpay = useMemo(() => {
    return Array.isArray(monthly.razorpay)
      ? monthly.razorpay.reduce((sum, value) => sum + value, 0)
      : 0;
  }, [monthly.razorpay]);

  const appointmentCounts = dashboard?.appointmentCounts || {};

  const totalAppointments = useMemo(() => {
    return (
      (appointmentCounts.completed || 0) +
      (appointmentCounts.pending || 0) +
      (appointmentCounts.cancelled || 0)
    );
  }, [appointmentCounts]);

  const pendingConfirmedAppointments = useMemo(() => {
    return (
      (appointmentCounts.pending || 0) + (appointmentCounts.confirmed || 0)
    );
  }, [appointmentCounts]);

  const upcomingList = useMemo(() => {
    return upcomingAppointments.slice(0, 7);
  }, [upcomingAppointments]);

  const recentPatients = useMemo(() => {
    return patients.slice(0, 5);
  }, [patients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          Doctor Dashboard
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="group flex items-center justify-center gap-2 rounded-2xl border border-[#d8e4ff] bg-white/50 backdrop-blur-md px-3 py-3 sm:px-5 text-[#1a3f7b] shadow-sm transition-all duration-300 hover:bg-green-100 hover:border-green-300 hover:shadow-md active:scale-95"
          >
            <FileSpreadsheet
              size={20}
              className="text-[#30579f] transition-colors duration-300 group-hover:text-green-700"
            />

            <span className="hidden sm:inline font-semibold transition-colors duration-300 group-hover:text-green-700">
              Export
            </span>
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#d8e4ff] bg-white shadow-lg overflow-hidden z-20">
              <button
                onClick={() => {
                  dispatch(exportDoctorExcel());
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-green-50"
              >
                Download Excel
              </button>

              <button
                onClick={() => {
                  dispatch(exportDoctorPDF());
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-blue-50"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
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
          value={pendingConfirmedAppointments}
          note="Pending + Confirmed"
          tone="mint"
        />

        <StatCard
          icon={NotebookTabs}
          title="Completed Appointments"
          value={appointmentCounts.completed || 0}
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

        <StatCard
          icon={DollarSign}
          title="Admin Commission"
          value={formatMoney(dashboard?.totalAdminCommission || 0)}
          note="All time"
          tone="rose"
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
              cash={monthly.cash}
              razorpay={monthly.razorpay}
            />
          </div>

          <div className="mt-6 space-y-1 text-sm text-[#4d6da3]">
            <span className="font-semibold">
              Total Cash: {formatMoney(totalCash)}
            </span>
            <br />
            <span className="font-semibold">
              Total Razorpay: {formatMoney(totalRazorpay)}
            </span>
          </div>
        </section>

        <section className="glass-card p-4 sm:p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Appointment Overview
          </h3>

          <div className="mt-4 h-80">
            <StatusDonutChart
              completed={appointmentCounts.completed || 0}
              pending={appointmentCounts.pending || 0}
              cancelled={appointmentCounts.cancelled || 0}
            />
          </div>

          <div className="mt-4 text-sm font-semibold text-[#4d6da3]">
            Total Appointments: {totalAppointments}
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
                {upcomingList.map((item) => (
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

                {!upcomingAppointments.length && (
                  <tr>
                    <td className="px-4 py-5 text-[#6985b8]" colSpan={5}>
                      No upcoming appointments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-4">
          <h4 className="font-['Averia_Serif_Libre'] text-2xl text-[#1a3f7b]">
            Recent Patients
          </h4>

          <div className="mt-3 space-y-3">
            {recentPatients.map((item) => (
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

            {!patients.length && (
              <p className="text-sm text-[#6381b7]">No patients found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
