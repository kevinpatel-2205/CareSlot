import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadReviewsExcel,
  downloadReviewsPDF,
  fetchDoctorReviews,
} from "../../store/doctor";
import Pagination from "../../components/Pagination";
import {
  FileSpreadsheet,
  Download,
  Star,
  Users,
  MessageSquare,
  ChevronDown,
  CloudDownload,
} from "lucide-react";
import PageLoader from "../../components/PageLoader.jsx";

const DoctorReviews = () => {
  const dispatch = useDispatch();

  const { review, loading, currentPage, totalPages } = useSelector(
    (state) => state.doctor,
  );
  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorReviews(page));
  }, [dispatch, page]);

  const reviews = review?.reviews || [];
  const totalReviews = review?.totalReviews || 0;
  const averageRating = review?.averageRating || 0;

  if (loading && reviews.length === 0)
    return <PageLoader label="Analyzing Patient Feedback..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ================= HEADER & EXPORT ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Patient Feedback
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Monitor your clinical reputation and patient satisfaction.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" />
            <span className="text-slate-700">Export Reviews</span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-300 ${showDownload ? "rotate-180" : ""}`}
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
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
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
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Download size={16} />
                </div>
                PDF Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= SUMMARY STATS ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm flex items-center justify-between overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 text-blue-50 opacity-10">
            <Star size={180} fill="currentColor" />
          </div>
          <div className="relative z-10 flex items-center gap-8">
            <div className="text-center">
              <p className="text-6xl font-black text-blue-900 tracking-tighter">
                {averageRating}
              </p>
              <div className="flex gap-1 mt-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(averageRating) ? "#f59e0b" : "none"}
                    className={
                      i < Math.round(averageRating)
                        ? "text-amber-500"
                        : "text-slate-200"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="h-16 w-px bg-slate-100 hidden sm:block" />
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Clinic Score
              </h3>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Average Patient Rating
              </p>
            </div>
          </div>
        </div>

        {/* Using Deep Indigo instead of Dark Slate/Black */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-900/20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-6 top-6 bg-white/10 p-3 rounded-2xl">
            <Users size={24} className="text-blue-300" />
          </div>
          <p className="text-4xl font-black text-white">{totalReviews}</p>
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mt-2">
            Verified Reviews
          </p>
        </div>
      </section>

      {/* ================= REVIEWS LIST ================= */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-bold text-slate-400">
              No public feedback recorded yet.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <article
              key={rev._id}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative">
                  <img
                    src={
                      rev?.patientImage ||
                      `https://ui-avatars.com/api/?name=${rev?.patientName}&background=eff6ff&color=3b82f6`
                    }
                    alt="patient"
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white">
                    <Users size={12} />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 leading-none">
                        {rev?.patientName || "Anonymous Patient"}
                      </h4>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
                        {rev?.patientEmail}
                      </p>
                    </div>
                    <div className="flex gap-0.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? "#f59e0b" : "none"}
                          className={
                            i < rev.rating ? "text-amber-500" : "text-slate-200"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-50 relative">
                    <p className="text-slate-700 font-medium italic leading-relaxed">
                      "
                      {rev?.comment ||
                        "Consultation was completed without additional written notes."}
                      "
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Verified Consultation
                      </span>
                    </div>
                    <time className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
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

export default DoctorReviews;
