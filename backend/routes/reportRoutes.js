const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController'); // Pastikan path ini benar

// ROUTE 1: GET Laporan Pasien Per Dokter
// Endpoint: /api/reports/pasien-per-dokter
router.get('/pasien-per-dokter', reportController.getLaporanPasienPerDokter);

// ROUTE 2: GET Laporan Pasien Per Departemen
// Endpoint: /api/reports/pasien-per-departemen
router.get('/pasien-per-departemen', reportController.getLaporanPasienPerDepartemen);

module.exports = router;