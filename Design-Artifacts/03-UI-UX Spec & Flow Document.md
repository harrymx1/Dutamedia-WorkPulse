# UI/UX Specification & Flow Document
## WorkPulse — Daily Accountability & Blocker Log System

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.2 |
| Status | Ready for Design Phase |
| Date | September 2026 |
| Referensi | PDD v1.1, PRD v1.1 |

> Dokumen ini mendefinisikan **alur interaksi dan perilaku** sistem berdasarkan requirement di PRD — bukan visual (warna, tipografi, spacing → Design System) dan bukan mockup/screen file (→ UI/UX Design). Keputusan teknis (skema data, exact matching logic, dsb.) bukan wilayah dokumen ini → System Architecture Design.

---

## 1. Prinsip Desain

| Prinsip | Penerapan |
|---|---|
| **Speed over completeness** | Check-in harian adalah aksi paling sering dilakukan — interaksi harus meminimalkan ketukan/ketikan, bukan memaksimalkan field yang bisa diisi |
| **Status is always visible** | GREEN/AMBER/RED dan submission timing harus terlihat tanpa harus membuka detail |
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
| Employee | My Today, My History, **My Leave Request** , Notifications, Profile |
| Supervisor/TL | + Team Pulse (scoped), Blocker Queue (scoped), **Correction & Leave Review (jika Authorized Reviewer)**  |
| Head | + Function Pulse, Blocker & Escalation Queue (function-scoped), Coaching Notes, **Reports (function-scoped)** |
| PM | My Today, My History + Project Risk (reference-based, scoped) |
| HRGA | Compliance Queue, **Leave Approval (compliance-scoped)** , Exemption Management, Coaching/Warning Record (sesuai kewenangan), **Reports (compliance-scoped)**  |
| CEO/Management | Management Pulse Dashboard (company-wide), Escalation Aging, **Reports (company-wide)** |
| System Admin | Admin: User & Org, Temporary Reviewer, Notification Setup |

> `[REVISI v1.2]` **Policy Settings bukan lagi menu eksklusif System Admin.** Menu "Policy Settings" muncul untuk **role mana pun yang punya minimal satu kategori kebijakan sebagai kewenangannya** (sesuai FR-34/BR-15) — isinya di-filter per kategori yang jadi authority-nya masing-masing. Lihat Section 4.18.

User dengan multi-role (mis. Head yang juga mengisi check-in sendiri) tetap punya akses "My Today" sebagai Employee — role tambahan menambah menu, tidak menggantikan menu dasar.

---

## 3. Information Architecture

```
/login

/today
  /today/morning                     Morning Commitment
  /today/morning/correction-request  Correction Request (pasca Cut-Off, jika diizinkan policy)
  /today/additional-work             Add Additional Work
  /today/eod                         EOD Outcome & Continuation
  /today/raise-blocker               Raise Instant Blocker
  /today/leave-request               [BARU v1.2] Ajukan Leave Request

/history                             My History & Weekly Summary
/history/:date                       Detail satu hari

/notifications                       Web Notification Center
/profile                             Profile & Settings

/team                                Team Pulse Dashboard (Supervisor/TL)
/team/blockers                       Blocker Queue (scoped)
/team/reviews                        [BARU v1.2] Correction & Leave Review Queue (scoped, jika Authorized Reviewer)

/function                            Function Pulse Dashboard (Head)
/function/coaching                   Manager Note / Coaching Record
/function/escalations                Blocker & Escalation Queue (function-scoped)

/my-scope/project-risk               Project Risk View (PM) — agregasi berbasis Reference/Task

/compliance                          Compliance Queue (HRGA)
/compliance/exemptions               Exemption Management (Holiday & individual Exemption — admin-set)
/compliance/leave-approvals          [BARU v1.2] Leave Approval Queue
/compliance/records                  Coaching/Warning Record (permission ketat)

/management                          Management Pulse Dashboard (CEO)
/management/escalations              Escalation Aging (company-wide)

/reports                             [BARU v1.2] Reports (scope mengikuti role — lihat 4.23)

/policy-settings                     [REVISI v1.2] Policy Settings (multi-owner, filtered per kategori kewenangan)

/admin/users                         User & Role Management
/admin/organization                  Organizational Mapping (effective-dated)
/admin/temporary-reviewer            Temporary Reviewer Assignment
/admin/notifications                 Notification Channel Setup
```

---

## 4. Spesifikasi Halaman (Behavior, bukan Visual)

### 4.1 Login
- Autentikasi standar; redirect berdasarkan role default ke `/today`.
- Tidak ada opsi self-registration di halaman ini atau di mana pun dalam aplikasi — akun disediakan oleh System Admin melalui Organization Master Data. Alur "lupa password" tersedia, tapi bukan alur pembuatan akun baru.

### 4.2 My Today — Morning Commitment
- Menampilkan hingga 3 slot Commitment; slot kosong menampilkan CTA "Add Commitment".
- Tiap Commitment: teks, Reference/Task Link (opsional), Initial Risk (GREEN/AMBER/RED).
- Saat user mengetik teks Commitment, sistem menampilkan **Role-Based Output Prompt** sebagai contoh/placeholder kontekstual sesuai fungsi user (mis. Developer melihat contoh "Feature X completed", QA melihat contoh "Test case Y executed") — bersifat *inline suggestion*, tidak mengunci format; user tetap bebas menulis bebas.
- Memilih AMBER/RED membuka field Known Blocker & Support Needed secara **conditional** (muncul, bukan disabled).
- Jika tersedia draft copy-forward dari hari sebelumnya: ditampilkan sebagai **draft bertanda jelas**, disertai tombol "Confirm" (submit apa adanya) atau "Edit" — tidak pernah submit otomatis tanpa aksi user.
- Setelah Cut-Off: form menjadi read-only dengan indikator "Baseline Locked"; jika policy mengizinkan perubahan pasca-cutoff, tombol "Request Correction" mengarahkan ke `/today/morning/correction-request` (lihat 4.16) — tidak ada edit langsung, **tidak ada pengecualian sekecil apa pun** `[REVISI v1.2]`.

### 4.3 Add Additional Work
- Form terpisah dari Morning Commitment (bukan slot ke-4).
- Field: deskripsi, Reason (dropdown: Newly Assigned / Missed in Planning / Priority Change / Operational-Incident / Other).
- Reason = Newly Assigned → field "Assigned By" muncul dan wajib diisi sebelum submit.
- Additional Work yang sudah dibuat tetap muncul terpisah secara visual dari Commitment 1–3 di sepanjang hari (termasuk saat EOD), dengan bobot tampilan yang setara — bukan sebagai catatan kecil/sekunder.

### 4.4 My Today — EOD Outcome
- Menampilkan seluruh Commitment + Additional Work hari itu sebagai list, masing-masing diberi perlakuan setara.
- Per item: **dua kontrol terpisah** — Outcome (Completed/Partially Completed/Not Completed/Cancelled) dan Continuation (Continue/Do Not Continue) — ditampilkan berdampingan, tidak digabung jadi satu dropdown.
- Continuation = Continue dan Outcome ≠ Completed → field Continuation Reason muncul wajib.
- Field Final Status (GREEN/AMBER/RED) di level hari, bukan per item.
- Jika Status Suggestion Engine menyarankan status berbeda dari pilihan user (mis. user pilih GREEN tapi ada critical blocker tercatat) → **validation prompt modal** muncul, meminta user memilih: tetap dengan alasan, atau ubah ke status yang disarankan. Tidak ada auto-override.
- Tombol "Tomorrow Priority" opsional — mengisi field ini menyiapkan draft copy-forward besok.

### 4.5 Raise Instant Blocker
- Dapat diakses kapan saja dari mana pun (tidak terkunci ke siklus Morning/EOD), termasuk saat baseline sudah locked.
- Form: Type, Severity, Impact, Owner Needed (lihat 4.9 authority context), Expected Resolution (opsional).
- Submit langsung memicu notifikasi ke Owner Needed sesuai Escalation Rules (Section 5).

### 4.6 My History & Weekly Summary
- List/kalender per hari dengan status badge; klik → detail hari tersebut (read-only).
- Tiap hari menampilkan **dua dimensi berdampingan**: submission timing (On-Time/Late/No Submission) dan Final Status (GREEN/AMBER/RED) — tidak digabung jadi satu badge, karena keduanya menjawab pertanyaan berbeda.
- Weekly Summary: agregat Commitments, distribusi Outcome, Status Days, Recurring pattern Continuation, Support Given, Open Escalations, Manager Notes yang boleh dilihat user.
- Riwayat Correction Request (Applied/Rejected) milik user ikut tampil di detail hari terkait, dengan tautan ke detail pengajuannya. 
- `ExportButton` tersedia untuk export histori/weekly summary milik sendiri sebagai evidence pribadi. 

### 4.7 Web Notification Center
- List notifikasi terurut waktu, dengan indikator dibaca/belum.
- Setiap notifikasi menautkan langsung ke konteksnya (mis. klik notifikasi blocker → langsung ke blocker terkait).

### 4.8 Team Pulse / Function Pulse / Management Pulse Dashboard
Pola sama di ketiga level (scope berbeda: team/scoped, function, company-wide):
- **Exception-first layout**: bagian teratas menampilkan RED, unacknowledged blocker, dan no-submission.
- Widget status summary (count GREEN/AMBER/RED/No Submission) di scope masing-masing.
- Open blockers by owner — menunjukkan siapa yang perlu bertindak.
- Recurring Continuation "Continue" trend per task/area.
- Tidak ada bentuk apa pun dari ranking/leaderboard individual di dashboard mana pun.
- Widget ringkas "Pending Correction Request (Material)" dan "Pending Leave Request" yang butuh perhatian reviewer dalam scope ini, dengan tautan ke 4.16b/4.21. 

### 4.9 Blocker & Escalation Queue
- List blocker sesuai scope, dengan filter Type/Severity/Status menggunakan `FilterBar`. `[REVISI v1.2]`
- Row/detail menampilkan Owner Needed berdasarkan **authority context**: sistem menandai apakah owner ditentukan lewat Organizational Authority (default) atau Project Authority (dipilih eksplisit) — perbedaan ini terlihat jelas di UI, bukan disamarkan sebagai satu "assignee" generik.
- Action button yang tampil **hanya sesuai state blocker saat ini** (Open → Acknowledge; Acknowledged/In Progress → Update/Resolve/Accepted Risk; dst.) — action tidak relevan tidak ditampilkan (bukan ditampilkan lalu disabled).
- Resolve/Accepted Risk mewajibkan Resolution Note sebelum konfirmasi final.

### 4.10 Manager Note / Coaching Record
- Form membuat note dengan tipe: Recognition / Coaching / Corrective.
- Visibility note diatur eksplisit saat pembuatan (siapa yang boleh melihat), sesuai permission model PRD Section 7.
- Employee hanya melihat note yang eksplisit ditandai visible ke dirinya di halaman History-nya.

### 4.11 Compliance Queue (HRGA)
- Menampilkan flag repeated non-submission dan compliance event lain, dengan status tindak lanjut (Reminder Sent / Coaching / Recorded Warning / Escalated), dengan `FilterBar`. `[REVISI v1.2]`
- Tidak ada tombol "Issue SP" atau sejenisnya di sistem — hanya pencatatan evidence; proses disipliner formal berlangsung **di luar sistem**.

### 4.12 Exemption Management `[REVISI v1.2 — scope dipersempit]`
- **Khusus Holiday dan individual Exemption** (bukan Leave — lihat 4.20/4.21 untuk Leave).
- Admin/HRGA menandai tanggal sebagai Holiday (company-wide) atau Exemption (individual, mis. dinas/offsite) dengan effective period — memengaruhi No Submission detection secara langsung, **tanpa approval tambahan** (berbeda dari Leave yang wajib approval, lihat 4.21).
- Header halaman menampilkan catatan singkat yang membedakan: *"Holiday & Exemption berlaku langsung setelah disimpan. Untuk Leave karyawan, lihat Leave Approval Queue."*

### 4.13 Project Risk View (PM)
- Menampilkan agregasi Commitment/Additional Work milik anggota tim yang mereferensikan Reference/Task Link yang sama, **bukan** query terhadap entitas Project formal (tidak ada entitas Project di PRD — reference bersifat teks bebas/manual di MVP).
- Menyorot item berstatus AMBER/RED atau Continuation "Continue" berulang di antara referensi yang sama.
- Exact matching vs pengelompokan longgar atas nilai reference adalah keputusan teknis → System Architecture Design; dokumen ini hanya menetapkan kebutuhan behavior-nya.

### 4.14 Escalation Aging (CEO/Management)
- List seluruh blocker berstatus Open/Acknowledged/In Progress yang melewati threshold waktu tertentu, diurutkan dari yang paling lama belum resolve.
- Menampilkan Authority Context (siapa saat ini bertanggung jawab) dan riwayat auto-escalation jika ada.
- Read-only bagi CEO/Management — aksi resolve tetap hanya milik owner yang berwenang (lihat 4.9).

### 4.15 Admin: Organizational Mapping
- List struktur organisasi saat ini + tombol "View History" per person/role untuk melihat assignment sebelumnya (effective-dated).
- Perubahan assignment (create/edit/reassign) selalu meminta **Effective Date**; tidak ada opsi "langsung berlaku retroaktif" yang mengubah histori.
- Perubahan yang mempengaruhi hierarki (direct manager, project authority) menampilkan preview dampak sebelum konfirmasi (siapa yang terpengaruh, mulai kapan).
- Project Authority ditampilkan sebagai **mapping terpisah per person**, bisa lebih dari satu baris aktif sekaligus untuk scope/reference berbeda — bukan satu field tunggal dalam baris Organizational Assignment. `[BARU v1.2 — mengikuti PRD-R5]`

### 4.16 Correction Request (pasca Cut-Off) `[REVISI v1.2 — model final]`

**4.16a — Sisi Employee (mengajukan)**
- Muncul sebagai opsi hanya jika policy mengizinkan perubahan baseline pasca-cutoff (BR-02/FR-05).
- Form: perubahan yang diminta (before ditampilkan read-only, after diisi user) + Reason wajib.
- Setelah submit, sistem otomatis mengklasifikasikan sebagai **Minor** atau **Material** (rule configurable — mis. perubahan teks kecil/typo = Minor, perubahan makna commitment/outcome = Material). Klasifikasi ditampilkan ke user via `ClassificationTag`.
  - **Minor** → langsung berstatus **Applied**, baseline berubah seketika, audit trail tercatat. User melihat konfirmasi instan.
  - **Material** → berstatus **Pending**, masuk **Objection Window** (durasi configurable, ditampilkan sebagai countdown via `ObjectionWindowIndicator`). Baseline **belum berubah** selama window berjalan.
- Employee melihat status pengajuannya (Pending/Applied/Rejected) di halaman yang sama dan di My History; tidak ada silent overwrite terhadap baseline asli.
- Jika window berakhir tanpa objection → otomatis **Applied**. Jika ada objection dari Authorized Reviewer → **Rejected**, baseline asli tetap berlaku, employee melihat alasan objection.

**4.16b — Sisi Reviewer (objection)** 
- Halaman `/team/reviews` menampilkan list Correction Request Material yang **sedang** dalam Objection Window dalam scope reviewer, dengan `ObjectionWindowIndicator` per baris (sisa waktu sebelum auto-applied).
- Reviewer **tidak wajib membuka/menindaklanjuti** setiap item — ini bukan approval queue yang harus dikosongkan, melainkan daftar yang bisa diabaikan (default-approve tetap berjalan).
- Aksi yang tersedia hanya: **Object** (wajib isi alasan) selama window masih berjalan. Setelah window lewat, item hilang dari daftar aktif (sudah Applied) dan hanya terlihat di riwayat.

### 4.17 Admin: Temporary Reviewer
- Form assignment: reviewer, scope, Effective Date, Expiry Date (wajib diisi, tidak boleh open-ended tanpa batas).
- List assignment aktif menampilkan hitung mundur ke expiry; setelah expiry, otomatis tidak lagi menerima eskalasi tanpa perlu aksi manual admin.

### 4.18 Policy Settings `[REVISI v1.2 — multi-owner]`
- Diakses lewat `/policy-settings`, **bukan lagi rute khusus Admin** — halaman ini terbuka untuk role apa pun, tapi isinya di-filter penuh sesuai kategori kebijakan yang jadi kewenangan role/user tersebut (FR-34/BR-15).
- Tiap kategori kebijakan (cutoff, grace period, workday calendar, escalation threshold, retensi, **Objection Window duration**, **batas Minor/Material**, dll.) memiliki halaman/section sendiri.
- User yang membuka halaman ini hanya melihat kategori yang authority-nya dia pegang — kategori lain **tidak ditampilkan sama sekali** (disembunyikan, bukan disabled dengan tooltip), konsisten dengan behavior lama.
- Perubahan nilai kebijakan selalu membuat **versi baru** dengan Effective Date — tidak ada "overwrite" nilai lama secara langsung; versi lama tetap tersimpan dan terlihat di riwayat lewat `PolicyVersionHistory`.
- Contoh konkret: System Admin melihat section Cutoff/Grace Period/Workday Calendar; Head/Management (jika ditetapkan sebagai Authorized Policy Owner untuk kategori tsb) melihat section Coaching Follow-up Period; HRGA melihat section Retention Policy untuk evidence disciplinary — semuanya di halaman yang sama, hanya section yang beda.

### 4.19 Admin: Notification Channel Setup
- Konfigurasi Email/Browser Push per jenis trigger notifikasi; test-send tersedia sebelum simpan.

### 4.20 My Leave Request (Employee) 
- Form: tanggal/date range, Reason (opsional teks bebas).
- Submit → status **Pending**, notifikasi terkirim ke Authorized Approver dalam scope employee (Supervisor/Head/HRGA sesuai policy).
- Employee melihat status pengajuan (Pending/Approved/Rejected) di halaman ini dan di My History; tanggal yang diajukan ditandai visual sebagai "Leave (Pending)" sampai disetujui — **belum** mengecualikan dari No Submission selama masih Pending.
- Setelah Approved → tanggal otomatis dikecualikan dari No Submission detection (FR-48), badge berubah jadi "Leave (Approved)".

### 4.21 Leave Approval Queue (Reviewer/HRGA) 
- List Leave Request Pending dalam scope reviewer, dengan `FilterBar` (per employee, per tanggal, per status).
- Aksi: **Approve** atau **Reject** (Reject wajib isi alasan singkat).
- Berbeda dari Correction Request — Leave **bukan** default-approve; tetap butuh aksi eksplisit approve/reject sebelum berlaku, karena dampaknya (mengecualikan dari No Submission) butuh validasi aktif, bukan sekadar koreksi data historis.

### 4.22 Correction & Leave Review (gabungan, entry point reviewer) 
- `/team/reviews` adalah entry point tunggal yang menggabungkan dua tab: **Pending Objection** (4.16b) dan **Pending Leave Approval** (4.21) — supaya reviewer tidak perlu berpindah halaman untuk dua jenis "hal yang menunggu keputusan" ini.
- Badge count di menu navigasi menjumlahkan kedua tab, tapi tab tetap terpisah secara visual karena sifatnya berbeda (satu default-approve, satu wajib approve eksplisit) — tidak boleh disamarkan seolah sama.

### 4.23 Reports 
- Diakses lewat `/reports`, scope mengikuti role yang membuka (Head → function-scoped, HRGA → compliance-scoped, CEO/Management → company-wide), mengikuti Permission & Visibility Requirements (PRD Section 7).
- Tab per jenis laporan (sesuai PRD Section 9):
  - **Daily Exception Report** — snapshot RED/AMBER/no-submission/critical blocker hari terpilih
  - **Weekly Team Summary** — agregat mingguan dalam scope
  - **Monthly Management Trend** — trend per fungsi, recurring root cause, escalation aging, compliance pattern (khusus CEO/Management)
  - **Individual Review Evidence** — histori satu employee untuk periode terpilih (khusus authorized manager/HR, atau employee untuk dirinya sendiri)
  - **Blocker Root Cause Report** — kategori blocker paling sering & systemic bottleneck
- Filter periode/tanggal via `FilterBar` di setiap tab.
- `ExportButton` tersedia di tiap tab, mengekspor **hanya** data yang sedang terlihat di layar (scope yang sama, tidak lebih luas) — sesuai AC-20.
- Tab yang muncul disesuaikan permission user yang membuka (mis. Supervisor/TL tidak melihat tab Monthly Management Trend karena bukan scope-nya).

---

## 5. Escalation & Notification Interaction Rules

- RED atau critical blocker → notifikasi terkirim **segera** (tidak menunggu batch/summary harian).
- Unacknowledged RED melewati threshold configurable → sistem otomatis mengirim ke level eskalasi berikutnya, dan UI blocker terkait menampilkan indikator "Auto-escalated" agar riwayatnya jelas (bukan terlihat seolah dikirim manual).
- Semua notifikasi (apa pun channel pengirimannya) selalu tercatat di Web Notification Center — Email/Push adalah delivery, bukan satu-satunya sumber kebenaran status baca.
- Correction Request Material yang mendekati akhir Objection Window mengirim **reminder terakhir** ke reviewer sebelum auto-applied — supaya default-approve tidak terasa seperti "keputusan diam-diam", reviewer selalu punya kesempatan terakhir yang eksplisit ditandai. 
- Leave Request yang Pending terlalu lama (threshold configurable) memicu reminder ke Approver — karena Leave, beda dengan Correction Request, tidak auto-approve, jadi bisa menggantung kalau tidak diingatkan. 

---

## 6. Komponen Reusable (Fungsional, bukan Visual)

| Komponen | Fungsi | Dipakai di |
|---|---|---|
| `StatusBadge` | Menampilkan GREEN/AMBER/RED secara konsisten | Seluruh halaman dengan status |
| `SubmissionTimingBadge` | Menampilkan On-Time/Late/No Submission — terpisah dari StatusBadge | History, Compliance Queue |
| `CommitmentCard` | Satu unit commitment/additional work + outcome + continuation | Morning, EOD, History |
| `BlockerCard` | Detail blocker + action panel sesuai state saat ini | Raise Blocker, Blocker Queue |
| `ActionPanel` | Menampilkan hanya aksi valid untuk state saat ini | Blocker Queue, Compliance Queue |
| `AuthorityTag` | Menandai apakah suatu assignment berasal dari Organizational atau Project Authority | Blocker, Escalation, Org Mapping |
| `EffectiveDatePicker` | Input tanggal efektif dengan validasi tidak retroaktif untuk perubahan struktural | Admin: Org Mapping, Temporary Reviewer, Policy Settings |
| `PolicyVersionHistory` | Menampilkan riwayat versi suatu kebijakan | Policy Settings |
| `ValidationPromptModal` | Modal konfirmasi saat status suggestion berbeda dari pilihan user | EOD Check-in |
| `ExceptionSummaryWidget` | Ringkasan count status + exception list di scope tertentu | Team/Function/Management Dashboard |
| `NotificationBell` | Indikator unread + dropdown ke Web Notification Center | Global topbar |
| `DraftBanner` | Menandai data sebagai draft copy-forward yang perlu konfirmasi | Morning Commitment |
| `LockedIndicator` | Menandai baseline yang sudah terkunci pasca Cut-Off, dengan alasan eksplisit | Morning Commitment (setelah cutoff) |
| `RoleBasedPromptHint` | Menampilkan contoh output kontekstual sesuai fungsi user | Morning Commitment |
| `ClassificationTag`  | Menandai Correction Request sebagai Minor atau Material | Correction Request (4.16a, 4.16b) |
| `ObjectionWindowIndicator` | Countdown sisa waktu Objection Window sebelum auto-applied | Correction Request (4.16a, 4.16b) |
| `FilterBar` | Filter lintas dimensi (employee/function/project/date/status/blocker category) sesuai FR-37 | Team/Function/Management Pulse, Blocker & Escalation Queue, Compliance Queue, My History, Reports, Leave Approval Queue |
| `ExportButton`  | Memicu export data sesuai scope yang sedang terlihat di layar (FR-42/AC-20) | Reports, My History |

---

## 7. User Flows

### 7.1 Morning Check-in
```
Login → /today/morning
  → Draft copy-forward tersedia?
      Ya → tampil sebagai draft bertanda → user Confirm / Edit
      Tidak → form kosong (dengan Role-Based Output Prompt sebagai hint)
  → Isi hingga 3 Commitment + Initial Risk
  → Initial Risk = AMBER/RED → field Blocker & Support Needed wajib
  → Submit sebelum Cut-Off → tersimpan sebagai baseline
  → Submit setelah Cut-Off → ditolak; jika policy mengizinkan → arahkan ke Correction Request (7.11)
```

### 7.2 Additional Work
```
Kapan saja setelah Morning Check-in
  → /today/additional-work → isi deskripsi + Reason
  → Reason = Newly Assigned → wajib isi Assigned By
  → Submit → muncul sebagai item terpisah (bobot setara) di My Today, ikut masuk siklus EOD
```

### 7.3 EOD Check-in
```
/today/eod → list semua Commitment + Additional Work hari itu
  → per item: pilih Outcome + Continuation secara independen
  → Continuation = Continue & Outcome ≠ Completed → wajib isi Continuation Reason
  → pilih Final Status (GREEN/AMBER/RED)
      → Status tidak konsisten dengan data (mis. GREEN + critical blocker)
          → ValidationPromptModal → user pilih: tetap + alasan, atau ubah status
  → (opsional) isi Tomorrow Priority → jadi draft copy-forward besok
  → Submit → EOD tersimpan; Daily Accountability Record hari itu selesai
```

### 7.4 Raise Instant Blocker (kapan saja)
```
Trigger dari mana saja (termasuk saat baseline locked)
  → /today/raise-blocker → isi Type, Severity, Impact, Owner Needed
  → Owner Needed ditentukan: Organizational Authority (default) atau pilih Project Authority (jika relevan)
  → Submit → notifikasi langsung ke Owner Needed sesuai Escalation Rules
```

### 7.5 Blocker Lifecycle (sisi penerima)
```
Owner menerima notifikasi (Email/Push + Web Notification Center)
  → buka Blocker Queue / klik notifikasi → detail blocker
  → Action Panel menampilkan hanya aksi valid untuk state saat ini:
      Open        → Acknowledge
      Acknowledged/In Progress → Update / Resolve / Accepted Risk
      Resolved/Accepted Risk/Closed → read-only + Resolution Note terlihat
  → Resolve/Accepted Risk → wajib isi Resolution Note → konfirmasi → status Closed / Accepted Risk

Jika Acknowledge tidak terjadi dalam threshold (khusus RED):
  → sistem auto-escalate ke level berikutnya
  → BlockerCard menampilkan indikator "Auto-escalated"
```

### 7.6 Submission Compliance
```
Sistem cek terus-menerus terhadap Policy aktif (versi berlaku hari itu):
  Mendekati On-Time Deadline & belum submit → Reminder (Email/Push)
  Submit setelah On-Time Deadline, ≤ Cut-Off → tersimpan sebagai "Late"
      → tidak ada aksi manajemen, hanya tercatat sebagai compliance data point
      → History user menampilkan SubmissionTimingBadge (On-Time/Late) berdampingan dengan StatusBadge — dua dimensi berbeda
  Lewat Cut-Off tanpa submission valid → Marked No Submission (compliance event, bukan sanksi)
      → maksimum satu occurrence dihitung per workday meski Morning & EOD sama-sama terlewat (BR-17)
  Tanggal = exempt (leave approved/holiday/exemption) → tidak diproses sebagai No Submission
  Repeated No Submission dalam periode configurable → Flag pattern → notifikasi ke Supervisor/Head (+HRGA jika threshold policy terpenuhi)
      → Supervisor/Head buat Coaching Note (dengan follow-up period)
      → Berulang lagi setelah coaching → Recorded Warning (via Compliance Queue)
      → Terus berulang → Escalated Compliance Case → proses formal DI LUAR SISTEM
```

### 7.7 Organizational Mapping Change
```
Admin/Management berwenang → /admin/organization → pilih person/role
  → buat perubahan (reassign manager/project authority, ubah fungsi, dll.)
  → wajib isi Effective Date (tidak boleh retroaktif)
  → sistem tampilkan preview dampak (siapa terdampak, mulai kapan)
  → Confirm → assignment lama otomatis mendapat End Date = Effective Date baru - 1
  → Daily Accountability Record sebelum Effective Date tetap tampilkan assignment lama saat dibuka
```

### 7.8 Temporary Reviewer Assignment
```
Admin/Management berwenang → /admin/temporary-reviewer → isi reviewer, scope, Effective Date, Expiry Date
  → Confirm → reviewer mulai menerima escalation sesuai scope pada Effective Date
  → Pada Expiry Date → otomatis berhenti menerima, tanpa aksi manual tambahan
  → Seluruh proses tercatat di Audit Log
```

### 7.9 Policy Value Change
```
Authorized Policy Owner (sesuai kategori) → /policy-settings → hanya melihat kategori yang jadi kewenangannya
  → ubah nilai → wajib isi Effective Date
  → Confirm → tersimpan sebagai versi baru (versi lama tetap ada, non-aktif setelah effective date baru)
  → Event sebelum Effective Date tetap dievaluasi dengan versi kebijakan lama saat dibuka/dilaporkan
```

### 7.10 Project Risk Aggregation (PM, pasif)
```
PM membuka /my-scope/project-risk
  → sistem mengelompokkan Commitment/Additional Work anggota tim berdasarkan Reference/Task Link yang sama
  → item AMBER/RED atau Continuation "Continue" berulang pada reference yang sama disorot
  → PM tidak melakukan input di sini — murni view agregat untuk visibilitas risiko
```

### 7.11 Correction Request (pasca Cut-Off) `[REVISI v1.2 — model final]`
```
Employee di form Morning Commitment yang sudah Locked
  → jika policy mengizinkan → tombol "Request Correction" → /today/morning/correction-request
  → isi perubahan yang diminta + Reason (wajib)
  → Submit → sistem klasifikasikan otomatis: Minor atau Material

  Jika Minor:
    → langsung Applied → baseline berubah seketika → audit trail before/after tercatat
    → Employee lihat konfirmasi instan

  Jika Material:
    → status Pending → masuk Objection Window (durasi configurable)
    → notifikasi ke Authorized Reviewer dalam scope
    → reviewer BOLEH mengabaikan (tidak wajib bertindak)
    → reminder terakhir terkirim ke reviewer menjelang window berakhir
    → Window berakhir tanpa objection → otomatis Applied → audit trail tercatat
    → Reviewer ajukan Object (dengan alasan) sebelum window berakhir → status Rejected
        → baseline asli tetap berlaku, employee lihat alasan objection
```

### 7.12 Error & Edge Cases
```
Akses halaman di luar scope role → 403 → halaman error
Akses data yang tidak ada → 404 → halaman error
API gagal saat submit check-in → Toast error; input user tidak hilang (form tidak reset)
Coba edit Morning Commitment setelah Cut-Off tanpa policy izin → aksi ditolak dengan pesan jelas, tombol Correction Request pun tidak tampil
Blocker action dicoba oleh user tanpa kewenangan pada state tersebut → aksi ditolak (403), Action Panel semestinya sudah tidak menampilkan aksi tsb
Continuation "Continue" tanpa Continuation Reason saat Outcome ≠ Completed → validasi inline, submit diblokir
Reviewer coba Object pada Correction Request yang window-nya sudah lewat → aksi ditolak, item sudah pindah ke riwayat sebagai Applied [BARU v1.2]
Leave Request diajukan untuk tanggal yang sudah lewat Cut-Off hari itu → tetap bisa diajukan (Leave bersifat retroaktif-terbatas sesuai policy), tapi tidak mengubah status No Submission hari itu yang sudah terlanjur tercatat, hanya berlaku untuk evaluasi ke depan sesuai policy [BARU v1.2]
```

### 7.13 Leave Request 
```
Employee → /today/leave-request → isi tanggal/date range + Reason (opsional)
  → Submit → status Pending → notifikasi ke Authorized Approver dalam scope
  → Approver buka /compliance/leave-approvals (atau /team/reviews tab Leave)
      → Approve → status Approved → tanggal terkait otomatis exempt dari No Submission
      → Reject (wajib alasan) → status Rejected → tanggal tetap dievaluasi normal
  → Employee lihat status update di /today/leave-request dan My History
  → Pending terlalu lama (threshold configurable) → reminder ke Approver
```

### 7.14 Reports & Export 
```
User berwenang → /reports → tab report muncul sesuai scope/permission-nya
  → pilih periode via FilterBar
  → lihat data (Daily Exception / Weekly Team Summary / Monthly Trend / Individual Evidence / Blocker Root Cause)
  → klik ExportButton → sistem generate file (format sesuai implementasi System Design)
      → hanya berisi data yang sesuai scope visibility user, sama seperti yang terlihat di layar
```

---

## 8. Catatan Desain Khusus

**Pemisahan Outcome & Continuation:** Perubahan konseptual paling signifikan dari model lama ("Carry Over" sebagai satu status). UI wajib menampilkan keduanya sebagai dua kontrol yang jelas terpisah secara visual — bukan satu dropdown gabungan.

**Additional Work sebagai warga kelas dua yang setara:** Meskipun terpisah dari Commitment 1–3, Additional Work harus tetap mendapat perlakuan UI yang setara saat EOD — secara accountability ia sama pentingnya dengan commitment yang direncanakan.

**Authority Context tidak boleh disamarkan:** Ketika owner suatu blocker ditentukan lewat Project Authority (bukan direct manager), ini harus terlihat jelas di UI (`AuthorityTag`) — supaya user memahami mengapa notifikasi datang dari/ke orang yang bukan atasan langsungnya.

**Locked state harus terasa berbeda dari disabled biasa:** Baseline yang terkunci pasca Cut-Off bukan sekadar field abu-abu — perlu indikator eksplisit (`LockedIndicator`) yang menjelaskan *mengapa* terkunci, dan jalur yang jelas (Correction Request) jika policy mengizinkan perubahan.

**Submission timing bukan bagian dari StatusBadge:** On-Time/Late/No Submission menjawab pertanyaan "kapan disiplin submit", sedangkan GREEN/AMBER/RED menjawab "seberapa berisiko pekerjaannya" — keduanya independen dan tidak boleh digabung jadi satu indikator visual, agar tidak menimbulkan interpretasi yang salah (mis. "Late" disangka otomatis berarti AMBER).

**Project Risk View bersifat pasif dan derivatif:** Karena tidak ada entitas Project formal di MVP, tampilan ini murni agregasi read-only dari data Commitment yang sudah ada — tidak boleh menyiratkan adanya struktur project management tersendiri yang belum menjadi bagian scope produk.

**Validation prompt bukan blocking wall:** Saat Status Suggestion Engine berbeda pendapat dengan user, modal konfirmasi harus tetap memberi jalan bagi user untuk mempertahankan pilihannya (dengan alasan) — bukan memaksa user mengikuti saran sistem.

**Default-approve harus terasa "bisa dihentikan", bukan "sudah pasti terjadi":**  Correction Request Material yang default-approve harus tetap ditampilkan ke reviewer dengan urgensi yang jelas (countdown `ObjectionWindowIndicator`, reminder menjelang akhir window) — supaya mekanisme "ringan buat reviewer" ini tidak berubah jadi "reviewer nggak pernah tahu ada perubahan yang jalan otomatis".

**Leave dan Exemption terlihat berbeda secara sengaja:**  Leave (butuh approval aktif) dan Holiday/Exemption (admin-set langsung) sengaja dipisah jadi dua halaman berbeda (4.12 vs 4.20/4.21), bukan digabung jadi satu "Exemption Management" umum — supaya user tidak salah kira Leave-nya otomatis berlaku begitu diajukan.

**Policy Settings sebagai satu halaman, bukan satu wewenang:**  Meskipun `/policy-settings` adalah satu rute untuk semua role, UI wajib memperlakukan tiap section kategori kebijakan sebagai unit visibility terpisah — user yang login hanya boleh melihat section yang authority-nya dia pegang, sisanya benar-benar tidak dirender (bukan cuma disembunyikan lewat CSS).
