// Black Box Testing — skenario resmi Tabel 5 (TC-01 s.d. TC-21) dan skenario tambahan (TC-A1 s.d. TC-A10).
// Dijalankan pada database test yang di-reset ke data seed bersih. Setiap test hanya memeriksa masukan dan keluaran.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { login, call, upload, resetDb, q, pool, request, app } = require('./helpers');

before(resetDb);
after(() => pool.end());

const state = {};

test('TC-01 Login benar (Admin, Pengurus, Siswa) → token dengan role yang benar', async () => {
  for (const [email, role] of [['admin@mapala.test', 'admin'], ['pengurus@mapala.test', 'pengurus'], ['budi@mapala.test', 'siswa']]) {
    const res = await login(email);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.role, role);
    assert.equal(res.body.data.user.role, role);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.password, undefined);
  }
});

test('TC-02 Login password salah → pesan login gagal (401, pesan sama untuk email tidak terdaftar)', async () => {
  const salah = await login('admin@mapala.test', 'salah123');
  const tidakAda = await login('tidakada@mapala.test', 'salah123');
  assert.equal(salah.status, 401);
  assert.equal(tidakAda.status, 401);
  assert.equal(salah.body.message, 'Email atau password salah');
  assert.equal(tidakAda.body.message, salah.body.message);
});

test('TC-03 Logout → tidak ada endpoint server; tanpa token endpoint terproteksi menolak (401)', async () => {
  const logout = await call('admin', 'post', '/api/auth/logout');
  assert.equal(logout.status, 404); // logout cukup menghapus token di frontend (K8)
  const res = await request(app).get('/api/dashboard');
  assert.equal(res.status, 401);
});

test('TC-04 Admin menambah anggota lengkap → data tersimpan dan akun Siswa dibuat (bisa login)', async () => {
  const res = await call('admin', 'post', '/api/anggota', {
    nama: 'Rina Kartika', email: 'rina@mapala.test', nim: '2581010', jurusan: 'Farmasi', angkatan: '2025',
    kontak: '0812999', status_keanggotaan: 'calon_siswa', password: 'rahasia123',
  });
  assert.equal(res.status, 201);
  state.idAnggota = res.body.data.id_anggota;
  const [u] = await q("SELECT role, password FROM users WHERE email = 'rina@mapala.test'");
  assert.equal(u.role, 'siswa');
  assert.notEqual(u.password, 'rahasia123'); // tersimpan sebagai hash
  assert.equal((await login('rina@mapala.test', 'rahasia123')).status, 200);
});

test('TC-05 Admin mengubah status tahapan keanggotaan → status tersimpan', async () => {
  const res = await call('admin', 'put', `/api/anggota/${state.idAnggota}`, {
    nama: 'Rina Kartika', email: 'rina@mapala.test', nim: '2581010', status_keanggotaan: 'siswa',
  });
  assert.equal(res.status, 200);
  const [a] = await q('SELECT status_keanggotaan FROM anggota WHERE id_anggota = $1', [state.idAnggota]);
  assert.equal(a.status_keanggotaan, 'siswa');
});

test('TC-06 Admin menambah program pendidikan → program tampil pada daftar program', async () => {
  const res = await call('admin', 'post', '/api/program', {
    nama_program: 'Panjat Tebing 2027', jenis: 'tambahan', deskripsi: 'Teknik dasar panjat tebing',
    tanggal_mulai: '2027-04-01', tanggal_selesai: '2027-05-31',
  });
  assert.equal(res.status, 201);
  state.idProgram = res.body.data.id_program;
  const list = await call('admin', 'get', '/api/program');
  assert.ok(list.body.data.some((p) => p.id_program === state.idProgram && p.nama_program === 'Panjat Tebing 2027'));
});

test('TC-07 Admin menambah kurikulum pada program → tersimpan pada program terpilih', async () => {
  const res = await call('admin', 'post', '/api/kurikulum', {
    id_program: state.idProgram, tahun: '2027', deskripsi: 'Kurikulum panjat tebing', status: 'draft',
  });
  assert.equal(res.status, 201);
  const list = await call('admin', 'get', `/api/kurikulum?id_program=${state.idProgram}`);
  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.data[0].tahun, '2027');
});

test('TC-10 Admin mendaftarkan siswa ke program → tersimpan sebagai peserta', async () => {
  const res = await call('admin', 'post', '/api/peserta', { id_anggota: state.idAnggota, id_program: state.idProgram });
  assert.equal(res.status, 201);
  const list = await call('admin', 'get', `/api/peserta?id_program=${state.idProgram}`);
  assert.ok(list.body.data.some((p) => p.id_anggota === state.idAnggota));
});

test('TC-11 Admin mendaftarkan siswa yang sudah terdaftar → ditolak dengan pesan (409)', async () => {
  const res = await call('admin', 'post', '/api/peserta', { id_anggota: state.idAnggota, id_program: state.idProgram });
  assert.equal(res.status, 409);
  assert.match(res.body.message, /sudah terdaftar/);
  const [{ n }] = await q('SELECT COUNT(*)::int n FROM peserta_pendidikan WHERE id_anggota = $1 AND id_program = $2', [state.idAnggota, state.idProgram]);
  assert.equal(n, 1);
});

test('TC-08 Admin/Pengurus menambah materi + kategori → tersimpan dan siswa menerima notifikasi', async () => {
  const res = await upload('admin', 'post', '/api/materi',
    { id_program: state.idProgram, judul: 'Simpul Pengaman', kategori: 'Tali-temali dan Tandu', deskripsi: 'Simpul delapan' },
    { buffer: Buffer.from('isi modul'), name: 'modul.pdf' });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.jumlah_notifikasi, 1);
  state.idMateri = res.body.data.id_materi;
  const [rinaUser] = await q("SELECT id_user FROM users WHERE email = 'rina@mapala.test'");
  const notif = await q('SELECT * FROM notifikasi WHERE id_materi = $1 AND id_user = $2', [state.idMateri, rinaUser.id_user]);
  assert.equal(notif.length, 1);
  assert.equal(notif[0].status_baca, false);

  const res2 = await upload('pengurus', 'post', '/api/materi', { id_program: 1, judul: 'Navigasi Malam', kategori: 'Navigasi' });
  assert.equal(res2.status, 201);
  assert.equal(res2.body.data.jumlah_notifikasi, 2); // Budi & Sari
  const bell = await call('budi', 'get', '/api/notifikasi');
  assert.ok(bell.body.data.items.some((n) => n.id_materi === res2.body.data.id_materi && !n.status_baca));
});

test('TC-09 Pengurus menambah jadwal kegiatan → jadwal tampil pada daftar jadwal', async () => {
  const res = await call('pengurus', 'post', '/api/jadwal', {
    id_program: state.idProgram, tanggal: '2027-04-10', waktu: '07:00', lokasi: 'Tebing Citatah', kegiatan: 'Latihan panjat',
  });
  assert.equal(res.status, 201);
  state.idJadwal = res.body.data.id_jadwal;
  const list = await call('pengurus', 'get', `/api/jadwal?id_program=${state.idProgram}`);
  assert.ok(list.body.data.some((j) => j.id_jadwal === state.idJadwal));
});

test('TC-12 Pengurus menyimpan status kehadiran pada satu kegiatan → absensi tersimpan sesuai kegiatan', async () => {
  const form = await call('pengurus', 'get', `/api/absensi?id_jadwal=${state.idJadwal}`);
  assert.equal(form.status, 200);
  const data = form.body.data.peserta.map((p) => ({ id_peserta: p.id_peserta, status: 'hadir', keterangan: '' }));
  const res = await call('pengurus', 'post', '/api/absensi', { id_jadwal: state.idJadwal, data });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.rekap.hadir, data.length);
  const rows = await q('SELECT * FROM absensi WHERE id_jadwal = $1', [state.idJadwal]);
  assert.equal(rows.length, data.length);
});

test('TC-13 Pengurus menyimpan hasil penilaian pada satu kegiatan → hasil evaluasi tersimpan', async () => {
  const form = await call('pengurus', 'get', `/api/evaluasi?id_jadwal=${state.idJadwal}`);
  const data = form.body.data.peserta.map((p) => ({ id_peserta: p.id_peserta, hasil_penilaian: 'Teknik belay benar', catatan: 'Pertahankan' }));
  const res = await call('pengurus', 'post', '/api/evaluasi', { id_jadwal: state.idJadwal, data });
  assert.equal(res.status, 200);
  const rows = await q('SELECT * FROM evaluasi WHERE id_jadwal = $1', [state.idJadwal]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id_pencatat, 2); // dari token Pengurus
});

test('TC-14 Admin memilih filter program di Laporan → rekap kehadiran, progres, dan evaluasi tampil', async () => {
  const res = await call('admin', 'get', '/api/laporan?id_program=1');
  assert.equal(res.status, 200);
  const budi = res.body.data.find((r) => r.siswa.nama === 'Budi Santoso');
  assert.deepEqual(budi.absensi, { hadir: 2, izin: 0, sakit: 0, alpa: 0 });
  assert.equal(budi.progres.total, 5); // 4 seed + 1 materi TC-08
  assert.equal(budi.progres.diakses, 2);
  assert.equal(budi.progres.persen, 40);
  assert.equal(budi.evaluasi.length, 2);
  assert.ok(res.body.data.every((r) => r.program.id_program === 1));
});

test('TC-15 Siswa membuka salah satu materi → isi materi tampil dan tercatat sebagai progres', async () => {
  const res = await call('budi', 'post', '/api/progres/tandai-akses', { id_materi: 3 });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.materi.judul, 'Penggunaan Kompas');
  assert.ok(res.body.data.materi.deskripsi);
  const [row] = await q("SELECT status FROM progres_materi WHERE id_peserta = 1 AND id_materi = 3");
  assert.equal(row.status, 'sudah_diakses');
});

test('TC-16 Siswa membuka menu Jadwal → jadwal program yang diikuti tampil', async () => {
  const res = await call('budi', 'get', '/api/jadwal/saya');
  assert.equal(res.status, 200);
  const program = new Set(res.body.data.map((j) => j.id_program));
  assert.deepEqual([...program].sort(), [1, 2]);
  assert.equal(res.body.data.length, 6);
});

test('TC-17 Siswa membuka Riwayat Absensi → riwayat kehadiran milik siswa tampil', async () => {
  const res = await call('sari', 'get', '/api/absensi/saya');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data.rekap, { hadir: 1, izin: 1, sakit: 0, alpa: 0 });
  assert.equal(res.body.data.riwayat.length, 2);
});

test('TC-18 Siswa membuka menu Progres → persentase progres dan hasil evaluasi tampil', async () => {
  const res = await call('budi', 'get', '/api/progres/saya');
  assert.equal(res.status, 200);
  const p1 = res.body.data.per_program.find((p) => p.id_program === 1);
  assert.equal(p1.diakses, 3);
  assert.equal(p1.total_materi, 5);
  assert.equal(p1.persen, 60);
  assert.equal(res.body.data.evaluasi.length, 2);
});

test('TC-19 Admin, Pengurus, Siswa mengubah data diri → perubahan profil tersimpan', async () => {
  for (const who of ['admin', 'pengurus', 'sari']) {
    const me = (await call(who, 'get', '/api/profil/me')).body.data;
    const res = await call(who, 'put', '/api/profil/me', { nama: `${me.nama} (Ubah)`, email: me.email, no_hp: '0899' });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.nama, `${me.nama} (Ubah)`);
    assert.equal(res.body.data.password, undefined);
  }
});

test('TC-20 Guest membuka website tanpa login → informasi program tampil tanpa data pribadi', async () => {
  const res = await request(app).get('/api/publik/program');
  assert.equal(res.status, 200);
  assert.ok(res.body.data.length >= 3);
  for (const p of res.body.data) {
    assert.deepEqual(Object.keys(p).sort(), ['deskripsi', 'jenis', 'nama_program', 'tanggal_mulai', 'tanggal_selesai']);
  }
  assert.doesNotMatch(JSON.stringify(res.body), /@mapala\.test|password|nim/);
});

test('TC-21 Siswa membuka Kelola Data Anggota → akses ditolak karena bukan Admin (403)', async () => {
  for (const [m, url] of [['get', '/api/anggota'], ['post', '/api/anggota'], ['put', '/api/anggota/1'], ['delete', '/api/anggota/1']]) {
    const res = await call('budi', m, url, m === 'get' ? undefined : {});
    assert.equal(res.status, 403, `${m} ${url}`);
    assert.equal(res.body.message, 'Anda tidak memiliki hak akses');
  }
});

// ---------------- Skenario tambahan (TC-A) ----------------

test('TC-A1 Endpoint terproteksi tanpa token / token rusak → 401', async () => {
  for (const url of ['/api/anggota', '/api/materi/saya', '/api/profil/me', '/api/laporan']) {
    assert.equal((await request(app).get(url)).status, 401);
    assert.equal((await request(app).get(url).set('Authorization', 'Bearer abc.def.ghi')).status, 401);
  }
});

test('TC-A2 Tambah anggota tidak lengkap / email dipakai → ditolak, tidak ada user baru', async () => {
  const [{ n: sebelum }] = await q('SELECT COUNT(*)::int n FROM users');
  const kosong = await call('admin', 'post', '/api/anggota', { nama: '', email: 'x', status_keanggotaan: 'salah' });
  assert.equal(kosong.status, 400);
  assert.ok(kosong.body.errors.nama && kosong.body.errors.email && kosong.body.errors.status_keanggotaan);
  const ganda = await call('admin', 'post', '/api/anggota', { nama: 'Ganda', email: 'budi@mapala.test', status_keanggotaan: 'siswa' });
  assert.equal(ganda.status, 409);
  const nimGanda = await call('admin', 'post', '/api/anggota', { nama: 'Ganda', email: 'ganda@mapala.test', nim: '2381001', status_keanggotaan: 'siswa' });
  assert.equal(nimGanda.status, 409);
  const [{ n: sesudah }] = await q('SELECT COUNT(*)::int n FROM users');
  assert.equal(sesudah, sebelum);
});

test('TC-A3 Pengurus menambah jadwal tidak lengkap → 400, data tidak tersimpan', async () => {
  const [{ n: sebelum }] = await q('SELECT COUNT(*)::int n FROM jadwal');
  const res = await call('pengurus', 'post', '/api/jadwal', { id_program: 1, tanggal: '', waktu: '25:00', lokasi: '', kegiatan: '' });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.tanggal && res.body.errors.waktu && res.body.errors.lokasi && res.body.errors.kegiatan);
  const [{ n: sesudah }] = await q('SELECT COUNT(*)::int n FROM jadwal');
  assert.equal(sesudah, sebelum);
});

test('TC-A4 Simpan absensi untuk kegiatan yang sudah diisi → data diperbarui, tidak ganda', async () => {
  const res = await call('pengurus', 'post', '/api/absensi', {
    id_jadwal: 1, data: [{ id_peserta: 1, status: 'sakit', keterangan: 'Demam' }, { id_peserta: 2, status: 'hadir' }],
  });
  assert.equal(res.status, 200);
  const rows = await q('SELECT id_peserta, status FROM absensi WHERE id_jadwal = 1 ORDER BY id_peserta');
  assert.deepEqual(rows.map((r) => [r.id_peserta, r.status]), [[1, 'sakit'], [2, 'hadir']]);
});

test('TC-A5 Siswa membuka materi program yang tidak diikuti → akses ditolak (403)', async () => {
  const res = await call('sari', 'post', '/api/progres/tandai-akses', { id_materi: 5 });
  assert.equal(res.status, 403);
  const file = await call('sari', 'get', `/api/materi/${state.idMateri}/file`);
  assert.equal(file.status, 403);
  assert.equal((await q('SELECT * FROM progres_materi WHERE id_materi = 5')).length, 0);
});

test('TC-A6 Siswa membuka materi yang sama dua kali → progres tidak ganda, persentase tidak bertambah', async () => {
  const prog1 = (res) => res.body.data.per_program.find((p) => p.id_program === 1);
  const before1 = prog1(await call('budi', 'get', '/api/progres/saya'));
  const [awal] = await q('SELECT tanggal_akses FROM progres_materi WHERE id_peserta = 1 AND id_materi = 3');
  await call('budi', 'post', '/api/progres/tandai-akses', { id_materi: 3 });
  await call('budi', 'post', '/api/progres/tandai-akses', { id_materi: 3 });
  const rows = await q('SELECT tanggal_akses FROM progres_materi WHERE id_peserta = 1 AND id_materi = 3');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].tanggal_akses, awal.tanggal_akses); // tidak ditimpa
  const after1 = prog1(await call('budi', 'get', '/api/progres/saya'));
  assert.equal(after1.persen, before1.persen);
});

test('TC-A7 Akses fitur aktor lain (Admin → jadwal/absensi/evaluasi; Pengurus → anggota/laporan) → 403', async () => {
  const cases = [
    ['admin', 'post', '/api/jadwal', {}], ['admin', 'get', '/api/jadwal?id_program=1'], ['admin', 'get', '/api/absensi?id_jadwal=1'],
    ['admin', 'post', '/api/absensi', {}], ['admin', 'post', '/api/evaluasi', {}], ['admin', 'delete', '/api/jadwal/1'],
    ['pengurus', 'get', '/api/anggota'], ['pengurus', 'get', '/api/laporan'], ['pengurus', 'post', '/api/program', {}],
    ['pengurus', 'get', '/api/kurikulum?id_program=1'], ['pengurus', 'post', '/api/peserta', {}],
    ['budi', 'get', '/api/program'], ['budi', 'get', '/api/materi?id_program=1'], ['budi', 'get', '/api/laporan'],
    ['admin', 'get', '/api/materi/saya'], ['pengurus', 'get', '/api/progres/saya'], ['admin', 'get', '/api/notifikasi'],
  ];
  for (const [who, m, url, body] of cases) {
    assert.equal((await call(who, m, url, body)).status, 403, `${who} ${m} ${url}`);
  }
});

test('TC-A8 Tambah materi pada program yang belum punya peserta → tersimpan tanpa notifikasi', async () => {
  const res = await upload('admin', 'post', '/api/materi', { id_program: 3, judul: 'Teknik Mendayung', kategori: 'Arung Jeram' });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.jumlah_notifikasi, 0);
  assert.equal((await q('SELECT * FROM notifikasi WHERE id_materi = $1', [res.body.data.id_materi])).length, 0);
});

test('TC-A9 Guest memanggil /api/publik/program → tidak ada data pribadi', async () => {
  const res = await request(app).get('/api/publik/program');
  const text = JSON.stringify(res.body);
  for (const kata of ['email', 'id_user', 'id_anggota', 'no_hp', 'Budi', 'Sari']) assert.ok(!text.includes(kata), kata);
});

test('TC-A10 Manipulasi id pengguna lain pada profil/absensi → diabaikan, hanya data milik token', async () => {
  const res = await call('sari', 'put', '/api/profil/me', {
    id_user: 3, nama: 'Sari W', email: 'sari@mapala.test', role: 'admin', status: 'nonaktif', nim: '0000', status_keanggotaan: 'pemburu_tua',
  });
  assert.equal(res.status, 200);
  const [budi] = await q('SELECT nama FROM users WHERE id_user = 3');
  assert.equal(budi.nama, 'Budi Santoso');
  const [sari] = await q('SELECT u.role, u.status, a.nim, a.status_keanggotaan FROM users u JOIN anggota a ON a.id_user = u.id_user WHERE u.id_user = 4');
  assert.deepEqual({ ...sari }, { role: 'siswa', status: 'aktif', nim: '2381002', status_keanggotaan: 'calon_anggota' });
  const abs = await call('sari', 'get', '/api/absensi/saya?id_user=3&id_peserta=1');
  assert.equal(abs.body.data.riwayat.length, 2); // tetap milik Sari
  assert.ok(abs.body.data.riwayat.every((r) => r.nama_program === 'Pendidikan Dasar (Inagurasi) 2026'));
});
