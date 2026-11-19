# IMPLEMENTATION — Sistem Pendidikan MAPALA Eden Club UNAI (Berbasis Web, Metode RAD)

> **Sumber acuan utama:** skripsi `2381052_JeheskielKaja_Revisi_SP.docx` (teks, Tabel 3 & 4, Use Case Diagram, 16 Sequence Diagram, Class Diagram, wireframe, Tabel 5 Black Box).
> Dokumen ini menggantikan `implementation.md` versi lama. Jika ada perbedaan dengan dokumentasi lama, **skripsi yang diikuti**.
> Dokumen ini hanya spesifikasi. Belum ada kode, database, atau SQL yang dibuat.

**Legenda penanda sumber**

| Tanda | Arti |
|---|---|
| **[S]** | Tertulis/tergambar di skripsi (teks, tabel, diagram, wireframe). |
| **[T]** | Rancangan teknis usulan untuk keperluan implementasi. **Bukan** fakta dari skripsi. |
| **[?]** | Belum jelas atau bertentangan di skripsi. Lihat Bagian 19 (Catatan yang Perlu Dikonfirmasi). |

---

## 1. Deskripsi dan Tujuan Sistem

**Deskripsi [S].** Sistem informasi pendidikan berbasis web untuk MAPALA Eden Club Universitas Advent Indonesia. Sistem mengelola proses pendidikan anggota secara terpusat: data anggota beserta tahapan keanggotaan, program pendidikan dan kurikulum, materi per kategori, jadwal kegiatan, peserta program, absensi, evaluasi hasil penilaian lapangan, dan pemantauan progres akses materi.

**Latar belakang masalah [S].**
- Pengelolaan pendidikan masih konvensional dan terfragmentasi. Absensi dan evaluasi dicatat sekretaris, sedangkan jadwal dan materi diwariskan lewat musyawarah besar.
- Data pernah hilang: materi satu tahun, daftar anggota, template surat, template laporan, dan dokumentasi kegiatan.
- Kondisi organisasi: 13 anggota aktif, dua program wajib per tahun (Inagurasi/pendidikan dasar dan Diklatsar), serta sekitar tiga program tambahan per semester (arung jeram, panjat tebing, dll.).

**Tujuan [S].** Menyimpan data pendidikan secara terpusat sehingga tidak bergantung pada pergantian pengurus. Sistem juga mendukung pengelolaan proses pendidikan, pemantauan perkembangan, dan penyimpanan rekam jejak pendidikan anggota.

**Batasan fungsi evaluasi [S].** Evaluasi berupa **catatan hasil penilaian lapangan** oleh Pengurus (`hasil_penilaian` bertipe teks dan `catatan`). Skripsi **tidak** mendefinisikan nilai angka, status lulus/tidak lulus, ataupun tabel rekap kelulusan. Jangan menambahkannya.

**Metode pengembangan [S].** RAD dengan 4 tahap:
1. Perencanaan kebutuhan.
2. Perancangan pengguna (UML dan wireframe).
3. Konstruksi, bertahap sesuai prioritas Tabel 3: Tinggi, lalu Sedang, lalu Rendah. Hasil tiap tahap ditinjau bersama pengurus dan bisa kembali ke tahap perancangan.
4. Implementasi (pengujian Black Box).

---

## 2. Teknologi yang Digunakan

| Layer | Teknologi | Sumber |
|---|---|---|
| Front-end | React.js + Vite, React Router, Axios | [S] React JS; Vite, Router, Axios [T] |
| Back-end | Node.js + Express.js (REST API) | [S] |
| Database | MySQL (driver `mysql2`, query terparameter) | [S] MySQL; `mysql2` [T] |
| Autentikasi | JWT berisi `id_user` dan `role` | [S] token sesi berisi id dan peran |
| Hash password | bcrypt | [T] |
| Upload file materi | `multer` (penyimpanan lokal folder `uploads/`) | [T] (kolom `file_path` ada di [S]) |
| Styling | Tailwind CSS, komponen sederhana (tabel, form) | [T] |
| Keamanan tambahan | `helmet`, `cors` terbatas, `express-rate-limit` pada login | [T] |
| Konfigurasi | `dotenv` (`.env`, tidak di-commit) | [T] |

**Ketentuan yang berlaku:**
- **Tidak menggunakan Docker.** MySQL dijalankan lokal (terinstal langsung). Ketentuan Docker pada `todo.md` lama dihapus.
- Pengujian hanya **Black Box Testing**. Tidak ada SUS.
- Diagram rancangan hanya Use Case, Sequence, dan Class.

---

## 3. Arsitektur Sistem

Arsitektur client-server tiga lapis:

```
[Browser: React SPA (Vite)]
        │  Axios, HTTP/JSON, header Authorization: Bearer <token>
        ▼
[Express.js REST API]
   routes → authMiddleware (verifikasi token) → roleMiddleware(roles[]) → controller → (query)
        │  mysql2 (connection pool)
        ▼
[MySQL]
```

Komponen sesuai partisipan pada Sequence Diagram [S]:
- Halaman React per fitur.
- Middleware Auth dan Role.
- Controller per modul: Auth, Anggota, Program, Kurikulum, Materi, Jadwal, Peserta, Absensi, Evaluasi, Laporan, Progres, Profil, Publik, Notifikasi.
- Database MySQL.

Prinsip implementasi:
- **Seluruh route selain `POST /api/auth/login` dan `GET /api/publik/program` wajib melewati `authMiddleware` dan `roleMiddleware`** [S/T]. Sebagian sequence tidak menggambar partisipan middleware, tetapi teks skripsi menyebutnya, sehingga berlaku untuk semua endpoint terproteksi.
- Identitas pengguna (`id_user`, `role`) selalu diambil dari token, **bukan** dari body/parameter [S: Gambar 14, 15, 17].
- Satu controller bertanggung jawab atas satu modul. Query SQL ditulis di controller atau helper model sederhana.
- Frontend menyimpan token di `localStorage` [T]. Logout hanya menghapus token di frontend [S: Gambar 3].

---

## 4. Aktor dan Hak Akses

### 4.1 Aktor [S]

| Aktor | Login? | Peran |
|---|---|---|
| **Admin** | Ya | Mengelola data inti (anggota, program, kurikulum, peserta), mengelola materi, melihat laporan. Menurut wawancara, peran ini bisa dipegang pembina, ketua umum, atau humas. |
| **Pengurus** | Ya | Mengelola materi, jadwal, absensi, dan evaluasi (tugas yang kini dipegang sekretaris). |
| **Siswa** | Ya | Anggota yang mengikuti program. Mengakses materi dan melihat data pribadinya. |
| **Guest** | Tidak | Hanya melihat informasi umum program tanpa data pribadi anggota. |

**Penamaan role di seluruh sistem (wajib konsisten):**
- Kode: `admin`, `pengurus`, `siswa`. `Guest` bukan role akun.
- Istilah lama **Instruktur** dan **Peserta** (sebagai role) **tidak dipakai**. Kata "peserta" hanya dipakai untuk entitas `PesertaPendidikan` (keikutsertaan Siswa pada program), bukan sebagai role. Lihat [?] K2.

Akun Admin, Pengurus, dan Siswa dibuat oleh Admin. Guest tanpa akun [S].

### 4.2 Matriks Hak Akses [S: Tabel 4]

Kolom "Peserta" pada Tabel 4 dibaca sebagai **Siswa**. Lihat [?] K2.

| Fungsi | Admin | Pengurus | Siswa | Guest |
|---|:-:|:-:|:-:|:-:|
| Login dan logout | ✓ | ✓ | ✓ | - |
| Kelola data anggota | ✓ | - | - | - |
| Kelola program pendidikan | ✓ | - | - | - |
| Kelola kurikulum | ✓ | - | - | - |
| Kelola materi | ✓ | ✓ | - | - |
| Kelola jadwal kegiatan | - | ✓ | - | - |
| Kelola peserta program | ✓ | - | - | - |
| Kelola absensi | - | ✓ | - | - |
| Kelola evaluasi | - | ✓ | - | - |
| Melihat laporan | ✓ | - | - | - |
| Mengakses materi | - | - | ✓ | - |
| Melihat jadwal | - | - | ✓ | - |
| Melihat riwayat absensi | - | - | ✓ | - |
| Melihat progres dan hasil evaluasi | - | - | ✓ | - |
| Mengubah profil | ✓ | ✓ | ✓ | - |
| Melihat informasi publik | ✓ | ✓ | ✓ | ✓ |

**Akses baca pendukung [T].** Admin dan Pengurus perlu *membaca* data agar alur "pilih program" dan dashboard dapat berjalan. Ini bukan tambahan fitur kelola:
- `GET /api/program` dan `GET /api/program/:id` bisa diakses Admin **dan** Pengurus (read-only untuk Pengurus). Pengurus perlu memilih program sebelum membuka menu Materi, Jadwal, Absensi, dan Evaluasi [S: Gambar 8, 10, 11].
- Admin tidak dapat membuat, mengubah, atau menghapus jadwal, absensi, dan evaluasi. Jadwal terdekat hanya tampil read-only di dashboard Admin [S: Gambar 21].

---

## 5. Kebutuhan Fungsional dan Nonfungsional

### 5.1 Kebutuhan Fungsional [S: Tabel 3]

| Kode | Pengguna | Fungsi | Prioritas | Deskripsi |
|---|---|---|---|---|
| F01 | Admin, Pengurus, Siswa | Login dan logout | Tinggi | Masuk menggunakan akun yang dibuat dan keluar dari sistem |
| F02 | Admin | Kelola data anggota | Tinggi | Mencatat data anggota dan tahapan keanggotaan |
| F03 | Admin | Kelola program pendidikan | Tinggi | Mengelola program Inagurasi, Diklatsar, dan program tambahan |
| F04 | Admin | Kelola kurikulum | Sedang | Mengelola kurikulum setiap program |
| F05 | Admin, Pengurus | Kelola materi | Tinggi | Mengarsipkan materi per kategori dan mengirim notifikasi materi baru ke Siswa |
| F06 | Pengurus | Kelola jadwal kegiatan | Tinggi | Membuat dan memperbarui jadwal tiap program |
| F07 | Admin | Kelola peserta program | Tinggi | Mendaftarkan Siswa ke program dan menolak pendaftaran ganda |
| F08 | Pengurus | Kelola absensi | Tinggi | Mencatat kehadiran Siswa pada setiap kegiatan |
| F09 | Pengurus | Kelola evaluasi | Tinggi | Mencatat hasil penilaian lapangan Siswa pada setiap kegiatan |
| F10 | Admin | Melihat laporan | Sedang | Rekap kehadiran, progres materi, dan hasil evaluasi Siswa |
| F11 | Siswa | Mengakses materi | Tinggi | Membuka materi per kategori, menerima notifikasi materi baru, materi yang dibuka tercatat sebagai progres |
| F12 | Siswa | Melihat jadwal | Sedang | Jadwal dari program yang diikuti |
| F13 | Siswa | Melihat riwayat absensi | Sedang | Riwayat kehadiran milik sendiri |
| F14 | Siswa | Melihat progres dan evaluasi | Sedang | Persentase materi yang dibuka dan hasil evaluasi milik sendiri |
| F15 | Admin, Pengurus, Siswa | Mengubah profil | Rendah | Memperbarui data diri milik sendiri |
| F16 | Guest | Melihat informasi publik | Rendah | Informasi umum program tanpa login |

**Pendukung dari wireframe/sequence [S/T]** (bukan baris Tabel 3):
- Dashboard per peran: Gambar 3 (menampilkan dashboard sesuai peran) dan Gambar 21 (wireframe).
- Ganti password: Gambar 25 (wireframe profil).
- Daftar dan tandai notifikasi dibaca: Gambar 13.

### 5.2 Kebutuhan Nonfungsional

SRS lengkap berada di lampiran PDF terpisah yang tidak ada di DOCX. Poin berikut disimpulkan dari skripsi (**[S-turunan]**) atau diusulkan (**[T]**).

| Kode | Kebutuhan | Sumber |
|---|---|---|
| NF01 | Berbasis web, diakses lewat browser | [S] |
| NF02 | Data tersimpan terpusat di MySQL dan tidak hilang saat pergantian pengurus | [S-turunan] |
| NF03 | Kontrol akses berbasis peran sesuai Tabel 4. Siswa hanya melihat data miliknya | [S] |
| NF04 | Informasi publik Guest tidak memuat data pribadi anggota | [S] |
| NF05 | Password disimpan sebagai hash bcrypt. Token JWT diverifikasi di setiap request terproteksi | [T] |
| NF06 | Seluruh input divalidasi di backend. Pesan error jelas untuk pengguna | [S] (sequence jadwal dan profil memvalidasi) / [T] |
| NF07 | Antarmuka sederhana, konsisten, dan responsif untuk layar laptop dan ponsel | [T] |
| NF08 | Pengembangan iteratif (RAD): fungsi prioritas Tinggi dibangun lebih dulu | [S] |
| NF09 | Kredensial dan secret (DB, JWT) berada di `.env`, tidak di kode | [T] |

---

## 6. Daftar Fitur Berdasarkan Aktor

| Aktor | Fitur | Halaman |
|---|---|---|
| **Admin** | Login/logout; Dashboard (anggota, program aktif, jadwal terdekat); Data Anggota; Program Pendidikan; Kurikulum; Materi; Peserta Program; Laporan; Profil; Info Publik | `/admin/*` |
| **Pengurus** | Login/logout; Dashboard; Materi; Jadwal; Absensi; Evaluasi; Profil; Info Publik | `/pengurus/*` |
| **Siswa** | Login/logout; Dashboard (program diikuti, progres modul, kehadiran, jadwal terdekat); Materi/Modul + notifikasi; Jadwal; Riwayat Absensi; Progres & Hasil Evaluasi; Profil; Info Publik | `/siswa/*` |
| **Guest** | Informasi publik program (tanpa login; tautan juga ada di halaman login) | `/publik` |

**Batas fitur lintas aktor (jangan dilanggar):**
- Jadwal, absensi, dan evaluasi **hanya** Pengurus yang boleh membuat/mengubah/menghapus.
- Kelola anggota, program, kurikulum, dan peserta **hanya** Admin.
- Laporan **hanya** Admin.
- Materi dikelola Admin dan Pengurus. Siswa hanya membaca.
- Siswa tidak memiliki akses ke endpoint kelola maupun laporan (uji TC-21).

---

## 7. Alur Aplikasi Secara Keseluruhan

```
Guest ──────────────► /publik ──► GET /api/publik/program ──► tampil info program (tanpa data pribadi)

Pengguna terdaftar:
 /login ─► POST /api/auth/login ─┬─ sesuai ──► token (id_user, role) disimpan ─► dashboard sesuai role
                                 └─ salah  ──► pesan "login gagal"

 Admin    : Anggota → Program → (Kelola) Kurikulum / Materi / Peserta → Laporan → Profil
 Pengurus : Pilih Program → Materi / Jadwal → Pilih Jadwal → Absensi & Evaluasi → Profil
 Siswa    : Dashboard → Materi (buka → tercatat progres) → Jadwal → Riwayat Absensi → Progres & Evaluasi → Profil

 Logout ─► token dihapus di frontend ─► kembali ke /login
```

**Rantai ketergantungan data (urutan alami penggunaan):**
1. Admin membuat **Program** lalu **Kurikulum**.
2. Admin menambah **Anggota**. Sistem otomatis membuat akun **Siswa**.
3. Admin mendaftarkan Siswa ke program, sehingga terbentuk **PesertaPendidikan**.
4. Admin atau Pengurus menambah **Materi**. Sistem membuat **Notifikasi** untuk setiap Siswa program itu.
5. Pengurus membuat **Jadwal**, lalu mencatat **Absensi** dan **Evaluasi** per jadwal.
6. Siswa membuka materi, sehingga terbentuk **ProgresMateri**.
7. Admin melihat **Laporan** (agregasi absensi, progres, evaluasi).

---

## 8. Alur Detail Setiap Modul

Template tiap modul: Aktor, Kondisi awal, Halaman, Interaksi, Proses sistem (FE/BE), Proses database, Validasi, Respons, Hasil akhir, Kondisi alternatif.

**Aturan umum berlaku di semua modul terproteksi** (tidak diulang di tiap modul):
- Tanpa token atau token tidak valid/kedaluwarsa → **401**. FE menghapus token dan mengarahkan ke `/login`.
- Role tidak diizinkan → **403** dengan pesan "Anda tidak memiliki hak akses". FE menampilkan halaman/pesan akses ditolak.
- ID tidak ditemukan → **404**.
- Kegagalan server/database → **500** dengan pesan umum ("Terjadi kesalahan, coba lagi"). Detail error hanya di log server.
- Operasi multi-tabel dijalankan dalam **transaksi** dan di-rollback jika salah satu langkah gagal [T].
- Setelah operasi tambah/ubah/hapus berhasil, FE memuat ulang daftar dan menampilkan data terbaru [S].

---

### M01. Login dan Logout (F01) [S: Gambar 3, 20]

- **Aktor:** Admin, Pengurus, Siswa.
- **Kondisi awal:** Akun sudah dibuat oleh Admin. Pengguna belum punya token aktif.
- **Halaman:** `/login`. Berisi field Email dan Password, tombol Masuk, dan tautan "Lihat informasi program (tanpa login)".
- **Interaksi:**
  1. Pengguna mengisi email dan password, lalu menekan Masuk.
  2. Untuk logout: tombol Logout di navbar.
- **Proses sistem:**
  - FE mengirim `POST /api/auth/login {email, password}`.
  - BE (Controller Auth) mengambil akun berdasarkan email. Jika ada, BE membandingkan password dengan hash (bcrypt).
  - Bila sesuai, BE membuat JWT berisi `id_user` dan `role`, lalu merespons `{token, role, user}`.
  - FE menyimpan token dan mengarahkan ke dashboard sesuai role (`/admin/dashboard`, `/pengurus/dashboard`, `/siswa/dashboard`).
  - **Logout:** FE menghapus token dan menampilkan halaman login. Tidak ada panggilan API [S].
- **Proses database:** `SELECT` pada `users` berdasarkan `email` (kolom `password`, `role`, `status`). Tidak ada tulis.
- **Validasi:**
  - Email dan password wajib diisi (400 bila kosong) [T].
  - Email ditemukan dan password cocok.
  - `users.status` = `aktif` [T]. Akun `nonaktif` ditolak (403, "Akun tidak aktif").
- **Respons:**
  - Berhasil: 200 `{token, role}`, lalu dashboard sesuai peran.
  - Gagal: 401 "Email atau password salah" (pesan sama untuk email tidak ada dan password salah, agar tidak membocorkan akun).
- **Hasil akhir:** Sesi aktif dengan token. Setelah logout tidak ada token dan halaman terproteksi tidak bisa dibuka.
- **Alternatif:** data tidak lengkap (400); email tidak terdaftar (401 sama dengan password salah); akun nonaktif (403); terlalu banyak percobaan (429) [T]; DB gagal (500).

---

### M02. Kelola Data Anggota (F02) [S: Gambar 4, 22]

- **Aktor:** Admin saja.
- **Kondisi awal:** Admin sudah login.
- **Halaman:** `/admin/anggota`. Berisi tabel Data Anggota (Nama, NIM, Jurusan/Angkatan, Kontak, Keanggotaan, Akun, Aksi), kotak cari (nama/email/NIM), tombol "Tambah anggota", dan aksi Edit/Hapus.
- **Interaksi:**
  1. Admin membuka Data Anggota. Daftar tampil.
  2. **Tambah:** mengisi form (nama, email, NIM, jurusan, angkatan, kontak, status keanggotaan) lalu Simpan.
  3. **Ubah:** mengedit data atau status tahapan keanggotaan lalu Simpan.
  4. **Hapus:** mengonfirmasi penghapusan.
- **Proses sistem:**
  - Daftar: `GET /api/anggota[?q=]`. BE meminta daftar anggota.
  - Tambah: `POST /api/anggota`. BE memeriksa kelengkapan data, lalu membuat akun login Siswa dan data anggota dalam satu transaksi. Detail:
    1. Hash password awal dengan bcrypt.
    2. `INSERT users` dengan `role='siswa'`.
    3. `INSERT anggota` dengan `id_user` baru.
  - Ubah: `PUT /api/anggota/:id`.
  - Hapus: `DELETE /api/anggota/:id`.
  - Setelah sukses, FE memuat ulang daftar.
- **Proses database:** `SELECT anggota JOIN users`; `INSERT users` + `INSERT anggota` (transaksi); `UPDATE anggota` (dan `users` untuk nama/email/no_hp/status akun); `DELETE anggota` (dan `users` miliknya) [T].
- **Validasi:**
  - Wajib: nama, email, status keanggotaan (nilai valid dari 7 tahap). Format email valid.
  - Email unik pada `users`; NIM unik bila diisi [T].
  - Hanya `role=admin`.
  - Pada hapus: anggota yang sudah memiliki data turunan (peserta program) ditolak (lihat alternatif) [T/?].
- **Respons:** sukses 201 (tambah) atau 200 (ubah/hapus) dengan "Status berhasil". Gagal menampilkan pesan per kasus.
- **Hasil akhir:** Anggota baru tercatat dan otomatis punya akun login Siswa yang dapat dipakai masuk. Perubahan status keanggotaan tersimpan.
- **Alternatif:**
  - Data tidak lengkap/format salah → 400 dan pesan per field.
  - Email atau NIM sudah dipakai → 409.
  - Anggota tidak ditemukan (ubah/hapus) → 404.
  - Role bukan Admin → 403 (TC-21).
  - Transaksi gagal di tengah → rollback. Tidak ada user yatim atau anggota tanpa akun, lalu 500.
  - Anggota sudah punya data peserta → hapus ditolak 409 "Anggota memiliki data pendidikan" [T]. Lihat K9.

---

### M03. Kelola Program Pendidikan (F03) [S: Gambar 5, 23]

- **Aktor:** Admin (tulis). Pengurus hanya membaca daftar program [T].
- **Kondisi awal:** Login.
- **Halaman:** `/admin/program`. Berisi tabel program, tombol "Tambah program", dan tombol **Kelola** per program yang menuju Kurikulum, Materi, dan Peserta (lihat [?] K5 soal Jadwal).
- **Interaksi:** Admin membuka Program Pendidikan, lalu menambah, mengubah, atau menghapus program (Inagurasi, Diklatsar, program tambahan). Field: nama program, jenis, deskripsi, tanggal mulai, tanggal selesai.
- **Proses sistem:**
  - `GET /api/program` untuk daftar.
  - `POST /api/program` untuk tambah.
  - `PUT /api/program/:id` untuk ubah.
  - `DELETE /api/program/:id` untuk hapus.
  - FE memuat ulang daftar.
- **Proses database:** `SELECT/INSERT/UPDATE/DELETE program_pendidikan`.
- **Validasi:**
  - `nama_program` wajib; `jenis` wajib dan valid; format tanggal valid; `tanggal_selesai` ≥ `tanggal_mulai` [T].
  - Hanya Admin untuk tulis.
  - Hapus ditolak bila program masih memiliki kurikulum, materi, jadwal, atau peserta [T/?].
- **Respons:** "Status berhasil" atau pesan kesalahan.
- **Hasil akhir:** Program tampil pada daftar program (TC-06).
- **Alternatif:** data tidak lengkap (400); program tidak ditemukan (404); bukan Admin (403); program masih memiliki data turunan (409) [T]; penyimpanan gagal (500).

---

### M04. Kelola Kurikulum (F04) [S: Gambar 6]

- **Aktor:** Admin.
- **Kondisi awal:** Login. Program sudah ada.
- **Halaman:** `/admin/program/:id/kurikulum`.
- **Interaksi:**
  1. Admin memilih program lalu membuka menu Kurikulum. Kurikulum program tampil.
  2. **Tambah:** mengisi tahun, deskripsi, dan status lalu Simpan.
  3. **Ubah:** mengubah data atau status kurikulum.
  - Tidak ada hapus kurikulum pada rancangan [S].
- **Proses sistem:**
  - `GET /api/kurikulum?id_program=`. Middleware memverifikasi token dan role, lalu mengembalikan kurikulum program.
  - `POST /api/kurikulum` dan `PUT /api/kurikulum/:id`.
- **Proses database:** `SELECT kurikulum WHERE id_program`; `INSERT kurikulum`; `UPDATE kurikulum`.
- **Validasi:** `id_program` ada; tahun dan status wajib; status termasuk nilai enum yang ditetapkan [T]; hanya Admin.
- **Respons:** daftar kurikulum terbaru atau pesan kesalahan.
- **Hasil akhir:** Kurikulum tersimpan pada program terpilih (TC-07).
- **Alternatif:** program tidak ada (404); data tidak lengkap (400); bukan Admin (403); gagal simpan (500).

---

### M05. Kelola Materi (F05) [S: Gambar 7]

- **Aktor:** Admin dan Pengurus.
- **Kondisi awal:** Login. Program sudah ada. Siswa yang terdaftar di program menerima notifikasi bila materi baru ditambahkan.
- **Halaman:** `/admin/program/:id/materi` dan `/pengurus/program/:id/materi` (komponen yang sama).
- **Interaksi:**
  1. Pengguna membuka menu Materi pada program. Materi tampil **dikelompokkan per kategori**.
  2. **Tambah:** mengisi judul, kategori, deskripsi, dan unggah file lalu Simpan.
  3. **Ubah:** mengedit data materi.
  4. **Hapus:** mengonfirmasi penghapusan.
- **Proses sistem:**
  - Daftar: `GET /api/materi?id_program=`.
  - Tambah: `POST /api/materi` (multipart bila ada file) [T]. BE menjalankan, dalam transaksi:
    1. `INSERT materi`.
    2. Mengambil daftar Siswa pada program (dari `peserta_pendidikan`).
    3. `INSERT notifikasi` (materi baru) untuk tiap Siswa.
  - Ubah: `PUT /api/materi/:id`.
  - Hapus: `DELETE /api/materi/:id`.
  - FE menampilkan daftar materi terbaru.
- **Proses database:** `SELECT materi`; `INSERT materi`; `SELECT peserta_pendidikan JOIN anggota` (daftar `id_user` Siswa program); `INSERT notifikasi` (satu baris per Siswa: `id_user`, `id_materi`, `pesan`, `status_baca=false`); `UPDATE materi`; `DELETE materi` (progres dan notifikasi turunan ikut terhapus, [T]).
- **Validasi:** judul dan kategori wajib; `id_program` valid; file bertipe dan berukuran yang diizinkan bila diunggah [T]; role admin atau pengurus.
- **Respons:** "Status berhasil", lalu daftar materi diperbarui.
- **Hasil akhir:** Materi tersimpan (`tanggal_upload` terisi otomatis) dan setiap Siswa program memiliki notifikasi materi baru (TC-08).
- **Alternatif:**
  - Data tidak lengkap (400).
  - File tidak valid atau terlalu besar (400/413) [T].
  - Program tidak ditemukan (404).
  - Role Siswa/Guest (403).
  - **Program belum punya Siswa** → materi tetap tersimpan, notifikasi 0 baris (bukan error) [T].
  - Gagal simpan → rollback materi dan notifikasi, lalu 500.

---

### M06. Kelola Jadwal Kegiatan (F06) [S: Gambar 8]

- **Aktor:** Pengurus saja.
- **Kondisi awal:** Login. Program ada.
- **Halaman:** `/pengurus/program/:id/jadwal`.
- **Interaksi:**
  1. Pengurus membuka menu Jadwal program. Daftar jadwal tampil.
  2. **Tambah:** mengisi tanggal, waktu, lokasi, kegiatan lalu Simpan.
  3. **Ubah/Hapus:** mengedit atau mengonfirmasi hapus.
- **Proses sistem:**
  - `GET /api/jadwal?id_program=`.
  - `POST /api/jadwal`. BE memeriksa kelengkapan data: lengkap → insert dan balas 201; tidak lengkap → 400 tanpa menyimpan.
  - `PUT /api/jadwal/:id` dan `DELETE /api/jadwal/:id` (200).
  - FE menampilkan daftar jadwal terbaru, terurut tanggal.
- **Proses database:** `SELECT jadwal WHERE id_program ORDER BY tanggal, waktu`; `INSERT/UPDATE/DELETE jadwal`.
- **Validasi:** `id_program` valid; tanggal, waktu, lokasi, kegiatan wajib dan format benar [T]; hanya Pengurus (Admin ditolak, sesuai Tabel 4).
- **Respons:** 201 berhasil (tambah); 200 berhasil (ubah/hapus); 400 gagal validasi.
- **Hasil akhir:** Jadwal tampil pada daftar jadwal (TC-09) dan tersedia untuk absensi, evaluasi, dan tampilan Siswa.
- **Alternatif:** data tidak lengkap (400); jadwal tidak ditemukan (404); role bukan Pengurus (403); hapus jadwal yang sudah punya absensi/evaluasi → 409 [T]; gagal simpan (500).

---

### M07. Kelola Peserta Program (F07) [S: Gambar 9]

- **Aktor:** Admin.
- **Kondisi awal:** Login. Program dan Anggota (Siswa) sudah ada.
- **Halaman:** `/admin/program/:id/peserta`.
- **Interaksi:**
  1. Admin memilih program lalu membuka menu Peserta. Daftar peserta program tampil.
  2. Admin memilih Siswa (anggota) lalu menekan **Daftarkan**.
- **Proses sistem:**
  - `GET /api/peserta?id_program=`.
  - `POST /api/peserta {id_anggota, id_program}`. BE memeriksa dulu apakah kombinasi anggota dan program sudah ada (`cekPendaftaranGanda`):
    - **sudah terdaftar** → tolak, FE menampilkan pesan "Siswa sudah terdaftar";
    - **belum** → `INSERT`, FE menampilkan daftar peserta terbaru.
- **Proses database:** `SELECT peserta_pendidikan JOIN anggota, users WHERE id_program`; cek duplikat `SELECT ... WHERE id_anggota AND id_program`; `INSERT peserta_pendidikan` (`tanggal_daftar`=hari ini, `status` default) [T].
- **Validasi:** `id_anggota` dan `id_program` ada; **tidak boleh pendaftaran ganda** (didukung unique key) [S]; hanya Admin.
- **Respons:** 201 berhasil; **409** pendaftaran ditolak dengan pesan.
- **Hasil akhir:** Siswa tersimpan sebagai peserta program (TC-10). Duplikat ditolak (TC-11). Siswa kini melihat jadwal dan materi program tersebut.
- **Alternatif:** anggota atau program tidak ditemukan (404); data tidak lengkap (400); bukan Admin (403); race condition dua pendaftaran bersamaan dicegah oleh unique key (409); gagal simpan (500).
- **Catatan:** Skripsi tidak menyediakan pembatalan/penghapusan peserta, sehingga tidak diimplementasikan. Lihat K11.

---

### M08. Kelola Absensi (F08) [S: Gambar 10, 28]

- **Aktor:** Pengurus saja.
- **Kondisi awal:** Login. Program punya jadwal dan peserta.
- **Halaman:** `/pengurus/program/:id/absensi`.
- **Interaksi:**
  1. Pengurus memilih program lalu membuka menu Absensi. Daftar kegiatan (jadwal) tampil.
  2. Pengurus memilih satu jadwal. Form absensi muncul.
  3. **Untuk setiap Siswa:** memilih status hadir/izin/sakit/alpa dan mengisi keterangan.
  4. Menekan Simpan.
- **Proses sistem:**
  - `GET /api/jadwal?id_program=` untuk daftar kegiatan.
  - `GET /api/absensi?id_jadwal=` untuk daftar peserta program beserta absensi yang sudah ada (LEFT JOIN).
  - `POST /api/absensi {id_jadwal, data:[{id_peserta, status, keterangan}]}`.
  - BE (dalam transaksi): bila absensi kegiatan **belum pernah diisi** → `INSERT`; bila **sudah ada** → `UPDATE`. Dapat diterapkan per baris dengan upsert.
  - Setelah simpan, FE menampilkan rekap kehadiran kegiatan.
- **Proses database:** `SELECT jadwal`; `SELECT peserta_pendidikan LEFT JOIN absensi`; `INSERT/UPDATE absensi` (unique `id_peserta`+`id_jadwal`).
- **Validasi:**
  - `id_jadwal` ada.
  - Setiap `id_peserta` benar-benar peserta program milik jadwal itu.
  - `status` ∈ {hadir, izin, sakit, alpa}.
  - Hanya Pengurus.
  - Semua Siswa dalam daftar harus diberi status [T].
- **Respons:** berhasil (rekap kehadiran) atau pesan kesalahan.
- **Hasil akhir:** Absensi tersimpan sesuai kegiatan (TC-12). Pengisian ulang mengubah data yang sama, bukan menggandakannya.
- **Alternatif:** jadwal tidak ditemukan (404); status tidak valid / peserta tidak sesuai (400); bukan Pengurus (403); program belum punya peserta (form kosong, tombol Simpan dinonaktifkan) [T]; gagal simpan → rollback (500).

---

### M09. Kelola Evaluasi (F09) [S: Gambar 11]

- **Aktor:** Pengurus saja.
- **Kondisi awal:** Login. Jadwal (kegiatan) dan peserta ada.
- **Halaman:** `/pengurus/program/:id/evaluasi`.
- **Interaksi:**
  1. Pengurus memilih program atau membuka menu Evaluasi. Daftar kegiatan tampil.
  2. Pengurus memilih kegiatan yang dievaluasi. Form evaluasi tampil beserta hasil yang sudah ada.
  3. **Untuk setiap Siswa:** mengisi hasil penilaian lapangan dan catatan.
  4. Menekan Simpan.
- **Proses sistem:**
  - `GET /api/jadwal?id_program=`; `GET /api/evaluasi?id_jadwal=`.
  - `POST /api/evaluasi {id_jadwal, data:[{id_peserta, hasil_penilaian, catatan}]}`. BE melakukan **INSERT atau UPDATE** (upsert) dan mengisi `id_pencatat` dari token. FE menampilkan rekap hasil evaluasi kegiatan.
- **Proses database:** `SELECT jadwal`; `SELECT peserta_pendidikan LEFT JOIN evaluasi`; `INSERT/UPDATE evaluasi` (unique `id_peserta`+`id_jadwal`; `id_pencatat` = `id_user` Pengurus; `tanggal_evaluasi` = hari ini [T]).
- **Validasi:**
  - `id_jadwal` ada; setiap `id_peserta` adalah peserta program jadwal itu.
  - `hasil_penilaian` wajib untuk baris yang diisi; `catatan` opsional.
  - Hanya Pengurus.
- **Respons:** berhasil atau pesan kesalahan.
- **Hasil akhir:** Hasil evaluasi tersimpan (TC-13). Admin melihatnya di Laporan, Siswa di halaman Progres.
- **Alternatif:** jadwal tidak ditemukan (404); data tidak valid (400); bukan Pengurus (403); gagal simpan (500).
- **Catatan:** Tidak ada nilai angka, tidak ada status kelulusan, tidak ada tabel rekap. Lihat K3.

---

### M10. Melihat Laporan (F10) [S: Gambar 12, 24]

- **Aktor:** Admin saja.
- **Kondisi awal:** Login.
- **Halaman:** `/admin/laporan`. Berisi filter Program, filter Anggota, tombol Reset filter, serta tab "Ringkasan per peserta" dan "Detail absensi". Klik baris menampilkan detail progres per materi [S: wireframe].
- **Interaksi:** Admin membuka menu Laporan dan memilih filter program dan/atau anggota.
- **Proses sistem:**
  - `GET /api/laporan?id_program=&id_anggota=`.
  - BE: verifikasi token dan role, lalu mengambil data **absensi**, **progres materi**, dan **hasil evaluasi** sesuai filter, kemudian menyusun **rekap per Siswa** dan merespons.
- **Proses database:** hanya `SELECT`: `absensi`, `progres_materi`, `materi` (total per program), `evaluasi`, bergabung dengan `peserta_pendidikan`, `anggota`, `users`, `program_pendidikan`, `jadwal`.
- **Validasi:** hanya Admin; filter berupa ID valid (opsional). Tanpa filter menampilkan semua.
- **Respons:** rekap per Siswa berisi jumlah hadir/izin/sakit/alpa, persentase progres, dan daftar hasil evaluasi, ditambah detail absensi dan progres per materi.
- **Hasil akhir:** Rekap kehadiran, progres, dan evaluasi tampil (TC-14).
- **Alternatif:** filter tidak cocok data → tampil "Tidak ada data peserta untuk filter ini"; bukan Admin (403); gagal ambil data (500).
- **Catatan:** Teks Gambar 24 hanya menyebut kehadiran dan progres, sedangkan Gambar 12/Tabel 3 menyertakan evaluasi. Dokumen ini menyertakan evaluasi. Lihat K3.

---

### M11. Mengakses Materi dan Notifikasi (F11) [S: Gambar 13, 26]

- **Aktor:** Siswa saja.
- **Kondisi awal:** Login. Siswa terdaftar pada ≥ 1 program (bila belum: tampil "Anda belum terdaftar di program pendidikan mana pun. Hubungi pengurus").
- **Halaman:** `/siswa/materi` (daftar materi per kategori) dan ikon notifikasi pada navbar.
- **Interaksi:**
  1. *(Opsional)* Siswa membuka notifikasi materi baru.
  2. Siswa membuka menu Materi. Materi program yang diikuti tampil per kategori.
  3. Siswa memilih salah satu materi.
- **Proses sistem:**
  - Notifikasi: `GET /api/notifikasi` (daftar). Saat dibuka, `PUT /api/notifikasi/:id/dibaca` memperbarui `status_baca`.
  - Daftar: `GET /api/materi/saya` (BE mengambil materi dari program yang diikuti berdasarkan token).
  - Saat materi dipilih, FE memanggil `POST /api/progres/tandai-akses {id_materi}`. BE menyimpan status materi sebagai **sudah diakses**. **Setelah respons berhasil, FE menampilkan isi materi** (urutan sesuai Gambar 13: catat dulu, baru tampilkan).
  - Berkas materi diambil lewat `GET /api/materi/:id/file` yang terproteksi [T].
- **Proses database:** `SELECT notifikasi WHERE id_user`; `UPDATE notifikasi SET status_baca=true`; `SELECT materi JOIN peserta_pendidikan JOIN anggota WHERE anggota.id_user`; upsert `progres_materi` (`status='sudah_diakses'`, `tanggal_akses` = waktu sekarang; **tanggal_akses tidak ditimpa bila sudah ada** [T]).
- **Validasi:**
  - Role Siswa.
  - Materi harus milik program yang diikuti Siswa (jika tidak, 403).
  - Notifikasi yang ditandai dibaca harus milik pengguna itu.
  - `id_peserta` ditentukan dari token melalui `anggota`/`peserta_pendidikan` (bukan dari input).
- **Respons:** isi materi tampil dan tercatat sebagai progres (TC-15).
- **Hasil akhir:** `progres_materi` bertambah/diperbarui. Persentase progres di dashboard dan halaman Progres ikut berubah.
- **Alternatif:** belum terdaftar program (daftar kosong); materi tidak ditemukan (404); materi bukan program Siswa (403); membuka materi berulang tidak menggandakan data (unique key); gagal mencatat progres → isi tidak ditampilkan dan muncul pesan kesalahan; berkas hilang (404).

---

### M12. Melihat Jadwal (F12) [S: Gambar 14, 27]

- **Aktor:** Siswa.
- **Kondisi awal:** Login; terdaftar di program.
- **Halaman:** `/siswa/jadwal`. Memuat dua seksi: **Mendatang** dan **Sudah lewat**.
- **Interaksi:** Siswa membuka menu Jadwal.
- **Proses sistem:** `GET /api/jadwal/saya`. Berdasarkan identitas token, BE mengambil jadwal dari program yang diikuti. FE memisahkan mendatang (tanggal ≥ hari ini) dan sudah lewat.
- **Proses database:** `SELECT jadwal JOIN program_pendidikan JOIN peserta_pendidikan JOIN anggota WHERE anggota.id_user = token`.
- **Validasi:** role Siswa; hanya jadwal program yang diikuti.
- **Respons:** daftar jadwal; atau "Tidak ada jadwal".
- **Hasil akhir:** Jadwal program yang diikuti tampil (TC-16).
- **Alternatif:** belum terdaftar program (daftar kosong dengan pesan); bukan Siswa (403); gagal ambil data (500).

---

### M13. Melihat Riwayat Absensi (F13) [S: Gambar 15, 28]

- **Aktor:** Siswa.
- **Kondisi awal:** Login.
- **Halaman:** `/siswa/absensi`. Berisi kartu rekap Hadir/Izin/Sakit/Alpa dan tabel riwayat.
- **Interaksi:** Siswa membuka menu Riwayat Absensi.
- **Proses sistem:** `GET /api/absensi/saya`. BE mengambil absensi **hanya milik Siswa yang login** (via token), lalu menghitung jumlah hadir, izin, sakit, dan alpa dan merespons.
- **Proses database:** `SELECT absensi JOIN peserta_pendidikan JOIN anggota JOIN jadwal WHERE anggota.id_user = token`.
- **Validasi:** role Siswa; **tidak ada parameter ID dari klien**, sehingga Siswa tidak bisa mengintip data Siswa lain.
- **Respons:** rekap dan riwayat; atau "Belum ada riwayat absensi".
- **Hasil akhir:** Riwayat kehadiran milik Siswa tampil (TC-17).
- **Alternatif:** belum ada absensi (kosong); bukan Siswa (403); gagal (500).

---

### M14. Melihat Progres dan Hasil Evaluasi (F14) [S: Gambar 16, 29]

- **Aktor:** Siswa.
- **Kondisi awal:** Login.
- **Halaman:** `/siswa/progres`.
- **Interaksi:** Siswa membuka menu Progres.
- **Proses sistem:**
  - `GET /api/progres/saya`. BE mengambil progres materi milik Siswa, menghitung total materi program yang diikuti, dan mengambil hasil evaluasi milik Siswa.
  - BE menghitung **persentase = (materi berstatus sudah_diakses ÷ total materi program) × 100** per program. Persentase **tidak disimpan** sebagai tabel rekap.
  - FE menampilkan persentase progres modul dan hasil evaluasi.
- **Proses database:** `SELECT progres_materi` milik Siswa; `COUNT materi` per program; `SELECT evaluasi JOIN jadwal` milik Siswa.
- **Validasi:** role Siswa; data hanya milik token. Total materi 0 → persentase 0 (hindari pembagian nol) [T].
- **Respons:** `{ per program: {total_materi, diakses, persen, daftar materi+status}, evaluasi:[...] }`.
- **Hasil akhir:** Persentase progres dan hasil evaluasi tampil (TC-18).
- **Alternatif:** belum ada evaluasi → "Belum ada hasil evaluasi"; program tanpa materi → 0%; bukan Siswa (403); gagal (500).

---

### M15. Mengubah Profil (F15) [S: Gambar 17, 25]

- **Aktor:** Admin, Pengurus, Siswa (hanya data diri sendiri).
- **Kondisi awal:** Login.
- **Halaman:** `/{admin|pengurus|siswa}/profil`. Berisi Data diri (nama, email, no. HP), info Akun (peran, status), dan blok Ganti password (password lama, baru, konfirmasi).
- **Interaksi:** Pengguna membuka menu Profil, mengubah data diri, lalu menekan Simpan. Untuk ganti password, mengisi tiga field lalu menekan Ganti password.
- **Proses sistem:**
  - `GET /api/profil/me`: BE mengambil data akun milik pengguna yang login, lalu FE menampilkan form profil.
  - `PUT /api/profil/me`: BE memeriksa data. **Valid** → `UPDATE` dan tampilkan profil terbaru; **tidak valid** → pesan kesalahan.
  - `PUT /api/profil/me/password` [T] untuk ganti password: verifikasi password lama (bcrypt), validasi password baru, simpan hash baru.
  - `id_user` **selalu dari token**, bukan dari body/parameter.
- **Proses database:** `SELECT users WHERE id_user=token`; `UPDATE users` (nama, email, no_hp) dan, untuk ganti password, `UPDATE users SET password`.
- **Validasi:**
  - Nama dan email wajib; format email valid; email unik (kecuali milik sendiri).
  - Field `role`, `status`, `id_user`, `nim`, dan `status_keanggotaan` **tidak dapat diubah** dari endpoint ini [T].
  - Password baru minimal 8 karakter dan konfirmasi harus sama [T].
- **Respons:** profil terbaru, atau pesan kesalahan ("Data tidak valid").
- **Hasil akhir:** Perubahan profil tersimpan untuk akun yang login (TC-19).
- **Alternatif:** data tidak valid (400); email sudah dipakai (409); password lama salah (400/401) [T]; token tidak valid (401); gagal simpan (500).

---

### M16. Melihat Informasi Publik (F16) [S: Gambar 18]

- **Aktor:** Guest (juga dapat diakses pengguna yang login).
- **Kondisi awal:** Tidak perlu login.
- **Halaman:** `/publik`. Dapat dibuka langsung atau lewat tautan di halaman login.
- **Interaksi:** Guest membuka website.
- **Proses sistem:** FE memanggil `GET /api/publik/program` (tanpa token). BE mengambil informasi umum program dan merespons **tanpa data pribadi**.
- **Proses database:** `SELECT` kolom publik dari `program_pendidikan` (nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai). **Tidak** join ke `users`, `anggota`, dan tabel personal lainnya.
- **Validasi:** endpoint tanpa autentikasi; whitelist kolom di query.
- **Respons:** daftar informasi program; atau "Belum ada program".
- **Hasil akhir:** Informasi program tampil tanpa data pribadi (TC-20).
- **Alternatif:** tidak ada program (pesan kosong); gagal ambil data (500).

---

### M17. Dashboard per Peran [S: Gambar 3, 21] / data endpoint [T]

- **Aktor:** Admin, Pengurus, Siswa.
- **Kondisi awal:** Baru login, atau membuka `/dashboard`.
- **Halaman:**
  - Admin dan Pengurus: sapaan "Halo, Admin/Pengurus".
  - Siswa: "Halo, {nama}".
- **Isi [S: wireframe]:**
  - **Admin:** total anggota, rincian per tahap keanggotaan, program aktif (dengan periode dan jumlah peserta), jadwal terdekat.
  - **Pengurus:** ringkasan yang sama dengan Admin (wireframe berjudul "Admin/Pengurus"); aksi cepat ke Materi/Jadwal/Absensi/Evaluasi [T].
  - **Siswa:** program diikuti, progres modul (%), kehadiran (hadir/izin/sakit/alpa), jadwal terdekat, daftar "Program saya", dan tombol "Buka materi".
- **Proses sistem:** `GET /api/dashboard` (satu endpoint, isi bergantung role dari token) [T].
- **Proses database:** hanya `SELECT` agregat dari `anggota`, `program_pendidikan`, `jadwal`, `peserta_pendidikan`, `absensi`, `progres_materi`, `materi`.
- **Definisi "program aktif" [T]:** tanggal hari ini berada di antara `tanggal_mulai` dan `tanggal_selesai`.
- **Alternatif:** Siswa belum terdaftar → tampil "Anda belum terdaftar di program pendidikan mana pun. Hubungi pengurus", jadwal "Tidak ada jadwal mendatang".

---

## 9. Alur Proses Frontend, Backend, dan Database (Pola Umum)

**Pola baca (GET):**
```
Halaman (useEffect) → api.get(url, token) → authMiddleware → roleMiddleware → Controller → SELECT → JSON → state React → render
```

**Pola tulis (POST/PUT/DELETE):**
```
Form → validasi ringan di FE → api.post/put/delete → authMiddleware → roleMiddleware → Controller
     → validasi input di BE → (transaksi bila multi-tabel) INSERT/UPDATE/DELETE → respons {success, message}
     → FE menampilkan pesan, memuat ulang daftar
```

**Interceptor Axios [T]:**
- Request: menyisipkan `Authorization: Bearer <token>`.
- Response 401: hapus token, redirect ke `/login`.

---

## 10. Struktur Folder yang Direncanakan [T]

```
/ (root project)
├── backend/
│   ├── package.json
│   ├── .env                  # DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, PORT, CORS_ORIGIN
│   ├── .env.example
│   ├── db/
│   │   ├── schema.sql        # dibuat pada tahap pembangunan, bukan sekarang
│   │   └── seed.sql          # data awal: 1 Admin, 1 Pengurus, beberapa Siswa, 1 program
│   ├── uploads/              # file materi (tidak di-commit)
│   └── src/
│       ├── app.js            # konfigurasi Express, helmet, cors, JSON parser, routes
│       ├── server.js
│       ├── config/db.js      # pool mysql2
│       ├── middlewares/      # authMiddleware.js, roleMiddleware.js, upload.js, errorHandler.js
│       ├── routes/           # auth, anggota, program, kurikulum, materi, jadwal, peserta,
│       │                     # absensi, evaluasi, laporan, progres, notifikasi, profil, publik, dashboard
│       ├── controllers/      # satu controller per route di atas
│       └── utils/            # response.js, validators.js, hash.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           # definisi route
        ├── api/              # axios instance + modul per resource
        ├── context/AuthContext.jsx
        ├── routes/           # ProtectedRoute.jsx (cek token + role), RoleRedirect.jsx
        ├── layouts/          # AdminLayout, PengurusLayout, SiswaLayout, PublikLayout
        ├── components/       # Table, FormField, Modal/ConfirmDialog, Alert, Pagination?, EmptyState, NotificationBell
        ├── pages/
        │   ├── auth/Login.jsx
        │   ├── publik/InfoPublik.jsx
        │   ├── admin/        # Dashboard, DataAnggota, ProgramPendidikan, Kurikulum, Materi, Peserta, Laporan, Profil
        │   ├── pengurus/     # Dashboard, ProgramList, Materi, Jadwal, Absensi, Evaluasi, Profil
        │   └── siswa/        # Dashboard, Materi, Jadwal, RiwayatAbsensi, Progres, Profil
        └── utils/
```

Pada tahap pembangunan, `.env`, `uploads/`, dan `node_modules/` harus masuk `.gitignore`.

---

## 11. Struktur Database MySQL [S: Class Diagram, Gambar 19]

Berisi **11 tabel**, sesuai kelas pada Class Diagram. Class `Admin`, `Pengurus`, `Siswa` adalah turunan `User` (dibedakan lewat kolom `role`) dan `Guest` tidak punya tabel. **Tabel `jabatan` dari dokumentasi lama dihapus** karena tidak ada di Class Diagram. Tabel `nilai_evaluasi` dan `rekap_pendidikan` tetap tidak dipakai.

Tipe data mengikuti Class Diagram. Panjang VARCHAR, nilai enum yang tidak tertulis, dan constraint adalah **[T]**.

### 11.1 `users` (kelas User) — akun login semua aktor berlogin
| Kolom | Tipe | Constraint |
|---|---|---|
| id_user | INT | **PK**, AUTO_INCREMENT |
| nama | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | NOT NULL, **UNIQUE** |
| password | VARCHAR(255) | NOT NULL (hash bcrypt) |
| no_hp | VARCHAR(20) | NULL |
| role | ENUM('admin','pengurus','siswa') | NOT NULL |
| status | ENUM('aktif','nonaktif') | NOT NULL, DEFAULT 'aktif' |

### 11.2 `anggota` (kelas Anggota) — data tambahan Siswa
| Kolom | Tipe | Constraint |
|---|---|---|
| id_anggota | INT | **PK**, AUTO_INCREMENT |
| id_user | INT | **FK → users.id_user**, NOT NULL, UNIQUE (relasi 1–1) |
| nim | VARCHAR(20) | UNIQUE (nullable) |
| jurusan | VARCHAR(100) | NULL |
| angkatan | VARCHAR(10) | NULL |
| kontak | VARCHAR(50) | NULL |
| status_keanggotaan | ENUM('calon_siswa','siswa','calon_anggota','anggota','ppa','dp','pemburu_tua') | NOT NULL, DEFAULT 'calon_siswa' |

Nilai enum disesuaikan Tabel 2 dan Class Diagram. Teks skripsi menulis "calon Peserta, Peserta", yang dibaca sebagai calon siswa dan siswa (lihat K2).

### 11.3 `program_pendidikan` (ProgramPendidikan)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_program | INT | **PK**, AUTO_INCREMENT |
| nama_program | VARCHAR(150) | NOT NULL |
| jenis | ENUM('rutin','tambahan') | NOT NULL |
| deskripsi | TEXT | NULL |
| tanggal_mulai | DATE | NULL |
| tanggal_selesai | DATE | NULL |

Kolom `kuota` dan `created_at` dari dokumentasi lama **tidak ada** di Class Diagram, sehingga tidak dibuat (K4). Nilai enum `jenis` (rutin/tambahan) diambil dari dokumentasi lama dan selaras dengan "program wajib" dan "program tambahan" di wawancara [?].

### 11.4 `kurikulum` (Kurikulum)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_kurikulum | INT | **PK**, AUTO_INCREMENT |
| id_program | INT | **FK → program_pendidikan.id_program**, NOT NULL |
| tahun | VARCHAR(10) | NOT NULL |
| deskripsi | TEXT | NULL |
| status | ENUM('draft','diresmikan') | NOT NULL, DEFAULT 'draft' [T] |

### 11.5 `materi` (Materi)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_materi | INT | **PK**, AUTO_INCREMENT |
| id_program | INT | **FK → program_pendidikan.id_program**, NOT NULL |
| judul | VARCHAR(150) | NOT NULL |
| kategori | VARCHAR(100) | NOT NULL (teks bebas) |
| deskripsi | TEXT | NULL |
| file_path | VARCHAR(255) | NULL [T] |
| tanggal_upload | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Kolom `jenis_file` dari dokumentasi lama tidak ada di Class Diagram, sehingga tidak dibuat. Kategori diambil dari daftar materi di Tabel 2 sebagai contoh (Survival, Backpacking, Tali-temali dan Tandu, P3K, BHD, Navigasi, dll.), tetapi dibiarkan teks bebas karena tipe di diagram adalah `varchar`.

### 11.6 `jadwal` (Jadwal)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_jadwal | INT | **PK**, AUTO_INCREMENT |
| id_program | INT | **FK → program_pendidikan.id_program**, NOT NULL |
| tanggal | DATE | NOT NULL |
| waktu | TIME | NOT NULL [T] |
| lokasi | VARCHAR(150) | NOT NULL [T] |
| kegiatan | VARCHAR(150) | NOT NULL |

### 11.7 `peserta_pendidikan` (PesertaPendidikan) — relasi Anggota ↔ Program
| Kolom | Tipe | Constraint |
|---|---|---|
| id_peserta | INT | **PK**, AUTO_INCREMENT |
| id_anggota | INT | **FK → anggota.id_anggota**, NOT NULL |
| id_program | INT | **FK → program_pendidikan.id_program**, NOT NULL |
| tanggal_daftar | DATE | NOT NULL [T] |
| status | ENUM('aktif','selesai') | NOT NULL, DEFAULT 'aktif' [T/?] |
| — | — | **UNIQUE (id_anggota, id_program)** untuk mencegah pendaftaran ganda [S] |

### 11.8 `absensi` (Absensi)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_absensi | INT | **PK**, AUTO_INCREMENT |
| id_peserta | INT | **FK → peserta_pendidikan.id_peserta**, NOT NULL |
| id_jadwal | INT | **FK → jadwal.id_jadwal**, NOT NULL |
| status | ENUM('hadir','izin','sakit','alpa') | NOT NULL |
| keterangan | TEXT | NULL |
| — | — | **UNIQUE (id_peserta, id_jadwal)** [T] |

### 11.9 `progres_materi` (ProgresMateri)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_progres | INT | **PK**, AUTO_INCREMENT |
| id_peserta | INT | **FK → peserta_pendidikan.id_peserta**, NOT NULL |
| id_materi | INT | **FK → materi.id_materi**, NOT NULL |
| status | ENUM('belum_diakses','sudah_diakses') | NOT NULL, DEFAULT 'belum_diakses' [T] |
| tanggal_akses | TIMESTAMP | NULL |
| — | — | **UNIQUE (id_peserta, id_materi)** |

Baris dibuat saat materi pertama kali dibuka (`sudah_diakses`). Materi tanpa baris dianggap belum diakses.

### 11.10 `notifikasi` (Notifikasi)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_notifikasi | INT | **PK**, AUTO_INCREMENT |
| id_user | INT | **FK → users.id_user**, NOT NULL (penerima) |
| id_materi | INT | **FK → materi.id_materi**, NOT NULL |
| pesan | VARCHAR(255) | NOT NULL |
| status_baca | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### 11.11 `evaluasi` (Evaluasi)
| Kolom | Tipe | Constraint |
|---|---|---|
| id_evaluasi | INT | **PK**, AUTO_INCREMENT |
| id_peserta | INT | **FK → peserta_pendidikan.id_peserta**, NOT NULL |
| id_jadwal | INT | **FK → jadwal.id_jadwal**, NOT NULL |
| id_pencatat | INT | **FK → users.id_user**, NOT NULL (Pengurus pencatat) |
| hasil_penilaian | TEXT | NOT NULL |
| catatan | TEXT | NULL |
| tanggal_evaluasi | DATE | NOT NULL [T] |
| — | — | **UNIQUE (id_peserta, id_jadwal)** [T] |

### 11.12 Relasi Antartabel [S: Class Diagram]

| Relasi | Kardinalitas | FK |
|---|---|---|
| users — anggota (Siswa "memiliki data") | 1 : 0..1 | anggota.id_user |
| program_pendidikan — kurikulum ("memiliki") | 1 : 0..* | kurikulum.id_program |
| program_pendidikan — materi ("memiliki") | 1 : 0..* | materi.id_program |
| program_pendidikan — jadwal ("memiliki") | 1 : 0..* | jadwal.id_program |
| program_pendidikan — peserta_pendidikan ("diikuti oleh") | 1 : 0..* | peserta_pendidikan.id_program |
| anggota — peserta_pendidikan ("terdaftar sebagai") | 1 : 0..* | peserta_pendidikan.id_anggota |
| peserta_pendidikan — absensi ("memiliki") | 1 : 0..* | absensi.id_peserta |
| jadwal — absensi ("dicatat pada") | 1 : 0..* | absensi.id_jadwal |
| peserta_pendidikan — progres_materi ("memiliki") | 1 : 0..* | progres_materi.id_peserta |
| materi — progres_materi ("dilacak pada") | 1 : 0..* | progres_materi.id_materi |
| peserta_pendidikan — evaluasi ("dinilai melalui") | 1 : 0..* | evaluasi.id_peserta |
| jadwal — evaluasi ("dievaluasi pada") | 1 : 0..* | evaluasi.id_jadwal |
| users (Pengurus) — evaluasi ("mencatat") | 1 : 0..* | evaluasi.id_pencatat |
| materi — notifikasi ("memicu") | 1 : 0..* | notifikasi.id_materi |
| users — notifikasi ("menerima") | 1 : 0..* | notifikasi.id_user |

**Aturan ON DELETE [T]:**
- `RESTRICT` untuk hampir semua FK. Backend menerjemahkan error FK menjadi 409 dengan pesan yang jelas.
- `CASCADE` hanya untuk data turunan otomatis: `progres_materi.id_materi` dan `notifikasi.id_materi` (saat materi dihapus).
- Urutan pembuatan tabel mengikuti dependensi FK: `users` → `anggota` → `program_pendidikan` → `kurikulum`, `materi`, `jadwal` → `peserta_pendidikan` → `absensi`, `progres_materi`, `notifikasi`, `evaluasi`.

**Pemetaan identitas Siswa dari token [T]:**
```
token.id_user → anggota.id_user → anggota.id_anggota → peserta_pendidikan.id_anggota → id_peserta (satu per program)
```

---

## 12. Mekanisme Autentikasi dan Otorisasi

**Autentikasi [S/T]**
1. Login: bandingkan password dengan hash bcrypt di `users`.
2. Buat JWT dengan payload `{ id_user, role }`, ditandatangani `JWT_SECRET` dari `.env`, dengan masa berlaku (mis. 8 jam [T]).
3. FE menyimpan token. Setiap request membawa `Authorization: Bearer <token>`.
4. Logout: FE menghapus token. Tidak ada daftar hitam token sisi server.
5. Password tidak pernah dikembalikan di respons API apa pun.

**`authMiddleware`:** membaca header, memverifikasi tanda tangan dan kedaluwarsa, mengisi `req.user = {id_user, role}`. Gagal → 401.

**`roleMiddleware(roles[])`:** membandingkan `req.user.role` dengan daftar role endpoint. Tidak cocok → 403.

**Otorisasi data milik sendiri:**
- Endpoint `/saya` dan `/me` hanya memakai `req.user.id_user`. Tidak ada ID target dari klien.
- Siswa hanya dapat membuka materi dari program yang diikutinya.
- Notifikasi hanya dapat ditandai dibaca oleh pemiliknya.

**Guard Frontend:** `ProtectedRoute` memeriksa token dan role. Role yang salah diarahkan ke dashboard miliknya atau halaman "akses ditolak". Guard FE hanya kenyamanan UI. Keamanan sebenarnya ada di backend.

---

## 13. Daftar Endpoint API

**Konvensi respons [T].**
- Sukses: `{ "success": true, "data": ..., "message": "..." }`
- Gagal: `{ "success": false, "message": "...", "errors": { field: pesan } }`
- Kode: 200, 201, 400 (validasi), 401, 403, 404, 409 (duplikat/terkait data), 500.

**Penanda:** sumber [S] = nama URL/alur muncul di sequence diagram. [T] = usulan teknis. "Semua terproteksi" = wajib `authMiddleware`.

### 13.1 Auth
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `POST /api/auth/login` [S] | Login | publik | body: email, password | SELECT `users` by email; bcrypt compare; cek status; buat JWT | 200 `{token, role, user{id_user,nama,role}}`; 400; 401; 403 nonaktif |

Tidak ada `POST /api/auth/logout` karena logout dilakukan di frontend [S]. Endpoint lama dihapus.

### 13.2 Anggota (Admin)
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/anggota` [S] | Daftar anggota | admin | query opsional `q` | SELECT `anggota` JOIN `users` | 200 array |
| `POST /api/anggota` [S] | Tambah anggota + akun Siswa | admin | nama, email, nim, jurusan, angkatan, kontak, status_keanggotaan, password awal [?] | Transaksi: INSERT `users`(role=siswa) + INSERT `anggota` | 201; 400; 409 email/NIM |
| `PUT /api/anggota/:id` [S] | Ubah data & tahapan keanggotaan | admin | data anggota (+ nama/email/no_hp) | UPDATE `anggota` (+`users`) | 200; 400; 404; 409 |
| `DELETE /api/anggota/:id` [S] | Hapus anggota | admin | path id | DELETE `anggota` + `users` (transaksi) | 200; 404; 409 punya data terkait [T] |

### 13.3 Program Pendidikan
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/program` [S] | Daftar program | admin, pengurus [T] | – | SELECT `program_pendidikan` | 200 array |
| `GET /api/program/:id` [T] | Detail program (header halaman kelola) | admin, pengurus | path id | SELECT by id | 200; 404 |
| `POST /api/program` [S] | Tambah program | admin | nama_program, jenis, deskripsi, tanggal_mulai, tanggal_selesai | INSERT `program_pendidikan` | 201; 400 |
| `PUT /api/program/:id` [S] | Ubah program | admin | idem | UPDATE | 200; 400; 404 |
| `DELETE /api/program/:id` [S] | Hapus program | admin | path id | DELETE | 200; 404; 409 |

### 13.4 Kurikulum (Admin)
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/kurikulum?id_program=` [S] | Daftar kurikulum program | admin | query id_program | SELECT `kurikulum` | 200 array |
| `POST /api/kurikulum` [S] | Tambah kurikulum | admin | id_program, tahun, deskripsi, status | INSERT `kurikulum` | 201; 400; 404 program |
| `PUT /api/kurikulum/:id` [S] | Ubah kurikulum/status | admin | tahun, deskripsi, status | UPDATE `kurikulum` | 200; 400; 404 |

### 13.5 Materi
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/materi?id_program=` [S] | Daftar materi program (per kategori) | admin, pengurus | query id_program | SELECT `materi` | 200 array |
| `POST /api/materi` [S] | Tambah materi + buat notifikasi | admin, pengurus | id_program, judul, kategori, deskripsi, file (multipart) [T] | Transaksi: INSERT `materi`; SELECT peserta program; INSERT `notifikasi` per Siswa | 201 `{id_materi, jumlah_notifikasi}`; 400; 404 |
| `PUT /api/materi/:id` [S] | Ubah materi | admin, pengurus | judul, kategori, deskripsi, file opsional | UPDATE `materi` | 200; 400; 404 |
| `DELETE /api/materi/:id` [S] | Hapus materi | admin, pengurus | path id | DELETE `materi` (+cascade progres, notifikasi); hapus file fisik [T] | 200; 404 |
| `GET /api/materi/saya` [S] | Materi program yang diikuti Siswa | siswa | token | SELECT `materi` JOIN `peserta_pendidikan` JOIN `anggota` + status akses dari `progres_materi` | 200 array (dikelompokkan di FE) |
| `GET /api/materi/:id/file` [T] | Unduh/buka berkas materi | admin, pengurus, siswa (program diikuti) | path id | cek hak; kirim file dari `file_path` | 200 stream; 403; 404 |

### 13.6 Jadwal
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/jadwal?id_program=` [S] | Daftar jadwal program | pengurus | query id_program | SELECT `jadwal` ORDER BY tanggal | 200 array |
| `POST /api/jadwal` [S] | Tambah jadwal | pengurus | id_program, tanggal, waktu, lokasi, kegiatan | INSERT `jadwal` | 201; 400 |
| `PUT /api/jadwal/:id` [S] | Ubah jadwal | pengurus | idem | UPDATE `jadwal` | 200; 400; 404 |
| `DELETE /api/jadwal/:id` [S] | Hapus jadwal | pengurus | path id | DELETE `jadwal` | 200; 404; 409 |
| `GET /api/jadwal/saya` [S] | Jadwal program yang diikuti | siswa | token | SELECT `jadwal` JOIN `peserta_pendidikan` JOIN `anggota` | 200 array (FE memisah mendatang/lewat) |

### 13.7 Peserta Program (Admin)
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/peserta?id_program=` [S] | Daftar peserta program | admin | query id_program | SELECT `peserta_pendidikan` JOIN `anggota` JOIN `users` | 200 array |
| `POST /api/peserta` [S] | Daftarkan Siswa ke program | admin | id_anggota, id_program | Cek duplikat; INSERT `peserta_pendidikan` | 201; 400; 404; **409 sudah terdaftar** |

### 13.8 Absensi
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/absensi?id_jadwal=` [S] | Peserta + absensi kegiatan | pengurus | query id_jadwal | SELECT `peserta_pendidikan` LEFT JOIN `absensi` | 200 array `{id_peserta, nama, status|null, keterangan}` |
| `POST /api/absensi` [S] | Simpan/ubah absensi kegiatan (upsert) | pengurus | id_jadwal, data[{id_peserta, status, keterangan}] | Transaksi: INSERT bila belum ada, UPDATE bila sudah | 200/201 + rekap; 400; 404 |
| `GET /api/absensi/saya` [S] | Riwayat absensi milik sendiri + hitungan | siswa | token | SELECT `absensi` JOIN `jadwal` milik token; hitung hadir/izin/sakit/alpa | 200 `{rekap, riwayat[]}` |

`PUT /api/absensi/:id` dari dokumentasi lama dihapus, karena pembaruan dilakukan lewat upsert `POST /api/absensi` sesuai Gambar 10.

### 13.9 Evaluasi
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/evaluasi?id_jadwal=` [S] | Peserta + hasil evaluasi kegiatan | pengurus | query id_jadwal | SELECT `peserta_pendidikan` LEFT JOIN `evaluasi` | 200 array |
| `POST /api/evaluasi` [S] | Simpan/ubah evaluasi kegiatan (insert atau update) | pengurus | id_jadwal, data[{id_peserta, hasil_penilaian, catatan}] | Transaksi upsert `evaluasi`; `id_pencatat` dari token | 200/201 + rekap; 400; 404 |

### 13.10 Laporan (Admin)
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/laporan?id_program=&id_anggota=` [S] | Rekap per Siswa | admin | query opsional | SELECT `absensi`, `progres_materi`, `materi`, `evaluasi` + join peserta/anggota/users | 200 `[{siswa, program, absensi{hadir,izin,sakit,alpa}, progres{diakses,total,persen}, evaluasi[], detail_absensi[], detail_progres[]}]` |

### 13.11 Progres Materi
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `POST /api/progres/tandai-akses` [S] | Catat materi dibuka | siswa | body: id_materi | Cek materi milik program Siswa; upsert `progres_materi` status `sudah_diakses` | 200; 403; 404 |
| `GET /api/progres/saya` [S] | Progres (%) + hasil evaluasi milik sendiri | siswa | token | SELECT `progres_materi`; COUNT `materi`; SELECT `evaluasi` | 200 `{per_program[{persen,...}], evaluasi[]}` |

`GET /api/progres?id_peserta=` dari dokumentasi lama dihapus. Admin memakai `/api/laporan`, Siswa memakai `/saya`.

### 13.12 Notifikasi
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/notifikasi` [T] | Daftar notifikasi milik sendiri (+jumlah belum dibaca) | siswa | token | SELECT `notifikasi` JOIN `materi` WHERE id_user=token | 200 array |
| `PUT /api/notifikasi/:id/dibaca` [S] | Tandai dibaca | siswa | path id | UPDATE `notifikasi` (cek kepemilikan) | 200; 403; 404 |

### 13.13 Profil
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/profil/me` [S] | Data profil sendiri | admin, pengurus, siswa | token | SELECT `users` by token | 200 (tanpa password) |
| `PUT /api/profil/me` [S] | Ubah data diri sendiri | admin, pengurus, siswa | nama, email, no_hp | Validasi; UPDATE `users` by token | 200; 400; 409 |
| `PUT /api/profil/me/password` [T] | Ganti password | admin, pengurus, siswa | password_lama, password_baru, konfirmasi | verifikasi lama; UPDATE hash | 200; 400/401 |

### 13.14 Publik dan Dashboard
| Method & URL | Fungsi | Role | Input | Proses / Tabel | Respons |
|---|---|---|---|---|---|
| `GET /api/publik/program` [S] | Info umum program | **publik (tanpa token)** | – | SELECT kolom publik `program_pendidikan` | 200 array tanpa data pribadi |
| `GET /api/dashboard` [T] | Ringkasan dashboard sesuai role | admin, pengurus, siswa | token | SELECT agregat (lihat M17) | 200 `{...}` bergantung role |

### 13.15 Ringkasan Akses Endpoint per Role
| Kelompok | admin | pengurus | siswa | publik |
|---|:-:|:-:|:-:|:-:|
| `/api/auth/login` | – | – | – | ✓ |
| `/api/anggota` | ✓ | – | – | – |
| `/api/program` (GET) | ✓ | ✓ | – | – |
| `/api/program` (POST/PUT/DELETE) | ✓ | – | – | – |
| `/api/kurikulum` | ✓ | – | – | – |
| `/api/materi` (kelola) | ✓ | ✓ | – | – |
| `/api/materi/saya`, `/api/progres/*`, `/api/notifikasi*` | – | – | ✓ | – |
| `/api/jadwal` (kelola) | – | ✓ | – | – |
| `/api/jadwal/saya`, `/api/absensi/saya` | – | – | ✓ | – |
| `/api/peserta` | ✓ | – | – | – |
| `/api/absensi`, `/api/evaluasi` (kelola) | – | ✓ | – | – |
| `/api/laporan` | ✓ | – | – | – |
| `/api/profil/me*`, `/api/dashboard` | ✓ | ✓ | ✓ | – |
| `/api/publik/program` | ✓ | ✓ | ✓ | ✓ |

---

## 14. Rancangan Halaman Frontend

| Route | Aktor | Fungsi halaman | Endpoint utama |
|---|---|---|---|
| `/login` | semua | Form login + tautan info publik [S: Gambar 20] | `POST /api/auth/login` |
| `/dashboard` | login | Redirect ke dashboard sesuai role | – |
| `/publik` | Guest (semua) | Info umum program tanpa data pribadi | `GET /api/publik/program` |
| `/admin/dashboard` | Admin | Ringkasan anggota, program aktif, jadwal terdekat | `GET /api/dashboard` |
| `/admin/anggota` | Admin | Tabel, cari, tambah/ubah/hapus anggota | `/api/anggota` |
| `/admin/program` | Admin | Tabel program, tambah/ubah/hapus, tombol Kelola | `/api/program` |
| `/admin/program/:id/kurikulum` | Admin | Kelola kurikulum program | `/api/kurikulum` |
| `/admin/program/:id/materi` | Admin | Kelola materi per kategori | `/api/materi` |
| `/admin/program/:id/peserta` | Admin | Daftar dan daftarkan peserta | `/api/peserta`, `/api/anggota` |
| `/admin/laporan` | Admin | Rekap absensi, progres, evaluasi dengan filter | `/api/laporan` |
| `/admin/profil` | Admin | Ubah data diri dan password | `/api/profil/me*` |
| `/pengurus/dashboard` | Pengurus | Ringkasan dan aksi cepat | `GET /api/dashboard` |
| `/pengurus/program` | Pengurus | Daftar program untuk memilih (read-only) | `GET /api/program` |
| `/pengurus/program/:id/materi` | Pengurus | Kelola materi | `/api/materi` |
| `/pengurus/program/:id/jadwal` | Pengurus | Kelola jadwal | `/api/jadwal` |
| `/pengurus/program/:id/absensi` | Pengurus | Pilih jadwal, isi absensi per Siswa | `/api/jadwal`, `/api/absensi` |
| `/pengurus/program/:id/evaluasi` | Pengurus | Pilih jadwal, isi evaluasi per Siswa | `/api/jadwal`, `/api/evaluasi` |
| `/pengurus/profil` | Pengurus | Ubah data diri dan password | `/api/profil/me*` |
| `/siswa/dashboard` | Siswa | Program, progres, kehadiran, jadwal terdekat | `GET /api/dashboard` |
| `/siswa/materi` | Siswa | Modul per kategori; buka materi = progres; lonceng notifikasi | `/api/materi/saya`, `/api/progres/tandai-akses`, `/api/notifikasi*` |
| `/siswa/jadwal` | Siswa | Mendatang dan sudah lewat | `GET /api/jadwal/saya` |
| `/siswa/absensi` | Siswa | Kartu rekap + tabel riwayat | `GET /api/absensi/saya` |
| `/siswa/progres` | Siswa | Persentase materi dibuka + hasil evaluasi | `GET /api/progres/saya` |
| `/siswa/profil` | Siswa | Ubah data diri dan password | `/api/profil/me*` |

Komponen bersama [T]: navbar sesuai role (+ Logout), tabel, form, dialog konfirmasi hapus, notifikasi sukses/gagal, state kosong, dan indikator loading.

---

## 15. Validasi Input dan Penanganan Error

**Validasi di backend (wajib), FE hanya validasi ringan:**

| Modul | Aturan utama |
|---|---|
| Login | email dan password wajib; format email |
| Anggota | nama, email, status_keanggotaan wajib; email unik; NIM unik; status_keanggotaan ∈ enum |
| Program | nama_program dan jenis wajib; tanggal_selesai ≥ tanggal_mulai |
| Kurikulum | id_program valid; tahun dan status wajib |
| Materi | judul dan kategori wajib; id_program valid; tipe/ukuran file dibatasi |
| Jadwal | id_program, tanggal, waktu, lokasi, kegiatan wajib |
| Peserta | id_anggota dan id_program valid; kombinasi unik |
| Absensi | status ∈ {hadir, izin, sakit, alpa}; peserta sesuai program jadwal |
| Evaluasi | hasil_penilaian wajib; peserta sesuai program jadwal |
| Profil | nama dan email wajib; email unik; field terlarang diabaikan/ditolak; password baru ≥ 8 dan konfirmasi sama |

**Penanganan error:**
- Error terpusat melalui `errorHandler` Express. Format respons seragam (Bagian 13).
- Kode 400 untuk validasi, 401 autentikasi, 403 hak akses, 404 tidak ditemukan, 409 duplikat atau terkait data, 500 kesalahan server.
- Pesan ke pengguna dalam Bahasa Indonesia dan tidak membocorkan detail teknis atau SQL.
- Error pelanggaran unique atau FK dari MySQL (`ER_DUP_ENTRY`, `ER_ROW_IS_REFERENCED_2`) dipetakan menjadi 409 dengan pesan yang bermakna.
- FE menampilkan pesan error di atas form atau lewat notifikasi singkat. Daftar kosong tampil sebagai state kosong, bukan error.

---

## 16. Keamanan Sistem

- Hash password bcrypt (salt rounds ≥ 10). Password tidak pernah dikembalikan ke klien atau dicatat di log [T].
- JWT dengan `JWT_SECRET` kuat di `.env` dan masa berlaku terbatas [T].
- `authMiddleware` dan `roleMiddleware` di setiap route terproteksi. Daftar putih hanya login dan publik [S/T].
- Semua query memakai parameter (prepared statement), tanpa konkatenasi string [T].
- Data milik pengguna selalu dari token, mencegah akses data Siswa lain [S].
- Endpoint publik memakai whitelist kolom, tanpa join ke tabel personal [S].
- Upload materi: batasi ekstensi dan ukuran, nama file di-generate acak, berkas disajikan lewat endpoint terproteksi [T].
- `helmet`, CORS dibatasi ke origin frontend, rate limit untuk login [T].
- `.env` dan `uploads/` tidak masuk repository [T].

---

## 17. Mekanisme Pengujian Black Box Testing [S: Tabel 5]

**Metode:** Black Box Testing saja. Fokus pada masukan dan keluaran tanpa memeriksa struktur kode. Dilakukan pada tahap Implementasi (RAD), idealnya bersama pengguna (pengurus MAPALA). Kolom status diisi **Berhasil** atau **Gagal** setelah pengujian. Skenario disusun berdasarkan Tabel 3, Tabel 4, dan alur Sequence Diagram.

**Rancangan skenario resmi (Tabel 5) beserta modul yang diuji:**

| ID | Aktor | Fitur | Skenario | Hasil yang diharapkan | Modul |
|---|---|---|---|---|---|
| TC-01 | Admin, Pengurus, Siswa | Login | Login dengan email dan password benar | Masuk ke dashboard sesuai peran | M01 |
| TC-02 | Admin, Pengurus, Siswa | Login | Login dengan password salah | Muncul pesan login gagal | M01 |
| TC-03 | Admin, Pengurus, Siswa | Logout | Menekan tombol Logout | Kembali ke halaman login | M01 |
| TC-04 | Admin | Kelola data anggota | Menambah anggota dengan data lengkap | Data tersimpan dan akun siswa dibuat | M02 |
| TC-05 | Admin | Kelola data anggota | Mengubah status tahapan keanggotaan | Status keanggotaan tersimpan | M02 |
| TC-06 | Admin | Kelola program pendidikan | Menambah program pendidikan | Program tampil pada daftar program | M03 |
| TC-07 | Admin | Kelola kurikulum | Menambah kurikulum pada program | Kurikulum tersimpan pada program terpilih | M04 |
| TC-08 | Admin, Pengurus | Kelola materi | Menambah materi beserta kategori | Materi tersimpan dan siswa menerima notifikasi | M05, M11 |
| TC-09 | Pengurus | Kelola jadwal kegiatan | Menambah jadwal kegiatan | Jadwal tampil pada daftar jadwal | M06 |
| TC-10 | Admin | Kelola peserta program | Mendaftarkan siswa ke program | Siswa tersimpan sebagai peserta program | M07 |
| TC-11 | Admin | Kelola peserta program | Mendaftarkan siswa yang sudah terdaftar | Pendaftaran ditolak dengan pesan | M07 |
| TC-12 | Pengurus | Kelola absensi | Menyimpan status kehadiran siswa pada satu kegiatan | Absensi tersimpan sesuai kegiatan | M08 |
| TC-13 | Pengurus | Kelola evaluasi | Menyimpan hasil penilaian siswa pada satu kegiatan | Hasil evaluasi tersimpan | M09 |
| TC-14 | Admin | Melihat laporan | Memilih filter program | Rekap kehadiran, progres, dan evaluasi tampil | M10 |
| TC-15 | Siswa | Mengakses materi | Membuka salah satu materi | Isi materi tampil dan tercatat sebagai progres | M11 |
| TC-16 | Siswa | Melihat jadwal | Membuka menu Jadwal | Jadwal program yang diikuti tampil | M12 |
| TC-17 | Siswa | Melihat riwayat absensi | Membuka menu Riwayat Absensi | Riwayat kehadiran milik siswa tampil | M13 |
| TC-18 | Siswa | Melihat progres dan evaluasi | Membuka menu Progres | Persentase progres dan hasil evaluasi tampil | M14 |
| TC-19 | Admin, Pengurus, Siswa | Mengubah profil | Mengubah data diri lalu menyimpan | Perubahan profil tersimpan | M15 |
| TC-20 | Guest | Melihat informasi publik | Membuka website tanpa login | Informasi program tampil tanpa data pribadi | M16 |
| TC-21 | Siswa | Hak akses | Membuka halaman Kelola Data Anggota | Akses ditolak karena bukan Admin | M02, Bagian 12 |

**Skenario tambahan yang diusulkan [T], belum ada di Tabel 5.** Muncul dari kondisi alternatif pada alur dan dapat ditambahkan ke Tabel 5 bila disetujui:

| ID usulan | Aktor | Skenario | Hasil yang diharapkan |
|---|---|---|---|
| TC-A1 | Pengguna | Mengakses endpoint terproteksi tanpa token | 401 dan diarahkan ke login |
| TC-A2 | Admin | Menambah anggota dengan data tidak lengkap / email sudah dipakai | Ditolak dengan pesan; tidak ada user/anggota baru |
| TC-A3 | Pengurus | Menambah jadwal dengan data tidak lengkap | Gagal validasi (400), data tidak tersimpan |
| TC-A4 | Pengurus | Menyimpan absensi untuk kegiatan yang sudah pernah diisi | Data diperbarui, tidak menggandakan |
| TC-A5 | Siswa | Membuka materi program yang tidak diikuti | Akses ditolak |
| TC-A6 | Siswa | Membuka materi yang sama dua kali | Progres tidak ganda; persentase tidak bertambah |
| TC-A7 | Pengurus / Admin | Mengakses fitur milik aktor lain (Admin → absensi; Pengurus → kelola anggota) | Akses ditolak (403) |
| TC-A8 | Admin | Menambah materi pada program yang belum punya peserta | Materi tersimpan, tanpa notifikasi |
| TC-A9 | Guest | Memanggil `/api/publik/program` dan memeriksa isi respons | Tidak ada data pribadi |
| TC-A10 | Pengguna | Memanipulasi `id` pengguna lain pada permintaan profil/absensi | Diabaikan; hanya data milik token |

**Regression Testing [T].** Bukan metode pengujian terpisah. Maksudnya mengulang eksekusi skenario Black Box (TC-01 s.d. TC-21 dan skenario tambahan yang disetujui) setelah ada perbaikan bug atau perubahan hasil tinjauan pengurus (iterasi RAD), untuk memastikan fitur yang sebelumnya berhasil tidak rusak.

**Pelaksanaan:** isi kolom Status (Berhasil/Gagal), catat bukti (tangkapan layar atau catatan), perbaiki skenario Gagal lalu uji ulang.

---

## 18. Urutan Pembangunan yang Disarankan

Mengikuti prioritas Tabel 3 (Tinggi → Sedang → Rendah) dan dependensi data:

1. Setup project, MySQL lokal (tanpa Docker), dan skema database.
2. Auth dan middleware role (M01), karena semua fitur bergantung padanya.
3. **Prioritas Tinggi:** Anggota (M02), Program (M03), Materi + notifikasi (M05), Jadwal (M06), Peserta (M07), Absensi (M08), Evaluasi (M09), dan Siswa Mengakses Materi (M11).
4. **Prioritas Sedang:** Kurikulum (M04), Laporan (M10), Jadwal Siswa (M12), Riwayat Absensi (M13), Progres & Evaluasi (M14).
5. **Prioritas Rendah:** Profil (M15), Informasi Publik (M16).
6. Dashboard per role (M17) setelah modul-modul sumber datanya ada.
7. Validasi dan keamanan menyeluruh, Black Box Testing, regression testing, dan finalisasi.

---

## 19. Catatan yang Perlu Dikonfirmasi

Hal yang tidak jelas atau saling bertentangan di skripsi. **Belum diputuskan**, dan dokumen ini memakai asumsi kerja sementara seperti tertulis.

| No | Temuan | Asumsi kerja dokumen ini |
|---|---|---|
| **K1** | **Gambar 2 (Use Case Diagram) belum sinkron dengan teks, Tabel 3, Tabel 4, dan sequence diagram.** Gambar menghubungkan Admin ke *Kelola jadwal* dan *Kelola Absensi*, menghubungkan Siswa ke *Melihat Laporan*, tidak memiliki use case *Kelola Evaluasi*, serta memiliki panah *include* "Mengakses materi" yang janggal. | Mengikuti Tabel 3/4 + teks penjelasan + sequence diagram (Jadwal/Absensi/Evaluasi = Pengurus; Laporan = Admin). **Gambar 2 perlu diperbarui.** |
| **K2** | **Penamaan role tidak konsisten.** Tabel 4 memakai kolom "Peserta". Teks Class Diagram menyebut turunan User = "Admin, Pembina, Pengurus, Peserta" dan "calon Peserta, Peserta". Gambar Class Diagram sendiri memakai Siswa, Admin, Pengurus, dan Guest. Wireframe menulis "role peserta". | Role akun: `admin`, `pengurus`, `siswa`; Guest tanpa akun. Pembina bukan role terpisah (peran Admin bisa dipegang pembina). Teks dan tabel perlu diseragamkan. |
| **K3** | **Status fitur evaluasi.** Dokumentasi lama menghapus evaluasi, tetapi skripsi terbaru masih memuatnya (Tabel 3/4, Gambar 11 dan 16, kelas Evaluasi, TC-13/18). Teks Pendahuluan dan 2.2 menyebut "evaluasi kompetensi" dan "rekapitulasi nilai", sedangkan teks Gambar 24 (laporan) hanya menyebut kehadiran dan progres. | Evaluasi diimplementasikan sebagai catatan penilaian lapangan (teks), tanpa nilai angka, tanpa kelulusan, tanpa tabel rekap. Evaluasi ikut tampil di Laporan sesuai Gambar 12. Mohon konfirmasi. |
| **K4** | Wireframe Program menampilkan **kuota** dan kolom **instruktur**, sedangkan Class Diagram `ProgramPendidikan` tidak punya atribut tersebut. | Tidak dibuat (mengikuti Class Diagram). |
| **K5** | Teks wireframe Program: tombol *Kelola* mengatur kurikulum, materi, **jadwal**, dan peserta untuk Admin, padahal Tabel 4 menyatakan Admin tidak mengelola jadwal. | Admin tidak punya menu jadwal. Tombol Kelola hanya mengarah ke Kurikulum, Materi, dan Peserta. |
| **K6** | Nilai enum tidak tertulis: `peserta_pendidikan.status`, `kurikulum.status`, `progres_materi.status`, `program_pendidikan.jenis`. | Usulan [T] seperti Bagian 11. Untuk `peserta_pendidikan.status`, nilai "gugur" milik dokumentasi lama tidak dipakai karena tidak ada mekanisme kelulusan. |
| **K7** | Skripsi hanya mendefinisikan pembuatan akun **Siswa** (saat tambah anggota). Pembuatan akun **Admin dan Pengurus**, serta **password awal** akun Siswa, tidak dijelaskan. | Akun Admin dan Pengurus dibuat lewat data awal (seed). Form tambah anggota memuat password awal (bila kosong, sistem membuat password sementara dan menampilkannya sekali). |
| **K8** | Logout pada Gambar 3 hanya menghapus token di frontend (tidak ada endpoint). | Tidak membuat `POST /api/auth/logout`. |
| **K9** | Perilaku **hapus** anggota/program/jadwal yang sudah punya data turunan tidak dijelaskan. | Ditolak dengan 409 (RESTRICT). Hapus materi menghapus progres dan notifikasi turunannya. |
| **K10** | SRS lengkap (kebutuhan nonfungsional) ada di lampiran PDF terpisah yang tidak ada di DOCX. | Kebutuhan nonfungsional disimpulkan dari skripsi dan diusulkan (Bagian 5.2). Perlu disamakan dengan SRS. |
| **K11** | Tidak ada fitur membatalkan/menghapus peserta dari program dan tidak ada ubah `status` peserta. | Tidak diimplementasikan. |
| **K12** | Dashboard Admin pada wireframe menampilkan "Siswa / Anggota / Alumni", sementara tahapan keanggotaan di Class Diagram ada 7. | Dashboard menampilkan jumlah per tahap keanggotaan sesuai enum. |
| **K13** | Cakupan "informasi umum program" untuk Guest tidak dirinci. | Hanya kolom publik `program_pendidikan` (nama, jenis, deskripsi, tanggal). |
| **K14** | Hanya satu file DOCX tersedia (`2381052_JeheskielKaja_Revisi_SP.docx`), tanpa komentar atau tracked changes. Transkrip wawancara dan catatan dosen penguji tidak tersedia. Bagian bertanda sorot di DOCX dianggap hasil revisi terbaru. | Seluruh isi dokumen diturunkan dari DOCX tersebut. |
| **K15** | Beberapa sequence diagram (Login, Anggota, Program, Materi, Jadwal) tidak menggambar partisipan Middleware Auth dan Role, padahal teks menyebutkannya. | Middleware diterapkan pada semua endpoint terproteksi. |

---

## 20. Catatan Implementasi (Penyesuaian Teknis)

Penyesuaian teknis selama pembangunan. **Tidak mengubah kebutuhan, aktor, hak akses, tabel, atau alur bisnis** di atas.

| No | Penyesuaian | Alasan |
|---|---|---|
| T1 | Port default backend **4100** dan frontend **5180** (dapat diubah lewat `PORT`, `CORS_ORIGIN`, `vite.config.js`). | Port 4000/5173 sudah dipakai aplikasi lain di mesin pengembangan. |
| T2 | `backend/db/reset.js` (`npm run db:reset`) menjalankan `schema.sql` lalu `seed.sql`; `schema.sql` diawali `DROP TABLE IF EXISTS` agar bisa diulang. Database `DB_TEST_NAME` terpisah dipakai `npm test`. | Pemasangan ulang dan pengujian dari data seed bersih. |
| T3 | Bentuk `data` beberapa respons diperluas: `GET /api/materi/saya` → `{program[], materi[]}` (agar FE bisa membedakan "belum terdaftar" dan "program tanpa materi"); `GET /api/absensi` dan `GET /api/evaluasi` → `{jadwal, peserta[], rekap}`; `GET /api/notifikasi` → `{belum_dibaca, items[]}`. | Kebutuhan tampilan §8 (M08, M09, M11). Tidak ada endpoint baru. |
| T4 | `PUT /api/anggota/:id` menerima `status_akun` (aktif/nonaktif) untuk `users.status`. | §8 M02 "Proses database" menyebut UPDATE `users` termasuk status akun; akun nonaktif ditolak login (M01). |
| T5 | Absensi: semua Siswa program wajib diberi status sebelum disimpan (400 bila tidak). Evaluasi: baris tanpa hasil & catatan dilewati; catatan tanpa hasil → 400; minimal satu baris diisi. | Validasi §8 M08/M09. |
| T6 | Unggah materi: ekstensi pdf, doc(x), ppt(x), xls(x), txt, jpg, jpeg, png, mp4; maks 20 MB (413 bila lebih). Nama file acak (UUID). `file_path` tidak pernah dikirim ke klien. | §16. |
| T7 | Rate limit login: 10 percobaan per 15 menit per IP (`LOGIN_RATE_MAX`). | §16, M01 (429). |
| T8 | Frontend menambah folder `hooks/` (useFetch) dan `pages/shared/` (Dashboard Admin/Pengurus, Kelola Materi, Profil, layout Kelola Program) yang dipakai lebih dari satu peran; tiga layout peran berada di satu file `layouts/RoleLayout.jsx`. | Menghindari duplikasi; §8 M05 meminta komponen yang sama untuk Admin dan Pengurus. |
| T9 | Kode versi lama (role instruktur/peserta, Docker, tabel `jabatan`) dipindah ke `_legacy_v1/` (di-.gitignore). | Tidak sesuai dokumen ini; dapat dihapus. |
