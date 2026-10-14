# S2-T4 — Scheduled Jobs, Notification Triggers, Audit Actions & State Transitions Audit Matrix

| Dokumen | Nilai |
|---|---|
| **Task ID** | S2-T4 |
| **Fase** | S2 — Requirement Traceability & Behavioral Integrity |
| **Mode** | **AUDIT / VERIFICATION ONLY** |
| **Tanggal Audit** | 5 Oktober 2026 |
| **Status Temuan** | Preliminary Audit Findings (Remediation Pending Review) |
| **Governing Sources** | PDD v1.1, PRD v1.1, UI/UX Spec v1.2, SAD §9, §11, §12, §15, ADR-013, ADR-014, ADR-015, ADR-018, KL-02, KL-03, KL-05, KL-10 |

---

## 1. Executive Summary

Audit independen S2-T4 dilakukan untuk memverifikasi empat domain inti perilaku backend WorkPulse:
1. **Scheduled Jobs**: 10 pekerjaan terjadwal (7 frequent cycle 5-menit, 2 daily, 1 weekly).
2. **Notification Triggers**: 13 pemicu notifikasi sistem kanonikal (SAD §12.1).
3. **Audit Actions**: Aksi audit kanonikal (SAD §15.3), kepatuhan NFR-06, dan sifat *immutable/append-only*.
4. **State Transitions**: 7 state machine domain (Submission Timing, Daily Status & Suggestion, Blocker Lifecycle, Outcome & Continuation, Correction Request Lifecycle, Compliance Event Progression, Lock State Machine).

### Ringkasan Verifikasi

| Domain | Target Kanonikal | Implementasi Ditemukan | Terverifikasi Sesuai | Gaps / Discrepancies |
|---|---|---|---|---|
| **Scheduled Jobs** | 10 | 10 | 10 (dengan 1 catatan batasan modul KL-05) | 1 Minor Boundary Finding |
| **Notification Triggers** | 13 | 13 terdefinisi di konstanta | 10 terdispatch aktif | **2 Missing Dispatches (Triggers #2, #3, #8)**, 1 String Key Mismatch |
| **Audit Actions** | 9 kategori kanonikal (SAD §15.3) | 44 aksi granular domain | 43 aksi valid | **1 Material Bug (UUID constraint crash pada auto-escalate)** |
| **State Transitions** | 7 State Machines | 7 State Machines | 7 valid | 0 unauthorized bypass |

---

## 2. Scheduled Jobs Audit (Scope: 10 Jobs)

### 2.1 Scheduled Jobs Inventory & Traceability Matrix

| ID | Scheduled Job | Governing Source | Expected Cadence | Actual Implementation | Domain Service Called | Test Evidence | Status | Catatan Evaluasi |
|---|---|---|---|---|---|---|---|---|
| **JOB-01** | Reminder Mendekati Cutoff | SAD §11.2 #1, §11.3, ADR-014, PRD FR-28 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.sendCutoffReminders()` | `DailyAccountabilityService.findPendingSubmissionEmployeeIds()`, `PolicyService.getActivePolicySnapshot()` | `scheduler.service.spec.ts` (boundary tests 60m), `concurrency.spec.ts` | **VERIFIED** | Sesuai ADR-014 (lead time 60m simetris Morning/EOD, non-workday/holiday skip, in-run deduplication). |
| **JOB-02** | Cutoff-Lock Evaluation | SAD §11.2 #2, §11.3, §9.8, PRD FR-26 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.runFrequentCycle()` (Langkah 1) | `DailyAccountabilityService.evaluateCutoffLock()` | `scheduler.service.spec.ts`, `daily-accountability.service.spec.ts` | **VERIFIED** | Wajib dieksekusi pertama dalam frequent cycle (SAD §11.3 & §9.9 #4). Mengunci `isMorningLocked` dan `isEodLocked`. |
| **JOB-03** | No Submission Detection | SAD §11.2 #3, §11.3, §9.7, PRD FR-27 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.runFrequentCycle()` (Langkah 3) | `ComplianceService.evaluateNoSubmission()` | `scheduler.service.spec.ts`, `compliance.service.spec.ts` | **VERIFIED** | Bergantung pada Cutoff-Lock final. Membuat `ComplianceEvent(NoSubmission)` pada hari kerja non-libur. |
| **JOB-04** | Correction Request Auto-Apply | SAD §11.2 #5, §11.3, §9.6, PRD FR-45 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.runFrequentCycle()` (Langkah 4) | `CorrectionRequestService.evaluateExpiredObjectionWindows()` | `scheduler.service.spec.ts`, `concurrency.spec.ts` (Race #1), `correction-request-flow.spec.ts` | **VERIFIED** | Memakai `SELECT ... FOR UPDATE` (pessimistic lock) untuk mencegah race condition dengan penolakan reviewer manual. Mencatat audit `CORRECTION_AUTO_APPLIED`. |
| **JOB-05** | Objection Window Reminder | SAD §11.2 #4, §11.3, PRD FR-44 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.sendObjectionWindowReminders()` | `CorrectionRequestService.findPendingWithClosingObjectionWindow()`, `PolicyService.getActivePolicySnapshot()` | `scheduler.service.spec.ts` | **VERIFIED** | Mengambil ambang jam dari policy `ReminderThreshold.objectionWindowReminderHours` (default 2 jam). Mengirim notifikasi ke direct manager. |
| **JOB-06** | Blocker Auto-Escalate | SAD §11.2 #6, §11.3, §9.4, PRD FR-21 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.runFrequentCycle()` (Langkah 6) | `BlockerService.evaluateAutoEscalation()` | `scheduler.service.spec.ts`, `concurrency.spec.ts` (Race #2), `blocker-flow.spec.ts` | **VERIFIED WITH DEFECT** | Memakai `SELECT ... FOR UPDATE` dan mencegah eskalasi ganda. Namun mencatat `actorUserId: 'SYSTEM'` yang melanggar foreign key constraint UUID (Finding S2-T4-AUDIT-01). |
| **JOB-07** | Leave Pending Reminder | SAD §11.2 #7, §11.3, PRD FR-37 | Setiap 5 menit (`*/5 * * * *`) | `SchedulerService.sendLeavePendingReminders()` | `ExceptionService.findPendingLeavesOlderThan()`, `PolicyService.getActivePolicySnapshot()` | `scheduler.service.spec.ts` | **VERIFIED** | Mengambil ambang jam dari policy `ReminderThreshold.leavePendingReminderHours` (default 24 jam). Mengirim reminder ke direct manager. |
| **JOB-08** | Database Backup | SAD §4.5, §11.2 #9, §11.4, §21.6 | 1×/hari pukul 02:00 (`0 2 * * *`) | `SchedulerService.runDailyDatabaseBackup()` | `DatabaseBackupService.executeBackup()` | `scheduler.service.spec.ts`, KL-04 verification runbook | **VERIFIED** | Menjalankan snapshot database di luar jam kerja, menghasilkan dump SQL, diuji pada KL-04 (18 tabel pulih 100%). |
| **JOB-09** | Pattern Flag Detection | SAD §11.2 #8, §11.4, §9.7, PRD FR-29 | 1×/hari pukul 03:00 (`0 3 * * *`) | `SchedulerService.runDailyPatternFlag()` | `ComplianceService.evaluatePatternFlag()` | `scheduler.service.spec.ts`, `compliance.service.spec.ts` | **VERIFIED** | Agregasi harian no-submission per user dalam window kebijakan, membuat `ComplianceEvent(PatternFlag)` jika melewati threshold tanpa episode aktif. |
| **JOB-10** | Weekly Summary Notification | SAD §11.2 #10, §12.5, PRD FR-50 | 1×/minggu Senin pukul 08:00 (`0 8 * * 1`) | `SchedulerService.runWeeklySummaryNotification()` | `NotificationService.dispatchTrigger()` | `scheduler.service.spec.ts` | **VERIFIED** | Mengirim link relatif `/reports/weekly-team-summary` ke seluruh user aktif. Data summary dihitung on-demand saat diakses (SAD §11.6, §13.1). |

### 2.2 Evaluasi 14 Kriteria Arsitektural Scheduler

1. **Pendaftaran Job**: 100% terdaftar dalam 4 decorator `@Cron` di `SchedulerService` (`*/5 * * * *`, `0 2 * * *`, `0 3 * * *`, `0 8 * * 1`).
2. **Kesesuaian Cadence**: Seluruh cadence tepat sesuai SAD §11.2 & §11.4.
3. **Timezone Behavior**: Menggunakan UTC-normalized Date via `normalizeDate()` dan jam kebijakan terkonfigurasi.
4. **Pendelegasian ke Domain Service**: Scheduler mendelegasikan 100% mutasi data ke domain service (`DailyAccountabilityService`, `ComplianceService`, `CorrectionRequestService`, `BlockerService`, `DatabaseBackupService`).
5. **Scheduler HANYA Orkestrasi**: Scheduler tidak memiliki logika kalkulasi deadline sendiri; membaca policy snapshot resmi via `PolicyService`.
6. **Tidak Ada Duplikasi Aturan Bisnis**: Logika validasi cutoff, status, dan eskalasi tetap berada di domain service masing-masing.
7. **Peniadaan Direct DB Mutation**: Scheduler **TIDAK** melakukan direct mutation (`create`, `update`, `delete`) ke Prisma. (Catatan: Ditemukan 3 panggilan query read-only langsung ke Prisma untuk seleksi awal/deduplikasi, dicatat pada Finding S2-T4-JOB-01).
8. **Pencegahan Unauthorized State Transition**: Seluruh transisi dilakukan melalui method internal domain service yang terkontrol.
9. **Idempotensi**:
   - Cutoff reminder memiliki deduplikasi berlapis (in-process lock, in-run Set, database notification check hari berjalan).
   - Cutoff lock bersifat idempoten (kondisi `where: { isMorningLocked: false }`).
   - Expired objection auto-apply mengecek `status: CorrectionStatus.Pending`.
   - Blocker auto-escalate mengecek riwayat `AuditLog(action=BLOCKER_AUTO_ESCALATED)`.
10. **Test Coverage**: Memiliki unit test komprehensif pada `scheduler.service.spec.ts` (14 test cases) dan integration concurrency tests pada `concurrency.spec.ts`.
11. **Substansi Pengujian**: Menguji sequencing urutan langkah 1–7, isolasi kegagalan per-item, boundary window 60-menit, skip saat libur/akhir pekan, dan deduplikasi.
12. **Failure Handling**: Memenuhi SAD §11.5 — menggunakan blok try-catch terisolasi pada setiap langkah frequent cycle; kegagalan langkah 1 (mis. lock contention) tidak menggagalkan langkah 2 s.d. 7.
13. **Retry Behavior**: Sesuai SAD §11.5, tidak ada retry loop otomatis di dalam satu cycle; siklus berikutnya (5 menit) akan mengevaluasi ulang state yang sama.
14. **Proteksi Concurrency**: Concurrency guard in-process (`isProcessingCutoffReminders`) dan database pessimistic lock (`SELECT FOR UPDATE`) pada aksi yang bersinggungan dengan aksi manual.

---

## 3. Notification Trigger Audit (Scope: 13 Triggers)

### 3.1 Canonical Notification Trigger Matrix

| # | Trigger Type (SAD §12.1) | Recipient | Channels | Pemicu (Dipicu Oleh) | Actual Implementation / Wiring | Priority Tier (SAD §12.3) | Status | Bukti & Defisiensi |
|---|---|---|---|---|---|---|---|---|
| **1** | `MORNING_EOD_CUTOFF_REMINDER` | Employee | Email + BrowserPush + WebNotificationCenter | Job #1 (Scheduled 5m) | `SchedulerService.sendCutoffReminders` -> `notificationService.dispatchTrigger` | Tier 3 | **VERIFIED** | Link: `/my-today`. Deduplikasi as-of workDate. |
| **2** | `AMBER_SUPPORT_NEEDED` | Support owner + employee | Email + BrowserPush + WebNotificationCenter | Real-time (Check-in AMBER + Support) | **TIDAK TERKONEKSI (MISSING)** | Tier 2 | **GAP (HIGH)** | Didefinisikan di `notification-trigger.constants.ts`, tetapi `DailyAccountabilityService` **tidak memiliki dependensi ke NotificationService**. Tidak ada notifikasi saat AMBER+support disubmit. |
| **3** | `RED_STATUS` | Supervisor/Head + PM/owner terkait | Email + BrowserPush + WebNotificationCenter | Real-time (Check-in RED) | **TIDAK TERKONEKSI (MISSING)** | Tier 1 | **GAP (HIGH)** | Didefinisikan di `notification-trigger.constants.ts`, tetapi `DailyAccountabilityService` **tidak memiliki dependensi ke NotificationService**. Tidak ada notifikasi saat status RED disubmit. |
| **4** | `CRITICAL_INSTANT_BLOCKER` | Escalation chain / Owner needed | Email + BrowserPush + WebNotificationCenter | Real-time (Raise Blocker Critical) | `BlockerService.createBlocker` line 165 | Tier 1 | **PARTIALLY VERIFIED** | Terdispatch via `notificationService.dispatch()`. Namun menggunakan string literal `'BLOCKER_CRITICAL_RAISED'` alih-alih enum `CRITICAL_INSTANT_BLOCKER`, menyebabkan fallback ke Tier 2 di kuota email. |
| **5** | `BLOCKER_UNACKNOWLEDGED_ESCALATION` | Level eskalasi berikutnya | Email + BrowserPush + WebNotificationCenter | Job #6 (Scheduled 5m) | `BlockerService.evaluateAutoEscalation` line 751 | Tier 1 | **PARTIALLY VERIFIED** | Terdispatch via `notificationService.dispatch()`. Menggunakan string literal `'BLOCKER_UNACKNOWLEDGED_THRESHOLD'` alih-alih enum `BLOCKER_UNACKNOWLEDGED_ESCALATION`. |
| **6** | `REPEATED_NO_SUBMISSION_FLAG` | Supervisor/Head; HRGA jika threshold | Email + WebNotificationCenter | Job #9 (Scheduled Daily 03:00) | `ComplianceService.evaluatePatternFlag` line 412 | Tier 3 | **PARTIALLY VERIFIED** | Terdispatch via `notificationService.dispatch()`. Menggunakan string literal `'PATTERN_FLAG_DETECTED'` alih-alih enum `REPEATED_NO_SUBMISSION_FLAG`. |
| **7** | `WEEKLY_SUMMARY_AVAILABLE` | Employee + Manager | Email + WebNotificationCenter | Job #10 (Scheduled Weekly Senin 08:00) | `SchedulerService.runWeeklySummaryNotification` line 200 | Tier 3 | **VERIFIED** | Link: `/reports/weekly-team-summary`. Dispatched via `notificationService.dispatchTrigger()`. |
| **8** | `POLICY_ASSIGNMENT_CHANGED` | User terdampak; Policy Owner | WebNotificationCenter | Real-time (Mutasi Policy/Org Assignment) | **TIDAK TERKONEKSI (MISSING)** | Tier 3 | **GAP (MEDIUM)** | Didefinisikan di `notification-trigger.constants.ts`. Baik `PolicyService` maupun `IdentityService` tidak menginjeksi `NotificationService` dan tidak mendispatch trigger ini. |
| **9** | `CORRECTION_REQUEST_MATERIAL_SUBMITTED` | Authorized Reviewer | Email + WebNotificationCenter | Real-time (Koreksi Material disubmit) | `CorrectionRequestService.createMaterialCorrection` line 378 | Tier 2 | **PARTIALLY VERIFIED** | Terdispatch via `notificationService.dispatch()`. Menggunakan string literal `'CORRECTION_MATERIAL_REQUESTED'`. |
| **10** | `CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING` | Authorized Reviewer | WebNotificationCenter | Job #5 (Scheduled 5m) | `SchedulerService.sendObjectionWindowReminders` line 429 | Tier 3 | **VERIFIED** | Dispatched via `notificationService.dispatchTrigger()`. Link: `/team/corrections/:id`. |
| **11** | `CORRECTION_REQUEST_RESOLVED` | Employee pengaju | WebNotificationCenter | Real-time / Job #4 (Applied/Rejected) | `CorrectionRequestService` lines 280, 500, 636 | Tier 3 | **PARTIALLY VERIFIED** | Terdispatch saat Minor Applied, Rejected, dan Auto-Applied. Menggunakan string literal `'CORRECTION_APPLIED'` dan `'CORRECTION_REJECTED'`. |
| **12** | `LEAVE_REQUEST_SUBMITTED` | Authorized Approver | Email + BrowserPush + WebNotificationCenter | Real-time (Leave disubmit) & Job #7 (Reminder) | `ExceptionService.createLeave` line 178 & `SchedulerService.sendLeavePendingReminders` line 472 | Tier 2 | **VERIFIED** | Dispatched via `notificationService.dispatch()` dan `dispatchTrigger()`. Link: `/exceptions/:id`. |
| **13** | `LEAVE_REQUEST_RESOLVED` | Employee pengaju | Email + WebNotificationCenter | Real-time (Leave disetujui / ditolak) | `ExceptionService.approveLeave` line 598 & `rejectLeave` line 715 | Tier 3 | **VERIFIED** | Dispatched via `notificationService.dispatch()`. Mencakup status Approved dan Rejected. |

### 3.2 Analisis Arsitektur Notifikasi

1. **Jaminan Minimal WebNotificationCenter**:
   - Pada `NotificationService.dispatch()` (baris 61–71), array channel target secara otomatis menambahkan `NotificationChannel.WebNotificationCenter` via `Set` deduplikasi. Seluruh notifikasi tersimpan in-system pada tabel `notifications`.
2. **Manajemen Kuota Brevo Email & Prioritas 3-Tier**:
   - `NotificationService.checkEmailQuotaAndTier()` memantau volume email 24 jam berjalan.
   - Peringatan kuota (`EMAIL_QUOTA_WARNING`) dikirim ke Admin via Web Notification Center saat volume >= 240 (80%).
   - Tier 3 di-drop saat volume >= 270 (90%).
   - Saat kuota 300 habis, hanya Tier 1 yang diizinkan lewat.
3. **Temuan String Mismatch pada Domain Services (Finding S2-T4-NOTIF-03)**:
   - Karena `blocker.service.ts` mem-passing `'BLOCKER_CRITICAL_RAISED'` dan `'BLOCKER_UNACKNOWLEDGED_THRESHOLD'` yang tidak ada di `TRIGGER_DEFINITIONS`, pemetaan priority tier gagal dan jatuh ke nilai *fallback* `TIER_2` (alih-alih `TIER_1`).
   - Akibatnya, jika kuota email Brevo habis (300/hari), notifikasi Blocker Critical dan Eskalasi Tidak Terkonfirmasi **akan di-drop**, melanggar mandat SAD §12.3 bahwa Blocker Critical wajib Tier 1 (selalu dikirim).
4. **Peniadaan Silent Mutation pada Notifikasi**:
   - Seluruh pemanggilan `notificationService.dispatch()` bersifat murni *side-effect notification*.
   - Tidak ada mutasi status domain, submission otomatis, approval otomatis, maupun mutasi record lain yang terjadi di dalam dispatch notifikasi.

---

## 4. Audit Action Audit (Scope: NFR-06 & SAD §15)

### 4.1 Audit Immutability & Structural Architecture

SAD §15.1 mengamanatkan audit trail yang *immutable* untuk seluruh material edit pada 6 kategori utama.
Pemeriksaan skema database (`backend/prisma/schema.prisma`):
- Model `AuditLog` dimapping ke tabel `audit_logs`.
- Kolom: `id` (UUID), `actorUserId` (UUID, nullable), `action` (VARCHAR 100), `relatedEntityType` (VARCHAR 100), `relatedEntityId` (UUID), `valueBefore` (JSONB), `valueAfter` (JSONB), `timestamp` (TIMESTAMP).
- **Append-only constraint**: Tabel `audit_logs` **TIDAK** memiliki kolom `updatedAt` maupun `deletedAt`.
- Service layer (`AuditService`): Hanya menyediakan method `record()`, `findByEntity()`, dan `findByActor()`.
- **Tidak ada API endpoint maupun method service untuk UPDATE atau DELETE record audit log**.

### 4.2 Katalog Audit Actions Aktual vs Kanonikal SAD §15.3

Tercatat **44 aksi audit granular** yang diimplementasikan di seluruh backend service:

| Kategori Kanonikal (SAD §15.3) | Expected Action (SAD §15.3) | Aksi Aktual Terdaftar di Kode Sumber | File Sumber | Captures Actor | Before/After State | Status |
|---|---|---|---|---|---|---|
| **Correction Request** | `CORRECTION_APPLIED` | `CORRECTION_APPLIED` | `correction-request.service.ts` | ✅ `userId` | ✅ `valueBefore` & `valueAfter` | **VERIFIED** |
| **Correction Request** | `CORRECTION_AUTO_APPLIED` | `CORRECTION_AUTO_APPLIED` | `correction-request.service.ts` | ✅ `null` (System) | ✅ `valueBefore` & `valueAfter` | **VERIFIED** |
| **Correction Request** | `CORRECTION_REJECTED` | `CORRECTION_REJECTED` | `correction-request.service.ts` | ✅ `userId` (Reviewer) | ✅ `valueBefore` & `valueAfter` | **VERIFIED** |
| **Blocker Lifecycle** | `BLOCKER_STATUS_CHANGED` | `BLOCKER_RAISED`<br>`BLOCKER_ACKNOWLEDGED`<br>`BLOCKER_PROGRESS_UPDATED`<br>`BLOCKER_RESOLVED`<br>`BLOCKER_RISK_ACCEPTED`<br>`BLOCKER_CLOSED` | `blocker.service.ts` | ✅ `userId` | ✅ `valueBefore` & `valueAfter` | **VERIFIED (More Granular)** |
| **Blocker Escalation** | `BLOCKER_AUTO_ESCALATED` | `BLOCKER_AUTO_ESCALATED` | `blocker.service.ts` | ❌ Passing `'SYSTEM'` (Invalid UUID) | ✅ `valueAfter` (Target & Level) | **DEFECT (HIGH)** (Finding S2-T4-AUDIT-01) |
| **Password Administration** | `ADMIN_PASSWORD_RESET` | `ADMIN_PASSWORD_RESET`<br>`USER_PASSWORD_RESET` | `auth.service.ts` | ✅ `actorAdminId` | ✅ `valueAfter` (Target User) | **VERIFIED** |
| **Manager Coaching** | `MANAGER_NOTE_CREATED` | `MANAGER_NOTE_CREATED` | `manager-note.service.ts`, `compliance.service.ts` | ✅ `userId` | ✅ `valueAfter` (Note Details) | **VERIFIED** |
| **Policy Lifecycle** | `POLICY_VERSION_CREATED` | `POLICY_VERSION_CREATED`<br>`POLICY_OWNER_ASSIGNED` | `policy.service.ts` | ✅ `actorUserId` | ✅ `valueBefore` & `valueAfter` | **VERIFIED** |
| **Org Structure** | `ORGANIZATIONAL_ASSIGNMENT_CREATED` | `ORGANIZATIONAL_ASSIGNMENT_CREATED`<br>`PROJECT_AUTHORITY_MAPPING_CREATED`<br>`PROJECT_AUTHORITY_MAPPING_ENDED`<br>`TEMPORARY_REVIEWER_ASSIGNMENT_CREATED` | `identity.service.ts` | ✅ `actorUserId` | ✅ `valueBefore` & `valueAfter` | **VERIFIED** |
| **Daily Accountability** | *(NFR-06 Category: Status)* | `DAILY_RECORD_MORNING_SUBMITTED`<br>`DAILY_RECORD_EOD_SUBMITTED`<br>`DAILY_RECORD_STATUS_OVERRIDDEN`<br>`COMMITMENT_UPDATED`<br>`ADDITIONAL_WORK_CREATED`<br>`ADDITIONAL_WORK_UPDATED` | `daily-accountability.service.ts` | ✅ `userId` | ✅ `overrideReason` tersimpan di `valueAfter` | **VERIFIED** |
| **Compliance Progression** | *(NFR-06 Category: Discipline)* | `COMPLIANCE_WARNING_RECORDED`<br>`COMPLIANCE_FORMAL_ESCALATED` | `compliance.service.ts` | ✅ `userId` (HRGA) | ✅ `valueAfter` (Event Details) | **VERIFIED** |
| **Exceptions & Leaves** | *(NFR-06 Category: Leaves)* | `EXCEPTION_LEAVE_REQUESTED`<br>`EXCEPTION_LEAVE_APPROVED`<br>`EXCEPTION_LEAVE_REJECTED`<br>`EXCEPTION_HOLIDAY_CREATED`<br>`EXCEPTION_EXEMPTION_CREATED` | `exception.service.ts` | ✅ `userId` | ✅ `valueBefore` & `valueAfter` | **VERIFIED** |
| **Security & Auditing** | *(NFR-06 Category: Identity)* | `USER_CREATED`<br>`USER_DEACTIVATED`<br>`USER_ACTIVATED`<br>`REPORT_EXPORTED`<br>`UPLOAD_FILE_URL_GENERATED`<br>`DOWNLOAD_FILE_URL_GENERATED` | `identity.service.ts`, `export-generator.service.ts`, `file-storage.service.ts` | ✅ `userId` | ✅ Operasi tercatat | **VERIFIED** |

---

## 5. State Transition Audit (Scope: 7 State Machines)

### 5.1 State Machine 1: Submission Status (SAD §9.2, ADR-018, PRD FR-26)

| State Awal | Input / Event | Kondisi Evaluasi | State Akhir | Otoritas Evaluasi | Audit Event | Status |
|---|---|---|---|---|---|---|
| *(Belum disubmit)* | Submit Morning Check-in | `submittedAt <= onTimeDeadline` | `morningTiming = OnTime` | Real-time (`DailyAccountabilityService`) | `DAILY_RECORD_MORNING_SUBMITTED` | **VERIFIED** |
| *(Belum disubmit)* | Submit Morning Check-in | `onTimeDeadline < submittedAt <= cutOff` | `morningTiming = Late` | Real-time (`DailyAccountabilityService`) | `DAILY_RECORD_MORNING_SUBMITTED` | **VERIFIED** |
| *(Belum disubmit)* | Submit Morning Check-in | `submittedAt > cutOff` | **Ditolak** (`BusinessRuleViolationException`) | Real-time (`DailyAccountabilityService`) | Tidak ada penulisan data | **VERIFIED** |
| *(Belum disubmit)* | Evaluasi Scheduler 5m | `now > cutOff` && tidak ada submission | `ComplianceEvent(NoSubmission)` | Scheduled Job #3 (`ComplianceService`) | Event tersimpan di DB | **VERIFIED** |
| Morning Submitted | Submit EOD Check-in | `submittedAt <= eodOnTimeDeadline` | `eodTiming = OnTime` | Real-time (`DailyAccountabilityService`) | `DAILY_RECORD_EOD_SUBMITTED` | **VERIFIED** |
| Morning Submitted | Submit EOD Check-in | `eodOnTimeDeadline < submittedAt <= eodCutOff` | `eodTiming = Late` | Real-time (`DailyAccountabilityService`) | `DAILY_RECORD_EOD_SUBMITTED` | **VERIFIED** |
| Morning Submitted | Submit EOD Check-in | `submittedAt > eodCutOff` | **Ditolak** (`BusinessRuleViolationException`) | Real-time (`DailyAccountabilityService`) | Tidak ada penulisan data | **VERIFIED** |

> **Kepatuhan ADR-018 & S2-FR26-GRACE0-1**:
> - Operator nullish (`??`) digunakan konsisten pada seluruh fallback `GracePeriod` (`morningGraceMinutes ?? 30` dan `eodGraceMinutes ?? 30`).
> - Nilai `GracePeriod = 0` diperlakukan sah dan menghasilkan `cutoff = deadline`.
> - Tidak ada toleransi submission EOD pasca-cutoff; scheduler bukan sumber kebenaran penolakan.

### 5.2 State Machine 2: Daily Status & Status Suggestion (SAD §9.3, ADR-013, PRD FR-10, FR-13, FR-14)

| Domain | Nilai Awal | Logika Transisi / Penentuan | Nilai Akhir | Otoritas Penentu | Jejak Audit | Status |
|---|---|---|---|---|---|---|
| `initialStatus` | N/A | Worst-of seluruh `Commitment.initialRisk` (Worst risk: RED > AMBER > GREEN) | GREEN / AMBER / RED | Sistem (Otomatis saat Morning Submit) | `DAILY_RECORD_MORNING_SUBMITTED` | **VERIFIED** |
| `finalStatus` | N/A | Dipilih oleh karyawan saat EOD Check-in | User Choice | Employee | `DAILY_RECORD_EOD_SUBMITTED` | **VERIFIED** |
| *Status Suggestion* | N/A | Dihitung deterministik oleh `StatusSuggestionService` berdasarkan outcome komitmen & blocker | Disarankan (Saran Sistem) | Engine Status Suggestion (Read-Only) | Tidak ada mutasi state diam-diam | **VERIFIED** |
| *Override Flow* | Disarankan != Pilihan | Validasi Prompt Modal ditampilkan. Karyawan memilih tetap pada statusnya dengan mengisi `overrideReason` | Pilihan Karyawan Terpelihara | Employee (Konfirmasi Sadar) | `DAILY_RECORD_STATUS_OVERRIDDEN` (`overrideReason` di `valueAfter`) | **VERIFIED** |

### 5.3 State Machine 3: Blocker Lifecycle (SAD §9.4, PRD §3.4)

| State Awal | Event / Aksi | Aktor Berwenang | Validasi & Syarat | State Akhir | Audit Event | Status |
|---|---|---|---|---|---|---|
| *(Baru)* | Raise Blocker | Employee (`raisedByUserId`) | Type, Severity, Impact wajib; Owner teresolusi kontekstual | `Open` | `BLOCKER_RAISED` | **VERIFIED** |
| `Open` | Acknowledge | `ownerNeededUserId` | Caller wajib owner; status wajib `Open` | `Acknowledged` | `BLOCKER_ACKNOWLEDGED` | **VERIFIED** |
| `Acknowledged` / `InProgress` | Update Progress | `ownerNeededUserId` | Caller wajib owner; status bukan Closed/Resolved | `InProgress` | `BLOCKER_PROGRESS_UPDATED` | **VERIFIED** |
| `Acknowledged` / `InProgress` | Resolve | `ownerNeededUserId` | `resolutionNote` wajib diisi | `Resolved` | `BLOCKER_RESOLVED` | **VERIFIED** |
| `Acknowledged` / `InProgress` | Accept Risk | `ownerNeededUserId` | `resolutionNote` wajib diisi | `AcceptedRisk` | `BLOCKER_RISK_ACCEPTED` | **VERIFIED** |
| `Resolved` / `AcceptedRisk` | Close | `raisedByUserId` | Caller wajib pembuat blocker asli; status wajib Resolved/AcceptedRisk | `Closed` | `BLOCKER_CLOSED` | **VERIFIED** |
| `Open` (Critical) | Auto-Escalate | Scheduled Job #6 | `acknowledgedAt IS NULL` && waktu melewati `EscalationThreshold` && belum dieskalasi pada level ini | *(Tetap `Open`)* | `BLOCKER_AUTO_ESCALATED` | **VERIFIED WITH AUDIT DEFECT** |

### 5.4 State Machine 4: Outcome & Continuation (SAD §9.5, PRD FR-09)

| Outcome Terpilih | Continuation | Wajib Alasan? | Validasi Sistem | Status Draft Esok Hari | Status |
|---|---|---|---|---|---|
| `Completed` | `Continue` | Opsional | Diterima | Carry-over draft dibuat | **VERIFIED** |
| `Completed` | `DoNotContinue` | Opsional | Diterima | Tidak ada carry-over | **VERIFIED** |
| `PartiallyCompleted` | `Continue` | **Wajib** (`continuationReason`) | Ditolak jika kosong (FR-09) | Carry-over draft dibuat | **VERIFIED** |
| `PartiallyCompleted` | `DoNotContinue` | Opsional | Diterima | Tidak ada carry-over | **VERIFIED** |
| `NotCompleted` | `Continue` | **Wajib** (`continuationReason`) | Ditolak jika kosong (FR-09) | Carry-over draft dibuat | **VERIFIED** |
| `NotCompleted` | `DoNotContinue` | Opsional | Diterima | Tidak ada carry-over | **VERIFIED** |
| `Cancelled` | N/A | **Wajib** (`outcomeReason`) | Ditolak jika kosong | Tidak ada carry-over | **VERIFIED** |

### 5.5 State Machine 5: Correction Request Lifecycle (SAD §9.6, PRD §3.9)

| State Awal | Event / Tipe Koreksi | Otoritas / Aktor | Kondisi Evaluasi | State Akhir | Audit Event | Transaksi & Lock | Status |
|---|---|---|---|---|---|---|---|
| Commitment Locked | Ajukan Koreksi Minor | Employee | Perubahan di bawah ambang `MinorMaterialThreshold` | `Applied` (Langsung) | `CORRECTION_APPLIED` | Update atomik dalam `$transaction` + recompute `initialStatus` jika risk berubah | **VERIFIED** |
| Commitment Locked | Ajukan Koreksi Material | Employee | Perubahan melebihi ambang `MinorMaterialThreshold` | `Pending` | `CORRECTION_REQUESTED` | Menetapkan `objectionWindowStart` dan `objectionWindowEnd` | **VERIFIED** |
| `Pending` | Reviewer Object | Authorized Reviewer | Dalam objection window; `objectionReason` wajib | `Rejected` | `CORRECTION_REJECTED` | `SELECT ... FOR UPDATE` (Pessimistic lock) | **VERIFIED** |
| `Pending` | Window Berakhir | Scheduled Job #4 | `objectionWindowEnd <= now()` && status tetap `Pending` | `Applied` | `CORRECTION_AUTO_APPLIED` | `SELECT ... FOR UPDATE` (Pessimistic lock); commit atomik | **VERIFIED** |

### 5.6 State Machine 6: Compliance Event Progression (SAD §9.7, PRD §3.6, BR-05, BR-06, FR-30)

| Tahap Progression | Pemicu (Trigger) | Pembuat (Authority) | Entity Terbentuk | Otomatisasi Tindakan Lanjut | Status |
|---|---|---|---|---|---|
| **1. Reminder** | T-60m menjelang cutoff | Scheduled Job #1 | Row `Notification` | Tidak ada mutasi domain | **VERIFIED** |
| **2. No Submission** | Cutoff terlewati tanpa submit | Scheduled Job #3 | `ComplianceEvent(NoSubmission)` | Tidak ada sanksi langsung | **VERIFIED** |
| **3. Pattern Flag** | Akumulasi NoSubmission >= threshold | Scheduled Job #9 (03:00) | `ComplianceEvent(PatternFlag)` | Notifikasi ke Supervisor/Head | **VERIFIED** |
| **4. Coaching** | Tinjauan manual pattern flag | **Supervisor/Head** (Manual) | `ManagerNote(Coaching)` + `ComplianceEvent(Coaching)` | **TIDAK PERNAH OTOMATIS** | **VERIFIED** |
| **5. Recorded Warning** | Berulang pasca pembinaan | **HRGA** (Manual) | `ComplianceEvent(RecordedWarning)` | **TIDAK PERNAH OTOMATIS** | **VERIFIED** |
| **6. Escalated Formal** | Berulang pasca surat peringatan | **HRGA** (Manual) | `ComplianceEvent(EscalatedFormalProcess)` | **TIDAK PERNAH OTOMATIS** | **VERIFIED** |

> **Integritas BR-05 / BR-06 / FR-30**: Tahap 4, 5, dan 6 **100% manual**. Tidak ada kode backend atau cron job yang dapat mengeskalasi tindakan pembinaan, peringatan, atau proses formal secara otomatis.

### 5.7 State Machine 7: Lock State Machine (SAD §9.8, PRD BR-02)

| Kolom Kunci | Pemicu Lock | Otoritas Lock | Field yang Dikunci | Bypass Possible? | Status |
|---|---|---|---|---|---|
| `Commitment.isMorningLocked` | Morning Cutoff terlewati | Scheduled Job #2 (`DailyAccountabilityService.evaluateCutoffLock`) | `text`, `referenceLink`, `initialRisk`, `knownBlockerNote`, `supportNeeded` | Tidak. Validasi edit pasca-lock mewajibkan `CorrectionRequest`. | **VERIFIED** |
| `Commitment.isEodLocked` | EOD Cutoff terlewati | Scheduled Job #2 (`DailyAccountabilityService.evaluateCutoffLock`) | `outcome`, `outcomeReason`, `continuation`, `continuationReason` | Tidak. Validasi update memeriksa `isEodLocked`. | **VERIFIED** |
| `AdditionalWork.isLocked` | EOD Cutoff terlewati | Scheduled Job #2 (`DailyAccountabilityService.evaluateCutoffLock`) | Seluruh field `AdditionalWork` | Tidak. Sinkron dengan `isEodLocked`. | **VERIFIED** |

---

## 6. Forbidden Feature Cross-Check (Baseline S2-T2)

| ID | Forbidden Feature Description | Evaluasi pada Domain S2-T4 | Hasil Audit |
|---|---|---|---|
| **FF-01** | Silent State Mutation | Seluruh mutasi state pada 7 state machine menghasilkan AuditLog resmi atau event record. Tidak ada *stealth update*. | **CLEAN** |
| **FF-02** | Automatic Discipline / Penalty | Tahap coaching, warning, dan formal escalation 100% dipicu via controller manual oleh Supervisor / HRGA. Tidak ada penalti otomatis. | **CLEAN** |
| **FF-04** | Silent Manager Editing | Manager tidak dapat mengedit komitmen bawahan secara diam-diam; perubahan baseline harus melalui alur `CorrectionRequest`. | **CLEAN** |
| **FF-05** | Automatic Status Override | Status Suggestion bersifat *read-only advisory*; prompt modal memberikan bobot setara pada pilihan karyawan; alasan override wajib dicatat. | **CLEAN** |
| **FF-06** | Automatic Submission | Tidak ada scheduled job maupun notifikasi yang melakukan auto-submit komitmen Morning atau EOD atas nama karyawan. | **CLEAN** |
| **FF-16** | Scheduler Usurping Submission Validity | Validitas submission dievaluasi real-time pada saat HTTP request tiba terhadap jam cutoff policy; scheduler hanya mengevaluasi status lock. | **CLEAN** |
| **FF-17** | Reminder Eligibility Violations | Pengingat cutoff hanya aktif pada jendela [Deadline - 60m, Deadline), diskip pada hari libur dan akhir pekan, dan memiliki deduplikasi. | **CLEAN** |
| **FF-25** | Unapproved Scheduler Domain Transitions | Scheduler hanya memicu transisi yang disahkan arsitektur: cutoff locking, no submission event, auto-escalate unacknowledged, expired objection apply. | **CLEAN** |
| **FF-26** | Reporting / Export Modifying State | Modul reporting dan export murni melakukan agregasi baca (*read-only*), tidak mengubah state data harian maupun blocker. | **CLEAN** |
| **FF-27** | Automatic Approval of Exceptions | Persetujuan cuti (`approveLeave`) mewajibkan otorisasi aktif manajer peninjau; tidak ada persetujuan cuti otomatis oleh sistem. | **CLEAN** |
| **FF-29** | Automatic Disciplinary Escalation | Kepatuhan disipliner dijaga manual oleh aktor manusia berwenang. | **CLEAN** |

---

## 7. Preliminary Audit Findings Register

Berikut adalah temuan awal audit S2-T4. Sesuai batasan tugas, temuan ini **TIDAK DIREMEDIASI** pada tahap ini dan tidak mengubah `10-S2-Audit-Findings-Register.md`:

| Finding ID | Severity | Domain | Requirement | Bukti Aktual (Evidence) | Dampak Bisnis / Teknis | Rekomendasi Remediasi |
|---|---|---|---|---|---|---|
| **S2-T4-NOTIF-01** | **HIGH** | Notification Triggers | SAD §12.1 (Triggers #2 & #3), PRD FR-11 | `DailyAccountabilityService` tidak menginjeksi `NotificationService`. Trigger `AMBER_SUPPORT_NEEDED` dan `RED_STATUS` tidak pernah dipanggil/didispatch saat submit Morning/EOD. | Pemilik dukungan (support owner), supervisor, dan manajer proyek tidak menerima notifikasi kritis saat karyawan menghadapi kendala AMBER atau status RED. | Injeksi `NotificationService` ke `DailyAccountabilityService`, dispatch `AMBER_SUPPORT_NEEDED` saat commitment/status bernilai AMBER dengan support needed, dan dispatch `RED_STATUS` saat worst-of/finalStatus bernilai RED. |
| **S2-T4-AUDIT-01** | **HIGH** | Audit Actions / Runtime Integrity | SAD §15.2, PostgreSQL UUID Constraint | Pada `blocker.service.ts` baris 736 (`evaluateAutoEscalation`), `auditService.record` dipanggil dengan `actorUserId: 'SYSTEM'`. Kolom `actorUserId` bertipe UUID dan berelasi ke User. | Pada database PostgreSQL nyata, operasi auto-escalation blocker akan melempar error `invalid input syntax for type uuid: "SYSTEM"` dan menyebabkan rollback transaksi. Melanggar kontrak SAD §15.2 (`actorUserId: NULL jika system-triggered`). | Ubah `actorUserId: 'SYSTEM'` menjadi `actorUserId: null` atau `undefined` pada `blocker.service.ts` baris 736, konsisten dengan implementasi `correction-request.service.ts` baris 624. |
| **S2-T4-NOTIF-02** | **MEDIUM** | Notification Triggers | SAD §12.1 (Trigger #8), PRD FR-52 | `POLICY_ASSIGNMENT_CHANGED` didefinisikan di konstanta notifikasi, namun tidak pernah dipanggil di `PolicyService` (saat update policy/owner) maupun di `IdentityService` (saat update penugasan organisasi). | Karyawan dan pemilik kebijakan yang terdampak tidak menerima notifikasi in-system saat terjadi perubahan penugasan organisasi atau versi kebijakan baru. | Dispatch `SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED` pada `PolicyService.createPolicy`, `PolicyService.assignPolicyOwner`, dan `IdentityService.createOrganizationalAssignment`. |
| **S2-T4-NOTIF-03** | **MEDIUM** | Notification Triggers | SAD §12.1, §12.3 | Domain service memanggil `notificationService.dispatch()` menggunakan string literal non-standar (`'BLOCKER_CRITICAL_RAISED'`, `'BLOCKER_UNACKNOWLEDGED_THRESHOLD'`, `'PATTERN_FLAG_DETECTED'`, `'CORRECTION_MATERIAL_REQUESTED'`, `'CORRECTION_APPLIED'`, `'CORRECTION_REJECTED'`) alih-alih enum `SystemNotificationTrigger`. | `checkEmailQuotaAndTier()` gagal memetakan trigger definition sehingga Blocker Critical jatuh ke Tier 2 (bukan Tier 1). Saat kuota email Brevo harian habis (300/hari), notifikasi Blocker Critical akan di-drop. | Selaraskan string parameter dispatch di domain services dengan `SystemNotificationTrigger` kanonikal atau gunakan helper `dispatchTrigger()`. |
| **S2-T4-JOB-01** | **LOW** | Scheduled Jobs | SAD §6.3, §6.4, KL-05 | `SchedulerService` melakukan direct read query ke `prisma.user.findMany` (baris 194), `prisma.exception.findFirst` (baris 271), dan `prisma.notification.findFirst` (baris 332). | Meskipun murni operasi *read-only* tanpa mutasi, akses ini melanggar prinsip *modular monolith encapsulation* di mana akses domain data harus didelegasikan ke domain service. | Pindahkan ketiga query baca tersebut ke method helper pada `IdentityService`, `ExceptionService`, dan `NotificationService`. |
| **S2-T4-STATE-01** | **INFO** | State Transitions | SAD §9.8, PRD FR-43 | `CorrectionRequest` hanya berlaku untuk `Commitment`, tidak menyediakan jalur koreksi untuk `AdditionalWork` yang sudah terkunci di EOD. | Keterbatasan desain yang sudah diakui dan dicatat pada SAD §9.8 dan Open Item SAD §23.2. Tidak ada risiko keamanan atau unauthorized bypass. | Pertahankan sesuai status dokumentasi open item arsitektur. |

---

## 8. Kesimpulan & Status Akhir

Audit independen S2-T4 telah selesai dilaksanakan dengan hasil:
- **Scheduled Jobs**: 10/10 pekerjaan terjadwal kanonikal terverifikasi.
- **Notification Triggers**: 10/13 pemicu aktif terverifikasi; 3 pemicu belum terkoneksi di service domain (Trigger #2, #3, #8).
- **Audit Actions**: 9 kategori kanonikal dan 44 aksi granular audit trail terverifikasi; ditemukan 1 defect kritis foreign key UUID pada scheduler blocker auto-escalate.
- **State Transitions**: 7 state machine kanonikal terverifikasi taat asas, atomic, dan aman dari bypass/silent mutation.
- **Status Akhir**: **FAIL** (terdapat temuan berkategori HIGH pada runtime integrity audit log dan pemicu notifikasi status RED/AMBER).
- **Tindakan Lanjut**: Audit selesai, laporan lengkap diserahkan, tahap remediasi menunggu review.
