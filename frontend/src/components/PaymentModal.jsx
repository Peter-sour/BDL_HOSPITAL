// src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, User, FileText, Bed } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/payments';

const PaymentModal = ({ isOpen, onClose, onSave, initialData }) => {
    // --- State Form ---
    const [formData, setFormData] = useState({
        id_pasien: '',
        id_resep: '',
        id_rawat: '', // Opsional
        metode_bayar: 'Tunai',
    });
    
    // --- State Data Dropdown ---
    const [pasienList, setPasienList] = useState([]);
    const [resepList, setResepList] = useState([]);
    const [rawatInapList, setRawatInapList] = useState([]);

    const isEditMode = !!initialData;

    // 1. Fetch Daftar Pasien
    useEffect(() => {
        if (!isOpen) return;

        const fetchPasien = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/data/pasien`);
                const data = await response.json();
                if (data.success) {
                    // Oracle DB mengembalikan key dalam huruf kapital (ID_PASIEN, NAMA)
                    setPasienList(data.data); 
                }
            } catch (error) {
                console.error("Gagal fetch Pasien:", error);
            }
        };
        fetchPasien();
    }, [isOpen]);

    // 2. Fetch Resep dan Rawat Inap saat ID Pasien berubah
    useEffect(() => {
        if (!formData.id_pasien) {
            setResepList([]);
            setRawatInapList([]);
            setFormData(prev => ({ ...prev, id_resep: '', id_rawat: '' }));
            return;
        }

        // Fetch Resep
        const fetchResep = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/data/resep/${formData.id_pasien}`);
                const data = await response.json();
                if (data.success) {
                    setResepList(data.data);
                }
            } catch (error) {
                console.error("Gagal fetch Resep:", error);
            }
        };

        // Fetch Rawat Inap
        const fetchRawatInap = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/data/rawatinap/${formData.id_pasien}`);
                const data = await response.json();
                if (data.success) {
                    setRawatInapList(data.data);
                }
            } catch (error) {
                console.error("Gagal fetch Rawat Inap:", error);
            }
        };

        fetchResep();
        fetchRawatInap();

    }, [formData.id_pasien]);


    // 3. Isi form saat mode Edit
    useEffect(() => {
        if (isEditMode && isOpen) {
            // Karena kita hanya bisa UPDATE metode_bayar di controller, kita hanya isi itu
            setFormData({
                id_pasien: initialData.ID_PASIEN || '',
                id_resep: initialData.ID_RESEP || '',
                id_rawat: initialData.ID_RAWAT || '',
                metode_bayar: initialData.METODE_BAYAR || 'Tunai',
            });
            // Di mode Edit, Pasien dan Resep tidak boleh diubah
        } else if (isOpen) {
            // Reset form saat mode Tambah
            setFormData({
                id_pasien: '',
                id_resep: '',
                id_rawat: '',
                metode_bayar: 'Tunai',
            });
        }
    }, [initialData, isOpen, isEditMode]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.id_pasien || !formData.id_resep || !formData.metode_bayar) {
            alert("Harap lengkapi Pasien, Resep, dan Metode Bayar.");
            return;
        }

        // Kirim data ke parent (PaymentPage)
        onSave({ 
            ...formData, 
            // Ubah ID_RAWAT string kosong menjadi null untuk Oracle
            id_rawat: formData.id_rawat || null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <DollarSign className='w-5 h-5 mr-2 text-blue-600'/> 
                    {isEditMode ? 'Ubah Metode Bayar' : 'Tambah Transaksi Baru'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* ID Pasien */}
                    <div>
                        <label htmlFor="id_pasien" className="block text-sm font-medium text-gray-700 flex items-center"><User className='w-4 h-4 mr-1 text-red-500'/> Pasien *</label>
                        <select
                            name="id_pasien"
                            id="id_pasien"
                            value={formData.id_pasien}
                            onChange={handleChange}
                            disabled={isEditMode} // Tidak boleh diubah saat edit
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white ${isEditMode ? 'bg-gray-100 text-gray-500' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                            required
                        >
                            <option value="">-- Pilih Pasien --</option>
                            {pasienList.map(p => (
                                <option key={p.ID_PASIEN} value={p.ID_PASIEN}>
                                    {p.NAMA} ({p.ID_PASIEN})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ID Resep (Wajib) */}
                    <div>
                        <label htmlFor="id_resep" className="block text-sm font-medium text-gray-700 flex items-center"><FileText className='w-4 h-4 mr-1 text-green-500'/> Resep *</label>
                        <select
                            name="id_resep"
                            id="id_resep"
                            value={formData.id_resep}
                            onChange={handleChange}
                            disabled={!formData.id_pasien || isEditMode} // Tergantung Pasien & tidak boleh diubah saat edit
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white ${(!formData.id_pasien || isEditMode) ? 'bg-gray-100 text-gray-500' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                            required
                        >
                            <option value="">-- Pilih Resep ({resepList.length}) --</option>
                            {resepList.map(r => (
                                <option key={r.ID_RESEP} value={r.ID_RESEP}>
                                    {r.ID_RESEP} | Dr. {r.NAMA_DOKTER} | Tgl: {new Date(r.TANGGAL_RESEP).toLocaleDateString('id-ID')}
                                </option>
                            ))}
                            {resepList.length === 0 && formData.id_pasien && <option disabled>Tidak ada Resep untuk Pasien ini.</option>}
                        </select>
                        <p className='text-xs text-gray-500 mt-1'>Total biaya obat akan dihitung otomatis dari Resep yang dipilih.</p>
                    </div>

                    {/* ID Rawat Inap (Opsional) */}
                    <div>
                        <label htmlFor="id_rawat" className="block text-sm font-medium text-gray-700 flex items-center"><Bed className='w-4 h-4 mr-1 text-orange-500'/> Rawat Inap (Opsional)</label>
                        <select
                            name="id_rawat"
                            id="id_rawat"
                            value={formData.id_rawat}
                            onChange={handleChange}
                            disabled={!formData.id_pasien || isEditMode} // Tergantung Pasien & tidak boleh diubah saat edit
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white ${(!formData.id_pasien || isEditMode) ? 'bg-gray-100 text-gray-500' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                        >
                            <option value="">-- Tidak Ada Rawat Inap --</option>
                            {rawatInapList.map(ri => (
                                <option key={ri.ID_RAWAT} value={ri.ID_RAWAT}>
                                    {ri.NAMA_KAMAR} ({ri.KELAS_KAMAR}) | Masuk: {new Date(ri.TANGGAL_MASUK).toLocaleDateString('id-ID')}
                                </option>
                            ))}
                            {rawatInapList.length === 0 && formData.id_pasien && <option disabled>Tidak ada Rawat Inap yang aktif/terdaftar.</option>}
                        </select>
                    </div>
                    
                    {/* Metode Bayar */}
                    <div>
                        <label htmlFor="metode_bayar" className="block text-sm font-medium text-gray-700">Metode Bayar *</label>
                        <select
                            name="metode_bayar"
                            id="metode_bayar"
                            value={formData.metode_bayar}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            required
                        >
                            {/* Opsi harus sesuai dengan CHECK constraint di DB */}
                            {['Tunai', 'Transfer', 'Kartu Kredit', 'Kartu Debit', 'BPJS'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                        >
                            {isEditMode ? 'Simpan Perubahan' : 'Buat Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;