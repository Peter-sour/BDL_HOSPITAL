// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Endpoint untuk Dashboard Front-End
router.get('/stats', dashboardController.getDashboardStats);
router.get('/reviews', dashboardController.getLatestReviews); // Data dummy/feedback

// Endpoint untuk fitur wajib (Contoh pemanggilan Function/Procedure)
router.get('/pasien/status/:idPasien', dashboardController.getStatusPasien); // Function
router.get('/pasien/tagihan/:idPasien', dashboardController.getTagihanPasien); // Procedure
router.get('/laporan/dokter', dashboardController.getLaporanPasien); // View

module.exports = router;