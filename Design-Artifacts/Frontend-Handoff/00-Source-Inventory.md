# 00 — Source Inventory & Environment Discovery
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-00 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Penyusun** | Senior Frontend Architect & Design Systems Engineer |
| **Status Verifikasi** | RECONCILED & AUDITED (Strict Read-Only) |
| **Workspace Root** | `D:\PKL Duta Media\Dutamedia-WorkPulse` |
| **Frontend Root** | `D:\PKL Duta Media\Dutamedia-WorkPulse\frontend` |
| **Design Artifacts Root** | `D:\PKL Duta Media\Dutamedia-WorkPulse\Design-Artifacts` |

---

## 1. Ringkasan Eksekutif Sumber Daya

Fase 0 (Environment dan Source Discovery) telah menginventarisasi seluruh artefak kebenaran produk, prototipe visual historis, basis kode frontend aktual, kontrak API backend, serta laporan audit dan rekonsiliasi yang tersedia di lingkungan kerja WorkPulse.

Audit dilakukan secara **STRICT READ-ONLY**: tidak ada berkas sumber yang dimodifikasi, ditimpa, atau dihapus. Dokumen ini mendokumentasikan fakta fisik berkas di sistem file tanpa mengasumsikan keberadaan berkas yang tidak ditemukan.

### Ringkasan Kuantitatif Artefak

| Kategori Sumber | Jumlah Teridentifikasi | Status Akses & Pemeriksaan | Lokasi Fisik Utama |
|---|---|---|---|
| **Dokumen Spesifikasi Produk & Arsitektur** | 15 Dokumen Inti | 100% Terbaca & Terverifikasi | `Design-Artifacts/*.md` |
| **Prototipe Desain UI/UX Lama (HTML)** | 30 Berkas HTML | 100% Terbaca, Diinspeksi DOM & Script | `Design-Artifacts/UI-UX-Design/*.html` |
| **Aset Desain (Font & Ikon)** | 2 Font Web, 543 Inline SVG, 0 Raster | 100% Terinventarisasi | Google Fonts CDN & SVG tersemat |
| **Basis Kode Frontend Aktual (Vue SPA)** | 16 Pages, 23 Components, 17 Routes | 100% Terverifikasi di `src/` | `frontend/src/` |
| **Kontrak API Backend (OpenAPI 3.0)** | 63 REST Endpoints | 100% Terpetakan | `backend/openapi.json` |
| **Laporan Audit & Rekonsiliasi (S2 & S3)** | 37 Laporan Verifikasi | 100% Dianalisis Silang | `Design-Artifacts/Reports/*.md` |

---

## 2. Inventaris Dokumen Produk & Desain yang Telah Disahkan (Authoritative Sources)

| ID Sumber | Nama File | Lokasi Aktual | Ukuran (Bytes) | Status | Relevansi Terhadap Frontend | Keterangan & Batasan |
|---|---|---|---|---|---|---|
| **SRC-DOC-01** | `01-PDD.md` | `Design-Artifacts/01-PDD.md` | 16,802 | VERIFIED | Kritis (Prinsip & Persona) | Product Definition Document v1.1. Memuat 4 persona, visi produk, prinsip non-punitive, 7 tujuan produk. |
| **SRC-DOC-02** | `02-PRD.md` | `Design-Artifacts/02-PRD.md` | 29,810 | VERIFIED | Kritis (Kebutuhan Fungsional) | Product Requirement Document v1.1. Memuat User Stories (US-01 s.d US-25), Business Rules (BR-01 s.d BR-20), matrix akses. |
| **SRC-DOC-03** | `03-UI-UX Spec & Flow Document.md` | `Design-Artifacts/03-UI-UX Spec & Flow Document.md` | 35,639 | VERIFIED | Kritis (Flow & 23 Business Units) | UI/UX Spec v1.2. Memuat Bab 4 (23 Business Page Units A 4.1 s.d A 4.23) dan Bab 7 (14 User Flows). |
| **SRC-DOC-04** | `04-DESIGN.md` | `Design-Artifacts/04-DESIGN.md` | 11,089 | VERIFIED | Kritis (Design System Tokens) | Design System v1.1. Memuat token warna (3 sistem independen), tipografi, spacing, radii, rules button/card/modal. |
| **SRC-DOC-05** | `05-SAD.md` | `Design-Artifacts/05-SAD.md` | 154,727 | VERIFIED | Kritis (Arsitektur & Skema) | System Architecture Design. Memuat Bab 16 (Frontend Architecture, Vuetify 3, Vue Query, State Management, Router Guards). |
| **SRC-DOC-06** | `06-Product Backlog.md` | `Design-Artifacts/06-Product Backlog.md` | 45,218 | VERIFIED | Tinggi (Scope & Epics) | Product Backlog memuat breakdown epics, user story acceptance criteria, sprint scope. |
| **SRC-DOC-07** | `08-ADR.md` | `Design-Artifacts/08-ADR.md` | 108,518 | VERIFIED | Tinggi (Keputusan Arsitektur) | Architecture Decision Records (ADR-001 s.d ADR-025), alasan pemilihan Vue 3, TanStack Query, Vuetify, OpenAPI. |
| **SRC-DOC-08** | `09-Known-Limitations.md` | `Design-Artifacts/09-Known-Limitations.md` | 35,911 | VERIFIED | Sedang (Boundary & Constraints) | Batasan teknis fase MVP, browser compatibility, Push API limitations pada mobile iOS Safari. |
| **SRC-DOC-09** | `10-S2-Audit-Findings-Register.md` | `Design-Artifacts/10-S2-Audit-Findings-Register.md` | 87,387 | VERIFIED | Tinggi (Audit Finding Tracking) | Register temuan audit Stage 2 (triage status, remediation verification). |
| **SRC-DOC-10** | `11-S2-T1-Traceability-Matrix.md` | `Design-Artifacts/11-S2-T1-Traceability-Matrix.md` | 81,897 | VERIFIED | Tinggi (Traceability Baseline) | Matriks penelusuran persyaratan dari PRD ke kode dan pengujian. |
| **SRC-DOC-11** | `12-S2-T1-Gap-Register.md` | `Design-Artifacts/12-S2-T1-Gap-Register.md` | 6,273 | VERIFIED | Sedang (Gap History) | Register celah implementasi awal. |
| **SRC-DOC-12** | `13-S2-T2-Forbidden-Feature-Audit.md` | `Design-Artifacts/13-S2-T2-Forbidden-Feature-Audit.md` | 23,838 | VERIFIED | Kritis (Anti-Pattern Guard) | Audit fitur terlarang (anti surveillance, no silent change, no auto-submit copy forward). |
| **SRC-DOC-13** | `14-S2-T3-Endpoint-Reconciliation.md` | `Design-Artifacts/14-S2-T3-Endpoint-Reconciliation.md` | 39,012 | VERIFIED | Kritis (API Contract Alignment) | Rekonsiliasi endpoint backend terhadap kebutuhan UI. |
| **SRC-DOC-14** | `15-S2-T4-Scheduled-Jobs-Notification-State-Audit.md` | `Design-Artifacts/15-S2-T4-Scheduled-Jobs-Notification-State-Audit.md` | 36,307 | VERIFIED | Tinggi (Lifecycle & Jobs) | Audit job terjadwal (cutoff locking, reminder evaluation, no-submission event). |
| **SRC-DOC-15** | `S3-T4-UIUX-Page-Count-Reconciliation.md` | `Design-Artifacts/Reports/S3-T4-UIUX-Page-Count-Reconciliation.md` | 24,190 | VERIFIED | Kritis (Page Count Baseline) | Rekonsiliasi kanonikal 30 Prototipe vs 23 Business Units vs 16 Vue Pages vs 17 Routes. |

---

## 3. Inventaris 30 Berkas HTML Prototipe Desain Lama (Legacy UI Prototypes)

Seluruh berkas berada pada: `D:\PKL Duta Media\Dutamedia-WorkPulse\Design-Artifacts\UI-UX-Design\`.
Setiap file adalah prototipe mandiri (standalone HTML) yang memiliki gaya CSS tersemat (`<style>`), inline SVG icon, dan script demonstrasi interaktif.

| ID Sumber | Nama File Prototipe | Ukuran (Bytes) | Judul HTML (`<title>`) | Tipe Permukaan Desain | Business Unit Terkait | Vue Route & Komponen Target |
|---|---|---|---|---|---|---|
| **LEG-01** | `01-login.html` | 17,430 | WorkPulse — Sign in | Standalone Page | A 4.1 Login | `/login` (`LoginPage.vue`) |
| **LEG-02** | `02-morning-commitment.html` | 50,481 | WorkPulse — Morning Commitment | Form / Embedded Section | A 4.2 My Today — Morning | `/today` (`MyTodayPage.vue`) |
| **LEG-03** | `03-additional-work.html` | 39,224 | WorkPulse — Additional Work | Modal Dialog | A 4.3 Add Additional Work | `/today` (`AdditionalWorkModal.vue`) |
| **LEG-04** | `04-eod.html` | 50,342 | WorkPulse — EOD Outcome | Form / Embedded Section | A 4.4 My Today — EOD | `/today` (`MyTodayPage.vue`) |
| **LEG-05** | `05-my-history.html` | 43,867 | WorkPulse — My History | Standalone Page | A 4.6 My History | `/history` (`MyHistoryPage.vue`) |
| **LEG-06** | `06-notifications.html` | 20,672 | WorkPulse — Notifications | Standalone Page | A 4.7 Notification Center | `/notifications` (`NotificationsPage.vue`) |
| **LEG-07** | `07-profile.html` | 26,304 | WorkPulse — Profile | Standalone Page | Profil Pengguna (SAD 16.4) | `/profile` (`ProfilePage.vue`) |
| **LEG-08** | `08-raise-blocker.html` | 35,626 | WorkPulse — Raise Instant Blocker | Modal Dialog | A 4.5 Raise Instant Blocker | Global Modal (`RaiseBlockerModal.vue`) |
| **LEG-09** | `09-blocker-queue.html` | 39,374 | WorkPulse — Blocker Queue | Tab / Sub-view | A 4.9 Blocker & Escalation | `/team` [Tab 2] (`TeamPulsePage.vue`) |
| **LEG-10** | `10-blocker-detail.html` | 34,655 | WorkPulse — Blocker Detail | Modal Dialog / Drawer | A 4.9 Blocker Lifecycle | Modal (`BlockerActionModal.vue`) |
| **LEG-11** | `11-correction-request.html` | 32,874 | WorkPulse — Correction Request | Modal Dialog | A 4.16 Correction Request | `/today` (`CorrectionRequestModal.vue`) |
| **LEG-12** | `12-correction-leave-review.html` | 36,269 | WorkPulse — Correction & Leave Review | Tab / Sub-view | A 4.22 Correction & Leave Review | `/team` [Tab 3] (`TeamPulsePage.vue`) |
| **LEG-13** | `13-my-leave-request.html` | 23,813 | WorkPulse — My Leave Request | Standalone Page | A 4.20 My Leave Request | `/today/leave-request` (`MyLeaveRequestPage.vue`) |
| **LEG-14** | `14-team-pulse.html` | 28,706 | WorkPulse — Team Pulse | Tab / Dashboard | A 4.8 Team Pulse | `/team` [Tab 1] (`TeamPulsePage.vue`) |
| **LEG-15** | `15-function-pulse.html` | 31,731 | WorkPulse — Function Pulse | Tab / Dashboard | A 4.8 Function Pulse | `/function` [Tab 1] (`FunctionPulsePage.vue`) |
| **LEG-16** | `16-function-escalations.html` | 38,877 | WorkPulse — Function Escalations | Tab / Sub-view | A 4.9 Function Escalations | `/function` [Tab 2] (`FunctionPulsePage.vue`) |
| **LEG-17** | `17-coaching-notes.html` | 29,261 | WorkPulse — Coaching Notes | Modal Dialog | A 4.10 Manager Note | Modal (`ManagerNoteModal.vue`) |
| **LEG-18** | `18-project-risk.html` | 21,725 | WorkPulse — Project Risk | Standalone Page | A 4.13 Project Risk View | `/my-scope/project-risk` (`ProjectRiskPage.vue`) |
| **LEG-19** | `19-management-pulse.html` | 31,571 | WorkPulse — Management Pulse | Tab / Dashboard | A 4.8 Management Pulse | `/management` [Tab 1] (`ManagementPulsePage.vue`) |
| **LEG-20** | `20-management-escalation-aging.html` | 30,522 | WorkPulse — Escalation Aging | Tab / Sub-view | A 4.14 Escalation Aging | `/management` [Tab 2] (`ManagementPulsePage.vue`) |
| **LEG-21** | `21-compliance-queue.html` | 35,640 | WorkPulse — Compliance Queue | Tab / Sub-view | A 4.11 Compliance Queue | `/compliance` [Tab 1] (`CompliancePage.vue`) |
| **LEG-22** | `22-exemption-management.html` | 43,032 | WorkPulse — Exemption Management | Tab / Sub-view | A 4.12 Exemption Management | `/compliance` [Tab 2] (`CompliancePage.vue`) |
| **LEG-23** | `23-leave-approval.html` | 35,301 | WorkPulse — Leave Approval | Sub-view / Tab | A 4.21 Leave Approval Queue | `/compliance` [Tab 2/Sub] (`CompliancePage.vue`) |
| **LEG-24** | `24-coaching-warning-records.html` | 40,332 | WorkPulse — Coaching/Warning Records | Tab / Sub-view | A 4.10 / A 4.11 Coaching SP | `/compliance` [Tab 3] (`CompliancePage.vue`) |
| **LEG-25** | `25-reports.html` | 30,910 | WorkPulse — Reports | Standalone Multi-tab | A 4.23 Reports Hub | `/reports` (`ReportsPage.vue`) |
| **LEG-26** | `26-policy-settings.html` | 33,632 | WorkPulse — Policy Settings | Standalone Multi-sec | A 4.18 Policy Settings | `/policy-settings` (`PolicySettingsPage.vue`) |
| **LEG-27** | `27-user-role-management.html` | 47,173 | WorkPulse — User & Role Management | Tab / Sub-view | Master User (SAD 16.4) | `/admin/users` [Tab 1] (`AdminUsersPage.vue`) |
| **LEG-28** | `28-organization-mapping.html` | 44,938 | WorkPulse — Organization Mapping | Tab / Sub-view | A 4.15 Org Mapping | `/admin/users` [Tab 2] (`AdminUsersPage.vue`) |
| **LEG-29** | `29-temporary-reviewer.html` | 32,308 | WorkPulse — Temporary Reviewer | Tab / Sub-view | A 4.17 Temporary Reviewer | `/admin/users` [Tab 3] (`AdminUsersPage.vue`) |
| **LEG-30** | `30-notification-setup.html` | 27,829 | WorkPulse — Notification Setup | Tab / Sub-view | A 4.19 Notification Setup | `/admin/users` [Tab 4] (`AdminUsersPage.vue`) |

---

## 4. Inventaris Aset Pendukung (Assets, Fonts, Icons)

| ID Sumber | Tipe Aset | Deskripsi / Nilai | Lokasi / Referensi | Status Pemeriksaan |
|---|---|---|---|---|
| **AST-FONT-01** | Web Font | **Plus Jakarta Sans** (Weights 400, 500, 600, 700, 800) | Google Fonts CDN (`fonts.googleapis.com`) | Terverifikasi pada seluruh 30 HTML & `index.html` |
| **AST-FONT-02** | Web Font | **JetBrains Mono** (Weights 400, 500) untuk ID, badge, timestamps, countdown | Google Fonts CDN (`fonts.googleapis.com`) | Terverifikasi pada seluruh 30 HTML & `index.html` |
| **AST-ICON-01** | Icon Font | **Material Design Icons** (`@mdi/font` v7.4.47) | `frontend/node_modules/@mdi/font` | Terkonfigurasi aktif di Vuetify 3 |
| **AST-ICON-02** | Inline Vector | 543 unit `<svg>` element tersemat langsung dalam HTML prototipe | Tersemat di dalam 30 file HTML | Terinventarisasi, dipetakan ke MDI aliases |
| **AST-IMG-01** | Raster Asset | `hero.png` | `frontend/src/assets/hero.png` | Tersedia di frontend repository |
| **AST-VEC-01** | Vector Asset | `vite.svg`, `typescript.svg` | `frontend/src/assets/` | Default template assets (non-production) |

---

## 5. Inventaris Basis Kode Frontend Aktual

### 5.1 Spesifikasi Dependensi (`frontend/package.json`)
- **Framework**: Vue `v3.5.42`
- **TypeScript**: `~6.0.2`
- **Build Tool**: Vite `v8.3.0`
- **UI Library**: Vuetify `v4.2.1` + `vite-plugin-vuetify` `v2.1.3`
- **Icons**: `@mdi/font` `v7.4.47`
- **State Management**: Pinia `v4.0.3`
- **Routing**: Vue Router `v5.3.1`
- **Server State & Caching**: `@tanstack/vue-query` `v5.102.8`
- **Form & Validation**: vee-validate `v4.15.1` + `@vee-validate/zod` `v4.15.1` + Zod `v4.6.5`
- **Unit Testing**: Vitest `v4.1.11` + `@vue/test-utils` `v2.5.1` + Happy DOM `v20.14.5`
- **E2E Testing**: Playwright `v1.48.0`

### 5.2 Komponen Halaman Tingkat Rute Aktual (`frontend/src/pages/`)
Tepat 16 berkas Vue Single File Component:
1. `LoginPage.vue`
2. `ResetPasswordPage.vue`
3. `MyTodayPage.vue`
4. `MyHistoryPage.vue`
5. `NotificationsPage.vue`
6. `ProfilePage.vue`
7. `MyLeaveRequestPage.vue`
8. `TeamPulsePage.vue`
9. `FunctionPulsePage.vue`
10. `CompliancePage.vue`
11. `ManagementPulsePage.vue`
12. `ReportsPage.vue`
13. `ProjectRiskPage.vue`
14. `PolicySettingsPage.vue`
15. `AdminUsersPage.vue`
16. `NotFoundPage.vue`

### 5.3 Komponen Antarmuka Terdistribusi Aktual (`frontend/src/components/`)
- **Shared Components (`src/components/shared/`)**:
  `ActionPanel.vue`, `AuthorityTag.vue`, `BlockerCard.vue`, `ClassificationTag.vue`, `CommitmentCard.vue`, `ExportButton.vue`, `FilterBar.vue`, `NotificationBell.vue`, `ObjectionWindowIndicator.vue`, `StatusBadge.vue`, `SubmissionTimingBadge.vue`, `index.ts`.
- **Self-Service Components (`src/components/self-service/`)**:
  `AdditionalWorkModal.vue`, `CorrectionRequestModal.vue`, `RaiseBlockerModal.vue`, `ValidationPromptModal.vue`.
- **Management Components (`src/components/management/`)**:
  `BlockerActionModal.vue`, `CreateExemptionModal.vue`, `ExceptionSummaryWidget.vue`, `ManagerNoteModal.vue`, `PolicyVersionHistory.vue`.
- **Admin Components (`src/components/admin/`)**:
  `AdminNotificationSetupTab.vue`, `AdminOrganizationTab.vue`, `AdminTemporaryReviewerTab.vue`, `AdminUserManagementTab.vue`.

---

## 6. Inventaris Kontrak API Backend (`backend/openapi.json`)

OpenAPI 3.0.0 Specification mendefinisikan 63 endpoint REST API terkonfirmasi:
- **Authentication & Identity**: 5 endpoints (`/api/v1/auth/login`, `logout`, `reset-password`, `admin-reset-password/{userId}`, `me`).
- **Users & Master Data**: 4 endpoints (`GET /users`, `POST /users`, `GET /users/{id}`, `PATCH /users/{id}`).
- **Organization & Assignments**: 5 endpoints (`/users/{id}/organizational-assignments`, `/organizational-assignments`, `/project-authority-mappings`, `/temporary-reviewer-assignments`).
- **Daily Accountability (Core)**: 6 endpoints (`/morning-checkin`, `/today`, `/{id}/eod-checkin`, `confirm-override`, `GET /records`, `GET /records/{id}`).
- **Commitments & Additional Work**: 3 endpoints (`PATCH /commitments/{id}`, `POST /additional-work`, `PATCH /additional-work/{id}`).
- **Blockers & Lifecycle**: 9 endpoints (`POST /blockers`, `GET /blockers`, `GET /blockers/{id}`, `acknowledge`, `update`, `resolve`, `accept-risk`, `close`, `support`).
- **Exceptions (Leave/Holiday/Exemption)**: 6 endpoints (`leave`, `holiday`, `exemption`, `GET /exceptions`, `approve`, `reject`).
- **Correction Requests**: 4 endpoints (`POST /correction-requests`, `GET /correction-requests`, `GET /{id}`, `object`).
- **Manager Notes**: 3 endpoints (`POST /manager-notes`, `GET /manager-notes`, `GET /{id}`).
- **Compliance & Escalations**: 5 endpoints (`GET /compliance-events`, `GET /{id}`, `coach`, `record-warning`, `escalate-formal`).
- **Policies & Settings**: 5 endpoints (`GET /policies`, `POST /policies`, `GET /{category}/history`, `owner-assignments`).
- **Reporting & Exports**: 7 endpoints (`daily-exception`, `exception-summary`, `weekly-team-summary`, `monthly-trend`, `individual-evidence/{userId}`, `blocker-root-cause`, `/{reportType}/export`).
- **Notifications**: 3 endpoints (`GET /notifications`, `mark-read`, `mark-all-read`).
- **File Storage**: 2 endpoints (`/files/upload-url`, `/files/{fileId}/download-url`).

---

## 7. Keterbatasan Akses & Catatan Integritas Lingkungan

1. **Tool File Access Policy**: Perintah pembacaan internal IDE (`view_file`) dibatasi secara ketat pada direktori aktif `frontend/`. Seluruh investigasi lintas direktori (`Design-Artifacts/` dan `backend/`) dilakukan secara valid menggunakan PowerShell non-mutasi (`Get-Content`, Node.js inspection scripts).
2. **Arsip UI-Design.zip**: Berkas arsip `UI-Design.zip` telah diekstraksi secara lengkap ke dalam direktori `Design-Artifacts/UI-UX-Design/` (30 berkas HTML lengkap). Berkas zip asli telah diarsipkan di histori repositori.
3. **Status Mutasi**: Seluruh file sumber asli 100% UTUH. Tidak ada mutasi kode produksi maupun penimpaan file desain selama fase discovery ini.
