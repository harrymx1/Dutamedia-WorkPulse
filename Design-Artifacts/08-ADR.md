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

---

## ADR-013 — Rekonsiliasi Status Suggestion Engine sebagai Deterministic Product Heuristic

| Atribut | Nilai |
|---|---|
| **ID** | ADR-013 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | PRD FR-13, PRD FR-31, SAD §5.9, SAD §6.4, Finding S2-FR-13-1 |
| **Berlaku mulai** | S2 (Decision Gate Reconciliation) |

### 1. Konteks & Deskripsi Konflik Spesifikasi

Pada penelusuran audit S2-T1, ditemukan ketidakselarasan normatif tekstual antar-dokumen:
1. **PRD FR-13**: Menyatakan bahwa sistem memberikan *suggestion* status harian (GREEN/AMBER/RED) berbasis aturan yang *configurable* ("Sistem memberikan suggestion status harian berbasis rule configurable...").
2. **PRD FR-31**: Secara komprehensif dan *exhaustive* mendefinisikan seluruh kategori kebijakan yang dapat dikonfigurasi oleh *Authorized Policy Owner* tanpa mengubah kode (Cutoff, GracePeriod, WorkdayCalendar, EscalationThreshold, CoachingFollowUpPeriod, RetentionPeriod, ExemptionRule, ObjectionWindowDuration, MinorMaterialThreshold, ParticipationRule, serta ReminderThreshold via ADR-004). Kategori `StatusSuggestion` **tidak tercantum** di dalamnya.
3. **SAD §5.9 & §6.4**: Skema `PolicyCategory` di tingkat arsitektur data dan Prisma schema mendaftarkan 11 kategori kebijakan resmi, di mana tidak ada kategori untuk rule penentuan Status Suggestion.
4. **Implementasi Aktual**: Aturan penentuan saran status diimplementasikan di `StatusSuggestionService` (`backend/src/modules/daily-accountability/services/status-suggestion.service.ts`) sebagai mesin inferensi logika deterministik (*heuristic engine*) yang mengevaluasi input komitmen, durasi blocker, dan riwayat eskalasi.

### 2. Keputusan Arsitektural

Berdasarkan keputusan Human Authority pada Decision Gate S2-T1:

1. **Status Suggestion Ditetapkan sebagai Fixed Product Heuristic**:
   Status Suggestion Engine diakui dan dikukuhkan secara formal sebagai aturan baku produk (*fixed, deterministic product heuristic*), bukan sebagai entitas kebijakan operasional yang dapat diubah saat runtime oleh Policy Owner.

2. **Rekonsiliasi Semantik Kata "Configurable" pada FR-13**:
   Frasa "rule configurable" pada PRD FR-13 direkonsiliasi dan ditafsirkan sebagai *rule-based product heuristic* (logika penentuan status berbasis aturan terstruktur, deterministik, dan terisolasi dalam *domain service* khusus), bukan *Authorized Policy Owner runtime configuration* melalui antarmuka `PolicySettingsPage` atau tabel `policies`.

3. **Peniadaan Perluasan PolicyCategory**:
   Sistem **tidak** menambahkan `StatusSuggestion` ke dalam enum `PolicyCategory`, tidak menambahkan tabel konfigurasi baru di Prisma, dan tidak mengubah antarmuka manajemen kebijakan `PolicySettingsPage.vue`.

4. **Peniadaan Siklus Hidup Policy**:
   Tidak diperlukan fungsionalitas CRUD kebijakan, penugasan *Policy Owner* (`PolicyOwnerAssignment`), penanggalan berlaku (*effective dating*), maupun pembuatan *policy snapshot* untuk aturan Status Suggestion.

5. **Kewajiban Pengujian Komprehensif (Unit Test)**:
   Karena heuristik ini merupakan aturan produk yang mengikat dan membantu pengguna dalam check-in harian, seluruh cabang logika deterministik pada `StatusSuggestionService` (saran GREEN, AMBER, RED beserta kondisi pembobotan blocker dan komitmen) **wajib diuji secara eksplisit** melalui automated unit test mandiri (`status-suggestion.service.spec.ts`) guna menutup finding `S2-TEST-GAP-4`.

### 3. Konsekuensi Arsitektural & Integritas Dokumen

1. **Fidelitas Requirement**: Menghilangkan ambiguitas antara FR-13 dan FR-31 secara resmi dan terdokumentasi.
2. **Stabilitas Skema Database**: Skema Prisma, tabel `policies`, dan enum `PolicyCategory` tetap bersih dan stabil tanpa migrasi skema yang tidak perlu.
3. **Preservasi Runtime Behavior**: Tidak ada perubahan kode pada algoritma logika inferensi `StatusSuggestionService`; pengguna tetap menerima saran status deterministik yang dapat dikonfirmasi atau di-override dengan alasan.

---

## ADR-014 — Aturan Baku Produk untuk Ambang Pengingat Cutoff (Lead-Time 60 Menit) dan Idempotensi Scheduler

| Atribut | Nilai |
|---|---|
| **ID** | ADR-014 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | PRD FR-28, PRD §6, SAD §11.2 (Job #1), SAD §12.1, Finding S2-TEST-GAP-7, Finding S2-FR-28-1 |
| **Berlaku mulai** | S2 (Decision Gate Reconciliation) |

### 1. Konteks & Latar Belakang

PRD FR-28 dan SAD §12.1 (Job #1 / `MORNING_EOD_CUTOFF_REMINDER`) mengamanatkan pengiriman reminder otomatis menjelang batas waktu penyerahan (*cutoff*) untuk Morning Check-in dan EOD Check-in. Pada audit S2-T1, ditemukan dua kesenjangan kritis:
1. **Specification Gap (Lead-Time Undefined)**: Seluruh dokumen persyaratan awal (PDD, PRD, SAD, UI-UX Spec) hanya menyatakan *"mendekati deadline/cutoff"* tanpa mendefinisikan batas waktu awal pengingat (*lead-time window*). Kategori kebijakan `ReminderThreshold` (ADR-004) hanya mendefinisikan ambang jam untuk Objection Window (2 jam) dan Leave Pending (24 jam), tanpa mengatur pengingat cutoff.
2. **Ketiadaan Entitas Database Sebelum Check-in**: Record `DailyAccountabilityRecord` dibuat secara *on-demand* saat pengguna melakukan check-in. Karyawan yang belum menyerahkan laporan belum memiliki baris database, sehingga kolom `relatedEntityId UUID` pada tabel `notifications` tidak dapat merujuk ke record yang belum ada.

Human Authority telah menetapkan keputusan produk final untuk menyelesaikan kesenjangan tersebut.

### 2. Keputusan Arsitektural & Produk

1. **Ambang Lead-Time Pengingat Cutoff 60 Menit (Fixed MVP Product Rule)**:
   - Jendela pengingat aktif dimulai tepat **60 menit sebelum On-Time Deadline** yang berlaku dan **berakhir tepat saat On-Time Deadline**:
     $$\text{OnTimeDeadline} - 60\text{m} \le \text{now} < \text{OnTimeDeadline} \quad \text{atau} \quad [\text{Deadline} - 60\text{m}, \text{Deadline})$$
   - Jendela pengingat **berakhir tepat di On-Time Deadline** dan **TIDAK berlanjut ke dalam Grace Period**.
   - Aturan ini berlaku **simetris dan identik untuk Morning Check-in dan EOD Check-in**:
     - **Morning Check-in**: Dengan `morningOnTimeDeadline = "09:00"`, jendela pengingat aktif adalah:
       $$08:00 \le \text{now} < 09:00$$
     - **EOD Check-in**: Dengan `eodOnTimeDeadline = "18:00"`, jendela pengingat aktif adalah:
       $$17:00 \le \text{now} < 18:00$$
   - Ambang 60 menit ini ditetapkan sebagai **aturan baku produk MVP** (*fixed product constant*), **bukan** kategori kebijakan runtime (`PolicyCategory`). Sistem tidak menambahkan kategori kebijakan baru dan tidak mengubah antarmuka `PolicySettingsPage.vue`.

2. **Diferensiasi Tegas dari Grace Period**:
   - *Reminder Lead-Time* (60 menit sebelum On-Time Deadline) adalah tindakan preventif murni untuk mendorong karyawan menyerahkan komitmen tepat waktu (*On-Time*).
   - Pengiriman reminder **tidak menandakan bahwa karyawan terlambat** dan **tidak mengubah status submission**.
   - Segera setelah waktu mencapai atau melewati On-Time Deadline (`now >= OnTimeDeadline`):
     - Jendela Reminder Lead-Time **telah resmi berakhir**.
     - Sistem **dilarang memperlakukan Grace Period sebagai bagian dari jendela pengingat**.
     - *Grace Period* (`PolicyCategory.GracePeriod`) tetap merupakan konsep independen pasca-deadline (misalnya 09:00 s/d 09:30 atau 18:00 s/d 18:30) di mana submission diklasifikasikan sebagai `Late` sesuai kebijakan cutoff yang berlaku.

3. **Domain-Level Idempotency di Scheduler (`relatedEntityId = null`)**:
   - Kolom `relatedEntityId` pada tabel `notifications` secara semantik adalah *foreign key* entitas domain. Sistem **dilarang mengisi `relatedEntityId` dengan UUID sintetis/palsu** demi memicu deduplikasi internal `NotificationService`.
   - Idempotensi diselesaikan di level domain query scheduler: sebelum mendispatch notifikasi, `SchedulerService` memeriksa riwayat pengiriman pada hari kalender `workDate` berjalan untuk `triggerType = MORNING_EOD_CUTOFF_REMINDER` dan fase terkait (`MORNING` atau `EOD`).
   - Setiap karyawan berhak menerima maksimum 1 kali reminder Morning dan 1 kali reminder EOD per hari kerja.
   - Kolom `relatedEntityType` dan `relatedEntityId` pada record notifikasi dibiarkan `null` (atau tidak disertakan).

4. **Kanonikal Populasi Peserta Wajib & Aturan Pengecualian**:
   - Populasi target pengingat pada tanggal $D$ adalah:
     `User (status: Active)` + `OrganizationalAssignment (role: Employee, effectiveDate <= D, endDate IS NULL OR endDate >= D)`
     - Dikurangi: Hari bukan hari kerja sesuai `WorkdayCalendar`.
     - Dikurangi: Hari libur resmi perusahaan (`Exception(type: Holiday, status: Approved)`).
     - Dikurangi: Karyawan dengan izin/cuti yang telah disetujui (`Exception(type IN [Leave, Exemption], status: Approved)`).
     - Dikurangi: Karyawan yang telah melakukan submit pada fase terkait.
   - **Invarian AC-19**: Permohonan izin/cuti berstatus `Pending` **TIDAK** mengecualikan karyawan; karyawan dengan permohonan pending tetap wajib menerima reminder.

### 3. Konsekuensi Arsitektural

1. **Penutupan Specification Gap**: Menghilangkan ketidakpastian lead-time pengingat secara resmi tanpa mengubah skema database `policies`.
2. **Zero Schema Migration**: Skema database PostgreSQL dan Prisma tetap stabil tanpa penambahan kolom atau modifikasi tipe data.
3. **Pemisahan Tanggung Jawab yang Rapi**:
   - `S2-TEST-GAP-7` difokuskan untuk perbaikan kueri populasi dan pengujian unit pengingat Morning Check-in.
   - `S2-FR-28-1` difokuskan untuk implementasi fungsional kueri dan pengiriman pengingat EOD Check-in.

---

## ADR-015 — Penerimaan Risiko Keterbatasan Skalabilitas Batch Pengingat Cutoff (Starvasi Kandidat > 200 User) sebagai Utang Teknis MVP

| Atribut | Nilai |
|---|---|
| **ID** | ADR-015 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | PRD FR-28, SAD §11.2 (Job #1), Finding S2-PERF-FR28-1, KL-10 |
| **Berlaku mulai** | S2 (Decision Gate / MVP Stabilization) |

### 1. Konteks & Latar Belakang

Pada implementasi remediasi PRD FR-28 (ADR-014), sistem menerapkan batas batch defensif `DEFAULT_MAX_REMINDER_BATCH = 200` pada method `DailyAccountabilityService.findPendingSubmissionEmployeeIds()`. Seleksi kandidat dilakukan melalui tahapan penyaringan penugasan organisasi aktif peran Employee, pengurangan karyawan dengan cuti/izin yang disetujui, pengurangan karyawan yang telah submit, dan diakhiri dengan pemotongan array in-memory:
```typescript
return candidateUserIds.slice(0, limit); // limit = 200
```
Selanjutnya, `SchedulerService.sendCutoffReminders()` mengiterasi kandidat yang dikembalikan dan memeriksa riwayat tabel `notifications` hari berjalan untuk fase terkait. Jika karyawan telah menerima pengingat, scheduler mengeksekusi `continue;` (skip).

Pada verifikasi audit independen pasca-implementasi (S2-T1), dilakukan penelaahan alur konkurensi dan batching (*triage*), yang membuktikan adanya keterbatasan fungsional dan skalabilitas (Finding `S2-PERF-FR28-1`).

### 2. Hasil Verifikasi Perilaku Starvasi (*Verified Starvation Behavior*)

Audit membuktikan secara deterministik bahwa:
1. **Mekanisme Starvasi**: Jika populasi karyawan aktif yang wajib check-in namun belum menyerahkan laporan pada hari berjalan melebihi 200 orang ($N > 200$), maka:
   - Pada siklus cron pertama ($T_0$), sistem mengirimkan reminder kepada 200 karyawan pertama ($E_1 \dots E_{200}$).
   - Pada siklus cron berikutnya ($T_1$, misalnya 5 menit kemudian dalam jendela pengingat 60 menit), kueri `findPendingSubmissionEmployeeIds` kembali mengevaluasi seluruh karyawan yang belum submit ($E_1 \dots E_N$) dan kembali memotong slice 200 teratas ($E_1 \dots E_{200}$).
   - `SchedulerService` menerima $E_1 \dots E_{200}$, mendeteksi notifikasi yang sudah terkirim dari siklus $T_0$, dan mengabaikan (*skip*) mereka.
   - Karyawan $E_{201} \dots E_N$ **tidak pernah dikembalikan** oleh `DailyAccountabilityService`, **tidak pernah dievaluasi** oleh `SchedulerService`, dan **mengalami starvasi total** (tidak pernah menerima pengingat) selama karyawan $E_1 \dots E_{200}$ belum melakukan submit.
2. **Akar Permasalahan**: Deduplikasi notifikasi dilakukan *downstream* di `SchedulerService` setelah pemotongan *slice* terjadi di *upstream* `DailyAccountabilityService`, bukan mengecualikan karyawan yang sudah dinotifikasi sebelum pemotongan limit diterapkan.

### 3. Skala Operasional Terdokumentasi MVP (*Documented MVP Scale*)

Berdasarkan penelaahan seluruh dokumen spesifikasi dan arsitektur fondasi WorkPulse:
1. **PDD §3**: Secara eksplisit menyatakan: *"Single Organization — satu deployment untuk Dutamedia, skala awal ±30 karyawan seluruh fungsi operasional. Tidak ada konsep multi-tenant."*
2. **SAD §2.2 #2, §3.1, §9.9, §12.3, §21.7**: Secara konsisten menetapkan batasan arsitektur sistem dirancang dan dioptimalkan untuk skala operasional **30–60 user**.
3. **ADR-002 & KL-01**: Mengonfirmasi asumsi skala awal 30–60 user untuk manajemen mapping authority, lock contention, dan alokasi memori container.
4. **Ketiadaan Batas Organisasi pada Angka 200**:
   - Angka 200 adalah batas defensif memori batch aplikasi (*defensive batch ceiling*), **BUKAN batas maksimal kapasitas organisasi (*organizational maximum*)**. Sistem tidak mengasumsikan organisasi tidak dapat berkembang melampaui 60 atau 200 pengguna.

### 4. Keputusan Arsitektural (*Architectural Decision*)

Berdasarkan pertimbangan Human Authority:

1. **Menerima Keterbatasan sebagai Utang Teknis MVP (*Accept as MVP Technical Debt*)**:
   - Keterbatasan batching dan risiko starvasi ini **diterima secara resmi sebagai Technical Debt / Known Limitation** (`KL-10`) untuk rilis MVP.
   - Sistem **TIDAK melakukan refactoring kode atau modifikasi query** pada tahap S2-T1.
2. **Rasional Keputusan**:
   - Pada skala operasional MVP yang terdokumentasi (maksimum 60 user), total seluruh karyawan aktif berada jauh di bawah ambang batas batch ($60 \ll 200$).
   - Seluruh karyawan diproses dalam satu kali batch pada eksekusi pertama di awal jendela pengingat. Kondisi starvasi **secara matematis dan operasional mustahil terjadi pada deployment MVP**.
   - Melakukan refactoring query cross-module atau menambahkan cursor pagination pada tahap stabilisasi akhir menambah risiko regresi yang tidak perlu terhadap fitur yang sudah 100% lulus uji (538/538 tests pass).
3. **Integritas Akseptasi FR-28**:
   - Implementasi FR-28 dan penyelesaian finding `S2-TEST-GAP-7` serta `S2-FR-28-1` dinyatakan **TETAP SAH DAN TERVERIFIKASI (VERIFIED)** untuk target rilis MVP. Finding `S2-PERF-FR28-1` bukan merupakan kegagalan akseptasi fungsional MVP.

### 5. Pemicu Evaluasi Ulang Masa Depan (*Trigger for Future Reassessment*)

Mitigasi teknis wajib diimplementasikan apabila salah satu kondisi berikut terpenuhi di masa pasca-MVP:
1. Jumlah karyawan aktif perusahaan bertambah melampaui **150 user** (mendekati ambang batas defensif 200).
2. Sistem diekspansi untuk mendukung arsitektur multi-organisasi atau deployment enterprise skala besar.

**Rencana Remediasi Skala Penuh**:
- Mengimplementasikan *upstream exclusion*: `SchedulerService` mengambil daftar ID penerima reminder hari berjalan pada fase terkait, lalu meneruskannya sebagai parameter `excludeUserIds: string[]` ke `DailyAccountabilityService` agar dikeluarkan *sebelum* `slice(0, limit)`.
- Atau mengadopsi *cursor-based batch pagination* dengan kueri set-difference SQL di level database (`NOT EXISTS notifications`).

### 6. Konsekuensi Arsitektural

1. **Zero Code Churn**: Tidak ada perubahan kode backend, test, skema Prisma, atau migrasi database pada rilis MVP saat ini.
2. **Dokumentasi Terpadu & Transparan**: Keterbatasan tercatat secara resmi pada `09-Known-Limitations.md` (`KL-10`) dan `10-S2-Audit-Findings-Register.md` (`S2-PERF-FR28-1` berstatus `ACCEPTED RISK / ADR`).
3. **Kepastian Operasional**: Tim operasional dan pemilik produk memiliki batas metrik yang jelas (ambang 150 user) untuk memicu peningkatan skalabilitas batching.

---

## ADR-016 — Rekonsiliasi Role-Based Output Prompt (FR-12) Berbasis Fungsi Organisasi dan Kamus Statis Frontend

| Atribut | Nilai |
|---|---|
| **ID** | ADR-016 |
| **Tanggal** | 2026-10-02 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | PRD FR-12, PDD §5, UI/UX Spec §4.2, 04-DESIGN §3.2, SAD §5.1, SAD §10.1, SAD §16.3, Finding S2-FR-12-1 |
| **Berlaku mulai** | S2 (Decision Gate S2-B2) |

> **Catatan Tata Kelola**: Keputusan arsitektural dan produk dalam ADR ini **bukan** merupakan klaim temuan artefak lama yang sudah ada sebelumnya, melainkan **keputusan produk baru dan mengikat yang ditetapkan secara resmi oleh Human Authority pada Decision Gate S2-B2** guna menutup kesenjangan spesifikasi, ambiguitas taksonomi, dan konflik perancangan terkait pemenuhan PRD FR-12 (finding `S2-FR-12-1`).

---

### 1. Konteks & Latar Belakang

PRD FR-12 mengamanatkan: *"Sistem menampilkan Role-Based Output Template/prompt tambahan sesuai fungsi user saat pengisian check-in."* Pada rangkaian dokumen desain WorkPulse, kebutuhan ini dielaborasi pada beberapa artefak:
1. **PDD v1.1 §5 (halaman 63)**: Menyebutkan *"Role-Based Output Templates — prompt/contoh output tambahan sesuai fungsi (Developer, QA, PM, Ops, Finance, HRGA, dll.)"*.
2. **UI/UX Specification & Flow Document v1.2 §4.2 (Line 109)**: Menyatakan bahwa saat user mengetik teks komitmen, sistem menampilkan *"Role-Based Output Prompt sebagai contoh/placeholder kontekstual sesuai fungsi user (mis. Developer melihat contoh 'Feature X completed', QA melihat contoh 'Test case Y executed') — bersifat inline suggestion, tidak mengunci format; user tetap bebas menulis bebas."*
3. **Design System (04-DESIGN.md §3.2)**: Mengatur komponen `RoleBasedPromptHint` sebagai *"Placeholder-style inline text inside the commitment input (italic, text-secondary), disappears on focus/typing — never a separate required field"*.
4. **SAD v1.0 (§5.1, §8.4, §10.1, §16.3)**: Memodelkan penugasan organisasi pada tabel `OrganizationalAssignment` dengan kolom `role` (ENUM: Employee, Supervisor_TL, Head, PM, HRGA, CEO_Management, SystemAdmin) dan `function` (VARCHAR: mis. Engineering, Ops & Infra, Finance, dst.), di mana endpoint `GET /api/v1/auth/me` mengembalikan `{ userId, role, function }` yang disimpan di Pinia `auth.store` untuk keperluan render kondisional antarmuka pengguna.
5. **Interactive Prototype (02-morning-commitment.html)**: Mengimplementasikan kamus `roleHints` berbasis `currentUserFunction` dengan pemetaan departemen (`Engineering`, `Ops & Infra`, `Sales Enablement`, `Delivery`, `HRGA`) serta teks fallback umum.

Pada penelusuran audit S2, tercatat finding **`S2-FR-12-1`** pada `10-S2-Audit-Findings-Register.md`: implementasi frontend eksisting (`frontend/src/pages/MyTodayPage.vue:817-824`) hanya mengevaluasi nomor urut indeks komitmen (#1, #2, #3) dan mengembalikan contoh peran Developer secara hardcoded (`getPromptPlaceholder(idx)`), sehingga pengguna dari fungsi lain tidak mendapatkan diferensiasi kontekstual.

---

### 2. Deskripsi Masalah & Kesenjangan Spesifikasi

Berdasarkan hasil audit komprehensif terhadap seluruh Design Artifacts, ditemukan lima kesenjangan spesifikasi yang belum pernah diselesaikan secara definitif dalam dokumen kontrak terdahulu:
1. **Ketidakselarasan Taksonomi (Taxonomy Alignment Gap)**: Teks naratif PDD §5 dan UI/UX Spec §4.2 menyebut peran teknis (`Developer`, `QA`) dan role (`PM`), padahal dalam arsitektur data SAD §5.1, peran `Developer` dan `QA` tidak dimodelkan sebagai entitas atau nilai `function` tersendiri, sedangkan `PM` dimodelkan sebagai sistem `role`, bukan `function`. Sebaliknya, master data organisasi dan prototype resmi berbasis pada departemen operasional (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`).
2. **Diskrepansi Bahasa (Language Gap)**: UI/UX Spec dan prototype resmi menggunakan Bahasa Inggris (mis. *"Feature X completed"*, *"Complete payment gateway integration..."*), sedangkan aplikasi WorkPulse secara keseluruhan dan kode produksi eksisting menggunakan Bahasa Indonesia.
3. **Ambiguitas Gaya Kalimat (Prompt Style Ambiguity)**: UI/UX Spec §4.2 menulis contoh dalam bentuk lampau/selesai (*outcome style*: *"Feature X completed"*, *"Test case Y executed"*), padahal Morning Check-in adalah perencanaan komitmen kerja harian (*planning/action style*).
4. **Ambiguitas Variasi Slot (Slot Granularity Ambiguity)**: Implementasi eksisting dan register finding merujuk pada variasi per indeks slot komitmen (#1, #2, #3), sedangkan prototype resmi menerapkan satu prompt yang seragam untuk seluruh slot berdasarkan fungsi pengguna.
5. **Ketiadaan Teks Resmi untuk Sebagian Fungsi & Fallback (Missing Copy & Fallback Gap)**: Dokumen terdahulu tidak menyediakan copy resmi untuk fungsi `Finance` dan `Management`, serta tidak mendefinisikan teks fallback baku di tingkat PRD/UI-UX Spec jika fungsi pengguna kosong atau tidak dikenal.

Konsisten dengan preseden tata kelola repositori pada ADR-006, ADR-013, ADR-014, dan ADR-015, kesenjangan ini tidak boleh diinterpretasikan atau ditentukan secara sepihak oleh pengembang saat penulisan kode, melainkan harus diputuskan secara resmi oleh **Human Authority pada Decision Gate**.

---

### 3. Bukti & Rujukan Dokumen (*Evidence & References*)

1. **PDD v1.1 Section 5 (Lingkup MVP)**: Halaman 63, butir *Role-Based Output Templates*.
2. **PRD v1.1 Section 3.2 (Daily Accountability Record)**: Requirement `FR-12`.
3. **UI/UX Specification & Flow Document v1.2**: Section 4.2 (My Today — Morning Commitment), Section 6 (Komponen Reusable `RoleBasedPromptHint`), Section 7.1 (Flow Morning Check-in).
4. **Design System (04-DESIGN.md)**: Section 3.2 `RoleBasedPromptHint`.
5. **System Architecture Design v1.0**: Section 5.1 (Tabel `OrganizationalAssignment`), Section 5.4 (Tabel `Commitment`), Section 8.4 (AuthGuard request context), Section 10.1 (`GET /api/v1/auth/me`), Section 16.2 & 16.3 (`auth.store.ts` dan pemisahan client vs server state).
6. **Prototype Resmi**: `Design-Artifacts/UI-UX-Design/02-morning-commitment.html` baris 431–439, 786–806, 901, 956–959.
7. **Mockup Master Data**: `Design-Artifacts/UI-UX-Design/28-organization-mapping.html` baris 356–363, 415–420.
8. **Register Finding**: `Design-Artifacts/10-S2-Audit-Findings-Register.md` butir finding `S2-FR-12-1`.
9. **Preseden Tata Kelola**: ADR-006 (Pembedaan Aturan Tetap Produk vs Nilai Kebijakan Konfigurabel), ADR-013, ADR-014, ADR-015 (Resolusi Gap melalui Decision Gate oleh Human Authority).

---

### 4. Keputusan Arsitektural & Produk (*Architectural & Product Decisions*)

Berdasarkan keputusan Human Authority pada Decision Gate S2-B2, ditetapkan 10 keputusan produk dan arsitektural yang final, definitif, dan mengikat:

#### DECISION 1 — Taksonomi Fungsi Organisasi (*Function Taxonomy*)
1. FR-12 menggunakan atribut `function` dari `OrganizationalAssignment` pengguna aktif sebagai **satu-satunya dasar pemilihan** Role-Based Output Prompt.
2. FR-12 **TIDAK** menggunakan:
   - System `role` sebagai kunci pencarian (*key lookup*) prompt;
   - *Job title* atau posisi jabatan sebagai kunci pencarian prompt;
   - Taksonomi baru yang dibuat khusus untuk FR-12.
3. Fungsi kanonikal (*Canonical Functions*) yang secara resmi didukung dan dipetakan pada FR-12 mencakup 7 departemen:
   - `Engineering`
   - `Ops & Infra`
   - `Finance`
   - `Sales Enablement`
   - `Delivery`
   - `HRGA`
   - `Management`
4. Ketentuan khusus taksonomi:
   - `Developer` dan `QA` tidak menjadi key prompt FR-12 karena FR-12 menggunakan atribut `function` dari OrganizationalAssignment; istilah tersebut tetap dicatat sebagai contoh yang muncul dalam PDD/UI-UX Specification.
   - `PM` **TIDAK** menjadi key prompt karena dalam arsitektur data SAD §5.1, PM adalah `role` (sistem kewenangan peran), bukan `function`.
   - Nilai `function` tetap merupakan tipe data terbuka `VARCHAR` di basis data organisasi, bukan `ENUM` tertutup yang kaku.
   - Fungsi baru atau nilai di luar 7 fungsi kanonikal di atas secara otomatis menggunakan mekanisme fallback.

#### DECISION 2 — Sumber Data Fungsi (*Source of Function*)
Aliran data resolusi fungsi untuk FR-12 ditetapkan secara strictly un-directional melalui rantai arsitektur resmi:
$$\text{OrganizationalAssignment.function} \longrightarrow \text{Active Context (AuthGuard)} \longrightarrow \text{GET /api/v1/auth/me} \longrightarrow \text{auth.store} \longrightarrow \text{FR-12 RoleBasedPromptHint}$$
Komponen UI mengonsumsi fungsi dari `authStore.user.function`. Pemilihan prompt FR-12 tidak menggunakan `role`; lookup prompt harus menggunakan `authStore.user.function`.

#### DECISION 3 — Granularitas Prompt (*Prompt Granularity*)
Satu fungsi organisasi memiliki tepat **satu** teks `RoleBasedPromptHint`. Teks prompt yang sama ditampilkan pada:
- Slot Commitment #1
- Slot Commitment #2
- Slot Commitment #3

Tidak ada variasi teks prompt berdasarkan nomor urut slot atau indeks (`idx`). Nomor indeks slot tidak memiliki bobot semantik berbeda dalam produk dan bukan merupakan bagian dari kontrak pemilihan prompt FR-12.

#### DECISION 4 — Bahasa Resmi (*Language Standard*)
Bahasa resmi untuk seluruh teks `RoleBasedPromptHint` adalah **Bahasa Indonesia**. Pertimbangan: WorkPulse adalah alat operasional internal Dutamedia dengan antarmuka utama berbahasa Indonesia, dokumen requirement ditulis dalam Bahasa Indonesia, dan implementasi produksi berjalan menggunakan Bahasa Indonesia. Contoh berbahasa Inggris pada prototype diperlakukan sebagai percontohan visual desain, bukan bahasa rilis aplikasi.

#### DECISION 5 — Gaya Bahasa Prompt (*Prompt Style*)
Teks prompt wajib menggunakan format **action-oriented (berorientasi rencana tindakan)**, bukan format lampau/selesai (*outcome-oriented* / *past-tense* seperti *"Feature X completed"*). Prompt bertujuan membimbing karyawan merumuskan pekerjaan yang direncanakan untuk diselesaikan hari itu, dengan pola baku:
$$\text{"Contoh: [aksi konkret yang akan dilakukan hari ini]"}$$
Prompt tetap berstatus sebagai *inline suggestion* / *hint* murni:
- Tidak wajib diisi/diikuti;
- Tidak mengunci format kalimat pengguna;
- Tidak memvalidasi konten teks yang diketik;
- Tidak ikut tersimpan sebagai bagian dari isi komitmen resmi.

#### DECISION 6 — Salinan Teks Prompt Resmi (*Official Prompt Copy*)
Ditetapkan salinan teks baku (*exact copy*) untuk 7 fungsi kanonikal sebagai berikut:

| Fungsi Organisasi (`function`) | Salinan Teks Baku Resmi (`RoleBasedPromptHint`) |
|---|---|
| **Engineering** | `"Contoh: Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji"` |
| **Ops & Infra** | `"Contoh: Menyelesaikan konfigurasi atau pekerjaan infrastruktur yang direncanakan hari ini"` |
| **Finance** | `"Contoh: Menyelesaikan rekonsiliasi atau proses administrasi keuangan yang menjadi prioritas hari ini"` |
| **Sales Enablement** | `"Contoh: Menyelesaikan materi atau kebutuhan pendukung aktivitas penjualan hari ini"` |
| **Delivery** | `"Contoh: Menyelesaikan koordinasi atau pekerjaan yang mendukung delivery proyek hari ini"` |
| **HRGA** | `"Contoh: Menyelesaikan proses administrasi atau kebutuhan operasional karyawan hari ini"` |
| **Management** | `"Contoh: Menyelesaikan prioritas koordinasi atau keputusan yang perlu ditindaklanjuti hari ini"` |

*Catatan: Rumusan teks di atas adalah ketetapan produk final dan tidak boleh diubah susunan katanya.*

#### DECISION 7 — Mekanisme dan Salinan Teks Fallback (*Fallback Copy*)
Jika nilai fungsi pengguna memenuhi salah satu kondisi berikut:
- Bernilai `null`;
- Berupa string kosong (`""`);
- Tidak dikenali;
- Belum memiliki pemetaan prompt khusus;

maka sistem wajib menampilkan teks fallback resmi berikut secara *exact*:
$$\text{"Contoh: Tuliskan rencana pekerjaan yang ingin Anda selesaikan hari ini"}$$
Kondisi fallback bukan merupakan kondisi error aplikasi, bukan nilai komitmen default, dan murni bertindak sebagai placeholder netral.

#### DECISION 8 — Bentuk Arsitektural (*Architectural Form*)
FR-12 diimplementasikan murni sebagai **kamus statis di sisi frontend (*frontend static dictionary*)**.
Sistem **DILARANG** membuat:
- Tabel basis data baru `prompt_templates`;
- Backend service untuk pengelolaan prompt;
- Operasi CRUD prompt;
- Endpoint API baru untuk pengambilan prompt;
- Kategori baru pada enum `PolicyCategory`;
- Integrasi ke dalam `PolicyModule` atau `PolicyOwnerAssignment`;
- Penanggalan berlaku (*effective dating*) pada teks prompt;
- Pengambilan data via TanStack Query untuk template;
- Penyimpanan relasi prompt ke entitas `Commitment`.

*Rasional*: Selaras dengan SAD §5.9, ADR-006, dan implementasi prototype resmi `02-morning-commitment.html:797–806`. Prompt adalah teks panduan antarmuka (*UI static copy*), bukan data transaksional dan bukan kebijakan operasional yang dapat diubah saat runtime.

#### DECISION 9 — Perilaku Antarmuka Pengguna (*UI Behavior*)
Kontrak visual dan interaksi komponen `RoleBasedPromptHint` sesuai [04-DESIGN.md §3.2](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/04-DESIGN.md#L151) dan prototype wajib dipertahankan:
- Berupa teks *inline placeholder* di dalam elemen textarea input komitmen;
- Berformat miring (*italic*);
- Menggunakan warna sekunder (`color: var(--text-secondary)`);
- Muncul secara pasif saat textarea bernilai kosong;
- Menghilang seketika saat elemen menerima fokus pengguna (`focus`) atau saat pengguna mulai mengetik (`typing`);
- **Bukan** merupakan field input tersendiri (*"never a separate required field"*);
- Tidak pernah memblokir aksi submit pengguna;
- Tidak memodifikasi state nilai komitmen yang diketik pengguna.

#### DECISION 10 — Persistensi Data (*Persistence*)
Teks prompt **TIDAK disimpan ke dalam basis data**. Kolom `Commitment.text` pada skema database murni hanya menyimpan teks yang secara sadar diketikkan atau diserahkan oleh pengguna.

---

### 5. Alternatif yang Dipertimbangkan & Alasan Penolakan

| Alternatif yang Dipertimbangkan | Evaluasi & Alasan Penolakan |
|---|---|
| **Alternatif A: Menggunakan Jabatan Teknis (`Developer`, `QA`) sebagai Kunci Prompt** | **Ditolak**. Konsep spesifik *job title* atau spesialisasi teknis tidak dimodelkan dalam arsitektur basis data WorkPulse (SAD §5.1 hanya memodelkan `Role` dan `Function`). Memaksa pembuatan taksonomi baru akan merusak konsistensi data master organisasi dan menuntut migrasi skema yang tidak direncanakan. |
| **Alternatif B: Memasukkan Template ke dalam `PolicyCategory`** | **Ditolak**. Melanggar prinsip arsitektural SAD §5.9 dan preseden ADR-006. PolicyModule hanya mengelola aturan kebijakan operasional dengan siklus versi formal (seperti Cutoff dan Grace Period). Menjadikan prompt sebagai policy akan membebani database dan menimbulkan ilusi konfigurasi yang tidak perlu. |
| **Alternatif C: Layanan Dinamis Backend (Database Table & CRUD API)** | **Ditolak**. Merupakan *over-engineering* yang tidak memiliki rujukan dalam SAD maupun PRD. Prototype resmi membuktikan bahwa kebutuhan panduan kontekstual check-in cukup diselesaikan secara elegan di sisi klien melalui kamus statis. |
| **Alternatif D: Membedakan Teks Berdasarkan Indeks Slot (#1, #2, #3)** | **Ditolak**. Teks PRD FR-12 secara eksplisit berbunyi *"sesuai fungsi user"*, bukan sesuai urutan komitmen. Slot komitmen #1, #2, dan #3 memiliki bobot setara dan tidak memiliki perbedaan semantik dalam pemenuhan akuntabilitas harian. |
| **Alternatif E: Mempertahankan Teks Bahasa Inggris Sesuai Prototype** | **Ditolak**. Mengakibatkan inkonsistensi bahasa yang buruk (*poor UX localization*), karena seluruh label form, pesan validasi, dan alur aplikasi menggunakan Bahasa Indonesia. |

---

### 6. Rasional Keputusan (*Rationale*)

1. **Integritas Prinsip Waterfall WorkPulse**: Menutup gap interpretasi finding `S2-FR-12-1` secara definitif sebelum penulisan kode dimulai, mencegah pengembang membuat asumsi sendiri saat implementasi.
2. **Kesesuaian dengan Arsitektur Data SAD**: Menjaga agar pemilihan prompt sepenuhnya bersumber dari atribut `function` pengguna yang sah dari `GET /api/v1/auth/me`, tanpa menambah kolom basis data atau mengubah skema Prisma.
3. **Penyelarasan UX & Lokalisasi**: Menjamin keseragaman bahasa dan gaya kalimat yang relevan dengan fungsi Morning Check-in sebagai sarana komitmen harian kerja.
4. **Efisiensi Implementasi & Zero Overhead**: Menghilangkan dependensi jaringan, query database, atau state management yang kompleks untuk kebutuhan yang pada hakikatnya adalah petunjuk visual pengisian form (*placeholder hint*).

---

### 7. Konsekuensi Arsitektural (*Consequences*)

1. **Backend & Database**:
   - Nol perubahan pada skema database PostgreSQL dan Prisma (`schema.prisma`).
   - Nol migrasi database baru.
   - Nol perubahan pada modul backend (`DailyAccountabilityModule`, `IdentityModule`, `PolicyModule`).
2. **Frontend UI**:
   - Berkas konstanta frontend baru atau pembaruan pada `daily-records.constants.ts` untuk memuat kamus statis resmi `ROLE_BASED_PROMPT_HINTS` dan `DEFAULT_PROMPT_HINT`.
   - Modifikasi pada fungsi resolusi prompt di `frontend/src/pages/MyTodayPage.vue` untuk mengonsumsi `authStore.user?.function` dan menghapus evaluasi berbasis indeks slot (#1, #2, #3).
   - Pengujian komponen / unit test frontend untuk memastikan resolusi prompt berjalan deterministik untuk ke-7 fungsi kanonikal dan kondisi fallback.
3. **Status Audit & Temuan**:
   - Finding `S2-FR-12-1` pada `10-S2-Audit-Findings-Register.md` beralih dari status ambigu menjadi memiliki kriteria penutupan yang objektif dan terukur.

---

### 8. Risiko & Mitigasi Batasan Desain (*Risks & Limitations*)

1. **Penambahan Fungsi Organisasi Baru di Masa Depan**:
   - *Risiko*: Jika System Admin menambahkan nama departemen baru di master data organisasi yang belum terdaftar di kamus statis, pengguna fungsi tersebut akan melihat teks fallback.
   - *Mitigasi*: Diterima sebagai batasan desain yang wajar (*graceful degradation*). Teks fallback dirumuskan secara profesional dan cukup luas untuk memandu pengisian komitmen harian pada departemen apa pun. Pembaruan kamus fungsi dapat dilakukan melalui rilis frontend minor berkala.
2. **Pengguna Multi-Peran**:
   - *Risiko*: Pengguna dengan peran ganda atau peran manajerial yang mengisi komitmen harian.
   - *Mitigasi*: Resolusi tetap merujuk secara konsisten pada atribut penugasan organisasi aktifnya (`function`).

---

### 9. Tindakan Lanjutan (*Follow-up Actions*)

1. Menyusun rencana remediasi teknis (*Remediation Plan*) untuk implementasi finding `S2-FR-12-1` pada frontend.
2. Mengimplementasikan konstanta kamus statis dan menghubungkannya dengan `MyTodayPage.vue`.
3. Menulis automated unit test frontend pada test suite Vitest guna memverifikasi:
   - Evaluasi setiap fungsi kanonikal (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`);
   - Evaluasi saat `function` bernilai null, kosong, atau tidak dikenal (memverifikasi teks fallback);
   - Verifikasi keseragaman teks di seluruh slot komitmen (indeks 0, 1, 2);
   - Verifikasi perilaku UI (teks tidak mengontaminasi submitted data).
4. Melakukan verifikasi independen terhadap finding `S2-FR-12-1` sebelum penutupan administratif pada register temuan.

---

### 10. Persyaratan & Temuan Terkait (*Related Requirements*)

- **PRD**: `FR-12` (Role-Based Output Template/prompt tambahan).
- **PDD**: Section 5 (Role-Based Output Templates).
- **UI/UX Spec**: Section 4.2 & Section 6 (`RoleBasedPromptHint`).
- **Product Backlog**: `EPIC-19-T1` (Halaman My Today — Morning Check-in).
- **Findings Register**: `S2-FR-12-1`.

---

## ADR-017 — Penetapan Semantik Copy-Forward Draft (FR-11) Berbasis Continuation Komitmen Hari Sebelumnya

| Atribut | Nilai |
|---|---|
| **ID** | ADR-017 |
| **Tanggal** | 2026-10-04 |
| **Status** | **ACCEPTED** |
| **Menutup Open Item / Ref** | PRD FR-11, UI/UX Spec §4.2, UI/UX Spec §7.1, Finding S2-FR-11-1 |
| **Berlaku mulai** | S2 (Decision Gate S2-B4) |

> **Catatan Tata Kelola**: Keputusan arsitektural dan produk dalam ADR ini ditetapkan secara normatif dan mengikat oleh **Human Authority pada Decision Gate S2-B4**, bukan keputusan sepihak (*autonomous agent*), guna menyelesaikan kesenjangan arsitektural, diskrepansi kontrak API, dan ambiguitas semantik pada implementasi Copy-Forward Draft (PRD FR-11 / finding `S2-FR-11-1`).

---

### 1. Konteks & Latar Belakang

PRD FR-11 mengamanatkan: *"Sistem menyediakan copy-forward draft dari hari sebelumnya yang wajib dikonfirmasi/diedit user sebelum berlaku sebagai commitment resmi."*
UI/UX Specification §4.2 dan Flow §7.1 menetapkan bahwa saat check-in pagi, jika draft copy-forward tersedia, sistem menampilkannya sebagai *draft bertanda jelas* dengan opsi *Confirm* atau *Edit*, dan *tidak pernah submit otomatis tanpa aksi user*.

Pada audit investigasi independen S2 terhadap finding **`S2-FR-11-1`**, ditemukan sejumlah kesenjangan kritis pada implementasi eksisting:
1. **Backend Telah Menghasilkan Draft Namun Tidak Tersambung**: Layanan backend (`DailyAccountabilityService.getTodayRecord`) telah memfilter komitmen hari sebelumnya dan menyusun array `carryOverDraft`.
2. **Diskrepansi Envelope Kontrak API**: Backend mengembalikan struktur payload berbentuk `{ record, carryOverDraft, availableActions }`. Namun, antarmuka tipe pada frontend (`dailyRecordsApi.getTodayRecord`) mendefinisikan return type sebagai `ApiResponse<DailyAccountabilityRecord | null>`, sehingga layer query (`useTodayRecordQuery`) dan konsumen mengabaikan envelope `carryOverDraft`.
3. **Frontend Tidak Mengonsumsi Draft & UI Draft Banner Mati (*Dead Banner*)**: Komponen `frontend/src/pages/MyTodayPage.vue` menginisialisasi ref `draftCopyForwardText = ref('')` tanpa pernah memetakannya dari data query API. Akibatnya, blok alert `v-if="!isMorningSubmitted && draftCopyForwardText"` tidak pernah aktif dan tidak pernah dirender di antarmuka pengguna.
4. **Keterbatasan Semantik Single-String**: Desain UI eksisting pada `MyTodayPage.vue` berasumsi bahwa draft hanyalah string tunggal (`draftCopyForwardText`) yang langsung ditimpa ke Slot Komitmen #1 (`commitmentSlots[0].description = draftCopyForwardText`), padahal seorang karyawan dapat memiliki lebih dari satu komitmen yang berstatus lanjutan dari hari sebelumnya.
5. **Percampuran Domain Komitmen dan Additional Work di Backend**: Backend sebelumnya mencampur komitmen resmi dan pekerjaan tambahan (`commitments` dan `additionalWorks`) dengan `continuation === Continue` ke dalam `carryOverDraft` untuk Morning Commitment. Hal ini bertentangan dengan prinsip pemisahan domain pada PRD FR-07 (Additional Work tidak mengubah baseline Morning Commitment dan tidak menjadi komitmen ke-4).
6. **Ambiguitas Sumber Draft (Continuation vs. Tomorrow Priority)**: UI/UX Spec §4.4 dan §7.3 menyebutkan bahwa pengisian field opsional *Tomorrow Priority* pada EOD menyiapkan draft copy-forward besok. Namun, field tersebut tidak pernah disimpan atau dimodelkan di basis data backend (karena DTO dan skema Prisma tidak memiliki field `tomorrowPriority`, sehingga nilai yang dikirim frontend terbuang oleh whitelist validation pipe).

---

### 2. Keputusan Arsitektural & Produk (*Architectural & Product Decisions*)

Berdasarkan persetujuan resmi Human Authority pada Decision Gate S2-B4, ditetapkan empat keputusan normatif yang final dan mengikat:

#### DECISION 1 (D1) — Sumber Kebenaran Copy-Forward (*Source of Truth*)
1. Sumber kebenaran resmi (*source of truth*) untuk draft copy-forward Morning Check-in (FR-11) adalah **Continuation-based**, yaitu item dari hari kerja sebelumnya milik karyawan terkait yang memiliki status:
   $$\text{continuation} == \text{'Continue'}$$
2. Sumber item draft yang sah **hanya berasal dari Morning Commitment** hari kerja sebelumnya.
3. `Additional Work` hari kerja sebelumnya **TIDAK** menjadi sumber draft untuk Morning Commitment (diatur khusus pada D4).
4. `Tomorrow Priority` **BUKAN** merupakan sumber kebenaran FR-11.
5. Form dan tampilan UI `Tomorrow Priority` pada EOD Check-in **TIDAK BOLEH** dihapus atau diubah pada tahap remediasi FR-11 saat ini. Kesenjangan dan konflik antara requirement `Tomorrow Priority` dengan rancangan eksisting dicatat secara terpisah sebagai *follow-up design debt*, bukan diselesaikan secara diam-diam (*silent resolution*) di dalam remediasi FR-11.

#### DECISION 2 (D2) — Pengelolaan Multiple Drafts (*Draft Collection*)
1. Seluruh item Morning Commitment sebelumnya yang eligible (`continuation === 'Continue'`) **wajib dipertahankan sebagai koleksi draft** (`array/collection`).
2. Sistem dan antarmuka dilarang keras:
   - Membuang item ke-2 atau ke-3 secara diam-diam (*silent drop*);
   - Menggabungkan (*collapse*) beberapa draft menjadi satu string tunggal;
   - Memilih satu item secara sepihak (*arbitrary selection*).
3. Antarmuka pengguna (UI) harus mampu menampilkan daftar seluruh draft yang tersedia dan memungkinkan pengguna memilih/memasukkan draft tersebut ke dalam slot Morning Commitment yang tersedia.
4. Batas resmi kapasitas komitmen harian tetap mengikat: **maksimal 3 komitmen** (`MAX_DAILY_COMMITMENTS = 3`).
5. Jika jumlah eligible draft melebihi slot komitmen yang tersedia (atau jika pengguna sudah mengisi sebagian slot secara manual), pengguna memiliki kendali penuh untuk memilih dan mengelola draft mana yang digunakan; sistem dilarang membuat komitmen ke-4 atau membuang draft secara diam-diam.

#### DECISION 3 (D3) — Semantik Konfirmasi & Pengeditan (*Confirm / Edit Semantics*)
1. Aksi *Confirm as-is* maupun *Edit* pada banner draft **hanya bertindak mempersiapkan form (*form preparation*) dan TIDAK PERNAH melakukan submit otomatis ke backend**:
   - **Confirm as-is**: Memasukkan teks dan referensi draft ke slot komitmen yang dipilih tanpa mengubah teks.
   - **Edit**: Memasukkan teks dan referensi draft ke slot komitmen yang dipilih sehingga pengguna dapat langsung menyunting teksnya.
2. Pengguna **tetap wajib** menentukan `Initial Risk` (GREEN / AMBER / RED) untuk setiap komitmen yang diisi dari draft.
3. Validasi bersyarat risiko `AMBER` dan `RED` (kewajiban mengisi `knownBlocker` dan `supportNeeded`) tetap berlaku penuh.
4. Pengguna **tetap wajib** menekan tombol resmi *"Serahkan Morning Commitment"* untuk menyelesaikan check-in.
5. Hanya penyerahan resmi oleh pengguna yang membentuk komitmen baseline di basis data:
   $$\text{Draft} \longrightarrow \text{Confirm / Edit (Populate Form)} \longrightarrow \text{User Review \& Input Risk} \longrightarrow \text{User Submit} \longrightarrow \text{Official Commitment Baseline}$$
   *(Bukan: Draft $\rightarrow$ Confirm $\rightarrow$ Automatic Backend Submission).*

#### DECISION 4 (D4) — Pemisahan Domain Additional Work
1. Item `Additional Work` hari kerja sebelumnya dengan status `continuation === 'Continue'` **TIDAK BOLEH** menghasilkan draft yang masuk ke slot komitmen Morning Commitment (Commitment 1–3).
2. Mekanisme copy-forward FR-11 untuk Morning Commitment secara eksklusif hanya mengonsumsi item bertipe `Commitment`.
3. Keputusan ini menjaga integritas pemisahan domain akuntabilitas WorkPulse:
   - **Morning Commitment**: Baseline pekerjaan terencana hari itu yang dilindungi cutoff dan correction request;
   - **Additional Work**: Pekerjaan tambahan material tak terencana yang muncul di siang/sore hari, yang tidak boleh bertransformasi menjadi komitmen #4.
4. Siklus hidup (*lifecycle*) dan perilaku `Additional Work` lainnya tidak diubah di luar kebutuhan spesifik pemisahan draft FR-11 ini.

---

### 3. Batasan Eksplisit Non-Goals (*Explicit Non-Goals*)

Untuk membatasi risiko regresi dan menjaga integritas arsitektural, hal-hal berikut ditetapkan sebagai **Non-Goals** pada remediasi FR-11:
1. **Tidak Memperbaiki Tomorrow Priority**: Tidak mengubah skema database, DTO, atau alur penyimpanan `Tomorrow Priority` pada siklus EOD dalam lingkup penyelesaian FR-11.
2. **Tidak Membuat Layanan Prompt/Template Backend**: Template output tetap mengikuti tata kelola frontend statis sesuai ADR-016.
3. **Tidak Menambah Entitas PolicyCategory**: Draft copy-forward adalah fungsi operasional bawaan sistem (*built-in core feature*), bukan aturan kebijakan yang dikonfigurasi melalui `PolicyModule`.
4. **Tidak Mengubah Lifecycle Additional Work**: Tidak memodifikasi aturan pengeditan, batas waktu, atau alur EOD dari Additional Work yang telah diatur pada ADR-001.
5. **Tidak Melakukan Perubahan Skema Basis Data (Schema Change)**: Tidak ada migrasi database atau penambahan kolom/tabel baru pada Prisma schema, karena struktur data entitas `Commitment` dan `DailyAccountabilityRecord` yang ada telah memadai untuk mendukung logika continuation FR-11.

---

### 4. Konsekuensi Arsitektural (*Consequences*)

1. **Backend Response Envelope & Service**:
   - Backend `DailyAccountabilityService.getTodayRecord` diperbarui untuk memfilter secara murni `Commitment` saja (`sourceType: 'Commitment'`) dan mengeluarkan `AdditionalWork` dari array `carryOverDraft`.
   - Menjamin integritas isolasi pengguna (`employeeUserId: userId`) dan pemilihan tanggal sebelumnya (`workDate: { lt: today }`, `orderBy: { workDate: 'desc' }`).
   - Kontrak canonical response `GET /api/v1/daily-accountability-records/today` diformalkan:
     ```typescript
     export interface TodayRecordResponse {
       record: DailyAccountabilityRecord | null;
       carryOverDraft?: CarryOverDraftItem[];
       availableActions?: string[];
     }
     ```
2. **Frontend Type System & API Client**:
   - Berkas `frontend/src/types/daily-records.ts` diperkaya dengan antarmuka tipe `CarryOverDraftItem` dan `TodayRecordResponse`.
   - Klien `dailyRecordsApi.getTodayRecord()` mengembalikan `Promise<ApiResponse<TodayRecordResponse>>`.
   - Hook `useTodayRecordQuery()` mengembalikan `TodayRecordResponse` secara utuh.
3. **Frontend Component & State (`MyTodayPage.vue`)**:
   - State `draftCopyForwardText: Ref<string>` direfaktor menjadi koleksi terstruktur `carryOverDrafts = computed(() => todayData.value?.carryOverDraft || [])`.
   - Properti pembantu `record` dialihkan merujuk pada `todayData.value?.record` agar seluruh komputasi turunan (`isMorningSubmitted`, `isCutoffLocked`, `allEodItems`) tetap berfungsi tanpa regresi.
   - Komponen banner draft dirombak untuk menampilkan seluruh draft yang tersedia, dengan tombol aksi untuk memasukkan item ke dalam slot komitmen yang tersedia (*Confirm as-is* atau *Edit*).
   - Validasi kapasitas slot (`max 3`) diterapkan secara interaktif; tombol aksi draft dinonaktifkan atau memberikan panduan visual jika seluruh 3 slot telah terisi.
4. **Semantik Penyerahan & Integritas Baseline**:
   - Memastikan tidak ada pengiriman payload jaringan saat tombol draft diklik; seluruh mutasi draft bersifat murni *in-memory form state*.
   - Integritas aturan risiko `initialRisk` dan field `knownBlocker` / `supportNeeded` tetap terjaga utuh sebelum penyerahan.
5. **Strategi Pengujian (*Testing Rigor*)**:
   - Unit test backend wajib mencakup skenario komprehensif: ketiadaan record sebelumnya, komitmen non-Continue, multiple eligible commitments, pemisahan Additional Work Continue, isolasi antar-user, dan verifikasi ketiadaan mutasi basis data otomatis.
   - Component test frontend wajib memverifikasi render banner koleksi draft, aksi Confirm as-is, aksi Edit, perlindungan batas 3 slot, dan keterikatan penyerahan manual.

---

### 5. Catatan Kesenjangan Terbuka (*Open Issue: Tomorrow Priority*)

Tercatat secara formal bahwa terdapat pertentangan spesifikasi desain:
- **UI/UX Spec §4.4 & §7.3**: Menyatakan bahwa input *Tomorrow Priority* pada EOD Check-in berfungsi menyiapkan draft copy-forward esok hari.
- **PRD FR-11 & SAD §10.3**: Menekankan copy-forward draft dari hasil evaluasi akuntabilitas hari sebelumnya.
- **Implementasi Backend & Skema Prisma**: Kolom `tomorrowPriority` tidak didefinisikan pada tabel basis data `DailyAccountabilityRecord` maupun DTO `EodCheckinDto`.
- **Keputusan S2-B4**: Menetapkan kelanjutan komitmen (*continuation-based*) sebagai sumber kebenaran sah untuk pemenuhan FR-11.

*Status*: Isu ini dicatat sebagai **Follow-Up Design Debt**. Investigasi dan penyelarasan menyeluruh terhadap fungsionalitas `Tomorrow Priority` akan dijadwalkan pada siklus desain/refinement berikutnya tanpa mengganggu stabilitas remediasi FR-11.

---

### 6. Persyaratan & Rujukan Dokumen (*Related Requirements*)

- **PRD**: `FR-03`, `FR-04`, `FR-07`, `FR-09`, `FR-11` (Copy-forward draft dengan konfirmasi/edit wajib).
- **UI/UX Spec**: Section 4.2 (Morning Commitment Draft Banner), Section 7.1 (Flow Morning Check-in), Section 6 (`DraftBanner`).
- **SAD**: Section 5.4 (`Commitment`), Section 7.12, Section 10.3 (`DailyAccountabilityModule`).
- **Findings Register**: `S2-FR-11-1` (Status: OPEN).
- **Keputusan Terkait**: ADR-001 (Karakteristik AdditionalWork), ADR-006 (Aturan Tetap Produk vs Kebijakan), ADR-016 (Role-Based Output Prompt).

---

## ADR-018 - EOD Post-Cutoff Submission Semantics

| Atribut | Nilai |
|---|---|
| **ID** | ADR-018 |
| **Tanggal** | 2026-10-05 |
| **Status** | **ACCEPTED** |
| **Sumber Keputusan** | Human Authority Decision Gate (S2 — FR-26) |
| **Menutup Open Item / Ref** | PRD FR-26, SAD §9.2, SAD §9.8, Finding S2-TEST-GAP-6, Finding S2-FR26-GRACE0-1 |
| **Berlaku mulai** | S2 (Remediasi FR-26) |

### 1. Konteks & Latar Belakang

PRD FR-26 dan SAD §9.2 mendefinisikan klasifikasi timing submission: `OnTime` (`submittedAt ≤ onTimeDeadline`) dan `Late` (`onTimeDeadline < submittedAt ≤ cutOff`), serta `NoSubmission` bila tidak ada submission sampai `cutOff` (dievaluasi oleh scheduled job). UI/UX Spec §7.1 secara eksplisit menyatakan bahwa submit Morning Check-in setelah Cut-Off **ditolak**.

Dokumen desain yang ada **tidak secara eksplisit menyatakan perilaku EOD Check-in setelah cutoff**. Implementasi sebelumnya menolak Morning setelah cutoff, tetapi tetap menerima EOD setelah cutoff sehingga validitas submission EOD bergantung pada kapan scheduler `evaluateCutoffLock()` kebetulan mengunci record (race window). Audit juga menemukan bahwa nilai `GracePeriod = 0` (valid menurut SAD §5.9: integer menit `>= 0`) diperlakukan sebagai "tidak ada" akibat operator `|| 30` sehingga cutoff bergeser +30 menit.

> **Catatan Dokumentasi**: Keputusan ini berasal dari **Human Decision Gate** karena dokumen desain yang ada mendefinisikan `Late` sampai cutoff tetapi tidak menyatakan perilaku EOD setelah cutoff. ADR ini adalah *source of decision* untuk ambiguitas tersebut. PRD/PDD/UI-UX/SAD tidak diubah.

### 2. Keputusan

**A. Kontrak timing** (berlaku untuk Morning dan EOD, dievaluasi per request terhadap waktu saat ini):

| Kondisi | Hasil |
|---|---|
| `submittedAt ≤ deadline` | `OnTime` |
| `deadline < submittedAt ≤ cutoff` | `Late` |
| `submittedAt > cutoff` | **Ditolak** (`BusinessRuleViolationException`), tanpa penulisan data |

**B. Cakupan**: Morning Check-in, EOD Check-in, dan jalur override/konfirmasi EOD (`confirmOverride`) yang menerima/menyelesaikan submission EOD.

**C. Cutoff**: `cutoff = deadline + GracePeriod` terkonfigurasi (Morning dan EOD dievaluasi independen).

**D. GracePeriod**:
- `0` adalah nilai valid dan **wajib dipertahankan** (cutoff = deadline).
- Nilai `undefined`/hilang tetap memakai default yang sudah ada pada perilaku policy existing (30 menit). Operator fallback wajib berupa nullish (`??`), bukan truthiness (`||`).
- Kontrak validasi policy tidak diubah (`>= 0` tetap valid).
- Berlaku pada seluruh penggunaan produksi: submit Morning, submit EOD, `confirmOverride`, `evaluateCutoffLock`, dan `ComplianceService.evaluateNoSubmission`.

**E. Scheduler**: Scheduler **bukan** sumber kebenaran validitas submission. Validasi submission memakai waktu request terhadap deadline/cutoff. Scheduler hanya melakukan *cutoff locking* dan penandaan `NoSubmission` sesuai desain yang ada.

### 3. Rasional

- Validitas submission tidak boleh bergantung pada timing scheduler.
- Menghilangkan *race window* setelah cutoff.
- Menjadikan cutoff batas bisnis yang deterministik dan *auditable*.
- Menyelaraskan perilaku EOD dengan Morning.

### 4. Non-Goals (Eksplisit)

- Tidak mengubah kadens scheduler.
- Tidak mengubah nilai default maupun nilai policy GracePeriod.
- Tidak mengubah skema database.
- Tidak mengubah otorisasi existing.
- Tidak membuat tindakan disipliner otomatis.

### 5. Konsekuensi

- **Positif**: kontrak timing konsisten dan teruji untuk Morning dan EOD; nilai grace 0 dihormati di seluruh modul.
- **Trade-off yang diketahui**: user yang menerima prompt konfirmasi override EOD sebelum cutoff dan menekan konfirmasi setelah cutoff akan ditolak oleh `confirmOverride`, karena jalur tersebut menyelesaikan submission EOD.

### 6. Rujukan

- **PRD**: FR-26, FR-27, FR-31.
- **SAD**: §5.9 (nilai Policy `GracePeriod >= 0`), §9.2, §9.8.
- **UI/UX Spec**: Section 7.1 (submit setelah Cut-Off ditolak).
- **Findings Register**: `S2-TEST-GAP-6`, `S2-FR26-GRACE0-1`.
- **Keputusan Terkait**: ADR-006 (Aturan Tetap Produk vs Kebijakan), ADR-014 (Grace Period tidak termasuk jendela reminder).
