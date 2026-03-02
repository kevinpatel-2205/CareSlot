import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, Users, DollarSign } from "lucide-react";

import StatCard from "../../components/StatCard";
import AppointmentsBarChart from "../../components/charts/AppointmentsBarChart";
import TopBookedPolarChart from "../../components/charts/TopBookedPolarChart";
import TopEarningDoughnutChart from "../../components/charts/TopEarningDoughnutChart";
import PageLoader from "../../components/PageLoader";

import { getAdminDashboard } from "../../store/admin";
import { formatMoney } from "../../lib/format";

function Dashboard() {
  const dispatch = useDispatch();

  const { dashboard, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminDashboard());
  }, [dispatch]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Admin Dashboard
      </h2>

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
              values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                const item = (dashboard?.monthlyAppointments || []).find(
                  (m) => m._id === month,
                );
                return item?.totalAppointments || 0;
              })}
            />
          </div>
          <div className="mt-6 space-y-1 text-sm text-[#4d6da3]">
            <span className="font-semibold">
              Total Appointments :{" "}
              {(dashboard?.monthlyAppointments || []).reduce(
                (sum, item) => sum + (item.totalAppointments || 0),
                0,
              )}
            </span>{" "}
          </div>
        </section>

        <section className="glass-card p-4 sm:p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Top Earning Doctors
          </h3>

          <div className="mt-4 h-80">
            <TopEarningDoughnutChart
              labels={(dashboard?.topEarningDoctors || []).map(
                (item) => item.name,
              )}
              values={(dashboard?.topEarningDoctors || []).map(
                (item) => item.totalEarning,
              )}
            />
          </div>

          <div className="mt-3 space-y-1 text-sm text-[#4d6da3]">
            {(dashboard?.topEarningDoctors || []).map((item) => (
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

      {/* Top Booked */}
      <section className="glass-card p-4 sm:p-5">
        <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
          Top Booked Doctors
        </h3>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div className="h-80">
            <TopBookedPolarChart
              labels={(dashboard?.topBookedDoctors || []).map(
                (item) => item.name,
              )}
              values={(dashboard?.topBookedDoctors || []).map(
                (item) => item.totalAppointments,
              )}
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-[#d8e4ff] bg-white/60 p-4 text-sm text-[#4d6da3]">
            {(dashboard?.topBookedDoctors || []).map((item, idx) => (
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

            {!dashboard?.topBookedDoctors?.length && (
              <p className="text-[#6b87b8]">No booking data available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
