const db = require('../config/db'); 
const oracledb = require('oracledb'); 

exports.getLaporanPasienPerDokter = async (req, res) => {
    let connection;
    try {
       connection = await db.getConnection(); 

        const sql = `
            SELECT
                id_dokter,
                nama_dokter,
                spesialis,
                departemen,
                jumlah_pasien,
                jumlah_kunjungan,
                kunjungan_pertama,
                kunjungan_terakhir
            FROM vw_laporan_pasien_per_dokter
            ORDER BY jumlah_pasien DESC
        `;

        const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {

        console.error('Error in getLaporanPasienPerDokter:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data laporan pasien per dokter.',
            // Tampilkan error NJS-125 jika masih ada
            error: err.message
        });
    } finally {
        if (connection) {
            try {
                // Tutup koneksi, mengembalikannya ke pool
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

// =============================================
// Fitur 2: Laporan Pasien per Departemen
// =============================================
exports.getLaporanPasienPerDepartemen = async (req, res) => {
    let connection;
    try {
        // PERBAIKAN: Ambil koneksi dari Connection Pool yang sudah diinisialisasi
        connection = await db.getConnection();

        const sql = `
            SELECT
                departemen,
                jumlah_dokter,
                jumlah_pasien,
                total_kunjungan,
                rata_rata_per_dokter
            FROM vw_laporan_pasien_per_departemen
            ORDER BY jumlah_pasien DESC
        `;

        const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getLaporanPasienPerDepartemen:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data laporan pasien per departemen.',
            error: err.message
        });
    } finally {
        if (connection) {
            try {
                // Tutup koneksi, mengembalikannya ke pool
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};