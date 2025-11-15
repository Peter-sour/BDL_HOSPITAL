// src/pages/BillingPage.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle, User, CreditCard, ClipboardList, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [billResult, setBillResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailTagihan, setDetailTagihan] = useState(null);

  // Fetch semua pasien saat component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_URL}/billing/pasien`);
      setAllPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Gagal memuat data pasien');
    }
  };

  // Filter pasien berdasarkan input nama
  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = allPatients.filter(p =>
        p.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(results);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, allPatients]);

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.nama);
    setFilteredPatients([]);
    setShowBill(false);
    setBillResult(null);
    setError('');
    
    // Fetch detail tagihan untuk preview
    try {
      const response = await axios.get(`${API_URL}/billing/detail/${patient.idPasien}`);
      setDetailTagihan(response.data);
    } catch (err) {
      console.error('Error fetching detail:', err);
    }
  };

  const handleCalculateBill = async () => {
    if (!selectedPatient) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/billing/hitung`, {
        idPasien: selectedPatient.idPasien,
        idRawat: selectedPatient.idRawat,
        idResep: selectedPatient.idResep
      });

      setBillResult(response.data);
      setShowBill(true);
    } catch (err) {
      console.error('Error calculating bill:', err);
      setError(err.response?.data?.message || 'Gagal menghitung tagihan');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return 'Rp0';
    return `Rp${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
        <DollarSign className="w-6 h-6 text-blue-800" />
        <span>Hitung Tagihan Pasien</span>
      </h3>
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Card Input Pasien */}
      <div className="bg-white rounded-2xl shadow p-6 max-w-lg mx-auto">
        <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center space-x-2">
          <User className="w-5 h-5"/>
          <span>Pilih Pasien</span>
        </h4>
        
        {/* Input Pencarian dengan Dropdown */}
        <div className="relative mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama Pasien</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { 
                setSearchTerm(e.target.value); 
                setSelectedPatient(null); 
                setShowBill(false);
                setDetailTagihan(null);
              }}
              placeholder="Ketik nama pasien..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Dropdown Hasil Pencarian */}
          {filteredPatients.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredPatients.map(patient => (
                <div
                  key={patient.idPasien}
                  onClick={() => handlePatientSelect(patient)}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
                >
                  {patient.nama} ({patient.status}) - {patient.usia} tahun
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Pasien Terpilih */}
        {selectedPatient && (
          <div className="flex items-center space-x-2 p-3 bg-green-100 border border-green-300 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Pasien <strong>{selectedPatient.nama}</strong> telah dipilih.
            </span>
          </div>
        )}
        
        {/* Tombol Hitung Tagihan */}
        <button
          onClick={handleCalculateBill}
          disabled={!selectedPatient || loading}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
            selectedPatient && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Menghitung...' : 'Hitung Estimasi Tagihan'}
        </button>
      </div>

      {/* Card Hasil Tagihan */}
      {showBill && billResult && (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg mx-auto border-t-4 border-blue-600">
          <h4 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
            <CreditCard className="w-6 h-6"/>
            <span>Estimasi Tagihan</span>
          </h4>
          
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Breakdown Biaya */}
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-700">Rincian Biaya:</p>
              
              {/* Biaya Kamar */}
              {billResult.biayaKamar > 0 && (
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between">
                    <span>• Biaya Kamar {detailTagihan?.rawatInap ? `(${detailTagihan.rawatInap.kelasKamar})` : ''}:</span>
                    <span>{formatRupiah(billResult.biayaKamar)}</span>
                  </div>
                  {detailTagihan?.rawatInap && (
                    <div className="text-xs text-gray-500 pl-2">
                      {formatRupiah(detailTagihan.rawatInap.tarifPerHari)} × {detailTagihan.rawatInap.lamaRawat} hari
                    </div>
                  )}
                </div>
              )}
              
              {/* Biaya Obat */}
              {billResult.biayaObat > 0 && (
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between">
                    <span>• Biaya Obat & Resep:</span>
                    <span>{formatRupiah(billResult.biayaObat)}</span>
                  </div>
                  {detailTagihan?.obat && detailTagihan.obat.length > 0 && (
                    <div className="text-xs text-gray-500 pl-2 space-y-1">
                      {detailTagihan.obat.map((obat, idx) => (
                        <div key={idx}>
                          - {obat.namaObat} ({obat.jumlah}x) = {formatRupiah(obat.subtotal)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Jika tidak ada biaya */}
              {billResult.biayaKamar === 0 && billResult.biayaObat === 0 && (
                <div className="text-gray-500 text-sm pl-4">
                  Tidak ada data rawat inap atau resep obat untuk pasien ini.
                </div>
              )}
            </div>

            <hr className="my-3" />

            {/* Total */}
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
              <span className="font-bold text-lg text-gray-800">Total Estimasi:</span>
              <span className="font-bold text-2xl text-blue-600">
                {formatRupiah(billResult.totalTagihan)}
              </span>
            </div>

            {/* Info Status */}
            <div className="pt-2 space-y-1 text-sm text-gray-600">
              <p className="font-semibold flex items-center space-x-1">
                <ClipboardList className="w-4 h-4"/>
                <span>Informasi:</span>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Jenis Perawatan: <span className="font-medium text-blue-600">{billResult.detail?.jenisPerawatan}</span></li>
                <li>Pasien: <span className="font-medium">{billResult.detail?.namaPasien}</span></li>
                <li>Tanggal Hitung: <span className="font-medium">{new Date(billResult.detail?.tanggalHitung).toLocaleDateString('id-ID')}</span></li>
              </ul>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Catatan:</strong> Ini adalah estimasi tagihan. Untuk pembayaran resmi, silakan hubungi bagian kasir.
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BillingPage;