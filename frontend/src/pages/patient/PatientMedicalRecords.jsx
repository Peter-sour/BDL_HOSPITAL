import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientMedicalRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await patientAPI.getMedicalRecords();
        setRecords(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Helper: Ambil tanggal dari ID (Format: RM + Timestamp)
  const getDateFromID = (idString) => {
    try {
      // Ambil angka saja dari string ID (misal RM1732...) -> 1732...
      const timestamp = parseInt(idString.replace(/\D/g, ''));
      if (!timestamp) return new Date();
      return new Date(timestamp);
    } catch (e) {
      return new Date();
    }
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center py-10">Loading data...</div>;

  return (
    <PatientLayout user={user} title="Rekam Medis" subtitle="Riwayat perjalanan kesehatan Anda">
      
      <div className="max-w-4xl mx-auto">
        {records.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            Belum ada riwayat pemeriksaan.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 pb-8">
            {records.map((rec, index) => {
              const recordDate = getDateFromID(rec.id_rekam);
              const isNewest = index === 0; // Cek apakah ini data paling atas (Terbaru)

              return (
                <div key={rec.id_rekam} className="relative pl-8 md:pl-12 group">
                  
                  {/* TIMELINE DOT (Beda warna kalau terbaru) */}
                  <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 transition-transform duration-300 group-hover:scale-125 ${
                    isNewest ? 'bg-emerald-500 border-emerald-200' : 'bg-white border-slate-300'
                  }`}></div>

                  {/* CARD CONTENT */}
                  <div className={`p-6 rounded-2xl shadow-sm border transition duration-300 hover:shadow-md ${
                    isNewest ? 'bg-white border-emerald-200 ring-1 ring-emerald-100' : 'bg-white border-slate-100'
                  }`}>
                    
                    {/* Header Card */}
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                            {isNewest && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md animate-pulse">
                                    Terbaru
                                </span>
                            )}
                            <span className="text-xs font-mono text-slate-400">#{rec.id_rekam}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800">{rec.diagnosa}</h3>
                        
                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">👨‍⚕️</span>
                          <span className="font-medium text-slate-700">{rec.nama_dokter}</span>
                          <span className="text-slate-300">|</span> 
                          <span>{rec.spesialis}</span>
                        </div>
                      </div>

                      {/* Tanggal */}
                      <div className="text-right">
                         <p className="text-xs text-slate-400 uppercase font-bold">Tanggal Periksa</p>
                         <p className={`text-sm font-medium ${isNewest ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {formatDate(recordDate)}
                         </p>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-slate-300">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Catatan & Tindakan</p>
                      <p className="text-slate-700 leading-relaxed text-sm">
                        {rec.catatan || "Tidak ada catatan tambahan."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientMedicalRecords;