// controllers/medicineController.js
const db = require('../config/db');

// ============================================
// GET SEMUA OBAT
// ============================================
exports.getAllMedicines = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `SELECT id_obat, nama_obat, jenis_obat, dosis, stok, harga 
             FROM OBAT 
             ORDER BY nama_obat`,
            [],
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data obat',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

// ============================================
// GET OBAT BY ID
// ============================================
exports.getMedicineById = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `SELECT id_obat, nama_obat, jenis_obat, dosis, stok, harga 
             FROM OBAT 
             WHERE id_obat = :id`,
            [id],
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Obat tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data obat',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

// ============================================
// POST TAMBAH OBAT BARU
// ============================================
exports.createMedicine = async (req, res) => {
    let connection;
    try {
        const { id_obat, nama_obat, jenis_obat, dosis, stok, harga } = req.body;
        
        // Validasi input
        if (!id_obat || !nama_obat || !jenis_obat || !dosis || stok === undefined || !harga) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi'
            });
        }
        
        // Validasi stok tidak boleh negatif
        if (stok < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stok tidak boleh kurang dari 0!'
            });
        }
        
        connection = await db.getConnection();
        
        await connection.execute(
            `INSERT INTO OBAT (id_obat, nama_obat, jenis_obat, dosis, stok, harga) 
             VALUES (:id_obat, :nama_obat, :jenis_obat, :dosis, :stok, :harga)`,
            { id_obat, nama_obat, jenis_obat, dosis, stok, harga },
            { autoCommit: true }
        );
        
        // Cek apakah stok < 10 untuk peringatan
        let warning = null;
        if (stok < 10) {
            warning = `PERINGATAN: Stok obat ${nama_obat} hanya ${stok} unit!`;
        }
        
        res.status(201).json({
            success: true,
            message: 'Obat berhasil ditambahkan',
            warning: warning,
            data: { id_obat, nama_obat, jenis_obat, dosis, stok, harga }
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        
        // Handle constraint violations (ORA-00001 = duplicate key)
        if (error.errorNum === 1 || error.message.includes('unique constraint')) {
            return res.status(409).json({
                success: false,
                message: 'ID Obat sudah ada'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan obat',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

// ============================================
// PUT UPDATE OBAT LENGKAP
// TRIGGER: trg_kontrol_stok_obat akan jalan otomatis
// ============================================
exports.updateMedicine = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { nama_obat, jenis_obat, dosis, stok, harga } = req.body;
        
        connection = await db.getConnection();
        
        // Cek apakah obat ada
        const checkResult = await connection.execute(
            `SELECT nama_obat FROM OBAT WHERE id_obat = :id`,
            [id],
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Obat tidak ditemukan'
            });
        }
        
        // TRIGGER trg_kontrol_stok_obat akan otomatis jalan saat update stok
        // Trigger akan:
        // 1. DBMS_OUTPUT.PUT_LINE jika stok < 10
        // 2. RAISE_APPLICATION_ERROR jika stok < 0
        await connection.execute(
            `UPDATE OBAT 
             SET nama_obat = :nama_obat, 
                 jenis_obat = :jenis_obat, 
                 dosis = :dosis, 
                 stok = :stok, 
                 harga = :harga 
             WHERE id_obat = :id`,
            { nama_obat, jenis_obat, dosis, stok, harga, id },
            { autoCommit: true }
        );
        
        // Cek apakah stok < 10 untuk peringatan di response
        let warning = null;
        if (stok < 10 && stok >= 0) {
            warning = `PERINGATAN: Stok obat ${nama_obat} tinggal ${stok} unit!`;
        }
        
        res.json({
            success: true,
            message: 'Data obat berhasil diupdate',
            warning: warning,
            data: { id_obat: id, nama_obat, jenis_obat, dosis, stok, harga }
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        
        // Handle trigger error ORA-20001 (stok < 0)
        if (error.errorNum === 20001 || error.message.includes('ORA-20001')) {
            return res.status(400).json({
                success: false,
                message: 'Stok obat tidak boleh kurang dari 0! (Ditolak oleh Trigger)'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate obat',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

// ============================================
// DELETE HAPUS OBAT
// ============================================
exports.deleteMedicine = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `DELETE FROM OBAT WHERE id_obat = :id`,
            [id],
            { autoCommit: true }
        );
        
        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Obat tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Obat berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        
        // Handle foreign key constraint (ORA-02292)
        if (error.errorNum === 2292 || error.message.includes('ORA-02292')) {
            return res.status(400).json({
                success: false,
                message: 'Obat tidak bisa dihapus karena masih digunakan di resep'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus obat',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

// ============================================
// PATCH UPDATE STOK SAJA
// TRIGGER: trg_kontrol_stok_obat akan jalan otomatis
// Ini route khusus untuk update stok aja, cocok untuk fitur "Update Stok"
// ============================================
exports.updateStock = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { stok } = req.body;
        
        if (stok === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Field stok harus diisi'
            });
        }
        
        connection = await db.getConnection();
        
        // Get medicine name for warning message
        const checkResult = await connection.execute(
            `SELECT nama_obat, stok as stok_lama FROM OBAT WHERE id_obat = :id`,
            [id],
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Obat tidak ditemukan'
            });
        }
        
        const namaObat = checkResult.rows[0].NAMA_OBAT;
        
        // TRIGGER trg_kontrol_stok_obat akan otomatis cek dan kasih peringatan
        // Jika stok < 10: DBMS_OUTPUT.PUT_LINE peringatan
        // Jika stok < 0: RAISE_APPLICATION_ERROR
        await connection.execute(
            `UPDATE OBAT SET stok = :stok WHERE id_obat = :id`,
            { stok, id },
            { autoCommit: true }
        );
        
        // Kasih warning di response jika stok < 10
        let warning = null;
        if (stok < 10 && stok >= 0) {
            warning = `⚠️ PERINGATAN: Stok obat ${namaObat} tinggal ${stok} unit!`;
        }
        
        res.json({
            success: true,
            message: `Stok obat ${namaObat} berhasil diupdate menjadi ${stok} unit`,
            warning: warning,
            data: { id_obat: id, nama_obat: namaObat, stok }
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        
        // Handle trigger error ORA-20001
        if (error.errorNum === 20001 || error.message.includes('ORA-20001')) {
            return res.status(400).json({
                success: false,
                message: 'Stok obat tidak boleh kurang dari 0! (Ditolak oleh Trigger Database)'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate stok',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};