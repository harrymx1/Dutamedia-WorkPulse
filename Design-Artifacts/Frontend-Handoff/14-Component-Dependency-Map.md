# 14 — Component Dependency & Hierarchy Map
## Verified Component Trees, Import Graphs, and Reuse Relationships

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-14 |
| **Versi** | 1.0.0 (GROUNDED REPOSITORY AUDIT) |
| **Tanggal Audit** | 11 Oktober 2026 |
| **Basis Bukti Kode** | Seluruh impor fisik dan pemakaian template di `frontend/src/` |
| **Metode Analisis** | Static Import & Template Ast Verification |

---

## 1. Klasifikasi Taksonomi Komponen

Berdasarkan analisis repositori fisik, seluruh komponen Vue di WorkPulse diklasifikasikan ke dalam 7 tingkatan fungsional:

1. **Application Shell (Layout)**:
   - [App.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/App.vue) — Host kontainer aplikasi induk, navbar, user menu, router-view, dan global snackbar toasts.
2. **Route-Level Pages (`src/pages/*.vue`)**:
   - 16 Komponen halaman fisik terdaftar rute: `LoginPage`, `ResetPasswordPage`, `MyTodayPage`, `MyHistoryPage`, `NotificationsPage`, `ProfilePage`, `MyLeaveRequestPage`, `TeamPulsePage`, `FunctionPulsePage`, `CompliancePage`, `ManagementPulsePage`, `ReportsPage`, `ProjectRiskPage`, `PolicySettingsPage`, `AdminUsersPage`, `NotFoundPage`.
3. **Domain & Feature Components (`src/components/admin/`, `src/components/management/`)**:
   - Komponen terdedikasi domain khusus: `AdminUserManagementTab`, `AdminOrganizationTab`, `AdminTemporaryReviewerTab`, `AdminNotificationSetupTab`, `ExceptionSummaryWidget`.
4. **Modal & Dialog Surfaces (`src/components/self-service/`, `src/components/management/`)**:
   - Komponen dialog mengambang: `AdditionalWorkModal`, `RaiseBlockerModal`, `ValidationPromptModal`, `CorrectionRequestModal`, `BlockerActionModal`, `ManagerNoteModal`, `CreateExemptionModal`, `PolicyVersionHistory`.
5. **Shared Reusable UI Primitives (`src/components/shared/`)**:
   - Komponen tanpa dependensi rute khusus: `StatusBadge`, `SubmissionTimingBadge`, `CommitmentCard`, `BlockerCard`, `AuthorityTag`, `ClassificationTag`, `ObjectionWindowIndicator`, `NotificationBell`, `FilterBar`, `ExportButton`, `ActionPanel`.
6. **Embedded Workflow Components**:
   - Bagian alur kerja bertahap yang tertanam langsung di dalam template `MyTodayPage.vue` (Morning Check-in form, Mid-day ad-hoc controls, EOD Outcome evaluation).
7. **Form Controls & Vuetify Primitives**:
   - Primitif Vuetify bawaan yang dikustomisasi tema: `VBtn`, `VCard`, `VTextField`, `VSelect`, `VTextarea`, `VDialog`, `VTabs`, `VWindow`, `VSnackbar`, `VProgressCircular`.

---

## 2. Diagram Pohon Komposisi Halaman Kritis (Component Hierarchies)

### A. Halaman My Today (`/today` — [MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue))
Pusat akuntabilitas mandiri harian yang menggabungkan seluruh alur check-in:

```text
[App.vue] (Application Shell)
  └── [VAppBar] (Top Navigation)
  └── [VMain]
        └── [MyTodayPage.vue] (Route Page Container)
              ├── [Header Section]
              │     ├── Title & Status Chip
              │     └── Action Button: "Raise Instant Blocker"
              │
              ├── [Countdown Banner] (Cutoff Window Alert)
              │
              ├── [DraftBanner] (FR-11: Carry-Over Draft Collection)
              │     └── Draft Item Cards + Confirm/Dismiss Actions
              │
              ├── [Section 1: Morning Commitment Form] (Embedded Workflow)
              │     ├── Slot 1..3 Input Rows (Text + Project Ref + Initial Risk Selector)
              │     ├── Zero-Commitment Toggle & Mandatory Reason Field
              │     └── Submit Morning Button
              │
              ├── [Section 2: Mid-day & Additional Work] (Embedded Workflow)
              │     ├── Additional Work Table / Card List
              │     └── Action Trigger Buttons:
              │           ├── "Tambah Pekerjaan Ad-hoc" ──────> [AdditionalWorkModal.vue]
              │           └── "Laporkan Blocker" ─────────────> [RaiseBlockerModal.vue]
              │
              ├── [Section 3: EOD Check-in Form] (Embedded Workflow)
              │     ├── Task Item Rows (Outcome Selector + Continuation Selector)
              │     ├── Today Blockers Linkage
              │     ├── Tomorrow Priorities Input (Catatan Kontekstual)
              │     └── Submit EOD Button ───────────────────> [ValidationPromptModal.vue]
              │                                                (Status Suggestion Override Dialog)
              │
              └── [Correction Trigger] ───────────────────────> [CorrectionRequestModal.vue]
                    (Active when locked post-cutoff)
```

### B. Halaman Team Pulse (`/team` — [TeamPulsePage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/TeamPulsePage.vue))
Dashboard supervisi tim dengan tab modular dan modal interaktif:

```text
[App.vue] (Application Shell)
  └── [TeamPulsePage.vue] (Route Page Container)
        ├── [Header & Filter Section] (Date Picker, Team Name)
        │
        ├── [ExceptionSummaryWidget.vue] (Ringkasan Pengecualian & Status Tim)
        │
        ├── [VTabs Navigation] ('roster' | 'blockers' | 'reviews')
        │
        ├── [Tab 1: Roster Tim]
        │     └── Team Members Table / Cards
        │           ├── [StatusBadge.vue] (Daily Status GREEN/AMBER/RED)
        │           ├── [SubmissionTimingBadge.vue] (On-Time / Late / No-Sub)
        │           └── Action Button: "Beri Catatan" ────────> [ManagerNoteModal.vue]
        │
        ├── [Tab 2: Antrean Kendala Tim (Blocker Queue)]
        │     └── Blocker List / Table
        │           ├── [ClassificationTag.vue] / Severity Tag
        │           ├── [AuthorityTag.vue] (Org vs Project)
        │           └── Action Button: "Kelola Blocker" ──────> [BlockerActionModal.vue]
        │
        └── [Tab 3: Tinjauan Koreksi & Cuti]
              ├── Sanggahan Koreksi Table
              │     ├── [ObjectionWindowIndicator.vue] (Countdown 48 Jam)
              │     └── Action Button: "Tolak Sanggahan" ─────> [ObjectionDialog]
              └── Pengajuan Cuti Anggota Tim Table
                    └── Action Buttons: "Setujui" / "Tolak"
```

### C. Halaman Admin Master Data (`/admin/users` — [AdminUsersPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/AdminUsersPage.vue))
Orkestrator halaman admin yang mendelegasikan rendering ke 4 komponen tab:

```text
[App.vue] (Application Shell)
  └── [AdminUsersPage.vue] (Route Page Container)
        └── [VCard & VTabs] ('users' | 'organization' | 'temporary' | 'notifications')
              ├── [Tab 1 Window] ───> [AdminUserManagementTab.vue]
              │                         ├── User Master Table (NIK, Nama, Role, Status)
              │                         ├── Create User Dialog
              │                         └── Admin Reset Password Dialog
              │
              ├── [Tab 2 Window] ───> [AdminOrganizationTab.vue]
              │                         ├── Direct Manager Assignment Matrix
              │                         ├── Project Authority Mapping Table
              │                         └── Effective-Dated Form (effectiveFrom, effectiveTo)
              │
              ├── [Tab 3 Window] ───> [AdminTemporaryReviewerTab.vue]
              │                         ├── Temporary Reviewer Active List
              │                         ├── Create Delegation Form (Reviewer, Assignee, Dates)
              │                         └── Expiry Status Chips
              │
              └── [Tab 4 Window] ───> [AdminNotificationSetupTab.vue]
                                        ├── 13 System Trigger Configuration Rows
                                        ├── Channel Toggles (In-App, Browser Push, Email)
                                        └── Template Preview Drawer
```

---

## 3. Matriks Penggunaan Kembali Komponen (Component Reuse Matrix)

Tabel berikut membuktikan di mana saja setiap komponen reusable digunakan di seluruh repositori:

| Komponen Reusable | Berkas Komponen | Halaman / Komponen Pengimpor | Frekuensi Penggunaan |
|---|---|---|---|
| **StatusBadge** | [src/components/shared/StatusBadge.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/StatusBadge.vue) | `MyTodayPage.vue`, `MyHistoryPage.vue`, `TeamPulsePage.vue`, `FunctionPulsePage.vue`, `ReportsPage.vue` | 5 Halaman Utama |
| **SubmissionTimingBadge** | [src/components/shared/SubmissionTimingBadge.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/SubmissionTimingBadge.vue) | `MyTodayPage.vue`, `MyHistoryPage.vue`, `TeamPulsePage.vue`, `FunctionPulsePage.vue`, `ReportsPage.vue` | 5 Halaman Utama |
| **NotificationBell** | [src/components/shared/NotificationBell.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/NotificationBell.vue) | `App.vue` (Top App Bar) | Global Shell (100% Rute) |
| **ExportButton** | [src/components/shared/ExportButton.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/ExportButton.vue) | `MyHistoryPage.vue`, `ReportsPage.vue` | 2 Halaman |
| **ExceptionSummaryWidget** | [src/components/management/ExceptionSummaryWidget.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/ExceptionSummaryWidget.vue) | `TeamPulsePage.vue`, `FunctionPulsePage.vue`, `ManagementPulsePage.vue` | 3 Halaman Manajemen |
| **BlockerActionModal** | [src/components/management/BlockerActionModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/BlockerActionModal.vue) | `TeamPulsePage.vue`, `FunctionPulsePage.vue` | 2 Halaman Supervisi |
| **ManagerNoteModal** | [src/components/management/ManagerNoteModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/ManagerNoteModal.vue) | `TeamPulsePage.vue`, `FunctionPulsePage.vue` | 2 Halaman Supervisi |
| **ClassificationTag** | [src/components/shared/ClassificationTag.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/ClassificationTag.vue) | `TeamPulsePage.vue`, `CorrectionRequestModal.vue` | 2 Komponen |
| **ObjectionWindowIndicator** | [src/components/shared/ObjectionWindowIndicator.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/ObjectionWindowIndicator.vue) | `TeamPulsePage.vue` (Tab 3 Reviews) | 1 Halaman Kritis |
| **CreateExemptionModal** | [src/components/management/CreateExemptionModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/CreateExemptionModal.vue) | `CompliancePage.vue` | 1 Halaman |
| **PolicyVersionHistory** | [src/components/management/PolicyVersionHistory.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/PolicyVersionHistory.vue) | `PolicySettingsPage.vue` | 1 Halaman |
