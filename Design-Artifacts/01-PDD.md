# Product Definition Document (PDD)
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

**Versi:** 1.1
**Tanggal:** September 2026
**Pemilik Produk:** Dutamedia
**Referensi:** PRD Baseline "Dutamedia Work Pulse" v1.0 (Management), Master Revision Register

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
| G7 | Policy fleksibel, prinsip tetap | Nilai kebijakan (cutoff, threshold, retensi, dll.) dapat dikonfigurasi otoritas berwenang tanpa mengubah prinsip inti produk |

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

> Partisipasi bersifat **configurable by policy** — bukan hard-coded — sehingga role/individu tertentu (mis. CEO/Board) dapat dikecualikan melalui konfigurasi, dengan effective period yang jelas.

## 5. Lingkup Produk (MVP)

### In-Scope
- **Authentication & User Profile** — login, role/function mapping
- **Daily Accountability Record** sebagai unit accountability utama (satu employee + satu applicable workday), terdiri dari:
  - **Morning Commitment** — maksimal 3 commitment, Initial Risk (GREEN/AMBER/RED), blocker & support needed jika AMBER/RED
  - **Additional Work** — pencatatan pekerjaan material yang muncul setelah Morning Check-in (Newly Assigned/Missed in Planning/Priority Change/Operational-Incident/Other), tidak mengubah baseline Morning
  - **EOD Outcome** — per commitment/additional work: Outcome (Completed / Partially Completed / Not Completed / Cancelled with reason) **dipisah** dari **Continuation** (Continue / Do Not Continue); Final Status GREEN/AMBER/RED
- **Status Suggestion Engine** (non-otomatis) — sistem dapat menyarankan status berdasarkan pola data (mis. carry-over berulang, critical blocker), namun tidak mengubah status user secara diam-diam; inkonsistensi memicu validation prompt
- **Blocker & Escalation Management** — lifecycle Open → Acknowledged → In Progress → Resolved → Closed (dengan jalur alternatif Accepted Risk), severity/impact/owner needed, SLA eskalasi configurable
- **Authority Model** — organizational authority (baseline, effective-dated) + contextual project authority yang dapat dipilih eksplisit per blocker/escalation, tanpa mengubah direct manager karyawan
- **Temporary Reviewer** — penunjukan reviewer sementara (mis. saat posisi Head vacant) dengan effective date & expiry date
- **Submission Compliance** — model On-Time / Late (grace period) / No Submission, dengan reminder otomatis; missed submission dicatat sebagai *compliance event* faktual, bukan otomatis konsekuensi disipliner
- **Correction Request** — mekanisme mengajukan perubahan terhadap Morning Commitment yang sudah locked pasca Cut-Off, menggunakan model **default-approve dengan objection window** (lihat Section 7 & 8), bukan approval aktif wajib — supaya prinsip "baseline tidak diam-diam ditulis ulang" tetap terjaga tanpa menambah beban administratif ke reviewer untuk setiap pengajuan
- **Leave & Exemption Management** — Leave (employee request → authorized approval), Holiday & individual Exemption (admin/HRGA-set langsung tanpa approval tambahan), masing-masing dengan single date/date range, effective period, dan audit trail; hari valid exception tidak dihitung No Submission
- **Role-Based Output Templates** — prompt/contoh output tambahan sesuai fungsi (Developer, QA, PM, Ops, Finance, HRGA, dll.)
- **Dashboard & Monitoring** — Employee, Head/Supervisor (exception-first), CEO/Management (company-wide trend), berbasis exception bukan leaderboard
- **Weekly Accountability Summary** & **Monthly Management Trend**
- **Manager Notes** — coaching / recognition / corrective, dengan visibilitas dan permission lebih ketat dari daily log biasa
- **Reporting** — Daily Exception, Weekly Team Summary, Monthly Trend, Individual Review Evidence, Blocker Root Cause
- **Audit Trail** — immutable, mencakup perubahan commitment setelah cutoff, status, blocker, dan manager note
- **Notification** — Email + Browser Push sebagai delivery utama, disertai Web Notification Center in-system untuk riwayat/status baca
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

**Dua area akses utama** (bukan dua portal terpisah seperti proyek sebelumnya, melainkan satu aplikasi dengan permission bertingkat):
- **Self-Service Area** — seluruh role mengisi Daily Accountability Record milik sendiri, melihat histori dan notifikasi pribadi
- **Management & Governance Area** — akses berjenjang sesuai role (Supervisor/TL → scoped team; Head → fungsi; HRGA → compliance & policy tertentu; CEO/Management → company-wide; System Admin → seluruh master data & konfigurasi teknis)

**Prinsip permission kunci:**
- Organizational role sebagai baseline; project authority dapat dipilih eksplisit sebagai konteks tambahan tanpa menggantikan direct manager
- **Satu person dapat menjadi Project Authority untuk lebih dari satu konteks/reference sekaligus** — bukan satu nilai tetap yang menempel permanen pada satu Organizational Assignment. Pemilihan Project Authority terjadi kontekstual, per blocker/escalation, tergantung reference/project mana yang relevan saat itu
- Disciplinary record dan manager coaching note memiliki lapisan permission lebih ketat dari daily log biasa
- Authorized Policy Owner berbeda-beda per jenis kebijakan (bukan satu Admin yang berkuasa atas semua kebijakan)

## 7. Lifecycle Status

### Submission Status (per check-in)
```
On-Time    → submit ≤ On-Time Deadline
Late       → submit > On-Time Deadline, ≤ Cut-Off (Grace Period)
No Submission → tidak ada submission valid sampai Cut-Off
```

### Blocker Lifecycle
```
Open → Acknowledged → In Progress → Resolved → Closed
                                   ↘ Accepted Risk (jalur alternatif)
```

### Outcome & Continuation (dua dimensi terpisah, dievaluasi bersama)
```
Outcome:      Completed / Partially Completed / Not Completed / Cancelled (with reason)
Continuation: Continue / Do Not Continue
```
*Carry Over bukan outcome — ia adalah kondisi Continuation, sehingga item "Partially Completed" tetap bisa berstatus "Continue".*

### Correction Request Lifecycle (perubahan baseline pasca Cut-Off)
```
Employee ajukan Correction Request (perubahan + reason)
   → Klasifikasi otomatis/configurable: Minor atau Material
      Minor (mis. perbaikan detail/typo, tidak mengubah makna)
         → Applied langsung, tetap tercatat di audit trail
      Material (mengubah makna commitment/outcome/status)
         → Pending, masuk Objection Window (durasi configurable)
            → Tidak ada objection sampai window berakhir → otomatis Applied
            → Reviewer berwenang mengajukan objection dalam window → Rejected,
              baseline asli tetap berlaku, tercatat di audit trail
```
*Reviewer tidak wajib melakukan apa pun untuk setiap pengajuan — Correction Request material berjalan otomatis (default-approve) kecuali ada objection eksplisit. Ini menjaga prinsip "baseline tidak diam-diam ditulis ulang" tanpa membebani reviewer meninjau setiap pengajuan secara aktif.*

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
```
GREEN  → on track, tidak ada blocker material
AMBER  → ada risiko, masih recoverable, wajib blocker/risk note
RED    → terancam/gagal tanpa intervensi, immediate escalation
```

## 8. Business Rules Kritis

- Maksimal 3 Morning Commitment — Additional Work dicatat terpisah, tidak menjadi Commitment ke-4 dan tidak mengubah baseline pagi
- Morning Commitment dapat diedit bebas sebelum Cut-Off. Setelah Cut-Off, baseline terkunci; perubahan apa pun wajib melalui **Correction Request** — tidak ada direct-edit langsung terhadap baseline yang sudah locked, sekecil apa pun perubahannya
- Correction Request kategori **Minor** applied langsung; kategori **Material** menggunakan **default-approve dengan objection window** — otomatis applied jika tidak ada objection dari reviewer berwenang dalam periode configurable, dan reviewer dapat menolaknya secara eksplisit selama window masih berjalan
- Batasan Minor vs Material, dan durasi Objection Window, adalah **nilai kebijakan configurable** — bukan prinsip yang di-hardcode
- Carry-over/Continuation "Continue" dan status AMBER/RED wajib memiliki reason/blocker note
- Status RED dan critical/instant blocker dapat dibuat kapan saja, tidak harus menunggu EOD
- Sistem **tidak pernah** menerbitkan SP atau memotong insentif secara otomatis — hanya menghasilkan evidence/flag; keputusan disipliner tetap melalui authorized management/HRGA
- Satu missed submission atau satu hari RED **tidak otomatis** menjadi konsekuensi disipliner
- Tidak ada leaderboard/task-count ranking dalam bentuk apa pun
- Manager tidak dapat diam-diam mengubah pernyataan employee — koreksi harus melalui manager note atau correction workflow yang ter-audit
- Perubahan struktur organisasi (person, role, fungsi, direct manager, reviewer, project authority) tidak boleh mengubah historical accountability — data historis tetap merefleksikan konteks organisasi yang berlaku saat event terjadi (effective-dated)
- Akun user (login credential) dibuat dan dikelola oleh Authorized Admin/Management melalui Organization Master Data — tidak ada mekanisme self-registration publik untuk role apa pun; karyawan menerima kredensial awal melalui mekanisme yang ditentukan Admin (mis. invite atau reset password wajib saat login pertama)
- Temporary Reviewer memiliki effective date & expiry date, tidak mengubah struktur permanen, dan seluruh penugasannya ter-audit
- Seluruh nilai kebijakan (bukan prinsip produk) bersifat configurable dan ter-versi dengan effective date — data historis tetap tunduk pada versi kebijakan yang berlaku saat itu
- Leave wajib melalui Authorized Approval sebelum berlaku sebagai valid exception; Holiday dan individual Exemption dapat langsung di-set oleh Admin/HRGA berwenang tanpa approval tambahan — keduanya sama-sama mengecualikan tanggal terkait dari No Submission detection
- No Surprise Rule: masalah boleh terjadi, tapi risiko yang sudah diketahui wajib dieskalasi sebelum menjadi kejutan
- Primary ownership ≠ exclusive ownership — cross-project support tetap wajib sesuai kompetensi dan prioritas

## 9. Gambaran Teknologi (High-Level)

Belum ditentukan secara final pada tahap PDD ini — akan dirumuskan pada dokumen **System Architecture Design**, dengan pertimbangan: sistem web-based (bukan aplikasi yang harus dibuka terus-menerus), kebutuhan role-based access control, audit trail immutable, dan notification delivery via Email + Browser Push. Prinsip arsitektural yang sudah terkunci dari Master Revision Register:

| Aspek | Prinsip |
|---|---|
| Policy | Configurable, versioned dengan effective date |
| History | Immutable / traceable |
| Authority | Contextual (organizational baseline + project authority, satu person bisa multi-scope) |
| Correction | Structured request, bukan direct silent edit — mekanisme locked, threshold/window configurable |
| Evidence | Auditable |
| Discipline | Human decision, di luar sistem |
| Notification | Email + Browser Push + Web Notification Center, external-capable untuk integrasi channel lain di masa depan |
| Delivery Model | Web-based, responsive, bukan mobile app di MVP |

---

*Dokumen ini menjadi acuan untuk PRD, UI/UX Spec & Flow, System Architecture Design, Product Backlog, dan Design System.*
```