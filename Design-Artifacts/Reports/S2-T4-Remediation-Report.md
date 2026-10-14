# S2-T4 REMEDIATION REPORT
## Scheduled Jobs, Notification Triggers, Audit Actions & State Transitions

> **Target Version**: Sprint 2 — Task 4 (S2-T4 Remediation)  
> **Repository**: WorkPulse  
> **Status**: REMEDIATION COMPLETE — READY FOR INDEPENDENT VERIFICATION  
> **Date**: 2026-10-05  

---

## 1. Scope

Laporan ini mendokumentasikan tindakan perbaikan (*remediation*) atas seluruh temuan audit S2-T4 (`S2-T4-NOTIF-01`, `S2-T4-AUDIT-01`, `S2-T4-NOTIF-02`, `S2-T4-NOTIF-03`, `S2-T4-JOB-01`, dan observasi `S2-T4-STATE-01`) pada modul Scheduled Jobs, Notification Triggers, Audit Actions, dan State Transitions di repository WorkPulse.

Remediasi dilaksanakan berlandaskan prinsip-prinsip WorkPulse:
- **No silent state mutation**: Notifikasi dan scheduler tidak mengubah state domain secara diam-diam.
- **Scheduler delegates to domain authority**: Scheduler hanya mengorkestrasi pendelegasian, bukan menjadi business-rule authority atau query engine langsung.
- **Audit append-only & immutable**: Seluruh jejak audit tetap utuh dan valid secara relasional.
- **Database integrity**: Menghindari runtime foreign key violation pada PostgreSQL UUID type.

---

## 2. Source Audit

- **Audit Source Document**: `Design-Artifacts/Reports/S2-T4-Audit-Report.md`
- **Audit Verification Matrix**: `Design-Artifacts/15-S2-T4-Scheduled-Jobs-Notification-State-Audit.md`
- **Initial Verdict**: FAIL (2 HIGH, 2 MEDIUM, 1 LOW, 1 INFO)

---

## 3. Finding Inventory

| Finding ID | Severity | Area | Ringkasan Temuan Audit Awal | Status Remediasi |
|---|---|---|---|---|
| **S2-T4-NOTIF-01** | **HIGH** | Notification Triggers | Canonical trigger `AMBER_SUPPORT_NEEDED` (Trigger #2) dan `RED_STATUS` (Trigger #3) tidak memiliki dispatch di `DailyAccountabilityService`. | **RESOLVED** |
| **S2-T4-AUDIT-01** | **HIGH** | Audit Actions / DB Integrity | Blocker auto-escalation melempar runtime PostgreSQL FK integrity error karena passing string `'SYSTEM'` ke kolom UUID `actorUserId`. | **RESOLVED** |
| **S2-T4-NOTIF-02** | **MEDIUM** | Notification Triggers | Canonical trigger `POLICY_ASSIGNMENT_CHANGED` (Trigger #8) tidak terhubung dari `PolicyService` maupun `IdentityService`. | **RESOLVED** |
| **S2-T4-NOTIF-03** | **MEDIUM** | Notification Triggers | 6 call sites dispatch menggunakan string literal non-standar yang tidak sesuai dengan enum `SystemNotificationTrigger`. | **RESOLVED** |
| **S2-T4-JOB-01** | **LOW** | Scheduled Jobs | `SchedulerService` melakukan 3 query Prisma langsung melanggar prinsip "Scheduler delegates to domain authority". | **RESOLVED** |
| **S2-T4-STATE-01** | **INFO** | State Transitions | Tidak adanya mekanisme koreksi pasca-lock untuk `AdditionalWork` (dibandingkan `Commitment` yang memiliki `CorrectionRequest`). | **PRESERVED (Design limitation as intended)** |

---

## 4. Root Cause Analysis

### 4.1 S2-T4-NOTIF-01 (HIGH)
- **Root Cause**: `DailyAccountabilityService` pada implementasi awalnya tidak menginjeksi `NotificationService`. Pada saat method `submitMorningCheckin`, `submitEodCheckin`, dan `confirmOverride` selesai menyimpan record dan menghitung status (initialStatus / finalStatus), tidak ada pemanggilan dispatch ke sistem notifikasi untuk trigger `AMBER_SUPPORT_NEEDED` maupun `RED_STATUS`.

### 4.2 S2-T4-AUDIT-01 (HIGH)
- **Root Cause**: Kolom `actorUserId` pada model `AuditLog` di Prisma schema didefinisikan sebagai `@db.Uuid` dengan relasi opsional ke tabel `User`. Pada `BlockerService.evaluateAutoEscalation()`, audit record dipanggil dengan `{ actorUserId: 'SYSTEM' }`. PostgreSQL menolak string `'SYSTEM'` karena bukan format UUID valid (syntax error / FK constraint failure).

### 4.3 S2-T4-NOTIF-02 (MEDIUM)
- **Root Cause**: Event mutasi pada policy lifecycle (`createPolicy`, `createPolicyOwnerAssignment`) dan organizational assignment (`createOrganizationalAssignment`) belum mengintegrasikan dispatch trigger #8 `POLICY_ASSIGNMENT_CHANGED`.

### 4.4 S2-T4-NOTIF-03 (MEDIUM)
- **Root Cause**: String literal ad-hoc (`'PATTERN_FLAG_DETECTED'`, `'CORRECTION_MATERIAL_REQUESTED'`, `'CORRECTION_APPLIED'`, `'CORRECTION_REJECTED'`, `'LEAVE_REQUESTED'`, `'LEAVE_APPROVED'`, `'LEAVE_REJECTED'`, `'BLOCKER_CRITICAL_RAISED'`, `'BLOCKER_UNACKNOWLEDGED_THRESHOLD'`) digunakan sebelum standarisasi enum `SystemNotificationTrigger` diselesaikan di seluruh domain modules.

### 4.5 S2-T4-JOB-01 (LOW)
- **Root Cause**: Penggunaan direct database call `prisma.user.findMany`, `prisma.exception.findFirst`, dan `prisma.notification.findFirst` di dalam `SchedulerService` demi kemudahan, yang mengaburkan batas tanggung jawab domain service.

### 4.6 S2-T4-STATE-01 (INFO)
- **Root Cause**: Desain SAD §9.8 dan PDD §8 secara sadar membedakan `Commitment` (komitmen inti pagi yang mempengaruhi status harian dan memiliki alur koreksi) dengan `AdditionalWork` (pekerjaan tambahan tak terduga yang dapat diisi sewaktu-waktu). Tidak adanya form koreksi untuk `AdditionalWork` pasca-EOD lock adalah keputusan desain yang terdokumentasi, bukan cacat implementasi.

---

## 5. Files Changed

1. `backend/src/modules/daily-accountability/services/daily-accountability.service.ts`
2. `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts`
3. `backend/src/modules/blocker/services/blocker.service.ts`
4. `backend/src/modules/policy/policy.service.ts`
5. `backend/src/modules/policy/policy.module.ts`
6. `backend/src/modules/identity/identity.service.ts`
7. `backend/src/modules/identity/identity.module.ts`
8. `backend/src/modules/exception/services/exception.service.ts`
9. `backend/src/modules/compliance/services/compliance.service.ts`
10. `backend/src/modules/correction-request/services/correction-request.service.ts`
11. `backend/src/modules/scheduler/services/scheduler.service.ts`
12. `backend/src/modules/scheduler/scheduler.module.ts`
13. `backend/src/modules/notification/notification.service.ts`
14. `backend/test/integration/correction-request-flow.spec.ts`
15. `backend/test/policy/policy.service.spec.ts`
16. `backend/test/identity/identity.service.spec.ts`
17. `backend/test/notification/notification.service.spec.ts`
18. `backend/src/modules/scheduler/services/scheduler.service.spec.ts`

---

## 6. Detailed Changes Made

### 6.1 S2-T4-NOTIF-01: Wiring AMBER & RED Triggers
- Injeksi `@Optional() private readonly notificationService?: NotificationService` pada `DailyAccountabilityService`.
- Implementasi helper `dispatchStatusNotifications()`:
  - **`RED_STATUS` (Trigger #3)**: Didispatch ke `directManagerId` saat Morning Check-in bernilai RED, saat EOD Check-in bernilai RED, atau saat EOD Override dikonfirmasi bernilai RED.
  - **`AMBER_SUPPORT_NEEDED` (Trigger #2)**: Didispatch ke `employeeUserId` dan `directManagerId` (support owner) saat Morning Check-in bernilai AMBER atau jika ada komitmen dengan risiko AMBER yang membutuhkan bantuan support (`supportNeeded`).
  - **Resilience**: Seluruh dispatch dibungkus dalam `try/catch` dan mencatat warning jika gagal. Kegagalan kanal notifikasi **tidak pernah membatalkan atau memutasi** transaksi check-in yang sudah berhasil disimpan.
  - **No Silent Mutation**: Status GREEN tidak pernah memicu notifikasi.

### 6.2 S2-T4-AUDIT-01: Runtime PostgreSQL FK Bugfix
- Pada `BlockerService.evaluateAutoEscalation()`: Mengubah pemanggilan `auditService.record`:
  - Dari: `actorUserId: 'SYSTEM'`
  - Menjadi: `actorUserId: undefined` (menghapus properti `actorUserId` pada pemanggilan).
- Pada `AuditService.record()`: Jika `actorUserId` bernilai `undefined`, Prisma tidak menambahkan klausa `actor: { connect: { id } }`, sehingga kolom PostgreSQL `actorUserId` tersimpan sebagai `NULL` (valid per skema relasional), sementara log aplikasi tetap mencatat `actor=SYSTEM`. Hal ini selaras dengan implementasi auto-apply pada `CorrectionRequestService` dan SAD §15.2.

### 6.3 S2-T4-NOTIF-02: Wiring POLICY_ASSIGNMENT_CHANGED
- Menambahkan dispatch `SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED` pada:
  1. `PolicyService.createPolicy`: Notifikasi ke seluruh Policy Owner aktif kategori terkait.
  2. `PolicyService.createPolicyOwnerAssignment`: Notifikasi ke user yang ditunjuk sebagai Policy Owner baru.
  3. `IdentityService.createOrganizationalAssignment`: Notifikasi ke user saat penugasan organisasinya (unit/jabatan/atasan) berubah.
- Menambahkan modul `NotificationModule` ke `PolicyModule` dan `IdentityModule`.

### 6.4 S2-T4-NOTIF-03: Enum Standardization
- Mengganti seluruh 6 string literal non-standar di domain services dengan nilai kanonikal dari `SystemNotificationTrigger`:
  - `compliance.service.ts`: `SystemNotificationTrigger.REPEATED_NO_SUBMISSION_FLAG`
  - `correction-request.service.ts`: `SystemNotificationTrigger.CORRECTION_REQUEST_MATERIAL_SUBMITTED`, `SystemNotificationTrigger.CORRECTION_REQUEST_RESOLVED`
  - `exception.service.ts`: `SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED`, `SystemNotificationTrigger.LEAVE_REQUEST_RESOLVED`
  - `blocker.service.ts`: `SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER`, `SystemNotificationTrigger.BLOCKER_UNACKNOWLEDGED_ESCALATION`
- Memperbarui file assertion pengujian integrasi terkait.

### 6.5 S2-T4-JOB-01: Scheduler Domain Delegation
- Menambahkan method domain pada service terkait:
  - `identityService.findActiveUserIds()`
  - `exceptionService.hasApprovedHolidayOnDate(workDate)`
  - `notificationService.hasCutoffReminderNotification(userId, workDate, timingPhase)`
- Merefaktor `SchedulerService` agar 100% mendelegasikan query ke domain service tersebut dan menghapus query Prisma langsung dari scheduler.

---

## 7. Tests Added & Modified

1. **`backend/src/modules/daily-accountability/daily-accountability.service.spec.ts`**:
   - Ditambahkan suite pengujian `Notification Triggers S2-T4-NOTIF-01 (SAD §12.1, PRD FR-11)` dengan 7 skenario pengujian:
     - Morning Check-in mendispatch `AMBER_SUPPORT_NEEDED` ke employee dan manager.
     - Morning Check-in mendispatch `RED_STATUS` ke direct manager.
     - Morning Check-in GREEN tidak mendispatch notifikasi.
     - EOD Check-in mendispatch `RED_STATUS` ke direct manager saat finalStatus RED.
     - EOD Check-in GREEN tidak mendispatch notifikasi.
     - Confirm Override mendispatch `RED_STATUS` saat override ke RED.
     - Error dispatch notifikasi tidak menggagalkan penyerahan check-in (no silent mutation / failure resilience).
2. **`backend/test/integration/correction-request-flow.spec.ts`**:
   - Diperbarui assertion trigger type untuk mencocokkan enum kanonikal `CORRECTION_REQUEST_RESOLVED` dan `CORRECTION_REQUEST_MATERIAL_SUBMITTED`.
3. **`backend/test/policy/policy.service.spec.ts`**:
   - Ditambahkan pengujian dispatch notifikasi saat create policy dan assign policy owner.
4. **`backend/test/identity/identity.service.spec.ts`**:
   - Ditambahkan pengujian dispatch `POLICY_ASSIGNMENT_CHANGED` saat create organizational assignment dan pengujian `findActiveUserIds()`.
5. **`backend/test/notification/notification.service.spec.ts`**:
   - Ditambahkan pengujian `hasCutoffReminderNotification()`.
6. **`backend/src/modules/scheduler/services/scheduler.service.spec.ts`**:
   - Diperbarui mocking dependency `IdentityService` dan verifikasi delegasi domain.

---

## 8. Test Execution Commands & Results

| Test Scope | Command | Result | Details |
|---|---|---|---|
| **Targeted: Daily Accountability** | `npx vitest run src/modules/daily-accountability/daily-accountability.service.spec.ts` | **PASSED** | 84 tests passed (including 7 new notification tests) |
| **Targeted: Correction Request Flow** | `npx vitest run test/integration/correction-request-flow.spec.ts` | **PASSED** | 6 tests passed |
| **Targeted: Scheduler Service** | `npx vitest run src/modules/scheduler/services/scheduler.service.spec.ts` | **PASSED** | 25 tests passed |
| **Targeted: Policy Service** | `npx vitest run test/policy/policy.service.spec.ts` | **PASSED** | 14 tests passed |
| **Targeted: Identity Service** | `npx vitest run test/identity/identity.service.spec.ts` | **PASSED** | 27 tests passed |
| **Full Backend Suite** | `npm test` (di `backend/`) | **PASSED** | **46 test files passed, 639 tests passed, 0 failed** |
| **Full Frontend Suite** | `npm test` (di `frontend/`) | **PASSED** | **6 test files passed, 91 tests passed, 0 failed** |
| **Backend TypeScript Check** | `npx tsc --noEmit` (di `backend/`) | **PASSED** | **0 errors (clean typecheck across all src/ and test/ files)** |
| **Frontend TypeScript Check** | `npx tsc --noEmit` (di `frontend/`) | **PASSED** | **0 errors (clean typecheck)** |
| **Backend Lint** | `npm run lint` (oxlint) | **PASSED** | 0 errors, 7 warnings (unrelated unused vars) |
| **Backend Production Build** | `npm run build` (nest build) | **PASSED** | Compilation successful, 0 errors |
| **Frontend Production Build** | `npm run build` (tsc && vite) | **PASSED** | TypeScript check & bundle build successful |

---

## 9. PostgreSQL Evidence untuk Audit FK Issue (`S2-T4-AUDIT-01`)

- **Analisis Schema Prisma (`schema.prisma`)**:
  ```prisma
  model AuditLog {
    id                String    @id @default(uuid()) @db.Uuid
    actorUserId       String?   @db.Uuid
    actor             User?     @relation(fields: [actorUserId], references: [id])
    action            String    @db.VarChar(100)
    relatedEntityType String    @db.VarChar(100)
    relatedEntityId   String?   @db.Uuid
    ...
  }
  ```
- **Masalah**: Melempar string `'SYSTEM'` ke query insert Prisma menghasilkan:
  `actor: { connect: { id: 'SYSTEM' } }` -> Menghasilkan SQL error PostgreSQL:
  `ERROR: invalid input syntax for type uuid: "SYSTEM"`.
- **Solusi Teruji**:
  Dengan passing `actorUserId: undefined`:
  Prisma mengabaikan relasi `actor` dan mengeksekusi insert dengan `actorUserId = NULL`.
  `AuditService.record()` tetap mencatat log internal `actor=SYSTEM` untuk keperluan observability.
  Hal ini telah dibuktikan pada unit test `test/audit/audit.service.spec.ts`:
  ```ts
  it('harus mencatat audit log sistem (actor=SYSTEM, actorUserId=undefined)', async () => {
    ...
    expect(auditEntry.actorUserId).toBeUndefined();
  });
  ```
  Serta pada flow blocker `test/integration/blocker-flow.spec.ts` di mana auto-escalation dijalankan tanpa runtime exception.

---

## 10. Regression Results

Seluruh cakupan fitur penting Sprint 2 telah dijalankan ulang dan diverifikasi bebas regresi:
- **FR-11 / FR-13**: Daily check-in lifecycle, worst-of computation, dan status suggestion engine tetap bekerja akurat (84 tests passing).
- **FR-19**: Blocker raising, acknowledgement, resolution, dan auto-escalation tetap utuh (16 tests passing).
- **FR-26 / FR-28**: Carry-over draft, role prompt hints, proximity blocker creation pada frontend lulus 100% (91 tests passing).
- **S2-T3 Authorization**: Policy Owner Guard, Role Guard, dan Scope Filter tetap melindungi seluruh endpoint (19 tests passing).
- **Correction Request & Objection Window**: Concurrency race safety dan objection window expiry auto-apply tetap berfungsi konsisten.

---

## 11. Remaining Limitations

- **Database Connection via Supabase Pooler**: Koneksi database remote Supabase pooler pada `.env` interim saat ini menghasilkan network unreachable (`tenant not found`). Seluruh persistensi dan runtime logic diverifikasi dengan mock Prisma engine dan schema verification yang merefleksikan PostgreSQL 18.
- **Push Notification Stub**: Notifikasi channel `BrowserPush` tetap berstatus stub fungsional sesuai SAD §12.4 untuk MVP scope, dengan riwayat persistensi lengkap pada `Notification` (`channel=WebNotificationCenter`).

---

## 12. Items Intentionally NOT Changed

- **`Design-Artifacts/10-S2-Audit-Findings-Register.md`**: Sengaja **TIDAK DIUBAH** sesuai instruksi (status administratif register temuan hanya boleh diperbarui oleh proses Independent Verification).
- **`S2-T4-STATE-01`**: Perilaku post-lock `AdditionalWork` dipertahankan sesuai SAD §9.8 (tidak menambahkan form koreksi material untuk AdditionalWork karena melanggar batasan desain produk yang telah ditetapkan).

---

## 13. Conclusion

**S2-T4 REMEDIATION COMPLETE — READY FOR INDEPENDENT VERIFICATION**

Seluruh 5 finding audit berkategori defek telah diperbaiki secara tuntas pada domain logic backend, didukung unit test dan integration test menyeluruh (639 backend tests + 91 frontend tests = 730 tests lulus tanpa kegagalan), serta bebas dari regresi. Observasi `S2-T4-STATE-01` telah dianalisis dan dipertahankan sesuai arsitektur yang berlaku.
