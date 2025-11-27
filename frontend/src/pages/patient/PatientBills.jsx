import React, { useState, useEffect, useRef } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';

// --- LIBRARY PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NGROK_URL = 'https://mollusklike-intactly-kennedi.ngrok-free.dev'; 

const PatientBills = ({ user }) => {
  const [tab, setTab] = useState('unpaid');
  const [bills, setBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal & Form
  const [modalData, setModalData] = useState(null);
  const [billDetails, setBillDetails] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [activeBill, setActiveBill] = useState(null);

  const [payForm, setPayForm] = useState({ metode: 'Transfer', ref: '' });
  const [showQR, setShowQR] = useState(false);
  const pollingRef = useRef(null);

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if(tab === 'unpaid') {
        const res = await patientAPI.getBills('Belum Bayar');
        setBills(res.data.data || []);
      } else {
        const res = await patientAPI.getPaymentHistory();
        setHistory(res.data.data || []);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fmt = (n) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);

  // --- FITUR CETAK STRUK PDF (KEREN!) ---
  // --- FITUR CETAK STRUK PDF (LOGO + STEMPEL) ---
  const handlePrintInvoice = async (bill) => {
    try {
        const res = await patientAPI.getBillDetails(bill.id_tagihan);
        const items = res.data.data || [];
        const doc = new jsPDF();

        // ==========================================
        // 🏥 1. GAMBAR LOGO RS (VECTOR ART)
        // ==========================================
        // Kotak Biru (Background Logo)
        doc.setFillColor(37, 99, 235); // Warna Biru RS (Blue-600)
        doc.roundedRect(14, 10, 22, 22, 3, 3, 'F'); 

        // Tanda Plus (+) Putih di tengah
        doc.setFillColor(255, 255, 255);
        doc.rect(23, 13, 4, 16, 'F'); // Garis Vertikal
        doc.rect(17, 19, 16, 4, 'F'); // Garis Horizontal
        // ==========================================

        // -- Header Teks (Digeser ke kanan biar gak numpuk logo) --
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(37, 99, 235); // Biru Logo
        doc.text("RS MEDCARE SIMRS", 42, 20); // x=42 (sebelah logo)
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Jl. Kesehatan No. 123, Surabaya", 42, 26);
        doc.text("Telp: (031) 555-7777 | Email: info@medcare.com", 42, 31);
        
        // Garis Pembatas
        doc.setDrawColor(200);
        doc.setLineWidth(0.5);
        doc.line(14, 38, 196, 38);

        // -- Judul Invoice --
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("KWITANSI PEMBAYARAN", 14, 50);

        // -- Info Pasien & Transaksi --
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        // Kolom Kiri
        doc.text(`No. Invoice`, 14, 60);  doc.text(`:  ${bill.id_tagihan}`, 40, 60);
        doc.text(`Tanggal`, 14, 66);      doc.text(`:  ${new Date(bill.tanggal_transaksi).toLocaleDateString()}`, 40, 66);
        doc.text(`Metode`, 14, 72);       doc.text(`:  ${bill.metode_bayar}`, 40, 72);
        
        // Kolom Kanan
        doc.text(`Nama Pasien`, 110, 60); doc.text(`:  ${user?.detail?.nama || user.username}`, 140, 60);
        doc.text(`Layanan`, 110, 66);     doc.text(`:  ${bill.jenis_tagihan}`, 140, 66);
        doc.text(`Status`, 110, 72);      doc.setTextColor(22, 163, 74); // Hijau
        doc.setFont("helvetica", "bold"); doc.text(`:  LUNAS`, 140, 72);
        doc.setTextColor(0); // Reset Hitam

        // -- Tabel Item --
        const tableBody = items.map(item => [item.item, item.qty, fmt(item.harga), fmt(item.harga * item.qty)]);
        autoTable(doc, {
            startY: 80,
            head: [['Deskripsi Item', 'Qty', 'Harga Satuan', 'Subtotal']],
            body: tableBody,
            theme: 'grid', // Pakai grid biar rapi
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' }, // Header Biru
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right', fontStyle: 'bold' }
            }
        });

        // -- Total Bayar --
       const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        
        // Geser label ke kiri (dari 140 jadi 120) biar gak numpuk
        doc.text(`TOTAL BAYAR`, 120, finalY); 
        
        // Angka tetap rata kanan di margin (196)
        doc.text(`${fmt(bill.jumlah_bayar)}`, 196, finalY, { align: "right" });
        
        // Garis Total (Sesuaikan panjangnya)
        doc.setLineWidth(0.5);
        doc.line(120, finalY + 2, 196, finalY + 2); // Garis mulai dari 120

        // -- Footer / Tanda Tangan --
        const signY = finalY + 30;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Terima kasih atas kepercayaan Anda.", 14, signY + 10);
        doc.text("Semoga lekas sembuh.", 14, signY + 15);
        
        // Area Tanda Tangan Kanan
        const signX = 150;
        doc.text("Surabaya, " + new Date().toLocaleDateString(), signX, signY);
        doc.text("Petugas Kasir,", signX, signY + 5);
        doc.text("( Sistem Otomatis )", signX, signY + 35);

        // ==========================================
        // 💮 2. STEMPEL LUNAS (Di atas Tanda Tangan)
        // ==========================================
        const stampX = signX + 10; 
        const stampY = signY + 15;

        doc.setDrawColor(204, 0, 0); // Merah
        doc.setTextColor(204, 0, 0);
        doc.setLineWidth(1);
        
        // Lingkaran
        doc.circle(stampX, stampY, 14, 'S');
        doc.setLineWidth(0.3);
        doc.circle(stampX, stampY, 12, 'S');

        // Teks Miring
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("LUNAS", stampX, stampY + 1, { align: "center", angle: 20 });
        
        doc.setFontSize(6);
        doc.text("RS MEDCARE", stampX, stampY - 6, { align: "center", angle: 20 });
        doc.text("VERIFIED", stampX, stampY + 7, { align: "center", angle: 20 });
        // ==========================================

        doc.save(`Invoice_${bill.id_tagihan}.pdf`);

    } catch (err) {
        alert("Gagal mencetak struk.");
        console.error(err);
    }
  };

  // ... (Fungsi Modal, Polling, dll biarkan sama seperti sebelumnya) ...
  const openDetailModal = async (bill) => {
    setActiveBill(bill);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setBillDetails([]);
    try {
        const res = await patientAPI.getBillDetails(bill.id_tagihan);
        if(res.data.success) setBillDetails(res.data.data);
    } catch (err) { console.error("Gagal detail"); } 
    finally { setLoadingDetail(false); }
  };

  const openPayModal = (bill) => {
    setActiveBill(bill);
    setPayForm({ metode: 'Transfer', ref: '' }); 
    setShowQR(false);
    setIsPayOpen(true);
  };

  useEffect(() => {
    if (showQR && activeBill && isPayOpen) {
      const checkPaymentStatus = async () => {
        try {
          const res = await patientAPI.checkStatus(activeBill.id_tagihan);
          if (res.data.status === 'Lunas') {
            clearInterval(pollingRef.current);
            alert('Pembayaran QRIS Berhasil! ✅');
            closeAllModals();
            fetchData(); 
          }
        } catch (err) { console.log("Waiting..."); }
      };
      pollingRef.current = setInterval(checkPaymentStatus, 2000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [showQR, activeBill, isPayOpen]);

  const closeAllModals = () => {
    setIsDetailOpen(false);
    setIsPayOpen(false);
    setActiveBill(null);
    setShowQR(false);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const handlePay = async (e) => {
      e.preventDefault();
      if (payForm.metode === 'QRIS') { setShowQR(true); return; }
      try {
          await patientAPI.payBill({ 
            id_tagihan: activeBill.id_tagihan, 
            jumlah_bayar: activeBill.total_tagihan, 
            metode_bayar: payForm.metode, 
            nomor_referensi: payForm.ref 
          });
          alert('Pembayaran Berhasil!');
          closeAllModals();
          fetchData(); 
      } catch (err) { alert('Gagal: ' + (err.response?.data?.message || err.message)); }
  };

  const qrUrl = activeBill ? `${NGROK_URL}/api/patient/payment/qr-confirm/${activeBill.id_tagihan}` : '';
  const getIcon = (jenis) => {
    if (jenis === 'Obat') return <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">💊</div>;
    return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">👨‍⚕️</div>;
  };

  return (
    <PatientLayout user={user} title="Keuangan" subtitle="Tagihan medis dan riwayat transaksi">
       
       <div className="flex gap-4 mb-8">
           <button onClick={()=>setTab('unpaid')} className={`flex-1 py-3 rounded-xl font-bold transition shadow-sm ${tab==='unpaid' ? 'bg-red-500 text-white shadow-red-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Belum Dibayar</button>
           <button onClick={()=>setTab('history')} className={`flex-1 py-3 rounded-xl font-bold transition shadow-sm ${tab==='history' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Riwayat Lunas</button>
       </div>

       {loading && <div className="text-center py-10">Loading data...</div>}

       {/* LIST TAGIHAN (UNPAID) */}
       {!loading && tab === 'unpaid' && (
           <div className="space-y-4">
               {bills.length===0 && <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">Tidak ada tagihan aktif. Sehat selalu!</div>}
               {bills.map(b => (
                   <div key={b.id_tagihan} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="flex items-center gap-4">
                           {getIcon(b.jenis_tagihan)}
                           <div>
                               <h4 className="font-bold text-lg text-slate-800">{b.jenis_tagihan}</h4>
                               <p className="text-sm text-red-500 mt-1">Jatuh Tempo: {new Date(b.tanggal_jatuh_tempo).toLocaleDateString()}</p>
                               <p className="text-xs text-slate-400 font-mono mt-1">{b.id_tagihan}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-4">
                           <div className="text-right mr-4">
                               <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                               <p className="text-xl font-bold text-slate-900">{fmt(b.total_tagihan)}</p>
                           </div>
                           <button onClick={()=>openDetailModal(b)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 text-sm">Rincian</button>
                           <button onClick={()=>openPayModal(b)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-lg text-sm">Bayar</button>
                       </div>
                   </div>
               ))}
           </div>
       )}

       {/* LIST HISTORY (ADA TOMBOL PRINT) */}
       {!loading && tab === 'history' && (
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                       <tr>
                           <th className="p-4">Tanggal</th>
                           <th className="p-4">Layanan</th>
                           <th className="p-4">Metode</th>
                           <th className="p-4">Jumlah</th>
                           <th className="p-4 text-center">Aksi</th> {/* Kolom Aksi */}
                       </tr>
                   </thead>
                   <tbody>
                       {history.map(h => (
                           <tr key={h.id_transaksi} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                               <td className="p-4 text-sm text-slate-600">{new Date(h.tanggal_transaksi).toLocaleDateString()}</td>
                               <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                                   {h.jenis_tagihan === 'Obat' ? '💊' : '👨‍⚕️'} {h.jenis_tagihan || 'Layanan Medis'}
                               </td>
                               <td className="p-4 text-sm text-slate-500">{h.metode_bayar}</td>
                               <td className="p-4 font-bold text-slate-800">{fmt(h.jumlah_bayar)}</td>
                               <td className="p-4 text-center">
                                   <button 
                                     onClick={() => handlePrintInvoice(h)}
                                     className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto transition"
                                     title="Cetak Struk"
                                   >
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                     Cetak
                                   </button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {/* ... Modal Detail & Bayar (Sama seperti kode sebelumnya) ... */}
       {isDetailOpen && activeBill && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
                   <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                       <h3 className="font-bold text-slate-800 text-lg">Rincian Item</h3>
                       <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                   </div>
                   <div className="p-6 overflow-y-auto">
                       {/* Isi Detail (sama) */}
                       <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                           <table className="w-full text-sm">
                               <thead className="bg-slate-100 text-slate-500 font-semibold text-xs uppercase">
                                   <tr><th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Harga</th></tr>
                               </thead>
                               <tbody className="divide-y divide-slate-200">
                                   {loadingDetail ? (<tr><td colSpan="3" className="p-4 text-center text-slate-400">Memuat...</td></tr>) : 
                                    billDetails.map((item, idx) => (
                                       <tr key={idx}><td className="px-4 py-3">{item.item}</td><td className="px-4 py-3 text-center">{item.qty}</td><td className="px-4 py-3 text-right">{fmt(item.harga * item.qty)}</td></tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
                   <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-between items-center">
                       <span className="text-slate-500 font-medium">Total</span>
                       <span className="text-2xl font-bold text-blue-600">{fmt(activeBill.total_tagihan)}</span>
                   </div>
               </div>
           </div>
       )}

       {isPayOpen && activeBill && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-fade-in-up">
                   <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                       <h3 className="font-bold text-lg">Checkout</h3>
                       <button onClick={closeAllModals} className="text-slate-400 hover:text-white text-2xl">×</button>
                   </div>
                   <div className="p-6">
                       <div className="text-center mb-6">
                           <p className="text-sm text-slate-500 mb-1">Total Pembayaran</p>
                           <h2 className="text-3xl font-bold text-slate-900">{fmt(activeBill.total_tagihan)}</h2>
                       </div>
                       {showQR ? (
                           <div className="text-center space-y-4">
                               <div className="bg-white p-3 border-2 border-slate-900 rounded-xl inline-block shadow-lg"><QRCodeSVG value={qrUrl} size={180} fgColor="#1e293b" /></div>
                               <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold animate-pulse">Menunggu Scan...</div>
                               <button onClick={() => setShowQR(false)} className="text-sm underline text-slate-500">Ubah Metode</button>
                           </div>
                       ) : (
                           <form onSubmit={handlePay} className="space-y-4">
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Metode</label>
                                   <select className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-slate-900 outline-none" value={payForm.metode} onChange={e => setPayForm({...payForm, metode: e.target.value})}>
                                       <option value="Transfer">Transfer Bank</option><option value="QRIS">QRIS</option><option value="Tunai">Tunai</option><option value="Kartu Kredit">Kartu Kredit</option><option value="Kartu Debit">Kartu Debit</option><option value="BPJS">BPJS</option>
                                   </select>
                               </div>
                               {payForm.metode !== 'QRIS' && <input placeholder="No. Referensi" className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none" value={payForm.ref} onChange={e => setPayForm({...payForm, ref: e.target.value})} />}
                               <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg mt-2">{payForm.metode === 'QRIS' ? 'Generate QR' : 'Bayar Sekarang'}</button>
                           </form>
                       )}
                   </div>
               </div>
           </div>
       )}

    </PatientLayout>
  );
};
export default PatientBills;