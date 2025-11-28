import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // PENTING: Untuk Portal Modal agar di atas Sidebar
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../services/api';
// Import Ikon Lucide
import { Plus, Edit3, Trash2, Search, X, Package, Tag, Activity, FlaskConical } from 'lucide-react';

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ 
    id_obat: '', 
    nama_obat: '', 
    jenis_obat: 'Tablet', 
    dosis: '', 
    stok: 0, 
    harga: 0 
  });

  // Load Data Awal
  useEffect(() => { 
    fetchMedicines(); 
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getMedicines();
      setMedicines(res.data.data || []);
    } catch(e) { 
      console.error("Gagal load obat:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- HANDLERS ---
  
  const handleOpenAdd = () => {
    setFormData({ id_obat: '', nama_obat: '', jenis_obat: 'Tablet', dosis: '', stok: 0, harga: 0 });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Yakin ingin menghapus data obat ini? Obat yang sudah ada riwayat transaksi tidak bisa dihapus.')) return;
    
    try {
        await adminAPI.deleteMedicine(id);
        alert('Obat berhasil dihapus.');
        fetchMedicines();
    } catch(err) { 
        alert(err.response?.data?.message || 'Gagal menghapus obat.'); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if(isEditMode) {
            await adminAPI.updateMedicine(formData.id_obat, formData);
            alert('Data obat berhasil diperbarui!');
        } else {
            await adminAPI.addMedicine(formData);
            alert('Obat baru berhasil ditambahkan!');
        }
        setIsModalOpen(false);
        fetchMedicines();
    } catch(err) { 
        // Pesan error dari backend (misal: stok minus kena trigger oracle) akan muncul disini
        alert(err.response?.data?.message || 'Gagal menyimpan data.'); 
    }
  };

  // Filter Pencarian
  const filteredList = medicines.filter(m => 
    m.nama_obat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmt = (n) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);

  return (
    <AdminLayout title="Manajemen Obat" subtitle="Kelola stok, harga, dan daftar obat rumah sakit">
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Toolbar (Search & Add Button) */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-white">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Cari nama obat..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    value={searchTerm}
                    onChange={e=>setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={handleOpenAdd} 
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm"
            >
                <Plus size={18} /> Tambah Obat Baru
            </button>
        </div>
        
        {/* Table Data */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                        <th className="p-4 pl-6">Nama Obat</th>
                        <th className="p-4">Jenis</th>
                        <th className="p-4">Dosis</th>
                        <th className="p-4 text-right">Harga Satuan</th>
                        <th className="p-4 text-center">Stok Gudang</th>
                        <th className="p-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-400">Sedang memuat data...</td></tr>
                    ) : filteredList.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-400">Tidak ada data obat ditemukan.</td></tr>
                    ) : (
                        filteredList.map(m => (
                            <tr key={m.id_obat} className="hover:bg-slate-50 transition group">
                                <td className="p-4 pl-6 font-bold text-slate-700 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Package size={16}/>
                                    </div>
                                    {m.nama_obat}
                                </td>
                                <td className="p-4 text-slate-500">{m.jenis_obat}</td>
                                <td className="p-4 text-slate-500">{m.dosis}</td>
                                <td className="p-4 text-right font-mono font-medium text-slate-600">{fmt(m.harga)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        m.stok < 10 
                                        ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' // Stok Tipis Merah
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100' // Stok Aman Hijau
                                    }`}>
                                        {m.stok} Unit
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={()=>handleOpenEdit(m)} className="p-2 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition" title="Edit / Restock">
                                        <Edit3 size={16}/>
                                    </button>
                                    <button onClick={()=>handleDelete(m.id_obat)} className="p-2 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition" title="Hapus">
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL FORM (MENGGUNAKAN PORTAL) --- */}
      {isModalOpen && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in-up">
                  
                  {/* Header Modal */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FlaskConical size={20} /></div>
                          <h3 className="font-bold text-lg text-slate-800">{isEditMode ? 'Edit / Restock Obat' : 'Tambah Obat Baru'}</h3>
                      </div>
                      <button onClick={()=>setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={24}/></button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                      
                      {/* Nama Obat */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Obat</label>
                          <input 
                            required 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            placeholder="Contoh: Paracetamol"
                            value={formData.nama_obat} 
                            onChange={e=>setFormData({...formData, nama_obat:e.target.value})} 
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis</label>
                              <select 
                                className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={formData.jenis_obat} 
                                onChange={e=>setFormData({...formData, jenis_obat:e.target.value})}
                              >
                                  <option>Tablet</option><option>Kapsul</option><option>Sirup</option><option>Salep</option><option>Injeksi</option><option>Botol</option><option>Puyer</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosis</label>
                              <input 
                                required 
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="500mg / 5ml" 
                                value={formData.dosis} 
                                onChange={e=>setFormData({...formData, dosis:e.target.value})} 
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                  <Activity size={14} /> Stok Gudang
                              </label>
                              <input 
                                required type="number" 
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" 
                                value={formData.stok} 
                                onChange={e=>setFormData({...formData, stok:e.target.value})} 
                              />
                              <p className="text-[10px] text-slate-400 mt-1">Stok tidak boleh minus.</p>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                  <Tag size={14} /> Harga Satuan (Rp)
                              </label>
                              <input 
                                required type="number" min="0" 
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" 
                                value={formData.harga} 
                                onChange={e=>setFormData({...formData, harga:e.target.value})} 
                              />
                          </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Batal</button>
                          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Simpan Data</button>
                      </div>
                  </form>
              </div>
          </div>,
          document.body // <-- RENDER DI LUAR (Z-INDEX AMAN)
      )}
    </AdminLayout>
  );
};

export default AdminMedicines;