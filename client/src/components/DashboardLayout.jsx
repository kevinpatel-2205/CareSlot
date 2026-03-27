import {
  CalendarCheck,
  CalendarPlus2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldPlus,
  Settings,
  Stethoscope,
  Users,
  X,
  UserRoundCog,
  MessageSquareText,
  User,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/auth";
import AIChatAssistant from "../components/AIChatAssistant";

// Icon mapping for navigation items
const iconMap = {
  dashboard: LayoutDashboard,
  book: CalendarPlus2,
  addDoctor: ShieldPlus,
  appointments: CalendarCheck,
  doctors: Stethoscope,
  slots: Clock3,
  patients: Users,
  adminAppointments: ClipboardList,
  reviews: MessageSquareText,
  profile: User,
};

// --- MOBILE BOTTOM NAVIGATION COMPONENT ---
function MobileBottomNav({ navItems, isAdmin, isDoctor }) {
  const bottomItems = isAdmin
    ? navItems.filter((item) =>
        ["dashboard", "doctors", "appointments", "reviews"].includes(item.key),
      )
    : navItems.slice(0, 4);

  return (
    <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-[#d9e3fa] bg-white/95 p-2 pb-3 backdrop-blur-lg lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.08)]">
      {bottomItems.map((item) => {
        const Icon = iconMap[item.key] || LayoutDashboard;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 transition-all ${
                isActive ? "text-[#2e7df2] scale-110" : "text-[#7f98c6]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? "bg-blue-50" : ""
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tight">
                  {item.label.split(" ")[0]}
                </span>
              </>
            )}
          </NavLink>
        );
      })}

      <NavLink
        to={
          isAdmin
            ? "/admin/profile"
            : isDoctor
              ? "/doctor/profile"
              : "/patient/profile"
        }
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-2 py-1 transition-all ${
            isActive ? "text-[#2e7df2] scale-110" : "text-[#7f98c6]"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={`p-1 rounded-lg transition-colors ${
                isActive ? "bg-blue-50" : ""
              }`}
            >
              <User size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight">
              Profile
            </span>
          </>
        )}
      </NavLink>
    </div>
  );
}

// --- SIDEBAR LINK COMPONENT ---
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

// --- SHARED SIDEBAR CONTENT ---
function SidebarContent({ navItems, user, roleLabel, onLogout, onNavigate }) {
  const firstLetter =
    (user?.name || roleLabel || "U").trim()[0]?.toUpperCase() || "U";

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl p-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#2e7df2] text-white shadow-lg shadow-blue-200">
          <Stethoscope size={22} />
        </div>
        <h1 className="font-['Averia_Serif_Libre'] text-3xl font-semibold text-[#1a4a97]">
          CareSlot
        </h1>
      </div>

      <div className="mt-5 rounded-2xl border border-[#d8e2fb] bg-white/70 p-5 text-center backdrop-blur-sm">
        <img
          src={
            user?.image ||
            `https://placehold.co/88x88/d8e7ff/1f4fa2?text=${firstLetter}`
          }
          alt={user?.name || "User"}
          className="mx-auto h-20 w-20 rounded-full border-2 border-white shadow-md object-cover"
        />
        <p className="mt-3 text-2xl font-bold text-[#1d3f80]">
          {user?.name || "User"}
        </p>
        <p className="text-sm font-semibold capitalize text-[#6f8bc0] tracking-wide">
          {user?.role || roleLabel}
        </p>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <MenuLink key={item.to} item={item} onClick={onNavigate} />
        ))}
        <div className="pt-4 mt-4 border-t border-[#d9e3fa]">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[17px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}

// --- MAIN LAYOUT COMPONENT ---
function DashboardLayout({ navItems, roleLabel }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [openMenu, setOpenMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false); // NEW: AI State
  const menuRef = useRef(null);
  const location = useLocation();

  const role = (user?.role || roleLabel || "patient").toLowerCase();
  const isAdmin = role === "admin";
  const isDoctor = role === "doctor";

  const title = location.pathname
    .split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/-/g, " ");
  const firstLetter =
    (user?.name || roleLabel || "U").trim()[0]?.toUpperCase() || "U";

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const onLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-2 py-4 pb-24 sm:px-6 sm:py-8 lg:pb-8">
      <div className="glass-card overflow-hidden bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[#d9e3fa] shadow-2xl shadow-blue-100/50">
        <div className="grid min-h-[86vh] grid-cols-1 lg:grid-cols-[280px_1fr]">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden border-r border-[#d9e3fa] bg-gradient-to-b from-[#e9f1ff] to-[#f4f7ff] p-5 lg:block">
            <SidebarContent
              navItems={navItems}
              user={user}
              roleLabel={roleLabel}
              onLogout={onLogout}
            />
          </aside>

          {/* MOBILE SIDEBAR (DRAWER) */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute inset-0 bg-[#102445]/40 backdrop-blur-[2px]"
              />
              <aside className="absolute left-0 top-0 h-full w-[82vw] max-w-[320px] overflow-y-auto bg-gradient-to-b from-[#e9f1ff] to-[#f4f7ff] p-5 shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm text-[#46659b]"
                  >
                    <X size={20} />
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
            {/* HEADER */}
            <header className="flex items-center justify-between gap-4 border-b border-[#d9e3fa] px-4 py-4 md:px-8 bg-white/50 sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex flex-1 items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[#d6e2fb] bg-white text-[#46659b] lg:hidden shadow-sm active:scale-95 transition-transform"
                >
                  <Menu size={20} />
                </button>
                <h2 className="hidden text-xl font-bold capitalize text-[#1a4a97] lg:block tracking-tight">
                  {title || "Dashboard"}
                </h2>
                <h2 className="text-lg font-bold capitalize text-[#1a4a97] lg:hidden truncate max-w-[150px]">
                  {title || "Dashboard"}
                </h2>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {/* --- AI ASSISTANT HEADER BUTTON --- */}
                <button
                  onClick={() => setAiOpen(true)}
                  className="group relative grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-[#2e7df2] transition-all hover:scale-110 hover:bg-blue-150 active:scale-95 shadow-sm"
                  title="AI Assistant"
                >
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></span>
                  </span>
                </button>

                {/* SETTINGS MENU */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setOpenMenu(!openMenu)}
                    className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#e6eeff] text-[#6e89bc] transition-colors"
                  >
                    <Settings size={20} />
                  </button>
                  {openMenu && (
                    <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl border border-[#d3e0fb] bg-white p-2 shadow-xl animate-in fade-in zoom-in duration-150">
                      <button
                        onClick={() => {
                          setOpenMenu(false);
                          navigate(`/${role}/profile`);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#3b5f99] hover:bg-[#eef4ff] transition-colors"
                      >
                        <UserRoundCog className="w-4 h-4" /> Profile
                      </button>
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* USER PROFILE PIC */}
                <div className="h-10 w-10 p-0.5 rounded-full bg-gradient-to-tr from-blue-600 to-blue-300 shadow-md">
                  <img
                    src={
                      user?.image ||
                      `https://placehold.co/48x48/d8e7ff/1f4fa2?text=${firstLetter}`
                    }
                    className="h-full w-full rounded-full border-2 border-white object-cover"
                    alt="User Profile"
                  />
                </div>
              </div>
            </header>

            {/* CONTENT AREA */}
            <section className="p-4 md:p-8">
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-[#7f98c6]">
                <span
                  className="hover:text-blue-600 cursor-pointer"
                  onClick={() => navigate(`/${role}/dashboard`)}
                >
                  Dashboard
                </span>
                <span>/</span>
                <span className="capitalize text-blue-600 font-bold">
                  {title || "Overview"}
                </span>
              </div>
              <div className="min-h-[60vh]">
                <Outlet />
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav
        navItems={navItems}
        isAdmin={isAdmin}
        isDoctor={isDoctor}
      />

      <AIChatAssistant open={aiOpen} setOpen={setAiOpen} />
    </div>
  );
}

export default DashboardLayout;
