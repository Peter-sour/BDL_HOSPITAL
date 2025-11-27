// controllers/dashboardController.js
const db = require('../config/db');

// --- 1. Mendapatkan Statistik Utama Dashboard ---
exports.getDashboardStats = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();

        // 1. Total Pasien
        const totalPasien = await connection.execute(
            `SELECT COUNT(*) AS total FROM PASIEN`
        );
        // 2. Total Dokter
        const totalDokter = await connection.execute(
            `SELECT COUNT(*) AS total FROM DOKTER`
        );
        // 3. Stok Obat Rendah (Stok di bawah sepuluh unit, ganti sesuai kebutuhan)
        const stokRendah = await connection.execute(
            `SELECT COUNT(*) AS total FROM OBAT WHERE STOK < 10`
        );
        // 4. Total Transaksi Hari Ini
        const totalTransaksiHariIni = await connection.execute(
            `SELECT SUM(TOTAL_BAYAR) AS total FROM TRANSAKSI_PEMBAYARAN 
             WHERE TRUNC(TANGGAL_TRANSAKSI) = TRUNC(SYSDATE)`
        );

        res.status(200).json({
            totalPasien: totalPasien.rows[0][0],
            totalDokter: totalDokter.rows[0][0],
            stokObatRendah: stokRendah.rows[0][0],
            transaksiHariIni: totalTransaksiHariIni.rows[0][0] || 0 // Jika null, tampilkan 0
        });
    } catch (err) {
        console.error("Error mengambil statistik dashboard:", err);
        res.status(500).json({ message: "Gagal memuat data statistik." });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error menutup koneksi:", err);
            }
        }
    }
};


// --- 2. Mendapatkan Review Pasien Terbaru (Data Dummy/View Khusus) ---
// CATATAN: Karena Review tidak ada di ERD, kita pakai dummy atau bisa ambil
// data dari V_LAPORAN_PASIEN sebagai contoh. Kita buat dummy agar sesuai FE.
exports.getLatestReviews = async (req, res) => {
    // Di lingkungan nyata, ini akan mengambil data dari tabel 'REVIEW'
    // atau 'FEEDBACK'
    const dummyReviews = [
        { id: 1, name: 'Siti A.', rating: 5, comment: 'Pelayanan sangat cepat dan perawatnya ramah.', time: '1 jam lalu' },
        { id: 2, name: 'Budi H.', rating: 4, comment: 'Dokter sangat informatif. Hanya perlu perbaikan antrian.', time: '3 jam lalu' },
        { id: 3, name: 'Tia M.', rating: 5, comment: 'Fasilitas kamar bersih dan nyaman. Terima kasih!', time: 'Kemarin' },
    ];
    res.status(200).json(dummyReviews);
};


// --- 3. Memanggil Procedure HITUNG_TAGIHAN_PASIEN ---
exports.getTagihanPasien = async (req, res) => {
    const { idPasien } = req.params; // Ambil ID Pasien dari URL
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
            `BEGIN HITUNG_TAGIHAN_PASIEN(:p_id_pasien, :p_total_tagihan); END;`,
            {
                p_id_pasien: idPasien,
                p_total_tagihan: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } // Parameter OUT
            }
        );

        const totalTagihan = result.outBinds.p_total_tagihan;
        res.status(200).json({ idPasien, totalTagihan });

    } catch (err) {
        console.error(`Error menghitung tagihan untuk pasien ${idPasien}:`, err);
        res.status(500).json({ message: err.message || "Gagal menghitung tagihan pasien." });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// --- 4. Memanggil Function GET_STATUS_PASIEN ---
exports.getStatusPasien = async (req, res) => {
    const { idPasien } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        // Memanggil function di Oracle
        const result = await connection.execute(
            `BEGIN :status := GET_STATUS_PASIEN(:p_id_pasien); END;`,
            {
                status: { type: db.oracledb.STRING, dir: db.oracledb.BIND_OUT },
                p_id_pasien: idPasien
            }
        );

        const status = result.outBinds.status;
        res.status(200).json({ idPasien, status });

    } catch (err) {
        console.error(`Error mengambil status pasien ${idPasien}:`, err);
        res.status(500).json({ message: "Gagal mengambil status pasien." });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// --- 5. Mendapatkan Laporan Pasien per Dokter (View V_LAPORAN_PASIEN) ---
exports.getLaporanPasien = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute(
            `SELECT * FROM V_LAPORAN_PASIEN`
        );
        // Mengubah hasil row (array of array) menjadi object array yang lebih mudah dibaca
        const rows = result.rows.map(row => ({
            namaDokter: row[0],
            spesialisasi: row[1],
            departemen: row[2],
            totalPasienDitangani: row[3],
            daftarPasien: row[4].split('; ').filter(n => n) // Memisahkan nama pasien
        }));

        res.status(200).json(rows);
    } catch (err) {
        console.error("Error mengambil laporan pasien:", err);
        res.status(500).json({ message: "Gagal memuat laporan pasien." });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};