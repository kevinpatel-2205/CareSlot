import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, setPage }) => {
  // Don't show if there's only one page
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => {
          setPage(currentPage - 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Indicator Pill */}
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-6 py-2 shadow-sm shadow-blue-100/50">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Page
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-blue-600">
            {currentPage}
          </span>
          <span className="text-xs font-bold text-slate-300">/</span>
          <span className="text-sm font-bold text-slate-500">{totalPages}</span>
        </div>
      </div>

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => {
          setPage(currentPage + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
