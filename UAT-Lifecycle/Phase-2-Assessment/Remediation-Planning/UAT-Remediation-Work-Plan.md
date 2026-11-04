# RENCANA KERJA REMEDIASI (REMEDIATION WORK PLAN — RWP)
## Cetak Biru Operasional Remediasi 44 Improvement Findings (IMP-001 s.d. IMP-044) Pasca Ratifikasi DEC-009-UAT & Rekonsiliasi Baseline v2.5.1

**Nomor Dokumen:** UAT-PHASE2-RWP-001  
**Versi Dokumen:** v0.2 (DRAFT FOR ACCEPTANCE OWNER REVIEW & RATIFICATION)  
**Tanggal Penerbitan:** 02 November 2026  
**Otoritas Pengesahan:** Acceptance Owner & Lead Manual UAT Tester (Harry)  
**Tim Penyusun:** Senior Software Architect, Backend Engineer, QA Lead, dan Governance Analyst  
**Status Dokumen:** DRAFT — PENDING FORMAL ACCEPTANCE OWNER RATIFICATION  
**Dasar Kebijakan & Otoritas Tata Kelola:** `DEC-009-UAT`, `CHG-009`, Kandidat `DEC-010-UAT`, Master Backlog `UAT/UAT-Improvement-Backlog.md`

> [!IMPORTANT] BATASAN TATA KELOLA KETAT (STRICT GOVERNANCE SCOPE)
> 1. **Dokumen Perencanaan Murni:** Dokumen Rencana Kerja Remediasi (RWP v0.2) ini adalah artefak perencanaan dan spesifikasi teknis operasional, **BUKAN** otorisasi untuk memulai perubahan kode, skema, database, seeder, atau pengujian manual.
> 2. **Master Backlog sebagai Sumber Kebenaran Tunggal:** Seluruh deskripsi, prioritas, dan Acceptance Criteria asli bersumber secara sah dari `UAT/UAT-Improvement-Backlog.md` tanpa modifikasi sepihak.
> 3. **Invariant Baseline Teratifikasi:** Baseline klasifikasi `DEC-009-UAT` bersifat mengikat (20 GROUP dalam 4 Kluster, 24 STANDALONE, 0 REVIEW = 44 Findings). Tidak ada pemindahan finding antarcluster.
> 4. **Alokasi Siklus Berstatus Draft:** Alokasi 3 Siklus Remediasi (Cycle 2: 22, Cycle 3: 9, Cycle 4: 13) berstatus **DRAFT** dan menunggu penetapan final Acceptance Owner.
> 5. **Zero Code / Schema / Test Execution:** Tidak ada perintah git commit/push, perubahan file implementasi (`frontend/src/`, `backend/src/`), manipulasi seeder/migrasi, atau eksekusi Manual UAT.
> 6. **Kepatuhan Stop Condition:** Sesuai instruksi Acceptance Owner, setelah dokumen ini diserahkan, seluruh aktivitas teknis dihentikan untuk menunggu evaluasi formal Acceptance Owner.

---

## LOG RIWAYAT REVISI DOKUMEN (DOCUMENT REVISION HISTORY)

| Versi | Tanggal | Peninjau / Otoritas | Ringkasan Perubahan & Dasar Kebijakan |
|:---:|:---:|---|---|
| **v0.1** | 02 Nov 2026 | Tim Penyusun Teknis | Inisialisasi awal dokumen Rencana Kerja Remediasi (RWP) pasca otorisasi Phase 2 Baseline v2.5.1. Transformasi 44 temuan ke dalam 28 paket kerja terstruktur. |
| **v0.2** | 02 Nov 2026 | Acceptance Owner (Harry) | **Revisi Terarah (Targeted Revision):**<br>1. Pemisahan arsitektural analisis konfigurasi `TECH-FIND-001` antara *Runtime Resolution* (`PolicyService`) vs *Configuration Initialization & Maintenance* (`seed.ts` key mismatch & frontend initial state).<br>2. Klarifikasi batas waktu dan penelusuran referensi PRD (FR-26 & AC-57 di Seksi 3.6; Seksi 3.2 sebagai *Daily Record*; pencatatan *unresolved documentation reference*).<br>3. Penjelasan arsitektur *TopBar Phased Extraction* (Opsi C) mencakup pemetaan AC Cycle 2, migrasi daily views di Cycle 3 & 4 sebagai *technical enabler*, dan acceptance gate yang ketat.<br>4. Penguatan validasi alokasi siklus melalui analisis kompleksitas, estimasi effort (Story Points), risiko regresi, dan pembuktian keseimbangan beban kerja nyata.<br>5. Audit kelengkapan 11 atribut seragam pada seluruh 28 paket kerja (DoD, Scope, Out of Scope, Dependencies, Regression Impact, Test Scenarios).<br>6. Penambahan Matriks Audit Keterlacakan 44 Temuan dan Rekapitulasi Keputusan Tertunda Owner. |
| **v0.3** | 02 Nov 2026 | Product Owner (Harry) | **Dokumentasi Keputusan Remediasi Final Cycle 2 — GROUP 1 (`SOL-AUTH-HERO`):**<br>1. Penetapan final copy tagline hero login (`IMP-001`) tanpa tanda titik.<br>2. Penetapan judul Poin Fitur 1 *"Komitmen Harian"* (`IMP-002`) menggantikan *"Komitmen Pagi Tuntas"*.<br>3. Penetapan subtitle Poin Fitur 1 *"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."* (`IMP-003`).<br>4. Penetapan judul *"Pelaporan Hambatan Kerja"* dan subtitle Poin Fitur 2 (`IMP-004`).<br>5. Penetapan judul *"Kemitraan & Dukungan Tim"* dan subtitle Poin Fitur 3 (`IMP-005`).<br>6. Standardisasi ikon vektor SVG Lucide profesional: `Target`, `Flag`, dan `Users` menggantikan emoji platform (`IMP-006`).<br>7. Penguncian paritas 100% panel kiri hero halaman aktivasi akun (`ActivateView.vue`) terhadap login (`IMP-012`). |

---

## DAFTAR ISI
1. [RINGKASAN EKSEKUTIF & LANDASAN TATA KELOLA](#1-ringkasan-eksekutif--landasan-tata-kelola)
2. [REKONSILIASI & KLARIFIKASI KEBUTUHAN BATAS WAKTU (TIME BOUNDARY & CUT-OFF SEMANTICS)](#2-rekonsiliasi--klarifikasi-kebutuhan-batas-waktu-time-boundary--cut-off-semantics)
   - 2.1. Klarifikasi Batas Waktu On-Time (PRD Seksi 3.6 vs Keputusan Presisi Menit)
   - 2.2. Disambiguasi Tiga Dimensi Semantik Cut-Off
   - 2.3. Linimasa Waktu & Peran Pertahanan Batas Tanggal (Anti-Backdating Guard)
   - 2.4. Penelusuran Sumber PRD & Catatan Dokumentasi
3. [ANALISIS ARSITEKTUR KONFIGURASI TECH-FIND-001 & RENCANA REMEDIASI MULTI-LAPIS](#3-analisis-arsitektur-konfigurasi-tech-find-001--rencana-remediasi-multi-lapis)
   - 3.1. Hakikat Diskrepansi Teknis TECH-FIND-001
   - 3.2. Resolusi Konfigurasi Saat Runtime (Runtime Configuration Resolution)
   - 3.3. Inisialisasi & Pemeliharaan Konfigurasi (Initialization & Maintenance)
   - 3.4. Matriks Komparasi Peran Sebenarnya & Sumber Nilai Konfigurasi
   - 3.5. Rencana Tindakan Remediasi Terkoordinasi 5 Langkah (Hanya sebagai Rencana)
   - 3.6. Justifikasi Penempatan Alokasi pada Cycle 3
4. [TATA KELOLA ARSITEKTUR TOPBAR: ANALISIS PHASED EXTRACTION (OPSI C)](#4-tata-kelola-arsitektur-topbar-analisis-phased-extraction-opsi-c)
   - 4.1. Kondisi Aktual Markup TopBar Inline pada 20 View
   - 4.2. Pemetaan Cakupan Penyelesaian AC pada Cycle 2
   - 4.3. Migrasi Daily Views di Cycle 3 & 4 sebagai Technical Enabler
   - 4.4. Gerbang Penerimaan Ketat (Acceptance Gate) Cycle 2
5. [VALIDASI KESEIMBANGAN BEBAN KERJA & ALOKASI SIKLUS (CAP VALIDATION)](#5-validasi-keseimbangan-beban-kerja--alokasi-siklus-cap-validation)
   - 5.1. Alokasi 3 Siklus Remediasi (Draft: 22 + 9 + 13 = 44)
   - 5.2. Analisis Kompleksitas, Estimasi Effort (Story Points), dan Risiko Regresi
   - 5.3. Pembuktian Tiga Invariant Alokasi (Zero Omission, Zero Duplicate, Zero Cluster Split)
6. [SPESIFIKASI RINCI 28 PAKET KERJA REMEDIASI (WORK PACKAGES SPECIFICATION)](#6-spesifikasi-rinci-28-paket-kerja-remediasi-work-packages-specification)
   - 6.1. Paket Kluster Solusi Terpadu (RWP-CLUST-01 s.d. RWP-CLUST-04)
   - 6.2. Paket Temuan Mandiri (RWP-STND-01 s.d. RWP-STND-24)
7. [MATRIKS AUDIT KETERLACAKAN 44 FINDINGS & DEPENDENSI FILE (AUDIT MATRIX)](#7-matriks-audit-keterlacakan-44-findings--dependensi-file-audit-matrix)
8. [PROTOKOL PENCEGAHAN REGRESI CYCLE 1 & AUTOMATED VERIFICATION GATE](#8-protokol-pencegahan-regresi-cycle-1--automated-verification-gate)
   - 8.1. Empat Lapis Pertahanan Regresi
   - 8.2. Baseline Suite 19 Automated Tests
   - 8.3. Protokol & Kriteria Gerbang Kelulusan (Pass Gate Criteria)
9. [MANAJEMEN RISIKO KEAMANAN VERIF-FIND-001 & SANITASI KREDENSIAL](#9-manajemen-risiko-keamanan-verif-find-001--sanitasi-kredensial)
10. [REKAPITULASI KEPUTUSAN TERTUNDA ACCEPTANCE OWNER (PENDING DECISIONS REGISTER)](#10-rekapitulasi-keputusan-tertunda-acceptance-owner-pending-decisions-register)
11. [BATASAN KETAT PELAKSANAAN & BLOK PENGESAHAN FORMAL](#11-batasan-ketat-pelaksanaan--blok-pengesahan-formal)

---

## 1. RINGKASAN EKSEKUTIF & LANDASAN TATA KELOLA

### 1.1. Konteks Proyek & Mandat Tata Kelola
WorkPulse — Daily Accountability & Blocker Log System dikembangkan untuk memenuhi kebutuhan akuntabilitas kerja harian, penyelarasan komitmen pagi, pelaporan tugas tambahan, evaluasi sore hari (End-of-Day/EOD), dan eskalasi hambatan (*blockers*) di lingkungan PT Dutamedia Mandiri Pratama.

Setelah penyelesaian siklus `CYCLE-01` yang memulihkan cacat integritas data (`DEF-001` dan `DEF-002`) serta implementasi 4 lapis perlindungan regresi, Acceptance Owner (Harry) memimpin pengujian manual menyeluruh yang menghasilkan **44 Calon Penyempurnaan (Improvement Findings: `IMP-001` s.d. `IMP-044`)**.

Melalui **Keputusan Tata Kelola `DEC-009-UAT`** dan Perubahan Baseline `CHG-009`, Acceptance Owner telah secara formal **MENYETUJUI DAN MERATIFIKASI** baseline clustering 44 finding dengan distribusi resmi:
- **20 GROUP FINDINGS** terbagi utuh ke dalam 4 Kluster Solusi Terpadu:
  1. `SOL-AUTH-HERO` (7 finding): IMP-001, IMP-002, IMP-003, IMP-004, IMP-005, IMP-006, IMP-012.
  2. `SOL-SHLL-TOPB` (8 finding): IMP-014, IMP-015, IMP-018, IMP-019, IMP-020, IMP-024, IMP-025, IMP-043.
  3. `SOL-PROF-LAYO` (2 finding): IMP-021, IMP-022.
  4. `SOL-BLKR-FORM` (3 finding): IMP-041, IMP-042, IMP-044.
- **24 STANDALONE FINDINGS:** IMP-007, IMP-008, IMP-009, IMP-010, IMP-011, IMP-013, IMP-016, IMP-017, IMP-023, IMP-026, IMP-027, IMP-028, IMP-029, IMP-030, IMP-031, IMP-032, IMP-033, IMP-034, IMP-035, IMP-036, IMP-037, IMP-038, IMP-039, IMP-040.
- **0 REVIEW FINDINGS.**
- **Total: 44 findings.**

Ratifikasi `DEC-009-UAT` juga secara tegas menetapkan klasifikasi temuan batas:
- `IMP-011`: STANDALONE.
- `IMP-015`: GROUP ke `SOL-SHLL-TOPB`.
- `IMP-016`: STANDALONE (dengan dampak langsung pada 3 modul workflow: Morning, Additional Work, EOD).
- `IMP-040`: STANDALONE.

### 1.2. Status Kandidat Keputusan DEC-010-UAT
Berdasarkan arahan Acceptance Owner pada Evaluasi Baseline v2.4 dan v2.5, telah disepakati penyelarasan terminologi untuk `IMP-027`:
- Label status waktu keterlambatan pada antarmuka pengguna diseragamkan menjadi: **`Terlambat (LATE)`**.
- Istilah ambigu seperti *'Grace Period'* dan *'Jendela Toleransi'* **dieliminasi sepenuhnya** dari antarmuka pengguna (*UI microcopy*).
- Dokumen sumber historis tetap mempertahankan istilah aslinya untuk kepentingan audit trail.
- Status tata kelola: Dicatat dalam RWP ini sebagai **Kandidat Keputusan `DEC-010-UAT`** dan menunggu pengesahan formal bersama pengesahan RWP.

### 1.3. Status Klasifikasi Temuan Teknis & Keamanan
- **`TECH-FIND-001` (Fallback Batas Waktu Backend 09:30 vs Kebutuhan 23:59 WIB):**  
  Acceptance Owner telah secara definitif menetapkan klasifikasi resmi:  
  **`IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`**  
  Batas akhir pengisian komitmen harian yang sah secara bisnis adalah pukul `23:59 WIB` (`IMP-028`). Fallback `09:30` pada kode backend merupakan ketidaksesuaian implementasi terhadap requirement yang wajib diremediasi secara multi-lapis.
- **`VERIF-FIND-001` (Paparan Kredensial & Secret Historis):**  
  Status tata kelola: **`OPEN / PENDING OWNER MITIGATION`**.  
  Seluruh artefak perencanaan telah disanitasi menggunakan placeholder `[REDACTED]`. Tindakan operasional rotasi token seeder, pencabutan kredensial, atau rewriting git history dilarang dilakukan secara sepihak dan berada sepenuhnya di bawah kewenangan Acceptance Owner.

### 1.4. Tujuan Dokumen RWP v0.2
Rencana Kerja Remediasi (RWP v0.2) ini disusun untuk:
1. Mentransformasikan 44 temuan improvement dan 1 temuan diskrepansi teknis (`TECH-FIND-001`) menjadi **28 Paket Kerja Terstruktur (4 Paket Kluster Solusi + 24 Paket Temuan Mandiri)** dengan atribut rekayasa lengkap.
2. Menyediakan analisis mendalam batas waktu (*time boundary reconciliation*) dan pemisahan arsitektur konfigurasi runtime vs inisialisasi.
3. Menguraikan peta jalan transisi arsitektur *TopBar Phased Extraction* (Opsi C) tanpa merusak isolasi siklus atau regresi Cycle 1.
4. Memberikan validasi keseimbangan beban kerja nyata lintas siklus berbasis estimasi kompleksitas, story points, dan profil risiko.
5. Menetapkan Protokol Pencegahan Regresi Cycle 1 berbasis gerbang otomatis 19 unit test cases.

---

## 2. REKONSILIASI & KLARIFIKASI KEBUTUHAN BATAS WAKTU (TIME BOUNDARY & CUT-OFF SEMANTICS)

### 2.1. Klarifikasi Batas Waktu On-Time (PRD Seksi 3.6 vs Keputusan Presisi Menit)
Dalam audit penelusuran sumber kebutuhan (*requirements traceability*), ditemukan adanya perbedaan notasi teknis antara dokumen PRD, SAD, dan praktik implementasi lapangan:
- **PRD Seksi 3.6 (FR-26 & AC-57):** Menyatakan secara konseptual kontinu bahwa submission berstatus On-Time jika `submittedAt <= On-Time Deadline` (di mana deadline didefinisikan sebagai 09:00 WIB).
- **Implementasi Aktual Backend (`daily.service.ts`):** Menggunakan format waktu 24 jam dengan resolusi menit (`HH:mm`) via string comparison:
  ```typescript
  const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
  const isLate = currentTime > onTimeCutoffTime; // onTimeCutoffTime = '09:00'
  ```
  Pada evaluasi string ini, waktu `09:00:30` diekstrak menjadi string `'09:00'`, sehingga `'09:00' > '09:00'` bernilai `false` (dianggap ON_TIME).

**Keputusan Klarifikasi Operasional Acceptance Owner:**
Acceptance Owner menetapkan bahwa untuk keperluan operasional sistem WorkPulse, resolusi waktu ditegakkan pada tingkat presisi **menit kalender operasional**:

| Rentang Waktu Nyata (WIB) | Representasi String `HH:mm` | Klasifikasi Status | Evaluasi Bisnis & Tindakan Sistem |
|:---:|:---:|:---:|---|
| **00:00:00 s.d. 09:00:59 WIB** | `00:00` s.d. `09:00` | **`ON_TIME`** | Tepat Waktu. Seluruh menit 09:00 sah berstatus On-Time. Tidak ada banner keterlambatan. |
| **09:01:00 s.d. 23:59:59 WIB** | `09:01` s.d. `23:59` | **`LATE`** | Terlambat. Pengisian tetap diperbolehkan dengan penandaan status *LATE* dan banner peringatan aktif (`IMP-028`). |
| **>= 00:00:00 WIB (Hari Berikutnya)** | Pergantian Tanggal Kalender | **`LOCKED`** | Terkunci Permanen. Pengisian ditolak mutlak oleh proteksi anti-backdating (`BUSINESS_RULE_BACKDATING_FORBIDDEN`). |

> [!NOTE] Penegasan Tata Kelola
> Perbedaan notasi antara PRD Seksi 3.6 dan keputusan operasional ini **didokumentasikan secara sah sebagai Requirement Clarification** tanpa melakukan pengubahan sepihak pada teks PRD atau Master Backlog.

### 2.2. Disambiguasi Tiga Dimensi Semantik Cut-Off
Untuk mengeliminasi ambiguitas penafsiran waktu penguncian pada `IMP-028` dan `TECH-FIND-001`, RWP v0.2 secara definitif membedakan **tiga konsep waktu teknis** yang berbeda:

1. **Menit Cut-Off Bisnis (*Configured Cut-Off Minute*): `23:59 WIB`**  
   Nilai parameter kebijakan yang disetujui dalam master backlog (`IMP-028`) dan dikonfigurasi pada sistem sebagai batas akhir toleransi hari kerja berjalan.

2. **Detik Terakhir Pengisian yang Sah (*Last Permitted Submission Instant*): `23:59:59 WIB`**  
   Pengguna yang menekan tombol *'Kirim Morning Commitment'* pada rentang waktu `23:59:00` sampai dengan `23:59:59 WIB` masih **wajib diterima secara sah oleh backend**. Hal ini secara matematis konsisten dengan perbandingan string `currentTime > lockCutoffTime`: pada jam 23:59:xx, `currentTime` bernilai `'23:59'`, perbandingan `'23:59' > '23:59'` bernilai `false`, sehingga pengisian tidak diblokir.

3. **Batas Penguncian Efektif (*Effective Lockout Instant*): `00:00:00 WIB` Hari Kalender Berikutnya**  
   Sistem secara mutlak terkunci efektif tepat pada saat pergantian hari (`00:00:00 WIB`). Penguncian ini **TIDAK HANYA** mengandalkan logika perbandingan jam menit, melainkan ditegakkan secara absolut oleh **Pertahanan Tanggal (*Date Boundary / Anti-Backdating Guard*)** pada `daily.service.ts` L39-44:
   ```typescript
   if (workDate < todayDateString) {
     throw new AppException(422, 'Pengisian untuk tanggal lampau tidak diperbolehkan.');
   }
   ```
   Begitu jam menunjukkan `00:00:00 WIB`, tanggal hari kerja yang sedang dibuka menjadi `workDate < todayDateString`, sehingga request pengisian komitmen otomatis ditolak dengan pesan kesalahan bisnis di atas.

### 2.3. Linimasa Waktu & Peran Pertahanan Batas Tanggal (Anti-Backdating Guard)
Perilaku penentuan status waktu dan toleransi pengisian komitmen pagi dirangkum dalam diagram linimasa berikut:

```mermaid
flowchart LR
    T0["00:00:00 WIB"] -->|ON_TIME (Hijau)| T1["09:00:59 WIB"]
    T1 -->|LATE Starts (Kuning)| T2["09:01:00 WIB"]
    T2 -->|Permitted Late Submission| T3["23:59:59 WIB"]
    T3 -->|Calendar Rollover / Lockout (Merah)| T4["00:00:00 WIB (Hari +1)"]
    style T0 fill:#dcfce7,stroke:#16a34a
    style T1 fill:#dcfce7,stroke:#16a34a
    style T2 fill:#fef3c7,stroke:#d97706
    style T3 fill:#fef3c7,stroke:#d97706
    style T4 fill:#fee2e2,stroke:#dc2626
```

### 2.4. Penelusuran Sumber PRD & Catatan Dokumentasi
Audit langsung terhadap dokumen PRD (`Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md`) mengonfirmasi temuan berikut:
1. **PRD Seksi 3.2 (Daily Accountability Record):**  
   Memuat aturan bisnis inti penyerahan komitmen harian (FR-03: 0–3 commitment, FR-04: kewajiban blocker/support untuk risk AMBER/RED, FR-05: komitmen terkunci sebagai baseline pasca cutoff). Seksi ini **tidak memuat** pembagian zona waktu numerik spesifik (`< 09:00`, `09:01–23:59`).
2. **PRD Seksi 3.6 (Submission Compliance):**  
   Memuat norma klasifikasi waktu formal pada **FR-26 dan AC-57**:
   - `FR-26`: *"Sistem mengklasifikasikan submission Morning dan EOD sebagai On-Time jika submittedAt ≤ On-Time Deadline, Late jika On-Time Deadline < submittedAt ≤ Cut-Off, dan No Submission jika tidak ada submission valid sampai Cut-Off. Cut-Off = On-Time Deadline + Grace Period..."*
   - `AC-57`: *"Submission Morning/EOD pada atau sebelum On-Time Deadline diklasifikasikan On-Time; setelah deadline sampai dan termasuk Cut-Off diklasifikasikan Late; setelah Cut-Off ditolak tanpa penulisan data."*
3. **Catatan Referensi Tak Terdokumentasi (*Unresolved Documentation Reference*):**  
   Klaim historis pada dokumen persiapan awal yang menyebutkan PRD membagi hari menjadi tiga jendela string literal (`< 09:00`, `09:01–23:59`, `> 23:59`) dicatat sebagai **Unresolved Documentation Reference** (tidak ditemukan dalam teks asli PRD). Nilai `23:59 WIB` bersumber sah dari Master Backlog `IMP-027`/`IMP-028` dan keputusan Acceptance Owner, bukan dari PRD Seksi 3.2.

---

## 3. ANALISIS ARSITEKTUR KONFIGURASI TECH-FIND-001 & RENCANA REMEDIASI MULTI-LAPIS

### 3.1. Hakikat Diskrepansi Teknis TECH-FIND-001
Temuan `TECH-FIND-001` mengidentifikasi bahwa kode backend `backend/src/daily/services/daily.service.ts` (L57 & L172) dan `backend/src/policy/policy.constants.ts` (L12) menggunakan fallback default string `'09:30'`:
```typescript
const lockCutoffTime = timingConfig.morningLockCutoff || '09:30';
```
Padahal, kebutuhan bisnis resmi yang tercantum pada master backlog (`IMP-028`) menetapkan batas akhir pengisian komitmen harian hingga pukul **`23:59 WIB`**.

Acceptance Owner telah secara formal menetapkan klasifikasi resmi:
> **`IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`**

Sesuai instruksi Acceptance Owner pada RWP v0.2, analisis ini memisahkan secara tegas antara **Mekanisme Resolusi Saat Runtime** dan **Mekanisme Inisialisasi & Pemeliharaan Konfigurasi**.

### 3.2. Resolusi Konfigurasi Saat Runtime (Runtime Configuration Resolution)
Saat aplikasi berjalan melayani request pengguna, penentuan nilai konfigurasi waktu checkin (`timingConfig`) dievaluasi murni melalui rantai eksekusi runtime berikut:

1. **Pemanggilan Service Kebijakan (`PolicyService.getActivePolicy`):**  
   Saat `DailyService.getTodayState()` (L41) atau `DailyService.submitMorningCheckin()` (L156) dieksekusi, service memanggil:
   ```typescript
   const timingPolicy = await this.policyService.getActivePolicy(PolicyCategory.CHECKIN_TIMING, workDate);
   const timingConfig = timingPolicy.configurationValues;
   ```

2. **Pengambilan Record Database (`prisma.policy.findFirst`):**  
   Pada `PolicyService.getActivePolicy()` (`policy.service.ts` L31-48), backend mencari record kebijakan aktif pada tabel `Policy` dengan aturan:
   - `category = 'CHECKIN_TIMING'`
   - `effectiveDate <= targetDate` (format string `YYYY-MM-DD`)
   - `endDate IS NULL OR endDate >= targetDate`
   - **Aturan Precedence Pengurutan:** `orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }]`.
   *Karakteristik:* Record yang memiliki tanggal efektif paling mutakhir akan diprioritaskan. Jika terdapat beberapa record dengan `effectiveDate` sama, record yang dibuat paling akhir (`createdAt desc`) yang dipilih.

3. **Fallback Kanonikal Service Kebijakan (`policy.constants.ts`):**  
   Jika query database menghasilkan `policy === null` (belum ada record kebijakan aktif di DB), `PolicyService.getActivePolicy()` (`policy.service.ts` L69-83) mengembalikan konstanta kanonikal:
   ```typescript
   configurationValues: CANONICAL_POLICY_FALLBACKS[PolicyCategory.CHECKIN_TIMING]
   ```
   Objek ini memuat nilai fallback: `{ morningOnTimeCutoff: '09:00', morningLockCutoff: '09:30', ... }` dengan flag `isFallback: true` dan `isIllustrative: true`.

4. **Hardcoded Fallback Lokal pada Consumer Service (`daily.service.ts` L57 & L172):**  
   Jika `timingConfig` berhasil diperoleh (baik dari DB maupun canonical fallback), namun property `morningLockCutoff` bernilai `undefined` atau falsy, `DailyService` menerapkan fallback string lokal:
   ```typescript
   const morningLockCutoff = timingConfig.morningLockCutoff || '09:30';
   ```

### 3.3. Inisialisasi & Pemeliharaan Konfigurasi (Initialization & Maintenance)
Di luar rantai eksekusi runtime, terdapat mekanisme inisialisasi dan penyajian antarmuka:

1. **Peran Seeder Database (`backend/prisma/seed.ts` L110-150):**  
   - Seeder bertugas menyuntikkan data awal saat setup database pengujian/lokal (`npm run seed`).
   - **Karakteristik Mutasi Data:** Seeder menggunakan logika:
     ```typescript
     const existing = await prisma.policy.findFirst({ where: { category: pol.category, endDate: null } });
     if (!existing) { await prisma.policy.create({ data: pol }); }
     ```
     Artinya, seeder **HANYA MENGINISIALISASI JIKA BELUM ADA DATA** (`!existing`). Seeder **TIDAK PERNAH MEMPERBARUI** record yang sudah ada di database.
   - **Identifikasi Cacat Kunci (Key Mismatch):** Seeder mendefinisikan kunci `morningCutoff: '09:30'` bukannya `morningLockCutoff: '09:30'`.
   - **Dampak Nyata terhadap Runtime:** Saat database di-seed, record DB menyimpan JSON `{ morningCutoff: '09:30' }`. Ketika runtime membaca `timingConfig.morningLockCutoff`, nilainya bernilai `undefined`! Akibatnya, sistem jatuh ke hardcoded fallback `'09:30'` pada `daily.service.ts` L57.

2. **Peran Frontend Reactive State (`MorningCommitmentView.vue` L70 & `PolicySettingsView.vue`):**  
   - State `ref('09:30')` pada frontend adalah **nilai reaktif sementara** sebelum respons asynchronous API `/api/daily/today` tiba di browser, atau fallback jika panggilan jaringan gagal.
   - State frontend **BUKAN** lapisan runtime precedence backend, dan tidak memiliki otoritas memaksakan waktu cutoff ke server.

### 3.4. Matriks Komparasi Peran Sebenarnya & Sumber Nilai Konfigurasi

| Komponen / Entitas | Peran Sebenarnya | Sumber Nilai Aktual | Kondisi Penggunaan | Bukti File & Baris Kode | Risiko Jika Tidak Sinkron |
|---|---|---|---|---|---|
| **Database PostgreSQL (`Policy` table)** | **Sumber Kebenaran Utama Runtime.** Menyimpan kebijakan aktif bisnis yang sah. | Kolom JSONB `configurationValues` pada record `Policy` aktif. | Digunakan selalu pada setiap request selama ada record yang memenuhi kriteria tanggal aktif. | `backend/src/policy/services/policy.service.ts` L31-48 | Jika DB masih menyimpan `'09:30'`, perbaikan kode di service akan diabaikan karena DB menang mutlak. |
| **Canonical Fallback (`policy.constants.ts`)** | **Fallback Arsitektural Tingkat Service.** Menjamin `PolicyService` tidak crash jika database kosong. | Konstanta TypeScript `CANONICAL_POLICY_FALLBACKS[CHECKIN_TIMING]`. | Digunakan hanya jika tabel DB kosong atau tidak ada record aktif yang cocok. | `backend/src/policy/policy.constants.ts` L12, `policy.service.ts` L73 | Jika DB kosong, sistem kembali terkunci pada 09:30 jika konstanta ini tidak diperbaiki. |
| **Consumer Fallback (`daily.service.ts`)** | **Fallback Pertahanan Lokal (*Defensive Guard*).** Mencegah crash jika objek JSON dari DB tidak memiliki key terkait. | String literal `'09:30'`. | Digunakan jika `timingConfig.morningLockCutoff` bernilai `undefined` (misal karena key mismatch seeder). | `backend/src/daily/services/daily.service.ts` L57 & L172 | Menjadi sumber penguncian prematur 09:30 jika DB menghasilkan `undefined` akibat key mismatch. |
| **Database Seeder (`backend/prisma/seed.ts`)** | **Inisialisasi Data Dev/Testing.** Inisialisasi awal lingkungan pengujian baru. | Array objek `policiesData` di dalam script seeder. | Dieksekusi hanya saat `npm run seed`. Tidak dieksekusi saat runtime aplikasi berjalan. | `backend/prisma/seed.ts` L112-125 | Menghasilkan record DB dengan key yang salah (`morningCutoff`), merusak integritas data baru. |
| **Frontend Reactive State (`MorningCommitmentView.vue`)** | **Placeholder UI Sesaat.** Menampilkan UI sebelum data fetch asynchronous selesai. | State reaktif `ref('09:30')`. | Aktif saat komponen di-mount sebelum Axios mengembalikan payload dari server. | `frontend/src/views/daily/MorningCommitmentView.vue` L70 | Menyebabkan *flicker* UI: menampilkan 09:30 sejenak sebelum berubah menjadi 23:59 saat data API tiba. |

### 3.5. Rencana Tindakan Remediasi Terkoordinasi 5 Langkah (Hanya sebagai Rencana)
> [!IMPORTANT] Rencana Bersyarat Tanpa Eksekusi Saat Ini
> Rencana tindakan ini adalah cetak biru teknis yang **hanya akan dieksekusi pada saat Cycle 3 dibuka secara formal**. Tidak ada perintah migrasi, seed, atau modifikasi kode yang dijalankan dalam fase perencanaan ini.

Rencana tindakan remediasi 5 langkah terkoordinasi:
1. **Langkah 1 (Canonical Fallback):** Perbarui `backend/src/policy/policy.constants.ts` baris 12 sehingga canonical fallback `morningLockCutoff` bernilai `'23:59'`.
2. **Langkah 2 (Consumer Fallback):** Perbarui `backend/src/daily/services/daily.service.ts` baris 57 dan 172 sehingga fallback lokal bernilai `'23:59'`.
3. **Langkah 3 (Seeder Alignment):** Perbaiki `backend/prisma/seed.ts` baris 115-120: selaraskan penamaan kunci menjadi `morningLockCutoff` dan nilainya menjadi `'23:59'`.
4. **Langkah 4 (Transisi Kebijakan Database):** Rencanakan pembuatan skrip transisi versi kebijakan (*PolicyVersion Transition*) atau update record aktif kategori `CHECKIN_TIMING` di database agar `configurationValues` memuat `morningLockCutoff: '23:59'` tanpa merusak integritas skema.
5. **Langkah 5 (Frontend Default State):** Selaraskan reactive default ref pada `MorningCommitmentView.vue` dan `PolicySettingsView.vue` menjadi `'23:59'`.

### 3.6. Justifikasi Penempatan Alokasi pada Cycle 3
Meskipun pada evaluasi awal sempat diusulkan masuk ke Cycle 2, Acceptance Owner bersama Tim Arsitek menetapkan bahwa remediasi `TECH-FIND-001` **secara teknis dan logis dialokasikan pada Cycle 3** karena:
1. Kebutuhan bisnis batas `23:59 WIB` bersumber langsung dari **`IMP-028`**, yang merupakan bagian tak terpisahkan dari modul Morning Commitment di Cycle 3.
2. File target utama (`daily.service.ts`) dilindungi secara ketat oleh rangkaian pengujian regresi form pagi (`MorningCommitmentView.spec.ts` dan `daily.service.spec.ts`).
3. Menempatkan remediasi backend ini di Cycle 3 memastikan pengujian menyeluruh (backend service + frontend form lock + banner keterlambatan) diverifikasi dalam satu siklus terintegrasi.

---

## 4. TATA KELOLA ARSITEKTUR TOPBAR: ANALISIS PHASED EXTRACTION (OPSI C)

### 4.1. Kondisi Aktual Markup TopBar Inline pada 20 View
Audit kode frontend mengonfirmasi bahwa saat ini **belum ada komponen mandiri `TopBar.vue`**. Markup header atas (`<div class="topbar">`) saat ini diimplementasikan secara berulang (*copy-pasted inline*) pada **20 view Vue**, termasuk halaman-halaman yang menjadi objek remediasi Cycle 1 (`MorningCommitmentView.vue` dan `EodOutcomeView.vue`).

Kondisi ini menimbulkan tantangan arsitektural: jika kita langsung mengganti seluruh 20 markup inline menjadi komponen `<TopBar />` pada Cycle 2, maka file-file form komitmen harian yang dilindungi oleh regresi Cycle 1 (`DEF-001` dan `DEF-002`) akan termodifikasi secara prematur di luar siklus resminya.

### 4.2. Pemetaan Cakupan Penyelesaian AC pada Cycle 2
RWP v0.2 mempertahankan rekomendasi teknis **Opsi C: Pendekatan Bertahap (*Phased Extraction*)** dengan rincian operasional:

1. **Pembuatan Komponen Terpusat Baru (`frontend/src/components/common/TopBar.vue`):**  
   Dieksekusi pada Cycle 2 di bawah paket kerja `RWP-CLUST-02` (`SOL-SHLL-TOPB`). Komponen ini mengemas avatar icon bundar dengan inisial dinamis (`IMP-014`), dropdown profil dan link logout (`IMP-015`), navigasi ke `/profile` (`IMP-018`), layout breadcrumb & status bar (`IMP-019`), serta event emitter hamburger toggle sidebar (`IMP-020`).

2. **Konsumsi Komponen pada View yang Menjadi Lingkup Cycle 2:**  
   Komponen `TopBar.vue` langsung dipasang pada Shell Navigasi, Halaman Profil (`ProfileView.vue`), Halaman Pelaporan Blocker (`RaiseBlockerView.vue`), dan Halaman Admin (`UsersView.vue`, `PoliciesView.vue`, `OrganizationView.vue`, `TempReviewerView.vue`) untuk memenuhi `IMP-024`, `IMP-025`, dan `IMP-043`.

3. **Pemenuhan 100% Acceptance Criteria `SOL-SHLL-TOPB` di Cycle 2:**  
   Seluruh 8 AC individual dari ke-8 finding `SOL-SHLL-TOPB` diselesaikan dan diverifikasi tuntas pada Cycle 2 pada view-view di atas.

### 4.3. Migrasi Daily Views di Cycle 3 & 4 sebagai Technical Enabler
Untuk mencegah risiko regresi prematur pada form komitmen harian Cycle 1:
- **Status Inline TopBar pada Form Daily saat Cycle 2:**  
  Markup topbar inline pada `MorningCommitmentView.vue`, `AdditionalWorkView.vue`, dan `EodOutcomeView.vue` **TIDAK DISENTUH SAMA SEKALI** selama Cycle 2 berlangsung.
- **Pekerjaan Migrasi di Cycle 3 (Technical Enabler):**  
  Penggantian markup inline menjadi `<TopBar />` pada `MorningCommitmentView.vue` dan `AdditionalWorkView.vue` dijadwalkan pada **Cycle 3** sebagai **Pekerjaan Teknis Pendukung (*Technical Enabler / Architectural Refactoring*)** yang melekat pada paket `RWP-STND-08` s.d. `RWP-STND-16`. Pada siklus ini, `MorningCommitmentView.vue` memang sedang aktif dibuka dan dilindungi langsung oleh `MorningCommitmentView.spec.ts` (6 tests).
- **Pekerjaan Migrasi di Cycle 4 (Technical Enabler):**  
  Penggantian markup inline menjadi `<TopBar />` pada `EodOutcomeView.vue` dijadwalkan pada **Cycle 4** sebagai **Technical Enabler** yang melekat pada paket `RWP-STND-17` s.d. `RWP-STND-24`, saat form EOD aktif diremediasi dan dilindungi oleh `EodOutcomeView.spec.ts` (4 tests).
- **Penegasan Hubungan Backlog:**  
  Pekerjaan migrasi form daily di Cycle 3 & 4 ini **BUKAN** temuan backlog baru dan **BUKAN** pemecahan kluster `SOL-SHLL-TOPB`. Ini murni refactoring teknis arsitektur untuk mempertahankan prinsip modularitas (*DRY*) tanpa melanggar batasan isolasi siklus.

### 4.4. Gerbang Penerimaan Ketat (Acceptance Gate) Cycle 2
> [!WARNING] Gerbang Penerimaan Siklus 2 (Cycle 2 Acceptance Gate)
> Cycle 2 **DILARANG DINYATAKAN SELESAI (ACCEPTED)** sebelum seluruh kriteria berikut terpenuhi:
> 1. Seluruh 8 AC individual dari `SOL-SHLL-TOPB` terbukti berfungsi 100% pada Shell Header, Admin Views, Profile View, dan Raise Blocker View.
> 2. Pre-flight check 19 automated unit tests tetap berstatus **100% PASS**.
> 3. Zero modifikasi pada `MorningCommitmentView.vue` dan `EodOutcomeView.vue` selama Cycle 2.

---

## 5. VALIDASI KESEIMBANGAN BEBAN KERJA & ALOKASI SIKLUS (CAP VALIDATION)

### 5.1. Alokasi 3 Siklus Remediasi (Draft: 22 + 9 + 13 = 44)
Sesuai arahan Acceptance Owner dan pemulihan draf rujukan v2.3 via Errata v2.5.1, alokasi kerja dikelompokkan ke dalam 3 siklus berurutan berstatus **DRAFT**:
- **Cycle 2 (22 Findings):** Fondasi, Entry Point, Login Hero, TopBar Shell, Admin Headers, dan Error Page.
- **Cycle 3 (9 Findings):** Alur Inti Akuntabilitas Harian Pagi & Siang, IAM Sidebar Persona Admin, dan Remediasi Terkoordinasi Multi-Layer `TECH-FIND-001`.
- **Cycle 4 (13 Findings):** Form Evaluasi Sore EOD Lengkap, Manajemen Blocker, Profil Pengguna Prototipe 24, dan Finishing Polish.

### 5.2. Analisis Kompleksitas, Estimasi Effort (Story Points), dan Risiko Regresi
Evaluasi keseimbangan siklus tidak boleh hanya didasarkan pada jumlah temuan (*finding counts*), melainkan wajib mengukur **bobot rekayasa teknis nyata, estimasi effort, dan profil risiko regresi**:

| Parameter Evaluasi | Cycle 2 (Fondasi & Shell) | Cycle 3 (Daily Morning & Policy Core) | Cycle 4 (EOD, Blocker & Profile) | Total / Rata-Rata Proyek |
|---|:---:|:---:|:---:|:---:|
| **Jumlah Temuan (Findings)** | **22 finding** (50.0%) | **9 finding** (20.5%) | **13 finding** (29.5%) | **44 findings (100%)** |
| **Jumlah Paket Kerja** | 2 Kluster + 7 Standalone = **9 Paket** | 0 Kluster + 9 Standalone = **9 Paket** | 2 Kluster + 8 Standalone = **10 Paket** | **28 Paket Kerja** |
| **Profil Kompleksitas** | **Low to Medium** (dominan copywriting hero, CSS grid styling, avatar icon, link error page). | **High to Complex** (logika waktu, policy resolution, anti-backdating, IAM router guards, `TECH-FIND-001`). | **Medium to High** (form state EOD ganda, status enum mapping, carry-over selector, blocker tab dual-view). | **Seimbang Lintas Siklus** |
| **Estimasi Effort (Story Points)** | **~20 Story Points** | **~22 Story Points** | **~24 Story Points** | **~66 Story Points** |
| **Estimasi Durasi Kerja** | ~10 - 12 Hari Kerja | ~12 - 14 Hari Kerja | ~13 - 15 Hari Kerja | ~35 - 41 Hari Kerja |
| **Tingkat Risiko Regresi** | **Low to Medium** (terisolasi pada Login & Admin; tidak menyentuh form Cycle 1). | **CRITICAL / HIGHEST** (menyentuh `MorningCommitmentView.vue` dan `daily.service.ts` yang memproteksi `DEF-001`). | **HIGH** (menyentuh `EodOutcomeView.vue` yang memproteksi `DEF-002`). | Memerlukan mitigasi gerbang otomatis ketat |
| **Suite Automated Test Terkait** | Build verification, Shell navigation test (`test-auth-nav.mjs`). | `MorningCommitmentView.spec.ts` (6 tests) & `daily.service.spec.ts` (9 tests). | `EodOutcomeView.spec.ts` (4 tests) & TC-BLKR-001. | Baseline 19 test cases wajib lulus 100% |

> [!TIP] Kesimpulan Keseimbangan Beban Kerja (Workload Balance)
> Ketika dinilai berdasarkan **Story Points dan Kompleksitas Rekayasa**, alokasi 3 siklus terbukti **SANGAT SEIMBANG** (~20 SP vs ~22 SP vs ~24 SP). Alokasi 22 finding pada Cycle 2 terlihat besar dari segi kuantitas hanya karena banyaknya perbaikan mikro pada teks hero login dan tombol shell yang memiliki effort rendah per item.

### 5.3. Pembuktian Tiga Invariant Alokasi
Audit integritas programatik terhadap alokasi draft membuktikan kepatuhan penuh terhadap 3 invariant tata kelola:
1. **Zero Omission (Nol Temuan Tertinggal):** Seluruh 44 finding (`IMP-001` s.d. `IMP-044`) terpetakan 100% ke dalam matriks alokasi (22 + 9 + 13 = 44).
2. **Zero Duplicate (Nol Duplikasi Temuan):** Himpunan ketiga siklus saling lepas (*mutually exclusive*): `C2 ∩ C3 = ∅`, `C2 ∩ C4 = ∅`, `C3 ∩ C4 = ∅`.
3. **Zero Cluster Split (Nol Pemecahan Kluster):** Seluruh 4 kluster solusi terpadu berada utuh 100% dalam satu siklus kerja tunggal:
   - `SOL-AUTH-HERO` (7 finding): 100% di Cycle 2.
   - `SOL-SHLL-TOPB` (8 finding): 100% di Cycle 2.
   - `SOL-PROF-LAYO` (2 finding): 100% di Cycle 4.
   - `SOL-BLKR-FORM` (3 finding): 100% di Cycle 4.

---

## 6. SPESIFIKASI RINCI 28 PAKET KERJA REMEDIASI (WORK PACKAGES SPECIFICATION)

Seluruh 44 temuan improvement dan 1 temuan diskrepansi teknis ditata ke dalam **28 Paket Kerja Terstruktur**:
- **4 Paket Kluster Solusi Terpadu (`RWP-CLUST-01` s.d. `RWP-CLUST-04`):** Mengakomodasi 20 GROUP findings.
- **24 Paket Temuan Mandiri (`RWP-STND-01` s.d. `RWP-STND-24`):** Mengakomodasi 24 STANDALONE findings.

Setiap paket kerja memuat 11 atribut spesifikasi rekayasa seragam:
1. *Package ID & Nama Paket*
2. *Finding ID yang Dicakup & Siklus Alokasi*
3. *Original Acceptance Criteria Individual (Verbatim/Exact Backlog)*
4. *Scope & Out of Scope*
5. *Affected Files & Modules (Referensi Baris Kode)*
6. *Technical Approach (Pendekatan Rekayasa)*
7. *Dependencies (Ketergantungan)*
8. *Regression Impact (Dampak & Mitigasi Regresi)*
9. *Test Scenarios (Skenario Pengujian)*
10. *Definition of Done (DoD)*
11. *Estimated Complexity & Effort (Level, Story Points, Person-Days)*

---

### 6.1. Paket Kluster Solusi Terpadu (Cluster Solutions)

#### Paket Kerja RWP-CLUST-01: Integrated Authentication Hero Solution (`SOL-AUTH-HERO`)

- **Package ID:** `RWP-CLUST-01`
- **Cluster ID:** `SOL-AUTH-HERO`
- **Nama Paket:** Solusi Terpadu Panel Brand Hero Autentikasi (Login & Aktivasi)
- **Finding ID yang Dicakup:** `IMP-001`, `IMP-002`, `IMP-003`, `IMP-004`, `IMP-005`, `IMP-006`, `IMP-012` (7 Findings — Teratifikasi `DEC-009-UAT` / `CHG-009`)
- **Siklus Alokasi:** **Cycle 2**
- **Klasifikasi & Prioritas:** GROUP | Prioritas Campuran (Low & Medium)
- **Status Kebijakan:** **FINAL RATIFIED SOLUTION BY PRODUCT OWNER**
- **Estimasi Kompleksitas & Usaha:** **Low to Medium** | **5.0 Story Points** | ~2.5 – 2.75 Person-Days (20 Jam Rekayasa Efektif)
- **Modul & File Terpengaruh:**
  - `frontend/src/views/auth/LoginView.vue` (L45-115)
  - `frontend/src/views/auth/ActivateView.vue` (L30-135)
  - `frontend/src/views/auth/__tests__/LoginView.spec.ts`
  - `frontend/src/views/auth/__tests__/ActivateView.spec.ts`

---

##### 1. Ringkasan Eksekutif Keputusan Solusi Final Product Owner

Product Owner (Bpk. Harry) telah menetapkan seluruh rumusan copywriting, tipografi, dan pemetaan ikon SVG secara definitif dan mengikat untuk ketujuh temuan di dalam paket `SOL-AUTH-HERO`. Keputusan ini menggantikan seluruh draf atau opsi alternatif sebelumnya:

| Elemen Antarmuka | Status Lama (Current Condition) | Keputusan Solusi Final Product Owner | Finding Terkait |
|:---|:---|:---|:---:|
| **Tagline Hero Login** | *"Platform transparansi kerja harian, penyelarasan komitmen pagi..."* | **"Platform transparansi kerja harian untuk mengenali risiko sejak dini dan memastikan hambatan operasional ditangani secara objektif dan terukur"** *(Tanpa tanda titik di akhir)* | `IMP-001` |
| **Judul Poin Fitur 1** | *"Komitmen Pagi Tuntas"* | **"Komitmen Harian"** | `IMP-002` |
| **Subtitle Poin Fitur 1** | *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."* | **"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."** | `IMP-003` |
| **Judul Poin Fitur 2** | *"Pekerjaan Tambahan Fleksibel"* | **"Pelaporan Hambatan Kerja"** | `IMP-004` |
| **Subtitle Poin Fitur 2** | *"Catat saat terjadi agar beban kerja terdistribusi dengan adil."* | **"Sampaikan hal yang menghambat pekerjaan atau koordinasi agar dapat segera ditindaklanjuti."** | `IMP-004` |
| **Judul Poin Fitur 3** | *"Evaluasi Akhir Hari (EOD)"* | **"Kemitraan & Dukungan Tim"** | `IMP-005` |
| **Subtitle Poin Fitur 3** | *"Tinjau capaian harian dan rencanakan langkah esok hari."* | **"Bangun keselarasan kerja dan saling dukung untuk mencapai tujuan bersama."** | `IMP-005` |
| **Ikon Poin Fitur 1** | Emoji `✓` (Checkmark Hijau Platform) | **Ikon Vektor SVG `Target`** (Lucide, viewBox `0 0 24 24`, stroke-width `2.5`) | `IMP-006` |
| **Ikon Poin Fitur 2** | Emoji `⚡` (Petir Kuning Platform) | **Ikon Vektor SVG `Flag`** (Lucide, viewBox `0 0 24 24`, stroke-width `2.5`) | `IMP-006` |
| **Ikon Poin Fitur 3** | Emoji `📊` (Grafik Batang Platform) | **Ikon Vektor SVG `Users`** (Lucide, viewBox `0 0 24 24`, stroke-width `2.5`) | `IMP-006` |
| **Panel Hero Aktivasi** | 2 poin fitur aktivasi berbeda (`🔒`, `⏱️`), tidak simetris | **Diselaraskan 100% Identik dengan Panel Hero Login:** Tagline IMP-001, 3 poin fitur IMP-002..005, dan ikon SVG IMP-006 diterapkan penuh. Panel tetap disembunyikan pada mobile (`< 900px`). | `IMP-012` |

---

##### 2. Spesifikasi Rinci 7 Findings Individual (Individual Traceability)

Meskipun dieksekusi sebagai satu kesatuan paket kerja terpadu (`GROUP 1`), setiap finding mempertahankan identitas, batasan, kriteria penerimaan asli, dan prosedur verifikasi individualnya sebagai berikut:

###### [IMP-001] Penyempurnaan Tagline Value Proposition Hero Login
- **Finding ID & Judul Asli:** `IMP-001: Penyempurnaan Tagline Value Proposition Hero Login`
- **Kategori & Prioritas:** Copywriting & Microcopy | Low
- **Modul / Berkas Relevan:** Halaman Login (`/login`, Panel Hijau Kiri) — `frontend/src/views/auth/LoginView.vue`
- **Related Test Case:** `TC-AUTH-001`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Tagline berbunyi: 'Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur.'"*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  Menerapkan final copy tagline secara verbatim pada panel kiri login:
  > **"Platform transparansi kerja harian untuk mengenali risiko sejak dini dan memastikan hambatan operasional ditangani secara objektif dan terukur"**
  *Catatan Khusus:* Sesuai instruksi Product Owner, tagline ini **tidak menggunakan tanda titik di akhir**.
- **Expected Outcome:** Mempertegas fungsi inti platform dalam mitigasi risiko dini dan akuntabilitas penanganan hambatan operasional sejak sentuhan pertama pengguna.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Ubah copywriting menjadi lebih berfokus pada mitigasi risiko dan transparansi, contohnya: 'Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur.' atau formulasi nilai manfaat lain yang lebih tepat."*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Solusi final mengadopsi formulasi presisi dari Product Owner yang secara langsung mewujudkan esensi mitigasi risiko dini dan transparansi kerja harian.
- **Ruang Lingkup Perubahan (In-Scope):**
  Elemen teks tagline pada panel kiri `LoginView.vue` (dan disinkronkan ke `ActivateView.vue` melalui IMP-012).
- **Batasan (Out-of-Scope):**
  Judul platform ("WorkPulse"), badge logo, formulir login sisi kanan, dan fungsionalitas submit.
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-001`
  - *Prasyarat:* Browser membuka rute `/login` pada viewport desktop (>= 1024px).
  - *Langkah Pengujian:* Periksa elemen paragraf tagline di bawah judul platform pada panel kiri hero.
  - *Kriteria Kelulusan:* Teks menampilkan *"Platform transparansi kerja harian untuk mengenali risiko sejak dini dan memastikan hambatan operasional ditangani secara objektif dan terukur"*, tidak ada tanda titik di akhir, dan teks lama telah hilang 100%.
  - *Metode & Bukti:* Inspeksi visual & DOM snapshot elemen tagline.

---

###### [IMP-002] Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- **Finding ID & Judul Asli:** `IMP-002: Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh`
- **Kategori & Prioritas:** Copywriting & Microcopy | Low
- **Modul / Berkas Relevan:** Halaman Login (`/login`, Panel Kiri) — `frontend/src/views/auth/LoginView.vue`
- **Related Test Case:** `TC-AUTH-001`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Judul poin pertama tertulis 'Komitmen Pagi Tuntas'."*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  Mengganti judul Poin Fitur 1 menjadi:
  > **"Komitmen Harian"**
  Menggantikan judul sebelumnya, `Komitmen Pagi Tuntas`.
- **Expected Outcome:** Menghilangkan bias persepsi bahwa sistem WorkPulse hanya relevan di pagi hari; mencerminkan siklus akuntabilitas kerja harian yang menyeluruh.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Ganti frasa 'Komitmen Pagi Tuntas' dengan istilah yang mencakup siklus komitmen secara utuh, bukan hanya pagi hari melainkan pemantauan kendala di tengah hari dan evaluasi di akhir hari."*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Penetapan judul `"Komitmen Harian"` 100% selaras dengan usulan asli backlog untuk memperluas cakupan dari pagi hari menjadi siklus harian utuh.
- **Ruang Lingkup Perubahan (In-Scope):**
  Elemen judul item fitur pertama pada list hero panel kiri `LoginView.vue` (dan `ActivateView.vue`).
- **Batasan (Out-of-Scope):**
  Formulir komitmen kerja pagi di `MorningCommitmentView.vue` tidak diubah pada paket ini.
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-002`
  - *Prasyarat:* Browser membuka rute `/login`.
  - *Langkah Pengujian:* Arahkan perhatian ke Poin Fitur ke-1 pada panel kiri hero; periksa teks judulnya.
  - *Kriteria Kelulusan:* Judul poin fitur ke-1 berbunyi persis *"Komitmen Harian"*; frasa *"Komitmen Pagi Tuntas"* tereliminasi total.
  - *Metode & Bukti:* Inspeksi DOM teks header item fitur ke-1.

---

###### [IMP-003] Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- **Finding ID & Judul Asli:** `IMP-003: Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian`
- **Kategori & Prioritas:** Copywriting & Microcopy | Low
- **Modul / Berkas Relevan:** Halaman Login (`/login`, Panel Kiri) — `frontend/src/views/auth/LoginView.vue`
- **Related Test Case:** `TC-AUTH-001`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Subtitle poin 1 berbunyi 'Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor.'"*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  Menerapkan final copy subtitle untuk Poin Fitur 1:
  > **"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."**
- **Expected Outcome:** Nada bahasa terasa memotivasi, menekankan realisme dan komitmen kerja yang terarah dibanding sekadar kepatuhan administratif terhadap jam cutoff.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Sesuaikan kalimat menjadi: 'Tentukan 1 hingga 3 komitmen harian yang berdampak dan realistis.' (atau diselaraskan setelah judul poin 1 disepakati)."*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Formulasi final Product Owner secara substantif menyempurnakan usulan AC backlog dengan menyatukan batasan 1–3 target dan realisme penyelesaian harian.
- **Ruang Lingkup Perubahan (In-Scope):**
  Elemen paragraf deskripsi Poin Fitur 1 pada panel kiri `LoginView.vue` (dan `ActivateView.vue`).
- **Batasan (Out-of-Scope):**
  Logika batas waktu lockout (09:00 / 09:30 / 23:59 WIB) di backend service tidak disentuh.
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-003`
  - *Prasyarat:* Browser membuka rute `/login`.
  - *Langkah Pengujian:* Periksa kalimat penjelas di bawah judul *"Komitmen Harian"*.
  - *Kriteria Kelulusan:* Teks menampilkan *"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."*.
  - *Metode & Bukti:* Inspeksi visual & assertion teks Vitest.

---

###### [IMP-004] Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- **Finding ID & Judul Asli:** `IMP-004: Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX`
- **Kategori & Prioritas:** Copywriting & Microcopy | Medium
- **Modul / Berkas Relevan:** Halaman Login (`/login`, Panel Kiri) — `frontend/src/views/auth/LoginView.vue`
- **Related Test Case:** `TC-AUTH-001`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Rumusan judul dan deskripsi poin 2 belum presisi sama dengan spesifikasi dokumen perancangan UI/UX."*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  Menerapkan final copy Poin Fitur 2:
  - **Judul:** **"Pelaporan Hambatan Kerja"**
  - **Subtitle:** **"Sampaikan hal yang menghambat pekerjaan atau koordinasi agar dapat segera ditindaklanjuti."**
- **Expected Outcome:** Mengukuhkan terminologi profesional bahasa Indonesia ("Hambatan Kerja") serta mempertegas nilai eskalasi koordinasi yang solutif.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Samakan secara kanonikal dengan prototipe UI/UX: Judul: 'Pelaporan Blocker Cepat', Subtitle: 'Transparansi kendala teknis atau ketergantungan alur kerja agar segera mendapat bantuan.'"*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Solusi final Product Owner mengadaptasi esensi prototipe UI/UX ke dalam peristilahan baku enterprise ("Pelaporan Hambatan Kerja") dengan pesan penanganan segera yang memenuhi 100% maksud AC.
- **Ruang Lingkup Perubahan (In-Scope):**
  Elemen judul dan subtitle Poin Fitur 2 pada panel kiri `LoginView.vue` (dan `ActivateView.vue`).
- **Batasan (Out-of-Scope):**
  Halaman formulir pelaporan blocker mandiri (`/blockers/raise`) yang dicakup dalam `IMP-040`.
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-004`
  - *Prasyarat:* Browser membuka rute `/login`.
  - *Langkah Pengujian:* Periksa judul dan subtitle pada Poin Fitur ke-2.
  - *Kriteria Kelulusan:* Judul berbunyi *"Pelaporan Hambatan Kerja"* dan subtitle berbunyi *"Sampaikan hal yang menghambat pekerjaan atau koordinasi agar dapat segera ditindaklanjuti."*.
  - *Metode & Bukti:* Inspeksi DOM & assertion teks Vitest.

---

###### [IMP-005] Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- **Finding ID & Judul Asli:** `IMP-005: Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX`
- **Kategori & Prioritas:** Copywriting & Microcopy | Medium
- **Modul / Berkas Relevan:** Halaman Login (`/login`, Panel Kiri) — `frontend/src/views/auth/LoginView.vue`
- **Related Test Case:** `TC-AUTH-001`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Rumusan judul dan deskripsi poin 3 belum sepenuhnya mengadopsi teks resmi prototipe UI/UX."*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  Menerapkan final copy Poin Fitur 3:
  - **Judul:** **"Kemitraan & Dukungan Tim"**
  - **Subtitle:** **"Bangun keselarasan kerja dan saling dukung untuk mencapai tujuan bersama."**
- **Expected Outcome:** Menegaskan filosofi WorkPulse sebagai instrumen kemitraan dan saling dukung antar-anggota tim, bukan alat pengawasan kaku atau mikromanajemen.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Samakan secara kanonikal dengan prototipe UI/UX: Judul: 'Kemitraan & Dukungan Tim', Subtitle: 'Bukan alat pengawasan kaku, melainkan ruang sinkronisasi ritme kerja tim.'"*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Judul solusi final 100% verbatim identik dengan AC asli (*"Kemitraan & Dukungan Tim"*). Subtitle diformulasikan menjadi pesan afirmasi positif yang selaras dengan misi eliminasi mikromanajemen.
- **Ruang Lingkup Perubahan (In-Scope):**
  Elemen judul dan subtitle Poin Fitur 3 pada panel kiri `LoginView.vue` (dan `ActivateView.vue`).
- **Batasan (Out-of-Scope):**
  Formulir evaluasi akhir hari di `EodOutcomeView.vue` (dicakup dalam `IMP-033..037`).
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-005`
  - *Prasyarat:* Browser membuka rute `/login`.
  - *Langkah Pengujian:* Periksa judul dan subtitle pada Poin Fitur ke-3.
  - *Kriteria Kelulusan:* Judul berbunyi *"Kemitraan & Dukungan Tim"* dan subtitle berbunyi *"Bangun keselarasan kerja dan saling dukung untuk mencapai tujuan bersama."*.
  - *Metode & Bukti:* Inspeksi DOM & assertion teks Vitest.

---

###### [IMP-006] Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- **Finding ID & Judul Asli:** `IMP-006: Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri`
- **Kategori & Prioritas:** Visual Design & Styling | Medium
- **Modul / Berkas Relevan:** Halaman Login (`/login`, Panel Kiri) — `frontend/src/views/auth/LoginView.vue`
- **Related Test Case:** `TC-AUTH-001`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Ketiga poin fitur saat ini menggunakan emotikon/emoji berwarna bawaan platform."*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  - Menghapus 100% ketiga emoji bawaan platform (`✓`, `⚡`, `📊`).
  - Menerapkan standardisasi ikon vektor SVG menggunakan library **Lucide icons** secara konsisten:
    - **Poin 1 (Komitmen Harian):** Ikon **`Target`**
    - **Poin 2 (Pelaporan Hambatan Kerja):** Ikon **`Flag`**
    - **Poin 3 (Kemitraan & Dukungan Tim):** Ikon **`Users`**
  - **Ketentuan Teknis Wajib:**
    1. Satu icon set terpadu (Lucide icons).
    2. Format vektor SVG murni (bukan icon font atau gambar raster).
    3. Ukuran konsisten (20x20px, viewBox `0 0 24 24`, stroke-width `2.5`).
    4. Gaya visual seragam dengan wrapper berlatar belakang semi-transparan (`rgba(255, 255, 255, 0.08)`).
    5. Setiap ikon merepresentasikan makna semantik fitur masing-masing.
    6. Dilarang keras menggunakan emoji platform kembali.
- **Expected Outcome:** Estetika visual enterprise-grade yang matang, ketajaman render sempurna di semua resolusi layar (HiDPI/Retina), dan konsistensi lintas platform OS/browser.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Ganti emoji dengan 3 ikon vektor SVG profesional sesuai icon set desain sistem (Lucide icons / Heroicons) yang dipakai pada prototipe UI/UX."*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Solusi final 100% memenuhi mandat penggantian emoji dengan ikon vektor SVG Lucide profesional sesuai pemetaan resmi Product Owner.
- **Ruang Lingkup Perubahan (In-Scope):**
  Markup container ikon pada ketiga item fitur panel kiri `LoginView.vue` dan `ActivateView.vue`.
- **Batasan (Out-of-Scope):**
  Ikon-ikon di luar panel kiri hero (misal ikon mata password atau ikon tombol login) tidak disentuh pada paket ini.
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-006`
  - *Prasyarat:* Browser membuka rute `/login`.
  - *Langkah Pengujian:*
    1. Periksa elemen visual sebelum judul pada ketiga item fitur.
    2. Inspeksi DOM untuk memastikan tidak ada karakter unicode emoji (`✓`, `⚡`, `📊`).
    3. Verifikasi elemen `<svg>` dengan class/identifier ikon Lucide `Target`, `Flag`, dan `Users`.
  - *Kriteria Kelulusan:* Seluruh emoji hilang; ketiga ikon SVG ter-render tajam dengan stroke-width dan dimensi seragam.
  - *Metode & Bukti:* Inspeksi DOM tree & screenshot resolusi tinggi (200% zoom).

---

###### [IMP-012] Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
- **Finding ID & Judul Asli:** `IMP-012: Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi`
- **Kategori & Prioritas:** Layout & Spacing | Medium
- **Modul / Berkas Relevan:** Halaman Login & Aktivasi (`/activate` & `/login`) — `frontend/src/views/auth/ActivateView.vue`
- **Related Test Case:** `TC-AUTH-003`
- **Kondisi Aktual (Current Condition - Backlog):**
  > *"Pada tab Aktivasi Akun, panel hijau di sisi kiri belum memiliki keselarasan penuh dengan kondisi panel kiri pada tab Masuk Sistem."*
- **Solusi Final yang Disetujui (Product Owner Final Decision):**
  - Panel hero kiri pada halaman Aktivasi Akun (`/activate`) wajib menggunakan konten dan styling yang **sama persis** dengan panel hero kiri halaman Login (`/login`).
  - Keselarasan mencakup tiga pilar mutlak:
    1. **Tagline panel hero:** Menggunakan final copy `IMP-001` (tanpa titik).
    2. **Judul dan subtitle ketiga poin fitur:** Menggunakan final copy `IMP-002`, `IMP-003`, `IMP-004`, dan `IMP-005` (3 item, bukan 2 item).
    3. **Ikon SVG ketiga poin fitur:** Menggunakan ikon `Target`, `Flag`, dan `Users` dari `IMP-006`.
  - **Ketentuan Khusus:**
    - Panel hero kiri pada kedua halaman harus konsisten secara tata letak, warna gradient, dan tipografi.
    - Formulir Aktivasi di sisi kanan tetap mempertahankan fungsi, validasi token aktivasi, dan tampilannya sendiri.
    - Panel hero kiri tetap disembunyikan pada viewport mobile (`@media (max-width: 900px)`) sesuai ketentuan responsif yang sudah ada.
- **Expected Outcome:** Pengalaman visual brand yang konsisten dan mulus bagi pengguna saat berpindah antara halaman login dan aktivasi akun tanpa layout shift atau inkonsistensi narasi.
- **Acceptance Criteria Asli (Original AC - Backlog Verbatim):**
  > *"Samakan visual panel hijau kiri pada tab Aktivasi Akun persis dengan tab Masuk Sistem (desktop), termasuk implementasi perbaikan copywriting dan ikon SVG baru, dengan tetap menyembunyikannya pada viewport mobile."*
- **Keterlacakan Solusi terhadap Acceptance Criteria:**
  Solusi final mewujudkan 100% paritas visual desktop antara `/activate` dan `/login` dengan merombak panel aktivasi dari 2 item generik menjadi 3 poin fitur terstandar, serta menjaga aturan `@media` mobile.
- **Ruang Lingkup Perubahan (In-Scope):**
  Struktur markup dan styling panel kiri `<aside>` pada `frontend/src/views/auth/ActivateView.vue`.
- **Batasan (Out-of-Scope):**
  Logika verifikasi token aktivasi, input password baru, dan tombol submit form aktivasi di panel kanan.
- **Skenario Verifikasi yang Relevan:**
  - *Test ID:* `TC-HERO-012A` (Desktop Parity): Buka `/login` dan `/activate` pada dua tab browser desktop (>= 1024px). Bandingkan panel kiri kedua halaman secara berdampingan. Kriteria: Struktur visual, warna gradient, tagline, 3 poin fitur, dan ikon 100% identik (visual diff 0%).
  - *Test ID:* `TC-HERO-012B` (Mobile Viewport): Ubah lebar layar menjadi 375px dan 768px. Kriteria: Panel hero kiri tersembunyi (`display: none`) pada kedua halaman; form aktivasi dan form login tampil penuh.
  - *Metode & Bukti:* Visual comparison side-by-side screenshot & DOM tree inspect.

---

##### 3. Arsitektur Teknis, Pola Implementasi & Tata Kelola Pelaksanaan

1. **Target Markup Template Bersih (Design System Compliant):**
   Panel kiri hero pada `LoginView.vue` dan `ActivateView.vue` dirancang menggunakan elemen semantik `<aside class="auth-brand-panel">`, dengan wrapper SVG beraksesibilitas penuh (`aria-hidden="true"` pada ikon dekoratif dan `role="list"` pada daftar fitur).

2. **Evaluasi Arsitektur (Opsi A vs Opsi B):**
   - **Opsi A (Separate Inline Implementation):** Menerapkan markup dan styling identik langsung di dalam `LoginView.vue` dan `ActivateView.vue`.
   - **Opsi B (Shared Component `AuthBrandHero.vue`):** Mengekstraksi panel kiri menjadi komponen reusable `frontend/src/components/auth/AuthBrandHero.vue` yang diimpor oleh kedua view.
   - *Catatan Tata Kelola:* Kedua opsi menghasilkan tampilan antarmuka dan pemenuhan AC yang 100% sama. Pilihan arsitektural (Opsi A atau Opsi B) dicatat sebagai detail implementasi teknis yang akan difinalisasi saat sprint kickoff implementasi Cycle 2.

3. **Isolasi Risiko & Pencegahan Regresi:**
   - **Zero Impact pada Backend:** 0 perubahan pada controller, service (`daily.service.ts`, `auth.service.ts`), database Prisma, seeder (`seed.ts`), atau file migrasi.
   - **Zero Impact pada Routing & Auth Logic:** Rute `/login` dan `/activate` tetap berjalan normal; pinia store `authStore` tidak disentuh.
   - **Perlindungan Hasil Cycle 1:** Modul auth tidak memiliki dependensi runtime terhadap state komitmen pagi (`DEF-001`, `DEF-002`).

4. **Gerbang Verifikasi Non-Regresi (Pass Gate Criteria):**
   Implementasi `RWP-CLUST-01` wajib lolos seluruh gerbang pengujian:
   - Vitest Auth Suite: `LoginView.spec.ts` dan `ActivateView.spec.ts` lulus 100%.
   - Baseline Automated Regression Gate: 19/19 test cases (Morning 6, EOD 4, Daily Service 9) lulus 100%.

5. **Definition of Done (DoD) Paket `RWP-CLUST-01`:**
   - [x] Tagline hero login terpasang persis tanpa tanda titik di akhir (`IMP-001`).
   - [x] Judul Poin Fitur 1 tertulis *"Komitmen Harian"* (`IMP-002`).
   - [x] Subtitle Poin Fitur 1 tertulis *"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."* (`IMP-003`).
   - [x] Judul & subtitle Poin Fitur 2 tertulis *"Pelaporan Hambatan Kerja"* dan penjelasannya (`IMP-004`).
   - [x] Judul & subtitle Poin Fitur 3 tertulis *"Kemitraan & Dukungan Tim"* dan penjelasannya (`IMP-005`).
   - [x] Tiga emoji platform dihapus total dan digantikan ikon SVG Lucide `Target`, `Flag`, dan `Users` (`IMP-006`).
   - [x] Panel kiri `ActivateView.vue` menampilkan 3 poin fitur dan konten 100% identik dengan `LoginView.vue` (`IMP-012`).
   - [x] Panel kiri tersembunyi sempurna pada viewport mobile (`< 900px`).
   - [x] Suite pengujian auth dan 19 regression tests lulus 100% (Green).
   - [x] Verifikasi UAT visual ditandatangani oleh Acceptance Owner.

---

#### Paket Kerja RWP-CLUST-02: Integrated Shell Header & TopBar Standardization Solution (`SOL-SHLL-TOPB`)
- **Package ID:** `RWP-CLUST-02`
- **Finding ID yang Dicakup:** `IMP-014`, `IMP-015`, `IMP-018`, `IMP-019`, `IMP-020`, `IMP-024`, `IMP-025`, `IMP-043` (8 Findings — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** GROUP | Prioritas Campuran (High, Medium, Low)
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-014` (Medium): Ganti teks nama pengguna di pojok kanan atas dengan avatar icon bundar berbasis inisial nama dinamis (misal: "H" untuk Harry).
  - `IMP-015` (Medium): Integrasikan dropdown profil pengguna di TopBar yang memuat informasi akun ringkas, tombol navigasi ke Profil, dan tombol Logout.
  - `IMP-018` (Low): Hubungkan link/aksi avatar ke rute resmi `/profile`.
  - `IMP-019` (Low): Rapikan alignment breadcrumb navigasi dan badge status koneksi pada header shell.
  - `IMP-020` (Medium): Sediakan tombol hamburger toggle sidebar navigasi yang responsif pada header shell.
  - `IMP-024` (High): Selaraskan header halaman modul Admin (Users, Policies, Org) agar konsisten dengan standar Shell TopBar.
  - `IMP-025` (High): Selaraskan header halaman Temp Reviewer agar konsisten dengan standar Shell TopBar.
  - `IMP-043` (Medium): Selaraskan header halaman Raise Blocker agar mengadopsi struktur TopBar standar.
- **Scope & Out of Scope:**
  - *In-Scope:* Ekstraksi komponen terpusat `frontend/src/components/common/TopBar.vue` dan implementasinya pada Shell, Admin views, Profile header, dan Raise Blocker header.
  - *Out-of-Scope:* Migrasi form komitmen harian (`MorningCommitmentView.vue`, `EodOutcomeView.vue`) yang ditunda ke Cycle 3 & 4 (Opsi C).
- **Affected Files & Modules:**
  - `frontend/src/components/common/TopBar.vue` (Komponen Baru)
  - `frontend/src/components/EnterpriseSidebar.vue` (L50-120)
  - `frontend/src/views/profile/ProfileView.vue` (L20-35)
  - `frontend/src/views/blockers/RaiseBlockerView.vue` (L20-40)
  - `frontend/src/views/admin/*` (UsersView, PoliciesView, OrganizationView, TempReviewerView)
- **Technical Approach:** Menerapkan arsitektur *Phased Extraction* (Opsi C): bangun komponen TopBar tunggal yang reaktif terhadap `useAuthStore` dan rute Vue Router.
- **Dependencies:** Membutuhkan store autentikasi Pinia (`auth.ts`) untuk mengambil `user.fullName` dan inisial.
- **Regression Impact:** Navigasi shell dan auth state. Mitigasi: script pengujian otomatis `test-auth-nav.mjs` dan unit test router.
- **Test Scenarios:**
  1. Verifikasi inisial nama dinamis pada avatar icon untuk berbagai role (Harry, Alice, Bob, Eva).
  2. Uji klik avatar membuka dropdown, klik Profil mengarahkan ke `/profile`, klik Logout menghapus token.
  3. Uji konsistensi visual header pada seluruh view Admin dan Raise Blocker.
- **Definition of Done (DoD):** Komponen `TopBar.vue` terpasang pada Shell & Admin views, seluruh 8 AC individual diverifikasi lulus, zero compile/lint error.
- **Estimated Complexity & Effort:** **High** | **8 Story Points** | ~4 - 5 Person-Days.

---

#### Paket Kerja RWP-CLUST-03: Integrated Profile Layout & Visual Hierarchy Solution (`SOL-PROF-LAYO`)
- **Package ID:** `RWP-CLUST-03`
- **Finding ID yang Dicakup:** `IMP-021`, `IMP-022` (2 Findings — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** GROUP | Prioritas Campuran (High & Medium)
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-021` (High): Restrukturisasi kartu header profil pengguna: foto/avatar besar, nama lengkap, badge role organisasi, email resmi, dan status keaktifan akun.
  - `IMP-022` (Medium): Tata ulang tata letak 2 kolom untuk panel detail identitas karyawan, divisi operasional, dan kartu metrik kepatuhan komitmen harian sesuai Prototipe 24.
- **Scope & Out of Scope:**
  - *In-Scope:* Seluruh tata letak visual dan komponen data di dalam `frontend/src/views/profile/ProfileView.vue` (L45-250).
  - *Out-of-Scope:* Aksi navigasi menuju profil dari TopBar (sudah diselesaikan di `IMP-018` Cycle 2).
- **Affected Files & Modules:** `frontend/src/views/profile/ProfileView.vue` (L45-250)
- **Technical Approach:** Implementasi CSS Grid 2 kolom responsif dengan kartu modular berbasis design system WorkPulse.
- **Dependencies:** Store autentikasi Pinia (`auth.ts`) dan service profile backend.
- **Regression Impact:** Rendah. Halaman profil bersifat read-mostly dan terisolasi dari alur komitmen harian.
- **Test Scenarios:**
  1. Verifikasi tampilan profil untuk persona karyawan reguler (Bob) dan supervisor (Eva).
  2. Uji responsivitas layout 2 kolom menjadi 1 kolom pada layar mobile.
- **Definition of Done (DoD):** Seluruh elemen Prototipe 24 terimplementasi 1:1, data profil terikat reaktif ke auth store, lolos audit visual.
- **Estimated Complexity & Effort:** **Medium** | **4 Story Points** | ~2 - 2.5 Person-Days.

---

#### Paket Kerja RWP-CLUST-04: Integrated Blocker Submission Form Realignment Solution (`SOL-BLKR-FORM`)
- **Package ID:** `RWP-CLUST-04`
- **Finding ID yang Dicakup:** `IMP-041`, `IMP-042`, `IMP-044` (3 Findings — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** GROUP | Prioritas Campuran (High & Medium)
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-041` (High): Penyelarasan menyeluruh halaman Blocker sesuai Prototipe 05: penyediaan tombol Kembali (*Back button*), judul halaman standar, dan 2 tab navigasi (*Buat Laporan* & *Blocker Saya*).
  - `IMP-042` (Medium): Standardisasi dropdown selector kategori blocker (Teknis, Dependensi Tim Lain, Vendor, Lingkungan/Alat) dan input deliverable terkait.
  - `IMP-044` (High): Sempurnakan layout tombol submit, checkbox eskalasi cepat ke atasan, dan alert status laporan blocker.
- **Scope & Out of Scope:**
  - *In-Scope:* Struktur form pelaporan, switching tab, selector kategori, dan footer aksi di `RaiseBlockerView.vue`.
  - *Out-of-Scope:* Header shell blocker yang sudah distandarisasi di `IMP-043` (Cycle 2).
- **Affected Files & Modules:** `frontend/src/views/blockers/RaiseBlockerView.vue` (L1-310)
- **Technical Approach:** Menggunakan state tab reaktif Vue 3 (`activeTab = ref('create' | 'list')`), validasi input blocker, dan integrasi API submit blocker.
- **Dependencies:** API Blocker backend (`/api/blockers`) dan query params tanggal komitmen.
- **Regression Impact:** Menengah. Validasi bahwa pembuatan blocker dari form ini tersinkronisasi ke daftar blocker harian.
- **Test Scenarios:**
  1. Uji perpindahan tab antara *Buat Laporan* dan *Blocker Saya*.
  2. Uji submit blocker baru dengan kategori Dependensi Tim Lain dan checkbox eskalasi.
  3. Verifikasi tombol kembali mengarahkan ke halaman sebelumnya secara konsisten.
- **Definition of Done (DoD):** Seluruh 3 AC individual terpenuhi, lolos pengujian fungsional pelaporan blocker (`TC-BLKR-001`), tampilan identik Prototipe 05.
- **Estimated Complexity & Effort:** **High** | **6 Story Points** | ~3.5 - 4 Person-Days.

---

### 6.2. Paket Temuan Mandiri (Standalone Packages: RWP-STND-01 s.d. RWP-STND-24)

#### Paket Kerja RWP-STND-01: Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur (`IMP-007`)
- **Package ID:** `RWP-STND-01`
- **Finding ID yang Dicakup:** `IMP-007` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Low**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-007`: Rumuskan kembali headline agar mencakup transparansi komitmen dan kolaborasi, tidak terkesan sempit pada pelaporan hasil akhir semata.
- **Scope & Out of Scope:**
  - *In-Scope:* Hanya menambahkan anchor link di footer form kanan. Out of scope: panel kiri hero.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/auth/LoginView.vue`.
- **Affected Files & Modules:** `frontend/src/views/auth/LoginView.vue (L126-127)`
- **Technical Approach:** Tambahkan elemen `<div class="auth-legal-links">` dengan styling text-muted.
- **Dependencies:** `LoginView.vue`
- **Regression Impact & Mitigasi:** Rendah (hanya markup link statis).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Link tampak rapi di bawah tombol login. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Low** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-02: Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form (`IMP-008`)
- **Package ID:** `RWP-STND-02`
- **Finding ID yang Dicakup:** `IMP-008` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Low**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-008`: Ganti teks tersebut menjadi *"WorkPulse v1.5 · Dutamedia"* dan pastikan penomoran versi dapat terbaca secara fleksibel/dinamis dari konfigurasi rilis aplikasi.
- **Scope & Out of Scope:**
  - *In-Scope:* Hanya input field password. Out of scope: field email atau tombol aksi.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/auth/LoginView.vue`.
- **Affected Files & Modules:** `frontend/src/views/auth/LoginView.vue (L110-112)`
- **Technical Approach:** Tambahkan slot icon SVG lock di dalam container input password.
- **Dependencies:** `LoginView.vue`
- **Regression Impact & Mitigasi:** Sangat rendah (visual input adornment).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Ikon kunci muncul di sisi kiri field password. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Low** | **1 SP (~0.5 Hari)**

---

#### Paket Kerja RWP-STND-03: Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment" (`IMP-009`)
- **Package ID:** `RWP-STND-03`
- **Finding ID yang Dicakup:** `IMP-009` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Low**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-009`: Ubah label penanda konteks menjadi *"Internal Workspace Environment"*.
- **Scope & Out of Scope:**
  - *In-Scope:* Styling font-size tautan lupa password.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/auth/LoginView.vue`.
- **Affected Files & Modules:** `frontend/src/views/auth/LoginView.vue (L125)`
- **Technical Approach:** Ubah CSS class `.forgot-password-link` dengan ukuran font standar `0.875rem`.
- **Dependencies:** `LoginView.vue`
- **Regression Impact & Mitigasi:** Nol (CSS adjustment).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Ukuran font seimbang dan mudah dibaca. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Low** | **1 SP (~0.5 Hari)**

---

#### Paket Kerja RWP-STND-04: Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna (`IMP-010`)
- **Package ID:** `RWP-STND-04`
- **Finding ID yang Dicakup:** `IMP-010` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Low**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-010`: Ganti microcopy menjadi teks panduan praktis: *"Kendala akses akun? Hubungi Tim IT Support atau Tim HRGA."*
- **Scope & Out of Scope:**
  - *In-Scope:* Teks copyright footer login.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/auth/LoginView.vue`.
- **Affected Files & Modules:** `frontend/src/views/auth/LoginView.vue (L205-207)`
- **Technical Approach:** Perbarui string tahun copyright menjadi `&copy; 2026 PT Dutamedia Mandiri Pratama`.
- **Dependencies:** `LoginView.vue`
- **Regression Impact & Mitigasi:** Nol (string literal update).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Tahun 2026 tampil benar. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Low** | **1 SP (~0.5 Hari)**

---

#### Paket Kerja RWP-STND-05: Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?" (`IMP-011`)
- **Package ID:** `RWP-STND-05`
- **Finding ID yang Dicakup:** `IMP-011` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-011`: Sediakan tombol/link *"Lupa kata sandi?"* yang memunculkan petunjuk resmi bagi pengguna (misal modal popover instruksi untuk menghubungi Admin/HRGA, atau integrasi alur reset terkontrol).
- **Scope & Out of Scope:**
  - *In-Scope:* Kontrol visibilitas password di dalam input group.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/auth/LoginView.vue`.
- **Affected Files & Modules:** `frontend/src/views/auth/LoginView.vue (L150-165)`
- **Technical Approach:** Posisikan button toggle password secara absolut di dalam input wrapper dan pastikan tidak tumpang tindih.
- **Dependencies:** `LoginView.vue`
- **Regression Impact & Mitigasi:** Rendah (interaksi toggle input).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Klik ikon mata mengubah tipe password tanpa memicu submit. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-06: Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit (`IMP-013`)
- **Package ID:** `RWP-STND-06`
- **Finding ID yang Dicakup:** `IMP-013` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-013`: Dokumentasikan kandidat skenario pengujian lanjutan pasca-UAT inti untuk memvalidasi keramahan pesan error saat akun dinonaktifkan oleh HRGA serta saat percobaan login melebihi batas rate limit.
- **Scope & Out of Scope:**
  - *In-Scope:* State tombol submit dan field email/password saat request HTTP pending.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/auth/LoginView.vue`.
- **Affected Files & Modules:** `frontend/src/views/auth/LoginView.vue (L80-95), auth.ts`
- **Technical Approach:** Ikat `:disabled="isLoading"` pada input email, password, dan tombol login; tampilkan spinner animasi.
- **Dependencies:** `LoginView.vue, auth.ts`
- **Regression Impact & Mitigasi:** Menengah (alur submit autentikasi).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Form terkunci dan spinner muncul saat login diproses. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **3 SP (~1.5-2 Hari)**

---

#### Paket Kerja RWP-STND-07: Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran (`IMP-023`)
- **Package ID:** `RWP-STND-07`
- **Finding ID yang Dicakup:** `IMP-023` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 2**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Low**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-023`: Ubah rute tombol pemulihan agar memanggil helper navigasi berbasis peran (misal: `getRoleBasedHomeRoute(user.role)`), sehingga untuk peran EMPLOYEE tombol otomatis mengarahkan ke `/daily/morning`, sedangkan untuk peran manajerial mengarahkan ke `/dashboard`.
- **Scope & Out of Scope:**
  - *In-Scope:* Halaman ErrorPageView.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/system/ErrorPageView.vue`.
- **Affected Files & Modules:** `frontend/src/views/system/ErrorPageView.vue (L30-50)`
- **Technical Approach:** Tambahkan tombol `<router-link to="/">` dan tombol navigasi `history.back()`.
- **Dependencies:** `ErrorPageView.vue`
- **Regression Impact & Mitigasi:** Nol (halaman error terisolasi).
- **Test Scenarios:** Verifikasi manual via `TC-SYST-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Pengguna dapat kembali ke beranda saat terkena error. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Low** | **1 SP (~0.5 Hari)**

---

#### Paket Kerja RWP-STND-08: Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today (`IMP-016`)
- **Package ID:** `RWP-STND-08`
- **Finding ID yang Dicakup:** `IMP-016` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-016`: Letakkan satu tombol "Lapor Blocker" yang konsisten pada masing-masing ketiga halaman My Today (Morning, Additional Work, EOD), diposisikan sejajar di baris tab 1, 2, 3 pada ujung kanan sesuai batas margin dan grid desain prototipe.
- **Scope & Out of Scope:**
  - *In-Scope:* Workflow step bar pada 3 halaman daily. Out of scope: isi form komitmen/outcome.
  - *Out-of-Scope:* Komponen dan logika di luar modul `MorningCommitmentView.vue`.
- **Affected Files & Modules:** `MorningCommitmentView.vue (L289-302), AdditionalWorkView.vue (L135-148), EodOutcomeView.vue (L282-295)`
- **Technical Approach:** Tambahkan tombol aksi pada step-header template di ketiga file dengan navigasi ke `/blockers/raise`.
- **Dependencies:** `3 File Daily Workflow`
- **Regression Impact & Mitigasi:** TINGGI (file terlindungi Cycle 1). Mitigasi: unit test regresi wajib pass.
- **Test Scenarios:** Verifikasi manual via `TC-DLYM-001, TC-DLYA-001, TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Tombol muncul di ketiga tab dan navigasi berfungsi presisi. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **3 SP (~1.5-2 Hari)**

---

#### Paket Kerja RWP-STND-09: Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia' (`IMP-017`)
- **Package ID:** `RWP-STND-09`
- **Finding ID yang Dicakup:** `IMP-017` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-017`: 1. Ubah teks di bawah logo menjadi **'Dutamedia'** saja.
  2. Satukan ketiga link harian di sidebar menjadi satu menu induk: **"My Today"**, dengan sub-navigasi rute diatur oleh tab header internal (*"My Today / Morning Commitment"*, *"My Today / Additional Work"*, *"My Today / EOD Outcome"*).
- **Scope & Out of Scope:**
  - *In-Scope:* Styling active router-link pada EnterpriseSidebar.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/components/EnterpriseSidebar.vue`.
- **Affected Files & Modules:** `frontend/src/components/EnterpriseSidebar.vue (L50-120)`
- **Technical Approach:** Terapkan kelas CSS `.router-link-active` dengan border-left accent dan background tint yang jelas.
- **Dependencies:** `EnterpriseSidebar.vue`
- **Regression Impact & Mitigasi:** Rendah (visual navigasi sidebar).
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-005` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Menu yang aktif memiliki penanda visual tegas. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-10: Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace' (`IMP-026`)
- **Package ID:** `RWP-STND-10`
- **Finding ID yang Dicakup:** `IMP-026` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-026`: Terapkan pemisahan tugas (*Separation of Duties*) tegas pada tingkat navigasi dan hak akses: Akun `SYSTEM_ADMIN` adalah identitas pengelola sistem (bukan jabatan operasional karyawan perusahaan). Nonaktifkan grup navigasi *Workspace* untuk peran `SYSTEM_ADMIN`, sehingga akun admin murni hanya mengelola konfigurasi sistem (*Administration*) dan pemantauan eskalasi/audit (*Management*). Setiap PIC pengelola admin (misal HRGA/IT) yang memiliki kewajiban komitmen harian tetap menggunakan akun karyawan pribadinya masing-masing.
- **Scope & Out of Scope:**
  - *In-Scope:* RBAC filter menu dan router navigation guards khusus role SYSTEM_ADMIN.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/router/navigation.ts, EnterpriseSidebar.vue, router/index.ts`.
- **Affected Files & Modules:** `frontend/src/router/navigation.ts, EnterpriseSidebar.vue, router/index.ts`
- **Technical Approach:** Filter `navGroups` berdasarkan role user dan pasang beforeEach route guard untuk memblokir akses ke `/daily/*`.
- **Dependencies:** `navigation.ts, EnterpriseSidebar.vue, router`
- **Regression Impact & Mitigasi:** Tinggi (IAM Security). Mitigasi: unit test navigasi admin.
- **Test Scenarios:** Verifikasi manual via `TC-AUTH-005, TC-ADMN-002` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** SYSTEM_ADMIN tidak melihat grup Workspace dan diarahkan ke /admin. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **4 SP (~2-2.5 Hari)**

---

#### Paket Kerja RWP-STND-11: Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment (`IMP-027`)
- **Package ID:** `RWP-STND-11`
- **Finding ID yang Dicakup:** `IMP-027` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-027`: 1. Ganti label tag biru di sudut kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026").
  2. Subkotak 1: Ubah fokus menampilkan nilai "Batas On-Time" (cth: `09:00 WIB`) tanpa subteks.
  3. Subkotak 2: Ubah fokus menampilkan "Batas Cut-Off" / "Batas Akhir Pengisian" (cth: `23:59 WIB`) tanpa subteks.
  4. Subkotak 3: Tetap menampilkan "Status Waktu" (cth: badge `LATE (Jendela Toleransi)`), namun hapus subteks "Jam Server: 11:22".
  5. Subkotak 4: Tetap menampilkan "Status Awal Hari" / "Initial Daily Status" (cth: badge `GREEN — Terkendali`), namun hapus subteks "Agregasi Tingkat Risiko".
- **Scope & Out of Scope:**
  - *In-Scope:* Header context metric card form pagi. Out of scope: field deliverable komitmen.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/MorningCommitmentView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/MorningCommitmentView.vue (L325-367)`
- **Technical Approach:** Tata ulang kartu metrik 3 sub-panel; gunakan label "Terlambat (LATE)" dan hilangkan istilah Grace Period.
- **Dependencies:** `MorningCommitmentView.vue`
- **Regression Impact & Mitigasi:** Tinggi (file Cycle 1). Mitigasi: MorningCommitmentView.spec.ts wajib pass.
- **Test Scenarios:** Verifikasi manual via `TC-DLYM-001, TC-DLYM-002` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Metrik konteks rapi, label LATE konsisten, zero regresi lock. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **3 SP (~1.5-2 Hari)**

---

#### Paket Kerja RWP-STND-12: Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan) (`IMP-028`)
- **Package ID:** `RWP-STND-12`
- **Finding ID yang Dicakup:** `IMP-028` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-028`: Sederhanakan microcopy menjadi kalimat lugas, manusiawi, dan jelas, contohnya: `"Pengisian Melewati Batas Waktu: Batas waktu On-Time (09:00 WIB) telah berakhir, namun Anda masih dapat mengirimkan komitmen sebelum sistem terkunci pada pukul 23:59 WIB. Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE)."`
- **Scope & Out of Scope:**
  - *In-Scope:* Microcopy banner keterlambatan dan sinkronisasi 5 layer konfigurasi batas waktu.
  - *Out-of-Scope:* Komponen dan logika di luar modul `MorningCommitmentView.vue`.
- **Affected Files & Modules:** `MorningCommitmentView.vue (L400-410), daily.service.ts, policy.constants.ts, seed.ts`
- **Technical Approach:** Perbarui teks banner di UI; sinkronkan backend policy.constants.ts, daily.service.ts, seed.ts, dan DB active record.
- **Dependencies:** `MorningCommitmentView.vue, daily.service.ts, policy.constants.ts, seed.ts`
- **Regression Impact & Mitigasi:** KRITIS (backend timing engine). Mitigasi: daily.service.spec.ts 9 tests lulus.
- **Test Scenarios:** Verifikasi manual via `TC-DLYM-001, TC-DLYM-005, TC-TIM-02` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Banner menampilkan pesan 23:59 WIB, backend menerima pengisian hingga 23:59:59 WIB. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **5 SP (~3 Hari)**

---

#### Paket Kerja RWP-STND-13: Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol (`IMP-029`)
- **Package ID:** `RWP-STND-13`
- **Finding ID yang Dicakup:** `IMP-029` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-029`: Hapus kode teknis `— DEC-004` dari antarmuka pengguna akhir (*end-user*). Ubah label menjadi bahasa bisnis yang bersih dan natural, contoh: `"Hari ini tidak ada komitmen harian terencana (0 Komitmen)"` atau `"Saya tidak memiliki komitmen harian terencana untuk hari ini"`.
- **Scope & Out of Scope:**
  - *In-Scope:* Pilihan opsi Initial Risk pada slot komitmen harian.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/MorningCommitmentView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/MorningCommitmentView.vue (L148, 163, 198, 203, 414)`
- **Technical Approach:** Urutkan radio: 1. Green (Aman), 2. Amber (Berisiko), 3. Red (Kritis); pastikan binding v-model presisi.
- **Dependencies:** `MorningCommitmentView.vue`
- **Regression Impact & Mitigasi:** Menengah (form input). Mitigasi: MorningCommitmentView.spec.ts pass.
- **Test Scenarios:** Verifikasi manual via `TC-DLYM-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Urutan radio Green-Amber-Red tampil konsisten. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-14: Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis (`IMP-030`)
- **Package ID:** `RWP-STND-14`
- **Finding ID yang Dicakup:** `IMP-030` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-030`: Ubah narasi menjadi bahasa bisnis yang menenangkan dan mudah dipahami, contoh: `"Hari Anda akan dicatat resmi sebagai 'Bebas Komitmen (Disetujui)', sehingga Anda tetap aman dan terbebas dari catatan Pelanggaran Pengisian (No Submission)."`
- **Scope & Out of Scope:**
  - *In-Scope:* Container kartu komitmen dan tombol tambah slot komitmen.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/MorningCommitmentView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/MorningCommitmentView.vue (L430-435)`
- **Technical Approach:** Sesuaikan margin-bottom dan border divider antar-slot komitmen.
- **Dependencies:** `MorningCommitmentView.vue`
- **Regression Impact & Mitigasi:** Rendah (visual spacing). Mitigasi: unit test regresi tetap pass.
- **Test Scenarios:** Verifikasi manual via `TC-DLYM-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Tampilan formulir lebih lega dan nyaman dibaca. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-15: Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work (`IMP-031`)
- **Package ID:** `RWP-STND-15`
- **Finding ID yang Dicakup:** `IMP-031` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-031`: Hapus frasa `(Prototipe 03)` dan sempurnakan copywriting menjadi kalimat bisnis profesional, contoh: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi."`
- **Scope & Out of Scope:**
  - *In-Scope:* Tabel / list item Additional Work.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/AdditionalWorkView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/AdditionalWorkView.vue (L164-166)`
- **Technical Approach:** Atur lebar kolom judul tugas, kategori, dan estimasi waktu agar proporsional.
- **Dependencies:** `AdditionalWorkView.vue`
- **Regression Impact & Mitigasi:** Rendah (visual grid).
- **Test Scenarios:** Verifikasi manual via `TC-DLYA-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Kolom tugas tambahan tersusun proporsional. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-16: Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work (`IMP-032`)
- **Package ID:** `RWP-STND-16`
- **Finding ID yang Dicakup:** `IMP-032` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 3**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-032`: Tambahkan aturan CSS `min-width: 0;` pada elemen `.form-group` dan batasi lebar elemen `.input-control` select dengan `width: 100%; max-width: 100%; text-overflow: ellipsis;` serta filter daftar pilihan agar hanya memuat atasan/pejabat yang relevan (bukan diri sendiri atau karyawan baru).
- **Scope & Out of Scope:**
  - *In-Scope:* Tampilan saat list additional work kosong.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/AdditionalWorkView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/AdditionalWorkView.vue (L340-355)`
- **Technical Approach:** Sediakan kartu placeholder dengan ikon informatif dan teks panduan pengisian.
- **Dependencies:** `AdditionalWorkView.vue`
- **Regression Impact & Mitigasi:** Rendah (empty state UI).
- **Test Scenarios:** Verifikasi manual via `TC-DLYA-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Empty state informatif muncul saat data kosong. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-17: Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome (`IMP-033`)
- **Package ID:** `RWP-STND-17`
- **Finding ID yang Dicakup:** `IMP-033` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-033`: Selaraskan dengan penyempurnaan kartu konteks pada Morning Commitment (`IMP-027`):
  1. Ganti badge biru kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026").
  2. Subkotak 1: Fokus pada "Batas On-Time EOD" (cth: `17:00 WIB`).
  3. Subkotak 2: Fokus pada "Batas Akhir / Cut-Off EOD" (cth: `21:00 WIB`).
  4. Subkotak 3: Tetap "Status Waktu" (cth: badge `ON-TIME`).
  5. Subkotak 4: "Total Item Evaluasi" (cth: `4 Tugas`).
- **Scope & Out of Scope:**
  - *In-Scope:* Kartu evaluasi deliverable komitmen sore hari.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L325-365)`
- **Technical Approach:** Tata ulang kartu evaluasi deliverable dengan border pemisah dan badge status yang jelas.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Tinggi (file terlindungi Cycle 1 DEF-002). Mitigasi: EodOutcomeView.spec.ts pass.
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Kartu evaluasi capaian tersaji rapi dan terisolasi. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **3 SP (~1.5-2 Hari)**

---

#### Paket Kerja RWP-STND-18: Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome (`IMP-034`)
- **Package ID:** `RWP-STND-18`
- **Finding ID yang Dicakup:** `IMP-034` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-034`: Hapus kode teks `(Prototipe 04)` dan poles kalimat menjadi elegan: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel."`
- **Scope & Out of Scope:**
  - *In-Scope:* Radio button selector outcome pada form EOD.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L311-313)`
- **Technical Approach:** Sinkronkan 4 nilai radio dengan enum Prisma dan label deskriptif bahasa Indonesia.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Tinggi (data binding submit). Mitigasi: EodOutcomeView.spec.ts pass.
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Pilihan status capaian 100% cocok dengan enum backend. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **3 SP (~1.5-2 Hari)**

---

#### Paket Kerja RWP-STND-19: Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD (`IMP-035`)
- **Package ID:** `RWP-STND-19`
- **Finding ID yang Dicakup:** `IMP-035` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-035`: 1. Ubah judul seksi menjadi bahasa bisnis yang bermartabat: `"Refleksi Mandiri Akhir Hari"` dengan badge keterangan `Penilaian Otonom Karyawan`.
  2. Sederhanakan paragraf penjelasan menjadi narasi suportif yang hangat: `"Bagaimana penilaian mandiri Anda terhadap pencapaian kerja secara keseluruhan hari ini? Anda memiliki hak penuh untuk menentukan status refleksi hari ini secara jujur dan transparan demi pembelajaran bersama tim."`
- **Scope & Out of Scope:**
  - *In-Scope:* Pilihan transfer tugas ke hari kerja berikutnya.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L520-545)`
- **Technical Approach:** Tampilkan selector carry-over secara kondisional hanya saat status PARTIALLY atau NOT_COMPLETED.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Menengah (kondisional UI).
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Selector carry-over muncul reaktif sesuai status capaian. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-20: Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD (`IMP-036`)
- **Package ID:** `RWP-STND-20`
- **Finding ID yang Dicakup:** `IMP-036` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-036`: Hapus seluruh nama enum berkode huruf besar dan bergaris bawah dari antarmuka pengguna akhir. Gunakan bahasa Indonesia bisnis yang natural dengan pemisah spasi:
  - `"Belum Selesai"` (tanpa `NOT_COMPLETED`).
  - `"Lanjutkan Besok (Tugas Berlanjut)"` atau `"Lanjutkan Besok"`.
  - `"Tidak Dilanjutkan"` atau `"Selesai Tanpa Lanjutan"` (tanpa `DO_NOT_CONTINUE`).
- **Scope & Out of Scope:**
  - *In-Scope:* Textarea refleksi mandiri sore hari.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L430-465)`
- **Technical Approach:** Berikan label panduan dan validasi karakter minimal pada refleksi mandiri.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Menengah (form validation).
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Field refleksi mandiri rapi dan validasi berfungsi. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-21: Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal) (`IMP-037`)
- **Package ID:** `RWP-STND-21`
- **Finding ID yang Dicakup:** `IMP-037` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Low**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-037`: Selaraskan styling `.mt-2` atau `.form-group` agar menggunakan layout vertikal (`display: flex; flex-direction: column; gap: 6px;`) dan terapkan `width: 100%;` pada textarea `.input-control` agar membentang memenuhi lebar kartu dengan placeholder yang terbaca penuh.
- **Scope & Out of Scope:**
  - *In-Scope:* Indikator counter panjang teks di bawah textarea.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L470-490)`
- **Technical Approach:** Posisikan counter di kanan bawah textarea dengan warna muted dan transisi warna jika mendekati batas.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Rendah (visual feedback).
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Counter karakter informatif dan presisi. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Low** | **1 SP (~0.5 Hari)**

---

#### Paket Kerja RWP-STND-22: Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan) (`IMP-038`)
- **Package ID:** `RWP-STND-22`
- **Finding ID yang Dicakup:** `IMP-038` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-038`: Selaraskan kapabilitas evaluasi pekerjaan tambahan dengan evaluasi komitmen pagi:
  1. Tambahkan opsi `Dibatalkan` lengkap dengan kolom input alasan pembatalan.
  2. Jika dipilih `Sebagian` atau `Belum Selesai`, tampilkan sub-pilihan keputusan kelanjutan tugas (`Lanjutkan Besok` vs `Tidak Dilanjutkan`) beserta kolom catatan kelanjutan.
- **Scope & Out of Scope:**
  - *In-Scope:* Footer aksi form EOD dan dialog konfirmasi penutupan hari.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L500-518)`
- **Technical Approach:** Sediakan dialog konfirmasi ringkas yang merangkum capaian sebelum tombol final submit ditekan.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Tinggi (alur submit final). Mitigasi: DEF-002 lock verification.
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Modal konfirmasi mencegah pengiriman EOD yang tidak disengaja. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-23: Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis (`IMP-039`)
- **Package ID:** `RWP-STND-23`
- **Finding ID yang Dicakup:** `IMP-039` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **Medium**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-039`: Terapkan pemetaan label ramah pengguna (*human-friendly formatter*), contoh:
  - `NEWLY_ASSIGNED` → `Penugasan Baru Atasan`
  - `OPERATIONAL_INCIDENT` → `Insiden Operasional`
  - `MISSED_IN_PLANNING` → `Kebutuhan Dadakan`
  - `PRIORITY_CHANGE` → `Perubahan Prioritas`
- **Scope & Out of Scope:**
  - *In-Scope:* Rekapitulasi tugas tambahan pada form penutupan sore.
  - *Out-of-Scope:* Komponen dan logika di luar modul `EodOutcomeView.vue`.
- **Affected Files & Modules:** `EodOutcomeView.vue (L498), AdditionalWorkView.vue (L368)`
- **Technical Approach:** Tampilkan daftar additional work yang diselesaikan hari ini pada panel ringkasan EOD.
- **Dependencies:** `EodOutcomeView.vue, AdditionalWorkView.vue`
- **Regression Impact & Mitigasi:** Menengah (cross-view sync).
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Tugas tambahan terangkum akurat pada ringkasan EOD. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **Medium** | **2 SP (~1 Hari)**

---

#### Paket Kerja RWP-STND-24: Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan) (`IMP-040`)
- **Package ID:** `RWP-STND-24`
- **Finding ID yang Dicakup:** `IMP-040` (Standalone Finding — Teratifikasi `DEC-009-UAT`)
- **Siklus Alokasi Draft:** **Cycle 4**
- **Klasifikasi & Prioritas:** STANDALONE | Prioritas **High**
- **Original Acceptance Criteria Individual (Backlog):**
  - `IMP-040`: Hapus implementasi modal pop-up pada tombol tersebut. Selaraskan seluruh tombol "Lapor Blocker" pada 3 sub-halaman My Today agar secara konsisten langsung mengarahkan (*direct navigate*) ke halaman kanonikal `/blockers/raise` dengan posisi tata letak yang presisi di sisi kanan tab navigasi.
- **Scope & Out of Scope:**
  - *In-Scope:* Tampilan readonly EOD pasca submit.
  - *Out-of-Scope:* Komponen dan logika di luar modul `frontend/src/views/daily/EodOutcomeView.vue`.
- **Affected Files & Modules:** `frontend/src/views/daily/EodOutcomeView.vue (L61-69, 217-248, 315-322, 604-690)`
- **Technical Approach:** Rapikan summary panel read-only yang menampilkan status hari, jam submit, dan tautan koreksi resmi.
- **Dependencies:** `EodOutcomeView.vue`
- **Regression Impact & Mitigasi:** Tinggi (DEF-002 locked state). Mitigasi: EodOutcomeView.spec.ts pass.
- **Test Scenarios:** Verifikasi manual via `TC-EOD-001` dan pastikan seluruh unit test terkait lulus.
- **Definition of Done (DoD):** Tampilan EOD tertutup tampak elegan dan 100% read-only. `npm run build` sukses dan zero regresi.
- **Estimated Complexity & Effort:** **High** | **3 SP (~1.5-2 Hari)**

---

## 7. MATRIKS AUDIT KETERLACAKAN 44 FINDINGS & DEPENDENSI FILE (AUDIT MATRIX)

Matriks audit keterlacakan ini menyajikan pemetaan 1:1 antara seluruh 44 Finding dari Master Backlog, klasifikasi teratifikasi `DEC-009-UAT`, paket kerja pelaksana, alokasi siklus draf, prioritas, dan estimasi bobot rekayasa:

| Finding ID | Judul Temuan dari Master Backlog | Klasifikasi DEC-009 | Kluster Solusi | Package ID | Siklus Draft | Prioritas | Estimasi SP | File Target Utama |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **IMP-001** | Penyempurnaan Tagline Value Proposition Hero Login | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Low | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-002** | Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Low | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-003** | Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Low | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-004** | Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Medium | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-005** | Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Medium | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-006** | Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Medium | 2 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-007** | Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur | STANDALONE | `-` | `RWP-STND-01` | **Cycle 2** | Low | 2 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-008** | Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form | STANDALONE | `-` | `RWP-STND-02` | **Cycle 2** | Low | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-009** | Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment" | STANDALONE | `-` | `RWP-STND-03` | **Cycle 2** | Low | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-010** | Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna | STANDALONE | `-` | `RWP-STND-04` | **Cycle 2** | Medium | 1 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-011** | Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?" | STANDALONE | `-` | `RWP-STND-05` | **Cycle 2** | High | 2 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-012** | Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi | GROUP | `SOL-AUTH-HERO` | `RWP-CLUST-01` | **Cycle 2** | Medium | 1 SP | `frontend/src/views/auth/ActivateView.vue` |
| **IMP-013** | Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit | STANDALONE | `-` | `RWP-STND-06` | **Cycle 2** | Medium | 3 SP | `frontend/src/views/auth/LoginView.vue` |
| **IMP-014** | Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | Medium | 2 SP | `frontend/src/components/common/TopBar.vue` |
| **IMP-015** | Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | High | 2 SP | `frontend/src/components/common/TopBar.vue` |
| **IMP-016** | Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today | STANDALONE | `-` | `RWP-STND-08` | **Cycle 3** | High | 3 SP | `MorningCommitmentView.vue` |
| **IMP-017** | Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia' | STANDALONE | `-` | `RWP-STND-09` | **Cycle 3** | High | 2 SP | `frontend/src/components/EnterpriseSidebar.vue` |
| **IMP-018** | Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | Low | 1 SP | `frontend/src/views/profile/ProfileView.vue` |
| **IMP-019** | Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi) | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | High | 1 SP | `frontend/src/components/common/TopBar.vue` |
| **IMP-020** | Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap) | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | Low | 2 SP | `frontend/src/components/EnterpriseSidebar.vue, TopBar` |
| **IMP-021** | Pemisahan Nama Lengkap dan Jabatan pada Tampilan User | GROUP | `SOL-PROF-LAYO` | `RWP-CLUST-03` | **Cycle 4** | Medium | 2 SP | `frontend/src/views/profile/ProfileView.vue` |
| **IMP-022** | Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24 | GROUP | `SOL-PROF-LAYO` | `RWP-CLUST-03` | **Cycle 4** | High | 2 SP | `frontend/src/views/profile/ProfileView.vue` |
| **IMP-023** | Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran | STANDALONE | `-` | `RWP-STND-07` | **Cycle 2** | High | 1 SP | `frontend/src/views/system/ErrorPageView.vue` |
| **IMP-024** | Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | Medium | 2 SP | `Admin Views` |
| **IMP-025** | Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | Medium | 2 SP | `Admin Views` |
| **IMP-026** | Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace' | STANDALONE | `-` | `RWP-STND-10` | **Cycle 3** | High | 4 SP | `frontend/src/components/EnterpriseSidebar.vue, frontend/src/router/navigation.ts, router/index.ts` |
| **IMP-027** | Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment | STANDALONE | `-` | `RWP-STND-11` | **Cycle 3** | Medium | 3 SP | `frontend/src/views/daily/MorningCommitmentView.vue` |
| **IMP-028** | Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan) | STANDALONE | `-` | `RWP-STND-12` | **Cycle 3** | Medium | 5 SP | `frontend/src/views/daily/MorningCommitmentView.vue` |
| **IMP-029** | Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol | STANDALONE | `-` | `RWP-STND-13` | **Cycle 3** | Medium | 2 SP | `frontend/src/views/daily/MorningCommitmentView.vue` |
| **IMP-030** | Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis | STANDALONE | `-` | `RWP-STND-14` | **Cycle 3** | Medium | 2 SP | `frontend/src/views/daily/MorningCommitmentView.vue` |
| **IMP-031** | Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work | STANDALONE | `-` | `RWP-STND-15` | **Cycle 3** | Medium | 2 SP | `frontend/src/views/daily/AdditionalWorkView.vue` |
| **IMP-032** | Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work | STANDALONE | `-` | `RWP-STND-16` | **Cycle 3** | High | 2 SP | `frontend/src/views/daily/AdditionalWorkView.vue` |
| **IMP-033** | Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome | STANDALONE | `-` | `RWP-STND-17` | **Cycle 4** | Medium | 3 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-034** | Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome | STANDALONE | `-` | `RWP-STND-18` | **Cycle 4** | Medium | 3 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-035** | Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD | STANDALONE | `-` | `RWP-STND-19` | **Cycle 4** | High | 2 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-036** | Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD | STANDALONE | `-` | `RWP-STND-20` | **Cycle 4** | Medium | 2 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-037** | Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal) | STANDALONE | `-` | `RWP-STND-21` | **Cycle 4** | High | 1 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-038** | Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan) | STANDALONE | `-` | `RWP-STND-22` | **Cycle 4** | Medium | 2 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-039** | Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis | STANDALONE | `-` | `RWP-STND-23` | **Cycle 4** | Low | 2 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-040** | Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan) | STANDALONE | `-` | `RWP-STND-24` | **Cycle 4** | High | 3 SP | `frontend/src/views/daily/EodOutcomeView.vue` |
| **IMP-041** | Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya) | GROUP | `SOL-BLKR-FORM` | `RWP-CLUST-04` | **Cycle 4** | High | 3 SP | `frontend/src/views/blockers/RaiseBlockerView.vue` |
| **IMP-042** | Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan | GROUP | `SOL-BLKR-FORM` | `RWP-CLUST-04` | **Cycle 4** | Medium | 2 SP | `frontend/src/views/blockers/RaiseBlockerView.vue` |
| **IMP-043** | Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi | GROUP | `SOL-SHLL-TOPB` | `RWP-CLUST-02` | **Cycle 2** | Medium | 1 SP | `frontend/src/views/blockers/RaiseBlockerView.vue` |
| **IMP-044** | Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim | GROUP | `SOL-BLKR-FORM` | `RWP-CLUST-04` | **Cycle 4** | Low | 2 SP | `frontend/src/views/blockers/RaiseBlockerView.vue` |

---

## 8. PROTOKOL PENCEGAHAN REGRESI CYCLE 1 & AUTOMATED VERIFICATION GATE

### 8.1. Empat Lapis Pertahanan Regresi
Untuk menjamin bahwa perbaikan pada Cycle 2, 3, dan 4 tidak merusak perbaikan kritis `DEF-001` dan `DEF-002` yang telah dicapai pada Cycle 1, RWP ini menetapkan **Empat Lapis Pertahanan Regresi**:

1. **Lapis 1 (Kontrol Cabang Git & Isolasi Modifikasi):**  
   Setiap siklus kerja wajib dieksekusi pada cabang terisolasi (contoh: `remediation/cycle-02-shell-auth`), tidak boleh mencampurkan modifikasi antarsiklus, dan dilarang mengubah file form komitmen harian sebelum siklus terkait dibuka.

2. **Lapis 2 (Automated Test Gate 19 Unit Tests):**  
   Rangkaian 19 unit test case wajib dijalankan sebagai *Pre-Flight Gate* sebelum melakukan perubahan kode dan sebagai *Verification Gate* sebelum commit.

3. **Lapis 3 (Runtime Policy Precedence Lock):**  
   Logika penentuan cutoff wajib mematuhi rantai eksekusi kebijakan runtime tanpa bypass.

4. **Lapis 4 (Anti-Backdating Hard Guard):**  
   Validasi backend `workDate < todayDateString` pada `daily.service.ts` L39-44 bersifat permanen dan tidak boleh diubah atau dilemahkan oleh paket kerja apa pun.

### 8.2. Baseline Suite 19 Automated Tests
Rangkaian pengujian otomatis yang menjadi standar gerbang kelulusan terdiri dari 3 file uji:

| File Spesifikasi Uji | Lokasi / Perintah Eksekusi | Jumlah Test Case | Ruang Lingkup Proteksi Kritis | Status Baseline |
|---|---|:---:|---|:---:|
| `MorningCommitmentView.spec.ts` | `npm --prefix frontend run test -- src/views/daily/MorningCommitmentView.spec.ts` | **6 tests** | Proteksi form lock `DEF-001`, tombol submit tersembunyi pasca-submit, persistensi refresh, slot komitmen. | **100% PASS** |
| `EodOutcomeView.spec.ts` | `npm --prefix frontend run test -- src/views/daily/EodOutcomeView.spec.ts` | **4 tests** | Proteksi form lock `DEF-002`, radio outcome disabled pasca-submit, refleksi mandiri, navigasi koreksi. | **100% PASS** |
| `daily.service.spec.ts` | `npm --prefix backend run test -- src/daily/services/daily.service.spec.ts` | **9 tests** | Proteksi backend API submission lock, pencegahan re-submit, validasi backdating, kalkulasi status On-Time/Late. | **100% PASS** |
| **TOTAL TEST BASELINE** | `npm run test` (Root) | **19 tests** | **Integritas Fungsional Akuntabilitas Harian WorkPulse** | **19/19 PASSED (100%)** |

### 8.3. Protokol & Kriteria Gerbang Kelulusan (Pass Gate Criteria)
Sebuah paket kerja (*Work Package*) atau siklus remediasi hanya dapat dinyatakan selesai (*ACCEPTED*) apabila memenuhi seluruh kriteria gerbang berikut:
1. **Zero Regresi Test:** 19 dari 19 unit test wajib berstatus **PASS** (0 failed, 0 skipped).
2. **Zero Compile/Build Error:** Perintah `npm run build:backend` dan `npm run build:frontend` wajib exit code 0.
3. **Zero Linting Regression:** Perintah `npm run lint` tidak menghasilkan error baru pada file yang disentuh.
4. **Zero State Mutation on Cycle 1 Locks:** Computed property `isFormLocked` dan `isSubmittedSuccess` pada kedua form harian tetap berfungsi mutlak mengunci form.

---

## 9. MANAJEMEN RISIKO KEAMANAN VERIF-FIND-001 & SANITASI KREDENSIAL

### 9.1. Status Tata Kelola VERIF-FIND-001
Temuan risiko keamanan `VERIF-FIND-001` tetap dipertahankan dengan status resmi:
> **`OPEN / PENDING OWNER MITIGATION`**

### 9.2. Taksonomi 4 Kategori Kredensial & Secrets
Untuk mencegah kesalahpahaman antara kredensial lingkungan pengujian dan rahasia operasional, didefinisikan taksonomi 4 kategori:
1. **Production Secrets:** Rahasia tingkat produksi (contoh: Production API Keys, Private Encryption Keys). *Status: Tidak terekspos di repositori.*
2. **Demo Credentials:** Kredensial akun peraga lokal (contoh: akun demo `eva.supervisor`, `bob.finance`). *Status: Disanitasi pada seluruh artefak laporan.*
3. **Seeder Activation Token:** Token otentikasi aktivasi akun pada seeder database (`backend/prisma/seed.ts`). *Status: Disanitasi dengan placeholder `[REDACTED]`.*
4. **Development Environment Secrets:** JWT Secret lokal dan Database URL lokal pada file `.env.example`. *Status: Terisolasi untuk kebutuhan dev lokal.*

### 9.3. Protokol Penanganan Kredensial pada RWP
- Seluruh artefak dokumentasi RWP dilarang menampilkan nilai literal token atau kredensial apa pun.
- Tim pengembang dilarang melakukan tindakan operasional sepihak seperti rotasi token seeder, pembatalan akun, pembersihan git commit history, atau manipulasi credential store tanpa perintah tertulis dari Acceptance Owner.

---

## 10. REKAPITULASI KEPUTUSAN TERTUNDA ACCEPTANCE OWNER (PENDING DECISIONS REGISTER)

Sebelum RWP v0.2 ini dieksekusi ke tahap implementasi (Phase 3), terdapat lima (5) butir keputusan strategis yang menunggu pengesahan Acceptance Owner:

| No | Butir Keputusan | Pilihan Tindakan / Rekomendasi Tim Teknis | Dokumen Rujukan | Status |
|:---:|---|---|:---:|:---:|
| **1** | **Formalisasi Keputusan `DEC-010-UAT`** | Pengesahan terminologi `IMP-027`: Badge resmi antarmuka pengguna adalah *'Terlambat (LATE)'*; eliminasi penuh frasa *'Grace Period'* dan *'Jendela Toleransi'*. | `DEC-010-UAT` | Menunggu Ratifikasi Bersama RWP |
| **2** | **Arah Arsitektur Shell TopBar** | Menyetujui Opsi C (Pendekatan Bertahap): Ekstraksi komponen terpusat `TopBar.vue` di Cycle 2 untuk Shell & Admin, diikuti migrasi view Daily di Cycle 3 & 4 sebagai Technical Enabler. | Seksi 4 RWP | Menunggu Arahan Owner |
| **3** | **Otorisasi Draf Alokasi 3 Siklus (CAP)** | Meratifikasi pembagian paket kerja ke dalam 3 Siklus Remediasi (Cycle 2: 22 finding, Cycle 3: 9 finding, Cycle 4: 13 finding). | Seksi 5 RWP | Menunggu Ratifikasi Owner |
| **4** | **Otorisasi Rencana Terpadu `TECH-FIND-001`** | Menyetujui rencana perbaikan 5 langkah multi-lapis untuk menyinkronkan batas penguncian `23:59 WIB` di Cycle 3. | Seksi 3.5 RWP | Menunggu Otorisasi Owner |
| **5** | **Peta Jalan Mitigasi `VERIF-FIND-001`** | Menentukan jadwal dan prosedur operasional untuk rotasi token aktivasi seeder dan sanitasi git history secara terpisah dari remediasi fungsional. | Seksi 9 RWP | PENDING OWNER MITIGATION |

---

## 11. BATASAN KETAT PELAKSANAAN & BLOK PENGESAHAN FORMAL

### 11.1. Kepatuhan Penuh terhadap Batasan Tata Kelola (Strict Boundaries)
Seluruh anggota tim teknis dengan ini menegaskan kembali kepatuhan mutlak terhadap batasan berikut:
1. **TIDAK ADA PERUBAHAN KODE:** File source code aplikasi (`frontend/src/`, `backend/src/`) tetap berada dalam kondisi bitwise identical terhadap baseline awal.
2. **TIDAK ADA PERUBAHAN DATABASE / SEEDER:** Skema Prisma, file migrasi, dan script seeder (`seed.ts`) tidak disentuh sama sekali.
3. **TIDAK ADA MODIFIKASI MASTER BACKLOG:** Dokumen `UAT/UAT-Improvement-Backlog.md` tetap perawan sebagai Single Source of Truth.
4. **TIDAK ADA GIT COMMIT / GIT PUSH:** Tidak ada commit git baru atau operasi remote git yang dijalankan.
5. **TIDAK ADA EKSEKUSI MANUAL UAT:** Pengujian manual dihentikan total selama fase perencanaan.

### 11.2. Penegakan Kepatuhan Stop Condition
Dengan diterbitkannya dokumen Rencana Kerja Remediasi (RWP v0.2 / DRAFT) ini, **tugas penyusunan revisi perencanaan Phase 2 dinyatakan SELESAI**.

Sesuai instruksi dan protokol tata kelola Acceptance Owner:
> [!CAUTION] STOP CONDITION DIKUKUHKAN
> Tim teknis **BERHENTI TOTAL** dari seluruh aktivitas modifikasi, tidak melakukan panggilan tool implementasi, dan **MENUNGGU EVALUASI SERTA KEPUTUSAN FORMAL DARI ACCEPTANCE OWNER (HARRY)**.

---

### 11.3. Lembar Pengesahan Formal (Sign-Off Block)

| Peran Tata Kelola | Nama Pejabat / Tim | Tanda Tangan / Status | Tanggal Pengesahan |
|---|---|:---:|:---:|
| **Acceptance Owner & Lead Manual UAT Tester** | **Harry** | `[ PENDING OWNER REVIEW ]` | *(Menunggu Keputusan)* |
| **Lead Software Architect & QA Lead** | Tim Arsitektur & QA | `SUBMITTED (DRAFT v0.2)` | 02 November 2026 |
| **Technical Project Manager** | Tim Tata Kelola UAT | `VERIFIED FOR PLANNING` | 02 November 2026 |
