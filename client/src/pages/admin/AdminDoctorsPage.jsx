import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllDoctors,
  toggleDoctorStatus,
  deleteDoctor,
  updateDoctorCommission,
  downloadDoctorsExcel,
  downloadDoctorsPDF,
} from "../../store/admin";
import Pagination from "../../components/Pagination";
import {
  FileSpreadsheet,
  Download,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  UserRoundCog,
  CloudDownload,
} from "lucide-react";

function AdminDoctorsPage() {
  const dispatch = useDispatch();
  const { doctors, loading, currentPage, totalPages } = useSelector(
    (state) => state.admin,
  );

  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(getAllDoctors(page));
  }, [dispatch, page]);

  const handleToggleStatus = (doctorId, nextActive) => {
    dispatch(toggleDoctorStatus({ doctorId, isActive: nextActive }));
  };

  const handleDeleteDoctor = (doctorId) => {
    const ok = window.confirm(
      "Delete this doctor and related data? This action cannot be undone.",
    );
    if (!ok) return;
    dispatch(deleteDoctor(doctorId));
  };

  const handleCommissionChange = (doctorId, value) => {
    const percent = Number(value);
    dispatch(updateDoctorCommission({ doctorId, commission: percent }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Medical Staff
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Manage verified healthcare professionals and commission rates.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" />
            Export Staff List
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
            />
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  dispatch(downloadDoctorsExcel());
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
                  dispatch(downloadDoctorsPDF());
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

      {/* ================= DOCTORS TABLE ================= */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Doctor Profile
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Specialization
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Revenue Flow
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Comm. %
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Management
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                      <p className="text-sm font-bold text-slate-400 animate-pulse">
                        SYNCHRONIZING RECORDS...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : doctors?.length ? (
                doctors.map((doc) => (
                  <tr
                    key={doc.doctorId}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              doc.image ||
                              `https://ui-avatars.com/api/?name=${doc.name}&background=dbeafe&color=2563eb`
                            }
                            className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                            alt={doc.name}
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${doc.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">
                            {doc.name}
                          </p>
                          <p className="text-xs font-bold text-blue-500 mt-0.5">
                            {doc.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-100">
                        {doc.specialization}
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 mt-1.5 ml-1">
                        {doc.experience} Years Experience
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">
                        ₹{doc.totalCommission || 0}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                        Total Admin Share
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="relative inline-block w-24">
                        <select
                          defaultValue={doc.aCommission || 10}
                          onChange={(e) =>
                            handleCommissionChange(doc.doctorId, e.target.value)
                          }
                          className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                          {[5, 10, 15, 20, 25, 30, 35].map((val) => (
                            <option key={val} value={val}>
                              {val}%
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(doc.doctorId, !doc.isActive)
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm
                            ${
                              doc.isActive
                                ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white"
                            }`}
                        >
                          {doc.isActive ? (
                            <ShieldAlert size={14} />
                          ) : (
                            <ShieldCheck size={14} />
                          )}
                          {doc.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDeleteDoctor(doc.doctorId)}
                          className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all group"
                          title="Permanent Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <UserRoundCog
                      size={48}
                      className="mx-auto text-slate-200 mb-4"
                    />
                    <p className="font-bold text-slate-400">
                      No doctors registered in the system yet.
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

export default AdminDoctorsPage;
