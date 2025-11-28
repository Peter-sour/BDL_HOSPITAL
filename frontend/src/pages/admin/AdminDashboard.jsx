import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../services/api';
import { Users, Stethoscope, Pill, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    counts: { total_pasien: 0, total_dokter: 0, total_obat: 0, total_transaksi: 0 },
    lowStock: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getStats();
        if(res.data.success) {
            setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: 'Total Pasien', val: stats.counts.total_pasien, icon: <Users size={24} />, color: 'bg-blue-500' },
    { label: 'Total Dokter', val: stats.counts.total_dokter, icon: <Stethoscope size={24} />, color: 'bg-emerald-500' },
    { label: 'Item Obat', val: stats.counts.total_obat, icon: <Pill size={24} />, color: 'bg-purple-500' },
    { label: 'Transaksi', val: stats.counts.total_transaksi, icon: <CreditCard size={24} />, color: 'bg-orange-500' },
  ];

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading Dashboard...</div>;

  return (
    <AdminLayout title="Dashboard Overview" subtitle="Monitoring data rumah sakit secara real-time">
      
      {/* 1. KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
                <div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{c.label}</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{c.val}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${c.color}`}>
                    {c.icon}
                </div>
            </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. TABEL PERINGATAN STOK (BAGIAN UTAMA UPDATE) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="text-red-500" size={20} />
                      Peringatan Stok Menipis
                  </h3>
                  <Link to="/admin/medicines" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      Kelola Obat <ArrowRight size={16} />
                  </Link>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                  {stats.lowStock.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                              <Pill size={24} />
                          </div>
                          <p className="text-slate-500 font-medium">Aman! Tidak ada stok obat yang menipis.</p>
                      </div>
                  ) : (
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                              <tr>
                                  <th className="p-4 pl-6">Nama Obat</th>
                                  <th className="p-4">Jenis</th>
                                  <th className="p-4 text-center">Sisa Stok</th>
                                  <th className="p-4 text-center">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {stats.lowStock.map((m) => (
                                  <tr key={m.id_obat} className="hover:bg-red-50/30 transition">
                                      <td className="p-4 pl-6 font-bold text-slate-700">{m.nama_obat}</td>
                                      <td className="p-4 text-sm text-slate-500">{m.jenis_obat}</td>
                                      <td className="p-4 text-center">
                                          <span className="text-red-600 font-bold text-lg">{m.stok}</span>
                                      </td>
                                      <td className="p-4 text-center">
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                              m.stok === 0 
                                              ? 'bg-red-600 text-white' 
                                              : 'bg-red-100 text-red-700'
                                          }`}>
                                              {m.stok === 0 ? 'HABIS' : 'CRITICAL'}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>

          {/* 3. QUICK INFO / PANDUAN (Kanan) */}
          <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-30"></div>
                  
                  <h3 className="font-bold text-lg mb-2 relative z-10">Status Sistem</h3>
                  <p className="text-slate-300 text-sm mb-6 relative z-10">
                      Sistem berjalan normal. Pastikan selalu memantau stok obat agar pelayanan dokter tidak terganggu.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-green-400 bg-slate-800/50 p-2 rounded-lg border border-slate-700 w-fit">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Database Connected
                  </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Aksi Cepat</h4>
                  <div className="space-y-3">
                      <Link to="/admin/medicines" className="flex items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-sm font-medium text-slate-700">
                          <Pill size={18} className="mr-3 text-purple-500" /> Tambah Obat Baru
                      </Link>
                      {/* Tombol dummy untuk masa depan */}
                      <button className="w-full flex items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-sm font-medium text-slate-700 text-left">
                          <Users size={18} className="mr-3 text-blue-500" /> Kelola Akun Dokter
                      </button>
                  </div>
              </div>
          </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;