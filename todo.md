# TODO — Pembangunan Sistem Pendidikan MAPALA Eden Club UNAI

> **Acuan tunggal:** `implementation.md` (disusun dari skripsi `2381052_JeheskielKaja_Revisi_SP.docx`). Rujukan "§" = bagian di `implementation.md`; "M0x" = modul alur di §8; "TC-xx" = skenario Black Box di §17.
> Kerjakan **berurutan per tahap (0–12)**. Jangan lompat sebelum tahap sebelumnya berjalan tanpa error di terminal/console. Setelah tiap tahap, laporkan: **berhasil / ada error**.
> Jangan menambah fitur, tabel, role, atau endpoint di luar `implementation.md`. Jika menemukan hal yang bertentangan, catat di §19 (K-xx) dan tanyakan dulu.
> **Ketentuan tetap:** tanpa Docker · Black Box Testing saja (tanpa SUS) · role hanya `admin`, `pengurus`, `siswa` (+ Guest tanpa akun) · tidak memakai istilah role lama Instruktur/Peserta.
> Semua item di bawah dimulai `[ ]` karena aplikasi belum dibangun. Ubah ke `[x]` hanya setelah benar-benar selesai dan diverifikasi.
> **Status (19 Nov 2026):** aplikasi dibangun dan diuji (69 uji otomatis lolos + uji UI per aktor). Butir yang masih `[ ]` menunggu pengguna/dosen; alasannya ditulis di butir tersebut. Hasil pengujian: `docs/PENGUJIAN.md`.

---

## Tahap 0 — Project Setup (§2, §10)

- [x] Buat folder root dengan dua subfolder: `backend/` dan `frontend/`.
- [x] Buat `.gitignore` yang mengecualikan `node_modules/`, `.env`, `backend/uploads/`, dan `dist/`.
- [x] Pastikan MySQL terpasang **langsung di mesin lokal** (tanpa Docker) dan server berjalan. Verifikasi dengan `mysql -u <user> -p`.
- [x] Inisialisasi `backend/package.json` lalu pasang: `express`, `mysql2`, `jsonwebtoken`, `bcrypt`, `dotenv`, `cors`, `multer`, `helmet`, `express-rate-limit`. Pasang dev: `nodemon`.
- [x] Buat proyek frontend dengan Vite (template React) di `frontend/`, lalu pasang `react-router-dom`, `axios`, dan Tailwind CSS.
- [x] Buat `backend/.env` dengan `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`.
- [x] Buat `backend/.env.example` (tanpa nilai rahasia) sebagai contoh.
- [x] Tambahkan script `npm run dev` untuk backend (nodemon) dan frontend (Vite).
- [x] Buat kerangka folder backend sesuai §10: `src/{config,middlewares,routes,controllers,utils}`, `db/`, `uploads/`.
- [x] Buat kerangka folder frontend sesuai §10: `src/{api,context,routes,layouts,components,pages/{auth,publik,admin,pengurus,siswa},utils}`.
- [x] **Verifikasi tahap 0:** backend dan frontend masing-masing bisa dijalankan tanpa error; tidak ada kredensial yang ter-hardcode.

## Tahap 1 — Database dan Struktur Tabel (§11)

- [x] Buat database MySQL kosong sesuai `DB_NAME` di `.env`.
- [x] Buat `backend/db/schema.sql` berisi **11 tabel** persis sesuai §11. Urutan mengikuti dependensi FK: `users` → `anggota` → `program_pendidikan` → `kurikulum`, `materi`, `jadwal` → `peserta_pendidikan` → `absensi`, `progres_materi`, `notifikasi`, `evaluasi`.
- [x] Tabel `users`: PK `id_user`, `email` UNIQUE, `role` ENUM('admin','pengurus','siswa'), `status` ENUM('aktif','nonaktif').
- [x] Tabel `anggota`: FK `id_user` (UNIQUE, relasi 1–1), `nim` UNIQUE, `status_keanggotaan` ENUM 7 tahap (`calon_siswa`, `siswa`, `calon_anggota`, `anggota`, `ppa`, `dp`, `pemburu_tua`).
- [x] Tabel `program_pendidikan` (tanpa kolom `kuota`, sesuai K4), `kurikulum`, `materi` (dengan kolom `kategori`, tanpa `jenis_file`), dan `jadwal`.
- [x] Tabel `peserta_pendidikan` dengan UNIQUE (`id_anggota`, `id_program`).
- [x] Tabel `absensi` dengan UNIQUE (`id_peserta`, `id_jadwal`).
- [x] Tabel `progres_materi` dengan UNIQUE (`id_peserta`, `id_materi`).
- [x] Tabel `notifikasi` (`id_user`, `id_materi`, `pesan`, `status_baca`, `created_at`).
- [x] Tabel `evaluasi` dengan FK `id_pencatat` → `users.id_user` dan UNIQUE (`id_peserta`, `id_jadwal`).
- [x] Terapkan aturan ON DELETE sesuai §11.12: RESTRICT secara umum; CASCADE hanya untuk `progres_materi` dan `notifikasi` terhadap `materi`.
- [x] Pastikan **tidak ada** tabel `jabatan`, `nilai_evaluasi`, atau `rekap_pendidikan`.
- [x] Buat `backend/db/seed.sql` (hash bcrypt, bukan password polos): 1 Admin, 1 Pengurus, 2–3 Siswa beserta baris `anggota`, 1–2 program, kurikulum, beberapa materi dengan kategori berbeda, beberapa jadwal, dan peserta program.
- [x] Jalankan `schema.sql` lalu `seed.sql`. Pastikan semua FK dan UNIQUE ter-apply tanpa error.
- [x] Verifikasi: sisipkan pendaftaran ganda secara manual di MySQL dan pastikan ditolak constraint.
- [x] **Verifikasi tahap 1:** 11 tabel ada; struktur kolom cocok dengan §11; data seed bisa di-`SELECT`.

## Tahap 2 — Backend dan Konfigurasi API (§3, §9, §13.15, §15)

- [x] `src/config/db.js`: connection pool `mysql2` dari `.env`; saat server start jalankan `SELECT 1` dan log hasil/gagal.
- [x] `src/app.js`: pasang `helmet`, `cors` (origin dari `CORS_ORIGIN`), `express.json()`, route, `errorHandler`. `src/server.js` menjalankan server pada `PORT`.
- [x] `utils/response.js`: helper respons seragam `{success, data, message}` dan `{success:false, message, errors}`.
- [x] `middlewares/errorHandler.js`: pemetaan error MySQL `ER_DUP_ENTRY` dan `ER_ROW_IS_REFERENCED_2` ke 409, validasi ke 400, selain itu 500 dengan pesan umum (detail hanya di log).
- [x] `utils/validators.js`: helper wajib-isi, format email, format tanggal/waktu, cek nilai enum.
- [x] `middlewares/upload.js` (multer): whitelist ekstensi dan batas ukuran, nama file acak, simpan ke `uploads/`.
- [x] Buat file route kosong per modul (auth, anggota, program, kurikulum, materi, jadwal, peserta, absensi, evaluasi, laporan, progres, notifikasi, profil, publik, dashboard) dan daftarkan semuanya di `app.js` dengan prefix `/api/...`.
- [x] Buat satu controller per route dengan nama sesuai Sequence Diagram (Controller Auth, Anggota, Program, dst.).
- [x] **Verifikasi tahap 2:** server berjalan, koneksi MySQL sukses, route yang belum diisi mengembalikan 404/501 terkontrol, dan error handler merespons format seragam.

## Tahap 3 — Autentikasi dan Hak Akses (§12, M01)

- [x] Controller Auth `POST /api/auth/login`: validasi email dan password wajib (400); `SELECT users` by email; bandingkan hash dengan bcrypt; tolak akun `nonaktif` (403); buat JWT berisi `id_user` dan `role` dengan masa berlaku dari `.env`.
- [x] Respons login gagal memakai pesan yang sama untuk email tidak ada dan password salah (401, "Email atau password salah").
- [x] Respons login sukses: `{token, role, user{id_user, nama, role}}`; pastikan field `password` tidak pernah ikut terkirim.
- [x] Pasang `express-rate-limit` pada route login (429 saat terlalu banyak percobaan).
- [x] **Tidak membuat** endpoint `POST /api/auth/logout` (logout di frontend, K8).
- [x] `middlewares/authMiddleware.js`: baca `Authorization: Bearer`, verifikasi tanda tangan dan kedaluwarsa, isi `req.user = {id_user, role}`, gagal → 401.
- [x] `middlewares/roleMiddleware.js`: `roleMiddleware(['admin', ...])`, role tidak cocok → 403 dengan pesan "Anda tidak memiliki hak akses".
- [x] Terapkan `authMiddleware` ke **seluruh** route kecuali `POST /api/auth/login` dan `GET /api/publik/program`.
- [x] Terapkan `roleMiddleware` per route sesuai tabel akses di §13.15.
- [x] **Uji manual (REST client):**
  - [x] Login akun seed Admin, Pengurus, dan Siswa menghasilkan token berisi role yang benar.
  - [x] Login dengan password salah → 401.
  - [x] Request ke endpoint terproteksi tanpa token → 401.
  - [x] Token Siswa ke endpoint Admin → 403.
- [x] **Verifikasi tahap 3:** kontrol akses backend berfungsi sebelum modul lain dibangun.

## Tahap 4 — Frontend dan Struktur Halaman (§3, §12, §14)

- [x] `src/api/axios.js`: axios instance dengan `baseURL` dari env Vite; interceptor request menyisipkan `Authorization: Bearer <token>`; interceptor respons 401 menghapus token dan redirect ke `/login`.
- [x] `context/AuthContext.jsx`: simpan token dan user (`id_user`, `nama`, `role`) di `localStorage`; fungsi `login()` dan `logout()` (logout = hapus token tanpa API); pulihkan sesi saat halaman dimuat ulang.
- [x] `routes/ProtectedRoute.jsx`: cek token dan role; role salah diarahkan ke dashboard miliknya atau halaman "akses ditolak".
- [x] `routes/RoleRedirect.jsx` untuk `/dashboard`: arahkan ke `/admin/dashboard`, `/pengurus/dashboard`, atau `/siswa/dashboard`.
- [x] Layout: `AdminLayout`, `PengurusLayout`, `SiswaLayout` (navbar sesuai menu role + tombol Logout), dan `PublikLayout`.
- [x] Definisikan **seluruh route** di `App.jsx` sesuai tabel §14 (placeholder halaman dulu), termasuk `/login` dan `/publik`.
- [x] Menu navbar Admin: Dashboard, Data Anggota, Program Pendidikan, Laporan, Profil. Tidak ada menu Jadwal, Absensi, atau Evaluasi (sesuai Tabel 4).
- [x] Menu navbar Pengurus: Dashboard, Program (Materi, Jadwal, Absensi, Evaluasi), Profil. Tidak ada menu Data Anggota, Program (kelola), Kurikulum, Peserta, atau Laporan.
- [x] Menu navbar Siswa: Dashboard, Materi (dengan lonceng notifikasi), Jadwal, Riwayat Absensi, Progres, Profil.
- [x] Komponen bersama (§14): tabel, form field, dialog konfirmasi hapus, alert sukses/gagal, state kosong, indikator loading.
- [x] **Verifikasi tahap 4:** semua route bisa dibuka sesuai role dan di-redirect jika role salah; tampilan masih placeholder tetapi tanpa error console.

## Tahap 5 — Implementasi Fitur Setiap Aktor (§4, §6, §7)

> Memastikan batas fitur per aktor terpenuhi. Fungsi lengkap tiap modul dikerjakan di Tahap 6.

- [x] **Admin:** alur login → `/admin/dashboard` → menu Data Anggota, Program (Kelola: Kurikulum, Materi, Peserta), Laporan, Profil, Info Publik. Pastikan **tidak** ada fitur jadwal/absensi/evaluasi.
- [x] **Pengurus:** alur login → `/pengurus/dashboard` → pilih Program → Materi, Jadwal, Absensi, Evaluasi → Profil, Info Publik. Pastikan **tidak** ada fitur anggota/program/kurikulum/peserta/laporan.
- [x] **Siswa:** alur login → `/siswa/dashboard` → Materi, Jadwal, Riwayat Absensi, Progres, Profil, Info Publik. Pastikan **tidak** ada fitur kelola/laporan.
- [x] **Guest:** `/publik` terbuka tanpa token; tautan "Lihat informasi program (tanpa login)" ada di halaman login.
- [x] `GET /api/program` dan `GET /api/program/:id` bisa diakses `admin` **dan** `pengurus` (read-only untuk Pengurus). Operasi tulis hanya Admin.
- [x] Verifikasi matriks akses: bandingkan route backend dan menu frontend dengan Tabel 4 baris demi baris (§4.2).
- [x] **Verifikasi tahap 5:** tidak ada fitur milik aktor lain yang bisa dibuka lewat menu maupun URL langsung.

## Tahap 6 — Implementasi Masing-masing Modul (§8, §13)

> Urutan mengikuti prioritas Tabel 3 (Tinggi → Sedang → Rendah). Untuk setiap modul: backend → frontend → uji manual. Lanjut ke modul berikutnya hanya jika modul sebelumnya tanpa error.

### 6.1 Prioritas Tinggi

#### M02 — Kelola Data Anggota (Admin)
- [x] `GET /api/anggota` (JOIN `users`; dukung query `q` untuk nama/email/NIM) — role admin.
- [x] `POST /api/anggota`: validasi (nama, email, status_keanggotaan wajib; format email; email dan NIM unik) → **transaksi**: hash password awal, `INSERT users` (role=siswa), `INSERT anggota`; rollback bila salah satu gagal.
- [x] Bila password awal kosong, BE membuat password sementara dan mengembalikannya sekali di respons (K7).
- [x] `PUT /api/anggota/:id`: ubah data anggota, status tahapan keanggotaan, dan nama/email/no_hp pada `users`; 404 bila tidak ada; 409 bila email/NIM bentrok.
- [x] `DELETE /api/anggota/:id`: hapus `anggota` dan `users` dalam transaksi; tolak 409 bila sudah punya data peserta (K9).
- [x] FE `/admin/anggota`: tabel (Nama, NIM, Jurusan/Angkatan, Kontak, Keanggotaan, Akun, Aksi), kotak cari, tombol Tambah, form tambah/ubah, dialog konfirmasi hapus, muat ulang daftar setelah aksi.
- [x] Uji manual: tambah anggota lalu login memakai akun barunya (TC-04); ubah status keanggotaan (TC-05); data tidak lengkap/email ganda ditolak; token Siswa ditolak 403 (TC-21).

#### M03 — Kelola Program Pendidikan (Admin)
- [x] `GET /api/program` (admin, pengurus), `GET /api/program/:id` (admin, pengurus).
- [x] `POST`, `PUT /:id`, `DELETE /:id` (admin): validasi nama_program dan jenis wajib, format tanggal, `tanggal_selesai` ≥ `tanggal_mulai`; hapus ditolak 409 bila masih punya kurikulum/materi/jadwal/peserta.
- [x] FE `/admin/program`: tabel program, tombol Tambah, form tambah/ubah, hapus, dan tombol **Kelola** (hanya ke Kurikulum, Materi, Peserta).
- [x] FE `/pengurus/program`: daftar program read-only untuk memilih program.
- [x] Uji manual: tambah program tampil di daftar (TC-06); ubah dan hapus; hapus program berisi data → 409.

#### M05 — Kelola Materi (Admin, Pengurus) + Notifikasi
- [x] `GET /api/materi?id_program=` (admin, pengurus).
- [x] `POST /api/materi` (multipart, file opsional): validasi judul, kategori, program; **transaksi**: `INSERT materi` → ambil Siswa program (`peserta_pendidikan` → `anggota` → `id_user`) → `INSERT notifikasi` per Siswa (`status_baca=false`, pesan "Materi baru: …"); program tanpa peserta tetap sukses dengan 0 notifikasi.
- [x] `PUT /api/materi/:id` (ubah data/file) dan `DELETE /api/materi/:id` (hapus baris + file fisik; progres dan notifikasi turunan ikut terhapus).
- [x] `GET /api/materi/:id/file`: sajikan file hanya untuk admin, pengurus, atau Siswa dari program yang diikuti.
- [x] FE `/admin/program/:id/materi` dan `/pengurus/program/:id/materi` (satu komponen): daftar materi **dikelompokkan per kategori**, form tambah/ubah dengan unggah file, hapus dengan konfirmasi.
- [x] Uji manual: tambah materi dengan kategori (TC-08); cek tabel `notifikasi` terisi untuk tiap Siswa; ubah dan hapus; file tidak valid ditolak; Siswa ke endpoint kelola → 403.

#### M06 — Kelola Jadwal Kegiatan (Pengurus)
- [x] `GET /api/jadwal?id_program=` (pengurus; urut tanggal, waktu).
- [x] `POST /api/jadwal`: data lengkap → 201; **tidak lengkap → 400 tanpa menyimpan**.
- [x] `PUT /api/jadwal/:id` (200) dan `DELETE /api/jadwal/:id` (200); tolak 409 bila jadwal sudah punya absensi/evaluasi.
- [x] Pastikan Admin ke endpoint kelola jadwal → 403 (Tabel 4).
- [x] FE `/pengurus/program/:id/jadwal`: daftar, form (tanggal, waktu, lokasi, kegiatan), ubah/hapus.
- [x] Uji manual: tambah jadwal tampil di daftar (TC-09); data kosong ditolak; Admin ditolak.

#### M07 — Kelola Peserta Program (Admin)
- [x] `GET /api/peserta?id_program=` (JOIN anggota dan users).
- [x] `POST /api/peserta {id_anggota, id_program}`: cek keberadaan anggota dan program (404); **cek pendaftaran ganda** → 409 "Siswa sudah terdaftar"; selain itu `INSERT` dengan `tanggal_daftar`=hari ini.
- [x] Tidak membuat fitur hapus/ubah status peserta (K11).
- [x] FE `/admin/program/:id/peserta`: daftar peserta, pilih Siswa (dari `/api/anggota`), tombol Daftarkan, tampil pesan ditolak untuk duplikat.
- [x] Uji manual: daftarkan Siswa (TC-10); daftarkan lagi → ditolak dengan pesan (TC-11); dua request bersamaan tidak menghasilkan duplikat (UNIQUE).

#### M08 — Kelola Absensi (Pengurus)
- [x] `GET /api/absensi?id_jadwal=`: peserta program dari jadwal itu (LEFT JOIN `absensi`) dengan status/keterangan yang sudah ada.
- [x] `POST /api/absensi {id_jadwal, data[{id_peserta, status, keterangan}]}`: validasi status ∈ {hadir, izin, sakit, alpa}; setiap `id_peserta` harus peserta program milik jadwal; **transaksi** — INSERT bila belum ada, UPDATE bila sudah ada (upsert pada UNIQUE).
- [x] FE `/pengurus/program/:id/absensi`: pilih jadwal → form per Siswa (pilihan status + keterangan) → Simpan → tampil rekap kehadiran kegiatan; semua Siswa wajib diberi status.
- [x] Tidak membuat `PUT /api/absensi/:id` (pembaruan lewat upsert).
- [x] Uji manual: simpan absensi satu kegiatan (TC-12); simpan ulang memperbarui data tanpa duplikat; peserta tidak sesuai/status tidak valid → 400; Admin dan Siswa ditolak.

#### M09 — Kelola Evaluasi (Pengurus)
- [x] `GET /api/evaluasi?id_jadwal=`: peserta program + hasil evaluasi yang ada.
- [x] `POST /api/evaluasi {id_jadwal, data[{id_peserta, hasil_penilaian, catatan}]}`: validasi `hasil_penilaian` wajib untuk baris yang diisi; **upsert** (INSERT atau UPDATE); `id_pencatat` dari token; `tanggal_evaluasi` = hari ini.
- [x] FE `/pengurus/program/:id/evaluasi`: pilih jadwal → form hasil penilaian dan catatan per Siswa → Simpan → rekap hasil evaluasi kegiatan.
- [x] Pastikan tidak ada nilai angka, status lulus/tidak lulus, atau tabel rekap (K3).
- [x] Uji manual: simpan evaluasi (TC-13); simpan ulang memperbarui; hanya Pengurus yang bisa.

#### M11 — Siswa Mengakses Materi dan Notifikasi
- [x] Helper backend pemetaan identitas: `token.id_user` → `anggota` → `peserta_pendidikan` (digunakan semua endpoint `/saya`).
- [x] `GET /api/materi/saya`: materi dari program yang diikuti beserta status akses (dari `progres_materi`).
- [x] `POST /api/progres/tandai-akses {id_materi}`: cek materi milik program Siswa (403 bila bukan); upsert `progres_materi` `status='sudah_diakses'`, `tanggal_akses` terisi sekali dan tidak ditimpa; tidak menghasilkan baris ganda.
- [x] `GET /api/notifikasi` (milik sendiri + jumlah belum dibaca) dan `PUT /api/notifikasi/:id/dibaca` (cek kepemilikan; 403 bila bukan miliknya).
- [x] FE `/siswa/materi`: daftar materi per kategori; saat materi dipilih panggil `tandai-akses` **dulu**, baru tampilkan isi materi; bila gagal tampilkan pesan dan jangan tampilkan isi; pesan khusus bila belum terdaftar di program.
- [x] FE `NotificationBell`: jumlah belum dibaca, daftar notifikasi, buka notifikasi → tandai dibaca dan menuju materi.
- [x] Uji manual: Siswa menerima notifikasi setelah materi baru ditambah; membuka materi tercatat sebagai progres (TC-15); membuka materi yang sama dua kali tidak menggandakan baris; membuka materi program lain ditolak.

### 6.2 Prioritas Sedang

#### M04 — Kelola Kurikulum (Admin)
- [x] `GET /api/kurikulum?id_program=`, `POST /api/kurikulum`, `PUT /api/kurikulum/:id` (admin). Tidak ada DELETE (sesuai Gambar 6).
- [x] Validasi: program ada (404), tahun dan status wajib (400), status ∈ enum.
- [x] FE `/admin/program/:id/kurikulum`: daftar, form tambah/ubah (tahun, deskripsi, status).
- [x] Uji manual: kurikulum tersimpan pada program terpilih (TC-07).

#### M10 — Melihat Laporan (Admin)
- [x] `GET /api/laporan?id_program=&id_anggota=` (admin): gabungkan data `absensi`, `progres_materi` (+ total `materi`), dan `evaluasi` menjadi rekap per Siswa (hadir/izin/sakit/alpa, persentase progres, daftar evaluasi, detail absensi, detail progres per materi).
- [x] Filter bersifat opsional; tanpa filter menampilkan semua peserta; total materi 0 → persentase 0.
- [x] FE `/admin/laporan`: filter Program dan Anggota, tombol Reset, tab "Ringkasan per peserta" dan "Detail absensi", klik baris untuk detail progres per materi, state kosong "Tidak ada data peserta untuk filter ini".
- [x] Uji manual: pilih filter program menampilkan rekap kehadiran, progres, dan evaluasi (TC-14); angka sesuai data yang diinput di modul sebelumnya; non-Admin → 403.

#### M12 — Siswa Melihat Jadwal
- [x] `GET /api/jadwal/saya`: jadwal program yang diikuti Siswa (dari token).
- [x] FE `/siswa/jadwal`: dua seksi "Mendatang" dan "Sudah lewat"; pesan kosong bila tidak ada.
- [x] Uji manual: hanya jadwal program yang diikuti yang tampil (TC-16).

#### M13 — Siswa Melihat Riwayat Absensi
- [x] `GET /api/absensi/saya`: absensi **hanya milik Siswa login**; hitung jumlah hadir/izin/sakit/alpa; **tanpa parameter ID dari klien**.
- [x] FE `/siswa/absensi`: kartu rekap Hadir/Izin/Sakit/Alpa dan tabel riwayat; pesan "Belum ada riwayat absensi".
- [x] Uji manual: riwayat milik sendiri tampil (TC-17); Siswa A tidak dapat melihat data Siswa B.

#### M14 — Siswa Melihat Progres dan Hasil Evaluasi
- [x] `GET /api/progres/saya`: progres per program (total materi, jumlah diakses, status per materi), **persentase = (sudah_diakses ÷ total materi) × 100** (dihitung saat request, tanpa tabel rekap; 0 bila total 0), plus hasil evaluasi milik Siswa.
- [x] FE `/siswa/progres`: persentase progres modul per program, daftar materi dengan status, hasil evaluasi; pesan bila belum ada evaluasi.
- [x] Uji manual: persentase berubah sesuai jumlah materi yang dibuka (TC-18); hasil evaluasi yang diinput Pengurus muncul.

### 6.3 Prioritas Rendah

#### M15 — Mengubah Profil (Admin, Pengurus, Siswa)
- [x] `GET /api/profil/me`: data akun dari token, tanpa field `password`.
- [x] `PUT /api/profil/me`: validasi nama dan email wajib, format email, email unik (kecuali miliknya); `UPDATE users` hanya field nama, email, no_hp; field `role`, `status`, `id_user`, `nim`, `status_keanggotaan` diabaikan/ditolak; `id_user` dari token.
- [x] `PUT /api/profil/me/password`: verifikasi password lama (bcrypt), password baru ≥ 8 karakter, konfirmasi sama, simpan hash baru.
- [x] FE `/admin/profil`, `/pengurus/profil`, `/siswa/profil` (komponen yang sama): data diri, info akun (peran dan status, read-only), form ganti password; pesan sukses/gagal.
- [x] Uji manual: perubahan profil tersimpan (TC-19); data tidak valid ditolak; mengirim `id_user` orang lain di body tidak berpengaruh.

#### M16 — Informasi Publik (Guest)
- [x] `GET /api/publik/program` **tanpa autentikasi**: hanya kolom nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai; tidak ada join ke `users`/`anggota`.
- [x] FE `/publik`: daftar informasi program; pesan "Belum ada program" bila kosong; tautan dari halaman login.
- [x] Uji manual: buka tanpa login, informasi tampil tanpa data pribadi (TC-20).

### 6.4 Dashboard (M17)

- [x] `GET /api/dashboard` (admin, pengurus, siswa; isi bergantung role dari token).
- [x] Admin/Pengurus: total anggota + rincian per `status_keanggotaan`, program aktif (hari ini di antara tanggal mulai dan selesai) dengan jumlah peserta, jadwal terdekat.
- [x] Siswa: program diikuti, persentase progres modul (dan "x dari y materi"), rekap kehadiran (hadir/izin/sakit/alpa), jadwal terdekat, daftar "Program saya" dengan tombol Buka materi.
- [x] FE `/admin/dashboard`, `/pengurus/dashboard`, `/siswa/dashboard`; state kosong untuk Siswa yang belum terdaftar ("Anda belum terdaftar di program pendidikan mana pun. Hubungi pengurus").
- [x] Uji manual: angka dashboard cocok dengan isi tabel setelah beberapa transaksi data.

- [x] **Verifikasi tahap 6:** setiap modul M02–M17 lolos uji manual masing-masing dan tidak ada error di terminal/console.

## Tahap 7 — Integrasi Frontend, Backend, dan MySQL (§7, §9)

- [x] Jalankan MySQL + backend + frontend bersamaan dengan data seed bersih.
- [x] **Skenario end-to-end Admin:** login → tambah anggota (akun Siswa otomatis) → tambah program → tambah kurikulum → tambah materi (cek notifikasi) → daftarkan peserta → lihat laporan → ubah profil → logout.
- [x] **Skenario end-to-end Pengurus:** login → pilih program → tambah materi → tambah jadwal → isi absensi → isi evaluasi → ubah profil → logout.
- [x] **Skenario end-to-end Siswa:** login dengan akun yang dibuat Admin → dashboard → buka notifikasi → buka materi (progres naik) → lihat jadwal → riwayat absensi → progres dan evaluasi → ubah profil → logout.
- [x] **Skenario Guest:** buka `/publik` tanpa login; verifikasi tidak ada data pribadi di respons.
- [x] Verifikasi rantai data (§7): data yang diinput Admin/Pengurus muncul benar di tampilan Siswa dan di Laporan Admin.
- [x] Verifikasi setiap daftar dimuat ulang otomatis setelah tambah/ubah/hapus.
- [x] Verifikasi sesi: refresh halaman tetap login; token dihapus saat logout; token kedaluwarsa → kembali ke `/login`.
- [x] Pastikan tidak ada pemanggilan endpoint yang tidak ada di §13 dan tidak ada endpoint tanpa halaman/fungsi jelas.
- [x] **Verifikasi tahap 7:** semua alur aktor berjalan penuh pada MySQL sungguhan tanpa error.

## Tahap 8 — Validasi dan Keamanan (§15, §16)

- [x] Audit route: seluruh endpoint selain `POST /api/auth/login` dan `GET /api/publik/program` memakai `authMiddleware`.
- [x] Audit role: setiap endpoint sesuai tabel §13.15 (token Siswa ke endpoint Admin/Pengurus → 403; token Pengurus ke endpoint Admin → 403; token Admin ke endpoint kelola jadwal/absensi/evaluasi → 403).
- [x] Audit endpoint `/saya` dan `/me`: tidak ada yang menerima ID pengguna dari body/query/param (hanya dari token).
- [x] Audit validasi per modul sesuai tabel §15 (wajib isi, format, enum, unik, tanggal, file).
- [x] Audit semua query: parameterized (tidak ada konkatenasi string dari input).
- [x] Audit respons: field `password` tidak muncul di endpoint mana pun.
- [x] Audit endpoint publik: hanya kolom yang di-whitelist, tidak ada data pribadi.
- [x] Audit upload materi: ekstensi dan ukuran dibatasi, nama file acak, akses file hanya lewat `GET /api/materi/:id/file`.
- [x] Audit penanganan error: pesan Bahasa Indonesia, tanpa stack trace/SQL ke klien; `ER_DUP_ENTRY` dan FK → 409.
- [x] Audit transaksi: tambah anggota (users + anggota), tambah materi (materi + notifikasi), simpan absensi, dan simpan evaluasi ter-rollback saat gagal (simulasikan kegagalan).
- [x] Pastikan `.env` dan `uploads/` tidak masuk repository. — Diatur di `.gitignore` (folder ini belum berupa repository git).
- [x] **Verifikasi tahap 8:** semua audit lolos dan temuan sudah diperbaiki.

## Tahap 9 — Pengujian Setiap Modul (§8, §17)

> Uji fungsional per modul sebelum Black Box formal. Catat hasil di catatan kerja.

- [x] M01 Login/Logout: login sukses, password salah, akun nonaktif, input kosong, rate limit, logout.
- [x] M02 Anggota: tambah, ubah, hapus, cari, validasi, rollback transaksi.
- [x] M03 Program: CRUD, validasi tanggal, hapus berisi data (409).
- [x] M04 Kurikulum: tambah dan ubah per program.
- [x] M05 Materi: CRUD, kategori, upload, notifikasi per Siswa, program tanpa peserta.
- [x] M06 Jadwal: CRUD, data tidak lengkap (400), hak akses Pengurus saja.
- [x] M07 Peserta: daftar, duplikat ditolak, anggota/program tidak ditemukan.
- [x] M08 Absensi: simpan, simpan ulang (upsert), status/peserta tidak valid.
- [x] M09 Evaluasi: simpan, simpan ulang (upsert), pencatat dari token.
- [x] M10 Laporan: filter program, anggota, kombinasi, tanpa filter, tanpa data.
- [x] M11 Akses materi: notifikasi, tandai dibaca, tandai akses, materi program lain ditolak, akses berulang.
- [x] M12–M14 Siswa: jadwal, riwayat absensi, progres + evaluasi; isolasi data antar Siswa.
- [x] M15 Profil: ubah data, ganti password, field terlarang, email ganda.
- [x] M16 Publik: tanpa login, tanpa data pribadi.
- [x] M17 Dashboard: ketiga role, kondisi kosong.
- [x] Perbaiki semua bug yang ditemukan sebelum lanjut.
- [x] **Verifikasi tahap 9:** tidak ada bug terbuka pada uji per modul.

## Tahap 10 — Black Box Testing (§17)

- [x] Siapkan tabel pengujian berisi TC-01 s.d. TC-21 persis seperti Tabel 5 skripsi (ID, Aktor, Fitur, Skenario, Hasil yang diharapkan, Status).
- [x] Reset database ke data seed bersih sebelum pengujian.
- [x] Eksekusi TC-01 s.d. TC-03 (login benar, login salah, logout).
- [x] Eksekusi TC-04 dan TC-05 (anggota baru + akun Siswa; ubah status keanggotaan).
- [x] Eksekusi TC-06 dan TC-07 (program; kurikulum).
- [x] Eksekusi TC-08 (materi + notifikasi Siswa) dan TC-09 (jadwal).
- [x] Eksekusi TC-10 dan TC-11 (daftarkan peserta; pendaftaran ganda ditolak).
- [x] Eksekusi TC-12 dan TC-13 (absensi; evaluasi).
- [x] Eksekusi TC-14 (laporan dengan filter program).
- [x] Eksekusi TC-15 sampai TC-18 (akses materi, jadwal, riwayat absensi, progres + evaluasi).
- [x] Eksekusi TC-19 dan TC-20 (profil; informasi publik Guest).
- [x] Eksekusi TC-21 (Siswa membuka Kelola Data Anggota → akses ditolak).
- [x] Isi kolom Status: **Berhasil** atau **Gagal** untuk setiap TC, dengan bukti (tangkapan layar atau catatan).
- [x] *(Opsional, bila disetujui)* Eksekusi skenario tambahan TC-A1 s.d. TC-A10 (§17) dan tambahkan ke tabel pengujian. — Dieksekusi dan dicatat terpisah di `docs/PENGUJIAN.md`; belum dimasukkan ke Tabel 5 skripsi sampai disetujui.
- [x] Untuk setiap TC berstatus Gagal: catat penyebab, perbaiki, lalu tandai untuk diuji ulang di Tahap 11.
- [ ] Ajak pengurus MAPALA (pengguna sistem) ikut mencoba skenario, sesuai rencana pengujian bersama pengguna. — **Belum: butuh kehadiran pengurus MAPALA; tidak dapat dilakukan oleh pengembang sendiri.**
- [x] **Verifikasi tahap 10:** tabel Black Box terisi lengkap dengan bukti.

## Tahap 11 — Regression Testing (§17)

> Mengulang skenario Black Box yang sama setelah perbaikan atau perubahan. Bukan metode pengujian baru.

- [x] Setelah setiap perbaikan bug dari Tahap 9–10, jalankan ulang TC yang terkait dan TC pada modul tetangga yang berbagi data.
- [x] Setelah semua perbaikan selesai, jalankan ulang **seluruh** TC-01 s.d. TC-21 dari data seed bersih.
- [ ] Setelah perubahan hasil tinjauan pengurus (iterasi RAD), jalankan ulang TC pada fitur yang berubah. — **Belum: tinjauan pengurus belum ada. Jalankan `npm test` + tabel di `docs/PENGUJIAN.md` setelah ada perubahan.**
- [x] Verifikasi ulang kontrol akses: TC-21 dan audit role (Tahap 8) setelah tiap perubahan route/middleware.
- [x] Perbarui kolom Status pada tabel Black Box dengan hasil akhir.
- [x] **Verifikasi tahap 11:** seluruh TC berstatus Berhasil, atau kegagalan yang tersisa tercatat dengan alasan.

## Tahap 12 — Finalisasi dan Dokumentasi Aplikasi

- [x] Review akhir: bandingkan aplikasi dengan §4 (hak akses), §6 (fitur per aktor), §11 (struktur tabel), dan §13 (endpoint). Pastikan tidak ada fitur, tabel, atau endpoint di luar dokumen.
- [x] Pastikan penamaan role konsisten di UI, kode, seed, dan pesan (`admin`, `pengurus`, `siswa`, Guest).
- [ ] Bersihkan kode: hapus kode debug, `console.log` sisa, dan file tak terpakai. — **Sebagian: tidak ada kode debug/`console.log` sisa (log hanya di `server.js` dan `errorHandler`). Kode versi lama dipindah ke `_legacy_v1/` (di-.gitignore) karena penghapusan otomatis ditolak; hapus folder itu secara manual.**
- [x] Pastikan `backend/.env.example` lengkap dan `.env` tidak ter-commit.
- [x] Buat build produksi frontend (`npm run build`) tanpa error.
- [x] Tulis `README.md` aplikasi: prasyarat (Node.js, MySQL lokal, **tanpa Docker**), langkah instalasi, konfigurasi `.env`, cara menjalankan `schema.sql` dan `seed.sql`, menjalankan backend dan frontend, akun awal Admin/Pengurus.
- [x] Dokumentasikan petunjuk penggunaan singkat per aktor (Admin, Pengurus, Siswa, Guest) berdasarkan alur §8.
- [x] Dokumentasikan daftar endpoint final (rujukan §13) dan struktur database final.
- [x] Siapkan ringkasan hasil Black Box Testing (tabel Status final) untuk bab Hasil dan Pembahasan skripsi.
- [ ] Tandai butir K-xx (§19) yang sudah diputuskan oleh pengguna/dosen dan perbarui `implementation.md` bila ada keputusan. — **Belum: belum ada keputusan pengguna/dosen; implementasi memakai asumsi kerja §19. Penyesuaian teknis dicatat di §20.**
- [ ] Serah terima ke pengurus MAPALA: demo seluruh alur dan kumpulkan masukan akhir. — **Belum: butuh kehadiran pengurus MAPALA.**
- [ ] **Verifikasi tahap 12:** aplikasi dapat dipasang ulang dari nol hanya dengan README, dan seluruh checklist di atas bertanda `[x]`. — **Belum penuh: instalasi dari README sudah dijalankan (MySQL lokal, `db:reset`, backend, frontend); 4 butir di atas menunggu pengguna/dosen.**
