const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');

router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.get('/data/pasien', paymentController.getPasienList);
router.get('/data/resep/:id_pasien', paymentController.getResepByPasien);
router.get('/data/rawatinap/:id_pasien', paymentController.getRawatInapByPasien);

module.exports = router;