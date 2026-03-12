import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorReviews } from "../../store/doctor";

const DoctorReviews = () => {
  const dispatch = useDispatch();

  const { review, loading, currentPage, totalPages } = useSelector(
    (state) => state.doctor,
  );
  const [page, setPage] = useState(1);

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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-[#1e3a8a]">
        Doctor Reviews
      </h2>

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

          <div className="hidden md:block h-12 w-px bg-gray-300"></div>

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
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        <span className="text-sm font-medium text-gray-700">
          {currentPage} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DoctorReviews;
