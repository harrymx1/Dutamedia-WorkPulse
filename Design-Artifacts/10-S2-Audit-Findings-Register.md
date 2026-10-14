# S2 Audit Findings Register

## Purpose

Dokumen ini merupakan register terpusat untuk seluruh temuan (*audit findings*) yang diidentifikasi selama Tahap S2 — Verifikasi Berbasis Requirement pada sistem WorkPulse. Dokumen ini menjadi *single source of truth* untuk melacak setiap kesenjangan (*gap*) dari saat pertama kali ditemukan hingga melalui proses triage, perencanaan perbaikan (*remediation*), verifikasi pengujian, dan penutupan resmi (*closure*).

## Status Legend

- **OPEN**: Ditemukan dan belum ditriase/diperbaiki.
- **IN TRIAGE**: Sedang dievaluasi untuk menentukan tindakan, dampak, atau prioritas.
- **REMEDIATION PLANNED**: Keputusan teknis dan rencana perbaikan telah ditetapkan.
- **FIXED**: Implementasi kode atau test telah diperbaiki tetapi belum diverifikasi penutupannya.
- **VERIFIED**: Remediation telah diverifikasi melalui pengujian otomatis atau bukti runtime.
- **ACCEPTED RISK / ADR**: Gap secara sadar diterima sebagai batasan desain melalui keputusan arsitektural resmi (ADR).
- **CLOSED**: Final closure setelah verifikasi lengkap dan disetujui oleh otoritas terkait.

*Catatan: Status setiap finding mengikuti status terkini pada Register. Finding dapat berada pada OPEN, IN TRIAGE, REMEDIATION PLANNED, FIXED, VERIFIED, ACCEPTED RISK / ADR, atau CLOSED sesuai progres audit dan remediation.*

## Register

| Finding ID | Type | Requirement | Gap | Evidence | Current Status | Required Future Action | Closure Evidence |
|---|---|---|---|---|---|---|---|
| S2-FR-04-1 | Functional Requirement Gap | PRD FR-04 | `knownBlockerNote` sudah diwajibkan pada AMBER/RED, tetapi `supportNeeded` belum diwajibkan oleh production code. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:205-242, 806-843` | VERIFIED | CLOSED — VERIFIED VIA S2-T1 PHASE A | Lulus verifikasi independen S2-T1 Phase A: conditional validation pada `submitMorningCheckin` (baris 227-241) dan `patchCommitment` (baris 823-843) menegakkan bahwa jika `initialRisk` AMBER/RED, `supportNeeded` wajib berupa non-empty, non-whitespace string (reason: `REQUIRED_WHEN_CONDITIONAL`); GREEN tetap opsional; DTO tetap `@IsOptional()`; validasi `knownBlockerNote`/`targetBlockerNote` tetap utuh; 6 unit tests (54/54 pass targeted, 550/550 full suite pass). |
| S2-TEST-GAP-1 | Test Coverage Gap | PRD FR-02 | Production implementation menyusun dan menyimpan `orgContextSnapshot`, tetapi test suite belum memiliki assertion eksplisit yang memverifikasi payload snapshot tersebut. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:165-169`<br>Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts:303-401` | VERIFIED | CLOSED — VERIFIED VIA S2-T1 PHASE A | Lulus verifikasi independen S2-T1 Phase A: assertion eksplisit ditambahkan pada `daily-accountability.service.spec.ts` yang memverifikasi nilai semantik riil `role`, `function`, dan `directManagerId` pada alur create record baru (`dailyAccountabilityRecord.create`) dan alur update existing draft (`dailyAccountabilityRecord.update`). |
| S2-TEST-GAP-2 | Test Coverage Gap | PRD FR-06 | Production code memiliki enforcement `REQUIRED_WHEN_NEWLY_ASSIGNED`, tetapi belum ada test eksplisit yang mengirim `reason = NewlyAssigned` tanpa `assignedByUserId` dan memverifikasi rejection. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:964-972`<br>Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts:899-963` | VERIFIED | CLOSED — VERIFIED VIA S2-T1 PHASE A | Lulus verifikasi independen S2-T1 Phase A: ditambahkan unit tests pada `daily-accountability.service.spec.ts` yang menguji cabang negatif (`REQUIRED_WHEN_NEWLY_ASSIGNED` saat `assignedByUserId` kosong) dan cabang positif (persistensi `assignedByUserId` valid pada `createAdditionalWork`). |
| S2-TEST-GAP-3 | Test Coverage Gap | PRD FR-08 | Production code memproses `additionalWorkOutcomes`, tetapi test suite belum memiliki test eksplisit yang memverifikasi pemrosesan EOD outcome untuk Additional Work. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:461-481, 588-600`<br>Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts:499-644` | VERIFIED | CLOSED — VERIFIED VIA S2-T1 PHASE A | Lulus verifikasi independen S2-T1 Phase A: ditambahkan 3 unit tests pada `daily-accountability.service.spec.ts` yang menguji penolakan `outcome = Cancelled` tanpa `outcomeReason` (`REQUIRED_WHEN_CANCELLED`), penolakan `continuation = Continue` dan outcome non-Completed tanpa `continuationReason` (`REQUIRED_WHEN_CONTINUE_NOT_COMPLETED`), serta verifikasi bahwa `tx.additionalWork.update` menerima outcome dan continuation yang valid. |
| S2-FR-11-1 | Functional Integration Gap | PRD FR-11 | Backend mengembalikan `carryOverDraft`, namun state frontend `draftCopyForwardText` diinisialisasi string kosong dan tidak pernah dipetakan dari API query, sehingga banner draft copy-forward tidak pernah tampil di UI. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:382-412`<br>`frontend/src/pages/MyTodayPage.vue:85-102, 791, 842-846` | VERIFIED | CLOSED — VERIFIED VIA ADR-017 & S2-FR11 REMEDIATION | Lulus verifikasi independen S2: Backend `getTodayRecord` (baris 384-428) menghasilkan `carryOverDraft` berisi `sourceCommitmentId` valid dari komitmen Continue hari sebelumnya tanpa AdditionalWork/TomorrowPriority (ADR-017); Frontend `MyTodayPage.vue` (baris 85-165, 938-1057) merender banner, mendukung Gunakan dan Gunakan & Edit tanpa auto-submit ke network, membatasi max 3, dan membersihkan `sourceCommitmentId` sebelum submission normal; 12/12 unit/integration tests lulus (`carry-over-draft.spec.ts`); 5 backend tests lulus (`daily-accountability.service.spec.ts`); regression pass. |
| S2-FR-12-1 | Functional Requirement Gap | PRD FR-12 | Sistem hanya menyediakan prompt generik hardcoded per slot indeks (#1, #2, #3), tidak membedakan contoh output secara kontekstual sesuai fungsi organisasi pengguna (Developer, QA, PM, Ops, Finance, HRGA). | `frontend/src/pages/MyTodayPage.vue:817-824` | VERIFIED | CLOSED — VERIFIED VIA ADR-016 & S2-B3 REMEDIATION | Lulus verifikasi independen S2-B3: implementasi kamus statis ROLE_BASED_PROMPT_HINTS (7 canonical functions) dan DEFAULT_PROMPT_HINT persis ADR-016 pada daily-records.constants.ts; MyTodayPage.vue mengonsumsi authStore.user.function secara reaktif tanpa parameter idx; getPromptPlaceholder(idx) dihapus; placeholder styling italic text-secondary dengan existing token; non-persistence terbukti; 30/30 targeted tests pass (5 unit + 25 component integration di role-based-prompt.spec.ts); 70/70 full frontend tests pass; 581/581 backend regression pass; typecheck, Vite build, dan lint PASS (0 errors); nol perubahan backend/schema/API/auth store. |
| S2-FR-13-1 | Functional Requirement Gap | PRD FR-13 | Ambang batas Status Suggestion Engine ditulis secara hardcoded di service. Terdapat diskrepansi spesifikasi antara PRD FR-13 ("rule configurable") dengan PRD §3.7 FR-31 dan SAD §6.4 yang tidak menyertakan kategori kebijakan untuk Status Suggestion. | `backend/src/modules/daily-accountability/services/status-suggestion.service.ts:62-120` | VERIFIED | CLOSED — VERIFIED VIA ADR-013 & S2-TEST-GAP-4 RESOLUTION | Lulus verifikasi independen S2: Rekonsiliasi arsitektural menetapkan Status Suggestion Engine sebagai Fixed Product Heuristic tanpa mutasi PolicyCategory (ADR-013); `evaluateSuggestedStatus` pada `StatusSuggestionService` deterministik mengevaluasi blocker aktif dan rasio outcome tanpa mutasi data (non-binding suggestion, prompt konfirmasi saat override); 15/15 unit tests lulus pada `status-suggestion.service.spec.ts`; regression pass. |
| S2-TEST-GAP-4 | Test Coverage Gap | PRD FR-13 | `StatusSuggestionService` belum memiliki unit test terdedikasi (`status-suggestion.service.spec.ts`) untuk menguji logika evaluasi deliverable & blocker aktif secara langsung. | `backend/src/modules/daily-accountability/services/status-suggestion.service.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-TEST-GAP-4 DEDICATED UNIT TESTS | Lulus verifikasi independen S2: Test suite terdedikasi `status-suggestion.service.spec.ts` mengeksekusi langsung `StatusSuggestionService`: 4 tests evaluasi blocker aktif (Critical/High), 4 tests evaluasi deliverable/outcomes, 4 tests combined evaluation & precedence (RED > AMBER), 3 tests edge cases & fallback; seluruh 15/15 unit tests PASS (608ms). |
| S2-TEST-GAP-5 | Test Coverage Gap | PRD FR-19 | Seluruh test suite memalsukan (`mock`) `BlockerOwnerResolverService`. Belum ada test yang benar-benar mengeksekusi logika internal resolver (cabang ProjectAuthority, OrganizationalAuthority, error validasi, dan fallback). | `backend/src/modules/blocker/services/blocker-owner-resolver.service.ts:35-81`<br>Test: `backend/test/integration/blocker-flow.spec.ts`, `backend/src/modules/blocker/blocker.service.spec.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-TEST-GAP-5 DEDICATED RESOLVER UNIT TESTS | Lulus verifikasi independen S2: Test suite terdedikasi `blocker-owner-resolver.service.spec.ts` mengeksekusi langsung instance nyata `BlockerOwnerResolverService` (bukan mock service): 2 tests ProjectAuthority validasi parameter, 1 test mapping ProjectAuthority aktif, 3 tests fallback direct manager reporter, 4 tests OrganizationalAuthority & error handling `NO_DIRECT_MANAGER_FOUND`, 6 tests resolusi eskalasi (NextLevelManager, ReporterManager, HRGA_Management, CurrentOwner_Unchanged); seluruh 16/16 unit tests PASS (616ms). |
| S2-FR-15-1 | Functional Integration & Test Gap | PRD FR-15 | Jalur pembuatan blocker "dari daily record" (menautkan commitment ke blocker via `linkedCommitmentId`) belum diintegrasikan di UI modal frontend (`RaiseBlockerModal.vue`) dan belum memiliki automated test case di test suite. | `backend/src/modules/blocker/dto/create-blocker.dto.ts:16`<br>`backend/src/modules/blocker/services/blocker.service.ts:106`<br>`frontend/src/components/self-service/RaiseBlockerModal.vue` | VERIFIED | CLOSED — VERIFIED VIA S2-FR15 REMEDIATION & INDEPENDENT VERIFICATION (2026-10-04) | Lulus independent verification 2026-10-04 (D1 Opsi A): contextual blocker dari kartu komitmen (Section 1) via tombol "Laporkan Blocker" membawa commitment ID riil ke `RaiseBlockerModal.vue`; header "Raise Instant Blocker" tetap tersedia tanpa linkage; `linkedCommitmentId` ditransmisikan end-to-end tanpa drop; penutupan modal membersihkan context; automated tests: 28/28 blocker service tests (termasuk instant, contextual, persistence simulation), 9/9 frontend tests (`raise-blocker.spec.ts`); backend regression 591/591 pass, frontend regression 91/91 pass; build dan lint pass; nol perubahan schema Prisma/migrasi DB; nol scope creep. *Limitation: Live PostgreSQL persistence belum independently proven karena environment database eksternal tidak accessible pada verification; application/schema-level persistence contract terverifikasi.* |
| S2-SEC-FR15-1 | Security & IDOR Gap | PRD FR-15 / SAD §5.5 | Pembuatan contextual blocker berpotensi disalahgunakan untuk menautkan komitmen milik pengguna lain (IDOR) atau komitmen non-existent karena ketiadaan validasi kepemilikan di server-side. | `backend/src/modules/blocker/services/blocker.service.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-FR15 REMEDIATION & INDEPENDENT VERIFICATION (2026-10-04) | Lulus independent verification 2026-10-04 (D2 Opsi A): validasi kepemilikan server-side di `BlockerService.createBlocker` menegakkan invariant `commitment.dailyRecord.employeeUserId === userId`; percobaan menautkan komitmen user lain ditolak dengan 403 Forbidden; komitmen non-existent ditolak dengan 404 Not Found; penolakan mencegah pemanggilan `blocker.create`; `@IsUUID('all')` pada DTO mencegah invalid UUID; automated tests pass. |
| S2-TEST-GAP-6 | Test Coverage Gap | PRD FR-26 | Di `DailyAccountabilityService`, klasifikasi timing submission tiga-status (`OnTime`, `Late` dalam grace period, dan `NoSubmission` saat penguncian cutoff pada `DailyAccountabilityRecord`) belum memiliki automated test coverage langsung di `daily-accountability.service.spec.ts`. Method `evaluateCutoffLock()` hanya di-mock pada `scheduler.service.spec.ts` dan tidak pernah diuji secara nyata. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:68-86, 1210-1280`<br>Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-TEST-GAP-6 REMEDIATION & INDEPENDENT VERIFICATION (ADR-018) | Lulus verifikasi independen S2: 17 boundary & timing tests pada `daily-accountability.service.spec.ts` membuktikan klasifikasi `OnTime` (`submittedAt <= deadline`), `Late` (`deadline < submittedAt <= cutoff`), dan penolakan deterministik `BusinessRuleViolationException` pasca-cutoff (`submittedAt > cutoff`) untuk Morning, EOD (`submitEodCheckin`), dan konfirmasi override EOD (`confirmOverride`) tanpa mutasi basis data (menutup ambiguitas spesifikasi S2-SPEC-FR26-1 via ADR-018); semantik nullish `?? 30` menjamin `GracePeriod = 0` valid dan dipertahankan (S2-FR26-GRACE0-1), terbukti secara behavioral pada `daily-accountability.service.spec.ts` dan `compliance.service.spec.ts` (4 behavioral tests); `evaluateCutoffLock()` teruji deterministik mengunci komitmen dan menandai `NoSubmission` tanpa menimpa submission valid; full regression backend 618/618 pass, typecheck dan oxlint pass. |
| S2-TEST-GAP-7 | Test Coverage & Functional Gap | PRD FR-28 | Logika seleksi `findRecordsNearingCutoff` pada `DailyAccountabilityService` keliru mencari record yang belum disubmit (record baru ada on-demand saat check-in), serta belum memiliki automated unit test dan mengabaikan karyawan yang belum submit. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:1299-1317`<br>Test: `backend/src/modules/scheduler/services/scheduler.service.spec.ts:28, 204-217` | VERIFIED | CLOSED — VERIFIED VIA S2-T1 (ADR-014) | Lulus verifikasi independen S2-T1: 8 automated unit tests pada `daily-accountability.service.spec.ts` dan 6 boundary tests pada `scheduler.service.spec.ts` (538/538 pass). |
| S2-FR-28-1 | Functional Requirement Gap | PRD FR-28 | Implementasi `SchedulerService.sendCutoffReminders()` dan `DailyAccountabilityService.findRecordsNearingCutoff()` saat ini hanya dirancang untuk Morning Check-in. Logika seleksi karyawan yang belum menyerahkan EOD Check-in serta pengiriman reminder EOD belum diimplementasikan. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:1305-1310`<br>`backend/src/modules/scheduler/services/scheduler.service.ts:218-223` | VERIFIED | CLOSED — VERIFIED VIA S2-T1 (ADR-014) | Lulus verifikasi independen S2-T1: Implementasi simetris Morning dan EOD Check-in pada `scheduler.service.ts` dengan lead-time 60m (ADR-014), 6 EOD boundary tests pada `scheduler.service.spec.ts` (538/538 pass). |
| S2-PERF-FR28-1 | Scalability Limitation & Technical Debt | PRD FR-28 | Pada populasi karyawan aktif yang belum submit melebihi 200 user, pemotongan in-memory slice(0, limit) pada DailyAccountabilityService sebelum deduplikasi notifikasi di SchedulerService menyebabkan starvasi kandidat di atas indeks 200. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:1385`<br>`backend/src/modules/scheduler/services/scheduler.service.ts:318-348` | ACCEPTED RISK / ADR | POST-MVP SCALE-UP REFACTOR (DEFERRED VIA ADR-015 & KL-10) | Diterima sebagai utang teknis MVP melalui keputusan Human Authority (ADR-015, KL-10). Skala operasional terdokumentasi sistem adalah 30–60 user (PDD §3, SAD §2.2), sehingga starvasi tidak mungkin terjadi pada tahap MVP. |
| S2-TEST-GAP-8 | Test Coverage Gap | PRD FR-22 | Cabang validasi dan penugasan `directManagerId` pada `createOrganizationalAssignment` (pencarian direct manager aktif dan penolakan `NotFoundException` jika direct manager tidak ditemukan) belum memiliki test case di `identity.service.spec.ts` (test yang ada mengosongkan field direct manager). | `backend/src/modules/identity/identity.service.ts:355-362`<br>Test: `backend/test/identity/identity.service.spec.ts:169-228` | VERIFIED | CLOSED — VERIFIED VIA S2-TEST-GAP-8 REMEDIATION & INDEPENDENT VERIFICATION | Lulus verifikasi independen S2: Ditambahkan 4 automated unit tests terdedikasi pada `backend/test/identity/identity.service.spec.ts` yang mengeksekusi langsung percabangan `directManagerId`: (1) penugasan direct manager aktif berhasil dan dipersist; (2) penolakan `NotFoundException` saat direct manager tidak ditemukan; (3) penolakan `NotFoundException` saat direct manager berstatus tidak aktif; (4) penugasan tanpa `directManagerId` berhasil dengan nilai `null`; full regression backend 618/618 pass, typecheck dan oxlint pass. |
| E6/E7-1 | Role & Scope Authorization Gap | SAD §10.2 | SAD §10.2 mensyaratkan akses SystemAdmin, HRGA, atau pemilik. Controller dan service getOrganizationalAssignments awalnya tidak memvalidasi caller identity/role, sehingga seluruh user terautentikasi dapat membaca riwayat penugasan user lain. | `backend/src/modules/identity/identity.controller.ts:77-82`<br>`backend/src/modules/identity/identity.service.ts:329-360`<br>Test: `backend/test/identity/identity.service.spec.ts:662-753` | VERIFIED | CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION | Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): server-side contextual authorization ditegakkan via `@CurrentUser()` pada controller dan validasi `SystemAdmin`, `HRGA`, atau `caller.userId === targetUserId` pada service (403 Forbidden untuk non-owner roles; 404 Not Found saat target user tidak ditemukan); seluruh Cases A–I lolos; tidak ada bypass route; 626/626 backend tests pass. |
| E2-1 | Endpoint Documentation Gap | SAD §10.2 | `GET /api/v1/users/:id` diimplementasikan dan aktif di OpenAPI, tetapi tidak tercantum pada tabel ringkasan SAD §10.2. | `backend/src/modules/identity/identity.controller.ts:53-56`<br>`backend/openapi.json:44` | VERIFIED | CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION | Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): endpoint aktif di controller dan OpenAPI; SAD §10.2 telah direkonsiliasi mencatat `GET /api/v1/users/{id}` (Auth: Terautentikasi, Scope: Global). |
| E2-2 | Endpoint Documentation Gap | SAD §10.6 | `GET /api/v1/exceptions/:id` diimplementasikan dan aktif di OpenAPI, tetapi tidak tercantum pada tabel ringkasan SAD §10.6. | `backend/src/modules/exception/controllers/exception.controller.ts:92-98`<br>`backend/openapi.json:645` | VERIFIED | CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION | Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): endpoint aktif di controller dan OpenAPI; SAD §10.6 telah direkonsiliasi mencatat `GET /api/v1/exceptions/{id}` (Auth: Sesuai scope, 404 jika di luar scope). |
| E2-3 | Endpoint Documentation Gap | SAD §10.11 / SAD §13.2 | `GET /api/v1/reports/exception-summary` diimplementasikan untuk ExceptionSummaryWidget (SAD §13.2), tetapi tidak tercantum pada tabel ringkasan SAD §10.11. | `backend/src/modules/reporting/controllers/reporting.controller.ts:44-51`<br>`backend/openapi.json:891` | VERIFIED | CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION | Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): endpoint aktif di controller dan OpenAPI; SAD §10.11 telah diselaraskan dengan SAD §13.2 mencatat `GET /api/v1/reports/exception-summary` (Role: Supervisor, Head, HRGA, CEO/Management). |
| E2-4 / E10-1 | Endpoint Documentation & Duplicate Route | SAD §10.9 | `POST /api/v1/policies/owner-assignments` merupakan nested alias route untuk penugasan Policy Owner yang memanggil service method sama dengan `POST /api/v1/policy-owner-assignments`. | `backend/src/modules/policy/policy.controller.ts:67-75, 82-95`<br>`backend/openapi.json:267, 281` | VERIFIED | CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION | Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): alias route diverifikasi identik secara operasional dengan route kanonikal, dipertahankan demi backward compatibility (tipe frontend schema.d.ts), dan didokumentasikan di SAD §10.9 sebagai rute alias/kompatibilitas. |
| S2-T4-NOTIF-01 | Notification Trigger Gap | SAD §12.1, PRD FR-11 | `DailyAccountabilityService` tidak menginjeksi `NotificationService`. Trigger `AMBER_SUPPORT_NEEDED` (#2) dan `RED_STATUS` (#3) tidak didispatch saat submit Morning/EOD. | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3 | Terverifikasi independen pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`). `DailyAccountabilityService` menginjeksi `NotificationService` dan men-dispatch trigger #2 (`AMBER_SUPPORT_NEEDED`) dan trigger #3 (`RED_STATUS`) sesuai mandat SAD §12.1 & PRD FR-11. 7 skenario pengujian unit lulus (`daily-accountability.service.spec.ts:1922-2115`), full backend regression 639/639 PASS. |
| S2-T4-AUDIT-01 | Audit Action & Runtime Integrity Defect | SAD §15.2, PostgreSQL Schema | `blocker.service.ts` baris 736 memanggil `auditService.record` dengan `actorUserId: 'SYSTEM'`. Kolom `actorUserId` bertipe UUID dan berelasi FK ke `users(id)`. | `backend/src/modules/blocker/services/blocker.service.ts:736` | VERIFIED | CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3 | Terverifikasi independen pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`) terhadap PostgreSQL 18.4 nyata. `actorUserId` bernilai `null` (system-triggered audit sesuai SAD §15.2), baris `audit_logs` dengan action `BLOCKER_AUTO_ESCALATED` berhasil dipersist, foreign key constraint tetap ditegakkan (invalid UUID ditolak dengan kode `23503`), tidak ada duplikasi pada repeated execution (idempotent), dan rollback atomicity terbukti tanpa baris phantom. |
| S2-T4-NOTIF-02 | Notification Trigger Gap | SAD §12.1, PRD FR-52 | `POLICY_ASSIGNMENT_CHANGED` didefinisikan di konstanta namun tidak dipanggil di `PolicyService` maupun `IdentityService`. | `backend/src/modules/policy/policy.service.ts`<br>`backend/src/modules/identity/identity.service.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3 | Terverifikasi independen pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`). Dispatch `SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED` telah diintegrasikan pada mutasi penugasan organisasi (`IdentityService`) dan pembuatan/pembaruan penugasan pemilik kebijakan (`PolicyService`). Targeted unit tests lulus, backend regression 639/639 PASS. |
| S2-T4-NOTIF-03 | Notification Trigger Normalization | SAD §12.1, §12.3 | Domain services memanggil dispatch dengan string literal non-standar alih-alih enum kanonikal `SystemNotificationTrigger`. | `backend/src/modules/notification/notification.service.ts`<br>`backend/src/modules/compliance/services/compliance.service.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3 | Terverifikasi independen pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`). Seluruh call site notification dispatch telah distandardisasi menggunakan enum kanonikal `SystemNotificationTrigger`. Call site ad-hoc `MANAGER_NOTE_CREATED` pada `compliance.service.ts` telah dibersihkan; audit repository-wide membuktikan `MANAGER_NOTE_CREATED` kini murni hanya eksis sebagai `AuditLog.action` resmi (SAD §15.1, §15.3). Full regression backend 639/639 PASS. |
| S2-T4-JOB-01 | Scheduled Job Modular Boundary | SAD §6.3, §6.4, KL-05 | `SchedulerService` memanggil kueri baca langsung ke `prisma.user`, `prisma.exception`, dan `prisma.notification`. | `backend/src/modules/scheduler/services/scheduler.service.ts` | VERIFIED | CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3 | Terverifikasi independen pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`). Kueri baca didelegasikan ke domain service masing-masing, batas modularitas dan isolasi transaksi terjaga, targeted scheduler suite (37 tests) dan database backup service (12 tests) PASS, full backend regression 639/639 PASS. |
| S2-T4-STATE-01 | State Transition Observation | SAD §9.8, PRD FR-43 | `CorrectionRequest` tidak menyediakan jalur koreksi untuk `AdditionalWork` yang sudah terkunci pasca EOD. | `backend/src/modules/correction-request/services/correction-request.service.ts` | PRESERVED / CLOSED | CLOSED — PRESERVED (DESIGN LIMITATION) | Ditutup administratif sebagai *preserved design limitation* sesuai SAD §9.8, PDD §8, dan Open Item §23.2 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`). `Commitment` dan `AdditionalWork` memiliki perlakuan berbeda berdasarkan desain arsitektur: `Commitment` memiliki alur `CorrectionRequest` karena merupakan komitmen inti harian, sedangkan `AdditionalWork` tidak memiliki alur koreksi pasca-penguncian EOD. Perbedaan ini merupakan batasan desain yang disengaja untuk MVP dan bukan implementation defect, sehingga tidak memerlukan remedi kode produksi. |
| S2-T5-DOC-01 | Documentation Gap / Intentional Design | UI/UX Spec §3, §4 | 23 spesifikasi halaman diwujudkan melalui 16 komponen rute kanonikal SPA + sub-permukaan tab (`v-tabs`) + modal kontekstual (`v-dialog`). | `frontend/src/router/index.ts`, `frontend/src/pages/`, `Design-Artifacts/Reports/S2-T5-Independent-Verification.md` | CLOSED — DOCUMENTATION RECONCILIATION | Dokumentasikan rekonsiliasi arsitektur rute SPA pada siklus dokumentasi berikutnya (No code change). | Terverifikasi independen pada S2-T5 Independent Verification (`Design-Artifacts/Reports/S2-T5-Independent-Verification.md`). Seluruh 23 spesifikasi halaman bisnis terbukti ada dan berfungsi penuh melalui 16 komponen rute, tab terdedikasi, dan modal kontekstual. Sesuai mandat UI/UX Spec §4.22, pendekatan tab dan modal merupakan konsolidasi arsitektur SPA yang sah dan disengaja. Ditutup administratif sebagai documentation reconciliation tanpa perubahan kode produksi. |
| S2-T5-UX-01 | Acceptable MVP Limitation | SAD §16.4 | Topbar `/team` desktop memiliki shortcut untuk Supervisor_TL, Head_Dept, CEO_Director, SystemAdmin; PM dapat mengakses rute tetapi tidak memiliki shortcut di bar atas. | `frontend/src/App.vue:31-38`, `frontend/src/router/index.ts:61`, `Design-Artifacts/Reports/S2-T5-Independent-Verification.md` | CLOSED — ACCEPTABLE MVP LIMITATION | Catat sebagai backlog UX enhancement pasca-S2 jika diinginkan penambahan link adaptif (No code change). | Terverifikasi independen pada S2-T5 Independent Verification (`Design-Artifacts/Reports/S2-T5-Independent-Verification.md`). Rute `/team` tetap dapat diakses oleh PM via URL karena `guards.ts` mengizinkannya, dan PM memiliki ruang kerja utama pada `/my-scope/project-risk`. Ketiadaan tombol pintasan di topbar merupakan penyederhanaan visual desktop yang dapat diterima untuk MVP. Ditutup administratif sebagai acceptable MVP limitation tanpa perubahan kode produksi. |
| S2-T5-EVID-01 | Evidence Gap | UI/UX Spec §5 / Design System | Responsive coverage Desktop, Tablet, dan Mobile belum memiliki bukti runtime visual (screenshots/viewport rendering) riil karena pengujian komponen menggunakan `happy-dom`. | `frontend/tests/`, `Design-Artifacts/Reports/S2-T5-Independent-Verification.md` | OPEN — CARRYOVER TO S3 | Eksekusi pengujian visual multi-viewport automated via Playwright browser runner pada siklus pengujian E2E S3. | - (Belum ditutup. Non-blocking evidence gap yang secara eksplisit dibawa sebagai carryover ke Fase S3). |

## Detailed Findings

### S2-FR-04-1
- **Type**: Functional Requirement Gap
- **Requirement**: PRD FR-04 — Blocker dan Support Needed wajib diisi jika Initial Risk = AMBER/RED.
- **Current Gap**: Validasi kondisional pada kode produksi hanya memeriksa field `knownBlockerNote` ketika `initialRisk` bernilai AMBER atau RED. Properti `supportNeeded` masih didefinisikan opsional pada DTO (`supportNeeded?: string`) dan belum divalidasi sebagai field wajib pada kode produksi backend.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 205-242 (validasi morning check-in) dan baris 806-843 (validasi `patchCommitment`).
  - DTO: `backend/src/modules/daily-accountability/dto/morning-checkin.dto.ts` baris 45 (`supportNeeded?: string;`).
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T1 PHASE A
- **Closure Evidence**: Lulus verifikasi independen S2-T1 Phase A. Implementasi validasi kondisional pada `submitMorningCheckin` (baris 227-241) dan `patchCommitment` (baris 823-843) menegakkan bahwa jika `initialRisk` AMBER/RED, `supportNeeded` wajib berupa non-empty, non-whitespace string (`BusinessRuleViolationException`, reason: `REQUIRED_WHEN_CONDITIONAL`). Jika GREEN, `supportNeeded` tetap opsional. DTO tetap `@IsOptional()`. Validasi `knownBlockerNote`/`targetBlockerNote` tetap utuh. 6 automated unit tests di `daily-accountability.service.spec.ts` (54/54 pass targeted, 550/550 full suite pass).

---

### S2-TEST-GAP-1
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-02 — Sistem menyimpan konteks organisasi pengguna (organisasi, divisi, departemen, tim, dan manajer langsung) sebagai snapshot saat rekaman akuntabilitas harian dibuat.
- **Current Gap**: Logika kode produksi pada `DailyAccountabilityService` telah mengambil assignment aktif dan menyusun `orgContextSnapshot` ke entitas database. Namun, unit test suite (`daily-accountability.service.spec.ts`) belum memiliki assertion eksplisit yang memeriksa apakah payload snapshot organisasi tersebut benar-benar terbentuk dan tersimpan sesuai spesifikasi.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 165-169.
  - Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts` baris 303-401.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T1 PHASE A
- **Closure Evidence**: Lulus verifikasi independen S2-T1 Phase A. Assertion eksplisit ditambahkan pada `daily-accountability.service.spec.ts` yang memverifikasi bahwa `orgContextSnapshot` dipersist dengan nilai semantik riil (`role: Role.Employee`, `function: 'Engineering'/'Operations'`, `directManagerId: 'manager-uuid'/'manager-ops-uuid'`), baik pada alur create record baru (`dailyAccountabilityRecord.create`) maupun pada alur update existing draft (`dailyAccountabilityRecord.update`).

---

### S2-TEST-GAP-2
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-06 — Sistem memungkinkan penambahan pekerjaan baru (Additional Work) setelah morning check-in dengan mencatat alasan dan siapa yang menugaskan jika NewlyAssigned.
- **Current Gap**: Kode produksi telah memiliki logika pemeriksaan `REQUIRED_WHEN_NEWLY_ASSIGNED` yang menolak request jika `reason === NewlyAssigned` tanpa `assignedByUserId`. Namun, tidak ditemukan unit test pada test suite yang secara eksplisit mengirimkan payload tanpa `assignedByUserId` untuk memverifikasi cabang rejection tersebut.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 964-972.
  - Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts` baris 899-963.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T1 PHASE A
- **Closure Evidence**: Lulus verifikasi independen S2-T1 Phase A. Ditambahkan pengujian terdedikasi pada `daily-accountability.service.spec.ts`: cabang negatif memverifikasi pelemparan `BusinessRuleViolationException` dengan reason `REQUIRED_WHEN_NEWLY_ASSIGNED` dan field `assignedByUserId` saat `assignedByUserId` kosong; cabang positif memverifikasi persistensi `assignedByUserId` valid pada `tx.additionalWork.create`.

---

### S2-TEST-GAP-3
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-08 — Sistem mewajibkan pencatatan hasil akhir kerja (Outcome) untuk setiap komitmen dan additional work pada EOD check-in (Completed, Partially Completed, Not Completed, atau Cancelled dengan alasan).
- **Current Gap**: Kode produksi pada `DailyAccountabilityService.submitEodCheckin` memproses elemen `additionalWorkOutcomes` dan memvalidasi alasan pembatalan. Namun, test suite saat ini hanya menguji elemen `commitmentOutcomes`, sehingga alur pembaruan dan validasi untuk `additionalWorkOutcomes` belum memiliki automated test coverage langsung.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 461-481, 588-600.
  - Test: `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts` baris 499-644.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T1 PHASE A
- **Closure Evidence**: Lulus verifikasi independen S2-T1 Phase A. Ditambahkan 3 pengujian terdedikasi pada `daily-accountability.service.spec.ts`: penolakan outcome `Cancelled` tanpa `outcomeReason` (`REQUIRED_WHEN_CANCELLED`), penolakan continuation `Continue` dan outcome non-Completed tanpa `continuationReason` (`REQUIRED_WHEN_CONTINUE_NOT_COMPLETED`), serta verifikasi pembaruan database bahwa `tx.additionalWork.update` menerima data `outcome`, `outcomeReason`, `continuation`, dan `continuationReason` yang tepat.

---

### S2-FR-11-1
- **Type**: Functional Integration Gap
- **Requirement**: PRD FR-11 — Sistem menyediakan copy-forward draft dari hari sebelumnya yang wajib dikonfirmasi/diedit user sebelum berlaku sebagai commitment resmi.
- **Current Gap**: Backend `DailyAccountabilityService.getTodayRecord` telah menyusun `carryOverDraft` dari komitmen/additional work hari sebelumnya yang berstatus `continuation = Continue`. Namun di sisi frontend (`MyTodayPage.vue`), reactive ref `draftCopyForwardText` diinisialisasi sebagai string kosong dan tidak pernah dipetakan dari data query API. Akibatnya, `v-if="!isMorningSubmitted && draftCopyForwardText"` tidak pernah aktif, sehingga banner draft copy-forward dan tombol konfirmasi/edit tidak pernah muncul di UI.
- **Evidence**:
  - Backend: `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 382-412.
  - Frontend: `frontend/src/pages/MyTodayPage.vue` baris 85-102, 791, 842-846.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA ADR-017 & S2-FR11 REMEDIATION
- **Closure Evidence**:
  Lulus verifikasi independen S2 sesuai keputusan resmi ADR-017:
  1. **Backend Implementation**: `DailyAccountabilityService.getTodayRecord` (baris 384-428) menyeleksi Morning Commitments hari kerja sebelumnya yang berstatus `continuation === 'Continue'`, mengecualikan Additional Work (ADR-017 D4), mengabaikan `tomorrowPriority` (ADR-017 D1), dan mengembalikan array `carryOverDraft` dengan properti kanonikal `sourceCommitmentId: c.id, sourceType: 'Commitment', text, referenceLink, continuationReason`.
  2. **Backend Unit Tests**: `daily-accountability.service.spec.ts:407-527` (5 unit tests) menguji pembentukan draft, penanganan previous record kosong, multi-drafts, dan isolasi AdditionalWork.
  3. **Frontend Implementation**: `MyTodayPage.vue` (baris 85-165, 938-1057) mengonsumsi `carryOverDraft` dari respons API, memvalidasi keberadaan `sourceCommitmentId` (rejects missing ID tanpa index fallback), menampilkan kartu draft dengan status badge, menyediakan aksi "Gunakan" dan "Gunakan & Edit" yang secara deterministik mengisi form komitmen lokal tanpa pemanggilan network/POST (zero auto-submit), menerapkan guard kapasitas maksimal 3 komitmen, dan membersihkan `sourceCommitmentId` sebelum submit normal.
  4. **Frontend Automated Tests**: `frontend/tests/carry-over-draft.spec.ts` 12/12 unit/integration tests PASS (rendering banner, confirm as-is, edit flow, max 3 limit, no auto-submit, rejection missing sourceId, banner dismissal).
  5. **Regression & Invariants**: Backend regression 618/618 pass, frontend regression 91/91 pass, TypeScript typecheck dan linter pass; nol perubahan skema basis data dan kontrak API.

---

### S2-FR-12-1
- **Type**: Functional Requirement Gap
- **Requirement**: PRD FR-12 — Sistem menampilkan Role-Based Output Template/prompt tambahan sesuai fungsi user saat pengisian check-in.
- **Current Gap**: PRD FR-12 dan PDD (halaman 63) mensyaratkan adanya prompt/contoh output tambahan sesuai fungsi organisasi pengguna (Developer, QA, PM, Ops, Finance, HRGA). Di sisi implementasi frontend (`MyTodayPage.vue:817-824`), fungsi `getPromptPlaceholder(idx)` hanya mengevaluasi nomor urut indeks komitmen (#1, #2, #3) dan mengembalikan contoh peran Developer secara hardcoded. Pengguna fungsi lain (QA, PM, Ops, Finance, HRGA) melihat contoh yang sama tanpa diferensiasi kontekstual.
- **Evidence**:
  - Frontend: `frontend/src/pages/MyTodayPage.vue` baris 817-824.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA ADR-016 & S2-B3 REMEDIATION
- **Closure Evidence**: Lulus verifikasi independen S2-B3 berdasarkan keputusan resmi ADR-016: (1) Penambahan kamus statis ROLE_BASED_PROMPT_HINTS (7 fungsi kanonikal: Engineering, Ops & Infra, Finance, Sales Enablement, Delivery, HRGA, Management) dan DEFAULT_PROMPT_HINT pada frontend/src/constants/daily-records.constants.ts dengan salinan teks baku harfiah sesuai ADR-016; (2) Wiring pada frontend/src/pages/MyTodayPage.vue menggunakan computed getRoleBasedPrompt(authStore.user?.function) menggantikan getPromptPlaceholder(idx), menjamin slot #1, #2, #3 seragam dan role-independent; (3) Styling placeholder memenuhi spesifikasi UI/UX (italic, text-secondary) memanfaatkan token tema eksisting tanpa token baru; (4) Terbukti non-binding dan tidak mengontaminasi input/payload; (5) Seluruh 30/30 targeted automated tests di tests/role-based-prompt.spec.ts (5 unit + 25 component integration tests via @vue/test-utils) lulus 100%; (6) Full frontend suite lulus 70/70; (7) Full backend regression suite lulus 581/581; (8) TypeScript typecheck, production build (tsc && vite build), dan oxlint lulus dengan 0 error; (9) Nol modifikasi backend, schema Prisma, API, PolicyModule, auth store, atau design artifacts.

---

### S2-FR-13-1
- **Type**: Functional Requirement Gap
- **Requirement**: PRD FR-13 — Sistem dapat menyarankan status (GREEN/AMBER/RED) berdasarkan rule configurable, tanpa mengubah pilihan user secara otomatis.
- **Current Gap**: Ambang batas penentuan saran status pada `StatusSuggestionService` ditulis secara *hardcoded* di kode program (evaluasi blocker Critical/High, rasio deliverable tidak selesai). Terdapat ketidaksinkronan spesifikasi: teks PRD FR-13 menyebut "rule configurable", namun PRD §3.7 FR-31 (daftar lengkap kebijakan terkonfigurasi) dan SAD §6.4 / SAD §9.3 tidak mendefinisikan kategori kebijakan untuk Status Suggestion. (Catatan: konstanta `PATTERN_FLAG_THRESHOLD_COUNT` adalah milik domain Compliance dan tidak relevan dengan FR-13).
- **Evidence**:
  - Backend: `backend/src/modules/daily-accountability/services/status-suggestion.service.ts` baris 62-120.
  - Dokumen: PRD §3.7 FR-31, SAD §6.4 `PolicyCategory`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA ADR-013 & S2-TEST-GAP-4 RESOLUTION
- **Resolution & Remediation Note**: Rekonsiliasi arsitektural telah ditetapkan secara resmi melalui **ADR-013** (Status Suggestion Engine diakui sebagai Fixed Product Heuristic, bukan PolicyCategory runtime). Penutupan formal finding ini mensyaratkan automated unit test mandiri pada `StatusSuggestionService` (dilacak via S2-TEST-GAP-4).
- **Closure Evidence**:
  Lulus verifikasi independen S2 berdasarkan keputusan resmi ADR-013:
  1. **Fixed Product Heuristic Reconciliation**: ADR-013 merekonsiliasi semantik "rule configurable" pada FR-13 sebagai aturan baku produk terstruktur dan terisolasi dalam domain service (`StatusSuggestionService`), bukan runtime policy yang dapat diubah di UI `PolicySettingsPage` atau tabel `policies`.
  2. **Non-binding & No Silent Mutation**: `StatusSuggestionService.evaluateSuggestedStatus` mengevaluasi deliverable outcomes dan active blockers secara murni read-only. Pada `daily-accountability.service.ts:574-583`, jika status pilihan user berbeda dari saran sistem, sistem mengembalikan `{ requiresOverrideConfirmation: true }` tanpa memutasi basis data.
  3. **Automated Unit Tests**: 15/15 unit tests pada `status-suggestion.service.spec.ts` PASS menguji seluruh cabang deterministik (GREEN, AMBER, RED, Critical/High blocker, precedence, dan fallback/edge cases).
  4. **Regression**: Backend regression 618/618 pass, TypeScript typecheck dan linter pass.

---

### S2-TEST-GAP-4
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-13 — Sistem dapat menyarankan status (GREEN/AMBER/RED) berdasarkan rule evaluasi deliverable dan blocker.
- **Current Gap**: Service `StatusSuggestionService` belum memiliki file unit test terdedikasi (`status-suggestion.service.spec.ts`). Pengujian pada `daily-accountability.service.spec.ts` hanya menggunakan mock object (`statusSuggestionMock`), sehingga aturan kalkulasi internal (kondisi pemicu RED, AMBER, GREEN) belum diverifikasi langsung oleh automated unit test.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/status-suggestion.service.ts`; ketiadaan file `status-suggestion.service.spec.ts`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-TEST-GAP-4 DEDICATED UNIT TESTS
- **Closure Evidence**:
  Lulus verifikasi independen S2: Test suite terdedikasi `backend/src/modules/daily-accountability/services/status-suggestion.service.spec.ts` telah diimplementasikan dan mengeksekusi langsung `StatusSuggestionService`:
  1. **Evaluasi Blocker Aktif (FR-14 & ADR-013)**: 4 tests menguji pemicu RED (Critical blocker), AMBER (High blocker), isolasi status non-aktif (Resolved/Closed/AcceptedRisk), dan severity Low/Medium yang tidak menaikkan rank (tests 1.1–1.4).
  2. **Evaluasi Outcomes Deliverable**: 4 tests menguji >= 50% NotCompleted/Cancelled -> RED, < 50% NotCompleted/Cancelled -> AMBER, PartiallyCompleted -> AMBER, dan 100% Completed tanpa blocker -> GREEN (tests 2.1–2.4).
  3. **Precedence Logika Gabungan**: 4 tests menguji dominasi RED atas AMBER, Critical Blocker mendominasi komitmen selesai, Critical mendominasi High, dan invariant severityRank 2 (tests 3.1–3.4).
  4. **Edge Cases & Fallback**: 3 tests menguji daftar item kosong, outcome null/undefined, dan default asOfDate (tests 4.1–4.3).
  Hasil eksekusi: 15/15 unit tests PASS (608ms).

---

### S2-TEST-GAP-5
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-19 — Owner Needed pada blocker dapat ditentukan melalui Organizational Authority atau Project Authority.
- **Current Gap**: Seluruh file test di repository (`blocker.service.spec.ts`, `test/integration/blocker-flow.spec.ts`) memalsukan `BlockerOwnerResolverService` menggunakan mock object. Logika eksekusi nyata pada resolver (pencarian mapping ProjectAuthority, pencarian Direct Manager pelapor, validasi exception `REQUIRED_WHEN_PROJECT_AUTHORITY` dan `NO_DIRECT_MANAGER_FOUND`, serta fallback hierarki eskalasi) belum pernah dieksekusi oleh automated test mana pun.
- **Evidence**:
  - `backend/src/modules/blocker/services/blocker-owner-resolver.service.ts` baris 35-81.
  - Test: `backend/src/modules/blocker/blocker.service.spec.ts:70`, `backend/test/integration/blocker-flow.spec.ts:53`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-TEST-GAP-5 DEDICATED RESOLVER UNIT TESTS
- **Closure Evidence**:
  Lulus verifikasi independen S2: Test suite terdedikasi `backend/src/modules/blocker/services/blocker-owner-resolver.service.spec.ts` telah diimplementasikan dan mengeksekusi langsung class nyata `BlockerOwnerResolverService` (bukan mock service):
  1. **Path 1**: ProjectAuthority dengan missing/empty/whitespace `relatedScopeReference` melempar `BusinessRuleViolationException` dengan reason `REQUIRED_WHEN_PROJECT_AUTHORITY` (tests 1.1, 1.2).
  2. **Path 2**: ProjectAuthority dengan mapping aktif meresolusi owner ke `ProjectAuthorityMapping.userId` (test 2.1).
  3. **Path 3**: ProjectAuthority tanpa mapping fallback ke `directManagerId` pelapor dengan mempertahankan tipe `ProjectAuthority` (test 3.1).
  4. **Path 4**: ProjectAuthority fallback gagal karena pelapor tanpa manager melempar `NO_DIRECT_MANAGER_FOUND` (tests 4.1, 4.2).
  5. **Path 5**: OrganizationalAuthority dengan direct manager aktif meresolusi owner ke `directManagerId` pelapor (tests 5.1, 5.2).
  6. **Path 6**: OrganizationalAuthority tanpa direct manager melempar `NO_DIRECT_MANAGER_FOUND` (tests 6.1, 6.2).
  7. **Path 7–10**: Resolusi eskalasi `resolveNextEscalationLevel` teruji penuh meliputi `NextLevelManager`, `ReporterManager`, fallback `HRGA_Management`, dan fallback terminal `CurrentOwner_Unchanged` (tests 7.1–10.2).
  Hasil eksekusi: 16/16 unit tests PASS (616ms).

---

### S2-FR-15-1
- **Type**: Functional Integration & Test Gap
- **Requirement**: PRD FR-15 — User dapat membuat blocker dari daily record atau sebagai instant blocker di luar siklus EOD.
- **Current Gap**: Jalur instant blocker telah terimplementasi penuh (backend, frontend `RaiseBlockerModal.vue`, dan test suite). Namun, jalur pembuatan blocker "dari daily record" (menautkan commitment ke blocker via `linkedCommitmentId`) belum diintegrasikan di UI modal frontend (`RaiseBlockerModal.vue` tidak menyediakan input/prop penautan commitment) dan belum memiliki automated test case dengan `linkedCommitmentId` pada test suite (`backend/test/`).
- **Evidence**:
  - Backend DTO: `backend/src/modules/blocker/dto/create-blocker.dto.ts` baris 16 (`linkedCommitmentId?: string;`).
  - Backend Service: `backend/src/modules/blocker/services/blocker.service.ts` baris 106 (`linkedCommitmentId: dto.linkedCommitmentId ?? null`).
  - Frontend Modal: `frontend/src/components/self-service/RaiseBlockerModal.vue`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-FR15 REMEDIATION & INDEPENDENT VERIFICATION (2026-10-04)
- **Closure Evidence**:
  Lulus independent verification tanggal 2026-10-04 sesuai keputusan resmi Human Authority D1 Opsi A (Proximity Contextual Action) dan D2 Opsi A (Security Remediation in Scope):
  1. **Contextual Action pada Commitment Card**: Kartu komitmen Section 1 pada `MyTodayPage.vue` menyediakan tombol *"Laporkan Blocker"* (`btn-raise-blocker-${item.id}`) yang membawa ID komitmen asli ke `RaiseBlockerModal.vue`.
  2. **Instant Blocker Preserved**: Tombol header *"Raise Instant Blocker"* tetap tersedia dan membuka modal tanpa konteks penautan komitmen.
  3. **End-to-End Transmisi `linkedCommitmentId`**: Nilai `linkedCommitmentId` diteruskan secara utuh melalui `MyTodayPage` -> `RaiseBlockerModal` -> `useCreateBlockerMutation` -> `blockersApi.createBlocker` -> `POST /api/v1/blockers` -> `CreateBlockerDto` -> `BlockerService.createBlocker` -> `tx.blocker.create`. Tidak ada layer yang membuang field ini.
  4. **Pencegahan Stale Context**: Penutupan modal atau pembukaan instant blocker secara deterministik membersihkan `selectedBlockerCommitment` (`selectedBlockerCommitment.value = null`), tanpa dependensi localStorage/sessionStorage/Pinia.
  5. **Automated Tests**:
     - Frontend component DOM interaction test (`frontend/tests/raise-blocker.spec.ts`): 9/9 PASS.
     - Backend blocker service unit & persistence simulation test (`backend/src/modules/blocker/blocker.service.spec.ts`): 28/28 PASS.
  6. **Regression Suite**: Backend full suite lulus 591/591 tests (46 files), frontend full suite lulus 91/91 tests (6 files).
  7. **Build, Typecheck, & Lint**: Backend `nest build` PASS, frontend `tsc && vite build` PASS, backend `oxlint` PASS (0 errors).
  8. **No Schema/Migration Change & No Scope Creep**: Nol perubahan pada `prisma/schema.prisma`, nol migration DB, `BlockerOwnerResolverService` dan blocker lifecycle state machine tidak disentuh.
  9. **Limitation Disclosure**: *Live PostgreSQL persistence belum independently proven karena environment database eksternal tidak accessible pada verification; application/schema-level persistence contract terverifikasi.*
  10. **Test Evidence Typecheck & Assertion Integrity (2026-10-05)**: Issue typecheck pada `blocker.service.spec.ts` telah dibersihkan secara tuntas: enum `BlockerSeverity.Moderate` (tidak valid pada schema) diperbaiki menjadi `BlockerSeverity.Medium`, serta assertion nullable pada `linkedCommitment` dibuat type-safe (`expect(fetched.linkedCommitment).toBeTruthy(); expect(fetched.linkedCommitment!.id)...`). Diverifikasi via `tsc -p tsconfig.json --noEmit` (exit 0) dan 44/44 blocker tests pass.

---

### S2-SEC-FR15-1
- **Type**: Security Vulnerability / IDOR Prevention
- **Requirement**: PRD FR-15 / SAD §5.5 — Keamanan relasi data komitmen dan blocker harian.
- **Current Gap**: Ketiadaan verifikasi kepemilikan komitmen pada `BlockerService.createBlocker` memungkinkan penyerang menautkan komitmen milik pengguna lain ke dalam blocker yang diajukan (IDOR), atau menggunakan ID komitmen acak/non-existent.
- **Evidence**: `backend/src/modules/blocker/services/blocker.service.ts`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-FR15 REMEDIATION & INDEPENDENT VERIFICATION (2026-10-04)
- **Closure Evidence**:
  Lulus independent verification tanggal 2026-10-04:
  1. **Server-Side Ownership Validation**: `BlockerService.createBlocker` secara langsung memvalidasi relasi `commitment.dailyRecord.employeeUserId === userId`.
  2. **IDOR Rejection**: Upaya menautkan komitmen milik pengguna lain menghasilkan `ForbiddenException` (HTTP 403 Forbidden: *"Anda tidak memiliki wewenang untuk menautkan komitmen milik pengguna lain"*). Transaksi `blocker.create` digagalkan sebelum eksekusi.
  3. **Non-Existent Commitment Rejection**: Penggunaan ID komitmen yang tidak ditemukan di database menghasilkan `NotFoundException` (HTTP 404: *"Komitmen dengan ID '...' tidak ditemukan"*).
  4. **DTO Validation**: `@IsUUID('all')` pada `CreateBlockerDto` menjamin input non-UUID ditolak langsung oleh `AppValidationPipe` dengan HTTP 400 Bad Request.
  5. **Negative Test Assertion**: Teruji secara otomatis pada `blocker.service.spec.ts` yang menegaskan pemanggilan `prismaMock.blocker.create` tidak pernah terjadi saat validasi kepemilikan gagal.

---

### S2-TEST-GAP-6
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-26 — Sistem mengklasifikasikan submission sebagai On-Time, Late (dalam grace period), atau No Submission berdasarkan konfigurasi cutoff yang berlaku.
- **Current Gap**: Pada `DailyAccountabilityService`, tiga status timing submission (`SubmissionTiming.OnTime`, `SubmissionTiming.Late` dalam grace period, dan `SubmissionTiming.NoSubmission` saat penguncian cutoff) belum diverifikasi oleh automated assertion di unit test suite (`daily-accountability.service.spec.ts`). Selain itu, method `evaluateCutoffLock()` hanya di-mock pada `scheduler.service.spec.ts` dan tidak pernah dieksekusi secara nyata dalam test suite untuk membuktikan penguncian otomatis dan pemberian label `NoSubmission` pada record harian.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 68-86 (`evaluateTiming`), baris 225-240 (`submitMorningCheckin`), baris 1210-1280 (`evaluateCutoffLock`).
  - Test: ketiadaan assertion timing submission di `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-TEST-GAP-6 REMEDIATION & INDEPENDENT VERIFICATION (ADR-018)
- **Closure Evidence**:
  Lulus independent verification S2 berdasarkan keputusan resmi Human Authority (ADR-018):
  1. **Timing Boundary & Classification Tests**: 13 automated unit tests pada `daily-accountability.service.spec.ts` memverifikasi klasifikasi timing submission Morning dan EOD secara deterministik via fake timers (`OnTime` saat `now <= deadline`, `Late` saat `deadline < now <= cutoff`).
  2. **EOD Post-Cutoff Rejection (ADR-018 / S2-SPEC-FR26-1)**: Penolakan deterministik melalui `BusinessRuleViolationException` (*"Batas waktu penyerahan EOD Check-in (Cut-off) telah berakhir"*) saat submission melampaui cutoff (`now > cutoff`). Ditegakkan simetris pada `submitEodCheckin` dan jalur konfirmasi override `confirmOverride` sebelum transaksi database, menjamin tidak ada mutasi data atau rekaman audit yang tersimpan saat penolakan. Mengeliminasi dependensi validitas submission terhadap timing scheduler (menutup diskrepansi spesifikasi S2-SPEC-FR26-1 via ADR-018).
  3. **Cutoff Lock & NoSubmission Verification**: `evaluateCutoffLock()` dieksekusi secara nyata dengan mock database; terbukti mengunci komitmen (`isMorningLocked: true`, `isEodLocked: true`) dan menetapkan `SubmissionTiming.NoSubmission` saat cutoff terlampaui tanpa menimpa submission `OnTime`/`Late` yang sudah ada sebelumnya.
  4. **Preservasi Nilai GracePeriod = 0 (S2-FR26-GRACE0-1)**: Seluruh penggunaan `GracePeriod` pada kode produksi (`DailyAccountabilityService`, `ComplianceService`, Policy Validator) menggunakan semantik nullish (`?? 30`), mempertahankan nilai `0` sebagai toleransi valid (`cutoff = deadline`). Terbukti secara behavioral pada `daily-accountability.service.spec.ts` (Morning 09:00:00 OnTime, 09:00:01 ditolak; EOD 18:00:01 ditolak) dan `compliance.service.spec.ts` (4 behavioral tests: Morning & EOD tepat di deadline tidak memicu event, 1 detik setelah deadline memicu `NoSubmission`).
  5. **Regression & Quality Suite**: Full backend regression suite lulus 618/618 tests (46 files), production typecheck `tsc -p tsconfig.build.json` PASS (exit 0), test-source typecheck `tsc -p tsconfig.json` PASS (exit 0), oxlint PASS (0 error, 7 pre-existing warnings pada throttler guard & integration specs).

---

### S2-TEST-GAP-7
- **Type**: Test Coverage & Functional Gap
- **Requirement**: PRD FR-28 — Sistem mengirim reminder otomatis mendekati deadline/cutoff.
- **Current Gap**: Logika seleksi record `DailyAccountabilityService.findRecordsNearingCutoff` (memilih record tanpa penyerahan dan mengabaikan record yang sudah submit) belum memiliki automated unit test di `daily-accountability.service.spec.ts`. Selain itu, kueri awal keliru mencari `DailyAccountabilityRecord` yang belum check-in (padahal record dibuat *on-demand* saat check-in), sehingga seluruh karyawan yang belum check-in terabaikan dari pengingat. Pada pengujian scheduler (`scheduler.service.spec.ts`), pemanggilan method ini di-mock 100%.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 1299-1317.
  - Test: `backend/src/modules/scheduler/services/scheduler.service.spec.ts` baris 28, 204-217.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T1 (ADR-014)
- **Remediation Plan**:
  1. Refactor kueri seleksi di `DailyAccountabilityService.findRecordsNearingCutoff` untuk mengambil populasi aktif: `User (status: Active)` + `OrganizationalAssignment (role: Employee)` pada `workDate`, mengeliminasi hari libur/kalender kerja, mengeliminasi approved exception (cuti/izin), dan mengabaikan karyawan yang sudah submit morning. Permohonan izin berstatus `Pending` tidak mengecualikan karyawan (AC-19).
  2. Terapkan filter jendela pengingat aktif: mulai 60 menit sebelum `morningOnTimeDeadline` dan berakhir tepat saat On-Time Deadline (Morning: `08:00 <= now < 09:00` jika deadline 09:00). Grace Period setelah On-Time Deadline bukan bagian dari jendela pengingat.
  3. Implementasikan domain-level idempotency pada scheduler sebelum dispatch: mengecek riwayat pengiriman hari berjalan untuk `triggerType = MORNING_EOD_CUTOFF_REMINDER` dan fase Morning; `relatedEntityId` dibiarkan `null`.
  4. Tambahkan automated unit test menyeluruh di `daily-accountability.service.spec.ts` dan assertion di `scheduler.service.spec.ts`.
- **Lead-Time Resolution (ADR-014)**: Specification gap telah resmi diselesaikan melalui **ADR-014**. Jendela reminder Morning ditetapkan sebesar **60 menit sebelum On-Time Deadline dan berakhir tepat saat On-Time Deadline** (Morning: `08:00 <= now < 09:00` jika deadline 09:00; Grace Period pasca-deadline bukan bagian dari reminder) sebagai *fixed MVP product rule*. Remediasi teknis kueri dan test Morning Check-in kini berstatus **VERIFIED**.
- **Closure Evidence**: Lulus verifikasi independen S2-T1. Ditutup via ADR-014 dengan penambahan 8 unit tests komprehensif di `daily-accountability.service.spec.ts` dan 6 boundary tests di `scheduler.service.spec.ts` (538/538 passing).

---

### S2-FR-28-1
- **Type**: Functional Requirement Gap
- **Requirement**: PRD FR-28 & PRD §6 Notification Matrix — Sistem mengirim reminder otomatis mendekati deadline/cutoff untuk Morning dan EOD Check-in.
- **Current Gap**: Implementasi `SchedulerService.sendCutoffReminders()` dan `DailyAccountabilityService.findRecordsNearingCutoff()` saat ini hanya dirancang untuk pengingat Morning Check-in. Logika seleksi karyawan yang belum menyerahkan EOD Check-in serta pengiriman trigger reminder EOD belum diimplementasikan sama sekali.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 1305-1310 (hanya mengecek `morningSubmittedAt: null`).
  - `backend/src/modules/scheduler/services/scheduler.service.ts` baris 218-223 (hanya mendefinisikan template pesan Morning).
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T1 (ADR-014)
- **Remediation Plan**:
  1. Perluas `DailyAccountabilityService.findRecordsNearingCutoff` untuk mendukung parameter fase (`phase: 'MORNING' | 'EOD'`). Untuk EOD, seleksi mengevaluasi karyawan yang belum submit EOD (`eodSubmittedAt: null`).
  2. Terapkan filter jendela pengingat EOD aktif: mulai 60 menit sebelum `eodOnTimeDeadline` dan berakhir tepat saat On-Time Deadline (EOD: `17:00 <= now < 18:00` jika deadline 18:00). Grace Period setelah On-Time Deadline bukan bagian dari jendela pengingat.
  3. Perbarui `SchedulerService.sendCutoffReminders()` untuk memicu reminder EOD dengan template pesan dan tautan yang sesuai saat berada dalam jendela EOD.
  4. Terapkan domain-level idempotency untuk fase EOD secara deterministik terpisah dari Morning (`triggerType = MORNING_EOD_CUTOFF_REMINDER`, fase EOD).
  5. Tambahkan unit test lengkap untuk seleksi dan dispatch reminder EOD.
- **Lead-Time Resolution (ADR-014)**: Specification gap telah resmi diselesaikan melalui **ADR-014**. Jendela reminder EOD ditetapkan sebesar **60 menit sebelum On-Time Deadline dan berakhir tepat saat On-Time Deadline** (EOD: `17:00 <= now < 18:00` jika deadline 18:00; Grace Period pasca-deadline bukan bagian dari reminder) sebagai *fixed MVP product rule*, berlaku simetris dengan Morning. Remediasi fungsional EOD kini berstatus **VERIFIED**.
- **Closure Evidence**: Lulus verifikasi independen S2-T1. Ditutup via ADR-014 dengan implementasi simetris jendela pengingat EOD 60m di `scheduler.service.ts` dan 6 boundary tests di `scheduler.service.spec.ts` (538/538 passing).

---

### S2-PERF-FR28-1
- **Type**: Scalability Limitation & Technical Debt
- **Requirement**: PRD FR-28 — Sistem mengirim reminder otomatis mendekati deadline/cutoff.
- **Current Gap**: Pemotongan kandidat in-memory `slice(0, limit)` pada `DailyAccountabilityService.findPendingSubmissionEmployeeIds` mendahului pemeriksaan deduplikasi notifikasi di `SchedulerService`. Jika populasi karyawan aktif yang belum submit melebihi limit (200), kandidat setelah indeks 200 mengalami starvasi pada siklus cron berikutnya karena 200 user pertama yang belum submit terus mendominasi potongan array teratas.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 1385 (`return candidateUserIds.slice(0, limit);`).
  - `backend/src/modules/scheduler/services/scheduler.service.ts` baris 318-348 (deduplikasi downstream via `prisma.notification.findFirst`).
- **Current Status**: ACCEPTED RISK / ADR
- **Required Future Action**: POST-MVP SCALE-UP REFACTOR (DEFERRED VIA ADR-015 & KL-10)
- **Closure Evidence**: Diterima sebagai batasan desain / utang teknis MVP melalui keputusan resmi Human Authority (ADR-015, KL-10). Skala operasional WorkPulse terdokumentasi secara konsisten adalah 30–60 user (PDD §3, SAD §2.2, SAD §12.3, ADR-002), di mana seluruh populasi muat dalam batch pertama ($30 < 200$), sehingga starvasi tidak dapat terjadi dalam deployment MVP. Batas 200 ditegaskan bukan batas kapasitas organisasi melainkan defensive batch ceiling. Akseptasi FR-28 untuk skala MVP tetap terpenuhi.

---

### S2-TEST-GAP-8
- **Type**: Test Coverage Gap
- **Requirement**: PRD FR-22 — Authorized Admin/Management dapat create, edit, activate, deactivate, dan reassign person, role, function, direct manager, reviewer, dan project authority.
- **Current Gap**: Kode produksi pada `IdentityService.createOrganizationalAssignment` memuat percabangan validasi direct manager (`if (dto.directManagerId)`) dan pelemparan `NotFoundException` jika manajer tidak ditemukan. Namun, test suite `identity.service.spec.ts` hanya memanggil method dengan payload tanpa `directManagerId`, sehingga cabang penugasan manajer langsung dan validasi penolakan belum memiliki automated test coverage.
- **Evidence**:
  - `backend/src/modules/identity/identity.service.ts` baris 355-362.
  - Test: `backend/test/identity/identity.service.spec.ts` baris 169-228.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-TEST-GAP-8 REMEDIATION & INDEPENDENT VERIFICATION
- **Closure Evidence**:
  Lulus independent verification S2:
  1. **Direct Manager Branch Tests**: Ditambahkan 4 automated unit tests terdedikasi pada `backend/test/identity/identity.service.spec.ts` yang mengeksekusi langsung logika penugasan dan validasi `directManagerId` pada `createOrganizationalAssignment`:
     - Skenario direct manager aktif valid: assignment berhasil dibuat dan `directManagerId` tersimpan sesuai input.
     - Skenario direct manager tidak ditemukan: request ditolak dengan `NotFoundException` (*"Pengguna dengan ID '...' tidak ditemukan"*).
     - Skenario direct manager tidak aktif (`status != UserStatus.Active`): request ditolak dengan `NotFoundException` (*"Direct manager '...' tidak aktif"*).
     - Skenario tanpa direct manager: assignment berhasil dibuat dengan `directManagerId: null`.
  2. **Regression & Quality Suite**: Backend regression suite lulus 618/618 tests (46 files), production & test-source typecheck PASS (exit 0), oxlint PASS (0 errors).

---

### E6/E7-1
- **Type**: Role & Scope Authorization Gap (E6 / E7)
- **Requirement**: SAD §10.2 — Endpoint Catalog: IdentityModule (`GET /api/v1/users/:id/organizational-assignments`).
- **Current Gap**: SAD §10.2 menetapkan role `SystemAdmin, HRGA, pemilik`. Controller tidak memiliki `@RequireRole` dan service layer `getOrganizationalAssignments(userId)` tidak memvalidasi caller identity/role, sehingga seluruh user terautentikasi dapat membaca riwayat penugasan user lain.
- **Evidence**:
  - `backend/src/modules/identity/identity.controller.ts` baris 77-82.
  - `backend/src/modules/identity/identity.service.ts` baris 329-360.
  - Test: `backend/test/identity/identity.service.spec.ts` baris 662-753, `backend/test/identity/identity.controller.spec.ts` baris 134-143.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION
- **Closure Evidence**:
  Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`):
  1. **Server-Side Authorization**: Controller menyuntikkan `@CurrentUser() caller: CurrentUserPayload` dan `IdentityService.getOrganizationalAssignments` menegakkan validasi invariant: `caller.role === Role.SystemAdmin || caller.role === Role.HRGA || caller.userId === userId`. Non-owner/unauthorized role ditolak dengan `ForbiddenException` (HTTP 403 Forbidden). Missing caller context ditolak dengan `ForbiddenException` (HTTP 403).
  2. **Existence Check**: Pengecekan otorisasi mendahului lookup target user; pemanggilan dengan user tidak ditemukan melempar `NotFoundException` (HTTP 404).
  3. **Automated Tests**: 7 automated unit tests di `identity.service.spec.ts` memverifikasi seluruh Cases A–I (SystemAdmin ALLOW, HRGA ALLOW, Owner ALLOW, Non-owner Employee DENY, Non-owner Spv/Head/CEO DENY, Missing Context DENY, Target Not Found 404); controller delegation test di `identity.controller.spec.ts` memverifikasi forwarding caller context.
  4. **Bypass Audit & Regression**: Zero bypass route/service di repository; backend regression lulus 626/626 tests (46 files), frontend regression lulus 91/91 tests (6 files).

---

### E2-1
- **Type**: Endpoint Documentation Gap (E2)
- **Requirement**: SAD §10.2 — Endpoint Catalog: IdentityModule (`GET /api/v1/users/:id`).
- **Current Gap**: `GET /api/v1/users/:id` (`IdentityController.getUserById`) diimplementasikan untuk query profil pengguna via UUID, namun tidak tercantum dalam tabel ringkasan SAD §10.2.
- **Evidence**:
  - `backend/src/modules/identity/identity.controller.ts` baris 53-56.
  - `backend/openapi.json` baris 44 (`IdentityController_getUserById`).
  - Dokumen: `Design-Artifacts/05-SAD.md` baris 1109.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION
- **Closure Evidence**:
  Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): Rute aktual aktif di controller dan OpenAPI; tabel SAD §10.2 telah direkonsiliasi mencatat `GET /api/v1/users/{id}` (Auth: Terautentikasi, Scope: Global).

---

### E2-2
- **Type**: Endpoint Documentation Gap (E2)
- **Requirement**: SAD §10.6 — Endpoint Catalog: ExceptionModule (`GET /api/v1/exceptions/:id`).
- **Current Gap**: `GET /api/v1/exceptions/:id` (`ExceptionController.findById`) diimplementasikan untuk query detail exception, namun tidak tercantum dalam tabel ringkasan SAD §10.6.
- **Evidence**:
  - `backend/src/modules/exception/controllers/exception.controller.ts` baris 92-98.
  - `backend/openapi.json` baris 645 (`ExceptionController_findById`).
  - Dokumen: `Design-Artifacts/05-SAD.md` baris 1163.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION
- **Closure Evidence**:
  Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): Rute aktual aktif di controller dan OpenAPI; tabel SAD §10.6 telah direkonsiliasi mencatat `GET /api/v1/exceptions/{id}` (Auth: Sesuai scope, 404 jika di luar scope).

---

### E2-3
- **Type**: Endpoint Documentation Gap (E2)
- **Requirement**: SAD §10.11 & SAD §13.2 — Endpoint Catalog: ReportingModule (`GET /api/v1/reports/exception-summary`).
- **Current Gap**: `GET /api/v1/reports/exception-summary` (`ReportingController.getExceptionSummary`) diimplementasikan untuk melayani `ExceptionSummaryWidget` (SAD §13.2), namun tidak tercantum dalam tabel ringkasan SAD §10.11.
- **Evidence**:
  - `backend/src/modules/reporting/controllers/reporting.controller.ts` baris 44-51.
  - `backend/openapi.json` baris 891 (`ReportingController_getExceptionSummary`).
  - Dokumen: `Design-Artifacts/05-SAD.md` baris 1214.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION
- **Closure Evidence**:
  Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): Rute aktual aktif di controller dan OpenAPI; tabel SAD §10.11 telah diselaraskan dengan SAD §13.2 mencatat `GET /api/v1/reports/exception-summary` (Role: Supervisor, Head, HRGA, CEO/Management).

---

### E2-4 / E10-1
- **Type**: Endpoint Documentation & Duplicate Route (E2 / E10)
- **Requirement**: SAD §10.9 — Endpoint Catalog: PolicyModule (`POST /api/v1/policies/owner-assignments`).
- **Current Gap**: `POST /api/v1/policies/owner-assignments` merupakan nested alias route untuk penugasan Policy Owner yang memanggil service method sama dengan `POST /api/v1/policy-owner-assignments` (`PolicyOwnerAssignmentController`).
- **Evidence**:
  - `backend/src/modules/policy/policy.controller.ts` baris 67-75, 82-95.
  - `backend/openapi.json` baris 267, 281.
  - `frontend/src/types/schema.d.ts` baris 252, 268.
  - Dokumen: `Design-Artifacts/05-SAD.md` baris 1197.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T3 INDEPENDENT VERIFICATION
- **Closure Evidence**:
  Independently verified in S2-T3 Independent Verification (`Design-Artifacts/Reports/S2-T3-Independent-Verification-Report.md`): Rute alias diverifikasi identik secara operasional dengan rute kanonikal (diproteksi `Role.SystemAdmin`), dipertahankan demi backward compatibility (tipe frontend schema.d.ts), dan didokumentasikan di SAD §10.9 sebagai rute alias/kompatibilitas.

---

### S2-T4-NOTIF-01
- **Type**: Notification Trigger Gap
- **Requirement**: SAD §12.1 (Triggers #2 & #3), PRD FR-11 — Pengiriman notifikasi real-time untuk komitmen berstatus AMBER (Trigger #2) dan RED (Trigger #3).
- **Current Gap**: `DailyAccountabilityService` tidak menginjeksi `NotificationService`. Trigger `AMBER_SUPPORT_NEEDED` dan `RED_STATUS` tidak pernah didispatch saat penyerahan check-in Morning maupun EOD. Akibatnya, pemangku kepentingan kritis (support owner, supervisor, PM) tidak menerima notifikasi saat komitmen membutuhkan bantuan atau menghadapi kendala berat.
- **Evidence**:
  - `backend/src/modules/daily-accountability/services/daily-accountability.service.ts` baris 1530, 1559, 1585.
  - `backend/src/modules/daily-accountability/daily-accountability.service.spec.ts` baris 1922-2115.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3
- **Closure Evidence**:
  Lulus independent verification pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`):
  1. `DailyAccountabilityService` menginjeksi `NotificationService` dan men-dispatch trigger kanonikal #2 (`SystemNotificationTrigger.AMBER_SUPPORT_NEEDED`) saat terdapat komitmen dengan status risiko AMBER yang membutuhkan dukungan, dan trigger #3 (`SystemNotificationTrigger.RED_STATUS`) saat status harian komitmen bernilai RED.
  2. 7 skenario pengujian unit terdedikasi pada `daily-accountability.service.spec.ts` (baris 1922-2115) memverifikasi bahwa pengiriman notifikasi terpanggil dengan payload, recipient, dan trigger type yang presisi.
  3. Full regression backend lulus 639/639 tests (46 files) dan frontend 91/91 tests (6 files).

---

### S2-T4-AUDIT-01
- **Type**: Audit Action & Runtime Integrity Defect
- **Requirement**: SAD §15.2, PostgreSQL UUID Schema Constraint — Universal Audit Recording Pattern untuk system-triggered audit actions.
- **Current Gap**: Pada `BlockerService.evaluateAutoEscalation()` (`backend/src/modules/blocker/services/blocker.service.ts:736`), pemanggilan `auditService.record` mengisi properti `actorUserId: 'SYSTEM'`. Skema PostgreSQL fisik menetapkan kolom `actorUserId` pada tabel `audit_logs` bertipe UUID nullable dengan foreign key constraint `audit_logs_actorUserId_fkey` ke tabel `users(id)`. Penggunaan string non-UUID `'SYSTEM'` menyebabkan fatal runtime error pada PostgreSQL nyata (`22P02: invalid input syntax for type uuid: "SYSTEM"`).
- **Evidence**:
  - `backend/src/modules/blocker/services/blocker.service.ts` baris 736.
  - `backend/prisma/schema.prisma` model `AuditLog`.
  - Migrasi `backend/prisma/migrations/20260916041729_init/migration.sql` tabel `audit_logs`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3
- **Closure Evidence**:
  Lulus independent verification pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`) yang dieksekusi langsung terhadap PostgreSQL 18.4 nyata (`workpulse_verify:54332`):
  1. **System-Triggered Semantics**: `actorUserId` ditetapkan `undefined`/`null` pada `BlockerService.evaluateAutoEscalation()`, sesuai spesifikasi SAD §15.2 baris 1508 (*"actorUserId nullable (null untuk aksi otomatis sistem/scheduler)"*). Tidak dibuat user sintetis 'SYSTEM' dan tidak ada discriminator column tambahan.
  2. **Physical PostgreSQL Persistence**: Baris audit log fisik berhasil di-insert ke tabel `audit_logs` dengan `action = 'BLOCKER_AUTO_ESCALATED'`, `actorUserId = NULL`, `relatedEntityType = 'Blocker'`, dan snapshot eskalasi lengkap pada `valueAfter`.
  3. **Foreign Key Integrity**: Uji terkontrol pada PostgreSQL 18.4 membuktikan bahwa UUID pengguna valid diterima, `NULL` diterima, dan UUID fiktif ditolak secara deterministik oleh PostgreSQL dengan error `23503 foreign key violation`.
  4. **Idempotency & Rollback**: Eksekusi ulang membuktikan tidak ada duplikasi audit row (`escalatedCount = 0`, count = 1), dan pembatalan transaksi membuktikan rollback atomik tanpa baris phantom (0 baris tersisa).
  5. **CorrectionRequest Cross-Verification**: Terverifikasi pula persistensi nyata PostgreSQL untuk `CORRECTION_AUTO_APPLIED` (`actorUserId = NULL`) dan `CORRECTION_REJECTED` (`actorUserId = supervisor.id`).

---

### S2-T4-NOTIF-02
- **Type**: Notification Trigger Gap
- **Requirement**: SAD §12.1 (Trigger #8), PRD FR-52 — Notifikasi perubahan penugasan kebijakan dan penugasan organisasi.
- **Current Gap**: Konstanta `SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED` telah didefinisikan, tetapi tidak dipanggil oleh `PolicyService` saat penugasan Policy Owner diperbarui, maupun oleh `IdentityService` saat penugasan organisasi diperbarui. Pengguna dan pengelola kebijakan tidak menerima notifikasi otomatis.
- **Evidence**:
  - `backend/src/modules/policy/policy.service.ts` baris 199, 303.
  - `backend/src/modules/identity/identity.service.ts` baris 466.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3
- **Closure Evidence**:
  Lulus independent verification pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`):
  1. Integrasi dispatch `SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED` telah aktif pada `IdentityService.createOrganizationalAssignment` dan `PolicyService.assignPolicyOwner`.
  2. Automated unit tests pada `identity.service.spec.ts` dan `policy.service.spec.ts` memverifikasi dispatch notifikasi dengan target recipient dan payload yang tepat.
  3. Full regression backend lulus 639/639 tests (46 files).

---

### S2-T4-NOTIF-03
- **Type**: Notification Trigger Normalization
- **Requirement**: SAD §12.1, §12.3 — Konsistensi dan standarisasi trigger notifikasi sistem pada 13 trigger kanonikal.
- **Current Gap**: Sejumlah call site di domain services menggunakan string literal ad-hoc (misalnya string bebas atau duplikasi audit action) saat memanggil `notificationService.dispatch`. Penggunaan trigger di luar enum kanonikal menyebabkan kegagalan pemetaan prioritas email Brevo dan risiko drop notifikasi saat kuota harian menipis.
- **Evidence**:
  - `backend/src/modules/notification/constants/notification-trigger.constants.ts`.
  - `backend/src/modules/compliance/services/compliance.service.ts`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3
- **Closure Evidence**:
  Lulus independent verification pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`):
  1. Seluruh call site notification dispatch di repository telah dinormalisasi menggunakan enum kanonikal `SystemNotificationTrigger`.
  2. Pemanggilan ad-hoc `'MANAGER_NOTE_CREATED'` pada `compliance.service.ts` telah dibersihkan. Audit repository-wide membuktikan string `MANAGER_NOTE_CREATED` kini murni hanya eksis sebagai `AuditLog.action` resmi (SAD §15.1, §15.3).
  3. Seluruh 13 trigger kanonikal SAD §12.1 terpetakan rapi pada tier prioritas email Brevo tanpa trigger ad-hoc yang lolos.
  4. Full regression backend lulus 639/639 tests.

---

### S2-T4-JOB-01
- **Type**: Scheduled Job Modular Boundary
- **Requirement**: SAD §6.3, §6.4, KL-05 — Batas modularitas dan domain isolation pada cron scheduled jobs.
- **Current Gap**: `SchedulerService` memanggil kueri baca Prisma langsung ke `prisma.user`, `prisma.exception`, dan `prisma.notification`, melanggar batasan arsitektural di mana kueri domain seharusnya dienkapsulasi oleh domain service terkait.
- **Evidence**:
  - `backend/src/modules/scheduler/services/scheduler.service.ts`.
  - `backend/src/modules/scheduler/services/scheduler.service.spec.ts`.
- **Current Status**: VERIFIED
- **Required Future Action**: CLOSED — VERIFIED VIA S2-T4 INDEPENDENT VERIFICATION ROUND 3
- **Closure Evidence**:
  Lulus independent verification pada S2-T4 Independent Verification Round 3 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`):
  1. Kueri baca didelegasikan ke domain service masing-masing melalui helper method terisolasi (`findActiveEmployees`, `findPendingSubmissionEmployeeIds`, dll.).
  2. Targeted scheduler test suite (`scheduler.service.spec.ts`) 25/25 PASS, `database-backup.service.spec.ts` 12/12 PASS (total 37 tests).
  3. Full regression backend lulus 639/639 tests.

---

### S2-T4-STATE-01
- **Type**: State Transition Observation
- **Requirement**: SAD §9.8, PRD FR-43 — Keterbatasan jalur koreksi Additional Work pasca EOD.
- **Current Gap**: `CorrectionRequest` tidak menyediakan jalur koreksi untuk `AdditionalWork` yang sudah terkunci pasca EOD (koreksi saat ini difokuskan pada `Commitment`). Hal ini merupakan batasan desain teridentifikasi pada SAD §9.8, PDD §8, dan Open Item §23.2.
- **Evidence**:
  - `backend/src/modules/correction-request/services/correction-request.service.ts`.
  - SAD §9.8, PDD §8, Open Item §23.2.
- **Current Status**: PRESERVED / CLOSED
- **Required Future Action**: CLOSED — PRESERVED (DESIGN LIMITATION)
- **Closure Evidence**:
  Ditutup secara administratif sebagai **preserved design limitation** sesuai SAD §9.8, PDD §8, dan Open Item §23.2 (`Design-Artifacts/Reports/S2-T4-Independent-Verification-Round-3.md`):
  1. **Diferensiasi Perlakuan Desain**: `Commitment` dan `AdditionalWork` memiliki perlakuan yang sengaja dibedakan dalam arsitektur sistem.
  2. **Komitmen Inti vs Pekerjaan Tambahan**: `Commitment` memiliki alur `CorrectionRequest` (Minor & Material) karena merupakan komitmen kerja inti yang mempengaruhi evaluasi akuntabilitas harian dan penyesuaian baseline. Sebaliknya, `AdditionalWork` dicatat ad-hoc setelah morning check-in dan tidak memiliki alur koreksi formal pasca-penguncian EOD.
  3. **Dokumentasi Batasan Arsitektural**: Perbedaan ini telah didokumentasikan secara eksplisit dalam SAD §9.8, PDD §8, dan Open Item §23.2 sebagai batasan produk yang disengaja untuk tahap MVP.
  4. **Bukan Implementation Defect**: Finding ini diklasifikasikan sebagai severity INFO dan merupakan batasan desain yang sah, bukan cacat implementasi kode.
  5. **Nol Remediasi Kode Produksi**: Tidak diperlukan perbaikan kode produksi, migrasi database, maupun perubahan skema untuk finding ini. Finding ditutup secara definitif dengan status preserved.

---

### S2-T5-DOC-01
- **Type**: Documentation Gap / Intentional Design
- **Requirement**: UI/UX Spec §3, §4 — Konsolidasi 23 spesifikasi halaman pada arsitektur Single-Page Application (SPA).
- **Current Gap**: UI/UX Spec v1.2 mencantumkan beberapa sub-jalur sebagai sub-path rute terpisah (misalnya `/today/morning`, `/today/additional-work`, `/admin/organization`, `/admin/temporary-reviewer`), sementara implementasi produksi Vue mengonsolidasikannya ke dalam tab komponen (`v-tabs`) dan modal kontekstual (`v-dialog`) pada rute kanonikal `/today` dan `/admin/users`.
- **Evidence**:
  - `frontend/src/router/index.ts`, `frontend/src/pages/MyTodayPage.vue`, `frontend/src/pages/AdminUsersPage.vue`, `frontend/src/pages/TeamPulsePage.vue`.
  - UI/UX Spec v1.2 §3, §4.
- **Current Status**: CLOSED — DOCUMENTATION RECONCILIATION
- **Required Future Action**: Dokumentasikan rekonsiliasi arsitektur rute SPA pada siklus dokumentasi berikutnya (No code change).
- **Closure Evidence**:
  Terverifikasi independen pada S2-T5 Independent Verification (`Design-Artifacts/Reports/S2-T5-Independent-Verification.md`) dan S2-T5 Closure Report (`Design-Artifacts/Reports/S2-T5-Closure.md`):
  1. Seluruh 23 spesifikasi halaman bisnis terbukti ada, terhubung ke backend, dan berfungsi penuh tanpa kehilangan field data atau aksi pengguna.
  2. Arsitektur Single-Page Application (SPA) Vue 3 yang mengelompokkan sub-permukaan ke dalam tab komponen (`v-tabs`) dan dialog kontekstual (`v-dialog`) merupakan pola desain yang sah dan disengaja (*intentional design*).
  3. UI/UX Spec §4.22 sendiri secara eksplisit mengesahkan konsep tab reviewer terpadu (`/team/reviews`).
  4. Finding diklasifikasikan sebagai severity INFO dan ditutup secara administratif sebagai documentation reconciliation tanpa perubahan kode produksi.

---

### S2-T5-UX-01
- **Type**: Acceptable MVP Limitation
- **Requirement**: SAD §16.4 — Tautan navigasi topbar desktop.
- **Current Gap**: Pada topbar desktop `App.vue:31-38`, tombol pintasan `/team` menampilkan filter role `['Supervisor_TL', 'Head_Dept', 'CEO_Director', 'SystemAdmin']`. Role `PM` dan `Head` (jika ada) tetap dapat mengakses rute `/team` melalui URL langsung karena `guards.ts:61` mengizinkannya, namun tombol pintasan langsungnya tidak muncul di bar atas desktop.
- **Evidence**:
  - `frontend/src/App.vue:31-38`, `frontend/src/router/index.ts:61`.
  - SAD §16.4.
- **Current Status**: CLOSED — ACCEPTABLE MVP LIMITATION
- **Required Future Action**: Catat sebagai backlog UX enhancement pasca-S2 jika diinginkan penambahan link adaptif (No code change).
- **Closure Evidence**:
  Terverifikasi independen pada S2-T5 Independent Verification (`Design-Artifacts/Reports/S2-T5-Independent-Verification.md`) dan S2-T5 Closure Report (`Design-Artifacts/Reports/S2-T5-Closure.md`):
  1. Pengguna PM memiliki ruang kerja terdedikasi pada `/my-scope/project-risk` (PMRisk) dan akses rute langsung ke `/team` tetap diizinkan oleh `guards.ts`.
  2. Ketiadaan tombol pintasan di topbar merupakan penyederhanaan visual desktop yang dapat diterima untuk MVP (*acceptable MVP limitation*) untuk mencegah kepadatan tautan pada header.
  3. Finding diklasifikasikan sebagai severity LOW dan ditutup secara administratif sebagai acceptable MVP limitation tanpa perubahan kode produksi.

---

### S2-T5-EVID-01
- **Type**: Evidence Gap
- **Requirement**: UI/UX Spec §5 / Design System — Responsive Multi-Viewport Usability.
- **Current Gap**: Verifikasi responsivitas Desktop, Tablet, dan Mobile pada tahap S2-T5 didasarkan pada analisis statis kelas grid Vuetify dan pengujian unit `happy-dom`, namun belum memiliki bukti visual runtime riil (screenshots / rekaman browser viewport).
- **Evidence**:
  - `frontend/tests/`, `Design-Artifacts/Reports/S2-T5-Independent-Verification.md`.
- **Current Status**: OPEN — CARRYOVER TO S3
- **Required Future Action**: Eksekusi pengujian visual multi-viewport automated via Playwright browser runner pada siklus pengujian E2E S3.
- **Closure Evidence**:
  - (Belum ditutup. Non-blocking evidence gap yang secara eksplisit dibawa sebagai carryover ke Fase S3).

## Traceability

- **Origin Checkpoints**:
  - `S2-T1 Phase A — FR-01..FR-10`:
    - `S2-FR-04-1` → PRD FR-04
    - `S2-TEST-GAP-1` → PRD FR-02
    - `S2-TEST-GAP-2` → PRD FR-06
    - `S2-TEST-GAP-3` → PRD FR-08
  - `S2-T1 Phase B — FR-11..FR-20`:
    - `S2-FR-11-1` → PRD FR-11
    - `S2-FR-12-1` → PRD FR-12
    - `S2-FR-13-1` → PRD FR-13
    - `S2-TEST-GAP-4` → PRD FR-13
    - `S2-TEST-GAP-5` → PRD FR-19
    - `S2-FR-15-1` → PRD FR-15
    - `S2-SEC-FR15-1` → PRD FR-15 / SAD §5.5
  - `S2-T1 Phase C — FR-21..FR-30`:
    - `S2-TEST-GAP-6` → PRD FR-26
    - `S2-TEST-GAP-7` → PRD FR-28
    - `S2-FR-28-1` → PRD FR-28
    - `S2-PERF-FR28-1` → PRD FR-28 (ADR-015, KL-10)
    - `S2-TEST-GAP-8` → PRD FR-22
  - `S2-T3 — Endpoint Catalog Reconciliation`:
    - `E6/E7-1` → SAD §10.2
    - `E2-1` → SAD §10.2
    - `E2-2` → SAD §10.6
    - `E2-3` → SAD §10.11 / SAD §13.2
    - `E2-4 / E10-1` → SAD §10.9
  - `S2-T4 — Scheduled Jobs, Notification Triggers, Audit Actions, State Transitions`:
    - `S2-T4-NOTIF-01` → SAD §12.1 (Triggers #2 & #3), PRD FR-11
    - `S2-T4-AUDIT-01` → SAD §15.2, PostgreSQL UUID Schema Constraint
    - `S2-T4-NOTIF-02` → SAD §12.1 (Trigger #8), PRD FR-52
    - `S2-T4-NOTIF-03` → SAD §12.1, §12.3
    - `S2-T4-JOB-01` → SAD §6.3, §6.4, KL-05
    - `S2-T4-STATE-01` → SAD §9.8, PRD FR-43
  - `S2-T5 — UI/Page/Flow Inventory & Coverage Audit`:
    - `S2-T5-DOC-01` → UI/UX Spec §3, §4
    - `S2-T5-UX-01` → SAD §16.4
    - `S2-T5-EVID-01` → UI/UX Spec §5 / Responsive Verification
  - `S2-T6 — Risk & Carry-over Audit`:
    - Rekonsiliasi 30 finding terdaftar, 10 Known Limitations, 18 ADR, dan alokasi carry-over ke Fase S3 (`Design-Artifacts/Reports/S2-T6-Risk-Carryover-Audit-Report.md`, `Design-Artifacts/Reports/S2-T6-Closure.md`).

## Triage Rule

1. **Anti-Assumption Rule**: Sebuah finding tidak boleh dianggap selesai atau ditutup hanya karena kode atau test diubah tanpa verifikasi menyeluruh.
2. **Evidence-Backed Closure**: Penutupan status (*Closure*) wajib menyertakan bukti konkret (*Closure Evidence*) berupa test execution pass atau verifikasi runtime.
3. **Requirement Fidelity**: Functional requirement gap harus diverifikasi langsung terhadap teks requirement asli di dokumen PRD/SAD/PDD, bukan disesuaikan menurut kemudahan kode.
4. **Guard Verification**: Test coverage gap harus diverifikasi bahwa assertion test yang ditambahkan benar-benar menguji dan menjaga batasan perilaku (*invariants / business rules*) yang diamanatkan requirement.
5. **No Silent Deletion**: Finding yang telah masuk ke dalam register tidak boleh dihapus tanpa rekam jejak dan closure evidence yang disetujui.
6. **Remediation Linkage**: Setiap task perbaikan atau pull request di masa mendatang wajib mereferensikan kembali Finding ID yang bersangkutan.
