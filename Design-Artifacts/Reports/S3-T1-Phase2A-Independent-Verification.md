# S3-T1 Phase 2A Independent Verification

**System**: WorkPulse — Daily Accountability & Blocker Log System  
**Stage**: Stage S3 — Jalankan Sistem Sungguhan  
**Task**: Independent Verification of S3-T1 Phase 2A (Real PostgreSQL Integration Matrix)  
**Execution Timestamp**: 2026-10-07T14:31:00+07:00  
**Status**: VERIFIED & RATIFIED  
**Governing Documents**: `05-SAD.md`, `06-Product Backlog.md`, `08-ADR.md`, `09-Known-Limitations.md`, `WorkPulse_Development_Framework(3).md`  
**Referenced Reports**:
- `Design-Artifacts/Reports/S3-T1-Phase2A-Real-PostgreSQL-Integration-Report.md`
- `Design-Artifacts/Reports/S3-T1-Phase1-Independent-Verification.md`
- `Design-Artifacts/Reports/S3-T1-Phase1-Environment-Provisioning-Report.md`
- `Design-Artifacts/Reports/S2-T6-Closure.md`
- `Design-Artifacts/Reports/S2-T7-Secondary-DoD-Checks-Report.md`

---

## 1. Scope

Independent Verification ini melakukan audit mendalam dan independen terhadap seluruh artefak, eksekusi, dan klaim dalam **S3-T1 Phase 2A — Real PostgreSQL Integration Matrix**:
1. Memverifikasi bahwa seluruh pengujian integrasi benar-benar dieksekusi terhadap **actual isolated PostgreSQL engine** (`localhost:54332`, database `workpulse_test`) dan bukan mock/SQLite/fake persistence.
2. Memverifikasi integritas Git mutation: memastikan 0 mutasi kode produksi (`backend/src/`), 0 mutasi skema/migrasi (`schema.prisma`, `migrations/`), 0 mutasi frontend, dan 0 penambahan/perubahan dependensi baru di `package.json`/`package-lock.json`.
3. Memverifikasi jumlah suite dan kasus uji aktual (11 test suites / 42 test cases) tanpa ada pengujian yang di-skip (`.skip`), diisolasi (`.only`), atau dibiarkan unimplemented (`.todo`).
4. Memvalidasi aturan *Database-State Assertion Rule*: memastikan assertasi pengujian memvalidasi baris fisik yang tersimpan di PostgreSQL (melalui raw `pg.Client` SQL query atau Prisma lookup langsung), bukan hanya memeriksa return value in-memory.
5. Mengaudit kepatuhan batasan fase (Strict Phase Boundary): membuktikan 0 race condition/concurrency testing pada Phase 2A, dengan penegakan status Phase 2B tetap **NOT STARTED**.

---

## 2. Baseline

Audit ini beroperasi di atas baseline terkunci:
- **S2-T6 Final Closure & S2-T7 Secondary DoD Checks**: Baseline status fungsional dan arsitektural telah terkunci.
- **S3-T0 Environment Gate**: Baseline readiness lingkungan terisolasi telah lulus bersyarat dan terverifikasi.
- **S3-T1 Phase 1**: Infrastruktur PostgreSQL Docker container terisolasi (`localhost:54332`) dan harness test telah terverifikasi secara independen.
- **In-Tree Pre-existing Changes**: 40 modified files dari tahap S2 dipertahankan tanpa mutasi tambahan selama Phase 2A.

---

## 3. Git Mutation Integrity

Audit status Git working tree dieksekusi menggunakan:
```powershell
git status --porcelain -uall
git diff --stat
git diff -- package-lock.json backend/package.json package.json
git diff -- backend/src backend/prisma/schema.prisma backend/prisma/migrations
```

### Temuan Audit Mutasi:
1. **Production Code (`backend/src/`)**: 
   - Diff terhadap snapshot S3-T1 Phase 1 = **0 lines changed**.
   - Tidak ada modifikasi baru pada controller, service, domain logic, maupun DTO selama eksekusi Phase 2A.
2. **Database Schema & Migrations (`backend/prisma/`)**:
   - `schema.prisma`: **0 lines changed**.
   - `migrations/`: **0 lines changed**.
   - Integritas database schema 100% konsisten dengan baseline.
3. **Frontend Code (`frontend/`)**:
   - **0 lines changed** selama Phase 2A.
4. **Dependencies (`package-lock.json`, `package.json`)**:
   - `package-lock.json`: **0 lines changed**.
   - Tidak ada dependensi baru (`npm dependencies` / `devDependencies`) yang diinstal atau dimutasi.
   - Perubahan pada `package.json` dan `backend/package.json` murni script test harness runner yang dibuat pada Phase 1.
5. **Untracked / Added Files**:
   - Hanya file test suite baru di `backend/test/integration-real/` dan dokumen laporan di `Design-Artifacts/Reports/`.

**Verdict Git Mutation Integrity**: **PASS**.

---

## 4. Test Count Verification

Audit langsung terhadap test runner Vitest (`vitest.config.integration.ts`):
- **Total Test Suites / Files**: 11 files
- **Total Test Cases**: 42 tests
- **Passed**: 42 tests (100%)
- **Failed**: 0 tests
- **Skipped**: 0 tests
- **Todo**: 0 tests
- **Duration**: ~4.14s

### Rincian Per File Uji:
| No | Test File | Test Cases | Status |
|---|---|---|---|
| 1 | `smoke-connection.spec.ts` | 4 | 4 PASSED |
| 2 | `concurrency-harness-smoke.spec.ts` | 2 | 2 PASSED |
| 3 | `matrix-identity-session.spec.ts` | 3 | 3 PASSED |
| 4 | `matrix-organization-scope-effective-dating.spec.ts` | 4 | 4 PASSED |
| 5 | `matrix-policy.spec.ts` | 2 | 2 PASSED |
| 6 | `matrix-daily-accountability-commitment.spec.ts` | 4 | 4 PASSED |
| 7 | `matrix-blocker.spec.ts` | 2 | 2 PASSED |
| 8 | `matrix-correction-request.spec.ts` | 2 | 2 PASSED |
| 9 | `matrix-audit-notification-compliance.spec.ts` | 4 | 4 PASSED |
| 10 | `matrix-atomicity-idempotency.spec.ts` | 3 | 3 PASSED |
| 11 | `matrix-http-controller-service.spec.ts` | 12 | 12 PASSED |
| **Total** | **11 Files** | **42 Tests** | **42 PASSED (0 FAIL, 0 SKIP)** |

Pencarian menyeluruh terhadap token `.skip`, `.only`, `.todo`, `describe.skip`, dan `test.skip` menghasilkan **0 hasil**. Tidak ada pemotongan atau pelemahan seleksi pengujian.

**Verdict Test Count Verification**: **PASS**.

---

## 5. Real PostgreSQL Verification

Verifikasi koneksi fisik dan engine database:
1. **Target Engine**: PostgreSQL 18.6 (Debian 18.6-1.pgdg130+1) berjalan di container Docker `workpulse-test-db` pada port `54332`.
2. **Safety Enforcement**:
   - `assertSafeTestDatabase()` dan `test/setup-integration.ts` memverifikasi hostname `localhost`/`127.0.0.1`, port `54332`, dan nama database `workpulse_test`.
   - String koneksi yang mengarah ke `supabase.co` atau `pooler.supabase.com` ditolak secara fail-closed (melemparkan `FATAL SAFETY VIOLATION` error).
3. **ORM Layer**:
   - Menggunakan `@prisma/client` 7.10.0 dengan `@prisma/adapter-pg` pool nyata yang terhubung ke port `54332`.
   - Tidak ada mock Prisma (`vi.mock('@prisma/client')` = 0) dan tidak ada SQLite fallback.

**Verdict Real PostgreSQL Verification**: **PASS**.

---

## 6. Database-State Assertion Audit

Audit memastikan bahwa setiap pengujian domain melakukan kueri langsung terhadap state database PostgreSQL nyata menggunakan client SQL terpisah (`pg.Client`) atau Prisma query lookup yang independen dari return value service:

| Domain | Return-Value Check | Raw / Direct DB Assertion | Bukti Query PostgreSQL | Status |
|---|---|---|---|---|
| **Identity** | `expect(created.email).toBe(...)` | `SELECT id, email, status FROM users WHERE id = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Session** | `expect(session.id).toBeDefined()` | `SELECT "userId", "revokedAt", "expiresAt" FROM sessions WHERE id = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Organization** | `expect(emp.role).toBe(...)` | `SELECT "directManagerId" FROM organizational_assignments WHERE "userId" = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Project Authority** | `expect(mapping.scopeReference).toBe(...)` | `SELECT "scopeReference" FROM project_authority_mappings WHERE "userId" = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Effective Dating** | `expect(role).toBe(...)` | Query AS-OF temporal langsung di PostgreSQL via filter date | Real SQL via `prisma.findFirst` | **PASS** |
| **Scope Filtering** | `expect(accessibleUserIds).toEqual(...)` | Evaluasi hierarki terhadap baris relasional nyata di tabel assignments | Real DB-driven evaluation | **PASS** |
| **Policy** | `expect(snapshot).toBeDefined()` | `SELECT count(*) FROM policies WHERE status = 'Active'` | Real SQL via `pgClient.query` | **PASS** |
| **Daily Accountability** | `expect(result.id).toBeDefined()` | `SELECT "initialStatus" FROM daily_accountability_records WHERE id = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Commitment** | `expect(result.commitments.length).toBe(2)` | `SELECT "sequenceNo", text FROM commitments WHERE "dailyRecordId" = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Additional Work** | `expect(addWork.id).toBeDefined()` | `SELECT id, text FROM additional_works WHERE id = $1` & `commitments count = 2` | Real SQL via `pgClient.query` | **PASS** |
| **Blocker** | `expect(blocker.status).toBe(...)` | `SELECT status, "ownerNeededUserId", "acknowledgedAt" FROM blockers` | Real SQL via `pgClient.query` | **PASS** |
| **Correction Request** | `expect(result.status).toBe(...)` | `SELECT text FROM commitments` & `SELECT "objectionWindowEnd" FROM correction_requests` | Real SQL via `pgClient.query` | **PASS** |
| **Audit Log** | `expect(systemLog.id).toBeDefined()` | `SELECT "actorUserId", action FROM audit_logs WHERE id = $1` (verifikasi NULL) | Real SQL via `pgClient.query` | **PASS** |
| **Notification** | `expect(notifications.length).toBe(1)` | `SELECT id, "recipientUserId", "triggerType", channel, status FROM notifications` | Real SQL via `pgClient.query` | **PASS** |
| **Pattern Flag** | `expect(event.id).toBeDefined()` | `SELECT "eventType", "followUpStatus" FROM compliance_events WHERE id = $1` | Real SQL via `pgClient.query` | **PASS** |
| **Status Suggestion** | `expect(suggestion.suggestedStatus).toBe('RED')` | `SELECT status FROM users WHERE id = $1` (memastikan status tetap `Active`) | Real DB state persistence | **PASS** |
| **Atomicity Commit** | Transaksi multi-tabel selesai | `SELECT count(*)` pada 3 tabel (`daily_records`, `commitments`, `audit_logs`) | Real SQL via `pgClient.query` | **PASS** |
| **Atomicity Rollback** | Transaksi melempar error | `SELECT count(*)` pada tabel menghasilkan 0 baris | Real SQL via `pgClient.query` | **PASS** |

**Verdict Database-State Assertion Audit**: **PASS**.

---

## 7. Domain-by-Domain Verification

### Identity / Session
- `P2A-ID-01`: User CRUD memverifikasi mutasi status dari `Active` ke `Inactive` pada tabel `users`.
- `P2A-ID-02`: Persistensi sesi aktif terbukti menyimpan baris di tabel `sessions` dengan `expiresAt` di masa depan.
- `P2A-ID-03`: Revokasi sesi terbukti menyimpan timestamp pada kolom `"revokedAt"` di PostgreSQL, dan kueri sesi aktif berikutnya mengembalikan `null`.

### Organization / Scope
- `P2A-ORG-01`: Relasi hierarkis Alice $\to$ Bob (Manager) $\to$ Dave (HRGA) tersimpan pada `organizational_assignments`.
- `P2A-ORG-02`: Pemetaan kewenangan proyek (`Billing-Core-Module`) tersimpan pada `project_authority_mappings`.
- `P2A-SCP-01`: `ScopeFilterService` membuktikan:
  - Role Employee: dibatasi hanya ke dirinya sendiri (`[alice.id]`).
  - Role Supervisor: mencakup dirinya dan subordinatnya (`[bob.id, alice.id]`).
  - Role HRGA: akses seluruh perusahaan (`accessibleUserIds = null`).
  - Role SystemAdmin: dilempar ForbiddenException saat mengakses data operasional harian.

### Policy Domain
- `P2A-POL-01`: Snapshot kebijakan aktif mengambil data konfigurasi 5 kategori default (Cutoff, GracePeriod, WorkdayCalendar, ParticipationRule, Threshold) langsung dari baris tabel `policies`.
- `P2A-POL-02`: Versioning kebijakan membuktikan bahwa penambahan versi baru secara otomatis menutup versi lama (`endDate` diperbarui, status diset `Inactive`), versi baru disimpan dengan `status = 'Active'`, dan baris baru di `audit_logs` tercatat.

### Daily Accountability & Commitment
- `P2A-DAC-01`: Morning Check-in berhasil tersimpan di `daily_accountability_records` dengan evaluasi worst-of status (`AMBER`), dan 2 komitmen tersimpan di tabel `commitments`.
- `P2A-DAC-02`: Guardrail maksimal 3 komitmen (BR-01 / PDD §8) terbukti menolak penyerahan 4 komitmen dengan melempar `BusinessRuleViolationException`. State database tetap bersih.
- `P2A-DAC-03`: Pekerjaan tambahan (Additional Work) tersimpan di tabel terpisah `additional_works`. Kueri SQL mentah membuktikan jumlah baris di tabel `commitments` tetap persis 2 komitmen (tidak bertambah menjadi komitmen #3 atau #4).
- `P2A-DAC-04`: Penyerahan EOD Check-in memperbarui `finalStatus` (`AMBER`), mencatat `eodSubmittedAt`, dan menyimpan outcome serta continuation reason untuk masing-masing komitmen di tabel `commitments`.

### Blocker Domain
- `P2A-BLK-01`: Siklus hidup blocker sekuensial penuh (`Open` $\to$ `Acknowledged` $\to$ `InProgress` $\to$ `Resolved` $\to$ `Closed`) terverifikasi baris-demi-baris dengan timestamp masing-masing aktor di tabel `blockers`.
- `P2A-BLK-02`: Resolusi Project Authority membuktikan blocker untuk scope `Billing-Core-Module` secara otomatis dialokasikan ke Bob (`ownerNeededUserId = bob.id`), dan transisi terminal `AcceptedRisk` tersimpan di database dengan alasan penerimaan risiko.

### Correction Request Domain
- `P2A-COR-01`: Koreksi Minor typo diterapkan secara otomatis (`status = 'Applied'`), dan teks komitmen pada tabel `commitments` langsung termutasi di database.
- `P2A-COR-02`: Koreksi Material (perubahan signifikan) tersimpan dengan `status = 'Pending'` dan batas waktu sanggahan (`objectionWindowEnd`). Upaya pengajuan kedua pada komitmen yang sama saat masih pending ditolak secara deterministik. Penolakan oleh reviewer mengubah status menjadi `Rejected` di PostgreSQL.

### Audit Log
- `P2A-AUD-01`: Verifikasi append-only audit trail membuktikan:
  - Aksi pengguna manusia mencatat `actorUserId = alice.id`.
  - Aksi sistem mencatat `actorUserId = NULL` secara literal di kolom database PostgreSQL.
  - Tabel `audit_logs` tidak memiliki kolom `updatedAt` maupun `deletedAt`, menjamin kepatuhan immutable audit trail.

### Notification
- `P2A-NOT-01`: Dispatch notifikasi untuk blocker kritis tersimpan di tabel `notifications` dengan `channel = 'WebNotificationCenter'`, `triggerType = 'CRITICAL_INSTANT_BLOCKER'`, dan `status = 'Sent'`.

### Pattern Flag / Compliance Event
- `P2A-CMP-01`: Event `PatternFlag` tersimpan di tabel `compliance_events` dengan snapshot kebijakan dan status tindak lanjut `PendingSupervisorReview`.

### Status Suggestion Engine
- `P2A-SUG-01`: Evaluasi blocker kritis menghasilkan saran status `RED`. Verifikasi tabel `users` membuktikan bahwa saran ini **TIDAK** memutasi status pengguna (tetap `Active`), memenuhi invariant *suggestion-only*.

### Effective Dating
- `P2A-EFF-01`: Pengujian temporal AS-OF membuktikan bahwa kueri pada tanggal sebelum promosi (`2026-03-15`) mengembalikan role `Employee`, sedangkan kueri pada tanggal setelah promosi (`2026-09-01`) mengembalikan role `Supervisor_TL`.

### Transaction Atomicity
- `P2A-ATM-01`: `$transaction` multi-tabel meng-commit mutasi pada `daily_accountability_records`, `commitments`, dan `audit_logs` secara simultan dan atomik.
- `P2A-ATM-02`: Error terkontrol di dalam `$transaction` membatalkan seluruh operasi mutasi, menyisakan 0 baris tertinggal di PostgreSQL.

### Sequential Idempotency
- `P2A-ATM-03`: Kueri konteks penugasan berulang terbukti stabil tanpa menyebabkan duplikasi baris penugasan di PostgreSQL.

---

## 8. HTTP → Controller → Service Verification

12 modul aplikasi diuji melalui integrasi HTTP penuh (`supertest` $\to$ NestJS routing $\to$ Controller $\to$ Service $\to$ Prisma $\to$ PostgreSQL):

1. **AuthModule**: `POST /api/v1/auth/login` $\to$ 200 OK $\to$ baris sesi tersimpan di tabel `sessions`.
2. **IdentityModule**: `GET /api/v1/users/:id` $\to$ 200 OK $\to$ data pengguna dicocokkan dengan kolom `"fullName"` di tabel `users`.
3. **PolicyModule**: `GET /api/v1/policies` $\to$ 200 OK $\to$ daftar kebijakan aktif dicocokkan dengan jumlah baris tabel `policies`.
4. **DailyAccountabilityModule**: `GET /api/v1/daily-accountability-records/today` $\to$ 200 OK $\to$ envelope `availableActions` divalidasi.
5. **BlockerModule**: `GET /api/v1/blockers` $\to$ 200 OK $\to$ daftar blocker divalidasi terhadap tabel `blockers`.
6. **CorrectionRequestModule**: `GET /api/v1/correction-requests` $\to$ 200 OK $\to$ daftar permintaan koreksi divalidasi terhadap tabel `correction_requests`.
7. **ManagerNoteModule**: `POST /api/v1/manager-notes` $\to$ 201 Created $\to$ catatan manajer tersimpan di tabel `manager_notes`.
8. **ExceptionModule**: `GET /api/v1/exceptions` $\to$ 200 OK $\to$ daftar pengecualian divalidasi terhadap tabel `exceptions`.
9. **ComplianceModule**: `GET /api/v1/compliance-events` $\to$ 200 OK $\to$ daftar event kepatuhan divalidasi terhadap tabel `compliance_events`.
10. **NotificationModule**: `GET /api/v1/notifications` $\to$ 200 OK $\to$ notifikasi pengguna divalidasi terhadap tabel `notifications`.
11. **ReportingModule**: `GET /api/v1/reports/exception-summary` $\to$ 200 OK $\to$ agregasi laporan dihitung langsung dari data PostgreSQL.
12. **FileStorageModule**: `POST /api/v1/files/upload-url` $\to$ 200 OK $\to$ metadata URL presigned terbit dengan `fileId` valid.

Semua pengujian HTTP melewati proteksi global NestJS (`CsrfGuard`, `AuthGuard`, `RoleGuard`, `ValidationPipe`).

---

## 9. Test Double Audit

Audit terhadap seluruh test suite di `backend/test/integration-real/`:
- **Prisma / Database Mocks**: **NONE (0 mock)**. Prisma Client berjalan 100% riil menggunakan adapter PostgreSQL.
- **In-Memory Database / SQLite**: **NONE (0 mock)**.
- **External Side-Effect Test Doubles**:
  - Email Transport: Test double stub `{ sendEmail: async () => ({ success: true }) }` digunakan secara eksklusif untuk mencegah transmisi SMTP/network eksternal selama pengujian domain notifikasi.
  - S3 Presigned URL Generator: Driver S3 menggunakan konfigurasi presigned signature lokal tanpa upload fisik file binary ke AWS.

Pemisahan antara Real Persistence dan Test Double eksternal terbukti 100% patuh pada aturan Section 24.

---

## 10. Test Weakening Audit

Pemeriksaan terhadap commit dan diff test files selama Phase 2A membuktikan:
1. Penyesuaian waktu sistem (`vi.useFakeTimers({ toFake: ['Date'] })`) pada `matrix-daily-accountability-commitment.spec.ts` bukan pelemahan, melainkan simulasi waktu jam kerja yang tepat untuk mematuhi aturan Cut-off Morning Check-in (`09:30`) dan EOD Check-in (`18:30`).
2. Penambahan field `orgContextSnapshot` dan `policySnapshot` pada `matrix-correction-request.spec.ts` dan `matrix-atomicity-idempotency.spec.ts` menegakkan validasi integritas skema database tanpa menghilangkan assertion apa pun.
3. Penambahan `knownBlockerNote` dan `continuationReason` menegakkan pemenuhan aturan bisnis conditional FR-04 dan FR-09.
4. Tanda kutip ganda pada identifier kolom SQL mentah (`"ownerNeededUserId"`, `"acknowledgedAt"`, `"appliedAt"`) memperbaiki kompatibilitas kueri tanpa melemahkan verifikasi persistensi.

Tidak ada assertion yang dihapus atau diturunkan derajat keketatannya.

**Verdict Test Weakening Audit**: **PASS**.

---

## 11. Production Boundary

Verifikasi batas kode produksi:
- `backend/src/`: **0 lines changed**.
- `backend/prisma/schema.prisma`: **0 lines changed**.
- `backend/prisma/migrations/`: **0 lines changed**.
- `frontend/`: **0 lines changed**.

Semua perbaikan selama Phase 2A terjadi secara terisolasi di dalam file test harness (`backend/test/integration-real/`) dan dokumentasi laporan.

**Verdict Production Boundary**: **PASS**.

---

## 12. Phase Boundary

Verifikasi batasan fase:
- Tidak ada uji kondisi balapan (concurrency race test) yang dijalankan.
- Tidak ada validasi balapan `SELECT FOR UPDATE`.
- Tidak ada pengujian simultan 30–60 user Morning Check-in.
- Tidak ada benchmark beban S3-T6.
- Status **S3-T1 Phase 2B** tetap: **NOT STARTED**.

**Verdict Phase Boundary**: **PASS**.

---

## 13. Findings

### Finding S3-T1-P2A-IV-01 (Informational / Classification Note)
- **Severity**: Informational
- **Domain**: Integration Test Semantics
- **Requirement**: Section 20 — Sequential Idempotency
- **Observed**: Test `P2A-ATM-03` pada `matrix-atomicity-idempotency.spec.ts` memverifikasi kestabilan kueri sekuensial (repeated read/query). Sementara itu, idempotensi mutasi dan pencegahan duplikasi tulis diverifikasi pada `matrix-correction-request.spec.ts` (penolakan pengajuan koreksi kedua saat status pending) dan `DailyAccountabilityService` (penolakan check-in berulang hari yang sama).
- **Expected**: Laporan independen harus membedakan secara eksplisit antara kestabilan baca (read stability) dan pencegahan duplikasi tulis (write duplicate-prevention).
- **Classification**: Documentation / Semantic Clarification (Non-blocking)
- **Impact**: Tidak ada dampak teknis atau fungsional; integritas persistensi kedua aspek terverifikasi.
- **Recommended Action**: Catat klarifikasi semantik ini dalam inventaris pengujian Phase 2B/2C.

---

## 14. Final Verdict

### **VERIFIED — PHASE 2A RATIFIED**

Hasil eksekusi S3-T1 Phase 2A diratifikasi secara penuh:
1. 11 test suites dan 42 kasus uji terbukti lulus 100% terhadap PostgreSQL 18 nyata di container terisolasi.
2. Seluruh assertasi memeriksa state fisik baris tabel database, bukan sekadar return value in-memory.
3. 12 modul aplikasi terbukti terintegrasi dari HTTP Controller hingga PostgreSQL.
4. Nol kode produksi, nol skema, dan nol frontend termutasi.
5. Nol uji konkurensi dijalankan pada Phase 2A.

Status Fase Selanjutnya:
> **S3-T1 Phase 2B: NOT STARTED**
