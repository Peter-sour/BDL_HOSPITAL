// src/pages/PrescriptionPage.jsx
import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import PrescriptionModal from '../components/PrescriptionModal';

// Data Resep Dummy
const initialPrescriptions = [
  { id: 1, idResep: 'RS001', pasien: 'Sinta Lestari', dokter: 'dr. Rahmat', obat: 'Amoxicillin', tanggal: '2025-11-09' },
  { id: 2, idResep: 'RS002', pasien: 'Budi Kurniawan', dokter: 'dr. Siti', obat: 'Paracetamol', tanggal: '2025-11-10' },
  { id: 3, idResep: 'RS003', pasien: 'Ani Sucipto', dokter: 'dr. Rudi', obat: 'Vitamin C', tanggal: '2025-11-11' },
];

const PrescriptionPage = () => {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);

  const handleSavePrescription = (newPrescription) => {
    if (editingPrescription) {
      // Logic Edit
      setPrescriptions(prescriptions.map(p => p.id === editingPrescription.id ? { ...newPrescription, id: editingPrescription.id } : p));
      alert(`✅ Resep ${editingPrescription.idResep} berhasil diubah!`);
    } else {
      // Logic Tambah
      const newId = prescriptions.length > 0 ? Math.max(...prescriptions.map(p => p.id)) + 1 : 1;
      const newIdResep = `RS${String(newId).padStart(3, '0')}`;
      setPrescriptions([...prescriptions, { ...newPrescription, id: newId, idResep: newIdResep }]);
      alert(`✅ Resep ${newIdResep} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
    setEditingPrescription(null);
  };

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const prescriptionToDelete = prescriptions.find(p => p.id === id);
    if (window.confirm(`Apakah Anda yakin ingin menghapus resep ${prescriptionToDelete.idResep}?`)) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
      alert('🗑️ Data resep berhasil dihapus!');
    }
  };

  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
        <FileText className="w-6 h-6 text-blue-800" />
        <span>Data Resep</span>
      </h3>

      {/* Tombol tambah */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingPrescription(null); setIsModalOpen(true); }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Resep</span>
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Daftar Resep</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID Resep</th>
                <th className="py-3 px-4 text-left">Nama Pasien</th>
                <th className="py-3 px-4 text-left">Dokter</th>
                <th className="py-3 px-4 text-left">Obat</th>
                <th className="py-3 px-4 text-left">Tanggal</th>
                <th className="py-3 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{p.idResep}</td>
                  <td className="py-3 px-4">{p.pasien}</td>
                  <td className="py-3 px-4">{p.dokter}</td>
                  <td className="py-3 px-4">{p.obat}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Komponen */}
      <PrescriptionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPrescription(null); }}
        onSave={handleSavePrescription}
        initialData={editingPrescription}
      />
    </main>
  );
};

export default PrescriptionPage;