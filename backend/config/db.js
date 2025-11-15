// config/db.js
const oracledb = require('oracledb');
require('dotenv').config(); // Untuk membaca file .env

// Konfigurasi koneksi dari .env
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

/**
 * Inisialisasi pool koneksi
 */
async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Oracle Connection Pool berhasil diinisialisasi!');
  } catch (err) {
    console.error('❌ Error saat inisialisasi pool koneksi Oracle:', err);
    process.exit(1);
  }
}

/**
 * Mendapatkan koneksi dari pool
 */
function getConnection() {
    return oracledb.getConnection();
}

/**
 * Menutup koneksi pool
 */
function closePool() {
    return oracledb.getPool().close(0);
}

module.exports = {
  initialize,
  getConnection,
  closePool,
  oracledb
};