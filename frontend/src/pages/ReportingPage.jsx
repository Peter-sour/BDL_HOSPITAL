// src/pages/ReportingPage.jsx
import React from 'react';
import { BarChart3, Stethoscope, Briefcase, Users } from 'lucide-react';

// Data Laporan Dummy (Simulasi hasil dari V_LAPORAN_PASIEN)
const doctorPatientReport = [
  { 
    Nama_Dokter: 'dr. Siti Handayani', 
    Spesialisasi_Dokter: 'Anak', 
    Departemen_Dokter: 'Pediatri', 
    Total_Pasien_Ditangani: 45, 
    Daftar_Pasien_Nama: 'Ani Lestari; Bima Sakti; Dewi Indah; 42 pasien lainnya...' 
  },
  { 
    Nama_Dokter: 'dr. Rudi Prakoso', 
    Spesialisasi_Dokter: 'Bedah Umum', 
    Departemen_Dokter: 'Bedah', 
    Total_Pasien_Ditangani: 22, 
    Daftar_Pasien_Nama: 'Rian Pratama; Joko Susilo; 20 pasien lainnya...' 
  },
  { 
    Nama_Dokter: 'dr. Maria Kusuma', 
    Spesialisasi_Dokter: 'Kardiologi', 
    Departemen_Dokter: 'Jantung', 
    Total_Pasien_Ditangani: 33, 
    Daftar_Pasien_Nama: 'Sarah Wijayanto; Hendro T; 31 pasien lainnya...' 
  },
];

const ReportingPage = () => {
  // Mengagregasi data per departemen dari laporan per dokter (simulasi)
  const departmentAggregated = doctorPatientReport.reduce((acc, current) => {
    const dept = current.Departemen_Dokter;
    if (!acc[dept]) {
      acc[dept] = { totalPasien: 0, dokterCount: 0 };
    }
    acc[dept].totalPasien += current.Total_Pasien_Ditangani;
    acc[dept].dokterCount += 1;
    return acc;
  }, {});

  const departmentReport = Object.keys(departmentAggregated).map(key => ({
    departemen: key,
    ...departmentAggregated[key]
  }));

  return (
    <main className="p-6 space-y-8">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
        <BarChart3 className="w-6 h-6 text-blue-800" />
        <span>Laporan Pasien SIMRS (Berdasarkan V_LAPORAN_PASIEN)</span>
      </h3>
      
      {/* 1. Laporan Pasien Per Dokter (Sesuai Struktur VIEW Anda) */}
      <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-blue-600">
        <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Stethoscope className="w-5 h-5"/>
            <span>Pasien Ditangani Per Dokter</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Dokter</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Pasien</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Pasien (LISTAGG)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctorPatientReport.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.Nama_Dokter}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{item.Spesialisasi_Dokter}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold">{item.Total_Pasien_Ditangani}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{item.Daftar_Pasien_Nama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Laporan Agregasi Per Departemen */}
      <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-teal-500">
        <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-teal-600"/>
            <span>Pasien Ditangani Per Departemen</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Dokter</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Pasien (Kumulatif)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentReport.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.departemen}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.dokterCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-blue-600">{item.totalPasien}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </main>
  );
};

export default ReportingPage;   