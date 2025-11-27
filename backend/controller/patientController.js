// backend/controllers/patientController.js
const { oracledb, getConnection } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get Patient Profile
exports.getProfile = async (req, res) => {
  let connection;
  try {
    const id_pengguna = req.user.id_pengguna;
    
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.id_pasien AS "id_pasien",
              p.nama AS "nama",
              p.tanggal_lahir AS "tanggal_lahir",
              p.alamat AS "alamat",
              p.no_telepon AS "no_telepon",
              p.jenis_kelamin AS "jenis_kelamin",
              u.username AS "username",
              u.email AS "email"
       FROM PASIEN p
       JOIN PENGGUNA u ON p.id_pengguna = u.id_pengguna
       WHERE p.id_pengguna = :id_pengguna`,
      [id_pengguna],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan'
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

// Update Patient Profile
exports.updateProfile = async (req, res) => {
  let connection;
  try {
    const id_pengguna = req.user.id_pengguna;
    const { nama, alamat, no_telepon, jenis_kelamin } = req.body;

    connection = await getConnection();
    await connection.execute(
      `UPDATE PASIEN 
       SET nama = :nama,
           alamat = :alamat,
           no_telepon = :no_telepon,
           jenis_kelamin = :jenis_kelamin
       WHERE id_pengguna = :id_pengguna`,
      [nama, alamat, no_telepon, jenis_kelamin, id_pengguna],
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

// Get All Doctors
exports.getAllDoctors = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT id_dokter AS "id_dokter",
              nama AS "nama",
              spesialis AS "spesialis",
              departemen AS "departemen",
              jadwal_praktik AS "jadwal_praktik"
       FROM DOKTER
       ORDER BY nama`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get doctors:', error);
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

// Create Appointment
exports.createAppointment = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;
    const { id_dokter, tanggal_appointment, jam_appointment, keluhan } = req.body;

    if (!id_dokter || !tanggal_appointment || !jam_appointment || !keluhan) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    const id_appointment = 'APT' + Date.now();

    connection = await getConnection();
    await connection.execute(
      `INSERT INTO APPOINTMENT (id_appointment, id_pasien, id_dokter, tanggal_appointment, jam_appointment, keluhan, status, tanggal_buat)
       VALUES (:id_appointment, :id_pasien, :id_dokter, TO_DATE(:tanggal_appointment, 'YYYY-MM-DD'), :jam_appointment, :keluhan, 'Pending', SYSDATE)`,
      [id_appointment, id_pasien, id_dokter, tanggal_appointment, jam_appointment, keluhan],
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: 'Appointment berhasil dibuat'
    });
  } catch (error) {
    console.error('Error create appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat appointment',
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
    const id_pasien = req.user.detail_id;
    const { status } = req.query;

    let query = `SELECT a.id_appointment AS "id_appointment",
                        a.tanggal_appointment AS "tanggal_appointment",
                        a.jam_appointment AS "jam_appointment",
                        a.keluhan AS "keluhan",
                        a.status AS "status",
                        a.tanggal_buat AS "tanggal_buat",
                        d.nama AS "nama_dokter",
                        d.spesialis AS "spesialis",
                        d.departemen AS "departemen"
                 FROM APPOINTMENT a
                 JOIN DOKTER d ON a.id_dokter = d.id_dokter
                 WHERE a.id_pasien = :id_pasien`;

    const params = [id_pasien];

    if (status) {
      query += ` AND a.status = :status`;
      params.push(status);
    }

    query += ` ORDER BY a.tanggal_appointment DESC, a.jam_appointment DESC`;

    connection = await getConnection();
    const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });

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

// Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;
    const { id_appointment } = req.params;

    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE APPOINTMENT 
       SET status = 'Dibatalkan'
       WHERE id_appointment = :id_appointment AND id_pasien = :id_pasien AND status = 'Pending'`,
      [id_appointment, id_pasien],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment tidak ditemukan atau tidak dapat dibatalkan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment berhasil dibatalkan'
    });
  } catch (error) {
    console.error('Error cancel appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membatalkan appointment',
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

// Get Medical Records
exports.getMedicalRecords = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;

    connection = await getConnection();
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
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
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

// Get Prescriptions
exports.getPrescriptions = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;

    connection = await getConnection();
    const result = await connection.execute(
      `SELECT r.id_resep AS "id_resep",
              r.tanggal_resep AS "tanggal_resep",
              r.catatan AS "catatan",
              d.nama AS "nama_dokter",
              d.spesialis AS "spesialis"
       FROM RESEP r
       JOIN DOKTER d ON r.id_dokter = d.id_dokter
       WHERE r.id_pasien = :id_pasien
       ORDER BY r.tanggal_resep DESC`,
      [id_pasien],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
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

// Get Prescription Details
exports.getPrescriptionDetails = async (req, res) => {
  let connection;
  try {
    const { id_resep } = req.params;

    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ro.id_resep_obat AS "id_resep_obat",
              o.nama_obat AS "nama_obat",
              o.jenis_obat AS "jenis_obat",
              o.dosis AS "dosis",
              ro.jumlah AS "jumlah",
              ro.aturan_pakai AS "aturan_pakai",
              o.harga AS "harga",
              o.stok AS "stok"
       FROM RESEP_OBAT ro
       JOIN OBAT o ON ro.id_obat = o.id_obat
       WHERE ro.id_resep = :id_resep`,
      [id_resep],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get prescription details:', error);
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

// Get Bills
exports.getBills = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;
    const { status_tagihan } = req.query;

    let query = `SELECT id_tagihan AS "id_tagihan",
                        jenis_tagihan AS "jenis_tagihan",
                        total_tagihan AS "total_tagihan",
                        status_tagihan AS "status_tagihan",
                        tanggal_tagihan AS "tanggal_tagihan",
                        tanggal_jatuh_tempo AS "tanggal_jatuh_tempo",
                        tanggal_dibayar AS "tanggal_dibayar"
                 FROM TAGIHAN
                 WHERE id_pasien = :id_pasien`;

    const params = [id_pasien];

    if (status_tagihan) {
      query += ` AND status_tagihan = :status_tagihan`;
      params.push(status_tagihan);
    }

    query += ` ORDER BY tanggal_tagihan DESC`;

    connection = await getConnection();
    const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get bills:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tagihan',
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

// Pay Bill
exports.payBill = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;
    const { id_tagihan, jumlah_bayar, metode_bayar, nomor_referensi } = req.body;

    if (!id_tagihan || !jumlah_bayar || !metode_bayar) {
      return res.status(400).json({
        success: false,
        message: 'Data pembayaran tidak lengkap'
      });
    }

    const id_transaksi = 'TRX' + Date.now();

    connection = await getConnection();

    // Insert transaksi
    await connection.execute(
      `INSERT INTO TRANSAKSI_PEMBAYARAN (id_transaksi, id_pasien, id_tagihan, jumlah_bayar, metode_bayar, status_transaksi, nomor_referensi, tanggal_transaksi)
       VALUES (:id_transaksi, :id_pasien, :id_tagihan, :jumlah_bayar, :metode_bayar, 'Sukses', :nomor_referensi, SYSDATE)`,
      [id_transaksi, id_pasien, id_tagihan, jumlah_bayar, metode_bayar, nomor_referensi || null],
      { autoCommit: false }
    );

    // Update status tagihan
    await connection.execute(
      `UPDATE TAGIHAN 
       SET status_tagihan = 'Lunas', tanggal_dibayar = SYSDATE
       WHERE id_tagihan = :id_tagihan`,
      [id_tagihan],
      { autoCommit: false }
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Pembayaran berhasil'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rollback:', rollbackError);
      }
    }
    console.error('Error pay bill:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan pembayaran',
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

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;

    connection = await getConnection();
    const result = await connection.execute(
      `SELECT tp.id_transaksi AS "id_transaksi",
              tp.jumlah_bayar AS "jumlah_bayar",
              tp.metode_bayar AS "metode_bayar",
              tp.status_transaksi AS "status_transaksi",
              tp.nomor_referensi AS "nomor_referensi",
              tp.tanggal_transaksi AS "tanggal_transaksi",
              t.jenis_tagihan AS "jenis_tagihan"
       FROM TRANSAKSI_PEMBAYARAN tp
       LEFT JOIN TAGIHAN t ON tp.id_tagihan = t.id_tagihan
       WHERE tp.id_pasien = :id_pasien
       ORDER BY tp.tanggal_transaksi DESC`,
      [id_pasien],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error get payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat pembayaran',
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

// Rate Doctor
exports.rateDoctor = async (req, res) => {
  let connection;
  try {
    const id_pasien = req.user.detail_id;
    const { id_dokter, rating, komentar } = req.body;

    if (!id_dokter || !rating) {
      return res.status(400).json({
        success: false,
        message: 'ID dokter dan rating harus diisi'
      });
    }

    const id_rating = 'RTG' + Date.now();

    connection = await getConnection();
    await connection.execute(
      `INSERT INTO RATING_DOKTER (id_rating, id_pasien, id_dokter, rating, komentar, tanggal_rating)
       VALUES (:id_rating, :id_pasien, :id_dokter, :rating, :komentar, SYSDATE)`,
      [id_rating, id_pasien, id_dokter, rating, komentar || null],
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: 'Rating berhasil diberikan'
    });
  } catch (error) {
    console.error('Error rate doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memberikan rating',
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

// Get Doctor Ratings
exports.getDoctorRatings = async (req, res) => {
  let connection;
  try {
    const { id_dokter } = req.params;

    connection = await getConnection();
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
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Hitung rata-rata
    const avgResult = await connection.execute(
      `SELECT AVG(rating) AS "avg_rating", COUNT(*) AS "total_rating"
       FROM RATING_DOKTER
       WHERE id_dokter = :id_dokter`,
      [id_dokter],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
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
    console.error('Error get doctor ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rating dokter',
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