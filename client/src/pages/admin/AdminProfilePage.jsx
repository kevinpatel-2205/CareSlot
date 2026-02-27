import { useDispatch, useSelector } from "react-redux";
import { updateProfileImage, updatePassword } from "../../store/auth";
import { toast } from "react-toastify";
import { useState } from "react";

function AdminProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      toast.error("New password and confirm password do not match");
      return;
    }

    dispatch(updatePassword(passwordForm));

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="font-['Averia_Serif_Libre'] text-5xl font-semibold tracking-tight text-[#1a3f7b]">
        Admin Profile
      </h2>

      <section className="glass-card max-w-3xl p-5">
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={
              user?.image || "https://placehold.co/96x96/e6efff/2e5fae?text=AD"
            }
            alt={user?.name || "Admin"}
            className="h-24 w-24 rounded-full border border-[#d7e2fb] object-cover"
          />

          <div className="space-y-2 text-[#2d4f88]">
            <p>
              <span className="font-semibold text-[#1c3f7a]">Name:</span>{" "}
              {user?.name || "--"}
            </p>

            <p>
              <span className="font-semibold text-[#1c3f7a]">Role:</span>{" "}
              <span className="capitalize">{user?.role || "--"}</span>
            </p>

            <p>
              <span className="font-semibold text-[#1c3f7a]">Email:</span>{" "}
              {user?.email || "--"}
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
      <form onSubmit={handlePasswordSubmit} className="glass-card p-5 mt-5">
        <h3 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a3f7b]">
          Change Password
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Current Password
            </span>
            <input
              type="password"
              className="soft-input"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              New Password
            </span>
            <input
              type="password"
              className="soft-input"
              value={passwordForm.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-[#4f6ea5]">
              Confirm Password
            </span>
            <input
              type="password"
              className="soft-input"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 h-12 rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-6 font-bold text-white disabled:opacity-60"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default AdminProfilePage;
