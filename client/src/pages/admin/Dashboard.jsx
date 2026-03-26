import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  Users,
  IndianRupee,
  FileSpreadsheet,
  ChevronDown,
  Download,
  Trophy,
  TrendingUp,
  CloudDownload,
} from "lucide-react";

import StatCard from "../../components/StatCard";
import AppointmentsBarChart from "../../components/charts/AppointmentsBarChart";
import TopBookedPolarChart from "../../components/charts/TopBookedPolarChart";
import TopEarningDoughnutChart from "../../components/charts/TopEarningDoughnutChart";
import PageLoader from "../../components/PageLoader";

import {
  getAdminDashboard,
  exportAdminExcel,
  exportAdminPDF,
} from "../../store/admin";

import { formatMoney } from "../../lib/format";

function Dashboard() {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.admin);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(getAdminDashboard());
  }, [dispatch]);

  // --- DATA CALCULATIONS (FUNCTIONALITY PRESERVED) ---
  const monthlyAppointments = dashboard?.monthlyAppointments || [];
  const monthlyValues = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
      const item = monthlyAppointments.find((m) => m._id === month);
      return item?.totalAppointments || 0;
    });
  }, [monthlyAppointments]);

  const totalAppointments = useMemo(() => {
    return monthlyAppointments.reduce(
      (sum, item) => sum + (item.totalAppointments || 0),
      0,
    );
  }, [monthlyAppointments]);

  const topEarningDoctors = dashboard?.topEarningDoctors || [];
  const topEarningLabels = useMemo(
    () => topEarningDoctors.map((item) => item.name),
    [topEarningDoctors],
  );
  const topEarningValues = useMemo(
    () => topEarningDoctors.map((item) => item.totalEarning),
    [topEarningDoctors],
  );

  const topBookedDoctors = dashboard?.topBookedDoctors || [];
  const topBookedLabels = useMemo(
    () => topBookedDoctors.map((item) => item.name),
    [topBookedDoctors],
  );
  const topBookedValues = useMemo(
    () => topBookedDoctors.map((item) => item.totalAppointments),
    [topBookedDoctors],
  );

  if (loading) return <PageLoader label="Analyzing medical data..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            System Overview
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Real-time performance analytics for CareSlot.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" />
            Generate Report
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
            />
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  dispatch(exportAdminExcel());
                  setShowDownload(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet size={16} />
                </div>
                Export Excel
              </button>
              <button
                onClick={() => {
                  dispatch(exportAdminPDF());
                  setShowDownload(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download size={16} />
                </div>
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShieldCheck}
          title="Total Doctors"
          value={dashboard?.totalDoctors || 0}
          note="Verified Practitioners"
          tone="blue"
        />
        <StatCard
          icon={Users}
          title="Total Patients"
          value={dashboard?.totalPatients || 0}
          note="Active Members"
          tone="mint"
        />
        <StatCard
          icon={IndianRupee}
          title="Net Revenue"
          value={formatMoney(dashboard?.totalCommission || 0)}
          note="Platform Commission"
          tone="rose"
        />
      </div>

      {/* ================= MAIN ANALYTICS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
        {/* CHART: MONTHLY APPOINTMENTS */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-blue-900 tracking-tight">
                Appointment Trends
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Monthly Traffic
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-black text-sm">
              {totalAppointments} Total
            </div>
          </div>
          <div className="h-80">
            <AppointmentsBarChart
              labels={[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ]}
              values={monthlyValues}
            />
          </div>
        </section>

        {/* CHART: TOP EARNERS */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-black text-blue-900 tracking-tight">
              Revenue Share
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              By Top Doctors
            </p>
          </div>
          <div className="h-64 mb-6">
            <TopEarningDoughnutChart
              labels={topEarningLabels}
              values={topEarningValues}
            />
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pt-4 border-t border-slate-50">
            {topEarningDoctors.map((item) => (
              <div
                key={item.doctorId}
                className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100"
              >
                <span className="text-sm font-bold text-slate-600">
                  {item.name}
                </span>
                <span className="text-sm font-black text-blue-600">
                  {formatMoney(item.totalEarning)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= TOP BOOKED LEADERBOARD ================= */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl shadow-sm">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-blue-900 tracking-tight">
              Booking Leaderboard
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Most Requested Specialists
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div className="h-80">
            <TopBookedPolarChart
              labels={topBookedLabels}
              values={topBookedValues}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {topBookedDoctors.length > 0 ? (
              topBookedDoctors.map((item, idx) => (
                <div
                  key={item.doctorId}
                  className="group flex items-center justify-between p-4 rounded-3xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm
                      ${idx === 0 ? "bg-yellow-100 text-yellow-700" : "bg-white text-slate-400 border border-slate-200"}
                    `}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-blue-900 leading-none">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-bold text-blue-500 uppercase mt-1 tracking-wider">
                        Top Specialist
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-900 font-black text-lg">
                      {item.totalAppointments}{" "}
                      <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Appointments
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 font-medium italic">
                No booking records found.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
