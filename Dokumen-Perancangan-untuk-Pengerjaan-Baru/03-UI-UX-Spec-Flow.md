# UI/UX Specification & Flow Document
## WorkPulse — Daily Accountability & Blocker Log System

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.8.0 |
| Status | FINAL — Fully aligned with PDD v1.4 FINAL & PRD v1.5 FINAL |
| Date | Oktober 2026 |
| Referensi | PDD v1.4 FINAL, PRD v1.5 FINAL, ADR-001, ADR-006, ADR-008, ADR-013, ADR-014, ADR-016, ADR-017, ADR-018 |

> Dokumen ini mendefinisikan **alur interaksi dan perilaku** berdasarkan PDD v1.4 dan PRD v1.5 yang telah ditetapkan sebagai baseline final: user flow, screen behavior, state, validasi, feedback, error handling, permission-aware visibility, serta transisi. Dokumen ini bukan penetapan visual detail (warna, tipografi, spacing → Design System), bukan prototype, dan bukan keputusan arsitektur teknis. Nilai operasional yang belum ditetapkan tidak boleh dikarang; gunakan Launch Configuration Register yang disahkan sebelum implementasi. Jika sumber requirement tidak menentukan perilaku pada suatu kondisi tepi, UI tidak boleh menjanjikan hasil yang belum ditetapkan.

---

## 1. Prinsip Desain

| Prinsip | Penerapan |
|---|---|
| **Speed over completeness** | Check-in harian adalah aksi paling sering dilakukan — interaksi harus meminimalkan ketukan/ketikan, bukan memaksimalkan field yang bisa diisi |
| **Status is always visible** | Status risiko dengan label teks dan submission timing harus terlihat tanpa harus membuka detail; `NOT_APPLICABLE — NO_COMMITMENT` tetap dibedakan dari GREEN dan No Submission |
| **Exception-first, bukan report-first** | Dashboard manajemen menonjolkan yang perlu perhatian (RED, AMBER, unacknowledged, no-submission), bukan menampilkan semua data secara merata |
| **No silent state change** | Sistem boleh menyarankan, tapi tidak pernah mengubah pilihan/data user tanpa konfirmasi eksplisit atau jendela objection yang jelas (Status Suggestion Engine, Correction Request) |
| **Locked ≠ hidden** | Setelah Cut-Off, baseline terkunci secara visual jelas (read-only + indikator), bukan disembunyikan dari user |
| **Role-first navigation** | Navigasi dan widget menyesuaikan role aktif user; tidak ada kebocoran akses visual ke data di luar scope |
| **Escalation proximity** | Aksi terkait blocker/eskalasi (acknowledge, resolve) selalu berada dekat dengan konteks blocker terkait |
| **Default-approve ≠ tanpa kontrol** | Mekanisme yang berjalan otomatis (Correction Request Material, Objection Window) tetap harus terlihat jelas ke pihak yang berwenang menolak — bukan berjalan sunyi di belakang layar |

---

## 2. Role & Navigation Pattern

Satu aplikasi dengan navigasi yang menyesuaikan role aktif user (bukan portal terpisah).

| Role | Menu Utama yang Terlihat |
|---|---|
| Employee | My Today, My History, **My Leave Request**, Notifications, Profile |
| Supervisor/TL | Menu dasar sesuai role + **Pulse Dashboard** (Team Pulse, hanya team/assigned scope yang sah), Blocker Queue (scoped), Support/Coaching Note (jika berwenang), **Correction & Leave Review (jika Authorized Reviewer)** |
| Head | Menu dasar sesuai role + **Pulse Dashboard** (Function Pulse, hanya function scope yang sah), Blocker & Escalation Queue (function-scoped), Coaching/Manager Notes (scoped), **Reports (function-scoped)**, **Correction & Leave Review (jika Authorized Reviewer)** |
| PM | My Today, My History + Project Risk (reference-based, scoped); Pulse Dashboard tidak otomatis tersedia |
| HRGA | Compliance Queue, **Leave Approval (jika Authorized Approver)**, Holiday/Exemption Management (sesuai kewenangan), Coaching/Warning Record (sesuai kewenangan), **Reports (compliance-scoped)**, **Correction & Leave Review (jika Authorized Reviewer/Approver)**; Pulse Dashboard tidak otomatis tersedia |
| CEO/Management | Menu dasar sesuai role + **Pulse Dashboard** (Management Pulse, company-wide jika berwenang), Escalation Aging, **Reports (company-wide)** |
| System Admin | Admin: User & Org (sesuai kewenangan), Temporary Reviewer, Notification Setup; Pulse Dashboard tidak otomatis tersedia tanpa permission dashboard |

> **Policy Settings bukan lagi menu eksklusif System Admin.** Menu "Policy Settings" muncul untuk **role mana pun yang punya minimal satu kategori kebijakan sebagai kewenangannya** (sesuai FR-34/BR-15) — isinya di-filter per kategori yang jadi authority-nya masing-masing. Lihat Section 4.18.

User dengan multi-role (mis. Head yang juga mengisi check-in sendiri) tetap punya akses "My Today" sebagai Employee — role tambahan menambah menu, tidak menggantikan menu dasar.

**Struktur sidebar dan konteks akun:**
- Sidebar mengelompokkan menu menjadi **Workspace** (alur pribadi/self-service) dan **Management** (dashboard, queue, reporting, dan governance) bila role aktif memiliki menu pada kedua kelompok. Kelompok yang kosong tidak ditampilkan. Urutan dan nama menu tetap mengikuti tabel role di atas; pengelompokan tidak menciptakan permission baru.
- Identitas akun (nama dan role aktif) berada pada area akun di bagian bawah sidebar, mengikuti pola shell yang konsisten antarlaman. Jangan menambahkan kartu besar berisi role/scope/permission tepat di bawah logo sebagai elemen wajib global.
- Scope aktif dan permission relevan ditampilkan secara ringkas pada konteks halaman management yang membutuhkannya—misalnya subtitle, badge, atau scope note—bukan diduplikasi sebagai daftar chip di bagian atas setiap sidebar. Pada halaman self-service, tidak perlu menampilkan daftar permission; identitas akun dan menu Workspace sudah memadai.
- Label role, scope, dan permission harus berasal dari role, permission, dan assignment efektif yang ditetapkan sistem; bukan pilihan bebas pengguna dan bukan sekadar teks dekoratif. Menu hanya ditampilkan jika permission sesuai, dan route/data tetap wajib divalidasi di sisi server. Permission bersyarat (mis. Authorized Reviewer/Approver) yang belum diberikan tidak menampilkan menu terkait. Jangan menampilkan scope atau izin yang tidak dimiliki pengguna.

---

### Aturan final layout sidebar (revisi v1.7.2)
- Logo/brand dan awal grup Workspace harus memiliki jarak vertikal yang jelas; jarak tidak boleh tampak menempel. Jarak ini diterapkan konsisten pada seluruh shell halaman Workspace/Management.
- Bila kedua grup tersedia, Workspace dan Management harus memiliki jarak vertikal yang jelas di antara grup. Jangan mengandalkan margin label saja; gunakan jarak antarkelompok yang eksplisit.
- Identitas akun berada di bagian paling bawah sidebar, dipisahkan oleh pembatas halus. Jangan menempatkan kartu role/scope/permission besar di bawah logo.
- Pada halaman self-service, tampilkan identitas akun secara ringkas; daftar permission tidak diperlukan. Pada halaman management, scope efektif dan permission yang relevan dijelaskan di konteks konten, dan bila diperlukan ringkasan ringkas di area akun bawah.
- Bila viewport pendek, jarak boleh dikurangi secara responsif tetapi urutan, pemisahan grup, dan penempatan identitas di bagian bawah tetap dijaga. Sidebar harus tetap dapat discroll tanpa menutupi navigasi atau identitas akun.

## 3. Information Architecture

```
/login

/today
  /today/morning                     Morning Commitment
  /today/morning/correction-request  Morning Correction Request (pasca Cut-Off, jika diizinkan policy)
  /today/additional-work             Add Additional Work
  /today/eod                         EOD Outcome & Continuation
  /today/eod/correction-request      EOD Correction Request (hanya EOD yang sudah submit dan locked)
  /today/raise-blocker               Raise Instant Blocker
  /today/leave-request               Ajukan Leave Request

/history                             My History & Weekly Summary
/history/:date                       Detail satu hari

/notifications                       Web Notification Center
/profile                             Profile & Settings

/team                                Team Pulse Dashboard (target route dari menu Pulse Dashboard; Supervisor/TL, team/assigned scope)
/team/blockers                       Blocker Queue (scoped)
/team/reviews                       Correction & Leave Review Queue (scoped; tampil sesuai permission Authorized Reviewer/Approver)
/function                            Function Pulse Dashboard (target route dari menu Pulse Dashboard; Head, function-scoped)
/function/coaching                   Manager Note / Coaching Record
/function/escalations                Blocker & Escalation Queue (function-scoped)

/my-scope/project-risk               Project Risk View (PM) — agregasi berbasis Reference/Task

/compliance                          Compliance Queue (HRGA)
/compliance/exemptions               Holiday & individual Exemption Management (Admin/HRGA berwenang)
/compliance/leave-approvals          Leave Approval Queue (Authorized Approver)
/compliance/records                  Coaching/Warning Record (permission ketat)

/management                          Management Pulse Dashboard (target route dari menu Pulse Dashboard; CEO/Management berwenang, company-wide)
/management/escalations              Escalation Aging (company-wide)

/reports                            Reports (scope mengikuti role — lihat 4.23)
/policy-settings                    Policy Settings (multi-owner, filtered per kategori kewenangan)
/admin/users                         User & Role Management
/admin/organization                  Organizational Mapping (Admin/Management berwenang; effective-dated)
/admin/temporary-reviewer            Temporary Reviewer Assignment (Admin/Management berwenang)
/admin/notifications                 Notification Channel Setup
```

---

## 4. Spesifikasi Halaman (Behavior, bukan Visual)

### 4.1 Login & Aktivasi Akun
- Halaman login menerima kredensial dari akun aktif yang telah dibuat Admin/Management berwenang. Tidak tersedia public self-registration.
- Karyawan yang belum mengaktifkan akun masuk melalui tautan undangan sekali pakai yang dikirim ke alamat akun yang telah dibuat sebelumnya. Halaman aktivasi menampilkan konteks akun yang diundang, memungkinkan karyawan menetapkan kredensial sendiri, dan tidak pernah menampilkan atau mengirim kata sandi permanen.
- Token yang sudah digunakan, kedaluwarsa, dicabut, atau tidak cocok dengan akun tidak boleh mengaktifkan akun. Tampilkan state error yang menjelaskan langkah berikutnya (minta undangan baru melalui admin), tanpa membocorkan apakah akun orang lain ada.
- Setelah aktivasi berhasil, tampilkan konfirmasi dan arahkan ke login. Setelah login, arahkan ke `/today` dan tampilkan navigasi sesuai seluruh role/scope aktif. Tidak menetapkan role atau function dari input pengguna.
- Alur lupa/reset password hanya memulihkan akses ke akun yang sudah ada; tidak membuat akun baru.
- State minimum untuk prototype: login default, validasi kredensial gagal, akun nonaktif, undangan valid, undangan kedaluwarsa/terpakai, aktivasi berhasil, dan reset password berhasil/gagal.

### 4.2 My Today — Morning Commitment
- Halaman menampilkan konteks applicable workday, status submission, On-Time Deadline/Cut-Off yang berlaku, serta state submission (belum diisi, tersimpan On-Time, tersimpan Late, atau locked). Nilai waktu yang ditampilkan berasal dari konfigurasi efektif; jangan menuliskan jam produksi tetap di desain.
- **Indefinite Role Exemption (FR-35, BR-07):** Untuk user/jabatan struktural yang dikecualikan secara terbuka tanpa batas waktu (misal CEO, Dewan Direksi), halaman `/today` menampilkan banner penjelas tenang (`ExemptionBanner`): *"Akun Anda memiliki status Pengecualian Partisipasi Terbuka (Indefinite Role Exemption) sesuai kebijakan organisasi. Pengisian Check-in bersifat opsional."* Form tetap dapat diisi bila user ingin mencatat komitmen harian secara mandiri, tetapi tombol submit tidak dibatasi penalti keterlambatan, tidak ada countdown Cut-Off yang menekan, dan sistem tidak pernah mengevaluasi akun ini sebagai No Submission.
- Form mendukung **0–3 Commitment**. Untuk setiap Commitment, field wajib: teks Commitment dan Initial Risk (GREEN/AMBER/RED); Reference/Task Link opsional. Initial Risk AMBER/RED menampilkan Known Blocker dan Support Needed yang wajib diisi. Validasi inline harus menjelaskan field yang belum lengkap dan mempertahankan input saat gagal.
- Jika jumlah Commitment = 0, tampilkan keadaan kosong yang eksplisit dan field alasan wajib. Pilihan nol Commitment adalah keadaan submission yang valid, bukan keadaan form yang gagal atau event No Submission. Setelah submit yang valid, submission tetap dicatat menurut aturan waktu; Initial Daily Status ditampilkan sebagai `NOT_APPLICABLE — NO_COMMITMENT`, bukan GREEN/AMBER/RED dan bukan No Submission.
- Initial Daily Status ditampilkan sebagai hasil agregasi yang hanya-baca (selama pengisian merupakan preview dari data draft; setelah submit menjadi hasil tersimpan): jika salah satu Initial Risk RED → RED; jika tidak ada RED tetapi ada AMBER → AMBER; jika minimal satu Commitment dan semuanya GREEN → GREEN; jika tidak ada Commitment → `NOT_APPLICABLE — NO_COMMITMENT`. UI tidak menyediakan kontrol untuk mengubah hasil agregasi secara manual.
- **FR-11 copy-forward (ADR-017):** tampilkan sebagai koleksi draft terpisah yang bersumber secara eksklusif dari seluruh Morning Commitment eligible pada hari kerja sebelumnya untuk karyawan yang sama dengan `continuation = Continue`. Jangan memasukkan Additional Work atau `Tomorrow Priority`; jangan menghilangkan atau menggabungkan item eligible, dan jangan menyiratkan bahwa sistem memilih item berdasarkan penilaian baru. Pengguna memilih maksimal 3 item untuk mengisi slot hari ini; koleksi eligible tetap dapat ditinjau saat pemilihan berlangsung. Memilih draft hanya mengisi form, bukan submit. Item terpilih harus ditinjau, dilengkapi field wajib, dan boleh diedit sebelum submission. Tidak ada auto-submit dan tidak ada slot ke-4.
- `Tomorrow Priority` dari EOD hari kerja sebelumnya, jika ada, ditampilkan terpisah sebagai **konteks saja**, bukan sebagai draft Commitment, bukan slot yang bisa dikonfirmasi, dan tidak mengubah Initial Daily Status.
- **FR-12 / AC-37 Role-Based Prompt Hint (ADR-016):** Saat user mengetik teks Commitment, `RoleBasedPromptHint` muncul sebagai teks petunjuk visual miring (*italic* inline placeholder) yang disesuaikan dengan 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) serta fallback netral sesuai FR-12 PRD v1.5. Hint ini bersifat murni pemandu visual (non-binding), tidak mengontaminasi isi input form pengguna, dan tidak disimpan ke database.
- **FR-63 / AC-72 Commitment Quality Warning / Prompt:** Jika teks komitmen terdeteksi terlalu abstrak atau generik (misal hanya kata tunggal "development", "meeting", "follow-up", "kerja"), sistem memunculkan quality warning kontekstual di bawah field input (`QualityWarningBadge`): *"Komitmen tampak sangat umum. Sebutkan deliverable teramati yang diharapkan selesai hari ini."* Warning ini bersifat edukatif dan pemandu, **tidak menghalangi tombol submit yang valid**, tidak menghasilkan rating kinerja otomatis, dan pengguna tetap memegang kendali penuh atas komitmen yang disubmit.
- Sebelum Cut-Off, tombol submit aktif jika validasi lulus. Pada atau sebelum On-Time Deadline → On-Time; setelah deadline hingga dan termasuk Cut-Off → Late; setelah Cut-Off → request ditolak tanpa menulis submission baru. Grace Period `0` berarti Cut-Off sama dengan deadline (menggunakan nullish coalescing `?? 30` sesuai ADR-018). Tampilan error setelah Cut-Off harus mempertahankan draft lokal selama sesi jika aman, menampilkan status Locked, dan menawarkan Correction Request hanya jika policy mengizinkannya.
- Setelah Cut-Off, baseline Morning menjadi read-only. Jika Correction Request tidak diizinkan, tidak menampilkan tombol tersebut; jika diizinkan, CTA membuka **Morning Correction Request** khusus (4.16a). Tidak ada inline edit atau jalan pintas direct edit.

### 4.3 Add Additional Work
- Form terpisah dari Morning Commitment (bukan slot ke-4). Dapat diakses kapan saja sepanjang hari kerja pasca-Morning Check-in.
- Field: deskripsi, Reason (dropdown: Newly Assigned / Missed in Planning / Priority Change / Operational-Incident / Other).
- Reason = Newly Assigned → field "Assigned By" muncul dan wajib diisi sebelum submit.
- Additional Work yang sudah dibuat tetap muncul terpisah secara visual dari Commitment 1–3 di sepanjang hari (termasuk saat EOD), dengan bobot tampilan yang setara — bukan sebagai catatan kecil/sekunder.
- Sesuai ADR-001, Additional Work tidak memiliki permanent lock setelah Cut-Off, tetapi setiap perubahan dan penambahan dilindungi oleh `AuditLog` append-only yang immutable.

### 4.4 My Today — EOD Outcome
- Menampilkan semua Morning Commitment dan Additional Work yang relevan dalam dua kelompok yang teridentifikasi jelas; kedua jenis item mendapat bobot visual dan perlakuan outcome setara. Item Morning tetap merujuk pada baseline yang dikomit; Additional Work tidak pernah menjadi slot Commitment.
- Setiap item memiliki dua kontrol independen: Outcome (`Completed`, `Partially Completed`, `Not Completed`, `Cancelled`) dan Continuation (`Continue`, `Do Not Continue`). Jika Outcome `Cancelled`, alasan wajib. Jika Continuation `Continue`, Continuation Reason wajib **termasuk saat Outcome `Completed`**. Validasi tidak boleh hanya memicu alasan ketika outcome belum selesai.
- Field `Final Status` berlaku pada tingkat hari. Jika `AMBER` atau `RED`, penjelasan risiko/blocker tingkat-hari wajib diisi dan dibedakan dari Known Blocker/Support Needed per Commitment.
- Status Suggestion ditampilkan sebagai saran terpisah dan dihitung dengan heuristik tetap PRD FR-13 / AC-38 (ADR-013):
  1. Blocker aktif Critical → RED;
  2. Jika minimal 50% item pekerjaan dengan Outcome valid berstatus Not Completed atau Cancelled → RED;
  3. Jika carry-over/continuation kedua berturut-turut pada item komitmen yang sama atau terdapat blocker aktif High → minimal AMBER;
  4. Jika ada Outcome Partially Completed, Not Completed, atau Cancelled tetapi proporsi Not Completed/Cancelled di bawah 50% → minimal AMBER;
  5. GREEN hanya bila ada item yang dapat dievaluasi, seluruhnya Completed, tidak ada carry-over berulang kedua, dan tidak ada blocker aktif;
  6. Bila tidak ada item yang dapat dievaluasi dan tidak ada blocker aktif, tidak ada saran. Blocker aktif adalah Open, Acknowledged, atau In Progress.
- Jika status pilihan user tidak konsisten dengan data, tampilkan `ValidationPromptModal` yang menjelaskan ketidaksesuaian dan menyediakan pilihan untuk mempertahankan status pilihan (dengan penjelasan) atau mengikuti saran sistem. Jangan mengubah pilihan secara diam-diam. Alasan untuk Final Status AMBER/RED tetap wajib sesuai FR-10. Heuristik tidak dapat diubah melalui Policy Configuration.
- `Tomorrow Priority` bersifat opsional dan tersimpan setelah EOD submit. Pada Morning hari kerja berikutnya, tampilkan sebagai konteks terpisah. Jangan pernah menggunakannya untuk membuat, memilih, mengurutkan, atau mengubah draft FR-11 maupun Initial Daily Status.
- Submission EOD mengikuti deadline/cutoff yang sama polanya dengan Morning: On-Time pada/sebelum deadline, Late setelah deadline sampai dan termasuk Cut-Off, ditolak tanpa write setelah Cut-Off. State terkunci menunjukkan status submission dan jalur koreksi yang benar.
- Setelah EOD tersimpan dan terkunci, koreksi hanya melalui **EOD Correction Request** (4.16b). Form ini tidak muncul jika EOD tidak pernah disubmit; tidak dapat membuat EOD baru, menghapus No Submission, atau mengubah Morning baseline.

### 4.5 Raise Instant Blocker
- Dapat diakses kapan saja dari mana pun (tidak terkunci ke siklus Morning/EOD), termasuk saat baseline sudah locked.
- Form Blocker mewajibkan field taksonomi resmi sesuai PRD FR-16 & AC-55:
  - **Type (10 enum resmi PRD):** `Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`. (UI dapat menyertakan label deskriptif pembantu, mis. `Requirement (Ambiguitas Spesifikasi)`, `Vendor (Pihak Ketiga)`).
  - **Severity (4 enum resmi PRD):** `Critical`, `High`, `Medium`, `Low`.
  - **Impact (7 enum resmi PRD):** `Task`, `Milestone`, `Project`, `Production`, `Client`, `Financial`, `Compliance`.
  - **Authority Context:** `Organizational Authority` (default) atau `Project Authority` (eksplisit).
  - **Pilihan orang tertentu (opsional):** default kosong (*“Tidak memilih orang tertentu”*).
  - **Expected Resolution (opsional):** target tanggal/waktu atau teks ekspektasi penyelesaian.
- `Organizational Authority` menjadi Authority Context default. `Project Authority` hanya dipilih secara eksplisit ketika blocker berkaitan dengan project/reference tertentu; jika dipilih, konteks project/reference yang diperlukan harus teridentifikasi.
- Pilihan orang tertentu bersifat opsional. Gunakan keadaan kosong dengan label seperti **“Tidak memilih orang tertentu”**; jangan menambahkan pilihan terpisah “Biarkan sistem menentukan”. Bantuan singkat menjelaskan bahwa jika kolom dibiarkan kosong, sistem menentukan Owner Needed berdasarkan Authority Context dan aturan penugasan yang berlaku:
  - Untuk Organizational Authority, Direct Manager (Level 1) adalah kandidat awal bagi blocker pekerjaan sehari-hari.
  - Untuk Project Authority, sistem menggunakan Project Authority Mapping aktif yang cocok dengan project/reference.
- Matriks eskalasi bawaan mengikuti hierarki 4 jenjang Dutamedia: Level 1 (Direct Manager/Lead) → Level 2 (Head of Department) → Level 3 (Department Head of Operations / General Management) → Level 4 (CEO / Board of Directors).
- Jika pengguna memilih orang, sistem memvalidasi status aktif, Authority Context, scope, dan assignment/mapping yang berlaku. Pilihan yang tidak valid menampilkan pesan yang dapat ditindaklanjuti dan tidak diterima diam-diam.
- Jika penerima otomatis tidak tersedia atau ambigu, sistem menggunakan fallback yang dikonfigurasi. Jika tidak ada penerima valid setelah fallback, submit gagal dengan pesan yang jelas; UI tidak menampilkan status berhasil dan tidak mengirim kepada orang yang tidak sesuai.
- Setelah penerima berhasil ditentukan, submit memicu notifikasi sesuai Notification/Escalation Rules. Penentuan Owner Needed awal tidak boleh disamakan dengan escalation chain.

### 4.6 My History & Weekly Summary
- List/kalender per hari dengan status badge; klik → detail hari tersebut (read-only).
- Tiap hari menampilkan **dua dimensi berdampingan**: submission timing (On-Time/Late/No Submission) dan Final Status (GREEN/AMBER/RED) bila EOD valid tersedia — keduanya tidak digabung jadi satu badge. Initial Daily Status, jika ditampilkan, merupakan dimensi terpisah; `NOT_APPLICABLE — NO_COMMITMENT` tidak boleh dipetakan menjadi GREEN. Bila belum ada EOD, jangan mengarang Final Status.
- **Weekly Summary (FR-66, FR-67):** Agregat Commitments, distribusi Outcome, Status Days, recurring pattern Continuation, **Support Contribution yang diberikan (FR-64)**, Open Escalations, serta Manager Notes yang diizinkan dilihat user.
- Tampilan riwayat dan summary tidak menggunakan streak kompetitif, pemeringkatan rekan kerja, atau elemen leaderboard (FR-66).
- Riwayat Correction Request (Applied/Rejected) milik user ikut tampil di detail hari terkait, dengan tautan ke detail pengajuannya. 
- `ExportButton` tersedia untuk export histori/weekly summary milik sendiri sebagai evidence pribadi (FR-42).

### 4.7 Web Notification Center & Browser Push
- Web Notification Center adalah daftar notifikasi in-app yang tersimpan, terurut waktu, dengan indikator dibaca/belum dan deep link ke konteks terkait. Status dibaca di pusat notifikasi tidak boleh disamakan dengan status delivery Email/Browser Push.
- Browser Push merupakan delivery nyata pada MVP hanya untuk trigger yang ditetapkan di PRD Section 8. Ringkasan trigger/channel yang harus tercermin di UI:
  - Morning/EOD mendekati On-Time Deadline: Employee — Email + Browser Push.
  - AMBER + support needed: assigned support owner + employee — Email + Browser Push + Web Notification Center.
  - RED, critical/instant blocker, dan blocker unacknowledged melewati threshold: penerima sesuai authority/escalation chain — Email + Browser Push.
  - Repeated No Submission: Supervisor/Head (HRGA jika threshold terpenuhi) — Email.
  - Weekly summary: Employee + Manager sesuai konfigurasi — Email.
  - Policy/organizational assignment change: affected user + relevant Authorized Policy Owner — Web Notification Center.
  - Morning/EOD Material Correction Request submitted: Authorized Reviewer — Web Notification Center + Email; approaching end of Objection Window — Web Notification Center; Applied/Rejected — employee submitter via Web Notification Center.
  - Invitation issued/resend: account owner — Email; Leave Request submitted: Authorized Approver — Email + Browser Push; Leave approved/rejected: employee submitter — Email + Web Notification Center.
  Semua notifikasi tercatat di Web Notification Center sesuai PRD; tabel ini bukan izin untuk menambah Push pada trigger yang tidak tercantum.
- Untuk browser yang mendukung Push dan izin belum diberikan, tampilkan penjelasan singkat dan aksi eksplisit untuk mengaktifkan izin. Jangan meminta izin secara berulang atau menghalangi check-in jika izin ditolak.
- Jika browser tidak mendukung, izin ditolak, subscription tidak tersedia, atau delivery gagal, UI menampilkan status kanal yang akurat (tidak aktif/tidak didukung/gagal) dan tidak menampilkan “Push terkirim”. Proses inti tetap berjalan; gunakan Email dan Web Notification Center sesuai matriks trigger. Jangan menyamakan “notifikasi tercatat” dengan “push delivered”.
- Jika ada pengaturan channel, tampilkan status permission browser dan cara membuka pengaturan browser secara informatif; aplikasi tidak boleh berpura-pura dapat mengubah permission browser sendiri.

### 4.8 Team Pulse / Function Pulse / Management Pulse Dashboard
Pola sama di ketiga level (scope berbeda: team/scoped, function, company-wide):
- Ketiganya diakses melalui satu item sidebar bernama **Pulse Dashboard**. Item ini bukan dashboard keempat dan bukan pemberian akses universal; ia merupakan pintu navigasi ke dashboard yang diizinkan.
- Saat pengguna hanya memiliki satu cakupan dashboard, klik membuka dashboard itu langsung: Supervisor/TL → Team Pulse; Head/Function Owner → Function Pulse; CEO/Management yang berwenang → Management Pulse.
- Jika pengguna memiliki lebih dari satu kewenangan dashboard yang valid, UI menyediakan pemilih cakupan hanya untuk opsi yang memang diizinkan. Tidak boleh menampilkan pilihan cakupan tanpa permission yang sesuai.
- Employee biasa tidak melihat item Pulse Dashboard dan tidak memperoleh akses ke ketiga dashboard hanya karena memiliki akun. PM, HRGA, dan System Admin juga tidak otomatis memperoleh akses dashboard; akses hanya tersedia jika diberikan secara eksplisit oleh role/permission dan scope yang sah.
- Route dan data tetap wajib memvalidasi authorization di sisi sistem. Menyembunyikan item sidebar saja tidak cukup. Permintaan tanpa izin atau di luar scope harus ditolak tanpa membocorkan data.
- **Exception-first layout**: bagian teratas menampilkan RED, unacknowledged blocker, dan no-submission.
- **Widget Resmi Dashboard Head / Supervisor (FR-68):**
  1. **Team status summary:** jumlah status GREEN, AMBER, RED, dan No Submission hari ini.
  2. **Exceptions first:** daftar item berkategori RED, AMBER, carry-over berulang, blocker belum di-acknowledge, dan kejadian No Submission.
  3. **Open blockers by owner:** daftar blocker terbuka dikelompokkan berdasarkan support owner penanggung jawab.
  4. **Carry-over trend:** sorotan pekerjaan yang mengalami `Continuation = Continue` berulang $\ge 2$ hari berturut-turut.
  5. **Cross-project support:** rekaman kontribusi bantuan lintas tim/proyek yang diberikan anggota tim (FR-64).
  6. **Weekly team summary:** ringkasan mingguan keandalan komitmen tim tanpa elemen leaderboard atau pemeringkatan.
- **Widget Resmi Management Pulse / CEO Dashboard (FR-69):**
  1. **Company-wide exception overview by function:** ringkasan komparatif exception lintas divisi.
  2. **RED/AMBER trend per function & project:** grafik tren risiko mingguan/bulanan per fungsi dan proyek.
  3. **Top recurring blockers by category:** visualisasi taksonomi blocker paling sering dari 10 kategori resmi (`Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`).
  4. **No-submission trend & repeated compliance cases:** grafik tren kepatuhan pengisian dan kasus pola No Submission.
  5. **Unresolved escalation aging:** daftar penuaan eskalasi blocker yang belum tuntas.
  6. **Project-impact & client-impact incidents:** sorotan blocker dengan dampak `Project`, `Production`, atau `Client`.
- Dilarang mutlak menampilkan leaderboard, ranking individu berbasis volume task, atau skor KPI otomatis (FR-69).
- Antrean Correction Request dan Leave Request ditampilkan melalui menu/queue khusus hanya kepada Authorized Reviewer/Approver dalam scope-nya.

### 4.9 Blocker & Escalation Queue
- List blocker sesuai scope, dengan filter taksonomi lengkap menggunakan `FilterBar`: Type (10 enum), Severity (4 enum), Impact (7 enum), dan Status (`Open`, `Acknowledged`, `In Progress`, `Resolved`, `Closed`, `Accepted Risk`).
- Row/detail menampilkan Owner Needed berdasarkan **authority context**: sistem menandai apakah owner ditentukan lewat Organizational Authority (default) atau Project Authority (dipilih eksplisit), dan bila relevan menampilkan bahwa penerima dipilih manual atau ditentukan otomatis. Perbedaan ini terlihat jelas di UI via `AuthorityTag`, bukan disamarkan sebagai satu "assignee" generik.
- **Action button yang tampil hanya sesuai state blocker dan kewenangan aktor saat ini:**
  - `Open` → Tombol `Acknowledge` bagi assigned support owner atau hierarki di atasnya.
  - `Acknowledged` → Tombol `Start Progress` / `Update` memindahkan ke `In Progress`.
  - `In Progress` → Tombol `Resolve` (mewajibkan `Resolution Note` rinci) memindahkan status ke `Resolved`.
  - `Resolved` → Khusus pelapor (`raisedByUserId`):
    - Tombol `Confirm Closed` → memindahkan ke status final `Closed`.
    - Tombol `Reopen / Needs Further Work` → mengembalikan status ke `In Progress` dengan catatan penjelasan wajib jika bantuan belum memadai.
    - Status tetap `Resolved` (tidak pernah auto-close karena berlalunya waktu) hingga pelapor mengambil tindakan.
  - `Accepted Risk` → Jalur terpisah khusus authority berwenang (misal Head atau Management) dengan `Risk Acceptance Rationale` wajib; bukan sinonim `Resolve`/`Closed`.
  - **Pencatatan Dukungan Rekan (Support Contribution - FR-64):** Pada blocker aktif rekan kerja, anggota tim lain dapat mengklik tombol **"+ Berikan Dukungan (Record Support Contribution)"** untuk mencatat bantuan teknis yang diberikan.
  - Reassignment manual dibedakan dari Auto-Escalation sistematis (kenaikan jenjang Level 1 → 2 → 3 → 4 akibat unacknowledged melewati threshold SLA).
- Aksi yang tidak relevan/tidak diizinkan tidak ditampilkan; server tetap memvalidasi izin aktor.

### 4.10 Manager Note / Coaching Record
- Form membuat note dengan tipe: `Recognition`, `Coaching`, `Corrective`.
- Mengikuti **Matriks Distingsi Kasus (§13.1 PRD)** untuk membedakan secara adil antara: masalah kemampuan/kapasitas (*performance issue*), kelambatan eskalasi (*accountability issue*), pelanggaran proses (*discipline violation*), dan lupa administratif (*administrative miss*).
- Visibilitas note mengikuti pilihan yang diizinkan oleh permission/policy: `Private to Managers & HR` atau `Visible to Employee`.
- Employee hanya melihat note yang eksplisit ditandai visible ke dirinya di halaman History-nya. Catatan manajerial tidak pernah mengubah komitmen asli karyawan.

### 4.11 Compliance Queue (HRGA)
- Menampilkan flag repeated non-submission (3x dalam 30 hari kerja) dan compliance event lain dengan `FilterBar`.
- **Review Event Kepatuhan (FR-70–FR-73):** Pattern flag memicu *Review Event* yang mengharuskan pencatatan penjelasan karyawan, pembinaan yang diberikan, dan tindakan kesepakatan.
- Status tindak lanjut: `Reminder Sent`, `Coaching Scheduled`, `Recorded Warning`, atau `Escalated to Offline Disciplinary`.
- **Prinsip Non-Otomatisasi Sanksi (FR-30, FR-72):** Sistem DILARANG MUTLAK memiliki tombol "Issue SP" atau menghasilkan SP otomatis. Sistem hanya mencatat arsip pembinaan dan rujukan administratif; proses penegakan disiplin formal berlangsung **di luar sistem (offline HR process)**.

### 4.12 Exemption Management
- **Khusus Holiday dan Exemption administratif** (bukan Leave — lihat 4.20/4.21 untuk Leave Request karyawan).
- Mendukung dua kategori utama:
  1. **Holiday (Company-Wide):** Kalender libur resmi perusahaan/nasional.
  2. **Individual / Role Exemption:**
     - *Individual Exemption (Bounded):* Pengecualian karyawan tertentu (misal dinas luar/offsite) yang wajib memiliki rentang waktu (`Effective Date` dan `Expiry Date`).
     - *Indefinite Role Exemption (Open-Ended / Tanpa Batas Waktu):* Pengecualian jabatan struktural (CEO, Board of Directors) sesuai FR-35 & BR-07, yang tidak mewajibkan expiry date dan berlaku terbuka hingga dicabut secara manual oleh Admin/HRGA berwenang.
- Admin/HRGA berwenang menyimpan konfigurasi yang langsung aktif dan mengecualikan akun dari No Submission detection **tanpa antrean approval tambahan** (berbeda dari Leave yang wajib persetujuan atasan).
- Header halaman menampilkan catatan singkat yang membedakan: *"Holiday & Exemption berlaku langsung setelah disimpan. Untuk Leave karyawan, lihat Leave Approval Queue."*

### 4.13 Project Risk View (PM)
- Menampilkan agregasi Commitment/Additional Work anggota tim berdasarkan Reference/Task Link, **bukan** query terhadap entitas Project formal (tidak ada entitas Project formal di PRD; reference bersifat teks bebas/manual pada MVP).
- Menyorot item berstatus AMBER/RED atau pola Continuation `Continue` berulang pada kelompok reference yang ditampilkan.
- UI harus menampilkan nilai reference sumber secara jelas. Aturan pencocokan/pengelompokan reference diserahkan ke SAD; UI/UX tidak mengasumsikan exact match atau fuzzy match.

### 4.14 Escalation Aging (CEO/Management)
- List seluruh blocker berstatus Open/Acknowledged/In Progress yang melewati threshold waktu tertentu, diurutkan dari yang paling lama belum resolve.
- Menampilkan Authority Context (siapa saat ini bertanggung jawab) dan riwayat auto-escalation jika ada.
- Dashboard bersifat overview. Aksi pada blocker hanya ditampilkan bila CEO/Management juga memiliki authority yang sah untuk konteks blocker tersebut; jabatan CEO/Management saja tidak otomatis memberi hak Resolve/Close.

### 4.15 Admin: Organizational Mapping
- List struktur organisasi saat ini + tombol "View History" per person/role untuk melihat assignment sebelumnya (effective-dated).
- Perubahan assignment (create/edit/reassign) selalu meminta **Effective Date**. UI mempertahankan assignment historis dan tidak menghapus/menimpa histori. Perilaku perubahan dengan tanggal lampau tidak ditentukan di UI/UX ini; UI tidak boleh menjanjikan dampak retroaktif tanpa aturan otorisasi yang disahkan.
- Perubahan yang mempengaruhi hierarki (direct manager, project authority) menampilkan preview dampak sebelum konfirmasi (siapa yang terpengaruh, mulai kapan).
- Project Authority ditampilkan sebagai **mapping terpisah per person**, bisa lebih dari satu baris aktif sekaligus untuk scope/reference berbeda — bukan satu field tunggal dalam baris Organizational Assignment. ``

### 4.16 Correction Requests (dua alur terpisah)

#### 4.16a — Morning Correction Request
- CTA hanya muncul pada Morning baseline yang sudah locked dan hanya jika policy mengizinkan pengajuan. Targetnya **hanya field Morning Commitment**; tidak termasuk Additional Work, EOD fields, atau `Tomorrow Priority`.
- Form menampilkan baseline before sebagai read-only, nilai after yang diusulkan, dan Reason wajib. Pengguna dapat membatalkan sebelum submit tanpa mengubah baseline.
- Setelah submit, tampilkan ID/request reference, timestamp, klasifikasi Minor/Material, status, dan nilai yang diminta. Klasifikasi mengikuti policy efektif; dokumen UI tidak menetapkan sendiri contoh/threshold klasifikasi.
- **Minor:** langsung Applied setelah validasi; tampilkan ringkasan perubahan dan konfirmasi. **Material:** Pending selama Objection Window; baseline tetap tidak berubah hingga request Applied. Tampilkan sisa waktu, status, dan kapan perubahan akan diterapkan bila tidak ada objection.
- Authorized Reviewer melihat Material request dalam tab Pending Objection pada `/team/reviews`, hanya dalam scope kewenangannya. Reviewer dapat mengajukan objection dengan alasan selama window aktif; tidak diwajibkan melakukan tindakan. Objection valid → Rejected dan baseline asli tetap berlaku. Window berakhir tanpa objection → Applied. Item yang selesai keluar dari antrean aktif dan tersedia pada histori.
- Audit/history menampilkan target, reason, classification, status, aktor, timestamp, dan before/after sesuai kewenangan. User tidak boleh melakukan direct edit pada baseline dari layar riwayat.

#### 4.16b — EOD Correction Request
- CTA hanya muncul pada EOD yang **sudah disubmit dan terkunci**; tidak tersedia jika EOD tidak pernah disubmit. Record dan lifecycle EOD Correction Request terpisah dari Morning Correction Request.
- Form menampilkan nilai EOD tersimpan sebagai before/read-only, target field, nilai after yang diminta, dan Reason wajib. Target yang boleh dipilih: Outcome, Continuation, Continuation Reason, alasan Cancelled, Final Status, penjelasan risiko tingkat-hari, dan `Tomorrow Priority`; item Outcome/Continuation dapat mengacu ke Commitment atau Additional Work yang relevan.
- Jangan sediakan target untuk Morning Commitment baseline, deskripsi/reason Additional Work yang bukan field EOD, pembuatan EOD baru, atau penghapusan/pembatalan event No Submission.
- Klasifikasi dan lifecycle sama secara prinsip: Minor langsung Applied; Material Pending selama Objection Window, lalu Applied bila tidak ada objection sah, atau Rejected jika Authorized Reviewer mengajukan objection dalam window. Baseline EOD tidak berubah selama Material masih Pending.
- Sisi reviewer memakai antrean dan indikator window yang sama, tetapi item harus diberi label jelas **EOD Correction** agar tidak tertukar dengan Morning Correction. Employee melihat status, alasan rejection, dan audit/history yang sesuai.

#### Aturan bersama untuk kedua alur
- Jangan gunakan satu form ambigu yang memungkinkan target Morning dan EOD bercampur. Pisahkan judul, route, field selector, summary, dan record history.
- Error submit tidak boleh membuat request duplikat atau menampilkan Applied sebelum server mengonfirmasi. Tampilkan status yang benar berdasarkan hasil server.
- Objection setelah window berakhir ditolak dan tidak mengubah request yang sudah Applied. Semua transisi dan nilai before/after ter-audit.

### 4.17 Admin: Temporary Reviewer
- Form assignment: reviewer, scope, Effective Date, Expiry Date (wajib diisi, tidak boleh open-ended tanpa batas).
- List assignment aktif menampilkan hitung mundur ke expiry; setelah expiry, otomatis tidak lagi menerima eskalasi tanpa perlu aksi manual admin.

### 4.18 Policy Settings ``
- Diakses lewat `/policy-settings`, **bukan lagi rute khusus Admin** — halaman ini terbuka untuk role apa pun, tapi isinya di-filter penuh sesuai kategori kebijakan yang jadi kewenangan role/user tersebut (FR-34/BR-15).
- Tiap kategori kebijakan (cutoff, grace period, workday calendar, escalation threshold, retensi, **Objection Window duration**, **batas Minor/Material**, dll.) memiliki halaman/section sendiri.
- User yang membuka halaman ini hanya melihat kategori yang authority-nya dia pegang — kategori lain **tidak ditampilkan sama sekali** (disembunyikan, bukan disabled dengan tooltip), konsisten dengan behavior lama.
- Perubahan nilai kebijakan selalu membuat **versi baru** dengan Effective Date — tidak ada "overwrite" nilai lama secara langsung; versi lama tetap tersimpan dan terlihat di riwayat lewat `PolicyVersionHistory`.
- Contoh konkret: System Admin melihat section Cutoff/Grace Period/Workday Calendar; Head/Management (jika ditetapkan sebagai Authorized Policy Owner untuk kategori tsb) melihat section Coaching Follow-up Period; HRGA melihat section Retention Policy untuk evidence disciplinary — semuanya di halaman yang sama, hanya section yang beda.

### 4.19 Admin: Notification Channel Setup
- Menampilkan matriks channel per trigger yang berasal dari PRD Section 8; konfigurasi tidak boleh memperluas Browser Push ke trigger yang tidak ditetapkan sebagai Push-enabled.
- Menampilkan status kesiapan konfigurasi Email dan Browser Push secara terpisah serta hasil uji kanal. Status permission/subscription browser bersifat spesifik pada browser/perangkat pengguna terkait; hasil test dari browser Admin tidak membuktikan Push aktif untuk seluruh karyawan. Test-send harus membedakan permintaan uji, status delivery yang benar-benar diketahui, dan kegagalan; pembuatan record saja bukan bukti Push berhasil.
- Perubahan konfigurasi memiliki validasi dan konfirmasi. Nilai operasional yang belum ditetapkan tidak boleh diisi dengan asumsi UI; Launch Configuration Register harus disahkan sebelum implementasi.

### 4.20 My Leave Request (Employee) 
- Form: tanggal/date range, Reason (opsional teks bebas).
- Submit → status **Pending**, notifikasi terkirim ke Authorized Approver dalam scope employee (Supervisor/Head/HRGA sesuai policy).
- Employee melihat status pengajuan (Pending/Approved/Rejected) di halaman ini dan di My History; tanggal yang diajukan ditandai visual sebagai "Leave (Pending)" sampai disetujui — **belum** mengecualikan dari No Submission selama masih Pending.
- Setelah Approved → tanggal menjadi valid exception dan dikecualikan dari No Submission detection sesuai FR-48; badge berubah menjadi "Leave (Approved)". PDD/PRD tidak menentukan secara eksplisit bagaimana event No Submission yang sudah tercatat sebelum persetujuan harus direkonsiliasi. Karena itu UI tidak boleh menjanjikan penghapusan diam-diam atau perubahan retroaktif pada evidence yang sudah tercatat; perilaku rekonsiliasi event yang sudah ada harus diputuskan sebagai keputusan produk sebelum implementasi.

### 4.21 Leave Approval Queue (Reviewer/HRGA) 
- List Leave Request Pending dalam scope reviewer, dengan `FilterBar` (per employee, per tanggal, per status).
- Aksi: **Approve** atau **Reject** (Reject wajib isi alasan singkat).
- Berbeda dari Correction Request — Leave **bukan** default-approve; tetap butuh aksi eksplisit approve/reject sebelum berlaku, karena dampaknya (mengecualikan dari No Submission) butuh validasi aktif, bukan sekadar koreksi data historis.

### 4.22 Correction & Leave Review (gabungan, entry point reviewer) 
- `/team/reviews` adalah entry point bersama bagi user yang ditetapkan sebagai Authorized Reviewer dan/atau Authorized Approver. Halaman menggabungkan tab **Pending Objection** (mencakup Morning dan EOD Correction Request Material) dan **Pending Leave Approval** (jika user juga Authorized Approver).
- Badge count hanya menjumlahkan item yang memang dapat ditindaklanjuti oleh pengguna dalam scope-nya. Tab tetap terpisah secara visual karena Correction Request Material memakai default-approve setelah Objection Window, sedangkan Leave wajib mendapat keputusan eksplisit; keduanya tidak boleh disamarkan sebagai satu jenis keputusan.

### 4.23 Reports 
- Diakses lewat `/reports`, scope mengikuti role yang membuka (Head → function-scoped, HRGA → compliance-scoped, CEO/Management → company-wide), mengikuti Permission & Visibility Requirements (PRD Section 7).
- Tab per jenis laporan (sesuai PRD Section 9 & Section 12):
  - **Daily Exception Report** — snapshot RED/AMBER/no-submission/critical blocker hari terpilih.
  - **Weekly Team Summary** — agregat mingguan dalam scope, menampilkan tren continuation berulang dan support contribution lintas tim (FR-65).
  - **Monthly Management Trend** — tren per fungsi, recurring root cause (10 taksonomi), escalation aging, compliance pattern (khusus CEO/Management, FR-69).
  - **Individual Review Evidence & Performance Transition Framework (FR-56–FR-59, AC-65–AC-68):**
    - Menyusun bukti akuntabilitas satu karyawan untuk periode terpilih dalam 4 dimensi: **Delivery**, **Quality**, **Accountability**, dan **Collaboration**.
    - Memisahkan secara transparan antara: fakta rekam jejak, catatan pembinaan (*Manager Note*), dan kesimpulan reviewer.
    - Reviewer berwenang dapat mencatat evaluasi kualitatif terpandu: `Strong`, `Meets`, `Needs Improvement`, atau `Unacceptable` beserta alasan dan evidence objektif.
    - **Guardrails Ketat (FR-57, FR-62):** Sistem DILARANG MUTLAK menghitung rating otomatis atau skor KPI mentah dari status GREEN/AMBER/RED, volume komitmen, atau jumlah task.
  - **Blocker Root Cause Report** — statistik 10 taksonomi blocker paling sering & identifikasi systemic bottleneck organisasi.
- Filter periode/tanggal via `FilterBar` di setiap tab.
- `ExportButton` tersedia di tiap tab, mengekspor **hanya** data yang sedang terlihat di layar (scope yang sama, tidak lebih luas) — sesuai AC-20.
- Tab yang muncul disesuaikan permission user yang membuka (mis. Supervisor/TL tidak melihat tab Monthly Management Trend karena bukan scope-nya).

---

## 5. Escalation & Notification Interaction Rules

- Kanal dan trigger mengikuti PRD Section 8. Untuk setiap event, UI membedakan: event terjadi, notification record dibuat, kanal dicoba, dan delivery channel berhasil/gagal jika status tersebut tersedia. Jangan menyatakan Browser Push berhasil hanya karena event/notifikasi in-app tercatat.
- Browser Push dikirim nyata untuk trigger yang ditetapkan. Push tidak universal; Email dan Web Notification Center digunakan sesuai matriks. Unsupported browser, permission denied, tidak ada subscription, dan delivery failure adalah state yang berbeda, tidak memblokir workflow inti, dan tidak boleh ditampilkan sebagai success.
- Reminder submission menggunakan aturan tetap ADR-014: hanya pada interval `[On-Time Deadline − 60 menit, On-Time Deadline)`, maksimal satu reminder per employee/per phase/per applicable workday, dan tidak dikirim setelah On-Time Deadline. Ini bukan reminder pada akhir Grace Period/Cut-Off. UI tidak menyediakan konfigurasi untuk mengubah lead time 60 menit atau menampilkan reminder sebagai perubahan status.
- Validasi submission memakai timestamp request, bukan waktu scheduler: On-Time jika `submittedAt ≤ deadline`; Late jika `deadline < submittedAt ≤ cutoff`; setelah Cut-Off ditolak tanpa write. `GracePeriod = 0` valid. Scheduler hanya menghasilkan cutoff lock/No Submission evaluation; UI tidak menjanjikan bahwa submission setelah cutoff dapat “diselamatkan” oleh job yang belum berjalan.
- RED/critical blocker dan escalation mengikuti trigger, penerima, authority context, serta threshold aktif yang telah disahkan. Unacknowledged RED melewati threshold → UI menampilkan auto-escalation sebagai event sistem, bukan tindakan manual.
- Correction Request Material yang mendekati akhir Objection Window memicu reminder kepada Authorized Reviewer sesuai matriks; countdown terlihat, namun reviewer tidak diwajibkan menindaklanjuti. Jika tidak ada objection hingga window berakhir, perubahan otomatis Applied.
- Leave Request tetap berstatus Pending sampai Authorized Approver mengambil keputusan. Matriks notifikasi PRD tidak menetapkan reminder tambahan hanya karena Leave Request menunggu terlalu lama; UI tidak boleh menjanjikan reminder tersebut.
- Browser Push permission prompt harus dipicu oleh aksi pengguna yang jelas; penolakan izin tidak boleh menghalangi pengguna menjalankan check-in, mengajukan blocker, atau melihat Web Notification Center.

## 6. Komponen Reusable (Fungsional, bukan Visual)

| Komponen | Fungsi | Dipakai di |
|---|---|---|
| `StatusBadge` | Menampilkan GREEN/AMBER/RED secara konsisten | Seluruh halaman dengan status |
| `SubmissionTimingBadge` | Menampilkan On-Time/Late/No Submission — terpisah dari StatusBadge | History, Compliance Queue |
| `CommitmentCard` | Satu unit commitment/additional work + outcome + continuation | Morning, EOD, History |
| `BlockerCard` | Detail blocker + action panel sesuai state saat ini, termasuk Resolved menunggu konfirmasi pelapor | Raise Blocker, Blocker Queue, History |
| `ActionPanel` | Menampilkan hanya aksi valid untuk state saat ini | Blocker Queue, Compliance Queue |
| `AuthorityTag` | Menandai apakah suatu assignment berasal dari Organizational atau Project Authority | Blocker, Escalation, Org Mapping |
| `EffectiveDatePicker` | Input tanggal efektif dan preview dampak; aturan tanggal lampau mengikuti kebijakan produk yang disahkan | Admin: Org Mapping, Temporary Reviewer, Policy Settings |
| `PolicyVersionHistory` | Menampilkan riwayat versi suatu kebijakan | Policy Settings |
| `ValidationPromptModal` | Modal konfirmasi saat status suggestion berbeda dari pilihan user | EOD Check-in |
| `ExceptionSummaryWidget` | Ringkasan count status + exception list di scope tertentu | Team/Function/Management Dashboard |
| `NotificationBell` | Indikator unread + dropdown ke Web Notification Center | Global topbar |
| `DraftBanner` | Menandai data sebagai draft copy-forward yang perlu konfirmasi | Morning Commitment |
| `ExemptionBanner` | Menampilkan banner penjelas status pengecualian partisipasi terbuka (Indefinite Role Exemption) bagi role eksekutif | `/today` (Morning & EOD) |
| `LockedIndicator` | Menandai submission/baseline yang terkunci pasca Cut-Off, alasan, dan jalur koreksi yang sesuai | Morning Commitment dan EOD (setelah cutoff) |
| `RoleBasedPromptHint` | Menampilkan teks petunjuk visual miring (*italic* inline placeholder) sesuai 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) serta fallback netral (non-binding, ADR-016) | Morning Commitment |
| `QualityWarningBadge` | Menampilkan inline warning/prompt saat teks komitmen terlalu generik/abstrak tanpa memblokir tombol submit (FR-63 / AC-72) | Morning Commitment |
| `SupportContributionCard` | Menampilkan catatan kontribusi dukungan rekan kerja lintas fungsi/proyek pada blocker terkait (FR-64 / AC-73) | Blocker Card, History, Weekly Summary |
| `ClassificationTag`  | Menandai Correction Request sebagai Minor atau Material | Morning/EOD Correction Request (4.16a, 4.16b) |
| `ObjectionWindowIndicator` | Countdown sisa waktu Objection Window sebelum auto-applied | Correction Request (4.16a, 4.16b) |
| `FilterBar` | Filter lintas dimensi (employee/function/project/date/status/blocker category) sesuai FR-37 | Team/Function/Management Pulse, Blocker & Escalation Queue, Compliance Queue, My History, Reports, Leave Approval Queue |
| `ExportButton`  | Memicu export data sesuai scope yang sedang terlihat di layar (FR-42/AC-20) | Reports, My History |

---

## 7. User Flows Komprehensif (User-Centric & Interactive Experience)

Bagian ini mendefinisikan seluruh **User Flows** (alur pengalaman dan interaksi pengguna) di dalam sistem WorkPulse secara komprehensif, sekuensial, dan terperinci. Setiap alur disusun dari sudut pandang nyata pengguna (manusia yang berhadapan dengan antarmuka) saat menyelesaikan tugasnya, diturunkan secara disiplin dari **PDD v1.4 FINAL** dan **PRD v1.5 FINAL**.

Setiap User Flow memuat:
1. **User Goal (Tujuan Pengguna)**: Kebutuhan atau sasaran yang ingin dicapai pengguna.
2. **Aktor & Peran**: Pengguna yang berinteraksi di layar serta pihak terkait.
3. **Entry Point & Tampilan Awal Layar**: Titik awal masuk dan komponen yang pertama kali terlihat di layar.
4. **Langkah Interaksi Antarmuka (Step-by-Step UI Action)**: Aksi spesifik pengguna (membaca, mengetik, memilih kontrol, mengklik tombol).
5. **Percabangan Interaksi UI (Decision Nodes & Branches)**: Jalur sukses (*Happy Path*), jalur alternatif, dan penanganan kondisi khusus.
6. **Umpan Balik Visual (Visual Feedback & Modals)**: Banner status, indikator loading, badge, modal konfirmasi, dan pesan error inline.
7. **Kondisi Akhir Layar (Ending State)**: Perubahan tampilan layar, penguncian data, dan rute navigasi akhir.

---

### 7.1 Domain 1: User Flows Autentikasi, Akun, & Akses Sesi

#### UF-01: Aktivasi Akun Pengguna Baru dari Undangan Surel (Single-Use Activation)
- **User Goal:** Karyawan baru ingin mengaktifkan akun WorkPulse dan menetapkan kata sandi mandiri pertamanya.
- **Aktor:** Karyawan Baru (penerima undangan) & Administrator (pembuat akun).
- **Entry Point & Tampilan Awal Layar:**
  - Karyawan membuka kotak masuk surel resmi perusahaan dan mengklik tombol/tautan *"Aktivasi Akun WorkPulse"*.
  - Peramban membuka rute `/login/activate?token=:token`.
  - Layar menampilkan logo perusahaan, judul *"Aktivasi Akun Karyawan"*, serta kotak informasi read-only berisi Nama Lengkap dan Alamat Email yang telah didaftarkan Admin.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan memeriksa kebenaran nama dan alamat surelnya.
  2. Karyawan mengklik field **"Kata Sandi Baru"** dan mengetik kata sandi pilihan mandirinya.
  3. Karyawan melihat indikator kekuatan kata sandi dan checklist kriteria keamanan (minimal 8 karakter, kombinasi huruf & angka) yang mencentang hijau secara real-time.
  4. Karyawan mengklik field **"Konfirmasi Kata Sandi"** dan mengetik ulang kata sandi.
  5. Karyawan menekan tombol utama **"Aktifkan Akun Saya"**.
- **Percabangan Interaksi UI:**
  - **Cabang A (Token Valid & Input Benar):** Tombol menampilkan state loading spinner. Layar berganti menampilkan kartu sukses besar dengan ikon centang hijau: *"Akun Anda Berhasil Diaktifkan! Selamat datang di Dutamedia WorkPulse."* Terdapat tombol CTA *"Lanjut ke Halaman Masuk (Login)"*.
  - **Cabang B (Kata Sandi Tidak Cocok / Kurang Kuat):** Border field konfirmasi berubah merah dengan pesan inline: *"Kata sandi tidak cocok."* Tombol submit tetap nonaktif hingga input valid.
  - **Cabang C (Token Kedaluwarsa / Pernah Digunakan / Dicabut):** Form penetapan kata sandi disembunyikan sepenuhnya. Layar langsung menyajikan *Empty/Error State*: *"Tautan aktivasi ini sudah tidak berlaku, telah digunakan, atau telah kedaluwarsa. Silakan hubungi Administrator atau HRGA untuk meminta tautan undangan baru."*
- **Umpan Balik Visual:** Indikator kekuatan kata sandi interaktif, pesan inline error tanpa refresh halaman, modal/kartu sukses.
- **Kondisi Akhir Layar:** Akun berstatus `Active`, token sekali pakai hangus permanen, pengguna mengklik tombol login menuju `/login`.

#### UF-02: Masuk Aplikasi (Login) dengan Penyesuaian Navigasi Sesuai Role
- **User Goal:** Pengguna terdaftar ingin masuk ke aplikasi dan mengakses workspace sesuai tanggung jawabnya.
- **Aktor:** Seluruh Karyawan & Pimpinan (Multi-role).
- **Entry Point & Tampilan Awal Layar:**
  - Pengguna membuka rute `/login`.
  - Tampilan layar: Form login bersih dengan field Email, Kata Sandi, checkbox *"Ingat Saya"*, tautan *"Lupa Kata Sandi?"*, dan tombol utama *"Masuk"*.
- **Langkah Interaksi Antarmuka:**
  1. Pengguna mengetik alamat email resmi dan kata sandi.
  2. Pengguna menekan tombol **"Masuk"** (atau menekan tombol Enter).
  3. Tombol langsung dinonaktifkan (*disabled*) dengan label *"Memproses..."* untuk mencegah klik ganda.
- **Percabangan Interaksi UI:**
  - **Cabang A (Kredensial Sah):** Pengguna diarahkan seketika ke halaman `/today`. Sidebar sebelah kiri langsung terkonstruksi secara dinamis sesuai matriks peran aktif:
    - *Employee:* Menampilkan grup Workspace (`My Today`, `My History`, `My Leave Request`, `Notifications`, `Profile`).
    - *Supervisor / TL:* Tambahan grup Management (`Pulse Dashboard` $\rightarrow$ Team Pulse, `Blocker Queue`, `Correction & Leave Review` jika authorized).
    - *Head of Dept:* Tambahan grup Management (`Pulse Dashboard` $\rightarrow$ Function Pulse, `Blocker & Escalation Queue`, `Manager Notes`, `Reports`).
    - *CEO / Management:* Tambahan grup Management (`Pulse Dashboard` $\rightarrow$ Management Pulse, `Escalation Aging`, `Company Reports`).
  - **Cabang B (Kredensial Salah):** Banner alert merah muncul di atas form: *"Email atau kata sandi yang Anda masukkan salah. Silakan coba lagi."* Field kata sandi dikosongkan dan difokuskan kembali, email tetap dipertahankan.
  - **Cabang C (Akun Nonaktif):** Banner alert oranye muncul: *"Akun Anda sedang dinonaktifkan. Silakan hubungi bagian HRGA/Administrator untuk informasi lebih lanjut."*
- **Umpan Balik Visual:** State loading pada tombol, pesan alert yang manusiawi tanpa membocorkan eksistensi akun orang lain.
- **Kondisi Akhir Layar:** Pengguna mendarat di `/today` dengan shell navigasi yang bersih dan konsisten.

#### UF-03: Pemulihan Kata Sandi Mandiri (Forgot & Reset Password)
- **User Goal:** Pengguna yang lupa kata sandi ingin memulihkan akses ke akun kerjanya secara mandiri.
- **Aktor:** Pengguna Terdaftar.
- **Entry Point & Tampilan Awal Layar:**
  - Pengguna mengklik *"Lupa Kata Sandi?"* pada form `/login`.
  - Layar berpindah ke `/login/forgot-password` dengan instruksi singkat dan input Email.
- **Langkah Interaksi Antarmuka:**
  1. Pengguna memasukkan alamat emailnya dan menekan **"Kirim Tautan Pemulihan"**.
  2. Layar menampilkan pesan netral yang menenangkan: *"Jika email Anda terdaftar di sistem, tautan instruksi pemulihan telah dikirimkan ke kotak masuk Anda."*
  3. Pengguna membuka email, mengklik tautan reset password $\rightarrow$ layar `/login/reset-password?token=:token` terbuka.
  4. Pengguna memasukkan kata sandi baru dan konfirmasi kata sandi $\rightarrow$ klik **"Perbarui Kata Sandi"**.
- **Percabangan Interaksi UI:**
  - **Cabang A (Reset Berhasil):** Layar menampilkan konfirmasi sukses dan tombol kembali ke login. Seluruh sesi aktif di peramban lain dibatalkan otomatis.
  - **Cabang B (Tautan Reset Kedaluwarsa):** Layar menampilkan error: *"Tautan pemulihan telah kedaluwarsa. Silakan ajukan permohonan baru."*
- **Kondisi Akhir Layar:** Pengguna dapat masuk kembali menggunakan kata sandi baru.

#### UF-04: Sesi Habis saat Mengisi Form & Re-Autentikasi Tanpa Kehilangan Draf
- **User Goal:** Pengguna yang sesi login-nya kedaluwarsa saat sedang mengetik komitmen/evaluasi tidak ingin ketikannya hilang.
- **Aktor:** Pengguna Aktif di Form `/today/morning` atau `/today/eod`.
- **Entry Point & Tampilan Awal Layar:**
  - Pengguna sedang mengetik komitmen atau menekan tombol simpan saat sesi login telah kedaluwarsa.
- **Langkah Interaksi Antarmuka:**
  1. Alih-alih me-refresh halaman atau melempar pengguna keluar, antarmuka memunculkan **Modal Dialog Re-Autentikasi (Session Lock Modal)** di atas form yang sedang diisi:
     *"Sesi kerja Anda telah berakhir demi keamanan. Masukkan kata sandi Anda untuk melanjutkan tanpa kehilangan data yang sedang Anda ketik."*
  2. Seluruh form input di belakang modal tetap tampak remang-remang (*blurred backdrop*) dan teks komitmen/catatan tetap utuh di state lokal.
  3. Pengguna mengetik kata sandinya pada modal dan menekan **"Lanjutkan Sesi"**.
- **Percabangan Interaksi UI:**
  - **Cabang Sukses:** Modal tertutup, token sesi baru disimpan, dan request penyimpanan form yang sempat tertunda langsung dieksekusi otomatis oleh sistem. Toast sukses muncul: *"Sesi diperbarui & data berhasil disimpan!"*
  - **Cabang Batal / Password Salah:** Modal menampilkan pesan kesalahan inline tanpa menutup form draf di baliknya.
- **Umpan Balik Visual:** Modal overlay pelindung draf, zero-data loss feedback (NFR-01).
- **Kondisi Akhir Layar:** Sesi kembali aktif, draf komitmen tersimpan sukses.

---

### 7.2 Domain 2: User Flows Siklus Akuntabilitas Harian Karyawan

#### UF-05: Pembukaan Halaman `/today` & Deteksi Konteks Hari (Calendar Context Check)
- **User Goal:** Karyawan membuka halaman kerja harian untuk mengetahui kewajiban dan status akuntabilitas hari ini.
- **Aktor:** Seluruh Karyawan / Pengguna Workspace.
- **Entry Point & Tampilan Awal Layar:**
  - Pengguna mengklik menu **"My Today"** di sidebar atau membuka rute `/today`.
- **Langkah Interaksi & Tampilan Antarmuka Berdasarkan Kondisi Hari:**
  - **Kondisi 1: Hari Libur Resmi / Nasional (Company Holiday):**
    - Di bagian atas muncul banner kalender resmi berwarna biru tenang: *"Hari ini adalah Hari Libur Perusahaan / Nasional (:namaHariLibur). Check-in akuntabilitas harian dinonaktifkan."*
    - Seluruh form Morning dan EOD ditutup secara rapi. Tidak ada hitung mundur deadline, dan hari ini sepenuhnya bebas dari evaluasi keterlambatan atau No Submission.
  - **Kondisi 2: Cuti yang Telah Disetujui (Approved Leave):**
    - Muncul banner hijau lembut: *"Status Kehadiran: Cuti Disetujui (:alasanCuti). Pengisian Check-in bersifat opsional."*
    - Tombol check-in bersifat opsional; sistem tidak pernah mencatat No Submission untuk hari ini.
  - **Kondisi 3: Akun Eksekutif dengan Pengecualian Terbuka (Indefinite Role Exemption):**
    - Muncul komponen `ExemptionBanner` yang tenang dan netral di atas form: *"Akun Anda memiliki status Pengecualian Partisipasi Terbuka (Indefinite Role Exemption) sesuai kebijakan organisasi. Pengisian Check-in bersifat opsional."*
    - Pengguna dapat mengisi log komitmen secara mandiri jika diinginkan, namun tombol submit bebas dari batas waktu Cut-Off yang menekan dan sistem tidak pernah mengevaluasi No Submission (FR-35, BR-07).
  - **Kondisi 4: Hari Kerja Normal:**
    - Muncul *Schedule Context Strip* di bawah header: Tanggal Hari Ini, Batas Tepat Waktu (On-Time Deadline), Masa Tenggang (Grace Period), dan Batas Akhir (Cut-Off Time).
    - Status kartu Morning menampilkan badge: *"Belum Diisi"* (abu-abu netral).
- **Kondisi Akhir Layar:** Layar siap memandu pengguna melakukan check-in pagi sesuai konteksnya.

#### UF-06: Pengisian Komitmen Pagi Normal (1–3 Komitmen + Hint + Pilihan Risiko)
- **User Goal:** Karyawan merencanakan dan mengunci 1 hingga 3 komitmen kerja utama hari ini secara cepat dan jelas.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Awal Layar:**
  - Karyawan membuka rute `/today` pada pagi hari sebelum On-Time Deadline.
  - Kartu Morning Commitment aktif menampilkan pilihan jumlah slot (1, 2, atau 3 komitmen) dan slot input teks komitmen.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan melihat panel konteks pengingat: jika pada EOD kemarin ia mengisi `Tomorrow Priority`, catatan tersebut tampil di panel kuning lembut sebagai bahan pengingat (murni referensi).
  2. Karyawan memilih jumlah komitmen (default 1–3 slot).
  3. Karyawan mengklik textarea **Commitment #1**:
     - Saat kursor aktif dan mulai mengetik, komponen `RoleBasedPromptHint` muncul tepat di bawah field berupa teks miring (*italic*) visual pemandu sesuai fungsi kanonikal Dutamedia karyawan tersebut (misal fungsi `Engineering`: *"e.g. Selesaikan unit testing modul autentikasi dan push PR ke staging"*). Hint ini murni pemandu visual dan tidak tersimpan ke database (ADR-016).
  4. Karyawan memilih radio button **Initial Risk** untuk Commitment #1:
     - `GREEN`: Risiko normal, pekerjaan diantisipasi lancar.
     - `AMBER`: Ada potensi risiko/hambatan moderat.
     - `RED`: Risiko tinggi, kritis, atau berpotensi gagal selesai.
  5. **Dinamika Form saat Memilih AMBER atau RED:**
     - Area input seketika membuka dua field tambahan yang wajib diisi: **Known Blocker** (kendala apa yang diantisipasi) dan **Support Needed** (dukungan apa yang dibutuhkan dari rekan/atasan).
  6. (Opsional) Karyawan mengisi field **Reference / Task Link** (misal link tiket Jira/Trello atau link dokumen kerja).
  7. Karyawan mengulangi langkah untuk Commitment #2 dan #3 bila ada.
  8. Karyawan mengamati badge **Initial Daily Status Preview** di pojok kanan kartu yang terkalkulasi otomatis secara real-time (hanya-baca): jika ada 1 saja RED $\rightarrow$ RED; jika ada AMBER dan tidak ada RED $\rightarrow$ AMBER; jika semua GREEN $\rightarrow$ GREEN.
  9. Karyawan menekan tombol utama **"Simpan Morning Commitment"**.
- **Percabangan Interaksi UI:**
  - **Jalur Sukses On-Time:** Tombol menampilkan spinner sebentar $\rightarrow$ toast hijau muncul: *"Morning Commitment berhasil disimpan tepat waktu!"* $\rightarrow$ kartu Morning berubah menjadi read-only dengan badge hijau *"On-Time"* dan badge status risiko awal.
  - **Jalur Field Belum Lengkap:** Jika pengguna memilih AMBER tetapi membiarkan Known Blocker kosong $\rightarrow$ border field menyala merah kontras dengan pesan inline: *"Known Blocker wajib diisi untuk komitmen berisiko AMBER/RED."* Layar otomatis scroll dan fokus ke field tersebut. Input yang sudah diketik di field lain tetap aman.
- **Kondisi Akhir Layar:** Komitmen pagi terkunci rapi, tercatat di linimasa hari ini.

#### UF-07: Peringatan Kualitas Komitmen Terlalu Abstrak (Quality Warning Prompt)
- **User Goal:** Karyawan mendapatkan panduan langsung ketika komitmen yang diketiknya terlalu umum, agar hasil kerjanya dapat dinilai objektif.
- **Aktor:** Karyawan di Form Morning Commitment.
- **Entry Point & Tampilan Awal Layar:**
  - Karyawan sedang mengetik komitmen di textarea Commitment #1.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan mengetik kata yang terlalu abstrak atau generik (misal hanya mengetik: *"development"*, *"meeting"*, *"coding"*, atau *"follow-up"*).
  2. Saat kursor berpindah field (*on blur*) atau setelah jeda mengetik, sistem mendeteksi bahwa komitmen tidak memuat deliverable teramati.
  3. Komponen `QualityWarningBadge` muncul di bawah textarea dengan aksen oranye lembut:
     💡 *"Komitmen tampak sangat umum. Sebutkan hasil atau deliverable teramati yang diharapkan selesai hari ini (misal: 'Selesaikan slice UI dashboard dan integrasikan dengan API')."*
  4. Karyawan memiliki dua pilihan:
     - **Pilihan A (Menyempurnakan Teks):** Karyawan mengklik kembali textarea dan memperjelas kalimat komitmennya $\rightarrow$ peringatan kualitas otomatis hilang saat teks lebih spesifik.
     - **Pilihan B (Tetap Melanjutkan):** Karyawan merasa teksnya sudah cukup $\rightarrow$ karyawan tetap dapat melanjutkan memilih risiko dan menekan tombol Simpan.
- **Guardrails Bisnis (FR-63 / AC-72):** Peringatan ini bersifat pemandu (*non-blocking*), **tidak mengunci atau membatalkan tombol submit**, dan tidak pernah menghasilkan penalti atau skor otomatis pada akun karyawan.
- **Kondisi Akhir Layar:** Karyawan teredukasi untuk menyusun komitmen yang jelas dengan kendali penuh di tangannya.

#### UF-08: Pengisian Komitmen Pagi Nol (0 Commitment dengan Alasan Wajib)
- **User Goal:** Karyawan yang pada hari tersebut tidak memiliki tugas operasional terencana (misal khusus riset internal, workshop perusahaan, atau transisi) ingin mencatatkan akuntabilitasnya secara sah.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Awal Layar:**
  - Karyawan membuka rute `/today/morning`.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan melihat opsi pilihan jumlah komitmen dan mengklik radio/toggle: **"0 Komitmen (Tidak ada komitmen terencana hari ini)"**.
  2. Seluruh slot komitmen 1–3 disembunyikan.
  3. Layar memunculkan field khusus: **Alasan Nol Komitmen (Reason for 0 Commitment)** yang diberi tanda bintang merah wajib.
  4. Karyawan mengetik alasan faktualnya (misal: *"Menghadiri workshop arsitektur internal seharian penuh"*).
  5. Indikator Initial Daily Status di pojok kartu otomatis menetapkan label netral: `NOT_APPLICABLE — NO_COMMITMENT` (bukan GREEN, bukan RED, dan bukan No Submission).
  6. Karyawan menekan tombol **"Simpan Morning Check-in"**.
- **Percabangan Interaksi UI:**
  - **Jika Alasan Diisi:** Submission diterima sah. Kartu terkunci menampilkan alasan dan badge `NOT_APPLICABLE — NO_COMMITMENT`. Karyawan terbebas dari deteksi No Submission.
  - **Jika Alasan Dikosongkan:** Tombol submit nonaktif / memunculkan pesan error: *"Alasan wajib diisi jika memilih 0 komitmen."*
- **Kondisi Akhir Layar:** Hari kerja tercatat sah dengan akuntabilitas jelas tanpa komitmen palsu (FR-51).

#### UF-09: Penggunaan Draf Copy-Forward dari Komitmen Berlanjut Kemarin
- **User Goal:** Karyawan ingin melanjutkan pekerjaan kemarin yang belum tuntas tanpa harus mengetik ulang dari nol.
- **Aktor:** Karyawan yang pada EOD kemarin memilih `Continuation = Continue`.
- **Entry Point & Tampilan Awal Layar:**
  - Karyawan membuka `/today/morning`.
  - Sistem mendeteksi adanya komitmen kemarin yang berstatus `Continue`.
  - Di atas form komitmen muncul komponen `DraftBanner` dengan tombol: *"Terdapat :count Komitmen Lanjutan dari Kemarin. Tinjau & Gunakan Draf."*
- **Langkah Interaksi Antarmuka:**
  1. Karyawan mengklik banner $\rightarrow$ panel seleksi draf copy-forward terbuka menampilkan daftar item pekerjaan kemarin beserta catatan lanjutannya (`Continuation Reason`).
  2. Karyawan mencentang item yang ingin dikerjakan hari ini (maksimal 3 item).
  3. Karyawan menekan tombol **"Salin ke Komitmen Hari Ini"**.
  4. Teks komitmen dan tautan referensi otomatis terisi ke slot Commitment #1 / #2 / #3.
  5. **Langkah Peninjauan Wajib:** Form TIDAK langsung tersubmit otomatis. Karyawan wajib meninjau teks, boleh mengedit redaksi, dan wajib memilih kembali **Initial Risk** hari ini (GREEN/AMBER/RED).
  6. Karyawan menekan tombol **"Simpan Morning Commitment"**.
- **Guardrails Bisnis (ADR-017 / FR-11):** Tidak ada auto-submit di balik layar; tidak ada pembuatan slot ke-4 di luar batas maksimal 3 komitmen.
- **Kondisi Akhir Layar:** Pekerjaan bersambung tercatat rapi dengan jejak keterkaitan historis.

#### UF-10: Penanganan Keterlambatan Pengisian Pagi (On-Time vs Late vs Terkunci Pasca Cut-Off)
- **User Goal:** Karyawan memahami status disiplin waktunya saat mengisi di luar jadwal normal.
- **Aktor:** Karyawan.
- **Entry Point & Skenario Waktu:**
  - **Skenario 1: Mengisi di Antara On-Time Deadline dan Cut-Off (Late Period):**
    - Karyawan membuka `/today` setelah pk 09:00 (deadline) namun sebelum pk 09:30 (Cut-Off).
    - Di header muncul badge penjelas warna oranye: *"Pengisian Terlambat (Dalam Masa Tenggang)"*.
    - Form tetap terbuka penuh dan dapat diisi normal.
    - Setelah klik simpan, kartu terkunci dengan badge **`Late`** berwarna oranye netral.
    - *Feedback:* Sistem mencatat fakta keterlambatan secara objektif tanpa menampilkan kata-kata hukuman atau nada memarahi.
  - **Skenario 2: Membuka Setelah Batas Akhir Cut-Off (Locked State):**
    - Karyawan membuka `/today` setelah jam Cut-Off terlampaui (misal pk 09:35).
    - Seluruh form Morning terkunci permanen (*read-only*).
    - Komponen `LockedIndicator` muncul dengan pesan jelas:
      🔒 *"Batas waktu pengisian Morning Check-in telah berakhir (Cut-Off: :cutOffTime). Form telah terkunci untuk menjaga keandalan baseline harian."*
    - Tombol simpan menghilang. Jika kebijakan organisasi mengizinkan koreksi, layar memunculkan tombol alternatif: **"Ajukan Morning Correction Request"**.
- **Kondisi Akhir Layar:** Integritas waktu terlindungi tanpa menghilangkan jalur koreksi resmi bila diizinkan kebijakan.

#### UF-11: Pencatatan Tambahan Pekerjaan Tengah Hari (Add Additional Work)
- **User Goal:** Karyawan mencatat tugas mendadak yang didelegasikan atasan atau insiden teknis darurat di siang hari agar beban kerjanya terekam adil.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Awal Layar:**
  - Kapan saja di sela jam kerja (misal pk 14:00) setelah Morning Check-in selesai, karyawan membuka `/today`.
  - Di bawah kartu Morning Commitment, terdapat tombol jelas: **"+ Tambah Pekerjaan Tengah Hari (Add Additional Work)"**.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan mengklik tombol "+ Tambah Pekerjaan Tengah Hari".
  2. Dialog modal form terbuka menyajikan field:
     - **Deskripsi Pekerjaan:** Karyawan mengetik rincian tugas baru.
     - **Alasan Penambahan (Reason Dropdown - 5 enum resmi FR-06):**
       1. `Newly Assigned` (Tugas baru dari pimpinan)
       2. `Missed in Planning` (Terlewat saat perencanaan pagi)
       3. `Priority Change` (Pergeseran prioritas mendadak)
       4. `Operational-Incident` (Insiden teknis/gangguan live)
       5. `Other` (Alasan operasional lainnya)
     - **Field Dinamis "Ditugaskan Oleh (Assigned By)":**
       - Jika karyawan memilih `Newly Assigned`, field teks pemilih atasan muncul dan **wajib diisi**.
       - Untuk pilihan alasan lainnya, field ini bersifat opsional.
     - **Reference / Task Link:** Opsional link tiket.
  3. Karyawan menekan tombol **"Simpan Additional Work"**.
- **Umpan Balik Visual:** Modal tertutup $\rightarrow$ toast hijau muncul $\rightarrow$ kartu *Additional Work* muncul di halaman `/today` dalam kelompok visual terpisah di bawah komitmen pagi, dengan bobot visual dan kejelasan yang setara (bukan catatan kaki kecil).
- **Guardrails Bisnis (ADR-001):** Additional Work tidak mengubah baseline pagi yang sudah terkunci dan bukan slot ke-4 komitmen pagi.
- **Kondisi Akhir Layar:** Item pekerjaan baru terdaftar dan akan wajib dievaluasi outcome-nya saat EOD sore hari.

#### UF-12: Evaluasi Sore Hari (EOD Check-out: Outcome, Continuation, & Alasan Wajib)
- **User Goal:** Karyawan menutup hari kerja dengan melaporkan hasil capaian setiap tugas, menentukan kelanjutan tugas untuk esok hari, dan menetapkan status risiko harian.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Awal Layar:**
  - Sore hari menjelang akhir jam kerja, karyawan membuka `/today/eod`.
  - Layar menyajikan seluruh item pekerjaan hari ini dalam dua kelompok yang jelas: Kelompok Morning Commitments (1–3 item) dan Kelompok Additional Works (jika ada).
- **Langkah Interaksi Antarmuka:**
  1. Untuk **setiap item pekerjaan**, karyawan berhadapan dengan dua pasang kontrol independen:
     - **Kontrol 1: Outcome (Pilihan Segmented / Radio):**
       - `Completed` (Selesai penuh)
       - `Partially Completed` (Selesai sebagian)
       - `Not Completed` (Belum selesai)
       - `Cancelled` (Dibatalkan) $\rightarrow$ *Aturan:* Jika memilih `Cancelled`, field teks **Alasan Pembatalan** seketika muncul dan wajib diisi.
     - **Kontrol 2: Continuation (Pilihan Segmented):**
       - `Do Not Continue` (Tidak dilanjutkan besok)
       - `Continue` (Lanjutkan ke hari kerja berikutnya) $\rightarrow$ *Aturan Krusial:* Jika memilih `Continue`, field teks **Continuation Reason WAJIB DIISI, bahkan ketika Outcome bernilai `Completed`** (misal untuk tugas berseri atau pemeliharaan berkala).
  2. Karyawan mengamati panel **Status Suggestion Engine (FR-13 / AC-38)** di bagian bawah yang secara otomatis menghitung rekomendasi status harian berdasarkan aturan deterministik:
     - Ada Blocker Critical $\rightarrow$ menyarankan **RED**.
     - $\ge 50\%$ tugas Not Completed/Cancelled $\rightarrow$ menyarankan **RED**.
     - Ada Blocker High atau carry-over berulang hari ke-2 pada task yang sama $\rightarrow$ menyarankan minimal **AMBER**.
     - Sebagian selesai atau $< 50\%$ belum selesai $\rightarrow$ menyarankan minimal **AMBER**.
     - Semua tugas selesai tanpa blocker $\rightarrow$ menyarankan **GREEN**.
  3. Karyawan memilih **Final Status** harian: `GREEN`, `AMBER`, atau `RED`.
     - Jika karyawan memilih `AMBER` atau `RED` $\rightarrow$ field **Penjelasan Risiko Tingkat Hari (Daily Risk Explanation)** wajib diisi secara menyeluruh.
  4. (Opsional) Karyawan mengetik catatan singkat pada field **Tomorrow Priority** (prioritas utama untuk esok pagi).
  5. Karyawan menekan tombol utama **"Simpan EOD Check-out"**.
- **Percabangan Interaksi UI:**
  - **Jika Pilihan Status Selaras dengan Saran Sistem:** EOD tersimpan sukses $\rightarrow$ hari ini terkunci rapi (*read-only*).
  - **Jika Pilihan Status Berbeda dari Saran Sistem:** Form memicu dialog `ValidationPromptModal` (lihat UF-13).
- **Kondisi Akhir Layar:** Seluruh komitmen dan tugas tambahan memiliki status akhir yang transparan dan dapat dipertanggungjawabkan.

#### UF-13: Menghadapi Dialog Konfirmasi Status (ValidationPromptModal: Saran vs Pilihan Pengguna)
- **User Goal:** Karyawan mengonfirmasi pilihannya secara adil ketika terdapat perbedaan antara status yang dipilihnya dan kalkulasi sistem.
- **Aktor:** Karyawan di Form EOD Check-out.
- **Entry Point & Kondisi Pemicu:**
  - Karyawan memilih status `GREEN`, namun sistem mendeteksi ada blocker aktif atau tugas belum selesai sehingga sistem menyarankan `AMBER` atau `RED`.
  - Karyawan menekan tombol Simpan EOD.
- **Tampilan Antarmuka Dialog Modal:**
  - Muncul modal dialog elegan `ValidationPromptModal` dengan judul: *"Konfirmasi Status Risiko Harian"*.
  - Dialog menyajikan fakta objektif tanpa nada menyalahkan:
    *"Sistem menyarankan status :suggestedStatus karena terdapat 1 tugas belum selesai dan 1 blocker aktif. Anda memilih status :userStatus."*
  - Dialog menyediakan dua tombol pilihan setara:
    - **Tombol A: "Gunakan Saran Sistem (:suggestedStatus)"**
    - **Tombol B: "Tetap Gunakan Pilihan Saya (:userStatus)"** $\rightarrow$ Saat diklik, muncul textarea singkat: *"Alasan mempertahankan status :userStatus (wajib diisi)"*.
- **Langkah Interaksi Antarmuka:**
  - Jika karyawan mengklik Tombol A $\rightarrow$ status otomatis berubah mengikuti saran sistem dan EOD langsung tersimpan.
  - Jika karyawan mengklik Tombol B dan mengisi penjelasannya $\rightarrow$ sistem menghormati pilihan karyawan, menyimpan status pilihan karyawan beserta penjelasannya ke database.
- **Guardrails Bisnis (FR-14):** Sistem **DILARANG MENGUBAH STATUS SECARA DIAM-DIAM (*No silent mutation*)**. Karyawan selalu diberi tahu dan memiliki hak mempertahankan penilaian profesionalnya.
- **Kondisi Akhir Layar:** Modal tertutup, data tersimpan dengan transparansi penuh antara analisis sistem dan keputusan pengguna.

#### UF-14: Penyelesaian Hari & Penguncian Otomatis Pasca Cut-Off EOD
- **User Goal:** Karyawan melihat ringkasan utuh hari kerjanya setelah proses submit atau saat melewati Cut-Off sore.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Layar:**
  - Setelah EOD berhasil disubmit (atau saat jam Cut-Off EOD lewat), halaman `/today` berubah ke mode **Read-Only / Locked Summary**.
- **Tampilan Antarmuka:**
  - Kartu menampilkan badge ganda berdampingan yang terpisah:
    - Badge Waktu: `On-Time` (hijau) atau `Late` (oranye).
    - Badge Risiko Akhir: `GREEN`, `AMBER`, atau `RED` (atau `NOT_APPLICABLE — NO_COMMITMENT`).
  - Seluruh tombol edit, tambah tugas, dan dropdown outcome berubah menjadi teks statis read-only.
  - Jika ada kesalahan pencatatan yang baru disadari setelah terkunci, karyawan melihat satu-satunya jalur resmi: tombol *"Ajukan EOD Correction Request"*.
- **Kondisi Akhir Layar:** Hari kerja ditutup dengan integritas data audit yang kokoh.

---

### 7.3 Domain 3: User Flows Pelaporan Blocker & Dukungan Tim

#### UF-15: Melaporkan Blocker Mendesak Kapan Saja (Raise Instant Blocker)
- **User Goal:** Karyawan yang terhambat masalah teknis, dependensi, atau izin ingin segera meminta bantuan tanpa menunggu siklus check-in.
- **Aktor:** Karyawan Pelapor (*Reporter*).
- **Entry Point & Tampilan Awal Layar:**
  - Kapan saja (pagi, siang, malam, bahkan saat baseline terkunci), karyawan mengklik tombol cepat **"+ Laporkan Blocker"** di topbar navigasi atau di halaman `/today`.
  - Formulir modal/halaman `/today/raise-blocker` terbuka.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan memilih **Tipe Blocker (10 Tipe Resmi PRD FR-16)** dari dropdown:
     `Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, atau `Other`.
  2. Karyawan memilih **Tingkat Keparahan (Severity - 4 opsi)**:
     `Critical` (Sangat Kritis), `High` (Tinggi), `Medium` (Sedang), atau `Low` (Rendah).
  3. Karyawan memilih **Dampak Hambatan (Impact - 7 opsi)**:
     `Task`, `Milestone`, `Project`, `Production`, `Client`, `Financial`, atau `Compliance`.
  4. Karyawan menentukan **Konteks Kewenangan (Authority Context)**:
     - Radio button default: **`Organizational Authority`** (jalur hierarki manajerial normal).
     - Pilihan alternatif: **`Project Authority`** (jalur manajer proyek tertentu $\rightarrow$ jika dipilih, dropdown proyek terkait muncul dan wajib dipilih).
  5. Karyawan memeriksa pilihan penanggung jawab:
     - Kolom default dibiarkan kosong bertuliskan: **"Tidak memilih orang tertentu"**. Teks bantuan menjelaskan bahwa sistem akan menugaskan atasan langsung (Direct Manager Level 1) atau Lead Proyek secara otomatis.
     - *Alternatif:* Karyawan dapat memilih orang tertentu dari dropdown personil aktif yang memenuhi syarat.
  6. Karyawan mengetik **Deskripsi Masalah** secara detail.
  7. (Opsional) Karyawan mengisi target tanggal pada **Expected Resolution**.
  8. Karyawan menekan tombol utama **"Kirim Laporan Blocker"**.
- **Percabangan Interaksi UI:**
  - **Jalur Sukses:** Modal tertutup $\rightarrow$ toast hijau muncul: *"Blocker berhasil dilaporkan dan ditugaskan kepada :namaOwner."* $\rightarrow$ Blocker Card muncul dengan status badge biru **`Open`**. Notifikasi instan terkirim ke gawai penanggung jawab.
  - **Jalur Gagal (Penerima Tidak Sah / Mapping Kosong):** Sistem menampilkan pesan peringatan yang jelas dan meminta konfirmasi pengalihan ke fallback pimpinan divisi.
- **Kondisi Akhir Layar:** Blocker aktif terdaftar, SLA waktu pengakuan (*acknowledgment timer*) mulai berjalan.

#### UF-16: Pengakuan Blocker oleh Penanggung Jawab (Acknowledge Blocker)
- **User Goal:** Support Owner (atasan / rekan yang ditugaskan) mengakui bahwa ia telah melihat blocker dan siap menindaklanjutinya.
- **Aktor:** Assigned Support Owner (Direct Manager / Lead).
- **Entry Point & Tampilan Awal Layar:**
  - Support Owner menerima notifikasi (Email / Push / Lonceng In-App) dan mengklik notifikasi tersebut $\rightarrow$ langsung membuka Blocker Detail Card di `/team/blockers`.
  - Blocker berstatus `Open`. Terdapat indikator hitung mundur SLA pengakuan (misal sisa waktu 45 menit sebelum dieskalasi otomatis ke Kepala Divisi).
- **Langkah Interaksi Antarmuka:**
  1. Support Owner membaca deskripsi masalah dan tipe blocker.
  2. Pada panel aksi (ActionPanel), tombol utama berwarna biru bertuliskan: **"Acknowledge Blocker (Akui Tanggung Jawab)"**.
  3. Support Owner mengklik tombol tersebut.
- **Umpan Balik Visual:**
  - Tombol berubah menjadi tanda centang $\rightarrow$ status blocker seketika berganti menjadi **`Acknowledged`**.
  - Hitung mundur SLA otomatis dihentikan (tidak akan dieskalasi).
  - Pelapor menerima notifikasi pembaruan: *":namaOwner telah mengakui blocker Anda dan sedang meninjau solusi."*
- **Kondisi Akhir Layar:** Blocker siap dieksekusi penanganannya.

#### UF-17: Penanganan & Penyelesaian Blocker (Resolve dengan Resolution Note)
- **User Goal:** Support Owner menyelesaikan kendala yang dihadapi karyawan dan mencatat solusi konkretnya.
- **Aktor:** Assigned Support Owner.
- **Entry Point & Tampilan Layar:**
  - Support Owner membuka Blocker Card yang berstatus `Acknowledged` atau `In Progress`.
- **Langkah Interaksi Antarmuka:**
  1. Saat mulai mencari solusi, Support Owner mengklik **"Mulai Penanganan (Start Progress)"** $\rightarrow$ status menjadi `In Progress`.
  2. Setelah kendala di lapangan berhasil diselesaikan (misal akses server telah dibuka atau dependensi vendor telah cair):
     - Support Owner mengklik tombol hijau: **"Resolve Blocker (Tandai Selesai)"**.
  3. Dialog modal penyelesaian wajib muncul:
     - Terdapat textarea besar: **Catatan Solusi (Resolution Note)** dengan tanda bintang merah wajib.
     - Support Owner mengetik penjelasan tindakan yang telah dilakukan untuk menyelesaikan kendala.
  4. Support Owner mengklik tombol **"Konfirmasi Selesai (Resolve)"**.
- **Guardrails Bisnis (FR-17, FR-18):** Support Owner **TIDAK BISA langsung mengubah status menjadi `Closed` secara sepihak**. Blocker beralih ke status **`Resolved`** dan menunggu verifikasi kepuasan dari pelapor asli.
- **Umpan Balik Visual:** Blocker card berubah status menjadi `Resolved` (kuning-hijau). Notifikasi dikirimkan seketika ke pelapor: *"Blocker Anda telah ditandai Resolved oleh :namaOwner. Silakan periksa dan konfirmasi penyelesaian."*
- **Kondisi Akhir Layar:** Tanggung jawab verifikasi beralih kembali ke pelapor asli.

#### UF-18: Verifikasi Penyelesaian oleh Pelapor (Konfirmasi Selesai vs Buka Kembali)
- **User Goal:** Karyawan pelapor memastikan apakah kendala yang dialaminya benar-benar sudah tuntas atau masih memerlukan tindakan lanjutan.
- **Aktor:** Karyawan Pelapor Asli (`raisedByUserId`).
- **Entry Point & Tampilan Layar:**
  - Karyawan membuka Blocker Card miliknya yang kini berstatus `Resolved`.
  - Di dalam kartu, karyawan membaca kotak sorotan **Resolution Note** yang ditulis oleh penanggung jawab.
- **Langkah Interaksi Antarmuka & Percabangan Layar:**
  - **Skenario A: Masalah Sudah Benar-Benar Beres (Happy Path):**
    1. Karyawan merasa puas dengan solusinya.
    2. Karyawan mengklik tombol hijau utama: **"Konfirmasi Selesai (Confirm Closed)"**.
    3. Status blocker resmi berubah menjadi **`Closed`** (abu-abu tuntas).
    4. Kartu masuk ke arsip selesai dengan jejak audit lengkap. Siklus hidup blocker tuntas 100%.
  - **Skenario B: Masalah Belum Tuntas / Solusi Tidak Bekerja (Reopen Path):**
    1. Karyawan mencoba solusi namun kendala ternyata masih terjadi.
    2. Karyawan mengklik tombol oranye: **"Buka Kembali (Reopen / Needs Further Work)"**.
    3. Modal dialog terbuka mewajibkan pengisian: **Alasan Membuka Kembali (Reopening Feedback)**.
    4. Karyawan menjelaskan bagian mana yang belum tuntas dan menekan konfirmasi.
    5. Status blocker seketika kembali menjadi **`In Progress`**. Penanggung jawab menerima notifikasi darurat untuk menindaklanjuti kembali.
  - **Skenario C: Karyawan Belum Sempat Memeriksa:**
    - Status blocker **TETAP BERSTATUS `Resolved`**. Sistem **TIDAK PERNAH melakukan auto-close diam-diam** hanya karena waktu berlalu tanpa konfirmasi (*No silent auto-close*).
- **Kondisi Akhir Layar:** Kepastian penyelesaian berada di tangan pengguna yang terdampak langsung.

#### UF-19: Memberikan Bantuan pada Blocker Rekan Kerja (Record Support Contribution)
- **User Goal:** Anggota tim yang membantu menyelesaikan kendala rekannya ingin kontribusi bantuannya tercatat secara resmi sebagai bukti kolaborasi.
- **Aktor:** Karyawan Pembantu (*Contributor*).
- **Entry Point & Tampilan Layar:**
  - Karyawan membuka `/team/blockers` dan melihat blocker aktif milik rekannya yang sedang membutuhkan bantuan teknis.
- **Langkah Interaksi Antarmuka:**
  1. Pada Blocker Card rekan tersebut, karyawan mengklik tombol: **"+ Catat Kontribusi Dukungan (Support Contribution)"**.
  2. Dialog modal terbuka menyajikan form:
     - **Tindakan Bantuan yang Diberikan:** Karyawan mengetik apa yang telah dilakukannya (misal: *"Membantu debugging database connection leak dan memperbaiki konfigurasi pool"*).
     - **Hasil / Outcome Bantuan:** Karyawan menjelaskan hasil bantuan.
  3. Karyawan menekan tombol **"Simpan Kontribusi"**.
- **Umpan Balik Visual:** Kartu blocker kini menampilkan sub-kartu `SupportContributionCard` yang mencantumkan nama kontributor, waktu, dan ringkasan bantuan.
- **Guardrails Bisnis (FR-64 / AC-73):** Kontribusi ini tercatat sebagai bukti kolaborasi pada profil mingguan kedua belah pihak, tanpa membebani kontributor dengan pembuatan tugas komitmen ganda.
- **Kondisi Akhir Layar:** Budaya saling tolong-menolong terekam secara adil dan objektif.

#### UF-20: Menerima Risiko Struktural oleh Pimpinan Berwenang (Accept Risk)
- **User Goal:** Pimpinan divisi menetapkan bahwa suatu kendala diputuskan untuk diterima risikonya secara sadar karena tidak dapat dihindari dalam jangka pendek.
- **Aktor:** Head of Department / Direktur Operasional.
- **Entry Point & Tampilan Layar:**
  - Pimpinan membuka blocker aktif di `/function/escalations` yang terhambat kendala vendor/kebijakan luar.
- **Langkah Interaksi Antarmuka:**
  1. Pimpinan mengklik tombol khusus: **"Terima Risiko (Accept Risk)"**.
  2. Modal pertimbangan risiko terbuka mewajibkan pengisian:
     - **Dasar Pertimbangan Risiko (Risk Acceptance Rationale):** Alasan mengapa risiko diputuskan diterima.
     - **Rencana Mitigasi Jangka Panjang:** Langkah pengamanan yang disiapkan.
  3. Pimpinan menekan **"Konfirmasi Terima Risiko"**.
- **Umpan Balik Visual:** Status blocker berubah menjadi **`Accepted Risk`** dengan lencana ungu. Blocker dikeluarkan dari hitungan krisis aktif namun tetap tercantum di laporan risiko eksekutif.
- **Kondisi Akhir Layar:** Keputusan manajerial terekam transparan tanpa membiarkan status blocker menggantung tanpa kejelasan.

#### UF-21: Pengalihan Penanggung Jawab Blocker secara Manual (Reassign Blocker)
- **User Goal:** Pimpinan atau penanggung jawab memindahkan penanganan blocker ke personil lain yang lebih kompeten.
- **Aktor:** Pimpinan Tim / Support Owner Aktif.
- **Entry Point & Langkah Interaksi:**
  1. Pada Blocker Card, klik tombol **"Alihkan Penanggung Jawab (Reassign)"**.
  2. Memilih personil baru dari daftar anggota tim yang valid.
  3. Mengisi alasan pengalihan tugas.
  4. Klik simpan $\rightarrow$ kartu diperbarui, penanggung jawab baru menerima notifikasi serah terima tugas.
- **Kondisi Akhir Layar:** Alur eskalasi dan penugasan berpindah secara bersih dengan riwayat audit lengkap.

---

### 7.4 Domain 4: User Flows Tata Kelola Koreksi Data Pasca Cut-Off

#### UF-22: Pengajuan Koreksi Komitmen Pagi Pasca Cut-Off (Morning Correction Request)
- **User Goal:** Karyawan yang menyadari komitmen paginya keliru setelah batas Cut-Off ingin mengajukan pembaruan data secara sah.
- **Aktor:** Karyawan Pemilik Data.
- **Entry Point & Tampilan Layar:**
  - Pada kartu Morning yang terkunci di `/today`, karyawan mengklik tombol **"Ajukan Morning Correction Request"**.
  - Layar `/today/morning/correction-request` terbuka.
- **Langkah Interaksi Antarmuka:**
  1. Layar menyajikan tata letak dua kolom berdampingan (*Side-by-Side Comparison*):
     - Kolom Kiri: **Data Baseline Asli Saat Ini (Read-Only)**.
     - Kolom Kanan: **Nilai Baru yang Diusulkan (Editable)**.
  2. Karyawan menyunting teks komitmen, risiko awal, atau tautan referensi pada kolom kanan.
  3. Di bawah formulir, terdapat textarea wajib: **Alasan Pengajuan Koreksi (Reason for Correction)**. Karyawan mengetik alasannya.
  4. Karyawan menekan tombol **"Kirim Pengajuan Koreksi"**.
- **Percabangan Interaksi UI (Klasifikasi Otomatis Kebijakan):**
  - **Kasus 1: Koreksi Minor (misal perbaikan tipo ejaan atau penambahan link task):**
    - Sistem langsung menerapkan perubahan secara otomatis (**Status: `Applied`**).
    - Toast hijau muncul: *"Koreksi Minor berhasil diterapkan langsung ke baseline pagi Anda."* Baseline diperbarui seketika.
  - **Kasus 2: Koreksi Material (perubahan substansi komitmen atau perubahan risiko):**
    - Sistem menempatkan pengajuan dalam status **`Pending`** selama **Objection Window** (24 jam kerja).
    - Muncul komponen `ObjectionWindowIndicator` dengan hitung mundur: *"Menunggu Sanggahan Reviewer: :sisaWaktu"*.
    - **PENTING DI LAYAR:** Baseline asli karyawan **TETAP BERLAKU DAN TIDAK BERUBAH** selama jendela sanggahan berjalan. Reviewer menerima notifikasi pengajuan koreksi.
- **Kondisi Akhir Layar:** Pengajuan tercatat dengan status jelas dan nomor ID pelacakan tersendiri.

#### UF-23: Pengajuan Koreksi Hasil Evaluasi Sore (EOD Correction Request)
- **User Goal:** Karyawan yang salah memilih outcome atau keliru menginput status pada EOD kemarin ingin mengoreksi catatannya.
- **Aktor:** Karyawan yang telah memiliki record EOD terkunci.
- **Entry Point & Langkah Interaksi:**
  1. Karyawan membuka `/today/eod/correction-request` dari kartu riwayat EOD.
  2. Layar menampilkan data EOD tersimpan sebagai nilai lama (Before).
  3. Karyawan memilih target field yang ingin diubah (Outcome tugas tertentu, Continuation, atau Final Status).
  4. Karyawan memasukkan usulan nilai baru dan mengetik alasan koreksi wajib.
  5. Karyawan menekan tombol **"Kirim Pengajuan Koreksi EOD"**.
- **Guardrails Anti-Bypass (FR-53, FR-55):** Jika karyawan sebelumnya tidak pernah submit EOD (mengalami No Submission), rute form ini **DITOLAK DAN TIDAK BISA DIGUNAKAN** untuk mengarang EOD dari nol atau membatalkan fakta No Submission.
- **Percabangan UI:** Evaluasi Minor langsung `Applied`; Material masuk antrean `Pending` selama Objection Window.
- **Kondisi Akhir Layar:** Permohonan koreksi tersimpan terpisah dari data Morning, menunggu peninjauan reviewer.

#### UF-24: Peninjauan Koreksi Material oleh Reviewer (Objection Window, Tolak, atau Default-Approve)
- **User Goal:** Atasan berwenang meninjau permohonan koreksi material bawahan dan memutuskan apakah akan menyanggah atau membiarkannya disetujui otomatis.
- **Aktor:** Authorized Reviewer (Direct Manager / Head of Dept).
- **Entry Point & Tampilan Layar:**
  - Reviewer membuka menu **"Correction & Leave Review"** di `/team/reviews` pada tab **Pending Objection**.
  - Daftar permohonan koreksi material bawahan tampil lengkap dengan lencana countdown sisa waktu Objection Window, nama karyawan, tanggal record, perbandingan Before vs Proposed After, dan alasan pemohon.
- **Langkah Interaksi Antarmuka & Percabangan Layar:**
  - **Opsi A: Menolak / Mengajukan Sanggahan Resmi (File Objection / Reject):**
    1. Reviewer menilai usulan perubahan tidak sesuai fakta lapangan.
    2. Reviewer mengklik tombol merah: **"Ajukan Sanggahan / Tolak (File Objection)"**.
    3. Modal dialog terbuka mewajibkan pengisian: **Alasan Sanggahan Formal (Objection Rationale)**.
    4. Reviewer menekan konfirmasi sebelum waktu window habis.
    5. Status koreksi seketika berubah menjadi **`Rejected`**. Data asli karyawan tetap dipertahankan permanen, usulan baru gugur, dan karyawan menerima notifikasi penolakan.
  - **Opsi B: Menyetujui Tanpa Beban Klik (Mekanisme Default-Approve):**
    1. Reviewer membaca permohonan dan merasa perubahan tersebut wajar dan benar.
    2. **Reviewer tidak perlu mengklik tombol apa pun**.
    3. Reviewer membiarkan waktu Objection Window berjalan hingga hitung mundur habis (mencapai 00:00:00).
    4. Saat waktu habis tanpa ada penolakan yang sah $\rightarrow$ sistem secara otomatis mengubah status menjadi **`Applied` (Default-Approve)**.
    5. Nilai baru resmi menggantikan nilai lama pada database, dan pemohon menerima notifikasi bahwa perubahannya telah aktif.
- **Guardrails Bisnis:** Sanggahan yang dikirimkan setelah batas waktu habis akan ditolak sistem karena status sudah sah berubah menjadi `Applied`.
- **Kondisi Akhir Layar:** Tata kelola koreksi berjalan lancar tanpa birokrasi persetujuan manual yang lambat dan membebani atasan.

---

### 7.5 Domain 5: User Flows Cuti, Libur, & Pengecualian Kehadiran

#### UF-25: Pengajuan Permohonan Cuti Mandiri oleh Karyawan (Leave Request)
- **User Goal:** Karyawan mengajukan rencana cuti kerja agar dibebaskan dari kewajiban check-in pada tanggal tersebut.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Layar:**
  - Karyawan membuka rute `/today/leave-request` melalui menu sidebar *"My Leave Request"*.
  - Layar menampilkan formulir kalender pemilih tanggal dan riwayat cuti terdahulu.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan memilih tanggal cuti (bisa satu hari tunggal atau rentang beberapa hari).
  2. Karyawan mengisi field keterangan/alasan cuti (misal: *"Cuti tahunan keperluan keluarga"*).
  3. Karyawan menekan tombol utama **"Ajukan Permohonan Cuti"**.
- **Umpan Balik Visual & Status Kepatuhan Sementara:**
  - Pengajuan tersimpan dengan status awal **`Pending`**.
  - Notifikasi terkirim ke atasan langsung (Authorized Approver).
  - **ATURAN VISUAL KRUSIAL:** Pada kalender kerja karyawan, tanggal tersebut ditandai dengan badge kuning *"Leave (Pending)"*. Tanggal ini **BELUM MENJADI PENGECUALIAN SAH**. Jika tanggal tersebut tiba dan status masih Pending, karyawan tetap berkewajiban mengisi check-in harian untuk menghindari No Submission.
- **Kondisi Akhir Layar:** Pengajuan berada di antrean atasan menunggu persetujuan aktif.

#### UF-26: Persetujuan / Penolakan Cuti oleh Atasan Berwenang (Leave Approval)
- **User Goal:** Atasan memeriksa permohonan cuti bawahan dan memberikan keputusan persetujuan resmi.
- **Aktor:** Authorized Approver (Direct Manager / Head / HRGA).
- **Entry Point & Tampilan Layar:**
  - Atasan membuka `/team/reviews` pada tab **Leave Approval** (atau `/compliance/leave-approvals`).
  - Layar menampilkan daftar permohonan cuti bawahan berstatus Pending dengan nama pemohon, tanggal cuti, dan alasan.
- **Langkah Interaksi Antarmuka & Percabangan Layar:**
  - **Cabang A: Menyetujui Permohonan (Approve):**
    1. Atasan mengklik tombol hijau **"Approve"**.
    2. Status permohonan berubah seketika menjadi **`Approved`**.
    3. Tanggal tersebut resmi menjadi *Valid Exception* (FR-48) di kalender kerja karyawan dan otomatis mengecualikan karyawan dari kewajiban check-in serta deteksi No Submission. Karyawan menerima notifikasi persetujuan.
  - **Cabang B: Menolak Permohonan (Reject):**
    1. Atasan mengklik tombol merah **"Reject"**.
    2. Modal dialog muncul mewajibkan pengisian: **Alasan Penolakan Cuti**.
    3. Atasan mengisi alasan dan menekan konfirmasi $\rightarrow$ status menjadi **`Rejected`**. Tanggal tersebut tetap merupakan hari kerja normal yang wajib diisi check-in. Karyawan menerima notifikasi penolakan beserta alasannya.
- **Guardrails Bisnis (FR-47):** Berbeda dari Correction Request, permohonan cuti **BUKAN DEFAULT-APPROVE**. Diperlukan klik persetujuan eksplisit agar pengecualian sah berlaku.
- **Kondisi Akhir Layar:** Status cuti final (Approved / Rejected) terekam di sistem kepatuhan organisasi.

#### UF-27: Penetapan Hari Libur Perusahaan oleh HRGA (Holiday Management)
- **User Goal:** Administrator atau HRGA menetapkan hari libur bersama/nasional yang berlaku serentak untuk seluruh karyawan.
- **Aktor:** HRGA / System Administrator.
- **Entry Point & Langkah Interaksi:**
  1. HRGA membuka rute `/compliance/exemptions` pada tab **Holiday Management**.
  2. Klik tombol **"+ Tambah Hari Libur"**.
  3. Memilih tanggal libur dari kalender, mengetik nama hari libur (misal *"Cuti Bersama Hari Raya"*), dan menandai centang *"Company-Wide"*.
  4. Klik **"Simpan Hari Libur"**.
- **Umpan Balik Visual:** Hari libur muncul di tabel kalender kerja. Sesuai FR-46 & BR-18, hari libur ini **LANGSUNG AKTIF SEKETIKA TANPA PERSETUJUAN TAMBAHAN**. Seluruh karyawan di perusahaan otomatis dibebaskan dari check-in pada tanggal tersebut.
- **Kondisi Akhir Layar:** Konfigurasi kalender kerja tahunan diperbarui.

#### UF-28: Penetapan Pengecualian Tugas Luar/Dinas oleh HRGA (Bounded Individual Exemption)
- **User Goal:** HRGA membebaskan karyawan tertentu yang ditugaskan dinas luar/riset lapangan dari kewajiban check-in selama periode penugasan.
- **Aktor:** HRGA / Administrator Berwenang.
- **Entry Point & Langkah Interaksi:**
  1. HRGA membuka `/compliance/exemptions` pada tab **Individual Exemption**.
  2. Klik **"+ Tambah Pengecualian Karyawan"**.
  3. Memilih nama karyawan dari daftar.
  4. Mengisi **Tanggal Mulai (Effective Date)** dan **Batas Akhir (Expiry Date)** yang keduanya **wajib diisi**.
  5. Mengetik alasan penugasan (misal *"Penugasan Implementasi Lapangan di Kantor Klien Surabaya"*).
  6. Klik **"Simpan Pengecualian"**.
- **Guardrails Bisnis:** Pengecualian individu wajib terikat rentang tanggal (*bounded*). Selama rentang tersebut, karyawan dibebaskan dari No Submission tanpa perlu mengajukan cuti mandiri.
- **Kondisi Akhir Layar:** Karyawan memiliki status pengecualian aktif terikat waktu.

#### UF-29: Pengaturan Pengecualian Jabatan Eksekutif Terbuka (Indefinite Role Exemption)
- **User Goal:** Pimpinan menetapkan pengecualian partisipasi terbuka tanpa batas waktu bagi pejabat struktural tertinggi (CEO / Dewan Direksi).
- **Aktor:** Administrator / HRGA Berwenang / Pimpinan Organisasi.
- **Entry Point & Langkah Interaksi:**
  1. Pejabat berwenang membuka `/compliance/exemptions` atau `/policy-settings` (Section Exemption Policy).
  2. Memilih mode **Indefinite Role Exemption (FR-35, BR-07)**.
  3. Memilih jabatan struktural eksekutif (misal `CEO` atau `Board of Directors`) atau akun personil terkait.
  4. Mengaktifkan toggle: **"Pengecualian Terbuka Tanpa Batas Waktu (Open-Ended / No Expiry Date)"**.
  5. Memasukkan tanggal mulai berlaku (Effective Date) dan catatan SK Direksi / kebijakan organisasi.
  6. Menekan tombol **"Terapkan Kebijakan Pengecualian"**.
- **Umpan Balik Visual:** Sistem menyimpan status pengecualian terbuka tanpa kewajiban mengisi expiry date. Akun tersebut secara permanen dibebaskan dari kewajiban check-in harian dan tidak pernah dievaluasi sebagai No Submission hingga sewaktu-waktu dicabut secara manual melalui versi kebijakan baru.
- **Kondisi Akhir Layar:** Akun eksekutif memiliki status pengecualian terbuka yang sah.

---

### 7.6 Domain 6: User Flows Pengawasan, Monitoring, & Pembinaan

#### UF-30: Pemantauan Tim di Team Pulse Dashboard (Pola Exception-First)
- **User Goal:** Supervisor / Team Lead ingin segera mengetahui siapa anggota tim yang menghadapi hambatan serius tanpa harus memeriksa satu per satu.
- **Aktor:** Supervisor / Team Lead (TL).
- **Entry Point & Tampilan Awal Layar:**
  - TL mengklik menu **"Pulse Dashboard"** di sidebar $\rightarrow$ langsung membuka `/team` (Team Pulse).
  - Layar mengusung prinsip **Exception-First Layout**:
    - Bagian paling atas menampilkan **Summary Kartu Anomali**: Jumlah status RED hari ini, jumlah AMBER, jumlah Blocker Unacknowledged yang mendekati batas SLA, dan daftar anggota tim yang belum submit (No Submission).
- **Langkah Interaksi Antarmuka:**
  1. TL meninjau daftar anggota tim di bawah kartu anomali:
     - TL melihat pemisahan dua dimensi independen: **Status Risiko** (GREEN/AMBER/RED) dan **Ketepatan Waktu** (On-Time/Late/No Submission). Anggota tim dengan status 0 komitmen ditampilkan terpisah netral (`NOT_APPLICABLE — NO_COMMITMENT`).
  2. TL meninjau widget **Open Blockers by Owner** untuk melihat siapa anggota tim yang sedang terhambat dan siapa yang ditugaskan membantu.
  3. TL meninjau widget **Carry-Over Trend** untuk mendeteksi apakah ada tugas yang mengalami perpanjangan (`Continue`) $\ge 2$ hari berturut-turut.
  4. TL mengklik salah satu baris anggota tim untuk melihat rincian teks komitmen dan blocker terkait.
- **Guardrails Bisnis (Prinsip Non-Surveillance & Anti-Gamifikasi):** Layar DILARANG MUTLAK menyajikan papan peringkat (*leaderboard*), perankingan jumlah tugas terbanyak, atau skor kecepatan kerja individu (FR-66, FR-68).
- **Kondisi Akhir Layar:** Pimpinan tim memperoleh visibilitas risiko objektif untuk segera memberikan bantuan langsung ke titik masalah.

#### UF-31: Pemantauan Divisi di Function Pulse Dashboard (Tren Carry-Over & Bottleneck)
- **User Goal:** Head of Department ingin mengidentifikasi hambatan lintas fungsi dan potensi risiko sistemik di divisinya.
- **Aktor:** Head of Department (Kepala Divisi).
- **Entry Point & Tampilan Layar:**
  - Head mengklik **"Pulse Dashboard"** $\rightarrow$ membuka `/function` (Function Pulse).
  - Tampilan menyajikan 6 widget resmi manajerial (FR-68):
    1. *Team status summary* divisi
    2. *Exceptions first* (daftar RED, AMBER, carry-over berulang, blocker tanpa respon)
    3. *Open blockers by owner*
    4. *Carry-over trend* divisi
    5. *Cross-project support* (rekaman bantuan lintas tim/proyek)
    6. *Weekly team summary*
- **Langkah Interaksi Antarmuka:**
  1. Head menggunakan `FilterBar` untuk menyaring tampilan per proyek, per tim lead, atau per rentang tanggal.
  2. Head menelaah tren pekerjaan carry-over yang sering berulang untuk mengetahui apakah ada masalah estimasi kapasitas tim atau dependensi eksternal.
  3. Head memeriksa rekaman *Cross-project support* untuk mengapresiasi anggota tim yang aktif membantu divisi lain.
- **Kondisi Akhir Layar:** Kepala divisi memiliki dasar faktual untuk melakukan penyesuaian alokasi sumber daya.

#### UF-32: Pemantauan Perusahaan di Management Pulse Dashboard & Escalation Aging
- **User Goal:** CEO dan Direksi ingin memantau kesehatan operasional seluruh perusahaan dan menyelesaikan eskalasi yang tersumbat di level manajemen.
- **Aktor:** CEO / Direksi / General Management.
- **Entry Point & Tampilan Layar:**
  - CEO membuka `/management` (Management Pulse) atau `/management/escalations`.
  - Tampilan menyajikan 6 widget agregat tingkat perusahaan (FR-69):
    1. *Company-wide exception overview by function*
    2. *RED/AMBER trend per function & project*
    3. *Top recurring blockers by category (10 taksonomi)*
    4. *No-submission trend & repeated compliance cases*
    5. *Unresolved escalation aging*
    6. *Project-impact & client-impact incidents*
- **Langkah Interaksi Antarmuka:**
  1. CEO membuka tab **Escalation Aging**: melihat daftar blocker yang belum selesai diurutkan dari durasi terlama (paling menua).
  2. CEO melihat jenjang eskalasi saat ini (Level 1 s/d Level 4) dan pimpinan mana yang sedang memegang tanggung jawab.
  3. Jika diperlukan intervensi strategis dewan, CEO dapat berkoordinasi langsung dengan pimpinan terkait.
- **Kondisi Akhir Layar:** Manajemen puncak mendapatkan visibilitas helikopter tanpa terbebani detail mikro harian.

#### UF-33: Peninjauan Kepatuhan Non-Submission di Compliance Queue (Matriks Distingsi Kasus)
- **User Goal:** HRGA dan Manajer menindaklanjuti karyawan yang terdeteksi sering tidak mengisi check-in secara adil dan manusiawi.
- **Aktor:** HRGA & Direct Manager Terkait.
- **Entry Point & Tampilan Layar:**
  - HRGA membuka rute `/compliance` (Compliance Queue).
  - Layar menampilkan daftar karyawan yang terdeteksi **Pattern Flag (3x kejadian No Submission dalam 30 hari kerja)**.
- **Langkah Interaksi Antarmuka:**
  1. HRGA mengklik baris karyawan terkait untuk membuka riwayat tanggal kejadian No Submission.
  2. HRGA bersama Manager membuka sesi tinjauan kepatuhan (*Review Event*) dan menerapkan **Matriks Distingsi Kasus (§13.1 PRD)**:
     - Apakah karena kendala teknis / beban kerja tinggi? $\rightarrow$ Klasifikasi: *Performance / delivery issue* (Tindakan: Bantuan teknis & pembinaan).
     - Apakah karena lupa administratif satu kali? $\rightarrow$ Klasifikasi: *Administrative miss* (Tindakan: Pengingat santun).
     - Apakah sengaja mengabaikan kewajiban berulang kali setelah dibina? $\rightarrow$ Klasifikasi: *Accountability / discipline pattern* (Tindakan: Rujukan ke peringatan tercatat).
  3. Manager/HRGA menginput catatan hasil review: Penjelasan karyawan, coaching yang disepakati, dan rencana tindak lanjut.
  4. Memilih status tindak lanjut: `Reminder Sent`, `Coaching Scheduled`, `Recorded Warning`, atau `Escalated to Offline Disciplinary`.
  5. Klik simpan $\rightarrow$ tercatat di arsip pembinaan karyawan.
- **Guardrails Bisnis (FR-30, FR-72):** Sistem DILARANG MUTLAK menerbitkan Surat Peringatan (SP) atau sanksi pemotongan gaji secara otomatis. Seluruh proses penegakan disiplin formal berlangsung **di luar sistem (offline HR process)** menggunakan rekam jejak sistem sebagai bukti pendukung objektif.
- **Kondisi Akhir Layar:** Kasus kepatuhan tertangani dengan adil, berbasis dialog manusiawi dan data faktual.

#### UF-34: Pencatatan Catatan Manajerial & Pembinaan (Manager Note: Recognition / Coaching / Corrective)
- **User Goal:** Pimpinan mencatat apresiasi atas kinerja gemilang, arahan pembinaan teknis, atau catatan korektif untuk bawahan.
- **Aktor:** Direct Manager / Head of Dept.
- **Entry Point & Tampilan Layar:**
  - Pimpinan membuka rute `/function/coaching` atau mengklik tombol *"Tambah Manager Note"* di profil detail anggota tim.
- **Langkah Interaksi Antarmuka:**
  1. Pimpinan memilih nama karyawan dan memilih **Jenis Catatan**:
     - `Recognition` (Apresiasi pencapaian / penyelesaian kendala luar biasa)
     - `Coaching` (Bimbingan perencanaan / peningkatan keterampilan)
     - `Corrective` (Catatan korektif kepatuhan / perbaikan cara kerja)
  2. Pimpinan mengetik teks catatan pembinaan.
  3. Pimpinan menautkan referensi bukti (tanggal komitmen atau ID blocker terkait).
  4. Pimpinan memilih tingkat visibilitas:
     - `Visible to Employee` (Karyawan dapat membaca catatan ini di halaman riwayatnya).
     - `Private to Managers & HR` (Hanya dapat dibaca oleh tim manajemen dan HRGA).
  5. Pimpinan menekan tombol **"Simpan Catatan Pembinaan"**.
- **Guardrails Bisnis:** Catatan ini bersifat pendamping mandiri, **TIDAK MENGUBAH ATAU MENIMPA** komitmen asli yang pernah disubmit oleh karyawan.
- **Kondisi Akhir Layar:** Rekam jejak pembinaan karyawan terdokumentasi rapi.

#### UF-35: Evaluasi Bukti Transisi Kinerja Kualitatif (Performance Transition Framework Review)
- **User Goal:** Reviewer berwenang menyusun bukti akuntabilitas dan mencatat evaluasi kualitatif berkala tanpa penilaian skor otomatis yang kaku.
- **Aktor:** Reviewer Berwenang (Direct Manager / Head of Dept).
- **Entry Point & Tampilan Layar:**
  - Reviewer membuka rute `/reports` pada tab **Individual Review Evidence**.
  - Reviewer memilih nama karyawan dan rentang periode evaluasi (misal Kuartal 1).
- **Langkah Interaksi Antarmuka:**
  1. Layar menyajikan bukti rekam jejak karyawan yang terstruktur dalam 4 Dimensi Utama (FR-56):
     - **Delivery:** Pemenuhan komitmen, penyelesaian tugas tambahan, dan bukti hasil kerja.
     - **Quality:** Kejelasan output, penyelesaian tuntas tanpa re-work, dan penanganan isu.
     - **Accountability:** Ketepatan waktu check-in, kejujuran pengungkapan risiko awal, dan disiplin eskalasi.
     - **Collaboration:** Bantuan yang diberikan pada blocker rekan kerja (*Support Contribution*), catatan apresiasi, dan kerja sama tim.
  2. Layar memisahkan secara tegas antara fakta rekam jejak, catatan pembinaan (*Manager Note*), dan area kesimpulan reviewer.
  3. Reviewer mencatat penilaian kualitatif terpandu:
     - Memilih salah satu predikat kualitatif (FR-57): `Strong`, `Meets`, `Needs Improvement`, atau `Unacceptable`.
     - Mengetik catatan evaluasi komprehensif dan rencana pengembangan.
  4. Reviewer menekan tombol **"Simpan Evaluasi Transisi Kinerja"**.
- **Guardrails Bisnis (FR-57, FR-62):** Sistem DILARANG menghitung skor KPI mentah atau rating otomatis berdasarkan persentase GREEN atau jumlah tugas. Penilaian murni merupakan pertimbangan kualitatif manusia berbasis bukti objektif.
- **Kondisi Akhir Layar:** Hasil evaluasi periodik tersimpan aman dan siap dibahas dalam sesi 1-on-1 bersama karyawan.

#### UF-36: Pemantauan Pasif Risiko Proyek oleh Project Manager (Project Risk View)
- **User Goal:** Project Manager memantau kesehatan dan hambatan pada proyek yang dikelolanya tanpa membebani tim dengan timesheet ganda.
- **Aktor:** Project Manager (PM).
- **Entry Point & Langkah Interaksi:**
  1. PM membuka rute `/my-scope/project-risk`.
  2. Layar mengelompokkan komitmen dan tugas tambahan seluruh anggota tim berdasarkan teks tautan referensi proyek (`Reference / Task Link`).
  3. PM melihat ringkasan risiko per proyek: jumlah item AMBER/RED, tugas carry-over berulang, dan blocker proyek yang masih terbuka.
  4. PM dapat mengekspor ringkasan risiko proyek untuk rapat koordinasi mingguan.
- **Guardrails Bisnis:** Tampilan ini murni derivatif *read-only*. Tidak ada entitas CRUD proyek formal di MVP, dan PM tidak menginput data di layar ini.
- **Kondisi Akhir Layar:** Visibilitas proyek tercapai tanpa mengorbankan waktu kerja tim.

---

### 7.7 Domain 7: User Flows Riwayat Pribadi, Notifikasi, & Tata Kelola Sistem

#### UF-37: Meninjau Riwayat Akuntabilitas & Ringkasan Mingguan Pribadi (My History & Weekly Summary)
- **User Goal:** Karyawan meninjau rekam jejak kerjanya sendiri untuk refleksi mandiri atau bukti evaluasi kinerja.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Layar:**
  - Karyawan membuka rute `/history` melalui menu sidebar *"My History"*.
  - Layar menyajikan kalender bulanan dan daftar riwayat harian milik sendiri.
- **Langkah Interaksi Antarmuka:**
  1. Karyawan melihat status setiap hari dengan dua badge berdampingan: Kepatuhan Waktu (`On-Time` / `Late` / `No Submission`) dan Status Risiko (`GREEN` / `AMBER` / `RED` / `NOT_APPLICABLE`).
  2. Karyawan mengklik salah satu tanggal untuk membuka rincian hari tersebut (`/history/:date`):
     - Membaca komitmen pagi, hasil evaluasi sore, alasan penambahan tugas tengah hari, blocker yang dilaporkan, dan catatan pembinaan pimpinan yang ditandai terlihat untuknya.
  3. Karyawan mengklik tab **Weekly Summary**:
     - Melihat agregat mingguan: jumlah komitmen tuntas, distribusi status hari, kontribusi bantuan yang diberikan pada blocker rekan lain (*Support Contribution*), dan pola tugas berlanjut.
  4. Karyawan menekan tombol **`ExportButton`** di pojok kanan atas untuk mengunduh berkas rekam jejak pribadinya dalam format CSV/PDF.
- **Guardrails Bisnis (NFR-07):** Karyawan tidak dapat mengintip riwayat karyawan lain melalui rute ini. Tidak ada elemen kompetitif atau pemeringkatan rekan kerja.
- **Kondisi Akhir Layar:** Transparansi akuntabilitas personal terpenuhi.

#### UF-38: Interaksi dengan Pusat Notifikasi In-App & Pengaktifan Izin Notifikasi Browser
- **User Goal:** Pengguna mengelola pemberitahuan penting dan mengatur izin notifikasi browser desktop.
- **Aktor:** Seluruh Pengguna.
- **Entry Point & Langkah Interaksi:**
  1. Ikon lonceng `NotificationBell` di topbar menampilkan angka notifikasi belum dibaca.
  2. Pengguna mengklik lonceng atau membuka rute `/notifications`.
  3. Daftar notifikasi tampil terurut waktu (peringatan mendekati deadline, blocker ditugaskan, eskalasi, permohonan koreksi, persetujuan cuti).
  4. Pengguna mengklik notifikasi $\rightarrow$ notifikasi ditandai telah dibaca (`Read`) dan peramban langsung membuka halaman terkait via deep-link.
  5. **Pengaturan Browser Push (FR-38):**
     - Jika peramban mendukung Push dan izin belum pernah diminta, muncul banner ramah: *"Aktifkan notifikasi desktop agar tidak melewatkan blocker mendesak."*
     - Pengguna mengklik tombol **"Aktifkan Notifikasi Desktop"**.
     - Dialog native browser muncul meminta izin $\rightarrow$ jika pengguna klik *Allow*, status Push aktif.
     - Jika pengguna klik *Block/Deny*, status menampilkan Push Ditolak. Sistem tidak memaksa meminta ulang, dan alur kerja utama tetap berjalan normal via email dan web center.
- **Kondisi Akhir Layar:** Komunikasi berjalan efektif sesuai preferensi perangkat pengguna.

#### UF-39: Penarikan & Ekspor Laporan Sesuai Batas Kewenangan (Scoped Export)
- **User Goal:** Pimpinan atau HRGA mengunduh berkas laporan resmi untuk pelaporan manajemen.
- **Aktor:** Head of Dept, HRGA, CEO/Management.
- **Entry Point & Langkah Interaksi:**
  1. Pengguna membuka rute `/reports`.
  2. Memilih tab laporan yang berhak diaksesnya (`Daily Exception`, `Weekly Team Summary`, `Monthly Trend`, atau `Blocker Root Cause`).
  3. Mengatur filter tanggal dan divisi menggunakan `FilterBar`.
  4. Layar merender data dan tabel yang sesuai.
  5. Pengguna mengklik tombol **`ExportButton`**.
  6. Sistem menghasilkan unduhan berkas (CSV/Spreadsheet/PDF) yang **HANYA BERISI DATA YANG SEDANG TAMPIL DI LAYAR SESUAI SCOPE SAH PENGGUNA (FR-42 / AC-20)**.
- **Kondisi Akhir Layar:** Laporan terunduh aman tanpa kebocoran data di luar wewenang.

#### UF-40: Pemetaan Struktur Organisasi Berpenanggalan Efektif oleh Admin (Org Mapping)
- **User Goal:** Administrator memperbarui struktur organisasi atau atasan langsung dengan tetap menjaga integritas riwayat masa lalu.
- **Aktor:** System Administrator / HRGA Berwenang.
- **Entry Point & Langkah Interaksi:**
  1. Admin membuka rute `/admin/organization`.
  2. Layar menyajikan bagan struktur aktif saat ini: Divisi, Lead, dan Anggota.
  3. Admin memilih personil untuk mengubah penugasan (misal mutasi divisi atau pergantian Direct Manager).
  4. Form perubahan mewajibkan pengisian: **Tanggal Berlaku Efektif (Effective Date)**.
  5. Admin mengklik tombol **"Lihat Preview Dampak"** $\rightarrow$ modal menampilkan siapa saja bawahan yang ikut terpengaruh dan tanggal mulai berlakunya hierarki baru.
  6. Admin menekan **"Konfirmasi Perubahan"** $\rightarrow$ penugasan tersimpan dengan penanggalan efektif.
  7. **Integritas Histori (FR-23, FR-24):** Seluruh data masa lalu tidak pernah ditimpa; record akuntabilitas lampau tetap menampilkan konteks atasan dan divisi yang menjabat pada tanggal kejadian tersebut.
- **Kondisi Akhir Layar:** Struktur organisasi terbarui dengan jejak historis utuh.

#### UF-41: Pendelegasian Reviewer Sementara oleh Pimpinan/Admin (Temporary Reviewer Assignment)
- **User Goal:** Menunjuk pengganti sementara untuk meninjau blocker dan koreksi bawahan saat manajer berhalangan/cuti panjang.
- **Aktor:** Administrator / Pimpinan Berwenang.
- **Entry Point & Langkah Interaksi:**
  1. Admin/Pimpinan membuka rute `/admin/temporary-reviewer`.
  2. Klik **"+ Tambah Delegasi Reviewer"**.
  3. Memilih pejabat yang digantikan, memilih personil pengganti (Temporary Reviewer), dan ruang lingkup bawahan.
  4. Mengisi **Effective Date** dan **Expiry Date** yang **keduanya wajib diisi (FR-25)**.
  5. Menekan tombol **"Simpan Penugasan Sementara"**.
  6. Pada rentang tanggal tersebut, reviewer pengganti otomatis melihat antrean review bawahan terkait di `/team/reviews`.
  7. Tepat pada jam akhir Expiry Date, wewenang delegasi otomatis dicabut oleh sistem tanpa perlu tindakan manual admin.
- **Guardrails Bisnis:** Penugasan sementara DILARANG dibuat terbuka tanpa batas kedaluwarsa (*no open-ended delegation*).
- **Kondisi Akhir Layar:** Kelancaran operasional review terjamin saat manajer berhalangan.

#### UF-42: Pengaturan Nilai Kebijakan Organisasi oleh Pemilik Kebijakan (Policy Settings)
- **User Goal:** Pemilik kebijakan yang berwenang mengubah parameter konfigurasi sistem tanpa menyentuh kode program.
- **Aktor:** Authorized Policy Owner (Admin / Head / HRGA sesuai kewenangan FR-34 / BR-15).
- **Entry Point & Langkah Interaksi:**
  1. Pengguna membuka rute `/policy-settings`.
  2. **Tampilan Terfilter Sesuai Wewenang:** Pengguna HANYA melihat section kebijakan yang menjadi kewenangannya:
     - Admin: Jam kerja, batas On-Time, Grace Period, batas Cut-Off.
     - Head / Management: Threshold waktu eskalasi SLA blocker.
     - HRGA: Ketentuan retensi bukti kepatuhan.
     *(Kategori di luar wewenang disembunyikan sepenuhnya dari antarmuka).*
  3. Pemilik kebijakan menyunting nilai parameter yang diizinkan dan memasukkan **Tanggal Berlaku Efektif (Effective Date)**.
  4. Sistem memvalidasi parameter terhadap aturan tetap produk (*Product Fixed Rules* - batas maksimal 3 komitmen dan ambang toleransi 3x non-submission tidak dapat diubah).
  5. Pengguna menekan tombol **"Terapkan Versi Kebijakan Baru"**.
  6. Sistem menyimpan konfigurasi sebagai versi baru berpenanggalan efektif (`PolicyVersionHistory`), versi lama diarsipkan.
- **Kondisi Akhir Layar:** Kebijakan operasional terkelola mandiri dengan tata kelola versi yang akuntabel.

---

---

## 8. Catatan Desain Khusus

**Pemisahan Outcome & Continuation:** Perubahan konseptual paling signifikan dari model lama ("Carry Over" sebagai satu status). UI wajib menampilkan keduanya sebagai dua kontrol yang jelas terpisah secara visual — bukan satu dropdown gabungan.

**Additional Work sebagai warga kelas dua yang setara:** Meskipun terpisah dari Commitment 1–3, Additional Work harus tetap mendapat perlakuan UI yang setara saat EOD — secara accountability ia sama pentingnya dengan commitment yang direncanakan.

**Authority Context tidak boleh disamarkan:** Ketika owner suatu blocker ditentukan lewat Project Authority (bukan direct manager), ini harus terlihat jelas di UI (`AuthorityTag`) — supaya user memahami mengapa notifikasi datang dari/ke orang yang bukan atasan langsungnya.

**Locked state harus terasa berbeda dari disabled biasa:** Baseline yang terkunci pasca Cut-Off bukan sekadar field abu-abu — perlu indikator eksplisit (`LockedIndicator`) yang menjelaskan *mengapa* terkunci, dan jalur yang jelas (Correction Request) jika policy mengizinkan perubahan.

**Submission timing bukan bagian dari StatusBadge:** On-Time/Late/No Submission menjawab pertanyaan "kapan disiplin submit", sedangkan GREEN/AMBER/RED menjawab "seberapa berisiko pekerjaannya" — keduanya independen dan tidak boleh digabung jadi satu indikator visual, agar tidak menimbulkan interpretasi yang salah (mis. "Late" disangka otomatis berarti AMBER).

**Project Risk View bersifat pasif dan derivatif:** Karena tidak ada entitas Project formal di MVP, tampilan ini murni agregasi read-only dari data Commitment yang sudah ada — tidak boleh menyiratkan adanya struktur project management tersendiri yang belum menjadi bagian scope produk.

**Validation prompt bukan blocking wall:** Saat Status Suggestion Engine berbeda pendapat dengan user, modal konfirmasi harus tetap memberi jalan bagi user untuk mempertahankan pilihannya (dengan alasan) — bukan memaksa user mengikuti saran sistem.

**Correction Morning dan EOD harus jelas terpisah:** kedua workflow memakai governance Minor/Material yang sejenis, tetapi berbeda target field, route, record, dan riwayat. Material tetap terlihat oleh reviewer dengan countdown `ObjectionWindowIndicator` dan reminder menjelang akhir window; baseline belum berubah selama window berlangsung.

**Leave dan Exemption terlihat berbeda secara sengaja:** Leave (butuh approval aktif) dan Holiday/Exemption (admin-set langsung) dipisah; status Pending tidak mengecualikan tanggal dari No Submission.

**Policy Settings sebagai satu halaman, bukan satu wewenang:**  Meskipun `/policy-settings` adalah satu rute untuk semua role, UI wajib memperlakukan tiap section kategori kebijakan sebagai unit visibility terpisah — user yang login hanya boleh melihat section yang authority-nya dia pegang, sisanya benar-benar tidak dirender (bukan cuma disembunyikan lewat CSS).


---

## 9. State & Feedback Contract untuk Prototype dan Implementasi

Bagian ini menetapkan state perilaku minimum yang harus dirancang untuk layar yang relevan. Ini bukan design system atau visual styling.

| Area | State minimum yang harus ditampilkan | Aturan feedback |
|---|---|---|
| Login/Invitation | Default, invalid credentials, inactive account, valid invite, expired/used/revoked invite, activation success | Error tidak membocorkan keberadaan akun lain; public registration tidak tersedia |
| Morning | Empty 0 commitments, populated 1–3, copy-forward available, validation error, saving, On-Time success, Late success, locked/cutoff rejected, correction unavailable/available | 0 commitment membutuhkan reason; agregat initial status hanya-baca; input dipertahankan pada kegagalan |
| EOD | Belum ada EOD, EOD draft dengan item, tidak ada item evaluable, cancelled-reason validation, continuation-reason validation, daily risk reason validation, suggestion tersedia/tidak tersedia/mismatch, saving, On-Time/Late success, cutoff rejection, locked, EOD correction available/unavailable | Continuation=Continue selalu membutuhkan reason; AMBER/RED membutuhkan daily explanation; bila tidak ada item evaluable dan tidak ada blocker aktif, jangan tampilkan suggestion; tidak ada silent status mutation |
| Correction | Draft request, submitting, Minor Applied, Material Pending/countdown, objection submitted, Rejected, Applied after window, failed submission | Morning/EOD dipisahkan; baseline tidak berubah selama Material Pending; no false success |
| Blocker | Open, Acknowledged, In Progress, Resolved awaiting reporter, Closed, Accepted Risk, auto-escalated, unauthorized action | Resolve membutuhkan resolution note; hanya pelapor mengonfirmasi Closed; Accepted Risk jalur terpisah |
| Notifications | Push not supported, permission prompt eligible, granted, denied, no subscription, delivery attempted, failed, success only if confirmed; in-app read/unread | Jangan menyamakan notification record dengan push delivery; fallback sesuai matriks trigger |
| Leave/Exemption | Leave Pending, Approved, Rejected; Holiday/Exemption configured/expired; approval atas tanggal yang sudah dievaluasi | Pending leave tidak mengecualikan tanggal; admin-set exception berlaku sesuai effective period; UI tidak menjanjikan penghapusan/reklasifikasi diam-diam atas No Submission yang sudah tercatat karena PDD/PRD belum menentukan rekonsiliasi retroaktif |
| Admin/Policy | Read-only unauthorized categories, authorized category, validation error, preview, confirm, effective-dated history | Tidak menampilkan kategori policy yang bukan wewenang; nilai operasional belum disahkan tidak boleh ditebak |

### 9.1 Aturan Umum Error, Loading, dan Double Submission
- Saat request berjalan, tombol submit menunjukkan state loading dan mencegah pengiriman ganda dari aksi berulang, tanpa menghapus input.
- Jika request gagal, tampilkan error yang actionable, pertahankan input yang aman, dan jangan tampilkan status sukses/Applied/Delivered tanpa konfirmasi server yang relevan.
- Jika hasil request tidak pasti (misalnya koneksi terputus setelah submit), UI harus menampilkan state yang meminta pengguna memeriksa status request sebelum mencoba lagi, atau memuat ulang status authoritative; jangan mendorong duplikasi.
- Empty state harus menjelaskan apakah data memang belum ada, tidak ada item yang cocok dengan filter, user tidak memiliki akses, atau data gagal dimuat. Jangan memakai satu empty state untuk semua kondisi.
- Semua status penting harus memiliki label teks; warna atau ikon tidak boleh menjadi satu-satunya pembawa makna.
- UI tidak menggantikan server-side authorization. Tombol yang tidak ditampilkan bukan satu-satunya kontrol akses.

## 10. Requirement Traceability — UI/UX Scope

Traceability berikut diperiksa terhadap PDD v1.4 FINAL dan PRD v1.5 FINAL. Setiap ID requirement dicantumkan secara individual agar tidak ada ID yang hanya diasumsikan tercakup karena berada dalam rentang. Lokasi menunjukkan spesifikasi perilaku UI atau disposisi non-UI; traceability bukan pengganti verifikasi acceptance test.

### 10.1 Functional Requirement Traceability

| ID | Lokasi UI/UX atau disposisi |
|---|---|
| FR-01 | 4.1, UF-01, UF-02 — Autentikasi login dan aktivasi akun via undangan sekali pakai |
| FR-02 | 4.6, UF-37, UF-40 — Snapshot organisasi historis; histori menampilkan konteks pada tanggal kejadian |
| FR-03 | 4.2, UF-06 — 0–3 Morning Commitment |
| FR-04 | 4.2, UF-06 — Kondisional Known Blocker dan Support Needed saat AMBER/RED |
| FR-05 | 4.2, 4.16a, UF-10, UF-22 — Baseline Morning terkunci pasca Cut-Off dan tata kelola koreksi |
| FR-06 | 4.3, UF-11 — Additional Work di tengah hari (5 alasan resmi) |
| FR-07 | 4.3, 4.4, UF-11, UF-12 — Additional Work tampil terpisah dari komitmen pagi dengan bobot setara |
| FR-08 | 4.4, UF-12 — Evaluasi EOD Outcome per item (4 status) |
| FR-09 | 4.4, UF-12 — Kontrol Continuation independen dan Continuation Reason wajib |
| FR-10 | 4.4, UF-12 — Final Status harian dan Daily Risk Explanation wajib jika AMBER/RED |
| FR-11 | 4.2, UF-09 — Koleksi draft copy-forward dari komitmen berlanjut hari kemarin (ADR-017) |
| FR-12 | 4.2, 6, UF-06 — Role-Based Prompt Hint; 7 fungsi kanonikal Dutamedia + fallback netral inline italic visual placeholder (ADR-016) |
| FR-13 | 4.4, UF-12 — Deterministic Status Suggestion Engine + deteksi carry-over berulang hari ke-2 (ADR-013) |
| FR-14 | 4.4, UF-13 — ValidationPromptModal saat status pilihan beda dari saran sistem; tanpa silent mutation |
| FR-15 | 4.5, UF-15 — Pembuatan instant blocker kapan saja |
| FR-16 | 4.5, 4.9, UF-15, UF-16 — Taksonomi Blocker lengkap (10 Type, 4 Severity, 7 Impact resmi PRD) |
| FR-17 | 4.9, UF-16, UF-17, UF-18 — Siklus hidup blocker & konfirmasi Closed / Reopen oleh pelapor |
| FR-18 | 4.9, UF-17, UF-18, UF-20 — Wewenang Resolve (support owner), Close (pelapor), dan Accepted Risk (manajerial) |
| FR-19 | 4.5, 4.9, 4.13, UF-15 — Authority Context (Organizational default vs Project eksplisit) |
| FR-19a | 4.5, UF-15 — Validasi penerima manual opsional |
| FR-19b | 4.5, UF-15 — Resolusi otomatis penerima awal, prioritas jenjang, dan fallback |
| FR-19c | 4.5, UF-15 — Penanganan kondisi penerima tidak valid dan pencatatan audit trail |
| FR-20 | 4.7, 4.9, 5, UF-15, UF-38 — Notifikasi dan eskalasi blocker |
| FR-21 | 4.9, 4.14, 5, UF-16, UF-32 — Auto-escalation berbasis SLA mengikuti hierarki bawaan 4 jenjang |
| FR-22 | 4.15, UF-40 — Master data struktur organisasi; CRUD server-authorized |
| FR-23 | 4.15, UF-40 — Penugasan organisasi efektif tanggal (effective-dated assignment) |
| FR-24 | 4.6, 4.15, UF-37, UF-40 — Konteks organisasi historis tetap dipertahankan pada data lampau |
| FR-25 | 4.17, UF-41 — Penugasan Temporary Reviewer wajib tanggal mulai dan kedaluwarsa |
| FR-26 | 4.2, 4.4, 5, UF-10, UF-14 — Klasifikasi waktu On-Time, Late, dan penolakan Cut-Off (ADR-018) |
| FR-27 | 4.12, 4.20, 4.21, UF-05, UF-25–UF-29 — Pengecualian sah (Holiday, Leave Approved, Indefinite Exemption) |
| FR-28 | 4.7, 5, UF-38 — Pengingat tetap 60 menit sebelum batas waktu (ADR-014) |
| FR-29 | 4.11, 5, UF-33 — Deteksi pola berulang 3x No Submission dalam 30 hari (Pattern Flag, ADR-008) |
| FR-30 | 4.11, UF-33 — Tidak ada sanksi atau surat peringatan otomatis dari sistem |
| FR-31 | 4.18, 4.19, UF-42 — Tata kelola kategori kebijakan multi-owner yang dapat dikonfigurasi |
| FR-32 | 4.18, UF-42 — Manajemen versi kebijakan dengan tanggal efektif |
| FR-33 | 4.18, UF-42 — Akses versi kebijakan historis |
| FR-34 | 2, 4.18, UF-42 — Visibilitas pengaturan kebijakan terfilter per kewenangan role pemilik |
| FR-35 | 4.2, 4.12, 4.18, UF-05, UF-29 — Kebijakan pengecualian: Indefinite Role Exemption (open-ended) vs Bounded Individual Exemption |
| FR-36 | 4.6, UF-37 — Akses riwayat akuntabilitas pribadi karyawan |
| FR-37 | 4.6, 4.8–4.9, 4.11, 4.21, 4.23, UF-30, UF-39 — Filter antrean dan dashboard yang sadar izin akses |
| FR-38 | 4.7, 4.19, 5, UF-38 — Pengiriman nyata Email & Browser Push serta Web Notification Center |
| FR-39 | 4.10, UF-34 — Pencatatan tindak lanjut manajerial (Manager Note / Coaching Record) |
| FR-40 | 4.10, 4.16, UF-22–UF-24, UF-34 — Tidak ada pengubahan komitmen diam-diam oleh pimpinan |
| FR-41 | 4.6, 4.23, UF-37, UF-39 — Ringkasan berkala mingguan dan laporan tren bulanan |
| FR-42 | 4.6, 4.23, UF-37, UF-39 — Ekspor berkas terbatas sesuai scope yang aktif di layar (AC-20) |
| FR-43 | 4.16a, UF-22 — Pengajuan Morning Correction Request pasca Cut-Off |
| FR-44 | 4.16a, 4.22, UF-22, UF-24 — Tata kelola siklus hidup koreksi Minor vs Material & Objection Window |
| FR-45 | 4.16a, 4.6, UF-22, UF-37 — Audit trail dan visibilitas riwayat koreksi pagi |
| FR-46 | 4.12, UF-27 — Penetapan hari libur dan pengecualian oleh Admin/HRGA langsung aktif seketika |
| FR-47 | 4.20–4.22, UF-25, UF-26 — Pengajuan Cuti mandiri dan persetujuan eksplisit oleh Authorized Approver |
| FR-48 | 4.12, 4.20–4.21, UF-05, UF-25–UF-29, UF-33 — Pengecualian sah mengecualikan tanggal dari No Submission |
| FR-49 | 4.11, 5, UF-33 — Maksimal satu pencatatan kejadian No Submission per hari kerja |
| FR-50 | 4.1, 4.15, UF-01 — Pendaftaran mandiri publik dilarang; akun dibuat oleh Admin |
| FR-51 | 4.2, UF-06, UF-08 — Agregasi Initial Daily Status otomatis dan hanya-baca |
| FR-52 | 4.2, 4.4, UF-06, UF-12 — Tomorrow Priority tersimpan sebagai konteks pengingat non-binding |
| FR-53 | 4.16b, UF-23 — Pengajuan EOD Correction Request hanya untuk EOD yang pernah disubmit |
| FR-54 | 4.1, UF-01 — Token aktivasi undangan sekali pakai dengan batas kedaluwarsa |
| FR-55 | 4.16b, 4.22, UF-23, UF-24 — Tata kelola, larangan bypass, dan audit trail koreksi EOD |
| FR-56 | 4.23, UF-35 — Kerangka Transisi Kinerja (4 Dimensi: Delivery, Quality, Accountability, Collaboration) |
| FR-57 | 4.23, UF-35 — Penilaian kualitatif reviewer (Strong, Meets, Needs Improvement, Unacceptable) tanpa auto-skor |
| FR-58 | 4.23, UF-35 — Evaluasi kinerja komprehensif lintas periode (tidak ditentukan dari 1 hari buruk) |
| FR-59 | 4.23, UF-35 — Individual Review Evidence memisahkan fakta riwayat, Manager Note, dan penilaian |
| FR-60 | 4.23, UF-35 — WorkPulse bukan mesin penentu insentif otomatis; keputusan mengikuti kebijakan terpisah |
| FR-61 | 4.6, 4.11, UF-33, UF-37 — Satu status buruk tidak otomatis menggugurkan insentif atau memicu sanksi |
| FR-62 | 4.23, UF-35 — Data WorkPulse dilarang diubah menjadi KPI mentah tanpa persetujuan tata kelola formal |
| FR-63 | 4.2, 6, UF-07 — Commitment Quality Warning / Prompt saat teks terlalu umum/abstrak (QualityWarningBadge) |
| FR-64 | 4.6, 4.9, 6, UF-19 — Pencatatan Support Contribution pada blocker rekan kerja sebagai bukti kolaborasi |
| FR-65 | 4.6, 4.8, UF-30, UF-31 — Penampilan tren carry-over berulang dan dukungan lintas tim di dashboard/summary |
| FR-66 | 4.6, UF-37 — Personal Weekly Summary untuk karyawan tanpa gamifikasi atau skor perbandingan |
| FR-67 | 4.6, 4.23, UF-35, UF-37 — Komponen lengkap Weekly Accountability Summary & Individual Review Evidence |
| FR-68 | 4.8, UF-30, UF-31 — 6 Widget resmi dashboard Head / Supervisor (Status summary, Exceptions, Blockers by owner, Carry-over trend, Cross-project support, Weekly summary) |
| FR-69 | 4.8, UF-32 — 6 Widget resmi CEO / Management Dashboard (Company exception, Risk trend, Top recurring blockers, Compliance trend, Escalation aging, Critical incidents) |
| FR-70 | 4.11, UF-33 — Pembentukan compliance review event saat pattern flag No Submission terbentuk |
| FR-71 | 4.11, UF-33 — Pencatatan penjelasan karyawan, pembinaan, tindak lanjut, dan audit trail kepatuhan |
| FR-72 | 4.11, UF-33 — Rujukan disipliner formal hanya melalui aktor berwenang; sistem tanpa auto-SP |
| FR-73 | 4.10, 4.11, UF-33, UF-34 — Penegakan Matriks Distingsi Kasus (§13.1 PRD) untuk respon adil dan proporsional |

### 10.2 Non-Functional Requirement Traceability

| ID | UI/UX consequence dan lokasi |
|---|---|
| NFR-01 | 4.2–4.4, UF-04, UF-06, 9.1 — Kecepatan pengisian ≤3 menit; retensi input form saat gagal validasi / sesi habis |
| NFR-02 | Seluruh layar; UF-37–UF-39 — Antarmuka web responsif pada desktop dan perangkat bergerak |
| NFR-03 | UF-02, 9.1 — Indikator feedback loading dan pencegahan submit ganda |
| NFR-04 | 9.1 — Tidak ada konfirmasi sukses palsu saat pemadaman jaringan |
| NFR-05 | 2, 4.1, 4.8–4.23, UF-02, 9.1 — Navigasi sadar hak akses dan penegakan otorisasi server-side |
| NFR-06 | 4.6, 4.9–4.10, 4.15–4.18, UF-19, UF-22–UF-24, UF-34, UF-40 — Jejak audit transparan dalam scope izin |
| NFR-07 | 4.8, 4.10–4.11, 4.23, UF-30, UF-34, UF-37 — Privasi data dan pembatasan akses data bawahan/pribadi |
| NFR-08 | 4.15, 4.17–4.19, UF-40–UF-42 — Tata kelola kebijakan berpenanggalan efektif (effective-dated) |
| NFR-09 | 4.18, UF-42 — Retensi data operasional ditegakkan teknis tanpa nilai tebakan |
| NFR-10 | Di luar scope UI; SAD / Operasional — Pencadangan dan pemulihan data teknis |
| NFR-11 | 4.6, 4.23, UF-37, UF-39, 9.1 — Ekspor data terbatas sesuai scope dan umpan balik kesalahan |
| NFR-12 | 4.8, 4.23, UF-30, UF-32, UF-37 — Prinsip non-surveillance; dilarang menampilkan leaderboard/pemeringkatan |

### 10.3 Acceptance Criteria Coverage Map

| ID | UI/UX location or disposition |
|---|---|
| AC-01 | 4.2, UF-06, 9 |
| AC-02 | 4.3, UF-11 |
| AC-03 | 4.4, UF-12, 9 |
| AC-04 | 4.16a, UF-22 |
| AC-05 | 4.5, 4.7, UF-15, UF-16 |
| AC-06 | 4.7, 4.9, UF-16, UF-38 |
| AC-07 | 2, 4.8, UF-30 |
| AC-08 | 4.8, 4.23, UF-30 |
| AC-09 | 4.12, 4.20–4.21, UF-05, UF-25–UF-29 |
| AC-10 | 4.11, 5, UF-33 |
| AC-11 | 4.15, UF-40 |
| AC-12 | 4.18, UF-42 |
| AC-13 | 4.17, UF-41 |
| AC-14 | 4.6, 4.23, UF-37, UF-39 |
| AC-15 | 4.6, 4.9–4.10, 4.15–4.18, UF-22–UF-24, UF-34, UF-40–UF-42 |
| AC-16 | 4.8, 4.23, UF-30 |
| AC-17 | 4.2–4.4, UF-06, 9.1; target uji usabilitas ≤3 menit |
| AC-18 | 4.16a, UF-22 |
| AC-19 | 4.20–4.21, UF-25; rekonsiliasi No Submission lampau pasca cuti disetujui terlambat diserahkan ke aturan produk |
| AC-20 | 4.6, 4.23, UF-37, UF-39 |
| AC-21 | 4.7, 4.19, 5, UF-38 |
| AC-22 | 4.7, 4.19, 5, UF-38 |
| AC-23 | 4.2, UF-06 |
| AC-24 | 4.4, UF-12 |
| AC-25 | 4.4, UF-12 |
| AC-26 | 4.11, 5, UF-33 |
| AC-27 | 4.4, UF-12 |
| AC-28 | 4.2, UF-06 |
| AC-29 | 4.2, UF-06 |
| AC-30 | 4.2, 4.4, UF-06, UF-12 |
| AC-31 | 4.16b, UF-23 |
| AC-32 | 4.16b, UF-23 |
| AC-33 | 4.9, UF-16 |
| AC-34 | 4.1, UF-01 |
| AC-35 | 9.1; formula availability dan monitoring diatur di SAD |
| AC-36 | 4.1, UF-01 |
| AC-37 | 4.2, 6, UF-06 — Role-Based Prompt Hint (7 fungsi kanonikal Dutamedia + fallback netral inline italic placeholder, ADR-016) |
| AC-38 | 4.4, UF-12 — Saran status deterministik + cabang carry-over berulang hari ke-2 (minimal AMBER) |
| AC-39 | 4.4, UF-12 |
| AC-40 | 4.7, 5, UF-38 |
| AC-41 | 4.18, UF-42 |
| AC-42 | 4.6, 4.8–4.9, 4.11, 4.21, 4.23, UF-30, UF-37, UF-39 |
| AC-43 | 4.10, UF-34 |
| AC-44 | 4.6, 4.23, UF-37, UF-39 |
| AC-45 | 4.12, UF-27–UF-29 |
| AC-46 | 4.5, 4.9, 4.13, UF-15 |
| AC-47 | Seluruh layar yang relevan; validasi responsif diuji pada prototipe |
| AC-48 | 9.1; patokan respons <2 detik diuji pada implementasi dan SAD |
| AC-49 | 4.8, 4.10–4.11, 4.23, UF-30, UF-33, UF-34; tanpa antarmuka pengawasan aktivitas invasif |
| AC-50 | 4.18, UF-42; penegakan masa retensi secara operasional |
| AC-51 | Verifikasi teknis non-UI pada SAD/operasional; tanpa layar backup mandiri pengguna |
| AC-52 | 4.7, 4.9, 4.14, 5, UF-15, UF-16, UF-38 |
| AC-53 | 2, 4.1, 4.8–4.23, 9.1; visibilitas UI tidak menggantikan otorisasi server-side |
| AC-54 | 4.15, UF-40 |
| AC-55 | 4.5, 4.9, UF-15, UF-16 — Taksonomi Blocker lengkap (10 Type, 4 Severity, 7 Impact) |
| AC-56 | 4.3, UF-11 |
| AC-57 | 4.2, 4.4, 5, UF-10, UF-14 |
| AC-65 | 4.23, UF-35 — Individual Review Evidence 4 dimensi; tanpa kalkulasi KPI skor otomatis |
| AC-66 | 4.23, UF-35 — Pencatatan predikat kualitatif terpandu beserta alasan/evidence |
| AC-67 | 4.23, UF-35 — Review periodik berkonteks lintas periode tanpa rating dari 1 hari buruk |
| AC-68 | 4.23, UF-35 — Pemisahan transparan antara data faktual, Manager Note, dan penilaian |
| AC-69 | 4.23, UF-35 — Sistem tidak menghitung atau menerapkan insentif otomatis |
| AC-70 | 4.6, 4.11, UF-33, UF-37 — Tidak ada auto-SP atau pemotongan insentif dari satu status buruk |
| AC-71 | 4.23, UF-35 — Tidak ada skor KPI mentah otomatis dari seluruh data WorkPulse |
| AC-72 | 4.2, 6, UF-07 — Quality warning non-blocking saat komitmen terlalu generik/abstrak |
| AC-73 | 4.6, 4.9, 6, UF-19 — Support Contribution tersimpan dengan kontributor, tindakan, waktu, dan outcome |
| AC-74 | 4.6, 4.8, UF-30, UF-31 — Penampilan pola carry-over berulang tanpa kesimpulan performa sepihak |
| AC-75 | 4.6, UF-37 — Personal weekly summary tanpa leaderboard atau streak kompetitif |
| AC-76 | 4.6, 4.23, UF-35, UF-37 — Pembedaan jenis evidence pada summary dan review evidence |
| AC-77 | 4.8, UF-30, UF-31 — Dashboard Head/Supervisor exception-first dengan 6 widget resmi |
| AC-78 | 4.8, UF-32 — Dashboard CEO/Management Trend dengan 6 widget agregat resmi |
| AC-79 | 4.11, UF-33 — Pattern flag No Submission menghasilkan review event, bukan sanksi otomatis |
| AC-80 | 4.11, UF-33 — Review event mencatat penjelasan, konteks, coaching, dan rencana tindak lanjut |
| AC-81 | 4.11, UF-33 — Rujukan warning formal dicatat oleh aktor berwenang; sistem tanpa auto-SP |
| AC-82 | 4.10, 4.11, UF-33, UF-34 — Penegakan Matriks Distingsi Kasus (§13.1 PRD) |

### 10.4 Rollout and Pilot Governance Traceability

| ID | Kriteria Tata Kelola Peluncuran & Uji Coba Pilot |
|---|---|
| RG-01 | Phase 0 menyelesaikan finalisasi cutoff, grace period, eskalasi, exemption, reviewer, dan batas disiplin |
| RG-02 | Pilot MVP 2–4 minggu pada divisi prioritas; evaluasi usability dan beban kerja sebelum company rollout |
| RG-03 | Company rollout setelah validasi pilot selesai; cakupan ~30 karyawan awal bukan batas permanen |
| RG-04 | Management review setelah 4–8 minggu data operasional berjalan |
| RG-05 | Integrasi KPI hanya dipertimbangkan setelah organisasi stabil lewat tata kelola terpisah |
| RG-06 | Evaluasi pilot mengacu pada Pilot Success Metrics (PSM-01 s/d PSM-07) |

### 10.5 Boundary dan keputusan yang tidak boleh diasumsikan

- **FR-12 / AC-37:** panduan berdasarkan fungsi organisasi telah dikunci definitif sesuai 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) + fallback netral. Sesuai ADR-016, hint ini tampil sebagai visual placeholder miring (*italic*) saat mengetik, non-binding, tidak mengontaminasi input form, dan tidak disimpan ke database.
- **Leave retroaktif / AC-19:** PDD/PRD menyatakan Leave harus disetujui agar menjadi exception valid, tetapi tidak menetapkan secara eksplisit rekonsiliasi terhadap event No Submission yang telah tercatat sebelum persetujuan. UI menampilkan status approval dan tidak menjanjikan penghapusan diam-diam. Keputusan perilaku rekonsiliasi tersebut harus diselesaikan sebagai keputusan produk sebelum implementasi.
- **Perubahan organizational assignment dengan tanggal lampau:** PDD/PRD mengharuskan effective-dated history tetapi tidak secara eksplisit menetapkan apakah tanggal lampau boleh dipilih. UI wajib meminta Effective Date dan mempertahankan histori; jangan menambahkan larangan retroaktif atau menjanjikan efek retroaktif tanpa aturan produk yang disahkan.
- **Nilai operasional:** deadline, Grace Period, workday calendar, Objection Window, klasifikasi Minor/Material, threshold eskalasi, retention, invitation expiry, maintenance notice, dan availability service hours mengikuti Launch Configuration Register yang disahkan. UI tidak menampilkan nilai produksi hasil tebakan.
- **NFR teknis:** backup/restore, enkripsi transport, benchmark <2 detik, dan perhitungan availability harus diverifikasi pada SAD/implementasi; UI/UX hanya menetapkan state dan batas perilaku yang relevan.
- **Browser Push:** matriks channel mengikuti persis PRD Section 8. Permission merupakan kondisi browser/perangkat user, bukan atribut global yang dapat dibuktikan melalui test-send dari browser Admin.

---

## Riwayat Revisi

### Riwayat Revisi v1.5 — Final
- Memperbarui referensi dari PDD/PRD v1.1 ke baseline final PDD/PRD v1.3.
- Memisahkan Morning Correction Request dan EOD Correction Request beserta scope field dan guardrails masing-masing.
- Menetapkan 0 Commitment dengan alasan wajib dan `NOT_APPLICABLE — NO_COMMITMENT` sebagai state UI yang valid.
- Menetapkan Initial Daily Status sebagai hasil agregasi read-only.
- Memperjelas FR-11 copy-forward dan `Tomorrow Priority` sebagai konteks terpisah.
- Memperbaiki lifecycle blocker menjadi Resolved → reporter confirms Closed; Accepted Risk adalah jalur terpisah.
- Menambahkan invitation activation, Browser Push permission/delivery states, dan cutoff semantics dari ADR-014/ADR-018.
- Menambahkan state contract, handling error/double-submit, dan traceability lengkap ke seluruh FR/NFR/AC PRD.

### Riwayat Revisi v1.6
- Menyelaraskan flow Raise Instant Blocker dengan PDD v1.3 dan PRD v1.3: Authority Context default, pilihan Owner Needed opsional, resolusi otomatis, validasi, fallback, kondisi ambigu, dan audit trail.
- Memperjelas state/error handling dan pembedaan Owner Needed awal dari escalation chain.

### Riwayat Revisi v1.7.2
- Sinkronisasi arsitektur navigasi dan sidebar layout dengan PDD v1.4 dan PRD v1.4.

### Riwayat Revisi v1.8.0 — FINAL
- Memperbarui seluruh referensi dokumen induk ke **PDD v1.4 FINAL** dan **PRD v1.5 FINAL**.
- Menetapkan secara definitif spesifikasi dan flow **Role-Based Prompt Hint** (FR-12 / AC-37 / ADR-016) untuk 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) + fallback netral.
- Menetapkan spesifikasi alur **Indefinite Role Exemption** (FR-35 / BR-07) untuk akun eksekutif struktural (CEO/Dewan Direksi) dengan komponen `ExemptionBanner` di `/today`, pengecualian penuh dari No Submission evaluation, dan kontrol konfigurasi open-ended di `/compliance/exemptions`.
- Mengunci taksonomi Blocker (FR-16 / AC-55) secara komprehensif: 10 Type, 4 Severity, 7 Impact pada form input, filter antrean, dan detail card.
- Menyempurnakan lifecycle Blocker: penambahan aksi `Reopen / Needs Further Work` oleh pelapor jika bantuan belum memadai, serta auto-escalation sistematis mengikuti hierarki bawaan 4 jenjang Dutamedia.
- Menyinkronkan heuristik Status Suggestion Engine pada cabang carry-over berulang kedua (FR-13 / AC-38) yang langsung merekomendasikan minimal AMBER.
- Menyelesaikan seluruh matrix keterlacakan (traceability) FR-01 s/d FR-55, NFR-01 s/d NFR-12, dan AC-01 s/d AC-57 secara konsisten 100%.

### Riwayat Revisi v1.9.0 — FINAL (Comprehensive User-Centric Flows)
- Mengubah seluruh Section 7 menjadi **42 User Flows Interaktif (UF-01 s/d UF-42)** yang murni berorientasi pada pengalaman nyata pengguna manusia di depan layar (User Goals, Steps, UI Decision Nodes, Modals, & Visual Feedback).
- Mengintegrasikan seluruh requirement dari Baseline Reconciliation Addendum PRD v1.5:
  - **Commitment Quality Warning Prompt (FR-63 / AC-72)** pada UF-07.
  - **Pencatatan Support Contribution lintas tim (FR-64 / AC-73)** pada UF-19.
  - **Individual Review Evidence & Performance Transition Framework 4 Dimensi (FR-56–FR-59 / AC-65–AC-68)** pada UF-35.
  - **Penegakan Matriks Distingsi Kasus Kepatuhan (§13.1 PRD, FR-70–FR-73 / AC-79–AC-82)** pada UF-33 dan UF-34.
  - **6 Widget Resmi Dashboard Head/Supervisor (FR-68 / AC-77)** pada UF-30 dan UF-31.
  - **6 Widget Resmi Dashboard CEO/Management Trend (FR-69 / AC-78)** pada UF-32.
- Memperbarui Section 10 Traceability Map secara komprehensif mencakup FR-01 s/d FR-73, NFR-01 s/d NFR-12, AC-01 s/d AC-82, dan Governance Criteria RG-01 s/d RG-06.
- Menyelaraskan seluruh taksonomi Blocker 100% konsisten dengan PRD v1.5 FR-16 (10 Type, 4 Severity, 7 Impact).

### 10.4 Boundary dan keputusan yang tidak boleh diasumsikan

- **FR-12 / AC-37:** panduan berdasarkan fungsi organisasi telah dikunci definitif sesuai 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) + fallback netral. Sesuai ADR-016, hint ini tampil sebagai visual placeholder miring (*italic*) saat mengetik, non-binding, tidak mengontaminasi input form, dan tidak disimpan ke database.
- **Leave retroaktif / AC-19:** PDD/PRD menyatakan Leave harus disetujui agar menjadi exception valid, tetapi tidak menetapkan secara eksplisit rekonsiliasi terhadap event No Submission yang telah tercatat sebelum persetujuan. UI menampilkan status approval dan tidak menjanjikan penghapusan diam-diam. Keputusan perilaku rekonsiliasi tersebut harus diselesaikan sebagai keputusan produk sebelum implementasi.
- **Perubahan organizational assignment dengan tanggal lampau:** PDD/PRD mengharuskan effective-dated history tetapi tidak secara eksplisit menetapkan apakah tanggal lampau boleh dipilih. UI wajib meminta Effective Date dan mempertahankan histori; jangan menambahkan larangan retroaktif atau menjanjikan efek retroaktif tanpa aturan produk yang disahkan.
- **Nilai operasional:** deadline, Grace Period, workday calendar, Objection Window, klasifikasi Minor/Material, threshold eskalasi, retention, invitation expiry, maintenance notice, dan availability service hours mengikuti Launch Configuration Register yang disahkan. UI tidak menampilkan nilai produksi hasil tebakan.
- **NFR teknis:** backup/restore, enkripsi transport, benchmark <2 detik, dan perhitungan availability harus diverifikasi pada SAD/implementasi; UI/UX hanya menetapkan state dan batas perilaku yang relevan.
- **Browser Push:** matriks channel mengikuti persis PRD Section 8. Permission merupakan kondisi browser/perangkat user, bukan atribut global yang dapat dibuktikan melalui test-send dari browser Admin.

---

## Riwayat Revisi

### Riwayat Revisi v1.5 — Final
- Memperbarui referensi dari PDD/PRD v1.1 ke baseline final PDD/PRD v1.3.
- Memisahkan Morning Correction Request dan EOD Correction Request beserta scope field dan guardrails masing-masing.
- Menetapkan 0 Commitment dengan alasan wajib dan `NOT_APPLICABLE — NO_COMMITMENT` sebagai state UI yang valid.
- Menetapkan Initial Daily Status sebagai hasil agregasi read-only.
- Memperjelas FR-11 copy-forward dan `Tomorrow Priority` sebagai konteks terpisah.
- Memperbaiki lifecycle blocker menjadi Resolved → reporter confirms Closed; Accepted Risk adalah jalur terpisah.
- Menambahkan invitation activation, Browser Push permission/delivery states, dan cutoff semantics dari ADR-014/ADR-018.
- Menambahkan state contract, handling error/double-submit, dan traceability lengkap ke seluruh FR/NFR/AC PRD.

### Riwayat Revisi v1.6
- Menyelaraskan flow Raise Instant Blocker dengan PDD v1.3 dan PRD v1.3: Authority Context default, pilihan Owner Needed opsional, resolusi otomatis, validasi, fallback, kondisi ambigu, dan audit trail.
- Memperjelas state/error handling dan pembedaan Owner Needed awal dari escalation chain.

### Riwayat Revisi v1.7.2
- Sinkronisasi arsitektur navigasi dan sidebar layout dengan PDD v1.4 dan PRD v1.4.

### Riwayat Revisi v1.8.0 — FINAL
- Memperbarui seluruh referensi dokumen induk ke **PDD v1.4 FINAL** dan **PRD v1.5 FINAL**.
- Menetapkan secara definitif spesifikasi dan flow **Role-Based Prompt Hint** (FR-12 / AC-37 / ADR-016) untuk 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) + fallback netral.
- Menetapkan spesifikasi alur **Indefinite Role Exemption** (FR-35 / BR-07) untuk akun eksekutif struktural (CEO/Dewan Direksi) dengan komponen `ExemptionBanner` di `/today`, pengecualian penuh dari No Submission evaluation, dan kontrol konfigurasi open-ended di `/compliance/exemptions`.
- Mengunci taksonomi Blocker (FR-16 / AC-55) secara komprehensif: 10 Type, 4 Severity, 7 Impact pada form input, filter antrean, dan detail card.
- Menyempurnakan lifecycle Blocker: penambahan aksi `Reopen / Needs Further Work` oleh pelapor jika bantuan belum memadai, serta auto-escalation sistematis mengikuti hierarki bawaan 4 jenjang Dutamedia.
- Menyinkronkan heuristik Status Suggestion Engine pada cabang carry-over berulang kedua (FR-13 / AC-38) yang langsung merekomendasikan minimal AMBER.
- Menyelesaikan seluruh matrix keterlacakan (traceability) FR-01 s/d FR-55, NFR-01 s/d NFR-12, dan AC-01 s/d AC-57 secara konsisten 100%.

### Riwayat Revisi v1.9.0 — FINAL (Pure Interactive User Flows)
- Merekonstruksi seluruh Section 7 dari deskripsi teknis menjadi **42 User Flows Interaktif (UF-01 s/d UF-42)** murni berpusat pada interaksi manusia dan layar antarmuka.
- Mengintegrasikan seluruh requirement baseline PRD v1.5 Addendum: Performance Transition Multi-Dimension (`UF-35`), Incentive Fair Use & Non-penalty, Quality Warning Badge (`UF-07`), Support Contribution Card (`UF-19`), 6 Widget Resmi Dashboard Supervisor (`UF-33`), 6 Widget Resmi Dashboard CEO (`UF-34`), dan Compliance Review Event Matrix (`UF-36`).
- Menyelesaikan 100% Traceability Matrix di Section 10 mencakup FR-01 s/d FR-73, AC-01 s/d AC-82, NFR-01 s/d NFR-12, dan RG-01 s/d RG-06.

