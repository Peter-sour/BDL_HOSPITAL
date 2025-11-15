// src/components/PasienTable.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const API_URL_PASIEN = 'http://localhost:5000/api/pasien';

const PasienTable = () => {
    const [pasienData, setPasienData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fungsi untuk menentukan styling status
    const getStatusStyle = (status) => {
        if (status === 'Rawat Inap') return 'bg-yellow-100 text-yellow-800'; // Sesuai output FN_STATUS_PASIEN
        if (status === 'Rawat Jalan') return 'bg-green-100 text-green-800'; // Sesuai output FN_STATUS_PASIEN
        return 'bg-gray-100 text-gray-800';
    };

    useEffect(() => {
        const fetchPasien = async () => {
            try {
                const response = await fetch(API_URL_PASIEN);
                
                if (!response.ok) {
                    throw new Error('Gagal memuat data pasien dari server.');
                }
                
                const data = await response.json();
                setPasienData(data);
                
            } catch (err) {
                console.error("Error fetching pasien data:", err);
                setError('Gagal memuat data. Server Back-End mungkin mati atau URL salah.');
            } finally {
                setLoading(false);
            }
        };

        fetchPasien();
    }, []);

    if (loading) return <div className="p-6 text-center text-gray-500">Memuat data pasien...</div>;
    if (error) return <div className="p-6 text-center text-red-500 font-bold">{error}</div>;

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-700 flex items-center">
                    Data Pasien
                </h3>
                <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Pasien
                </button>
            </div>

            {/* Area Pencarian */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari pasien (Nama, Status)" 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Tabel Data Pasien */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
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
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pasien.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{pasien.usia}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(pasien.status)}`}>
                                        {pasien.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button 
                                        onClick={() => console.log('Edit Pasien:', pasien.idPasien)}
                                        className="text-blue-600 hover:text-blue-900 mx-1 p-1">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => console.log('Hapus Pasien:', pasien.idPasien)}
                                        className="text-red-600 hover:text-red-900 mx-1 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pesan jika tidak ada data */}
            {pasienData.length === 0 && !loading && (
                <div className="p-6 text-center text-gray-500 border border-dashed rounded-lg">Tidak ada data pasien ditemukan. Coba tambahkan data di database Anda.</div>
            )}
        </main>
    );
};

export default PasienTable;