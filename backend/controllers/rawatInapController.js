// controllers/rawatInapController.js
const db = require('../config/db');


exports.getAllRawatInap = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = `
      SELECT 
        ri.id_rawat,
        ri.id_pasien,
        p.nama as nama_pasien,
        ri.id_kamar,
        k.nama_kamar,
        k.no_kamar,
        k.kelas_kamar,
        ri.tanggal_masuk,
        ri.tanggal_keluar,
        fn_status_pasien(ri.id_pasien) as status
      FROM RAWAT_INAP ri
      JOIN PASIEN p ON ri.id_pasien = p.id_pasien
      JOIN KAMAR k ON ri.id_kamar = k.id_kamar
      ORDER BY ri.tanggal_masuk DESC
    `;
    
    const result = await connection.execute(query, [], { outFormat: 4002 }); // 4002 = OBJECT
    
    res.json({
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

// GET data rawat inap berdasarkan ID
exports.getRawatInapById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await db.getConnection();
    
    const query = `
      SELECT 
        ri.id_rawat,
        ri.id_pasien,
        p.nama as nama_pasien,
        p.tanggal_lahir,
        p.alamat,
        ri.id_kamar,
        k.nama_kamar,
        k.no_kamar,
        k.kelas_kamar,
        ri.tanggal_masuk,
        ri.tanggal_keluar,
        fn_status_pasien(ri.id_pasien) as status
      FROM RAWAT_INAP ri
      JOIN PASIEN p ON ri.id_pasien = p.id_pasien
      JOIN KAMAR k ON ri.id_kamar = k.id_kamar
      WHERE ri.id_rawat = :id
    `;
    
    const result = await connection.execute(query, [id], { outFormat: 4002 });
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data rawat inap tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching rawat inap by id:', error);
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

// POST tambah rawat inap baru
exports.createRawatInap = async (req, res) => {
  let connection;
  try {
    const { id_pasien, id_kamar, tanggal_masuk } = req.body;
    
    // Validasi input
    if (!id_pasien || !id_kamar || !tanggal_masuk) {
      return res.status(400).json({
        success: false,
        message: 'ID Pasien, ID Kamar, dan Tanggal Masuk harus diisi'
      });
    }
    
    connection = await db.getConnection();
    
    // Cek apakah pasien sudah rawat inap (belum keluar)
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM RAWAT_INAP 
      WHERE id_pasien = :id_pasien 
      AND tanggal_keluar IS NULL
    `;
    const checkResult = await connection.execute(checkQuery, [id_pasien]);
    
    if (checkResult.rows[0][0] > 0) {
      return res.status(400).json({
        success: false,
        message: 'Pasien masih dalam status rawat inap'
      });
    }
    
    // Generate ID rawat inap baru
    const idQuery = `
      SELECT 'RI' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(id_rawat, 3))), 0) + 1, 3, '0') as new_id
      FROM RAWAT_INAP
    `;
    const idResult = await connection.execute(idQuery, [], { outFormat: 4002 });
    const newId = idResult.rows[0].NEW_ID;
    
    // Insert data rawat inap
    const insertQuery = `
      INSERT INTO RAWAT_INAP (id_rawat, id_pasien, id_kamar, tanggal_masuk)
      VALUES (:id_rawat, :id_pasien, :id_kamar, TO_DATE(:tanggal_masuk, 'YYYY-MM-DD'))
    `;
    
    await connection.execute(insertQuery, {
      id_rawat: newId,
      id_pasien,
      id_kamar,
      tanggal_masuk
    });
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Data rawat inap berhasil ditambahkan',
      data: { id_rawat: newId }
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error('Error rollback:', err);
      }
    }
    console.error('Error creating rawat inap:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data rawat inap',
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

// PUT update data rawat inap (terutama tanggal keluar)
exports.updateRawatInap = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_kamar, tanggal_keluar } = req.body;
    
    connection = await db.getConnection();
    
    // Build dynamic update query
    let updateFields = [];
    let bindParams = { id_rawat: id };
    
    if (id_kamar) {
      updateFields.push('id_kamar = :id_kamar');
      bindParams.id_kamar = id_kamar;
    }
    
    if (tanggal_keluar !== undefined) {
      if (tanggal_keluar === null || tanggal_keluar === '') {
        updateFields.push('tanggal_keluar = NULL');
      } else {
        updateFields.push("tanggal_keluar = TO_DATE(:tanggal_keluar, 'YYYY-MM-DD')");
        bindParams.tanggal_keluar = tanggal_keluar;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate'
      });
    }
    
    const updateQuery = `
      UPDATE RAWAT_INAP 
      SET ${updateFields.join(', ')}
      WHERE id_rawat = :id_rawat
    `;
    
    const result = await connection.execute(updateQuery, bindParams);
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data rawat inap tidak ditemukan'
      });
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Data rawat inap berhasil diupdate'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error('Error rollback:', err);
      }
    }
    console.error('Error updating rawat inap:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data rawat inap',
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

// DELETE hapus data rawat inap
exports.deleteRawatInap = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await db.getConnection();
    
    const deleteQuery = 'DELETE FROM RAWAT_INAP WHERE id_rawat = :id';
    const result = await connection.execute(deleteQuery, [id]);
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data rawat inap tidak ditemukan'
      });
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Data rawat inap berhasil dihapus'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error('Error rollback:', err);
      }
    }
    console.error('Error deleting rawat inap:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data rawat inap',
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

// GET search pasien untuk modal (yang belum rawat inap atau sudah keluar)
exports.searchPasienForRawatInap = async (req, res) => {
  let connection;
  try {
    const { search } = req.query;
    
    connection = await db.getConnection();
    
    let query = `
      SELECT 
        p.id_pasien,
        p.nama,
        p.tanggal_lahir,
        p.alamat,
        fn_status_pasien(p.id_pasien) as status
      FROM PASIEN p
      WHERE 1=1
    `;
    
    const bindParams = {};
    
    if (search) {
      query += ` AND (LOWER(p.nama) LIKE LOWER(:search) OR LOWER(p.id_pasien) LIKE LOWER(:search))`;
      bindParams.search = `%${search}%`;
    }
    
    query += ` ORDER BY p.nama`;
    
    const result = await connection.execute(query, bindParams, { outFormat: 4002 });
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mencari data pasien',
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

// GET daftar kamar yang tersedia
exports.getAvailableKamar = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = `
      SELECT 
        k.id_kamar,
        k.nama_kamar,
        k.no_kamar,
        k.kelas_kamar,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM RAWAT_INAP ri 
            WHERE ri.id_kamar = k.id_kamar 
            AND ri.tanggal_keluar IS NULL
          ) THEN 'Terisi'
          ELSE 'Tersedia'
        END as status_kamar
      FROM KAMAR k
      ORDER BY k.kelas_kamar, k.no_kamar
    `;
    
    const result = await connection.execute(query, [], { outFormat: 4002 });
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching available kamar:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kamar',
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