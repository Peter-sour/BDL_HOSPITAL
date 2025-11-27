import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';
// Import Ikon
import { Eye, EyeOff, User, Lock, Activity, ArrowLeft } from 'lucide-react';

function LoginPage({ onLogin }) {
  const history = useHistory();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      if (response.data.success) {
        const { user, token } = response.data;
        onLogin(user, token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'Pasien') {
          history.push('/patient/dashboard');
        } else if (user.role === 'Dokter') {
          history.push('/doctor/dashboard');
        } else {
          history.push('/dashboard'); 
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login gagal. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* --- BAGIAN KIRI: VISUAL & BRANDING --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Pattern (Hiasan) */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
           <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-white" />
           </div>
           <span className="text-2xl font-bold tracking-tight">RS MEDCARE</span>
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 mb-20">
           <h2 className="text-4xl font-bold mb-4 leading-tight">Sistem Informasi <br/>Manajemen Rumah Sakit</h2>
           <p className="text-blue-100 text-lg max-w-md">Kelola kesehatan Anda dengan mudah, cepat, dan terintegrasi dalam satu genggaman.</p>
        </div>

        {/* Footer Text */}
        <div className="relative z-10 text-sm text-blue-200">
           &copy; 2024 RS Medcare SIMRS. All rights reserved.
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM LOGIN --- */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-50">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Tombol Kembali (Mobile Friendly) */}
          <Link to="/" className="flex items-center text-slate-400 hover:text-blue-600 transition mb-8 group w-fit">
             <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
             <span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Selamat Datang</h2>
            <p className="mt-2 text-sm text-slate-500">
              Silakan login ke akun Anda untuk melanjutkan.
            </p>
          </div>

          <div className="mt-8">
            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm outline-none"
                    placeholder="Masukkan username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                    Ingat saya
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Lupa password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'Masuk Akun'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-50 text-slate-500">Belum punya akun?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;