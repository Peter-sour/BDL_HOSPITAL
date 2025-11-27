// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB initialization
const { initialize } = require('./config/db');

// Import routes
const authRoutes = require('./route/authRoutes');
const patientRoutes = require('./route/patientRoutes');
const doctorRoutes = require('./route/doctorRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIMRS API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Start server **SETELAH** koneksi Oracle siap
async function startServer() {
  try {
    await initialize();       // WAJIB!!! tanpa ini pool tidak dibuat
    console.log('Oracle pool initialized.');

    app.listen(PORT, () => {
      console.log(`🚀 SIMRS Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Gagal start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
