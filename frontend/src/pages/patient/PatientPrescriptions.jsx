import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientPrescriptions = ({ user }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await patientAPI.getPrescriptions();
        setPrescriptions(res.data.data || []);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchPrescriptions();
  }, []);

  const handleViewDetail = async (id) => {
    setSelectedPrescription(id);
    setLoadingDetail(true);
    setDetails([]);
    try {
      const res = await patientAPI.getPrescriptionDetails(id);
      setDetails(res.data.data || []);
    } catch (error) { alert('Gagal mengambil detail'); } 
    finally { setLoadingDetail(false); }
  };

  if (loading) return <div className="text-center py-10">Loading data...</div>;

  return (
    <PatientLayout user={user} title="Resep Obat" subtitle="Daftar obat yang diresepkan dokter">
      
      {prescriptions.length === 0 ? (
         <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            Belum ada resep obat.
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((p, index) => {
              const isNewest = index === 0; // Cek data paling baru

              return (
                <div key={p.id_resep} className={`rounded-2xl p-6 shadow-sm border transition hover:shadow-lg flex flex-col justify-between h-full relative overflow-hidden ${
                    isNewest ? 'bg-white border-purple-200 ring-1 ring-purple-100' : 'bg-white border-slate-100'
                }`}>
                  
                  {/* Badge Terbaru */}
                  {isNewest && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                          TERBARU
                      </div>
                  )}

                  <div>
                      <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNewest ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          </div>
                          <div>
                              <p className="text-xs text-slate-400 font-mono">{p.id_resep.slice(-8)}</p>
                              <p className={`text-xs font-bold ${isNewest ? 'text-purple-600' : 'text-slate-500'}`}>
                                  {new Date(p.tanggal_resep).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                              </p>
                          </div>
                      </div>
                      
                      <h4 className="font-bold text-lg text-slate-800 mb-1">{p.nama_dokter}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">{p.spesialis}</p>
                      
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-6 border border-slate-100">
                          <span className="font-bold text-slate-400 text-xs block mb-1">CATATAN</span>
                          "{p.catatan || '-'}"
                      </div>
                  </div>

                  <button 
                    onClick={() => handleViewDetail(p.id_resep)}
                    className={`w-full py-2.5 border font-bold rounded-xl transition shadow-sm ${
                        isNewest 
                        ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:text-purple-600'
                    }`}
                  >
                    Lihat Obat
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* --- MODAL DETAIL OBAT (Sama seperti sebelumnya) --- */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 ">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Rincian Obat</h3>
              <button onClick={() => setSelectedPrescription(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <div className="p-0 max-h-[60vh] overflow-y-auto">
                {loadingDetail ? (
                    <div className="p-8 text-center text-slate-400">Mengambil data obat...</div>
                ) : details.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Tidak ada data detail.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Nama Obat</th>
                                <th className="px-6 py-3 text-center">Jml</th>
                                <th className="px-6 py-3">Aturan Pakai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {details.map((item) => (
                                <tr key={item.id_resep_obat} className="hover:bg-slate-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700">{item.nama_obat}</div>
                                        <div className="text-xs text-slate-400">{item.jenis_obat} • {item.dosis}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600">{item.jumlah}</td>
                                    <td className="px-6 py-4 text-sm text-blue-600 font-medium bg-blue-50/30">{item.aturan_pakai}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                <button onClick={() => setSelectedPrescription(null)} className="px-6 py-2 bg-white border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-100">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default PatientPrescriptions;