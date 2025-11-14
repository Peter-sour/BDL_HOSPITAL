// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom'; // Import Link dan useLocation
import { Activity, LayoutDashboard, User, Stethoscope, Pill, FileText, CreditCard,DollarSign,BarChart3 } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation(); // Hook untuk mengetahui path saat ini
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');
  
  // Menggunakan Link untuk navigasi
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
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
      className={`bg-blue-800 text-white w-64 space-y-6 py-7 px-4 fixed inset-y-0 left-0
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 md:z-auto`}
    >
      <div className="flex items-center space-x-2 px-4">
        <Activity className="w-6 h-6" />
        <h1 className="text-2xl font-bold">SIMRS</h1>
      </div>

      <nav className="mt-10 space-y-2">
        {/* Menggunakan 'to' alih-alih 'href' */}
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/pasien" icon={User} label="Pasien" />
        <NavItem to="/dokter" icon={Stethoscope} label="Dokter" />
        <NavItem to="/obat" icon={Pill} label="Obat" />
        <NavItem to="/resep" icon={FileText} label="Resep" />
        <NavItem to="/pembayaran" icon={CreditCard} label="Pembayaran" />
        <NavItem to="/tagihan" icon={DollarSign} label="Hitung Tagihan" />
        <NavItem to="/laporan" icon={BarChart3} label="Laporan" />
      </nav>
    </aside>
  );
};

export default Sidebar;