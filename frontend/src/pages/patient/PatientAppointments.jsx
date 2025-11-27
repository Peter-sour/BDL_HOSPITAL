import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientAppointments = ({ user }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ 
    id_dokter: '', 
    tanggal_appointment: '', 
    jam_appointment: '', 
    keluhan: '' 
  });
  
  // State Rating
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingVal, setRatingVal] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'list') {
        const res = await patientAPI.getAppointments();
        setAppointments(res.data.data || []);
      } else {
        const res = await patientAPI.getDoctors();
        setDoctors(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.createAppointment(formData);
      alert('Janji temu berhasil dibuat!');
      setFormData({ id_dokter: '', tanggal_appointment: '', jam_appointment: '', keluhan: '' });
      setActiveTab('list');
    } catch (error) {
      alert('Gagal membuat janji: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Yakin ingin membatalkan janji ini?')) {
      try {
        await patientAPI.cancelAppointment(id);
        fetchData();
      } catch (error) { alert('Gagal membatalkan'); }
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();
    if (ratingVal === 0) {
      alert('Mohon pilih jumlah bintang!');
      return;
    }
    try {
      await patientAPI.rateDoctor({
        id_dokter: ratingModal.id_dokter,
        id_appointment: ratingModal.id_appointment,
        rating: ratingVal,
        komentar: review
      });
      alert('Terima kasih! Rating Anda berhasil dikirim.');
      setRatingModal(null); setRatingVal(0); setReview('');
      fetchData();
    } catch (err) {
      alert('Gagal mengirim rating: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper Status Badge
  const getStatusBadge = (status) => {
      switch(status) {
          case 'Approved': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Disetujui</span>;
          case 'Pending': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Menunggu</span>;
          case 'Selesai': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Selesai</span>;
          default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">{status}</span>;
      }
  };

  return (
    <PatientLayout user={user} title="Janji Temu" subtitle="Kelola jadwal konsultasi Anda">
      
      {/* Tabs Navigasi */}
      <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 w-fit mb-6">
        {['list', 'create'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab === 'list' ? 'Riwayat Janji' : 'Buat Janji Baru'}
          </button>
        ))}
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4 max-w-5xl">
          {appointments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                Belum ada riwayat janji temu.
            </div>
          ) : (
            // UBAH DARI TABLE KE CARD LIST
            appointments.map((apt, index) => {
                const isFirst = index === 0;
                // Cek apakah ini jadwal masa depan atau masa lalu
                const isUpcoming = ['Pending', 'Approved'].includes(apt.status);

                return (
                    <div 
                        key={apt.id_appointment} 
                        className={`bg-white p-6 rounded-2xl shadow-sm border transition duration-300 hover:shadow-md relative overflow-hidden ${
                            isFirst 
                            ? (isUpcoming ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200 ring-1 ring-slate-100')
                            : 'border-slate-100'
                        }`}
                    >
                        {/* --- LABEL OTOMATIS (HANYA ITEM PERTAMA) --- */}
                        {isFirst && (
                            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-bold tracking-wider text-white shadow-sm ${
                                isUpcoming ? 'bg-blue-600' : 'bg-slate-500'
                            }`}>
                                {isUpcoming ? 'JADWAL TERDEKAT' : 'RIWAYAT TERAKHIR'}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            
                            {/* Info Dokter & Waktu */}
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${isFirst && isUpcoming ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                    👨‍⚕️
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800">{apt.nama_dokter}</h4>
                                    <p className="text-sm text-slate-500 mb-1">{apt.spesialis}</p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(apt.tanggal_appointment).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                                        <span className="text-slate-300">|</span>
                                        <span className="text-blue-600">{apt.jam_appointment} WIB</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Keluhan */}
                            <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                                {getStatusBadge(apt.status)}
                                <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg max-w-xs truncate border border-slate-100">
                                    "{apt.keluhan}"
                                </div>
                            </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            {apt.status === 'Pending' && (
                                <button onClick={() => handleCancel(apt.id_appointment)} className="px-4 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition">
                                    Batalkan Janji
                                </button>
                            )}
                            
                            {apt.status === 'Selesai' && apt.is_rated !== 1 && (
                                <button 
                                    onClick={() => { setRatingModal(apt); setRatingVal(0); setReview(''); }}
                                    className="px-4 py-2 text-sm font-bold text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    Beri Nilai Dokter
                                </button>
                            )}

                            {apt.status === 'Selesai' && apt.is_rated === 1 && (
                                <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    Sudah Dinilai
                                </span>
                            )}
                        </div>
                    </div>
                );
            })
          )}
        </div>
      ) : (
        // FORM BUAT JANJI (Tampilan Card)
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">📅</span>
              Buat Janji Temu Baru
          </h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Dokter Spesialis</label>
              <div className="relative">
                  <select 
                    required
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition"
                    value={formData.id_dokter}
                    onChange={(e) => setFormData({...formData, id_dokter: e.target.value})}
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map(doc => (
                      <option key={doc.id_dokter} value={doc.id_dokter}>
                        {doc.nama} - {doc.spesialis} ({doc.jadwal_praktik || 'Jadwal Reguler'})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Rencana</label>
                <input 
                  type="date"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.tanggal_appointment}
                  onChange={(e) => setFormData({...formData, tanggal_appointment: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Jam Kedatangan</label>
                <input 
                  type="time"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.jam_appointment}
                  onChange={(e) => setFormData({...formData, jam_appointment: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Keluhan Utama</label>
              <textarea 
                rows="3"
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.keluhan}
                onChange={(e) => setFormData({...formData, keluhan: e.target.value})}
                placeholder="Contoh: Demam tinggi sudah 3 hari, disertai pusing..."
              />
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 transform hover:-translate-y-0.5">
                Kirim Permintaan Janji Temu
                </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL RATING --- */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in-up">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Beri Penilaian</h3>
              <p className="text-sm text-slate-500 mt-1">Bagaimana pelayanan {ratingModal.nama_dokter}?</p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  className="transition-transform transform hover:scale-110 focus:outline-none"
                >
                  <svg 
                    className={`w-10 h-10 ${star <= ratingVal ? 'text-yellow-400 drop-shadow-md' : 'text-slate-200'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-yellow-400 outline-none mb-6 resize-none"
              rows="3"
              placeholder="Tulis ulasan Anda (opsional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setRatingModal(null)} 
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
              >
                Batal
              </button>
              <button 
                onClick={submitRating} 
                className="flex-1 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-xl hover:bg-yellow-500 transition shadow-lg shadow-yellow-100"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

    </PatientLayout>
  );
};

export default PatientAppointments;