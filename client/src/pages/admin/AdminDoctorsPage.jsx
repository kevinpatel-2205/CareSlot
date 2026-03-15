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
import { FileSpreadsheet } from "lucide-react";

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
    const ok = window.confirm("Delete this doctor and related data?");
    if (!ok) return;
    dispatch(deleteDoctor(doctorId));
  };

  const handleCommissionChange = (doctorId, value) => {
    const percent = Number(value);
    dispatch(updateDoctorCommission({ doctorId, commission: percent }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          All Doctors
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
                  dispatch(downloadDoctorsExcel());
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-green-50"
              >
                Download Excel
              </button>

              <button
                onClick={() => {
                  dispatch(downloadDoctorsPDF());
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

      <div className="glass-card overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Total Commission</th>
              <th className="px-4 py-3">Admin Commission %</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={6}>
                  Loading doctors...
                </td>
              </tr>
            ) : doctors?.length ? (
              doctors.map((doc) => (
                <tr
                  key={doc.doctorId}
                  className="border-t border-[#e0e8fc] text-[#2e4f86]"
                >
                  {/* Doctor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          doc.image ||
                          "https://placehold.co/48x48/e6efff/2e5fae?text=DR"
                        }
                        alt={doc.name || "Doctor"}
                        className="h-12 w-12 rounded-full border border-[#d7e2fb] object-cover"
                      />
                      <div>
                        <p className="font-semibold text-[#1c3f7a]">
                          {doc.name}
                        </p>
                        <p className="text-sm text-[#6480b3]">{doc.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* specialization */}
                  <td className="px-4 py-3">{doc.specialization}</td>

                  {/* experience */}
                  <td className="px-4 py-3">{doc.experience} yrs</td>

                  {/* total commission */}
                  <td className="px-4 py-3 font-semibold text-[#1c3f7a]">
                    ₹{doc.totalCommission || 0}
                  </td>

                  {/* admin commission */}
                  <td className="px-4 py-3">
                    <select
                      defaultValue={doc.aCommission || 10}
                      onChange={(e) =>
                        handleCommissionChange(doc.doctorId, e.target.value)
                      }
                      className="rounded-lg border border-[#c4d6fb] bg-white px-2 py-1 text-sm font-semibold text-[#345eaa]"
                    >
                      {[5, 10, 15, 20, 25, 30, 35].map((val) => (
                        <option key={val} value={val}>
                          {val}%
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* status buttons */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(doc.doctorId, !doc.isActive)
                        }
                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${
                          doc.isActive
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-gray-400 hover:bg-gray-500"
                        }`}
                      >
                        {doc.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDeleteDoctor(doc.doctorId)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={6}>
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export default AdminDoctorsPage;
