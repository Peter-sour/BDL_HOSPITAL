// src/pages/RawatInapPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rawat-inap';

// Modal Tambah Pasien Rawat Inap
const AddRawatInapModal = ({ isOpen, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pasienList, setPasienList] = useState([]);
  const [kamarList, setKamarList] = useState([]);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);
  const [showPasienDropdown, setShowPasienDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchKamar();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPasien();
    } else {
      setPasienList([]);
      setShowPasienDropdown(false);
    }
  }, [searchTerm]);

  const searchPasien = async () => {
    try {
      const response = await axios.get(`${API_URL}/search-pasien`, {
        params: { search: searchTerm }
      });
      setPasienList(response.data.data || []);
      setShowPasienDropdown(true);
    } catch (error) {
      console.error('Error searching pasien:', error);
    }
  };

  const fetchKamar = async () => {
    try {
      const response = await axios.get(`${API_URL}/kamar`);
      setKamarList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching kamar:', error);
    }
  };

  const handleSelectPasien = (pasien) => {
    setSelectedPasien(pasien);
    setSearchTerm(`${pasien.NAMA} (${pasien.ID_PASIEN})`);
    setShowPasienDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedPasien || !selectedKamar) {
      alert('Silakan pilih pasien dan kamar terlebih dahulu');
      return;
    }

    // Cek status pasien
    if (selectedPasien.STATUS === 'Rawat Inap') {
      alert('Pasien ini masih dalam status rawat inap!');
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_URL, {
        id_pasien: selectedPasien.ID_PASIEN,
        id_kamar: selectedKamar.ID_KAMAR,
        tanggal_masuk: tanggalMasuk
      });
      
      alert('Pasien berhasil ditambahkan ke rawat inap');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding rawat inap:', error);
      alert(error.response?.data?.message || 'Gagal menambahkan data rawat inap');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedPasien(null);
    setSelectedKamar(null);
    setTanggalMasuk(new Date().toISOString().split('T')[0]);
    setPasienList([]);
    setShowPasienDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tambah Rawat Inap</h2>
        
        {/* Search Pasien */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cari Pasien</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik nama atau ID pasien (min. 2 karakter)"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPasien(null);
              }}
              onFocus={() => {
                if (pasienList.length > 0) {
                  setShowPasienDropdown(true);
                }
              }}
            />
            {showPasienDropdown && pasienList.length > 0 && !selectedPasien && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                {pasienList.map((p) => (
                  <li
                    key={p.ID_PASIEN}
                    className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelectPasien(p)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900">{p.NAMA}</div>
                        <div className="text-sm text-gray-600">ID: {p.ID_PASIEN}</div>
                        <div className="text-xs text-gray-500">{p.ALAMAT}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        p.STATUS === 'Rawat Inap' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {p.STATUS}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showPasienDropdown && pasienList.length === 0 && searchTerm.length >= 2 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-4 text-center text-gray-500">
                Pasien tidak ditemukan
              </div>
            )}
          </div>
        </div>

        {/* Pasien Terpilih */}
        {selectedPasien && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border-2 border-green-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="text-green-900 font-semibold text-lg">
                  ✓ Pasien terpilih siap ditambahkan
                </div>
                <div className="mt-2 text-green-800">
                  <div className="font-medium">Nama: {selectedPasien.NAMA}</div>
                  <div className="text-sm">ID Pasien: {selectedPasien.ID_PASIEN}</div>
                  <div className="text-sm">Status Saat Ini: <span className={`font-semibold ${selectedPasien.STATUS === 'Rawat Inap' ? 'text-red-600' : 'text-green-600'}`}>{selectedPasien.STATUS}</span></div>
                </div>
              </div>
            </div>
            {selectedPasien.STATUS === 'Rawat Inap' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <span className="text-lg mr-2">⚠️</span>
                  <span className="font-medium">Perhatian: Pasien ini masih dalam status rawat inap!</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pilih Kamar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kamar</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {kamarList.map((kamar) => (
              <div
                key={kamar.ID_KAMAR}
                onClick={() => kamar.STATUS_KAMAR === 'Tersedia' && setSelectedKamar(kamar)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedKamar?.ID_KAMAR === kamar.ID_KAMAR
                    ? 'border-blue-500 bg-blue-50'
                    : kamar.STATUS_KAMAR === 'Tersedia'
                    ? 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{kamar.NAMA_KAMAR}</div>
                    <div className="text-sm text-gray-600">No. {kamar.NO_KAMAR}</div>
                    <div className="text-xs text-gray-500">{kamar.KELAS_KAMAR}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    kamar.STATUS_KAMAR === 'Tersedia'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {kamar.STATUS_KAMAR}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tanggal Masuk */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Masuk</label>
          <input
            type="date"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={tanggalMasuk}
            onChange={(e) => setTanggalMasuk(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedPasien || !selectedKamar || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" /> Tambahkan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Edit Status (Checkout)
const EditStatusModal = ({ isOpen, onClose, onSuccess, rawatInap }) => {
  const [tanggalKeluar, setTanggalKeluar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rawatInap?.TANGGAL_KELUAR) {
      setTanggalKeluar(rawatInap.TANGGAL_KELUAR.split('T')[0]);
    } else {
      setTanggalKeluar(new Date().toISOString().split('T')[0]);
    }
  }, [rawatInap]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/${rawatInap.ID_RAWAT}`, {
        tanggal_keluar: tanggalKeluar
      });
      
      alert('Status pasien berhasil diupdate');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Gagal mengupdate status');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!window.confirm('Yakin ingin checkout pasien ini?')) return;
    
    setLoading(true);
    try {
      await axios.put(`${API_URL}/${rawatInap.ID_RAWAT}`, {
        tanggal_keluar: new Date().toISOString().split('T')[0]
      });
      
      alert('Pasien berhasil checkout');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error checkout:', error);
      alert(error.response?.data?.message || 'Gagal checkout pasien');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rawatInap) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Status Rawat Inap</h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Pasien</div>
          <div className="font-semibold text-gray-900">{rawatInap.NAMA_PASIEN}</div>
          <div className="text-sm text-gray-600">ID: {rawatInap.ID_PASIEN}</div>
          <div className="text-sm text-gray-600 mt-2">
            Kamar: {rawatInap.NAMA_KAMAR} - {rawatInap.NO_KAMAR} ({rawatInap.KELAS_KAMAR})
          </div>
          <div className="text-sm text-gray-600">
            Tanggal Masuk: {new Date(rawatInap.TANGGAL_MASUK).toLocaleDateString('id-ID')}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Keluar</label>
          <input
            type="date"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={tanggalKeluar}
            onChange={(e) => setTanggalKeluar(e.target.value)}
            min={rawatInap.TANGGAL_MASUK?.split('T')[0]}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleCheckout}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            disabled={loading}
          >
            Checkout Hari Ini
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Halaman Rawat Inap
const RawatInapPage = () => {
  const [rawatInapData, setRawatInapData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRawatInap, setSelectedRawatInap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRawatInap();
  }, []);

  const fetchRawatInap = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setRawatInapData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rawat inap:', error);
      alert('Gagal memuat data rawat inap');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data rawat inap ini?')) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert('Data berhasil dihapus');
      fetchRawatInap();
    } catch (error) {
      console.error('Error deleting rawat inap:', error);
      alert(error.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const handleEdit = (rawatInap) => {
    setSelectedRawatInap(rawatInap);
    setIsEditModalOpen(true);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Data Rawat Inap</h3>
          <p className="text-sm text-gray-600 mt-1">Kelola data pasien rawat inap rumah sakit</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Pasien
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Rawat</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Pasien</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Pasien</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kamar</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rawatInapData.map((item, idx) => (
                <tr key={item.ID_RAWAT} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{item.ID_RAWAT}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{item.ID_PASIEN}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.NAMA_PASIEN}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.NAMA_KAMAR} - {item.NO_KAMAR}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.KELAS_KAMAR}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(item.TANGGAL_MASUK).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.TANGGAL_KELUAR 
                      ? new Date(item.TANGGAL_KELUAR).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.STATUS === 'Rawat Inap'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.STATUS}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.ID_RAWAT)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rawatInapData.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    Belum ada data rawat inap
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AddRawatInapModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchRawatInap}
      />

      <EditStatusModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRawatInap(null);
        }}
        onSuccess={fetchRawatInap}
        rawatInap={selectedRawatInap}
      />
    </main>
  );
};

export default RawatInapPage;