import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, Users, DollarSign, FileSpreadsheet } from "lucide-react";

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

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          Admin Dashboard
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
                  dispatch(exportAdminExcel());
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-green-50"
              >
                Download Excel
              </button>

              <button
                onClick={() => {
                  dispatch(exportAdminPDF());
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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          icon={ShieldCheck}
          title="Total Doctors"
          value={dashboard?.totalDoctors || 0}
          note="Registered Doctors"
          tone="blue"
        />

        <StatCard
          icon={Users}
          title="Total Patients"
          value={dashboard?.totalPatients || 0}
          note="Registered Patient"
          tone="mint"
        />

        <StatCard
          icon={DollarSign}
          title="Admin Commission"
          value={formatMoney(dashboard?.totalCommission || 0)}
          note="All time"
          tone="rose"
        />
      </div>

      {/* Monthly + Earnings */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        <section className="glass-card p-4 sm:p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Monthly Appointments
          </h3>

          <div className="mt-4 h-80">
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

          <div className="mt-6 space-y-1 text-sm text-[#4d6da3]">
            <span className="font-semibold">
              Total Appointments : {totalAppointments}
            </span>
          </div>
        </section>

        <section className="glass-card p-4 sm:p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Top Earning Doctors
          </h3>

          <div className="mt-4 h-80">
            <TopEarningDoughnutChart
              labels={topEarningLabels}
              values={topEarningValues}
            />
          </div>

          <div className="mt-3 space-y-1 text-sm text-[#4d6da3]">
            {topEarningDoctors.map((item) => (
              <p key={item.doctorId}>
                {item.name}:{" "}
                <span className="font-semibold">
                  {formatMoney(item.totalEarning)}
                </span>
              </p>
            ))}
          </div>
        </section>
      </div>

      {/* Top Booked Doctors */}
      <section className="glass-card p-4 sm:p-5">
        <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
          Top Booked Doctors
        </h3>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div className="h-80">
            <TopBookedPolarChart
              labels={topBookedLabels}
              values={topBookedValues}
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-[#d8e4ff] bg-white/60 p-4 text-sm text-[#4d6da3]">
            {topBookedDoctors.map((item, idx) => (
              <div
                key={item.doctorId}
                className="flex items-center justify-between rounded-xl bg-[#f3f7ff] px-3 py-2"
              >
                <span className="font-semibold text-[#30579f]">
                  {idx + 1}. {item.name}
                </span>
                <span className="font-bold">{item.totalAppointments}</span>
              </div>
            ))}

            {!topBookedDoctors.length && (
              <p className="text-[#6b87b8]">No booking data available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
