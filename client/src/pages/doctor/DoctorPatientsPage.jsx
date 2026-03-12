import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorPatients } from "../../store/doctor";
import { Info } from "lucide-react";

function DoctorPatientsPage() {
  const dispatch = useDispatch();

  const { patients, error, currentPage, totalPages } = useSelector(
    (state) => state.doctor,
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDoctorPatients(page));
  }, [page, dispatch]);

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Patients
      </h2>

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
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        <span className="text-sm font-medium text-[#2e4f86]">
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
}

export default DoctorPatientsPage;
