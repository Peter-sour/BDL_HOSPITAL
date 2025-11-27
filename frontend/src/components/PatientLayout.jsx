// src/components/PatientLayout.js
import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
// 1. Import Ikon dari Lucide React
import { 
  LayoutDashboard, 
  CalendarClock, 
  ClipboardList, 
  Pill,           // <--- Ini ikon Resep Obat yang kamu mau
  CreditCard, 
  User, 
  LogOut, 
  Menu,           // Ikon Hamburger
  Activity        // Ikon Brand
} from 'lucide-react';

const PatientLayout = ({ children, title, subtitle, user }) => {
  const location = useLocation();
  const history = useHistory();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    history.push('/login');
  };

  // 2. Gunakan Ikon Lucide di sini
  const menuItems = [
    { path: '/patient/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { path: '/patient/appointments', label: 'Janji Temu', icon: <CalendarClock size={22} /> },
    { path: '/patient/medical-records', label: 'Rekam Medis', icon: <ClipboardList size={22} /> },
    { path: '/patient/prescriptions', label: 'Resep Obat', icon: <Pill size={22} /> }, // <--- GANTENG KAN?
    { path: '/patient/bills', label: 'Tagihan', icon: <CreditCard size={22} /> },
    { path: '/patient/profile', label: 'Profil Saya', icon: <User size={22} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      
      {/* --- SIDEBAR DINAMIS --- */}
      <aside 
        className={`flex flex-col py-4 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64 px-4' : 'w-20 px-2'} shrink-0`}
      >
        {/* Toggle Button & Brand */}
        <div className={`h-16 flex items-center mb-4 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          
          {/* Logo / Brand */}
          {isExpanded && (
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Activity size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-700">SIMRS</span>
            </div>
          )}

          {/* Tombol Hamburger */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition"
            title={isExpanded ? "Kecilkan Menu" : "Perbesar Menu"}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 py-3 rounded-full transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-100 text-blue-800 font-bold' 
                    : 'text-slate-500 hover:bg-slate-200'
                } ${isExpanded ? 'px-4' : 'justify-center px-0'}`}
              >
                {/* Icon */}
                <span className={`shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                
                {/* Label (Collapsed Logic) */}
                {isExpanded && (
                    <span className="whitespace-nowrap overflow-hidden transition-opacity duration-200">
                        {item.label}
                    </span>
                )}

                {/* Tooltip Hover saat Mengecil */}
                {!isExpanded && (
                    <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                        {item.label}
                    </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile di Bawah */}
        <div className={`mt-auto pt-4 border-t border-slate-200 ${isExpanded ? '' : 'flex flex-col items-center'}`}>
            <div className={`flex items-center gap-3 mb-2 ${isExpanded ? 'px-2' : 'justify-center'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                    {(user?.detail?.nama || 'U').charAt(0)}
                </div>
                {isExpanded && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{user?.detail?.nama || user?.username}</p>
                        <p className="text-xs text-slate-400">Pasien</p>
                    </div>
                )}
            </div>
            
            <button 
                onClick={handleLogout}
                className={`flex items-center gap-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors ${isExpanded ? 'px-4 w-full' : 'p-2 justify-center w-fit'}`}
                title="Keluar"
            >
                <LogOut size={20} className="shrink-0" />
                {isExpanded && <span>Keluar</span>}
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (FLOATING CARD EFFECT) --- */}
      <main className="flex-1 flex flex-col h-screen py-2 pr-2 overflow-hidden">
        <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
            
            {/* Header Sticky */}
            <header className="h-16 flex items-center justify-between px-8 border-b border-slate-50 bg-white sticky top-0 z-10 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
                {/* Hiasan Kanan */}
                <div className="p-2 bg-slate-50 rounded-full text-slate-400">
                    <Activity size={20} />
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;