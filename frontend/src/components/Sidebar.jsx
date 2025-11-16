// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Bed, Activity, LayoutDashboard, User, Stethoscope, Pill, FileText, CreditCard, DollarSign, BarChart3 } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
        isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <aside
      id="sidebar"
      className={`bg-blue-800 text-white w-64 fixed inset-y-0 left-0 
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition duration-200 ease-in-out z-30 
        overflow-y-auto`}
    >
      {/* Header Sidebar - Fixed di atas */}
      <div className="sticky top-0 bg-blue-800 z-10 py-6 px-4 border-b border-blue-700">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">SIMRS</h1>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="py-6 px-4 space-y-2">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/pasien" icon={User} label="Pasien" />
        <NavItem to="/rawat-inap" icon={Bed} label="Rawat Inap" />
        <NavItem to="/dokter" icon={Stethoscope} label="Dokter" />
        <NavItem to="/obat" icon={Pill} label="Obat" />
        <NavItem to="/resep" icon={FileText} label="Resep" />
        <NavItem to="/pembayaran" icon={CreditCard} label="Pembayaran" />
        <NavItem to="/tagihan" icon={DollarSign} label="Hitung Tagihan" />
        <NavItem to="/laporan" icon={BarChart3} label="Laporan" />
      </nav>

      {/* Footer Sidebar (Optional) */}
      <div className="sticky bottom-0 bg-blue-800 border-t border-blue-700 py-4 px-4">
        <p className="text-xs text-blue-300 text-center">
          © 2025 SIMRS Hospital
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;