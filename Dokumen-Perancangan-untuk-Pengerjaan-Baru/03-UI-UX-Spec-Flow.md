# UI/UX Specification & Flow Document
## WorkPulse — Daily Accountability & Blocker Log System

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 2.0.0 |
| Status | FINAL — Fully aligned with PDD v1.5 FINAL & PRD v1.6 FINAL |
| Date | 28 Oktober 2026 |
| Referensi | PDD v1.5 FINAL, PRD v1.6 FINAL, 00-Project-Charter-and-Governance.md v1.0 FINAL |

> Dokumen ini mendefinisikan **alur interaksi dan perilaku** berdasarkan PDD v1.5 FINAL dan PRD v1.6 FINAL yang telah ditetapkan sebagai baseline mandiri: user flow, screen behavior, state, validasi, feedback, error handling, permission-aware visibility, serta transisi. Dokumen ini bukan penetapan visual detail (warna, tipografi, spacing → Design System), bukan prototype, dan bukan keputusan arsitektur teknis. Nilai operasional yang belum ditetapkan tidak boleh dikarang; gunakan Launch Configuration Register yang disahkan sebelum implementasi. Jika sumber requirement tidak menentukan perilaku pada suatu kondisi tepi, UI tidak boleh menjanjikan hasil yang belum ditetapkan.

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
| System Admin | Admin: User & Invitation (`/admin/users`), Organizational Mapping (`/admin/organization`) (sesuai kewenangan), Temporary Reviewer, Notification Setup; Pulse Dashboard tidak otomatis tersedia tanpa permission dashboard |

> **Policy Settings bukan lagi menu eksklusif System Admin.** Menu "Policy Settings" muncul untuk **role mana pun yang punya minimal satu kategori kebijakan sebagai kewenangannya** (sesuai FR-34/BR-15) — isinya di-filter per kategori yang jadi authority-nya masing-masing. Lihat Section 4.18.

User dengan multi-role (mis. Head yang juga mengisi check-in sendiri) tetap punya akses "My Today" sebagai Employee — role tambahan menambah menu, tidak menggantikan menu dasar.

**Struktur sidebar dan konteks akun:**
- Sidebar mengelompokkan menu menjadi **Workspace** (alur pribadi/self-service), **Management** (dashboard, queue, reporting, dan kepatuhan), serta **Administration** (`/admin/users`, `/admin/organization`, `/admin/temporary-reviewer`, `/policy-settings`) bila role aktif memiliki menu pada kelompok terkait. Kelompok yang kosong tidak ditampilkan. Urutan dan nama menu tetap mengikuti tabel role di atas; pengelompokan tidak menciptakan permission baru.
- Identitas akun (nama, fungsi/role aktif ringkas, dan tautan ke `/profile`) berada pada area akun di bagian bawah sidebar, mengikuti pola shell yang konsisten antarlaman. Jangan menambahkan kartu besar berisi role/scope/permission tepat di bawah logo sebagai elemen wajib global.
- Scope aktif dan permission relevan ditampilkan secara ringkas pada konteks halaman management yang membutuhkannya—misalnya subtitle, badge, atau scope note—bukan diduplikasi sebagai daftar chip di bagian atas setiap sidebar. Pada halaman self-service, tidak perlu menampilkan daftar permission; identitas akun dan menu Workspace sudah memadai.
- Label role, scope, dan permission harus berasal dari role, permission, dan assignment efektif yang ditetapkan sistem; bukan pilihan bebas pengguna dan bukan sekadar teks dekoratif. Menu hanya ditampilkan jika permission sesuai, dan route/data tetap wajib divalidasi di sisi server. Permission bersyarat (mis. Authorized Reviewer/Approver) yang belum diberikan tidak menampilkan menu terkait. Jangan menampilkan scope atau izin yang tidak dimiliki pengguna.

---

### Aturan final layout sidebar
- Logo/brand dan awal grup navigasi pertama harus memiliki jarak vertikal yang jelas; jarak tidak boleh tampak menempel. Jarak ini diterapkan konsisten pada seluruh shell halaman aplikasi.
- Antargrup navigasi yang tersedia (`Workspace`, `Management`, `Administration`) wajib memiliki jarak vertikal eksplisit yang jelas; jangan mengandalkan margin label saja.
- Identitas akun berada di bagian paling bawah sidebar, dipisahkan oleh pembatas halus. Jangan menempatkan kartu role/scope/permission besar di bawah logo.
- Pada halaman self-service, tampilkan identitas akun secara ringkas; daftar permission tidak diperlukan. Pada halaman management, scope efektif dan permission yang relevan dijelaskan di konteks konten, dan bila diperlukan ringkasan ringkas di area akun bawah.
- Bila viewport pendek, jarak boleh dikurangi secara responsif tetapi urutan, pemisahan grup, dan penempatan identitas di bagian bawah tetap dijaga. Sidebar harus tetap dapat discroll tanpa menutupi navigasi atau identitas akun.

## 3. Information Architecture

```
/login
  /login/activate                    Aktivasi Akun via Token Undangan Sekali Pakai
  /login/forgot-password             Permohonan Tautan Pemulihan Kata Sandi
  /login/reset-password              Penetapan Kata Sandi Baru via Token Pemulihan

/today
  /today/morning                     Morning Commitment
  /today/morning/correction-request  Morning Correction Request (pasca Cut-Off, jika diizinkan policy)
  /today/additional-work             Add Additional Work
  /today/eod                         EOD Outcome & Continuation
  /today/eod/correction-request      EOD Correction Request (hanya EOD yang sudah submit dan locked)
  /today/raise-blocker               Raise Instant Blocker (+ Sub-tab Blocker Saya)
  /today/leave-request               Ajukan Leave Request

/history                             My History & Weekly Summary
/history/:date                       Detail satu hari

/notifications                       Web Notification Center
/profile                             Profile & Account Settings

/team                                Team Pulse Dashboard (target route dari menu Pulse Dashboard; Supervisor/TL, team/assigned scope)
/team/blockers                       Blocker Queue (scoped)
/team/reviews                        Correction & Leave Review Queue (scoped; tampil sesuai permission Authorized Reviewer/Approver)
/function                            Function Pulse Dashboard (target route dari menu Pulse Dashboard; Head, function-scoped)
/function/coaching                   Manager Note / Coaching Record (scoped)
/function/escalations                Blocker & Escalation Queue (function-scoped)

/my-scope/project-risk               Project Risk View (PM) — agregasi berbasis Reference/Task

/compliance                          Compliance Queue (HRGA)
/compliance/exemptions               Holiday & Individual/Role Exemption Management (Admin/HRGA berwenang)
/compliance/leave-approvals          Leave Approval Queue (Authorized Approver)
/compliance/records                  Coaching/Warning Record (HRGA / permission ketat)

/management                          Management Pulse Dashboard (target route dari menu Pulse Dashboard; CEO/Management berwenang, company-wide)
/management/escalations              Escalation Aging (company-wide)

/reports                             Reports (scope mengikuti role — lihat 4.23)
/policy-settings                     Policy Settings (multi-owner, filtered per kategori kewenangan)
/admin/users                         User & Invitation Management (Admin/Management berwenang — lihat 4.24)
/admin/organization                  Organizational Mapping & Project Authority (Admin/Management berwenang; effective-dated — lihat 4.15)
/admin/temporary-reviewer            Temporary Reviewer Assignment (Admin/Management berwenang)
/admin/notifications                 Notification Channel Setup
```

---

## 4. Spesifikasi Halaman (Behavior, bukan Visual)

### 4.0 Konvensi Ergonomi & Perilaku Lintas-Halaman
- **Antarmuka Produksi Bersih (*Zero Jargon & Zero Native Browser Alerts*):** Teks UI yang menghadap pengguna bebas dari kebocoran nama *enum* teknis mentah, nomor pasal internal spesifikasi, karakter markdown tak ter-render, maupun dialog bawaan peramban (`window.alert` / `window.confirm`). Seluruh konfirmasi menggunakan komponen dialog internal yang aksesibel. *(Catatan: pada berkas prototipe HTML di tahap desain, panel penguji state diperbolehkan hanya sebagai bilah simulasi terpisah sesuai Playbook-01, namun tidak pernah menjadi bagian dari antarmuka aplikasi produksi).*
- **Bebas Emoji Unicode:** Seluruh indikator antarmuka menggunakan ikon garis monokrom (*inline SVG stroke*) secara konsisten disertai label teks yang eksplisit; pelaporan kendala (*Blocker*) menggunakan ikon bendera (*flag*), bukan simbol petir.
- **Layar `403 Access Restricted` Terstandar:** Apabila pengguna mengakses URL langsung ke rute di luar izin peran/scope aktifnya, seluruh kontainer data dan aksi penyegaran disembunyikan, digantikan oleh panel/halaman `403 Akses Dibatasi` yang tenang (tanpa membocorkan eksistensi data di luar wewenang) disertai tombol kembali ke `/today`.
- **Fokus Deep-Link & Pembersihan Filter:** Navigasi masuk melalui *deep-link* (mis. dari notifikasi atau *drill-down* dashboard) menggulirkan layar ke item sasaran dengan sorotan satu kali yang menghormati `prefers-reduced-motion`. Tombol `Reset Filter` mengembalikan seluruh saringan dan *query string* ke kondisi awal dalam satu klik.
- **Ketahanan Tata Letak pada Teks Panjang & Layar Sempit:** Kotak centang (*checkbox*) pada kartu daftar tetap sejajar kiri dengan baris pertama judul (tidak melompat sendirian ke atas judul pada mobile), dan string panjang seperti tautan referensi/tiket dibungkus aman (`overflow-wrap: anywhere` dengan `min-width: 0`) agar tidak menimbulkan luapan horizontal.

### 4.1 Login & Aktivasi Akun
- Halaman login (`/login`) menerima kredensial dari akun aktif yang telah dibuat Admin/Management berwenang melalui `/admin/users` (lihat Section 4.24). Tidak tersedia public self-registration. Pada desktop, tata letak menggunakan *split-screen* proporsional (panel nilai budaya akuntabilitas di kiri dan kartu form bersih di kanan), yang beradaptasi menjadi `MobileBrandHeader` ringkas di atas kartu form pada layar sempit; label CTA utama bersifat inklusif bagi seluruh peran (mis. *"Masuk ke Ruang Kerja"*).
- Karyawan yang belum mengaktifkan akun masuk melalui tautan undangan sekali pakai (`/login/activate?token=:token`) yang dikirim ke alamat email resmi yang telah didaftarkan Admin. Halaman aktivasi menampilkan konteks akun yang diundang secara *read-only*, menyediakan kontrol intip kata sandi (*show/hide password* aksesibel keyboard) serta `PasswordStrengthMeter` (indikator kekuatan 4 segmen + daftar periksa kriteria keamanan *real-time* yang menahan tombol submit hingga terpenuhi), dan tidak pernah menampilkan atau mengirim kata sandi permanen.
- Token yang sudah digunakan, kedaluwarsa, dicabut, atau tidak cocok dengan akun tidak boleh mengaktifkan akun. Form penetapan kata sandi disembunyikan dan diganti state error tenang yang menjelaskan langkah berikutnya (meminta pengiriman ulang tautan undangan baru melalui Admin/HRGA), tanpa membocorkan apakah akun orang lain ada.
- Kegagalan autentikasi beruntun yang dibatasi server (*rate-limit / lockout*) menampilkan banner *countdown* waktu tunggu secara tenang tanpa merusak input email. Setelah aktivasi berhasil, tampilkan konfirmasi dan arahkan ke login. Setelah login, arahkan ke `/today` dan tampilkan navigasi sesuai seluruh role/scope aktif tanpa menetapkan role atau function dari input pengguna.
- Alur lupa/reset password (`/login/forgot-password` dan `/login/reset-password`) hanya memulihkan akses ke akun yang sudah ada dengan respons permohonan yang netral (tidak membocorkan eksistensi email) dan membatalkan sesi lain setelah kata sandi berhasil diperbarui.
- Apabila sesi pengguna kedaluwarsa saat sedang mengetik form check-in atau evaluasi, aplikasi menampilkan `SessionLockModal` (*in-place re-authentication*, lihat `UF-04`) di atas layar tanpa me-redirect paksa ke `/login`, sehingga draf ketikan tetap utuh (`NFR-01`).
- State minimum untuk prototype: login default, validasi kredensial gagal, pembatasan percobaan (*rate-limit*), akun nonaktif, undangan valid, undangan kedaluwarsa/terpakai/dicabut, aktivasi berhasil, reset password berhasil/gagal, dan pemulihan sesi di tempat (`SessionLockModal`).

### 4.2 My Today — Morning Commitment
- Bagian atas area kerja `/today` menampilkan `DailyWorkflowStepBar` (bilah progres 3 langkah harian: `[1] Morning Commitment` → `[2] Additional Work` → `[3] EOD Outcome` yang membungkus rapi pada layar mobile tanpa *horizontal scroll*), tombol pintas sekunder *"Laporkan Blocker"* berikon bendera di kanan header, serta **Strip Konteks Harian 4 Kolom Terpadu**: Tanggal Kerja Berlaku, Batas Waktu Efektif (`On-Time Deadline` & `Cut-Off` dari konfigurasi kebijakan aktif—jangan meng-hardcode jam produksi tetap), Status Submisi Pagi (`Belum Diisi`, `On-Time`, `Late`, atau `Locked`), dan hasil agregasi *read-only* **`Initial Daily Status`**.
- **Indefinite Role Exemption (FR-35, BR-07):** Untuk user/jabatan struktural yang dikecualikan secara terbuka tanpa batas waktu (misal CEO, Dewan Direksi), halaman `/today` menampilkan banner penjelas tenang (`ExemptionBanner`): *"Akun Anda memiliki status Pengecualian Partisipasi Terbuka (Indefinite Role Exemption) sesuai kebijakan organisasi. Pengisian Check-in bersifat opsional."* Form tetap dapat diisi bila user ingin mencatat komitmen harian secara mandiri, tetapi tombol submit tidak dibatasi penalti keterlambatan, tidak ada countdown Cut-Off yang menekan, dan sistem tidak pernah mengevaluasi akun ini sebagai No Submission.
- Form mendukung **0–3 Commitment** dengan alokasi slot progresif (dimulai dari 1 slot aktif dengan tombol *"+ Tambah Slot Komitmen"* berpenghitung kuota hingga maksimal 3 slot, serta tombol hapus pada slot tambahan). Untuk setiap Commitment, field wajib: teks Commitment dan Initial Risk (`GREEN`/`AMBER`/`RED`); Reference/Task Link opsional. Saat `Initial Risk` bernilai `AMBER` atau `RED`, form membuka field wajib `Known Blocker` dan `Support Needed`, serta menyediakan pemilih opsional untuk mengaitkan tiket Blocker aktif milik pengguna. Validasi inline menjelaskan field yang belum lengkap dan mempertahankan input saat gagal.
- Jika pengguna mengaktifkan pilihan eksplisit **0 Commitment**, slot 1–3 disembunyikan dan form menampilkan keadaan kosong yang jelas beserta textarea alasan bebas yang wajib diisi (bukan dropdown terbatas). Pilihan nol Commitment adalah keadaan submission yang valid, bukan keadaan form yang gagal atau event No Submission. Setelah submit yang valid, submission tetap dicatat menurut aturan waktu; `Initial Daily Status` ditampilkan sebagai `NOT_APPLICABLE — NO_COMMITMENT`, bukan `GREEN`/`AMBER`/`RED` dan bukan `No Submission`.
- `Initial Daily Status` ditampilkan sebagai hasil agregasi yang hanya-baca (selama pengisian merupakan preview dari data draft; setelah submit menjadi hasil tersimpan): jika salah satu Initial Risk `RED` → `RED`; jika tidak ada `RED` tetapi ada `AMBER` → `AMBER`; jika minimal satu Commitment dan semuanya `GREEN` → `GREEN`; jika tidak ada Commitment → `NOT_APPLICABLE — NO_COMMITMENT`. UI tidak menyediakan kontrol untuk mengubah hasil agregasi secara manual.
- **FR-11 Copy-Forward Draft (`DraftBanner`):** Ditampilkan sebagai panel akordeon yang terlipat secara default (`~50px` dengan indikator jumlah item tersedia + tombol *"Tinjau Draf"*) agar tidak mendorong form utama ke bawah layar, dan bersumber secara eksklusif serta utuh dari seluruh Morning Commitment eligible pada hari kerja sebelumnya untuk karyawan yang sama dengan `Continuation = Continue` (`AC-23`). Jangan memasukkan Additional Work atau `Tomorrow Priority`; jangan menyediakan tombol penghapus permanen item eligible di pagi hari; dan jangan menyiratkan bahwa sistem memilih item berdasarkan penilaian baru. Saat dibuka, setiap item draf menampilkan teks komitmen, tautan referensi bila ada, kutipan `Continuation Reason` kemarin, serta **`CarryOverBadge` informatif** (*"Berlanjut"* / *"Carry-Over Hari ke-N"*). **Penting (`DEC-003`):** `CarryOverBadge` di pagi hari murni penanda konteks informatif; sistem **tidak pernah mengunci atau men-disable pilihan `Initial Risk = GREEN`** pada item *carry-over*. Pengguna memilih maksimal 3 item untuk disalin ke slot hari ini, meninjau/mengedit redaksinya, memilih `Initial Risk`, dan menekan submit secara sadar (tidak ada auto-submit dan tidak ada slot ke-4).
- `Tomorrow Priority` dari EOD hari kerja sebelumnya, jika ada, ditampilkan terpisah sebagai strip pengingat ringkas berlabel *"Hanya Referensi"* tepat di atas Slot #1—bukan sebagai draft Commitment, bukan slot yang bisa dikonfirmasi, dan tidak mengubah `Initial Daily Status`.
- **FR-12 / AC-37 Role-Based Prompt Hint:** Saat user memfokuskan atau mengetik teks Commitment, `RoleBasedPromptHint` muncul sebagai teks petunjuk visual miring (*italic* inline guidance di bawah input) yang disesuaikan secara otomatis dengan **10 fungsi kanonikal resmi Dutamedia** (`Engineering`, `Quality`, `Operations & Infrastructure`, `R&D`, `Delivery`, `Business Development`, `Sales Enablement & Presales`, `Finance`, `HRGA`, dan `Management`) serta satu fallback netral sesuai kamus resmi PRD v1.6 `FR-12`. Hint ini bersifat murni pemandu visual (non-binding), tidak mengontaminasi isi input form pengguna, dan tidak disimpan ke database.
- **FR-63 / AC-72 Commitment Quality Warning / Prompt:** Jika teks komitmen terdeteksi terlalu singkat atau terlalu abstrak/generik (misal hanya kata tunggal *"development"*, *"meeting"*, *"follow-up"*, *"kerja"*), sistem memunculkan quality warning kontekstual di bawah field input (`QualityWarningBadge`): *"Komitmen tampak sangat umum. Sebutkan deliverable teramati yang diharapkan selesai hari ini."* Warning ini bersifat edukatif dan pemandu, **tidak menghalangi tombol submit yang valid**, tidak menghasilkan rating kinerja otomatis, dan pengguna tetap memegang kendali penuh atas komitmen yang disubmit.
- Sebelum Cut-Off, tombol submit aktif jika validasi lulus (didukung aksi simpan draf lokal dan *sticky action bar* pada layar mobile). Pada atau sebelum On-Time Deadline → `On-Time`; setelah deadline hingga dan termasuk Cut-Off → `Late`; setelah Cut-Off → request ditolak penuh tanpa menulis submission baru (`DEC-002`; tidak ada mode pengisian terlambat pasca-Cut-Off dengan alasan keterlambatan). Grace Period `0` valid dan berarti Cut-Off sama dengan On-Time Deadline. Tampilan error setelah Cut-Off mempertahankan draft lokal selama sesi jika aman, menampilkan status `Locked` (`LockedIndicator`), dan menawarkan CTA ke **Morning Correction Request** (`4.16a`) hanya jika policy mengizinkan dan baseline memang pernah disubmit; tidak ada inline edit atau jalan pintas direct edit.

### 4.3 Add Additional Work
- Form terpisah dari Morning Commitment (bukan slot ke-4), mempertahankan `DailyWorkflowStepBar` (langkah ke-2 aktif) dan Strip Konteks Harian disertai catatan singkat bahwa penambahan pekerjaan tengah hari tidak mengubah baseline komitmen pagi (`FR-07`, `BR-01`). Dapat diakses kapan saja sepanjang hari kerja pasca-Morning Check-in.
- Menyediakan akordeon *read-only* **Komitmen Pagi Hari Ini** (terlipat secara default) agar pengguna dapat memeriksa kembali baseline paginya tanpa berpindah halaman, atau menampilkan catatan netral non-penghakiman apabila pagi hari tercatat `No Submission`.
- Panel form dibuka melalui tombol *"+ Tambah Pekerjaan Tambahan"* dengan field: Deskripsi Pekerjaan (dilengkapi `RoleBasedPromptHint` 10 fungsi kanonikal dan `QualityWarningBadge` non-blocking yang setara dengan Morning), `Reason` (dropdown 5 alasan resmi: `Newly Assigned`, `Missed in Planning`, `Priority Change`, `Operational-Incident`, `Other`), dan `Reference / Task Link` opsional.
- Jika `Reason = Newly Assigned`, field **"Assigned By"** muncul secara kondisional dengan penanda jelas dan wajib diisi sebelum submit.
- Additional Work yang sudah dibuat tampil terpisah secara visual dari Commitment 1–3 di sepanjang hari (termasuk saat EOD), dengan bobot tampilan yang setara—bukan sebagai catatan kecil/sekunder. Jika belum ada item tambahan, tampilkan *empty mini-strip* yang ringkas disertai pengarah langkah berikutnya ke `EOD Outcome`.
- Additional Work tidak memiliki penguncian Cut-Off pagi; selama EOD hari tersebut belum disubmit/terkunci, item dapat diperbarui atau dibatalkan melalui konfirmasi tenang di tempat, dengan setiap pembuatan dan perubahan tercatat pada `AuditLog` append-only yang immutable.

### 4.4 My Today — EOD Outcome
- Mempertahankan `DailyWorkflowStepBar` (langkah ke-3 aktif) dan menampilkan semua Morning Commitment serta Additional Work hari kerja tersebut dalam dua kelompok yang teridentifikasi jelas (`Kelompok Morning Commitments` dan `Kelompok Additional Work`; *mini-strip* netral bila 0 Additional Work). Kedua jenis item mendapat bobot visual dan perlakuan evaluasi outcome yang setara; item Morning tetap merujuk pada baseline yang dikomit, sedangkan Additional Work tidak pernah menjadi slot Commitment dan tidak masuk ke koleksi copy-forward `FR-11` esok pagi.
- Setiap `EODWorkItemCard` menampilkan badge konteks awal (`Initial Risk` pagi atau `Reason` + `Assigned By` tugas tambahan), field opsional tautan bukti/deliverable, serta dua kontrol *segmented* independen: `Outcome` (`Completed`, `Partially Completed`, `Not Completed`, `Cancelled`) dan `Continuation` (`Continue`, `Do Not Continue`). Jika `Outcome = Cancelled`, alasan pembatalan wajib diisi. Jika `Continuation = Continue`, `Continuation Reason` wajib diisi **termasuk saat `Outcome = Completed`**.
- Field `Final Status` (`GREEN`, `AMBER`, `RED`) berlaku pada tingkat hari. Jika `AMBER` atau `RED`, penjelasan risiko/blocker tingkat-hari (`Daily Risk Explanation`) wajib diisi (dilengkapi penghitung karakter minimum *real-time*) dan dibedakan dari Known Blocker/Support Needed per Commitment.
- **Status Suggestion Engine (`FR-13` / `AC-38`):** Ditampilkan sebagai panel saran terpisah (menampilkan state netral *"Menunggu Evaluasi Tugas"* saat belum ada item yang dievaluasi) dan dihitung menggunakan heuristik produk tetap yang deterministik:
  1. Terdapat Blocker aktif ber-severity `Critical` → menyarankan `RED`;
  2. Minimal 50% item pekerjaan yang dievaluasi berstatus `Not Completed` atau `Cancelled` → menyarankan `RED`;
  3. Terdapat *carry-over* / `Continuation = Continue` kedua berturut-turut ($\ge 2$ hari) pada item komitmen yang sama atau terdapat Blocker aktif ber-severity `High` → menyarankan minimal `AMBER`;
  4. Terdapat `Outcome` bernilai `Partially Completed`, `Not Completed`, atau `Cancelled` dengan proporsi `Not Completed`/`Cancelled` di bawah 50% → menyarankan minimal `AMBER`;
  5. `GREEN` disarankan hanya bila ada item yang dapat dievaluasi, seluruhnya `Completed`, tidak ada *carry-over* berulang kedua, dan tidak ada Blocker aktif;
  6. Bila tidak ada item yang dapat dievaluasi dan tidak ada Blocker aktif, sistem tidak menampilkan saran status. Blocker aktif mencakup status `Open`, `Acknowledged`, dan `In Progress`.
- **Tanpa Penguncian Paksa Status (`DEC-003`, `FR-14`, `AC-39`):** Sistem **dilarang keras mengunci atau men-disable pilihan `Final Status = GREEN`**, meskipun terdapat *carry-over* berulang $\ge 2$ hari atau Blocker aktif. Apabila status pilihan pengguna berbeda dari saran sistem, penekanan tombol simpan memicu `ValidationPromptModal` yang seimbang (opsi menggunakan saran sistem atau tetap mempertahankan pilihan pengguna disertai alasan singkat), tanpa pernah mengubah pilihan pengguna secara diam-diam (*no silent mutation*). Heuristik saran ini adalah aturan produk tetap dan tidak dapat diubah melalui Policy Configuration.
- `Tomorrow Priority` bersifat opsional dan tersimpan setelah EOD submit untuk ditampilkan pada Morning hari kerja berikutnya murni sebagai strip referensi konteks (tidak pernah dipakai membentuk/mengurutkan draf `FR-11` maupun `Initial Daily Status`). *Sticky footer* menampilkan progres kelengkapan evaluasi (`X dari Y item telah dievaluasi`) berdampingan dengan tombol simpan.
- Submission EOD mengikuti aturan waktu yang simetris dengan Morning (`DEC-002`): `On-Time` pada/sebelum On-Time Deadline, `Late` setelah deadline sampai dan termasuk Cut-Off, dan ditolak penuh tanpa penulisan data setelah Cut-Off.
- Setelah EOD tersimpan dan terkunci, koreksi hanya dapat diajukan melalui **EOD Correction Request** (`4.16b`). Jalur ini tidak tersedia apabila EOD tidak pernah disubmit (`No Submission`), tidak dapat dipakai membuat EOD baru dari nol, tidak menghapus event `No Submission`, dan tidak mengubah baseline Morning.

### 4.5 Raise Instant Blocker
- Dapat diakses kapan saja dari mana pun melalui tombol pintas *"Laporkan Blocker"* atau rute `/today/raise-blocker` (tidak terkunci ke siklus Morning/EOD), termasuk saat baseline sudah locked.
- Untuk menjaga struktur menu sidebar tetap ramping sesuai Section 2 (tanpa menambah menu terpisah di sidebar), halaman `/today/raise-blocker` menyediakan **2 Sub-Tab**:
  1. **`Buat Laporan Baru`:** Formulir pelaporan kendala baru dengan opsi mengaitkan ke komitmen/pekerjaan hari ini.
  2. **`Blocker Saya`:** Daftar kendala yang dilaporkan oleh pengguna sendiri beserta filter pil (`Semua`, `Aktif`, `Menunggu Konfirmasi Saya [Resolved]`, `Selesai`), sehingga pelapor memiliki akses langsung yang jelas untuk memverifikasi solusi (`Confirm Closed` atau `Reopen`, lihat `UF-18`).
- Form Blocker mewajibkan field taksonomi resmi sesuai PRD `FR-16` & `AC-55`:
  - **Type (10 enum resmi PRD):** `Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other` (UI menyertakan label deskriptif Bahasa Indonesia yang membantu).
  - **Severity (4 enum resmi PRD):** `Critical`, `High`, `Medium`, `Low` (disajikan sebagai kartu pilihan radio yang jelas).
  - **Impact (7 enum resmi PRD):** `Task`, `Milestone`, `Project`, `Production`, `Client`, `Financial`, `Compliance`.
  - **Authority Context:** `Organizational Authority` (default) atau `Project Authority` (eksplisit).
  - **Pilihan orang tertentu (opsional):** default kosong (*"Tidak memilih orang tertentu"* — jangan menambahkan opsi terpisah *"Biarkan sistem menentukan"*).
  - **Deskripsi Masalah (wajib, dengan penghitung karakter minimum)** dan **Expected Resolution (opsional)**.
- Seksi `Authority Context` menampilkan **`LiveRoutePreviewBox`** yang memperlihatkan secara langsung siapa `Owner Needed` kandidat hasil resolusi sistem beserta `AuthorityTag` sebelum tombol kirim ditekan:
  - Untuk `Organizational Authority` (default), `Direct Manager` aktif (Level 1) menjadi kandidat awal; jika tidak tersedia, menggunakan fallback organisasi yang dikonfigurasi.
  - Untuk `Project Authority` (dipilih eksplisit ketika berkaitan dengan proyek/referensi tertentu), form mewajibkan identifikasi scope proyek/referensi dan menyelesaikan penerima berdasarkan `Project Authority Mapping` aktif yang cocok.
- Matriks eskalasi bawaan mengikuti hierarki 4 jenjang Dutamedia: Level 1 (Direct Manager/Lead) → Level 2 (Head of Department) → Level 3 (Department Head of Operations / General Management) → Level 4 (CEO / Board of Directors). Penentuan `Owner Needed` awal dibedakan secara tegas dari *escalation chain*.
- Jika pengguna memilih orang tertentu secara manual, sistem memvalidasi keaktifan akun, kesesuaian `Authority Context`, dan scope mapping. Pilihan tidak valid atau ketiadaan penerima sah pasca-fallback ditolak dengan pesan perbaikan yang jelas tanpa menampilkan status sukses palsu (`AC-60`, `AC-61`). Setelah berhasil dikirim, tampilkan kartu ringkasan tiket resmi (`#BLK-...`, status awal `Open`, pemilik tujuan, dan pintasan ke sub-tab `Blocker Saya`).

### 4.6 My History & Weekly Summary
- Diakses melalui `/history`, dilengkapi toolbar periode global (preset minggu/bulan & rentang tanggal) dan `ExportButton` (ekspor CSV ber-UTF-8 BOM sesuai RFC-4180 dan PDF terbatas pada histori milik sendiri, `FR-42`), serta diorganisasikan dalam **2 Tab Utama**:
  1. **Tab `Riwayat Harian` (Default):** Menampilkan sub-filter kehadiran (`Semua Hari Kerja`, `Ada Submission`, `Tanpa Submission`) dan daftar baris/kalender harian di atas lipatan layar. Tiap hari menampilkan **dua dimensi badge berdampingan secara terpisah**: `SubmissionTimingBadge` (`On-Time` biru info, `Late` oranye, `No Submission` abu-abu netral) dan `StatusBadge` (`GREEN`/`AMBER`/`RED` bila EOD valid tersedia, atau label netral bila EOD belum ada; `Initial Daily Status` `NOT_APPLICABLE — NO_COMMITMENT` untuk 0 komitmen tidak pernah dipetakan menjadi `GREEN`). Tanggal hari libur/cuti/pengecualian menampilkan penanda yang jelas (`Holiday`, `Leave (Pending)`, `Leave (Approved)`, `Exemption`), termasuk penanda audit **`Superseded by Approved Leave`** apabila suatu catatan `No Submission` direkonsiliasi karena persetujuan cuti yang turun pasca-Cut-Off (`DEC-007`).
  2. **Tab `Ringkasan Mingguan` (`FR-66`, `FR-67`):** Menampilkan badge penghitung `[X Catatan]` pada tab bila terdapat `Manager Note` yang ditandai *Visible to Employee* pada periode terpilih. Bagian teratas menampilkan **Kartu Hero Catatan Pembinaan Pimpinan** (menampilkan 1 catatan terbaru secara utuh + akordeon *"Lihat [X] Catatan Sebelumnya"* bila $>1$, atau 1 baris netral tenang bila belum ada catatan), diikuti **Grid 2×3 Kartu Metrik Akuntabilitas Personal** (Komitmen Pagi, Distribusi Outcome, Distribusi Hari per Final Status, Ketepatan Waktu Submisi, Pola Continuation Berulang, serta `Support Contribution` yang diberikan [`FR-64`] & Eskalasi Terbuka).
- Seluruh tampilan riwayat dan summary bebas dari *streak* kompetitif, pemeringkatan rekan kerja, skor KPI otomatis, atau elemen *leaderboard* (`FR-66`, `AC-75`).
- Klik pada salah satu hari membuka **`/history/:date` (*Read-Only Day Detail*)** yang mempertahankan *state* tab/filter sebelumnya saat pengguna menekan tombol kembali, menampilkan konteks snapshot organisasi historis pada tanggal tersebut (`FR-02`, `FR-24`), banner penjelasan objektif bila hari tersebut berstatus `No Submission`, serta panel riwayat `Correction Request` (`Applied`/`Rejected`) berdampingan secara transparan tanpa menimpa rekaman asli.

### 4.7 Web Notification Center & Browser Push
- Diakses melalui `/notifications`, menampilkan bar metrik ringkas 1 baris (`Total Notifikasi`, `Belum Dibaca`, serta kartu interaktif `Status Browser Push Perangkat Ini` yang membuka Tab 2 saat diklik) dan diorganisasikan dalam **2 Tab Utama**:
  1. **Tab `Daftar Notifikasi` (Default):** Daftar notifikasi in-app yang tersimpan dan terurut waktu, dilengkapi filter pil (`Semua`, `Belum Dibaca`, `Sudah Dibaca`), filter kategori sesuai pemicu resmi PRD §8, pencarian teks instan, toggle baca/belum-baca per baris, serta tombol *"Tandai Semua Dibaca"* (disertai *toast* `Urungkan / Undo` berdurasi singkat). Klik item menandai `Read` dan membuka *deep-link* dengan label tombol CTA kontekstual sesuai objek tujuan (serta *fallback* ramah apabila objek tidak lagi dalam scope akses pengguna). Tautan dari notifikasi email yang memuat penanda baca otomatis menandai item in-app terkait sebagai `Read`. Status dibaca di pusat notifikasi murni status in-app dan tidak pernah disamakan dengan status *delivery* Email/Browser Push.
  2. **Tab `Pengaturan Kanal & Perangkat`:** Menampilkan **Kartu Kontrol Browser Push Spesifik Perangkat** yang membedakan 7 kondisi nyata (`Unsupported`, `Belum Diminta` + tombol opt-in eksplisit, `Granted` + uji kirim perangkat lokal & panduan cabut izin browser, `Denied` + panduan membuka pengaturan situs browser tanpa memblokir alur kerja, `No Subscription`, `Delivery Attempted/Unknown`, dan `Delivery Failed`) berdampingan dengan **Tabel Referensi Read-Only Matriks Kanal per Trigger** sesuai PRD Section 8.
- Browser Push merupakan delivery nyata pada MVP hanya untuk trigger yang ditetapkan di PRD Section 8:
  - Morning/EOD mendekati On-Time Deadline: Employee — Email + Browser Push.
  - AMBER + support needed: assigned support owner + employee — Email + Browser Push + Web Notification Center.
  - RED, critical/instant blocker, dan blocker unacknowledged melewati threshold: penerima sesuai authority/escalation chain — Email + Browser Push.
  - Repeated No Submission: Supervisor/Head (HRGA jika threshold terpenuhi) — Email.
  - Weekly summary: Employee + Manager sesuai konfigurasi — Email.
  - Policy/organizational assignment change: affected user + relevant Authorized Policy Owner — Web Notification Center.
  - Morning/EOD Material Correction Request submitted: Authorized Reviewer — Web Notification Center + Email; approaching end of Objection Window — Web Notification Center; Applied/Rejected — employee submitter via Web Notification Center.
  - Invitation issued/resend: account owner — Email; Leave Request submitted: Authorized Approver — Email + Browser Push; Leave approved/rejected: employee submitter — Email + Web Notification Center.
  Semua notifikasi tercatat di Web Notification Center sesuai PRD; daftar ini bukan izin untuk menambah Push pada trigger yang tidak tercantum.
- Untuk browser yang mendukung Push dan izin belum diberikan, permintaan izin hanya dipicu oleh aksi klik sadar pengguna (bukan *auto-popup* berulang) dan penolakan izin tidak pernah menghalangi pengisian check-in maupun eskalasi blocker.
- Jika browser tidak mendukung, izin ditolak, subscription tidak tersedia, atau delivery gagal, UI menampilkan status kanal yang akurat dan tidak menampilkan *"Push terkirim"*; aplikasi tidak berpura-pura dapat mengubah permission browser secara langsung.

### 4.8 Team Pulse / Function Pulse / Management Pulse Dashboard
Pola sama di ketiga level (scope berbeda: team/scoped, function, company-wide):
- Ketiganya diakses melalui satu item sidebar bernama **Pulse Dashboard**. Item ini bukan dashboard keempat dan bukan pemberian akses universal; ia merupakan pintu navigasi ke dashboard yang diizinkan (`AC-62`).
- Saat pengguna hanya memiliki satu cakupan dashboard, klik membuka dashboard itu langsung (Supervisor/TL → `/team` Team Pulse; Head/Function Owner → `/function` Function Pulse; CEO/Management yang berwenang → `/management` Management Pulse) dan bilah pemilih cakupan disembunyikan sepenuhnya.
- Jika pengguna memiliki lebih dari satu kewenangan dashboard yang valid, UI merender pemilih cakupan hanya untuk opsi yang memang diizinkan (`AC-63`) serta mempertahankan cakupan terakhir di URL/sesi saat pengguna kembali dari *drill-down*.
- Employee biasa tidak melihat item Pulse Dashboard; PM, HRGA, dan System Admin juga tidak otomatis memperoleh akses dashboard kecuali diberi permission/scope eksplisit. Route dan data wajib memvalidasi otorisasi di sisi server (`AC-64`); akses langsung tanpa izin menampilkan layar `403 Access Restricted` tanpa membocorkan data.
- **Exception-first layout & Interaktivitas Triage:** Bagian teratas menampilkan 4 `InteractiveMetricFilterCard` (`RED`, `Blocker Belum Diakui`, `No Submission`, `AMBER`) yang dapat diklik untuk menyaring dan menggulir halus ke widget target. Daftar `Exceptions First` menyajikan item teratas (`RED` → `AMBER` → `No Submission`) secara ringkas tanpa duplikasi badge disertai tombol *"Lihat Semua"* (modal daftar lengkap berfilter) dan **Modal Drill-Down Anggota** (melihat komitmen pagi, EOD, `Tomorrow Priority`, dan blocker anggota beserta pintasan kontekstual ke Histori, `Manager Note`, atau `Blocker Queue` sesuai wewenang, dengan *back-stack* yang mempertahankan filter sebelumnya).
- **Widget Resmi Dashboard Head / Supervisor (FR-68, AC-77):**
  1. **Team status summary:** jumlah status `GREEN`, `AMBER`, `RED`, `NOT_APPLICABLE — NO_COMMITMENT`, dan `No Submission` hari ini (memisahkan dimensi risiko dari ketepatan waktu).
  2. **Exceptions first:** daftar item berkategori `RED`, `AMBER`, carry-over berulang, blocker belum di-acknowledge, dan kejadian `No Submission`.
  3. **Open blockers by owner:** daftar blocker terbuka dikelompokkan berdasarkan support owner penanggung jawab (dilengkapi *positive empty state* tenang bila 0 blocker aktif).
  4. **Carry-over trend:** sorotan pekerjaan yang mengalami `Continuation = Continue` berulang $\ge 2$ hari berturut-turut sebagai sinyal perencanaan kapasitas.
  5. **Cross-project support:** rekaman kontribusi bantuan lintas tim/proyek yang diberikan anggota tim (`FR-64`).
  6. **Weekly team summary:** ringkasan mingguan keandalan komitmen tim tanpa elemen leaderboard atau pemeringkatan.
- **Widget Resmi Management Pulse / CEO Dashboard (FR-69, AC-78):**
  1. **Company-wide exception overview by function:** ringkasan komparatif exception lintas divisi.
  2. **RED/AMBER trend per function & project:** grafik tren risiko mingguan/bulanan per fungsi dan proyek.
  3. **Top recurring blockers by category:** visualisasi taksonomi blocker paling sering dari 10 kategori resmi (`Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`).
  4. **No-submission trend & repeated compliance cases:** grafik tren kepatuhan pengisian dan kasus pola No Submission.
  5. **Unresolved escalation aging:** ringkasan penuaan eskalasi blocker yang belum tuntas dengan pintasan ke `/management/escalations`.
  6. **Project-impact & client-impact incidents:** sorotan blocker dengan dampak `Project`, `Production`, atau `Client`.
- Dilarang mutlak menampilkan leaderboard, ranking individu berbasis volume task, atau skor KPI otomatis (`FR-69`, `NFR-12`).
- Antrean Correction Request dan Leave Request ditampilkan melalui menu/queue khusus hanya kepada Authorized Reviewer/Approver dalam scope-nya.

### 4.9 Blocker & Escalation Queue
- Diakses melalui `/team/blockers` atau `/function/escalations`, menampilkan 3 `InteractiveMetricFilterCard` di atas (`Butuh Respons [Open]`, `Sedang Ditangani [Acknowledged / In Progress]`, `Menunggu Konfirmasi Pelapor [Resolved]`) dan tata letak **`MasterDetailSplitWorkbench`** (`42% : 58%` di desktop; berubah menjadi panel *drawer/bottom-sheet* responsif pada tablet/mobile agar bebas tabel bergulir horizontal):
  - **Panel Kiri (Daftar Antrean):** Tab filter cepat (`Semua`, `Tanggung Jawab Saya`, `Belum Di-acknowledge`, `Critical/High`, `Menunggu Konfirmasi Pelapor`), `FilterBar` taksonomi lengkap (Type 10 enum, Severity 4 enum, Impact 7 enum, Status 6 state), dan daftar kartu ringkas 3 baris terurut urgensi (mendukung *deep-link* tiket/owner dan *positive empty state* saat 0 hambatan aktif).
  - **Panel Kanan (Detail & Tindakan):** Rincian masalah, `AuthorityTag` eksplisit (`Organizational Authority` default vs `Project Authority` eksplisit, beserta keterangan penunjukan otomatis vs manual), `ActionPanel` kontekstual, daftar `SupportContributionCard`, serta `AuditTrailTimeline` siklus hidup tiket.
- **Action button pada `ActionPanel` tampil ketat sesuai state blocker dan kewenangan aktor saat ini (dengan validasi modal inline tanpa `window.alert`):**
  - `Open` → Tombol `Acknowledge` bagi assigned support owner atau hierarki di atasnya.
  - `Acknowledged` → Tombol `Start Progress` / `Update` memindahkan ke `In Progress`.
  - `In Progress` → Tombol `Resolve` (mewajibkan `Resolution Note` rinci dengan penghitung karakter minimum) memindahkan status ke `Resolved`.
  - `Resolved` → Khusus pelapor asli (`raisedByUserId`):
    - Tombol `Confirm Closed` → memindahkan ke status final `Closed`.
    - Tombol `Reopen / Needs Further Work` → mengembalikan status ke `In Progress` dengan alasan wajib jika solusi belum memadai.
    - Pengguna selain pelapor melihat maklumat tenang *"Menunggu verifikasi & konfirmasi Closed dari pelapor"*. Status tetap `Resolved` (tidak pernah auto-close karena berlalunya waktu) hingga pelapor mengambil tindakan.
  - `Accepted Risk` → Jalur terpisah khusus authority manajerial berwenang (misal Head atau Management) dengan `Risk Acceptance Rationale` dan rencana mitigasi wajib; bukan sinonim `Resolve`/`Closed`.
  - **Pencatatan Dukungan Rekan (`Support Contribution` — `FR-64`):** Pada blocker aktif rekan kerja, anggota tim lain dapat mengklik tombol **"+ Catat Kontribusi Dukungan"** untuk mencatat tindakan bantuan dan hasilnya.
  - Reassignment manual (dengan alasan wajib) dibedakan secara visual dan audit dari Auto-Escalation sistematis (kenaikan jenjang Level 1 → 2 → 3 → 4 akibat unacknowledged melewati threshold SLA).
- Aksi yang tidak relevan/tidak diizinkan tidak ditampilkan; server tetap memvalidasi izin aktor.

### 4.10 Manager Note / Coaching Record
- Diakses melalui `/function/coaching` (oleh Supervisor/Head sesuai scope) dan `/compliance/records` (arsip pembinaan & catatan peringatan berizin ketat bagi HRGA/aktor berwenang), menyajikan 3 `InteractiveMetricFilterCard` (`Recognition`, `Coaching`, `Corrective`) dan tata letak **`MasterDetailSplitWorkbench`** (`42%` panel pembuatan catatan di kiri : `58%` panel linimasa riwayat ber-`FilterBar` di kanan; berubah menjadi 2 tab pada layar sempit).
- Form pembuatan catatan mencakup pemilih anggota tim dalam scope sah, 3 kartu radio tipe catatan (`Recognition`, `Coaching`, `Corrective`), kotak panduan dinamis **`CaseDistinctionCallout`** yang memandu penerapan **Matriks Distingsi Kasus (§13.1 PRD, `FR-73`)** (membedakan masalah kapasitas/hambatan teknis, kelambatan eskalasi, pelanggaran proses, dan lupa administratif tunggal), pemilih rujukan bukti bertingkat (komitmen harian, tiket blocker, atau event kepatuhan), serta pilihan visibilitas eksplisit: `Visible to Employee` atau `Private to Managers & HR`.
- Employee hanya melihat note yang eksplisit ditandai `Visible to Employee` pada halaman History/Weekly Summary miliknya. Catatan yang telah diterbitkan bersifat *append-only* (koreksi hanya melalui catatan adendum baru, tanpa hapus/timpa diam-diam) dan tidak pernah mengubah komitmen asli karyawan (`FR-40`).

### 4.11 Compliance Queue (HRGA)
- Diakses melalui `/compliance`, menampilkan 4 `InteractiveMetricFilterCard` (`Perlu Ditinjau`, `Pattern Flag Berulang`, `Dalam Pembinaan`, `Eskalasi Disipliner Offline`), `FilterBar`, dan tabel berbasis bukti faktual yang memuat `TriggerDateCapsules` (chip tanggal-tanggal `No Submission` terverifikasi setelah mengeluarkan hari libur, pengecualian aktif, dan cuti yang disetujui termasuk yang direkonsiliasi pasca-Cut-Off sesuai `DEC-007`).
- Menampilkan **Pattern Flag** bagi karyawan yang mencapai ambang tetap 3 kejadian `No Submission` di dalam jendela evaluasi hari kerja bergulir sesuai kebijakan aktif (misal konfigurasi default 30 hari kerja, `FR-29`).
- **Review Event Kepatuhan Tripartit (`FR-70`–`FR-73`):** Pattern flag memicu *Review Event* kolaboratif (HRGA + Direct Manager + Karyawan) dengan modal tindak lanjut yang menyertakan `CaseDistinctionCallout`, pencatatan wajib penjelasan/konteks karyawan, pembinaan yang diberikan, penanggung jawab tindak lanjut, dan tanggal evaluasi berikutnya.
- Status tindak lanjut resmi: `Reminder Sent`, `Coaching Scheduled`, `Recorded Warning`, atau `Escalated to Offline Disciplinary`.
- **Prinsip Non-Otomatisasi Sanksi (`FR-30`, `FR-72`):** Sistem DILARANG MUTLAK memiliki tombol *"Issue SP"* atau menghasilkan surat peringatan/pemotongan insentif otomatis. Sistem hanya mencatat arsip pembinaan dan rujukan administratif; proses penegakan disiplin formal berlangsung **di luar sistem (offline HR process)**.

### 4.12 Exemption Management
- Diakses melalui `/compliance/exemptions`, **khusus mengelola Holiday dan Exemption administratif** (bukan Leave karyawan — lihat `4.20`/`4.21`), dengan 4 `InteractiveMetricFilterCard` dan tabel ber-`FilterBar` yang secara ketat memetakan **3 kategori resmi PRD** (tanpa kategori dispensasi divisi bebas):
  1. **Holiday (Company-Wide):** Kalender libur resmi perusahaan/nasional (tanggal tunggal atau rentang).
  2. **Bounded Individual Exemption:** Pengecualian karyawan tertentu (misal penugasan dinas luar/offsite tanpa akses rutin, `DEC-004`) yang wajib memiliki `Effective Date`, `Expiry Date` (`expiryDate >= effectiveDate`), dan alasan penugasan.
  3. **Indefinite Role Exemption (Open-Ended / Tanpa Batas Waktu):** Pengecualian jabatan struktural eksekutif (misal CEO, Board of Directors) sesuai `FR-35` & `BR-07`, di mana pilihan ini otomatis menyembunyikan/menonaktifkan kewajiban `Expiry Date` dan berlaku terbuka hingga dicabut secara eksplisit.
- Tabel menampilkan status periode terhitung (`Sedang Berlaku`, `Akan Datang`, `Telah Berakhir`, `Dinonaktifkan`). Untuk menjaga keutuhan jejak audit historis, penutupan pengecualian yang sedang atau pernah berjalan menggunakan aksi **Nonaktifkan** (bukan penghapusan fisik), sedangkan aksi **Hapus** hanya tersedia bagi jadwal masa depan yang belum pernah mulai berlaku.
- Konfigurasi yang disimpan Admin/HRGA berwenang langsung aktif seketika **tanpa antrean approval tambahan** (`FR-46`). Header halaman menampilkan catatan singkat: *"Holiday & Exemption berlaku langsung setelah disimpan. Untuk Leave karyawan, lihat Leave Approval Queue."*

### 4.13 Project Risk View (PM)
- Diakses melalui `/my-scope/project-risk`, menampilkan agregasi *read-only* atas Morning Commitment dan Additional Work anggota tim berdasarkan nilai string `Reference / Task Link`, **bukan** query terhadap entitas CRUD Project formal (tidak ada manajemen proyek penuh di MVP).
- Menerapkan prinsip visual tenang (*Muted Baseline, Loud Exceptions*): item yang tuntas lancar tampil tenang, sedangkan 5 `InteractiveMetricFilterCard` dan kartu kelompok reference menyorot tegas sinyal risiko (`RED`, `AMBER`, pola `Continuation = Continue` berulang $\ge 2$ hari, dan Blocker aktif). Header setiap kelompok menampilkan nilai `Reference / Task Link` sumber secara jelas (atau penanda tenang *"Semua Item Lancar"* bila 0 anomali), dilengkapi modal detail *read-only* yang membedakan garis `Direct Manager` vs `Project Authority` (`AuthorityTag`) serta `ExportButton` terbatas sesuai scope aktif (`AC-20`, nonaktif aman bila hasil filter kosong). Aturan pencocokan/pengelompokan reference ditetapkan di SAD.

### 4.14 Escalation Aging (CEO/Management)
- Diakses melalui `/management/escalations`, menyajikan 5 `InteractiveMetricFilterCard` eksekutif berdasarkan ambang batas kebijakan eskalasi aktif (tanpa meng-hardcode angka jam SLA mati dan tanpa toggle *company-wide* bagi peran non-company-wide), `FilterBar`, serta `ExportButton` sesuai scope.
- Hanya memuat blocker berstatus aktif belum selesai (`Open`, `Acknowledged`, `In Progress`) yang telah melewati threshold waktu; tiket berstatus `Resolved`, `Closed`, dan `Accepted Risk` otomatis dikeluarkan dari daftar penuaan aktif. Daftar diurutkan secara deterministik 3 lapis: (1) durasi belum selesai terlama (*descending*), (2) tingkat `Severity` tertinggi (`Critical > High > Medium > Low`), dan (3) urutan waktu lapor paling awal (`FIFO`).
- Membedakan *Positive Zero-Aging Empty State* (*"Semua Kendala Tertangani Dalam Batas Toleransi"*) dari *Filtered Empty State* (dengan tombol reset filter), serta menyediakan modal investigasi detail yang menampilkan `AuthorityTag` dan `AuditTrailTimeline` rantai *auto-escalation*.
- Layar bersifat *overview* tata kelola tanpa pemeringkatan individu (`FR-69`). Aksi operasional pada blocker hanya ditampilkan bila pengguna juga memegang authority sah atas konteks blocker tersebut; jabatan CEO/Management saja tidak otomatis memberi hak `Resolve`/`Close`.

### 4.15 Admin: Organizational Mapping & Project Authority
- Diakses melalui `/admin/organization` (terpisah dari pembuatan akun & undangan di `/admin/users` sesuai `DEC-005`), diorganisasikan dalam **2 Tab Utama** (tanpa membuat entitas CRUD manajemen proyek penuh di luar scope MVP):
  1. **Tab `Penugasan Struktur Organisasi` (`Organizational Assignment`):** Tabel ber-`FilterBar` yang memisahkan secara jelas **Jabatan Fungsional (`Job Title`)**, **Peran Otorisasi Sistem (`System RBAC Role`)**, **Fungsi Organisasi Kanonikal** (dikunci ketat pada **10 fungsi kanonikal resmi Dutamedia**: `Engineering`, `Quality`, `Operations & Infrastructure`, `R&D`, `Delivery`, `Business Development`, `Sales Enablement & Presales`, `Finance`, `HRGA`, dan `Management` — tanpa pembuatan divisi bebas), **`Direct Manager`** (menampilkan label kelembagaan tenang bagi pucuk pimpinan tertinggi tanpa atasan langsung, serta memfilter otomatis personil itu sendiri dan seluruh rantai bawahannya secara rekursif untuk mencegah siklus hierarki melingkar), serta **`Effective Date`**.
  2. **Tab `Pemetaan Kewenangan Proyek` (`Project Authority Mapping`):** Tabel normal yang dapat dicari dan difilter (tanpa input UUID manual) untuk memetakan personil ke scope/referensi proyek secara independen (satu personil dapat memegang lebih dari satu kewenangan proyek aktif sekaligus tanpa mengubah `Direct Manager` strukturalnya), menampilkan `Effective Date`, `End Date` opsional, serta aksi `Ubah` atau `Akhiri Penugasan` melalui modal konfirmasi tenang ber-alasan wajib.
- **Aturan Tanggal Efektif & Larangan Backdating (`DEC-008`, `FR-23`, `FR-24`, `AC-54`):** Setiap pembuatan atau pembaruan `OrganizationalAssignment` maupun `ProjectAuthorityMapping` wajib menyertakan `Effective Date` dan alasan perubahan. Sistem menegakkan `effectiveDate >= today` (hari ini atau tanggal masa depan menurut zona waktu organisasi) dan **menolak pemilihan tanggal lampau (*no backdating*)** dengan pesan validasi yang jelas demi menjaga keutuhan snapshot akuntabilitas historis. Rekaman masa lalu tidak pernah dihapus atau ditimpa.
- **Alur 2-Tahap Pratinjau Dampak (`ImpactPreviewModal` — `UF-40`) & Riwayat:** Perubahan penugasan tidak langsung disimpan, melainkan membuka `ImpactPreviewModal` yang menampilkan perbandingan berdampingan (*Before vs After* mulai `[Effective Date]`) dan daftar bawahan langsung yang ikut terdampak (dengan tombol *"← Kembali ke Formulir"* yang mempertahankan seluruh input). Setiap personil memiliki tombol *"Lihat Riwayat"* yang membuka `AuditTrailTimeline` vertikal penugasan aktif dan masa lalu.

### 4.16 Correction Requests (dua alur terpisah)

#### 4.16a — Morning Correction Request
- Diakses melalui `/today/morning/correction-request`; CTA hanya muncul pada Morning baseline yang sudah disubmit serta terkunci pasca-Cut-Off, dan hanya jika policy mengizinkan pengajuan. Apabila rute dibuka sebelum Cut-Off saat baseline belum terkunci, tampilkan banner pengarah tenang kembali ke form edit reguler `/today/morning`. Target koreksi **hanya field Morning Commitment** (tidak termasuk Additional Work, field EOD, atau `Tomorrow Priority`).
- Halaman menyediakan tab pengalih rute eksplisit antar-alur (`Koreksi Komitmen Pagi` ↔ `Koreksi Evaluasi Sore` tanpa mencampur form), kartu snapshot baseline terkunci (*read-only*) dengan pita jaminan integritas, serta panel komparasi berdampingan (`SideBySideDiffPanel`: kolom kiri `Before` *read-only*, kolom kanan `Proposed After` menggunakan kontrol input sesuai tipe data—bukan textarea string mentah untuk pilihan risiko—disertai input kondisional atomik `Known Blocker` & `Support Needed` saat memilih `AMBER`/`RED`, dan textarea `Reason` wajib berpenghitung karakter minimum).
- Setelah submit, tampilkan ID pengajuan, timestamp, `ClassificationTag` (`Minor`/`Material` sesuai evaluasi kebijakan server aktif), status, dan nilai usulan:
  - **Minor:** langsung `Applied` setelah validasi server; tampilkan ringkasan perubahan dan konfirmasi.
  - **Material:** berstatus `Pending` selama `Objection Window` (penguncian cegah-duplikat bersifat granular per slot/target sehingga slot lain yang bebas tetap dapat diajukan); **baseline asli tetap berlaku penuh dan tidak berubah** hingga pengajuan berstatus `Applied`. `ObjectionWindowIndicator` menampilkan hitung mundur sekaligus tanggal/jam berakhir absolut sesuai jam kerja kebijakan aktif.
- Authorized Reviewer meninjau permohonan `Material` di tab `Pending Objection` pada `/team/reviews` dalam scope kewenangannya: reviewer dapat mengajukan *objection* dengan alasan wajib sebelum window berakhir (`Rejected`, baseline asli tetap berlaku; pemohon melihat alasan penolakan beserta tombol *1-click prefill* *"Gunakan Draf Sebelumnya & Sesuaikan"*), atau membiarkan window berakhir tanpa tindakan sehingga otomatis menjadi `Applied` (*default-approve*).
- Tabel riwayat dan modal `AuditTrailTimeline` menampilkan target, reason, classification, status, aktor, timestamp, dan diff `Before → After` sesuai kewenangan tanpa mengizinkan direct edit baseline dari layar riwayat.

#### 4.16b — EOD Correction Request
- Diakses melalui `/today/eod/correction-request`; CTA hanya muncul pada EOD yang **sudah pernah disubmit dan terkunci**. Apabila rute dibuka langsung pada hari di mana EOD belum disubmit atau berstatus `No Submission`, form disembunyikan penuh dan diganti *Empty Guard Screen* yang menegaskan bahwa koreksi EOD tidak dapat dipakai membuat EOD baru atau membatalkan `No Submission` (`FR-53`, `FR-55`). Record dan lifecycle terpisah penuh dari Morning Correction Request.
- Form menampilkan nilai EOD tersimpan sebagai `Before` (*read-only*), pemilih target field yang sah (`Outcome`, `Continuation`, `Continuation Reason`, alasan `Cancelled`, `Final Status`, `Daily Risk Explanation`, dan `Tomorrow Priority` untuk item Commitment maupun Additional Work menggunakan kontrol pilihan terstruktur dan input kondisional atomik), nilai `Proposed After`, serta `Reason` wajib.
- Klasifikasi dan lifecycle mengikuti prinsip yang sama (`Minor` langsung `Applied`; `Material` `Pending` selama `Objection Window` tanpa mengubah baseline EOD hingga `Applied`, atau `Rejected` bila disanggah dengan alasan sah). Pada antrean reviewer `/team/reviews`, item diberi penanda tegas **EOD Correction** agar tidak tertukar dengan **Morning Correction**.

#### Aturan bersama untuk kedua alur
- Jangan gunakan satu form ambigu yang memungkinkan target Morning dan EOD bercampur. Pisahkan judul, route, field selector, summary, dan record history.
- Error submit tidak boleh membuat request duplikat atau menampilkan `Applied` sebelum server mengonfirmasi. Objection setelah window berakhir ditolak dan tidak mengubah request yang sudah `Applied`. Semua transisi dan nilai `Before/After` ter-audit.

### 4.17 Admin: Temporary Reviewer
- Form assignment pada `/admin/temporary-reviewer` mewajibkan pejabat yang didelegasikan, reviewer pengganti, scope bawahan, **Effective Date**, **Expiry Date** (wajib diisi, tidak boleh *open-ended* tanpa batas kedaluwarsa, `FR-25`), serta alasan pendelegasian.
- Sistem menegakkan `effectiveDate >= today` (menolak tanggal mulai di masa lampau sesuai `DEC-008`) dan `expiryDate >= effectiveDate`.
- Daftar penugasan aktif menampilkan hitung mundur menuju waktu kedaluwarsa; setelah melewati `Expiry Date`, wewenang delegasi otomatis berakhir tanpa perlu tindakan manual admin dan rekaman berpindah ke riwayat audit.

### 4.18 Policy Settings
- Diakses lewat `/policy-settings`, **bukan lagi rute khusus Admin** — halaman ini terbuka untuk role apa pun yang memiliki minimal satu kategori kebijakan sebagai kewenangannya, namun isinya di-filter penuh sesuai kategori kebijakan yang dipegang role/user tersebut (`FR-34`/`BR-15`).
- Tiap kategori kebijakan (cutoff, grace period, workday calendar, escalation threshold, retensi, **Objection Window duration**, **batas Minor/Material**, dll.) memiliki section mandiri.
- User yang membuka halaman ini hanya melihat kategori yang authority-nya dia pegang — kategori lain **tidak dirender sama sekali** (bukan sekadar di-disable dengan tooltip). Aturan tetap produk (*Fixed Product Rules*, seperti batas maksimal 3 komitmen pagi, pengingat tetap 60 menit pra-deadline, heuristik Status Suggestion Engine, dan ambang tetap 3x No Submission untuk Pattern Flag) ditampilkan hanya sebagai informasi ketentuan tetap yang tidak dapat diedit.
- Perubahan nilai kebijakan selalu membuat **versi baru** dengan `Effective Date` — tidak ada *overwrite* nilai lama secara langsung; versi lama tetap tersimpan dan terlihat di riwayat lewat `PolicyVersionHistory`.

### 4.19 Admin: Notification Channel Setup
- Menampilkan matriks channel per trigger yang berasal dari PRD Section 8; konfigurasi tidak boleh memperluas Browser Push ke trigger yang tidak ditetapkan sebagai Push-enabled.
- Menampilkan status kesiapan konfigurasi Email dan Browser Push secara terpisah serta hasil uji kanal. Status permission/subscription browser bersifat spesifik pada browser/perangkat pengguna terkait; hasil test dari browser Admin tidak membuktikan Push aktif untuk seluruh karyawan. Test-send harus membedakan permintaan uji, status delivery yang benar-benar diketahui, dan kegagalan; pembuatan record saja bukan bukti Push berhasil.
- Perubahan konfigurasi memiliki validasi dan konfirmasi. Nilai operasional yang belum ditetapkan tidak boleh diisi dengan asumsi UI; Launch Configuration Register harus disahkan sebelum implementasi.

### 4.20 My Leave Request (Employee)
- Form pada `/today/leave-request`: tanggal tunggal atau rentang tanggal (`endDate >= startDate`), serta `Reason` (opsional teks bebas).
- Submit → status **`Pending`**, notifikasi terkirim ke Authorized Approver dalam scope employee (Supervisor/Head/HRGA sesuai policy).
- Employee melihat status pengajuan (`Pending`/`Approved`/`Rejected`) di halaman ini dan di My History; tanggal yang diajukan ditandai visual sebagai `Leave (Pending)` sampai disetujui — **belum** mengecualikan dari `No Submission` selama masih `Pending`.
- **Rekonsiliasi Persetujuan Leave Pasca-Cut-Off (`DEC-007`, `FR-48`, `BR-18`, `AC-19`):** Setelah `Approved`, tanggal resmi menjadi *valid exception* (`Leave (Approved)`) dan dikecualikan dari kewajiban check-in serta deteksi `No Submission`. Apabila persetujuan baru diberikan setelah jam Cut-Off pada tanggal di mana event `No Submission` terlanjur tercatat (karena sebelumnya masih `Pending`), sistem secara otomatis merekonsiliasi status hari kerja tersebut menjadi `Approved Leave`, mempertahankan rekaman `No Submission` awal secara *append-only* pada riwayat & *audit trail* dengan penanda **`Superseded by Approved Leave`** (tidak dihapus fisik secara diam-diam), serta mengeluarkan tanggal tersebut dari hitungan ambang 3 kejadian `FR-29`.

### 4.21 Leave Approval Queue (Reviewer/HRGA)
- Diakses melalui `/compliance/leave-approvals` (atau tab terkait pada `/team/reviews`), menampilkan daftar `Leave Request` berstatus `Pending` dalam scope approver dengan `FilterBar` (per employee, per tanggal, per status).
- Aksi eksplisit: **Approve** atau **Reject** (`Reject` mewajibkan modal input alasan singkat). Jika pengajuan yang akan di-*Approve* mencakup tanggal yang sudah melewati Cut-Off dengan catatan `No Submission`, dialog konfirmasi menampilkan informasi tenang bahwa persetujuan ini akan merekonsiliasi hari terkait menjadi `Approved Leave` dan menandai event sebelumnya sebagai `Superseded by Approved Leave` pada jejak audit (`DEC-007`).
- Berbeda dari Correction Request — Leave **bukan** *default-approve*; tetap membutuhkan keputusan eksplisit `Approve`/`Reject` sebelum berlaku (`FR-47`).

### 4.22 Correction & Leave Review (gabungan, entry point reviewer)
- `/team/reviews` adalah entry point bersama bagi user yang ditetapkan sebagai Authorized Reviewer dan/atau Authorized Approver. Halaman menggabungkan tab **Pending Objection** (mencakup Morning dan EOD Correction Request Material dengan pembeda label tegas) dan **Pending Leave Approval** (hanya dirender jika user juga merupakan Authorized Approver).
- Badge count hanya menjumlahkan item yang memang dapat ditindaklanjuti oleh pengguna dalam scope-nya. Kedua tab tetap dipisahkan secara visual dan perilaku karena Correction Request Material memakai *default-approve* setelah `Objection Window`, sedangkan Leave wajib mendapat keputusan eksplisit.

### 4.23 Reports
- Diakses lewat `/reports`, scope mengikuti role yang membuka (Head → function-scoped, HRGA → compliance-scoped, CEO/Management → company-wide), mengikuti Permission & Visibility Requirements (PRD Section 7).
- Tab per jenis laporan (sesuai PRD Section 9 & Section 12):
  - **Daily Exception Report** — snapshot RED/AMBER/no-submission/critical blocker hari terpilih.
  - **Weekly Team Summary** — agregat mingguan dalam scope, menampilkan tren continuation berulang dan support contribution lintas tim (`FR-65`).
  - **Monthly Management Trend** — tren per fungsi, recurring root cause (10 taksonomi), escalation aging, compliance pattern (khusus CEO/Management, `FR-69`).
  - **Individual Review Evidence & Performance Transition Framework (`FR-56`–`FR-59`, `AC-65`–`AC-68`):**
    - Menyusun bukti akuntabilitas satu karyawan untuk periode terpilih dalam 4 dimensi: **Delivery**, **Quality**, **Accountability**, dan **Collaboration**.
    - Memisahkan secara transparan antara: fakta rekam jejak, catatan pembinaan (*Manager Note*), dan kesimpulan reviewer.
    - Reviewer berwenang dapat mencatat evaluasi kualitatif terpandu: `Strong`, `Meets`, `Needs Improvement`, atau `Unacceptable` beserta alasan dan evidence objektif.
    - **Guardrails Ketat (`FR-57`, `FR-62`):** Sistem DILARANG MUTLAK menghitung rating otomatis atau skor KPI mentah dari status GREEN/AMBER/RED, volume komitmen, atau jumlah task.
  - **Blocker Root Cause Report** — statistik 10 taksonomi blocker paling sering & identifikasi systemic bottleneck organisasi.
- Filter periode/tanggal via `FilterBar` di setiap tab.
- `ExportButton` tersedia di tiap tab (dilengkapi *defensive gatekeeper* yang menonaktifkan ekspor bila himpunan data hasil saringan = 0), mengekspor **hanya** data yang sedang terlihat di layar dalam scope yang sama (`AC-20`).
- Tab yang muncul disesuaikan permission user yang membuka (mis. Supervisor/TL tidak melihat tab Monthly Management Trend karena bukan scope-nya).

### 4.24 Admin: User & Invitation Management (`/admin/users`)
- Diakses melalui `/admin/users` oleh System Admin / Management / HRGA berwenang (`DEC-005`, `FR-01`, `FR-22`, `FR-50`, `FR-54`, `AC-34`, `AC-36`), terpisah secara tegas dari pemetaan hierarki organisasi di `/admin/organization` (`4.15`). Mengelola siklus hidup akun pengguna dan undangan aktivasi sekali pakai tanpa pernah menyediakan *public self-registration* maupun membuat/melihat/mengirim kata sandi permanen.
- Menampilkan 4 `InteractiveMetricFilterCard` (`Total Akun`, `Aktif`, `Menunggu Aktivasi [Invited]`, `Nonaktif`), `FilterBar` 1 baris (pencarian nama/email/ID karyawan, filter `System RBAC Role`, dan filter status akun/undangan), serta tabel akun yang memisahkan secara jelas **Jabatan Fungsional (`Job Title`)** dari **Peran Otorisasi Sistem (`System RBAC Role`)** dan **Status Token Undangan (`InvitationStatusBadge`: `Pending`, `Expired`, `Used`, `Revoked`)**.
- **Modal Pembuatan Akun & Penerbitan Undangan Sekali Pakai:** Mewajibkan Nama Lengkap, ID/NIK Karyawan, Alamat Email Resmi, `Job Title`, dan `System RBAC Role`, serta mendukung pengisian penugasan struktur awal (`Canonical Function` dari 10 fungsi resmi, `Direct Manager`, dan `Effective Date >= today`) dalam alur onboarding terpadu tanpa kolom input kata sandi. Penyimpanan akun menerbitkan token undangan sekali pakai berbatas kedaluwarsa sesuai kebijakan aktif dan memicu pengiriman surel undangan (`FR-54`).
- **Aksi Kontekstual Baris & Audit:**
  - Akun berstatus belum aktif (`Invited` / `Expired` / `Revoked`): menyediakan aksi **`Kirim Ulang Undangan (Resend Invitation)`** (otomatis menghanguskan token sebelumnya dan menerbitkan token baru) dan **`Cabut Undangan (Revoke Invitation)`**.
  - Akun terdaftar: menyediakan aksi **`Nonaktifkan Akun`** (menampilkan dialog konfirmasi tenang ber-alasan wajib yang menjelaskan bahwa seluruh sesi login aktif akun tersebut akan dihentikan dan akun dikeluarkan dari jadwal check-in mendatang tanpa menghapus histori masa lalu) serta **`Aktifkan Kembali Akun`**. Seluruh aksi tercatat pada `AuditLog`.

### 4.25 Profile & Account Settings (`/profile`)
- Diakses oleh seluruh pengguna terautentikasi melalui menu `Profile` di sidebar (`/profile`), menyajikan ringkasan identitas dan konteks kerja pengguna secara bersih dan mandiri:
  1. **Kartu Identitas & Penugasan Efektif (*Read-Only*):** Menampilkan Nama Lengkap, ID/NIK, Email resmi, `Job Title`, `System RBAC Role` aktif, `Canonical Function` (beserta pratinjau teks `RoleBasedPromptHint` yang berlaku untuk fungsinya), `Direct Manager` efektif saat ini, serta indikator status pengecualian (`Exemption`) apabila berlaku. Pengguna tidak dapat mengubah sendiri role, fungsi, atau atasan langsungnya dari halaman ini.
  2. **Keamanan & Pembaruan Kata Sandi Mandiri:** Formulir ganti kata sandi yang mewajibkan verifikasi **Kata Sandi Saat Ini**, **Kata Sandi Baru** (dilengkapi kontrol intip kata sandi dan `PasswordStrengthMeter` 4 segmen + checklist kriteria), dan **Konfirmasi Kata Sandi Baru**, serta opsi mengakhiri sesi aktif di perangkat lain setelah kata sandi diperbarui.
  3. **Ringkasan Kanal Notifikasi Perangkat Ini:** Menampilkan status izin *Browser Push* pada peramban/perangkat yang sedang dipakai beserta pintasan langsung menuju `/notifications` (Tab `Pengaturan Kanal & Perangkat`) tanpa mengklaim status izin perangkat lain.

---

## 5. Escalation & Notification Interaction Rules

- Kanal dan trigger mengikuti PRD Section 8. Untuk setiap event, UI membedakan: event terjadi, notification record dibuat, kanal dicoba, dan delivery channel berhasil/gagal jika status tersebut tersedia. Jangan menyatakan Browser Push berhasil hanya karena event/notifikasi in-app tercatat.
- Browser Push dikirim nyata untuk trigger yang ditetapkan. Push tidak universal; Email dan Web Notification Center digunakan sesuai matriks. Unsupported browser, permission denied, tidak ada subscription, dan delivery failure adalah state yang berbeda, tidak memblokir workflow inti, dan tidak boleh ditampilkan sebagai success.
- Reminder submission menggunakan aturan tetap produk (`FR-28`, `AC-40`): hanya dikirim pada interval `[On-Time Deadline − 60 menit, On-Time Deadline)`, maksimal satu reminder per employee/per phase/per applicable workday, dan berhenti tepat saat On-Time Deadline (bukan reminder pada akhir Grace Period/Cut-Off). UI tidak menyediakan konfigurasi untuk mengubah lead time tetap 60 menit tersebut atau menampilkan reminder sebagai perubahan status.
- Validasi submission memakai timestamp request server, bukan waktu scheduler: `On-Time` jika `submittedAt ≤ On-Time Deadline`; `Late` jika `On-Time Deadline < submittedAt ≤ Cut-Off`; setelah `Cut-Off` ditolak penuh tanpa write (`DEC-002`). `GracePeriod = 0` valid. Scheduler hanya menghasilkan cutoff lock/`No Submission` evaluation; UI tidak menjanjikan bahwa submission setelah cutoff dapat "diselamatkan" oleh job yang belum berjalan.
- RED/critical blocker dan escalation mengikuti trigger, penerima, authority context, serta threshold aktif yang telah disahkan. Unacknowledged RED melewati threshold → UI menampilkan auto-escalation sebagai event sistem pada `AuditTrailTimeline`, bukan tindakan manual.
- Correction Request Material yang mendekati akhir Objection Window memicu reminder kepada Authorized Reviewer sesuai matriks; countdown terlihat, namun reviewer tidak diwajibkan menindaklanjuti. Jika tidak ada objection hingga window berakhir, perubahan otomatis `Applied`.
- Leave Request tetap berstatus `Pending` sampai Authorized Approver mengambil keputusan eksplisit (`Approve`/`Reject`). Apabila `Approve` terjadi setelah Cut-Off pada hari yang sempat tercatat `No Submission`, sistem merekonsiliasi hari tersebut menjadi `Approved Leave` dan menandai rekaman sebelumnya sebagai `Superseded by Approved Leave` (`DEC-007`).
- Browser Push permission prompt harus dipicu oleh aksi pengguna yang jelas; penolakan izin tidak boleh menghalangi pengguna menjalankan check-in, mengajukan blocker, atau melihat Web Notification Center.

## 6. Komponen Reusable (Fungsional, bukan Visual)

| Komponen | Fungsi | Dipakai di |
|---|---|---|
| `DailyWorkflowStepBar` | Navigasi progres horizontal 3 tahap siklus harian (`Morning Commitment` → `Additional Work` → `EOD Outcome`) yang responsif tanpa overflow horizontal | `/today/morning`, `/today/additional-work`, `/today/eod` |
| `StatusBadge` | Menampilkan Daily Status `GREEN`/`AMBER`/`RED` (serta varian netral terpisah `NOT_APPLICABLE — NO_COMMITMENT`) secara konsisten | Seluruh halaman dengan status harian |
| `SubmissionTimingBadge` | Menampilkan `On-Time` (biru info) / `Late` (oranye) / `No Submission` (abu-abu netral) — terpisah dari `StatusBadge` | Today, History, Pulse Dashboard, Compliance Queue |
| `WorkflowStatusBadge` | Menampilkan status workflow spesifik domain (`Pending`, `Applied`, `Approved`, `Rejected`, `Open`, `Acknowledged`, `In Progress`, `Resolved`, `Closed`, `Accepted Risk`, serta `Superseded by Approved Leave`) | Correction, Leave, Blocker, History, Compliance |
| `InvitationStatusBadge` | Menampilkan status siklus token undangan akun (`Pending`, `Expired`, `Used`, `Revoked`) | Admin: User & Invitation (`/admin/users`) |
| `CarryOverBadge` | Penanda informatif tugas berlanjut lintas hari kerja (*"Berlanjut"* / *"Carry-Over Berulang"*), **tanpa pernah mengunci pilihan `GREEN`** (`DEC-003`) | `DraftBanner` Morning, EOD, History, Project Risk |
| `CommitmentCard` | Satu unit Morning Commitment / Additional Work / EOD Work Item (memisahkan kontrol `Outcome` dan `Continuation`) | Morning, Additional Work, EOD, History |
| `BlockerCard` | Detail blocker + `ActionPanel` kontekstual sesuai state & wewenang aktor, termasuk state `Resolved` menunggu konfirmasi pelapor | Raise Blocker, Blocker Queue, History |
| `ActionPanel` | Menampilkan hanya aksi valid untuk state dan kewenangan aktor saat ini | Blocker Queue, Compliance Queue, Admin Users/Org |
| `AuthorityTag` | Menandai secara eksplisit apakah penugasan berasal dari `Organizational Authority` atau `Project Authority` | Raise Blocker, Blocker Queue, Escalation Aging, Project Risk |
| `LiveRoutePreviewBox` | Pratinjau *real-time* penerima awal (`Owner Needed`) dan jalur kewenangan hasil resolusi sistem sebelum laporan blocker dikirim | Raise Instant Blocker |
| `EffectiveDatePicker` | Input tanggal efektif beserta pratinjau dampak; menegakkan batas minimum `effectiveDate >= today` (menolak tanggal lampau sesuai `DEC-008`) pada penugasan organisasi, kewenangan proyek, dan reviewer sementara | Admin: Org Mapping, User Onboarding, Temporary Reviewer, Policy Settings |
| `ImpactPreviewModal` | Modal konfirmasi tahap ke-2 yang menampilkan komparasi *Before vs After* dan daftar bawahan terdampak dengan retensi penuh state form | Admin: Organizational Mapping (`UF-40`) |
| `SideBySideDiffPanel` | Panel perbandingan berdampingan `Before (Read-Only)` vs `Proposed After` dengan kontrol input sesuai tipe data dan input kondisional atomik | Morning & EOD Correction Request (`4.16a`, `4.16b`) |
| `AuditTrailTimeline` | Linimasa vertikal *read-only* berurutan waktu mundur untuk jejak transisi status, auto-escalation, mutasi penugasan, dan riwayat koreksi | Blocker Queue, Escalation Aging, Org Mapping, Correction Request, Compliance |
| `PolicyVersionHistory` | Menampilkan riwayat versi berpenanggalan efektif dari suatu kategori kebijakan | Policy Settings |
| `ValidationPromptModal` | Modal konfirmasi seimbang saat saran Status Suggestion Engine berbeda dari pilihan user (tanpa *silent mutation* dan tanpa mengunci `GREEN`) | EOD Check-in |
| `InteractiveMetricFilterCard` | Kartu ringkasan metrik angka (`tabular-nums`) yang aksesibel keyboard (`aria-pressed`) untuk *click-to-filter* / *click-to-tab* | Pulse Dashboard, Queues, Project Risk, Escalation Aging, Admin |
| `MasterDetailSplitWorkbench` | Komposisi kerja 2 panel *sticky* di desktop (`42% : 58%`) yang beradaptasi menjadi *drawer* atau 2 tab pada layar sempit | Blocker & Escalation Queue, Manager Note / Coaching Record |
| `ExceptionSummaryWidget` | Ringkasan jumlah status & daftar triage *Exceptions First* dalam scope yang diizinkan | Team/Function/Management Pulse Dashboard |
| `CaseDistinctionCallout` | Panel panduan kontekstual Matriks Distingsi Kasus (§13.1 PRD, `FR-73`) untuk pembedaan adil saat mencatat pembinaan/tindak lanjut | Manager Note, Compliance Queue |
| `TriggerDateCapsules` | Kumpulan chip tanggal faktual kejadian `No Submission` terverifikasi pembentuk *Pattern Flag* | Compliance Queue |
| `NotificationBell` | Indikator unread + pratinjau menuju Web Notification Center | Global topbar |
| `DraftBanner` | Panel akordeon draf copy-forward komitmen berlanjut hari kerja sebelumnya yang perlu ditinjau (tanpa auto-submit) | Morning Commitment |
| `ExemptionBanner` | Banner tenang penjelas status Pengecualian Partisipasi Terbuka (`Indefinite Role Exemption`) bagi akun eksekutif | `/today` (Morning & EOD) |
| `LockedIndicator` | Menandai submission/baseline yang terkunci pasca Cut-Off beserta jalur koreksi resmi bila tersedia | Morning Commitment dan EOD (setelah Cut-Off) |
| `RoleBasedPromptHint` | Menampilkan teks petunjuk visual miring (*italic* inline guidance) sesuai **10 fungsi kanonikal resmi Dutamedia** serta fallback netral (non-binding, `FR-12`) | Morning Commitment, Add Additional Work |
| `QualityWarningBadge` | Menampilkan inline warning edukatif non-blocking saat teks komitmen/pekerjaan terlalu singkat atau generik (`FR-63` / `AC-72`) | Morning Commitment, Add Additional Work |
| `SupportContributionCard` | Menampilkan catatan kontribusi dukungan rekan kerja lintas fungsi/proyek pada blocker terkait (`FR-64` / `AC-73`) | Blocker Card, History, Weekly Summary, Pulse Dashboard |
| `ClassificationTag` | Menandai Correction Request sebagai `Minor` atau `Material` | Morning/EOD Correction Request, Review Queue |
| `ObjectionWindowIndicator` | Countdown sisa waktu + timestamp berakhir absolut dari `Objection Window` sebelum *default-approve* | Correction Request (`4.16a`, `4.16b`), Review Queue |
| `PasswordStrengthMeter` | Indikator kekuatan kata sandi 4 segmen disertai checklist kriteria keamanan aksesibel | Aktivasi Akun, Reset Password, Profile (`/profile`) |
| `SessionLockModal` | Modal re-autentikasi di tempat (*in-place*) saat sesi habis di tengah pengisian form guna mencegah kehilangan draf (`NFR-01`) | Form Check-in & Evaluasi (`/today/*`) |
| `FilterBar` | Filter lintas dimensi (employee/function/project/date/status/blocker taxonomy) sesuai `FR-37` dengan tombol `Reset Filter` | Dashboards, Queues, History, Reports, Admin |
| `ExportButton` | Memicu ekspor data (CSV UTF-8 BOM / PDF / Spreadsheet) terbatas sesuai scope yang sedang tampil di layar (`FR-42`/`AC-20`) | Reports, My History, Project Risk, Escalation Aging |

---

## 7. User Flows Komprehensif (User-Centric & Interactive Experience)

Bagian ini mendefinisikan seluruh **44 User Flows (`UF-01` s/d `UF-44`)** di dalam sistem WorkPulse secara komprehensif, sekuensial, dan terperinci. Setiap alur disusun dari sudut pandang nyata pengguna (manusia yang berhadapan dengan antarmuka) saat menyelesaikan tugasnya, diturunkan secara disiplin dan mandiri dari **PDD v1.5 FINAL** serta **PRD v1.6 FINAL**.

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
     - Pada saat slot masih kosong, komponen `RoleBasedPromptHint` tampil sebagai placeholder visual bergaya miring (*italic*) sesuai atribut `function` pada **10 fungsi kanonikal resmi Dutamedia** karyawan tersebut (misal fungsi `Engineering`: *"Contoh: Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji"*). Hint tampil konsisten pada slot #1, #2, dan #3, menghilang saat diketik, murni pemandu visual, dan tidak pernah mengontaminasi nilai input form maupun tersimpan ke database (`FR-12`, `AC-37`).
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
  - **Jalur Sukses On-Time:** Tombol menampilkan spinner sebentar $\rightarrow$ toast hijau muncul: *"Morning Commitment berhasil disimpan tepat waktu!"* $\rightarrow$ kartu Morning berubah menjadi read-only dengan badge biru info **`On-Time`** (`timing.ontime`) dan badge status risiko awal.
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
  3. Komponen `QualityWarningBadge` muncul di bawah textarea dengan aksen amber lembut (`status.amber`):
     *"Komitmen tampak sangat umum. Sebutkan hasil atau deliverable teramati yang diharapkan selesai hari ini (misal: 'Selesaikan slice UI dashboard dan integrasikan dengan API')."*
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
- **Aktor:** Karyawan yang pada EOD hari kerja sebelumnya memilih `Continuation = Continue` pada item Morning Commitment.
- **Entry Point & Tampilan Awal Layar:**
  - Karyawan membuka `/today/morning`.
  - Sistem mendeteksi adanya item Morning Commitment dari hari kerja sebelumnya yang berstatus `Continue` (tidak termasuk *Additional Work* sesuai `AC-23`).
  - Di atas form komitmen muncul komponen `DraftBanner` dengan tombol: *"Terdapat :count Komitmen Lanjutan dari Hari Kerja Sebelumnya. Tinjau & Gunakan Draf."*
- **Langkah Interaksi Antarmuka:**
  1. Karyawan mengklik banner $\rightarrow$ panel koleksi draf copy-forward terbuka menampilkan seluruh item eligible secara utuh beserta catatan lanjutannya (`Continuation Reason`) dan lencana informatif `CarryOverBadge` (`Carry-over #1` atau `Carry-over #2+`).
  2. Karyawan mencentang item yang ingin dikerjakan hari ini (maksimal mengisi hingga batas total 3 komitmen; tidak ada tombol *"Hentikan Pekerjaan"* destruktif di pagi hari karena keputusan tidak melanjutkan telah ditetapkan pada kontrol `Continuation` EOD sebelumnya).
  3. Karyawan menekan tombol **"Salin ke Komitmen Hari Ini"**.
  4. Teks komitmen, lencana `CarryOverBadge`, dan tautan referensi otomatis terisi ke slot Commitment #1 / #2 / #3.
  5. **Langkah Peninjauan Wajib:** Form TIDAK langsung tersubmit otomatis. Karyawan wajib meninjau teks, boleh mengedit redaksi, dan wajib memilih kembali **Initial Risk** hari ini (`GREEN`/`AMBER`/`RED` — seluruh opsi termasuk `GREEN` tetap aktif penuh dan tidak dikunci).
  6. Karyawan menekan tombol **"Simpan Morning Commitment"**.
- **Guardrails Bisnis (`FR-11`, `AC-23`, `DEC-003`, `DEC-004`):** Tidak ada auto-submit di balik layar; tidak ada penghilangan atau penggabungan item eligible; tidak ada pembuatan slot ke-4 di luar batas maksimal 3 komitmen; serta tidak ada penguncian paksa (`disabled`) atas opsi `GREEN`.
- **Kondisi Akhir Layar:** Pekerjaan bersambung tercatat rapi dengan jejak keterkaitan historis.

#### UF-10: Penanganan Keterlambatan Pengisian Pagi (On-Time vs Late vs Terkunci Pasca Cut-Off)
- **User Goal:** Karyawan memahami status disiplin waktunya saat mengisi di luar jadwal normal.
- **Aktor:** Karyawan.
- **Entry Point & Skenario Waktu:**
  - **Skenario 1: Mengisi di Antara On-Time Deadline dan Cut-Off (Late Period):**
    - Karyawan membuka `/today` setelah jam On-Time Deadline kebijakan aktif (misal contoh ilustrasi pk 09:00) namun pada atau sebelum jam Cut-Off (misal contoh ilustrasi pk 09:30).
    - Di header muncul badge penjelas warna amber: *"Pengisian Terlambat (Dalam Masa Tenggang)"*.
    - Form tetap terbuka penuh dan dapat diisi normal.
    - Setelah klik simpan, kartu terkunci dengan badge **`Late`** berwarna amber/oranye netral (`timing.late`).
    - *Feedback:* Sistem mencatat fakta keterlambatan secara objektif tanpa menampilkan kata-kata hukuman atau nada memarahi.
  - **Skenario 2: Membuka atau Mencoba Submit Setelah Batas Akhir Cut-Off (Locked State):**
    - Karyawan membuka `/today` (atau menekan simpan) setelah jam Cut-Off kebijakan aktif terlampaui (misal contoh ilustrasi pk 09:35); percobaan pengiriman pasca-Cut-Off ditolak penuh oleh server tanpa penulisan data (`FR-26`, `AC-57`, `DEC-002`).
    - Seluruh form Morning terkunci permanen (*read-only*).
    - Komponen `LockedIndicator` muncul dengan pesan jelas:
      *"Batas waktu pengisian Morning Check-in telah berakhir (Cut-Off: :cutOffTime). Form telah terkunci untuk menjaga keandalan baseline harian."*
    - Tombol simpan menghilang. Jika karyawan sebelumnya telah memiliki baseline pagi yang terkunci dan kebijakan mengizinkan koreksi atas record yang ada, layar memunculkan tombol: **"Ajukan Morning Correction Request"** (tidak berlaku untuk menciptakan submission baru atas hari *No Submission*).
- **Kondisi Akhir Layar:** Integritas waktu terlindungi tanpa menghilangkan jalur koreksi resmi atas record yang sudah ada.

#### UF-11: Pencatatan Tambahan Pekerjaan Tengah Hari (Add Additional Work)
- **User Goal:** Karyawan mencatat tugas mendadak yang didelegasikan atasan atau insiden teknis darurat di siang hari agar beban kerjanya terekam adil.
- **Aktor:** Karyawan.
- **Entry Point & Tampilan Awal Layar:**
  - Kapan saja di sela jam kerja (misal contoh ilustrasi pk 14:00) setelah Morning Check-in selesai, karyawan membuka `/today`.
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
- **Guardrails Bisnis (`FR-07`, `BR-01`):** Additional Work tidak mengubah baseline pagi yang sudah terkunci dan bukan slot ke-4 komitmen pagi.
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
  2. Karyawan mengamati panel **Status Suggestion Engine (`FR-13` / `AC-38`)** di bagian bawah yang secara otomatis menghitung rekomendasi status harian berdasarkan aturan deterministik:
     - Ada Blocker Critical atau insiden produksi $\rightarrow$ menyarankan **RED**.
     - $\ge 50\%$ tugas Not Completed/Cancelled $\rightarrow$ menyarankan **RED**.
     - Ada Blocker High atau carry-over berulang hari ke-2 berturut-turut pada item yang sama $\rightarrow$ menyarankan minimal **AMBER** (tanpa pernah mengunci/menonaktifkan opsi `GREEN`, sesuai `DEC-003`).
     - Sebagian selesai atau $< 50\%$ belum selesai $\rightarrow$ menyarankan minimal **AMBER**.
     - Semua tugas selesai tanpa blocker aktif $\rightarrow$ menyarankan **GREEN**.
  3. Karyawan memilih **Final Status** harian: `GREEN`, `AMBER`, atau `RED` (seluruh opsi radio selalu dapat dipilih).
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
  - Karyawan memilih status `GREEN`, namun sistem mendeteksi ada blocker aktif, tugas belum selesai, atau carry-over berulang hari ke-2+ sehingga sistem menyarankan `AMBER` atau `RED`.
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
    - Badge Waktu: `On-Time` (biru info `timing.ontime`) atau `Late` (amber/oranye `timing.late`).
    - Badge Risiko Akhir: `GREEN`, `AMBER`, atau `RED` (atau `NOT_APPLICABLE — NO_COMMITMENT`).
  - Seluruh tombol edit, tambah tugas, dan dropdown outcome berubah menjadi teks statis read-only.
  - Jika EOD telah pernah disubmit dan ada kesalahan pencatatan yang baru disadari setelah terkunci, karyawan melihat satu-satunya jalur resmi: tombol *"Ajukan EOD Correction Request"*.
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
  - **Jalur Sukses:** Modal tertutup $\rightarrow$ toast hijau muncul: *"Blocker berhasil dilaporkan dan ditugaskan kepada :namaOwner."* $\rightarrow$ Blocker Card muncul dengan status badge biru **`Open`**. Notifikasi instan terkirim ke gawai penanggung jawab, dan audit trail menyimpan konteks kewenangan, penerima akhir, serta dasar resolusinya (`AC-58`–`AC-61`).
  - **Jalur Gagal (Penerima Manual Tidak Sah / Mapping Fallback Belum Terkonfigurasi / Ambigu):** Sistem menolak pengiriman tanpa menampilkan konfirmasi sukses palsu (`AC-60`, `AC-61`), menjelaskan secara spesifik apakah pilihan manual di luar scope sah atau belum ada fallback organisasi/proyek aktif yang terkonfigurasi, serta menampilkan panduan langkah perbaikan yang jelas (mengganti pilihan penerima yang sah atau menghubungi Admin untuk melengkapi mapping kewenangan).
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
- **Umpan Balik Visual:** Status blocker berubah menjadi **`Accepted Risk`** dengan lencana amber/oranye informasional (`workflow.accepted-risk`). Blocker dikeluarkan dari hitungan krisis aktif namun tetap tercantum di laporan risiko eksekutif.
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
    - Sistem menempatkan pengajuan dalam status **`Pending`** selama **Objection Window** (sesuai durasi kebijakan aktif pada Policy Configuration, misal contoh ilustrasi 24 jam kerja).
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
    3. Tanggal tersebut resmi menjadi *Valid Exception* (`FR-48`) di kalender kerja karyawan dan otomatis mengecualikan karyawan dari kewajiban check-in serta deteksi No Submission. Apabila persetujuan baru diberikan setelah jam Cut-Off pada tanggal di mana event `No Submission` sempat tercatat, sistem otomatis merekonsiliasi hari tersebut menjadi `Approved Leave`, mempertahankan event `No Submission` sebelumnya secara *append-only* pada *audit trail* dengan penanda `Superseded by Approved Leave`, dan mengeluarkannya dari hitungan ambang 3 kejadian `FR-29` (`AC-19`, `DEC-007`). Karyawan menerima notifikasi persetujuan.
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
  - Layar menampilkan daftar karyawan yang terdeteksi **Pattern Flag (ambang tetap 3x kejadian No Submission sah dalam jendela hari kerja bergulir sesuai kebijakan aktif, misal contoh ilustrasi 30 hari kerja; tidak menghitung event berstatus `Superseded by Approved Leave`)**.
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

#### UF-40: Pemetaan Struktur Organisasi & Kewenangan Proyek Berpenanggalan Efektif oleh Admin (Org Mapping)
- **User Goal:** Administrator memperbarui penugasan fungsi/atasan langsung atau pemetaan kewenangan proyek dengan tetap menjaga keutuhan riwayat masa lalu dan mencegah rantai pelaporan melingkar.
- **Aktor:** System Administrator / HRGA Berwenang.
- **Entry Point & Langkah Interaksi:**
  1. Admin membuka rute `/admin/organization`.
  2. Layar menyajikan dua tab: **Penugasan Hierarki Organisasi** (Fungsi kanonikal dari 10 fungsi resmi Dutamedia, Role, Direct Manager, Reviewer, dan Fallback Organisasi) serta **Pemetaan Kewenangan Proyek (`ProjectAuthorityMapping`)** berbasis teks reference/scope proyek aktif.
  3. Admin memilih personil untuk mengubah penugasan (misal mutasi ke salah satu dari 10 fungsi kanonikal atau pergantian Direct Manager) atau menambah/mengubah mapping kewenangan proyek.
  4. Form perubahan mewajibkan pengisian **Tanggal Berlaku Efektif (`Effective Date`)** melalui `EffectiveDatePicker` yang menegakkan aturan `effectiveDate >= today` (pemilihan tanggal lampau ditolak dengan pesan error inline sesuai `DEC-008`), serta memvalidasi pencegahan hierarki melingkar (*circular reporting prevention*) secara rekursif.
  5. Admin mengklik tombol **"Lihat Preview Dampak"** $\rightarrow$ `ImpactPreviewModal` menampilkan perbandingan `Before -> Proposed After`, daftar bawahan/alur eskalasi yang ikut terdampak, dan tanggal mulai berlakunya penugasan baru.
  6. Admin menekan **"Konfirmasi Perubahan"** $\rightarrow$ penugasan tersimpan sebagai record versi baru berpenanggalan efektif.
  7. **Integritas Histori (`FR-23`, `FR-24`, `AC-54`):** Seluruh data masa lalu tidak pernah ditimpa; record akuntabilitas lampau tetap menampilkan konteks atasan, fungsi, dan kewenangan yang menjabat pada tanggal kejadian tersebut.
- **Kondisi Akhir Layar:** Struktur organisasi dan kewenangan proyek terbarui dengan jejak historis utuh.

#### UF-41: Pendelegasian Reviewer Sementara oleh Pimpinan/Admin (Temporary Reviewer Assignment)
- **User Goal:** Menunjuk pengganti sementara untuk meninjau blocker dan koreksi bawahan saat manajer berhalangan/cuti panjang.
- **Aktor:** Administrator / Pimpinan Berwenang.
- **Entry Point & Langkah Interaksi:**
  1. Admin/Pimpinan membuka rute `/admin/temporary-reviewer`.
  2. Klik **"+ Tambah Delegasi Reviewer"**.
  3. Memilih pejabat yang digantikan, memilih personil pengganti aktif (Temporary Reviewer — divalidasi tidak menunjuk ke diri pejabat yang sedang digantikan), dan ruang lingkup bawahan.
  4. Mengisi **Effective Date** (`effectiveDate >= today`, input tanggal lampau ditolak sesuai `DEC-008`) dan **Expiry Date** (`expiryDate >= effectiveDate`) yang **keduanya wajib diisi (`FR-25`)**.
  5. Menekan tombol **"Simpan Penugasan Sementara"**.
  6. Pada rentang tanggal tersebut, reviewer pengganti otomatis melihat antrean review bawahan terkait di `/team/reviews`.
  7. Tepat pada akhir masa berlaku Expiry Date, wewenang delegasi otomatis berakhir oleh sistem tanpa perlu tindakan manual admin.
- **Guardrails Bisnis:** Penugasan sementara DILARANG dibuat terbuka tanpa batas kedaluwarsa (*no open-ended delegation*) dan dilarang di-*backdate* ke tanggal lampau.
- **Kondisi Akhir Layar:** Kelancaran operasional review terjamin saat manajer berhalangan.

#### UF-42: Pengaturan Nilai Kebijakan Organisasi oleh Pemilik Kebijakan (Policy Settings)
- **User Goal:** Pemilik kebijakan yang berwenang mengubah parameter konfigurasi sistem tanpa menyentuh kode program.
- **Aktor:** Authorized Policy Owner (Admin / Head / HRGA sesuai kewenangan `FR-34` / `BR-15`).
- **Entry Point & Langkah Interaksi:**
  1. Pengguna membuka rute `/policy-settings`.
  2. **Tampilan Terfilter Sesuai Wewenang:** Pengguna HANYA melihat section kebijakan yang menjadi kewenangannya:
     - Admin: Jam kerja, batas On-Time, Grace Period, batas Cut-Off, masa berlaku undangan.
     - Head / Management: Threshold waktu eskalasi SLA blocker, Objection Window, dan klasifikasi Minor/Material.
     - HRGA: Jendela hari kerja evaluasi kepatuhan non-submission dan ketentuan retensi bukti kepatuhan.
     *(Kategori di luar wewenang tidak dirender sama sekali pada antarmuka dan ditolak oleh server).*
  3. Pemilik kebijakan menyunting nilai parameter yang diizinkan dan memasukkan **Tanggal Berlaku Efektif (`Effective Date >= today`)**.
  4. Sistem memvalidasi parameter terhadap aturan tetap produk (*Product Fixed Rules* — batas maksimal 3 komitmen dan ambang toleransi 3x non-submission tidak dapat diubah) serta menampilkan `ImpactPreviewModal`.
  5. Pengguna menekan tombol **"Terapkan Versi Kebijakan Baru"**.
  6. Sistem menyimpan konfigurasi sebagai versi baru berpenanggalan efektif (`PolicyVersionHistory`), versi lama diarsipkan secara *append-only*.
- **Kondisi Akhir Layar:** Kebijakan operasional terkelola mandiri dengan tata kelola versi yang akuntabel.

#### UF-43: Pembuatan Akun Karyawan & Pengelolaan Undangan Aktivasi Sekali Pakai oleh Admin (`/admin/users`)
- **User Goal:** Administrator mendaftarkan akun karyawan baru ke dalam WorkPulse, mengirimkan undangan aktivasi sekali pakai, atau mengelola status siklus hidup akun karyawan tanpa mencampuradukkannya dengan layar pemetaan struktur organisasi.
- **Aktor:** System Administrator (`FR-01`, `FR-50`, `FR-54`, `AC-34`, `AC-36`, `AC-54`, `DEC-005`).
- **Entry Point & Tampilan Awal Layar:**
  - Admin mengklik menu **"User & Invitation Management"** di grup Administration sidebar $\rightarrow$ membuka rute `/admin/users`.
  - Layar menampilkan kartu ringkasan status akun (`Active`, `Invited / Pending Activation`, `Invitation Expired`, `Deactivated`), `FilterBar`, tabel direktori akun lengkap dengan `InvitationStatusBadge`, dan tombol utama **"+ Undang Pengguna Baru"**.
- **Langkah Interaksi Antarmuka:**
  1. Admin mengklik tombol **"+ Undang Pengguna Baru"**.
  2. Drawer/modal pembuatan akun terbuka menyajikan field:
     - **Nama Lengkap** dan **Alamat Email Kerja Resmi** (unik, tervalidasi formatnya).
     - **Penugasan Awal Efektif:** Pilihan salah satu dari **10 fungsi kanonikal resmi Dutamedia**, Role awal, Direct Manager awal, serta `Effective Date` (`effectiveDate >= today` sesuai `DEC-008`).
  3. Admin menekan tombol **"Buat Akun & Kirim Undangan Aktivasi"**.
- **Percabangan Interaksi UI:**
  - **Cabang A (Sukses Dibuat & Undangan Terkirim):** Akun tercatat dengan status `Invited` dan token sekali pakai berbatas waktu dikirim ke surel karyawan. Toast hijau muncul: *"Akun :nama berhasil dibuat dan surel undangan aktivasi telah dikirimkan."*
  - **Cabang B (Pengelolaan Undangan Menggantung / Kedaluwarsa):** Untuk akun berstatus `Invited` atau `Expired`, Admin dapat mengklik aksi baris **"Kirim Ulang Undangan (Resend)"** (menerbitkan token baru & menghanguskan token lama) atau **"Cabut Undangan (Revoke)"** (membatalkan token seketika sehingga tautan lama menampilkan state tidak berlaku pada `UF-01`).
  - **Cabang C (Deaktivasi / Reaktivasi Akun):** Saat karyawan resign atau nonaktif, Admin mengklik **"Nonaktifkan Akun"** dengan konfirmasi dampak dan alasan wajib $\rightarrow$ seluruh sesi aktif akun tersebut langsung diakhiri tanpa menghapus rekam jejak akuntabilitas historisnya (`FR-24`).
- **Guardrails Bisnis:** Pendaftaran mandiri publik (*public self-registration*) tidak tersedia di bagian mana pun dari aplikasi; pemutakhiran mutasi hierarki lanjutan setelah akun aktif dikelola secara terpisah di `/admin/organization` (`DEC-005`).
- **Kondisi Akhir Layar:** Siklus hidup identitas akun dan undangan aktivasi terkendali penuh dengan jejak audit lengkap.

#### UF-44: Pengelolaan Profil, Konteks Penugasan Aktif, & Pembaruan Kata Sandi Mandiri (`/profile`)
- **User Goal:** Pengguna yang sedang login memeriksa informasi penugasan organisasinya saat ini serta memperbarui kata sandi akunnya secara mandiri dan aman.
- **Aktor:** Seluruh Pengguna Terautentikasi.
- **Entry Point & Tampilan Awal Layar:**
  - Pengguna mengklik menu **"Profile"** pada avatar pengguna atau sidebar $\rightarrow$ membuka rute `/profile`.
  - Layar menampilkan dua panel bersih: **Panel Identitas & Konteks Penugasan Efektif (Read-Only)** dan **Panel Keamanan & Kata Sandi**.
- **Langkah Interaksi Antarmuka:**
  1. Pada Panel Identitas & Konteks Penugasan Efektif, pengguna meninjau Nama, Email resmi, Fungsi kanonikal aktif, Role aktif, Direct Manager efektif saat ini, serta status pengecualian partisipasi (bila ada). Catatan informatif menjelaskan bahwa perubahan data kepegawaian/organisasi dikelola oleh HRGA/Admin.
  2. Untuk mengganti kata sandi, pengguna mengisi **Kata Sandi Saat Ini**, **Kata Sandi Baru** (dipandu komponen `PasswordStrengthMeter` real-time), dan **Konfirmasi Kata Sandi Baru**.
  3. Pengguna menekan tombol **"Perbarui Kata Sandi"**.
- **Percabangan Interaksi UI:**
  - **Cabang A (Kata Sandi Saat Ini Valid & Kriteria Terpenuhi):** Kata sandi berhasil diperbarui, sesi di perangkat lain dicabut demi keamanan, field password dikosongkan kembali, dan toast sukses muncul.
  - **Cabang B (Kata Sandi Saat Ini Salah / Konfirmasi Tidak Cocok):** Pesan error inline tampil spesifik pada field terkait tanpa me-refresh halaman.
- **Kondisi Akhir Layar:** Keamanan kredensial pengguna terbarui secara mandiri tanpa mengganggu konteks kerja.

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
| Login, Invitation, & Profile | Public login default, invalid credentials, inactive account, forgot/reset password, valid invite, expired/used/revoked invite, activation success, session lock re-auth modal; Admin `/admin/users` (`Invited`, `Expired`, `Revoked`, `Resend`, `Active`, `Deactivated`); `/profile` password update | Error tidak membocorkan keberadaan akun lain; public self-registration tidak tersedia; sesi di perangkat lain dicabut saat password direset/diperbarui |
| Morning | Empty 0 commitments, populated 1–3, 10-function `RoleBasedPromptHint` placeholder, non-blocking `QualityWarningBadge`, copy-forward available (`CarryOverBadge` non-locking), validation error, saving, On-Time success, Late success, locked/cutoff rejected, correction unavailable/available | 0 commitment membutuhkan reason; agregat initial status hanya-baca; opsi `GREEN` tidak pernah di-disable; input dipertahankan pada kegagalan |
| EOD | Belum ada EOD, EOD draft dengan item, tidak ada item evaluable, cancelled-reason validation, continuation-reason validation, daily risk reason validation, suggestion tersedia/tidak tersedia/mismatch, saving, On-Time/Late success, cutoff rejection, locked, EOD correction available/unavailable | `Continuation=Continue` selalu membutuhkan reason (termasuk saat `Completed`); `AMBER`/`RED` membutuhkan daily explanation; bila tidak ada item evaluable dan tidak ada blocker aktif, jangan tampilkan suggestion; opsi `GREEN` tetap aktif penuh; tidak ada silent status mutation |
| Correction | Draft request, submitting, Minor Applied, Material Pending/countdown (`ObjectionWindowIndicator`), objection submitted, Rejected, Applied after window, failed submission | Morning/EOD dipisahkan; hanya untuk submission yang pernah ada (bukan pembatal `No Submission`); baseline tidak berubah selama Material Pending; no false success |
| Blocker | Open, Acknowledged, In Progress, Resolved awaiting reporter, Reopened (`In Progress`), Closed, Accepted Risk, auto-escalated, invalid/unavailable/ambiguous owner error, unauthorized action | Resolve membutuhkan resolution note; hanya pelapor mengonfirmasi Closed (tidak ada auto-close berbasis waktu); Accepted Risk jalur terpisah; tidak ada klaim terkirim palsu bila penerima tidak valid |
| Notifications | Push not supported, permission prompt eligible, granted, denied, no subscription, delivery attempted, failed, success only if confirmed; in-app read/unread | Jangan menyamakan notification record dengan push delivery; fallback sesuai matriks trigger |
| Leave/Exemption | Leave Pending, Approved, Rejected; rekonsiliasi pasca-Cut-Off (`Superseded by Approved Leave`); Holiday/Exemption configured/expired; Indefinite Role Exemption (`ExemptionBanner`) | Pending leave tidak mengecualikan tanggal; admin-set exception berlaku sesuai effective period; bila cuti baru disetujui setelah Cut-Off saat `No Submission` sempat tercatat, hari otomatis direkonsiliasi menjadi `Approved Leave` dan event `No Submission` ditandai `Superseded by Approved Leave` secara append-only di audit trail serta dikeluarkan dari ambang 3x `FR-29` (`DEC-007`) |
| Admin, Org, & Policy | `/admin/users`, `/admin/organization`, `/admin/temporary-reviewer`, `/policy-settings`: unauthorized category hidden, authorized category editable, past-date rejection (`effectiveDate < today`), circular-hierarchy rejection, `ImpactPreviewModal`, confirm, effective-dated history | Tidak merender kategori policy di luar wewenang; `Effective Date` wajib hari ini atau masa depan (`effectiveDate >= today` sesuai `DEC-008`); nilai operasional belum disahkan tidak boleh ditebak |

### 9.1 Aturan Umum Error, Loading, dan Double Submission
- Saat request berjalan, tombol submit menunjukkan state loading dan mencegah pengiriman ganda dari aksi berulang, tanpa menghapus input.
- Jika request gagal, tampilkan error yang actionable, pertahankan input yang aman, dan jangan tampilkan status sukses/Applied/Delivered tanpa konfirmasi server yang relevan.
- Jika hasil request tidak pasti (misalnya koneksi terputus setelah submit), UI harus menampilkan state yang meminta pengguna memeriksa status request sebelum mencoba lagi, atau memuat ulang status authoritative; jangan mendorong duplikasi.
- Empty state harus menjelaskan apakah data memang belum ada, tidak ada item yang cocok dengan filter, tidak ada anomali aktif (*Positive / Zero-Exception State*), user tidak memiliki akses (`403 Access Restricted State`), atau data gagal dimuat. Jangan memakai satu empty state untuk semua kondisi.
- Semua status penting harus memiliki label teks; warna atau ikon tidak boleh menjadi satu-satunya pembawa makna.
- UI tidak menggantikan server-side authorization. Tombol yang tidak ditampilkan bukan satu-satunya kontrol akses.

---

## 10. Requirement Traceability — UI/UX Scope

Traceability berikut diperiksa dan disinkronkan penuh terhadap **PDD v1.5 FINAL** dan **PRD v1.6 FINAL**. Setiap ID requirement dan acceptance criteria dicantumkan secara individual agar tidak ada ID yang terlewat atau hanya diasumsikan tercakup karena berada dalam rentang. Lokasi menunjukkan spesifikasi perilaku UI atau disposisi non-UI; traceability bukan pengganti verifikasi acceptance test.

### 10.1 Functional Requirement Traceability

| ID | Lokasi UI/UX atau disposisi |
|---|---|
| FR-01 | 4.1, 4.24, 4.25, UF-01–UF-04, UF-43, UF-44 — Autentikasi login, sesi, profil, dan aktivasi akun via undangan sekali pakai |
| FR-02 | 4.6, 4.15, UF-37, UF-40 — Snapshot organisasi historis; histori menampilkan konteks pada tanggal kejadian |
| FR-03 | 4.2, UF-06, UF-08 — 0–3 Morning Commitment |
| FR-04 | 4.2, UF-06 — Kondisional Known Blocker dan Support Needed saat AMBER/RED |
| FR-05 | 4.2, 4.16a, UF-10, UF-22 — Baseline Morning terkunci pasca Cut-Off dan tata kelola koreksi |
| FR-06 | 4.3, UF-11 — Additional Work di tengah hari (5 alasan resmi) |
| FR-07 | 4.3, 4.4, UF-11, UF-12 — Additional Work tampil terpisah dari komitmen pagi dengan bobot setara |
| FR-08 | 4.4, UF-12 — Evaluasi EOD Outcome per item (4 status) |
| FR-09 | 4.4, UF-12 — Kontrol Continuation independen dan Continuation Reason wajib (termasuk saat Completed) |
| FR-10 | 4.4, UF-12 — Final Status harian dan Daily Risk Explanation wajib jika AMBER/RED |
| FR-11 | 4.2, 6, UF-09 — Koleksi draf copy-forward dari Morning Commitment berlanjut hari kerja sebelumnya tanpa auto-submit (`DEC-004`) |
| FR-12 | 4.2, 6, UF-06 — Role-Based Prompt Hint untuk **10 fungsi kanonikal resmi Dutamedia** + fallback netral inline italic visual placeholder (`DEC-005`, `DEC-009`) |
| FR-13 | 4.2, 4.4, UF-09, UF-12 — Deterministic Status Suggestion Engine + saran minimal AMBER pada carry-over ke-2 tanpa mengunci opsi GREEN (`DEC-003`) |
| FR-14 | 4.4, 6, UF-13 — ValidationPromptModal saat status pilihan berbeda dari saran sistem; tanpa silent mutation |
| FR-15 | 4.5, UF-15 — Pembuatan instant blocker kapan saja |
| FR-16 | 4.5, 4.9, UF-15, UF-16 — Taksonomi Blocker lengkap (10 Type, 4 Severity, 7 Impact resmi PRD) |
| FR-17 | 4.9, UF-16, UF-17, UF-18 — Siklus hidup blocker & konfirmasi Closed / Reopen oleh pelapor |
| FR-18 | 4.9, UF-17, UF-18, UF-20 — Wewenang Resolve (support owner), Close (pelapor), dan Accepted Risk (manajerial) |
| FR-19 | 4.5, 4.9, 4.13, 4.15, UF-15, UF-40 — Authority Context (Organizational default vs Project eksplisit) |
| FR-19a | 4.5, UF-15, 9 — Validasi penerima manual opsional terhadap status aktif, konteks kewenangan, dan scope |
| FR-19b | 4.5, 4.15, UF-15, UF-40 — Resolusi otomatis penerima awal, prioritas jenjang, dan fallback resmi terkonfigurasi |
| FR-19c | 4.5, 4.9, UF-15, 9 — Penanganan kondisi penerima tidak tersedia/ambigu tanpa klaim terkirim palsu & audit trail |
| FR-20 | 4.7, 4.9, 5, UF-15, UF-38 — Notifikasi dan eskalasi blocker |
| FR-21 | 4.9, 4.14, 5, UF-16, UF-32 — Auto-escalation berbasis SLA mengikuti hierarki bawaan 4 jenjang |
| FR-22 | 4.15, 4.24, UF-40, UF-43 — Master data akun dan struktur organisasi; CRUD server-authorized |
| FR-23 | 4.15, 4.24, 6, UF-40, UF-43 — Penugasan organisasi berpenanggalan efektif (`effectiveDate >= today`, `DEC-008`) |
| FR-24 | 4.6, 4.15, 4.24, UF-37, UF-40, UF-43 — Konteks organisasi historis tetap dipertahankan pada data lampau |
| FR-25 | 4.17, 6, UF-41 — Penugasan Temporary Reviewer wajib tanggal mulai (`effectiveDate >= today`) dan kedaluwarsa (`DEC-008`) |
| FR-26 | 4.2, 4.4, 5, UF-10, UF-14 — Klasifikasi waktu On-Time, Late, dan penolakan penuh pasca Cut-Off (`DEC-002`) |
| FR-27 | 4.12, 4.20, 4.21, UF-05, UF-25–UF-29 — Pengecualian sah (Holiday, Leave Approved, Bounded & Indefinite Exemption) |
| FR-28 | 4.7, 5, UF-38 — Pengingat tetap 60 menit sebelum On-Time Deadline |
| FR-29 | 4.11, 5, UF-33 — Deteksi pola berulang ambang tetap 3x No Submission sah dalam jendela evaluasi bergulir aktif |
| FR-30 | 4.11, UF-33 — Tidak ada sanksi atau surat peringatan otomatis dari sistem |
| FR-31 | 4.18, 4.19, UF-42 — Tata kelola kategori kebijakan multi-owner yang dapat dikonfigurasi |
| FR-32 | 4.18, 6, UF-42 — Manajemen versi kebijakan dengan tanggal efektif (`effectiveDate >= today`) |
| FR-33 | 4.18, UF-42 — Akses versi kebijakan historis |
| FR-34 | 2, 4.18, UF-42 — Visibilitas pengaturan kebijakan terfilter per kewenangan role pemilik |
| FR-35 | 4.2, 4.12, 4.18, UF-05, UF-28, UF-29 — Kebijakan pengecualian: Indefinite Role Exemption (open-ended) vs Bounded Individual Exemption (`DEC-004`) |
| FR-36 | 4.6, UF-37 — Akses riwayat akuntabilitas pribadi karyawan |
| FR-37 | 4.6, 4.8–4.9, 4.11, 4.21, 4.23, UF-30–UF-32, UF-39 — Filter antrean dan dashboard yang sadar izin akses |
| FR-38 | 4.7, 4.19, 5, UF-38 — Pengiriman nyata Email & Browser Push serta Web Notification Center |
| FR-39 | 4.10, UF-34 — Pencatatan tindak lanjut manajerial (Manager Note / Coaching Record) |
| FR-40 | 4.10, 4.16, UF-22–UF-24, UF-34 — Tidak ada pengubahan komitmen diam-diam oleh pimpinan |
| FR-41 | 4.6, 4.23, UF-37, UF-39 — Ringkasan berkala mingguan dan laporan tren bulanan |
| FR-42 | 4.6, 4.23, UF-37, UF-39 — Ekspor berkas terbatas sesuai scope yang aktif di layar (`AC-20`) |
| FR-43 | 4.16a, UF-22 — Pengajuan Morning Correction Request pasca Cut-Off |
| FR-44 | 4.16a, 4.22, UF-22, UF-24 — Tata kelola siklus hidup koreksi Minor vs Material & Objection Window |
| FR-45 | 4.16a, 4.6, UF-22, UF-37 — Audit trail dan visibilitas riwayat koreksi pagi |
| FR-46 | 4.12, UF-27, UF-28 — Penetapan hari libur dan pengecualian oleh Admin/HRGA langsung aktif seketika |
| FR-47 | 4.20–4.22, UF-25, UF-26 — Pengajuan Cuti mandiri dan persetujuan eksplisit oleh Authorized Approver |
| FR-48 | 4.11, 4.12, 4.20–4.22, 5, UF-05, UF-25–UF-29, UF-33 — Pengecualian sah & rekonsiliasi `Superseded by Approved Leave` (`DEC-007`) |
| FR-49 | 4.11, 5, UF-33 — Maksimal satu pencatatan kejadian No Submission per hari kerja yang berlaku |
| FR-50 | 4.1, 4.24, UF-01, UF-43 — Pendaftaran mandiri publik dilarang; akun dibuat oleh Admin di `/admin/users` (`DEC-005`) |
| FR-51 | 4.2, UF-06, UF-08 — Agregasi Initial Daily Status otomatis dan hanya-baca |
| FR-52 | 4.2, 4.4, UF-06, UF-12 — Tomorrow Priority tersimpan sebagai konteks pengingat non-binding |
| FR-53 | 4.16b, UF-23 — Pengajuan EOD Correction Request hanya untuk EOD yang pernah disubmit |
| FR-54 | 4.1, 4.24, 6, UF-01, UF-43 — Token aktivasi undangan sekali pakai dengan batas kedaluwarsa, resend, dan revoke |
| FR-55 | 4.16b, 4.22, UF-23, UF-24 — Tata kelola, larangan bypass, dan audit trail koreksi EOD |
| FR-56 | 4.23, UF-35 — Kerangka Transisi Kinerja (4 Dimensi: Delivery, Quality, Accountability, Collaboration) |
| FR-57 | 4.23, UF-35 — Penilaian kualitatif reviewer (Strong, Meets, Needs Improvement, Unacceptable) tanpa auto-skor |
| FR-58 | 4.23, UF-35 — Evaluasi kinerja komprehensif lintas periode (tidak ditentukan dari 1 hari buruk) |
| FR-59 | 4.23, UF-35 — Individual Review Evidence memisahkan fakta riwayat, Manager Note, dan penilaian |
| FR-60 | 4.23, UF-35 — WorkPulse bukan mesin penentu insentif otomatis; keputusan mengikuti kebijakan terpisah |
| FR-61 | 4.6, 4.11, UF-33, UF-37 — Satu status buruk tidak otomatis menggugurkan insentif atau memicu sanksi |
| FR-62 | 4.23, UF-35 — Data WorkPulse dilarang diubah menjadi KPI mentah tanpa persetujuan tata kelola formal |
| FR-63 | 4.2, 6, UF-07 — Commitment Quality Warning / Prompt saat teks terlalu umum/abstrak (`QualityWarningBadge`) |
| FR-64 | 4.6, 4.9, 6, UF-19 — Pencatatan Support Contribution pada blocker rekan kerja sebagai bukti kolaborasi |
| FR-65 | 4.6, 4.8, UF-30, UF-31 — Penampilan tren carry-over berulang dan dukungan lintas tim di dashboard/summary |
| FR-66 | 4.6, UF-37 — Personal Weekly Summary untuk karyawan tanpa gamifikasi atau skor perbandingan |
| FR-67 | 4.6, 4.23, UF-35, UF-37 — Komponen lengkap Weekly Accountability Summary & Individual Review Evidence |
| FR-68 | 4.8, UF-30, UF-31 — 6 Widget resmi dashboard Head / Supervisor (Status summary, Exceptions, Blockers by owner, Carry-over trend, Cross-project support, Weekly summary) |
| FR-69 | 4.8, UF-32 — 6 Widget resmi CEO / Management Dashboard (Company exception, Risk trend, Top recurring blockers, Compliance trend, Escalation aging, Critical incidents) |
| FR-70 | 4.11, UF-33 — Pembentukan compliance review event saat pattern flag No Submission terbentuk |
| FR-71 | 4.11, UF-33 — Pencatatan penjelasan karyawan, pembinaan, tindak lanjut, dan audit trail kepatuhan |
| FR-72 | 4.11, UF-33 — Rujukan disipliner formal hanya melalui aktor berwenang; sistem tanpa auto-SP |
| FR-73 | 4.10, 4.11, 6, UF-33, UF-34 — Penegakan Matriks Distingsi Kasus (§13.1 PRD) untuk respon adil dan proporsional |

### 10.2 Non-Functional Requirement Traceability

| ID | UI/UX consequence dan lokasi |
|---|---|
| NFR-01 | 4.0, 4.2–4.4, UF-04, UF-06, 9.1 — Kecepatan pengisian ≤3 menit; retensi input form saat gagal validasi / sesi habis |
| NFR-02 | 4.0, seluruh layar; UF-37–UF-39 — Antarmuka web responsif pada desktop dan perangkat bergerak |
| NFR-03 | 4.0, UF-02, 9.1 — Indikator feedback loading dan pencegahan submit ganda |
| NFR-04 | 9.1 — Tidak ada konfirmasi sukses palsu saat pemadaman jaringan |
| NFR-05 | 2, 3, 4.1, 4.8–4.25, UF-02, UF-43, UF-44, 9.1 — Navigasi sadar hak akses dan penegakan otorisasi server-side |
| NFR-06 | 4.6, 4.9–4.10, 4.15–4.18, 4.24, 6, UF-19, UF-22–UF-24, UF-34, UF-40–UF-43 — Jejak audit transparan dalam scope izin |
| NFR-07 | 4.8, 4.10–4.11, 4.23, 4.25, UF-30, UF-34, UF-37, UF-44 — Privasi data dan pembatasan akses data bawahan/pribadi |
| NFR-08 | 4.15, 4.17–4.19, 4.24, UF-40–UF-43 — Tata kelola kebijakan dan penugasan berpenanggalan efektif (`effectiveDate >= today`) |
| NFR-09 | 4.18, UF-42 — Retensi data operasional ditegakkan teknis tanpa nilai tebakan |
| NFR-10 | Di luar scope UI; SAD / Operasional — Pencadangan dan pemulihan data teknis |
| NFR-11 | 4.0, 4.6, 4.23, UF-37, UF-39, 9.1 — Ekspor data terbatas sesuai scope dan umpan balik kesalahan |
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
| AC-15 | 4.6, 4.9–4.10, 4.15–4.18, 4.24, UF-22–UF-24, UF-34, UF-40–UF-43 |
| AC-16 | 4.8, 4.23, UF-30 |
| AC-17 | 4.2–4.4, UF-06, 9.1; target uji usabilitas ≤3 menit |
| AC-18 | 4.16a, UF-22, UF-24 |
| AC-19 | 4.11, 4.20–4.22, 5, UF-25, UF-26, UF-33, 9 — Rekonsiliasi otomatis `Superseded by Approved Leave` pada audit trail append-only dan pengecualian dari ambang 3x `FR-29` (`DEC-007`) |
| AC-20 | 4.0, 4.6, 4.23, UF-37, UF-39 |
| AC-21 | 4.7, 4.19, 5, UF-38 |
| AC-22 | 4.7, 4.19, 5, UF-38 |
| AC-23 | 4.2, UF-09 — Koleksi draf eligible Morning Commitment hari kerja sebelumnya tanpa Additional Work, tanpa slot ke-4, tanpa auto-submit (`DEC-004`) |
| AC-24 | 4.4, UF-12 |
| AC-25 | 4.4, UF-12 |
| AC-26 | 4.11, 5, UF-33 |
| AC-27 | 4.4, UF-12, UF-13 |
| AC-28 | 4.2, UF-08 |
| AC-29 | 4.2, UF-06, UF-08 |
| AC-30 | 4.2, 4.4, UF-06, UF-12 |
| AC-31 | 4.16b, UF-23 |
| AC-32 | 4.16b, UF-23, UF-24 |
| AC-33 | 4.9, UF-17, UF-18, UF-20 |
| AC-34 | 4.1, 4.24, UF-01, UF-43 |
| AC-35 | 9.1; formula availability dan monitoring diatur di SAD |
| AC-36 | 4.1, 4.24, UF-01, UF-02, UF-43 |
| AC-37 | 4.2, 6, UF-06 — Role-Based Prompt Hint untuk **10 fungsi kanonikal resmi Dutamedia** + fallback netral inline italic placeholder (`DEC-005`, `DEC-009`) |
| AC-38 | 4.2, 4.4, UF-09, UF-12 — Saran status deterministik + cabang carry-over berulang hari ke-2 (minimal AMBER); opsi `GREEN` tidak pernah di-disable (`DEC-003`) |
| AC-39 | 4.4, UF-13 |
| AC-40 | 4.7, 5, UF-38 |
| AC-41 | 4.18, UF-42 |
| AC-42 | 4.6, 4.8–4.9, 4.11, 4.21, 4.23, UF-30–UF-32, UF-37, UF-39 |
| AC-43 | 4.10, UF-34 |
| AC-44 | 4.6, 4.23, UF-37, UF-39 |
| AC-45 | 4.12, UF-27–UF-29 |
| AC-46 | 4.5, 4.9, 4.13, 4.15, UF-15, UF-40 |
| AC-47 | 4.0, seluruh layar yang relevan; validasi responsif diuji pada prototipe |
| AC-48 | 9.1; patokan respons <2 detik diuji pada implementasi dan SAD |
| AC-49 | 4.8, 4.10–4.11, 4.23, UF-30, UF-33, UF-34; tanpa antarmuka pengawasan aktivitas invasif |
| AC-50 | 4.18, UF-42; penegakan masa retensi secara operasional |
| AC-51 | Verifikasi teknis non-UI pada SAD/operasional; tanpa layar backup mandiri pengguna |
| AC-52 | 4.7, 4.9, 4.14, 5, UF-15, UF-16, UF-38 |
| AC-53 | 2, 3, 4.1, 4.8–4.25, 9.1; visibilitas UI tidak menggantikan otorisasi server-side |
| AC-54 | 4.15, 4.24, 6, UF-40, UF-43 — CRUD akun/role/function/direct manager/reviewer/project authority dengan `effectiveDate >= today` (`DEC-008`) |
| AC-55 | 4.5, 4.9, UF-15, UF-16 — Taksonomi Blocker lengkap (10 Type, 4 Severity, 7 Impact) |
| AC-56 | 4.3, UF-11 |
| AC-57 | 4.2, 4.4, 5, UF-10, UF-14 — Klasifikasi On-Time, Late, dan penolakan penuh pasca Cut-Off (`DEC-002`) |
| AC-58 | 4.5, 4.15, UF-15, UF-40 — Organizational Authority sebagai default; Project Authority saat dipilih eksplisit; resolusi otomatis Owner Needed sesuai mapping efektif |
| AC-59 | 4.5, 4.15, UF-15, UF-40 — Direct Manager aktif sebagai kandidat awal Organizational Authority dan fallback resmi terkonfigurasi tanpa pemilihan arbitrer |
| AC-60 | 4.5, UF-15, 9 — Validasi pilihan manual Owner Needed terhadap status aktif, Authority Context, dan scope; penolakan input tidak sah tanpa konfirmasi sukses palsu |
| AC-61 | 4.5, 4.9, UF-15, 9 — Penanganan penerima tidak tersedia/ambigu tanpa klaim terkirim palsu, panduan langkah lanjut di UI, dan pencatatan audit trail resolusi kewenangan |
| AC-62 | 2, 3, 4.8, UF-02, UF-30–UF-32 — Visibilitas menu Pulse Dashboard terbatas bagi pemegang wewenang Team, Function, atau Management Pulse |
| AC-63 | 2, 3, 4.8, UF-02, UF-30–UF-32 — Pembatasan cakupan default dan pemilih mode Pulse Dashboard (Scope Switcher) sesuai role, permission, dan scope efektif pengguna multi-role |
| AC-64 | 2, 3, 4.8, 9.1 — Penolakan akses langsung ke rute/data Pulse Dashboard di luar izin (`403 Access Restricted State` & otorisasi server-side) |
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
| AC-82 | 4.10, 4.11, 6, UF-33, UF-34 — Penegakan Matriks Distingsi Kasus (§13.1 PRD) |

### 10.4 Rollout and Pilot Governance Traceability

| ID | Kriteria Tata Kelola Peluncuran & Uji Coba Pilot |
|---|---|
| RG-01 | Phase 0 menyelesaikan finalisasi cutoff, grace period, eskalasi, exemption, reviewer, dan batas disiplin |
| RG-02 | Pilot MVP 2–4 minggu pada divisi prioritas; evaluasi usability dan beban kerja sebelum company rollout |
| RG-03 | Company rollout setelah validasi pilot selesai; cakupan ~30 karyawan awal bukan batas permanen |
| RG-04 | Management review setelah 4–8 minggu data operasional berjalan |
| RG-05 | Integrasi KPI hanya dipertimbangkan setelah organisasi stabil lewat tata kelola terpisah |
| RG-06 | Evaluasi pilot mengacu pada Pilot Success Metrics (PSM-01 s/d PSM-07) |

### 10.5 Boundary dan Keputusan yang Tidak Boleh Diasumsikan

- **FR-12 / AC-37 (`DEC-005`, `DEC-009`):** Panduan output berdasarkan fungsi organisasi telah dikunci definitif untuk **10 fungsi kanonikal resmi Dutamedia** (`Engineering`, `Quality`, `Operations & Infrastructure`, `R&D`, `Delivery`, `Business Development`, `Sales Enablement & Presales`, `Finance`, `HRGA`, dan `Management`) + fallback netral. Hint tampil pada seluruh slot #1–#3 sebagai placeholder visual miring (*italic*) saat kosong, menghilang saat diketik, bersifat non-binding, tidak mengontaminasi nilai input form, dan tidak disimpan ke database.
- **Carry-Over Berulang & Larangan Penguncian GREEN (`DEC-003`):** Pada Morning Check-in ditampilkan `CarryOverBadge` informatif dan pada EOD Status Suggestion Engine disarankan minimal `AMBER` untuk carry-over ke-2 berturut-turut, namun antarmuka **dilarang mengunci atau menonaktifkan (`disabled`) opsi `GREEN`** baik di Morning maupun di EOD.
- **Persetujuan Cuti Pasca-Cut-Off / AC-19 (`DEC-007`):** Leave Request yang masih `Pending` saat Cut-Off tidak mengecualikan tanggal terkait. Namun, apabila Leave Request baru disetujui (*Approved*) setelah Cut-Off pada tanggal di mana event `No Submission` sempat tercatat, hari tersebut otomatis direkonsiliasi menjadi `Approved Leave`, event `No Submission` lama tetap dipertahankan secara *append-only* pada *audit trail* dengan status `Superseded by Approved Leave`, dan dikeluarkan dari hitungan ambang 3 kejadian `FR-29`.
- **Larangan Backdating Struktur Organisasi & Delegasi (`DEC-008`):** `Effective Date` pada `OrganizationalAssignment`, `ProjectAuthorityMapping`, dan `TemporaryReviewerAssignment` hanya menerima **hari ini atau masa depan** (`effectiveDate >= today` menurut zona waktu organisasi). Input tanggal lampau ditolak dengan pesan error inline yang jelas agar konteks akuntabilitas historis tidak dapat dimanipulasi surut.
- **Nilai Operasional (`OPEN-04` — MVP Launch Configuration Register):** Nilai konkret untuk deadline, Grace Period, workday calendar, Objection Window, klasifikasi Minor/Material, threshold eskalasi, retention, invitation expiry, maintenance notice, dan availability service hours wajib mengikuti *MVP Launch Configuration Register* yang disahkan manajemen sebelum implementasi. Angka jam/durasi pada dokumen ini maupun prototipe HTML murni contoh ilustrasi visual, bukan nilai produksi hasil tebakan.
- **NFR Teknis:** Backup/restore, enkripsi transport, benchmark <2 detik, dan perhitungan availability diverifikasi pada `05-SAD.md` dan implementasi; dokumen UI/UX ini hanya menetapkan state antarmuka dan batas perilaku yang relevan.
- **Browser Push:** Matriks channel mengikuti persis PRD Section 8. Permission merupakan kondisi browser/perangkat masing-masing pengguna, bukan atribut global yang dapat dibuktikan melalui test-send dari browser Admin.

---

## Riwayat Revisi

### Riwayat Revisi v2.0.0 — FINAL (Mandiri, Rekonsiliasi DEC-001..DEC-009, & Pengayaan Ergonomi Antarmuka)
- Memperbarui seluruh acuan normatif ke **PDD v1.5 FINAL** dan **PRD v1.6 FINAL**, serta melepaskan seluruh ketergantungan/rujukan ke dokumen arsitektur Pengerjaan Lama sehingga dokumen ini **100% mandiri** (`DEC-006`).
- Menambahkan **Section 4.0 (Konvensi Ergonomi & Perilaku Lintas-Halaman)** serta menyerap seluruh pola UX/ergonomi yang valid dari dokumen pendamping lama (`DailyWorkflowStepBar`, `MasterDetailSplitWorkbench`, `InteractiveMetricFilterCard`, `LiveRoutePreviewBox`, `ImpactPreviewModal`, `SideBySideDiffPanel`, `AuditTrailTimeline`, `CaseDistinctionCallout`, `TriggerDateCapsules`, `PasswordStrengthMeter`, dan `SessionLockModal`) sebelum pengarsipan dokumen bayangan ke `_Archive/` (`DEC-001`).
- Menegaskan pemisahan rute dan spesifikasi layar **`4.24 Admin: User & Invitation Management (/admin/users)`** (`UF-43`) dari **`4.15 Admin: Organizational Mapping (/admin/organization)`** (`UF-40`), serta menambahkan spesifikasi eksplisit **`4.25 Profile & Account Settings (/profile)`** (`UF-44`) dan sub-rute autentikasi publik (`DEC-005`).
- Memperluas taksonomi `RoleBasedPromptHint` (`FR-12` / `AC-37`) dari 7 fungsi menjadi **10 fungsi kanonikal resmi Dutamedia** dengan teks contoh Bahasa Indonesia resmi + fallback netral (`DEC-005`, `DEC-009`).
- Menyinkronkan aturan bisnis hasil keputusan proyek pada seluruh layar, komponen, user flows, dan kontrak state: penolakan penuh pasca-Cut-Off (`DEC-002`), larangan penguncian opsi `GREEN` pada carry-over berulang (`DEC-003`), ketiadaan tombol *"Hentikan Pekerjaan"* di pagi hari & pemisahan Dinas Luar via Bounded Exemption (`DEC-004`), rekonsiliasi cuti pasca-Cut-Off `Superseded by Approved Leave` (`DEC-007`), serta larangan *backdating* `effectiveDate >= today` (`DEC-008`).
- Memperbaiki konsistensi semantik badge pada narasi User Flows (`On-Time` sebagai biru info `timing.ontime`, `Accepted Risk` sebagai amber/oranye informasional `workflow.accepted-risk`), membersihkan karakter emoji Unicode, melengkapi **baris `AC-58` s/d `AC-64`** yang sebelumnya terlewat pada §10.3, serta menghapus duplikasi blok penutup dokumen.

### Riwayat Revisi v1.9.0 — FINAL (Comprehensive User-Centric Flows)
- Mengubah seluruh Section 7 menjadi User Flows Interaktif yang berorientasi pada pengalaman nyata pengguna manusia di depan layar (User Goals, Steps, UI Decision Nodes, Modals, & Visual Feedback).
- Mengintegrasikan seluruh requirement dari Baseline Reconciliation Addendum PRD v1.5: Commitment Quality Warning Prompt (`FR-63` / `AC-72`), Pencatatan Support Contribution lintas tim (`FR-64` / `AC-73`), Individual Review Evidence & Performance Transition Framework 4 Dimensi (`FR-56`–`FR-59` / `AC-65`–`AC-68`), Penegakan Matriks Distingsi Kasus Kepatuhan (§13.1 PRD, `FR-70`–`FR-73` / `AC-79`–`AC-82`), 6 Widget Resmi Dashboard Head/Supervisor (`FR-68` / `AC-77`), dan 6 Widget Resmi Dashboard CEO/Management Trend (`FR-69` / `AC-78`).
- Memperbarui Section 10 Traceability Map mencakup `FR-01` s/d `FR-73`, `NFR-01` s/d `NFR-12`, `AC-01` s/d `AC-82`, dan Governance Criteria `RG-01` s/d `RG-06`.

### Riwayat Revisi v1.8.0 — FINAL
- Memperbarui referensi dokumen induk ke PDD v1.4 dan PRD v1.5.
- Menetapkan spesifikasi awal Role-Based Prompt Hint (`FR-12` / `AC-37`), alur Indefinite Role Exemption (`FR-35` / `BR-07`), taksonomi Blocker 10 Type / 4 Severity / 7 Impact (`FR-16` / `AC-55`), aksi `Reopen / Needs Further Work`, serta heuristik Status Suggestion Engine pada carry-over berulang ke-2 (`FR-13` / `AC-38`).

### Riwayat Revisi v1.7.2 & v1.6 & v1.5
- v1.7.2: Sinkronisasi arsitektur navigasi dan sidebar layout dengan PDD v1.4 dan PRD v1.4.
- v1.6: Menyelaraskan flow Raise Instant Blocker (`FR-19` s/d `FR-19c`): Authority Context default, pilihan Owner Needed opsional, resolusi otomatis, validasi, fallback, kondisi ambigu, dan audit trail.
- v1.5: Memisahkan Morning Correction Request dan EOD Correction Request, menetapkan 0 Commitment dengan alasan wajib (`NOT_APPLICABLE — NO_COMMITMENT`), Initial Daily Status hanya-baca, lifecycle blocker `Resolved` → pelapor mengonfirmasi `Closed`, aktivasi undangan sekali pakai, Browser Push delivery states, dan cutoff semantics.


