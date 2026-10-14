# S3-T4-FIND-04 — Controlled Remediation Implementation Report
## Penyelarasan Kontrak Pengajuan Blocker & Eliminasi Error Masking

| Metadata | Nilai |
|---|---|
| **ID Finding** | `S3-T4-FIND-04` |
| **Kategori** | Error Handling & Contract Alignment Remediation |
| **Status Temuan** | **IMPLEMENTATION COMPLETE — PENDING INDEPENDENT VERIFICATION** |
| **Tanggal Implementasi** | 9 Oktober 2026 |
| **Otorisasi Keputusan** | User Approval D-1 (v-radio-group), D-2 (Transparent Error Handling / Deprecation), D-3 (Scope-Limited Execution) |
| **Dokumen Rujukan** | `Design-Artifacts/Reports/S3-T4-FIND-04-Remediation-Plan.md`, PRD v1.1, UI/UX Spec v1.2, SAD v1.0, Product Backlog v1.0 |

---

## 1. Ringkasan Eksekutif

Sesuai persetujuan pengguna atas rencana remediasi pada `Design-Artifacts/Reports/S3-T4-FIND-04-Remediation-Plan.md`, implementasi remediasi untuk temuan **`S3-T4-FIND-04`** telah berhasil diselesaikan secara menyeluruh di lingkup frontend dan test suite:

1. **Eliminasi Ketergantungan Endpoint Administratif**:
   `RaiseBlockerModal.vue` tidak lagi memanggil `useBlockerOwnersQuery` maupun endpoint administratif `GET /api/v1/users?limit=100&status=Active` yang sebelumnya menghasilkan HTTP 403 Forbidden bagi pengguna `Employee` dan `Supervisor`.
2. **Penyelarasan Kontrak Formulir dengan SAD §10.4 & DTO Backend**:
   Input pengguna individual (`targetOwnerUserId`) digantikan dengan pemilihan tipe wewenang (`ownerNeededType`: `OrganizationalAuthority` vs `ProjectAuthority`) menggunakan `v-radio-group` (Keputusan D-1) serta input kondisional `relatedScopeReference`.
3. **Penyelarasan Payload Frontend**:
   Interface `CreateBlockerPayload` diselaraskan 100% dengan `CreateBlockerDto` backend: field `impactDescription` diubah menjadi `impact`, `targetOwnerUserId` dihapus, dan `ownerNeededType` serta `relatedScopeReference` ditambahkan.
4. **Penghapusan Error Masking**:
   Blok `catch { return []; }` yang sebelumnya menelan error HTTP 403, 500, dan kegagalan jaringan pada `useBlockerOwnersQuery` telah dihapus. Query kini mempropagasi status error secara transparan melalui state TanStack Query (`status: 'error'`, `isError: true`, `error: errorResponse`).
5. **Verifikasi Kualitas Penuh**:
   - `npx tsc --noEmit` (TypeScript typecheck): **PASS (Exit Code 0)**.
   - `npm run build:frontend` (Production bundle build): **PASS (Exit Code 0)** dalam 840ms.
   - Seluruh test suite frontend (9 test files, 117 tests): **PASS 100% (Exit Code 0)**.
   - Seluruh test suite backend blocker (2 test files, 44 tests): **PASS 100% (Exit Code 0)** tanpa regresi.

---

## 2. Rincian Perubahan File dan Alasan Teknis

| No | File Path | Kategori | Alasan Perubahan & Rincian Teknis |
|---|---|---|---|
| 1 | `frontend/src/types/daily-records.ts` | Type Definition | - Menambahkan export type `OwnerNeededType = 'OrganizationalAuthority' \| 'ProjectAuthority'`.<br>- Memperbarui interface `CreateBlockerPayload`: mengganti `impactDescription` dengan `impact`, menghapus `targetOwnerUserId`, menambahkan `ownerNeededType` dan `relatedScopeReference?: string`. |
| 2 | `frontend/src/components/self-service/RaiseBlockerModal.vue` | UI Component | - Menghapus komponen `v-autocomplete` yang sebelumnya mengikat `targetOwnerUserId` dan mengambil data dari `useBlockerOwnersQuery`.<br>- Menambahkan `v-radio-group` untuk `ownerNeededType` dengan dua opsi: *Atasan Langsung (Organizational Authority)* dan *Pemilik Wewenang Proyek (Project Authority)* (Keputusan D-1).<br>- Menambahkan teks petunjuk kontekstual untuk masing-masing opsi wewenang.<br>- Menambahkan text field kondisional `relatedScopeReference` yang wajib diisi saat memilih `ProjectAuthority`.<br>- Mengubah model input deskripsi hambatan menjadi `impact` dengan validasi `rules.minLength(5)` sesuai batasan DTO `@MinLength(5)`.<br>- Menyesuaikan input `expectedResolution` menjadi input bertipe `date` (Target Tanggal Resolusi) sesuai format ISO Date DTO.<br>- Memperbarui `handleSubmit` untuk mengirim payload yang sesuai kontrak dan menangkap pesan error respons secara transparan di dalam `v-alert`.<br>- Menghapus import `useBlockerOwnersQuery` dan `BlockerOwnerOption`. |
| 3 | `frontend/src/queries/useBlockers.ts` | Query Hook | - Menghapus blok `catch { return []; }` dari `useBlockerOwnersQuery` yang sebelumnya menyamarkan error HTTP 403/500.<br>- Menandai fungsi dengan JSDoc `@deprecated` karena tidak lagi dipakai pada form pengajuan blocker.<br>- Memastikan query membiarkan error terpropagasi ke state TanStack Query untuk komponen administratif lain yang masih memanggilnya. |
| 4 | `frontend/tests/raise-blocker.spec.ts` | Test Suite | - Memperbarui unit test modal blocker pada Bagian A:<br>&nbsp;&nbsp;a. Pengujian pengiriman `ownerNeededType: 'OrganizationalAuthority'` dan `impact`.<br>&nbsp;&nbsp;b. Pengujian instant blocker dengan `linkedCommitmentId: undefined`.<br>&nbsp;&nbsp;c. Pengujian `ProjectAuthority` dengan input dan payload `relatedScopeReference`.<br>&nbsp;&nbsp;d. Pengujian penanganan error transparan saat mutasi gagal (HTTP 400). |
| 5 | `frontend/tests/s3-t4-remediation.spec.ts` | Regression Test | - Memperbarui pengujian `FIND-04` pada `useBlockerOwnersQuery`: mengganti ekspektasi usang yang memverifikasi array kosong saat 403 dengan verifikasi bahwa HTTP 403 terpropagasi secara transparan (`res.status === 'error'`, `isError.value === true`, `error.value === errorResponse`). |

---

## 3. Pemetaan Requirement, Payload Frontend, DTO Backend, dan Resolusi Owner

```
+--------------------------------------------------------------------------------------------------------------------------+
| ELEMEN KONTRAK          | PRD / SAD REQUIREMENT    | DTO BACKEND (CreateBlockerDto) | IMPLEMENTASI FRONTEND TERKINI              |
+--------------------------------------------------------------------------------------------------------------------------+
| Tipe Blocker            | PRD FR-16, SAD §10.4     | type: string                   | blockerType.value (v-select)               |
| Severity                | PRD FR-16, SAD §10.4     | severity: BlockerSeverity      | severity.value (v-select)                  |
| Dampak Hambatan         | PRD FR-16, SAD §10.4     | impact: string (min 5 chars)   | impact.value (v-textarea, minLength 5)     |
| Tipe Otoritas           | PRD FR-19, SAD §5.5, §8.9| ownerNeededType: Enum          | ownerNeededType.value (v-radio-group)      |
| Referensi Lingkup       | PRD FR-19, SAD §8.9      | relatedScopeReference?: string | relatedScopeReference.value (kondisional)  |
| Target Resolusi         | PRD FR-16, SAD §10.4     | expectedResolution?: ISO Date  | expectedResolution.value (type="date")     |
| Tautan Komitmen         | PRD FR-15, SAD §10.4     | linkedCommitmentId?: UUID      | props.commitmentId (opsional)              |
| Pemilik Individu        | SAD §8.9, §10.4          | Diresolusi Otomatis di Server  | DIHAPUS DARI FORM FRONTEND (Server Resolves)|
+--------------------------------------------------------------------------------------------------------------------------+
```

### Alur Resolusi Owner di Backend (`BlockerOwnerResolverService`)
1. **Jalur Organizational Authority** (`ownerNeededType: 'OrganizationalAuthority'`):
   Sistem mengambil ID pelapor (`userId`), membaca relasi `OrganizationalAssignment` aktif pelapor, dan otomatis menetapkan `ownerNeededUserId = directManagerId`.
2. **Jalur Project Authority** (`ownerNeededType: 'ProjectAuthority'`):
   Sistem mencocokkan `relatedScopeReference` pada tabel `ProjectAuthorityMapping`. Jika mapping aktif ditemukan, `ownerNeededUserId` ditetapkan ke user Project Authority tersebut. Jika tidak ditemukan, sistem melakukan *safe fallback* ke `directManagerId` pelapor.

---

## 4. Hasil Pengujian dan Bukti Verifikasi

### 4.1 Typecheck Frontend (`npx tsc --noEmit`)
Perintah:
```bash
npx tsc --noEmit
```
Hasil:
- **Exit Code**: `0`
- **Output**: Bersih tanpa diagnostic error.

### 4.2 Production Build Frontend (`npm run build:frontend`)
Perintah:
```bash
npm run build:frontend
```
Hasil:
- **Exit Code**: `0`
- **Waktu Build**: 840ms
- **Output**: Seluruh 874 modul berhasil ditransformasi dan dibundel ke direktori `dist/` tanpa warning atau error.

### 4.3 Test Suite Frontend Spesifik (`tests/raise-blocker.spec.ts` & `tests/s3-t4-remediation.spec.ts`)
Perintah:
```bash
npx vitest run tests/raise-blocker.spec.ts tests/s3-t4-remediation.spec.ts
```
Hasil:
```
 ✓ tests/s3-t4-remediation.spec.ts (10 tests) 301ms
 ✓ tests/raise-blocker.spec.ts (11 tests) 1571ms

 Test Files  2 passed (2)
      Tests  21 passed (21)
   Duration  7.89s
```
- **Exit Code**: `0`

### 4.4 Seluruh Test Suite Frontend (`npm --prefix frontend test`)
Perintah:
```bash
npm --prefix frontend test
```
Hasil:
```
 ✓ tests/admin-user-management.spec.ts (8 tests)
 ✓ tests/admin-organization-and-reviewer.spec.ts (12 tests)
 ✓ tests/remediation-def01-def02.spec.ts (7 tests)
 ✓ tests/s3-t4-remediation.spec.ts (10 tests)
 ✓ tests/remediation-def03-def04-def05-gap01.spec.ts (7 tests)
 ✓ tests/carry-over-draft.spec.ts (12 tests)
 ✓ tests/policy-settings.spec.ts (20 tests)
 ✓ tests/raise-blocker.spec.ts (11 tests)
 ✓ tests/role-based-prompt.spec.ts (30 tests)

 Test Files  9 passed (9)
      Tests  117 passed (117)
   Duration  10.20s
```
- **Exit Code**: `0` (117/117 passed).

### 4.5 Pengujian Regresi Backend (`npm --prefix backend test -- src/modules/blocker/`)
Perintah:
```bash
npm --prefix backend test -- src/modules/blocker/
```
Hasil:
```
 ✓ src/modules/blocker/services/blocker-owner-resolver.service.spec.ts (16 tests)
 ✓ src/modules/blocker/blocker.service.spec.ts (28 tests)

 Test Files  2 passed (2)
      Tests  44 passed (44)
   Duration  752ms
```
- **Exit Code**: `0` (44/44 passed).

---

## 5. Bukti Alur Pengajuan Blocker oleh Employee dan Eliminasi Error Masking

### 5.1 Alur Pengajuan Blocker oleh Employee
1. Pengguna `Employee` membuka modal dari header ("*Raise Instant Blocker*") atau dari tombol kartu komitmen ("*Laporkan Blocker*").
2. Modal terbuka seketika tanpa memerlukan pemanggilan endpoint administratif `GET /api/v1/users`.
3. Pilihan wewenang default ke **"Atasan Langsung (Organizational Authority)"**.
4. Pengguna mengisi tipe, tingkat keparahan (severity), dan deskripsi dampak (impact, minimal 5 karakter).
5. Jika pengguna memilih **"Pemilik Wewenang Proyek (Project Authority)"**, input teks **"Referensi Ruang Lingkup Proyek (Scope Reference)"** muncul dan wajib diisi.
6. Saat tombol *"Kirim Blocker"* diklik, validasi client-side memastikan seluruh input sah, lalu mutasi mengirimkan payload:
   ```json
   {
     "type": "Technical",
     "severity": "Medium",
     "impact": "Database down di staging",
     "ownerNeededType": "OrganizationalAuthority",
     "linkedCommitmentId": "commit-456"
   }
   ```
7. Backend menerima request pada `POST /api/v1/blockers`, memvalidasi DTO, menjalankan `BlockerOwnerResolverService.resolveOwnerNeeded`, dan menyimpan blocker dengan status `Open` serta menugaskannya langsung ke Direct Manager pelapor.

### 5.2 Bukti Eliminasi Error Masking
1. `useBlockerOwnersQuery` tidak lagi memiliki blok `try ... catch { return []; }`.
2. Ketika API gagal (misalnya HTTP 403 Forbidden pada `getPotentialOwners`), query TanStack membiarkan error terpropagasi:
   - `query.isError.value` menjadi `true`.
   - `query.error.value` berisi objek error respons asli (`{ status: 403, data: { message: 'Forbidden' } }`).
   - `query.data.value` bernilai `undefined` (bukan disamarkan sebagai array kosong sukses `[]`).
3. Pada `RaiseBlockerModal.vue`, seluruh kegagalan mutasi pembuatan blocker (`err`) ditangkap dan ditampilkan secara jelas di komponen `v-alert` (variant="tonal", color="error") dengan pesan kesalahan spesifik dari server atau jaringan.

---

## 6. Status Pemenuhan Acceptance Criteria

| ID | Acceptance Criterion | Status | Bukti Verifikasi |
|---|---|---|---|
| **AC-01** | Employee dapat mengajukan blocker tanpa error 403 atau dropdown kosong | **FULFILLED** | Ketergantungan terhadap `GET /api/v1/users` dihapus 100% dari modal. |
| **AC-02** | Owner ditentukan kontekstual oleh backend via `ownerNeededType` | **FULFILLED** | Form menyediakan `v-radio-group` (`OrganizationalAuthority` / `ProjectAuthority`) yang diteruskan langsung ke backend resolver. |
| **AC-03** | Kegagalan mengambil data/mutasi ditampilkan secara transparan | **FULFILLED** | `useBlockerOwnersQuery` mempropagasi error tanpa masking; modal menampilkan alert error saat mutasi gagal. |
| **AC-04** | Validasi form tidak menghalangi alur yang sah | **FULFILLED** | Aturan validasi selaras dengan DTO backend (`impact` min 5 karakter, `scopeReference` wajib hanya saat ProjectAuthority). |
| **AC-05** | Payload frontend sesuai dengan DTO dan service backend | **FULFILLED** | Field `impactDescription` $\rightarrow$ `impact`, `targetOwnerUserId` dihapus, `ownerNeededType` ditambahkan. |
| **AC-06** | Tidak ada warning TanStack Query akibat nilai `undefined` | **FULFILLED** | Hook mengembalikan struktur query standar; typecheck dan test 100% clean. |
| **AC-07** | Test mencakup skenario sukses, otorisasi, dan penanganan error | **FULFILLED** | `raise-blocker.spec.ts` dan `s3-t4-remediation.spec.ts` memverifikasi seluruh varian alur. |
| **AC-08** | Zero regression pada test suite backend dan frontend | **FULFILLED** | 117/117 frontend tests pass; 44/44 backend blocker tests pass. |

---

## 7. Status Git dan Baseline Integrity

### 7.1 Status Git Sebelum Implementasi
Working tree memiliki modifikasi baseline dari tugas sebelumnya (termasuk escaped-slash pada `MyTodayPage.vue`) serta artefak laporan.

### 7.2 File yang Dimodifikasi pada Implementasi Ini
1. `frontend/src/types/daily-records.ts`
2. `frontend/src/components/self-service/RaiseBlockerModal.vue`
3. `frontend/src/queries/useBlockers.ts`
4. `frontend/tests/raise-blocker.spec.ts`
5. `frontend/tests/s3-t4-remediation.spec.ts`

### 7.3 Integritas Baseline yang Dipertahankan
- Perubahan escaped-slash pada placeholder `frontend/src/pages/MyTodayPage.vue` baris 329 (`:placeholder="'https:\/\/jira... atau #PROJ-123'"`) terverifikasi **100% utuh dan tidak tersentuh**.
- Tidak ada file backend, skema Prisma, dependensi, konfigurasi build, atau dokumen desain yang dimodifikasi.
- Tidak ada commit atau push yang dilakukan.

---

## 8. Status Akhir

`IMPLEMENTATION COMPLETE — PENDING INDEPENDENT VERIFICATION`

Temuan `S3-T4-FIND-04`, `S3-T4`, dan `S2-T5-EVID-01` **tetap berstatus OPEN** dan tidak ditutup pada tahap ini, sesuai batasan tata kelola. Pekerjaan berhenti di sini untuk menunggu pemeriksaan dan verifikasi independen berikutnya.
