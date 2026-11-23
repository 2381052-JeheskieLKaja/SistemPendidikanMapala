const { pool, withTransaction } = require('../config/db');
const { ok, badRequest } = require('../utils/response');
const { toId, STATUS_ABSENSI } = require('../utils/validators');
const { findJadwal } = require('./jadwalController');

/** Peserta program dari jadwal + absensi yang sudah ada (LEFT JOIN). */
async function pesertaDenganAbsensi(jadwal, conn = pool) {
  const [rows] = await conn.query(
    `SELECT pp.id_peserta, u.nama, an.nim, ab.status, ab.keterangan
       FROM peserta_pendidikan pp
       JOIN anggota an ON an.id_anggota = pp.id_anggota
       JOIN users u ON u.id_user = an.id_user
       LEFT JOIN absensi ab ON ab.id_peserta = pp.id_peserta AND ab.id_jadwal = $1
      WHERE pp.id_program = $2 ORDER BY u.nama`,
    [jadwal.id_jadwal, jadwal.id_program],
  );
  return rows;
}

function rekap(rows) {
  const r = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  rows.forEach((x) => { if (x.status in r) r[x.status] += 1; });
  return r;
}

/** GET /api/absensi?id_jadwal= */
async function list(req, res) {
  if (!req.query.id_jadwal) throw badRequest('Parameter id_jadwal wajib diisi');
  const jadwal = await findJadwal(toId(req.query.id_jadwal, 'ID jadwal'));
  const peserta = await pesertaDenganAbsensi(jadwal);
  return ok(res, { jadwal, peserta, rekap: rekap(peserta) });
}

/** POST /api/absensi { id_jadwal, data:[{id_peserta, status, keterangan}] } — upsert dalam transaksi. */
async function simpan(req, res) {
  const jadwal = await findJadwal(toId(req.body?.id_jadwal, 'ID jadwal'));
  const data = req.body?.data;
  if (!Array.isArray(data) || data.length === 0) throw badRequest('Data absensi wajib diisi');

  const peserta = await pesertaDenganAbsensi(jadwal);
  const valid = new Set(peserta.map((p) => p.id_peserta));
  const errors = {};
  const rows = data.map((item, i) => {
    const idPeserta = Number(item?.id_peserta);
    const status = typeof item?.status === 'string' ? item.status.trim() : item?.status;
    if (!valid.has(idPeserta)) errors[`data.${i}.id_peserta`] = 'Siswa bukan peserta program jadwal ini';
    else if (!STATUS_ABSENSI.includes(status)) errors[`data.${i}.status`] = 'Status harus hadir, izin, sakit, atau alpa';
    const keterangan = typeof item?.keterangan === 'string' && item.keterangan.trim() ? item.keterangan.trim().slice(0, 1000) : null;
    return [idPeserta, jadwal.id_jadwal, status, keterangan];
  });
  if (Object.keys(errors).length) throw badRequest('Data absensi tidak valid', errors);
  const diisi = new Set(rows.map((r) => r[0]));
  if (diisi.size !== rows.length) throw badRequest('Satu siswa hanya boleh diisi sekali');
  if (diisi.size !== valid.size) throw badRequest('Semua siswa wajib diberi status kehadiran');

  await withTransaction(async (conn) => {
    for (const row of rows) {
      await conn.query(
        `INSERT INTO absensi (id_peserta, id_jadwal, status, keterangan) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_peserta, id_jadwal) DO UPDATE
         SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan`,
        row,
      );
    }
  });

  const terbaru = await pesertaDenganAbsensi(jadwal);
  return ok(res, { jadwal, peserta: terbaru, rekap: rekap(terbaru) }, 'Absensi berhasil disimpan');
}

/** GET /api/absensi/saya — hanya milik Siswa login (tanpa parameter ID dari klien). */
async function saya(req, res) {
  const [riwayat] = await pool.query(
    `SELECT ab.id_absensi, ab.status, ab.keterangan, j.tanggal, j.waktu, j.lokasi, j.kegiatan, p.nama_program
       FROM absensi ab
       JOIN peserta_pendidikan pp ON pp.id_peserta = ab.id_peserta
       JOIN anggota an ON an.id_anggota = pp.id_anggota
       JOIN jadwal j ON j.id_jadwal = ab.id_jadwal
       JOIN program_pendidikan p ON p.id_program = pp.id_program
      WHERE an.id_user = $1 ORDER BY j.tanggal DESC, j.waktu DESC`,
    [req.user.id_user],
  );
  return ok(res, { rekap: rekap(riwayat), riwayat });
}

module.exports = { list, simpan, saya, rekap };
