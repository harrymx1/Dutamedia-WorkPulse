# S3-T4-FIND-04 — Controlled Remediation Planning Report
## Penyelarasan Kontrak Pengajuan Blocker & Eliminasi Error Masking

| Metadata | Nilai |
|---|---|
| **ID Finding** | `S3-T4-FIND-04` |
| **Severity** | High (Critical Path Functional Blocker) |
| **Kategori** | Error Handling & Contract Integrity Discrepancy |
| **Status Temuan** | OPEN — Controlled Remediation Planning (Analysis Only) |
| **Tanggal Analisis** | 9 Oktober 2026 |
| **Referensi Utama** | PRD v1.1 (`02-PRD.md`), UI/UX Spec v1.2 (`03-UI-UX Spec & Flow Document.md`), SAD v1.0 (`05-SAD.md`), Product Backlog v1.0 (`06-Product Backlog.md`), ADR (`08-ADR.md`), `CreateBlockerDto` |

---

## 1. Ringkasan Defect dan Root Cause

### 1.1 Deskripsi Defect
Pemeriksaan verifikasi akhir perilaku menemukan bahwa implementasi pengajuan blocker (`RaiseBlockerModal.vue`) dan query pemilik wewenang (`useBlockerOwnersQuery` pada `frontend/src/queries/useBlockers.ts`) mengalami kegagalan fungsional kritis (*Error Masking* dan *Contract Mismatch*):

1. **Error Masking pada Query**:
   `useBlockerOwnersQuery` membungkus pemanggilan `blockersApi.getPotentialOwners()` dengan blok `catch` tanpa pemilahan error dan mengembalikan array kosong `[]`:
   ```ts
   // frontend/src/queries/useBlockers.ts:56-60
   } catch {
     // Jika peran pengguna tidak memiliki izin membaca seluruh master users (HTTP 403)
     // atau request gagal, kembalikan array kosong agar queryFn tidak pernah melempar undefined.
     return [];
   }
   ```
   Akibatnya, HTTP 403 Forbidden, HTTP 500 Server Error, maupun kegagalan koneksi jaringan disamarkan sebagai kondisi data kosong (*empty state*) tanpa indikator kesalahan bagi pengguna.

2. **Akses Ditolak (HTTP 403) untuk Role Non-Admin**:
   `blockersApi.getPotentialOwners()` memanggil endpoint `GET /api/v1/users?limit=100&status=Active`. Pada backend, endpoint ini diproteksi oleh:
   ```ts
   // backend/src/modules/identity/controllers/identity.controller.ts:35
   @Get()
   @RequireRole(Role.SystemAdmin, Role.HRGA)
   async findAllUsers(...)
   ```
   Role `Employee` dan `Supervisor` yang merupakan aktor utama pelaporan blocker operasional harian tidak memiliki role `SystemAdmin` atau `HRGA`, sehingga request selalu menghasilkan **HTTP 403 Forbidden**.

3. **Formulir Terkunci & Pengajuan Blocker Terhalang**:
   Di dalam `RaiseBlockerModal.vue` (baris 91–103), input pemilik wewenang menggunakan autocomplete yang diikat ke `targetOwnerUserId` dengan aturan validasi wajib diisi (`:rules="[rules.required]"`). Karena respons 403 disamarkan menjadi `[]`, dropdown selalu kosong, validasi form tidak dapat terpenuhi, dan pengguna `Employee` **secara permanen terhalang mengajukan blocker**.

4. **Inkonsistensi Kontrak Payload (Contract Drift)**:
   Payload yang dikirimkan oleh frontend saat submit (`RaiseBlockerModal.vue:253-260`) mengirimkan:
   `{ type, severity, targetOwnerUserId, impactDescription, expectedResolution?, linkedCommitmentId? }`
   Sedangkan DTO backend (`CreateBlockerDto`) mewajibkan:
   `{ type, severity, impact, ownerNeededType, relatedScopeReference?, expectedResolution?, linkedCommitmentId? }`
   Jika form frontend berhasil disubmit, request akan langsung ditolak oleh backend `ValidationPipe` dengan **HTTP 400 Bad Request** karena field `impact` dan `ownerNeededType` kosong.

### 1.2 Root Cause Analysis
- **Akar Masalah Arsitektural**: Terjadi *architectural drift* pada saat *frontend scaffolding* komponen `RaiseBlockerModal.vue`. Frontend mengasumsikan pola generik penugasan tiket bergaya *task board* (memilih sembarang pengguna individual dari master user), sedangkan arsitektur WorkPulse (SAD §5.5, §8.9, §10.4, dan PRD FR-19) secara ketat menetapkan **Contextual Owner Resolution** di mana pemilik wewenang blocker tidak dipilih sebagai individu bebas, melainkan ditentukan oleh sistem berdasarkan jenis kewenangan (`ownerNeededType`: `OrganizationalAuthority` atau `ProjectAuthority`).
- **Akar Masalah Error Handling**: Pada iterasi sebelumnya (penanganan warning TanStack Query v5 `Query data cannot be undefined`), pengembang menambahkan `try ... catch { return []; }` sebagai *quick fix* untuk meredam kegagalan pemanggilan `GET /api/v1/users`, yang secara tidak sengaja mematikan propagasi error HTTP 403 dan menyembunyikan akar masalah perizinan dari antarmuka pengguna.

---

## 2. Bukti Requirement dan Kontrak yang Berlaku

### 2.1 Matriks Penelusuran Dokumen Otoritatif

| Dokumen | Bagian / Pasal | Kutipan / Ketentuan Otoritatif | Status |
|---|---|---|---|
| **PRD v1.1** (`02-PRD.md`) | §3.4, **FR-19** (L129) | *"Owner Needed pada blocker dapat ditentukan melalui Organizational Authority atau Project Authority (contextual), sesuai konteks pekerjaan terkait."* | **Disahkan** |
| **PRD v1.1** (`02-PRD.md`) | §3.4, **FR-15–FR-16** (L125-126) | *"User dapat membuat blocker dari daily record atau sebagai instant blocker di luar siklus EOD. Blocker record menyimpan Type, Severity, Impact, Owner Needed, Raised At (auto), Expected Resolution (opsional), Status, dan Resolution Note."* | **Disahkan** |
| **UI/UX Spec v1.2** (`03-UI-UX Spec & Flow Document.md`) | §4.5 (L128-132) | *"Raise Instant Blocker: Dapat diakses kapan saja dari mana pun (tidak terkunci ke siklus Morning/EOD), termasuk saat baseline sudah locked. Form: Type, Severity, Impact, Owner Needed (lihat 4.9 authority context), Expected Resolution (opsional)."* | **Disahkan** |
| **UI/UX Spec v1.2** (`03-UI-UX Spec & Flow Document.md`) | §4.9 (L155) | *"Row/detail menampilkan Owner Needed berdasarkan authority context: sistem menandai apakah owner ditentukan lewat Organizational Authority (default) atau Project Authority (dipilih eksplisit) — perbedaan ini terlihat jelas di UI, bukan disamarkan sebagai satu 'assignee' generik."* | **Disahkan** |
| **SAD v1.0** (`05-SAD.md`) | §5.5 (L364-382) | Entitas `Blocker` mendefinisikan kolom: `ownerNeededType` (`ENUM(OrganizationalAuthority, ProjectAuthority)` — FR-19), `ownerNeededUserId` (`UUID (FK -> User)` — *Diresolusi kontekstual Section 8.9*), dan `relatedScopeReference` (`VARCHAR (nullable)`). Tidak ada kolom target owner input dari user. | **Disahkan** |
| **SAD v1.0** (`05-SAD.md`) | §8.9 (L910-921) | Resolusi Project Authority & Organizational Authority dieksekusi di backend service layer: jika `ProjectAuthority`, cari `ProjectAuthorityMapping`; jika tidak ada, fallback ke `OrganizationalAssignment.directManagerId`. Jika `OrganizationalAuthority`, langsung resolusi ke `directManagerId` pelapor. | **Disahkan** |
| **SAD v1.0** (`05-SAD.md`) | §8.11 (L937-943) | Scope-filtering di level query melarang Employee mengakses data pengguna di luar scope pribadinya. Endpoint master user `GET /users` hanya untuk admin/HRGA. | **Disahkan** |
| **SAD v1.0** (`05-SAD.md`) | §10.4 (L1136) | Endpoint `POST /api/v1/blockers`: Role: **Semua role**, Request Payload: `{ linkedCommitmentId?, type, severity, impact, ownerNeededType, expectedResolution? }`, Business Rule: **FR-15–FR-19, owner diresolusi backend**. | **Disahkan** |
| **Product Backlog v1.0** (`06-Product Backlog.md`) | **EPIC-08-T1** (L383) | *"Endpoint POST /blockers — resolusi owner via ScopeGuard/8.9 (§9.4, §10.4)"* | **Disahkan** |
| **Product Backlog v1.0** (`06-Product Backlog.md`) | **EPIC-19-T1** & **EPIC-19-T5** (L460, L464) | Halaman My Today & integrasi TanStack Query hooks untuk seluruh aksi self-service karyawan. | **Disahkan** |
| **ADR** (`08-ADR.md`) | ADR-010 / FR-19 (L670) | *"Domain Service (BlockerOwnerResolverService) menegakkan aturan bisnis kondisional FR-19: jika ownerNeededType === 'ProjectAuthority', maka relatedScopeReference wajib diisi dan dicocokkan dengan scopeReference aktif."* | **Disahkan** |

### 2.2 Jawaban Eksplisit Terhadap Pertanyaan Evaluasi Wajib

#### 1. Apakah pengguna memang harus memilih individu sebagai owner?
> **Jawaban: TIDAK.**
> - **Fakta Terdokumentasi**: PRD FR-19, UI/UX Spec §4.5 & §4.9, dan SAD §5.5 & §8.9 menyatakan bahwa pengguna menentukan konteks wewenang (*authority context*), yaitu apakah blocker membutuhkan kewenangan organisasional struktural (`OrganizationalAuthority`) atau kewenangan lingkup proyek (`ProjectAuthority`).
> - **Bukti Teknis**: SAD §10.4 secara eksplisit menyatakan *"owner diresolusi backend"*. Pengguna tidak pernah diminta mencari dan memilih nama individu rekan kerja atau atasan secara manual dari daftar master karyawan.

#### 2. Apakah backend seharusnya menentukan owner berdasarkan `ownerNeededType`?
> **Jawaban: YA, BENAR.**
> - **Fakta Terdokumentasi**: SAD §8.9 dan Backlog EPIC-08-T1 menetapkan algoritma resolusi di backend.
> - **Hasil Inspeksi Kode**: Backend telah mengimplementasikan ini secara lengkap dan teruji di `BlockerOwnerResolverService.ts:26-92` dan `BlockerService.ts:121-128`.
>   - Jika `ownerNeededType === 'OrganizationalAuthority'`, backend mencari `OrganizationalAssignment.directManagerId` dari user pelapor.
>   - Jika `ownerNeededType === 'ProjectAuthority'`, backend mencocokkan `relatedScopeReference` pada tabel `ProjectAuthorityMapping`; jika mapping tidak ditemukan, sistem melakukan *safe fallback* ke `directManagerId` pelapor.

#### 3. Field dan payload apa yang benar-benar diwajibkan kontrak backend?
> **Jawaban:**
> Berdasarkan `backend/src/modules/blocker/dto/create-blocker.dto.ts` (baris 13–49):
>
> | Field | Tipe | Wajib / Opsional | Validasi Backend (`class-validator`) |
> |---|---|---|---|
> | `type` | `string` | **Wajib** | `@IsNotEmpty`, `@IsString`, `@MaxLength(100)` |
> | `severity` | `BlockerSeverity` | **Wajib** | `@IsNotEmpty`, `@IsEnum(BlockerSeverity)` (`Low`, `Medium`, `High`, `Critical`) |
> | `impact` | `string` | **Wajib** | `@IsNotEmpty`, `@IsString`, `@MinLength(5)` |
> | `ownerNeededType` | `OwnerNeededType` | **Wajib** | `@IsNotEmpty`, `@IsEnum(OwnerNeededType)` (`OrganizationalAuthority`, `ProjectAuthority`) |
> | `relatedScopeReference` | `string` | **Kondisional** | `@IsOptional`, `@IsString`, `@MaxLength(255)`. *Wajib diisi di domain logic jika `ownerNeededType === 'ProjectAuthority'` (FR-19)* |
> | `expectedResolution` | `string` (ISO Date) | Opsional | `@IsOptional`, `@IsDateString` |
> | `linkedCommitmentId` | `string` (UUID) | Opsional | `@IsOptional`, `@IsUUID('all')` |
>
> **Catatan Kritis**: Field `targetOwnerUserId` dan `impactDescription` **TIDAK ADA** pada kontrak backend.

#### 4. Apakah perubahan dari `targetOwnerUserId` menjadi `ownerNeededType` sesuai requirement yang disahkan, atau baru merupakan usulan?
> **Jawaban: SESUAI REQUIREMENT YANG DISAHKAN (Bukan Usulan Baru).**
> - Kontrak `ownerNeededType` sudah disahkan sejak penetapan PRD v1.1 (FR-19), SAD v1.0 (§5.5, §8.9, §10.4), dan Product Backlog (EPIC-08-T1).
> - Keberadaan `targetOwnerUserId` di frontend adalah **penyimpangan implementasi (*implementation drift*)** yang tidak pernah ada di dokumen desain maupun DTO backend. Menghapus `targetOwnerUserId` dan menggunakan `ownerNeededType` adalah tindakan **pemulihan kepatuhan (*reconciliation to baseline*)**, bukan usulan perubahan arsitektur baru.

#### 5. Apakah alur pengajuan blocker oleh Employee didukung oleh rancangan sistem?
> **Jawaban: YA, SEPENUHNYA DIDUKUNG.**
> - SAD §10.4 menetapkan bahwa `POST /api/v1/blockers` terbuka untuk **"Semua role"** terautentikasi (termasuk `Employee`).
> - Controller backend (`BlockerController.ts:30-40`) tidak memasang batasan `@RequireRole`, sehingga Employee dapat memanggil endpoint ini secara sah.
> - Hambatan yang dialami Employee saat ini semata-mata diakibatkan oleh frontend yang keliru memanggil endpoint admin `GET /api/v1/users` untuk mengisi dropdown yang sebenarnya tidak dibutuhkan.

---

## 3. Evaluasi Opsi Remediasi dan Trade-Off

### 3.1 Perbandingan Komprehensif Opsi

```
+---------------------------------------------------------------------------------------------------+
| DIMENSI                 | OPSI A: Penyelarasan Penuh ke Kontrak SAD | OPSI B: Mempertahankan Pemilihan User |
+---------------------------------------------------------------------------------------------------+
| Deskripsi Inti          | Mengubah UI RaiseBlockerModal agar sesuai | Membuat endpoint user baru / buka    |
|                         | SAD §10.4 & FR-19 (pilih tipe otoritas,   | akses GET /users ke Employee, lalu   |
|                         | kirim ownerNeededType & impact).          | ubah DTO backend terima targetOwner.  |
+---------------------------------------------------------------------------------------------------+
| Kesesuaian Dokumen      | 100% Selaras (PRD FR-19, SAD §8.9, §10.4, | Bertentangan dengan SAD §5.5, §8.9,  |
|                         | UI/UX Spec §4.5, Backlog EPIC-08-T1).     | §10.4, dan PRD FR-19.               |
+---------------------------------------------------------------------------------------------------+
| Dampak Peran Employee   | Sangat Positif: Form mudah diisi,         | Negatif: Karyawan bingung memilih    |
|                         | eskalasi otomatis ke atasan/PM tanpa repot| siapa yang berwenang dari ratusan    |
|                         | mencari nama atasan/PM di daftar user.    | karyawan perusahaan.                 |
+---------------------------------------------------------------------------------------------------+
| Keamanan & Privasi      | Terjaga penuh: Employee tidak butuh akses | Berisiko: Melanggar scope filtering  |
|                         | ke direktori seluruh karyawan (SAD §8.11).| (SAD §8.11) karena membuka master    |
|                         |                                           | user ke seluruh karyawan.            |
+---------------------------------------------------------------------------------------------------+
| Perubahan Backend       | NOL (0 file) — Backend sudah 100% sesuai  | BESAR: Ubah CreateBlockerDto,        |
|                         | dan memiliki 16 passing unit tests.       | BlockerService, database schema/FK,  |
|                         |                                           | buat endpoint dropdown baru.         |
+---------------------------------------------------------------------------------------------------+
| Perubahan Frontend      | Sedang: Update RaiseBlockerModal.vue,     | Kecil pada UI, tapi harus menangani  |
|                         | types/daily-records.ts, blockers.api.ts,  | error state 403/500/network pada     |
|                         | dan unit test raise-blocker.spec.ts.      | query dropdown user.                 |
+---------------------------------------------------------------------------------------------------+
| Risiko Regresi          | Sangat Rendah: Menghilangkan dependensi   | Tinggi: Merusak mekanisme eskalasi   |
|                         | eksternal GET /users dari modal blocker.  | otomatis dan hierarki organisasi.    |
+---------------------------------------------------------------------------------------------------+
| Kebutuhan Perubahan     | TIDAK BUTUH perubahan backlog. Merupakan  | BUTUH RFC & Persetujuan Desain Baru  |
| Backlog                 | pemenuhan langsung EPIC-19-T1/EPIC-08-T1. | (revisi PRD, SAD, DTO, Database).    |
+---------------------------------------------------------------------------------------------------+
```

### 3.2 Analisis Trade-Off Mendalam

#### Mengapa Opsi A Direkomendasikan Mutlak:
1. **Integritas Konseptual Sistem**: WorkPulse dibangun atas prinsip akuntabilitas terstruktur. Karyawan yang menghadapi blocker tidak seharusnya dibebani tanggung jawab mencari tahu siapa direktur atau manajer yang berwenang menindaklanjuti kendala tersebut. Cukup tentukan: apakah ini kendala struktural tim (*Organizational Authority*) atau kendala terkait deliverable proyek (*Project Authority*).
2. **Kesiapan Teknis (*Zero Backend Rework*)**: Service layer backend (`BlockerOwnerResolverService`) sudah memiliki implementasi lengkap yang menangani:
   - Pencocokan scope proyek aktif (`ProjectAuthorityMapping`).
   - Fallback otomatis ke Direct Manager jika mapping proyek tidak ditemukan.
   - Penugasan langsung ke Direct Manager pelapor untuk kendala organisasional.
   - Pencatatan log audit dan dispatch notifikasi eskalasi kritis (`SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER`).
3. **Efisiensi Remediasi**: Menghilangkan `useBlockerOwnersQuery` dari alur pembuatan blocker secara otomatis menghapus kebutuhan memanggil endpoint administratif `GET /api/v1/users`, sehingga seluruh masalah HTTP 403 dan *error masking* pada modal ini tereliminasi secara tuntas di akarnya (*eliminated by design*).

#### Mengapa Opsi B Ditolak:
1. Mengharuskan relaksasi kontrol keamanan (`GET /api/v1/users`), yang bertentangan dengan prinsip pembatasan visibilitas SAD §8.11.
2. Membuka celah *human error* di mana karyawan dapat salah menugaskan blocker kritis ke rekan kerja sejawat yang tidak memiliki wewenang struktural untuk menyelesaikannya.
3. Membutuhkan amandemen formal terhadap skema basis data Prisma, DTO, dan service backend yang telah lulus audit S2 dan S3.

---

## 4. Opsi yang Direkomendasikan dan Desain Solusi Detail

### 4.1 Rekomendasi: Opsi A (Penyelarasan Penuh ke Kontrak SAD)

Solusi yang direkomendasikan adalah melakukan refactoring pada komponen pengajuan blocker di frontend agar selaras 100% dengan kontrak `CreateBlockerDto` dan spesifikasi UI/UX Spec §4.5 & §4.9.

### 4.2 Desain Antarmuka Pengguna (`RaiseBlockerModal.vue`)
Formulir pengajuan blocker diperbarui dengan komponen kontrol berikut:

1. **Tipe Blocker (`type`)**:
   - Komponen: `v-select`
   - Pilihan: Technical, Inter-Team Dependency, Resource or Access, Scope or Requirement, Vendor or Third-Party, Other.
2. **Tingkat Keparahan (`severity`)**:
   - Komponen: `v-select` dengan indikator warna token.
   - Pilihan: Low, Medium, High, Critical.
3. **Pihak Berwenang / Jalur Eskalasi (`ownerNeededType`)** *(MENGGANTIKAN Autocomplete User)*:
   - Komponen: `v-radio-group` atau `v-select` (default: `OrganizationalAuthority`).
   - Opsi 1: `OrganizationalAuthority` — *Atasan Langsung (Direct Manager)*.
     - *Hint teks*: "Sistem akan menugaskan blocker secara otomatis ke atasan langsung Anda sesuai hierarki organisasi."
   - Opsi 2: `ProjectAuthority` — *Pemilik Wewenang Proyek / Project Authority*.
     - *Hint teks*: "Sistem akan menugaskan blocker ke Project Manager / PIC yang berwenang atas ruang lingkup pekerjaan ini."
4. **Referensi Ruang Lingkup Proyek (`relatedScopeReference`)** *(Kondisional)*:
   - Muncul hanya jika `ownerNeededType === 'ProjectAuthority'`.
   - Komponen: `v-text-field` (Wajib diisi jika ProjectAuthority dipilih).
   - Placeholder: "Contoh: PROJ-ALPHA, JIRA-102, atau Nama Inisiatif".
   - Helper text: "Wajib diisi untuk mencocokkan PIC otoritas proyek terkait."
5. **Deskripsi Dampak (`impact`)**:
   - Komponen: `v-textarea`.
   - Mengirim field payload `impact` (menggantikan nama lokal lama `impactDescription`).
   - Validasi: Minimal 5 karakter.
6. **Ekspektasi Solusi (`expectedResolution`)** *(Opsional)*:
   - Komponen: `v-text-field` bertipe date picker atau input teks/ISO date string.

---

## 5. Definisi Perilaku Error dan State Matrix

Untuk memastikan tidak ada lagi *error masking* dan penanganan kesalahan transparan bagi pengguna sesuai prinsip *Explicit Error Feedback*, matriks perilaku ditetapkan sebagai berikut:

| Skenario Operasional | Status / Kode HTTP | Perilaku Query / Mutation | Respon Antarmuka Pengguna (UI Treatment) |
|---|---|---|---|
| **Formulir Dibuka** | N/A (Client State) | Tidak ada HTTP request untuk data pemilik wewenang | Modal terbuka seketika tanpa loading spinner user; radio button default ke `OrganizationalAuthority`. |
| **Validasi Client-Side Gagal** | N/A (Client Validation) | Form submission diblokir | Pesan error validasi inline muncul di bawah masing-masing field (mis. "Dampak minimal 5 karakter", "Referensi proyek wajib diisi"). |
| **Pengajuan Berhasil** | `201 Created` | Mutasi `createBlocker` resolve sukses | - Modal tertutup otomatis.<br>- Cache query `['daily-records', 'today']` dan `['blockers']` diinvalidasi.<br>- Menampilkan snackbar/toast notifikasi sukses: *"Blocker berhasil diajukan dan diteruskan ke pihak berwenang."* |
| **Validasi Server-Side Gagal** | `400 Bad Request` | Mutasi melempar error validasi DTO | Menampilkan pesan error spesifik dari backend di dalam `v-alert` (variant="tonal", color="error") di dalam modal, form tetap terbuka agar user dapat memperbaiki data. |
| **Otorisasi Ditolak** | `403 Forbidden` | Mutasi melempar `ForbiddenException` | Menampilkan alert error di modal: *"Aksi ditolak: Anda tidak memiliki wewenang untuk menautkan komitmen ini atau sesi Anda tidak valid."* |
| **Hierarki Tidak Ditemukan** | `422 Unprocessable` / `BusinessRuleViolation` (`NO_DIRECT_MANAGER_FOUND`) | Backend melempar BusinessRuleViolation | Menampilkan pesan penjelasan bisnis: *"Tidak dapat menemukan Direct Manager aktif di struktur organisasi Anda. Harap hubungi HRGA / Admin."* |
| **Kegagalan Server Backend** | `500 Internal Server Error` | Mutasi melempar server exception | Alert error transparan: *"Terjadi kesalahan pada sistem server (HTTP 500). Silakan coba beberapa saat lagi."* Tombol submit di-enable kembali. |
| **Koneksi Jaringan Terputus** | `ERR_NETWORK` / Timeout | Mutasi melempar Network Error | Alert error: *"Koneksi jaringan terputus. Pastikan perangkat Anda terhubung ke internet lalu coba lagi."* Tombol submit di-enable kembali. |
| **Loading State saat Submit** | In-flight request | `isPending === true` | Tombol *"Kirim Blocker"* menampilkan loading spinner, tombol *"Batal"* disabled, backdrop persistent mencegah double-submit. |

### 5.1 Penanganan Endpoint Query `useBlockerOwnersQuery`
- Karena modal pengajuan blocker tidak lagi membutuhkan daftar user, fungsi `useBlockerOwnersQuery` di `useBlockers.ts`:
  1. Diberi penanda `@deprecated` atau diarahkan hanya untuk komponen yang benar-benar memiliki wewenang administratif jika dibutuhkan di masa mendatang.
  2. Implementasi `catch { return []; }` **dihapus**. Query harus membiarkan error terpropagasi ke state TanStack Query (`isError`, `error`), sehingga komponen pemanggil dapat menampilkan error banner jika memang terjadi kegagalan otorisasi atau jaringan.
  3. Mengembalikan `initialData: () => []` jika tujuannya mencegah `undefined` pada query client tanpa menelan error.

---

## 6. File dan Modul yang Terdampak

Berdasarkan investigasi, tidak ada perubahan skema database atau backend service yang diperlukan. Seluruh dampak terlokalisasi pada frontend:

| File Path | Jenis File | Perubahan yang Diperlukan |
|---|---|---|
| `frontend/src/types/daily-records.ts` | Type Definition | Perbarui `CreateBlockerPayload`: ubah `impactDescription` menjadi `impact`, hapus `targetOwnerUserId`, tambahkan `ownerNeededType: 'OrganizationalAuthority' \| 'ProjectAuthority'`, dan `relatedScopeReference?: string`. |
| `frontend/src/components/self-service/RaiseBlockerModal.vue` | Vue SFC Component | - Ganti autocomplete `targetOwnerUserId` dengan pemilihan `ownerNeededType` (`OrganizationalAuthority` / `ProjectAuthority`).<br>- Tambahkan input conditional `relatedScopeReference`.<br>- Hapus pemanggilan `useBlockerOwnersQuery`.<br>- Sesuaikan payload submission dengan `CreateBlockerPayload` baru.<br>- Tambahkan penanganan error transparan saat mutasi gagal. |
| `frontend/src/api/blockers.api.ts` | API Client | Pastikan payload `createBlocker` meneruskan kontrak DTO yang tepat. Tandai `getPotentialOwners` sebagai deprecated/khusus admin jika tidak dipakai. |
| `frontend/src/queries/useBlockers.ts` | Query Hook | Hapus blok `catch` masking pada `useBlockerOwnersQuery`, biarkan error terpropagasi secara transparan via state TanStack Query. |
| `frontend/tests/raise-blocker.spec.ts` | Test Suite | Perbarui pengujian unit modal dan integrasi MyTodayPage: sesuaikan mock payload dengan `ownerNeededType` dan `impact`, verifikasi validasi conditional untuk `relatedScopeReference`. |
| `frontend/tests/s3-t4-remediation.spec.ts` | Regression Test | Perbarui test form density/rendering agar memverifikasi field tipe wewenang baru. |

---

## 7. Acceptance Criteria (Dapat Diuji & Objektif)

Pelaksanaan remediasi dinyatakan berhasil dan dapat diterima jika memenuhi seluruh kriteria berikut:

1. **AC-01 (Employee Blocker Raising)**:
   Pengguna dengan role `Employee` dapat membuka `RaiseBlockerModal.vue` dari tombol header maupun kartu komitmen tanpa mengalami error 403 atau dropdown kosong, dan dapat mengirim blocker hingga berhasil tersimpan (`201 Created`).
2. **AC-02 (Contextual Owner Resolution)**:
   Blocker yang diajukan dengan `ownerNeededType: 'OrganizationalAuthority'` otomatis diresolusi oleh backend ke `directManagerId` dari user pelapor. Blocker dengan `ownerNeededType: 'ProjectAuthority'` diresolusi ke PIC mapping proyek terkait (atau fallback ke direct manager jika mapping belum ada).
3. **AC-03 (Payload & DTO Exact Match)**:
   Payload JSON yang dikirimkan oleh frontend saat `POST /api/v1/blockers` sesuai 100% dengan `CreateBlockerDto` backend:
   - Field `type`, `severity`, `impact`, `ownerNeededType` terisi valid.
   - Field `relatedScopeReference` disertakan jika memilih Project Authority.
   - Field `linkedCommitmentId` disertakan jika diajukan dari konteks komitmen.
   - Tidak ada field usang `targetOwnerUserId` atau `impactDescription`.
4. **AC-04 (No Error Masking & Transparent Error Feedback)**:
   Jika terjadi kegagalan jaringan atau server saat submit, modal menampilkan pesan error yang informatif di dalam alert banner, bukan membisu atau menutup modal tanpa notifikasi.
5. **AC-05 (Client-Side Validation)**:
   Formulir mencegah submission jika field wajib kosong (tipe, severity, dampak < 5 karakter, atau referensi lingkup kosong saat memilih Project Authority).
6. **AC-06 (TanStack Query Integrity)**:
   Tidak ada console warning `Query data cannot be undefined` dan tidak ada exception yang ditelan secara diam-diam.
7. **AC-07 (Dedicated Unit & Integration Test Coverage)**:
   Seluruh test suite frontend (`raise-blocker.spec.ts`) lulus 100%, mencakup skenario:
   - Pengajuan Instant Blocker dengan Organizational Authority.
   - Pengajuan Blocker dengan Project Authority dan validasi scope reference.
   - Pengajuan Blocker kontekstual tertaut komitmen (`linkedCommitmentId`).
   - Penanganan error respons dari backend (400, 403, 500, network error).
8. **AC-08 (Zero Backend Regression)**:
   Seluruh 46 test suite backend (639 passing tests) tetap berjalan 100% PASS tanpa regresi pada `blocker.service.spec.ts` maupun `blocker-owner-resolver.service.spec.ts`.

---

## 8. Rencana Test dan Bukti Verifikasi

### 8.1 Rencana Pengujian Frontend
1. **Unit Test Komponen (`frontend/tests/raise-blocker.spec.ts`)**:
   - `test_instant_blocker_org_authority`: Memverifikasi submit mengirim `ownerNeededType = 'OrganizationalAuthority'` dan `linkedCommitmentId = undefined`.
   - `test_instant_blocker_project_authority`: Memverifikasi input `relatedScopeReference` muncul dan terkirim dengan benar saat memilih `ProjectAuthority`.
   - `test_contextual_blocker_linked`: Memverifikasi penautan ID komitmen saat dibuka dari kartu komitmen.
   - `test_form_validation`: Memverifikasi validasi `impact` minimal 5 karakter dan `relatedScopeReference` wajib saat Project Authority.
   - `test_mutation_error_display`: Memverifikasi alert error muncul ketika mutasi backend gagal (HTTP 400/403/500).
2. **Integration Test Alur Pengguna**:
   - Menjalankan pengujian integrasi `MyTodayPage.vue` saat tombol "Laporkan Blocker" pada kartu komitmen diklik.

### 8.2 Verifikasi Regresi Backend
- Jalankan vitest pada backend:
  `npm run test -- src/modules/blocker/`
  Memastikan 16 unit tests di `blocker-owner-resolver.service.spec.ts` dan seluruh test di `blocker.service.spec.ts` tetap hijau.

### 8.3 Verifikasi Tipe & Build
- `npm run type-check` pada frontend (memastikan TypeScript dan Volar 0 errors).
- `npm run build` pada frontend (memastikan bundle produksi sukses).

---

## 9. Hubungan dengan Product Backlog & Tata Kelola

### 9.1 Posisi dalam Product Backlog
- Perbaikan ini merupakan bagian sah dari penyelesaian **EPIC-19 (Self-Service Pages)**, khususnya:
  - **`EPIC-19-T1`**: Halaman My Today (Morning + EOD Check-in serta modal pendukung Blocker).
  - **`EPIC-19-T5`**: Integrasi TanStack Query hooks untuk seluruh aksi self-service karyawan.
- Perbaikan ini melengkapi integrasi dengan **`EPIC-08-T1`** (Endpoint `POST /blockers` dengan resolusi owner kontekstual) yang sudah selesai dan terverifikasi di backend.

### 9.2 Status Perubahan Backlog
- **Apakah Memerlukan Amandemen Backlog Baru?**: **TIDAK.**
- Penyebab defect ini adalah *implementation drift* di level komponen UI frontend terhadap SAD dan Backlog yang sudah ada. Remediasi ini mengembalikan implementasi ke kontrak resmi yang sudah disetujui tanpa menambah scope fitur baru.

---

## 10. Daftar Keputusan Terbuka (Open Decisions Awaiting Approval)

Sebelum tahap implementasi kode dapat dieksekusi, persetujuan pengguna diperlukan atas keputusan berikut:

| No | Poin Keputusan | Opsi Rekomendasi | Alternatif | Status |
|---|---|---|---|---|
| **D-1** | **Bentuk Kontrol UI Pemilihan Otoritas** | Menggunakan `v-radio-group` dengan 2 opsi jelas (*Organizational Authority* vs *Project Authority*) disertai keterangan pembantu (helper text). | Menggunakan `v-select` dropdown standar. | **Menunggu Persetujuan** |
| **D-2** | **Disposisi Hook `useBlockerOwnersQuery`** | Dihapus dari `RaiseBlockerModal.vue`. Pada file hook `useBlockers.ts`, fungsi ditandai `@deprecated` dan blok masking `catch { return []; }` dibersihkan agar tidak menyamarkan error jika dipanggil komponen lain. | Menghapus total `useBlockerOwnersQuery` dan `blockersApi.getPotentialOwners()` dari codebase frontend. | **Menunggu Persetujuan** |
| **D-3** | **Otorisasi Eksekusi Remediasi** | Memberikan wewenang kepada agen untuk melanjutkan ke tahap eksekusi implementasi perbaikan kode frontend dan pembaruan test suite sesuai rencana dokumen ini. | Menghentikan proses atau menunda perbaikan ke sprint berikutnya. | **Menunggu Persetujuan** |

---

## 11. Kesimpulan dan Rekomendasi Akhir

1. **Defect S3-T4-FIND-04 terbukti valid**: Terjadi penyamaran error HTTP 403 oleh `catch { return []; }` dan penyimpangan kontrak payload antara frontend dan backend.
2. **Opsi A direkomendasikan mutlak**: Menyelaraskan UI `RaiseBlockerModal.vue` dengan kontrak SAD §10.4 (`ownerNeededType` dan `impact`), mengeliminasi dependensi endpoint admin `GET /users`, serta memulihkan hak fungsional Employee untuk melaporkan blocker secara mandiri.
3. **Pekerjaan saat ini berada dalam koridor perencanaan ketat**: Tidak ada kode yang diubah pada tahap ini. Eksekusi kode akan menunggu otorisasi eksplisit dari pengguna.
