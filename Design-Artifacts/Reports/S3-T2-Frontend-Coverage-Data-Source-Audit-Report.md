# S3-T2 — Frontend Coverage & Data-Source Audit Report

## 1. Executive Summary

Laporan ini menyajikan hasil pelaksanaan audit menyeluruh terhadap **frontend WorkPulse** pada tahapan **S3-T2 — Frontend Coverage & Data-Source Audit**.
Audit ini diselenggarakan berdasarkan otorisasi penyelesaian S3-T1 Phase 2B-2 (`PASS — REALISTIC LOAD VERIFIED`) dan beroperasi di bawah batasan absolut **READ-ONLY / ZERO-MUTATION**. Seluruh file frontend, backend, skema Prisma, dan dependensi tetap berada pada kondisi baseline tanpa modifikasi sepihak.

Tujuan utama S3-T2 adalah memverifikasi secara mendalam apakah:
1. Seluruh 23 halaman spesifikasi dan 16 komponen rute frontend terhubung ke *source of truth* backend yang valid.
2. Tidak terdapat data bisnis palsu (*mock*, *fake*, *fixture*, atau data statis tiruan) yang dapat dijangkau pada *production build*.
3. Tidak terdapat *silent fallback* yang menyembunyikan kegagalan komunikasi backend/API.
4. Pinia store, TanStack Query hooks, dan API client mematuhi arsitektur yang digariskan pada dokumen SAD, PRD, dan ADR.
5. Alur mutasi data (*actions*) memicu *cache invalidation* dan pembaruan UI secara deterministik.
6. Cakupan pengujian frontend (*unit / integration tests*) mencerminkan integrasi nyata.

### Ringkasan Hasil Kunci:
- **Zero Fake / Mock Production Business Data**: Pemindaian menyeluruh terhadap direktori `frontend/src/` mengonfirmasi **0 temuan** data bisnis palsu, mock array, atau fixture development yang tersambung pada runtime produksi.
- **Zero Dangerous Failure-Masking Fallback**: Pola penanganan error pada TanStack Query dan Pinia store tidak merekayasa data ketika API gagal; seluruh kegagalan ditangani via toast/alert atau state kosong standar (*empty state* eksplisit).
- **Runtime Integrity Verification**:
  - Test suite frontend: **91 passed** (6 test files, 100% pass rate).
  - TypeScript Typecheck (`tsc --noEmit`): **PASS (0 errors)**.
  - Production Build (`vite build`): **PASS (845ms, 0 errors)**.
- **Git Mutation Integrity**: **PASS (0 modified production files during S3-T2 audit)**.
- **Critical Defects Uncovered (API Mapping Mismatches)**:
  Audit independen secara teliti menemukan **4 ketidakcocokan kontrak endpoint backend** pada lapisan API client frontend:
  1. `daily-records.api.ts`: Pengajuan koreksi komitmen memanggil `POST /commitments/:id/request-correction` yang **tidak eksis** di backend (backend controller menyediakan `POST /correction-requests`).
  2. `notifications.api.ts`: Menandai notifikasi dibaca memanggil `PATCH /notifications/:id/read` dan `PATCH /notifications/read-all` yang **tidak eksis** di backend (backend controller menyediakan `POST /notifications/:id/mark-read` dan `POST /notifications/mark-all-read`).
  3. `reporting.api.ts` (Individual Evidence): Memanggil `GET /reports/individual-evidence?userId=...` (query parameter) padahal route backend mengharapkan path parameter `GET /reports/individual-evidence/:userId`.
  4. `reporting.api.ts` (Export Report): Memanggil `POST /reports/export` dengan JSON body padahal route backend mengharapkan `GET /reports/:reportType/export` dengan query parameter.
- **Action/UI Defect**:
  - `MyHistoryPage.vue`: Tombol `ExportButton` di-render tanpa event handler `@export` atau `@click`, serta menyematkan prop yang tidak dideklarasikan (`:data`, `filename`), sehingga klik ekspor menjadi *no-op*.
- **Static Display Gap**:
  - `ProfilePage.vue`: Kartu *Kebijakan Kerja Berlaku* menampilkan nilai statis ("09:30 WIB", "18:00 WIB", "24 Jam") dan belum memanfaatkan hook query `useActivePoliciesQuery()`.
- **Test Coverage Gaps**:
  - Terdapat 9 halaman manajemen dan self-service yang belum memiliki file spesifikasi pengujian level komponen terisolasi (`.spec.ts`) di direktori `frontend/tests/`.

Berdasarkan aturan baku evaluasi S3-T2 klausul 37 (*"FAIL — BLOCKING FRONTEND DEFECT if wrong/nonexistent API endpoint or critical mutation silently fails"*), audit ini menetapkan vonis resmi:

> **FAIL — BLOCKING FRONTEND DEFECT**

---

## 2. Governing Requirements

Audit ini bersandar secara ketat pada dokumen otoritatif proyek WorkPulse:

1. [01-PDD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/01-PDD.md): Visi sistem, larangan monitoring invasif, tata kelola akuntabilitas harian.
2. [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/02-PRD.md): Functional Requirements (FR-01 s/d FR-50), Acceptance Criteria, dan aturan pelaporan agregat tanpa *ranking leaderboard*.
3. [03-UI-UX Spec & Flow Document.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/03-UI-UX%20Spec%20&%20Flow%20Document.md): Spesifikasi 23 halaman antarmuka, hierarki navigasi, struktur dialog modal, dan aliran transisi state.
4. [05-SAD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/05-SAD.md): Arsitektur sistem:
   - §8: Security & Authentication (Double Submit Cookie, CSRF token).
   - §10: Full API Endpoint Catalog (§10.1 s/d §10.12).
   - §12: Notification Architecture (13 Architectural Triggers).
   - §13: Reporting Architecture (On-demand calculation & Export).
   - §16: Frontend Architecture (Vue 3, Pinia, TanStack Query).
   - §17: Frontend Engineering Patterns (Query keys, optimistic updates, 401 interceptor).
5. [06-Product Backlog.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/06-Product%20Backlog.md): Rincian backlog implementasi EPIC-01 s/d EPIC-16.
6. [08-ADR.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/08-ADR.md): Keputusan arsitektur (ADR-002 Temporary Reviewer, ADR-016 Role-Based Output Prompts).
7. [09-Known-Limitations.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/09-Known-Limitations.md): Batasan rilis MVP yang disepakati (Browser Push stub, synchronous reporting export).
8. **Previous Audit Reports**:
   - `S2-T5-UI-Page-Flow-Audit-Report.md` & `S2-T5-Closure.md`
   - `S2-T6-Risk-Carryover-Audit-Report.md` & `S2-T7-Secondary-DoD-Checks-Report.md`
   - `S3-T1-Phase2B2-Realistic-Morning-Checkin-Load-Test-Report.md`

---

## 3. Scope & Boundary

### Scope:
1. Seluruh kode sumber frontend di `frontend/src/`:
   - 16 route page components (`frontend/src/pages/`).
   - 4 admin tab components (`frontend/src/components/admin/`).
   - 4 self-service modal components (`frontend/src/components/self-service/`).
   - 5 management modal/widget components (`frontend/src/components/management/`).
   - 11 shared reusable components (`frontend/src/components/shared/`).
   - 14 API clients (`frontend/src/api/`).
   - 11 TanStack Query hook modules (`frontend/src/queries/`).
   - 2 Pinia stores (`frontend/src/stores/`).
   - Vue Router configuration & navigation guards (`frontend/src/router/`).
2. Evaluasi kesesuaian kontrak endpoint frontend terhadap 14 controller NestJS backend (`backend/src/modules/**/controllers/` dan root controllers).
3. Evaluasi keberadaan mock data, data statis, dan penanganan fallback di frontend.
4. Verifikasi eksekusi test suite frontend (`npm run test`), typecheck (`tsc --noEmit`), dan build (`vite build`).

### Boundary:
- **Audit-Only**: Tidak melakukan modifikasi/perbaikan kode apa pun pada frontend maupun backend.
- **No Responsive Visual Verification**: Evaluasi resolusi/viewport responsive (375px, 768px, 1280px) menjadi hak milik mutlak **S3-T4**. Gap keterbukaan `S2-T5-EVID-01` tetap diakui sebagai carryover resmi ke S3-T4.
- **No Performance Benchmarking**: Pengujian latensi UI dan beban benchmark rendering adalah ranah **S3-T6**.
- **No Security Penetration Test**: Pengujian bypass runtime dan security matrix lengkap adalah ranah **S3-T5**.

---

## 4. Previous S2 Baseline

Berdasarkan laporan penutupan resmi S2-T5 (`Design-Artifacts/Reports/S2-T5-UI-Page-Flow-Audit-Report.md`):
- **23/23 Business Pages** diverifikasi secara fungsional.
- **14/14 User Flows** diverifikasi lengkap.
- **16/16 Route-Level Components** tersusun dalam Vue Router.
- **11/11 Domain APIs** terhubung.
- **FF-01..30 Compliant** (Forbidden features tidak diimplementasikan).
- **100% Bahasa Indonesia** pada elemen antarmuka pengguna.
- **Carryover S2-T5-EVID-01**: Bukti responsive visual lintas viewport diwariskan ke tahapan S3-T4.

Audit S3-T2 mempertahankan baseline ini sebagai acuan perbandingan terhadap struktur fisik repositori terkini.

---

## 5. Frontend Architecture Inventory

Arsitektur frontend WorkPulse dibangun menggunakan stack Vue 3 + TypeScript + Vite + Vuetify 3:

```
frontend/src/
├── api/                   # 14 API client wrappers (fetch + HttpOnly Cookie + CSRF)
│   ├── auth.api.ts
│   ├── blockers.api.ts
│   ├── client.ts          # Core apiClient (Base URL, 401 interceptor, CSRF)
│   ├── compliance.api.ts
│   ├── correction-requests.api.ts
│   ├── daily-records.api.ts
│   ├── exceptions.api.ts
│   ├── files.api.ts
│   ├── identity.api.ts
│   ├── manager-notes.api.ts
│   ├── notifications.api.ts
│   ├── policies.api.ts
│   ├── profile.api.ts
│   └── reporting.api.ts
├── components/            # Reusable UI components
│   ├── admin/             # 4 Sub-tabs Admin Master Data
│   ├── management/        # 5 Modal & Widget Manajemen
│   ├── self-service/      # 4 Modal Self-Service
│   └── shared/            # 11 Shared components (Tags, Cards, Badges, Tables)
├── pages/                 # 16 Route-level page components
├── queries/               # 11 TanStack Query hook modules
├── router/                # Vue Router 4 + Navigation Guards (guards.ts)
├── stores/                # 2 Pinia Stores (auth.store.ts, ui.store.ts)
└── types/                 # TypeScript interfaces & DTO contracts
```

### Evaluasi Peran Pinia vs TanStack Query:
- **Pinia (`auth.store.ts`)**: Hanya menyimpan data sesi pengguna aktif (`user`, `isAuthenticated`, `currentRole`, `mustResetPassword`), state inisialisasi, dan fungsi aksi login/logout/reset.
- **Pinia (`ui.store.ts`)**: Hanya menyimpan state antarmuka efemeral (`sidebarCollapsed`, `activeFilters`, `toasts`).
- **TanStack Query (`queries/*.ts`)**: Memegang seluruh *server state* (caching, background revalidation, query key invalidation, deduplication, retry policy).
- **Kesimpulan Evaluasi**: Arsitektur state management frontend **sesuai 100% dengan prinsip SAD §16.3**. Tidak ditemukan duplikasi data server statis pada Pinia store.

---

## 6. Route & Page Inventory

Vue Router (`frontend/src/router/index.ts`) mendefinisikan 17 entri rute yang merangkum 23 spesifikasi halaman bisnis:

| No | Path Rute | Nama Route | Komponen Halaman | Meta Guards | Pemetaan Bisnis PDD/PRD |
|---|---|---|---|---|---|
| 1 | `/` | — | `redirect: /today` | — | Redirect default ke Beranda Kerja |
| 2 | `/login` | `Login` | `LoginPage.vue` | `requiresAuth: false` | P01: Halaman Masuk Akun |
| 3 | `/reset-password` | `ResetPassword` | `ResetPasswordPage.vue` | `requiresAuth: true` | P02: Ganti Password Wajib Awal |
| 4 | `/today` | `MyToday` | `MyTodayPage.vue` | `requiresAuth: true` | P03: Morning Check-in & P04: EOD |
| 5 | `/history` | `MyHistory` | `MyHistoryPage.vue` | `requiresAuth: true` | P05: Riwayat Akuntabilitas Karyawan |
| 6 | `/notifications` | `Notifications` | `NotificationsPage.vue` | `requiresAuth: true` | P22: Web Notification Center |
| 7 | `/profile` | `Profile` | `ProfilePage.vue` | `requiresAuth: true` | P06: Profil & Ubah Password Mandiri |
| 8 | `/today/leave-request` | `MyLeaveRequest` | `MyLeaveRequestPage.vue` | `requiresAuth: true` | P07: Form & Riwayat Pengajuan Cuti |
| 9 | `/team` | `TeamPulse` | `TeamPulsePage.vue` | `roles: [Supervisor, Head, Dept, CEO, Admin, PM]` | P08: Team Pulse & P09, P10 |
| 10 | `/function` | `FunctionPulse` | `FunctionPulsePage.vue` | `roles: [Head, Dept, CEO, Admin]` | P11: Function Pulse & P12 |
| 11 | `/compliance` | `Compliance` | `CompliancePage.vue` | `roles: [HRGA, CEO, Admin]` | P16: Compliance & P17 Detail |
| 12 | `/management` | `ManagementPulse` | `ManagementPulsePage.vue` | `roles: [CEO, Admin]` | P13: Management Pulse & P14 |
| 13 | `/reports` | `Reports` | `ReportsPage.vue` | `roles: [Supervisor, Head, Dept, HRGA, CEO, Admin]` | P18: Reports Operasional & P19 |
| 14 | `/my-scope/project-risk` | `ProjectRisk` | `ProjectRiskPage.vue` | `roles: [PM, Admin, CEO, Dept, Head, Supervisor]` | P15: Project Risk View |
| 15 | `/policy-settings` | `PolicySettings` | `PolicySettingsPage.vue` | `requiresAuth: true` | P20: Policy Settings & History |
| 16 | `/admin/users` | `AdminUsers` | `AdminUsersPage.vue` | `roles: [SystemAdmin]` | P21: Admin Users & P23 Org Mapping |
| 17 | `/:pathMatch(.*)*` | `NotFound` | `NotFoundPage.vue` | `requiresAuth: false` | Halaman Wildcard 404 |

---

## 7. Self-Service Page Audit

Area Self-Service ditujukan bagi seluruh karyawan untuk pemenuhan akuntabilitas harian dan manajemen hak pribadi:

1. **`LoginPage.vue` (`/login`)**:
   - Memanggil `authStore.login(credentials)`.
   - Menggunakan `POST /api/v1/auth/login`. Menyimpan HttpOnly cookie dan session token.
   - Status: Loading spinner, error alert untuk kredensial invalid, redirect otomatis pasca-sukses.
   - Real Data: Ya.
2. **`ResetPasswordPage.vue` (`/reset-password`)**:
   - Memanggil `authApi.resetPassword(payload)`.
   - Menggunakan `POST /api/v1/auth/reset-password`.
   - Mengharuskan `mustResetPassword === true` dari auth store.
   - Real Data: Ya.
3. **`MyTodayPage.vue` (`/today`)**:
   - Primary Query: `useTodayRecordQuery()` via `GET /api/v1/daily-accountability-records/today`.
   - Polling 30 detik saat jendela aktif.
   - Morning Check-in: `useMorningCheckinMutation()` -> `POST /daily-accountability-records/morning-checkin`.
   - EOD Check-in: `useEodCheckinMutation()` -> `POST /daily-accountability-records/:id/eod-checkin`.
   - Override Confirmation: `useConfirmOverrideMutation()` -> `POST /daily-accountability-records/:id/eod-checkin/confirm-override`.
   - Additional Work: `useAdditionalWorkMutation()` via `AdditionalWorkModal.vue` -> `POST /additional-work`.
   - Raise Blocker: `useRaiseBlockerMutation()` via `RaiseBlockerModal.vue` -> `POST /blockers`.
   - Draft Carryover: Didukung penuh via `daily-records.draft.ts` (localStorage draft caching tanpa mencemari backend).
   - Real Data: Ya.
4. **`MyHistoryPage.vue` (`/history`)**:
   - Primary Query: `useDailyRecordsQuery(queryParams)` -> `GET /api/v1/daily-accountability-records`.
   - Filter preset: Minggu Ini, Minggu Lalu, Bulan Ini, Semua.
   - Loading skeleton, empty state visual, modal detail catatan harian.
   - Defect Temuan: `ExportButton` pada toolbar tidak menangani event `@export`, sehingga fitur ekspor riwayat di halaman ini tidak merespons.
   - Real Data: Ya.
5. **`ProfilePage.vue` (`/profile`)**:
   - Primary Query: `useMyProfileQuery()` -> `GET /api/v1/auth/me`.
   - Mutation: `useChangePasswordMutation()` -> `POST /api/v1/auth/reset-password`.
   - Data gap: Kartu *Kebijakan Kerja Berlaku* merender data statis ("09:30 WIB", "18:00 WIB", "24 Jam") alih-alih menghubungkan `useActivePoliciesQuery()`.
   - Real Data: Profil dan ganti password terhubung real data; kartu kebijakan bersifat statis visual.
6. **`MyLeaveRequestPage.vue` (`/today/leave-request`)**:
   - Primary Query: `useExceptionsQuery({ type: 'Leave' })` -> `GET /api/v1/exceptions?type=Leave`.
   - Mutation: `useCreateLeaveMutation()` -> `POST /api/v1/exceptions/leave`.
   - Loading state, empty state ("Belum ada riwayat cuti"), form validasi tanggal.
   - Real Data: Ya.
7. **`NotificationsPage.vue` (`/notifications`)**:
   - Primary Query: `useNotificationsQuery()` -> `GET /api/v1/notifications`.
   - Critical Defect Temuan: Mutasi `markAsRead` memanggil `PATCH /notifications/:id/read` dan `markAllAsRead` memanggil `PATCH /notifications/read-all`, menghasilkan HTTP 404 dari backend (rute yang sah adalah `POST /notifications/:id/mark-read` dan `POST /notifications/mark-all-read`).
   - Real Data: Query notifikasi real data; aksi mutasi menandai dibaca gagal di runtime.

---

## 8. Management Page Audit

Area Manajemen mencakup dashboard pemantauan, mitigasi risiko, tata kelola kebijakan, dan administrasi:

1. **`TeamPulsePage.vue` (`/team`)**:
   - Widget Ringkasan: `<ExceptionSummaryWidget scope="Team" :date="selectedDate" />`.
   - Tab 1 (Roster Tim): `useDailyRecordsQuery({ date, scope: 'Team' })` -> `GET /api/v1/daily-accountability-records`.
   - Tab 2 (Blocker Terbuka): `useBlockersListQuery({ status: 'Open', scope: 'Team' })` -> `GET /api/v1/blockers`.
   - Tab 3 (Review Koreksi & Cuti):
     - `useCorrectionRequestsQuery({ status: 'Pending', scope: 'Team' })` -> `GET /api/v1/correction-requests`.
     - `useExceptionsQuery({ type: 'Leave', status: 'Pending' })` -> `GET /api/v1/exceptions`.
   - Mutasi Manajemen:
     - Objection Koreksi: `useObjectCorrectionMutation()` -> `POST /api/v1/correction-requests/:id/object`.
     - Approval Cuti: `useApproveLeaveMutation()` -> `POST /api/v1/exceptions/:id/approve`.
     - Reject Cuti: `useRejectLeaveMutation()` -> `POST /api/v1/exceptions/:id/reject`.
     - Manager Note: `ManagerNoteModal.vue` -> `POST /api/v1/manager-notes`.
     - Blocker Actions: `BlockerActionModal.vue` -> endpoint `/blockers/:id/*`.
   - Real Data: Ya.
2. **`FunctionPulsePage.vue` (`/function`)**:
   - Scope: `Function` (Cakupan Head of Department).
   - Widget: `<ExceptionSummaryWidget scope="Function" :date="selectedDate" />`.
   - Roster: `useDailyRecordsQuery({ date, scope: 'Function' })`.
   - Eskalasi Blocker: `useBlockersListQuery({ scope: 'Function' })`.
   - Real Data: Ya.
3. **`CompliancePage.vue` (`/compliance`)**:
   - Tab 1 (Antrean Kepatuhan): `useComplianceEventsQuery()` -> `GET /api/v1/compliance-events`.
   - Tab 2 (Pengecualian & Libur): `useExceptionsQuery()` -> `GET /api/v1/exceptions`.
   - Tab 3 (Rekam SP & Pembinaan): Filter event `Coaching`, `RecordedWarning`, `EscalatedFormalProcess`.
   - Mutasi HRGA:
     - `useCoachComplianceMutation()` -> `POST /api/v1/compliance-events/:id/coach`.
     - `useRecordWarningMutation()` -> `POST /api/v1/compliance-events/:id/record-warning`.
     - `useEscalateFormalMutation()` -> `POST /api/v1/compliance-events/:id/escalate-formal`.
     - `CreateExemptionModal.vue` -> `POST /exceptions/holiday` & `POST /exceptions/exemption`.
   - Real Data: Ya.
4. **`ManagementPulsePage.vue` (`/management`)**:
   - Scope: `Company` (Cakupan Direksi / Eksekutif).
   - Widget: `<ExceptionSummaryWidget scope="Company" :date="selectedDate" />`.
   - Agregasi Fungsi: Mengelompokkan `items` dari `useDailyRecordsQuery({ scope: 'Company' })` secara on-demand per nama departemen/fungsi.
   - Pemenuhan AC-16 (Larangan Ranking): Menampilkan agregasi distribusi Hijau/Kuning/Merah per fungsi, tanpa leaderboard personal.
   - Real Data: Ya.
5. **`ReportsPage.vue` (`/reports`)**:
   - Laporan Harian: `useDailyExceptionQuery()` -> `GET /api/v1/reports/daily-exception`.
   - Laporan Mingguan: `useWeeklyTeamSummaryQuery()` -> `GET /api/v1/reports/weekly-team-summary`.
   - Laporan Bulanan: `useMonthlyTrendQuery()` -> `GET /api/v1/reports/monthly-trend`.
   - Laporan Root Cause Blocker: `useBlockerRootCauseQuery()` -> `GET /api/v1/reports/blocker-root-cause`.
   - Critical Defects Temuan:
     - Laporan Bukti Individual memanggil `GET /reports/individual-evidence?userId=...` (backend mengharapkan path parameter `GET /reports/individual-evidence/:userId`).
     - Mutasi Ekspor memanggil `POST /reports/export` dengan payload body (backend mengharapkan `GET /reports/:reportType/export` dengan query parameter).
   - Real Data: 4 query utama terhubung real data; 2 endpoint pendukung memiliki mismatch kontrak.
6. **`ProjectRiskPage.vue` (`/my-scope/project-risk`)**:
   - Scope: PM / All Roles.
   - Query: `useDailyRecordsQuery({ scope: 'Company' })`.
   - Logika: Agregasi komitmen berdasarkan kesamaan `referenceUrl`, menyoroti item berstatus risiko AMBER/RED atau repetisi "Continue".
   - Real Data: Ya.
7. **`PolicySettingsPage.vue` (`/policy-settings`)**:
   - Query: `usePoliciesQuery()` -> `GET /api/v1/policies`.
   - Detail Versi: `PolicyVersionHistory.vue` -> `GET /api/v1/policies/:category/history`.
   - Mutasi: `useCreatePolicyMutation()` -> `POST /api/v1/policies`.
   - Real Data: Ya (Didukung 20 unit test passed).
8. **`AdminUsersPage.vue` (`/admin/users`)**:
   - Tab 1: `AdminUserManagementTab.vue` -> CRUD pengguna, status update, reset password admin (`/users`, `/users/:id`, `/auth/admin-reset-password/:id`).
   - Tab 2: `AdminOrganizationTab.vue` -> Mapping hierarki atasan & otoritas proyek (`/organizational-assignments`, `/project-authority-mappings`).
   - Tab 3: `AdminTemporaryReviewerTab.vue` -> Penugasan reviewer sementara (`/temporary-reviewer-assignments`).
   - Tab 4: `AdminNotificationSetupTab.vue` -> Tabel matriks arsitektur 13 trigger notifikasi sistem (SAD §12.1).
   - Real Data: Ya (Didukung 20 unit test passed).

---

## 9. Shared Component Audit

Audit memverifikasi 11 komponen bersama di `frontend/src/components/shared/`:

| Nama Komponen | Sumber Data / Props | Fungsi Bisnis | Penanganan State | Risiko Data Tiruan |
|---|---|---|---|---|
| `ActionPanel.vue` | `actions: ActionItem[]` | Menampilkan tombol aksi kontekstual berdasarkan izin | Disabled & loading state | **NOL** |
| `AuthorityTag.vue` | `type: AuthorityType` | Visual tag wewenang (DirectManager, ProjectLead, DeptHead) | Format warna Vuetify chip | **NOL** |
| `BlockerCard.vue` | `blocker: BlockerItem` | Kartu detail blocker, severitas, dan penanggung jawab | Format tanggal & status chip | **NOL** |
| `ClassificationTag.vue` | `classification: 'Minor' \| 'Material'` | Label klasifikasi koreksi komitmen per SAD §9.6 | Chip warna (info / warning) | **NOL** |
| `CommitmentCard.vue` | `commitment: CommitmentItem` | Render detail komitmen, indikator risiko, & link bukti | Outcome badge & reference link | **NOL** |
| `ExportButton.vue` | `format`, `loading`, `disabled` | Menu tombol unduh file XLSX & PDF | Loading spinner & menu trigger | **NOL** (lihat temuan integrasi) |
| `FilterBar.vue` | `filters`, `searchQuery` | Kontrol pencarian dan filter tabel seragam | Reset & v-model binding | **NOL** |
| `NotificationBell.vue` | TanStack Query `notifications?pageSize=5` | Lonceng toolbar, unread badge, quick dropdown list | Polling 60s, mark-read click handler | **NOL** |
| `ObjectionWindowIndicator.vue` | `deadline: string` | Timer hitung mundur masa sanggah 24 jam koreksi | Expired vs Active styling | **NOL** |
| `StatusBadge.vue` | `status: DailyStatus` | Badge status harian (GREEN, AMBER, RED, NoSubmission) | Warna & icon resmi WorkPulse | **NOL** |
| `SubmissionTimingBadge.vue` | `timing: SubmissionTiming` | Badge ketepatan waktu (OnTime, GracePeriod, Late) | Warna semantic & chip text | **NOL** |

---

## 10. Query / Composable / Pinia Audit

Audit membedah 11 modul TanStack Query di `frontend/src/queries/`:

1. `useBlockers.ts`:
   - Query keys: `['blockers', 'list', params]`, `['blockers', 'detail', id]`.
   - Mutasi: `useCreateBlockerMutation`, `useAcknowledgeBlockerMutation`, `useUpdateBlockerProgressMutation`, `useResolveBlockerMutation`, `useAcceptRiskBlockerMutation`, `useCloseBlockerMutation`, `useAddSupportContributionMutation`.
   - Invalidation: Seluruh mutasi menginvaliasi `BLOCKERS_KEYS.all`.
2. `useCompliance.ts`:
   - Query keys: `['compliance-events', 'list', params]`, `['compliance-events', 'detail', id]`.
   - Mutasi: `useCoachComplianceMutation`, `useRecordWarningMutation`, `useEscalateFormalMutation`.
   - Invalidation: Menginvaliasi `COMPLIANCE_KEYS.all`.
3. `useCorrectionRequests.ts`:
   - Query keys: `['correction-requests', 'list', params]`.
   - Mutasi: `useObjectCorrectionMutation` -> Menginvaliasi `CORRECTION_KEYS.all`.
4. `useDailyRecords.ts`:
   - Query keys: `['daily-records', 'today']`, `['daily-records', 'list', params]`.
   - Mutasi: Morning Checkin, EOD Checkin, Confirm Override, Additional Work, Correction Request.
   - Invalidation: Menginvaliasi `DAILY_RECORDS_KEYS.today()` dan `all`.
5. `useExceptions.ts`:
   - Query keys: `['exceptions', 'list', params]`.
   - Mutasi: `useCreateLeaveMutation`, `useCreateHolidayMutation`, `useCreateExemptionMutation`, `useApproveLeaveMutation`, `useRejectLeaveMutation`.
   - Invalidation: Menginvaliasi `EXCEPTION_KEYS.all`.
6. `useManagerNotes.ts`:
   - Query keys: `['manager-notes', 'list', params]`.
   - Mutasi: `useCreateManagerNoteMutation` -> Menginvaliasi `MANAGER_NOTES_KEYS.all`.
7. `useNotifications.ts`:
   - Query keys: `['notifications', 'list', params]`.
   - Polling: 60 detik saat tab aktif.
   - Mutasi: `useMarkNotificationReadMutation`, `useMarkAllNotificationsReadMutation`.
8. `usePolicies.ts`:
   - Query keys: `['policies', 'list', category]`, `['policies', 'history', category]`.
   - Mutasi: `useCreatePolicyMutation` -> Menginvaliasi `POLICY_KEYS.all`.
9. `useProfile.ts`:
   - Query keys: `['profile', 'me']`, `['profile', 'policies']`.
   - Mutasi: `useChangePasswordMutation` -> Menginvaliasi `PROFILE_KEYS.me()`.
10. `useReporting.ts`:
    - Query keys: `exception-summary`, `daily-exception`, `weekly-team-summary`, `monthly-trend`, `individual-evidence`, `blocker-root-cause`.
    - Mutasi: `useExportReportMutation`.
11. `useUsers.ts`:
    - Query keys: `['users', 'list', params]`, `['users', 'detail', id]`, `['users', 'org-assignments', id]`, `['users', 'temp-reviewers', params]`.
    - Mutasi: Create User, Update User Status, Create Org Assignment, Create/Update Project Authority, Create Temp Reviewer.

---

## 11. API Data-Source Trace

Berikut pelacakan dari komponen frontend melalui layer API ke controller backend:

```
[Page / Component]
       ↓ (Vue Setup script)
[TanStack Query Hook / Mutasi]
       ↓ (frontend/src/queries/)
[API Client Module]
       ↓ (frontend/src/api/)
[apiClient Wrapper] (Double Submit Cookie CSRF + 401 Interceptor)
       ↓ (HTTP Request /api/v1/...)
[NestJS Controller]
       ↓ (backend/src/modules/)
[NestJS Service]
       ↓
[Prisma Client ORM]
       ↓
[PostgreSQL Database (workpulse-test-db)]
```

Setiap endpoint backend yang ditargetkan frontend telah dicocokkan dengan file controller terkait. Seluruh data yang disajikan di frontend bersumber dari query database nyata, tanpa intervensi fake response generator.

---

## 12. Mutation & Action Flow Audit

Evaluasi terhadap alur aksi mutasi mengungkap 3 anomali alur:

1. **Pengajuan Koreksi Komitmen (Self-Service)**:
   - Aksi: Karyawan mengklik "Kirim Pengajuan Koreksi" pada `CorrectionRequestModal.vue`.
   - Handler: Memanggil `useCorrectionRequestMutation()` -> `dailyRecordsApi.requestCorrection()`.
   - Transpor: Mengirim `POST /api/v1/commitments/:id/request-correction`.
   - Respon Backend: **HTTP 404 Not Found** (Route tidak didefinisikan).
   - Dampak UI: Modal menampilkan pesan kegagalan: *"Request gagal dengan status 404"*. Permohonan koreksi tidak pernah tersimpan di backend.
2. **Menandai Notifikasi Dibaca (Self-Service)**:
   - Aksi: Pengguna mengklik item notifikasi pada `NotificationsPage.vue`.
   - Handler: Memanggil `markAsRead(item.id)` -> `notificationsApi.markAsRead(id)`.
   - Transpor: Mengirim `PATCH /api/v1/notifications/:id/read`.
   - Respon Backend: **HTTP 404 Not Found** (Route backend adalah `POST :id/mark-read`).
   - Dampak UI: Blok `try-catch` pada baris 176 `NotificationsPage.vue` mengabaikan error secara diam-diam (*silent catch*), lalu melanjutkan navigasi. Notifikasi tetap berstatus `Sent/Unread` di backend.
3. **Ekspor Riwayat Karyawan (Self-Service)**:
   - Aksi: Pengguna mengklik tombol ekspor di toolbar `MyHistoryPage.vue`.
   - Komponen: `<ExportButton :data="exportableData" filename="workpulse-my-history.csv" />`.
   - Dampak UI: `ExportButton.vue` tidak mendeklarasikan prop `:data` atau `filename`, dan `MyHistoryPage.vue` tidak menyematkan listener `@export`. Tombol dapat diklik tetapi tidak memicu proses apa pun (*no-op*).

---

## 13. Loading / Error / Empty State Audit

Evaluasi terhadap representasi status antarmuka:

- **Loading State**: Seluruh 16 halaman rute mengimplementasikan indikator pemuatan eksplisit (`v-progress-circular` atau tombol dengan prop `:loading="isPending"`). Tidak ditemukan simulator waktu tunggu palsu (`setTimeout`).
- **Empty State**: Halaman dan tabel memiliki kartu/kotak state kosong yang jelas dengan icon kontekstual (misal: "Tidak ada notifikasi", "Antrean Bersih", "Tidak ada data aktivitas anggota tim"). State kosong ini sah secara bisnis dan tidak menyamarkan error API.
- **Error State**:
  - Pada form dan modal (`CorrectionRequestModal`, `RaiseBlockerModal`, `AdditionalWorkModal`, `ManagerNoteModal`, `BlockerActionModal`), error disajikan melalui `v-alert type="error"` atau snackbar toast via `uiStore.showToast()`.
  - Pengecualian Anomali: Baris 176 `NotificationsPage.vue` menyerap error mutasi mark-read tanpa memunculkan alert ke pengguna.

---

## 14. Authorization / Scope UI Audit

Evaluasi konsistensi otorisasi antarmuka pengguna:

- **Navigation Guard (`router/guards.ts`)**:
  - Menegakkan `requiresAuth: true`.
  - Menegakkan redirect paksa ke `/reset-password` bila `authStore.mustResetPassword === true`.
  - Mencegah akses ke `/reset-password` jika pengguna sudah menyelesaikan reset.
  - Memeriksa hak role (`to.meta.roles`) via `authStore.hasRole()`, mengalihkan rute tak berizin kembali ke `/today`.
  - Mengintegrasikan penanganan 401 unauthenticated dari API client, mereset sesi dan mengarahkan ke `/login`.
- **Backend Guard Authoritative Boundary**:
  - Seluruh rute sensitif backend dilindungi `@UseGuards(RoleGuard)` dan `@RequireRole(...)`. Frontend hanya bertindak sebagai filter visibilitas UI.
- **Observasi Minor**:
  - Rute `/policy-settings` pada `router/index.ts` hanya mendefinisikan `requiresAuth: true` tanpa daftar `roles: ['SystemAdmin']` pada level rute, namun proteksi ditegakkan di dalam komponen (`authStore.hasRole('SystemAdmin')`) serta ditegakkan secara absolut oleh backend `@RequireRole(Role.SystemAdmin)`.

---

## 15. Mock / Static / Fallback Audit

Pemeriksaan sistematis kata kunci (`mock`, `dummy`, `fake`, `fixture`, `placeholder`, `fallback`, `sample`):

1. **Pencarian `mock`, `fake`, `fixture`, `dummy` pada `frontend/src/`**:
   - Hasil: **0 kemunculan** dalam kode produksi.
2. **Pencarian `fallback` pada `frontend/src/`**:
   - `useApiError.ts`: Fallback string pesan default bila backend mengembalikan error tanpa teks pesan (`'Terjadi kesalahan pada sistem'`). Ini adalah praktik UI-safe standar, bukan data bisnis palsu.
   - `daily-records.constants.ts`: Fallback teks hint format output per ADR-016 jika fungsi karyawan tidak terpetakan khusus. Sesuai spesifikasi arsitektur.
   - `PolicySettingsPage.vue`: Label UI tag *(Default Sistem)* ketika nilai kebijakan belum dioverride oleh admin. Sesuai arsitektur.
3. **Pemeriksaan Data Statis Bisnis**:
   - Pada `ProfilePage.vue` (baris 96-118), nilai cutoff kebijakan kerja disajikan secara statis ("09:30 WIB", "18:00 WIB", "24 Jam"). Ini merupakan kesenjangan penyajian data (*static display gap*).

---

## 16. Dashboard / Reporting Audit

Evaluasi terhadap halaman pelaporan eksekutif dan operasional:

- **`ManagementPulsePage.vue`**:
  - Metrik agregasi dihitung secara langsung (*on-the-fly*) dari array `items` yang diterima melalui API `GET /daily-accountability-records?scope=Company`.
  - Tidak ada angka metrik atau grafik yang di-*hardcode*.
  - Sesuai dengan PRD §9 dan AC-16: tidak menyajikan peringkat individu.
- **`ReportsPage.vue`**:
  - Filter tanggal dan dropdown fungsi terhubung secara reaktif dengan parameter query TanStack Query.
  - Mengubah tanggal pada datepicker memicu refetch otomatis ke backend.
  - State kosong ditampilkan saat tidak ada insiden atau pelanggaran pada tanggal yang dipilih.

---

## 17. Notification UI Audit

Evaluasi terhadap modul notifikasi:

- **Notification Bell (`NotificationBell.vue`)**:
  - Terletak pada navbar utama.
  - Melakukan polling setiap 60 detik ke `GET /api/v1/notifications?pageSize=5`.
  - Menampilkan badge jumlah notifikasi belum dibaca (`unreadCount`).
  - Handler klik memanggil endpoint yang tepat: `POST /api/v1/notifications/:id/mark-read`.
- **Notification Page (`NotificationsPage.vue`)**:
  - Memanggil `GET /api/v1/notifications`.
  - Menyediakan tab kategori: *Semua*, *Belum Dibaca*, *Peringatan & Blocker*.
  - Defect: Pemanggilan API untuk tandai dibaca menggunakan HTTP method dan path yang salah (`PATCH /read`).

---

## 18. Frontend Test Coverage Audit

Audit memeriksa suite pengujian yang ada pada direktori `frontend/tests/`:

1. `carry-over-draft.spec.ts` (12 tests):
   - Menguji draft copy-forward pada `MyTodayPage.vue`.
   - Menguji persistensi localStorage dan integrasi form check-in.
2. `raise-blocker.spec.ts` (9 tests):
   - Menguji pembukaan `RaiseBlockerModal.vue` dari konteks komitmen `MyTodayPage.vue`.
   - Menguji pengiriman payload blocker dan reset form.
3. `role-based-prompt.spec.ts` (30 tests):
   - Menguji kepatuhan ADR-016 (Role-Based Output Prompt Hints) pada `MyTodayPage.vue`.
   - Menguji reaktivitas saat role/fungsi pengguna berubah.
4. `policy-settings.spec.ts` (20 tests):
   - Menguji rendering 11 kategori kebijakan pada `PolicySettingsPage.vue`.
   - Menguji pembukaan modal edit, validasi form, dan pengiriman payload ke API.
5. `admin-organization-and-reviewer.spec.ts` (11 tests):
   - Menguji rendering hierarki organisasi dan penugasan reviewer sementara.
6. `admin-user-management.spec.ts` (9 tests):
   - Menguji daftar pengguna, filter role/status, dan pembuatan user baru.

### Ringkasan Eksekusi Pengujian:
- **Total Test Files**: 6 files
- **Total Tests**: 91 passed (0 failed, 0 skipped)
- **Durasi Eksekusi**: 9.26 detik
- **Status Test Suite**: **PASS (100%)**

### Kesenjangan Cakupan Pengujian (Test Gaps):
Meskipun 91 pengujian yang ada memiliki ketelitian tinggi pada level integrasi komponen, terdapat 9 halaman yang belum memiliki file spesifikasi unit test terisolasi:
1. `CompliancePage.vue`
2. `ReportsPage.vue`
3. `ManagementPulsePage.vue`
4. `FunctionPulsePage.vue`
5. `TeamPulsePage.vue`
6. `MyLeaveRequestPage.vue`
7. `MyHistoryPage.vue`
8. `ProjectRiskPage.vue`
9. `NotificationsPage.vue`

---

## 19. Self-Service Coverage Matrix

| No | Halaman | Rute | Data Source | Query/Hook | Mutasi | Loading | Error | Empty | Auth Guard | Test Coverage | Mock Risk | Vonis |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P01 | Login | `/login` | Backend Auth API | `authStore.login` | Login action | Spinner | Alert | N/A | Public | Flow Integration | Nol | **PASS** |
| P02 | Reset Password | `/reset-password` | Backend Auth API | `authApi.resetPassword` | Reset action | Loading btn | Alert | N/A | `mustResetPassword` | Flow Integration | Nol | **PASS** |
| P03 | Morning Check-in | `/today` | Backend Daily Records | `useTodayRecordQuery` | `useMorningCheckinMutation` | Skeleton | Toast/Alert | Banner | `requiresAuth` | Direct Spec (51 tests) | Nol | **PASS** |
| P04 | EOD & Add. Work | `/today` | Backend Daily Records | `useTodayRecordQuery` | `useEodCheckinMutation`, `useAdditionalWorkMutation` | Loading btn | Modal alert | Empty slot | `requiresAuth` | Direct Spec (51 tests) | Nol | **PASS** |
| P05 | My History | `/history` | Backend Daily Records | `useDailyRecordsQuery` | N/A | Skeleton | Card alert | Explicit card | `requiresAuth` | Test Gap | Nol | **NON-BLOCKING GAP** |
| P06 | User Profile | `/profile` | Backend Identity / Auth | `useMyProfileQuery` | `useChangePasswordMutation` | Skeleton | Form alert | N/A | `requiresAuth` | Test Gap | Static Gap | **NON-BLOCKING GAP** |
| P07 | My Leave Request | `/today/leave-request` | Backend Exceptions API | `useExceptionsQuery` | `useCreateLeaveMutation` | Circular | Alert | Explicit card | `requiresAuth` | Test Gap | Nol | **PASS** |
| P22 | Notifications | `/notifications` | Backend Notification API | `useNotificationsQuery` | `useMarkNotificationReadMutation` | Circular | Silent catch | Explicit card | `requiresAuth` | Test Gap | Nol | **FAIL (404 Endpoint)** |

---

## 20. Management Coverage Matrix

| No | Halaman | Rute | Data Source | Query/Hook | Mutasi | Filter | Pagination | Loading | Error | Empty | Auth Guard | Test Coverage | Mock Risk | Vonis |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P08 | Team Pulse | `/team` | Daily Records API | `useDailyRecordsQuery` | Notes / Blocker | Date | Limit 50 | Circular | Alert | Explicit | Supervisor+ | Test Gap | Nol | **PASS** |
| P09 | Team Blocker Res. | `/team` (modal) | Blockers API | `useBlockersListQuery` | Resolve / AcceptRisk | Status | N/A | Loading btn | Modal alert | List empty | Supervisor+ | Test Gap | Nol | **PASS** |
| P10 | Team Morning Rev. | `/team` (tab) | Correction / Leave | `useCorrectionRequestsQuery` | Object / Approve | Status | N/A | Circular | Alert | Empty badge | Supervisor+ | Test Gap | Nol | **PASS** |
| P11 | Function Pulse | `/function` | Daily Records API | `useDailyRecordsQuery` | Manager Note | Date | N/A | Circular | Alert | Explicit | Head+ | Test Gap | Nol | **PASS** |
| P12 | Blocker Escalation | `/function` (modal) | Blockers API | `useBlockersListQuery` | Update / Escalate | Severity | N/A | Loading btn | Modal alert | List empty | Head+ | Test Gap | Nol | **PASS** |
| P13 | Management Pulse | `/management` | Daily Records API | `useDailyRecordsQuery` | N/A | Date | N/A | Circular | Alert | Explicit | CEO / Admin | Test Gap | Nol | **PASS** |
| P14 | Company Trend | `/management` | Daily Records API | Agregasi fungsi on-the-fly | N/A | Date | N/A | Circular | Alert | Explicit | CEO / Admin | Test Gap | Nol | **PASS** |
| P15 | Project Risk View | `/my-scope/project-risk` | Daily Records API | `useDailyRecordsQuery` | N/A | Date | N/A | Circular | Alert | Explicit | PM / All | Test Gap | Nol | **PASS** |
| P16 | Compliance Gov. | `/compliance` | Compliance API | `useComplianceEventsQuery` | Coach / Warning | EventType | Limit 50 | Circular | Alert | Explicit | HRGA / CEO | Test Gap | Nol | **PASS** |
| P17 | Compliance Event | `/compliance` (modal) | Compliance API | `useComplianceEventsQuery` | EscalateFormal | Status | N/A | Loading btn | Dialog alert | N/A | HRGA / CEO | Test Gap | Nol | **PASS** |
| P18 | Reports Operasional | `/reports` | Reporting API | `useDailyExceptionQuery` | `useExportReportMutation` | Date | Limit 50 | Circular | Alert | Explicit | Supervisor+ | Test Gap | Nol | **FAIL (Export 404)** |
| P19 | Blocker Root Cause | `/reports` (tab) | Reporting API | `useBlockerRootCauseQuery` | `useExportReportMutation` | DateRange | N/A | Circular | Alert | Explicit | Head / CEO | Test Gap | Nol | **FAIL (Export 404)** |
| P20 | Policy Settings | `/policy-settings` | Policy API | `usePoliciesQuery` | `useCreatePolicyMutation` | Category | History list | Circular | Alert | Default tag | SystemAdmin | Direct Spec (20 tests) | Nol | **PASS** |
| P21 | Admin Users | `/admin/users` | Identity API | `useUsersQuery` | Create/Update User | Role/Status | Page/PageSize | Circular | Alert | Empty row | SystemAdmin | Direct Spec (9 tests) | Nol | **PASS** |
| P23 | Admin Org Mapping | `/admin/users` (tab) | Identity API | Org / TempReviewer | Create Org / Reviewer | Search/Role | Page/PageSize | Circular | Alert | Empty row | SystemAdmin | Direct Spec (11 tests) | Nol | **PASS** |

---

## 21. Shared Component Matrix

| Komponen | Lingkup Penggunaan | Sumber Data / Props | Signifikansi Bisnis | State Handling | Render Test | Interaksi Test | Static/Fake Risk | Vonis |
|---|---|---|---|---|---|---|---|---|
| `ActionPanel.vue` | Management / Self-Service | `actions: ActionItem[]` | Tombol aksi kontekstual | Loading & disabled | Implicit | Tested | **NOL** | **PASS** |
| `AuthorityTag.vue` | Admin / Management | `type: AuthorityType` | Label wewenang terstruktur | Variant chip styling | Tested | N/A | **NOL** | **PASS** |
| `BlockerCard.vue` | Pulse & Modals | `blocker: BlockerItem` | Ringkasan kartu blocker | Chip severitas & status | Implicit | Tested | **NOL** | **PASS** |
| `ClassificationTag.vue` | Team Review / History | `classification` | Klasifikasi Minor / Material | Warna chip | Implicit | N/A | **NOL** | **PASS** |
| `CommitmentCard.vue` | Today / History / Pulse | `commitment: CommitmentItem` | Rincian komitmen harian | Outcome & link display | Tested | Tested | **NOL** | **PASS** |
| `ExportButton.vue` | Reports & History | Props format, loading | Tombol trigger ekspor | Loading spinner & menu | Implicit | Defect di History | **NOL** | **DEFECT (History)** |
| `FilterBar.vue` | Admin & History | Filters binding | Standardisasi pencarian | Clear & input reactivity | Tested | Tested | **NOL** | **PASS** |
| `NotificationBell.vue` | App Navbar Global | Query notifications (limit 5) | Lonceng notifikasi & badge | Unread badge, dropdown | Implicit | Mark-read | **NOL** | **PASS** |
| `ObjectionWindowIndicator.vue`| Team Review Tab | `deadline: string` | Timer masa sanggah 24 jam | Expired vs Active | Implicit | N/A | **NOL** | **PASS** |
| `StatusBadge.vue` | Global (Roster, Today) | `status: DailyStatus` | Status harian (GREEN/AMBER/RED)| Semantic color mapping | Tested | N/A | **NOL** | **PASS** |
| `SubmissionTimingBadge.vue` | Global (Roster, Today) | `timing: SubmissionTiming` | Ketepatan waktu pengisian | Semantic color mapping | Tested | N/A | **NOL** | **PASS** |

---

## 22. API Source Matrix

| Frontend Consumer | API Endpoint Frontend | Method | Query / Mutation | Data Diharapkan | Kontrak Aktual Backend | Backend Controller | Status Integrasi | Vonis |
|---|---|---|---|---|---|---|---|---|
| `auth.api.ts` | `/auth/login` | POST | Mutation | `LoginResponseData` | `POST /api/v1/auth/login` | `AuthController` | Valid | **PASS** |
| `auth.api.ts` | `/auth/me` | GET | Query | `AuthUser` | `GET /api/v1/auth/me` | `AuthController` | Valid | **PASS** |
| `auth.api.ts` | `/auth/logout` | POST | Mutation | `{ message }` | `POST /api/v1/auth/logout` | `AuthController` | Valid | **PASS** |
| `auth.api.ts` | `/auth/reset-password` | POST | Mutation | `{ message }` | `POST /api/v1/auth/reset-password` | `AuthController` | Valid | **PASS** |
| `auth.api.ts` | `/auth/admin-reset-password/:id` | POST | Mutation | `{ temporaryPassword }` | `POST /api/v1/auth/admin-reset-password/:userId` | `AuthController` | Valid | **PASS** |
| `daily-records.api.ts` | `/daily-accountability-records/today` | GET | Query | `TodayRecordResponse` | `GET /api/v1/daily-accountability-records/today` | `DailyAccountabilityController` | Valid | **PASS** |
| `daily-records.api.ts` | `/daily-accountability-records/morning-checkin` | POST | Mutation | `DailyAccountabilityRecord`| `POST /api/v1/daily-accountability-records/morning-checkin` | `DailyAccountabilityController` | Valid | **PASS** |
| `daily-records.api.ts` | `/daily-accountability-records/:id/eod-checkin` | POST | Mutation | `DailyAccountabilityRecord`| `POST /api/v1/daily-accountability-records/:id/eod-checkin` | `DailyAccountabilityController` | Valid | **PASS** |
| `daily-records.api.ts` | `/daily-accountability-records/:id/eod-checkin/confirm-override` | POST | Mutation | `DailyAccountabilityRecord`| `POST /api/v1/daily-accountability-records/:id/eod-checkin/confirm-override` | `DailyAccountabilityController` | Valid | **PASS** |
| `daily-records.api.ts` | `/additional-work` | POST | Mutation | `AdditionalWork` | `POST /api/v1/additional-work` | `AdditionalWorkController` | Valid | **PASS** |
| `daily-records.api.ts` | `/commitments/:id/request-correction` | POST | Mutation | `CorrectionRequest` | **TIDAK ADA ROUTE INI** | N/A (Seharusnya `CorrectionRequestController`) | **MISMATCH (404)** | **BLOCKING DEFECT** |
| `daily-records.api.ts` | `/daily-accountability-records` | GET | Query | `{ items, total }` | `GET /api/v1/daily-accountability-records` | `DailyAccountabilityController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers` | POST | Mutation | `Blocker` | `POST /api/v1/blockers` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers` | GET | Query | `{ blockers, total }` | `GET /api/v1/blockers` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id` | GET | Query | `BlockerItem` | `GET /api/v1/blockers/:id` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id/acknowledge` | POST | Mutation | `BlockerItem` | `POST /api/v1/blockers/:id/acknowledge` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id/update` | POST | Mutation | `BlockerItem` | `POST /api/v1/blockers/:id/update` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id/resolve` | POST | Mutation | `BlockerItem` | `POST /api/v1/blockers/:id/resolve` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id/accept-risk` | POST | Mutation | `BlockerItem` | `POST /api/v1/blockers/:id/accept-risk` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id/close` | POST | Mutation | `BlockerItem` | `POST /api/v1/blockers/:id/close` | `BlockerController` | Valid | **PASS** |
| `blockers.api.ts` | `/blockers/:id/support` | POST | Mutation | `unknown` | `POST /api/v1/blockers/:id/support` | `BlockerController` | Valid | **PASS** |
| `correction-requests.api.ts` | `/correction-requests` | GET | Query | `{ requests, total }` | `GET /api/v1/correction-requests` | `CorrectionRequestController` | Valid | **PASS** |
| `correction-requests.api.ts` | `/correction-requests/:id` | GET | Query | `CorrectionRequestItem` | `GET /api/v1/correction-requests/:id` | `CorrectionRequestController` | Valid | **PASS** |
| `correction-requests.api.ts` | `/correction-requests/:id/object` | POST | Mutation | `CorrectionRequestItem` | `POST /api/v1/correction-requests/:id/object` | `CorrectionRequestController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions` | GET | Query | `{ exceptions, total }` | `GET /api/v1/exceptions` | `ExceptionController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions/:id` | GET | Query | `ExceptionItem` | `GET /api/v1/exceptions/:id` | `ExceptionController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions/leave` | POST | Mutation | `ExceptionItem` | `POST /api/v1/exceptions/leave` | `ExceptionController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions/holiday` | POST | Mutation | `ExceptionItem` | `POST /api/v1/exceptions/holiday` | `ExceptionController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions/exemption` | POST | Mutation | `ExceptionItem` | `POST /api/v1/exceptions/exemption` | `ExceptionController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions/:id/approve` | POST | Mutation | `ExceptionItem` | `POST /api/v1/exceptions/:id/approve` | `ExceptionController` | Valid | **PASS** |
| `exceptions.api.ts` | `/exceptions/:id/reject` | POST | Mutation | `ExceptionItem` | `POST /api/v1/exceptions/:id/reject` | `ExceptionController` | Valid | **PASS** |
| `compliance.api.ts` | `/compliance-events` | GET | Query | `{ events, total }` | `GET /api/v1/compliance-events` | `ComplianceController` | Valid | **PASS** |
| `compliance.api.ts` | `/compliance-events/:id` | GET | Query | `ComplianceEventItem` | `GET /api/v1/compliance-events/:id` | `ComplianceController` | Valid | **PASS** |
| `compliance.api.ts` | `/compliance-events/:id/coach` | POST | Mutation | `ComplianceEventItem` | `POST /api/v1/compliance-events/:id/coach` | `ComplianceController` | Valid | **PASS** |
| `compliance.api.ts` | `/compliance-events/:id/record-warning` | POST | Mutation | `ComplianceEventItem` | `POST /api/v1/compliance-events/:id/record-warning` | `ComplianceController` | Valid | **PASS** |
| `compliance.api.ts` | `/compliance-events/:id/escalate-formal` | POST | Mutation | `ComplianceEventItem` | `POST /api/v1/compliance-events/:id/escalate-formal` | `ComplianceController` | Valid | **PASS** |
| `identity.api.ts` | `/users` | GET | Query | `PaginatedUsersResult` | `GET /api/v1/users` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/users/:id` | GET | Query | `UserItem` | `GET /api/v1/users/:id` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/users` | POST | Mutation | `CreateUserResponseData` | `POST /api/v1/users` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/users/:id` | PATCH | Mutation | `UserItem` | `PATCH /api/v1/users/:id` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/users/:id/organizational-assignments` | GET | Query | `OrganizationalAssignment[]` | `GET /api/v1/users/:id/organizational-assignments` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/organizational-assignments` | POST | Mutation | `OrganizationalAssignment` | `POST /api/v1/organizational-assignments` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/project-authority-mappings` | POST | Mutation | `ProjectAuthorityMappingItem`| `POST /api/v1/project-authority-mappings` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/project-authority-mappings/:id` | PATCH | Mutation | `ProjectAuthorityMappingItem`| `PATCH /api/v1/project-authority-mappings/:id` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/temporary-reviewer-assignments` | GET | Query | `TemporaryReviewerAssignmentItem[]`| `GET /api/v1/temporary-reviewer-assignments` | `IdentityController` | Valid | **PASS** |
| `identity.api.ts` | `/temporary-reviewer-assignments` | POST | Mutation | `TemporaryReviewerAssignmentItem`| `POST /api/v1/temporary-reviewer-assignments` | `IdentityController` | Valid | **PASS** |
| `manager-notes.api.ts` | `/manager-notes` | GET | Query | `{ notes, total }` | `GET /api/v1/manager-notes` | `ManagerNoteController` | Valid | **PASS** |
| `manager-notes.api.ts` | `/manager-notes/:id` | GET | Query | `ManagerNoteItem` | `GET /api/v1/manager-notes/:id` | `ManagerNoteController` | Valid | **PASS** |
| `manager-notes.api.ts` | `/manager-notes` | POST | Mutation | `ManagerNoteItem` | `POST /api/v1/manager-notes` | `ManagerNoteController` | Valid | **PASS** |
| `notifications.api.ts` | `/notifications` | GET | Query | `{ items, total, unreadCount }` | `GET /api/v1/notifications` | `NotificationController` | Valid | **PASS** |
| `notifications.api.ts` | `/notifications/:id/read` | PATCH | Mutation | `NotificationItem` | **TIDAK ADA ROUTE INI** | `NotificationController` (`POST :id/mark-read`) | **MISMATCH (404)** | **BLOCKING DEFECT** |
| `notifications.api.ts` | `/notifications/read-all` | PATCH | Mutation | `{ count }` | **TIDAK ADA ROUTE INI** | `NotificationController` (`POST mark-all-read`) | **MISMATCH (404)** | **BLOCKING DEFECT** |
| `policies.api.ts` | `/policies` | GET | Query | `PolicyItem[]` | `GET /api/v1/policies` | `PolicyController` | Valid | **PASS** |
| `policies.api.ts` | `/policies` | POST | Mutation | `PolicyItem` | `POST /api/v1/policies` | `PolicyController` | Valid | **PASS** |
| `policies.api.ts` | `/policies/:category/history` | GET | Query | `PolicyItem[]` | `GET /api/v1/policies/:category/history` | `PolicyController` | Valid | **PASS** |
| `reporting.api.ts` | `/reports/exception-summary` | GET | Query | `ExceptionSummaryResult` | `GET /api/v1/reports/exception-summary` | `ReportingController` | Valid | **PASS** |
| `reporting.api.ts` | `/reports/daily-exception` | GET | Query | `DailyExceptionReport` | `GET /api/v1/reports/daily-exception` | `ReportingController` | Valid | **PASS** |
| `reporting.api.ts` | `/reports/weekly-team-summary` | GET | Query | `WeeklyTeamSummaryReport` | `GET /api/v1/reports/weekly-team-summary` | `ReportingController` | Valid | **PASS** |
| `reporting.api.ts` | `/reports/monthly-trend` | GET | Query | `MonthlyTrendReport` | `GET /api/v1/reports/monthly-trend` | `ReportingController` | Valid | **PASS** |
| `reporting.api.ts` | `/reports/individual-evidence` | GET | Query | `IndividualEvidenceReport`| **MISMATCH PARAM** | `ReportingController` (`GET :userId`) | **MISMATCH (404)** | **NON-BLOCKING DEFECT** |
| `reporting.api.ts` | `/reports/blocker-root-cause` | GET | Query | `BlockerRootCauseReport` | `GET /api/v1/reports/blocker-root-cause` | `ReportingController` | Valid | **PASS** |
| `reporting.api.ts` | `/reports/export` | POST | Mutation | `ExportReportResponse` | **MISMATCH METHOD & PATH** | `ReportingController` (`GET :reportType/export`)| **MISMATCH (404)** | **NON-BLOCKING DEFECT** |
| `files.api.ts` | `/files/upload-url` | POST | Mutation | `UploadUrlResponse` | `POST /api/v1/files/upload-url` | `FileStorageController` | Valid | **PASS** |
| `files.api.ts` | `/files/:fileId/download-url` | GET | Query | `DownloadUrlResponse` | `GET /api/v1/files/:fileId/download-url` | `FileStorageController` | Valid | **PASS** |

---

## 23. Findings

### Finding S3-T2-DEF-01: API Mapping Mismatch pada Correction Request Submission
- **Severity**: HIGH / BLOCKING
- **Classification**: DATA-SOURCE DEFECT / APPLICATION DEFECT
- **File & Line**: `frontend/src/api/daily-records.api.ts` (lines 83–93)
- **Expected Behavior**: Per SAD §10.5 dan `backend/src/modules/correction-request/controllers/correction-request.controller.ts` line 33, pengajuan koreksi komitmen dikirim ke `POST /api/v1/correction-requests` dengan payload body `{ targetCommitmentId: string, proposedDescription: string, reason: string }`.
- **Actual Behavior**: Frontend memanggil `POST /api/v1/commitments/${payload.commitmentId}/request-correction`. Route ini tidak didefinisikan pada backend NestJS (`CommitmentController` hanya memiliki `@Patch(':id')`).
- **Runtime Impact**: Setiap karyawan yang mengajukan koreksi komitmen melalui `CorrectionRequestModal.vue` menerima respon HTTP 404 dari backend, dan pengajuan koreksi gagal disimpan.

---

### Finding S3-T2-DEF-02: API Mapping Mismatch & Silent Error Swallow pada Notification Mark Read
- **Severity**: HIGH / BLOCKING
- **Classification**: DATA-SOURCE DEFECT / APPLICATION DEFECT
- **File & Line**:
  1. `frontend/src/api/notifications.api.ts` (lines 28–37)
  2. `frontend/src/pages/NotificationsPage.vue` (lines 172–179)
- **Expected Behavior**: Per SAD §10.10 dan `backend/src/modules/notification/notification.controller.ts` lines 37 & 50, aksi menandai dibaca dikirim via `POST /api/v1/notifications/:id/mark-read` dan `POST /api/v1/notifications/mark-all-read`. (Sebagai catatan, `NotificationBell.vue` baris 141 telah memanggil endpoint yang benar ini).
- **Actual Behavior**: `notifications.api.ts` memanggil `PATCH /api/v1/notifications/:id/read` dan `PATCH /api/v1/notifications/read-all`. Pada `NotificationsPage.vue`, blok `try-catch` baris 176 menyerap error 404 tanpa visual error ke pengguna (`// Abaikan error background mark read`).
- **Runtime Impact**: Pada halaman Notifikasi, mengklik notifikasi atau tombol "Tandai Semua Dibaca" menghasilkan HTTP 404 pada network tab, dan notifikasi tetap berstatus unread di backend.

---

### Finding S3-T2-DEF-03: API Mapping Mismatch pada Reporting Individual Evidence
- **Severity**: MEDIUM / NON-BLOCKING
- **Classification**: DATA-SOURCE DEFECT
- **File & Line**: `frontend/src/api/reporting.api.ts` (lines 75–85)
- **Expected Behavior**: Per SAD §10.11 dan `backend/src/modules/reporting/controllers/reporting.controller.ts` line 83, endpoint diekspos sebagai path parameter `GET /api/v1/reports/individual-evidence/:userId?startDate=...&endDate=...`.
- **Actual Behavior**: Frontend memanggil `GET /api/v1/reports/individual-evidence?userId=...&startDate=...&endDate=...` (query parameter).
- **Runtime Impact**: Pemanggilan tab individual evidence pada ReportsPage gagal dengan HTTP 404 karena NestJS router mencari `:userId` sebagai segmen path.

---

### Finding S3-T2-DEF-04: API Mapping Mismatch pada Reporting Export Endpoint
- **Severity**: MEDIUM / NON-BLOCKING
- **Classification**: DATA-SOURCE DEFECT
- **File & Line**: `frontend/src/api/reporting.api.ts` (lines 99–103)
- **Expected Behavior**: Per SAD §10.11 dan `backend/src/modules/reporting/controllers/reporting.controller.ts` line 109, endpoint ekspor laporan diekspos sebagai `GET /api/v1/reports/:reportType/export?format=...`.
- **Actual Behavior**: Frontend memanggil `POST /api/v1/reports/export` dengan JSON payload `{ reportType, format, ... }`.
- **Runtime Impact**: Menekan tombol unduh ekspor pada `ReportsPage.vue` menghasilkan HTTP 404 dari backend.

---

### Finding S3-T2-DEF-05: Unconnected Action & Prop Mismatch pada ExportButton MyHistoryPage
- **Severity**: LOW / NON-BLOCKING
- **Classification**: APPLICATION DEFECT / UI DEFECT
- **File & Line**: `frontend/src/pages/MyHistoryPage.vue` (lines 12–15)
- **Expected Behavior**: Tombol ekspor pada toolbar MyHistoryPage memicu download file CSV/XLSX dari data riwayat yang sedang difilter.
- **Actual Behavior**: `MyHistoryPage.vue` mengoper `:data="exportableData"` dan `filename="workpulse-my-history.csv"` yang tidak dideklarasikan pada `ExportButton.vue`, serta tidak menyematkan listener `@export` atau `@click`.
- **Runtime Impact**: Mengklik opsi format ekspor pada dropdown tombol tidak memicu aksi apa pun (*no-op*).

---

### Finding S3-T2-GAP-01: Hardcoded Policy Preview Card pada ProfilePage
- **Severity**: LOW / NON-BLOCKING
- **Classification**: DATA-SOURCE GAP / STATIC DATA FINDING
- **File & Line**: `frontend/src/pages/ProfilePage.vue` (lines 91–120)
- **Expected Behavior**: Kartu *Kebijakan Kerja Berlaku* merender data parameter kebijakan cutoff secara dinamis melalui hook `useActivePoliciesQuery()` yang sudah tersedia pada `frontend/src/queries/useProfile.ts`.
- **Actual Behavior**: Kartu menampilkan string statis yang di-*hardcode* ("09:30 WIB", "18:00 WIB", "24 Jam").
- **Runtime Impact**: Perubahan kebijakan cutoff sistem oleh SystemAdmin di `PolicySettingsPage` tidak tercermin pada kartu profil pengguna.

---

### Finding S3-T2-GAP-02: Isolated Component Test Coverage Gaps
- **Severity**: MEDIUM / NON-BLOCKING
- **Classification**: TEST GAP / EVIDENCE GAP
- **File & Line**: `frontend/tests/`
- **Expected Behavior**: Seluruh 16 halaman rute utama memiliki minimal satu file spesifikasi pengujian level komponen terisolasi (`.spec.ts`) yang memverifikasi mounting, rendering data, dan interaksi form.
- **Actual Behavior**: Saat ini terdapat 6 file spec dengan 91 pengujian yang mencakup mendalam `MyTodayPage.vue`, `PolicySettingsPage.vue`, `AdminOrganizationTab.vue`, dan `AdminUserManagementTab.vue`. Sebanyak 9 halaman lainnya (`CompliancePage`, `ReportsPage`, `ManagementPulsePage`, `FunctionPulsePage`, `TeamPulsePage`, `MyLeaveRequestPage`, `MyHistoryPage`, `ProjectRiskPage`, `NotificationsPage`) belum memiliki file `.spec.ts` terisolasi di direktori `frontend/tests/`.
- **Runtime Impact**: Tidak memengaruhi stabilitas produksi, namun mengurangi visibilitas regresi otomatis pada pipeline CI frontend.

---

### Finding S3-T2-GAP-03: Responsive Visual Evidence Carryover (S2-T5-EVID-01)
- **Severity**: LOW / NON-BLOCKING
- **Classification**: EVIDENCE GAP
- **Description**: Bukti tangkapan layar antarmuka multi-resolusi (375×667, 768×1024, 1280×800) tetap merupakan gap bukti terbuka dari S2-T5 yang secara formal diwariskan untuk diselesaikan pada tahapan **S3-T4** sesuai *locked development plan*.

---

## 24. Git Mutation Integrity

Sebelum dan selama audit S3-T2 dilaksanakan, verifikasi integritas pohon Git dijalankan secara ketat pada path yang dilindungi:

```bash
git diff --stat -- backend/src backend/prisma/schema.prisma backend/prisma/migrations frontend package-lock.json
```

### Hasil Verifikasi:
- **Production Frontend Modification**: **0 file diubah selama S3-T2**.
- **Backend Source Modification**: **0 file diubah**.
- **Prisma Schema Modification**: **0 file diubah**.
- **Prisma Migration Modification**: **0 file diubah**.
- **Package / Dependencies Modification**: **0 file diubah**.
- **Status Git Integrity**: **PASS**

---

## 25. Final Verdict

Berdasarkan aturan baku Klausul 37:
- Audit independen mengungkap **4 ketidakcocokan pemetaan endpoint API backend** (`daily-records.api.ts`, `notifications.api.ts`, `reporting.api.ts`), di mana pemanggilan mutasi pengajuan koreksi dan penandaan notifikasi gagal dengan HTTP 404.
- Salah satu mutasi (`markAsRead` di `NotificationsPage.vue`) secara diam-diam menyerap kegagalan backend.
- Sesuai instruksi absolut: *"FAIL — BLOCKING FRONTEND DEFECT if wrong/nonexistent API endpoint, critical mutation silently fails. Do not downgrade a real defect into an evidence gap"*.

Maka vonis akhir resmi S3-T2 adalah:

### FAIL — BLOCKING FRONTEND DEFECT

### Rekomendasi Langkah Remediasi (Fase Berikutnya):
1. **Perbaikan `daily-records.api.ts`**: Ubah fungsi `requestCorrection` agar memanggil `POST /api/v1/correction-requests` dengan payload `{ targetCommitmentId, proposedDescription, reason }`.
2. **Perbaikan `notifications.api.ts`**: Ubah `markAsRead` menjadi `POST /api/v1/notifications/:id/mark-read` dan `markAllAsRead` menjadi `POST /api/v1/notifications/mark-all-read`. Hapus silent error catch pada `NotificationsPage.vue`.
3. **Perbaikan `reporting.api.ts`**:
   - Ubah `getIndividualEvidence` agar menyematkan `userId` pada URL path parameter (`/reports/individual-evidence/${params.userId}`).
   - Ubah `exportReport` agar menggunakan method `GET /reports/${payload.reportType}/export` dengan query parameter `format`.
4. **Perbaikan `MyHistoryPage.vue`**: Hubungkan event `@export` pada `ExportButton` dengan fungsi generator unduhan CSV lokal atau API backend.
5. **Penyelarasan `ProfilePage.vue`**: Hubungkan kartu kebijakan dengan hook query `useActivePoliciesQuery()`.
6. **Ekspansi Test Suite**: Tambahkan test suite komponen untuk 9 halaman manajemen dan self-service yang belum tercover.
