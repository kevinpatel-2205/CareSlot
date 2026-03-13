import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllAppointments,
  changeAppointmentStatus,
  cancelAppointment,
  downloadAppointmentsExcel,
  downloadAppointmentsPDF,
} from "../../store/doctor";

import { formatDate, statusTone } from "../../lib/format.js";
import Pagination from "../../components/Pagination.jsx";
import { FileSpreadsheet, Search } from "lucide-react";

function DoctorAppointmentsPage() {
  const dispatch = useDispatch();

  const { appointments, currentPage, totalPages } = useSelector(
    (state) => state.doctor,
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(fetchAllAppointments({ status: statusFilter, page }));
  }, [dispatch, statusFilter, page]);

  const filtered = useMemo(
    () =>
      appointments.filter((item) =>
        (item.patientId?.userId?.name || "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [appointments, query],
  );

  const changeStatus = (appointmentId) => {
    dispatch(changeAppointmentStatus(appointmentId));
  };

  const cancelAppt = (appointmentId) => {
    dispatch(cancelAppointment(appointmentId));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          All Appointments
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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7f98c6]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="soft-input !pl-14"
            placeholder="Search by Patient..."
          />
        </label>

        <select
          className="soft-input"
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
      </div>
      <div className="glass-card overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item._id}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">
                  {item.patientId?.userId?.name || "--"}
                </td>
                <td className="px-4 py-3">
                  {item.patientId?.userId?.email || "--"}
                </td>
                <td className="px-4 py-3">
                  {formatDate(item.appointmentDate)}
                </td>
                <td className="px-4 py-3">{item.timeSlot || "--"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">
                  {item.paymentMethod || "--"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => changeStatus(item._id)}
                      className="rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-xs font-semibold text-[#345eaa]"
                    >
                      Change Status
                    </button>
                    <button
                      onClick={() => cancelAppt(item._id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!appointments.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={7}>
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

export default DoctorAppointmentsPage;
