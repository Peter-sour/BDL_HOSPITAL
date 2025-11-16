// src/pages/PaymentPage.jsx (KODE LENGKAP)
import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Edit, Trash2, Loader2, FileText, Bed, ChevronDown } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const API_BASE_URL = 'http://localhost:5000/api/payments'; 

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [expandedId, setExpandedId] = useState(null); 

  const formatRupiah = (angka) => {
    const numberValue = parseFloat(angka);
    if (isNaN(numberValue)) return 'Rp0';
    return `Rp${numberValue.toLocaleString('id-ID')}`;
  };
  
  // PERBAIKAN 1: Fungsi untuk format tanggal
  const formatDate = (isoString) => {
      if (!isoString) return 'N/A';
      try {
          // Hanya parsing date, karena controller sudah mengirim ISO string
          return new Date(isoString).toLocaleDateString('id-ID'); 
      } catch {
          return 'Invalid Date';
      }
  }

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json(); 
      if (result.success) {
        setPayments(result.data);
      } else {
        throw new Error(result.message || 'Gagal fetch data dari API.');
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSavePayment = async (formData) => {
    const isEdit = !!editingPayment;
    // PERBAIKAN 2: Gunakan ID_TRANSAKSI (UPPERCASE)
    const id = isEdit ? editingPayment.ID_TRANSAKSI : null; 
    const url = isEdit ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), 
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(`Gagal ${isEdit ? 'mengubah' : 'menambahkan'} transaksi: ${responseData.message || 'Unknown error'}`);
      }
      
      // Ambil total bayar dari response data atau data lama
      const finalTotalBayar = responseData.data?.total_bayar || editingPayment.TOTAL_BAYAR;

      alert(`✅ Transaksi berhasil ${isEdit ? 'diubah' : 'ditambahkan'}! Total Bayar: ${formatRupiah(finalTotalBayar)}`);
      fetchPayments(); 

    } catch (err) {
      console.error("Error saat menyimpan:", err);
      alert(`❌ ${err.message}`);
    } finally {
      setIsModalOpen(false);
      setEditingPayment(null);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };

  const handleDelete = async (idTransaksi) => {
    // PERBAIKAN 3: Gunakan ID_TRANSAKSI (UPPERCASE) untuk find
    const paymentToDelete = payments.find(p => p.ID_TRANSAKSI === idTransaksi); 
    if (window.confirm(`Apakah Anda yakin ingin menghapus transaksi ${idTransaksi} (Pasien: ${paymentToDelete?.NAMA_PASIEN})?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/${idTransaksi}`, {
          method: 'DELETE',
        });

        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
            throw new Error(`Gagal menghapus: ${responseData.message || 'Unknown error'}`);
        }

        alert('🗑️ Data pembayaran berhasil dihapus!');
        fetchPayments(); 

      } catch (err) {
        console.error("Error saat menghapus:", err);
        alert(`❌ ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <main className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <span className="text-lg text-gray-600">Memuat data transaksi...</span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="text-red-600 bg-red-100 p-4 rounded-lg">
          <p className="font-bold">Error Memuat Data</p>
          <p>{error}. Silakan cek koneksi API backend Anda dan pastikan data relasional sudah terisi.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
        <CreditCard className="w-6 h-6 text-blue-800" />
        <span>Data Transaksi Pembayaran</span>
      </h3>
      
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-700">Tabel Relasi Pembayaran & Detail Resep</h4>
        <button
          onClick={() => { setEditingPayment(null); setIsModalOpen(true); }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-center w-10">#</th>
                <th className="py-3 px-4 text-left">ID Transaksi</th>
                <th className="py-3 px-4 text-left">Pasien (ID)</th>
                <th className="py-3 px-4 text-left">Tanggal & Metode</th>
                <th className="py-3 px-4 text-left">Total Bayar</th>
                <th className="py-3 px-4 text-left">Resep & Dokter</th>
                <th className="py-3 px-4 text-left">Rawat Inap</th>
                <th className="py-3 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <React.Fragment key={p.ID_TRANSAKSI}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-center">
                        <button
                            onClick={() => setExpandedId(p.ID_TRANSAKSI === expandedId ? null : p.ID_TRANSAKSI)}
                            className="p-1 rounded hover:bg-gray-200"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${p.ID_TRANSAKSI === expandedId ? 'rotate-180 text-blue-600' : 'text-gray-500'}`} />
                        </button>
                    </td>
                    {/* PERBAIKAN 4: Menggunakan key UPPERCASE */}
                    <td className="py-3 px-4 font-bold text-blue-700">{p.ID_TRANSAKSI}</td>
                    <td className="py-3 px-4">
                        <div className="font-medium">{p.NAMA_PASIEN}</div>
                        <div className="text-xs text-gray-500">({p.ID_PASIEN})</div>
                    </td>
                    <td className="py-3 px-4">
                        <div className='font-semibold'>{formatDate(p.TANGGAL_TRANSAKSI)}</div>
                        <span className={`px-2 py-1 text-xs rounded-full inline-block mt-1 ${p.METODE_BAYAR === 'Tunai' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {p.METODE_BAYAR}
                        </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-green-700">{formatRupiah(p.TOTAL_BAYAR)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                        <FileText className='w-4 h-4 text-purple-600 inline-block mr-1' /> {p.ID_RESEP}
                        <div className='text-xs'>Dr. {p.NAMA_DOKTER} ({p.SPESIALIS})</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                        {p.ID_RAWAT 
                            ? <><Bed className='w-4 h-4 text-orange-600 inline-block mr-1' /> {p.NAMA_KAMAR} ({p.KELAS_KAMAR})</>
                            : <span className='text-xs italic text-gray-400'>Non Rawat Inap</span>}
                    </td>
                    <td className="py-3 px-4 text-center space-x-3 flex justify-center">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                        title="Ubah Metode Bayar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.ID_TRANSAKSI)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Detail Obat yang Diperluas */}
                  {p.ID_TRANSAKSI === expandedId && (
                      <tr className='bg-gray-50 border-t border-gray-200'>
                          <td colSpan="8" className="p-4">
                              <h5 className="font-bold mb-2 text-sm text-gray-700">
                                  💊 Detail Resep ({p.ID_RESEP}) | Obat yang Dibayar
                              </h5>
                              {p.OBAT_LIST && p.OBAT_LIST.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                      {p.OBAT_LIST.map((obat, i) => (
                                          <li key={i} className="text-gray-600">
                                              **{obat.NAMA_OBAT}** ({obat.DOSIS}) - {obat.JUMLAH} unit.
                                              <span className='ml-2 text-xs italic text-gray-500'> ({obat.ATURAN_PAKAI}) | Harga Satuan: {formatRupiah(obat.HARGA)}</span>
                                          </li>
                                      ))}
                                  </ul>
                              ) : (
                                  <p className="text-sm italic text-red-500">Tidak ada detail obat ditemukan untuk resep ini.</p>
                              )}
                          </td>
                      </tr>
                  )}
                </React.Fragment>
              ))}
              {payments.length === 0 && !loading && (
                <tr>
                    <td colSpan="8" className="py-4 text-center text-gray-500">
                        Belum ada data pembayaran.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPayment(null); }}
        onSave={handleSavePayment}
        initialData={editingPayment}
      />
    </main>
  );
};

export default PaymentPage;