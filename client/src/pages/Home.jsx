import { useEffect, useState } from "react";
import { 
  Star, Home as HomeIcon, LogIn, Stethoscope, 
  MessageSquare, Layers, CheckCircle, ArrowRight, Activity, Quote, User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../lib/axios.js";

const departmentsData = [
  { id: 1, name: "Cardiologist", icon: "❤️", color: "bg-red-50 text-red-600" },
  { id: 2, name: "Dermatologist", icon: "🧴", color: "bg-orange-50 text-orange-600" },
  { id: 3, name: "Neurologist", icon: "🧠", color: "bg-purple-50 text-purple-600" },
  { id: 4, name: "Orthopedic", icon: "🦴", color: "bg-emerald-50 text-emerald-600" },
  { id: 5, name: "Pediatrician", icon: "👶", color: "bg-blue-50 text-blue-600" },
  { id: 6, name: "Gyneologist", icon: "👩‍⚕️", color: "bg-pink-50 text-pink-600" },
  { id: 7, name: "General Physician", icon: "🏥", color: "bg-cyan-50 text-cyan-600" },
];

const Home = () => {
  const [data, setData] = useState({ topDoctors: [], topReviews: [], stats: {} });
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await axiosInstance.get("/home");
        setData({
          topDoctors: res.data?.data?.topDoctors || [],
          topReviews: res.data?.data?.topReviews || [],
          stats: res.data?.data?.stats || { totalDoctors: 50, totalPatients: 1200, totalAppointments: 3500 }
        });
      } catch (err) { console.error(err); }
    };
    fetchHome();
  }, []);

  // Redirect logic for protected actions
  const handleProtectedAction = (path = "/login") => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-slate-50 text-slate-900 pb-24 md:pb-0 font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-blue-600 p-2 rounded-lg"><Stethoscope className="text-white" size={20} /></div>
            <h1 className="text-2xl font-black text-blue-600 tracking-tight">CareSlot</h1>
          </div>
          <nav className="flex items-center gap-8 text-sm font-semibold text-slate-600">
            {['Departments', 'Doctors', 'Reviews'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-blue-600 transition-colors">
                {item}
              </button>
            ))}
            <button onClick={() => navigate("/login")} className="hover:text-blue-600">Login</button>
            <button onClick={() => handleProtectedAction("/patient/dashboard")} className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
              Book Now
            </button>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
            <Activity size={14}/> Best Doctors Management System
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900">
            Expert Care, <span className="text-blue-600">Simplified</span> For You.
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
            Connect with top-rated specialists and manage your medical appointments with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <button onClick={() => handleProtectedAction("/register")} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
              Get Started Free
            </button>
            <button onClick={() => scrollToSection("doctors")} className="bg-white border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50">
              View Specialists
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md md:max-w-none">
          <img src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg" className="w-full h-auto drop-shadow-2xl" alt="Medical Hero" />
        </div>
      </section>

      {/* ================= DEPARTMENTS (UPDATED) ================= */}
      <section id="departments" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Departments</h2>
          <p className="text-slate-500 mb-12">Find specialized care for every health need</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {departmentsData.map((dep) => (
              <div key={dep.id} className="group cursor-pointer p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                <div className={`w-16 h-16 ${dep.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {dep.icon}
                </div>
                <p className="font-bold text-slate-800 text-sm">{dep.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DOCTORS (SCROLLABLE) ================= */}
      <section id="doctors" className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Top Rated Doctors</h2>
            <button onClick={() => handleProtectedAction("/patient/book-doctor")} className="text-blue-600 font-bold flex items-center gap-1 hover:underline">Explore More <ArrowRight size={16}/></button>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x">
            {data.topDoctors.map((doc) => (
              <div key={doc._id} className="min-w-[300px] snap-center bg-white rounded-3xl p-4 border border-slate-200 hover:shadow-xl transition-all">
                <img src={doc.image || "https://via.placeholder.com/300"} className="w-full h-64 object-cover rounded-2xl mb-4" alt={doc.name} />
                <div className="px-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{doc.name}</h3>
                    <div className="flex items-center gap-1 text-sm font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg">
                      <Star size={14} fill="currentColor" /> {doc.rating}
                    </div>
                  </div>
                  <p className="text-blue-600 text-sm font-medium mb-4">{doc.specialization}</p>
                  <button 
                    onClick={() => handleProtectedAction(`/patient/doctors/${doc._id}`)}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Patient Feedback</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.topReviews.map((rev) => (
              <div key={rev._id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group">
                <Quote className="absolute top-6 right-8 text-blue-100" size={40} />
                <p className="text-slate-600 italic mb-6 text-sm">"{rev.comment}"</p>
                <div className="flex items-center gap-3">
                  <img src={rev.patientImage || `https://ui-avatars.com/api/?name=${rev.patientName}`} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="font-bold text-xs">{rev.patientName}</h4>
                    <div className="flex text-yellow-400"><Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 md:hidden z-[100] px-4 py-3 shadow-2xl">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button onClick={() => scrollToSection("top")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600">
            <HomeIcon size={20} /> <span className="text-[10px] font-bold uppercase">Home</span>
          </button>
          <button onClick={() => scrollToSection("departments")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600">
            <Layers size={20} /> <span className="text-[10px] font-bold uppercase">Depts</span>
          </button>
          <button onClick={() => handleProtectedAction("/patient/dashboard")} className="flex flex-col items-center -mt-8 bg-blue-600 p-4 rounded-full text-white shadow-xl shadow-blue-200">
            <Stethoscope size={24} />
          </button>
          <button onClick={() => scrollToSection("reviews")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600">
            <MessageSquare size={20} /> <span className="text-[10px] font-bold uppercase">Feed</span>
          </button>
          <button onClick={() => handleProtectedAction("/login")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600">
            <User size={20} /> <span className="text-[10px] font-bold uppercase">Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;