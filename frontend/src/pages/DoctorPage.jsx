// src/pages/DoctorPage.jsx
import React, { useState } from 'react';
import { Stethoscope, UserPlus, Edit, Trash2, Search } from 'lucide-react';
import DoctorModal from '../components/DoctorModal';

// Data Dokter Dummy
const initialDoctors = [
  { id: 1, nama: 'Dr. Siti Handayani', spesialis: 'Anak', telepon: '08123456789', departemen: 'Pediatri' },
  { id: 2, nama: 'Dr. Rudi Prakoso', spesialis: 'Bedah Umum', telepon: '08234567890', departemen: 'Bedah' },
  { id: 3, nama: 'Dr. Maria Kusuma', spesialis: 'Kardiologi', telepon: '08551234567', departemen: 'Jantung' },
];

const DoctorPage = () => {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null); // Data dokter yang sedang diedit

  const handleAddDoctor = (newDoctor) => {
    if (editingDoctor) {
      // Logic Edit
      setDoctors(doctors.map(doc => doc.id === editingDoctor.id ? { ...newDoctor, id: editingDoctor.id } : doc));
      alert(`✅ Data Dokter ${newDoctor.nama} berhasil diubah!`);
    } else {
      // Logic Tambah
      const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
      setDoctors([...doctors, { ...newDoctor, id: newId }]);
      alert(`✅ Data Dokter ${newDoctor.nama} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data dokter ini?')) {
      setDoctors(doctors.filter(doc => doc.id !== id));
      alert('🗑️ Data dokter berhasil dihapus!');
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.spesialis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.departemen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6">
      <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center space-x-2">
        <Stethoscope className="w-6 h-6 text-blue-800" />
        <span>Data Dokter</span>
      </h3>

      {/* Header Tools: Search & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari dokter (Nama, Spesialis, Departemen)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => { setEditingDoctor(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah Dokter</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 w-16">No</th>
                <th className="px-6 py-3">Nama Dokter</th>
                <th className="px-6 py-3">Spesialis</th>
                <th className="px-6 py-3">No. Telepon</th>
                <th className="px-6 py-3">Departemen</th>
                <th className="px-6 py-3 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDoctors.map((doc, index) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{doc.nama}</td>
                  <td className="px-6 py-3">{doc.spesialis}</td>
                  <td className="px-6 py-3">{doc.telepon}</td>
                  <td className="px-6 py-3">{doc.departemen}</td>
                  <td className="px-6 py-3 flex justify-center space-x-3">
                    <button onClick={() => handleEdit(doc)} className="text-blue-600 hover:text-blue-800 p-1 rounded transition">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-800 p-1 rounded transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Data dokter tidak ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Komponen */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDoctor(null); }}
        onSave={handleAddDoctor}
        initialData={editingDoctor}
      />
    </main>
  );
};

export default DoctorPage;