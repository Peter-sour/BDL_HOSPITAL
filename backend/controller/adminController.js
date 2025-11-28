const { oracledb, getConnection } = require('../config/db');

// 1. Get All Medicines (Lihat Semua Obat)
// 1. Get All Medicines (FIX: Pakai Alias Huruf Kecil)
exports.getMedicines = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // KITA UBAH QUERYNYA: Jangan pakai SELECT *, tapi sebutkan satu-satu pakai alias
    const result = await connection.execute(
      `SELECT 
         id_obat AS "id_obat",
         nama_obat AS "nama_obat",
         jenis_obat AS "jenis_obat",
         dosis AS "dosis",
         stok AS "stok",
         harga AS "harga"
       FROM OBAT 
       ORDER BY nama_obat ASC`, 
      [], 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  } finally { 
    if(connection) await connection.close(); 
  }
};

// 2. Add Medicine (Tambah Obat Baru)
exports.addMedicine = async (req, res) => {
  let connection;
  try {
    const { nama_obat, jenis_obat, dosis, stok, harga } = req.body;
    
    // Generate ID Unik
    const id_obat = 'OBT' + Date.now(); 

    connection = await getConnection();
    await connection.execute(
      `INSERT INTO OBAT (id_obat, nama_obat, jenis_obat, dosis, stok, harga) 
       VALUES (:id, :nm, :jns, :dos, :stk, :hrg)`,
      [id_obat, nama_obat, jenis_obat, dosis, stok, harga], 
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Obat berhasil ditambahkan' });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Gagal menambah obat. ' + err.message }); 
  } finally { 
    if(connection) await connection.close(); 
  }
};

// 3. Update Medicine (Edit Data, Stok, Harga)
exports.updateMedicine = async (req, res) => {
  let connection;
  try {
    const { id_obat } = req.params;
    const { nama_obat, jenis_obat, dosis, stok, harga } = req.body;
    
    connection = await getConnection();
    
    // Query Update
    // Jika stok < 0, Trigger Oracle 'trg_kontrol_stok_obat' akan melempar error ORA-20001
    await connection.execute(
      `UPDATE OBAT SET 
         nama_obat = :nm, 
         jenis_obat = :jns, 
         dosis = :dos, 
         stok = :stk, 
         harga = :hrg 
       WHERE id_obat = :id`,
      [nama_obat, jenis_obat, dosis, stok, harga, id_obat], 
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Data obat berhasil diperbarui' });
  } catch (err) { 
    // Tangkap Error ORA-20001 dari Trigger Database
    let msg = err.message;
    if (msg.includes('ORA-20001')) {
        msg = 'Gagal: Stok obat tidak boleh kurang dari 0 (Ditolak Database)';
    }
    res.status(500).json({ message: msg }); 
  } finally { 
    if(connection) await connection.close(); 
  }
};

// 4. Delete Medicine (Hapus Obat)
exports.deleteMedicine = async (req, res) => {
  let connection;
  try {
    const { id_obat } = req.params;
    connection = await getConnection();
    await connection.execute(`DELETE FROM OBAT WHERE id_obat=:id`, [id_obat], { autoCommit: true });
    res.json({ success: true, message: 'Obat berhasil dihapus' });
  } catch (err) { 
    // Handle error jika obat sudah pernah dipakai di resep/transaksi (Foreign Key)
    if(err.message.includes('integrity constraint')) {
        res.status(400).json({ message: 'Gagal: Obat ini sudah pernah digunakan dalam transaksi dan tidak bisa dihapus.' });
    } else {
        res.status(500).json({ message: err.message }); 
    }
  } finally { 
    if(connection) await connection.close(); 
  }
};

// 5. Dashboard Stats (Ringkasan Data untuk Admin)
// 5. Dashboard Stats (Ringkasan + Stok Menipis)
exports.getDashboardStats = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    // Query 1: Hitung Statistik Total
    const statsResult = await connection.execute(
      `SELECT 
        (SELECT COUNT(*) FROM PASIEN) AS "total_pasien",
        (SELECT COUNT(*) FROM DOKTER) AS "total_dokter",
        (SELECT COUNT(*) FROM OBAT) AS "total_obat",
        (SELECT COUNT(*) FROM TRANSAKSI_PEMBAYARAN) AS "total_transaksi"
       FROM DUAL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Query 2: Ambil Obat yang Stoknya < 10 (Peringatan)
    const lowStockResult = await connection.execute(
      `SELECT 
         id_obat AS "id_obat",
         nama_obat AS "nama_obat",
         stok AS "stok",
         jenis_obat AS "jenis_obat"
       FROM OBAT 
       WHERE stok < 10 
       ORDER BY stok ASC`, // Urutkan dari yang paling sedikit
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({ 
      success: true, 
      data: {
        counts: statsResult.rows[0],
        lowStock: lowStockResult.rows // Kirim list obat tipis ke frontend
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};
exports.getDoctorReports = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM vw_laporan_pasien_per_dokter`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
  finally { if(connection) await connection.close(); }
};

exports.getDeptReports = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM vw_laporan_pasien_per_departemen`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ message: err.message }); }
  finally { if(connection) await connection.close(); }
};
// 6. Get All Rawat Inap Requests (Untuk Admin)
exports.getRawatInapRequests = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 
          RI.ID_RAWAT,
          RI.TANGGAL_MASUK,
          RI.TANGGAL_KELUAR,
          RI.STATUS,           -- <--- SEKARANG ADA
          RI.KELUHAN,          -- <--- SEKARANG ADA
          P.NAMA AS NAMA_PASIEN, 
          K.NAMA_KAMAR,
          K.KELAS_KAMAR
       FROM RAWAT_INAP RI
       LEFT JOIN PASIEN P ON RI.ID_PASIEN = P.ID_PASIEN 
       LEFT JOIN KAMAR K ON RI.ID_KAMAR = K.ID_KAMAR 
       ORDER BY RI.TANGGAL_MASUK DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('FINAL RI REQUEST CRASH LOG:', error);
    res.status(500).json({ success: false, message: 'Server crash saat memuat data Rawat Inap.' });
  } finally { 
    if (connection) await connection.close(); 
  }
};

// 7. Approve / Admit Rawat Inap (Admin Approve)
exports.approveRawatInap = async (req, res) => {
  let connection;
  try {
    const { id_rawat } = req.params;
    const { id_dokter_penanggung } = req.body; // Admin menunjuk Dokter Penanggung Jawab
    
    connection = await getConnection();
    
    await connection.execute(
      `UPDATE RAWAT_INAP SET status = 'Inap', id_dokter = :id_dokter WHERE id_rawat = :id AND status = 'Pending'`,
      [id_dokter_penanggung, id_rawat],
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Rawat Inap disetujui' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally { if (connection) await connection.close(); }
};

// 8. Discharge & Generate Bill (Admin Pulangkan Pasien)
const ROOM_RATES = {
    'VIP': 500000,
    'Kelas 1': 300000,
    'Kelas 2': 200000,
    'Kelas 3': 100000,
};

// 8. Discharge & Generate Bill (PINDAH LOGIKA KALKULASI KE NODE.JS)
exports.dischargeAndBill = async (req, res) => {
  let connection;
  try {
    const { id_rawat } = req.params;
    let total_tagihan = 0;
    const dischargeDate = new Date(); 

    connection = await getConnection();

    // 1. Ambil Detail RI Aktif, Kamar, dan ID Resep
    const riDataRes = await connection.execute(
        `SELECT ri.id_pasien AS "ID_PASIEN", ri.id_resep AS "ID_RESEP", ri.tanggal_masuk AS "TANGGAL_MASUK", k.kelas_kamar AS "KELAS_KAMAR"
         FROM RAWAT_INAP ri 
         JOIN KAMAR k ON ri.id_kamar = k.id_kamar
         WHERE RI.ID_RAWAT = :id AND RI.STATUS = 'Inap'`,
        [id_rawat], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (riDataRes.rows.length === 0) {
       return res.status(404).json({ success: false, message: 'Rawat Inap tidak ditemukan atau sudah selesai.' });
    }
    
    const riData = riDataRes.rows[0];
    const patientId = riData.ID_PASIEN;
    const masukDate = riData.TANGGAL_MASUK; 
    const kelasKamar = riData.KELAS_KAMAR;
    const resepId = riData.ID_RESEP;

    // --- KALKULASI BIAYA (LOGIKA JS) ---
    const ROOM_RATES = { 'VIP': 500000, 'Kelas 1': 300000, 'Kelas 2': 200000, 'Kelas 3': 100000 };
    const durationMs = dischargeDate.getTime() - masukDate.getTime();
    let daysStayed = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    if (daysStayed === 0) daysStayed = 1;

    const rate = ROOM_RATES[kelasKamar] || 0;
    const roomCost = rate * daysStayed;
    total_tagihan += roomCost;

    if (resepId) {
        const obatRes = await connection.execute(
            `SELECT NVL(SUM(O.HARGA * RO.JUMLAH), 0) AS TOTAL_OBAT FROM RESEP_OBAT RO JOIN OBAT O ON RO.ID_OBAT = O.ID_OBAT WHERE RO.ID_RESEP = :resep_id`,
            [resepId], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        total_tagihan += obatRes.rows[0].TOTAL_OBAT;
    }


    // --- 1. UPDATE RI STATUS & TANGGAL KELUAR (DISCHARGE) ---
    await connection.execute(
      `UPDATE RAWAT_INAP SET tanggal_keluar = SYSDATE, status = 'Selesai' WHERE id_rawat = :id AND status = 'Inap'`,
      [id_rawat],
      { autoCommit: false }
    );
    
    // --- 2. BUAT TAGIHAN AKHIR (TAGIHAN) ---
    // FIX PENTING: Status di-set 'Belum Bayar' dan TANGGAL_DIBAYAR DIHILANGKAN
    const id_tagihan = 'INV-RI-' + Date.now();
    await connection.execute(
        `INSERT INTO TAGIHAN (id_tagihan, id_pasien, jenis_tagihan, total_tagihan, status_tagihan, tanggal_tagihan, id_rawat)
         VALUES (:id_tagihan, :id_pasien, 'Rawat Inap', :total, 'Belum Bayar', SYSDATE, :id_ri)`,
        { id_tagihan, id_pasien: patientId, total: total_tagihan, id_ri: id_rawat },
        { autoCommit: false }
    );
    
    // --- (CATATAN: INSERT TRANSAKSI_PEMBAYARAN DIHAPUS DARI SINI) ---
    // Transaksi pembayaran akan dibuat nanti oleh patientAPI.payBill

    await connection.commit();
    res.json({ success: true, message: `Pasien dipulangkan. Tagihan Rawat Inap Rp ${total_tagihan.toLocaleString('id-ID')} diterbitkan. Pasien dapat melihat tagihan ini di menu 'Belum Bayar'.` });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error discharge and bill:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally { 
      if (connection) await connection.close(); 
  }
};

exports.getAllDoctors = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT id_dokter AS "id_dokter", nama AS "nama", spesialis AS "spesialis" FROM DOKTER ORDER BY nama`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { 
    console.error('Error Admin fetching doctors:', error);
    res.status(500).json({ message: 'Gagal mengambil data dokter' }); 
  }
  finally { if (connection) await connection.close(); }
};


// 2. Get Available Rooms (Master Data)
exports.getAvailableRooms = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        // Menggunakan NOT EXISTS query yang sudah teruji
        const result = await connection.execute(
            `SELECT k.id_kamar AS "id_kamar", 
                    k.nama_kamar AS "nama_kamar", 
                    k.kelas_kamar AS "kelas_kamar"
             FROM KAMAR k
             WHERE NOT EXISTS (
                 SELECT 1 
                 FROM RAWAT_INAP ri 
                 WHERE ri.id_kamar = k.id_kamar 
                   AND ri.tanggal_keluar IS NULL
             )
             ORDER BY k.kelas_kamar, k.nama_kamar`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error fetching available rooms:", error);
        res.status(500).json({ message: 'Gagal mengambil data kamar' });
    } finally {
        if (connection) await connection.close();
    }
};