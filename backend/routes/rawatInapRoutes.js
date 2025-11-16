const express = require('express');
const router = express.Router();
const rawatInapController = require('../controllers/rawatInapController');

router.get('/', rawatInapController.getAllRawatInap);
router.get('/search-pasien', rawatInapController.searchPasienForRawatInap);
router.get('/kamar', rawatInapController.getAvailableKamar);
router.get('/:id', rawatInapController.getRawatInapById);
router.post('/', rawatInapController.createRawatInap);
router.put('/:id', rawatInapController.updateRawatInap);
router.delete('/:id', rawatInapController.deleteRawatInap);

module.exports = router;