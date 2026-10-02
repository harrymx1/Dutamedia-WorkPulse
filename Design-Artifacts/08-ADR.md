# Architectural Decision Records (ADR)
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

| Dokumen | Nilai |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.0 |
| Status | Active |
| Date | September 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.1, PRD v1.1, SAD v1.0, Product Backlog v1.0 |

> Dokumen ini mencatat **keputusan arsitektur yang dibuat selama fase implementasi** — khususnya keputusan yang menutup gap atau open item dari SAD §23.2. Setiap ADR bersifat permanen dan menjadi bagian dari kontrak desain yang mengikat seluruh fase implementasi berikutnya.

---

## ADR-001 — AdditionalWork Tidak Memiliki Lock Permanen

| Atribut | Nilai |
|---|---|
| **ID** | ADR-001 |
| **Tanggal** | 2026-09-16 |
| **Status** | ACCEPTED |
| **Menutup Open Item** | SAD §23.2.A1 |
| **Berlaku mulai** | EPIC-07-T6 (DailyAccountabilityModule) |

### Konteks

SAD §5.4 mendefinisikan kolom `AdditionalWork.isLocked = true` yang di-set oleh scheduled job bersamaan dengan `Commitment.isEodLocked`. SAD §9.8 kemudian mencatat bahwa tidak ada mekanisme koreksi untuk `AdditionalWork` yang sudah terkunci, dan mendaftarkannya sebagai open item (§23.2.A1) yang perlu dikonfirmasi: apakah keterbatasan ini disengaja, atau gap PRD?

Product Backlog §6.1 (Open Item A1) mewajibkan keputusan ini diambil **sebelum EPIC-07-T6** dikerjakan.

### Analisis terhadap PDD & PRD

| Dokumen | Bunyi | Implikasi |
|---|---|---|
| **PRD FR-06** | "Employee dapat mencatat Additional Work kapan saja setelah Morning Check-in" | Tidak ada batasan waktu untuk pencatatan — by design |
| **PDD §5** | "Additional Work — pencatatan pekerjaan material yang muncul setelah Morning Check-in" | Sifatnya tidak terprediksi; tidak memiliki konsep baseline Morning |
| **PRD FR-07** | "Additional Work tidak mengubah baseline Morning Commitment" | AdditionalWork adalah entitas independen dari baseline |
| **PRD FR-43** | "Employee dapat mengajukan Correction Request atas Morning Commitment yang sudah locked" | CorrectionRequest secara eksplisit hanya berlaku untuk Morning Commitment, bukan AdditionalWork |
| **PRD FR-08** | "Employee dapat mengisi EOD Outcome... untuk tiap Commitment dan Additional Work" | Outcome AdditionalWork diisi di EOD — bukan di Morning |

### Keputusan

**`AdditionalWork` TIDAK memiliki lock permanen yang memblokir pencatatan atau koreksi.**

Secara spesifik:

1. **Field `text`, `reason`, `assignedByUserId`** — dapat dibuat dan diedit tanpa batas waktu cutoff, karena `AdditionalWork` by design muncul kapan saja dan tidak memiliki konsep baseline yang perlu dilindungi.

2. **Field `outcome` dan `continuation`** — dapat diisi/diedit tanpa gating `CorrectionRequest`, karena `CorrectionRequest` secara PRD FR-43 hanya berlaku untuk `Morning Commitment` yang sudah locked.

3. **Setiap write (POST/PATCH) pada `AdditionalWork` wajib dicatat via `AuditService.record()`** — sebagai pengganti integritas historis yang setara. AuditLog bersifat immutable (append-only per SAD §5.10), sehingga seluruh riwayat perubahan tetap terlacak tanpa memblokir koreksi.

4. **Kolom `isLocked` pada skema Prisma** — kolom ini ada di skema (EPIC-01 sudah di-migrate), namun dalam implementasi endpoint EPIC-07-T6, `isLocked` tidak digunakan sebagai validator pemblokiran write. Kolom dipertahankan untuk kompatibilitas skema tanpa dihapus.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **EPIC-07-T6** (POST/PATCH /additional-work) | Endpoint tidak memvalidasi `isLocked`. Setiap write wajib memanggil `AuditService.record()` dalam transaction |
| **EPIC-15-T1** (Scheduler — Frequent Cycle) | Job `evaluateCutoffLock()` tetap men-set `AdditionalWork.isLocked = true` untuk konsistensi skema, namun tidak menjadi enforcer di level endpoint |
| **EPIC-09** (CorrectionRequestModule) | Scope CorrectionRequest tetap hanya Morning Commitment — tidak diperluas ke AdditionalWork |
| **EPIC-07-T2** (availableActions) | AdditionalWork selalu menampilkan aksi `edit` di `availableActions`, terlepas dari nilai `isLocked` |

### Alignment dengan Prinsip Sistem

Keputusan ini konsisten dengan prinsip utama WorkPulse dari PDD:

> "Audit Trail — immutable, mencakup perubahan commitment setelah cutoff, status, blocker, dan manager note" (PDD §5 In-Scope)

AuditLog yang immutable mengisi peran "pengaman integritas" tanpa perlu memblokir koreksi pada entitas yang by design tidak punya konsep baseline terkunci.

---

*Dokumen ini terbuka untuk ADR berikutnya seiring implementasi berlanjut.*

---

## ADR-002 — Endpoint GET List untuk TemporaryReviewerAssignment

| Atribut | Nilai |
|---|---|
| **ID** | ADR-002 |
| **Tanggal** | 2026-09-18 |
| **Status** | ACCEPTED |
| **Rujukan / Penambahan Kontrak** | Melengkapi SAD §10.2 & §8.11 (IdentityModule) |
| **Berlaku mulai** | EPIC-04 (Admin Workspace — Temporary Reviewer Management) |

### Konteks

SAD §10.2 semula hanya mendefinisikan satu endpoint mutasi untuk delegasi reviewer sementara, yaitu:
`POST /api/v1/temporary-reviewer-assignments` (Role: `SystemAdmin`, `Head`).

Namun, pada implementasi antarmuka pengguna (`AdminTemporaryReviewerTab.vue`), pendelegasian wewenang reviewer sementara yang sedang aktif atau pernah dibuat wajib dapat dimonitor secara transparan oleh Administrator dan Head fungsi terkait. Tanpa endpoint pembacaan daftar (`GET`), terjadi masalah operasional:
1. **Risiko Konflik Delegasi**: Administrator tidak dapat memverifikasi delegasi aktif yang sudah ada, berisiko menimbulkan pendelegasian ganda pada lingkup/scope yang sama.
2. **Ketiadaan Visibilitas Expiry Date (BR-11)**: Tanggal kadaluarsa wewenang sementara tidak dapat dipantau status keaktifannya.
3. **Inkonsistensi State UI**: UI terpaksa mengandalkan state lokal sementara (*in-memory array unshift*) yang hilang setiap kali halaman di-refresh, melanggar prinsip *Single Source of Truth* backend (SAD §2.1).

### Analisis & Alignment Arsitektural

Sesuai SAD §8.11 (*Scope Resolution Engine*):
- `SystemAdmin` memiliki kewenangan cross-organization penuh.
- `Head` memiliki kewenangan terhadap fungsi yang dipimpinnya.
- Model database `TemporaryReviewerAssignment` menyimpan `reviewerUserId`, `scope`, `reason`, `effectiveDate`, `expiryDate`, dan `createdByUserId`.

Menambahkan endpoint pembacaan daftar (`GET`) merupakan **PENAMBAHAN resmi terhadap kontrak SAD §10.2** (bukan deviasi/pelanggaran), yang melengkapi siklus manajemen data wewenang sementara agar konsisten dengan endpoint `GET /api/v1/users` dan `GET /api/v1/users/:id/organizational-assignments`.

### Keputusan

1. **Menambahkan Endpoint Baru**:
   `GET /api/v1/temporary-reviewer-assignments`
   - **Role**: `SystemAdmin`, `Head`.
   - **Query Parameters**: `scope?` (opsional filter per departemen/proyek), `activeOnly?` (opsional filter yang masih dalam masa berlaku).
   - **Enforcement Scope (SAD §8.11)**:
     - `SystemAdmin`: Mengambil seluruh daftar delegasi di organisasi.
     - `Head`: Mengambil daftar delegasi yang relevan (dibuat oleh aktor atau mencakup lingkup fungsinya).
   - **Response**: Array entitas `TemporaryReviewerAssignment` dengan relasi `reviewerUser: { id, fullName, email }`.

2. **Frontend Wiring (SAD §16.3, §17.4)**:
   - `identityApi.getTemporaryReviewerAssignments()` ditambahkan ke API client.
   - TanStack Query hook `useTempReviewersQuery()` ditambahkan ke `frontend/src/queries/useUsers.ts`.
   - `useCreateTempReviewerMutation` meng-invalidsi query key delegasi sementara, sehingga data tabel di `AdminTemporaryReviewerTab.vue` otomatis ter-refresh dari backend setelah mutasi berhasil (menggantikan *unshift* lokal).

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **Backend Controller** | Menambahkan `@Get('temporary-reviewer-assignments')` berproteksi `@RequireRole(Role.SystemAdmin, Role.Head)` |
| **Backend Service** | Menambahkan method `getTemporaryReviewerAssignments(actorUserId, actorRole)` dengan Prisma query include `reviewerUser` |
| **Frontend API & Hooks** | Menambahkan `getTemporaryReviewerAssignments` dan `useTempReviewersQuery` |
| **AdminTemporaryReviewerTab** | Tabel sepenuhnya dipasok oleh data hook `useTempReviewersQuery` |

---

## ADR-003 — ProjectAuthorityMapping Tetap Tanpa Endpoint GET List (Keterbatasan MVP Disepakati)

| Atribut | Nilai |
|---|---|
| **ID** | ADR-003 |
| **Tanggal** | 2026-09-18 |
| **Status** | ACCEPTED |
| **Rujukan / Kategori** | Keterbatasan Sadar Fase MVP (SAD §23.2 Asumsi & Open Items) |
| **Berlaku mulai** | EPIC-04 (Admin Workspace — Project Authority Mapping) |

### Konteks

SAD §10.2 mendefinisikan dua endpoint untuk Project Authority Mapping:
- `POST /api/v1/project-authority-mappings` (Membuat mapping wewenang proyek baru)
- `PATCH /api/v1/project-authority-mappings/:id` (Mengakhiri mapping via penentuan `endDate`)

Namun, SAD §10.2 tidak mendefinisikan endpoint `GET /api/v1/project-authority-mappings` untuk melist seluruh mapping proyek secara agregat. Perlu diputuskan apakah endpoint GET perlu di-retrofit sekarang atau dipertahankan sesuai kontrak SAD §10.2.

### Analisis & Rasional

1. **Frekuensi & Volume Rendah**: Berbeda dengan Atasan Langsung struktural yang mengikat setiap karyawan harian, Project Authority Mapping hanya diberikan secara spesifik ke Project Manager atau otoritas proyek tertentu. Pada skala 30–60 user perusahaan, jumlah mapping aktif hanya sedikit.
2. **Keterlacakan Audit**: Setiap penerbitan mapping tercatat dalam Audit Log (`PROJECT_AUTHORITY_MAPPING_CREATED`) lengkap dengan ID entitas UUID yang diterbitkan.
3. **Mitigasi Scope Creep Fase MVP**: Membatasi penambahan endpoint baru yang belum pernah dirancang skema filternya di SAD, asalkan antarmuka admin bersikap transparan dan tidak membingungkan pengguna.

### Keputusan

1. **`ProjectAuthorityMapping` TETAP tanpa endpoint `GET` list agregat pada fase rilis MVP saat ini**, konsisten dengan kontrak SAD §10.2.
2. **UI Transparan di Frontend**: Komponen `AdminOrganizationTab.vue` menambahkan instruksi yang jelas pada form pengakhiran Project Authority bahwa ID Mapping UUID dimasukkan secara manual (berdasarkan ID yang diterbitkan atau log wewenang terkait).
3. **Pencatatan Backlog Pasca-MVP**: Penambahan endpoint query list dedicated untuk Project Authority Mapping didaftarkan sebagai open item untuk dipertimbangkan kembali pada evaluasi pasca-MVP (SAD §23.2 Asumsi & Open Items).

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **Backend** | Tidak ada modifikasi skema/endpoint baru untuk Project Authority; tetap mematuhi SAD §10.2 |
| **Frontend** | Input ID Mapping pada dialog pengakhiran wewenang diberi teks bantuan transparan di UI |
| **SAD §23.2** | Tercatat resmi sebagai open item / batasan desain MVP yang diterima sadar |

---

## ADR-004 — Penambahan Kategori Policy ReminderThreshold untuk Konfigurasi Ambang Pengingat Otomatis

| Atribut | Nilai |
|---|---|
| **ID** | ADR-004 |
| **Tanggal** | 2026-09-18 |
| **Status** | ACCEPTED |
| **Rujukan / Penambahan Kontrak** | Melengkapi SAD §5.9 (Policy Domain) & SAD §11.2 (Scheduled Jobs) |
| **Berlaku mulai** | EPIC-06 (PolicyModule) & EPIC-15 (SchedulerModule) |

### Konteks

Pada rancangan awal SAD §11.2, pekerjaan terjadwal (scheduled jobs) mencakup pengingat waktu:
- Job #4: Pengingat *Objection Window* Menjelang Berakhir (SAD §11.2 #4).
- Job #7: Pengingat Permohonan Cuti Pending (SAD §11.2 #7).

Sebelumnya, implementasi logika ini menggunakan nilai ter-hardcode langsung di dalam `SchedulerService`:
- `2 jam` sebelum jendela keberatan koreksi berakhir.
- `24 jam` sejak pengajuan cuti berstatus *Pending*.

Hal ini bertentangan dengan prinsip dasar tata kelola *effective-dating* pada SAD §5.9 dan PRD FR-31, di mana ambang batas operasional sistem seharusnya dapat disesuaikan oleh *Authorized Policy Owner* tanpa perlu melakukan *recompile* atau *redeploy* kode.

### Analisis & Alignment Arsitektural

Sesuai SAD §5.9, seluruh parameter konfigurasi operasional dikelola melalui entitas `Policy` dengan `category: ENUM` dan snapshot terversi (`policySnapshot`). Kategori yang telah ada sebelumnya (Cutoff, GracePeriod, WorkdayCalendar, EscalationThreshold, CoachingFollowUpPeriod, RetentionPeriod, ExemptionRule, ObjectionWindowDuration, MinorMaterialThreshold, ParticipationRule) belum mencakup ambang pengingat terjadwal.

Menambahkan `ReminderThreshold` ke dalam enum `PolicyCategory` menutup *gap* ini secara bersih dan selaras dengan pola snapshot SAD §6.4.

### Keputusan

1. **Penambahan Nilai Enum `PolicyCategory`**:
   Menambahkan nilai `ReminderThreshold` ke dalam enum `PolicyCategory` di skema Prisma (`schema.prisma`).

2. **Definisi Nilai Default (`DEFAULT_POLICY_VALUES`)**:
   Menyediakan fallback nilai default yang konsisten dengan interval standar SAD §11.2:
   ```json
   {
     "objectionWindowReminderHours": 2,
     "leavePendingReminderHours": 24
   }
   ```

3. **Injeksi `PolicyService` ke dalam `SchedulerService`**:
   `SchedulerModule` mengimpor `PolicyModule`. Dalam metode `sendObjectionWindowReminders` dan `sendLeavePendingReminders`, `SchedulerService` mengambil konfigurasi aktif melalui:
   `policyService.getActivePolicySnapshot([PolicyCategory.ReminderThreshold], now)`
   sehingga query filter dan isi teks pesan notifikasi bersifat dinamis mengikuti kebijakan aktif.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **Database Schema** | Enum `PolicyCategory` diperluas dengan `ReminderThreshold` (Prisma Client diregenerasi) |
| **PolicyModule** | Mendaftarkan default value `ReminderThreshold` dan memvalidasi tipe nilainya |
| **SchedulerModule** | Mengimpor `PolicyModule` dan menggunakan snapshot kebijakan dinamis |
| **Tata Kelola Admin** | *Policy Owner* dapat mengatur waktu ambang pengingat melalui antarmuka manajemen kebijakan tanpa modifikasi kode |

---

## ADR-005 — Status Kategori Policy ExemptionRule sebagai Placeholder Tanpa Injeksi di ExceptionService

| Atribut | Nilai |
|---|---|
| **ID** | ADR-005 |
| **Tanggal** | 2026-09-28 |
| **Status** | ACCEPTED |
| **Rujukan / Kategori** | Keterbatasan Desain Disepakati (SAD §23.2 Asumsi & Open Items) |
| **Berlaku mulai** | EPIC-06 (PolicyModule) & EPIC-08 (ExceptionModule) |

### Konteks

Pada skema database SAD §5.9, enum `PolicyCategory` mencakup nilai `ExemptionRule`. Namun, penelusuran menyeluruh terhadap PRD (FR-31, FR-35) dan SAD menunjukkan bahwa `ExemptionRule` tidak pernah memiliki definisi atribut JSON, business requirement, atau logika otomatisasi spesifik di dokumen manapun (hanya disebut sebagai nama enum tanpa spesifikasi aturan bisnis).

Pengelolaan hari libur, cuti, dan pengecualian operasional telah diakomodasi secara terpisah pada domain operasional `Exception` (`type: Leave | Holiday | Exemption`, SAD §5.7). Perlu ditetapkan status arsitektural atas `PolicyCategory.ExemptionRule` agar tidak disalahartikan sebagai bug atau celah implementasi yang diisi secara sepihak dengan aturan bisnis baru yang belum disepakati.

### Analisis & Rasional

1. **Integritas Requirement**: Membuat aturan baru tanpa mandat PRD/PDD (seperti notice period minimum, kuota hari berturut-turut, atau wajib lampiran medis) berisiko menyalahi proses bisnis nyata perusahaan.
2. **Kompatibilitas Skema**: Menghapus `ExemptionRule` dari enum Prisma berisiko memicu breaking schema change dan migration overhead pada database yang telah berjalan.
3. **Pemisahan Domain**: `ExceptionModule` saat ini menangani transaksi operasional pengecualian (SAD §5.7). Kebutuhan akan *rules-engine* otomatisasi pengecualian merupakan area fungsional baru yang belum pernah dirancang.

### Keputusan

1. **`PolicyCategory.ExemptionRule` TETAP dipertahankan di skema Prisma** sebagai kategori kosong / *placeholder* untuk menjaga stabilitas skema dan kompatibilitas kontrak antarmuka enum SAD §5.9.
2. **`ExceptionService` TIDAK menginjeksi `PolicyService` untuk kategori ini**, dan tidak menerapkan validasi berbasis `ExemptionRule` sampai ada keputusan bisnis dan spesifikasi formal dari stakeholder produk.
3. **Pencatatan sebagai Open Item SAD §23.2**: Kebutuhan aturan otomatisasi pengecualian (*Exemption Policy Rules*) didaftarkan sebagai open item arsitektur pasca-MVP pada SAD §23.2 untuk dirumuskan bersama tim bisnis jika di masa depan dibutuhkan.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **Database Schema** | `PolicyCategory.ExemptionRule` tetap ada di skema Prisma tanpa perubahan |
| **ExceptionModule** | `ExceptionService` tetap fokus pada siklus hidup permohonan `Exception` tanpa dependensi ke `PolicyService` untuk `ExemptionRule` |
| **SAD §23.2** | Tercatat resmi sebagai open item arsitektural pasca-MVP |

---

## ADR-006 — Batas Maksimum 3 Morning Commitment adalah Aturan Tetap Produk (PDD §8, PRD BR-01), Bukan Policy

| Atribut | Nilai |
|---|---|
| **ID** | ADR-006 |
| **Tanggal** | 2026-09-28 |
| **Status** | ACCEPTED |
| **Rujukan / Penegasan Aturan** | PDD §2 (Goal G4), PDD §8, PRD BR-01, PRD FR-35, SAD §9.3 |
| **Berlaku mulai** | EPIC-07 (DailyAccountabilityModule) & EPIC-06 (PolicyModule) |

### Konteks

Pada audit Stabilization Pass, batasan 3 komitmen harian sempat didiagnosis secara keliru sebagai *magic number* yang perlu dipindahkan ke dalam `PolicyCategory.ParticipationRule` (sebagai field `minCommitmentCount` dan `maxCommitmentCount`).

Setelah dilakukan verifikasi mendalam terhadap dokumen dasar produk (PDD dan PRD), ditemukan dua fakta arsitektural krusial:
1. **Peruntukan Asli `ParticipationRule` (PRD FR-35)**:
   FR-35 mendefinisikan `ParticipationRule` untuk mengatur cakupan keikutsertaan organisasi: *who participates* (peran, fungsi, pengecualian individu, dan periode efektif yang wajib mengisi WorkPulse) — bukan mengatur kuantitas komitmen per hari.
2. **Karakter BR-01 sebagai Aturan Baku Produk (PDD §8, PRD BR-01)**:
   PDD §8 secara definitif menyatakan *"Maksimal 3 Morning Commitment — Additional Work dicatat terpisah, tidak menjadi Commitment ke-4"*. Aturan ini berakar langsung pada **Goal G4 PDD** (*"Low administration — pengisian check-in selesai dalam 2–3 menit, bukan menjadi timesheet"*). Batas 3 komitmen adalah fondasi agar sistem tidak bergeser menjadi *micromanagement timesheet*.

### Prinsip Pembedaan: Aturan Tetap Produk vs Nilai Kebijakan Konfigurabel

Untuk mencegah kesalahan berulang pada audit dan iterasi berikutnya, ditetapkan pembedaan formal:

| Kategori | Definisi & Karakteristik | Contoh di WorkPulse | Lokasi Pengelolaan |
|---|---|---|---|
| **Aturan Tetap Produk (Fixed Product Rule)** | Aturan baku yang menjadi identitas dan filosofi inti sistem. Tidak boleh diubah oleh Administrator karena akan merusak premis produk atau integritas state machine. | - Maksimal 3 Morning Commitment (BR-01, G4)<br>- Initial Status worst-of (GREEN/AMBER/RED)<br>- AdditionalWork tanpa lock cutoff (ADR-001) | **Konstanta Bernama di Kode** (`constants/`) dan ditegakkan secara presisi di Domain Service |
| **Nilai Kebijakan Konfigurabel (Configurable Policy)** | Parameter operasional yang bervariasi antar organisasi atau dapat disesuaikan seiring waktu oleh *Authorized Policy Owner* tanpa redeploy aplikasi. | - Jam Cut-Off (09:00 / 18:00)<br>- Toleransi Grace Period (30 menit)<br>- Durasi Objection Window (24 jam)<br>- Ambang Perubahan Minor/Material | **Tabel Database `policies`** dan disuplai secara dinamis melalui `PolicyModule.getActivePolicySnapshot()` |

### Keputusan

1. **Batas 3 Komitmen Dikembalikan sebagai Konstanta Bernama Terpusat**:
   - Backend: `MIN_DAILY_COMMITMENTS = 1` dan `MAX_DAILY_COMMITMENTS = 3` didefinisikan di `daily-accountability.constants.ts`.
   - Frontend: `MIN_DAILY_COMMITMENTS = 1` dan `MAX_DAILY_COMMITMENTS = 3` didefinisikan di `daily-records.constants.ts` dan digunakan oleh komponen `MyTodayPage.vue`.
2. **DTO Tetap Permisif (Structural Guardrail)**:
   `MorningCheckinDto` tetap mempertahankan batasan `@ArrayMaxSize(10)` dan `@Max(10)` sebagai pagar pengaman struktural HTTP (mencegah DoS / payload flood), sementara *precision business validation* ditegakkan oleh `DailyAccountabilityService` menggunakan konstanta produk.
3. **Pembersihan `ParticipationRule` & Antarmuka Kebijakan**:
   - Menghapus field `minCommitmentCount` dan `maxCommitmentCount` dari `DEFAULT_POLICY_VALUES[PolicyCategory.ParticipationRule]` di backend.
   - Menghapus kartu dan form edit `CommitmentBoundary` dari `PolicySettingsPage.vue` di frontend agar Administrator tidak diberikan ilusi bahwa batas 3 komitmen dapat diubah.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **DailyAccountabilityModule** | `submitMorningCheckin` memvalidasi batasan komitmen secara deterministik terhadap konstanta produk (1–3) |
| **PolicyModule** | `ParticipationRule` bersih dari field yang bukan peruntukannya |
| **Frontend UI** | `MyTodayPage.vue` menggunakan konstanta terpusat; form `PolicySettingsPage.vue` tidak lagi menampilkan konfigurasi komitmen |
| **Integritas Desain** | Mencegah WorkPulse terdegradasi menjadi alat timesheet akibat perubahan konfigurasi sepihak |

---

## ADR-007 — Metode Backup Database: Programmatic Topological SQL Dump via Prisma Client Menggantikan pg_dump Child Process

| Atribut | Nilai |
|---|---|
| **ID** | ADR-007 |
| **Tanggal** | 2026-09-18 |
| **Status** | ACCEPTED |
| **Menutup Open Item** | SAD §23.2.B1 & Product Backlog EPIC-23-T5 |
| **Rujukan / Deviasi Desain** | Menggantikan asumsi `pg_dump` child process pada SAD §4.5 & §21.6 |
| **Berlaku mulai** | EPIC-15-T5 (DatabaseBackupService) |

### Konteks

SAD §4.5 dan §21.6 sebelumnya mengasumsikan pencadangan database harian otomatis dieksekusi melalui utilitas native PostgreSQL `pg_dump` yang dipanggil melalui child process Node.js (`exec`/`spawn`), dengan luaran berupa file SQL terkompresi yang diunggah ke Object Storage S3.

Namun, saat implementasi dan uji lingkungan dilakukan:
1. **Ketiadaan Binary `pg_dump` di Environment Container**: Baik pada lingkungan pengembangan lokal maupun image container runner produksi Railway (`node:22-alpine`), utilitas binary client PostgreSQL (`postgresql-client` / `pg_dump`) tidak terpasang secara default. Menambahkan dependency package OS native memperbesar ukuran container image dan mempersulit portabilitas deployment multi-cloud.
2. **Risiko Keamanan & Kehandalan Child Process**: Memanggil `pg_dump` via `child_process.exec` rentan terhadap isu command-injection, kegagalan passing connection string dinamis (terutama pada environment Railway di mana port dan host database internal dikelola dinamis), serta ketiadaan kontrol granular atas transaksi pembacaan data.
3. **Kondisi Awal Implementasi Dummy/Komentar**: Implementasi `generateSqlDump()` sebelumnya hanya menghasilkan metadata string komentar jumlah tabel tanpa isi data nyata, yang melanggar NFR-10 dan prinsip *"audit trail harus survivable"* (SAD §2.1, §4.5).

### Analisis & Alignment Arsitektural

Sistem WorkPulse membutuhkan mekanisme pencadangan yang:
- Mampu memulihkan seluruh data operasional (18 tabel skema) ke kondisi semula tanpa kehilangan referensi foreign key.
- Mampu berjalan murni di atas runtime Node.js/TypeScript tanpa dependensi binary OS eksternal (`pg_dump`).
- Menjamin urutan dependensi tabel (topological order) agar saat script SQL dieksekusi kembali (`restoreFromSqlDump`), integritas referensial foreign key tidak dilanggar.
- Menjamin keamanan escaping karakter khusus (misalnya nama dengan tanda petik tunggal) dan serialisasi data kompleks (seperti kolom `jsonb` snapshot dan kolom `timestamp`).

### Keputusan

1. **Penggantian `pg_dump` dengan Programmatic Topological SQL Dump via Prisma Client**:
   Pencadangan database dilakukan secara murni programatik menggunakan Prisma Client (`DatabaseBackupService.generateSqlDump()`), mengekstrak data dari seluruh 18 tabel secara berurutan sesuai urutan dependensi topologis (Topological Dependency Order):
   - Level 0 (Tabel Master/Independen): `users`, `policies`
   - Level 1 (Relasi Langsung User/Policy): `policy_owner_assignments`, `organizational_assignments`, `project_authority_mappings`, `temporary_reviewer_assignments`, `sessions`, `exceptions`
   - Level 2 (Transaksi Harian & Snapshot): `daily_accountability_records`
   - Level 3 (Item Detail Record Harian): `commitments`, `additional_works`, `blockers`, `support_contributions`, `correction_requests`, `manager_notes`, `compliance_events`
   - Level 4 (Komunikasi & Jejak Audit): `notifications`, `audit_logs`

2. **Format Luaran PostgreSQL INSERT Murni**:
   Setiap tabel di-serialize menjadi statement `INSERT INTO "table" ("col1", "col2") VALUES (...)` standar PostgreSQL, dibungkus dalam blok atomik transaksi `BEGIN; ... COMMIT;`, dengan penanganan escaping karakter petik tunggal (`''`) dan casting tipe khusus (`::jsonb`).

3. **Penyediaan Mekanisme Restore Nyata (`restoreFromSqlDump`)**:
   Menyediakan method atomik `restoreFromSqlDump(sqlContent)` yang mengeksekusi statement SQL hasil dump di dalam transaksi database Prisma Client (`$executeRawUnsafe`), memungkinkan pemulihan bencana (Disaster Recovery) dilakukan langsung dari backend service atau script CLI pemulihan.

4. **Penutupan Resmi Open Item SAD §23.2.B1**:
   Dengan keberhasilan pengujian restore nyata (100% row match pada 18 tabel), Open Item SAD §23.2.B1 ("Mekanisme backup audit trail & database snapshot") dan Product Backlog EPIC-23-T5 dinyatakan resmi **DITUTUP**.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **Portabilitas Deployment** | Zero-dependency terhadap binary OS; container runner Railway (`node:22-alpine`) dapat mengeksekusi backup tanpa instalasi paket `postgresql-client` tambahan |
| **Integritas Relasional** | Urutan topologis menjamin restore dapat dijalankan tanpa memicu foreign key violation |
| **Atomisitas Pemulihan** | Script SQL dibungkus dalam blok transaksi `BEGIN ... COMMIT` sehingga kegagalan sintaks atau data di tengah jalan tidak meninggalkan status database parsial |
| **Skalabilitas Memori (Known Limitation)** | Pada volume data sangat besar (misalnya >100.000 row AuditLog), penggabungan string in-memory berisiko memicu lonjakan memori container 512 MB (tercatat sebagai KL-01 di `09-Known-Limitations.md`) |

---

## ADR-008 — PATTERN_FLAG_THRESHOLD_COUNT (Ambang 3 Kejadian NoSubmission) adalah Konstanta Tetap Produk, Bukan Policy

| Atribut | Nilai |
|---|---|
| **ID** | ADR-008 |
| **Tanggal** | 2026-10-01 |
| **Status** | ACCEPTED |
| **Rujukan / Penegasan Aturan** | PDD §7, PRD BR-12, PRD FR-29, PRD FR-31, SAD §9.7, SAD §5.9 |
| **Berlaku mulai** | EPIC-12 (ComplianceModule) & EPIC-06 (PolicyModule) |

### Konteks

Pada audit stabilisasi S1-T1, ditemukan bahwa method `evaluatePatternFlag()` pada `ComplianceService` mencoba membaca ambang frekuensi kejadian non-submission melalui ekspresi:
`const thresholdCount: number = coachingConfig.patternThresholdCount || 3;`
yang dibaca dari snapshot kebijakan `PolicyCategory.CoachingFollowUpPeriod`.

Namun, field `patternThresholdCount` ini tidak pernah didaftarkan pada `DEFAULT_POLICY_VALUES[PolicyCategory.CoachingFollowUpPeriod]` di `policy.service.ts`, dan tidak pernah didefinisikan sebagai parameter yang dapat diubah di dokumen kebutuhan produk manapun.

### Analisis terhadap PRD, SAD & Risiko Keamanan

1. **Batasan Eksplisit PRD FR-29 & FR-31**:
   - **PRD FR-29** menyatakan: *"Sistem mendeteksi dan menandai pola repeated non-submission dalam periode configurable, memicu flag untuk coaching."*
   - FR-29 secara spesifik hanya menetapkan **periode waktu evaluasi** (`windowDays` / `coachingWindowDays: 14`) sebagai parameter yang *configurable*.
   - PRD FR-31 mendefinisikan kategori kebijakan sebagai `coaching follow-up period` (periode tindak lanjut), BUKAN ambang batas kejadian pelanggaran.
   - Ambang 3 kejadian merupakan aturan produk baku (product baseline rule) untuk mendefinisikan sebuah "pola" pelanggaran sebelum intervensi manusia (coaching oleh atasan) dipicu.

2. **Risiko Keamanan & Integritas State Machine (Security Vulnerability)**:
   - DTO `CreatePolicyDto` menerima `value: Record<string, any>` berupa objek JSON terbuka.
   - Jika `patternThresholdCount` dibiarkan dibaca secara dinamis tanpa skema validasi ketat, Authorized Policy Owner atau aktor berwenang dapat menyusupkan nilai ekstrem (misalnya `patternThresholdCount: 999999` atau `0`), yang secara diam-diam melumpuhkan deteksi pola kepatuhan perusahaan tanpa memicu error atau peringatan sistem.

3. **Konsistensi dengan Keputusan ADR-006 (Fixed Product Rule vs Configurable Policy)**:
   - Mengikuti preseden ADR-006 (batas 3 komitmen harian BR-01), aturan dasar yang menjadi fondasi state machine produk wajib diproteksi sebagai konstanta kode dan tidak boleh diubah-ubah secara sepihak oleh admin.

### Keputusan

1. **`PATTERN_FLAG_THRESHOLD_COUNT = 3` Ditetapkan sebagai Konstanta Tetap Produk**:
   Didefinisikan secara terpusat di `backend/src/modules/compliance/constants/compliance.constants.ts` dan digunakan langsung oleh `ComplianceService.evaluatePatternFlag()`.
2. **Pembersihan Pembacaan Dynamic Policy**:
   Menghapus pemanggilan `coachingConfig.patternThresholdCount` dari `compliance.service.ts:325`. Evaluasi PatternFlag secara deterministik menggunakan konstanta produk 3.
3. **`CoachingFollowUpPeriod` Murni Mengatur Periode Jendela Waktu**:
   Kategori `PolicyCategory.CoachingFollowUpPeriod` murni dan hanya mengelola `coachingWindowDays: 14`.
4. **Pembersihan Mock Unit Test**:
   Memperbaiki `compliance.service.spec.ts` dengan menghapus `patternThresholdCount` dari mock policy snapshot agar selaras dengan arsitektur tetap.
5. **Antarmuka Pengguna Frontend**:
   Kartu `CoachingFollowUpPeriod` pada `PolicySettingsPage.vue` hanya menampilkan dan membolehkan pengeditan terhadap field `coachingWindowDays`.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **ComplianceModule** | `evaluatePatternFlag` menggunakan `PATTERN_FLAG_THRESHOLD_COUNT = 3` deterministik |
| **PolicyModule** | `CoachingFollowUpPeriod` bersih dari field liar yang tidak terdaftar |
| **Keamanan Sistem** | Mencegah pelumpuhan deteksi kepatuhan melalui injeksi nilai JSON policy liar |
| **Frontend UI** | Form `PolicySettingsPage.vue` hanya menampilkan field resmi `coachingWindowDays` |

---

## ADR-009 — Dynamic Export Signed URL TTL dengan Fixed Security Ceiling

| Atribut | Nilai |
|---|---|
| **ID** | ADR-009 |
| **Tanggal** | 2026-10-01 |
| **Status** | ACCEPTED |
| **Rujukan / Penegasan Aturan** | PDD §5, PRD FR-31, PRD FR-42, SAD §6.3, SAD §13.5, SAD §14.4, SAD §14.6, SAD §14.7, KL-06 |
| **Berlaku mulai** | EPIC-14 (ReportingModule) & EPIC-06 (PolicyModule) |

### 1. Konteks

1. **Keberadaan Field Kebijakan**: Parameter `RetentionPeriod.exportRetentionMinutes` telah ada di skema sistem sejak implementasi awal modul kebijakan (EPIC-06) dengan nilai default 15 menit.
2. **Ekspektasi Antarmuka Pengguna**: Antarmuka `PolicySettingsPage.vue` mengekspos field tersebut kepada Admin/Policy Owner dengan label dan deskripsi sebagai durasi masa aktif "tautan ekspor audit (menit)" (PRD FR-31).
3. **Kondisi Runtime Backend**: Audit stabilisasi S1-T3 menemukan bahwa `ExportGeneratorService` meng-hardcode nilai masa aktif presigned URL unduhan ekspor dengan literal `const expiresIn = 900;` (15 menit = 900 detik). Dokumen arsitektur SAD §13.5 dan §14.4 juga mencatat angka 15 menit (900 detik).
4. **Broken Traceability**: Nilai `RetentionPeriod.exportRetentionMinutes` di database dan formulir pengaturannya di antarmuka tidak pernah dibaca secara runtime saat signed URL laporan ekspor dibuat. Pengubahan nilai kebijakan oleh admin tidak berdampak apapun terhadap durasi tautan ekspor.

### 2. Keputusan

1. **Adopsi Decision B (Dynamic Export Policy)**: Disetujui bahwa `RetentionPeriod.exportRetentionMinutes` adalah parameter kebijakan dinamis yang mengontrol masa aktif (*TTL signed GET URL*) khusus untuk **REPORT EXPORT**.
2. **Keterikatan Runtime**: Pembuatan tautan unduh ekspor laporan pada `ExportGeneratorService` wajib membaca nilai kebijakan aktif `RetentionPeriod.exportRetentionMinutes` secara *effective-dated* pada saat request ekspor diproses.
3. **Pemberlakuan Default**: Nilai bawaan sistem adalah `exportRetentionMinutes = 15` (900 detik).
4. **Fixed Security Ceiling**: Ditetapkan batas atas keamanan produk (*fixed product security ceiling*) sebesar **60 menit**. Batas ini adalah aturan keamanan internal produk WorkPulse, bukan batasan teknis AWS S3/Object Storage.

### 3. Batas Ruang Lingkup (Scope Boundary)

Kebijakan dinamis ini hanya berlaku pada alur ekspor laporan, dan secara tegas diisolasi dari alur unduhan berkas bukti investigasi (*evidence*):

| Alur / Operasi | Membaca Policy RetentionPeriod? | Durasi Masa Aktif (TTL) | Mekanisme Enforcer |
|---|---|---|---|
| **Report Export (PDF)** | **YA** | Dinamis: 1–60 menit (default 15 menit) | `ExportGeneratorService` via `PolicyService` |
| **Report Export (XLSX)** | **YA** | Dinamis: 1–60 menit (default 15 menit) | `ExportGeneratorService` via `PolicyService` |
| **Artefak Report Export Lain** | **YA** | Dinamis: 1–60 menit (default 15 menit) | `ExportGeneratorService` via `PolicyService` |
| **Blocker Evidence Download** | **TIDAK** | Fixed 15 menit (900 detik) | `FileStorageService` (Security Invariant) |
| **Manager-Note Evidence Download** | **TIDAK** | Fixed 15 menit (900 detik) | `FileStorageService` (Security Invariant) |
| **Seluruh Download Evidence Lain** | **TIDAK** | Fixed 15 menit (900 detik) | `FileStorageService` (Security Invariant) |
| **S3 Infrastructure Layer** | **TIDAK** | Ditentukan oleh caller (`expiresInSeconds`) | `S3StorageService` (Infrastruktur Murni) |

### 4. Batasan Keamanan Produk (Security Boundary)

1. **Security Ceiling 60 Menit**:
   - Tautan presigned URL adalah *bearer token* yang memungkinkan siapa saja yang memiliki tautan untuk mengunduh laporan terkait tanpa login ulang selama tautan masih valid.
   - Dokumen ekspor (seperti rekapitulasi ketidakhadiran, ringkasan pelanggaran kepatuhan, dan catatan kinerja tim) berisi informasi manajerial dan personalia yang sensitif.
   - WorkPulse menetapkan bahwa masa aktif tautan ekspor **tidak boleh melebihi 60 menit**, demi membatasi risiko kebocoran data jika tautan dibagikan secara tidak sengaja di luar saluran resmi.
   - Batasan 60 menit ini adalah **aturan keamanan produk WorkPulse**, bukan batasan teknis AWS SDK / S3 (protokol AWS SigV4 secara teknis mendukung presigned URL hingga 7 hari).
2. **Lower Bound 1 Menit**:
   - Nilai minimum kebijakan adalah 1 menit (60 detik) untuk mencegah kegagalan unduh seketika akibat jeda transmisi jaringan.
3. **Validasi Domain Ketat**:
   - Kebijakan yang sah harus memenuhi pertidaksamaan:
     $$\mathbf{1 \le exportRetentionMinutes \le 60}$$
   - Nilai di luar rentang ini wajib ditolak dengan pesan error `OUT_OF_RANGE` pada lapisan domain validation (`policy-value.validator.ts`) dan tidak boleh disimpan ke database.

### 5. Effective Dating & Immutability Tautan

1. **Resolusi Kebijakan Aktif**: Saat user meminta ekspor laporan, `ExportGeneratorService` memanggil `PolicyService.getActivePolicySnapshot([PolicyCategory.RetentionPeriod])` dengan waktu evaluasi adalah waktu request saat itu (`current request time`).
2. **Sifat Immutability Presigned URL**:
   - Presigned URL S3 ditandatangani secara kriptografis menggunakan algoritma HMAC-SHA256 dengan menyertakan timestamp pembuatan dan durasi expiry (`X-Amz-Expires`).
   - Tautan yang sudah diterbitkan bersifat permanen dan **tidak dapat diubah secara retroaktif**.
   - Jika Authorized Policy Owner menerbitkan versi kebijakan baru dengan durasi berbeda pada waktu $T_1$, tautan yang sudah diterbitkan pada waktu $T_0 < T_1$ tetap mempertahankan masa berlaku aslinya.
   - Versi kebijakan baru hanya berlaku bagi tautan ekspor yang diterbitkan sejak waktu efektif kebijakan tersebut.

### 6. Pemisahan Signed URL TTL vs Object Storage Lifecycle Retention

WorkPulse membedakan secara tegas antara masa berlaku tautan dan masa simpan fisik berkas:
- **`exportRetentionMinutes` (Signed URL TTL)**: Mengatur berapa lama token presigned URL dapat digunakan oleh browser untuk mengunduh file dari Object Storage.
- **Object Storage Lifecycle Retention**: Mengatur berapa lama berkas biner `.pdf` atau `.xlsx` fisik disimpan di bucket S3 sebelum dihapus secara otomatis. Berdasarkan SAD §14.6, seluruh berkas di folder `exports/` dihapus secara otomatis oleh lifecycle policy S3 setelah 24 jam (ephemeral).
- `RetentionPeriod.exportRetentionMinutes` **BUKAN** pengatur masa simpan objek di storage bucket, melainkan pengatur masa aktif URL akses unduh.

### 7. Arsitektur Ketergantungan Modul (Module Dependency)

1. **ReportingModule → PolicyModule**:
   - `ReportingModule` diizinkan menambahkan dependensi satu arah ke `PolicyModule` (NestJS module import) untuk membaca `PolicyService.getActivePolicySnapshot()` secara read-only.
   - Hal ini selaras 100% dengan prinsip modularitas SAD §6.3 dan §6.4: *"ReportingModule membaca (read-only) dari seluruh module domain, tidak pernah menulis, tidak pernah didependensi balik"*.
2. **FileStorageModule Tetap Terisolasi**:
   - `FileStorageModule` tidak boleh mengimpor `PolicyModule`. Seluruh alur download bukti (*evidence*) tetap menggunakan konstanta keamanan 900 detik (15 menit).
3. **S3StorageService Murni Infrastruktur**:
   - `S3StorageService` tidak boleh membaca `PolicyService` atau mengetahui konsep domain kebijakan. Service ini hanya menerima parameter angka numerik murni (`expiresInSeconds: number = 900`) dari pemanggilnya.

### 8. Aturan Validasi Kebijakan

1. **Domain Validation**:
   - File `policy-value.validator.ts` memvalidasi input `exportRetentionMinutes`:
     - Tipe data wajib `number` bulat positif.
     - Nilai minimum: `1`.
     - Nilai maksimum: `60`.
   - Pelanggaran batas memicu penolakan HTTP 400 Bad Request (`OUT_OF_RANGE`).
2. **Runtime Defense-in-Depth Clamping**:
   - Pada `ExportGeneratorService`, nilai yang diperoleh dari policy snapshot tetap melewati fungsi pengaman:
     `const safeMinutes = Math.min(Math.max(Number(rawMinutes) || 15, 1), 60);`
     `const expiresIn = safeMinutes * 60;`
   - Clamping ini berfungsi murni sebagai pertahanan berlapis (*defense-in-depth*) terhadap inkonsistensi data historis, bukan sebagai mekanisme untuk menerima konfigurasi invalid secara diam-diam.

### 9. Alternatif Desain yang Ditolak

| Alternatif | Alasan Penolakan |
|---|---|
| **Option A: Mengunci TTL Ekspor Permanen pada 15 Menit (Fixed Rule)** | Ditolak karena field `RetentionPeriod.exportRetentionMinutes` telah diekspos di UI dan didokumentasikan di PRD FR-31. Mengunci nilai secara diam-diam di backend menciptakan ilusi kontrol (*dead configuration*) yang melanggar prinsip transparansi tata kelola. |
| **Option B Tanpa Batas Keamanan Atas (No Security Ceiling)** | Ditolak karena membuka risiko keamanan serius: admin dapat mengonfigurasi masa berlaku link hingga ribuan menit (misal 24 jam atau 7 hari), mengekspos data laporan sensitif perusahaan pada link publik yang tidak membutuhkan re-autentikasi. |
| **Menerapkan Policy Dinamis ke Seluruh FileStorage (Global Policy)** | Ditolak karena mencampuradukkan kebutuhan unduh laporan audit berkala dengan unduhan berkas bukti investigasi (*evidence/manager-note-evidence*). Bukti investigasi wajib mematuhi postur keamanan ketat 15 menit sesuai SAD §14.4 dan tidak boleh diperpanjang oleh kebijakan ekspor. Selain itu, hal ini akan merusak batas modularitas utilitas `FileStorageModule` (SAD §6.4). |

### 10. Konsekuensi

#### Dampak Positif
1. **Penyelesaian Broken Traceability**: Menghubungkan secara utuh konfigurasi kebijakan admin dengan perilaku sistem nyata di level runtime.
2. **Effective Dating Berfungsi Nyata**: Riwayat versi kebijakan `RetentionPeriod` kini memiliki signifikansi teknis yang dapat diaudit secara nyata.
3. **Keamanan Terjamin**: Fixed security ceiling 60 menit melindungi sistem dari potensi kebocoran data akibat konfigurasi ekstrem.
4. **Isolasi Evidence Utuh**: Modul utilitas penyimpanan file dan bukti investigasi tetap terisolasi dan terlindungi.

#### Dampak Negatif & Trade-off
1. **Dependensi Modul**: `ReportingModule` kini memiliki dependensi read-only ke `PolicyModule`.
2. **Kebutuhan Pengujian**: Unit test `ExportGeneratorService` harus memelihara mock `PolicyService` dan mencakup skenario variasi masa berlaku kebijakan.
3. **Pembaruan Dokumentasi**: SAD dan PRD harus diperjelas untuk membedakan secara tegas antara URL TTL dan Storage Object Lifecycle.

### 11. Status Keputusan
**ACCEPTED** — Mengikat untuk perbaikan implementasi pada S1-T3 dan pengujian regresi terkait.

---

## ADR-010 — Separasi Transport Authorization, Resource Scope Authorization, dan Prisma Ownership Enforcement

| Atribut | Nilai |
|---|---|
| **ID** | ADR-010 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | SAD §8.8, SAD §8.11, SAD §14, Task S1-T7, Task S1-T8 |
| **Berlaku mulai** | S1-T8 (Authorization & Architecture Consolidation) |

### 1. Konteks

Selama proses audit arsitektural dan verifikasi integritas kode (Task S1-T1 s/d S1-T7), ditemukan diskrepansi antara dokumentasi perancangan awal dan implementasi runtime aktual mengenai otorisasi:
1. `ScopeGuard` yang sebelumnya didaftarkan sebagai guard global dan decorator `@RequireScope` memiliki **0 penggunaan** pada controller produksi backend (`backend/src/`).
2. Global `ScopeGuard` pada praktiknya hanya berfungsi sebagai passthrough (`return true`) jika tidak ada metadata `@RequireScope`.
3. Mekanisme `ScopeResolverService.registerChecker()` tidak pernah didaftarkan atau diimplementasikan oleh module domain manapun.
4. Otorisasi scope dan pembatasan kepemilikan data (*resource ownership*) yang sesungguhnya berjalan aktif dan teruji di level service/domain melalui `ScopeFilterService` serta pemeriksaan kepemilikan eksplisit pada method service.
5. Mempertahankan `ScopeGuard` dan decorator `@RequireScope` menciptakan ilusi pengamanan runtime (*dead enforcement abstraction*) yang menyesatkan audit tata kelola.

Oleh karena itu, diperlukan formalisasi batas otorisasi antara lapisan transport, lapisan domain/service, dan pola akses data pada Prisma Client.

### 2. Prinsip & Keputusan Arsitektural

#### A. Transport/Request Boundary (`AuthGuard`, `CsrfGuard`, `RoleGuard`)
- `AuthGuard`, `CsrfGuard`, dan `RoleGuard` bekerja murni pada batas transport HTTP/request:
  - `AuthGuard`: Memverifikasi keabsahan JWT, status sesi, dan status keaktifan user (`User.status === Active`).
  - `CsrfGuard`: Memvalidasi token CSRF (Double Submit Cookie) untuk seluruh mutasi HTTP state-changing (POST, PUT, PATCH, DELETE).
  - `RoleGuard`: Memvalidasi peran pengguna secara deklaratif terhadap metadata route (`@RequireRole(Role...)`).
- Guard lapisan transport **tidak** memverifikasi kepemilikan spesifik suatu ID entitas (*entity instance ownership*) atau relasi organisasi dinamis, karena belum memiliki konteks data entitas dari database.

#### B. Resource Ownership & Scope Ditegakkan di Service/Domain Layer
- Seluruh penegakan hak akses terhadap data spesifik (*resource-level authorization*) dan cakupan organisasi (*organizational/project scope*) wajib ditegakkan di **service/domain layer**.
- Pola otorisasi domain mencakup:
  1. *Direct Ownership*: Memverifikasi apakah `record.userId === currentUser.id`.
  2. *Managerial / Supervisory Scope*: Memverifikasi apakah user yang ditinjau berada di bawah hierarki pelaporan langsung atau departemen dari manajer/Head peninjau berdasarkan data assignment aktif.
  3. *Project Authority*: Memverifikasi apakah Project Manager memiliki penugasan aktif (`ProjectAuthorityMapping`) terhadap scope proyek terkait.
  4. *Temporary Reviewer*: Memverifikasi penugasan delegasi aktif (`TemporaryReviewerAssignment`) yang sah.

#### C. `ScopeFilterService` sebagai Mekanisme Scope Aktual
- `ScopeFilterService` adalah mekanisme sentral dan resmi untuk resolusi dan pemfilteran scope pengguna pada WorkPulse.
- Service ini mengomputasi batasan akses pengguna (`computeUserScope`), resolusi hierarki bawahan, dan penyusunan filter query Prisma (`buildDailyRecordsWhereClause`, `buildBlockersWhereClause`, dll.) secara konsisten lintas modul.

#### D. Pola Penegakan Prisma Ownership (Prisma Query Rules)
- Kueri Prisma Client **TIDAK wajib selalu** memuat klausa `where: { userId }` langsung, asalkan otorisasi sumber daya telah dievaluasi pada service/domain layer sebelum mutasi/pembacaan dieksekusi.
- Berdasarkan hasil audit menyeluruh S1-T7 (KL-09):
  - Pola *Two-Phase Verification* (kueri entitas via `findUnique({ where: { id } })`, diikuti validasi domain `if (entity.userId !== currentUser.id && !isAuthorized) throw new ForbiddenException()`) adalah pola yang sah, aman, dan lazim digunakan untuk menghasilkan pesan error bisnis yang bermakna.
  - Pola *Pre-Scoped Query* (menggunakan filter `userId: { in: accessibleUserIds }` atau delegasi helper `ScopeFilterService`) digunakan secara konsisten pada kueri koleksi/agregasi.
  - Mengasumsikan bahwa setiap operasi Prisma tanpa filter `userId` adalah kerentanan keamanan adalah anggapan keliru; keamanan data WorkPulse ditegakkan melalui *defense-in-depth* pada domain boundary.

#### E. Pola Agregasi Scoped pada ReportingModule (`accessibleUserIds`)
- `ReportingModule` menggunakan pola `accessibleUserIds` yang dikomputasi oleh `ScopeFilterService` untuk menarik dan mengagregasi data kehadiran, komitmen, dan blocker lintas entitas.
- Pola ini memastikan pelaporan eksekutif dan manajerial secara ketat terisolasi pada lingkup anggota tim/organisasi yang menjadi hak akses pemanggil.

#### F. Default Deny & Information Hiding
- Sesuai prinsip SAD §7.7, §7.12, dan §14, permintaan terhadap entitas yang berada di luar scope pengguna atau tidak ditemukan mengembalikan respon seragam **HTTP 404 Not Found** guna mencegah kebocoran informasi (*information leakage*) dan serangan enumerasi ID (*ID enumeration*), kecuali pada konteks di mana alasan penolakan otorisasi secara eksplisit harus diinformasikan (HTTP 403 Forbidden).

#### G. Penghapusan Dead Code `ScopeGuard` (Option A — REMOVE)
- Abstraksi `ScopeGuard`, decorator `@RequireScope`, `ScopeResolverService`, dan interface `ScopeChecker` **dihapus secara permanen** dari codebase backend.
- Keputusan ini diambil karena:
  1. 0 penggunaan `@RequireScope` pada seluruh controller produksi.
  2. Implementasi global guard bersifat passthrough (`return true`).
  3. `ScopeResolverService.registerChecker()` tidak pernah digunakan.
  4. Scope enforcement aktual ditangani oleh `ScopeFilterService` di service layer.
- Dokumentasi resmi sistem **dilarang menyatakan `ScopeGuard` sebagai active runtime enforcement**.
- Urutan pipeline guard NestJS resmi menjadi:
  `AuthGuard` → `CsrfGuard` → `RoleGuard` (disertai `PolicyOwnerGuard` pada rute kebijakan).

### 3. Konsekuensi

1. **Kejelasan Arsitektural**: Menghilangkan abstraksi mati yang berpotensi menimbulkan salah tafsir saat audit keamanan atau pengembangan lanjutan.
2. **Dokumentasi Konsisten**: SAD §8.8 dan spesifikasi endpoint diselaraskan dengan kenyataan runtime.
3. **Pengujian Terarah**: Pengujian otorisasi difokuskan pada unit/integration test service layer dan integrasi `ScopeFilterService`.

---

## ADR-011 — Separasi Structural DTO Validation dan Conditional Domain Validation

| Atribut | Nilai |
|---|---|
| **ID** | ADR-011 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | SAD §7.4, SAD §16.6, Task S1-T6, Task S1-T8 |
| **Berlaku mulai** | S1-T8 (Validation Architecture Consolidation) |

### 1. Konteks

Audit Task S1-T6 mengevaluasi penegakan validasi kondisional (*conditional validation*) dan dependensi antar-field pada Data Transfer Object (DTO) dibandingkan validasi di layer domain/service. Ditemukan pola di mana batasan struktural didefinisikan pada DTO, namun validasi bisnis kondisional yang bergantung pada konteks atau state database dieksekusi di service layer.

Perlu ditetapkan batas tanggung jawab formal antara DTO boundary dan Domain Service boundary untuk mencegah *over-engineering* pada DTO validator sekaligus menjaga integritas bisnis.

### 2. Prinsip & Keputusan Arsitektural

#### A. DTO = Structural / API Validation Boundary
- DTO (menggunakan `class-validator`) berfungsi sebagai pelindung pertama sistem (*structural guardrail*) pada HTTP transport layer:
  - Memvalidasi tipe data primitif (string, number, boolean, array, object).
  - Memvalidasi batas panjang string dan batas elemen array (`@MaxLength`, `@ArrayMaxSize`) sebagai penangkal serangan Denial-of-Service (DoS) dan payload flooding (sebagaimana dicatat pada KL-06 / ADR-006).
  - Memvalidasi format dasar (UUID, ISO 8601 Date, Regex HH:mm).
  - Memvalidasi nilai enum yang valid.
- DTO bersifat murni **stateless** dan tidak memiliki dependensi ke database, token sesi, atau riwayat entitas.

#### B. Service / Domain Layer = Contextual & Business Invariant Boundary
- Seluruh validasi yang memerlukan konteks bisnis dinamis, status entitas saat ini, hubungan antar-entitas, atau data historis database wajib dieksekusi di **service/domain layer**.
- Menghindari pembuatan custom validator DTO yang melakukan query database atau mengakses konteks request secara tersembunyi.

#### C. Partial Update & Merged-State Validation
- Pada operasi pembaruan parsial (`PATCH`) atau koreksi data:
  - Payload DTO hanya berisi field yang hendak diubah oleh klien.
  - Validasi keabsahan data gabungan (*merged state*) hanya dapat dievaluasi secara akurat setelah entitas eksisting diambil dari database (*fetch-merge-validate*).
  - Validasi invarian bisnis dilakukan terhadap objek hasil penggabungan (*merged state*) di dalam domain service.

#### D. Contoh Penerapan Konkret di WorkPulse
1. **`Blocker` & `ProjectAuthority` (`relatedScopeReference`)**:
   - DTO (`CreateBlockerDto`) memvalidasi batasan struktural `@IsString` dan `@MaxLength(255)`.
   - Domain Service (`BlockerOwnerResolverService`) menegakkan aturan bisnis kondisional FR-19: jika `ownerNeededType === 'ProjectAuthority'`, maka `relatedScopeReference` wajib diisi (`REQUIRED_WHEN_PROJECT_AUTHORITY`) dan dicocokkan dengan `scopeReference` aktif pada `ProjectAuthorityMapping`.
2. **Status Harian AMBER / RED**:
   - DTO memvalidasi field opsional catatan atau blocker reference.
   - Domain Service memvalidasi bahwa komitmen atau status harian `AMBER` atau `RED` wajib menyertakan `knownBlockerNote` atau ID Blocker aktif terkait.
3. **EOD Conditional Reasons**:
   - DTO memvalidasi struktur alasan dan kelanjutan komitmen.
   - Domain Service memvalidasi bahwa `reason` wajib diisi jika `outcome` komitmen bernilai selain `COMPLETED` (misalnya `PARTIALLY_ACHIEVED`, `CANCELLED`).
4. **`CorrectionRequest` Merged-State Validation**:
   - DTO memvalidasi field yang diajukan untuk koreksi.
   - Domain Service memuat data original `Commitment` yang terkunci, menggabungkan usulan koreksi, dan memverifikasi batas perubahan materiil (`MinorMaterialThreshold.wordsChangedThreshold`) serta kewenangan approval secara akurat.

### 3. Konsekuensi

1. **Arsitektur Ramping**: DTO tetap sederhana, berkinerja tinggi, dan mudah diuji secara unit tanpa *mocking* database.
2. **Kekuatan Invarian**: Logika bisnis terlindungi di satu tempat (*single source of truth*) pada service layer.
3. **Dukungan Operasi Asinkron/Internal**: Service method yang sama dapat dipanggil secara aman oleh scheduled job atau event handler internal tanpa bergantung pada decorator DTO.

---

## ADR-012 — Authorization dan Entity Binding untuk Pre-signed Upload URL

| Atribut | Nilai |
|---|---|
| **ID** | ADR-012 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | SAD §14.3, SAD §14.4, Task S1-T5, Task S1-T8 |
| **Berlaku mulai** | S1-T8 (Storage Security Consolidation) |

### 1. Konteks

Audit Task S1-T5 meninjau alur kerja penerbitan URL upload pra-tanda tangan (*pre-signed upload URL*) pada `FileStorageController` dan `FileStorageService`, khususnya potensi risiko pengunggahan berkas tanpa otorisasi terhadap entitas bisnis (`entityId`).

Penerbitan presigned upload URL memberikan tiket akses sementara langsung ke Object Storage (S3-compatible). Jika parameter `entityId` diterima tanpa verifikasi keberadaan entitas dan hak akses pengguna, pengguna dapat mengunggah berkas yang diasosiasikan dengan entitas milik pengguna lain.

### 2. Prinsip & Keputusan Arsitektural

#### A. Validasi Entity Type & Purpose
- Endpoint `generateUploadUrl` wajib memvalidasi bahwa nilai `entityType` dan `purpose` yang diminta oleh klien adalah kombinasi yang sah dan didukung oleh sistem (misalnya bukti investigasi manajer `manager-note-evidence`, lampiran komitmen harian, dll.).

#### B. Pre-Authorization & Entity Existence Verification
- Otorisasi kepemilikan dan hak akses scope pengguna wajib dilakukan **sebelum** presigned PUT URL diterbitkan oleh `S3StorageService`:
  1. Jika `entityId` disertakan dalam request, service wajib memeriksa keberadaan record entitas tersebut di database.
  2. Service wajib memverifikasi bahwa aktor pengguna yang terautentikasi memiliki hak akses (*ownership* atau *managerial scope*) atas entitas tersebut.
  3. Jika entitas tidak ditemukan atau pengguna tidak memiliki wewenang, permintaan ditolak dengan HTTP 404 / HTTP 403, dan token presigned URL **tidak pernah diterbitkan**.

#### C. Dukungan Two-Phase Upload Flow untuk Entity Creation
- Sistem mengizinkan alur pengunggahan berkas dua tahap (*two-phase upload*) pada skenario pembuatan entitas baru:
  - Pada saat formulir baru diisi, ID entitas belum terbentuk di database (`entityId` bernilai `null` atau tidak dikirim).
  - `generateUploadUrl` menerbitkan upload URL dengan key penyimpanan terisolasi berdasarkan `purpose` dan `userId` aktor.
  - Verifikasi integritas dan pengikatan berkas (*entity binding*) final ditegakkan saat mutasi pembuatan entitas dijalankan: service pembuat entitas memvalidasi bahwa storage key yang dilaporkan sesuai dengan pengguna yang sedang login.

#### D. Preservasi Runtime Behavior & Isolasi Signed URL TTL
- Pola implementasi yang sudah ada dipertahankan tanpa perubahan yang merusak alur klien.
- URL unduh bukti (*evidence download URL*) tetap menggunakan masa aktif *fixed* **900 detik (15 menit)** sesuai SAD §14.4 untuk memastikan keamanan investigasi audit.
- Kebijakan TTL dinamis (`RetentionPeriod.exportRetentionMinutes`) sebagaimana ditetapkan pada ADR-009 **hanya berlaku** untuk report export pada `ReportingModule`, bukan untuk berkas bukti lampiran (*evidence*).

### 3. Konsekuensi

1. **Integritas Penyimpanan Objek**: Mencegah serangan pengunggahan objek gelap atau pengikatan bukti tidak sah ke entitas pengguna lain.
2. **Pemisahan Peran Jelas**: `FileStorageService` menangani otorisasi dan penamaan key, sementara `S3StorageService` murni berinteraksi dengan API S3.
3. **Audit Trail**: Setiap penerbitan presigned upload URL tercatat dalam log aplikasi dengan identitas aktor pemohon.
