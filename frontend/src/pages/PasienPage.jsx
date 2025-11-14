// src/pages/PasienPage.jsx
import React from 'react';
import { Plus, User, FileEdit, Trash2 } from 'lucide-react';

// Data Pasien Dummy
const dataPasien = [
  { id: 1, nama: 'Budi Santoso', tglLahir: '1985-04-12', jk: 'Laki-laki', alamat: 'Jl. Merdeka No. 1' },
  { id: 2, nama: 'Siti Aisyah', tglLahir: '1998-11-20', jk: 'Perempuan', alamat: 'Jl. Sudirman Kav. 5' },
  { id: 3, nama: 'Agus Salim', tglLahir: '2005-01-01', jk: 'Laki-laki', alamat: 'Perumahan Indah Blok C' },
];

const PasienPage = () => {
  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-700 flex items-center space-x-2">
          <User className="w-6 h-6 text-blue-800" />
          <span>Data Pasien</span>
        </h3>
        <button className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150">
          <Plus className="w-5 h-5" />
          <span>Tambah Data</span>
        </button>
      </div>

      {/* Kontainer Tabel */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Lahir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataPasien.map((pasien) => (
                <tr key={pasien.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pasien.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pasien.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pasien.tglLahir}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pasien.jk}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pasien.alamat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mx-1 p-1 rounded hover:bg-indigo-100">
                      <FileEdit className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 mx-1 p-1 rounded hover:bg-red-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default PasienPage;