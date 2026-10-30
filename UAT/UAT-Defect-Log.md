# WorkPulse — Log Cacat & Anomali Sistem (UAT Defect Log)

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Pengelola Pengujian:** Harry (Manual Tester & Acceptance Owner)  
> **Tanggal Mulai:** 30 Oktober 2026  

Dokumen ini mencatat seluruh temuan cacat fungsional, anomali logika bisnis, dan pelanggaran kriteria penerimaan (*acceptance criteria*) yang ditemukan selama eksekusi Manual UAT WorkPulse.

---

# LAPORAN DEFECT: [DEF-001] — Formulir Morning Commitment Tetap Dapat Diedit & Tombol Submit Tetap Aktif Pasca-Pengiriman Berhasil (Pelanggaran Penguncian Baseline DEC-001 & FR-09)

### 1. Informasi Umum
- **Defect ID:** DEF-001
- **Tanggal Ditemukan:** 30/10/2026 — 12:25 WIB
- **Pelapor (Tester):** Harry
- **Test Case ID Terkait:** `TC-DLYM-001`
- **Requirement ID Terkait:** `FR-09`, `DEC-001`
- **Modul / Rute Halaman:** `/daily/morning`
- **Peran yang Digunakan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)

### 2. Lingkungan Pengujian (Environment)
- **URL Aplikasi:** https://dutamedia-workpulse.vercel.app/daily/morning
- **Browser:** Google Chrome (Incognito Mode)
- **Sistem Operasi:** Windows 11
- **Resolusi Viewport:** Desktop Standard

### 3. Klasifikasi Cacat
- **Tingkat Keparahan (Severity):** Major (S2) — Fungsi inti penguncian baseline tidak aktif, integritas baseline tidak terjaga.
- **Urgensi Perbaikan (Priority):** P1 (High) — Wajib diselesaikan sebelum rilis produksi ke seluruh karyawan.
- **Frekuensi Terjadinya (Reproduction Rate):** Selalu (100%)

### 4. Prasyarat Pengujian (Preconditions)
- Akun login sebagai `dev.frontend@dutamedia.com`.
- Jam cut-off pagi aktif (diperpanjang hingga 23:59 WIB pada konfigurasi kebijakan).
- Formulir komitmen pagi belum pernah disubmit pada hari ini (`30/10/2026`).

### 5. Langkah Reproduksi Masalah (Steps to Reproduce)
1. Buka formulir Morning Commitment (`/daily/morning`).
2. Buat 3 slot komitmen dengan data deliverable valid.
3. Klik tombol hijau **"Kirim Morning Commitment"**.
4. Amati reaksi antarmuka setelah toast notifikasi hijau dan panel *"Morning Commitment Berhasil Tercatat"* muncul.

### 6. Hasil yang Diharapkan (Expected Result)
Sesuai **FR-09**, **DEC-001**, dan spesifikasi kanonikal Prototipe 02 (`setFormLockedState(true)`):
- Formulir beralih penuh ke mode terkunci / read-only (*Baseline Locked Summary*).
- Seluruh elemen input (textarea teks deliverable, tautan, pilihan radio risiko, tombol hapus slot) otomatis dinonaktifkan (`disabled`).
- Tombol aksi utama *"Kirim Morning Commitment"* dan tombol aksi penambahan slot disembunyikan atau dinonaktifkan agar data baseline tidak dapat dimanipulasi secara sepihak di tengah hari tanpa melalui alur koreksi resmi.

### 7. Hasil Aktual yang Terjadi (Actual Result)
- Toast sukses hijau muncul dan panel *"Morning Commitment Berhasil Tercatat"* ditampilkan di bagian bawah.
- Namun, **formulir tidak terkunci sama sekali**. Seluruh textarea, opsi radio button risiko, dan tautan tetap dalam keadaan aktif dan dapat diubah-ubah teksnya secara bebas oleh pengguna.
- Tombol *"Kirim Morning Commitment"* beserta teks bantuan footer di atasnya tetap aktif, tampak, dan siap menerima klik kirim ulang.

### 8. Dampak Terhadap Bisnis (Business Impact)
Karyawan dapat secara bebas merevisi atau memanipulasi baseline komitmen pagi sesuka hati di tengah hari kerja tanpa melalui alur persetujuan koreksi atasan (*Correction Request*), sehingga merusak prinsip dasar akuntabilitas harian dan auditabilitas deliverable perusahaan PT Dutamedia Mandiri Pratama.

### 9. Bukti Pendukung (Evidence)
- **Screenshot Bukti Temuan:** `C:/Users/LOQ/.gemini/antigravity/brain/088b33f6-5e17-4b53-85dc-110770e55ffd/.user_uploaded/media_1793337891857_208a42f5.png` dan `media_1793337782808_7cf6d941.png`

### 10. Catatan Tambahan & Status Uji Ulang (Retest Tracking)
- **Status Tiket:** Open
- **Penyebab Teknis Awal:** Di `MorningCommitmentView.vue`, atribut `:disabled` pada kolom input dan visibilitas tombol footer hanya memeriksa `isMorningLocked` (kondisi jam sistem melewati cut-off), dan tidak memeriksa `isSubmittedSuccess` atau keberadaan record yang sudah disubmit.
- **Tanggal Uji Ulang:** TBD
- **Hasil Uji Ulang:** [ ] Retest Pass | [ ] Retest Fail



---

# LAPORAN DEFECT: [DEF-002] — Formulir Evaluasi EOD Outcome Tetap Dapat Diedit & Tombol Submit Tetap Aktif Pasca-Pengiriman Berhasil (Pelanggaran Penguncian Penutupan Hari Kerja)

### 1. Informasi Umum
- **Defect ID:** DEF-002
- **Tanggal Ditemukan:** 30/10/2026 — 13:44 WIB
- **Pelapor (Tester):** Harry
- **Test Case ID Terkait:** `TC-DLYE-001`
- **Requirement ID Terkait:** `FR-21`, `FR-26`, `DEC-001`
- **Modul / Rute Halaman:** `/daily/eod`
- **Peran yang Digunakan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)

### 2. Lingkungan Pengujian (Environment)
- **URL Aplikasi:** https://dutamedia-workpulse.vercel.app/daily/eod
- **Browser:** Google Chrome (Incognito Mode)
- **Sistem Operasi:** Windows 11
- **Resolusi Viewport:** Desktop Standard

### 3. Klasifikasi Cacat
- **Tingkat Keparahan (Severity):** Major (S2) — Integritas penutupan hari kerja tidak terlindungi; formulir yang sudah ditutup resmi masih dapat diubah bebas.
- **Urgensi Perbaikan (Priority):** P1 (High) — Wajib diselesaikan sebelum peluncuran produksi.
- **Frekuensi Terjadinya (Reproduction Rate):** Selalu (100%)

### 4. Prasyarat Pengujian (Preconditions)
- Akun login sebagai `dev.frontend@dutamedia.com`.
- Komitmen pagi dan tugas tambahan telah disubmit.
- Berada di form evaluasi sore sebelum jam cut-off malam (`21:00 WIB`).

### 5. Langkah Reproduksi Masalah (Steps to Reproduce)
1. Buka formulir EOD Outcome (`/daily/eod`).
2. Tentukan capaian seluruh komitmen dan pekerjaan tambahan.
3. Pilih status refleksi akhir hari (misal AMBER).
4. Klik tombol hijau **"Kirim Evaluasi EOD"**.
5. Amati reaksi antarmuka setelah toast notifikasi hijau dan panel *"Evaluasi EOD Berhasil Disimpan"* muncul.

### 6. Hasil yang Diharapkan (Expected Result)
Sesuai **FR-26** dan prinsip akuntabilitas harian:
- Formulir beralih penuh ke mode terkunci / read-only (*EOD Locked Summary*).
- Seluruh tombol radio capaian, pilihan kelanjutan tugas, dan kartu refleksi mandiri otomatis dinonaktifkan (`disabled`).
- Tombol aksi *"Kirim Evaluasi EOD"* disembunyikan atau dinonaktifkan agar data hasil kerja yang sudah dilaporkan resmi tidak dapat diubah-ubah sepihak tanpa permohonan koreksi.

### 7. Hasil Aktual yang Terjadi (Actual Result)
- Panel hijau *"Evaluasi EOD Berhasil Disimpan: Hari kerja Anda telah ditutup secara resmi..."* muncul di bagian bawah.
- Namun, **seluruh formulir di atasnya tidak terkunci sama sekali**. Seluruh tombol radio hasil capaian, opsi kelanjutan tugas, dan radio status refleksi mandiri (GREEN, AMBER, RED) tetap aktif dan dapat diubah-ubah secara bebas.
- Tombol *"Kirim Evaluasi EOD"* dan teks panduan footer tetap tampak aktif dan siap menerima pengiriman ulang.

### 8. Dampak Terhadap Bisnis (Business Impact)
Karyawan dapat merevisi status hasil evaluasi sore sesuka hati setelah diserahkan tanpa jejak audit resmi, merusak validitas data pelaporan harian yang menjadi rujukan penilaian atasan dan HRGA.

### 9. Bukti Pendukung (Evidence)
- **Screenshot Bukti Temuan:** `media_1793342477791_64b18d0a.png`

### 10. Catatan Tambahan & Status Uji Ulang (Retest Tracking)
- **Status Tiket:** Open
- **Penyebab Teknis Awal:** Di `EodOutcomeView.vue`, atribut `:disabled` pada seluruh radio button dan visibilitas tombol footer hanya memeriksa `isEodLocked` (kondisi jam sistem melewati cut-off 21:00 WIB), dan tidak memeriksa `isSubmittedSuccess` atau status record yang sudah dievaluasi.
- **Tanggal Uji Ulang:** TBD
- **Hasil Uji Ulang:** [ ] Retest Pass | [ ] Retest Fail