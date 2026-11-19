// Pengujian fungsional per modul (Tahap 9): kondisi alternatif tiap modul M01–M17, berbasis masukan/keluaran API.
const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { login, call, upload, resetDb, q, pool, request, app } = require('./helpers');
const env = require('../src/config/env');

before(resetDb);
after(() => pool.end());

const filesInUploads = () => fs.readdirSync(env.uploadDir).filter((f) => f !== '.gitkeep');

describe('M01 Login', () => {
  test('input kosong / format email salah → 400', async () => {
    assert.equal((await request(app).post('/api/auth/login').send({})).status, 400);
    assert.equal((await login('bukan-email', 'x')).status, 400);
  });
  test('akun nonaktif → 403 "Akun tidak aktif"', async () => {
    await q("UPDATE users SET status = 'nonaktif' WHERE id_user = 5");
    const res = await login('andi@mapala.test');
    assert.equal(res.status, 403);
    assert.equal(res.body.message, 'Akun tidak aktif');
    await q("UPDATE users SET status = 'aktif' WHERE id_user = 5");
  });
  test('token kedaluwarsa → 401', async () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ id_user: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 }, env.jwtSecret);
    assert.equal((await request(app).get('/api/dashboard').set('Authorization', `Bearer ${expired}`)).status, 401);
  });
  test('token ditandatangani secret lain (role dipalsukan) → 401', async () => {
    const jwt = require('jsonwebtoken');
    const palsu = jwt.sign({ id_user: 3, role: 'admin' }, 'secret-lain');
    assert.equal((await request(app).get('/api/anggota').set('Authorization', `Bearer ${palsu}`)).status, 401);
  });
});

describe('M02 Anggota', () => {
  test('cari berdasarkan nama / email / NIM', async () => {
    assert.deepEqual((await call('admin', 'get', '/api/anggota?q=budi')).body.data.map((a) => a.nama), ['Budi Santoso']);
    assert.deepEqual((await call('admin', 'get', '/api/anggota?q=sari%40')).body.data.map((a) => a.nama), ['Sari Wulandari']);
    assert.deepEqual((await call('admin', 'get', '/api/anggota?q=2481003')).body.data.map((a) => a.nama), ['Andi Pratama']);
    assert.equal((await call('admin', 'get', "/api/anggota?q=' OR 1=1 --")).body.data.length, 0);
  });
  test('password awal kosong → password sementara dikembalikan sekali dan bisa dipakai login', async () => {
    const res = await call('admin', 'post', '/api/anggota', { nama: 'Tono', email: 'tono@mapala.test', status_keanggotaan: 'calon_siswa' });
    assert.equal(res.status, 201);
    assert.ok(res.body.data.password_sementara);
    assert.equal((await login('tono@mapala.test', res.body.data.password_sementara)).status, 200);
    const list = await call('admin', 'get', '/api/anggota');
    assert.ok(list.body.data.every((a) => a.password === undefined && a.password_sementara === undefined));
  });
  test('ubah: 404 bila tidak ada, 409 bila email bentrok, status akun nonaktif tersimpan', async () => {
    const body = { nama: 'X', email: 'x@mapala.test', status_keanggotaan: 'siswa' };
    assert.equal((await call('admin', 'put', '/api/anggota/999', body)).status, 404);
    assert.equal((await call('admin', 'put', '/api/anggota/3', { ...body, email: 'budi@mapala.test' })).status, 409);
    const ok = await call('admin', 'put', '/api/anggota/3', { nama: 'Andi Pratama', email: 'andi@mapala.test', status_keanggotaan: 'calon_siswa', status_akun: 'nonaktif' });
    assert.equal(ok.body.data.status_akun, 'nonaktif');
    assert.equal((await login('andi@mapala.test')).status, 403);
    await call('admin', 'put', '/api/anggota/3', { nama: 'Andi Pratama', email: 'andi@mapala.test', status_keanggotaan: 'calon_siswa', status_akun: 'aktif' });
  });
  test('hapus: anggota punya data peserta → 409; tanpa data → users ikut terhapus', async () => {
    const del = await call('admin', 'delete', '/api/anggota/1');
    assert.equal(del.status, 409);
    assert.equal(del.body.message, 'Anggota memiliki data pendidikan sehingga tidak dapat dihapus');
    const [tono] = await q("SELECT a.id_anggota, u.id_user FROM anggota a JOIN users u ON u.id_user = a.id_user WHERE u.email = 'tono@mapala.test'");
    assert.equal((await call('admin', 'delete', `/api/anggota/${tono.id_anggota}`)).status, 200);
    assert.equal((await q('SELECT * FROM users WHERE id_user = ?', [tono.id_user])).length, 0);
    assert.equal((await call('admin', 'delete', `/api/anggota/${tono.id_anggota}`)).status, 404);
  });
  test('rollback transaksi: INSERT anggota gagal → tidak ada user yatim', async () => {
    await q("ALTER TABLE anggota ADD CONSTRAINT chk_uji CHECK (jurusan IS NULL OR jurusan <> 'GAGAL')");
    try {
      const res = await call('admin', 'post', '/api/anggota', { nama: 'Gagal', email: 'gagal@mapala.test', jurusan: 'GAGAL', status_keanggotaan: 'siswa' });
      assert.equal(res.status, 500);
      assert.equal(res.body.message, 'Terjadi kesalahan, coba lagi');
      assert.doesNotMatch(JSON.stringify(res.body), /chk_uji|SQL|constraint/i);
      assert.equal((await q("SELECT * FROM users WHERE email = 'gagal@mapala.test'")).length, 0);
    } finally {
      await q('ALTER TABLE anggota DROP CHECK chk_uji');
    }
  });
});

describe('M03 Program', () => {
  test('validasi wajib, enum, format tanggal, tanggal selesai ≥ mulai', async () => {
    const r1 = await call('admin', 'post', '/api/program', { nama_program: '', jenis: 'lain' });
    assert.ok(r1.body.errors.nama_program && r1.body.errors.jenis);
    const r2 = await call('admin', 'post', '/api/program', { nama_program: 'A', jenis: 'rutin', tanggal_mulai: '2026-13-40' });
    assert.ok(r2.body.errors.tanggal_mulai);
    const r3 = await call('admin', 'post', '/api/program', { nama_program: 'A', jenis: 'rutin', tanggal_mulai: '2026-05-10', tanggal_selesai: '2026-05-01' });
    assert.equal(r3.status, 400);
    assert.ok(r3.body.errors.tanggal_selesai);
  });
  test('ubah, detail, hapus program kosong; hapus program berisi data → 409', async () => {
    const c = await call('admin', 'post', '/api/program', { nama_program: 'Uji', jenis: 'tambahan' });
    const id = c.body.data.id_program;
    const u = await call('admin', 'put', `/api/program/${id}`, { nama_program: 'Uji Ubah', jenis: 'rutin', tanggal_mulai: '2027-01-01', tanggal_selesai: '2027-01-02' });
    assert.equal(u.body.data.nama_program, 'Uji Ubah');
    assert.equal((await call('pengurus', 'get', `/api/program/${id}`)).body.data.jenis, 'rutin');
    assert.equal((await call('admin', 'delete', `/api/program/${id}`)).status, 200);
    assert.equal((await call('admin', 'get', `/api/program/${id}`)).status, 404);
    const del = await call('admin', 'delete', '/api/program/1');
    assert.equal(del.status, 409);
  });
});

describe('M04 Kurikulum', () => {
  test('tambah & ubah status; program tidak ada → 404; status tidak valid → 400', async () => {
    assert.equal((await call('admin', 'post', '/api/kurikulum', { id_program: 999, tahun: '2026', status: 'draft' })).status, 404);
    assert.equal((await call('admin', 'post', '/api/kurikulum', { id_program: 3, tahun: '', status: 'x' })).status, 400);
    const c = await call('admin', 'post', '/api/kurikulum', { id_program: 3, tahun: '2027', status: 'draft' });
    const u = await call('admin', 'put', `/api/kurikulum/${c.body.data.id_kurikulum}`, { tahun: '2027', deskripsi: 'Final', status: 'diresmikan' });
    assert.equal(u.body.data.status, 'diresmikan');
    assert.equal((await call('admin', 'put', '/api/kurikulum/999', { tahun: '2027', status: 'draft' })).status, 404);
    assert.equal((await call('admin', 'delete', `/api/kurikulum/${c.body.data.id_kurikulum}`)).status, 404); // tidak ada DELETE
  });
});

describe('M05 Materi', () => {
  test('validasi judul/kategori; file tidak diizinkan → 400 dan tidak tersimpan', async () => {
    const before1 = filesInUploads().length;
    assert.equal((await upload('admin', 'post', '/api/materi', { id_program: 1, judul: '', kategori: '' })).status, 400);
    const bad = await upload('admin', 'post', '/api/materi', { id_program: 1, judul: 'X', kategori: 'Y' }, { buffer: Buffer.from('x'), name: 'virus.exe' });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.errors.file);
    assert.equal((await upload('admin', 'post', '/api/materi', { id_program: 999, judul: 'X', kategori: 'Y' }, { buffer: Buffer.from('x'), name: 'a.pdf' })).status, 404);
    assert.equal(filesInUploads().length, before1); // file dari request gagal dibersihkan
  });
  test('file terlalu besar → 413', async () => {
    const big = Buffer.alloc(21 * 1024 * 1024, 1);
    const res = await upload('admin', 'post', '/api/materi', { id_program: 1, judul: 'Besar', kategori: 'Y' }, { buffer: big, name: 'besar.pdf' });
    assert.equal(res.status, 413);
  });
  test('daftar per program, ubah dengan file baru, unduh file, hapus → progres & notifikasi ikut terhapus', async () => {
    const c = await upload('pengurus', 'post', '/api/materi', { id_program: 1, judul: 'Modul Uji', kategori: 'Survival' }, { buffer: Buffer.from('v1'), name: 'v1.txt' });
    const id = c.body.data.id_materi;
    assert.equal(c.body.data.file_path, undefined);
    assert.equal(c.body.data.has_file, true);
    const list = await call('admin', 'get', '/api/materi?id_program=1');
    assert.ok(list.body.data.some((m) => m.id_materi === id && m.kategori === 'Survival'));
    const oldFiles = filesInUploads();
    const u = await upload('admin', 'put', `/api/materi/${id}`, { judul: 'Modul Uji v2', kategori: 'Navigasi' }, { buffer: Buffer.from('v2'), name: 'v2.txt' });
    assert.equal(u.body.data.judul, 'Modul Uji v2');
    assert.equal(filesInUploads().length, oldFiles.length); // file lama diganti
    const f = await call('budi', 'get', `/api/materi/${id}/file`);
    assert.equal(f.status, 200);
    assert.equal(f.text ?? f.body.toString(), 'v2');
    await call('budi', 'post', '/api/progres/tandai-akses', { id_materi: id });
    const del = await call('pengurus', 'delete', `/api/materi/${id}`);
    assert.equal(del.status, 200);
    assert.equal((await q('SELECT * FROM progres_materi WHERE id_materi = ?', [id])).length, 0);
    assert.equal((await q('SELECT * FROM notifikasi WHERE id_materi = ?', [id])).length, 0);
    assert.equal(filesInUploads().length, oldFiles.length - 1);
    assert.equal((await call('pengurus', 'delete', `/api/materi/${id}`)).status, 404);
  });
  test('materi tanpa berkas → 404 pada endpoint file; berkas tidak bisa diakses tanpa token', async () => {
    assert.equal((await call('budi', 'get', '/api/materi/1/file')).status, 404);
    assert.equal((await request(app).get('/api/materi/1/file')).status, 401);
  });
  test('rollback transaksi: INSERT notifikasi gagal → materi tidak tersimpan', async () => {
    await q("ALTER TABLE notifikasi ADD CONSTRAINT chk_uji_n CHECK (pesan <> 'Materi baru: GAGAL')");
    try {
      const res = await upload('admin', 'post', '/api/materi', { id_program: 1, judul: 'GAGAL', kategori: 'X' });
      assert.equal(res.status, 500);
      assert.equal((await q("SELECT * FROM materi WHERE judul = 'GAGAL'")).length, 0);
    } finally {
      await q('ALTER TABLE notifikasi DROP CHECK chk_uji_n');
    }
  });
});

describe('M06 Jadwal', () => {
  test('ubah & hapus jadwal; jadwal sudah punya absensi → 409; tidak ada → 404', async () => {
    const c = await call('pengurus', 'post', '/api/jadwal', { id_program: 3, tanggal: '2027-02-10', waktu: '08:00', lokasi: 'Sungai Citarik', kegiatan: 'Pengenalan perahu' });
    const id = c.body.data.id_jadwal;
    const u = await call('pengurus', 'put', `/api/jadwal/${id}`, { tanggal: '2027-02-11', waktu: '09:30', lokasi: 'Sungai Citarik', kegiatan: 'Pengenalan perahu' });
    assert.equal(u.body.data.tanggal, '2027-02-11');
    assert.equal(u.body.data.waktu, '09:30:00');
    assert.equal((await call('pengurus', 'delete', `/api/jadwal/${id}`)).status, 200);
    assert.equal((await call('pengurus', 'delete', `/api/jadwal/${id}`)).status, 404);
    assert.equal((await call('pengurus', 'delete', '/api/jadwal/1')).status, 409);
    assert.equal((await call('pengurus', 'post', '/api/jadwal', { id_program: 999, tanggal: '2027-02-10', waktu: '08:00', lokasi: 'L', kegiatan: 'K' })).status, 404);
  });
  test('daftar jadwal urut tanggal dan waktu', async () => {
    const list = (await call('pengurus', 'get', '/api/jadwal?id_program=1')).body.data;
    const keys = list.map((j) => `${j.tanggal} ${j.waktu}`);
    assert.deepEqual(keys, [...keys].sort());
  });
});

describe('M07 Peserta', () => {
  test('anggota/program tidak ditemukan → 404; data kosong → 400', async () => {
    assert.equal((await call('admin', 'post', '/api/peserta', { id_anggota: 999, id_program: 1 })).status, 404);
    assert.equal((await call('admin', 'post', '/api/peserta', { id_anggota: 3, id_program: 999 })).status, 404);
    assert.equal((await call('admin', 'post', '/api/peserta', {})).status, 400);
  });
  test('dua pendaftaran bersamaan → hanya satu tersimpan (UNIQUE)', async () => {
    const [a, b] = await Promise.all([
      call('admin', 'post', '/api/peserta', { id_anggota: 3, id_program: 2 }),
      call('admin', 'post', '/api/peserta', { id_anggota: 3, id_program: 2 }),
    ]);
    assert.deepEqual([a.status, b.status].sort(), [201, 409]);
    assert.equal((await q('SELECT * FROM peserta_pendidikan WHERE id_anggota = 3 AND id_program = 2')).length, 1);
  });
});

describe('M08 Absensi', () => {
  test('status tidak valid / peserta bukan program jadwal / tidak semua siswa → 400', async () => {
    const bad = await call('pengurus', 'post', '/api/absensi', { id_jadwal: 3, data: [{ id_peserta: 1, status: 'bolos' }, { id_peserta: 2, status: 'hadir' }] });
    assert.equal(bad.status, 400);
    const asing = await call('pengurus', 'post', '/api/absensi', { id_jadwal: 3, data: [{ id_peserta: 1, status: 'hadir' }, { id_peserta: 3, status: 'hadir' }] });
    assert.equal(asing.status, 400);
    const kurang = await call('pengurus', 'post', '/api/absensi', { id_jadwal: 3, data: [{ id_peserta: 1, status: 'hadir' }] });
    assert.equal(kurang.status, 400);
    assert.equal(kurang.body.message, 'Semua siswa wajib diberi status kehadiran');
    assert.equal((await call('pengurus', 'post', '/api/absensi', { id_jadwal: 999, data: [] })).status, 404);
    assert.equal((await q('SELECT * FROM absensi WHERE id_jadwal = 3')).length, 0);
  });
  test('GET menampilkan peserta + absensi yang sudah ada (status null bila belum diisi)', async () => {
    const res = await call('pengurus', 'get', '/api/absensi?id_jadwal=3');
    assert.ok(res.body.data.peserta.every((p) => p.status === null));
    const isi = await call('pengurus', 'get', '/api/absensi?id_jadwal=1');
    assert.deepEqual(isi.body.data.peserta.map((p) => p.status).sort(), ['hadir', 'izin']);
  });
  test('rollback transaksi: baris kedua gagal → baris pertama tidak berubah', async () => {
    await q("ALTER TABLE absensi ADD CONSTRAINT chk_uji_a CHECK (keterangan IS NULL OR keterangan <> 'GAGAL')");
    try {
      const res = await call('pengurus', 'post', '/api/absensi', { id_jadwal: 1, data: [{ id_peserta: 1, status: 'alpa' }, { id_peserta: 2, status: 'hadir', keterangan: 'GAGAL' }] });
      assert.equal(res.status, 500);
      const [row] = await q('SELECT status FROM absensi WHERE id_jadwal = 1 AND id_peserta = 1');
      assert.equal(row.status, 'hadir');
    } finally {
      await q('ALTER TABLE absensi DROP CHECK chk_uji_a');
    }
  });
});

describe('M09 Evaluasi', () => {
  test('simpan ulang memperbarui (upsert); catatan tanpa hasil → 400; baris kosong dilewati', async () => {
    const res = await call('pengurus', 'post', '/api/evaluasi', { id_jadwal: 1, data: [{ id_peserta: 1, hasil_penilaian: 'Diperbarui', catatan: '' }, { id_peserta: 2, hasil_penilaian: '', catatan: '' }] });
    assert.equal(res.status, 200);
    const rows = await q('SELECT id_peserta, hasil_penilaian, tanggal_evaluasi FROM evaluasi WHERE id_jadwal = 1');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].hasil_penilaian, 'Diperbarui');
    const bad = await call('pengurus', 'post', '/api/evaluasi', { id_jadwal: 1, data: [{ id_peserta: 2, hasil_penilaian: '', catatan: 'ada catatan' }] });
    assert.equal(bad.status, 400);
    const kosong = await call('pengurus', 'post', '/api/evaluasi', { id_jadwal: 1, data: [{ id_peserta: 2, hasil_penilaian: '  ' }] });
    assert.equal(kosong.status, 400);
    const asing = await call('pengurus', 'post', '/api/evaluasi', { id_jadwal: 1, data: [{ id_peserta: 3, hasil_penilaian: 'x' }] });
    assert.equal(asing.status, 400);
  });
  test('tidak ada nilai angka/kelulusan pada respons evaluasi', async () => {
    const res = await call('pengurus', 'get', '/api/evaluasi?id_jadwal=2');
    for (const p of res.body.data.peserta) for (const k of ['nilai', 'lulus', 'skor']) assert.equal(p[k], undefined);
  });
});

describe('M10 Laporan', () => {
  test('filter anggota, kombinasi, tanpa filter, dan tanpa data', async () => {
    const semua = (await call('admin', 'get', '/api/laporan')).body.data;
    const [{ n }] = await q('SELECT COUNT(*) n FROM peserta_pendidikan');
    assert.equal(semua.length, n);
    const budi = (await call('admin', 'get', '/api/laporan?id_anggota=1')).body.data;
    assert.equal(budi.length, 2);
    const kombinasi = (await call('admin', 'get', '/api/laporan?id_program=2&id_anggota=1')).body.data;
    assert.equal(kombinasi.length, 1);
    assert.equal(kombinasi[0].program.id_program, 2);
    assert.ok(kombinasi[0].detail_absensi.length >= 1 && kombinasi[0].detail_progres.length === 2);
    assert.deepEqual((await call('admin', 'get', '/api/laporan?id_program=3')).body.data, []);
    assert.equal((await call('admin', 'get', '/api/laporan?id_program=abc')).status, 400);
  });
  test('program tanpa materi → persentase 0 (tanpa pembagian nol)', async () => {
    await call('admin', 'post', '/api/peserta', { id_anggota: 3, id_program: 3 });
    await q('DELETE FROM notifikasi WHERE id_materi IN (SELECT id_materi FROM materi WHERE id_program = 3)');
    await q('DELETE FROM materi WHERE id_program = 3');
    const r = (await call('admin', 'get', '/api/laporan?id_program=3')).body.data[0];
    assert.deepEqual(r.progres, { diakses: 0, total: 0, persen: 0 });
  });
});

describe('M11 Akses materi & notifikasi', () => {
  test('materi/saya hanya dari program yang diikuti + status akses', async () => {
    const res = (await call('sari', 'get', '/api/materi/saya')).body.data;
    assert.deepEqual(res.program.map((p) => p.id_program), [1]);
    assert.ok(res.materi.every((m) => m.id_program === 1 && m.file_path === undefined));
    assert.equal(res.materi.find((m) => m.id_materi === 1).status_akses, 'sudah_diakses');
    assert.equal(res.materi.find((m) => m.id_materi === 4).status_akses, 'belum_diakses');
  });
  test('tandai dibaca milik sendiri → 200; milik orang lain → 403; tidak ada → 404', async () => {
    const [milikSari] = await q('SELECT id_notifikasi FROM notifikasi WHERE id_user = 4 AND status_baca = FALSE LIMIT 1');
    const [milikBudi] = await q('SELECT id_notifikasi FROM notifikasi WHERE id_user = 3 LIMIT 1');
    const before1 = (await call('sari', 'get', '/api/notifikasi')).body.data.belum_dibaca;
    assert.equal((await call('sari', 'put', `/api/notifikasi/${milikSari.id_notifikasi}/dibaca`)).status, 200);
    assert.equal((await call('sari', 'get', '/api/notifikasi')).body.data.belum_dibaca, before1 - 1);
    assert.equal((await call('sari', 'put', `/api/notifikasi/${milikBudi.id_notifikasi}/dibaca`)).status, 403);
    assert.equal((await call('sari', 'put', '/api/notifikasi/99999/dibaca')).status, 404);
    const list = (await call('sari', 'get', '/api/notifikasi')).body.data.items;
    assert.ok(list.length > 0);
    const [{ n }] = await q('SELECT COUNT(*) n FROM notifikasi WHERE id_user = 4');
    assert.equal(list.length, n);
  });
  test('materi tidak ada → 404', async () => {
    assert.equal((await call('budi', 'post', '/api/progres/tandai-akses', { id_materi: 99999 })).status, 404);
    assert.equal((await call('budi', 'post', '/api/progres/tandai-akses', {})).status, 400);
  });
});

describe('M12–M14 Siswa tanpa program dan isolasi data', () => {
  test('Siswa baru tanpa program → daftar kosong, dashboard terdaftar=false', async () => {
    const c = await call('admin', 'post', '/api/anggota', { nama: 'Baru', email: 'baru@mapala.test', status_keanggotaan: 'calon_siswa', password: 'password123' });
    assert.equal(c.status, 201);
    assert.deepEqual((await call('baru@mapala.test', 'get', '/api/materi/saya')).body.data, { program: [], materi: [] });
    assert.deepEqual((await call('baru@mapala.test', 'get', '/api/jadwal/saya')).body.data, []);
    assert.deepEqual((await call('baru@mapala.test', 'get', '/api/absensi/saya')).body.data.riwayat, []);
    assert.deepEqual((await call('baru@mapala.test', 'get', '/api/progres/saya')).body.data, { per_program: [], evaluasi: [] });
    const d = (await call('baru@mapala.test', 'get', '/api/dashboard')).body.data;
    assert.equal(d.terdaftar, false);
    assert.deepEqual(d.jadwal_terdekat, []);
  });
  test('riwayat absensi & evaluasi Siswa A tidak memuat data Siswa B', async () => {
    const sari = (await call('sari', 'get', '/api/progres/saya')).body.data.evaluasi;
    const [{ n }] = await q('SELECT COUNT(*) n FROM evaluasi WHERE id_peserta = 2');
    assert.equal(sari.length, n);
  });
});

describe('M15 Profil', () => {
  test('GET me tanpa password; validasi; email dipakai → 409', async () => {
    const me = (await call('budi', 'get', '/api/profil/me')).body.data;
    assert.equal(me.password, undefined);
    assert.equal(me.role, 'siswa');
    assert.equal((await call('budi', 'put', '/api/profil/me', { nama: '', email: 'salah' })).status, 400);
    assert.equal((await call('budi', 'put', '/api/profil/me', { nama: 'Budi', email: 'admin@mapala.test' })).status, 409);
  });
  test('ganti password: lama salah, < 8 karakter, konfirmasi beda → 400; berhasil → login dengan password baru', async () => {
    const p = (b) => call('pengurus', 'put', '/api/profil/me/password', b);
    assert.equal((await p({ password_lama: 'salah', password_baru: 'barubaru1', konfirmasi: 'barubaru1' })).status, 400);
    assert.equal((await p({ password_lama: 'password123', password_baru: 'pendek', konfirmasi: 'pendek' })).status, 400);
    assert.equal((await p({ password_lama: 'password123', password_baru: 'barubaru1', konfirmasi: 'beda12345' })).status, 400);
    assert.equal((await p({ password_lama: 'password123', password_baru: 'barubaru1', konfirmasi: 'barubaru1' })).status, 200);
    assert.equal((await login('pengurus@mapala.test', 'barubaru1')).status, 200);
    assert.equal((await login('pengurus@mapala.test', 'password123')).status, 401);
  });
});

describe('M17 Dashboard', () => {
  test('admin/pengurus: total anggota + rincian 7 tahap, program aktif, jadwal terdekat', async () => {
    for (const who of ['admin', 'pengurus']) {
      const d = (await call(who, 'get', '/api/dashboard')).body.data;
      const [{ n }] = await q('SELECT COUNT(*) n FROM anggota');
      assert.equal(d.total_anggota, n);
      assert.equal(Object.keys(d.rincian_keanggotaan).length, 7);
      const [{ aktif }] = await q('SELECT COUNT(*) aktif FROM program_pendidikan WHERE CURDATE() BETWEEN tanggal_mulai AND tanggal_selesai');
      assert.equal(d.program_aktif.length, aktif);
      assert.ok(d.jadwal_terdekat.every((j) => j.tanggal >= new Date().toISOString().slice(0, 10)));
    }
  });
  test('siswa: progres, kehadiran sesuai tabel', async () => {
    const d = (await call('sari', 'get', '/api/dashboard')).body.data;
    assert.equal(d.terdaftar, true);
    const [{ n }] = await q("SELECT COUNT(*) n FROM absensi ab JOIN peserta_pendidikan pp ON pp.id_peserta = ab.id_peserta WHERE pp.id_anggota = 2 AND ab.status = 'hadir'");
    assert.equal(d.kehadiran.hadir, n);
    assert.equal(d.program_saya.length, 1);
    assert.ok(d.progres.persen >= 0 && d.progres.persen <= 100);
  });
});
