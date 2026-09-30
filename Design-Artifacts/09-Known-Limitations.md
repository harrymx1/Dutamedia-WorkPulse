# Register Known Limitations, Technical Debt & Catatan Verifikasi
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

| Dokumen | Nilai |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.0 |
| Status | Active Reference |
| Date | September 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.1, PRD v1.1, SAD v1.0, 08-ADR.md |

> Dokumen ini mencatat seluruh **keterbatasan teknis yang diketahui (Known Limitations)**, **utang teknis (Technical Debt)**, dan **catatan hasil verifikasi pengujian operasional** yang diidentifikasi selama fase implementasi dan stabilisasi sistem WorkPulse. Dokumen ini menjadi rujukan resmi bagi tim pengembang dan pemilik proyek dalam merencanakan pemeliharaan, refactoring terencana, serta mitigasi risiko pra-go-live produksi.

---

## Ringkasan Register

| ID | Topik / Entitas | Kategori | Tingkat Risiko / Prioritas | Status |
|---|---|---|---|---|
| **KL-01** | `DatabaseBackupService.generateSqlDump()` | Known Limitation (Skalabilitas Memori) | MEDIUM (Post-MVP) | Known Limitation — Pending Review |
| **KL-02** | `CorrectionRequestService.tx.commitment.update()` | Technical Debt (Modular Boundary) | LOW (Pasca-MVP) | Technical Debt — Documented & Accepted |
| **KL-03** | `AdminNotificationSetupTab` Read-Only Matrix | Design Constraint & Affordance | INFORMATIONAL | Design Constraint — Maintained |
| **KL-04** | Disaster Recovery & Real Restore Runbook | Verification Record & Runbook | CRITICAL BASELINE | Active Operational Reference |
| **KL-05** | SchedulerService Cross-Module Decoupling | Refactoring & Dependency Record | LOW | Implemented & Monitored |
| **KL-06** | DTO Structural Guardrail vs Domain Enforcer | Implementation Note | LOW | Active Structural Standard |
| **KL-07** | Baseline Pengujian Regresi & Pembersihan Mock | Test & Quality Baseline | HIGH ASSURANCE | Active Verification Baseline |

---

## KL-01: Analisis Skalabilitas & Risiko Lonjakan Memori Container Railway pada `generateSqlDump()`

| Atribut | Nilai |
|---|---|
| **ID** | KL-01 |
| **Komponen Terkait** | `DatabaseBackupService` (`backend/src/modules/scheduler/services/database-backup.service.ts`) |
| **Kategori** | Known Limitation — Skalabilitas & Resource Allocation |
| **Tingkat Risiko** | MEDIUM (Aman untuk skala MVP; berisiko pada akumulasi log jangka panjang) |
| **Status** | **Known Limitation — Pending Review (Post-MVP / Pra-Go-Live Skala Penuh)** |
| **Rujukan Terkait** | SAD §4.5, §21.6, ADR-007 |

### Konteks & Deskripsi
Implementasi pencadangan database programatik `generateSqlDump()` mengekstraksi seluruh data dari 18 tabel skema ke dalam memori aplikasi menggunakan Prisma Client `findMany()`, kemudian menggabungkannya menjadi satu string SQL INSERT teragregasi sebelum dikompresi menggunakan `zlib.gzipSync()`.

### Analisis Teknis & Risiko
1. **Perilaku Skala Awal (30–60 User / Tahap MVP)**:
   - Total volume database harian diperkirakan <10 MB.
   - Footprint heap memory Node.js berkisar 20–40 MB.
   - Eksekusi backup berjalan sangat aman di bawah limit container.
2. **Perilaku Akumulasi Data Jangka Panjang (Post-MVP)**:
   - Tabel `audit_logs` bersifat *append-only* (tidak pernah dihapus atau di-truncate per SAD §2.1 & §5.10).
   - Setelah 3–6 bulan operasional aktif, baris `audit_logs` dapat mencapai 50.000 hingga 100.000 baris.
   - Dengan rata-rata payload 1–2 KB per event (mencakup JSONB snapshot `valueBefore` dan `valueAfter`), memuat 100.000 objek JavaScript ke heap V8 dan menggabungkannya menjadi string SQL ~100 MB serta buffer kompresi dapat memicu lonjakan memori (*memory spike*) sebesar **~350–500 MB**.
   - Pada spesifikasi container runner Railway standar dengan batas memori **512 MB**, kondisi ini berisiko memicu penghentian proses oleh sistem operasi (**OOM / Out Of Memory Process Termination**).

### Rencana Mitigasi Pra-Go-Live Skala Penuh
Sebelum beban data mencapai ambang kritis, arsitektur pencadangan direkomendasikan untuk ditingkatkan melalui dua langkah rekayasa:
1. **Cursor-Based Batch Pagination**: Mengganti `findMany()` tunggal dengan pembacaan bertahap berbasis kursor (batch per 1.000 baris menggunakan parameter Prisma `cursor` dan `take`).
2. **Node.js Streaming Pipeline**: Mengalirkan (*stream*) baris-baris statement SQL secara langsung ke `zlib.createGzip()`, kemudian di-pipe langsung ke Object Storage S3 menggunakan `@aws-sdk/lib-storage` (`Upload` stream) atau spooling ke file temporary lokal, sehingga pemakaian memori heap konstan (<50 MB) terlepas dari jumlah baris data.

---

## KL-02: Technical Debt Mutasi Langsung `tx.commitment.update()` pada `CorrectionRequestService`

| Atribut | Nilai |
|---|---|
| **ID** | KL-02 |
| **Komponen Terkait** | `CorrectionRequestService` (`backend/src/modules/correction-request/services/correction-request.service.ts`) |
| **Kategori** | Technical Debt — Batasan Lapisan Domain / Module Decoupling |
| **Tingkat Risiko** | LOW (Tidak menimbulkan celah keamanan, race condition, atau inkonsistensi data) |
| **Status** | **Technical Debt — Documented & Accepted (Pending Refactor Pasca-MVP)** |
| **Rujukan Terkait** | SAD §6.3, §6.4, PRD FR-43–47 |

### Konteks & Deskripsi
Pada alur evaluasi dan persetujuan koreksi komitmen:
- `CorrectionRequestService.evaluateExpiredObjectionWindows()` (eksekusi otomatis pasca objection window berakhir)
- `CorrectionRequestService.approveCorrectionRequest()` (eksekusi manual oleh atasan berwenang)

Pembaruan data teks komitmen yang dikoreksi dieksekusi secara langsung melalui pemanggilan Prisma `tx.commitment.update()` di dalam transaksi database yang sedang berlangsung. Sesuai prinsip decoupling modular SAD §6.3 dan §6.4, mutasi entitas `Commitment` idealnya didelegasikan ke domain service pemiliknya (`DailyAccountabilityService`).

### Analisis Keamanan & Integritas Data
Berdasarkan audit stabilisasi mendalam, implementasi saat ini dinyatakan **aman dan tidak membahayakan sistem**:
1. **Boundary Transaksi Atomik**: Pembaruan `tx.commitment.update()` berada di dalam satu transaksi database pesimis yang sama (`SELECT ... FOR UPDATE` via Prisma `$transaction`).
2. **Verifikasi Otorisasi & Siklus Hidup**: Status koreksi diverifikasi secara ketat (hanya memproses status `Pending`), jendela keberatan dipastikan telah kadaluarsa atau disetujui aktor berwenang, dan identitas pemohon divalidasi.
3. **Pencatatan Audit Trail Lengkap**: Audit log immutable (`CORRECTION_AUTO_APPLIED` atau `CORRECTION_REQUEST_APPROVED`) dicatat di dalam transaksi yang sama.
4. **Tidak Melanggar State Machine**: Pembaruan hanya mengubah field yang diizinkan dan tidak merusak baseline lock komitmen harian.

### Rencana Tindak Lanjut Pasca-MVP
Pada fase refactor modular berikutnya:
- Buat method helper dedicated pada `DailyAccountabilityService`:
  ```typescript
  updateCommitmentInTx(tx: Prisma.TransactionClient, commitmentId: string, data: UpdateCommitmentDto): Promise<Commitment>
  ```
- Alihkan pemanggilan langsung Prisma di `CorrectionRequestService` ke method delegasi tersebut.

---

## KL-03: Keterbatasan Konfigurasi Matriks Notifikasi (`AdminNotificationSetupTab`) sebagai Read-Only Informational Matrix

| Atribut | Nilai |
|---|---|
| **ID** | KL-03 |
| **Komponen Terkait** | `AdminNotificationSetupTab.vue` (`frontend/src/components/admin/AdminNotificationSetupTab.vue`) |
| **Kategori** | Design Constraint & UI Affordance Clarification |
| **Tingkat Risiko** | INFORMATIONAL |
| **Status** | **Design Constraint — Maintained (SAD §12.1)** |
| **Rujukan Terkait** | SAD §12.1, PRD FR-52, EPIC-04 |

### Konteks & Deskripsi
Sebelumnya, tab pengaturan notifikasi pada antarmuka admin menyediakan toggle switch interaktif yang beroperasi di atas mock array lokal tanpa dependensi backend nyata. Hal ini menimbulkan impresi keliru seolah administrator dapat secara bebas mematikan atau menyalakan trigger notifikasi sistem tertentu.

### Analisis & Keputusan Remediasi
1. **Sifat Deterministik Arsitektur Notifikasi**:
   - Seluruh 13 trigger notifikasi pada SAD §12.1 (seperti reminder cutoff pagi, reminder EOD, eskalasi keterlambatan, pengajuan cuti, dan objection window) dirancang sebagai aturan bisnis deterministik yang terikat erat pada state machine dan scheduled job backend.
   - Mematikan pengingat seperti eskalasi kepatuhan atau audit keberatan secara sepihak akan merusak governance kepatuhan sistem.
2. **Pilihan Solusi yang Ditetapkan (Pilihan 1)**:
   - Komponen `AdminNotificationSetupTab.vue` direfaktor sepenuhnya menjadi **Read-Only Informational Matrix**.
   - Menampilkan seluruh 13 trigger arsitektural lengkap dengan kolom:
     - Nama Pemicu & Peristiwa (Trigger Event)
     - Target Penerima (Recipient Role/User)
     - Saluran Pengiriman (In-App Notification, Brevo Transactional Email, Web Push Notification)
     - Mekanisme Pemicu (Scheduled Cron vs Real-Time Domain Event)
   - Seluruh switch toggle dan tombol simpan palsu dihapus 100% dari kode sumber.
   - Dilengkapi banner resmi yang menjelaskan bahwa konfigurasi ini bersifat melekat pada engine backend.

---

## KL-04: Catatan Eksekusi & Bukti Verifikasi Uji Coba Restore Nyata Database (Disaster Recovery Runbook)

| Atribut | Nilai |
|---|---|
| **ID** | KL-04 |
| **Komponen Terkait** | `DatabaseBackupService` & PostgreSQL Database Instance |
| **Kategori** | Verification Record & Operational Runbook |
| **Tingkat Risiko** | CRITICAL BASELINE |
| **Status** | **Active Operational Reference** |
| **Rujukan Terkait** | SAD §4.5, §21.6, §23.2.B1, ADR-007 |

### Latar Belakang & Bukti Eksekusi
Sebagai bagian dari penutupan Open Item SAD §23.2.B1, telah dilakukan pengujian pemulihan bencana nyata (*real restore simulation*) pada database PostgreSQL dengan skema penuh WorkPulse (18 tabel).

### Hasil Uji Coba Pemulihan Nyata (Pre-Backup vs Wiped vs Post-Restore)

| # | Nama Tabel | Model Prisma | Pre-Backup | Wiped (Bencana) | Post-Restore | Status Integritas |
|---|---|---|---|---|---|---|
| 1 | `users` | `User` | **5** | 0 | **5** | **MATCH (100%)** |
| 2 | `policies` | `Policy` | **1** | 0 | **1** | **MATCH (100%)** |
| 3 | `policy_owner_assignments` | `PolicyOwnerAssignment` | **1** | 0 | **1** | **MATCH (100%)** |
| 4 | `organizational_assignments` | `OrganizationalAssignment` | **5** | 0 | **5** | **MATCH (100%)** |
| 5 | `project_authority_mappings` | `ProjectAuthorityMapping` | **1** | 0 | **1** | **MATCH (100%)** |
| 6 | `temporary_reviewer_assignments` | `TemporaryReviewerAssignment` | **1** | 0 | **1** | **MATCH (100%)** |
| 7 | `sessions` | `Session` | **1** | 0 | **1** | **MATCH (100%)** |
| 8 | `exceptions` | `Exception` | **1** | 0 | **1** | **MATCH (100%)** |
| 9 | `daily_accountability_records` | `DailyAccountabilityRecord` | **2** | 0 | **2** | **MATCH (100%)** |
| 10 | `commitments` | `Commitment` | **3** | 0 | **3** | **MATCH (100%)** |
| 11 | `additional_works` | `AdditionalWork` | **1** | 0 | **1** | **MATCH (100%)** |
| 12 | `blockers` | `Blocker` | **1** | 0 | **1** | **MATCH (100%)** |
| 13 | `support_contributions` | `SupportContribution` | **1** | 0 | **1** | **MATCH (100%)** |
| 14 | `correction_requests` | `CorrectionRequest` | **1** | 0 | **1** | **MATCH (100%)** |
| 15 | `manager_notes` | `ManagerNote` | **1** | 0 | **1** | **MATCH (100%)** |
| 16 | `compliance_events` | `ComplianceEvent` | **1** | 0 | **1** | **MATCH (100%)** |
| 17 | `notifications` | `Notification` | **1** | 0 | **1** | **MATCH (100%)** |
| 18 | `audit_logs` | `AuditLog` | **4** | 0 | **4** | **MATCH (100%)** |

### Verifikasi Integritas Data (Data Fidelity Check)
1. **Identitas & Karakter Khusus**: Nama dengan tanda petik tunggal (`Budi Santoso O'Connor`) berhasil dipulihkan tanpa galat sintaks SQL dengan UUID identik.
2. **Snapshot JSONB**: Snapshot konteks organisasi pada `DailyAccountabilityRecord` (`{"role":"Employee","function":"Engineering","supervisorName":"Engineering Supervisor"}`) pulih sempurna.
3. **Relasi & Enum**: Status blocker `High` dan deskripsi dependensi pulih 100%.
4. **Koreksi Data**: Struktur JSON permohonan koreksi pulih utuh.
5. **Jejak Audit Append-Only**: Seluruh 4 event audit trail (`POLICY_CREATED`, `DAILY_RECORD_SUBMITTED`, `BLOCKER_RAISED`, `CORRECTION_REQUEST_APPLIED`) pulih beserta urutan timestamp milidetik dan referensi polimorfiknya.

### Contoh Format Dump SQL Standar yang Dihasilkan
```sql
-- =============================================================================
-- WorkPulse Database Snapshot Dump (SAD §4.5, §11.4, §21.6)
-- Timestamp: 2026-09-18T03:52:28.862Z
-- =============================================================================

BEGIN;

-- Data for Table: "users" (5 rows)
INSERT INTO "users" ("id", "fullName", "email", "passwordHash", "status", "mustResetPassword", "createdAt", "updatedAt") VALUES
('b43accf2-fc69-4407-92d6-17b22f197879', 'Budi Santoso O''Connor', 'budi.verify@dutamedia.com', '...', 'Active', FALSE, '2026-09-18T03:52:28.001Z', '2026-09-18T03:52:28.001Z');

-- Data for Table: "daily_accountability_records" (2 rows)
INSERT INTO "daily_accountability_records" ("id", "employeeUserId", "workDate", "orgContextSnapshot", ...) VALUES
('0fcd3102-b940-45e3-be5d-f96d15dc5d65', '...', '2026-09-17T00:00:00.000Z', '{"role":"Employee","function":"Engineering"}'::jsonb, ...);

COMMIT;
```

---

## KL-05: Catatan Rekayasa Refactoring SchedulerService: Peniadaan Direct Prisma Access

| Atribut | Nilai |
|---|---|
| **ID** | KL-05 |
| **Komponen Terkait** | `SchedulerService` (`backend/src/modules/scheduler/services/scheduler.service.ts`) |
| **Kategori** | Architectural Refactoring Record — Modular Boundary Integrity |
| **Tingkat Risiko** | LOW |
| **Status** | **Implemented & Monitored (SAD §6.3, §6.4)** |
| **Rujukan Terkait** | SAD §6.3, §6.4, §11.2 |

### Konteks & Permasalahan
Sebelumnya, `SchedulerService` melanggar aturan isolasi modul dengan melakukan pemanggilan langsung `this.prisma` ke tabel domain lain untuk 3 jenis pengingat:
1. `this.prisma.dailyAccountabilityRecord.findMany(...)` pada job reminder cutoff.
2. `this.prisma.correctionRequest.findMany(...)` pada job reminder objection window.
3. `this.prisma.exception.findMany(...)` pada job reminder permohonan cuti pending.

### Solusi Refactoring yang Diterapkan
Seluruh akses langsung database dihilangkan dan digantikan dengan delegasi service resmi:
1. **`DailyAccountabilityService`**: Ditambahkan method `findRecordsNearingCutoff(workDate, limit)`.
2. **`CorrectionRequestService`**: Ditambahkan method `findPendingWithClosingObjectionWindow(now, windowEnd, limit)`.
3. **`ExceptionService`**: Ditambahkan method `findPendingLeavesOlderThan(threshold, limit)`.
4. **`SchedulerService`**: Menginjeksi `DailyAccountabilityService`, `CorrectionRequestService`, dan `ExceptionService` secara resmi via NestJS Dependency Injection.

---

## KL-06: Verifikasi Separasi DTO Structural Guardrail dan Precision Domain Service Enforcer

| Atribut | Nilai |
|---|---|
| **ID** | KL-06 |
| **Komponen Terkait** | `MorningCheckinDto`, `DailyAccountabilityService`, `S3StorageService` |
| **Kategori** | Implementation Note & Structural Guardrail |
| **Tingkat Risiko** | LOW |
| **Status** | **Active Structural Standard (SAD §9.3, ADR-006)** |
| **Rujukan Terkait** | PDD §8, PRD BR-01, SAD §9.3, ADR-006 |

### Deskripsi & Aturan Desain
Dalam arsitektur WorkPulse, batasan input HTTP dan validasi bisnis dipisahkan secara tegas untuk menghindari *coupling* yang kaku antara transport layer dan domain logic:
1. **DTO Permisif sebagai Structural Guardrail**:
   - `CreateCommitmentItemDto.sequenceNo`: Menggunakan validator `@Max(10)`.
   - `MorningCheckinDto.commitments`: Menggunakan validator `@ArrayMaxSize(10)`.
   - Batas angka 10 ini berfungsi murni sebagai penangkal serangan DoS / payload flooding pada lapisan HTTP transport, bukan representasi aturan bisnis komitmen.
2. **Domain Service sebagai Precision Enforcer**:
   - `DailyAccountabilityService.submitMorningCheckin` menegakkan aturan bisnis produk yang sesungguhnya secara presisi menggunakan konstanta `MIN_DAILY_COMMITMENTS = 1` dan `MAX_DAILY_COMMITMENTS = 3` (BR-01, ADR-006).
   - Array komitmen yang dikirimkan dipastikan tepat berisi 1 hingga 3 item dengan sequence number berurutan.
3. **Presigned URL TTL Alignment**:
   - Nilai default TTL presigned URL unduhan pada `S3StorageService.createPresignedGetUrl` ditetapkan **900 detik (15 menit)**, selaras 100% dengan parameter `RetentionPeriod.exportRetentionMinutes: 15`.

---

## KL-07: Baseline Hasil Pengujian Regresi & Pembersihan Mock Frontend/Backend

| Atribut | Nilai |
|---|---|
| **ID** | KL-07 |
| **Komponen Terkait** | Seluruh Backend Unit/Integration Tests & Frontend Workspace Components |
| **Kategori** | Test & Quality Assurance Baseline |
| **Tingkat Risiko** | HIGH ASSURANCE |
| **Status** | **Active Verification Baseline (Audit Stabilisasi Selesai)** |
| **Rujukan Terkait** | EPIC-04, EPIC-15, SAD §16.3, §17.4 |

### Baseline Pengujian Backend
- **Test Suite Backend**: 43 test suite files, **439 unit & integration tests lulus (100% pass)**.
- **TypeScript Compiler**: `npx tsc --noEmit` menghasilkan **0 error**.
- **Linter**: `npm run lint` menghasilkan **0 error / 0 warning**.

### Baseline Pengujian Frontend & Penghapusan Mock
- **Pembersihan Mock Data Total**:
  - `git grep -in "mock" frontend/src/components/admin/` menghasilkan **0 match**.
  - Seluruh data mock (`mockUsers`, `mockMappings`, `mockTempReviewers`, switch mock notifikasi) telah dihapus total.
  - Keempat tab pada Admin Workspace (`AdminUserManagementTab`, `AdminOrganizationTab`, `AdminTemporaryReviewerTab`, `AdminNotificationSetupTab`) 100% terhubung ke API backend riil atau tabel informasional definitif.
- **Test Suite Frontend**:
  - `frontend/tests/admin-user-management.spec.ts`: 8 tests pass.
  - `frontend/tests/admin-organization-and-reviewer.spec.ts`: 10 tests pass.
  - Total test suite frontend: **20 unit tests passed (100% pass)**.
- **Vite Production Build**: `npm run build` (`tsc && vite build`) berhasil selesai tanpa galat.
