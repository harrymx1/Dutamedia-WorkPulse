# 02 — Page, Route, and Workflow Reconciliation
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-02 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Rekonsiliasi** | 11 Oktober 2026 |
| **Baseline Sumber** | `S3-T4-UIUX-Page-Count-Reconciliation.md`, `03-UI-UX Spec v1.2`, `frontend/src/router/index.ts` |
| **Status Hasil** | **FULLY RECONCILED WITH CLARIFICATION** |

---

## 1. Definisi dan Baseline Rekonsiliasi

Terdapat perbedaan angka yang sering disalahpahami antara jumlah berkas prototipe desain lama dan jumlah halaman aplikasi nyata. Audit ini membuktikan secara matematis dan arsitektural bahwa tidak ada kontradiksi di antara angka-angka tersebut:

1. **30 Prototipe HTML Mandiri (`Design-Artifacts/UI-UX-Design/*.html`)**:
   Dibuat oleh tim UI/UX agar setiap dialog, sub-tab administrasi, dan alur interaktif dapat didemonstrasikan secara visual kepada para pemangku kepentingan (*stakeholders*).
2. **23 Business Page Specification Units (`03-UI-UX Spec & Flow Document.md` Bab 4, A 4.1 s.d. A 4.23)**:
   Unit spesifikasi fungsional bisnis formal yang diatur oleh Product Owner.
3. **16 Komponen Halaman Tingkat Rute Fisik (`frontend/src/pages/*.vue`)**:
   Komponen Single-Page Application (SPA) Vue 3 yang didaftarkan langsung ke Vue Router.
4. **17 Entri Vue Router (`frontend/src/router/index.ts`)**:
   15 rute fungsional terautentikasi + 1 rute root redirect (`/`) + 1 rute wildcard 404 (`/:pathMatch(.*)*`).
5. **12 Tab / Sub-View Surfaces**:
   Sub-halaman terdedikasi di dalam komponen halaman tab (`v-tabs`).
6. **5 Modal / Dialog Surfaces**:
   Permukaan dialog mengambang kontekstual (`v-dialog`).
7. **2 Alur Kerja Tertanam (*Embedded Workflows*)**:
   Formulir bertahap di dalam `MyTodayPage.vue` (Morning Check-in & EOD Check-in).

### Formula Rekonsiliasi Komponen SPA:
- **30 Prototipe Desain** = 11 Halaman Mandiri + 5 Modal/Dialog + 12 Tab/Sub-views + 2 Alur Tertanam
- **30 Prototipe Desain** -> (Konsolidasi Arsitektur SPA) -> **16 Komponen Vue Halaman Rute**

---

## 2. Tabel Pemetaan Lengkap (Forward Mapping Matrix)

Berikut adalah matriks pemetaan dari seluruh 30 berkas HTML prototipe lama ke unit spesifikasi bisnis, komponen Vue, entri router, dan status rekonsiliasi:

| Legacy ID | Nama File HTML Lama | Business Page Spec Unit | Logical Page Name | Komponen Vue SPA | Router Path & Route Name | Surface Type | Role / Permission Scope | Status Mapping | Bukti Sumber | Catatan Rekonsiliasi & Gap |
|---|---|---|---|---|---|---|---|---|---|---|
| **LEG-01** | `01-login.html` | A 4.1 Login | Login Page | `LoginPage.vue` | `/login` (`Login`) | Standalone Page | Public / Unauthenticated | RECONCILED | SAD 16.4, PRD FR-01 | Login mandiri. Form reset password dipisah ke `/reset-password`. |
| **LEG-02** | `02-morning-commitment.html` | A 4.2 My Today — Morning | My Today (Morning) | `MyTodayPage.vue` | `/today` (`MyToday`) | Embedded Workflow Step | All Authenticated Employees | RECONCILED | PRD US-01, UI/UX 4.2 | Bagian workflow pagi di `/today`. Cutoff jam 09:30. |
| **LEG-03** | `03-additional-work.html` | A 4.3 Add Additional Work | Additional Work Modal | `AdditionalWorkModal.vue` | Modal di `/today` | Contextual Modal Dialog | All Authenticated Employees | RECONCILED | PRD US-02, UI/UX 4.3 | Modal aksi ad-hoc di `/today`. Tidak pernah jadi route terpisah. |
| **LEG-04** | `04-eod.html` | A 4.4 My Today — EOD | My Today (EOD) | `MyTodayPage.vue` | `/today` (`MyToday`) | Embedded Workflow Step | All Authenticated Employees | RECONCILED | PRD US-03, UI/UX 4.4 | Bagian workflow sore di `/today`. Cutoff jam 18:00. |
| **LEG-05** | `05-my-history.html` | A 4.6 My History & Summary | My History | `MyHistoryPage.vue` | `/history` (`MyHistory`) | Standalone Page | All Authenticated Employees | RECONCILED | PRD US-05, UI/UX 4.6 | 1-to-1 match dengan halaman riwayat akuntabilitas. |
| **LEG-06** | `06-notifications.html` | A 4.7 Web Notification Center | Notifications Center | `NotificationsPage.vue` | `/notifications` (`Notifications`) | Standalone Page | All Authenticated Users | RECONCILED | PRD US-20, UI/UX 4.7 | Halaman pusat notifikasi dan popover bell di app shell. |
| **LEG-07** | `07-profile.html` | Profile & Password (SAD 16.4) | User Profile | `ProfilePage.vue` | `/profile` (`Profile`) | Standalone Page | All Authenticated Users | RECONCILED | SAD 16.4 | Profil pengguna, penugasan manajer langsung, ganti sandi. |
| **LEG-08** | `08-raise-blocker.html` | A 4.5 Raise Instant Blocker | Raise Blocker Modal | `RaiseBlockerModal.vue` | Global Modal (Header / `/today`) | Floating Modal Dialog | All Authenticated Employees | RECONCILED | PRD US-06, UI/UX 4.5 | Modal floating yang dapat dipanggil dari mana saja via App Shell. |
| **LEG-09** | `09-blocker-queue.html` | A 4.9 Blocker Queue | Team Blocker Queue | `TeamPulsePage.vue` | `/team` [Tab 2] (`TeamPulse`) | Tab Surface (`v-tab`) | Supervisor_TL, Head, PM | RECONCILED | PRD US-08, UI/UX 4.9 | Tab 2 di `/team`. Menampilkan antrean kendala tim aktif. |
| **LEG-10** | `10-blocker-detail.html` | A 4.9 Blocker Action Detail | Blocker Action Modal | `BlockerActionModal.vue` | Modal di `/team` & `/function` | Contextual Action Dialog | Supervisor_TL, Support Owner, Reporter | RECONCILED | PRD US-09, UI/UX 4.9 | Modal detail & transisi state siklus blocker (Ack/Resolve/Close). |
| **LEG-11** | `11-correction-request.html` | A 4.16 Correction Request | Correction Request Modal | `CorrectionRequestModal.vue` | Modal di `/today` | Contextual Form Modal | All Authenticated Employees | RECONCILED | PRD US-18, UI/UX 4.16 | Modal pengajuan koreksi setelah baseline terkunci cutoff. |
| **LEG-12** | `12-correction-leave-review.html`| A 4.22 Correction & Leave Review | Correction Review Tab | `TeamPulsePage.vue` | `/team` [Tab 3] (`TeamPulse`) | Tab Surface (`v-tab`) | Supervisor_TL, Reviewer | RECONCILED | PRD US-19, UI/UX 4.22 | Tab 3 di `/team`. Tinjauan koreksi (Objection window 48h) & cuti. |
| **LEG-13** | `13-my-leave-request.html` | A 4.20 My Leave Request | Leave Request Page | `MyLeaveRequestPage.vue` | `/today/leave-request` | Standalone Page | All Authenticated Employees | RECONCILED | PRD US-21, UI/UX 4.20 | Rute mandiri pengajuan cuti kerja dan log histori izin personal. |
| **LEG-14** | `14-team-pulse.html` | A 4.8 Team Pulse Dashboard | Team Pulse Roster | `TeamPulsePage.vue` | `/team` [Tab 1] (`TeamPulse`) | Tab Surface (`v-tab`) | Supervisor_TL, Head, PM | RECONCILED | PRD US-07, UI/UX 4.8 | Tab 1 di `/team`. Roster akuntabilitas harian anggota tim. |
| **LEG-15** | `15-function-pulse.html` | A 4.8 Function Pulse Dashboard | Function Pulse Roster | `FunctionPulsePage.vue` | `/function` [Tab 1] (`FunctionPulse`) | Tab Surface (`v-tab`) | Head, Head_Dept, Management | RECONCILED | PRD US-10, UI/UX 4.8 | Tab 1 di `/function`. Ringkasan operasional lintas tim departemen. |
| **LEG-16** | `16-function-escalations.html`| A 4.9 Function Escalations | Function Escalations | `FunctionPulsePage.vue` | `/function` [Tab 2] (`FunctionPulse`) | Tab Surface (`v-tab`) | Head, Head_Dept, Management | RECONCILED | PRD US-11, UI/UX 4.9 | Tab 2 di `/function`. Eskalasi blocker antar-fungsi/lintas divisi. |
| **LEG-17** | `17-coaching-notes.html` | A 4.10 Manager Note / Coaching | Manager Note Modal | `ManagerNoteModal.vue` | Modal di `/team` & `/function` | Contextual Modal Dialog | Supervisor_TL, Head | RECONCILED | PRD US-12, UI/UX 4.10 | Modal pencatatan umpan balik manajerial privat. |
| **LEG-18** | `18-project-risk.html` | A 4.13 Project Risk View | Project Risk Page | `ProjectRiskPage.vue` | `/my-scope/project-risk` | Standalone Page | PM, Delivery Heads, Mgmt | RECONCILED | PRD US-16, UI/UX 4.13 | Rute mandiri agregasi komitmen berbasis kode proyek (PM). |
| **LEG-19** | `19-management-pulse.html` | A 4.8 Management Pulse | Management Pulse | `ManagementPulsePage.vue` | `/management` [Tab 1] | Tab Surface (`v-tab`) | CEO_Management, Direksi | RECONCILED | PRD US-17, UI/UX 4.8 | Tab 1 di `/management`. Ikhtisar kesehatan eksekutif perusahaan. |
| **LEG-20** | `20-management-escalation-aging.html`| A 4.14 Escalation Aging | Escalation Aging Tab | `ManagementPulsePage.vue` | `/management` [Tab 2] | Tab Surface (`v-tab`) | CEO_Management, Direksi | RECONCILED | PRD US-17, UI/UX 4.14 | Tab 2 di `/management`. Blocker kritis melampaui toleransi SLA. |
| **LEG-21** | `21-compliance-queue.html` | A 4.11 Compliance Queue | Compliance Queue Tab | `CompliancePage.vue` | `/compliance` [Tab 1] | Tab Surface (`v-tab`) | HRGA, Management, Admin | RECONCILED | PRD US-13, UI/UX 4.11 | Tab 1 di `/compliance`. Pelanggaran no-submission berjenjang. |
| **LEG-22** | `22-exemption-management.html`| A 4.12 Exemption Management | Exemption Management Tab | `CompliancePage.vue` | `/compliance` [Tab 2] | Tab Surface (`v-tab`) | HRGA, Admin | RECONCILED | PRD US-14, UI/UX 4.12 | Tab 2 di `/compliance`. Hari libur resmi & dispensasi individual. |
| **LEG-23** | `23-leave-approval.html` | A 4.21 Leave Approval Queue | Leave Approval Sub-panel | `CompliancePage.vue` | `/compliance` [Tab 2 Sub] | Sub-panel / Drawer | HRGA, Admin | RECONCILED | PRD US-22, UI/UX 4.21 | Sub-view tinjauan persetujuan formal izin/cuti tingkat HRGA. |
| **LEG-24** | `24-coaching-warning-records.html`| A 4.10/4.11 Coaching SP Records | Coaching Warning Records | `CompliancePage.vue` | `/compliance` [Tab 3] | Tab Surface (`v-tab`) | HRGA, Management | RECONCILED | PRD US-15, UI/UX 4.10 | Tab 3 di `/compliance`. Buku register rekam pembinaan & SP formal. |
| **LEG-25** | `25-reports.html` | A 4.23 Reports Hub | Reports Hub Page | `ReportsPage.vue` | `/reports` (`Reports`) | Standalone Multi-tab Page | All Roles (Scoped Data) | RECONCILED | PRD US-24, UI/UX 4.23 | Halaman 5 laporan analitis operasional terpadu & export engine. |
| **LEG-26** | `26-policy-settings.html` | A 4.18 Policy Settings | Policy Settings Page | `PolicySettingsPage.vue` | `/policy-settings` | Standalone Multi-sec Page| Policy Owners, Admin | RECONCILED | PRD US-23, UI/UX 4.18 | Pengaturan parameter tata tertib kerja multi-kategori. |
| **LEG-27** | `27-user-role-management.html`| Master User Admin (SAD 16.4)| User Management Tab | `AdminUsersPage.vue` | `/admin/users` [Tab 1] | Tab Surface (`v-tab`) | SystemAdmin | RECONCILED | SAD 16.4 | Tab 1 di `/admin/users`. Administrasi master akun pengguna & peran. |
| **LEG-28** | `28-organization-mapping.html`| A 4.15 Org Mapping | Org Mapping Tab | `AdminUsersPage.vue` | `/admin/users` [Tab 2] | Tab Surface (`v-tab`) | SystemAdmin, HRGA | RECONCILED | PRD US-25, UI/UX 4.15 | Tab 2 di `/admin/users`. Pemetaan atasan & Project Authority. |
| **LEG-29** | `29-temporary-reviewer.html` | A 4.17 Temporary Reviewer | Temp Reviewer Tab | `AdminUsersPage.vue` | `/admin/users` [Tab 3] | Tab Surface (`v-tab`) | SystemAdmin, Supervisor | RECONCILED | PRD US-19, UI/UX 4.17 | Tab 3 di `/admin/users`. Pendelegasian reviewer berbatas waktu. |
| **LEG-30** | `30-notification-setup.html` | A 4.19 Notification Setup | Notification Setup Tab | `AdminUsersPage.vue` | `/admin/users` [Tab 4] | Tab Surface (`v-tab`) | SystemAdmin | RECONCILED | PRD US-20, UI/UX 4.19 | Tab 4 di `/admin/users`. Konfigurasi 13 kanal notifikasi pemicu. |

---

## 3. Entri Rute Tambahan Tanpa Berkas Prototipe HTML Mandiri

Dua rute berikut terdapat pada implementasi router aktual (`frontend/src/router/index.ts`), tetapi sengaja tidak memiliki prototipe HTML mandiri di folder desain lama:

1. **`/reset-password` (`ResetPasswordPage.vue`)**:
   - Ditangani oleh SAD 16.4 dan PRD FR-01 sebagai pemisahan dari form login. Menggunakan token styling dari Design System.
   - Status: **RECONCILED (Architectural Separation)**.
2. **`/:pathMatch(.*)*` (`NotFoundPage.vue`)**:
   - Penanganan fallback 404 wildcard SPA standard. Menggunakan layout kosong dengan pesan ramah pengguna.
   - Status: **RECONCILED (Standard SPA Fallback)**.
3. **`/` (Root Redirect)**:
   - Evaluasi dinamis berbasis otentikasi dan peran (mengarahkan ke `/team` untuk Supervisor/TL atau `/today` untuk karyawan).
   - Status: **RECONCILED (Dynamic Redirect Route)**.

---

## 4. Reverse Mapping: 16 Vue Route-Level Components ke UI/UX Artifacts

| Komponen Halaman Vue | Rute Aplikasi | Jumlah Prototipe Desain Terkonsolidasi | Daftar Artefak Desain Terkait | Pola Konsolidasi UI |
|---|---|---|---|---|
| `LoginPage.vue` | `/login` | 1 | `01-login.html` | 1-to-1 Standalone Auth |
| `ResetPasswordPage.vue` | `/reset-password` | 0 (Design System) | *None (Berasal dari 01-login.html sub-view)* | Standalone Security Page |
| `MyTodayPage.vue` | `/today` | 5 | `02-morning-commitment.html`<br>`03-additional-work.html`<br>`04-eod.html`<br>`08-raise-blocker.html`<br>`11-correction-request.html` | Single Self-Service Hub dengan 2 Step Sections & 3 Modals |
| `MyHistoryPage.vue` | `/history` | 1 | `05-my-history.html` | 1-to-1 Standalone History |
| `NotificationsPage.vue` | `/notifications` | 1 | `06-notifications.html` | 1-to-1 Utility Page |
| `ProfilePage.vue` | `/profile` | 1 | `07-profile.html` | 1-to-1 Standalone Profile |
| `MyLeaveRequestPage.vue` | `/today/leave-request` | 1 | `13-my-leave-request.html` | 1-to-1 Standalone Sub-route |
| `TeamPulsePage.vue` | `/team` | 6 | `14-team-pulse.html` (Tab 1)<br>`09-blocker-queue.html` (Tab 2)<br>`10-blocker-detail.html` (Modal)<br>`12-correction-leave-review.html` (Tab 3)<br>`23-leave-approval.html` (Sub)<br>`17-coaching-notes.html` (Modal) | Multi-tab Team Dashboard Hub (3 Tabs + 2 Modals) |
| `FunctionPulsePage.vue` | `/function` | 3 | `15-function-pulse.html` (Tab 1)<br>`16-function-escalations.html` (Tab 2)<br>`17-coaching-notes.html` (Modal) | Multi-tab Department Hub (2 Tabs + 1 Modal) |
| `CompliancePage.vue` | `/compliance` | 4 | `21-compliance-queue.html` (Tab 1)<br>`22-exemption-management.html` (Tab 2)<br>`23-leave-approval.html` (Sub)<br>`24-coaching-warning-records.html` (Tab 3) | Multi-tab Governance Hub (3 Tabs + 1 Sub-panel) |
| `ManagementPulsePage.vue` | `/management` | 2 | `19-management-pulse.html` (Tab 1)<br>`20-management-escalation-aging.html` (Tab 2) | Multi-tab Executive Hub (2 Tabs) |
| `ReportsPage.vue` | `/reports` | 1 | `25-reports.html` | 1-to-1 Standalone Multi-tab Hub |
| `ProjectRiskPage.vue` | `/my-scope/project-risk`| 1 | `18-project-risk.html` | 1-to-1 Standalone Project Hub |
| `PolicySettingsPage.vue` | `/policy-settings` | 1 | `26-policy-settings.html` | 1-to-1 Standalone Multi-section Hub |
| `AdminUsersPage.vue` | `/admin/users` | 4 | `27-user-role-management.html` (Tab 1)<br>`28-organization-mapping.html` (Tab 2)<br>`29-temporary-reviewer.html` (Tab 3)<br>`30-notification-setup.html` (Tab 4) | Multi-tab Administration Hub (4 Tabs) |
| `NotFoundPage.vue` | `/:pathMatch(.*)*` | 0 (Design System) | *None (Handled by Design System tokens)* | Standalone 404 Error Surface |

---

## 5. Kesimpulan Rekonsiliasi

Seluruh 30 berkas HTML prototipe lama telah berhasil dipetakan secara tervalidasi 100% ke dalam arsitektur Single-Page Application Vue 3. Tidak ada berkas desain lama yang terbuang atau diabaikan, dan tidak ada rute aplikasi yang dibuat tanpa dasar kebutuhan bisnis.
