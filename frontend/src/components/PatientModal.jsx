// src/components/PatientModal.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const PatientModal = ({ isOpen, onClose, onSave, initialData, apiError }) => {
  const [formData, setFormData] = useState({
    idPasien: '',
    nama: '',
    tanggalLahir: '', 
    alamat: '',
  });

  const isEdit = !!initialData?.idPasien;

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ 
        idPasien: '',
        nama: '', 
        tanggalLahir: new Date().toISOString().split('T')[0],
        alamat: '' 
      });
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
          {isEdit ? `Edit Pasien: ${formData.idPasien}` : 'Tambah Pasien Baru'}
        </h2>
        
        {/* ALERT ERROR dari API */}
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* ID Pasien (Hanya untuk mode Tambah) */}
          {!isEdit && (
            <div>
              <label className="block text-gray-600 text-sm">ID Pasien</label>
              <input
                type="text"
                name="idPasien"
                value={formData.idPasien}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Contoh: P001"
              />
            </div>
          )}
          {/* ID Pasien (Mode Edit - Disabled) */}
          {isEdit && (
              <div>
                  <label className="block text-gray-600 text-sm">ID Pasien</label>
                  <input
                      type="text"
                      value={formData.idPasien}
                      disabled
                      className="w-full border border-gray-300 bg-gray-100 rounded-lg px-3 py-2"
                  />
              </div>
          )}

          {/* Nama Pasien */}
          <div>
            <label className="block text-gray-600 text-sm">Nama Pasien</label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-gray-600 text-sm">Tanggal Lahir</label>
            <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-gray-600 text-sm">Alamat</label>
            <textarea name="alamat" value={formData.alamat} onChange={handleChange} required rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {isEdit ? 'Update Data' : 'Simpan Pasien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;