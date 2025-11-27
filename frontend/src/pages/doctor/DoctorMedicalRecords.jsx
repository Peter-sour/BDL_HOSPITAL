import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorMedicalRecords = ({ user }) => {
  const [step, setStep] = useState(1); // 1: Pilih Pasien, 2: Input Data
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  
  // Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosa, setDiagnosa] = useState('');
  const [catatan, setCatatan] = useState('');
  const [resepList, setResepList] = useState([]); // [{id_obat, jumlah, aturan_pakai}]

  // Load Initial Data
  useEffect(() => {
    doctorAPI.getPatients().then(res => setPatients(res.data.data || []));
    doctorAPI.getMedicines().then(res => setMedicines(res.data.data || []));
  }, []);

  const addObat = () => {
    setResepList([...resepList, { id_obat: '', jumlah: 1, aturan_pakai: '' }]);
  };

  const updateObat = (idx, field, val) => {
    const list = [...resepList];
    list[idx][field] = val;
    setResepList(list);
  };

  const removeObat = (idx) => {
    setResepList(resepList.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!window.confirm('Simpan Data Pemeriksaan?')) return;

    try {
        // 1. Simpan Rekam Medis
        await doctorAPI.createMedicalRecord({ 
            id_pasien: selectedPatient, 
            diagnosa, 
            catatan 
        });

        // 2. Simpan Resep (Jika ada)
        if(resepList.length > 0) {
            // Filter obat yang valid (id tidak kosong)
            const validObat = resepList.filter(o => o.id_obat);
            if(validObat.length > 0) {
                await doctorAPI.createPrescription({
                    id_pasien: selectedPatient,
                    catatan: "Resep dari pemeriksaan",
                    obat_list: validObat
                });
            }
        }

        alert('Pemeriksaan Selesai & Data Tersimpan!');
        window.location.reload(); // Reset form
    } catch(err) {
        alert('Gagal menyimpan data: ' + err.message);
    }
  };

  return (
    <DoctorLayout user={user} title="Pemeriksaan & Resep" subtitle="Input rekam medis dan resep obat pasien">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Step Indicator */}
        <div className="flex border-b border-slate-100">
            <div className={`flex-1 p-4 text-center font-bold ${step===1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>1. Pilih Pasien</div>
            <div className={`flex-1 p-4 text-center font-bold ${step===2 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>2. Input Data Medis</div>
        </div>

        <div className="p-8">
            {step === 1 && (
                <div className="space-y-6 text-center py-8">
                    <h3 className="text-xl font-bold text-slate-700">Siapa pasien yang Anda periksa?</h3>
                    <div className="max-w-md mx-auto">
                        <select 
                            className="w-full p-4 rounded-xl border border-slate-300 text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                        >
                            <option value="">-- Pilih Pasien --</option>
                            {patients.map(p => <option key={p.id_pasien} value={p.id_pasien}>{p.nama} (ID: {p.id_pasien.slice(-4)})</option>)}
                        </select>
                    </div>
                    <button 
                        disabled={!selectedPatient}
                        onClick={() => setStep(2)}
                        className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                        Lanjut Pemeriksaan →
                    </button>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Rekam Medis Section */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-lg border-b pb-2">A. Rekam Medis</h4>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">Diagnosa Dokter</label>
                            <input required className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                                value={diagnosa} onChange={e=>setDiagnosa(e.target.value)} placeholder="Contoh: Infeksi Saluran Pernapasan Akut" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">Catatan Tambahan</label>
                            <textarea className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" rows="3"
                                value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Keluhan detail, saran, atau tindakan..." />
                        </div>
                    </div>

                    {/* Resep Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="font-bold text-slate-800 text-lg">B. Resep Obat (Opsional)</h4>
                            <button type="button" onClick={addObat} className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg transition">+ Tambah Obat</button>
                        </div>
                        
                        {resepList.length === 0 && <p className="text-slate-400 italic text-sm">Belum ada obat ditambahkan.</p>}

                        {resepList.map((item, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                <button type="button" onClick={()=>removeObat(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold">✕</button>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-400">Nama Obat</label>
                                    <select required className="w-full p-2 rounded border" value={item.id_obat} onChange={e=>updateObat(idx, 'id_obat', e.target.value)}>
                                        <option value="">Pilih Obat</option>
                                        {medicines.map(m => <option key={m.id_obat} value={m.id_obat}>{m.nama_obat} (Stok: {m.stok})</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-bold text-slate-400">Jumlah</label>
                                    <input type="number" min="1" className="w-full p-2 rounded border" value={item.jumlah} onChange={e=>updateObat(idx, 'jumlah', e.target.value)} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-400">Aturan Pakai</label>
                                    <input type="text" placeholder="3x1 sesudah makan" className="w-full p-2 rounded border" value={item.aturan_pakai} onChange={e=>updateObat(idx, 'aturan_pakai', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <button type="button" onClick={()=>setStep(1)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Kembali</button>
                        <button type="submit" className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">Simpan Data Pemeriksaan</button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </DoctorLayout>
  );
};
export default DoctorMedicalRecords;