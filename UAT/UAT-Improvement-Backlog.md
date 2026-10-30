# WorkPulse — UAT Improvement Backlog (Enhancement & Refinement Register)

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Penanggung Jawab:** Harry (Acceptance Owner & Lead Manual UAT Tester)  
> **UAT Co-Pilot:** Senior Software Quality Assurance Engineer  
> **Status Dokumen:** ACTIVE — LIVING REGISTER  
> **Tanggal Inisialisasi:** 30 Oktober 2026  
> **Total Temuan:** 22 Calon Perbaikan (IMP-001 s.d. IMP-022)

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
| **IMP-001** | Penyempurnaan Tagline Value Proposition Hero Login | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Low | Candidate |
| **IMP-002** | Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Low | Candidate |
| **IMP-003** | Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Low | Candidate |
| **IMP-004** | Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Medium | Candidate |
| **IMP-005** | Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX | Copywriting & Microcopy | `/login` (Panel Kiri) | `TC-AUTH-001` | Medium | Candidate |
| **IMP-006** | Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri | Visual Design & Styling | `/login` (Panel Kiri) | `TC-AUTH-001` | Medium | Candidate |
| **IMP-007** | Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur | Copywriting & Microcopy | `/login` (Form Kanan) | `TC-AUTH-001` | Low | Candidate |
| **IMP-008** | Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form | Visual Design & Styling | `/login` (Form Kanan) | `TC-AUTH-001` | Low | Candidate |
| **IMP-009** | Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment" | Copywriting & Microcopy | `/login` (Form Kanan) | `TC-AUTH-001` | Low | Candidate |
| **IMP-010** | Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna | Copywriting & Microcopy | `/login` (Footer Kanan) | `TC-AUTH-001` | Medium | Candidate |
| **IMP-011** | Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?" | Feature Enhancement | `/login` (Form Kanan) | `TC-AUTH-001` | High | Candidate |
| **IMP-012** | Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi | Layout & Spacing | `/activate` & `/login` | `TC-AUTH-003` | Medium | Candidate |
| **IMP-013** | Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit | User Experience (UX) | `/login` & Error Guard | `TC-AUTH-002` | Medium | Candidate |
| **IMP-014** | Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar | Visual Design & Styling | Header Bar / Shell | `TC-AUTH-001` | Medium | Candidate |
| **IMP-015** | Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah | Navigation & Architecture | Header Bar / Shell | `TC-DLYM-001` | High | Candidate |
| **IMP-016** | Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today | User Experience (UX) | `/daily/*` (My Today) | `TC-DLYM-001` | High | Candidate |
| **IMP-017** | Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia' | Navigation & Architecture | Enterprise Sidebar | `TC-AUTH-001` | High | Candidate |
| **IMP-018** | Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas | Layout & Spacing | `/profile` | `TC-AUTH-007` | Low | Candidate |
| **IMP-019** | Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi) | Navigation & Architecture | Header Bar Global | `TC-AUTH-007` | High | Candidate |
| **IMP-020** | Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap) | Visual Design & Styling | Avatar Global | `TC-AUTH-007` | Low | Candidate |
| **IMP-021** | Pemisahan Nama Lengkap dan Jabatan pada Tampilan User | Copywriting & Microcopy | `/profile` & Header | `TC-AUTH-007` | Medium | Candidate |
| **IMP-022** | Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24 | Layout & Spacing | `/profile` | `TC-AUTH-007` | High | Candidate |
| **IMP-023** | Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran | Navigation & Architecture | `ErrorPageView.vue` | `TC-AUTH-005` | High | Candidate |

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

---

### [IMP-007] Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
- **Finding ID:** IMP-007
- **Title:** Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Form Kanan)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Headline form berbunyi *"Fokus pada Hasil, Tuntaskan Kendala."*
- **Proposed Improvement:** Rumuskan kembali headline agar mencakup transparansi komitmen dan kolaborasi, tidak terkesan sempit pada pelaporan hasil akhir semata.
- **Rationale / Expected Benefit:** Selaras dengan esensi WorkPulse yang mencakup penetapan komitmen, transparansi blocker harian, dan evaluasi hasil secara proporsional.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Candidate

---

### [IMP-008] Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
- **Finding ID:** IMP-008
- **Title:** Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
- **Category:** Visual Design & Styling
- **Page / Module:** Halaman Login (`/login`, Form Kanan)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Label versi tertulis statis: *"WorkPulse v2.0 • Clean-Slate Architecture"*.
- **Proposed Improvement:** Ganti teks tersebut menjadi *"WorkPulse v1.5 · Dutamedia"* dan pastikan penomoran versi dapat terbaca secara fleksibel/dinamis dari konfigurasi rilis aplikasi.
- **Rationale / Expected Benefit:** Penomoran versi selaras dengan dokumen acuan rilis internal dan menghapus istilah teknis arsitektur dari hadapan pengguna umum.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Candidate

---

### [IMP-009] Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
- **Finding ID:** IMP-009
- **Title:** Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Form Kanan)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Header form login menampilkan nama badan usaha *"PT Dutamedia Mandiri Pratama"*.
- **Proposed Improvement:** Ubah label penanda konteks menjadi *"Internal Workspace Environment"*.
- **Rationale / Expected Benefit:** Memberikan penegasan batas ruang kerja internal tanpa redundansi nama perusahaan yang sudah terwakili di logo dan branding.
- **Priority:** Low
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Candidate

---

### [IMP-010] Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
- **Finding ID:** IMP-010
- **Title:** Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
- **Category:** Copywriting & Microcopy
- **Page / Module:** Halaman Login (`/login`, Footer Kanan)
- **Related Test Case:** `TC-AUTH-001`
- **Current Condition:** Footer menampilkan detail teknis implementasi keamanan: *"Perlindungan sesi via HttpOnly & CSRF Double-Submit"*.
- **Proposed Improvement:** Ganti microcopy menjadi teks panduan praktis: *"Kendala akses akun? Hubungi Tim IT Support atau Tim HRGA."*
- **Rationale / Expected Benefit:** Memberikan nilai bantu nyata kepada karyawan awam saat menghadapi kesulitan autentikasi, dibanding menampilkan jargon teknis backend/security.
- **Priority:** Medium
- **Evidence / Screenshot Reference:** TBD (Halaman `/login`)
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Evidence / Screenshot Reference:** TBD (`ProfileView.vue`)
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Evidence / Screenshot Reference:** TBD (`ErrorPageView.vue`)
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

---

### [IMP-026] Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
- **Finding ID:** IMP-026
- **Title:** Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
- **Category:** Architecture & Separation of Duties (IAM)
- **Page / Module:** Navigasi Sidebar (`navGroups` / `router/navigation.ts`) & Router Guard
- **Related Test Case:** `TC-AUTH-005`, `TC-ADMN-002`
- **Current Condition:** Akun berkedudukan peran `SYSTEM_ADMIN` saat ini masih melihat dan memiliki akses ke grup menu *Workspace* (Morning Commitment, Additional Work, EOD Outcome, Lapor Blocker, Cuti Saya, Koreksi).
- **Proposed Improvement:** Terapkan pemisahan tugas (*Separation of Duties*) tegas pada tingkat navigasi dan hak akses: Akun `SYSTEM_ADMIN` adalah identitas pengelola sistem (bukan jabatan operasional karyawan perusahaan). Nonaktifkan grup navigasi *Workspace* untuk peran `SYSTEM_ADMIN`, sehingga akun admin murni hanya mengelola konfigurasi sistem (*Administration*) dan pemantauan eskalasi/audit (*Management*). Setiap PIC pengelola admin (misal HRGA/IT) yang memiliki kewajiban komitmen harian tetap menggunakan akun karyawan pribadinya masing-masing.
- **Rationale / Expected Benefit:** Mencegah terjadinya pencemaran data komitmen operasional pada akun sistem, menegakkan kepatuhan tata kelola akses enterprise (IAM Governance & Separation of Duties), serta menyederhanakan fokus antarmuka administrator.
- **Priority:** High
- **Evidence / Screenshot Reference:** Keputusan Arsitektur Acceptance Owner Sesi 30 Okt 2026
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

### [IMP-040] Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)
- **Finding ID:** IMP-040
- **Title:** Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)
- **Category:** Navigation & Consistency
- **Page / Module:** Halaman Evaluasi Sore (`/daily/eod`) & Seluruh Tab My Today
- **Related Test Case:** `TC-BLKR-001`, `TC-DLYE-001`
- **Current Condition:** Tombol "+ Laporkan Blocker Mendesak" di halaman EOD memunculkan modal dialog pop-up terpisah (`media_1793343838939_99a0aba8.png`), padahal sistem telah memiliki halaman formulir pelaporan mandiri resmi di `/blockers/raise`.
- **Proposed Improvement:** Hapus implementasi modal pop-up pada tombol tersebut. Selaraskan seluruh tombol "Lapor Blocker" pada 3 sub-halaman My Today agar secara konsisten langsung mengarahkan (*direct navigate*) ke halaman kanonikal `/blockers/raise` dengan posisi tata letak yang presisi di sisi kanan tab navigasi.
- **Rationale / Expected Benefit:** Menghilangkan duplikasi antarmuka input blocker, mencegah fragmentasi alur pengguna, dan memastikan karyawan mengisi formulir kendala yang lengkap dan terstandarisasi.
- **Priority:** High
- **Evidence / Screenshot Reference:** Temuan Manual UAT Sesi 30 Okt 2026 (`media_1793343838939_99a0aba8.png`)
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

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
- **Status:** Candidate

---
*Seluruh temuan di atas resmi terdaftar sebagai Candidate Improvement untuk ditinjau pasca-pelaksanaan Manual UAT WorkPulse.*
