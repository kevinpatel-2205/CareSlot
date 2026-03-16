import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAppointments,
  downloadAppointmentsPDF,
  downloadAppointmentsExcel,
} from "../../store/admin";
import { formatDate, statusTone } from "../../lib/format.js";
import { VITE_API_BASE_URL } from "../../lib/env.js";
import Pagination from "../../components/Pagination.jsx";
import { FileSpreadsheet } from "lucide-react";

function AdminAppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, currentPage, totalPages } = useSelector(
    (state) => state.admin,
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          All Appointments
        </h2>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          className="soft-input w-full sm:w-56"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
                  dispatch(downloadAppointmentsExcel({ status: statusFilter }));
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-green-50"
              >
                Download Excel
              </button>

              <button
                onClick={() => {
                  dispatch(downloadAppointmentsPDF({ status: statusFilter }));
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export default AdminAppointmentsPage;
