# DOKUMEN PERSIAPAN PERENCANAAN REMEDIASI & ALOKASI SIKLUS (PHASE 2)
## Analisis Sumber Kebenaran, Rekonsiliasi Inventaris 44 Finding, Pemetaan Dampak File, Integrasi Keputusan Owner, Register Temuan Teknis Terekonsiliasi, dan Otorisasi RWP

**Nomor Dokumen:** UAT-PHASE2-RPP-001  
**Versi Dokumen:** v2.5.1 (v2.5 + Errata E-01..E-06: alokasi draft, rujukan PRD, penempatan TECH-FIND-001)  
**Tanggal Penerbitan:** 02 November 2026  
**Otoritas Pengesahan:** Acceptance Owner & Lead Manual UAT Tester (Harry)  
**Tim Penyusun:** Senior Software Architect, Backend Engineer, QA Lead, & Governance Analyst  
**Status Dokumen:** FORMALLY ENDORSED PRE-PLANNING BASELINE (AUTHORIZED FOR RWP FORMULATION)  
**Dasar Hukum & Otoritas Tata Kelola:** `DEC-009-UAT`, `CHG-009`, Master Backlog `UAT/UAT-Improvement-Backlog.md`, dan Formal Direction Acceptance Owner (02 Nov 2026)

---

## LOG RIWAYAT REVISI DOKUMEN (REVISION HISTORY)

| Versi | Tanggal | Otoritas / Peninjau | Ringkasan Perubahan & Dasar Kebijakan |
|:---:|:---:|---|---|
| **v1.0** | 02 Nov 2026 | Tim Analisis UAT | Inisialisasi awal laporan persiapan perencanaan remediasi pasca ratifikasi clustering `DEC-009-UAT`. |
| **v2.0** | 02 Nov 2026 | Acceptance Owner (Harry) | Rekonsiliasi keanggotaan 4 kluster solusi teratifikasi (20 findings) dan temuan mandiri (24 findings); sinkronisasi deskripsi dari master backlog; pemisahan relasi file TopBar dari logika komitmen form harian. |
| **v2.1** | 02 Nov 2026 | Acceptance Owner (Harry) | Validasi mendalam dan pembuktian source code untuk `IMP-016`, `IMP-026`, dan `IMP-027`; pembuatan master matriks komprehensif 44 temuan dengan 11 atribut lengkap; penegasan status `VERIF-FIND-001` sebagai `OPEN / PENDING OWNER MITIGATION`. |
| **v2.2** | 02 Nov 2026 | Acceptance Owner (Harry) | Telaah konsistensi terminologi `IMP-027` dan `IMP-028` (*On-Time*, *LATE*, *Cut-Off*, *Grace Period*, *Jendela Toleransi*); inventarisasi 7 elemen permukaan paparan keamanan; perumusan 4 lapis Protokol Pencegahan Regresi Cycle 1. |
| **v2.3** | 02 Nov 2026 | Acceptance Owner (Harry) | Sanitasi seluruh literal token/kredensial (`[REDACTED]`); taksonomi 4 kategori secret; analisis presisi boundary waktu (09:00:00, 23:59:00, lockout, timezone sync); presisi perintah regresi Cycle 1 sesuai `package.json` dan pembuktian baseline 19 test cases; pencatatan keputusan tertunda Acceptance Owner. |
| **v2.4** | 02 Nov 2026 | Acceptance Owner (Harry) | Audit teknis end-to-end batas waktu & lockout; simulasi 9 kasus waktu kritis; pembuktian 4 lapisan pertahanan anti-backdating terhadap wraparound tengah malam; rekonsiliasi definitif baseline 19 unit test regression; kalibrasi tata kelola terminologi UI vs dokumen historis. |
| **v2.5** | 02 Nov 2026 | Acceptance Owner (Harry) | **Pengesahan Keputusan Produk & Otorisasi RWP (Berjalan Saat Ini):**<br>1. Pencatatan resmi keputusan produk Acceptance Owner: badge `Terlambat (LATE)` (kandidat `DEC-010-UAT`), eliminasi total frasa *Grace Period* & *Jendela Toleransi* dari UI, penegasan requirement batas pengisian pukul 23:59 WIB (`IMP-028`), persetujuan sementara presisi menit `HH:mm`, dan penetapan definisi operasional cut-off & lockout.<br>2. Reklasifikasi resmi Technical Findings Register: `TECH-FIND-001` menjadi **`IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`**, `TECH-FIND-002` menjadi **`PROVISIONAL APPROVAL — MINUTE RESOLUTION (HH:mm)`**, dan `TECH-FIND-003` menjadi **`DATE PROTECTION MECHANISM — NOT A REPLACEMENT FOR CUT-OFF VALIDATION`**.<br>3. Penegasan status 19 test cases sebagai Baseline Unit Test Regression (bukan hasil Manual UAT).<br>4. Pencatatan **Otorisasi Resmi Penyusunan Dokumen RWP** dengan penegasan batasan ketat tanpa modifikasi kode/database.<br>5. Pembaruan Remaining Owner Decisions Inventory. |
| **v2.5.1** | 02 Nov 2026 | Tim Penyusun | Errata E-01..E-06 (lihat bagian ERRATA di akhir dokumen): pemulihan keanggotaan alokasi draft ke rujukan v2.3, koreksi rujukan PRD dan penarikan klaim 100% konsisten, penempatan `TECH-FIND-001` menjadi usulan Cycle 3, klarifikasi status verifikasi. Tidak ada keputusan Owner yang diubah. |

---

## DAFTAR ISI
1. [EXECUTIVE SUMMARY & GOVERNANCE FOUNDATION](#1-executive-summary--governance-foundation)
2. [SOURCE OF TRUTH INVENTORY (INVENTARIS 10 SUMBER KEBENARAN)](#2-source-of-truth-inventory-inventaris-10-sumber-kebenaran)
3. [FORMAL PRODUCT DECISIONS & GOVERNANCE RECORD](#3-formal-product-decisions--governance-record)
4. [REVISED TIME BOUNDARY, SUBMISSION ELIGIBILITY, & SYSTEM LOCKOUT TECHNICAL AUDIT](#4-revised-time-boundary-submission-eligibility--system-lockout-technical-audit)
5. [DEEP VERIFICATION OF TARGETED FINDINGS: IMP-016, IMP-026, IMP-027](#5-deep-verification-of-targeted-findings-imp-016-imp-026-imp-027)
6. [HISTORICAL REMEDIATION CONTEXT & CYCLE 1 TEST REGRESSION BASELINE](#6-historical-remediation-context--cycle-1-test-regression-baseline)
7. [CORRECTED MASTER FINDING INVENTORY MATRIX (44 FINDINGS COMPLETE AUDIT)](#7-corrected-master-finding-inventory-matrix-44-findings-complete-audit)
8. [PROPOSED PLANNING METHODOLOGY (METODOLOGI PERENCANAAN REMEDIASI)](#8-proposed-planning-methodology-metodologi-perencanaan-remediasi)
9. [DRAFT CYCLE ALLOCATION INTEGRITY CHECK & RECONCILIATION](#9-draft-cycle-allocation-integrity-check--reconciliation)
10. [ENHANCED SECURITY RISK ASSESSMENT: VERIF-FIND-001 & COMPREHENSIVE RISK REGISTER](#10-enhanced-security-risk-assessment-verif-find-001--comprehensive-risk-register)
11. [ACCEPTANCE OWNER DECISIONS STATUS & REMAINING INVENTORY](#11-acceptance-owner-decisions-status--remaining-inventory)
12. [AUTHORIZATION FOR RWP FORMULATION & NEXT PLANNING ACTIVITIES](#12-authorization-for-rwp-formulation--next-planning-activities)
13. [GOVERNANCE COMPLIANCE & STRICT BOUNDARIES STATEMENT](#13-governance-compliance--strict-boundaries-statement)

---

## 1. EXECUTIVE SUMMARY & GOVERNANCE FOUNDATION

Laporan **UAT-PHASE2-RPP-001 Versi 2.5** ini mengodifikasikan penerimaan substantif dan keputusan formal Acceptance Owner terhadap hasil audit teknis v2.4, serta menjadi dokumen dasar (*formal pre-planning baseline*) yang mengotorisasi penyusunan lembar kerja *Remediation Work Packages* (RWP):

1. **Penerimaan Substantif & Integritas Ratifikasi Clustering:**  
   Acceptance Owner secara resmi menerima hasil audit teknis v2.4 secara substantif. Distribusi baseline 44 Improvement Findings (`IMP-001` s.d. `IMP-044`) yang telah diratifikasi melalui **`DEC-009-UAT`** dan **`CHG-009`** (**20 GROUP** dalam 4 kluster, **24 STANDALONE**, **0 REVIEW**) dinyatakan **TETAP BERLAKU SECARA MUTLAK DAN TIDAK BOLEH DIUBAH**.
2. **Kodifikasi Keputusan Produk Acceptance Owner:**  
   - **Terminologi IMP-027:** Disetujui badge antarmuka pengguna menampilkan murni **`Terlambat (LATE)`**. Frasa *Grace Period* dan *Jendela Toleransi* dihapus 100% dari antarmuka pengguna (UI), sementara dokumen sumber historis tetap mempertahankan istilah aslinya. Keputusan ini dicatat sebagai kandidat **`DEC-010-UAT`** (belum diklaim diratifikasi sebelum pencatatan formal).
   - **Batas Akhir IMP-028:** Ditegaskan bahwa requirement resmi batas akhir pengisian adalah pukul **`23:59 WIB`** sesuai baseline kebutuhan `IMP-028`. Nilai fallback backend saat ini (`09:30`) secara tegas ditetapkan sebagai ketidaksesuaian implementasi terhadap requirement.
   - **Presisi Waktu TECH-FIND-002:** Ditetapkan persetujuan sementara berbasis **presisi menit (`HH:mm`)**, di mana seluruh waktu pada menit `09:00` (termasuk 09:00:01 s.d. 09:00:59 WIB) dihitung `ON_TIME`, dan status `LATE` baru aktif mulai `09:01 WIB`.
   - **Definisi Operasional Batas Cut-Off & Lockout:** Pengisian diperbolehkan selama menit `23:59 WIB`. Penguncian sistem (*lockout*) efektif pada pukul `00:00:00 WIB` hari kalender berikutnya. Submission untuk tanggal kerja sebelumnya ditolak setelah pergantian tanggal kalender.
3. **Reklasifikasi Resmi Technical Findings Register:**  
   - **`TECH-FIND-001`:** Diklasifikasikan sebagai **`IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`** (ketidaksesuaian kode terhadap requirement 23:59 WIB; remedi diwajibkan saat implementasi RWP, perubahan kode saat ini belum diotorisasi).
   - **`TECH-FIND-002`:** Diklasifikasikan sebagai **`PROVISIONAL APPROVAL — MINUTE RESOLUTION (HH:mm)`** (persetujuan sementara untuk perencanaan remediasi).
   - **`TECH-FIND-003`:** Diklasifikasikan sebagai **`DATE PROTECTION MECHANISM — NOT A REPLACEMENT FOR CUT-OFF VALIDATION`** (guard anti-backdating DEC-008 adalah proteksi tanggal, bukan pengganti validasi cut-off yang benar).
4. **Kepastian Baseline Unit Test Regresi Cycle 1:**  
   Mempertahankan hasil rekonsiliasi definitif **tepat 19 test cases** (MorningCommitmentView: 6, EodOutcomeView: 4, daily.service: 9) dengan tingkat kelulusan **100% (19/19 Pass)**. Ditegaskan bahwa angka ini merupakan **Baseline Unit Test Regression**, bukan hasil Manual UAT.
5. **Otorisasi Penyusunan Dokumen RWP:**  
   Acceptance Owner memberikan izin resmi untuk memulai penyusunan dokumen Remediation Work Plan (RWP) berbasis 44 findings, clustering `DEC-009-UAT`, draft alokasi Cycle 2 (22), Cycle 3 (9), dan Cycle 4 (13), serta protokol perlindungan regresi Cycle 1. Otorisasi ini **hanya untuk penyusunan dan evaluasi dokumen perencanaan**, dan secara tegas **TIDAK MENGIZINKAN** implementasi kode, perubahan database/seeder, modifikasi master backlog, git commit/push, maupun penutupan risiko keamanan `VERIF-FIND-001`.

---

## 2. SOURCE OF TRUTH INVENTORY (INVENTARIS 10 SUMBER KEBENARAN)

Perencanaan remediasi bersandar secara hierarkis pada 10 sumber kebenaran berikut:

| No | Sumber Kebenaran | Lokasi Berkas / Referensi | Peran Tata Kelola & Otoritas Teknis |
|:--:|---|---|---|
| 1 | **Dokumen Perancangan Baru** | `Dokumen-Perancangan-untuk-Pengerjaan-Baru/` (`02-PRD.md`, `03-SAD.md`, `04-Design-System.md`, `05-UI-UX-Specification.md`) | Spesifikasi fungsional, arsitektur, token visual (warna, tipografi, grid), dan business rules resmi sistem WorkPulse. |
| 2 | **30 Mockup / Prototype HTML** | `Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/*.html` (30 berkas HTML) | *Visual gold standard* untuk layout, hierarki komponen, CSS layout, responsivitas, dan interaksi view. |
| 3 | **Master Improvement Backlog** | `UAT/UAT-Improvement-Backlog.md` | Sumber kebenaran tertinggi (*highest authority*) untuk identitas 44 temuan improvement dan Acceptance Criteria asli. |
| 4 | **Master Defect Backlog** | `UAT/UAT-Defect-Backlog.md` | Sumber kebenaran untuk identitas cacat fungsional (`DEF-001` s.d. `DEF-005`). |
| 5 | **Artefak Baseline Clustering Teratifikasi** | `Targeted-Clustering-Reassessment-Report.md`, `Review-Findings-Reassessment-Report.md`, `Final-Consistency-Validation-Report.md`, `Clustering-Calibration-Refinement-Report.md` v1.1 | Dasar pemetaan arsitektural solusi: 4 Kluster Solusi (20 finding) + 24 Standalone finding. |
| 6 | **Decision Log Acceptance Owner** | `UAT-Lifecycle/00-Governance/UAT-Decision-Log.md` | Catatan keputusan mengikat: `DEC-001` s.d. `DEC-007` (tata kelola awal), `DEC-008-UAT` (resolusi review & batasan negatif), `DEC-009-UAT` (ratifikasi baseline clustering). |
| 7 | **UAT Change Register** | `UAT-Lifecycle/00-Governance/UAT-Change-Register.csv` | Log formal perubahan baseline: `CHG-001` s.d. `CHG-009`. |
| 8 | **UAT Phase Register & Risk Log** | `UAT-Lifecycle/00-Governance/UAT-Phase-Register.csv` | Status fase siklus hidup dan register risiko aktif, termasuk risiko keamanan terbuka `VERIF-FIND-001`. |
| 9 | **Artefak Remediasi Cycle 1 Terdahulu** | `UAT-Lifecycle/Phase-3-Remediation/Cycle-1/` | Dokumentasi teknis penyelesaian `DEF-001` dan `DEF-002` (dual-layer submission locks). |
| 10 | **Repositori Aktual WorkPulse** | `frontend/` (Vue 3, Pinia, Tailwind) & `backend/` (NestJS, Prisma, PostgreSQL) | *Codebase reality*: status implementasi riil, arsitektur komponen, lapisan validasi, dan test suites. |

---

## 3. FORMAL PRODUCT DECISIONS & GOVERNANCE RECORD

### 3.1. Penegasan Status Hukum Tata Kelola: DEC-009-UAT vs Keputusan Produk Baru
Untuk menjaga kemurnian tata kelola proyek (*governance integrity*), tim analisis menegaskan batasan yuridis berikut:
1. **`DEC-009-UAT` Tetap FORMALLY RATIFIED:**  
   Keputusan `DEC-009-UAT` secara eksklusif mengesahkan **Klasifikasi Baseline Clustering 44 Temuan** (20 GROUP, 24 STANDALONE, 0 REVIEW) serta penetapan spesifik atas `IMP-011`, `IMP-015`, `IMP-016`, dan `IMP-040`. Ratifikasi ini **TIDAK DIUBAH** dan tetap berlaku mengikat.
2. **Kandidat Keputusan Formal `DEC-010-UAT` (Terminologi IMP-027):**  
   Acceptance Owner telah menyetujui secara resmi keputusan produk mengenai terminologi `IMP-027`. Namun, sesuai kaidah tata kelola yang ditegaskan Acceptance Owner, keputusan ini **DICATAT SEBAGAI KANDIDAT KEPUTUSAN `DEC-010-UAT`** dan tidak diklaim telah diratifikasi penuh sebelum pencatatan formal selesai ke dalam `UAT-Decision-Log.md`.
3. **Preservasi Mutlak Master Backlog & Dokumen Sumber:**  
   Master backlog `UAT/UAT-Improvement-Backlog.md` dan teks AC asli tetap menjadi sumber kebenaran tertinggi yang tidak diubah. Istilah historis seperti *"Grace Period"* dan *"Jendela Toleransi"* tetap dipertahankan pada dokumen sumber historis yang relevan sebagai bukti rekam jejak kondisi faktual saat UAT dilaksanakan.
4. **Pemisahan Tegas Terminologi UI Antarmuka vs Dokumen Sumber Historis:**
   - **Antarmuka Pengguna (End-User UI):** Dieliminasi 100% dari frasa arsitektural *Grace Period* dan *Jendela Toleransi*. Badge Subkotak 3 menampilkan murni **`Terlambat (LATE)`** (Badge Amber), dan banner keterlambatan menggunakan kalimat bisnis: *"Pengisian Melewati Batas Waktu... Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE)."*
   - **Dokumentasi Sumber & Historis (Technical/Governance Facing):** Tetap memuat istilah *Grace Period*, *Jendela Toleransi*, dan kode arsitektur (`DEC-004`, `DEF-001`, `DEF-002`) untuk kebutuhan penelusuran auditibilitas.

### 3.2. Identifikasi Penggunaan Istilah Bisnis
1. **`On-Time`:** Batas waktu kepatuhan pengisian komitmen pagi tepat waktu, yaitu pukul **`09:00 WIB`** (sesuai jam masuk kantor resmi PT Dutamedia Mandiri Pratama).
2. **`LATE`:** Status akuntabilitas operasional yang disematkan pada komitmen yang dikirimkan setelah batas On-Time (> 09:00 WIB) hingga sebelum batas Cut-Off. Status ini sah tercatat dalam sistem namun membawa status kepatuhan terlambat.
3. **`Cut-Off`:** Batas akhir mutlak sistem sebelum penguncian harian (*system lockout*). Pasca Cut-Off, pengisian komitmen terkunci total (*LOCKED*) dan memerlukan alur dispensasi/koreksi khusus.
4. **`Grace Period`:** Istilah arsitektural/teknis lama yang digunakan untuk menyebut rentang waktu pengisian antara 09:00 WIB s.d. batas cutoff.
5. **`Jendela Toleransi`:** Frasa bahasa Indonesia yang sempat dicantumkan dalam contoh teks badge Subkotak 3 pada master backlog `IMP-027` ("LATE (Jendela Toleransi)").

### 3.3. Analisis Perbedaan Makna Bisnis & Potensi Kontradiksi Mental Model
- **Benturan Semantik Bisnis:** Terdapat kontradiksi antara frasa *Grace Period* / *Jendela Toleransi* dengan prinsip akuntabilitas kerja. Dalam persepsi umum karyawan, kata "Toleransi" atau "Grace Period" mengimplikasikan "pengampunan tanpa konsekuensi" (seolah-olah pengisian jam 11:00 WIB tetap dianggap normal). Padahal, aturan bisnis WorkPulse secara tegas menyatakan bahwa pengisian setelah 09:00 WIB membawa konsekuensi status **`LATE`**.
- **Potensi Inkonsistensi Antarmuka:**
  - `IMP-028` secara eksplisit bertujuan menghapus istilah "Grace Period / Jendela Toleransi" dari banner keterlambatan dan menggantinya dengan microcopy bisnis: *"Pengisian Melewati Batas Waktu... Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE)."*
  - Namun, pada `IMP-027` butir 4, contoh teks badge Subkotak 3 pada master backlog masih menyebut: `badge LATE (Jendela Toleransi)`.
  - Jika Subkotak 3 tetap menampilkan label `(Jendela Toleransi)` sementara banner tepat di atasnya menyatakan `Pengisian Melewati Batas Waktu (LATE)`, maka terjadi *mental model contradiction* pada pengguna akhir.

### 3.4. Penegasan Batas Akhir IMP-028 (Requirement 23:59 WIB)
Acceptance Owner secara tegas menetapkan:
- Requirement resmi sistem untuk batas akhir pengisian Morning Commitment adalah pukul **`23:59 WIB`**, sesuai dengan baseline kebutuhan yang tertuang pada master backlog `IMP-028`.
- Keberadaan nilai fallback backend `'09:30'` pada kode saat ini secara resmi dinyatakan sebagai **ketidaksesuaian implementasi terhadap requirement**, bukan sebagai alternatif kebijakan yang setara.
- Perbaikan nilai fallback ini dimasukkan ke dalam paket kerja remediasi (RWP), dengan penegasan bahwa **perubahan kode saat ini belum diotorisasi**.

### 3.5. Persetujuan Sementara Presisi Waktu (TECH-FIND-002)
Untuk kebutuhan perencanaan remediasi Phase 2, Acceptance Owner menetapkan keputusan sementara:
- Sistem menggunakan **presisi menit (`HH:mm`)**.
- Seluruh penyerahan pada menit `09:00` (termasuk pukul 09:00:01 s.d. 09:00:59 WIB) dihitung sah sebagai **`ON_TIME`**.
- Status **`LATE`** baru aktif mulai menit `09:01 WIB`.
- Keputusan ini berstatus persetujuan sementara (*provisional approval*); tidak ada kode aplikasi yang diubah saat ini.

### 3.6. Definisi Operasional Batas Cut-Off & Lockout
Untuk dasar perumusan dokumen RWP, Acceptance Owner menetapkan definisi operasional sementara berikut:
1. Pengisian komitmen pagi masih diperbolehkan selama menit `23:59 WIB` (`23:59:00` s.d. `23:59:59 WIB`) dengan status `Terlambat (LATE)`.
2. Penguncian sistem (*lockout*) efektif berlaku pada pukul **`00:00:00 WIB`** hari kalender berikutnya.
3. Penyerahan untuk tanggal kerja sebelumnya secara mutlak ditolak setelah pergantian tanggal kalender melalui mekanisme anti-backdating guard.

---

## 4. REVISED TIME BOUNDARY, SUBMISSION ELIGIBILITY, & SYSTEM LOCKOUT TECHNICAL AUDIT

### 4.1. Alur Lengkap Eksekusi Waktu Backend (7 Tahap Sistem)

```
[Permintaan Masuk: POST /daily/morning atau GET /daily/today]
  │
  ├── 1. Penentuan Waktu Aktual Server
  │      ClockService.now() -> Mengembalikan Date sistem atau mockedDate (saat testing batas waktu)
  │
  ├── 2. Konversi Zona Waktu & Pemformatan String
  │      ClockService.todayString('Asia/Jakarta') -> YYYY-MM-DD
  │      now().toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false })
  │      -> Menghasilkan currentTimeStr (misal '09:00', '09:30', '23:59')
  │
  ├── 3. Pengambilan Kebijakan Waktu Aktif (Checkin Timing Policy)
  │      PolicyService.getActivePolicy(CHECKIN_TIMING, workDate)
  │      -> Konfigurasi: morningOnTimeCutoff, morningLockCutoff, timezone
  │
  ├── 4. Pemeriksaan Tanggal Kerja & Pergantian Hari (Anti-Backdating Guard / DEC-008)
  │      Evaluasi: if (inputWorkDate < todayStr)
  │      -> True: THROW AppException (BUSINESS_RULE_BACKDATING_FORBIDDEN / HTTP 422)
  │
  ├── 5. Evaluasi System Lockout (Cut-Off Penguncian Formulir / DEC-002)
  │      Evaluasi: if (currentTimeStr > morningLockCutoff)
  │      -> True: THROW AppException (BUSINESS_RULE_CUTOFF_LOCKED / HTTP 422)
  │
  ├── 6. Penentuan Status Akuntabilitas (On-Time vs Late)
  │      Evaluasi: currentTimeStr <= morningOnTimeCutoff ? ON_TIME : LATE
  │
  └── 7. Penegakan Atomic State Guard (Pencegahan Double Submission / DEF-001)
         Pemeriksaan existing.morningSubmittedAt != null
         -> Update atomic bersyarat: where { id, morningSubmittedAt: null }
         -> True: Commit data & simpan timestamp ISO UTC (TIMESTAMPTZ)
```

1. **Penentuan Waktu Aktual Server:** Menggunakan abstraksi `ClockService.now()` (`clock.service.ts` L12) dengan dukungan injeksi waktu pengujian deterministik (`setMockTime()`).
2. **Konversi Zona Waktu & Pemformatan:** Evaluasi tanggal kalender menggunakan `clockService.todayString('Asia/Jakarta')` (`YYYY-MM-DD`). Evaluasi jam kerja menggunakan `toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false })` menghasilkan format string `HH:mm`.
3. **Pengambilan Kebijakan Waktu:** Mengambil konfigurasi dari `PolicyService.getActivePolicy()`.
4. **Pemeriksaan Tanggal Kerja (Anti-Backdating Guard):** Pada `daily.service.ts` L145–151, jika `inputWorkDate < todayStr`, sistem langsung menolak dengan `BUSINESS_RULE_BACKDATING_FORBIDDEN` (HTTP 422).
5. **Evaluasi Batas Lockout Sistem (Cut-Off):** Pada `daily.service.ts` L172–178, jika `currentTimeStr > morningLockCutoff`, melempar `BUSINESS_RULE_CUTOFF_LOCKED` (HTTP 422).
6. **Penentuan Status Akuntabilitas:** Pada `daily.service.ts` L201–204, `currentTimeStr <= morningOnTimeCutoff ? TimingStatus.ON_TIME : TimingStatus.LATE`.
7. **Penyimpanan Timestamp & Proteksi Double Submission:** Timestamp disimpan bertipe `TIMESTAMPTZ` di PostgreSQL, dilindungi update atomic conditional `updateMany` bersyarat dan composite unique index `@@unique([userId, workDate])`.

---

### 4.2. Matriks Analisis 9 Kasus Batas Waktu Kritis

| No | Kasus Waktu (WIB) | Timestamp Aktual (UTC ISO-8601) | Waktu Backend (`currentTimeStr`) | Kondisi Perbandingan yang Dievaluasi | Status yang Dihasilkan | Diperbolehkan Submit? | Sistem Terkunci? | Bukti Lokasi Implementasi & Perilaku Aktual |
|:--:|---|---|:---:|---|:---:|:---:|:---:|---|
| 1 | **08:59:59 WIB** | `2026-11-02T01:59:59Z` | `'08:59'` | `'08:59' <= '09:00'` ($\text{true}$)<br>`'08:59' > morningLockCutoff` ($\text{false}$) | **`ON_TIME`** | **YA** | **TIDAK** | `daily.service.ts` L201. Jam sebelum batas on-time. |
| 2 | **09:00:00 WIB** | `2026-11-02T02:00:00Z` | `'09:00'` | `'09:00' <= '09:00'` ($\text{true}$)<br>`'09:00' > morningLockCutoff` ($\text{false}$) | **`ON_TIME`** | **YA** | **TIDAK** | `daily.service.ts` L201. Bersifat inklusif ($\le$), tepat jam 09:00:00 sah `ON_TIME`. |
| 3 | **09:00:01 WIB** | `2026-11-02T02:00:01Z` | `'09:00'` | `'09:00' <= '09:00'` ($\text{true}$)<br>`'09:00' > morningLockCutoff` ($\text{false}$) | **`ON_TIME`** *(Persetujuan Sementara)* | **YA** | **TIDAK** | `daily.service.ts` L48-55. Format `HH:mm` mengabaikan detik, sah On-Time per keputusan Owner. |
| 4 | **09:00:59 WIB** | `2026-11-02T02:00:59Z` | `'09:00'` | `'09:00' <= '09:00'` ($\text{true}$)<br>`'09:00' > morningLockCutoff` ($\text{false}$) | **`ON_TIME`** *(Persetujuan Sementara)* | **YA** | **TIDAK** | `daily.service.ts` L48-55. Tetap On-Time hingga detik 59 per keputusan presisi menit. |
| 5 | **09:01:00 WIB** | `2026-11-02T02:01:00Z` | `'09:01'` | `'09:01' <= '09:00'` ($\text{false}$)<br>`'09:01' > morningLockCutoff` ($\text{false}$) | **`LATE`** | **YA** | **TIDAK** | `daily.service.ts` L201-204. String berubah `'09:01'`, memicu status `LATE`. |
| 6 | **23:58:59 WIB** | `2026-11-02T16:58:59Z` | `'23:58'` | - Kode saat ini: `'23:58' > '09:30'` ($\text{true}$ / Discrepancy)<br>- Target RWP (23:59): `'23:58' > '23:59'` ($\text{false}$) | - Kode saat ini: **Terkunci**<br>- Target RWP: **`LATE`** | - Kode saat ini: **TIDAK**<br>- Target RWP: **YA** | - Kode saat ini: **YA**<br>- Target RWP: **TIDAK** | `daily.service.ts` L172. Fallback `'09:30'` terbukti sebagai implementation discrepancy. |
| 7 | **23:59:00 WIB** | `2026-11-02T16:59:00Z` | `'23:59'` | - Kode saat ini: `'23:59' > '09:30'` ($\text{true}$ / Discrepancy)<br>- Target RWP (23:59): `'23:59' > '23:59'` ($\text{false}$) | - Kode saat ini: **Terkunci**<br>- Target RWP: **`LATE`** | - Kode saat ini: **TIDAK**<br>- Target RWP: **YA** | - Kode saat ini: **YA**<br>- Target RWP: **TIDAK** | `daily.service.ts` L172. Strictly greater (`>`), string `'23:59'` masih diperbolehkan submit LATE. |
| 8 | **23:59:59 WIB** | `2026-11-02T16:59:59Z` | `'23:59'` | - Kode saat ini: `'23:59' > '09:30'` ($\text{true}$ / Discrepancy)<br>- Target RWP (23:59): `'23:59' > '23:59'` ($\text{false}$) | - Kode saat ini: **Terkunci**<br>- Target RWP: **`LATE`** | - Kode saat ini: **TIDAK**<br>- Target RWP: **YA** | - Kode saat ini: **YA**<br>- Target RWP: **TIDAK** | `daily.service.ts` L48-55. Format `HH:mm` tetap `'23:59'` hingga detik 59. |
| 9 | **00:00:00 WIB hari berikutnya** | `2026-11-02T17:00:00Z` | `'00:00'` | - String jam: `'00:00' > cutoff` ($\text{false}$ / wraparound)<br>- Tanggal kalender: `'2026-11-02' < '2026-11-03'` ($\text{true}$) | **DITOLAK (BACKDATING)** | **TIDAK** | **TERKUNCI SECARA TANGGAL** | `daily.service.ts` L145-151. Ditolak oleh `BUSINESS_RULE_BACKDATING_FORBIDDEN` (DEC-008). |

---

### 4.3. Keterbatasan Teknis Perbandingan String `HH:mm`
1. **Pemangkasan Resolusi Detik:** Opsi `hour: '2-digit', minute: '2-digit'` memangkas detik, sehingga rentang `09:00:00` s.d. `09:00:59 WIB` menghasilkan `'09:00'`. Berdasarkan keputusan Acceptance Owner pada v2.5, perilaku ini disetujui sementara sebagai toleransi bisnis 59 detik.
2. **Kelemahan Wraparound Tengah Malam:** Tepat pukul `00:00:00 WIB`, string waktu kembali ke `'00:00'`, di mana ekspresi `'00:00' > '23:59'` bernilai `false`. Evaluasi penguncian jam cut-off secara mandiri tidak mampu mendeteksi pergantian hari tanpa mekanisme proteksi tanggal.

---

### 4.4. Bukti Mekanisme Pertahanan Tanggal (Anti-Wraparound Multi-Layer Defense)
1. **Lapisan 1: Anti-Backdating Guard (DEC-008 pada `daily.service.ts` L145–151):** Submission hari kemarin pasca pergantian tanggal kalender langsung ditolak: `inputWorkDate < todayStr` $\rightarrow$ `BUSINESS_RULE_BACKDATING_FORBIDDEN` (HTTP 422).
2. **Lapisan 2: Composite Unique Key Prisma (`schema.prisma` L125):** Model `DailyAccountabilityRecord` memiliki deklarasi `@@unique([userId, workDate])` bertipe `@db.Date`.
3. **Lapisan 3: Frontend State Sync (`MorningCommitmentView.vue` L90–120):** Memuat ulang halaman setelah tengah malam memuat record hari baru (`workDate = '2026-11-03'`). Form kemarin tertinggal dengan `morningSubmittedAt = null` dan terkunci sebagai missing submission.
4. **Lapisan 4: ClockService Boundary (`clock.service.ts` L31–40):** Mengunci zona waktu `Asia/Jakarta` secara kanonikal via `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' })`.

---

### 4.5. Register Temuan Teknis Terekonsiliasi (Revised Technical Findings Register)

#### [TECH-FIND-001] Ketidaksesuaian Nilai Default Batas Lockout Morning Commitment (09:30 vs 23:59)
- **Klasifikasi Resmi Acceptance Owner:** **`IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`**
- **File Terdampak:** `backend/src/daily/services/daily.service.ts` (L57, L172), `backend/src/policy/policy.constants.ts` (L43), `backend/prisma/seed.ts` (L268)
- **Analisis Ketidaksesuaian:**  
  Requirement master backlog `IMP-028` secara tegas menetapkan bahwa komitmen pagi dapat diserahkan hingga pukul `23:59 WIB` dengan status `Terlambat (LATE)`. Keberadaan nilai fallback `'09:30'` pada kode saat ini secara resmi dinyatakan sebagai ketidaksesuaian implementasi terhadap requirement.
- **Tindakan Perencanaan:**  
  Diwajibkan remediasi penyelarasan nilai default kanonikal menjadi `'23:59'` pada paket pekerjaan terkait (usulan Cycle 3; lihat Errata E-03). Dicatat secara tegas bahwa **perubahan kode saat ini belum diotorisasi**.

#### [TECH-FIND-002] Penentuan Presisi Waktu Keterlambatan Morning Commitment
- **Klasifikasi Resmi Acceptance Owner:** **`PROVISIONAL APPROVAL — MINUTE RESOLUTION (HH:mm)`**
- **File Terdampak:** `backend/src/daily/services/daily.service.ts` (L48–55, L162–169)
- **Analisis Keputusan:**  
  Acceptance Owner menyetujui secara sementara penggunaan format menit `HH:mm`. Seluruh penyerahan pada menit `09:00` (termasuk pukul 09:00:01 s.d. 09:00:59 WIB) dihitung sah sebagai `ON_TIME`, dan status `LATE` baru aktif mulai `09:01 WIB`.
- **Tindakan Perencanaan:**  
  Dipertahankan sebagai basis perencanaan remediasi; kode aplikasi tidak diubah.

#### [TECH-FIND-003] Peran Anti-Backdating Guard dalam Penguncian Tengah Malam
- **Klasifikasi Resmi Acceptance Owner:** **`DATE PROTECTION MECHANISM — NOT A REPLACEMENT FOR CUT-OFF VALIDATION`**
- **File Terdampak:** `backend/src/daily/services/daily.service.ts` (L145, L172)
- **Analisis Keputusan:**  
  Sesuai arahan Acceptance Owner, guard anti-backdating (`BUSINESS_RULE_BACKDATING_FORBIDDEN`) didokumentasikan sebagai mekanisme proteksi tanggal yang valid saat pergantian kalender, namun **tidak boleh dianggap sebagai pengganti validasi Cut-Off jam yang benar**.
- **Tindakan Perencanaan:**  
  Mekanisme multi-layer saat ini dipertahankan, dan pada perumusan RWP akan dipastikan bahwa logika validasi cut-off dan proteksi tanggal berjalan komplementer dan saling menguatkan.

---

### 4.6. Penelusuran Aturan Cut-Off terhadap Sumber (Dikoreksi Errata v2.5.1, E-02)
> [!WARNING] Koreksi
> Versi v2.5 menyatakan PRD Seksi 3.2 membagi hari menjadi tiga zona (`< 09:00`, `09:01–23:59`, `> 23:59`) dan menyatakan seluruh sumber **100% konsisten**. Pembacaan langsung PRD menunjukkan: (a) PRD Seksi 3.2 adalah *Daily Accountability Record* dan tidak memuat notasi tersebut; (b) norma klasifikasi waktu ada pada **FR-26 dan AC-57** (PRD Seksi 3.6) dengan notasi `submittedAt ≤ On-Time Deadline`, `Cut-Off = On-Time Deadline + Grace Period`; (c) nilai 09:00/09:30 pada SAD adalah **nilai ilustratif**, bukan konstanta produksi; (d) nilai `23:59` bersumber dari master backlog `IMP-027`/`IMP-028` dan keputusan Acceptance Owner. Pernyataan "100% konsisten" **ditarik**. Rincian perbedaan ada pada RWP v0.1 Bagian 4 (Requirement Clarification).

---

## 5. DEEP VERIFICATION OF TARGETED FINDINGS: IMP-016, IMP-026, IMP-027

### 5.1. Deep Dive Verification IMP-016 (Cross-Page Workflow Bar Button)
- **Judul Asli Master Backlog:** Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
- **Kategori:** User Experience (UX)
- **Modul & Terkait Test Case:** Halaman Kerja Harian (`/daily/morning`, `/daily/additional`, `/daily/eod`); `TC-DLYM-001`, `TC-BLKR-001`
- **Kondisi Aktual Master Backlog:** Tombol Lapor Blocker saat ini hanya muncul di halaman EOD Outcome, dan terdapat potensi duplikasi penempatan di header bar dan konten dalam.
- **Rasional & Nilai Manfaat:** Memungkinkan karyawan melaporkan hambatan kritis kapan saja (pagi, siang, maupun sore) dengan lokasi tombol yang konsisten dan ergonomis.
- **Seluruh Unsur Acceptance Criteria (AC):**
  1. Letakkan satu tombol "+ Lapor Blocker" yang konsisten pada masing-masing ketiga halaman My Today (`/daily/morning`, `/daily/additional-work`, `/daily/eod`).
  2. Tombol diposisikan sejajar di baris tab workflow (1 Morning Commitment, 2 Additional Work, 3 EOD Outcome) pada ujung kanan sesuai batas margin dan grid desain prototipe.
  3. Tombol mengarahkan navigasi langsung ke rute kanonikal `/blockers/raise`.
  4. Penempatan tombol konsisten secara visual dan interaktif di ketiga halaman tanpa pergeseran layout (*layout shift*).
- **Bukti Pemetaan terhadap Source Code:**
  1. `frontend/src/views/daily/MorningCommitmentView.vue` (L289-302): Komponen `<nav class="workflow-bar">` saat ini hanya memuat 3 tautan tab alur kerja. Ujung kanan baris tab terbukti **BELUM** memiliki tombol "+ Lapor Blocker".
  2. `frontend/src/views/daily/AdditionalWorkView.vue` (L130-143): Komponen `<nav class="workflow-bar">` juga terbukti **BELUM** memiliki tombol "+ Lapor Blocker" di sisi kanan baris tab.
  3. `frontend/src/views/daily/EodOutcomeView.vue` (L290-303): Baris tab alur kerja **BELUM** memiliki tombol terpadu di ujung kanan baris tab, melainkan tombol lapor diletakkan secara terisolasi pada area konten lain.
- **Tingkat Ketergantungan & Klasifikasi:** **STANDALONE**. Modifikasi terbatas pada area navigasi tab bar lokal di masing-masing dari ketiga view tanpa menyentuh shared TopBar maupun logika form submit.

---

### 5.2. Deep Dive Verification IMP-026 (Refinement Header Panel Konteks Harian)
- **Judul Asli Master Backlog:** Penyempurnaan Header Panel Konteks Waktu dan Penyesuaian Visual
- **Kategori:** Visual Polish & Microcopy
- **Modul & Terkait Test Case:** Halaman Morning Commitment (`/daily/morning`); `TC-DLYM-001`
- **Kondisi Aktual Master Backlog:** Panel konteks informasi waktu pada bagian atas formulir Morning Commitment menampilkan teks dan tata letak yang kurang rapi, serta terdapat ketidakseragaman ukuran tipografi dengan panel di sekitarnya.
- **Rasional & Nilai Manfaat:** Meningkatkan kejelasan visual dan keterbacaan (*readability*) parameter waktu kerja harian tanpa membingungkan pengguna baru.
- **Seluruh Unsur Acceptance Criteria (AC):**
  1. Terapkan grid layout yang seimbang dan responsif pada header konteks waktu Morning Commitment sesuai acuan visual Prototipe 02 (`02-morning-commitment.html`).
  2. Selaraskan ukuran font judul panel, subjudul, dan nilai jam agar proporsional dan seragam dengan kartu konteks lainnya.
  3. Pastikan penanda tanggal kerja harian (*work date indicator*) tampil jelas dengan format tanggal bahasa Indonesia yang baku.
  4. Perubahan visual tidak menggeser atau merusak elemen interaktif formulir di bawahnya.
- **Bukti Pemetaan terhadap Source Code:**
  - `frontend/src/views/daily/MorningCommitmentView.vue` (L310-335): Elemen `<div class="context-panel">` memuat komponen waktu dan tanggal kerja harian. Penataan padding, ukuran teks heading, dan penempatan badge status masih memerlukan penyesuaian CSS agar presisi terhadap Prototipe 02.
- **Tingkat Ketergantungan & Klasifikasi:** **STANDALONE**. Perubahan murni menyentuh lapisan CSS dan tata letak visual lokal panel konteks, zero logic modification.

---

### 5.3. Deep Dive Verification IMP-027 (Refinement Subkotak 3 Konteks Status & Badge)
- **Judul Asli Master Backlog:** Penyesuaian Visual dan Status pada Kotak Informasi Ketiga Panel Konteks
- **Kategori:** Visual Polish & Microcopy
- **Modul & Terkait Test Case:** Halaman Morning Commitment (`/daily/morning`); `TC-DLYM-001`
- **Kondisi Aktual Master Backlog:** Kotak informasi ketiga (Subkotak 3) pada panel konteks waktu Morning Commitment menampilkan teks status yang terlalu padat dan kontras badge yang kurang optimal pada mode tampilan tertentu.
- **Rasional & Nilai Manfaat:** Memberikan feedback visual yang tegas dan nyaman dibaca terkait status keterisian komitmen harian dan status waktu (On-Time / Late / Locked).
- **Seluruh Unsur Acceptance Criteria (AC):**
  1. Rapikan tata letak informasi di dalam Subkotak 3 panel konteks waktu Morning Commitment sesuai acuan Prototipe 02.
  2. Optimalkan kontras warna badge status dan ukuran font agar mudah terbaca pada berbagai resolusi layar.
  3. Pastikan pemisahan visual yang jelas antara label indikator dan nilai status akuntabilitas.
  4. Status yang ditampilkan pada badge harus konsisten dengan kondisi riil pengguna (misal: badge `ON-TIME`, badge `LATE (Jendela Toleransi)`, atau status terkunci `LOCKED`).
- **Bukti Pemetaan terhadap Source Code:**
  - `frontend/src/views/daily/MorningCommitmentView.vue` (L340-355): Elemen Subkotak 3 `<div class="context-card status-card">` saat ini menampilkan badge status keterisian form. Kode sumber mengevaluasi status via computed property lokal. Teks badge pada kode sumber riil saat ini (L350) adalah `<span v-else-if="isLate" class="badge badge-late">LATE (Jendela Toleransi)</span>`.
- **Keputusan Produk Resmi (v2.5):**  
  Badge Subkotak 3 disetujui menampilkan murni **`Terlambat (LATE)`** atau **`LATE`** (Badge Amber) dan mengeliminasi kata `(Jendela Toleransi)` pada UI antarmuka (kandidat `DEC-010-UAT`), sejalan dengan `IMP-028`. Dokumen sumber master backlog tetap dipertahankan utuh.
- **Tingkat Ketergantungan & Klasifikasi:** **STANDALONE**. Terisolasi pada Subkotak 3 panel konteks di `MorningCommitmentView.vue`.

---

## 6. HISTORICAL REMEDIATION CONTEXT & CYCLE 1 TEST REGRESSION BASELINE

### 6.1. Konteks Historis Remediasi Cycle 1
Sebelum memasuki perencanaan Phase 2, sistem WorkPulse telah melalui pengujian UAT manual intensif yang mengidentifikasi 2 cacat kritis terkait penyerahan data harian:
1. **DEF-001 (Morning Commitment Double-Submission Vulnerability):** Formulir Morning Commitment memungkinkan penyerahan berulang jika halaman di-refresh.
2. **DEF-002 (EOD Outcome Persistent Lock Bypass):** Formulir evaluasi akhir hari (EOD) dapat diserahkan kembali pasca refresh.

Kedua cacat tersebut telah diselesaikan pada Cycle 1 melalui implementasi *Dual-Layer Atomic Lock Architecture* (Frontend State Lock + Backend Atomic Conditional Update Guard).

---

### 6.2. Kepastian Baseline Unit Test Regresi Cycle 1 (19 Test Cases)
Sesuai penegasan Acceptance Owner, hasil rekonsiliasi pengujian berikut ditegaskan secara resmi sebagai **Baseline Unit Test Regression** untuk pengujian otomatis pra-commit, **BUKAN hasil pelaksanaan Manual UAT**:

| Test Suite File | Dokumen v2.2 | Dokumen v2.5 | Source Code Aktual | Test Dieksekusi | Hasil Aktual | Keterangan Status Rekonsiliasi |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `frontend/src/views/daily/MorningCommitmentView.spec.ts` | 6 Tests | 6 Tests | **6 Tests** | **6 Tests** | **100% Pass (6/6)** | Konsisten. Menguji header, zero commitment, 3 slots, dan 3 kondisi DEF-001. |
| `frontend/src/views/daily/EodOutcomeView.spec.ts` | 6 Tests | 4 Tests | **4 Tests** | **4 Tests** | **100% Pass (4/4)** | Terkoreksi Definitif. Dokumen v2.2 salah asumsi dokumentasi. Source code sejak awal memiliki 4 tests. |
| `backend/src/daily/services/daily.service.spec.ts` | 9 Tests | 9 Tests | **9 Tests** | **9 Tests** | **100% Pass (9/9)** | Konsisten. Menguji backdating, zero commitment, carry-over, DEF-001, DEF-002, race condition. |
| **TOTAL BASELINE CYCLE 1** | *21 Tests* | *19 Tests* | **19 Tests** | **19 Tests** | **100% PASS (19/19)** | **Baseline Unit Test Regresi Terbukti Sah & Lulus 100%.** |

---

### 6.3. Bukti Log Eksekusi Aktual Pengujian Terfokus (Vitest Runner)

Pengujian dijalankan langsung menggunakan perintah resmi yang terdaftar pada `package.json` (`"test": "vitest run --passWithNoTests"`):

#### 1. Frontend Morning Commitment Suite:
```bash
$ cd frontend && npm test -- src/views/daily/MorningCommitmentView.spec.ts
 RUN  v3.2.7 D:/PKL Duta Media/Dutamedia-WorkPulse/frontend
 ✓ src/views/daily/MorningCommitmentView.spec.ts (6 tests) 206ms
   1. renders Morning Commitment header and context panels
   2. toggles zero commitment mode on checkbox check (DEC-004)
   3. allows adding commitment slots up to 3 (DEC-004)
   4. Kondisi A — Belum Submit: timestamp null, sebelum cutoff, form aktif dan submit tersedia
   5. Kondisi B — Sudah Submit: timestamp tersedia, form terkunci dan submit tersembunyi (DEF-001)
   6. Kondisi C — Setelah Refresh: status dimuat dari backend dan form tetap terkunci persisten

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

#### 2. Frontend EOD Outcome Suite:
```bash
$ cd frontend && npm test -- src/views/daily/EodOutcomeView.spec.ts
 RUN  v3.2.7 D:/PKL Duta Media/Dutamedia-WorkPulse/frontend
 ✓ src/views/daily/EodOutcomeView.spec.ts (4 tests) 197ms
   1. renders EOD Outcome page and reflections panel with unconstrained GREEN option (DEC-003)
   2. Kondisi A — Belum Submit: timestamp null, sebelum cutoff, evaluasi dapat diisi dan submit tersedia
   3. Kondisi B — Sudah Submit: timestamp tersedia, form terkunci dan submit tersembunyi (DEF-002)
   4. Kondisi C — Setelah Refresh: status dimuat dari backend dan form tetap terkunci persisten

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

#### 3. Backend Daily Service Suite:
```bash
$ cd backend && npm test -- src/daily/services/daily.service.spec.ts
 RUN  v3.2.7 D:/PKL Duta Media/Dutamedia-WorkPulse/backend
 ✓ src/daily/services/daily.service.spec.ts (9 tests) 14ms
   1. throws BUSINESS_RULE_BACKDATING_FORBIDDEN when workDate is past (DEC-008)
   2. requires justification when 0 commitments is submitted (DEC-004)
   3. successfully processes 0 commitments with valid reason (DEC-004)
   4. evaluates carry-over chain and increments carryOverDaysCount (DEC-013)
   5. throws BUSINESS_RULE_ALREADY_SUBMITTED when morning commitment is already submitted (DEF-001)
   6. succeeds when pre-existing record has null morningSubmittedAt (Two-Path conflict resolution)
   7. permits employee to confirm GREEN status even with carry-overs (DEC-003 No Green Lock)
   8. throws BUSINESS_RULE_ALREADY_SUBMITTED when EOD outcome is already submitted (DEF-002)
   9. throws BUSINESS_RULE_ALREADY_SUBMITTED when conditional atomic update fails due to concurrency race

 Test Files  1 passed (1)
      Tests  9 passed (9)
```

---

### 6.4. Protokol Perlindungan Regresi 4 Lapis (Regression Protection Protocol)
1. **Lapis 1 — Immutable Core Logic Contract:** Dilarang keras memodifikasi deklarasi fungsi submit harian tanpa otorisasi tertulis Acceptance Owner.
2. **Lapis 2 — Automated Pre-Commit Regression Gate:** Wajib lulus 100% pada ke-3 suite pengujian regresi di atas (19 tests).
3. **Lapis 3 — Change Impact Assessment Matrix (Zonasi Perubahan):**
   - **Zona Hijau (Co-located / Isolated UI Polish):** Teks statis, SVG, padding/margin (`IMP-016`, `IMP-027`, `IMP-031`, `IMP-034`).
   - **Zona Amber (Form Inputs & Validation Logic):** Radio button, textarea, helper formatter (`IMP-029`, `IMP-030`, `IMP-036`, `IMP-037`, `IMP-038`, `IMP-039`).
   - **Zona Merah (Protected Core Logic):** Submit handler, Prisma query, service daily. Wajib otorisasi formal.
4. **Lapis 4 — Owner Explicit Authorization:** Otorisasi formal Acceptance Owner sebelum modifikasi elemen terlindungi.
---

## 7. CORRECTED MASTER FINDING INVENTORY MATRIX (44 FINDINGS COMPLETE AUDIT)

### 7.1. Rekonsiliasi Master Matriks 44 Temuan
Bagian ini menyajikan seluruh 44 temuan improvement (`IMP-001` s.d. `IMP-044`) dengan integritas 100% terhadap master backlog `UAT/UAT-Improvement-Backlog.md` dan ratifikasi clustering `DEC-009-UAT`.

### 7.2. Ringkasan Distribusi Klasifikasi & Kluster Solusi
- **GROUP Findings:** 20 Findings terbagi dalam 4 Kluster Solusi Terpadu:
  - `SOL-AUTH-HERO` (7 findings: `IMP-001` s.d. `IMP-006`, `IMP-012`).
  - `SOL-SHLL-TOPB` (8 findings: `IMP-014`, `IMP-015`, `IMP-018`, `IMP-019`, `IMP-020`, `IMP-024`, `IMP-025`, `IMP-043`).
  - `SOL-PROF-LAYO` (2 findings: `IMP-021`, `IMP-022`).
  - `SOL-BLKR-FORM` (3 findings: `IMP-041`, `IMP-042`, `IMP-044`).
- **STANDALONE Findings:** 24 Findings (`IMP-007` s.d. `IMP-011`, `IMP-013`, `IMP-016`, `IMP-017`, `IMP-023`, `IMP-026` s.d. `IMP-040`).
- **REVIEW Findings:** 0 Findings.
- **Total:** Tepat 44 findings (100% Zero Omission, zero duplicates).

---

### 7.3. Master Matriks Audit Komprehensif 44 Findings (11 Atribut Lengkap, 100% Backlog Fidelity)
Matriks berikut menyajikan seluruh 44 temuan (`IMP-001` s.d. `IMP-044`) dengan 11 atribut lengkap, menjaga seluruh kondisi penerimaan individual dari master backlog secara utuh tanpa diringkas secara berlebihan:

#### [IMP-001] Penyempurnaan Tagline Value Proposition Hero Login
- **Finding ID:** `IMP-001`
- **Original Title:** Penyempurnaan Tagline Value Proposition Hero Login
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Tagline berbunyi: *"Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur."*
  - *Rasional / Nilai Manfaat:* Memberikan penekanan yang lebih tajam pada aspek deteksi risiko dini bagi tim dan manajemen sejak awal hari.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ubah copywriting menjadi lebih berfokus pada mitigasi risiko dan transparansi, contohnya: *"Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur."* atau formulasi nilai manfaat lain yang lebih tepat.
- **Target Module / Component:** Hero Left Panel (<aside class="brand-column">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L98-102)`
- **Dependency:** Berbagi kolom hero panel kiri dengan IMP-002 s.d. IMP-006, IMP-008.
- **Risk & Verification Consideration:** Visual layout shift pada mobile <= 992px. Verifikasi: visual check & LoginView.spec.ts.

---
#### [IMP-002] Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- **Finding ID:** `IMP-002`
- **Original Title:** Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Judul poin pertama tertulis *"Komitmen Pagi Tuntas"*.
  - *Rasional / Nilai Manfaat:* Menghindari bias persepsi bahwa sistem WorkPulse hanya digunakan pada pagi hari; mencerminkan siklus akuntabilitas kerja harian yang menyeluruh.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ganti frasa *"Komitmen Pagi Tuntas"* dengan istilah yang mencakup siklus komitmen secara utuh, bukan hanya pagi hari melainkan pemantauan kendala di tengah hari dan evaluasi di akhir hari.
- **Target Module / Component:** Hero Feature Point 1 Title
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L50-54)`
- **Dependency:** Berbagi list container dengan IMP-003, IMP-006.
- **Risk & Verification Consideration:** Kerapian teks 2 baris pada mobile. Verifikasi: visual audit terhadap Prototipe 01.

---
#### [IMP-003] Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- **Finding ID:** `IMP-003`
- **Original Title:** Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Subtitle poin 1 berbunyi *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."*
  - *Rasional / Nilai Manfaat:* Bahasa terasa lebih memotivasi, menekankan dampak dan realisme komitmen dibanding sekadar keterikatan administratif pada jam cut-off.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Sesuaikan kalimat menjadi: *"Tentukan 1 hingga 3 komitmen harian yang berdampak dan realistis."* (atau diselaraskan setelah judul poin 1 disepakati).
- **Target Module / Component:** Hero Feature Point 1 Subtitle
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L55-58)`
- **Dependency:** Terkait langsung dengan judul pada IMP-002.
- **Risk & Verification Consideration:** Konsistensi ukuran font subtitle hero. Verifikasi: visual check Prototipe 01.

---
#### [IMP-004] Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- **Finding ID:** `IMP-004`
- **Original Title:** Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Rumusan judul dan deskripsi poin 2 belum presisi sama dengan spesifikasi dokumen perancangan UI/UX.
  - *Rasional / Nilai Manfaat:* Konsistensi 100% antara spesifikasi desain produk resmi dengan implementasi antarmuka.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Samakan secara kanonikal dengan prototipe UI/UX:
  - Judul: **"Pelaporan Blocker Cepat"**
  - Subtitle: **"Transparansi kendala teknis atau ketergantungan alur kerja agar segera mendapat bantuan."**
- **Target Module / Component:** Hero Feature Point 2 Title & Subtitle
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L60-68)`
- **Dependency:** Berbagi list container dengan IMP-002, IMP-005, IMP-006.
- **Risk & Verification Consideration:** Keselarasan tipografi dengan Design System v1.5.0. Verifikasi: visual check.

---
#### [IMP-005] Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- **Finding ID:** `IMP-005`
- **Original Title:** Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Rumusan judul dan deskripsi poin 3 belum sepenuhnya mengadopsi teks resmi prototipe UI/UX.
  - *Rasional / Nilai Manfaat:* Menegaskan filosofi WorkPulse sebagai platform pemberdayaan dan pendampingan, bukan sekadar alat monitoring (*micromanagement*).
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Samakan secara kanonikal dengan prototipe UI/UX:
  - Judul: **"Kemitraan & Dukungan Tim"**
  - Subtitle: **"Bukan alat pengawasan kaku, melainkan ruang sinkronisasi ritme kerja tim."**
- **Target Module / Component:** Hero Feature Point 3 Title & Subtitle
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L70-78)`
- **Dependency:** Berbagi list container dengan IMP-002, IMP-004, IMP-006.
- **Risk & Verification Consideration:** Keselarasan tipografi pilar ketiga. Verifikasi: visual check Prototipe 01.

---
#### [IMP-006] Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- **Finding ID:** `IMP-006`
- **Original Title:** Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Visual Design & Styling | Terkait ``TC-AUTH-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Ketiga poin fitur saat ini menggunakan emotikon/emoji berwarna bawaan platform.
  - *Rasional / Nilai Manfaat:* Meningkatkan visual maturity, konsistensi render di lintas platform OS/browser, dan estetika enterprise grade.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ganti emoji dengan 3 ikon vektor SVG profesional sesuai icon set desain sistem (Lucide icons / Heroicons) yang dipakai pada prototipe UI/UX.
- **Target Module / Component:** Hero Feature Points SVG Icons
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L45-80)`
- **Dependency:** Mempengaruhi rendering ikon ketiga poin fitur hero panel.
- **Risk & Verification Consideration:** Ukuran viewBox SVG dan stroke width tidak seragam. Verifikasi: rendering check.

---
#### [IMP-007] Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
- **Finding ID:** `IMP-007`
- **Original Title:** Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Headline form berbunyi *"Fokus pada Hasil, Tuntaskan Kendala."*
  - *Rasional / Nilai Manfaat:* Selaras dengan esensi WorkPulse yang mencakup penetapan komitmen, transparansi blocker harian, dan evaluasi hasil secara proporsional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Rumuskan kembali headline agar mencakup transparansi komitmen dan kolaborasi, tidak terkesan sempit pada pelaporan hasil akhir semata.
- **Target Module / Component:** Right Form Header (<h2> & <p class="lead-text">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L126-127)`
- **Dependency:** Independen dari hero kiri; co-located di dalam LoginView.vue.
- **Risk & Verification Consideration:** Text wrapping pada card login mobile 375px. Verifikasi: TC-AUTH-001.

---
#### [IMP-008] Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
- **Finding ID:** `IMP-008`
- **Original Title:** Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Visual Design & Styling | Terkait ``TC-AUTH-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Label versi tertulis statis: *"WorkPulse v2.0 • Clean-Slate Architecture"*.
  - *Rasional / Nilai Manfaat:* Penomoran versi selaras dengan dokumen acuan rilis internal dan menghapus istilah teknis arsitektur dari hadapan pengguna umum.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ganti teks tersebut menjadi *"WorkPulse v1.5 · Dutamedia"* dan pastikan penomoran versi dapat terbaca secara fleksibel/dinamis dari konfigurasi rilis aplikasi.
- **Target Module / Component:** Brand Footer Version String & Build Configuration
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L110-112), package.json`
- **Dependency:** Konfigurasi versi build (appConfig / package.json / env).
- **Risk & Verification Consideration:** Pembacaan variabel build tidak reaktif jika hardcoded. Verifikasi: unit test & visual check.

---
#### [IMP-009] Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
- **Finding ID:** `IMP-009`
- **Original Title:** Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Header form login menampilkan nama badan usaha *"PT Dutamedia Mandiri Pratama"*.
  - *Rasional / Nilai Manfaat:* Memberikan penegasan batas ruang kerja internal tanpa redundansi nama perusahaan yang sudah terwakili di logo dan branding.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ubah label penanda konteks menjadi *"Internal Workspace Environment"*.
- **Target Module / Component:** Right Form Context Badge (<span class="screen-tag">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L125)`
- **Dependency:** Independen; co-located di form login kanan.
- **Risk & Verification Consideration:** Kontras warna tag terhadap background form. Verifikasi: TC-AUTH-001.

---
#### [IMP-010] Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
- **Finding ID:** `IMP-010`
- **Original Title:** Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Footer menampilkan detail teknis implementasi keamanan: *"Perlindungan sesi via HttpOnly & CSRF Double-Submit"*.
  - *Rasional / Nilai Manfaat:* Memberikan nilai bantu nyata kepada karyawan awam saat menghadapi kesulitan autentikasi, dibanding menampilkan jargon teknis backend/security.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ganti microcopy menjadi teks panduan praktis: *"Kendala akses akun? Hubungi Tim IT Support atau Tim HRGA."*
- **Target Module / Component:** Right Form Footer Help Microcopy (<div class="help-hint">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L205-207)`
- **Dependency:** Independen; co-located pada footer form kanan.
- **Risk & Verification Consideration:** Keterbacaan teks bantuan pada viewport kecil. Verifikasi: visual check.

---
#### [IMP-011] Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
- **Finding ID:** `IMP-011`
- **Original Title:** Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Feature Enhancement | Terkait ``TC-AUTH-001`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Belum tersedia tautan / tombol *"Lupa kata sandi?"* pada form login.
  - *Rasional / Nilai Manfaat:* Alur penanganan lupa kata sandi merupakan standar esensial bagi pengguna aplikasi web untuk mencegah kebuntuan akses.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Sediakan tombol/link *"Lupa kata sandi?"* yang memunculkan petunjuk resmi bagi pengguna (misal modal popover instruksi untuk menghubungi Admin/HRGA, atau integrasi alur reset terkontrol).
- **Target Module / Component:** Password Field Action & Administrative Support Guidance Modal
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L150-165)`
- **Dependency:** Co-located di form login kanan. Terikat keputusan DEC-008-UAT (Modal panduan saja).
- **Risk & Verification Consideration:** Scope creep (Dilarang ada backend SMTP/endpoint reset). Verifikasi: modal trigger & closing.

---
#### [IMP-012] Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
- **Finding ID:** `IMP-012`
- **Original Title:** Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-AUTH-HERO`
- **Category & Test Case:** Layout & Spacing | Terkait ``TC-AUTH-003`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Pada tab Aktivasi Akun, panel hijau di sisi kiri belum memiliki keselarasan penuh dengan kondisi panel kiri pada tab Masuk Sistem.
  - *Rasional / Nilai Manfaat:* Memberikan pengalaman visual yang konsisten dan mulus bagi pengguna saat berpindah antara tab login dan aktivasi.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Samakan visual panel hijau kiri pada tab Aktivasi Akun persis dengan tab Masuk Sistem (desktop), termasuk implementasi perbaikan copywriting dan ikon SVG baru, dengan tetap menyembunyikannya pada viewport mobile.
- **Target Module / Component:** Activation View Left Hero Column (<aside class="brand-column">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/ActivateView.vue (L30-80)`
- **Dependency:** Penyelarasan visual 1:1 dengan hero kolom kiri LoginView.vue.
- **Risk & Verification Consideration:** Inkonsistensi styling antara halaman /login dan /activate. Verifikasi: cross-view audit.

---
#### [IMP-013] Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit
- **Finding ID:** `IMP-013`
- **Original Title:** Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** User Experience (UX) | Terkait ``TC-AUTH-002`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Skenario UAT saat ini berfokus pada salah password dasar; belum menguji secara khusus pesan error saat akun berstatus `INACTIVE` dan reaksi proteksi *Rate-Limit Lockout* (ThrottlerGuard).
  - *Rasional / Nilai Manfaat:* Memastikan keamanan sistem tetap diimbangi dengan kejelasan umpan balik (*user feedback*) saat terjadi kondisi pencegahan akses.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Dokumentasikan kandidat skenario pengujian lanjutan pasca-UAT inti untuk memvalidasi keramahan pesan error saat akun dinonaktifkan oleh HRGA serta saat percobaan login melebihi batas rate limit.
- **Target Module / Component:** Login Form Exception Filter & Error State Presentation
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/auth/LoginView.vue (L80-95), frontend/src/stores/auth.ts`
- **Dependency:** Mapping kode error backend INACTIVE_ACCOUNT pada auth store.
- **Risk & Verification Consideration:** Penanganan error mapping tidak menangkap state nonaktif. Verifikasi: mock test via akun sintetis.

---
#### [IMP-014] Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar
- **Finding ID:** `IMP-014`
- **Original Title:** Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Visual Design & Styling | Terkait ``TC-AUTH-001`, `TC-DLYM-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Tombol profil di ujung kanan atas berupa tombol teks / link standar.
  - *Rasional / Nilai Manfaat:* Tampilan header menjadi lebih bersih, elegan, dan hemat ruang horizontal (*clean visual hierarchy*).
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ganti tombol teks dengan komponen avatar/ikon profil melingkar sesuai prototipe UI/UX Design.
- **Target Module / Component:** TopBar Profile Action Container (Avatar Icon)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/components/common/TopBar.vue (or Shell Header)`
- **Dependency:** Bagian dari SOL-SHLL-TOPB; terhubung ke auth.user profile route.
- **Risk & Verification Consideration:** Aksesibilitas tombol avatar keyboard focus. Verifikasi: TC-AUTH-001 & shell audit.

---
#### [IMP-015] Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
- **Finding ID:** `IMP-015`
- **Original Title:** Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Navigation & Architecture | Terkait ``TC-DLYM-001`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Header menampilkan tombol teks "Riwayat Saya" di samping tombol profil.
  - *Rasional / Nilai Manfaat:* Menghadirkan pusat kesadaran notifikasi instan bagi pengguna tanpa harus menavigasi menu tersembunyi.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ganti tombol tersebut menjadi tombol Ikon Notifikasi (lonceng) dengan indikator titik merah (*unread badge*) bila terdapat notifikasi baru, sesuai rancangan prototipe UI/UX Design.
- **Target Module / Component:** TopBar Notification Action Container (Static Bell Icon)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/components/common/TopBar.vue (or Shell Header)`
- **Dependency:** Bagian dari SOL-SHLL-TOPB; navigasi statis ke /notifications. Terikat DEC-008-UAT.
- **Risk & Verification Consideration:** Scope creep (Dilarang ada WebSocket/unread count). Verifikasi: klik membuka rute /notifications.

---
#### [IMP-016] Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
- **Finding ID:** `IMP-016`
- **Original Title:** Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** User Experience (UX) | Terkait ``TC-DLYM-001`, `TC-BLKR-001`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Tombol Lapor Blocker saat ini hanya muncul di halaman EOD Outcome, dan terdapat potensi duplikasi penempatan di header bar dan konten dalam.
  - *Rasional / Nilai Manfaat:* Memungkinkan karyawan melaporkan hambatan kritis kapan saja (pagi, siang, maupun sore) dengan lokasi tombol yang konsisten dan ergonomis.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Letakkan satu tombol "Lapor Blocker" yang konsisten pada masing-masing ketiga halaman My Today (Morning, Additional Work, EOD), diposisikan sejajar di baris tab 1, 2, 3 pada ujung kanan sesuai batas margin dan grid desain prototipe.
- **Target Module / Component:** Workflow Step Bar Quick Action Button (+ Lapor Blocker)
- **Nature of Impact:** **Direct Impact pada 3 File**
- **Relevant Source Files:** `MorningCommitmentView.vue (L289-302), AdditionalWorkView.vue (L135-148), EodOutcomeView.vue (L282-295)`
- **Dependency:** Navigasi langsung ke rute kanonikal /blockers/raise. Beririsan layout dengan IMP-040.
- **Risk & Verification Consideration:** Modifikasi template dilarang mengganggu Cycle 1 submission locks. Verifikasi: unit test & TC-DLYM-001.

---
#### [IMP-017] Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'
- **Finding ID:** `IMP-017`
- **Original Title:** Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Navigation & Architecture | Terkait ``TC-AUTH-001`, `TC-DLYM-001`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* 1. Teks di bawah logo WorkPulse di sidebar belum ringkas 'Dutamedia'.
  2. Ketiga halaman harian (Morning Commitment, Additional Work, EOD Outcome) muncul terpisah ketiganya sebagai link di sidebar, menduplikasi navigasi tab.
  - *Rasional / Nilai Manfaat:* Mencegah redundansi navigasi antara sidebar dan tab dalam halaman, merapikan struktur menu sidebar, dan menyelaraskan fungsi bar navigasi atas.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
1. Ubah teks di bawah logo menjadi **'Dutamedia'** saja.
  2. Satukan ketiga link harian di sidebar menjadi satu menu induk: **"My Today"**, dengan sub-navigasi rute diatur oleh tab header internal (*"My Today / Morning Commitment"*, *"My Today / Additional Work"*, *"My Today / EOD Outcome"*).
- **Target Module / Component:** Enterprise Sidebar Nav Group Consolidation & Dutamedia Label
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/components/EnterpriseSidebar.vue (L50-120)`
- **Dependency:** Beririsan dengan router navigation structure (navigation.ts).
- **Risk & Verification Consideration:** Collapsible menu state dan active indicator terganggu. Verifikasi: sidebar visual audit.

---
#### [IMP-018] Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas
- **Finding ID:** `IMP-018`
- **Original Title:** Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Layout & Spacing | Terkait ``TC-AUTH-007`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Topbar atas menampilkan badge "WP WorkPulse" yang redundan karena logo WorkPulse sudah terpampang permanen di sidebar kiri.
  - *Rasional / Nilai Manfaat:* Mengurangi redundansi identitas brand pada satu layar dan menciptakan hierarki visual yang lebih rapi.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hilangkan badge "WP WorkPulse" dari topbar halaman `/profile` agar area navigasi atas lebih bersih dan fokus pada breadcrumb konteks halaman.
- **Target Module / Component:** Profile Header / TopBar Brand Badge Elimination
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/profile/ProfileView.vue (L20-35) or TopBar`
- **Dependency:** Bagian dari SOL-SHLL-TOPB; standardisasi header profil.
- **Risk & Verification Consideration:** Duplikasi elemen WP mark di desktop vs mobile. Verifikasi: TC-AUTH-007.

---
#### [IMP-019] Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)
- **Finding ID:** `IMP-019`
- **Original Title:** Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Navigation & Architecture | Terkait ``TC-AUTH-007`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Bar atas halaman `/profile` berbeda dari halaman utama lainnya dan memuat elemen yang tidak konsisten.
  - *Rasional / Nilai Manfaat:* Menghadirkan konsistensi pengalaman navigasi global (*unified layout pattern*) di seluruh halaman WorkPulse.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Seragamkan bar atas di seluruh halaman sistem menjadi satu standar: menampilkan ikon notifikasi (lonceng dengan badge unread) dan tombol profil berupa avatar inisial pengguna, tanpa tombol teks profil/logout yang berulang di header, karena navigasi profil sudah tersedia di sudut kiri bawah sidebar.
- **Target Module / Component:** Global Clean Navbar Standard (Avatar & Notification Bell)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/components/common/TopBar.vue (or Shell TopBar)`
- **Dependency:** Kluster SOL-SHLL-TOPB; menjadi dasar arsitektur header seluruh view.
- **Risk & Verification Consideration:** Inkonsistensi layout saat diadopsi di berbagai view. Verifikasi: multi-page layout audit.

---
#### [IMP-020] Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)
- **Finding ID:** `IMP-020`
- **Original Title:** Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Visual Design & Styling | Terkait ``TC-AUTH-007`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Pada footer sidebar kiri inisial pengguna adalah 2 huruf "AN" (Aditya Nugroho), namun saat membuka halaman `/profile`, avatar besar hanya menampilkan 1 huruf "A".
  - *Rasional / Nilai Manfaat:* Konsistensi visual dan identitas personal pengguna yang lebih akurat dan profesional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Buat logika penjanaan inisial avatar yang konsisten mengambil 2 huruf (huruf pertama nama depan dan huruf pertama nama belakang, misal "AN") di seluruh komponen avatar aplikasi.
- **Target Module / Component:** Avatar Initial Generator Helper (2 Letters Full Name)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/components/EnterpriseSidebar.vue, TopBar`
- **Dependency:** Digunakan bersama oleh Sidebar, TopBar, dan ProfileView.
- **Risk & Verification Consideration:** Edge cases nama 1 kata, nama berkarakter khusus. Verifikasi: unit test helper inisial.

---
#### [IMP-021] Pemisahan Nama Lengkap dan Jabatan pada Tampilan User
- **Finding ID:** `IMP-021`
- **Original Title:** Pemisahan Nama Lengkap dan Jabatan pada Tampilan User
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-PROF-LAYO`
- **Category & Test Case:** Copywriting & Microcopy | Terkait ``TC-AUTH-007`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Teks nama pengguna ditampilkan bersambung dengan tanda kurung jabatan, contohnya: "Aditya Nugroho (Frontend Engineer)".
  - *Rasional / Nilai Manfaat:* Membedakan entitas nama individu dari penugasan organisasi secara profesional dan sesuai prinsip desain basis data.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Pisahkan field nama lengkap pengguna ("Aditya Nugroho") dengan field jabatan ("Frontend Engineer") secara visual atau struktural, tanpa menggabungkan nama dan jabatan dalam tanda kurung pada satu string teks.
- **Target Module / Component:** User Identity Section (Full Name & Job Position Split)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/profile/ProfileView.vue (L45-60)`
- **Dependency:** Bagian dari SOL-PROF-LAYO; penataan header data profil.
- **Risk & Verification Consideration:** Truncation nama panjang pada layar mobile. Verifikasi: visual check Prototipe 24.

---
#### [IMP-022] Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24
- **Finding ID:** `IMP-022`
- **Original Title:** Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-PROF-LAYO`
- **Category & Test Case:** Layout & Spacing | Terkait ``TC-AUTH-007`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Body halaman `/profile` saat ini masih menggunakan layout dua kolom sederhana dengan prompt hint refleksi dan belum mengadopsi 3 seksi komprehensif prototipe 24 (`24-Profile-Settings.html`).
  - *Rasional / Nilai Manfaat:* Menghadirkan tampilan pengaturan akun enterprise yang lengkap, profesional, dan 100% selaras dengan acuan desain resmi perusahaan.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Selaraskan struktur konten halaman `/profile` agar mengadopsi rancangan kanonikal Prototipe 24: Header judul dan subtitle halaman yang jelas, kotak ringkasan profil, serta 3 seksi konten terstruktur: (1) Kartu Identitas & Penugasan Efektif (Read-Only) mencakup Jabatan & Departemen resmi, (2) Keamanan & Pembaruan Kata Sandi Mandiri, dan (3) Ringkasan Kanal Notifikasi Perangkat Ini (dengan tetap mengabaikan elemen dummy simulasi khusus prototipe).
- **Target Module / Component:** Profile Body Layout (3 Sections Structure per Prototype 24)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/profile/ProfileView.vue (L70-250)`
- **Dependency:** Bagian dari SOL-PROF-LAYO; restrukturisasi grid body profil.
- **Risk & Verification Consideration:** Responsive breakdown form profil pada viewport tablet/mobile. Verifikasi: TC-AUTH-007.

---
#### [IMP-023] Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran
- **Finding ID:** `IMP-023`
- **Original Title:** Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Navigation & Architecture | Terkait ``TC-AUTH-005`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Tombol "Kembali ke Dashboard" pada halaman Error 403 secara statis mengarahkan seluruh pengguna ke `/dashboard` (Pulse Dashboard), sehingga karyawan biasa (EMPLOYEE) mendarat di dashboard operasional manajerial dan bukan di halaman kerja kanonikalnya (`/daily/morning`).
  - *Rasional / Nilai Manfaat:* Menegakkan konsistensi tata kelola pendaratan berbasis peran (DEC-012) di seluruh alur pemulihan error sistem.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ubah rute tombol pemulihan agar memanggil helper navigasi berbasis peran (misal: `getRoleBasedHomeRoute(user.role)`), sehingga untuk peran EMPLOYEE tombol otomatis mengarahkan ke `/daily/morning`, sedangkan untuk peran manajerial mengarahkan ke `/dashboard`.
- **Target Module / Component:** Forbidden Error Screen (403) Canonical Recovery Action
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/system/ErrorPageView.vue (L30-50)`
- **Dependency:** Mengakses auth store untuk resolve getLandingRouteForRole().
- **Risk & Verification Consideration:** Redirect loop jika user state tidak terdefinisi. Verifikasi: TC-AUTH-005.

---
#### [IMP-024] Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP
- **Finding ID:** `IMP-024`
- **Original Title:** Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Navigation & Consistency | Terkait ``TC-ADMN-002`, `TC-ADMN-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Bar navigasi bagian atas pada halaman-halaman administrasi menampilkan badge logo statis "WP WorkPulse" beserta label tag modul, padahal logo dan nama brand WorkPulse sudah tersemat secara permanen di sidebar kiri.
  - *Rasional / Nilai Manfaat:* Menghilangkan redundansi elemen visual identitas jenama di layar, memberikan hierarki navigasi yang jelas bagi pengguna, dan menyeragamkan pola antarmuka di seluruh portal.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Selaraskan topbar administrasi dengan standar global layout WorkPulse (seperti pada modul Management/Team Pulse), yaitu mengganti badge logo dengan breadcrumb hirarkis bersih (contoh: `Administration / Struktur Organisasi` atau `Administration / Kebijakan Operasional`).
- **Target Module / Component:** Admin Shell TopBar Breadcrumbs & Brand Badge Elimination
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `Admin Views (Users, Policies, Org, TempReviewer)`
- **Dependency:** Bagian dari SOL-SHLL-TOPB; standardisasi modul administrasi.
- **Risk & Verification Consideration:** Breadcrumb parsing tidak sinkron dengan active route admin. Verifikasi: visual audit.

---
#### [IMP-025] Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat
- **Finding ID:** `IMP-025`
- **Original Title:** Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** UI/UX & Information Architecture | Terkait ``TC-ADMN-002`, `TC-AUTH-007`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Topbar administrasi memuat tautan horizontal teks ('Kelola Pengguna', 'Reviewer Sementara', 'Pengaturan Kebijakan', 'Profil Saya') yang sepenuhnya menduplikasi menu yang telah tersedia di sidebar grup *Administration*. Tautan profil juga hanya berupa teks "Profil Saya" polos tanpa avatar maupun bel notifikasi.
  - *Rasional / Nilai Manfaat:* Menjaga kebersihan antarmuka (declutter), menegakkan prinsip *Single Source of Navigation*, dan memastikan konsistensi visual identitas pengguna di seluruh sudut aplikasi.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Bersihkan header atas dari tautan menu duplikat (cukup dikelola melalui sidebar). Di sisi kanan header atas, ganti teks "Profil Saya" dengan avatar inisial bulat standar (`SA` untuk System Admin) yang dilengkapi dropdown menu ringkas profil/logout serta ikon lonceng notifikasi terpadu.
- **Target Module / Component:** Admin Shell TopBar Duplicate Links Elimination & Round Avatar
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `Admin Views (Users, Policies, Org, TempReviewer)`
- **Dependency:** Bagian dari SOL-SHLL-TOPB; konsolidasi navigasi admin.
- **Risk & Verification Consideration:** Navigasi logout atau profil hilang dari header admin. Verifikasi: TC-ADMN-002.

---
#### [IMP-026] Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
- **Finding ID:** `IMP-026`
- **Original Title:** Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Architecture & Separation of Duties (IAM) | Terkait ``TC-AUTH-005`, `TC-ADMN-002`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Akun berkedudukan peran `SYSTEM_ADMIN` saat ini masih melihat dan memiliki akses ke grup menu *Workspace* (Morning Commitment, Additional Work, EOD Outcome, Lapor Blocker, Cuti Saya, Koreksi).
  - *Rasional / Nilai Manfaat:* Mencegah terjadinya pencemaran data komitmen operasional pada akun sistem, menegakkan kepatuhan tata kelola akses enterprise (IAM Governance & Separation of Duties), serta menyederhanakan fokus antarmuka administrator.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Terapkan pemisahan tugas (*Separation of Duties*) tegas pada tingkat navigasi dan hak akses: Akun `SYSTEM_ADMIN` adalah identitas pengelola sistem (bukan jabatan operasional karyawan perusahaan). Nonaktifkan grup navigasi *Workspace* untuk peran `SYSTEM_ADMIN`, sehingga akun admin murni hanya mengelola konfigurasi sistem (*Administration*) dan pemantauan eskalasi/audit (*Management*). Setiap PIC pengelola admin (misal HRGA/IT) yang memiliki kewajiban komitmen harian tetap menggunakan akun karyawan pribadinya masing-masing.
- **Target Module / Component:** SYSTEM_ADMIN Persona Workspace Separation & Router Guards
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/components/EnterpriseSidebar.vue, frontend/src/router/navigation.ts, router/index.ts`
- **Dependency:** Terkait erat dengan IAM Governance dan Separation of Duties.
- **Risk & Verification Consideration:** Admin terkunci dari landing page jika route guard keliru. Verifikasi: navigation.spec.ts & TC-AUTH-005.

---
#### [IMP-027] Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment
- **Finding ID:** `IMP-027`
- **Original Title:** Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Layout & Visual Cleanliness | Terkait ``TC-DLYM-001`, `TC-DLYM-002`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Kartu konteks jadwal memuat tag biru di kanan atas ("Kebijakan: On-Time ... Cut-off ..."), subkotak 1 memuat tanggal dengan subteks "Hari Kerja Aktif", subkotak 2 memuat batas on-time dengan subteks "Cut-Off Penguncian: ...", subkotak 3 memuat subteks "Jam Server: ...", dan subkotak 4 memuat subteks "Agregasi Tingkat Risiko". Layout terkesan padat dan redundan.
  - *Rasional / Nilai Manfaat:* Menghadirkan antarmuka konteks yang bersih (*decluttered*), elegan, mudah dipindai dalam hitungan detik, serta menempatkan tanggal secara intuitif.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
1. Ganti label tag biru di sudut kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026").
  2. Subkotak 1: Ubah fokus menampilkan nilai "Batas On-Time" (cth: `09:00 WIB`) tanpa subteks.
  3. Subkotak 2: Ubah fokus menampilkan "Batas Cut-Off" / "Batas Akhir Pengisian" (cth: `23:59 WIB`) tanpa subteks.
  4. Subkotak 3: Tetap menampilkan "Status Waktu" (cth: badge `LATE (Jendela Toleransi)`), namun hapus subteks "Jam Server: 11:22".
  5. Subkotak 4: Tetap menampilkan "Status Awal Hari" / "Initial Daily Status" (cth: badge `GREEN — Terkendali`), namun hapus subteks "Agregasi Tingkat Risiko".
- **Target Module / Component:** Morning Commitment Context Metric Card (<section class="panel context-panel">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/MorningCommitmentView.vue (L325-367)`
- **Dependency:** Co-located di MorningCommitmentView.vue bersama IMP-028, IMP-029, IMP-030.
- **Risk & Verification Consideration:** Dilarang mengubah state submit Cycle 1. Verifikasi: MorningCommitmentView.spec.ts & TC-DLYM-001.

---
#### [IMP-028] Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)
- **Finding ID:** `IMP-028`
- **Original Title:** Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Microcopy & UX Content | Terkait ``TC-DLYM-001`, `TC-DLYM-005`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Banner amber pada kondisi keterlambatan menampilkan teks teknis: `"Jendela Grace Period / Late Aktif (09:00 – 23:59 WIB): Batas waktu On-Time telah terlewati, namun Anda masih berada sebelum batas cut-off penguncian. Komitmen yang dikirim sekarang langsung sah dengan status LATE."` Frasa "Jendela Grace Period / Late Aktif" dinilai membingungkan karyawan biasa.
  - *Rasional / Nilai Manfaat:* Menghilangkan kebingungan terminologi teknis asing (*Grace Period*) dan mengomunikasikan status keterlambatan secara transparan dan profesional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Sederhanakan microcopy menjadi kalimat lugas, manusiawi, dan jelas, contohnya: `"Pengisian Melewati Batas Waktu: Batas waktu On-Time (09:00 WIB) telah berakhir, namun Anda masih dapat mengirimkan komitmen sebelum sistem terkunci pada pukul 23:59 WIB. Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE)."`
- **Target Module / Component:** Morning Commitment Late Notification Banner (<div class="late-banner">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/MorningCommitmentView.vue (L400-410)`
- **Dependency:** Logika reaktif isLate, morningOnTimeCutoff (09:00 WIB), morningLockCutoff (23:59 WIB).
- **Risk & Verification Consideration:** Banner muncul pada waktu on-time jika binding salah. Verifikasi: unit test & TC-DLYM-005.

---
#### [IMP-029] Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol
- **Finding ID:** `IMP-029`
- **Original Title:** Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Polish | Terkait ``TC-DLYM-002`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Label checkbox komitmen nol memuat kode arsitektur internal spesifikasi teknis: `"Hari ini tidak ada komitmen harian khusus (0 Komitmen / Zero Commitment — DEC-004)"`.
  - *Rasional / Nilai Manfaat:* Menjaga kebersihan antarmuka dari kebocoran referensi kode/dokumen internal developer yang tidak relevan bagi pengguna akhir.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus kode teknis `— DEC-004` dari antarmuka pengguna akhir (*end-user*). Ubah label menjadi bahasa bisnis yang bersih dan natural, contoh: `"Hari ini tidak ada komitmen harian terencana (0 Komitmen)"` atau `"Saya tidak memiliki komitmen harian terencana untuk hari ini"`.
- **Target Module / Component:** Zero Commitment Checkbox Label & Error Toasts (DEC-004 Code Removal)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/MorningCommitmentView.vue (L148, 163, 198, 203, 414)`
- **Dependency:** State isZeroCommitment dan validasi minimal 1 slot task.
- **Risk & Verification Consideration:** Regresi validasi form jika string error toast berubah logic. Verifikasi: MorningCommitmentView.spec.ts.

---
#### [IMP-030] Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis
- **Finding ID:** `IMP-030`
- **Original Title:** Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Microcopy & UX Communication | Terkait ``TC-DLYM-002`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Subteks penjelasan setelah checkbox komitmen nol dicentang berbunyi teknis: `"Status hari ini akan tercatat sebagai NOT_APPLICABLE — NO_COMMITMENT (bukan No Submission)."`, mengekspos nama enum basis data internal sistem.
  - *Rasional / Nilai Manfaat:* Memberikan kepastian psikologis dan pemahaman yang jelas bagi karyawan tanpa harus membaca istilah kode pemrograman basis data.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Ubah narasi menjadi bahasa bisnis yang menenangkan dan mudah dipahami, contoh: `"Hari Anda akan dicatat resmi sebagai 'Bebas Komitmen (Disetujui)', sehingga Anda tetap aman dan terbebas dari catatan Pelanggaran Pengisian (No Submission)."`
- **Target Module / Component:** Zero Commitment Explanation Note (<p class="zero-commitment-note">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/MorningCommitmentView.vue (L430-435)`
- **Dependency:** Terkait visual binding saat isZeroCommitment dicentang. Terikat DEC-008-UAT.
- **Risk & Verification Consideration:** Dilarang mengubah enum basis data. Verifikasi: UI test & visual audit.

---
#### [IMP-031] Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work
- **Finding ID:** `IMP-031`
- **Original Title:** Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Polish | Terkait ``TC-DLYA-001`, `TC-DLYA-002`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Subtitle halaman berbunyi: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari tanpa mengubah baseline komitmen pagi (Prototipe 03)."` Terdapat kebocoran istilah dokumen desain internal developer "(Prototipe 03)".
  - *Rasional / Nilai Manfaat:* Menghilangkan kebingungan pengguna akhir dan menjaga kebersihan tampilan sistem enterprise dari atribut artefak pengembang.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus frasa `(Prototipe 03)` dan sempurnakan copywriting menjadi kalimat bisnis profesional, contoh: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi."`
- **Target Module / Component:** Additional Work Page Subtitle (<p class="subtitle">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/AdditionalWorkView.vue (L164-166)`
- **Dependency:** Independen; pembersihan string markup.
- **Risk & Verification Consideration:** Tidak ada risiko fungsional. Verifikasi: visual check.

---
#### [IMP-032] Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work
- **Finding ID:** `IMP-032`
- **Original Title:** Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Layout & Responsive Styling | Terkait ``TC-DLYA-002`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Kolom select "Ditugaskan Oleh (Atasan Langsung/Lead) *" melebar melampaui batas tepi kanan panel kontainer induknya (*horizontal overflow*) karena teks nama lengkap, jabatan, dan email atasan cukup panjang, sementara grid kolom tidak memiliki pembatas lebar tegas (`min-width: 0`).
  - *Rasional / Nilai Manfaat:* Menjaga keutuhan visual layout form agar rapi, tidak merusak batas kartu (*box containment*), dan nyaman dilihat di berbagai resolusi layar.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Tambahkan aturan CSS `min-width: 0;` pada elemen `.form-group` dan batasi lebar elemen `.input-control` select dengan `width: 100%; max-width: 100%; text-overflow: ellipsis;` serta filter daftar pilihan agar hanya memuat atasan/pejabat yang relevan (bukan diri sendiri atau karyawan baru).
- **Target Module / Component:** Additional Work Two-Column Assignment Grid Field Layout
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/AdditionalWorkView.vue (L340-355)`
- **Dependency:** CSS layout grid pada formulir tugas tambahan.
- **Risk & Verification Consideration:** Horizontal overflow pada layar tablet/mobile 768px. Verifikasi: responsive test.

---
#### [IMP-033] Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome
- **Finding ID:** `IMP-033`
- **Original Title:** Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Layout & Visual Cleanliness | Terkait ``TC-DLYE-001`, `TC-DLYA-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Kartu "Konteks Waktu EOD" memuat badge biru di kanan atas ("On-Time 17:00 · Cut-Off 21:00 WIB") serta 4 subkotak: Tanggal Kerja, Batas On-Time EOD, Status Waktu, dan Total Item Evaluasi. Formatnya serupa dengan halaman Morning Commitment yang dinilai terlalu padat.
  - *Rasional / Nilai Manfaat:* Menciptakan konsistensi visual 100% antara formulir pagi dan sore, membuat informasi waktu kerja mudah dicerna, dan menghilangkan redundansi teks.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Selaraskan dengan penyempurnaan kartu konteks pada Morning Commitment (`IMP-027`):
  1. Ganti badge biru kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026").
  2. Subkotak 1: Fokus pada "Batas On-Time EOD" (cth: `17:00 WIB`).
  3. Subkotak 2: Fokus pada "Batas Akhir / Cut-Off EOD" (cth: `21:00 WIB`).
  4. Subkotak 3: Tetap "Status Waktu" (cth: badge `ON-TIME`).
  5. Subkotak 4: "Total Item Evaluasi" (cth: `4 Tugas`).
- **Target Module / Component:** EOD Outcome Context Time Metric Card (<section class="panel context-panel">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L325-365)`
- **Dependency:** Co-located di EodOutcomeView.vue bersama temuan evaluasi sore lainnya.
- **Risk & Verification Consideration:** Dilarang mengubah state submit Cycle 1. Verifikasi: EodOutcomeView.spec.ts & TC-DLYE-001.

---
#### [IMP-034] Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome
- **Finding ID:** `IMP-034`
- **Original Title:** Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Polish | Terkait ``TC-DLYE-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Subtitle halaman berbunyi: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan kelanjutan tugas (Prototipe 04)."` Memuat teks kode artefak pengembang "(Prototipe 04)".
  - *Rasional / Nilai Manfaat:* Menjaga kebersihan antarmuka dari istilah teknis pengembang dan menghadirkan pengalaman pengguna enterprise yang profesional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus kode teks `(Prototipe 04)` dan poles kalimat menjadi elegan: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel."`
- **Target Module / Component:** EOD Outcome Page Subtitle (<p class="subtitle">)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L311-313)`
- **Dependency:** Independen; pembersihan string kebocoran kode prototipe.
- **Risk & Verification Consideration:** Tidak ada risiko fungsional. Verifikasi: visual check.

---
#### [IMP-035] Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD
- **Finding ID:** `IMP-035`
- **Original Title:** Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Microcopy & UX Communication | Terkait ``TC-DLYE-002`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Judul seksi memuat: `"Refleksi Mandiri Karyawan (DEC-003)"` dengan badge `Proteksi Hak Opsi GREEN`. Paragraf penjelasnya berbunyi teknis dan defensif: `"Bagaimana penilaian mandiri Anda terhadap pencapaian keseluruhan hari ini? Sesuai DEC-003, sistem tidak pernah mengunci opsi GREEN secara punitif."`
  - *Rasional / Nilai Manfaat:* Menghilangkan kebocoran kode teknis `DEC-003` dan istilah hukum/defensif ("secara punitif"), serta menumbuhkan budaya akuntabilitas psikologis yang aman (*psychological safety*).
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
1. Ubah judul seksi menjadi bahasa bisnis yang bermartabat: `"Refleksi Mandiri Akhir Hari"` dengan badge keterangan `Penilaian Otonom Karyawan`.
  2. Sederhanakan paragraf penjelasan menjadi narasi suportif yang hangat: `"Bagaimana penilaian mandiri Anda terhadap pencapaian kerja secara keseluruhan hari ini? Anda memiliki hak penuh untuk menentukan status refleksi hari ini secara jujur dan transparan demi pembelajaran bersama tim."`
- **Target Module / Component:** EOD Outcome Self-Reflection Section (Narration & DEC-003 Removal)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L520-545)`
- **Dependency:** Input textarea refleksi diri harian karyawan.
- **Risk & Verification Consideration:** Binding v-model refleksi mandiri tidak tersimpan ke payload. Verifikasi: EodOutcomeView.spec.ts.

---
#### [IMP-036] Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD
- **Finding ID:** `IMP-036`
- **Original Title:** Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Copywriting & Polish | Terkait ``TC-DLYE-001`, `TC-DLYE-002`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Label pada tombol pilihan capaian dan keputusan kelanjutan memuat nama enum kode basis data internal sistem yang dipisahkan garis bawah (*underscore*), seperti: `"Belum Selesai (NOT_COMPLETED)"`, `"Lanjutkan Besok (CONTINUE → Carry-Over)"`, dan `"Jangan Lanjutkan (DO_NOT_CONTINUE)"`.
  - *Rasional / Nilai Manfaat:* Menghadirkan antarmuka ramah pengguna (*user-friendly*) tanpa kebocoran istilah kode pemrograman (*leak of developer jargon*).
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus seluruh nama enum berkode huruf besar dan bergaris bawah dari antarmuka pengguna akhir. Gunakan bahasa Indonesia bisnis yang natural dengan pemisah spasi:
  - `"Belum Selesai"` (tanpa `NOT_COMPLETED`).
  - `"Lanjutkan Besok (Tugas Berlanjut)"` atau `"Lanjutkan Besok"`.
  - `"Tidak Dilanjutkan"` atau `"Selesai Tanpa Lanjutan"` (tanpa `DO_NOT_CONTINUE`).
- **Target Module / Component:** EOD Outcome Task Evaluation Radio Buttons (Enum Label Cleanups)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L430-465)`
- **Dependency:** Opsi pencapaian komitmen harian. Terikat batasan negatif DEC-008-UAT.
- **Risk & Verification Consideration:** Nilai value radio button berubah sehingga payload ditolak backend. Verifikasi: payload audit.

---
#### [IMP-037] Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)
- **Finding ID:** `IMP-037`
- **Original Title:** Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Layout & Visual Polish | Terkait ``TC-DLYE-001`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Kotak input "Catatan Kelanjutan (Continuation Reason) *" saat opsi lanjutkan besok dipilih memiliki layout rusak: teks judul dan textarea berada dalam satu baris horizontal sejajar di bagian bawah (*baseline alignment*), dan textarea berukuran mengotak kecil (mengikuti default browser cols) sehingga teks placeholder terpotong dan ruang kosong lebar di sebelah kanannya terbuang sia-sia.
  - *Rasional / Nilai Manfaat:* Menghilangkan kejanggalan tata letak visual (*visual alignment defect*), memberikan ruang ketik yang lega dan proporsional bagi karyawan, dan membuat placeholder terbaca sempurna.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Selaraskan styling `.mt-2` atau `.form-group` agar menggunakan layout vertikal (`display: flex; flex-direction: column; gap: 6px;`) dan terapkan `width: 100%;` pada textarea `.input-control` agar membentang memenuhi lebar kartu dengan placeholder yang terbaca penuh.
- **Target Module / Component:** EOD Outcome Task Continuation Textarea Container (100% Width)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L470-490)`
- **Dependency:** Muncul kondisional jika tugas berstatus Sebagian atau Belum Selesai.
- **Risk & Verification Consideration:** Pelebaran textarea merusak alignment kartu tugas. Verifikasi: visual test Prototipe 04.

---
#### [IMP-038] Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)
- **Finding ID:** `IMP-038`
- **Original Title:** Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Functional Consistency & Business Logic | Terkait ``TC-DLYE-001`, `TC-DLYA-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Seksi "Evaluasi Pekerjaan Tambahan" di halaman EOD saat ini hanya menyediakan 3 opsi capaian (Selesai, Sebagian, Belum Selesai) tanpa opsi "Dibatalkan", dan jika pengguna memilih Sebagian atau Belum Selesai, tidak muncul form keputusan kelanjutan tugas maupun catatan alasan seperti halnya pada evaluasi komitmen pagi.
  - *Rasional / Nilai Manfaat:* Menjaga kesetaraan perlakuan akuntabilitas antara tugas komitmen pagi dan tugas tambahan ad-hoc, serta mencegah adanya tugas menggantung tanpa status kelanjutan yang jelas.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Selaraskan kapabilitas evaluasi pekerjaan tambahan dengan evaluasi komitmen pagi:
  1. Tambahkan opsi `Dibatalkan` lengkap dengan kolom input alasan pembatalan.
  2. Jika dipilih `Sebagian` atau `Belum Selesai`, tampilkan sub-pilihan keputusan kelanjutan tugas (`Lanjutkan Besok` vs `Tidak Dilanjutkan`) beserta kolom catatan kelanjutan.
- **Target Module / Component:** Additional Work Evaluation Alignment (Cancelled Option & Continuation Flow)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L500-518)`
- **Dependency:** Penyelarasan kapabilitas evaluasi tugas tambahan dengan tugas utama.
- **Risk & Verification Consideration:** Payload tugas tambahan tidak menyertakan alasan pembatalan. Verifikasi: unit test & TC-DLYE-001.

---
#### [IMP-039] Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis
- **Finding ID:** `IMP-039`
- **Original Title:** Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Microcopy & UX Communication | Terkait ``TC-DLYA-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Badge status pada kartu pekerjaan tambahan menampilkan langsung nama enum raw basis data: `NEWLY_ASSIGNED`, `OPERATIONAL_INCIDENT`, dsb. yang menggunakan huruf kapital dan garis bawah (*underscore*).
  - *Rasional / Nilai Manfaat:* Menghadirkan tampilan yang bersih, mudah dipahami oleh seluruh staf dan pimpinan non-teknis, serta konsisten dengan prinsip desain enterprise WorkPulse.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Terapkan pemetaan label ramah pengguna (*human-friendly formatter*), contoh:
  - `NEWLY_ASSIGNED` → `Penugasan Baru Atasan`
  - `OPERATIONAL_INCIDENT` → `Insiden Operasional`
  - `MISSED_IN_PLANNING` → `Kebutuhan Dadakan`
  - `PRIORITY_CHANGE` → `Perubahan Prioritas`
- **Target Module / Component:** Additional Work Reason Badge UI Formatter
- **Nature of Impact:** **Direct Impact pada 2 File**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L498), AdditionalWorkView.vue (L368)`
- **Dependency:** Layer presentasi UI formatter. Terikat batasan negatif DEC-008-UAT.
- **Risk & Verification Consideration:** Dilarang mengubah enum basis data. Verifikasi: visual check badge di kedua view.

---
#### [IMP-040] Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)
- **Finding ID:** `IMP-040`
- **Original Title:** Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)
- **Classification & Cluster:** `STANDALONE` | STANDALONE
- **Category & Test Case:** Navigation & Consistency | Terkait ``TC-BLKR-001`, `TC-DLYE-001`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Tombol "+ Laporkan Blocker Mendesak" di halaman EOD memunculkan modal dialog pop-up terpisah (`media_1793343838939_99a0aba8.png`), padahal sistem telah memiliki halaman formulir pelaporan mandiri resmi di `/blockers/raise`.
  - *Rasional / Nilai Manfaat:* Menghilangkan duplikasi antarmuka input blocker, mencegah fragmentasi alur pengguna, dan memastikan karyawan mengisi formulir kendala yang lengkap dan terstandarisasi.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus implementasi modal pop-up pada tombol tersebut. Selaraskan seluruh tombol "Lapor Blocker" pada 3 sub-halaman My Today agar secara konsisten langsung mengarahkan (*direct navigate*) ke halaman kanonikal `/blockers/raise` dengan posisi tata letak yang presisi di sisi kanan tab navigasi.
- **Target Module / Component:** EOD Outcome Blocker CTA Action & 86 Lines Modal Removal
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/daily/EodOutcomeView.vue (L61-69, 217-248, 315-322, 604-690)`
- **Dependency:** Pembersihan dead code modal; tombol dialihkan langsung ke /blockers/raise. Terkait IMP-016 & IMP-041.
- **Risk & Verification Consideration:** Pembersihan 86 baris modal merusak script form EOD. Verifikasi: EodOutcomeView.spec.ts 100% pass.

---
#### [IMP-041] Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)
- **Finding ID:** `IMP-041`
- **Original Title:** Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-BLKR-FORM`
- **Category & Test Case:** Layout & Information Architecture | Terkait ``TC-BLKR-001`, `TC-BLKR-005`` (Prioritas: `High`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Halaman `/blockers/raise` saat ini hanya menampilkan form input tunggal statis dengan kicker "MANAJEMEN KENDALA & ESKALASI OTOMATIS", tanpa tombol tautan kembali ke My Today, serta tidak menyediakan tab "Blocker Saya" untuk memantau status blocker yang pernah dilaporkan karyawan.
  - *Rasional / Nilai Manfaat:* Memberdayakan karyawan untuk tidak hanya melaporkan kendala, tetapi juga memantau eskalasi SLA blocker pribadinya secara transparan dalam satu pusat kendali yang terpadu.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Selaraskan 100% struktur konten halaman dengan acuan resmi Prototipe 05 (`05-Raise-Instant-Blocker.html`):
  1. Tambahkan tautan navigasi di atas judul: `← Kembali ke Ruang Kerja My Today`.
  2. Judul halaman: `Laporkan & Pantau Blocker`, Subtitle: `Laporkan hambatan atau dependensi kerja beserta dampak dan tingkat keparahannya agar penanggung jawab berwenang dapat segera menindaklanjuti.` (Hapus kicker manajemen kendala di atasnya).
  3. Sediakan 2 Tab Navigasi Halaman:
     - **Tab 1: Buat Laporan Blocker** (memuat seksi *Detail Kendala, Taksonomi & Dampak* dan *Penanggung Jawab Awal & Jalur Kewenangan*).
     - **Tab 2: Blocker Saya** (memuat judul "Daftar Blocker yang Saya Laporkan", filter status, kartu-kartu blocker aktif dengan SLA aging, tombol konfirmasi tutup kendala / reopen).
  4. Abaikan komponen khusus simulasi prototipe (`[Mode Simulasi Prototipe]`).
- **Target Module / Component:** Blocker Raise Page Layout Realignment (Back Button, Header & 2 Tabs)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/blockers/RaiseBlockerView.vue (L1-150)`
- **Dependency:** Bagian dari SOL-BLKR-FORM; mengadopsi 1:1 struktur Prototipe 05.
- **Risk & Verification Consideration:** Tab routing antara form laporan dan antrean blocker saya. Verifikasi: TC-BLKR-001.

---
#### [IMP-042] Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan
- **Finding ID:** `IMP-042`
- **Original Title:** Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-BLKR-FORM`
- **Category & Test Case:** RBAC & Access Control | Terkait ``TC-BLKR-001`, `TC-AUTH-005`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Di kanan atas halaman `/blockers/raise` terdapat tombol hijau outlined: `Lihat Antrean Blocker Aktif` yang jika diklik mengarahkan pengguna ke halaman antrean manajerial (`/blockers`).
  - *Rasional / Nilai Manfaat:* Menegakkan kepatuhan hak akses berbasis peran (RBAC) dan mencegah kebingungan navigasi karyawan operasional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus tombol tersebut dari tampilan pengguna biasa (`EMPLOYEE`). Halaman antrean eskalasi blocker (`/blockers`) adalah wewenang pimpinan/manajemen yang telah diatur di navigasi *Management*. Karyawan biasa cukup memantau status tiketnya sendiri lewat Tab "Blocker Saya".
- **Target Module / Component:** Employee Blocker Form Action Bar (Queue Button Elimination)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/blockers/RaiseBlockerView.vue (L160-175)`
- **Dependency:** Bagian dari SOL-BLKR-FORM; penegakan RBAC karyawan.
- **Risk & Verification Consideration:** Karyawan kehilangan akses riwayat blocker (harus via tab Blocker Saya). Verifikasi: TC-BLKR-001.

---
#### [IMP-043] Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi
- **Finding ID:** `IMP-043`
- **Original Title:** Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-SHLL-TOPB`
- **Category & Test Case:** Navigation & Visual Consistency | Terkait ``TC-BLKR-001`` (Prioritas: `Medium`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Breadcrumb kiri atas masih bertuliskan `Blocker / Laporkan Kendala Cepat (Prototipe 05)`. Sisi kanan atas memuat tombol teks `Antrean Tiket` dan `My Today` yang menempel di ujung layar peramban.
  - *Rasional / Nilai Manfaat:* Menegakkan keseragaman sistem navigasi global WorkPulse dan memberikan tampilan yang proporsional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
1. Ubah breadcrumb menjadi: `Workspace / Laporkan & Pantau Blocker`.
  2. Ganti tombol teks kanan atas dengan avatar profil inisial bulat (`AN`) dan ikon lonceng notifikasi terpadu.
  3. Selaraskan margin dan padding sisi kanan agar mengikuti batas kontainer grid kartu konten (tidak menempel ke tepi layar monitor).
- **Target Module / Component:** Blocker Raise TopBar (Breadcrumb, Avatar & Notification Bell)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/blockers/RaiseBlockerView.vue (L20-40) or TopBar`
- **Dependency:** Bagian dari SOL-SHLL-TOPB; standardisasi header blocker.
- **Risk & Verification Consideration:** Breadcrumb tidak seragam dengan shell aplikasi. Verifikasi: visual check Prototipe 05.

---
#### [IMP-044] Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim
- **Finding ID:** `IMP-044`
- **Original Title:** Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim
- **Classification & Cluster:** `GROUP` | Cluster: `SOL-BLKR-FORM`
- **Category & Test Case:** Copywriting & Visual Cleanliness | Terkait ``TC-BLKR-001`` (Prioritas: `Low`)
- **Original Description (Kondisi Saat Ini & Rasional):**
  - *Kondisi Saat Ini:* Bar aksi bawah memuat kalimat instruksi defensif: `"Pastikan fakta kendala akurat. Tiket yang diterbitkan tidak dapat dihapus (Audit Trail DEC-008)."` dengan tombol Batal dan Kirim Tiket Kendala.
  - *Rasional / Nilai Manfaat:* Antarmuka form menjadi bersih (*clean*), ramah pengguna, dan fungsional.
- **Original Acceptance Criteria (Seluruh Kondisi Penerimaan Asli):**
Hapus teks referensi kode internal `(Audit Trail DEC-008)`. Selaraskan tombol aksi dengan Prototipe 05, yaitu tombol sekunder *"Bersihkan Formulir"* (reset) dan tombol primer *"Kirim Laporan Blocker"*.
- **Target Module / Component:** Blocker Form Action Footer Buttons (Clear & Submit)
- **Nature of Impact:** **Direct Impact**
- **Relevant Source Files:** `frontend/src/views/blockers/RaiseBlockerView.vue (L280-310)`
- **Dependency:** Bagian dari SOL-BLKR-FORM; interaksi reset form dan submit blocker.
- **Risk & Verification Consideration:** Fungsi reset tidak mengosongkan state form atau submit ganda. Verifikasi: form interaction test.

---
### 7.4. Batasan Negatif Solusi (Negative Boundaries — DEC-008-UAT & DEC-009-UAT)
Untuk mencegah *scope creep* dan pembengkakan arsitektur, batasan negatif berikut wajib ditegakkan:
1. **`IMP-011` (Bantuan Lupa Kata Sandi):**  
   - *Batasan Positif:* Menyediakan tombol "Lupa Kata Sandi?" pada form login kanan yang memicu modal dialog panduan administratif.
   - *Batasan Negatif:* **Dilarang keras** mengimplementasikan engine reset kata sandi otomatis, konfigurasi SMTP/pengiriman email, pembuatan token reset, penambahan kolom tabel database, maupun endpoint `/auth/forgot-password`.
2. **`IMP-015` (Lonceng Notifikasi pada Header TopBar):**  
   - *Batasan Positif:* Mengganti tombol teks "Riwayat Saya" dengan komponen ikon lonceng notifikasi SVG yang mengarah statis ke rute `/notifications`.
   - *Batasan Negatif:* **Dilarang keras** membangun push notification WebSocket, polling interval background, unread notification counter badge, maupun tabel notifikasi baru.
3. **`IMP-030`, `IMP-036`, `IMP-039` (Transformasi Tampilan Nilai Enum):**  
   - *Batasan Positif:* Menerapkan layer presentasi/UI formatter (helper function) untuk menerjemahkan nilai enum teknis ke bahasa bisnis Indonesia yang ramah pengguna.
   - *Batasan Negatif:* **Dilarang keras** mengubah schema database Prisma, migrasi PostgreSQL, maupun nilai enum backend (`NOT_APPLICABLE`, `CONTINUE`, `URGENT_UNPLANNED`, dsb.).

---

## 8. PROPOSED PLANNING METHODOLOGY (METODOLOGI PERENCANAAN REMEDIASI)

### 8.1. Metodologi Formulasi Paket Pekerjaan Remediasi (RWP)
Paket pekerjaan akan diformulasikan ke dalam dua tipe paket terstruktur:
1. **`RWP-CLUST-*` (Cluster Solution Package):** Paket terpadu untuk 4 kluster solusi teratifikasi (`SOL-AUTH-HERO`, `SOL-SHLL-TOPB`, `SOL-PROF-LAYO`, `SOL-BLKR-FORM`). Formulasi paket mencakup perombakan komponen holistik, pengujian integrasi visual, dan verifikasi lintas modul.
2. **`RWP-STND-*` (Standalone Work Package):** Paket independen untuk 24 temuan mandiri yang disusun secara atomik per file atau per interaksi spesifik.

### 8.2. Metodologi Matriks Prioritas Remediasi (RPM)
Prioritas pelaksanaan dikuantifikasi berdasarkan rumus:
$$\text{Priority Score} = \text{Severity Weight} \times 0.4 + \text{Core Workflow Weight} \times 0.35 + \text{Effort Feasibility} \times 0.25$$

### 8.3. Metodologi Matriks Ketergantungan dan Dampak (DIM)
Matriks dependensi memetakan:
- Ketergantungan level kode (*shared files collision*).
- Ketergantungan level alur (*workflow sequencing*).
- Ketergantungan level verifikasi (*regression test boundary*).

### 8.4. Metodologi Strategi Pengujian Ulang & Verifikasi (RVS)
Verifikasi hasil remediasi menerapkan strategi gerbang ganda (*dual-gate verification*):
- **Gate 1: Automated Unit & Component Verification:** Eksekusi Vitest untuk komponen Vue dan backend service (wajib 100% pass tanpa regresi pada 19 tests).
- **Gate 2: Formal Manual UAT Execution:** Pengujian langsung oleh Acceptance Owner (Harry) menggunakan test case UAT resmi dan verifikasi visual terhadap prototipe HTML acuan.

---

## 9. DRAFT CYCLE ALLOCATION INTEGRITY CHECK & RECONCILIATION

### 9.1. Alokasi 3 Siklus Remediasi (DRAFT: 22 + 9 + 13 = 44) — Dipulihkan ke Draft Rujukan v2.3
> [!WARNING] Koreksi Errata v2.5.1 (E-01)
> Tabel Seksi 9 pada v2.4 dan v2.5 menyusun ulang keanggotaan siklus secara keliru (angka 22/9/13 tampak sama, tetapi daftar finding per siklus tidak sama dengan draft rujukan v2.3 yang ditinjau Acceptance Owner, dan jumlah per baris tidak konsisten dengan angka totalnya). Seksi ini memulihkan draft rujukan v2.3 tanpa perubahan keanggotaan. Alokasi tetap berstatus **DRAFT**.

Acceptance Owner telah menetapkan preferensi perencanaan: **Pendekatan 3 Siklus Remediasi**. Alokasi ini **DIPERTAHANKAN SEBAGAI DRAFT** dan belum berstatus final.

| Siklus | Cakupan Draft (keanggotaan rujukan v2.3) | Total | Alasan Pengelompokan (rujukan v2.3) | Status |
|:---:|---|:---:|---|:---:|
| **Cycle 2** | **Fondasi, Entry Point & Arsitektur Shell**<br>- `SOL-AUTH-HERO` (7): IMP-001, 002, 003, 004, 005, 006, 012<br>- `SOL-SHLL-TOPB` (8): IMP-014, 015, 018, 019, 020, 024, 025, 043<br>- Standalone Auth & Access (6): IMP-007, 008, 009, 010, 011, 013<br>- Standalone Error Recovery (1): IMP-023 | **22** | Halaman Login, Aktivasi, TopBar Shell, dan Halaman Error. | **DRAFT** |
| **Cycle 3** | **Alur Inti Akuntabilitas Harian (Pagi & Siang) + IAM/Sidebar**<br>- Morning Commitment (5): IMP-016, 027, 028, 029, 030<br>- Additional Work (2): IMP-031, 032<br>- IAM & Sidebar (2): IMP-017, 026 | **9** | Alur input harian karyawan; regresi wajib terhadap `MorningCommitmentView.spec.ts`. | **DRAFT** |
| **Cycle 4** | **EOD Outcome, Manajemen Blocker, Profil & Polish**<br>- Standalone EOD (8): IMP-033, 034, 035, 036, 037, 038, 039, 040<br>- `SOL-BLKR-FORM` (3): IMP-041, 042, 044<br>- `SOL-PROF-LAYO` (2): IMP-021, 022 | **13** | Evaluasi sore, pelaporan blocker, profil; regresi wajib terhadap `EodOutcomeView.spec.ts`. | **DRAFT** |
| **TOTAL** | 44 finding | **44** | 4 kluster (20) + 24 standalone | **DRAFT** |

### 9.2. Audit Integritas Alokasi (Zero Omission, Zero Duplicate, Zero Cluster Split)
- **Zero Omission / Zero Duplicate:** 44 dari 44 finding teralokasi tepat satu kali (diverifikasi programatik pada Errata v2.5.1).
- **Zero Cluster Split:** `SOL-AUTH-HERO` (7) utuh di Cycle 2; `SOL-SHLL-TOPB` (8) utuh di Cycle 2; `SOL-PROF-LAYO` (2) utuh di Cycle 4; `SOL-BLKR-FORM` (3) utuh di Cycle 4.
- **Catatan Kehati-hatian (E-06):** Klaim v2.3 bahwa Cycle 2 berdampak nol pada file Cycle 1 bersyarat pada keputusan ekstraksi TopBar yang belum diambil: markup `class="topbar*"` tertanam inline di 20 view, termasuk `MorningCommitmentView.vue` dan `EodOutcomeView.vue`, dan `TopBar.vue` belum ada. Lihat RWP v0.1 Bagian 8 dan 10.

---

## 10. ENHANCED SECURITY RISK ASSESSMENT: VERIF-FIND-001 & COMPREHENSIVE RISK REGISTER

### 10.1. Penguatan Penilaian Risiko VERIF-FIND-001 (OPEN / PENDING OWNER MITIGATION)
Status risiko keamanan `VERIF-FIND-001` secara tegas dipertahankan:

$$\mathbf{STATUS:}\ \text{OPEN / PENDING OWNER MITIGATION}$$

#### 10.1.1. Taksonomi dan Perbedaan Kategori Secret
1. **Production Secrets:** Kunci enkripsi privat, root database credentials, production API keys pihak ketiga, dan production service role tokens. Hasil audit membuktikan kategori ini **bersih (CLEAN)** dan tidak pernah masuk ke Git baseline.
2. **Demo Credentials:** Akun pengguna demo operasional yang tercantum dengan kata sandi teks jelas (*cleartext demo passwords*) pada file `UAT-Test-Data-Matrix.csv` dan `UAT-Manual-Test-Cases.md` (`admin@dutamedia.com`, `budi@dutamedia.com`, `alice@dutamedia.com`, dsb. dengan nilai password: `[REDACTED]`).
3. **Seeder Activation Token:** String rahasia token aktivasi undangan 72 jam yang tertanam secara hardcoded pada `backend/prisma/seed.ts` (nilai rahasia: `[REDACTED]`) untuk akun `calon.karyawan@dutamedia.com`.
4. **Other Exposed Application Secrets:** Nilai default secret JWT atau session cookie fallback yang berpotensi terekam dalam riwayat commit Git historis.

> [!WARNING] Larangan Pernyataan Palsu (No False Clean Claims)
> Dilarang menyatakan bahwa "tidak ada secret yang terekspos" selama kredensial demo dan token aktivasi seeder historis belum diverifikasi penutupannya secara operasional.

#### 10.1.2. Inventarisasi Permukaan Paparan Keamanan Lengkap (7 Elemen Paparan)
1. **Remote Repository & Visibilitasnya:** Repositori remote GitHub yang telah diubah ke Private memerlukan verifikasi administratif berkala.
2. **Git Commit History & Cache:** Potensi rekaman secret pada commit historis remote.
3. **Forks, Clones, & Salinan Eksternal:** Potensi clone pihak ketiga saat repo berstatus publik sebelum penguncian baseline.
4. **Kredensial Demo yang Pernah Terekspos:** Kredensial akun demo operasional dengan password `[REDACTED]`.
5. **Seeder Activation Token:** Hardcoded token aktivasi demo 72 jam pada `backend/prisma/seed.ts` (`[REDACTED]`).
6. **File Dokumentasi Historis:** Berkas UAT lama yang mencatat kredensial tanpa sensor.
7. **Verifikasi Efektivitas Rotasi Kredensial:** Ketiadaan bukti penolakan aktif kredensial lama pada server staging/production.

---

### 10.2. Register Risiko Teknis & Mitigasi Komprehensif

| ID Risiko | Deskripsi Risiko Teknis | Kategori Risiko | Dampak Potensial | Tindakan Mitigasi Terencana | Status |
|:---:|---|---|:---:|---|:---:|
| **RSK-TECH-001** | Potensi regresi pada submission lock Cycle 1 (`DEF-001` & `DEF-002`) saat meremajakan form daily. | Arsitektur Form | Kritis | Terapkan Protokol Regresi 4 Lapis & wajib lulus 100% test baseline terfokus (19 test cases). | **ACTIVE CONTROL** |
| **RSK-TECH-002** | *Layout shift* atau kerusakan visual TopBar saat ekstraksi komponen shared `TopBar.vue`. | Visual / Shell | Tinggi | Buat komponen shared secara modular, pertahankan class CSS acuan Prototipe HTML, verifikasi lintas halaman. | **PLANNED** |
| **RSK-TECH-003** | Inkonsistensi data carry-over komitmen harian pada skenario multi-day roll. | Data Integrity | Sedang | Verifikasi chain carry-over pada `daily.service.spec.ts` dan validasi logika rekursif 3 hari berturut-turut. | **ACTIVE CONTROL** |
| **RSK-TECH-004** | Paparan kredensial demo dan token aktivasi seeder historis (`VERIF-FIND-001`). | Keamanan Data | Kritis | Pertahankan status OPEN, sanitasi `[REDACTED]`, ajukan rekomendasi rotasi resmi ke Acceptance Owner. | **OPEN / PENDING** |
| **RSK-TECH-005** | Ketidaksesuaian nilai default cutoff lockout (`09:30` vs `23:59`) pada `daily.service.ts` (`TECH-FIND-001`). | Implementation Discrepancy | Tinggi | Reklasifikasi sebagai ketidaksesuaian implementasi terhadap requirement; rencanakan perbaikan pada paket kerja terkait (usulan Cycle 3; lihat Errata E-03). | **REMEDIATION REQUIRED** |

---

## 11. ACCEPTANCE OWNER DECISIONS STATUS & REMAINING INVENTORY

### 11.1. Status Keputusan Acceptance Owner yang Telah Diterbitkan (v2.5)
1. **Ratifikasi Baseline Clustering 44 Findings:** **FORMALLY RATIFIED (`DEC-009-UAT`, `CHG-009`)**.
2. **Penyelarasan Terminologi Badge IMP-027:** **APPROVED IN PRINCIPLE AS CANDIDATE `DEC-010-UAT`** (Badge: `Terlambat (LATE)`, eliminasi total *Grace Period* & *Jendela Toleransi* dari UI, preservasi dokumen sumber).
3. **Batas Waktu Pengisian Komitmen Pagi (`IMP-028`):** **FORMALLY AFFIRMED (23:59 WIB)** (Nilai fallback `09:30` ditetapkan sebagai `IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`).
4. **Presisi Waktu Keterlambatan (`TECH-FIND-002`):** **PROVISIONALLY APPROVED (MINUTE RESOLUTION `HH:mm`)** (09:00 On-Time, 09:01 Late).
5. **Definisi Operasional Batas Cut-Off & Lockout:** **PROVISIONALLY APPROVED** (Pengisian diizinkan selama menit 23:59 WIB, lockout efektif 00:00:00 WIB hari berikutnya).
6. **Otorisasi Penyusunan RWP:** **FORMALLY AUTHORIZED** (Penyusunan dokumen perencanaan diizinkan tanpa implementasi kode).

### 11.2. Inventarisasi Keputusan yang Masih Tertunda (Remaining Owner Decisions)
Poin-poin berikut tetap dicatat sebagai keputusan yang menunggu penetapan definitif Acceptance Owner:
1. **Pencatatan Formal `DEC-010-UAT` ke dalam Decision Log:** Pencatatan administratif resmi keputusan terminologi UI ke dalam `UAT-Decision-Log.md` bersamaan dengan evaluasi RWP.
2. **Pengesahan Final Alokasi Siklus (Cycle 2, 3, 4):** Penetapan final alokasi siklus 22 + 9 + 13 dari status DRAFT menjadi definitif.
3. **Alokasi Kuota Hari Kerja UAT Manual:** Penetapan alokasi hari kerja pengujian manual yang disediakan Acceptance Owner per siklus kerja.
4. **Persetujuan Arsitektur Ekstraksi Komponen Shared TopBar:** Pengesahan usulan refaktorisasi ekstraksi `<header class="topbar">` menjadi satu komponen shared `TopBar.vue` (`SOL-SHLL-TOPB`).
5. **Otorisasi Implementasi Kode untuk TECH-FIND-001:** Pemberian wewenang modifikasi kode `daily.service.ts` dan seeder pada saat paket kerja terkait dimulai (usulan Cycle 3).
6. **Operasionalisasi Mitigasi Kredensial & Seeder Token (`VERIF-FIND-001`):** Wewenang eksekusi rotasi kredensial demo dan pembersihan seeder token.

---

## 12. AUTHORIZATION FOR RWP FORMULATION & NEXT PLANNING ACTIVITIES

### 12.1. Pernyataan Otorisasi Resmi Penyusunan RWP
Acceptance Owner telah menerbitkan **OTORISASI RESMI** bagi tim analisis untuk menyusun dokumen *Remediation Work Plan* (RWP) berdasarkan:
- Baseline 44 findings yang telah terverifikasi penuh.
- Clustering solusi teratifikasi `DEC-009-UAT`.
- Draft alokasi Cycle 2 (22 findings), Cycle 3 (9 findings), dan Cycle 4 (13 findings).
- Technical findings yang telah direkonsiliasi (`TECH-FIND-001`, `002`, `003`).
- Register risiko keamanan terbuka (`VERIF-FIND-001`).
- Protokol perlindungan regresi Cycle 1 (19 unit test regression baseline).

### 12.2. Batasan Larangan Ketat (Strict Non-Authorization Boundaries)
Otorisasi ini secara eksplisit **HANYA BERLAKU UNTUK PENYUSUNAN DAN EVALUASI DOKUMEN RWP**. Tim dilarang keras melakukan:
- Implementasi kode aplikasi (`frontend/src/`, `backend/src/`).
- Perubahan skema basis data, migrasi Prisma, maupun seeder (`seed.ts`).
- Modifikasi master backlog `UAT/UAT-Improvement-Backlog.md` atau teks AC asli.
- Eksekusi perintah `git commit` maupun `git push`.
- Pelaksanaan pengujian Manual UAT.
- Pengesahan sepihak alokasi siklus final.
- Penutupan sepihak atas risiko `VERIF-FIND-001`.

### 12.3. Rekomendasi Langkah Kerja Penyusunan RWP (Next Activities)
Setelah laporan persiapan versi 2.5 ini diserahkan, langkah penyusunan dokumen perencanaan meliputi:
1. **Penyusunan Dokumen Paket Kerja Remediasi:** Menerbitkan `UAT-Remediation-Work-Packages.md` mencakup 4 kluster solusi (`RWP-CLUST-01` s.d. `04`) dan 24 paket mandiri (`RWP-STND-*`).
2. **Penyusunan Matriks Prioritas Remediasi:** Menerbitkan `UAT-Remediation-Priority-Matrix.md` dengan kalkulasi formula kuantitatif.
3. **Penyusunan Matriks Dependensi & Dampak:** Menerbitkan `UAT-Dependency-and-Impact-Matrix.md` memetakan dependensi kode dan workflow.
4. **Penyusunan Rencana Alokasi Siklus (CAP):** Menerbitkan `UAT-Cycle-Allocation-Plan.md` yang menyajikan jadwal draft alokasi Cycle 2, 3, dan 4 untuk evaluasi Acceptance Owner.

---

## 13. GOVERNANCE COMPLIANCE & STRICT BOUNDARIES STATEMENT

Laporan ini disusun dengan kepatuhan penuh terhadap prinsip tata kelola pengujian perangkat lunak dan batasan otoritas:
1. **Zero Code Changes:** Dokumen ini disusun murni melalui analisis kode sumber dan pengujian terfokus read-only tanpa melakukan perubahan pada kode aplikasi backend maupun frontend.
2. **Zero Database / Seeder / Migration Changes:** Skema basis data, data seeder (`seed.ts`), dan migrasi Prisma tetap berada pada baseline stabil tanpa modifikasi.
3. **Master Backlog Immutability:** Berkas `UAT/UAT-Improvement-Backlog.md` beserta seluruh Acceptance Criteria asli tetap terjaga 100% utuh tanpa perubahan kata atau makna.
4. **Historical UAT Preserved:** Seluruh log pengujian manual dan catatan riwayat UAT terdahulu tetap dipertahankan.
5. **Security Operations Restraint:** Tidak ada rotasi kredensial atau penghapusan riwayat commit Git yang dieksekusi sepihak di luar wewenang Acceptance Owner.
6. **No Premature Implementation:** Tidak ada implementasi paket remediasi (RWP) atau siklus remediasi Cycle 2–4 yang dimulai sebelum dokumen perencanaan ini disahkan secara definitif.

---
**DITETAPKAN DI:** Jakarta  
**PADA TANGGAL:** 02 November 2026  
**TIM PENYUSUN:** Senior Software Architect, Backend Engineer, QA Lead, & Governance Analyst  
**STATUS PENYERAHAN:** FORMALLY ENDORSED PRE-PLANNING BASELINE (AUTHORIZED FOR RWP FORMULATION)

---

## ERRATA v2.5.1 (Koreksi Pembacaan Sumber)

Koreksi ini dibuat setelah pembacaan langsung PRD, SAD, UI/UX Spec, Test Plan, kode, seeder, dan master backlog untuk penyusunan RWP. Tidak ada keputusan Acceptance Owner yang diubah, tidak ada master backlog, kode, seeder, atau database yang diubah.

| ID | Lokasi di v2.5 | Pernyataan v2.5 | Koreksi | Dampak |
|:---:|---|---|---|---|
| **E-01** | RPP Seksi 9 | Tabel alokasi siklus berisi keanggotaan yang berbeda dari draft v2.3, dengan jumlah per baris tidak konsisten (Cycle 3 memuat 10 finding bertulis 9; Cycle 4 memuat 12 bertulis 13). | Keanggotaan dipulihkan ke draft v2.3 (lihat Seksi 9.1). Angka 22/9/13 tidak berubah. | Menyangkut alokasi yang berstatus DRAFT; tidak mengubah klasifikasi atau keanggotaan kluster. |
| **E-02** | RPP 4.6; Supplement 3.2 | PRD Seksi 3.2 disebut memuat zona `< 09:00` / `09:01–23:59` / `> 23:59`; semua sumber disebut 100% konsisten; kutipan `IMP-028` ditulis seolah verbatim. | PRD Seksi 3.2 tidak memuat notasi itu. Norma ada pada FR-26/AC-57 (`≤ On-Time Deadline`; `Cut-Off = deadline + Grace Period`). Kutipan `IMP-028` pada v2.5 adalah parafrasa, bukan verbatim. Klaim 100% konsisten ditarik. | Perbedaan notasi dan presisi didokumentasikan pada RWP v0.1 Bagian 4. |
| **E-03** | RPP 4.5, 10.2, 11.2; Supplement TECH-FIND-001 | Remediasi `TECH-FIND-001` ditempatkan pada Cycle 2. | `IMP-028` (sumber requirement 23:59) dan `daily.service.ts` termasuk lingkup Cycle 3 pada draft rujukan. Penempatan diubah menjadi **usulan Cycle 3**; keputusan akhir tetap pada Acceptance Owner. | Tidak ada perubahan kode; penempatan masih usulan. |
| **E-04** | RPP 4.2 baris 6–8 | Kode saat ini disebut terkunci pada 23:58–23:59 dengan cutoff `09:30`. | Nilai efektif ditentukan oleh sumber konfigurasi (DB/fallback/literal). Pernyataan hanya berlaku bila nilai efektif `09:30`. | Dijelaskan pada RWP v0.1 Bagian 5. |
| **E-05** | RPP 4.4 | Lapisan 3 dan 4 pertahanan tanggal dinyatakan terbukti. | Lapisan 1 dan 2 diverifikasi dari kode/skema. Lapisan 3 dan 4 adalah inferensi pembacaan kode, belum diverifikasi saat runtime. | Status verifikasi diperjelas. |
| **E-06** | Draft rujukan v2.3 (Seksi 9) | Cycle 2 disebut berdampak nol pada file Cycle 1. | Bersyarat pada keputusan ekstraksi TopBar (markup topbar inline pada 20 view, termasuk 2 view Cycle 1). | Risiko dicatat pada RWP v0.1. |
