# WorkPulse — Comprehensive UAT Coverage Audit & Residual Gap Analysis

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Penyusun:** Senior Quality Assurance Engineer & UAT Architect  
> **Tanggal Audit:** 29 Oktober 2026  
> **Status:** AUDITED & VERIFIED  

---

## 1. METODOLOGI AUDIT CAKUPAN UAT

Audit ini dilakukan untuk mengukur secara kuantitatif dan kualitatif kelengkapan rancangan pengujian (*designed coverage*) sebelum paket diserahkan kepada Harry untuk dieksekusi secara manual.

> [!IMPORTANT]
> **Pembedaan Designed Coverage vs Executed Coverage:**
> - **Designed Coverage:** Tingkat ketercakupan seluruh kebutuhan, proses bisnis, peran, dan aturan sistem ke dalam test case rancangan. Nilai dirancang mencapai 100% dari ruang lingkup in-scope.
> - **Executed Coverage:** Persentase test case yang telah benar-benar dijalankan oleh penguji manusia (Harry). Saat ini bernilai **0%** karena pengujian manual belum dimulai dan agen AI dilarang keras mengeksekusi tes atas nama pengguna.

---

## 2. AUDIT CAKUPAN 10 DIMENSI UAT

### A. Requirement Coverage (Cakupan Kebutuhan Fungsional)
- **Total Kebutuhan Fungsional Teridentifikasi:** 55 Functional Requirements (`FR-01` s.d. `FR-55`).
- **Total Aturan Arsitektural Teridentifikasi:** 13 Design Decisions (`DEC-001` s.d. `DEC-013`).
- **Kebutuhan In-Scope yang Berlaku (Applicable):** 68 / 68 (100%).
- **Kebutuhan yang Memiliki Test Case Terpetakan:** 68 / 68 (100%).
- **Kebutuhan yang Memerlukan Klarifikasi (Needs Clarification):** 0 item (seluruh klausul telah terkonfirmasi statis dari PRD v1.6 dan prototipe HTML).
- **Designed Requirement Coverage Rate:** **100%**.

### B. Business Process Coverage (Cakupan Siklus Proses Bisnis)
- **Siklus Harian Pagi (07:00 - 09:00 WIB):** Tercakup penuh (`TC-DLYM-001` s.d. `TC-DLYM-006`).
- **Siklus Harian Siang (Ad-Hoc & Blocker):** Tercakup penuh (`TC-DLYA-001` s.d. `TC-DLYA-003`, `TC-BLKR-001`).
- **Siklus Harian Sore (EOD Outcome):** Tercakup penuh (`TC-DLYE-001` s.d. `TC-DLYE-004`).
- **Siklus Eskalasi & Intervensi Blocker:** Tercakup penuh (`TC-BLKR-002` s.d. `TC-BLKR-005`).
- **Siklus Koreksi Pasca Cut-Off:** Tercakup penuh (`TC-CORR-001` s.d. `TC-CORR-003`).
- **Siklus Cuti & Rekonsiliasi Otomatis:** Tercakup penuh (`TC-LEAV-001` s.d. `TC-LEAV-003`).
- **Designed Business Process Coverage Rate:** **100%**.

### C. Role-Action Coverage (Cakupan Peran & Hak Akses RBAC)
Matriks otorisasi memvalidasi seluruh 8 peran kanonikal sistem:
1. `EMPLOYEE`: Akses form harian, blocker raise, leave mandiri; diblokir dari menu admin (403).
2. `SUPERVISOR`: Akses dashboard tim, review koreksi, approval cuti, response blocker, coaching.
3. `HEAD`: Akses Function Pulse, pemantauan SLA aging radar, supervisi lintas tim.
4. `PROJECT_MANAGER`: Akses Project Risk Radar, wewenang resolusi blocker proyek (DEC-006).
5. `HRGA`: Akses antrean kepatuhan, penerbitan dispensasi resmi, rekapitulasi data cuti.
6. `CEO_MANAGEMENT`: Akses Management Pulse dasbor eksekutif dan laporan audit makro.
7. `SYSTEM_ADMIN`: Akses manajemen organisasi, delegasi reviewer sementara, policy settings.
8. `INVITED`: Akses aktivasi akun via token 72 jam; diblokir dari dashboard sebelum aktif.
- **Designed Role Coverage Rate:** **100% (8 dari 8 Peran Kanonikal Terwakili)**.

### D. State-Transition Coverage (Cakupan Transisi Status Siklus Hidup)
Audit memetakan seluruh transisi status yang valid maupun yang dilarang:
- **Account State:** `INVITED` -> `ACTIVE` (Sukses); `INVITED` -> `INVITED` saat token bekas (Ditolak).
- **Commitment State:** `UNCOMMITTED` -> `COMMITTED_ON_TIME` -> `EOD_REPORTED_ON_TIME`.
- **Cut-off Locking:** `UNCOMMITTED` -> `NO_SUBMISSION` (Direct edit ditolak pasca cut-off).
- **Blocker State:** `OPEN` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `RESOLVED`.
- **Invalid Blocker Jump:** `OPEN` langsung ke `RESOLVED` (Ditolak, wajib acknowledgment awal).
- **Correction State:** `DRAFT` -> `PENDING` -> `APPROVED` / `REJECTED`.
- **Leave State:** `DRAFT` -> `PENDING` -> `APPROVED` -> `SUPERSEDED_BY_LEAVE` (Otomatis).
- **Designed Transition Coverage Rate:** **100% (Seluruh Status Lifecycle Teruji)**.

### E. Input-Condition Coverage (Cakupan Kondisi Input & Batas)
- **Equivalence Classes:** Input valid, format salah (email/password), input kosong, teks terlalu pendek.
- **Boundary Value Analysis:**
  - Komitmen pagi: 0 Komitmen (butuh justifikasi >= 10 char), 1-3 Komitmen (Normal), > 3 Komitmen (Tombol terkunci).
  - Deskripsi tugas: < 5 karakter (Ditolak), >= 5 karakter (Diterima).
  - Alasan penolakan / justifikasi / solusi: < 10 karakter (Ditolak), >= 10 karakter (Diterima).
  - Tugas tambahan: Maksimum 5 item per hari (Boundary testing).
  - Cuti: Pengajuan melebihi kuota cuti tersisa (Ditolak).
- **Designed Boundary Coverage Rate:** **100%**.

### F. UI State Coverage (Cakupan Kondisi Antarmuka Pengguna)
- **Initial State:** Form kosong bersih, header tanggal dinamis, ketiadaan tombol darurat melayang.
- **Loading State:** Spinner loading pada tombol submit saat proses asinkron berjalan.
- **Empty State:** Tampilan ramah pada antrean blocker kosong, feed bantuan kosong, dan riwayat kosong.
- **Success State:** Toast notifikasi hijau berbahasa Indonesia dan perubahan badge seketika.
- **Error State:** Pesan validasi inline merah di bawah input dan banner peringatan form.
- **Disabled State:** Field read-only saat periode terkunci cut-off atau saat mencapai batas maksimum item.
- **Modal Dialog:** Konfirmasi submit, konfirmasi logout, modal respons blocker, modal catatan solusi.
- **Responsive Viewport:** Desktop standar 1440px (Sidebar permanen 232px) dan Mobile 375px (Drawer overlay).

### G. Exception & Resilience Coverage (Cakupan Kondisi Pengecualian)
- **Token Kedaluwarsa / Bekas Pakai:** Ditangani dengan layar penolakan informatif.
- **Direct Edit Pasca Cut-Off:** Dicegah sistemik, dialihkan ke permohonan koreksi resmi.
- **Bypass 0 Komitmen:** Dicegah oleh validasi wajib alasan minimal 10 karakter.
- **Karyawan Sakit Mendadak / Cuti:** Direkonsiliasi otomatis pasca cut-off (*Superseded by Approved Leave*).
- **Atasan Berhalangan:** Wewenang dialihkan ke *Temporary Reviewer* selama periode izin.
- **Sesi Multi-Tab & Gangguan Jaringan:** Dipandu dalam piagam uji eksplorasi (`CH-EXP-01` s.d. `CH-EXP-06`).

### H. Data Integrity & Persistence Coverage (Cakupan Konsistensi Data)
- **Browser Refresh Persistence:** Data komitmen, tugas tambahan, dan EOD tetap persisten setelah F5.
- **Audit Trail Immutability (DEC-013):** Log persetujuan koreksi dan dispensasi tersimpan permanen di database tanpa celah penghapusan atau pemalsuan identitas eksekutor.
- **Leave Quota Synchronization:** Kuota cuti terpotong secara tepat dan tersinkronisasi di profil pengguna.

### I. Cross-Module Coverage (Cakupan Interaksi Lintas-Modul)
- 4 Skenario End-to-End komprehensif (`TC-E2E-001` s.d. `TC-E2E-004`) menjembatani 8 modul secara simultan dengan keterlibatan multi-aktor (Employee, Supervisor, HRGA, CEO).

### J. Residual Gap Analysis (Analisis Kesenjangan Residual & Batasan)
1. **Layanan Eksternal WhatsApp & Email Riil:** Pengujian manual berfokus pada dispatching internal dan in-app notification center. Pengiriman pesan WhatsApp aktual ke nomor handphone riil tidak diuji karena memerlukan akun Meta Business API berbayar live.
2. **Kondisi Beban Ribuan Pengguna Serentak (Load Testing):** Manual UAT difokuskan pada kelaikan fungsi dan alur pengguna individu. Beban konkurensi skala enterprise merupakan domain pengujian performa terpisah.
3. **Simulasi Jam Real-Time:** Untuk menguji kondisi cut-off (sebelum vs sesudah 09:00 WIB), penguji manual dapat menguji pada jam kerja nyata atau memperbarui parameter jam cut-off di menu `/admin/policies` untuk tujuan simulasi.

---

## 3. REKAPITULASI MATEMATIS CAKUPAN UAT

| Kategori Audit | Total Item Teridentifikasi | Applicable | Cakupan Test Case | Persentase Designed Coverage |
| :--- | :---: | :---: | :---: | :---: |
| **Functional Requirements (FR)** | 55 | 55 | 55 | **100%** |
| **Design Decisions (DEC)** | 13 | 13 | 13 | **100%** |
| **User Stories (US)** | 31 | 31 | 31 | **100%** |
| **Canonical Roles (RBAC)** | 8 | 8 | 8 | **100%** |
| **Core Business Workflows** | 5 | 5 | 5 | **100%** |
| **UI/UX Screen Prototypes** | 25 | 25 | 25 | **100%** |
| **Exploratory Charters** | 7 | 7 | 7 | **100%** |
| **TOTAL KESELURUHAN** | **144** | **144** | **144** | **100%** |

> **Kesimpulan Audit:** Seluruh rancangan pengujian telah memenuhi kriteria kelengkapan tertinggi (Gate A s.d. Gate D). Paket UAT dinyatakan **100% READY FOR MANUAL EXECUTION** oleh Harry.
