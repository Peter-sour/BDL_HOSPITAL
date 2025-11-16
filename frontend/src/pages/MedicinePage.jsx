import React, { useState, useEffect } from 'react';
import { Pill, PlusCircle, Edit, Trash2, Search, AlertCircle, CheckCircle, XCircle, Package } from 'lucide-react';

// ============================================
// MEDICINE MODAL COMPONENT
// ============================================
const MedicineModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    id_obat: '',
    nama_obat: '',
    jenis_obat: '',
    dosis: '',
    harga: 0,
    stok: 0,
  });

  const isEdit = !!initialData;
  const medicineTypes = ['Tablet', 'Kapsul', 'Cair', 'Salep', 'Injeksi'];

  useEffect(() => {
    if (initialData) {
      // Normalize field names (support both lowercase and UPPERCASE from Oracle)
      setFormData({
        id_obat: initialData.id_obat || initialData.ID_OBAT || '',
        nama_obat: initialData.nama_obat || initialData.NAMA_OBAT || '',
        jenis_obat: initialData.jenis_obat || initialData.JENIS_OBAT || '',
        dosis: initialData.dosis || initialData.DOSIS || '',
        harga: initialData.harga || initialData.HARGA || 0,
        stok: initialData.stok ?? initialData.STOK ?? 0,
      });
    } else {
      setFormData({ id_obat: '', nama_obat: '', jenis_obat: '', dosis: '', harga: 0, stok: 0 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {isEdit ? 'Edit Data Obat' : 'Tambah Obat Baru'}
        </h2>
        <div className="space-y-3">
          {/* ID Obat */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">ID Obat</label>
            <input
              type="text"
              name="id_obat"
              value={formData.id_obat}
              onChange={handleChange}
              disabled={isEdit}
              required
              placeholder="Contoh: OB001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>
          {/* Nama Obat */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Nama Obat</label>
            <input
              type="text"
              name="nama_obat"
              value={formData.nama_obat}
              onChange={handleChange}
              required
              placeholder="Contoh: Paracetamol"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Jenis */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Jenis Obat</label>
            <select 
                name="jenis_obat"
                value={formData.jenis_obat}
                onChange={handleChange}
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Pilih Jenis</option>
              {medicineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {/* Dosis */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Dosis</label>
            <input
              type="text"
              name="dosis"
              value={formData.dosis}
              onChange={handleChange}
              required
              placeholder="Contoh: 500mg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Harga */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Harga (Rp)</label>
            <input
              type="number"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Stok */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Stok</label>
            <input
              type="number"
              name="stok"
              value={formData.stok}
              onChange={handleChange}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {formData.stok < 10 && formData.stok >= 0 && (
              <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Peringatan: Stok di bawah 10 unit!
              </p>
            )}
          </div>
          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STOCK UPDATE MODAL COMPONENT
// ============================================
const StockModal = ({ isOpen, onClose, medicine, onUpdate }) => {
  const [stok, setStok] = useState(0);

  useEffect(() => {
    if (medicine) {
      setStok(medicine.stok ?? medicine.STOK ?? 0);
    }
  }, [medicine, isOpen]);

  if (!isOpen || !medicine) return null;

  const handleSubmit = () => {
    onUpdate(medicine.id_obat, stok);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Update Stok Obat
        </h2>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Nama Obat:</p>
          <p className="font-semibold text-gray-800">{medicine.nama_obat}</p>
          <p className="text-xs text-gray-500 mt-1">Stok Saat Ini: {medicine.stok} unit</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Stok Baru</label>
            <input
              type="number"
              value={stok}
              onChange={(e) => setStok(parseInt(e.target.value) || 0)}
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {stok < 10 && stok >= 0 && (
              <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Trigger akan memberi peringatan: Stok di bawah 10!
              </p>
            )}
            {stok < 0 && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Trigger akan menolak: Stok tidak boleh negatif!
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Update Stok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// NOTIFICATION COMPONENT
// ============================================
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-100 border-green-500 text-green-800' : 
                  type === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                  'bg-red-100 border-red-500 text-red-800';
  
  const Icon = type === 'success' ? CheckCircle : type === 'warning' ? AlertCircle : XCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border-l-4 p-4 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN MEDICINE PAGE COMPONENT
// ============================================
const MedicinePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [notification, setNotification] = useState(null);

  // API Base URL (sesuaikan dengan backend kamu)
  const API_URL = 'http://localhost:5000/api/medicine';
  
  // Set true untuk mode dummy (testing UI tanpa backend)
  const USE_DUMMY_DATA = false; // Ubah jadi true untuk test UI dengan data dummy

  // Fetch semua obat
  const fetchMedicines = async () => {
    setLoading(true);
    
    // Mode dummy untuk testing UI
    if (USE_DUMMY_DATA) {
      setTimeout(() => {
        setMedicines([
          { id_obat: 'OB001', nama_obat: 'Paracetamol', jenis_obat: 'Tablet', dosis: '500mg', harga: 5000, stok: 120 },
          { id_obat: 'OB002', nama_obat: 'Amoxicillin', jenis_obat: 'Kapsul', dosis: '500mg', harga: 8000, stok: 8 },
          { id_obat: 'OB003', nama_obat: 'Vitamin C', jenis_obat: 'Tablet', dosis: '1000mg', harga: 3500, stok: 0 },
        ]);
        setLoading(false);
      }, 500);
      return;
    }
    
    try {
      const response = await fetch(API_URL);
      
      // Cek apakah response OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response bukan JSON! Pastikan backend sudah jalan.');
      }
      
      const data = await response.json();
      
      // DEBUG: Log response dari API
      console.log('📦 Response dari API:', data);
      console.log('📊 Jumlah data:', data.data?.length);
      
      if (data.success) {
        setMedicines(data.data || []);
      } else {
        showNotification(data.message || 'Gagal memuat data', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification('❌ Backend tidak terhubung! ' + error.message, 'error');
      // Set data dummy untuk testing UI
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Fungsi Pembantu untuk Status Stok
  const getStockStatus = (stok) => {
    if (stok === 0) return { label: 'Habis', class: 'bg-red-100 text-red-700' };
    if (stok < 10) return { label: 'Menipis', class: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Tersedia', class: 'bg-green-100 text-green-700' };
  };

  // Save Medicine (Create/Update)
  const handleSaveMedicine = async (formData) => {
    setLoading(true);
    try {
      const url = editingMedicine ? `${API_URL}/${editingMedicine.id_obat || editingMedicine.ID_OBAT}` : API_URL;
      const method = editingMedicine ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        if (data.warning) {
          setTimeout(() => showNotification(data.warning, 'warning'), 1500);
        }
        fetchMedicines();
        setIsModalOpen(false);
        setEditingMedicine(null);
      } else {
        showNotification(data.message || 'Operasi gagal', 'error');
      }
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update Stock Only
  const handleUpdateStock = async (id_obat, stok) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id_obat}/stok`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stok })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        if (data.warning) {
          setTimeout(() => showNotification(data.warning, 'warning'), 1500);
        }
        fetchMedicines();
        setIsStockModalOpen(false);
        setSelectedMedicine(null);
      } else {
        showNotification(data.message || 'Update stok gagal', 'error');
      }
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleStockEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsStockModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data obat ini?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        fetchMedicines();
      } else {
        showNotification(data.message || 'Hapus gagal', 'error');
      }
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(med =>
    (med.nama_obat || med.NAMA_OBAT || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (med.id_obat || med.ID_OBAT || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (med.jenis_obat || med.JENIS_OBAT || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (angka) => {
    return `Rp ${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
          <Pill className="w-8 h-8 text-blue-600" />
          <span>Data Obat - Sistem Manajemen Farmasi</span>
        </h3>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Trigger Aktif:</strong> Sistem akan otomatis memberi peringatan jika stok &lt; 10 unit dan menolak stok negatif.
          </p>
        </div>
        
        <div className="mt-6 mb-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow">
          <p><strong>Total Obat:</strong> {medicines.length} item</p>
          <p className="mt-1"><strong>Obat Menipis:</strong> {medicines.filter(m => {
            const stok = m.stok ?? m.STOK ?? 0;
            return stok < 10 && stok > 0;
          }).length} item</p>
          <p className="mt-1 text-red-600"><strong>Obat Habis:</strong> {medicines.filter(m => {
            const stok = m.stok ?? m.STOK ?? 0;
            return stok === 0;
          }).length} item</p>
        </div>

        {/* Header Tools */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Cari obat (Nama, ID, Jenis)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
          </div>
          <button
            onClick={() => { setEditingMedicine(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center space-x-2 transition shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tambah Obat</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4">ID Obat</th>
                    <th className="px-6 py-4">Nama Obat</th>
                    <th className="px-6 py-4">Jenis</th>
                    <th className="px-6 py-4">Dosis</th>
                    <th className="px-6 py-4">Harga</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMedicines.map((med) => {
                    // Support both lowercase and UPPERCASE field names from Oracle
                    const medicine = {
                      id_obat: med.id_obat || med.ID_OBAT,
                      nama_obat: med.nama_obat || med.NAMA_OBAT,
                      jenis_obat: med.jenis_obat || med.JENIS_OBAT,
                      dosis: med.dosis || med.DOSIS,
                      harga: med.harga || med.HARGA,
                      stok: med.stok ?? med.STOK ?? 0
                    };
                    
                    const status = getStockStatus(medicine.stok);
                    return (
                      <tr key={medicine.id_obat} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono text-sm">{medicine.id_obat}</td>
                        <td className="px-6 py-4 font-medium">{medicine.nama_obat}</td>
                        <td className="px-6 py-4">{medicine.jenis_obat}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{medicine.dosis}</td>
                        <td className="px-6 py-4">{formatRupiah(medicine.harga)}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleStockEdit(medicine)}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            {medicine.stok} unit
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${status.class} px-3 py-1 rounded-full text-xs font-semibold`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => handleEdit(medicine)} 
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                              title="Edit Obat"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStockEdit(medicine)} 
                              className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition"
                              title="Update Stok"
                            >
                              <Package className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(medicine.id_obat)} 
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                              title="Hapus Obat"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMedicines.length === 0 && (
                    <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            Data obat tidak ditemukan.
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Footer */}
        {/* <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow">
          <p><strong>Total Obat:</strong> {medicines.length} item</p>
          <p className="mt-1"><strong>Obat Menipis:</strong> {medicines.filter(m => {
            const stok = m.stok ?? m.STOK ?? 0;
            return stok < 10 && stok > 0;
          }).length} item</p>
          <p className="mt-1 text-red-600"><strong>Obat Habis:</strong> {medicines.filter(m => {
            const stok = m.stok ?? m.STOK ?? 0;
            return stok === 0;
          }).length} item</p>
        </div> */}
      </div>

      {/* Modals */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMedicine(null); }}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
      />

      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => { setIsStockModalOpen(false); setSelectedMedicine(null); }}
        medicine={selectedMedicine}
        onUpdate={handleUpdateStock}
      />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </main>
  );
};

export default MedicinePage;