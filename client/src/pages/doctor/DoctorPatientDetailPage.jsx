import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatientDetails,
  changeAppointmentStatus,
  cancelAppointment,
} from "../../store/doctor";
import { formatDate, statusTone } from "../../lib/format.js";
import { VITE_API_BASE_URL } from "../../lib/env.js";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  RefreshCcw,
  XCircle,
  FileCheck,
  FilePlus,
} from "lucide-react";
import PageLoader from "../../components/PageLoader.jsx";

function DoctorPatientDetailPage() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientDetails, loading } = useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchPatientDetails(patientId));
  }, [dispatch, patientId]);

  const handleChangeStatus = async (appointmentId) => {
    await dispatch(changeAppointmentStatus(appointmentId));
    dispatch(fetchPatientDetails(patientId));
  };

  const handleCancelAppointment = async (appointmentId) => {
    const ok = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );
    if (!ok) return;
    await dispatch(cancelAppointment(appointmentId));
    dispatch(fetchPatientDetails(patientId));
  };

  const downloadPrescription = (appointmentId) => {
    window.open(
      `${VITE_API_BASE_URL}/doctor/prescription/${appointmentId}`,
      "_blank",
    );
  };

  const patient = patientDetails?.patientDetails;
  const appointments = patientDetails?.appointments || [];

  if (loading && !patient)
    return <PageLoader label="Fetching Patient History..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Patient File
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">
            Comprehensive medical history and consultation logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        {/* LEFT COLUMN: PATIENT IDENTITY CARD */}
        <aside className="space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm overflow-hidden sticky top-24">
            <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-400"></div>
            <div className="px-6 pb-8 text-center">
              <div className="relative inline-block -mt-12 mb-4">
                <img
                  src={
                    patient?.image ||
                    `https://ui-avatars.com/api/?name=${patient?.name}&background=dbeafe&color=2563eb&size=128`
                  }
                  className="h-24 w-24 rounded-[2rem] object-cover border-4 border-white shadow-xl mx-auto"
                  alt="Patient"
                />
              </div>
              <h3 className="text-2xl font-black text-blue-900 leading-tight">
                {patient?.name || "--"}
              </h3>
              <p className="text-blue-500 font-bold text-xs uppercase tracking-widest mt-1">
                {patient?.email}
              </p>

              <div className="mt-8 space-y-4 text-left">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar size={18} className="text-blue-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Age / DOB
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {patient?.age || "--"} Yrs •{" "}
                      {patient?.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString()
                        : "--"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Phone size={18} className="text-blue-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Contact Number
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {patient?.phone || "--"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-rose-500" />
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Medical History
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    {patient?.medicalHistory || "No previous history reported."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN: APPOINTMENT LEDGER */}
        <div className="space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-xl font-black text-blue-900 flex items-center gap-2">
                <ClipboardList className="text-blue-500" /> History Ledger
              </h4>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {appointments.length} Total Records
              </span>
            </div>

            <div className="overflow-x-auto custom-v-scroll max-h-[70vh]">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Date & Slot
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Visit Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Fees & Share
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map((apt) => (
                    <tr
                      key={apt._id}
                      className="group hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">
                            {formatDate(apt.appointmentDate)}
                          </span>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                            {apt.timeSlot}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${statusTone(apt.status)}`}
                        >
                          {apt.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">
                            ₹{apt.consultationFee}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Comm: ₹{apt.adminCommission || "0"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${apt.paymentStatus === "paid" ? "bg-emerald-500" : "bg-rose-500"}`}
                          />
                          <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">
                            {apt.paymentStatus} ({apt.paymentMethod || "CASH"})
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {apt.status !== "completed" &&
                          apt.status !== "cancelled" ? (
                            <>
                              <button
                                onClick={() => handleChangeStatus(apt._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
                              >
                                <RefreshCcw size={14} /> Status
                              </button>

                              <button
                                onClick={() => handleCancelAppointment(apt._id)}
                                className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all group active:scale-95"
                                title="Cancel Visit"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              {apt.status === "completed" &&
                                (apt.prescriptionAdded ? (
                                  <button
                                    onClick={() =>
                                      downloadPrescription(apt._id)
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                  >
                                    <FileCheck size={14} /> Get Rx
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/doctor/prescription/${patientId}/${apt._id}`,
                                      )
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
                                  >
                                    <FilePlus size={14} /> Write Rx
                                  </button>
                                ))}
                              {apt.status === "cancelled" && (
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                                  Archived
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="py-20 text-center">
                  <ClipboardList
                    size={40}
                    className="mx-auto text-slate-200 mb-2"
                  />
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                    No records found for this patient.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DoctorPatientDetailPage;
