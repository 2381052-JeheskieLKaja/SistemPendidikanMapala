const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { pool, withTransaction } = require('../config/db');
const { removeFile } = require('../middlewares/upload');
const { ok, created, badRequest, forbidden, notFound } = require('../utils/response');
const { validate, toId } = require('../utils/validators');
const { getKeikutsertaan, getIdPeserta } = require('../utils/siswa');
const { findProgram } = require('./programController');

const RULES = {
  judul: { required: true, max: 150, label: 'Judul' },
  kategori: { required: true, max: 100, label: 'Kategori' },
  deskripsi: { max: 10000, label: 'Deskripsi' },
};

// file_path tidak pernah dikirim ke klien; berkas hanya bisa diambil lewat GET /api/materi/:id/file.
function serialize({ file_path: filePath, ...m }) {
  return { ...m, has_file: Boolean(filePath), ekstensi_file: filePath ? path.extname(filePath).slice(1) : null };
}

async function findMateri(id, conn = pool) {
  const [rows] = await conn.query('SELECT * FROM materi WHERE id_materi = ?', [id]);
  if (!rows[0]) throw notFound('Materi tidak ditemukan');
  return rows[0];
}

/** Bungkus handler upload: hapus file yang baru diunggah bila proses gagal. */
const cleanupUpload = (handler) => async (req, res) => {
  try {
    return await handler(req, res);
  } catch (err) {
    if (req.file) await removeFile(req.file.filename);
    throw err;
  }
};

/** GET /api/materi?id_program= */
async function list(req, res) {
  if (!req.query.id_program) throw badRequest('Parameter id_program wajib diisi');
  const idProgram = toId(req.query.id_program, 'ID program');
  await findProgram(idProgram);
  const [rows] = await pool.query('SELECT * FROM materi WHERE id_program = ? ORDER BY kategori, tanggal_upload DESC', [idProgram]);
  return ok(res, rows.map(serialize));
}

/** POST /api/materi — transaksi: INSERT materi → ambil Siswa program → INSERT notifikasi per Siswa. */
const create = cleanupUpload(async (req, res) => {
  const d = validate(req.body, { id_program: { required: true, type: 'int', label: 'Program' }, ...RULES });
  await findProgram(d.id_program);

  const result = await withTransaction(async (conn) => {
    const [r] = await conn.query(
      'INSERT INTO materi (id_program, judul, kategori, deskripsi, file_path) VALUES (?, ?, ?, ?, ?)',
      [d.id_program, d.judul, d.kategori, d.deskripsi, req.file?.filename ?? null],
    );
    const [siswa] = await conn.query(
      `SELECT a.id_user FROM peserta_pendidikan pp JOIN anggota a ON a.id_anggota = pp.id_anggota
        WHERE pp.id_program = ?`,
      [d.id_program],
    );
    if (siswa.length) {
      const pesan = `Materi baru: ${d.judul}`.slice(0, 255);
      await conn.query('INSERT INTO notifikasi (id_user, id_materi, pesan, status_baca) VALUES ?',
        [siswa.map((s) => [s.id_user, r.insertId, pesan, false])]);
    }
    return { id_materi: r.insertId, jumlah_notifikasi: siswa.length };
  });

  const materi = serialize(await findMateri(result.id_materi));
  return created(res, { ...materi, ...result },
    `Materi berhasil ditambahkan. Notifikasi dikirim ke ${result.jumlah_notifikasi} siswa.`);
});

/** PUT /api/materi/:id — ubah data; file baru (opsional) menggantikan file lama. */
const update = cleanupUpload(async (req, res) => {
  const id = toId(req.params.id, 'ID materi');
  const d = validate(req.body, RULES);
  const existing = await findMateri(id);
  const filePath = req.file ? req.file.filename : existing.file_path;
  await pool.query('UPDATE materi SET judul = ?, kategori = ?, deskripsi = ?, file_path = ? WHERE id_materi = ?',
    [d.judul, d.kategori, d.deskripsi, filePath, id]);
  if (req.file && existing.file_path) await removeFile(existing.file_path);
  return ok(res, serialize(await findMateri(id)), 'Materi berhasil diperbarui');
});

/** DELETE /api/materi/:id — progres & notifikasi turunan ikut terhapus (ON DELETE CASCADE). */
async function remove(req, res) {
  const id = toId(req.params.id, 'ID materi');
  const existing = await findMateri(id);
  await pool.query('DELETE FROM materi WHERE id_materi = ?', [id]);
  await removeFile(existing.file_path);
  return ok(res, null, 'Materi berhasil dihapus');
}

/** GET /api/materi/saya — materi dari program yang diikuti Siswa (dari token) + status akses. */
async function saya(req, res) {
  const program = await getKeikutsertaan(req.user.id_user);
  const [rows] = await pool.query(
    `SELECT m.*, p.nama_program, COALESCE(pm.status, 'belum_diakses') AS status_akses, pm.tanggal_akses
       FROM materi m
       JOIN program_pendidikan p ON p.id_program = m.id_program
       JOIN peserta_pendidikan pp ON pp.id_program = m.id_program
       JOIN anggota a ON a.id_anggota = pp.id_anggota AND a.id_user = ?
       LEFT JOIN progres_materi pm ON pm.id_materi = m.id_materi AND pm.id_peserta = pp.id_peserta
      ORDER BY p.nama_program, m.kategori, m.tanggal_upload`,
    [req.user.id_user],
  );
  return ok(res, {
    program: program.map(({ id_program: idP, nama_program: nama }) => ({ id_program: idP, nama_program: nama })),
    materi: rows.map(serialize),
  });
}

/** GET /api/materi/:id/file — admin, pengurus, atau Siswa dari program materi tersebut. */
async function file(req, res) {
  const materi = await findMateri(toId(req.params.id, 'ID materi'));
  if (req.user.role === 'siswa' && !(await getIdPeserta(req.user.id_user, materi.id_program))) {
    throw forbidden('Materi ini bukan bagian dari program yang Anda ikuti');
  }
  if (!materi.file_path) throw notFound('Materi ini tidak memiliki berkas');
  const full = path.join(env.uploadDir, path.basename(materi.file_path));
  if (!fs.existsSync(full)) throw notFound('Berkas materi tidak ditemukan');
  const nama = `${materi.judul.replace(/[^\w\- ]+/g, '').trim() || 'materi'}${path.extname(full)}`;
  return res.sendFile(full, { headers: { 'Content-Disposition': `inline; filename="${nama}"` } });
}

module.exports = { list, create, update, remove, saya, file, findMateri, serialize };
