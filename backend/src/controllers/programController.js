const { pool } = require('../config/db');
const { ok, created, badRequest, notFound, conflict } = require('../utils/response');
const { validate, toId } = require('../utils/validators');

const RULES = {
  nama_program: { required: true, max: 150, label: 'Nama program' },
  jenis: { required: true, type: 'enum', values: ['rutin', 'tambahan'], label: 'Jenis' },
  deskripsi: { max: 5000, label: 'Deskripsi' },
  tanggal_mulai: { type: 'date', label: 'Tanggal mulai' },
  tanggal_selesai: { type: 'date', label: 'Tanggal selesai' },
};

const SELECT_PROGRAM = `
  SELECT p.*,
    (SELECT COUNT(*)::int FROM peserta_pendidikan pp WHERE pp.id_program = p.id_program) AS jumlah_peserta,
    (SELECT COUNT(*)::int FROM materi m WHERE m.id_program = p.id_program) AS jumlah_materi,
    (SELECT COUNT(*)::int FROM jadwal j WHERE j.id_program = p.id_program) AS jumlah_jadwal,
    (SELECT COUNT(*)::int FROM kurikulum k WHERE k.id_program = p.id_program) AS jumlah_kurikulum
  FROM program_pendidikan p`;

function readBody(body) {
  const data = validate(body, RULES);
  if (data.tanggal_mulai && data.tanggal_selesai && data.tanggal_selesai < data.tanggal_mulai) {
    throw badRequest('Data tidak valid', { tanggal_selesai: 'Tanggal selesai tidak boleh sebelum tanggal mulai' });
  }
  return data;
}

async function findProgram(id) {
  const [rows] = await pool.query(`${SELECT_PROGRAM} WHERE p.id_program = $1`, [id]);
  if (!rows[0]) throw notFound('Program tidak ditemukan');
  return rows[0];
}

/** GET /api/program */
async function list(_req, res) {
  const [rows] = await pool.query(`${SELECT_PROGRAM} ORDER BY p.tanggal_mulai DESC, p.id_program DESC`);
  return ok(res, rows);
}

/** GET /api/program/:id */
async function detail(req, res) {
  return ok(res, await findProgram(toId(req.params.id, 'ID program')));
}

/** POST /api/program */
async function create(req, res) {
  const d = readBody(req.body);
  const [r] = await pool.query(
    'INSERT INTO program_pendidikan (nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai) VALUES ($1, $2, $3, $4, $5) RETURNING id_program',
    [d.nama_program, d.jenis, d.deskripsi, d.tanggal_mulai, d.tanggal_selesai],
  );
  return created(res, await findProgram(r[0].id_program), 'Program berhasil ditambahkan');
}

/** PUT /api/program/:id */
async function update(req, res) {
  const id = toId(req.params.id, 'ID program');
  const d = readBody(req.body);
  await findProgram(id);
  await pool.query(
    'UPDATE program_pendidikan SET nama_program = $1, jenis = $2, deskripsi = $3, tanggal_mulai = $4, tanggal_selesai = $5 WHERE id_program = $6',
    [d.nama_program, d.jenis, d.deskripsi, d.tanggal_mulai, d.tanggal_selesai, id],
  );
  return ok(res, await findProgram(id), 'Program berhasil diperbarui');
}

/** DELETE /api/program/:id — ditolak bila masih punya kurikulum/materi/jadwal/peserta. */
async function remove(req, res) {
  const id = toId(req.params.id, 'ID program');
  const p = await findProgram(id);
  if (p.jumlah_kurikulum || p.jumlah_materi || p.jumlah_jadwal || p.jumlah_peserta) {
    throw conflict('Program masih memiliki kurikulum, materi, jadwal, atau peserta sehingga tidak dapat dihapus');
  }
  await pool.query('DELETE FROM program_pendidikan WHERE id_program = $1', [id]);
  return ok(res, null, 'Program berhasil dihapus');
}

module.exports = { list, detail, create, update, remove, findProgram };
