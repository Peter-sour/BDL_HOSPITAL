import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';
// 1. Import Ikon Lengkap
import { 
  Eye, EyeOff, User, Mail, Lock, Phone, 
  Calendar, MapPin, Briefcase, Clock, 
  ArrowLeft, Activity, Stethoscope 
} from 'lucide-react';

function RegisterPage() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    role: 'Pasien',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    nama: '',
    tanggal_lahir: '',
    alamat: '',
    no_telepon: '',
    jenis_kelamin: 'L',
    spesialis: '', 
    jadwal_praktik: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // State Toggle Password
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = formData;
      const response = await authAPI.register(payload);
      
      if (response.data.success) {
        setSuccess(`Registrasi ${formData.role} Berhasil! Mengalihkan...`);
        setTimeout(() => history.push('/login'), 2000);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      
      {/* --- KIRI: VISUAL --- */}
      <div className="hidden lg:flex lg:w-1/3 bg-emerald-600 relative flex-col justify-between p-12 text-white h-screen">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
           <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
           <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-white" />
           </div>
           <span className="text-2xl font-bold tracking-tight">RS MEDCARE</span>
        </div>

        <div className="relative z-10 mb-10">
           <h2 className="text-4xl font-bold mb-4 leading-tight">Bergabunglah <br/>Bersama Kami</h2>
           <p className="text-emerald-100 text-lg">Daftarkan diri Anda untuk mendapatkan layanan kesehatan terbaik dan terintegrasi.</p>
        </div>

        <div className="relative z-10 text-sm text-emerald-200">
           &copy; 2024 RS Medcare SIMRS.
        </div>
      </div>

      {/* --- KANAN: FORM REGISTER --- */}
      {/* Fix: Hapus justify-center, Tambah overflow-y-auto */}
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-50 overflow-y-auto h-screen">
        
        {/* Fix: Tambah my-auto agar center vertikal jika layar besar, tapi scrollable jika layar kecil */}
        <div className="mx-auto w-full max-w-2xl my-auto">
          
          <Link to="/" className="flex items-center text-slate-400 hover:text-emerald-600 transition mb-6 group w-fit">
             <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
             <span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Buat Akun Baru</h2>
            <p className="mt-2 text-sm text-slate-500">Lengkapi data diri untuk memulai.</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-center gap-2">⚠️ {error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm border border-green-100 flex items-center gap-2">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROLE SELECTION (CARD STYLE) */}
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => setFormData({...formData, role: 'Pasien'})}
                    className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.role === 'Pasien' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200 text-slate-500'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.role === 'Pasien' ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                        <User size={20} />
                    </div>
                    <span className="font-bold">Pasien</span>
                </div>

                <div 
                    onClick={() => setFormData({...formData, role: 'Dokter'})}
                    className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.role === 'Dokter' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200 text-slate-500'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.role === 'Dokter' ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                        <Stethoscope size={20} />
                    </div>
                    <span className="font-bold">Dokter</span>
                </div>
            </div>

            {/* GRID FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Username */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                    <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Username" />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={18} /></div>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="email@contoh.com" />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                    <input type={showPass ? "text" : "password"} required name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="••••••" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ulangi Password</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                    <input type={showConfirm ? "text" : "password"} required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="••••••" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Nama Lengkap */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                    <input required type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Sesuai KTP" />
                </div>
              </div>

              {/* KHUSUS PASIEN */}
              {formData.role === 'Pasien' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tanggal Lahir</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Calendar size={18} /></div>
                        <input required type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jenis Kelamin</label>
                    <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white">
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </>
              )}

              {/* KHUSUS DOKTER */}
              {formData.role === 'Dokter' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Spesialis</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Briefcase size={18} /></div>
                        <input required type="text" name="spesialis" value={formData.spesialis} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Contoh: Jantung" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jadwal Praktik</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Clock size={18} /></div>
                        <input type="text" name="jadwal_praktik" value={formData.jadwal_praktik} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Senin - Jumat 09:00" />
                    </div>
                  </div>
                </>
              )}

              {/* Telepon */}
              <div className="md:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1">No. Telepon</label>
                 <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone size={18} /></div>
                    <input type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="08xxxxxxxxxx" />
                 </div>
              </div>

              {/* Alamat (Pasien) */}
              {formData.role === 'Pasien' && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Alamat</label>
                  <div className="relative mt-1">
                    <div className="absolute left-3 top-3 text-slate-400"><MapPin size={18} /></div>
                    <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none" placeholder="Alamat lengkap..."></textarea>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : `Daftar Sebagai ${formData.role}`}
            </button>
          </form>

          <div className="mt-8 pb-8 text-center text-sm text-slate-500">
            Sudah punya akun? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Login disini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;