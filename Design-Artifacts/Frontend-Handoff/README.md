# WorkPulse — Frontend Handoff Package
## Comprehensive UI/UX Extraction, Architecture, and Screen Specification

| Metadata Paket Handoff | Nilai |
|---|---|
| **Sistem / Produk** | WorkPulse — Daily Accountability & Blocker Log System |
| **Organisasi** | PT Dutamedia Mandiri Ekacipta (Dutamedia) |
| **Versi Paket** | 1.1.0 (GROUNDED REPOSITORY RECONCILIATION) |
| **Tanggal Terbit** | 11 Oktober 2026 |
| **Peran Penyusun** | Senior Frontend Architect, UI/UX Systems Analyst, Design Systems Engineer |
| **Target Pengguna Paket**| Downstream AI Coding Agents (ChatGPT) & Frontend Engineers |
| **Status Quality Gate** | **PASSED (100% Reconciled, Verified & Code-Grounded)** |

---

## 1. Tujuan dan Panduan untuk AI Agent Berikutnya (ChatGPT)

Paket dokumentasi ini adalah **sumber kebenaran arsitektur antarmuka (*frontend single source of truth*)** yang disiapkan secara menyeluruh agar AI agent atau engineer berikutnya dapat memahami dan mengimplementasikan seluruh arsitektur frontend WorkPulse tanpa perlu menebak logika produk atau membaca ulang berkas prototipe HTML lama yang berserakan.

### Aturan Emas untuk Implementasi:
1. **Patuhi Stack yang Disahkan**:
   - **Framework**: Vue 3 (Composition API dengan `<script setup lang="ts">`).
   - **UI Library**: Vuetify 3 (`vuetify` v4) dengan kustomisasi token terpusat di [src/styles/tokens.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/styles/tokens.ts).
   - **Server State**: TanStack Query v5 (`@tanstack/vue-query`). Jangan menyimpan server state di Pinia!
   - **Client State**: Pinia v4 hanya untuk sesi user ([src/stores/auth.store.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores/auth.store.ts)) dan UI drawer/toasts ([src/stores/ui.store.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores/ui.store.ts)).
   - **Formulir & Validasi**: `vee-validate` v4 dipasangkan dengan schema `zod` v4.
   - **Routing**: Vue Router v5 dengan guards terpusat di [src/router/guards.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/router/guards.ts).
2. **Pisahkan Tiga Sistem Status Independen**:
   - **Daily Status** (GREEN / AMBER / RED): Gunakan [StatusBadge.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/StatusBadge.vue) (pill terisi dengan solid dot).
   - **Submission Timing** (On-Time / Late / No Submission): Gunakan [SubmissionTimingBadge.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/SubmissionTimingBadge.vue) (outlined pill dengan icon).
   - **Blocker Severity** (Low / Med / High / Critical): Gunakan tag severity terpisah.
   - **DILARANG KERAS** menggabungkan warna atau bentuk ketiga sistem status ini!
3. **Pahami Baseline Angka Rekonsiliasi**:
   - **30 Prototipe HTML** dikonsolidasikan ke dalam **16 Komponen Halaman Rute Vue** yang mencakup **23 Unit Spesifikasi Bisnis**, **17 Rute Navigasi**, **12 Tab/Sub-views**, dan **5 Modal Dialog**.

---

## 2. Struktur Berkas & Peta Navigasi Dokumen

Paket handoff ini terorganisir ke dalam struktur berkas berikut:

```text
Design-Artifacts/Frontend-Handoff/
├── README.md                                  <- Dokumen panduan master & ringkasan eksekutif ini
├── 00-Source-Inventory.md                     <- Inventarisasi 100% artefak sumber (PDD, PRD, HTML, API)
├── 01-Legacy-Page-Extraction.md               <- Ekstraksi mendalam 30 berkas HTML lama (DOM, CSS, JS, State)
├── 02-Page-Route-Reconciliation.md            <- Matriks rekonsiliasi 30 HTML <-> 23 Business Units <-> 16 Vue Pages
├── 03-Legacy-to-Final-Design-Diff.md          <- Analisis selisih & conflict register spesifikasi final vs prototipe
├── 04-Frontend-Architecture-and-File-Map.md   <- Peta tanggung jawab file (Shell, Pages, Components, Queries, Stores)
├── 05-Screen-Specifications/                  <- Spesifikasi detail 16 halaman rute fisik (10 dimensi lengkap)
│   ├── PAGE-01-login.md                       <- Spesifikasi Login Page (/login)
│   ├── PAGE-02-reset-password.md              <- Spesifikasi Reset Password Page (/reset-password)
│   ├── PAGE-03-my-today.md                    <- Spesifikasi My Today Page (/today - Core Self-Service Hub)
│   ├── PAGE-04-my-history.md                  <- Spesifikasi My History Page (/history)
│   ├── PAGE-05-notifications.md               <- Spesifikasi Notifications Page (/notifications)
│   ├── PAGE-06-profile.md                     <- Spesifikasi Profile Page (/profile)
│   ├── PAGE-07-my-leave-request.md            <- Spesifikasi Leave Request Page (/today/leave-request)
│   ├── PAGE-08-team-pulse.md                  <- Spesifikasi Team Pulse Hub (/team - 3 Tabs & Modals)
│   ├── PAGE-09-function-pulse.md              <- Spesifikasi Function Pulse Hub (/function - 2 Tabs)
│   ├── PAGE-10-compliance.md                  <- Spesifikasi Compliance & Governance Hub (/compliance - 3 Tabs)
│   ├── PAGE-11-management-pulse.md            <- Spesifikasi Management Pulse Executive Hub (/management)
│   ├── PAGE-12-reports.md                     <- Spesifikasi Reports Hub Page (/reports - 5 Laporan)
│   ├── PAGE-13-project-risk.md                <- Spesifikasi Project Risk View (/my-scope/project-risk)
│   ├── PAGE-14-policy-settings.md             <- Spesifikasi Policy Settings Page (/policy-settings)
│   ├── PAGE-15-admin-users.md                 <- Spesifikasi Admin Master Data Hub (/admin/users - 4 Tabs)
│   └── PAGE-16-not-found.md                   <- Spesifikasi 404 Not Found Page (Wildcard)
├── 06-Shared-Component-Catalog.md             <- Katalog 18 komponen reusable (Badges, Cards, Modals, Utilities)
├── 07-UI-Content-and-Assets.md                <- Inventaris copy bahasa Indonesia, pesan error validasi, dan aset ikon
├── 08-Frontend-Data-and-API-Requirements.md   <- Kebutuhan operasi data dipetakan ke 63 endpoint OpenAPI backend
├── 09-Responsive-and-Accessibility.md         <- Panduan responsive 4 viewport & kepatuhan aksesibilitas WCAG 2.1 AA
├── 10-UI-Test-and-Traceability.md             <- Matriks penelusuran persyaratan, 11 skenario E2E, & checklist pengujian
├── 11-Unresolved-Decisions.md                 <- Register keputusan yang belum disahkan & status quality gate
├── 12-Frontend-Application-Map.md             <- [GROUNDED] Peta arsitektur aplikasi, entry points, layout, dan state
├── 13-Route-and-Page-Composition-Matrix.md    <- [GROUNDED] Matriks rute, komponen tingkat halaman, tabs, dan modals
├── 14-Component-Dependency-Map.md             <- [GROUNDED] Hirarki pohon komponen, dependensi impor, dan matriks reuse
├── 15-Interaction-and-Data-Flow-Map.md        <- [GROUNDED] Pelacakan interaksi end-to-end: Action -> Handler -> API -> UI
├── 16-Frontend-to-API-Mapping.md              <- [GROUNDED] Penyelarasan kontrak frontend ke 63 endpoint OpenAPI
├── 17-Evidence-and-Provenance-Register.md     <- [GROUNDED] Register bukti dan klasifikasi 5 tingkat kepastian
└── 18-Implementation-Readiness-Assessment.md  <- [GROUNDED] Penilaian kesiapan implementasi & celah teknis
```

---

## 3. Langkah Kerja Rekomendasi untuk Agent Pelaksana

Jika Anda ditugaskan untuk mengimplementasikan atau memperbaiki halaman tertentu:
1. **Langkah 1**: Buka [13-Route-and-Page-Composition-Matrix.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/13-Route-and-Page-Composition-Matrix.md) untuk memahami rute, peran yang diizinkan, dan komponen anak yang terlibat.
2. **Langkah 2**: Buka berkas spesifikasi halaman terkait di folder [05-Screen-Specifications/PAGE-XX-<slug>.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/05-Screen-Specifications) dan periksa diagram pohonnya di [14-Component-Dependency-Map.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/14-Component-Dependency-Map.md).
3. **Langkah 3**: Gunakan komponen bersama dari [06-Shared-Component-Catalog.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/06-Shared-Component-Catalog.md) dan token resmi dari [src/styles/tokens.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/styles/tokens.ts).
4. **Langkah 4**: Telusuri interaksi dan mutasi API melalui [15-Interaction-and-Data-Flow-Map.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/15-Interaction-and-Data-Flow-Map.md) dan [16-Frontend-to-API-Mapping.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/16-Frontend-to-API-Mapping.md).
5. **Langkah 5**: Validasi bahwa perilaku mematuhi spesifikasi final dan tidak mengulangi kebiasaan prototipe lama yang telah dinyatakan konflik pada [03-Legacy-to-Final-Design-Diff.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/03-Legacy-to-Final-Design-Diff.md) dan [17-Evidence-and-Provenance-Register.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/17-Evidence-and-Provenance-Register.md).
6. **Langkah 6**: Jalankan pengujian verifikasi berdasarkan [10-UI-Test-and-Traceability.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Frontend-Handoff/10-UI-Test-and-Traceability.md).
