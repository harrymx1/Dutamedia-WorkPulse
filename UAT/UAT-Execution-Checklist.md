# WorkPulse — UAT Execution Checklist & Operational Sequence

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Penanggung Jawab Eksekusi:** Harry (Acceptance Owner & Manual Tester)  
> **Tanggal:** 29 Oktober 2026  

---

## 1. PANDUAN URUTAN EKSEKUSI PENGUJIAN MANUAL

Dokumen ini memandu Anda (Harry) untuk mengeksekusi rangkaian User Acceptance Testing (UAT) secara sistematis dan efisien. Rangkaian tes dikelompokkan ke dalam 15 kelompok kerja sekuensial yang dirancang untuk **meminimalkan proses logout/login berulang**, mencegah konflik dependensi data, dan memastikan integritas pengujian dari awal hingga akhir.

### Panduan Status Pengujian
Setiap kali Anda selesai mengeksekusi satu test case, perbarui kolom checklist berikut:
- `[ ] Not Run`: Belum dieksekusi.
- `[P] Pass`: Berhasil memenuhi seluruh Expected Result.
- `[F] Fail`: Menghasilkan kegagalan/anomali (isi kolom Defect ID).
- `[B] Blocked`: Tidak dapat dijalankan karena terhalang bug pada langkah sebelumnya.

---

## 2. CHECKLIST PERSIAPAN LINGKUNGAN & PRASYARAT (PRE-EXECUTION)

Sebelum membuka antarmuka aplikasi, pastikan kondisi dasar berikut telah terpenuhi:

- [ ] **Layanan Backend Aktif:** Node.js/Express server berjalan di `http://localhost:3000` (atau port staging).
- [ ] **Layanan Frontend Aktif:** Vue 3 Vite dev server berjalan di `http://localhost:5173` (atau URL staging).
- [ ] **Basis Data Terhubung:** Database PostgreSQL aktif dan telah di-seed dengan data awal resmi (`npm run prisma:seed`).
- [ ] **Kredensial Pengujian Tersedia:** Password default seluruh akun seeder adalah `Password123!`.
- [ ] **Browser Bersih:** Buka browser Google Chrome / Microsoft Edge dalam jendela penyamaran (*Incognito / Private Window*) untuk menghindari gangguan cache lama.
- [ ] **Resolusi Layar:** Atur resolusi desktop standar (1440x900 atau 1920x1080). Siapkan Developer Tools (F12) untuk pengujian mobile viewport (375x812) bila diperlukan.

---

## 3. PENGELOMPOKAN 15 RANGKAIAN UAT BERURUTAN

---

### Kelompok 1: Environment & Precondition Checks
- **Tujuan:** Memastikan infrastruktur dasar aplikasi web dapat diakses tanpa hambatan jaringan.
- **Peran yang Dibutuhkan:** Tanpa autentikasi / Tamu.
- **Prasyarat:** Browser terhubung ke internet/jaringan lokal.
- **Test Data:** URL Beranda `http://localhost:5173/`.
- **Urutan Eksekusi:** Buka root URL `/` -> Verifikasi redirect otomatis ke `/login`.
- **Risiko jika Dilewati:** Menjalankan tes pada server yang belum siap akan menyebabkan seluruh pengujian gagal palsu.

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-AUTH-001 (Langkah 1)` | Akses URL Root dan Redirect ke Login | | |

---

### Kelompok 2: Authentication & Session Management
- **Tujuan:** Menguji login sukses seluruh peran, penolakan password salah, dan keamanan pengakhiran sesi (logout).
- **Peran yang Dibutuhkan:** Seluruh Peran (`EMPLOYEE`, `SUPERVISOR`, `HRGA`, `SYSTEM_ADMIN`, Tamu).
- **Prasyarat:** Akun seeder aktif di database.
- **Test Data:** `TD-AUTH-01` s.d. `TD-AUTH-07`.
- **Urutan Eksekusi:**
  1. Uji login gagal dengan password salah (`TC-AUTH-002`).
  2. Uji login sukses Employee dan amati landing route `/daily/morning` (`TC-AUTH-001`).
  3. Uji logout aman dan proteksi tombol back browser (`TC-AUTH-006`).
- **Pembersihan Kondisi:** Bersihkan session storage jika beralih peran.

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-AUTH-002` | Penolakan Login Kredensial Tidak Sah / Password Salah | | |
| [ ] | `TC-AUTH-001` | Login Kredensial Valid & Pendaratan Otomatis Employee | | |
| [ ] | `TC-AUTH-006` | Pengakhiran Sesi Aman (Logout) & Pencegahan Back Cache | | |

---

### Kelompok 3: Onboarding & Account Lifecycle (Aktivasi Akun Baru)
- **Tujuan:** Menguji aktivasi karyawan baru via tautan ber-token 72 jam dan pencegahan penggunaan ulang token (*single-use*).
- **Peran yang Dibutuhkan:** `INVITED` (`calon.karyawan@dutamedia.com`).
- **Prasyarat:** Token demo seeder `wp_seed_invite_token_72h_demo_secret` tersedia.
- **Test Data:** `TD-AUTH-08` dan `TD-AUTH-09`.
- **Urutan Eksekusi:**
  1. Akses link aktivasi dengan token seeder (`TC-AUTH-003`).
  2. Buat password baru dan selesaikan aktivasi.
  3. Akses kembali link yang sama untuk membuktikan penolakan single-use (`TC-AUTH-004`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-AUTH-003` | Aktivasi Akun Karyawan Baru via Token Seeder 72 Jam | | |
| [ ] | `TC-AUTH-004` | Penolakan Token Aktivasi Kedaluwarsa / Bekas Pakai | | |

---

### Kelompok 4: Role-Based Access Control (RBAC) & Router Protection
- **Tujuan:** Memvalidasi bahwa pembatasan hak akses antarmuka bekerja ketat dan upaya akses URL terlarang dialihkan ke Error 403 Forbidden.
- **Peran yang Dibutuhkan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`).
- **Prasyarat:** Login aktif sebagai Employee.
- **Test Data:** `TD-AUTH-01`, URL target `/admin/organization`.
- **Urutan Eksekusi:**
  1. Login sebagai Employee.
  2. Ketik manual URL terlarang di browser address bar (`TC-AUTH-005`).
  3. Verifikasi halaman 403 Forbidden dan tombol pemulihan kembali ke beranda.

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-AUTH-005` | Proteksi Akses URL Ilegal Antarmuka & Layar Error 403 | | |

---

### Kelompok 5: Daily Accountability — Siklus Pagi (Morning Commitment)
- **Tujuan:** Menguji pengisian komitmen pagi tepat waktu (1-3 item), opsi 0 komitmen, batas minimal karakter, penandaan blocker dini, dan penguncian pasca cut-off.
- **Peran yang Dibutuhkan:** `EMPLOYEE` (`dev.frontend@dutamedia.com` / `dev.backend@dutamedia.com`).
- **Prasyarat:** Waktu kerja pagi hari atau tanggal baru belum terisi.
- **Test Data:** `TD-DLYM-01` s.d. `TD-DLYM-05`.
- **Urutan Eksekusi:**
  1. Uji batas minimal deskripsi < 5 karakter (`TC-DLYM-006`).
  2. Uji opsi 0 komitmen dengan alasan < 10 char dan >= 10 char (`TC-DLYM-002`).
  3. Uji pengisian 1-3 komitmen normal On-Time (`TC-DLYM-001`).
  4. Uji centang indikasi kendala dini (`TC-DLYM-003`).
  5. Uji fitur salin dari komitmen kemarin (`TC-DLYM-004`).
  6. Verifikasi penguncian form pasca cut-off (`TC-DLYM-005`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-DLYM-006` | Validasi Panjang Deskripsi Komitmen Pagi (< 5 Karakter) | | |
| [ ] | `TC-DLYM-002` | Opsi 0 Komitmen dengan Justifikasi Wajib >= 10 Karakter | | |
| [ ] | `TC-DLYM-001` | Pengisian 1 s.d. 3 Komitmen Pagi Tepat Waktu (On-Time) | | |
| [ ] | `TC-DLYM-003` | Penandaan Indikasi Hambatan Dini pada Komitmen Pagi | | |
| [ ] | `TC-DLYM-004` | Fitur Salin Komitmen Hari Sebelumnya (Copy-Forward) | | |
| [ ] | `TC-DLYM-005` | Penguncian Form Komitmen Pagi Pasca Cut-Off (DEC-002) | | |

---

### Kelompok 6: Daily Accountability — Tugas Tambahan Siang Hari (Additional Work)
- **Tujuan:** Memvalidasi pencatatan tugas mendesak ad-hoc di tengah jam kerja dan integrasinya ke evaluasi sore.
- **Peran yang Dibutuhkan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`).
- **Prasyarat:** Komitmen pagi telah terisi.
- **Test Data:** `TD-DLYA-01` dan `TD-DLYA-02`.
- **Urutan Eksekusi:**
  1. Uji validasi field wajib pemberi instruksi & proyek (`TC-DLYA-002`).
  2. Catat tugas tambahan valid (`TC-DLYA-001`).
  3. Uji batas maksimal 5 tugas tambahan (`TC-DLYA-003`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-DLYA-002` | Validasi Field Wajib Pemberi Instruksi & Proyek Ad-Hoc | | |
| [ ] | `TC-DLYA-001` | Pencatatan Tugas Tambahan Ad-Hoc & Integrasi ke EOD | | |
| [ ] | `TC-DLYA-003` | Batas Maksimum 5 Tugas Tambahan Ad-Hoc Per Hari | | |

---

### Kelompok 7: Daily Accountability — Evaluasi Sore (EOD Outcome) & Anti-Lock Green
- **Tujuan:** Memvalidasi pelaporan hasil kerja sore, rekomendasi status risiko heuristik, aturan wajib justifikasi status Blocked, dan regulasi Anti-Lock Green (DEC-003).
- **Peran yang Dibutuhkan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`).
- **Prasyarat:** Komitmen pagi dan tugas tambahan telah tersedia.
- **Test Data:** `TD-DLYE-01` s.d. `TD-DLYE-03`.
- **Urutan Eksekusi:**
  1. Uji wajib alasan saat komitmen ditandai Blocked (`TC-DLYE-003`).
  2. Uji kebebasan memilih status Hijau saat sistem menyarankan Kuning/Merah (`TC-DLYE-002`).
  3. Uji pelaporan EOD normal On-Time dengan catatan refleksi (`TC-DLYE-001`).
  4. Uji penguncian form pasca cut-off sore (`TC-DLYE-004`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-DLYE-003` | Wajib Alasan Penjelasan pada Status Blocked/Cancelled | | |
| [ ] | `TC-DLYE-002` | Heuristic Suggestion & Hak Prerogatif Anti-Lock Green | | |
| [ ] | `TC-DLYE-001` | Pelaporan Evaluasi Hasil Kerja Sore Lengkap (EOD Outcome) | | |
| [ ] | `TC-DLYE-004` | Penguncian Form Hasil Sore Pasca Cut-Off EOD | | |

---

### Kelompok 8: Blocker Management, SLA Aging, & Resolution
- **Tujuan:** Memvalidasi siklus pelaporan hambatan, penetapan target SLA, konfirmasi penerimaan atasan, eskalasi penuaan (aging), dan resolusi tuntas.
- **Peran yang Dibutuhkan:** `EMPLOYEE`, `SUPERVISOR`, `HEAD`, `PROJECT_MANAGER`.
- **Prasyarat:** Akun terkait aktif.
- **Test Data:** `TD-BLKR-01` s.d. `TD-BLKR-03`.
- **Urutan Eksekusi:**
  1. Karyawan melaporkan blocker kritis dengan target SLA 2 jam (`TC-BLKR-001`).
  2. Supervisor meninjau antrean dan melakukan konfirmasi penerimaan (`TC-BLKR-002`).
  3. Supervisor menutup blocker dengan catatan solusi tuntas >= 10 char (`TC-BLKR-003`).
  4. Head / CEO memantau radar penuaan blocker breached SLA (`TC-BLKR-004`).
  5. PM mengelola blocker berkonteks proyek spesifik (`TC-BLKR-005`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-BLKR-001` | Pelaporan Hambatan Baru Tingkat Kritis dengan SLA 2 Jam | | |
| [ ] | `TC-BLKR-002` | Konfirmasi Penerimaan Blocker oleh Atasan (Acknowledge) | | |
| [ ] | `TC-BLKR-003` | Resolusi Blocker dengan Catatan Solusi Tuntas >= 10 Karakter | | |
| [ ] | `TC-BLKR-004` | Pemantauan Radar Eskalasi Blocker Melewati Batas SLA | | |
| [ ] | `TC-BLKR-005` | Penanganan Blocker Berdasarkan Kewenangan Proyek (PM) | | |

---

### Kelompok 9: Tata Kelola Kepatuhan & Permohonan Koreksi
- **Tujuan:** Menguji pengajuan koreksi pasca cut-off, persetujuan/penolakan oleh direct manager, pemantauan kepatuhan oleh HRGA, dan penerbitan dispensasi resmi.
- **Peran yang Dibutuhkan:** `EMPLOYEE`, `SUPERVISOR`, `HRGA`.
- **Prasyarat:** Terdapat tanggal terkunci yang perlu dikoreksi.
- **Test Data:** `TD-CORR-01` dan `TD-CORR-02`.
- **Urutan Eksekusi:**
  1. Karyawan mengajukan koreksi pagi dengan alasan >= 10 char (`TC-CORR-001`).
  2. Atasan menolak koreksi tanpa alasan (gagal) lalu dengan alasan valid (`TC-CORR-003`).
  3. Atasan menyetujui koreksi dan data komitmen terbarui (`TC-CORR-002`).
  4. HRGA memantau compliance queue dan mendeteksi pola 3x pelanggaran (`TC-CORR-004`).
  5. HRGA menerbitkan dispensasi resmi (Exemption) dengan audit trail abadi (`TC-CORR-005`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-CORR-001` | Pengajuan Permohonan Koreksi Komitmen Pagi Pasca Cut-Off | | |
| [ ] | `TC-CORR-003` | Penolakan Permohonan Koreksi dengan Alasan Wajib >= 10 Char | | |
| [ ] | `TC-CORR-002` | Persetujuan Permohonan Koreksi oleh Direct Manager | | |
| [ ] | `TC-CORR-004` | Pengawasan Kepatuhan & Deteksi Pola Pelanggaran 3x oleh HRGA | | |
| [ ] | `TC-CORR-005` | Penerbitan Dispensasi Kepatuhan Resmi & Audit Log (DEC-013) | | |

---

### Kelompok 10: Pengelolaan Cuti & Rekonsiliasi Otomatis (DEC-008)
- **Tujuan:** Memvalidasi pengajuan cuti tahunan mandiri, persetujuan atasan, pemotongan kuota, dan rekonsiliasi otomatis pembebasan dari penalti ketidakpatuhan.
- **Peran yang Dibutuhkan:** `EMPLOYEE`, `SUPERVISOR`, `HRGA`.
- **Prasyarat:** Sisa kuota cuti tahunan mencukupi.
- **Test Data:** `TD-LEAV-01` dan `TD-LEAV-02`.
- **Urutan Eksekusi:**
  1. Karyawan mengajukan cuti tahunan mandiri 2 hari (`TC-LEAV-001`).
  2. Supervisor menyetujui pengajuan cuti tim (`TC-LEAV-002`).
  3. Verifikasi rekonsiliasi otomatis pasca cut-off: status berubah menjadi `Superseded by Approved Leave` tanpa catatan pelanggaran (`TC-LEAV-003`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-LEAV-001` | Pengajuan Cuti Tahunan Mandiri oleh Karyawan | | |
| [ ] | `TC-LEAV-002` | Persetujuan Permohonan Cuti oleh Atasan Langsung | | |
| [ ] | `TC-LEAV-003` | Rekonsiliasi Cuti Otomatis Pasca Cut-Off (DEC-008) | | |

---

### Kelompok 11: Supervisi, Coaching, & Dasbor Operasional
- **Tujuan:** Memvalidasi pemberian catatan bimbingan manajer, tampilan dasbor Team Pulse, Function Pulse, dan radar risiko proyek.
- **Peran yang Dibutuhkan:** `SUPERVISOR`, `PROJECT_MANAGER`.
- **Prasyarat:** Data tim telah terakumulasi.
- **Test Data:** Akun Supervisor dan PM.
- **Urutan Eksekusi:**
  1. Supervisor memberikan catatan bimbingan manajer pada bawahan (`TC-COAC-001`).
  2. Supervisor memantau dasbor Team Pulse (`TC-DASH-001`).
  3. PM memantau Project Risk Radar untuk inisiatif strategis (`TC-DASH-002`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-COAC-001` | Pemberian Catatan Bimbingan Manajer (Coaching Note) | | |
| [ ] | `TC-DASH-001` | Pemantauan Dasbor Operasional Tim (Team Pulse) | | |
| [ ] | `TC-DASH-002` | Pemantauan Radar Risiko Proyek & Inisiatif Strategis | | |

---

### Kelompok 12: Administrasi Sistem & Pengaturan Kebijakan
- **Tujuan:** Memvalidasi pendelegasian wewenang reviewer sementara dan pembaruan parameter kebijakan operasional sistem.
- **Peran yang Dibutuhkan:** `SYSTEM_ADMIN` (`admin@dutamedia.com`).
- **Prasyarat:** Login sebagai System Administrator.
- **Test Data:** `TD-ADMN-01` dan `TD-AUTH-04`.
- **Urutan Eksekusi:**
  1. Admin menugaskan reviewer sementara antar-supervisor (`TC-ADMN-001`).
  2. Admin mengubah dan memverifikasi persistensi konfigurasi kebijakan cut-off (`TC-ADMN-002`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-ADMN-001` | Penugasan Reviewer Sementara (Temporary Reviewer) | | |
| [ ] | `TC-ADMN-002` | Konfigurasi Kebijakan Operasional Sistem (Policy Settings) | | |

---

### Kelompok 13: Pelaporan Eksekutif & Unduh Data Rekapitulasi
- **Tujuan:** Menguji penyajian laporan ringkasan akuntabilitas organisasi untuk jajaran direksi dan fungsionalitas unduh data audit.
- **Peran yang Dibutuhkan:** `CEO_MANAGEMENT` (`direktur@dutamedia.com`) / `HRGA`.
- **Prasyarat:** Login sebagai CEO.
- **Test Data:** `TD-AUTH-05`.
- **Urutan Eksekusi:**
  1. CEO membuka tab Management Pulse dan Executive Reports (`TC-DASH-003`).
  2. Uji filter tanggal laporan dan klik tombol ekspor data audit.

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-DASH-003` | Tinjauan Laporan Eksekutif & Pengujian Fitur Unduh Data | | |

---

### Kelompok 14: Skenario Perjalanan Pengguna End-to-End (E2E Journey)
- **Tujuan:** Memvalidasi kelancaran interaksi kolaboratif multi-aktor melintasi seluruh rantai proses bisnis WorkPulse.
- **Peran yang Dibutuhkan:** Multi-Aktor (`EMPLOYEE`, `SUPERVISOR`, `HRGA`).
- **Prasyarat:** Seluruh modul individu telah diuji.
- **Test Data:** Rangkaian data terintegrasi.
- **Urutan Eksekusi:**
  1. Eksekusi siklus harian utuh: Pagi -> Ad-Hoc -> EOD -> Supervisi (`TC-E2E-001`).
  2. Eksekusi rantai blocker: Pelaporan -> SLA Escalation -> Resolusi (`TC-E2E-002`).
  3. Eksekusi rantai koreksi: Karyawan Terlambat -> Koreksi -> Approval (`TC-E2E-003`).
  4. Eksekusi rantai cuti dan rekonsiliasi bebas pelanggaran (`TC-E2E-004`).

| Check | Test Case ID | Deskripsi Singkat | Status Hasil | Ref Bukti / Defect ID |
| :---: | :--- | :--- | :---: | :--- |
| [ ] | `TC-E2E-001` | User Journey Siklus Harian Karyawan: Pagi -> Ad-Hoc -> Sore | | |
| [ ] | `TC-E2E-002` | User Journey Siklus Blocker: Pelaporan -> Eskalasi -> Resolusi | | |
| [ ] | `TC-E2E-003` | User Journey Siklus Koreksi: Terlambat -> Pengajuan -> Approval | | |
| [ ] | `TC-E2E-004` | User Journey Rekonsiliasi Otomatis Cuti & Bebas Pelanggaran | | |

---

### Kelompok 15: Exploratory Testing & Penutupan Final
- **Tujuan:** Melakukan pengujian eksplorasi heuristik dan verifikasi kelaikan akhir sebelum penandatanganan penyerahan.
- **Peran yang Dibutuhkan:** Harry (Acceptance Owner).
- **Prasyarat:** Seluruh test case terstruktur 1-14 telah selesai dieksekusi.
- **Panduan Terkait:** `UAT-Exploratory-Testing-Charters.md` dan `UAT-Final-Acceptance-Checklist.md`.

| Check | Aktivitas Penutupan | Status Hasil | Ref Bukti / Catatan |
| :---: | :--- | :---: | :--- |
| [ ] | Eksekusi Piagam Uji Eksplorasi CH-EXP-01 s.d. CH-EXP-07 | | Sesuai piagam eksplorasi |
| [ ] | Pemeriksaan Seluruh Defect di `UAT-Execution-Log.csv` | | Pastikan 0 Critical Defect |
| [ ] | Penandatanganan Lembar Penerimaan Sistem Final | | `UAT-Final-Acceptance-Checklist.md` |
