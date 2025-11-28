// backend/routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controller/doctorController');
const { verifyToken, isDoctor } = require('../middleware/authMiddleware');

// Semua route memerlukan autentikasi dan harus dokter
router.use(verifyToken, isDoctor);

// Profile
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);

// Appointments
router.get('/appointments', doctorController.getMyAppointments);
router.put('/appointments/:id_appointment/status', doctorController.updateAppointmentStatus);

// Patients
router.get('/patients', doctorController.getMyPatients);
router.get('/patients/:id_pasien/medical-records', doctorController.getPatientMedicalRecords);

// Medical Records
router.post('/medical-records', doctorController.createMedicalRecord);
router.put('/medical-records/:id_rekam', doctorController.updateMedicalRecord);

// Medicines & Prescriptions
router.get('/medicines', doctorController.getMedicines);
router.post('/prescriptions', doctorController.createPrescription);
router.get('/prescriptions', doctorController.getMyPrescriptions);

// Ratings
router.get('/ratings', doctorController.getMyRatings);

// Statistics
router.get('/statistics', doctorController.getStatistics);

router.get('/my-inpatients', doctorController.getMyInpatients);

module.exports = router;