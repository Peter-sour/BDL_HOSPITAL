import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorAppointments = ({ user }) => {
  const [allAppointments, setAllAppointments] = useState([]); // Simpan semua data mentah
  const [view, setView] = useState('active'); // 'active' (Antrian) atau 'history' (Riwayat)
  const [loading, setLoading] = useState(true);

  // Load data saat halaman dibuka
  const fetchAppts = async () => {
    setLoading(true);
    try {
        // Kita ambil SEMUA data, nanti kita filter di frontend
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
    if(window.confirm(`Ubah status menjadi ${status}?`)) {
        try {
            await doctorAPI.updateAppointmentStatus(id, status);
            fetchAppts(); // Refresh data setelah update
        } catch(e) { alert('Gagal update status'); }
    }
  };

  // --- LOGIKA FILTERING (PISAHKAN AKTIF & SELESAI) ---
  const activeList = allAppointments.filter(a => ['Pending', 'Approved'].includes(a.status));
  const historyList = allAppointments.filter(a => ['Selesai', 'Rejected', 'Dibatalkan'].includes(a.status));

  // Tentukan list mana yang mau ditampilkan berdasarkan Tab yang dipilih
  const displayList = view === 'active' ? activeList : historyList;

  return (
    <DoctorLayout user={user} title="Kelola Janji Temu" subtitle="Konfirmasi dan atur jadwal pasien">
      
      {/* --- TAB SWITCHER (Antrian vs Riwayat) --- */}
      <div className="flex bg-white p-1 rounded-xl w-fit border border-slate-200 mb-6 shadow-sm">
          <button 
            onClick={() => setView('active')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'active' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Antrian Aktif ({activeList.length})
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'history' 
                ? 'bg-slate-700 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Riwayat Selesai ({historyList.length})
          </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
            <div className="p-10 text-center text-slate-400">Loading data...</div>
        ) : displayList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p className="text-slate-500 font-medium">
                    {view === 'active' ? 'Tidak ada antrian pasien saat ini.' : 'Belum ada riwayat janji temu.'}
                </p>
            </div>
        ) : (
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                    <th className="p-4">Pasien</th>
                    <th className="p-4">Jadwal</th>
                    <th className="p-4">Keluhan</th>
                    <th className="p-4">Status</th>
                    {view === 'active' && <th className="p-4 text-center">Aksi</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {displayList.map(a => (
                    <tr key={a.id_appointment} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                            <div className="font-bold text-slate-800">{a.nama_pasien}</div>
                            <div className="text-xs text-slate-400">{a.jenis_kelamin==='L'?'Laki-Laki':'Perempuan'} • {a.no_telepon || '-'}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                            <div className="font-medium">{new Date(a.tanggal_appointment).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
                            <div className="text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded mt-1">{a.jam_appointment} WIB</div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{a.keluhan}</td>
                        <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                a.status==='Approved' ? 'bg-green-100 text-green-700' :
                                a.status==='Pending' ? 'bg-yellow-100 text-yellow-700' :
                                a.status==='Selesai' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-500'
                            }`}>
                                {a.status}
                            </span>
                        </td>
                        
                        {/* Tombol Aksi HANYA muncul di Tab Aktif */}
                        {view === 'active' && (
                            <td className="p-4 text-center">
                                {a.status === 'Pending' && (
                                    <div className="flex justify-center gap-2">
                                        <button onClick={()=>handleStatus(a.id_appointment, 'Approved')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition" title="Terima">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button onClick={()=>handleStatus(a.id_appointment, 'Rejected')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Tolak">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                                {a.status === 'Approved' && (
                                    <button onClick={()=>handleStatus(a.id_appointment, 'Selesai')} className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm shadow-blue-200">
                                        ✔ Selesai Periksa
                                    </button>
                                )}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </DoctorLayout>
  );
};
export default DoctorAppointments;