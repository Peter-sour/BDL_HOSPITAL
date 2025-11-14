// src/components/Header.jsx
import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-20 flex justify-between items-center bg-white shadow px-6 py-4">
      {/* Tombol Menu untuk Mobile */}
      <button
        id="menu-btn"
        className="text-gray-500 md:hidden focus:outline-none"
        onClick={toggleSidebar}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Judul Dashboard */}
      <h2 className="text-xl font-semibold text-gray-700">Dashboard Admin</h2>

      {/* Area Notifikasi dan Profil */}
      <div className="flex items-center space-x-4">
        {/* Tombol Notifikasi */}
        <button className="text-gray-500 hover:text-gray-700">
          <Bell className="w-6 h-6" />
        </button>

        {/* Profil Admin */}
        <div className="flex items-center space-x-2">
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=1e3a8a&color=fff"
            className="w-8 h-8 rounded-full"
            alt="Admin Avatar"
          />
          <span className="font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;