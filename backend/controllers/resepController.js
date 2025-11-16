// controllers/resepController.js
const db = require('../config/db');

// GET semua resep dengan detail lengkap (JOIN dengan pasien, dokter, obat)
exports.getAllResep = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = `
      SELECT 
        r.id_resep,
        r.tanggal_resep,
        r.catatan,
        p.id_pasien,
        p.nama AS nama_pasien,
        d.id_dokter,
        d.nama AS nama_dokter,
        d.spesialis,
        LISTAGG(o.nama_obat, ', ') WITHIN GROUP (ORDER BY o.nama_obat) AS daftar_obat,
        COUNT(ro.id_obat) AS jumlah_jenis_obat
      FROM RESEP r
      INNER JOIN PASIEN p ON r.id_pasien = p.id_pasien
      INNER JOIN DOKTER d ON r.id_dokter = d.id_dokter
      LEFT JOIN RESEP_OBAT ro ON r.id_resep = ro.id_resep
      LEFT JOIN OBAT o ON ro.id_obat = o.id_obat
      GROUP BY r.id_resep, r.tanggal_resep, r.catatan, 
               p.id_pasien, p.nama, d.id_dokter, d.nama, d.spesialis
      ORDER BY r.tanggal_resep DESC
    `;
    
    const result = await connection.execute(query, [], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    
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

// GET resep by ID dengan detail obat
exports.getResepById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await db.getConnection();
    
    // Query data resep utama
    const resepQuery = `
      SELECT 
        r.id_resep,
        r.tanggal_resep,
        r.catatan,
        r.id_pasien,
        p.nama AS nama_pasien,
        p.tanggal_lahir,
        p.alamat,
        r.id_dokter,
        d.nama AS nama_dokter,
        d.spesialis,
        d.departemen
      FROM RESEP r
      INNER JOIN PASIEN p ON r.id_pasien = p.id_pasien
      INNER JOIN DOKTER d ON r.id_dokter = d.id_dokter
      WHERE r.id_resep = :id
    `;
    
    // Query detail obat
    const obatQuery = `
      SELECT 
        ro.id_resep_obat,
        ro.id_obat,
        o.nama_obat,
        o.jenis_obat,
        o.dosis,
        ro.jumlah,
        ro.aturan_pakai,
        o.harga,
        (ro.jumlah * o.harga) AS subtotal
      FROM RESEP_OBAT ro
      INNER JOIN OBAT o ON ro.id_obat = o.id_obat
      WHERE ro.id_resep = :id
    `;
    
    const resepResult = await connection.execute(resepQuery, [id], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    const obatResult = await connection.execute(obatQuery, [id], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    
    if (resepResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resep tidak ditemukan'
      });
    }
    
    const resepData = {
      ...resepResult.rows[0],
      daftar_obat: obatResult.rows,
      total_harga: obatResult.rows.reduce((sum, item) => sum + (item.SUBTOTAL || 0), 0)
    };
    
    res.status(200).json({
      success: true,
      data: resepData
    });
  } catch (error) {
    console.error('Error fetching resep by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail resep',
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

// POST - Tambah resep baru
exports.createResep = async (req, res) => {
  let connection;
  try {
    const { id_pasien, id_dokter, tanggal_resep, catatan, daftar_obat } = req.body;
    
    // Validasi input
    if (!id_pasien || !id_dokter || !tanggal_resep || !daftar_obat || daftar_obat.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap'
      });
    }
    
    connection = await db.getConnection();
    
    // Generate ID Resep
    const idQuery = `SELECT 'RS' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(id_resep, 3))), 0) + 1, 3, '0') AS new_id FROM RESEP`;
    const idResult = await connection.execute(idQuery, [], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    const id_resep = idResult.rows[0].NEW_ID;
    
    // Insert resep
    const insertResepQuery = `
      INSERT INTO RESEP (id_resep, tanggal_resep, catatan, id_dokter, id_pasien)
      VALUES (:id_resep, TO_DATE(:tanggal_resep, 'YYYY-MM-DD'), :catatan, :id_dokter, :id_pasien)
    `;
    
    await connection.execute(insertResepQuery, {
      id_resep,
      tanggal_resep,
      catatan: catatan || null,
      id_dokter,
      id_pasien
    });
    
    // Insert resep_obat
    for (let i = 0; i < daftar_obat.length; i++) {
      const obat = daftar_obat[i];
      const id_resep_obat = `RO${id_resep.substring(2)}${String(i + 1).padStart(2, '0')}`;
      
      const insertObatQuery = `
        INSERT INTO RESEP_OBAT (id_resep_obat, id_resep, id_obat, jumlah, aturan_pakai)
        VALUES (:id_resep_obat, :id_resep, :id_obat, :jumlah, :aturan_pakai)
      `;
      
      await connection.execute(insertObatQuery, {
        id_resep_obat,
        id_resep,
        id_obat: obat.id_obat,
        jumlah: obat.jumlah,
        aturan_pakai: obat.aturan_pakai
      });
      
      // Update stok obat
      const updateStokQuery = `
        UPDATE OBAT SET stok = stok - :jumlah WHERE id_obat = :id_obat
      `;
      await connection.execute(updateStokQuery, {
        jumlah: obat.jumlah,
        id_obat: obat.id_obat
      });
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Resep berhasil ditambahkan',
      data: { id_resep }
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error('Error rolling back:', err);
      }
    }
    console.error('Error creating resep:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan resep',
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

// PUT - Update resep
exports.updateResep = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_pasien, id_dokter, tanggal_resep, catatan, daftar_obat } = req.body;
    
    connection = await db.getConnection();
    
    // Update resep utama
    const updateResepQuery = `
      UPDATE RESEP 
      SET tanggal_resep = TO_DATE(:tanggal_resep, 'YYYY-MM-DD'),
          catatan = :catatan,
          id_dokter = :id_dokter,
          id_pasien = :id_pasien
      WHERE id_resep = :id_resep
    `;
    
    await connection.execute(updateResepQuery, {
      tanggal_resep,
      catatan: catatan || null,
      id_dokter,
      id_pasien,
      id_resep: id
    });
    
    // Hapus resep_obat lama
    await connection.execute('DELETE FROM RESEP_OBAT WHERE id_resep = :id', [id]);
    
    // Insert resep_obat baru
    if (daftar_obat && daftar_obat.length > 0) {
      for (let i = 0; i < daftar_obat.length; i++) {
        const obat = daftar_obat[i];
        const id_resep_obat = `RO${id.substring(2)}${String(i + 1).padStart(2, '0')}`;
        
        const insertObatQuery = `
          INSERT INTO RESEP_OBAT (id_resep_obat, id_resep, id_obat, jumlah, aturan_pakai)
          VALUES (:id_resep_obat, :id_resep, :id_obat, :jumlah, :aturan_pakai)
        `;
        
        await connection.execute(insertObatQuery, {
          id_resep_obat,
          id_resep: id,
          id_obat: obat.id_obat,
          jumlah: obat.jumlah,
          aturan_pakai: obat.aturan_pakai
        });
      }
    }
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Resep berhasil diupdate'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error('Error rolling back:', err);
      }
    }
    console.error('Error updating resep:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate resep',
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

// DELETE resep
exports.deleteResep = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await db.getConnection();
    
    const deleteQuery = 'DELETE FROM RESEP WHERE id_resep = :id';
    const result = await connection.execute(deleteQuery, [id]);
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resep tidak ditemukan'
      });
    }
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Resep berhasil dihapus'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error('Error rolling back:', err);
      }
    }
    console.error('Error deleting resep:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus resep',
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

// GET list pasien untuk dropdown
exports.getPasienList = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = 'SELECT id_pasien, nama FROM PASIEN ORDER BY nama';
    const result = await connection.execute(query, [], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching pasien list:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pasien',
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

// GET list dokter untuk dropdown
exports.getDokterList = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = 'SELECT id_dokter, nama, spesialis FROM DOKTER ORDER BY nama';
    const result = await connection.execute(query, [], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching dokter list:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar dokter',
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

// GET list obat untuk dropdown
exports.getObatList = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const query = `
      SELECT id_obat, nama_obat, jenis_obat, dosis, stok, harga 
      FROM OBAT 
      WHERE stok > 0
      ORDER BY nama_obat
    `;
    const result = await connection.execute(query, [], { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching obat list:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar obat',
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