const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');


router.get('/', medicineController.getAllMedicines);
router.get('/:id', medicineController.getMedicineById);
router.post('/', medicineController.createMedicine);
router.put('/:id', medicineController.updateMedicine);
router.delete('/:id', medicineController.deleteMedicine);
router.patch('/:id/stok', medicineController.updateStock);

module.exports = router;