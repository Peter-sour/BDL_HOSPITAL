import React, { useState, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { patientAPI } from '../../services/api';

const PatientAppointments = ({ user }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ id_dokter: '', tanggal_appointment: '', jam_appointment: '', keluhan: '' });

  useEffect(() => {
    const load = async () => {
        if(activeTab === 'list') {
            const res = await patientAPI.getAppointments();
            setAppointments(res.data.data || []);
        } else {
            const res = await patientAPI.getDoctors();
            setDoctors(res.data.data || []);
        }
    };
    load();
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.createAppointment(formData);
      alert('Berhasil!');
      setFormData({ id_dokter: '', tanggal_appointment: '', jam_appointment: '', keluhan: '' });
      setActiveTab('list');
    } catch (err) { alert('Gagal!'); }
  };

  return (
    <PatientLayout user={user} title="Janji Temu" subtitle="Kelola jadwal konsultasi Anda">
      
      {/* Custom Tabs */}
      <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 w-fit mb-6">
        {['list', 'create'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
              ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
              : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'list' ? 'Riwayat Janji' : 'Buat Janji Baru'}
          </button>
        ))}
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Belum ada data janji temu.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Dokter</th>
                  <th className="px-6 py-4">Jadwal</th>
                  <th className="px-6 py-4">Keluhan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((item) => (
                  <tr key={item.id_appointment} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.nama_dokter}</div>
                      <div className="text-xs text-slate-500">{item.spesialis}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{new Date(item.tanggal_appointment).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400">{item.jam_appointment}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.keluhan}</td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {item.status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                       {item.status === 'Pending' && (
                           <button onClick={() => patientAPI.cancelAppointment(item.id_appointment).then(() => setActiveTab('create')).then(()=>setActiveTab('list'))} className="text-red-600 hover:text-red-800 text-sm font-medium">Batalkan</button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Formulir Pendaftaran</h3>
            <form onSubmit={handleCreate} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Dokter Spesialis</label>
                    <select required className="w-full rounded-xl border-slate-200 py-2.5 focus:ring-2 focus:ring-blue-100" value={formData.id_dokter} onChange={e=>setFormData({...formData, id_dokter:e.target.value})}>
                        <option value="">-- Pilih Dokter --</option>
                        {doctors.map(d => <option key={d.id_dokter} value={d.id_dokter}>{d.nama} - {d.spesialis}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                        <input type="date" required className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100" value={formData.tanggal_appointment} onChange={e=>setFormData({...formData, tanggal_appointment:e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jam</label>
                        <input type="time" required className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100" value={formData.jam_appointment} onChange={e=>setFormData({...formData, jam_appointment:e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Keluhan Utama</label>
                    <textarea required rows="3" className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100" placeholder="Jelaskan apa yang Anda rasakan..." value={formData.keluhan} onChange={e=>setFormData({...formData, keluhan:e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5">Buat Janji Temu</button>
            </form>
        </div>
      )}
    </PatientLayout>
  );
};
export default PatientAppointments;