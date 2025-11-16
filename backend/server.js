// server.js
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Import routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const pasienRoutes = require('./routes/pasienRoutes');
const billingRoutes = require('./routes/billingRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const rawatInapRoutes = require('./routes/rawatInapRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const resepRoutes = require('./routes/resepRoutes');
const paymentRoutes = require('./routes/PaymentRoutes');

// Inisialisasi Aplikasi Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Izinkan semua domain (untuk development)
app.use(express.json()); // Parsing body JSON dari request

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pasien', pasienRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/rawat-inap', rawatInapRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/resep', resepRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hospital Management API is running',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Mulai Server
db.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`Akses API contoh: http://localhost:${PORT}/api/dashboard/stats`);
    });
  })
  .catch(err => {
    console.error('Gagal memulai server karena error koneksi DB:', err);
    process.exit(1);
  });

// Handle penutupan server
process.on('SIGINT', async () => {
  console.log('\nServer dimatikan, menutup koneksi pool Oracle...');
  await db.closePool();
  process.exit(0);
});