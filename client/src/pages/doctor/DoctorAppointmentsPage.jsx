import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileSpreadsheet,
  Search,
  Download,
  ChevronDown,
  User,
  Mail,
  Calendar,
  Clock,
  RefreshCcw,
  XCircle,
  FilePlus,
  FileCheck,
  CloudDownload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  fetchAllAppointments,
  changeAppointmentStatus,
  cancelAppointment,
  downloadAppointmentsExcel,
  downloadAppointmentsPDF,
} from "../../store/doctor";

import { formatDate, statusTone } from "../../lib/format.js";
import Pagination from "../../components/Pagination.jsx";
import { VITE_API_BASE_URL } from "../../lib/env.js";

function DoctorAppointmentsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { appointments, currentPage, totalPages, loading } = useSelector(
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
    const ok = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );
    if (ok) dispatch(cancelAppointment(appointmentId));
  };

  const downloadPrescription = (appointmentId) => {
    window.open(
      `${VITE_API_BASE_URL}/doctor/prescription/${appointmentId}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Appointment Manager
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Track, update, and document patient consultations.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" /> Export
            Schedule
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
            />
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  dispatch(downloadAppointmentsExcel({ status: statusFilter }));
                  setShowDownload(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet size={16} />
                </div>
                Excel Format
              </button>
              <button
                onClick={() => {
                  dispatch(downloadAppointmentsPDF({ status: statusFilter }));
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

      {/* ================= CONTROLS: SEARCH & FILTER ================= */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
            placeholder="Search by Patient Name..."
          />
        </div>

        <div className="relative">
          <select
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {/* ================= APPOINTMENTS TABLE ================= */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Patient
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Date & Time
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Payment
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                      <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                        Updating Ledger...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr
                    key={item._id}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Patient Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">
                            {item.patientId?.userId?.name || "--"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 lowercase">
                            {item.patientId?.userId?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Schedule Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                          <Calendar size={14} className="text-blue-400" />
                          {formatDate(item.appointmentDate)}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                          <Clock size={14} />
                          {item.timeSlot || "--"}
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${statusTone(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Payment Column */}
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-tight px-3 py-1 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                        {item.paymentMethod || "CASH"}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {item.status !== "completed" &&
                        item.status !== "cancelled" ? (
                          <>
                            <button
                              onClick={() => changeStatus(item._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
                            >
                              <RefreshCcw size={14} />
                              Status
                            </button>

                            <button
                              onClick={() => cancelAppt(item._id)}
                              className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all group active:scale-95"
                              title="Cancel Appointment"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            {item.status === "completed" &&
                              (item.prescriptionAdded ? (
                                <button
                                  onClick={() => downloadPrescription(item._id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                >
                                  <FileCheck size={14} />
                                  Get Rx
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/doctor/prescription/${item.patientId._id}/${item._id}`,
                                    )
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
                                >
                                  <FilePlus size={14} />
                                  Write Rx
                                </button>
                              ))}
                            {item.status === "cancelled" && (
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                                Archived
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="bg-slate-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Calendar size={40} />
                      </div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                        No matching appointments found.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export default DoctorAppointmentsPage;
