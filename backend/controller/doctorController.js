// backend/controllers/doctorController.js
const db = require('../config/db');

// Get Doctor Profile
exports.getProfile = async (req, res) => {
  let connection;
  try {
    const id_pengguna = req.user.id_pengguna;

    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT d.id_dokter AS "id_dokter",
              d.nama AS "nama",
              d.spesialis AS "spesialis",
              d.departemen AS "departemen",
              d.no_telepon AS "no_telepon",
              d.jadwal_praktik AS "jadwal_praktik",
              u.username AS "username",
              u.email AS "email"
       FROM DOKTER d
       JOIN PENGGUNA u ON d.id_pengguna = u.id_pengguna
       WHERE d.id_pengguna = :id_pengguna`,
      [id_pengguna],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data dokter tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error get profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil',
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

// Update Doctor Profile
exports.updateProfile = async (req, res) => {
  let connection;
  try {
    const id_pengguna = req.user.id_pengguna;
    const { jadwal_praktik, no_telepon } = req.body;

    connection = await db.getConnection();
    await connection.execute(
      `UPDATE DOKTER 
       SET jadwal_praktik = :jadwal_praktik,
           no_telepon = :no_telepon
       WHERE id_pengguna = :id_pengguna`,
      [jadwal_praktik, no_telepon, id_pengguna],
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diupdate'
    });
  } catch (error) {
    console.error('Error update profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate profil',
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

// Get My Appointments
exports.getMyAppointments = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;
    const { status } = req.query;

    let query = `SELECT a.id_appointment AS "id_appointment",
                        a.tanggal_appointment AS "tanggal_appointment",
                        a.jam_appointment AS "jam_appointment",
                        a.keluhan AS "keluhan",
                        a.status AS "status",
                        a.tanggal_buat AS "tanggal_buat",
                        p.nama AS "nama_pasien",
                        p.tanggal_lahir AS "tanggal_lahir",
                        p.jenis_kelamin AS "jenis_kelamin",
                        p.no_telepon AS "no_telepon"
                 FROM APPOINTMENT a
                 JOIN PASIEN p ON a.id_pasien = p.id_pasien
                 WHERE a.id_dokter = :id_dokter`;

    const params = [id_dokter];

    if (status) {
      query += ` AND a.status = :status`;
      params.push(status);
    }

    query += ` ORDER BY a.tanggal_appointment DESC, a.jam_appointment DESC`;

    connection = await db.getConnection();
    const result = await connection.execute(query, params, { outFormat: db.oracledb.OUT_FORMAT_OBJECT });

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data appointment',
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

// Update Appointment Status
exports.updateAppointmentStatus = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;
    const { id_appointment } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Selesai'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    connection = await db.getConnection();
    const result = await connection.execute(
      `UPDATE APPOINTMENT 
       SET status = :status
       WHERE id_appointment = :id_appointment AND id_dokter = :id_dokter`,
      [status, id_appointment, id_dokter],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status appointment berhasil diupdate'
    });
  } catch (error) {
    console.error('Error update appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate status appointment',
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

// Get My Patients
exports.getMyPatients = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;
    const { status } = req.query; // Ambil parameter status (misal: 'Approved')

    connection = await db.getConnection();
    
    let query = `SELECT DISTINCT p.id_pasien AS "id_pasien",
                        p.nama AS "nama",
                        p.tanggal_lahir AS "tanggal_lahir",
                        p.alamat AS "alamat",
                        p.no_telepon AS "no_telepon",
                        p.jenis_kelamin AS "jenis_kelamin"
                 FROM PASIEN p
                 JOIN APPOINTMENT a ON p.id_pasien = a.id_pasien
                 WHERE a.id_dokter = :id_dokter`;
    
    const params = [id_dokter];

    // Jika ada request filter status (misal: hanya yang Approved)
    if (status) {
      query += ` AND a.status = :status`;
      params.push(status);
    }

    query += ` ORDER BY p.nama`;

    const result = await connection.execute(query, params, { outFormat: db.oracledb.OUT_FORMAT_OBJECT });

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get patients:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) { try { await connection.close(); } catch (e) {} }
  }
};

// 2. Create Medical Record (UPDATE: Auto-Finish Appointment)
exports.createMedicalRecord = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;
    const { id_pasien, diagnosa, catatan } = req.body;

    if (!id_pasien || !diagnosa) {
      return res.status(400).json({ success: false, message: 'ID pasien dan diagnosa harus diisi' });
    }

    const id_rekam = 'RM' + Date.now();
    const id_tagihan = 'TAG-' + Date.now();
    const biaya_konsultasi = 150000;

    connection = await db.getConnection();

    // A. Insert Rekam Medis
    await connection.execute(
      `INSERT INTO REKAM_MEDIS (id_rekam, id_pasien, id_dokter, diagnosa, catatan)
       VALUES (:id_rekam, :id_pasien, :id_dokter, :diagnosa, :catatan)`,
      [id_rekam, id_pasien, id_dokter, diagnosa, catatan || null],
      { autoCommit: false }
    );

    // B. Insert Tagihan Konsultasi
    await connection.execute(
      `INSERT INTO TAGIHAN (
         id_tagihan, id_pasien, jenis_tagihan, total_tagihan, 
         status_tagihan, tanggal_tagihan, tanggal_jatuh_tempo, 
         id_referensi  -- <--- KOLOM BARU
       ) VALUES (
         :id_tagihan, :id_pasien, 'Konsultasi', :total, 
         'Belum Bayar', SYSDATE, SYSDATE + 3,
         :id_rekam     -- <--- DISIMPAN DISINI
       )`,
      {
        id_tagihan: id_tagihan,
        id_pasien: id_pasien,
        total: biaya_konsultasi,
        id_rekam: id_rekam // Masukkan ID Rekam Medis
      },
      { autoCommit: false }
    );

    // C. UPDATE STATUS APPOINTMENT JADI 'SELESAI' (Otomatis Hilang dari Dropdown)
    // Cari appointment yang statusnya 'Approved' milik pasien & dokter ini, lalu ubah jadi 'Selesai'
    await connection.execute(
      `UPDATE APPOINTMENT 
       SET status = 'Selesai'
       WHERE id_pasien = :id_pasien 
       AND id_dokter = :id_dokter 
       AND status = 'Approved'`,
      [id_pasien, id_dokter],
      { autoCommit: false }
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Pemeriksaan selesai, data tersimpan, dan antrian diperbarui.',
      data: { id_rekam }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error create medical record:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

// Get Patient Medical Records
exports.getPatientMedicalRecords = async (req, res) => {
  let connection;
  try {
    const { id_pasien } = req.params;

    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT rm.id_rekam AS "id_rekam",
              rm.diagnosa AS "diagnosa",
              rm.catatan AS "catatan",
              d.nama AS "nama_dokter",
              d.spesialis AS "spesialis"
       FROM REKAM_MEDIS rm
       JOIN DOKTER d ON rm.id_dokter = d.id_dokter
       WHERE rm.id_pasien = :id_pasien
       ORDER BY rm.id_rekam DESC`,
      [id_pasien],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rekam medis',
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

// Update Medical Record
exports.updateMedicalRecord = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;
    const { id_rekam } = req.params;
    const { diagnosa, catatan } = req.body;

    connection = await db.getConnection();
    const result = await connection.execute(
      `UPDATE REKAM_MEDIS 
       SET diagnosa = :diagnosa,
           catatan = :catatan
       WHERE id_rekam = :id_rekam AND id_dokter = :id_dokter`,
      [diagnosa, catatan, id_rekam, id_dokter],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rekam medis tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rekam medis berhasil diupdate'
    });
  } catch (error) {
    console.error('Error update medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate rekam medis',
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

// Get Available Medicines
exports.getMedicines = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT id_obat AS "id_obat",
              nama_obat AS "nama_obat",
              jenis_obat AS "jenis_obat",
              dosis AS "dosis",
              stok AS "stok",
              harga AS "harga"
       FROM OBAT
       WHERE stok > 0
       ORDER BY nama_obat`,
      [],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get medicines:', error);
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

// backend/controllers/doctorController.js
// backend/controllers/doctorController.js

exports.createPrescription = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;
    const { id_pasien, catatan, obat_list } = req.body;

    // 1. Validasi Input
    if (!id_pasien || !obat_list || obat_list.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID pasien dan daftar obat harus diisi' 
      });
    }

    // 2. Generate ID (Format Pendek agar muat di VARCHAR2(20))
    const id_resep = 'RSP' + Date.now();
    const id_tagihan = 'INV-' + Date.now(); // Contoh: INV-173272... (Total 17 digit, Aman)
    let total_harga_obat = 0;

    connection = await db.getConnection();

    // 3. Insert Header Resep
    await connection.execute(
      `INSERT INTO RESEP (id_resep, tanggal_resep, catatan, id_dokter, id_pasien)
       VALUES (:id_resep, SYSDATE, :catatan, :id_dokter, :id_pasien)`,
      [id_resep, catatan || null, id_dokter, id_pasien],
      { autoCommit: false }
    );

    // 4. Loop Obat (Simpan Detail & Hitung Harga)
    for (let i = 0; i < obat_list.length; i++) {
      const obat = obat_list[i];
      const id_resep_obat = 'RO' + Date.now() + i;

      // Ambil Harga Obat untuk Billing (Stok dicek oleh Trigger)
      const infoObat = await connection.execute(
        `SELECT harga FROM OBAT WHERE id_obat = :id_obat`,
        [obat.id_obat],
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      if (infoObat.rows.length === 0) {
        throw new Error(`Obat dengan ID ${obat.id_obat} tidak ditemukan`);
      }

      // Hitung Total Biaya
      const harga_satuan = infoObat.rows[0].HARGA;
      total_harga_obat += harga_satuan * obat.jumlah;

      // Insert Detail Resep
      // (PENTING: Trigger 'trg_kurangi_stok_obat' akan jalan di sini buat kurangi stok)
      await connection.execute(
        `INSERT INTO RESEP_OBAT (id_resep_obat, id_resep, id_obat, jumlah, aturan_pakai)
         VALUES (:id_resep_obat, :id_resep, :id_obat, :jumlah, :aturan_pakai)`,
        [id_resep_obat, id_resep, obat.id_obat, obat.jumlah, obat.aturan_pakai],
        { autoCommit: false }
      );
    }

    // 5. Insert Tagihan (Auto Billing)
    if (total_harga_obat > 0) {
      await connection.execute(
        `INSERT INTO TAGIHAN (
           id_tagihan, id_pasien, jenis_tagihan, total_tagihan, 
           status_tagihan, tanggal_tagihan, tanggal_jatuh_tempo,
           id_referensi -- <--- KOLOM BARU
         ) VALUES (
           :id_tagihan, :id_pasien, 'Obat', :total, 
           'Belum Bayar', SYSDATE, SYSDATE + 3,
           :id_resep    -- <--- DISIMPAN DISINI
         )`,
        {
          id_tagihan: id_tagihan,
          id_pasien: id_pasien,
          total: total_harga_obat,
          id_resep: id_resep // Masukkan ID Resep
        },
        { autoCommit: false }
      );
    }

    // 6. Commit Transaksi (Simpan Semuanya)
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Resep berhasil dibuat & Tagihan diterbitkan',
      data: { id_resep, id_tagihan, total_biaya: total_harga_obat }
    });

  } catch (error) {
    // Jika ada error, batalkan semua perubahan
    if (connection) {
      try { await connection.rollback(); } catch (e) { console.error(e); }
    }

    // Tangkap Pesan Error dari Trigger Oracle (Stok Habis)
    let msg = error.message;
    if (msg.includes('ORA-20003')) {
      msg = 'Gagal: Stok obat di gudang tidak mencukupi!';
    } else if (msg.includes('ORA-20004')) {
      msg = 'Gagal: Data obat tidak ditemukan!';
    }

    console.error('Error create prescription:', error);
    res.status(500).json({ 
      success: false, 
      message: msg, 
      error: error.message 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
};
// Get My Prescriptions
exports.getMyPrescriptions = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;

    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT r.id_resep AS "id_resep",
              r.tanggal_resep AS "tanggal_resep",
              r.catatan AS "catatan",
              p.nama AS "nama_pasien"
       FROM RESEP r
       JOIN PASIEN p ON r.id_pasien = p.id_pasien
       WHERE r.id_dokter = :id_dokter
       ORDER BY r.tanggal_resep DESC`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get prescriptions:', error);
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

// Get My Ratings
exports.getMyRatings = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;

    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT rd.rating AS "rating",
              rd.komentar AS "komentar",
              rd.tanggal_rating AS "tanggal_rating",
              p.nama AS "nama_pasien"
       FROM RATING_DOKTER rd
       JOIN PASIEN p ON rd.id_pasien = p.id_pasien
       WHERE rd.id_dokter = :id_dokter
       ORDER BY rd.tanggal_rating DESC`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    // Hitung rata-rata
    const avgResult = await connection.execute(
      `SELECT AVG(rating) AS "avg_rating", COUNT(*) AS "total_rating"
       FROM RATING_DOKTER
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: {
        ratings: result.rows,
        average: avgResult.rows[0].avg_rating || 0,
        total: avgResult.rows[0].total_rating || 0
      }
    });
  } catch (error) {
    console.error('Error get ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rating',
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

// Get Doctor Statistics
exports.getStatistics = async (req, res) => {
  let connection;
  try {
    const id_dokter = req.user.detail_id;

    connection = await db.getConnection();

    // Total pasien
    const pasienResult = await connection.execute(
      `SELECT COUNT(DISTINCT id_pasien) AS "total_pasien"
       FROM APPOINTMENT
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    // Total appointment
    const appointmentResult = await connection.execute(
      `SELECT COUNT(*) AS "total_appointment"
       FROM APPOINTMENT
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    // Total rekam medis
    const rekamResult = await connection.execute(
      `SELECT COUNT(*) AS "total_rekam"
       FROM REKAM_MEDIS
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    // Total resep
    const resepResult = await connection.execute(
      `SELECT COUNT(*) AS "total_resep"
       FROM RESEP
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    // Rating rata-rata
    const ratingResult = await connection.execute(
      `SELECT AVG(rating) AS "avg_rating"
       FROM RATING_DOKTER
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: {
        total_pasien: pasienResult.rows[0].total_pasien || 0,
        total_appointment: appointmentResult.rows[0].total_appointment || 0,
        total_rekam: rekamResult.rows[0].total_rekam || 0,
        total_resep: resepResult.rows[0].total_resep || 0,
        avg_rating: ratingResult.rows[0].avg_rating || 0
      }
    });
  } catch (error) {
    console.error('Error get statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik',
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