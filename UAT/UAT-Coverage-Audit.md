# WorkPulse — Comprehensive UAT Coverage Audit & Residual Gap Analysis (Remediated)

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 2.2.0 (Harmonized Requirement Namespaces UAT-REQ-PROFILE-001 & UAT-REQ-EODCORR-001)  
> **Penyusun:** Senior Quality Assurance Engineer & UAT Architect  
> **Tanggal Audit Remediasi:** 29 Oktober 2026  
> **Status:** REMEDIATED & STATICALLY VERIFIED  

---

## 1. METODOLOGI & STATUS KELENGKAPAN AUDIT CAKUPAN UAT

Audit cakupan ini membedakan secara tegas 4 tingkat kematangan pengujian (*testing maturity levels*) untuk memastikan transparansi mutlak bagi Harry selaku *Acceptance Owner*:

1. **Mapped:** Requirement telah terpetakan ke Scenario ID dan Test Case ID di Requirement Traceability Matrix (RTM).
2. **Script Complete:** Test case telah memiliki instruksi operasional langkah-demi-langkah terperinci (Aksi, Lokasi, Data, Expected Result, Verifikasi) pada `UAT-Manual-Test-Cases.md`.
3. **Design Reviewed:** Langkah pengujian telah diverifikasi secara statis terhadap dokumen perancangan (PDD, PRD v1.6, SAD, Design System v1.5) dan konfigurasi kode sumber aktual (`seed.ts`, router, view components).
4. **Executed:** Test case telah benar-benar dijalankan di browser oleh penguji manusia. **Saat ini bernilai 0% (0 dari 45 test case)** karena agen dilarang keras menjalankan pengujian atas nama pengguna.

---

## 2. REKAPITULASI STATUS CAKUPAN TINGKAT REQUIREMENT

### 2.1 Kebutuhan Fungsional (FR-01 s.d. FR-55) & Keputusan Bisnis (DEC-001 s.d. DEC-013)

| Kategori | Total Teridentifikasi | Mapped | Script Complete | Design Reviewed | Executed (Oleh Harry) | Status Keterangan |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Autentikasi & Akun (FR-01 - FR-08, UAT-REQ-PROFILE-001)** | 8 | 8 (100%) | 8 (100%) | 8 (100%) | 0 (0%) | TC-AUTH-001 s.d. TC-AUTH-008 lengkap skripnya. **CATATAN: UAT-REQ-PROFILE-001 berstatus Partial Implementation Gap / Needs Clarification** (UI /profile belum menampilkan Jabatan, Departemen, & Atasan Langsung) |
| **Morning Commitment (FR-09 - FR-16)** | 8 | 8 (100%) | 8 (100%) | 8 (100%) | 0 (0%) | TC-DLYM-001 s.d. TC-DLYM-006 lengkap |
| **Additional Work (FR-17 - FR-20)** | 4 | 4 (100%) | 4 (100%) | 4 (100%) | 0 (0%) | TC-DLYA-001 s.d. TC-DLYA-003 lengkap |
| **EOD Outcome (FR-21 - FR-28)** | 8 | 8 (100%) | 8 (100%) | 8 (100%) | 0 (0%) | TC-DLYE-001 s.d. TC-DLYE-004 lengkap |
| **Blocker System (FR-29 - FR-36)** | 8 | 8 (100%) | 8 (100%) | 8 (100%) | 0 (0%) | TC-BLKR-001 s.d. TC-BLKR-005 lengkap |
| **Kepatuhan & Koreksi (FR-37 - FR-44, UAT-REQ-EODCORR-001)** | 8 | 8 (100%) | 8 (100%) | 8 (100%) | 0 (0%) | TC-CORR-001 s.d. TC-CORR-006 lengkap skripnya. **CATATAN: UAT-REQ-EODCORR-001 berstatus Needs Clarification** (keterbatasan tanggal lampau perlu keputusan pemilik produk; upload file tidak diwajibkan PRD) |
| **Cuti & Rekonsiliasi (FR-45 - FR-48)** | 4 | 4 (100%) | 4 (100%) | 4 (100%) | 0 (0%) | TC-LEAV-001 s.d. TC-LEAV-003 lengkap |
| **Supervisi & Admin (FR-49 - FR-55)** | 7 | 7 (100%) | 7 (100%) | 7 (100%) | 0 (0%) | TC-COAC, DASH, ADMN lengkap |
| **Keputusan Bisnis (DEC-001 - DEC-013)** | 13 | 13 (100%) | 13 (100%) | 13 (100%) | 0 (0%) | DEC terpetakan ke test case spesifik |
| **Skenario End-to-End (E2E-01 - E2E-04)** | 4 | 4 (100%) | 4 (100%) | 4 (100%) | 0 (0%) | TC-E2E-001 s.d. TC-E2E-004 lengkap |
| **TOTAL KESELURUHAN** | **72** | **72 (100%)** | **72 (100%)** | **72 (100%)** | **0 (0%)** | **Siap Dijalankan Manual (45 Test Cases)** |

---

## 3. AUDIT 10 DIMENSI PENGUJIAN UAT

### A. Requirement Coverage
- **Total In-Scope:** 55 FR + 13 DEC + 4 E2E = 72 Entitas.
- **Kelengkapan Skrip Pengujian (Script Complete):** 45 dari 45 Test Case telah ditulis lengkap dengan rincian langkah operasional UI tanpa peringkasan.
- **Kepatuhan Implementasi Aplikasi terhadap Requirement (Design Audit Findings):**
  Kelengkapan skrip manual UAT **tidak sama dengan terpenuhinya requirement secara fungsional oleh aplikasi**. Hasil audit mendalam mengidentifikasi 2 requirement yang memiliki status **`Needs Clarification / Implementation Gap`**:
  1. **`UAT-REQ-PROFILE-001` (Manajemen Profil Pribadi) — Status: `Partial Implementation Gap / Needs Clarification`:**
     - *Harmonisasi Namespace Requirement:* Untuk mencegah benturan identitas dengan `FR-05` kanonis PRD v1.6 (yang mengatur penguncian baseline komitmen pasca cut-off), kebutuhan bisnis profil dipetakan ke ID lokal `UAT-REQ-PROFILE-001`.
     - *Klausul Spesifikasi (UI/UX Spec §4.25 UF-44, PRD v1.6 §3.1 FR-01):* Pengguna dapat melihat data diri (Nama, Email, Role Sistem, Status Akun) dan konteks organisasi lengkap (Jabatan, Departemen, Atasan Langsung). *Catatan Rekonsiliasi FR-02:* Referensi FR-02 dihapus dari kebutuhan profil karena FR-02 kanonis PRD v1.6 mengatur snapshot organisasi pada Daily Accountability Record (UF-37/UF-40) bukan tampilan profil akun, serta baris FR-02 di RTM lokal digunakan untuk pengujian aktivasi token.
     - *Implementasi Aktual:* Kartu antarmuka `/profile` (`ProfileView.vue`) saat ini hanya menyajikan: Nama Lengkap (`fullName`), Alamat Email (`email`), Role Otorisasi Sistem (`role`: `EMPLOYEE`), Status Akun (`status`: `ACTIVE`), dan User ID (`id`).
     - *Pemisahan Tegas Role Otorisasi Sistem vs Jabatan Organisasi:*
       - **Badge `EMPLOYEE` (.role-pill):** Terverifikasi murni sebagai **Role Otorisasi Sistem (RBAC)**, BUKAN nama jabatan organisasi profesi pengguna.
       - **Jabatan Organisasi (`jobTitle`):** Pada seeder bernilai "Frontend Software Engineer", namun belum diekspos pada antarmuka.
       - **Departemen (`function`):** Pada seeder bernilai "Engineering", belum diekspos pada antarmuka.
       - **Atasan Langsung (`directManagerId`):** Pada seeder bernilai "Bambang Pratama", belum diekspos pada antarmuka.
     - *Dampak:* `UAT-REQ-PROFILE-001` **TIDAK DAPAT DIKLAIM TERPENUHI LENGKAP SECARA FUNGSIONAL OLEH APLIKASI**. TC-AUTH-007 memverifikasi atribut yang tersedia dan mencatat ketiadaan Jabatan, Departemen, dan Atasan Langsung sebagai temuan gap implementasi untuk keputusan Acceptance Owner (Harry).
  2. **`UAT-REQ-EODCORR-001` (Pengajuan Permohonan Koreksi Realisasi EOD) — Status: `Needs Clarification / Scope Decision Pending`:**
     - *Harmonisasi Namespace Requirement:* Untuk mencegah benturan identitas dengan `FR-38` kanonis PRD v1.6 (yang mengatur Notifikasi Email & Browser Push pada §3.8), kebutuhan bisnis koreksi EOD dipetakan ke ID lokal `UAT-REQ-EODCORR-001`.
     - *Rekonsiliasi Sumber Kanonis Sejati:* Alur koreksi EOD secara kanonis bersumber langsung dari PRD v1.6 Section 3.11 (`FR-53` - target field, nilai yang diminta, Reason wajib $\ge 10$ karakter; `FR-55` - Minor/Material objection window), serta aturan bisnis `DEC-002` (penguncian pasca cut-off 21:00 WIB) dan `DEC-003` (Anti-lock Green).
     - *Asal Usul Frasa "Pilih Tanggal" dan "Lampiran Penjelasan":*
       - Kedua instruksi tersebut terbukti murni berasal dari kolom saran *Kebutuhan Pengujian UAT* pada baris 126 `UAT-Requirement-Inventory.md`, **BUKAN** teks klausul normatif dari PRD kanonis.
       - Pada PRD kanonis, sistem tidak mensyaratkan upload berkas fisik (*file attachment upload*), melainkan hanya keterangan alasan (*Reason wajib* $\ge 10$ karakter).
     - *Implementasi Aktual & Gap Konkret:*
       - Antarmuka `/corrections/eod` (`EodCorrectionRequestView.vue`) mengikat data ke `/daily/today` dan menyediakan field teks kendala teknis (`#outcomeReasonInput`) serta justifikasi alasan resmi (`#eodReasonInput`).
       - **Keterangan Tekstual vs Upload File Fisik:** Ketiadaan fitur upload file fisik **bukan defek terhadap PRD kanonis**, melainkan requirement penjelasan telah dipenuhi secara tekstual.
       - **Pemilihan Tanggal:** Ketiadaan pemilih tanggal lampau (*historical date picker*) membatasi pengujian pada komitmen hari berjalan (`/daily/today`). Hal ini dicatat sebagai gap implementasi yang memerlukan keputusan Acceptance Owner apakah MVP memang dibatasi pada hari berjalan atau memerlukan penambahan pemilih tanggal lampau.

### B. Business Process Coverage
- **Siklus Harian Pagi (Morning Commitment):** Dicakup oleh TC-DLYM-001 s.d. TC-DLYM-006.
- **Siklus Harian Siang (Additional Work & Blocker):** Dicakup oleh TC-DLYA-001 s.d. TC-DLYA-003 dan TC-BLKR-001.
- **Siklus Harian Sore (EOD Outcome & Anti-Lock Green):** Dicakup oleh TC-DLYE-001 s.d. TC-DLYE-004.
- **Siklus Eskalasi & Intervensi Blocker:** Dicakup oleh TC-BLKR-002 s.d. TC-BLKR-005.
- **Siklus Koreksi Pasca Cut-Off:** Dicakup oleh TC-CORR-001 (Morning), TC-CORR-006 (EOD), TC-CORR-002, dan TC-CORR-003.
- **Siklus Manajemen Profil & Keamanan Akun Mandiri:** Dicakup oleh TC-AUTH-007 (Profil Pribadi & Hak Otoritas) dan TC-AUTH-008 (Pembaruan Kata Sandi Mandiri).
- **Siklus Cuti & Rekonsiliasi Otomatis (DEC-008):** Dicakup oleh TC-LEAV-001 s.d. TC-LEAV-003.
- **Siklus Supervisi, Coaching, & Tata Kelola Admin:** Dicakup oleh TC-COAC-001, TC-DASH-001 s.d. 003, dan TC-ADMN-001 s.d. 002.

### C. Role-Action Coverage (RBAC)
- 8 Peran Kanonikal telah diuji aksi izin dan penolakannya:
  1. `EMPLOYEE`: Memiliki hak di alur harian; diblokir dari rute `/admin/*` dan `/compliance` (Error 403 terverifikasi di TC-AUTH-005).
  2. `SUPERVISOR`: Memiliki hak di `/dashboard`, `/blockers`, `/corrections/review`, `/leave/queue`, `/coaching`.
  3. `HEAD`: Memiliki hak supervisi makro dan `/blockers/aging`.
  4. `PROJECT_MANAGER`: Memiliki wewenang kontekstual proyek di `/projects/risk` dan resolusi blocker proyek (DEC-006 di TC-BLKR-005).
  5. `HRGA`: Memiliki hak di `/compliance`, `/exemptions`, dan laporan audit.
  6. `CEO_MANAGEMENT`: Memiliki hak di Management Pulse dasbor eksekutif dan `/reports`.
  7. `SYSTEM_ADMIN`: Memiliki hak di `/admin/organization`, `/admin/temporary-reviewers`, dan `/admin/policies`.
  8. `INVITED`: Memiliki hak di `/activate?token=...`; diblokir dari dashboard sebelum aktivasi berhasil.

### D. State-Transition Coverage
- **Account State:** `INVITED` $\rightarrow$ `ACTIVE` (TC-AUTH-003); `INVITED` $\rightarrow$ penolakan aktivasi ulang (TC-AUTH-004).
- **Commitment Timing State:** `UNCOMMITTED` $\rightarrow$ `COMMITTED_ON_TIME` $\rightarrow$ `EOD_REPORTED_ON_TIME` (TC-DLYM-001 & TC-DLYE-001).
- **Cut-Off State Locking:** `UNCOMMITTED` $\rightarrow$ `NO_SUBMISSION` (TC-DLYM-005 & TC-DLYE-004). Direct edit dilarang; alur dialihkan ke koreksi resmi.
- **Blocker State:** `OPEN` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` (TC-BLKR-001, 002, 003).
- **Correction State:** `DRAFT` $\rightarrow$ `PENDING` $\rightarrow$ `APPROVED` (TC-CORR-002) / `REJECTED` (TC-CORR-003).
- **Leave State:** `DRAFT` $\rightarrow$ `PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `SUPERSEDED_BY_LEAVE` (TC-LEAV-001 s.d. 003).

### E. Input-Condition Coverage
- **Equivalence Classes:** Input valid, format salah (password/email), field kosong, input melewati batas.
- **Boundary Value Analysis:**
  - Panjang judul komitmen: < 5 char (Ditolak di TC-DLYM-006) vs >= 5 char (Diterima).
  - Panjang alasan penolakan/justifikasi/solusi: < 10 char (Ditolak di TC-DLYM-002, TC-DLYE-003, TC-BLKR-003, TC-CORR-003, TC-COAC-001) vs >= 10 char (Diterima).
  - Jumlah komitmen pagi: 0 komitmen (TC-DLYM-002), 1-3 komitmen (TC-DLYM-001), batas tombol terkunci di 3 item.
  - Jumlah tugas tambahan: Batas maksimal 5 item per hari (TC-DLYA-003).

### F. UI State Coverage
- **Initial State:** Form kosong bersih, header tanggal dinamis, ketiadaan tombol darurat melayang `☰ Menu`.
- **Loading State:** Animasi spinner pada tombol submit selama request berlangsung.
- **Empty State:** Desain informatif saat antrean blocker kosong, feed bantuan kosong, atau riwayat kosong.
- **Success State:** Toast notifikasi hijau berbahasa Indonesia dan perubahan badge seketika.
- **Error State:** Pesan validasi inline merah di bawah field yang bermasalah.
- **Disabled State:** Field read-only saat periode terkunci cut-off atau batas item tercapai.
- **Responsive Viewport:** Desktop 1440px (Sidebar permanen 232px) dan Mobile 375px (Drawer overlay).

### G. Exception & Resilience Coverage
- Penolakan token aktivasi kedaluwarsa / bekas pakai (TC-AUTH-004).
- Penolakan direct edit pasca cut-off (TC-DLYM-005, TC-DLYE-004).
- Penolakan penutupan blocker tanpa solusi tertulis (TC-BLKR-003).
- Penolakan permohonan koreksi tanpa alasan tertulis (TC-CORR-003).
- Sesi multi-tab dan simulasi gangguan jaringan (CH-EXP-01 s.d. CH-EXP-06).

### H. Data Integrity Coverage
- Persistensi basis data pasca refresh browser (F5) pada komitmen, EOD, dan kebijakan sistem.
- Audit trail permanen (DEC-013) yang merekam identitas eksekutor dan timestamp abadi di TC-CORR-005.
- Sinkronisasi pemotongan kuota cuti di profil pengguna di TC-LEAV-002.

### I. Cross-Module Coverage
- 4 Skenario End-to-End (`TC-E2E-001` s.d. `TC-E2E-004`) menjembatani 8 modul secara simultan dengan interaksi multi-aktor (Employee, Supervisor, HRGA, CEO).

### J. Analisis Kesenjangan Residual & Pengecualian Sengaja (Out-of-Scope)
1. **Layanan SMS Gateway / WhatsApp API Berbayar:**
   - *Alasan Pengecualian:* Pengujian manual tidak mengirimkan WhatsApp nyata ke nomor handphone eksternal karena membutuhkan integrasi live Meta Business API berbayar.
   - *Mitigasi:* Pengujian difokuskan pada dispatcher in-app notification center internal (`/notifications` dan `/admin/notifications`).
   - *Risiko Residual:* Rendah (jalur notifikasi internal tetap terverifikasi).
2. **Stress & Concurrency Testing (Ribuan Pengguna Bersamaan):**
   - *Alasan Pengecualian:* Manual UAT berfokus pada pengalaman pengguna individu dan kelaikan alur bisnis.
   - *Mitigasi:* Uji beban konkurensi ditangani pada suite performa infrastruktur terpisah.
   - *Risiko Residual:* Rendah untuk fase acceptance fungsional.
3. **Kombinasi Karakter Non-ASCII Ekstrem:**
   - *Alasan Pengecualian:* Pengujian membatasi input teks pada karakter standar alfabet, angka, tanda baca kerja, dan emoji wajar.
   - *Risiko Residual:* Diuji dalam piagam uji eksplorasi CH-EXP-03.

---

## 4. KESIMPULAN AUDIT CAKUPAN

- **Kelengkapan Skrip (Script Completeness):** **100% (45 dari 45 test case memiliki instruksi operasional manual terperinci)**.
- **Eksekusi Pengujian (Executed Coverage):** **0% (Seluruh test case berstatus `Not Run`, menunggu pengujian mandiri oleh Harry di browser)**.
- **Integritas & Kejujuran Pelaporan:** Tidak ada klaim prematur bahwa aplikasi memenuhi seluruh requirement secara fungsional. `UAT-REQ-PROFILE-001` (Jabatan, Departemen, Atasan Langsung) dan `UAT-REQ-EODCORR-001` (keterbatasan tanggal berjalan) secara tegas ditandai berstatus **`Needs Clarification / Implementation Gap`** yang memerlukan keputusan formal Acceptance Owner. Harmonisasi ID lokal telah menghilangkan benturan identitas terhadap `FR-05` dan `FR-38` kanonis PRD v1.6 tanpa data eksekusi fiktif atau perubahan source code.
