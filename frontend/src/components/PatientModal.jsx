// src/components/PatientModal.jsx
import React, { useState, useEffect } from 'react';

const PatientModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nama: '',
    usia: 0,
    jenisKelamin: '',
    status: '',
  });

  const isEdit = !!initialData;

  // Sinkronisasi data saat modal dibuka atau initialData berubah
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ nama: '', usia: 0, jenisKelamin: '', status: '' });
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
          {isEdit ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nama Pasien */}
          <div>
            <label className="block text-gray-600 text-sm">Nama Pasien</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Usia */}
          <div>
            <label className="block text-gray-600 text-sm">Usia</label>
            <input
              type="number"
              name="usia"
              value={formData.usia}
              onChange={handleChange}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Jenis Kelamin */}
          <div>
            <label className="block text-gray-600 text-sm">Jenis Kelamin</label>
            <select 
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange}
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          {/* Status */}
          <div>
            <label className="block text-gray-600 text-sm">Status</label>
            <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Pilih</option>
              <option value="Rawat Inap">Rawat Inap</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
            </select>
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

export default PatientModal;