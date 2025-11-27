import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { doctorAPI } from '../../services/api';

const DoctorProfile = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});

  // Load data profil saat halaman dibuka
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getProfile();
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Gagal ambil profil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simpan perubahan (Update Profil)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend hanya mengizinkan update jadwal_praktik & no_telepon
      await doctorAPI.updateProfile({
        jadwal_praktik: profile.jadwal_praktik,
        no_telepon: profile.no_telepon
      });
      alert('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (error) {
      alert('Gagal update profil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-emerald-50">Loading...</div>;

  return (
    <DoctorLayout user={user} title="Profil Dokter" subtitle="Kelola informasi profesional dan jadwal praktik">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Kartu Identitas & Foto */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            
            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg z-10 mb-4 mt-8">
              <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                 <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800">{profile.nama}</h2>
            <p className="text-emerald-600 font-medium text-sm mb-1">{profile.spesialis}</p>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-6">{profile.departemen}</p>
            
            <div className="w-full border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-2xl font-bold text-slate-800">{user?.detail?.id_dokter ? user.detail.id_dokter.slice(-4) : '...'}</span>
                <span className="text-xs text-slate-400">ID Dokter</span>
              </div>
              <div>
                 <span className="block text-2xl font-bold text-emerald-600">Active</span>
                 <span className="text-xs text-slate-400">Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Edit */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Informasi Praktik</h3>
                <p className="text-sm text-slate-500">Perbarui jadwal dan kontak yang dapat dihubungi pasien</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`text-sm font-bold px-4 py-2 rounded-lg transition ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}
              >
                {isEditing ? 'Batal Edit' : 'Edit Data'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read Only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 opacity-70">
                  <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                  <input value={profile.username || ''} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2 opacity-70">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <input value={profile.email || ''} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2 opacity-70">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                  <input value={profile.nama || ''} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2 opacity-70">
                  <label className="text-xs font-bold text-slate-400 uppercase">Departemen</label>
                  <input value={profile.departemen || ''} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
              </div>
              
              <hr className="border-slate-100" />
              
              {/* Editable Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Nomor Telepon / WhatsApp</label>
                  <input 
                    value={profile.no_telepon || ''} 
                    onChange={(e) => setProfile({...profile, no_telepon: e.target.value})}
                    disabled={!isEditing} 
                    className={`w-full px-4 py-3 border rounded-xl transition-all outline-none ${isEditing ? 'bg-white border-emerald-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`} 
                    placeholder="Contoh: 08123456789"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Jadwal Praktik</label>
                  <div className={`p-1 rounded-xl transition-all ${isEditing ? 'ring-2 ring-emerald-100' : ''}`}>
                    <textarea 
                      value={profile.jadwal_praktik || ''} 
                      onChange={(e) => setProfile({...profile, jadwal_praktik: e.target.value})}
                      disabled={!isEditing} 
                      rows="3"
                      className={`w-full px-4 py-3 border rounded-xl transition-all outline-none resize-none ${isEditing ? 'bg-white border-emerald-200 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`} 
                      placeholder="Contoh: Senin - Jumat (08:00 - 15:00)"
                    />
                  </div>
                  <p className="text-xs text-slate-400">Informasi ini akan dilihat oleh pasien saat membuat janji temu.</p>
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 flex justify-end">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5">
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;