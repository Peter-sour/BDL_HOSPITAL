import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientProfile = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientAPI.getProfile();
      if (response.data.success) setProfile(response.data.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientAPI.updateProfile(profile);
      alert('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (error) { alert(error.message); } 
    finally { setLoading(false); }
  };

  // --- LOGIKA PENGECEKAN GENDER YANG DIPERBAIKI ---
  // Kita cek apakah data dari database diawali huruf 'L' atau 'l'
  // Ini akan mendeteksi: "L", "Laki-laki", "lakilaki", "Laki Laki", dll.
  const checkIsMale = (gender) => {
    if (!gender) return false;
    const g = gender.toString().toLowerCase();
    return g === 'l' || g.startsWith('laki');
  };

  const isMale = checkIsMale(profile.jenis_kelamin);

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <PatientLayout user={user} title="Profil Saya" subtitle="Kelola informasi pribadi Anda">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-lg ${isMale ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-pink-100 to-rose-100'}`}>
               {/* Icon User Berubah Warna Sesuai Gender */}
               <svg className={`w-16 h-16 ${isMale ? 'text-blue-600' : 'text-pink-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800">{profile.nama}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.email}</p>
            
            {/* Badge Gender yang Diperbaiki */}
            <div className={`px-4 py-1 rounded-full text-xs font-semibold ${isMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
              {isMale ? 'Laki-Laki' : 'Perempuan'}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Detail Informasi</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
              >
                {isEditing ? 'Batal Edit' : 'Edit Profil'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                  <input value={profile.username || ''} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                  <input value={profile.email || ''} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                  <input 
                    value={profile.nama || ''} 
                    onChange={(e) => setProfile({...profile, nama: e.target.value})}
                    disabled={!isEditing} 
                    className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Telepon</label>
                  <input 
                    value={profile.no_telepon || ''} 
                    onChange={(e) => setProfile({...profile, no_telepon: e.target.value})}
                    disabled={!isEditing} 
                    className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`} 
                  />
                </div>
                
                {/* Menambahkan Input Gender agar bisa diedit juga */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis Kelamin</label>
                  <select
                    value={isMale ? 'L' : 'P'} // Normalisasi value untuk select
                    onChange={(e) => setProfile({...profile, jenis_kelamin: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</label>
                  <textarea 
                    value={profile.alamat || ''} 
                    onChange={(e) => setProfile({...profile, alamat: e.target.value})}
                    disabled={!isEditing} 
                    rows="3"
                    className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`} 
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5">
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientProfile;