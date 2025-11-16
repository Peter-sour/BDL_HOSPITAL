// src/components/DoctorModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DoctorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    id_dokter: '',
    nama: '',
    spesialis: '',
    departemen: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Mode Edit - ID tidak bisa diubah
      setFormData({
        id_dokter: initialData.ID_DOKTER || '',
        nama: initialData.NAMA || '',
        spesialis: initialData.SPESIALIS || '',
        departemen: initialData.DEPARTEMEN || ''
      });
    } else {
      // Mode Tambah - Reset form
      setFormData({
        id_dokter: '',
        nama: '',
        spesialis: '',
        departemen: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error saat user mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!initialData && !formData.id_dokter.trim()) {
      newErrors.id_dokter = 'ID Dokter harus diisi';
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama dokter harus diisi';
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = 'Nama dokter minimal 3 karakter';
    }

    if (!formData.spesialis.trim()) {
      newErrors.spesialis = 'Spesialis harus diisi';
    }

    if (!formData.departemen.trim()) {
      newErrors.departemen = 'Departemen harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {initialData ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ID Dokter */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              ID Dokter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="id_dokter"
              value={formData.id_dokter}
              onChange={handleChange}
              disabled={!!initialData}
              placeholder="Contoh: DOK001"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.id_dokter ? 'border-red-500' : 'border-gray-300'
              } ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.id_dokter && (
              <p className="text-red-500 text-sm mt-1">{errors.id_dokter}</p>
            )}
          </div>

          {/* Nama Dokter */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nama Dokter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Dr. Siti Handayani"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.nama ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nama && (
              <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
            )}
          </div>

          {/* Spesialis */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Spesialis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="spesialis"
              value={formData.spesialis}
              onChange={handleChange}
              placeholder="Contoh: Anak, Bedah Umum, Kardiologi"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.spesialis ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.spesialis && (
              <p className="text-red-500 text-sm mt-1">{errors.spesialis}</p>
            )}
          </div>

          {/* Departemen */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Departemen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="departemen"
              value={formData.departemen}
              onChange={handleChange}
              placeholder="Contoh: Pediatri, Bedah, Jantung"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.departemen ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.departemen && (
              <p className="text-red-500 text-sm mt-1">{errors.departemen}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {initialData ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorModal;