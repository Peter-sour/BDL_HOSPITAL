import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientPrescriptions = ({ user }) => {
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    patientAPI.getPrescriptions().then(res => setList(res.data.data || [])).catch(console.error);
  }, []);

  const openDetail = async (id) => {
    setActiveId(id);
    const res = await patientAPI.getPrescriptionDetails(id);
    setDetails(res.data.data || []);
  };

  return (
    <PatientLayout user={user} title="Resep Digital" subtitle="Daftar obat yang diresepkan untuk Anda">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {list.map((item) => (
            <div key={item.id_resep} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.id_resep.slice(-5)}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{item.nama_dokter}</h4>
                    <p className="text-slate-500 text-sm mb-4">{new Date(item.tanggal_resep).toLocaleDateString()}</p>
                    <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg mb-4 italic">"{item.catatan}"</p>
                </div>
                <button onClick={() => openDetail(item.id_resep)} className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition text-sm">Lihat Obat</button>
            </div>
        ))}
      </div>

      {/* Modal Detail */}
      {activeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <h3 className="text-lg font-bold text-slate-800">Detail Obat</h3>
                      <button onClick={()=>setActiveId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {details.map((d, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                              <div>
                                  <div className="font-bold text-slate-800">{d.nama_obat} <span className="text-xs font-normal text-slate-500">({d.jenis_obat})</span></div>
                                  <div className="text-xs text-blue-600 mt-1">{d.aturan_pakai}</div>
                              </div>
                              <div className="text-right">
                                  <div className="font-bold text-slate-800">{d.jumlah}</div>
                                  <div className="text-xs text-slate-400">pcs</div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button onClick={()=>setActiveId(null)} className="w-full mt-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Tutup</button>
              </div>
          </div>
      )}
    </PatientLayout>
  );
};
export default PatientPrescriptions;