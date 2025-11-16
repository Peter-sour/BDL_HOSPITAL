// controllers/doctorController.js
const db = require('../config/db');

// GET - Ambil semua data dokter
exports.getAllDoctors = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT id_dokter AS "ID_DOKTER", 
              nama AS "NAMA", 
              spesialis AS "SPESIALIS", 
              departemen AS "DEPARTEMEN"
       FROM DOKTER 
       ORDER BY nama`,
      [],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dokter',
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

// GET - Ambil dokter berdasarkan ID
exports.getDoctorById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await db.getConnection();
    
    const result = await connection.execute(
      `SELECT id_dokter AS "ID_DOKTER", 
              nama AS "NAMA", 
              spesialis AS "SPESIALIS", 
              departemen AS "DEPARTEMEN"
       FROM DOKTER 
       WHERE id_dokter = :id`,
      [id],
      { outFormat: db.OUT_FORMAT_OBJECT }
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dokter tidak ditemukan'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dokter',
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

// POST - Tambah dokter baru
exports.createDoctor = async (req, res) => {
  let connection;
  try {
    const { id_dokter, nama, spesialis, departemen } = req.body;
    
    // Validasi input
    if (!id_dokter || !nama || !spesialis || !departemen) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }
    
    if (nama.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Nama dokter minimal 3 karakter'
      });
    }
    
    connection = await db.getConnection();
    
    // Cek apakah ID sudah ada
    const checkResult = await connection.execute(
      `SELECT id_dokter FROM DOKTER WHERE id_dokter = :id`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ID Dokter sudah digunakan'
      });
    }
    
    // Insert data dokter
    await connection.execute(
      `INSERT INTO DOKTER (id_dokter, nama, spesialis, departemen) 
       VALUES (:id_dokter, :nama, :spesialis, :departemen)`,
      { id_dokter, nama, spesialis, departemen },
      { autoCommit: true }
    );
    
    res.status(201).json({
      success: true,
      message: 'Data dokter berhasil ditambahkan',
      data: { id_dokter, nama, spesialis, departemen }
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data dokter',
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

// PUT - Update dokter
exports.updateDoctor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nama, spesialis, departemen } = req.body;
    
    // Validasi input
    if (!nama || !spesialis || !departemen) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }
    
    if (nama.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Nama dokter minimal 3 karakter'
      });
    }
    
    connection = await db.getConnection();
    
    // Cek apakah dokter ada
    const checkResult = await connection.execute(
      `SELECT id_dokter FROM DOKTER WHERE id_dokter = :id`,
      [id],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dokter tidak ditemukan'
      });
    }
    
    // Update data dokter
    await connection.execute(
      `UPDATE DOKTER 
       SET nama = :nama, spesialis = :spesialis, departemen = :departemen 
       WHERE id_dokter = :id`,
      { nama, spesialis, departemen, id },
      { autoCommit: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Data dokter berhasil diupdate',
      data: { id_dokter: id, nama, spesialis, departemen }
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data dokter',
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

// DELETE - Hapus dokter
exports.deleteDoctor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await db.getConnection();
    
    // Cek apakah dokter ada
    const checkResult = await connection.execute(
      `SELECT id_dokter FROM DOKTER WHERE id_dokter = :id`,
      [id],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dokter tidak ditemukan'
      });
    }
    
    // Hapus dokter (CASCADE akan otomatis hapus relasi)
    await connection.execute(
      `DELETE FROM DOKTER WHERE id_dokter = :id`,
      [id],
      { autoCommit: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Data dokter berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    
    // Cek apakah error karena constraint
    if (error.message.includes('integrity constraint')) {
      return res.status(400).json({
        success: false,
        message: 'Dokter tidak dapat dihapus karena masih memiliki data terkait'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data dokter',
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