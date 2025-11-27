import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password konfirmasi tidak cocok!');
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* --- TOMBOL KEMBALI KE BERANDA --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-8">
        <Link 
          to="/" 
          className="flex items-center text-slate-500 hover:text-blue-600 transition duration-200 font-medium w-fit mx-auto md:mx-0"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Buat Akun Baru</h1>
            <p className="text-slate-500">Silakan lengkapi data diri Anda</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-sm border border-green-100">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* PILIH PERAN */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-800 mb-2">Mendaftar Sebagai:</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Pasien" 
                    checked={formData.role === 'Pasien'} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">Pasien</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Dokter" 
                    checked={formData.role === 'Dokter'} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">Dokter</span>
                </label>
              </div>
            </div>

            {/* DATA AKUN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Username</label>
                <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ulangi Password</label>
                <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <hr className="border-slate-100"/>

            {/* DATA PRIBADI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap</label>
                <input required type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              {formData.role === 'Pasien' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tanggal Lahir</label>
                    <input required type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jenis Kelamin</label>
                    <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </>
              )}

              {formData.role === 'Dokter' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Spesialis</label>
                    <input placeholder="Contoh: Jantung, Umum" required type="text" name="spesialis" value={formData.spesialis} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jadwal Praktik</label>
                    <input placeholder="Contoh: Senin-Jumat 08:00-14:00" type="text" name="jadwal_praktik" value={formData.jadwal_praktik} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">No. Telepon</label>
                 <input type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              {formData.role === 'Pasien' && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Alamat</label>
                  <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-300 disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : `Daftar Sebagai ${formData.role}`}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login disini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;