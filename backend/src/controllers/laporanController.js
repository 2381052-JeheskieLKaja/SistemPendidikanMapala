const { pool } = require('../config/db');
const { ok } = require('../utils/response');
const { toId } = require('../utils/validators');
const { hitungPersen } = require('../utils/siswa');

const groupBy = (rows, key) => rows.reduce((acc, r) => ((acc[r[key]] ||= []).push(r), acc), {});

/** GET /api/laporan?id_program=&id_anggota= — rekap absensi, progres, dan evaluasi per Siswa. */
async function rekap(req, res) {
  const where = [];
  const params = [];
  if (req.query.id_program) { params.push(toId(req.query.id_program, 'ID program')); where.push(`pp.id_program = $${params.length}`); }
  if (req.query.id_anggota) { params.push(toId(req.query.id_anggota, 'ID anggota')); where.push(`pp.id_anggota = $${params.length}`); }

  const [peserta] = await pool.query(
    `SELECT pp.id_peserta, pp.id_program, pp.id_anggota, pp.tanggal_daftar, pp.status,
            u.nama, an.nim, an.status_keanggotaan, p.nama_program
       FROM peserta_pendidikan pp
       JOIN anggota an ON an.id_anggota = pp.id_anggota
       JOIN users u ON u.id_user = an.id_user
       JOIN program_pendidikan p ON p.id_program = pp.id_program
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY p.nama_program, u.nama`,
    params,
  );
  if (peserta.length === 0) return ok(res, []);

  const ids = peserta.map((p) => p.id_peserta);
  const [absensi] = await pool.query(
    `SELECT ab.id_peserta, ab.status, ab.keterangan, j.tanggal, j.waktu, j.kegiatan, j.lokasi
       FROM absensi ab JOIN jadwal j ON j.id_jadwal = ab.id_jadwal
      WHERE ab.id_peserta = ANY($1::int[]) ORDER BY j.tanggal, j.waktu`,
    [ids],
  );
  const [progres] = await pool.query(
    `SELECT pp.id_peserta, m.id_materi, m.judul, m.kategori,
            COALESCE(pm.status, 'belum_diakses') AS status, pm.tanggal_akses
       FROM peserta_pendidikan pp
       JOIN materi m ON m.id_program = pp.id_program
       LEFT JOIN progres_materi pm ON pm.id_peserta = pp.id_peserta AND pm.id_materi = m.id_materi
      WHERE pp.id_peserta = ANY($1::int[]) ORDER BY m.kategori, m.tanggal_upload`,
    [ids],
  );
  const [evaluasi] = await pool.query(
    `SELECT e.id_peserta, e.hasil_penilaian, e.catatan, e.tanggal_evaluasi, j.kegiatan, j.tanggal, pc.nama AS pencatat
       FROM evaluasi e JOIN jadwal j ON j.id_jadwal = e.id_jadwal JOIN users pc ON pc.id_user = e.id_pencatat
      WHERE e.id_peserta = ANY($1::int[]) ORDER BY j.tanggal`,
    [ids],
  );

  const abs = groupBy(absensi, 'id_peserta');
  const prog = groupBy(progres, 'id_peserta');
  const evals = groupBy(evaluasi, 'id_peserta');

  const data = peserta.map((p) => {
    const detailAbsensi = (abs[p.id_peserta] || []).map(({ id_peserta: _, ...r }) => r);
    const detailProgres = (prog[p.id_peserta] || []).map(({ id_peserta: _, ...r }) => r);
    const hitung = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    detailAbsensi.forEach((a) => { hitung[a.status] += 1; });
    const diakses = detailProgres.filter((m) => m.status === 'sudah_diakses').length;
    return {
      id_peserta: p.id_peserta,
      siswa: { id_anggota: p.id_anggota, nama: p.nama, nim: p.nim, status_keanggotaan: p.status_keanggotaan },
      program: { id_program: p.id_program, nama_program: p.nama_program },
      absensi: hitung,
      progres: { diakses, total: detailProgres.length, persen: hitungPersen(diakses, detailProgres.length) },
      evaluasi: (evals[p.id_peserta] || []).map(({ id_peserta: _, ...r }) => r),
      detail_absensi: detailAbsensi,
      detail_progres: detailProgres,
    };
  });
  return ok(res, data);
}

module.exports = { rekap };
