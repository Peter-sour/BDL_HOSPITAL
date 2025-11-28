// backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');
const { verifyToken, isPatient } = require('../middleware/authMiddleware');

router.get('/payment/qr-confirm/:id_tagihan', patientController.confirmPaymentQR);


// Semua route memerlukan autentikasi dan harus pasien
router.use(verifyToken, isPatient);

// Profile
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// Doctors
router.get('/doctors', patientController.getAllDoctors);
router.get('/doctors/:id_dokter/ratings', patientController.getDoctorRatings);

// Appointments
router.post('/appointments', patientController.createAppointment);
router.get('/appointments', patientController.getMyAppointments);
router.put('/appointments/:id_appointment/cancel', patientController.cancelAppointment);

// Medical Records
router.get('/medical-records', patientController.getMedicalRecords);

// Prescriptions
router.get('/prescriptions', patientController.getPrescriptions);
router.get('/prescriptions/:id_resep/details', patientController.getPrescriptionDetails);

// Bills & Payments
router.get('/bills', patientController.getBills);
router.post('/payments', patientController.payBill);
router.get('/payments/history', patientController.getPaymentHistory);

// Ratings
router.post('/ratings', patientController.rateDoctor);

router.get('/bills/:id_tagihan/status', patientController.checkBillStatus);

router.get('/bills/:id_tagihan/details', patientController.getBillDetails);

router.post('/rawat-inap/request', patientController.requestRawatInap);

router.get('/rawat-inap/available-rooms', patientController.getAvailableRooms);

module.exports = router;