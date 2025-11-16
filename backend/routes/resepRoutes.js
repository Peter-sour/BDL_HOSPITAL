const express = require('express');
const router = express.Router();
const resepController = require('../controllers/resepController');

router.get('/', resepController.getAllResep);
router.get('/:id', resepController.getResepById);
router.post('/', resepController.createResep);
router.put('/:id', resepController.updateResep);
router.delete('/:id', resepController.deleteResep);
router.get('/dropdown/pasien', resepController.getPasienList);
router.get('/dropdown/dokter', resepController.getDokterList);
router.get('/dropdown/obat', resepController.getObatList);

module.exports = router;