# Product Definition Document (PDD)
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

**Versi:** 1.4
**Tanggal:** Oktober 2026
**Status:** FINAL — Diselaraskan dengan PRD Baseline v1.0 & Hasil Rekonsiliasi Audit Pengerjaan Lama
**Pemilik Produk:** Dutamedia
**Referensi:** PRD Baseline "Dutamedia Work Pulse" v1.0 (Management), PRD v1.5 REVISED, ADR-001 s/d ADR-018, dan Dokumen Temuan Audit S1–S3

---

## 1. Latar Belakang & Konteks

Selama ini keterlambatan project di Dutamedia sering baru diketahui setelah risiko sudah menjadi masalah besar. Tidak ada satu sumber data sederhana yang menunjukkan apa yang dikomit, selesai, dilanjutkan, atau terhambat per orang setiap harinya. Evaluasi performance berisiko menjadi berbasis persepsi ketika KPI formal sedang disederhanakan/ditunda selama masa pembenahan organisasi. Blocker dan kebutuhan cross-team support belum selalu terlihat dan tereskalasi dengan cepat, sementara dokumentasi dan accountability idealnya menjadi kebiasaan operasional harian — bukan aktivitas yang baru dilakukan menjelang evaluasi.

Organisasi membutuhkan mekanisme pembinaan dan konsekuensi yang terdokumentasi secara objektif, tanpa mengubah organisasi menjadi *fear culture* atau budaya micromanagement berbasis pengawasan aktivitas.

## 2. Visi Produk

> "Menjadi operating discipline internal yang memberi visibilitas harian atas commitment, output, dan risiko pekerjaan di seluruh fungsi organisasi — mendorong early escalation dan accountability yang terbukti, tanpa menjadi alat pengawasan aktivitas maupun kalkulator KPI otomatis."

## 3. Tujuan Produk

| # | Tujuan | Indikator |
|---|---|---|
| G1 | Daily visibility | Management/Head dapat melihat commitment, outcome, blocker, dan risiko tanpa meminta laporan manual |
| G2 | Early escalation | Status AMBER/RED dan blocker penting segera masuk jalur eskalasi yang tepat (organizational atau contextual project authority) |
| G3 | Accountability evidence | Tersedia histori objektif dan *immutable* atas commitment, outcome, continuation, support, dan compliance |
| G4 | Low administration | Pengisian check-in (Morning & EOD) dapat diselesaikan dalam ±2–3 menit, bukan menjadi timesheet |
| G5 | Fair evaluation | Data mendukung coaching dan evaluasi; satu hari buruk atau satu kegagalan tidak otomatis menghasilkan konsekuensi |
| G6 | Future KPI foundation | Data historis dapat dipakai merancang KPI yang relevan setelah organisasi stabil, tanpa menjadikan seluruh data Work Pulse sebagai KPI mentah sejak awal |
| G7 | Policy fleksibel, prinsip tetap | Nilai operasional yang secara eksplisit ditetapkan sebagai kebijakan (misalnya cutoff, grace period, kalender kerja, jangka retensi yang diizinkan, dan jendela objection) dapat dikonfigurasi oleh otoritas berwenang. Aturan tetap produk dan batas keamanan yang sudah ditetapkan tidak boleh diubah melalui konfigurasi. |

## 4. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Employee** | Seluruh karyawan aktif dalam scope partisipasi | Mengisi Morning Commitment & EOD Outcome dengan cepat, raise blocker, melihat histori sendiri |
| **Supervisor / Technical Lead** | Fungsi supervisi teknis/operasional | Melihat tim/scope yang diberikan, acknowledge blocker, memberi support note |
| **Head / Function Owner** | Head Engineering, Head Ops & Infra, Head Sales Enablement, Head Delivery, dst. | Melihat exception di fungsinya, assign/escalate support, memberi coaching note |
| **PM** | PM 1, PM 2, dan role Delivery lain | Log sendiri, melihat project risk yang menjadi tanggung jawabnya, menerima project-impact escalation |
| **HRGA / People Admin** | Fungsi HR & General Affairs | Mengelola policy compliance, exemption, dan coaching/warning record sesuai kewenangan |
| **CEO / Management** | CEO dan role yang diberi hak akses | Portfolio dashboard lintas fungsi, trend, keputusan/eskalasi tingkat perusahaan |
| **System Admin** | Admin aplikasi | Master data organisasi, role mapping, jadwal/cutoff, notifikasi, konfigurasi policy |
| **Authorized Policy Owner** | Subset Admin/Management yang diberi kewenangan spesifik | Mengubah dan mem-versi kebijakan tertentu (submission, org mapping, coaching, retensi) sesuai lingkup kewenangannya masing-masing |

> Partisipasi bersifat **configurable by policy** — bukan hard-coded — sehingga role/individu tertentu (mis. CEO/Board atau eksekutif tertentu) dapat dikecualikan dari kewajiban check-in secara terbuka tanpa batas waktu (*open-ended / indefinite*, tanpa kewajiban batas kadaluarsa), dan berlaku terus-menerus hingga diubah secara eksplisit melalui kebijakan baru. Pengecualian individual berbasis penugasan lapangan (dinas luar) tetap dapat menggunakan rentang tanggal efektif.

**Batas akses Pulse Dashboard:** Pulse Dashboard adalah satu pintu navigasi untuk dashboard pemantauan yang berbeda cakupan, bukan dashboard universal bagi seluruh karyawan. Employee biasa tidak memperoleh akses ke dashboard manajerial hanya karena memiliki akun. Team Pulse tersedia bagi Supervisor/TL dengan team/assigned scope yang sah; Function Pulse bagi Head/Function Owner dengan function scope yang sah; Management Pulse bagi CEO/Management yang diberi hak akses company-wide. Akses akhir mengikuti role, permission, dan scope efektif pengguna, bukan sekadar label jabatan. Pengguna dengan beberapa kewenangan dapat mengakses lebih dari satu cakupan yang memang diizinkan.

## 5. Lingkup Produk (MVP)

### In-Scope
- **Authentication & User Profile** — login, role/function mapping
- **Daily Accountability Record** sebagai unit accountability utama (satu employee + satu applicable workday), terdiri dari:
  - **Morning Commitment** — 0–3 commitment. Jika ada commitment, masing-masing memiliki Initial Risk (GREEN/AMBER/RED), serta Known Blocker dan Support Needed jika Initial Risk AMBER/RED. Jika tidak ada Commitment, Employee wajib memberikan alasan; Initial Daily Status menjadi `NOT_APPLICABLE — NO_COMMITMENT`, bukan status risiko GREEN/AMBER/RED dan bukan `No Submission`.
  - **Additional Work** — pencatatan pekerjaan material yang muncul setelah Morning Check-in (Newly Assigned/Missed in Planning/Priority Change/Operational-Incident/Other), tidak mengubah baseline Morning
  - **EOD Outcome** — per commitment/additional work: Outcome (Completed / Partially Completed / Not Completed / Cancelled with reason) **dipisah** dari **Continuation** (Continue / Do Not Continue); Employee menetapkan Final Status GREEN/AMBER/RED dan wajib memberi penjelasan tingkat-hari jika AMBER/RED. EOD juga menyediakan field opsional `Tomorrow Priority`, yang disimpan sebagai catatan konteks terpisah dan bukan sumber copy-forward Commitment.
- **Status Suggestion Engine** (non-otomatis) — sistem memberikan saran berdasarkan heuristik produk deterministik yang ditetapkan pada PRD/ADR (severity blocker aktif dan hasil pekerjaan), tanpa mengubah pilihan Employee secara diam-diam; inkonsistensi memicu validation prompt
- **Blocker & Escalation Management** — lifecycle Open → Acknowledged → In Progress → Resolved → Closed (dengan jalur alternatif Accepted Risk), severity/impact/owner needed, SLA eskalasi configurable
- **Authority Model** — organizational authority (baseline, effective-dated) + contextual project authority yang dapat dipilih eksplisit per blocker/escalation, tanpa mengubah direct manager karyawan
- **Temporary Reviewer** — penunjukan reviewer sementara (mis. saat posisi Head vacant) dengan effective date & expiry date
- **Submission Compliance** — model On-Time / Late (grace period) / No Submission, dengan reminder otomatis; missed submission dicatat sebagai *compliance event* faktual, bukan otomatis konsekuensi disipliner
- **Morning Correction Request** — mekanisme ter-audit untuk mengoreksi Morning Commitment yang sudah terkunci setelah Cut-Off, menggunakan klasifikasi Minor/Material dan default-approve dengan objection window untuk perubahan Material. Tidak mencakup Additional Work maupun field EOD.
- **EOD Correction Request** — mekanisme terpisah untuk mengoreksi data EOD yang telah disubmit dan terkunci, dengan tata kelola koreksi dan audit trail yang setara, tetapi target, rekaman, dan alurnya dibedakan dari Morning Correction Request. Tidak dapat digunakan untuk membuat submission EOD yang tidak pernah ada atau menghapus fakta No Submission.
- **Leave & Exemption Management** — Leave (employee request → authorized approval), Holiday & individual Exemption (admin/HRGA-set langsung tanpa approval tambahan), masing-masing dengan single date/date range, effective period, dan audit trail; hari valid exception tidak dihitung No Submission
- **Function-Based Output Guidance (FR-12)** — panduan dan contoh output kontekstual yang relevan dengan fungsi organisasi pengguna (Engineering, Quality/QA, Operations & Infrastructure, Delivery, Sales Enablement & Presales, Finance, HRGA). Teks panduan bersifat non-binding (hanya placeholder visual bergaya miring untuk memandu spesifisitas output berkualitas, tidak mengotori atau mengontaminasi input form pengguna). Taksonomi fungsi melekat pada penugasan organisasi pengguna; jabatan atau system role tidak boleh dipakai sebagai pengganti fungsi organisasi.
- **Dashboard & Monitoring** — Pulse Dashboard menjadi satu menu navigasi untuk cakupan Team Pulse (Supervisor/TL), Function Pulse (Head/Function Owner), dan Management Pulse (CEO/Management berwenang). Dashboard mengikuti role, permission, dan scope efektif; Employee biasa tidak mendapat akses dashboard manajerial hanya karena memiliki akun. Tampilan exception-first, bukan leaderboard
- **Weekly Accountability Summary** & **Monthly Management Trend**
- **Manager Notes** — coaching / recognition / corrective, dengan visibilitas dan permission lebih ketat dari daily log biasa
- **Reporting** — Daily Exception, Weekly Team Summary, Monthly Trend, Individual Review Evidence, Blocker Root Cause
- **Audit Trail** — immutable, mencakup perubahan commitment setelah cutoff, status, blocker, dan manager note
- **Notification** — Email dan **Browser Push yang benar-benar berfungsi pada MVP** sebagai kanal pengiriman utama untuk trigger yang ditetapkan, disertai Web Notification Center in-system sebagai kanal/riwayat notifikasi. Browser Push bukan sekadar stub, placeholder, atau rencana fase berikutnya. Email dan Web Notification Center tetap menangani alur yang sesuai ketika Browser Push tidak tersedia atau tidak diizinkan oleh pengguna; keterbatasan tersebut tidak boleh disamarkan sebagai pengiriman Browser Push yang berhasil.
- **Organization Master Data** — struktur organisasi, role, fungsi, reporting line, dan project authority yang **dapat diedit** oleh Admin/Management berwenang, dengan **effective date** dan **audit trail**, tanpa merusak historical accountability
- **Policy Configuration Framework** — seluruh nilai kebijakan (cutoff, grace period, workday/calendar, exemption, escalation threshold & recipient, coaching period, retensi, objection window duration, batas minor vs material change, dll.) bersifat configurable dengan **versioning** (effective date, optional end date, owner, audit trail)
- **Export** — Authorized role dapat mengekspor data (summary/evidence) sesuai scope visibility yang berlaku untuknya; tidak boleh mengekspos data di luar kewenangan
- Web-based (bukan sesuatu yang harus dibuka terus-menerus sepanjang hari)

### Out-of-Scope (v1 — kandidat fase lanjut)
- Integrasi eksternal: Jira/GitHub/GitLab/Trello, CRM, Helpdesk/ticketing, HR leave/attendance system, SSO (arsitektur dirancang *future-ready*, referensi task/project bersifat manual di MVP)
- AI-generated management summary / root-cause clustering otomatis
- Advanced analytics selain yang disebut di scope reporting
- Automated KPI calculation & complex incentive engine
- Custom mobile application (MVP web-responsive)
- Full HR disciplinary workflow (proses formal tetap di luar sistem, mengikuti Peraturan Perusahaan)
- Cross-company benchmarking
- Gamification / leaderboard task-count (secara eksplisit **tidak direkomendasikan**, bukan sekadar belum dikerjakan)

## 6. Model Organisasi & Akses

**Single Organization** — satu deployment untuk Dutamedia, skala awal ±30 karyawan seluruh fungsi operasional. Tidak ada konsep multi-tenant.

### Komposisi Organisasi Awal (Baseline Dutamedia)

| Fungsi / Divisi | Komposisi Awal | Jalur Pelaporan / Review |
|---|---|---|
| **Engineering** | Head Engineering; 2 Technical Lead; 3 Developer | Head Engineering |
| **Quality** | 1 QA/QC | Fungsi kualitas independen; eskalasi risiko proyek ke PM / Delivery / CEO |
| **Operations & Infrastructure** | Head Ops & Infra; Ops Supervisor; Infra Specialist; 2 Ops Staff | Head Ops & Infra |
| **R&D** | 1 Principal / R&D Engineer | Penasihat teknis langsung/independen (*independent technical advisory*) |
| **Delivery** | PM 1; PM 2; *Head of Delivery (vacant)* | Temporary management review oleh CEO hingga posisi Head of Delivery terisi |
| **Business Development** | 1 BD | Commercial / CEO |
| **Sales Enablement & Presales** | Head + Presales + Marketing | Head Sales Enablement & Presales |
| **Finance** | Senior Finance + 1 Finance Intern | Senior Finance / CEO |
| **HRGA** | 1 HRGA Staff | CEO / Management |

**Dua area akses utama** (bukan dua portal terpisah seperti proyek sebelumnya, melainkan satu aplikasi dengan permission bertingkat):
- **Self-Service Area** — seluruh role mengisi Daily Accountability Record milik sendiri, melihat histori dan notifikasi pribadi
- **Management & Governance Area** — akses berjenjang sesuai role (Supervisor/TL → scoped team; Head → fungsi; HRGA → compliance & policy tertentu; CEO/Management → company-wide; System Admin → seluruh master data & konfigurasi teknis)

**Prinsip permission kunci:**
- Organizational role sebagai baseline; project authority dapat dipilih eksplisit sebagai konteks tambahan tanpa menggantikan direct manager
- **Satu person dapat menjadi Project Authority untuk lebih dari satu konteks/reference sekaligus** — bukan satu nilai tetap yang menempel permanen pada satu Organizational Assignment. Pemilihan Project Authority terjadi kontekstual, per blocker/escalation, tergantung reference/project mana yang relevan saat itu
- Disciplinary record dan manager coaching note memiliki lapisan permission lebih ketat dari daily log biasa
- Authorized Policy Owner berbeda-beda per jenis kebijakan (bukan satu Admin yang berkuasa atas semua kebijakan)

### Jalur Eskalasi Standar per Fungsi (Baseline Escalation Paths)

| Sumber Eskalasi | Eskalasi Awal (*Initial Escalation*) | Tingkat Lanjutan & Pemicu (*Next Level / Trigger*) |
|---|---|---|
| **Developer** | Technical Lead | Head Engineering (jika konflik prioritas, tak terselesaikan, atau berdampak proyek) |
| **Technical Lead** | Head Engineering | R&D / Principal Engineer (untuk konsultasi arsitektur L3 jika diperlukan) |
| **Ops Staff** | Ops Supervisor | Head Ops & Infra → Engineering / R&D sesuai akar masalah |
| **QA/QC** | PM + Technical Owner | Head Delivery / CEO (jika komitmen rilis atau proyek terancam gagal) |
| **PM** | Head Delivery (*future*) | CEO sementara (karena Head Delivery masih kosong atau keputusan material dibutuhkan) |
| **Commercial (BD/Presales)** | Head Sales Enablement / Commercial Owner | CEO / Finance / Engineering sesuai jenis keputusan bisnis/teknis |
| **Finance / HRGA** | Senior / Management Owner | CEO (bila terdapat eksposur kebijakan atau persetujuan material) |

### Penentuan Owner Needed dan Authority Context

- **Organizational Authority** adalah konteks default untuk menentukan Owner Needed pada blocker.
- Untuk blocker yang berkaitan dengan pekerjaan sehari-hari, **Direct Manager (atasan langsung)** menjadi kandidat awal penanganan. Kepala Divisi tidak otomatis menjadi penerima pertama; kewenangan yang lebih tinggi dapat terlibat melalui aturan fallback atau eskalasi yang berlaku.
- **Project Authority** dapat dipilih secara eksplisit jika blocker terkait dengan proyek/reference tertentu. Pemilihan ini kontekstual dan tidak menggantikan Direct Manager atau Organizational Assignment secara permanen.
- Pemilihan orang tertentu oleh pelapor bersifat opsional. Jika tidak ada orang yang dipilih, sistem menentukan Owner Needed berdasarkan Authority Context, assignment/mapping yang aktif pada waktu kejadian, serta aturan resolusi yang berlaku.
- Pilihan manual hanya diterima jika orang tersebut aktif dan diizinkan dalam Authority Context serta scope terkait. Pilihan yang tidak valid harus ditolak dengan penjelasan, bukan diterima diam-diam.
- Jika kandidat tidak tersedia atau penentuan penerima ambigu, sistem menggunakan fallback yang telah dikonfigurasi dan mencatat dasar penentuan. Jika tidak ada penerima yang valid setelah fallback, sistem tidak boleh mengirim blocker kepada orang yang tidak sesuai; pengguna diberi pesan yang dapat ditindaklanjuti dan blocker tidak diklaim berhasil dikirim.
- **Owner Needed awal berbeda dari escalation chain.** Eskalasi mengikuti aturan severity, status, aging, dan threshold yang berlaku. Peristiwa penentuan penerima, fallback, dan eskalasi harus dapat diaudit.

## 7. Lifecycle Status

### Submission Status (per check-in)
```
On-Time    → submit ≤ On-Time Deadline
Late       → submit > On-Time Deadline, ≤ Cut-Off (Grace Period)
No Submission → tidak ada submission valid sampai Cut-Off
```

Berlaku untuk Morning dan EOD: submission setelah Cut-Off ditolak tanpa menulis data. Cut-Off = On-Time Deadline + Grace Period; Grace Period `0` adalah nilai valid. Validitas submission ditentukan dari timestamp request, bukan dari kapan scheduler berjalan. Scheduler hanya melakukan cutoff locking dan evaluasi No Submission sesuai waktu yang berlaku.

### Blocker Lifecycle
```
Open → Acknowledged → In Progress → Resolved → Closed
                                   ↘ Accepted Risk (jalur alternatif)
```

**Kewenangan penutupan:** assigned support owner/penanggung jawab penanganan menandai blocker `Resolved` dan mencatat resolution note. Pelapor (`raisedByUserId`) mengonfirmasi `Closed`. `Accepted Risk` merupakan keputusan terpisah oleh authority yang berwenang pada konteks terkait, bukan sinonim `Closed`. Jika pelapor belum mengonfirmasi, blocker tetap `Resolved`; sistem tidak menutupnya otomatis hanya karena waktu berlalu.

### Outcome & Continuation (dua dimensi terpisah, dievaluasi bersama)
```
Outcome:      Completed / Partially Completed / Not Completed / Cancelled (with reason)
Continuation: Continue / Do Not Continue
```
*Carry Over bukan outcome — ia adalah kondisi Continuation, sehingga item "Partially Completed" tetap bisa berstatus "Continue".*

### Morning Correction Request Lifecycle (perubahan baseline Morning pasca Cut-Off)
```
Employee mengajukan Morning Correction Request (perubahan + reason)
   → Klasifikasi Minor / Material berdasarkan aturan policy yang berlaku
      Minor → Applied langsung dengan audit trail
      Material → Pending selama Objection Window
         → Tidak ada objection hingga window berakhir → Applied
         → Authorized Reviewer mengajukan objection selama window → Rejected;
           baseline asli tetap berlaku dan alasan objection tercatat
```
Cakupan ini hanya Morning Commitment yang sudah terkunci; tidak mencakup Additional Work maupun field EOD.

### EOD Correction Request Lifecycle (perubahan EOD pasca Cut-Off)
```
Employee mengajukan EOD Correction Request untuk EOD yang sudah disubmit dan terkunci
   → Reason wajib; perubahan dan target field dicatat
   → Klasifikasi Minor / Material dengan tata kelola koreksi yang sama
      Minor → Applied langsung dengan audit trail
      Material → Pending selama Objection Window
         → Tidak ada objection hingga window berakhir → Applied
         → Authorized Reviewer mengajukan objection selama window → Rejected;
           nilai EOD asli tetap berlaku dan alasan objection tercatat
```
EOD Correction Request memiliki record dan target terpisah. Cakupannya adalah field EOD yang sudah tersimpan, termasuk outcome/continuation untuk Commitment dan Additional Work, Final Status, penjelasan risiko tingkat-hari, dan `Tomorrow Priority`. Ia tidak mengubah Morning baseline, tidak membuat submission EOD baru jika tidak pernah ada, tidak membatalkan event No Submission, dan tidak mengizinkan direct edit diam-diam.

*Untuk kedua alur, perubahan Material berjalan default-approve kecuali terdapat objection eksplisit dalam window. Semua perubahan, klasifikasi, aktor, timestamp, nilai before/after, dan keputusan objection wajib ter-audit.*

### Compliance Event Progression
```
Reminder (belum cutoff)
   → No Submission (event faktual, bukan sanksi)
      → Flag pattern (repeated non-submission dalam periode configurable)
         → Coaching (Supervisor/Head)
            → Recorded Warning (jika berulang setelah coaching)
               → Formal Disciplinary Process (di luar sistem, sesuai kebijakan perusahaan)
```

### Daily Status (Initial & Final)

**Initial Daily Status** diturunkan secara deterministik dari Initial Risk seluruh Morning Commitment:
- `RED` jika setidaknya satu Commitment memiliki Initial Risk `RED`.
- `AMBER` jika tidak ada `RED` dan setidaknya satu Commitment memiliki Initial Risk `AMBER`.
- `GREEN` jika terdapat satu atau lebih Commitment dan seluruhnya memiliki Initial Risk `GREEN`.
- `NOT_APPLICABLE — NO_COMMITMENT` jika tidak ada Commitment dan Employee menyerahkan alasan wajib. Ini bukan status risiko, bukan `GREEN`, dan bukan `No Submission`.

**Final Status** tetap ditetapkan Employee pada EOD berdasarkan kondisi aktual hari itu; bukan turunan otomatis Initial Daily Status. `AMBER`/`RED` mewajibkan penjelasan risiko/blocker tingkat-hari.

| Status risiko | Makna |
|---|---|
| `GREEN` | On track, tidak ada blocker material yang diketahui |
| `AMBER` | Ada risiko yang masih berpotensi dipulihkan; alasan/risk note wajib |
| `RED` | Pekerjaan terancam/gagal tanpa intervensi; eskalasi segera |

## 8. Business Rules Kritis

- Maksimal 3 Morning Commitment — aturan tetap produk, bukan nilai policy yang dapat diubah Admin. Nol Commitment diperbolehkan hanya jika Employee menyerahkan alasan wajib; status awalnya `NOT_APPLICABLE — NO_COMMITMENT`, bukan `GREEN` dan bukan `No Submission`. Additional Work dicatat terpisah, tidak menjadi Commitment ke-4 dan tidak mengubah baseline pagi.
- Morning Commitment dapat diedit bebas sebelum Cut-Off. Setelah Cut-Off, baseline terkunci; perubahan apa pun wajib melalui **Morning Correction Request**. Field EOD yang telah disubmit dan terkunci hanya dapat diubah melalui **EOD Correction Request** terpisah. Tidak ada direct-edit terhadap data terkunci.
- Morning Correction Request hanya mencakup Morning Commitment; EOD Correction Request hanya mencakup field EOD yang sudah disubmit dan terkunci. Keduanya memakai klasifikasi Minor/Material, default-approve dengan objection window untuk Material, dan audit trail lengkap; keduanya tidak boleh menghapus fakta submission/compliance historis.
- Batasan Minor vs Material, dan durasi Objection Window, adalah **nilai kebijakan configurable** — bukan prinsip yang di-hardcode
- Continuation bernilai `Continue` wajib disertai Continuation Reason. Initial Risk `AMBER`/`RED` wajib disertai Known Blocker dan Support Needed. Final Status `AMBER`/`RED` wajib disertai penjelasan risiko/blocker pada tingkat harian; ketiganya merupakan konteks berbeda dan tidak boleh diperlakukan sebagai satu field yang sama.
- Status RED dan critical/instant blocker dapat dibuat kapan saja, tidak harus menunggu EOD.
- Aturan tetap produk yang sudah disahkan mencakup maksimal 3 Morning Commitment, ambang 3 kejadian No Submission untuk pattern flag (periode evaluasi dapat dikonfigurasi), dan jendela reminder 60 menit sebelum On-Time Deadline. Perubahan terhadap aturan tetap memerlukan keputusan produk formal, bukan konfigurasi runtime.
- Sistem **tidak pernah** menerbitkan SP atau memotong insentif secara otomatis — hanya menghasilkan evidence/flag; keputusan disipliner tetap melalui authorized management/HRGA
- Satu missed submission atau satu hari RED **tidak otomatis** menjadi konsekuensi disipliner
- Tidak ada leaderboard/task-count ranking dalam bentuk apa pun
- Manager tidak dapat diam-diam mengubah pernyataan employee — koreksi harus melalui manager note atau correction workflow yang ter-audit
- Perubahan struktur organisasi (person, role, fungsi, direct manager, reviewer, project authority) tidak boleh mengubah historical accountability — data historis tetap merefleksikan konteks organisasi yang berlaku saat event terjadi (effective-dated)
- Akun user dibuat oleh Authorized Admin/Management melalui Organization Master Data; tidak ada self-registration publik. Aktivasi awal dilakukan melalui undangan yang terikat ke akun yang sudah dibuat, token sekali pakai dengan masa berlaku, dan penetapan kredensial oleh karyawan. Masa berlaku undangan ditetapkan dalam konfigurasi peluncuran sebelum implementasi.
- Temporary Reviewer memiliki effective date & expiry date, tidak mengubah struktur permanen, dan seluruh penugasannya ter-audit
- Nilai kebijakan yang memang ditetapkan configurable harus berversi dan memiliki effective date; data historis tunduk pada versi yang berlaku saat event terjadi. Aturan tetap produk tidak boleh ditampilkan sebagai konfigurasi yang dapat diubah.
- Leave wajib melalui Authorized Approval sebelum berlaku sebagai valid exception; Holiday dan individual Exemption dapat langsung di-set oleh Admin/HRGA berwenang tanpa approval tambahan — keduanya sama-sama mengecualikan tanggal terkait dari No Submission detection. Pengecualian pada jabatan tertentu (mis. CEO/Board) dapat bersifat permanen tanpa batas waktu (*open-ended / indefinite*, tanpa tanggal kedaluwarsa) sejak tanggal efektif diberlakukan.
- `Tomorrow Priority` adalah catatan opsional yang disimpan pada EOD dan ditampilkan ke Employee pada Morning hari kerja berikutnya sebagai konteks terpisah. Ia tidak menghasilkan, menggantikan, mengurutkan, atau mengubah draft Commitment FR-11 dan tidak memengaruhi Initial Daily Status.
- Taksonomi Blocker resmi mencakup: **Type** (`Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`), **Severity** (`Low`, `Medium`, `High`, `Critical`), dan **Impact** (`Task`, `Milestone`, `Project`, `Production`, `Client`, `Financial`, `Compliance`).
- Prinsip pembedaan penanganan kasus (*Important Distinction*): (1) Pekerjaan tidak selesai karena kompleksitas teknis dengan eskalasi awal diperlakukan sebagai *Delivery Issue* (dukungan, penjadwalan ulang, *coaching*); (2) Mengetahui keterlambatan tetapi tidak mengeskalasi diperlakukan sebagai *Accountability Issue* (tinjauan tercatat, tindakan korektif jika berulang); (3) Mem-bypass proses wajib QA/rilis secara sengaja diperlakukan sebagai *Process Violation* (eskalasi penegakan disiplin); (4) Lupa mengisi satu kali diperlakukan sebagai *Administrative Miss* (pengingat); (5) Pengabaian pengisian berulang setelah pembinaan diperlakukan sebagai *Discipline Pattern* (peringatan tercatat menuju proses formal).
- Availability target MVP adalah minimal 99% selama jam layanan operasional yang diumumkan, dihitung per bulan kalender; detail pengukuran dan monitoring ditetapkan dalam SAD.
- No Surprise Rule: masalah boleh terjadi, tapi risiko yang sudah diketahui wajib dieskalasi sebelum menjadi kejutan
- Primary ownership ≠ exclusive ownership — cross-project support tetap wajib sesuai kompetensi dan prioritas

## 9. Gambaran Teknologi (High-Level)

Pilihan teknologi dan desain internal belum ditetapkan pada tahap PDD ini dan akan dirumuskan dalam **System Architecture Design**. Pada tingkat produk, WorkPulse harus berupa aplikasi web-responsive yang tidak mengharuskan pengguna membiarkannya terbuka sepanjang hari; menerapkan akses berbasis kewenangan; menjaga histori dan audit trail; serta menyediakan pengiriman Email dan Browser Push yang nyata pada MVP. Prinsip produk yang sudah ditetapkan:

| Aspek | Prinsip |
|---|---|
| Policy | Nilai kebijakan yang ditetapkan configurable, versioned dengan effective date; tunduk pada aturan tetap produk dan batas keamanan |
| History | Immutable / traceable |
| Authority | Contextual (organizational baseline + project authority, satu person bisa multi-scope) |
| Correction | Structured request, bukan direct silent edit — mekanisme locked, threshold/window configurable |
| Evidence | Auditable |
| Discipline | Human decision, di luar sistem |
| Notification | Email + Browser Push yang benar-benar mengirim pada MVP untuk trigger yang ditetapkan + Web Notification Center sebagai kanal in-system dan riwayat; push tidak universal untuk semua event |
| Availability | Target layanan minimal 99% per bulan kalender selama jam layanan yang diumumkan; metode pengukuran dirinci dalam SAD |
| Delivery Model | Web-based, responsive, bukan mobile app di MVP |

---

### Riwayat Revisi v1.4
 
- Menegaskan akses dan navigasi Pulse Dashboard: satu menu navigasi yang menyaring scope sesuai role dan permission (Team Pulse untuk Supervisor/TL, Function Pulse untuk Head, Management Pulse untuk CEO/Direksi; bukan dashboard universal terbuka untuk Employee biasa).
- Menetapkan taksonomi 7 fungsi kanonikal Dutamedia secara definitif pada Function-Based Output Guidance (FR-12) tanpa klausul penundaan keputusan, dengan teks panduan non-binding bergaya italic yang melekat pada fungsi organisasi pengguna.
- Menyelaraskan seluruh prinsip dan aturan bisnis dengan PRD Baseline v1.0 dan keputusan arsitektural ADR-001 s/d ADR-018 hasil pembelajaran pengerjaan lama.

### Riwayat Revisi v1.3

- Memperjelas resolusi Owner Needed: Organizational Authority sebagai default, Direct Manager sebagai kandidat awal untuk blocker pekerjaan sehari-hari, dan Project Authority sebagai konteks proyek yang dipilih eksplisit.
- Menetapkan bahwa pilihan orang tertentu bersifat opsional; jika kosong, sistem menentukan penerima berdasarkan konteks dan assignment/mapping yang berlaku.
- Memisahkan Owner Needed awal dari escalation chain serta menetapkan prinsip validasi pilihan manual, fallback, dan audit tanpa mengubah model authority historis.

### Riwayat Revisi v1.2

- Menetapkan Browser Push sebagai delivery nyata pada MVP untuk trigger yang ditentukan; Web Notification Center tetap tersedia sebagai kanal/riwayat in-system.
- Menetapkan Initial Daily Status sebagai agregasi deterministik Initial Risk, dengan status `NOT_APPLICABLE — NO_COMMITMENT` dan alasan wajib bila tidak ada Commitment.
- Memisahkan Morning Correction Request dari EOD Correction Request, termasuk cakupan dan batasnya.
- Menetapkan `Tomorrow Priority` sebagai catatan opsional yang disimpan dan ditampilkan terpisah dari draft Commitment FR-11.
- Menetapkan alur penutupan blocker: support owner menandai `Resolved`, pelapor mengonfirmasi `Closed`; tidak ada auto-close karena waktu.
- Menetapkan aktivasi akun melalui undangan satu kali yang kedaluwarsa dan target availability MVP minimal 99% per bulan kalender selama jam layanan operasional yang diumumkan.
- Mempertahankan batas PDD: teknologi dan desain internal tetap menjadi ranah SAD; detail alur UI/UX, Design System, prototype, dan prompt pengembangan tidak ditetapkan dalam dokumen ini.

---

*Dokumen ini adalah baseline definisi produk WorkPulse v1.4 FINAL dan menjadi acuan normatif bagi PRD v1.5 serta artefak perancangan berikutnya. Detail kebutuhan yang dapat diuji ditetapkan di PRD; dokumen berikutnya tidak boleh diam-diam mengubah keputusan produk di sini.*
