const { pool, withTransaction } = require('../config/db');
const { ok, badRequest } = require('../utils/response');
const { toId } = require('../utils/validators');
const { findJadwal } = require('./jadwalController');

async function pesertaDenganEvaluasi(jadwal, conn = pool) {
  const [rows] = await conn.query(
    `SELECT pp.id_peserta, u.nama, an.nim, e.id_evaluasi, e.hasil_penilaian, e.catatan, e.tanggal_evaluasi,
            pc.nama AS pencatat
       FROM peserta_pendidikan pp
       JOIN anggota an ON an.id_anggota = pp.id_anggota
       JOIN users u ON u.id_user = an.id_user
       LEFT JOIN evaluasi e ON e.id_peserta = pp.id_peserta AND e.id_jadwal = $1
       LEFT JOIN users pc ON pc.id_user = e.id_pencatat
      WHERE pp.id_program = $2 ORDER BY u.nama`,
    [jadwal.id_jadwal, jadwal.id_program],
  );
  return rows;
}

/** GET /api/evaluasi?id_jadwal= */
async function list(req, res) {
  if (!req.query.id_jadwal) throw badRequest('Parameter id_jadwal wajib diisi');
  const jadwal = await findJadwal(toId(req.query.id_jadwal, 'ID jadwal'));
  return ok(res, { jadwal, peserta: await pesertaDenganEvaluasi(jadwal) });
}

/**
 * POST /api/evaluasi { id_jadwal, data:[{id_peserta, hasil_penilaian, catatan}] }
 * Baris tanpa hasil & catatan dilewati; hasil_penilaian wajib untuk baris yang diisi.
 * Upsert; id_pencatat dari token; tanggal_evaluasi = hari ini.
 */
async function simpan(req, res) {
  const jadwal = await findJadwal(toId(req.body?.id_jadwal, 'ID jadwal'));
  const data = req.body?.data;
  if (!Array.isArray(data) || data.length === 0) throw badRequest('Data evaluasi wajib diisi');

  const valid = new Set((await pesertaDenganEvaluasi(jadwal)).map((p) => p.id_peserta));
  const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
  const errors = {};
  const rows = [];
  data.forEach((item, i) => {
    const idPeserta = Number(item?.id_peserta);
    const hasil = text(item?.hasil_penilaian, 5000);
    const catatan = text(item?.catatan, 5000);
    if (!valid.has(idPeserta)) errors[`data.${i}.id_peserta`] = 'Siswa bukan peserta program jadwal ini';
    else if (!hasil && catatan) errors[`data.${i}.hasil_penilaian`] = 'Hasil penilaian wajib diisi';
    else if (hasil) rows.push([idPeserta, jadwal.id_jadwal, req.user.id_user, hasil, catatan]);
  });
  if (Object.keys(errors).length) throw badRequest('Data evaluasi tidak valid', errors);
  if (rows.length === 0) throw badRequest('Isi hasil penilaian minimal untuk satu siswa');
  if (new Set(rows.map((r) => r[0])).size !== rows.length) throw badRequest('Satu siswa hanya boleh diisi sekali');

  await withTransaction(async (conn) => {
    for (const row of rows) {
      await conn.query(
        `INSERT INTO evaluasi (id_peserta, id_jadwal, id_pencatat, hasil_penilaian, catatan, tanggal_evaluasi)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
         ON CONFLICT (id_peserta, id_jadwal) DO UPDATE
         SET id_pencatat = EXCLUDED.id_pencatat,
             hasil_penilaian = EXCLUDED.hasil_penilaian,
             catatan = EXCLUDED.catatan,
             tanggal_evaluasi = EXCLUDED.tanggal_evaluasi`,
        row,
      );
    }
  });

  return ok(res, { jadwal, peserta: await pesertaDenganEvaluasi(jadwal) }, 'Evaluasi berhasil disimpan');
}

module.exports = { list, simpan };
