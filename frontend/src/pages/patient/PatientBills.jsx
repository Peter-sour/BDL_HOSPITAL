import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientBills = ({ user }) => {
  const [tab, setTab] = useState('unpaid');
  const [bills, setBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [payForm, setPayForm] = useState({ metode: 'Transfer Bank', ref: '' });

  useEffect(() => {
    if(tab === 'unpaid') patientAPI.getBills('Belum Bayar').then(res => setBills(res.data.data||[]));
    else patientAPI.getPaymentHistory().then(res => setHistory(res.data.data||[]));
  }, [tab]);

  const handlePay = async (e) => {
      e.preventDefault();
      try {
          await patientAPI.payBill({ id_tagihan: modalData.id_tagihan, jumlah_bayar: modalData.total_tagihan, metode_bayar: payForm.metode, nomor_referensi: payForm.ref });
          alert('Pembayaran Berhasil!');
          setModalData(null);
          setTab('unpaid'); // trigger refresh
      } catch (err) { alert('Gagal'); }
  };

  const fmt = (n) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);

  return (
    <PatientLayout user={user} title="Keuangan" subtitle="Tagihan medis dan riwayat transaksi">
       <div className="flex gap-4 mb-8">
           <button onClick={()=>setTab('unpaid')} className={`flex-1 py-3 rounded-xl font-bold transition shadow-sm ${tab==='unpaid' ? 'bg-red-500 text-white shadow-red-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Belum Dibayar</button>
           <button onClick={()=>setTab('history')} className={`flex-1 py-3 rounded-xl font-bold transition shadow-sm ${tab==='history' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Riwayat Lunas</button>
       </div>

       {tab === 'unpaid' ? (
           <div className="space-y-4">
               {bills.length===0 && <div className="text-center p-8 bg-white rounded-2xl text-slate-400">Tidak ada tagihan aktif. Sehat selalu!</div>}
               {bills.map(b => (
                   <div key={b.id_tagihan} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                       <div>
                           <h4 className="font-bold text-lg text-slate-800">{b.jenis_tagihan}</h4>
                           <p className="text-sm text-red-500 mt-1">Jatuh Tempo: {new Date(b.tanggal_jatuh_tempo).toLocaleDateString()}</p>
                       </div>
                       <div className="flex items-center gap-6">
                           <div className="text-right">
                               <p className="text-xs text-slate-400 uppercase tracking-wider">Total Tagihan</p>
                               <p className="text-2xl font-bold text-slate-900">{fmt(b.total_tagihan)}</p>
                           </div>
                           <button onClick={()=>setModalData(b)} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200">Bayar</button>
                       </div>
                   </div>
               ))}
           </div>
       ) : (
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                       <tr><th className="p-4">Tanggal</th><th className="p-4">Keterangan</th><th className="p-4">Metode</th><th className="p-4">Jumlah</th><th className="p-4">Status</th></tr>
                   </thead>
                   <tbody>
                       {history.map(h => (
                           <tr key={h.id_transaksi} className="border-b border-slate-50 hover:bg-slate-50/50">
                               <td className="p-4 text-sm text-slate-600">{new Date(h.tanggal_transaksi).toLocaleDateString()}</td>
                               <td className="p-4 font-medium text-slate-800">{h.jenis_tagihan || 'Layanan Medis'}</td>
                               <td className="p-4 text-sm text-slate-500">{h.metode_bayar}</td>
                               <td className="p-4 font-bold text-slate-800">{fmt(h.jumlah_bayar)}</td>
                               <td className="p-4"><span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">LUNAS</span></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {/* Modal Bayar */}
       {modalData && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl">
                   <h3 className="text-xl font-bold mb-1">Konfirmasi Pembayaran</h3>
                   <p className="text-slate-500 mb-6 text-sm">Selesaikan tagihan {modalData.jenis_tagihan}</p>
                   
                   <div className="bg-slate-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-slate-100">
                       <span className="text-slate-500 text-sm">Total Bayar</span>
                       <span className="text-xl font-bold text-slate-900">{fmt(modalData.total_tagihan)}</span>
                   </div>

                   <form onSubmit={handlePay} className="space-y-4">
                       <select className="w-full p-3 rounded-xl border border-slate-200 bg-white" value={payForm.metode} onChange={e=>setPayForm({...payForm, metode:e.target.value})}>
                           <option>Transfer Bank</option><option>E-Wallet</option><option>Kartu Kredit</option>
                       </select>
                       <input placeholder="Nomor Referensi (Opsional)" className="w-full p-3 rounded-xl border border-slate-200" value={payForm.ref} onChange={e=>setPayForm({...payForm, ref:e.target.value})} />
                       <div className="flex gap-3 mt-6">
                           <button type="button" onClick={()=>setModalData(null)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Batal</button>
                           <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Bayar</button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </PatientLayout>
  );
};
export default PatientBills;