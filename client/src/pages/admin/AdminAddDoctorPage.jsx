import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDoctor } from "../../store/admin";
import { SPECIALIZATIONS } from "../../config/specializations.js";

function AdminAddDoctorPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    about: "",
    consultationFee: "",
  });

  const [slots, setSlots] = useState([{ date: "", times: "" }]);

  const canSubmit = useMemo(() => {
    return (
      form.name &&
      form.email &&
      form.password &&
      form.specialization &&
      form.experience !== "" &&
      form.about &&
      form.consultationFee !== "" &&
      slots.length > 0 &&
      slots.every((slot) => slot.date && slot.times.trim())
    );
  }, [form, slots]);

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSlotChange = (index, key, value) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [key]: value } : slot)),
    );
  };

  const addSlotRow = () =>
    setSlots((prev) => [...prev, { date: "", times: "" }]);

  const removeSlotRow = (index) => {
    setSlots((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    const availableSlots = slots
      .map((slot) => ({
        date: slot.date,
        times: slot.times
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      }))
      .filter((slot) => slot.date && slot.times.length > 0);

    if (!availableSlots.length) return;

    dispatch(
      createDoctor({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        specialization: form.specialization,
        experience: Number(form.experience),
        about: form.about,
        consultationFee: Number(form.consultationFee),
        availableSlots,
      }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          specialization: "",
          experience: "",
          about: "",
          consultationFee: "",
        });
        setSlots([{ date: "", times: "" }]);
      }
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Add New Doctor
      </h2>

      <form onSubmit={onSubmit} className="glass-card p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Doctor Name *
            </span>
            <input
              className="soft-input"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Email *
            </span>
            <input
              className="soft-input"
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Password *
            </span>
            <input
              className="soft-input"
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Phone *
            </span>
            <input
              className="soft-input"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Specialization *
            </span>
            <select
              className="soft-input"
              value={form.specialization}
              onChange={(e) => onChange("specialization", e.target.value)}
              required
            >
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Experience (Years) *
            </span>
            <input
              className="soft-input"
              type="number"
              min="0"
              value={form.experience}
              onChange={(e) => onChange("experience", e.target.value)}
              required
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              About Doctor *
            </span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-[#cfdbf8] bg-white/80 p-3 text-[#1d3f80] placeholder:text-[#7a94c6] focus:border-[#4d88ff] focus:outline-none"
              value={form.about}
              onChange={(e) => onChange("about", e.target.value)}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Consultation Fee *
            </span>
            <input
              className="soft-input"
              type="number"
              min="0"
              value={form.consultationFee}
              onChange={(e) => onChange("consultationFee", e.target.value)}
              required
            />
          </label>
        </div>

        <div className="mt-5 rounded-xl border border-[#d7e2fb] bg-white/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-['Averia_Serif_Libre'] text-2xl font-semibold text-[#1a3f7b]">
              Available Slots (Date Wise)
            </h3>
            <button
              type="button"
              onClick={addSlotRow}
              className="rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-sm font-semibold text-[#345eaa]"
            >
              + Add Slot Row
            </button>
          </div>

          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto]"
              >
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-[#4f6ea5]">
                    Date *
                  </span>
                  <input
                    type="date"
                    className="soft-input"
                    value={slot.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      onSlotChange(index, "date", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-[#4f6ea5]">
                    Times (comma separated) *
                  </span>
                  <input
                    className="soft-input"
                    placeholder="09:00 AM, 10:30 AM"
                    value={slot.times}
                    onChange={(e) =>
                      onSlotChange(index, "times", e.target.value)
                    }
                    required
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeSlotRow(index)}
                  className="self-end rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="mt-4 h-12 rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-6 font-bold text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Doctor"}
        </button>
      </form>
    </div>
  );
}

export default AdminAddDoctorPage;
