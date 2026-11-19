const { pool } = require('../config/db');
const { ok } = require('../utils/response');
const { STATUS_KEANGGOTAAN } = require('../utils/validators');
const { getKeikutsertaan, hitungPersen } = require('../utils/siswa');
const { hitungProgresSiswa } = require('./progresController');

async function ringkasanPengelola() {
  const [perStatus] = await pool.query(
    'SELECT status_keanggotaan, COUNT(*) AS jumlah FROM anggota GROUP BY status_keanggotaan');
  const rincian = Object.fromEntries(STATUS_KEANGGOTAAN.map((s) => [s, 0]));
  perStatus.forEach((r) => { rincian[r.status_keanggotaan] = Number(r.jumlah); });

  // Program aktif: hari ini berada di antara tanggal_mulai dan tanggal_selesai.
  const [programAktif] = await pool.query(
    `SELECT p.id_program, p.nama_program, p.jenis, p.tanggal_mulai, p.tanggal_selesai,
            (SELECT COUNT(*) FROM peserta_pendidikan pp WHERE pp.id_program = p.id_program) AS jumlah_peserta
       FROM program_pendidikan p
      WHERE CURDATE() BETWEEN p.tanggal_mulai AND p.tanggal_selesai ORDER BY p.tanggal_mulai`,
  );
  const [jadwal] = await pool.query(
    `SELECT j.id_jadwal, j.id_program, j.tanggal, j.waktu, j.lokasi, j.kegiatan, p.nama_program
       FROM jadwal j JOIN program_pendidikan p ON p.id_program = j.id_program
      WHERE j.tanggal >= CURDATE() ORDER BY j.tanggal, j.waktu LIMIT 5`,
  );
  return {
    total_anggota: Object.values(rincian).reduce((a, b) => a + b, 0),
    rincian_keanggotaan: rincian,
    program_aktif: programAktif,
    jadwal_terdekat: jadwal,
  };
}

async function ringkasanSiswa(idUser) {
  const [[user]] = await pool.query('SELECT nama FROM users WHERE id_user = ?', [idUser]);
  const program = await getKeikutsertaan(idUser);
  const progres = await hitungProgresSiswa(idUser);
  const total = progres.reduce((a, p) => a + p.total_materi, 0);
  const diakses = progres.reduce((a, p) => a + p.diakses, 0);

  const [absensi] = await pool.query(
    `SELECT ab.status, COUNT(*) AS jumlah FROM absensi ab
       JOIN peserta_pendidikan pp ON pp.id_peserta = ab.id_peserta
       JOIN anggota an ON an.id_anggota = pp.id_anggota
      WHERE an.id_user = ? GROUP BY ab.status`,
    [idUser],
  );
  const kehadiran = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  absensi.forEach((r) => { kehadiran[r.status] = Number(r.jumlah); });

  const [jadwal] = await pool.query(
    `SELECT j.id_jadwal, j.tanggal, j.waktu, j.lokasi, j.kegiatan, p.nama_program
       FROM jadwal j
       JOIN program_pendidikan p ON p.id_program = j.id_program
       JOIN peserta_pendidikan pp ON pp.id_program = j.id_program
       JOIN anggota an ON an.id_anggota = pp.id_anggota
      WHERE an.id_user = ? AND j.tanggal >= CURDATE() ORDER BY j.tanggal, j.waktu LIMIT 5`,
    [idUser],
  );

  return {
    nama: user?.nama,
    terdaftar: program.length > 0,
    jumlah_program: program.length,
    progres: { diakses, total, persen: hitungPersen(diakses, total) },
    kehadiran,
    jadwal_terdekat: jadwal,
    program_saya: progres.map(({ materi: _, ...p }) => {
      const info = program.find((x) => x.id_program === p.id_program);
      return { ...p, jenis: info.jenis, tanggal_mulai: info.tanggal_mulai, tanggal_selesai: info.tanggal_selesai };
    }),
  };
}

/** GET /api/dashboard — isi bergantung role dari token. */
async function ringkasan(req, res) {
  const data = req.user.role === 'siswa' ? await ringkasanSiswa(req.user.id_user) : await ringkasanPengelola();
  return ok(res, { role: req.user.role, ...data });
}

module.exports = { ringkasan };
