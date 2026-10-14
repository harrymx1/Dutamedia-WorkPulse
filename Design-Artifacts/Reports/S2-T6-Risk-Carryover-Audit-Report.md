# S2-T6 Risk & Carry-over Audit Report
## WorkPulse — Daily Accountability & Blocker Log System

| Document Metadata | Value |
|---|---|
| Document Title | S2-T6 Risk & Carry-over Audit Report |
| Audit Phase | Stage S2 — Independent Audit & Reconciliation (Task S2-T6) |
| Author | Independent Audit & Governance Agent |
| Date | 6 Oktober 2026 |
| Target Release | S2 Gate Completion / S3 Readiness |
| Audit Mode | Strict Governance Audit & Administrative Reconciliation (Zero Code Remediation) |
| Final S2-T6 Verdict | **PASS WITH CARRY-OVER — NON-BLOCKING** |

---

## 1. Audit Objective

Laporan ini merupakan hasil audit tata kelola (*governance audit*) independen menyeluruh untuk **S2-T6 — Risk & Carry-over Audit** pada sistem WorkPulse. Tujuan utama audit ini adalah:
1. Menginventarisasi dan merekonsiliasi seluruh risiko (*risks*), keterbatasan teknis (*known limitations*), kesenjangan bukti (*evidence gaps*), risiko yang diterima (*accepted risks*), item yang ditangguhkan (*deferred items*), dan *carry-over* yang berasal dari Tahap S1 dan S2.
2. Memastikan tidak ada temuan (*findings*) yang hilang, tidak terlacak, atau ditutup tanpa bukti (*evidence*) yang sah.
3. Memastikan setiap risiko yang diterima (*accepted risk*) didukung secara otoritatif oleh Architectural Decision Record (ADR) dan justifikasi bisnis yang valid.
4. Menegakkan pemisahan tegas antara cacat implementasi (*implementation defect*), kesenjangan bukti (*evidence gap*), kesenjangan dokumentasi (*documentation gap*), dan batasan desain yang disengaja (*design limitation*).
5. Memverifikasi bahwa boundary penutupan administratif **S2-T4 (Scheduled Jobs, Notifications, Audit, States)** dan **S2-T5 (UI/Page/Flow Inventory)** tetap terkunci utuh (*strictly locked*) tanpa mutasi substantif.
6. Menyediakan matriks alokasi fase tujuan (*phase destination matrix*) yang transparan dan dapat ditindaklanjuti untuk Fase S3, S4, S5, dan pasca-MVP.

---

## 2. Sources Audited

Audit dilakukan dengan memeriksa dan mengomparasikan dokumen tata kelola, spesifikasi produk, catatan arsitektur, register temuan, dan seluruh laporan audit sebelumnya:

### 2.1 Governance & Plan Baseline
- `WorkPulse_Development_Framework(3).md`
- Rencana Testing, Perbaikan, Stabilisasi & Rilis WorkPulse — Versi Final

### 2.2 Product & Architecture Baseline
- `Design-Artifacts/01-PDD.md` (Product Definition Document v1.1)
- `Design-Artifacts/02-PRD.md` (Product Requirement Document v1.1)
- `Design-Artifacts/03-UI-UX Spec & Flow Document.md` (UI/UX Specification v1.2)
- `Design-Artifacts/04-DESIGN.md` (Design System Specification v1.1)
- `Design-Artifacts/05-SAD.md` (System Architecture Design v1.0)
- `Design-Artifacts/06-Product Backlog.md` (Product Backlog Epic & Stories v1.0)
- `Design-Artifacts/08-ADR.md` (ADR-001 s.d. ADR-018 — Seluruh 18 ADR diverifikasi eksis)
- `Design-Artifacts/09-Known-Limitations.md` (KL-01 s.d. KL-10 — Seluruh 10 KL diverifikasi eksis)

### 2.3 Audit Register Baseline
- `Design-Artifacts/10-S2-Audit-Findings-Register.md` (Central S2 Findings Register — 30 findings)
- `Design-Artifacts/11-S2-T1-Traceability-Matrix.md` (100 requirements)
- `Design-Artifacts/12-S2-T1-Gap-Register.md` (6 gaps)
- `Design-Artifacts/13-S2-T2-Forbidden-Feature-Audit.md` (30 forbidden features)
- `Design-Artifacts/14-S2-T3-Endpoint-Reconciliation.md` (65 SAD vs 70 NestJS endpoints)
- `Design-Artifacts/15-S2-T4-Scheduled-Jobs-Notification-State-Audit.md` (10 jobs, 13 triggers, 44 audit actions, 7 state machines)

### 2.4 S1 & S2 Audit Reports
- `Design-Artifacts/Reports/S2-T1-Traceability-Audit-Report.md`
- `Design-Artifacts/Reports/S2-T2-Forbidden-Feature-Audit-Report.md`
- `Design-Artifacts/Reports/S2-T3-Endpoint-Reconciliation-Report.md`
- `Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`
- `Design-Artifacts/Reports/S2-T3-Remediation-Report.md`
- `Design-Artifacts/Reports/S2-T4-Audit-Report.md`
- `Design-Artifacts/Reports/S2-T4-Remediation-Report.md`
- `Design-Artifacts/Reports/S2-T4-Remediation-Round-2-Report.md`
- `Design-Artifacts/Reports/S2-T4-Final-Runtime-Evidence-Verification.md`
- `Design-Artifacts/Reports/S2-T4-Remediation-Round-3-Report.md`
- `Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`
- `Design-Artifacts/Reports/S2-T4-Independent-Verification-Final.md`
- `Design-Artifacts/Reports/S2-T4-Closure.md`
- `Design-Artifacts/Reports/S2-T5-UI-Page-Flow-Audit-Report.md`
- `Design-Artifacts/Reports/S2-T5-Independent-Verification.md`
- `Design-Artifacts/Reports/S2-T5-Closure.md`

---

## 3. Current S2 Baseline Status

Hingga penyelesaian Task S2-T5, status pencapaian gate S2 berada pada kondisi berikut:
1. **S2-T1 (Traceability Audit)**: 100/100 persyaratan (50 FR, 20 AC, 18 BR, 12 NFR) terpetakan dengan status 94 Verified, 6 Partially Verified / Non-Functional Targets.
2. **S2-T2 (Forbidden Feature Absence)**: Seluruh 30 perilaku terlarang (FF-01 s.d. FF-30) terbukti nihil di kode produksi.
3. **S2-T3 (Endpoint Catalog Reconciliation)**: 65 endpoint SAD §10 direkonsiliasi penuh terhadap 70 rute NestJS aktual.
4. **S2-T4 (Scheduled Jobs, Notifications, Audit, States)**: Ditutup resmi (**CLOSED / VERIFIED**) dengan bukti runtime PostgreSQL 18.4 riil; boundary terkunci.
5. **S2-T5 (UI/Page/Flow Inventory)**: Ditutup resmi (**CLOSED — VERIFIED WITH GAPS / NON-BLOCKING**) dengan 23/23 halaman dan 14/14 flow terverifikasi penuh secara independen. Satu carry-over resmi (`S2-T5-EVID-01`) dialokasikan ke Fase S3.
6. **Integritas Test Suite**: 639 backend tests passed (100%), 91 frontend tests passed (100%), build lulus (Exit code 0).

---

## 4. Carry-over Inventory

Tabel inventarisasi seluruh item *carry-over*, risiko, keterbatasan, dan target validasi terencana:

| ID | Sumber Asal | Kategori Rekonsiliasi | Ringkasan Item | Current Status | Bukti Terkait | Destination Kanonikal | Verifikasi yang Dibutuhkan |
|---|---|---|---|---|---|---|---|
| **CO-01** | S2-T5 (`S2-T5-EVID-01`) | Open Evidence Gap | Verifikasi visual runtime responsif multi-viewport (Desktop, Tablet, Mobile) pada browser nyata. | **OPEN — CARRYOVER TO S3** | `frontend/tests/` (menggunakan `happy-dom`); belum ada visual screenshot layout. | **Stage S3** (E2E & Responsive Visual Testing) | Eksekusi Playwright browser runner lintas 3 resolusi (1280px, 768px, 375px) pada 12 halaman utama. |
| **CO-02** | S2-T1 (`GAP-05` / PRD AC-17, NFR-01) | Planned Validation Activity | Pengukuran empiris waktu pengisian Morning & EOD Check-in ($\le$ 3 menit) oleh pengguna manusia. | **PLANNED VALIDATION — S3/S5** | Form telah distreamline dengan chip dan prompt hint; belum ada data stopwatch pengguna riil. | **Stage S3 / S5** (User Acceptance Testing) | Uji coba stopwatch pengguna manusia pada sesi UAT terukur. |
| **CO-03** | S2-T1 (`GAP-06` / PRD NFR-03) | Planned Performance Benchmark | Pengujian beban konkurensi multi-user waktu respons API (< 2 detik) pada 30–60 pengguna aktif. | **PLANNED BENCHMARK — S3** | Optimasi indeks komposit Prisma; test terisolasi sub-100ms; belum ada multi-user load test. | **Stage S3** (SIT & Performance Benchmarking) | Uji beban multi-user (k6/artillery) simulasi 30–60 user konkuren. |
| **CO-04** | S2-T1 / S2-T4 (`S2-PERF-FR28-1`, KL-10) | Accepted Operational Risk | Risiko starvasi batch reminder jika karyawan aktif yang belum submit > 200 user. | **ACCEPTED RISK / ADR-015** | `DailyAccountabilityService:1385`, `SchedulerService:318-348`, ADR-015, KL-10. | **Post-MVP Backlog** (SAD §23.2 / KL-10) | Refactor upstream parameter exclusion saat skala organisasi melampaui 150 user. |
| **CO-05** | S1-T1 / S2-T2 / SAD §12.4 (KL-03, KL-08) | Accepted Design Constraint | Browser Push Notification pengiriman aktual di-stub pada rilis MVP. | **CLOSED — ACCEPTED DESIGN CONSTRAINT (MVP STUB)** | `browser-push.service.ts:15-32` (`stubbed: true`), SAD §12.4, KL-03, KL-08. | **Post-MVP Backlog** (Web Push Roadmap) | Implementasi VAPID, Service Worker, dan Browser Push subscription store. |
| **CO-06** | S1-T1 (KL-08 §4 / PRD US-15) | Open Architectural Decision | Parameter `scope: 'Company'` pada `ProjectRiskPage.vue` di-strip oleh backend pipe; server menegakkan filter user. | **OPEN — ARCHITECTURAL DECISION** | `ProjectRiskPage.vue:187`, `QueryDailyRecordsDto`, SAD §8.11, KL-08. | **Post-MVP Backlog** (Feature Enhancement) | Keputusan arsitektur terkait endpoint khusus PM Project Scope lintas tim. |
| **CO-07** | SAD §4.5, §21.6 (KL-01) | Known Limitation / Tech Debt | Skalabilitas memori backup programatik `generateSqlDump()` pada akumulasi tabel audit_logs. | **KNOWN LIMITATION — ACCEPTED FOR MVP** | `database-backup.service.ts`, SAD §21.6, KL-01. | **Post-MVP Backlog** (Infrastructure Roadmap) | Refactoring ke cursor-based batching dan streaming gzip pipeline ke object storage. |
| **CO-08** | SAD §6.3, §6.4 (KL-02) | Technical Debt | Mutasi langsung `tx.commitment.update()` pada `CorrectionRequestService` di dalam transaksi. | **CLOSED — ACCEPTED TECHNICAL DEBT** | `correction-request.service.ts`, KL-02. | **Post-MVP Backlog** (Modular Refactoring) | Delegasi mutasi melalui helper method `DailyAccountabilityService.updateCommitmentInTx()`. |
| **CO-09** | SAD §9.8, PDD §8 (`S2-T4-STATE-01`) | Preserved Design Limitation | Keterbatasan jalur koreksi Additional Work pasca EOD (koreksi hanya untuk Morning Commitment). | **CLOSED — PRESERVED (DESIGN LIMITATION)** | `correction-request.service.ts`, SAD §9.8, PDD §8, Open Item §23.2. | **Post-MVP Backlog** (SAD §23.2) | Evaluasi kebutuhan bisnis apakah Additional Work memerlukan alur sanggah formal pasca-MVP. |
| **CO-10** | SAD §16.4 (`S2-T5-UX-01`) | Acceptable MVP Limitation | Tombol topbar `/team` desktop tidak menampilkan shortcut langsung untuk role PM (akses via route tetap diizinkan). | **CLOSED — ACCEPTABLE MVP LIMITATION** | `App.vue:31-38`, `router/index.ts:61`. | **Post-S2** (UX Backlog) | Penambahan shortcut tautan adaptif pada header jika diinginkan. |
| **CO-11** | UI/UX Spec §3, §4 (`S2-T5-DOC-01`) | Historical Documentation Gap | Konsolidasi 23 spesifikasi halaman ke dalam 16 komponen rute SPA + tabs + modals. | **CLOSED — DOCUMENTATION RECONCILIATION** | `router/index.ts`, `pages/`, UI/UX Spec §4.22. | **Documentation Cycle** | Pembaruan catatan arsitektur frontend pada siklus dokumentasi berikutnya (No code change). |

---

## 5. A-Series Findings (Evidence & Verification Carry-overs)

### A1 — Unresolved Evidence Gaps
- **Status Evaluasi**: Ditemukan 1 evidence gap teknis utama dari S2-T5: `S2-T5-EVID-01` (Responsive Multi-Viewport Usability).
- **Karakteristik**: Ini murni merupakan **Evidence Gap**, bukan Implementation Defect. Komponen Vue menggunakan token dan grid Vuetify 3 yang secara kode telah mendukung layout responsif, namun pembuktian visual render pixel belum dilakukan pada lingkungan browser headless/riil.
- **Tindakan**: Status dipertahankan **OPEN — CARRYOVER TO S3**. Dilarang keras menutup status ini sebagai Verified sebelum uji Playwright multi-viewport dijalankan di S3.

### A2 — Browser Push Permanent MVP Stub
- **Status Evaluasi**: Terverifikasi bahwa `BrowserPushService` (`backend/src/modules/notification/services/browser-push.service.ts`) mengimplementasikan stub resmi yang mengembalikan `{ success: true, stubbed: true }`.
- **Integritas Dokumen**:
  - SAD §12.4 secara eksplisit menyatakan bahwa delivery Browser Push nyata ditangguhkan pada rilis MVP, sementara row `Notification` dengan channel `BrowserPush` tetap dicatat ke basis data.
  - KL-03 mengonfirmasi tab antarmuka admin bersifat *Read-Only Informational Matrix* (tidak ada tombol toggle aktif yang menipu pengguna).
  - KL-08 §2.3 mencatat stub ini sebagai *Legitimate Test Double / Design Constraint*.
- **Kesimpulan**: Status stub terdokumentasi secara sah, tidak ada klaim palsu bahwa browser push aktif di produksi, dan tidak diperlukan perubahan kode.

### A3 — Evidence Deletion & Evidence Integrity
- **Status Evaluasi**: Seluruh artefak bukti pengujian dan audit dari S1 hingga S2-T5 diperiksa:
  - Tidak ditemukan bukti yang hilang (*zero missing evidence*).
  - Seluruh laporan audit di `Design-Artifacts/Reports/` dapat diakses dan konsisten dengan commit tree.
  - Log verifikasi runtime PostgreSQL 18.4 (`pg_verify.log`) dan script gate verifikasi (`verify-real-postgresql-gate.ts`) terdokumentasi utuh.
  - Tidak ada klaim audit yang melampaui bukti yang tersedia (klaim responsif multi-viewport telah diturunkan dari Pass menjadi Evidence Gap pada S2-T5 Independent Verification).

### A4 — Escalation Chain Verification
- **Status Evaluasi**: Rantai eskalasi diperiksa secara analitis:
  - *Definisi & Pemicu*: Auto-eskalasi blocker setelah melewati SLA (4h untuk Critical/High, 8h untuk Medium/Low) didefinisikan pada SAD §11.2 dan diuji pada `SchedulerService`.
  - *Wewenang & Resolusi*: `BlockerOwnerResolverService` mengalihkan eskalasi ke `NextLevelManager`, `ReporterManager`, atau `HRGA_Management` (16 unit tests lulus).
  - *Jejak Audit & Notifikasi*: Aksi `BLOCKER_AUTO_ESCALATED` dengan `actorUserId: null` terbukti tersimpan secara fisik di PostgreSQL nyata (S2-T4-AUDIT-01).
  - *Batas Bukti*: Pengujian integrasi multi-step end-to-end yang mensimulasikan perjalanan waktu riil (*real-time multi-day lifecycle*) dialokasikan untuk verifikasi skenario alur kerja sistem di **Fase S3**.

---

## 6. B-Series Findings (Functionality, Risks & Limitations)

### B1 — Deferred / Incomplete Functionality
- **Browser Push Delivery**: Ditunda ke pasca-MVP (SAD §12.4).
- **PM Cross-Team Project Scope Query**: Ditunda untuk keputusan arsitektur pasca-MVP (KL-08 §4).
- **Koreksi Additional Work Pasca EOD**: Ditunda sebagai batasan produk yang disengaja (SAD §9.8, ADR-001).
Semua item memiliki penanggung jawab dan alokasi roadmap yang jelas; tidak ada fitur terbengkalai tanpa keputusan.

### B2 — Accepted Risks
- **`S2-PERF-FR28-1` (Starvasi Batch Reminder > 200 User)**:
  - *Rasional*: Skala operasional Dutamedia adalah 30–60 pengguna (PDD §3, SAD §2.2). Starvasi secara matematis mustahil terjadi pada deployment MVP.
  - *Dasar Otoritas*: Diterima secara resmi oleh Human Authority melalui **ADR-015** dan dicatat dalam **KL-10**.
  - *Kondisi Evaluasi Ulang*: Ketika jumlah karyawan aktif melampaui 150 user.

### B3 — Known Limitations
- Seluruh 10 Known Limitations (`KL-01` s.d. `KL-10`) pada `Design-Artifacts/09-Known-Limitations.md` terbukti aktif, akurat, dan mencerminkan arsitektur sistem yang sebenarnya.
- Tidak ada *known limitation* yang menyamarkan *implementation defect* kritis.

---

## 7. C-Series Findings (Governance & Consistency)

### C1 — Documentation Consistency
- Komparasi silang antara PDD, PRD, SAD, Product Backlog, ADR, KL, Findings Register, dan Laporan Audit membuktikan konsistensi penuh:
  - Seluruh status finding di register selaras dengan kesimpulan laporan closure S2-T4 dan S2-T5.
  - Istilah teknis domain konsisten: `On-Time`, `Late`, `No Submission`, `GREEN`, `AMBER`, `RED`, `Open`, `Resolved`, `Closed`, `Accepted Risk`.
  - Tidak ditemukan keputusan arsitektural yang saling bertentangan (*zero contradictory decisions*).

### C2 — Status Consistency
- Seluruh 30 finding pada `Design-Artifacts/10-S2-Audit-Findings-Register.md` menggunakan kosakata status yang baku dan konsisten:
  - 25 finding: `VERIFIED` / `CLOSED`
  - 1 finding: `CLOSED — PRESERVED (DESIGN LIMITATION)` (`S2-T4-STATE-01`)
  - 1 finding: `CLOSED — DOCUMENTATION RECONCILIATION` (`S2-T5-DOC-01`)
  - 1 finding: `CLOSED — ACCEPTABLE MVP LIMITATION` (`S2-T5-UX-01`)
  - 1 finding: `ACCEPTED RISK / ADR` (`S2-PERF-FR28-1`)
  - 1 finding: `OPEN — CARRYOVER TO S3` (`S2-T5-EVID-01`)
- Tidak ada status yang menggantung atau ambigu.

### C3 — Traceability Chain
- Setiap carry-over yang belum selesai memiliki rantai keterlacakan utuh:
  $$\text{Finding/Gap ID} \longrightarrow \text{Evidence Base} \longrightarrow \text{Governance Decision} \longrightarrow \text{Target Phase} \longrightarrow \text{Verification Requirement}$$
- Tidak ada *broken link* dalam siklus penelusuran tata kelola.

### C4 — Phase Ownership
- Alokasi item ke fase berikutnya dilakukan berdasarkan sifat alami pengujian, bukan untuk menyembunyikan masalah dari S2:
  - **S3 (Testing & Verification)**: Pengujian browser visual multi-viewport (`CO-01`), pengukuran beban konkurensi (`CO-03`), dan verifikasi E2E workflow.
  - **S5 (UAT & Go-Live)**: Pengukuran stopwatch durasi pengisian check-in pengguna manusia (`CO-02`).
  - **Post-MVP (Roadmap Skalabilitas)**: Optimasi streaming backup (`CO-07`), modular refactor (`CO-08`), ekspansi reminder batch >200 (`CO-04`), dan browser push delivery (`CO-05`).

---

## 8. S2-T4 Boundary Reconciliation

Pemeriksaan independen terhadap boundary S2-T4:
- Seluruh 6 temuan S2-T4 pada `Design-Artifacts/10-S2-Audit-Findings-Register.md` dan `Design-Artifacts/Reports/S2-T4-Closure.md` terbukti **TIDAK MENGALAMI PERUBAHAN ATAU REGRESI**:
  - `S2-T4-NOTIF-01`: **VERIFIED / CLOSED**
  - `S2-T4-AUDIT-01`: **VERIFIED / CLOSED**
  - `S2-T4-NOTIF-02`: **VERIFIED / CLOSED**
  - `S2-T4-NOTIF-03`: **VERIFIED / CLOSED**
  - `S2-T4-JOB-01`: **VERIFIED / CLOSED**
  - `S2-T4-STATE-01`: **CLOSED — PRESERVED (DESIGN LIMITATION)**
  - `S2-PERF-FR28-1`: **ACCEPTED RISK / ADR-015**
- **Kesimpulan Boundary S2-T4**: **INTACT & LOCKED (100% TERJAGA)**.

---

## 9. S2-T5 Boundary Reconciliation

Pemeriksaan independen terhadap boundary S2-T5:
- Seluruh 3 temuan S2-T5 pada `Design-Artifacts/10-S2-Audit-Findings-Register.md` dan `Design-Artifacts/Reports/S2-T5-Closure.md` terbukti **TIDAK MENGALAMI PERUBAHAN**:
  - `S2-T5-DOC-01`: **CLOSED — DOCUMENTATION RECONCILIATION**
  - `S2-T5-UX-01`: **CLOSED — ACCEPTABLE MVP LIMITATION**
  - `S2-T5-EVID-01`: **OPEN — CARRYOVER TO S3**
- **Kesimpulan Boundary S2-T5**: **INTACT & LOCKED (100% TERJAGA)**.

---

## 10. Findings Register Reconciliation

Rekonsiliasi antara `Design-Artifacts/10-S2-Audit-Findings-Register.md` dan seluruh laporan audit S1/S2 menghasilkan konfirmasi:
1. **Total Finding Terdaftar**: Tepat 30 finding.
2. **Kesesuaian Sumber**: 100% finding memiliki asal-usul yang valid dari checkpoint S2-T1, S2-T3, S2-T4, dan S2-T5.
3. **Ketiadaan Duplikasi**: Tidak ada ID finding ganda atau tumpang tindih.
4. **Ketiadaan Silent Deletion**: Tidak ada finding historis yang dihapus secara diam-diam.
5. **Kesesuaian Status**: Seluruh status di tabel register ringkasan identik dengan rincian di section *Detailed Findings*.

---

## 11. Accepted Risks Evaluation

Daftar resmi risiko operasional yang diterima (*Accepted Risks*) pada sistem WorkPulse:

| ID Risiko | Deskripsi Risiko | Rasional Penerimaan | Dasar Otoritas (ADR) | Status Saat Ini | Pemicu Evaluasi Ulang Masa Depan |
|---|---|---|---|---|---|
| **AR-01** | Potensi starvasi batch cutoff reminder jika populasi karyawan aktif yang belum submit melampaui 200 user (`S2-PERF-FR28-1`). | Batas 200 adalah batas defensif memori batch tunggal; skala MVP Dutamedia adalah 30–60 user, sehingga starvasi tidak mungkin terjadi pada deployment awal. | **ADR-015**, **KL-10** | ACCEPTED RISK / ADR-015 | Populasi karyawan aktif mencapai > 150 user atau sistem diadopsi oleh multi-organisasi enterprise. |

> **Catatan Rekonsiliasi Verifikasi Independen (DISC-01)**:  
> - *Klasifikasi Awal S2-T6*: Mencantumkan ADR-003 (`AR-02`) dan ADR-005 (`AR-03`) di bawah tabel Accepted Risks.  
> - *Hasil Rekonsiliasi Independen*: Berdasarkan teks normatif dokumen tata kelola, ADR-003 adalah **Accepted MVP Scope Limitation** (ketiadaan endpoint GET list agregat wewenang proyek diputuskan sadar tanpa risiko kegagalan sistem), dan ADR-005 adalah **Agreed Design Constraint** (status placeholder enum `ExemptionRule` untuk menjaga stabilitas skema). Keduanya direkonsiliasi dan dipindahkan ke kategori *Design & Scope Limitations* (lihat Seksi 12).  
> - *Total Accepted Operational Risk yang Aktif*: **1 Item** (`S2-PERF-FR28-1` via ADR-015 & KL-10).

---

## 12. Known Limitations & Scope Constraints Evaluation

Pemisahan tegas antara *Design Limitation* (batasan desain yang disepakati), *Scope Constraint* (lingkup fitur yang dibatasi), dan *Implementation Defect* (cacat kode):

| ID | Kategori | Penjelasan Keterbatasan / Batasan | Bukan Merupakan Cacat Karena: |
|---|---|---|---|
| **KL-01** | Known Limitation | Ekstraksi backup database `generateSqlDump()` memuat seluruh data ke memori Node.js sebelum dikompresi. | Aman untuk skala MVP (<10 MB data); mitigasi streaming telah dirancang untuk pasca-MVP. |
| **KL-02** | Technical Debt | Mutasi komitmen pada `CorrectionRequestService` memanggil `tx.commitment.update()` langsung di dalam transaksi pesimis. | Menjamin atomisitas transaksi dan audit log; tidak memicu inkonsistensi data atau race condition. |
| **KL-03** | Design Constraint | Matriks notifikasi admin (`AdminNotificationSetupTab`) bersifat informasional read-only. | 13 trigger notifikasi merupakan aturan bisnis deterministik sistem yang tidak boleh dimatikan sepihak via UI. |
| **KL-04** | Operational Runbook | Prosedur Disaster Recovery mensyaratkan eksekusi runbook restore nyata berkala. | Merupakan baseline operasional yang wajib dipelihara oleh tim infrastruktur, bukan cacat kode. |
| **KL-05** | Decoupling Record | `SchedulerService` mendelegasikan kueri domain ke service masing-masing. | Telah direfaktor dan dimonitor; batas modularitas terjaga utuh. |
| **KL-06** | Structural Standard | Pemisahan antara DTO structural guardrail (`@Max(10)`) dan domain precision enforcer (1–3 komitmen). | Menjaga perlindungan terhadap serangan HTTP flooding tanpa mengaburkan aturan bisnis domain (BR-01, ADR-006, ADR-011). |
| **KL-07** | Quality Baseline | Baseline regresi 639 backend tests dan 91 frontend tests. | Menjadi tolok ukur kualitas baku sebelum setiap rilis gate. |
| **KL-08** | Verification Record | Mock fail-fast di produksi (Brevo & S3) dan status stub Browser Push. | Melindungi lingkungan produksi dari kebocoran simulasi sambil mendukung testing lokal. |
| **KL-09** | Security Baseline | Sapuan kepemilikan Prisma dan otorisasi resource. | Membuktikan tidak adanya celah IDOR atau bypass otorisasi data lintas pengguna. |
| **KL-10** | Scalability Debt | Analisis batas batch pengingat cutoff 200 user. | Telah diterima secara resmi sebagai utang teknis MVP melalui ADR-015. |
| **ADR-003** | Scope Limitation | Ketiadaan endpoint `GET` list agregat untuk `ProjectAuthorityMapping`. | Keterbatasan lingkup sadar MVP (SAD §23.2); wewenang dikueri kontekstual dan tercatat di audit log. |
| **ADR-005** | Design Constraint | `PolicyCategory.ExemptionRule` sebagai placeholder tanpa injeksi service. | Keterbatasan desain disepakati (SAD §23.2); aturan libur dikelola langsung oleh entitas operasional `exceptions`. |

---

## 13. Open Carry-overs & Planned Validation Register

Daftar resmi item yang berstatus **OPEN** atau merupakan aktivitas validasi terencana yang wajib ditindaklanjuti pada fase berikutnya:

### 13.1 Open Implementation Evidence Gap (Stage S3)
1. **`S2-T5-EVID-01`** (`CO-01`):
   - *Topik*: Responsive Coverage Multi-Viewport Runtime Verification.
   - *Status Administratif*: **OPEN — CARRYOVER TO S3**.
   - *Kategori*: Open Evidence Gap (unit implementation complete, browser layout rendering unproven).
   - *Target Verifikasi*: Pengujian visual Playwright pada resolusi Desktop (1280px), Tablet (768px), dan Mobile (375px/390px) pada 12 halaman utama.

### 13.2 Open Architectural Decision Item (Post-MVP Backlog)
2. **`ProjectRiskPage Scope Parameter`** (`CO-06`):
   - *Topik*: Mekanisme Otorisasi Visibilitas Risiko PM Lintas Tim (PRD US-15, SAD §23.2:15, KL-08 §4).
   - *Status Administratif*: **OPEN — ARCHITECTURAL DECISION**.
   - *Kategori*: Open Architectural Decision Item (Post-MVP Backlog).
   - *Target Verifikasi / Aksi*: Pembahasan arsitektur untuk penentuan endpoint project-scoped mandiri vs perluasan wewenang `ProjectAuthorityMapping`.

### 13.3 Planned Non-Functional Validation Activities
3. **`GAP-06`** (`CO-03`):
   - *Topik*: Pengujian Beban Konkurensi Multi-User Waktu Respons API (< 2 detik pada 30–60 user) (PRD NFR-03).
   - *Status Administratif*: **PLANNED BENCHMARK — S3 (SIT)**.
   - *Kategori*: Planned Performance Benchmark (bukan cacat implementasi S2).
   - *Target Verifikasi*: Benchmarking beban multi-user terisolasi (k6/artillery) di lingkungan SIT.
4. **`GAP-05`** (`CO-02`):
   - *Topik*: Pengukuran Empiris Usability Check-in ($\le$ 3 menit) (PRD AC-17, NFR-01).
   - *Status Administratif*: **PLANNED VALIDATION — S3/S5 (UAT)**.
   - *Kategori*: Planned Usability Target (bukan cacat implementasi S2).
   - *Target Verifikasi*: Pengujian stopwatch sesi check-in pengguna manusia riil pada UAT.

---

## 14. Phase Destination Matrix

Matriks pembagian tanggung jawab fase penyelesaian:

| Item / Finding ID | Deskripsi Singkat | Kategori Akhir | Fase Tujuan Kanonikal | Bukti Verifikasi yang Wajib Dipenuhi |
|---|---|---|---|---|
| **S2-T5-EVID-01** | Multi-Viewport Visual Usability | Open Evidence Gap | **Stage S3** (Testing) | Screenshot artefak dan log pemeriksaan overflow/clipping di Desktop, Tablet, Mobile. |
| **GAP-06** | Concurrency Load Testing (< 2s) | Planned Benchmark | **Stage S3** (Testing / SIT) | Laporan benchmark P95 latency < 2 detik pada beban 30–60 pengguna konkuren. |
| **GAP-05** | Check-in Stopwatch Timing ($\le$ 3m) | Planned Validation | **Stage S3 / S5** (UAT) | Rekaman log durasi pengisian Morning & EOD Check-in rata-rata $\le$ 3 menit. |
| **CO-07 (KL-01)** | Streaming Gzip Backup Pipeline | Technical Debt | **Post-MVP Backlog** (SAD §23.2) | Implementasi cursor pagination dan S3 streaming upload saat data audit logs membesar. |
| **CO-08 (KL-02)** | Modular Delegation Commitment Update | Technical Debt | **Post-MVP Backlog** (SAD §23.2) | Refactoring helper method pada `DailyAccountabilityService`. |
| **CO-04 (KL-10)** | Reminder Upstream Exclusion Filter | Accepted Risk | **Post-MVP Backlog** (KL-10 / SAD §23.2) | Kueri set-difference SQL berbasis indeks `NOT EXISTS notifications` saat user > 150. |
| **CO-05 (KL-08)** | Full Browser Push VAPID Delivery | Design Constraint | **Post-MVP Backlog** (SAD §12.4) | Implementasi modul push service worker dan VAPID key exchange. |
| **CO-06 (KL-08 §4)** | Project Authority Scope Expansion | Architectural Decision | **Post-MVP Backlog** (SAD §23.2) | Spesifikasi dan rute endpoint kueri wewenang proyek lintas tim. |

---

## 15. Governance Discrepancies Reconciliation

Rekonsiliasi administratif terhadap 4 diskrepansi yang diidentifikasi oleh S2-T6 Independent Verification:
1. **DISC-01 (Risk Classification)**: ADR-003 dan ADR-005 direkonsiliasi dari kategori *Accepted Risks* menjadi *Scope & Design Limitations*. Accepted operational risk tunggal yang aktif adalah `S2-PERF-FR28-1` (ADR-015).
2. **DISC-02 (Validation Activity Conflation)**: `GAP-05` dan `GAP-06` direkonsiliasi dari sebutan *Evidence Gaps* menjadi *Planned Non-Functional Validation Activities* yang dijadwalkan pada SIT (S3) dan UAT (S3/S5).
3. **DISC-03 (Destination Canonical Naming)**: Seluruh rujukan destinasi informal *"Enterprise Scale-Up Roadmap"* digantikan dengan nama destinasi resmi: **Post-MVP Backlog (SAD §23.2 / KL-10 Scale-Up Roadmap)**.
4. **DISC-04 (Documentation Count Ambiguity)**: Ringkasan gap dokumentasi ditegaskan secara eksplisit: **0 Open Documentation Gaps**, dengan **1 Historical Closed Documentation Reconciliation** (`S2-T5-DOC-01`).

Seluruh 4 diskrepansi tata kelola non-blocking telah **TEREKONSILIASI PENUH SECARA ADMINISTRATIF**.

---

## 16. Final S2-T6 Verdict

Berdasarkan hasil audit awal, verifikasi independen berintegritas tinggi, dan rekonsiliasi administratif lengkap:

> ### **FINAL VERDICT: CLOSED — VERIFIED WITH NON-BLOCKING DISCREPANCIES RECONCILED**

### Ringkasan Penutupan Administratif:
- Seluruh 30 temuan terdaftar pada Findings Register berada dalam status yang valid, akurat, dan dapat dilacak.
- Boundary S2-T4 dan S2-T5 terkunci utuh 100% tanpa mutasi.
- Tepat 1 open evidence gap (`S2-T5-EVID-01`) dan 2 planned validation activities (`GAP-06`, `GAP-05`) dialokasikan secara transparan ke Fase S3 dan S5.
- Nol perubahan pada kode produksi, test suite, maupun skema basis data.

---
*Laporan audit tata kelola ini resmi diperbarui dan ditutup secara administratif.*
