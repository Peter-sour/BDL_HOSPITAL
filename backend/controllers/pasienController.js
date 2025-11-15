// controllers/pasienController.js
const db = require('../config/db');

// Mengambil daftar pasien dengan fitur pencarian
exports.getAllPasien = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const searchQuery = req.query.search;
        let whereClause = '';
        let bindVars = {};

        if (searchQuery) {
            whereClause = `
                WHERE UPPER(p.NAMA) LIKE UPPER(:searchVal) 
                   OR UPPER(p.ID_PASIEN) LIKE UPPER(:searchVal)
            `;
            bindVars.searchVal = `%${searchQuery}%`;
        }
        
        const result = await connection.execute(
            `SELECT 
                p.ID_PASIEN, 
                p.NAMA, 
                TRUNC(MONTHS_BETWEEN(SYSDATE, p.TANGGAL_LAHIR) / 12) AS USIA,
                FN_STATUS_PASIEN(p.ID_PASIEN) AS STATUS_PASIEN
             FROM PASIEN p
             ${whereClause} 
             ORDER BY p.ID_PASIEN`,
             bindVars,
             { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );
        
        const pasienList = result.rows.map(row => ({
            idPasien: row.ID_PASIEN,
            nama: row.NAMA,
            usia: row.USIA,
            status: row.STATUS_PASIEN
        }));

        res.status(200).json(pasienList);

    } catch (err) {
        console.error("Error mengambil daftar pasien:", err);
        res.status(500).json({ message: "Gagal memuat daftar pasien.", error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Mengambil detail pasien spesifik (dipakai saat Edit)
exports.getPasienDetail = async (req, res) => {
    const { idPasien } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `SELECT 
                p.ID_PASIEN, 
                p.NAMA, 
                p.TANGGAL_LAHIR, 
                p.ALAMAT,
                FN_STATUS_PASIEN(p.ID_PASIEN) AS STATUS_PASIEN
             FROM PASIEN p
             WHERE p.ID_PASIEN = :idPasien`,
            { idPasien },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Pasien tidak ditemukan." });
        }
        
        const row = result.rows[0];
        
        // Memastikan format tanggal cocok untuk FE (YYYY-MM-DD)
        const detail = {
            idPasien: row.ID_PASIEN,
            nama: row.NAMA,
            tanggalLahir: row.TANGGAL_LAHIR instanceof Date ? row.TANGGAL_LAHIR.toISOString().split('T')[0] : row.TANGGAL_LAHIR, 
            alamat: row.ALAMAT,
            status: row.STATUS_PASIEN
        };

        res.status(200).json(detail);

    } catch (err) {
        console.error(`Error mengambil detail pasien ${idPasien}:`, err);
        res.status(500).json({ message: "Gagal memuat detail pasien.", error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Menambah pasien baru
exports.createPasien = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const { idPasien, nama, tanggalLahir, alamat } = req.body;
        
        const result = await connection.execute(
            `INSERT INTO PASIEN (ID_PASIEN, NAMA, TANGGAL_LAHIR, ALAMAT)
             VALUES (:idPasien, :nama, TO_DATE(:tanggalLahir, 'YYYY-MM-DD'), :alamat)`,
            { idPasien, nama, tanggalLahir, alamat },
            { autoCommit: true }
        );

        res.status(201).json({ 
            message: "Pasien berhasil ditambahkan!", 
            rowsAffected: result.rowsAffected 
        });

    } catch (err) {
        console.error("Error menambahkan pasien:", err);
        res.status(500).json({ 
            message: "Gagal menambahkan pasien.", 
            error: err.message
        });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Mengupdate data pasien
exports.updatePasien = async (req, res) => {
    const { idPasien } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const { nama, tanggalLahir, alamat } = req.body;
        
        const result = await connection.execute(
            `UPDATE PASIEN
             SET NAMA = :nama,
                 TANGGAL_LAHIR = TO_DATE(:tanggalLahir, 'YYYY-MM-DD'),
                 ALAMAT = :alamat
             WHERE ID_PASIEN = :idPasien`,
            { nama, tanggalLahir, alamat, idPasien },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: "Pasien tidak ditemukan untuk diupdate." });
        }

        res.status(200).json({ 
            message: "Data pasien berhasil diperbarui.", 
            rowsAffected: result.rowsAffected 
        });

    } catch (err) {
        console.error(`Error mengupdate pasien ${idPasien}:`, err);
        res.status(500).json({ 
            message: "Gagal memperbarui data pasien.",
            error: err.message
        });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// Menghapus data pasien
exports.deletePasien = async (req, res) => {
    const { idPasien } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `DELETE FROM PASIEN WHERE ID_PASIEN = :idPasien`,
            { idPasien },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: "Pasien tidak ditemukan untuk dihapus." });
        }

        res.status(200).json({ 
            message: "Data pasien berhasil dihapus.", 
            rowsAffected: result.rowsAffected 
        });

    } catch (err) {
        console.error(`Error menghapus pasien ${idPasien}:`, err);
        res.status(500).json({ 
            message: "Gagal menghapus data pasien. Mungkin ada data terkait yang harus dihapus terlebih dahulu.",
            error: err.message
        });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};