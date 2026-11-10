# WorkPulse — UAT Improvement Backlog (Enhancement & Refinement Register)

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Penanggung Jawab:** Harry (Acceptance Owner & Lead Manual UAT Tester)  
> **UAT Co-Pilot:** Senior Software Quality Assurance Engineer  
> **Status Dokumen:** ACTIVE — LIVING REGISTER  
> **Tanggal Inisialisasi:** 30 Oktober 2026  
> **Total Temuan:** 59 Calon Perbaikan (IMP-001 s.d. IMP-059)

---

## 1. TUJUAN & TATA KELOLA LOG

Dokumen ini berfungsi sebagai repositori terpusat untuk mendokumentasikan seluruh calon perbaikan produk (*improvement / enhancement / refinement*) yang teridentifikasi selama pelaksanaan Manual User Acceptance Testing (UAT).

### Aturan Pemisahan Defect vs Improvement
- **DEFECT:** Perilaku atau hasil aktual sistem yang **tidak memenuhi** spesifikasi requirement, kriteria penerimaan (acceptance criteria), atau expected result test case. Defect dicatat pada `UAT-Defect-Report-Template.md` atau defect tracking resmi.
- **IMPROVEMENT:** Sistem **telah berfungsi sesuai requirement** (status test case tetap **PASS**), namun ditemukan peluang penyempurnaan pada antarmuka visual (UI), kenyamanan alur pengguna (UX), tata bahasa/redaksional (*copywriting*), tata letak (*layout & spacing*), responsivitas (*responsive design*), aksesibilitas (*accessibility*), atau efisiensi interaksi sistem.
- **NEEDS CLASSIFICATION:** Temuan yang batasannya antara defect dan improvement belum dapat dipastikan secara tegas. Temuan ini akan ditandai secara eksplisit dan didiskusikan bersama Acceptance Owner.

### Ketentuan Operasional
1. Seluruh temuan yang dicatat memiliki status awal: `Candidate`.
2. Usulan perbaikan **TIDAK DIIMPLEMENTASIKAN** selama siklus Manual UAT berlangsung demi menjaga integritas build `v1.0.0-rc1`.
3. Keberadaan usulan improvement **TIDAK MENGUBAH** status kelulusan (PASS/FAIL) suatu test case.
4. Kode etik: Dilarang mengarang temuan; setiap catatan wajib bersumber langsung dari pengamatan Acceptance Owner.

---

## 2. TAKSONOMI KATEGORI IMPROVEMENT

Setiap temuan diklasifikasikan ke dalam salah satu kategori baku berikut:
1. `Copywriting & Microcopy` — Perbaikan label, placeholder, tooltip, pesan panduan, atau kejelasan redaksional.
2. `Visual Design & Styling` — Keselarasan palet warna, tipografi, kontras badge, estetika komponen, dan konsistensi ikonografi.
3. `Layout & Spacing` — Kerapian padding, margin, grid alignment, pemanfaatan ruang kosong (white space), dan visual hierarchy.
4. `Navigation & Architecture` — Kemudahan navigasi sidebar, konsistensi rute kanonikal, link kembali, dan hierarki menu.
5. `User Experience (UX)` — Alur kerja efisien, pengurangan klik berlebih, ergonomi form, dan pencegahan frustrasi pengguna.
6. `Responsive Design` — Penyesuaian tampilan pada layar mobile (375px), tablet (768px), hingga desktop resolusi tinggi.
7. `Accessibility (A11y)` — Kontras teks terhadap latar belakang, fokus keyboard, screen reader compatibility, dan visual cues.
8. `Interaction & Feedback` — Kecepatan feedback sistem, transisi status loading, animasi toast, dan konfirmasi aksi.
9. `Feature Enhancement` — Gagasan fitur tambahan bernilai tambah untuk rilis pasca-MVP.

---

## 3. LOG DAFTAR TEMUAN IMPROVEMENT (REGISTER)

| Finding ID | Title | Category | Page / Module | Related TC | Priority | Status |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **IMP-001** | Penyempurnaan Tagline Value Proposition Hero Login | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Low | Implemented (Pending UAT) |
| **IMP-002** | Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Low | Implemented (Pending UAT) |
| **IMP-003** | Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Low | Implemented (Pending UAT) |
| **IMP-004** | Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Medium | Implemented (Pending UAT) |
| **IMP-005** | Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Medium | Implemented (Pending UAT) |
| **IMP-006** | Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri | Visual Design & Styling | `/login` (Panel Kiri) | `TC-AUTH-001` | Medium | Implemented (Pending UAT) |
| **IMP-007** | Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur | Copywriting & Microcopy | `/login` (Form Kanan) | `TC-AUTH-001` | Low | Implemented (Pending UAT) |
| **IMP-008** | Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form | Visual Design & Styling | `/login` (Form Kanan) | `TC-AUTH-001` | Low | Implemented (Pending UAT) |
| **IMP-009** | Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment" | Copywriting & Microcopy | `/login` (Form Kanan) | `TC-AUTH-001` | Low | Implemented (Pending UAT) |
| **IMP-010** | Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna | Copywriting & Microcopy | `/login` (Footer Kanan) | `TC-AUTH-001` | Medium | Implemented (Pending UAT) |
| **IMP-011** | Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?" | Feature Enhancement | `/login` (Form Kanan) | `TC-AUTH-001` | High | Closed (Descoped) |
| **IMP-012** | Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi | Layout & Spacing | `/activate` & `/login` | `TC-AUTH-003` | Medium | Implemented (Pending UAT) |
| **IMP-013** | Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit | User Experience (UX) | `/login` & Error Guard | `TC-AUTH-002` | Medium | Implemented (Pending UAT) |
| **IMP-014** | Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar | Visual Design & Styling | Header Bar / Shell | `TC-AUTH-001` | Medium | Implemented (Pending UAT) |
| **IMP-015** | Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah | Navigation & Architecture | Header Bar / Shell | `TC-DLYM-001` | High | Implemented (Pending UAT) |
| **IMP-016** | Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today | User Experience (UX) | `/daily/*` (My Today) | `TC-DLYM-001` | High | Implemented (Pending UAT) |
| **IMP-017** | Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia' | Navigation & Architecture | Enterprise Sidebar | `TC-AUTH-001` | High | Implemented (Pending UAT) |
| **IMP-018** | Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas | Layout & Spacing | `/profile` | `TC-AUTH-007` | Low | Implemented (Pending UAT) |
| **IMP-019** | Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi) | Navigation & Architecture | Header Bar Global | `TC-AUTH-007` | High | Implemented (Pending UAT) |
| **IMP-020** | Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap) | Visual Design & Styling | Avatar Global | `TC-AUTH-007` | Low | Implemented (Pending UAT) |
| **IMP-021** | Pemisahan Nama Lengkap dan Jabatan pada Tampilan User | Copywriting & Microcopy | `/profile` & Header | `TC-AUTH-007` | Medium | Implemented (Pending UAT) |
| **IMP-022** | Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24 | Layout & Spacing | `/profile` | `TC-AUTH-007` | High | Implemented (Pending UAT) |
| **IMP-023** | Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran | Navigation & Architecture | `ErrorPageView.vue` | `TC-AUTH-005` | High | Implemented (Pending UAT) |
| **IMP-024** | Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis | Navigation & Consistency | `/admin/*` | `TC-ADMN-002` | Medium | Implemented (Pending UAT) |
| **IMP-025** | Konsolidasi Topbar Administrasi: Eliminasi Menu Duplikat & Avatar Bulat | UI/UX & Information Architecture | `admin-layout` | `TC-ADMN-002` | Medium | Implemented (Pending UAT) |
| **IMP-026** | Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Navigasi 'Workspace' | Architecture & Separation of Duties (IAM) | `EnterpriseSidebar` & `navigation.ts` | `TC-AUTH-005` | High | Implemented (Pending UAT) |
| **IMP-027** | Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini | Layout & Visual Cleanliness | `/daily/morning` | `TC-DLYM-001` | Medium | Implemented (Pending UAT) |
| **IMP-028** | Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen | Microcopy & UX Content | `/daily/morning` | `TC-DLYM-001` | Medium | Implemented (Pending UAT) |
| **IMP-029** | Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox | Copywriting & Polish | `/daily/morning` | `TC-DLYM-002` | Medium | Implemented (Pending UAT) |
| **IMP-030** | Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis | Microcopy & UX Communication | `/daily/morning` | `TC-DLYM-002` | Medium | Implemented (Pending UAT) |
| **IMP-031** | Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work | Copywriting & Polish | `/daily/additional-work` | `TC-DLYA-001` | Medium | Implemented (Pending UAT) |
| **IMP-032** | Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work | Layout & Responsive Styling | `/daily/additional-work` | `TC-DLYA-002` | High | Implemented (Pending UAT) |
| **IMP-033** | Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome | Layout & Visual Cleanliness | `/daily/eod` | `TC-DLYE-001` | Medium | Implemented (Pending UAT) |
| **IMP-034** | Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome | Copywriting & Polish | `/daily/eod` | `TC-DLYE-001` | Medium | Implemented (Pending UAT) |
| **IMP-035** | Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD | Microcopy & UX Communication | `/daily/eod` | `TC-DLYE-002` | High | Implemented (Pending UAT) |
| **IMP-036** | Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD | Copywriting & Polish | `/daily/eod` | `TC-DLYE-001` | Medium | Implemented (Pending UAT) |
| **IMP-037** | Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal) | Layout & Visual Polish | `/daily/eod` | `TC-DLYE-001` | High | Implemented (Pending UAT) |
| **IMP-038** | Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan) | Functional Consistency & Business Logic | `/daily/eod` | `TC-DLYE-001` | Medium | Implemented (Pending UAT) |
| **IMP-039** | Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis | Microcopy & UX Communication | `/daily/eod` & `/daily/additional-work` | `TC-DLYA-001` | Low | Implemented (Pending UAT) |
| **IMP-040** | Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /raise-blockers (Eliminasi Modal Pop-Up Redundan) | Navigation & Consistency | `/daily/eod` & `/daily/*` | `TC-BLKR-001`, `TC-DLYE-001` | High | Implemented (Pending UAT) |
| **IMP-041** | Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05 (Tombol Kembali, Judul & 2 Tab) | Layout & Information Architecture | `/raise-blockers` | `TC-BLKR-001`, `TC-BLKR-005` | High | Implemented (Pending UAT) |
| **IMP-042** | Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan | RBAC & Access Control | `/raise-blockers` | `TC-BLKR-001`, `TC-AUTH-005` | Medium | Implemented (Pending UAT) |
| **IMP-043** | Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Blocker', Avatar Inisial & Lonceng Notifikasi | Navigation & Visual Consistency | `/raise-blockers` | `TC-BLKR-001` | Medium | Implemented (Pending UAT) |
| **IMP-044** | Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim | Copywriting & Visual Cleanliness | `/raise-blockers` | `TC-BLKR-001` | Low | Implemented (Pending UAT) |
| **IMP-045** | Restrukturisasi Tampilan EOD Terkunci Menjadi Panel Ringkasan Evaluasi Ringkas (Read-Only Summary View) | Layout & Visual Polish | `/daily/eod` | `TC-DLYE-001` | Medium | Open / Proposed |
| **IMP-046** | Pengelompokan Hierarkis (optgroup) & Filter Otoritas pada Dropdown Penanggung Jawab Khusus Blocker | Information Architecture & UX | `/raise-blockers` | `TC-BLKR-001` | High | Resolved / Implemented |
| **IMP-047** | Penyempurnaan Tata Letak (Layout) & Penambahan Live Character Counter pada Modal Dialog Resolusi Blocker | UI Polish & Form Usability | `/blockers` | `TC-BLKR-003` | Medium | Resolved / Implemented |
| **IMP-048** | Sinkronisasi Skema Respon API Risiko Proyek & Integrasi Proyek WP-CORE pada Project Risk Radar | Backend API & Frontend Data Contract | `/projects/risk` & `/blockers` | `TC-BLKR-005`, `TC-PM-001` | High | Resolved / Implemented |
| **IMP-049** | Penyelarasan Pemenuhan Database Constraint chk_blocker_note_required & Pemetaan Enum Outcome/Continuation | Backend Database Integrity | `/corrections/review` & `/corrections/morning` | `TC-CORR-001`, `TC-CORR-002` | Critical | Resolved / Implemented |
| **IMP-050** | Inisialisasi Otomatis Antrean Kepatuhan HRGA & Fleksibilitas Penautan Catatan Pembinaan Manajerial | Backend Compliance Seeding | `/compliance` | `TC-CORR-004`, `TC-HRGA-001` | High | Resolved / Implemented |
| **IMP-051** | Pemisahan Kolom Status dan Aksi pada Tabel Antrean Persetujuan Cuti (Leave Approval Queue) | UI / Visual Layout | `/leave/queue` | `TC-LEAV-002` | Medium | Resolved / Implemented |
| **IMP-052** | Redesain Modal Persetujuan Cuti (Leave Review Modal Layout, Microcopy & SVG Icon Alignment) | UI / Visual Design & Modal Polish | `/leave/queue` | `TC-LEAV-002` | High | Resolved / Implemented |
| **IMP-053** | Sinkronisasi Properti reviewNote & Peremajaan Visual Catatan Reviewer Cuti | Frontend Data Binding & UI Polish | `/leave/my` & `/leave/queue` | `TC-LEAV-003`, `TC-LEAV-002` | High | Resolved / Implemented |
| **IMP-054** | Alokasi Lebar Kolom Aksi dan Stabilisasi Layout Tabel Riwayat Cuti | UI / Visual Layout | `/leave/my` | `TC-LEAV-003`, `TC-LEAV-004` | Medium | Resolved / Implemented |
| **IMP-055** | Standardisasi Terminologi Bahasa Indonesia Bisnis & Eliminasi Jargon Teknis 'Superseded by Approved Leave' pada Modul Cuti | Copywriting & Microcopy | `/leave/my`, `/leave/queue` & `/daily/morning` | `TC-LEAV-003` | High | Resolved / Implemented |
| **IMP-056** | Standardisasi Bahasa Indonesia Bisnis, Format Stage Kepatuhan & Eliminasi Jargon pada Modul Coaching | Copywriting & Microcopy | `/coaching` | `TC-COAC-001` | High | Resolved / Implemented |
| **IMP-057** | Penayangan Rincian Isi Catatan Pembinaan pada Notifikasi & Pencegahan Navigasi 403 bagi Karyawan | UX Ergonomics & Navigation Guard | `/notifications` & `CoachingService` | `TC-COAC-002` | High | Resolved / Implemented |
| **IMP-058** | Restrukturisasi Alur Delegasi Reviewer: Orientasi Pejabat Berhalangan, Jabatan Riil, dan Notifikasi 2 Arah | Business Logic & Organizational Governance | `/admin/temporary-reviewers` | `TC-ADMN-001`, `TC-HRGA-003` | High | Resolved / Implemented |
| **IMP-059** | Tata Kelola Siklus Hidup Pendelegasian Wewenang (Edit & Cabut Akses) serta Notifikasi Dua Arah Komprehensif | Lifecycle Management & Notification Transparency | `/admin/temporary-reviewers` & `/notifications` | `TC-ADMN-001`, `TC-HRGA-003` | High | Resolved / Implemented |

---

## 4. RINCIAN SPESIFIKASI TEMUAN

### [IMP-001] Penyempurnaan Tagline Value Proposition Hero Login
- **Finding ID:** IMP-001
- **Title:** Penyempurnaan Tagline Value Proposition Hero Login
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Panel Hijau Kiri)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Tagline berbunyi: *"Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur."*
- **Proposed Improvement:** Ubah copywriting menjadi lebih berfokus pada mitigasi risiko dan transparansi, contohnya: *"Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur."* atau formulasi nilai manfaat lain yang lebih tepat.
- **Rationale / Expected Benefit:** Memberikan penekanan yang lebih tajam pada aspek deteksi risiko dini bagi tim dan manajemen sejak awal hari.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-002] Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- **Finding ID:** IMP-002
- **Title:** Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Panel Kiri)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Judul poin pertama tertulis *"Komitmen Pagi Tuntas"*.
- **Proposed Improvement:** Ganti frasa *"Komitmen Pagi Tuntas"* dengan istilah yang mencakup siklus komitmen secara utuh, bukan hanya pagi hari melainkan pemantauan kendala di tengah hari dan evaluasi di akhir hari.
- **Rationale / Expected Benefit:** Menghindari bias persepsi bahwa sistem WorkPulse hanya digunakan pada pagi hari; mencerminkan siklus akuntabilitas kerja harian yang menyeluruh.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-003] Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- **Finding ID:** IMP-003
- **Title:** Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Panel Kiri)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Subtitle poin 1 berbunyi *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."*
- **Proposed Improvement:** Sesuaikan kalimat menjadi: *"Tentukan 1 hingga 3 komitmen harian yang berdampak dan realistis."* (atau diselaraskan setelah judul poin 1 disepakati).
- **Rationale / Expected Benefit:** Bahasa terasa lebih memotivasi, menekankan dampak dan realisme komitmen dibanding sekadar keterikatan administratif pada jam cut-off.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-004] Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- **Finding ID:** IMP-004
- **Title:** Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Panel Kiri)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Rumusan judul dan deskripsi poin 2 belum presisi sama dengan spesifikasi dokumen perancangan UI/UX.
- **Proposed Improvement:** Samakan secara kanonikal dengan prototipe UI/UX:
  - Judul: **"Pelaporan Blocker Cepat"**
  - Subtitle: **"Transparansi kendala teknis atau ketergantungan alur kerja agar segera mendapat bantuan."**
- **Rationale / Expected Benefit:** Konsistensi 100% antara spesifikasi desain produk resmi dengan implementasi antarmuka.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Dokumen Desain UI/UX & Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-005] Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- **Finding ID:** IMP-005
- **Title:** Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Panel Kiri)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Rumusan judul dan deskripsi poin 3 belum sepenuhnya mengadopsi teks resmi prototipe UI/UX.
- **Proposed Improvement:** Samakan secara kanonikal dengan prototipe UI/UX:
  - Judul: **"Kemitraan & Dukungan Tim"**
  - Subtitle: **"Bukan alat pengawasan kaku, melainkan ruang sinkronisasi ritme kerja tim."**
- **Rationale / Expected Benefit:** Menegaskan filosofi WorkPulse sebagai platform pemberdayaan dan pendampingan, bukan sekadar alat monitoring (*micromanagement*).
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Dokumen Desain UI/UX & Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-006] Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- **Finding ID:** IMP-006
- **Title:** Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- **Category:** Visual Design & Styling
- **Page / Module:** Halaman Login (`/login`, Panel Kiri)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Ketiga poin fitur saat ini menggunakan emotikon/emoji berwarna bawaan platform.
- **Proposed Improvement:** Ganti emoji dengan 3 ikon vektor SVG profesional sesuai icon set desain sistem (Lucide icons / Heroicons) yang dipakai pada prototipe UI/UX.
- **Rationale / Expected Benefit:** Meningkatkan visual maturity, konsistensi render di lintas platform OS/browser, dan estetika enterprise grade.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Komponen `LoginView.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-007] Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
- **Finding ID:** IMP-007
- **Title:** Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Hero Panel Kiri & Header Form)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Headline form berbunyi *"Fokus pada Hasil, Tuntaskan Kendala."*
- **Proposed Improvement:** Rumuskan kembali headline agar mencakup transparansi komitmen dan kolaborasi, tidak terkesan sempit pada pelaporan hasil akhir semata.
- **Rationale / Expected Benefit:** Selaras dengan esensi WorkPulse yang mencakup penetapan komitmen, transparansi blocker harian, dan evaluasi hasil secara proporsional.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 1 (IMP-007) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit d7ab91d, 229c93b (Change Register: CHG-014)
- **Implementation Note:** Menyesuaikan headline utama pada panel hero halaman login (`LoginView.vue`) dan halaman aktivasi (`ActivateView.vue`) menjadi rumusan kalimat mengalir dua baris: `Komitmen jelas,<br>hambatan tuntas` tanpa tanda titik akhir sesuai kaidah tipografi headline digital modern. Frasa ini mencerminkan ritme akuntabilitas kerja harian yang seimbang antara penetapan komitmen pagi hari dan penuntasan hambatan kerja, tanpa persepsi sempit sekadar pelaporan hasil akhir.
- **Closure & Verification Note:** Implementasi telah selesai, hasil penyesuaian visual pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Standalone 1 (IMP-007) telah resmi ditutup.

---

### [IMP-008] Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
- **Finding ID:** IMP-008
- **Title:** Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
- **Category:** Visual Design & Styling
- **Page / Module:** Halaman Login (`/login`, Form Kanan / Hero Footer)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Label versi tertulis statis: *"WorkPulse v2.0 • Clean-Slate Architecture"*.
- **Proposed Improvement:** Ganti teks tersebut menjadi *"WorkPulse v1.5 · Dutamedia"* dan pastikan penomoran versi dapat terbaca secara fleksibel/dinamis dari konfigurasi rilis aplikasi.
- **Rationale / Expected Benefit:** Penomoran versi selaras dengan dokumen acuan rilis internal dan menghapus istilah teknis arsitektur dari hadapan pengguna umum.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 2 (IMP-008) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit e86742b (Change Register: CHG-015)
- **Implementation Note:** Membuat modul konfigurasi aplikasi terpusat `frontend/src/config/app.ts` (`APP_CONFIG`) dengan properti versi yang fleksibel (default `'v1.5'` dengan dukungan override environment variable `VITE_APP_VERSION`) dan format merek `"WorkPulse v1.5 · Dutamedia"`. Memperbarui footer panel hero di `LoginView.vue` dan `ActivateView.vue` agar membaca nilai dinamis ini serta menghapus istilah teknis arsitektur rekayasa internal (*"Clean-Slate Architecture"*) dan penomoran statis `v2.0`. Seluruh pengujian otomatis (84 unit test) lulus 100%.
- **Closure & Verification Note:** Implementasi telah selesai, hasil penyesuaian visual pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Standalone 2 (IMP-008) telah resmi ditutup.

---

### [IMP-009] Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
- **Finding ID:** IMP-009
- **Title:** Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login & Aktivasi (`/login`, `/activate`, Footer Panel Hero)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Baris kedua footer panel hero menampilkan nama badan usaha *"PT Dutamedia Mandiri Pratama"*.
- **Proposed Improvement:** Ubah label penanda konteks menjadi *"Internal Workspace Environment"*.
- **Rationale / Expected Benefit:** Memberikan penegasan batas ruang kerja internal tanpa redundansi nama perusahaan yang sudah terwakili di logo dan branding.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 3 (IMP-009) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit b611ad9 (Change Register: CHG-016)
- **Implementation Note:** Memperbarui baris kedua footer panel hero di `LoginView.vue` dan `ActivateView.vue` dari `PT Dutamedia Mandiri Pratama` menjadi `Internal Workspace Environment` selaras dengan Prototipe 01 baris 935 sebagai indikator batas lingkungan kerja internal. Seluruh pengujian otomatis (86 unit test) lulus 100%.
- **Closure & Verification Note:** Implementasi telah selesai, hasil penyesuaian visual pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Standalone 3 (IMP-009) telah resmi ditutup.

---

### [IMP-010] Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
- **Finding ID:** IMP-010
- **Title:** Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Footer Kanan)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Footer menampilkan detail teknis implementasi keamanan: *"Perlindungan sesi via HttpOnly & CSRF Double-Submit"*.
- **Proposed Improvement:** Ganti microcopy menjadi teks panduan praktis: *"Kendala akses akun? Hubungi Admin System atau Tim HRGA."*
- **Rationale / Expected Benefit:** Memberikan nilai bantu nyata kepada karyawan awam saat menghadapi kesulitan autentikasi, dibanding menampilkan jargon teknis backend/security.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 4 (IMP-010) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 2c5bbe8, 871eaba (Change Register: CHG-017)
- **Implementation Note:** Memperbarui microcopy pada area `.help-hint` di bawah tombol login `LoginView.vue` dari teks teknis backend `Perlindungan sesi via HttpOnly & CSRF Double-Submit` menjadi teks panduan bantuan akses pengguna `Kendala akses akun? Hubungi Admin System atau Tim HRGA.` selaras dengan keputusan Acceptance Owner. Seluruh pengujian otomatis (87 unit test) lulus 100%.
- **Closure & Verification Note:** Implementasi telah selesai, hasil penyesuaian visual pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Standalone 4 (IMP-010) telah resmi ditutup.

---

### [IMP-011] Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
- **Finding ID:** IMP-011
- **Title:** Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
- **Category:** Feature Enhancement
- **Page / Module:** Halaman Login (`/login`, Form Kanan)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Belum tersedia tautan / tombol *"Lupa kata sandi?"* pada form login.
- **Proposed Improvement:** Sediakan tombol/link *"Lupa kata sandi?"* yang memunculkan petunjuk resmi bagi pengguna (misal modal popover instruksi untuk menghubungi Admin/HRGA, atau integrasi alur reset terkontrol).
- **Rationale / Expected Benefit:** Alur penanganan lupa kata sandi merupakan standar esensial bagi pengguna aplikasi web untuk mencegah kebuntuan akses.
- **Priority:** High
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Closed (Descoped)
- **Product Decision:** DEC-008-UAT Amandemen — Keputusan Definitif Acceptance Owner (03/11/2026): Tombol / tautan mandiri "Lupa kata sandi?" ditiadakan dari form login. Pemulihan akun dan reset kata sandi merupakan prosedur administratif terpusat yang ditangani oleh Admin System dan Tim HRGA, bukan fitur mandiri antarmuka. Kebutuhan bantuan bagi pengguna yang lupa sandi telah sepenuhnya terwadahi secara terpadu melalui microcopy panduan akses akun (*"Kendala akses akun? Hubungi Admin System atau Tim HRGA."* pada IMP-010).
- **Closure Note:** Temuan resmi DITUTUP (CLOSED) dengan status Descoped / Not Required atas penetapan resmi Acceptance Owner. Standalone 5 resmi ditutup.

---

### [IMP-012] Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
- **Finding ID:** IMP-012
- **Title:** Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
- **Category:** Layout & Spacing
- **Page / Module:** Halaman Login & Aktivasi (`/activate` & `/login`)
- **Related Test Case:** `TC-AUTH-003`
- **Current Condition:** Pada tab Aktivasi Akun, panel hijau di sisi kiri belum memiliki keselarasan penuh dengan kondisi panel kiri pada tab Masuk Sistem.
- **Proposed Improvement:** Samakan visual panel hijau kiri pada tab Aktivasi Akun persis dengan tab Masuk Sistem (desktop), termasuk implementasi perbaikan copywriting dan ikon SVG baru, dengan tetap menyembunyikannya pada viewport mobile.
- **Rationale / Expected Benefit:** Memberikan pengalaman visual yang konsisten dan mulus bagi pengguna saat berpindah antara tab login dan aktivasi.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (`ActivateView.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 1 (SOL-AUTH-HERO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 802712e (Change Register: CHG-010)

---

### [IMP-013] Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit
- **Finding ID:** IMP-013
- **Title:** Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit
- **Category:** User Experience (UX)
- **Page / Module:** Halaman Login & Exception Filters
- **Related Test Case:** `TC-AUTH-002`
- **Current Condition:** Skenario UAT saat ini berfokus pada salah password dasar; belum menguji secara khusus pesan error saat akun berstatus `INACTIVE` dan reaksi proteksi *Rate-Limit Lockout* (ThrottlerGuard).
- **Proposed Improvement:** Dokumentasikan kandidat skenario pengujian lanjutan pasca-UAT inti untuk memvalidasi keramahan pesan error saat akun dinonaktifkan oleh HRGA serta saat percobaan login melebihi batas rate limit.
- **Rationale / Expected Benefit:** Memastikan keamanan sistem tetap diimbangi dengan kejelasan umpan balik (*user feedback*) saat terjadi kondisi pencegahan akses.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Exception Filter & Throttler)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 6 (IMP-013) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 376acf1, 4dc067c (Change Register: CHG-019)
- **Implementation Note:** Multi-tier negative authentication hardening telah diimplementasikan penuh: (1) Penanganan akun `INACTIVE` dengan pesan error ramah mengarahkan ke HRGA, (2) `AllExceptionsFilter` memetakan status HTTP 429 ke `AUTH_RATE_LIMIT_EXCEEDED` dengan pesan ramah berbahasa Indonesia, (3) `auth.controller.ts` membatasi `@Throttle` login dengan batas aman (maksimum 5 percobaan), (4) Client-side defense-in-depth lockout pada `LoginView.vue` memblokir tombol pada percobaan ke-5 berturut-turut dengan countdown timer dinamis 60 detik (`Terkunci (60s)`), dan (5) Dokumen `UAT-Manual-Test-Cases.md` skenario `TC-AUTH-002` telah diperkaya dengan 3 sub-skenario pengujian spesifik.
- **Closure & Verification Note:** Implementasi telah selesai, automated tests 100% pass (unit backend & frontend), verifikasi manual Acceptance Owner diterima, seluruh kriteria penerimaan terpenuhi, dan Standalone 6 resmi ditutup.

---

### [IMP-014] Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar
- **Finding ID:** IMP-014
- **Title:** Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar
- **Category:** Visual Design & Styling
- **Page / Module:** Header Bar Aplikasi (Shell Navigasi)
- **Related Test Case:** `TC-AUTH-001`, `TC-DLYM-001`
- **Current Condition:** Tombol profil di ujung kanan atas berupa tombol teks / link standar.
- **Proposed Improvement:** Ganti tombol teks dengan komponen avatar/ikon profil melingkar sesuai prototipe UI/UX Design.
- **Rationale / Expected Benefit:** Tampilan header menjadi lebih bersih, elegan, dan hemat ruang horizontal (*clean visual hierarchy*).
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Header Bar)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Tombol teks profil pada header bar navigasi telah digantikan secara global oleh komponen Circular User Avatar berbasis inisial nama dinamis pengguna aktif melalui komponen terpusat `TopBar.vue`, mengarahkan langsung ke rute `/profile` tanpa dropdown.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-015] Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
- **Finding ID:** IMP-015
- **Title:** Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
- **Category:** Navigation & Architecture
- **Page / Module:** Header Bar Aplikasi (Shell Navigasi)
- **Related Test Case:** `TC-DLYM-001`
- **Current Condition:** Header menampilkan tombol teks "Riwayat Saya" di samping tombol profil.
- **Proposed Improvement:** Ganti tombol tersebut menjadi tombol Ikon Notifikasi (lonceng) dengan indikator titik merah (*unread badge*) bila terdapat notifikasi baru, sesuai rancangan prototipe UI/UX Design.
- **Rationale / Expected Benefit:** Menghadirkan pusat kesadaran notifikasi instan bagi pengguna tanpa harus menavigasi menu tersembunyi.
- **Priority:** High
- **Evidence / Screenshot Reference:** TBD (Prototipe UI/UX Header)
- **Status:** Implemented (Pending UAT)
- **Product Decision:** DEC-008-UAT (Alternatif A — Static Notification Navigation; Keputusan Acceptance Owner 02/11/2026: Ikon Bell statis navigasi ke /notifications; Ditolak: Dynamic unread counter & real-time engine)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Sesuai keputusan produk definitif DEC-008-UAT, tombol teks 'Riwayat Saya' pada header bar telah digantikan dengan tombol Ikon Notifikasi (SVG Lucide Bell) pada `TopBar.vue` yang berfungsi sebagai shortcut akses navigasi langsung ke `/notifications` tanpa unread counter/badge/red dot.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-016] Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
- **Finding ID:** IMP-016
- **Title:** Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
- **Category:** User Experience (UX)
- **Page / Module:** Halaman Kerja Harian (`/daily/morning`, `/daily/additional`, `/daily/eod`)
- **Related Test Case:** `TC-DLYM-001`, `TC-BLKR-001`
- **Current Condition:** Tombol Lapor Blocker saat ini hanya muncul di halaman EOD Outcome, dan terdapat potensi duplikasi penempatan di header bar dan konten dalam.
- **Proposed Improvement:** Letakkan satu tombol "Lapor Blocker" yang konsisten pada masing-masing ketiga halaman My Today (Morning, Additional Work, EOD), diposisikan sejajar di baris tab 1, 2, 3 pada ujung kanan sesuai batas margin dan grid desain prototipe.
- **Rationale / Expected Benefit:** Memungkinkan karyawan melaporkan hambatan kritis kapan saja (pagi, siang, maupun sore) dengan lokasi tombol yang konsisten dan ergonomis.
- **Priority:** High
- **Evidence / Screenshot Reference:** TBD (Rancangan Tab My Today)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 7 (IMP-016) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 84b0d83 (Change Register: CHG-020)
- **Implementation Note:** Struktur baris tab kerja harian (`.workflow-bar`) telah distandarisasi pada `MorningCommitmentView.vue`, `AdditionalWorkView.vue`, dan `EodOutcomeView.vue` menggunakan pembagian kontainer `.step-items` dan `.workflow-actions`. Tombol `.btn-report-blocker` (menggunakan `AccessLink` ke `/blockers/raise` dengan ikon AlertTriangle dan styling token kanonikal prototipe) ditempatkan konsisten di sisi kanan tab bar pada ketiga halaman, tombol modal lama di heading EOD telah dibersihkan, dan suite pengujian unit otomatis telah ditambahkan.
- **Closure & Verification Note:** Implementasi telah selesai, automated tests 100% pass (32 unit test frontend pass, build clean), peninjauan Vercel Preview telah diterima oleh Acceptance Owner, seluruh Acceptance Criteria terkait terpenuhi, dan Standalone 7 telah resmi ditutup.

---

### [IMP-017] Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'
- **Finding ID:** IMP-017
- **Title:** Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'
- **Category:** Navigation & Architecture
- **Page / Module:** Enterprise Sidebar (`EnterpriseSidebar.vue`)
- **Related Test Case:** `TC-AUTH-001`, `TC-DLYM-001`
- **Current Condition:**
  1. Teks di bawah logo WorkPulse di sidebar belum ringkas 'Dutamedia'.
  2. Ketiga halaman harian (Morning Commitment, Additional Work, EOD Outcome) muncul terpisah ketiganya sebagai link di sidebar, menduplikasi navigasi tab.
- **Proposed Improvement:**
  1. Ubah teks di bawah logo menjadi **'Dutamedia'** saja.
  2. Satukan ketiga link harian di sidebar menjadi satu menu induk: **"My Today"**, dengan sub-navigasi rute diatur oleh tab header internal (*"My Today / Morning Commitment"*, *"My Today / Additional Work"*, *"My Today / EOD Outcome"*).
- **Rationale / Expected Benefit:** Mencegah redundansi navigasi antara sidebar dan tab dalam halaman, merapikan struktur menu sidebar, dan menyelaraskan fungsi bar navigasi atas.
- **Priority:** High
- **Evidence / Screenshot Reference:** TBD (`EnterpriseSidebar.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Scope:** Cycle 2 — Standalone 8 (IMP-017) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 9f8a65f (Change Register: CHG-021)
- **Implementation Note:** Teks brand caption di bawah logo WorkPulse pada sidebar telah diringkas menjadi 'Dutamedia'. Tiga tautan alur harian terpisah di grup Workspace telah disatukan menjadi satu menu induk 'My Today' (ikon Clock, target `/daily/morning`), didukung fungsi `isItemActive()` yang menjaga status highlight aktif saat pengguna berada di sub-halaman `/daily/*`, serta penyediaan rute alias `/daily` redirect ke `/daily/morning`.
- **Closure & Verification Note:** Implementasi telah selesai, automated tests 100% pass (32 test suite frontend pass, 96 tests), peninjauan Vercel Preview diterima Acceptance Owner, seluruh Acceptance Criteria terpenuhi, dan Standalone 8 telah resmi ditutup.

---

### [IMP-018] Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas
- **Finding ID:** IMP-018
- **Title:** Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas
- **Category:** Layout & Spacing
- **Page / Module:** Halaman Profil Akun (`/profile`)
- **Related Test Case:** `TC-AUTH-007`
- **Current Condition:** Topbar atas menampilkan badge "WP WorkPulse" yang redundan karena logo WorkPulse sudah terpampang permanen di sidebar kiri.
- **Proposed Improvement:** Hilangkan badge "WP WorkPulse" dari topbar halaman `/profile` agar area navigasi atas lebih bersih dan fokus pada breadcrumb konteks halaman.
- **Rationale / Expected Benefit:** Mengurangi redundansi identitas brand pada satu layar dan menciptakan hierarki visual yang lebih rapi.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (`ProfileView.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Badge redundan 'WP' dan teks jenama 'WorkPulse' pada topbar halaman `/profile` (`ProfileView.vue`) telah dieliminasi sepenuhnya. Digantikan dengan standar global `TopBar.vue` dengan breadcrumb tunggal kanonikal 'Profil Akun'.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-019] Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)
- **Finding ID:** IMP-019
- **Title:** Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)
- **Category:** Navigation & Architecture
- **Page / Module:** Header Bar Aplikasi (Shell Navigasi Global)
- **Related Test Case:** `TC-AUTH-007`
- **Current Condition:** Bar atas halaman `/profile` berbeda dari halaman utama lainnya dan memuat elemen yang tidak konsisten.
- **Proposed Improvement:** Seragamkan bar atas di seluruh halaman sistem menjadi satu standar: menampilkan ikon notifikasi (lonceng dengan badge unread) dan tombol profil berupa avatar inisial pengguna, tanpa tombol teks profil/logout yang berulang di header, karena navigasi profil sudah tersedia di sudut kiri bawah sidebar.
- **Rationale / Expected Benefit:** Menghadirkan konsistensi pengalaman navigasi global (*unified layout pattern*) di seluruh halaman WorkPulse.
- **Priority:** High
- **Evidence / Screenshot Reference:** TBD (Rancangan Header Global)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** **SOLUSI GLOBAL UTAMA:** Mengimplementasikan standardisasi topbar global di seluruh 26 halaman aplikasi menggunakan komponen terpusat `TopBar.vue` (`[Breadcrumb] ... [Bell] [Avatar]`). Mengeliminasi inkonsistensi layout, tautan teks profil, tombol logout mengambang, dan menu navigasi horizontal duplikat di seluruh header aplikasi.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-020] Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)
- **Finding ID:** IMP-020
- **Title:** Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)
- **Category:** Visual Design & Styling
- **Page / Module:** Avatar Pengguna (Sidebar & Halaman `/profile`)
- **Related Test Case:** `TC-AUTH-007`
- **Current Condition:** Pada footer sidebar kiri inisial pengguna adalah 2 huruf "AN" (Aditya Nugroho), namun saat membuka halaman `/profile`, avatar besar hanya menampilkan 1 huruf "A".
- **Proposed Improvement:** Buat logika penjanaan inisial avatar yang konsisten mengambil 2 huruf (huruf pertama nama depan dan huruf pertama nama belakang, misal "AN") di seluruh komponen avatar aplikasi.
- **Rationale / Expected Benefit:** Konsistensi visual dan identitas personal pengguna yang lebih akurat dan profesional.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (`ProfileView.vue` & `EnterpriseSidebar.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Mengimplementasikan utilitas penjanaan inisial avatar tunggal dan deterministik (`getUserInitials` di `frontend/src/utils/initials.ts`). Menegakkan aturan seragam: 2 karakter huruf kapital (1 kata: 2 karakter pertama; 2-4+ kata: huruf pertama kata pertama dan terakhir; fallback email/'U'). Diterapkan seragam pada `EnterpriseSidebar.vue`, `TopBar.vue`, dan avatar besar kartu identitas `ProfileView.vue` (Aditya Nugroho konsisten menghasilkan 'AN').
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-021] Pemisahan Nama Lengkap dan Jabatan pada Tampilan User
- **Finding ID:** IMP-021
- **Title:** Pemisahan Nama Lengkap dan Jabatan pada Tampilan User
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Profil Akun (`/profile` & Sidebar)
- **Related Test Case:** `TC-AUTH-007`
- **Current Condition:** Teks nama pengguna ditampilkan bersambung dengan tanda kurung jabatan, contohnya: "Aditya Nugroho (Frontend Engineer)".
- **Proposed Improvement:** Pisahkan field nama lengkap pengguna ("Aditya Nugroho") dengan field jabatan ("Frontend Engineer") secara visual atau struktural, tanpa menggabungkan nama dan jabatan dalam tanda kurung pada satu string teks.
- **Rationale / Expected Benefit:** Membedakan entitas nama individu dari penugasan organisasi secara profesional dan sesuai prinsip desain basis data.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`ProfileView.vue` & `EnterpriseSidebar.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 3 (SOL-PROF-LAYO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 512bbd1, 05876bb, 6bafd19 (Change Register: CHG-012)
- **Implementation Note:** Memisahkan field nama lengkap pengguna ("Aditya Nugroho") dan jabatan fungsional ("Frontend Engineer") sebagai elemen visual mandiri tanpa konkatenasi tanda kurung. Mengimplementasikan sanitasi nama otomatis pada level store (`auth.ts`), sidebar (`EnterpriseSidebar.vue`), dan profil (`ProfileView.vue`) serta utilitas inisial avatar (`initials.ts`), sehingga string lama berformat "Nama (Jabatan)" otomatis dibersihkan menjadi murni nama individu dan inisial avatar konsisten 'AN'. Data seeder backend (`seed.ts`) juga dibersihkan dari atribut jabatan dalam tanda kurung.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 3 (SOL-PROF-LAYO) telah resmi ditutup.

---

### [IMP-022] Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24
- **Finding ID:** IMP-022
- **Title:** Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24
- **Category:** Layout & Spacing
- **Page / Module:** Halaman Profil Akun (`/profile`)
- **Related Test Case:** `TC-AUTH-007`
- **Current Condition:** Body halaman `/profile` saat ini masih menggunakan layout dua kolom sederhana dengan prompt hint refleksi dan belum mengadopsi 3 seksi komprehensif prototipe 24 (`24-Profile-Settings.html`).
- **Proposed Improvement:** Selaraskan struktur konten halaman `/profile` agar mengadopsi rancangan kanonikal Prototipe 24: Header judul dan subtitle halaman yang jelas, kotak ringkasan profil, serta 3 seksi konten terstruktur: (1) Kartu Identitas & Penugasan Efektif (Read-Only) mencakup Jabatan & Departemen resmi, (2) Keamanan & Pembaruan Kata Sandi Mandiri, dan (3) Ringkasan Kanal Notifikasi Perangkat Ini (dengan tetap mengabaikan elemen dummy simulasi khusus prototipe).
- **Rationale / Expected Benefit:** Menghadirkan tampilan pengaturan akun enterprise yang lengkap, profesional, dan 100% selaras dengan acuan desain resmi perusahaan.
- **Priority:** High
- **Evidence / Screenshot Reference:** `Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/24-Profile-Settings.html`
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 3 (SOL-PROF-LAYO) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 512bbd1, 05876bb, 6bafd19 (Change Register: CHG-012)
- **Implementation Note:** Menyelaraskan seluruh struktur body halaman `/profile` (`ProfileView.vue`) dengan Prototipe 24 (`24-Profile-Settings.html`): Page Heading kanonikal ("Identitas & Konteks Akun" / "Profil Pengguna & Keamanan Akun"), Hero Identity Strip horizontal dengan avatar 68px berlatar mint soft, Seksi 1 Kartu Identitas & Penugasan Efektif (Read-Only 9 atribut master data organisasi + RoleBasedPromptHint kanonikal), Seksi 2 Keamanan & Pembaruan Kata Sandi Mandiri (meter kekuatan 4 segmen + checklist real-time + show/hide eye toggle + logout sesi aktif), dan Seksi 3 Ringkasan Kanal Notifikasi Perangkat Ini (Browser Push status, aturan tetap pengingat 60m sebelum cut-off, dan kanal sistem tetap). Toolbar simulasi khusus prototipe (`.sim-bar`) diabaikan/dieliminasi dari kode produksi.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 3 (SOL-PROF-LAYO) telah resmi ditutup.

---

### [IMP-023] Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran
- **Finding ID:** IMP-023
- **Title:** Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran
- **Category:** Navigation & Architecture
- **Page / Module:** Layar Error Terlarang (`ErrorPageView.vue` / `/forbidden`)
- **Related Test Case:** `TC-AUTH-005`
- **Current Condition:** Tombol "Kembali ke Dashboard" pada halaman Error 403 secara statis mengarahkan seluruh pengguna ke `/dashboard` (Pulse Dashboard), sehingga karyawan biasa (EMPLOYEE) mendarat di dashboard operasional manajerial dan bukan di halaman kerja kanonikalnya (`/daily/morning`).
- **Proposed Improvement:** Ubah rute tombol pemulihan agar memanggil helper navigasi berbasis peran (misal: `getRoleBasedHomeRoute(user.role)`), sehingga untuk peran EMPLOYEE tombol otomatis mengarahkan ke `/daily/morning`, sedangkan untuk peran manajerial mengarahkan ke `/dashboard`.
- **Rationale / Expected Benefit:** Menegakkan konsistensi tata kelola pendaratan berbasis peran (DEC-012) di seluruh alur pemulihan error sistem.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Sesi Manual UAT 30 Okt 2026 (`ErrorPageView.vue`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 9 (IMP-023) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 6bd9f6d (Change Register: CHG-022)
- **Implementation Note:** Menyelaraskan rute tombol pemulihan pada layar Error 403 / Forbidden (`ErrorPageView.vue`) menggunakan helper kanonikal `getLandingRouteForRole(auth.user?.role)` sehingga rute tujuan bersifat adaptif berbasis peran pengguna: `/daily/morning` untuk EMPLOYEE, `/dashboard` untuk peran manajerial (SUPERVISOR, MANAGER, VP, CEO), `/compliance` untuk HRGA, `/admin/organization` untuk SYSTEM_ADMIN, dan fallback `/login` jika sesi unauthenticated. Melakukan standardisasi label tombol pemulihan menjadi "Kembali ke Beranda" (atau "Ke Halaman Login" jika tidak terautentikasi) serta melengkapi pengujian unit komprehensif pada `ErrorPageView.spec.ts`.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 9 (IMP-023) resmi ditutup.

### [IMP-024] Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP
- **Finding ID:** IMP-024
- **Title:** Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP
- **Category:** Navigation & Consistency
- **Page / Module:** Seluruh Modul Administrasi (`/admin/organization`, `/admin/policies`, `/admin/users`, `/admin/temporary-reviewers`)
- **Related Test Case:** `TC-ADMN-002`, `TC-ADMN-001`
- **Current Condition:** Bar navigasi bagian atas pada halaman-halaman administrasi menampilkan badge logo statis "WP WorkPulse" beserta label tag modul, padahal logo dan nama brand WorkPulse sudah tersemat secara permanen di sidebar kiri.
- **Proposed Improvement:** Selaraskan topbar administrasi dengan standar global layout WorkPulse (seperti pada modul Management/Team Pulse), yaitu mengganti badge logo dengan breadcrumb hirarkis bersih (contoh: `Administration / Struktur Organisasi` atau `Administration / Kebijakan Operasional`).
- **Rationale / Expected Benefit:** Menghilangkan redundansi elemen visual identitas jenama di layar, memberikan hierarki navigasi yang jelas bagi pengguna, dan menyeragamkan pola antarmuka di seluruh portal.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`/admin/organization`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Tercakup penuh oleh Solusi Global IMP-019. Seluruh modul administrasi (`/admin/organization`, `/admin/policies`, `/admin/users`, `/admin/temporary-reviewers`, `/admin/notifications`, `/admin/invitations`) kini menerapkan breadcrumb hirarkis bersih (contoh: 'Administration / Pemetaan Organisasi', 'Administration / Pengaturan Kebijakan') menggantikan badge logo duplikat WP.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-025] Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat
- **Finding ID:** IMP-025
- **Title:** Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat
- **Category:** UI/UX & Information Architecture
- **Page / Module:** Header Halaman Administrasi (`admin-layout`)
- **Related Test Case:** `TC-ADMN-002`, `TC-AUTH-007`
- **Current Condition:** Topbar administrasi memuat tautan horizontal teks ('Kelola Pengguna', 'Reviewer Sementara', 'Pengaturan Kebijakan', 'Profil Saya') yang sepenuhnya menduplikasi menu yang telah tersedia di sidebar grup *Administration*. Tautan profil juga hanya berupa teks "Profil Saya" polos tanpa avatar maupun bel notifikasi.
- **Proposed Improvement:** Bersihkan header atas dari tautan menu duplikat (cukup dikelola melalui sidebar). Di sisi kanan header atas, ganti teks "Profil Saya" dengan avatar inisial bulat standar (`SA` untuk System Admin) yang dilengkapi dropdown menu ringkas profil/logout serta ikon lonceng notifikasi terpadu.
- **Rationale / Expected Benefit:** Menjaga kebersihan antarmuka (declutter), menegakkan prinsip *Single Source of Navigation*, dan memastikan konsistensi visual identitas pengguna di seluruh sudut aplikasi.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`/admin/organization`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Tercakup penuh oleh Solusi Global IMP-019. Seluruh tautan navigasi horizontal pada header administrasi yang menduplikasi menu sidebar telah dibersihkan (decluttering). Sisi kanan header diseragamkan dengan avatar inisial bulat 'SA' dan ikon lonceng notifikasi.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-026] Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
- **Finding ID:** IMP-026
- **Title:** Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
- **Category:** Architecture & Separation of Duties (IAM)
- **Page / Module:** Navigasi Sidebar (`navGroups` / `router/navigation.ts`) & Router Guard (`router/index.ts`)
- **Related Test Case:** `TC-AUTH-005`, `TC-ADMN-002`
- **Current Condition:** Akun berkedudukan peran `SYSTEM_ADMIN` saat ini masih melihat dan memiliki akses ke grup menu *Workspace* (Morning Commitment, Additional Work, EOD Outcome, Lapor Blocker, Cuti Saya, Koreksi).
- **Proposed Improvement:** Terapkan pemisahan tugas (*Separation of Duties*) tegas pada tingkat navigasi dan hak akses: Akun `SYSTEM_ADMIN` adalah identitas pengelola sistem (bukan jabatan operasional karyawan perusahaan). Nonaktifkan grup navigasi *Workspace* untuk peran `SYSTEM_ADMIN`, sehingga akun admin murni hanya mengelola konfigurasi sistem (*Administration*) dan pemantauan eskalasi/audit (*Management*). Setiap PIC pengelola admin (misal HRGA/IT) yang memiliki kewajiban komitmen harian tetap menggunakan akun karyawan pribadinya masing-masing.
- **Rationale / Expected Benefit:** Mencegah terjadinya pencemaran data komitmen operasional pada akun sistem, menegakkan kepatuhan tata kelola akses enterprise (IAM Governance & Separation of Duties), serta menyederhanakan fokus antarmuka administrator.
- **Priority:** High
- **Evidence / Screenshot Reference:** Keputusan Arsitektur Acceptance Owner Sesi 30 Okt 2026
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 10 (IMP-026) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 5f9dfba (Change Register: CHG-023)
- **Implementation Note:** Menerapkan pemisahan tugas (Separation of Duties) tegas pada tingkat navigasi dan hak akses: mendefinisikan konstanta peran operasional `OPERATIONAL_ROLES` di `navigation.ts`, memfilter dan menonaktifkan grup `Workspace` secara penuh pada `navForRole` untuk peran `SYSTEM_ADMIN` sehingga sidebar hanya menampilkan grup `Management` dan `Administration`. Menerapkan route guard dua lapis dengan `roles: OPERATIONAL_ROLES` pada 8 rute kerja operasional (`/daily/morning`, `/daily/additional-work`, `/daily/eod`, `/daily/history`, `/raise-blockers`, `/corrections/morning`, `/corrections/eod`, `/leave/my`) di `router/index.ts` untuk mencegah akses manual langsung. Melengkapi unit test komprehensif pada `navigation.spec.ts` dan `EnterpriseSidebar.spec.ts`.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (104 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 10 (IMP-026) resmi ditutup.

### [IMP-027] Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment
- **Finding ID:** IMP-027
- **Title:** Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment
- **Category:** Layout & Visual Cleanliness
- **Page / Module:** Halaman Morning Commitment (`/daily/morning`)
- **Related Test Case:** `TC-DLYM-001`, `TC-DLYM-002`
- **Current Condition:** Kartu konteks jadwal memuat tag biru di kanan atas ("Kebijakan: On-Time ... Cut-off ..."), subkotak 1 memuat tanggal dengan subteks "Hari Kerja Aktif", subkotak 2 memuat batas on-time dengan subteks "Cut-Off Penguncian: ...", subkotak 3 memuat subteks "Jam Server: ...", dan subkotak 4 memuat subteks "Agregasi Tingkat Risiko". Layout terkesan padat dan redundan.
- **Proposed Improvement:** 
  1. Ganti label tag biru di sudut kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026").
  2. Subkotak 1: Ubah fokus menampilkan nilai "Batas On-Time" (cth: `09:00 WIB`) tanpa subteks.
  3. Subkotak 2: Ubah fokus menampilkan "Batas Cut-Off" / "Batas Akhir Pengisian" (cth: `23:59 WIB`) tanpa subteks.
  4. Subkotak 3: Tetap menampilkan "Status Waktu" (cth: badge `LATE (Jendela Toleransi)`), namun hapus subteks "Jam Server: 11:22".
  5. Subkotak 4: Tetap menampilkan "Status Awal Hari" / "Initial Daily Status" (cth: badge `GREEN — Terkendali`), namun hapus subteks "Agregasi Tingkat Risiko".
- **Rationale / Expected Benefit:** Menghadirkan antarmuka konteks yang bersih (*decluttered*), elegan, mudah dipindai dalam hitungan detik, serta menempatkan tanggal secara intuitif.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793335046155_20813e00.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 11 (IMP-027) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 44f457e (Change Register: CHG-024)
- **Implementation Note:** Restrukturisasi dan pembersihan 4 kartu metrik panel Konteks Hari Ini di `MorningCommitmentView.vue`: mengonversi badge kanan atas menjadi penanggalan dinamis bahasa Indonesia (`formattedWorkDate`, cth: 'Jumat, 30 Oktober 2026'), subkotak 1 berfokus mandiri pada Batas On-Time, subkotak 2 berfokus mandiri pada Batas Cut-Off, subkotak 3 berfokus mandiri pada Status Waktu tanpa jam server, dan subkotak 4 berfokus mandiri pada Status Awal Hari (Initial Daily Status) tanpa subteks redundan. Seluruh subteks teknis redundan (Hari Kerja Aktif, Agregasi Tingkat Risiko, Jam Server) telah dieliminasi dari DOM.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (105 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 11 (IMP-027) resmi ditutup.

---

### [IMP-028] Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)
- **Finding ID:** IMP-028
- **Title:** Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)
- **Category:** Microcopy & UX Content
- **Page / Module:** Halaman Morning Commitment (`/daily/morning`)
- **Related Test Case:** `TC-DLYM-001`, `TC-DLYM-005`
- **Current Condition:** Banner amber pada kondisi keterlambatan menampilkan teks teknis: `"Jendela Grace Period / Late Aktif (09:00 – 23:59 WIB): Batas waktu On-Time telah terlewati, namun Anda masih berada sebelum batas cut-off penguncian. Komitmen yang dikirim sekarang langsung sah dengan status LATE."` Frasa "Jendela Grace Period / Late Aktif" dinilai membingungkan karyawan biasa.
- **Proposed Improvement:** Sederhanakan microcopy menjadi kalimat lugas, manusiawi, dan jelas, contohnya: `"Pengisian Melewati Batas Waktu: Batas waktu On-Time (09:00 WIB) telah berakhir, namun Anda masih dapat mengirimkan komitmen sebelum sistem terkunci pada pukul 23:59 WIB. Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE)."`
- **Rationale / Expected Benefit:** Menghilangkan kebingungan terminologi teknis asing (*Grace Period*) dan mengomunikasikan status keterlambatan secara transparan dan profesional.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793335279186_dd87879d.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 12 (IMP-028) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 86c6f65, 29a81c2 (Change Register: CHG-025)
- **Implementation Note:** Menyederhanakan microcopy banner keterlambatan pengisian Morning Commitment (`MorningCommitmentView.vue`) dengan mengeliminasi penuh jargon asing 'Grace Period' dan menyelaraskan judul menjadi 'Pengisian Melewati Batas Waktu:' tanpa rentang jam redundan, serta isi penjelasan yang komunikatif dan transparan ('Batas waktu On-Time (09:00 WIB) telah berakhir, namun Anda masih dapat mengirimkan komitmen sebelum sistem terkunci pada pukul 23:59 WIB. Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE).'). Menyelaraskan teks badge pada Subkotak 3 menjadi 'Terlambat (LATE)' menggantikan 'LATE (Jendela Toleransi)'. Melengkapi unit test komprehensif pada `MorningCommitmentView.spec.ts`.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (106 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 12 (IMP-028) resmi ditutup.

---

### [IMP-029] Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol
- **Finding ID:** IMP-029
- **Title:** Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol
- **Category:** Copywriting & Polish
- **Page / Module:** Formulir Morning Commitment (`/daily/morning`)
- **Related Test Case:** `TC-DLYM-002`
- **Current Condition:** Label checkbox komitmen nol memuat kode arsitektur internal spesifikasi teknis: `"Hari ini tidak ada komitmen harian khusus (0 Komitmen / Zero Commitment — DEC-004)"`.
- **Proposed Improvement:** Hapus kode teknis `— DEC-004` dari antarmuka pengguna akhir (*end-user*). Ubah label menjadi bahasa bisnis yang bersih dan natural, contoh: `"Hari ini tidak ada komitmen harian terencana (0 Komitmen)"` atau `"Saya tidak memiliki komitmen harian terencana untuk hari ini"`.
- **Rationale / Expected Benefit:** Menjaga kebersihan antarmuka dari kebocoran referensi kode/dokumen internal developer yang tidak relevan bagi pengguna akhir.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793335392439_f299efbc.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 13 (IMP-029) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit b584a1e (Change Register: CHG-026)
- **Implementation Note:** Mengeliminasi kode arsitektur internal developer '— DEC-004' dan duplikasi istilah asing 'Zero Commitment' dari label checkbox komitmen nol di `MorningCommitmentView.vue`. Menyelaraskan teks label secara presisi dengan Prototipe 02 L1962: 'Hari ini tidak ada komitmen harian khusus (0 Komitmen)'. Melengkapi unit test pada `MorningCommitmentView.spec.ts`.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (107 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 13 (IMP-029) resmi ditutup.

---

### [IMP-030] Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis
- **Finding ID:** IMP-030
- **Title:** Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis
- **Category:** Microcopy & UX Communication
- **Page / Module:** Formulir Morning Commitment (`/daily/morning`)
- **Related Test Case:** `TC-DLYM-002`
- **Current Condition:** Subteks penjelasan setelah checkbox komitmen nol dicentang berbunyi teknis: `"Status hari ini akan tercatat sebagai NOT_APPLICABLE — NO_COMMITMENT (bukan No Submission)."`, mengekspos nama enum basis data internal sistem.
- **Proposed Improvement:** Ubah narasi menjadi bahasa bisnis yang menenangkan dan mudah dipahami, contoh: `"Hari Anda akan dicatat resmi sebagai 'Bebas Komitmen (Disetujui)', sehingga Anda tetap aman dan terbebas dari catatan Pelanggaran Pengisian (No Submission)."`
- **Rationale / Expected Benefit:** Memberikan kepastian psikologis dan pemahaman yang jelas bagi karyawan tanpa harus membaca istilah kode pemrograman basis data.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793335392439_f299efbc.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 14 (IMP-030) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 3b379e1; 432d3c7 (Change Register: CHG-027)
- **Implementation Note:** Mentransformasi microcopy penjelasan komitmen nol dari enum database teknis 'NOT_APPLICABLE — NO_COMMITMENT' menjadi kalimat bisnis profesional yang menenangkan: 'Hari Anda akan dicatat resmi sebagai Bebas Komitmen (Disetujui), sehingga Anda tetap aman dan terbebas dari catatan Pelanggaran Pengisian (No Submission).', menyempurnakan ukuran font menjadi 12px dan warna sekunder terkurasi sesuai Prototipe 02 kanonikal, serta melengkapi automated unit test pada MorningCommitmentView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (108 frontend, 112 backend) lulus 100%, verifikasi visual dan penyempurnaan tipografi pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 14 (IMP-030) resmi ditutup.

### [IMP-031] Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work
- **Finding ID:** IMP-031
- **Title:** Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work
- **Category:** Copywriting & Polish
- **Page / Module:** Halaman Additional Work (`/daily/additional-work`)
- **Related Test Case:** `TC-DLYA-001`, `TC-DLYA-002`
- **Current Condition:** Subtitle halaman berbunyi: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari tanpa mengubah baseline komitmen pagi (Prototipe 03)."` Terdapat kebocoran istilah dokumen desain internal developer "(Prototipe 03)".
- **Proposed Improvement:** Hapus frasa `(Prototipe 03)` dan sempurnakan copywriting menjadi kalimat bisnis profesional, contoh: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi."`
- **Rationale / Expected Benefit:** Menghilangkan kebingungan pengguna akhir dan menjaga kebersihan tampilan sistem enterprise dari atribut artefak pengembang.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793339328832_32e00c67.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 15 (IMP-031) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit de72a39 (Change Register: CHG-028)
- **Implementation Note:** Mengeliminasi kebocoran kode/istilah artefak desain internal developer '(Prototipe 03)' dari subtitle halaman Additional Work (AdditionalWorkView.vue), menyelaraskan narasi menjadi kalimat bisnis profesional enterprise yang transparan: 'Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi.', serta melengkapi automated unit test pada AdditionalWorkView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (109 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 15 (IMP-031) resmi ditutup.

---

### [IMP-032] Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work
- **Finding ID:** IMP-032
- **Title:** Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work
- **Category:** Layout & Responsive Styling
- **Page / Module:** Formulir Additional Work (`/daily/additional-work`)
- **Related Test Case:** `TC-DLYA-002`
- **Current Condition:** Kolom select "Ditugaskan Oleh (Atasan Langsung/Lead) *" melebar melampaui batas tepi kanan panel kontainer induknya (*horizontal overflow*) karena teks nama lengkap, jabatan, dan email atasan cukup panjang, sementara grid kolom tidak memiliki pembatas lebar tegas (`min-width: 0`).
- **Proposed Improvement:** Tambahkan aturan CSS `min-width: 0;` pada elemen `.form-group` dan batasi lebar elemen `.input-control` select dengan `width: 100%; max-width: 100%; text-overflow: ellipsis;` serta filter daftar pilihan agar hanya memuat atasan/pejabat yang relevan (bukan diri sendiri atau karyawan baru).
- **Rationale / Expected Benefit:** Menjaga keutuhan visual layout form agar rapi, tidak merusak batas kartu (*box containment*), dan nyaman dilihat di berbagai resolusi layar.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793339328832_32e00c67.png`, `media_1793339337197_a3ca7431.jpg`, dan `media_1793339635779_f0f5e534.png`)
- **Catatan Tambahan Perilaku:** Saat validasi browser terpicu pada dropdown ini, browser secara otomatis melakukan fokus ke elemen yang meluap ke kanan tersebut sehingga seluruh viewport mengalami pergeseran horizontal (*horizontal scroll jump*), menyebabkan sisi kiri form terpotong.
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 16 (IMP-032) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 2d9477d (Change Register: CHG-029)
- **Implementation Note:** Menambahkan penegakan box containment dan truncation CSS pada formulir Additional Work (AdditionalWorkView.vue) dengan min-width: 0, width: 100%, max-width: 100% pada .form-row dan .form-group untuk mencegah kebocoran grid horizontal, membatasi elemen input/select dengan text-overflow: ellipsis, menerapkan transisi dinamis single-column saat alasan bukan NEWLY_ASSIGNED, menambahkan media query responsif mobile/tablet (max-width: 768px), serta melengkapi automated unit test pada AdditionalWorkView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (110 frontend, 112 backend) lulus 100%, verifikasi visual dan responsivitas pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 16 (IMP-032) resmi ditutup.

### [IMP-033] Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome
- **Finding ID:** IMP-033
- **Title:** Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome
- **Category:** Layout & Visual Cleanliness
- **Page / Module:** Halaman EOD Outcome (`/daily/eod`)
- **Related Test Case:** `TC-DLYE-001`, `TC-DLYA-001`
- **Current Condition:** Kartu "Konteks Waktu EOD" memuat badge biru di kanan atas ("On-Time 17:00 · Cut-Off 21:00 WIB") serta 4 subkotak: Tanggal Kerja, Batas On-Time EOD, Status Waktu, dan Total Item Evaluasi. Formatnya serupa dengan halaman Morning Commitment yang dinilai terlalu padat.
- **Proposed Improvement:** Selaraskan dengan penyempurnaan kartu konteks pada Morning Commitment (`IMP-027`):
  1. Ganti badge biru kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026").
  2. Subkotak 1: Fokus pada "Batas On-Time EOD" (cth: `17:00 WIB`).
  3. Subkotak 2: Fokus pada "Batas Akhir / Cut-Off EOD" (cth: `21:00 WIB`).
  4. Subkotak 3: Tetap "Status Waktu" (cth: badge `ON-TIME`).
  5. Subkotak 4: "Total Item Evaluasi" (cth: `4 Tugas`).
- **Rationale / Expected Benefit:** Menciptakan konsistensi visual 100% antara formulir pagi dan sore, membuat informasi waktu kerja mudah dicerna, dan menghilangkan redundansi teks.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793340699307_aae27820.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 17 (IMP-033) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit c7d316f (Change Register: CHG-030)
- **Implementation Note:** Menyelaraskan dan merestrukturisasi kartu metrik Konteks Waktu EOD di EodOutcomeView.vue secara 100% konsisten dengan IMP-027, memindahkan penanggalan ke badge dinamis bahasa Indonesia (formattedWorkDate) di panel head, memfokuskan 4 kartu metrik pada Batas On-Time (17:00 WIB), Batas Cut-Off (21:00 WIB), Status Waktu, dan Total Item Evaluasi, mengeliminasi teks redundan Tanggal Kerja dan string ISO mentah, serta melengkapi automated unit test pada EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (111 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 17 (IMP-033) resmi ditutup.

---

### [IMP-034] Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome
- **Finding ID:** IMP-034
- **Title:** Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome
- **Category:** Copywriting & Polish
- **Page / Module:** Halaman EOD Outcome (`/daily/eod`)
- **Related Test Case:** `TC-DLYE-001`
- **Current Condition:** Subtitle halaman berbunyi: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan kelanjutan tugas (Prototipe 04)."` Memuat teks kode artefak pengembang "(Prototipe 04)".
- **Proposed Improvement:** Hapus kode teks `(Prototipe 04)` dan poles kalimat menjadi elegan: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel."`
- **Rationale / Expected Benefit:** Menjaga kebersihan antarmuka dari istilah teknis pengembang dan menghadirkan pengalaman pengguna enterprise yang profesional.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793340550967_1819bf97.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 18 (IMP-034) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 78b32ef (Change Register: CHG-031)
- **Implementation Note:** Mengeliminasi kode artefak desain internal developer '(Prototipe 04)' dari subtitle halaman EOD Outcome (EodOutcomeView.vue), menyelaraskan copywriting menjadi kalimat akuntabel enterprise yang elegan: 'Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel.', serta melengkapi automated unit test pada EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (112 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 18 (IMP-034) resmi ditutup.

---

### [IMP-035] Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD
- **Finding ID:** IMP-035
- **Title:** Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD
- **Category:** Microcopy & UX Communication
- **Page / Module:** Halaman EOD Outcome (`/daily/eod`)
- **Related Test Case:** `TC-DLYE-002`
- **Current Condition:** Judul seksi memuat: `"Refleksi Mandiri Karyawan (DEC-003)"` dengan badge `Proteksi Hak Opsi GREEN`. Paragraf penjelasnya berbunyi teknis dan defensif: `"Bagaimana penilaian mandiri Anda terhadap pencapaian keseluruhan hari ini? Sesuai DEC-003, sistem tidak pernah mengunci opsi GREEN secara punitif."`
- **Proposed Improvement:** 
  1. Ubah judul seksi menjadi bahasa bisnis yang bermartabat: `"Refleksi Mandiri Akhir Hari"` dengan badge keterangan `Penilaian Otonom Karyawan`.
  2. Sederhanakan paragraf penjelasan menjadi narasi suportif yang hangat: `"Bagaimana penilaian mandiri Anda terhadap pencapaian kerja secara keseluruhan hari ini? Anda memiliki hak penuh untuk menentukan status refleksi hari ini secara jujur dan transparan demi pembelajaran bersama tim."`
- **Rationale / Expected Benefit:** Menghilangkan kebocoran kode teknis `DEC-003` dan istilah hukum/defensif ("secara punitif"), serta menumbuhkan budaya akuntabilitas psikologis yang aman (*psychological safety*).
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793340577050_134e4c8b.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 19 (IMP-035) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 721d413 (Change Register: CHG-032)
- **Implementation Note:** Mengeliminasi kode arsitektur internal developer 'DEC-003' dan istilah legalistik defensif 'secara punitif' dari seksi Refleksi Mandiri EOD Outcome (EodOutcomeView.vue), mengubah kicker menjadi 'Refleksi Mandiri Akhir Hari', badge menjadi 'Penilaian Otonom Karyawan', serta menyempurnakan narasi deskripsi menjadi kalimat humanis bernada keamanan psikologis (psychological safety): 'Bagaimana penilaian mandiri Anda terhadap pencapaian kerja secara keseluruhan hari ini? Anda memiliki hak penuh untuk menentukan status refleksi hari ini secara jujur dan transparan demi pembelajaran bersama tim.', serta melengkapi automated unit test pada EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (113 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 19 (IMP-035) resmi ditutup.

### [IMP-036] Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD
- **Finding ID:** IMP-036
- **Title:** Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD
- **Category:** Copywriting & Polish
- **Page / Module:** Formulir EOD Outcome (`/daily/eod`)
- **Related Test Case:** `TC-DLYE-001`, `TC-DLYE-002`
- **Current Condition:** Label pada tombol pilihan capaian dan keputusan kelanjutan memuat nama enum kode basis data internal sistem yang dipisahkan garis bawah (*underscore*), seperti: `"Belum Selesai (NOT_COMPLETED)"`, `"Lanjutkan Besok (CONTINUE → Carry-Over)"`, dan `"Jangan Lanjutkan (DO_NOT_CONTINUE)"`.
- **Proposed Improvement:** Hapus seluruh nama enum berkode huruf besar dan bergaris bawah dari antarmuka pengguna akhir. Gunakan bahasa Indonesia bisnis yang natural dengan pemisah spasi:
  - `"Belum Selesai"` (tanpa `NOT_COMPLETED`).
  - `"Lanjutkan Besok (Tugas Berlanjut)"` atau `"Lanjutkan Besok"`.
  - `"Tidak Dilanjutkan"` atau `"Selesai Tanpa Lanjutan"` (tanpa `DO_NOT_CONTINUE`).
- **Rationale / Expected Benefit:** Menghadirkan antarmuka ramah pengguna (*user-friendly*) tanpa kebocoran istilah kode pemrograman (*leak of developer jargon*).
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793342065674_58df17a2.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 20 (IMP-036) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit ff6a964 (Change Register: CHG-033)
- **Implementation Note:** Mengeliminasi seluruh kebocoran kode enum teknis huruf besar dan bergaris bawah dari opsi pencapaian dan keputusan kelanjutan tugas EOD (EodOutcomeView.vue), mengganti label menjadi bahasa Indonesia bisnis yang natural ('Selesai', 'Sebagian', 'Belum Selesai', 'Dibatalkan', 'Lanjutkan Besok (Tugas Berlanjut)', dan 'Tidak Dilanjutkan'), membersihkan imbuhan deskripsi bahasa Inggris pada label form, serta memverifikasi ketidakhadiran kode enum teknis via automated unit test di EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (114 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 20 (IMP-036) resmi ditutup.

---

### [IMP-037] Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)
- **Finding ID:** IMP-037
- **Title:** Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)
- **Category:** Layout & Visual Polish
- **Page / Module:** Formulir EOD Outcome (`/daily/eod`)
- **Related Test Case:** `TC-DLYE-001`
- **Current Condition:** Kotak input "Catatan Kelanjutan (Continuation Reason) *" saat opsi lanjutkan besok dipilih memiliki layout rusak: teks judul dan textarea berada dalam satu baris horizontal sejajar di bagian bawah (*baseline alignment*), dan textarea berukuran mengotak kecil (mengikuti default browser cols) sehingga teks placeholder terpotong dan ruang kosong lebar di sebelah kanannya terbuang sia-sia.
- **Proposed Improvement:** Selaraskan styling `.mt-2` atau `.form-group` agar menggunakan layout vertikal (`display: flex; flex-direction: column; gap: 6px;`) dan terapkan `width: 100%;` pada textarea `.input-control` agar membentang memenuhi lebar kartu dengan placeholder yang terbaca penuh.
- **Rationale / Expected Benefit:** Menghilangkan kejanggalan tata letak visual (*visual alignment defect*), memberikan ruang ketik yang lega dan proporsional bagi karyawan, dan membuat placeholder terbaca sempurna.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793342065674_58df17a2.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 21 (IMP-037) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 18ef669 (Change Register: CHG-034)
- **Implementation Note:** Memperbaiki tata letak kolom textarea Catatan Kelanjutan Tugas EOD (EodOutcomeView.vue) dengan memperkenalkan kontainer semantik vertikal .continuation-reason-group berformat flex column (gap 6px), menetapkan width: 100%, box-sizing: border-box, dan font-family inherit pada .input-control (khususnya textarea.input-control), menetapkan display: block pada .form-label, serta melengkapi automated unit test pada EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (115 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 21 (IMP-037) resmi ditutup.

---

### [IMP-038] Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)
- **Finding ID:** IMP-038
- **Title:** Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)
- **Category:** Functional Consistency & Business Logic
- **Page / Module:** Seksi Evaluasi Pekerjaan Tambahan (`/daily/eod`)
- **Related Test Case:** `TC-DLYE-001`, `TC-DLYA-001`
- **Current Condition:** Seksi "Evaluasi Pekerjaan Tambahan" di halaman EOD saat ini hanya menyediakan 3 opsi capaian (Selesai, Sebagian, Belum Selesai) tanpa opsi "Dibatalkan", dan jika pengguna memilih Sebagian atau Belum Selesai, tidak muncul form keputusan kelanjutan tugas maupun catatan alasan seperti halnya pada evaluasi komitmen pagi.
- **Proposed Improvement:** Selaraskan kapabilitas evaluasi pekerjaan tambahan dengan evaluasi komitmen pagi:
  1. Tambahkan opsi `Dibatalkan` lengkap dengan kolom input alasan pembatalan.
  2. Jika dipilih `Sebagian` atau `Belum Selesai`, tampilkan sub-pilihan keputusan kelanjutan tugas (`Lanjutkan Besok` vs `Tidak Dilanjutkan`) beserta kolom catatan kelanjutan.
- **Rationale / Expected Benefit:** Menjaga kesetaraan perlakuan akuntabilitas antara tugas komitmen pagi dan tugas tambahan ad-hoc, serta mencegah adanya tugas menggantung tanpa status kelanjutan yang jelas.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793342477791_64b18d0a.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 22 (IMP-038) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 5e4cd3a (Change Register: CHG-035)
- **Implementation Note:** Menyelaraskan kelengkapan kapabilitas evaluasi pekerjaan tambahan pada EodOutcomeView.vue dengan komitmen pagi: menambahkan opsi radio Dibatalkan (CANCELLED) beserta kondisional textarea alasan pembatalan tugas (Alasan Pembatalan Pekerjaan Tambahan *), serta menyediakan alur keputusan kelanjutan tugas (Lanjutkan Besok vs Tidak Dilanjutkan) beserta textarea Catatan Kelanjutan * saat tugas berstatus Sebagian atau Belum Selesai, dan memverifikasi kelengkapan fungsional via automated unit test di EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (116 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 22 (IMP-038) resmi ditutup.

---

### [IMP-039] Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis
- **Finding ID:** IMP-039
- **Title:** Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis
- **Category:** Microcopy & UX Communication
- **Page / Module:** Seksi Evaluasi Pekerjaan Tambahan (`/daily/eod` & `/daily/additional-work`)
- **Related Test Case:** `TC-DLYA-001`
- **Current Condition:** Badge status pada kartu pekerjaan tambahan menampilkan langsung nama enum raw basis data: `NEWLY_ASSIGNED`, `OPERATIONAL_INCIDENT`, dsb. yang menggunakan huruf kapital dan garis bawah (*underscore*).
- **Proposed Improvement:** Terapkan pemetaan label ramah pengguna (*human-friendly formatter*), contoh:
  - `NEWLY_ASSIGNED` → `Penugasan Baru Atasan`
  - `OPERATIONAL_INCIDENT` → `Insiden Operasional`
  - `MISSED_IN_PLANNING` → `Kebutuhan Dadakan`
  - `PRIORITY_CHANGE` → `Perubahan Prioritas`
- **Rationale / Expected Benefit:** Menghadirkan tampilan yang bersih, mudah dipahami oleh seluruh staf dan pimpinan non-teknis, serta konsisten dengan prinsip desain enterprise WorkPulse.
- **Priority:** Low
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793342477791_64b18d0a.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 23 (IMP-039) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit c8a1af2 (Change Register: CHG-036)
- **Implementation Note:** Mentransformasi format badge alasan pekerjaan tambahan pada AdditionalWorkView.vue dan EodOutcomeView.vue dari enum raw database menjadi bahasa bisnis baku ('Penugasan Baru Atasan', 'Perbaikan Error / Bug Kritis', 'Terlewat Catat Pagi', 'Pengalihan Prioritas', dan 'Lainnya'), membersihkan kode enum dari dropdown pilihan form, memberlakukan input dinamis wajib Keterangan Alasan Lainnya * saat memilih alasan 'Lainnya' (OTHER), dan memverifikasi kelengkapan validasi serta tampilan via automated unit tests di AdditionalWorkView.spec.ts dan EodOutcomeView.spec.ts.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (117 frontend, 112 backend) lulus 100%, verifikasi visual pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 23 (IMP-039) resmi ditutup.

### [IMP-040] Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /raise-blockers (Eliminasi Modal Pop-Up Redundan)
- **Finding ID:** IMP-040
- **Title:** Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /raise-blockers (Eliminasi Modal Pop-Up Redundan)
- **Category:** Navigation & Consistency
- **Page / Module:** Halaman Evaluasi Sore (`/daily/eod`) & Seluruh Tab My Today
- **Related Test Case:** `TC-BLKR-001`, `TC-DLYE-001`
- **Current Condition:** Tombol "+ Laporkan Blocker Mendesak" di halaman EOD memunculkan modal dialog pop-up terpisah (`media_1793343838939_99a0aba8.png`), padahal sistem telah memiliki halaman formulir pelaporan mandiri resmi di `/raise-blockers`.
- **Proposed Improvement:** Hapus implementasi modal pop-up pada tombol tersebut. Selaraskan seluruh tombol "Lapor Blocker" pada 3 sub-halaman My Today agar secara konsisten langsung mengarahkan (*direct navigate*) ke halaman kanonikal `/raise-blockers` dengan posisi tata letak yang presisi di sisi kanan tab navigasi.
- **Rationale / Expected Benefit:** Menghilangkan duplikasi antarmuka input blocker, mencegah fragmentasi alur pengguna, dan memastikan karyawan mengisi formulir kendala yang lengkap dan terstandarisasi.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793343838939_99a0aba8.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Standalone 24 (IMP-040) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 85873df (Change Register: CHG-037)
- **Implementation Note:** Menyelaraskan seluruh tautan tombol "Laporkan Blocker" pada alur navigasi workflow bar di 3 sub-halaman My Today (EodOutcomeView, MorningCommitmentView, AdditionalWorkView) agar secara konsisten dan kanonikal mengarahkan langsung ke '/raise-blockers'. Mengeliminasi 100% template markup modal popup instant blocker, modal state, method submitInstantBlocker(), pemanggilan API redundan GET /v1/organization/users saat inisialisasi EOD, icon X dari lucide-vue-next, serta aturan CSS modal tak terpakai pada EodOutcomeView.vue.
- **Closure & Verification Note:** Implementasi telah selesai, seluruh pengujian unit (118 frontend, 112 backend) lulus 100%, verifikasi visual dan interaksi pada Vercel Preview telah diverifikasi dan disetujui Acceptance Owner (Harry), seluruh kriteria penerimaan terpenuhi, dan Standalone 24 (IMP-040) resmi ditutup.

---

### [IMP-041] Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)
- **Finding ID:** IMP-041
- **Title:** Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)
- **Category:** Layout & Information Architecture
- **Page / Module:** Halaman Laporkan & Pantau Blocker (`/blockers/raise`)
- **Related Test Case:** `TC-BLKR-001`, `TC-BLKR-005`
- **Current Condition:** Halaman `/blockers/raise` saat ini hanya menampilkan form input tunggal statis dengan kicker "MANAJEMEN KENDALA & ESKALASI OTOMATIS", tanpa tombol tautan kembali ke My Today, serta tidak menyediakan tab "Blocker Saya" untuk memantau status blocker yang pernah dilaporkan karyawan.
- **Proposed Improvement:** Selaraskan 100% struktur konten halaman dengan acuan resmi Prototipe 05 (`05-Raise-Instant-Blocker.html`):
  1. Tambahkan tautan navigasi di atas judul: `← Kembali ke Ruang Kerja My Today`.
  2. Judul halaman: `Laporkan & Pantau Blocker`, Subtitle: `Laporkan hambatan atau dependensi kerja beserta dampak dan tingkat keparahannya agar penanggung jawab berwenang dapat segera menindaklanjuti.` (Hapus kicker manajemen kendala di atasnya).
  3. Sediakan 2 Tab Navigasi Halaman:
     - **Tab 1: Buat Laporan Blocker** (memuat seksi *Detail Kendala, Taksonomi & Dampak* dan *Penanggung Jawab Awal & Jalur Kewenangan*).
     - **Tab 2: Blocker Saya** (memuat judul "Daftar Blocker yang Saya Laporkan", filter status, kartu-kartu blocker aktif dengan SLA aging, tombol konfirmasi tutup kendala / reopen).
  4. Abaikan komponen khusus simulasi prototipe (`[Mode Simulasi Prototipe]`).
- **Rationale / Expected Benefit:** Memberdayakan karyawan untuk tidak hanya melaporkan kendala, tetapi juga memantau eskalasi SLA blocker pribadinya secara transparan dalam satu pusat kendali yang terpadu.
- **Priority:** High
- **Evidence / Screenshot Reference:** Dokumen Desain Prototipe 05 (`05-Raise-Instant-Blocker.html`) dan Temuan UAT Sesi 30 Okt 2026 (`media_1793343601793_ab991d08.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 4 (SOL-BLKR-FORM) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit ab649cb, cc899cc (Change Register: CHG-013)
- **Implementation Note:** Menyelaraskan seluruh struktur dan tata letak halaman pelaporan blocker karyawan dengan Prototipe 05 (`05-Raise-Instant-Blocker.html`): menambahkan tombol kembali `← Kembali ke Ruang Kerja My Today` (ke `/daily/morning`), menyelaraskan judul `Laporkan & Pantau Blocker` dengan subtitle panduan ramah bisnis, mengeliminasi kicker teknis `MANAJEMEN KENDALA & ESKALASI OTOMATIS`, serta menyediakan 2 tab navigasi: (1) Buat Laporan Blocker dan (2) Blocker Saya (daftar kendala yang dilaporkan dari GET /blockers?mine=raised, badge hitungan aktif, filter status, SLA aging, dan detail kartu kendala). Mengeliminasi toolbar dummy simulasi prototipe (`[Mode Simulasi Prototipe]`).
- **Closure & Verification Note:** Implementasi telah selesai, remediasi visual review pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 4 (SOL-BLKR-FORM) telah resmi ditutup.

---

### [IMP-042] Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan
- **Finding ID:** IMP-042
- **Title:** Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan
- **Category:** RBAC & Access Control
- **Page / Module:** Halaman Laporkan & Pantau Blocker (`/blockers/raise`)
- **Related Test Case:** `TC-BLKR-001`, `TC-AUTH-005`
- **Current Condition:** Di kanan atas halaman `/blockers/raise` terdapat tombol hijau outlined: `Lihat Antrean Blocker Aktif` yang jika diklik mengarahkan pengguna ke halaman antrean manajerial (`/blockers`).
- **Proposed Improvement:** Hapus tombol tersebut dari tampilan pengguna biasa (`EMPLOYEE`). Halaman antrean eskalasi blocker (`/blockers`) adalah wewenang pimpinan/manajemen yang telah diatur di navigasi *Management*. Karyawan biasa cukup memantau status tiketnya sendiri lewat Tab "Blocker Saya".
- **Rationale / Expected Benefit:** Menegakkan kepatuhan hak akses berbasis peran (RBAC) dan mencegah kebingungan navigasi karyawan operasional.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793343601793_ab991d08.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 4 (SOL-BLKR-FORM) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit ab649cb, cc899cc (Change Register: CHG-013)
- **Implementation Note:** Mengeliminasi tombol link `Lihat Antrean Blocker Aktif` (link ke antrean eskalasi manajemen `/blockers`) dari header formulir pelaporan blocker karyawan (`RaiseBlockerView.vue`). Hak akses antrean manajerial ditegakkan murni melalui navigasi *Management*, sedangkan karyawan biasa memantau kendala pribadinya secara terisolasi melalui Tab 2 "Blocker Saya".
- **Closure & Verification Note:** Implementasi telah selesai, ketiadaan tombol link manajerial telah diverifikasi pada Vercel Preview dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi, dan Group 4 (SOL-BLKR-FORM) telah resmi ditutup.

---

### [IMP-043] Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi
- **Finding ID:** IMP-043
- **Title:** Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi
- **Category:** Navigation & Visual Consistency
- **Page / Module:** Header Topbar Halaman Blocker (`/blockers/raise`)
- **Related Test Case:** `TC-BLKR-001`
- **Current Condition:** Breadcrumb kiri atas masih bertuliskan `Blocker / Laporkan Kendala Cepat (Prototipe 05)`. Sisi kanan atas memuat tombol teks `Antrean Tiket` dan `My Today` yang menempel di ujung layar peramban.
- **Proposed Improvement:** 
  1. Ubah breadcrumb menjadi: `Workspace / Laporkan & Pantau Blocker`.
  2. Ganti tombol teks kanan atas dengan avatar profil inisial bulat (`AN`) dan ikon lonceng notifikasi terpadu.
  3. Selaraskan margin dan padding sisi kanan agar mengikuti batas kontainer grid kartu konten (tidak menempel ke tepi layar monitor).
- **Rationale / Expected Benefit:** Menegakkan keseragaman sistem navigasi global WorkPulse dan memberikan tampilan yang proporsional.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793343601793_ab991d08.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 2 (SOL-SHLL-TOPB) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit 12cd263, c2af091 (Change Register: CHG-011)
- **Implementation Note:** Tercakup penuh oleh Solusi Global IMP-019. Breadcrumb halaman blocker telah diselaraskan mengikuti hierarki sidebar yang sebenarnya: 'Workspace / Blocker' untuk Laporkan & Pantau Blocker (dengan migrasi rute kanonikal ke '/raise-blockers' dan redirect backward compatibility dari '/blockers/raise'), serta 'Management / Antrean Eskalasi Blocker' untuk rute '/blockers'. Tombol teks mengambang kanan atas digantikan dengan avatar inisial bulat dan ikon lonceng notifikasi, serta padding/margin diselaraskan mengikuti batas kontainer grid konten.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi Visual Review navigasi & breadcrumb blocker telah selesai, hasil Vercel Preview telah diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 2 telah resmi ditutup.

---

### [IMP-044] Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim
- **Finding ID:** IMP-044
- **Title:** Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim
- **Category:** Copywriting & Visual Cleanliness
- **Page / Module:** Bagian Bawah Formulir Blocker (`/blockers/raise`)
- **Related Test Case:** `TC-BLKR-001`
- **Current Condition:** Bar aksi bawah memuat kalimat instruksi defensif: `"Pastikan fakta kendala akurat. Tiket yang diterbitkan tidak dapat dihapus (Audit Trail DEC-008)."` dengan tombol Batal dan Kirim Tiket Kendala.
- **Proposed Improvement:** Hapus teks referensi kode internal `(Audit Trail DEC-008)`. Selaraskan tombol aksi dengan Prototipe 05, yaitu tombol sekunder *"Bersihkan Formulir"* (reset) dan tombol primer *"Kirim Laporan Blocker"*.
- **Rationale / Expected Benefit:** Antarmuka form menjadi bersih (*clean*), ramah pengguna, dan fungsional.
- **Priority:** Low
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793343639591_9cbf93a7.png`)
- **Status:** Implemented (Pending UAT)
- **Remediation Group:** Cycle 2 — Group 4 (SOL-BLKR-FORM) [Status: CLOSED / IMPLEMENTED]
- **Implementation Reference:** Commit ab649cb, cc899cc (Change Register: CHG-013)
- **Implementation Note:** Membersihkan dan menyelaraskan bar aksi bawah formulir pelaporan blocker: mengeliminasi teks kode internal `(Audit Trail DEC-008)`, memperbarui teks petunjuk menjadi ramah bisnis (*"Pastikan fakta kendala akurat dan objektif untuk mempercepat penanganan oleh atasan."*), mengganti tombol Batal menjadi tombol sekunder *"Bersihkan Formulir"* (mereset seluruh isian form, error, dan notifikasi), serta mengubah label submit menjadi *"Kirim Laporan Blocker"*. Bar aksi diformat secara `fixed` menempel di dasar layar (`bottom: 0`) dan membentang penuh 100% selebar main body dari sisi kanan sidebar (`left: 232px`) hingga tepi kanan layar (`right: 0`) selaras dengan Prototipe 05.
- **Closure & Verification Note:** Implementasi telah selesai, remediasi visual fixed full-width footer pada Vercel Preview telah diverifikasi dan diterima Product Owner, seluruh Acceptance Criteria terkait telah terpenuhi berdasarkan hasil verifikasi, dan Group 4 (SOL-BLKR-FORM) telah resmi ditutup.

---

### [IMP-045] Restrukturisasi Tampilan Formulir EOD Outcome Terkunci Menjadi Panel Ringkasan Evaluasi Ringkas (Read-Only Summary View)
- **Finding ID:** IMP-045
- **Title:** Restrukturisasi Tampilan Formulir EOD Outcome Terkunci Menjadi Panel Ringkasan Evaluasi Ringkas (Read-Only Summary View)
- **Category:** Layout & Visual Polish / UX Polish
- **Page / Module:** Halaman Evaluasi Sore (`/daily/eod`) dalam Status Terkunci (`hasSubmittedEod = true` / `isFormLocked = true`)
- **Related Test Case:** `TC-DLYE-001`
- **Current Condition:** Saat form evaluasi EOD terkunci pasca diserahkan, antarmuka tetap menampilkan tata letak formulir masukan interaktif lengkap dalam keadaan dinonaktifkan (`disabled`): 4 tombol opsi radio (`Selesai`, `Sebagian`, `Belum Selesai`, `Dibatalkan`) per tugas tetap tampil penuh, 3 kartu pemilih status harian (`GREEN`, `AMBER`, `RED`) tetap tampil sebagai pemilih radio, dan kolom refleksi/prioritas esok hari tetap tampil dalam kotak textarea besar abu-abu. Tampilan terasa berat dan berkesan seperti formulir yang masih meminta input alih-alih laporan ringkasan evaluasi resmi.
- **Proposed Improvement:** Terapkan mode transformasi tampilan ringkasan resmi (*Read-Only Summary View*) serupa dengan implementasi pada formulir Komitmen Pagi (`MorningCommitmentView.vue`):
  1. Gantikan 4 tombol radio dengan satu badge status capaian ringkas (misal badge hijau `Selesai` atau badge kuning `Sebagian`) tepat di samping judul komitmen/pekerjaan tambahan.
  2. Gantikan 3 kartu pemilih status harian dengan satu kartu ringkasan status akhir terpilih (misal kartu hijau `Status Akhir Hari: GREEN — Target hari ini tercapai memuaskan atau terkendali mandiri`).
  3. Tampilkan catatan refleksi dan prioritas esok hari dalam kontainer kartu baca (*read-only callout card*) bersih tanpa border textarea masukan.
- **Rationale / Expected Benefit:** Memberikan rasa kepastian penutupan hari yang tuntas dan tenang (*closure*), menyelaraskan bahasa visual antar modul harian (Morning Commitment & EOD Outcome), serta menghilangkan kebingungan pengguna seolah form masih perlu diisi.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794188430654_30d5df4f.jpg`, `media_1794188457652_3df81dab.png`.
- **Status:** Open / Proposed (Backlog Pasca-UAT)

---

### [IMP-046] Pengelompokan Hierarkis (optgroup) & Filter Otoritas pada Dropdown Penanggung Jawab Khusus Blocker
- **Finding ID:** IMP-046
- **Title:** Pengelompokan Hierarkis (optgroup) & Filter Otoritas pada Dropdown Penanggung Jawab Khusus Blocker
- **Category:** Information Architecture & UX Ergonomics
- **Page / Module:** Formulir Pelaporan Blocker (`/raise-blockers`, Bagian 2 Jalur Kewenangan)
- **Related Test Case:** `TC-BLKR-001`
- **Current Condition:** Dropdown `Penanggung Jawab Khusus (opsional)` menampilkan seluruh daftar pengguna secara datar (*flat list*), tanpa pengelompokan jabatan/divisi. Daftar mencakup akun pelapor itu sendiri (`Aditya Nugroho`), staf biasa (`Siti Rahma`, `Maya Putri`), hingga calon karyawan yang belum onboard (`Fajar Ramadhan`). Hal ini membingungkan pelapor mengenai siapa yang sebenarnya berwenang menyelesaikan blocker dan membuka celah menugaskan blocker ke diri sendiri atau rekan yang tidak relevan.
- **Proposed Improvement:** 
  1. Filter daftar pengguna agar **hanya menampilkan personil yang memegang peran/kewenangan penyelesaian** (Tech Lead, Head of Department, Project Manager, Direktur/Eksekutif).
  2. Keluarkan akun pengguna yang sedang login (pelapor) dari daftar agar terhindar dari bias menugaskan kendala ke diri sendiri.
  3. Pisahkan direktori secara tegas dan dinamis berdasarkan radio button jalur kewenangan:
     - **Saat Organizational Authority (Struktural) dipilih:** Menampilkan optgroup murni hierarki organisasi perusahaan:
       - `<optgroup label="── Atasan Langsung (Direct Supervisor) ──">` — e.g. `Bambang Pratama — Technical Lead 1 [Atasan Langsung]`
       - `<optgroup label="── Penanggung Jawab Divisi Terkait (Department Heads) ──">` — e.g. `Arif Budiman`, `Gunawan Setiawan`, `Dharma Putra`, `Lukman Hakim`, `Dewi Lestari`
       - `<optgroup label="── Direksi Eksekutif (Leadership) ──">` — `Hendra Wijaya — Chief Executive Officer`
       *(Project Manager tidak ditampilkan di jalur struktural ini kecuali merangkap sebagai atasan langsung).*
     - **Saat Project Authority (Kewenangan Proyek) dipilih:** Opsi dropdown terkunci jika belum memilih proyek. Begitu proyek dipilih (misal `PRJ-PORTAL`), dropdown khusus menampilkan otoritas proyek tersebut:
       - `<optgroup label="── Pimpinan Proyek (Project Lead / PM: [Proyek]) ──">` — e.g. `Dimas Prakoso — Project Manager 1`
       - `<optgroup label="── Pengarah Proyek (Project Sponsor / Reviewer: [Proyek]) ──">` — e.g. `Dharma Putra — Head of Delivery`
  4. Bila Atasan Langsung merangkap sebagai Pimpinan Divisi, personil tersebut diprioritaskan di grup Atasan Langsung dengan jabatan lengkapnya dan otomatis disingkirkan dari grup Kepala Divisi untuk mencegah duplikasi.
- **Rationale / Expected Benefit:** Menghilangkan kebingungan pelapor, mencegah salah sasaran penugasan tiket blocker, memperjelas rantai komando penanganan kendala, dan menjaga disiplin SLA eskalasi organisasi.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794192476939_c3ccef5b.jpg`.
- **Status:** Resolved / Implemented (Frontend & Backend Synced)

---

### [IMP-047] Penyempurnaan Tata Letak (Layout) & Penambahan Live Character Counter pada Modal Dialog Resolusi Blocker
- **Finding ID:** IMP-047
- **Title:** Penyempurnaan Tata Letak (Layout) & Penambahan Live Character Counter pada Modal Dialog Resolusi Blocker
- **Category:** UI Polish & Form Usability
- **Page / Module:** Antrean Eskalasi Blocker (`/blockers`, Modal Resolve & Modal Support)
- **Related Test Case:** `TC-BLKR-003`
- **Current Condition:** Pada modal dialog "Selesaikan Kendala (Resolve Blocker)", elemen label berada di sebelah kiri dan textarea berukuran kerdil terhimpit di sebelah kanan secara horizontal akibat absennya styling `.form-group`. Tidak ada penghitung karakter minimum (min. 10 karakter) sehingga pengguna tidak tahu berapa karakter yang telah diketik sebelum menekan tombol submit. Tombol close modal juga menggunakan karakter simbol `✕` yang rentan mojibake.
- **Proposed Improvement:** 
  1. Tata ulang `.form-group` dengan flex vertikal (label di atas, field di bawah full-width 100%).
  2. Berikan styling textarea proporsional dengan min-height, border halus, focus ring hijau brand, dan resize vertikal.
  3. Tambahkan indikator live character counter `{{ length }} / 10 karakter min` yang berubah warna hijau saat batas minimum 10 karakter terpenuhi.
  4. Ganti tombol close dengan ikon SVG Lucide `<X :size="18" />` yang bersih.
- **Rationale / Expected Benefit:** Menghadirkan antarmuka modal resolusi yang ergonomis, rapi, dan memberikan umpan balik langsung kepada pengambil tindakan mengenai pemenuhan batas validasi 10 karakter solusi.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794199512854_682bd861.png`.
- **Status:** Resolved / Implemented (Frontend Synced)

---

### [IMP-048] Sinkronisasi Skema Respon API Risiko Proyek & Integrasi Proyek WP-CORE pada Project Risk Radar
- **Finding ID:** IMP-048
- **Title:** Sinkronisasi Skema Respon API Risiko Proyek & Integrasi Proyek WP-CORE pada Project Risk Radar
- **Category:** Backend API & Frontend Data Contract
- **Page / Module:** Radar Risiko Proyek (`/projects/risk`) & Antrean Blocker (`/blockers`)
- **Related Test Case:** `TC-BLKR-005`, `TC-PM-001`
- **Current Condition:** 
  1. Halaman `/projects/risk` merender data kosong (hanya simbol `#`, nama lead kosong, nilai komitmen dan blocker hanya string statis `"tugas harian"` dan `"kendala"`, serta risiko hanya `"LOW (%)"`) karena nama properti dari endpoint backend `/dashboard/projects` (`projectCode`, `projectName`, `totalBlockers`) tidak sinkron dengan properti yang diharapkan antarmuka frontend (`code`, `name`, `openBlockersCount`, `healthScore`, `leadName`, `activeCommitmentsCount`).
  2. Proyek `WP-CORE` (WorkPulse Platform Core 2026) tidak terdaftar pada daftar proyek backend padahal menjadi proyek inti yang memiliki komitmen dan kendala aktif.
  3. Pada halaman `/blockers`, saat memfilter `Kepemilikan: Ditugaskan ke Saya`, panel detail sebelah kanan tidak otomatis berganti ke tiket pertama hasil filter dan tetap menampilkan tiket sebelumnya yang bukan hak milik pengguna.
- **Proposed Improvement:** 
  1. Perbarui service backend `getProjectRiskOverview()` agar mengambil daftar proyek langsung dari database `projectAuthorityMapping` (mencakup `WP-CORE`, `PRJ-CORE`, `PRJ-PORTAL`, `PRJ-MOBILE`), menghitung komitmen aktif hari ini, menghitung blocker terbuka, kalkulasi health score (0-100), dan mengembalikan properti ganda yang kompatibel penuh.
  2. Perbaiki fungsi `loadBlockers()` pada `BlockerQueueView.vue` agar saat filter kepemilikan berubah, panel detail otomatis berpindah ke tiket pertama hasil filter (`selectedTicket = updated || blockers[0] || null`).
- **Rationale / Expected Benefit:** Menyajikan radar risiko proyek yang hidup, akurat, dan mencerminkan kondisi riil lapangan tanpa kegagalan pemetaan data.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794200423951_6ccdc24b.jpg`, `media_1794200447730_964c3a77.png`.
- **Status:** Resolved / Implemented (Frontend & Backend Synced)

---

### [IMP-049] Penyelarasan Pemenuhan Database Constraint chk_blocker_note_required & Pemetaan Enum Outcome/Continuation pada Persetujuan Koreksi
- **Finding ID:** IMP-049
- **Title:** Penyelarasan Pemenuhan Database Constraint chk_blocker_note_required & Pemetaan Enum Outcome/Continuation pada Persetujuan Koreksi Komitmen Pasca Cut-Off
- **Category:** Backend Database Integrity & Validation Invariant
- **Page / Module:** Review Koreksi (`/corrections/review`) & Koreksi Komitmen Pagi (`/corrections/morning`)
- **Related Test Case:** `TC-CORR-001`, `TC-CORR-002`
- **Current Condition:** 
  1. Ketika karyawan mengajukan koreksi material komitmen pagi dengan peningkatan risiko ke `AMBER` atau `RED`, field `knownBlockerNote` tidak disertakan pada payload karena formulir tidak menyediakan input terpisah.
  2. Saat Atasan Langsung menyetujui koreksi di `/corrections/review`, backend mengeksekusi `tx.commitment.update` dengan `initialRisk: 'AMBER'`, tetapi `knownBlockerNote` bernilai `NULL`.
  3. Basis data PostgreSQL memiliki *check constraint* `chk_blocker_note_required` yang mewajibkan `known_blocker_note IS NOT NULL` jika `initial_risk IN ('AMBER', 'RED')`. Hal ini memicu pelanggaran integritas data (`500 Internal Server Error`) sehingga muncul toast error *"Terjadi kesalahan internal pada sistem."*.
  4. Pada koreksi EOD, string outcome UI (`DONE`, `IN_PROGRESS`, `BLOCKED`, `DROPPED`) dan continuation (`CONTINUE_TOMORROW`, `ARCHIVE`, `HANDOVER`) belum dipetakan ke enum Prisma `CommitmentOutcome` (`COMPLETED`, `PARTIALLY_COMPLETED`, `NOT_COMPLETED`, `CANCELLED`) dan `ContinuationStatus` (`CONTINUE`, `DO_NOT_CONTINUE`).
- **Proposed Improvement:** 
  1. Pada `CorrectionService` (`createCorrectionRequest` & `reviewCorrectionRequest`), tambahkan penjamin otomatis: jika `initialRisk` bernilai `AMBER` atau `RED`, set `knownBlockerNote: valReq.knownBlockerNote || req.reason.trim()` sehingga integritas constraint database selalu terpenuhi.
  2. Tambahkan helper `mapRequestedOutcome` dan `mapRequestedContinuation` untuk menerjemahkan nilai UI ke enum database secara aman.
  3. Pada `MorningCorrectionRequestView.vue`, sertakan `knownBlockerNote: reason.value.trim()` saat risiko dipilih `AMBER` atau `RED`.
- **Rationale / Expected Benefit:** Menjamin integritas aturan bisnis invariant database tetap terjaga sempurna tanpa memicu kegagalan transaksi HTTP 500 saat Atasan Langsung menyetujui permohonan koreksi.
- **Priority:** Critical
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794206256288_69c9798d.jpg`.
- **Status:** Resolved / Implemented (Frontend & Backend Hotfixed)

---

### [IMP-050] Inisialisasi Otomatis Antrean Kepatuhan HRGA & Fleksibilitas Penautan Catatan Pembinaan Manajerial
- **Finding ID:** IMP-050
- **Title:** Inisialisasi Otomatis Antrean Kepatuhan HRGA & Fleksibilitas Penautan Catatan Pembinaan Manajerial
- **Category:** Backend Compliance Seeding & Data Integrity
- **Page / Module:** Antrean Kepatuhan HRGA (`/compliance`)
- **Related Test Case:** `TC-CORR-004`, `TC-HRGA-001`
- **Current Condition:** 
  1. Halaman `/compliance` menampilkan radar dan antrean kosong (0 peristiwa pelanggaran) sehingga tim HRGA tidak dapat menguji alur filter jenjang pola berulang 3x (`PATTERN_FLAG_3X`) maupun tindakan penindakan (*Address*).
  2. Modal penindakan kepatuhan mewajibkan input UUID catatan pembinaan dari tabel `manager_notes`. Jika HRGA memasukkan catatan teks deskriptif, transaksi berisiko gagal akibat pelanggaran *foreign key* `compliance_events_follow_up_manager_note_id_fkey`.
  3. Teks subtitle halaman `/compliance` dan `/exemptions` masih mencantumkan kode internal `(DEC-007)`.
- **Proposed Improvement:** 
  1. Tambahkan fungsi `ensureSeedEvents()` pada `ComplianceService` agar saat tabel kosong, sistem secara otomatis menginisialisasi peristiwa pola 3 hari (`PATTERN_FLAG_3X` - Siti Rahma) dan peristiwa tidak check-in (`NO_SUBMISSION` - Nadia Kusuma) untuk pengujian operasional HRGA.
  2. Sempurnakan method `addressComplianceEvent` agar jika input bukan merupakan ID UUID catatan yang ada, sistem secara otomatis menerbitkan rekaman `ManagerNote` pembinaan kepatuhan formal sehingga penautan FK selalu valid.
  3. Bersihkan kode internal `(DEC-007)` dari microcopy antarmuka pengguna.
- **Rationale / Expected Benefit:** Memungkinkan tim HRGA melakukan simulasi pemantauan pola 3x dan penindakan peristiwa kepatuhan secara nyata dan deterministik tanpa kendala UUID manual.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794208139958_5b8fe3eb.jpg`.
- **Status:** Resolved / Implemented (Frontend & Backend Hotfixed)

---

### [IMP-051] Pemisahan Kolom Status dan Aksi pada Tabel Antrean Persetujuan Cuti (Leave Approval Queue)
- **Finding ID:** IMP-051
- **Title:** Pemisahan Kolom Status dan Aksi pada Tabel Antrean Persetujuan Cuti (Leave Approval Queue)
- **Category:** UI / Visual Layout & Enterprise Table Standards
- **Page / Module:** Persetujuan Cuti (`/leave/queue`)
- **Related Test Case:** `TC-LEAV-002`
- **Current Condition:** Kolom terakhir menggabungkan "STATUS & KEPUTUSAN" dalam satu cell horizontal sempit, menyebabkan badge status "Menunggu Review" terhimpit secara canggung di sebelah tombol Setujui dan teks badge terpotong/membungkus menjadi dua baris ("Menunggu \n Review").
- **Proposed Improvement:** 
  1. Pisahkan menjadi dua kolom terpisah berstandar enterprise: kolom "Status" dan kolom "Aksi" (sejajar dengan tabel `CorrectionReviewView` dan `MyLeaveRequestView`).
  2. Tambahkan properti `white-space: nowrap;` dan padding proporsional pada kelas `.pill` agar teks badge selalu utuh dalam satu baris.
  3. Posisikan tombol aksi `[✓ Setujui] [✕ Tolak]` secara rapi di kolom "Aksi" dengan perataan kanan (*right-aligned*).
- **Rationale / Expected Benefit:** Memberikan kejelasan visual status pengajuan cuti secara instan tanpa penumpukan elemen antarmuka yang membingungkan atasan.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794212912865_003adcb8.png`.
- **Status:** Resolved / Implemented (Frontend Hotfixed)

---

### [IMP-052] Redesain Modal Persetujuan Cuti (Leave Review Modal Layout, Microcopy & SVG Icon Alignment)
- **Finding ID:** IMP-052
- **Title:** Redesain Modal Persetujuan Cuti (Leave Review Modal Layout, Microcopy & SVG Icon Alignment)
- **Category:** UI / Visual Design & Enterprise Modal Polish
- **Page / Module:** Modal Tinjau Permohonan Cuti (`/leave/queue`)
- **Related Test Case:** `TC-LEAV-002`
- **Current Condition:** 
  1. Teks banner info menampilkan identifikasi teknis arsitektur rekayasa `Kebijakan Rekonsiliasi DEC-007:` yang membingungkan pengguna akhir.
  2. Ikon SVG `<Info>` terhimpit/gepeng (*squashed*) secara horizontal akibat ketiadaan `flex-shrink: 0;` dan dimensi eksplisit.
  3. Ringkasan pengajuan cuti (`detail-box`) menggunakan perataan `space-between` yang renggang dan tidak sejajar; teks alasan panjang membungkus tepat di sebelah label sehingga terkesan berantakan (*ragged*).
  4. Microcopy dwibahasa canggung pada tombol opsi: `Setujui (Approve)` dan `Tolak (Reject)`.
  5. Tombol konfirmasi akhir menggunakan ikon dokumen generic `<FileText>` alih-alih ikon aksi kontekstual (`<Check>` / `<X>`).
- **Proposed Improvement:** 
  1. Hapus kode internal `DEC-007` dari teks banner informasi; gunakan frasa bisnis alami `Kebijakan Rekonsiliasi Kehadiran:`.
  2. Perbaiki gaya ikon SVG info dengan `flex-shrink: 0; width: 18px; height: 18px; min-width: 18px; color: #0284C7;`.
  3. Rombak ringkasan detail menjadi kartu terstruktur berbasis CSS Grid (`detail-grid` 2 kolom) yang rapi dengan badge peran pemohon, chip jenis cuti, ikon kalender tanggal dan durasi kerja, serta baris khusus alasan cuti penuh.
  4. Sempurnakan microcopy tombol pilihan menjadi bahasa Indonesia formal yang bersih: `Setujui Permohonan` dan `Tolak Permohonan`.
  5. Selaraskan ikon dan label tombol konfirmasi dengan keputusan yang aktif (`<Check>` + `Setujui Permohonan` untuk persetujuan; `<X>` + `Tolak Permohonan` untuk penolakan).
  6. Berikan petunjuk dinamis pada placeholder textarea catatan reviewer sesuai mode keputusan.
- **Rationale / Expected Benefit:** Menghadirkan modal persetujuan yang elegan, ergonomis, berbobot enterprise, serta bebas dari kebocoran artefak rekayasa internal sistem.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794213810808_163318dd.png`.
- **Status:** Resolved / Implemented (Frontend Hotfixed)

---

### [IMP-053] Sinkronisasi Properti reviewNote & Peremajaan Visual Catatan Reviewer Cuti
- **Finding ID:** IMP-053
- **Title:** Sinkronisasi Properti reviewNote & Peremajaan Visual Catatan Reviewer Cuti
- **Category:** Frontend Data Binding & UI Polish
- **Page / Module:** Riwayat Pengajuan Cuti (`/leave/my`) & Antrean Persetujuan Cuti (`/leave/queue`)
- **Related Test Case:** `TC-LEAV-003`, `TC-LEAV-002`
- **Current Condition:** Basis data Prisma mengembalikan field singular `reviewNote`, sementara komponen frontend mengecek `req.reviewNotes` (plural). Akibatnya, catatan persetujuan/penolakan dari atasan tidak muncul pada baris riwayat cuti karyawan maupun antrean atasan.
- **Proposed Improvement:** 
  1. Perbarui antarmuka `LeaveRequestItem` dan template binding agar mendukung kedua format secara fallback: `req.reviewNote || req.reviewNotes`.
  2. Tambahkan info identitas peninjau: `req.reviewedBy?.fullName`.
  3. Perbarui gaya visual `.review-note` dengan kotak beraksen hijau lembut (atau merah untuk penolakan) dan tipografi terstruktur.
- **Rationale / Expected Benefit:** Menampilkan umpan balik resmi dan arahan kerja dari atasan secara jelas kepada karyawan pemohon cuti.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794215383561_519ab09a.jpg`.
- **Status:** Resolved / Implemented (Frontend Hotfixed)

---

### [IMP-054] Alokasi Lebar Kolom Aksi dan Stabilisasi Layout Tabel Riwayat Cuti
- **Finding ID:** IMP-054
- **Title:** Alokasi Lebar Kolom Aksi dan Stabilisasi Layout Tabel Riwayat Cuti
- **Category:** UI / Visual Layout & Enterprise Table Standards
- **Page / Module:** Riwayat Pengajuan Cuti (`/leave/my`)
- **Related Test Case:** `TC-LEAV-003`, `TC-LEAV-004`
- **Current Condition:** Kolom "Aksi" pada tabel riwayat cuti karyawan tidak memiliki alokasi lebar pasti (`min-width`). Saat baris berisi tanda strip `-` (karena status bukan PENDING), kolom menyusut sempit ke tepi kanan layar, menciptakan perataan yang canggung dan berpotensi memicu pergeseran layout (*layout shift*) saat tombol aksi "Batalkan" muncul.
- **Proposed Improvement:** 
  1. Tetapkan alokasi lebar proporsional pada header dan cell: `.col-action` (`width: 12%; min-width: 110px;`) dan padding kanan 20px yang konsisten.
  2. Alokasikan lebar kolom tanggal (`18%`), alasan (`44%`), dan status (`26%`) agar tabel stabil dan tidak mengalami *layout jump* antara kondisi beraksi maupun tanpa aksi.
  3. Terapkan perataan tengah presisi horizontal dan vertikal (`text-align: center !important; vertical-align: middle !important;`) baik untuk header th "Aksi", tombol ".btn-cancel", maupun tanda strip netral ".no-action-text".
- **Rationale / Expected Benefit:** Memberikan estetika tabel yang kokoh, stabil, konsisten di seluruh status pengajuan, serta mencegah *horizontal scroll* yang tidak perlu pada resolusi standar.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (09 Nov 2026, Harry): `media_1794215736960_0ed54016.jpg`.
- **Status:** Resolved / Implemented (Frontend Hotfixed)

---

### [IMP-055] Standardisasi Terminologi Bahasa Indonesia Bisnis & Eliminasi Jargon Teknis 'Superseded by Approved Leave' pada Modul Cuti
- **Finding ID:** IMP-055
- **Title:** Standardisasi Terminologi Bahasa Indonesia Bisnis & Eliminasi Jargon Teknis 'Superseded by Approved Leave' pada Modul Cuti
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Cuti Saya (`/leave/my`), Antrean Persetujuan Cuti (`/leave/queue`), dan Komitmen Pagi (`/daily/morning`)
- **Related Test Case:** `TC-LEAV-003`
- **Current Condition:** 
  1. Halaman `/leave/my` dan `/daily/morning` mencampurkan istilah spesifikasi teknis internal berbahasa Inggris `Superseded by Approved Leave`, judul campuran `My Leave Request`, `Ajukan Leave Request`, `Riwayat Leave Request`, tab filter `Pending | Approved | Rejected`, serta badge `Leave (Pending) | Leave (Approved) | Leave (Rejected) | Leave (Cancelled)`.
  2. Halaman `/leave/queue` menampilkan judul bahasa Inggris `Leave Approval Queue`, catatan rekonsiliasi `'Direkonsiliasi retroaktif (Superseded by Approved Leave)'`, dan pesan toast dengan tanda hubung yang tidak baku (`"berhasil di-setujui."`).
  3. Data uji pada alasan pengajuan cuti tanggal 10 Nov 2026 memuat catatan instruksi teknis `(uji rekonsiliasi Superseded by Approved Leave)` yang tidak wajar dibaca oleh pengguna bisnis.
- **Proposed Improvement:** 
  1. Standardisasikan seluruh judul, subjudul, tab filter (`Semua | Menunggu | Disetujui | Ditolak`), dan badge status (`Menunggu Review | Disetujui | Ditolak | Dibatalkan`) pada `/leave/my` dan `/leave/queue` (`Antrean Persetujuan Cuti`) ke dalam Bahasa Indonesia bisnis yang lugas dan mudah dipahami.
  2. Ganti kalimat teknis `Superseded by Approved Leave` pada kotak panduan `/leave/my`, chip rekonsiliasi `/leave/queue`, dan banner bebas komitmen `/daily/morning` menjadi penjelasan bisnis alami: *"Apabila cuti mendadak untuk hari ini disetujui setelah batas waktu pagi (09:30 WIB), catatan ketidakhadiran (belum check-in) pada hari tersebut akan otomatis diputihkan menjadi Cuti Resmi."*
  3. Perbaiki ejaan toast pada `/leave/queue` menjadi `"Permohonan cuti berhasil disetujui."` / `"ditolak."` serta bersihkan catatan teknis `(uji rekonsiliasi Superseded by Approved Leave)` dari tampilan teks alasan cuti.
- **Rationale / Expected Benefit:** Menghadirkan komunikasi antarmuka yang manusiawi, konsisten berbahasa Indonesia bisnis, serta bebas dari kebocoran istilah spesifikasi rekayasa internal.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (10 Nov 2026, Harry): `media_1794272969864_a8773750.jpg`, `media_1794273208642_085a65f7.jpg`, `media_1794273244491_e6a37632.jpg`, `media_1794273272592_80a77b85.jpg`.
- **Status:** Resolved / Implemented (Frontend Hotfixed)

---

### [IMP-056] Standardisasi Bahasa Indonesia Bisnis, Format Stage Kepatuhan & Eliminasi Jargon pada Modul Coaching
- **Finding ID:** IMP-056
- **Title:** Standardisasi Bahasa Indonesia Bisnis, Format Stage Kepatuhan & Eliminasi Jargon pada Modul Coaching
- **Category:** Copywriting & Microcopy
- **Page / Module:** Catatan Pembinaan Tim (`/coaching`)
- **Related Test Case:** `TC-COAC-001`, `TC-COAC-002`
- **Current Condition:** 
  1. Lencana jenjang kepatuhan pada kartu anggota tim (Siti Rahma) menampilkan kode enum basis data mentah `PATTERN_FLAG_3X`.
  2. Label formulir memuat imbuhan bahasa Inggris `Jenis Catatan (Type) *` dan pilihan jenis catatan menggunakan kata mentah bahasa Inggris `Coaching`, `Recognition`, `Corrective`.
  3. Pilihan visibilitas memuat bahasa Inggris `Rahasia (Manager Only)` dan deskripsi memuat istilah pengembang `notifikasi in-app`.
  4. Panel riwayat kanan memuat jargon pengembang / forum medsos `Thread pembinaan aktif untuk anggota tim terpilih` dan teks status kosong memuat `rekaman coaching atau umpan balik`.
  5. Lencana tipe catatan pada feed riwayat mencetak kode enum kapital mentah `COACHING`, `RECOGNITION`, `CORRECTIVE`.
- **Proposed Improvement:** 
  1. Tambahkan fungsi `formatComplianceStage()` untuk memetakan enum database menjadi bahasa bisnis ramah pengguna (`Pola Terlambat 3x`, `Kepatuhan Baik`, `Surat Peringatan`, `Eskalasi Direksi`).
  2. Bersihkan label menjadi `Jenis Catatan *` dan ubah opsi pilihan jenis catatan menjadi bahasa Indonesia bisnis formal pilihan Harry: `Bimbingan`, `Apresiasi`, dan `Tindakan Korektif`.
  3. Perbarui opsi visibilitas menjadi `Rahasia (Khusus Manajemen)` dan ganti `notifikasi in-app` menjadi `notifikasi aplikasi`.
  4. Sempurnakan subjudul riwayat menjadi `Daftar riwayat pembinaan dan apresiasi untuk anggota tim terpilih` dan status kosong menjadi `Belum ada catatan bimbingan atau apresiasi yang dibuat untuk anggota tim ini`.
  5. Tambahkan fungsi `formatNoteType()` untuk memetakan lencana feed menjadi `Bimbingan`, `Apresiasi`, dan `Tindakan Korektif` serta visibilitas menjadi `Dibagikan` / `Rahasia Manajemen`.
- **Rationale / Expected Benefit:** Menghadirkan antarmuka pembinaan manajerial yang profesional, bermartabat, dan sepenuhnya berbahasa Indonesia bisnis tanpa kebocoran kode teknis database maupun istilah asing.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (10 Nov 2026, Harry): `media_1794277170672_a819f455.jpg`.
- **Status:** Resolved / Implemented (Frontend Hotfixed)

---

### [IMP-057] Penayangan Rincian Isi Catatan Pembinaan pada Notifikasi & Pencegahan Navigasi 403 bagi Karyawan
- **Finding ID:** IMP-057
- **Title:** Penayangan Rincian Isi Catatan Pembinaan pada Notifikasi & Pencegahan Navigasi 403 bagi Karyawan
- **Category:** UX Ergonomics & Navigation Guard
- **Page / Module:** Pusat Notifikasi (`/notifications`) & Backend `CoachingService`
- **Related Test Case:** `TC-COAC-002`, `TC-NOTF-001`
- **Current Condition:** 
  1. Saat atasan menerbitkan catatan bimbingan yang dibagikan (`SHARED_WITH_EMPLOYEE`), backend menetapkan `actionUrl: '/coaching'`.
  2. Ketika karyawan (Aditya Nugroho) membuka rincian notifikasi di `/notifications` dan menekan tombol *"Buka Halaman Terkait"*, sistem mengarahkannya ke `/coaching`. Karena rute `/coaching` dilindungi wewenang manajerial (`requiresSubordinates: true`), karyawan langsung ditolak dengan halaman `403 — Akses Dibatasi`.
  3. Modal rincian notifikasi hanya memuat kalimat umum (*"Atasan Anda telah membagikan catatan pembinaan..."*) tanpa menyajikan teks isi catatan bimbingan itu sendiri.
- **Proposed Improvement:** 
  1. Di `NotificationCenterView.vue`, tambahkan proteksi pengecekan hak akses `canUserAccess(url)` menggunakan `canAccessRoute()`. Sembunyikan tombol *"Buka Halaman Terkait"* jika pengguna tidak memiliki wewenang mengakses halaman tujuan (seperti staf tanpa bawahan yang diarahkan ke `/coaching`).
  2. Saat modal notifikasi bertipe `MANAGER_NOTE_SHARED` dibuka, muat dan tampilkan kotak sorotan khusus (`.coaching-note-callout`) yang menyajikan judul bimbingan, nama atasan, dan kutipan teks catatan lengkap agar karyawan dapat membaca bimbingan secara langsung.
  3. Pada `CoachingService.ts`, perbarui notifikasi baru agar menyertakan nama atasan dan kutipan teks catatan di dalam pesan notifikasi, serta menetapkan `actionUrl: '/notifications'` yang aman diakses staf.
- **Rationale / Expected Benefit:** Menghilangkan jalan buntu navigasi (dead-end 403 error), menjamin staf dapat langsung membaca arahan atau apresiasi atasan secara transparan di Pusat Notifikasi, dan mempertahankan keamanan hak akses manajerial secara utuh.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (10 Nov 2026, Harry): `media_1794278981050_ad2bb972.png`, `media_1794279003712_2a5ea742.png`.
- **Status:** Resolved / Implemented (Frontend & Backend Synced)

---

### [IMP-058] Restrukturisasi Alur Delegasi Reviewer: Orientasi Pejabat yang Berhalangan, Jabatan Riil, dan Transparansi Audit
- **Finding ID:** IMP-058
- **Title:** Restrukturisasi Alur Delegasi Reviewer: Orientasi Pejabat yang Berhalangan, Jabatan Riil, dan Transparansi Audit
- **Category:** Business Logic & Organizational Governance
- **Page / Module:** Reviewer Sementara (`/admin/temporary-reviewers`) & Backend `TemporaryReviewerService`
- **Related Test Case:** `TC-ADMN-001`, `TC-HRGA-003`
- **Current Condition:** 
  1. Konsep pendelegasian sebelumnya dimulai dari *"Pilih siapa penerima wewenang $\rightarrow$ Pilih divisi target"*, yang menyerupai mutasi/pemindahan jabatan orang secara sepihak alih-alih pendelegasian wewenang riil.
  2. Dropdown hanya menampilkan nama dan email tanpa jabatan dan divisi asal, sehingga admin tidak mengetahui apakah orang yang ditunjuk kompeten dan memiliki kedudukan yang tepat.
  3. Formulir dan tabel tidak mencatat siapa pejabat/atasan asli yang sedang berhalangan/cuti yang wewenangnya digantikan.
- **Proposed Improvement:** 
  1. Restrukturisasi formulir delegasi: Langkah 1 memilih **Pejabat yang Berhalangan / Digantikan** (misal: *Arif Budiman — Head of Engineering*), divisi wewenang otomatis diselaraskan dengan divisi atasan tersebut, lalu Langkah 2 memilih **Pejabat Pengganti Sementara** (misal: *Bambang Pratama — Technical Lead 1*).
  2. Dropdown menampilkan format kaya: `Nama Lengkap — Jabatan (Divisi)` untuk seluruh manajer dan personil terkait.
  3. Menjamin keterlihatan 100% seluruh karyawan aktif tanpa terkecuali (limit query diperbesar menjadi 500) dengan pengelompokan hierarkis `<optgroup>` (Pimpinan Internal Divisi Prioritas, Pimpinan Lintas Divisi, Staf Internal Divisi, Seluruh Karyawan Lainnya) seperti pada Penanggung Jawab Blocker.
  4. Penegakan integritas periode delegasi: Batas tanggal kedaluwarsa harus sama dengan atau setelah tanggal efektif mulai (`expiryDate >= effectiveDate`), didukung pembatasan kalender native `:min="form.effectiveDate"` dan reactive auto-sync.
  5. Di tabel riwayat delegasi, tambahkan kolom **MENGGANTIKAN SIAPA** dan tampilkan jabatan asal personil pengganti di bawah nama.
  6. Format catatan audit otomatis menyematkan metadata `[Menggantikan Nama (Jabatan)]` agar audit trail kepegawaian tersimpan permanen di database tanpa perlu alter skema.
  7. Otomatisasi pengiriman notifikasi In-App dua arah (*Two-Way In-App Notifications*): Memberikan notifikasi resmi kepada Pejabat Penerima Delegasi (dengan rincian divisi, nama atasan yang digantikan, periode waktu, dan tautan langsung ke antrean persetujuan) serta kepada Pejabat yang Digantikan (konfirmasi resmi bahwa wewenang peninjauannya telah dialihkan kepada siapa selama masa cuti/izin).
- **Rationale / Expected Benefit:** Menyelaraskan alur pendelegasian dengan tata kelola organisasi nyata (Delegation of Authority), menghilangkan kebingungan pengguna, mencegah salah pilih divisi, dan menjamin transparansi audit kepegawaian.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (10 Nov 2026, Harry): Diskusi kritis evaluasi tata kelola delegasi reviewer `TC-ADMN-001`.
- **Status:** Resolved / Implemented (Frontend & Backend Synced)

---

### [IMP-059] Tata Kelola Siklus Hidup Pendelegasian Wewenang (Edit & Cabut Akses) serta Notifikasi Dua Arah Komprehensif
- **Finding ID:** IMP-059
- **Title:** Tata Kelola Siklus Hidup Pendelegasian Wewenang (Edit & Cabut Akses) serta Notifikasi Dua Arah Komprehensif
- **Category:** Lifecycle Management & Notification Transparency
- **Page / Module:** Reviewer Sementara (`/admin/temporary-reviewers`), Pusat Notifikasi (`/notifications`), & Backend `TemporaryReviewerService`
- **Related Test Case:** `TC-ADMN-001`, `TC-HRGA-003`
- **Current Condition:** 
  1. Notifikasi awal pendelegasian belum memuat rincian mandat wewenang spesifik (persetujuan cuti dan review koreksi komitmen tim), alasan kedinasan yang jelas, dan identitas pejabat penerbit (Admin/HRGA).
  2. Data pendelegasian wewenang sebelumnya bersifat statis sekali buat; Admin dan HRGA tidak memiliki sarana untuk mengedit periode/alasan jika jadwal cuti bergeser, maupun mencabut (*revoke*) wewenang lebih awal jika atasan telah aktif bekerja kembali.
  3. Ketiadaan fitur pencabutan wewenang berisiko menimbulkan *dangling privilege* (pejabat pengganti tetap memiliki akses persetujuan manajerial padahal atasan definitif sudah kembali).
  4. Belum ada notifikasi otomatis saat terjadi perubahan ketentuan maupun pencabutan delegasi wewenang.
- **Proposed Improvement:** 
  1. Rincian Notifikasi Dua Arah Komprehensif, Terstruktur & Bernarasi Personal:
     - Notifikasi pembuatan, pembaruan, dan pencabutan wewenang menggunakan kalimat pembuka personal (*second-person perspective* "Anda") yang secara gamblang membedakan peran kedua belah pihak:
       - Pihak 1 (Penerima Delegasi): *"Anda telah resmi diberikan pelimpahan wewenang sebagai Reviewer Sementara..."* / *"Pelimpahan wewenang yang sebelumnya diberikan kepada Anda telah resmi diakhiri/dicabut..."*
       - Pihak 2 (Pejabat yang Digantikan): *"Wewenang peninjauan Anda telah resmi dialihkan sementara kepada..."* / *"Pelimpahan wewenang peninjauan Anda telah resmi berakhir dan wewenang peninjauan aktif kembali secara penuh..."*
     - Di Pusat Notifikasi (`NotificationCenterView.vue`), eliminasi duplikasi teks dan tampilkan kalimat pembuka personal di atas grid baris rincian berlabel tebal (`.delegation-intro-text`, `.delegation-grid`, `.delegation-row`).
     - Eliminasi tombol aksi membingungkan: Tombol *"Buka Halaman Terkait"* dihilangkan pada notifikasi pemulihan/pengakhiran wewenang karena murni bersifat pemberitahuan informatif, dan dilabeli secara spesifik *"Buka Antrean Persetujuan Cuti"* hanya pada saat penugasan aktif (Pihak 1).
  2. Fitur Edit Delegasi Reviewer Sementara:
     - Tambahkan tombol aksi Edit (ikon pensil) di tabel daftar pendelegasian.
     - Modal Edit Delegasi untuk memperbarui tanggal efektif, tanggal kedaluwarsa, dan catatan alasan perubahan wajib.
     - Endpoint `@Patch(':id')` di backend yang memvalidasi integritas rentang tanggal dan menyimpan revisi audit trail `[Revisi: ...]`.
     - Otomatis kirim notifikasi `TEMPORARY_REVIEWER_UPDATED` ke kedua belah pihak dengan rincian masa berlaku baru, catatan perubahan, dan pihak pembaru.
  3. Fitur Cabut Wewenang / Pengakhiran Delegasi:
     - Tambahkan tombol aksi Cabut (ikon tempat sampah merah) di tabel daftar pendelegasian.
     - Modal Cabut Wewenang dengan banner peringatan resiko, ringkasan pejabat yang terdampak, dan kolom alasan pencabutan wajib.
     - Endpoint `@Delete(':id')` di backend yang menghapus assignment secara aman dari database untuk membatalkan wewenang secara seketika (*immediate revocation*).
     - Otomatis kirim notifikasi `TEMPORARY_REVIEWER_REVOKED` ke kedua pihak: konfirmasi pencabutan wewenang ke pejabat pengganti dan konfirmasi pemulihan wewenang mandiri penuh ke atasan definitif.
- **Rationale / Expected Benefit:** Menyempurnakan tata kelola *enterprise delegation lifecycle*, mencegah celah wewenang ilegal (*dangling privilege*), dan memberikan transparansi komunikasi mutlak bagi seluruh pejabat terkait.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Cycle 2 (10 Nov 2026, Harry): `media_1794289170862_4bcd93d1.png`, `media_1794289233720_1d4f064d.png`, `media_1794292519681_08f4782f.png`, `media_1794292564394_737ab6e6.jpg`, & `media_1794294557721_35e519d5.png`.
- **Status:** Resolved / Implemented (Frontend & Backend Synced)

---
*Seluruh temuan di atas resmi terdaftar sebagai Candidate Improvement untuk ditinjau pasca-pelaksanaan Manual UAT WorkPulse.*
