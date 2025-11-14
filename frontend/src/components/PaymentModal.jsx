// src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    pasien: '',
    totalBayar: 0,
    metodeBayar: '',
    tanggal: '',
  });

  const isEdit = !!initialData;
  const paymentMethods = ['Tunai', 'Transfer', 'Kartu Kredit', 'Debit'];

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ pasien: '', totalBayar: 0, metodeBayar: '', tanggal: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl animate-fade-in-up">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          {isEdit ? 'Edit Pembayaran' : 'Tambah Pembayaran'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Pasien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasien</label>
            <input
              type="text"
              name="pasien"
              value={formData.pasien}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan nama pasien"
            />
          </div>
          {/* Total Bayar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Bayar (Rp)</label>
            <input
              type="number"
              name="totalBayar"
              value={formData.totalBayar}
              onChange={handleChange}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan total pembayaran"
            />
          </div>
          {/* Metode Pembayaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
            <select
                name="metodeBayar"
                value={formData.metodeBayar}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Pilih Metode</option>
              {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transaksi</label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              {isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;