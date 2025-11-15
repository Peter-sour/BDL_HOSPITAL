const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/pasien', billingController.getPasienForBilling);
router.get('/detail/:idPasien', billingController.getDetailTagihan);
router.post('/hitung', billingController.hitungTagihan);

module.exports = router;