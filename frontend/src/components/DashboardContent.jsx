// src/components/DashboardContent.jsx
import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Pill, CreditCard, Star, MessageSquare } from 'lucide-react';

// Komponen Pembantu untuk Kartu Statistik
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
    <div>
      <h4 className="text-gray-500">{title}</h4>
      {/* Menggunakan kelas yang lebih kecil untuk nilai Rupiah agar sesuai di kartu */}
      <p className={`font-bold text-gray-800 mt-1 ${title === 'Transaksi Hari Ini' ? 'text-xl' : 'text-3xl'}`}>
        {value}
      </p>
    </div>
    <div className={`p-3 rounded-xl ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
  </div>
);

// Komponen Pembantu untuk menampilkan Bintang
const StarRating = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

// Data dummy untuk Review Pasien Terbaru
const recentReviews = [
    { id: 1, name: 'Siti A.', rating: 5, comment: 'Pelayanan sangat cepat dan perawatnya ramah.', time: '1 jam lalu' },
    { id: 2, name: 'Budi H.', rating: 4, comment: 'Dokter sangat informatif. Hanya perlu perbaikan antrian.', time: '3 jam lalu' },
    { id: 3, name: 'Tia M.', rating: 5, comment: 'Fasilitas kamar bersih dan nyaman. Terima kasih!', time: 'Kemarin' },
];

const DashboardContent = () => {
  const [stats, setStats] = useState({
        totalPasien: 'Memuat...', 
        totalDokter: 'Memuat...', 
        stokObatRendah: 'Memuat...', 
        transaksiHariIni: 'Memuat...'
    });
    const [loading, setLoading] = useState(true);

    const formatRupiah = (angka) => {
        if (angka === undefined || angka === null || isNaN(angka)) return "Rp0";
        return "Rp" + angka.toLocaleString('id-ID');
    };

    // Panggilan API dilakukan langsung di dalam useEffect
    useEffect(() => {
        const fetchStats = async () => {
            // URL API dideklarasikan secara lokal di sini
            const apiUrl = 'http://localhost:5000/api/dashboard/stats'; 
            
            try {
                const response = await fetch(apiUrl); // Menggunakan variabel lokal

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                setStats({
                    totalPasien: data.totalPasien.toLocaleString('id-ID'),
                    totalDokter: data.totalDokter.toLocaleString('id-ID'),
                    stokObatRendah: data.stokObatRendah.toLocaleString('id-ID'),
                    transaksiHariIni: formatRupiah(data.transaksiHariIni) 
                });
            } catch (error) {
                console.error("Gagal mengambil data statistik dari API:", error);
                setStats({
                    totalPasien: 'Gagal', 
                    totalDokter: 'Gagal', 
                    stokObatRendah: 'Gagal', 
                    transaksiHariIni: 'Gagal'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
  }, []); // Hanya dipanggil sekali saat komponen dimuat
  return (
    <main className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700">Ringkasan Sistem</h3>

      {/* Statistik Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Pasien Card */}
        <StatCard
          title="Total Pasien"
          value={stats.totalPasien}
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />

        {/* Dokter Card */}
        <StatCard
          title="Total Dokter"
          value={stats.totalDokter}
          icon={Stethoscope}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />

        {/* Obat Card (Menggunakan warna merah untuk indikator stok rendah) */}
        <StatCard
          title="Stok Obat Rendah"
          value={stats.stokObatRendah}
          icon={Pill}
          iconBg="bg-red-100"
          iconColor="text-red-700"
        />

        {/* Transaksi Card */}
        <StatCard
          title="Transaksi Hari Ini"
          value={stats.transaksiHariIni}
          icon={CreditCard}
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />
      </div>

      {/* Review Pasien Terbaru (Menggantikan Aktivitas) */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
            Review Pasien Terbaru
        </h4>
        
        <div className="space-y-4">
            {recentReviews.map((review) => (
                <div key={review.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                            <p className="font-medium text-gray-800 mr-3">{review.name}</p>
                            <StarRating rating={review.rating} />
                        </div>
                        <p className="flex-shrink-0 text-xs text-gray-400">{review.time}</p>
                    </div>
                    <blockquote className="text-sm italic text-gray-600 border-l-2 border-yellow-400 pl-3">
                        "{review.comment}"
                    </blockquote>
                </div>
            ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500">
                Rata-rata rating saat ini: 
                <span className="font-bold text-gray-700 ml-1">4.6/5.0</span>
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Lihat Semua Ulasan →
            </button>
        </div>
      </div>
    </main>
  );
};

export default DashboardContent;