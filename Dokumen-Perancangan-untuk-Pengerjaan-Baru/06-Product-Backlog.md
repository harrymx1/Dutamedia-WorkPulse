# Product Backlog — WorkPulse

**Versi:** 1.2 (Terekonsiliasi Penuh DEC-011..013, Resolusi Audit Independen, Dekomposisi Task Oversized)
**Tanggal:** 28 Oktober 2026
**Acuan:** `05-SAD.md` v2.1.0 (termasuk Lampiran A & B), `02-PRD.md` v1.6, `03-UI-UX-Spec-Flow.md` v2.0.0, `04-Design-System.md` v1.5.0, 26 prototipe HTML, `DEC-001..013`, `Playbook-02`.

> **Pemisahan status informasi:**
> - **Fakta terdokumentasi:** Epic/Task diturunkan dari modul & endpoint SAD v2.1.0 dan nomor prototipe HTML kanonikal.
> - **Analisis/Rekomendasi:** Urutan fase, estimasi ukuran (S/M/L), dan pembagian subtask UI sesuai kapasitas tim 2 pengembang + AI.
> - **Keputusan disahkan:** DEC-001 s/d DEC-013 dicatat pada `00-Project-Continuity-and-Decision-Log.md`.

---

## 1. Struktur & Konvensi

Hierarki: `Epic → Feature → Task → Subtask`. ID format: `WP-EPxx-TKyyy` (3 digit angka konsisten).
Ukuran task: **S** (≤0.5 hari kerja), **M** (≤1.5 hari kerja), **L** (≤3 hari kerja; tidak ada task >3 hari atau bertanda `×N`).

**Definition of Done (berlaku untuk seluruh task; QA/QC terintegrasi sejak awal):**
1. Kode lulus lint + type-check + build tanpa error maupun warning yang ditekan.
2. Unit test untuk logika domain baru; coverage logika domain ≥80% (Playbook-02 §7.2).
3. Integration test untuk setiap endpoint / transaksi DB yang disentuh (menggunakan PostgreSQL nyata, bukan mock).
4. Acceptance Criteria (format Gherkin) terpenuhi dengan bukti eksekusi (log / test report) terlampir.
5. Untuk task antarmuka (UI): visual persis sesuai prototipe kanonikal; mencakup 7 UI state; navigasi keyboard & fokus; kontras WCAG 2.1 AA.
6. Peer review disetujui (*Four-Eyes Principle* antara Orang A dan Orang B; dilarang self-approval; AI dilarang menjadi single approver); tidak ada defect Sev 1 atau Sev 2 terbuka.
7. Dokumen perancangan (SAD / Spec / Backlog) diperbarui melalui mekanisme perubahan terkendali bila terdapat deviasi.

**Quality Gate per increment (Gate 4, Playbook-02):** seluruh task fase lulus DoD + seluruh test suite regresi fase sebelumnya berwarna hijau.

---

## 2. Fase Implementasi (Urutan & Rationale Rekayasa)

| Fase | Fokus | Epic | Alasan Urutan Rekayasa |
|---|---|---|---|
| **P0** | Fondasi & lingkungan | EP01 | Repo clean-slate, CI, DB, test environment harus ada sebelum fitur apa pun |
| **P1** | Identitas & organisasi | EP02, EP03 | Semua modul bergantung pada user, role, fungsi kanonikal, dan scope |
| **P2** | Inti akuntabilitas harian | EP04, EP05 | Nilai inti produk (Morning/EOD) + Policy engine yang dibaca keduanya |
| **P3** | Blocker & eskalasi | EP06 | Bergantung pada Org Authority & Project Authority Mapping |
| **P4** | Review & pengecualian | EP07 | Koreksi resmi, alur cuti, exemption, rekonsiliasi append-only `DEC-007` |
| **P5** | Kepatuhan, notifikasi, pelaporan | EP08, EP09, EP10 | Mengonsumsi data transaksi harian, outbox pattern, exception aggregation |
| **P6** | Hardening & kesiapan rilis | EP11 | Security audit, backup/restore drill, UAT, verifikasi register `OPEN-04` |
| **P-Post** | Individual review & evaluasi | EP12 | **Ditunda Pasca-Pilot (DEC-012, Milestone Fase 1.5)** menunggu persetujuan Direktur |

---

## 3. Epic & Task

### EP01 — Fondasi Proyek & Lingkungan (P0)
| ID | Task | Ukuran | Dependensi | Acceptance Criteria (ringkas) |
|---|---|---|---|---|
| WP-EP01-TK001 | Arsipkan `backend/` & `frontend/` lama ke `_Archive/Legacy-Codebase/` (DEC-006) | S | Persetujuan Gate 3 | Given Gate 3 disetujui When arsip dijalankan Then root bersih & isi arsip identik (hash) |
| WP-EP01-TK002 | Inisialisasi monorepo (NestJS, Vue 3 + Vite, TS strict, lint, format) | M | TK001 | Build & lint kosong hijau di CI |
| WP-EP01-TK003 | Docker Compose dev: PostgreSQL 16, MinIO (tanpa Redis, SAD Lampiran A.3) | M | TK002 | `docker compose up` → `/health/ready` 200 |
| WP-EP01-TK004 | Pipeline CI (lint, typecheck, unit, integration, build) | M | TK002 | PR gagal bila salah satu langkah merah |
| WP-EP01-TK005 | **Lingkungan uji**: DB test terisolasi, safety-check anti-hit-DB-produksi, seed/reset script, clock-injection (waktu server dapat di-mock) | M | TK003 | Reset+seed deterministik <60 dtk; test menolak jalan bila DB bukan test |
| WP-EP01-TK006 | Cross-cutting: response envelope, error catalog, request-id, Pino + redaction, health live/ready | M | TK002 | Test envelope & redaction lulus (SAD IV.2, VI.1–2) |
| WP-EP01-TK007 | Migrasi DB baseline + trigger `enforce_no_backdating` + `app.org_timezone` (SAD B.5) | M | TK003 | INSERT tanggal lampau ditolak; UPDATE `end_date` baris lama BERHASIL |

### EP02 — Autentikasi, Sesi & Undangan (P1) — Prototipe 01, 24, 25
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP02-TK001 | Skema `users`, `user_invitations`, `sessions` | M | EP01-TK007 | Migrasi + constraint teruji |
| WP-EP02-TK002 | Login, logout, cookie HttpOnly/Secure + CSRF double-submit, Argon2id | L | TK001 | Login salah 5x/menit → throttled; mutasi tanpa X-CSRF-Token → 403 |
| WP-EP02-TK003 | Aktivasi via token sekali pakai 72 jam (`/auth/activate`) | M | TK001 | Token dipakai ulang/kedaluwarsa/dicabut → ditolak |
| WP-EP02-TK004 | `/admin/users`: list, create, resend, revoke, status (DEC-005) | L | TK003, EP03-TK002 | Resend menghanguskan token lama; nonaktif mencabut semua sesi |
| WP-EP02-TK005 | Frontend UI Login+Aktivasi (01), Profil (24), User & Invitation (25) | L | TK002–004 | Sesuai prototipe; Esc menutup modal |
| WP-EP02-TK006 | Test keamanan auth (brute force, session revoke, CSRF, cookie flags) | M | TK002 | Laporan bukti terlampir |

### EP03 — Organisasi, Project Authority, Reviewer Sementara (P1) — Prototipe 15, 17
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP03-TK001 | Enum 10 fungsi kanonikal Dutamedia (DEC-009) & role enum | S | EP01-TK007 | Nilai enum persis sama dengan DEC-009 |
| WP-EP03-TK002 | Skema + service `organizational_assignments` (effective-dating, tutup baris lama) | L | TK001 | Penugasan baru menutup lama dalam satu transaksi |
| WP-EP03-TK003 | Deteksi siklus hierarki pelaporan | M | TK002 | A→B→A ditolak `BUSINESS_RULE_REPORTING_CYCLE` + jalur siklus |
| WP-EP03-TK004 | `project_authority_mappings` + endpoint list/create/end (tanpa input UUID manual) | M | TK002 | UI memilih orang via picker |
| WP-EP03-TK005 | `temporary_reviewer_assignments` + resolusi reviewer aktif | M | TK002 | Di luar rentang `effective..expiry` tidak berwenang |
| WP-EP03-TK006 | `ScopeResolverService` (Employee/Supervisor/Head/PM/Temporal) | L | TK002–005 | Matriks scope teruji termasuk akses lintas-scope → `AUTH_FORBIDDEN_SCOPE` |
| WP-EP03-TK007 | Frontend UI Org Mapping (15) & Temp Reviewer (17) | L | TK002–006 | Sesuai prototipe; backdating ditolak UI & server |

### EP04 — Policy Engine (P2) — Prototipe 18
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP04-TK001 | Skema `policies`, `policy_owner_assignments`, validator nilai per kategori | M | EP01-TK007 | Nilai tidak valid → 400 |
| WP-EP04-TK002 | `getActivePolicySnapshot(categories, date)` | M | TK001 | Mengembalikan versi berlaku pada tanggal itu |
| WP-EP04-TK003 | Endpoint policy + `PolicyOwnerGuard` | M | TK002, EP03-TK006 | Non-owner kategori → 403 |
| WP-EP04-TK004 | Frontend UI Policy Settings (18) | M | TK003 | Sesuai prototipe |
| WP-EP04-TK005 | **Seed parameter ilustratif bertanda `is_illustrative = TRUE` (DEC-011, SAD B.1)** | S | TK001 | Seed ditandai jelas sebagai contoh; rilis diblokir bila TRUE |

### EP05 — Akuntabilitas Harian (P2) — Prototipe 02, 03, 04, 06
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP05-TK001 | Skema DDL `daily_accountability_records`, `commitments` (dengan `origin_commitment_id`, `carry_over_days_count`, tanpa `project_code`), `additional_works`, dan constraint FR-09/10 | L | EP04-TK002 | Constraint 1–3, zero-reason, continuation-reason wajib (FR-09), final_status_explanation wajib (FR-10), origin integrity teruji |
| WP-EP05-TK002 | Kalkulator timing (On-Time/Late/Locked; DEC-002) dengan clock injection; `GracePeriod=0` valid (`??`) | M | TK001 | Batas persis `=deadline` On-Time, `=cutoff` Late, `>cutoff` ditolak tanpa write |
| WP-EP05-TK003 | Morning check-in 0–3 komitmen + zero reason (DEC-004) + initial status worst-of | L | TK002 | 0 komitmen tanpa alasan → 422 |
| WP-EP05-TK004 | Copy-forward FR-11: sumber dari `previousWorkday` (non-holiday, non-leave; kosong bila NoSub), rantai ID `origin_commitment_id`, penambahan `carry_over_days_count = parent + 1` (DEC-013, SAD B.2) | M | TK003 | Item eligible semua muncul; AdditionalWork tidak ikut; counter carry-over deterministik |
| WP-EP05-TK005 | Additional Work | M | TK003 | Alasan `NEWLY_ASSIGNED` wajib `assignedBy` |
| WP-EP05-TK006 | EOD check-in + validasi outcome/continuation + rekomendasi min AMBER carry-over ≥2 hari (AC-38), validasi wajib `final_status_explanation` jika AMBER/RED (FR-10); GREEN tidak pernah di-disable (DEC-003) | L | TK003 | Override dengan alasan tercatat di audit; GREEN selalu dapat dipilih |
| WP-EP05-TK007 | Audit transaksional (perubahan material + audit_logs satu transaksi) | M | TK003 | Gagal audit → rollback data |
| WP-EP05-TK008 | History & weekly summary scope-filtered | M | EP03-TK006 | Employee hanya data sendiri |
| WP-EP05-TK009 | Frontend UI 02 (Morning Commitment) & UI 03 (Additional Work) — draft auto-save, countdown waktu server, placeholder 10 fungsi (DEC-009) | L | TK003–005 | Sesuai prototipe 02 & 03; server clock authoritative; keyboard accessible |
| WP-EP05-TK010 | Frontend UI 04 (EOD Outcome & Status Suggestion) & UI 06 (Personal Daily History) — modal dialog konfirmasi override, 7 state UI | L | TK006–008 | Sesuai prototipe 04 & 06; modal konfirmasi override deterministik |
| WP-EP05-TK011 | Quality warning komitmen generik (FR-63): non-blocking, kamus kata di kode (GAP-B) | S | TK003 | Submit tetap valid; warning tampil; tidak ada penilaian otomatis |
| WP-EP05-TK012 | Tomorrow Priority (FR-52): simpan di EOD, tampil terpisah di Morning berikutnya, tidak memengaruhi draft FR-11 / initial status | S | TK006 | Draft copy-forward identik dengan/ tanpa Tomorrow Priority |
| WP-EP05-TK013 | E2E: Morning→EOD happy path + cutoff boundary + zero commitment | M | TK009, TK010 | Laporan E2E terlampir |

### EP06 — Blocker, Support & Eskalasi (P3) — Prototipe 05, 09, 13, 14
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP06-TK001 | Skema `blocker_tickets` (wajib project_code bila Project Authority, SAD B.3), `support_contributions`, `evidence_attachments` | M | EP03-TK004 | Constraint resolve/accept-risk & project requirement teruji |
| WP-EP06-TK002 | State machine blocker + resolusi owner (org vs project authority) | L | TK001 | Transisi ilegal ditolak |
| WP-EP06-TK003 | Endpoint raise/acknowledge/resolve/accept-risk/close/support | L | TK002 | `SELECT FOR UPDATE` mencegah double-transition |
| WP-EP06-TK004 | Two-phase upload bukti (pre-signed, whitelist MIME, ≤10MB) | L | EP01-TK003 | File `.exe` ditolak |
| WP-EP06-TK005 | Worker SLA auto-escalation idempoten | M | TK003, EP04-TK002 | Job dijalankan 2× → 1 eskalasi per level |
| WP-EP06-TK006 | Frontend UI 05 (Raise Instant Blocker) & UI 09 (Blocker Escalation Queue) — Authority Context picker (DEC-013, wajib project_code jika Project Authority) | L | TK003–005 | Sesuai prototipe 05 & 09; validasi konteks otoritas tepat |
| WP-EP06-TK007 | Frontend UI 13 (Authority Blocker Resolution / Accept Risk) & UI 14 (Aging & Escalation History) — two-phase upload evidence preview | L | TK003–005 | Sesuai prototipe 13 & 14; timeline aging presisi |
| WP-EP06-TK008 | Integration test race (acknowledge vs auto-escalate) | M | TK005 | Tidak ada state ganda |

### EP07 — Koreksi, Cuti, Exemption (P4) — Prototipe 16a/b, 20, 21, 22, 12
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP07-TK001 | Skema `correction_requests`, `leave_requests`, `bounded_exemptions`, `company_holidays` | M | EP05-TK001 | Migrasi skema P4 teruji |
| WP-EP07-TK002 | Correction Morning/EOD: klasifikasi Minor/Material, objection window, worker auto-apply | L | TK001, EP04-TK002 | Material tanpa keberatan → applied setelah window |
| WP-EP07-TK003 | Leave request + approval queue | M | TK001, EP03-TK006 | Hanya reviewer berwenang |
| WP-EP07-TK004 | **Rekonsiliasi cuti pasca-cutoff (DEC-007)**: update status, audit `Superseded by Approved Leave`, flag compliance event (tidak dihapus) | L | TK001, TK003 | Hari ditandai Approved Leave & tidak dihitung ke ambang 3× |
| WP-EP07-TK005 | Exemption & holiday | M | TK001 | Hari exempt dikecualikan dari No Submission |
| WP-EP07-TK006 | Frontend UI 16a & 16b (Correction Request Morning & EOD) dan UI 22 (Review Koreksi & Cuti) — visual diff Minor vs Material | L | TK002–004 | Sesuai prototipe 16a, 16b, 22; diff visual before/after jelas |
| WP-EP07-TK007 | Frontend UI 20 (Leave Request), UI 21 (Bounded Exemption), dan UI 12 (Holiday Calendar) — date picker anti-backdating | L | TK003–005 | Sesuai prototipe 20, 21, 12; kalender libur sinkron |

### EP08 — Kepatuhan & Manager Note (P5) — Prototipe 10, 11
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP08-TK001 | Skema `compliance_events`, `manager_notes` + visibilitas | M | EP05-TK001 | Migrasi tabel kepatuhan teruji |
| WP-EP08-TK002 | Worker cutoff-lock + No Submission (urutan: lock sebelum evaluasi) | L | EP05-TK002, EP07-TK005 | Idempoten; mengecualikan leave/holiday/exemption |
| WP-EP08-TK003 | Worker pattern flag 3× dalam coaching window (satu flag per episode) | M | TK002 | Tidak duplikat |
| WP-EP08-TK004 | Aksi manual coach / record-warning / escalate-formal (tidak pernah otomatis) | M | TK003 | Role tepat per tahap |
| WP-EP08-TK005 | Frontend UI 10 (Compliance Tracking) & UI 11 (Manager Note) | M | TK004 | Sesuai prototipe 10 & 11 |

### EP09 — Notifikasi & Audit (P5) — Prototipe 07, 19
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP09-TK001 | Skema notifications (outbox QUEUED/SENT/FAILED, retry ≤5); Email via Brevo; Web Push VAPID yang benar-benar terkirim (FR-38); in-app center | L | EP01-TK006 | Idempotensi per (trigger, entity, channel); push nyata diterima di browser uji |
| WP-EP09-TK002 | Query reminder `NOT EXISTS` (anti-starvasi), 60 menit sebelum deadline | M | TK001 | Batch >200 user tanpa user terlewat |
| WP-EP09-TK003 | Channel setup admin (19): status kesiapan Email/Push, uji kirim, matriks trigger (tanpa Telegram, PRD: future) | M | TK001 | Mode degraded tampil bila kirim gagal |
| WP-EP09-TK004 | Notification Center UI (07), audit-log read endpoint | M | TK001 | Sesuai prototipe 07 |

### EP10 — Pulse Dashboard & Reports (P5) — Prototipe 08, 23
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP10-TK001 | Query agregasi exception-first, scope-filtered | L | EP05–EP08 | Tidak ada leaderboard individu |
| WP-EP10-TK002 | Export dengan signed URL TTL kebijakan (1–60 mnt) | M | TK001 | TTL di luar batas ditolak |
| WP-EP10-TK003 | Frontend UI 08 (Pulse Dashboard) & UI 23 (Executive Reports) | L | TK001–002 | Sesuai prototipe 08 & 23 |
| WP-EP10-TK004 | Benchmark performa (P95 ≤500 ms agregasi pada data uji 50 user) | M | TK001 | Laporan terukur memenuhi target NFR-03 |

### EP11 — Hardening & Kesiapan Rilis (P6)
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP11-TK001 | Backup streaming `pg_dump` + **restore drill** terbukti | M | EP01 | Restore ke lingkungan baru sukses; RTO/RPO diukur |
| WP-EP11-TK002 | Regression penuh + E2E seluruh alur kritis | L | semua | 100% pass |
| WP-EP11-TK003 | Security review (OWASP checklist, dependency audit) | L | semua | Tidak ada High/Critical terbuka |
| WP-EP11-TK004 | Audit aksesibilitas & kesesuaian 26 prototipe | L | EP02–EP10 UI | Daftar deviasi dengan bukti |
| WP-EP11-TK005 | UAT bersama Harry/manajemen + pengesahan Launch Configuration Register oleh Direktur (`OPEN-04`, `DEC-011`) | M | TK002 | Persetujuan tertulis Direktur |
| WP-EP11-TK006 | Release readiness review (Gate 5) | S | TK001–005 | Checklist ditandatangani |

### EP12 — Individual Review Evidence & Rating (FR-56..59) — **DITUNDA PASCA-PILOT (DEC-012, Milestone Fase 1.5)**
Sesuai **DEC-012**, fitur Individual Review Evidence & Rating kualitatif (`Strong/Meets/Needs Improvement/Unacceptable`) **tidak masuk rilis pilot MVP**. Pilot difokuskan pada mesin harian dan penyelesaian blocker (EP01–EP11). Pelaksanaan EP12 dijadwalkan pasca-pilot dengan syarat: (1) Persetujuan tertulis Direktur, (2) Perancangan prototipe UI (layar 27–28) dan audit Playbook-01 (mini-Gate 1), (3) Pembekuan DDL `review_records` sebelum koding dimulai, (4) Larangan mutlak auto-rating / kalkulasi skor kinerja otomatis (FR-60..62).
| ID | Task | Ukuran | Dep | AC ringkas |
|---|---|---|---|---|
| WP-EP12-TK001 | Desain & prototipe HTML kanonikal Individual Review Evidence (layar 27–28) (+ audit Playbook-01) | L | Pengesahan Direktur | Prototipe lulus 8 dimensi Playbook-01; mini-Gate 1 disahkan |
| WP-EP12-TK002 | Skema DDL `review_records` (SAD Lampiran A.6) + service + endpoint scope-enforced | M | TK001, EP10 | Rating tidak pernah terhitung otomatis; role-based isolation teruji |
| WP-EP12-TK003 | Frontend UI implementasi layar review — pemisahan fakta log, Manager Note, dan penilaian (AC-68) | L | TK002 | Sesuai prototipe 27–28; input rating mandiri manusia |
| WP-EP12-TK004 | Test suite otomatis: permission check, larangan auto-rating, fair-use FR-60..62 | M | TK002 | 100% negative test lolos; bukti terlampir |

---

## 4. Matriks Dependensi Antar-Epic
`EP01 → EP02/EP03 → EP04 → EP05 → (EP06, EP07) → EP08 → (EP09, EP10) → EP11`.

---

## 5. Keterlacakan Keputusan → Task
| Keputusan | Task Penanggung Jawab |
|---|---|
| DEC-002 | WP-EP05-TK002, WP-EP07-TK002, WP-EP08-TK002 |
| DEC-003 | WP-EP05-TK006 |
| DEC-004 | WP-EP05-TK003, WP-EP05-TK004 |
| DEC-005 | WP-EP02-TK004, WP-EP02-TK005 |
| DEC-006 | WP-EP01-TK001 |
| DEC-007 | WP-EP07-TK004 |
| DEC-008 | WP-EP01-TK007, WP-EP03-TK007, WP-EP04-TK001 |
| DEC-009 | WP-EP03-TK001, WP-EP05-TK009 |
| DEC-011 | WP-EP04-TK005, WP-EP11-TK005 (Launch Configuration Register disahkan Direktur) |
| DEC-012 | WP-EP12-TK001, WP-EP12-TK002, WP-EP12-TK003, WP-EP12-TK004 (Penundaan FR-56..59 pasca-pilot) |
| DEC-013 | WP-EP05-TK001, WP-EP05-TK004, WP-EP05-TK006, WP-EP06-TK001, WP-EP06-TK006 (Filter Proyek, Previous Workday, Origin ID Chain) |

---

## 6. Aktivitas QA/QC Terintegrasi per Fase
- Tiap task: unit + integration + AC bukti (DoD).
- Akhir tiap fase P0–P5: regression suite fase tersebut + Gate 4 review.
- P6: aktivitas lintas-sistem (EP11).
Detail kasus uji: `07-Test-Plan.md`; proses & metrik: `08-QA-QC-Guide.md`.

---

## 7. Risiko Delivery
| Risiko | Mitigasi |
|---|---|
| Nilai kebijakan produksi belum disahkan (OPEN-04) | Placeholder bertanda `is_illustrative = TRUE`; blokir UAT/rilis hingga disahkan Direktur |
| 26 halaman UI = beban frontend tim 2 orang | Komponen bersama dari Design System di EP01/EP02 lebih dulu; task UI dipecah per 2 prototipe (maks 3 hari) |
| Race job worker vs aksi manual | `SELECT FOR UPDATE` + test race (WP-EP06-TK008) |
| Jam server/NTP drift | Clock injection + monitoring drift pada DB dan server app |

---

## 8. Ukuran Total (Estimasi Kasar Rekayasa)
Total 73 task (6 S, 41 M, 26 L). Seluruh task berukuran ≤3 hari kerja (tanpa task `×N`). Kalender peluncuran dikalibrasi secara empiris berdasarkan kecepatan riil tim 2 pengembang + AI setelah 2 task pertama selesai.

---

## 9. Status Open Items & Keputusan Rekonsiliasi
| ID | Masalah | Status | Tindakan / Hasil |
|---|---|---|---|
| **BL-OPEN-01** | Pemetaan FR/AC per task terhadap `02-PRD.md` v1.6 | **SELESAI (RESOLVED)** | Keterlacakan 100% tuntas dipetakan ke seluruh task di Bagian 10. |
| **BL-OPEN-02** | `evidence_attachments` ada di ERD SAD tanpa DDL | **SELESAI (RESOLVED)** | Skema DDL lengkap ditambahkan di `05-SAD.md` Lampiran A.2. |
| **BL-OPEN-03** | Channel Telegram & Redis/BullMQ vs PRD/prototipe 19 | **SELESAI (RESOLVED)** | Telegram dihapus dari enum (PRD: *future consideration*); Redis diganti `@nestjs/schedule` + PG advisory lock + outbox table (`05-SAD.md` Lampiran A.3). |
| **BL-OPEN-04** | Ketersediaan versi library modern | **SELESAI (RESOLVED)** | Versi dependensi diverifikasi via npm registry (`05-SAD.md` Lampiran A.4); aturan pin versi stabil (Prisma 7.x). |
| **GAP-A** | FR-56..59 (Individual Review Evidence + Rating kualitatif) | **DITUNDA PASCA-PILOT (DEC-012)** | Ditunda ke Fase 1.5 pasca-pilot. Backlog menampung di EP12; implementasi menunggu persetujuan tertulis Direktur dan perancangan UI 27–28. |
| **GAP-B/C/D** | FR-63 (Quality warning generik), FR-37 (Filter project), Widget dashboard | **TERAKOMODASI (DEC-013)** | Ditangani di `WP-EP05-TK011`. Filter proyek FR-37 diterapkan pada Blocker dan Project Authority View (tanpa kolom project_code pada commitments; SAD B.3). |
| **OPEN-04** | Launch Configuration Register resmi | **IN-PROGRESS (DEC-011)** | Pemilik Kebijakan disahkan: **Direktur**. Nilai ilustratif aktif selama P0–P5 (`is_illustrative = TRUE`); pengesahan register produksi wajib sebelum UAT (`WP-EP11-TK005`) & Gate 5. |
| **OPEN-05** | Hosting & domain resmi produksi | **OPEN** | Ditetapkan sebelum staging `WP-EP01-TK003` & rilis `EP11`. |

---

## 10. Matriks Keterlacakan Lengkap Requirement PRD v1.6 → Backlog Task

| Kode Requirement PRD | Deskripsi Ringkas Kebutuhan | Backlog Task Penanggung Jawab |
|---|---|---|
| **FR-01, FR-50, FR-54** | Akun pengguna, login kredensial, dan siklus undangan token aktivasi 72 jam | `WP-EP02-TK001`, `WP-EP02-TK002`, `WP-EP02-TK003`, `WP-EP02-TK004`, `WP-EP02-TK005`, `WP-EP02-TK006` |
| **FR-02, FR-23, FR-24, FR-25** | Snapshot konteks organisasi, effective-dating struktur, dan pendelegasian reviewer | `WP-EP03-TK001`, `WP-EP03-TK002`, `WP-EP03-TK003`, `WP-EP03-TK004`, `WP-EP03-TK005`, `WP-EP03-TK006`, `WP-EP03-TK007`, `WP-EP05-TK001` |
| **FR-03, FR-04, FR-51** | Morning Check-in 0–3 komitmen, alasan wajib zero commitment, Known Blocker, initial status worst-of | `WP-EP05-TK001`, `WP-EP05-TK003`, `WP-EP05-TK009` |
| **FR-05, FR-26** | Klasifikasi waktu On-Time vs Late, penolakan pasca Cut-Off tanpa write data (`DEC-002`) | `WP-EP05-TK002`, `WP-EP05-TK009` |
| **FR-06, FR-07** | Pencatatan Additional Work di siang hari terpisah dari komitmen baseline 1–3 | `WP-EP05-TK001`, `WP-EP05-TK005`, `WP-EP05-TK009` |
| **FR-08, FR-09, FR-10** | EOD Outcome, field terpisah Continuation (`Continue/Do Not Continue`), Final Status + alasan | `WP-EP05-TK001`, `WP-EP05-TK006`, `WP-EP05-TK010` |
| **FR-11, FR-52** | Koleksi draf Copy-Forward dari komitmen `Continue` hari sebelumnya; pemisahan Tomorrow Priority | `WP-EP05-TK004`, `WP-EP05-TK012` |
| **FR-12** | Role-Based Output Prompt 10 fungsi kanonikal resmi Dutamedia (`DEC-009`) | `WP-EP03-TK001`, `WP-EP05-TK009` |
| **FR-13, FR-14** | Heuristik saran status EOD (rekomendasi min AMBER untuk carry-over $\ge 2$ hari, GREEN tidak di-lock) | `WP-EP05-TK006`, `WP-EP05-TK010` |
| **FR-15, FR-16, FR-17, FR-18, FR-19, FR-19a/b/c** | Siklus hidup tiket Blocker (Open, Acknowledged, InProgress, Resolved, Closed, AcceptedRisk), Authority Context | `WP-EP06-TK001`, `WP-EP06-TK002`, `WP-EP06-TK003`, `WP-EP06-TK004`, `WP-EP06-TK006`, `WP-EP06-TK007`, `WP-EP06-TK008` |
| **FR-20, FR-21** | Notifikasi eskalasi SLA blocker otomatis ke level berikutnya | `WP-EP06-TK005`, `WP-EP06-TK008` |
| **FR-22** | Manajemen pengguna, role, fungsi, deaktivasi instan | `WP-EP02-TK004`, `WP-EP03-TK002` |
| **FR-27, FR-46, FR-48** | Pengecualian hari kerja (Leave, Holiday, Bounded Exemption) dari deteksi No Submission | `WP-EP07-TK005`, `WP-EP07-TK007`, `WP-EP08-TK002` |
| **FR-28** | Pengingat otomatis tepat 60 menit sebelum On-Time Deadline (anti-starvasi `NOT EXISTS`) | `WP-EP09-TK002` |
| **FR-29, FR-49, FR-70, FR-71, FR-72, FR-73** | Deteksi pola 3x No Submission dalam coaching window (maks 1x/hari), tindak lanjut coaching manual non-otomatis | `WP-EP08-TK002`, `WP-EP08-TK003`, `WP-EP08-TK004`, `WP-EP08-TK005` |
| **FR-30, BR-05, BR-06** | Larangan penerbitan SP / sanksi otomatis | `WP-EP08-TK004` (Enforced via architecture) |
| **FR-31, FR-32, FR-33, FR-34, FR-35** | Policy engine ber-versi, pembatasan Authorized Policy Owner per kategori, aturan partisipasi | `WP-EP04-TK001`, `WP-EP04-TK002`, `WP-EP04-TK003`, `WP-EP04-TK004`, `WP-EP04-TK005` |
| **FR-36, FR-37** | My History, pencarian & filter berdasarkan karyawan, fungsi, tanggal, dan proyek (Blocker/PA) | `WP-EP05-TK008`, `WP-EP05-TK010`, `WP-EP06-TK006` |
| **FR-38** | Notifikasi nyata Email (Brevo) dan Browser Push (Web Push VAPID) serta Web Notification Center | `WP-EP09-TK001`, `WP-EP09-TK003`, `WP-EP09-TK004` |
| **FR-39, FR-40** | Catatan pembinaan manajer (`ManagerNote`) dengan hak visibilitas terisolasi | `WP-EP08-TK001`, `WP-EP08-TK004`, `WP-EP08-TK005` |
| **FR-41, FR-65, FR-66, FR-67, FR-68, FR-69** | Pulse Dashboard, Weekly Summary, Monthly Executive Trend (tanpa leaderboard) | `WP-EP05-TK008`, `WP-EP10-TK001`, `WP-EP10-TK003`, `WP-EP10-TK004` |
| **FR-42** | Ekspor laporan dengan signed URL terenkripsi dan TTL dinamis 1–60 menit | `WP-EP10-TK002` |
| **FR-43, FR-44, FR-45, FR-53, FR-55** | Koreksi resmi komitmen pagi dan EOD (Minor auto-apply vs Material dengan objection window) | `WP-EP07-TK001`, `WP-EP07-TK002`, `WP-EP07-TK006` |
| **FR-47** | Alur persetujuan cuti (`LeaveRequest`) dan rekonsiliasi otomatis pasca cutoff (`DEC-007`) | `WP-EP07-TK003`, `WP-EP07-TK004`, `WP-EP07-TK006` |
| **FR-56, FR-57, FR-58, FR-59** | Individual Review Evidence & penilaian kualitatif Performance Transition Framework | `WP-EP12-TK001`, `WP-EP12-TK002`, `WP-EP12-TK003`, `WP-EP12-TK004` (Ditunda Pasca-Pilot DEC-012) |
| **FR-60, FR-61, FR-62** | Batasan integritas non-KPI (bukan kalkulator insentif otomatis, larangan auto-scoring) | `WP-EP10-TK001`, `WP-EP12-TK004` (Negative automated checks) |
| **FR-63** | Quality warning kontekstual untuk komitmen yang terlalu abstrak/generik | `WP-EP05-TK011` |
| **FR-64** | Pencatatan kontribusi bantuan silang fungsi (`SupportContribution`) pada blocker | `WP-EP06-TK001`, `WP-EP06-TK003`, `WP-EP06-TK007` |
| **NFR-01** | Responsiveness & Mobile Friendly (360px–1440px) | `WP-EP05-TK009`, `WP-EP05-TK010`, `WP-EP11-TK004` |
| **NFR-02** | Accessibility WCAG 2.1 AA (kontras 4.5:1, keyboard navigasi, screen reader) | `WP-EP05-TK009`, `WP-EP05-TK010`, `WP-EP11-TK004` |
| **NFR-03** | Performance Response Time (P95 transaksional <200ms, agregasi <500ms beban 50 user) | `WP-EP01-TK006`, `WP-EP10-TK004` |
| **NFR-04** | Availability & Reliability ≥99% uptime per bulan kalender | `WP-EP01-TK003`, `WP-EP11-TK006` |
| **NFR-05** | Security Authentication & Session Management (Argon2id, HttpOnly, CSRF token) | `WP-EP02-TK002`, `WP-EP02-TK006`, `WP-EP11-TK003` |
| **NFR-06** | Data Integrity, Append-Only Audit & Anti-Backdating Triggers | `WP-EP01-TK007`, `WP-EP05-TK007` |
| **NFR-07** | Backup & Disaster Recovery (Streaming pg_dump, drill restore berkala) | `WP-EP11-TK001` |
| **NFR-08** | Browser Compatibility (Chrome, Firefox, Safari, Edge versi modern) | `WP-EP11-TK004` |
| **NFR-09** | Jam Layanan Operasional Sistem (Sesuai parameter kebijakan terkonfigurasi) | `WP-EP04-TK002`, `WP-EP11-TK005` |
| **NFR-10** | Concurrency & Race-Condition Safeguards (Pessimistic locking SELECT FOR UPDATE) | `WP-EP06-TK003`, `WP-EP06-TK008` |
| **NFR-11** | Exportability & Signed URL Security (TTL 1–60 menit, scope isolated) | `WP-EP10-TK002` |
| **NFR-12** | Observability & Structured Logging (Request ID, Pino JSON logs, audit trail) | `WP-EP01-TK006` |
| **Fondasi & Enabler** | Clean-Slate Codebase, Monorepo, Docker Compose, CI Pipeline, Isolated Test DB, E2E Suite (`DEC-006`) | `WP-EP01-TK001`, `WP-EP01-TK002`, `WP-EP01-TK003`, `WP-EP01-TK004`, `WP-EP01-TK005`, `WP-EP05-TK013`, `WP-EP11-TK002` |

---

## 11. Model Tata Kelola Tim Pelaksana (2 Pengembang + Agent AI)

Berlandaskan penetapan Harry bahwa tim inti beranggotakan **2 orang manusia yang dibantu oleh Agent AI**, tata kelola pembagian peran dirancang agar ramping, efektif, dan saling mengontrol:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIM PELAKSANA WORKPULSE                              │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Peran Anggota Tim        │ Lingkup Tanggung Jawab Teknis               │
├──────────────────────────┼─────────────────────────────────────────────┤
│ **Orang A (Lead Backend  │ - Arsitektur database, migrasi DDL, trigger │
│   & Keamanan / DevOps)** │ - Service domain, guard otorisasi, worker   │
│                          │ - Code review PR frontend & evaluasi DoD    │
├──────────────────────────┼─────────────────────────────────────────────┤
│ **Orang B (Lead Frontend │ - Komponen Vue 3, Pinia store, TanStack     │
│   & QA / QC Lead)**      │ - Pengujian E2E Playwright & WCAG 2.1 AA    │
│                          │ - Code review PR backend & verifikasi DoD   │
├──────────────────────────┼─────────────────────────────────────────────┤
│ **Agent AI               │ - Penulisan draf kode boilerplates & DTO    │
│   (Pair-Programmer)**    │ - Penyusunan unit test & skenario integrasi │
│                          │ - Audit kepatuhan berkas terhadap SAD & DS  │
│                          │ *(Catatan: AI DILARANG menjadi single       │
│                          │  approver pada Pull Request apapun)*        │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Aturan Operasional Tim Berdua:
1. **Four-Eyes Principle (Prinsip Dua Pasang Mata):** Orang A yang menulis kode backend wajib di-review dan disetujui (*approved*) oleh Orang B sebelum di-merge ke branch utama, dan sebaliknya.
2. **Peran Agent AI:** Agent AI bertindak sebagai akselerator koding. Seluruh keluaran kode dari AI harus diverifikasi secara nyata oleh pengembang manusia dengan menjalankan unit test dan memeriksa log mentah eksekusi.
3. **Penyelarasan SLA Defect:** SLA perbaikan defect pada `08-QA-QC-Guide.md` dikalibrasi realistis untuk tim 2 orang:
   - Severity 1 (Blocker): Tanggap dan investigasi $\le 4$ jam kerja; perbaikan darurat $\le 8$ jam kerja.
   - Severity 2 (Critical): Perbaikan $\le 1$ hari kerja (24 jam).
   - Severity 3 (Major): Perbaikan dalam iterasi/fase berjalan.
   - Severity 4 (Minor): Prioritas backlog sprint berikutnya.
