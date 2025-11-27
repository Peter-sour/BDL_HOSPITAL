// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'simrs-secret-key-2024';

// Verify JWT Token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah expired',
      error: error.message
    });
  }
};

// Check if user is Patient
exports.isPatient = (req, res, next) => {
  if (req.user.role !== 'Pasien') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya untuk pasien.'
    });
  }
  next();
};

// Check if user is Doctor
exports.isDoctor = (req, res, next) => {
  if (req.user.role !== 'Dokter') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya untuk dokter.'
    });
  }
  next();
};

// Check if user is Admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya untuk admin.'
    });
  }
  next();
};