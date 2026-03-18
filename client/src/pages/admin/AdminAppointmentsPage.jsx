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
import {
  FileSpreadsheet,
  Download,
  Calendar,
  User,
  Stethoscope,
  Filter,
  ChevronDown,
  FileText,
  CloudDownload,
} from "lucide-react";

function AdminAppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, currentPage, totalPages, loading } = useSelector(
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Appointment Logs
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Monitor and manage all medical consultations across the network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="relative group hidden md:block">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
            />
            <select
              className="pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-sm text-sm"
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
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownload(!showDownload)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <CloudDownload size={18} className="text-blue-700" />
              <span className="hidden sm:inline">Export Data</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
              />
            </button>

            {showDownload && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    dispatch(
                      downloadAppointmentsExcel({ status: statusFilter }),
                    );
                    setShowDownload(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileSpreadsheet size={16} />
                  </div>
                  Excel Report
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
                  PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= APPOINTMENTS TABLE ================= */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Patient & Doctor
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Schedule
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Admin Share
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Records
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
                        Fetching Logs...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : appointments?.length ? (
                appointments.map((item) => (
                  <tr
                    key={item.appointmentId}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Patient & Doctor Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-900">
                          <User size={14} className="text-blue-500" />
                          <span className="font-black text-sm">
                            {item.patientName || "--"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Stethoscope size={14} className="text-slate-400" />
                          <span className="text-xs font-bold italic">
                            {item.doctorName || "--"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Schedule Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700">
                          {formatDate(item.date || item.appointmentDate)}
                        </span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">
                          {item.time || item.timeSlot || "--"}
                        </span>
                      </div>
                    </td>

                    {/* Commission Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">
                          {item.adminCommission > 0
                            ? `₹${item.adminCommission}`
                            : "--"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          Net Earned
                        </span>
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

                    {/* Prescription Column */}
                    <td className="px-6 py-4 text-center">
                      <button
                        disabled={!item.prescriptionAdded}
                        onClick={() => downloadPrescription(item.appointmentId)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm
                          ${
                            item.prescriptionAdded
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white"
                              : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                          }`}
                      >
                        <FileText size={14} />
                        {item.prescriptionAdded ? "Download" : "Unavailable"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Calendar
                      size={48}
                      className="mx-auto text-slate-200 mb-4"
                    />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                      No appointment logs found for this filter.
                    </p>
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

export default AdminAppointmentsPage;
