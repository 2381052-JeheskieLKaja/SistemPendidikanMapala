const { pool } = require('../config/db');
const { ok, created, badRequest, notFound } = require('../utils/response');
const { validate, toId } = require('../utils/validators');
const { findProgram } = require('./programController');

const RULES = {
  tahun: { required: true, max: 10, label: 'Tahun' },
  deskripsi: { max: 5000, label: 'Deskripsi' },
  status: { required: true, type: 'enum', values: ['draft', 'diresmikan'], label: 'Status' },
};

async function findKurikulum(id) {
  const [rows] = await pool.query('SELECT * FROM kurikulum WHERE id_kurikulum = ?', [id]);
  if (!rows[0]) throw notFound('Kurikulum tidak ditemukan');
  return rows[0];
}

/** GET /api/kurikulum?id_program= */
async function list(req, res) {
  if (!req.query.id_program) throw badRequest('Parameter id_program wajib diisi');
  const idProgram = toId(req.query.id_program, 'ID program');
  await findProgram(idProgram);
  const [rows] = await pool.query('SELECT * FROM kurikulum WHERE id_program = ? ORDER BY tahun DESC, id_kurikulum DESC', [idProgram]);
  return ok(res, rows);
}

/** POST /api/kurikulum */
async function create(req, res) {
  const d = validate(req.body, { id_program: { required: true, type: 'int', label: 'Program' }, ...RULES });
  await findProgram(d.id_program);
  const [r] = await pool.query('INSERT INTO kurikulum (id_program, tahun, deskripsi, status) VALUES (?, ?, ?, ?)',
    [d.id_program, d.tahun, d.deskripsi, d.status]);
  return created(res, await findKurikulum(r.insertId), 'Kurikulum berhasil ditambahkan');
}

/** PUT /api/kurikulum/:id */
async function update(req, res) {
  const id = toId(req.params.id, 'ID kurikulum');
  const d = validate(req.body, RULES);
  await findKurikulum(id);
  await pool.query('UPDATE kurikulum SET tahun = ?, deskripsi = ?, status = ? WHERE id_kurikulum = ?',
    [d.tahun, d.deskripsi, d.status, id]);
  return ok(res, await findKurikulum(id), 'Kurikulum berhasil diperbarui');
}

module.exports = { list, create, update };
