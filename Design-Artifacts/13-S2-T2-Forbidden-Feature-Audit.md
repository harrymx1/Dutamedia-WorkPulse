# S2-T2 Forbidden Feature Absence Audit Matrix

## 1. Executive Summary & Purpose

S2-T2 adalah audit independen terhadap **persyaratan negatif (*negative requirements*)** dan **fitur terlarang (*forbidden features*)** pada WorkPulse. Sesuai prinsip *evidence over assumption*, tujuan audit ini adalah membuktikan secara sistematis dan berbasis bukti tekstual/struktural bahwa perilaku yang secara eksplisit dilarang, tidak diizinkan, atau bertentangan dengan prinsip tata kelola (*governance*) produk WorkPulse **BENAR-BENAR TIDAK TERDAPAT (ABSENT)** pada kode produksi (*backend*, *frontend*, *scheduler*, konfigurasi, API, dan skema persistensi).

Audit mencakup 30 kategori larangan kanonikal (`FF-01` s/d `FF-30`) yang diturunkan langsung dari dokumen tata kelola:
- `Design-Artifacts/01-PDD(2).md`
- `Design-Artifacts/02-PRD.md`
- `Design-Artifacts/03-UI-UX Spec & Flow Document(2).md`
- `Design-Artifacts/05-SAD.md`
- `Design-Artifacts/08-ADR.md` (ADR-001 s/d ADR-018)
- `Design-Artifacts/09-Known-Limitations.md` (KL-01 s/d KL-10)
- `Design-Artifacts/10-S2-Audit-Findings-Register.md`

---

## 2. Forbidden Behavior Catalog

| ID | Forbidden Behavior | Source | Exact Rule | Production Search Strategy |
|---|---|---|---|---|
| **FF-01** | Silent State Mutation | PDD §8, SAD §4.5, PRD BR-16 | Sistem tidak boleh mengubah pilihan status, komitmen, atau pernyataan user tanpa tindakan resmi atau izin yang sah (*no unprompted background mutation*). | Regex pencarian operasi write/update pada `Commitment`, `DailyAccountabilityRecord`, dan `AdditionalWork` di seluruh `backend/src`. |
| **FF-02** | Automatic Discipline / Automatic Penalty | PDD §5, PDD §8, PRD BR-05, BR-06 | Sistem dilarang menerbitkan SP, sanksi finansial, atau pemotongan insentif/gaji secara otomatis; penegakan disiplin formal wajib human-authorized di luar sistem. | Pencarian keyword `disciplinary`, `penalty`, `salary`, `sanction`, `suratPeringatan`, `sp1`, `sp2`, `denda`, `potong` di `backend/src` dan `frontend/src`. |
| **FF-03** | Automatic KPI / Performance Calculator | PDD §5, PRD §9, SAD §13.3 | Sistem dilarang menghitung skor KPI otomatis, scoring produktivitas, atau engine insentif kompleks. | Pencarian keyword `kpi`, `productivity_score`, `performance_score`, `incentive_engine` di `backend/src` dan `frontend/src`. |
| **FF-04** | Silent Manager Editing of Employee Statements | PDD §8, PRD §3.1, SAD §10.3 | Atasan/Manager dilarang mengedit atau menulis ulang teks komitmen/outcome bawahan secara langsung; perubahan baseline wajib via Correction Request. | Penelusuran otorisasi IDOR kepemilikan record pada `patchCommitment` dan `patchAdditionalWork` di `daily-accountability.service.ts`. |
| **FF-05** | Automatic Status Override | PRD FR-13, ADR-013, SAD §9.3 | Status Suggestion Engine dilarang menimpa `finalStatus` pilihan user secara sepihak atau menyimpan perubahan tanpa konfirmasi eksplisit user. | Pemeriksaan alur `evaluateSuggestedStatus` dan penanganan `requiresOverrideConfirmation` pada `daily-accountability.service.ts:574-583`. |
| **FF-06** | Automatic Submission | PRD FR-01, FR-11, ADR-017 | Pemuatan halaman, interaksi draft, atau scheduler dilarang melakukan auto-submit Morning/EOD Check-in ke basis data. | Pemeriksaan lifecyle hooks frontend (`onMounted`) dan job scheduler untuk ketiadaan mutasi create/submit check-in otomatis. |
| **FF-07** | Additional Work Becoming Commitment #4 | PDD §8, PRD BR-01, ADR-006, ADR-017 | Additional Work dilarang masuk ke slot Morning Commitment (Commitments 1–3) atau menambah komitmen menjadi > 3. | Pemeriksaan batas `MAX_DAILY_COMMITMENTS = 3`, DTO, pemisahan tabel `AdditionalWork`, dan UI section `MyTodayPage.vue`. |
| **FF-08** | Tomorrow Priority as Carry-Over Draft Source | ADR-017 (D1) | `Tomorrow Priority` bukan sumber kebenaran FR-11 dan dilarang digunakan sebagai sumber copy-forward draft komitmen hari berikutnya. | Pencarian semantik pemanfaatan `tomorrowPriority` di `backend/src` dan `frontend/src`. |
| **FF-09** | Index-Based Carry-Over Fallback | ADR-017 (D2, D3) | `sourceCommitmentId` wajib ada; sistem dilarang menggunakan indeks array atau posisi urut sebagai fallback draft. | Pemeriksaan validasi `sourceCommitmentId` pada `MyTodayPage.vue:938-1057` dan `daily-accountability.service.ts:384-428`. |
| **FF-10** | Cross-User / IDOR Resource Access | PRD §7, SAD §8.11, S2-SEC-FR15-1 | Pengguna dilarang mengakses, memodifikasi, atau menautkan resource milik pengguna lain tanpa izin melalui IDOR. | Audit server-side validation di `BlockerService`, `CorrectionRequestService`, dan `DailyAccountabilityService`. |
| **FF-11** | Unauthorized Scope Bypass | SAD §8.11, ADR-010, ADR-011 | Parameter scope dari client dilarang dipercaya tanpa validasi server-side; ScopeGuard tidak boleh diasumsikan sebagai pengaman aktif. | Pemeriksaan ketiadaan `ScopeGuard` di `backend/src` dan verifikasi bahwa otorisasi scope ditegakkan di layer domain service. |
| **FF-12** | Scope / Authority Hardcoding | SAD §8.9, §8.11 | Dilarang melakukan hardcoding ID organisasi, user, manajer, atau project yang memberikan wewenang bypass tidak sah. | Pencarian nilai literal UUID di seluruh file produksi `backend/src/**`. |
| **FF-13** | Legacy / Prohibited Policy Fields | ADR-005, ADR-006, ADR-008 | Dilarang menggunakan field kebijakan warisan yang telah dihapus (`riskChangeAlwaysMaterial`, `patternThresholdCount`, dll.). | Pencarian string 5 legacy fields di seluruh `backend/src` dan `frontend/src`. |
| **FF-14** | Dynamic Policy Parameter Hardcoding | PRD NFR-08, SAD §6.4 | Parameter kebijakan dinamis (Cutoff, GracePeriod, Retention, dll.) dilarang di-hardcode di kode program. | Pemeriksaan integrasi `PolicyService.getActivePolicySnapshot` di domain services. |
| **FF-15** | GracePeriod Truthiness Coercion (`\|\| 30`) | ADR-018, S2-FR26-GRACE0-1 | GracePeriod = 0 adalah nilai valid; dilarang menggunakan pola truthiness `\|\| 30` yang membelokkan nilai 0 menjadi 30. | Regex pencarian `\|\|\s*30` pada seluruh file produksi `backend/src/**`. |
| **FF-16** | Scheduler Usurping Submission Validity Authority | ADR-018, SAD §9.2 | Scheduler bukan penentu sah tidaknya check-in; penentuan on-time/late/cutoff murni ditegakkan saat request masuk. | Pemeriksaan logika `SchedulerService` untuk ketiadaan penentuan timing check-in. |
| **FF-17** | Reminder Dispatch Ignoring Eligibility Rules | PRD FR-28, ADR-014 | Pengiriman reminder wajib mengecualikan libur, cuti/izin approved, dan karyawan yang sudah submit; dilarang menggunakan UUID sintetis. | Audit `findPendingSubmissionEmployeeIds` dan `sendCutoffReminders` di `daily-accountability.service.ts` dan `scheduler.service.ts`. |
| **FF-18** | Silent Mock / Fallback Provider in Production | SAD §12.3, §14.5 | Lingkungan produksi dilarang beroperasi dalam mode mock/simulasi secara diam-diam tanpa fail-fast saat kredensial kosong/mock. | Pemeriksaan fail-fast guard pada `BrevoEmailService` dan `S3StorageService`. |
| **FF-19** | Fake / Static Production Data | PDD §6, SAD §13.3 | Dashboard, metric, dan daftar karyawan dilarang menggunakan data tiruan (mock data) di antarmuka produksi. | Pencarian deklarasi array statis tiruan di `frontend/src/pages/**` dan `frontend/src/queries/**`. |
| **FF-20** | Public Self-Registration & Auth Backdoor | PDD §8, SAD §8.4, §10.1 | Sistem dilarang menyediakan endpoint registrasi publik mandiri atau jalur bypass autentikasi di lingkungan produksi. | Audit routing `AuthController` dan verifikasi `AuthGuard` untuk integritas validasi sesi. |
| **FF-21** | Exposure of Server Secrets in Frontend | SAD §16.1 | Kredensial rahasia server (JWT Secret, DB Password, API Private Key) dilarang bocor atau di-bundle ke frontend. | Pencarian nama variabel rahasia pada seluruh direktori `frontend/**`. |
| **FF-22** | Raw HTML Injection / Unsafe `v-html` | SAD §16.8 | Antarmuka pengguna dilarang merender input teks user melalui direktif `v-html` atau `innerHTML` tanpa sanitasi ketat. | Pencarian `v-html` dan `innerHTML` di seluruh file `.vue` pada `frontend/src`. |
| **FF-23** | Evidence & Signed URL Authorization Bypass | SAD §10.12, §14.4 | Pengguna dilarang memperoleh presigned download URL hanya bermodalkan fileId/UUID tanpa validasi kepemilikan/scope. | Audit otorisasi `generateDownloadUrl` pada `FileStorageService:217-290`. |
| **FF-24** | Direct Baseline Overwrite Bypassing Correction Request | PRD BR-16, PDD §8 | Komitmen yang telah terkunci pasca-cutoff dilarang diubah secara langsung tanpa melalui siklus Objection Window dan AuditLog. | Audit `applyApprovedCorrection` dan ketiadaan direct update pasca-cutoff pada `DailyAccountabilityService`. |
| **FF-25** | Unapproved Automatic Domain State Transitions | PDD §7, SAD §9.7 | Background scheduler dilarang memicu perubahan status domain yang tidak diotorisasi secara eksplisit oleh spesifikasi. | Audit seluruh tugas berkala pada `SchedulerService` (`@Cron`). |
| **FF-26** | Reporting & Export Modifying Domain State | PRD §9, SAD §13.3 | Layanan reporting dan export wajib bersifat murni read-only dan dilarang memodifikasi data transaksional. | Pemeriksaan ketiadaan operasi write (`create`, `update`, `delete`, `upsert`) pada `ReportingService`. |
| **FF-27** | Automatic Approval of HR / Management Exceptions | PDD §8, PRD §3.5 | Cuti, dispensasi (Exemption), dan penugasan reviewer dilarang disetujui otomatis oleh sistem tanpa intervensi manusia berwenang. | Audit alur review exception pada `ExceptionService:reviewException`. |
| **FF-28** | Silent Organizational History Destruction | PRD BR-10, PDD §8 | Dilarang melakukan hard DELETE pada penugasan organisasi atau menimpa histori penugasan tanpa mekanisme effective dating. | Pencarian pemanggilan `delete` pada model `OrganizationalAssignment` di `backend/src`. |
| **FF-29** | Automatic Disciplinary Escalation from RED Daily Status | PDD §8, SAD §9.7 | Status harian RED adalah klasifikasi risiko kerja dan dilarang secara otomatis memicu sanksi disipliner/SP. | Audit korelasi antara `DailyStatus.RED` dengan pembuatan `ComplianceEvent`. |
| **FF-30** | Individual Peer Leaderboard & Task-Count Gamification | PDD §5, §8, PRD §9, BR-08, AC-16 | Sistem dilarang menampilkan peringkat karyawan berdasarkan jumlah task, check-in, atau kecepatan penyelesaian. | Audit kueri agregasi pada `ReportingService` dan UI eksekutif pada `ManagementPulsePage.vue`. |

---

## 3. Systematic Search Coverage & Methodology

Audit dilakukan menggunakan strategi pencarian berlapis (*multi-layer verification*):
1. **Repository-Wide Static Analysis**: Pemindaian menyeluruh terhadap 132 file TypeScript produksi di `backend/src/` dan seluruh komponen/halaman di `frontend/src/`.
2. **Contextual Code Inspection**: Setiap kemunculan positif (*positive hit*) dari kata kunci diinspeksi secara mendalam pada konteks pemanggil, penjaga otorisasi (*guard*), dan transaksi basis data.
3. **Behavioral Test Triangulation**: Memverifikasi ketiadaan perilaku terlarang melalui eksekusi test suite negatif yang ada di repositori (`deny-matrix.spec.ts`, `concurrency.spec.ts`, dll.).

---

## 4. Forbidden Feature Audit Matrix

| ID | Forbidden Behavior | Source | Search Strategy | Production Hits | Classification | Evidence & Context | Status |
|---|---|---|---|---:|---|---|---|
| **FF-01** | Silent State Mutation | PDD §8, SAD §4.5 | Regex write/update pada model komitmen | 18 | Legitimate | Seluruh update terjadi pada `submitMorningCheckin`, `patchCommitment`, `submitEodCheckin`, `confirmOverride`, `patchAdditionalWork`, dan `applyApprovedCorrection`. Seluruhnya membutuhkan otorisasi user atau alur Correction Request yang diaudit. Nol silent mutation. | **ABSENT / VERIFIED** |
| **FF-02** | Automatic Discipline / Penalty | PDD §5, PDD §8 | Pencarian keyword disiplin & sanksi | 9 | Legitimate & Doc | 1 hit dokumentasi OpenAPI, 8 hit pada `CompliancePage.vue` dan `useCompliance.ts` untuk fungsi manual `recordWarning`. `ComplianceService.recordWarning` wajib dipanggil manual oleh role HRGA dengan nomor referensi SP fisik dari luar sistem. Nol sanksi otomatis. | **ABSENT / VERIFIED** |
| **FF-03** | Automatic KPI / Calculator | PDD §5, PRD §9 | Pencarian keyword KPI & gamifikasi | 0 | Legitimate | Tidak ditemukan modul KPI, kalkulator skor karyawan, atau rating performa di kode produksi. | **ABSENT / VERIFIED** |
| **FF-04** | Silent Manager Editing of Statements | PDD §8, PRD §3.1 | Audit otorisasi kepemilikan komitmen | 2 | Legitimate | `patchCommitment:787` dan `patchAdditionalWork:1011` memverifikasi `dailyRecord.employeeUserId === userId`. Jika atasan mencoba mengubah langsung komitmen bawahan, sistem melempar `NotFoundException` (IDOR defense). Koreksi wajib via `CorrectionRequest`. | **ABSENT / VERIFIED** |
| **FF-05** | Automatic Status Override | PRD FR-13, ADR-013 | Audit evaluasi `StatusSuggestionService` | 1 | Legitimate | Pada `daily-accountability.service.ts:574-583`, jika status pilihan user berbeda dari saran sistem, sistem mengembalikan `{ requiresOverrideConfirmation: true }` tanpa menulis ke database. Nol override otomatis. | **ABSENT / VERIFIED** |
| **FF-06** | Automatic Submission | PRD FR-01, ADR-017 | Audit lifecyle Vue dan scheduler | 0 | Legitimate | `MyTodayPage.vue` tidak memicu auto-submit pada lifecycle `onMounted`. Aksi draft hanya mengisi form lokal (*transient*). `SchedulerService` tidak memiliki metode create/submit record. | **ABSENT / VERIFIED** |
| **FF-07** | Additional Work as Commitment #4 | PDD §8, ADR-017 | Audit batas komitmen dan model | 3 | Legitimate | `DailyAccountabilityService` menegakkan `MAX_DAILY_COMMITMENTS = 3`. `AdditionalWork` disimpan di tabel terpisah. UI memisahkan Section 1 (Komitmen) dan Section 2 (Pekerjaan Tambahan). | **ABSENT / VERIFIED** |
| **FF-08** | Tomorrow Priority as Draft Source | ADR-017 (D1) | Pencarian `tomorrowPriority` di backend & frontend | 8 | Legitimate | `tomorrowPriority` hanya ada di frontend sebagai input teks opsional EOD dan tampilan riwayat. Nol penggunaan di `backend/src/modules/daily-accountability`. Sumber draft murni komitmen `Continue`. | **ABSENT / VERIFIED** |
| **FF-09** | Index-Based Carry-Over Fallback | ADR-017 (D2, D3) | Audit pemrosesan draft di UI dan API | 1 | Legitimate | `MyTodayPage.vue:944` memvalidasi keberadaan `draft.sourceCommitmentId`. Jika tidak ada, proses digagalkan dengan error alert tanpa fallback ke slot index 0/1/2. | **ABSENT / VERIFIED** |
| **FF-10** | Cross-User / IDOR Access | PRD §7, SAD §8.11 | Audit kepemilikan resource di domain services | 12 | Legitimate | `BlockerService:113` menolak penautan komitmen milik user lain (403 Forbidden). `CorrectionRequestService:76` menolak komitmen bukan milik pemohon (403 Forbidden). Otorisasi ditegakkan di level domain service. | **ABSENT / VERIFIED** |
| **FF-11** | Unauthorized Scope Bypass | SAD §8.11, ADR-010 | Pencarian `ScopeGuard` dan validasi scope | 0 | Legitimate | `ScopeGuard` terbukti tidak ada di `backend/src`. Scope ditegakkan di service layer via `ScopeFilterService` dan `ProjectAuthorityService`. Parameter scope dari client tidak dipercaya secara mentah. | **ABSENT / VERIFIED** |
| **FF-12** | Scope / Authority Hardcoding | SAD §8.9, §8.11 | Pencarian literal UUID di `backend/src` | 2 | Legitimate | 2 hit pada `compliance.service.ts:483, 504` bernilai nil UUID `00000000-0000-0000-0000-000000000000` untuk memaksakan hasil kosong saat user di luar scope. Nol hardcoded user/manager/project ID. | **ABSENT / VERIFIED** |
| **FF-13** | Legacy Policy Fields | ADR-005, ADR-008 | Pencarian 5 nama field kebijakan warisan | 0 | Legitimate | Nol hit untuk `riskChangeAlwaysMaterial`, `patternThresholdCount`, `allowLeaveOnProbation`, `minCommitmentCount`, `maxCommitmentCount`. `PATTERN_FLAG_THRESHOLD_COUNT = 3` tetap berupa konstanta produk tetap. | **ABSENT / VERIFIED** |
| **FF-14** | Dynamic Policy Hardcoding | PRD NFR-08, SAD §6.4 | Audit konsumsi `PolicyService` | 0 | Legitimate | Nilai Cutoff, GracePeriod, Retention, WorkdayCalendar diambil dinamis dari `PolicyService.getActivePolicySnapshot` dengan resolusi effective dating. | **ABSENT / VERIFIED** |
| **FF-15** | GracePeriod Truthiness Coercion | ADR-018, S2-FR26-GRACE0-1 | Regex pencarian `\|\|\s*30` di `backend/src` | 0 | Legitimate | Nol penggunaan `\|\| 30`. Seluruh fallback menggunakan nullish coalescing `?? 30` di `daily-accountability.service.ts` dan `compliance.service.ts`, menjamin `GracePeriod = 0` tetap bernilai 0. | **ABSENT / VERIFIED** |
| **FF-16** | Scheduler as Rule Authority | ADR-018, SAD §9.2 | Audit `SchedulerService` submission logic | 0 | Legitimate | Validitas submission dievaluasi eksklusif oleh `DailyAccountabilityService.evaluateTiming()` saat HTTP request diterima. Scheduler hanya mengunci record yang belum disubmit saat cutoff berlalu. | **ABSENT / VERIFIED** |
| **FF-17** | Reminder Without Eligibility Rules | PRD FR-28, ADR-014 | Audit `findPendingSubmissionEmployeeIds` | 4 | Legitimate | `daily-accountability.service.ts:1347-1423` menyaring aktif `role: Role.Employee`, mengecualikan Approved Holiday, Leave, dan Exemption, mempertahankan Pending Leave (AC-19), dan tidak memakai UUID palsu. | **ABSENT / VERIFIED** |
| **FF-18** | Silent Mock Provider in Production | SAD §12.3, §14.5 | Audit konfigurasi Brevo dan S3 | 2 | Accepted Exception | `BrevoEmailService` dan `S3StorageService` mengimplementasikan fail-fast di production (`NODE_ENV === 'production'`) jika API key atau secret kosong/mock. Non-production fallback diizinkan untuk dev/test. | **ACCEPTED EXCEPTION** |
| **FF-19** | Fake / Static Production Data | PDD §6, SAD §13.3 | Pencarian fake data di `frontend/src` | 0 | Legitimate | Nol data dummy atau seeded static metric di UI produksi. Seluruh tampilan terhubung ke reactive query hooks via TanStack Query. | **ABSENT / VERIFIED** |
| **FF-20** | Public Self-Registration & Auth Backdoors | PDD §8, SAD §8.4 | Audit `AuthController` dan `AuthGuard` | 0 | Legitimate | Tidak ada endpoint `/register` publik. User hanya dibuat oleh Admin via `IdentityService.createUser`. `AuthGuard` memvalidasi JWT token dan status session aktif di DB. | **ABSENT / VERIFIED** |
| **FF-21** | Secrets in Frontend Assets | SAD §16.1 | Pencarian server secret di `frontend/**` | 0 | Legitimate | Nol JWT_SECRET, DB connection strings, S3 private keys, atau Brevo API keys di direktori frontend. | **ABSENT / VERIFIED** |
| **FF-22** | Raw HTML / Unsafe `v-html` | SAD §16.8 | Pencarian `v-html` dan `innerHTML` | 2 | Legitimate | 2 kemunculan berupa komentar arsitektural di `CommitmentCard.vue` dan `BlockerCard.vue` (*"zero v-html per SAD §16.8"*). Nol penggunaan direktif `v-html` atau properti `innerHTML`. | **ABSENT / VERIFIED** |
| **FF-23** | Evidence URL Authorization Bypass | SAD §10.12, §14.4 | Audit `FileStorageService.generateDownloadUrl` | 3 | Legitimate | Akses folder `backups/` diblokir total; SystemAdmin diblokir dari data operasional; download mewajibkan otorisasi supervisor/owner terhadap entity pemilik evidence; presigned GET kedaluwarsa 15 menit. | **ABSENT / VERIFIED** |
| **FF-24** | Direct Baseline Overwrite | PRD BR-16, PDD §8 | Audit mutasi baseline pasca-cutoff | 0 | Legitimate | Tidak ada bypass langsung terhadap baseline komitmen pasca-cutoff. Perubahan wajib melalui `CorrectionRequest` dengan pembagian Minor (langsung + audit log) dan Material (objection window). | **ABSENT / VERIFIED** |
| **FF-25** | Unapproved Domain State Transitions | PDD §7, SAD §9.7 | Audit cron jobs di `SchedulerService` | 0 | Legitimate | Scheduler hanya mengeksekusi 5 tugas yang diizinkan spesifikasi (reminder, cutoff lock, no submission evaluation, expired objection window, blocker SLA escalation). | **ABSENT / VERIFIED** |
| **FF-26** | Reporting Boundary Violation | PRD §9, SAD §13.3 | Audit operasi write di `ReportingService` | 0 | Legitimate | `ReportingService` murni read-only: nol pemanggilan `create`, `update`, `delete`, atau `upsert`. | **ABSENT / VERIFIED** |
| **FF-27** | Automatic Approval of HR Authority | PDD §8, PRD §3.5 | Audit workflow approval pada Exception | 0 | Legitimate | Cuti/Izin (Leave) wajib melalui review manual atasan/HRGA via `ExceptionService.reviewException`. Tidak ada auto-approval pada pengajuan izin. | **ABSENT / VERIFIED** |
| **FF-28** | Silent Org History Destruction | PRD BR-10, PDD §8 | Pencarian hard delete pada assignment | 0 | Legitimate | Nol hard DELETE pada `OrganizationalAssignment`. Penugasan baru menggunakan mekanisme `endDate` (effective-dating), menjaga auditabilitas historis. | **ABSENT / VERIFIED** |
| **FF-29** | Automatic Discipline from RED Status | PDD §8, SAD §9.7 | Audit dampak DailyStatus.RED | 0 | Legitimate | DailyStatus RED murni merupakan indikator risiko dan komitmen bantuan; tidak pernah memicu event kepatuhan atau sanksi disipliner. | **ABSENT / VERIFIED** |
| **FF-30** | Leaderboard & Task Gamification | PDD §5, §8, PRD §9, BR-08, AC-16 | Audit sorting metrik individual di reporting | 4 | Legitimate & Doc | `ReportingService` tidak memiliki klausa `orderBy` metrik performa individual. UI eksekutif menampilkan *Policy Banner Larangan Ranking Individu* (AC-16). Nol leaderboard. | **ABSENT / VERIFIED** |

---

## 5. Legitimate Accepted Exceptions & Product Limitations

Audit mengonfirmasi adanya 4 perilaku yang tampak berdekatan dengan pengecualian teknis, namun **sah secara hukum tata kelola produk (*Legitimate Accepted Exceptions*)**:

1. **Browser Push Channel Stub (KL-04 / SAD §12.4)**:
   - *Behavior*: `BrowserPushService.sendPushNotification` mencatat log dan mengembalikan stub status success dengan flag `stubbed: true`.
   - *Status*: **Accepted Exception (MVP Scope Restriction)**. SAD §12.4 menetapkan bahwa untuk fase MVP, pengiriman browser push nyata ditangguhkan; pencatatan record notifikasi ke basis data tetap berjalan penuh.
2. **Batch Limit & Candidate Starvation Risk (>200 Pengguna) (KL-10 / ADR-015 / S2-PERF-FR28-1)**:
   - *Behavior*: `DailyAccountabilityService.findPendingSubmissionEmployeeIds` memotong array kandidat `slice(0, limit)` dengan batas default 200 pengguna sebelum deduplikasi di `SchedulerService`.
   - *Status*: **Accepted Technical Debt**. Didokumentasikan secara resmi pada ADR-015 dan KL-10 dengan status register `ACCEPTED RISK / ADR`. Skala operasional sistem pada MVP adalah 30–60 karyawan, sehingga batasan ini tidak menimbulkan malfungsi operasional saat ini.
3. **Non-Production External Provider Fallback (SAD §12.3, §14.5)**:
   - *Behavior*: `BrevoEmailService` dan `S3StorageService` beroperasi dalam mode simulasi (*mock/stub*) hanya jika `NODE_ENV !== 'production'`.
   - *Status*: **Accepted Developer Tooling**. Di lingkungan produksi (`NODE_ENV === 'production'`), guard fail-fast secara ketat melempar error saat inisialisasi jika kredensial kosong atau bernilai mock.
4. **Fixed Product Constants vs Dynamic Policy (ADR-006, ADR-008, ADR-014, ADR-016)**:
   - *Behavior*: `PATTERN_FLAG_THRESHOLD_COUNT = 3`, `MAX_DAILY_COMMITMENTS = 3`, lead-time pengingat 60 menit, dan kamus template prompt per fungsi adalah konstanta kode statis.
   - *Status*: **Accepted Product Architecture Decision**. Sesuai ADR-006 dan ADR-008, aturan filosofi inti produk sengaja dikunci sebagai konstanta kode (*Fixed Product Rules*) untuk melindungi integritas *state machine* agar tidak diubah secara sewenang-wenang oleh Administrator.

---

## 6. Audit Conclusion & Integrity Check

- **Total Forbidden Categories Audited**: 30 dari 30 (`FF-01` s/d `FF-30`).
- **Confirmed Violations Found**: **0** (NOL pelanggaran kode produksi).
- **Unsupported Absence Claims**: **0** (Seluruh klaim ketiadaan didukung bukti pencarian statis dan inspeksi kontekstual).
- **Overall Verdict**: **PASS WITH ACCEPTED EXCEPTIONS**.
