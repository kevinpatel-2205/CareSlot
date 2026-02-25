import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPatients, deletePatient } from "../../store/admin";

function AdminPatientsPage() {
  const dispatch = useDispatch();
  const { patients, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllPatients());
  }, [dispatch]);

  const handleDeletePatient = (patientId) => {
    const ok = window.confirm("Delete this patient and related data?");
    if (!ok) return;

    dispatch(deletePatient(patientId));
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        All Patients
      </h2>

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
    </div>
  );
}

export default AdminPatientsPage;
