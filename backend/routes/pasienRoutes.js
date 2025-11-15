// routes/pasienRoutes.js
const express = require('express');
const router = express.Router();
const pasienController = require('../controllers/pasienController');

router.get('/', pasienController.getAllPasien);
router.get('/:idPasien', pasienController.getPasienDetail);
// router.get('/:idPasien/rekam-medis', pasienController.getRekamMedis);
router.post('/', pasienController.createPasien);
router.put('/:idPasien', pasienController.updatePasien); 
router.delete('/:idPasien', pasienController.deletePasien);

module.exports = router;