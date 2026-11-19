-- Data awal untuk pengujian lokal. Jalankan setelah schema.sql.
-- Semua akun memakai password: password123 (disimpan sebagai hash bcrypt, bukan teks polos).
-- Akun Admin dan Pengurus hanya dibuat lewat seed (K7).

SET @pw = '$2a$10$dP8fUPcDUr/XbQJLyMWk3e5HDgO/xbAkT/oh7D1y.ldFk9BlJPtrm';

INSERT INTO users (id_user, nama, email, password, no_hp, role, status) VALUES
  (1, 'Admin MAPALA',          'admin@mapala.test',    @pw, '081200000001', 'admin',    'aktif'),
  (2, 'Sekretaris Pengurus',   'pengurus@mapala.test', @pw, '081200000002', 'pengurus', 'aktif'),
  (3, 'Budi Santoso',          'budi@mapala.test',     @pw, '081200000003', 'siswa',    'aktif'),
  (4, 'Sari Wulandari',        'sari@mapala.test',     @pw, '081200000004', 'siswa',    'aktif'),
  (5, 'Andi Pratama',          'andi@mapala.test',     @pw, '081200000005', 'siswa',    'aktif');

INSERT INTO anggota (id_anggota, id_user, nim, jurusan, angkatan, kontak, status_keanggotaan) VALUES
  (1, 3, '2381001', 'Informatika', '2023', '081200000003', 'siswa'),
  (2, 4, '2381002', 'Keperawatan', '2023', '081200000004', 'calon_anggota'),
  (3, 5, '2481003', 'Akuntansi',   '2024', '081200000005', 'calon_siswa');

INSERT INTO program_pendidikan (id_program, nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai) VALUES
  (1, 'Pendidikan Dasar (Inagurasi) 2026', 'rutin',
      'Program wajib tahunan untuk calon anggota: survival, navigasi darat, dan P3K.', '2026-09-01', '2027-01-31'),
  (2, 'Diklatsar 2026', 'rutin',
      'Pendidikan dan latihan dasar: tali-temali, tandu, dan bantuan hidup dasar.', '2026-11-01', '2026-12-20'),
  (3, 'Arung Jeram Semester Genap 2027', 'tambahan',
      'Program tambahan pengenalan olahraga arung jeram.', '2027-02-01', '2027-03-31');

INSERT INTO kurikulum (id_kurikulum, id_program, tahun, deskripsi, status) VALUES
  (1, 1, '2026', 'Kurikulum Inagurasi: survival, navigasi darat, P3K, dan long march.', 'diresmikan'),
  (2, 2, '2026', 'Kurikulum Diklatsar: tali-temali, tandu, BHD.', 'draft');

INSERT INTO materi (id_materi, id_program, judul, kategori, deskripsi, file_path, tanggal_upload) VALUES
  (1, 1, 'Survival Dasar',          'Survival', 'Teknik bertahan hidup di alam bebas: membuat bivak, mencari air, dan menyalakan api.', NULL, '2026-09-05 09:00:00'),
  (2, 1, 'Membaca Peta Topografi',  'Navigasi', 'Mengenal garis kontur, skala, dan simbol pada peta topografi.', NULL, '2026-09-20 09:00:00'),
  (3, 1, 'Penggunaan Kompas',       'Navigasi', 'Menentukan arah, sudut kompas, resection dan intersection.', NULL, '2026-10-01 09:00:00'),
  (4, 1, 'Pertolongan Pertama',     'P3K',      'Penanganan luka, patah tulang, dan hipotermia di lapangan.', NULL, '2026-10-20 09:00:00'),
  (5, 2, 'Simpul Dasar',            'Tali-temali dan Tandu', 'Simpul pangkal, simpul jangkar, dan pembuatan tandu darurat.', NULL, '2026-11-02 09:00:00'),
  (6, 2, 'Bantuan Hidup Dasar',     'BHD',      'Langkah RJP (resusitasi jantung paru) untuk orang awam.', NULL, '2026-11-03 09:00:00');

INSERT INTO jadwal (id_jadwal, id_program, tanggal, waktu, lokasi, kegiatan) VALUES
  (1, 1, '2026-10-10', '07:00:00', 'Kampus UNAI',        'Pembukaan dan materi Survival'),
  (2, 1, '2026-11-07', '08:00:00', 'Gunung Burangrang',  'Praktik Navigasi Darat'),
  (3, 1, '2026-11-28', '07:30:00', 'Lapangan UNAI',      'Simulasi P3K'),
  (4, 1, '2026-12-12', '06:00:00', 'Tangkuban Parahu',   'Long March'),
  (5, 2, '2026-11-14', '08:00:00', 'Aula UNAI',          'Kelas Tali-temali'),
  (6, 2, '2026-12-05', '07:00:00', 'Curug Cimahi',       'Praktik BHD');

-- Andi (anggota 3) sengaja belum terdaftar di program mana pun.
INSERT INTO peserta_pendidikan (id_peserta, id_anggota, id_program, tanggal_daftar, status) VALUES
  (1, 1, 1, '2026-09-01', 'aktif'),
  (2, 2, 1, '2026-09-01', 'aktif'),
  (3, 1, 2, '2026-11-01', 'aktif');

INSERT INTO absensi (id_peserta, id_jadwal, status, keterangan) VALUES
  (1, 1, 'hadir', NULL),
  (2, 1, 'izin',  'Acara keluarga'),
  (1, 2, 'hadir', NULL),
  (2, 2, 'hadir', NULL),
  (3, 5, 'sakit', 'Demam');

INSERT INTO evaluasi (id_peserta, id_jadwal, id_pencatat, hasil_penilaian, catatan, tanggal_evaluasi) VALUES
  (1, 1, 2, 'Mampu membuat bivak sederhana dengan baik.', 'Perlu latihan menyalakan api unggun.', '2026-10-10'),
  (1, 2, 2, 'Navigasi akurat, orientasi medan baik.', NULL, '2026-11-07'),
  (2, 2, 2, 'Cukup baik membaca peta, masih ragu menentukan sudut kompas.', 'Ulangi latihan resection.', '2026-11-07');

INSERT INTO progres_materi (id_peserta, id_materi, status, tanggal_akses) VALUES
  (1, 1, 'sudah_diakses', '2026-10-11 19:00:00'),
  (1, 2, 'sudah_diakses', '2026-10-15 20:00:00'),
  (2, 1, 'sudah_diakses', '2026-10-12 18:30:00');

INSERT INTO notifikasi (id_user, id_materi, pesan, status_baca, created_at) VALUES
  (3, 1, 'Materi baru: Survival Dasar',         TRUE,  '2026-09-05 09:00:00'),
  (4, 1, 'Materi baru: Survival Dasar',         TRUE,  '2026-09-05 09:00:00'),
  (3, 2, 'Materi baru: Membaca Peta Topografi', TRUE,  '2026-09-20 09:00:00'),
  (4, 2, 'Materi baru: Membaca Peta Topografi', FALSE, '2026-09-20 09:00:00'),
  (3, 3, 'Materi baru: Penggunaan Kompas',      FALSE, '2026-10-01 09:00:00'),
  (4, 3, 'Materi baru: Penggunaan Kompas',      FALSE, '2026-10-01 09:00:00'),
  (3, 4, 'Materi baru: Pertolongan Pertama',    FALSE, '2026-10-20 09:00:00'),
  (4, 4, 'Materi baru: Pertolongan Pertama',    FALSE, '2026-10-20 09:00:00'),
  (3, 5, 'Materi baru: Simpul Dasar',           FALSE, '2026-11-02 09:00:00'),
  (3, 6, 'Materi baru: Bantuan Hidup Dasar',    FALSE, '2026-11-03 09:00:00');
