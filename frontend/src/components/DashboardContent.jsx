// src/components/DashboardContent.jsx
import React from 'react';
import { Users, Stethoscope, Pill, CreditCard } from 'lucide-react';

// Komponen Pembantu untuk Kartu Statistik
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
    <div>
      <h4 className="text-gray-500">{title}</h4>
      {/* Menggunakan kelas yang lebih kecil untuk nilai Rupiah agar sesuai di kartu */}
      <p className={`font-bold text-gray-800 mt-1 ${title === 'Transaksi Hari Ini' ? 'text-xl' : 'text-3xl'}`}>
        {value}
      </p>
    </div>
    <div className={`p-3 rounded-xl ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
  </div>
);

const DashboardContent = () => {
  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700">Ringkasan Sistem</h3>

      {/* Statistik Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Pasien Card */}
        <StatCard
          title="Total Pasien"
          value="120"
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />

        {/* Dokter Card */}
        <StatCard
          title="Total Dokter"
          value="45"
          icon={Stethoscope}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />

        {/* Obat Card (Menggunakan warna merah untuk indikator stok rendah) */}
        <StatCard
          title="Stok Obat Rendah"
          value="8"
          icon={Pill}
          iconBg="bg-red-100"
          iconColor="text-red-700"
        />

        {/* Transaksi Card */}
        <StatCard
          title="Transaksi Hari Ini"
          value="Rp25.000.000"
          icon={CreditCard}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />
      </div>

      {/* Grafik / Chart Placeholder */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Grafik Kunjungan Pasien</h4>
        <div className="w-full h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          <p>Placeholder untuk area Grafik (Anda dapat mengintegrasikan Recharts, Chart.js, dll. di sini)</p>
        </div>
      </div>
    </main>
  );
};

export default DashboardContent;