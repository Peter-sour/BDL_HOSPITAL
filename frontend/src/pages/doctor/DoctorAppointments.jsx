import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState(''); // '' = all, 'Pending', 'Approved'

  const fetchAppts = async () => {
    try {
        const res = await doctorAPI.getAppointments(filter);
        setAppointments(res.data.data || []);
    } catch(e) { console.error(e) }
  };

  useEffect(() => { fetchAppts(); }, [filter]);

  const handleStatus = async (id, status) => {
    if(window.confirm(`Ubah status menjadi ${status}?`)) {
        try {
            await doctorAPI.updateAppointmentStatus(id, status);
            fetchAppts();
        } catch(e) { alert('Gagal update status'); }
    }
  };

  return (
    <DoctorLayout user={user} title="Kelola Janji Temu" subtitle="Konfirmasi permintaan konsultasi pasien">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'Pending', 'Approved', 'Selesai', 'Dibatalkan'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${filter===f ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                {f || 'Semua'}
            </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
               <tr><th className="p-4">Pasien</th><th className="p-4">Waktu</th><th className="p-4">Keluhan</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
               {appointments.map(a => (
                   <tr key={a.id_appointment} className="hover:bg-slate-50/50">
                       <td className="p-4">
                           <div className="font-bold text-slate-800">{a.nama_pasien}</div>
                           <div className="text-xs text-slate-400">{a.jenis_kelamin==='L'?'Laki-Laki':'Perempuan'} • {a.no_telepon}</div>
                       </td>
                       <td className="p-4 text-sm text-slate-600">
                           {new Date(a.tanggal_appointment).toLocaleDateString()}<br/>
                           <span className="font-mono text-xs">{a.jam_appointment}</span>
                       </td>
                       <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{a.keluhan}</td>
                       <td className="p-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                               a.status==='Approved' ? 'bg-green-100 text-green-700' :
                               a.status==='Pending' ? 'bg-yellow-100 text-yellow-700' :
                               'bg-slate-100 text-slate-500'
                           }`}>{a.status}</span>
                       </td>
                       <td className="p-4">
                           {a.status === 'Pending' && (
                               <div className="flex gap-2">
                                   <button onClick={()=>handleStatus(a.id_appointment, 'Approved')} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700">Terima</button>
                                   <button onClick={()=>handleStatus(a.id_appointment, 'Rejected')} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600">Tolak</button>
                               </div>
                           )}
                           {a.status === 'Approved' && (
                               <button onClick={()=>handleStatus(a.id_appointment, 'Selesai')} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Selesai Periksa</button>
                           )}
                       </td>
                   </tr>
               ))}
           </tbody>
        </table>
        {appointments.length===0 && <div className="p-8 text-center text-slate-400">Tidak ada data janji temu.</div>}
      </div>
    </DoctorLayout>
  );
};
export default DoctorAppointments;