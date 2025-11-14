// src/components/PrescriptionModal.jsx
import React, { useState, useEffect } from 'react';

const PrescriptionModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    pasien: '',
    dokter: '',
    obat: '',
    tanggal: '',
  });

  const isEdit = !!initialData;

  // Sinkronisasi data saat modal dibuka atau initialData berubah
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ pasien: '', dokter: '', obat: '', tanggal: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl animate-fade-in-up">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          {isEdit ? 'Edit Resep' : 'Tambah Resep Baru'}
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
          {/* Nama Dokter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokter</label>
            <input
              type="text"
              name="dokter"
              value={formData.dokter}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan nama dokter"
            />
          </div>
          {/* Nama Obat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Obat</label>
            <input
              type="text"
              name="obat"
              value={formData.obat}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan nama obat"
            />
          </div>
          {/* Tanggal Resep */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Resep</label>
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
      {/* Catatan: Karena kita menggunakan Tailwind JIT (script CDN di HTML asli),
          kita perlu memastikan animasi 'animate-fade-in-up' ditangani.
          Jika Anda menggunakan instalasi Tailwind/Vite, tambahkan keyframe di CSS Anda
          atau gunakan library animasi React. Untuk saat ini, asumsikan itu bekerja
          atau ganti kelas animasi.
      */}
    </div>
  );
};

export default PrescriptionModal;