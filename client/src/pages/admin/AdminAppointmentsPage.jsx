import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAppointments } from "../../store/admin";
import { formatDate, statusTone } from "../../lib/format.js";

function AdminAppointmentsPage() {
  const dispatch = useDispatch();
  const {appointments} = useSelector((state) => state.admin);

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getAllAppointments(statusFilter));
  }, [dispatch, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          All Appointments
        </h2>

        <select
          className="soft-input w-full max-w-56"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="glass-card overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((item) => (
              <tr
                key={item.appointmentId}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">{item.patientName || "--"}</td>
                <td className="px-4 py-3">{item.doctorName || "--"}</td>
                <td className="px-4 py-3">
                  {formatDate(item.date || item.appointmentDate)}
                </td>
                <td className="px-4 py-3">
                  {item.time || item.timeSlot || "--"}
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

            {!appointments.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={5}>
                  No appointments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;
