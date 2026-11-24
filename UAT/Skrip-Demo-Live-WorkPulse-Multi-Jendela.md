# SKRIP DEMO LIVE MULTI-JENDELA — WORKPULSE
# PANDUAN LATIHAN PAGI & PRESENTASI RESMI DI HADAPAN PIMPINAN PERUSAHAAN

**PT Dutamedia Mandiri Pratama — Malang (WIB)**  
**Alamat Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Kata Sandi Semua Akun Uji:** `Password123!`  
**Waktu Demo Rencana:** Di atas pukul `13:00 WIB` *(Latihan Pagi: sebelum `12:00 WIB` → Reset Data Bersih Cara 1 → Demo Resmi `13:00+ WIB`)*  
**Perkiraan Durasi Demo:** `30–45 menit` *(fleksibel: Babak 1–6 adalah inti 25 menit; Babak 7–8 adalah penguatan tata kelola 10–15 menit)*

---

## 1. STRATEGI 5 JENDELA BROWSER (TANPA BOLAK-BALIK LOGIN-LOGOUT)

Siapkan **5 jendela browser terpisah** (gunakan fitur *Chrome Profile* berbeda atau kombinasi *Chrome Normal + Chrome Incognito + Microsoft Edge + Firefox*) **15 menit sebelum demo dimulai**, lalu susun rapi di taskbar agar perpindahan peran cukup `1 klik` atau `Alt + Tab`:

| Jendela | Peran yang Masuk | Akun Login (`Password123!`) | Halaman Awal Sebelum Demo | Peran Utama Saat Demo |
|---|---|---|---|---|
| **Jendela 1** | **Direktur / CEO** *(nanti di akhir boleh ganti Admin)* | `direktur@dutamedia.com` *(Hendra Wijaya)* | `/admin/policies` | Membuka demo dengan menggeser jam cut-off pagi di depan audiens, memantau `Seluruh Perusahaan` (`/dashboard`, `/reports`), dan mengembalikan jam cut-off di akhir demo. |
| **Jendela 2** | **Karyawan Operasional** | `product@dutamedia.com` *(Dio Bayu)* → lanjut `dev.frontend@dutamedia.com` *(Aditya Nugroho)* | `/daily/morning` | Menunjukkan alur harian karyawan: `Prioritas Kemarin Sore`, `Carry-Over`, `Simpan Draf`, Komitmen Pagi, Tugas Tambahan, EOD, `Lapor Blocker` (16 Kategori & 9 Dampak), `Koreksi`, & `Cuti Saya`. |
| **Jendela 3** | **Staf Spesialis Kategori** | `network.infra@dutamedia.com` *(Fakhrizal Asshiddiq)* | `/blockers` | Menunjukkan keajaiban **Penanggung Jawab Kategori (`isCategoryOwner`)**: staf biasa langsung menerima tiket `Server & Rilis Sistem`, klik `Terima & Tangani`, `Beri Bantuan`, dan `Selesaikan`. |
| **Jendela 4** | **Kepala Divisi Engineering** | `head.eng@dutamedia.com` *(Arif Budiman)* | `/dashboard` | Menunjukkan isolasi `Divisi Saya`, tombol `Bantu Unblock` → `Feed Dukungan Lintas Fungsi`, `Radar Risiko Proyek`, `Review Koreksi` (diff visual), `Persetujuan Cuti`, & `Catatan Coaching` (Dibagikan vs Rahasia). |
| **Jendela 5** | **HRGA & Tab Khusus Tamu/Magang** | Tab 1: `hrga@dutamedia.com` *(Dewi Lestari)* <br> Tab 2 (Incognito terpisah): `intern.frontend@dutamedia.com` *(Raka Pratama)* & `/activate` | `/compliance` | Menunjukkan `Antrean Kepatuhan`, `Dispensasi`, `Kelola Pengguna & Undangan 72 Jam`, `Struktur Organisasi` (pengecualian `Intern`), `Reviewer Sementara`, serta tampilan khusus **Anak Magang (`Intern`)**. |

---

## 2. ALUR 8 BABAK DEMO LIVE (BERURUTAN, LOGIS, & SIAP SALIN)

### BABAK 0 — PEMBUKAAN & PENYESUAIAN JAM KERJA TRANSPARAN *(3 Menit · Jendela 1 — Direktur)*

> **Tujuan Babak Ini:** Memberi kesan profesional sejak menit pertama — menunjukkan bahwa aturan jam kerja di WorkPulse **tidak kaku di dalam kode**, melainkan bisa diatur langsung oleh Direktur/Admin dengan jejak audit permanen.

1. **Buka Jendela 1 (`direktur@dutamedia.com`)** di **`/admin/policies`** *(Latihan pagi: ambil **`WP-SS-35`** di sini)*.
2. **Kalimat yang Diucapkan ke Atasan:**
   > *"Bapak/Ibu, sesuai aturan standar kantor, batas pengisian Komitmen Pagi adalah jam 09:00 tepat waktu dan terkunci otomatis jam 09:30 WIB. Karena hari ini kita melakukan demo di atas jam 1 siang, pertama-tama saya tunjukkan salah satu keunggulan sistem ini: Direktur atau Pemilik Kebijakan dapat menyesuaikan jam kerja tanpa perlu mengubah kode program, dan setiap perubahan langsung tercatat di Jejak Audit."*
3. **Aksi di Layar:**
   - Klik tombol **`+ Buat Versi Kebijakan Baru`** di kanan atas.
   - Ubah **`Batas Tepat Waktu Pagi *`** menjadi **`15:00`** dan **`Batas Kunci Pengisian Pagi (Cut-Off) *`** menjadi **`16:00`** *(sesuaikan agar 1–2 jam di depan jam demo Anda)*.
   - Biarkan **`Tanggal Mulai Berlaku *`** pada tanggal hari ini.
   - Ketik **`Alasan Perubahan Kebijakan *`** (siap salin):
     ```text
     Penyesuaian sementara jam batas pagi untuk keperluan demonstrasi live sistem WorkPulse di hadapan manajemen
     ```
   - Klik simpan. Tunjukkan kepada atasan bahwa di bagian bawah tabel **`Jejak Audit Perubahan Kebijakan`**, perubahan barusan langsung tercatat lengkap dengan nama **Hendra Wijaya**, jam WIB, dan alasannya.

---

### BABAK 1 — ALUR UTUH KARYAWAN BARU (HRGA TERBITKAN UNDANGAN → AKTIVASI 72 JAM) & ANAK MAGANG (`INTERN`) *(5 Menit · Jendela 5)*

> **Tujuan Babak Ini:** Menunjukkan alur utuh dari nol: mulai dari HRGA mendaftarkan karyawan baru dan menerbitkan tautan undangan sekali pakai 72 jam, hingga karyawan baru mengaktifkan akunnya sendiri tanpa berbagi kata sandi lewat pesan singkat, serta pembedaan tegas untuk Anak Magang (`Intern`).

1. **Di Jendela 5 — Tab 1 (HRGA — `hrga@dutamedia.com`) pada `/admin/users`:** *(Latihan pagi: ambil **`WP-SS-31`** & **`WP-SS-32`** di sini)*.
   - Klik tombol hijau **`Undang Pengguna Baru`**.
   - Isi formulir pendaftaran calon karyawan baru (siap salin):
     * **Nama Lengkap:** `Budi Santoso`
     * **Email Perusahaan:** `budi.santoso@dutamedia.com`
     * **Peran Dasar:** `Karyawan (EMPLOYEE)`
     * **Divisi:** `Engineering`
     * **Jabatan:** `Backend Engineer`
     * **Status Karyawan:** `Karyawan Tetap`
   - **Kalimat ke Atasan:** *"Saat ada karyawan baru bergabung, HRGA cukup mendaftarkannya di sini tanpa perlu membuatkan atau mengirim kata sandi lewat WhatsApp. Begitu diklik kirim, sistem menerbitkan tautan aktivasi sekali pakai yang berlaku 72 jam."*
   - Klik **`Terbitkan Undangan (72 Jam)`** → pada kotak hasil yang muncul, klik tombol **`Salin Token Aktivasi`** *(tunjukkan bahwa status `Budi Santoso` di tabel sekarang **`Menunggu Aktivasi`**, dan tersedia tombol `Kirim Ulang` maupun `Cabut` bila token perlu dibatalkan & diterbitkan ulang)*.
2. **Pindah ke Jendela 5 — Tab 2 (Incognito / Tamu):**
   - Buka **`/login`** *(Latihan pagi: ambil **`WP-SS-01`**)* → coba masuk dengan `budi.santoso@dutamedia.com` / `Password123!` → tunjukkan pesan penolakan jelas: **`"Akun Anda belum diaktifkan"`**.
   - Klik tab **`Aktivasi Akun`** (`/activate`), lalu **tempel (*Paste*) kode token** yang barusan disalin dari HRGA ke kotak **`Token Aktivasi`** *(Latihan pagi: ambil **`WP-SS-02`** sebelum klik tombol aktivasi)*.
   - Tunjukkan **Kartu Pratinjau Akun** (*Budi Santoso — Engineering — UNDANGAN AKTIF*) + 3 tanda centang keamanan kata sandi yang menyala hijau saat mengetik **`Password123!`**.
   - Klik **`Aktivasi Akun`** → muncul kartu **Aktivasi Berhasil!** dan token tersebut langsung hangus (tidak bisa dipakai dua kali).
   - Klik **`Lanjut ke Halaman Masuk`**, lalu masuk sebagai `budi.santoso@dutamedia.com` / **`Password123!`** untuk membuktikan akun baru langsung aktif dan mendarat di `/daily/morning`, lalu klik **Keluar**.
3. **Masuk sebagai Anak Magang (`intern.frontend@dutamedia.com` — Raka Pratama) di Tab Incognito:**
   - Buka **`/profile`**: tunjukkan pil ungu **`Intern`** dan baris **Tanggal Selesai Magang**.
   - Buka **`/leave/my`** *(Latihan pagi: ambil **`WP-SS-19`**)*: tunjukkan kotak ungu **`Aturan Izin Karyawan Magang`** yang hanya menyediakan 2 pilihan (**`Izin`** dan **`Sakit`**, tanpa jatah Cuti Tahunan 12 hari).

---

### BABAK 2 — RUTINITAS HARIAN KARYAWAN: PAGI → SIANG → SORE *(7 Menit · Jendela 2)*

> **Tujuan Babak Ini:** Membuktikan bahwa WorkPulse sangat cepat (± 2 menit), tidak membebani karyawan, dan jujur menjaga rencana kerja.

1. **Komitmen Pagi dengan Draf Tugas Berlanjut (`product@dutamedia.com` — Dio Bayu Bagaskara):**
   - Buka **`/daily/morning`** *(Latihan pagi: ambil **`WP-SS-04`** & **`WP-SS-05`** sebelum kirim)*.
   - **Tunjuk 3 hal keren di layar:**
     1. Kotak **`Prioritas Kemarin Sore`** di atas formulir.
     2. Klik **`Lihat Draf`** pada **`Draf Tugas Berlanjut dari Kemarin (2 Tersedia)`** → tunjukkan tugas **`Carry-Over #2`** yang otomatis diberi saran **`AMBER`** karena sudah berlanjut 2 hari! Klik **`Gunakan Item Terpilih ke Slot Hari Ini`** agar otomatis masuk ke Slot #1 dan #2.
     3. Tunjukkan tombol **`Simpan Draf`** (tahan refresh) dan opsi **`0 Komitmen Hari Ini`** (untuk hari pelatihan/rapat seharian).
   - Klik **`Kirim Morning Commitment`** → tunjukkan layar langsung berubah menjadi **Kartu Ringkasan Terkunci** (`ON-TIME`) agar rencana pagi tidak diubah diam-diam *(Latihan pagi: ambil **`WP-SS-06`** & **`WP-SS-03`**)*.
2. **Pekerjaan Tambahan Siang Hari (`/daily/additional-work`):**
   - Klik tab **`Additional Work`** *(Latihan pagi: ambil **`WP-SS-07`**)*.
   - Ketik deskripsi (siap salin):
     ```text
     Investigasi kendala timeout pada modul integrasi pembayaran staging bersama tim backend
     ```
   - Pilih alasan **`Penugasan Baru dari Atasan`**, pilih atasan pemberi tugas *(tunjukkan ke atasan bahwa nama anak magang `Raka/Nisa` tidak muncul di daftar atasan!)*.
   - Klik **`Tambahkan Pekerjaan`** → tunjukkan tombol **`Edit`** dan **`Hapus`** yang masih bisa dipakai sebelum Evaluasi Sore ditutup.
3. **Evaluasi Sore (`/daily/eod`) & Riwayat Saya (`/daily/history`):**
   - Klik tab **`EOD Outcome`** *(Latihan pagi: ambil **`WP-SS-08`** sebelum kirim, lalu **`WP-SS-09`** sesudah kirim)*.
   - Tandai Slot #1 **`Selesai Penuh`**, Slot #2 **`Selesai Sebagian`** → **`Lanjutkan Besok`**, tulis catatan progres:
     ```text
     Komponen antarmuka sudah tuntas 80%, sisa pengujian akhir bersama QA dilanjutkan besok pagi
     ```
   - Isi **`Prioritas Utama Besok`**:
     ```text
     Menuntaskan pengujian integrasi staging dan rilis patch ke lingkungan uji klien
     ```
   - Klik **`Kirim Evaluasi EOD`**. Lalu klik sebentar kembali ke `/daily/additional-work` untuk memperlihatkan bahwa formulir tugas tambahan kini **otomatis terkunci (`Terkunci Pasca-EOD`)**.
   - Buka **`Riwayat Saya`** (`/daily/history`) *(Latihan pagi: ambil **`WP-SS-10`**)* → klik 1 baris tanggal untuk membuka rinciannya (*expand*) dan tunjukkan tombol **`Unduh CSV`**.

---

### BABAK 3 — KEAJAIBAN BLOCKER LINTAS JENDELA: 16 KATEGORI, 9 DAMPAK, & PENANGANAN REAL-TIME *(8 Menit · Jendela 2 → Jendela 3 → Jendela 4 → Jendela 1)*

> **Tujuan Babak Ini:** Ini adalah **puncak demo yang paling memukau para atasan** — satu tiket kendala langsung menggerakkan 4 jendela sekaligus secara otomatis!

1. **Jendela 2 (Karyawan — `/raise-blockers`):** *(Latihan pagi: ambil **`WP-SS-11`** sebelum kirim, lalu **`WP-SS-12`** sesudah kirim)*.
   - Isi formulir **Buat Laporan Blocker** (siap salin):
     * **Judul Kendala:** `Server Staging Pembayaran Mengalami Connection Timeout Berulang`
     * **Kategori Kendala:** Pilih **`1. Teknis & Sistem` → `Server & Rilis Sistem`** *(tunjukkan pengelompokan 16 Kategori dalam 5 grup)*.
     * **Dampak Kendala:** Centang 2 kotak: **`Layanan Langsung Pengguna`** dan **`Target & Tenggat Waktu`** *(coba centang kotak ke-3 agar atasan melihat batas maksimal 3 dampak otomatis mengunci sisanya, lalu lepas ke 2 kotak)*.
     * **Tingkat Keparahan:** Pilih **`High (Target 4 jam)`**.
     * **Deskripsi:**
       ```text
       Sejak pukul 13:00 WIB aplikasi staging tidak dapat terhubung ke database PostgreSQL. Restart layanan lokal sudah dicoba namun koneksi pool tetap penuh sehingga tim belum bisa melanjutkan pengujian rilis.
       ```
   - **Tunjuk Panel Jalur Penanganan Otomatis di bawah:** *"Lihat Bapak/Ibu, sebelum tombol kirim ditekan pun, sistem sudah otomatis menunjuk penanggung jawab resminya: **Fakhrizal Asshiddiq** (Network & Infrastructure), bukan menumpuk semua masalah ke atasan."*
   - Klik **`Kirim Laporan Blocker`**.
2. **Pindah ke Jendela 3 (`network.infra@dutamedia.com` — Fakhrizal Asshiddiq di `/blockers`):**
   - Muat ulang ringan — tiket barusan langsung masuk di urutan paling atas bertanda **`Tugas Anda`** lengkap dengan hitung mundur **`Sisa Waktu`** dan keterangan Kategori & 2 Dampak dalam Bahasa Indonesia utuh *(tanpa singkatan kode kaku)*.
   - Klik **`Terima & Tangani`** → status langsung berubah menjadi **`Sedang Ditangani`**.
   - Klik **`Beri Bantuan`** *(Latihan pagi: ambil **`WP-SS-22`**)*, ketik tindakan (siap salin):
     ```text
     Menambah kapasitas koneksi pool database staging dan merestart worker container
     ```
     Catatan progres:
     ```text
     Koneksi database sudah kembali normal di bawah 40ms, silakan dicoba ulang pengujiannya
     ```
     Klik simpan.
   - Lalu klik **`Selesaikan`**, ketik solusi (siap salin):
     ```text
     Konfigurasi batas koneksi database staging telah diperbesar permanen dan diuji stabil selama pengujian beban
     ```
     Klik **`Kirim Solusi`** → status menjadi **`Solusi Diberikan`**.
3. **Kembali ke Jendela 2 (Karyawan — tab `Blocker Saya`):**
   - Tunjukkan notifikasi masuk di lonceng kanan atas *(Latihan pagi: ambil **`WP-SS-16`** di `/notifications`)*.
   - Buka **`Blocker Saya`**, tunjukkan pelapor memegang kendali verifikasi akhir: klik **`Konfirmasi & Tutup Tiket`** → tiket resmi **`Selesai Ditutup`**.

---

### BABAK 4 — KOREKSI LAPORAN & CUTI (KARYAWAN → KEPALA DIVISI) *(5 Menit · Jendela 2 → Jendela 4)*

1. **Jendela 2 (Ganti sebentar ke `dev.frontend@dutamedia.com` — Aditya Nugroho):**
   - Buka **`/corrections/morning`** *(Latihan pagi: ambil **`WP-SS-14`**)* → ajukan 1 **Koreksi Material** pada komitmen terkunci dengan alasan:
     ```text
     Menyesuaikan prioritas tugas hari ini mengikuti perubahan jadwal demo integrasi klien
     ```
     Klik **`Kirim Permohonan Koreksi`**. *(Juga buka sebentar `/corrections/eod` untuk **`WP-SS-15`**, `/leave/my` untuk **`WP-SS-13`**, `/profile` untuk **`WP-SS-17`**, dan ketik `/admin/policies` untuk **`WP-SS-18`** saat latihan pagi).*
2. **Pindah ke Jendela 4 (`head.eng@dutamedia.com` — Arif Budiman):**
   - Buka **`/corrections/review`** *(Latihan pagi: ambil **`WP-SS-26`**)* → tunjukkan **kotak perbandingan visual Sebelum (merah) vs Diajukan (hijau)**! Klik **`Setujui`**, tulis catatan `Disetujui sesuai penyesuaian jadwal demo klien`, lalu klik **`Konfirmasi Setujui`**.
   - Buka **`/leave/queue`** *(Latihan pagi: ambil **`WP-SS-25`**)* → tunjukkan hitungan otomatis **hari kerja Senin–Jumat** (Sabtu–Minggu tidak memotong jatah cuti) serta modal persetujuan/penolakan.

---

### BABAK 5 — DASHBOARD PIMPINAN, RADAR PROYEK, COACHING, & LAPORAN EKSEKUTIF *(6 Menit · Jendela 4 & Jendela 1)*

1. **Jendela 4 (`head.eng@dutamedia.com` — Kepala Divisi):**
   - Buka **`/dashboard`** *(Latihan pagi: ambil **`WP-SS-20`**)* → tunjukkan cakupan terkunci **`Divisi Saya`** (isolasi aman antar divisi), tombol **`Bantu Unblock`** yang langsung melompat ke `/blockers`, dan **`Feed Dukungan Lintas Fungsi`** yang menampilkan bantuan Fakhrizal barusan!
   - Buka **`/blockers`** *(**`WP-SS-21`**)* & **`/blockers/aging`** *(**`WP-SS-23`**)* → tunjukkan radar tiket yang melewati batas waktu.
   - Buka **`/projects/risk`** *(**`WP-SS-24`**)* → klik **`Rincian`** pada `WP-CORE` untuk melihat skor kesehatan proyek.
   - Buka **`/coaching`** *(**`WP-SS-27`**)* → pilih `Aditya Nugroho`, tunjukkan 2 pilihan kerahasiaan (**`Dibagikan ke Karyawan`** vs **`Rahasia Manajemen`**) dan klik tombol cepat **`Bimbingan 1-on-1`**.
   - Buka **`/reports`** *(**`WP-SS-28`**)* → tunjukkan pilihan periode, filter **`Status Karyawan`**, dan tombol **`Unduh Laporan (CSV)`** + **`Cetak / PDF`**.
2. **Jendela 1 (`direktur@dutamedia.com` — Direktur / CEO):**
   - Buka **`/dashboard`** → tunjukkan cakupan **`Seluruh Perusahaan` (25 personil: 23 Karyawan Tetap + 2 Intern)** dan filter **`Status Karyawan`** untuk memisahkan kepatuhan Karyawan Tetap dari Anak Magang.

---

### BABAK 6 — KEPATUHAN HRGA, DISPENSASI, ORGANISASI, & REVIEWER SEMENTARA *(5 Menit · Jendela 5 — Dewi Lestari)*

1. **Antrean Kepatuhan (`/compliance`)** *(Latihan pagi: ambil **`WP-SS-29`**)*:
   - Tunjukkan 4 kartu jenjang kepatuhan (*non-punitif*), klik **`Tindak Lanjut`** pada 1 baris `Belum Ditangani`, isi catatan pembinaan (min. 5 karakter) → status berubah menjadi **`Sudah Ditangani`** dan tombol berganti menjadi **`Ubah Catatan`**.
2. **Manajemen Dispensasi (`/exemptions`)** *(Latihan pagi: ambil **`WP-SS-30`**)*:
   - Tunjukkan cara HRGA menerbitkan dispensasi resmi `Dinas Luar` dengan nomor surat tugas agar karyawan dinas luar tidak dicatat mangkir.
3. **Kelola Pengguna & Undangan (`/admin/users` & `/admin/invitations`)** *(Latihan pagi: ambil **`WP-SS-31`** & **`WP-SS-32`**)*:
   - Tunjukkan daftar 25 akun (terlihat pil ungu `Intern`), tombol **`Undang Pengguna Baru`**, dan tombol **`Nonaktifkan`** (langsung memutus sesi aktif).
4. **Struktur Organisasi (`/admin/organization`)** *(Latihan pagi: ambil **`WP-SS-33`**)*:
   - Tunjukkan **Tab 1 (`Struktur & Penugasan Karyawan`)** — termasuk pengecualian `Intern` dari pilihan atasan dan pelindung anti-lingkaran atasan — serta **Tab 2 (`Kewenangan Proyek`)** dengan tombol **`Tutup Wewenang`**.
5. **Reviewer Sementara (`/admin/temporary-reviewers`)** *(Latihan pagi: ambil **`WP-SS-34`**)*:
   - Tunjukkan cara mendelegasikan wewenang persetujuan cuti/koreksi saat Kepala Divisi sedang cuti/dinas luar.

---

### BABAK 7 — SALURAN NOTIFIKASI & PENUTUPAN DEMO (KEMBALIKAN JAM CUT-OFF) *(2 Menit · Jendela 1 — Admin/Direktur)*

1. **Buka `/admin/notifications`** *(Latihan pagi: ambil **`WP-SS-36`**)*:
   - Tunjukkan status jujur 3 saluran (**`In-App`**, **`Email`**, **`Browser Push`** — menampilkan **`Mode Simulasi Aktif`** bila kunci layanan luar belum dipasang), tabel **9 Pemicu Resmi**, dan tombol **`Kirim Notifikasi Uji Coba`**.
2. **Kembalikan Jam Batas Pagi di `/admin/policies`:**
   - Klik **`+ Buat Versi Kebijakan Baru`** → kembalikan **`Batas Tepat Waktu Pagi`** ke **`09:00`** dan **`Batas Kunci Pengisian Pagi (Cut-Off)`** ke **`09:30`**, alasan:
     ```text
     Mengembalikan jam batas pengisian pagi ke jadwal kerja resmi perusahaan setelah demonstrasi selesai
     ```
   - **Kalimat Penutup ke Atasan:** *"Seluruh jam kerja sudah kembali ke standar resmi 09:00 dan 09:30 WIB, dan seluruh proses hari ini tercatat rapi di Jejak Audit. Terima kasih Bapak/Ibu, silakan jika ada pertanyaan atau skenario yang ingin langsung kita uji bersama."*

---

## 3. DAFTAR PERIKSA RESET DATA BERSIH (CARA 1: SETELAH LATIHAN PAGI, SEBELUM JAM 1 SIANG)

Setelah Anda selesai latihan pagi & mengambil 36 gambar (sekitar pukul `12:00 – 12:30 WIB`), lakukan langkah ini agar data aplikasi live kembali **100% segar** sebelum demo jam `13:00 WIB`:

- [ ] **Langkah 1 — Jalankan Ulang Pengisian Data Awal (`seed`):** Hubungi/minta bantuan untuk mereset data uji harian & menjalankan ulang `seed.ts` pada database target demo (agar Komitmen Pagi, Evaluasi Sore, Blocker baru, Koreksi, Cuti, dan Token Aktivasi `Fajar Ramadhan` kembali ke kondisi awal).
- [ ] **Langkah 2 — Bersihkan Draf Lokal Browser:** Di Jendela 2 (`/daily/morning`), jika sebelumnya menekan `Simpan Draf`, klik **`Reset Draf`** (atau bersihkan *Local Storage*) agar formulir pagi tampil bersih.
- [ ] **Langkah 3 — Cek Login 5 Jendela Browser:** Pastikan kelima jendela sudah terbuka di halaman awalnya masing-masing dan tidak ada tab lain yang mengganggu.
- [ ] **Langkah 4 — Matikan Notifikasi Pribadi di Laptop:** Aktifkan mode *Do Not Disturb / Focus Assist* di Windows sebelum membagikan layar (*Share Screen* / colok proyektor).
