import {
  Building2,
  Mail,
  Phone,
  Camera,
  Award,
  IndianRupee,
  History,
  Lock,
  KeyRound,
  Save,
  Activity,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorProfile, updateDoctorProfile } from "../../store/doctor";
import { updateProfileImage, updatePassword } from "../../store/auth";
import { SPECIALIZATIONS } from "../../config/specializations.js";
import { formatMoney } from "../../lib/format.js";
import { toast } from "react-toastify";
import PageLoader from "../../components/PageLoader.jsx";

function DoctorProfilePage() {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.doctor);
  const { user, isLoading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    experience: "",
    about: "",
    consultationFee: "",
    isActive: true,
    geolocation: null,
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    dispatch(fetchDoctorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile?.name || "",
        phone: profile?.phone || "",
        specialization: profile?.specialization || "",
        experience: profile?.experience ?? "",
        about: profile?.about || "",
        consultationFee: profile?.consultationFee ?? "",
        isActive: profile?.isActive ?? true,
        geolocation: profile?.geolocation || null,
      });
    }
  }, [profile]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const readableAddress =
            data.display_name || `${latitude}, ${longitude}`;
          setForm((prev) => ({
            ...prev,
            geolocation: { latitude, longitude, address: readableAddress },
          }));
          toast.success("Location detected!");
        } catch {
          toast.error("Could not fetch address. Try again.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied");
        } else {
          toast.error("Unable to retrieve location");
        }
      },
    );
  };

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
    };
    dispatch(updateDoctorProfile(payload));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(updateProfileImage(file));
    e.target.value = "";
  };

  const handlePasswordChange = (key, value) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(updatePassword(passwordForm));
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (loading && !profile)
    return <PageLoader label="Loading Profile Details..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER */}
      <div className="px-2">
        <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
          Professional Profile
        </h2>
        <p className="text-slate-500 font-medium mt-1 italic">
          Manage your clinical identity and visibility status.
        </p>
      </div>

      {/* HERO SECTION */}
      <section className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm overflow-hidden relative">
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
        <div className="px-8 pb-10">
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 mb-12">
            <div className="relative group">
              <img
                src={
                  user?.image ||
                  `https://ui-avatars.com/api/?name=${profile?.name}&background=dbeafe&color=2563eb&size=128`
                }
                className="h-40 w-40 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover"
                alt="Doctor"
              />
              <label className="absolute bottom-2 right-2 bg-blue-600 p-3 rounded-2xl text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-90">
                <Camera size={22} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageChange}
                  disabled={isLoading}
                />
              </label>
            </div>

            <div className="pb-2 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 ${form.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${form.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                  />
                  {form.isActive ? "Online & Active" : "Offline / Inactive"}
                </span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border border-blue-100">
                  {profile?.specialization || "General Practitioner"}
                </span>
              </div>
              <h3 className="text-4xl font-black text-blue-900 tracking-tight">
                {profile?.name || "--"}
              </h3>
              <div className="flex flex-wrap gap-4 mt-3 text-slate-400 font-bold text-sm">
                <p className="flex items-center gap-1.5">
                  <Mail size={16} className="text-blue-400" /> {profile?.email}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone size={16} className="text-blue-400" /> {profile?.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Award size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Experience
                </p>
              </div>
              <p className="text-2xl font-black text-blue-900">
                {profile?.experience} Years{" "}
                <span className="text-sm font-medium text-slate-400">
                  Clinical practice
                </span>
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <IndianRupee size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Consultation Fee
                </p>
              </div>
              <p className="text-2xl font-black text-blue-900">
                {formatMoney(profile?.consultationFee || 0)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  Per Session
                </span>
              </p>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <History size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Platform Share
                </p>
              </div>
              <p className="text-2xl font-black text-indigo-900">
                {profile?.aCommission}%{" "}
                <span className="text-sm font-medium text-indigo-300">
                  Admin Commission
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* EDIT SECTION */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-black text-blue-900 tracking-tight">
                Clinic Settings
              </h3>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Practice Visibility */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Practice Visibility
                </label>
                <select
                  className={`w-full px-5 py-4 border rounded-2xl outline-none font-bold transition-all ${form.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                  value={String(form.isActive)}
                  onChange={(e) =>
                    onChange("isActive", e.target.value === "true")
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Full Doctor Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Full Doctor Name
                </label>
                <input
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Phone Number
                </label>
                <input
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Specialization
                </label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  value={form.specialization}
                  onChange={(e) => onChange("specialization", e.target.value)}
                >
                  <option value="">Select Specialty</option>
                  {SPECIALIZATIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Years Experience */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Years Experience
                </label>
                <input
                  type="number"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  value={form.experience}
                  onChange={(e) => onChange("experience", e.target.value)}
                />
              </div>

              {/* Consultation Fee */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  value={form.consultationFee}
                  onChange={(e) => onChange("consultationFee", e.target.value)}
                />
              </div>

              {/* Clinic Location — full width inside grid */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Clinic Location
                </label>
                <div className="flex gap-3">
                  <div className="relative group flex-1">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                      value={form?.geolocation?.address || ""}
                      readOnly
                      placeholder="Click Get Location"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-100"
                  >
                    <MapPin size={18} />
                    <span className="hidden sm:inline">
                      {locationLoading ? "Detecting..." : "Get Location"}
                    </span>
                  </button>
                </div>
                {form.geolocation && (
                  <p className="text-xs text-green-600 font-bold ml-2 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    GPS: {Number(form.geolocation.latitude)?.toFixed(4)},{" "}
                    {Number(form.geolocation.longitude)?.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Biography / About */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Biography / About
              </label>
              <textarea
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 min-h-[150px]"
                value={form.about}
                onChange={(e) => onChange("about", e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />{" "}
              {loading ? "Updating Records..." : "Save Professional Profile"}
            </button>
          </form>
        </section>

        {/* SECURITY SECTION */}
        <aside className="space-y-6">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Lock size={20} />
              </div>
              <h3 className="text-xl font-black text-blue-900 tracking-tight">
                Security
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  New Access Key
                </label>
                <input
                  type="password"
                  placeholder="8+ Characters"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Verify Key
                </label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-950 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <KeyRound size={16} /> Sync Security
              </button>
            </form>
          </section>

          {/* COMMISSION HISTORY CARD */}
          {profile?.commissionHistory?.length > 0 && (
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <History size={14} /> Fee History
              </p>
              <div className="space-y-3">
                {[...profile.commissionHistory]
                  .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
                  .slice(0, 3)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="font-bold text-slate-500">
                        {new Date(item.changedAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`font-black ${idx === 0 ? "text-blue-600" : "text-slate-400"}`}
                      >
                        {item.commission}% {idx === 0 && " (Current)"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
