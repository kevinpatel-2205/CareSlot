import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorPatients,
  downloadPatientsExcel,
  downloadPatientsPDF,
} from "../../store/doctor";
import { FileSpreadsheet, Info } from "lucide-react";
import Pagination from "../../components/Pagination";

function DoctorPatientsPage() {
  const dispatch = useDispatch();

  const { patients, currentPage, totalPages } = useSelector(
    (state) => state.doctor,
  );
  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctorPatients(page));
  }, [page, dispatch]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-['Averia_Serif_Libre'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a3f7b]">
          Patients
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

      <div className="glass-card max-h-[62vh] overflow-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Total Appointments</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((item) => (
              <tr
                key={item.patientId}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.image ||
                        "https://placehold.co/44x44/e6efff/2e5fae?text=PT"
                      }
                      alt={item.name}
                      className="h-11 w-11 rounded-full border border-[#d7e2fb] object-cover"
                    />
                    <span className="font-semibold text-[#1c3f7a]">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">{item.totalAppointments}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/doctor/patients/${item.patientId}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-sm font-semibold text-[#345eaa]"
                  >
                    View Details
                    <Info className="w-4 h-4 text-[#345eaa]" />
                  </Link>
                </td>
              </tr>
            ))}

            {!patients.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={4}>
                  No patients found.
                </td>
              </tr>
            ) : null}
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

export default DoctorPatientsPage;
