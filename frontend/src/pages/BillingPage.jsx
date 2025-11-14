// src/pages/BillingPage.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle, User, CreditCard, ClipboardList } from 'lucide-react';

// Data Pasien Dummy (Sesuaikan dengan data yang Anda gunakan di PatientPage.jsx)
const DUMMY_PATIENTS = [
  { id: 1, nama: 'Ani Lestari', usia: 29, status: 'Rawat Jalan', tagihan: 750000 },
  { id: 2, nama: 'Rian Pratama', usia: 35, status: 'Rawat Inap', tagihan: 5200000 },
  { id: 3, nama: 'Budi Santoso', usia: 50, status: 'Rawat Jalan', tagihan: 150000 },
];

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showBill, setShowBill] = useState(false);

  // Filter pasien berdasarkan input nama
  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = DUMMY_PATIENTS.filter(p =>
        p.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(results);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.nama); // Isi input dengan nama pasien yang dipilih
    setFilteredPatients([]); // Sembunyikan dropdown
    setShowBill(false); // Reset tampilan tagihan
  };

  const handleCalculateBill = () => {
    if (selectedPatient) {
      setShowBill(true);
    }
  };

  const formatRupiah = (angka) => {
    return `Rp${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
        <DollarSign className="w-6 h-6 text-blue-800" />
        <span>Hitung Tagihan Pasien</span>
      </h3>
      
      {/* 1. Card Input Pasien */}
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
              onChange={(e) => { setSearchTerm(e.target.value); setSelectedPatient(null); setShowBill(false); }}
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
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
                >
                  {patient.nama} ({patient.status})
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
              Pasien **{selectedPatient.nama}** telah dipilih. Siap hitung tagihan.
            </span>
          </div>
        )}
        
        {/* Tombol Hitung Tagihan */}
        <button
          onClick={handleCalculateBill}
          disabled={!selectedPatient}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
            selectedPatient
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Hitung Tagihan
        </button>
      </div>

      {/* 2. Card Hasil Tagihan (Muncul setelah tombol ditekan) */}
      {showBill && selectedPatient && (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg mx-auto border-t-4 border-blue-600 animate-fade-in-up">
          <h4 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
            <CreditCard className="w-6 h-6"/>
            <span>Detail Tagihan</span>
          </h4>
          
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Total Biaya Layanan:</span>
              <span className="font-bold text-lg text-red-600">{formatRupiah(selectedPatient.tagihan)}</span>
            </div>
            
            <hr />

            {/* Deskripsi Tagihan */}
            <div className="pt-2 space-y-1 text-sm text-gray-600">
                <p className="font-semibold flex items-center space-x-1">
                    <ClipboardList className="w-4 h-4"/>
                    <span>Deskripsi Ringkas:</span>
                </p>
                <ul className="list-disc list-inside ml-4">
                    <li>Biaya Rawat {selectedPatient.status === 'Rawat Inap' ? 'Inap' : 'Jalan'} selama 1 hari.</li>
                    <li>Termasuk biaya konsultasi dokter dan obat dasar.</li>
                    <li>ID Pasien: <span className="font-medium text-gray-800">P{String(selectedPatient.id).padStart(3, '0')}</span></li>
                    <li>Status Perawatan: <span className="font-medium text-blue-600">{selectedPatient.status}</span></li>
                </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BillingPage;