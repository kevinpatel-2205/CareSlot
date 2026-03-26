import {
  IndianRupee,
  FileSpreadsheet,
  NotebookTabs,
  Users,
  Calendar,
  ChevronDown,
  Download,
  UserPlus,
  ArrowUpRight,
  CloudDownload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import StatCard from "../../components/StatCard.jsx";
import EarningsLineChart from "../../components/charts/EarningsLineChart.jsx";
import StatusDonutChart from "../../components/charts/StatusDonutChart.jsx";
import PageLoader from "../../components/PageLoader.jsx";

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

  const { dashboard, upcomingAppointments, patients, loading } = useSelector(
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

  const upcomingList = useMemo(
    () => upcomingAppointments.slice(0, 7),
    [upcomingAppointments],
  );
  const recentPatients = useMemo(() => patients.slice(0, 5), [patients]);

  if (loading) return <PageLoader label="Synchronizing Clinic Data..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Clinic Dashboard
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Welcome back, Dr. {dashboard?.name || "Practitioner"}.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" /> Export Records
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
            />
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  dispatch(exportDoctorExcel());
                  setShowDownload(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet size={16} />
                </div>
                Excel Spreadsheet
              </button>
              <button
                onClick={() => {
                  dispatch(exportDoctorPDF());
                  setShowDownload(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download size={16} />
                </div>
                PDF Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= VITAL STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          title="My Patients"
          value={patients.length}
          note="Unique Profiles"
          tone="blue"
        />
        <StatCard
          icon={NotebookTabs}
          title="Incoming"
          value={pendingConfirmedAppointments}
          note="Pending Slots"
          tone="mint"
        />
        <StatCard
          icon={Calendar}
          title="Completed"
          value={appointmentCounts.completed || 0}
          note="Total Visits"
          tone="violet"
        />
        <StatCard
          icon={IndianRupee}
          title="Net Income"
          value={formatMoney(dashboard?.totalEarnings || 0)}
          note="After Comm."
          tone="amber"
        />
        <StatCard
          icon={IndianRupee}
          title="Platform Fee"
          value={formatMoney(dashboard?.totalAdminCommission || 0)}
          note="Commission"
          tone="rose"
        />
      </div>

      {/* ================= ANALYTICS SECTION ================= */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2fr_1fr]">
        <section className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h3 className="text-2xl font-black text-blue-900 tracking-tight">
                Revenue Analytics
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Cash vs Online Performance
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Cash
                </p>
                <p className="text-sm font-black text-blue-600">
                  {formatMoney(totalCash)}
                </p>
              </div>
              <div className="text-right border-l pl-4 border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Online
                </p>
                <p className="text-sm font-black text-emerald-600">
                  {formatMoney(totalRazorpay)}
                </p>
              </div>
            </div>
          </div>
          <div className="h-80">
            <EarningsLineChart
              labels={monthly.labels}
              cash={monthly.cash}
              razorpay={monthly.razorpay}
            />
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-black text-blue-900 tracking-tight">
              Visit Ratios
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Status Distribution
            </p>
          </div>
          <div className="h-64">
            <StatusDonutChart
              completed={appointmentCounts.completed || 0}
              pending={appointmentCounts.pending || 0}
              cancelled={appointmentCounts.cancelled || 0}
            />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center px-4">
            <span className="text-sm font-bold text-slate-500">Volume</span>
            <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full font-black text-sm">
              {totalAppointments} Total
            </span>
          </div>
        </section>
      </div>

      {/* ================= UPCOMING & PATIENTS ================= */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2fr_1fr]">
        {/* TABLE: UPCOMING */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="text-xl font-black text-blue-900 tracking-tight">
              Priority Appointments
            </h4>
            <Link
              to="/doctor/appointments"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View Schedule →
            </Link>
          </div>

          <div className="max-h-[500px] overflow-auto custom-v-scroll">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date/Time
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Method
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {upcomingList.map((item) => (
                  <tr
                    key={item._id}
                    className="group hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm">
                        {item.patientId?.userId?.name || "--"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {item.patientId?.userId?.email?.split("@")[0]}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">
                        {formatDate(item.appointmentDate)}
                      </p>
                      <p className="text-[10px] font-black text-blue-500 uppercase">
                        {item.timeSlot}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                        {item.paymentMethod || "CASH"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${statusTone(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!upcomingAppointments.length && (
              <div className="py-20 text-center">
                <Calendar size={40} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm font-bold text-slate-400">
                  No scheduled sessions for today.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RECENT PATIENTS CARDS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xl font-black text-blue-900 tracking-tight">
              Recent Patients
            </h4>
            <UserPlus size={20} className="text-blue-500" />
          </div>

          <div className="space-y-4">
            {recentPatients.map((item) => (
              <article
                key={item.patientId}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-black text-slate-900 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {item.email}
                    </p>
                  </div>
                  <Link
                    to={`/doctor/patients/${item.patientId}`}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {item.totalAppointments} Lifetime Visits
                  </p>
                </div>
              </article>
            ))}
            {!patients.length && (
              <p className="text-center py-10 text-slate-400 italic text-sm">
                No recent interactions.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
