// src/pages/MedicinePage.jsx
import React, { useState } from 'react';
import { Pill, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import MedicineModal from '../components/MedicineModal';

// Data Obat Dummy
const initialMedicines = [
  { id: 1, kode: 'OB001', nama: 'Paracetamol', jenis: 'Tablet', harga: 5000, stok: 120 },
  { id: 2, kode: 'OB002', nama: 'Amoxicillin', jenis: 'Kapsul', harga: 8000, stok: 15 },
  { id: 3, kode: 'OB003', nama: 'Vitamin C', jenis: 'Tablet', harga: 3500, stok: 0 },
  { id: 4, kode: 'OB004', nama: 'Salep Kulit', jenis: 'Salep', harga: 15000, stok: 75 },
];

const MedicinePage = () => {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Fungsi Pembantu untuk Status Stok
  const getStockStatus = (stok) => {
    if (stok === 0) return { label: 'Habis', class: 'bg-red-100 text-red-700' };
    if (stok <= 20) return { label: 'Menipis', class: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Tersedia', class: 'bg-green-100 text-green-700' };
  };

  const handleSaveMedicine = (newMedicine) => {
    if (editingMedicine) {
      // Logic Edit
      setMedicines(medicines.map(med => med.id === editingMedicine.id ? { ...newMedicine, id: editingMedicine.id } : med));
      alert(`✅ Data Obat ${newMedicine.nama} berhasil diubah!`);
    } else {
      // Logic Tambah
      const newId = medicines.length > 0 ? Math.max(...medicines.map(d => d.id)) + 1 : 1;
      setMedicines([...medicines, { ...newMedicine, id: newId }]);
      alert(`✅ Data Obat ${newMedicine.nama} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
    setEditingMedicine(null);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data obat ini?')) {
      setMedicines(medicines.filter(med => med.id !== id));
      alert('🗑️ Data obat berhasil dihapus!');
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.jenis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (angka) => {
    return `Rp ${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <main className="p-6">
      <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center space-x-2">
        <Pill className="w-6 h-6 text-blue-800" />
        <span>Data Obat</span>
      </h3>

      {/* Header Tools: Search & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari obat (Nama, Kode, Jenis)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => { setEditingMedicine(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tambah Obat</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3">Kode Obat</th>
                <th className="px-6 py-3">Nama Obat</th>
                <th className="px-6 py-3">Jenis</th>
                <th className="px-6 py-3">Harga</th>
                <th className="px-6 py-3">Stok</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.map((med) => {
                const status = getStockStatus(med.stok);
                return (
                  <tr key={med.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{med.kode}</td>
                    <td className="px-6 py-3">{med.nama}</td>
                    <td className="px-6 py-3">{med.jenis}</td>
                    <td className="px-6 py-3">{formatRupiah(med.harga)}</td>
                    <td className="px-6 py-3">{med.stok}</td>
                    <td className="px-6 py-3">
                      <span className={`${status.class} px-3 py-1 rounded-full text-sm font-medium`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex justify-center space-x-3">
                      <button onClick={() => handleEdit(med)} className="text-blue-600 hover:text-blue-800 p-1 rounded transition">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(med.id)} className="text-red-600 hover:text-red-800 p-1 rounded transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredMedicines.length === 0 && (
                <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Data obat tidak ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Komponen */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMedicine(null); }}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
      />
    </main>
  );
};

export default MedicinePage;