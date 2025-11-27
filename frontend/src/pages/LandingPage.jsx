import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// 1. Import Ikon Lucide
import { 
  Activity, 
  CalendarClock, 
  ClipboardList, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X,
  Stethoscope
} from 'lucide-react';

function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- NAVBAR (Glass Effect) --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Activity size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-800">
                RS <span className="text-blue-600">MEDCARE</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#fitur" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Fitur</a>
              <a href="#tentang" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Tentang</a>
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition">
                  Masuk
                </Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5">
                  Daftar Sekarang
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-lg">
            <Link to="/login" className="block w-full text-center py-3 font-bold text-slate-600 border border-slate-200 rounded-xl">Masuk</Link>
            <Link to="/register" className="block w-full text-center py-3 font-bold bg-blue-600 text-white rounded-xl">Daftar</Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs (Hiasan) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem Informasi Rumah Sakit Terintegrasi
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Kesehatan Modern <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dalam Satu Genggaman</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-10 leading-relaxed">
              Platform digital yang menghubungkan pasien dan dokter secara seamless. 
              Janji temu, rekam medis, hingga pembayaran QRIS, semua jadi mudah.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Mulai Gratis <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition">
                Masuk Akun
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Dokter Spesialis', val: '50+' },
              { label: 'Pasien Terdaftar', val: '10k+' },
              { label: 'Layanan Medis', val: '24 Jam' },
              { label: 'Kepuasan', val: '99%' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{stat.val}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FITUR UNGGULAN --- */}
      <div id="fitur" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Fitur Lengkap & Canggih</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Kami menghadirkan teknologi terbaik untuk pengalaman berobat yang lebih nyaman dan transparan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition duration-300 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition">
                <CalendarClock size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Booking Janji Temu</h3>
              <p className="text-slate-500 leading-relaxed">
                Pilih dokter spesialis, atur jadwal sesuai keinginan, dan hindari antrian lama di rumah sakit.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition duration-300 group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition">
                <ClipboardList size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rekam Medis Digital</h3>
              <p className="text-slate-500 leading-relaxed">
                Riwayat kesehatan Anda tersimpan aman dan bisa diakses kapan saja. Transparan dan terorganisir.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition duration-300 group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition">
                <CreditCard size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pembayaran QRIS</h3>
              <p className="text-slate-500 leading-relaxed">
                Bayar tagihan obat dan konsultasi dengan scan QRIS. Cepat, aman, dan langsung terverifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECURITY SECTION --- */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center md:text-left relative overflow-hidden">
            {/* Hiasan */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                    <div className="inline-block p-3 bg-slate-800 rounded-2xl text-blue-400 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Data Anda Aman Bersama Kami</h2>
                    <p className="text-slate-400 text-lg mb-8">
                        Kami menggunakan enkripsi tingkat tinggi untuk melindungi privasi rekam medis dan data pribadi Anda. Keamanan adalah prioritas utama.
                    </p>
                    <Link to="/register" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition">
                        Daftar Sekarang
                    </Link>
                </div>
                <div className="flex-1 flex justify-center">
                    {/* Ilustrasi Mockup Sederhana */}
                    <div className="w-64 h-80 bg-slate-800 rounded-3xl border-4 border-slate-700 flex items-center justify-center relative shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                        <Activity size={64} className="text-slate-600" />
                        <div className="absolute bottom-4 left-4 right-4 h-2 bg-slate-700 rounded-full"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Activity size={18} />
                    </div>
                    <span className="text-xl font-bold text-slate-800">RS MEDCARE</span>
                </div>
                <p className="text-slate-500 max-w-sm">
                    Menghadirkan layanan kesehatan digital yang mudah, cepat, dan terpercaya untuk seluruh masyarakat Indonesia.
                </p>
            </div>
            
            <div>
                <h4 className="font-bold text-slate-800 mb-4">Layanan</h4>
                <ul className="space-y-2 text-slate-500 text-sm">
                    <li><a href="#" className="hover:text-blue-600">Janji Temu Dokter</a></li>
                    <li><a href="#" className="hover:text-blue-600">Cek Jadwal</a></li>
                    <li><a href="#" className="hover:text-blue-600">Farmasi Online</a></li>
                    <li><a href="#" className="hover:text-blue-600">Laboratorium</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-slate-800 mb-4">Hubungi Kami</h4>
                <ul className="space-y-2 text-slate-500 text-sm">
                    <li>info@medcare.com</li>
                    <li>(021) 555-0123</li>
                    <li>Surabaya, Indonesia</li>
                </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 text-center text-slate-400 text-sm">
            &copy; 2024 RS Medcare SIMRS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;