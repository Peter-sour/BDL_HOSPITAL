import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../services/api';
import { BarChart3, Users } from 'lucide-react';

const AdminReports = () => {
  const [docReports, setDocReports] = useState([]);
  const [deptReports, setDeptReports] = useState([]);
  const [tab, setTab] = useState('dokter'); // 'dokter' or 'dept'

  useEffect(() => {
    adminAPI.getDoctorReports().then(res => setDocReports(res.data.data));
    adminAPI.getDeptReports().then(res => setDeptReports(res.data.data));
  }, []);

  return (
    <AdminLayout title="Laporan & Analitik" subtitle="Data kinerja dokter dan departemen (Real-time View)">
      
      <div className="flex gap-4 mb-6">
          <button onClick={()=>setTab('dokter')} className={`px-6 py-2 rounded-xl font-bold transition ${tab==='dokter' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Laporan Dokter</button>
          <button onClick={()=>setTab('dept')} className={`px-6 py-2 rounded-xl font-bold transition ${tab==='dept' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>Laporan Departemen</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b">
                {tab === 'dokter' ? (
                    <tr><th className="p-4">Nama Dokter</th><th className="p-4">Spesialis</th><th className="p-4 text-center">Jml Pasien</th><th className="p-4 text-center">Total Kunjungan</th><th className="p-4">Kunjungan Terakhir</th></tr>
                ) : (
                    <tr><th className="p-4">Departemen</th><th className="p-4 text-center">Jml Dokter</th><th className="p-4 text-center">Total Pasien</th><th className="p-4 text-center">Total Kunjungan</th><th className="p-4 text-center">Rata2/Dokter</th></tr>
                )}
            </thead>
            <tbody className="divide-y divide-slate-100">
                {tab === 'dokter' ? docReports.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-700">{d.NAMA_DOKTER}</td>
                        <td className="p-4 text-slate-500">{d.SPESIALIS}</td>
                        <td className="p-4 text-center font-bold text-blue-600">{d.JUMLAH_PASIEN_UNIK}</td>
                        <td className="p-4 text-center font-bold text-slate-700">{d.JUMLAH_KUNJUNGAN_RM}</td>
                        <td className="p-4 text-slate-500">{d.KUNJUNGAN_TERAKHIR || '-'}</td>
                    </tr>
                )) : deptReports.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-700">{d.DEPARTEMEN}</td>
                        <td className="p-4 text-center">{d.JUMLAH_DOKTER}</td>
                        <td className="p-4 text-center text-blue-600 font-bold">{d.JUMLAH_PASIEN}</td>
                        <td className="p-4 text-center font-bold">{d.TOTAL_KUNJUNGAN}</td>
                        <td className="p-4 text-center text-emerald-600 font-bold">{d.RATA_RATA_PER_DOKTER}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default AdminReports;