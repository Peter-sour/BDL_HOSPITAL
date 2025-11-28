import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI, doctorAPI } from '../../services/api'; 
import { Bed, HeartPulse, User } from 'lucide-react';

const PatientRawatInap = ({ user }) => {
    const [doctors, setDoctors] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]); 
    
    const [formData, setFormData] = useState({ 
        id_kamar: '', 
        keluhan: '', 
        id_dokter_referensi: '' 
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            // PERBAIKAN: Menggunakan patientAPI.getDoctors()
            patientAPI.getDoctors().then(res => setDoctors(res.data.data || []));
            patientAPI.getAvailableRooms().then(res => setAvailableRooms(res.data.data || []));
        };
        fetchMasterData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await patientAPI.requestRawatInap(formData);
            alert('Permintaan Rawat Inap terkirim! Admin akan segera memproses.');
            window.location.reload(); // Refresh halaman untuk reset form
        } catch (error) {
            alert('Gagal mengajukan permintaan: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <PatientLayout user={user} title="Pesan Kamar Rawat Inap" subtitle="Ajukan permintaan Rawat Inap & Kamar">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <Bed size={24} className="text-purple-600" /> Form Pengajuan Rawat Inap
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Kamar Rawat Inap Tersedia</label>
                        <select 
                            required 
                            value={formData.id_kamar} 
                            onChange={e => setFormData({...formData, id_kamar: e.target.value})} 
                            className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">-- Pilih Kamar (Hanya yang Kosong) --</option>
                            {availableRooms.map(room => (
                                <option key={room.id_kamar} value={room.id_kamar}>
                                    {room.nama_kamar} - {room.kelas_kamar} (ID: {room.id_kamar})
                                </option>
                            ))}
                        </select>
                        {availableRooms.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">⚠️ Maaf, saat ini semua kamar penuh atau data kamar belum terisi.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Keluhan Utama</label>
                        <textarea rows="3" required value={formData.keluhan} onChange={e => setFormData({...formData, keluhan: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Jelaskan kondisi pasien saat ini..." />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Dokter Referensi (Opsional)</label>
                        <select value={formData.id_dokter_referensi} onChange={e => setFormData({...formData, id_dokter_referensi: e.target.value})} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500">
                            <option value="">-- Pilih Dokter Referensi --</option>
                            {doctors.map(doc => (
                                <option key={doc.id_dokter} value={doc.id_dokter}>{doc.nama} ({doc.spesialis})</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={availableRooms.length === 0} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition disabled:opacity-50">
                        Ajukan Permintaan Rawat Inap
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-md font-bold text-slate-800 flex items-center gap-2"><HeartPulse size={16} className="text-red-500" /> Peringatan</h4>
                    <p className="text-xs text-slate-500 mt-1">Status Rawat Inap Anda hanya akan aktif setelah Admin rumah sakit menyetujui permintaan dan memproses pembayaran tagihan awal.</p>
                </div>
            </div>
        </PatientLayout>
    );
};

export default PatientRawatInap;