# S2-T4 Audit Report
## Scheduled Jobs, Notification Triggers, Audit Actions & State Transitions

| Metadata | Nilai |
|---|---|
| **Proyek** | WorkPulse — Daily Accountability & Blocker Log System |
| **Tahap / Task** | S2 — Requirement Traceability & Behavioral Integrity / Task S2-T4 |
| **Mode** | **AUDIT / VERIFICATION ONLY** |
| **Tanggal Audit** | 5 Oktober 2026 |
| **Status Pekerjaan** | Audit Selesai — Remediasi Menunggu Review |
| **Status Findings Register** | NOT MODIFIED (Temuan diadministrasikan terpisah pasca-review) |
| **Status Kode / Skema** | UNTOUCHED (Zero remediation during audit) |

---

## 1. Scope

Audit S2-T4 mencakup verifikasi independen menyeluruh terhadap empat pilar perilaku backend WorkPulse:
1. **Scheduled Jobs**: Memverifikasi keberadaan, kadens, orkestrasi, dan batasan wewenang 10 scheduled jobs kanonikal.
2. **Notification Triggers**: Memverifikasi dispatch, penerima, prioritas tier email, dan peniadaan mutasi tersembunyi (*silent mutation*) pada 13 trigger notifikasi kanonikal.
3. **Audit Actions**: Memverifikasi ketercakupan NFR-06, sifat *append-only/immutable*, kelengkapan before/after snapshot, dan validitas integritas data jejak audit.
4. **State Transitions**: Memverifikasi kepatuhan seluruh siklus hidup entitas (Submission, Daily Status, Blocker, Outcomes, Correction Requests, Compliance Progression, Locks) terhadap aturan bisnis dan ketiadaan bypass.

---

## 2. Governing Sources

Dokumen rujukan otoritatif yang digunakan sebagai acuan dasar:
1. `Design-Artifacts/01-PDD.md` — Product Definition Document v1.1
2. `Design-Artifacts/02-PRD.md` — Product Requirements Document v1.1
3. `Design-Artifacts/03-UI-UX Spec & Flow Document.md` — UI/UX Specification v1.2
4. `Design-Artifacts/05-SAD.md` — System Architecture Design (§9, §11, §12, §15)
5. `Design-Artifacts/08-ADR.md` — Architectural Decision Records (khususnya ADR-013, ADR-014, ADR-015, ADR-018)
6. `Design-Artifacts/09-Known-Limitations.md` — Accepted Risks & Limitations (KL-02, KL-03, KL-05, KL-10)
7. `Design-Artifacts/13-S2-T2-Forbidden-Feature-Audit.md` — Prohibited Features Baseline (FF-01 s/d FF-29)
8. `Design-Artifacts/14-S2-T3-Endpoint-Reconciliation.md` — Context Baseline

---

## 3. Expected Inventory

### 3.1 Scheduled Jobs (Expected: 10)
Berdasarkan SAD §11.2, terdapat 10 scheduled jobs:
1. *Reminder Mendekati Cutoff* (Frequent Cycle — 5 menit)
2. *Cutoff-Lock Evaluation* (Frequent Cycle — 5 menit)
3. *No Submission Detection* (Frequent Cycle — 5 menit)
4. *Objection Window Reminder* (Frequent Cycle — 5 menit)
5. *Correction Request Auto-Apply* (Frequent Cycle — 5 menit)
6. *Blocker Auto-Escalate* (Frequent Cycle — 5 menit)
7. *Leave Pending Reminder* (Frequent Cycle — 5 menit)
8. *Pattern Flag Detection* (Daily Aggregate — 03:00)
9. *Database Backup* (Daily Maintenance — 02:00)
10. *Weekly Summary Notification* (Weekly Aggregate — Senin 08:00)

### 3.2 Notification Triggers (Expected: 13)
Berdasarkan SAD §12.1, terdapat 13 pemicu notifikasi sistem kanonikal:
1. `MORNING_EOD_CUTOFF_REMINDER` (Pengingat cutoff pagi & sore)
2. `AMBER_SUPPORT_NEEDED` (Komitmen AMBER membutuhkan bantuan)
3. `RED_STATUS` (Status RED dilaporkan pada check-in)
4. `CRITICAL_INSTANT_BLOCKER` (Blocker Critical baru diajukan)
5. `BLOCKER_UNACKNOWLEDGED_ESCALATION` (Blocker unacknowledged melewati threshold)
6. `REPEATED_NO_SUBMISSION_FLAG` (Pola no-submission berulang)
7. `WEEKLY_SUMMARY_AVAILABLE` (Laporan mingguan tersedia)
8. `POLICY_ASSIGNMENT_CHANGED` (Penugasan organisasi/kebijakan berubah)
9. `CORRECTION_REQUEST_MATERIAL_SUBMITTED` (Koreksi material diajukan)
10. `CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING` (Jendela keberatan segera ditutup)
11. `CORRECTION_REQUEST_RESOLVED` (Koreksi diterima atau ditolak)
12. `LEAVE_REQUEST_SUBMITTED` (Permohonan cuti baru diajukan)
13. `LEAVE_REQUEST_RESOLVED` (Permohonan cuti disetujui atau ditolak)

### 3.3 Audit Actions (Canonical Inventory)
Berdasarkan SAD §15.3, katalog dasar aksi audit mencakup format `{ENTITY}_{EVENT}`:
1. `CORRECTION_APPLIED`
2. `CORRECTION_AUTO_APPLIED`
3. `CORRECTION_REJECTED`
4. `BLOCKER_STATUS_CHANGED` (pada implementasi granular: `BLOCKER_RAISED`, `BLOCKER_ACKNOWLEDGED`, `BLOCKER_PROGRESS_UPDATED`, `BLOCKER_RESOLVED`, `BLOCKER_RISK_ACCEPTED`, `BLOCKER_CLOSED`)
5. `BLOCKER_AUTO_ESCALATED`
6. `ADMIN_PASSWORD_RESET`
7. `MANAGER_NOTE_CREATED`
8. `POLICY_VERSION_CREATED`
9. `ORGANIZATIONAL_ASSIGNMENT_CREATED`

### 3.4 State Machines (Canonical Inventory)
Berdasarkan SAD §9, 7 state machine sistem meliputi:
1. *Submission Status*: `OnTime`, `Late`, `NoSubmission` (SAD §9.2, ADR-018)
2. *Daily Status & Suggestion*: `initialStatus` (worst-of), `finalStatus`, deterministic suggestion & override (SAD §9.3, ADR-013)
3. *Blocker Lifecycle*: `Open` -> `Acknowledged` -> `InProgress` -> `Resolved` / `AcceptedRisk` -> `Closed` & Auto-Escalate (SAD §9.4)
4. *Outcome & Continuation*: `Completed`, `PartiallyCompleted`, `NotCompleted`, `Cancelled` -> Carry-over draft (SAD §9.5)
5. *Correction Request Lifecycle*: `Minor` -> `Applied` langsung; `Material` -> `Pending` -> `Rejected` / `Applied` (SAD §9.6)
6. *Compliance Event Progression*: Reminder -> NoSubmission -> PatternFlag -> Coaching -> RecordedWarning -> EscalatedFormal (SAD §9.7)
7. *Lock State Machine*: `Commitment.isMorningLocked`, `Commitment.isEodLocked`, `AdditionalWork.isLocked` (SAD §9.8)

---

## 4. Scheduled Jobs Audit

| ID | Scheduled Job | Governing Source | Expected Cadence | Actual Implementation | Domain Service Called | Test Evidence | Status |
|---|---|---|---|---|---|---|---|
| **JOB-01** | Reminder Mendekati Cutoff | SAD §11.2 #1, §11.3, ADR-014 | `*/5 * * * *` | `SchedulerService.sendCutoffReminders()` | `DailyAccountabilityService.findPendingSubmissionEmployeeIds()` | `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-02** | Cutoff-Lock Evaluation | SAD §11.2 #2, §11.3, §9.8 | `*/5 * * * *` | `SchedulerService.runFrequentCycle()` (Langkah 1) | `DailyAccountabilityService.evaluateCutoffLock()` | `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-03** | No Submission Detection | SAD §11.2 #3, §11.3, §9.7 | `*/5 * * * *` | `SchedulerService.runFrequentCycle()` (Langkah 3) | `ComplianceService.evaluateNoSubmission()` | `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-04** | Correction Request Auto-Apply | SAD §11.2 #5, §11.3, §9.6 | `*/5 * * * *` | `SchedulerService.runFrequentCycle()` (Langkah 4) | `CorrectionRequestService.evaluateExpiredObjectionWindows()` | `concurrency.spec.ts`, `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-05** | Objection Window Reminder | SAD §11.2 #4, §11.3 | `*/5 * * * *` | `SchedulerService.sendObjectionWindowReminders()` | `CorrectionRequestService.findPendingWithClosingObjectionWindow()` | `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-06** | Blocker Auto-Escalate | SAD §11.2 #6, §11.3, §9.4 | `*/5 * * * *` | `SchedulerService.runFrequentCycle()` (Langkah 6) | `BlockerService.evaluateAutoEscalation()` | `concurrency.spec.ts`, `blocker-flow.spec.ts` | **VERIFIED WITH DEFECT** |
| **JOB-07** | Leave Pending Reminder | SAD §11.2 #7, §11.3 | `*/5 * * * *` | `SchedulerService.sendLeavePendingReminders()` | `ExceptionService.findPendingLeavesOlderThan()` | `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-08** | Database Backup | SAD §4.5, §11.2 #9, §11.4 | `0 2 * * *` | `SchedulerService.runDailyDatabaseBackup()` | `DatabaseBackupService.executeBackup()` | `scheduler.service.spec.ts`, KL-04 Runbook | **VERIFIED** |
| **JOB-09** | Pattern Flag Detection | SAD §11.2 #8, §11.4, §9.7 | `0 3 * * *` | `SchedulerService.runDailyPatternFlag()` | `ComplianceService.evaluatePatternFlag()` | `scheduler.service.spec.ts` | **VERIFIED** |
| **JOB-10** | Weekly Summary Notification | SAD §11.2 #10, §12.5 | `0 8 * * 1` | `SchedulerService.runWeeklySummaryNotification()` | `NotificationService.dispatchTrigger()` | `scheduler.service.spec.ts` | **VERIFIED** |

---

## 5. Notification Trigger Audit

| # | Trigger Type | Recipient | Channels | Dipicu Oleh | Actual Implementation | Priority Tier | Status | Catatan / Finding |
|---|---|---|---|---|---|---|---|---|
| **1** | `MORNING_EOD_CUTOFF_REMINDER` | Employee | Email + BrowserPush + WebNotificationCenter | Job #1 | `SchedulerService.sendCutoffReminders` | Tier 3 | **VERIFIED** | Link: `/my-today`. Deduplikasi in-run & database. |
| **2** | `AMBER_SUPPORT_NEEDED` | Support owner + employee | Email + BrowserPush + WebNotificationCenter | Real-time | **TIDAK TERHUBUNG (NOT WIRED)** | Tier 2 | **GAP (HIGH)** | `DailyAccountabilityService` tidak menginjeksi `NotificationService`. Notifikasi tidak pernah terkirim saat AMBER disubmit. |
| **3** | `RED_STATUS` | Supervisor/Head + PM/owner | Email + BrowserPush + WebNotificationCenter | Real-time | **TIDAK TERHUBUNG (NOT WIRED)** | Tier 1 | **GAP (HIGH)** | `DailyAccountabilityService` tidak menginjeksi `NotificationService`. Notifikasi tidak pernah terkirim saat status RED disubmit. |
| **4** | `CRITICAL_INSTANT_BLOCKER` | Escalation chain / Owner needed | Email + BrowserPush + WebNotificationCenter | Real-time | `BlockerService.createBlocker` line 165 | Tier 1 | **PARTIALLY VERIFIED** | Menggunakan string literal `'BLOCKER_CRITICAL_RAISED'`. Priority tier jatuh ke default Tier 2 di kuota email. |
| **5** | `BLOCKER_UNACKNOWLEDGED_ESCALATION` | Level eskalasi berikutnya | Email + BrowserPush + WebNotificationCenter | Job #6 | `BlockerService.evaluateAutoEscalation` line 751 | Tier 1 | **PARTIALLY VERIFIED** | Menggunakan string literal `'BLOCKER_UNACKNOWLEDGED_THRESHOLD'`. Priority tier jatuh ke default Tier 2. |
| **6** | `REPEATED_NO_SUBMISSION_FLAG` | Supervisor/Head (+ HRGA jika threshold) | Email + WebNotificationCenter | Job #9 | `ComplianceService.evaluatePatternFlag` line 412 | Tier 3 | **PARTIALLY VERIFIED** | Menggunakan string literal `'PATTERN_FLAG_DETECTED'`. |
| **7** | `WEEKLY_SUMMARY_AVAILABLE` | Employee + Manager | Email + WebNotificationCenter | Job #10 | `SchedulerService.runWeeklySummaryNotification` line 200 | Tier 3 | **VERIFIED** | Link: `/reports/weekly-team-summary`. |
| **8** | `POLICY_ASSIGNMENT_CHANGED` | User terdampak; Policy Owner | WebNotificationCenter | Real-time | **TIDAK TERHUBUNG (NOT WIRED)** | Tier 3 | **GAP (MEDIUM)** | Tidak dipanggil di `PolicyService` maupun `IdentityService`. |
| **9** | `CORRECTION_REQUEST_MATERIAL_SUBMITTED` | Authorized Reviewer | Email + WebNotificationCenter | Real-time | `CorrectionRequestService.createMaterialCorrection` line 378 | Tier 2 | **PARTIALLY VERIFIED** | Menggunakan string literal `'CORRECTION_MATERIAL_REQUESTED'`. |
| **10** | `CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING` | Authorized Reviewer | WebNotificationCenter | Job #5 | `SchedulerService.sendObjectionWindowReminders` line 429 | Tier 3 | **VERIFIED** | Link: `/team/corrections/:id`. |
| **11** | `CORRECTION_REQUEST_RESOLVED` | Employee pengaju | WebNotificationCenter | Real-time / Job #4 | `CorrectionRequestService` lines 280, 500, 636 | Tier 3 | **PARTIALLY VERIFIED** | Menggunakan string literal `'CORRECTION_APPLIED'` dan `'CORRECTION_REJECTED'`. |
| **12** | `LEAVE_REQUEST_SUBMITTED` | Authorized Approver | Email + BrowserPush + WebNotificationCenter | Real-time & Job #7 | `ExceptionService.createLeave` line 178 & `SchedulerService.sendLeavePendingReminders` line 472 | Tier 2 | **VERIFIED** | Link: `/exceptions/:id`. |
| **13** | `LEAVE_REQUEST_RESOLVED` | Employee pengaju | Email + WebNotificationCenter | Real-time | `ExceptionService.approveLeave` line 598 & `rejectLeave` line 715 | Tier 3 | **VERIFIED** | Mencakup Approved dan Rejected. |

---

## 6. Audit Action Audit

| Audit Action | Governing Source | Triggering Operation | Actor Captured | Target Captured | Before/After State | Immutable? | Test Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| `CORRECTION_APPLIED` | SAD §15.3 | `applyMinorCorrection()` | `user.userId` | `CorrectionRequest` & target commitment | `valueBefore` & `valueAfter` | ✅ Ya | `correction-request-flow.spec.ts` | **VERIFIED** |
| `CORRECTION_AUTO_APPLIED` | SAD §15.3 | `evaluateExpiredObjectionWindows()` | `null` (System) | `CorrectionRequest` & target commitment | `valueBefore` & `valueAfter` | ✅ Ya | `concurrency.spec.ts` | **VERIFIED** |
| `CORRECTION_REJECTED` | SAD §15.3 | `objectCorrection()` | Reviewer `user.userId` | `CorrectionRequest` | `valueBefore` & `valueAfter` (alasan) | ✅ Ya | `correction-request-flow.spec.ts` | **VERIFIED** |
| `BLOCKER_RAISED` | SAD §15.3 | `createBlocker()` | `userId` | `Blocker` | `valueAfter` (Blocker snapshot) | ✅ Ya | `blocker-flow.spec.ts` | **VERIFIED** |
| `BLOCKER_ACKNOWLEDGED` | SAD §15.3 | `acknowledge()` | Owner `userId` | `Blocker` | `valueBefore` & `valueAfter` | ✅ Ya | `blocker-flow.spec.ts` | **VERIFIED** |
| `BLOCKER_PROGRESS_UPDATED` | SAD §15.3 | `updateProgress()` | Owner `userId` | `Blocker` | `valueAfter` (Progress note) | ✅ Ya | `blocker.service.spec.ts` | **VERIFIED** |
| `BLOCKER_RESOLVED` | SAD §15.3 | `resolve()` | Owner `userId` | `Blocker` | `valueBefore` & `valueAfter` | ✅ Ya | `blocker-flow.spec.ts` | **VERIFIED** |
| `BLOCKER_RISK_ACCEPTED` | SAD §15.3 | `acceptRisk()` | Owner `userId` | `Blocker` | `valueBefore` & `valueAfter` | ✅ Ya | `blocker.service.spec.ts` | **VERIFIED** |
| `BLOCKER_CLOSED` | SAD §15.3 | `close()` | Pelapor `userId` | `Blocker` | `valueBefore` & `valueAfter` | ✅ Ya | `blocker-flow.spec.ts` | **VERIFIED** |
| `BLOCKER_AUTO_ESCALATED` | SAD §15.3 | `evaluateAutoEscalation()` | ❌ `'SYSTEM'` (String non-UUID) | `Blocker` | `valueAfter` (Target & Level) | ✅ Ya | `blocker-flow.spec.ts` (Mocked) | **DEFECT (HIGH)** (Finding S2-T4-AUDIT-01) |
| `ADMIN_PASSWORD_RESET` | SAD §15.3 | `adminResetPassword()` | Admin `actorAdminId` | `User` | `valueAfter` | ✅ Ya | `auth.service.spec.ts` | **VERIFIED** |
| `MANAGER_NOTE_CREATED` | SAD §15.3 | `createNote()`, `coach()` | Manager `user.userId` | `ManagerNote` | `valueAfter` | ✅ Ya | `manager-note.service.spec.ts` | **VERIFIED** |
| `POLICY_VERSION_CREATED` | SAD §15.3 | `createPolicy()` | Policy Owner `actorUserId` | `Policy` | `valueBefore` & `valueAfter` | ✅ Ya | `policy.service.spec.ts` | **VERIFIED** |
| `ORGANIZATIONAL_ASSIGNMENT_CREATED` | SAD §15.3 | `createOrganizationalAssignment()` | HRGA / Admin `actorUserId` | `OrganizationalAssignment` | `valueBefore` & `valueAfter` | ✅ Ya | `identity.service.spec.ts` | **VERIFIED** |
| `DAILY_RECORD_STATUS_OVERRIDDEN` | SAD §9.3, §15.1 | `confirmOverride()` | Employee `userId` | `DailyAccountabilityRecord` | `valueBefore` & `valueAfter` (`overrideReason`) | ✅ Ya | `daily-accountability.service.spec.ts` | **VERIFIED** |

---

## 7. State Transition Audit

| Domain | Current State | Allowed Action | Next State | Authority | Unauthorized Action Handling | Audit Event | Test Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| **Submission Timing** | None | Submit Morning Check-in | `OnTime` atau `Late` | Employee | Ditolak jika `now > cutOff` (`BusinessRuleViolationException`) | `DAILY_RECORD_MORNING_SUBMITTED` | `daily-accountability.service.spec.ts` | **VERIFIED** |
| **Submission Timing** | Morning Submitted | Submit EOD Check-in | `OnTime` atau `Late` | Employee | Ditolak jika `now > eodCutOff` (ADR-018) | `DAILY_RECORD_EOD_SUBMITTED` | `daily-accountability.service.spec.ts` | **VERIFIED** |
| **Submission Timing** | Not Submitted | Evaluasi Scheduler 5m | `NoSubmission` Event | Scheduled Job #3 | Tidak dievaluasi sebelum cutoff final; skip saat libur | `ComplianceEvent` | `compliance.service.spec.ts` | **VERIFIED** |
| **Daily Status** | Draft / Pending | Pilih Final Status != Saran | Validation Prompt Modal | Employee | Tidak ada silent override; modal mewajibkan alasan | `DAILY_RECORD_STATUS_OVERRIDDEN` | `daily-accountability.service.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | None | Raise Blocker | `Open` | Employee Pelapor | Ditolak jika field wajib kosong atau owner tidak teresolusi | `BLOCKER_RAISED` | `blocker-flow.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | `Open` | Acknowledge | `Acknowledged` | Owner Needed | Ditolak jika aktor bukan Owner Needed (`403 FORBIDDEN`) | `BLOCKER_ACKNOWLEDGED` | `blocker.service.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | `Acknowledged` / `InProgress` | Update Progress | `InProgress` | Owner Needed | Ditolak jika status Closed/Resolved | `BLOCKER_PROGRESS_UPDATED` | `blocker.service.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | `Acknowledged` / `InProgress` | Resolve | `Resolved` | Owner Needed | Ditolak jika `resolutionNote` kosong | `BLOCKER_RESOLVED` | `blocker.service.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | `Acknowledged` / `InProgress` | Accept Risk | `AcceptedRisk` | Owner Needed | Ditolak jika `resolutionNote` kosong | `BLOCKER_RISK_ACCEPTED` | `blocker.service.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | `Resolved` / `AcceptedRisk` | Close | `Closed` | Employee Pelapor | Ditolak jika aktor bukan Pelapor asli | `BLOCKER_CLOSED` | `blocker-flow.spec.ts` | **VERIFIED** |
| **Blocker Lifecycle** | `Open` (Critical) | Auto-Escalate | *(Tetap `Open`)* | Scheduled Job #6 | Hanya jika unacknowledged melewati threshold | `BLOCKER_AUTO_ESCALATED` | `concurrency.spec.ts` | **VERIFIED** |
| **Correction Request** | Locked | Ajukan Koreksi Minor | `Applied` | Employee | Langsung di-apply dalam transaksi atomik jika di bawah threshold | `CORRECTION_APPLIED` | `correction-request-flow.spec.ts` | **VERIFIED** |
| **Correction Request** | Locked | Ajukan Koreksi Material | `Pending` | Employee | Menghitung `objectionWindowEnd` dan menunggu reviewer | `CORRECTION_REQUESTED` | `correction-request-flow.spec.ts` | **VERIFIED** |
| **Correction Request** | `Pending` | Object (Keberatan) | `Rejected` | Authorized Reviewer | Ditolak jika di luar window atau tanpa alasan | `CORRECTION_REJECTED` | `correction-request-flow.spec.ts` | **VERIFIED** |
| **Correction Request** | `Pending` | Window Expired | `Applied` | Scheduled Job #4 | `SELECT ... FOR UPDATE` mencegah race condition dengan objection | `CORRECTION_AUTO_APPLIED` | `concurrency.spec.ts` | **VERIFIED** |
| **Compliance Event** | NoSubmission | Akumulasi Pola | `PatternFlag` | Scheduled Job #9 | Hanya dibuat jika belum ada episode aktif yang menunggu Coaching | `ComplianceEvent` | `compliance.service.spec.ts` | **VERIFIED** |
| **Compliance Event** | PatternFlag | Sesi Pembinaan | Coaching Recorded | **Supervisor / Head (Manual)** | **DILARANG OTOMATIS**; mewajibkan catatan manajer nyata | `MANAGER_NOTE_CREATED` | `compliance.service.spec.ts` | **VERIFIED** |
| **Compliance Event** | Coaching | Surat Peringatan | Warning Recorded | **HRGA (Manual)** | **DILARANG OTOMATIS**; otoritas khusus HRGA | `COMPLIANCE_WARNING_RECORDED` | `compliance.service.spec.ts` | **VERIFIED** |
| **Compliance Event** | Warning | Eskalasi Formal | Escalated Formal | **HRGA (Manual)** | **DILARANG OTOMATIS**; diteruskan ke proses eksternal | `COMPLIANCE_FORMAL_ESCALATED` | `compliance.service.spec.ts` | **VERIFIED** |
| **Lock Mechanism** | Unlocked | Cutoff Melebihi | `isMorningLocked` / `isEodLocked` | Scheduled Job #2 | Dievaluasi berurutan di awal frequent cycle | Flag Boolean di DB | `daily-accountability.service.spec.ts` | **VERIFIED** |

---

## 8. Scheduler Authority Audit

1. **Prinsip Pendelegasian**: `SchedulerService` berfungsi murni sebagai orkestrator waktu. Seluruh manipulasi data dan evaluasi aturan bisnis didelegasikan ke domain service resmi (`DailyAccountabilityService`, `ComplianceService`, `CorrectionRequestService`, `BlockerService`, `DatabaseBackupService`).
2. **Ketiadaan Direct DB Mutation**: Tidak ada operasi `create`, `update`, atau `delete` langsung ke database di dalam `SchedulerService`.
3. **Temuan Direct Read Access (Finding S2-T4-JOB-01)**: Terdapat 3 pemanggilan query baca langsung (`prisma.user.findMany`, `prisma.exception.findFirst`, `prisma.notification.findFirst`) untuk orkestrasi awal yang sebaiknya dibungkus oleh service domain terkait demi modularitas murni KL-05.
4. **Pencegahan Bypass Aturan Bisnis**: Scheduler tidak menentukan apakah karyawan OnTime atau Late; kalkulasi submission murni ditangani oleh `DailyAccountabilityService` pada saat request diterima.

---

## 9. Notification Silent-Mutation Audit

1. **Pemisahan Notifikasi dari Transaksi Bisnis**: Seluruh pemanggilan `notificationService.dispatch()` murni menghasilkan row notifikasi (`notifications`) dan pengiriman eksternal (Brevo Email & Browser Push).
2. **Ketiadaan Efek Samping Tersembunyi**:
   - Notifikasi reminder cutoff tidak mengubah status submission.
   - Notifikasi AMBER/RED tidak mengubah status komitmen secara otomatis.
   - Notifikasi objection window tidak memicu persetujuan atau penolakan dini.
   - Notifikasi cuti tidak menyetujui permohonan secara diam-diam.
3. **Sifat Tahan Gangguan (Resilience)**: Kegagalan koneksi pihak ketiga (mis. Brevo API timeout/error) tidak membatalkan transaksi domain inti; status notifikasi dicatat sebagai `Failed` tanpa menghentikan komitmen database.

---

## 10. Audit Immutability Audit

1. **Integritas Skema**: Tabel `audit_logs` tidak memiliki kolom mutasi (`updatedAt`, `deletedAt`).
2. **Ketiadaan Jalur Modifikasi**: Tidak tersedia endpoint API publik maupun private, dan tidak tersedia method di `AuditService` untuk memperbarui atau menghapus jejak audit yang sudah tercatat.
3. **Kelengkapan Before/After**: Seluruh operasi pembaruan data material (koreksi komitmen, override status harian, pembaruan versi kebijakan, penugasan organisasi, perubahan status blocker) mencatat nilai `valueBefore` dan `valueAfter` dalam bentuk JSONB terstruktur.
4. **Defect Kritis Aktor Sistem (Finding S2-T4-AUDIT-01)**: Pada `blocker.service.ts` baris 736, scheduler blocker auto-escalate mengirim string `'SYSTEM'` ke parameter `actorUserId`. Karena kolom ini bertipe UUID dan memiliki constraint foreign key ke tabel `users`, operasi ini akan melempar fatal database error pada environment produksi PostgreSQL.

---

## 11. Blocker Lifecycle Audit

1. **Kesesuaian Siklus Hidup**: Alur `Open` -> `Acknowledged` -> `InProgress` -> `Resolved` / `AcceptedRisk` -> `Closed` terverifikasi 100% konsisten dengan SAD §9.4.
2. **Penegakan Hak Akses**:
   - `acknowledge`, `updateProgress`, `resolve`, dan `acceptRisk` diproteksi secara ketat: hanya `ownerNeededUserId` yang berhak melakukan aksi.
   - `close` diproteksi secara ketat: hanya pembuat blocker asli (`raisedByUserId`) yang berhak menutup blocker setelah memverifikasi resolusinya.
3. **Pencatatan Audit**: Setiap transisi status menghasilkan audit log granular dengan state before/after.
4. **Eskalasi Otomatis**: Dilindungi oleh lock pesimistik database dan verifikasi riwayat audit eskalasi untuk mencegah eskalasi berulang di level yang sama.

---

## 12. Correction Request Lifecycle Audit

1. **Jalur Koreksi Minor**: Jika perubahan yang diminta berada di bawah batas materialitas kebijakan, koreksi langsung diterapkan (*Applied*) dalam satu transaksi atomik, mencatat jejak audit `CORRECTION_APPLIED`, dan menghitung ulang `initialStatus` jika risiko berubah (SAD §9.6).
2. **Jalur Koreksi Material**: Jika perubahan melewati ambang materialitas, koreksi masuk ke status `Pending`, memicu objection window (SAD §9.6), dan mengirim notifikasi ke peninjau berwenang.
3. **Perlindungan Concurrency (SAD §9.9 #1)**: Evaluasi objection manual oleh reviewer dan auto-apply oleh scheduler sama-sama menggunakan query `SELECT ... FOR UPDATE` (pessimistic locking), menjamin tidak ada koreksi yang disetujui dan ditolak sekaligus.

---

## 13. Submission Status Audit

1. **Konsistensi ADR-018 & S2-FR26-GRACE0-1**:
   - Evaluasi timing `OnTime` (`submittedAt <= deadline`), `Late` (`deadline < submittedAt <= cutoff`), dan penolakan langsung pasca-cutoff (`submittedAt > cutoff`) ditegakkan simetris untuk Morning dan EOD Check-in.
   - `GracePeriod = 0` diperlakukan secara sah menggunakan nullish coalescing (`??`), menghasilkan `cutoff = deadline`.
2. **Scheduler Bukan Otoritas Validitas**: Penolakan submission pasca-cutoff dilakukan oleh domain service secara real-time pada saat HTTP request tiba, bukan bergantung pada apakah scheduler sudah sempat mengunci record atau belum.

---

## 14. Status Suggestion Audit

1. **Sifat Deterministic & Read-Only (ADR-013)**: Engine saran status (`StatusSuggestionService`) melakukan komputasi murni berdasarkan outcome komitmen dan blocker aktif tanpa pernah melakukan mutasi langsung ke database.
2. **Ketiadaan Silent Override**: Jika pilihan user berbeda dari rekomendasi sistem, modal validasi ditampilkan dengan bobot setara antara pilihan user dan rekomendasi sistem.
3. **Auditability**: Jika user mempertahankan status pilihannya (override), alasan override (`overrideReason`) wajib diisi dan disimpan di `AuditLog.valueAfter` dengan action `DAILY_RECORD_STATUS_OVERRIDDEN` (SAD §9.3).

---

## 15. Reminder Semantics Audit

1. **Konsistensi ADR-014**:
   - Pengingat cutoff Morning dan EOD beroperasi pada jendela simetris `[Deadline - 60m, Deadline)`.
   - Melewati evaluasi pada hari non-kerja (berdasarkan kalender kerja aktif) dan hari libur perusahaan (Holiday status Approved).
2. **Deduplikasi**: Menerapkan deduplikasi berlapis (in-process guard, in-run Set, dan pengecekan notifikasi yang sudah terkirim pada hari berjalan) untuk mencegah spam ke karyawan.
3. **Penerimaan Risiko Batas Batch (ADR-015 / KL-10)**: Batas batch 200 kandidat diverifikasi sebagai utang teknis MVP yang telah diterima secara sadar (*accepted risk*).

---

## 16. Forbidden Feature Cross-Check

Hasil audit silang terhadap Forbidden Feature Baseline (S2-T2):
- **FF-01 (Silent State Mutation)**: **CLEAN**. Tidak ditemukan mutasi data tanpa jejak audit.
- **FF-02 (Automatic Discipline/Penalty)**: **CLEAN**. Tidak ada tindakan pembinaan, SP, atau eskalasi formal yang dipicu otomatis oleh scheduler.
- **FF-04 (Silent Manager Editing)**: **CLEAN**. Manager tidak dapat mengubah data komitmen tanpa alur Correction Request.
- **FF-05 (Automatic Status Override)**: **CLEAN**. Status suggestion tidak pernah menimpa pilihan user tanpa konfirmasi sadar.
- **FF-06 (Automatic Submission)**: **CLEAN**. Tidak ada submission komitmen otomatis oleh sistem.
- **FF-16 (Scheduler Usurping Submission Validity)**: **CLEAN**. Validitas submission ditegakkan oleh domain service saat request tiba.
- **FF-17 (Reminder Eligibility Violations)**: **CLEAN**. Reminder mematuhi kalender kerja dan jendela waktu.
- **FF-25 (Unapproved Scheduler Domain Transitions)**: **CLEAN**. Scheduler hanya memanggil transisi resmi.
- **FF-26 (Reporting/Export Modifying State)**: **CLEAN**. Modul pelaporan bersifat read-only.
- **FF-27 (Automatic Approval of Exceptions)**: **CLEAN**. Persetujuan cuti mewajibkan aksi manual manajer.
- **FF-29 (Automatic Disciplinary Escalation)**: **CLEAN**. Eskalasi kepatuhan wajib melalui aktor manusia.

---

## 17. Test Evidence Quality

1. **Ketajaman & Kedalaman Pengujian**:
   - `scheduler.service.spec.ts`: Menguji sequencing 7 langkah, isolasi kegagalan, batas jendela pengingat 60 menit, libur/akhir pekan, dan deduplikasi.
   - `concurrency.spec.ts`: Menguji race condition nyata antara scheduler dan aksi manual reviewer/manager dengan pessimistic locking.
   - `blocker-flow.spec.ts` & `correction-request-flow.spec.ts`: Menguji seluruh rantai state transition end-to-end.
2. **Keterbatasan Mocking**:
   - Ditemukan kelemahan pengujian pada `blocker-flow.spec.ts`: Karena `auditService.record` dimock penuh, cacat pengiriman string non-UUID `'SYSTEM'` ke kolom UUID database tidak terdeteksi oleh unit test suite (menghasilkan *false positive* kelulusan test).

---

## 18. Runtime / Static Evidence

1. **Static Source Inspection**: Seluruh controller, service, skema Prisma, dan file konfigurasi diinspeksi secara langsung.
2. **Unit & Integration Test Evidence**: Seluruh 46 file test suite backend (626 tests) dan 6 file test suite frontend (91 tests) berhasil dieksekusi dengan status PASS.
3. **Database Schema & Constraints**: Skema Prisma model `AuditLog` memvalidasi ketiadaan kolom modifikasi dan keberadaan foreign key constraint ke tabel `users`.

---

## 19. Findings

| Finding ID | Severity | Domain | Requirement | Evidence | Impact | Status | Recommended Direction |
|---|---|---|---|---|---|---|---|
| **S2-T4-NOTIF-01** | **HIGH** | Notification Triggers | SAD §12.1 (Triggers #2 & #3), PRD FR-11 | `DailyAccountabilityService` tidak menginjeksi `NotificationService`. Trigger `AMBER_SUPPORT_NEEDED` dan `RED_STATUS` tidak pernah didispatch saat check-in Morning/EOD. | Stakeholder kritis (support owner, supervisor, PM) tidak menerima notifikasi real-time saat komitmen butuh bantuan (AMBER) atau menghadapi blocker berat (RED). | Injeksi `NotificationService` ke `DailyAccountabilityService` dan dispatch trigger #2 & #3 pada event check-in terkait. |
| **S2-T4-AUDIT-01** | **HIGH** | Audit Actions / Runtime Integrity | SAD §15.2, PostgreSQL UUID Schema Constraint | `blocker.service.ts` baris 736 memanggil `auditService.record` dengan `actorUserId: 'SYSTEM'`. Kolom bertipe UUID dan berelasi ke `User`. | Fatal runtime crash pada database PostgreSQL nyata saat scheduler menjalankan auto-escalate blocker (`invalid input syntax for type uuid: "SYSTEM"`). | Ubah `actorUserId: 'SYSTEM'` menjadi `actorUserId: null` atau `undefined` (sesuai mandat SAD §15.2 untuk system-triggered audit). |
| **S2-T4-NOTIF-02** | **MEDIUM** | Notification Triggers | SAD §12.1 (Trigger #8), PRD FR-52 | `POLICY_ASSIGNMENT_CHANGED` didefinisikan di konstanta namun tidak dipanggil di `PolicyService` maupun `IdentityService`. | Pengguna dan pemilik kebijakan tidak mendapat notifikasi saat penugasan organisasi atau kebijakan diperbarui. | Dispatch `POLICY_ASSIGNMENT_CHANGED` saat mutasi assignment organisasi atau pembuatan versi kebijakan baru. |
| **S2-T4-NOTIF-03** | **MEDIUM** | Notification Triggers | SAD §12.1, §12.3 | Domain services memanggil dispatch dengan string literal non-standar alih-alih enum `SystemNotificationTrigger`. | Pemetaan prioritas email gagal; Blocker Critical jatuh ke Tier 2 dan akan di-drop jika kuota email Brevo harian habis. | Selaraskan string parameter dispatch dengan enum kanonikal atau gunakan helper `dispatchTrigger()`. |
| **S2-T4-JOB-01** | **LOW** | Scheduled Jobs | SAD §6.3, §6.4, KL-05 | `SchedulerService` memanggil query baca langsung ke `prisma.user`, `prisma.exception`, dan `prisma.notification`. | Pelanggaran minor batas isolasi modularitas (meskipun murni read-only tanpa mutasi data). | Delegasikan query baca ke method helper pada domain service masing-masing. |
| **S2-T4-STATE-01** | **INFO** | State Transitions | SAD §9.8, PRD FR-43 | `CorrectionRequest` tidak menyediakan jalur koreksi untuk `AdditionalWork` yang sudah terkunci pasca EOD. | Keterbatasan desain yang telah diakui dan didokumentasikan di SAD §9.8 dan Open Item §23.2. | Pertahankan sesuai status dokumentasi open item. |

---

## 20. Coverage Summary

- **Scheduled Jobs Verified**: 10 / 10 (100%)
- **Notification Triggers Verified**: 10 / 13 (76.9% implemented; 3 missing dispatches)
- **Audit Actions Verified**: 9 kanonikal / 44 granular terdaftar (1 high runtime defect ditemukan)
- **State Transitions Verified**: 7 / 7 State Machines (100% compliant, zero illegal transitions)
- **Findings by Severity**:
  - **Critical**: 0
  - **High**: 2 (`S2-T4-NOTIF-01`, `S2-T4-AUDIT-01`)
  - **Medium**: 2 (`S2-T4-NOTIF-02`, `S2-T4-NOTIF-03`)
  - **Low**: 1 (`S2-T4-JOB-01`)
  - **Info**: 1 (`S2-T4-STATE-01`)

---

## 21. Regression Results

Pengujian regresi aktual yang dieksekusi secara lokal:
- **Backend Test Suites**: 46 / 46 passed (626 tests passed, 0 failed)
- **Frontend Test Suites**: 6 / 6 passed (91 tests passed, 0 failed)
- **Total Tests Passed**: 717 tests passed

---

## 22. Working Tree Integrity

Pemeriksaan git status dan diff membuktikan integritas lingkungan kerja:
- Seluruh kode sumber backend/frontend, skema Prisma, migrasi, dan dokumen governing S2 sebelumnya **tidak mengalami perubahan apa pun** selama proses audit ini.
- Berkas yang dihasilkan murni terbatas pada dokumen pelaporan audit yang diwajibkan:
  - `Design-Artifacts/15-S2-T4-Scheduled-Jobs-Notification-State-Audit.md`
  - `Design-Artifacts/Reports/S2-T4-Audit-Report.md`
- `Design-Artifacts/10-S2-Audit-Findings-Register.md`: **TIDAK DIUBAH** (Sesuai Section 29, temuan audit awal akan direview dan diadministrasikan terpisah).

---

## 23. Final Verdict

Berdasarkan Final Verdict Rule (Section 28):
Ditemukan **2 temuan berkategori HIGH**:
1. `S2-T4-NOTIF-01`: Kegagalan wiring pengiriman notifikasi real-time untuk Trigger #2 (`AMBER_SUPPORT_NEEDED`) dan Trigger #3 (`RED_STATUS`) pada `DailyAccountabilityService`, yang secara langsung melanggar mandat bisnis PRD FR-11 dan SAD §12.1.
2. `S2-T4-AUDIT-01`: Bug integritas skema database PostgreSQL pada pencatatan audit log `BLOCKER_AUTO_ESCALATED` (`actorUserId: 'SYSTEM'`) yang akan melempar fatal exception pada runtime database produksi nyata.

Sesuai aturan: *"CRITICAL/HIGH material finding affecting business correctness, security, authorization, or prohibited behavior: -> FAIL. Do not hide material findings under PASS WITH GAPS"*.

### **FINAL VERDICT: FAIL**

*(Audit selesai. Tahap remediasi S2-T4 akan dilaksanakan pada sesi terpisah setelah hasil audit ditinjau)*.
