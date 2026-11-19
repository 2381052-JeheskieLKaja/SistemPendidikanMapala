const { pool, withTransaction } = require('../config/db');
const { hashPassword, generateTempPassword } = require('../utils/hash');
const { ok, created, notFound, conflict } = require('../utils/response');
const { validate, toId, STATUS_KEANGGOTAAN } = require('../utils/validators');

const RULES = {
  nama: { required: true, max: 100, label: 'Nama' },
  email: { required: true, type: 'email', label: 'Email' },
  no_hp: { max: 20, label: 'No. HP' },
  nim: { max: 20, label: 'NIM' },
  jurusan: { max: 100, label: 'Jurusan' },
  angkatan: { max: 10, label: 'Angkatan' },
  kontak: { max: 50, label: 'Kontak' },
  status_keanggotaan: { required: true, type: 'enum', values: STATUS_KEANGGOTAAN, label: 'Status keanggotaan' },
};

const SELECT_ANGGOTA = `
  SELECT a.id_anggota, a.id_user, a.nim, a.jurusan, a.angkatan, a.kontak, a.status_keanggotaan,
         u.nama, u.email, u.no_hp, u.status AS status_akun,
         (SELECT COUNT(*) FROM peserta_pendidikan pp WHERE pp.id_anggota = a.id_anggota) AS jumlah_program
    FROM anggota a JOIN users u ON u.id_user = a.id_user`;

async function findAnggota(id, conn = pool) {
  const [rows] = await conn.query(`${SELECT_ANGGOTA} WHERE a.id_anggota = ?`, [id]);
  return rows[0] || null;
}

async function assertUnik(conn, { email, nim }, exceptUser = 0, exceptAnggota = 0) {
  const [e] = await conn.query('SELECT 1 FROM users WHERE email = ? AND id_user <> ?', [email, exceptUser]);
  if (e.length) throw conflict('Email sudah digunakan');
  if (nim) {
    const [n] = await conn.query('SELECT 1 FROM anggota WHERE nim = ? AND id_anggota <> ?', [nim, exceptAnggota]);
    if (n.length) throw conflict('NIM sudah digunakan');
  }
}

/** GET /api/anggota?q= */
async function list(req, res) {
  const q = String(req.query.q || '').trim();
  const params = [];
  let where = '';
  if (q) {
    where = 'WHERE u.nama LIKE ? OR u.email LIKE ? OR a.nim LIKE ?';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const [rows] = await pool.query(`${SELECT_ANGGOTA} ${where} ORDER BY u.nama`, params);
  return ok(res, rows);
}

/** POST /api/anggota — transaksi: INSERT users (role=siswa) + INSERT anggota. */
async function create(req, res) {
  const data = validate(req.body, { ...RULES, password: { min: 8, max: 72, label: 'Password awal' } });
  const passwordSementara = data.password ? null : generateTempPassword();

  const id = await withTransaction(async (conn) => {
    await assertUnik(conn, data);
    const hash = await hashPassword(data.password || passwordSementara);
    const [u] = await conn.query(
      "INSERT INTO users (nama, email, password, no_hp, role, status) VALUES (?, ?, ?, ?, 'siswa', 'aktif')",
      [data.nama, data.email, hash, data.no_hp],
    );
    const [a] = await conn.query(
      'INSERT INTO anggota (id_user, nim, jurusan, angkatan, kontak, status_keanggotaan) VALUES (?, ?, ?, ?, ?, ?)',
      [u.insertId, data.nim, data.jurusan, data.angkatan, data.kontak, data.status_keanggotaan],
    );
    return a.insertId;
  });

  const anggota = await findAnggota(id);
  // Password sementara hanya dikembalikan sekali di respons ini (tidak pernah disimpan sebagai teks).
  return created(res, { ...anggota, ...(passwordSementara && { password_sementara: passwordSementara }) },
    'Anggota berhasil ditambahkan dan akun Siswa dibuat');
}

/** PUT /api/anggota/:id */
async function update(req, res) {
  const id = toId(req.params.id, 'ID anggota');
  const data = validate(req.body, {
    ...RULES,
    status_akun: { type: 'enum', values: ['aktif', 'nonaktif'], label: 'Status akun' },
  });

  await withTransaction(async (conn) => {
    const existing = await findAnggota(id, conn);
    if (!existing) throw notFound('Anggota tidak ditemukan');
    await assertUnik(conn, data, existing.id_user, id);
    await conn.query('UPDATE users SET nama = ?, email = ?, no_hp = ?, status = ? WHERE id_user = ?',
      [data.nama, data.email, data.no_hp, data.status_akun || existing.status_akun, existing.id_user]);
    await conn.query(
      'UPDATE anggota SET nim = ?, jurusan = ?, angkatan = ?, kontak = ?, status_keanggotaan = ? WHERE id_anggota = ?',
      [data.nim, data.jurusan, data.angkatan, data.kontak, data.status_keanggotaan, id],
    );
  });
  return ok(res, await findAnggota(id), 'Data anggota berhasil diperbarui');
}

/** DELETE /api/anggota/:id — transaksi: DELETE anggota + users; ditolak bila sudah punya data peserta (K9). */
async function remove(req, res) {
  const id = toId(req.params.id, 'ID anggota');
  await withTransaction(async (conn) => {
    const existing = await findAnggota(id, conn);
    if (!existing) throw notFound('Anggota tidak ditemukan');
    if (existing.jumlah_program > 0) throw conflict('Anggota memiliki data pendidikan sehingga tidak dapat dihapus');
    await conn.query('DELETE FROM anggota WHERE id_anggota = ?', [id]);
    await conn.query('DELETE FROM users WHERE id_user = ?', [existing.id_user]);
  });
  return ok(res, null, 'Anggota berhasil dihapus');
}

module.exports = { list, create, update, remove };
