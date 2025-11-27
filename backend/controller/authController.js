// backend/controllers/authController.js
const { oracledb, getConnection } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'simrs-secret-key-2024';

// --- LOGIN (Support Pasien & Dokter) ---
exports.login = async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
    }

    connection = await getConnection();

    // 1. Cek Pengguna di tabel PENGGUNA
    const userResult = await connection.execute(
      `SELECT id_pengguna, username, password, email, role, status 
       FROM PENGGUNA WHERE username = :username`,
      [username],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = userResult.rows[0];

    // 2. Cek Status
    if (user.STATUS !== 'Aktif') {
      return res.status(403).json({ success: false, message: 'Akun tidak aktif' });
    }

    // 3. Verifikasi Password
    const isValid = await bcrypt.compare(password, user.PASSWORD);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    // 4. Ambil Detail (Pasien/Dokter)
    let userDetail = null;
    let detailQuery = '';

    if (user.ROLE === 'Pasien') {
      detailQuery = `SELECT id_pasien, nama, no_telepon FROM PASIEN WHERE id_pengguna = :id`;
    } else if (user.ROLE === 'Dokter') {
      detailQuery = `SELECT id_dokter, nama, spesialis FROM DOKTER WHERE id_pengguna = :id`;
    }

    if (detailQuery) {
      const detailRes = await connection.execute(detailQuery, [user.ID_PENGGUNA], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      userDetail = detailRes.rows[0];
    }

    // 5. Buat Token
    const token = jwt.sign(
      {
        id_pengguna: user.ID_PENGGUNA,
        username: user.USERNAME,
        role: user.ROLE,
        detail_id: userDetail ? (user.ROLE === 'Pasien' ? userDetail.ID_PASIEN : userDetail.ID_DOKTER) : null
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        username: user.USERNAME,
        role: user.ROLE,
        detail: userDetail
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
};

// --- REGISTER YANG SUDAH DIPERBAIKI ---
exports.register = async (req, res) => {
  let connection;
  try {
    const { 
      username, password, email, role, 
      nama, tanggal_lahir, alamat, no_telepon, jenis_kelamin,
      spesialis, jadwal_praktik 
    } = req.body;

    // 1. Validasi Dasar
    if (!username || !password || !email || !nama || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data wajib (Username, Password, Email, Nama, Role) harus diisi' 
      });
    }

    connection = await getConnection();

    // 2. Cek Username Kembar
    const check = await connection.execute(
      `SELECT COUNT(*) as count FROM PENGGUNA WHERE username = :check_user`, 
      { check_user: username }, 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (check.rows[0].COUNT > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    // 3. Hash Password & Generate ID
    const hashedPassword = await bcrypt.hash(password, 10);
    const id_pengguna = 'USR' + Date.now(); 

    // 4. Insert ke PENGGUNA
    // PERBAIKAN: Mengganti :user menjadi :val_username dan :role menjadi :val_role
    // Menggunakan Object Binding {} bukan Array [] agar lebih aman
    await connection.execute(
      `INSERT INTO PENGGUNA (id_pengguna, username, password, email, role, status, tanggal_daftar)
       VALUES (:val_id, :val_username, :val_password, :val_email, :val_role, 'Aktif', SYSDATE)`,
      {
        val_id: id_pengguna,
        val_username: username,
        val_password: hashedPassword,
        val_email: email,
        val_role: role
      },
      { autoCommit: false }
    );

    // 5. Insert ke Child Table (Sesuai Role)
    if (role === 'Pasien') {
      if (!tanggal_lahir || !alamat || !jenis_kelamin) {
         throw new Error('Data pasien (Tgl Lahir, Alamat, Gender) kurang lengkap');
      }

      const id_pasien = 'PSN' + Date.now();
      await connection.execute(
        `INSERT INTO PASIEN (id_pasien, id_pengguna, nama, tanggal_lahir, alamat, no_telepon, jenis_kelamin)
         VALUES (:val_id_pasien, :val_id_pengguna, :val_nama, TO_DATE(:val_tgl, 'YYYY-MM-DD'), :val_alamat, :val_telp, :val_jk)`,
        {
          val_id_pasien: id_pasien,
          val_id_pengguna: id_pengguna,
          val_nama: nama,
          val_tgl: tanggal_lahir,
          val_alamat: alamat,
          val_telp: no_telepon || '', // Handle null/undefined
          val_jk: jenis_kelamin
        },
        { autoCommit: false }
      );

    } else if (role === 'Dokter') {
      if (!spesialis) {
         throw new Error('Spesialis dokter harus diisi');
      }

      const id_dokter = 'DOK' + Date.now();
      const departemen = 'Rawat Jalan'; // Default
      
      await connection.execute(
        `INSERT INTO DOKTER (id_dokter, id_pengguna, nama, spesialis, departemen, no_telepon, jadwal_praktik)
         VALUES (:val_id_dokter, :val_id_pengguna, :val_nama, :val_spesialis, :val_departemen, :val_telp, :val_jadwal)`,
        {
          val_id_dokter: id_dokter,
          val_id_pengguna: id_pengguna,
          val_nama: nama,
          val_spesialis: spesialis,
          val_departemen: departemen,
          val_telp: no_telepon || '',
          val_jadwal: jadwal_praktik || '-'
        },
        { autoCommit: false }
      );
    }

    // 6. Commit Transaksi
    await connection.commit();
    res.status(201).json({ success: true, message: 'Registrasi berhasil' });

  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (e) { console.error(e); }
    }
    console.error('Register Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal registrasi', 
      error: error.message 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  let connection;
  try {
    const { oldPassword, newPassword } = req.body;
    const id_pengguna = req.user.id_pengguna;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru harus diisi'
      });
    }

    connection = await getConnection();

    // Ambil password lama
    const userResult = await connection.execute(
      `SELECT password AS "password" FROM PENGGUNA WHERE id_pengguna = :id_pengguna`,
      [id_pengguna],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, userResult.rows[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await connection.execute(
      `UPDATE PENGGUNA SET password = :password WHERE id_pengguna = :id_pengguna`,
      [hashedNewPassword, id_pengguna],
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Error change password:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah password',
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