// src/controllers/PaymentController.js
const db = require('../config/db'); 
// Asumsi: db memiliki properti oracledb yang berisi OUT_FORMAT_OBJECT

// Definisikan format output yang benar
// PERBAIKAN: Menggunakan db.oracledb.OUT_FORMAT_OBJECT
const OUT_FORMAT = db.oracledb.OUT_FORMAT_OBJECT; 

// GET: Ambil semua data transaksi pembayaran dengan relasi lengkap
exports.getAllPayments = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = `
      SELECT 
        tp.id_transaksi,
        -- Format Tanggal ke ISO String
        TO_CHAR(tp.tanggal_transaksi, 'YYYY-MM-DD"T"HH24:MI:SS') AS TANGGAL_TRANSAKSI, 
        tp.total_bayar,
        tp.metode_bayar,
        p.id_pasien,
        p.nama AS NAMA_PASIEN,
        p.alamat,
        TO_CHAR(p.tanggal_lahir, 'YYYY-MM-DD') AS TANGGAL_LAHIR,
        r.id_resep,
        TO_CHAR(r.tanggal_resep, 'YYYY-MM-DD') AS TANGGAL_RESEP,
        r.catatan AS CATATAN_RESEP,
        d.id_dokter,
        d.nama AS NAMA_DOKTER,
        d.spesialis,
        d.departemen,
        ri.id_rawat,
        TO_CHAR(ri.tanggal_masuk, 'YYYY-MM-DD') AS TANGGAL_MASUK,
        TO_CHAR(ri.tanggal_keluar, 'YYYY-MM-DD') AS TANGGAL_KELUAR,
        k.nama_kamar,
        k.no_kamar,
        k.kelas_kamar
      FROM TRANSAKSI_PEMBAYARAN tp
      INNER JOIN PASIEN p ON tp.id_pasien = p.id_pasien
      INNER JOIN RESEP r ON tp.id_resep = r.id_resep
      INNER JOIN DOKTER d ON r.id_dokter = d.id_dokter
      LEFT JOIN RAWAT_INAP ri ON tp.id_rawat = ri.id_rawat
      LEFT JOIN KAMAR k ON ri.id_kamar = k.id_kamar
      ORDER BY tp.tanggal_transaksi DESC
    `;
    
    // MENGGANTI db.OUT_FORMAT_OBJECT
    const result = await connection.execute(query, [], { outFormat: OUT_FORMAT });
    
    // Ambil detail obat untuk setiap resep
    const paymentsWithDetails = await Promise.all(
      result.rows.map(async (payment) => {
        const obatQuery = `
          SELECT 
            ro.id_resep_obat,
            ro.jumlah,
            ro.aturan_pakai,
            o.id_obat,
            o.nama_obat,
            o.jenis_obat,
            o.dosis,
            o.harga
          FROM RESEP_OBAT ro
          INNER JOIN OBAT o ON ro.id_obat = o.id_obat
          WHERE ro.id_resep = :id_resep
        `;
        
        const obatResult = await connection.execute(
          obatQuery, 
          { id_resep: payment.ID_RESEP },
          // MENGGANTI db.OUT_FORMAT_OBJECT
          { outFormat: OUT_FORMAT }
        );
        
        return {
          ...payment,
          OBAT_LIST: obatResult.rows 
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: paymentsWithDetails
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pembayaran',
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

// GET: Ambil detail satu transaksi
exports.getPaymentById = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { id } = req.params;
    
    const query = `
      SELECT 
        tp.id_transaksi,
        TO_CHAR(tp.tanggal_transaksi, 'YYYY-MM-DD"T"HH24:MI:SS') AS TANGGAL_TRANSAKSI,
        tp.total_bayar,
        tp.metode_bayar,
        p.id_pasien,
        p.nama AS NAMA_PASIEN,
        p.alamat,
        TO_CHAR(p.tanggal_lahir, 'YYYY-MM-DD') AS TANGGAL_LAHIR,
        r.id_resep,
        TO_CHAR(r.tanggal_resep, 'YYYY-MM-DD') AS TANGGAL_RESEP,
        r.catatan AS CATATAN_RESEP,
        d.id_dokter,
        d.nama AS NAMA_DOKTER,
        d.spesialis,
        d.departemen,
        ri.id_rawat,
        TO_CHAR(ri.tanggal_masuk, 'YYYY-MM-DD') AS TANGGAL_MASUK,
        TO_CHAR(ri.tanggal_keluar, 'YYYY-MM-DD') AS TANGGAL_KELUAR,
        k.nama_kamar,
        k.no_kamar,
        k.kelas_kamar
      FROM TRANSAKSI_PEMBAYARAN tp
      INNER JOIN PASIEN p ON tp.id_pasien = p.id_pasien
      INNER JOIN RESEP r ON tp.id_resep = r.id_resep
      INNER JOIN DOKTER d ON r.id_dokter = d.id_dokter
      LEFT JOIN RAWAT_INAP ri ON tp.id_rawat = ri.id_rawat
      LEFT JOIN KAMAR k ON ri.id_kamar = k.id_kamar
      WHERE tp.id_transaksi = :id
    `;
    
    const result = await connection.execute(
      query, 
      { id },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pembayaran tidak ditemukan'
      });
    }
    
    // Ambil detail obat
    const obatQuery = `
      SELECT 
        ro.id_resep_obat,
        ro.jumlah,
        ro.aturan_pakai,
        o.id_obat,
        o.nama_obat,
        o.jenis_obat,
        o.dosis,
        o.harga
      FROM RESEP_OBAT ro
      INNER JOIN OBAT o ON ro.id_obat = o.id_obat
      WHERE ro.id_resep = :id_resep
    `;
    
    const obatResult = await connection.execute(
      obatQuery,
      { id_resep: result.rows[0].ID_RESEP },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    const payment = {
      ...result.rows[0],
      OBAT_LIST: obatResult.rows
    };
    
    res.status(200).json({
      success: true,
      data: payment
    });
    
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pembayaran',
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

// POST: Tambah transaksi pembayaran baru
exports.createPayment = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { id_pasien, id_resep, id_rawat, metode_bayar } = req.body;
    
    // Validasi input
    if (!id_pasien || !id_resep || !metode_bayar) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Pasien, Resep, dan Metode Bayar wajib diisi'
      });
    }
    
    // Generate ID transaksi
    const countQuery = 'SELECT COUNT(*) as total FROM TRANSAKSI_PEMBAYARAN';
    // MENGGANTI db.OUT_FORMAT_OBJECT
    const countResult = await connection.execute(countQuery, [], { outFormat: OUT_FORMAT });
    const newId = `TRX${String((countResult.rows[0].TOTAL || 0) + 1).padStart(3, '0')}`;
    
    // Hitung total bayar dari resep obat
    const totalQuery = `
      SELECT SUM(ro.jumlah * o.harga) as total
      FROM RESEP_OBAT ro
      INNER JOIN OBAT o ON ro.id_obat = o.id_obat
      WHERE ro.id_resep = :id_resep
    `;
    const totalResult = await connection.execute(
      totalQuery,
      { id_resep },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    const totalBayar = totalResult.rows[0].TOTAL || 0;
    
    // Insert transaksi
    const insertQuery = `
      INSERT INTO TRANSAKSI_PEMBAYARAN 
      (id_transaksi, id_pasien, id_resep, id_rawat, tanggal_transaksi, total_bayar, metode_bayar)
      VALUES (:id_transaksi, :id_pasien, :id_resep, :id_rawat, SYSDATE, :total_bayar, :metode_bayar)
    `;
    
    await connection.execute(
      insertQuery,
      {
        id_transaksi: newId,
        id_pasien,
        id_resep,
        id_rawat: id_rawat || null,
        total_bayar: totalBayar,
        metode_bayar
      }
    );
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Transaksi pembayaran berhasil ditambahkan',
      data: { id_transaksi: newId, total_bayar: totalBayar }
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan transaksi pembayaran',
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

// PUT: Update transaksi pembayaran
exports.updatePayment = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { id } = req.params;
    const { metode_bayar } = req.body;
    
    // Cek apakah transaksi ada
    const checkQuery = 'SELECT id_transaksi, total_bayar FROM TRANSAKSI_PEMBAYARAN WHERE id_transaksi = :id';
    const checkResult = await connection.execute(
      checkQuery,
      { id },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pembayaran tidak ditemukan'
      });
    }
    
    // Update transaksi
    const updateQuery = `
      UPDATE TRANSAKSI_PEMBAYARAN 
      SET metode_bayar = :metode_bayar
      WHERE id_transaksi = :id
    `;
    
    await connection.execute(
      updateQuery,
      { metode_bayar, id }
    );
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Data pembayaran berhasil diupdate',
      data: {
          id_transaksi: id,
          total_bayar: checkResult.rows[0].TOTAL_BAYAR
      }
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data pembayaran',
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

// DELETE: Hapus transaksi pembayaran
exports.deletePayment = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { id } = req.params;
    
    // Cek apakah transaksi ada
    const checkQuery = 'SELECT id_transaksi FROM TRANSAKSI_PEMBAYARAN WHERE id_transaksi = :id';
    const checkResult = await connection.execute(
      checkQuery,
      { id },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pembayaran tidak ditemukan'
      });
    }
    
    // Hapus transaksi
    const deleteQuery = 'DELETE FROM TRANSAKSI_PEMBAYARAN WHERE id_transaksi = :id';
    await connection.execute(deleteQuery, { id });
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Data pembayaran berhasil dihapus'
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data pembayaran',
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

// GET: Ambil data pasien untuk dropdown
exports.getPasienList = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const query = 'SELECT id_pasien, nama FROM PASIEN ORDER BY nama';
    // MENGGANTI db.OUT_FORMAT_OBJECT
    const result = await connection.execute(query, [], { outFormat: OUT_FORMAT });
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pasien',
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

// GET: Ambil data resep berdasarkan pasien
exports.getResepByPasien = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { id_pasien } = req.params;
    
    const query = `
      SELECT r.id_resep, r.tanggal_resep, d.nama AS NAMA_DOKTER
      FROM RESEP r
      INNER JOIN DOKTER d ON r.id_dokter = d.id_dokter
      WHERE r.id_pasien = :id_pasien
      ORDER BY r.tanggal_resep DESC
    `;
    
    const result = await connection.execute(
      query,
      { id_pasien },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching resep:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data resep',
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

// GET: Ambil data rawat inap berdasarkan pasien
exports.getRawatInapByPasien = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { id_pasien } = req.params;
    
    const query = `
      SELECT ri.id_rawat, ri.tanggal_masuk, ri.tanggal_keluar, 
             k.nama_kamar, k.no_kamar, k.kelas_kamar
      FROM RAWAT_INAP ri
      INNER JOIN KAMAR k ON ri.id_kamar = k.id_kamar
      WHERE ri.id_pasien = :id_pasien
      ORDER BY ri.tanggal_masuk DESC
    `;
    
    const result = await connection.execute(
      query,
      { id_pasien },
      // MENGGANTI db.OUT_FORMAT_OBJECT
      { outFormat: OUT_FORMAT }
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rawat inap:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rawat inap',
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