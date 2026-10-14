# Product Requirement Document (PRD)
## WorkPulse — Daily Accountability & Blocker Log System

| Document | Value |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.5 |
| Status | FINAL — baseline reconciliation addendum & finalisasi definitif FR-12/AC-37 |
| Date | Oktober 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.4 FINAL; baseline Management v1.0; ADR-006, ADR-008, ADR-013, ADR-014, ADR-017, ADR-018, dan keputusan produk lain yang relevan |

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

> Detail struktur organisasi, hierarki, dan model akses per persona sudah didefinisikan di PDD Section 4 & 6 — bagian ini menyajikan ringkasan komposisi organisasi awal dan jalur eskalasi sebagai acuan normatif requirement sistem.

### 1.1 Komposisi Organisasi Awal (Baseline Dutamedia)

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

### 1.2 Jalur Eskalasi Standar per Fungsi (Baseline Escalation Paths)

| Sumber Eskalasi | Eskalasi Awal (*Initial Escalation*) | Tingkat Lanjutan & Pemicu (*Next Level / Trigger*) |
|---|---|---|
| **Developer** | Technical Lead | Head Engineering (jika konflik prioritas, tak terselesaikan, atau berdampak proyek) |
| **Technical Lead** | Head Engineering | R&D / Principal Engineer (untuk konsultasi arsitektur L3 jika diperlukan) |
| **Ops Staff** | Ops Supervisor | Head Ops & Infra → Engineering / R&D sesuai akar masalah |
| **QA/QC** | PM + Technical Owner | Head Delivery / CEO (jika komitmen rilis atau proyek terancam gagal) |
| **PM** | Head Delivery (*future*) | CEO sementara (karena Head Delivery masih kosong atau keputusan material dibutuhkan) |
| **Commercial (BD/Presales)** | Head Sales Enablement / Commercial Owner | CEO / Finance / Engineering sesuai jenis keputusan bisnis/teknis |
| **Finance / HRGA** | Senior / Management Owner | CEO (bila terdapat eksposur kebijakan atau persetujuan material) |

**Aturan akses Pulse Dashboard:** satu menu navigasi bernama **Pulse Dashboard** hanya ditampilkan kepada pengguna yang memiliki setidaknya satu kewenangan dashboard yang relevan. Menu tersebut membuka cakupan dashboard yang diizinkan oleh role, permission, dan scope efektif pengguna. Employee biasa tidak memperoleh akses ke Team Pulse, Function Pulse, atau Management Pulse hanya karena memiliki akun. Kewenangan lebih dari satu dashboard dapat dimiliki pengguna yang memang memiliki beberapa role/permission; sistem hanya menawarkan cakupan yang diizinkan. Menyembunyikan menu bukan pengganti validasi akses pada route dan data.

---

## 2. User Stories

### Employee
| ID | Story |
|---|---|
| US-01 | Sebagai Employee, saya ingin mengisi 0–3 Morning Commitment beserta Initial Risk, atau mencatat alasan jika tidak ada Commitment, agar baseline harian merefleksikan kondisi sebenarnya tanpa mendorong Commitment fiktif. |
| US-02 | Sebagai Employee, saya ingin mencatat Additional Work yang muncul setelah Morning Check-in, tanpa harus mengubah commitment awal saya. |
| US-03 | Sebagai Employee, saya ingin mengisi EOD Outcome dan Continuation untuk tiap commitment/additional work, agar hasil kerja saya hari ini terdokumentasi akurat. |
| US-04 | Sebagai Employee, saya ingin raise blocker/critical risk kapan saja (tidak menunggu EOD), agar masalah mendesak segera diketahui. |
| US-05 | Sebagai Employee, saya ingin menerima reminder sebelum On-Time Deadline melalui kanal yang ditentukan, termasuk Browser Push yang berfungsi ketika saya mengizinkannya, agar saya tidak melewatkan check-in tanpa sengaja. |
| US-06 | Sebagai Employee, saya ingin melihat histori dan weekly summary saya sendiri, agar saya bisa memantau pola kerja saya. |
| US-07 | Sebagai Employee, saya ingin melihat seluruh Morning Commitment hari kerja sebelumnya yang memiliki Continuation = Continue sebagai kumpulan draft, agar saya dapat memilih draft yang relevan tanpa item dihilangkan atau dijadikan komitmen resmi secara otomatis. |

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
| US-28 | Sebagai Employee, saya ingin menyimpan catatan opsional Tomorrow Priority pada EOD dan melihatnya terpisah pada Morning berikutnya, agar konteks prioritas tetap terlihat tanpa menjadi Commitment otomatis. |
| US-29 | Sebagai Employee, saya ingin mengajukan EOD Correction Request terpisah untuk data EOD yang telah terkunci, agar kesalahan dapat dikoreksi tanpa menulis ulang data secara diam-diam. |
| US-30 | Sebagai pelapor blocker, saya ingin mengonfirmasi blocker yang sudah ditandai Resolved menjadi Closed, agar penutupan mencerminkan bahwa solusi telah dikonfirmasi. |
| US-31 | Sebagai karyawan, saya ingin mengaktifkan akun melalui undangan yang aman dan terikat pada akun yang dibuat Admin, agar saya dapat masuk tanpa self-registration publik atau berbagi kata sandi sementara melalui pesan. |

---

## 3. Functional Requirements

### 3.1 Authentication & Profile
| ID | Requirement |
|---|---|
| FR-01 | Sistem menyediakan login dan pemetaan role/function per user. |
| FR-02 | Setiap Daily Accountability Record menyimpan snapshot konteks organisasi (role, direct manager, function) yang berlaku pada tanggal tersebut. |
| FR-50 | User account dibuat dan dikelola oleh System Admin/Management yang berwenang melalui Organization Master Data; tidak ada self-registration publik untuk role apa pun. |
| FR-54 | Aktivasi awal dilakukan melalui undangan yang terikat pada akun yang telah dibuat Admin/Management berwenang. Token undangan hanya dapat digunakan sekali, memiliki masa berlaku, dan setelah valid digunakan karyawan menetapkan kredensialnya sendiri. Undangan dapat dibatalkan atau diterbitkan ulang oleh aktor berwenang; masa berlaku ditetapkan dalam konfigurasi keamanan awal sebelum implementasi. Sistem tidak mengirim kata sandi permanen melalui undangan. |

### 3.2 Daily Accountability Record
| ID | Requirement |
|---|---|
| FR-03 | Employee dapat menyerahkan Morning Check-in dengan 0–3 Morning Commitment sebelum Cut-Off. Setiap Commitment yang dibuat memiliki Initial Risk (GREEN/AMBER/RED). Jika tidak ada Commitment, alasan wajib diisi; kondisi ini tetap merupakan submission yang valid dan tunduk pada aturan waktu submission. |
| FR-04 | Known Blocker dan Support Needed wajib diisi pada Commitment jika Initial Risk = AMBER/RED. |
| FR-05 | Setelah Cut-Off, Morning Commitment terkunci sebagai baseline; perubahan apa pun wajib melalui Morning Correction Request (lihat Section 3.9) — tidak ada direct-edit terhadap baseline yang sudah locked. |
| FR-06 | Employee dapat mencatat Additional Work kapan saja setelah Morning Check-in, terpisah dari Commitment 1–3, dengan Reason (Newly Assigned/Missed in Planning/Priority Change/Operational-Incident/Other); Assigned By wajib jika Reason = Newly Assigned. |
| FR-07 | Additional Work tidak mengubah baseline Morning Commitment dan tidak dihitung sebagai commitment ke-4. |
| FR-08 | Employee dapat mengisi EOD Outcome (Completed/Partially Completed/Not Completed/Cancelled with reason) untuk tiap Commitment dan Additional Work. |
| FR-09 | Sistem menyediakan field Continuation (`Continue`/`Do Not Continue`) yang terpisah dari Outcome. Jika Continuation = `Continue`, Continuation Reason wajib diisi terlepas dari nilai Outcome. Outcome dan Continuation tidak boleh digabung menjadi satu status. |
| FR-10 | Employee menetapkan Final Status (`GREEN`/`AMBER`/`RED`) pada EOD Check-in. Jika Final Status = `AMBER` atau `RED`, pengguna wajib mencatat penjelasan risiko/blocker tingkat-hari. Penjelasan ini berbeda dari Known Blocker/Support Needed per Commitment pada Morning Check-in. |
| FR-11 | Sistem menyediakan **koleksi draft copy-forward** yang bersumber secara eksklusif dari Morning Commitment pada hari kerja sebelumnya milik karyawan yang sama, dengan `continuation = Continue`. Semua item yang memenuhi syarat harus dipertahankan sebagai koleksi. Pengguna memilih item yang ingin dimasukkan ke slot Morning Commitment yang tersedia (maksimal 3), lalu meninjau/mengedit dan melengkapi data wajib sebelum submit. Draft hanya mengisi form; tidak pernah submit otomatis. `Additional Work` bukan sumber FR-11 dan `Tomorrow Priority` bukan sumber kebenaran FR-11. |
| FR-12 | Sistem menampilkan Role-Based Output Prompt/panduan kontekstual sesuai fungsi organisasi pengguna saat pengisian Morning Check-in. Pemilihan panduan bersumber langsung dari atribut `function` penugasan organisasi aktif pengguna (`authStore.user.function`), bukan dari system role atau job title. Teks panduan seragam di seluruh slot Commitment #1, #2, dan #3, berorientasi aksi (*action-oriented*), disajikan dalam Bahasa Indonesia sebagai placeholder visual bergaya miring (*italic, text-secondary*), bersifat murni *inline hint* non-binding yang tidak mengunci format, tidak mengotori form input, dan tidak ikut tersimpan ke database. Sistem mendukung 7 fungsi kanonikal: (1) **Engineering**: *"Contoh: Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji"*; (2) **Ops & Infra**: *"Contoh: Menyelesaikan konfigurasi atau pekerjaan infrastruktur yang direncanakan hari ini"*; (3) **Finance**: *"Contoh: Menyelesaikan rekonsiliasi atau proses administrasi keuangan yang menjadi prioritas hari ini"*; (4) **Sales Enablement**: *"Contoh: Menyelesaikan materi atau kebutuhan pendukung aktivitas penjualan hari ini"*; (5) **Delivery**: *"Contoh: Menyelesaikan koordinasi atau pekerjaan yang mendukung delivery proyek hari ini"*; (6) **HRGA**: *"Contoh: Menyelesaikan proses administrasi atau kebutuhan operasional karyawan hari ini"*; (7) **Management**: *"Contoh: Menyelesaikan prioritas koordinasi atau keputusan yang perlu ditindaklanjuti hari ini"*. Jika fungsi kosong, null, atau belum terpetakan, sistem menggunakan fallback netral resmi: *"Contoh: Tuliskan rencana pekerjaan yang ingin Anda selesaikan hari ini"*. |
| FR-51 | Sistem menghitung Initial Daily Status dari Initial Risk seluruh Morning Commitment: RED jika ada minimal satu Commitment RED; selain itu AMBER jika ada minimal satu Commitment AMBER; selain itu GREEN jika terdapat minimal satu Commitment dan semuanya GREEN. Jika tidak ada Commitment, Initial Daily Status adalah `NOT_APPLICABLE — NO_COMMITMENT` dan alasan wajib disimpan. Status ini bukan Final Status EOD, bukan `No Submission`, dan tidak dapat diperlakukan sebagai GREEN. |
| FR-52 | Employee dapat mengisi `Tomorrow Priority` secara opsional pada EOD. Sistem menyimpan catatan tersebut dan menampilkannya pada Morning Check-in hari kerja berikutnya sebagai konteks terpisah. Catatan ini tidak menjadi sumber, tidak membuat, tidak memilih, tidak mengurutkan, dan tidak mengubah draft Commitment FR-11 serta tidak memengaruhi Initial Daily Status. |

### 3.3 Status Suggestion
| ID | Requirement |
|---|---|
| FR-13 | Sistem memberikan saran status (GREEN/AMBER/RED) melalui heuristik produk deterministik, tanpa memutasi pilihan pengguna, dengan urutan evaluasi: (1) blocker aktif berseverity Critical atau insiden produksi menghasilkan RED; (2) jika sekurang-kurangnya 50% item pekerjaan dengan Outcome valid berstatus Not Completed atau Cancelled, menghasilkan RED; (3) jika terdapat carry-over/continuation kedua berturut-turut pada item komitmen yang sama atau terdapat blocker aktif berseverity High, menghasilkan minimal AMBER; (4) jika ada Outcome Partially Completed, Not Completed, atau Cancelled tetapi proporsi Not Completed/Cancelled di bawah 50%, menghasilkan minimal AMBER; (5) GREEN hanya jika terdapat item yang dapat dievaluasi, seluruhnya Completed, dan tidak ada blocker aktif. Jika tidak ada item yang dapat dievaluasi dan tidak ada blocker aktif, sistem tidak memberikan saran status. Blocker aktif adalah blocker dalam state Open, Acknowledged, atau In Progress. Heuristik ini adalah aturan produk tetap, bukan konfigurasi runtime Policy Configuration. |
| FR-14 | Sistem menampilkan validation prompt ketika status yang dipilih user tidak konsisten dengan data terkait (mis. GREEN dengan critical blocker tercatat). |

### 3.4 Blocker & Escalation
| ID | Requirement |
|---|---|
| FR-15 | User dapat membuat blocker dari daily record atau sebagai instant blocker di luar siklus EOD. |
| FR-16 | Blocker record menyimpan Type resmi (`Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`), Severity (`Low`, `Medium`, `High`, `Critical`), Impact (`Task`, `Milestone`, `Project`, `Production`, `Client`, `Financial`, `Compliance`), Owner Needed (Authority Context), Raised At (auto timestamp), Expected Resolution (opsional target tanggal/waktu), Status, dan Resolution Note wajib saat ditutup. |
| FR-17 | Blocker mengikuti lifecycle Open → Acknowledged → In Progress → Resolved → Closed, dengan Accepted Risk sebagai jalur keputusan alternatif yang terpisah dari Closed. |
| FR-18 | Assigned support owner/penanggung jawab penanganan dapat menandai blocker Resolved dengan resolution note. Pelapor (`raisedByUserId`) mengonfirmasi Closed. Hanya authority berwenang pada konteks terkait yang dapat menetapkan Accepted Risk. Jika pelapor belum mengonfirmasi, blocker tetap Resolved; sistem tidak menutupnya otomatis berdasarkan waktu. Semua transisi dan aktornya diaudit. |
| FR-19 | Owner Needed pada blocker ditentukan berdasarkan Authority Context: Organizational Authority sebagai default atau Project Authority yang dipilih eksplisit untuk proyek/reference relevan. Pemilihan orang tertentu oleh pelapor bersifat opsional; jika tidak dipilih, sistem menentukan penerima berdasarkan assignment/mapping aktif dan aturan resolusi yang berlaku. Untuk Organizational Authority, Direct Manager menjadi kandidat awal untuk blocker pekerjaan sehari-hari. Pilihan manual harus valid untuk konteks dan scope terkait. Jika kandidat tidak tersedia/ambigu, gunakan fallback yang dikonfigurasi; jika tidak ada penerima valid, jangan kirim ke orang yang tidak sesuai dan tampilkan kegagalan yang dapat ditindaklanjuti. |
| FR-19a | Sistem memvalidasi Owner Needed yang dipilih manual terhadap status aktif, Authority Context, scope/project, dan assignment/mapping yang berlaku pada waktu kejadian; pilihan tidak valid ditolak dengan pesan yang menjelaskan tindakan perbaikan. |
| FR-19b | Resolusi otomatis menggunakan Direct Manager sebagai kandidat awal untuk Organizational Authority. Jika tidak tersedia, sistem mengikuti fallback organisasi yang dikonfigurasi. Untuk Project Authority, sistem menggunakan Project Authority Mapping aktif yang cocok dengan project/reference; jika beberapa kandidat tetap ambigu setelah prioritas yang dikonfigurasi diterapkan, sistem tidak memilih secara arbitrer dan meminta perbaikan mapping/konfirmasi yang sesuai. |
| FR-19c | Jika tidak ada penerima valid setelah fallback, sistem tidak mengirim blocker ke penerima yang tidak sesuai, tidak menampilkan sukses, dan memberikan pesan yang dapat ditindaklanjuti. Dasar resolusi, Authority Context, penerima akhir, penggunaan fallback, dan waktu penentuan dicatat pada audit trail blocker. |
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
| FR-26 | Sistem mengklasifikasikan submission Morning dan EOD sebagai On-Time jika `submittedAt ≤ On-Time Deadline`, Late jika `On-Time Deadline < submittedAt ≤ Cut-Off`, dan No Submission jika tidak ada submission valid sampai Cut-Off. `Cut-Off = On-Time Deadline + Grace Period`; nilai Grace Period `0` valid. Request setelah Cut-Off ditolak tanpa menulis data. Validitas request ditentukan dari timestamp request, bukan timing scheduler; scheduler hanya melakukan cutoff locking dan evaluasi No Submission. |
| FR-27 | Hari non-working (leave/holiday/exemption valid) tidak dihitung sebagai No Submission. |
| FR-28 | Sistem mengirim reminder otomatis mendekati deadline/cutoff. **Semantik reminder (ADR-014):** (1) Jendela aktif dimulai tepat 60 menit sebelum On-Time Deadline dan berakhir tepat pada On-Time Deadline, yaitu `[Deadline - 60m, Deadline)` / `OnTimeDeadline - 60m <= now < OnTimeDeadline` (contoh untuk jadwal default: Morning `[08:00, 09:00)` dan EOD `[17:00, 18:00)`). (2) Ambang 60 menit adalah aturan tetap produk MVP, bukan kategori policy runtime. (3) Reminder hanya dievaluasi sebelum On-Time Deadline; reminder tidak menandakan keterlambatan atau mengubah status submission. Grace Period setelah deadline tidak termasuk jendela reminder. (4) Pengiriman reminder idempoten dan maksimum satu reminder dikirim per karyawan, per fase, per applicable workday. Reminder untuk karyawan yang belum submit tidak bergantung pada keberadaan Daily Accountability Record yang baru dibuat saat pengguna submit; `relatedEntityId` untuk reminder sebelum record ada bernilai `null`. |
| FR-29 | Sistem memicu pattern flag untuk coaching setelah **3 kejadian No Submission** dalam jendela evaluasi yang dapat dikonfigurasi. Ambang jumlah 3 kejadian adalah aturan tetap produk, bukan policy runtime; jendela evaluasinya merupakan nilai kebijakan. Satu applicable workday menyumbang maksimum satu kejadian untuk pattern detection meskipun Morning dan EOD sama-sama terlewat; bukti submission yang terlewat tetap dicatat per fase. |
| FR-30 | Sistem tidak pernah menerbitkan sanksi/SP secara otomatis atas compliance event apa pun; hanya menghasilkan evidence/flag untuk keputusan manusia. |
| FR-49 | Sistem menghitung maksimum satu No Submission occurrence per applicable workday untuk keperluan pattern detection (FR-29), meskipun Morning dan EOD sama-sama terlewat; sistem tetap menyimpan submission spesifik (Morning/EOD/keduanya) mana yang terlewat sebagai evidence. |

### 3.7 Policy Configuration
| ID | Requirement |
|---|---|
| FR-31 | Authorized Policy Owner dapat mengonfigurasi nilai yang secara eksplisit ditetapkan sebagai kebijakan operasional (cutoff, grace period, workday/holiday calendar, escalation threshold & recipient, coaching follow-up period, retention period dalam rentang yang diizinkan, exemption/participation rules yang didukung, objection window duration, dan batas minor/material change) tanpa mengubah kode. **Batas aturan:** aturan tetap produk dan batas keamanan tidak dapat diubah melalui policy runtime. **Semantik export retention (ADR-009):** parameter `exportRetentionMinutes` mengatur masa berlaku tautan unduh report export (PDF/XLSX) yang diterbitkan on-demand; nilai default 15 menit dan rentang yang diizinkan 1–60 menit; 60 menit merupakan batas keamanan maksimum. Parameter ini tidak mengatur masa berlaku tautan unduh evidence/manager-note (tetap 15 menit sesuai kontrak terkait) maupun retensi fisik file pada storage bucket. |
| FR-32 | Setiap perubahan kebijakan tersimpan sebagai versi baru dengan effective date, optional end date, status aktif/nonaktif, dan owner. |
| FR-33 | Data historis selalu dievaluasi menggunakan versi kebijakan yang berlaku pada tanggal event, bukan versi kebijakan terkini. |
| FR-34 | Sistem membatasi kewenangan edit tiap jenis kebijakan sesuai Authorized Policy Owner yang ditetapkan (bukan satu Admin berkuasa atas semua kebijakan). |
| FR-35 | Partisipasi wajib WorkPulse (included/excluded role, function, individual exemption, effective period) dapat dikonfigurasi tanpa hard-code. Pengecualian pada jabatan tertentu (mis. CEO, Board of Directors, atau peran eksekutif tertentu) dapat ditetapkan secara terbuka tanpa batas waktu (*open-ended / indefinite*, tanpa kewajiban tanggal kedaluwarsa/expiry date) dan berlaku permanen sejak tanggal efektif hingga diubah atau dicabut secara eksplisit melalui versi kebijakan baru. Pengecualian operasional situasional (mis. dinas luar/tugas lapangan) tetap dapat menggunakan rentang tanggal spesifik. |

#### MVP Launch Configuration Register — prasyarat sebelum implementasi

Nilai awal di bawah harus ditetapkan dalam satu register konfigurasi peluncuran, ditinjau dan disahkan oleh pemilik kebijakan yang berwenang sebelum implementasi dimulai. PRD menetapkan kategori dan tata kelola; dokumen ini tidak mengarang nilai operasional yang belum disepakati. Developer/AI tidak boleh memilih nilai produksi sendiri.

| Kelompok | Nilai awal yang wajib disahkan | Aturan tata kelola |
|---|---|---|
| Kalender dan waktu | Zona waktu organisasi, applicable workdays, hari libur, jam layanan operasional | Effective-dated; sumber kalender dan pemiliknya jelas |
| Submission | On-Time Deadline Morning dan EOD; Grace Period masing-masing | Nilai 0 valid; cutoff = deadline + grace period; submission setelah cutoff ditolak sesuai ADR-018 |
| Correction | Objection Window duration; kriteria klasifikasi Minor vs Material untuk Morning dan EOD | Versi dan effective date; aturan tetap produk tidak dapat diubah sebagai policy |
| Compliance/coaching | Jendela evaluasi No Submission; coaching follow-up period | Ambang kejadian No Submission tetap 3; hanya jendela waktu yang configurable |
| Blocker/escalation | Threshold aging/acknowledgement, escalation recipients, assignment authority | Pemilik kebijakan dan konteks authority wajib jelas |
| Participation/exemption | Included/excluded role/function/individual, masa berlaku exemption, alur approval Leave | Tidak boleh mengecualikan tanggal tanpa exception yang valid |
| Retention | Retensi data operasional dan evidence yang memiliki aturan berbeda | Harus berada dalam batas legal/keamanan yang disahkan |
| Account invitation | Masa berlaku undangan dan prosedur revoke/resend | Token sekali pakai; tidak mengirim kata sandi permanen |
| Availability | Jam layanan yang dijanjikan, mekanisme pengumuman maintenance, notice period untuk maintenance terjadwal | Target minimal 99% per bulan kalender pada jam layanan yang diumumkan |

Nilai default sistem yang telah dikunci oleh ADR atau kontrak keamanan (misalnya `exportRetentionMinutes`) tetap mengikuti sumber keputusan tersebut dan tidak boleh ditimpa oleh register ini.

### 3.8 History, Notification & Reporting
| ID | Requirement |
|---|---|
| FR-36 | Employee dapat melihat histori Daily Accountability Record miliknya sendiri. |
| FR-37 | Sistem menyediakan pencarian/filter berdasarkan employee, function, project, tanggal, status, dan kategori blocker (sesuai permission role). |
| FR-38 | Sistem mendukung pengiriman notifikasi **Email dan Browser Push yang benar-benar berfungsi pada MVP**, serta mencatat notifikasi dalam Web Notification Center. Untuk trigger yang ditetapkan menggunakan Browser Push, sistem harus melakukan pengiriman push nyata, bukan hanya membuat record/stub. Push hanya dapat diterima pada browser/perangkat yang mendukung dan telah memberikan izin; kondisi tidak didukung/izin ditolak/kegagalan delivery tidak boleh memblokir proses utama, harus dicatat secara akurat, dan tidak boleh ditampilkan sebagai delivery berhasil. Email dan Web Notification Center tetap tersedia sesuai matriks trigger pada Section 8. |
| FR-39 | Manager berwenang dapat membuat Manager Note (coaching/recognition/corrective) dengan visibilitas sesuai policy. |
| FR-40 | Manager tidak dapat mengubah pernyataan employee secara langsung/diam-diam; koreksi hanya melalui Manager Note atau correction workflow yang ter-audit. |
| FR-41 | Sistem menghasilkan Weekly Accountability Summary dan Monthly Management Trend sesuai scope akses user. |
| FR-42 | Authorized role dapat melakukan export data (summary/evidence) sesuai permission, tanpa mengekspos data di luar kewenangannya. |

### 3.9 Morning Correction Request 
| ID | Requirement |
|---|---|
| FR-43 | Employee dapat mengajukan Morning Correction Request atas Morning Commitment yang sudah locked, disertai perubahan yang diminta dan Reason wajib. Cakupan tidak termasuk Additional Work atau field EOD. |
| FR-44 | Sistem mengklasifikasikan Morning Correction Request sebagai **Minor** (diterapkan langsung) atau **Material** (masuk Objection Window) berdasarkan policy yang berlaku. Pengajuan Material otomatis menjadi Applied jika tidak ada objection dari Authorized Reviewer dalam Objection Window; Reviewer dapat mengajukan objection secara eksplisit selama window berjalan, yang menghasilkan status Rejected dan baseline Morning asli tetap berlaku. |
| FR-45 | Seluruh siklus Morning Correction Request—pengajuan, klasifikasi, penerapan, objection/rejection, serta aktor dan timestamp—wajib dapat ditelusuri melalui audit trail. Jika perubahan diterapkan, audit trail harus menyimpan nilai before/after dan referensi ke request terkait; jika ditolak, baseline Morning asli tetap berlaku dan alasan objection tercatat. EOD Correction Request mengikuti FR-53 dan FR-55 dengan record audit terpisah. |

### 3.10 Leave & Exemption Management 
| ID | Requirement |
|---|---|
| FR-46 | HRGA/Admin dapat membuat, mengedit, dan menonaktifkan Holiday dan individual Exemption (single date/date range, effective period) tanpa memerlukan approval tambahan. |
| FR-47 | Employee dapat mengajukan Leave Request; Leave hanya berlaku sebagai valid exception setelah disetujui oleh Authorized Approval sesuai policy. |
| FR-48 | Leave/Holiday/Exemption yang berstatus valid mengecualikan tanggal terkait secara otomatis dari No Submission detection (FR-27), tanpa memerlukan aksi manual tambahan pada tanggal berjalan. |

### 3.11 EOD Correction Request (mekanisme terpisah)
| ID | Requirement |
|---|---|
| FR-53 | Employee dapat mengajukan EOD Correction Request hanya untuk EOD yang benar-benar telah disubmit dan terkunci, dengan target field, nilai yang diminta, dan Reason wajib. Cakupan meliputi Outcome, Continuation, Continuation Reason, alasan Cancelled, Final Status, penjelasan risiko tingkat-hari, dan `Tomorrow Priority` yang tersimpan pada EOD. Koreksi Outcome/Continuation berlaku untuk Commitment dan Additional Work terkait. Mekanisme ini memiliki record dan lifecycle terpisah dari Morning Correction Request; deskripsi dan reason pencatatan Additional Work tidak termasuk kecuali secara eksplisit menjadi field EOD yang terkunci. |
| FR-55 | EOD Correction Request mengikuti tata kelola klasifikasi Minor/Material dan default-approve dengan Objection Window yang sama: Minor diterapkan langsung; Material menjadi Applied jika tidak ada objection hingga window berakhir, atau Rejected jika Authorized Reviewer mengajukan objection yang sah selama window. Semua langkah, aktor, timestamp, reason, dan nilai before/after wajib diaudit. EOD Correction Request tidak dapat membuat submission EOD yang tidak pernah ada, menghapus atau membatalkan event No Submission, mengubah Morning baseline, atau melakukan direct edit tanpa audit. |

---

## 4. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| NFR-01 | Usability | Morning dan EOD check-in masing-masing dapat diselesaikan dalam ±2–3 menit; minimal input mengetik (quick-select, recent task, template). |
| NFR-02 | Responsiveness | Web-responsive di device desktop dan mobile browser; bukan native mobile app di MVP. |
| NFR-03 | Performance | Dashboard dan entri harian merespons < 2 detik pada beban normal perusahaan. Definisi beban normal, jenis permintaan yang diukur, dan metode pengukuran harus ditetapkan pada SAD sebelum implementasi agar target ini dapat diverifikasi secara konsisten. |
| NFR-04 | Availability | Target availability MVP minimal **99% per bulan kalender selama jam layanan operasional yang diumumkan**. Availability dihitung sebagai (eligible service minutes − unplanned unavailable minutes) / eligible service minutes × 100%. Planned maintenance hanya dikecualikan jika dijadwalkan dan diumumkan kepada pengguna sesuai notice period yang disahkan dalam konfigurasi peluncuran. Jam layanan, sumber monitoring, definisi unavailable, serta pelaporan target harus ditetapkan dalam SAD dan konfigurasi peluncuran sebelum implementasi. Kegagalan jaringan sementara pada sisi pengguna ditangani secara graceful dan tidak disamakan dengan downtime layanan tanpa evaluasi. |
| NFR-05 | Security | Role-based access control, autentikasi aman, transport terenkripsi, prinsip least privilege. |
| NFR-06 | Auditability | Audit trail immutable untuk seluruh material edit — status, blocker, kebijakan, struktur organisasi, correction request, dan manager note. |
| NFR-07 | Privacy | Hanya mengumpulkan data terkait pekerjaan yang diperlukan untuk accountability; tidak ada telemetry pengawasan aktivitas. |
| NFR-08 | Configurability | Nilai yang ditetapkan sebagai configurable policy tidak boleh di-hard-code sebagai nilai operasional; nilainya harus dapat dikonfigurasi dan berversi. Aturan tetap produk dan batas keamanan tidak boleh ditampilkan sebagai konfigurasi yang dapat diubah. |
| NFR-09 | Retention | Retensi data dapat dikonfigurasi; evidence disciplinary/HR dapat mengikuti retention policy terpisah. |
| NFR-10 | Backup | Backup database rutin dengan proses restore yang teruji. |
| NFR-11 | Exportability | Export data untuk kebutuhan management/HR tanpa mengekspos data sensitif di luar kewenangan. |
| NFR-12 | Anti-gaming | Tidak ada mekanisme yang mendorong task-count gaming atau pemecahan pekerjaan menjadi task kecil demi tampilan produktif. |

---

## 5. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Maksimal 3 Morning Commitment; Additional Work dicatat terpisah dan tidak dihitung sebagai commitment ke-4. |
| BR-02 | Morning Commitment dapat diedit bebas sebelum Cut-Off; setelah Cut-Off, baseline terkunci dan perubahan apa pun wajib melalui Morning Correction Request (BR-16). |
| BR-03 | Continuation = `Continue` wajib memiliki Continuation Reason. Initial Risk `AMBER`/`RED` wajib memiliki Known Blocker dan Support Needed pada konteks Commitment. Final Status `AMBER`/`RED` wajib memiliki penjelasan risiko/blocker tingkat-hari. Ketiga konteks ini terpisah. |
| BR-04 | Status RED dan critical/instant blocker dapat dibuat kapan saja tanpa menunggu EOD. |
| BR-05 | Sistem tidak pernah menerbitkan SP atau memotong insentif secara otomatis; hanya menghasilkan evidence/flag. |
| BR-06 | Satu missed submission atau satu hari RED tidak otomatis menghasilkan konsekuensi disipliner. |
| BR-07 | No Submission tidak berlaku pada leave, holiday, maupun exemption valid. Untuk jabatan tertentu yang dikecualikan secara terbuka tanpa batas waktu (*indefinite role exemption* seperti CEO/Board), sistem tidak pernah membebankan kewajiban check-in harian, tidak memicu reminder, dan tidak pernah mencatat event No Submission. |
| BR-08 | Tidak ada leaderboard atau ranking berbasis jumlah task dalam bentuk apa pun. |
| BR-09 | Manager tidak dapat mengubah pernyataan employee secara langsung; koreksi hanya melalui Manager Note/correction workflow ter-audit. |
| BR-10 | Perubahan struktur organisasi tidak boleh mengubah historical accountability; data historis tetap merefleksikan konteks organisasi yang berlaku saat event terjadi. |
| BR-11 | Temporary Reviewer memiliki effective date & expiry date, tidak mengubah struktur permanen, dan seluruh penugasan ter-audit. |
| BR-12 | Hanya nilai yang secara eksplisit ditetapkan sebagai configurable policy yang dapat diubah dan harus berversi dengan effective date. Aturan tetap produk (termasuk maksimal 3 Morning Commitment, ambang 3 kejadian No Submission, jendela reminder 60 menit, dan heuristik Status Suggestion) serta batas keamanan tidak dapat diubah melalui policy. Data historis tunduk pada versi policy yang berlaku saat event terjadi. |
| BR-13 | Cross-project support tetap wajib sesuai kompetensi dan prioritas (primary ownership ≠ exclusive ownership). |
| BR-14 | Data disciplinary/coaching memiliki permission lebih ketat daripada daily record biasa. |
| BR-15 | Kewenangan mengubah tiap jenis kebijakan dibatasi ke Authorized Policy Owner yang ditetapkan untuk jenis kebijakan tersebut. |
| BR-16 | Morning Correction Request tidak boleh langsung mengubah baseline. Kategori Minor diterapkan langsung dengan audit trail; kategori Material melalui Objection Window dan default-approve (otomatis Applied) jika tidak ada objection eksplisit dari Authorized Reviewer dalam periode configurable. EOD Correction Request mengikuti prinsip tata kelola yang sama tetapi memiliki target dan record terpisah. |
| BR-17 | Maksimum satu No Submission occurrence dihitung per applicable workday untuk pattern detection, meskipun Morning dan EOD sama-sama terlewat pada hari yang sama; sistem tetap menyimpan submission spesifik mana yang terlewat sebagai evidence. |
| BR-18 | Leave wajib melalui Authorized Approval sebelum berlaku sebagai valid exception; Holiday dan individual Exemption dapat langsung di-set oleh Admin/HRGA berwenang tanpa approval tambahan. |
| BR-19 | Initial Daily Status diturunkan dari Initial Risk dengan prioritas RED > AMBER > GREEN. Jika tidak ada Commitment, Employee wajib memberi alasan dan status menjadi `NOT_APPLICABLE — NO_COMMITMENT`; status ini bukan GREEN dan bukan No Submission. |
| BR-20 | `Tomorrow Priority` adalah catatan opsional EOD yang disimpan dan ditampilkan terpisah pada Morning berikutnya; bukan sumber, bukan pembentuk draft, dan tidak memengaruhi FR-11 atau Initial Daily Status. |
| BR-21 | Morning Correction Request hanya mencakup Morning Commitment yang terkunci. EOD Correction Request adalah alur terpisah untuk EOD yang sudah disubmit dan terkunci; keduanya tidak boleh mengubah baseline atau compliance evidence secara diam-diam. |
| BR-22 | Assigned support owner menandai blocker Resolved dengan resolution note; pelapor mengonfirmasi Closed. Accepted Risk memerlukan authority berwenang dan tidak sama dengan Closed. Tidak ada auto-close berbasis waktu. |
| BR-23 | Akun dibuat oleh Admin/Management berwenang; aktivasi melalui undangan sekali pakai yang kedaluwarsa dan karyawan menetapkan kredensial sendiri. Self-registration publik tidak tersedia. |

---

## 6. Data Requirements (Conceptual)

*Level konsep — entitas dan informasi kunci yang harus tersimpan sistem; skema teknis (tipe kolom, relasi FK, indexing) menjadi wilayah System Architecture Design.*

| Entitas | Informasi Kunci |
|---|---|
| User | Identitas, role, function, status aktif |
| Organizational Assignment | Person, role, function, direct manager — dengan effective date & end date |
| Project Authority Mapping | Person, scope/reference terkait, effective date & end date — independen dari Organizational Assignment; satu person dapat memiliki lebih dari satu mapping aktif sekaligus |
| Temporary Reviewer Assignment | Reviewer, scope, effective date, expiry date |
| Daily Accountability Record | Employee, tanggal, snapshot konteks organisasi, morning/EOD submission timestamp, Initial Daily Status, Final Status, `noCommitmentReason` bila tidak ada Commitment, `tomorrowPriority` opsional, penjelasan risiko/blocker tingkat-hari jika Final Status AMBER/RED |
| Commitment | Teks commitment, reference/task link, **Initial Risk (GREEN/AMBER/RED)** , **Known Blocker (conditional)** , **Support Needed (conditional)** , outcome, continuation, continuation reason |
| Additional Work | Reason, assigned by (jika relevan), outcome, continuation |
| Blocker | Type, severity, impact, owner needed (authority context), `raisedByUserId`, status, timestamps, resolution note, resolved-by dan closed-by actor |
| Support Contribution | Blocker/request terkait, supporter, action, catatan hasil |
| Morning Correction Request | Target Morning Commitment yang locked; perubahan, reason, klasifikasi (Minor/Material), status (Applied/Pending/Rejected), Objection Window start/end, reviewer (jika ada objection), aktor dan timestamp |
| EOD Correction Request | Target Daily Accountability Record/EOD submission yang telah terkunci; target field, nilai before/after, reason, klasifikasi, status, Objection Window, reviewer/objection, aktor dan timestamp; terpisah dari Morning Correction Request |
| User Invitation | Akun tujuan yang sudah dibuat, token invitation yang tidak dapat digunakan ulang, waktu terbit/kedaluwarsa/penggunaan/pembatalan, aktor penerbit |
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
| Pulse Dashboard navigation | – (Employee biasa) | Team Pulse — assigned/team scope | Function Pulse — function scope | Tidak otomatis; hanya jika ada permission dashboard eksplisit | Management Pulse — company-wide jika berwenang | Tidak otomatis; hanya jika ada permission dashboard eksplisit |
| Policy configuration | – | – | – | Terbatas | – | Admin/Authorized Policy Owner |
| Organizational master data | – | – | – | – | – | Admin/Management berwenang |
| Morning Correction Request (ajukan) | Create (milik sendiri) | – | – | – | – | – |
| EOD Correction Request (ajukan) | Create (EOD milik sendiri) | – | – | – | – | – |
| Correction Request (objection) | – | Sesuai policy reviewer | Sesuai policy reviewer | – | – | – |
| Blocker resolve/close | Pelapor mengonfirmasi Closed | Assigned support owner dapat Resolved | Sesuai authority scope | Sesuai policy | Sesuai authority scope | – |
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
| Morning atau EOD Correction Request Material diajukan | Authorized Reviewer terkait | Web Notification Center + Email |
| Morning atau EOD Correction Request menuju akhir Objection Window | Authorized Reviewer terkait (reminder terakhir sebelum auto-applied) | Web Notification Center |
| Morning atau EOD Correction Request Applied/Rejected | Employee pengaju | Web Notification Center |
| User invitation diterbitkan atau diterbitkan ulang | Karyawan pemilik akun | Email dengan tautan aktivasi sekali pakai |
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
| AC-01 | Employee dapat submit Morning Check-in dengan 0–3 Commitment; setiap Commitment memiliki Initial Risk, Known Blocker dan Support Needed wajib jika risikonya AMBER/RED; jika jumlah Commitment nol, alasan wajib diisi. |
| AC-02 | Additional Work dapat dicatat kapan saja setelah Morning Check-in tanpa mengubah baseline Morning Commitment. |
| AC-03 | EOD Check-in menyimpan Outcome dan Continuation sebagai dua field terpisah; kombinasi Partially Completed + Continue valid; Cancelled wajib disertai alasan. Outcome tersedia untuk setiap Commitment dan Additional Work yang relevan. |
| AC-04 | Setelah Cut-Off, edit terhadap Morning Commitment hanya dapat dilakukan melalui Morning Correction Request, menghasilkan entry audit trail before/after. |
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
| AC-15 | Setiap perubahan material (Morning/EOD correction, status, blocker, Manager Note, policy, struktur organisasi) menghasilkan audit trail append-only yang menyimpan actor, action, timestamp, reason bila relevan, entity/reference, dan nilai before/after. User biasa tidak dapat mengedit atau menghapus audit entry melalui aplikasi. |
| AC-16 | Sistem tidak menampilkan leaderboard/ranking task-completion dalam kondisi apa pun. |
| AC-17 | User dapat menyelesaikan check-in normal dalam ≤3 menit pada usability test internal. |
| AC-18 | Morning Correction Request Minor langsung Applied dengan audit trail; Morning Correction Request Material yang tidak mendapat objection dalam Objection Window otomatis menjadi Applied; pengajuan yang di-objection secara sah dalam window menjadi Rejected dan baseline Morning asli tetap berlaku. |
| AC-19 | Leave Request yang belum disetujui tidak mengecualikan tanggal terkait dari No Submission; setelah disetujui, tanggal tersebut otomatis dikecualikan. |
| AC-20 | Export data hanya menghasilkan data sesuai scope visibility user yang melakukan export; tidak ada data di luar kewenangannya yang ikut terekspor. |
| AC-21 | Browser Push pada MVP melakukan delivery nyata untuk trigger yang menetapkannya; pengujian tidak cukup hanya memverifikasi record notifikasi atau pemanggilan stub. |
| AC-22 | Ketika browser tidak mendukung Push, izin ditolak, atau delivery gagal, sistem tidak mengklaim push berhasil, proses utama tetap berjalan, dan kanal alternatif yang ditetapkan tetap digunakan. |
| AC-23 | FR-11 menampilkan seluruh draft eligible dari Morning Commitment hari kerja sebelumnya dengan `continuation = Continue`; tidak ada Additional Work, tidak ada item eligible yang dihilangkan/digabung, tidak ada komitmen ke-4, dan tidak ada submit otomatis. |
| AC-24 | Continuation = Continue selalu mewajibkan Continuation Reason, termasuk ketika Outcome = Completed. |
| AC-25 | Final Status AMBER/RED mewajibkan penjelasan risiko/blocker tingkat-hari, terpisah dari Known Blocker dan Support Needed per Commitment. |
| AC-26 | Pattern flag baru dipicu setelah 3 kejadian No Submission dalam jendela evaluasi aktif; perubahan konfigurasi jendela tidak mengubah ambang tetap 3. |
| AC-27 | Status Suggestion menghasilkan saran deterministik dan tidak dapat diubah melalui Policy Configuration; saran tidak mengubah pilihan pengguna secara diam-diam. |
| AC-28 | Morning Check-in dengan 0 Commitment hanya dapat disubmit jika alasan diisi; submission tetap diklasifikasikan berdasarkan deadline/cutoff dan tidak dihitung sebagai No Submission. |
| AC-29 | Initial Daily Status menjadi RED jika ada Initial Risk RED; jika tidak, AMBER jika ada Initial Risk AMBER; GREEN hanya jika terdapat minimal satu Commitment dan semuanya GREEN; jika nol Commitment, status menjadi `NOT_APPLICABLE — NO_COMMITMENT`, dengan alasan tersimpan. |
| AC-30 | `Tomorrow Priority` bersifat opsional, tersimpan setelah EOD submit, ditampilkan pada Morning hari kerja berikutnya sebagai konteks terpisah, dan tidak menghasilkan/mengubah/mengurutkan draft FR-11 atau Initial Daily Status. |
| AC-31 | EOD Correction Request hanya dapat diajukan untuk EOD yang sudah disubmit dan terkunci; memiliki record terpisah; tidak mengubah Morning baseline, tidak menciptakan submission EOD baru, dan tidak menghapus event No Submission. |
| AC-32 | EOD Correction Request Minor diterapkan langsung dengan audit; Material menjadi Applied jika tidak ada objection sampai Objection Window berakhir, atau Rejected jika ada objection yang sah; audit menyimpan target, reason, aktor, timestamp, dan before/after. |
| AC-33 | Blocker hanya berpindah ke Resolved oleh assigned support owner/penanggung jawab dengan resolution note; Closed membutuhkan konfirmasi pelapor; tidak ada auto-close berbasis waktu; Accepted Risk tercatat sebagai jalur terpisah oleh authority berwenang. |
| AC-34 | Undangan aktivasi hanya berlaku untuk akun yang telah dibuat Admin, token hanya dapat digunakan sekali dan kedaluwarsa, karyawan menetapkan kredensial sendiri, dan self-registration publik tidak tersedia. |
| AC-35 | Availability report menghitung target bulanan dengan rumus NFR-04; konfigurasi jam layanan, monitoring, definisi unavailable, dan prosedur pengumuman maintenance disetujui sebelum implementasi. |
| AC-36 | User hanya dapat login melalui akun aktif yang dibuat Admin/Management berwenang; role/function dan akses yang berlaku sesuai assignment efektif, dan self-registration publik tidak tersedia. |
| AC-37 | Panduan output (Role-Based Prompt Hint) pada Morning Check-in terpilih secara reaktif berdasarkan atribut `function` pengguna (`authStore.user.function`). Pengguna dari 7 fungsi kanonikal melihat salinan teks baku yang tepat sesuai FR-12 di seluruh slot #1, #2, #3; pengguna tanpa fungsi atau fungsi tak dikenal melihat teks fallback resmi. Teks prompt tampil sebagai placeholder visual bergaya miring (*italic*), menghilang saat input difokuskan/diketik, tidak mengunci teks pengguna, dan terbukti tidak mengontaminasi nilai input form maupun payload network saat submission. |
| AC-38 | Status Suggestion mengikuti setiap cabang FR-13 secara deterministik: Critical blocker atau insiden produksi → RED; proporsi Not Completed/Cancelled ≥50% → RED; carry-over kedua berturut-turut pada item yang sama atau High blocker aktif atau Partially Completed/proporsi Not Completed/Cancelled di bawah 50% → minimal AMBER; seluruh item Completed tanpa blocker aktif → GREEN; tidak ada item evaluable dan tidak ada blocker aktif → tidak ada saran. Tidak ada cabang yang mengubah pilihan pengguna secara otomatis. |
| AC-39 | Ketika status yang dipilih tidak konsisten dengan data (mis. GREEN dengan Critical blocker aktif), sistem menampilkan validation prompt dan tidak mengubah pilihan pengguna diam-diam. |
| AC-40 | Reminder hanya dikirim pada jendela tetap `[On-Time Deadline − 60 menit, On-Time Deadline)`, maksimal sekali per employee/per fase/per applicable workday, tidak dikirim setelah On-Time Deadline, dan tidak mengubah status submission. |
| AC-41 | Hanya Authorized Policy Owner dengan kewenangan untuk kategori terkait yang dapat membuat versi policy baru; perubahan memiliki effective date, data historis memakai versi yang berlaku saat event, dan aturan tetap produk/batas keamanan tidak dapat diubah melalui Policy Configuration. MVP Launch Configuration Register wajib disahkan sebelum implementasi. |
| AC-42 | Employee dapat melihat histori miliknya; pencarian/filter menurut employee, function, project, tanggal, status, dan kategori blocker hanya mengembalikan data yang berada dalam scope permission pengguna. |
| AC-43 | Manager Note dapat dibuat hanya oleh aktor berwenang, memakai kategori coaching/recognition/corrective, mengikuti visibilitas yang ditetapkan, dan tidak dapat digunakan untuk menimpa pernyataan Employee. |
| AC-44 | Weekly Accountability Summary dan Monthly Management Trend tersedia sesuai periode dan scope akses; laporan tidak menampilkan leaderboard/ranking individual berbasis jumlah task. |
| AC-45 | Admin/HRGA berwenang dapat membuat/mengedit/menonaktifkan Holiday dan individual Exemption untuk tanggal/rentang efektif tanpa approval tambahan; hanya exception yang valid mengecualikan tanggal dari No Submission. |
| AC-46 | Project Authority dapat dipilih untuk blocker/escalation pada konteks project/reference yang relevan tanpa mengganti direct manager atau mengubah historical organizational assignment; support lintas proyek tetap dapat dicatat dan ditelusuri. |
| AC-47 | Antarmuka dapat digunakan pada desktop dan mobile browser dalam layout responsive; tidak ada persyaratan native mobile app pada MVP. |
| AC-48 | Dengan beban normal dan skenario pengukuran yang ditetapkan dalam SAD sebelum implementasi, dashboard dan entri harian memenuhi target respons <2 detik; hasil benchmark disimpan sebagai bukti verifikasi. |
| AC-52 | Blocker/escalation dikirim ke penerima yang benar berdasarkan severity, status, aging, dan authority context; RED yang tidak di-acknowledge dalam threshold yang berlaku memicu eskalasi ke level berikutnya, dan setiap transisi/eskalasi tercatat. |
| AC-53 | Seluruh akses aplikasi yang terproteksi menggunakan transport terenkripsi; operasi server-side memverifikasi autentikasi, role, resource scope, dan least privilege sehingga UI yang menyembunyikan tombol saja tidak dianggap sebagai kontrol akses yang cukup. |
| AC-54 | Admin/Management berwenang dapat membuat, mengubah, mengaktifkan, menonaktifkan, dan menetapkan ulang person/role/function/direct manager/reviewer/project authority; setiap perubahan memiliki effective date dan tidak menimpa assignment historis. |
| AC-55 | Blocker menyimpan Type resmi (`Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`), Severity (`Low`, `Medium`, `High`, `Critical`), Impact (`Task`, `Milestone`, `Project`, `Production`, `Client`, `Financial`, `Compliance`), Owner Needed, Raised At yang dibuat sistem, Expected Resolution opsional, Status, Resolution Note wajib saat ditutup, serta identitas pelapor dan aktor transisi yang relevan. |
| AC-56 | Additional Work dapat ditambahkan setelah Morning Check-in dengan alasan dari daftar yang ditetapkan; Assigned By wajib bila alasan Newly Assigned; item tidak mengubah baseline Morning dan tidak dihitung sebagai Commitment ke-4. |
| AC-57 | Submission Morning/EOD pada atau sebelum On-Time Deadline diklasifikasikan On-Time; setelah deadline sampai dan termasuk Cut-Off diklasifikasikan Late; setelah Cut-Off ditolak tanpa penulisan data. Grace Period `0` menghasilkan Cut-Off tepat pada deadline, dan hasil validasi tidak bergantung pada waktu scheduler. |
| AC-58 | Pada pembuatan blocker, Organizational Authority menjadi konteks default; Project Authority hanya digunakan ketika dipilih eksplisit dan project/reference relevan teridentifikasi. Jika pelapor tidak memilih orang tertentu, sistem menyelesaikan Owner Needed secara otomatis sesuai FR-19 dan mapping efektif pada waktu kejadian. |
| AC-59 | Direct Manager yang aktif menjadi kandidat awal untuk Organizational Authority. Jika tidak tersedia, sistem hanya menggunakan fallback organisasi yang telah dikonfigurasi; tidak ada penerima yang dipilih secara arbitrer. Project Authority menggunakan mapping aktif yang cocok dengan project/reference. |
| AC-60 | Pilihan Owner Needed manual bersifat opsional dan diterima hanya jika aktif serta valid untuk Authority Context dan scope terkait. Pilihan yang tidak valid ditolak dengan pesan perbaikan; pengguna tidak mendapat konfirmasi sukses palsu. |
| AC-61 | Jika tidak ada penerima valid setelah fallback atau terdapat ambiguitas yang tidak terselesaikan oleh aturan prioritas, blocker tidak diklaim berhasil dikirim. UI memberikan langkah berikutnya yang jelas. Audit trail menyimpan Authority Context, penerima akhir jika ada, dasar resolusi, fallback yang digunakan, timestamp, dan aktor terkait. |


### Riwayat Revisi v1.3

- Memperjelas FR-19 dan menambahkan FR-19a–FR-19c untuk pilihan Owner Needed opsional, resolusi otomatis, validasi manual, fallback, kondisi ambigu/tidak tersedia, dan audit trail.
- Menambahkan AC-58–AC-61 dan memperbarui traceability terkait penentuan Owner Needed.

| AC-62 | Pulse Dashboard hanya ditampilkan bagi pengguna yang memiliki kewenangan Team Pulse, Function Pulse, atau Management Pulse; Employee biasa tidak mendapat akses dashboard manajerial hanya karena memiliki akun. |
| AC-63 | Saat pengguna membuka Pulse Dashboard, sistem hanya membuka cakupan dashboard yang diizinkan oleh role, permission, dan scope efektifnya; pengguna multi-role hanya dapat berpindah ke cakupan lain yang juga diizinkan. |
| AC-64 | Akses langsung ke route atau permintaan data dashboard tanpa permission/scope yang sah ditolak oleh kontrol akses; menyembunyikan item sidebar saja tidak dianggap cukup. |
| AC-49 | Sistem tidak merekam telemetry pengawasan aktivitas seperti keystroke, pergerakan mouse, atau durasi aplikasi aktif; data yang disimpan terbatas pada entitas dan evidence yang didefinisikan dalam requirement produk. |
| AC-50 | Retensi data operasional dan evidence yang memiliki kebutuhan berbeda mengikuti policy retention yang disahkan dan berversi; masa berlaku signed URL export tidak mengubah retensi fisik file atau retention kategori evidence lain. |
| AC-51 | Backup database dapat dipulihkan melalui prosedur restore yang diuji; hasil verifikasi mencakup konsistensi jumlah data dan relasi sesuai kriteria pemulihan yang ditetapkan pada SAD. |
## 11. Requirement Traceability

Matriks ini menghubungkan setiap Functional Requirement (FR) dan Non-Functional Requirement (NFR) dengan acceptance criteria yang memverifikasinya. Matriks ini tidak menggantikan teks requirement; jika ada perubahan requirement, mapping ini wajib diperbarui bersama acceptance criteria terkait.

### 11.1 Functional Requirement → Acceptance Criteria

| Requirement | Acceptance Criteria |
|---|---|
| FR-01 | AC-36 |
| FR-02 | AC-11 |
| FR-03 | AC-01, AC-28, AC-29 |
| FR-04 | AC-01 |
| FR-05 | AC-04 |
| FR-06 | AC-02, AC-56 |
| FR-07 | AC-02, AC-56 |
| FR-08 | AC-03 |
| FR-09 | AC-03, AC-24 |
| FR-10 | AC-25 |
| FR-11 | AC-23 |
| FR-12 | AC-37 |
| FR-13 | AC-38 |
| FR-14 | AC-39 |
| FR-15 | AC-05, AC-55 |
| FR-16 | AC-05, AC-55 |
| FR-17 | AC-33 |
| FR-18 | AC-33 |
| FR-19 | AC-05, AC-46, AC-58, AC-59, AC-60, AC-61 |
| FR-19a | AC-60, AC-61 |
| FR-19b | AC-58, AC-59, AC-61 |
| FR-19c | AC-61 |
| FR-20 | AC-52 |
| FR-21 | AC-52 |
| FR-22 | AC-11, AC-54 |
| FR-23 | AC-11, AC-54 |
| FR-24 | AC-11, AC-54 |
| FR-25 | AC-13 |
| FR-26 | AC-10, AC-28, AC-57 |
| FR-27 | AC-09, AC-19 |
| FR-28 | AC-40 |
| FR-29 | AC-26 |
| FR-30 | AC-10 |
| FR-31 | AC-41 |
| FR-32 | AC-12, AC-41 |
| FR-33 | AC-12 |
| FR-34 | AC-41 |
| FR-35 | AC-41 |
| FR-36 | AC-42 |
| FR-37 | AC-42 |
| FR-38 | AC-21, AC-22 |
| FR-39 | AC-43 |
| FR-40 | AC-15, AC-43 |
| FR-41 | AC-14, AC-44 |
| FR-42 | AC-20 |
| FR-43 | AC-04, AC-18 |
| FR-44 | AC-18 |
| FR-45 | AC-15, AC-18 |
| FR-46 | AC-45 |
| FR-47 | AC-19 |
| FR-48 | AC-09, AC-19 |
| FR-49 | AC-26 |
| FR-50 | AC-34, AC-36 |
| FR-51 | AC-29 |
| FR-52 | AC-30 |
| FR-53 | AC-31, AC-32 |
| FR-54 | AC-34 |
| FR-55 | AC-31, AC-32 |

### 11.2 Non-Functional Requirement → Acceptance Criteria

| Requirement | Acceptance Criteria |
|---|---|
| NFR-01 | AC-17 |
| NFR-02 | AC-47 |
| NFR-03 | AC-48 |
| NFR-04 | AC-35 |
| NFR-05 | AC-07, AC-20, AC-34, AC-36, AC-53 |
| NFR-06 | AC-15, AC-18, AC-32, AC-33 |
| NFR-07 | AC-49 |
| NFR-08 | AC-12, AC-41 |
| NFR-09 | AC-50 |
| NFR-10 | AC-51 |
| NFR-11 | AC-20 |
| NFR-12 | AC-16 |


---

## Riwayat Revisi v1.2 — Baseline Final

- Menyelaraskan FR-11 dengan keputusan copy-forward ADR-017; seluruh draft eligible dipertahankan dan pengguna memilih item tanpa auto-submit.
- Menetapkan Browser Push sebagai delivery nyata pada MVP untuk trigger yang disebut dalam matriks notifikasi; tidak semua notifikasi wajib menggunakan Push.
- Menegaskan aturan tetap produk vs. configurable policy berdasarkan ADR terkait.
- Menetapkan Initial Daily Status sebagai agregasi deterministik Initial Risk; nol Commitment diperbolehkan dengan alasan wajib dan status `NOT_APPLICABLE — NO_COMMITMENT`.
- Menetapkan `Tomorrow Priority` sebagai catatan opsional yang disimpan dan ditampilkan terpisah dari draft FR-11. Keputusan produk ini merupakan penyelesaian follow-up design debt yang terpisah dari remediasi FR-11; ADR-017 tetap mengatur sumber copy-forward dan batas scope remediasi sebelumnya.
- Memisahkan Morning Correction Request dari EOD Correction Request; masing-masing memiliki target dan record sendiri, tata kelola koreksi, dan audit trail. Ini memperjelas kebutuhan produk yang akan direkonsiliasi ke SAD pada tahapnya; dokumen ini tidak mengklaim implementasi/SAD saat ini sudah mendukung alur EOD Correction Request.
- Menetapkan lifecycle blocker `Resolved` oleh support owner dan `Closed` setelah konfirmasi pelapor, tanpa auto-close berbasis waktu.
- Menetapkan aktivasi akun melalui undangan sekali pakai yang kedaluwarsa; tidak ada self-registration publik.
- Menetapkan target availability minimal 99% per bulan kalender selama jam layanan operasional yang diumumkan dan menambahkan prasyarat MVP Launch Configuration Register sebelum implementasi.
- Menambahkan acceptance criteria untuk keputusan baru dan mempertahankan ID requirement lama agar referensi yang sudah ada tetap terjaga.
- Konten/pemetaan prompt FR-12, spesifikasi UI/UX, Design System, prototype, SAD, dan Product Backlog sengaja tidak diubah atau diselesaikan dalam PRD ini; mengikuti urutan kerja yang telah disepakati.

**Status:** Baseline requirement final v1.2. Perubahan setelah baseline ini harus melalui perubahan terkontrol dengan alasan, dampak, persetujuan, dan pembaruan ketertelusuran.
---

## 12. Baseline Reconciliation — Performance, Contribution & Reporting

Bagian ini menambahkan requirement dari Management Baseline PRD v1.0 yang belum dinyatakan secara eksplisit atau belum terwakili secara setara pada PRD v1.4. Bagian dan requirement yang sudah ada tetap berlaku. Jika requirement tambahan ini berinteraksi dengan aturan produk yang telah dikunci, aturan tetap produk, permission, auditability, dan prinsip non-automatic discipline pada PRD ini tetap berlaku. Penambahan ini tidak mengubah requirement yang sudah ada secara diam-diam.

### 12.1 Performance Transition Framework

| ID | Requirement |
|---|---|
| FR-56 | Sistem mendukung penyusunan evidence untuk Performance Transition Framework pada periode review yang dipilih. Framework mencakup empat dimensi: Delivery, Quality, Accountability, dan Collaboration. Framework digunakan untuk membantu review/coaching selama masa transisi organisasi dan bukan merupakan KPI score otomatis. |
| FR-57 | Untuk setiap periode review, reviewer yang berwenang dapat mencatat penilaian kualitatif `Strong`, `Meets`, `Needs Improvement`, atau `Unacceptable` dengan alasan dan evidence yang relevan. Sistem harus menautkan penilaian pada histori dan evidence yang diizinkan oleh permission reviewer. Sistem tidak menghitung rating otomatis hanya dari GREEN/AMBER/RED, jumlah commitment, jumlah submission, atau jumlah task. |
| FR-58 | Review Performance Transition Framework harus mempertimbangkan konteks dan evidence lintas periode, termasuk hasil/output, kualitas, pemenuhan commitment, komunikasi risiko lebih awal, respons terhadap feedback, dokumentasi, dan kolaborasi/support lintas tim. Status harian tunggal atau satu hari buruk tidak boleh secara otomatis menentukan rating periodik. |
| FR-59 | Sistem menyediakan Individual Review Evidence untuk periode terpilih yang dapat menampilkan histori, outcome, continuation/carry-over, blocker, support contribution, compliance event, serta Manager Note sesuai permission. Reviewer harus dapat membedakan fakta tercatat, catatan coaching, dan kesimpulan/penilaian reviewer. |

### 12.2 Incentive Relationship & Fair Use

| ID | Requirement |
|---|---|
| FR-60 | WorkPulse tidak menjadi mesin perhitungan insentif otomatis dan tidak menggantikan kebijakan insentif yang berlaku. Jika evidence WorkPulse dipertimbangkan dalam keputusan insentif, keputusan tersebut harus mengikuti kebijakan perusahaan yang terpisah, kewenangan pengambil keputusan, dan proses review yang berlaku. |
| FR-61 | Satu status RED, AMBER, carry-over, blocker, atau missed submission tidak secara otomatis menghilangkan insentif, menurunkan rating, atau menghasilkan konsekuensi disiplin. Sistem tidak boleh menerapkan pemotongan insentif atau sanksi berdasarkan satu event WorkPulse tanpa proses kebijakan dan review yang berwenang. |
| FR-62 | Data WorkPulse tidak boleh otomatis diubah menjadi KPI score mentah. Setiap rencana integrasi data ke KPI atau insentif di masa depan memerlukan keputusan tata kelola terpisah, indikator yang valid, penetapan penggunaan data, dan persetujuan pihak berwenang sebelum diberlakukan. |

### 12.3 Commitment Quality & Cross-Project Contribution

| ID | Requirement |
|---|---|
| FR-63 | Sistem memberikan quality warning atau prompt review ketika commitment terlalu abstrak/generik, misalnya “development”, “meeting”, atau “follow-up”, sepanjang mekanisme tersebut tidak menghalangi submission yang valid dan tidak menilai kualitas kerja secara otomatis. Warning bertujuan membantu pengguna memperjelas output yang dapat diamati; pengguna tetap bertanggung jawab atas isi commitment. Detail aturan deteksi dan copy warning ditetapkan pada tahap desain berikutnya. |
| FR-64 | Kontribusi support lintas proyek/fungsi dapat dicatat sebagai Support Contribution dan ditautkan ke blocker atau support request terkait. Catatan minimal mengidentifikasi contributor, blocker/request terkait, tindakan atau kontribusi, waktu pencatatan, dan outcome/catatan hasil jika tersedia. Contribution dapat digunakan sebagai evidence review sesuai permission dan tidak dihitung sebagai commitment tambahan secara otomatis. |
| FR-65 | Weekly Team Summary dan dashboard berwenang menampilkan pola continuation/carry-over berulang serta support contribution lintas proyek sebagai konteks review. Sistem tidak boleh menyimpulkan kinerja buruk hanya dari continuation berulang tanpa mempertimbangkan reason, blocker/dependency, perubahan prioritas, dan konteks pekerjaan. |

### 12.4 Reporting & Dashboard Requirements — Baseline Detail

| ID | Requirement |
|---|---|
| FR-66 | Employee dapat melihat personal weekly accountability summary untuk periode yang dipilih, sesuai aksesnya, dengan setidaknya ringkasan Morning/EOD submission, outcome, status harian, continuation/carry-over, blocker, support contribution, dan notifikasi/escalation yang terkait dengan dirinya. Tampilan tidak menggunakan streak kompetitif, skor perbandingan rekan kerja, ranking, atau leaderboard yang mendorong gamifikasi. |
| FR-67 | Weekly Accountability Summary/Individual Review Evidence untuk employee dan reviewer yang berwenang memuat, sesuai permission dan ketersediaan data: commitments, outcomes, status days, recurring blockers, support contributions, open escalations, compliance events, dan Manager Notes. Fakta dan catatan tidak boleh digabung sehingga sumber atau jenis evidence menjadi ambigu. |
| FR-68 | Dashboard Head/Supervisor menampilkan exception dan tren yang relevan dengan scope-nya melalui widget resmi: (1) **Team status summary** (jumlah GREEN, AMBER, RED, No Submission); (2) **Exceptions first** (daftar RED, AMBER, carry-over berulang, blocker belum di-acknowledge, no submission); (3) **Open blockers by owner** (identifikasi pengambil keputusan/pemberi dukungan); (4) **Carry-over trend** (identifikasi potensi hambatan proses berulang); (5) **Cross-project support** (rekaman dukungan lintas fungsi/proyek); (6) **Weekly team summary** (tren keandalan komitmen dan pengecualian terkemuka, tanpa leaderboard). Dashboard harus exception-first agar mengurangi kebutuhan meminta status manual. |
| FR-69 | Monthly Management Trend / CEO Dashboard menampilkan agregat perusahaan melalui widget resmi: (1) **Company-wide exception overview by function**; (2) **RED/AMBER trend per function & project**; (3) **Top recurring blockers by category** (`Technical`, `Requirement`, `Client`, `Vendor`, `Resource`, `Approval`, `Infra`, `Finance`, `Legal`, `Other`); (4) **No-submission trend & repeated compliance cases**; (5) **Unresolved escalation aging**; (6) **Project-impact blockers dan client-impact incidents**. Laporan tidak boleh menampilkan leaderboard/ranking individual berbasis jumlah task atau menjadikan data WorkPulse sebagai KPI mentah. |

---

## 13. Repeated Non-Submission, Coaching & Corrective Review

Bagian ini memperjelas jalur tindak lanjut baseline. Bagian ini tidak memberi sistem kewenangan menerbitkan sanksi otomatis dan tidak menggantikan kebijakan HR/perusahaan.

### 13.1 Matriks Distingsi Kasus (Important Distinction Framework)

| Kasus Nyata | Klasifikasi Kasus | Respon Default Sistem & Manajemen |
|---|---|---|
| Tidak selesai karena kompleksitas teknis, sudah dieskalasi lebih awal | **Performance / delivery issue** | Dukungan teknis, replanning, pembinaan bila perlu; bukan hukuman. |
| Tahu akan terlambat tetapi tidak eskalasi sampai deadline | **Accountability issue** | Tinjauan tercatat (*recorded review*); tindakan korektif jika berulang (*pattern*). |
| Bypass proses wajib QA atau release secara sengaja | **Discipline / process violation** | Eskalasi penegakan disiplin sesuai severity dan kebijakan perusahaan. |
| Tidak mengisi check-in sekali karena lupa | **Administrative miss** | Pengingat (*reminder*); tidak otomatis menjadi tindakan disipliner. |
| Berulang kali tidak mengisi setelah pembinaan | **Accountability / discipline pattern** | Peringatan tercatat (*recorded warning*) $\rightarrow$ proses disipliner formal HR jika berlanjut. |

### 13.2 Requirements Penanganan Kepatuhan

| ID | Requirement |
|---|---|
| FR-70 | Ketika pattern flag No Submission terbentuk sesuai FR-29, sistem membuat compliance/review event yang dapat ditinjau aktor berwenang. Pattern flag adalah permintaan review, bukan kesimpulan pelanggaran dan bukan sanksi otomatis. |
| FR-71 | Aktor berwenang dapat mencatat hasil review, konteks/penjelasan karyawan, coaching yang diberikan, support atau tindakan korektif yang disepakati, pemilik tindak lanjut, dan tanggal tindak lanjut bila relevan. Catatan harus menyimpan actor, timestamp, alasan, dan audit trail sesuai aturan yang berlaku. |
| FR-72 | Jika pola berulang tetap terjadi setelah coaching atau terdapat dugaan kelalaian serius, sistem hanya dapat mendukung pencatatan/rujukan ke recorded warning atau proses formal melalui aktor berwenang dan kebijakan perusahaan. Sistem tidak menerbitkan SP otomatis, tidak menentukan kesalahan secara otomatis, dan tidak melewati review manusia. |
| FR-73 | Reviewer harus dapat membedakan masalah kapasitas/skill, blocker/dependency, perubahan prioritas, pengecualian yang sah, kesalahan proses, dan dugaan pengabaian kewajiban sesuai Matriks Distingsi Kasus (§13.1). Respons dapat berupa coaching, penyesuaian dukungan/proses, atau rujukan sesuai kebijakan; status AMBER/RED atau blocker yang diungkapkan secara jujur tidak otomatis diperlakukan sebagai pelanggaran. |

---

## 14. Rollout Plan & Pilot Success Metrics

Rencana ini mempertahankan tahapan rollout dari Management Baseline v1.0. Durasi merupakan target perencanaan dan dapat diperbarui melalui keputusan rollout yang terdokumentasi; perubahan jadwal tidak mengubah requirement fungsional aplikasi.

| Phase | Duration / Target | Scope |
|---|---|---|
| Phase 0 — Policy Alignment | Sebelum build/pilot | Finalisasi rule, cutoff, escalation, exception, dan batas coaching/disciplinary. Pastikan policy owner dan reviewer ditunjuk. |
| Phase 1 — MVP Pilot | Target pilot 2–4 minggu | Engineering + QA + PM + Ops/Infra dan kelompok yang paling membutuhkan blocker visibility; validasi usability, notifikasi, fairness, serta beban administrasi. |
| Phase 2 — Company Rollout | Setelah perbaikan pilot | Perluasan ke Commercial, Finance, HRGA, dan seluruh karyawan yang masuk scope. Baseline awal memperkirakan sekitar 30 karyawan lintas fungsi; jumlah aktual dikonfirmasi sebelum rollout. |
| Phase 3 — Management Review | Setelah 4–8 minggu data | Tinjau usability, gaming risk, beban admin, recurring blocker, fairness, dan apakah dashboard mengurangi permintaan status manual. |
| Phase 4 — KPI Integration Review | Setelah organisasi stabil | Pilih indikator yang valid melalui governance terpisah. Jangan otomatis menjadikan seluruh data WorkPulse sebagai KPI. Integrasi ini bukan bagian dari MVP. |

### 14.1 Pilot Success Metrics

| ID | Metric | Target / Cara Evaluasi |
|---|---|---|
| PSM-01 | Required daily submission rate | ≥90% setelah periode stabilisasi, tidak termasuk exemption yang valid. |
| PSM-02 | Check-in completion time | Median waktu pengisian check-in ≤3 menit. Ukur melalui usability test/pengukuran pilot yang disetujui; jangan menggunakan telemetry pengawasan aktivitas. |
| PSM-03 | Early visibility of delay | Terjadi penurunan kasus keterlambatan yang baru diketahui pada atau setelah deadline; bandingkan baseline yang tersedia dengan periode pilot dan dokumentasikan keterbatasan data. |
| PSM-04 | RED/high blocker acknowledgement | ≥80% RED/high blockers di-acknowledge dalam target internal yang disepakati sebelum pilot. Target waktu acknowledgement harus ditetapkan dalam MVP Launch Configuration Register. |
| PSM-05 | Reduction of manual status requests | Head/manager menyatakan dashboard mengurangi kebutuhan meminta status manual; kumpulkan feedback terstruktur selama pilot. |
| PSM-06 | Gaming/admin burden | Tidak ada evidence kuat bahwa sistem mendorong task-count gaming atau administrative burden yang berlebihan; evaluasi feedback, pola data, dan temuan pilot. |
| PSM-07 | Understanding of status meaning | Pengguna memahami bahwa AMBER/RED bukan otomatis punishment; verifikasi melalui feedback atau pertanyaan evaluasi pilot. |

Pilot tidak dinyatakan berhasil hanya berdasarkan tingkat submission. Hasil pilot juga harus mempertimbangkan fairness, keterbukaan pelaporan blocker, kualitas evidence, beban administratif, dan kegunaan dashboard.

---

## 15. Key Risks & Mitigations — Baseline Reconciliation

| Risk | Impact | Mitigation / Control |
|---|---|---|
| WorkPulse menjadi alat micromanagement | Demotivasi dan laporan yang tidak jujur | Batasi field pada data kerja yang relevan; gunakan output-based accountability dan exception-first dashboard; komunikasikan tujuan sistem; larang telemetry pengawasan aktivitas. |
| Semua pengguna memilih GREEN | Data risiko tidak berguna | Pertahankan status consistency validation, prompt penjelasan, review manusia, dan No Surprise Rule; jangan mengubah status pengguna diam-diam. |
| Task-count gaming | Produktivitas semu karena pekerjaan dipecah menjadi banyak item | Maksimal 3 Morning Commitment, Additional Work tetap terpisah, tanpa leaderboard, dan review berdasarkan konteks/output. |
| Sanksi terlalu cepat | Fear culture dan blocker disembunyikan | Reminder → review/coaching → recorded warning atau proses formal hanya jika sesuai kebijakan dan berulang/serius; tidak ada auto-SP atau konsekuensi otomatis. |
| Manager overload | Data tidak dibaca dan dashboard tidak berguna | Dashboard exception-first, queue berdasarkan urgency/aging, dan ringkasan periodik. |
| Blocker menjadi dumping ground | Semua masalah dilempar ke Head tanpa owner jelas | Tetapkan owner, severity, authority context, acknowledgement, escalation threshold, resolution responsibility, dan lifecycle blocker. |
| Role-based guidance tidak relevan | Pengguna mengisi commitment generik atau asal | Pilot per function; FR-12 menetapkan 7 taksonomi kanonikal resmi dan teks baku berorientasi aksi dengan fallback netral; prompt bersifat inline hint yang membantu orientasi output tanpa mengunci kebebasan penulisan pengguna. |
| Data dipakai sebagai KPI mentah | Penilaian tidak adil dan konteks hilang | Tegaskan fase awal non-KPI; governance sebelum integrasi KPI; gunakan evidence lintas periode dan review manusia. |
| Support lintas proyek tidak terlihat | Kontribusi kolaborasi tidak tercermin pada review | Catat Support Contribution yang tertaut ke blocker/request dan tampilkan sesuai permission. |
| Commitment terlalu generik | Sulit diverifikasi apakah output tercapai | Quality warning yang membantu memperjelas output; warning bukan penilaian otomatis atau alasan menolak submission valid. |

---

## 16. Recommended Policy Statement — For Management Discussion

> WorkPulse diberlakukan sebagai mekanisme visibility dan accountability kerja. Karyawan tidak dinilai dari banyaknya aktivitas yang dicatat. Karyawan diharapkan membuat commitment yang realistis, memperbarui hasilnya, dan mengeskalasi risiko lebih awal. Masalah yang diangkat secara jujur bukan otomatis pelanggaran. Pengabaian berulang terhadap kewajiban pencatatan, proses kerja wajib, atau penyembunyian risiko yang sudah diketahui dapat menjadi accountability issue dan diproses melalui coaching hingga mekanisme disiplin sesuai kebijakan perusahaan.

Pernyataan ini merupakan rekomendasi kebijakan untuk penyelarasan manajemen. Penerapan formal tetap memerlukan persetujuan pihak perusahaan yang berwenang. Pernyataan ini tidak memberikan kewenangan kepada sistem untuk menentukan pelanggaran atau menerbitkan sanksi otomatis.

---

## 17. Future Integrations — Not Required for MVP

Item berikut adalah kandidat integrasi masa depan dari Management Baseline v1.0. Daftar ini tidak mewajibkan integrasi tersebut masuk MVP, tidak mengubah scope MVP yang sudah ditetapkan, dan tidak menyatakan bahwa integrasi telah tersedia.

| Candidate Integration | Potential Purpose | MVP Status |
|---|---|---|
| Jira, GitHub/GitLab, Trello, atau sistem project/task internal | Menautkan commitment dan evidence pada referensi kerja yang relevan | Future consideration; bukan MVP requirement. |
| CRM/commercial pipeline | Referensi pekerjaan Business Development dan Presales | Future consideration; bukan MVP requirement. |
| Helpdesk/ticketing | Referensi insiden dan kebutuhan Ops | Future consideration; bukan MVP requirement. |
| HR leave/attendance system | Otomatisasi pengecualian cuti/sakit/hari libur jika integrasi dan sumber data disetujui | Future consideration; alur Leave/Exemption MVP yang telah didefinisikan tetap berlaku. |
| Telegram/Slack/WhatsApp internal | Kanal notifikasi tambahan jika sesuai kebijakan | Future consideration; tidak menggantikan Email, Browser Push MVP, dan Web Notification Center yang telah ditetapkan. |
| SSO/company identity provider | Autentikasi melalui penyedia identitas perusahaan | Future consideration; undangan aktivasi dan authentication requirement yang ada tetap berlaku untuk MVP. |
| AI summary untuk recurring blocker dan insight mingguan | Membantu menyusun draft insight manajemen | Future consideration; harus memiliki human review dan tidak membuat keputusan performance/disciplinary otomatis. |

---

## 18. Baseline Reconciliation Traceability

Tabel berikut memetakan requirement tambahan dalam bagian 12–13 ke acceptance criteria tambahan. Requirement baru tidak menggantikan FR/NFR/AC yang sudah ada.

| Requirement | Acceptance Criteria |
|---|---|
| FR-56 | AC-65 |
| FR-57 | AC-66 |
| FR-58 | AC-67 |
| FR-59 | AC-68 |
| FR-60 | AC-69 |
| FR-61 | AC-70 |
| FR-62 | AC-71 |
| FR-63 | AC-72 |
| FR-64 | AC-73 |
| FR-65 | AC-74 |
| FR-66 | AC-75 |
| FR-67 | AC-76 |
| FR-68 | AC-77 |
| FR-69 | AC-78 |
| FR-70 | AC-79 |
| FR-71 | AC-80 |
| FR-72 | AC-81 |
| FR-73 | AC-82 |

### 18.1 Additional Acceptance Criteria

| ID | Acceptance Criteria |
|---|---|
| AC-65 | Individual Review Evidence dapat disusun untuk periode terpilih dengan empat dimensi Delivery, Quality, Accountability, dan Collaboration; sistem tidak menghitung KPI score otomatis dari status harian atau jumlah task. |
| AC-66 | Reviewer berwenang dapat mencatat rating `Strong`, `Meets`, `Needs Improvement`, atau `Unacceptable` beserta alasan/evidence; akses data mengikuti permission, dan rating tidak ditentukan otomatis oleh status GREEN/AMBER/RED atau volume submission. |
| AC-67 | Review periodik menampilkan konteks lintas periode dan tidak menetapkan rating otomatis dari satu hari buruk atau satu event tunggal. |
| AC-68 | Individual Review Evidence menampilkan kategori evidence yang tersedia dan diizinkan, serta membedakan data faktual, Manager Note, dan penilaian reviewer. |
| AC-69 | Sistem tidak menghitung atau menerapkan insentif otomatis berdasarkan data WorkPulse; keputusan insentif mengikuti kebijakan terpisah dan aktor berwenang. |
| AC-70 | Satu RED/AMBER, carry-over, blocker, atau missed submission tidak secara otomatis menghilangkan insentif atau memicu konsekuensi disiplin. Tidak ada auto-SP. |
| AC-71 | Tidak ada KPI score mentah yang dibuat otomatis dari semua data WorkPulse; rencana integrasi KPI memerlukan governance dan persetujuan terpisah. |
| AC-72 | Commitment yang terdeteksi terlalu generik dapat memunculkan quality warning untuk memperjelas output; warning tidak menghalangi submission valid dan tidak menghasilkan rating kinerja otomatis. |
| AC-73 | Support Contribution dapat ditautkan ke blocker/request dan menyimpan contributor, tindakan/catatan kontribusi, waktu, serta outcome jika tersedia; contribution dapat digunakan sebagai evidence sesuai permission. |
| AC-74 | Weekly summary/dashboard menampilkan continuation/carry-over berulang dan cross-project support sesuai scope; sistem tidak menyimpulkan kinerja buruk dari continuation berulang tanpa konteks. |
| AC-75 | Employee dapat melihat personal weekly summary untuk periode terpilih yang berisi submission, outcome, status days, continuation/carry-over, blocker, support contribution, dan escalation yang terkait, tanpa leaderboard atau competitive streak. |
| AC-76 | Individual Review Evidence/Weekly Accountability Summary memuat evidence yang tersedia sesuai permission dan mempertahankan pembedaan antara fakta, compliance event, dan catatan reviewer. |
| AC-77 | Head/Supervisor dashboard menampilkan exception sesuai scope termasuk RED/AMBER, no-submission, blocker acknowledgement, escalation aging, continuation berulang, dan support lintas proyek bila relevan; tampilan exception-first. |
| AC-78 | Monthly Management Trend menampilkan tren fungsi, recurring root cause, escalation aging, dan compliance pattern sesuai permission tanpa leaderboard atau KPI score otomatis. |
| AC-79 | Pattern flag No Submission menghasilkan review event, bukan kesimpulan pelanggaran atau sanksi otomatis. |
| AC-80 | Review event dapat mencatat penjelasan karyawan, konteks, coaching/support/tindakan korektif, aktor, timestamp, dan tindak lanjut dengan audit trail serta permission yang sesuai. |
| AC-81 | Recorded warning atau proses formal hanya dapat dicatat/dirujuk oleh aktor berwenang sesuai kebijakan; sistem tidak menentukan kesalahan atau menerbitkan SP otomatis. |
| AC-82 | Proses review dapat membedakan isu kapasitas/skill, blocker/dependency, perubahan prioritas, exemption sah, kesalahan proses, dan dugaan pengabaian; pelaporan blocker yang jujur tidak otomatis diperlakukan sebagai pelanggaran. |

### 18.2 Rollout and Pilot Governance Traceability

| ID | Acceptance / Governance Criterion |
|---|---|
| RG-01 | Sebelum pilot, Phase 0 menyelesaikan cutoff, grace period, escalation, exception, policy owner/reviewer, dan batas coaching/disciplinary. |
| RG-02 | Pilot MVP direncanakan 2–4 minggu pada kelompok yang paling membutuhkan blocker visibility; temuan dan keputusan perbaikan didokumentasikan sebelum company rollout. |
| RG-03 | Company rollout dilakukan setelah perbaikan pilot dan cakupan karyawan/fungsi dikonfirmasi; perkiraan awal sekitar 30 karyawan bukan batas permanen tanpa keputusan baru. |
| RG-04 | Management review dilakukan setelah sekitar 4–8 minggu data, mencakup usability, gaming risk, administrative burden, recurring blocker, fairness, dan pengurangan permintaan status manual. |
| RG-05 | KPI integration hanya dipertimbangkan setelah organisasi stabil melalui governance terpisah; semua data WorkPulse tidak otomatis menjadi KPI. |
| RG-06 | Pilot dievaluasi terhadap PSM-01 sampai PSM-07; target acknowledgement ≥80% dan submission ≥90% tidak dianggap terukur sebelum periode, pengecualian, dan target waktu acknowledgement disepakati. |

---

## 19. Product Philosophy Summary

WorkPulse harus membuat masalah terlihat lebih cepat, bukan membuat karyawan terlihat lebih sibuk. Produk dinilai berhasil ketika management memperoleh early warning yang lebih baik, karyawan memahami commitment dan dependency mereka, kontribusi support lintas tim dapat dibuktikan, serta evaluasi memiliki evidence yang lebih objektif tanpa membangun budaya ketakutan. WorkPulse bukan timesheet, bukan alat surveillance, bukan leaderboard, bukan kalkulator KPI/insentif otomatis, dan bukan mekanisme penerbitan sanksi otomatis.

---

## Riwayat Revisi v1.5 — Baseline Reconciliation Addendum

- Mempertahankan seluruh isi PRD v1.4 dan menambahkan bagian rekonsiliasi untuk requirement baseline v1.0 yang belum dinyatakan secara eksplisit atau belum terwakili secara setara.
- Menambahkan FR-56–FR-73 untuk Performance Transition Framework, rating review berbasis evidence, fair use/incentive boundaries, commitment quality warning, Support Contribution, reporting detail, serta jalur review non-submission.
- Menambahkan rollout plan, pilot success metrics, key risks/mitigations, recommended policy statement, future integrations yang secara eksplisit bukan MVP, product philosophy summary, dan traceability tambahan.
- Menambahkan AC-65–AC-82 serta governance criteria RG-01–RG-06 tanpa mengubah atau menghapus acceptance criteria yang sudah ada.
- Menetapkan secara definitif spesifikasi Role-Based Output Prompt (FR-12 dan AC-37) berbasis 7 fungsi kanonikal, teks baku Bahasa Indonesia, dan fallback netral selaras dengan ADR-016 dan PDD v1.4 FINAL.

**Status:** v1.5 FINAL — PRD v1.4 dipertahankan dan disempurnakan secara menyeluruh dengan baseline reconciliation addendum serta finalisasi definitif FR-12/AC-37. Seluruh requirement berstatus konsisten, tuntas, dan mengikat.

