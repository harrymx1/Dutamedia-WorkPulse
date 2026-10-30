# WorkPulse — UAT Engineering Progress & Governance Tracker (Remediated)

> **Proyek:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Klien / Organisasi:** PT Dutamedia Mandiri Pratama  
> **Lead QA & UAT Architect:** Senior Software Quality Assurance Engineer & Manual Test Architect  
> **Target Pelaksana UAT:** Harry (Manual Tester & Acceptance Owner)  
> **Tanggal Inisialisasi Awal:** 29 Oktober 2026  
> **Tanggal Audit Remediasi:** 29 Oktober 2026 (Sesi Audit Remediasi Dokumen)  
> **Status Dokumen:** REMEDIATED, AUDITED, & FULLY SYNCHRONIZED  

---

## 1. PANDUAN TATA KELOLA PROGRESS TRACKER

Progress Tracker ini diperbarui berdasarkan mandat **UAT Document Audit Remediation** untuk mencatat perbaikan menyeluruh atas temuan ketidakkonsistenan antar-artefak, penyempurnaan 19 test case yang sebelumnya belum memiliki langkah manual terperinci, penyelarasan matriks keterlacakan (RTM), dan sinkronisasi seluruh 16 artefak pengujian.

### Definisi Status
- `Not Started`: Fase belum dimulai pengerjaannya.
- `In Progress`: Analisis atau penyusunan artefak sedang berlangsung.
- `Remediated & Verified`: Artefak telah diaudit ulang secara statis, seluruh 45 test case terperinci telah disinkronkan, referensi gantung telah dihapus, dan memenuhi kriteria kualitas tanpa data palsu/fiktif.
- `Blocked`: Pengerjaan tertahan oleh keputusan bisnis atau informasi yang belum tersedia.

---

## 2. LOG PERBAIKAN TEMUAN AUDIT (AUDIT REMEDIATION LOG)

| No | Temuan Audit | Dampak Awal | Tindakan Remediasi yang Dilakukan | Status Pasca Remediasi |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Ketimpangan Test Case: `UAT-Manual-Test-Cases.md` hanya berisi 23 test case, sedangkan `UAT-Execution-Log.csv` berisi 42 test case. | 19 Test case tidak memiliki langkah operasional terperinci sehingga tidak dapat dieksekusi manual oleh Harry. | Menuliskan secara lengkap langkah operasional terperinci (Aksi, Lokasi, Data, Expected Result, Verifikasi) untuk ke-19 test case yang kurang di `UAT-Manual-Test-Cases.md`. | **RESOLVED (42/42 Lengkap)** |
| **2** | Ketiadaan Referensi RTM: `TC-E2E-001`, `TC-E2E-002`, `TC-E2E-003`, dan `TC-E2E-004` belum tercantum dalam RTM. | Keterlacakan skenario End-to-End ke requirement PRD terputus di RTM. | Menambahkan entri pemetaan keterlacakan untuk `E2E-01` s.d. `E2E-04` ke `UAT-Requirement-Traceability-Matrix.csv` menghubungkan seluruh FR/DEC terkait. | **RESOLVED (42/42 Terpetakan)** |
| **3** | Ketidaklengkapan Test Data: 10 Test Data ID yang digunakan dalam test case baru belum terdaftar di `UAT-Test-Data-Matrix.csv`. | Penguji tidak memiliki rujukan nilai data dan prasyarat pada beberapa test case. | Menambahkan `TD-DLYM-06`, `TD-DLYM-07`, `TD-DLYA-03`, `TD-DLYE-04`, `TD-DLYE-05`, `TD-BLKR-04`, `TD-BLKR-05`, `TD-CORR-03`, `TD-COAC-01`, `TD-DASH-01`, `TD-DASH-02` ke `UAT-Test-Data-Matrix.csv`. | **RESOLVED (38/38 Terdaftar)** |
| **4** | Klaim Coverage Prematur: Laporan coverage audit sebelumnya mengklaim 100% saat 19 test case belum dituliskan langkahnya. | Distorsi laporan kelaikan pengujian bagi stakeholder. | Memperbarui `UAT-Coverage-Audit.md` dengan memisahkan status secara jujur: `Mapped`, `Script Complete`, `Design Reviewed`, dan `Executed (0% karena manual)`. | **RESOLVED (Audit Jujur & Presisi)** |
| **5** | Penyelarasan Aturan Bisnis Seeder: Konfigurasi cut-off pagi (09:30 WIB) dan EOD (21:00 WIB) perlu diselaraskan dengan `seed.ts`. | Penguji bingung jika nilai waktu pengujian berbeda dari konfigurasi seeder riil. | Memverifikasi dan menyelaraskan nilai cut-off, durasi grace period (5 menit), dan SLA blocker (120 menit) sesuai database seeder resmi. | **RESOLVED (100% Sesuai Seeder)** |
| **6** | Requirement Gap FR-05, FR-06, FR-38: FR-05 dan FR-06 sebelumnya terpetakan umum ke TC-AUTH-001 (hanya login), dan FR-38 ke TC-CORR-001 (hanya morning correction). | Fitur manajemen profil (`/profile`), ganti kata sandi mandiri, dan koreksi evaluasi sore EOD (`/corrections/eod`) tidak memiliki test case manual eksplisit. | Merancang 3 test case terperinci baru: `TC-AUTH-007` (Profil Pribadi), `TC-AUTH-008` (Pembaruan Kata Sandi Mandiri & Validasi Form), dan `TC-CORR-006` (Koreksi Realisasi EOD Pasca Cut-Off). Menambahkan data uji `TD-AUTH-10` dan `TD-CORR-04`, menyelaraskan RTM, Checklist, Execution Log (45 baris `Not Run`), dan Role-Action Matrix. | **RESOLVED (45/45 Lengkap & Terpetakan)** |
| **7** | Micro Remediation TC-AUTH-007, TC-AUTH-008, TC-CORR-006: Pemeriksaan mendalam atas atribut profil (FR-05), penolakan password saat ini yang salah (FR-06), dan klarifikasi pemilihan tanggal serta lampiran kendala teknis (FR-38). | Potensi gap cakupan verifikasi password salah pada alur mandiri dan ambiguitas atribut profil/lampiran fisik. | Memperluas langkah TC-AUTH-007 dengan verifikasi eksplisit atribut profil dan mendokumentasikan ketiadaan visualisasi Departemen & Atasan pada kartu UI sebagai Needs Clarification; menambahkan langkah negatif validasi penolakan kata sandi saat ini yang salah pada TC-AUTH-008; memperjelas pengikatan tanggal inheren dan pemisahan field kendala teknis pada TC-CORR-006 serta mendokumentasikan ketiadaan upload berkas fisik sebagai Needs Clarification. | **RESOLVED (Cakupan Presisi & Jujur)** |
| **8** | Final Micro Audit FR-05 & FR-38: Penyelarasan definisi Jabatan vs Role otorisasi sistem pada FR-05/TC-AUTH-007 serta pencocokan kebutuhan pemilihan tanggal dan lampiran berkas pada FR-38/TC-CORR-006 terhadap teks asli PRD. | Potensi distorsi klaim coverage di mana Role EMPLOYEE dianggap sebagai Jabatan organisasi, dan ketidakpastian status pemilihan tanggal lampau serta lampiran berkas pada koreksi EOD. | Memperjelas pada TC-AUTH-007 bahwa badge EMPLOYEE adalah role RBAC dan bukan Jabatan profesi organisasi (Jabatan, Departemen, & Atasan belum diekspos di UI /profile - Partial Gap); memperjelas pada TC-CORR-006 bahwa pengikatan tanggal berjalan adalah gap implementasi untuk keputusan Acceptance Owner, serta mengonfirmasi bahwa upload file fisik tidak disyaratkan PRD; memperbarui UAT-Coverage-Audit.md agar membedakan secara tegas Script Complete vs status pemenuhan requirement oleh aplikasi. | **RESOLVED (Audit Jujur & Transparan)** |
| **9** | Final Source-Reconciliation Audit FR-05 & FR-38: Rekonsiliasi mendalam terhadap baseline dokumen kanonis PRD v1.6 dan spesifikasi perancangan untuk mencegah asumsi silang tidak terverifikasi. | Potensi misatribusi referensi kanonis di mana FR-38 inventori diasumsikan FR-53/FR-55 atau PRD §3.5 tanpa pembuktian, dan keraguan asal instruksi pemilihan tanggal serta frasa lampiran berkas. | Melakukan verifikasi statis komparatif antara PRD v1.6 kanonis, UI/UX Spec §4.25 (UF-44), dan inventori UAT. Menegaskan pada FR-05 bahwa badge EMPLOYEE adalah role otorisasi RBAC (ketiadaan Jabatan, Departemen, dan Atasan Langsung dicatat sebagai Partial Gap / Needs Clarification); membuktikan bahwa penomoran FR-38 pada inventori berbeda dari FR-38 kanonis PRD (Notifikasi §3.8) dan sitasi §3.5 merujuk inventori lokal (mekanisme koreksi EOD kanonis berada di §3.11); membuktikan bahwa frasa 'lampiran penjelasan' dan 'pilih tanggal' bersumber murni dari saran pengujian inventori UAT internal baris 126 dan bukan mandat PRD (PRD tidak mewajibkan upload file fisik); mengukuhkan status Needs Clarification untuk keputusan Acceptance Owner (Harry). | **RESOLVED (Baseline Kanonis Terekonsiliasi & Transparan)** |
| **10** | Final Requirement ID Harmonization (UAT-REQ-PROFILE-001 & UAT-REQ-EODCORR-001): Resolusi tuntas benturan identitas ID requirement lokal terhadap requirement kanonis PRD v1.6. | Benturan ID: `FR-05` lokal (Profil) bertabrakan dengan `FR-05` kanonis PRD v1.6 (penguncian baseline); `FR-38` lokal (Koreksi EOD) bertabrakan dengan `FR-38` kanonis PRD v1.6 (Notifikasi Email/Push). | Memigrasikan ID lokal ke namespace `UAT-REQ-PROFILE-001` (merujuk `03-UI-UX-Spec-Flow.md` §4.25 UF-44 dan PRD §3.1) dan `UAT-REQ-EODCORR-001` (merujuk PRD §3.11 FR-53/FR-55, DEC-002, DEC-003). Melakukan sinkronisasi penuh pada Inventori, RTM, Katalog Skenario, Test Cases, Log Eksekusi, dan Coverage Audit. Memastikan 0% benturan ID dan keterlacakan 100% tanpa mengubah ID test case (45 tetap utuh) dan tanpa data eksekusi fiktif. | **RESOLVED (ID Bebas Benturan & 100% Traceable)** |
| **11** | Targeted Traceability Correction FR-02 / Profile: Eliminasi ketidaksesuaian referensi FR-02 pada sumber profil UAT-REQ-PROFILE-001. | Referensi silang keliru: `UAT-REQ-PROFILE-001` mencantumkan sumber PRD §3.1 (FR-01, FR-02), padahal di RTM baris 4 `FR-02` digunakan untuk Aktivasi Token (TC-AUTH-003) dan di PRD v1.6 kanonis `FR-02` mengatur snapshot konteks organisasi Daily Accountability Record. | Melakukan verifikasi langsung ke PRD v1.6 FINAL §3.1 dan UI/UX Spec §10.1 baris 1290. Membuktikan bahwa sumber kanonis sejati profil adalah `03-UI-UX-Spec-Flow.md` §4.25 (UF-44) dan PRD §3.1 `FR-01`. Menghapus referensi `FR-02` dari `UAT-REQ-PROFILE-001` di Inventori, RTM, Test Cases (TC-AUTH-007), dan Coverage Audit. Mendokumentasikan perbedaan baris lokal FR-02 (Aktivasi) terhadap FR-02 kanonis PRD v1.6 (Snapshot Record) sebagai Needs Clarification harmonisasi inventori. Seluruh 45 test case tetap berstatus `Not Run`. | **RESOLVED (Sumber Profil 100% Presisi)** |

---

## 3. STATUS FASE REKAYASA UAT (PHASE 1 — PHASE 14)

| Fase | Nama Fase | Status | Artefak Terkait | Catatan Status |
| :--- | :--- | :---: | :--- | :--- |
| **Phase 1** | Project & Requirement Analysis | `Remediated & Verified` | PDD, PRD v1.6, UI/UX Spec, Design System v1.5, SAD, Prototipe 01-25, Source Code. | Seluruh 55 FR, 13 DEC, 25 Rute terverifikasi statis. |
| **Phase 2** | Requirement Inventory & Gap Analysis | `Remediated & Verified` | `UAT/UAT-Requirement-Inventory.md` | FR-01 s.d. FR-55, DEC-001 s.d. DEC-013, NFR terpetakan utuh. |
| **Phase 3** | UAT Strategy & Master Test Plan | `Remediated & Verified` | `UAT/UAT-Strategy-and-Test-Plan.md` | 13 Pendekatan uji aktual, risk-based prioritization, entry & exit criteria. |
| **Phase 4** | Systematic Test Design & Scenario Catalog | `Remediated & Verified` | `UAT/UAT-Test-Scenario-Catalog.md` | Seluruh katalog skenario terstruktur per modul, peran, dan user journey. Ditambahkan SCN-AUTH-07, SCN-AUTH-08, SCN-CORR-06. |
| **Phase 5** | Condition & Variation Matrix | `Remediated & Verified` | `UAT/UAT-Test-Scenario-Catalog.md` | Partisi ekivalensi, boundary input, empty state, dan offline handling. |
| **Phase 6** | Role, Workflow & Test Data Matrices | `Remediated & Verified` | `UAT-Test-Data-Matrix.csv`<br>`UAT-Role-Action-Matrix.csv`<br>`UAT-Workflow-Transition-Matrix.csv` | Seluruh 40 Test Data ID, 8 peran RBAC (termasuk rute `/profile` dan `/corrections/eod`), dan transisi lifecycle status terpetakan. |
| **Phase 7** | Manual Test Case Specification | `Remediated & Verified` | `UAT/UAT-Manual-Test-Cases.md` | **Tepat 45 Test Case Lengkap** (Aksi, Lokasi, Data, Expected Result, Verifikasi). Kolom eksekusi kosong. |
| **Phase 8** | Manual Execution Experience & Checklist | `Remediated & Verified` | `UAT/UAT-Execution-Checklist.md` | 15 Kelompok kerja sekuensial mencakup seluruh 45 test case. |
| **Phase 9** | Exploratory Testing & Usability Charters | `Remediated & Verified` | `UAT/UAT-Exploratory-Testing-Charters.md` | 7 Piagam uji eksplorasi heuristik (CH-EXP-01 s.d. CH-EXP-07). |
| **Phase 10** | Evidence Gathering & Defect Logging | `Remediated & Verified` | `UAT-Defect-Report-Template.md`<br>`UAT-Execution-Log.csv` | Template defect standar industri dan log eksekusi 45 baris berstatus awal `Not Run`. |
| **Phase 11** | Traceability & Coverage Audit | `Remediated & Verified` | `UAT-Requirement-Traceability-Matrix.csv`<br>`UAT-Coverage-Audit.md` | RTM sinkron 45/45 test case; audit coverage jujur membedakan designed vs executed. |
| **Phase 12** | Master Package Assembly & Guide | `Remediated & Verified` | `UAT/UAT-README.md` | Panduan navigasi master komprehensif untuk pengujian manual Harry. |
| **Phase 13** | Final Quality Gates Audit | `Remediated & Verified` | `UAT/UAT-Final-Acceptance-Checklist.md` | Verifikasi kelaikan penyerahan terhadap Gate A hingga Gate E. |
| **Phase 14** | Persistent Progress Tracking | `Remediated & Verified` | `UAT/UAT-Progress-Tracker.md` | Pencatatan audit dan remediasi berkala secara permanen di repositori. |

---

## 4. VERIFIKASI QUALITY GATES PASCA REMEDIASI

- [x] **Gate A — Source and Requirement Completeness:** Seluruh 55 FR dan 13 DEC diekstrak secara faktual dari PRD v1.6 dan implementasi basis data riil (`seed.ts`).
- [x] **Gate B — Test Design Completeness:** Seluruh 45 test case telah ditulis secara lengkap tanpa ada test case yang diringkas atau diabaikan.
- [x] **Gate C — Manual Execution Usability:** Setiap langkah memiliki `Aksi`, `Lokasi`, `Data`, `Expected Result`, dan `Verifikasi` eksplisit. Seluruh field eksekusi (`Actual Result`, `Execution Status`, `Tester`, `Execution Date`, `Defect ID`, `Retest Result`) **DIKOSONGKAN**.
- [x] **Gate D — Traceability and Coverage:** Keterlacakan RTM dua arah sinkron 100% (45 Test Case di Manual Script = 45 di Execution Log = 45 di RTM).
- [x] **Gate E — Safety and Integrity:** **TIDAK ADA** pengujian otomatis atau interaksi browser yang dijalankan oleh agen. Tidak ada kode sumber yang dimodifikasi. Tidak ada commit/push yang dilakukan pada fase audit ini sesuai instruksi aturan mutlak.
