-- Skema database Sistem Pendidikan MAPALA Eden Club UNAI (implementation.md §11).
-- 11 tabel. Urutan pembuatan mengikuti dependensi FK.
-- ON DELETE: RESTRICT untuk semua FK, kecuali progres_materi.id_materi dan notifikasi.id_materi (CASCADE).

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS evaluasi, notifikasi, progres_materi, absensi, peserta_pendidikan,
  jadwal, materi, kurikulum, program_pendidikan, anggota, users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id_user  INT AUTO_INCREMENT PRIMARY KEY,
  nama     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  no_hp    VARCHAR(20) NULL,
  role     ENUM('admin','pengurus','siswa') NOT NULL,
  status   ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE anggota (
  id_anggota INT AUTO_INCREMENT PRIMARY KEY,
  id_user    INT NOT NULL,
  nim        VARCHAR(20) NULL,
  jurusan    VARCHAR(100) NULL,
  angkatan   VARCHAR(10) NULL,
  kontak     VARCHAR(50) NULL,
  status_keanggotaan ENUM('calon_siswa','siswa','calon_anggota','anggota','ppa','dp','pemburu_tua')
             NOT NULL DEFAULT 'calon_siswa',
  CONSTRAINT uq_anggota_user UNIQUE (id_user),
  CONSTRAINT uq_anggota_nim UNIQUE (nim),
  CONSTRAINT fk_anggota_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE program_pendidikan (
  id_program      INT AUTO_INCREMENT PRIMARY KEY,
  nama_program    VARCHAR(150) NOT NULL,
  jenis           ENUM('rutin','tambahan') NOT NULL,
  deskripsi       TEXT NULL,
  tanggal_mulai   DATE NULL,
  tanggal_selesai DATE NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kurikulum (
  id_kurikulum INT AUTO_INCREMENT PRIMARY KEY,
  id_program   INT NOT NULL,
  tahun        VARCHAR(10) NOT NULL,
  deskripsi    TEXT NULL,
  status       ENUM('draft','diresmikan') NOT NULL DEFAULT 'draft',
  CONSTRAINT fk_kurikulum_program FOREIGN KEY (id_program) REFERENCES program_pendidikan(id_program) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE materi (
  id_materi      INT AUTO_INCREMENT PRIMARY KEY,
  id_program     INT NOT NULL,
  judul          VARCHAR(150) NOT NULL,
  kategori       VARCHAR(100) NOT NULL,
  deskripsi      TEXT NULL,
  file_path      VARCHAR(255) NULL,
  tanggal_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_materi_program FOREIGN KEY (id_program) REFERENCES program_pendidikan(id_program) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE jadwal (
  id_jadwal  INT AUTO_INCREMENT PRIMARY KEY,
  id_program INT NOT NULL,
  tanggal    DATE NOT NULL,
  waktu      TIME NOT NULL,
  lokasi     VARCHAR(150) NOT NULL,
  kegiatan   VARCHAR(150) NOT NULL,
  CONSTRAINT fk_jadwal_program FOREIGN KEY (id_program) REFERENCES program_pendidikan(id_program) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE peserta_pendidikan (
  id_peserta     INT AUTO_INCREMENT PRIMARY KEY,
  id_anggota     INT NOT NULL,
  id_program     INT NOT NULL,
  tanggal_daftar DATE NOT NULL,
  status         ENUM('aktif','selesai') NOT NULL DEFAULT 'aktif',
  CONSTRAINT uq_peserta_anggota_program UNIQUE (id_anggota, id_program),
  CONSTRAINT fk_peserta_anggota FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota) ON DELETE RESTRICT,
  CONSTRAINT fk_peserta_program FOREIGN KEY (id_program) REFERENCES program_pendidikan(id_program) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE absensi (
  id_absensi INT AUTO_INCREMENT PRIMARY KEY,
  id_peserta INT NOT NULL,
  id_jadwal  INT NOT NULL,
  status     ENUM('hadir','izin','sakit','alpa') NOT NULL,
  keterangan TEXT NULL,
  CONSTRAINT uq_absensi_peserta_jadwal UNIQUE (id_peserta, id_jadwal),
  CONSTRAINT fk_absensi_peserta FOREIGN KEY (id_peserta) REFERENCES peserta_pendidikan(id_peserta) ON DELETE RESTRICT,
  CONSTRAINT fk_absensi_jadwal FOREIGN KEY (id_jadwal) REFERENCES jadwal(id_jadwal) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE progres_materi (
  id_progres    INT AUTO_INCREMENT PRIMARY KEY,
  id_peserta    INT NOT NULL,
  id_materi     INT NOT NULL,
  status        ENUM('belum_diakses','sudah_diakses') NOT NULL DEFAULT 'belum_diakses',
  tanggal_akses TIMESTAMP NULL,
  CONSTRAINT uq_progres_peserta_materi UNIQUE (id_peserta, id_materi),
  CONSTRAINT fk_progres_peserta FOREIGN KEY (id_peserta) REFERENCES peserta_pendidikan(id_peserta) ON DELETE RESTRICT,
  CONSTRAINT fk_progres_materi FOREIGN KEY (id_materi) REFERENCES materi(id_materi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifikasi (
  id_notifikasi INT AUTO_INCREMENT PRIMARY KEY,
  id_user       INT NOT NULL,
  id_materi     INT NOT NULL,
  pesan         VARCHAR(255) NOT NULL,
  status_baca   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifikasi_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE RESTRICT,
  CONSTRAINT fk_notifikasi_materi FOREIGN KEY (id_materi) REFERENCES materi(id_materi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE evaluasi (
  id_evaluasi      INT AUTO_INCREMENT PRIMARY KEY,
  id_peserta       INT NOT NULL,
  id_jadwal        INT NOT NULL,
  id_pencatat      INT NOT NULL,
  hasil_penilaian  TEXT NOT NULL,
  catatan          TEXT NULL,
  tanggal_evaluasi DATE NOT NULL,
  CONSTRAINT uq_evaluasi_peserta_jadwal UNIQUE (id_peserta, id_jadwal),
  CONSTRAINT fk_evaluasi_peserta FOREIGN KEY (id_peserta) REFERENCES peserta_pendidikan(id_peserta) ON DELETE RESTRICT,
  CONSTRAINT fk_evaluasi_jadwal FOREIGN KEY (id_jadwal) REFERENCES jadwal(id_jadwal) ON DELETE RESTRICT,
  CONSTRAINT fk_evaluasi_pencatat FOREIGN KEY (id_pencatat) REFERENCES users(id_user) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
