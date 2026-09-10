# Product Requirement Document (PRD)
## WorkPulse — Daily Accountability & Blocker Log System

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.1 |
| Status | Ready for Design Phase |
| Date | September 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.1 |

## 1. Actors & Access Summary

| Role | Level Akses |
|---|---|
| Employee | Self-service — Daily Accountability Record milik sendiri, histori sendiri, notifikasi sendiri |
| Supervisor / Technical Lead | Scoped — tim/assigned scope; acknowledge & update blocker dalam scope; support note; dapat menjadi Authorized Reviewer untuk Correction Request/Leave sesuai policy |
| Head / Function Owner | Function-scoped — seluruh data dalam fungsinya; assign/escalate support; coaching note |
| PM | Self-service + project-scoped — log sendiri; project risk yang menjadi tanggung jawabnya |
| HRGA / People Admin | Compliance-scoped — policy compliance, exemption, coaching/warning record sesuai kewenangan |
| CEO / Management | Company-wide (read) — dashboard lintas fungsi, trend, keputusan/eskalasi |
| System Admin | System-wide (config) — master data, role mapping, jadwal/cutoff, notifikasi |
| Authorized Policy Owner | Policy-scoped — kewenangan berbeda per jenis kebijakan (bukan role tunggal; lihat Section 7) |

> Detail struktur organisasi, hierarki, dan model akses per persona sudah didefinisikan di PDD Section 4 & 6 — bagian ini hanya ringkasan acuan untuk requirement di bawah.

---

## 2. User Stories

### Employee
| ID | Story |
|---|---|
| US-01 | Sebagai Employee, saya ingin mengisi Morning Commitment (maks. 3) beserta Initial Risk, agar rencana harian saya tercatat sebagai baseline. |
| US-02 | Sebagai Employee, saya ingin mencatat Additional Work yang muncul setelah Morning Check-in, tanpa harus mengubah commitment awal saya. |
| US-03 | Sebagai Employee, saya ingin mengisi EOD Outcome dan Continuation untuk tiap commitment/additional work, agar hasil kerja saya hari ini terdokumentasi akurat. |
| US-04 | Sebagai Employee, saya ingin raise blocker/critical risk kapan saja (tidak menunggu EOD), agar masalah mendesak segera diketahui. |
| US-05 | Sebagai Employee, saya ingin menerima reminder sebelum cutoff, agar saya tidak melewatkan check-in tanpa sengaja. |
| US-06 | Sebagai Employee, saya ingin melihat histori dan weekly summary saya sendiri, agar saya bisa memantau pola kerja saya. |
| US-07 | Sebagai Employee, saya ingin copy-forward draft dari hari sebelumnya namun tetap wajib mengonfirmasi/mengedit, agar proses cepat tanpa kehilangan makna baseline. |

### Supervisor / Technical Lead
| ID | Story |
|---|---|
| US-08 | Sebagai Supervisor/TL, saya ingin melihat status tim/scope saya dalam satu dashboard exception-first, agar saya tidak perlu meminta laporan manual. |
| US-09 | Sebagai Supervisor/TL, saya ingin acknowledge blocker yang ditujukan ke saya dan memberi action/ETA, agar blocker tidak menggantung. |
| US-10 | Sebagai Supervisor/TL, saya ingin memberi support note pada anggota tim, agar dukungan lintas fungsi tercatat sebagai evidence. |

### Head / Function Owner
| ID | Story |
|---|---|
| US-11 | Sebagai Head, saya ingin melihat seluruh exception (RED, AMBER, repeated continuation, no-submission) dalam fungsi saya, agar saya bisa fokus pada hal yang benar-benar butuh perhatian. |
| US-12 | Sebagai Head, saya ingin assign atau eskalasi kebutuhan support lintas fungsi, agar blocker tidak terjebak di satu level. |
| US-13 | Sebagai Head, saya ingin membuat coaching/corrective/recognition note untuk anggota fungsi saya, agar pembinaan terdokumentasi. |
| US-14 | Sebagai Head, saya ingin ditunjuk atau menunjuk Temporary Reviewer saat posisi tertentu vacant, agar review tidak terhenti karena kekosongan struktur. |

### PM
| ID | Story |
|---|---|
| US-15 | Sebagai PM, saya ingin melihat project risk yang menjadi tanggung jawab saya lintas anggota tim proyek, agar saya punya visibilitas delivery. |
| US-16 | Sebagai PM, saya ingin menerima project-impact escalation meskipun bukan direct manager pelapor, agar authority berbasis proyek berjalan sesuai konteksnya. |

### HRGA
| ID | Story |
|---|---|
| US-17 | Sebagai HRGA, saya ingin melihat flag repeated non-submission dan compliance event, agar saya bisa memproses sesuai kebijakan. |
| US-18 | Sebagai HRGA, saya ingin mengelola exemption partisipasi (cuti, dinas, dll.), agar No Submission tidak salah ditandai pada hari yang valid. |
| US-19 | Sebagai HRGA, saya ingin akses terbatas ke coaching/warning record sesuai kewenangan saya, agar data sensitif tidak terekspos berlebihan. |

### CEO / Management
| ID | Story |
|---|---|
| US-20 | Sebagai CEO/Management, saya ingin melihat trend company-wide per fungsi (RED/AMBER, recurring blocker, no-submission), agar saya punya gambaran organisasi tanpa membaca laporan satu per satu. |
| US-21 | Sebagai CEO/Management, saya ingin melihat unresolved escalation aging, agar saya tahu mana yang butuh intervensi. |

### System Admin / Authorized Policy Owner
| ID | Story |
|---|---|
| US-22 | Sebagai System Admin, saya ingin mengatur cutoff, grace period, dan workday calendar sebagai kebijakan yang bisa berubah tanpa mengubah kode, agar sistem tetap sesuai kebutuhan operasional yang berkembang. |
| US-23 | Sebagai Authorized Policy Owner, saya ingin setiap perubahan kebijakan tersimpan dengan effective date dan versi, agar data historis tetap merefleksikan kebijakan yang berlaku saat itu. |
| US-24 | Sebagai Admin/Management berwenang, saya ingin mengubah struktur organisasi (person, role, direct manager, project authority) tanpa merusak histori accountability, agar perubahan organisasi riil tidak mendistorsi data masa lalu. |

### Correction Request & Leave Management 
| ID | Story |
|---|---|
| US-25 | Sebagai Employee, saya ingin mengajukan Correction Request untuk Morning Commitment yang sudah locked, agar saya bisa memperbaiki kesalahan tanpa mengubah baseline secara diam-diam. |
| US-26 | Sebagai Employee, saya ingin mengajukan Leave Request, agar hari saya tidak salah ditandai No Submission setelah disetujui. |
| US-27 | Sebagai Authorized Reviewer (Supervisor/TL/Head sesuai policy), saya ingin melihat Correction Request material dalam objection window dan mengajukan objection bila perlu, agar baseline tetap terjaga tanpa saya harus meninjau setiap pengajuan secara aktif. |

---

## 3. Functional Requirements

### 3.1 Authentication & Profile
| ID | Requirement |
|---|---|
| FR-01 | Sistem menyediakan login dan pemetaan role/function per user. |
| FR-02 | Setiap Daily Accountability Record menyimpan snapshot konteks organisasi (role, direct manager, function) yang berlaku pada tanggal tersebut. |
| FR-50 | User account dibuat oleh System Admin melalui Organization Master Data; tidak ada self-registration untuk role apa pun. Karyawan menerima kredensial awal sesuai mekanisme yang ditentukan Admin (mis. invite/reset password saat login pertama). |

### 3.2 Daily Accountability Record
| ID | Requirement |
|---|---|
| FR-03 | Employee dapat membuat/mengedit Morning Commitment (maksimal 3) sebelum Cut-Off, masing-masing dengan Initial Risk (GREEN/AMBER/RED). |
| FR-04 | Blocker dan Support Needed wajib diisi jika Initial Risk = AMBER/RED. |
| FR-05 | Setelah Cut-Off, Morning Commitment terkunci sebagai baseline; perubahan apa pun wajib melalui Correction Request (lihat Section 3.9) — tidak ada direct-edit terhadap baseline yang sudah locked. |
| FR-06 | Employee dapat mencatat Additional Work kapan saja setelah Morning Check-in, terpisah dari Commitment 1–3, dengan Reason (Newly Assigned/Missed in Planning/Priority Change/Operational-Incident/Other); Assigned By wajib jika Reason = Newly Assigned. |
| FR-07 | Additional Work tidak mengubah baseline Morning Commitment dan tidak dihitung sebagai commitment ke-4. |
| FR-08 | Employee dapat mengisi EOD Outcome (Completed/Partially Completed/Not Completed/Cancelled with reason) untuk tiap Commitment dan Additional Work. |
| FR-09 | Sistem menyediakan field Continuation (Continue/Do Not Continue) terpisah dari Outcome; Continuation Reason wajib jika Continue dan Outcome ≠ Completed. |
| FR-10 | Employee menetapkan Final Status (GREEN/AMBER/RED) pada EOD Check-in. |
| FR-11 | Sistem menyediakan copy-forward draft dari hari sebelumnya yang wajib dikonfirmasi/diedit user sebelum berlaku sebagai commitment resmi. |
| FR-12 | Sistem menampilkan Role-Based Output Template/prompt tambahan sesuai fungsi user saat pengisian check-in. |

### 3.3 Status Suggestion
| ID | Requirement |
|---|---|
| FR-13 | Sistem dapat menyarankan status (GREEN/AMBER/RED) berdasarkan rule configurable, tanpa mengubah pilihan user secara otomatis. |
| FR-14 | Sistem menampilkan validation prompt ketika status yang dipilih user tidak konsisten dengan data terkait (mis. GREEN dengan critical blocker tercatat). |

### 3.4 Blocker & Escalation
| ID | Requirement |
|---|---|
| FR-15 | User dapat membuat blocker dari daily record atau sebagai instant blocker di luar siklus EOD. |
| FR-16 | Blocker record menyimpan Type, Severity, Impact, Owner Needed, Raised At (auto), Expected Resolution (opsional), Status, dan Resolution Note. |
| FR-17 | Blocker mengikuti lifecycle Open → Acknowledged → In Progress → Resolved → Closed, dengan Accepted Risk sebagai jalur resolusi alternatif. |
| FR-18 | Sistem mendefinisikan secara eksplisit siapa berwenang acknowledge, update, resolve, dan close blocker pada tiap state. |
| FR-19 | Owner Needed pada blocker dapat ditentukan melalui Organizational Authority atau Project Authority (contextual), sesuai konteks pekerjaan terkait. |
| FR-20 | Sistem mengirim notifikasi eskalasi berdasarkan severity/status/aging sesuai escalation rule yang configurable. |
| FR-21 | Sistem melakukan auto-escalate ke level berikutnya jika RED tidak di-acknowledge dalam threshold configurable. |

### 3.5 Authority & Organization
| ID | Requirement |
|---|---|
| FR-22 | Authorized Admin/Management dapat create, edit, activate, deactivate, dan reassign person, role, function, direct manager, reviewer, dan project authority. |
| FR-23 | Setiap perubahan struktur organisasi disimpan dengan effective date dan (opsional) end date, tanpa menimpa/menghapus riwayat sebelumnya. |
| FR-24 | Data accountability historis selalu merujuk pada konteks organisasi yang berlaku pada tanggal event terjadi, bukan struktur terkini. |
| FR-25 | Authorized Admin/Management dapat menunjuk Temporary Reviewer dengan effective date dan expiry date tanpa mengubah struktur permanen. |

### 3.6 Submission Compliance
| ID | Requirement |
|---|---|
| FR-26 | Sistem mengklasifikasikan submission sebagai On-Time, Late (dalam grace period), atau No Submission berdasarkan konfigurasi cutoff yang berlaku. |
| FR-27 | Hari non-working (leave/holiday/exemption valid) tidak dihitung sebagai No Submission. |
| FR-28 | Sistem mengirim reminder otomatis mendekati deadline/cutoff. |
| FR-29 | Sistem mendeteksi dan menandai pola repeated non-submission dalam periode configurable, memicu flag untuk coaching. |
| FR-30 | Sistem tidak pernah menerbitkan sanksi/SP secara otomatis atas compliance event apa pun; hanya menghasilkan evidence/flag untuk keputusan manusia. |
| FR-49 | Sistem menghitung maksimum satu No Submission occurrence per applicable workday untuk keperluan pattern detection (FR-29), meskipun Morning dan EOD sama-sama terlewat; sistem tetap menyimpan submission spesifik (Morning/EOD/keduanya) mana yang terlewat sebagai evidence. |

### 3.7 Policy Configuration
| ID | Requirement |
|---|---|
| FR-31 | Authorized Policy Owner dapat mengonfigurasi nilai kebijakan (cutoff, grace period, workday/holiday calendar, escalation threshold & recipient, coaching follow-up period, retention period, exemption, objection window duration, batas minor/material change) tanpa mengubah kode. |
| FR-32 | Setiap perubahan kebijakan tersimpan sebagai versi baru dengan effective date, optional end date, status aktif/nonaktif, dan owner. |
| FR-33 | Data historis selalu dievaluasi menggunakan versi kebijakan yang berlaku pada tanggal event, bukan versi kebijakan terkini. |
| FR-34 | Sistem membatasi kewenangan edit tiap jenis kebijakan sesuai Authorized Policy Owner yang ditetapkan (bukan satu Admin berkuasa atas semua kebijakan). |
| FR-35 | Partisipasi wajib WorkPulse (included/excluded role, function, individual exemption, effective period) dapat dikonfigurasi tanpa hard-code. |

### 3.8 History, Notification & Reporting
| ID | Requirement |
|---|---|
| FR-36 | Employee dapat melihat histori Daily Accountability Record miliknya sendiri. |
| FR-37 | Sistem menyediakan pencarian/filter berdasarkan employee, function, project, tanggal, status, dan kategori blocker (sesuai permission role). |
| FR-38 | Sistem mengirim notifikasi melalui Email dan Browser Push, serta menampilkan riwayatnya di Web Notification Center. |
| FR-39 | Manager berwenang dapat membuat Manager Note (coaching/recognition/corrective) dengan visibilitas sesuai policy. |
| FR-40 | Manager tidak dapat mengubah pernyataan employee secara langsung/diam-diam; koreksi hanya melalui Manager Note atau correction workflow yang ter-audit. |
| FR-41 | Sistem menghasilkan Weekly Accountability Summary dan Monthly Management Trend sesuai scope akses user. |
| FR-42 | Authorized role dapat melakukan export data (summary/evidence) sesuai permission, tanpa mengekspos data di luar kewenangannya. |

### 3.9 Correction Request 
| ID | Requirement |
|---|---|
| FR-43 | Employee dapat mengajukan Correction Request atas Morning Commitment yang sudah locked (bila policy mengizinkan), disertai perubahan yang diminta dan Reason wajib. |
| FR-44 | Sistem mengklasifikasikan Correction Request sebagai **Minor** (applied langsung) atau **Material** (masuk Objection Window) berdasarkan rule configurable. Correction Request Material otomatis menjadi Applied jika tidak ada objection dari Authorized Reviewer dalam Objection Window; Reviewer dapat mengajukan objection secara eksplisit selama window berjalan, yang menghasilkan status Rejected dan baseline asli tetap berlaku. |
| FR-45 | Setiap Correction Request yang Applied (baik Minor maupun Material) wajib tercatat di audit trail (before/after value), ditautkan ke record Correction Request terkait. |

### 3.10 Leave & Exemption Management 
| ID | Requirement |
|---|---|
| FR-46 | HRGA/Admin dapat membuat, mengedit, dan menonaktifkan Holiday dan individual Exemption (single date/date range, effective period) tanpa memerlukan approval tambahan. |
| FR-47 | Employee dapat mengajukan Leave Request; Leave hanya berlaku sebagai valid exception setelah disetujui oleh Authorized Approval sesuai policy. |
| FR-48 | Leave/Holiday/Exemption yang berstatus valid mengecualikan tanggal terkait secara otomatis dari No Submission detection (FR-27), tanpa memerlukan aksi manual tambahan pada tanggal berjalan. |

---

## 4. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| NFR-01 | Usability | Morning dan EOD check-in masing-masing dapat diselesaikan dalam ±2–3 menit; minimal input mengetik (quick-select, recent task, template). |
| NFR-02 | Responsiveness | Web-responsive di device desktop dan mobile browser; bukan native mobile app di MVP. |
| NFR-03 | Performance | Dashboard dan entri harian merespons < 2 detik pada beban normal perusahaan. |
| NFR-04 | Availability | Andal pada jam kerja; menangani kegagalan jaringan sementara secara graceful. |
| NFR-05 | Security | Role-based access control, autentikasi aman, transport terenkripsi, prinsip least privilege. |
| NFR-06 | Auditability | Audit trail immutable untuk seluruh material edit — status, blocker, kebijakan, struktur organisasi, correction request, dan manager note. |
| NFR-07 | Privacy | Hanya mengumpulkan data terkait pekerjaan yang diperlukan untuk accountability; tidak ada telemetry pengawasan aktivitas. |
| NFR-08 | Configurability | Seluruh nilai kebijakan (bukan prinsip produk) tidak boleh hard-coded; wajib dapat dikonfigurasi dan diversi. |
| NFR-09 | Retention | Retensi data dapat dikonfigurasi; evidence disciplinary/HR dapat mengikuti retention policy terpisah. |
| NFR-10 | Backup | Backup database rutin dengan proses restore yang teruji. |
| NFR-11 | Exportability | Export data untuk kebutuhan management/HR tanpa mengekspos data sensitif di luar kewenangan. |
| NFR-12 | Anti-gaming | Tidak ada mekanisme yang mendorong task-count gaming atau pemecahan pekerjaan menjadi task kecil demi tampilan produktif. |

---

## 5. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Maksimal 3 Morning Commitment; Additional Work dicatat terpisah dan tidak dihitung sebagai commitment ke-4. |
| BR-02 | Morning Commitment dapat diedit bebas sebelum Cut-Off; setelah Cut-Off, baseline terkunci dan perubahan apa pun wajib melalui Correction Request (BR-16). |
| BR-03 | Continuation "Continue" dan status AMBER/RED wajib disertai reason/blocker note. |
| BR-04 | Status RED dan critical/instant blocker dapat dibuat kapan saja tanpa menunggu EOD. |
| BR-05 | Sistem tidak pernah menerbitkan SP atau memotong insentif secara otomatis; hanya menghasilkan evidence/flag. |
| BR-06 | Satu missed submission atau satu hari RED tidak otomatis menghasilkan konsekuensi disipliner. |
| BR-07 | No Submission tidak berlaku pada leave/holiday/exemption valid sesuai konfigurasi. |
| BR-08 | Tidak ada leaderboard atau ranking berbasis jumlah task dalam bentuk apa pun. |
| BR-09 | Manager tidak dapat mengubah pernyataan employee secara langsung; koreksi hanya melalui Manager Note/correction workflow ter-audit. |
| BR-10 | Perubahan struktur organisasi tidak boleh mengubah historical accountability; data historis tetap merefleksikan konteks organisasi yang berlaku saat event terjadi. |
| BR-11 | Temporary Reviewer memiliki effective date & expiry date, tidak mengubah struktur permanen, dan seluruh penugasan ter-audit. |
| BR-12 | Seluruh nilai kebijakan bersifat configurable dan ter-versi dengan effective date; data historis tunduk pada versi kebijakan yang berlaku saat event terjadi. |
| BR-13 | Cross-project support tetap wajib sesuai kompetensi dan prioritas (primary ownership ≠ exclusive ownership). |
| BR-14 | Data disciplinary/coaching memiliki permission lebih ketat daripada daily record biasa. |
| BR-15 | Kewenangan mengubah tiap jenis kebijakan dibatasi ke Authorized Policy Owner yang ditetapkan untuk jenis kebijakan tersebut. |
| BR-16 | Correction Request tidak boleh langsung mengubah baseline. Correction Request Minor applied langsung (tercatat audit trail); Correction Request Material wajib melalui Objection Window — default-approve (otomatis Applied) jika tidak ada objection eksplisit dari Authorized Reviewer dalam periode configurable. |
| BR-17 | Maksimum satu No Submission occurrence dihitung per applicable workday untuk pattern detection, meskipun Morning dan EOD sama-sama terlewat pada hari yang sama; sistem tetap menyimpan submission spesifik mana yang terlewat sebagai evidence. |
| BR-18 | Leave wajib melalui Authorized Approval sebelum berlaku sebagai valid exception; Holiday dan individual Exemption dapat langsung di-set oleh Admin/HRGA berwenang tanpa approval tambahan. |

---

## 6. Data Requirements (Conceptual)

*Level konsep — entitas dan informasi kunci yang harus tersimpan sistem; skema teknis (tipe kolom, relasi FK, indexing) menjadi wilayah System Architecture Design.*

| Entitas | Informasi Kunci |
|---|---|
| User | Identitas, role, function, status aktif |
| Organizational Assignment | Person, role, function, direct manager — dengan effective date & end date |
| Project Authority Mapping | Person, scope/reference terkait, effective date & end date — independen dari Organizational Assignment; satu person dapat memiliki lebih dari satu mapping aktif sekaligus |
| Temporary Reviewer Assignment | Reviewer, scope, effective date, expiry date |
| Daily Accountability Record | Employee, tanggal, snapshot konteks organisasi, morning/EOD submission timestamp, initial/final status |
| Commitment | Teks commitment, reference/task link, **Initial Risk (GREEN/AMBER/RED)** , **Known Blocker (conditional)** , **Support Needed (conditional)** , outcome, continuation, continuation reason |
| Additional Work | Reason, assigned by (jika relevan), outcome, continuation |
| Blocker | Type, severity, impact, owner needed (authority context), status, timestamps, resolution note |
| Support Contribution | Blocker/request terkait, supporter, action, catatan hasil |
| Correction Request  | Target record (Commitment), perubahan yang diminta, reason, klasifikasi (Minor/Material), status (Applied/Pending/Rejected), Objection Window start/end, reviewer (jika ada objection), timestamp |
| Exception (Leave/Holiday/Exemption)  | Tipe (Leave/Holiday/Exemption), employee (khusus Leave), tanggal/date range, effective period, status approval & approver (khusus Leave), audit trail |
| Manager Note | User terkait, tipe (coaching/recognition/corrective), evidence reference, visibilitas |
| Compliance Event | User, jenis event, tanggal, versi policy yang berlaku, status tindak lanjut |
| Policy | Jenis kebijakan, nilai, versi, effective date, end date, owner |
| Notification | Penerima, trigger, channel (Email/Browser Push), status kirim/baca |
| Audit Log | Actor, aksi, entitas terkait, nilai before/after, timestamp |

---

## 7. Permission & Visibility Requirements

| Data | Employee | Supervisor/TL | Head | HRGA | CEO/Management | System Admin |
|---|---|---|---|---|---|---|
| Own Daily Accountability Record | Read/Write | – | – | Policy view only | Sesuai kewenangan | – |
| Scoped team record | – | Read | Read | Sesuai policy | Read | – |
| Blocker assigned ke user | Read/Write action | Read/Write action | Read/Write action | Sesuai policy | Read | – |
| Manager coaching note | Hanya note yang boleh dilihat sendiri | Create (scoped, jika berwenang) | Create (scoped) | Read/administrative | Read | – |
| Disciplinary record | Limited/notification | Tidak ada default | Limited | Read/Write (berwenang) | Read | – |
| Company-wide dashboard | – | Scoped | Function-scoped | Compliance view | Read | – |
| Policy configuration | – | – | – | Terbatas | – | Admin/Authorized Policy Owner |
| Organizational master data | – | – | – | – | – | Admin/Management berwenang |
| Correction Request (ajukan)  | Create (milik sendiri) | – | – | – | – | – |
| Correction Request (objection)  | – | Sesuai policy reviewer | Sesuai policy reviewer | – | – | – |
| Leave Request (ajukan/approve) | Create (milik sendiri) | Approve (jika Authorized) | Approve (jika Authorized) | Approve/administrative | Read | – |

---

## 8. Notification Requirements

| Trigger | Recipient | Channel |
|---|---|---|
| Morning/EOD mendekati cutoff belum submit | Employee | Reminder — Email + Browser Push |
| AMBER + support needed | Assigned support owner + employee | Support request — Email + Browser Push + Web Notification Center |
| RED | Supervisor/Head + relevant PM/owner (authority context) | Immediate escalation — Email + Browser Push |
| Critical/instant blocker | Configured escalation chain | Immediate — Email + Browser Push |
| Blocker unacknowledged melebihi threshold | Next escalation level | Escalation — Email + Browser Push |
| Repeated no-submission flag | Supervisor/Head; HRGA jika threshold policy terpenuhi | Review required — Email |
| Weekly summary tersedia | Employee + Manager sesuai konfigurasi | Summary notification — Email |
| Policy/organizational assignment berubah pada user terkait | User yang terdampak; Authorized Policy Owner terkait | Web Notification Center |
| Correction Request Material diajukan  | Authorized Reviewer terkait | Web Notification Center + Email |
| Correction Request menuju akhir Objection Window  | Authorized Reviewer terkait (reminder terakhir sebelum auto-applied) | Web Notification Center |
| Correction Request Applied/Rejected  | Employee pengaju | Web Notification Center |
| Leave Request diajukan  | Authorized Approver terkait | Email + Browser Push |
| Leave Request disetujui/ditolak | Employee pengaju | Email + Web Notification Center |

Seluruh notifikasi juga tercatat riwayatnya di **Web Notification Center** in-system, terlepas dari channel pengirimannya.

---

## 9. Reporting Requirements

| Report | Audience | Wajib Berisi |
|---|---|---|
| Daily Exception Report | Head/Management | RED, AMBER, no-submission, critical blocker, overdue acknowledgement |
| Weekly Team Summary | Head + Team (sesuai konfigurasi) | Distribusi outcome, recurring blocker, continuation "Continue" berulang, support, exception |
| Monthly Management Trend | CEO/Management | Trend per fungsi, recurring root cause, escalation aging, compliance pattern |
| Individual Review Evidence | Employee + authorized manager/HR | Histori periode terpilih, notes, evidence untuk coaching/evaluasi |
| Blocker Root Cause Report | Head/Management | Kategori blocker paling sering dan systemic bottleneck |

Seluruh report tunduk pada Permission & Visibility Requirements (Section 7) dan tidak boleh menghasilkan ranking/leaderboard individual.

---

## 10. Acceptance Criteria

| ID | Acceptance Criteria |
|---|---|
| AC-01 | Employee dapat submit Morning Commitment maksimum 3 item beserta Initial Risk; blocker/support wajib terisi jika AMBER/RED. |
| AC-02 | Additional Work dapat dicatat kapan saja setelah Morning Check-in tanpa mengubah baseline Morning Commitment. |
| AC-03 | EOD Check-in menghasilkan Outcome dan Continuation sebagai dua field terpisah; kombinasi Partially Completed + Continue dapat tersimpan valid. |
| AC-04 | Setelah Cut-Off, edit terhadap Morning Commitment hanya dapat dilakukan melalui Correction Request, menghasilkan entry audit trail before/after. |
| AC-05 | Employee dapat raise RED/critical blocker sebelum EOD, dan sistem langsung mengirim eskalasi sesuai authority context. |
| AC-06 | Assigned support owner menerima notifikasi (Email/Browser Push) dan dapat acknowledge/update blocker sesuai lifecycle yang berlaku. |
| AC-07 | Head hanya melihat data tim/scope/fungsi yang berhak dilihatnya. |
| AC-08 | CEO/Management dashboard menampilkan exception company-wide sesuai permission, tanpa leaderboard individual. |
| AC-09 | Leave/exempt workday tidak ditandai sebagai No Submission. |
| AC-10 | Missed submission tercatat sebagai compliance event dan reminder berjalan; tidak ada auto-SP yang diterbitkan sistem. |
| AC-11 | Perubahan struktur organisasi (mis. reassignment direct manager) tidak mengubah tampilan data historis sebelum effective date perubahan tersebut. |
| AC-12 | Perubahan nilai kebijakan (mis. cutoff) tervisi dengan effective date; data sebelum tanggal tersebut tetap dievaluasi dengan versi kebijakan lama. |
| AC-13 | Temporary Reviewer yang ditunjuk menerima escalation sesuai scope selama periode efektifnya, dan otomatis tidak lagi menerima setelah expiry. |
| AC-14 | Weekly summary tersedia untuk periode yang dipilih sesuai scope akses user. |
| AC-15 | Material edit (commitment setelah cutoff, status, blocker, manager note, kebijakan, struktur organisasi) menghasilkan audit trail. |
| AC-16 | Sistem tidak menampilkan leaderboard/ranking task-completion dalam kondisi apa pun. |
| AC-17 | User dapat menyelesaikan check-in normal dalam ≤3 menit pada usability test internal. |
| AC-18 | Correction Request Minor langsung Applied dengan audit trail; Correction Request Material yang tidak mendapat objection dalam Objection Window otomatis menjadi Applied; Correction Request yang di-objection dalam window menjadi Rejected dan baseline asli tetap berlaku. |
| AC-19 | Leave Request yang belum disetujui tidak mengecualikan tanggal terkait dari No Submission; setelah disetujui, tanggal tersebut otomatis dikecualikan. |
| AC-20 | Export data hanya menghasilkan data sesuai scope visibility user yang melakukan export; tidak ada data di luar kewenangannya yang ikut terekspor. |
