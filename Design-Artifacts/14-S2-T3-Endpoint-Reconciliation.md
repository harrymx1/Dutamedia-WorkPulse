# 14. S2-T3 — Endpoint Catalog Reconciliation Matrix
## Reconciling SAD §10 Endpoint Catalog with Actual NestJS Production Routes

---

## 1. Governing Context & Reconciliation Scope

Dokumen ini merupakan artefak formal rekonsiliasi kontrak API dua arah (**Two-Way API Contract Reconciliation**) antara spesifikasi arsitektur resmi (**SAD §10 Endpoint Catalog**) dan rute HTTP aktual yang terdaftar pada runtime backend NestJS (**WorkPulse Production Backend**).

- **Primary Source of Truth (Dokumentasi)**: `Design-Artifacts/05-SAD.md` (khususnya §10.1 hingga §10.12).
- **Secondary / Governing Context**:
  - `Design-Artifacts/01-PDD(2).md`
  - `Design-Artifacts/02-PRD.md`
  - `Design-Artifacts/03-UI-UX Spec & Flow Document(2).md`
  - `Design-Artifacts/08-ADR.md` (khususnya ADR-001, ADR-002, ADR-009, ADR-010, ADR-011, ADR-012, ADR-016, ADR-017, ADR-018)
  - `Design-Artifacts/09-Known-Limitations.md`
  - `Design-Artifacts/10-S2-Audit-Findings-Register.md`
  - `Design-Artifacts/11-S2-T1-Traceability-Matrix.md`
- **Actual Route Authority (Runtime/Source)**:
  - Global API Prefix: `app.setGlobalPrefix('api/v1')` (`backend/src/main.ts:15`)
  - Global Guards: `AuthGuard` (JWT session cookie), `CsrfGuard` (Double submit cookie), `RoleGuard` (`@RequireRole(...)`) di `AppModule`/`AuthModule`/`AuthorizationModule`.
  - Contextual Scope & Ownership: Enforced at Domain Service Layer (`ScopeFilterService`, `ProjectAuthorityService`, and entity ownership checks per ADR-010/ADR-011).
  - 15 Controller Files di `backend/src/**`.
  - OpenAPI Specification Generated via Reflection: `backend/openapi.json`.

---

## 2. Table 1 — Documented (SAD §10) → Actual (NestJS Routes) Reconciliation

Klasifikasi Status:
- **MATCH**: Method, final path, dan intended behavior sesuai dengan actual NestJS route.
- **PARTIAL MATCH**: Route ada tetapi satu atau lebih property (method, auth, role, scope, semantics) berbeda.
- **MISSING ACTUAL**: Endpoint terdokumentasi di SAD tetapi tidak ditemukan pada actual Nest routes.
- **OBSOLETE DOCUMENTATION**: Endpoint dihapus/diganti secara sengaja berdasarkan keputusan arsitektur (ADR).
- **AMBIGUOUS**: Evidence tidak cukup untuk menentukan secara pasti.

*Catatan Sintaks Parameter: SAD menggunakan format OpenAPI `{param}` (misal `{id}`, `{userId}`), sedangkan NestJS menggunakan format Express `:param` (misal `:id`, `:userId`). Perbedaan format sintaks ini dinilai MATCH secara fungsional.*

| # | SAD Endpoint | SAD Method | Actual Endpoint | Actual Method | Controller / Handler | Auth | Role | Scope | Status | Evidence / Source Code |
|---|---|---|---|---|---|---|---|---|---|---|
| **10.1** | **AuthModule** | | | | | | | | | |
| 1 | `/api/v1/auth/login` | POST | `/api/v1/auth/login` | POST | `AuthController.login` | Public (`@Public()`) | Publik (None) | None | **MATCH** | `backend/src/modules/auth/auth.controller.ts:38` |
| 2 | `/api/v1/auth/logout` | POST | `/api/v1/auth/logout` | POST | `AuthController.logout` | Required (`AuthGuard`) | Terautentikasi | Session owner | **MATCH** | `backend/src/modules/auth/auth.controller.ts:93` |
| 3 | `/api/v1/auth/reset-password` | POST | `/api/v1/auth/reset-password` | POST | `AuthController.resetPassword` | Required (`AuthGuard`) | Terautentikasi | Own user | **MATCH** | `backend/src/modules/auth/auth.controller.ts:125` |
| 4 | `/api/v1/auth/admin-reset-password/{userId}` | POST | `/api/v1/auth/admin-reset-password/:userId` | POST | `AuthController.adminResetPassword` | Required (`AuthGuard`) | `SystemAdmin` (`@RequireRole`) | All users (FR-50) | **MATCH** | `backend/src/modules/auth/auth.controller.ts:138` |
| 5 | `/api/v1/auth/me` | GET | `/api/v1/auth/me` | GET | `AuthController.getMe` | Required (`AuthGuard`) | Terautentikasi | Own user | **MATCH** | `backend/src/modules/auth/auth.controller.ts:152` |
| **10.2** | **IdentityModule** | | | | | | | | | |
| 6 | `/api/v1/users` | GET | `/api/v1/users` | GET | `IdentityController.getUsers` | Required (`AuthGuard`) | `SystemAdmin`, `HRGA` (`@RequireRole`) | Global paginated | **MATCH** | `backend/src/modules/identity/identity.controller.ts:33` |
| 7 | `/api/v1/users` | POST | `/api/v1/users` | POST | `IdentityController.createUser` | Required (`AuthGuard`) | `SystemAdmin` (`@RequireRole`) | Global organization | **MATCH** | `backend/src/modules/identity/identity.controller.ts:42` |
| 8 | `/api/v1/users/{id}` | PATCH | `/api/v1/users/:id` | PATCH | `IdentityController.updateUserStatus` | Required (`AuthGuard`) | `SystemAdmin` (`@RequireRole`) | Global organization | **MATCH** | `backend/src/modules/identity/identity.controller.ts:60` |
| 9 | `/api/v1/users/{id}/organizational-assignments` | GET | `/api/v1/users/:id/organizational-assignments` | GET | `IdentityController.getOrganizationalAssignments` | Required (`AuthGuard`) | SAD: `SystemAdmin`, `HRGA`, pemilik vs Actual: Any authenticated | SAD: Restricted vs Actual: Unvalidated | **PARTIAL MATCH** | `backend/src/modules/identity/identity.controller.ts:74` (Finding E6/E7) |
| 10 | `/api/v1/organizational-assignments` | POST | `/api/v1/organizational-assignments` | POST | `IdentityController.createOrganizationalAssignment` | Required (`AuthGuard`) | `SystemAdmin` (`@RequireRole`) | Global organization | **MATCH** | `backend/src/modules/identity/identity.controller.ts:84` |
| 11 | `/api/v1/project-authority-mappings` | POST | `/api/v1/project-authority-mappings` | POST | `IdentityController.createProjectAuthorityMapping` | Required (`AuthGuard`) | `SystemAdmin`, `Head` (`@RequireRole`) | Project scope | **MATCH** | `backend/src/modules/identity/identity.controller.ts:97` |
| 12 | `/api/v1/project-authority-mappings/{id}` | PATCH | `/api/v1/project-authority-mappings/:id` | PATCH | `IdentityController.updateProjectAuthorityMapping` | Required (`AuthGuard`) | `SystemAdmin`, `Head` (`@RequireRole`) | Project scope | **MATCH** | `backend/src/modules/identity/identity.controller.ts:110` |
| 13 | `/api/v1/temporary-reviewer-assignments` | GET | `/api/v1/temporary-reviewer-assignments` | GET | `IdentityController.getTemporaryReviewerAssignments` | Required (`AuthGuard`) | `SystemAdmin`, `Head` (`@RequireRole`) | ADR-002 scope filter | **MATCH** | `backend/src/modules/identity/identity.controller.ts:128` |
| 14 | `/api/v1/temporary-reviewer-assignments` | POST | `/api/v1/temporary-reviewer-assignments` | POST | `IdentityController.createTemporaryReviewerAssignment` | Required (`AuthGuard`) | `SystemAdmin`, `Head` (`@RequireRole`) | Delegated scope | **MATCH** | `backend/src/modules/identity/identity.controller.ts:148` |
| **10.3** | **DailyAccountabilityModule** | | | | | | | | | |
| 15 | `/api/v1/daily-accountability-records/morning-checkin` | POST | `/api/v1/daily-accountability-records/morning-checkin` | POST | `DailyAccountabilityController.submitMorningCheckin` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own user | **MATCH** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:38` |
| 16 | `/api/v1/daily-accountability-records/today` | GET | `/api/v1/daily-accountability-records/today` | GET | `DailyAccountabilityController.getTodayRecord` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own user | **MATCH** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:53` |
| 17 | `/api/v1/daily-accountability-records/{id}/eod-checkin` | POST | `/api/v1/daily-accountability-records/:id/eod-checkin` | POST | `DailyAccountabilityController.submitEodCheckin` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own record (service check) | **MATCH** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:64` |
| 18 | `/api/v1/daily-accountability-records/{id}/eod-checkin/confirm-override` | POST | `/api/v1/daily-accountability-records/:id/eod-checkin/confirm-override` | POST | `DailyAccountabilityController.confirmOverride` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own record (service check) | **MATCH** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:80` |
| 19 | `/api/v1/commitments/{id}` | PATCH | `/api/v1/commitments/:id` | PATCH | `CommitmentController.patchCommitment` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own commitment (service check) | **MATCH** | `backend/src/modules/daily-accountability/controllers/commitment.controller.ts:31` |
| 20 | `/api/v1/additional-work` | POST | `/api/v1/additional-work` | POST | `AdditionalWorkController.createAdditionalWork` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own record (service check) | **MATCH** | `backend/src/modules/daily-accountability/controllers/additional-work.controller.ts:33` |
| 21 | `/api/v1/additional-work/{id}` | PATCH | `/api/v1/additional-work/:id` | PATCH | `AdditionalWorkController.patchAdditionalWork` | Required (`AuthGuard`) | `Employee` (`@RequireRole`) | Own record (service check) | **MATCH** | `backend/src/modules/daily-accountability/controllers/additional-work.controller.ts:49` |
| 22 | `/api/v1/daily-accountability-records` | GET | `/api/v1/daily-accountability-records` | GET | `DailyAccountabilityController.findAll` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService | **MATCH** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:96` |
| 23 | `/api/v1/daily-accountability-records/{id}` | GET | `/api/v1/daily-accountability-records/:id` | GET | `DailyAccountabilityController.findById` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService (404 outside) | **MATCH** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:108` |
| **10.4** | **BlockerModule** | | | | | | | | | |
| 24 | `/api/v1/blockers` | POST | `/api/v1/blockers` | POST | `BlockerController.createBlocker` | Required (`AuthGuard`) | Semua role terautentikasi | Reporter assigned in service | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:33` |
| 25 | `/api/v1/blockers` | GET | `/api/v1/blockers` | GET | `BlockerController.findAll` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:46` |
| 26 | `/api/v1/blockers/{id}` | GET | `/api/v1/blockers/:id` | GET | `BlockerController.findById` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService (404 outside) | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:58` |
| 27 | `/api/v1/blockers/{id}/acknowledge` | POST | `/api/v1/blockers/:id/acknowledge` | POST | `BlockerController.acknowledge` | Required (`AuthGuard`) | `ownerNeededUserId` | Owner check in service | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:70` |
| 28 | `/api/v1/blockers/{id}/update` | POST | `/api/v1/blockers/:id/update` | POST | `BlockerController.updateProgress` | Required (`AuthGuard`) | `ownerNeededUserId` | Owner check in service | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:83` |
| 29 | `/api/v1/blockers/{id}/resolve` | POST | `/api/v1/blockers/:id/resolve` | POST | `BlockerController.resolve` | Required (`AuthGuard`) | `ownerNeededUserId` | Owner check in service | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:97` |
| 30 | `/api/v1/blockers/{id}/accept-risk` | POST | `/api/v1/blockers/:id/accept-risk` | POST | `BlockerController.acceptRisk` | Required (`AuthGuard`) | `ownerNeededUserId` | Owner check in service | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:111` |
| 31 | `/api/v1/blockers/{id}/close` | POST | `/api/v1/blockers/:id/close` | POST | `BlockerController.close` | Required (`AuthGuard`) | `raisedByUserId` | Reporter check in service | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:125` |
| 32 | `/api/v1/blockers/{id}/support` | POST | `/api/v1/blockers/:id/support` | POST | `BlockerController.addSupportContribution` | Required (`AuthGuard`) | Semua role terautentikasi | Contributor registered | **MATCH** | `backend/src/modules/blocker/controllers/blocker.controller.ts:138` |
| **10.5** | **CorrectionRequestModule** | | | | | | | | | |
| 33 | `/api/v1/correction-requests` | POST | `/api/v1/correction-requests` | POST | `CorrectionRequestController.create` | Required (`AuthGuard`) | `Employee` (pemilik) | Target commitment owner | **MATCH** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:33` |
| 34 | `/api/v1/correction-requests` | GET | `/api/v1/correction-requests` | GET | `CorrectionRequestController.findAll` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService | **MATCH** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:46` |
| 35 | `/api/v1/correction-requests/{id}` | GET | `/api/v1/correction-requests/:id` | GET | `CorrectionRequestController.findById` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService (404 outside) | **MATCH** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:58` |
| 36 | `/api/v1/correction-requests/{id}/object` | POST | `/api/v1/correction-requests/:id/object` | POST | `CorrectionRequestController.objectCorrection` | Required (`AuthGuard`) | Authorized Reviewer | `isAuthorizedReviewer` in service | **MATCH** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:70` |
| **10.6** | **ExceptionModule** | | | | | | | | | |
| 37 | `/api/v1/exceptions/leave` | POST | `/api/v1/exceptions/leave` | POST | `ExceptionController.createLeave` | Required (`AuthGuard`) | `Employee` | Self submission | **MATCH** | `backend/src/modules/exception/controllers/exception.controller.ts:37` |
| 38 | `/api/v1/exceptions/holiday` | POST | `/api/v1/exceptions/holiday` | POST | `ExceptionController.createHoliday` | Required (`AuthGuard`) | `SystemAdmin`, `HRGA` (`@RequireRole`) | Organization-wide | **MATCH** | `backend/src/modules/exception/controllers/exception.controller.ts:50` |
| 39 | `/api/v1/exceptions/exemption` | POST | `/api/v1/exceptions/exemption` | POST | `ExceptionController.createExemption` | Required (`AuthGuard`) | `SystemAdmin`, `HRGA` (`@RequireRole`) | Target employee | **MATCH** | `backend/src/modules/exception/controllers/exception.controller.ts:65` |
| 40 | `/api/v1/exceptions` | GET | `/api/v1/exceptions` | GET | `ExceptionController.findAll` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService | **MATCH** | `backend/src/modules/exception/controllers/exception.controller.ts:80` |
| 41 | `/api/v1/exceptions/{id}/approve` | POST | `/api/v1/exceptions/:id/approve` | POST | `ExceptionController.approveLeave` | Required (`AuthGuard`) | Authorized Reviewer | `isAuthorizedApprover` in service | **MATCH** | `backend/src/modules/exception/controllers/exception.controller.ts:104` |
| 42 | `/api/v1/exceptions/{id}/reject` | POST | `/api/v1/exceptions/:id/reject` | POST | `ExceptionController.rejectLeave` | Required (`AuthGuard`) | Authorized Reviewer | `isAuthorizedApprover` in service | **MATCH** | `backend/src/modules/exception/controllers/exception.controller.ts:117` |
| **10.7** | **ManagerNoteModule** | | | | | | | | | |
| 43 | `/api/v1/manager-notes` | POST | `/api/v1/manager-notes` | POST | `ManagerNoteController.create` | Required (`AuthGuard`) | `Supervisor_TL`, `Head`, `HRGA` (`@RequireRole`) | Subordinate target scope | **MATCH** | `backend/src/modules/manager-note/controllers/manager-note.controller.ts:34` |
| 44 | `/api/v1/manager-notes` | GET | `/api/v1/manager-notes` | GET | `ManagerNoteController.findAll` | Required (`AuthGuard`) | Sesuai scope + visibility | BR-14 visibility filter in service | **MATCH** | `backend/src/modules/manager-note/controllers/manager-note.controller.ts:49` |
| 45 | `/api/v1/manager-notes/{id}` | GET | `/api/v1/manager-notes/:id` | GET | `ManagerNoteController.findById` | Required (`AuthGuard`) | Sesuai scope + visibility | BR-14 visibility (404 outside) | **MATCH** | `backend/src/modules/manager-note/controllers/manager-note.controller.ts:61` |
| **10.8** | **ComplianceModule** | | | | | | | | | |
| 46 | `/api/v1/compliance-events` | GET | `/api/v1/compliance-events` | GET | `ComplianceController.findAll` | Required (`AuthGuard`) | `Supervisor_TL`, `Head`, `HRGA`, `CEO_Management` (`@RequireRole`) | ScopeFilterService | **MATCH** | `backend/src/modules/compliance/controllers/compliance.controller.ts:34` |
| 47 | `/api/v1/compliance-events/{id}` | GET | `/api/v1/compliance-events/:id` | GET | `ComplianceController.findById` | Required (`AuthGuard`) | `Supervisor_TL`, `Head`, `HRGA`, `CEO_Management` (`@RequireRole`) | ScopeFilterService (404 outside) | **MATCH** | `backend/src/modules/compliance/controllers/compliance.controller.ts:47` |
| 48 | `/api/v1/compliance-events/{id}/coach` | POST | `/api/v1/compliance-events/:id/coach` | POST | `ComplianceController.coach` | Required (`AuthGuard`) | `Supervisor_TL`, `Head` (`@RequireRole`) | Subordinate event (transaksional atomik) | **MATCH** | `backend/src/modules/compliance/controllers/compliance.controller.ts:60` |
| 49 | `/api/v1/compliance-events/{id}/record-warning` | POST | `/api/v1/compliance-events/:id/record-warning` | POST | `ComplianceController.recordWarning` | Required (`AuthGuard`) | `HRGA` (`@RequireRole`) | HRGA organizational authority | **MATCH** | `backend/src/modules/compliance/controllers/compliance.controller.ts:75` |
| 50 | `/api/v1/compliance-events/{id}/escalate-formal` | POST | `/api/v1/compliance-events/:id/escalate-formal` | POST | `ComplianceController.escalateFormal` | Required (`AuthGuard`) | `HRGA` (`@RequireRole`) | HRGA organizational authority | **MATCH** | `backend/src/modules/compliance/controllers/compliance.controller.ts:90` |
| **10.9** | **PolicyModule** | | | | | | | | | |
| 51 | `/api/v1/policies` | GET | `/api/v1/policies` | GET | `PolicyController.getActivePolicies` | Required (`AuthGuard`) | Terautentikasi (semua role) | Public to all authenticated | **MATCH** | `backend/src/modules/policy/policy.controller.ts:32` |
| 52 | `/api/v1/policies` | POST | `/api/v1/policies` | POST | `PolicyController.createPolicy` | Required (`AuthGuard`) | `PolicyOwnerGuard` (SAD §8.10) | Authorized category policy owner | **MATCH** | `backend/src/modules/policy/policy.controller.ts:41` |
| 53 | `/api/v1/policies/{category}/history` | GET | `/api/v1/policies/:category/history` | GET | `PolicyController.getPolicyHistory` | Required (`AuthGuard`) | Terautentikasi (semua role) | Public to all authenticated | **MATCH** | `backend/src/modules/policy/policy.controller.ts:55` |
| 54 | `/api/v1/policy-owner-assignments` | POST | `/api/v1/policy-owner-assignments` | POST | `PolicyOwnerAssignmentController.createPolicyOwnerAssignment` | Required (`AuthGuard`) | `SystemAdmin` (`@RequireRole`) | Policy governance | **MATCH** | `backend/src/modules/policy/policy.controller.ts:86` |
| **10.10** | **NotificationModule** | | | | | | | | | |
| 55 | `/api/v1/notifications` | GET | `/api/v1/notifications` | GET | `NotificationController.getNotifications` | Required (`AuthGuard`) | Pemilik | Caller own notifications | **MATCH** | `backend/src/modules/notification/notification.controller.ts:25` |
| 56 | `/api/v1/notifications/{id}/mark-read` | POST | `/api/v1/notifications/:id/mark-read` | POST | `NotificationController.markRead` | Required (`AuthGuard`) | Pemilik | Caller own notification | **MATCH** | `backend/src/modules/notification/notification.controller.ts:37` |
| 57 | `/api/v1/notifications/mark-all-read` | POST | `/api/v1/notifications/mark-all-read` | POST | `NotificationController.markAllRead` | Required (`AuthGuard`) | Pemilik | Caller own notifications | **MATCH** | `backend/src/modules/notification/notification.controller.ts:50` |
| **10.11** | **ReportingModule** | | | | | | | | | |
| 58 | `/api/v1/reports/daily-exception` | GET | `/api/v1/reports/daily-exception` | GET | `ReportingController.getDailyException` | Required (`AuthGuard`) | `Head`, `CEO_Management` (`@RequireRole`) | ScopeFilterService | **MATCH** | `backend/src/modules/reporting/controllers/reporting.controller.ts:31` |
| 59 | `/api/v1/reports/weekly-team-summary` | GET | `/api/v1/reports/weekly-team-summary` | GET | `ReportingController.getWeeklyTeamSummary` | Required (`AuthGuard`) | `Supervisor_TL`, `Head`, `CEO_Management` (`@RequireRole`) | ScopeFilterService | **MATCH** | `backend/src/modules/reporting/controllers/reporting.controller.ts:57` |
| 60 | `/api/v1/reports/monthly-trend` | GET | `/api/v1/reports/monthly-trend` | GET | `ReportingController.getMonthlyTrend` | Required (`AuthGuard`) | `CEO_Management` (`@RequireRole`) | Organization-wide | **MATCH** | `backend/src/modules/reporting/controllers/reporting.controller.ts:70` |
| 61 | `/api/v1/reports/individual-evidence/{userId}` | GET | `/api/v1/reports/individual-evidence/:userId` | GET | `ReportingController.getIndividualEvidence` | Required (`AuthGuard`) | Sesuai scope | ScopeFilterService (throws 403 outside) | **MATCH** | `backend/src/modules/reporting/controllers/reporting.controller.ts:83` |
| 62 | `/api/v1/reports/blocker-root-cause` | GET | `/api/v1/reports/blocker-root-cause` | GET | `ReportingController.getBlockerRootCause` | Required (`AuthGuard`) | `Head`, `CEO_Management` (`@RequireRole`) | ScopeFilterService | **MATCH** | `backend/src/modules/reporting/controllers/reporting.controller.ts:96` |
| 63 | `/api/v1/reports/{reportType}/export` | GET | `/api/v1/reports/:reportType/export` | GET | `ReportingController.exportReport` | Required (`AuthGuard`) | Mengikuti report terkait | ScopeFilterService + signed URL | **MATCH** | `backend/src/modules/reporting/controllers/reporting.controller.ts:109` |
| **10.12** | **FileStorageModule** | | | | | | | | | |
| 64 | `/api/v1/files/upload-url` | POST | `/api/v1/files/upload-url` | POST | `FileStorageController.generateUploadUrl` | Required (`AuthGuard`) | Terautentikasi (`@ThrottleUpload`) | Purpose & role validation | **MATCH** | `backend/src/modules/file-storage/controllers/file-storage.controller.ts:31` |
| 65 | `/api/v1/files/{fileId}/download-url` | GET | `/api/v1/files/:fileId/download-url` | GET | `FileStorageController.generateDownloadUrl` | Required (`AuthGuard`) | Sesuai scope resource | Ownership check in service (SAD §14.4) | **MATCH** | `backend/src/modules/file-storage/controllers/file-storage.controller.ts:45` |

---

## 3. Table 2 — Actual (NestJS Routes) → Documented (SAD §10) Reconciliation

Klasifikasi:
- **DOCUMENTED**: Exact match atau semantically valid match dengan SAD §10.
- **UNDOCUMENTED**: Route ada di produksi tetapi tidak tercantum pada katalog SAD §10.
- **INTERNAL / INTENTIONAL EXCEPTION**: Technical/health/readiness/docs route yang wajar tidak dimasukkan ke business API catalog.
- **POTENTIALLY ACCIDENTAL EXPOSURE**: Route terekspos tanpa dasar kebutuhan fungsional/teknis.

| # | Actual Method | Actual Path | Controller / Handler | Documented in SAD? | Classification | Evidence & Operational Rationale |
|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1` | `AppController.getHello` | No | **INTERNAL / INTENTIONAL EXCEPTION** | Root health ping endpoint untuk verifikasi kesiapan HTTP service (`backend/src/app.controller.ts:10`). |
| 2 | POST | `/api/v1/additional-work` | `AdditionalWorkController.createAdditionalWork` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/additional-work.controller.ts:33` |
| 3 | PATCH | `/api/v1/additional-work/:id` | `AdditionalWorkController.patchAdditionalWork` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/additional-work.controller.ts:49` |
| 4 | POST | `/api/v1/auth/admin-reset-password/:userId` | `AuthController.adminResetPassword` | Yes (SAD §10.1) | **DOCUMENTED** | `backend/src/modules/auth/auth.controller.ts:138` |
| 5 | POST | `/api/v1/auth/login` | `AuthController.login` | Yes (SAD §10.1) | **DOCUMENTED** | `backend/src/modules/auth/auth.controller.ts:38` |
| 6 | POST | `/api/v1/auth/logout` | `AuthController.logout` | Yes (SAD §10.1) | **DOCUMENTED** | `backend/src/modules/auth/auth.controller.ts:93` |
| 7 | GET | `/api/v1/auth/me` | `AuthController.getMe` | Yes (SAD §10.1) | **DOCUMENTED** | `backend/src/modules/auth/auth.controller.ts:152` |
| 8 | POST | `/api/v1/auth/reset-password` | `AuthController.resetPassword` | Yes (SAD §10.1) | **DOCUMENTED** | `backend/src/modules/auth/auth.controller.ts:125` |
| 9 | POST | `/api/v1/blockers` | `BlockerController.createBlocker` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:33` |
| 10 | GET | `/api/v1/blockers` | `BlockerController.findAll` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:46` |
| 11 | GET | `/api/v1/blockers/:id` | `BlockerController.findById` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:58` |
| 12 | POST | `/api/v1/blockers/:id/accept-risk` | `BlockerController.acceptRisk` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:111` |
| 13 | POST | `/api/v1/blockers/:id/acknowledge` | `BlockerController.acknowledge` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:70` |
| 14 | POST | `/api/v1/blockers/:id/close` | `BlockerController.close` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:125` |
| 15 | POST | `/api/v1/blockers/:id/resolve` | `BlockerController.resolve` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:97` |
| 16 | POST | `/api/v1/blockers/:id/support` | `BlockerController.addSupportContribution` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:138` |
| 17 | POST | `/api/v1/blockers/:id/update` | `BlockerController.updateProgress` | Yes (SAD §10.4) | **DOCUMENTED** | `backend/src/modules/blocker/controllers/blocker.controller.ts:83` |
| 18 | PATCH | `/api/v1/commitments/:id` | `CommitmentController.patchCommitment` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/commitment.controller.ts:31` |
| 19 | GET | `/api/v1/compliance-events` | `ComplianceController.findAll` | Yes (SAD §10.8) | **DOCUMENTED** | `backend/src/modules/compliance/controllers/compliance.controller.ts:34` |
| 20 | GET | `/api/v1/compliance-events/:id` | `ComplianceController.findById` | Yes (SAD §10.8) | **DOCUMENTED** | `backend/src/modules/compliance/controllers/compliance.controller.ts:47` |
| 21 | POST | `/api/v1/compliance-events/:id/coach` | `ComplianceController.coach` | Yes (SAD §10.8) | **DOCUMENTED** | `backend/src/modules/compliance/controllers/compliance.controller.ts:60` |
| 22 | POST | `/api/v1/compliance-events/:id/escalate-formal` | `ComplianceController.escalateFormal` | Yes (SAD §10.8) | **DOCUMENTED** | `backend/src/modules/compliance/controllers/compliance.controller.ts:90` |
| 23 | POST | `/api/v1/compliance-events/:id/record-warning` | `ComplianceController.recordWarning` | Yes (SAD §10.8) | **DOCUMENTED** | `backend/src/modules/compliance/controllers/compliance.controller.ts:75` |
| 24 | POST | `/api/v1/correction-requests` | `CorrectionRequestController.create` | Yes (SAD §10.5) | **DOCUMENTED** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:33` |
| 25 | GET | `/api/v1/correction-requests` | `CorrectionRequestController.findAll` | Yes (SAD §10.5) | **DOCUMENTED** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:46` |
| 26 | GET | `/api/v1/correction-requests/:id` | `CorrectionRequestController.findById` | Yes (SAD §10.5) | **DOCUMENTED** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:58` |
| 27 | POST | `/api/v1/correction-requests/:id/object` | `CorrectionRequestController.objectCorrection` | Yes (SAD §10.5) | **DOCUMENTED** | `backend/src/modules/correction-request/controllers/correction-request.controller.ts:70` |
| 28 | GET | `/api/v1/daily-accountability-records` | `DailyAccountabilityController.findAll` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:96` |
| 29 | POST | `/api/v1/daily-accountability-records/morning-checkin` | `DailyAccountabilityController.submitMorningCheckin` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:38` |
| 30 | GET | `/api/v1/daily-accountability-records/today` | `DailyAccountabilityController.getTodayRecord` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:53` |
| 31 | GET | `/api/v1/daily-accountability-records/:id` | `DailyAccountabilityController.findById` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:108` |
| 32 | POST | `/api/v1/daily-accountability-records/:id/eod-checkin` | `DailyAccountabilityController.submitEodCheckin` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:64` |
| 33 | POST | `/api/v1/daily-accountability-records/:id/eod-checkin/confirm-override` | `DailyAccountabilityController.confirmOverride` | Yes (SAD §10.3) | **DOCUMENTED** | `backend/src/modules/daily-accountability/controllers/daily-accountability.controller.ts:80` |
| 34 | GET | `/api/v1/exceptions` | `ExceptionController.findAll` | Yes (SAD §10.6) | **DOCUMENTED** | `backend/src/modules/exception/controllers/exception.controller.ts:80` |
| 35 | POST | `/api/v1/exceptions/exemption` | `ExceptionController.createExemption` | Yes (SAD §10.6) | **DOCUMENTED** | `backend/src/modules/exception/controllers/exception.controller.ts:65` |
| 36 | POST | `/api/v1/exceptions/holiday` | `ExceptionController.createHoliday` | Yes (SAD §10.6) | **DOCUMENTED** | `backend/src/modules/exception/controllers/exception.controller.ts:50` |
| 37 | POST | `/api/v1/exceptions/leave` | `ExceptionController.createLeave` | Yes (SAD §10.6) | **DOCUMENTED** | `backend/src/modules/exception/controllers/exception.controller.ts:37` |
| 38 | GET | `/api/v1/exceptions/:id` | `ExceptionController.findById` | No | **UNDOCUMENTED** | Query detail permohonan dispensasi/cuti berdasarkan UUID (`backend/src/modules/exception/controllers/exception.controller.ts:92`). Scope-filtered 404 (SAD §7.7, §8.11). Omitted from SAD §10.6 table. |
| 39 | POST | `/api/v1/exceptions/:id/approve` | `ExceptionController.approveLeave` | Yes (SAD §10.6) | **DOCUMENTED** | `backend/src/modules/exception/controllers/exception.controller.ts:104` |
| 40 | POST | `/api/v1/exceptions/:id/reject` | `ExceptionController.rejectLeave` | Yes (SAD §10.6) | **DOCUMENTED** | `backend/src/modules/exception/controllers/exception.controller.ts:117` |
| 41 | POST | `/api/v1/files/upload-url` | `FileStorageController.generateUploadUrl` | Yes (SAD §10.12) | **DOCUMENTED** | `backend/src/modules/file-storage/controllers/file-storage.controller.ts:31` |
| 42 | GET | `/api/v1/files/:fileId/download-url` | `FileStorageController.generateDownloadUrl` | Yes (SAD §10.12) | **DOCUMENTED** | `backend/src/modules/file-storage/controllers/file-storage.controller.ts:45` |
| 43 | POST | `/api/v1/manager-notes` | `ManagerNoteController.create` | Yes (SAD §10.7) | **DOCUMENTED** | `backend/src/modules/manager-note/controllers/manager-note.controller.ts:34` |
| 44 | GET | `/api/v1/manager-notes` | `ManagerNoteController.findAll` | Yes (SAD §10.7) | **DOCUMENTED** | `backend/src/modules/manager-note/controllers/manager-note.controller.ts:49` |
| 45 | GET | `/api/v1/manager-notes/:id` | `ManagerNoteController.findById` | Yes (SAD §10.7) | **DOCUMENTED** | `backend/src/modules/manager-note/controllers/manager-note.controller.ts:61` |
| 46 | GET | `/api/v1/notifications` | `NotificationController.getNotifications` | Yes (SAD §10.10) | **DOCUMENTED** | `backend/src/modules/notification/notification.controller.ts:25` |
| 47 | POST | `/api/v1/notifications/mark-all-read` | `NotificationController.markAllRead` | Yes (SAD §10.10) | **DOCUMENTED** | `backend/src/modules/notification/notification.controller.ts:50` |
| 48 | POST | `/api/v1/notifications/:id/mark-read` | `NotificationController.markRead` | Yes (SAD §10.10) | **DOCUMENTED** | `backend/src/modules/notification/notification.controller.ts:37` |
| 49 | POST | `/api/v1/organizational-assignments` | `IdentityController.createOrganizationalAssignment` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:84` |
| 50 | GET | `/api/v1/policies` | `PolicyController.getActivePolicies` | Yes (SAD §10.9) | **DOCUMENTED** | `backend/src/modules/policy/policy.controller.ts:32` |
| 51 | POST | `/api/v1/policies` | `PolicyController.createPolicy` | Yes (SAD §10.9) | **DOCUMENTED** | `backend/src/modules/policy/policy.controller.ts:41` |
| 52 | POST | `/api/v1/policies/owner-assignments` | `PolicyController.createPolicyOwnerAssignment` | No | **UNDOCUMENTED / DUPLICATE** | Nested alias route penugasan Policy Owner di dalam PolicyController (`backend/src/modules/policy/policy.controller.ts:67`). Dibatasi `Role.SystemAdmin`. |
| 53 | GET | `/api/v1/policies/:category/history` | `PolicyController.getPolicyHistory` | Yes (SAD §10.9) | **DOCUMENTED** | `backend/src/modules/policy/policy.controller.ts:55` |
| 54 | POST | `/api/v1/policy-owner-assignments` | `PolicyOwnerAssignmentController.createPolicyOwnerAssignment` | Yes (SAD §10.9) | **DOCUMENTED** | `backend/src/modules/policy/policy.controller.ts:86` |
| 55 | POST | `/api/v1/project-authority-mappings` | `IdentityController.createProjectAuthorityMapping` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:97` |
| 56 | PATCH | `/api/v1/project-authority-mappings/:id` | `IdentityController.updateProjectAuthorityMapping` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:110` |
| 57 | GET | `/api/v1/reports/blocker-root-cause` | `ReportingController.getBlockerRootCause` | Yes (SAD §10.11) | **DOCUMENTED** | `backend/src/modules/reporting/controllers/reporting.controller.ts:96` |
| 58 | GET | `/api/v1/reports/daily-exception` | `ReportingController.getDailyException` | Yes (SAD §10.11) | **DOCUMENTED** | `backend/src/modules/reporting/controllers/reporting.controller.ts:31` |
| 59 | GET | `/api/v1/reports/exception-summary` | `ReportingController.getExceptionSummary` | No | **UNDOCUMENTED** | Endpoint agregasi widget dashboard `ExceptionSummaryWidget.vue` sesuai rancangan SAD §13.2 (`backend/src/modules/reporting/controllers/reporting.controller.ts:44`). Omitted from SAD §10.11 table. |
| 60 | GET | `/api/v1/reports/individual-evidence/:userId` | `ReportingController.getIndividualEvidence` | Yes (SAD §10.11) | **DOCUMENTED** | `backend/src/modules/reporting/controllers/reporting.controller.ts:83` |
| 61 | GET | `/api/v1/reports/monthly-trend` | `ReportingController.getMonthlyTrend` | Yes (SAD §10.11) | **DOCUMENTED** | `backend/src/modules/reporting/controllers/reporting.controller.ts:70` |
| 62 | GET | `/api/v1/reports/weekly-team-summary` | `ReportingController.getWeeklyTeamSummary` | Yes (SAD §10.11) | **DOCUMENTED** | `backend/src/modules/reporting/controllers/reporting.controller.ts:57` |
| 63 | GET | `/api/v1/reports/:reportType/export` | `ReportingController.exportReport` | Yes (SAD §10.11) | **DOCUMENTED** | `backend/src/modules/reporting/controllers/reporting.controller.ts:109` |
| 64 | GET | `/api/v1/temporary-reviewer-assignments` | `IdentityController.getTemporaryReviewerAssignments` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:128` |
| 65 | POST | `/api/v1/temporary-reviewer-assignments` | `IdentityController.createTemporaryReviewerAssignment` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:148` |
| 66 | GET | `/api/v1/users` | `IdentityController.getUsers` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:33` |
| 67 | POST | `/api/v1/users` | `IdentityController.createUser` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:42` |
| 68 | GET | `/api/v1/users/:id` | `IdentityController.getUserById` | No | **UNDOCUMENTED** | Query detail pengguna spesifik berdasarkan UUID (`backend/src/modules/identity/identity.controller.ts:52`). Terautentikasi. Omitted from SAD §10.2 table. |
| 69 | PATCH | `/api/v1/users/:id` | `IdentityController.updateUserStatus` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:60` |
| 70 | GET | `/api/v1/users/:id/organizational-assignments` | `IdentityController.getOrganizationalAssignments` | Yes (SAD §10.2) | **DOCUMENTED** | `backend/src/modules/identity/identity.controller.ts:74` |

---

## 4. Synthesis of Reconciliation Metrics

```
+---------------------------------------------------------------------------------+
|                       TWO-WAY RECONCILIATION SUMMARY                            |
+---------------------------------------------------------------------------------+
| 1. DOCUMENTED (SAD §10) -> ACTUAL (NESTJS ROUTES)                               |
|    - Total Documented Endpoints : 65                                            |
|    - MATCH                      : 64 (98.46%)                                   |
|    - PARTIAL MATCH              :  1 ( 1.54%) [Auth/Scope gap: Org Assignments] |
|    - MISSING ACTUAL             :  0 ( 0.00%)                                   |
|    - OBSOLETE DOCUMENTATION     :  0 ( 0.00%)                                   |
|    - AMBIGUOUS                  :  0 ( 0.00%)                                   |
|                                                                                 |
| 2. ACTUAL (NESTJS ROUTES) -> DOCUMENTED (SAD §10)                               |
|    - Total Actual Routes        : 70                                            |
|    - DOCUMENTED                 : 65 (92.86%)                                   |
|    - UNDOCUMENTED BUSINESS      :  4 ( 5.71%) [getById x2, widget, alias]       |
|    - INTERNAL / EXCEPTION       :  1 ( 1.43%) [AppController GET /api/v1]       |
|    - ACCIDENTAL EXPOSURE        :  0 ( 0.00%)                                   |
|    - AMBIGUOUS                  :  0 ( 0.00%)                                   |
+---------------------------------------------------------------------------------+
```
