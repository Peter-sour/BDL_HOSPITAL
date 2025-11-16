import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Calendar, User, Stethoscope, Pill, X, Search, ShoppingCart } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/resep'; // Sesuaikan dengan backend Anda

const PrescriptionPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [detailPrescription, setDetailPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Data untuk dropdown
  const [pasienList, setPasienList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [obatList, setObatList] = useState([]);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data resep
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      alert('❌ Gagal memuat data resep');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [pasienRes, dokterRes, obatRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dropdown/pasien`),
        fetch(`${API_BASE_URL}/dropdown/dokter`),
        fetch(`${API_BASE_URL}/dropdown/obat`)
      ]);
      
      const pasienData = await pasienRes.json();
      const dokterData = await dokterRes.json();
      const obatData = await obatRes.json();
      
      if (pasienData.success) setPasienList(pasienData.data);
      if (dokterData.success) setDokterList(dokterData.data);
      if (obatData.success) setObatList(obatData.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // Fetch detail resep
  const fetchPrescriptionDetail = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      const data = await response.json();
      if (data.success) {
        setDetailPrescription(data.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching prescription detail:', error);
      alert('❌ Gagal memuat detail resep');
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchDropdownData();
  }, []);

  const handleDelete = async (id) => {
    const prescription = prescriptions.find(p => p.ID_RESEP === id);
    if (window.confirm(`Apakah Anda yakin ingin menghapus resep ${prescription?.ID_RESEP}?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          alert('✅ Resep berhasil dihapus!');
          fetchPrescriptions();
        } else {
          alert('❌ ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting prescription:', error);
        alert('❌ Gagal menghapus resep');
      }
    }
  };

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription);
    setIsModalOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.NAMA_PASIEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.NAMA_DOKTER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ID_RESEP?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">Data Resep</h3>
              <p className="text-gray-500 text-sm">Kelola resep obat pasien</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingPrescription(null); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Tambah Resep</span>
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari resep, pasien, atau dokter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Resep</p>
              <p className="text-2xl font-bold">{prescriptions.length}</p>
            </div>
            <FileText className="w-10 h-10 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Hari Ini</p>
              <p className="text-2xl font-bold">
                {prescriptions.filter(p => {
                  const today = new Date().toISOString().split('T')[0];
                  const resepDate = p.TANGGAL_RESEP?.split('T')[0];
                  return resepDate === today;
                }).length}
              </p>
            </div>
            <Calendar className="w-10 h-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Daftar Resep</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data resep</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">ID Resep</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Pasien</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4" />
                      <span>Dokter</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Pill className="w-4 h-4" />
                      <span>Obat</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tanggal</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPrescriptions.map((p) => (
                  <tr key={p.ID_RESEP} className="hover:bg-blue-50 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        {p.ID_RESEP}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{p.NAMA_PASIEN}</div>
                      <div className="text-xs text-gray-500">{p.ID_PASIEN}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{p.NAMA_DOKTER}</div>
                      <div className="text-xs text-gray-500">{p.SPESIALIS}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">{p.DAFTAR_OBAT || '-'}</div>
                      <div className="text-xs text-gray-500">{p.JUMLAH_JENIS_OBAT} jenis obat</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(p.TANGGAL_RESEP).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => fetchPrescriptionDetail(p.ID_RESEP)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.ID_RESEP)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <PrescriptionModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingPrescription(null); }}
          onSuccess={fetchPrescriptions}
          initialData={editingPrescription}
          pasienList={pasienList}
          dokterList={dokterList}
          obatList={obatList}
        />
      )}

      {/* Modal Detail */}
      {isDetailModalOpen && detailPrescription && (
        <DetailModal
          isOpen={isDetailModalOpen}
          onClose={() => { setIsDetailModalOpen(false); setDetailPrescription(null); }}
          data={detailPrescription}
        />
      )}
    </main>
  );
};

// Component Modal Form
const PrescriptionModal = ({ isOpen, onClose, onSuccess, initialData, pasienList, dokterList, obatList }) => {
  const [formData, setFormData] = useState({
    id_pasien: '',
    id_dokter: '',
    tanggal_resep: new Date().toISOString().split('T')[0],
    catatan: '',
    daftar_obat: []
  });

  const [selectedObat, setSelectedObat] = useState({
    id_obat: '',
    jumlah: 1,
    aturan_pakai: ''
  });

  // State untuk searchable dropdown
  const [pasienSearch, setPasienSearch] = useState('');
  const [dokterSearch, setDokterSearch] = useState('');
  const [obatSearch, setObatSearch] = useState('');
  const [showPasienDropdown, setShowPasienDropdown] = useState(false);
  const [showDokterDropdown, setShowDokterDropdown] = useState(false);
  const [showObatDropdown, setShowObatDropdown] = useState(false);

  useEffect(() => {
    if (initialData) {
      const pasien = pasienList.find(p => p.ID_PASIEN === initialData.ID_PASIEN);
      const dokter = dokterList.find(d => d.ID_DOKTER === initialData.ID_DOKTER);
      
      setFormData({
        id_pasien: initialData.ID_PASIEN,
        id_dokter: initialData.ID_DOKTER,
        tanggal_resep: initialData.TANGGAL_RESEP?.split('T')[0] || new Date().toISOString().split('T')[0],
        catatan: initialData.CATATAN || '',
        daftar_obat: []
      });
      
      if (pasien) setPasienSearch(pasien.NAMA);
      if (dokter) setDokterSearch(dokter.NAMA);
    }
  }, [initialData, pasienList, dokterList]);

  // Filter functions
  const filteredPasien = pasienList.filter(p => 
    p.NAMA?.toLowerCase().includes(pasienSearch.toLowerCase()) ||
    p.ID_PASIEN?.toLowerCase().includes(pasienSearch.toLowerCase())
  );

  const filteredDokter = dokterList.filter(d => 
    d.NAMA?.toLowerCase().includes(dokterSearch.toLowerCase()) ||
    d.SPESIALIS?.toLowerCase().includes(dokterSearch.toLowerCase()) ||
    d.ID_DOKTER?.toLowerCase().includes(dokterSearch.toLowerCase())
  );

  const filteredObat = obatList.filter(o => 
    o.NAMA_OBAT?.toLowerCase().includes(obatSearch.toLowerCase()) ||
    o.JENIS_OBAT?.toLowerCase().includes(obatSearch.toLowerCase())
  );

  // Handler untuk select pasien
  const handleSelectPasien = (pasien) => {
    setFormData({ ...formData, id_pasien: pasien.ID_PASIEN });
    setPasienSearch(pasien.NAMA);
    setShowPasienDropdown(false);
  };

  // Handler untuk select dokter
  const handleSelectDokter = (dokter) => {
    setFormData({ ...formData, id_dokter: dokter.ID_DOKTER });
    setDokterSearch(dokter.NAMA);
    setShowDokterDropdown(false);
  };

  // Handler untuk select obat
  const handleSelectObat = (obat) => {
    setSelectedObat({ ...selectedObat, id_obat: obat.ID_OBAT });
    setObatSearch(obat.NAMA_OBAT);
    setShowObatDropdown(false);
  };

  const handleAddObat = () => {
    if (!selectedObat.id_obat || selectedObat.jumlah < 1 || !selectedObat.aturan_pakai) {
      alert('⚠️ Lengkapi data obat!');
      return;
    }

    const obat = obatList.find(o => o.ID_OBAT === selectedObat.id_obat);
    if (obat && selectedObat.jumlah > obat.STOK) {
      alert(`⚠️ Stok tidak cukup! Stok tersedia: ${obat.STOK}`);
      return;
    }

    setFormData({
      ...formData,
      daftar_obat: [...formData.daftar_obat, { ...selectedObat }]
    });

    setSelectedObat({ id_obat: '', jumlah: 1, aturan_pakai: '' });
    setObatSearch('');
  };

  const handleRemoveObat = (index) => {
    setFormData({
      ...formData,
      daftar_obat: formData.daftar_obat.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_pasien || !formData.id_dokter || formData.daftar_obat.length === 0) {
      alert('⚠️ Lengkapi semua data yang diperlukan!');
      return;
    }

    try {
      const url = initialData
        ? `${API_BASE_URL}/${initialData.ID_RESEP}`
        : API_BASE_URL;
      
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Resep berhasil ${initialData ? 'diupdate' : 'ditambahkan'}!`);
        onSuccess();
        onClose();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('❌ Gagal menyimpan resep');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-2xl font-bold">
            {initialData ? 'Edit Resep' : 'Tambah Resep Baru'}
          </h3>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Searchable Pasien Dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pasien *</label>
              <div className="relative">
                <input
                  type="text"
                  value={pasienSearch}
                  onChange={(e) => {
                    setPasienSearch(e.target.value);
                    setShowPasienDropdown(true);
                    setFormData({ ...formData, id_pasien: '' });
                  }}
                  onFocus={() => setShowPasienDropdown(true)}
                  placeholder="Ketik nama atau ID pasien..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              
              {showPasienDropdown && filteredPasien.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredPasien.map(pasien => (
                    <div
                      key={pasien.ID_PASIEN}
                      onClick={() => handleSelectPasien(pasien)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition"
                    >
                      <div className="font-semibold text-gray-800">{pasien.NAMA}</div>
                      <div className="text-xs text-gray-500">{pasien.ID_PASIEN}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.id_pasien && (
                <div className="mt-1 text-xs text-green-600 font-medium">
                  ✓ Dipilih: {pasienList.find(p => p.ID_PASIEN === formData.id_pasien)?.ID_PASIEN}
                </div>
              )}
            </div>

            {/* Searchable Dokter Dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dokter *</label>
              <div className="relative">
                <input
                  type="text"
                  value={dokterSearch}
                  onChange={(e) => {
                    setDokterSearch(e.target.value);
                    setShowDokterDropdown(true);
                    setFormData({ ...formData, id_dokter: '' });
                  }}
                  onFocus={() => setShowDokterDropdown(true)}
                  placeholder="Ketik nama atau spesialis dokter..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              
              {showDokterDropdown && filteredDokter.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredDokter.map(dokter => (
                    <div
                      key={dokter.ID_DOKTER}
                      onClick={() => handleSelectDokter(dokter)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition"
                    >
                      <div className="font-semibold text-gray-800">{dokter.NAMA}</div>
                      <div className="text-xs text-gray-500">{dokter.SPESIALIS} • {dokter.ID_DOKTER}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.id_dokter && (
                <div className="mt-1 text-xs text-green-600 font-medium">
                  ✓ Dipilih: {dokterList.find(d => d.ID_DOKTER === formData.id_dokter)?.NAMA}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Resep *</label>
              <input
                type="date"
                value={formData.tanggal_resep}
                onChange={(e) => setFormData({ ...formData, tanggal_resep: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
              <input
                type="text"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Catatan tambahan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tambah Obat */}
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span>Tambah Obat</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Searchable Obat Dropdown */}
              <div className="md:col-span-2 relative">
                <div className="relative">
                  <input
                    type="text"
                    value={obatSearch}
                    onChange={(e) => {
                      setObatSearch(e.target.value);
                      setShowObatDropdown(true);
                      setSelectedObat({ ...selectedObat, id_obat: '' });
                    }}
                    onFocus={() => setShowObatDropdown(true)}
                    placeholder="Ketik nama atau jenis obat..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                
                {showObatDropdown && filteredObat.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredObat.map(obat => (
                      <div
                        key={obat.ID_OBAT}
                        onClick={() => handleSelectObat(obat)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition"
                      >
                        <div className="font-semibold text-gray-800">{obat.NAMA_OBAT}</div>
                        <div className="text-xs text-gray-600">
                          {obat.JENIS_OBAT} • Stok: {obat.STOK} • Rp {obat.HARGA?.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedObat.id_obat && (
                  <div className="mt-1 text-xs text-green-600 font-medium">
                    ✓ Dipilih: {obatList.find(o => o.ID_OBAT === selectedObat.id_obat)?.NAMA_OBAT}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="number"
                  value={selectedObat.jumlah}
                  onChange={(e) => setSelectedObat({ ...selectedObat, jumlah: parseInt(e.target.value) || 1 })}
                  min="1"
                  placeholder="Jumlah"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={selectedObat.aturan_pakai}
                  onChange={(e) => setSelectedObat({ ...selectedObat, aturan_pakai: e.target.value })}
                  placeholder="3x sehari"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddObat}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Daftar</span>
            </button>
          </div>

          {/* Daftar Obat */}
          {formData.daftar_obat.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-4">Daftar Obat ({formData.daftar_obat.length})</h4>
              <div className="space-y-3">
                {formData.daftar_obat.map((obat, index) => {
                  const obatDetail = obatList.find(o => o.ID_OBAT === obat.id_obat);
                  return (
                    <div key={index} className="bg-white p-4 rounded-lg flex justify-between items-center border border-gray-200">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{obatDetail?.NAMA_OBAT}</div>
                        <div className="text-sm text-gray-600">
                          Jumlah: {obat.jumlah} | {obat.aturan_pakai}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveObat(index)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
            >
              {initialData ? 'Update Resep' : 'Simpan Resep'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component Modal Detail
const DetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-2xl font-bold flex items-center space-x-2">
            <Eye className="w-6 h-6" />
            <span>Detail Resep</span>
          </h3>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Resep */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Informasi Resep</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID Resep</p>
                <p className="font-mono font-bold text-blue-600">{data.ID_RESEP}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Resep</p>
                <p className="font-semibold text-gray-800">
                  {new Date(data.TANGGAL_RESEP).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {data.CATATAN && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Catatan</p>
                  <p className="text-gray-800">{data.CATATAN}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Pasien */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center space-x-2">
              <User className="w-5 h-5 text-green-600" />
              <span>Data Pasien</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID Pasien</p>
                <p className="font-semibold text-gray-800">{data.ID_PASIEN}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nama Pasien</p>
                <p className="font-semibold text-gray-800">{data.NAMA_PASIEN}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Lahir</p>
                <p className="text-gray-800">
                  {new Date(data.TANGGAL_LAHIR).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="text-gray-800">{data.ALAMAT}</p>
              </div>
            </div>
          </div>

          {/* Info Dokter */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span>Data Dokter</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID Dokter</p>
                <p className="font-semibold text-gray-800">{data.ID_DOKTER}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nama Dokter</p>
                <p className="font-semibold text-gray-800">{data.NAMA_DOKTER}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Spesialis</p>
                <p className="text-gray-800">{data.SPESIALIS}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Departemen</p>
                <p className="text-gray-800">{data.DEPARTEMEN}</p>
              </div>
            </div>
          </div>

          {/* Daftar Obat */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
            <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center space-x-2">
              <Pill className="w-5 h-5 text-orange-600" />
              <span>Daftar Obat ({data.daftar_obat?.length || 0})</span>
            </h4>
            <div className="space-y-3">
              {data.daftar_obat && data.daftar_obat.length > 0 ? (
                data.daftar_obat.map((obat, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 text-lg">{obat.NAMA_OBAT}</h5>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {obat.JENIS_OBAT}
                          </span>
                          <span className="text-gray-600">Dosis: {obat.DOSIS}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">
                          Rp {obat.HARGA?.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">per unit</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Jumlah</p>
                          <p className="font-semibold text-gray-800">{obat.JUMLAH} unit</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="font-semibold text-green-600">
                            Rp {obat.SUBTOTAL?.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Aturan Pakai</p>
                        <p className="font-semibold text-gray-800 bg-yellow-50 px-3 py-2 rounded-lg mt-1">
                          {obat.ATURAN_PAKAI}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Tidak ada data obat</p>
              )}
            </div>
          </div>

          {/* Total */}
          {data.total_harga > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Total Harga Obat</p>
                  <p className="text-3xl font-bold mt-1">
                    Rp {data.total_harga?.toLocaleString('id-ID')}
                  </p>
                </div>
                <ShoppingCart className="w-12 h-12 opacity-80" />
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPage;