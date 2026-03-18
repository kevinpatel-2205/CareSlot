import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorPatients,
  downloadPatientsExcel,
  downloadPatientsPDF,
} from "../../store/doctor";
import {
  FileSpreadsheet,
  Download,
  UserRound,
  ChevronDown,
  ArrowUpRight,
  Search,
  CloudDownload,
} from "lucide-react";
import Pagination from "../../components/Pagination";

function DoctorPatientsPage() {
  const dispatch = useDispatch();

  const { patients, currentPage, totalPages, loading } = useSelector(
    (state) => state.doctor,
  );
  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorPatients(page));
  }, [page, dispatch]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Patient Directory
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            A complete list of patients under your consultation care.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" /> Export
            Registry
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
            />
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  dispatch(downloadPatientsExcel());
                  setShowDownload(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet size={16} />
                </div>
                Excel Sheet
              </button>
              <button
                onClick={() => {
                  dispatch(downloadPatientsPDF());
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

      {/* ================= PATIENTS TABLE ================= */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Patient Details
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Engagement
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Medical File
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                      <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                        Compiling Records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : patients?.length ? (
                patients.map((item) => (
                  <tr
                    key={item.patientId}
                    className="group hover:bg-blue-50/20 transition-colors"
                  >
                    {/* Patient Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.image ||
                            `https://ui-avatars.com/api/?name=${item.name}&background=eff6ff&color=3b82f6`
                          }
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                          alt={item.name}
                        />
                        <div>
                          <p className="font-black text-slate-900 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-blue-500 mt-0.5">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total Appointments Column */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-black text-slate-700">
                          {item.totalAppointments || 0}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          Total Visits
                        </span>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/doctor/patients/${item.patientId}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-sm"
                      >
                        File Details
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="bg-slate-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <UserRound size={40} />
                      </div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                        No active patients found.
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

export default DoctorPatientsPage;
