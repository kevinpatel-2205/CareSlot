import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Phone,
  Calendar,
  Mail,
  MapPin,
  Activity,
  Camera,
  Lock,
  CheckCircle2,
  Save,
  KeyRound,
} from "lucide-react";
import PageLoader from "../../components/PageLoader.jsx";
import { updateProfileImage, updatePassword } from "../../store/auth";
import { formatDate } from "../../lib/format.js";
import { fetchPatientProfile, updatePatientProfile } from "../../store/patient";
import { toast } from "react-toastify";

function PatientProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.patient);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    medicalHistory: "",
    geolocation: null,
  });

  const [locationLoading, setLocationLoading] = useState(false);

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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    dispatch(fetchPatientProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile?.name || "",
        phone: profile?.phone || "",
        dateOfBirth: profile?.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
          : "",
        gender: profile?.gender || "",
        medicalHistory: profile?.medicalHistory || "",
        geolocation: profile?.geolocation || null,
      });
    }
  }, [profile]);

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(updateProfileImage(file));
    e.target.value = "";
  };

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(
      updatePatientProfile({
        ...form,
        geolocation: form.geolocation ?? undefined,
      }),
    );
  };

  const handlePasswordChange = (key, value) =>
    setPasswordForm((prev) => ({ ...prev, [key]: value }));

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
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
    return <PageLoader label="Fetching your profile..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-bold tracking-tight text-[#1a3f7b]">
            My Account
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">
            Manage your personal information and security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          {/* ================= MAIN PROFILE FORM ================= */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-24 w-full"></div>
            <div className="px-8 pb-10">
              <div className="flex flex-col md:flex-row items-end gap-6 -mt-8 mb-8">
                <div className="relative group">
                  <img
                    src={
                      user?.image ||
                      `https://ui-avatars.com/api/?name=${profile?.name}&background=dbeafe&color=2563eb&size=128`
                    }
                    alt="Avatar"
                    className="h-32 w-32 rounded-3xl border-4 border-white shadow-xl object-cover"
                  />
                  <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-xl text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-90">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onImageChange}
                      disabled={isLoading}
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-1 pb-2">
                  <h3 className="text-2xl font-black text-slate-900 leading-none">
                    {profile?.name || "Patient User"}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                    <CheckCircle2 size={16} /> {profile?.role || "Patient"}{" "}
                    Account
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-slate-400 font-bold text-sm">
                    <p className="flex items-center gap-1.5">
                      <Mail size={16} className="text-blue-400" />{" "}
                      {profile?.email}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                        value={form.name}
                        onChange={(e) => onChange("name", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
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
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Date of Birth
                    </label>
                    <div className="relative group">
                      <Calendar
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        type="date"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                        value={form.dateOfBirth}
                        onChange={(e) =>
                          onChange("dateOfBirth", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Gender
                    </label>
                    <select
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                      value={form.gender}
                      onChange={(e) => onChange("gender", e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Current Address
                    </label>

                    <div className="flex gap-3">
                      {/* Address Input — read only when location is fetched */}
                      <div className="relative group flex-1">
                        <MapPin
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                          size={18}
                        />
                        <input
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                          value={form?.geolocation?.address || ""}
                          readOnly
                          onChange={(e) => onChange("address", e.target.value)}
                          placeholder="Click Get Location"
                        />
                      </div>

                      {/* Get Location Button */}
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

                    {/* Show coordinates badge if location fetched */}
                    {form.geolocation && (
                      <p className="text-xs text-green-600 font-bold ml-2 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        GPS: {Number(form.geolocation.latitude)?.toFixed(
                          4,
                        )}, {Number(form.geolocation.longitude)?.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Medical History */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Medical History
                    </label>
                    <div className="relative group">
                      <Activity
                        className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <textarea
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 min-h-[120px]"
                        placeholder="Briefly describe your medical history..."
                        value={form.medicalHistory}
                        onChange={(e) =>
                          onChange("medicalHistory", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Save size={20} />{" "}
                  {loading ? "Saving Changes..." : "Save Profile"}
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* ================= SIDEBAR: SECURITY ================= */}
        <aside className="space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-900 p-2.5 rounded-xl text-white">
                <Lock size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Security
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                <KeyRound size={18} />{" "}
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>

          {/* Quick Info Card */}
          <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
            <h4 className="text-blue-900 font-bold mb-2">Account Privacy</h4>
            <p className="text-blue-700 text-xs leading-relaxed opacity-80">
              Your medical data is encrypted and only shared with the doctors
              you book appointments with.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PatientProfilePage;
