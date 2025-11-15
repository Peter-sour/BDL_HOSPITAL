// server.js
const express = require('express');
const cors = require('cors'); // Untuk mengizinkan koneksi dari Front-End
const db = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Inisialisasi Aplikasi Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Izinkan semua domain (untuk development)
app.use(express.json()); // Parsing body JSON dari request

// Routes
app.use('/api/dashboard', dashboardRoutes);

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