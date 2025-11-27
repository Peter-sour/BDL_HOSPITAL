const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;