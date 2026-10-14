# S2-T3 — Remediation Report
## E6/E7 Authorization Finding + API Documentation Reconciliation
### Status: REMEDIATION COMPLETE — INDEPENDENT VERIFICATION PENDING

---

## 1. Baseline Working Tree

Sebelum eksekusi remediasi, kondisi working tree diverifikasi:
- Sebanyak 21 file terlacak telah mengalami modifikasi teruji dari sesi S2 sebelumnya (S2-T1, S2-T1b, S2-T2, dan S2-T3 Audit).
- File untracked mencakup artefak register audit dan pengujian terdahulu:
  - `Design-Artifacts/10-S2-Audit-Findings-Register.md`
  - `Design-Artifacts/11-S2-T1-Traceability-Matrix.md`
  - `Design-Artifacts/12-S2-T1-Gap-Register.md`
  - `Design-Artifacts/13-S2-T2-Forbidden-Feature-Audit.md`
  - `Design-Artifacts/14-S2-T3-Endpoint-Reconciliation.md`
  - `Design-Artifacts/Reports/S2-T3-Endpoint-Reconciliation-Report.md`
- Baseline pengujian sebelum remediasi:
  - Backend: 618/618 tests PASS
  - Frontend: 91/91 tests PASS
- Seluruh perubahan working tree sebelumnya dipertahankan secara utuh tanpa reset, clean, checkout, atau restore.

---

## 2. Governing Contract Reviewed

Remediasi ini berlandaskan pada hierarki otoritas tata kelola WorkPulse:
1. **PDD & PRD**: Hak akses hierarki organisasi, peran `SystemAdmin`, `HRGA`, dan privasi data karyawan.
2. **SAD §10.2**:
   - `GET /api/v1/users/{id}/organizational-assignments` secara eksplisit menetapkan wewenang peran: `SystemAdmin`, `HRGA`, `pemilik`.
   - `GET /api/v1/users/{id}` merupakan endpoint query profil pengguna tunggal.
3. **SAD §10.6**: `GET /api/v1/exceptions/{id}` adalah endpoint query detail dispensasi/cuti yang dilindungi filter scope (SAD §7.7, §8.11).
4. **SAD §10.9 & §8.10**: Penugasan Policy Owner oleh `SystemAdmin` (BR-15). Rute kanonikal: `POST /api/v1/policy-owner-assignments`.
5. **SAD §10.11 & §13.2**: `ExceptionSummaryWidget` pada dashboard dan laporan formal berbagi agregasi yang sama via `GET /api/v1/reports/exception-summary`.
6. **ADR-010 & ADR-011**: Otorisasi transport HTTP memvalidasi sesi dan peran dasar, sementara otorisasi kontekstual kepemilikan sumber daya (*resource ownership*) dan cakupan organisasional dieksekusi di domain service layer.

---

## 3. E6/E7-1 Root Cause

Pada audit S2-T3, ditemukan bahwa:
1. Endpoint `GET /api/v1/users/:id/organizational-assignments` pada `IdentityController` tidak memiliki decorator otorisasi peran (`@RequireRole`) dan tidak menerima context pengguna yang login (`@CurrentUser()`).
2. Service `IdentityService.getOrganizationalAssignments(userId)` hanya menerima parameter `userId: string` dari path URL dan langsung menjalankan query Prisma `findMany({ where: { userId } })`.
3. Akibatnya, setiap pengguna terautentikasi (termasuk karyawan biasa dengan peran `Role.Employee`) dapat meminta riwayat penugasan organisasi, peran masa lalu, dan atasan langsung milik pengguna lain secara sewenang-wenang tanpa validasi kepemilikan akun.
4. Ini melanggar klausul otorisasi SAD §10.2: `SystemAdmin, HRGA, pemilik`.

---

## 4. Authorization Decision

Penyelesaian otorisasi server-side diimplementasikan dengan mematuhi konvensi arsitektur WorkPulse:
1. **Controller Layer (`IdentityController`)**:
   - Menginjeksi `@CurrentUser() caller: CurrentUserPayload` yang diekstrak langsung dari token JWT terverifikasi oleh `AuthGuard`. Identitas pemanggil tidak pernah dipercaya dari body atau query client.
   - Meneruskan `caller` context ke domain service: `this.identityService.getOrganizationalAssignments(id, caller)`.
2. **Service Layer (`IdentityService`)**:
   - Menegakkan otorisasi kontekstual:
     - Jika `caller.role === Role.SystemAdmin` $\rightarrow$ **ALLOW** (akses administratif penuh).
     - Jika `caller.role === Role.HRGA` $\rightarrow$ **ALLOW** (wewenang audit & personil organisasi).
     - Jika `caller.userId === targetUserId` $\rightarrow$ **ALLOW** (akses riwayat penugasan milik sendiri).
     - Selain kondisi di atas (misal Employee membaca data user lain, atau peran manajerial yang bukan pemilik/admin/HRGA) $\rightarrow$ **DENY**, melempar `ForbiddenException` (HTTP 403).
     - Jika konteks pemanggil tidak ada $\rightarrow$ **DENY**, melempar `ForbiddenException`.
   - Validasi keberadaan target user via `this.getUserById(userId)` tetap dijalankan setelah otorisasi caller terkonfirmasi.

---

## 5. Files Changed

1. `backend/src/modules/identity/identity.controller.ts` (Modifikasi handler controller untuk menyuntikkan `CurrentUser`).
2. `backend/src/modules/identity/identity.service.ts` (Modifikasi service method untuk menegakkan aturan otorisasi SAD §10.2).
3. `backend/test/identity/identity.controller.spec.ts` (Penambahan unit test delegasi controller).
4. `backend/test/identity/identity.service.spec.ts` (Penambahan unit test 7 invariant keamanan).
5. `Design-Artifacts/05-SAD.md` (Penyelarasan dokumentasi katalog endpoint SAD §10).
6. `backend/openapi.json` (Regenerasi OpenAPI specification via `npm run openapi:generate`).

---

## 6. Exact Implementation Change

### A. `IdentityController` (`backend/src/modules/identity/identity.controller.ts`)
```typescript
// Import CurrentUser dan CurrentUserPayload
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

// Handler GET /api/v1/users/:id/organizational-assignments
@Get('users/:id/organizational-assignments')
async getOrganizationalAssignments(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() caller: CurrentUserPayload,
) {
  return this.identityService.getOrganizationalAssignments(id, caller);
}
```

### B. `IdentityService` (`backend/src/modules/identity/identity.service.ts`)
```typescript
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

/**
 * EPIC-04-T2: Mengambil riwayat assignment organisasi user (SAD §10.2).
 * Otorisasi: SystemAdmin, HRGA, atau pemilik akun (caller.userId === targetUserId).
 */
async getOrganizationalAssignments(
  userId: string,
  caller?: CurrentUserPayload,
): Promise<OrganizationalAssignment[]> {
  if (!caller) {
    throw new ForbiddenException(
      'Akses ditolak: Konteks pengguna autentikasi wajib disertakan',
    );
  }

  const isSystemAdmin = caller.role === Role.SystemAdmin;
  const isHrga = caller.role === Role.HRGA;
  const isOwner = caller.userId === userId;

  if (!isSystemAdmin && !isHrga && !isOwner) {
    throw new ForbiddenException(
      'Akses ditolak: Hanya SystemAdmin, HRGA, atau pemilik akun yang dapat melihat riwayat penugasan organisasi (SAD §10.2)',
    );
  }

  await this.getUserById(userId);

  return this.prisma.organizationalAssignment.findMany({
    where: { userId },
    orderBy: { effectiveDate: 'desc' },
    include: {
      directManager: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
}
```

---

## 7. Security Invariants Tested

Tujuh skenario invariant keamanan diuji secara eksplisit pada level service dan controller:
1. **Case A (SystemAdmin $\rightarrow$ Target User Lain)**: `caller.role === Role.SystemAdmin` $\rightarrow$ **ALLOW**, mengembalikan riwayat penugasan target user.
2. **Case B (HRGA $\rightarrow$ Target User Lain)**: `caller.role === Role.HRGA` $\rightarrow$ **ALLOW**, mengembalikan riwayat penugasan target user.
3. **Case C (Owner Employee $\rightarrow$ Akun Sendiri)**: `caller.userId === targetUserId` $\rightarrow$ **ALLOW**, mengembalikan riwayat penugasan miliknya.
4. **Case D (Non-Owner Employee $\rightarrow$ Target User Lain)**: Bukan admin, bukan HRGA, bukan pemilik $\rightarrow$ **DENY**, melempar `ForbiddenException` (HTTP 403).
5. **Case E (Non-Owner Manajerial: Supervisor/Head/CEO $\rightarrow$ Target User Lain)**: Bukan admin, bukan HRGA, bukan pemilik $\rightarrow$ **DENY**, melempar `ForbiddenException` (HTTP 403).
6. **Case F (Missing Caller Context)**: Pemanggilan tanpa identitas pemanggil $\rightarrow$ **DENY**, melempar `ForbiddenException`.
7. **Case G (Authorized Caller $\rightarrow$ Non-Existent User)**: Caller berwenang tetapi ID pengguna target tidak ada di database $\rightarrow$ melempar `NotFoundException` (HTTP 404).

---

## 8. Test Results

- **Unit Test Baru**:
  - `backend/test/identity/identity.service.spec.ts`: 7 test case otorisasi ditambahkan pada blok `getOrganizationalAssignments (SAD §10.2, E6/E7-1 Remediation)`. Seluruhnya **PASS**.
  - `backend/test/identity/identity.controller.spec.ts`: 1 test case delegasi controller dengan caller context ditambahkan. Seluruhnya **PASS**.
- **Eksekusi Test Identity**:
  - Command: `npx vitest run test/identity/`
  - Hasil: **2 files passed, 34/34 tests passed (100% PASS)**.

---

## 9. Documentation Changes

Dokumen `Design-Artifacts/05-SAD.md` diselaraskan secara komprehensif:

1. **SAD §10.2 (IdentityModule)**:
   - Ditambahkan entri baris untuk `GET /api/v1/users/{id}` (Role: `Terautentikasi`, Response: `User detail`).
   - Diperbarui catatan otorisasi pada `GET /api/v1/users/{id}/organizational-assignments`: `5.11.a, caller role atau ownership divalidasi server-side`.
2. **SAD §10.6 (ExceptionModule)**:
   - Ditambahkan entri baris untuk `GET /api/v1/exceptions/{id}` (Role: `Sesuai scope`, Business Rule: `7.7, 8.11, 404 jika di luar scope`).
3. **SAD §10.9 (PolicyModule)**:
   - Ditambahkan entri baris untuk `POST /api/v1/policies/owner-assignments` (Role: `SystemAdmin`, Business Rule: `Alias/compatibility route untuk POST /policy-owner-assignments (BR-15)`).
4. **SAD §10.11 (ReportingModule)**:
   - Ditambahkan entri baris untuk `GET /api/v1/reports/exception-summary` (Role: `Supervisor, Head, HRGA, CEO/Management`, Business Rule: `SAD §13.2, melayani ExceptionSummaryWidget pada dashboard`).

---

## 10. E2-4 / E10-1 Alias Decision

Berdasarkan investigasi menyeluruh:
1. `PolicyController` memuat handler `@Post('owner-assignments')` di bawah controller prefix `policies`, menghasilkan rute `POST /api/v1/policies/owner-assignments`.
2. `PolicyOwnerAssignmentController` memuat handler `@Post()` di bawah controller prefix `policy-owner-assignments`, menghasilkan rute `POST /api/v1/policy-owner-assignments`.
3. Kedua handler memanggil method service yang sama persis (`policyService.createPolicyOwnerAssignment`) dan dilindungi oleh guard peran yang sama (`@RequireRole(Role.SystemAdmin)`).
4. **Keputusan**: Sesuai kaidah `CORRECTNESS > BACKWARD COMPATIBILITY > CLEANUP`, alias route **DIPERTAHANKAN** guna menjamin kompatibilitas endpoint dan mencegah potensi pemutusan integrasi klien. Status alias didokumentasikan secara formal pada tabel SAD §10.9 sebagai rute kompatibilitas berpasangan dengan rute kanonikal `POST /api/v1/policy-owner-assignments`.

---

## 11. ADR Decision

- **Status**: **NOT NEEDED**
- **Alasan**:
  - Penegakan otorisasi pada `GET /api/v1/users/:id/organizational-assignments` merupakan perbaikan implementasi terhadap requirement yang sudah ditetapkan sebelumnya pada SAD §10.2 dan sejalan dengan ADR-010/ADR-011.
  - Penyelarasan dokumentasi untuk E2-1, E2-2, E2-3, dan E2-4 mencerminkan rute-rute yang sudah ada di basis kode dan telah dirancang sejak awal (misal SAD §13.2 untuk `exception-summary`).
  - Tidak ada perubahan paradigma arsitektur baru atau pembentukan pola otorisasi di luar koridor governance existing.

---

## 12. Regression Results

Full regression testing dieksekusi setelah seluruh perubahan diimplementasikan:

1. **Backend Regression Test Suite**:
   - Command: `npm test` (di direktori `backend`)
   - Tool: Vitest v4.1.2
   - Hasil: **46/46 test files passed, 626/626 tests passed (100% PASS)**
   - Waktu eksekusi: 7.35s
   - Catatan: Semua 618 test sebelumnya tetap lulus, ditambah 8 test baru untuk otorisasi identity.
2. **Frontend Regression Test Suite**:
   - Command: `npm test` (di direktori `frontend`)
   - Tool: Vitest v4.1.2
   - Hasil: **6/6 test files passed, 91/91 tests passed (100% PASS)**
   - Waktu eksekusi: 7.10s

---

## 13. Summary Matrix of Findings & Actions

| Finding | Decision | Action Taken | Status |
|---|---|---|---|
| **E6/E7-1** | Remediate server-side enforcement | Menyuntikkan `@CurrentUser()` pada `IdentityController` dan memvalidasi `SystemAdmin`, `HRGA`, atau `caller.userId === targetUserId` pada `IdentityService.getOrganizationalAssignments` (throws `ForbiddenException`). | **Remediated** |
| **E2-1** | Reconcile documentation | Menambahkan `GET /api/v1/users/{id}` ke dalam tabel ringkasan SAD §10.2 sebagai endpoint query detail profil user terautentikasi. | **Reconciled** |
| **E2-2** | Reconcile documentation | Menambahkan `GET /api/v1/exceptions/{id}` ke dalam tabel ringkasan SAD §10.6 sebagai endpoint query detail dispensasi/cuti berbasis scope. | **Reconciled** |
| **E2-3** | Reconcile documentation | Menambahkan `GET /api/v1/reports/exception-summary` ke dalam tabel ringkasan SAD §10.11 sesuai basis arsitektur SAD §13.2. | **Reconciled** |
| **E2-4 / E10-1** | Retain as compatibility alias & document | Mempertahankan `POST /api/v1/policies/owner-assignments` untuk backward compatibility dan mendokumentasikannya di SAD §10.9 sebagai rute alias untuk `POST /api/v1/policy-owner-assignments`. | **Reconciled** |

---

## 14. Remaining Issues & Recommended Next Step

### Remaining Issues
- **None**: Seluruh kode produksi dan pengujian berjalan tanpa error, kegagalan test, ataupun regresi fungsional.

### Recommended Next Step
- Menyerahkan hasil remediasi kepada Independent Verification Agent untuk pelaksanaan verifikasi independen formal S2-T3 dan penutupan administratif finding pada `Design-Artifacts/10-S2-Audit-Findings-Register.md`.
