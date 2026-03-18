import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingReviews,
  approveReview,
  deleteReview,
  downloadReviewsExcel,
  downloadReviewsPDF,
} from "../../store/admin";
import Pagination from "../../components/Pagination";
import {
  Star,
  CheckCircle2,
  Trash2,
  User,
  Stethoscope,
  AlertCircle,
  ShieldCheck,
  MessageSquareOff,
  FileSpreadsheet,
  Download,
  CloudDownload,
  ChevronDown,
} from "lucide-react";

const AdminReviews = () => {
  const dispatch = useDispatch();

  const { reviews, loading, currentPage, totalPages } = useSelector(
    (state) => state.admin,
  );

  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(getPendingReviews(page));
  }, [dispatch, page]);

  const handleApprove = (reviewId) => {
    dispatch(approveReview(reviewId));
  };

  const handleDelete = (reviewId) => {
    const ok = window.confirm("Delete this review permanently?");
    if (ok) dispatch(deleteReview(reviewId));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Review Moderation
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Verify patient feedback and manage system integrity.
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
                  dispatch(downloadReviewsExcel());
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
                  dispatch(downloadReviewsPDF());
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

      {/* ================= REVIEWS TABLE ================= */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Patient
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Doctor
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Rating & Comment
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  AI Analysis
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
                        Scanning Feedback...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : reviews?.length > 0 ? (
                reviews.map((rev) => (
                  <tr
                    key={rev._id}
                    className="group hover:bg-blue-50/20 transition-colors"
                  >
                    {/* Patient Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            rev?.patientId?.userId?.image ||
                            `https://ui-avatars.com/api/?name=${rev?.patientId?.userId?.name}&background=eff6ff&color=3b82f6`
                          }
                          className="h-10 w-10 rounded-full object-cover border border-slate-100"
                          alt="patient"
                        />
                        <span className="font-black text-slate-900 text-sm">
                          {rev?.patientId?.userId?.name}
                        </span>
                      </div>
                    </td>

                    {/* Doctor Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Stethoscope size={14} className="text-blue-400" />
                        <span className="text-xs font-bold italic">
                          {rev?.doctorId?.userId?.name}
                        </span>
                      </div>
                    </td>

                    {/* Rating & Comment Column */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex gap-0.5 mb-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? "#f59e0b" : "none"}
                            className={
                              i < rev.rating
                                ? "text-amber-500"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 italic">
                        "{rev.comment}"
                      </p>
                      <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* AI Analysis Column */}
                    <td className="px-6 py-4">
                      {rev.aiReason ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {rev.aiReason}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            Verified Safe
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(rev._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>

                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all group active:scale-95 shadow-sm"
                          title="Delete Review"
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
                    <div className="max-w-xs mx-auto">
                      <div className="bg-slate-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <MessageSquareOff size={40} />
                      </div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                        Inbox is clear. No pending reviews.
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
};

export default AdminReviews;
