// src/pages/RawatInapPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

// Dummy data pasien
const pasienDummy = [
  { idPasien: 'P001', nama: 'Siti A.' },
  { idPasien: 'P002', nama: 'Budi H.' },
  { idPasien: 'P003', nama: 'Tia M.' },
  { idPasien: 'P004', nama: 'Andi S.' },
  { idPasien: 'P005', nama: 'Rina K.' },
];

// Modal Tambah Pasien
const AddPatientModal = ({ isOpen, onClose, onSelect, pasienList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPasien, setFilteredPasien] = useState([]);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPasien([]);
      setShowDropdown(false);
      return;
    }
    const term = searchTerm.toLowerCase();
    const result = pasienList.filter(
      p => p.nama.toLowerCase().includes(term) || p.idPasien.toLowerCase().includes(term)
    );
    setFilteredPasien(result);
    setShowDropdown(true);
  }, [searchTerm, pasienList]);

  const handleSelect = (pasien) => {
    setSelectedPasien(pasien);
    setSearchTerm(`${pasien.nama} (${pasien.idPasien})`);
    setShowDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedPasien) {
      const tanggalMasuk = new Date().toISOString().split('T')[0];
      onSelect({ ...selectedPasien, tanggalMasuk, tanggalKeluar: '', status: 'Rawat Inap' });
      setSearchTerm('');
      setSelectedPasien(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tambah Pasien</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pasien (Nama / ID)"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-1"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedPasien(null);
            }}
          />
          {showDropdown && filteredPasien.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
              {filteredPasien.map((p) => (
                <li
                  key={p.idPasien}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelect(p)}
                >
                  {p.nama} ({p.idPasien})
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedPasien && (
          <div className="bg-green-100 text-green-800 p-2 rounded mb-3 mt-1">
            Pasien {selectedPasien.nama} ({selectedPasien.idPasien}) berhasil dipilih
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!selectedPasien}
          >
            Tambahkan
          </button>
        </div>
      </div>
    </div>
  );
};

// Halaman Rawat Inap
const RawatInapPage = () => {
  const [rawatInapData, setRawatInapData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSelectPasien = (pasien) => {
    setRawatInapData(prev => [...prev, pasien]);
  };

  const handleDelete = (idPasien) => {
    if (window.confirm('Yakin ingin menghapus pasien ini dari rawat inap?')) {
      setRawatInapData(prev => prev.filter(p => p.idPasien !== idPasien));
    }
  };

  const toggleStatus = (idPasien) => {
    setRawatInapData(prev =>
      prev.map(p =>
        p.idPasien === idPasien
          ? { ...p, status: p.status === 'Rawat Inap' ? 'Rawat Jalan' : 'Rawat Inap' }
          : p
      )
    );
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-700">Data Rawat Inap</h3>
        <button
          onClick={handleAddClick}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Pasien
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Pasien</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Pasien</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Masuk</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Keluar</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rawatInapData.map((p, idx) => (
              <tr key={p.idPasien} className="hover:bg-gray-50">
                <td className="px-6 py-4">{idx + 1}</td>
                <td className="px-6 py-4 font-mono text-gray-700">{p.idPasien}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{p.nama}</td>
                <td className="px-6 py-4">{p.tanggalMasuk}</td>
                <td className="px-6 py-4">{p.tanggalKeluar || '-'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(p.idPasien)}
                    className={`px-3 py-1 rounded-lg text-white ${
                      p.status === 'Rawat Inap' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    {p.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(p.idPasien)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rawatInapData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  Belum ada pasien rawat inap
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSelectPasien}
        pasienList={pasienDummy}
      />
    </main>
  );
};

export default RawatInapPage;
