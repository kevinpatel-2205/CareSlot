import {
  CalendarCheck,
  CalendarPlus2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldPlus,
  Search,
  Settings,
  Stethoscope,
  Users,
  X,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/auth";

const iconMap = {
  dashboard: LayoutDashboard,
  book: CalendarPlus2,
  addDoctor: ShieldPlus,
  appointments: CalendarCheck,
  doctors: Stethoscope,
  slots: Clock3,
  patients: Users,
  adminAppointments: ClipboardList,
};

function MenuLink({ item, onClick }) {
  const Icon = iconMap[item.key] || LayoutDashboard;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-[17px] font-semibold transition ${
          isActive
            ? "bg-gradient-to-r from-[#2e7df2] to-[#2470df] text-white shadow-soft"
            : "text-[#46659b] hover:bg-white/70"
        }`
      }
    >
      <Icon size={19} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function SidebarContent({ navItems, user, roleLabel, onLogout, onNavigate }) {
  const firstLetter =
    (user?.name || roleLabel || "U").trim()[0]?.toUpperCase() || "U";

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl p-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#2e7df2] text-white">
          <Stethoscope />
        </div>
        <h1 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a4a97]">
          CareSlot
        </h1>
      </div>

      <div className="mt-5 rounded-2xl border border-[#d8e2fb] bg-white/70 p-5 text-center">
        <img
          src={
            user?.image ||
            "https://placehold.co/88x88/d8e7ff/1f4fa2?text=" + firstLetter
          }
          alt={user?.name || "User"}
          className="mx-auto h-20 w-20 rounded-full border border-[#c9d8fa] object-cover"
        />
        <p className="mt-3 text-2xl font-bold text-[#1d3f80]">
          {user?.name || "User"}
        </p>
        <p className="text-sm font-semibold capitalize text-[#6f8bc0]">
          {user?.role || roleLabel}
        </p>
      </div>

      <nav className="mt-4 space-y-2">
        {navItems.map((item) => (
          <MenuLink key={item.to} item={item} onClick={onNavigate} />
        ))}
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[17px] font-semibold text-rose-500 hover:bg-rose-50"
        >
          <LogOut size={19} />
          Logout
        </button>
      </nav>
    </>
  );
}

function DashboardLayout({ navItems, roleLabel }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [openMenu, setOpenMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const title = location.pathname
    .split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/-/g, " ");

  const firstLetter =
    (user?.name || roleLabel || "U").trim()[0]?.toUpperCase() || "U";

  const isAdmin = (user?.role || roleLabel || "").toLowerCase() === "admin";
  const isDoctor = (user?.role || roleLabel || "").toLowerCase() === "doctor";
  const isPatient = (user?.role || roleLabel || "").toLowerCase() === "patient";
  const showSearch = !isAdmin && !isDoctor && !isPatient;

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const goProfile = () => {
    setOpenMenu(false);
    if (isAdmin) navigate("/admin/profile");
    else if (isDoctor) navigate("/doctor/profile");
    else navigate("/patient/profile");
  };

  const onLogout = async () => {
    try {
      await dispatch(logoutUser());
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-8 sm:px-6">
      <div className="glass-card overflow-hidden">
        <div className="grid min-h-[86vh] grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="hidden border-r border-[#d9e3fa] bg-gradient-to-b from-[#e9f1ff] to-[#f4f7ff] p-5 lg:block">
            <SidebarContent
              navItems={navItems}
              user={user}
              roleLabel={roleLabel}
              onLogout={onLogout}
            />
          </aside>

          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                aria-label="Close sidebar"
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute inset-0 bg-[#102445]/40 backdrop-blur-[1px]"
              />
              <aside className="absolute left-0 top-0 h-full w-[82vw] max-w-[320px] overflow-y-auto border-r border-[#d9e3fa] bg-gradient-to-b from-[#e9f1ff] to-[#f4f7ff] p-5 shadow-2xl">
                <div className="mb-2 flex justify-end">
                  <button
                    aria-label="Close"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-[#46659b]"
                  >
                    <X size={19} />
                  </button>
                </div>
                <SidebarContent
                  navItems={navItems}
                  user={user}
                  roleLabel={roleLabel}
                  onLogout={onLogout}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
              </aside>
            </div>
          )}

          <main className="overflow-x-hidden bg-[#f6f9ff]/70 lg:max-h-[86vh] lg:overflow-y-auto">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9e3fa] px-4 py-4 md:px-8">
              <div className="flex flex-1 items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[#d6e2fb] bg-white text-[#46659b] lg:hidden"
                >
                  <Menu size={20} />
                </button>

                {showSearch && (
                  <label className="relative hidden w-full max-w-md sm:block">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7f98c6]"
                    />
                    <input className="soft-input !pl-14" placeholder="Search" />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-4 text-[#6e89bc]">
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setOpenMenu((prev) => !prev)}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#e6eeff]"
                  >
                    <Settings size={20} />
                  </button>

                  {openMenu && (
                    <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-[#d3e0fb] bg-white p-2 shadow-soft">
                      <button
                        onClick={goProfile}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[#3b5f99] hover:bg-[#eef4ff]"
                      >
                        <span className="flex items-center gap-2">
                          <UserRoundCog className="w-4 h-4 text-[#3b5f99]" />
                          Profile
                        </span>
                      </button>
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                <img
                  src={
                    user?.image ||
                    "https://placehold.co/48x48/d8e7ff/1f4fa2?text=" +
                      firstLetter
                  }
                  alt={user?.name || "User"}
                  className="h-10 w-10 rounded-full border border-[#c9d8fa] object-cover"
                />
              </div>
            </header>

            <section className="p-4 md:p-8">
              <div className="mb-6 text-[#5f7db2]">
                Home /{" "}
                <span className="capitalize">{title || "dashboard"}</span>
              </div>
              <Outlet />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
