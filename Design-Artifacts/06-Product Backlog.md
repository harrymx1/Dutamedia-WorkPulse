# Product Backlog
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.0 |
| Status | Final |
| Date | September 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.1, PRD v1.1, UI/UX Specification & Flow Document v1.2, Design System v1.1, System Architecture Design v1.0 |

> Dokumen ini adalah **Design Artifact 07** — penutup rangkaian perancangan WorkPulse. Dokumen ini menerjemahkan seluruh rancangan (PDD, PRD, UI/UX Spec, Design System, System Architecture Design) menjadi **daftar pekerjaan implementasi yang terstruktur, berurutan secara teknis, dan dapat dieksekusi langsung** — baik oleh developer maupun AI-assisted coding — tanpa perlu menafsirkan ulang keputusan yang sudah ditetapkan di dokumen-dokumen sebelumnya.

---

## 1. Tujuan & Pendekatan Backlog

### 1.1 Tujuan

1. Menerjemahkan seluruh module, endpoint, state machine, dan mekanisme pendukung yang sudah dirancang di **System Architecture Design (Dok 06)** menjadi **task implementasi konkret** yang siap dikerjakan.
2. Menetapkan **urutan kerja (build order)** yang mengikuti dependency teknis nyata — bukan urutan sembarang atau berdasarkan kemudahan subjektif — sehingga setiap task dikerjakan setelah fondasi yang dibutuhkannya sudah tersedia.
3. Memastikan setiap task memiliki **rujukan eksplisit** ke section SAD yang relevan, sehingga tidak ada keputusan desain yang perlu ditentukan ulang saat coding — konsisten dengan prinsip Waterfall WorkPulse.
4. Menyediakan **Definition of Done** yang konsisten per kategori task, supaya "selesai" punya arti yang sama di seluruh backlog, tidak berbeda-beda tergantung siapa yang mengerjakan.
5. Menutup **open item** dari SAD §23 dengan memetakannya ke task spesifik — memastikan tidak ada asumsi/gap yang terlupakan begitu implementasi dimulai.

### 1.2 Prinsip Penyusunan

| Prinsip | Penerapan |
|---|---|
| **Task diturunkan dari struktur SAD, bukan dibuat ulang dari nol** | Setiap Epic (Section 2) memetakan langsung ke Module Inventory SAD §6.2; setiap task di dalamnya merujuk ke Data Architecture (§5), API Specification (§10), atau State Machine (§9) yang relevan |
| **Urutan kerja mengikuti dependency teknis** | Bukan dikerjakan module-per-module secara sembarang — mengikuti urutan yang sudah tersirat di SAD sendiri: Data Architecture (§5) sebelum Application Architecture (§6), Auth (§8) sebelum module domain manapun, dst. Detail lengkap di Section 3 |
| **Task granular tapi tidak berlebihan** | Satu task idealnya merepresentasikan satu unit kerja yang bisa diverifikasi selesai/tidak selesai secara jelas — bukan dipecah sampai level baris kode, juga bukan digabung jadi satu task raksasa per module |
| **Tidak ada duplikasi konten dari SAD** | Task list (Section 4) menyebut **apa** yang dikerjakan dan **merujuk ke mana** detailnya, tidak menyalin ulang skema tabel/state machine yang sudah ada di SAD — mencegah dua dokumen yang bisa saling tidak sinkron jika salah satu direvisi |
| **Setiap kategori kerja punya Definition of Done yang bisa diverifikasi objektif** | Bukan "sudah selesai menurut developer", tapi kriteria konkret yang bisa dicek — detail di Section 5 |

### 1.3 Struktur Backlog

Backlog ini disusun sebagai **Epic → Task**, bukan tiga tingkat (Epic → Story → Task) — mengingat skala tim dan kompleksitas proyek ini tidak membutuhkan lapisan tambahan. Satu **Epic** merepresentasikan satu module/kelompok kerja dari SAD §6.2 (mis. "DailyAccountabilityModule", "Frontend Foundation"); di dalamnya berisi **Task** granular yang bisa langsung masuk ke papan kerja (board) tim.

### 1.4 Audiens Dokumen

Developer (manusia maupun AI-assisted) sebagai eksekutor langsung task, serta pihak manajemen sebagai gambaran cakupan dan urutan kerja proyek.

---

## 2. Epic Breakdown

### 2.1 Pendekatan Pengelompokan

Epic diturunkan langsung dari **Module Inventory (SAD §6.2)** untuk backend, dan dari **Page Layout Patterns (Design System)** untuk frontend — dua area berbeda (*Self-Service* vs *Management & Governance*) menjadi dasar pengelompokan halaman, bukan satu Epic per halaman individual. Beberapa module SAD yang sangat kecil/terkait erat digabung dalam satu Epic (mis. `AuditModule` masuk ke dalam Epic Backend Foundation, karena sifatnya shared service tanpa endpoint sendiri).

Epic dikelompokkan ke dalam 6 kelompok besar mengikuti struktur Bab pada SAD, ditambah satu kelompok Foundation yang mendahului semuanya. **Urutan Epic pada pengelompokan ini bersifat konseptual/tematik** — urutan pengerjaan aktual (termasuk kapan tiap Epic Frontend mulai dikerjakan) ditentukan berdasarkan dependency teknis di Section 3, bukan mengikuti urutan kemunculan di section ini.

### 2.2 Kelompok 0 — Foundation (Prasyarat Seluruh Epic Lain)

| Epic ID | Nama Epic | Cakupan | Rujukan SAD |
|---|---|---|---|
| EPIC-00 | Project Scaffolding & Environment | Setup repo monorepo, struktur folder backend (NestJS) & frontend (Vue), konfigurasi environment variable, Docker base image | §4.3, §21.2 |
| EPIC-01 | Data Layer — Prisma Schema | Implementasi penuh skema Prisma dari seluruh domain data (User hingga AuditLog), migration awal | §5 (seluruh subsection) |
| EPIC-02 | Backend Shared Foundation | `SharedModule` (guard dasar, DTO base, filter, pipe), `AuditModule` (`AuditModule.record()`), konvensi response envelope & error handling | §6.2 (#11, #15), §7.5, §7.7, §15.2 |

### 2.3 Kelompok 1 — Identity, Auth & Policy (Prasyarat Module Domain Lain)

| Epic ID | Nama Epic | Cakupan | Rujukan SAD |
|---|---|---|---|
| EPIC-03 | AuthModule | Login/logout flow, JWT+cookie, `Session` entity, CSRF guard, password reset (admin-managed) | §5.3 (Session), §8.1–8.6, §10.1 |
| EPIC-04 | IdentityModule | User, OrganizationalAssignment, ProjectAuthorityMapping, TemporaryReviewerAssignment CRUD + resolusi kontekstual | §5.3, §8.9, §10.2 |
| EPIC-05 | Authorization Guards | `RoleGuard`, `ScopeGuard`, `PolicyOwnerGuard`, scope-filtering pattern di level query | §8.7–8.11 |
| EPIC-06 | PolicyModule | Policy entity effective-dated, PolicyOwnerAssignment, `getActivePolicySnapshot()` service | §5.9, §8.10, §10.9 |

### 2.4 Kelompok 2 — Module Domain Inti

| Epic ID | Nama Epic | Cakupan | Rujukan SAD |
|---|---|---|---|
| EPIC-07 | DailyAccountabilityModule | Morning/EOD Check-in, Commitment, AdditionalWork, lock mechanism (isMorningLocked/isEodLocked), Status Suggestion Engine | §5.4, §9.2, §9.3, §9.5, §9.8, §10.3 |
| EPIC-08 | BlockerModule | Lifecycle Blocker penuh, SupportContribution, resolusi Owner Needed kontekstual | §5.5, §8.9, §9.4, §10.4 |
| EPIC-09 | CorrectionRequestModule | Lifecycle Correction Request (Minor/Material), Objection Window, integrasi recompute status | §5.6, §9.6, §10.5 |
| EPIC-10 | ExceptionModule | Leave/Holiday/Exemption, approval flow | §5.7, §10.6 |
| EPIC-11 | ManagerNoteModule | Manager Note CRUD dengan visibility ketat | §5.8a, §10.7 |
| EPIC-12 | ComplianceModule | ComplianceEvent, Compliance Event Progression (Coaching, Recorded Warning, Escalated Formal) | §5.8b, §9.7, §10.8 |

### 2.5 Kelompok 3 — Mekanisme Pendukung

| Epic ID | Nama Epic | Cakupan | Rujukan SAD |
|---|---|---|---|
| EPIC-13 | NotificationModule | Dispatch multi-channel, idempotency check, Brevo integration, priority tier | §5.10a, §12 (seluruh subsection), §10.10 |
| EPIC-14 | FileStorageModule | Signed URL upload/download, struktur folder, validasi file | §14 (seluruh subsection), §10.12 |
| EPIC-15 | SchedulerModule | Seluruh 10 scheduled job, sequencing Frequent Cycle, failure handling | §11 (seluruh subsection) |
| EPIC-16 | ReportingModule | 5 jenis report, `ExceptionSummaryWidget` shared service, export | §13 (seluruh subsection), §10.11 |

### 2.6 Kelompok 4 — Frontend

| Epic ID | Nama Epic | Cakupan | Rujukan SAD |
|---|---|---|---|
| EPIC-17 | Frontend Foundation | Struktur folder Vue, Vuetify theme config, Pinia/TanStack Query setup, router skeleton, API client + interceptor | §16.1–16.4, §16.8 |
| EPIC-18 | Design System Component Library | `StatusBadge`, `SubmissionTimingBadge`, `AuthorityTag`, `ClassificationTag`, `ObjectionWindowIndicator`, `FilterBar`, `ExportButton`, `NotificationBell`, `CommitmentCard`, `BlockerCard`+`ActionPanel`, design token terpusat | §16.5 |
| EPIC-19 | Self-Service Pages | My Today (Morning/EOD Check-in), My History, Notifications, Profile | §16, UI/UX Spec (Self-Service Area) |
| EPIC-20 | Management & Governance Pages | Team/Function/Management Pulse, Blocker Queue, Compliance Queue, Correction & Leave Review, Reports, Policy Settings | §16, UI/UX Spec (Management Area) |

### 2.7 Kelompok 5 — Integrasi, Kualitas & Deployment

| Epic ID | Nama Epic | Cakupan | Rujukan SAD |
|---|---|---|---|
| EPIC-21 | FE-BE Type Contract & Integration | OpenAPI codegen pipeline, polling pattern, error propagation, file upload round-trip | §17 (seluruh subsection) |
| EPIC-22 | Testing Suite | Unit/Integration/E2E sesuai prioritas, DENY matrix, concurrency test | §19 (seluruh subsection) |
| EPIC-23 | CI/CD & Deployment | Pipeline CI, deployment ke Vercel/Railway/Supabase, dependency governance, runbook migrasi & restore | §21 (seluruh subsection) |

### 2.8 Ringkasan

**24 Epic** total, terbagi 6 kelompok — 16 Epic backend (termasuk Foundation), 4 Epic frontend, 3 Epic integrasi/kualitas/deployment yang menutup seluruh siklus dari fondasi data sampai sistem siap deploy. Pengelompokan ini secara langsung mencerminkan struktur Bab I–V pada SAD, sehingga setiap Epic punya jejak yang jelas kembali ke dokumen rancangan.

---

## 3. Build Order & Dependency Sequencing

### 3.1 Prinsip Pengurutan

Urutan kerja di section ini **bukan preferensi kerja**, melainkan turunan langsung dari dependency teknis yang sudah eksplisit dinyatakan di SAD:

| Aturan Urutan | Sumber Keputusan di SAD |
|---|---|
| Data Architecture harus selesai sebelum Application Architecture | SAD §5.1 — struktur module diturunkan dari domain data |
| `PolicyModule` didependensi oleh lima module domain sekaligus | SAD §6.4 — harus tersedia sebelum module domain manapun mulai dikerjakan penuh |
| `AuditModule`/`NotificationModule` bersifat *sink*, dipanggil hampir semua module domain | SAD §6.4 — interface dasarnya harus tersedia sebelum domain module lain menulis data material |
| `CorrectionRequestModule` memanggil `DailyAccountabilityModule` | SAD §6.3 (diagram dependency) — DailyAccountability harus selesai lebih dulu |
| `SchedulerModule` memanggil service module domain yang sudah ada, tidak reimplementasi logic | SAD §6.4 — tidak bisa dikerjakan sebelum service yang dipanggilnya selesai |
| `ReportingModule` membaca read-only dari seluruh module domain | SAD §13.2 — butuh module domain sudah punya struktur data yang stabil untuk diagregasi |
| `POST /compliance-events/{id}/coach` menulis `ManagerNote` dalam satu transaction | SAD §10.8 — `ManagerNoteModule` harus tersedia sebelum `ComplianceModule` selesai penuh |

### 3.2 Fase Pengerjaan

Backlog dibagi menjadi **6 fase berurutan**. Di dalam satu fase, Epic yang tidak saling bergantung dapat dikerjakan **paralel** (ditandai pada kolom Track) — tapi fase berikutnya tidak dimulai sebelum prasyaratnya di fase sebelumnya selesai.

---

**FASE 0 — Bootstrap**

| Epic | Track | Prasyarat |
|---|---|---|
| EPIC-00 Project Scaffolding & Environment | Backend + Frontend | — |
| EPIC-01 Data Layer — Prisma Schema | Backend | EPIC-00 |
| EPIC-02 Backend Shared Foundation | Backend | EPIC-01 |

*EPIC-17 (Frontend Foundation) dapat **mulai dikerjakan** bersamaan dengan EPIC-00 (tidak perlu menunggu Fase 0 selesai), meski secara formal tercatat sebagai bagian deliverable Fase 1 — hanya butuh kontrak API awal (bisa berupa stub/mock di tahap ini, diganti hasil codegen sungguhan setelah backend stabil, lihat EPIC-21).*

---

**FASE 1 — Identity, Access & Shared Services**

| Epic | Track | Prasyarat |
|---|---|---|
| EPIC-04 IdentityModule | Backend | EPIC-01, EPIC-02 |
| EPIC-03 AuthModule | Backend | EPIC-04 (AuthGuard me-resolve OrganizationalAssignment — SAD §8.4 langkah 4) |
| EPIC-05 Authorization Guards | Backend | EPIC-03, EPIC-04 |
| EPIC-06 PolicyModule | Backend | EPIC-01, EPIC-02 (independen dari Auth/Identity, bisa paralel dengan EPIC-03/04) |
| EPIC-13 NotificationModule *(dasar — dispatch mechanism & entity saja, belum priority-tier/Brevo penuh)* | Backend | EPIC-01, EPIC-02 |
| EPIC-17 Frontend Foundation | Frontend | EPIC-00 |
| EPIC-18 Design System Component Library | Frontend | EPIC-17 |

*Kenapa `NotificationModule` dasar masuk di sini, bukan di Fase 3 bersama kelompoknya (§2.5): module domain di Fase 2 akan memanggil `NotificationModule.dispatch()` sebagai bagian dari implementasinya (mis. Blocker Critical raise langsung trigger notifikasi). Interface dasarnya harus sudah ada sebelum itu — detail lanjutan (priority tier Brevo, §12.3) baru disempurnakan di Fase 3.*

---

**FASE 2 — Module Domain Inti**

| Epic | Track | Prasyarat |
|---|---|---|
| EPIC-07 DailyAccountabilityModule | Backend | EPIC-05, EPIC-06, EPIC-13 (dasar) |
| EPIC-08 BlockerModule | Backend (paralel dengan EPIC-07) | EPIC-05, EPIC-06, EPIC-13 (dasar) |
| EPIC-10 ExceptionModule | Backend (paralel dengan EPIC-07/08) | EPIC-05, EPIC-06 |
| EPIC-11 ManagerNoteModule | Backend (paralel dengan EPIC-07/08/10) | EPIC-05 |
| EPIC-09 CorrectionRequestModule | Backend | **EPIC-07 wajib selesai** (memanggil DailyAccountabilityModule, SAD §6.3) |
| EPIC-12 ComplianceModule | Backend | **EPIC-07 dan EPIC-11 wajib selesai** (baca timing DailyAccountabilityRecord; menulis ManagerNote di endpoint `coach`, SAD §10.8) |

*Urutan internal fase ini: EPIC-07, EPIC-08, EPIC-10, EPIC-11 dapat dikerjakan paralel (tidak saling bergantung); EPIC-07 diprioritaskan dikerjakan lebih awal di antara keempatnya untuk mengurangi risiko bottleneck di ujung fase, mengingat dua Epic lain (EPIC-09, EPIC-12) menunggunya. EPIC-09 baru dimulai setelah EPIC-07 selesai. EPIC-12 baru dimulai setelah EPIC-07 dan EPIC-11 selesai.*

---

**FASE 3 — Mekanisme Pendukung & Halaman Self-Service**

| Epic | Track | Prasyarat |
|---|---|---|
| EPIC-14 FileStorageModule | Backend | EPIC-02 (independen dari domain module, tapi baru dibutuhkan nyata setelah Blocker/ManagerNote ada untuk dilekati evidence) |
| EPIC-13 NotificationModule *(penuh — priority tier, Brevo, catalog trigger lengkap)* | Backend | Seluruh Fase 2 selesai (trigger inventory §12.1 mencakup event dari semua module domain) |
| EPIC-15 SchedulerModule | Backend | **Seluruh Fase 2 + EPIC-13 (penuh) + EPIC-14 selesai** — memanggil service yang sudah lengkap dari semua module domain |
| EPIC-19 Self-Service Pages | Frontend | EPIC-07, EPIC-08, EPIC-09, EPIC-13, EPIC-18 |

---

**FASE 4 — Reporting & Halaman Management**

| Epic | Track | Prasyarat |
|---|---|---|
| EPIC-16 ReportingModule | Backend | Seluruh Fase 2 selesai (agregasi lintas seluruh entity domain) |
| EPIC-20 Management & Governance Pages | Frontend | EPIC-16, EPIC-09, EPIC-12, EPIC-10, EPIC-06 (Policy Settings UI), EPIC-18 |

---

**FASE 5 — Integrasi Penuh, Kualitas & Deployment**

| Epic | Track | Prasyarat |
|---|---|---|
| EPIC-21 FE-BE Type Contract & Integration *(finalisasi)* | Backend + Frontend | Seluruh Fase 0–4 — kontrak API final stabil untuk codegen |
| EPIC-22 Testing Suite *(finalisasi — Integration penuh, E2E, DENY matrix, concurrency test)* | Backend + Frontend | Seluruh Fase 0–4 |
| EPIC-23 CI/CD & Deployment *(finalisasi — pipeline penuh, runbook migrasi/restore)* | Infra | Seluruh Fase 0–4 |

> **Catatan penting soal Testing (EPIC-22) dan CI (bagian dari EPIC-23):** kedua Epic ini **tidak murni dikerjakan di Fase 5 saja** — unit test per module (SAD §19.1) ditulis bersamaan dengan module domain terkait di Fase 2–3 (lihat Section 6.2 R3), dan pipeline CI dasar (lint, type-check, unit test runner) sudah aktif sejak Fase 0. Yang **baru bisa** diselesaikan di Fase 5 adalah bagian yang secara sifatnya butuh sistem lengkap: Integration Test lintas-module, E2E Playwright (butuh FE+BE utuh), DENY matrix penuh (butuh seluruh role/scope kombinasi tersedia), dan concurrency test (butuh SchedulerModule aktif).

### 3.3 Diagram Alur Fase

```
FASE 0 (Bootstrap)
   │
   ▼
FASE 1 (Identity, Access & Shared Services) ──── Frontend: Foundation + Component Library
   │
   ▼
FASE 2 (Module Domain Inti)
   ├─ DailyAccountability ─┐
   ├─ Blocker              │  (paralel)
   ├─ Exception             │
   ├─ ManagerNote            │
   │                         ▼
   │                  CorrectionRequest (butuh DailyAccountability)
   │                         │
   └─────────────────────────▼
                       ComplianceModule (butuh DailyAccountability + ManagerNote)
   │
   ▼
FASE 3 (Pendukung + Self-Service) ──── FileStorage, Notification(penuh), Scheduler
   │                                    Frontend: Self-Service Pages
   ▼
FASE 4 (Reporting + Management) ──── ReportingModule
   │                                  Frontend: Management & Governance Pages
   ▼
FASE 5 (Integrasi, Kualitas, Deployment) ──── Finalisasi kontrak, testing penuh, CI/CD
```

---

## 4. Task List per Epic

> Setiap task merujuk section SAD yang relevan — detail teknis (skema, endpoint, validasi, state machine) tidak diulang di sini, cukup diacu. Task diberi ID format `{EPIC-ID}-T{nomor}`.

---

### FASE 0 — Bootstrap

**EPIC-00 — Project Scaffolding & Environment**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-00-T1 | Setup monorepo (`/backend`, `/frontend`), konfigurasi ESLint/Prettier bersama | §2.2 #3 |
| EPIC-00-T2 | Scaffold NestJS project, struktur folder module dasar | §6.5 |
| EPIC-00-T3 | Scaffold Vue 3 + Vite + Vuetify project | §16.1–16.2 |
| EPIC-00-T4 | Definisikan seluruh environment variable (`.env.example`) untuk backend & frontend | §21.2 |
| EPIC-00-T5 | Buat Dockerfile backend (multi-stage build) | §4.3 |
| EPIC-00-T6 | Setup akun & provisioning awal: Supabase project, Railway service, Vercel project, Object Storage bucket, Brevo account | §4.2, §4.4 |

**EPIC-01 — Data Layer: Prisma Schema**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-01-T1 | Implementasi Prisma schema — Domain Identity & Organization (User, OrganizationalAssignment, ProjectAuthorityMapping, TemporaryReviewerAssignment, Session) | §5.3 |
| EPIC-01-T2 | Implementasi Prisma schema — Domain Daily Accountability (DailyAccountabilityRecord, Commitment, AdditionalWork) | §5.4 |
| EPIC-01-T3 | Implementasi Prisma schema — Domain Blocker & Support | §5.5 |
| EPIC-01-T4 | Implementasi Prisma schema — Domain Correction Request | §5.6 |
| EPIC-01-T5 | Implementasi Prisma schema — Domain Exception | §5.7 |
| EPIC-01-T6 | Implementasi Prisma schema — Domain Manager Note & Compliance Event | §5.8 |
| EPIC-01-T7 | Implementasi Prisma schema — Domain Policy | §5.9 |
| EPIC-01-T8 | Implementasi Prisma schema — Domain Notification & Audit Log | §5.10 |
| EPIC-01-T9 | Migration awal ke Supabase (direct connection, verifikasi `sslmode=require`) | §4.4 |
| EPIC-01-T10 | Verifikasi seluruh constraint (unique, FK) dan index dasar sesuai Section 13.4 | §5.11, §13.4 |

**EPIC-02 — Backend Shared Foundation**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-02-T1 | Implementasi `SharedModule` — DTO base class, pipe validasi global | §6.2 #15, §7.4 |
| EPIC-02-T2 | Implementasi response envelope interceptor (format sukses standar) | §7.5 |
| EPIC-02-T3 | Implementasi global exception filter sesuai error convention | §7.7 |
| EPIC-02-T4 | Implementasi `AuditModule.record()` sebagai service bersama | §15.2 |
| EPIC-02-T5 | Implementasi rate limiting global (`@nestjs/throttler`) per kategori endpoint | §7.8 |
| EPIC-02-T6 | Konfigurasi CORS (origin dari env var, credentials true) | §7.9 |

---

### FASE 1 — Identity, Access & Shared Services

**EPIC-04 — IdentityModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-04-T1 | Endpoint `GET/POST /users`, `PATCH /users/{id}` | §10.2 |
| EPIC-04-T2 | Endpoint `GET /users/{id}/organizational-assignments`, `POST /organizational-assignments` (effective-dating logic) | §5.11.a, §10.2 |
| EPIC-04-T3 | Endpoint `POST/PATCH /project-authority-mappings` (multi-concurrent) | §5.3, §10.2 |
| EPIC-04-T4 | Endpoint `POST /temporary-reviewer-assignments` | §10.2 |
| EPIC-04-T5 | Service resolusi role/scope aktif "AS OF tanggal" — dipakai module lain | §5.11.a |
| EPIC-04-T6 | Deactivate user memicu revocation seluruh Session aktif (transaction) | §10.2 |

**EPIC-03 — AuthModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-03-T1 | Endpoint `POST /auth/login` — verifikasi Argon2id, buat Session, set cookie | §8.4, §10.1 |
| EPIC-03-T2 | Endpoint `POST /auth/logout` — revoke Session | §8.4, §10.1 |
| EPIC-03-T3 | `AuthGuard` global — verifikasi JWT, Session, resolve context | §8.4, §8.8 |
| EPIC-03-T4 | Endpoint `POST /auth/reset-password`, `POST /auth/admin-reset-password/{userId}` | §8.2, §10.1 |
| EPIC-03-T5 | Endpoint `GET /auth/me` | §10.1 |
| EPIC-03-T6 | `CsrfGuard` — Double Submit Cookie Pattern | §8.5, §8.8 |

**EPIC-05 — Authorization Guards**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-05-T1 | `RoleGuard` + decorator `@RequireRole` | §8.8 |
| EPIC-05-T2 | `ScopeGuard` + decorator `@RequireScope`, pola delegasi ke service module pemilik entity | §8.8 |
| EPIC-05-T3 | Service resolusi Project Authority kontekstual (`relatedScopeReference`) | §8.9 |
| EPIC-05-T4 | Pattern scope-filtering query (Employee/Supervisor/Head/HRGA/CEO) — helper dipakai module domain | §8.11 |

**EPIC-06 — PolicyModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-06-T1 | Endpoint `GET /policies`, `GET /policies/{category}/history` | §10.9 |
| EPIC-06-T2 | Endpoint `POST /policies` — effective-dating (tutup versi lama) | §5.9, §10.9 |
| EPIC-06-T3 | `PolicyOwnerGuard` + endpoint `POST /policy-owner-assignments` | §8.10, §10.9 |
| EPIC-06-T4 | Service `getActivePolicySnapshot(category[], date)` — dipanggil 5 module domain | §6.4 |

**EPIC-13 (dasar) — NotificationModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-13-T1 | Entity `Notification`, service `dispatch()` dasar dengan idempotency check `(triggerType, relatedEntityId, channel)` | §5.10, §12.2 |
| EPIC-13-T2 | Channel WebNotificationCenter (insert row, tanpa pengiriman eksternal) | §12.2 |
| EPIC-13-T3 | Endpoint `GET /notifications`, `POST /notifications/{id}/mark-read`, `mark-all-read` | §10.10 |

**EPIC-17 — Frontend Foundation**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-17-T1 | Struktur folder (`api/`, `queries/`, `stores/`, `components/`, `pages/`, `router/`) | §16.2 |
| EPIC-17-T2 | `api/client.ts` — HTTP client dasar, `credentials: include`, interceptor CSRF token | §16.2, §8.5, §17.2 |
| EPIC-17-T3 | Setup Pinia (`auth.store`, `ui.store`) | §16.3 |
| EPIC-17-T4 | Setup TanStack Query provider & konfigurasi default | §16.3 |
| EPIC-17-T5 | Router skeleton + `guards.ts` (render kondisional berbasis role) | §16.4 |
| EPIC-17-T6 | Interceptor global `401` → redirect login | §17.2 |

**EPIC-18 — Design System Component Library**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-18-T1 | `styles/tokens.ts` — design token terpusat (3 sistem warna status, spacing, radius) | §16.5, Design System |
| EPIC-18-T2 | Konfigurasi tema Vuetify dari token | §16.5 |
| EPIC-18-T3 | `StatusBadge.vue`, `SubmissionTimingBadge.vue` (filled vs outlined, terkunci) | §16.5, Design System |
| EPIC-18-T4 | `AuthorityTag.vue`, `ClassificationTag.vue` | §16.5 |
| EPIC-18-T5 | `ObjectionWindowIndicator.vue` (countdown client-side) | §16.5, §17.3 |
| EPIC-18-T6 | `FilterBar.vue`, `ExportButton.vue`, `NotificationBell.vue` | §16.5 |
| EPIC-18-T7 | `CommitmentCard.vue`, `BlockerCard.vue` + `ActionPanel.vue` (konsumsi `availableActions`) | §16.5, §16.7, §7.12 |

---

### FASE 2 — Module Domain Inti

**EPIC-07 — DailyAccountabilityModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-07-T1 | Endpoint `POST /daily-accountability-records/morning-checkin` — validasi BR-01, FR-04, hitung `initialStatus` (worst-of) | §9.3, §10.3 |
| EPIC-07-T2 | Endpoint `GET .../today` dengan `availableActions` | §7.12, §10.3 |
| EPIC-07-T3 | Endpoint `POST .../{id}/eod-checkin` — validasi outcome/continuation, interaksi Status Suggestion Engine | §9.5, §10.3 |
| EPIC-07-T4 | Endpoint `.../confirm-override` — simpan `overrideReason` ke AuditLog | §9.3, §10.3 |
| EPIC-07-T5 | Endpoint `PATCH /commitments/{id}` — validasi lock per kelompok field (Morning/EOD) | §9.8, §10.3 |
| EPIC-07-T6 | Endpoint `POST/PATCH /additional-work` | §10.3 |
| EPIC-07-T7 | Endpoint `GET /daily-accountability-records`, `/{id}` — scope-filtered | §8.11, §10.3 |
| EPIC-07-T8 | Service `evaluateCutoffLock()` — dipanggil SchedulerModule nanti | §9.2, §9.8 |

**EPIC-08 — BlockerModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-08-T1 | Endpoint `POST /blockers` — resolusi owner via ScopeGuard/8.9 | §9.4, §10.4 |
| EPIC-08-T2 | Endpoint `GET /blockers`, `/{id}` dengan `availableActions` | §7.12, §10.4 |
| EPIC-08-T3 | Endpoint `acknowledge`, `update`, `resolve`, `accept-risk`, `close` — state machine penuh | §9.4, §10.4 |
| EPIC-08-T4 | Endpoint `POST /blockers/{id}/support` | §10.4 |
| EPIC-08-T5 | Service `evaluateAutoEscalation()` dengan idempotency (cek AuditLog) — dipanggil SchedulerModule nanti | §9.4, §9.9 #2 |

**EPIC-10 — ExceptionModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-10-T1 | Endpoint `POST /exceptions/leave`, `/holiday`, `/exemption` | §10.6 |
| EPIC-10-T2 | Endpoint `GET /exceptions` — scope-filtered | §8.11, §10.6 |
| EPIC-10-T3 | Endpoint `approve`/`reject` untuk Leave | §10.6 |

**EPIC-11 — ManagerNoteModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-11-T1 | Endpoint `POST /manager-notes` — sertakan `AuditLog(MANAGER_NOTE_CREATED)` | §15.1, §10.7 |
| EPIC-11-T2 | Endpoint `GET /manager-notes`, `/{id}` dengan filter visibility (BR-14) | §10.7 |

**EPIC-09 — CorrectionRequestModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-09-T1 | Endpoint `POST /correction-requests` — klasifikasi Minor/Material, validasi kondisional terhadap hasil gabungan | §9.6, §10.5 |
| EPIC-09-T2 | Jalur Minor — apply langsung + AuditLog dalam satu transaction | §9.6 |
| EPIC-09-T3 | Jalur Material — set Pending, objection window, trigger Notification | §9.6, §12.1 #9 |
| EPIC-09-T4 | Endpoint `POST .../{id}/object` — `SELECT FOR UPDATE`, re-check status | §9.9 #1, §10.5 |
| EPIC-09-T5 | Recompute `initialStatus` jika `requestedChange` mengubah `initialRisk` | §9.6 |
| EPIC-09-T6 | Service `evaluateExpiredObjectionWindows()` — dipanggil SchedulerModule nanti | §9.6, §9.9 #1 |

**EPIC-12 — ComplianceModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-12-T1 | Service `evaluateNoSubmission()` — cek Exception valid, buat ComplianceEvent | §9.7, §11 |
| EPIC-12-T2 | Service `evaluatePatternFlag()` — idempotent per episode | §9.7 |
| EPIC-12-T3 | Endpoint `GET /compliance-events`, `/{id}` dengan `availableActions` sesuai progression | §9.7, §10.8 |
| EPIC-12-T4 | Endpoint `POST .../{id}/coach` — satu transaction ManagerNote + ComplianceEvent | §9.7, §10.8, §15.1 |
| EPIC-12-T5 | Endpoint `record-warning`, `escalate-formal` | §9.7, §10.8 |

---

### FASE 3 — Mekanisme Pendukung & Self-Service

**EPIC-14 — FileStorageModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-14-T1 | Endpoint `POST /files/upload-url` — validasi tipe/ukuran, signed PUT URL | §14.3, §10.12 |
| EPIC-14-T2 | Endpoint `GET /files/{fileId}/download-url` — otorisasi mengikuti resource pemilik | §14.4, §10.12 |
| EPIC-14-T3 | Struktur folder (evidence/, manager-note-evidence/, backups/, exports/) | §14.2 |

**EPIC-13 (penuh) — NotificationModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-13-T4 | Integrasi Brevo API — channel Email | §12.2, §12.3 |
| EPIC-13-T5 | Volume monitoring + priority tier saat mendekati limit | §12.3 |
| EPIC-13-T6 | Stub channel BrowserPush | §12.4 |
| EPIC-13-T7 | Pemetaan seluruh 13 trigger (PRD §8) ke channel & payload standar | §12.1, §12.6 |

**EPIC-15 — SchedulerModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-15-T1 | `@Cron` Frequent Cycle (5 menit) — sequencing 7 langkah sesuai urutan wajib | §11.3 |
| EPIC-15-T2 | Job Daily Aggregate (Pattern Flag, 03:00) | §11.4 |
| EPIC-15-T3 | Job Daily Maintenance (Database Backup `pg_dump`, 02:00) | §4.5, §11.4 |
| EPIC-15-T4 | Job Weekly Aggregate (Weekly Summary Notification) | §12.5 |
| EPIC-15-T5 | Failure handling — isolasi per-item, alert Admin untuk kegagalan backup | §11.5 |

**EPIC-19 — Self-Service Pages**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-19-T1 | Halaman My Today (Morning + EOD Check-in) | §16, UI/UX Spec §7.1 |
| EPIC-19-T2 | Halaman My History | UI/UX Spec |
| EPIC-19-T3 | Halaman Notifications (full list) | §16.5 |
| EPIC-19-T4 | Halaman Profile | UI/UX Spec |
| EPIC-19-T5 | Integrasi TanStack Query hooks untuk seluruh resource di atas | §17.3, §17.4 |

---

### FASE 4 — Reporting & Management

**EPIC-16 — ReportingModule**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-16-T1 | Service `getExceptionSummary(scope, date)` — dipakai dashboard widget & report | §13.2 |
| EPIC-16-T2 | Endpoint 5 jenis report (`daily-exception`, `weekly-team-summary`, `monthly-trend`, `individual-evidence`, `blocker-root-cause`) | §13.1, §10.11 |
| EPIC-16-T3 | Endpoint export (`/export`) — PDF/XLSX, signed URL | §13.5, §10.11 |
| EPIC-16-T4 | Index & optimasi query agregasi sesuai strategi performa | §13.4 |

**EPIC-20 — Management & Governance Pages**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-20-T1 | Team/Function/Management Pulse (dashboard + `ExceptionSummaryWidget`) | §16, UI/UX Spec |
| EPIC-20-T2 | Blocker Queue, Compliance Queue | UI/UX Spec |
| EPIC-20-T3 | Correction & Leave Review | UI/UX Spec |
| EPIC-20-T4 | Reports pages (5 jenis) | §13, UI/UX Spec |
| EPIC-20-T5 | Policy Settings (termasuk `PolicyVersionHistory`) | §10.9, UI/UX Spec |

---

### FASE 5 — Integrasi, Kualitas & Deployment

**EPIC-21 — FE-BE Type Contract & Integration**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-21-T1 | Setup OpenAPI generation dari NestJS decorator | §17.1 |
| EPIC-21-T2 | Setup codegen TypeScript type dari OpenAPI spec ke frontend | §17.1 |
| EPIC-21-T3 | Implementasi polling interval final (NotificationBell, dashboard) | §17.3 |
| EPIC-21-T4 | Error propagation mapping penuh (per status code → UI treatment) | §17.5 |
| EPIC-21-T5 | Verifikasi file upload round-trip end-to-end | §17.6, §14.3 |

**EPIC-22 — Testing Suite**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-22-T1 | Konsolidasi & lengkapi cakupan unit test state machine kritis (Correction Request, Blocker, lock evaluation, Compliance Progression) | §19.2, §19.3 |
| EPIC-22-T2 | Integration test seluruh endpoint (Section 10) | §19.1, §19.3 |
| EPIC-22-T3 | DENY scenario test (9 skenario) | §19.4 |
| EPIC-22-T4 | Concurrency test (Correction Request race, Blocker auto-escalate race) | §9.9, §19.5 |
| EPIC-22-T5 | E2E test Playwright — trace Skenario A & B (Section 17.7) | §17.7, §19.1 |

**EPIC-23 — CI/CD & Deployment**

| Task ID | Deskripsi | Rujukan SAD |
|---|---|---|
| EPIC-23-T1 | Pipeline CI penuh (lint, type-check, test, audit, build, deploy) | §21.3 |
| EPIC-23-T2 | Dependency governance (`npm audit` blocking) | §21.4 |
| EPIC-23-T3 | Deploy backend ke Railway (Docker image), frontend ke Vercel | §21.1 |
| EPIC-23-T4 | Dokumentasi & uji coba runbook migrasi database | §21.5 |
| EPIC-23-T5 | Dokumentasi & **uji coba nyata** runbook restore backup (menutup Open Item SAD §23.2 B1) | §21.6 |
| EPIC-23-T6 | Setup monitoring dasar (log, uptime check ringan) | §21.7 |

---

## 5. Definition of Done

> Kriteria berikut berlaku **per kategori task**, bukan per Epic — satu Epic biasanya berisi task dari beberapa kategori sekaligus. Setiap kategori mengacu balik ke konvensi SAD yang relevan, supaya "selesai" berarti **sesuai kontrak**, bukan sekadar "berjalan tanpa error".

### 5.1 Kategori: Data Layer / Prisma Schema

| Kriteria | Rujukan SAD |
|---|---|
| Seluruh kolom, tipe data, dan constraint (unique, FK, nullable) sesuai persis dengan tabel di Section 5 | §5.3–§5.10 |
| Pattern lintas-domain diterapkan konsisten: effective-dating, snapshot (JSONB, bukan FK skalar), polymorphic reference | §5.11 |
| `AuditLog` tidak memiliki kolom `updatedAt`/`deletedAt` — append-only tertegak di level skema | §5.10 |
| Migration berjalan tanpa error di database test terpisah, dan berhasil di-apply ke Supabase | §4.4, §19.5 |
| Index dasar pada kolom filter umum sudah dibuat | §13.4 |

### 5.2 Kategori: Endpoint API

> *Kriteria di bawah berlaku untuk endpoint individual maupun konfigurasi lintas-endpoint yang sifatnya global (rate limiting, CORS, response envelope) — untuk kasus terakhir, "endpoint ini" dibaca sebagai "seluruh endpoint yang terdampak".*

| Kriteria | Rujukan SAD |
|---|---|
| Method, path, dan struktur request/response persis sesuai baris terkait di Section 10 | §10 (subsection relevan) |
| Response sukses mengikuti standard envelope (`data`, `meta`) | §7.5 |
| Seluruh error case menghasilkan status code dan `error.code` sesuai konvensi | §7.7 |
| Validasi kondisional diterapkan di level DTO, bukan manual di service | §7.4 |
| Guard yang relevan terpasang dan diverifikasi lewat test DENY (§19.4) | §8.8 |
| Untuk endpoint resource stateful, response menyertakan `availableActions` yang akurat terhadap state saat ini | §7.12 |
| Untuk endpoint list, scope-filtering diterapkan di level query sebelum filter/pagination dari user | §8.11, §7.6 |
| Integration test (Supertest) untuk endpoint ini ada dan lolos | §19.1, §19.3 |

### 5.3 Kategori: State Machine / Business Logic Kritis

| Kriteria | Rujukan SAD |
|---|---|
| Seluruh transisi state pada tabel state machine terkait diimplementasikan — tidak ada transisi yang terlewat maupun transisi tambahan yang tidak terdaftar | §9.2–§9.8 |
| Validasi kondisional dievaluasi terhadap hasil gabungan data lama + perubahan | §9.6 |
| Efek samping wajib terjadi dalam transaction yang sama dengan write utama | §9.6, §5.11.c |
| Setiap write material disertai `AuditLog` lewat `AuditModule.record()` | §15.2 |
| Untuk state transition dual-jalur, `SELECT ... FOR UPDATE` diterapkan dan diverifikasi lewat concurrency test | §9.9 |
| Unit test (Vitest) mencapai 100% branch coverage untuk logic ini, **ditulis bersamaan dengan task ini — bukan ditunda ke EPIC-22** | §19.2 |

### 5.4 Kategori: Otorisasi & Guard

| Kriteria | Rujukan SAD |
|---|---|
| Keputusan otorisasi selalu mengevaluasi Role + Scope + Effective Date bersamaan | §8.7 |
| Resource di luar scope visibility direspons `404`, bukan `403`, kecuali kasus yang eksplisit dikecualikan | §7.7 |
| Guard tidak reimplementasi logic resolusi scope — mendelegasikan ke service module pemilik entity | §8.8 |
| Seluruh skenario DENY yang relevan (Section 19.4) untuk resource ini punya test case dan lolos | §19.4 |

### 5.5 Kategori: Scheduled Job

| Kriteria | Rujukan SAD |
|---|---|
| Job memanggil service module domain yang sudah ada — tidak ada logic bisnis baru ditulis langsung di dalam job | §6.4, §7.11 |
| Job bersifat idempotent — dijalankan dua kali berturut-turut pada state yang sama tidak menghasilkan efek ganda | §11.1 |
| Untuk job dalam Frequent Cycle, urutan pemanggilan sesuai sequencing yang ditetapkan | §11.3 |
| Kegagalan pada satu item tidak menghentikan pemrosesan item lain dalam siklus yang sama | §11.5 |
| Untuk job kritis (Backup), kegagalan memicu alert ke `SystemAdmin` | §11.5, §4.5 |

### 5.6 Kategori: Frontend — Component Library Internal

| Kriteria | Rujukan SAD |
|---|---|
| Seluruh warna, spacing, radius diambil dari `styles/tokens.ts` — tidak ada nilai hardcode | §16.5 |
| `StatusBadge` dan `SubmissionTimingBadge` secara visual tidak bisa tertukar | §16.5, Design System |
| Motion constraint diterapkan sebagai default styling, bukan opsional | §16.5, Design System |
| Component di-review terhadap Design System (Dok 04) sebelum dipakai halaman manapun | Design System |

### 5.7 Kategori: Frontend — Halaman/Page

| Kriteria | Rujukan SAD |
|---|---|
| Data resource diambil lewat TanStack Query hook, bukan fetch manual di dalam component halaman | §16.3 |
| Aksi mutasi memicu invalidation query terkait, tanpa perlu refresh manual oleh user | §17.4 |
| Tombol aksi dirender berdasarkan `availableActions` dari response API | §16.7, §7.12 |
| Error dari API ditangani sesuai pemetaan Section 17.5 | §17.5 |
| Tidak ada `v-html` untuk konten yang berasal dari input user | §16.8 |
| Halaman diverifikasi terhadap flow yang relevan di UI/UX Specification & Flow (Dok 03) | Dok 03 |

### 5.8 Kategori: Notification/Trigger

| Kriteria | Rujukan SAD |
|---|---|
| Idempotency check `(triggerType, relatedEntityId, channel)` diterapkan sebelum insert row baru | §5.10, §12.2 |
| Setiap trigger tetap menghasilkan minimal satu row `Notification(channel=WebNotificationCenter)` | §12.1 |
| Payload mengikuti struktur standar | §12.6 |
| Untuk channel Email, volume monitoring dan priority tier diverifikasi tidak melebihi batas harian tanpa terdeteksi | §12.3 |

### 5.9 Kategori: Reporting/Export

| Kriteria | Rujukan SAD |
|---|---|
| Query agregasi tidak pernah menghasilkan `ORDER BY` metrik performa individual antar-peer | §13.3 |
| Scope-filtering pada endpoint report identik dengan scope-filtering endpoint export yang berkorespondensi | §13.3, §13.5 |
| Response time memenuhi target NFR-03 (< 2 detik) pada data uji dengan volume realistis | §13.4, §20.1 |
| File export tersimpan lewat signed URL bertenggat singkat | §13.5, §14.7 |

### 5.10 Kategori: Testing (Task itu Sendiri)

| Kriteria | Rujukan SAD |
|---|---|
| Test mengacu Acceptance Criteria (AC) atau skenario spesifik yang relevan | §19.3, §19.4 |
| Test dijalankan otomatis sebagai bagian pipeline CI | §21.3 |
| Untuk test konkurensi, skenario race condition benar-benar disimulasikan, bukan diasumsikan aman | §19.5 |

### 5.11 Kategori: CI/CD, Deployment & Runbook

| Kriteria | Rujukan SAD |
|---|---|
| Pipeline CI memblokir merge jika lint, type-check, test, atau dependency audit gagal | §21.3, §21.4 |
| Environment variable tidak ada yang hardcode secara permanen | §21.2 |
| Untuk task runbook (migrasi, restore), prosedur **benar-benar dijalankan minimal satu kali** terhadap environment non-production | §21.5, §21.6 |

### 5.12 Kategori: Project Scaffolding & Provisioning

| Kriteria | Rujukan SAD |
|---|---|
| Struktur folder monorepo sesuai pembagian `/backend` dan `/frontend` yang konsisten dengan struktur module dan struktur frontend | §6.5, §16.2 |
| Seluruh akun/provisioning (Supabase, Railway, Vercel, Object Storage, Brevo) aktif dan dapat diakses tim, kredensial tersimpan aman (bukan di repository) | §4.2 |
| Environment variable yang didefinisikan di `.env.example` mencakup seluruh variable yang disebut Section 21.2, tanpa nilai aktual ter-commit ke repository | §21.2 |
| Dockerfile backend berhasil di-build lokal tanpa error sebelum dipakai pipeline CI | §4.3 |

---

## 6. Risk & Carry-Over Register

> Section penutup ini memetakan seluruh open item dari **SAD §23.2** ke task/Epic spesifik di backlog ini — memastikan tidak ada gap yang menguap begitu implementasi dimulai.

### 6.1 Pemetaan Open Item SAD §23.2

**Kategori A — Memerlukan Keputusan/Konfirmasi Requirement**

| # | Open Item (SAD §23.2.A) | Dipetakan ke | Tindakan |
|---|---|---|---|
| A1 | `AdditionalWork` locked tidak punya mekanisme koreksi | **Sebelum EPIC-07-T6** dikerjakan | Konfirmasi ke pemilik requirement: keterbatasan disengaja, atau perlu ditambah endpoint koreksi setara `CorrectionRequest`. Wajib diputuskan sebelum EPIC-07 dianggap selesai — jika jawabannya "perlu ditambah", task baru disisipkan ke EPIC-07 sebelum lanjut ke EPIC-09/12 |
| A2 | Implementasi penuh Browser Push belum diputuskan | **Sebelum EPIC-13-T6** dikerjakan | Konfirmasi apakah stub permanen diterima, atau perlu riset teknis tambahan sebagai task baru di EPIC-13 |
| A3 | Mekanisme penghapusan otomatis evidence file belum ada | **Setelah EPIC-14-T3** | Tidak memblokir Fase 3 — jika diperlukan, jadi task tambahan di EPIC-15 sebagai job baru, polanya sama dengan job Backup yang sudah ada |
| A4 | Detail "escalation chain" trigger Critical Blocker belum eksplisit di luar resolusi 8.9 | **Sebelum EPIC-08-T5** dikerjakan | Konfirmasi apakah eskalasi Critical sepenuhnya mengikuti Organizational/Project Authority yang sama, atau butuh daftar eskalasi terpisah — mempengaruhi desain `evaluateAutoEscalation()` |

**Kategori B — Memerlukan Validasi/Aktivitas Sebelum Go-Live**

| # | Open Item (SAD §23.2.B) | Dipetakan ke | Tindakan |
|---|---|---|---|
| B1 | Proses restore backup belum pernah diuji nyata | **EPIC-23-T5** | Kriteria selesai mewajibkan uji coba nyata, bukan sekadar dokumentasi (Section 5.11) |
| B2 | Target usability NFR-01 belum diverifikasi | **Setelah EPIC-19-T1** (Self-Service Pages, Morning/EOD Check-in) | Usability testing manual terhadap build yang sudah berjalan, dilakukan begitu halaman Check-in tersedia untuk dicoba |
| B3 | Efektivitas keepalive Supabase belum dipantau nyata | **Setelah EPIC-15-T1** (Frequent Cycle aktif) | Pantau selama minimal 7 hari operasional berturut-turut, memverifikasi project Supabase tidak ter-auto-pause meski job berjalan rutin tiap 5 menit |

**Kategori C — Dipertimbangkan Jika Skala/Kebutuhan Berubah**

| # | Item (SAD §23.2.C) | Status di Backlog Ini | Catatan |
|---|---|---|---|
| C1 | Precompute/materialized aggregation Reporting | Tidak ada task di backlog ini | Baru relevan jika EPIC-16-T4 (optimasi performa) terbukti tidak cukup di data uji nyata |
| C2 | Redis untuk session/job | Tidak ada task di backlog ini | Tidak relevan selama skala 30–60 user bertahan |
| C3 | Error-tracking pihak ketiga (Sentry) | Tidak ada task di backlog ini | EPIC-23-T6 (monitoring dasar) cukup untuk saat ini |
| C4 | Upgrade Brevo Starter | Tidak ada task di backlog ini | EPIC-13-T5 (volume monitoring) sudah menyediakan visibilitas dini — upgrade adalah keputusan operasional |

### 6.2 Risiko Spesifik dari Struktur Backlog Ini

| # | Risiko | Mitigasi |
|---|---|---|
| R1 | `NotificationModule` terbagi jadi task "dasar" (Fase 1) dan "penuh" (Fase 3) — berpotensi ambigu | Batas eksplisit: "dasar" = EPIC-13-T1–T3 (entity, dispatch mekanisme, WebNotificationCenter, endpoint baca). "Penuh" = EPIC-13-T4–T7 (Brevo, priority tier, stub Push, pemetaan 13 trigger) |
| R2 | EPIC-09 (CorrectionRequest) dan EPIC-12 (Compliance) sama-sama bergantung pada EPIC-07 — keterlambatan di EPIC-07 berdampak ganda | EPIC-07 diprioritaskan dikerjakan lebih awal dalam Fase 2 dibanding EPIC-08/10/11 yang paralel dengannya (Section 3.2) |
| R3 | Unit test untuk state machine kritis berisiko terlewat kalau tidak ditegaskan kapan ditulis | Ditegaskan di Section 5.3: setiap task kategori "State Machine/Business Logic Kritis" di Fase 2 wajib disertai unit test-nya sebagai bagian dari task yang sama — EPIC-22-T1 di Fase 5 hanya mengonsolidasikan/melengkapi cakupan |
| R4 | Component library (EPIC-18) dibangun di Fase 1, sebelum module domain manapun selesai — risiko asumsi bentuk data yang keliru | Risiko rendah — component yang bergantung ke bentuk data resource spesifik dikerjakan berdasarkan kontrak Section 10 SAD yang sudah final, bukan spekulasi sambil jalan |

### 6.3 Catatan Penutup Dokumen

Dokumen Product Backlog ini (Section 1–6) menerjemahkan seluruh System Architecture Design menjadi **24 Epic dan 134 task**, terurut dalam 6 fase berdasarkan dependency teknis eksplisit, dengan Definition of Done yang terverifikasi objektif per 12 kategori kerja, serta seluruh open item dari SAD §23.2 terpetakan ke titik penanganannya masing-masing.

Dengan selesainya Dokumen 07, seluruh rangkaian **Design Artifacts WorkPulse (01–07)** — PDD, PRD, UI/UX Specification & Flow, Design System, System Architecture Design, dan Product Backlog — telah lengkap sebagai satu kesatuan rancangan yang saling terhubung, sesuai fase Perancangan pada Development Framework awal proyek ini.

---

