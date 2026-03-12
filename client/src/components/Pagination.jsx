import React from "react";

const Pagination = ({ currentPage, totalPages, setPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
        className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>

      {/* Page Numbers */}
      <span className="text-sm font-medium text-[#2e4f86]">
        {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
        className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
