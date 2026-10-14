# S2-T4 Final Runtime Evidence Verification
## Real PostgreSQL Persistence & Audit Integrity Verification
## Strict Independent Verification — No Remediation

- **Verification Date**: 2026-10-06
- **Auditor Role**: Independent Verifier
- **Scope Phase**: S2-T4 Final Runtime Evidence Gate
- **Status Gate**: REAL POSTGRESQL RUNTIME PERSISTENCE

---

## 1. Objective

Menutup satu-satunya evidence gap yang tersisa dari verifikasi S2-T4 sebelumnya:
Membuktikan secara fisik dan deterministik pada **PostgreSQL nyata** bahwa implementasi persistence `AuditLog` dengan semantik sistem (`actorUserId = NULL`) berjalan dengan integritas relasional penuh, mematuhi foreign key constraint, mendukung atomisitas transaksi, serta mendeteksi ada tidaknya defek runtime nyata tanpa mock/in-memory database.

---

## 2. Scope

1. **Database Identity & Compatibility Verification**:
   - Menghubungkan aplikasi ke PostgreSQL runtime nyata (bukan SQLite, bukan in-memory, bukan mocked Prisma).
   - Memvalidasi versi database engine, nama database, pengguna, host, dan port.
2. **Schema & Migration Gate**:
   - Memverifikasi deployment migrasi Prisma pada PostgreSQL nyata tanpa modifikasi schema.
   - Menguji struktur tabel fisik `audit_logs` dan constraint `audit_logs_actorUserId_fkey`.
3. **Controlled Foreign Key Integrity Gate**:
   - Pembuktian penerimaan UUID actor valid.
   - Pembuktian penerimaan NULL actor untuk system-triggered audit log.
   - Pembuktian penolakan UUID non-existent oleh foreign key constraint PostgreSQL (`23503`).
4. **Primary Test — Blocker Auto-Escalation**:
   - Eksekusi alur domain riil `BlockerService.evaluateAutoEscalation()`.
   - Pembuktian pembentukan row fisik `AuditLog` dengan `action = 'BLOCKER_AUTO_ESCALATED'` dan `actorUserId = NULL`.
   - Pengujian idempotensi pada eksekusi berulang.
5. **Transaction & Atomicity Gate**:
   - Pembuktian bahwa pembatalan transaksi (rollback) tidak meninggalkan baris audit palsu (phantom row).
6. **Secondary Test — Correction Request Auto-Applied**:
   - Pengujian alur domain `CorrectionRequestService.evaluateExpiredObjectionWindows()`.
   - Dokumentasi hasil runtime persistence terhadap PostgreSQL nyata.
7. **Audit Immutability & Audit Retention**:
   - Verifikasi sifat append-only dari `AuditService`.
8. **Final Sanity Check — S2-T4-NOTIF-03**:
   - Static scan terhadap seluruh kode backend untuk memastikan ketiadaan ad-hoc notification trigger.
9. **Full Regression Suite**:
   - Eksekusi unit/integration test backend, frontend test, typecheck backend & frontend, lint, serta production build.

---

## 3. Design Authority

- **01-PDD(2).md**: Product Definition Document.
- **02-PRD(2).md**: Product Requirements Document (FR-12, FR-15, FR-19).
- **05-SAD.md**: System Architecture Document (§5.5 Blocker, §5.6 Correction, §5.10 Audit, §9.4 State Machine, §9.9 Concurrency, §11 Scheduler, §12 Notification, §15 Audit Integrity).
- **08-ADR.md**: Architecture Decision Records (ADR-003 Transactional Outbox/Audit, ADR-016 Role-Based Output Prompts, ADR-018 System Actor Semantics in AuditLog).
- **09-Known-Limitations.md**: Known Limitations Register.
- **10-S2-Audit-Findings-Register.md**: Findings Register (S2-T4-AUDIT-01, S2-T4-NOTIF-03).
- **Prisma Schema & Migrations**: `backend/prisma/schema.prisma` dan migrasi `20260916041729_init`.

---

## 4. Environment

- **Database Engine**: PostgreSQL 18 (Official x86_64 binaries, compiled by msvc-19.44.35226, 64-bit)
- **Deployment Mode**: Isolated ephemeral verification database cluster (`pg_verify_data`)
- **Host / Socket**: `127.0.0.1` (TCP/IP loopback)
- **Port**: `54332` (Dedicated isolated non-conflicting port)
- **Database Name**: `workpulse_verify`
- **Verification User**: `postgres`
- **ORM / Client**: Prisma Client `7.10.0` (@prisma/adapter-pg `7.10.0`)
- **Backend Framework**: NestJS 12.0.1
- **Node.js Runtime**: v22.x
- **No external production/Supabase dependency**: Terisolasi 100% dari jaringan luar/production pooler.

---

## 5. Database Identity Evidence

Query identitas database dieksekusi secara langsung melalui Prisma raw query ke instance PostgreSQL:

```sql
SELECT 
  version(),
  current_database() as database_name,
  current_user as user_name,
  inet_server_addr()::text as server_addr,
  inet_server_port() as server_port;
```

**Hasil Capture Runtime PostgreSQL**:
```json
{
  "version": "PostgreSQL 18.4 on x86_64-windows, compiled by msvc-19.44.35226, 64-bit",
  "database_name": "workpulse_verify",
  "user_name": "postgres",
  "server_addr": "127.0.0.1/32",
  "server_port": 54332
}
```

**Verdict Gate**: **PASS**.
Engine terbukti merupakan PostgreSQL fisik asli versi 18.4, terhubung pada port 54332, database `workpulse_verify`. Tidak ada mock, tidak ada SQLite, dan tidak ada database palsu.

---

## 6. Schema Verification

Penerapan schema dilakukan menggunakan workflow resmi repository:
```powershell
npx prisma migrate deploy
```
Status migrasi: `Database schema is up to date!` (Migrasi `20260916041729_init` diaplikasikan).

### A. Metadata Kolom `audit_logs` (Information Schema Query)
```sql
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

**Hasil Fisik**:
| column_name | data_type | udt_name | is_nullable | Status |
|---|---|---|---|---|
| `id` | uuid | uuid | NO | PK valid |
| `actorUserId` | uuid | uuid | YES | **Nullable UUID (SAD §15.2 Validated)** |
| `action` | character varying | varchar | NO | Mandatory action |
| `relatedEntityType` | character varying | varchar | NO | Mandatory entity type |
| `relatedEntityId` | uuid | uuid | NO | Mandatory entity id |
| `valueBefore` | jsonb | jsonb | YES | Snapshot JSONB |
| `valueAfter` | jsonb | jsonb | YES | Snapshot JSONB |
| `timestamp` | timestamp without time zone | timestamp | NO | Temporal marker |

### B. Foreign Key Constraints pada `audit_logs` (PG Constraint Catalog Query)
```sql
SELECT conname, contype::text, pg_get_constraintdef(c.oid) as def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'audit_logs' AND c.contype = 'f';
```

**Hasil Fisik**:
- `audit_logs_actorUserId_fkey`: `FOREIGN KEY ("actorUserId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL`

**Verdict Gate**: **PASS**.
Kolom `actorUserId` terbukti secara fisik bertipe `uuid`, `nullable = YES`, dan memiliki referensi Foreign Key aktif ke `users(id)` dengan aksi `ON DELETE SET NULL`.

---

## 7. Migration/Schema Drift Result

Perbandingan antara `schema.prisma`, migrasi fisik SQL (`20260916041729_init/migration.sql`), dan instance PostgreSQL nyata:
```powershell
npx prisma migrate status
```
Output:
```
1 migration found in prisma/migrations
Database schema is up to date!
```
- **Schema Drift Result**: **PASS** (Zero Drift Detected).

---

## 8. BLOCKER_AUTO_ESCALATED Runtime Test

### A. Test Setup & Execution
1. Dibuat record `User` untuk:
   - Pelapor (Reporter Alice, id: `06e984e7-1a90-4a2e-86cb-89cbb509f930...`)
   - Pemilik Blocker (Owner Bob, id: `27c6746c...`)
   - Supervisor (Supervisor Carol, id: `a77c36c7-33cf-47dd-9350-c0926f877b56`)
2. Dibuat record `OrganizationalAssignment`: Bob memiliki `directManagerId = Carol.id`.
3. Dibuat record `Policy` (`EscalationThreshold`): `unacknowledgedThresholdHours = 4`.
4. Dibuat record `Blocker`:
   - `severity = Critical`
   - `status = Open`
   - `ownerNeededType = OrganizationalAuthority`
   - `ownerNeededUserId = Bob.id`
   - `acknowledgedAt = null`
   - `raisedAt = 5 jam yang lalu` (> threshold 4 jam).
5. Dipanggil service riil: `blockerService.evaluateAutoEscalation(now)`.

### B. Hasil Eksekusi Domain Service
- `BlockerService.evaluateAutoEscalation executed. escalatedCount = 1`
- Idempotency test (eksekusi kedua dengan timestamp yang sama): `escalatedCount = 0`.

---

## 9. AuditLog Persistence Evidence

Query database independen dieksekusi secara terpisah pada tabel fisik PostgreSQL `audit_logs`:

```sql
SELECT 
  id,
  action,
  "actorUserId",
  "relatedEntityType",
  "relatedEntityId",
  "valueAfter",
  timestamp
FROM audit_logs
WHERE action = 'BLOCKER_AUTO_ESCALATED' AND "relatedEntityId" = '06e984e7-1a90-4a2e-86cb-89cbb509f930'::uuid;
```

**Hasil JSON Row PostgreSQL**:
```json
[
  {
    "id": "bbb4e84f-c0b7-42ff-8547-8de60e6a6f49",
    "action": "BLOCKER_AUTO_ESCALATED",
    "actorUserId": null,
    "relatedEntityType": "Blocker",
    "relatedEntityId": "06e984e7-1a90-4a2e-86cb-89cbb509f930",
    "valueAfter": {
      "escalatedAt": "2026-10-06T02:41:48.015Z",
      "targetUserId": "a77c36c7-33cf-47dd-9350-c0926f877b56",
      "thresholdHours": 4,
      "escalationLevel": "NextLevelManager"
    },
    "timestamp": "2026-10-06T02:41:48.066Z"
  }
]
```

**Bukti Idempotensi**:
Query `COUNT(*)` setelah eksekusi kedua menghasilkan tepat **1 baris** (tidak ada duplikasi baris audit).

---

## 10. SYSTEM Actor Semantics

Sesuai SAD §15.2 dan ADR-018:
- Aksi yang diinisiasi oleh sistem/scheduler ditandai secara kanonikal melalui:
  1. `action = 'BLOCKER_AUTO_ESCALATED'` (semantik aksi sistem spesifik domain).
  2. `actorUserId = NULL` (tidak ada aktor manusia).
- PostgreSQL menerima baris ini secara native karena kolom `actorUserId` didefinisikan sebagai nullable UUID.
- Tidak ada sentinel string `'SYSTEM'`, tidak ada fake user UUID, dan tidak ada pelanggaran tipe data.

---

## 11. FK Integrity

Uji terkontrol Foreign Key dijalankan langsung pada engine PostgreSQL:
1. **Valid User UUID**:
   - `INSERT` AuditLog dengan UUID `User` yang valid → **SUCCEEDED** (`id = b1db210e-bcf2-4522-b3c1-e7727171fda7`).
2. **System-Triggered NULL Actor**:
   - `INSERT` AuditLog dengan `actorUserId = NULL` → **SUCCEEDED** (`id = 4ad7d83c-a134-4d86-8560-bc46c39bd9d9`).
3. **Invalid Non-Existent UUID Actor**:
   - `INSERT` AuditLog dengan UUID fiktif `00000000-0000-0000-0000-000000000099` → **DITOLAK SECARA TEGAS OLEH POSTGRESQL ENGINE**:
     - PostgreSQL Log: `ERROR: insert or update on table "audit_logs" violates foreign key constraint "audit_logs_actorUserId_fkey"`
     - PostgreSQL Error Code: `23503` (foreign_key_violation).

**Verdict Gate**: **PASS**. Integritas relasional terbukti aktif dan ditegakkan oleh engine PostgreSQL.

---

## 12. Transaction/Atomicity

Pengujian atomisitas transaksi dilakukan melalui pembatalan transaksi terkontrol (`$transaction` dengan deliberate error abort):
- Transaksi membuka blok dan memanggil `auditService.record({ action: 'SHOULD_ROLLBACK_ACTION' })`.
- Transaksi melempar exception sebelum commit.
- Database fisik di-query:
  ```sql
  SELECT COUNT(*)::int as cnt FROM audit_logs WHERE action = 'SHOULD_ROLLBACK_ACTION';
  ```
- **Hasil**: `cnt = 0` (Nol baris phantom tercatat).

**Verdict Gate**: **PASS**.

---

## 13. CORRECTION_AUTO_APPLIED — Secondary Test & Defect Discovery

Pengujian sekunder alur auto-apply koreksi dijalankan menggunakan instance riil `CorrectionRequestService.evaluateExpiredObjectionWindows()` terhadap PostgreSQL nyata:
1. Dibuat `DailyAccountabilityRecord` dan `Commitment`.
2. Dibuat `CorrectionRequest` berklasifikasi `Material` dengan `objectionWindowEnd = 1 jam yang lalu`.
3. Dipanggil method riil: `correctionService.evaluateExpiredObjectionWindows()`.

### Temuan Defek Runtime Riil (Defect Discovery):
Eksekusi terhadap PostgreSQL nyata **GAGAL** dengan error SQL:
```
[Nest] ERROR [CorrectionRequestService] Gagal memproses auto-apply untuk koreksi 2b721be8-dcf9-4b23-9706-c98db5c2b1d6: 
Invalid `prisma.$queryRaw()` invocation:
Raw query failed. Code: `42703`. Message: `column "target_commitment_id" does not exist`
```

### Analisis Akar Masalah (Root Cause):
Pada `backend/src/modules/correction-request/services/correction-request.service.ts` baris 550-555:
```ts
const lockedRows: any[] = await tx.$queryRaw`
  SELECT id, status, target_commitment_id, requested_change, requested_by_user_id
  FROM correction_requests
  WHERE id = ${item.id}::uuid
  FOR UPDATE;
`;
```
Dan pada baris 421-426 (`objectCorrection`):
```ts
const lockedRows: any[] = await tx.$queryRaw`
  SELECT id, status, objection_window_end, requested_by_user_id
  FROM correction_requests
  WHERE id = ${id}::uuid
  FOR UPDATE;
`;
```
- Dalam PostgreSQL fisik, tabel `correction_requests` dibangkitkan oleh Prisma tanpa atribut `@map` pada kolom tersebut, sehingga nama kolom fisik PostgreSQL adalah camelCase: `"targetCommitmentId"`, `"requestedChange"`, `"requestedByUserId"`, dan `"objectionWindowEnd"`.
- Kueri raw SQL menulis kolom unquoted snake_case (`target_commitment_id`, `requested_change`, `requested_by_user_id`, `objection_window_end`).
- Pada unit test sebelumnya, kueri raw SQL di-mock menggunakan Prisma Mock (`prismaMock.$queryRaw.mockResolvedValue(...)`), sehingga ketidaksesuaian nama kolom ini tidak pernah terdeteksi pada unit test suite.
- Ketika dieksekusi terhadap PostgreSQL fisik nyata, PostgreSQL secara tepat menolak kueri dengan kode error `42703` (`undefined_column`), membatalkan transaksi, dan menghasilkan `processedCount = 0`.
- Akibatnya, `CORRECTION_AUTO_APPLIED` tidak dapat tercatat pada alur scheduler ini.

Sesuai aturan verifikasi independen: **DILARANG MELAKUKAN REMEDIASI KODE PRODUCTION PADA TAHAP INI**. Defek dilaporkan secara transparan.

---

## 14. Audit Immutability

Pemeriksaan statis terhadap `backend/src/modules/audit/audit.service.ts`:
- `AuditService` hanya menyediakan method `record` (Prisma `create`), `findByEntity` (`findMany`), dan `findByActor` (`findMany`).
- Tidak terdapat method `update`, `delete`, `upsert`, maupun `deleteMany`.
- Pencarian grep regex `auditLog\.(update|delete)` di seluruh codebase `backend/src` menghasilkan **0 temuan**.
- Integritas append-only audit trail terbukti terpenuhi pada level aplikasi.

---

## 15. NOTIF-03 Final Sanity Check

Pemeriksaan statis final terhadap seluruh codebase backend untuk trigger notifikasi:
- Pencarian `MANAGER_NOTE_CREATED`:
  - 6 kemunculan ditemukan: seluruhnya berada pada konteks `AuditLog` action (`action: 'MANAGER_NOTE_CREATED'`).
  - **Nol kemunculan** sebagai `triggerType` notifikasi.
- Pencarian `notificationService.dispatch`:
  - Seluruh 16 pemanggilan `dispatch` di seluruh codebase secara konsisten menggunakan nilai kanonikal enum `SystemNotificationTrigger` (13 canonical triggers).
  - Tidak ada ad-hoc trigger yang melanggar SAD §12.1.

**Verdict Gate**: **PASS**. S2-T4-NOTIF-03 terkonfirmasi bersih tanpa regresi.

---

## 16. Regression Results

| Test Category | Target / Scope | Test Files | Passed | Failed | Skipped | Duration |
|---|---|---|---|---|---|---|
| Targeted Audit Tests | `test/audit/`, `src/modules/audit/` | 1 | 4 | 0 | 0 | 616ms |
| Targeted Blocker Tests | `src/modules/blocker/`, `test/integration/blocker-flow.spec.ts` | 3 | 52 | 0 | 0 | 810ms |
| Targeted Correction Tests | `src/modules/correction-request/`, `test/integration/correction-request-flow.spec.ts` | 3 | 39 | 0 | 0 | 1.59s |
| Targeted Scheduler Tests | `src/modules/scheduler/` | 2 | 37 | 0 | 0 | 1.19s |
| **Backend Full Suite** | `npm test` (`vitest run`) | **46** | **639** | **0** | **0** | **7.63s** |
| **Frontend Full Suite** | `npm test` (`vitest run`) | **6** | **91** | **0** | **0** | **9.91s** |
| Backend Typecheck | `npx tsc --noEmit` | - | Clean | 0 | - | - |
| Frontend Typecheck | `npx tsc --noEmit` | - | Clean | 0 | - | - |
| Backend Linter | `npm run lint` (`oxlint`) | 180 files | Clean | 0 (10 warn) | - | 20ms |
| Backend Production Build | `npm run build` (`nest build`) | - | Clean | 0 | - | 8.2s |
| Frontend Production Build | `npm run build` (`tsc && vite build`) | - | Clean | 0 | - | 822ms |

---

## 17. Evidence Classification

- **Static Source Evidence**:
  - `AuditService` bersifat append-only (tidak ada method `update`/`delete`).
  - Scan `MANAGER_NOTE_CREATED` membuktikan tidak digunakan sebagai notifikasi trigger (NOTIF-03 bersih).
  - Scan pemanggilan `dispatch` membuktikan 100% menggunakan 13 kanonikal trigger.
- **Unit Test Evidence**:
  - 639 backend unit/integration tests lulus (mocked dependencies).
  - 91 frontend component tests lulus.
- **Mocked Test Evidence**:
  - `test/integration/blocker-flow.spec.ts` dan `test/integration/correction-request-flow.spec.ts` memvalidasi logika alur dengan mocked Prisma.
- **Real PostgreSQL Runtime Evidence**:
  - Engine: PostgreSQL 18.4 fisik pada port 54332 (`workpulse_verify`).
  - Metadata `audit_logs.actorUserId` nullable UUID terverifikasi langsung via `information_schema`.
  - Constraint FK `audit_logs_actorUserId_fkey` terverifikasi via `pg_constraint`.
  - FK rejection code `23503` terverifikasi pada raw query insert dengan UUID fiktif.
  - Alur riil `BlockerService.evaluateAutoEscalation` berhasil meng-insert baris audit riil `bbb4e84f-c0b7-42ff-8547-8de60e6a6f49` dengan `actorUserId = NULL` dan `action = 'BLOCKER_AUTO_ESCALATED'`.
  - Transaksi atomik terbukti membatalkan write tanpa sisa phantom row.
  - Alur riil `CorrectionRequestService.evaluateExpiredObjectionWindows` mendeteksi runtime defect konkret (SQL column name mismatch code `42703`).

---

## 18. Real PostgreSQL Evidence Matrix

| Evidence Item | Expected | Actual (Real PostgreSQL 18) | Result |
|---|---|---|---|
| PostgreSQL version | PostgreSQL >= 16 | PostgreSQL 18.4 on x86_64-windows | **PASS** |
| Database identity | Isolated verification DB | `workpulse_verify` on port 54332 | **PASS** |
| Schema applied | Migrations deployed | `20260916041729_init` applied cleanly | **PASS** |
| `audit_logs` exists | Table exists | Yes (`information_schema.columns`) | **PASS** |
| `actorUserId` type | UUID nullable | `data_type: uuid`, `is_nullable: YES` | **PASS** |
| FK exists | Reference to `users(id)` | `audit_logs_actorUserId_fkey` exists | **PASS** |
| Blocker flow executed | Domain service executes | `BlockerService.evaluateAutoEscalation` returned count = 1 | **PASS** |
| AuditLog persisted | Physical row in PostgreSQL | Row `bbb4e84f-c0b7-42ff-8547-8de60e6a6f49` persisted | **PASS** |
| Action value | `BLOCKER_AUTO_ESCALATED` | `BLOCKER_AUTO_ESCALATED` | **PASS** |
| `actorUserId` value | `NULL` | `null` | **PASS** |
| Row retrievable | Retrievable via SELECT | Retrievable with exact payloads | **PASS** |
| FK integrity | Enforced by PostgreSQL | Valid accepted, NULL accepted, invalid rejected (`23503`) | **PASS** |
| Transaction atomicity | Rollback leaves 0 rows | Rollback leaves 0 phantom rows | **PASS** |
| Correction flow | Auto-apply persists audit | **FAILED** (SQL Error `42703`: column `target_commitment_id` does not exist) | **FAIL** |

---

## 19. Remaining Evidence Gaps

1. **S2-T4-AUDIT-01 (Primary Gate — BLOCKER_AUTO_ESCALATED)**: **Zero Evidence Gap**.
   - Terbukti 100% pada runtime PostgreSQL 18 nyata bahwa `AuditLog` dengan `actorUserId = NULL` berhasil dipersist, tidak melanggar FK, dan dapat dibaca kembali.
2. **Correction Request Scheduler Raw SQL Bug**:
   - `CorrectionRequestService.evaluateExpiredObjectionWindows` dan `objectCorrection` menggunakan identifier snake_case (`target_commitment_id`, `requested_change`, `requested_by_user_id`, `objection_window_end`) pada kueri `tx.$queryRaw` untuk `FOR UPDATE`, sedangkan kolom fisik PostgreSQL yang dibangkitkan Prisma adalah camelCase (`targetCommitmentId`, `requestedChange`, `requestedByUserId`, `objectionWindowEnd`).
   - Karena mode verifikasi adalah **STRICT AUDIT-ONLY / NO REMEDIATION**, defek ini dilaporkan untuk ditangani pada tiket remediari terpisah.

---

## 20. Final Verdict

Berdasarkan aturan ketat evaluasi pada instruksi verifikasi:
- PostgreSQL nyata **berhasil dijalankan**.
- PRIMARY TEST (`BLOCKER_AUTO_ESCALATED` persistence, `actorUserId = NULL`, FK integrity, idempotency, atomicity) **LULUS 100%**.
- Namun, pengujian sekunder terhadap PostgreSQL nyata menemukan **actual implementation defect** pada kueri raw SQL `CorrectionRequestService` (`Code: 42703`, `column "target_commitment_id" does not exist`).

Sesuai aturan Section 25.19:
> "FAILED: Jika real PostgreSQL berhasil dijalankan tetapi menemukan actual implementation defect."

### **FINAL VERDICT: FAILED**

*(Catatan Klasifikasi: Code-level persistence untuk AuditLog NULL actor pada PRIMARY TEST `BLOCKER_AUTO_ESCALATED` adalah **VERIFIED**, namun Final Gate Verdict secara keseluruhan adalah **FAILED** dikarenakan terdeteksinya runtime SQL defect pada `CorrectionRequestService` saat berinteraksi dengan PostgreSQL nyata).*
