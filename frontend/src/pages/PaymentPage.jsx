// src/pages/PaymentPage.jsx
import React, { useState } from 'react';
import { CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

// Data Pembayaran Dummy
const initialPayments = [
  { id: 1, idTransaksi: 'TRX001', pasien: 'Budi Santoso', totalBayar: 2500000, metodeBayar: 'Tunai', tanggal: '2025-11-09' },
  { id: 2, idTransaksi: 'TRX002', pasien: 'Siti Aisyah', totalBayar: 1250000, metodeBayar: 'Transfer', tanggal: '2025-11-09' },
  { id: 3, idTransaksi: 'TRX003', pasien: 'Agus Salim', totalBayar: 750000, metodeBayar: 'Kartu Kredit', tanggal: '2025-11-10' },
];

const PaymentPage = () => {
  const [payments, setPayments] = useState(initialPayments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const formatRupiah = (angka) => {
    return `Rp${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const handleSavePayment = (newPayment) => {
    if (editingPayment) {
      // Logic Edit
      setPayments(payments.map(p => p.id === editingPayment.id ? { ...newPayment, id: editingPayment.id } : p));
      alert(`✅ Transaksi ${editingPayment.idTransaksi} berhasil diubah!`);
    } else {
      // Logic Tambah
      const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
      const newIdTransaksi = `TRX${String(newId).padStart(3, '0')}`;
      setPayments([...payments, { ...newPayment, id: newId, idTransaksi: newIdTransaksi }]);
      alert(`✅ Transaksi ${newIdTransaksi} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
    setEditingPayment(null);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const paymentToDelete = payments.find(p => p.id === id);
    if (window.confirm(`Apakah Anda yakin ingin menghapus transaksi ${paymentToDelete.idTransaksi}?`)) {
      setPayments(payments.filter(p => p.id !== id));
      alert('🗑️ Data pembayaran berhasil dihapus!');
    }
  };

  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
        <CreditCard className="w-6 h-6 text-blue-800" />
        <span>Data Pembayaran</span>
      </h3>

      {/* Tombol tambah */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingPayment(null); setIsModalOpen(true); }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Pembayaran</span>
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Daftar Transaksi Pembayaran</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID Transaksi</th>
                <th className="py-3 px-4 text-left">Nama Pasien</th>
                <th className="py-3 px-4 text-left">Total Bayar</th>
                <th className="py-3 px-4 text-left">Metode Bayar</th>
                <th className="py-3 px-4 text-left">Tanggal</th>
                <th className="py-3 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{p.idTransaksi}</td>
                  <td className="py-3 px-4">{p.pasien}</td>
                  <td className="py-3 px-4 font-medium">{formatRupiah(p.totalBayar)}</td>
                  <td className="py-3 px-4">{p.metodeBayar}</td>
                  <td className="py-3 px-4">{p.tanggal}</td>
                  <td className="py-3 px-4 text-center space-x-3 flex justify-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                        Belum ada data pembayaran.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Komponen */}
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