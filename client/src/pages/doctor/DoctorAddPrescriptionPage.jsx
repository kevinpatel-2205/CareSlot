import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientDetails, addPrescription } from "../../store/doctor";
import {
  Pill,
  Plus,
  Trash2,
  User,
  ClipboardList,
  Clock,
  Calendar,
  Save,
  History,
  FileText,
} from "lucide-react";
import PageLoader from "../../components/PageLoader.jsx";

function DoctorAddPrescriptionPage() {
  const { patientId, appointmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientDetails, loading } = useSelector((state) => state.doctor);

  const [medicines, setMedicines] = useState([
    { medicineName: "", dosage: "", timing: [], mealTime: "", duration: "" },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    dispatch(fetchPatientDetails(patientId));
  }, [dispatch, patientId]);

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const toggleTiming = (index, time) => {
    const updated = [...medicines];
    const currentTimings = updated[index].timing;
    if (currentTimings.includes(time)) {
      updated[index].timing = currentTimings.filter((t) => t !== time);
    } else {
      updated[index].timing = [...currentTimings, time];
    }
    setMedicines(updated);
  };

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { medicineName: "", dosage: "", timing: [], mealTime: "", duration: "" },
    ]);
  };

  const removeMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const result = await dispatch(
      addPrescription({
        appointmentId,
        prescriptionData: { medicines, additionalNotes },
      }),
    );
    if (addPrescription.fulfilled.match(result)) {
      setTimeout(() => navigate(`/doctor/patients/${patientId}`), 1000);
    }
  };

  const patient = patientDetails?.patientDetails;

  if (loading && !patient)
    return <PageLoader label="Opening Patient File..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
            Write Prescription
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Documenting care for session #
            {appointmentId.slice(-6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* PATIENT BRIEF CARD */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <img
            src={
              patient?.image ||
              `https://ui-avatars.com/api/?name=${patient?.name}&background=dbeafe&color=2563eb`
            }
            className="h-28 w-28 rounded-3xl object-cover border-4 border-white shadow-xl"
            alt={patient?.name}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Patient Name
              </p>
              <p className="text-xl font-black text-blue-900">
                {patient?.name || "--"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Biological Details
              </p>
              <p className="text-sm font-bold text-slate-700 capitalize">
                {patient?.gender || "Not specified"} •{" "}
                {patient?.dateOfBirth
                  ?.split("T")[0]
                  .split("-")
                  .reverse()
                  .join("/")}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-1 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                Clinical History
              </p>
              <p className="text-xs font-bold text-slate-500 italic line-clamp-2">
                {patient?.medicalHistory || "No previous history recorded."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICINE BUILDER */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-blue-900 flex items-center gap-3">
            <Pill className="text-blue-500" /> Medications
          </h3>
          <button
            onClick={addMedicineRow}
            className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Medicine
          </button>
        </div>

        <div className="space-y-6">
          {medicines.map((med, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:border-blue-200 transition-colors animate-in slide-in-from-bottom-4 duration-300"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                    {index + 1}
                  </div>
                  <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">
                    Line Item
                  </h4>
                </div>
                {medicines.length > 1 && (
                  <button
                    onClick={() => removeMedicineRow(index)}
                    className="text-rose-400 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Name */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Medicine Name
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="e.g. Amoxicillin 500mg"
                    value={med.medicineName}
                    onChange={(e) =>
                      handleMedicineChange(
                        index,
                        "medicineName",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Dosage Form
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="e.g. 1 Tablet / 5ml"
                    value={med.dosage}
                    onChange={(e) =>
                      handleMedicineChange(index, "dosage", e.target.value)
                    }
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Duration
                  </label>
                  <div className="relative group">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                      placeholder="e.g. 5 Days"
                      value={med.duration}
                      onChange={(e) =>
                        handleMedicineChange(index, "duration", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Timing Chips */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Administration Timing
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["morning", "afternoon", "night"].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => toggleTiming(index, time)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                          med.timing.includes(time)
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                            : "bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal Time */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Meal Relation
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                      value={med.mealTime}
                      onChange={(e) =>
                        handleMedicineChange(index, "mealTime", e.target.value)
                      }
                    >
                      <option value="">Select Timing</option>
                      <option value="before_meal">
                        Before Meals (Empty Stomach)
                      </option>
                      <option value="after_meal">After Meals</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADDITIONAL NOTES */}
      <section className="space-y-4">
        <div className="px-2">
          <h3 className="text-2xl font-black text-blue-900 flex items-center gap-3">
            <FileText className="text-blue-500" /> Clinical Notes
          </h3>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <textarea
            placeholder="Describe lifestyle changes, follow-up instructions, or diagnostic warnings..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[150px] placeholder:text-slate-300 italic"
          />
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="w-full md:w-auto px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-xl transition-all active:scale-[0.98] shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3"
        >
          <Save size={24} /> Finalize Prescription
        </button>
      </div>
    </div>
  );
}

export default DoctorAddPrescriptionPage;
