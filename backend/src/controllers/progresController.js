const { pool } = require('../config/db');
const { ok, forbidden } = require('../utils/response');
const { validate } = require('../utils/validators');
const { getKeikutsertaan, getIdPeserta, hitungPersen } = require('../utils/siswa');
const { findMateri, serialize } = require('./materiController');

/** POST /api/progres/tandai-akses { id_materi } — catat dulu, baru FE menampilkan isi materi. */
async function tandaiAkses(req, res) {
  const { id_materi: idMateri } = validate(req.body, { id_materi: { required: true, type: 'int', label: 'Materi' } });
  const materi = await findMateri(idMateri);
  const idPeserta = await getIdPeserta(req.user.id_user, materi.id_program);
  if (!idPeserta) throw forbidden('Materi ini bukan bagian dari program yang Anda ikuti');

  // tanggal_akses diisi sekali saat pertama dibuka dan tidak ditimpa; UNIQUE mencegah baris ganda.
  await pool.query(
    `INSERT INTO progres_materi (id_peserta, id_materi, status, tanggal_akses) VALUES (?, ?, 'sudah_diakses', NOW())
     ON DUPLICATE KEY UPDATE status = 'sudah_diakses', tanggal_akses = COALESCE(tanggal_akses, NOW())`,
    [idPeserta, idMateri],
  );
  const [[progres]] = await pool.query(
    'SELECT status, tanggal_akses FROM progres_materi WHERE id_peserta = ? AND id_materi = ?', [idPeserta, idMateri]);
  return ok(res, { materi: serialize(materi), progres }, 'Materi tercatat sudah diakses');
}

/** Progres per program milik Siswa (dihitung saat request, tanpa tabel rekap). */
async function hitungProgresSiswa(idUser) {
  const program = await getKeikutsertaan(idUser);
  const hasil = [];
  for (const p of program) {
    const [materi] = await pool.query(
      `SELECT m.id_materi, m.judul, m.kategori, COALESCE(pm.status, 'belum_diakses') AS status, pm.tanggal_akses
         FROM materi m LEFT JOIN progres_materi pm ON pm.id_materi = m.id_materi AND pm.id_peserta = ?
        WHERE m.id_program = ? ORDER BY m.kategori, m.tanggal_upload`,
      [p.id_peserta, p.id_program],
    );
    const diakses = materi.filter((m) => m.status === 'sudah_diakses').length;
    hasil.push({
      id_program: p.id_program,
      nama_program: p.nama_program,
      total_materi: materi.length,
      diakses,
      persen: hitungPersen(diakses, materi.length),
      materi,
    });
  }
  return hasil;
}

/** GET /api/progres/saya */
async function saya(req, res) {
  const perProgram = await hitungProgresSiswa(req.user.id_user);
  const [evaluasi] = await pool.query(
    `SELECT e.id_evaluasi, e.hasil_penilaian, e.catatan, e.tanggal_evaluasi,
            j.kegiatan, j.tanggal, p.nama_program, pc.nama AS pencatat
       FROM evaluasi e
       JOIN peserta_pendidikan pp ON pp.id_peserta = e.id_peserta
       JOIN anggota an ON an.id_anggota = pp.id_anggota
       JOIN jadwal j ON j.id_jadwal = e.id_jadwal
       JOIN program_pendidikan p ON p.id_program = pp.id_program
       JOIN users pc ON pc.id_user = e.id_pencatat
      WHERE an.id_user = ? ORDER BY j.tanggal DESC`,
    [req.user.id_user],
  );
  return ok(res, { per_program: perProgram, evaluasi });
}

module.exports = { tandaiAkses, saya, hitungProgresSiswa };
