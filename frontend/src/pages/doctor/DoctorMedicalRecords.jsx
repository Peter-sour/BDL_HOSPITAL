import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <--- TAMBAHAN IMPORT LINK
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorMedicalRecords = ({ user }) => {
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosa, setDiagnosa] = useState('');
  const [catatan, setCatatan] = useState('');
  const [resepList, setResepList] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const resPatients = await doctorAPI.getPatients('Approved');
        setPatients(resPatients.data.data || []);
        const resMedicines = await doctorAPI.getMedicines();
        setMedicines(resMedicines.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setLoading(false);
      }
    };
    initData();
  }, []);

  const addObat = () => setResepList([...resepList, { id_obat: '', jumlah: 1, aturan_pakai: '' }]);
  
  const updateObat = (idx, field, val) => {
    const list = [...resepList];
    list[idx][field] = val;
    setResepList(list);
  };

  const removeObat = (idx) => setResepList(resepList.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!window.confirm('Simpan Data Pemeriksaan? Pasien akan ditandai selesai.')) return;

    try {
        await doctorAPI.createMedicalRecord({ id_pasien: selectedPatient, diagnosa, catatan });

        const validObat = resepList.filter(o => o.id_obat && o.jumlah > 0);
        if(validObat.length > 0) {
            await doctorAPI.createPrescription({
                id_pasien: selectedPatient,
                catatan: "Resep Obat Rawat Jalan",
                obat_list: validObat
            });
        }

        alert('Pemeriksaan Selesai! Antrian telah diperbarui.');
        window.location.reload(); 

    } catch(err) {
        alert('Gagal menyimpan data: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-emerald-50">Loading Data...</div>;

  return (
    <DoctorLayout user={user} title="Pemeriksaan & Resep" subtitle="Input rekam medis dan resep obat pasien">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="flex border-b border-slate-100">
            <div className={`flex-1 p-4 text-center font-bold transition-colors ${step===1 ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-600' : 'text-slate-400'}`}>1. Pilih Pasien Antrian</div>
            <div className={`flex-1 p-4 text-center font-bold transition-colors ${step===2 ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-600' : 'text-slate-400'}`}>2. Input Data Medis</div>
        </div>

        <div className="p-8">
            {/* --- STEP 1: PILIH PASIEN --- */}
            {step === 1 && (
                <div className="space-y-6 text-center py-8">
                    <h3 className="text-xl font-bold text-slate-700">Siapa pasien yang Anda periksa?</h3>
                    
                    {patients.length === 0 ? (
                        // TAMPILAN JIKA KOSONG (Tombol Lanjut Hilang, Muncul Tombol Ke Janji Temu)
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="bg-orange-50 p-6 rounded-xl text-orange-700 border border-orange-200 max-w-lg">
                                <p className="font-bold mb-1">Antrian Kosong</p>
                                <p className="text-sm">Tidak ada pasien dengan status 'Approved'. Silakan setujui janji temu terlebih dahulu.</p>
                            </div>
                            
                            <Link 
                                to="/doctor/appointments" 
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Ke Menu Janji Temu
                            </Link>
                        </div>
                    ) : (
                        // TAMPILAN JIKA ADA PASIEN
                        <>
                            <div className="max-w-md mx-auto">
                                <select 
                                    className="w-full p-4 rounded-xl border border-slate-300 text-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                >
                                    <option value="">-- Pilih Pasien dari Antrian --</option>
                                    {patients.map(p => (
                                        <option key={p.id_pasien} value={p.id_pasien}>
                                            {p.nama} ({p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-slate-500 mt-2">Hanya pasien dengan status 'Approved' yang muncul di sini.</p>
                            </div>

                            <button 
                                disabled={!selectedPatient}
                                onClick={() => setStep(2)}
                                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-200"
                            >
                                Lanjut Pemeriksaan →
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* --- STEP 2: INPUT DATA (Kode sama persis) --- */}
            {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-lg border-b pb-2 flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                            Rekam Medis
                        </h4>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Diagnosa Dokter</label>
                                <input required className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                                    value={diagnosa} onChange={e=>setDiagnosa(e.target.value)} placeholder="Contoh: Infeksi Saluran Pernapasan Akut (ISPA)" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Catatan / Tindakan</label>
                                <textarea className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition" rows="3"
                                    value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Saran dokter, pantangan makanan, dll..." />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                                Resep Obat
                            </h4>
                            <button type="button" onClick={addObat} className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition shadow-sm">
                                + Tambah Obat
                            </button>
                        </div>
                        
                        {resepList.length === 0 && (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                                Belum ada obat ditambahkan.
                            </div>
                        )}

                        <div className="space-y-3">
                            {resepList.map((item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 relative group transition hover:border-blue-300">
                                    <button type="button" onClick={()=>removeObat(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">✕</button>
                                    
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Obat</label>
                                        <select required className="w-full p-2 rounded-lg border border-slate-200 bg-white" value={item.id_obat} onChange={e=>updateObat(idx, 'id_obat', e.target.value)}>
                                            <option value="">-- Pilih Obat --</option>
                                            {medicines.map(m => (
                                                <option key={m.id_obat} value={m.id_obat} disabled={m.stok <= 0}>
                                                    {m.nama_obat} (Stok: {m.stok}) {m.stok <= 0 ? '- HABIS' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Jumlah</label>
                                        <input type="number" min="1" className="w-full p-2 rounded-lg border border-slate-200" value={item.jumlah} onChange={e=>updateObat(idx, 'jumlah', e.target.value)} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Aturan Pakai</label>
                                        <input type="text" placeholder="3x1 sesudah makan" className="w-full p-2 rounded-lg border border-slate-200" value={item.aturan_pakai} onChange={e=>updateObat(idx, 'aturan_pakai', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button type="button" onClick={()=>setStep(1)} className="flex-1 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                            ← Kembali
                        </button>
                        <button type="submit" className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition transform hover:-translate-y-0.5">
                            Simpan & Selesaikan Pemeriksaan
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorMedicalRecords;