import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingReviews,
  approveReview,
  deleteReview,
} from "../../store/admin";

const AdminReviews = () => {
  const dispatch = useDispatch();

  const { reviews, loading, currentPage, totalPages } = useSelector(
    (state) => state.admin,
  );

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getPendingReviews(page));
  }, [dispatch, page]);

  const handleApprove = (reviewId) => {
    dispatch(approveReview(reviewId));
  };

  const handleDelete = (reviewId) => {
    dispatch(deleteReview(reviewId));
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-[#1e3a8a]">
        Manage Reviews
      </h2>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No pending reviews</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">AI Reason</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={rev?.patientId?.userId?.image || "/default-user.png"}
                      alt="patient"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span>{rev?.patientId?.userId?.name}</span>
                  </td>

                  <td className="p-4">{rev?.doctorId?.userId?.name}</td>

                  <td className="p-4 text-yellow-500">
                    {renderStars(rev.rating)}
                  </td>

                  <td className="p-4 text-gray-600">{rev.comment}</td>

                  <td className="p-4">
                    {rev.aiReason ? (
                      <span className="text-red-500 text-sm">
                        {rev.aiReason}
                      </span>
                    ) : (
                      <span className="text-green-600 text-sm">No issues</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 flex gap-3 justify-center">
                    <button
                      onClick={() => handleApprove(rev._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleDelete(rev._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        <span className="text-sm font-semibold text-gray-700">
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

export default AdminReviews;
