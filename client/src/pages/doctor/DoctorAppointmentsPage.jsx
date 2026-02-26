import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllAppointments,
  changeAppointmentStatus,
  cancelAppointment,
} from "../../store/doctor";

import { formatDate, statusTone } from "../../lib/format.js";

function DoctorAppointmentsPage() {
  const dispatch = useDispatch();

  const { appointments } = useSelector((state) => state.doctor);

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllAppointments(statusFilter));
  }, [dispatch, statusFilter]);

  const changeStatus = (appointmentId) => {
    dispatch(changeAppointmentStatus(appointmentId));
  };

  const cancelAppt = (appointmentId) => {
    dispatch(cancelAppointment(appointmentId));
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        All Appointments
      </h2>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px]">
        <select
          className="soft-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="glass-card max-h-[62vh] overflow-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr
                key={item._id}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">
                  {item.patientId?.userId?.name || "--"}
                </td>
                <td className="px-4 py-3">
                  {item.patientId?.userId?.email || "--"}
                </td>
                <td className="px-4 py-3">
                  {formatDate(item.appointmentDate)}
                </td>
                <td className="px-4 py-3">{item.timeSlot || "--"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">
                  {item.paymentMethod || "--"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => changeStatus(item._id)}
                      className="rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-xs font-semibold text-[#345eaa]"
                    >
                      Change Status
                    </button>
                    <button
                      onClick={() => cancelAppt(item._id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!appointments.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={7}>
                  No appointments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;
