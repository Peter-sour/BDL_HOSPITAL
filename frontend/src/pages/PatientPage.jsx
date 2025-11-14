// src/pages/PatientPage.jsx
import React, { useState } from 'react';
import { User, UserPlus, Edit, Trash2, Search } from 'lucide-react';
import PatientModal from '../components/PatientModal';

// Data Pasien Dummy
const initialPatients = [
  { id: 1, nama: 'Ani Lestari', usia: 29, jenisKelamin: 'Perempuan', status: 'Rawat Jalan' },
  { id: 2, nama: 'Rian Pratama', usia: 35, jenisKelamin: 'Laki-laki', status: 'Rawat Inap' },
  { id: 3, nama: 'Budi Santoso', usia: 50, jenisKelamin: 'Laki-laki', status: 'Rawat Jalan' },
];

const PatientPage = () => {
  const [patients, setPatients] = useState(initialPatients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);

  // Fungsi Pembantu untuk Status Pasien
  const getStatusClass = (status) => {
    if (status === 'Rawat Inap') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Rawat Jalan') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleSavePatient = (newPatient) => {
    if (editingPatient) {
      // Logic Edit
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...newPatient, id: editingPatient.id } : p));
      alert(`✅ Data Pasien ${newPatient.nama} berhasil diubah!`);
    } else {
      // Logic Tambah
      const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
      setPatients([...patients, { ...newPatient, id: newId }]);
      alert(`✅ Data Pasien ${newPatient.nama} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
      setPatients(patients.filter(p => p.id !== id));
      alert('🗑️ Data pasien berhasil dihapus!');
    }
  };

  const filteredPatients = patients.filter(p =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6">
      <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center space-x-2">
        <User className="w-6 h-6 text-blue-800" />
        <span>Data Pasien</span>
      </h3>

      {/* Header Tools: Search & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pasien (Nama, Status)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => { setEditingPatient(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah Pasien</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 w-16">No</th>
                <th className="px-6 py-3">Nama Pasien</th>
                <th className="px-6 py-3">Usia</th>
                <th className="px-6 py-3">Jenis Kelamin</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient, index) => {
                const statusClass = getStatusClass(patient.status);
                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3">{patient.nama}</td>
                    <td className="px-6 py-3">{patient.usia}</td>
                    <td className="px-6 py-3">{patient.jenisKelamin}</td>
                    <td className="px-6 py-3">
                      <span className={`${statusClass} px-3 py-1 rounded-full text-sm font-medium`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex justify-center space-x-3">
                      <button onClick={() => handleEdit(patient)} className="text-blue-600 hover:text-blue-800 p-1 rounded transition">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-800 p-1 rounded transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Data pasien tidak ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Komponen */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPatient(null); }}
        onSave={handleSavePatient}
        initialData={editingPatient}
      />
    </main>
  );
};

export default PatientPage;