import { useDispatch, useSelector } from "react-redux";
import { updateProfileImage, updatePassword } from "../../store/auth";
import { toast } from "react-toastify";
import { useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Camera,
  Lock,
  KeyRound,
  Save,
  ShieldAlert,
} from "lucide-react";

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER */}
      <div className="px-2">
        <h2 className="font-['Averia_Serif_Libre'] text-4xl md:text-5xl font-black tracking-tight text-blue-900">
          System Admin Profile
        </h2>
        <p className="text-slate-500 font-medium mt-1 italic">
          Manage your administrative identity and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* MAIN IDENTITY CARD */}
        <section className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm overflow-hidden h-fit">
          <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-500"></div>
          <div className="px-8 pb-10">
            <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-10">
              <div className="relative group">
                <img
                  src={
                    user?.image ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=dbeafe&color=2563eb&size=128`
                  }
                  className="h-36 w-36 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover"
                  alt="Admin"
                />
                <label className="absolute bottom-2 right-2 bg-blue-600 p-2.5 rounded-2xl text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-90">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onImageChange}
                    disabled={isLoading}
                  />
                </label>
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200">
                    System Root
                  </span>
                </div>
                <h3 className="text-3xl font-black text-blue-900 tracking-tight">
                  {user?.name || "Administrator"}
                </h3>
                <p className="text-blue-500 font-bold text-sm lowercase flex items-center gap-1.5 mt-1">
                  <Mail size={14} /> {user?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Admin Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-500 cursor-default"
                    value={user?.name}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  System Role
                </label>
                <div className="relative group">
                  <ShieldCheck
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
                    size={18}
                  />
                  <input
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl font-bold text-emerald-700 capitalize cursor-default"
                    value={user?.role}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
              <ShieldAlert className="text-blue-600 mt-0.5" size={18} />
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                To update your administrative name or email, please contact the
                lead developer or modify the core database directly to prevent
                unauthorized system changes.
              </p>
            </div>
          </div>
        </section>

        {/* SECURITY SIDEBAR */}
        <aside className="space-y-6">
          <section className="bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100">
                <Lock size={22} />
              </div>
              <h3 className="text-xl font-black text-blue-900 tracking-tight">
                Security Center
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-bold"
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
                  placeholder="Min 8 characters"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-bold"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Repeat New Access Key
                </label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-bold"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-950 transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound size={16} />
                {isLoading ? "Synchronizing..." : "Update Security"}
              </button>
            </form>
          </section>

          {/* SYSTEM LOG CARD */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
            <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest mb-3">
              Admin Log
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed italic">
              Your last password change was recorded on{" "}
              {new Date().toLocaleDateString()}. Ensure your Access Key is
              stored in a secure manager.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminProfilePage;
