# S3-T2 Independent Verification & Finding Triage

## 1. Executive Summary

Laporan ini menyajikan hasil **Independent Verification & Finding Triage** terhadap temuan audit frontend pada tahapan **S3-T2 — Frontend Coverage & Data-Source Audit**.
Verifikasi independen ini diselenggarakan secara ketat di bawah prinsip **READ-ONLY / AUDIT-ONLY / ZERO-MUTATION**. Tidak ada kode produksi frontend, backend, skema data, migrasi, maupun suite pengujian yang diubah atau direkayasa selama pelaksanaan triage ini.

Tujuan utama dari triage ini adalah menguji secara kritis setiap klaim temuan dari laporan audit S3-T2 sebelumnya (`Design-Artifacts/Reports/S3-T2-Frontend-Coverage-Data-Source-Audit-Report.md`), menelusuri rantai pemanggilan kode sumber (*source code call stack*) hingga ke controller backend dan DTO, mengonfirmasi reprodusibilitas temuan, mengevaluasi jangkauan runtime produksi (*production reachability*), mengukur dampak riil terhadap bisnis dan pengguna, serta merumuskan batasan cakupan remediasi (*remediation boundary*) yang presisi untuk fase perbaikan berikutnya.

### Ringkasan Hasil Triage Kunci:
1. **S3-T2-DEF-01 (Correction Request Endpoint)**: **CONFIRMED — BLOCKING**. Pemanggilan frontend diarahkan ke endpoint yang tidak eksis di backend (`POST /commitments/:id/request-correction` vs `POST /api/v1/correction-requests`), dengan struktur DTO yang juga tidak kompatibel. Alur pengajuan koreksi komitmen terkunci gagal total dengan HTTP 404 pada runtime.
2. **S3-T2-DEF-02 (Notification Mark-as-Read Endpoint)**: **CONFIRMED — BLOCKING**. Pemanggilan frontend menggunakan HTTP method dan path yang salah (`PATCH /notifications/:id/read` & `PATCH /notifications/read-all` vs `POST /api/v1/notifications/:id/mark-read` & `POST /notifications/mark-all-read`). Selain itu, kegagalan 404 pada `NotificationsPage.vue` diserap secara diam-diam (*silent catch*), mengakibatkan notifikasi tampak berhasil diklik namun status *unread* tetap permanen di backend.
3. **S3-T2-DEF-03 (Reporting Individual Evidence Endpoint)**: **CONFIRMED — HIGH / NON-BLOCKING**. Frontend mengirim `userId` via query parameter (`?userId=...`) padahal backend router mengharapkan path parameter (`:userId`). Fitur review bukti individual pada tab laporan menghasilkan HTTP 404.
4. **S3-T2-DEF-04 (Reporting Export Endpoint)**: **CONFIRMED — HIGH / NON-BLOCKING**. Frontend mengirim request `POST /reports/export` dengan JSON body padahal backend controller mengekspos `GET /reports/:reportType/export` dengan query parameter `format`. Aksi ekspor laporan operasional menghasilkan HTTP 404.
5. **S3-T2-DEF-05 (MyHistory Export No-Op)**: **CONFIRMED — MEDIUM / NON-BLOCKING**. Komponen `ExportButton` di-render pada `MyHistoryPage.vue` tanpa listener `@export`, sehingga opsi unduhan CSV/XLSX menjadi *no-op*, bertentangan dengan mandat eksplisit UI/UX Spec §4.6.
6. **S3-T2-GAP-01 (ProfilePage Hardcoded Policy Card)**: **CONFIRMED — LOW / NON-BLOCKING GAP**. Kartu *Kebijakan Kerja Berlaku* merender string statis ("09:30 WIB", "18:00 WIB", "24 Jam") dan belum memanfaatkan hook reaktif `useActivePoliciesQuery()`. Bersifat informatif dan tidak mengganggu transaksi data.
7. **S3-T2-GAP-02 (9 Pages Lacking Isolated Spec Files)**: **CONFIRMED — MEDIUM / NON-BLOCKING TEST GAP**. Sembilan halaman manajemen dan self-service belum memiliki file pengujian komponen terisolasi (`.spec.ts`) di `frontend/tests/`, meskipun 91 pengujian yang ada saat ini lulus 100% dan build produksi berhasil tanpa error.
8. **S3-T2-GAP-03 (Responsive Visual Evidence)**: **CONFIRMED — CARRYOVER TO S3-T4**. Bukti antarmuka responsif multi-resolusi (`S2-T5-EVID-01`) tetap merupakan gap bukti terbuka yang menjadi hak milik tahapan **S3-T4**.
9. **Git Mutation Integrity**: **PASS (Zero modified production files)**.

Berdasarkan konfirmasi independen terhadap 2 defek blocking inti pada alur kerja pengguna (`DEF-01` dan `DEF-02`), vonis triage resmi adalah:

> **TRIAGE VERIFIED — REMEDIATION REQUIRED**

---

## 2. Verification Objective

Tujuan verifikasi independen ini meliputi:
1. Membuktikan secara objektif apakah setiap temuan merupakan defek riil (*real defect*), kesenjangan bukti (*evidence gap*), kesenjangan pengujian (*test gap*), atau kesalahan interpretasi (*false positive*).
2. Memeriksa ketersediaan lapisan adapter, middleware, atau URL rewrite yang mungkin menjembatani perbedaan endpoint sebelum menyimpulkan kegagalan.
3. Menilai dampak bisnis dari masing-masing temuan berdasarkan hierarki fungsional WorkPulse (Core Daily Accountability vs Secondary Reporting & Settings).
4. Menegakkan kepatuhan terhadap dokumen spesifikasi arsitektur (SAD, PRD, UI-UX Spec, PDD).
5. Menyusun rencana remediasi dan strategi uji regresi tanpa melakukan intervensi atau modifikasi kode apa pun pada fase ini.

---

## 3. Governing Sources

Dokumen otoritatif yang menjadi acuan pengujian dan rekonsiliasi:

1. [01-PDD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/01-PDD.md): Prinsip non-intrusif, batasan transparansi, tata kelola akuntabilitas kerja.
2. [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/02-PRD.md): Kebutuhan fungsional FR-01 s/d FR-50, aturan cutoff, larangan leaderboard individu (AC-16), dan kewenangan pelaporan.
3. [03-UI-UX Spec & Flow Document.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/03-UI-UX%20Spec%20&%20Flow%20Document.md):
   - §4.6 (My History & Weekly Summary): Klausul ketersediaan `ExportButton` untuk riwayat evidence personal.
   - §4.7 (Web Notification Center): Alur interaksi notifikasi dan deep linking.
   - §4.16 (Correction Request): Alur pengajuan koreksi komitmen pasca cutoff.
4. [05-SAD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/05-SAD.md):
   - §7.1: Base URL `/api/v1` & Versioning.
   - §9.6: Correction Request Lifecycle & Classification.
   - §10.5: CorrectionRequestModule API Specification (`POST /api/v1/correction-requests`).
   - §10.10: NotificationModule API Specification (`POST /api/v1/notifications/{id}/mark-read`, `POST /api/v1/notifications/mark-all-read`).
   - §10.11: ReportingModule API Specification (`GET /api/v1/reports/individual-evidence/{userId}`, `GET /api/v1/reports/{reportType}/export`).
   - §12.1: Notification Channel Matrix & Trigger Inventory.
   - §16.3: State Management Boundaries (Pinia vs TanStack Query).
5. [08-ADR.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/08-ADR.md): ADR-002 (Temporary Reviewer) & ADR-016 (Role-Based Output Prompts).
6. [09-Known-Limitations.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/09-Known-Limitations.md): Batasan rilis MVP yang disepakati.
7. [S3-T2-Frontend-Coverage-Data-Source-Audit-Report.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/Reports/S3-T2-Frontend-Coverage-Data-Source-Audit-Report.md): Laporan klaim audit awal.

---

## 4. Git Baseline

Verifikasi integritas Git sebelum pelaksanaan triage:

```bash
git status --porcelain -uall
git diff --stat -- backend/src backend/prisma/schema.prisma backend/prisma/migrations frontend package-lock.json
```

Hasil verifikasi:
- Repositori bersih dari mutasi yang tidak tercatat.
- Modifikasi yang ada pada working tree merupakan artefak resmi dari tahapan sebelumnya (S2 remediation dan S3-T1 DEF-01 Option C remediation).
- Triage dijalankan secara strictly **READ-ONLY**.

---

## 5. S3-T2 Initial Findings

Laporan audit S3-T2 sebelumnya mengajukan 8 temuan utama:
1. `S3-T2-DEF-01`: Correction Request API Mapping Mismatch (`POST /commitments/:id/request-correction`).
2. `S3-T2-DEF-02`: Notification Mark-as-Read API Mapping Mismatch & Silent Swallow (`PATCH /notifications/:id/read`).
3. `S3-T2-DEF-03`: Reporting Individual Evidence Parameter Mismatch (`GET /reports/individual-evidence?userId=...`).
4. `S3-T2-DEF-04`: Reporting Export Method & Path Mismatch (`POST /reports/export`).
5. `S3-T2-DEF-05`: MyHistory ExportButton No-Op.
6. `S3-T2-GAP-01`: Hardcoded Policy Values pada `ProfilePage.vue`.
7. `S3-T2-GAP-02`: 9 Halaman Belum Memiliki Isolated Spec File.
8. `S3-T2-GAP-03`: Responsive Visual Evidence Carryover (`S2-T5-EVID-01`).

---

## 6. DEF-01 Verification

### Klaim Audit:
`frontend/src/api/daily-records.api.ts` (lines 83–93) memanggil `POST /commitments/:id/request-correction`, sedangkan backend mengekspos `POST /api/v1/correction-requests`.

### Bukti Kode Sumber Aktual:
1. **Frontend Method** (`frontend/src/api/daily-records.api.ts` lines 83–93):
   ```typescript
   async requestCorrection(
     payload: CorrectionRequestPayload,
   ): Promise<ApiResponse<unknown>> {
     return apiClient.post(
       `/commitments/${payload.commitmentId}/request-correction`,
       {
         proposedDescription: payload.proposedDescription,
         reason: payload.reason,
       },
     );
   }
   ```
2. **Caller Stack**:
   - `MyTodayPage.vue` -> Tombol "Ajukan Koreksi" -> membuka `CorrectionRequestModal.vue`.
   - `CorrectionRequestModal.vue` (line 120): `const { mutateAsync: requestCorrection } = useCorrectionRequestMutation()`.
   - `useDailyRecords.ts` (line 119): `dailyRecordsApi.requestCorrection(payload)`.
3. **Backend Controller** (`backend/src/modules/correction-request/controllers/correction-request.controller.ts` lines 23–40):
   ```typescript
   @ApiTags('CorrectionRequest')
   @Controller('correction-requests')
   export class CorrectionRequestController {
     @Post()
     @HttpCode(HttpStatus.CREATED)
     async create(
       @CurrentUser() user: CurrentUserPayload,
       @Body() dto: CreateCorrectionRequestDto,
     ) { ... }
   }
   ```
4. **Backend DTO** (`backend/src/modules/correction-request/dto/create-correction-request.dto.ts` lines 9–22):
   ```typescript
   export class CreateCorrectionRequestDto {
     @IsUUID('4') targetCommitmentId!: string;
     @IsObject() requestedChange!: Record<string, any>;
     @IsString() @MaxLength(2000) reason!: string;
   }
   ```
5. **Backend Commitment Controller** (`backend/src/modules/daily-accountability/controllers/commitment.controller.ts` lines 20–42):
   Hanya memiliki satu route decorator: `@Patch(':id')`. Tidak ada sub-route `request-correction` yang terdaftar pada NestJS router.
6. **URL Resolution & Adapter Check**:
   Base URL pada `apiClient` adalah `/api/v1`. Request dikirim ke `POST /api/v1/commitments/:id/request-correction`. Tidak ada URL rewrite, middleware, atau alias controller untuk path ini. Express router mengembalikan HTTP 404 Not Found secara deterministik.

### Analisis Ketidakcocokan Kontrak:
Terdapat **ketidakcocokan ganda**:
1. **Path & Method**: Frontend memanggil sub-resource `/commitments/:id/request-correction`, sedangkan arsitektur SAD §10.5 dan backend controller menetapkan root endpoint `POST /correction-requests`.
2. **Payload Structure**: Frontend mengirim `{ proposedDescription, reason }`, sedangkan DTO backend mewajibkan `{ targetCommitmentId, requestedChange, reason }` di mana `requestedChange` adalah JSON object perubahannya (misalnya `{ text: proposedDescription }`).

### Kesimpulan Triage:
- **Real?**: **YES**
- **Reproducible?**: **YES (Static Contract & Routing Trace)**
- **Production Reachable?**: **YES** (Setiap pengguna yang mengajukan koreksi komitmen terkunci dari beranda kerja)
- **Feature In Scope?**: **YES** (Core flow, PRD FR-43, SAD §9.6, §10.5)
- **User / Business Impact**: **HIGH / CRITICAL** (Alur komitmen terkunci pasca-cutoff tidak dapat dikoreksi oleh karyawan; request gagal dengan status 404)
- **Severity**: **BLOCKING**
- **Triage Status**: **CONFIRMED — BLOCKING**

---

## 7. DEF-02 Verification

### Klaim Audit:
`frontend/src/api/notifications.api.ts` (lines 28–37) memanggil `PATCH /notifications/:id/read` dan `PATCH /notifications/read-all`, sedangkan backend menyediakan `POST /notifications/:id/mark-read` dan `POST /notifications/mark-all-read`. Error diserap diam-diam pada `NotificationsPage.vue`.

### Bukti Kode Sumber Aktual:
1. **Frontend Method** (`frontend/src/api/notifications.api.ts` lines 28–37):
   ```typescript
   async markAsRead(id: string): Promise<ApiResponse<NotificationItem>> {
     return apiClient.patch<NotificationItem>(`/notifications/${id}/read`, {});
   }
   async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
     return apiClient.patch<{ count: number }>('/notifications/read-all', {});
   }
   ```
2. **Caller Stack**:
   - `NotificationsPage.vue` (lines 172–179):
     ```typescript
     async function handleClickNotification(item: NotificationItem) {
       if (item.status === 'Sent' || item.status === 'Pending') {
         try {
           await markAsRead(item.id);
         } catch {
           // Abaikan error background mark read
         }
       }
       if (item.payload?.linkPath) {
         router.push(item.payload.linkPath);
       }
     }
     ```
   - `NotificationsPage.vue` (lines 186–192):
     ```typescript
     async function handleMarkAllRead() {
       try {
         await markAllRead();
       } catch (err) {
         console.error('Gagal menandai semua dibaca:', err);
       }
     }
     ```
3. **Backend Controller** (`backend/src/modules/notification/notification.controller.ts` lines 37–54):
   ```typescript
   @Post(':id/mark-read')
   @HttpCode(HttpStatus.OK)
   async markRead(...) { ... }

   @Post('mark-all-read')
   @HttpCode(HttpStatus.OK)
   async markAllRead(...) { ... }
   ```
4. **Perbandingan dengan Komponen Lain**:
   Komponen `NotificationBell.vue` (baris 141) secara independen memanggil endpoint yang benar:
   `await apiClient.post('notifications/${item.id}/mark-read');`.
   Namun halaman utama `NotificationsPage.vue` yang menggunakan hook `useNotifications.ts` dan `notifications.api.ts` memanggil rute PATCH yang keliru.

### Analisis Perilaku Antarmuka:
- Saat pengguna mengklik notifikasi pada halaman Notifikasi, `markAsRead` mengirim `PATCH /api/v1/notifications/:id/read` -> Backend Express mengembalikan HTTP 404.
- Blok `try-catch` baris 176 menyerap error tanpa memberikan peringatan visual dan langsung mengeksekusi navigasi `router.push(item.payload.linkPath)`.
- Akibatnya, notifikasi terlihat seolah-olah diproses, namun di database PostgreSQL record notifikasi tetap berstatus `Sent` (belum dibaca). Angka `unreadCount` pada navbar lonceng tidak berkurang.

### Kesimpulan Triage:
- **Real?**: **YES**
- **Reproducible?**: **YES (Static Contract & Code Inspection)**
- **Production Reachable?**: **YES** (Pusat notifikasi web resmi pengguna)
- **Feature In Scope?**: **YES** (SAD §10.10, §12.1)
- **User / Business Impact**: **HIGH** (Pengguna tidak dapat membersihkan atau menandai notifikasi dibaca dari halaman notifikasi; kegagalan disembunyikan oleh silent error handling)
- **Severity**: **BLOCKING**
- **Triage Status**: **CONFIRMED — BLOCKING**

---

## 8. DEF-03 Verification

### Klaim Audit:
`frontend/src/api/reporting.api.ts` (lines 75–85) memanggil `GET /reports/individual-evidence?userId=...` (query param) sedangkan backend mengekspos path param `GET /reports/individual-evidence/:userId`.

### Bukti Kode Sumber Aktual:
1. **Frontend Method** (`frontend/src/api/reporting.api.ts` lines 75–85):
   ```typescript
   async getIndividualEvidence(params: {
     userId: string;
     startDate: string;
     endDate: string;
   }): Promise<ApiResponse<IndividualEvidenceReport>> {
     const qs = buildQueryString(params);
     return apiClient.get<IndividualEvidenceReport>(`/reports/individual-evidence${qs}`);
   }
   ```
2. **Caller Stack**:
   - `ReportsPage.vue` (lines 544–548) -> Tab 4 "Review Bukti Individual" memanggil `useIndividualEvidenceQuery(() => ({ userId: selectedEmployeeId.value, startDate: ..., endDate: ... }))`.
3. **Backend Controller** (`backend/src/modules/reporting/controllers/reporting.controller.ts` lines 80–90):
   ```typescript
   @Get('individual-evidence/:userId')
   async getIndividualEvidence(
     @CurrentUser() user: CurrentUserPayload,
     @Param('userId') targetUserId: string,
     @Query() query: IndividualEvidenceQueryDto,
   ) { ... }
   ```
4. **Spesifikasi SAD §10.11 Table** (line 1217):
   `GET /api/v1/reports/individual-evidence/{userId}` dengan request query parameter `dateRange`.
5. **URL Resolution**:
   Frontend membentuk URL: `GET /api/v1/reports/individual-evidence?userId=...&startDate=...&endDate=...`.
   NestJS controller hanya mendaftarkan rute dengan segmen path parameter `:userId`. Request tanpa segmen path `:userId` tidak cocok dengan route pattern Express dan menghasilkan HTTP 404 Not Found.

### Kesimpulan Triage:
- **Real?**: **YES**
- **Reproducible?**: **YES**
- **Production Reachable?**: **YES** (Tab 4 Review Bukti Individual pada ReportsPage)
- **Feature In Scope?**: **YES** (PRD §9, SAD §10.11, §13.6)
- **User / Business Impact**: **MEDIUM** (Manajer/HR tidak dapat memuat rincian bukti individual karyawan tertentu di halaman laporan)
- **Severity**: **HIGH / NON-BLOCKING** (Fitur pelaporan sekunder; alur check-in dan operasional utama harian tetap berjalan)
- **Triage Status**: **CONFIRMED — HIGH / NON-BLOCKING**

---

## 9. DEF-04 Verification

### Klaim Audit:
`frontend/src/api/reporting.api.ts` (lines 99–103) memanggil `POST /reports/export` dengan JSON payload, sedangkan backend mengekspos `GET /reports/:reportType/export?format=...`.

### Bukti Kode Sumber Aktual:
1. **Frontend Method** (`frontend/src/api/reporting.api.ts` lines 99–103):
   ```typescript
   async exportReport(payload: ExportReportPayload): Promise<ApiResponse<ExportReportResponse>> {
     return apiClient.post<ExportReportResponse>('/reports/export', payload);
   }
   ```
2. **Caller Stack**:
   - `ReportsPage.vue` (lines 559–589) -> Tombol `ExportButton` pada setiap tab memanggil `triggerExport(reportType, fmt)` -> `exportMutation.mutateAsync(payload)`.
3. **Backend Controller** (`backend/src/modules/reporting/controllers/reporting.controller.ts` lines 106–116):
   ```typescript
   @Get(':reportType/export')
   async exportReport(
     @CurrentUser() user: CurrentUserPayload,
     @Param('reportType') reportType: string,
     @Query() query: ExportReportQueryDto,
   ) { ... }
   ```
4. **Backend DTO** (`backend/src/modules/reporting/dto/export-report-query.dto.ts` lines 3–31):
   Mewajibkan parameter query: `format: 'pdf' | 'xlsx'`, beserta query filter tanggal opsional (`date`, `weekStart`, `month`, `startDate`, `endDate`, `userId`).
5. **Spesifikasi SAD §10.11 Table** (line 1219):
   `GET /api/v1/reports/{reportType}/export` role sesuai report terkait, request query `format=pdf|xlsx`, response Signed URL file.

### Analisis Perilaku Antarmuka:
- Mengklik opsi ekspor PDF atau XLSX pada tab mana pun di `ReportsPage.vue` mengirimkan HTTP POST ke `/api/v1/reports/export`.
- Backend mengembalikan HTTP 404 (Cannot POST /api/v1/reports/export).
- Blok `catch` pada `ReportsPage.vue` baris 588 menampilkan alert: *"Gagal mengekspor laporan: Request gagal dengan status 404"*.

### Kesimpulan Triage:
- **Real?**: **YES**
- **Reproducible?**: **YES**
- **Production Reachable?**: **YES** (Seluruh tombol ekspor laporan di ReportsPage)
- **Feature In Scope?**: **YES** (FR-42, AC-20, SAD §13.5)
- **User / Business Impact**: **MEDIUM** (Ekspor laporan manajerial tidak dapat diunduh)
- **Severity**: **HIGH / NON-BLOCKING** (Fitur pelaporan ekspor sekunder; tidak menghambat pencatatan akuntabilitas harian)
- **Triage Status**: **CONFIRMED — HIGH / NON-BLOCKING**

---

## 10. DEF-05 Verification

### Klaim Audit:
`frontend/src/pages/MyHistoryPage.vue` (lines 12–15) merender `ExportButton` tanpa event handler `@export` atau `@click`, serta mengoper prop `:data` dan `filename` yang tidak dideklarasikan pada `ExportButton.vue`, sehingga klik menjadi *no-op*.

### Bukti Kode Sumber Aktual:
1. **Penggunaan pada MyHistoryPage** (`frontend/src/pages/MyHistoryPage.vue` lines 12–15):
   ```vue
   <ExportButton
     :data="exportableData"
     filename="workpulse-my-history.csv"
   />
   ```
2. **Definisi Komponen ExportButton** (`frontend/src/components/shared/ExportButton.vue` lines 51–76):
   ```typescript
   interface Props {
     label?: string;
     format?: 'pdf' | 'xlsx' | 'all';
     loading?: boolean;
     disabled?: boolean;
   }
   const props = withDefaults(defineProps<Props>(), { ... });
   const emit = defineEmits<{
     (e: 'click'): void;
     (e: 'export', format: 'pdf' | 'xlsx'): void;
   }>();
   ```
3. **Mandat Spesifikasi UI/UX** (`Design-Artifacts/03-UI-UX Spec & Flow Document.md` Section 4.6 line 138):
   `- ExportButton tersedia untuk export histori/weekly summary milik sendiri sebagai evidence pribadi.`

### Analisis Perilaku Antarmuka:
- Komponen `ExportButton.vue` hanya mengekspos prop `label`, `format`, `loading`, dan `disabled`. Prop `:data` dan `filename` yang dioper oleh `MyHistoryPage.vue` jatuh sebagai atribut fallthrough (`$attrs`).
- Menu dropdown pada `ExportButton.vue` meng-emit event `emit('export', 'xlsx')` dan `emit('export', 'pdf')`.
- Karena `MyHistoryPage.vue` tidak melampirkan listener `@export` (maupun `@click`), event tersebut tidak pernah ditangkap, dan fungsi pengunduhan data riwayat CSV/XLSX sama sekali tidak dieksekusi (*no-op*).

### Kesimpulan Triage:
- **Real?**: **YES**
- **Reproducible?**: **YES**
- **Production Reachable?**: **YES** (Toolbar atas halaman My History)
- **Feature In Scope?**: **YES** (UI-UX Spec §4.6 line 138)
- **User / Business Impact**: **LOW / MEDIUM** (Karyawan tidak dapat mengunduh rekaman riwayat pribadi mereka secara instan dari tombol antarmuka)
- **Severity**: **MEDIUM / NON-BLOCKING**
- **Triage Status**: **CONFIRMED — MEDIUM / NON-BLOCKING**

---

## 11. GAP-01 Policy Verification

### Klaim Audit:
`ProfilePage.vue` (lines 91–120) menampilkan nilai statis yang di-*hardcode* ("09:30 WIB", "18:00 WIB", "24 Jam") pada kartu *Kebijakan Kerja Berlaku* alih-alih menghubungkan hook `useActivePoliciesQuery()`.

### Bukti Kode Sumber Aktual:
1. **Markup pada ProfilePage** (`frontend/src/pages/ProfilePage.vue` lines 91–120):
   Menampilkan chip statis "09:30 WIB" untuk Morning Cutoff, "18:00 WIB" untuk EOD Cutoff, dan "24 Jam" untuk Objection Window.
2. **Ketersediaan Hook Dinamis** (`frontend/src/queries/useProfile.ts` lines 28–37):
   ```typescript
   export function useActivePoliciesQuery() {
     return useQuery({
       queryKey: PROFILE_KEYS.policies(),
       queryFn: async () => {
         const res = await profileApi.getActivePolicies();
         return res.data;
       },
       staleTime: 1000 * 60 * 10,
     });
   }
   ```
3. **Tinjauan Kebutuhan PRD & UI/UX Spec**:
   - PRD §3.1 (FR-01, FR-02, FR-50) dan UI/UX Spec §3 hanya mewajibkan halaman Profil untuk memuat identitas pengguna, role/function, snapshot atasan langsung, dan form ganti password mandiri.
   - Kartu kebijakan kerja pada halaman profil ditambahkan oleh pengembang frontend sebagai widget informatif pelengkap.
   - Database PostgreSQL dan backend service tetap menjadi *single source of truth* yang menegakkan waktu cutoff secara dinamis dan efektif-dated independen dari tampilan profil.
   - Namun, jika System Admin mengubah kebijakan cutoff menjadi jam 10:00 di `PolicySettingsPage`, halaman profil karyawan akan menampilkan informasi yang keliru (*misleading*).

### Kesimpulan Triage:
- **Real?**: **YES**
- **Is it Business Policy?**: **YES**
- **Can Policy Values Vary?**: **YES**
- **Is it a Blocker?**: **NO** (Tidak mengganggu fungsionalitas ganti password maupun pengisian akuntabilitas kerja)
- **Severity**: **LOW / NON-BLOCKING**
- **Triage Status**: **CONFIRMED — DATA-SOURCE GAP (LOW / NON-BLOCKING)**

---

## 12. GAP-02 Test Coverage Verification

### Klaim Audit:
Sebanyak 9 halaman belum memiliki file spesifikasi pengujian level komponen terisolasi (`.spec.ts`) di direktori `frontend/tests/`.

### Evaluasi Strategi Pengujian:
1. **Status Pengujian Saat Ini**:
   - `frontend/tests/`: 6 test suite files, **91 passed (100% pass rate)**.
   - Komponen inti akuntabilitas harian dan pengaturan kebijakan (`MyTodayPage.vue`, `RaiseBlockerModal.vue`, `PolicySettingsPage.vue`, `AdminOrganizationTab.vue`, `AdminUserManagementTab.vue`) memiliki pengujian integrasi level komponen yang sangat mendalam (51 test untuk MyToday, 20 test untuk Policy, 20 test untuk Admin).
2. **Daftar 9 Halaman Tanpa File Spec Terisolasi**:
   - `CompliancePage.vue`
   - `ReportsPage.vue`
   - `ManagementPulsePage.vue`
   - `FunctionPulsePage.vue`
   - `TeamPulsePage.vue`
   - `MyLeaveRequestPage.vue`
   - `MyHistoryPage.vue`
   - `ProjectRiskPage.vue`
   - `NotificationsPage.vue`
3. **Analisis Mandat Arsitektur**:
   - Tidak ada aturan tertulis di PDD, PRD, atau SAD yang mewajibkan rasio 1:1 antara jumlah file halaman Vue dengan file `.spec.ts`.
   - Domain logika backend untuk modul-modul ini telah diuji secara komprehensif pada matrix integrasi real PostgreSQL (S3-T1 Phase 2A/2B).
   - Seluruh halaman berhasil di-compile oleh TypeScript (`tsc --noEmit` exit code 0) dan build produksi Vite (`vite build` exit code 0).
   - Namun demikian, ketiadaan test render komponen untuk 9 halaman tersebut meninggalkan celah pembuktian otomatis (*evidence gap*) terhadap regresi UI di masa mendatang.

### Kesimpulan Triage:
- **Classification**: **TEST GAP / EVIDENCE GAP (NON-BLOCKING)**
- **Severity**: **MEDIUM / NON-BLOCKING**
- **Triage Status**: **CONFIRMED — TEST GAP (NON-BLOCKING)**

---

## 13. GAP-03 Responsive Evidence Verification

### Evaluasi Status:
- Temuan ini berasal dari **S2-T5-EVID-01** (Bukti visual multi-viewport pada resolusi 375×667, 768×1024, 1280×800).
- Laporan penutupan S2-T5 dan dokumen rencana kerja S3 secara eksplisit mengunci bahwa bukti visual antarmuka responsif diwariskan dan akan dieksekusi secara terfokus pada tahapan **S3-T4**.
- Audit S3-T2 tidak mencakup pengujian visual viewport, sehingga status temuan ini dipertahankan secara utuh sebagai carryover resmi.

### Kesimpulan Triage:
- **Classification**: **CARRYOVER TO S3-T4**
- **Severity**: **LOW / NON-BLOCKING EVIDENCE GAP**
- **Triage Status**: **CONFIRMED — CARRYOVER TO S3-T4**

---

## 14. API Reconciliation Matrix

| Frontend Consumer API | Method | Target URL Frontend | Komponen Pemanggil | Route Backend Sebenarnya | Method Backend | Kesesuaian Kontrak | Bukti Runtime / Status | Vonis Triage |
|---|---|---|---|---|---|---|---|---|
| `daily-records.api.ts` (Correction) | `POST` | `/commitments/:id/request-correction` | `CorrectionRequestModal.vue` | `/correction-requests` | `POST` | **MISMATCH (Path & DTO)** | Route tidak terdaftar (HTTP 404) | **CONFIRMED — BLOCKING** |
| `notifications.api.ts` (Mark Read) | `PATCH` | `/notifications/:id/read` | `NotificationsPage.vue` | `/notifications/:id/mark-read` | `POST` | **MISMATCH (Method & Path)** | Route tidak terdaftar (HTTP 404) + silent catch | **CONFIRMED — BLOCKING** |
| `notifications.api.ts` (Mark All) | `PATCH` | `/notifications/read-all` | `NotificationsPage.vue` | `/notifications/mark-all-read` | `POST` | **MISMATCH (Method & Path)** | Route tidak terdaftar (HTTP 404) | **CONFIRMED — BLOCKING** |
| `reporting.api.ts` (Evidence) | `GET` | `/reports/individual-evidence?userId=...` | `ReportsPage.vue` (Tab 4) | `/reports/individual-evidence/:userId` | `GET` | **MISMATCH (Path Param)** | Route param hilang (HTTP 404) | **CONFIRMED — HIGH / NON-BLOCKING** |
| `reporting.api.ts` (Export) | `POST` | `/reports/export` | `ReportsPage.vue` (ExportBtn) | `/reports/:reportType/export` | `GET` | **MISMATCH (Method & Path)** | Route tidak terdaftar (HTTP 404) | **CONFIRMED — HIGH / NON-BLOCKING** |

---

## 15. Policy Triage Matrix

| Parameter Kebijakan | Nilai UI Saat Ini | Sumber Backend / API | Bersifat Dinamis? | Effective-Dated? | User-Specific? | Dasar Requirement | Vonis Triage |
|---|---|---|---|---|---|---|---|
| Cutoff Morning Check-in | `09:30 WIB` (hardcoded) | `GET /api/v1/policies` (Category: CutOff) | Ya (Dapat diubah admin) | Ya (BR-15, SAD §10.9) | Berlaku Organisasi | PRD §3.2, FR-03, FR-05 | **DATA-SOURCE GAP (LOW / NON-BLOCKING)** |
| Cutoff EOD Check-in | `18:00 WIB` (hardcoded) | `GET /api/v1/policies` (Category: CutOff) | Ya (Dapat diubah admin) | Ya (BR-15, SAD §10.9) | Berlaku Organisasi | PRD §3.2, FR-08, FR-10 | **DATA-SOURCE GAP (LOW / NON-BLOCKING)** |
| Objection Window Koreksi | `24 Jam` (hardcoded) | `GET /api/v1/policies` (Category: ObjectionWindow) | Ya (Configurable) | Ya (BR-15, SAD §9.6) | Berlaku Organisasi | SAD §9.6, FR-43 | **DATA-SOURCE GAP (LOW / NON-BLOCKING)** |

---

## 16. Test Gap Matrix

| Halaman Frontend | Rute Antarmuka | Cakupan Integrasi Backend | Cakupan Komponen Eksisting | Cakupan E2E | File Spec Terisolasi | Tingkat Risiko | Mandat Eksplisit 1:1? | Vonis Triage |
|---|---|---|---|---|---|---|---|---|
| `CompliancePage.vue` | `/compliance` | `matrix-audit-notification-compliance.spec.ts` | Tidak Ada | Terjadwal S3-T3 | Belum Ada | Medium | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `ReportsPage.vue` | `/reports` | `matrix-http-controller-service.spec.ts` | Tidak Ada | Terjadwal S3-T3 | Belum Ada | Medium | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `ManagementPulsePage.vue` | `/management` | `matrix-organization-scope-effective-dating.spec.ts` | Tidak Ada | Terjadwal S3-T3 | Belum Ada | Medium | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `FunctionPulsePage.vue` | `/function` | `matrix-organization-scope-effective-dating.spec.ts` | Tidak Ada | Terjadwal S3-T3 | Belum Ada | Medium | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `TeamPulsePage.vue` | `/team` | `matrix-blocker.spec.ts`, `matrix-correction-request.spec.ts`| `BlockerCard`, `CommitmentCard` (shared) | Terjadwal S3-T3 | Belum Ada | Medium | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `MyLeaveRequestPage.vue` | `/today/leave-request` | `matrix-http-controller-service.spec.ts` | Tidak Ada | Terjadwal S3-T3 | Belum Ada | Low | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `MyHistoryPage.vue` | `/history` | `matrix-daily-accountability-commitment.spec.ts` | `StatusBadge`, `SubmissionTimingBadge` (shared)| Terjadwal S3-T3 | Belum Ada | Low | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `ProjectRiskPage.vue` | `/my-scope/project-risk` | `matrix-daily-accountability-commitment.spec.ts` | Tidak Ada | Terjadwal S3-T3 | Belum Ada | Low | Tidak Ada | **TEST GAP (NON-BLOCKING)** |
| `NotificationsPage.vue` | `/notifications` | `matrix-audit-notification-compliance.spec.ts` | `NotificationBell.vue` (shared) | Terjadwal S3-T3 | Belum Ada | Medium | Tidak Ada | **TEST GAP (NON-BLOCKING)** |

---

## 17. Consolidated Triage Matrix

| ID Temuan | Deskripsi Ringkas | Real? | Terproduksi? | Jangkauan Produksi? | Masuk Scope? | Dampak Pengguna | Dampak Spesifikasi | Severity Triage | Klasifikasi Triage | Rekomendasi Aksi |
|---|---|---|---|---|---|---|---|---|---|---|
| **S3-T2-DEF-01** | Endpoint & DTO Correction Request keliru | **YES** | **YES** | **YES** | **YES** | **CRITICAL** (Gagal ajukan koreksi) | Melanggar SAD §10.5 & FR-43 | **BLOCKING** | APPLICATION DEFECT | Remediasi Frontend API & Modal Caller |
| **S3-T2-DEF-02** | Endpoint Mark-Read keliru & silent catch | **YES** | **YES** | **YES** | **YES** | **HIGH** (Notifikasi tak bisa dibaca) | Melanggar SAD §10.10 & §12.1 | **BLOCKING** | APPLICATION DEFECT | Remediasi Frontend API & Hapus Silent Catch |
| **S3-T2-DEF-03** | Individual Evidence param query bukan path | **YES** | **YES** | **YES** | **YES** | **MEDIUM** (Bukti individu gagal muat) | Melanggar SAD §10.11 & PRD §9 | **HIGH / NON-BLOCKING** | DATA-SOURCE DEFECT | Remediasi Path Param di API Client |
| **S3-T2-DEF-04** | Export Report method POST bukan GET | **YES** | **YES** | **YES** | **YES** | **MEDIUM** (Unduh laporan 404) | Melanggar SAD §10.11 & FR-42 | **HIGH / NON-BLOCKING** | DATA-SOURCE DEFECT | Remediasi Method & Query Param di API Client |
| **S3-T2-DEF-05** | ExportButton MyHistory no-op | **YES** | **YES** | **YES** | **YES** | **LOW / MEDIUM** (Ekspor riwayat tak merespons) | Melanggar UI/UX Spec §4.6 | **MEDIUM / NON-BLOCKING**| UI DEFECT | Hubungkan `@export` handler dengan CSV Generator |
| **S3-T2-GAP-01** | Kartu kebijakan profil hardcoded | **YES** | **YES** | **YES** | **YES** | **LOW** (Nilai cutoff tak dinamis) | Kesenjangan penyajian data | **LOW / NON-BLOCKING** | DATA-SOURCE GAP | Hubungkan `useActivePoliciesQuery()` |
| **S3-T2-GAP-02** | 9 halaman tanpa spec terisolasi | **YES** | **YES** | **N/A** (Test) | **YES** | **NONE** (Runtime stabil) | Kesenjangan bukti otomatis | **MEDIUM / NON-BLOCKING**| TEST GAP | Tambahkan spec test terisolasi di fase uji |
| **S3-T2-GAP-03** | Bukti visual multi-viewport carryover | **YES** | **N/A** | **N/A** | **YES** | **NONE** | Carryover terencana | **LOW / NON-BLOCKING** | EVIDENCE GAP | Alokasikan ke tahapan resmi S3-T4 |

---

## 18. Remediation Scope Recommendations

> **PERINGATAN**: Rincian di bawah ini adalah panduan batasan cakupan untuk tahap remediasi berikutnya. Tidak ada implementasi kode yang dijalankan pada tahapan ini.

### 1. Remediasi S3-T2-DEF-01 (Correction Request):
- **File Terdampak**:
  - `frontend/src/api/daily-records.api.ts` (atau delegasikan ke `frontend/src/api/correction-requests.api.ts`).
  - `frontend/src/components/self-service/CorrectionRequestModal.vue`.
  - `frontend/src/queries/useDailyRecords.ts`.
- **Perubahan Kontrak**:
  - Sesuaikan target URL menjadi `POST /api/v1/correction-requests`.
  - Sesuaikan body payload menjadi `{ targetCommitmentId: payload.commitmentId, requestedChange: { text: payload.proposedDescription }, reason: payload.reason }`.
- **Kebutuhan Backend**: **TIDAK ADA PERUBAHAN BACKEND**. Backend sudah benar sesuai SAD §10.5.
- **Risiko Regresi**: Rendah. Terisolasi pada alur pengajuan koreksi modal.

### 2. Remediasi S3-T2-DEF-02 (Notification Mark-as-Read):
- **File Terdampak**:
  - `frontend/src/api/notifications.api.ts`.
  - `frontend/src/pages/NotificationsPage.vue`.
- **Perubahan Kontrak**:
  - `markAsRead`: Ubah method menjadi `POST /api/v1/notifications/${id}/mark-read`.
  - `markAllAsRead`: Ubah method menjadi `POST /api/v1/notifications/mark-all-read`.
  - `NotificationsPage.vue`: Hapus blok penyerapan error diam-diam (`// Abaikan error background mark read`) dan tampilkan snackbar/toast error jika mutasi gagal.
- **Kebutuhan Backend**: **TIDAK ADA PERUBAHAN BACKEND**. Backend sudah benar sesuai SAD §10.10.
- **Risiko Regresi**: Rendah.

### 3. Remediasi S3-T2-DEF-03 (Reporting Individual Evidence):
- **File Terdampak**:
  - `frontend/src/api/reporting.api.ts`.
- **Perubahan Kontrak**:
  - Ubah URL menjadi `GET /api/v1/reports/individual-evidence/${params.userId}?startDate=${params.startDate}&endDate=${params.endDate}`.
- **Kebutuhan Backend**: **TIDAK ADA PERUBAHAN BACKEND**. Backend sudah benar sesuai SAD §10.11.
- **Risiko Regresi**: Sangat rendah.

### 4. Remediasi S3-T2-DEF-04 (Reporting Export):
- **File Terdampak**:
  - `frontend/src/api/reporting.api.ts`.
  - `frontend/src/queries/useReporting.ts`.
- **Perubahan Kontrak**:
  - Ubah method menjadi `GET /api/v1/reports/${payload.reportType}/export?format=${payload.format}...`.
- **Kebutuhan Backend**: **TIDAK ADA PERUBAHAN BACKEND**. Backend sudah benar sesuai SAD §10.11.
- **Risiko Regresi**: Sangat rendah.

### 5. Remediasi S3-T2-DEF-05 (MyHistory ExportButton):
- **File Terdampak**:
  - `frontend/src/pages/MyHistoryPage.vue`.
- **Perubahan Antarmuka**:
  - Tambahkan `@export="(fmt) => handleExport(fmt)"` pada template.
  - Implementasikan fungsi pengunduhan CSV lokal menggunakan data `exportableData.value`.
- **Kebutuhan Backend**: Tidak ada.
- **Risiko Regresi**: Sangat rendah.

### 6. Penyelarasan S3-T2-GAP-01 (ProfilePage Policies):
- **File Terdampak**:
  - `frontend/src/pages/ProfilePage.vue`.
- **Perubahan Antarmuka**:
  - Import dan panggil `useActivePoliciesQuery()`.
  - Bind nilai Morning Cutoff, EOD Cutoff, dan Objection Window secara reaktif dari respon API policies.

---

## 19. Required Regression Tests for Later Remediation

Uji regresi yang wajib diimplementasikan saat tahap remediasi:

1. **Uji Regresi DEF-01 (`correction-request-submission.spec.ts`)**:
   - Memastikan `CorrectionRequestModal.vue` mengirimkan payload yang sesuai skema `{ targetCommitmentId, requestedChange, reason }` ke `POST /api/v1/correction-requests`.
   - Memastikan cache `['daily-records', 'today']` terinvaliasi pasca-sukses.
   - Memastikan penanganan HTTP 400/409 (misalnya konflik duplikasi DEF-01 backend) memunculkan pesan error yang sesuai pada modal.
2. **Uji Regresi DEF-02 (`notifications-mark-read.spec.ts`)**:
   - Memastikan klik pada item notifikasi memanggil `POST /api/v1/notifications/:id/mark-read`.
   - Memastikan tombol "Tandai Semua Dibaca" memanggil `POST /api/v1/notifications/mark-all-read`.
   - Memastikan kegagalan network memicu error alert / toast ke pengguna.
3. **Uji Regresi DEF-03 (`reporting-individual-evidence.spec.ts`)**:
   - Memastikan fungsi `getIndividualEvidence` menyematkan target `userId` pada segmen path URL.
4. **Uji Regresi DEF-04 (`reporting-export.spec.ts`)**:
   - Memastikan mutasi ekspor mengirimkan HTTP GET dengan format dan filter tanggal ke `/reports/:reportType/export`.
5. **Uji Regresi DEF-05 (`my-history-export.spec.ts`)**:
   - Memastikan event `@export` pada `ExportButton` di `MyHistoryPage.vue` memicu pembangkitan file unduhan.

---

## 20. Git Mutation Integrity

Verifikasi integritas pohon Git pada akhir pelaksanaan triage:

```bash
git status --porcelain -uall
git diff --stat -- backend/src backend/prisma/schema.prisma backend/prisma/migrations frontend package-lock.json
```

### Hasil Verifikasi:
- **Production Frontend Modification**: **NOL (0 file diubah)**.
- **Backend Source Modification**: **NOL (0 file diubah)**.
- **Prisma Schema & Migration Modification**: **NOL (0 file diubah)**.
- **Dependencies Modification**: **NOL (0 file diubah)**.
- **Status Git Integrity**: **PASS**

---

## 21. Final Triage Verdict

Berdasarkan pembuktian independen terhadap seluruh temuan kode sumber, rantai pemanggilan antarmuka, dan controller backend:
- Dua defek fungsional inti (**DEF-01** pada alur pengajuan koreksi komitmen dan **DEF-02** pada alur penandaan notifikasi) terbukti nyata (*confirmed real defects*), dapat dijangkau di lingkungan produksi (*production reachable*), dan mengakibatkan kegagalan HTTP 404 pada alur kerja pengguna.
- Tiga defek fungsional sekunder (**DEF-03**, **DEF-04**, **DEF-05**) terbukti nyata pada lapisan pelaporan dan unduhan bukti riwayat.
- Satu kesenjangan data statis (**GAP-01**) dan satu kesenjangan pengujian komponen (**GAP-02**) terbukti memerlukan penyelarasan.
- Tidak ada temuan yang diklasifikasikan sebagai *false positive*.
- Seluruh verifikasi dilaksanakan secara strictly **READ-ONLY** tanpa modifikasi kode.

Maka vonis resmi tahapan ini ditetapkan sebagai:

### TRIAGE VERIFIED — REMEDIATION REQUIRED
