const { pool } = require('../config/db');
const { ok } = require('../utils/response');

/** GET /api/publik/program — tanpa token; whitelist kolom, tanpa join ke tabel personal. */
async function program(_req, res) {
  const [rows] = await pool.query(
    `SELECT nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai
       FROM program_pendidikan ORDER BY tanggal_mulai DESC, nama_program`,
  );
  return ok(res, rows);
}

module.exports = { program };
