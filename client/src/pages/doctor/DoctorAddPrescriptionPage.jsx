import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientDetails, addPrescription } from "../../store/doctor";
import { useNavigate } from "react-router-dom";

function DoctorAddPrescriptionPage() {
  const { patientId, appointmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientDetails } = useSelector((state) => state.doctor);

  const [medicines, setMedicines] = useState([
    {
      medicineName: "",
      dosage: "",
      timing: [],
      mealTime: "",
      duration: "",
    },
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

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { medicineName: "", dosage: "", timing: [], mealTime: "", duration: "" },
    ]);
  };

  const removeMedicineRow = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  const handleSubmit = () => {
    dispatch(
      addPrescription({
        appointmentId,
        prescriptionData: {
          medicines,
          additionalNotes,
        },
      }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      navigate(`/doctor/patient-details/${patientId}`);
    }
  };

  const patient = patientDetails?.patientDetails;

  return (
    <div className="space-y-6">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold text-[#1a3f7b]">
        Add Prescription
      </h2>

      <section className="glass-card p-5">
        <div className="flex gap-4 items-center">
          <img
            src={patient?.image}
            alt={patient?.name}
            className="h-20 w-20 rounded-full object-cover border"
          />

          <div className="text-[#2e4f86]">
            <p className="text-2xl font-bold">{patient?.name}</p>
            <p>{patient?.email}</p>
            <p>{patient?.phone}</p>
            <p>
              DOB:{" "}
              {patient?.dateOfBirth
                ? patient.dateOfBirth
                    .split("T")[0]
                    .split("-")
                    .reverse()
                    .join("/")
                : "--"}
            </p>
            <p>Gender: {patient?.gender || "--"}</p>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Medical History:</strong> {patient?.medicalHistory || "--"}
        </div>
      </section>

      <section className="glass-card p-6 space-y-5">
        <h3 className="text-xl font-semibold text-[#1c3f7a]">Medicines</h3>

        {medicines.map((med, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-[#1c3f7a]">
                Medicine {index + 1}
              </h4>

              <button
                onClick={() => removeMedicineRow(index)}
                className="text-red-500 text-sm font-medium"
              >
                Remove
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  placeholder="Paracetamol"
                  value={med.medicineName}
                  onChange={(e) =>
                    handleMedicineChange(index, "medicineName", e.target.value)
                  }
                  className="border rounded-lg p-2"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="1 Tablet"
                  value={med.dosage}
                  onChange={(e) =>
                    handleMedicineChange(index, "dosage", e.target.value)
                  }
                  className="border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6">
              {["morning", "afternoon", "night"].map((time) => (
                <label key={time} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={med.timing?.includes(time)}
                    onChange={(e) => {
                      const updated = [...medicines];

                      if (e.target.checked) {
                        updated[index].timing.push(time);
                      } else {
                        updated[index].timing = updated[index].timing.filter(
                          (t) => t !== time,
                        );
                      }

                      setMedicines(updated);
                    }}
                  />
                  {time}
                </label>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">Meal Time</label>
                <select
                  value={med.mealTime}
                  onChange={(e) =>
                    handleMedicineChange(index, "mealTime", e.target.value)
                  }
                  className="border rounded-lg p-2"
                >
                  <option value="">Select</option>
                  <option value="before_meal">Before Meal</option>
                  <option value="after_meal">After Meal</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="5 days"
                  value={med.duration}
                  onChange={(e) =>
                    handleMedicineChange(index, "duration", e.target.value)
                  }
                  className="border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addMedicineRow}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          + Add Medicine
        </button>

        <textarea
          placeholder="Additional Notes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-green-600 px-6 py-3 text-white font-semibold"
        >
          Save Prescription
        </button>
      </section>
    </div>
  );
}

export default DoctorAddPrescriptionPage;
