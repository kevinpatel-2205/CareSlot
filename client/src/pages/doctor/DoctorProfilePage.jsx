import { Building2, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorProfile, updateDoctorProfile } from "../../store/doctor";
import { updateProfileImage } from "../../store/auth";
import { SPECIALIZATIONS } from "../../config/specializations.js";
import { formatMoney } from "../../lib/format.js";

function DoctorProfilePage() {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.doctor);
  const {user,isLoading} = useSelector((state)=>state.auth);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    experience: "",
    about: "",
    consultationFee: "",
    isActive: true,
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
      });
    }
  }, [profile]);

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      phone: form.phone,
      specialization: form.specialization,
      experience: Number(form.experience),
      about: form.about,
      consultationFee: Number(form.consultationFee),
      isActive: form.isActive,
    };

    dispatch(updateDoctorProfile(payload));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(updateProfileImage(file));
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Doctor Profile
      </h2>

      <section className="glass-card grid grid-cols-1 gap-4 p-5 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-[#d8e2fb] bg-white/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={
                user?.image ||
                "https://placehold.co/88x88/e6efff/2e5fae?text=DR"
              }
              alt={profile?.name || "Doctor"}
              className="h-16 w-16 rounded-full border border-[#d7e2fb] object-cover"
            />
            {!profile?.doctorId ? (
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#c4d6fb] bg-white px-3 py-1.5 text-sm font-semibold text-[#345eaa]">
                {isLoading ? "Uploading..." : "Change Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageChange}
                  disabled={isLoading}
                />
              </label>
            ) : null}
          </div>

          <h3 className="font-['Averia_Serif_Libre'] text-4xl font-semibold text-[#1a3f7b]">
            {profile?.name || "--"}
          </h3>
          <p className="mt-2 text-lg font-semibold text-[#5f7db2]">
            {profile?.specialization || "--"}
          </p>

          <div className="mt-5 space-y-3 text-[#36598f]">
            <p className="flex items-center gap-2">
              <Mail size={16} /> {profile?.email || "--"}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> {profile?.phone || "--"}
            </p>
            <p className="flex items-center gap-2">
              <Building2 size={16} /> Experience: {profile?.experience ?? "--"}{" "}
              years
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#d8e2fb] bg-white/70 p-5">
          <h4 className="font-['Averia_Serif_Libre'] text-2xl font-semibold text-[#1a3f7b]">
            About Doctor
          </h4>
          <p className="mt-3 leading-8 text-[#48679e]">
            {profile?.about || "No description available."}
          </p>
          <p className="mt-4 rounded-xl bg-[#edf3ff] px-3 py-2 text-sm font-semibold text-[#305ea9]">
            Consultation Fee: {formatMoney(profile?.consultationFee || 0)}
          </p>
        </article>
      </section>

      {!profile?.doctorId ? (
        <form onSubmit={onSubmit} className="glass-card p-5">
          <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
            Edit Profile
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4f6ea5]">Name</span>
              <input
                className="soft-input"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4f6ea5]">
                Phone
              </span>
              <input
                className="soft-input"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4f6ea5]">
                Specialization
              </span>
              <select
                className="soft-input"
                value={form.specialization}
                onChange={(e) => onChange("specialization", e.target.value)}
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
                Experience
              </span>
              <input
                type="number"
                min="0"
                className="soft-input"
                value={form.experience}
                onChange={(e) => onChange("experience", e.target.value)}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4f6ea5]">
                Consultation Fee
              </span>
              <input
                type="number"
                min="0"
                className="soft-input"
                value={form.consultationFee}
                onChange={(e) => onChange("consultationFee", e.target.value)}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#4f6ea5]">
                Active Status
              </span>
              <select
                className="soft-input"
                value={String(form.isActive)}
                onChange={(e) =>
                  onChange("isActive", e.target.value === "true")
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">About</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-[#cfdbf8] bg-white/80 p-3 text-[#1d3f80] placeholder:text-[#7a94c6] focus:border-[#4d88ff] focus:outline-none"
              value={form.about}
              onChange={(e) => onChange("about", e.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 h-12 rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-6 font-bold text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default DoctorProfilePage;
