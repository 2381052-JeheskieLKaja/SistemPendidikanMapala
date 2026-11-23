const { pool } = require('../config/db');
const { ok, forbidden, notFound } = require('../utils/response');
const { toId } = require('../utils/validators');

/** GET /api/notifikasi — milik sendiri + jumlah belum dibaca. */
async function list(req, res) {
  const [items] = await pool.query(
    `SELECT n.id_notifikasi, n.id_materi, n.pesan, n.status_baca, n.created_at, m.judul, m.kategori
       FROM notifikasi n JOIN materi m ON m.id_materi = n.id_materi
      WHERE n.id_user = $1 ORDER BY n.created_at DESC, n.id_notifikasi DESC LIMIT 50`,
    [req.user.id_user],
  );
  const [[{ belum }]] = await pool.query(
    'SELECT COUNT(*)::int AS belum FROM notifikasi WHERE id_user = $1 AND status_baca = FALSE', [req.user.id_user]);
  return ok(res, {
    belum_dibaca: Number(belum),
    items: items.map((n) => ({ ...n, status_baca: Boolean(n.status_baca) })),
  });
}

/** PUT /api/notifikasi/:id/dibaca — hanya pemilik notifikasi. */
async function tandaiDibaca(req, res) {
  const id = toId(req.params.id, 'ID notifikasi');
  const [rows] = await pool.query('SELECT id_user, id_materi FROM notifikasi WHERE id_notifikasi = $1', [id]);
  if (!rows[0]) throw notFound('Notifikasi tidak ditemukan');
  if (rows[0].id_user !== req.user.id_user) throw forbidden('Notifikasi ini bukan milik Anda');
  await pool.query('UPDATE notifikasi SET status_baca = TRUE WHERE id_notifikasi = $1', [id]);
  return ok(res, { id_notifikasi: id, id_materi: rows[0].id_materi }, 'Notifikasi ditandai dibaca');
}

module.exports = { list, tandaiDibaca };
