const express = require('express');
const router = express.Router();

// 1. IMPORT CONTROLLER ADMIN
const adminController = require('../controller/adminController');

// 2. IMPORT CONTROLLER LAPORAN (JANGAN LUPA INI!)
const reportController = require('../controller/reportController'); 

// 3. IMPORT MIDDLEWARE
const { verifyToken } = require('../middleware/authMiddleware');

// Pasang Satpam (Wajib Login)
router.use(verifyToken);

// --- DASHBOARD ---
router.get('/dashboard-stats', adminController.getDashboardStats);

router.get('/master/doctors', adminController.getAllDoctors); // <--- TAMBAHAN
router.get('/master/available-rooms', adminController.getAvailableRooms); // <--- TAMBAHAN


// --- MANAJEMEN OBAT (CRUD) ---
router.get('/medicines', adminController.getMedicines);            
router.post('/medicines', adminController.addMedicine);            
router.put('/medicines/:id_obat', adminController.updateMedicine); 
router.delete('/medicines/:id_obat', adminController.deleteMedicine); 

// --- LAPORAN / REPORTING (INI PENYEBAB ERRORNYA TADI) ---
// Pastikan reportController sudah di-import di atas!
router.get('/reports/doctors', reportController.getDoctorReports);
router.get('/reports/departments', reportController.getDeptReports);

// ...
// Rawat Inap Management (oleh Admin)
router.get('/rawat-inap/requests', adminController.getRawatInapRequests);
router.put('/rawat-inap/:id_rawat/approve', adminController.approveRawatInap);
router.put('/rawat-inap/:id_rawat/discharge-bill', adminController.dischargeAndBill); // Pulangkan & Hitung Bill
// ...

module.exports = router;