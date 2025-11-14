// src/components/DoctorModal.jsx
import React, { useState, useEffect } from 'react';

const DoctorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nama: '',
    spesialis: '',
    telepon: '',
    departemen: '',
  });

  const isEdit = !!initialData;

  // Sinkronisasi data saat modal dibuka untuk edit
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ nama: '', spesialis: '', telepon: '', departemen: '' });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {isEdit ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Input Nama Dokter */}
          <div>
            <label className="block text-gray-600 text-sm">Nama Dokter</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Input Spesialis */}
          <div>
            <label className="block text-gray-600 text-sm">Spesialis</label>
            <input
              type="text"
              name="spesialis"
              value={formData.spesialis}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Input No. Telepon */}
          <div>
            <label className="block text-gray-600 text-sm">No. Telepon</label>
            <input
              type="text"
              name="telepon"
              value={formData.telepon}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Input Departemen */}
          <div>
            <label className="block text-gray-600 text-sm">Departemen</label>
            <input
              type="text"
              name="departemen"
              value={formData.departemen}
              onChange={handleChange}
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

export default DoctorModal;