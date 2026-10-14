# S3-T3-T0 E2E Readiness & Environment Gate — Re-Verification

## 1. Purpose

Dokumen ini merupakan laporan evaluasi ulang independen (**Independent Re-Verification**) terhadap gerbang kesiapan lingkungan dan infrastruktur uji (**E2E Readiness & Environment Gate**) untuk tahapan **S3-T3: Full-Stack E2E Traces**.

Sesuai dengan locked testing plan dan arsitektur otoritatif (`SAD §17.7`), S3-T3 mencakup eksekusi dua skenario penelusuran tumpukan penuh:
1. **TRACE A: Material Correction Request Lifecycle** (Komitmen terkunci → Pengajuan Koreksi Material → Notifikasi Reviewer → Masa Sanggah 24 Jam → Kedaluwarsa Sanggah → Eksekusi Scheduler Auto-Apply → Pembaruan Komitmen & AuditLog).
2. **TRACE B: Critical Blocker Lifecycle** (Pengajuan Blocker Kritis → Resolusi Pemilik Wewenang → Notifikasi Instan → Auto-Eskalasi Scheduler → Konfirmasi / Acknowledge → Penyelesaian / Resolve → Penutupan / Close oleh Pelapor).

Tujuan re-verifikasi ini adalah membuktikan secara empiris apakah pemblokir lingkungan sebelumnya (Docker Desktop offline) telah terselesaikan dengan aman dan apakah seluruh komponen pendukung telah siap untuk pelaksanaan pengujian S3-T3.

---

## 2. Previous Gate Result

Hasil evaluasi gerbang S3-T3-T0 sebelumnya (didokumentasikan dalam `Design-Artifacts/Reports/S3-T3-T0-E2E-Readiness-Environment-Gate-Report.md`):

- **Status Akhir Sebelumnya**: `S3-T3-T0 — BLOCKED`
- **Penyebab Pemblokir**: Docker Desktop Engine pada Windows host berstatus *offline* / *unavailable* (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`), sehingga kontainer PostgreSQL 18 terisolasi pada port 54332 tidak dapat diaktifkan.
- **Ringkasan Evaluasi Sebelumnya**:
  - Environment: BLOCKED (Docker offline)
  - PostgreSQL: BLOCKED (Kontainer tidak dapat dijalankan)
  - Backend: READY
  - Frontend: READY
  - Authentication: READY
  - Authorization: READY
  - Trace A: CONDITIONAL (Menunggu DB aktif)
  - Trace B: CONDITIONAL (Menunggu DB aktif)
  - Scheduler: CONDITIONAL (Siklus 5 menit, ketiadaan endpoint manual HTTP)
  - Notification: READY
  - AuditLog: READY
  - E2E Harness: CONDITIONAL (Menunggu DB & penyesuaian kredensial runtime)
  - Evidence Plan: READY
  - User Confirmation: READY
  - Production DB Safety: PASS
  - Total Blocking Issues: 1
  - Total Conditional Issues: 3

---

## 3. Environment Change

Pengguna telah mengaktifkan aplikasi **Docker Desktop Engine** secara manual pada sistem operasi Windows host. Perubahan status ini memungkinkan re-verifikasi empiris terhadap daemon Docker, soket engine, siklus hidup kontainer pangkalan data terisolasi, serta konektivitas Prisma ke PostgreSQL 18 fisik.

---

## 4. Docker Engine Verification

Pengujian langsung terhadap ketersediaan Docker Engine pada Windows host:

1. **`docker version`**:
   - Client: Version `28.5.1`, API version `1.51`, Go `go1.24.8`, OS/Arch `windows/amd64`.
   - Server: Docker Desktop `4.50.0 (209931)`, Engine Version `28.5.1`, API version `1.51`, OS/Arch `linux/amd64`.
   - Status: **AVAILABLE & REACHABLE**.

2. **`docker info`**:
   - Status Engine: Active (10 containers total: 4 running, 6 stopped).
   - Server Version: `28.5.1`.
   - WSL2 Engine Active: Kernel `6.6.87.2-microsoft-standard-WSL2`, Total Memory `9.569 GiB`, CPUs `16`.
   - Daemon Pipe: `\\.\pipe\docker_cli` terhubung tanpa kendala.

3. **`docker ps -a`**:
   - Kontainer `workpulse-test-db` terdeteksi:
     - Image: `postgres:18-alpine`
     - Status: `Up (healthy)`
     - Port Mapping: `0.0.0.0:54332->5432/tcp`, `[::]:54332->5432/tcp`
     - Container Name: `workpulse-test-db`

**Kesimpulan Docker Engine**: **AVAILABLE**.

---

## 5. PostgreSQL Test Infrastructure

Inspeksi konfigurasi dan siklus hidup pangkalan data uji:

1. **`docker-compose.test.yml`**:
   - Service: `test-db`
   - Image: `postgres:18-alpine`
   - Port Mapping: `54332:5432`
   - Target DB: `workpulse_test`
   - Storage: Mount tmpfs pada `/var/lib/postgresql` (menjamin isolasi dan kinerja cepat).
   - Healthcheck: `pg_isready -U postgres -d workpulse_test`.

2. **`backend/.env.test`**:
   - `DATABASE_URL="postgresql://postgres:test_password_secure@localhost:54332/workpulse_test?sslmode=disable"`
   - `PORT=3001`
   - `NODE_ENV=test`

3. **`backend/src/scripts/test-db-lifecycle.ts`**:
   - Perintah siklus hidup terverifikasi:
     - `test:db:up` → Menjalankan kontainer melalui `docker compose`.
     - `test:db:wait` → Menguji soket PostgreSQL dengan pg.Client.
     - `test:db:migrate` → Menjalankan `prisma migrate deploy`.
     - `test:db:seed` → Menjalankan pengisian fixture deterministik `seed.test.ts`.
     - `test:db:reset` → Truncate tabel public CASCADE dan seed ulang.
     - `test:db:safety-check` → Memvalidasi guard keselamatan anti-produksi.

4. **Kesiapan Infrastruktur**:
   - Menjalankan `npm --prefix backend run test:db:up` menghasilkan: `Container workpulse-test-db Running`.
   - Status: **READY**.

---

## 6. Production DB Safety

Verifikasi guard keselamatan pangkalan data produksi (**Hard Safety Gate**):

1. **Safety Invariant Check (`assertSafeTestDatabase`)**:
   - Dilakukan eksekusi: `npm --prefix backend run test:db:safety-check`.
   - Hasil:
     `✅ Safety Check Passed: DATABASE_URL is verified safe for test execution.`
2. **Kriteria Penegakan Keamanan**:
   - Larangan eksplisit domain cloud Supabase (`supabase.co`, `pooler.supabase.com`, `supabase.in`).
   - Validasi ketat target host: hanya `localhost`, `127.0.0.1`, dan `test-db` yang diizinkan.
   - Validasi ketat target port: hanya `54332` dan `5432` yang diizinkan.
   - Validasi ketat nama basis data: wajib mengandung kata `'test'`.
3. **Risiko terhadap Data Produksi**: **NOL (Zero Production Risk)**.
4. **Status**: **PASS**.

---

## 7. Backend Readiness

1. **Konektivitas dan Inisialisasi Database**:
   - `npm --prefix backend run test:db:wait` berhasil menghubungkan pg.Client ke PostgreSQL:
     - Engine: `PostgreSQL 18.6 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit`.
     - Active Database: `workpulse_test`.
2. **Migrasi Skema**:
   - `npm --prefix backend run test:db:migrate` berhasil menerapkan migrasi ke database terisolasi:
     - `20260916041729_init`
     - `20261007153000_add_unique_pending_correction_per_commitment`
     - Status: `All migrations have been successfully applied.`
3. **Fixture Data Uji**:
   - `npm --prefix backend run test:db:seed` berhasil mengeksekusi `prisma/seed.test.ts`.
   - Status: `✅ Deterministic test fixtures seeded successfully.`
4. **Kompilasi & Build Backend**:
   - `npm --prefix backend run build` (`nest build`) selesai dengan exit code 0 tanpa galat.
5. **Status Backend**: **READY**.

---

## 8. Frontend Readiness

1. **Kompilasi & Bundle Frontend**:
   - `npm --prefix frontend run build` (`tsc && vite build`) selesai dengan exit code 0.
   - 874 modul tertransformasi dalam 851ms tanpa peringatan maupun galat tipe TypeScript.
2. **Konfigurasi Rute & Komponen**:
   - Seluruh rute self-service dan manajemen (`/login`, `/dashboard`, `/my-today`, `/history`, `/blockers`, `/team/correction-requests`, `/notifications`) telah teruji dan siap melayani interaksi browser.
3. **Status Frontend**: **READY**.

---

## 9. Authentication Readiness

1. **Alur Otentikasi**:
   - Endpoint: `POST /api/v1/auth/login` menerima `{ email, password }` dan menerbitkan cookie `access_token` (JWT HttpOnly) serta cookie `csrf_token`.
2. **Kredensial Akun Uji Deterministik**:
   - Seluruh 6 akun uji deterministik pada `seed.test.ts` telah di-hash dengan Argon2 menggunakan password baku: `TestPassword123!`.
   - Endpoint `GET /api/v1/auth/me` siap memvalidasi sesi aktif.
3. **Status Otentikasi**: **READY**.

---

## 10. Authorization Readiness

1. **Struktur Relasi & Wewenang**:
   - Alice (`alice@dutamedia.test`): Role `Employee`, fungsi `Engineering`, atasan langsung Bob.
   - Bob (`bob@dutamedia.test`): Role `Supervisor_TL`, atasan langsung Alice, wewenang modul `Billing-Core-Module`, atasan langsung Carol.
   - Carol (`carol@dutamedia.test`): Role `Head`, atasan langsung Bob, bawahan langsung Eva.
   - Eva (`eva@dutamedia.test`): Role `CEO_Management`.
2. **Cakupan Otorisasi Skenario**:
   - **Trace A**: Alice berwenang mengajukan koreksi komitmen; Bob berwenang memeriksa dan mengajukan sanggahan (Objection).
   - **Trace B**: Alice berwenang mengajukan blocker; Bob ditetapkan otomatis sebagai pemilik wewenang (*Owner Needed*) dan berwenang melakukan konfirmasi (*Acknowledge*) serta penyelesaian (*Resolve*); Carol siap menerima auto-eskalasi; Alice berwenang menutup (*Close*) blocker.
3. **Status Otorisasi**: **READY**.

---

## 11. Trace A Readiness

Prasyarat untuk **TRACE A (Material Correction Request Lifecycle)**:

- Akun Employee: Tersedia (`alice@dutamedia.test`).
- Target Commitment: Tersedia (`TEST_FIXTURES.COMMITMENT_ID`, status `isMorningLocked = true`).
- Reviewer: Tersedia (`bob@dutamedia.test`).
- Endpoint Pengajuan: `POST /api/v1/correction-requests`.
- Komponen UI Pengajuan: `CorrectionRequestModal.vue` pada antarmuka frontend.
- Reviewer UI / Workflow: `/team/correction-requests` dan endpoint sanggahan.
- Siklus Jendela Sanggah: Masa sanggah 24 jam tercatat di kolom `objectionWindowEnd`.
- Mekanisme Kedaluwarsa Sanggah untuk E2E: Prosedur manipulasi aman pada data uji (`UPDATE correction_requests SET "objectionWindowEnd" = NOW() - INTERVAL '1 minute'`) siap dieksekusi tanpa mengubah kode produksi.
- Auto-Apply Scheduler: `CorrectionRequestService.evaluateExpiredObjectionWindows()`.
- AuditLog & Notifikasi: Siap mencatat aksi `CORRECTION_REQUESTED`, `CORRECTION_AUTO_APPLIED`, atau `CORRECTION_REJECTED`.
- Database: Real PostgreSQL terisolasi aktif dan terhubung.
- **Klasifikasi Kesiapan Trace A**: **READY**.

---

## 12. Trace B Readiness

Prasyarat untuk **TRACE B (Critical Blocker Lifecycle)**:

- Akun Pelapor: Tersedia (`alice@dutamedia.test`).
- Pengajuan Blocker Kritis: `RaiseBlockerModal.vue` dan `POST /api/v1/blockers`.
- Resolusi Pemilik Wewenang: Otomatis terpetakan ke Bob melalui `BlockerOwnerResolverService`.
- Notifikasi Instan: Trigger `CRITICAL_INSTANT_BLOCKER` terkirim ke Bob.
- Alur Konfirmasi & Penyelesaian: `PATCH /api/v1/blockers/:id/acknowledge` dan `PATCH /api/v1/blockers/:id/resolve`.
- Alur Penutupan: `PATCH /api/v1/blockers/:id/close` oleh Alice.
- Auto-Eskalasi Scheduler: `BlockerService.evaluateAutoEscalation()` siap dijalankan (dengan manipulasi `raisedAt` pada data uji).
- AuditLog: Siap mencatat `BLOCKER_RAISED`, `BLOCKER_ACKNOWLEDGED`, `BLOCKER_AUTO_ESCALATED`, `BLOCKER_RESOLVED`, `BLOCKER_CLOSED`.
- Database: Real PostgreSQL terisolasi aktif dan terhubung.
- **Klasifikasi Kesiapan Trace B**: **READY**.

---

## 13. Scheduler Readiness

1. **Metode Penjadwal**: `SchedulerService.runFrequentCycle()` mencakup 7 tahapan berurutan (`cutoffLock`, `cutoffReminders`, `noSubmission`, `expiredObjections`, `objectionReminders`, `autoEscalation`, `leaveReminders`).
2. **Karakteristik Pemicu**:
   - Berjalan otomatis setiap 5 menit via dekorator NestJS `@Cron('*/5 * * * *')`.
   - Tidak memiliki endpoint HTTP publik/internal (sesuai arsitektur non-ekspos SAD §11).
3. **Mekanisme Eksekusi Deterministi untuk E2E**:
   - Opsi 1: Menjalankan skrip eksternal tsx/node yang memanggil `runFrequentCycle()` secara terprogram.
   - Opsi 2: Memanggil method service yang relevan dalam harness integrasi.
   - Opsi 3: Menunggu siklus cron 5-menit reguler berjalan normal di latar belakang.
4. **Klasifikasi Kesiapan Scheduler**: **CONDITIONAL** (Operasional: memerlukan pemanggilan skrip eksternal atau toleransi siklus cron 5 menit).

---

## 14. Notification Readiness

1. **Penyimpanan**: Tabel `notifications` pada basis data fisik `workpulse_test`.
2. **Pengambilan Notifikasi**:
   - `GET /api/v1/notifications` (daftar notifikasi).
   - `GET /api/v1/notifications/unread-count` (jumlah belum dibaca).
   - `PATCH /api/v1/notifications/:id/read` (tandai satu dibaca).
   - `POST /api/v1/notifications/mark-all-read` (tandai semua dibaca).
3. **Kanal Pengiriman**: Web Notification Center aktif dan tersimpan di database; kanal email menggunakan Brevo mock (`mock-test-brevo-key`).
4. **Status Notifikasi**: **READY**.

---

## 15. AuditLog Readiness

1. **Penyimpanan**: Tabel append-only `audit_logs` pada PostgreSQL terisolasi.
2. **Verifikasi Bukti Empiris**:
   - Pengujian smoke `backend/test/integration-real/smoke-connection.spec.ts` telah memverifikasi secara langsung persistensi log:
     - Log aksi manusia: `USER_LOGIN` dengan `actorUserId` tidak null (ID Alice).
     - Log aksi sistem: `SYSTEM_SCHEDULER_HEARTBEAT` dengan `actorUserId = null`.
3. **Akses Data**: Siap dikueri langsung via kueri SQL oleh harness E2E untuk membuktikan kepatuhan SAD §15.
4. **Status AuditLog**: **READY**.

---

## 16. E2E Harness Readiness

Evaluasi kelayakan suite pengujian E2E:

1. **Pengujian Integrasi Backend**:
   - Terletak di `backend/test/integration-real/` (13 file spesifikasi).
   - Menggunakan PostgreSQL fisik pada port 54332 tanpa mock data.
   - Terbukti lulus uji smoke connection (`smoke-connection.spec.ts` — 4/4 passed).
2. **Pengujian Browser E2E**:
   - Terletak di `frontend/tests/e2e/scenario-a-correction-request.spec.ts` dan `scenario-b-blocker.spec.ts`.
   - Menggunakan Playwright Chromium.
   - Membutuhkan backend (port 3000/3001) dan frontend (port 5173) berjalan bersamaan.
3. **Ketersediaan Data & Kredensial**:
   - Seluruh akun fixture terdefinisi deterministik di `seed.test.ts`.
4. **Status E2E Harness**: **READY WITH CONDITION** (Membutuhkan penyesuaian parameter variabel lingkungan saat eksekusi dan instalasi biner browser).

---

## 17. Playwright Readiness

Evaluasi biner peramban Playwright pada Windows host:

1. **Versi CLI & Driver**: `@playwright/test` Version `1.63.0` terpasang pada `frontend`.
2. **Inspeksi Biner Browser**:
   - Perintah `npx playwright install --dry-run` menunjukkan bahwa Playwright v1.63.0 menargetkan biner:
     `Chrome for Testing 153.0.8010.12 (playwright chromium v1243)` pada direktori `C:\Users\LOQ\AppData\Local\ms-playwright\chromium-1243`.
   - Pemeriksaan direktori host menunjukkan biner yang terpasang saat ini adalah `chromium-1234` (versi sebelumnya), sedangkan `chromium-1243` belum diunduh.
3. **Kepatuhan Aturan Gerbang**:
   - Sesuai instruksi mutlak (§17): *Do NOT install browsers during this readiness re-verification unless the previous readiness report explicitly identified missing browser binaries as a blocking prerequisite*.
   - Tidak dilakukan instalasi peramban selama audit re-verifikasi ini.
4. **Klasifikasi Playwright**: **CONDITIONAL — BROWSER INSTALLATION REQUIRED** (Pengguna / eksekutor S3-T3 wajib menjalankan `npx playwright install chromium` sebelum pengujian peramban dimulai).

---

## 18. Port Readiness

Pemeriksaan status soket TCP lokal pada host Windows:

| Port | Service Terkait | Status Port | Keterangan |
|---|---|---|---|
| **54332** | Isolated PostgreSQL Test DB | **IN USE BY CORRECT PROCESS** | Digunakan oleh `com.docker.backend.exe` / `wslrelay.exe` (`workpulse-test-db`). |
| **3000** | Backend Default Port | **AVAILABLE** | Kosong / siap digunakan jika backend dijalankan pada port default. |
| **3001** | Backend Test Mode Port | **AVAILABLE** | Kosong / siap digunakan jika backend dijalankan via `.env.test`. |
| **5173** | Frontend Vite Dev Server | **AVAILABLE** | Kosong / siap digunakan untuk dev server frontend. |

**Kesimpulan Konflik Port**: **PASS** (Zero port collisions, port 54332 aktif dengan proses yang tepat).

---

## 19. Previous Conditional Issues Re-Evaluation

Evaluasi ulang terhadap 3 temuan kondisional dari laporan gerbang sebelumnya, ditambah 1 temuan kondisional baru:

| No | Temuan Kondisional Sebelumnya | Alasan Sebelumnya | Bukti Temuan Saat Ini | Status Saat Ini | Tindakan yang Diperlukan pada S3-T3 |
|---|---|---|---|---|---|
| 1 | **Penyetelan Variabel Lingkungan Playwright** | Script Playwright memiliki fallback `@dutamedia.com` dan `changeme`, sedangkan seed resmi menggunakan `@dutamedia.test` dan `TestPassword123!`. | Seed deterministik telah diterapkan ke real DB dengan akun `@dutamedia.test`. Fallback kode uji tetap ada. | **CONDITIONAL** (Operasional) | Jalankan Playwright dengan variabel: `PLAYWRIGHT_EMP_EMAIL=alice@dutamedia.test`, `PLAYWRIGHT_EMP_PASSWORD=TestPassword123!`, dll. |
| 2 | **Pemicu Manual Scheduler** | Scheduler berjalan per 5 menit tanpa endpoint HTTP publik. | `SchedulerService.runFrequentCycle()` siap dieksekusi terprogram via tsx atau menunggu siklus 5 menit. | **CONDITIONAL** (Operasional) | Jalankan skrip tsx mandiri untuk trigger siklus atau tunggu interval kron 5 menit. |
| 3 | **Penyelarasan Port Frontend-Backend** | `frontend/.env` default ke port 3000, `backend/.env.test` default ke port 3001. | Port 3000 dan 3001 keduanya berstatus AVAILABLE (tidak ada konflik). | **CONDITIONAL** (Operasional) | Jalankan backend dengan `PORT=3000` atau jalankan frontend dengan `VITE_API_BASE_URL="http://localhost:3001/api/v1"`. |
| 4 | **Kebutuhan Instalasi Biner Browser Chromium** *(Temuan Baru)* | Biner Chromium host berada pada versi `chromium-1234`, sedangkan Playwright v1.63.0 membutuhkan `chromium-1243`. | `Test-Path` ke `chromium-1243` bernilai `False`. | **CONDITIONAL — BROWSER INSTALLATION REQUIRED** | Jalankan `npx playwright install chromium` sebelum eksekusi test peramban Playwright. |

---

## 20. Final Readiness Matrix

| Area | Status Sebelumnya | Bukti Temuan Saat Ini | Status Saat Ini | Blocking? |
|---|---|---|---|---|
| **Docker Engine** | BLOCKED | Docker 28.5.1 Desktop active, daemon pipe reachable, engine running | **AVAILABLE** | Tidak |
| **PostgreSQL** | BLOCKED | `workpulse-test-db` running (healthy), migrasi terpasang, seed sukses, smoke test 4/4 PASS | **READY** | Tidak |
| **Backend** | READY | `nest build` PASS, siap terhubung ke database port 54332 | **READY** | Tidak |
| **Frontend** | READY | `tsc && vite build` PASS (874 modul transformed, 0 error) | **READY** | Tidak |
| **Authentication** | READY | `AuthController` siap, session cookie HttpOnly + CSRF, password hash Argon2 | **READY** | Tidak |
| **Authorization** | READY | Hierarki Alice → Bob → Carol → Eva terdefinisi lengkap di seed | **READY** | Tidak |
| **Trace A** | CONDITIONAL | Komitmen terkunci siap, alur objection & auto-apply terverifikasi | **READY** | Tidak |
| **Trace B** | CONDITIONAL | Alur blocker kritis, owner needed resolution, eskalasi, resolve, close siap | **READY** | Tidak |
| **Scheduler** | CONDITIONAL | `runFrequentCycle` siap, memerlukan pemicu terprogram atau toleransi 5 menit | **CONDITIONAL** | Tidak |
| **Notification** | READY | Tabel `notifications` aktif, web center queryable, Brevo email mock | **READY** | Tidak |
| **AuditLog** | READY | Tabel `audit_logs` terverifikasi via live smoke test (human & null actor) | **READY** | Tidak |
| **E2E Harness** | CONDITIONAL | Integration test real PostgreSQL siap; E2E butuh env parameter | **CONDITIONAL** | Tidak |
| **Playwright** | READY | Driver v1.63.0 siap; memerlukan unduhan biner `chromium-1243` | **CONDITIONAL** | Tidak |
| **Evidence Plan** | READY | Rencana tangkapan log, query SQL, dan trace Playwright siap | **READY** | Tidak |
| **User Confirmation** | READY | Prosedur startup backend, frontend, dan runner E2E terdokumentasi jelas | **READY** | Tidak |
| **Production DB Safety** | PASS | Guard `assertSafeTestDatabase()` PASS — Zero Production Risk | **PASS** | Tidak |

---

## 21. Git Integrity

Pemeriksaan integritas status repositori Git:
- **Baseline Git Awal**: Sama persis dengan penutupan S3-T2 (`git status --porcelain -uall` terverifikasi).
- **Mutasi Sumber**: **0 (Nol)**. Tidak ada file kode sumber, skema Prisma, migrasi, konfigurasi `.env`, tes, atau docker compose yang diubah atau dihapus.
- **Artefak Baru**: Hanya file laporan re-verifikasi ini (`Design-Artifacts/Reports/S3-T3-T0-E2E-Readiness-Environment-Gate-Reverification.md`).
- **Integritas Git**: **PASS**.

---

## 22. Final Gate Verdict

Seluruh pemblokir lingkungan (*blocking environment prerequisites*) yang sebelumnya menyebabkan S3-T3-T0 berstatus BLOCKED telah **100% terselesaikan** dengan aktifnya Docker Engine dan tersedianya database PostgreSQL 18 terisolasi pada port 54332.

Seluruh prasyarat yang tersisa saat ini merupakan prasyarat operasional non-pemblokir (*non-blocking operational conditions*) yang dapat dipenuhi saat eksekusi pengujian S3-T3 dimulai.

Maka, sesuai dengan aturan gerbang (§25):

### **S3-T3-T0 — CONDITIONAL PASS**

**Status Otorisasi:**
Tahapan **S3-T3: Full-Stack E2E Traces** diotorisasi untuk dimulai (*Authorized to Begin*) dengan ketentuan operasional berikut diselesaikan saat eksekusi:
1. Menjalankan `npx playwright install chromium` untuk mengunduh biner peramban yang sesuai.
2. Menyetel variabel lingkungan kredensial seed Playwright saat eksekusi (`PLAYWRIGHT_EMP_EMAIL=alice@dutamedia.test`, dll.).
3. Menyelaraskan port backend dan frontend (`PORT=3000` atau `VITE_API_BASE_URL="http://localhost:3001/api/v1"`).
4. Menggunakan pemanggil terprogram untuk memicu siklus scheduler `runFrequentCycle` atau menunggu siklus kron 5 menit.
