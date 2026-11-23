const { pool } = require('../config/db');
const { comparePassword, hashPassword } = require('../utils/hash');
const { ok, badRequest, conflict, notFound } = require('../utils/response');
const { validate } = require('../utils/validators');

async function findProfil(idUser) {
  const [rows] = await pool.query(
    `SELECT u.id_user, u.nama, u.email, u.no_hp, u.role, u.status,
            a.nim, a.jurusan, a.angkatan, a.status_keanggotaan
       FROM users u LEFT JOIN anggota a ON a.id_user = u.id_user WHERE u.id_user = $1`,
    [idUser],
  );
  if (!rows[0]) throw notFound('Akun tidak ditemukan');
  return rows[0];
}

/** GET /api/profil/me — id_user selalu dari token. */
async function me(req, res) {
  return ok(res, await findProfil(req.user.id_user));
}

/** PUT /api/profil/me — hanya nama, email, no_hp; field lain (role, status, id_user, nim, ...) diabaikan. */
async function update(req, res) {
  const d = validate(req.body, {
    nama: { required: true, max: 100, label: 'Nama' },
    email: { required: true, type: 'email', label: 'Email' },
    no_hp: { max: 20, label: 'No. HP' },
  });
  const [dup] = await pool.query('SELECT 1 FROM users WHERE email = $1 AND id_user <> $2', [d.email, req.user.id_user]);
  if (dup.length) throw conflict('Email sudah digunakan akun lain');
  await pool.query('UPDATE users SET nama = $1, email = $2, no_hp = $3 WHERE id_user = $4',
    [d.nama, d.email, d.no_hp, req.user.id_user]);
  return ok(res, await findProfil(req.user.id_user), 'Profil berhasil diperbarui');
}

/** PUT /api/profil/me/password */
async function gantiPassword(req, res) {
  const d = validate(req.body, {
    password_lama: { required: true, label: 'Password lama' },
    password_baru: { required: true, min: 8, max: 72, label: 'Password baru' },
    konfirmasi: { required: true, label: 'Konfirmasi password' },
  });
  if (d.password_baru !== d.konfirmasi) {
    throw badRequest('Data tidak valid', { konfirmasi: 'Konfirmasi password tidak sama' });
  }
  const [[user]] = await pool.query('SELECT password FROM users WHERE id_user = $1', [req.user.id_user]);
  if (!user || !(await comparePassword(d.password_lama, user.password))) {
    throw badRequest('Password lama salah', { password_lama: 'Password lama salah' });
  }
  await pool.query('UPDATE users SET password = $1 WHERE id_user = $2', [await hashPassword(d.password_baru), req.user.id_user]);
  return ok(res, null, 'Password berhasil diganti');
}

module.exports = { me, update, gantiPassword };
