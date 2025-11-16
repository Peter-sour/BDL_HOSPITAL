// src/pages/ReportingPage.jsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Stethoscope, Briefcase, Loader2, AlertTriangle } from 'lucide-react';

const ReportingPage = () => {
  // State untuk menyimpan data laporan dari API
  const [doctorReport, setDoctorReport] = useState([]);
  const [departmentReport, setDepartmentReport] = useState([]);
  // State untuk status proses
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL dasar API
  const API_BASE_URL = 'http://localhost:5000/api/reports';

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // --- 1. Ambil Laporan Pasien Per Dokter ---
      const resDoctor = await fetch(`${API_BASE_URL}/pasien-per-dokter`);
      const dataDoctor = await resDoctor.json();
      
      if (dataDoctor.success) {
        // Data dari Oracle/Controller dikembalikan dengan nama kolom HURUF KAPITAL
        setDoctorReport(dataDoctor.data);
      } else {
        throw new Error(dataDoctor.message || 'Gagal mengambil laporan dokter.');
      }

      // --- 2. Ambil Laporan Pasien Per Departemen ---
      const resDepartment = await fetch(`${API_BASE_URL}/pasien-per-departemen`);
      const dataDepartment = await resDepartment.json();
      
      if (dataDepartment.success) {
        // Data dari Oracle/Controller dikembalikan dengan nama kolom HURUF KAPITAL
        setDepartmentReport(dataDepartment.data);
      } else {
        throw new Error(dataDepartment.message || 'Gagal mengambil laporan departemen.');
      }

    } catch (err) {
      console.error("Error fetching reports:", err);
      // Pesan error untuk user
      setError(`Gagal memuat data laporan dari server. Error: ${err.message}. Pastikan server berjalan di port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchData saat komponen dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // =============================================
  // Render Status (Loading/Error)
  // =============================================

  if (loading) {
    return (
        <div className="p-8 flex justify-center items-center h-96 bg-gray-50 rounded-lg shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-4 text-xl font-medium text-gray-600">Memuat data laporan dari server...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-6 m-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md flex items-start">
            <AlertTriangle className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
            <div>
                <p className="font-bold mb-1">Terjadi Kesalahan Koneksi</p>
                <p className="text-sm">{error}</p>
            </div>
        </div>
    );
  }

  // =============================================
  // Render Laporan Utama
  // =============================================

  return (
    <main className="p-6 space-y-8">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2 border-b pb-2">
        <BarChart3 className="w-6 h-6 text-blue-800" />
        <span>Laporan Pasien SIMRS (Data Dinamis)</span>
      </h3>
      
      {/* 1. Laporan Pasien Per Dokter */}
      <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-blue-600">
        <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-blue-600"/>
            <span>Pasien Ditangani Per Dokter</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Dokter</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Pasien</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Kunjungan</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Kunjungan Terakhir</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctorReport.length > 0 ? (
                doctorReport.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Menggunakan properti HURUF KAPITAL sesuai hasil dari Oracle */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.NAMA_DOKTER}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.SPESIALIS}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-blue-600">{item.JUMLAH_PASIEN}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.JUMLAH_KUNJUNGAN}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{item.KUNJUNGAN_TERAKHIR}</td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="5" className="px-4 py-3 text-center text-gray-500 italic">Tidak ada data pasien per dokter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Laporan Pasien Per Departemen */}
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
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Pasien</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Kunjungan</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Rata-rata/Dokter</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentReport.length > 0 ? (
                departmentReport.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Menggunakan properti HURUF KAPITAL sesuai hasil dari Oracle */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.DEPARTEMEN}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.JUMLAH_DOKTER}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-teal-600">{item.JUMLAH_PASIEN}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.TOTAL_KUNJUNGAN}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.RATA_RATA_PER_DOKTER}</td>
                  </tr>
                ))
              ) : (
                 <tr>
                    <td colSpan="5" className="px-4 py-3 text-center text-gray-500 italic">Tidak ada data pasien per departemen.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </main>
  );
};

export default ReportingPage;