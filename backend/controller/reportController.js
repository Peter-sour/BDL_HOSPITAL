// backend/controllers/reportController.js
const db = require('../config/db');

exports.getDoctorPerformance = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT * FROM vw_laporan_pasien_per_dokter`,
      [],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.getDepartmentStats = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT * FROM vw_laporan_pasien_per_departemen`,
      [],
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

// // routes/api.js
// const reportController = require('../controllers/reportController');
// // ...
// router.get('/reports/doctors', reportController.getDoctorPerformance);
// router.get('/reports/departments', reportController.getDepartmentStats);