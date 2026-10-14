# 04 — Frontend Architecture and File Responsibility Map
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-04 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Pemetaan** | 11 Oktober 2026 |
| **Teknologi Utama** | Vue 3, TypeScript, Vite, Vuetify 3, Pinia, Vue Router, TanStack Query, vee-validate, Zod |
| **Status Repositori** | Terverifikasi terhadap basis kode aktual di `frontend/src/` |

---

## 1. Ikhtisar Arsitektur Frontend WorkPulse

Frontend WorkPulse dibangun sebagai **Single-Page Application (SPA)** enterprise yang berorientasi pada kecepatan interaksi pengguna, pemisahan tanggung jawab yang ketat (*separation of concerns*), kejelasan tipe domain (*strong typing*), serta ketahanan terhadap kegagalan jaringan (*resilient caching & offline awareness*).

Prinsip arsitektural utama yang wajib dipatuhi:
1. **Server State vs Client State**: Seluruh data yang berasal dari server (komitmen, blocker, catatan, profil, kebijakan) dikelola secara eksklusif menggunakan **TanStack Query** (`@tanstack/vue-query`). **Pinia** HANYA digunakan untuk state sesi client lokal (otentikasi, token akses, preferensi UI drawer/sidebar, notifikasi toast temporer).
2. **Form Management & Validasi**: Semua formulir menggunakan **vee-validate** yang dipasangkan dengan schema **Zod** (`@vee-validate/zod`). Validasi dilakukan inline dengan pesan kesalahan berbasis bahasa Indonesia yang ramah pengguna.
3. **Komposisi Komponen**: Komponen halaman (`pages/*.vue`) bertindak sebagai orkestrator (container) yang menghubungkan rute, guard, dan query server ke komponen presentasional modular di `components/`.

---

## 2. Peta Tanggung Jawab Berkas (File Responsibility Map)

Berikut adalah pemetaan kategori file, membedakan secara tegas antara **Struktur Aktual di Repositori** dan **Rekomendasi Arsitektur**:

### A. Application Shell & Layouts
| File Path | Status Keberadaan | Tanggung Jawab Utama | Ketergantungan | Data Masuk & Keluar | Hal yang Dilarang Ditempatkan |
|---|---|---|---|---|---|
| `frontend/src/App.vue` | **AKTUAL** | Root application instance, host layout shell, provider tema Vuetify, host global toast/snackbar dan modal mengambang. | `vue-router`, `v-app`, `v-main`, `tokens.ts` | Masuk: Global route state. Keluar: Rendered DOM tree. | Logika bisnis fitur, pemanggilan API langsung, state formulir. |
| `frontend/src/components/shared/ActionPanel.vue` | **AKTUAL** | Panel aksi kontekstual untuk tombol aksi cepat dan transisi status siklus hidup. | `tokens.ts`, `v-btn` | Masuk: Action descriptors & permissions. Keluar: Event emits (`action-triggered`). | Form fields masukan teks, query data server. |

### B. Route-Level Pages (`frontend/src/pages/`)
Setiap file di direktori ini merepresentasikan satu rute spesifik yang didaftarkan pada Vue Router:
| File Path | Status Keberadaan | Tanggung Jawab Utama | Ketergantungan | Data Masuk & Keluar | Hal yang Dilarang Ditempatkan |
|---|---|---|---|---|---|
| `LoginPage.vue` | **AKTUAL** | Antarmuka login mandiri, validasi kredensial, pemanggilan `authStore.login()`. | `vee-validate`, `zod`, `auth.store` | Masuk: User input. Keluar: JWT token & redirect. | Business logic manajemen user atau dashboard. |
| `ResetPasswordPage.vue` | **AKTUAL** | Antarmuka ganti sandi wajib pertama kali atau lupa sandi. | `vee-validate`, `zod`, API auth | Masuk: Password baru & token. Keluar: Konfirmasi sukses. | Data operasional selain keamanan akun. |
| `MyTodayPage.vue` | **AKTUAL** | Self-Service Hub: Orkestrasi Morning Commitment, EOD Outcome, Ad-hoc work modal, dan Raise Blocker. | `useDailyRecords`, `CommitmentCard` | Masuk: Daily accountability record. Keluar: Check-in payload. | Logika review approval atau role supervisor. |
| `MyHistoryPage.vue` | **AKTUAL** | Tampilan riwayat akuntabilitas harian dan ringkasan mingguan mandiri. | `useDailyRecords`, `FilterBar` | Masuk: Rentang tanggal. Keluar: Filtered record history. | Form submission komitmen hari ini. |
| `NotificationsPage.vue` | **AKTUAL** | Pusat notifikasi in-app untuk 13 pemicu bisnis sistem. | `useNotifications`, `v-list` | Masuk: Notification list. Keluar: Mark-read mutations. | Konfigurasi kanal admin notifikasi. |
| `ProfilePage.vue` | **AKTUAL** | Tampilan profil pengguna, NIK, jabatan, atasan langsung, dan ubah sandi mandiri. | `useProfile`, `auth.store` | Masuk: User profile data. Keluar: Update password payload. | Pengubahan role pengguna (hanya di Admin). |
| `MyLeaveRequestPage.vue` | **AKTUAL** | Formulir mandiri pengajuan cuti dan log riwayat status izin. | `useExceptions`, `vee-validate` | Masuk: Leave balance & history. Keluar: Leave application. | Tombol approve/reject (hanya untuk reviewer/HRGA). |
| `TeamPulsePage.vue` | **AKTUAL** | Dashboard tim (Tab 1: Roster Tim, Tab 2: Blocker Queue, Tab 3: Review Koreksi/Cuti). | `useDailyRecords`, `useBlockers` | Masuk: Team scope records. Keluar: Review/Acknowledge mutation. | Pengaturan kebijakan atau administrasi user. |
| `FunctionPulsePage.vue` | **AKTUAL** | Dashboard departemen (Tab 1: Roster Fungsi, Tab 2: Eskalasi Lintas Tim). | `useDailyRecords`, `useBlockers` | Masuk: Function-scoped data. Keluar: Escalate/Assign mutation. | Detail check-in mentah per individu karyawan. |
| `CompliancePage.vue` | **AKTUAL** | Governance Hub HRGA (Tab 1: Kepatuhan No-Submission, Tab 2: Pengecualian & Libur, Tab 3: Rekam SP). | `useCompliance`, `useExceptions` | Masuk: Violation events & exemptions. Keluar: SP mutation. | Check-in harian atau pengisian tugas pribadi. |
| `ManagementPulsePage.vue` | **AKTUAL** | Executive Hub (Tab 1: Pulse Overview Lintas Divisi, Tab 2: Escalation Aging SLA). | `useReporting`, `useBlockers` | Masuk: Executive summaries. Keluar: Read-only filter. | Tombol eksekusi operasional mikro tingkat tim. |
| `ReportsPage.vue` | **AKTUAL** | Pusat 5 laporan operasional terpadu & engine ekspor CSV/Excel. | `useReporting`, `ExportButton` | Masuk: Report type & params. Keluar: Rendered table & Blob download. | Form input transaksi harian. |
| `ProjectRiskPage.vue` | **AKTUAL** | Agregasi pasif komitmen dan kendala berbasis referensi proyek untuk PM. | `useDailyRecords`, `useBlockers` | Masuk: Project tag parameter. Keluar: Filtered risk list. | Persetujuan cuti atau koreksi komitmen. |
| `PolicySettingsPage.vue` | **AKTUAL** | Pengaturan parameter tata tertib kerja multi-kategori oleh Authorized Owners. | `usePolicies`, `vee-validate` | Masuk: Current policy parameters. Keluar: Updated policy. | Modifikasi data pengguna atau role assignment. |
| `AdminUsersPage.vue` | **AKTUAL** | Master Administrasi (Tab 1: Users/Roles, Tab 2: Org Mapping, Tab 3: Temp Reviewer, Tab 4: Notifications). | `useUsers`, `AdminOrganizationTab` | Masuk: Master users & mappings. Keluar: Master mutations. | Tampilan pelaporan operasional harian. |
| `NotFoundPage.vue` | **AKTUAL** | Halaman fallback 404 ramah pengguna saat rute tidak ditemukan. | `tokens.ts`, `v-btn` | Masuk: None. Keluar: Link navigasi kembali. | Logika bisnis atau permintaan data backend. |

### C. Shared Components (`frontend/src/components/shared/`)
Komponen murni presentasional yang dapat digunakan kembali lintas halaman:
| File Path | Status | Tanggung Jawab | Props Utama | Emits Utama |
|---|---|---|---|---|
| `StatusBadge.vue` | **AKTUAL** | Menampilkan Daily Status (GREEN / AMBER / RED) berbentuk pill terisi dengan dot solid. | `status: DailyStatus`, `dense?: boolean` | None (Display only) |
| `SubmissionTimingBadge.vue` | **AKTUAL** | Menampilkan waktu pengisian (On-Time / Late / No Submission) berbentuk outline pill + icon. | `timing: SubmissionTiming`, `submittedAt?: string` | None (Display only) |
| `CommitmentCard.vue` | **AKTUAL** | Kartu item komitmen atau additional work, menampilkan text, initial risk, outcome control, continuation control. | `item: CommitmentItem`, `readOnly?: boolean`, `isAdditional?: boolean` | `update:outcome`, `update:continuation` |
| `BlockerCard.vue` | **AKTUAL** | Kartu ringkasan kendala kerja, tingkat severity, kebutuhan dukungan (Org/Project), dan status saat ini. | `blocker: Blocker`, `compact?: boolean` | `click`, `action` |
| `AuthorityTag.vue` | **AKTUAL** | Tag visual penanda kewenangan dukungan blocker (Organisasi vs Proyek). | `authority: 'Org' | 'Project'` | None |
| `ClassificationTag.vue` | **AKTUAL** | Tag klasifikasi koreksi komitmen (Minor = Slate, Material = Sky Blue). | `type: 'Minor' | 'Material'` | None |
| `ObjectionWindowIndicator.vue` | **AKTUAL** | Chip countdown waktu tenggang sanggahan (48 jam) menggunakan JetBrains Mono. | `expiresAt: string` | `expired` |
| `NotificationBell.vue` | **AKTUAL** | Tombol lonceng di navbar dengan badge hitungan notifikasi belum dibaca. | `count: number` | `click` |
| `FilterBar.vue` | **AKTUAL** | Bilah filter terpadu dengan pencarian teks, dropdown status, dan date range picker. | `modelValue: FilterState`, `config: FilterConfig` | `update:modelValue`, `reset` |
| `ExportButton.vue` | **AKTUAL** | Tombol pemicu ekspor data ke file CSV atau Excel dengan loading state. | `reportType: string`, `params: object` | `export-start`, `export-complete` |

### D. Data, State, & API Query Layer (`frontend/src/queries/`)
| File Path | Status | Tanggung Jawab Query & Mutasi TanStack Query |
|---|---|---|
| `useDailyRecords.ts` | **AKTUAL** | Query record harian (`/today`, `/records`), mutasi Morning check-in, mutasi EOD check-in, override confirmation. |
| `useBlockers.ts` | **AKTUAL** | Query blocker list, query blocker detail, mutasi raise, acknowledge, update, resolve, close, accept-risk. |
| `useCompliance.ts` | **AKTUAL** | Query pelanggaran kepatuhan (`/compliance-events`), mutasi coach note, warning letter SP, eskalasi formal. |
| `useCorrectionRequests.ts`| **AKTUAL** | Query pengajuan koreksi, mutasi submit koreksi, mutasi sanggahan/objection. |
| `useExceptions.ts` | **AKTUAL** | Query libur dan cuti, mutasi pengajuan cuti, mutasi pembuatan hari libur & dispensasi, mutasi approve/reject. |
| `useManagerNotes.ts` | **AKTUAL** | Query catatan manajerial, mutasi pembuatan coaching note privat. |
| `useNotifications.ts` | **AKTUAL** | Query daftar notifikasi pengguna, mutasi tandai telah dibaca tunggal atau massal. |
| `usePolicies.ts` | **AKTUAL** | Query parameter 7 kategori kebijakan, mutasi pembaruan nilai kebijakan, query riwayat versi. |
| `useProfile.ts` | **AKTUAL** | Query profil karyawan login (`/auth/me`), mutasi pembaruan kata sandi. |
| `useReporting.ts` | **AKTUAL** | Query 5 laporan operasional, query ringkasan eksekutif, ekspor data stream blob. |
| `useUsers.ts` | **AKTUAL** | Query master user, mutasi create user, update role, pemetaan organisasi, temporary reviewer. |

### E. Client-Side Stores (`frontend/src/stores/`)
| File Path | Status | Tanggung Jawab Terbatas (Hanya Client State) |
|---|---|---|
| `auth.store.ts` | **AKTUAL** | Token JWT di memory/storage, status login, peran aktif pengguna, fungsi `hasRole()`. |
| `ui.store.ts` | **AKTUAL** | State drawer sidebar (buka/tutup), toast/snackbar notifications antrean, tema aktif. |

---

## 3. Anti-Patterns yang Wajib Dihindari

1. **Monolithic Page Component**: Dilarang menggabungkan seluruh form, dialog, tabel, dan manipulasi data di dalam satu file `.vue` tanpa dekomposisi komponen.
2. **Duplikasi Business Logic**: Dilarang menuliskan logika kalkulasi status (misal Initial Daily Status GREEN/AMBER/RED) di halaman Vue; logika harus berada di modul utility terpusat (`daily-records.constants.ts` atau composable).
3. **Penyimpanan Server State di Pinia**: Dilarang menduplikasi cache data API ke dalam state Pinia. Semua data server harus mengalir melalui TanStack Query.
4. **Penyimpanan Kredensial & Secrets**: Dilarang menyimpan API secrets, admin credentials, atau environment private variables di sisi client.
5. **Insecure Content Rendering**: Dilarang menggunakan `v-html` pada konten catatan atau deskripsi yang diinputkan pengguna untuk mencegah serangan XSS.
