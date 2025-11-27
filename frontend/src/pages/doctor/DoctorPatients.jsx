import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorPatients = ({ user }) => {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    doctorAPI.getPatients().then(res => setPatients(res.data.data || []));
  }, []);

  return (
    <DoctorLayout user={user} title="Database Pasien" subtitle="Daftar pasien yang pernah Anda tangani">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {patients.map(p => (
               <div key={p.id_pasien} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
                   <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                       {p.nama.charAt(0)}
                   </div>
                   <div>
                       <h4 className="font-bold text-slate-800">{p.nama}</h4>
                       <p className="text-sm text-slate-500">{p.jenis_kelamin==='L'?'Pria':'Wanita'} • {new Date().getFullYear() - new Date(p.tanggal_lahir).getFullYear()} Th</p>
                       <p className="text-xs text-slate-400 mt-1">{p.no_telepon || '-'}</p>
                   </div>
               </div>
           ))}
           {patients.length===0 && <p className="col-span-3 text-center text-slate-400">Belum ada data pasien.</p>}
       </div>
    </DoctorLayout>
  );
};
export default DoctorPatients;