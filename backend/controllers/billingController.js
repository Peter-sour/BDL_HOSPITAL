// controllers/billingController.js
const db = require('../config/db');

// Get daftar pasien untuk pencarian
exports.getPasienForBilling = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const result = await connection.execute(
      `SELECT 
        p.ID_PASIEN,
        p.NAMA,
        TRUNC(MONTHS_BETWEEN(SYSDATE, p.TANGGAL_LAHIR) / 12) AS USIA,
        CASE 
          WHEN EXISTS (SELECT 1 FROM RAWAT_INAP ri WHERE ri.ID_PASIEN = p.ID_PASIEN AND ri.TANGGAL_KELUAR IS NULL)
          THEN 'Rawat Inap'
          ELSE 'Rawat Jalan'
        END AS STATUS,
        (SELECT ri.ID_RAWAT FROM RAWAT_INAP ri WHERE ri.ID_PASIEN = p.ID_PASIEN AND ri.TANGGAL_KELUAR IS NULL AND ROWNUM = 1) AS ID_RAWAT,
        (SELECT r.ID_RESEP FROM RESEP r WHERE r.ID_PASIEN = p.ID_PASIEN ORDER BY r.TANGGAL_RESEP DESC FETCH FIRST 1 ROW ONLY) AS ID_RESEP
      FROM PASIEN p
      ORDER BY p.NAMA`,
      {},
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    const pasienList = result.rows.map(row => ({
      idPasien: row.ID_PASIEN,
      nama: row.NAMA,
      usia: row.USIA,
      status: row.STATUS,
      idRawat: row.ID_RAWAT,
      idResep: row.ID_RESEP
    }));

    res.status(200).json(pasienList);

  } catch (err) {
    console.error('Error mengambil data pasien untuk billing:', err);
    res.status(500).json({ 
      message: 'Gagal memuat data pasien', 
      error: err.message 
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

// Hitung tagihan menggunakan stored procedure (HANYA LIHAT, TIDAK INSERT)
exports.hitungTagihan = async (req, res) => {
  let connection;
  try {
    const { idPasien, idRawat, idResep } = req.body;

    // Validasi input
    if (!idPasien) {
      return res.status(400).json({
        message: 'ID Pasien wajib diisi'
      });
    }

    connection = await db.getConnection();

    // Panggil stored procedure untuk VIEW tagihan saja
    const result = await connection.execute(
      `BEGIN
        sp_view_tagihan_pasien(
          :p_id_pasien,
          :p_id_rawat,
          :p_id_resep,
          :p_total_tagihan,
          :p_biaya_kamar,
          :p_biaya_obat
        );
      END;`,
      {
        p_id_pasien: idPasien,
        p_id_rawat: idRawat || null,
        p_id_resep: idResep || null,
        p_total_tagihan: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
        p_biaya_kamar: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
        p_biaya_obat: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
      }
    );

    const totalTagihan = result.outBinds.p_total_tagihan;
    const biayaKamar = result.outBinds.p_biaya_kamar;
    const biayaObat = result.outBinds.p_biaya_obat;

    // Ambil info pasien
    const pasienResult = await connection.execute(
      `SELECT NAMA FROM PASIEN WHERE ID_PASIEN = :idPasien`,
      { idPasien },
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    const namaPasien = pasienResult.rows[0]?.NAMA;

    // Tentukan jenis perawatan
    const jenisPerawatan = idRawat ? 'Rawat Inap' : 'Rawat Jalan';
    
    res.status(200).json({
      message: 'Estimasi tagihan berhasil dihitung',
      totalTagihan: totalTagihan,
      biayaKamar: biayaKamar,
      biayaObat: biayaObat,
      detail: {
        namaPasien: namaPasien,
        jenisPerawatan: jenisPerawatan,
        tanggalHitung: new Date()
      }
    });

  } catch (err) {
    console.error('Error menghitung tagihan:', err);
    res.status(500).json({
      message: 'Gagal menghitung tagihan',
      error: err.message
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

// Get detail breakdown tagihan
exports.getDetailTagihan = async (req, res) => {
  const { idPasien } = req.params;
  let connection;
  try {
    connection = await db.getConnection();

    // Ambil informasi rawat inap
    const rawatInapResult = await connection.execute(
      `SELECT 
        ri.ID_RAWAT,
        k.KELAS_KAMAR,
        k.NAMA_KAMAR,
        k.NO_KAMAR,
        ri.TANGGAL_MASUK,
        ri.TANGGAL_KELUAR,
        (NVL(ri.TANGGAL_KELUAR, SYSDATE) - ri.TANGGAL_MASUK) AS LAMA_RAWAT,
        CASE k.KELAS_KAMAR
          WHEN 'VIP' THEN 500000
          WHEN 'Kelas 1' THEN 300000
          WHEN 'Kelas 2' THEN 200000
          WHEN 'Kelas 3' THEN 100000
        END AS TARIF_PER_HARI
      FROM RAWAT_INAP ri
      JOIN KAMAR k ON ri.ID_KAMAR = k.ID_KAMAR
      WHERE ri.ID_PASIEN = :idPasien
      AND ri.TANGGAL_KELUAR IS NULL`,
      { idPasien },
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    // Ambil informasi obat dari resep terakhir
    const obatResult = await connection.execute(
      `SELECT 
        o.NAMA_OBAT,
        o.HARGA,
        ro.JUMLAH,
        ro.ATURAN_PAKAI,
        (o.HARGA * ro.JUMLAH) AS SUBTOTAL
      FROM RESEP r
      JOIN RESEP_OBAT ro ON r.ID_RESEP = ro.ID_RESEP
      JOIN OBAT o ON ro.ID_OBAT = o.ID_OBAT
      WHERE r.ID_PASIEN = :idPasien
      ORDER BY r.TANGGAL_RESEP DESC
      FETCH FIRST 10 ROWS ONLY`,
      { idPasien },
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    const rawatInap = rawatInapResult.rows[0] ? {
      idRawat: rawatInapResult.rows[0].ID_RAWAT,
      kelasKamar: rawatInapResult.rows[0].KELAS_KAMAR,
      namaKamar: rawatInapResult.rows[0].NAMA_KAMAR,
      noKamar: rawatInapResult.rows[0].NO_KAMAR,
      tanggalMasuk: rawatInapResult.rows[0].TANGGAL_MASUK,
      tanggalKeluar: rawatInapResult.rows[0].TANGGAL_KELUAR,
      lamaRawat: rawatInapResult.rows[0].LAMA_RAWAT,
      tarifPerHari: rawatInapResult.rows[0].TARIF_PER_HARI
    } : null;

    const obat = obatResult.rows.map(row => ({
      namaObat: row.NAMA_OBAT,
      harga: row.HARGA,
      jumlah: row.JUMLAH,
      aturanPakai: row.ATURAN_PAKAI,
      subtotal: row.SUBTOTAL
    }));

    res.status(200).json({
      rawatInap: rawatInap,
      obat: obat
    });

  } catch (err) {
    console.error('Error mengambil detail tagihan:', err);
    res.status(500).json({
      message: 'Gagal mengambil detail tagihan',
      error: err.message
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};