import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI, authAPI } from '../../services/api';
// 1. IMPORT ICON DARI LUCIDE
import { Eye, EyeOff } from 'lucide-react';

const PatientProfile = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});
  
  // State Modal Password
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // 2. STATE UNTUK SHOW/HIDE PASSWORD
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok!'); return;
    }
    if (passForm.newPassword.length < 6) {
        alert('Password minimal 6 karakter!'); return;
    }
    try {
      await authAPI.changePassword({
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      });
      alert('Password berhasil diubah! Silakan login ulang.');
      setIsPassModalOpen(false);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPass({ old: false, new: false, confirm: false }); // Reset mata
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper Toggle Mata
  const toggleShow = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

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
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-lg ${isMale ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-pink-100 to-rose-100'}`}>
               <svg className={`w-16 h-16 ${isMale ? 'text-blue-600' : 'text-pink-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profile.nama}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.email}</p>
            <div className={`px-4 py-1 rounded-full text-xs font-semibold ${isMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
              {isMale ? 'Laki-Laki' : 'Perempuan'}
            </div>
            
            <button 
                onClick={() => setIsPassModalOpen(true)}
                className="mt-6 w-full py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Ganti Password
            </button>
          </div>
        </div>

        {/* Right Column (Form Profil) - Kode Sama */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Detail Informasi</h3>
              <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
                {isEditing ? 'Batal Edit' : 'Edit Profil'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-semibold text-slate-500 uppercase">Username</label><input value={profile.username || ''} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" /></div>
                <div className="space-y-2"><label className="text-xs font-semibold text-slate-500 uppercase">Email</label><input value={profile.email || ''} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" /></div>
                <div className="space-y-2"><label className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</label><input value={profile.nama || ''} onChange={(e) => setProfile({...profile, nama: e.target.value})} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`} /></div>
                <div className="space-y-2"><label className="text-xs font-semibold text-slate-500 uppercase">No. Telepon</label><input value={profile.no_telepon || ''} onChange={(e) => setProfile({...profile, no_telepon: e.target.value})} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`} /></div>
                <div className="space-y-2"><label className="text-xs font-semibold text-slate-500 uppercase">Jenis Kelamin</label><select value={isMale ? 'L' : 'P'} onChange={(e) => setProfile({...profile, jenis_kelamin: e.target.value})} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`}><option value="L">Laki-Laki</option><option value="P">Perempuan</option></select></div>
                <div className="md:col-span-2 space-y-2"><label className="text-xs font-semibold text-slate-500 uppercase">Alamat</label><textarea value={profile.alamat || ''} onChange={(e) => setProfile({...profile, alamat: e.target.value})} disabled={!isEditing} rows="3" className={`w-full px-4 py-2.5 border rounded-xl transition-all ${isEditing ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`} /></div>
              </div>
              {isEditing && (<div className="pt-4 flex justify-end"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5">Simpan Perubahan</button></div>)}
            </form>
          </div>
        </div>
      </div>

      {/* --- MODAL GANTI PASSWORD DENGAN MATA --- */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in-up">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Ganti Password</h3>
                    <p className="text-sm text-slate-500">Amankan akun Anda dengan password baru.</p>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    
                    {/* Password Lama */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Password Lama</label>
                        <div className="relative">
                            <input 
                                type={showPass.old ? "text" : "password"} 
                                required 
                                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-10" 
                                value={passForm.oldPassword} 
                                onChange={e=>setPassForm({...passForm, oldPassword: e.target.value})} 
                            />
                            <button type="button" onClick={() => toggleShow('old')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPass.old ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Password Baru */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Password Baru</label>
                        <div className="relative">
                            <input 
                                type={showPass.new ? "text" : "password"} 
                                required 
                                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-10" 
                                value={passForm.newPassword} 
                                onChange={e=>setPassForm({...passForm, newPassword: e.target.value})} 
                            />
                            <button type="button" onClick={() => toggleShow('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Konfirmasi Password</label>
                        <div className="relative">
                            <input 
                                type={showPass.confirm ? "text" : "password"} 
                                required 
                                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-10" 
                                value={passForm.confirmPassword} 
                                onChange={e=>setPassForm({...passForm, confirmPassword: e.target.value})} 
                            />
                            <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={()=>setIsPassModalOpen(false)} className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Batal</button>
                        <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default PatientProfile;