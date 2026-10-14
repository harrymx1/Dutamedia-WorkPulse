# S2-T3 — Reconcile SAD §10 Endpoint Catalog with Actual NestJS Routes
## Independent API Contract Reconciliation Audit Report

---

## 1. Scope

Audit ini mencakup rekonsiliasi kontrak antarmuka API dua arah (**Two-Way API Contract Reconciliation**) antara spesifikasi arsitektur resmi pada **SAD §10 Endpoint Catalog** (`Design-Artifacts/05-SAD.md`, baris 1089–1225) dan seluruh rute HTTP aktual yang terdaftar pada backend NestJS produksi (`backend/src/**`).

Audit mengevaluasi secara mendalam:
1. **Documented → Actual**: Memverifikasi apakah seluruh endpoint yang didokumentasikan di SAD §10 benar-benar ada dan terdaftar pada NestJS router.
2. **Actual → Documented**: Memverifikasi apakah setiap rute HTTP aktual yang diekspos oleh NestJS tercantum pada SAD §10 atau merupakan rute teknis/internal yang diizinkan.
3. **HTTP Method & Final Path**: Memastikan keabsahan rekonsiliasi prefix global (`/api/v1`), controller prefix, method decorator, dan parameter path.
4. **Authentication & Authorization**: Memeriksa penegakan `AuthGuard`, `@Public()`, `RoleGuard` (`@RequireRole`), `PolicyOwnerGuard`, serta otorisasi kontekstual/kepemilikan pada service layer (`ScopeFilterService`, `ProjectAuthorityService`, dan ownership checks per ADR-010/ADR-011).
5. **Contract Parameters & DTOs**: Memeriksa kompatibilitas body, query, dan path parameters.
6. **Special Categories & Technical Routes**: Memeriksa keberadaan rute diagnostik/health check, OpenAPI Swagger documentation, dan potensi rute yang terekspos secara tidak sengaja (*accidental exposure*).

---

## 2. SAD §10 Inventory

SAD §10 mendokumentasikan total **65 endpoint bisnis kanonikal** yang terbagi dalam 12 modul fungsional:

| Subseksi SAD | Modul Domain | Jumlah Endpoint Terdokumentasi | Deskripsi Lingkup |
|---|---|---:|---|
| **§10.1** | `AuthModule` | 5 | Login, Logout, Self Reset Password, Admin Reset Password, Session Me |
| **§10.2** | `IdentityModule` | 9 | Manajemen User, Status, Org Assignment, Project Authority, Temp Reviewer |
| **§10.3** | `DailyAccountabilityModule` | 9 | Morning Check-in, Today Record, EOD Check-in, Override, Commitments, Additional Work, Record Queries |
| **§10.4** | `BlockerModule` | 9 | Pembuatan, Query, Acknowledge, Update, Resolve, Accept Risk, Close, Support Contribution |
| **§10.5** | `CorrectionRequestModule` | 4 | Pengajuan Koreksi Komitmen, Query Koreksi, Detail, dan Keberatan (Object) |
| **§10.6** | `ExceptionModule` | 6 | Pengajuan Cuti, Penetapan Hari Libur, Dispensasi Khusus, Query, Approval & Rejection |
| **§10.7** | `ManagerNoteModule` | 3 | Pembuatan Catatan Manajerial, Query Berdasarkan Visibilitas (BR-14), dan Detail |
| **§10.8** | `ComplianceModule` | 5 | Query Pelanggaran, Detail Progresi, Aksi Pembinaan (Coaching), Warning, dan Eskalasi Formal |
| **§10.9** | `PolicyModule` | 4 | Baca Kebijakan Aktif, Pembaruan Kebijakan (PolicyOwnerGuard), Riwayat Versi, Penugasan Policy Owner |
| **§10.10** | `NotificationModule` | 3 | Query Notifikasi Masuk, Tandai Sudah Dibaca (Single), dan Tandai Semua Dibaca |
| **§10.11** | `ReportingModule` | 6 | Daily Exception, Weekly Team Summary, Monthly Trend, Individual Evidence, Blocker Root Cause, Report Export |
| **§10.12** | `FileStorageModule` | 2 | Presigned PUT Upload URL (5 menit) dan Presigned GET Download URL (15 menit) |
| **TOTAL** | **12 Modul** | **65** | **Seluruh katalog resmi implementasi** |

### Ambiguity dalam SAD §10
- Format parameter path pada SAD memakai sintaks OpenAPI `{id}` / `{userId}` bukannya sintaks Express/NestJS `:id` / `:userId`. Ini dinilai sebagai variasi konvensi dokumentasi, bukan ketidaksesuaian kontrak fungsional.
- Pada SAD §10.6, terdapat ketiadaan entri baris untuk query detail `GET /api/v1/exceptions/{id}`, meskipun endpoint aksi pada ID tersebut (`POST /api/v1/exceptions/{id}/approve` dan `POST /api/v1/exceptions/{id}/reject`) tercantum.
- Pada SAD §10.11, endpoint agregasi untuk dashboard widget `ExceptionSummaryWidget.vue` dijelaskan secara arsitektural pada SAD §13.2 (`getExceptionSummary(scope, date)`), namun tidak dicantumkan sebagai baris tersendiri di tabel ringkasan §10.11.

---

## 3. Actual Nest Route Inventory

Pemeriksaan aktual terhadap seluruh kode sumber backend (`backend/src/**`) dan spesifikasi OpenAPI tergenerasi (`backend/openapi.json`) menemukan total **70 rute HTTP** yang terdaftar pada runtime Express/NestJS:
- **Global Prefix**: `api/v1` (dikonfigurasi pada `backend/src/main.ts:15` via `app.setGlobalPrefix('api/v1')`).
- **Total Controller Files**: 15 file controller (`AppController` + 14 business controllers).
- **Rute Bisnis Aktual**: 69 operasi endpoint.
- **Rute Teknis / Health / Internal**: 1 operasi endpoint (`GET /api/v1` pada `AppController.getHello`) serta Swagger UI documentation endpoint pada `/api/v1/docs` (`backend/src/main.ts:60`).
- **Metode Rekonstruksi Rute**:
  Rute final dihitung secara deterministik dari:
  $$\text{Final Route} = \text{Global Prefix} + \text{Controller Prefix} + \text{Method Path}$$
  Contoh:
  - Global Prefix: `api/v1`
  - Controller `@Controller('daily-accountability-records')`
  - Handler `@Post('morning-checkin')`
  - $\rightarrow \text{POST } /api/v1/daily-accountability-records/morning-checkin$

---

## 4. Documented → Actual Reconciliation

Setiap endpoint dari 65 entri kanonikal di SAD §10 direkonsiliasikan terhadap rute NestJS aktual:

| Status | Count | Persentase | Keterangan |
|---|---:|---:|---|
| **MATCH** | 64 | 98.46% | Method, final path, autentikasi, otorisasi peran, dan scope kepemilikan sesuai secara tepat dengan rute NestJS aktual. |
| **PARTIAL MATCH** | 1 | 1.54% | `GET /api/v1/users/{id}/organizational-assignments`: Rute dan method ada, tetapi otorisasi peran/scope aktual tidak membatasi akses caller ke `SystemAdmin, HRGA, pemilik`. |
| **MISSING ACTUAL** | 0 | 0.00% | Seluruh 65 endpoint di SAD §10 telah diimplementasikan dan terdaftar di router NestJS. |
| **OBSOLETE DOCUMENTATION** | 0 | 0.00% | Tidak ditemukan endpoint pada SAD §10 yang sudah dihapus/usang tanpa pengganti. |
| **AMBIGUOUS** | 0 | 0.00% | Seluruh endpoint terverifikasi dengan bukti kode sumber dan reflection. |
| **TOTAL** | **65** | **100.00%** | |

---

## 5. Actual → Documented Reconciliation

Setiap rute dari 70 rute aktual pada runtime NestJS diperiksa keberadaannya pada SAD §10:

| Status | Count | Persentase | Keterangan |
|---|---:|---:|---|
| **DOCUMENTED** | 65 | 92.86% | Rute bisnis yang memiliki pasangan langsung pada tabel SAD §10. |
| **UNDOCUMENTED** | 4 | 5.71% | Rute bisnis aktual yang tidak tercantum pada tabel SAD §10 (`GET /users/:id`, `GET /exceptions/:id`, `GET /reports/exception-summary`, `POST /policies/owner-assignments`). |
| **INTERNAL / INTENTIONAL EXCEPTION** | 1 | 1.43% | Rute teknis `GET /api/v1` (`AppController.getHello`) untuk health ping. |
| **POTENTIALLY ACCIDENTAL EXPOSURE** | 0 | 0.00% | Tidak ditemukan endpoint debug, endpoint internal yang bocor, atau endpoint tanpa perlindungan dasar. |
| **AMBIGUOUS** | 0 | 0.00% | |
| **TOTAL** | **70** | **100.00%** | |

---

## 6. Authorization Reconciliation

### 6.1 Authentication Architecture
- Seluruh endpoint di backend WorkPulse dilindungi oleh `AuthGuard` global (`provide: APP_GUARD` di `AuthModule`), yang mewajibkan validasi JWT session HttpOnly cookie (`access_token`).
- Pengecualian publik hanya diberikan secara eksplisit melalui decorator `@Public()` pada `POST /api/v1/auth/login`, sesuai dengan SAD §8.4 dan §10.1.
- Perlindungan CSRF diterapkan secara global melalui `CsrfGuard` (`provide: APP_GUARD` di `AuthModule`) untuk seluruh request mutasi (POST, PATCH, PUT, DELETE) yang bukan publik, memverifikasi kesesuaian header `X-CSRF-Token` dengan cookie `csrf_token`.

### 6.2 Role / Function Authorization
- Ditegakkan secara global via `RoleGuard` (`provide: APP_GUARD` di `AuthorizationModule`). Jika suatu handler atau controller memiliki `@RequireRole(...)`, guard memastikan `user.role` berada dalam daftar role yang diizinkan.
- Pada `POST /api/v1/policies`, diterapkan `PolicyOwnerGuard` kustom (`backend/src/modules/policy/guards/policy-owner.guard.ts`) yang mengevaluasi tabel `PolicyOwnerAssignment` secara dinamis berdasarkan kategori kebijakan, tanggal efektif, dan masa berlaku (SAD §8.10, BR-15).

### 6.3 Contextual Scope & Ownership Enforcement
- Sejalan dengan ADR-010 (*ScopeGuard removal & decentralization*) dan ADR-011 (*DTO structural vs service contextual authorization*), otorisasi kontekstual ditangani secara ketat di domain service layer:
  - **Daily Accountability**: Memverifikasi `record.employeeUserId === userId`, `commitment.dailyRecord.employeeUserId === userId`, dan `additionalWork.dailyRecord.employeeUserId === userId`. Jika tidak cocok, melemparkan `NotFoundException` (404) sesuai prinsip SAD §7.7 untuk mencegah enumerasi resource.
  - **Blocker**: Memverifikasi bahwa aksi *Acknowledge*, *Update*, *Resolve*, dan *Accept Risk* hanya dapat dieksekusi oleh `blocker.ownerNeededUserId`, sedangkan *Close* hanya oleh `blocker.raisedByUserId`.
  - **Correction Request**: Memverifikasi bahwa pembuatan koreksi hanya untuk komitmen milik pelapor, dan pengajuan keberatan (*Object*) hanya dapat dilakukan oleh *Authorized Reviewer* terverifikasi (`isAuthorizedReviewer`).
  - **Exception**: Memverifikasi bahwa persetujuan/penolakan cuti hanya oleh atasan/atasan peninjau yang sah (`isAuthorizedApprover`), dan karyawan tidak dapat menyetujui cutinya sendiri.
  - **Reporting**: Memfilter query data dengan `ScopeFilterService.getAccessibleUserIds()` dan melempar `ForbiddenException` jika target pengguna berada di luar wewenang organisasional.
  - **File Storage**: Memblokir folder `backups/`, menolak akses `SystemAdmin` terhadap file operasional (SAD §8.11), dan membatasi penerbitan presigned download URL hanya kepada pemilik/peninjau sah (SAD §14.4).

### 6.4 Authorization Discrepancy Teridentifikasi
- **Rute**: `GET /api/v1/users/:id/organizational-assignments` (`IdentityController.getOrganizationalAssignments`):
  - **SAD §10.2 Kontrak**: Role: `SystemAdmin, HRGA, pemilik`.
  - **Implementasi Aktual**: Pada `backend/src/modules/identity/identity.controller.ts:74`, endpoint tidak memiliki decorator `@RequireRole(...)` dan tidak meneruskan caller context (`@CurrentUser()`). Pada `identity.service.ts:326`, service hanya menerima `userId: string` dan langsung mengembalikan riwayat penugasan organisasi dari Prisma tanpa memeriksa apakah pemanggil adalah `SystemAdmin`, `HRGA`, atau pemilik record (`caller.userId === userId`).
  - **Dampak**: Setiap pengguna terautentikasi (termasuk Employee biasa) secara teknis dapat memanggil endpoint ini dengan ID pengguna lain untuk melihat riwayat jabatan, departemen, dan atasan langsung pengguna tersebut.

---

## 7. Parameter & DTO Reconciliation

Perbandingan terhadap 65 parameter kontrak menemukan kesesuaian:
- Seluruh DTO request body menggunakan validasi ketat `class-validator` dan divalidasi oleh `AppValidationPipe` global dengan `whitelist: true` dan `forbidNonWhitelisted: true` (`backend/src/main.ts:56`, SAD §7.4).
- Request DTO (seperti `LoginDto`, `CreateUserDto`, `MorningCheckinDto`, `EodCheckinDto`, `CreateBlockerDto`, `CreateCorrectionRequestDto`, `CreateLeaveDto`, `CreatePolicyDto`, `GenerateUploadUrlDto`) memiliki field yang kompatibel dengan spesifikasi SAD §10.
- Query DTO untuk pagination (`page`, `pageSize`) dan filter telah terpasang pada seluruh rute list agregat.
- Tidak ditemukan inkonsistensi struktur parameter yang memutus komunikasi client-server.

---

## 8. OpenAPI Cross-Check

1. **Status OpenAPI**:
   - Backend memiliki generator OpenAPI resmi: `npm run openapi:generate` (`backend/src/scripts/generate-openapi.ts`), yang menginisialisasi NestJS context tanpa koneksi database aktif (`process.env.SKIP_DB_CONNECT = 'true'`) dan mengekstrak OpenAPI specification melalui `SwaggerModule.createDocument()`.
   - File artefak `backend/openapi.json` telah diperbarui dan diverifikasi.
2. **Kesesuaian OpenAPI vs Rute NestJS Aktual**:
   - `backend/openapi.json` mendokumentasikan secara presisi ke-70 rute yang terdaftar pada Express router NestJS.
   - Tag Swagger terdistribusi ke dalam 12 tag modul domain (`Auth`, `Identity`, `DailyAccountability`, `Blocker`, `CorrectionRequest`, `Exception`, `ManagerNote`, `Compliance`, `Policy`, `Notification`, `Reporting`, `FileStorage`), mencerminkan pembagian subseksi SAD §10.1 hingga §10.12.
3. **Swagger UI UI Endpoint**:
   - Terdaftar pada `main.ts:60` dengan path `/api/v1/docs`.

---

## 9. Runtime Verification

- **Metode**: Runtime introspection dieksekusi dengan menjalankan konteks NestJS via script `backend/src/scripts/generate-openapi.ts` dan eksekusi tes integrasi controller.
- **Kondisi Lingkungan**: Konfigurasi aman lokal, tanpa modifikasi skema, tanpa mutasi database produksi, dan dengan `SKIP_DB_CONNECT = 'true'`.
- **Hasil**: 70 rute diekstrak langsung dari layer metadata NestJS (`DiscoveryModule` dan `SwaggerModule`), membuktikan secara empiris bahwa seluruh controller terdaftar dan aktif di router HTTP backend.
- **Batasan**: Audit tidak melakukan deployment ke cloud/staging remote server, melainkan memverifikasi build and runtime packaging lokal pada port pengujian.

---

## 10. Discrepancy Register

| ID | Klasifikasi Discrepancy | Endpoint Terkait | Keterangan & Analisis Root Cause | Severity |
|---|---|---|---|---|
| **E6/E7-1** | **E6 — Role/Function Mismatch** & **E7 — Scope/Ownership Mismatch** | `GET /api/v1/users/:id/organizational-assignments` | SAD §10.2 menetapkan role `SystemAdmin, HRGA, pemilik`. Controller tidak memiliki `@RequireRole` dan service layer `getOrganizationalAssignments(userId)` tidak memvalidasi caller identity/role, sehingga seluruh user terautentikasi dapat membaca riwayat penugasan user lain. | **HIGH** |
| **E2-1** | **E2 — Undocumented Production Endpoint** | `GET /api/v1/users/:id` | `IdentityController.getUserById` diimplementasikan untuk query profil user spesifik via UUID, namun tidak dicantumkan dalam tabel ringkasan SAD §10.2 (hanya rute list, create, patch status, dan org-assignments yang dicantumkan). Dilindungi autentikasi. | **LOW** |
| **E2-2** | **E2 — Undocumented Production Endpoint** | `GET /api/v1/exceptions/:id` | `ExceptionController.findById` diimplementasikan untuk query detail pengajuan dispensasi/cuti oleh pemilik atau reviewer (dilindungi scope check). Omitted dari tabel ringkasan SAD §10.6 meskipun endpoint aksi approve/reject pada ID tersebut terdokumentasi. | **LOW** |
| **E2-3** | **E2 — Undocumented Production Endpoint** | `GET /api/v1/reports/exception-summary` | `ReportingController.getExceptionSummary` diimplementasikan untuk menyediakan data widget agregat dashboard (`ExceptionSummaryWidget.vue`) sesuai rancangan arsitektur SAD §13.2. Namun tidak dimasukkan ke dalam tabel ringkasan §10.11. Dilindungi role `Supervisor, Head, HRGA, CEO`. | **LOW** |
| **E2-4 / E10-1** | **E2 — Undocumented Production Endpoint** & **E10 — Duplicate/Overlapping Route** | `POST /api/v1/policies/owner-assignments` | `PolicyController.createPolicyOwnerAssignment` merupakan nested alias route untuk penugasan Policy Owner yang memanggil service method sama dengan `POST /api/v1/policy-owner-assignments` (`PolicyOwnerAssignmentController`). Kedua rute dilindungi `@RequireRole(Role.SystemAdmin)`. SAD §10.9 mendokumentasikan rute kedua. | **LOW** |
| **E2-5** | **E2 — Undocumented Technical Route (Intentional)** | `GET /api/v1` | `AppController.getHello` merupakan root endpoint bawaan NestJS yang mengembalikan status kesiapan server (*health ping*). Standar teknis yang wajar tidak dimasukkan ke business catalog. | **INFO** |

---

## 11. Severity Summary

| Severity | Count | Rincian Item |
|---|---:|---|
| **CRITICAL** | 0 | Tidak ada celah autentikasi publik, bypass data sensitif destruktif, atau kebocoran kredensial. |
| **HIGH** | 1 | `E6/E7-1` (`GET /api/v1/users/:id/organizational-assignments` otorisasi role/ownership tidak dibatasi). |
| **MEDIUM** | 0 | Tidak ada *contract breaking changes* pada DTO atau metode HTTP. |
| **LOW** | 4 | `E2-1` (`users/:id`), `E2-2` (`exceptions/:id`), `E2-3` (`reports/exception-summary`), `E2-4/E10-1` (`policies/owner-assignments`). |
| **INFO** | 1 | `E2-5` (`GET /api/v1` root health ping). |
| **TOTAL** | **6** | |

---

## 12. Existing ADR / Finding Cross-References

Perilaku rute-rute di atas berkesesuaian dengan arsitektur tata kelola yang telah disepakati:
1. **ADR-002 (Temporary Reviewer Assignment Scope)**: Menjelaskan keberadaan `GET` dan `POST` pada `/api/v1/temporary-reviewer-assignments`, di mana Head dibatasi hanya dapat melihat/membuat penugasan yang berkaitan dengan dirinya. Terpenuhi di `IdentityService`.
2. **ADR-010 (ScopeGuard Removal & Service Decentralization)**: Menjelaskan mengapa controller tidak lagi memakai `@UseGuards(ScopeGuard)`. Otorisasi kontekstual diuji langsung pada service query, konsisten dengan seluruh modul (Daily Accountability, Blocker, Exception, Reporting).
3. **ADR-011 (DTO Structural vs Service Contextual Authorization)**: Menjelaskan validasi input struktural di DTO dan penegakan wewenang bisnis di service.
4. **ADR-012 (Upload URL Authorization & Constraints)**: Menjelaskan batasan ukuran file 10 MB dan tipe MIME yang ditegakkan di `FileStorageService.generateUploadUrl`.
5. **SAD §13.2 (Shared Aggregation Layer)**: Menjelaskan eksistensi `GET /api/v1/reports/exception-summary` yang melayani komponen dashboard `ExceptionSummaryWidget.vue` agar sinkron dengan laporan formal.

---

## 13. Test Evidence

Audit memverifikasi kestabilan seluruh test suite yang ada tanpa modifikasi atau penambahan test:
- **Backend Test Suite Execution**:
  - Command: `npm test` (di direktori `backend`)
  - Tool: Vitest v4.1.2
  - Hasil: **46/46 test files passed, 618/618 tests passed (100% PASS)**
  - Durasi: 7.28s
- **Frontend Test Suite Execution**:
  - Command: `npm test` (di direktori `frontend`)
  - Tool: Vitest v4.1.2
  - Hasil: **6/6 test files passed, 91/91 tests passed (100% PASS)**
  - Durasi: 7.13s

---

## 14. Files Changed

Selama proses audit berlangsung, **TIDAK ADA** file produksi, test, skema Prisma, atau ADR yang diubah. File yang dibuat adalah artefak pelaporan audit formal S2-T3:
1. `Design-Artifacts/14-S2-T3-Endpoint-Reconciliation.md` (Matriks rekonsiliasi dua arah lengkap).
2. `Design-Artifacts/Reports/S2-T3-Endpoint-Reconciliation-Report.md` (Laporan komprehensif audit).

---

## 15. Git Safety

Verifikasi status git akhir:
- `git status --short`: Mempertahankan 20 file modifikasi sesi S2 sebelumnya secara utuh.
- `git diff --stat`: Tidak ada baris kode produksi backend/frontend, skema, atau test yang diubah oleh auditor.
- **NOL** command destruktif dijalankan (`git add`, `git commit`, `git push`, `git reset`, `git clean`, `git checkout`, `git restore` tidak pernah dipanggil).

---

## 16. FINAL VERDICT

Berdasarkan standar audit rekonsiliasi yang ketat dan temuan independen:

# **FAIL**

### Alasan Keputusan:
Meskipun 64 dari 65 endpoint SAD §10 berhasil direkonsiliasikan dengan status MATCH (98.46%) dan seluruh 65 endpoint diimplementasikan secara fungsional tanpa ada yang hilang (0 MISSING ACTUAL), audit menemukan **1 inkonsistensi otorisasi material (Severity HIGH)** pada endpoint kanonikal:
- **`GET /api/v1/users/:id/organizational-assignments`** (`SAD §10.2`):
  SAD mensyaratkan akses dibatasi hanya untuk `SystemAdmin, HRGA, pemilik`. Pada implementasi aktual (`backend/src/modules/identity/identity.controller.ts:74` dan `backend/src/modules/identity/identity.service.ts:326`), endpoint dapat diakses oleh seluruh pengguna terautentikasi tanpa pembatasan peran atau validasi kepemilikan resource (`caller.userId === targetUserId`).

Sesuai dengan **Standard S2 (Section 30: "JANGAN mengoptimalkan hasil untuk PASS. Jika SAD dan implementation berbeda: laporkan perbedaannya")**, ketidaksesuaian otorisasi peran/scope pada rute bisnis resmi diklasifikasikan sebagai temuan material yang mencegah pemberian predikat kelulusan tanpa remediasi.

### Rekomendasi Remediasi Pasca-Audit (Tahap S2 Closure):
1. **Remediasi Otorisasi (E6/E7-1)**:
   Perbarui `IdentityController.getOrganizationalAssignments` untuk menyuntikkan `@CurrentUser() user: CurrentUserPayload`, dan tambahkan validasi pada `IdentityService.getOrganizationalAssignments` agar menolak akses (`ForbiddenException`) jika `user.role` bukan `SystemAdmin` atau `HRGA`, dan `user.userId !== targetUserId`.
2. **Harmonisasi Dokumentasi (E2-1, E2-2, E2-3, E2-4)**:
   Tambahkan baris ringkasan untuk `GET /users/{id}`, `GET /exceptions/{id}`, dan `GET /reports/exception-summary` ke dalam tabel ringkasan SAD §10.2, §10.6, dan §10.11 agar katalog dokumentasi sepenuhnya sinkron dengan kebutuhan operasional sistem.
