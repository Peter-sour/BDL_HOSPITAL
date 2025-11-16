// src/pages/DoctorPage.jsx
import React, { useState, useEffect } from 'react';
import { Stethoscope, UserPlus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import DoctorModal from '../components/DoctorModal';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/doctors'; // Sesuaikan dengan backend port Anda

const DoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data dokter dari API
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      console.log('API Response:', response.data); // Debug log
      if (response.data.success) {
        setDoctors(response.data.data);
        console.log('Doctors data:', response.data.data); // Debug log
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Gagal memuat data dokter. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Tambah atau Edit Dokter
  const handleSaveDoctor = async (doctorData) => {
    try {
      if (editingDoctor) {
        // UPDATE
        const response = await axios.put(`${API_URL}/${editingDoctor.ID_DOKTER}`, {
          nama: doctorData.nama,
          spesialis: doctorData.spesialis,
          departemen: doctorData.departemen
        });
        
        if (response.data.success) {
          alert(`✅ ${response.data.message}`);
          fetchDoctors();
        }
      } else {
        // CREATE
        const response = await axios.post(API_URL, {
          id_dokter: doctorData.id_dokter,
          nama: doctorData.nama,
          spesialis: doctorData.spesialis,
          departemen: doctorData.departemen
        });
        
        if (response.data.success) {
          alert(`✅ ${response.data.message}`);
          fetchDoctors();
        }
      }
      
      setIsModalOpen(false);
      setEditingDoctor(null);
    } catch (err) {
      console.error('Error saving doctor:', err);
      const errorMsg = err.response?.data?.message || 'Gagal menyimpan data dokter';
      alert(`❌ ${errorMsg}`);
    }
  };

  // Edit Dokter
  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  // Hapus Dokter
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data dokter ini?')) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`);
        
        if (response.data.success) {
          alert(`✅ ${response.data.message}`);
          fetchDoctors();
        }
      } catch (err) {
        console.error('Error deleting doctor:', err);
        const errorMsg = err.response?.data?.message || 'Gagal menghapus data dokter';
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  // Filter Dokter
  const filteredDoctors = doctors.filter(doc => {
    const idDokter = doc.ID_DOKTER || doc.id_dokter || doc[0] || '';
    const nama = doc.NAMA || doc.nama || doc[1] || '';
    const spesialis = doc.SPESIALIS || doc.spesialis || doc[2] || '';
    const departemen = doc.DEPARTEMEN || doc.departemen || doc[3] || '';
    
    return (
      idDokter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spesialis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departemen.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <main className="p-6">
      <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center space-x-2">
        <Stethoscope className="w-6 h-6 text-blue-800" />
        <span>Data Dokter</span>
      </h3>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDoctors} className="text-red-800 hover:text-red-900 font-semibold">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Header Tools: Search & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari dokter (ID, Nama, Spesialis, Departemen)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchDoctors}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => { setEditingDoctor(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <UserPlus className="w-5 h-5" />
            <span>Tambah Dokter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 w-16">No</th>
                <th className="px-6 py-3">ID Dokter</th>
                <th className="px-6 py-3">Nama Dokter</th>
                <th className="px-6 py-3">Spesialis</th>
                <th className="px-6 py-3">Departemen</th>
                <th className="px-6 py-3 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Data dokter tidak ditemukan.' : 'Belum ada data dokter.'}
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc, index) => {
                  // Flexible field mapping - handle both uppercase and any format
                  const idDokter = doc.ID_DOKTER || doc.id_dokter || doc[0] || '-';
                  const nama = doc.NAMA || doc.nama || doc[1] || '-';
                  const spesialis = doc.SPESIALIS || doc.spesialis || doc[2] || '-';
                  const departemen = doc.DEPARTEMEN || doc.departemen || doc[3] || '-';
                  
                  return (
                    <tr key={idDokter} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{index + 1}</td>
                      <td className="px-6 py-3 font-mono text-sm">{idDokter}</td>
                      <td className="px-6 py-3">{nama}</td>
                      <td className="px-6 py-3">{spesialis}</td>
                      <td className="px-6 py-3">{departemen}</td>
                      <td className="px-6 py-3 flex justify-center space-x-3">
                        <button 
                          onClick={() => handleEdit(doc)} 
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(idDokter)} 
                          className="text-red-600 hover:text-red-800 p-1 rounded transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Komponen */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDoctor(null); }}
        onSave={handleSaveDoctor}
        initialData={editingDoctor}
      />
    </main>
  );
};

export default DoctorPage;