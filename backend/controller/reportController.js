// backend/controllers/reportController.js
const { oracledb, getConnection } = require('../config/db');

exports.getDoctorReports = async (req, res) => { // Pastikan nama fungsi ini SAMA persis
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM vw_laporan_pasien_per_dokter`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
  finally { if(connection) await connection.close(); }
};

exports.getDeptReports = async (req, res) => { // Pastikan nama fungsi ini SAMA persis
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM vw_laporan_pasien_per_departemen`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
  finally { if(connection) await connection.close(); }
};