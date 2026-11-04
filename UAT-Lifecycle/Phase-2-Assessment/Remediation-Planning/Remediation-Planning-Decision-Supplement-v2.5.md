# DOKUMEN SUPLEMEN KEPUTUSAN ACCEPTANCE OWNER (PHASE 2 BASELINE v2.5)
## Kodifikasi Keputusan Produk, Reklasifikasi Register Temuan Teknis, Penegasan Aturan Cut-Off, dan Otorisasi Perencanaan Remediasi (RWP)

**Nomor Dokumen:** UAT-PHASE2-SUPP-001  
**Versi Dokumen:** v2.5.1 (v2.5 + Errata E-01..E-06)  
**Tanggal Penerbitan:** 02 November 2026  
**Otoritas Pengesahan:** Acceptance Owner & Lead Manual UAT Tester (Harry)  
**Tim Penyusun:** Senior Software Architect, Backend Engineer, QA Lead, & Governance Analyst  
**Status Dokumen:** FORMALLY ENDORSED DECISION SUPPLEMENT  
**Dokumen Induk Terkait:** `Remediation-Planning-Preparation-Report.md` (v2.5)  
**Dasar Tata Kelola:** `DEC-009-UAT`, `CHG-009`, Master Backlog `UAT/UAT-Improvement-Backlog.md`

---

## 1. FORMAL DECISION RECORD (CATATAN KEPUTUSAN FORMAL OWNER)

Berdasarkan tinjauan formal Acceptance Owner terhadap laporan audit teknis v2.4 pada tanggal 02 November 2026, ketetapan-ketetapan tata kelola dan produk berikut secara resmi dicatat:

### 1.1. Penerimaan Substantif Hasil Audit Teknis
Acceptance Owner menyatakan **MENERIMA SECARA SUBSTANTIF** hasil audit teknis v2.4, mencakup:
- Penelusuran alur eksekusi waktu backend 7 tahap.
- Matriks evaluasi 9 kasus waktu batas kritis.
- Analisis keterbatasan format string `HH:mm`.
- Pembuktian 4 lapisan pertahanan anti-backdating terhadap *midnight wraparound*.
- Rekonsiliasi definitif baseline unit test regresi Cycle 1 (19 test cases, 100% Pass).

### 1.2. Keberlakuan Mutlak Baseline Clustering DEC-009-UAT
Acceptance Owner menegaskan kembali bahwa **Baseline Clustering 44 Findings hasil ratifikasi `DEC-009-UAT` dan `CHG-009` TETAP BERLAKU SECARA MUTLAK DAN TIDAK BOLEH DIUBAH**:
- **20 GROUP Findings** dalam 4 kluster solusi terpadu (`SOL-AUTH-HERO`: 7, `SOL-SHLL-TOPB`: 8, `SOL-PROF-LAYO`: 2, `SOL-BLKR-FORM`: 3).
- **24 STANDALONE Findings** (termasuk independensi `IMP-011`, `IMP-016`, dan `IMP-040`).
- **0 REVIEW Findings**.
- Total: **Tepat 44 findings**.

### 1.3. Kodifikasi Keputusan Produk Terminologi IMP-027 (Kandidat DEC-010-UAT)
- **Teks Badge Subkotak 3 Antarmuka:** Disetujui menampilkan murni **`Terlambat (LATE)`** atau **`LATE`** (Badge Amber).
- **Eliminasi Total pada Antarmuka (UI):** Frasa *Grace Period* dan *Jendela Toleransi* dihapus 100% dari seluruh antarmuka pengguna (banner, kartu konteks, tooltip, helper text).
- **Preservasi Dokumen Sumber Historis:** Istilah asli pada dokumen master backlog `UAT/UAT-Improvement-Backlog.md` dan berkas penunjang UAT historis tetap dipertahankan utuh tanpa perubahan.
- **Status Tata Kelola:** Dicatat secara formal sebagai **Kandidat Keputusan `DEC-010-UAT`**; tidak diklaim telah diratifikasi penuh sebelum pencatatan formal selesai ke dalam `UAT-Decision-Log.md`.

---

## 2. REVISED TECHNICAL FINDINGS REGISTER (REGISTER TEMUAN TEKNIS TEREKONSILIASI)

Menindaklanjuti arahan koreksi Acceptance Owner, register temuan teknis direklasifikasi secara resmi sebagai berikut:

### [TECH-FIND-001] Ketidaksesuaian Default Batas Lockout Morning Commitment (09:30 vs 23:59)
- **Klasifikasi Resmi:** **`IMPLEMENTATION DISCREPANCY — REMEDIATION REQUIRED`**
- **Komponen Terdampak:** `backend/src/daily/services/daily.service.ts` (L57, L172), `backend/src/policy/policy.constants.ts` (L43), `backend/prisma/seed.ts` (L268)
- **Kondisi Aktual (Actual Behavior):** Nilai fallback kanonikal saat ini bernilai `'09:30'`. Submission komitmen pagi setelah pukul 09:30 WIB ditolak dengan error `BUSINESS_RULE_CUTOFF_LOCKED`.
- **Requirement Baseline (Expected per IMP-028):** Requirement resmi sistem menetapkan batas akhir penyerahan komitmen pagi adalah pukul **`23:59 WIB`** dengan status `Terlambat (LATE)`.
- **Ketetapan Acceptance Owner:** Keberadaan fallback `'09:30'` adalah **ketidaksesuaian implementasi terhadap requirement**, bukan alternatif kebijakan yang setara. Remedi diwajibkan dalam paket kerja terkait (usulan Cycle 3; lihat Errata E-03).
- **Status Otorisasi:** **Perubahan kode aplikasi/seeder saat ini BELUM DIOTORISASI**.

### [TECH-FIND-002] Penentuan Presisi Waktu Keterlambatan Morning Commitment
- **Klasifikasi Resmi:** **`PROVISIONAL APPROVAL — MINUTE RESOLUTION (HH:mm)`**
- **Komponen Terdampak:** `backend/src/daily/services/daily.service.ts` (L48–55, L162–169)
- **Kondisi Aktual:** Pemformatan waktu `hour: '2-digit', minute: '2-digit'` memangkas detik, sehingga rentang detik antara 09:00:01 s.d. 09:00:59 WIB diformat sebagai `'09:00'`.
- **Ketetapan Acceptance Owner:** Untuk perencanaan remediasi, disetujui sementara penggunaan format menit:
  - Seluruh waktu pada menit `09:00` (termasuk 09:00:01 s.d. 09:00:59 WIB) dihitung sah sebagai **`ON_TIME`**.
  - Status **`LATE`** baru aktif mulai menit **`09:01 WIB`**.
- **Status Otorisasi:** **Persetujuan Sementara Perencanaan; Kode Aplikasi Tidak Diubah**.

### [TECH-FIND-003] Peran Anti-Backdating Guard dalam Penguncian Tengah Malam
- **Klasifikasi Resmi:** **`DATE PROTECTION MECHANISM — NOT A REPLACEMENT FOR CUT-OFF VALIDATION`**
- **Komponen Terdampak:** `backend/src/daily/services/daily.service.ts` (L145–151, L172)
- **Kondisi Aktual:** Penyerahan form kemarin pasca tengah malam (`00:00:00 WIB`) ditolak oleh `inputWorkDate < todayStr` (`BUSINESS_RULE_BACKDATING_FORBIDDEN`).
- **Ketetapan Acceptance Owner:** Guard anti-backdating didokumentasikan sebagai **mekanisme proteksi tanggal yang valid saat pergantian kalender**, namun secara arsitektural **TIDAK DIANGGAP SEBAGAI PENGGANTI VALIDASI CUT-OFF YANG BENAR**.
- **Status Otorisasi:** **Mekanisme Multi-Layer Dipertahankan; Logika Cut-off dan Proteksi Tanggal Berjalan Komplementer**.

---

## 3. CUT-OFF BUSINESS RULE DEFINITION & TRACEABILITY

Untuk menjadi acuan baku penyusunan RWP, definisi operasional aturan cut-off Morning Commitment ditetapkan sebagai berikut:

```
[00:00:00 WIB] ─── On-Time Window ─── [09:00:59 WIB] ─── Late Window ─── [23:59:59 WIB] ─── [00:00:00 WIB Hari +1]
                  (Status: ON_TIME)                      (Status: LATE)                     (Status: LOCKED / REJECTED)
```

### 3.1. Ketetapan Operasional 3 Titik Kritis
1. **Batas On-Time (09:00:59 WIB):** Penyerahan komitmen pagi antara 00:00:00 s.d. 09:00:59 WIB tercatat sebagai `ON_TIME` (Badge Hijau).
2. **Jendela Keterlambatan (09:01:00 s.d. 23:59:59 WIB):** Penyerahan komitmen pagi antara 09:01:00 s.d. 23:59:59 WIB sah diterima dan secara otomatis dicatat dengan status `Terlambat (LATE)` (Badge Amber). Pengisian masih diperbolehkan selama menit `23:59 WIB`.
3. **Penguncian Sistem Efektif (00:00:00 WIB Hari Kalender Berikutnya):** Penguncian sistem (*lockout*) efektif berlaku tepat saat jam berganti menjadi `00:00:00 WIB` hari berikutnya. Submission untuk tanggal kerja sebelumnya ditolak secara mutlak dengan error HTTP 422 (`BUSINESS_RULE_BACKDATING_FORBIDDEN` / DEC-008).

### 3.2. Penelusuran Sumber Kebutuhan (Dikoreksi Errata v2.5.1, E-02)

| Dokumen Acuan | Lokasi | Isi yang Ditemukan pada Pembacaan Langsung | Status terhadap Definisi Operasional Owner |
|---|---|---|:---:|
| **PRD** | FR-26, AC-57 (Seksi 3.6) | On-Time jika `submittedAt ≤ On-Time Deadline`; Late jika `deadline < submittedAt ≤ Cut-Off`; setelah Cut-Off ditolak. `Cut-Off = On-Time Deadline + Grace Period`. | **Berbeda notasi dan presisi** (waktu kontinu vs presisi menit); klarifikasi operasional oleh Owner |
| **SAD** | Bagian transisi status; Lampiran B.1 | Aturan transisi sama dengan PRD. Nilai ilustratif seed: On-Time 09:00 + Grace 30 menit = Cut-Off 09:30. | **Berbeda nilai** (ilustratif 09:30 vs requirement `IMP-028` 23:59) |
| **Master Backlog** | `IMP-027`, `IMP-028` | Contoh Batas Cut-Off `23:59 WIB`; pengisian dapat dikirim sebelum sistem terkunci pada pukul 23:59 WIB. | **Sumber nilai 23:59** |
| **Test Plan** | TC-TIM-02, TC-TIM-04 | D + 1 detik = `LATE`; C + 1 detik = ditolak. | **Konflik dengan presisi menit** jika diterapkan sebagai ekspektasi uji |
| **Kode Backend** | `daily.service.ts`, `policy.constants.ts`, `seed.ts` | Perbandingan string `HH:mm`; nilai efektif bergantung pada sumber konfigurasi. | Lihat RWP v0.1 Bagian 5 |

> [!NOTE]
> Pernyataan v2.5 bahwa seluruh sumber **100% konsisten** ditarik. Klarifikasi lengkap ada pada RWP v0.1 Bagian 4.

---

## 4. REGRESSION BASELINE SPECIFICATION

Acceptance Owner mengonfirmasi bahwa angka baseline pengujian regresi berikut adalah sah dan mengikat:

| Test Suite File | Path Berkas Sumber | Baseline Jumlah Tests | Passing Rate |
|---|---|:---:|:---:|
| **Frontend Morning View** | `frontend/src/views/daily/MorningCommitmentView.spec.ts` | **6 Test Cases** | **100% Pass (6/6)** |
| **Frontend EOD View** | `frontend/src/views/daily/EodOutcomeView.spec.ts` | **4 Test Cases** | **100% Pass (4/4)** |
| **Backend Daily Service** | `backend/src/daily/services/daily.service.spec.ts` | **9 Test Cases** | **100% Pass (9/9)** |
| **TOTAL REGRESSION BASELINE** | *(3 Focused Suites)* | **19 Test Cases** | **100% PASS (19/19)** |

> [!IMPORTANT] Penegasan Sifat Pengujian
> Angka 19 test cases ini ditegaskan secara resmi sebagai **Baseline Unit Test Regression** untuk verifikasi otomatis pra-commit, **BUKAN hasil pelaksanaan Manual UAT**.

---

## 5. RWP PREPARATION AUTHORIZATION (OTORISASI PENYUSUNAN RWP)

Acceptance Owner secara resmi menerbitkan otorisasi bagi tim analisis untuk menyusun dokumen perencanaan remediasi (*Remediation Work Plan*).

### 5.1. Cakupan Otorisasi yang Diberikan (Permitted Activities)
Tim diizinkan menyusun dokumen perencanaan berikut:
1. `UAT-Remediation-Work-Packages.md` (RWP detail untuk 4 kluster solusi dan 24 paket mandiri).
2. `UAT-Remediation-Priority-Matrix.md` (RPM formula kuantitatif).
3. `UAT-Dependency-and-Impact-Matrix.md` (DIM pemetaan dependensi kode dan alur).
4. `UAT-Cycle-Allocation-Plan.md` (CAP jadwal alokasi draft Cycle 2, 3, dan 4).

### 5.2. Batasan Larangan Ketat (Strict Non-Authorization Boundaries)
Otorisasi ini **TIDAK MENGIZINKAN**:
- Implementasi perubahan kode aplikasi (`frontend/src/`, `backend/src/`).
- Modifikasi skema database, migrasi Prisma, maupun seeder (`seed.ts`).
- Perubahan pada berkas master backlog `UAT/UAT-Improvement-Backlog.md` atau teks AC asli.
- Eksekusi perintah `git commit` maupun `git push`.
- Pelaksanaan pengujian Manual UAT.
- Pengesahan final alokasi siklus (tetap berstatus DRAFT).
- Penutupan atau klaim mitigasi selesai atas risiko keamanan `VERIF-FIND-001`.

---

## 6. REMAINING OWNER DECISIONS INVENTORY (KEPUTUSAN TERTUNDA)

Butir keputusan berikut tetap dicatat sebagai keputusan yang menunggu penetapan definitif Acceptance Owner:
1. **Pencatatan Administratif Formal `DEC-010-UAT`:** Pengesahan resmi catatan Decision Log ke dalam `UAT-Decision-Log.md` bersamaan dengan evaluasi RWP.
2. **Pengesahan Final Alokasi Siklus (Cycle 2, 3, 4):** Penetapan alokasi 22 + 9 + 13 dari status DRAFT menjadi definitif.
3. **Alokasi Kuota Hari Kerja UAT Manual:** Penetapan alokasi hari pengujian manual yang disediakan Acceptance Owner per siklus kerja.
4. **Persetujuan Arsitektur Ekstraksi Komponen Shared TopBar:** Otorisasi refaktorisasi komponen `TopBar.vue` (`SOL-SHLL-TOPB`).
5. **Otorisasi Implementasi Kode untuk TECH-FIND-001:** Izin pengubahan fallback `'09:30'` ke `'23:59'` pada saat paket kerja terkait dimulai (usulan Cycle 3).
6. **Operasionalisasi Mitigasi Kredensial & Seeder Token (`VERIF-FIND-001`):** Wewenang eksekusi rotasi kredensial demo dan pembersihan seeder token.

---
**DITETAPKAN DI:** Jakarta  
**PADA TANGGAL:** 02 November 2026  
**OTORITAS PENGESAHAN:** Acceptance Owner & Lead Manual UAT Tester (Harry)  
**STATUS:** FORMALLY ENDORSED DECISION SUPPLEMENT

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
