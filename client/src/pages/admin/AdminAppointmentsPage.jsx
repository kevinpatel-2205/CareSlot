import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAppointments } from "../../store/admin";
import { formatDate, statusTone } from "../../lib/format.js";
import { VITE_API_BASE_URL } from "../../lib/env.js";

function AdminAppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, currentPage, totalPages } = useSelector(
    (state) => state.admin,
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getAllAppointments({ status: statusFilter, page }));
  }, [dispatch, statusFilter, page]);

  const downloadPrescription = (appointmentId) => {
    window.open(
      `${VITE_API_BASE_URL}/admin/prescription/${appointmentId}`,
      "_blank",
    );
  };

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
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prescription</th>
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
                  <span className="text-sm font-semibold text-gray-700">
                    {item.adminCommission && item.adminCommission > 0
                      ? `₹${item.adminCommission}`
                      : "-"}
                  </span>
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
                <td className="px-4 py-3">
                  <button
                    disabled={!item.prescriptionAdded}
                    onClick={() => downloadPrescription(item.appointmentId)}
                    className="rounded-lg border border-green-600 bg-white px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}

            {!appointments.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={6}>
                  No appointments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        <span className="text-sm font-semibold text-[#2e4f86]">
          {currentPage} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;
