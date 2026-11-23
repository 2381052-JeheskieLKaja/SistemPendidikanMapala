-- Data awal untuk pengujian lokal (PostgreSQL). Jalankan setelah schema.sql.
-- Semua akun memakai password: password123 (disimpan sebagai hash bcrypt, bukan teks polos).
-- Akun Admin dan Pengurus hanya dibuat lewat seed (K7).
-- Idempotent: aman dijalankan berulang kali tanpa duplikasi data.

BEGIN;

INSERT INTO users (id_user, nama, email, password, no_hp, role, status) VALUES
  (1, 'Admin MAPALA',        'admin@mapala.test',    '$2a$10$F/rOD4jGGRCpmH1lIxoK/.0wvjKthX4ZTZHp/0bFW85fNS3HvR0Ci', '081200000001', 'admin',    'aktif'),
  (2, 'Sekretaris Pengurus', 'pengurus@mapala.test', '$2a$10$F/rOD4jGGRCpmH1lIxoK/.0wvjKthX4ZTZHp/0bFW85fNS3HvR0Ci', '081200000002', 'pengurus', 'aktif'),
  (3, 'Budi Santoso',        'budi@mapala.test',     '$2a$10$F/rOD4jGGRCpmH1lIxoK/.0wvjKthX4ZTZHp/0bFW85fNS3HvR0Ci', '081200000003', 'siswa',    'aktif'),
  (4, 'Sari Wulandari',      'sari@mapala.test',     '$2a$10$F/rOD4jGGRCpmH1lIxoK/.0wvjKthX4ZTZHp/0bFW85fNS3HvR0Ci', '081200000004', 'siswa',    'aktif'),
  (5, 'Andi Pratama',        'andi@mapala.test',     '$2a$10$F/rOD4jGGRCpmH1lIxoK/.0wvjKthX4ZTZHp/0bFW85fNS3HvR0Ci', '081200000005', 'siswa',    'aktif')
ON CONFLICT DO NOTHING;

INSERT INTO anggota (id_anggota, id_user, nim, jurusan, angkatan, kontak, status_keanggotaan) VALUES
  (1, 3, '2381001', 'Informatika', '2023', '081200000003', 'siswa'),
  (2, 4, '2381002', 'Keperawatan', '2023', '081200000004', 'calon_anggota'),
  (3, 5, '2481003', 'Akuntansi',   '2024', '081200000005', 'calon_siswa')
ON CONFLICT DO NOTHING;

INSERT INTO program_pendidikan (id_program, nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai) VALUES
  (1, 'Pendidikan Dasar (Inagurasi) 2026', 'rutin',
      'Program wajib tahunan untuk calon anggota: survival, navigasi darat, dan P3K.', '2026-09-01', '2027-01-31'),
  (2, 'Diklatsar 2026', 'rutin',
      'Pendidikan dan latihan dasar: tali-temali, tandu, dan bantuan hidup dasar.', '2026-11-01', '2026-12-20'),
  (3, 'Arung Jeram Semester Genap 2027', 'tambahan',
      'Program tambahan pengenalan olahraga arung jeram.', '2027-02-01', '2027-03-31')
ON CONFLICT (id_program) DO NOTHING;

INSERT INTO kurikulum (id_kurikulum, id_program, tahun, deskripsi, status) VALUES
  (1, 1, '2026', 'Kurikulum Inagurasi: survival, navigasi darat, P3K, dan long march.', 'diresmikan'),
  (2, 2, '2026', 'Kurikulum Diklatsar: tali-temali, tandu, BHD.', 'draft')
ON CONFLICT (id_kurikulum) DO NOTHING;

INSERT INTO materi (id_materi, id_program, judul, kategori, deskripsi, file_path, tanggal_upload) VALUES
  (1, 1, 'Survival Dasar',          'Survival',              'Teknik bertahan hidup di alam bebas: membuat bivak, mencari air, dan menyalakan api.', NULL, '2026-09-05 09:00:00'),
  (2, 1, 'Membaca Peta Topografi',  'Navigasi',              'Mengenal garis kontur, skala, dan simbol pada peta topografi.', NULL, '2026-09-20 09:00:00'),
  (3, 1, 'Penggunaan Kompas',       'Navigasi',              'Menentukan arah, sudut kompas, resection dan intersection.', NULL, '2026-10-01 09:00:00'),
  (4, 1, 'Pertolongan Pertama',     'P3K',                   'Penanganan luka, patah tulang, dan hipotermia di lapangan.', NULL, '2026-10-20 09:00:00'),
  (5, 2, 'Simpul Dasar',            'Tali-temali dan Tandu', 'Simpul pangkal, simpul jangkar, dan pembuatan tandu darurat.', NULL, '2026-11-02 09:00:00'),
  (6, 2, 'Bantuan Hidup Dasar',     'BHD',                   'Langkah RJP (resusitasi jantung paru) untuk orang awam.', NULL, '2026-11-03 09:00:00')
ON CONFLICT (id_materi) DO NOTHING;

INSERT INTO jadwal (id_jadwal, id_program, tanggal, waktu, lokasi, kegiatan) VALUES
  (1, 1, '2026-10-10', '07:00:00', 'Kampus UNAI',       'Pembukaan dan materi Survival'),
  (2, 1, '2026-11-07', '08:00:00', 'Gunung Burangrang', 'Praktik Navigasi Darat'),
  (3, 1, '2026-11-28', '07:30:00', 'Lapangan UNAI',     'Simulasi P3K'),
  (4, 1, '2026-12-12', '06:00:00', 'Tangkuban Parahu',  'Long March'),
  (5, 2, '2026-11-14', '08:00:00', 'Aula UNAI',         'Kelas Tali-temali'),
  (6, 2, '2026-12-05', '07:00:00', 'Curug Cimahi',      'Praktik BHD')
ON CONFLICT (id_jadwal) DO NOTHING;

-- Andi (anggota 3) sengaja belum terdaftar di program mana pun.
INSERT INTO peserta_pendidikan (id_peserta, id_anggota, id_program, tanggal_daftar, status) VALUES
  (1, 1, 1, '2026-09-01', 'aktif'),
  (2, 2, 1, '2026-09-01', 'aktif'),
  (3, 1, 2, '2026-11-01', 'aktif')
ON CONFLICT DO NOTHING;

INSERT INTO absensi (id_absensi, id_peserta, id_jadwal, status, keterangan) VALUES
  (1, 1, 1, 'hadir', NULL),
  (2, 2, 1, 'izin',  'Acara keluarga'),
  (3, 1, 2, 'hadir', NULL),
  (4, 2, 2, 'hadir', NULL),
  (5, 3, 5, 'sakit', 'Demam')
ON CONFLICT DO NOTHING;

INSERT INTO evaluasi (id_evaluasi, id_peserta, id_jadwal, id_pencatat, hasil_penilaian, catatan, tanggal_evaluasi) VALUES
  (1, 1, 1, 2, 'Mampu membuat bivak sederhana dengan baik.', 'Perlu latihan menyalakan api unggun.', '2026-10-10'),
  (2, 1, 2, 2, 'Navigasi akurat, orientasi medan baik.', NULL, '2026-11-07'),
  (3, 2, 2, 2, 'Cukup baik membaca peta, masih ragu menentukan sudut kompas.', 'Ulangi latihan resection.', '2026-11-07')
ON CONFLICT DO NOTHING;

INSERT INTO progres_materi (id_progres, id_peserta, id_materi, status, tanggal_akses) VALUES
  (1, 1, 1, 'sudah_diakses', '2026-10-11 19:00:00'),
  (2, 1, 2, 'sudah_diakses', '2026-10-15 20:00:00'),
  (3, 2, 1, 'sudah_diakses', '2026-10-12 18:30:00')
ON CONFLICT DO NOTHING;

INSERT INTO notifikasi (id_notifikasi, id_user, id_materi, pesan, status_baca, created_at) VALUES
  (1,  3, 1, 'Materi baru: Survival Dasar',         TRUE,  '2026-09-05 09:00:00'),
  (2,  4, 1, 'Materi baru: Survival Dasar',         TRUE,  '2026-09-05 09:00:00'),
  (3,  3, 2, 'Materi baru: Membaca Peta Topografi', TRUE,  '2026-09-20 09:00:00'),
  (4,  4, 2, 'Materi baru: Membaca Peta Topografi', FALSE, '2026-09-20 09:00:00'),
  (5,  3, 3, 'Materi baru: Penggunaan Kompas',      FALSE, '2026-10-01 09:00:00'),
  (6,  4, 3, 'Materi baru: Penggunaan Kompas',      FALSE, '2026-10-01 09:00:00'),
  (7,  3, 4, 'Materi baru: Pertolongan Pertama',    FALSE, '2026-10-20 09:00:00'),
  (8,  4, 4, 'Materi baru: Pertolongan Pertama',    FALSE, '2026-10-20 09:00:00'),
  (9,  3, 5, 'Materi baru: Simpul Dasar',           FALSE, '2026-11-02 09:00:00'),
  (10, 3, 6, 'Materi baru: Bantuan Hidup Dasar',    FALSE, '2026-11-03 09:00:00')
ON CONFLICT (id_notifikasi) DO NOTHING;

-- Sinkronisasi sequence identity agar INSERT berikutnya tidak bentrok dengan ID seed.
SELECT setval(pg_get_serial_sequence('users', 'id_user'), COALESCE(MAX(id_user), 1), MAX(id_user) IS NOT NULL) FROM users;
SELECT setval(pg_get_serial_sequence('anggota', 'id_anggota'), COALESCE(MAX(id_anggota), 1), MAX(id_anggota) IS NOT NULL) FROM anggota;
SELECT setval(pg_get_serial_sequence('program_pendidikan', 'id_program'), COALESCE(MAX(id_program), 1), MAX(id_program) IS NOT NULL) FROM program_pendidikan;
SELECT setval(pg_get_serial_sequence('kurikulum', 'id_kurikulum'), COALESCE(MAX(id_kurikulum), 1), MAX(id_kurikulum) IS NOT NULL) FROM kurikulum;
SELECT setval(pg_get_serial_sequence('materi', 'id_materi'), COALESCE(MAX(id_materi), 1), MAX(id_materi) IS NOT NULL) FROM materi;
SELECT setval(pg_get_serial_sequence('jadwal', 'id_jadwal'), COALESCE(MAX(id_jadwal), 1), MAX(id_jadwal) IS NOT NULL) FROM jadwal;
SELECT setval(pg_get_serial_sequence('peserta_pendidikan', 'id_peserta'), COALESCE(MAX(id_peserta), 1), MAX(id_peserta) IS NOT NULL) FROM peserta_pendidikan;
SELECT setval(pg_get_serial_sequence('absensi', 'id_absensi'), COALESCE(MAX(id_absensi), 1), MAX(id_absensi) IS NOT NULL) FROM absensi;
SELECT setval(pg_get_serial_sequence('evaluasi', 'id_evaluasi'), COALESCE(MAX(id_evaluasi), 1), MAX(id_evaluasi) IS NOT NULL) FROM evaluasi;
SELECT setval(pg_get_serial_sequence('progres_materi', 'id_progres'), COALESCE(MAX(id_progres), 1), MAX(id_progres) IS NOT NULL) FROM progres_materi;
SELECT setval(pg_get_serial_sequence('notifikasi', 'id_notifikasi'), COALESCE(MAX(id_notifikasi), 1), MAX(id_notifikasi) IS NOT NULL) FROM notifikasi;

COMMIT;
