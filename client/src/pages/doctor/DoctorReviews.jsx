import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadReviewsExcel,
  downloadReviewsPDF,
  fetchDoctorReviews,
} from "../../store/doctor";
import Pagination from "../../components/Pagination";
import { FileSpreadsheet } from "lucide-react";

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

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          Doctor Reviews
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
                  dispatch(downloadReviewsExcel());
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-green-50"
              >
                Download Excel
              </button>

              <button
                onClick={() => {
                  dispatch(downloadReviewsPDF());
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

      <div className="bg-gradient-to-r from-[#eef4ff] to-[#f7faff] border border-[#e3eafc] rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-yellow-500">
              {averageRating}
            </div>

            <div>
              <div className="text-yellow-500 text-lg">
                {"⭐".repeat(Math.round(averageRating))}
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-[#45659d]">
              {totalReviews}
            </div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews available</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white shadow rounded-lg p-5 flex gap-4 items-start"
            >
              <img
                src={
                  rev?.patientImage ||
                  "https://placehold.co/96x96/e6efff/2e5fae?text=AD"
                }
                alt="patient"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {rev?.patientName || "Patient"}
                </h4>

                <p className="text-xs text-gray-400 mt-2">
                  {rev?.patientEmail}
                </p>

                <p className="text-sm text-yellow-500 mt-1">
                  {renderStars(rev.rating)}
                </p>

                <p className="text-gray-600 text-sm mt-2">
                  {rev?.comment || "No comment provided"}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

export default DoctorReviews;
