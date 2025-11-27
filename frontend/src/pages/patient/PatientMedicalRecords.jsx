import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientMedicalRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    patientAPI.getMedicalRecords().then(res => setRecords(res.data.data || [])).catch(console.error);
  }, []);

  return (
    <PatientLayout user={user} title="Rekam Medis" subtitle="Riwayat kesehatan dan diagnosa dokter">
       <div className="space-y-6">
        {records.length === 0 ? <p className="text-center text-slate-400 py-10">Tidak ada data rekam medis.</p> : 
          records.map((rec) => (
            <div key={rec.id_rekam} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition duration-300">
               {/* Icon / Date Side */}
               <div className="flex-shrink-0 flex md:flex-col items-center md:w-32 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <div className="text-center">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">ID Rekam</span>
                      <span className="block text-sm font-mono text-slate-700">{rec.id_rekam.slice(-6)}</span>
                  </div>
               </div>
               
               {/* Content Side */}
               <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{rec.diagnosa}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-sm text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                     <span>{rec.nama_dokter} <span className="text-blue-400">|</span> {rec.spesialis}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100">
                      <span className="font-semibold text-slate-800 block mb-1">Catatan Medis:</span>
                      {rec.catatan}
                  </div>
               </div>
            </div>
          ))
        }
       </div>
    </PatientLayout>
  );
};
export default PatientMedicalRecords;