// // config/db.js
// const oracledb = require('oracledb');
// require('dotenv').config(); // Untuk membaca file .env

// // Konfigurasi koneksi dari .env
// const dbConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   connectString: process.env.DB_CONNECT_STRING,
//   poolAlias: "default"
// };

// /**
//  * Inisialisasi pool koneksi
//  */
// async function initialize() {
//   try {
//     await oracledb.createPool(dbConfig);
//     console.log('✅ Oracle Connection Pool berhasil diinisialisasi!');
//   } catch (err) {
//     console.error('❌ Error saat inisialisasi pool koneksi Oracle:', err);
//     process.exit(1);
//   }
// }

// /**
//  * Mendapatkan koneksi dari pool
//  */
// function getConnection() {
//     return oracledb.getConnection();
// }

// /**
//  * Menutup koneksi pool
//  */
// function closePool() {
//     return oracledb.getPool().close(0);
// }

// module.exports = {
//   initialize,
//   getConnection,
//   closePool,
//   oracledb
// };

// backend/config/db.js
const oracledb = require('oracledb');
require('dotenv').config();

// Biar semua hasil query AUTO pakai format object
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  poolAlias: "default",
  poolMin: 1,
  poolMax: 5,
  poolIncrement: 1
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Oracle Pool created');
  } catch (err) {
    console.error('Error creating pool:', err);
    process.exit(1);
  }
}

async function getConnection() {
  return await oracledb.getConnection('default');
}

function closePool() {
  return oracledb.getPool('default').close(0);
}

module.exports = {
  oracledb,
  initialize,
  getConnection,
  closePool
};
