const { pool } = require('../config/db');
const { ok, created, badRequest, notFound, conflict } = require('../utils/response');
const { validate, toId } = require('../utils/validators');
const { findProgram } = require('./programController');

const RULES = {
  tanggal: { required: true, type: 'date', label: 'Tanggal' },
  waktu: { required: true, type: 'time', label: 'Waktu' },
  lokasi: { required: true, max: 150, label: 'Lokasi' },
  kegiatan: { required: true, max: 150, label: 'Kegiatan' },
};

async function findJadwal(id, conn = pool) {
  const [rows] = await conn.query(
    `SELECT j.*, p.nama_program FROM jadwal j JOIN program_pendidikan p ON p.id_program = j.id_program
      WHERE j.id_jadwal = $1`,
    [id],
  );
  if (!rows[0]) throw notFound('Jadwal tidak ditemukan');
  return rows[0];
}

/** GET /api/jadwal?id_program= (urut tanggal, waktu) */
async function list(req, res) {
  if (!req.query.id_program) throw badRequest('Parameter id_program wajib diisi');
  const idProgram = toId(req.query.id_program, 'ID program');
  await findProgram(idProgram);
  const [rows] = await pool.query(
    `SELECT j.*,
       (SELECT COUNT(*)::int FROM absensi a WHERE a.id_jadwal = j.id_jadwal) AS jumlah_absensi,
       (SELECT COUNT(*)::int FROM evaluasi e WHERE e.id_jadwal = j.id_jadwal) AS jumlah_evaluasi
       FROM jadwal j WHERE j.id_program = $1 ORDER BY j.tanggal, j.waktu`,
    [idProgram],
  );
  return ok(res, rows);
}

/** POST /api/jadwal — data tidak lengkap → 400 tanpa menyimpan. */
async function create(req, res) {
  const d = validate(req.body, { id_program: { required: true, type: 'int', label: 'Program' }, ...RULES });
  await findProgram(d.id_program);
  const [r] = await pool.query('INSERT INTO jadwal (id_program, tanggal, waktu, lokasi, kegiatan) VALUES ($1, $2, $3, $4, $5) RETURNING id_jadwal',
    [d.id_program, d.tanggal, d.waktu, d.lokasi, d.kegiatan]);
  return created(res, await findJadwal(r[0].id_jadwal), 'Jadwal berhasil ditambahkan');
}

/** PUT /api/jadwal/:id */
async function update(req, res) {
  const id = toId(req.params.id, 'ID jadwal');
  const d = validate(req.body, RULES);
  await findJadwal(id);
  await pool.query('UPDATE jadwal SET tanggal = $1, waktu = $2, lokasi = $3, kegiatan = $4 WHERE id_jadwal = $5',
    [d.tanggal, d.waktu, d.lokasi, d.kegiatan, id]);
  return ok(res, await findJadwal(id), 'Jadwal berhasil diperbarui');
}

/** DELETE /api/jadwal/:id — ditolak bila sudah punya absensi/evaluasi. */
async function remove(req, res) {
  const id = toId(req.params.id, 'ID jadwal');
  await findJadwal(id);
  const [[{ n }]] = await pool.query(
    'SELECT ((SELECT COUNT(*) FROM absensi WHERE id_jadwal = $1) + (SELECT COUNT(*) FROM evaluasi WHERE id_jadwal = $1))::int AS n',
    [id],
  );
  if (n > 0) throw conflict('Jadwal sudah memiliki data absensi atau evaluasi sehingga tidak dapat dihapus');
  await pool.query('DELETE FROM jadwal WHERE id_jadwal = $1', [id]);
  return ok(res, null, 'Jadwal berhasil dihapus');
}

/** GET /api/jadwal/saya — jadwal program yang diikuti Siswa (dari token). */
async function saya(req, res) {
  const [rows] = await pool.query(
    `SELECT j.*, p.nama_program FROM jadwal j
       JOIN program_pendidikan p ON p.id_program = j.id_program
       JOIN peserta_pendidikan pp ON pp.id_program = j.id_program
       JOIN anggota a ON a.id_anggota = pp.id_anggota
      WHERE a.id_user = $1 ORDER BY j.tanggal, j.waktu`,
    [req.user.id_user],
  );
  return ok(res, rows);
}

module.exports = { list, create, update, remove, saya, findJadwal };
