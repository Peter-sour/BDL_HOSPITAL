// src/components/PasienTable.jsx
import React, { useState, useEffect } from 'react';
// Tambahkan RefreshCw
import { Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'; 
import PatientModal from '../components/PatientModal'; // Perbaiki path jika perlu, saya asumsikan './PatientModal' jika berada di folder components yang sama.

const API_BASE_URL = 'http://localhost:5000/api/pasien';

const PasienTable = () => {
    const [pasienData, setPasienData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [apiError, setApiError] = useState(null);
    
    // --- STATE BARU UNTUK REFRESH INSTAN ---
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    
    // --- LOGIKA UTAMA ---

    // Fungsi Pemicu Refresh Instan
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Dipanggil setelah operasi CRUD
    const refetchPasienData = () => {
        handleRefresh(); // Panggil pemicu refresh instan
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPatient(null);
        setApiError(null);
    };

    const handleAddPasien = () => {
        setCurrentPatient(null);
        setApiError(null); 
        setIsModalOpen(true);
    };
    
    const handleEditPasien = async (pasien) => {
        setApiError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/${pasien.idPasien}`);
            if (!response.ok) throw new Error('Gagal memuat detail pasien.');
            const detailData = await response.json();

            const formattedDate = detailData.tanggalLahir ? new Date(detailData.tanggalLahir).toISOString().split('T')[0] : '2000-01-01';

            setCurrentPatient({
                idPasien: detailData.idPasien,
                nama: detailData.nama,
                tanggalLahir: formattedDate, 
                alamat: detailData.alamat,
            });
            setIsModalOpen(true);

        } catch (err) {
            console.error("Error fetching detail for edit:", err);
            alert("Gagal memuat data detail pasien.");
        }
    };
    
    const handleSavePasien = async (formData) => {
        // --- PERBAIKAN DI SINI ---
        // Penentuan isEdit harus berdasarkan apakah MODAL DIBUKA UNTUK EDIT (currentPatient ada ID)
        // BUKAN berdasarkan apakah user mengisi ID di form.
        const isEdit = !!currentPatient?.idPasien; 
        
        const url = isEdit 
            ? `${API_BASE_URL}/${currentPatient.idPasien}` // Jika Edit, gunakan ID dari currentPatient
            : `${API_BASE_URL}`; // Jika Tambah, gunakan URL POST biasa
        const method = isEdit ? 'PUT' : 'POST';

        setApiError(null); 

        const apiData = {
            idPasien: formData.idPasien,
            nama: formData.nama,
            tanggalLahir: formData.tanggalLahir, 
            alamat: formData.alamat
        };
        
        if (isEdit) {
            // Hapus idPasien dari body ketika PUT/Update
            delete apiData.idPasien;
            // Untuk PUT, kita kirim ID Pasien melalui URL (req.params)
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                const errorMessage = errorData.error || errorData.message || `Gagal menyimpan data (${response.status})`;
                
                // Cek error UNIQUE CONSTRAINT Oracle (hanya terjadi saat POST)
                if (!isEdit && errorMessage.includes('ORA-00001')) {
                    setApiError(`ID Pasien "${formData.idPasien}" sudah ada di database. Harap gunakan ID lain.`);
                    return;
                }
                
                throw new Error(errorMessage);
            }

            alert(`Data Pasien ${formData.nama} berhasil di${isEdit ? 'update' : 'simpan'}!`);
            handleCloseModal();
            refetchPasienData();
            
        } catch (error) {
            console.error("API Save Error:", error);
            setApiError(error.message);
        }
    };

    const handleDeletePasien = async (idPasien, namaPasien) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus data pasien "${namaPasien}" (${idPasien})?`)) {
            return;
        }

        try {
            const url = `${API_BASE_URL}/${idPasien}`; 
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || `Gagal menghapus data (${response.status})`);
            }

            alert(`Data Pasien ${namaPasien} berhasil dihapus!`);
            refetchPasienData();

        } catch (error) {
            console.error("API Delete Error:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // --- LOGIKA FETCHING & PENCARIAN (DEBOUNCE) ---

    // [DEBOUNCE]
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => { clearTimeout(handler); };
    }, [searchTerm]);

    // [FETCHING]
    useEffect(() => {
        const fetchPasien = async () => {
            setLoading(true);
            setError(null);
            const apiUrl = debouncedSearchTerm 
                ? `${API_BASE_URL}?search=${debouncedSearchTerm}`
                : API_BASE_URL;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Gagal memuat data pasien dari server.');
                const data = await response.json();
                setPasienData(data);
            } catch (err) {
                console.error("Error fetching pasien data:", err);
                setError('Gagal memuat data. Server Back-End mungkin mati atau URL salah.');
            } finally {
                setLoading(false);
            }
        };
        // PENTING: Tambahkan refreshTrigger ke dependency array
        fetchPasien(); 
    }, [debouncedSearchTerm, refreshTrigger]); 

    // --- LOGIKA RENDER ---

    const getStatusStyle = (status) => {
        if (status === 'Rawat Inap') return 'bg-yellow-100 text-yellow-800';
        if (status === 'Rawat Jalan') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    if (loading && pasienData.length === 0) return <div className="p-6 text-center text-gray-500">Memuat data pasien...</div>;
    if (error) return <div className="p-6 text-center text-red-500 font-bold">{error}</div>;

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-700">Data Pasien</h3>
                
                {/* TOMBOL AKSI */}
                <div className="flex space-x-3">
                    {/* TOMBOL REFRESH BARU */}
                    <button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 disabled:bg-gray-300 transition duration-150">
                        <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                    
                    {/* TOMBOL TAMBAH PASIEN */}
                    <button onClick={handleAddPasien} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <Plus className="w-5 h-5 mr-2" /> Tambah Pasien
                    </button>
                </div>
            </div>

            {/* Area Pencarian */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Cari pasien (Nama, ID)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Tabel Data Pasien */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Pasien</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Pasien</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Usia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pasienData.map((pasien, index) => (
                            <tr key={pasien.idPasien} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-700">{pasien.idPasien}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pasien.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{pasien.usia}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(pasien.status)}`}>
                                        {pasien.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button onClick={() => handleEditPasien(pasien)} className="text-blue-600 hover:text-blue-900 mx-1 p-1">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeletePasien(pasien.idPasien, pasien.nama)} className="text-red-600 hover:text-red-900 mx-1 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* INTEGRASI MODAL */}
            <PatientModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePasien}
                initialData={currentPatient} 
                apiError={apiError}
            />
        </main>
    );
};

export default PasienTable;