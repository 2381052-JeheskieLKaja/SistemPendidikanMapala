const { pool } = require('../config/db');

/**
 * Pemetaan identitas Siswa dari token (§11):
 * token.id_user → anggota.id_user → anggota.id_anggota → peserta_pendidikan → id_peserta (satu per program).
 * Mengembalikan daftar keikutsertaan [{ id_peserta, id_program, nama_program, ... }].
 */
async function getKeikutsertaan(idUser, conn = pool) {
  const [rows] = await conn.query(
    `SELECT pp.id_peserta, pp.id_program, pp.tanggal_daftar, pp.status,
            p.nama_program, p.jenis, p.tanggal_mulai, p.tanggal_selesai
       FROM peserta_pendidikan pp
       JOIN anggota a ON a.id_anggota = pp.id_anggota
       JOIN program_pendidikan p ON p.id_program = pp.id_program
      WHERE a.id_user = $1
      ORDER BY p.tanggal_mulai DESC, p.id_program`,
    [idUser],
  );
  return rows;
}

/** id_peserta milik Siswa pada program tertentu, atau null bila tidak terdaftar. */
async function getIdPeserta(idUser, idProgram, conn = pool) {
  const [rows] = await conn.query(
    `SELECT pp.id_peserta FROM peserta_pendidikan pp
       JOIN anggota a ON a.id_anggota = pp.id_anggota
      WHERE a.id_user = $1 AND pp.id_program = $2`,
    [idUser, idProgram],
  );
  return rows[0]?.id_peserta ?? null;
}

/** Persentase = (sudah_diakses ÷ total materi) × 100, dibulatkan; total 0 → 0. */
function hitungPersen(diakses, total) {
  return total > 0 ? Math.round((Number(diakses) / Number(total)) * 100) : 0;
}

module.exports = { getKeikutsertaan, getIdPeserta, hitungPersen };
