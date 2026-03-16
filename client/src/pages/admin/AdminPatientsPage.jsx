import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPatients,
  deletePatient,
  downloadPatientsPDF,
  downloadPatientsExcel,
} from "../../store/admin";
import Pagination from "../../components/Pagination";
import { FileSpreadsheet } from "lucide-react";

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
    const ok = window.confirm("Delete this patient and related data?");
    if (!ok) return;

    dispatch(deletePatient(patientId));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          All Patients
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
                  dispatch(downloadPatientsExcel());
                  setShowDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#1a3f7b] hover:bg-green-50"
              >
                Download Excel
              </button>

              <button
                onClick={() => {
                  dispatch(downloadPatientsPDF());
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
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Total Bookings</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={3}>
                  Loading patients...
                </td>
              </tr>
            ) : patients?.length ? (
              patients.map((patient) => (
                <tr
                  key={patient._id || patient.patientId}
                  className="border-t border-[#e0e8fc] text-[#2e4f86]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          patient.image ||
                          "https://placehold.co/48x48/e6efff/2e5fae?text=PT"
                        }
                        alt={patient.name || "Patient"}
                        className="h-12 w-12 rounded-full border border-[#d7e2fb] object-cover"
                      />
                      <div>
                        <p className="font-semibold text-[#1c3f7a]">
                          {patient.name}
                        </p>
                        <p className="text-sm text-[#6480b3]">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">{patient.totalBookings}</td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleDeletePatient(patient._id || patient.patientId)
                      }
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={3}>
                  No patients found.
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

export default AdminPatientsPage;
