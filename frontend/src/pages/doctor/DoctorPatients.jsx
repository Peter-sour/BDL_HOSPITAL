import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';
import { User, Clock, MapPin } from 'lucide-react'; 
import { Link } from 'react-router-dom';

const DoctorPatients = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
        try {
            // Mengambil semua pasien yang pernah ditangani
            const res = await doctorAPI.getPatients(); 
            setPatients(res.data.data || []);
        } catch(e) { 
            console.error(e); 
        } finally {
            setLoading(false);
        }
    };
    fetchPatients();
  }, []);
  
  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) return <div className="text-center py-10">Loading data...</div>;

  return (
    <DoctorLayout user={user} title="Pasien Saya" subtitle="Database riwayat pasien yang pernah Anda tangani">
       
       <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
           <h3 className="font-bold text-slate-700">Total Pasien Ditangani: {patients.length}</h3>
           
           {/* --- KETERANGAN / LEGEND --- */}
           <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
               <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-purple-200 border border-purple-400"></span>
                  Rawat Inap (Kritis)
              </div>
               <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400"></span>
                  Rawat Jalan (Standar)
              </div>
          </div>
           {/* ---------------------------- */}

       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {patients.map(p => (
               <div key={p.id_pasien} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                   
                   {/* Header & Status */}
                   <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                               {p.nama.charAt(0)}
                           </div>
                           <div>
                               <h4 className="font-bold text-slate-800">{p.nama}</h4>
                               {/* BADGE STATUS RAWAT INAP/JALAN */}
                               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                   p.status_rawat === 'Rawat Inap' 
                                   ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                   : 'bg-blue-100 text-blue-700 border-blue-200'
                               }`}>
                                   {p.status_rawat}
                               </span>
                           </div>
                       </div>
                   </div>

                   {/* Detail Info */}
                   <div className="space-y-2 text-sm text-slate-600">
                       <div className="flex gap-2 items-center"><User size={14} className="text-slate-400" /> 
                          {p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} / {calculateAge(p.tanggal_lahir)} Tahun
                       </div>
                       <div className="flex gap-2 items-center"><Clock size={14} className="text-slate-400" /> 
                          {p.no_telepon || 'No. Telp Tidak Ada'}
                       </div>
                       <div className="flex gap-2 items-start"><MapPin size={14} className="text-slate-400 mt-1" /> 
                          <span className="text-xs">{p.alamat || 'Alamat Tidak Tercatat'}</span>
                       </div>
                   </div>

                   {/* Footer Action */}
                   <div className="mt-4 pt-4 border-t border-slate-100">
                       <Link 
                            to={`/doctor/medical-records?pasien=${p.id_pasien}`} 
                            className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center justify-end"
                       >
                           Lihat Riwayat & Rekam Medis →
                       </Link>
                   </div>
               </div>
           ))}
           {patients.length===0 && <p className="col-span-3 text-center text-slate-400">Belum ada pasien yang ditangani.</p>}
       </div>
    </DoctorLayout>
  );
};
export default DoctorPatients;