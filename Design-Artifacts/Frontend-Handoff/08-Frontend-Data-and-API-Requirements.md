# 08 — Frontend Data and API Contract Requirements
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-08 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Spesifikasi Kontrak Backend** | OpenAPI 3.0.0 (`backend/openapi.json`, 63 Terkonfirmasi) |
| **Pustaka Data Client** | TanStack Query v5 (`@tanstack/vue-query`) + Axios/Fetch Client |

---

## 1. Ikhtisar Arsitektur Integrasi Data

Komunikasi data antara frontend dan backend WorkPulse didasarkan pada prinsip:
1. **OpenAPI sebagai Kontrak Tunggal**: Semua endpoint dan skema payload yang telah dikonfirmasi mengacu pada `backend/openapi.json`.
2. **Kategori Kontrak**:
   - **CONFIRMED**: Endpoint dan skema telah ada dan terverifikasi di backend OpenAPI.
   - **INFERRED**: Kebutuhan parameter frontend yang diturunkan secara logis dari flow UI/UX.
   - **PROPOSED**: Rekomendasi teknis baru yang memerlukan persetujuan backend architect jika hendak diimplementasikan.
3. **Query Keys & Invalidation Deterministic**: Setiap mutasi sukses memicu invalidasi query keys yang terpengaruh secara otomatis untuk menjaga integritas data lintas tab/komponen.

---

## 2. Matriks Operasi Data & Kontrak API Terkonfirmasi (Confirmed API Contracts)

| Operation ID | Tujuan Operasi | Komponen Pemanggil | Tipe | Method & Endpoint | Request Shape | Response Shape | Query Invalidation Target | Status Kontrak |
|---|---|---|---|---|---|---|---|---|
| **OP-AUTH-01** | Autentikasi Pengguna (Login) | `LoginPage` | Mutation | `POST /api/v1/auth/login` | `{ email, password }` | `{ accessToken, user: { id, email, role, mustResetPassword } }` | Set Pinia session | **CONFIRMED** |
| **OP-AUTH-02** | Ambil Data Profil User Login | `App.vue`, `ProfilePage` | Query | `GET /api/v1/auth/me` | None | `{ id, name, email, nik, role, jobTitle, department, directManager }` | None (Initial load) | **CONFIRMED** |
| **OP-AUTH-03** | Reset Sandi / Ubah Sandi Mandiri | `ResetPasswordPage`, `ProfilePage` | Mutation | `POST /api/v1/auth/reset-password` | `{ currentPassword?, newPassword }` | `{ success: true, message }` | Invalidate `auth/me` | **CONFIRMED** |
| **OP-DAY-01** | Ambil Record Harian Hari Ini | `MyTodayPage` | Query | `GET /api/v1/daily-accountability-records/today` | None | `{ id, date, status, timing, isLocked, commitments: [], additionalWork: [] }` | Cache `['daily', 'today']` | **CONFIRMED** |
| **OP-DAY-02** | Submit Morning Commitment | `MyTodayPage` | Mutation | `POST /api/v1/daily-accountability-records/morning-checkin` | `{ commitments: [{ desc, ref, initialRisk }], hasZeroCommitments, reason }` | `{ id, status, timing: 'OnTime'|'Late', commitments: [] }` | Invalidate `['daily', 'today']` | **CONFIRMED** |
| **OP-DAY-03** | Submit EOD Outcome Check-in | `MyTodayPage` | Mutation | `POST /api/v1/daily-accountability-records/{id}/eod-checkin` | `{ outcomes: [{ commitmentId, outcome, continuation }], tomorrowPriorities: [] }` | `{ id, isClosed: true, dailyStatus }` | Invalidate `['daily', 'today']` | **CONFIRMED** |
| **OP-DAY-04** | Konfirmasi Override Status Suggestion | `ValidationPromptModal` | Mutation | `POST /api/v1/daily-accountability-records/{id}/eod-checkin/confirm-override` | `{ userSelectedStatus, overrideReason }` | `{ success: true, finalStatus }` | Invalidate `['daily', 'today']` | **CONFIRMED** |
| **OP-DAY-05** | Tambah Pekerjaan Ad-hoc | `AdditionalWorkModal` | Mutation | `POST /api/v1/additional-work` | `{ dailyRecordId, description, taskReference, initialRisk }` | `{ id, description, isAdditional: true }` | Invalidate `['daily', 'today']` | **CONFIRMED** |
| **OP-DAY-06** | Query Riwayat Akuntabilitas | `MyHistoryPage`, `TeamPulsePage` | Query | `GET /api/v1/daily-accountability-records` | Params: `{ userId?, startDate, endDate, status? }` | `{ total, items: [DailyRecord] }` | Cache `['daily', 'history', params]` | **CONFIRMED** |
| **OP-BLK-01** | Laporkan Kendala Seketika | `RaiseBlockerModal` | Mutation | `POST /api/v1/blockers` | `{ description, severity, supportNeeded: 'Org'|'Project', taskReference? }` | `{ id, status: 'Open', createdAt }` | Invalidate `['blockers']` | **CONFIRMED** |
| **OP-BLK-02** | Query Antrean Kendala Tim | `TeamPulsePage` (Tab 2), `FunctionPulse` | Query | `GET /api/v1/blockers` | Params: `{ scope?, severity?, status? }` | `{ total, items: [Blocker] }` | Cache `['blockers', params]` | **CONFIRMED** |
| **OP-BLK-03** | Acknowledge Blocker | `BlockerActionModal` | Mutation | `POST /api/v1/blockers/{id}/acknowledge` | None | `{ id, status: 'Acknowledged', supportOwnerId }` | Invalidate `['blockers']` | **CONFIRMED** |
| **OP-BLK-04** | Tandai Blocker Resolved | `BlockerActionModal` | Mutation | `POST /api/v1/blockers/{id}/resolve` | `{ resolutionNote }` | `{ id, status: 'Resolved', resolvedAt }` | Invalidate `['blockers']` | **CONFIRMED** |
| **OP-BLK-05** | Konfirmasi Blocker Closed | `BlockerActionModal` | Mutation | `POST /api/v1/blockers/{id}/close` | None (Reporter only) | `{ id, status: 'Closed', closedAt }` | Invalidate `['blockers']` | **CONFIRMED** |
| **OP-BLK-06** | Terima Risiko Kendala (Accept Risk) | `BlockerActionModal` | Mutation | `POST /api/v1/blockers/{id}/accept-risk` | `{ justification, authorityId }` | `{ id, status: 'AcceptedRisk' }` | Invalidate `['blockers']` | **CONFIRMED** |
| **OP-COR-01** | Pengajuan Koreksi Komitmen | `CorrectionRequestModal` | Mutation | `POST /api/v1/correction-requests` | `{ dailyRecordId, type: 'Morning'|'EOD', proposedChanges, reason }` | `{ id, classification: 'Minor'|'Material', status: 'Pending' }` | Invalidate `['corrections']` | **CONFIRMED** |
| **OP-COR-02** | Sanggahan Koreksi (Object) | `TeamPulsePage` (Tab 3) | Mutation | `POST /api/v1/correction-requests/{id}/object` | `{ objectionReason }` | `{ id, status: 'Rejected' }` | Invalidate `['corrections']` | **CONFIRMED** |
| **OP-EXC-01** | Pengajuan Permohonan Cuti | `MyLeaveRequestPage` | Mutation | `POST /api/v1/exceptions/leave` | `{ leaveType, startDate, endDate, reason, documentUrl? }` | `{ id, status: 'Pending' }` | Invalidate `['exceptions', 'leave']`| **CONFIRMED** |
| **OP-EXC-02** | Penetapan Hari Libur Resmi | `CompliancePage` (Tab 2) | Mutation | `POST /api/v1/exceptions/holiday` | `{ holidayDate, description, isWorkingDayExemption: true }` | `{ id, date, description }` | Invalidate `['exceptions']` | **CONFIRMED** |
| **OP-EXC-03** | Penetapan Dispensasi Pegawai | `CompliancePage` (Tab 2) | Mutation | `POST /api/v1/exceptions/exemption` | `{ userId, exemptionDate, reason, approvedBy }` | `{ id, status: 'Active' }` | Invalidate `['exceptions']` | **CONFIRMED** |
| **OP-NOT-01** | Ambil Daftar Notifikasi User | `NotificationsPage`, `NotificationBell` | Query | `GET /api/v1/notifications` | Params: `{ unreadOnly?: boolean }` | `{ unreadCount, items: [Notification] }`| Cache `['notifications']` | **CONFIRMED** |
| **OP-NOT-02** | Tandai Notifikasi Telah Dibaca | `NotificationsPage` | Mutation | `POST /api/v1/notifications/{id}/mark-read` | None | `{ success: true }` | Invalidate `['notifications']` | **CONFIRMED** |
| **OP-POL-01** | Ambil Nilai 7 Kategori Kebijakan | `PolicySettingsPage` | Query | `GET /api/v1/policies` | None | `{ policies: [{ category, key, value, effectiveFrom }] }` | Cache `['policies']` | **CONFIRMED** |
| **OP-POL-02** | Perbarui Parameter Kebijakan | `PolicySettingsPage` | Mutation | `POST /api/v1/policies` | `{ category, key, value, effectiveFrom? }` | `{ id, version, updatedBy }` | Invalidate `['policies']` | **CONFIRMED** |
| **OP-REP-01** | Query Laporan Operasional | `ReportsPage` | Query | `GET /api/v1/reports/{reportType}` | Params: `{ startDate, endDate, teamId?, departmentId? }` | `{ reportType, generatedAt, data: [] }` | Cache `['reports', type, params]`| **CONFIRMED** |
| **OP-REP-02** | Unduh Berkas Ekspor Laporan | `ReportsPage` (`ExportButton`) | Query/Blob | `GET /api/v1/reports/{reportType}/export` | Params: `{ format: 'csv'|'xlsx', filters }` | Binary Stream / Blob (`text/csv`) | None (Direct Download) | **CONFIRMED** |

---

## 3. Penanganan State Jaringan & Kesalahan (Resilience & Error Handling)

1. **Retry Policy**: TanStack Query dikonfigurasi dengan retry 1 kali untuk query idempotente (GET) dan 0 retry untuk mutasi (POST/PATCH) guna menghindari mutasi ganda yang tidak diinginkan.
2. **Normalisasi Error**: Composable `useApiError.ts` mengekstrak error response standar NestJS (`{ statusCode, message, error }`) dan menyajikan feedback dalam bahasa Indonesia.
3. **Optimistic Updates**: Diterapkan secara selektif pada penandaan notifikasi telah dibaca (`mark-read`) untuk memberikan sensasi respons seketika (*instant response*).
