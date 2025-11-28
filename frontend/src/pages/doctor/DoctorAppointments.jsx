import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';
// Import Ikon
import { Calendar, Clock, User, CheckCircle, XCircle, Activity } from 'lucide-react';

const DoctorAppointments = ({ user }) => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [view, setView] = useState('active'); // 'active' or 'history'
  const [loading, setLoading] = useState(true);

  const fetchAppts = async () => {
    setLoading(true);
    try {
        const res = await doctorAPI.getAppointments(''); 
        setAllAppointments(res.data.data || []);
    } catch(e) { 
        console.error(e); 
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchAppts(); }, []);

  const handleStatus = async (id, status) => {
    const confirmMsg = status === 'Approved' ? 'Terima pasien ini?' : status === 'Rejected' ? 'Tolak pasien ini?' : 'Selesaikan sesi pemeriksaan?';
    if(window.confirm(confirmMsg)) {
        try {
            await doctorAPI.updateAppointmentStatus(id, status);
            fetchAppts(); 
        } catch(e) { alert('Gagal update status'); }
    }
  };

  const activeList = allAppointments.filter(a => ['Pending', 'Approved'].includes(a.status));
  const historyList = allAppointments.filter(a => ['Selesai', 'Rejected', 'Dibatalkan'].includes(a.status));
  
  const displayList = view === 'active' ? activeList : historyList;

  // Helper Badge Status
  const getStatusBadge = (status) => {
    switch(status) {
        case 'Approved': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Siap Diperiksa</span>;
        case 'Pending': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Menunggu Konfirmasi</span>;
        case 'Selesai': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Selesai</span>;
        case 'Rejected': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Ditolak</span>;
        default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">{status}</span>;
    }
  };

  return (
    <DoctorLayout user={user} title="Kelola Janji Temu" subtitle="Konfirmasi dan atur jadwal pasien">
      
      {/* --- TAB SWITCHER --- */}
      <div className="flex bg-white p-1.5 rounded-2xl w-fit border border-slate-200 mb-8 shadow-sm">
          <button 
            onClick={() => setView('active')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === 'active' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Antrian Aktif
            <span className={`px-2 py-0.5 rounded-md text-xs ${view==='active'?'bg-emerald-500 text-white':'bg-slate-200 text-slate-600'}`}>{activeList.length}</span>
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === 'history' 
                ? 'bg-slate-700 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Riwayat Selesai
            <span className={`px-2 py-0.5 rounded-md text-xs ${view==='history'?'bg-slate-600 text-white':'bg-slate-200 text-slate-600'}`}>{historyList.length}</span>
          </button>
      </div>

      {loading ? (
          <div className="text-center py-12 text-slate-400">Loading data...</div>
      ) : displayList.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Activity size={32} />
              </div>
              <p className="text-slate-500 font-medium">
                  {view === 'active' ? 'Tidak ada antrian pasien saat ini.' : 'Belum ada riwayat janji temu.'}
              </p>
          </div>
      ) : (
          <div className="space-y-4">
            {displayList.map((appt, index) => {
                const isFirst = index === 0;
                
                return (
                    <div 
                        key={appt.id_appointment} 
                        className={`bg-white p-6 rounded-3xl shadow-sm border transition duration-300 hover:shadow-lg relative overflow-hidden ${
                            isFirst 
                            ? (view === 'active' ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200 ring-1 ring-slate-100')
                            : 'border-slate-100'
                        }`}
                    >
                        {/* --- LABEL OTOMATIS (POJOK KANAN ATAS) --- */}
                        {isFirst && (
                            <div className={`absolute top-0 right-0 px-5 py-1.5 rounded-bl-2xl text-[10px] font-extrabold tracking-widest text-white shadow-sm ${
                                view === 'active' ? 'bg-emerald-600' : 'bg-slate-500'
                            }`}>
                                {view === 'active' ? 'ANTRIAN PRIORITAS' : 'RIWAYAT TERAKHIR'}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            
                            {/* KIRI: Info Pasien & Waktu */}
                            <div className="flex items-start gap-5">
                                {/* Date Box */}
                                <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl shrink-0 ${view === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                                    <span className="text-2xl font-bold">{new Date(appt.tanggal_appointment).getDate()}</span>
                                    <span className="text-xs uppercase font-bold">{new Date(appt.tanggal_appointment).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                </div>

                                <div>
                                    <h4 className="font-bold text-xl text-slate-800 mb-1">{appt.nama_pasien}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                        <User size={14} />
                                        <span>{appt.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                        <span>•</span>
                                        <span>{appt.no_telepon || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock size={14} className={view==='active' ? "text-emerald-600" : "text-slate-400"} />
                                        <span className={view==='active' ? "text-emerald-700" : "text-slate-500"}>
                                            {appt.jam_appointment} WIB
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* TENGAH: Keluhan */}
                            <div className="flex-1 w-full md:w-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Keluhan Utama</p>
                                <p className="text-sm text-slate-700 line-clamp-2">"{appt.keluhan}"</p>
                            </div>

                            {/* KANAN: Status & Aksi */}
                            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                {getStatusBadge(appt.status)}

                                {/* Tombol Aksi (Hanya di Tab Active) */}
                                {view === 'active' && (
                                    <div className="flex gap-2 mt-1">
                                        {appt.status === 'Pending' && (
                                            <>
                                                <button onClick={()=>handleStatus(appt.id_appointment, 'Approved')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm shadow-emerald-200">
                                                    <CheckCircle size={16} /> Terima
                                                </button>
                                                <button onClick={()=>handleStatus(appt.id_appointment, 'Rejected')} className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                                                    <XCircle size={16} /> Tolak
                                                </button>
                                            </>
                                        )}
                                        {appt.status === 'Approved' && (
                                            <button onClick={()=>handleStatus(appt.id_appointment, 'Selesai')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-blue-200 animate-pulse">
                                                ✔ Selesai Periksa
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
      )}
    </DoctorLayout>
  );
};
export default DoctorAppointments;