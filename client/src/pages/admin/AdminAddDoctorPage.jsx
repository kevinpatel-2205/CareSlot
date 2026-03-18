import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDoctor } from "../../store/admin";
import { SPECIALIZATIONS } from "../../config/specializations.js";
import {
  UserPlus,
  Mail,
  Phone,
  Award,
  DollarSign,
  Info,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

function AdminAddDoctorPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    about: "",
    consultationFee: "",
    aCommission: "10",
  });

  const [slots, setSlots] = useState([{ date: "", times: "" }]);

  const canSubmit = useMemo(() => {
    return (
      form.name &&
      form.email &&
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

    dispatch(createDoctor({ ...form, availableSlots })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setForm({
          name: "",
          email: "",
          phone: "",
          specialization: "",
          experience: "",
          about: "",
          consultationFee: "",
          aCommission: "10",
        });
        setSlots([{ date: "", times: "" }]);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
          Onboard New Doctor
        </h2>
        <p className="text-slate-500 font-medium mt-1">
          Add a new verified healthcare professional to the CareSlot network.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* SECTION 1: BASIC INFORMATION */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
              <UserPlus size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <input
                  className="w-full pl-5 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  required
                  placeholder="Dr. John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  required
                  placeholder="doctor@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Phone Number
              </label>
              <div className="relative group">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Specialization
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                value={form.specialization}
                onChange={(e) => onChange("specialization", e.target.value)}
                required
              >
                <option value="">Select Specialty</option>
                {SPECIALIZATIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROFESSIONAL DETAILS */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-100">
              <Award size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Professional Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Years of Exp.
              </label>
              <input
                type="number"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700"
                value={form.experience}
                onChange={(e) => onChange("experience", e.target.value)}
                required
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Consultation Fee
              </label>
              <div className="relative group">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
                  size={18}
                />
                <input
                  type="number"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700"
                  value={form.consultationFee}
                  onChange={(e) => onChange("consultationFee", e.target.value)}
                  required
                  placeholder="500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Platform Comm. %
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 appearance-none"
                value={form.aCommission}
                onChange={(e) => onChange("aCommission", e.target.value)}
                required
              >
                {[5, 10, 15, 20, 25, 30].map((val) => (
                  <option key={val} value={val}>
                    {val}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              About Doctor
            </label>
            <div className="relative">
              <Info
                className="absolute left-4 top-4 text-slate-300"
                size={18}
              />
              <textarea
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700 min-h-[120px]"
                value={form.about}
                onChange={(e) => onChange("about", e.target.value)}
                required
                placeholder="Professional summary and background..."
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: AVAILABILITY SLOTS */}
        <section className="bg-slate-50 rounded-[3rem] p-8 border border-slate-200 shadow-inner">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg">
                <Calendar size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">
                Weekly Availability
              </h3>
            </div>
            <button
              type="button"
              onClick={addSlotRow}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-blue-600 font-bold border border-blue-100 shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
              <Plus size={18} /> Add Day
            </button>
          </div>

          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] items-end gap-4 bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm animate-in slide-in-from-left-2 duration-300"
              >
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400"
                    value={slot.date}
                    onChange={(e) =>
                      onSlotChange(index, "date", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Available Times (Comma Separated)
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400 placeholder:font-normal placeholder:text-slate-300"
                    placeholder="09:00 AM, 11:30 AM, 04:00 PM"
                    value={slot.times}
                    onChange={(e) =>
                      onSlotChange(index, "times", e.target.value)
                    }
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSlotRow(index)}
                  className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black text-xl transition-all active:scale-[0.98] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
        >
          <CheckCircle2 size={28} />
          {loading ? "Registering Doctor..." : "Register Doctor"}
        </button>
      </form>
    </div>
  );
}

export default AdminAddDoctorPage;
