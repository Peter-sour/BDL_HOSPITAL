// src/pages/patient/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout'; // Pastikan path ini benar sesuai struktur foldermu
import { patientAPI } from '../../services/api';

const PatientDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    appointments: 0,
    medicalRecords: 0,
    prescriptions: 0,
    pendingBills: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const appointmentsRes = await patientAPI.getAppointments();
      const recordsRes = await patientAPI.getMedicalRecords();
      const prescriptionsRes = await patientAPI.getPrescriptions();
      const billsRes = await patientAPI.getBills('Belum Bayar');

      setStats({
        appointments: (appointmentsRes.data.data || []).length,
        medicalRecords: (recordsRes.data.data || []).length,
        prescriptions: (prescriptionsRes.data.data || []).length,
        pendingBills: (billsRes.data.data || []).length
      });

      setRecentAppointments((appointmentsRes.data.data || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Approved': 'bg-green-100 text-green-700',
      'Selesai': 'bg-blue-100 text-blue-700',
      'Dibatalkan': 'bg-slate-100 text-slate-600',
      'Rejected': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout 
      user={user} 
      title="Dashboard Overview" 
      subtitle={`Selamat datang kembali, ${user?.detail?.nama || 'Pasien'}`}
    >
      
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Janji Temu</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.appointments}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>

        {/* Card: Medical Records */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Rekam Medis</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.medicalRecords}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        </div>

        {/* Card: Prescriptions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Resep Obat</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.prescriptions}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
        </div>

        {/* Card: Bills */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Tagihan Aktif</p>
            <h3 className={`text-3xl font-bold ${stats.pendingBills > 0 ? 'text-red-500' : 'text-slate-800'}`}>{stats.pendingBills}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* 2. RECENT APPOINTMENTS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Jadwal Terkini</h3>
            <Link to="/patient/appointments" className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</Link>
          </div>
          
          <div className="p-6 overflow-x-auto">
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Belum ada jadwal konsultasi.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3">Dokter</th>
                      <th className="pb-3">Waktu</th>
                      <th className="pb-3 text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id_appointment}>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-slate-800">{apt.nama_dokter}</div>
                        <div className="text-xs text-slate-500">{apt.spesialis}</div>
                      </td>
                      <td className="py-4 text-sm text-slate-600">
                        {new Date(apt.tanggal_appointment).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                        <br/>
                        <span className="text-xs text-slate-400">{apt.jam_appointment} WIB</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <h3 className="font-bold text-lg mb-2">Perlu Konsultasi?</h3>
              <p className="text-blue-100 text-sm mb-6">Buat janji temu dengan dokter spesialis kami dengan mudah dan cepat.</p>
              <Link to="/patient/appointments" className="block w-full bg-white text-blue-700 text-center py-3 rounded-xl font-bold hover:bg-blue-50 transition">
                  Buat Janji Baru
              </Link>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                  <Link to="/patient/bills" className="flex items-center p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mr-3 group-hover:bg-red-100 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </div>
                      <span className="font-medium text-slate-600 group-hover:text-slate-900">Bayar Tagihan</span>
                  </Link>
                  <Link to="/patient/prescriptions" className="flex items-center p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mr-3 group-hover:bg-purple-100 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <span className="font-medium text-slate-600 group-hover:text-slate-900">Lihat Obat Saya</span>
                  </Link>
              </div>
           </div>
        </div>

      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;