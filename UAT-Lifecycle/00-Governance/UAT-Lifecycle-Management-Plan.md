# WorkPulse — UAT Lifecycle Master Management Plan
## Framework Tata Kelola Controlled UAT Lifecycle, Preservasi Baseline, & Continuous Improvement

> **Dokumen:** Master Lifecycle Management Plan (Governance Deliverable)  
> **Proyek:** WorkPulse — Daily Accountability & Blocker Log System  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Acceptance Owner:** Harry  
> **Role Co-Pilot:** Senior QA Engineer, UAT Architect, Test Manager, Product Quality Engineer, & Technical Implementation Co-Pilot  
> **Status Dokumen:** REVISED PER OWNER AUTHORIZATION (DEC-003-UAT)  
> **Tanggal Pembaruan:** 30 Oktober 2026 — 15:50 WIB  
> **Taksonomi Versi (VERIF-FIND-003):**  
> - **Application Release Version:** `v1.0.0-rc1` (Current Suspended Build) $\longrightarrow$ `v1.0.0-rc2` (Remediated Build Target) $\longrightarrow$ `v1.0.0` (Final Production Build)  
> - **UAT Package Version:** `v1.0.0-uat-pkg` (Initial 16 Files) $\longrightarrow$ `v1.0.1-uat-pkg` (Baseline with Defect Log & Backlog) $\longrightarrow$ `v1.1.0-uat-pkg` (Evolved Package Phase 4)  

---

## 1. LATAR BELAKANG & TUJUAN STRATEGIS

### 1.1 Konteks Penangguhan UAT
WorkPulse telah melewati tahapan implementasi penuh dan memasuki pelaksanaan Manual User Acceptance Testing (UAT) di lingkungan *Production-Demo* (`https://dutamedia-workpulse.vercel.app` & Supabase PostgreSQL). 

Hingga tanggal 30 Oktober 2026 pukul 15:20 WIB, pengujian manual yang dipimpin langsung oleh Harry (Acceptance Owner) telah menyelesaikan evaluasi pada:
- **Kelompok 1 s.d. 4 (Autentikasi & Otorisasi):** `TC-AUTH-001` s.d. `TC-AUTH-008` (Seluruhnya **PASS**).
- **Kelompok 5 (Morning Commitment):** `TC-DLYM-005`, `TC-DLYM-006`, `TC-DLYM-003` (**PASS**); `TC-DLYM-001` (**FAIL** akibat cacat formulir tidak terkunci pasca-submit `DEF-001`).
- **Kelompok 6 (Additional Work):** `TC-DLYA-002`, `TC-DLYA-001` (**PASS**).
- **Kelompok 7 (EOD Outcome):** `TC-DLYE-003`, `TC-DLYE-002` (**PASS**); `TC-DLYE-001` (**FAIL** akibat cacat formulir tidak terkunci pasca-submit `DEF-002`).
- **Kelompok 12 (Admin Policy):** `TC-ADMN-002` (**PASS**).
- **Kelompok 8 (Blocker System):** Sedang berlangsung pada `TC-BLKR-001` (Langkah 16 pengisian form di `/blockers/raise`).

Pada checkpoint tersebut, Acceptance Owner memutuskan untuk **menghentikan sementara (SUSPEND)** eksekusi manual UAT guna:
1. Menyelamatkan dan mengunci baseline pengujian ke repositori GitHub.
2. Mengonsolidasikan 2 bug fungsional terkonfirmasi (`DEF-001`, `DEF-002`) serta 44 temuan peningkatan UX, layout, copywriting, dan keselarasan prototipe (`IMP-001` s.d. `IMP-044`).
3. Melakukan remediasi terukur pada aplikasi tanpa merusak integritas baseline pengujian.
4. Memperbarui dokumen dan skenario UAT agar selaras dengan versi perbaikan sebelum pengujian dilanjutkan hingga selesai.

### 1.2 Taksonomi Versi & Aturan Perubahan (Scope & Naming Consistency)
Guna mencegah kerancuan antara evolusi kode aplikasi dan dokumen pengujian:
1. **Application Release Version (`v1.0.0-rcX`):** Hanya berubah jika terdapat kompilasi/perubahan kode program aplikasi pada `frontend/`, `backend/`, skema basis data, atau environment produksi.
2. **UAT Package Version (`v1.X.X-uat-pkg`):** Berubah saat dokumen panduan, skenario uji, test cases, matriks keterlacakan, atau log tata kelola diperbarui. Pembaruan dokumen UAT **TIDAK PERNAH** menaikkan versi rilis aplikasi secara mandiri.
3. **Improvement Cycle ID (`CYCLE-XX`):** Mengidentifikasi iterasi remediasi dan verifikasi terisolasi.
4. **Git Commit SHA:** Hash identitas kriptografis commit Git (misal: `c9fb597`, `5af797c`, `fbccbf0`).
5. **Document Revision:** Revisi individual dokumen (misal: `Rev 1.0`, `Rev 1.1`).

### 1.3 Prinsip Operasional Mutlak
1. **Documentation Before Closure:** Tidak ada subfase, fase, atau tugas yang dianggap selesai tanpa dokumentasi output terstruktur.
2. **Evidence-Based Decisions:** Setiap penetapan status (*PASS, FAIL, FIXED, VERIFIED, CLOSED*) wajib didukung bukti objektif, data log, tangkapan layar, atau hash commit.
3. **Preserve Historical Records:** Riwayat pengujian awal tidak boleh ditimpa atau dihapus. Hasil pra-lifecycle dipertahankan sebagai baseline historis. Retest dan regression dicatat dalam log terpisah.
4. **Single Source of Truth:** Setiap parameter tata kelola memiliki register master tunggal (Phase Register, Decision Log, Change Register, Improvement Cycle Register).
5. **Controlled Changes:** Setiap perubahan kode program atau artefak dokumen wajib terikat pada Finding ID resmi dan disetujui Acceptance Owner.
6. **Acceptance Owner Authority:** Harry adalah pemilik wewenang mutlak atas persetujuan rencana, prioritisasi perbaikan, verifikasi rilis, penerbitan waiver, dan penerimaan akhir (*Final Sign-Off*).

---

## 2. ARSITEKTUR STRUKTUR ARTEFAK TATA KELOLA (FOLDER HIERARCHY)

Seluruh artefak siklus hidup UAT diatur dalam folder dedicated `UAT-Lifecycle/` dengan hierarki terstruktur:

```text
UAT-Lifecycle/
├── 00-Governance/
│   ├── Repository-Baseline-Record.md            [Phase -1 Deliverable] (Committed 5af797c, Rev 1.1)
│   ├── UAT-Phase-Register.csv                  [Master Governance Register]
│   ├── UAT-Decision-Log.md                     [Master Architecture & Rulings Log]
│   ├── UAT-Change-Register.csv                 [Master Code & Document Change Log]
│   ├── UAT-Improvement-Cycle-Register.csv      [Master Improvement Cycle Tracker]
│   ├── UAT-Lifecycle-Management-Plan.md        [Dokumen ini - Master Plan Rev 1.1]
│   └── Post-Baseline-Verification-Report.md    [Laporan Verifikasi Pasca-Baseline]
├── Phase-0-Suspension/
│   ├── UAT-Suspension-Record.md
│   ├── UAT-Execution-Checkpoint.md
│   ├── UAT-Partial-Execution-Register.csv
│   ├── UAT-Evidence-Inventory.md
│   ├── UAT-Artifact-Inventory.csv
│   └── UAT-Suspension-Validation-Report.md
├── Phase-1-Reconciliation/
│   ├── UAT-State-Reconciliation-Report.md
│   ├── UAT-Finding-Consolidation-Register.csv
│   ├── UAT-Traceability-Gap-Register.csv
│   └── UAT-Cross-Artifact-Audit-Report.md
├── Phase-2-Remediation-Planning/
│   ├── UAT-Remediation-Assessment.md
│   ├── UAT-Change-Impact-Matrix.csv
│   ├── UAT-Remediation-Plan.md
│   └── UAT-Remediation-Approval-Register.csv
├── Phase-3-Remediation-Execution/
│   ├── UAT-Remediation-Implementation-Log.csv
│   ├── UAT-Change-Verification-Report.md
│   └── UAT-Remediation-Closure-Report.md
├── Phase-4-Package-Evolution/
│   ├── UAT-Test-Impact-Assessment.csv
│   ├── UAT-Test-Design-Review.md
│   ├── (Updated UAT Test Package v1.1.0-uat-pkg)
│   ├── UAT-Traceability-Update-Report.md
│   ├── UAT-Coverage-Validation-Report.md
│   └── UAT-Documentation-Change-Log.md
├── Phase-5-Revalidation-Regression/
│   ├── UAT-Retest-Plan.csv
│   ├── UAT-Regression-Test-Plan.md
│   ├── UAT-Retest-Execution-Log.csv
│   ├── UAT-Regression-Execution-Log.csv
│   └── UAT-Revalidation-Report.md
├── Phase-6-Resumption-Approval/
│   ├── UAT-Resumption-Readiness-Report.md
│   └── UAT-Resumption-Approval-Record.md
├── Phase-7-Execution-Continuation/
│   ├── UAT-Resumption-Execution-Record.md
│   └── (Updated Master Execution Logs & Progress Trackers)
└── Phase-8-Final-Acceptance/
    ├── UAT-Final-Acceptance-Report.md
    └── UAT-Certificate-of-Acceptance.md
```

---

## 3. MASTER MODEL KETERLACAKAN (END-TO-END TRACEABILITY MODEL)

Sistem tata kelola WorkPulse mempertahankan hubungan keterlacakan ketat multi-arah:

$$\text{FR} \longrightarrow \text{TSC} \longrightarrow \text{TC} \longrightarrow \text{Step} \longrightarrow \text{Evidence} \longrightarrow \text{Finding (DEF/IMP)} \longrightarrow \text{DEC} \longrightarrow \text{CHG} \longrightarrow \text{Build} \longrightarrow \text{Retest} \longrightarrow \text{Regression}$$

Setiap cacat (*defect*) atau usulan perbaikan (*improvement*) harus dapat dilacak mundur hingga ke kebutuhan fungsional asalnya (*Business Requirement*), dan dilacak maju hingga ke commit perbaikan, bukti verifikasi unit/komponen, uji ulang (*retest*), dan uji regresi.

---

## 4. MATRIKS RINCIAN 10 FASE LIFECYCLE MANAGEMENT (VERIF-FIND-007 & 008)

| ID Fase | Nama Fase | Subfase Utama | Output Utama (Deliverables) | Approval Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Phase -1** | Baseline Preservation & GitHub Checkpoint | -1.1 Identifikasi Repo<br>-1.2 Inventaris Working Tree<br>-1.3 Security Inspection<br>-1.4 Verifikasi Integritas<br>-1.5 Commit & Push Baseline<br>-1.6 Verifikasi Remote | `Repository-Baseline-Record.md` | Formal Review Harry atas Commit `c9fb597`, `5af797c`, & `fbccbf0` *(Disetujui Bersyarat pending mitigasi keamanan)* |
| **Phase 0** | UAT Suspension & Execution Preservation | 0.1 Deklarasi Penangguhan Resmi<br>0.2 Capture Kondisi Eksekusi<br>0.3 Penilaian Partial Execution<br>0.4 Preservasi Bukti Uji<br>0.5 Inventarisasi Artefak<br>0.6 Validasi Penangguhan | 1. `UAT-Suspension-Record.md`<br>2. `UAT-Execution-Checkpoint.md`<br>3. `UAT-Partial-Execution-Register.csv`<br>4. `UAT-Evidence-Inventory.md`<br>5. `UAT-Artifact-Inventory.csv`<br>6. `UAT-Suspension-Validation-Report.md` | Harry Approval to enter Phase 1 |
| **Phase 1** | UAT State Reconciliation & Finding Consolidation | 1.1 Rekonsiliasi Log Eksekusi<br>1.2 Rekonsiliasi Defect<br>1.3 Rekonsiliasi Improvement<br>1.4 Rekonsiliasi Keterlacakan<br>1.5 Audit Konsistensi Artefak<br>1.6 Konsolidasi & Klasifikasi Temuan | 1. `UAT-State-Reconciliation-Report.md`<br>2. `UAT-Finding-Consolidation-Register.csv`<br>3. `UAT-Traceability-Gap-Register.csv`<br>4. `UAT-Cross-Artifact-Audit-Report.md` | Harry Sign-Off on Consolidated Findings |
| **Phase 2** | Finding Assessment & Remediation Planning | 2.1 Investigasi Teknis Root Cause<br>2.2 Analisis Dampak Perubahan<br>2.3 Prioritisasi Temuan (P1-P4)<br>2.4 Keputusan Remediasi (DEC)<br>2.5 Penyusunan Remediation Plan | 1. `UAT-Remediation-Assessment.md`<br>2. `UAT-Change-Impact-Matrix.csv`<br>3. `UAT-Remediation-Plan.md`<br>4. `UAT-Remediation-Approval-Register.csv` | Harry Approval of Remediation Plan & Scope |
| **Phase 3** | Product Remediation & Change Verification | 3.1 Persiapan Implementasi<br>3.2 Implementasi Kode Terkendali<br>3.3 Verifikasi Pengembang (Dev Test)<br>3.4 Dokumentasi Perubahan (CHG)<br>3.5 Verifikasi Remediasi | 1. `UAT-Remediation-Implementation-Log.csv`<br>2. `UAT-Change-Verification-Report.md`<br>3. `UAT-Remediation-Closure-Report.md` | Verification Review prior to Package Evolution |
| **Phase 4** | UAT Package Impact Analysis & Evolution | 4.1 Penilaian Dampak Test Case<br>4.2 Review Desain Test Case<br>4.3 Evolusi Skenario Pengujian<br>4.4 Review Data Pengujian<br>4.5 Pembaruan Matriks Traceability<br>4.6 Audit Cakupan (Coverage)<br>4.7 Review Dokumentasi Induk | 1. `UAT-Test-Impact-Assessment.csv`<br>2. `UAT-Test-Design-Review.md`<br>3. Updated UAT Package (`v1.1.0-uat-pkg`)<br>4. `UAT-Traceability-Update-Report.md`<br>5. `UAT-Coverage-Validation-Report.md`<br>6. `UAT-Documentation-Change-Log.md` | Harry Approval of Updated UAT Package |
| **Phase 5** | Revalidation, Retesting & Regression | 5.1 Perencanaan Uji Ulang (Retest)<br>5.2 Perencanaan Uji Regresi<br>5.3 Eksekusi Uji Ulang Cacat<br>5.4 Eksekusi Uji Regresi Dampak<br>5.5 Penanganan Kegagalan Uji<br>5.6 Penutupan Verifikasi | 1. `UAT-Retest-Plan.csv`<br>2. `UAT-Regression-Test-Plan.md`<br>3. `UAT-Retest-Execution-Log.csv`<br>4. `UAT-Regression-Execution-Log.csv`<br>5. `UAT-Revalidation-Report.md` | Verification of Zero Active Defect S1/S2 or Formal Waiver Signed |
| **Phase 6** | UAT Resumption Approval | 6.1 Verifikasi Kesiapan Environment<br>6.2 Kesiapan Dokumen & Test Data<br>6.3 Kontinuitas Eksekusi<br>6.4 Sesi Tinjauan Persetujuan | 1. `UAT-Resumption-Readiness-Report.md`<br>2. `UAT-Resumption-Approval-Record.md` | Formal Resumption Gate signed by Harry |
| **Phase 7** | Controlled UAT Resumption & Execution | 7.1 Restorasi Checkpoint<br>7.2 Validasi Urutan Eksekusi<br>7.3 Eksekusi Manual Terkendali<br>7.4 Penangkapan Temuan Kontinu<br>7.5 Siklus Improvement Berkelanjutan | 1. Updated Master Execution Log<br>2. Updated Progress Tracker<br>3. Updated Finding Registers<br>4. `UAT-Resumption-Execution-Record.md`<br>5. Cycle Closure Records (jika berlaku) | Milestone Completion Sign-Offs |
| **Phase 8** | UAT Completion, Final Review & Acceptance Decision | 8.1 Verifikasi Selesai Seluruh Kasus Uji<br>8.2 Audit Akhir Cakupan Kebutuhan<br>8.3 Evaluasi Status Akhir Cacat<br>8.4 Penyusunan Final UAT Report<br>8.5 Sidang Evaluasi & Keputusan Rilis | 1. `UAT-Final-Acceptance-Report.md`<br>2. `UAT-Certificate-of-Acceptance.md` | Final Product Acceptance Decision by Harry |

---

## 5. SPESIFIKASI OPERASIONAL PER FASE

### PHASE -1 — Baseline Preservation & GitHub Checkpoint (STATUS: COMPLETED & VERIFIED)
- **Tujuan:** Menyelamatkan seluruh status pekerjaan, modifikasi file UAT, defect log, dan improvement backlog ke GitHub remote repository secara aman dan terverifikasi sebelum lifecycle dimulai.
- **Hasil Terverifikasi:**
  - Remote: `https://github.com/harrymx1/Dutamedia-WorkPulse.git`
  - Branch: `main`
  - Baseline Commit: `c9fb597135d7f7e951f9daa9eb33e33b7ef4df7b` (`c9fb597`)
  - Governance Deliverable Commit: `5af797c25bf98b54e8c8459018603d93b9ceabba` (`5af797c`)
  - Master Governance Commit: `fbccbf0c5f27fa2691debfe19db1e982be424ba5` (`fbccbf0`)
  - Dokumen Bukti: `UAT-Lifecycle/00-Governance/Repository-Baseline-Record.md`.

### PHASE 0 — UAT Suspension & Execution Preservation (STATUS: PLANNED)
- **Tujuan:** Mendokumentasikan status penangguhan UAT secara formal, mencatat posisi checkpoint pengujian manual secara presisi pada `TC-BLKR-001` (Langkah 16), memetakan seluruh eksekusi parsial, dan mengamankan bukti pengujian tanpa mengubah status eksekusi secara sepihak.
- **Entry Criteria:** Phase -1 disetujui Harry dan resolusi keamanan selesai.
- **Subfase:**
  - *Subphase 0.1:* Deklarasi Penangguhan Formal (`UAT-Suspension-Record.md`).
  - *Subphase 0.2:* Capture Checkpoint Eksekusi (`UAT-Execution-Checkpoint.md`).
  - *Subphase 0.3:* Penilaian Status Parsial (`UAT-Partial-Execution-Register.csv`).
  - *Subphase 0.4:* Inventarisasi Bukti Pengujian (`UAT-Evidence-Inventory.md`).
  - *Subphase 0.5:* Audit Integritas Artefak UAT (`UAT-Artifact-Inventory.csv`).
  - *Subphase 0.6:* Validasi Penangguhan (`UAT-Suspension-Validation-Report.md`).
- **Exit Criteria (VERIF-FIND-007 Clarified):**
  - Seluruh status checkpoint eksekusi manual terkunci pada `TC-BLKR-001` Langkah 16.
  - Seluruh bukti tangkapan layar, log parsial, dan 18 artefak UAT terinventarisasi utuh.
  - **Fase ini TIDAK mewajibkan penyelesaian seluruh test case**. Tujuannya adalah mengamankan kondisi penghentian pengujian secara sempurna.

### PHASE 1 — UAT State Reconciliation & Finding Consolidation (STATUS: NOT STARTED)
- **Tujuan:** Menyatukan dan merekonsiliasi seluruh rekaman pengujian dari checklist, execution log, test cases, defect log, dan improvement backlog ke dalam daftar konsolidasi master tunggal.
- **Entry Criteria:** Phase 0 selesai dan disetujui Harry.
- **Subfase:**
  - *Subphase 1.1:* Rekonsiliasi Log Eksekusi.
  - *Subphase 1.2:* Rekonsiliasi Defect (`DEF-001`, `DEF-002`).
  - *Subphase 1.3:* Rekonsiliasi Kandidat Improvement (`IMP-001` s.d. `IMP-044` sebagai **Candidate Scope**).
  - *Subphase 1.4:* Rekonsiliasi Matriks Keterlacakan Kebutuhan.
  - *Subphase 1.5:* Audit Konsistensi Antar-Artefak.
  - *Subphase 1.6:* Konsolidasi & Klasifikasi Temuan Master.
- **Exit Criteria:** Daftar temuan terpadu terverifikasi tanpa duplikasi, inkonsistensi, atau informasi yang hilang.

### PHASE 2 — Finding Assessment & Remediation Planning (STATUS: NOT STARTED)
- **Tujuan:** Menganalisis akar masalah teknis, menilai dampak perubahan arsitektural/UI/UX, menetapkan prioritas kerja (P1-P4), menerbitkan Architecture Rulings (DEC), dan menyusun jadwal rencana remediasi aplikasi.
- **Ketentuan Khusus (VERIF-FIND-002):** Sebanyak 44 item improvement berstatus kandidat ditapis dan dipilih oleh Acceptance Owner. Hanya item yang secara eksplisit disetujui Harry yang berhak masuk ke ruang lingkup implementasi `CYCLE-01`.
- **Entry Criteria:** Phase 1 selesai dan disetujui Harry.
- **Subfase:**
  - *Subphase 2.1:* Investigasi Teknis Root Cause (komponen Vue, store, API backend, RLS DB).
  - *Subphase 2.2:* Analisis Dampak Komponen dan Dependensi (`UAT-Change-Impact-Matrix.csv`).
  - *Subphase 2.3:* Prioritisasi Temuan Berdasarkan Keparahan & Nilai Bisnis.
  - *Subphase 2.4:* Sidang Keputusan Remediasi Acceptance Owner (`UAT-Decision-Log.md`).
  - *Subphase 2.5:* Penyusunan Master Remediation Plan (`UAT-Remediation-Plan.md`).
- **Exit Criteria:** Harry menandatangani ruang lingkup dan rencana perbaikan produk pada `UAT-Remediation-Approval-Register.csv`.

### PHASE 3 — Product Remediation & Change Verification (STATUS: NOT STARTED)
- **Tujuan:** Mengeksekusi perbaikan kode program pada frontend dan/atau backend sesuai Finding ID yang disetujui Harry, melakukan developer verification, dan mendokumentasikan setiap perubahan ke Change Register.
- **Ketentuan Khusus:** Co-Pilot dilarang keras mengimplementasikan item improvement apa pun di luar ruang lingkup yang telah disahkan pada Phase 2.
- **Entry Criteria:** Phase 2 selesai dan disetujui Harry.
- **Subfase:**
  - *Subphase 3.1:* Persiapan Branch Kerja / Lingkungan Pengembangan.
  - *Subphase 3.2:* Implementasi Perbaikan Terkendali (Sesuai ID Temuan Disetujui).
  - *Subphase 3.3:* Developer Testing (Unit test, linting, build check, console audit).
  - *Subphase 3.4:* Pencatatan Perubahan Kode (`UAT-Change-Register.csv`).
  - *Subphase 3.5:* Verifikasi Remediasi Selesai.
- **Exit Criteria:** Seluruh defect terselesaikan di level kode, build lokal sukses, tidak ada regresi sintaksis/runtime baru.

### PHASE 4 — UAT Package Impact Analysis & Evolution (STATUS: NOT STARTED)
- **Tujuan:** Menyelaraskan seluruh dokumen, test cases, skenario uji, data uji, dan matriks keterlacakan UAT dengan versi aplikasi yang telah diremediasi.
- **Entry Criteria:** Phase 3 selesai dan terverifikasi.
- **Subfase:**
  - *Subphase 4.1:* Penilaian Dampak Test Case terhadap Perubahan UI/Alur.
  - *Subphase 4.2:* Review Desain Kasus Uji.
  - *Subphase 4.3:* Pembaruan & Penambahan Skenario Pengujian Baru.
  - *Subphase 4.4:* Penyelarasan Akun & Data Uji (`UAT-Test-Data-Matrix.csv`).
  - *Subphase 4.5:* Pembaruan Matriks Keterlacakan (`UAT-Requirement-Traceability-Matrix.csv`).
  - *Subphase 4.6:* Validasi Cakupan Kebutuhan Sistem.
  - *Subphase 4.7:* Penerbitan Versi Paket UAT Baru (`v1.1.0-uat-pkg`).
- **Deliverables Resmi (Lengkap 6 File):**
  1. `UAT-Test-Impact-Assessment.csv`
  2. `UAT-Test-Design-Review.md`
  3. Updated UAT Test Package (`v1.1.0-uat-pkg`)
  4. `UAT-Traceability-Update-Report.md`
  5. `UAT-Coverage-Validation-Report.md`
  6. `UAT-Documentation-Change-Log.md`
- **Exit Criteria:** Paket dokumen UAT 100% konsisten dengan implementasi aplikasi terbaru.

### PHASE 5 — Revalidation, Retesting & Regression (STATUS: NOT STARTED)
- **Tujuan:** Menguji ulang secara spesifik seluruh bug yang diperbaiki (*Defect Retesting*) dan menjalankan uji regresi pada area yang berpotensi terdampak oleh perubahan.
- **Entry Criteria:** Phase 4 selesai dan disetujui Harry.
- **Subfase:**
  - *Subphase 5.1:* Perencanaan Uji Ulang (Retest) (`UAT-Retest-Plan.csv`).
  - *Subphase 5.2:* Perencanaan Uji Regresi (`UAT-Regression-Test-Plan.md`).
  - *Subphase 5.3:* Eksekusi Uji Ulang Defect (`UAT-Retest-Execution-Log.csv`).
  - *Subphase 5.4:* Eksekusi Uji Regresi (`UAT-Regression-Execution-Log.csv`).
  - *Subphase 5.5:* Penanganan Kegagalan Retest (jika ada).
  - *Subphase 5.6:* Penutupan Verifikasi (`UAT-Revalidation-Report.md`).
- **Protokol Pengecualian Formal Acceptance Owner (VERIF-FIND-006 Waiver Protocol):**
  - **Kriteria Baku:** Nol cacat aktif Severity 1 (Critical) & Severity 2 (Major); uji regresi lulus 100%.
  - **Mekanisme Waiver:** Apabila terdapat ketidaksesuaian Severity 3 (Minor) atau isu kosmetik yang secara operasional dapat ditoleransi dan disetujui oleh Harry untuk ditangguhkan (*deferred*), maka klausul *Formal Exception Waiver* dapat diterbitkan.
  - **Persyaratan Wajib Waiver:**
    1. Registrasi *Waiver ID* resmi pada Decision Log.
    2. Analisis dampak operasional dan alasan penangguhan tertulis.
    3. Pernyataan penerimaan risiko sisa (*residual risk acceptance*) yang ditandatangani Harry.
    4. Tiket backlog pelacakan ke siklus improvement berikutnya.
- **Preservasi Catatan Historis:** Hasil retest dan regresi dicatat pada file log terpisah tanpa menimpa atau mengubah `UAT-Execution-Log.csv` awal.
- **Exit Criteria:** Seluruh defect terselesaikan atau memiliki waiver formal yang sah.

### PHASE 6 — UAT Resumption Approval (STATUS: NOT STARTED)
- **Tujuan:** Memeriksa kesiapan menyeluruh lingkungan pengujian, sinkronisasi data akun, stabilitas backend/DB, dan kelengkapan dokumen sebelum Harry melanjutkan UAT manual.
- **Entry Criteria:** Phase 5 lulus revalidasi dan regresi.
- **Subfase:**
  - *Subphase 6.1:* Audit Kesiapan Lingkungan (*Environment Readiness*).
  - *Subphase 6.2:* Audit Kesiapan Dokumen UAT (*Documentation Readiness*).
  - *Subphase 6.3:* Verifikasi Integritas Data & Akun Pengujian.
  - *Subphase 6.4:* Penandatanganan Formal Resume UAT (`UAT-Resumption-Approval-Record.md`).
- **Exit Criteria:** Harry menerbitkan persetujuan formal untuk membuka kembali sesi UAT manual.

### PHASE 7 — Controlled UAT Resumption & Execution (STATUS: NOT STARTED)
- **Tujuan:** Melanjutkan eksekusi pengujian manual oleh Harry dari checkpoint terakhir (`TC-BLKR-001` Langkah 16) hingga seluruh 15 kelompok skenario pengujian tuntas.
- **Entry Criteria:** Phase 6 formal sign-off diterbitkan oleh Harry.
- **Subfase:**
  - *Subphase 7.1:* Restorasi State Checkpoint Pengujian.
  - *Subphase 7.2:* Validasi Urutan Langkah Lanjutan.
  - *Subphase 7.3:* Eksekusi Manual Terkendali Langkah-per-Langkah bersama Co-Pilot.
  - *Subphase 7.4:* Pencatatan Temuan Kontinu (jika ditemukan observasi baru).
  - *Subphase 7.5:* Penutupan Siklus Pengujian.
- **Deliverables Resmi (Lengkap 5 File):**
  1. Updated Master Execution Log (`UAT-Execution-Log.csv`)
  2. Updated Progress Tracker (`UAT-Progress-Tracker.md`)
  3. Updated Finding Registers (`UAT-Defect-Log.md` & `UAT-Improvement-Backlog.md`)
  4. `UAT-Resumption-Execution-Record.md`
  5. Cycle Closure Records (jika siklus ditutup).
- **Exit Criteria:** Seluruh 15 kelompok kasus uji (mencakup Modul Blocker, Manager Pulse, Employee Correction, Admin Governance, dan Non-Functional) dieksekusi tuntas dengan bukti tangkapan layar.

### PHASE 8 — UAT Completion, Final Review & Acceptance Decision (STATUS: NOT STARTED)
- **Tujuan:** Menerbitkan laporan akhir UAT komprehensif, mengevaluasi seluruh metrik penerimaan, dan mendukung Acceptance Owner dalam menetapkan keputusan rilis produk WorkPulse.
- **Entry Criteria:** Phase 7 selesai 100%.
- **Subfase:**
  - *Subphase 8.1:* Rekapitulasi Akhir Hasil Eksekusi UAT.
  - *Subphase 8.2:* Audit Keterpenuhan Kebutuhan Fungsional (FR-01 s.d. FR-55).
  - *Subphase 8.3:* Verifikasi Status Akhir Cacat & Residual Risk.
  - *Subphase 8.4:* Penyusunan Dokumen `UAT-Final-Acceptance-Report.md`.
  - *Subphase 8.5:* Penerbitan Formal `UAT-Certificate-of-Acceptance.md` oleh Harry.
- **Exit Criteria:** Keputusan resmi Acceptance Owner (*ACCEPTED / REJECTED / CONDITIONALLY ACCEPTED*) diterbitkan secara tertulis.

---

## 6. PROTOKOL KOMUNIKASI & INTERAKSI (ONE SUBPHASE AT A TIME)

1. **Strict Gate Enforcement:** Co-Pilot dilarang keras melompati subfase atau mengeksekusi fase berikutnya tanpa validasi eksplisit dan instruksi dari Harry.
2. **Interactive Sign-Offs:** Pada setiap akhir fase, Co-Pilot menyajikan laporan ringkas, status kriteria keluar (*exit criteria*), dan meminta persetujuan tertulis Harry sebelum melanjutkan.
3. **No False Completion:** Tidak ada klaim penyelesaian yang diperbolehkan tanpa verifikasi artefak dan bukti nyata.
4. **Preservasi Catatan Diskusi:** Setiap umpan balik, instruksi spesifik, dan tangkapan layar yang dikirimkan Harry dicatat secara kronologis dalam master registers.

---

## 7. RENCANA KERJA TAHAP SEGERA (IMMEDIATE ACTION PLAN)

Status saat ini:
1. **Preservasi Baseline (Phase -1):** Telah selesai secara teknis pada commit `c9fb597`, `5af797c`, dan `fbccbf0`.
2. **Audit & Penyelarasan Tata Kelola:** Seluruh temuan tata kelola `VERIF-FIND-002` sampai `VERIF-FIND-008` telah dikoreksi dan disinkronkan ke dalam seluruh dokumen master governance.
3. **Mitigasi Keamanan (`VERIF-FIND-001`):** Dalam penanganan langsung oleh Harry (perubahan visibilitas repositori menjadi Private dan rotasi kredensial live demo).
4. **Gerbang Masuk Phase 0:** Menunggu konfirmasi penyelesaian mitigasi keamanan dan instruksi eksplisit Harry sebelum Phase 0 dimulai.

---
*Dokumen ini diperbarui secara resmi oleh UAT Co-Pilot berdasarkan otorisasi formal Acceptance Owner pada keputusan DEC-003-UAT.*
