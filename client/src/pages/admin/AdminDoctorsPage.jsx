import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllDoctors,
  toggleDoctorStatus,
  deleteDoctor,
} from "../../store/admin";

function AdminDoctorsPage() {
  const dispatch = useDispatch();
  const { doctors, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllDoctors());
  }, [dispatch]);

  const handleToggleStatus = (doctorId, nextActive) => {
    dispatch(toggleDoctorStatus({ doctorId, isActive: nextActive }));
  };

  const handleDeleteDoctor = (doctorId) => {
    const ok = window.confirm("Delete this doctor and related data?");
    if (!ok) return;

    dispatch(deleteDoctor(doctorId));
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        All Doctors
      </h2>

      <div className="glass-card overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Total Commission</th>
              <th className="px-4 py-3">Active/Deactive</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={5}>
                  Loading doctors...
                </td>
              </tr>
            ) : doctors?.length ? (
              doctors.map((doc) => (
                <tr
                  key={doc.doctorId}
                  className="border-t border-[#e0e8fc] text-[#2e4f86]"
                >
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

                  <td className="px-4 py-3">{doc.specialization}</td>
                  <td className="px-4 py-3">{doc.experience} yrs</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1c3f7a]">
                      ₹{doc.totalCommission || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          doc.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {doc.isActive ? "Active" : "Inactive"}
                      </span>

                      <button
                        onClick={() =>
                          handleToggleStatus(doc.doctorId, !doc.isActive)
                        }
                        className="rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-sm font-semibold text-[#345eaa]"
                      >
                        {doc.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDeleteDoctor(doc.doctorId)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={5}>
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDoctorsPage;
