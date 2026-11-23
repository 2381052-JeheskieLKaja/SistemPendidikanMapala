# Sistem Pendidikan MAPALA Eden Club UNAI

Aplikasi web untuk mengelola pendidikan anggota MAPALA Eden Club Universitas Advent Indonesia: data anggota dan tahapan keanggotaan, program pendidikan dan kurikulum, materi per kategori (dengan notifikasi materi baru), jadwal kegiatan, peserta program, absensi, evaluasi hasil penilaian lapangan, laporan, dan progres akses materi.

Spesifikasi: [`implementation.md`](implementation.md). Checklist pembangunan: [`todo.md`](todo.md). Hasil pengujian: [`docs/PENGUJIAN.md`](docs/PENGUJIAN.md).

| Layer | Teknologi |
|---|---|
| Front-end | React 19 + Vite, React Router 7, Axios, Tailwind CSS 4 |
| Back-end | Node.js + Express 5 (REST API) |
| Database | PostgreSQL (driver `pg`, query terparameter, transaksi) |
| Keamanan | JWT (`id_user`, `role`), bcrypt, helmet, CORS terbatas, express-rate-limit (login), multer (unggah dibatasi) |

Peran akun: **Admin**, **Pengurus**, **Siswa**. **Guest** tanpa akun hanya melihat `/publik`.

## Prasyarat

- Node.js 20 atau lebih baru (diuji dengan Node 24).
- PostgreSQL 14+ terpasang di mesin lokal atau server eksternal. Contoh macOS: `brew install postgresql@16 && brew services start postgresql@16`.

## Instalasi

### 1. Database

Buat database dan user PostgreSQL (ganti password):

```sql
CREATE USER mapala WITH PASSWORD 'ganti_password';
CREATE DATABASE mapala_pendidikan OWNER mapala ENCODING 'UTF8';
CREATE DATABASE mapala_pendidikan_test OWNER mapala ENCODING 'UTF8'; -- khusus npm test
```

### 2. Backend (http://localhost:4100)

```bash
cd backend
cp .env.example .env      # isi DB_PASSWORD dan JWT_SECRET (mis. hasil: openssl rand -hex 48)
npm install
npm run db:reset          # menjalankan db/schema.sql lalu db/seed.sql
npm run dev               # atau: npm start
```

`npm run db:reset` setara dengan menjalankan kedua file SQL secara manual:

```bash
psql -h 127.0.0.1 -p 5432 -U mapala -d mapala_pendidikan -f db/schema.sql
psql -h 127.0.0.1 -p 5432 -U mapala -d mapala_pendidikan -f db/seed.sql
```

Variabel `backend/.env`:

| Variabel | Fungsi |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Koneksi PostgreSQL (default port `5432`) |
| `DB_TEST_NAME` | Database terpisah untuk `npm test` (isinya di-reset setiap test) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Penandatanganan token (default 8 jam) |
| `PORT` | Port API (default 4100) |
| `CORS_ORIGIN` | Origin frontend yang diizinkan (default http://localhost:5180) |
| `LOGIN_RATE_MAX` | Opsional, batas percobaan login per 15 menit per IP (default 10) |

### 3. Frontend (http://localhost:5180)

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=/api, VITE_API_TARGET=http://localhost:4100
npm install
npm run dev
```

Buka http://localhost:5180. Request `/api` diteruskan ke backend lewat proxy Vite. Build produksi: `npm run build` (hasil di `frontend/dist`).

### Akun seed (pengujian lokal)

Semua akun seed memakai password **`password123`** (tersimpan sebagai hash bcrypt). Ganti setelah login di menu Profil.

| Peran | Email | Keterangan |
|---|---|---|
| Admin | admin@mapala.test | |
| Pengurus | pengurus@mapala.test | |
| Siswa | budi@mapala.test | Peserta Inagurasi 2026 dan Diklatsar 2026 |
| Siswa | sari@mapala.test | Peserta Inagurasi 2026 |
| Siswa | andi@mapala.test | Belum terdaftar di program mana pun |

Akun Admin dan Pengurus hanya dibuat lewat seed (K7). Akun Siswa dibuat otomatis saat Admin menambah anggota.

## Pengujian

```bash
cd backend
npm test
```

Menjalankan 69 skenario pada database test (`DB_TEST_NAME`) yang di-reset ke seed bersih: Black Box TC-01 s.d. TC-21, skenario tambahan TC-A1 s.d. TC-A10, uji per modul M01–M17 (termasuk simulasi rollback transaksi), dan rate limit login. Rincian hasil ada di [`docs/PENGUJIAN.md`](docs/PENGUJIAN.md).

## Petunjuk penggunaan per aktor

**Admin** (`/admin/*`)
1. **Data Anggota**: tambah anggota (nama, email, NIM, jurusan, angkatan, kontak, tahapan keanggotaan). Akun Siswa dibuat otomatis; bila password awal dikosongkan, sistem menampilkan password sementara **sekali**. Ubah data/tahapan atau nonaktifkan akun; hapus anggota yang belum punya data pendidikan.
2. **Program Pendidikan**: tambah/ubah/hapus program, lalu tombol **Kelola** untuk **Kurikulum**, **Materi**, dan **Peserta** (daftarkan Siswa; pendaftaran ganda ditolak).
3. **Laporan**: filter program dan/atau anggota; tab Ringkasan per peserta dan Detail absensi; klik baris untuk detail progres per materi dan hasil evaluasi.
4. **Profil**: ubah data diri dan password.

**Pengurus** (`/pengurus/*`)
1. **Program**: pilih program, lalu tab **Materi**, **Jadwal**, **Absensi**, **Evaluasi**.
2. **Absensi/Evaluasi**: pilih kegiatan (jadwal), isi status hadir/izin/sakit/alpa atau hasil penilaian per Siswa, lalu Simpan. Menyimpan ulang memperbarui data (tidak menggandakan).
3. **Profil**.

**Siswa** (`/siswa/*`)
1. **Dashboard**: program diikuti, progres modul, kehadiran, jadwal terdekat.
2. **Materi**: materi per program dan kategori; membuka materi tercatat sebagai progres. Lonceng notifikasi menampilkan materi baru; klik notifikasi untuk langsung membuka materinya.
3. **Jadwal** (mendatang/sudah lewat), **Riwayat Absensi**, **Progres** (persentase + hasil evaluasi), **Profil**.

**Guest**: buka `/publik` (atau tautan "Lihat informasi program (tanpa login)" di halaman login).

## Struktur folder

```
backend/
  db/schema.sql, db/seed.sql, db/reset.js
  src/app.js, src/server.js
  src/config/        env.js, db.js (pool + transaksi)
  src/middlewares/   authMiddleware, roleMiddleware, upload (multer), errorHandler
  src/routes/        15 file route (auth, anggota, program, kurikulum, materi, jadwal, peserta,
                     absensi, evaluasi, laporan, progres, notifikasi, profil, publik, dashboard)
  src/controllers/   satu controller per route
  src/utils/         response.js, validators.js, hash.js, siswa.js (pemetaan token → peserta)
  test/              blackbox.test.js, modul.test.js, ratelimit.test.js, helpers.js
  uploads/           berkas materi (tidak di-commit)
frontend/src/
  api/axios.js, context/AuthContext.jsx, hooks/useFetch.js
  routes/            ProtectedRoute, RoleRedirect
  layouts/           RoleLayout (Admin/Pengurus/Siswa), PublikLayout
  components/        ui (tabel, form, modal, badge, loading, empty state), ConfirmDialog, Toast, NotificationBell
  pages/auth, pages/publik, pages/admin, pages/pengurus, pages/siswa
  pages/shared/      komponen halaman yang dipakai lebih dari satu peran (Dashboard pengelola, Materi, Profil, layout Kelola Program)
docs/PENGUJIAN.md    hasil Black Box Testing dan regression
```

## Daftar endpoint (final, sesuai §13)

Semua endpoint selain dua yang publik wajib `Authorization: Bearer <token>`. Respons sukses `{success, data, message}`; gagal `{success:false, message, errors}`.

| Endpoint | Peran |
|---|---|
| `POST /api/auth/login` | publik (rate limit) |
| `GET /api/publik/program` | publik |
| `GET/POST /api/anggota`, `PUT/DELETE /api/anggota/:id` | admin |
| `GET /api/program`, `GET /api/program/:id` | admin, pengurus |
| `POST /api/program`, `PUT/DELETE /api/program/:id` | admin |
| `GET/POST /api/kurikulum`, `PUT /api/kurikulum/:id` | admin |
| `GET/POST /api/materi`, `PUT/DELETE /api/materi/:id` | admin, pengurus |
| `GET /api/materi/saya` | siswa |
| `GET /api/materi/:id/file` | admin, pengurus, siswa (program yang diikuti) |
| `GET/POST /api/jadwal`, `PUT/DELETE /api/jadwal/:id` | pengurus |
| `GET /api/jadwal/saya` | siswa |
| `GET/POST /api/peserta` | admin |
| `GET/POST /api/absensi` (upsert) | pengurus |
| `GET /api/absensi/saya` | siswa |
| `GET/POST /api/evaluasi` (upsert) | pengurus |
| `GET /api/laporan?id_program=&id_anggota=` | admin |
| `POST /api/progres/tandai-akses`, `GET /api/progres/saya` | siswa |
| `GET /api/notifikasi`, `PUT /api/notifikasi/:id/dibaca` | siswa |
| `GET/PUT /api/profil/me`, `PUT /api/profil/me/password` | admin, pengurus, siswa |
| `GET /api/dashboard` | admin, pengurus, siswa |

## Struktur database (final, sesuai §11)

11 tabel di [`backend/db/schema.sql`](backend/db/schema.sql): `users`, `anggota`, `program_pendidikan`, `kurikulum`, `materi`, `jadwal`, `peserta_pendidikan`, `absensi`, `progres_materi`, `notifikasi`, `evaluasi`. UNIQUE: `users.email`, `anggota.id_user`, `anggota.nim`, `peserta_pendidikan(id_anggota,id_program)`, `absensi(id_peserta,id_jadwal)`, `progres_materi(id_peserta,id_materi)`, `evaluasi(id_peserta,id_jadwal)`. Semua FK `ON DELETE RESTRICT`, kecuali `progres_materi.id_materi` dan `notifikasi.id_materi` (`CASCADE`).
