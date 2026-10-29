# WorkPulse — UAT Engineering Progress & Governance Tracker

> **Proyek:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Klien / Organisasi:** PT Dutamedia Mandiri Pratama  
> **Lead QA & UAT Architect:** Senior Software Quality Assurance Engineer & Manual Test Architect  
> **Target Pelaksana UAT:** Harry (Manual Tester & Acceptance Owner)  
> **Tanggal Inisialisasi:** 29 Oktober 2026  
> **Status Dokumen:** ACTIVE & AUDITED  

---

## 1. PANDUAN TATA KELOLA PROGRESS TRACKER

Progress Tracker ini disusun sesuai mandat **Phase 14 (Incremental Execution, Persistent Progress & Deliverable Completeness)** dari Master Prompt UAT. File ini mencatat seluruh fase rekayasa pengujian UAT, status artefak, kendala, dependensi antarfase, dan verifikasi terhadap 5 Quality Gates sebelum penyerahan paket pengujian final ke Harry.

### Definisi Status
- `Not Started`: Fase belum dimulai pengerjaannya.
- `In Progress`: Analisis atau penyusunan artefak sedang berlangsung.
- `Completed`: Artefak telah selesai dibuat secara lengkap, diverifikasi terhadap dokumen acuan, dan memenuhi kriteria kualitas tanpa data palsu/fiktif.
- `Blocked`: Pengerjaan tertahan oleh keputusan bisnis atau informasi yang belum tersedia.

---

## 2. STATUS FASE REKAYASA UAT (PHASE 1 — PHASE 14)

| Fase | Nama Fase | Status | Artefak Terkait | Tanggal Selesai | Catatan Kualitas |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Phase 1** | Complete Project & Requirement Analysis | `Completed` | Analisis statis PDD, PRD v1.6, UI/UX Spec, Design System v1.5, SAD, Prototipe HTML 01-25, dan Source Code Frontend/Backend. | 29 Okt 2026 | Seluruh 55 FR, 31 US, 13 DEC, 26 Prototipe, dan 25 Rute terpetakan utuh. |
| **Phase 2** | Requirement Inventory & Gap Analysis | `Completed` | `UAT/UAT-Requirement-Inventory.md` | 29 Okt 2026 | Mencakup inventarisasi FR-01 s.d. FR-55, US-01 s.d. US-31, DEC-001 s.d. DEC-013, serta analisis kesenjangan statis. |
| **Phase 3** | UAT Strategy & Test Plan | `Completed` | `UAT/UAT-Strategy-and-Test-Plan.md` | 29 Okt 2026 | Menjabarkan 13 pendekatan uji aktual, mitigasi risiko berbasis dampak bisnis, entry criteria, dan exit criteria. |
| **Phase 4** | Systematic Test Design & Scenario Catalog | `Completed` | `UAT/UAT-Test-Scenario-Catalog.md` | 29 Okt 2026 | Katalog skenario terstruktur per modul, peran, dan proses bisnis end-to-end. |
| **Phase 5** | Condition & Variation Matrix | `Completed` | `UAT/UAT-Test-Scenario-Catalog.md` (Bagian Matriks Variasi) | 29 Okt 2026 | Mencakup partisi ekivalensi, boundary input, empty state, offline, dan persistence. |
| **Phase 6** | Role, Workflow & Test Data Matrices | `Completed` | `UAT/UAT-Test-Data-Matrix.csv`<br>`UAT/UAT-Role-Action-Matrix.csv`<br>`UAT/UAT-Workflow-Transition-Matrix.csv` | 29 Okt 2026 | Matriks data konkret (kredensial seeder, token demo, payload form) dan aturan transisi status kanonikal. |
| **Phase 7** | Manual Test Case Specification | `Completed` | `UAT/UAT-Manual-Test-Cases.md` | 29 Okt 2026 | Rincian langkah demi langkah manual (Aksi, Lokasi, Data, Expected Result, Verifikasi) dengan kolom eksekusi dikosongkan. |
| **Phase 8** | Manual Execution Experience & Checklist | `Completed` | `UAT/UAT-Execution-Checklist.md` | 29 Okt 2026 | Urutan eksekusi logis 15 grup suite untuk meminimalkan logout/login ulang tanpa merusak independensi tes. |
| **Phase 9** | Exploratory Testing & Usability Charters | `Completed` | `UAT/UAT-Exploratory-Testing-Charters.md` | 29 Okt 2026 | 7 charter eksplorasi usability, kebingungan alur, edge case multi-tab, dan network degradation. |
| **Phase 10** | Evidence Gathering & Defect Logging | `Completed` | `UAT/UAT-Defect-Report-Template.md`<br>`UAT/UAT-Execution-Log.csv` | 29 Okt 2026 | Template defect komprehensif (Severity vs Priority) dan template lembar pencatatan eksekusi berstatus awal `Not Run`. |
| **Phase 11** | Traceability & Coverage Audit | `Completed` | `UAT/UAT-Requirement-Traceability-Matrix.csv`<br>`UAT/UAT-Coverage-Audit.md` | 29 Okt 2026 | Matriks RTM end-to-end (Requirement -> AC -> Scenario -> Test Case) dan audit matematis designed coverage. |
| **Phase 12** | Master Package Assembly & Guide | `Completed` | `UAT/UAT-README.md` | 29 Okt 2026 | Panduan komprehensif integrasi seluruh 16 artefak UAT untuk Harry. |
| **Phase 13** | Final Quality Gates Audit | `Completed` | `UAT/UAT-Final-Acceptance-Checklist.md` | 29 Okt 2026 | Verifikasi kelaikan penyerahan terhadap Gate A hingga Gate E. |
| **Phase 14** | Persistent Progress Tracking | `Completed` | `UAT/UAT-Progress-Tracker.md` | 29 Okt 2026 | Dokumentasi real-time status dan integritas pengerjaan bertahap. |

---

## 3. INVENTARISASI ARTEFAK DELIVERABLE (DIREKTORI `UAT/`)

| No | Nama Berkas | Tipe | Peruntukan Utama | Status Kelengkapan |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `UAT-Progress-Tracker.md` | Markdown | Pelacakan progres fase, kendala, dan kepatuhan quality gates. | **Lengkap & Terverifikasi** |
| 2 | `UAT-Strategy-and-Test-Plan.md` | Markdown | Strategi, 13 metodologi uji, ruang lingkup, entry & exit criteria. | **Lengkap & Terverifikasi** |
| 3 | `UAT-Requirement-Inventory.md` | Markdown | Inventarisasi FR-01 s.d. FR-55, US, Keputusan Desain, Gap Analysis. | **Lengkap & Terverifikasi** |
| 4 | `UAT-Test-Scenario-Catalog.md` | Markdown | Katalog skenario UAT terstruktur lintas modul dan peran. | **Lengkap & Terverifikasi** |
| 5 | `UAT-Manual-Test-Cases.md` | Markdown | Spesifikasi langkah manual pengujian lengkap (Field eksekusi kosong). | **Lengkap & Terverifikasi** |
| 6 | `UAT-Test-Data-Matrix.csv` | CSV | Dataset uji manual (Akun, Token, Form Input, Batasan). | **Lengkap & Terverifikasi** |
| 7 | `UAT-Requirement-Traceability-Matrix.csv` | CSV | Matriks keterlacakan RTM dari kebutuhan bisnis ke test case. | **Lengkap & Terverifikasi** |
| 8 | `UAT-Role-Action-Matrix.csv` | CSV | Matriks otorisasi peran (RBAC) terhadap rute & aksi sistem. | **Lengkap & Terverifikasi** |
| 9 | `UAT-Workflow-Transition-Matrix.csv` | CSV | Matriks status transition (Commitment, Blocker, Leave, Correction). | **Lengkap & Terverifikasi** |
| 10 | `UAT-Execution-Checklist.md` | Markdown | Panduan urutan eksekusi harian dan checklist kesiapan lingkungan. | **Lengkap & Terverifikasi** |
| 11 | `UAT-Exploratory-Testing-Charters.md` | Markdown | Piagam uji eksplorasi heuristik dan usability. | **Lengkap & Terverifikasi** |
| 12 | `UAT-Defect-Report-Template.md` | Markdown | Standar formulir pelaporan temuan kegagalan/bug. | **Lengkap & Terverifikasi** |
| 13 | `UAT-Execution-Log.csv` | CSV | Lembar pencatatan hasil eksekusi (Status awal `Not Run`). | **Lengkap & Terverifikasi** |
| 14 | `UAT-Coverage-Audit.md` | Markdown | Laporan audit cakupan uji rancangan vs kesenjangan residual. | **Lengkap & Terverifikasi** |
| 15 | `UAT-Final-Acceptance-Checklist.md` | Markdown | Formulir penandatanganan penerimaan sistem (Sign-off) oleh Harry. | **Lengkap & Terverifikasi** |
| 16 | `UAT-README.md` | Markdown | Panduan pengantar & navigasi master untuk penguji manual. | **Lengkap & Terverifikasi** |

---

## 4. VERIFIKASI QUALITY GATES (PHASE 13)

- [x] **Gate A — Source and Requirement Completeness:** Seluruh dokumen acuan (`01-PDD.md`, `02-PRD.md`, `03-UI-UX-Spec-Flow.md`, `04-Design-System.md`, `05-SAD.md`, 26 Prototipe HTML, 25 Penjelasan Halaman, dan Source Code) telah dianalisis secara statis tanpa asumsi fiktif.
- [x] **Gate B — Test Design Completeness:** Seluruh 55 Functional Requirements memiliki cakupan skenario uji yang mencakup happy path, negative path, boundary, exception, dan role-based testing.
- [x] **Gate C — Manual Execution Usability:** Seluruh test case memiliki rincian langkah operasional UI eksplisit (`Aksi`, `Lokasi`, `Data`, `Expected Result`, `Verifikasi`). Seluruh field hasil eksekusi (`Actual Result`, `Execution Status`, `Tester`, `Execution Date`, `Defect ID`, `Retest Result`) **DIBIARKAN KOSONG**.
- [x] **Gate D — Traceability and Coverage:** Keterlacakan requirement dua arah (FR -> Scenario -> Test Case -> Execution Log) telah dipetakan secara rapi dalam format CSV dan Markdown.
- [x] **Gate E — Safety and Integrity:** **TIDAK ADA** pengujian otomatis atau interaksi browser yang dijalankan oleh agen. Tidak ada bukti palsu. Source code aplikasi tidak dimodifikasi. Kredensial sensitif nyata tidak dibocorkan.

---

## 5. DEPENDENSI & RECOVERY CHECK
Seluruh berkas saling terhubung dengan skema ID yang unik dan konsisten:
- **Requirement ID:** `FR-01` s.d. `FR-55`, `NFR-01` s.d. `NFR-10`, `DEC-001` s.d. `DEC-013`
- **Scenario ID:** `SCN-AUTH-01` s.d. `SCN-E2E-04`
- **Test Case ID:** `TC-AUTH-001` s.d. `TC-E2E-004`
- **Test Data ID:** `TD-AUTH-01` s.d. `TD-LEAVE-05`
- **Charter ID:** `CH-EXP-01` s.d. `CH-EXP-07`

Jika pengujian dihentikan sementara atau dilanjutkan di lain waktu, penguji (Harry) cukup merujuk pada `UAT/UAT-Execution-Log.csv` untuk melanjutkan test case yang masih berstatus `Not Run`.
