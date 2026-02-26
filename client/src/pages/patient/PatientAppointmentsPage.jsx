import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatientAppointments,
  createRazorpayOrder,
  verifyRazorpayPayment,
  markRazorpayPaymentFailed,
} from "../../store/patient";
import { formatDate, formatMoney, statusTone } from "../../lib/format.js";
import { toast } from "react-toastify";
import { RAZORPAY_KEY_ID } from "../../lib/env.js";

function PatientAppointmentsPage() {
  const dispatch = useDispatch();

  const { appointments } = useSelector((state) => state.patient);

  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchPatientAppointments(statusFilter));
  }, [dispatch, statusFilter]);

  const filtered = useMemo(
    () =>
      appointments.filter((item) =>
        (item.doctorName || "").toLowerCase().includes(query.toLowerCase()),
      ),
    [appointments, query],
  );

  const handlePayment = async (appointmentId) => {
    try {
      if (!RAZORPAY_KEY_ID) {
        toast.error("Payment setup is incomplete. Missing Razorpay key.");
        return;
      }

      const orderRes = await dispatch(
        createRazorpayOrder(appointmentId),
      ).unwrap();

      const { order } = orderRes;
      let failureSynced = false;
      let paymentCompleted = false;

      const syncFailure = async (orderId = order.id) => {
        if (failureSynced) return;
        failureSynced = true;

        await dispatch(
          markRazorpayPaymentFailed({
            appointmentId,
            razorpay_order_id: orderId,
          }),
        ).unwrap();
      };

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Doctor Appointment",
        description: "Consultation Fee",
        order_id: order.id,

        handler: async function (response) {
          await dispatch(
            verifyRazorpayPayment({
              ...response,
              appointmentId,
            }),
          ).unwrap();
          paymentCompleted = true;
        },
        modal: {
          ondismiss: async () => {
            if (paymentCompleted) return;
            await syncFailure(order.id);
          },
        },

        theme: {
          color: "#2d7cf2",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        await syncFailure(response?.error?.metadata?.order_id || order.id);
      });
      rzp.open();
    } catch (err) {
      toast.error(err || "Payment failed");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        My Appointments
      </h2>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7f98c6]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="soft-input !pl-14"
            placeholder="Search by doctor..."
          />
        </label>

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

      <div className="glass-card overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#eff4ff] text-[#5f7db2]">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Doctor Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Appointment Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Razorpay</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr
                key={item._id || item.appointmentId}
                className="border-t border-[#e0e8fc] text-[#2e4f86]"
              >
                <td className="px-4 py-3">
                  <div className="font-bold text-[#1d3f80]">
                    {item.doctorName}
                  </div>
                  <div className="text-xs text-[#6f8bc0]">
                    {item.specialization}
                  </div>
                </td>

                <td className="px-4 py-3">{item.doctorEmail || "--"}</td>

                <td className="px-4 py-3">
                  {formatDate(item.appointmentDate)}
                </td>

                <td className="px-4 py-3">{item.timeSlot}</td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="text-xs capitalize text-[#4d6da3]">
                    {item.paymentStatus || "--"} / {item.paymentMethod || "--"}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {formatMoney(item.consultationFee)}
                </td>

                <td className="px-4 py-3">
                  <button
                    disabled={
                      item.paymentStatus === "paid" ||
                      item.status === "cancelled"
                    }
                    onClick={() => handlePayment(item.appointmentId)}
                    className="rounded-lg border border-[#2d7cf2] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d7cf2] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                  >
                    Pay Online
                  </button>
                </td>
              </tr>
            ))}

            {!filtered.length ? (
              <tr>
                <td className="px-4 py-5 text-[#6b87b8]" colSpan={8}>
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

export default PatientAppointmentsPage;
