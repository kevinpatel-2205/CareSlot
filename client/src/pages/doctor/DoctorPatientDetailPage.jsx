import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatientDetails,
  changeAppointmentStatus,
  cancelAppointment,
} from "../../store/doctor";
import { formatDate, statusTone } from "../../lib/format.js";

function DoctorPatientDetailPage() {
  const { patientId } = useParams();
  const dispatch = useDispatch();

  const { patientDetails } = useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchPatientDetails(patientId));
  }, [dispatch, patientId]);

  const handleChangeStatus = (appointmentId) => {
    dispatch(changeAppointmentStatus(appointmentId));
    dispatch(fetchPatientDetails(patientId));
  };

  const handleCancelAppointment = (appointmentId) => {
    dispatch(cancelAppointment(appointmentId));
    dispatch(fetchPatientDetails(patientId));
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Patient Details
      </h2>

      <section className="glass-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={
              patientDetails?.patientDetails?.image ||
              "https://placehold.co/88x88/e6efff/2e5fae?text=PT"
            }
            alt={patientDetails?.name || "Patient"}
            className="h-20 w-20 rounded-full border border-[#d7e2fb] object-cover"
          />
          <div className="text-[#2e4f86]">
            <p className="text-3xl font-bold text-[#1c3f7a]">
              {patientDetails?.patientDetails?.name || "--"}
            </p>
            <p className="text-sm">
              {patientDetails?.patientDetails?.email || "--"}
            </p>
            <p className="text-sm">
              Age: {patientDetails?.patientDetails?.age ?? "--"}
            </p>
          </div>
        </div>
      </section>

      <div className="glass-card max-h-[58vh] overflow-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patientDetails?.appointments?.map((apt) => (
              <tr
                key={apt._id}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">{formatDate(apt.appointmentDate)}</td>
                <td className="px-4 py-3">{apt.timeSlot}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                      apt.status,
                    )}`}
                  >
                    {apt.status}
                  </span>
                </td>
                <td className="px-4 py-3">{apt.paymentStatus}</td>
                <td className="px-4 py-3">{apt.paymentMethod}</td>
                {/* <td className="px-4 py-3">{apt.consultationFee}</td> */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    {/* Main Fee */}
                    <span className="font-semibold text-[#1c3f7a]">
                      ₹{apt.consultationFee}
                    </span>

                    {/* Admin Commission */}
                    <span className="text-xs text-gray-500">
                      Admin:{" "}
                      {apt.adminCommission ? `₹${apt.adminCommission}` : "-"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{apt.notes || "--"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleChangeStatus(apt._id)}
                      className="rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-xs font-semibold text-[#345eaa]"
                    >
                      Change Status
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(apt._id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!patientDetails?.appointments?.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={8}>
                  No appointments found for this patient.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorPatientDetailPage;
