# SKRIP DEMO LIVE KOMPREHENSIF MULTI-JENDELA — WORKPULSE (100% SEMUA ALUR & KONDISI)
# PANDUAN LATIHAN PAGI & PRESENTASI RESMI DI HADAPAN PIMPINAN PERUSAHAAN

**PT Dutamedia Mandiri Pratama — Malang (WIB)**  
**Alamat Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Kata Sandi Semua Akun Uji:** `Password123!`  
**Cakupan Skrip Ini:** **100% Seluruh 8 Journey, Seluruh 50 Cerita Pengguna (`US-01` s/d `US-50`), Seluruh Pagar Pengaman, dan Seluruh 36 Gambar Panduan (`WP-SS-01` s/d `WP-SS-36`)** — didukung penuh oleh data awal (`seed.ts`) tanpa satu pun halaman kosong!

---

## 1. MATRIKS PERSIAPAN DATA DUMMY (`seed.ts` — WAJIB DI-RESET BERSIH HARI-H)

Setelah reset bersih + `prisma db seed` dijalankan hari ini, seluruh data berikut **otomatis tersedia dan sinkron dengan tanggal hari ini**:

| Elemen Data Dummy di Database Live | Akun / Objek Terkait | Fitur yang Langsung Terbukti di Layar Saat Demo |
|---|---|---|
| **25 Akun Resmi** (`23 Tetap + 2 Intern`) | Termasuk `Fajar Ramadhan` (`INVITED`), `Raka Pratama` & `Nisa Amelia` (`Intern`) | Direktori `/admin/users`, filter `Status Karyawan`, & pengecualian `Intern` dari 7 jabatan keputusan. |
| **Rantai `H-2 → H-1` Lengkap** | `product@dutamedia.com` *(Dio Bayu)* | Langsung muncul **`Prioritas Kemarin Sore`** + **`Draf Tugas Berlanjut dari Kemarin (2 Tersedia: Carry-Over #2 AMBER & #1 GREEN)`**. |
| **Formulir Pagi Kosong Siap Pakai** | `qa@dutamedia.com` *(Nadia Kusuma)* & `intern.frontend@dutamedia.com` *(Raka)* | Khusus demo kirim **`0 Komitmen Hari Ini`** sampai tuntas (`qa`) dan laporan kerja **Anak Magang** (`Raka`, juga punya 1 Carry-Over). |
| **Komitmen Pagi Hari Ini Terkunci + `H-1`** | `dev.frontend@dutamedia.com` *(Aditya Nugroho)* | Langsung tampil Kartu Ringkasan Terkunci (`ON-TIME`) + `Prioritas Kemarin Sore`, siap langsung untuk **Koreksi Pagi**, **EOD**, & **Riwayat**. |
| **Cuti Resmi `APPROVED` Hari Ini** | `specialist.it@dutamedia.com` *(Achmad Noer — PIC `HOSTING_DOMAIN`)* | Sekaligus membuktikan **2 fitur**: (1) **Spanduk Hijau Bebas Check-In**, dan (2) **Aturan Cuti Vertikal Blocker** (`HOSTING_DOMAIN` otomatis naik ke `Gunawan Setiawan`!). |
| **6 Tiket Blocker Lintas Kategori + 1 Tiket `CRITICAL` Lewat Batas Waktu** | `WP-CORE` (`targetResolutionAt = -2 jam`), `NETWORK`, `OFFICE_FACILITY`, `CLIENT`, `APPROVAL`, `CROSS_TEAM` | `/blockers/aging` langsung menyala **`Lewat Batas Waktu: 1`**, `/projects/risk` menyorot risiko `WP-CORE`, dan tombol **`Bantu Unblock`** langsung aktif! |
| **3 Pengajuan Cuti/Izin `PENDING`** | `Siti Rahma` (`ANNUAL`), `Maya Putri` (`ANNUAL`), & **`Raka Pratama` (`PERMIT` — pil ungu `Intern`)** | `/leave/queue` Kepala Divisi Engineering langsung menampilkan Cuti Tahunan Karyawan Tetap **berdampingan** dengan Izin Anak Magang (`Intern`). |
| **2 Peristiwa Kepatuhan HRGA** | `Siti Rahma` (`PATTERN_FLAG_3X` — **`OPEN`**) & `Nadia Kusuma` (`NO_SUBMISSION` — **`ADDRESSED`**) | `/compliance` langsung membuktikan tombol **`Tindak Lanjut`** (baris `OPEN`) sekaligus tombol **`Ubah Catatan`** (baris `ADDRESSED`). |
| **2 Catatan Coaching Awal (2 Mode)** | `Aditya Nugroho` oleh `Arif Budiman` (**`Dibagikan ke Karyawan`** vs **`Rahasia Manajemen`**) | `/coaching` & `/notifications` langsung membuktikan catatan `Dibagikan` masuk ke akun karyawan, sementara `Rahasia Manajemen` 100% tersembunyi! |
| **1 Dispensasi Resmi Aktif** | `Hari Wibowo` (`DINAS_LUAR`, `ST/HRGA/2026/XI/104`, `H+2 s/d H+3`) | Panel kanan `/exemptions` langsung terisi tabel dispensasi aktif + tombol **`Cabut`**! |
| **5 Kebijakan Standar (`09:00 / 09:30 WIB`)** | Pemilik Kebijakan: Direktur, Admin, HRGA | **Babak 2A** membuktikan formulir pagi benar-benar `LOCKED` lewat `09:30 WIB`, lalu digeser live di depan atasan! |

---

## 2. STRATEGI 6 JENDELA BROWSER (TANPA BOLAK-BALIK LOGIN-LOGOUT)

Siapkan 6 jendela browser (pakai profil Chrome berbeda / Edge / Firefox / Incognito) **15 menit sebelum demo**:

| Jendela | Peran & Akun Login (`Password123!`) | Halaman Awal | Dipakai di Babak |
|---|---|---|---|
| **Jendela 1** | **Direktur / CEO** — `direktur@dutamedia.com` *(Hendra Wijaya)* *(nanti di Babak 1 & 8 juga cek `admin@dutamedia.com`)* | `/admin/policies` | Babak 2, 7, 8, 9 |
| **Jendela 2** | **Karyawan Utama** — Tab 1: `product@dutamedia.com` *(Dio Bayu)*; nanti ganti `dev.frontend@dutamedia.com` *(Aditya)* & `qa@dutamedia.com` *(Nadia)* | `/daily/morning` | Babak 2, 3, 4, 5, 7 |
| **Jendela 3** | **Spesialis Kategori (`isCategoryOwner`)** — `network.infra@dutamedia.com` *(Fakhrizal Asshiddiq)* | `/blockers` | Babak 3 |
| **Jendela 4** | **Kepala Divisi Engineering** — `head.eng@dutamedia.com` *(Arif Budiman)* *(juga cek `lead.tech@dutamedia.com` di Babak 7)* | `/dashboard` | Babak 3, 4, 5, 6, 7 |
| **Jendela 5** | **HRGA** — `hrga@dutamedia.com` *(Dewi Lestari)* | `/admin/users` | Babak 1, 6, 8 |
| **Jendela 6 (Incognito)** | **Tamu / Karyawan Baru / Anak Magang / Cuti / Reviewer Sementara** | `/login` | Babak 1 (`Budi`), Babak 2 (`Nadia`, `Achmad Noer`), Babak 5 (`Raka`), Babak 8 (`Rian Kurniawan`) |

---

## 3. ALUR 9 BABAK DEMO LIVE — 100% SEMUA FLOW & KONDISI (SIAP SALIN)

---

### BABAK 1 — PEMBUKAAN: UNDANGAN 72 JAM, CABUT & KIRIM ULANG, TOKEN MURNI, AKTIVASI, LOGIN, PROFIL, 403/404, & PEMISAHAN TUGAS ADMIN *(6 Menit · Jendela 5 → Jendela 6)*

> **Mulai dari pintu depan sistem:** Tunjukkan bagaimana karyawan baru bergabung, mengaktifkan akun dengan aman, hingga berhasil masuk ke layar kerja.

1. **Jendela 5 (HRGA — `/admin/users` & `/admin/invitations`)** *(Ambil **`WP-SS-31`** & **`WP-SS-32`**)*:
   - Klik **`Undang Pengguna Baru`** → isi data calon karyawan baru (siap salin):
     * **Nama Lengkap:** `Budi Santoso` | **Email:** `budi.santoso@dutamedia.com` | **Status:** `Karyawan Tetap` | **Peran:** `Karyawan` | **Divisi:** `Engineering` | **Jabatan:** `Backend Engineer`
   - Klik **`Terbitkan Undangan (72 Jam)`** → tunjukkan kotak hasil yang menampilkan **kode token murni** + tombol **`Salin Token Aktivasi`** → klik **`Selesai`**.
   - **Demo Cabut & Kirim Ulang Token:** Pada baris `Budi Santoso` (`Menunggu Aktivasi`), klik **`Cabut`** (tunjukkan bila token salah kirim/bocor, status undangan langsung **`Dicabut`**) → lalu klik **`Kirim Ulang`** untuk menerbitkan token baru yang sah → klik **`Salin Token Aktivasi`**.
2. **Jendela 6 (Incognito — `/login` & `/activate`)** *(Ambil **`WP-SS-01`** & **`WP-SS-02`**)*:
   - Di **`/login`**: coba masuk `budi.santoso@dutamedia.com` / `Password123!` → ditolak jelas **`"Akun Anda belum diaktifkan"`**. Tunjukkan juga tombol ikon mata, centang `Ingat email di perangkat ini`, dan jelaskan kunci hitung mundur sementara (`429`) jika 5x salah sandi + prosedur lupa sandi hubungi HRGA/Admin.
   - Klik tab **`Aktivasi Akun`** (`/activate`) → tempel kode token murni dari HRGA ke kotak **`Token Aktivasi`** → langsung muncul **Kartu Pratinjau Akun (`Budi Santoso — UNDANGAN AKTIF`)**.
   - Ketik sandi baru **`Password123!`** & konfirmasi **`Password123!`** (tunjukkan 3 syarat centang hijau menyala) → klik **`Aktivasi Akun`** → kartu **Aktivasi Berhasil!** → klik **`Lanjut ke Halaman Masuk`** → masuk `budi.santoso@dutamedia.com` / **`Password123!`** → mendarat otomatis di `/daily/morning`!
   - **Uji Layar `403` & `404`:** Ketik manual `/admin/policies` di address bar → dicegat ke **`403 — Akses Dibatasi`** *(Ambil **`WP-SS-18`**)* → ketik `/halaman-asal` → muncul **`404 — Halaman Tidak Ditemukan`**.
   - **Uji Profil & Ganti Kata Sandi (`/profile`)** *(Ambil **`WP-SS-17`**)*: Tunjukkan Panel 1 (identitas & atasan), Panel 2 (ganti sandi mandiri + centang *Akhiri seluruh sesi di perangkat lain*), dan Panel 3 (notifikasi perangkat) → klik **Keluar**.
3. **Pemisahan Tugas Admin (`admin@dutamedia.com`):** Jelaskan (atau login sekilas di Jendela 6) bahwa akun `SYSTEM_ADMIN` tidak punya menu `Workspace` dan bila mengetik `/daily/morning` langsung diblokir **`403`** agar data kinerja murni berisi personel kerja.

---

### BABAK 2 — KUNCI OTOMATIS PAGI (`LOCKED`), GESER JAM KERJA TRANSPARAN, & SIKLUS LENGKAP HARIAN (`PAGI`, `0 KOMITMEN`, `CUTI RESMI`, `TUGAS TAMBAHAN`, `EOD`, & `RIWAYAT`) *(10 Menit · Jendela 2 ↔ Jendela 1 ↔ Jendela 6)*

1. **2A — Transisi Alami dari Login: Pembuktian Kunci Otomatis (`LOCKED`), Opsi A (`Komitmen Pagi Terlewat`), & Geser Jam Batas Pagi (`Jendela 2 → Jendela 1 → Jendela 2`):**
   - Buka **Jendela 2 (`product@dutamedia.com`) di `/daily/morning`**: tunjukkan bahwa karena jam demo sudah melewati **`09:30 WIB`**, formulir Komitmen Pagi **otomatis terkunci (`LOCKED`)** dengan spanduk merah agar karyawan tidak bisa mengisi mundur.
   - Klik tab **`Additional Work`** (`/daily/additional-work`) — tunjukkan **Opsi A (`Komitmen Pagi Terlewat`)**: meskipun pagi terkunci, karyawan yang lupa isi pagi tetap bisa mencatat pekerjaan siang/sore secara jujur (sementara status pagi tetap tercatat belum lapor).
   - **Pindah ke Jendela 1 (`direktur@dutamedia.com`) di `/admin/policies`** *(Ambil **`WP-SS-35`**)*:
     * **Kalimat ke Atasan:** *"Supaya kita bisa langsung mempraktikkan pengisian Komitmen Pagi hari ini di hadapan Bapak/Ibu, saya tunjukkan bahwa Direktur/Pemilik Kebijakan dapat menggeser jam batas pagi sementara langsung dari sistem tanpa ubah kode, dan tercatat otomatis di Jejak Audit."*
     * Klik **`+ Buat Versi Kebijakan Baru`** → ubah **`Batas Tepat Waktu Pagi *`** ke **`15:00`** (latihan pagi: `12:00`) dan **`Batas Kunci Pengisian Pagi (Cut-Off) *`** ke **`16:00`** (latihan pagi: `12:30`), isi alasan (siap salin):
       ```text
       Penyesuaian sementara jam batas pagi untuk keperluan demonstrasi live sistem WorkPulse di hadapan manajemen
       ```
     * Klik simpan → tunjukkan perubahan langsung tercatat di **`Jejak Audit Perubahan Kebijakan`**.
   - **Refresh Jendela 2 (`product@dutamedia.com`):** Formulir Komitmen Pagi **seketika terbuka (`ON-TIME`)**!
2. **2B — Kirim `0 Komitmen Hari Ini` Sampai Tuntas (`qa@dutamedia.com` di Jendela 6 → `/daily/morning`)** *(Ambil **`WP-SS-05`**)*:
   - *(Sesuai urutan tampilan layar dari atas ke bawah: jelaskan bagian paling atas kotak centang **`0 Komitmen`** terlebih dahulu — untuk hari pelatihan internal, rapat seharian, onboarding, atau audit agar karyawan tidak mengarang tugas palsu, sejalan dengan PRD asli atasan "maksimum 3 item" & `DEC-004`).*
   - Centang **`Hari ini tidak ada komitmen harian khusus (0 Komitmen)`** → isi alasan resmi (siap salin):
     ```text
     Mengikuti pelatihan sertifikasi pengujian otomatis dan audit mutu internal seharian penuh bersama tim HRGA
     ```
   - Klik **`Kirim Morning Commitment`** → tampil kartu hijau **`Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)`**! Keluar dari `qa`.
3. **2C — Komitmen Pagi Lengkap dengan `Prioritas Kemarin Sore`, `Carry-Over`, `Simpan Draf`, Validasi, & Picker Blocker (`product@dutamedia.com` di Jendela 2 → `/daily/morning`)** *(Ambil **`WP-SS-03`** & **`WP-SS-04`**)*:
   - Tunjukkan kotak **`Prioritas Kemarin Sore`** & contoh kalimat panduan otomatis khusus divisi Delivery.
   - Klik **`Lihat Draf`** pada **`Draf Tugas Berlanjut dari Kemarin (2 Tersedia)`** → tunjukkan **`Carry-Over #2`** yang otomatis disarankan **`AMBER`** + terisi catatan potensi kendala dari kemarin! Centang keduanya → klik **`Gunakan Item Terpilih ke Slot Hari Ini`**.
   - Tambah **Slot #3** (tunjukkan batas maks. 3 slot):
     * **Deskripsi:** `Review usulan desain fitur ekspor laporan eksekutif`
     * **Proyek Terkait:** Pilih **`[WP-CORE]`** *(tunjukkan bahwa komitmen proyek selalu dikaitkan ke kode proyek resmi agar terpantau di Radar Risiko Proyek)*
     * **Tingkat Risiko:** Pilih **`RED`** → tunjukkan wajib isi **`Potensi Kendala / Hambatan *`** (contoh siap salin: `Format kolom laporan belum disetujui tim Finance dan menunggu konfirmasi Head Delivery`) & tunjukkan beda tombol **`Pilih Blocker Aktif`** (tugas untuk membereskan tiket) vs **`Tiket Blocker Penyebab`** (tugas terhambat tiket). *(Setelah menunjukkan validasi & batas 3 slot, boleh langsung ikut dikirim sebagai 3 komitmen penuh atau kosongkan Slot #3 bila ingin fokus 2 komitmen)*.
   - Klik **`Simpan Draf`** → muat ulang (`F5`) untuk membuktikan ketikan aman tersimpan di browser!
   - Klik **`Kirim Morning Commitment`** → layar terkunci rapi (**`ON-TIME`**) + tombol **`Ajukan Koreksi Komitmen Pagi`** *(Ambil **`WP-SS-06`**)*.
4. **2D — Pembuktian Karyawan Sedang Cuti Resmi Disetujui (`specialist.it@dutamedia.com` — Achmad Noer di Jendela 6):**
   - Masuk sebagai `specialist.it@dutamedia.com` → langsung tampil **Spanduk Hijau `Masa Cuti Resmi Disetujui`** di `/daily/morning` (bebas Komitmen Pagi, Tugas Tambahan, & EOD!). Keluar.
5. **2E — Pekerjaan Tambahan Siang Hari: Tambah, `Edit`, & `Hapus` (`product@dutamedia.com` di Jendela 2 → `/daily/additional-work`)** *(Ambil **`WP-SS-07`**)*:
   - Tambah Tugas Tambahan #1 (siap salin): `Investigasi timeout modul pembayaran staging bersama tim backend`, alasan **`Penugasan Baru dari Atasan`**, pilih atasan *(tunjukkan nama anak magang `Raka/Nisa` tidak muncul!)* → klik **`Tambahkan Pekerjaan`**.
   - Tambah Tugas Tambahan #2 singkat: `Bantu verifikasi data uji sementara`, lalu demonstrasikan klik **`Edit`** (simpan perubahan) dan klik **`Hapus`** (tunjukkan wajib mengisi alasan penghapusan min. 5 huruf: `Sudah digabungkan ke tugas utama #1` + atasan penugas otomatis menerima notifikasi).
6. **2F — Evaluasi Sore (`/daily/eod`), Hak Pilih `GREEN` (`DEC-003`), & Penguncian Pasca-EOD (`product@dutamedia.com`)** *(Ambil **`WP-SS-08`** & **`WP-SS-09`**)*:
   - Evaluasi semua tugas:
     * Slot #1 **`Selesai`**: tuntas 100%.
     * Slot #2 **`Sebagian`** → pilih **`Lanjutkan Besok (Tugas Berlanjut)`** (tunjukkan bahwa **Catatan Kelanjutan bersifat opsional**, misal isi: `Menunggu konfirmasi akhir tim Finance besok pagi`), dan tunjukkan bila memilih **`Tidak Dilanjutkan`** maka **wajib mengisi `Alasan Tidak Dilanjutkan *`** agar atasan tahu mengapa tugas yang belum selesai dihentikan.
     * Tugas Tambahan **`Dibatalkan`** → wajib isi **`Alasan Pembatalan *`** (`Sudah ditangani tim infrastruktur langsung`).
   - Tunjukkan pilihan **`Status Akhir Hari: GREEN`** tetap bisa diklik (`DEC-003`: sistem tidak memaksa status Merah/Kuning).
   - Isi **`Prioritas Utama Besok`**: `Finalisasi uji terima klien PRJ-PORTAL sebelum pukul 14:00 WIB`.
   - Klik **`Kirim Evaluasi EOD`** → kembali sebentar ke tab **`Additional Work`** untuk membuktikan formulir kini otomatis **`Terkunci Pasca-EOD`** (sedangkan tautan **`Lapor Blocker`** tetap buka 24 jam!).
7. **2G — Riwayat Saya (`/daily/history`)** *(Ambil **`WP-SS-10`**)*:
   - Tunjukkan 4 kartu KPI, klik 1 baris tanggal agar rinciannya terbuka (*expand*), lalu klik **`Unduh CSV`**.

---

### BABAK 3 — SIKLUS LENGKAP BLOCKER: 16 KATEGORI, 9 DAMPAK, CUTI VERTIKAL, ANTI-SELF-ROUTING, KOLABORASI 4 JENDELA, DYNAMIC RE-ROUTING, TERIMA RISIKO, HAPUS, & AGING *(10 Menit · Jendela 2 ↔ Jendela 3 ↔ Jendela 4)*

1. **3A — Pratinjau Pengarahan Cerdas & Aturan Cuti Vertikal (`dev.frontend@dutamedia.com` di Jendela 2 → `/raise-blockers`)** *(Ambil **`WP-SS-11`** & **`WP-SS-12`**)*:
   - **Tunjukkan Aturan Cuti Vertikal (`DEC-014` & `DEC-017`):** Pada dropdown Kategori, pilih dulu **`1. Teknis & Sistem` → `Hosting, Cloud & Domain`** → tunjuk **Panel Jalur Penanganan Otomatis**: karena `Achmad Noer` (PIC resminya) sedang **Cuti Resmi hari ini**, sistem otomatis menaikkannya ke atasan langsungnya (**`Gunawan Setiawan` — Head of Ops & Infra**)!
   - Sekarang ubah kategori untuk membuat tiket demo utama (siap salin):
     * **Judul:** `Server Staging Pembayaran Mengalami Connection Timeout Berulang`
     * **Kategori:** **`Server & Rilis Sistem` (`INFRA`)** → Panel Jalur Otomatis langsung menunjuk staf spesialis **`Fakhrizal Asshiddiq`**.
     * **Dampak:** Centang 3 kotak lalu tunjukkan 6 kotak lainnya otomatis terkunci (*batas 1–3 dari 9 dampak*), lalu sisakan 2 kotak: **`Layanan Langsung Pengguna`** & **`Target & Tenggat Waktu`**.
     * **Keparahan:** **`High (Target 4 jam)`**.
     * **Deskripsi:** `Sejak pukul 13:00 WIB aplikasi staging tidak dapat terhubung ke database PostgreSQL. Restart layanan lokal sudah dicoba namun koneksi pool tetap penuh.`
   - Klik **`Kirim Laporan Blocker`** → muncul Kartu Konfirmasi Tiket Terbit!
2. **3A-2 — Lapor Blocker Dulu Sebelum Komitmen Pagi → Tautkan ke `Tiket Blocker Penyebab` (`intern.frontend@dutamedia.com` — Raka Pratama di Jendela 6):**
   - **Kalimat ke Atasan:** *"Bagaimana jika karyawan datang pagi-pagi langsung ketemu kendala sebelum sempat mengisi Komitmen Pagi? Di WorkPulse, Lapor Blocker bisa dibuat lebih dulu, lalu saat mengisi Komitmen Pagi tiket tersebut langsung bisa dikaitkan sebagai penyebab risiko."*
   - Di Jendela 6, masuk sebagai **`intern.frontend@dutamedia.com`** *(Komitmen Pagi hari ini belum dikirim)* → buka **`/raise-blockers`** → buat tiket cepat (siap salin):
     * **Judul:** `Monitor eksternal di meja kerja kedip-kedip dan kabel HDMI longgar`
     * **Kategori:** **`2. Kantor & Perangkat` → `Perangkat Kerja` (`WORK_DEVICE`)** *(otomatis mengarah ke **`Rahian M. Suari` — IT Support**)*
     * **Dampak:** Centang **`Tugas Pribadi`** | **Keparahan:** **`Medium (Target 8 jam)`**
     * **Deskripsi:** `Layar monitor kedua di meja kerja sering padam mendadak sejak pagi sehingga menyulitkan pemeriksaan tampilan responsif.`
     * Klik **`Kirim Laporan Blocker`**.
   - Langsung klik menu **`My Today`** (`/daily/morning`) pada akun Raka → klik **`Lihat Draf`** pada `Draf Tugas Berlanjut dari Kemarin (1 Tersedia)` → salin ke Slot #1 → ubah tingkat risiko menjadi **`AMBER`** (atau **`RED`**) → isi potensi kendala singkat → buka dropdown **`Tiket Blocker Penyebab`** → **pilih tiket `Monitor eksternal...` yang baru saja dibuat 1 menit lalu!** → klik **`Kirim Morning Commitment`**. *(Membuktikan 3 hal sekaligus: Blocker boleh dibuat sebelum Komitmen Pagi, penautan `Tiket Blocker Penyebab` langsung tersambung otomatis, dan Anak Magang ikut melapor harian).*
3. **3B — Siklus Penuh Lintas Jendela (Terima → Beri Bantuan → Membantu Sebagian → Selesaikan → Kembalikan → Tutup) (Jendela 3 `Fakhrizal` ↔ Jendela 2 `Aditya`):**
   - **Jendela 3 (`network.infra@dutamedia.com` di `/blockers`):** Tunjukkan bahwa `Fakhrizal` adalah staf biasa (`EMPLOYEE`), namun karena berstatus **`Penanggung Jawab Kategori`**, menu `/blockers` & `/blockers/aging` otomatis terbuka! *(Tunjukkan juga bila Fakhrizal membuka `/raise-blockers` dan memilih `INFRA` sendiri → **Anti-Self-Routing** otomatis menaikkannya ke `Gunawan Setiawan`!).*
   - Pilih tiket barusan (`Tugas Anda`) → klik **`Terima & Tangani`** (`Sedang Ditangani`).
   - Klik **`Beri Bantuan`** *(Ambil **`WP-SS-22`**)* → tindakan: `Menambah kapasitas koneksi pool database staging dan restart worker`, hasil: `Silakan dicoba ulang akses endpoint pembayaran` → simpan.
   - **Jendela 2 (`Aditya` di tab `Blocker Saya`):** Tunjukkan 3 tombol tanggapan pelapor atas bantuan bertahap → klik **`Terima Bantuan (Membantu Sebagian)`** dengan catatan: `Endpoint utama sudah merespons, tetapi halaman laporan masih timeout`.
   - **Jendela 3 (`Fakhrizal`):** Klik **`Selesaikan`** → solusi: `Batas koneksi database staging diperbesar permanen dan indeks query laporan telah dioptimasi` → **`Kirim Solusi`** (`Solusi Diberikan`).
   - **Jendela 2 (`Aditya`):** Uji dulu tombol **`Belum Memadai (Kembalikan)`** (alasan: `Timeout masih muncul pada ekspor data lebih dari 100 baris`) → tiket kembali **`Sedang Ditangani`** di Jendela 3! Lalu di Jendela 3 `Fakhrizal` kirim solusi final lagi → di Jendela 2 `Aditya` klik **`Konfirmasi & Tutup Tiket`** → resmi **`Selesai Ditutup`**!
3. **3C — Bantuan Non-PIC (`Bantu Unblock` → `Feed Dukungan Lintas Fungsi`), `Terima sbg Penyelesaian`, & `Terima Risiko` (Jendela 4 `Arif Budiman` ↔ Jendela 2 `Aditya`):**
   - **Jendela 4 (`head.eng@dutamedia.com` di `/dashboard`):** Klik **`Bantu Unblock`** pada tiket aktif → langsung melompat ke `/blockers` *(Ambil **`WP-SS-21`**)* → kirim **`Beri Bantuan`** pada tiket `CI runner OOM` (meski PIC-nya Bambang) → tunjukkan bantuan Arif **langsung muncul di `Feed Dukungan Lintas Fungsi`** `/dashboard`!
   - Di Jendela 2 (`Aditya`), klik **`Terima sbg Penyelesaian (Tutup Tiket)`** pada bantuan tersebut → tiket langsung tuntas seketika!
   - Di Jendela 4 (`Arif` di `/blockers`), pilih tiket `Menunggu Persetujuan Rilis Arsitektur Database Baru` → klik **`Terima & Tangani`** → demonstrasikan tombol **`Terima Risiko`** (justifikasi min. 15 huruf + rencana mitigasi) → status berubah **`Risiko Diterima`**.
4. **3D — `Edit Tiket` (*Dynamic Re-Routing*) & `Hapus Tiket` (`DEC-016`) (Jendela 2 `Aditya`):**
   - Di tab `Blocker Saya`, klik **`Edit Tiket`** pada tiket `CROSS_TEAM` → ubah divisi tujuan dari `Delivery` ke `Operations & Infrastructure` → simpan → tunjukkan PIC otomatis berpindah ke **`Gunawan Setiawan`**!
   - Buat 1 tiket dummy singkat lalu klik **`Hapus Tiket`** → tunjukkan **3 alasan cepat** (*Salah Input*, *Sudah Teratasi Mandiri*, *Kendala Tidak Jadi*) + *Alasan Lainnya* → hapus bersih.
5. **3E — Radar Keterlambatan (`/blockers/aging` di Jendela 4)** *(Ambil **`WP-SS-23`**)*:
   - Tunjukkan kartu merah **`Lewat Batas Waktu: 1`** (tiket `CRITICAL` proyek `WP-CORE` dari seed!), centang **`Hanya Tampilkan Tiket Melewati Batas Waktu`**, lalu klik **`Buka`** untuk melompat langsung ke tiket di `/blockers`.

---

### BABAK 4 — SIKLUS LENGKAP KOREKSI: MINOR OTOMATIS (`AUTO_APPLIED`), MATERIAL TOLAK + REVISI, & MATERIAL SETUJUI *(5 Menit · Jendela 2 ↔ Jendela 4)*

1. **Jendela 2 (`dev.frontend@dutamedia.com` — `/corrections/morning`)** *(Ambil **`WP-SS-14`**)*:
   - **Uji Koreksi Minor:** Pilih Komitmen #1, pilih **`Koreksi Minor`**, perbaiki typo kecil, isi alasan min. 10 huruf → klik **`Kirim Permohonan Koreksi`** → langsung berstatus **`AUTO_APPLIED`** tanpa tunggu atasan!
   - **Uji Koreksi Material:** Pilih Komitmen #2, pilih **`Koreksi Material`**, ubah risiko/teks target, isi alasan: `Penyesuaian lingkup investigasi pipeline sesuai arahan rapat teknis siang` → kirim (`PENDING`, jendela sanggahan 24 jam). *(Tunjukkan sekilas `/corrections/eod` untuk **`WP-SS-15`**).*
2. **Jendela 4 (`head.eng@dutamedia.com` — `/corrections/review`)** *(Ambil **`WP-SS-26`**)*:
   - Tunjukkan **Perbandingan Visual `Sebelum` (merah) vs `Diajukan` (hijau)**.
   - Klik **`Tolak`** (modal **`Sampaikan Keberatan / Tolak Koreksi`**) → tulis alasan: `Mohon sertakan referensi nomor PR terkait sebelum disetujui` → klik **`Konfirmasi Tolak`**.
3. **Kembali ke Jendela 2 (`Aditya` di `/corrections/morning`):**
   - Pada riwayat baris ditolak, klik tombol **`Gunakan Draf Sebelumnya & Sesuaikan`** → tambahkan nomor PR di alasan → kirim ulang!
4. **Kembali ke Jendela 4 (`Arif` di `/corrections/review`):**
   - Klik **`Setujui`** → catatan `Disetujui, referensi PR sudah lengkap` → klik **`Konfirmasi Setujui`** → data komitmen pagi Aditya langsung terbarui!

---

### BABAK 5 — CUTI KARYAWAN TETAP VS IZIN ANAK MAGANG (`INTERN`), VALIDASI, BATAL MANDIRI, & PERSETUJUAN ATASAN *(5 Menit · Jendela 2 ↔ Jendela 6 ↔ Jendela 4)*

1. **Jendela 2 (`dev.frontend@dutamedia.com` — `/leave/my`)** *(Ambil **`WP-SS-13`**)*:
   - Tunjukkan kotak hijau **`Jatah Cuti Tahunan 2026 (12 hari kerja)`** dan 6 jenis cuti.
   - Uji validasi tanggal terbalik (ditolak layar) & pilih rentang melewati Sabtu–Minggu (mis. `03 Des` s/d `07 Des 2026` → sistem tepat menghitung **`3 hari kerja`**, bukan 5 hari!).
   - Klik **`Ajukan Permohonan`** (`PENDING`), lalu klik **`Batalkan`** mandiri pada baris riwayat → status jadi `Dibatalkan` dan kuota tetap utuh!
2. **Jendela 6 (`intern.frontend@dutamedia.com` — Raka Pratama di `/leave/my`)** *(Ambil **`WP-SS-19`**)*:
   - Tunjukkan kotak ungu **`Aturan Izin Karyawan Magang`** (tanpa kuota 12 hari, hanya 2 pilihan: **`Izin`** & **`Sakit`**), dan di `/profile` tunjukkan pil ungu **`Intern`** + **Tanggal Selesai Magang**.
3. **Jendela 4 (`head.eng@dutamedia.com` — `/leave/queue`)** *(Ambil **`WP-SS-25`**)*:
   - Tunjukkan di antrean langsung tersedia 2 jenis pengajuan berdampingan: **Cuti Tahunan `Siti Rahma`** dan **Izin `Raka Pratama` (pil ungu `Intern`)**.
   - Klik **`Setujui`** pada `Raka Pratama` (modal otomatis menyesuaikan bahasa *"izin"*) dan **`Tolak`** pada `Siti Rahma` (wajib alasan min. 5 huruf: `Mohon geser jadwal karena bersamaan dengan minggu rilis utama`) → jelaskan aturan **`DEC-008`** (jika cuti hari ini disetujui siang/sore, kepatuhan otomatis diputihkan).

---

### BABAK 6 — KEPATUHAN HRGA (`TINDAK LANJUT` & `UBAH CATATAN`), DISPENSASI RESMI, & COACHING (`DIBAGIKAN` VS `RAHASIA`) *(5 Menit · Jendela 5 & Jendela 4)*

1. **Jendela 5 (`hrga@dutamedia.com` — `/compliance`)** *(Ambil **`WP-SS-29`**)*:
   - Tunjukkan 4 kartu metrik (*non-punitif*) dan 2 baris awal:
     * Pada baris **`Siti Rahma`** (`Belum Ditangani` — `Pola 3x`): klik **`Tindak Lanjut`**, ketik `Sudah dilakukan panggilan pembinaan disiplin pelaporan bersama Head Engineering`, klik **`Simpan Tindak Lanjut`** → berubah menjadi **`Sudah Ditangani`** dan tombol berganti **`Ubah Catatan`**!
     * Pada baris **`Nadia Kusuma`** (`Sudah Ditangani`): klik **`Ubah Catatan`** untuk memperlihatkan catatan tindak lanjut dapat diperbarui.
2. **Jendela 5 (`hrga@dutamedia.com` — `/exemptions`)** *(Ambil **`WP-SS-30`**)*:
   - Tunjukkan panel kanan sudah menampilkan dispensasi aktif **`Hari Wibowo` (`ST/HRGA/2026/XI/104`)** lengkap dengan tombol **`Cabut`**, lalu isi 1 dispensasi baru di panel kiri (`Dinas Luar`) dan klik **`Daftarkan Dispensasi`**.
3. **Jendela 4 (`head.eng@dutamedia.com` — `/coaching`)** *(Ambil **`WP-SS-27`**)*:
   - Pilih **`Aditya Nugroho`** → tunjukkan riwayat sudah memiliki 2 catatan: **`Dibagikan ke Karyawan`** vs **`Rahasia Manajemen`**.
   - Klik tombol template cepat **`Bimbingan 1-on-1`**, jelaskan beda kedua mode kerahasiaan (buka sekilas Jendela 2 `/notifications` milik Aditya untuk membuktikan catatan `Dibagikan` masuk, sedangkan catatan `Rahasia Manajemen` **0 kali muncul** di akun Aditya!), lalu jelaskan bedanya `/compliance` (tindak lanjut HRGA) vs `/coaching` (pembinaan 1-on-1 atasan).

---

### BABAK 7 — NOTIFIKASI (`canUserAccess`), 3 RUANG LINGKUP DASHBOARD, RADAR PROYEK, & LAPORAN EKSEKUTIF CSV/PDF *(5 Menit · Jendela 2, Jendela 4, Jendela 1)*

1. **Jendela 2 (`Aditya` — `/notifications`)** *(Ambil **`WP-SS-16`**)*:
   - Tunjukkan filter kategori, modal rincian pesan, tombol **`Tandai semua dibaca`**, pengaman tautan `canUserAccess` (karyawan tidak pernah dilempar ke `403`), dan tab **`Pengaturan Kanal & Perangkat`**.
2. **3 Ruang Lingkup Pulse Dashboard (`/dashboard`):**
   - **Jendela 4 (`head.eng@dutamedia.com`):** Terkunci aman di **`Divisi Saya`** *(Ambil **`WP-SS-20`**)* + `Feed Dukungan Lintas Fungsi`.
   - **Jendela 1 (`direktur@dutamedia.com`):** Terbuka **`Seluruh Perusahaan` (25 personil: 23 Tetap + 2 Intern)** → uji filter **`Status Karyawan`** (*Karyawan Tetap* vs *Intern*)!
   - *(Opsional tunjukkan sebentar `lead.tech@dutamedia.com` untuk ruang lingkup **`Tim (Proyek)`**).*
3. **Radar Risiko Proyek (`/projects/risk` di Jendela 4)** *(Ambil **`WP-SS-24`**)*:
   - Cari `"Engineering"` → klik **`Rincian`** pada **`WP-CORE`** → tunjukkan skor kesehatan, jumlah blocker aktif (termasuk tiket `CRITICAL` lewat batas waktu!), dan tombol pintas ke antrean blocker.
4. **Laporan Eksekutif (`/reports` di Jendela 4 / Jendela 1)** *(Ambil **`WP-SS-28`**)*:
   - Tunjukkan 4 preset waktu (`Hari Ini`, `Pekan Ini`, `Bulan Ini`, `Kuartal Ini`), filter **`Status Karyawan`** (pilih `Kontrak` → tampil pesan ramah `"Belum ada data karyawan untuk status karyawan yang dipilih."`, lalu kembali ke `Semua Status`), klik **`Unduh Laporan (CSV)`** dan tunjukkan tombol **`Cetak / PDF`**.

---

### BABAK 8 — TATA KELOLA ORGANISASI, PENGANGKATAN `INTERN`, REVIEWER SEMENTARA (BUKTI LOGIN!), MULTI-OWNER PIC, & SALURAN NOTIFIKASI *(6 Menit · Jendela 5, Jendela 6, Jendela 1)*

1. **Jendela 5 (`hrga@dutamedia.com` — `/admin/users`):**
   - Uji **`Nonaktifkan`** pada akun uji `Budi Santoso` (sesi aktifnya langsung dicabut & tidak bisa login), tunjukkan tombol **`Aktifkan`** kembali, dan tunjukkan HRGA/Admin tidak bisa menonaktifkan akun sendiri (`Akun Anda`).
2. **Jendela 5 (`hrga@dutamedia.com` — `/admin/organization`)** *(Ambil **`WP-SS-33`**)*:
   - **Tab 1 (`Struktur & Penugasan Karyawan`):** Klik **`Atur Penugasan Baru`** → tunjukkan `Raka Pratama` & `Nisa Amelia` (`Intern`) **0 kali muncul** di pilihan Atasan Langsung; jelaskan **Anti-Siklus Melingkar** (`A → B → A` ditolak `422`), cara mutasi divisi/ganti atasan, dan cara **pengangkatan `Intern` jadi `Karyawan Tetap`** tanpa merusak riwayat magang.
   - **Tab 2 (`Kewenangan Proyek`):** Klik **`Tetapkan Wewenang Proyek`** → tunjukkan penolakan bila PM = Escalation Reviewer & tidak ada akun `Intern` → tunjukkan modal in-app **`Konfirmasi Tutup Wewenang Proyek`** saat klik **`Tutup Wewenang`**.
3. **Jendela 5 → Jendela 6 (`Reviewer Sementara` `/admin/temporary-reviewers` + Bukti Login Nyata!)** *(Ambil **`WP-SS-34`**)*:
   - Di Jendela 5, klik **`Delegasikan Reviewer Baru`** → Pejabat Berhalangan: `Gunawan Setiawan` (Divisi Ops & Infra terisi otomatis), Pengganti Sementara: **`Rian Kurniawan`** *(tunjukkan `SYSTEM_ADMIN` & `Intern` tidak muncul!)*, tanggal hari ini s/d besok, alasan: `Menggantikan Head Ops & Infra selama dinas audit infrastruktur` → klik **`Terbitkan Delegasi`**.
   - **Pindah ke Jendela 6 (Incognito):** Login sebagai **`lead.creative@dutamedia.com` (Rian Kurniawan)** → buktikan langsung di sidebar kiri Rian kini otomatis muncul menu **`Persetujuan Cuti`**, **`Review Koreksi & Cuti`**, & **`Antrean Blocker`**! Keluar.
   - Di Jendela 5, klik **`Cabut`** pada delegasi Rian agar kembali rapi.
4. **Jendela 1 (`direktur@dutamedia.com`) vs Jendela 5 (`hrga@dutamedia.com`) di `/admin/policies`:**
   - Di Jendela 1 (Direktur): tunjukkan Seksi **`Penugasan Pemilik Kebijakan (Multi-Owner PIC)`** (`Tetapkan Pemilik`, `Ubah`, `Cabut` — termasuk pengaman melarang pencabutan pemilik terakhir) dan tombol **`Unduh Audit CSV`**.
   - Di Jendela 5 (HRGA): buka `/admin/policies` → tunjukkan bahwa HRGA sebagai Pemilik Kebijakan non-Direktur hanya dapat mengubah kategori yang menjadi wewenangnya (kategori lain terkunci aman!).
5. **Jendela 1 (`/admin/notifications`)** *(Ambil **`WP-SS-36`**)*:
   - Tunjukkan status jujur 3 saluran (`In-App`, `Email`, `Browser Push` — jujur menampilkan `Mode Simulasi Aktif` jika kunci luar belum diisi), **Tabel Matriks 9 Pemicu Resmi** (4 tab penyaring), lalu klik **`Kirim Notifikasi Uji Coba`** → hasil langsung tercatat pada **`Log Pengiriman Uji Coba Terbaru`**.

---

### BABAK 9 — PENUTUPAN DEMO RESMI (KEMBALIKAN KEBIJAKAN STANDAR) *(1 Menit · Jendela 1)*

1. Di Jendela 1 (`direktur@dutamedia.com` — `/admin/policies`), klik **`+ Buat Versi Kebijakan Baru`**:
   - Kembalikan **`Batas Tepat Waktu Pagi`** ke **`09:00`** dan **`Batas Kunci Pengisian Pagi (Cut-Off)`** ke **`09:30`**.
   - Alasan (siap salin):
     ```text
     Mengembalikan jam batas pengisian pagi ke jadwal kerja resmi perusahaan setelah demonstrasi selesai
     ```
   - Klik simpan → tutup dengan menunjukkan **Jejak Audit** sudah kembali ke jadwal standar `09:00 / 09:30 WIB`.

---

## 4. DAFTAR PERIKSA RESET BERSIH SEBELUM DEMO RESMI (JAM 12.00 – 12.30 WIB)

- [ ] Jalankan reset bersih + `prisma db seed` agar seluruh 11 baris tabel Data Dummy pada Bagian 1 kembali 100% segar untuk tanggal hari ini.
- [ ] Pastikan 6 jendela browser sudah masuk sesuai tabel Bagian 2 (`Password123!`) dan draf lokal browser (`Reset Draf`) sudah bersih.
- [ ] Aktifkan *Do Not Disturb / Focus Assist* Windows sebelum membagikan layar (*Share Screen* / proyektor).
