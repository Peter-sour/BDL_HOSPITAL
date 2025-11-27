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
        const statsRes = await doctorAPI.getStatistics();
        setStats(statsRes.data.data);

        const apptRes = await doctorAPI.getAppointments('Approved');
        const today = new Date().toISOString().split('T')[0];
        const todayAppt = (apptRes.data.data || []).filter(a => a.tanggal_appointment.startsWith(today));
        setTodayAppointments(todayAppt);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen bg-emerald-50">Loading...</div>;

  return (
    <DoctorLayout user={user} title="Dashboard Dokter" subtitle="Ringkasan aktivitas praktik hari ini">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500">Total Pasien</p><h3 className="text-3xl font-bold text-slate-800">{stats.total_pasien}</h3></div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500">Janji Temu Total</p><h3 className="text-3xl font-bold text-slate-800">{stats.total_appointment}</h3></div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500">Resep Dibuat</p><h3 className="text-3xl font-bold text-slate-800">{stats.total_resep}</h3></div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500">Rating Dokter</p><h3 className="text-3xl font-bold text-yellow-500 flex items-center">{Number(stats.avg_rating).toFixed(1)} <span className="text-sm text-slate-400 ml-1 font-normal">/ 5.0</span></h3></div>
          <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Jadwal Praktik Hari Ini</h3>
            <span className="text-sm text-slate-500">{new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long'})}</span>
          </div>
          
          {todayAppointments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <p className="text-slate-400">Tidak ada jadwal pasien hari ini.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {todayAppointments.map(app => (
                 <div key={app.id_appointment} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="bg-emerald-100 text-emerald-700 font-bold px-3 py-2 rounded-lg text-sm text-center min-w-[70px]">
                          {app.jam_appointment}<br/><span className="text-xs font-normal">WIB</span>
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800">{app.nama_pasien}</h4>
                          <p className="text-sm text-slate-500 truncate max-w-[200px]">{app.keluhan}</p>
                       </div>
                    </div>
                    <Link to="/doctor/medical-records" className="text-sm font-semibold text-emerald-600 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50">Periksa</Link>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
           <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
              <h3 className="font-bold text-lg mb-2">Mulai Periksa Pasien</h3>
              <p className="text-emerald-100 text-sm mb-6">Akses rekam medis dan buat resep obat dengan cepat.</p>
              <Link to="/doctor/medical-records" className="block w-full bg-white text-emerald-700 text-center py-3 rounded-xl font-bold hover:bg-emerald-50 transition">
                  Input Rekam Medis
              </Link>
           </div>
           
           <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-4">Aksi Lainnya</h4>
              <div className="space-y-2">
                 <Link to="/doctor/appointments" className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition text-slate-600 text-sm font-medium">
                    <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center mr-3">📅</span> Kelola Janji Temu
                 </Link>
                 <Link to="/doctor/patients" className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition text-slate-600 text-sm font-medium">
                    <span className="w-8 h-8 bg-purple-50 text-purple-600 rounded flex items-center justify-center mr-3">👥</span> Database Pasien
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;