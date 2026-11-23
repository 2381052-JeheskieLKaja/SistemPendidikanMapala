const { pool } = require('../config/db');
const { ok, created, badRequest, notFound, conflict } = require('../utils/response');
const { validate, toId } = require('../utils/validators');
const { findProgram } = require('./programController');

const DUPLIKAT = 'Siswa sudah terdaftar pada program ini';

/** GET /api/peserta?id_program= */
async function list(req, res) {
  if (!req.query.id_program) throw badRequest('Parameter id_program wajib diisi');
  const idProgram = toId(req.query.id_program, 'ID program');
  await findProgram(idProgram);
  const [rows] = await pool.query(
    `SELECT pp.id_peserta, pp.id_anggota, pp.id_program, pp.tanggal_daftar, pp.status,
            a.nim, a.jurusan, a.angkatan, a.status_keanggotaan, u.nama, u.email
       FROM peserta_pendidikan pp
       JOIN anggota a ON a.id_anggota = pp.id_anggota
       JOIN users u ON u.id_user = a.id_user
      WHERE pp.id_program = $1 ORDER BY u.nama`,
    [idProgram],
  );
  return ok(res, rows);
}

/** POST /api/peserta { id_anggota, id_program } — tolak pendaftaran ganda (409). */
async function create(req, res) {
  const d = validate(req.body, {
    id_anggota: { required: true, type: 'int', label: 'Siswa' },
    id_program: { required: true, type: 'int', label: 'Program' },
  });
  const [anggota] = await pool.query('SELECT 1 FROM anggota WHERE id_anggota = $1', [d.id_anggota]);
  if (!anggota.length) throw notFound('Anggota tidak ditemukan');
  await findProgram(d.id_program);

  // cekPendaftaranGanda; UNIQUE (id_anggota, id_program) tetap menjaga bila ada request bersamaan.
  const [dup] = await pool.query('SELECT 1 FROM peserta_pendidikan WHERE id_anggota = $1 AND id_program = $2',
    [d.id_anggota, d.id_program]);
  if (dup.length) throw conflict(DUPLIKAT);
  try {
    const [r] = await pool.query(
      "INSERT INTO peserta_pendidikan (id_anggota, id_program, tanggal_daftar, status) VALUES ($1, $2, CURRENT_DATE, 'aktif') RETURNING id_peserta",
      [d.id_anggota, d.id_program],
    );
    return created(res, { id_peserta: r[0].id_peserta }, 'Siswa berhasil didaftarkan ke program');
  } catch (err) {
    if (err.code === '23505') throw conflict(DUPLIKAT);
    throw err;
  }
}

module.exports = { list, create };
