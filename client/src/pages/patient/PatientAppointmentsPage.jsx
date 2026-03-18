import {
  Search,
  FileSpreadsheet,
  Download,
  CreditCard,
  ChevronDown,
  Calendar,
  Mail,
  CloudDownload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatientAppointments,
  createRazorpayOrder,
  verifyRazorpayPayment,
  markRazorpayPaymentFailed,
  downloadAppointmentsPDF,
  downloadAppointmentsExcel,
} from "../../store/patient";
import { formatDate, formatMoney, statusTone } from "../../lib/format.js";
import { toast } from "react-toastify";
import { RAZORPAY_KEY_ID, VITE_API_BASE_URL } from "../../lib/env.js";
import Pagination from "../../components/Pagination.jsx";

function PatientAppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, currentPage, totalPages } = useSelector(
    (state) => state.patient,
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    dispatch(fetchPatientAppointments({ status: statusFilter, page }));
  }, [dispatch, statusFilter, page]);

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
        toast.error("Payment setup is incomplete.");
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
        name: "CareSlot Healthcare",
        description: "Consultation Fee Payment",
        order_id: order.id,
        handler: async function (response) {
          await dispatch(
            verifyRazorpayPayment({ ...response, appointmentId }),
          ).unwrap();
          paymentCompleted = true;
          toast.success("Payment successful!");
        },
        modal: {
          ondismiss: async () => {
            if (paymentCompleted) return;
            await syncFailure(order.id);
          },
        },
        theme: { color: "#2563eb" },
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

  const downloadPrescription = (appointmentId) => {
    window.open(
      `${VITE_API_BASE_URL}/patient/prescription/${appointmentId}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl font-bold tracking-tight text-[#1a3f7b]">
            My Appointments
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Track your visits, payments, and prescriptions.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <CloudDownload size={18} className="text-blue-700" />
            Export Data
            <ChevronDown
              size={16}
              className={`transition-transform ${showDownload ? "rotate-180" : ""}`}
            />
          </button>

          {showDownload && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => {
                  dispatch(downloadAppointmentsExcel({ status: statusFilter }));
                  setShowDownload(false);
                }}
                className="w-full px-5 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Excel
                Spreadsheet
              </button>
              <button
                onClick={() => {
                  dispatch(downloadAppointmentsPDF({ status: statusFilter }));
                  setShowDownload(false);
                }}
                className="w-full px-5 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" /> PDF
                Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Search by doctor name..."
          />
        </div>

        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-600"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✅ Confirmed</option>
          <option value="completed">🏁 Completed</option>
          <option value="cancelled">❌ Cancelled</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr
                  key={item._id || item.appointmentId}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shadow-inner">
                        {item.doctorName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.doctorName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail size={12} /> {item.doctorEmail || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-500" />{" "}
                      {formatDate(item.appointmentDate)}
                    </div>
                    <div className="text-xs text-slate-500 font-medium ml-5">
                      {item.timeSlot}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-widest border ${statusTone(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-800">
                      {formatMoney(item.consultationFee)}
                    </div>
                    <div
                      className={`text-[10px] font-bold uppercase ${item.paymentStatus === "paid" ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {item.paymentStatus || "unpaid"} •{" "}
                      {item.paymentMethod || "online"}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {/* PAYMENT BUTTON */}
                      <button
                        disabled={
                          item.paymentStatus === "paid" ||
                          item.status === "cancelled"
                        }
                        onClick={() => handlePayment(item.appointmentId)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm
                          ${
                            item.paymentStatus === "paid"
                              ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-100"
                          }`}
                      >
                        <CreditCard size={14} />{" "}
                        {item.paymentStatus === "paid" ? "Paid" : "Pay Now"}
                      </button>

                      {/* PRESCRIPTION BUTTON */}
                      <button
                        disabled={!item.prescriptionAdded}
                        onClick={() => downloadPrescription(item.appointmentId)}
                        className={`p-2 rounded-xl transition-all border
                          ${
                            item.prescriptionAdded
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                          }`}
                        title="Download Prescription"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Calendar size={48} className="opacity-20 mb-2" />
                      <p className="font-semibold">No appointments found.</p>
                      <p className="text-xs">
                        Try changing the filters or searching for another
                        doctor.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

export default PatientAppointmentsPage;
