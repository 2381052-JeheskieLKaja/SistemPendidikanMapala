// In-memory mock database for AI Studio (seeded from backend/db/seed.sql).
// Provides a mysql2/promise-compatible query([rows, fields]) and transaction interface.

const SEED_PW = '$2a$10$80VYls4DMkOyuuyr5pwM.e87wdyFz89c/S2.u6pCogRT1ZJezqtWK'; // password123

function createInitialStore() {
  return {
    users: [
      { id_user: 1, nama: 'Admin MAPALA', email: 'admin@mapala.test', password: SEED_PW, no_hp: '081200000001', role: 'admin', status: 'aktif' },
      { id_user: 2, nama: 'Sekretaris Pengurus', email: 'pengurus@mapala.test', password: SEED_PW, no_hp: '081200000002', role: 'pengurus', status: 'aktif' },
      { id_user: 3, nama: 'Budi Santoso', email: 'budi@mapala.test', password: SEED_PW, no_hp: '081200000003', role: 'siswa', status: 'aktif' },
      { id_user: 4, nama: 'Sari Wulandari', email: 'sari@mapala.test', password: SEED_PW, no_hp: '081200000004', role: 'siswa', status: 'aktif' },
      { id_user: 5, nama: 'Andi Pratama', email: 'andi@mapala.test', password: SEED_PW, no_hp: '081200000005', role: 'siswa', status: 'aktif' },
    ],
    anggota: [
      { id_anggota: 1, id_user: 3, nim: '2381001', jurusan: 'Informatika', angkatan: '2023', kontak: '081200000003', status_keanggotaan: 'siswa' },
      { id_anggota: 2, id_user: 4, nim: '2381002', jurusan: 'Keperawatan', angkatan: '2023', kontak: '081200000004', status_keanggotaan: 'calon_anggota' },
      { id_anggota: 3, id_user: 5, nim: '2481003', jurusan: 'Akuntansi', angkatan: '2024', kontak: '081200000005', status_keanggotaan: 'calon_siswa' },
    ],
    program_pendidikan: [
      {
        id_program: 1,
        nama_program: 'Pendidikan Dasar (Inagurasi) 2026',
        jenis: 'rutin',
        deskripsi: 'Program wajib tahunan untuk calon anggota: survival, navigasi darat, dan P3K.',
        tanggal_mulai: '2026-09-01',
        tanggal_selesai: '2027-01-31',
      },
      {
        id_program: 2,
        nama_program: 'Diklatsar 2026',
        jenis: 'rutin',
        deskripsi: 'Pendidikan dan latihan dasar: tali-temali, tandu, dan bantuan hidup dasar.',
        tanggal_mulai: '2026-11-01',
        tanggal_selesai: '2026-12-20',
      },
      {
        id_program: 3,
        nama_program: 'Arung Jeram Semester Genap 2027',
        jenis: 'tambahan',
        deskripsi: 'Program tambahan pengenalan olahraga arung jeram.',
        tanggal_mulai: '2027-02-01',
        tanggal_selesai: '2027-03-31',
      },
    ],
    kurikulum: [
      { id_kurikulum: 1, id_program: 1, tahun: '2026', deskripsi: 'Kurikulum Inagurasi: survival, navigasi darat, P3K, dan long march.', status: 'diresmikan' },
      { id_kurikulum: 2, id_program: 2, tahun: '2026', deskripsi: 'Kurikulum Diklatsar: tali-temali, tandu, BHD.', status: 'draft' },
    ],
    materi: [
      { id_materi: 1, id_program: 1, judul: 'Survival Dasar', kategori: 'Survival', deskripsi: 'Teknik bertahan hidup di alam bebas: membuat bivak, mencari air, dan menyalakan api.', file_path: null, tanggal_upload: '2026-09-05 09:00:00' },
      { id_materi: 2, id_program: 1, judul: 'Membaca Peta Topografi', kategori: 'Navigasi', deskripsi: 'Mengenal garis kontur, skala, dan simbol pada peta topografi.', file_path: null, tanggal_upload: '2026-09-20 09:00:00' },
      { id_materi: 3, id_program: 1, judul: 'Penggunaan Kompas', kategori: 'Navigasi', deskripsi: 'Menentukan arah, sudut kompas, resection dan intersection.', file_path: null, tanggal_upload: '2026-10-01 09:00:00' },
      { id_materi: 4, id_program: 1, judul: 'Pertolongan Pertama', kategori: 'P3K', deskripsi: 'Penanganan luka, patah tulang, dan hipotermia di lapangan.', file_path: null, tanggal_upload: '2026-10-20 09:00:00' },
      { id_materi: 5, id_program: 2, judul: 'Simpul Dasar', kategori: 'Tali-temali dan Tandu', deskripsi: 'Simpul pangkal, simpul jangkar, dan pembuatan tandu darurat.', file_path: null, tanggal_upload: '2026-11-02 09:00:00' },
      { id_materi: 6, id_program: 2, judul: 'Bantuan Hidup Dasar', kategori: 'BHD', deskripsi: 'Langkah RJP (resusitasi jantung paru) untuk orang awam.', file_path: null, tanggal_upload: '2026-11-03 09:00:00' },
    ],
    jadwal: [
      { id_jadwal: 1, id_program: 1, tanggal: '2026-10-10', waktu: '07:00:00', lokasi: 'Kampus UNAI', kegiatan: 'Pembukaan dan materi Survival' },
      { id_jadwal: 2, id_program: 1, tanggal: '2026-11-07', waktu: '08:00:00', lokasi: 'Gunung Burangrang', kegiatan: 'Praktik Navigasi Darat' },
      { id_jadwal: 3, id_program: 1, tanggal: '2026-11-28', waktu: '07:30:00', lokasi: 'Lapangan UNAI', kegiatan: 'Simulasi P3K' },
      { id_jadwal: 4, id_program: 1, tanggal: '2026-12-12', waktu: '06:00:00', lokasi: 'Tangkuban Parahu', kegiatan: 'Long March' },
      { id_jadwal: 5, id_program: 2, tanggal: '2026-11-14', waktu: '08:00:00', lokasi: 'Aula UNAI', kegiatan: 'Kelas Tali-temali' },
      { id_jadwal: 6, id_program: 2, tanggal: '2026-12-05', waktu: '07:00:00', lokasi: 'Curug Cimahi', kegiatan: 'Praktik BHD' },
    ],
    peserta_pendidikan: [
      { id_peserta: 1, id_anggota: 1, id_program: 1, tanggal_daftar: '2026-09-01', status: 'aktif' },
      { id_peserta: 2, id_anggota: 2, id_program: 1, tanggal_daftar: '2026-09-01', status: 'aktif' },
      { id_peserta: 3, id_anggota: 1, id_program: 2, tanggal_daftar: '2026-11-01', status: 'aktif' },
    ],
    absensi: [
      { id_absensi: 1, id_peserta: 1, id_jadwal: 1, status: 'hadir', keterangan: null },
      { id_absensi: 2, id_peserta: 2, id_jadwal: 1, status: 'izin', keterangan: 'Acara keluarga' },
      { id_absensi: 3, id_peserta: 1, id_jadwal: 2, status: 'hadir', keterangan: null },
      { id_absensi: 4, id_peserta: 2, id_jadwal: 2, status: 'hadir', keterangan: null },
      { id_absensi: 5, id_peserta: 3, id_jadwal: 5, status: 'sakit', keterangan: 'Demam' },
    ],
    evaluasi: [
      { id_evaluasi: 1, id_peserta: 1, id_jadwal: 1, id_pencatat: 2, hasil_penilaian: 'Mampu membuat bivak sederhana dengan baik.', catatan: 'Perlu latihan menyalakan api unggun.', tanggal_evaluasi: '2026-10-10' },
      { id_evaluasi: 2, id_peserta: 1, id_jadwal: 2, id_pencatat: 2, hasil_penilaian: 'Navigasi akurat, orientasi medan baik.', catatan: null, tanggal_evaluasi: '2026-11-07' },
      { id_evaluasi: 3, id_peserta: 2, id_jadwal: 2, id_pencatat: 2, hasil_penilaian: 'Cukup baik membaca peta, masih ragu menentukan sudut kompas.', catatan: 'Ulangi latihan resection.', tanggal_evaluasi: '2026-11-07' },
    ],
    progres_materi: [
      { id_progres: 1, id_peserta: 1, id_materi: 1, status: 'sudah_diakses', tanggal_akses: '2026-10-11 19:00:00' },
      { id_progres: 2, id_peserta: 1, id_materi: 2, status: 'sudah_diakses', tanggal_akses: '2026-10-15 20:00:00' },
      { id_progres: 3, id_peserta: 2, id_materi: 1, status: 'sudah_diakses', tanggal_akses: '2026-10-12 18:30:00' },
    ],
    notifikasi: [
      { id_notifikasi: 1, id_user: 3, id_materi: 1, pesan: 'Materi baru: Survival Dasar', status_baca: 1, created_at: '2026-09-05 09:00:00' },
      { id_notifikasi: 2, id_user: 4, id_materi: 1, pesan: 'Materi baru: Survival Dasar', status_baca: 1, created_at: '2026-09-05 09:00:00' },
      { id_notifikasi: 3, id_user: 3, id_materi: 2, pesan: 'Materi baru: Membaca Peta Topografi', status_baca: 1, created_at: '2026-09-20 09:00:00' },
      { id_notifikasi: 4, id_user: 4, id_materi: 2, pesan: 'Materi baru: Membaca Peta Topografi', status_baca: 0, created_at: '2026-09-20 09:00:00' },
      { id_notifikasi: 5, id_user: 3, id_materi: 3, pesan: 'Materi baru: Penggunaan Kompas', status_baca: 0, created_at: '2026-10-01 09:00:00' },
      { id_notifikasi: 6, id_user: 4, id_materi: 3, pesan: 'Materi baru: Penggunaan Kompas', status_baca: 0, created_at: '2026-10-01 09:00:00' },
      { id_notifikasi: 7, id_user: 3, id_materi: 4, pesan: 'Materi baru: Pertolongan Pertama', status_baca: 0, created_at: '2026-10-20 09:00:00' },
      { id_notifikasi: 8, id_user: 4, id_materi: 4, pesan: 'Materi baru: Pertolongan Pertama', status_baca: 0, created_at: '2026-10-20 09:00:00' },
      { id_notifikasi: 9, id_user: 3, id_materi: 5, pesan: 'Materi baru: Simpul Dasar', status_baca: 0, created_at: '2026-11-02 09:00:00' },
      { id_notifikasi: 10, id_user: 3, id_materi: 6, pesan: 'Materi baru: Bantuan Hidup Dasar', status_baca: 0, created_at: '2026-11-03 09:00:00' },
    ],
    seq: {
      users: 5,
      anggota: 3,
      program_pendidikan: 3,
      kurikulum: 2,
      materi: 6,
      jadwal: 6,
      peserta_pendidikan: 3,
      absensi: 5,
      evaluasi: 3,
      progres_materi: 3,
      notifikasi: 10,
    },
  };
}

let dbState = createInitialStore();

const clone = (v) => JSON.parse(JSON.stringify(v));
const curDate = () => new Date().toISOString().slice(0, 10);
const nowTs = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const cmpStr = (a, b) => String(a ?? '').localeCompare(String(b ?? ''));
const cmpDesc = (a, b) => cmpStr(b, a);
const dupError = (msg = 'Duplicate entry') => Object.assign(new Error(msg), { code: 'ER_DUP_ENTRY' });

function nextId(table) {
  dbState.seq[table] = (dbState.seq[table] || 0) + 1;
  return dbState.seq[table];
}

function enrichProgram(p) {
  return {
    ...p,
    jumlah_peserta: dbState.peserta_pendidikan.filter((pp) => pp.id_program === p.id_program).length,
    jumlah_materi: dbState.materi.filter((m) => m.id_program === p.id_program).length,
    jumlah_jadwal: dbState.jadwal.filter((j) => j.id_program === p.id_program).length,
    jumlah_kurikulum: dbState.kurikulum.filter((k) => k.id_program === p.id_program).length,
  };
}

function enrichAnggota(a) {
  const u = dbState.users.find((x) => x.id_user === a.id_user) || {};
  return {
    id_anggota: a.id_anggota,
    id_user: a.id_user,
    nim: a.nim,
    jurusan: a.jurusan,
    angkatan: a.angkatan,
    kontak: a.kontak,
    status_keanggotaan: a.status_keanggotaan,
    nama: u.nama,
    email: u.email,
    no_hp: u.no_hp,
    status_akun: u.status,
    jumlah_program: dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === a.id_anggota).length,
  };
}

async function query(rawSql, params = []) {
  const sql = rawSql.replace(/\s+/g, ' ').trim();
  const s = sql.toLowerCase();

  if (s === 'select 1') return [[{ 1: 1 }], []];

  // ---- AUTH ----
  if (s.startsWith('select id_user, nama, password, role, status from users where email = ?')) {
    const email = String(params[0] || '').toLowerCase();
    const rows = dbState.users.filter((u) => u.email.toLowerCase() === email).map(({ id_user, nama, password, role, status }) => ({ id_user, nama, password, role, status }));
    return [clone(rows), []];
  }

  // ---- PUBLIK ----
  if (s.startsWith('select nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai from program_pendidikan')) {
    const rows = [...dbState.program_pendidikan]
      .sort((a, b) => cmpDesc(a.tanggal_mulai, b.tanggal_mulai) || cmpStr(a.nama_program, b.nama_program))
      .map(({ nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai }) => ({ nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai }));
    return [clone(rows), []];
  }

  // ---- DASHBOARD ----
  if (s.startsWith('select status_keanggotaan, count(*) as jumlah from anggota group by status_keanggotaan')) {
    const counts = {};
    dbState.anggota.forEach((a) => { counts[a.status_keanggotaan] = (counts[a.status_keanggotaan] || 0) + 1; });
    return [Object.entries(counts).map(([status_keanggotaan, jumlah]) => ({ status_keanggotaan, jumlah })), []];
  }

  if (s.includes('where curdate() between p.tanggal_mulai and p.tanggal_selesai')) {
    const today = curDate();
    const rows = dbState.program_pendidikan
      .filter((p) => p.tanggal_mulai && p.tanggal_selesai && p.tanggal_mulai <= today && today <= p.tanggal_selesai)
      .sort((a, b) => cmpStr(a.tanggal_mulai, b.tanggal_mulai))
      .map((p) => ({
        id_program: p.id_program,
        nama_program: p.nama_program,
        jenis: p.jenis,
        tanggal_mulai: p.tanggal_mulai,
        tanggal_selesai: p.tanggal_selesai,
        jumlah_peserta: dbState.peserta_pendidikan.filter((pp) => pp.id_program === p.id_program).length,
      }));
    return [clone(rows), []];
  }

  if (s.includes('from jadwal j join program_pendidikan p on p.id_program = j.id_program where j.tanggal >= curdate()')) {
    const today = curDate();
    const rows = dbState.jadwal
      .filter((j) => j.tanggal >= today)
      .sort((a, b) => cmpStr(a.tanggal, b.tanggal) || cmpStr(a.waktu, b.waktu))
      .slice(0, 5)
      .map((j) => {
        const p = dbState.program_pendidikan.find((x) => x.id_program === j.id_program) || {};
        return { id_jadwal: j.id_jadwal, id_program: j.id_program, tanggal: j.tanggal, waktu: j.waktu, lokasi: j.lokasi, kegiatan: j.kegiatan, nama_program: p.nama_program };
      });
    return [clone(rows), []];
  }

  if (s.startsWith('select nama from users where id_user = ?')) {
    const u = dbState.users.find((x) => x.id_user === Number(params[0]));
    return [u ? [{ nama: u.nama }] : [], []];
  }

  if (s.includes('select ab.status, count(*) as jumlah from absensi ab')) {
    const idUser = Number(params[0]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    const pesertaIds = new Set(an ? dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === an.id_anggota).map((pp) => pp.id_peserta) : []);
    const counts = {};
    dbState.absensi.filter((ab) => pesertaIds.has(ab.id_peserta)).forEach((ab) => {
      counts[ab.status] = (counts[ab.status] || 0) + 1;
    });
    return [Object.entries(counts).map(([status, jumlah]) => ({ status, jumlah })), []];
  }

  if (s.includes('where an.id_user = ? and j.tanggal >= curdate()')) {
    const idUser = Number(params[0]);
    const today = curDate();
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    const progIds = new Set(an ? dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === an.id_anggota).map((pp) => pp.id_program) : []);
    const rows = dbState.jadwal
      .filter((j) => progIds.has(j.id_program) && j.tanggal >= today)
      .sort((a, b) => cmpStr(a.tanggal, b.tanggal) || cmpStr(a.waktu, b.waktu))
      .slice(0, 5)
      .map((j) => {
        const p = dbState.program_pendidikan.find((x) => x.id_program === j.id_program) || {};
        return { id_jadwal: j.id_jadwal, tanggal: j.tanggal, waktu: j.waktu, lokasi: j.lokasi, kegiatan: j.kegiatan, nama_program: p.nama_program };
      });
    return [clone(rows), []];
  }

  // ---- PROGRAM ----
  if (s.includes('from program_pendidikan p where p.id_program = ?')) {
    const p = dbState.program_pendidikan.find((x) => x.id_program === Number(params[0]));
    return [p ? [clone(enrichProgram(p))] : [], []];
  }

  if (s.includes('from program_pendidikan p order by p.tanggal_mulai desc, p.id_program desc')) {
    const rows = [...dbState.program_pendidikan]
      .sort((a, b) => cmpDesc(a.tanggal_mulai, b.tanggal_mulai) || b.id_program - a.id_program)
      .map(enrichProgram);
    return [clone(rows), []];
  }

  if (s.startsWith('insert into program_pendidikan')) {
    const [nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai] = params;
    const id_program = nextId('program_pendidikan');
    dbState.program_pendidikan.push({ id_program, nama_program, jenis, deskripsi: deskripsi ?? null, tanggal_mulai: tanggal_mulai ?? null, tanggal_selesai: tanggal_selesai ?? null });
    return [{ insertId: id_program, affectedRows: 1 }, []];
  }

  if (s.startsWith('update program_pendidikan set')) {
    const [nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai, id] = params;
    const p = dbState.program_pendidikan.find((x) => x.id_program === Number(id));
    if (p) Object.assign(p, { nama_program, jenis, deskripsi: deskripsi ?? null, tanggal_mulai: tanggal_mulai ?? null, tanggal_selesai: tanggal_selesai ?? null });
    return [{ affectedRows: p ? 1 : 0 }, []];
  }

  if (s.startsWith('delete from program_pendidikan where id_program = ?')) {
    const id = Number(params[0]);
    const before = dbState.program_pendidikan.length;
    dbState.program_pendidikan = dbState.program_pendidikan.filter((x) => x.id_program !== id);
    return [{ affectedRows: before - dbState.program_pendidikan.length }, []];
  }

  // ---- ANGGOTA ----
  if (s.includes('from anggota a join users u on u.id_user = a.id_user where a.id_anggota = ?')) {
    const a = dbState.anggota.find((x) => x.id_anggota === Number(params[0]));
    return [a ? [clone(enrichAnggota(a))] : [], []];
  }

  if (s.includes('from anggota a join users u on u.id_user = a.id_user')) {
    let list = dbState.anggota.map(enrichAnggota);
    if (s.includes('where u.nama like ?')) {
      const q = String(params[0] || '').replace(/%/g, '').toLowerCase();
      list = list.filter((x) =>
        (x.nama || '').toLowerCase().includes(q) ||
        (x.email || '').toLowerCase().includes(q) ||
        (x.nim || '').toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => cmpStr(a.nama, b.nama));
    return [clone(list), []];
  }

  if (s.startsWith('select 1 from users where email = ? and id_user <> ?')) {
    const email = String(params[0] || '').toLowerCase();
    const exceptId = Number(params[1]);
    const found = dbState.users.some((u) => u.email.toLowerCase() === email && u.id_user !== exceptId);
    return [found ? [{ 1: 1 }] : [], []];
  }

  if (s.startsWith('select 1 from anggota where nim = ? and id_anggota <> ?')) {
    const nim = params[0];
    const exceptId = Number(params[1]);
    const found = dbState.anggota.some((a) => a.nim && a.nim === nim && a.id_anggota !== exceptId);
    return [found ? [{ 1: 1 }] : [], []];
  }

  if (s.startsWith('insert into users')) {
    const [nama, email, password, no_hp] = params;
    if (dbState.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) throw dupError('Email sudah digunakan');
    const id_user = nextId('users');
    dbState.users.push({ id_user, nama, email, password, no_hp: no_hp ?? null, role: 'siswa', status: 'aktif' });
    return [{ insertId: id_user, affectedRows: 1 }, []];
  }

  if (s.startsWith('insert into anggota')) {
    const [id_user, nim, jurusan, angkatan, kontak, status_keanggotaan] = params;
    if (nim && dbState.anggota.some((a) => a.nim === nim)) throw dupError('NIM sudah digunakan');
    const id_anggota = nextId('anggota');
    dbState.anggota.push({ id_anggota, id_user: Number(id_user), nim: nim ?? null, jurusan: jurusan ?? null, angkatan: angkatan ?? null, kontak: kontak ?? null, status_keanggotaan });
    return [{ insertId: id_anggota, affectedRows: 1 }, []];
  }

  if (s.startsWith('update users set nama = ?, email = ?, no_hp = ?, status = ? where id_user = ?')) {
    const [nama, email, no_hp, status, id] = params;
    const u = dbState.users.find((x) => x.id_user === Number(id));
    if (u) Object.assign(u, { nama, email, no_hp: no_hp ?? null, status });
    return [{ affectedRows: u ? 1 : 0 }, []];
  }

  if (s.startsWith('update anggota set nim = ?, jurusan = ?, angkatan = ?, kontak = ?, status_keanggotaan = ? where id_anggota = ?')) {
    const [nim, jurusan, angkatan, kontak, status_keanggotaan, id] = params;
    const a = dbState.anggota.find((x) => x.id_anggota === Number(id));
    if (a) Object.assign(a, { nim: nim ?? null, jurusan: jurusan ?? null, angkatan: angkatan ?? null, kontak: kontak ?? null, status_keanggotaan });
    return [{ affectedRows: a ? 1 : 0 }, []];
  }

  if (s.startsWith('delete from anggota where id_anggota = ?')) {
    const id = Number(params[0]);
    const before = dbState.anggota.length;
    dbState.anggota = dbState.anggota.filter((x) => x.id_anggota !== id);
    return [{ affectedRows: before - dbState.anggota.length }, []];
  }

  if (s.startsWith('delete from users where id_user = ?')) {
    const id = Number(params[0]);
    const before = dbState.users.length;
    dbState.users = dbState.users.filter((x) => x.id_user !== id);
    return [{ affectedRows: before - dbState.users.length }, []];
  }

  // ---- KURIKULUM ----
  if (s.startsWith('select * from kurikulum where id_kurikulum = ?')) {
    const k = dbState.kurikulum.find((x) => x.id_kurikulum === Number(params[0]));
    return [k ? [clone(k)] : [], []];
  }

  if (s.startsWith('select * from kurikulum where id_program = ?')) {
    const rows = dbState.kurikulum
      .filter((x) => x.id_program === Number(params[0]))
      .sort((a, b) => cmpDesc(a.tahun, b.tahun) || b.id_kurikulum - a.id_kurikulum);
    return [clone(rows), []];
  }

  if (s.startsWith('insert into kurikulum')) {
    const [id_program, tahun, deskripsi, status] = params;
    const id_kurikulum = nextId('kurikulum');
    dbState.kurikulum.push({ id_kurikulum, id_program: Number(id_program), tahun, deskripsi: deskripsi ?? null, status });
    return [{ insertId: id_kurikulum, affectedRows: 1 }, []];
  }

  if (s.startsWith('update kurikulum set')) {
    const [tahun, deskripsi, status, id] = params;
    const k = dbState.kurikulum.find((x) => x.id_kurikulum === Number(id));
    if (k) Object.assign(k, { tahun, deskripsi: deskripsi ?? null, status });
    return [{ affectedRows: k ? 1 : 0 }, []];
  }

  // ---- MATERI ----
  if (s.startsWith('select * from materi where id_materi = ?')) {
    const m = dbState.materi.find((x) => x.id_materi === Number(params[0]));
    return [m ? [clone(m)] : [], []];
  }

  if (s.startsWith('select * from materi where id_program = ?')) {
    const rows = dbState.materi
      .filter((x) => x.id_program === Number(params[0]))
      .sort((a, b) => cmpStr(a.kategori, b.kategori) || cmpDesc(a.tanggal_upload, b.tanggal_upload));
    return [clone(rows), []];
  }

  if (s.startsWith('insert into materi')) {
    const [id_program, judul, kategori, deskripsi, file_path] = params;
    const id_materi = nextId('materi');
    dbState.materi.push({ id_materi, id_program: Number(id_program), judul, kategori, deskripsi: deskripsi ?? null, file_path: file_path ?? null, tanggal_upload: nowTs() });
    return [{ insertId: id_materi, affectedRows: 1 }, []];
  }

  if (s.startsWith('select a.id_user from peserta_pendidikan pp join anggota a on a.id_anggota = pp.id_anggota where pp.id_program = ?')) {
    const idProgram = Number(params[0]);
    const rows = dbState.peserta_pendidikan
      .filter((pp) => pp.id_program === idProgram)
      .map((pp) => dbState.anggota.find((a) => a.id_anggota === pp.id_anggota))
      .filter(Boolean)
      .map((a) => ({ id_user: a.id_user }));
    return [clone(rows), []];
  }

  if (s.startsWith('insert into notifikasi (id_user, id_materi, pesan, status_baca) values ?')) {
    const tuples = params[0] || [];
    for (const [id_user, id_materi, pesan, status_baca] of tuples) {
      dbState.notifikasi.push({
        id_notifikasi: nextId('notifikasi'),
        id_user: Number(id_user),
        id_materi: Number(id_materi),
        pesan,
        status_baca: status_baca ? 1 : 0,
        created_at: nowTs(),
      });
    }
    return [{ affectedRows: tuples.length }, []];
  }

  if (s.startsWith('update materi set')) {
    const [judul, kategori, deskripsi, file_path, id] = params;
    const m = dbState.materi.find((x) => x.id_materi === Number(id));
    if (m) Object.assign(m, { judul, kategori, deskripsi: deskripsi ?? null, file_path: file_path ?? null });
    return [{ affectedRows: m ? 1 : 0 }, []];
  }

  if (s.startsWith('delete from materi where id_materi = ?')) {
    const id = Number(params[0]);
    const before = dbState.materi.length;
    dbState.materi = dbState.materi.filter((x) => x.id_materi !== id);
    dbState.progres_materi = dbState.progres_materi.filter((x) => x.id_materi !== id);
    dbState.notifikasi = dbState.notifikasi.filter((x) => x.id_materi !== id);
    return [{ affectedRows: before - dbState.materi.length }, []];
  }

  if (s.includes("coalesce(pm.status, 'belum_diakses') as status_akses")) {
    const idUser = Number(params[0]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    const pps = an ? dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === an.id_anggota) : [];
    const rows = [];
    for (const pp of pps) {
      const prog = dbState.program_pendidikan.find((p) => p.id_program === pp.id_program) || {};
      const mats = dbState.materi.filter((m) => m.id_program === pp.id_program);
      for (const m of mats) {
        const pm = dbState.progres_materi.find((x) => x.id_materi === m.id_materi && x.id_peserta === pp.id_peserta);
        rows.push({
          ...m,
          nama_program: prog.nama_program,
          status_akses: pm ? pm.status : 'belum_diakses',
          tanggal_akses: pm ? pm.tanggal_akses : null,
        });
      }
    }
    rows.sort((a, b) => cmpStr(a.nama_program, b.nama_program) || cmpStr(a.kategori, b.kategori) || cmpStr(a.tanggal_upload, b.tanggal_upload));
    return [clone(rows), []];
  }

  // ---- JADWAL ----
  if (s.includes('from jadwal j join program_pendidikan p on p.id_program = j.id_program where j.id_jadwal = ?')) {
    const j = dbState.jadwal.find((x) => x.id_jadwal === Number(params[0]));
    if (!j) return [[], []];
    const p = dbState.program_pendidikan.find((x) => x.id_program === j.id_program) || {};
    return [[clone({ ...j, nama_program: p.nama_program })], []];
  }

  if (s.includes('from jadwal j where j.id_program = ?')) {
    const idProgram = Number(params[0]);
    const rows = dbState.jadwal
      .filter((j) => j.id_program === idProgram)
      .sort((a, b) => cmpStr(a.tanggal, b.tanggal) || cmpStr(a.waktu, b.waktu))
      .map((j) => ({
        ...j,
        jumlah_absensi: dbState.absensi.filter((a) => a.id_jadwal === j.id_jadwal).length,
        jumlah_evaluasi: dbState.evaluasi.filter((e) => e.id_jadwal === j.id_jadwal).length,
      }));
    return [clone(rows), []];
  }

  if (s.startsWith('insert into jadwal')) {
    const [id_program, tanggal, waktu, lokasi, kegiatan] = params;
    const id_jadwal = nextId('jadwal');
    dbState.jadwal.push({ id_jadwal, id_program: Number(id_program), tanggal, waktu: waktu.length === 5 ? `${waktu}:00` : waktu, lokasi, kegiatan });
    return [{ insertId: id_jadwal, affectedRows: 1 }, []];
  }

  if (s.startsWith('update jadwal set')) {
    const [tanggal, waktu, lokasi, kegiatan, id] = params;
    const j = dbState.jadwal.find((x) => x.id_jadwal === Number(id));
    if (j) Object.assign(j, { tanggal, waktu: waktu.length === 5 ? `${waktu}:00` : waktu, lokasi, kegiatan });
    return [{ affectedRows: j ? 1 : 0 }, []];
  }

  if (s.includes('from absensi where id_jadwal = ?') && s.includes('from evaluasi where id_jadwal = ?')) {
    const id = Number(params[0]);
    const n = dbState.absensi.filter((a) => a.id_jadwal === id).length + dbState.evaluasi.filter((e) => e.id_jadwal === id).length;
    return [[{ n }], []];
  }

  if (s.startsWith('delete from jadwal where id_jadwal = ?')) {
    const id = Number(params[0]);
    const before = dbState.jadwal.length;
    dbState.jadwal = dbState.jadwal.filter((x) => x.id_jadwal !== id);
    return [{ affectedRows: before - dbState.jadwal.length }, []];
  }

  if (s.includes('from jadwal j join program_pendidikan p on p.id_program = j.id_program join peserta_pendidikan pp on pp.id_program = j.id_program join anggota a on a.id_anggota = pp.id_anggota where a.id_user = ?')) {
    const idUser = Number(params[0]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    const progIds = new Set(an ? dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === an.id_anggota).map((pp) => pp.id_program) : []);
    const rows = dbState.jadwal
      .filter((j) => progIds.has(j.id_program))
      .sort((a, b) => cmpStr(a.tanggal, b.tanggal) || cmpStr(a.waktu, b.waktu))
      .map((j) => {
        const p = dbState.program_pendidikan.find((x) => x.id_program === j.id_program) || {};
        return { ...j, nama_program: p.nama_program };
      });
    return [clone(rows), []];
  }

  // ---- PESERTA ----
  if (s.includes('from peserta_pendidikan pp join anggota a on a.id_anggota = pp.id_anggota join users u on u.id_user = a.id_user where pp.id_program = ?')) {
    const idProgram = Number(params[0]);
    const rows = dbState.peserta_pendidikan
      .filter((pp) => pp.id_program === idProgram)
      .map((pp) => {
        const a = dbState.anggota.find((x) => x.id_anggota === pp.id_anggota) || {};
        const u = dbState.users.find((x) => x.id_user === a.id_user) || {};
        return {
          id_peserta: pp.id_peserta,
          id_anggota: pp.id_anggota,
          id_program: pp.id_program,
          tanggal_daftar: pp.tanggal_daftar,
          status: pp.status,
          nim: a.nim,
          jurusan: a.jurusan,
          angkatan: a.angkatan,
          status_keanggotaan: a.status_keanggotaan,
          nama: u.nama,
          email: u.email,
        };
      })
      .sort((a, b) => cmpStr(a.nama, b.nama));
    return [clone(rows), []];
  }

  if (s.startsWith('select 1 from anggota where id_anggota = ?')) {
    const found = dbState.anggota.some((a) => a.id_anggota === Number(params[0]));
    return [found ? [{ 1: 1 }] : [], []];
  }

  if (s.startsWith('select 1 from peserta_pendidikan where id_anggota = ? and id_program = ?')) {
    const found = dbState.peserta_pendidikan.some((pp) => pp.id_anggota === Number(params[0]) && pp.id_program === Number(params[1]));
    return [found ? [{ 1: 1 }] : [], []];
  }

  if (s.startsWith('insert into peserta_pendidikan')) {
    const id_anggota = Number(params[0]);
    const id_program = Number(params[1]);
    if (dbState.peserta_pendidikan.some((pp) => pp.id_anggota === id_anggota && pp.id_program === id_program)) {
      throw dupError('Siswa sudah terdaftar pada program ini');
    }
    const id_peserta = nextId('peserta_pendidikan');
    dbState.peserta_pendidikan.push({ id_peserta, id_anggota, id_program, tanggal_daftar: curDate(), status: 'aktif' });
    return [{ insertId: id_peserta, affectedRows: 1 }, []];
  }

  // ---- ABSENSI ----
  if (s.includes('left join absensi ab on ab.id_peserta = pp.id_peserta and ab.id_jadwal = ?')) {
    const idJadwal = Number(params[0]);
    const idProgram = Number(params[1]);
    const rows = dbState.peserta_pendidikan
      .filter((pp) => pp.id_program === idProgram)
      .map((pp) => {
        const an = dbState.anggota.find((a) => a.id_anggota === pp.id_anggota) || {};
        const u = dbState.users.find((x) => x.id_user === an.id_user) || {};
        const ab = dbState.absensi.find((x) => x.id_peserta === pp.id_peserta && x.id_jadwal === idJadwal);
        return {
          id_peserta: pp.id_peserta,
          nama: u.nama,
          nim: an.nim,
          status: ab ? ab.status : null,
          keterangan: ab ? ab.keterangan : null,
        };
      })
      .sort((a, b) => cmpStr(a.nama, b.nama));
    return [clone(rows), []];
  }

  if (s.startsWith('insert into absensi')) {
    const [id_peserta, id_jadwal, status, keterangan] = params;
    const existing = dbState.absensi.find((x) => x.id_peserta === Number(id_peserta) && x.id_jadwal === Number(id_jadwal));
    if (existing) {
      existing.status = status;
      existing.keterangan = keterangan ?? null;
      return [{ insertId: existing.id_absensi, affectedRows: 2 }, []];
    }
    const id_absensi = nextId('absensi');
    dbState.absensi.push({ id_absensi, id_peserta: Number(id_peserta), id_jadwal: Number(id_jadwal), status, keterangan: keterangan ?? null });
    return [{ insertId: id_absensi, affectedRows: 1 }, []];
  }

  if (s.includes('from absensi ab join peserta_pendidikan pp on pp.id_peserta = ab.id_peserta')) {
    const idUser = Number(params[0]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    const pesertaIds = new Set(an ? dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === an.id_anggota).map((pp) => pp.id_peserta) : []);
    const rows = dbState.absensi
      .filter((ab) => pesertaIds.has(ab.id_peserta))
      .map((ab) => {
        const pp = dbState.peserta_pendidikan.find((x) => x.id_peserta === ab.id_peserta) || {};
        const j = dbState.jadwal.find((x) => x.id_jadwal === ab.id_jadwal) || {};
        const p = dbState.program_pendidikan.find((x) => x.id_program === pp.id_program) || {};
        return {
          id_absensi: ab.id_absensi,
          status: ab.status,
          keterangan: ab.keterangan,
          tanggal: j.tanggal,
          waktu: j.waktu,
          lokasi: j.lokasi,
          kegiatan: j.kegiatan,
          nama_program: p.nama_program,
        };
      })
      .sort((a, b) => cmpDesc(a.tanggal, b.tanggal) || cmpDesc(a.waktu, b.waktu));
    return [clone(rows), []];
  }

  // ---- EVALUASI ----
  if (s.includes('left join evaluasi e on e.id_peserta = pp.id_peserta and e.id_jadwal = ?')) {
    const idJadwal = Number(params[0]);
    const idProgram = Number(params[1]);
    const rows = dbState.peserta_pendidikan
      .filter((pp) => pp.id_program === idProgram)
      .map((pp) => {
        const an = dbState.anggota.find((a) => a.id_anggota === pp.id_anggota) || {};
        const u = dbState.users.find((x) => x.id_user === an.id_user) || {};
        const e = dbState.evaluasi.find((x) => x.id_peserta === pp.id_peserta && x.id_jadwal === idJadwal);
        const pc = e ? dbState.users.find((x) => x.id_user === e.id_pencatat) : null;
        return {
          id_peserta: pp.id_peserta,
          nama: u.nama,
          nim: an.nim,
          id_evaluasi: e ? e.id_evaluasi : null,
          hasil_penilaian: e ? e.hasil_penilaian : null,
          catatan: e ? e.catatan : null,
          tanggal_evaluasi: e ? e.tanggal_evaluasi : null,
          pencatat: pc ? pc.nama : null,
        };
      })
      .sort((a, b) => cmpStr(a.nama, b.nama));
    return [clone(rows), []];
  }

  if (s.startsWith('insert into evaluasi')) {
    const [id_peserta, id_jadwal, id_pencatat, hasil_penilaian, catatan] = params;
    const today = curDate();
    const existing = dbState.evaluasi.find((x) => x.id_peserta === Number(id_peserta) && x.id_jadwal === Number(id_jadwal));
    if (existing) {
      Object.assign(existing, { id_pencatat: Number(id_pencatat), hasil_penilaian, catatan: catatan ?? null, tanggal_evaluasi: today });
      return [{ insertId: existing.id_evaluasi, affectedRows: 2 }, []];
    }
    const id_evaluasi = nextId('evaluasi');
    dbState.evaluasi.push({
      id_evaluasi,
      id_peserta: Number(id_peserta),
      id_jadwal: Number(id_jadwal),
      id_pencatat: Number(id_pencatat),
      hasil_penilaian,
      catatan: catatan ?? null,
      tanggal_evaluasi: today,
    });
    return [{ insertId: id_evaluasi, affectedRows: 1 }, []];
  }

  // ---- PROGRES MATERI ----
  if (s.startsWith('insert into progres_materi')) {
    const [id_peserta, id_materi] = params;
    const existing = dbState.progres_materi.find((x) => x.id_peserta === Number(id_peserta) && x.id_materi === Number(id_materi));
    if (existing) {
      existing.status = 'sudah_diakses';
      existing.tanggal_akses = existing.tanggal_akses || nowTs();
      return [{ insertId: existing.id_progres, affectedRows: 2 }, []];
    }
    const id_progres = nextId('progres_materi');
    dbState.progres_materi.push({ id_progres, id_peserta: Number(id_peserta), id_materi: Number(id_materi), status: 'sudah_diakses', tanggal_akses: nowTs() });
    return [{ insertId: id_progres, affectedRows: 1 }, []];
  }

  if (s.startsWith('select status, tanggal_akses from progres_materi where id_peserta = ? and id_materi = ?')) {
    const pm = dbState.progres_materi.find((x) => x.id_peserta === Number(params[0]) && x.id_materi === Number(params[1]));
    return [pm ? [{ status: pm.status, tanggal_akses: pm.tanggal_akses }] : [], []];
  }

  if (s.includes('from materi m left join progres_materi pm on pm.id_materi = m.id_materi and pm.id_peserta = ? where m.id_program = ?')) {
    const idPeserta = Number(params[0]);
    const idProgram = Number(params[1]);
    const rows = dbState.materi
      .filter((m) => m.id_program === idProgram)
      .sort((a, b) => cmpStr(a.kategori, b.kategori) || cmpStr(a.tanggal_upload, b.tanggal_upload))
      .map((m) => {
        const pm = dbState.progres_materi.find((x) => x.id_materi === m.id_materi && x.id_peserta === idPeserta);
        return {
          id_materi: m.id_materi,
          judul: m.judul,
          kategori: m.kategori,
          status: pm ? pm.status : 'belum_diakses',
          tanggal_akses: pm ? pm.tanggal_akses : null,
        };
      });
    return [clone(rows), []];
  }

  if (s.includes('from evaluasi e join peserta_pendidikan pp on pp.id_peserta = e.id_peserta')) {
    const idUser = Number(params[0]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    const pesertaIds = new Set(an ? dbState.peserta_pendidikan.filter((pp) => pp.id_anggota === an.id_anggota).map((pp) => pp.id_peserta) : []);
    const rows = dbState.evaluasi
      .filter((e) => pesertaIds.has(e.id_peserta))
      .map((e) => {
        const pp = dbState.peserta_pendidikan.find((x) => x.id_peserta === e.id_peserta) || {};
        const j = dbState.jadwal.find((x) => x.id_jadwal === e.id_jadwal) || {};
        const p = dbState.program_pendidikan.find((x) => x.id_program === pp.id_program) || {};
        const pc = dbState.users.find((x) => x.id_user === e.id_pencatat) || {};
        return {
          id_evaluasi: e.id_evaluasi,
          hasil_penilaian: e.hasil_penilaian,
          catatan: e.catatan,
          tanggal_evaluasi: e.tanggal_evaluasi,
          kegiatan: j.kegiatan,
          tanggal: j.tanggal,
          nama_program: p.nama_program,
          pencatat: pc.nama,
        };
      })
      .sort((a, b) => cmpDesc(a.tanggal, b.tanggal));
    return [clone(rows), []];
  }

  // ---- LAPORAN ----
  if (s.includes('select pp.id_peserta, pp.id_program, pp.id_anggota, pp.tanggal_daftar, pp.status, u.nama, an.nim, an.status_keanggotaan, p.nama_program')) {
    let idx = 0;
    let idProgram = null;
    let idAnggota = null;
    if (s.includes('pp.id_program = ?')) idProgram = Number(params[idx++]);
    if (s.includes('pp.id_anggota = ?')) idAnggota = Number(params[idx++]);

    const rows = dbState.peserta_pendidikan
      .filter((pp) => (!idProgram || pp.id_program === idProgram) && (!idAnggota || pp.id_anggota === idAnggota))
      .map((pp) => {
        const an = dbState.anggota.find((a) => a.id_anggota === pp.id_anggota) || {};
        const u = dbState.users.find((x) => x.id_user === an.id_user) || {};
        const p = dbState.program_pendidikan.find((x) => x.id_program === pp.id_program) || {};
        return {
          id_peserta: pp.id_peserta,
          id_program: pp.id_program,
          id_anggota: pp.id_anggota,
          tanggal_daftar: pp.tanggal_daftar,
          status: pp.status,
          nama: u.nama,
          nim: an.nim,
          status_keanggotaan: an.status_keanggotaan,
          nama_program: p.nama_program,
        };
      })
      .sort((a, b) => cmpStr(a.nama_program, b.nama_program) || cmpStr(a.nama, b.nama));
    return [clone(rows), []];
  }

  if (s.includes('from absensi ab join jadwal j on j.id_jadwal = ab.id_jadwal where ab.id_peserta in (?)')) {
    const idSet = new Set((params[0] || []).map(Number));
    const rows = dbState.absensi
      .filter((ab) => idSet.has(ab.id_peserta))
      .map((ab) => {
        const j = dbState.jadwal.find((x) => x.id_jadwal === ab.id_jadwal) || {};
        return {
          id_peserta: ab.id_peserta,
          status: ab.status,
          keterangan: ab.keterangan,
          tanggal: j.tanggal,
          waktu: j.waktu,
          kegiatan: j.kegiatan,
          lokasi: j.lokasi,
        };
      })
      .sort((a, b) => cmpStr(a.tanggal, b.tanggal) || cmpStr(a.waktu, b.waktu));
    return [clone(rows), []];
  }

  if (s.includes('from peserta_pendidikan pp join materi m on m.id_program = pp.id_program left join progres_materi pm')) {
    const idSet = new Set((params[0] || []).map(Number));
    const rows = [];
    for (const pp of dbState.peserta_pendidikan.filter((x) => idSet.has(x.id_peserta))) {
      for (const m of dbState.materi.filter((x) => x.id_program === pp.id_program)) {
        const pm = dbState.progres_materi.find((x) => x.id_peserta === pp.id_peserta && x.id_materi === m.id_materi);
        rows.push({
          id_peserta: pp.id_peserta,
          id_materi: m.id_materi,
          judul: m.judul,
          kategori: m.kategori,
          status: pm ? pm.status : 'belum_diakses',
          tanggal_akses: pm ? pm.tanggal_akses : null,
          _tanggal_upload: m.tanggal_upload,
        });
      }
    }
    rows.sort((a, b) => cmpStr(a.kategori, b.kategori) || cmpStr(a._tanggal_upload, b._tanggal_upload));
    return [clone(rows.map(({ _tanggal_upload: _, ...r }) => r)), []];
  }

  if (s.includes('from evaluasi e join jadwal j on j.id_jadwal = e.id_jadwal join users pc on pc.id_user = e.id_pencatat where e.id_peserta in (?)')) {
    const idSet = new Set((params[0] || []).map(Number));
    const rows = dbState.evaluasi
      .filter((e) => idSet.has(e.id_peserta))
      .map((e) => {
        const j = dbState.jadwal.find((x) => x.id_jadwal === e.id_jadwal) || {};
        const pc = dbState.users.find((x) => x.id_user === e.id_pencatat) || {};
        return {
          id_peserta: e.id_peserta,
          hasil_penilaian: e.hasil_penilaian,
          catatan: e.catatan,
          tanggal_evaluasi: e.tanggal_evaluasi,
          kegiatan: j.kegiatan,
          tanggal: j.tanggal,
          pencatat: pc.nama,
        };
      })
      .sort((a, b) => cmpStr(a.tanggal, b.tanggal));
    return [clone(rows), []];
  }

  // ---- NOTIFIKASI ----
  if (s.includes('from notifikasi n join materi m on m.id_materi = n.id_materi where n.id_user = ?')) {
    const idUser = Number(params[0]);
    const rows = dbState.notifikasi
      .filter((n) => n.id_user === idUser)
      .sort((a, b) => cmpDesc(a.created_at, b.created_at) || b.id_notifikasi - a.id_notifikasi)
      .slice(0, 50)
      .map((n) => {
        const m = dbState.materi.find((x) => x.id_materi === n.id_materi) || {};
        return {
          id_notifikasi: n.id_notifikasi,
          id_materi: n.id_materi,
          pesan: n.pesan,
          status_baca: n.status_baca,
          created_at: n.created_at,
          judul: m.judul,
          kategori: m.kategori,
        };
      });
    return [clone(rows), []];
  }

  if (s.startsWith('select count(*) as belum from notifikasi where id_user = ? and status_baca = false')) {
    const idUser = Number(params[0]);
    const belum = dbState.notifikasi.filter((n) => n.id_user === idUser && !n.status_baca).length;
    return [[{ belum }], []];
  }

  if (s.startsWith('select id_user, id_materi from notifikasi where id_notifikasi = ?')) {
    const n = dbState.notifikasi.find((x) => x.id_notifikasi === Number(params[0]));
    return [n ? [{ id_user: n.id_user, id_materi: n.id_materi }] : [], []];
  }

  if (s.startsWith('update notifikasi set status_baca = true where id_notifikasi = ?')) {
    const n = dbState.notifikasi.find((x) => x.id_notifikasi === Number(params[0]));
    if (n) n.status_baca = 1;
    return [{ affectedRows: n ? 1 : 0 }, []];
  }

  // ---- PROFIL ----
  if (s.includes('from users u left join anggota a on a.id_user = u.id_user where u.id_user = ?')) {
    const u = dbState.users.find((x) => x.id_user === Number(params[0]));
    if (!u) return [[], []];
    const a = dbState.anggota.find((x) => x.id_user === u.id_user) || {};
    return [[clone({
      id_user: u.id_user,
      nama: u.nama,
      email: u.email,
      no_hp: u.no_hp,
      role: u.role,
      status: u.status,
      nim: a.nim ?? null,
      jurusan: a.jurusan ?? null,
      angkatan: a.angkatan ?? null,
      status_keanggotaan: a.status_keanggotaan ?? null,
    })], []];
  }

  if (s.startsWith('update users set nama = ?, email = ?, no_hp = ? where id_user = ?')) {
    const [nama, email, no_hp, id] = params;
    const u = dbState.users.find((x) => x.id_user === Number(id));
    if (u) Object.assign(u, { nama, email, no_hp: no_hp ?? null });
    return [{ affectedRows: u ? 1 : 0 }, []];
  }

  if (s.startsWith('select password from users where id_user = ?')) {
    const u = dbState.users.find((x) => x.id_user === Number(params[0]));
    return [u ? [{ password: u.password }] : [], []];
  }

  if (s.startsWith('update users set password = ? where id_user = ?')) {
    const [password, id] = params;
    const u = dbState.users.find((x) => x.id_user === Number(id));
    if (u) u.password = password;
    return [{ affectedRows: u ? 1 : 0 }, []];
  }

  // ---- SISWA UTILS ----
  if (s.includes('from peserta_pendidikan pp join anggota a on a.id_anggota = pp.id_anggota join program_pendidikan p on p.id_program = pp.id_program where a.id_user = ?')) {
    const idUser = Number(params[0]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    if (!an) return [[], []];
    const rows = dbState.peserta_pendidikan
      .filter((pp) => pp.id_anggota === an.id_anggota)
      .map((pp) => {
        const p = dbState.program_pendidikan.find((x) => x.id_program === pp.id_program) || {};
        return {
          id_peserta: pp.id_peserta,
          id_program: pp.id_program,
          tanggal_daftar: pp.tanggal_daftar,
          status: pp.status,
          nama_program: p.nama_program,
          jenis: p.jenis,
          tanggal_mulai: p.tanggal_mulai,
          tanggal_selesai: p.tanggal_selesai,
        };
      })
      .sort((a, b) => cmpDesc(a.tanggal_mulai, b.tanggal_mulai) || a.id_program - b.id_program);
    return [clone(rows), []];
  }

  if (s.startsWith('select pp.id_peserta from peserta_pendidikan pp join anggota a on a.id_anggota = pp.id_anggota where a.id_user = ? and pp.id_program = ?')) {
    const idUser = Number(params[0]);
    const idProgram = Number(params[1]);
    const an = dbState.anggota.find((a) => a.id_user === idUser);
    if (!an) return [[], []];
    const pp = dbState.peserta_pendidikan.find((x) => x.id_anggota === an.id_anggota && x.id_program === idProgram);
    return [pp ? [{ id_peserta: pp.id_peserta }] : [], []];
  }

  console.warn('[AI Studio MockDB] Unhandled SQL query:', sql);
  return [[], []];
}

const mockPool = {
  query,
  async getConnection() {
    let snapshot = null;
    return {
      query,
      async beginTransaction() { snapshot = clone(dbState); },
      async commit() { snapshot = null; },
      async rollback() { if (snapshot) { dbState = snapshot; snapshot = null; } },
      release() {},
    };
  },
};

module.exports = { mockPool };
