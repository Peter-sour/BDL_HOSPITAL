import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorDashboard = ({ user }) => {
  const [stats, setStats] = useState({ total_pasien: 0, total_appointment: 0, total_rekam: 0, total_resep: 0, avg_rating: 0 });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Ambil Statistik
        const statsRes = await doctorAPI.getStatistics();
        setStats(statsRes.data.data);

        // 2. Ambil Appointment yang sudah disetujui (Approved)
        const apptRes = await doctorAPI.getAppointments('Approved');
        const allApproved = apptRes.data.data || [];

        // 3. FILTER TANGGAL HARI INI (LOGIKA DIPERBAIKI)
        const today = new Date();
        
        const todayList = allApproved.filter(a => {
            const aptDate = new Date(a.tanggal_appointment);
            
            // Bandingkan Tanggal, Bulan, dan Tahun Local
            return (
                aptDate.getDate() === today.getDate() &&
                aptDate.getMonth() === today.getMonth() &&
                aptDate.getFullYear() === today.getFullYear()
            );
        });

        setTodayAppointments(todayList);

      } catch (err) { 
        console.error("Gagal memuat dashboard:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen bg-emerald-50">Loading...</div>;

  return (
    <DoctorLayout user={user} title="Dashboard Dokter" subtitle="Ringkasan aktivitas praktik hari ini">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500 font-medium">Total Pasien</p><h3 className="text-3xl font-bold text-slate-800">{stats.total_pasien}</h3></div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500 font-medium">Janji Temu Total</p><h3 className="text-3xl font-bold text-slate-800">{stats.total_appointment}</h3></div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500 font-medium">Resep Dibuat</p><h3 className="text-3xl font-bold text-slate-800">{stats.total_resep}</h3></div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500 font-medium">Rating Dokter</p><h3 className="text-3xl font-bold text-yellow-500 flex items-center">{Number(stats.avg_rating).toFixed(1)} <span className="text-sm text-slate-400 ml-1 font-normal">/ 5.0</span></h3></div>
          <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                <h3 className="font-bold text-slate-800 text-lg">Jadwal Praktik Hari Ini</h3>
            </div>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long'})}
            </span>
          </div>
          
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <div className="text-4xl mb-2">📅</div>
               <p className="text-slate-500 font-medium">Tidak ada pasien terjadwal hari ini.</p>
               <p className="text-xs text-slate-400 mt-1">Cek menu "Janji Temu" untuk melihat permintaan pasien.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {todayAppointments.map(app => (
                 <div key={app.id_appointment} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                       <div className="bg-emerald-100 text-emerald-700 font-bold px-4 py-3 rounded-xl text-center min-w-[80px]">
                          <span className="text-lg block">{app.jam_appointment}</span>
                          <span className="text-[10px] font-normal uppercase tracking-wider">WIB</span>
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-lg">{app.nama_pasien}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                             <span>{app.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                             <span>•</span>
                             <span className="truncate max-w-[200px]">"{app.keluhan}"</span>
                          </div>
                       </div>
                    </div>
                    <Link to="/doctor/medical-records" className="text-sm font-bold text-white bg-emerald-600 px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
                        Periksa
                    </Link>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <h3 className="font-bold text-xl mb-2 relative z-10">Mulai Periksa</h3>
              <p className="text-emerald-100 text-sm mb-6 relative z-10">Input diagnosa dan resep obat pasien sekarang.</p>
              
              <Link to="/doctor/medical-records" className="block w-full bg-white text-emerald-700 text-center py-3.5 rounded-xl font-bold hover:bg-emerald-50 transition relative z-10">
                  Input Rekam Medis
              </Link>
           </div>
           
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span> Pintasan
              </h4>
              <div className="space-y-3">
                 <Link to="/doctor/appointments" className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition text-slate-600 font-medium group border border-transparent hover:border-slate-100">
                    <span className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition">📅</span> 
                    Kelola Janji Temu
                 </Link>
                 <Link to="/doctor/patients" className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition text-slate-600 font-medium group border border-transparent hover:border-slate-100">
                    <span className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-100 transition">👥</span> 
                    Database Pasien
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;