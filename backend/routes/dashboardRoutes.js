const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');


router.get('/stats', dashboardController.getDashboardStats);
router.get('/reviews', dashboardController.getLatestReviews); 
router.get('/pasien/status/:idPasien', dashboardController.getStatusPasien); 
router.get('/pasien/tagihan/:idPasien', dashboardController.getTagihanPasien); 
router.get('/laporan/dokter', dashboardController.getLaporanPasien); 

module.exports = router;