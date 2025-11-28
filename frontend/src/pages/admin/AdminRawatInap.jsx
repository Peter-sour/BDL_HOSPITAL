import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
// Import HANYA adminAPI
import { adminAPI } from '../../services/api'; 
import { Bed, X, Check, Clock } from 'lucide-react';
import ReactDOM from 'react-dom';

const AdminRawatInap = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]); 
    const [availableRooms, setAvailableRooms] = useState([]); // Daftar Kamar (tidak dipakai di UI ini, tapi penting untuk kesatuan code)
    
    const [selectedReq, setSelectedReq] = useState(null); 
    const [pjDoctor, setPjDoctor] = useState(''); 

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                // FIX 1: Panggil Doctor List dari adminAPI (Mengatasi Error 403)
                const resDoctors = await adminAPI.getAllDoctors(); 
                setDoctors(resDoctors.data.data || []);
                
                // FIX 2: Panggil Kamar Tersedia dari adminAPI
                const resRooms = await adminAPI.getAvailableRooms();
                setAvailableRooms(resRooms.data.data || []); // Data kamar tersedia
                
                fetchData();
            } catch(e) {
                console.error("Gagal load master data untuk Admin:", e);
            }
        };
        fetchMasterData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getRawatInapRequests();
            setRequests(res.data.data || []);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    const handleApprove = async (e) => {
        e.preventDefault();
        if (!pjDoctor) return alert("Pilih Dokter Penanggung Jawab.");
        
        try {
            // Menggunakan ID_RAWAT (Huruf Besar) dan data Dokter PJ dari form
            await adminAPI.approveRawatInap(selectedReq.ID_RAWAT, { id_dokter_penanggung: pjDoctor });
            alert('Permintaan disetujui! Pasien sudah Rawat Inap.');
            setSelectedReq(null); 
            setPjDoctor('');
            fetchData(); 
        } catch(e) {
            alert('Gagal menyetujui: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleDischarge = async (id_rawat) => {
        if(window.confirm('Yakin pulangkan pasien ini? Tagihan akan dihitung otomatis.')) {
             try {
                // Pulangkan pasien, hitung durasi inap, dan terbitkan tagihan
                const res = await adminAPI.dischargeAndBill(id_rawat);
                alert(res.data.message); 
                fetchData();
            } catch(e) {
                alert('Gagal memulangkan: ' + (e.response?.data?.message || e.message));
            }
        }
    };

    return (
        <AdminLayout title="Kelola Rawat Inap" subtitle="Verifikasi kamar dan hitung tagihan akhir pasien">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">Daftar Status Rawat Inap</h3>
                </div>
                
                {loading ? <div className="p-10 text-center text-slate-400">Memuat permintaan...</div> : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b">
                            <tr>
                                <th className="p-4">Pasien & Kamar</th>
                                <th className="p-4">Tanggal Masuk</th>
                                <th className="p-4">Keluhan</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map(r => (
                                <tr key={r.ID_RAWAT} className={`hover:bg-slate-50/50 ${r.STATUS === 'Inap' ? 'bg-purple-50/30' : ''}`}>
                                    <td className="p-4">
                                        {/* Mengakses data dengan huruf besar (Sesuai output Oracle) */}
                                        <div className="font-bold text-slate-800">{r.NAMA_PASIEN || 'Pasien Tidak Ditemukan'}</div>
                                        <div className="text-xs text-purple-600 font-medium">{r.NAMA_KAMAR} ({r.KELAS_KAMAR})</div>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(r.TANGGAL_MASUK).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 max-w-xs truncate">{r.KELUHAN}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            r.STATUS === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            r.STATUS === 'Inap' ? 'bg-purple-100 text-purple-700' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {r.STATUS}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {r.STATUS === 'Pending' && (
                                            <button onClick={() => { setSelectedReq(r); }} className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 mx-auto shadow-md hover:bg-emerald-700 transition">
                                                <Check size={16} /> Setuju
                                            </button>
                                        )}
                                        {r.STATUS === 'Inap' && (
                                            <button onClick={() => handleDischarge(r.ID_RAWAT)} className="p-2 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 mx-auto shadow-md hover:bg-red-700 transition">
                                                <X size={16} /> Pulangkan & Tagih
                                            </button>
                                        )}
                                        {r.STATUS === 'Selesai' && (
                                             <span className="text-sm text-slate-500 italic">Selesai</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Approve Request (Menggunakan Portal Fix) */}
            {selectedReq && ReactDOM.createPortal(
                 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Setujui Rawat Inap</h3>
                        {/* Mengakses data dengan huruf besar dari state */}
                        <p className="text-sm text-slate-700 mb-4">Pasien: **{selectedReq.NAMA_PASIEN || 'N/A'}** akan masuk kamar **{selectedReq.ID_KAMAR}**.</p>
                        
                        <form onSubmit={handleApprove}>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dokter PJ (Penanggung Jawab)</label>
                            <select required className="w-full p-3 border rounded-xl mb-6" value={pjDoctor} onChange={e => setPjDoctor(e.target.value)}>
                                <option value="">-- Pilih Dokter PJ --</option>
                                {doctors.map(d => <option key={d.id_dokter} value={d.id_dokter}>Dr. {d.nama} ({d.spesialis})</option>)}
                            </select>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setSelectedReq(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md">Setujui Masuk</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </AdminLayout>
    );
};

export default AdminRawatInap;