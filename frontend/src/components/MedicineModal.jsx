// src/components/MedicineModal.jsx
import React, { useState, useEffect } from 'react';

const MedicineModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    jenis: '',
    harga: 0,
    stok: 0,
  });

  const isEdit = !!initialData;

  const medicineTypes = ['Tablet', 'Kapsul', 'Cair', 'Salep', 'Injeksi'];

  // Sinkronisasi data saat modal dibuka atau initialData berubah
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ kode: '', nama: '', jenis: '', harga: 0, stok: 0 });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {isEdit ? 'Edit Data Obat' : 'Tambah Obat Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Kode Obat */}
          <div>
            <label className="block text-gray-600 text-sm">Kode Obat</label>
            <input
              type="text"
              name="kode"
              value={formData.kode}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Nama Obat */}
          <div>
            <label className="block text-gray-600 text-sm">Nama Obat</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Jenis */}
          <div>
            <label className="block text-gray-600 text-sm">Jenis</label>
            <select 
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Pilih Jenis</option>
              {medicineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {/* Harga */}
          <div>
            <label className="block text-gray-600 text-sm">Harga (Rp)</label>
            <input
              type="number"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Stok */}
          <div>
            <label className="block text-gray-600 text-sm">Stok</label>
            <input
              type="number"
              name="stok"
              value={formData.stok}
              onChange={handleChange}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineModal;