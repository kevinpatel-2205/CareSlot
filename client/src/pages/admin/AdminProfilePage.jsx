import { useDispatch, useSelector } from "react-redux";
import { updateProfileImage } from "../../store/auth";

function AdminProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(updateProfileImage(file));
    e.target.value = "";
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
              user?.image ||
              "https://placehold.co/96x96/e6efff/2e5fae?text=AD"
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
              <span className="capitalize">
                {user?.role || "--"}
              </span>
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
    </div>
  );
}

export default AdminProfilePage;