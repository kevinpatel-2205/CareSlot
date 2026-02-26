import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageLoader from "../../components/PageLoader.jsx";
import { updateProfileImage } from "../../store/auth";
import { formatDate } from "../../lib/format.js";
import { fetchPatientProfile, updatePatientProfile } from "../../store/patient";

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
        address: profile?.address || "",
        medicalHistory: profile?.medicalHistory || "",
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
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        address: form.address,
        medicalHistory: form.medicalHistory,
      }),
    );
  };

  if (loading && !profile) {
    return <PageLoader label="Loading profile..." />;
  }

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Patient Profile
      </h2>

      <section className="glass-card w-full p-5">
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={
              user?.image || "https://placehold.co/96x96/e6efff/2e5fae?text=PT"
            }
            alt={profile?.name || "Patient"}
            className="h-24 w-24 rounded-full border border-[#d7e2fb] object-cover"
          />
          <div className="space-y-2 text-[#2d4f88]">
            <p>
              <span className="font-semibold text-[#1c3f7a]">Name:</span>{" "}
              {profile?.name || "--"}
            </p>
            <p>
              <span className="font-semibold text-[#1c3f7a]">Role:</span>{" "}
              <span className="capitalize">
                {profile?.role || user?.role || "--"}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#1c3f7a]">Email:</span>{" "}
              {profile?.email || "--"}
            </p>
            <p>
              <span className="font-semibold text-[#1c3f7a]">DOB:</span>{" "}
              {profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : "--"}
            </p>
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
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} className="glass-card w-full p-5">
        <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
          Update Profile
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
            <span className="text-sm font-semibold text-[#4f6ea5]">Phone</span>
            <input
              className="soft-input"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Date of Birth
            </span>
            <input
              type="date"
              className="soft-input"
              value={form.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">Gender</span>
            <select
              className="soft-input"
              value={form.gender}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Address
            </span>
            <input
              className="soft-input"
              value={form.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Medical History
            </span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-[#cfdbf8] bg-white/80 p-3 text-[#1d3f80] placeholder:text-[#7a94c6] focus:border-[#4d88ff] focus:outline-none"
              value={form.medicalHistory}
              onChange={(e) => onChange("medicalHistory", e.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-12 rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-6 font-bold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default PatientProfilePage;
