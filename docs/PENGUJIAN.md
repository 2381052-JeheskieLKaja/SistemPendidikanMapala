# Hasil Pengujian — Black Box Testing

Metode: **Black Box Testing** (§17). Setiap skenario diuji dari masukan dan keluaran tanpa melihat struktur kode, dengan dua cara:

1. **Level API (otomatis, dapat diulang):** `cd backend && npm test`. Database test di-reset ke data seed bersih sebelum dijalankan. Bukti: keluaran `npm test` (69 pass, 0 fail).
2. **Level antarmuka (manual di browser):** dijalankan pada aplikasi yang berjalan (frontend :5180, backend :4100, MySQL lokal) dengan akun seed. Bukti: catatan pengamatan pada kolom "Bukti UI".

Tanggal eksekusi: 19 November 2026. Lingkungan: macOS, Node 24, MySQL lokal (Homebrew), browser bawaan Claude desktop.

## Tabel 5 — Skenario resmi

| ID | Aktor | Fitur | Skenario | Hasil yang diharapkan | Status | Bukti UI |
|---|---|---|---|---|---|---|
| TC-01 | Admin, Pengurus, Siswa | Login | Login dengan email dan password benar | Masuk ke dashboard sesuai peran | **Berhasil** | admin → `/admin/dashboard`, pengurus → `/pengurus/dashboard`, budi → `/siswa/dashboard` |
| TC-02 | Admin, Pengurus, Siswa | Login | Login dengan password salah | Muncul pesan login gagal | **Berhasil** | Pesan "Email atau password salah", tetap di `/login` |
| TC-03 | Admin, Pengurus, Siswa | Logout | Menekan tombol Logout | Kembali ke halaman login | **Berhasil** | Kembali ke `/login`, token terhapus; membuka `/admin/anggota` sesudahnya dialihkan ke `/login` |
| TC-04 | Admin | Kelola data anggota | Menambah anggota dengan data lengkap | Data tersimpan dan akun siswa dibuat | **Berhasil** | "Dewi Lestari" tampil di tabel; password sementara ditampilkan sekali; akun bisa login (API) |
| TC-05 | Admin | Kelola data anggota | Mengubah status tahapan keanggotaan | Status keanggotaan tersimpan | **Berhasil** | Dewi: Calon Siswa → Siswa tampil di tabel setelah simpan |
| TC-06 | Admin | Kelola program pendidikan | Menambah program pendidikan | Program tampil pada daftar program | **Berhasil** | "Panjat Tebing 2027" tampil; tanggal selesai < mulai ditolak dengan pesan |
| TC-07 | Admin | Kelola kurikulum | Menambah kurikulum pada program | Kurikulum tersimpan pada program terpilih | **Berhasil** | Kurikulum 2026 (Draft) tampil di tab Kurikulum program Panjat Tebing |
| TC-08 | Admin, Pengurus | Kelola materi | Menambah materi beserta kategori | Materi tersimpan dan siswa menerima notifikasi | **Berhasil** | Admin: "Teknik Belay" + berkas TXT, toast "Notifikasi dikirim ke 1 siswa". Pengurus: "Navigasi Malam" → lonceng Budi menampilkan notifikasi baru |
| TC-09 | Pengurus | Kelola jadwal kegiatan | Menambah jadwal kegiatan | Jadwal tampil pada daftar jadwal | **Berhasil** | Form kosong ditolak (4 pesan wajib diisi); jadwal "Latihan panjat dasar" tampil |
| TC-10 | Admin | Kelola peserta program | Mendaftarkan siswa ke program | Siswa tersimpan sebagai peserta program | **Berhasil** | Dewi tampil di Peserta program (1) |
| TC-11 | Admin | Kelola peserta program | Mendaftarkan siswa yang sudah terdaftar | Pendaftaran ditolak dengan pesan | **Berhasil** | Pesan "Siswa sudah terdaftar pada program ini"; tidak ada baris ganda |
| TC-12 | Pengurus | Kelola absensi | Menyimpan status kehadiran siswa pada satu kegiatan | Absensi tersimpan sesuai kegiatan | **Berhasil** | Simpan tanpa status ditolak; Budi Hadir, Sari Sakit "Demam" → rekap Hadir 1 / Sakit 1 |
| TC-13 | Pengurus | Kelola evaluasi | Menyimpan hasil penilaian siswa pada satu kegiatan | Hasil evaluasi tersimpan | **Berhasil** | Catatan tanpa hasil ditolak; setelah diisi, rekap evaluasi 2 siswa tampil dengan pencatat |
| TC-14 | Admin | Melihat laporan | Memilih filter program | Rekap kehadiran, progres, dan evaluasi tampil | **Berhasil** | Filter Inagurasi: Budi H2 50% 2 evaluasi, Sari H1 I1 25%; klik baris menampilkan detail progres per materi |
| TC-15 | Siswa | Mengakses materi | Membuka salah satu materi | Isi materi tampil dan tercatat sebagai progres | **Berhasil** | Klik notifikasi → materi terbuka, status "Sudah diakses", badge notifikasi 5 → 4 |
| TC-16 | Siswa | Melihat jadwal | Membuka menu Jadwal | Jadwal program yang diikuti tampil | **Berhasil** | Budi: Mendatang 3, Sudah lewat 3 (hanya Inagurasi & Diklatsar) |
| TC-17 | Siswa | Melihat riwayat absensi | Membuka menu Riwayat Absensi | Riwayat kehadiran milik siswa tampil | **Berhasil** | Kartu Hadir 3 / Sakit 1 dan tabel 4 baris milik Budi |
| TC-18 | Siswa | Melihat progres dan evaluasi | Membuka menu Progres | Persentase progres dan hasil evaluasi tampil | **Berhasil** | Inagurasi 60% (3 dari 5), Diklatsar 0%; 3 hasil evaluasi |
| TC-19 | Admin, Pengurus, Siswa | Mengubah profil | Mengubah data diri lalu menyimpan | Perubahan profil tersimpan | **Berhasil** | No. HP Budi berubah dan tetap setelah halaman dimuat ulang |
| TC-20 | Guest | Melihat informasi publik | Membuka website tanpa login | Informasi program tampil tanpa data pribadi | **Berhasil** | `/publik` menampilkan 3 program (nama, jenis, periode, deskripsi) tanpa login |
| TC-21 | Siswa | Hak akses | Membuka halaman Kelola Data Anggota | Akses ditolak karena bukan Admin | **Berhasil** | `/admin/anggota` sebagai Budi → halaman "403 Akses ditolak"; API 403 "Anda tidak memiliki hak akses" |

**Ringkasan: 21 dari 21 skenario Berhasil, 0 Gagal.**

## Skenario tambahan (TC-A, usulan §17)

| ID | Skenario | Hasil yang diharapkan | Status |
|---|---|---|---|
| TC-A1 | Endpoint terproteksi tanpa token / token rusak | 401 dan diarahkan ke login | **Berhasil** (UI: token rusak → `/login?sesi=habis`) |
| TC-A2 | Tambah anggota tidak lengkap / email atau NIM dipakai | Ditolak; tidak ada user/anggota baru | **Berhasil** |
| TC-A3 | Tambah jadwal tidak lengkap | 400, data tidak tersimpan | **Berhasil** |
| TC-A4 | Simpan absensi untuk kegiatan yang sudah diisi | Data diperbarui, tidak menggandakan | **Berhasil** |
| TC-A5 | Siswa membuka materi program yang tidak diikuti | Akses ditolak (403) | **Berhasil** |
| TC-A6 | Siswa membuka materi yang sama dua kali | Progres tidak ganda, persentase tidak bertambah, `tanggal_akses` tidak ditimpa | **Berhasil** |
| TC-A7 | Admin → jadwal/absensi/evaluasi; Pengurus → anggota/laporan/kurikulum/peserta; Siswa → kelola | 403 | **Berhasil** (UI: Pengurus membuka `/admin/anggota` → Akses ditolak) |
| TC-A8 | Tambah materi pada program tanpa peserta | Tersimpan, 0 notifikasi | **Berhasil** |
| TC-A9 | Periksa isi respons `/api/publik/program` | Tidak ada data pribadi | **Berhasil** |
| TC-A10 | Kirim `id_user`, `role`, `nim` palsu di profil / `id_peserta` di query absensi | Diabaikan; hanya data milik token | **Berhasil** |

## Uji per modul (Tahap 9) — semua Berhasil

M01 (input kosong, akun nonaktif 403, token kedaluwarsa, token dengan secret lain, rate limit 429), M02 (cari nama/email/NIM, input injeksi SQL tidak berpengaruh, password sementara, 404/409, hapus ditolak bila punya data pendidikan, **rollback transaksi** users+anggota), M03 (validasi tanggal, hapus program berisi data 409), M04 (404 program, enum, tidak ada DELETE), M05 (ekstensi file ditolak, file > 20 MB → 413, ganti berkas, unduh terproteksi, hapus → progres & notifikasi ikut terhapus, **rollback** materi+notifikasi), M06 (ubah/hapus, hapus jadwal beraktivitas 409, urutan), M07 (404, dua pendaftaran bersamaan → satu tersimpan), M08 (status/peserta tidak valid, semua siswa wajib diberi status, **rollback**), M09 (upsert, pencatat dari token, tanpa nilai angka/kelulusan), M10 (filter anggota, kombinasi, tanpa filter, tanpa data, total materi 0 → 0%), M11 (kepemilikan notifikasi 403), M12–M14 (Siswa tanpa program, isolasi data), M15 (email ganda 409, aturan ganti password), M17 (angka dashboard cocok dengan tabel).

## Regression Testing

Mengulang skenario yang sama setelah perbaikan. Perbaikan yang dilakukan selama pengujian dan uji ulangnya:

| Temuan | Perbaikan | Uji ulang |
|---|---|---|
| Jumlah peserta di header Kelola Program tidak berubah setelah mendaftarkan siswa / menambah materi / jadwal | Header dimuat ulang setelah aksi, tanpa me-reset halaman | TC-08, TC-09, TC-10 di UI: header berubah "0 peserta" → "1 peserta" — Berhasil |
| Rekap evaluasi ikut berubah saat teks form diketik sebelum disimpan | Rekap memakai data tersimpan dari server | TC-13 — Berhasil |
| Label kartu "Jadwal mendatang" pada dashboard menyesatkan (dibatasi 5) | Label diganti "Jadwal terdekat — ditampilkan maksimal 5" | M17 — Berhasil |

Setelah seluruh perbaikan, `npm test` dijalankan ulang dari seed bersih: **69 pass, 0 fail** (TC-01 s.d. TC-21, TC-A1 s.d. TC-A10, uji modul, rate limit).

## Belum dilaksanakan

- Pengujian **bersama pengurus MAPALA** (pengguna sistem) dan iterasi RAD hasil tinjauannya belum dilakukan karena memerlukan kehadiran pengguna. Jalankan kembali tabel di atas bersama pengurus dan isi kolom Status.
