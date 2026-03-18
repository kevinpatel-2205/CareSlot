import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPatients,
  deletePatient,
  downloadPatientsPDF,
  downloadPatientsExcel,
} from "../../store/admin";
import Pagination from "../../components/Pagination";
import {
  FileSpreadsheet,
  Download,
  Trash2,
  UserRound,
  ChevronDown,
  CloudDownload,
} from "lucide-react";

function AdminPatientsPage() {
  const dispatch = useDispatch();
  const { patients, loading, currentPage, totalPages } = useSelector(
    (state) => state.admin,
  );
  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(getAllPatients(page));
  }, [dispatch, page]);

  const handleDeletePatient = (patientId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this patient? This will remove all their records.",
    );
    if (!ok) return;
    dispatch(deletePatient(patientId));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Patient Registry
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Oversee registered patients and their engagement history.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" /> Export Data
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
                Excel Format
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
                PDF Format
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
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Activity
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                      <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-tighter">
                        Syncing Records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : patients?.length ? (
                patients.map((patient) => (
                  <tr
                    key={patient._id || patient.patientId}
                    className="group hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            patient.image ||
                            `https://ui-avatars.com/api/?name=${patient.name}&background=eff6ff&color=3b82f6`
                          }
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                          alt={patient.name}
                        />
                        <div>
                          <p className="font-black text-slate-900 leading-tight">
                            {patient.name}
                          </p>
                          <p className="text-xs font-bold text-blue-500 mt-0.5">
                            {patient.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                        <span className="text-xs font-black text-slate-700">
                          {patient.totalBookings || 0}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          Appointments
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleDeletePatient(patient._id || patient.patientId)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all group font-bold text-xs active:scale-95"
                      >
                        <Trash2 size={14} />
                        Remove Access
                      </button>
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
                      <p className="font-bold text-slate-400">
                        The patient registry is currently empty.
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

export default AdminPatientsPage;
