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
