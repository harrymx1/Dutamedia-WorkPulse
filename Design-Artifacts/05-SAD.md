# System Architecture Design (SAD)
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.0 |
| Status | Draft — In Progress |
| Date | September 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.1, PRD v1.1, UI/UX Specification & Flow Document v1.2, Design System v1.1 |

> Dokumen ini adalah **Design Artifact 06** dalam rangkaian perancangan WorkPulse. Dokumen ini menerjemahkan **apa** yang harus dibangun (PDD, PRD, UI/UX Spec, Design System) menjadi **bagaimana** sistem ini secara teknis dirancang, distrukturkan, dan diamankan — termasuk kontrak API secara penuh — sebagai acuan langsung bagi Implementasi/Coding dan Product Backlog/Software Implementation Specification (Dokumen 07). Sesuai prinsip Waterfall WorkPulse, dokumen ini disusun agar tahap implementasi tidak perlu menentukan sendiri hal-hal di luar penerjemahan langsung dari rancangan.

---

# BAB I — FOUNDATION

## 1. Tujuan & Ruang Lingkup Dokumen

### 1.1 Tujuan

Dokumen ini bertujuan untuk:

1. Menetapkan **blueprint teknis final** WorkPulse — struktur module backend, skema data, kontrak API lengkap, mekanisme keamanan, dan topologi deployment — sebagai satu sumber kebenaran teknis yang konsisten.
2. Menjembatani requirement dan behavior yang sudah didefinisikan di PDD/PRD/UI-UX Spec menjadi keputusan teknis konkret.
3. Menjadi **kontrak resmi API** (endpoint, method, parameter, request/response, business rule yang ditegakkan) yang menjadi dasar implementasi — bukan hal yang ditentukan dadakan saat coding maupun "ditemukan" lewat generate otomatis dari kode.
4. Menjadi acuan yang cukup jelas dan terstruktur untuk mendukung **AI-assisted development** — sehingga proses implementasi (dibantu maupun tidak dibantu AI) tidak menghasilkan interpretasi yang berbeda-beda terhadap requirement yang sama.
5. Menjadi dasar penyusunan **Product Backlog/Software Implementation Specification** (Dokumen 07) — memastikan setiap task implementasi punya rujukan teknis yang jelas.

### 1.2 Ruang Lingkup — In-Scope

- Arsitektur aplikasi (module breakdown, tanggung jawab tiap module)
- Skema data konseptual-ke-teknis (ERD, pattern effective-dating, audit-linkage)
- **Spesifikasi endpoint API secara lengkap** — method, path, role/scope yang berwenang, request parameter/body, response body beserta status code, dan business rule yang ditegakkan pada tiap endpoint, sebagai kontrak resmi implementasi. OpenAPI/Swagger yang dihasilkan saat implementasi merepresentasikan kontrak ini — bukan sumber perancangannya.
- Arsitektur autentikasi, otorisasi, dan keamanan
- Formalisasi business rule kritis menjadi state machine
- Arsitektur mekanisme pendukung: scheduled job, notifikasi, reporting, file storage, audit trail, backup
- Arsitektur integrasi frontend-backend sebagai satu alur kerja utuh
- Arsitektur non-fungsional (performance, availability, testing)
- Topologi deployment (interim dan rencana target), termasuk mitigasi risiko infrastruktur interim

### 1.3 Ruang Lingkup — Out-of-Scope

- **Detail visual/UI** — sudah menjadi wilayah Design System (Dok 04) dan UI/UX Design (Dok 05).
- **Detail alur interaksi per halaman** — sudah menjadi wilayah UI/UX Specification & Flow (Dok 03).
- **Daftar task implementasi & prioritas** — menjadi wilayah Product Backlog/Software Implementation Specification (Dok 07).
- **Kode program aktual** — dokumen ini adalah blueprint dan kontrak, bukan implementasi.

### 1.4 Audiens Dokumen

Developer (manusia maupun AI-assisted), technical reviewer, dan pihak manajemen yang perlu memahami dasar keputusan teknis proyek ini.

---

## 2. Prinsip Arsitektur & Prinsip Pemilihan Teknologi

### 2.1 Prinsip Arsitektural

| Prinsip | Penerapan Teknis |
|---|---|
| **Backend sebagai satu-satunya source of truth** | Seluruh business rule kritis (cutoff, AMBER/RED reason wajib, Continue+Incomplete reason wajib, state transition blocker) divalidasi ulang di backend, terlepas dari validasi apapun yang sudah dilakukan di frontend. Frontend tidak pernah menjadi security/validation boundary. |
| **No silent state change (level teknis)** | Setiap perubahan status/data material harus melalui jalur yang eksplisit dan tertelusuri. Audit trail wajib untuk semua material write; mekanisme default-approve (Correction Request Material) tetap harus punya bukti eksplisit (notifikasi, indikator UI, timestamp keputusan). |
| **Semua yang bersifat historis, effective-dated** | Organizational Assignment, Project Authority Mapping, Policy, Temporary Reviewer — seluruhnya disimpan sebagai versi baru dengan `effectiveDate`/`endDate`, bukan overwrite. Data historis selalu dievaluasi menggunakan versi yang berlaku pada tanggal event, bukan versi terkini. |
| **Audit trail bersifat append-only dan harus survivable** | Tidak ada `UPDATE`/`DELETE` pada audit log. Perubahan data material dan audit event ditulis dalam satu transaction yang sama — gagal salah satu, keduanya rollback. Karena audit trail adalah bukti accountability inti produk, integritas dan keberlangsungannya tidak boleh bergantung sepenuhnya pada satu titik infrastruktur tanpa cadangan (Section 4.5). |
| **Policy adalah data, bukan kode** | Nilai kebijakan (cutoff, grace period, objection window duration, batas minor/material, dll.) tidak pernah di-hardcode. Seluruhnya tersimpan sebagai record ter-versi di database, dengan kewenangan edit dibatasi per kategori kebijakan (Authorized Policy Owner). |
| **Authorization = Role + Scope + Effective Date, bukan Role saja** | Setiap pemeriksaan izin akses melibatkan tiga dimensi ini secara bersamaan — bukan sekadar `if (role === 'Head')`. |
| **Exception-first, bukan report-first (level data/query)** | Query untuk dashboard dan agregasi dirancang untuk menonjolkan exception (RED, unacknowledged, no-submission) secara efisien — bukan menarik seluruh data lalu difilter di frontend. |
| **Hide, bukan disable** | Backend tidak pernah mengekspos aksi yang tidak valid untuk state saat ini; API dirancang agar hanya action yang valid untuk state tersebut yang diproses. |

### 2.2 Prinsip Pemilihan Teknologi

| # | Prinsip | Catatan |
|---|---|---|
| 1 | Sesuai kebutuhan WorkPulse — teknologi harus mampu menangani business rule, workflow, role, authority, dan audit trail yang kompleks | — |
| 2 | Sederhana tapi cukup kuat — skala 30–60 user tidak membutuhkan arsitektur kompleks | Menjadi dasar keputusan Modular Monolith (Section 6) dan mekanisme backup sederhana berbasis job internal (Section 4.5) |
| 3 | Sesuai ecosystem kantor (Vue, Vuetify, Pinia, ESLint) — memudahkan pemeliharaan jangka panjang oleh tim internal | — |
| 4 | Mudah dikembangkan tanpa mengganti fondasi teknologi | — |
| 5 | Mendukung AI-assisted development — struktur harus cukup jelas dan terstruktur | Menjadi salah satu alasan utama pemilihan TypeScript end-to-end, struktur module NestJS yang eksplisit, dan kontrak API lengkap di Section 10 |
| 6 | Security sebagai bagian dari sistem, bukan lapisan tambahan terpisah | — |
| 7 | Low-cost, dengan status "gratis" hanya berlaku untuk fase interim | Railway dan Supabase pada Free Tier masing-masing punya batasan operasional (Section 4.2, 4.5) yang dimitigasi eksplisit. Prinsipnya: biaya operasional tetap minim pada fase interim, dengan jalur migrasi jelas ke infrastruktur resmi perusahaan begitu disetujui (Section 4) |

---

## 3. Overview Arsitektur

### 3.1 Gambaran Tingkat Tinggi

```
                         ┌─────────────────────────┐
                         │        BROWSER          │
                         │   (Employee ... Admin)   │
                         └────────────┬─────────────┘
                                      │ HTTPS
                                      ▼
                         ┌─────────────────────────┐
                         │   FRONTEND (Vue 3 SPA)   │
                         │      Hosted: Vercel      │
                         └────────────┬─────────────┘
                                      │ REST API (JSON)
                                      │ + HttpOnly Secure Cookie (JWT)
                                      ▼
                         ┌───────────────────────────┐
                         │    BACKEND (NestJS)        │
                         │    Hosted: Railway          │
                         │    Modular Monolith        │
                         │  ├─ Auth & Authorization    │
                         │  ├─ Business Logic/Modules  │
                         │  ├─ Scheduled Jobs          │
                         │  │   (incl. keepalive &     │
                         │  │    scheduled DB backup)  │
                         │  └─ Audit & Security        │
                         └───────┬─────────┬───────────┘
                                 │         │
                    Prisma       │         │ SDK/API
                (direct conn.)   ▼         ▼
                    ┌─────────────────┐  ┌──────────────────────┐
                    │   PostgreSQL     │  │  Supporting Services  │
                    │ Hosted: Supabase │  │  ├─ Brevo (Email)      │
                    │ (Free Tier —     │  │  └─ Object Storage     │
                    │  Database only,  │  │     (S3-compatible)     │
                    │  no Auth/Storage │  │     ├─ Evidence files   │
                    │  digunakan)      │  │     └─ DB backup dumps  │
                    │ Application +    │  │                        │
                    │ Audit Data       │  │                        │
                    └─────────────────┘  └──────────────────────┘
```

### 3.2 Karakteristik Arsitektur Utama

| Aspek | Pendekatan | Dibahas Detail di |
|---|---|---|
| Application Architecture | Modular Monolith (satu aplikasi NestJS, module terstruktur per domain) | Section 6 |
| API Architecture | REST API + kontrak endpoint lengkap sebagai dasar OpenAPI/Swagger | Section 7, Section 10 |
| Data Architecture | Relational (PostgreSQL, di-hosting via Supabase — database only), effective-dated, append-only audit | Section 5 |
| Auth Architecture | JWT + HttpOnly Secure Cookie, RBAC + Contextual Scope + Effective Date (custom, bukan Supabase Auth) | Section 8 |
| Background Processing | In-process scheduler (`@nestjs/schedule`), tanpa queue/Redis terpisah; juga berperan sebagai keepalive & pemicu backup terjadwal | Section 11 |
| Frontend Architecture | SPA (Vue 3), server-state vs client-state terpisah (TanStack Query vs Pinia) | Section 16 |
| Integrasi FE-BE | Kontrak tipe dari kontrak API, polling-based sync (bukan real-time/WebSocket) | Section 17 |
| Deployment | Interim (Vercel + Railway + Supabase) → Target (infrastruktur resmi perusahaan), dijembatani Docker & database dump/restore | Section 4, Section 21 |

### 3.3 Yang Sengaja Tidak Dipakai (Ringkasan)

Konsisten dengan prinsip "sederhana tapi cukup kuat" (Section 2.2 #2) dan skala 30–60 user: **tidak** menggunakan microservices, Kubernetes, message queue (Kafka), GraphQL, maupun database non-relational. Redis belum digunakan pada tahap ini karena session management dan scheduled job cukup ditangani PostgreSQL + in-process scheduler. Fitur bawaan Supabase di luar Postgres (Auth, Storage, Realtime, Edge Functions) juga sengaja tidak dipakai — WorkPulse hanya memanfaatkan Supabase sebagai hosting database PostgreSQL, sementara Auth dan Storage tetap menggunakan solusi custom (Section 8, Section 14) agar tidak terikat pada satu vendor secara berlebihan. Detail penuh keputusan "teknologi yang tidak digunakan" beserta alasannya diringkas di Section 22 (Technology Decisions Log).

---

## 4. Deployment Strategy (Decision & Rationale)

> Section ini menjelaskan **keputusan dan alasannya** — bukan detail teknis konfigurasi, yang dibahas terpisah di Section 21 (Deployment Topology & Infrastructure Diagram).

### 4.1 Latar Belakang Keputusan

WorkPulse dikerjakan dengan timeline ketat (31 hari total, 4 hari untuk fase Deployment) sebagai proyek yang ditugaskan sebelum ada kepastian infrastruktur resmi dari perusahaan. Untuk menjaga kecepatan development tanpa terhambat proses procurement infrastruktur, WorkPulse menggunakan **infrastruktur interim** yang murah dan cepat disiapkan, dengan desain yang sengaja dibuat portable sejak awal.

### 4.2 Model Interim vs Target

| Fase | Infrastruktur | Sifat |
|---|---|---|
| **Interim** (development s.d. handover — hingga 4 Okt 2026) | Vercel (frontend) + Railway (backend) + Supabase (PostgreSQL — database only) | Cepat disiapkan, biaya rendah namun bukan gratis penuh, dan masing-masing punya batasan operasional pada Free Tier (Section 4.5); cocok untuk pilot/MVP dengan 30–60 user |
| **Target** (setelah disetujui perusahaan) | Infrastruktur resmi Dutamedia (server/cloud yang dibayar perusahaan) | Menjadi lingkungan produksi permanen |

> **Penting:** Deliverable yang di-*handover* pada akhir timeline (2–4 Okt 2026) kemungkinan besar masih berjalan di infrastruktur interim, mengingat fase Deployment hanya berdurasi 4 hari. Status ini dikomunikasikan eksplisit ke pihak manajemen sebagai bagian dari deliverable — bukan diasumsikan sebagai infrastruktur produksi permanen.

### 4.3 Prinsip Portabilitas — Docker & Pemisahan Compute-Data

1. **Backend dikemas sebagai Docker image standar** — dijalankan di Railway melalui image tersebut, sehingga image yang sama dapat dijalankan di VM internal kantor, cloud lain, atau bare-metal tanpa modifikasi.
2. **Database sudah terpisah dari compute sejak awal** — backend (Railway) dan database (Supabase) berada di provider berbeda, sehingga migrasi masing-masing dapat dilakukan independen.
3. **Tidak menggunakan fitur yang platform-specific**: scheduled job (Section 11) diimplementasikan di dalam aplikasi NestJS (`@nestjs/schedule`), bukan fitur Cron milik Railway; file/evidence storage memakai layanan S3-compatible (Cloudflare R2, MinIO, atau setara); database menggunakan PostgreSQL standar melalui koneksi langsung, tidak memanfaatkan fitur eksklusif Supabase di luar Postgres murni.
4. **Seluruh konfigurasi lingkungan melalui environment variable** (`DATABASE_URL`, `JWT_SECRET`, `BREVO_API_KEY`, `STORAGE_*`, dst.) — tidak ada hardcode host/URL spesifik platform.
5. **Skema & migrasi database version-controlled** (Prisma schema + migration files di Git) — prosedur migrasi data aktual (`pg_dump` dari Supabase → `pg_restore` ke target) menjadi bagian deployment runbook, sekaligus fondasi mekanisme backup rutin (Section 4.5).
6. **Frontend (Vercel)** memiliki risiko migrasi paling rendah — output static build (Vue SPA) yang dapat di-build ulang dan disajikan dari hosting statis manapun.

### 4.4 Koneksi ke Database (Supabase)

Backend terhubung ke Supabase PostgreSQL melalui **direct connection** (bukan connection pooler/Supavisor), karena backend berjalan sebagai proses long-running — ini menghindari isu kompatibilitas Prisma dengan connection pooler dalam mode transaksi. Supabase hanya digunakan sebagai hosting database PostgreSQL; fitur Supabase lain (Auth, Storage, Realtime, Edge Functions) secara sadar tidak digunakan, konsisten dengan Section 8 dan Section 14.

### 4.5 Known Risk & Mitigasi — Infrastruktur Free Tier

| Risiko | Sumber | Mitigasi |
|---|---|---|
| **Auto-pause karena inaktivitas** — Supabase Free menghentikan sementara project tanpa aktivitas database 7 hari berturut-turut | Batasan Supabase Free Tier | Scheduled job (Section 11) yang berjalan rutin setiap 5 menit secara alami berfungsi sebagai keepalive, selama backend (Railway) tetap berjalan 24/7 |
| **Tidak ada backup otomatis** — Supabase Free tidak menyediakan backup harian | Batasan Supabase Free Tier | Scheduled backup job: `pg_dump` dijalankan otomatis 1×/hari di luar jam kerja, hasil disimpan ke Object Storage S3-compatible (folder terpisah dari evidence file), retensi 7–14 hari terakhir |
| **Kapasitas database terbatas (500 MB)** — dapat terisi seiring waktu karena audit trail bersifat append-only | Batasan Supabase Free Tier | Dicatat sebagai indikator pemicu migrasi (Section 4.2) — dipantau berkala; upgrade ke Supabase Pro atau migrasi ke target infrastructure dilakukan begitu mendekati batas |

### 4.6 Dampak Keputusan Ini terhadap Section Lain

- Section 11 (Scheduled Job) — wajib in-process; bertanggung jawab atas keepalive database dan backup harian.
- Section 14 (File & Evidence Storage) — wajib S3-compatible, juga menjadi lokasi penyimpanan hasil backup database.
- Section 21 (Deployment Topology) — mendokumentasikan konfigurasi teknis aktual, termasuk runbook migrasi data.

---

# BAB II — BACKEND ARCHITECTURE

## 5. Data Architecture (ERD & Skema Detail)

### 5.1 Pendekatan & Notasi

Section ini menerjemahkan **Data Requirements (Conceptual)** — PRD Section 6 — menjadi skema teknis. Tiga pattern lintas-entity berlaku di hampir semua domain WorkPulse:

- **Effective-Dating Pattern** — entity historis (Organizational Assignment, Project Authority Mapping, Temporary Reviewer, Policy) menyimpan `effectiveDate` + `endDate` (nullable = aktif), tidak pernah overwrite. Query historis selalu `WHERE effectiveDate <= :date AND (endDate IS NULL OR endDate >= :date)`.
- **Snapshot Pattern** — entity yang mencatat event (Daily Accountability Record, Correction Request, Compliance Event) menyimpan **nilai aktual** dari konteks organisasi/kebijakan yang berlaku saat event terjadi, bukan referensi ID hidup — menegakkan BR-10/BR-12/FR-24/FR-33 secara struktural.
- **Polymorphic Reference Pattern** — entity yang merujuk ke "entity manapun" (Audit Log, Manager Note evidence, Notification) selalu memakai pasangan `relatedEntityType` (VARCHAR) + `relatedEntityId` (UUID) — bukan JSONB bebas, supaya tetap bisa di-query/di-index.

### 5.2 Entity Relationship Diagram — Overview

```
User ─────┬──< Session
          ├──< Organizational Assignment (effective-dated)
          ├──< Project Authority Mapping (effective-dated, multi-concurrent)
          ├──< Temporary Reviewer Assignment (effective-dated)
          ├──< Daily Accountability Record ──< Commitment ──< Correction Request
          │                                └──< Additional Work
          ├──< Blocker ──< Support Contribution
          ├──< Manager Note ─── (relatedEntityType/Id → polymorphic)
          ├──< Compliance Event
          ├──< Exception (Leave/Holiday/Exemption)
          ├──< Notification ─── (relatedEntityType/Id → polymorphic)
          └──< Policy Owner Assignment >── Policy (effective-dated)

Audit Log ──> (relatedEntityType/Id → polymorphic reference ke seluruh entity di atas)
```

### 5.3 Domain: Identity & Organization

> Sumber: PRD §6, PDD §6, BR-10, BR-11, FR-22–FR-25, FR-50, Section 8 (Session)

`User` hanya menyimpan identitas login — role, function, dan direct manager disimpan di `Organizational Assignment` sebagai data effective-dated, konsekuensi langsung dari BR-10.

**`User`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| fullName | VARCHAR | |
| email | VARCHAR (unique) | Digunakan sebagai login identifier |
| passwordHash | VARCHAR | Argon2id — Section 8 |
| status | ENUM(Active, Inactive) | FR-22 |
| mustResetPassword | BOOLEAN | Wajib reset saat login pertama (FR-50) |
| createdAt, updatedAt | TIMESTAMP | |

**`OrganizationalAssignment`** (effective-dated)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| userId | UUID (FK → User) | |
| role | ENUM(Employee, Supervisor_TL, Head, PM, HRGA, CEO_Management, SystemAdmin) | PDD §4 |
| function | VARCHAR | mis. Engineering, Ops & Infra, Finance, dst. |
| directManagerId | UUID (FK → User, nullable) | Nullable untuk posisi puncak struktur |
| effectiveDate | DATE | |
| endDate | DATE (nullable) | NULL = aktif saat ini |
| createdByUserId | UUID (FK → User) | FR-22 |
| createdAt | TIMESTAMP | |

Satu `userId` hanya boleh memiliki satu assignment aktif (periode tidak overlap) — berbeda dengan Project Authority Mapping.

**`ProjectAuthorityMapping`** (effective-dated, independen, multi-concurrent)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| userId | UUID (FK → User) | |
| scopeReference | VARCHAR | Referensi project/scope — manual di MVP |
| effectiveDate | DATE | |
| endDate | DATE (nullable) | |
| createdByUserId | UUID (FK) | |
| createdAt | TIMESTAMP | |

Satu `userId` boleh memiliki lebih dari satu row aktif bersamaan (PDD §6) — dipilih kontekstual per blocker/escalation (`Blocker.ownerNeededType`, Section 5.5).

**`TemporaryReviewerAssignment`** (effective-dated)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| reviewerUserId | UUID (FK → User) | |
| scope | VARCHAR | Fungsi/tim yang di-cover sementara |
| reason | VARCHAR (nullable) | mis. "Head vacant" |
| effectiveDate | DATE | |
| expiryDate | DATE | Wajib (BR-11) |
| createdByUserId | UUID (FK) | |
| createdAt | TIMESTAMP | |

**`Session`** *(dimiliki `AuthModule`, Section 6.2 — ditempatkan di domain ini karena berelasi erat dengan `User`)*

Mendukung revocation instan (logout, atau Admin men-deactivate user — FR-22). Setiap JWT terhubung ke satu row `Session` yang bisa dicabut kapan saja.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Dipakai sebagai claim `jti` di JWT |
| userId | UUID (FK → User) | |
| issuedAt | TIMESTAMP | |
| expiresAt | TIMESTAMP | `issuedAt + 12 jam` (Section 8.4) |
| revokedAt | TIMESTAMP (nullable) | Diisi saat logout atau deactivation |
| userAgent | VARCHAR (nullable) | Visibilitas keamanan opsional |
| createdAt | TIMESTAMP | |

### 5.4 Domain: Daily Accountability

> Sumber: PRD §6, §3.1–3.3, BR-01–BR-04, FR-02–FR-11, Section 9.2/9.8

**`DailyAccountabilityRecord`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| employeeUserId | UUID (FK → User) | |
| workDate | DATE | |
| orgContextSnapshot | JSONB | Snapshot `{role, function, directManagerId}` saat `workDate` — FR-02, FR-24 |
| policySnapshot | JSONB | Nilai aktual Policy kategori `Cutoff`, `GracePeriod`, `WorkdayCalendar` saat `workDate` — FR-33 |
| morningSubmittedAt | TIMESTAMP (nullable) | |
| eodSubmittedAt | TIMESTAMP (nullable) | |
| morningTiming | ENUM(OnTime, Late, NoSubmission) | FR-26 — evaluasi di Section 9.2 |
| eodTiming | ENUM(OnTime, Late, NoSubmission) | FR-26 — evaluasi di Section 9.2 |
| cutoffLockedAt | TIMESTAMP (nullable) | Diisi scheduled job saat Morning cutoff terlewati |
| initialStatus | ENUM(GREEN, AMBER, RED) | System-derived (worst-of `Commitment.initialRisk`) — Section 9.3 |
| finalStatus | ENUM(GREEN, AMBER, RED) | User-selected oleh Employee saat EOD — FR-10, Section 9.3 |
| createdAt, updatedAt | TIMESTAMP | |

Constraint: unique (`employeeUserId`, `workDate`).

**`Commitment`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| dailyRecordId | UUID (FK → DailyAccountabilityRecord) | |
| sequenceNo | SMALLINT (1–3) | BR-01 |
| text | TEXT | Field kelompok Morning |
| referenceLink | VARCHAR (nullable) | Field kelompok Morning |
| initialRisk | ENUM(GREEN, AMBER, RED) | Field kelompok Morning |
| knownBlockerNote | TEXT (nullable) | Field kelompok Morning — wajib jika `initialRisk` ∈ {AMBER, RED} — FR-04 |
| supportNeeded | TEXT (nullable) | Field kelompok Morning — kondisional |
| outcome | ENUM(Completed, PartiallyCompleted, NotCompleted, Cancelled) | Field kelompok EOD |
| outcomeReason | TEXT (nullable) | Field kelompok EOD — wajib jika `Cancelled` |
| continuation | ENUM(Continue, DoNotContinue) | Field kelompok EOD — dimensi terpisah dari outcome — FR-09 |
| continuationReason | TEXT (nullable) | Field kelompok EOD — wajib jika `Continue` DAN `outcome != Completed` — FR-09 |
| isMorningLocked | BOOLEAN | `true` setelah Morning cutoff — mengunci field kelompok Morning |
| isEodLocked | BOOLEAN | `true` setelah EOD cutoff — mengunci field kelompok EOD |
| createdAt, updatedAt | TIMESTAMP | |

**`AdditionalWork`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| dailyRecordId | UUID (FK) | |
| text | TEXT | |
| reason | ENUM(NewlyAssigned, MissedInPlanning, PriorityChange, OperationalIncident, Other) | FR-06 |
| assignedByUserId | UUID (FK → User, nullable) | Wajib jika `reason = NewlyAssigned` |
| outcome | ENUM(sama seperti Commitment) | |
| continuation | ENUM(sama seperti Commitment) | |
| isLocked | BOOLEAN | `true` setelah EOD cutoff (sinkron `isEodLocked`) |
| createdAt | TIMESTAMP | |

`AdditionalWork` tidak memiliki `sequenceNo` ke-4 — secara struktural terpisah dari `Commitment`, menegakkan BR-01/FR-07 di level skema. `AdditionalWork` juga tidak memiliki konsep lock Morning, karena dibuat kapan saja setelah Morning Check-in, di luar baseline.

### 5.5 Domain: Blocker & Support

> Sumber: PRD §6, §3.4, FR-15–FR-21, Section 9.4

**`Blocker`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| raisedByUserId | UUID (FK → User) | |
| linkedCommitmentId | UUID (FK → Commitment, nullable) | NULL jika instant blocker — FR-15 |
| type | VARCHAR | |
| severity | ENUM(Low, Medium, High, Critical) | |
| impact | TEXT | |
| ownerNeededType | ENUM(OrganizationalAuthority, ProjectAuthority) | FR-19 |
| ownerNeededUserId | UUID (FK → User) | Diresolusi kontekstual (Section 8.9) |
| relatedScopeReference | VARCHAR (nullable) | Diisi jika `ownerNeededType = ProjectAuthority`, merujuk `scopeReference` pada `ProjectAuthorityMapping` yang jadi dasar resolusi; basis data `AuthorityTag` (Design System) |
| status | ENUM(Open, Acknowledged, InProgress, Resolved, Closed, AcceptedRisk) | FR-17 |
| raisedAt | TIMESTAMP | Auto |
| acknowledgedAt, resolvedAt, closedAt | TIMESTAMP (nullable) | |
| expectedResolution | DATE (nullable) | |
| resolutionNote | TEXT (nullable) | |

State-transition rule diformalkan penuh di Section 9.4.

**`SupportContribution`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| blockerId | UUID (FK → Blocker) | |
| supporterUserId | UUID (FK → User) | |
| action | TEXT | |
| resultNote | TEXT | |
| createdAt | TIMESTAMP | |

### 5.6 Domain: Correction Request

> Sumber: PRD §6, §3.9, BR-16, FR-43–FR-45, Section 9.6

**`CorrectionRequest`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| targetCommitmentId | UUID (FK → Commitment) | |
| requestedByUserId | UUID (FK → User) | |
| requestedChange | JSONB | Field yang diubah + nilai baru |
| reason | TEXT | Wajib — FR-43 |
| classification | ENUM(Minor, Material) | Ditentukan `policySnapshot.minorMaterialThreshold` |
| policySnapshot | JSONB | Nilai aktual Policy `MinorMaterialThreshold` dan `ObjectionWindowDuration` saat pengajuan |
| status | ENUM(Applied, Pending, Rejected) | |
| objectionWindowStart | TIMESTAMP (nullable) | Diisi jika `classification = Material` |
| objectionWindowEnd | TIMESTAMP (nullable) | Dihitung dari `policySnapshot.objectionWindowDuration` |
| reviewedByUserId | UUID (FK → User, nullable) | Diisi jika ada objection eksplisit |
| objectionReason | TEXT (nullable) | |
| appliedAt | TIMESTAMP (nullable) | |
| createdAt | TIMESTAMP | |

`CorrectionRequest` mencakup seluruh field pada `Commitment` yang sedang berstatus locked — baik kelompok field Morning maupun kelompok field EOD, mengikuti kelompok mana yang terkunci saat pengajuan diajukan (formalisasi lengkap Section 9.6). Setiap `CorrectionRequest` Applied wajib menghasilkan satu row `AuditLog` dengan `valueBefore`/`valueAfter`, ditulis dalam transaction yang sama (Section 5.11.c).

### 5.7 Domain: Exception (Leave/Holiday/Exemption)

> Sumber: PRD §6, BR-07, BR-18, FR-46–FR-48

**`Exception`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| type | ENUM(Leave, Holiday, Exemption) | |
| employeeUserId | UUID (FK → User, nullable) | Wajib untuk `Leave`; NULL untuk `Holiday` |
| dateStart | DATE | |
| dateEnd | DATE | |
| status | ENUM(Pending, Approved, Rejected) | Relevan hanya `Leave` (FR-47); `Holiday`/`Exemption` langsung valid (BR-18) |
| approvedByUserId | UUID (FK → User, nullable) | Leave only |
| createdByUserId | UUID (FK → User) | |
| createdAt | TIMESTAMP | |

Tanggal dengan `Exception` valid dikecualikan otomatis dari perhitungan No Submission (FR-48) — logic query di Section 9.7.

### 5.8 Domain: Manager Note & Compliance Event

> Sumber: PRD §6, BR-09, BR-14, FR-39–FR-40, FR-29, FR-49, Section 9.7

**`ManagerNote`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| aboutUserId | UUID (FK → User) | Subject catatan |
| createdByUserId | UUID (FK → User) | |
| type | ENUM(Coaching, Recognition, Corrective) | |
| note | TEXT | |
| relatedEntityType | VARCHAR (nullable) | Polymorphic reference |
| relatedEntityId | UUID (nullable) | |
| visibility | ENUM | Permission lebih ketat dari daily log biasa (BR-14) |
| createdAt | TIMESTAMP | |

**`ComplianceEvent`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| userId | UUID (FK → User) | |
| eventType | ENUM(NoSubmission, PatternFlag, Coaching, RecordedWarning, EscalatedFormalProcess) | PDD §7, Section 9.7 |
| eventDate | DATE | |
| relatedDailyRecordId | UUID (FK, nullable) | |
| policySnapshot | JSONB | Nilai aktual Policy `CoachingFollowUpPeriod`/threshold — FR-33 |
| followUpStatus | VARCHAR | |
| createdAt | TIMESTAMP | |

Satu `workDate` dengan Morning dan EOD sama-sama No Submission tetap dihitung maksimum satu `ComplianceEvent(eventType=NoSubmission)` (FR-49) — `DailyAccountabilityRecord` menyimpan fakta detail, `ComplianceEvent` menyimpan hasil agregasi untuk pattern detection.

### 5.9 Domain: Policy

> Sumber: PRD §6, §3.6, BR-12, BR-15, FR-31–FR-35

**`Policy`** (effective-dated)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| category | ENUM(Cutoff, GracePeriod, WorkdayCalendar, EscalationThreshold, CoachingFollowUpPeriod, RetentionPeriod, ExemptionRule, ObjectionWindowDuration, MinorMaterialThreshold, ParticipationRule) | FR-31 |
| value | JSONB | Mis. `Cutoff.value = {morningOnTimeDeadline: "09:00", eodOnTimeDeadline: "18:00"}`, `GracePeriod.value = {morningGraceMinutes: 30, eodGraceMinutes: 30}` |
| effectiveDate | DATE | |
| endDate | DATE (nullable) | |
| status | ENUM(Active, Inactive) | |
| createdByUserId | UUID (FK) | |
| createdAt | TIMESTAMP | |

**`PolicyOwnerAssignment`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| userId | UUID (FK → User) | |
| policyCategory | ENUM (sama seperti `Policy.category`) | |
| effectiveDate | DATE | |
| endDate | DATE (nullable) | |

Dipisah dari `Policy` karena BR-15 menegaskan kewenangan edit per kategori, bukan melekat pada satu Admin. `policySnapshot` di seluruh entity Section 5.4/5.6/5.8 menyalin nilai dari `Policy` aktif saat event terjadi — bukan `Policy.id` sebagai referensi tunggal, karena satu event umumnya bergantung pada lebih dari satu kategori Policy sekaligus.

### 5.10 Domain: Notification & Audit Log

> Sumber: PRD §6, §8, FR-38

**`Notification`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| recipientUserId | UUID (FK → User) | |
| triggerType | VARCHAR | PRD §8 |
| relatedEntityType | VARCHAR (nullable) | Polymorphic reference |
| relatedEntityId | UUID (nullable) | |
| channel | ENUM(Email, BrowserPush, WebNotificationCenter) | |
| payload | JSONB | Konten/link tujuan |
| status | ENUM(Sent, Read, Failed) | |
| sentAt | TIMESTAMP (nullable) | |
| readAt | TIMESTAMP (nullable) | |

Karena satu trigger event dapat dikirim ke lebih dari satu channel sekaligus, cek idempotency scheduled job memakai kombinasi `(triggerType, relatedEntityId, channel)` — bukan `relatedEntityId` saja.

**`AuditLog`** (append-only)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| actorUserId | UUID (FK → User, nullable) | NULL jika system-triggered |
| action | VARCHAR | mis. `CORRECTION_APPLIED`, `BLOCKER_STATUS_CHANGED`, `BLOCKER_AUTO_ESCALATED` |
| relatedEntityType | VARCHAR | Polymorphic reference |
| relatedEntityId | UUID | |
| valueBefore | JSONB (nullable) | |
| valueAfter | JSONB (nullable) | Untuk event non-field-change (mis. override status dengan reason), konteks tambahan disimpan sebagai bagian struktur ini |
| timestamp | TIMESTAMP | |

Tidak ada kolom `updatedAt`/`deletedAt` — menegakkan sifat append-only secara struktural.

### 5.11 Ringkasan Pattern Lintas-Domain

| Pattern | Diterapkan Pada | Aturan |
|---|---|---|
| **a. Effective-Dating** | OrganizationalAssignment, ProjectAuthorityMapping, TemporaryReviewerAssignment, Policy, PolicyOwnerAssignment | `effectiveDate` + `endDate` (nullable = aktif), tidak pernah overwrite |
| **b. Snapshot** | `orgContextSnapshot`/`policySnapshot` pada DailyAccountabilityRecord, CorrectionRequest, ComplianceEvent | Menyalin nilai aktual, bukan referensi ID hidup |
| **c. Transactional Audit-Linkage** | Semua write material | Wajib disertai satu row `AuditLog` dalam transaction database yang sama |
| **d. Append-Only** | AuditLog | Tidak ada mekanisme update di level skema |
| **e. Polymorphic Reference** | AuditLog, ManagerNote (evidence), Notification | Pasangan `relatedEntityType` + `relatedEntityId`, bukan JSONB bebas |

`Weekly Accountability Summary` dan `Monthly Management Trend` (FR-41) tidak memiliki tabel tersendiri — keduanya hasil agregasi terhitung dari entity yang sudah ada (dibaca `ReportingModule`, read-only), bukan record independen. Keputusan materialized vs on-demand dibahas di Section 13.

---

## 6. Application Architecture (Modular Monolith)

### 6.1 Prinsip Pemecahan Module

Batas module diturunkan langsung dari batas domain data (Section 5.1) — satu entity hanya "dimiliki" oleh satu module, module lain berinteraksi lewat service/interface yang diekspos, tidak pernah mengakses model Prisma-nya secara langsung. Ini menjaga logic effective-dating hanya hidup satu tempat (`IdentityModule`, `PolicyModule`), dan mendukung AI-assisted development dengan batas module yang jelas dan konsisten.

### 6.2 Module Inventory

| # | Module | Tanggung Jawab | Entity yang Dimiliki | Sifat |
|---|---|---|---|---|
| 1 | `AuthModule` | Login, JWT issuance, session/cookie handling, guard RBAC+Scope+Effective Date | Session | Cross-cutting infra |
| 2 | `IdentityModule` | Master data organisasi, resolusi role/scope aktif per tanggal | User, OrganizationalAssignment, ProjectAuthorityMapping, TemporaryReviewerAssignment | Domain (5.3) |
| 3 | `DailyAccountabilityModule` | Morning Check-in, EOD Check-in, cutoff-lock, status suggestion | DailyAccountabilityRecord, Commitment, AdditionalWork | Domain (5.4) |
| 4 | `BlockerModule` | Lifecycle blocker, resolusi owner needed, eskalasi | Blocker, SupportContribution | Domain (5.5) |
| 5 | `CorrectionRequestModule` | Pengajuan koreksi, klasifikasi Minor/Material, objection window | CorrectionRequest | Domain (5.6) |
| 6 | `ExceptionModule` | Leave/Holiday/Exemption, approval Leave | Exception | Domain (5.7) |
| 7 | `ManagerNoteModule` | Coaching/Recognition/Corrective note dengan visibility ketat | ManagerNote | Domain (5.8a) |
| 8 | `ComplianceModule` | Deteksi No Submission, pattern flag, progression compliance event | ComplianceEvent | Domain (5.8b) |
| 9 | `PolicyModule` | Konfigurasi & versioning nilai kebijakan; `getActivePolicySnapshot(category[], date)` | Policy, PolicyOwnerAssignment | Domain (5.9) |
| 10 | `NotificationModule` | Dispatch notifikasi lintas channel | Notification | Domain (5.10a) |
| 11 | `AuditModule` | Service penulisan AuditLog | AuditLog | Domain (5.10b), shared service |
| 12 | `SchedulerModule` | Orkestrasi seluruh scheduled job | — | Cross-cutting infra |
| 13 | `ReportingModule` | Agregasi & export | — | Cross-cutting infra |
| 14 | `FileStorageModule` | Signed URL evidence file + backup dump | — | Cross-cutting infra |
| 15 | `SharedModule` | Decorator, guard, pipe, filter, DTO base, util umum | — | Cross-cutting utility |

`ManagerNote` dan `ComplianceEvent` dipisah jadi dua module karena profil permission berbeda (BR-14) dan pemicu berbeda (Manager Note manual, Compliance Event sebagian besar otomatis).

### 6.3 Module Dependency Diagram

```
                         ┌───────────────┐
                         │  SharedModule  │ ← dipakai semua module
                         └───────┬───────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
     │ AuthModule   │────▶│ IdentityModule│     │  PolicyModule  │
     └─────────────┘     └───────┬───────┘     └───────┬────────┘
                                 │                      │ getActivePolicySnapshot()
                                 │            ┌──────────┼──────────┬───────────┬────────────┐
                                 ▼            ▼          ▼          ▼           ▼            ▼
                        ┌─────────────────┐ ┌──────────┐ ┌────────────────┐ ┌───────────┐ ┌────────────┐
                        │ DailyAccountab. │ │ Blocker  │ │ CorrectionReq. │ │ Exception │ │ Compliance │
                        │     Module       │ │  Module  │ │     Module     │ │  Module   │ │   Module   │
                        └────────┬─────────┘ └──────────┘ └────────┬───────┘ └───────────┘ └────────────┘
                                 │                                 │
                                 └──────────────┬──────────────────┘
                                                ▼
                                      (CorrectionRequestModule memanggil
                                       DailyAccountabilityModule untuk
                                       baca/update Commitment terkait)

  Dipanggil lintas-module:
  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │ AuditModule     │  │ NotificationModule│ │ FileStorageModule │  │ SchedulerModule  │
  │ (dipanggil semua│  │ (dipanggil semua │  │ (dipanggil       │  │ (memanggil       │
  │  module domain) │  │  module domain)  │  │  Blocker/        │  │  service domain, │
  │                  │  │                  │  │  ManagerNote/    │  │  termasuk        │
  │                  │  │                  │  │  Scheduler)      │  │  PolicyModule)   │
  └────────────────┘  └────────────────┘  └──────────────────┘  └──────────────────┘

  ReportingModule → membaca (read-only) dari seluruh module domain,
                     tidak pernah menulis, tidak pernah didependensi balik.

  ManagerNoteModule → dipanggil manual, membaca relatedEntityType/Id dari
                       DailyAccountabilityModule/BlockerModule/ComplianceModule secara read-only.
```

### 6.4 Aturan Ketergantungan Antar-Module

| Aturan | Alasan |
|---|---|
| `PolicyModule` didependensi lima module domain lewat `getActivePolicySnapshot(category[], date)` | Logic effective-dating Policy hanya hidup satu tempat |
| Arah dependency domain module satu arah, mengikuti diagram 6.3 | Mencegah circular dependency |
| `AuditModule` dan `NotificationModule` bersifat *sink*, tidak pernah balik memanggil module domain | Mencegah dependency berputar |
| `ReportingModule` hanya membaca, tidak pernah menulis atau didependensi balik | Mencegah agregasi bercampur dengan business logic transaksional |
| `SchedulerModule` memanggil service module domain yang sudah ada, tidak reimplementasi logic | Mencegah duplikasi business rule antara jalur manual dan otomatis |
| Module domain tidak mengakses model Prisma module lain secara langsung | Menjaga enkapsulasi |

### 6.5 Struktur Internal per Module

```
[module-name]/
├── [module-name].module.ts
├── [module-name].controller.ts   — REST endpoint (Section 7 & 10)
├── [module-name].service.ts      — business logic
├── dto/
│   ├── create-[entity].dto.ts
│   ├── update-[entity].dto.ts
│   └── [entity]-response.dto.ts
├── guards/
└── [module-name].repository.ts   — akses Prisma, dipisah dari service (Section 19)
```

---

## 7. API Design — Convention & Standards

### 7.1 Base URL & Versioning

| Aspek | Ketentuan |
|---|---|
| Base path | `/api/v1` |
| Strategi versioning | URI versioning — eksplisit, mudah dipahami AI-assisted development |
| Kapan naik versi | Hanya breaking change pada kontrak |

### 7.2 Resource Naming Convention

| Aturan | Contoh |
|---|---|
| Resource plural, kebab-case | `/daily-accountability-records`, `/correction-requests`, `/blockers` |
| Nested resource untuk relasi kepemilikan kuat | `/daily-accountability-records/{id}/commitments` |
| Resource independen tetap flat meski berelasi | `/correction-requests` |
| Action non-CRUD memakai sub-path kata kerja | `/blockers/{id}/acknowledge`, `/correction-requests/{id}/object` |

### 7.3 HTTP Method Convention

| Method | Penggunaan | Catatan |
|---|---|---|
| `GET` | Baca resource | Tidak mengubah state |
| `POST` | Membuat resource, atau aksi non-CRUD | |
| `PATCH` | Update sebagian field pada resource yang masih boleh diedit langsung | Bukan `PUT` |
| `DELETE` | Sangat dibatasi | Tidak pernah untuk entity audit trail atau locked |

Begitu resource berstatus locked (`Commitment.isMorningLocked`/`isEodLocked = true`, `AdditionalWork.isLocked = true`) atau merupakan entity historis, tidak ada endpoint `PATCH`/`DELETE` langsung untuk kelompok field yang terkunci — perubahan hanya lewat endpoint aksi eksplisit. Karena `Commitment` memiliki dua kelompok lock independen, endpoint `PATCH /commitments/{id}` memvalidasi lock sesuai kelompok field yang diminta diubah pada body request; field yang locked ditolak dengan `422 BUSINESS_RULE_VIOLATION`, field yang masih terbuka tetap diproses.

### 7.4 Format Request

- Content-Type `application/json`, kecuali upload file (`multipart/form-data`, Section 14).
- Validasi request body memakai `class-validator` + DTO, di boundary controller.
- Field wajib-kondisional divalidasi custom validator di DTO, bukan manual di service.

### 7.5 Format Response — Standard Envelope

```json
// Single resource
{ "data": { ... }, "meta": { "timestamp": "2026-09-13T08:00:00Z" } }

// List resource
{
  "data": [ { ... }, { ... } ],
  "meta": {
    "timestamp": "2026-09-13T08:00:00Z",
    "pagination": { "page": 1, "pageSize": 20, "totalItems": 143, "totalPages": 8 }
  }
}
```

### 7.6 Pagination & Filtering Convention

| Query Parameter | Contoh | Keterangan |
|---|---|---|
| `page`, `pageSize` | `?page=1&pageSize=20` | Default 20, maksimum 100 |
| `sortBy`, `sortOrder` | `?sortBy=raisedAt&sortOrder=desc` | Whitelist kolom per endpoint |
| `filter[field]` | `?filter[status]=RED` | Diterapkan di level query database |
| `search` | `?search=deployment` | Hanya endpoint yang mendukung |

Filter/pagination tidak pernah menjadi jalur melihat data di luar scope visibility user — scope-filtering diterapkan di level query sebelum filter user diterapkan (Section 8.11, 13.3).

### 7.7 Error Handling Convention

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "knownBlockerNote wajib diisi jika initialRisk adalah AMBER atau RED",
    "details": [{ "field": "knownBlockerNote", "reason": "REQUIRED_WHEN_CONDITIONAL" }]
  },
  "meta": { "timestamp": "2026-09-13T08:00:00Z" }
}
```

| HTTP Status | `error.code` | Skenario |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body tidak valid |
| 401 | `UNAUTHENTICATED` | Token tidak ada/invalid/expired |
| 403 | `FORBIDDEN` | Role/scope/effective-date tidak berwenang |
| 404 | `NOT_FOUND` | Tidak ditemukan, atau di luar scope visibility |
| 409 | `CONFLICT` | State saat ini tidak valid untuk aksi |
| 422 | `BUSINESS_RULE_VIOLATION` | Melanggar business rule |
| 429 | `RATE_LIMITED` | Melebihi rate limit |
| 500 | `INTERNAL_ERROR` | Kesalahan tak terduga |

Resource yang ada tapi di luar scope visibility user direspons `404`, bukan `403`, untuk mencegah information leakage — kecuali aksi terhadap resource yang keberadaannya sudah diketahui user.

### 7.8 Rate Limiting

| Kategori | Batas |
|---|---|
| Endpoint umum | 100 request/menit per user |
| Endpoint auth | 5 percobaan/menit per IP |
| Endpoint upload file | 10 request/menit per user |

Diimplementasikan sebagai guard/interceptor NestJS in-process (`@nestjs/throttler`), konsisten prinsip portabilitas.

### 7.9 CORS Configuration

`Access-Control-Allow-Origin` domain frontend eksplisit (bukan wildcard), `Access-Control-Allow-Credentials: true`, domain dikonfigurasi lewat environment variable `ALLOWED_ORIGIN`.

### 7.10 Request Size Limit

| Jenis | Batas |
|---|---|
| JSON body | 1 MB |
| Upload file | Section 14 |

### 7.11 Idempotency untuk Endpoint Otomatis vs Manual

Endpoint yang aksinya juga bisa dipicu scheduled job (Section 11) dirancang agar service layer yang dipanggil endpoint dan job benar-benar service yang sama, sehingga idempotency check berlaku konsisten di kedua jalur (detail penuh Section 9.9).

### 7.12 Representasi "Hide, Bukan Disable" di Level API

Response detail resource menyertakan field `availableActions` — daftar aksi valid untuk state saat ini. Frontend memakai daftar ini untuk render tombol (`ActionPanel`), tidak menghitung ulang aturan validitas secara independen.

---

## 8. Authentication & Authorization Architecture

### 8.1 Ringkasan Model

| Aspek | Keputusan |
|---|---|
| Skema kredensial | Email + password, `IdentityModule` — tidak ada self-registration (FR-50) |
| Hashing password | Argon2id |
| Transport token | JWT di HttpOnly Secure Cookie |
| Model otorisasi | RBAC + Contextual Scope + Effective Date — dievaluasi ulang tiap request |
| CSRF Protection | Double Submit Cookie Pattern (8.5) |
| Revocation | Entity `Session` (5.3) |

### 8.2 Password & Credential Security

Password di-hash Argon2id sebelum disimpan, tidak pernah plaintext di titik manapun. Kredensial awal dibuat Admin (FR-50) — `mustResetPassword = true` di-set saat akun dibuat, endpoint lain terkunci sampai direset. Tidak ada "lupa password" self-service — reset mengikuti alur sama seperti kredensial awal.

### 8.3 Session Architecture

Setiap JWT terhubung ke satu row `Session` (Section 5.3). Claim JWT diminimalkan — hanya `{ sub: userId, jti: sessionId, iat, exp }`; role/function/scope tidak disimpan di token, selalu dievaluasi ulang dari `OrganizationalAssignment` aktif per-request.

### 8.4 Login, Logout, dan Token Expiry Flow

```
LOGIN
  Client → POST /api/v1/auth/login { email, password }
  Backend:
    1. Cari User by email, verifikasi password (Argon2id)
    2. Cek User.status == Active → jika tidak, 403 FORBIDDEN
    3. Buat row Session baru (expiresAt = now + 12 jam)
    4. Generate JWT { sub, jti: session.id, iat, exp }
    5. Set cookie access_token (HttpOnly, Secure, SameSite=None, maxAge=12h)
    6. Set cookie csrf_token (Secure, SameSite=None, TIDAK HttpOnly, maxAge=12h)
    7. Jika mustResetPassword == true → FE redirect paksa ke reset password

REQUEST TERAUTENTIKASI
  AuthGuard:
    1. Verifikasi signature & expiry JWT
    2. Query Session by jti → cek revokedAt IS NULL DAN expiresAt > now()
    3. Query User by sub → cek status == Active
    4. Resolve OrganizationalAssignment aktif (AS OF hari ini)
    5. Attach ke request context: { userId, role, function, sessionId }
    → Gagal di langkah manapun = 401 UNAUTHENTICATED

LOGOUT
  Session.revokedAt = now(), hapus kedua cookie

ADMIN MEN-DEACTIVATE USER
  Seluruh Session aktif milik user di-set revokedAt = now() dalam transaction sama
```

Expiry 12 jam tanpa sliding refresh — pola pemakaian WorkPulse login sekali per hari kerja (PDD §5), cukup menutupi satu hari kerja penuh tanpa endpoint refresh token terpisah.

### 8.5 CSRF Protection

Karena FE (Vercel) dan BE (Railway) berada di domain berbeda, cookie autentikasi memakai `SameSite=None`, menghilangkan proteksi CSRF bawaan browser — sehingga diterapkan **Double Submit Cookie Pattern**:

| Langkah | Detail |
|---|---|
| Saat login | Set `access_token` (HttpOnly) dan `csrf_token` (tidak HttpOnly, bisa dibaca JS) |
| Request state-changing | FE membaca `csrf_token` dari cookie, kirim sebagai header `X-CSRF-Token` |
| Backend | Bandingkan header dengan cookie — cocok lanjut, tidak cocok `403 FORBIDDEN` |
| `GET` request | Dikecualikan |

Situs jahat bisa memicu browser korban mengirim `access_token`, tapi tidak bisa membaca `csrf_token` (Same-Origin Policy), sehingga tidak bisa menyertakan header yang cocok.

### 8.6 Ringkasan Konfigurasi Cookie

| Cookie | HttpOnly | Secure | SameSite | Isi |
|---|---|---|---|---|
| `access_token` | Ya | Ya | `None` | JWT |
| `csrf_token` | Tidak | Ya | `None` | Random string |

### 8.7 Otorisasi — RBAC + Contextual Scope + Effective Date

```
Authorization Decision = f(Role, Scope, Effective Date pada saat request)

Role         → OrganizationalAssignment aktif (8.4 langkah 4)
Scope        → OrganizationalAssignment (baseline) ATAU ProjectAuthorityMapping (8.9)
              ATAU TemporaryReviewerAssignment
Effective Date → implisit tercakup, resolusi selalu "AS OF hari ini"
```

Tidak pernah ada permission yang di-hardcode berdasarkan role semata — setiap guard wajib memverifikasi resource berada dalam scope aktif user.

### 8.8 Guard Architecture (NestJS)

| Guard | Tingkat | Fungsi |
|---|---|---|
| `AuthGuard` | Global | Verifikasi JWT + Session + User.status |
| `CsrfGuard` | Global, method state-changing | Verifikasi Double Submit Cookie |
| `RoleGuard` | Per-route | Cek role dalam daftar yang diizinkan |
| `ScopeGuard` | Per-route | Cek resource dalam scope aktif user, delegasi ke service module pemilik entity |
| `PolicyOwnerGuard` | Per-route, khusus PolicyModule | Cek PolicyOwnerAssignment |

Urutan eksekusi: `AuthGuard` → `CsrfGuard` → `RoleGuard` → `ScopeGuard`/`PolicyOwnerGuard`.

### 8.9 Resolusi Project Authority secara Kontekstual

```
1. Ambil Blocker.relatedScopeReference
2. Query ProjectAuthorityMapping WHERE userId = request.user.id
                                   AND scopeReference = blocker.relatedScopeReference
                                   AND effectiveDate <= today
                                   AND (endDate IS NULL OR endDate >= today)
3. Ditemukan → berwenang sebagai Project Authority
   Tidak ditemukan → fallback cek Organizational Authority (directManagerId)
   Keduanya gagal → 403 FORBIDDEN
```

### 8.10 Policy-Category-Scoped Authorization

```
Query PolicyOwnerAssignment WHERE userId = request.user.id
                              AND policyCategory = target category
                              AND effectiveDate <= today
                              AND (endDate IS NULL OR endDate >= today)
```

Tidak ditemukan → `403 FORBIDDEN`, terlepas dari role umum user, sesuai BR-15.

### 8.11 Scope-Filtering di Level Query (List Endpoint)

```
Employee     → WHERE employeeUserId = request.user.id
Supervisor   → WHERE employeeUserId IN (SELECT userId FROM OrganizationalAssignment
                                          WHERE directManagerId = request.user.id AND ...effective-dated)
Head         → WHERE function = request.user.function
HRGA/CEO     → Sesuai Permission & Visibility Requirements, PRD §7
SystemAdmin  → Tidak berlaku untuk data operasional
```

---

## 9. Business Rule & State Machine Architecture

### 9.1 Pendekatan Formalisasi

Section ini menerjemahkan lifecycle PDD §7 menjadi state-transition table yang tidak ambigu. Setiap endpoint Section 10 mengikuti tabel transisi ini persis.

### 9.2 State Machine: Submission Status

| Kondisi | Klasifikasi | Dievaluasi Oleh |
|---|---|---|
| `submittedAt ≤ onTimeDeadline` | `OnTime` | Real-time |
| `onTimeDeadline < submittedAt ≤ cutOff` | `Late` | Real-time |
| Belum submit sampai `cutOff` | `NoSubmission` | Scheduled job |

Policy kategori `Cutoff` dan `GracePeriod` menyimpan dua pasang nilai terpisah — Morning dan EOD dievaluasi independen.

### 9.3 State Machine: Daily Status (Initial & Final)

| Field | Mekanisme | Sumber |
|---|---|---|
| `initialStatus` | System-derived, worst-of ketiga `Commitment.initialRisk` saat Morning Check-in disubmit | UI/UX Spec §4.2 tidak menyediakan kontrol pemilihan status level-hari |
| `finalStatus` | User-selected oleh Employee di EOD Check-in | FR-10, UI/UX Spec §4.4 |

```
User pilih finalStatus di EOD Check-in
   → Sistem hitung status disarankan
   → finalStatus user == disarankan?
        Ya  → submit langsung
        Tidak → ValidationPromptModal (dua tombol setara bobot):
                 "Tetap dengan status saya (+ reason wajib)" → reason disimpan di
                    AuditLog.valueAfter (mis. {finalStatus: "GREEN", overrideReason: "..."})
                 "Gunakan status yang disarankan" → finalStatus = status disarankan
        → Kedua jalur tercatat AuditLog
```

### 9.4 State Machine: Blocker Lifecycle

| State Awal | Event | Aktor Berwenang | Validasi | State Akhir | Audit |
|---|---|---|---|---|---|
| *(baru)* | Raise Blocker | `raisedByUserId` | Type/Severity/Impact wajib; owner diresolusi via 8.9 | `Open` | ✅ |
| `Open` | Acknowledge | `ownerNeededUserId` | — | `Acknowledged` | ✅ |
| `Acknowledged`/`InProgress` | Update | `ownerNeededUserId` | — | `InProgress` | ✅ |
| `Acknowledged`/`InProgress` | Resolve | `ownerNeededUserId` | `resolutionNote` wajib | `Resolved` | ✅ |
| `Acknowledged`/`InProgress` | Accept Risk | `ownerNeededUserId` | `resolutionNote` wajib | `AcceptedRisk` | ✅ |
| `Resolved`/`AcceptedRisk` | Close | `raisedByUserId` | — | `Closed` | ✅ |
| `Open`, RED/Critical | Auto-escalate | Sistem (scheduled job) | `acknowledgedAt IS NULL` DAN belum ada `AuditLog(action=BLOCKER_AUTO_ESCALATED)` untuk level saat ini DAN waktu sejak eskalasi sebelumnya melewati `EscalationThreshold` | *(tetap `Open`)* | ✅ |

Indikator "Auto-escalated" di `BlockerCard` diturunkan dari keberadaan `AuditLog(action=BLOCKER_AUTO_ESCALATED)`, tidak memerlukan kolom boolean baru.

Aktor "Close" ditetapkan sebagai `raisedByUserId` (pihak yang mengalami blocker mengonfirmasi resolusi memadai) — asumsi desain eksplisit karena PDD/UI-UX Spec tidak menyatakan ini secara literal; dicatat sebagai open item di Section 23 jika perlu direvisi.

### 9.5 State Machine: Outcome & Continuation

> Berlaku sama untuk `Commitment` dan `AdditionalWork`, diisi bersamaan saat EOD Check-in.

| Outcome | Continuation | `continuationReason` | Valid? |
|---|---|---|---|
| `Completed` | `Continue` | Tidak wajib | ✅ |
| `Completed` | `DoNotContinue` | Tidak wajib | ✅ |
| `PartiallyCompleted`/`NotCompleted` | `Continue` | Wajib — FR-09 | ✅ |
| `PartiallyCompleted`/`NotCompleted` | `DoNotContinue` | Tidak wajib | ✅ |
| `Cancelled` | — | `outcomeReason` wajib | ✅ |

Carry-over adalah kondisi turunan: item dengan `continuation = Continue` menjadi draft copy-forward esok hari (DraftBanner, wajib Confirm/Edit).

### 9.6 State Machine: Correction Request Lifecycle

```
Employee ajukan CorrectionRequest (Commitment.isMorningLocked = true DAN/ATAU
                                    isEodLocked = true, tergantung kelompok
                                    field yang ingin dikoreksi)
   → policySnapshot diisi dari PolicyModule.getActivePolicySnapshot(
       [MinorMaterialThreshold, ObjectionWindowDuration], now())
   → classification dihitung dari requestedChange vs policySnapshot.minorMaterialThreshold

   classification = Minor
      → status = Applied (LANGSUNG, satu transaction):
          1. Update field target pada Commitment
          2. INSERT AuditLog (valueBefore/valueAfter)
          3. appliedAt = now()

   classification = Material
      → status = Pending
      → objectionWindowStart = now()
      → objectionWindowEnd = now() + policySnapshot.objectionWindowDuration
      → Notification ke Authorized Reviewer

         [selama window berjalan]
         Reviewer ajukan objection (objectionReason wajib)
            → status = Rejected, Commitment tidak berubah
            → INSERT AuditLog (action=CORRECTION_REJECTED)

         [window habis tanpa objection]
         Scheduled job evaluasi objectionWindowEnd ≤ now()
            → status = Applied (via service method yang sama dengan jalur Minor)
            → INSERT AuditLog (action=CORRECTION_AUTO_APPLIED)
```

Jika `requestedChange` mengubah `initialRisk`, service `applyCorrection()` wajib menghitung ulang `DailyAccountabilityRecord.initialStatus` (worst-of, 9.3) dalam transaction yang sama. Validasi kondisional FR-04/FR-09 tetap berlaku saat koreksi, dievaluasi terhadap hasil gabungan field lama + `requestedChange` — bukan hanya field yang diubah secara terisolasi; gagal validasi → `422 BUSINESS_RULE_VIOLATION`.

`CorrectionRequest` mencakup seluruh field pada `Commitment` yang berstatus locked — baik kelompok Morning maupun EOD — mengikuti pemisahan dua lock di 9.8. Tidak ada mekanisme "EOD Correction Request" terpisah.

### 9.7 State Machine: Compliance Event Progression

| Tahap | Trigger | Dibuat Oleh | Entity | Tindakan Lanjut |
|---|---|---|---|---|
| Reminder | Mendekati deadline/cutoff | Scheduled job | *(hanya Notification)* | — |
| No Submission | `cutOff` terlewati, tidak ada submission valid, bukan tanggal Exception | Scheduled job | `ComplianceEvent(NoSubmission)` | — |
| Pattern Flag | Jumlah NoSubmission dalam periode threshold terlampaui | Scheduled job | `ComplianceEvent(PatternFlag)` | Notifikasi ke Supervisor/Head (+HRGA jika threshold) |
| Coaching | Manual — tinjau Pattern Flag | Supervisor/Head | `ManagerNote(Coaching)` + `ComplianceEvent(Coaching)` | — |
| Recorded Warning | Manual — berulang setelah Coaching | HRGA | `ComplianceEvent(RecordedWarning)` | — |
| Escalated Formal Process | Manual — berulang setelah Recorded Warning | HRGA | `ComplianceEvent(EscalatedFormalProcess)` | Proses lanjut di luar sistem |

Sebelum membuat `ComplianceEvent(PatternFlag)` baru, job memeriksa apakah user sudah memiliki `PatternFlag` aktif tanpa Coaching follow-up — row baru hanya dibuat untuk episode pola baru. Tiga tahap terakhir sengaja tidak pernah dipicu otomatis — menegakkan BR-05/BR-06/FR-30 secara struktural.

### 9.8 Lock State Machine: Commitment & Additional Work

`Commitment` memiliki dua kolom lock independen karena dua kelompok field-nya dikunci pada dua momen berbeda: field Morning terkunci di Morning cutoff, sementara field EOD pada row yang sama baru terisi setelah itu, di EOD Check-in.

| Kolom | Trigger | Field yang Dikunci |
|---|---|---|
| `Commitment.isMorningLocked` | Scheduled job, instant Morning cutoff | `text`, `referenceLink`, `initialRisk`, `knownBlockerNote`, `supportNeeded` |
| `Commitment.isEodLocked` | Scheduled job, instant EOD cutoff | `outcome`, `outcomeReason`, `continuation`, `continuationReason` |
| `AdditionalWork.isLocked` | Scheduled job, instant EOD cutoff (sinkron `isEodLocked`) | Seluruh field `AdditionalWork` |

Ketiganya di-set oleh scheduled job yang sama yang mengevaluasi `morningTiming`/`eodTiming` (9.2) — bukan oleh aksi submit user, konsisten BR-02. `AdditionalWork` tidak memiliki lock Morning karena tidak punya konsep baseline Morning.

FR-43 secara literal membatasi `CorrectionRequest` pada "Morning Commitment yang sudah locked" — tidak menyebut mekanisme koreksi untuk `AdditionalWork` yang sudah terkunci. Berdasarkan skema saat ini, `AdditionalWork` yang sudah terkunci tidak memiliki jalur koreksi apapun. Dicatat sebagai open item untuk Section 23, perlu dikonfirmasi apakah ini keterbatasan yang disengaja atau gap yang perlu diteruskan ke PRD.

### 9.9 Concurrency & Data Integrity

| # | Skenario | Risiko | Mitigasi |
|---|---|---|---|
| 1 | Scheduled job evaluasi `objectionWindowEnd` bersamaan Reviewer klik "Object" | `CorrectionRequest` ter-apply dan ter-reject sekaligus | `SELECT FOR UPDATE` pada row `CorrectionRequest`, re-check `status == Pending` setelah lock; yang kedua dapat 409 CONFLICT |
| 2 | Scheduled job auto-escalate bersamaan "Acknowledge" manual | Eskalasi terkirim padahal baru di-acknowledge | `SELECT FOR UPDATE` pada row `Blocker`, re-check `acknowledgedAt IS NULL` setelah lock |
| 3 | Edit Commitment terkirim sebelum cutoff, diproses setelah cutoff (network delay) | Perubahan pasca-cutoff lolos tanpa Correction Request | Validasi lock dievaluasi ulang di dalam transaction yang sama dengan write |
| 4 | Dua scheduled job berbeda berjalan pada record yang sama berdekatan waktu | Kondisi antara (No Submission dievaluasi sebelum cutoff-lock final) | Job dijadwalkan berurutan dalam satu siklus scheduler, cutoff-lock selalu sebelum No Submission |

Setiap state transition yang bisa dipicu lebih dari satu jalur (user manual vs scheduled job) memakai `SELECT ... FOR UPDATE` (pessimistic locking) di dalam transaction — dipilih dibanding optimistic locking karena skala WorkPulse (30–60 user) membuat lock contention sangat rendah.

---

## 10. API Specification — Full Endpoint Catalog

> Kontrak resmi implementasi — hasil gabungan Section 5–9. Kolom **Role** dievaluasi bersama Scope sesuai Section 8.7–8.11.

### 10.1 AuthModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/auth/login` | Publik | `{ email, password }` | `{ mustResetPassword, user }` + cookie | Section 8.4. Rate limit 5/menit/IP |
| `POST /api/v1/auth/logout` | Terautentikasi | — | `204` + hapus cookie | `Session.revokedAt = now()` |
| `POST /api/v1/auth/reset-password` | Terautentikasi (saat `mustResetPassword = true`) | `{ newPassword }` | `{ success: true }` | Endpoint lain terkunci sampai ini dipanggil |
| `POST /api/v1/auth/admin-reset-password/{userId}` | `SystemAdmin` | — | `{ temporaryPassword }` | FR-50, disertai `AuditLog(ADMIN_PASSWORD_RESET)` dalam transaction sama |
| `GET /api/v1/auth/me` | Terautentikasi | — | `{ userId, role, function, permissions summary }` | Dipakai FE saat inisialisasi (Section 17) |

### 10.2 IdentityModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `GET /api/v1/users` | `SystemAdmin`, `HRGA` | Filter, pagination | List User + assignment aktif | FR-22 |
| `POST /api/v1/users` | `SystemAdmin` | `{ fullName, email, initialRole, function, directManagerId, effectiveDate }` | User + Assignment + `temporaryPassword` | FR-22, FR-50, satu transaction |
| `PATCH /api/v1/users/{id}` | `SystemAdmin` | `{ status }` | User terbarui | Deactivate memicu revocation seluruh Session aktif |
| `GET /api/v1/users/{id}/organizational-assignments` | `SystemAdmin`, `HRGA`, pemilik | — | Riwayat assignment | 5.11.a |
| `POST /api/v1/organizational-assignments` | `SystemAdmin` | `{ userId, role, function, directManagerId, effectiveDate }` | Assignment baru | BR-10 — menutup endDate lama + insert baru |
| `POST /api/v1/project-authority-mappings` | `SystemAdmin`, `Head` | `{ userId, scopeReference, effectiveDate, endDate? }` | Mapping baru | Multi-concurrent diizinkan |
| `PATCH /api/v1/project-authority-mappings/{id}` | `SystemAdmin`, `Head` | `{ endDate }` | Mapping terbarui | Mengakhiri, bukan delete |
| `POST /api/v1/temporary-reviewer-assignments` | `SystemAdmin`, `Head` | `{ reviewerUserId, scope, reason, effectiveDate, expiryDate }` | Assignment baru | BR-11 — expiryDate wajib |

### 10.3 DailyAccountabilityModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/daily-accountability-records/morning-checkin` | `Employee` | `{ commitments: [...] }` (maks 3) | Record + Commitment[] | BR-01, FR-04, initialStatus otomatis |
| `GET /api/v1/daily-accountability-records/today` | `Employee` (pemilik) | — | Record + availableActions | 7.12 |
| `POST /api/v1/daily-accountability-records/{id}/eod-checkin` | `Employee` (pemilik) | `{ commitmentOutcomes, additionalWorkOutcomes, finalStatus }` | Record terbarui | FR-08–FR-10, 9.5, 9.3 |
| `POST /api/v1/daily-accountability-records/{id}/eod-checkin/confirm-override` | `Employee` (pemilik) | `{ finalStatus, overrideReason }` | Record final | 9.3 |
| `PATCH /api/v1/commitments/{id}` | `Employee` (pemilik) | Subset field Morning/EOD | Commitment terbarui | Ditolak untuk field yang sudah locked |
| `POST /api/v1/additional-work` | `Employee` (pemilik) | `{ dailyRecordId, text, reason, assignedByUserId? }` | AdditionalWork baru | FR-06 |
| `PATCH /api/v1/additional-work/{id}` | `Employee` (pemilik) | Field EOD | AdditionalWork terbarui | Ditolak jika isLocked |
| `GET /api/v1/daily-accountability-records` | Sesuai scope | Filter, pagination | List (scope-filtered) | My History, Team/Function/Management Pulse |
| `GET /api/v1/daily-accountability-records/{id}` | Sesuai scope | — | Detail + Commitment[] + AdditionalWork[] | 404 jika di luar scope |

### 10.4 BlockerModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/blockers` | Semua role | `{ linkedCommitmentId?, type, severity, impact, ownerNeededType, expectedResolution? }` | Blocker baru (`Open`) | FR-15–FR-19, owner diresolusi backend |
| `GET /api/v1/blockers` | Sesuai scope | Filter, pagination | List + availableActions | 8.11 |
| `GET /api/v1/blockers/{id}` | Sesuai scope | — | Detail + SupportContribution[] + availableActions | 7.12 |
| `POST /api/v1/blockers/{id}/acknowledge` | `ownerNeededUserId` | — | `Acknowledged` | 9.4 |
| `POST /api/v1/blockers/{id}/update` | `ownerNeededUserId` | `{ progressNote }` | `InProgress` | 9.4 |
| `POST /api/v1/blockers/{id}/resolve` | `ownerNeededUserId` | `{ resolutionNote }` | `Resolved` | 9.4 |
| `POST /api/v1/blockers/{id}/accept-risk` | `ownerNeededUserId` | `{ resolutionNote }` | `AcceptedRisk` | 9.4 |
| `POST /api/v1/blockers/{id}/close` | `raisedByUserId` | — | `Closed` | 9.4 |
| `POST /api/v1/blockers/{id}/support` | Semua role | `{ action, resultNote }` | SupportContribution baru | Tidak mengubah status |

### 10.5 CorrectionRequestModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/correction-requests` | `Employee` (pemilik) | `{ targetCommitmentId, requestedChange, reason }` | Applied/Pending | 9.6 penuh |
| `GET /api/v1/correction-requests` | Sesuai scope | Filter, pagination | List | — |
| `GET /api/v1/correction-requests/{id}` | Sesuai scope | — | Detail + availableActions | 7.12 |
| `POST /api/v1/correction-requests/{id}/object` | Authorized Reviewer | `{ objectionReason }` | `Rejected` | 9.6, 9.9 #1 |

### 10.6 ExceptionModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/exceptions/leave` | `Employee` | `{ dateStart, dateEnd, reason? }` | `Leave`/`Pending` | FR-47 |
| `POST /api/v1/exceptions/holiday` | `SystemAdmin`, `HRGA` | `{ dateStart, dateEnd, reason }` | `Holiday`, valid langsung | BR-18 |
| `POST /api/v1/exceptions/exemption` | `SystemAdmin`, `HRGA` | `{ employeeUserId, dateStart, dateEnd, reason }` | `Exemption`, valid langsung | BR-18 |
| `GET /api/v1/exceptions` | Sesuai scope | Filter, pagination | List | 8.11 |
| `POST /api/v1/exceptions/{id}/approve` | Authorized Reviewer | — | `Approved` | FR-47 |
| `POST /api/v1/exceptions/{id}/reject` | Authorized Reviewer | `{ rejectionReason }` | `Rejected` | FR-47 |

### 10.7 ManagerNoteModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/manager-notes` | `Supervisor`, `Head`, `HRGA` | `{ aboutUserId, type, note, relatedEntityType?, relatedEntityId? }` | ManagerNote baru | BR-14 |
| `GET /api/v1/manager-notes` | Sesuai scope + visibility | Filter, pagination | List | BR-14 |
| `GET /api/v1/manager-notes/{id}` | Sesuai scope + visibility | — | Detail | 404 jika di luar visibility |

`POST /manager-notes` dipakai untuk catatan umum (`Recognition`, `Corrective`, atau `Coaching` berdiri sendiri). Untuk tahap Coaching dalam konteks Compliance Event Progression, gunakan `POST /compliance-events/{id}/coach` (10.8). `ManagerNote` tidak memiliki endpoint edit/hapus setelah dibuat — bersifat permanen.

### 10.8 ComplianceModule

> Penciptaan `ComplianceEvent(NoSubmission/PatternFlag)` dilakukan scheduled job (Section 11). Tiga endpoint aksi manual merepresentasikan tahap progression yang hanya bisa dipicu manusia (BR-05/BR-06).

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `GET /api/v1/compliance-events` | `Supervisor`, `Head`, `HRGA`, `CEO/Management` (scope) | Filter, pagination | List | 8.11 |
| `GET /api/v1/compliance-events/{id}` | Sesuai scope | — | Detail + availableActions | `["coach"]`/`["record_warning"]`/`["escalate_formal"]`/`[]` sesuai posisi progression |
| `POST /api/v1/compliance-events/{id}/coach` | `Supervisor`, `Head` | `{ note }` | `ComplianceEvent(Coaching)` + `ManagerNote(Coaching)` | Satu transaction: insert keduanya + update `followUpStatus` PatternFlag asal |
| `POST /api/v1/compliance-events/{id}/record-warning` | `HRGA` | `{ note }` | `RecordedWarning` baru | BR-05/BR-06 |
| `POST /api/v1/compliance-events/{id}/escalate-formal` | `HRGA` | `{ note }` | `EscalatedFormalProcess` baru | Titik akhir sistem |

### 10.9 PolicyModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `GET /api/v1/policies` | Terautentikasi | Filter | List Policy aktif | Read terbuka semua role |
| `POST /api/v1/policies` | `PolicyOwnerGuard` (8.10) | `{ category, value, effectiveDate }` | Policy versi baru | BR-15, effective-dating |
| `GET /api/v1/policies/{category}/history` | Terautentikasi | — | Riwayat versi | `PolicyVersionHistory` (Design System) |
| `POST /api/v1/policy-owner-assignments` | `SystemAdmin` | `{ userId, policyCategory, effectiveDate, endDate? }` | Assignment baru | BR-15 |

### 10.10 NotificationModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `GET /api/v1/notifications` | Pemilik | `unreadOnly`, pagination | List | `NotificationBell` |
| `POST /api/v1/notifications/{id}/mark-read` | Pemilik | — | `Read` | — |
| `POST /api/v1/notifications/mark-all-read` | Pemilik | — | `{ updatedCount }` | — |

### 10.11 ReportingModule

> Seluruh endpoint read-only, scope-filtered (8.11, 13.3).

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `GET /api/v1/reports/daily-exception` | `Head`, `CEO/Management` | `date` | Snapshot exception hari itu | PRD §9 |
| `GET /api/v1/reports/weekly-team-summary` | `Supervisor`, `Head` | `weekStart` | Agregat mingguan | FR-41 |
| `GET /api/v1/reports/monthly-trend` | `CEO/Management` | `month` | Trend bulanan | FR-41 |
| `GET /api/v1/reports/individual-evidence/{userId}` | Sesuai scope | `dateRange` | Evidence individual | PRD §9 |
| `GET /api/v1/reports/blocker-root-cause` | `Head`, `CEO/Management` | `dateRange` | Root cause blocker | PRD §9 |
| `GET /api/v1/reports/{reportType}/export` | Sama seperti report terkait | `format=pdf\|xlsx` | Signed URL file | FR-42/AC-20 |

### 10.12 FileStorageModule

| Method & Path | Role | Request | Response | Business Rule |
|---|---|---|---|---|
| `POST /api/v1/files/upload-url` | Terautentikasi | `{ purpose, contentType, fileSize }` | `{ uploadUrl, fileId, expiresIn }` | Section 14 |
| `GET /api/v1/files/{fileId}/download-url` | Sesuai scope resource terkait | — | `{ downloadUrl, expiresIn }` | Signed URL sementara |

---

## 11. Scheduled Job / Timer Architecture

### 11.1 Prinsip & Mekanisme

In-process (`@nestjs/schedule`), tanpa Redis/queue terpisah. `SchedulerModule` memanggil service module domain yang sudah ada, tidak reimplementasi logic. Setiap job idempotent by design. Job yang bersinggungan dengan aksi manual memakai `SELECT FOR UPDATE` (Section 9.9).

### 11.2 Job Inventory

| # | Job | Frekuensi | Service | Kelompok |
|---|---|---|---|---|
| 1 | Reminder Mendekati Cutoff | Setiap 5 menit | `NotificationModule` | Frequent Cycle |
| 2 | Cutoff-Lock Evaluation | Setiap 5 menit | `DailyAccountabilityModule.evaluateCutoffLock()` | Frequent Cycle |
| 3 | No Submission Detection | Setiap 5 menit | `ComplianceModule.evaluateNoSubmission()` | Frequent Cycle |
| 4 | Objection Window Reminder | Setiap 5 menit | `NotificationModule` | Frequent Cycle |
| 5 | Correction Request Auto-Apply | Setiap 5 menit | `CorrectionRequestModule.evaluateExpiredObjectionWindows()` | Frequent Cycle |
| 6 | Blocker Auto-Escalate | Setiap 5 menit | `BlockerModule.evaluateAutoEscalation()` | Frequent Cycle |
| 7 | Leave Pending Reminder | Setiap 5 menit | `NotificationModule` | Frequent Cycle |
| 8 | Pattern Flag Detection | 1×/hari (dini hari) | `ComplianceModule.evaluatePatternFlag()` | Daily Aggregate |
| 9 | Database Backup | 1×/hari (luar jam kerja) | `FileStorageModule` | Daily Maintenance |
| 10 | Weekly Summary Notification | 1×/minggu (Senin) | `NotificationModule` | Weekly Aggregate |

Job 1–7 juga berfungsi sebagai keepalive Supabase (Section 4.5) — query rutin setiap 5 menit jauh di bawah threshold auto-pause 7 hari.

### 11.3 Sequencing dalam Frequent Cycle

Job 1–7 berjalan sebagai **satu method scheduler** yang memanggil ketujuh service secara berurutan:

```
@Cron('*/5 * * * *')
async runFrequentCycle() {
  await this.dailyAccountabilityService.evaluateCutoffLock();
  await this.notificationService.sendCutoffReminders();
  await this.complianceService.evaluateNoSubmission();
  await this.correctionRequestService.evaluateExpiredObjectionWindows();
  await this.notificationService.sendObjectionWindowReminders();
  await this.blockerService.evaluateAutoEscalation();
  await this.notificationService.sendLeavePendingReminders();
}
```

Evaluasi Cutoff-Lock wajib dijalankan pertama — No Submission secara logis bergantung pada hasil cutoff yang sudah final (Section 9.9 #4).

### 11.4 Job Harian

```
02:00 — Database Backup (pg_dump → Object Storage, retensi 7–14 hari)
03:00 — Pattern Flag Detection (agregat NoSubmission per user)
```

Dijadwalkan berurutan, di luar jam kerja, untuk meminimalkan dampak performa.

### 11.5 Failure Handling

| Aspek | Ketentuan |
|---|---|
| Isolasi kegagalan per-item | Try-catch per record, kegagalan satu record tidak menghentikan pemrosesan yang lain |
| Kegagalan job kritis (Backup) | Alert ke `SystemAdmin`, tidak diam-diam diabaikan |
| Retry | Tidak ada retry otomatis — siklus berikutnya (5 menit) mengevaluasi ulang state yang sama |
| Observability | Logging aplikasi standar (durasi, jumlah item, error) — bukan tabel database baru |

### 11.6 Weekly/Monthly Summary Bukan Precompute

Weekly Accountability Summary dan Monthly Management Trend dihitung on-demand oleh `ReportingModule` saat endpoint dipanggil (Section 10.11), bukan di-precompute. Detail keputusan di Section 13.

---

## 12. Notification Architecture

### 12.1 Trigger Inventory

| # | Trigger | Recipient | Channel | Dipicu Oleh |
|---|---|---|---|---|
| 1 | Morning/EOD mendekati cutoff | Employee | Email + Browser Push | Job #1 |
| 2 | AMBER + support needed | Support owner + employee | Email + Browser Push + Web Notification Center | Real-time |
| 3 | RED | Supervisor/Head + PM/owner terkait | Email + Browser Push | Real-time |
| 4 | Critical/instant blocker | Escalation chain | Email + Browser Push | Real-time |
| 5 | Blocker unacknowledged melebihi threshold | Level eskalasi berikutnya | Email + Browser Push | Job #6 |
| 6 | Repeated no-submission flag | Supervisor/Head; HRGA jika threshold | Email | Job #8 |
| 7 | Weekly summary tersedia | Employee + Manager | Email | Job #10 |
| 8 | Policy/organizational assignment berubah | User terdampak; Policy Owner terkait | Web Notification Center | Real-time |
| 9 | Correction Request Material diajukan | Authorized Reviewer | Web Notification Center + Email | Real-time |
| 10 | Correction Request menuju akhir Objection Window | Authorized Reviewer | Web Notification Center | Job #4 |
| 11 | Correction Request Applied/Rejected | Employee pengaju | Web Notification Center | Real-time/Job #5 |
| 12 | Leave Request diajukan | Authorized Approver | Email + Browser Push | Real-time |
| 13 | Leave Request disetujui/ditolak | Employee pengaju | Email + Web Notification Center | Real-time |

Seluruh trigger, terlepas channel utamanya, menghasilkan minimal satu row `Notification(channel=WebNotificationCenter)` — riwayat lengkap selalu tersedia in-system.

### 12.2 Dispatch Flow

```
Event terjadi (real-time trigger atau scheduled job)
   → NotificationModule.dispatch(triggerType, recipientUserId, relatedEntityType, relatedEntityId)
   → Idempotency check: (triggerType, relatedEntityId, channel) sudah ada?
        Sudah ada → skip channel tersebut
        Belum ada → lanjut
   → Untuk tiap channel:
        1. INSERT Notification (status=Sent, payload)
        2. Kirim aktual: WebNotificationCenter (langsung "terkirim"),
           BrowserPush (12.4), Email (Brevo API, 12.3)
        3. Gagal kirim eksternal → status=Failed, dicatat ke log, tidak retry otomatis
```

### 12.3 Email (Brevo) — Volume Monitoring & Channel Prioritization

Brevo Free Tier (300 email/hari) cukup untuk skala 30–60 user pada kondisi normal (estimasi 30–60 email/hari).

| Mekanisme | Implementasi |
|---|---|
| Volume monitoring | Hitung `Notification(channel=Email, status=Sent)` 24 jam berjalan sebelum kirim baru |
| Priority tier saat mendekati limit | Tier 1 (selalu dikirim): RED, Critical Blocker, Blocker unacknowledged. Tier 2 (didahulukan, bisa ditunda): AMBER+support, Correction Request Material, Leave Request. Tier 3 (boleh di-drop dari Email): Reminder cutoff, Weekly Summary, Repeated no-submission |
| Alert ke Admin | Web Notification Center (bukan Email) saat volume mendekati ambang |
| Upgrade path | Manual — Brevo Starter $9/bulan untuk 5.000/bulan jika diperlukan |

Trigger Tier 3 yang di-drop dari Email tetap menghasilkan row `Notification(WebNotificationCenter)` — jejak notifikasi tidak pernah hilang sepenuhnya.

### 12.4 Browser Push — Catatan Scope MVP

`Notification.channel = BrowserPush` tetap ada di skema dan tetap dicatat sebagai row, tapi pengiriman aktualnya di-stub pada rilis MVP — trigger yang mencantumkan Browser Push tetap efektif tersampaikan lewat kombinasi Email + Web Notification Center. Dicatat sebagai open item untuk Section 23.

### 12.5 Weekly Summary — Penjadwalan

Job #10 (Section 11.2) mengirim notifikasi berisi link ke summary — data summary itu sendiri tetap dihitung on-demand oleh `ReportingModule` saat link diklik, bukan di-precompute.

### 12.6 Payload Structure

```json
{
  "title": "Blocker RED baru memerlukan perhatian Anda",
  "body": "Blocker 'Deployment gagal di staging' diajukan oleh Budi — Severity: Critical",
  "linkPath": "/team/blockers/{blockerId}",
  "iconType": "blocker-critical"
}
```

`linkPath` wajib relative path, konsisten prinsip portabilitas — notifikasi tetap valid meski domain frontend berubah saat migrasi.

---

## 13. Reporting & Export Architecture

### 13.1 Prinsip: On-Demand, Bukan Materialized

Kelima jenis report (PRD §9) dan agregasi Weekly/Monthly Summary dihitung on-demand saat endpoint dipanggil, bukan di-precompute. Alasan: skala kecil (30–60 user), konsistensi dengan prinsip "sederhana tapi cukup kuat", dan data selalu real-time terkini. Jika dataset membesar signifikan, precompute job dapat ditambahkan sebagai revisi ke Section 11.

### 13.2 Shared Aggregation Layer

`ExceptionSummaryWidget` (dashboard) dan `Daily Exception Report` menjawab pertanyaan yang sama — keduanya memanggil satu service method yang sama, `getExceptionSummary(scope, date)` di `ReportingModule`, bukan diimplementasikan dua kali. Ini mencegah dashboard dan report menampilkan angka berbeda untuk pertanyaan yang sama.

### 13.3 Scope-Filtering — Konsisten di Semua Titik Masuk

Seluruh endpoint `ReportingModule` menerapkan kondisi `WHERE` scope yang sama persis dengan list endpoint biasa (8.11), didelegasikan ke `IdentityModule`, bukan diimplementasikan ulang. Ini menjamin export (FR-42/AC-20) tunduk scope identik dengan tampilan di layar, dan menegakkan konstraint PRD §9 "tidak boleh menghasilkan ranking/leaderboard individual" secara struktural — query agregasi tidak pernah `ORDER BY` metrik performa individual antar-peer.

### 13.4 Strategi Performa

| Strategi | Penerapan |
|---|---|
| Index pada kolom filter umum | `DailyAccountabilityRecord(employeeUserId, workDate)`, `Blocker(status, severity, raisedAt)`, `ComplianceEvent(userId, eventType, eventDate)` |
| Filter periode wajib | `monthly-trend`/`weekly-team-summary` mewajibkan parameter periode |
| Agregasi di level database | `GROUP BY` SQL native, bukan diagregasi di aplikasi |
| Scope-filtering sebelum agregasi | Kondisi `WHERE` scope diterapkan sebelum `GROUP BY` |

### 13.5 Export Architecture

| Aspek | Keputusan |
|---|---|
| Format | PDF dan XLSX sesuai query param `format` |
| Mekanisme | File di-generate, upload ke Object Storage, kembalikan signed URL |
| Retensi file export | Signed URL kedaluwarsa singkat (mis. 15 menit), dihapus via storage lifecycle policy |
| Konsistensi scope | Query sama dengan tampilan report |

### 13.6 Individual Review Evidence

Berbeda dari empat report lain (agregat statistik), `Individual Review Evidence` adalah kumpulan data mentah satu individu — gabungan beberapa `GET` detail (DailyAccountabilityRecord, ManagerNote visible, ComplianceEvent) untuk satu `userId`, tetap memakai `ReportingModule` untuk konsistensi otorisasi/export.

---

# BAB III — FRONTEND & INTEGRATION

## 14. File & Evidence Storage Architecture

### 14.1 Cakupan & Sifat "Evidence" di WorkPulse

Mayoritas evidence WorkPulse (PRD §9, FR-30, FR-49, BR-17) berbentuk data terstruktur — record itu sendiri, bukan file upload. File upload aktual bersifat kapasitas pendukung opsional (mis. screenshot/dokumen pada Blocker atau Manager Note).

### 14.2 Struktur Folder/Key

```
{bucket}/
├── evidence/
│   └── {entityType}/{entityId}/{fileId}.{ext}
├── manager-note-evidence/
│   └── {managerNoteId}/{fileId}.{ext}
├── backups/
│   └── {YYYY-MM-DD}/db-dump.sql.gz
└── exports/
    └── {reportType}/{requestId}/{fileId}.{pdf|xlsx}
```

Empat folder terpisah memisahkan sensitivitas dan siklus hidup berbeda — `manager-note-evidence` kontrol akses lebih ketat (BR-14), `backups` tidak pernah diakses lewat endpoint API, `exports` berumur pendek.

### 14.3 Upload Flow

```
1. Client → POST /api/v1/files/upload-url { purpose, contentType, fileSize }
2. Backend: validasi tipe/ukuran, generate fileId, signed PUT URL (kedaluwarsa 5 menit)
3. Client → PUT langsung ke storage (bukan lewat backend)
4. Client → sertakan fileId pada request resource terkait (mis. POST /blockers)
5. Backend menyimpan fileId sebagai bagian data resource — tidak ada tabel File terpisah
```

### 14.4 Download Flow

```
1. Client → GET /api/v1/files/{fileId}/download-url
2. Backend: resolusi resource pemilik, verifikasi scope (mengikuti otorisasi resource itu sendiri)
3. Generate signed GET URL (kedaluwarsa 15 menit)
```

Otorisasi download selalu mengikuti otorisasi resource pemilik file — tidak ada permission terpisah khusus file.

### 14.5 Validasi File

| Aspek | Ketentuan |
|---|---|
| Tipe file diizinkan | `image/png`, `image/jpeg`, `application/pdf` |
| Ukuran maksimum | 10 MB |
| Rate limit | 10 request/menit per user |

### 14.6 Retensi

| Folder | Retensi | Mekanisme |
|---|---|---|
| `evidence/`, `manager-note-evidence/` | Mengikuti Policy `RetentionPeriod`, evidence disciplinary/HR dapat retention terpisah (NFR-09) | Manual/kebijakan — open item Section 23 jika penghapusan otomatis diperlukan |
| `backups/` | 7–14 hari terakhir | Otomatis, bagian scheduled backup job |
| `exports/` | Sangat singkat (menit) | Storage lifecycle policy |

### 14.7 Keamanan Tambahan

Tidak ada bucket/folder public — seluruh akses melalui signed URL bertenggat waktu singkat setelah otorisasi backend. `backups/` tidak pernah diekspos lewat endpoint `/files/*` manapun — hanya diakses lewat proses restore manual di luar aplikasi.

---

## 15. Audit Trail Architecture

### 15.1 Cakupan terhadap NFR-06

`AuditLog` menegakkan NFR-06 (audit trail immutable untuk seluruh material edit) untuk keenam kategori:

| Kategori (NFR-06) | Mekanisme Penegakan |
|---|---|
| Status | `applyCorrection()` menulis AuditLog saat status berubah; override status menulis `valueAfter` dengan `overrideReason` |
| Blocker | Setiap transisi state menulis AuditLog |
| Kebijakan | `POST /policies` menulis AuditLog saat versi baru dibuat |
| Struktur organisasi | `POST /organizational-assignments` menulis AuditLog |
| Correction Request | Setiap perubahan status menulis AuditLog dengan valueBefore/valueAfter |
| Manager Note | `POST /manager-notes` dan `POST /compliance-events/{id}/coach` menulis `AuditLog(MANAGER_NOTE_CREATED)` dalam transaction yang sama saat ManagerNote dibuat |

### 15.2 Struktur Penulisan — Pola Universal

Seluruh titik penulisan `AuditLog` mengikuti satu method bersama yang diekspos `AuditModule` (`AuditModule.record(...)`), bukan diimplementasikan ulang di tiap service:

```
BEGIN TRANSACTION
  1. Tulis/ubah data material
  2. AuditModule.record({
       actorUserId,       -- NULL jika system-triggered
       action,
       relatedEntityType,
       relatedEntityId,
       valueBefore,       -- NULL untuk operasi CREATE murni
       valueAfter,
       timestamp: now()
     })
COMMIT
```

### 15.3 Katalog `action` — Konvensi Penamaan

Format: `{ENTITY}_{EVENT}` dalam `SCREAMING_SNAKE_CASE`.

| `action` | Konteks |
|---|---|
| `CORRECTION_APPLIED` | Correction Request di-apply |
| `CORRECTION_AUTO_APPLIED` | Applied otomatis setelah Objection Window habis |
| `CORRECTION_REJECTED` | Di-object Reviewer |
| `BLOCKER_STATUS_CHANGED` | Transisi state Blocker |
| `BLOCKER_AUTO_ESCALATED` | Auto-escalate RED unacknowledged |
| `ADMIN_PASSWORD_RESET` | Admin reset password user lain |
| `MANAGER_NOTE_CREATED` | Manager Note baru dibuat |
| `POLICY_VERSION_CREATED` | Versi Policy baru dibuat |
| `ORGANIZATIONAL_ASSIGNMENT_CREATED` | Assignment organisasi baru dibuat |

### 15.4 Query & Retrieval

| Jalur | Penggunaan |
|---|---|
| Terikat entity spesifik (`relatedEntityType`/`relatedEntityId`) | Cek idempotency/histori internal, dan tampilan histori satu resource (before/after Correction Request, AC-04) |
| Individual Review Evidence (13.6) | Histori lengkap satu user, difilter `actorUserId` atau relasi entity miliknya |

Tidak ada endpoint `GET /audit-logs` generik lintas-entity — akses selalu kontekstual terhadap satu resource atau satu user, mengikuti scope resource tersebut (8.11).

### 15.5 Retensi

`AuditLog` tidak tunduk pada `Policy.RetentionPeriod` yang berlaku untuk evidence file biasa — retensinya bersifat indefinite, konsisten sifat immutable NFR-06. Ini menjadi salah satu alasan kapasitas 500 MB Supabase Free Tier perlu dipantau sebagai pemicu migrasi (Section 4.5).

---

## 16. Frontend Architecture

### 16.1 Ringkasan Stack

| Aspek | Keputusan |
|---|---|
| Framework | Vue 3 + TypeScript + Vite |
| UI Library | Vuetify 3 |
| Client State | Pinia |
| Server State | TanStack Query |
| Routing | Vue Router |
| Form Validation | vee-validate + Zod |
| Build/Lint | ESLint + Prettier (konsisten ecosystem kantor, Section 2.2 #3) |

### 16.2 Struktur Folder

```
src/
├── api/                    — layer pemanggilan API, tipe di-generate dari kontrak Section 10 (Section 17)
│   ├── client.ts           — instance HTTP client dasar (base URL, credentials: 'include' untuk cookie)
│   └── {module}.api.ts     — satu file per module backend (blockers.api.ts, correction-requests.api.ts, dst.)
├── queries/                 — TanStack Query hooks, satu per resource
│   └── use{Entity}Query.ts
├── stores/                  — Pinia stores, HANYA untuk client state (16.3)
│   ├── auth.store.ts        — { userId, role, function } dari GET /auth/me — TIDAK menyimpan token/password
│   └── ui.store.ts          — state UI murni (sidebar collapsed, active filter, dst.)
├── components/
│   ├── shared/               — component library internal wajib (16.5)
│   │   ├── StatusBadge.vue
│   │   ├── SubmissionTimingBadge.vue
│   │   ├── AuthorityTag.vue
│   │   ├── ClassificationTag.vue
│   │   ├── ObjectionWindowIndicator.vue
│   │   ├── FilterBar.vue
│   │   ├── ExportButton.vue
│   │   └── NotificationBell.vue
│   └── {feature}/            — component spesifik per fitur (CommitmentCard, BlockerCard, dst.)
├── pages/                    — satu file per route (UI/UX Spec §3 — IA)
├── router/
│   ├── index.ts
│   └── guards.ts             — route guard, konsumsi role dari auth.store (16.4)
├── styles/
│   └── tokens.ts              — design token terpusat (16.5)
└── plugins/
    └── vuetify.ts              — konfigurasi tema Vuetify (16.5)
```

### 16.3 State Management — Pemisahan Client State vs Server State

| State | Dikelola Oleh | Contoh |
|---|---|---|
| **Server state** — data yang berasal dari backend | TanStack Query | `Blocker[]`, `DailyAccountabilityRecord`, `Notification[]` |
| **Client state** — state murni UI/sesi lokal | Pinia | Role/function user aktif (dari `GET /auth/me`), status sidebar, filter aktif yang belum di-submit |

Server state **tidak pernah** disalin ke Pinia sebagai cache manual — TanStack Query sudah menyediakan caching, refetching, dan invalidation. Ini mencegah anti-pattern data terduplikasi di dua tempat yang bisa saling tidak sinkron. Detail pola refetch/polling dibahas di Section 17.

`auth.store` (Pinia) **tidak pernah** menyimpan JWT atau data sensitif — token sepenuhnya berada di HttpOnly Cookie (Section 8.1), tidak dapat dan tidak perlu diakses JavaScript. Store hanya menyimpan hasil `GET /auth/me` (userId, role, function) untuk keperluan render kondisional di UI.

### 16.4 Routing & Guards

Route guard (`router/guards.ts`) memeriksa `auth.store` untuk render kondisional (menyembunyikan menu/route yang tidak relevan bagi role user) — **bukan** sebagai mekanisme keamanan. Guard ini murni pengalaman pengguna: mencegah pengguna melihat halaman yang jelas tidak relevan bagi role-nya. Penegakan otorisasi sesungguhnya selalu terjadi di backend (Section 8), sehingga meskipun guard frontend ter-bypass, backend tetap menolak request yang tidak berwenang.

### 16.5 Design System Implementation Strategy

Design System (Dok 04) memiliki elemen yang bisa dicapai lewat konfigurasi Vuetify dasar, dan elemen yang memerlukan component custom:

| Kategori | Cakupan | Pendekatan |
|---|---|---|
| **Vuetify theming** | Color palette, spacing, border-radius, typography, modal/toast dasar | Dikonfigurasi sekali di `plugins/vuetify.ts` sebagai fondasi awal project |
| **Component library internal (wajib)** | `StatusBadge`, `SubmissionTimingBadge`, `AuthorityTag`, `ClassificationTag`, `ObjectionWindowIndicator`, `FilterBar`, `ExportButton`, `NotificationBell`, `CommitmentCard`, `BlockerCard` + `ActionPanel` | Dibangun sebagai wrapper di atas komponen dasar Vuetify (`v-chip`, `v-card`, `v-btn`), dengan props preset yang terkunci — dikerjakan sebagai fondasi di awal implementasi, sebelum halaman-halaman fitur dikerjakan paralel |
| **Design token terpusat** | Tiga sistem warna status (Daily Status, Submission Timing, Blocker Severity), spacing scale, radius | Satu file `styles/tokens.ts` sebagai satu-satunya sumber kebenaran — komponen manapun mengimpor dari sini, tidak pernah menulis nilai warna langsung |

Component library internal dikerjakan lebih dulu sebagai fondasi karena: (1) tiga sistem warna status wajib tidak pernah tercampur secara visual (Design System §Status Colors) — token terpusat mencegah developer/AI-assisted coding "meminjam" warna dari sistem yang salah; (2) `StatusBadge` vs `SubmissionTimingBadge` wajib beda bentuk (filled vs outlined) secara sistematis di setiap kemunculan — wrapper component dengan props terkunci menegakkan ini tanpa mengandalkan disiplin manual tiap halaman.

Motion constraint Design System (tidak ada hover-lift, glow hanya untuk RED/Critical, badge tanpa animasi) ditegakkan sebagai bagian styling default component library internal — bukan sesuatu yang perlu diingat ulang di tiap halaman fitur.

### 16.6 Form Validation

`vee-validate` + `Zod` dipakai untuk seluruh form input — schema Zod didefinisikan sedekat mungkin dengan bentuk DTO backend (Section 7.4), sehingga validasi client-side (untuk UX responsif) mencerminkan validasi backend yang sesungguhnya menegakkan aturan (Section 2.1 — backend tetap satu-satunya source of truth). Validasi frontend **tidak pernah** dianggap cukup — backend selalu memvalidasi ulang independen (Section 7.4).

### 16.7 Konsumsi `availableActions`

Konsisten dengan Section 7.12: component seperti `ActionPanel` (Blocker), `ValidationPromptModal` (Correction Request review) me-render tombol aksi berdasarkan field `availableActions` dari response API — **tidak pernah** menghitung ulang logic "aksi mana yang valid untuk state ini" secara independen di frontend. Ini mencegah drift antara logic FE dan BE yang sudah ditegakkan sebagai prinsip sejak Section 2.1.

### 16.8 Pertimbangan Keamanan Frontend

| Aspek | Ketentuan |
|---|---|
| XSS | Tidak pernah memakai `v-html` untuk konten yang berasal dari input user (mis. `Commitment.text`, `ManagerNote.note`) — selalu interpolasi teks biasa (`{{ }}`), yang secara default di-escape Vue |
| Data sensitif di client state | Tidak ada password, token, atau data sensitif lain disimpan di Pinia store atau `localStorage`/`sessionStorage` — konsisten Section 8.1 (token hanya di HttpOnly Cookie) |
| CSRF token handling | `csrf_token` dibaca dari cookie oleh interceptor `api/client.ts`, disertakan otomatis sebagai header `X-CSRF-Token` pada setiap request state-changing (Section 8.5) — tidak perlu ditangani manual di tiap pemanggilan API |
| Environment config | Base URL API dan konfigurasi lain lewat environment variable saat build (`VITE_API_BASE_URL`), bukan hardcode — konsisten prinsip portabilitas (Section 4.3) |

---
## 17. Integration Architecture (FE ↔ BE Contract & End-to-End Flow)

> Section ini menjembatani Backend Architecture (Bab II) dan Frontend Architecture (Section 16) sebagai satu alur kerja utuh — memastikan seluruh section sebelumnya benar-benar saling terhubung, bukan hanya konsisten di atas kertas.

### 17.1 Kontrak API sebagai Satu Sumber Kebenaran

Katalog endpoint di Section 10 adalah kontrak resmi. Saat implementasi, NestJS menghasilkan OpenAPI/Swagger spec dari decorator controller yang **merepresentasikan** kontrak tersebut (Section 1.2) — bukan sumber independen.

**Alur type-safety FE-BE:**

```
Backend (NestJS + decorator OpenAPI, sesuai kontrak Section 10)
   → generate openapi.json saat build
   → tool codegen (mis. openapi-typescript) generate TypeScript type dari openapi.json
   → type di-import ke src/api/{module}.api.ts di frontend (Section 16.2)
```

Type request/response FE **tidak pernah ditulis manual dua kali** secara terpisah dari DTO backend — dihasilkan dari kontrak yang sama, mencegah drift antara apa yang BE kirim dan apa yang FE asumsikan. Proses generate ini dijalankan sebagai langkah build/CI (detail pipeline ada di Section 21), bukan langkah manual yang mudah terlupa.

### 17.2 Auth Flow Lintas FE-BE

Melengkapi Section 8.4 (sisi backend) dengan penanganan sisi frontend:

| Skenario | Penanganan FE |
|---|---|
| Token invalid/expired (`401 UNAUTHENTICATED`) | Interceptor global di `api/client.ts` menangkap `401` dari respons manapun → redirect otomatis ke halaman login, `auth.store` di-reset |
| `mustResetPassword = true` saat login | FE redirect paksa ke halaman reset password (Section 8.4 langkah 7) — router guard (16.4) memblokir navigasi ke route lain selain reset password sampai `GET /auth/me` mengonfirmasi `mustResetPassword = false` |
| CORS praktis | `api/client.ts` selalu memakai `credentials: 'include'` pada setiap request (wajib untuk cookie cross-origin, Section 7.9); backend meng-echo origin frontend secara eksplisit (bukan wildcard) sesuai `ALLOWED_ORIGIN` env var |
| Role/scope berubah di tengah sesi (Admin ubah role user yang sedang login) | Karena role tidak di-cache di JWT (Section 8.3) dan selalu diresolusi ulang tiap request backend, FE otomatis mendapat data/permission terbaru pada request berikutnya — tidak perlu mekanisme push khusus; `auth.store` di-refresh saat navigasi antar-halaman utama via re-fetch `GET /auth/me` |

### 17.3 Pola Sinkronisasi Data — Polling via TanStack Query

Tidak ada WebSocket/real-time infrastructure (konsisten Section 3.3 — di luar scope skala 30–60 user). Data yang perlu "terasa update" (`NotificationBell` unread count, dashboard exception-first, `ObjectionWindowIndicator` countdown) ditangani lewat **polling interval TanStack Query** sebagai keputusan resmi:

| Data | Interval Polling | Alasan |
|---|---|---|
| `NotificationBell` unread count | 60 detik | Cukup responsif untuk notifikasi tanpa membebani backend |
| Dashboard exception-first (Team/Function/Management Pulse) | 60 detik saat halaman aktif; berhenti saat tab tidak fokus (`refetchOnWindowFocus` + `refetchInterval` kondisional TanStack Query) | Data agregat tidak perlu real-time detik-ke-detik |
| `ObjectionWindowIndicator` countdown | Dihitung **client-side** dari `objectionWindowEnd` (data statis dari fetch awal) — bukan polling berulang, karena hanya perlu hitung mundur angka, bukan data baru dari server | Menghindari polling tidak perlu; refetch data hanya terjadi saat window benar-benar berakhir atau user melakukan aksi |
| Data lain (list Blocker, Correction Request, dst.) | Refetch on-demand — saat navigasi/fokus halaman, atau setelah mutation (Section 17.4) | Tidak perlu polling kontinu untuk data yang perubahannya jarang di skala 30–60 user |

Keputusan ini konsisten dengan prinsip "sederhana tapi cukup kuat" (Section 2.2 #2) — polling interval yang wajar jauh lebih sederhana daripada infrastruktur WebSocket, cukup untuk skala dan pola pemakaian WorkPulse (bukan aplikasi trading real-time).

### 17.4 Invalidation Pattern Setelah Mutation

Setiap mutation (`POST`/`PATCH`) yang mengubah data di-ikuti invalidation query terkait di TanStack Query — mis. `POST /blockers/{id}/acknowledge` sukses → invalidate query list `blockers` dan query detail `blockers/{id}`, memicu refetch otomatis tanpa perlu polling manual untuk melihat efek aksi sendiri. Ini pola standar TanStack Query, diterapkan konsisten di seluruh `queries/use{Entity}Query.ts` (Section 16.2).

### 17.5 Error Propagation End-to-End

Melengkapi Section 7.7 (struktur error backend) dengan penanganan sisi frontend:

| HTTP Status | Penanganan FE |
|---|---|
| `400`/`422` (Validation/Business Rule) | Interceptor menangkap `error.details`, dipetakan ke pesan inline per-field pada form (`vee-validate` field error) jika `details[].field` cocok dengan field form; jika tidak ada field spesifik, ditampilkan sebagai Toast (Design System — border kiri merah) |
| `403` | Toast generik "Anda tidak berwenang melakukan aksi ini" — tidak pernah membocorkan detail scope/permission ke user |
| `404` | Ditangani kontekstual — untuk detail page, tampilkan state "tidak ditemukan"; untuk aksi dari list, Toast + refetch list (kemungkinan resource sudah berubah scope) |
| `409` (Conflict — state sudah berubah, Section 9.9) | Toast "Data ini sudah diperbarui oleh proses lain, memuat ulang..." + otomatis refetch data terkini — relevan khusus untuk skenario race condition (mis. Correction Request sudah di-auto-apply saat user mencoba object) |
| `429` (Rate Limited) | Toast "Terlalu banyak permintaan, coba lagi sebentar lagi" |
| `500` | Toast generik error, tidak menampilkan detail teknis ke user (pesan sudah digeneralisasi dari backend, Section 7.7) |

### 17.6 File Upload Round-Trip

Melengkapi Section 14.3–14.4 dengan urutan penuh yang melibatkan tiga pihak (FE, BE, Object Storage):

```
1. FE → POST /api/v1/files/upload-url (BE)
2. BE → validasi, generate signed URL → response ke FE
3. FE → PUT file langsung ke Object Storage (BUKAN lewat BE)
4. FE → sertakan fileId pada request pembuatan resource (mis. POST /blockers) → BE
5. BE → simpan fileId sebagai bagian data resource, response sukses → FE
6. FE → invalidate query terkait (17.4) → tampilan ter-update dengan evidence baru
```

Langkah 3 (upload langsung ke storage) penting ditegaskan di sini karena melibatkan **koneksi terpisah** dari koneksi API biasa (`api/client.ts`) — request ini tidak menyertakan cookie autentikasi WorkPulse (tidak perlu, karena otorisasi sudah diverifikasi saat backend menerbitkan signed URL di langkah 2), dan tidak melalui interceptor error handling yang sama (17.5) — kegagalan upload di langkah 3 ditangani terpisah oleh FE (mis. retry manual oleh user, bukan otomatis).

### 17.7 Trace End-to-End — Skenario Kritis

Memvalidasi bahwa seluruh section sebelumnya benar-benar saling terhubung tanpa celah, ditelusuri lewat dua skenario paling kompleks dalam sistem:

**Skenario A — Correction Request Material, dari pengajuan sampai auto-apply**

```
1. [FE] Employee klik "Ajukan Koreksi" pada Commitment locked → form dengan vee-validate/Zod (16.6)
2. [FE] Submit → POST /correction-requests (10.5)
3. [BE] CorrectionRequestModule: klasifikasi Material (9.6), policySnapshot diisi (5.6),
        status=Pending, objectionWindowEnd dihitung
4. [BE] NotificationModule.dispatch() → Notification row (WebNotificationCenter + Email, 12.1 #9)
5. [FE] Employee lihat status "Pending" di detail Correction Request (availableActions kosong bagi dia)
6. [FE, sisi Reviewer] NotificationBell polling 60 detik (17.3) → unread count bertambah
7. [FE, sisi Reviewer] Reviewer buka /team/reviews → GET /correction-requests (scope-filtered, 8.11)
8. [Reviewer TIDAK bertindak dalam window]
9. [BE] Scheduled job Frequent Cycle (11.3) → evaluateExpiredObjectionWindows()
        → SELECT FOR UPDATE (9.9 #1) → status=Applied → AuditLog(CORRECTION_AUTO_APPLIED, 15.3)
        → jika requestedChange ubah initialRisk → recompute initialStatus (9.3, 9.6)
10. [FE, sisi Employee] Refetch berikutnya (navigasi/polling) → status "Applied" terlihat,
         Commitment menampilkan data terkoreksi
```

**Skenario B — Blocker Critical, dari raise sampai auto-escalate**

```
1. [FE] User raise Blocker (severity=Critical) → POST /blockers (10.4)
2. [BE] BlockerModule: resolusi ownerNeededUserId via ScopeGuard (8.9), status=Open
3. [BE] NotificationModule.dispatch() → Email + Browser Push (stub, 12.4) + WebNotificationCenter
        ke escalation chain (12.1 #4)
4. [FE, sisi Owner] NotificationBell polling → notifikasi baru terlihat
5. [Owner tidak acknowledge dalam threshold]
6. [BE] Scheduled job Frequent Cycle → evaluateAutoEscalation() (9.4, 9.9 #2)
        → SELECT FOR UPDATE pada Blocker → re-check acknowledgedAt IS NULL
        → AuditLog(BLOCKER_AUTO_ESCALATED) + Notification ke level berikutnya
7. [FE] BlockerCard menampilkan indikator "Auto-escalated" — diturunkan dari query
        keberadaan AuditLog terkait (9.4), bukan field terpisah
8. [FE, sisi level eskalasi berikutnya] Acknowledge → POST /blockers/{id}/acknowledge
9. [BE] SELECT FOR UPDATE → status=Acknowledged, AuditLog
10. [FE] Invalidate query (17.4) → availableActions berubah (tombol Resolve/Accept Risk muncul,
         tombol Acknowledge hilang — 7.12)
```

Kedua trace ini memverifikasi rantai penuh: FE form → BE validation/business rule → scheduled job (jika relevan) → notification → FE polling/refetch → UI ter-update — tanpa celah di antara section manapun yang sudah dirancang di Bab II.

---

# BAB IV — SECURITY & QUALITY

## 18. Security Traceability Matrix

### 18.1 Tujuan & Pendekatan

Section ini berfungsi sebagai **indeks konsolidasi** — bukan narasi ulang. Karena keamanan WorkPulse tersebar melekat di hampir setiap section (autentikasi, otorisasi, audit trail, validasi data), matrix ini memetakan setiap topik keamanan ke section spesifik tempat topik itu benar-benar dijabarkan, sehingga verifikasi kelengkapan bisa dilakukan tanpa membaca ulang seluruh dokumen.

### 18.2 Traceability Matrix

| Topik Keamanan | Section Rujukan | Ringkasan Mekanisme |
|---|---|---|
| Autentikasi (kredensial, hashing) | 8.2 | Email+password, Argon2id, tidak ada self-registration |
| Session & token security | 8.1, 8.3, 8.6 | JWT di HttpOnly Secure Cookie, entity `Session` untuk revocation instan |
| CSRF Protection | 8.5 | Double Submit Cookie Pattern |
| Otorisasi (RBAC + Scope + Effective Date) | 8.7–8.10 | Dievaluasi ulang tiap request, tidak di-cache di token |
| Scope-filtering pada list/report/export | 8.11, 13.3 | Kondisi `WHERE` scope diterapkan sebelum filter/agregasi apapun dari user |
| Concurrency & race condition | 9.9 | `SELECT FOR UPDATE` pada state transition yang bisa dipicu ganda jalur |
| Validasi input & business rule | 7.4, 9.6 | DTO + `class-validator`, backend selalu re-validasi terlepas validasi FE |
| SQL Injection | — (inheren) | Seluruh akses data melalui Prisma Client (parameterized query) — tidak ada raw SQL string concatenation dari input user |
| Error handling (tidak membocorkan detail internal) | 7.7 | Structured error response, pesan `500` digeneralisasi, detail lengkap hanya di server log |
| Rate limiting | 7.8 | Per kategori endpoint, in-process (`@nestjs/throttler`) |
| CORS | 7.9 | Origin eksplisit via env var, tidak pernah wildcard |
| XSS (frontend) | 16.8 | Tidak pernah `v-html` untuk konten dari input user |
| File upload/access security | 14.4, 14.5, 14.7 | Signed URL bertenggat singkat, otorisasi mengikuti resource pemilik, tidak ada bucket public |
| Audit trail immutability | 15 | Append-only, transactional-linkage, tidak ada endpoint update/delete |
| Backup & disaster recovery | 4.5, 14.6 | `pg_dump` terjadwal, retensi 7–14 hari, alert ke Admin jika gagal |
| Password reset (admin-managed) | 8.2, 10.1 | Reset hanya via Admin, disertai `AuditLog(ADMIN_PASSWORD_RESET)` |
| Policy-category-scoped authorization | 8.10 | `PolicyOwnerGuard`, terpisah dari RBAC umum |
| Dependency security & CI governance | 21.4 | `npm audit`, lockfile, automated update check — bagian CI/CD pipeline |
| Security scenario testing (DENY matrix) | 19.3 | Skenario akses ditolak diterjemahkan jadi test case eksplisit |
| Enkripsi in-transit | 18.3 | Diwarisi dari provider (HTTPS default) |
| Enkripsi at-rest | 18.3 | Diwarisi dari provider (Supabase, Object Storage) |

### 18.3 Keamanan yang Diwarisi dari Infrastruktur Provider

Dua aspek keamanan berikut **tidak memerlukan implementasi kustom** — sudah menjadi standar bawaan provider yang dipilih (Section 4.2), dicatat eksplisit di sini supaya tidak dianggap "belum ditangani":

| Aspek | Provider | Keterangan |
|---|---|---|
| **Enkripsi in-transit (TLS/HTTPS)** | Vercel, Railway, Supabase | Ketiganya menyediakan HTTPS/TLS secara default untuk seluruh endpoint publik — tidak ada konfigurasi tambahan diperlukan di level aplikasi, selama environment variable (`DATABASE_URL`, dst.) memakai skema koneksi yang mewajibkan TLS (`sslmode=require` untuk koneksi Postgres) |
| **Enkripsi at-rest** | Supabase (database), Object Storage S3-compatible | Data tersimpan terenkripsi di level storage oleh provider — bukan sesuatu yang diimplementasikan WorkPulse sendiri |

### 18.4 Verifikasi Kelengkapan

Matrix di atas mencakup seluruh kategori keamanan yang relevan bagi sistem berskala internal 30–60 user dengan business rule kompleks: autentikasi, otorisasi multi-dimensi, proteksi terhadap serangan web umum (CSRF, XSS, SQL Injection), integritas data (concurrency, audit trail), dan keamanan infrastruktur pendukung (file storage, backup). Tidak ada topik yang berdiri sendiri tanpa section rujukan — setiap baris matrix dapat ditelusuri balik ke bagian dokumen yang memuat detail implementasinya.

---
## 19. Testing & Quality Assurance Architecture

### 19.1 Stack & Tanggung Jawab per Layer

| Layer | Tool | Cakupan |
|---|---|---|
| Unit Test | Vitest | Business logic di `service.ts` (Section 6.5) — validasi kondisional, state machine (Section 9), kalkulasi (worst-of status, klasifikasi Minor/Material) — dijalankan terisolasi dari database lewat mock `repository.ts` |
| Integration Test | Vitest + Supertest | Endpoint API (Section 10) end-to-end dalam proses backend — request HTTP asli ke controller, database test terpisah (bukan mock), memverifikasi guard (Section 8), validasi DTO (Section 7.4), dan write ke database benar-benar sesuai skema (Section 5) |
| End-to-End Test | Playwright | Alur penuh lintas FE-BE lewat browser — memvalidasi trace seperti Section 17.7, termasuk interaksi UI (`ValidationPromptModal`, `ActionPanel`) |

Pemisahan `service`/`repository` yang sudah ditetapkan di Section 6.5 secara langsung memungkinkan Unit Test menguji business logic tanpa dependency database — repository di-mock, service diuji murni terhadap input/output dan pemanggilan method yang diharapkan.

### 19.2 Prioritas Testing — Business Rule Kritis

Tidak seluruh bagian sistem butuh cakupan test yang sama dalamnya. Prioritas tertinggi diberikan pada area dengan **konsekuensi tinggi jika salah** — konsisten dengan sifat WorkPulse sebagai sistem accountability:

| Prioritas | Area | Alasan |
|---|---|---|
| **Kritis — wajib 100% branch coverage** | State machine (Section 9): Correction Request lifecycle, Blocker lifecycle, lock evaluation, Compliance Event progression | Kesalahan di area ini berarti data accountability yang salah atau tidak bisa diperbaiki (append-only) |
| **Kritis — wajib diuji eksplisit** | Concurrency scenario (Section 9.9) — race condition Correction Request vs auto-apply, Blocker acknowledge vs auto-escalate | Race condition sulit terdeteksi manual, wajib test terintegrasi dengan simulasi konkurensi |
| **Tinggi** | Authorization (Section 8.7–8.11) — setiap kombinasi role/scope yang berbeda hasil | Kesalahan otorisasi = kebocoran data lintas-scope |
| **Tinggi** | Validasi kondisional (FR-04, FR-09) baik saat create maupun saat Correction Request (Section 9.6) | Data tidak lengkap yang lolos berarti bukti accountability cacat |
| **Menengah** | Reporting/export scope-filtering (Section 13.3) | Penting tapi turunan langsung dari mekanisme scope yang sudah diuji di layer Authorization |
| **Standar** | CRUD endpoint sederhana tanpa business rule kompleks (mis. `GET /notifications`) | Risiko rendah, cukup test dasar |

### 19.3 DENY Test Matrix — Terjemahan Acceptance Criteria (PRD) ke Test Case

Kolom **Test Type** menunjukkan layer di mana AC tersebut paling tepat diverifikasi (Section 19.1) — beberapa AC diuji di lebih dari satu layer.

| AC | Deskripsi | Test Type |
|---|---|---|
| AC-01 | Morning Commitment maks 3, blocker/support wajib jika AMBER/RED | Unit + Integration |
| AC-02 | Additional Work tidak mengubah baseline Morning | Integration |
| AC-03 | Outcome & Continuation dua field terpisah, kombinasi Partially Completed + Continue valid | Unit |
| AC-04 | Edit pasca Cut-Off hanya via Correction Request, hasilkan audit trail before/after | Integration |
| AC-05 | RED/critical blocker sebelum EOD, eskalasi langsung sesuai authority context | Integration + E2E |
| AC-06 | Support owner terima notifikasi, dapat acknowledge/update sesuai lifecycle | Integration |
| AC-07 | Head hanya melihat data scope-nya | Integration (DENY case) |
| AC-08 | CEO/Management dashboard exception company-wide, tanpa leaderboard individual | Integration |
| AC-09 | Leave/exempt workday tidak ditandai No Submission | Integration |
| AC-10 | Missed submission tercatat compliance event + reminder, tidak ada auto-SP | Unit + Integration |
| AC-11 | Perubahan struktur organisasi tidak mengubah data historis sebelum effective date | Integration |
| AC-12 | Perubahan nilai kebijakan ter-versi, data lama tetap evaluasi versi lama | Integration |
| AC-13 | Temporary Reviewer terima eskalasi selama periode efektif, berhenti otomatis setelah expiry | Integration |
| AC-14 | Weekly summary tersedia sesuai scope akses | Integration |
| AC-15 | Material edit menghasilkan audit trail | Integration |
| AC-16 | Tidak ada leaderboard/ranking dalam kondisi apa pun | Integration (query-level assertion — tidak ada `ORDER BY` metrik individual) |
| AC-17 | Check-in normal selesai ≤3 menit (usability) | Di luar cakupan automated test — verifikasi manual/usability testing, dicatat sebagai catatan proses QA, bukan test case otomatis |
| AC-18 | Correction Request Minor/Material/Objection sesuai lifecycle | Unit (klasifikasi) + Integration (lifecycle penuh) |
| AC-19 | Leave belum disetujui tidak mengecualikan dari No Submission; setelah disetujui, otomatis dikecualikan | Integration |
| AC-20 | Export hanya data sesuai scope, tidak ada kebocoran lintas-scope | Integration |

### 19.4 DENY Scenario — Skenario Otorisasi Ditolak

Melengkapi AC-07/AC-20 di atas dengan skenario eksplisit yang wajib punya test case — mencerminkan kombinasi role/scope yang **harus** menghasilkan `403`/`404` (Section 7.7):

| # | Skenario | Expected Result |
|---|---|---|
| 1 | Employee mencoba `POST /correction-requests/{id}/object` untuk request yang bukan miliknya sebagai reviewer | `403 FORBIDDEN` |
| 2 | Employee mencoba `PATCH /commitments/{id}` untuk field yang sudah `isMorningLocked = true` | `422 BUSINESS_RULE_VIOLATION` |
| 3 | Supervisor mencoba `GET /daily-accountability-records/{id}` milik employee di luar tim-nya | `404 NOT_FOUND` |
| 4 | Head mencoba `GET /reports/monthly-trend` (endpoint khusus CEO/Management) | `403 FORBIDDEN` |
| 5 | User tanpa `PolicyOwnerAssignment` untuk kategori `Cutoff` mencoba `POST /policies` dengan `category=Cutoff` | `403 FORBIDDEN`, termasuk jika user tersebut `SystemAdmin` (BR-15) |
| 6 | User mencoba `GET /blockers?filter[employeeUserId]={idDiLuarScope}` untuk melihat data di luar scope lewat manipulasi query parameter | Hasil tetap ter-filter scope asli, tidak mengembalikan data di luar scope (7.6, 8.11) |
| 7 | `ownerNeededUserId` mencoba `POST /blockers/{id}/resolve` pada Blocker berstatus `Closed` | `409 CONFLICT` |
| 8 | Reviewer mencoba `POST /correction-requests/{id}/object` setelah job auto-apply sudah memproses request yang sama (race condition, Section 9.9 #1) | `409 CONFLICT` |
| 9 | `SystemAdmin` mencoba mengakses data operasional (mis. `GET /daily-accountability-records` dengan filter employee tertentu) di luar kapasitas master data | Sesuai 8.11 — `SystemAdmin` tidak otomatis berwenang atas data operasional |

### 19.5 Test Data & Environment

| Aspek | Pendekatan |
|---|---|
| Database test | Instance PostgreSQL terpisah (bukan Supabase interim yang sama dengan development/production) — dijalankan lokal/CI via container, di-reset sebelum tiap test run |
| Seed data | Fixture terprogram mencakup kombinasi role/scope yang relevan untuk DENY matrix (19.4) — user Employee, Supervisor, Head dengan hierarki `directManagerId` yang jelas, `ProjectAuthorityMapping` multi-concurrent untuk menguji resolusi kontekstual (Section 8.9) |
| Waktu/tanggal dalam test | Waktu sistem di-mock (bukan `Date.now()` asli) untuk skenario cutoff/objection window — memungkinkan simulasi "waktu sudah lewat cutoff" tanpa menunggu waktu asli |
| Concurrency test | Simulasi dua request paralel terhadap row yang sama (Section 9.9) memakai `Promise.all` yang memicu kedua jalur nyaris bersamaan, memverifikasi hanya satu yang berhasil dan yang lain menerima `409 CONFLICT` |

### 19.6 CI Integration

Test dijalankan sebagai bagian pipeline CI (detail penuh pipeline ada di Section 21) pada setiap push/pull request — Unit dan Integration Test wajib lolos sebelum merge diizinkan; End-to-End Test (Playwright) dijalankan pada staging/pre-deployment sebagai gerbang terakhir sebelum deploy ke Railway.

---
## 20. Non-Functional Architecture Mapping

### 20.1 Pemetaan NFR ke Pendekatan Teknis

| NFR | Kategori | Pendekatan Arsitektur | Section Rujukan |
|---|---|---|---|
| NFR-01 | Usability — check-in ±2–3 menit | Form Morning/EOD Check-in dirancang minim input mengetik di level UI/UX Spec (Dok 03); dari sisi arsitektur, endpoint `morning-checkin`/`eod-checkin` dirancang sebagai satu request tunggal per fase (bukan multi-step API call), meminimalkan latency jaringan yang menambah waktu pengisian | 10.3, UI/UX Spec §4.2/4.4 |
| NFR-02 | Responsiveness — web-responsive, bukan native app | Vue 3 SPA dengan Vuetify (responsive grid system bawaan); tidak ada dependency native mobile di arsitektur manapun | 16.1 |
| NFR-03 | Performance — dashboard/entri < 2 detik | Index pada kolom filter umum, agregasi di level database, filter periode wajib untuk endpoint berat (Section 13.4); query list selalu scope-filtered sebelum filter user diterapkan (8.11), mengecilkan dataset lebih awal | 13.4, 8.11 |
| NFR-04 | Availability — andal jam kerja, graceful terhadap kegagalan jaringan sementara | Retry-by-next-cycle untuk scheduled job (11.5); FE menangani `500`/kegagalan network dengan Toast dan opsi retry manual (17.5), bukan silent failure; `SELECT FOR UPDATE` mencegah data corrupt saat request bersamaan (9.9) — availability diprioritaskan lewat konsistensi data, bukan uptime 100% yang tidak realistis untuk skala interim (Section 4.5) |
| NFR-05 | Security — RBAC, autentikasi aman, transport terenkripsi, least privilege | RBAC + Contextual Scope + Effective Date (8.7); Argon2id + HttpOnly Cookie (8.1–8.2); TLS diwarisi provider (18.3); least privilege ditegakkan lewat `PolicyOwnerGuard` per-kategori (8.10) dan scope-filtering di setiap list/report (8.11, 13.3) — tidak ada role yang berwenang penuh atas seluruh data secara default | 8, 18 |
| NFR-06 | Auditability — audit trail immutable | `AuditLog` append-only, transactional-linkage, katalog `action` terstandar | 15 |
| NFR-07 | Privacy — hanya data terkait pekerjaan, tidak ada telemetry pengawasan | Skema data (Section 5) tidak menyertakan field tracking aktivitas non-esensial (mis. tidak ada log keystroke, tidak ada tracking waktu aktif di halaman); `Session.userAgent` (5.3) eksplisit dicatat sebagai "opsional, tidak kritis" — bukan mekanisme pengawasan | 5.3, 5.4 |
| NFR-08 | Configurability — nilai kebijakan tidak hard-coded, dapat dikonfigurasi & diversi | `Policy` entity effective-dated per kategori (5.9), diakses lewat `getActivePolicySnapshot()` (6.4) — tidak ada satupun nilai kebijakan (cutoff, threshold, dst.) tertulis sebagai konstanta di kode manapun sepanjang Section 9 | 5.9, 6.4, 9 |
| NFR-09 | Retention — dapat dikonfigurasi, evidence disciplinary/HR terpisah | `Policy` kategori `RetentionPeriod` (5.9); evidence file mengikuti retensi terpisah dari `AuditLog` yang indefinite (14.6 vs 15.5) — dua kebijakan retensi berbeda untuk dua jenis data berbeda, sesuai kebutuhan NFR ini secara eksplisit | 14.6, 15.5 |
| NFR-10 | Backup — rutin, proses restore teruji | Scheduled backup job harian (`pg_dump`, 4.5, 11.4); prosedur restore didokumentasikan sebagai bagian deployment runbook (21) — "teruji" berarti runbook ini divalidasi minimal sekali sebelum go-live, dicatat sebagai open item eksplisit di 20.3 |
| NFR-11 | Exportability — tanpa mengekspos data di luar kewenangan | Export tunduk scope-filtering identik dengan tampilan report (13.3, 13.5) — bukan mekanisme terpisah yang berpotensi lebih longgar | 13.3, 13.5 |
| NFR-12 | Anti-gaming — tidak ada dorongan task-count gaming | Skema `Commitment` membatasi maksimum 3 item (BR-01, 5.4) — bukan dorongan sebaliknya (semakin banyak task, semakin baik); `ReportingModule` tidak pernah menghasilkan ranking/leaderboard individual (13.3, AC-16) — desain arsitektur secara struktural tidak menyediakan mekanisme yang bisa "digaming" lewat jumlah task |

### 20.2 NFR yang Ditegakkan Lintas Banyak Section (Tidak Berdiri Sendiri)

Beberapa NFR bukan hasil satu mekanisme tunggal, melainkan **konsekuensi gabungan** dari beberapa keputusan arsitektur sekaligus — dicatat eksplisit supaya tidak disalahpahami sebagai "satu fitur checklist":

- **NFR-03 (Performance)** dan **NFR-04 (Availability)** saling berkaitan dengan keputusan Modular Monolith (Section 6) — arsitektur tunggal tanpa network hop antar-service internal secara inheren mengurangi latency dibanding microservices, mendukung target < 2 detik tanpa perlu optimasi tambahan di skala 30–60 user.
- **NFR-05 (Security)** dan **NFR-06 (Auditability)** saling menguatkan — otorisasi yang ketat (8) tidak berarti apa-apa tanpa audit trail (15) yang membuktikan otorisasi tersebut benar-benar ditegakkan secara historis, dan sebaliknya.

### 20.3 Open Item

| Item | Keterangan |
|---|---|
| Validasi proses restore backup (NFR-10) | Runbook restore (Section 4.3, 21) perlu divalidasi lewat uji coba restore aktual minimal sekali sebelum go-live — bukan diasumsikan berfungsi hanya karena prosedurnya sudah tertulis. Dicatat sebagai prasyarat sebelum fase Deployment (bukan bagian arsitektur itu sendiri) |
| Usability target NFR-01 (±2–3 menit) | Sebagaimana dicatat di Section 19.3 (AC-17), ini diverifikasi lewat usability testing manual, bukan automated test — perlu dijadwalkan sebagai aktivitas terpisah di fase Testing & Perbaikan |

---

## 21. Deployment Topology & Infrastructure Diagram

> Section ini adalah level **teknis** dari keputusan yang sudah ditetapkan di Section 4 (Deployment Strategy — Decision & Rationale). Section 4 menjawab "kenapa" dan "apa"; section ini menjawab "bagaimana persisnya dikonfigurasi".

### 21.1 Topologi Infrastruktur Interim

```
┌─────────────────────────────────────────────────────────────────┐
│                            GITHUB                                 │
│  Repository: workpulse (monorepo: /frontend, /backend)            │
│  - Push/PR ke branch main → trigger CI (21.3)                     │
└──────────┬──────────────────────────────┬─────────────────────────┘
           │ CI/CD (build+deploy)          │ CI/CD (build+deploy)
           ▼                              ▼
┌─────────────────────┐        ┌──────────────────────────────┐
│       VERCEL          │        │           RAILWAY              │
│  Frontend (Vue 3 SPA)  │        │  Backend (NestJS, Docker image)│
│  - Static build        │◀──────▶│  - Auto-restart on crash       │
│  - Env: VITE_API_*      │  REST  │  - Env vars (21.2)              │
│  - Domain: *.vercel.app │  API   │  - Domain: *.up.railway.app     │
└─────────────────────┘        └───────┬─────────────┬─────────────┘
                                        │ Prisma       │ SDK
                                        │ (direct conn)│
                                        ▼             ▼
                          ┌──────────────────┐  ┌──────────────────────┐
                          │     SUPABASE       │  │  OBJECT STORAGE        │
                          │  PostgreSQL         │  │  (S3-compatible,       │
                          │  Free Tier           │  │   mis. Cloudflare R2)  │
                          │  - Database only      │  │  - evidence/           │
                          └──────────────────┘  │  - manager-note-evidence/│
                                                  │  - backups/              │
                                                  │  - exports/               │
                                                  └──────────────────────┘
                                        │ SMTP/API
                                        ▼
                                ┌──────────────────┐
                                │      BREVO         │
                                │  Email delivery      │
                                │  Free Tier (300/hari) │
                                └──────────────────┘
```

### 21.2 Environment Variables

Konsisten dengan prinsip portabilitas (Section 4.3) — seluruh konfigurasi lingkungan tanpa hardcode:

| Variable | Digunakan Oleh | Contoh/Format |
|---|---|---|
| `DATABASE_URL` | Backend (Prisma) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Backend (AuthModule) | String random, disimpan sebagai secret Railway |
| `ALLOWED_ORIGIN` | Backend (CORS, 7.9) | `https://workpulse.vercel.app` |
| `BREVO_API_KEY` | Backend (NotificationModule) | Secret dari Brevo dashboard |
| `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET` | Backend (FileStorageModule) | Kredensial S3-compatible provider |
| `NODE_ENV` | Backend | `production` / `development` |
| `VITE_API_BASE_URL` | Frontend (build-time) | `https://workpulse-backend.up.railway.app/api/v1` |

Tidak ada variable ini yang mengandung nilai spesifik Railway/Vercel di dalam kode — seluruhnya diinjeksikan saat runtime/build, memungkinkan migrasi ke provider lain hanya dengan mengganti nilai variable.

### 21.3 CI/CD Pipeline

```
Push/PR ke branch main
   │
   ▼
1. Lint & Type Check (ESLint, TypeScript compiler — FE & BE)
   │
   ▼
2. Unit Test + Integration Test (Vitest + Supertest — Section 19.1)
   │  → wajib lolos sebelum lanjut
   ▼
3. Generate OpenAPI spec dari backend → codegen type TypeScript (Section 17.1)
   │
   ▼
4. Dependency Audit (npm audit — 21.4)
   │
   ▼
5. Build:
   - Backend → Docker image (Section 4.3)
   - Frontend → static build (Vite)
   │
   ▼
6. Deploy:
   - Backend image → Railway
   - Frontend static build → Vercel
   │
   ▼
7. (Opsional, sebelum rilis besar) End-to-End Test (Playwright) di environment staging
```

Unit/Integration Test dan Dependency Audit bersifat **blocking** — pipeline berhenti jika salah satu gagal, mencegah kode yang melanggar business rule kritis (Section 19.2) atau membawa dependency rentan sampai ke deploy.

### 21.4 Dependency Governance

| Aspek | Ketentuan |
|---|---|
| Lockfile | `package-lock.json` (atau setara) wajib di-commit, memastikan versi dependency identik di seluruh environment |
| Audit otomatis | `npm audit` dijalankan sebagai bagian CI (21.3) — kerentanan level tinggi/kritis memblokir merge |
| Update dependency | Dilakukan manual berkala (bukan auto-merge otomatis) — konsisten prinsip "sederhana tapi cukup kuat" (Section 2.2 #2), menghindari risiko update otomatis yang tidak diuji menyusup ke production tanpa review |

### 21.5 Runbook — Migrasi Database (Interim → Target)

Prosedur konkret dari prinsip yang sudah ditetapkan di Section 4.3:

```
1. Pastikan skema Prisma di Git sudah sinkron dengan database interim
   (npx prisma migrate status)
2. Jalankan pg_dump dari Supabase PostgreSQL:
   pg_dump $SUPABASE_DATABASE_URL --format=custom --file=workpulse_migration.dump
3. Siapkan PostgreSQL target (infrastruktur resmi perusahaan) — jalankan
   migration Prisma untuk membuat skema kosong:
   npx prisma migrate deploy (dengan DATABASE_URL mengarah ke target)
4. Restore data ke PostgreSQL target:
   pg_restore --dbname=$TARGET_DATABASE_URL --data-only workpulse_migration.dump
5. Verifikasi row count tiap tabel utama sama antara source dan target
6. Update DATABASE_URL di environment backend target, deploy ulang backend
   ke infrastruktur target
7. Update ALLOWED_ORIGIN dan VITE_API_BASE_URL sesuai domain baru
8. Jalankan smoke test (login, morning check-in, lihat 1 blocker existing)
   di environment target sebelum switch DNS/traffic sepenuhnya
```

### 21.6 Runbook — Restore dari Backup (Disaster Recovery)

Melengkapi mekanisme backup (Section 4.5, 11.4) dengan prosedur restore — menjawab NFR-10 ("proses restore yang teruji"):

```
1. Identifikasi file backup terbaru yang valid dari Object Storage folder backups/
   (Section 14.2), sesuai tanggal kejadian yang ingin dipulihkan
2. Download file db-dump.sql.gz, extract
3. Jika database saat ini corrupt/hilang: buat database PostgreSQL baru (Supabase
   atau target, tergantung fase saat insiden terjadi)
4. Restore: pg_restore --dbname=$DATABASE_URL --clean db-dump.sql
5. Verifikasi integritas: cek AuditLog count, cek beberapa DailyAccountabilityRecord
   terkini ada dan sesuai
6. Restart backend agar koneksi database ter-refresh
```

**Validasi wajib sebelum go-live** (menutup open item Section 20.3): prosedur ini harus dijalankan minimal satu kali secara nyata terhadap database non-production (mis. hasil backup development) sebelum sistem dianggap siap menangani insiden nyata — sekadar dokumentasi prosedur tanpa pernah dicoba tidak memenuhi semangat "teruji" pada NFR-10.

### 21.7 Monitoring Dasar (Skala Interim)

Konsisten prinsip "sederhana tapi cukup kuat" — tidak ada infrastruktur observability terpisah (APM, dashboard metrics khusus) di fase interim:

| Aspek | Pendekatan |
|---|---|
| Application log | Log bawaan Railway (stdout/stderr aplikasi NestJS) — cukup untuk skala 30–60 user |
| Uptime | Dipantau manual/insidental pada fase interim; alert otomatis (mis. UptimeRobot gratis) dapat ditambahkan sebagai peningkatan ringan tanpa mengubah arsitektur |
| Error tracking | Error terstruktur dari `500 INTERNAL_ERROR` (Section 7.7) tercatat di log aplikasi — tidak ada layanan error-tracking pihak ketiga (mis. Sentry) di scope MVP, dicatat sebagai potensi peningkatan di Section 22 jika kebutuhan meningkat |

---
## 22. Technology Decisions Log

> Section ini adalah **log referensi konsolidasi** — merangkum seluruh keputusan teknologi dan arsitektural signifikan yang sudah dijabarkan di section-section sebelumnya, dalam satu tempat yang mudah ditelusuri tanpa perlu membaca ulang seluruh dokumen. Setiap baris merujuk balik ke section yang memuat detail dan rasionalnya.

### 22.1 Stack Teknologi Final

| Layer | Teknologi | Section Rujukan |
|---|---|---|
| Frontend Framework | Vue 3 + TypeScript + Vite | 16.1 |
| UI Library | Vuetify 3 | 16.1, 16.5 |
| Client State | Pinia | 16.3 |
| Server State | TanStack Query | 16.3, 17.3 |
| Form Validation | vee-validate + Zod | 16.6 |
| Backend Framework | NestJS + TypeScript | 6, 7 |
| API Style | REST + OpenAPI/Swagger (generated dari kontrak) | 7.1, 17.1 |
| Database | PostgreSQL + Prisma + Prisma Migrate | 5, 4.3 |
| Database Hosting | Supabase Free Tier (database-only) | 4.2, 4.4, 4.5 |
| Authentication | JWT + HttpOnly Secure Cookie (custom, bukan Supabase Auth) | 8 |
| Testing | Vitest (unit) + Supertest (integration) + Playwright (E2E) | 19.1 |
| Email Delivery | Brevo Free Tier | 12.3 |
| File Storage | Object Storage S3-compatible (mis. Cloudflare R2, MinIO) | 14 |

### 22.2 Infrastruktur & Deployment

| Keputusan | Rasional Singkat | Section Rujukan |
|---|---|---|
| Vercel (frontend) + Railway (backend) + Supabase (database) sebagai infrastruktur interim | Biaya rendah, cepat disiapkan sebelum infrastruktur resmi perusahaan disetujui | 4.1, 4.2 |
| Docker sebagai jembatan portabilitas backend | Image standar dapat dijalankan di provider manapun, mencegah migrasi jadi proyek ulang | 4.3, 21.3 |
| Database terpisah dari compute sejak awal | Migrasi backend dan database dapat dilakukan independen | 4.3 |
| Direct connection ke Supabase (bukan connection pooler) | Backend long-running process, menghindari isu Prisma dengan PgBouncer transaction mode | 4.4 |
| In-process scheduler (`@nestjs/schedule`) untuk seluruh background job | Menghindari kebutuhan Redis/queue terpisah di skala 30–60 user; job berfungsi ganda sebagai keepalive Supabase | 11.1, 4.5 |
| `pg_dump` terjadwal harian sebagai mekanisme backup | Mitigasi ketiadaan backup otomatis Supabase Free Tier, tanpa menambah layanan baru | 4.5, 11.4 |

### 22.3 Keputusan Arsitektural Signifikan

| Keputusan | Rasional Singkat | Section Rujukan |
|---|---|---|
| Modular Monolith (bukan microservices) | Kompleksitas business rule tinggi butuh konsistensi transaksional erat; skala 30–60 user tidak butuh scaling independen per service | 6.1 |
| Batas module diturunkan dari batas domain data | Mencegah logic effective-dating/otorisasi "ditemukan ulang" di banyak tempat | 6.1 |
| CSRF Protection via Double Submit Cookie Pattern | Konsekuensi `SameSite=None` akibat FE-BE cross-domain | 8.5 |
| Entity `Session` sebagai lapisan revocation di atas JWT | JWT stateless tidak cukup untuk kebutuhan revocation instan (logout, deactivate user) | 8.3 |
| RBAC + Contextual Scope + Effective Date dievaluasi ulang tiap request (tidak di-cache di JWT) | Perubahan role/kebijakan harus berlaku instan, bukan menunggu token expired | 8.3, 8.7 |
| `SELECT ... FOR UPDATE` (pessimistic locking) untuk state transition dual-jalur | Lock contention rendah di skala ini; lebih sederhana dibanding optimistic locking | 9.9 |
| Reporting on-demand, bukan materialized/precompute | Skala kecil membuat query on-demand cukup cepat; data selalu real-time terkini | 13.1 |
| Polling interval TanStack Query (bukan WebSocket/real-time) | Skala dan pola pemakaian WorkPulse tidak membutuhkan infrastruktur real-time | 17.3 |
| Notification channel prioritization berbasis tier saat mendekati limit Brevo | Free Tier 300 email/hari cukup untuk operasional normal, tapi bukan margin lebar | 12.3 |
| Browser Push distub pada rilis MVP | Memerlukan keputusan teknis tambahan (VAPID, service worker) di luar cakupan referensi saat ini | 12.4 |
| Kontrak API (Section 10) sebagai sumber kebenaran, OpenAPI/Swagger sebagai representasi | Mencegah bentuk API "ditemukan" saat coding, sesuai prinsip Waterfall WorkPulse | 1.2, 17.1 |

### 22.4 Teknologi yang Sengaja Tidak Digunakan

| Teknologi | Alasan Tidak Digunakan |
|---|---|
| React, Tailwind | Tidak sesuai ecosystem kantor (Vue/Vuetify) — Prinsip Pemilihan Teknologi #3 |
| GraphQL | REST lebih sesuai untuk business rule dan kontrak API yang eksplisit; kompleksitas tambahan tidak sepadan di skala ini |
| MongoDB / database non-relational | Model data WorkPulse penuh relasi ketat, effective-dating, dan audit trail — cocok untuk relational, bukan document store |
| Microservices, Kubernetes | Skala 30–60 user tidak membutuhkan scaling independen; menambah kompleksitas operasional tanpa manfaat nyata |
| Message Queue (Kafka) | Volume event jauh di bawah kebutuhan queue terdistribusi; in-process scheduler cukup |
| Redis | Session management dan scheduled job cukup ditangani PostgreSQL + in-process scheduler di skala ini; dapat dipertimbangkan kembali jika kebutuhan skala berubah signifikan |
| Native mobile app | PRD/PDD eksplisit menyatakan web-responsive, bukan native app, sebagai scope MVP (NFR-02) |
| Supabase Auth, Storage, Realtime, Edge Functions | WorkPulse hanya memanfaatkan Supabase sebagai hosting PostgreSQL — Auth dan Storage tetap custom/vendor-agnostic agar tidak terikat berlebihan pada satu provider |

### 22.5 Cara Membaca Log Ini

Log ini bukan pengganti detail di section aslinya — setiap baris adalah **ringkasan navigasi**, bukan penjelasan lengkap. Untuk memahami rasional penuh suatu keputusan (termasuk trade-off yang dipertimbangkan), rujuk section yang tercantum di kolom paling kanan tiap tabel.

---
## 23. Asumsi & Open Items untuk Product Backlog/Software Implementation Specification

> Section penutup ini mengkonsolidasikan seluruh asumsi desain eksplisit dan open item yang muncul sepanjang dokumen — supaya tidak tercecer di masing-masing section, dan menjadi input langsung bagi penyusunan Product Backlog/Software Implementation Specification (Dokumen 07).

### 23.1 Asumsi Desain Eksplisit

Butir berikut adalah keputusan yang diambil untuk mengisi celah spesifik di PDD/PRD/UI-UX Spec yang tidak menyatakan sesuatu secara literal — bukan kesalahan requirement, melainkan detail yang wajar diserahkan ke tahap arsitektur.

| # | Asumsi | Keterangan | Section |
|---|---|---|---|
| 1 | Aktor yang berwenang men-close Blocker (setelah Resolved/AcceptedRisk) adalah `raisedByUserId` | PDD/UI-UX Spec tidak menyatakan siapa yang menutup Blocker secara literal; dipilih pihak yang mengalami blocker sebagai pihak yang mengonfirmasi resolusi memadai | 9.4 |
| 2 | `initialStatus` (Daily Status level-hari) dihitung sebagai worst-of dari ketiga `Commitment.initialRisk`, bukan dipilih manual user | UI/UX Spec §4.2 hanya menyediakan Initial Risk per-Commitment, tidak ada kontrol pemilihan status level-hari saat Morning Check-in | 9.3 |
| 3 | `CorrectionRequest` mencakup seluruh field `Commitment` yang berstatus locked (baik kelompok Morning maupun EOD), bukan terbatas field Morning saja | PRD/PDD tidak mendefinisikan mekanisme "EOD Correction Request" terpisah | 9.6 |
| 4 | Reminder Weekly/Monthly Summary dikirim via job terjadwal, tapi data summary itu sendiri dihitung on-demand saat diklik | FR-41 tidak menentukan model materialized vs on-demand secara eksplisit | 13.1 |

### 23.2 Open Items untuk Product Backlog/Software Implementation Specification

Butir berikut **belum** memiliki keputusan final di level arsitektur — masing-masing perlu dikonfirmasi ke pemilik requirement (Anda/stakeholder) atau divalidasi lewat aktivitas non-arsitektural sebelum atau selama implementasi. Dikelompokkan berdasarkan sifat tindak lanjutnya.

**A. Memerlukan Keputusan/Konfirmasi Requirement**

| # | Open Item | Dampak Jika Tidak Ditindaklanjuti | Section |
|---|---|---|---|
| 1 | `AdditionalWork` yang sudah `isLocked = true` tidak memiliki mekanisme koreksi apapun — FR-43 secara literal hanya menyebut "Morning Commitment" | Kesalahan input Additional Work pasca-cutoff tidak bisa diperbaiki lewat jalur resmi manapun; perlu diputuskan apakah ini keterbatasan yang disengaja atau gap PRD | 9.8 |
| 2 | Implementasi penuh Browser Push (VAPID, service worker) belum diputuskan — sementara di-stub, notifikasi tetap tersampaikan via Email + Web Notification Center | Trigger yang secara PRD §8 seharusnya lewat Browser Push tidak benar-benar real-time push ke device; perlu diputuskan apakah ini diterima permanen atau perlu diimplementasikan penuh di iterasi berikutnya | 12.4 |
| 3 | Mekanisme penghapusan otomatis untuk evidence file (`evidence/`, `manager-note-evidence/`) belum ada — retensi saat ini manual/kebijakan | NFR-09 menyebut retensi "dapat dikonfigurasi", tapi tanpa job otomatis, penegakan retensi bergantung proses manual | 14.6 |
| 4 | Resolusi eksplisit "escalation chain" untuk trigger Critical/instant blocker (PRD §8, trigger #4) belum didetailkan sebagai mekanisme konkret di luar `ownerNeededType` yang sudah ada | Perlu dipastikan apakah eskalasi Critical sepenuhnya mengikuti resolusi Organizational/Project Authority yang sama (8.9), atau ada jalur eskalasi tambahan yang belum tercakup | 8.9, 12.1 |

**B. Memerlukan Validasi/Aktivitas Sebelum Go-Live**

| # | Open Item | Aktivitas yang Diperlukan | Section |
|---|---|---|---|
| 5 | Proses restore backup belum pernah diuji secara nyata | Jalankan runbook restore (21.6) terhadap database non-production minimal satu kali sebelum sistem dianggap siap menangani insiden nyata | 20.3, 21.6 |
| 6 | Target usability NFR-01 (check-in ≤2–3 menit) belum diverifikasi | Usability testing manual terhadap Morning/EOD Check-in, dijadwalkan pada fase Testing & Perbaikan | 19.3 (AC-17), 20.3 |
| 7 | Efektivitas mekanisme keepalive Supabase (scheduled job 5 menit) belum dipantau di kondisi operasional nyata | Pantau di awal operasional — pastikan project Supabase tidak ter-auto-pause meski job berjalan rutin | 4.5 |

**C. Perlu Dipertimbangkan Jika Skala/Kebutuhan Berubah (Bukan Prasyarat MVP)**

| # | Item | Pemicu Potensial |
|---|---|---|
| 8 | Precompute/materialized aggregation untuk Reporting (saat ini on-demand) | Jika dataset membesar signifikan dan response time mendekati batas NFR-03 | 13.1 |
| 9 | Redis untuk session/job jika WorkPulse berkembang melampaui skala 30–60 user | Pertumbuhan user/organisasi signifikan di luar skala MVP | 22.4 |
| 10 | Layanan error-tracking pihak ketiga (mis. Sentry) | Jika kebutuhan observability melampaui log aplikasi dasar | 21.7 |
| 11 | Upgrade Brevo ke Starter plan | Jika volume email harian mendekati/melampaui 300/hari secara konsisten | 12.3 |

### 23.3 Catatan Penutup Dokumen

Dokumen System Architecture Design ini (Section 1–23) menerjemahkan penuh PDD, PRD, UI/UX Specification & Flow, dan Design System menjadi blueprint teknis dan kontrak API resmi — mencakup arsitektur data, module backend, autentikasi/otorisasi, state machine seluruh business rule kritis, katalog endpoint lengkap, mekanisme pendukung (scheduled job, notifikasi, reporting, file storage, audit trail), arsitektur frontend dan integrasinya, strategi keamanan dan testing, serta topologi deployment berikut runbook operasionalnya.

Seluruh keputusan dalam dokumen ini konsisten terhadap prinsip yang ditetapkan sejak Section 2: backend sebagai source of truth, no silent state change, effective-dating menyeluruh untuk data historis, audit trail append-only, policy sebagai data bukan kode, dan otorisasi tiga-dimensi (Role + Scope + Effective Date).

Dokumen ini siap menjadi rujukan langsung bagi **Dokumen 07 — Product Backlog/Software Implementation Specification**, dengan open item di Section 23.2 sebagai salah satu input penyusunan task dan prioritas kerja.

---
