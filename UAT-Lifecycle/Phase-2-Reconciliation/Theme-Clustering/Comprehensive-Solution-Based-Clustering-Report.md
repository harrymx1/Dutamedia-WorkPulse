# LAPORAN KOMPREHENSIF ASESMEN INDIVIDUAL & EVALUASI PENGELOMPOKAN BERBASIS SOLUSI (PHASE 2)
## Ruang Lingkup: 44 Improvement Findings (IMP-001 s.d. IMP-044)

| Parameter Tata Kelola | Rincian Dokumen |
| :--- | :--- |
| **Siklus Lifecycle** | **Phase 2 — Finding Assessment & Remediation Planning** |
| **Aktivitas** | **Comprehensive Individual Assessment & Solution-Based Clustering Evaluation** |
| **Peran Penyusun** | Senior Product Analyst, Software Architect, & QA Analyst |
| **Penerima Otoritas** | Harry (Acceptance Owner & Lead Manual UAT Tester, PT Dutamedia Mandiri Pratama) |
| **Cabang Git Aktif** | `remediation/cycle-01-fixes` |
| **Standar Metodologis** | `Clustering-Calibration-Refinement-Report.md` Version 1.1 (Diratifikasi Formal) |
| **Status Dokumen** | **PROPOSED FOR ACCEPTANCE OWNER REVIEW & CLUSTER RATIFICATION** |
| **Tanggal Analisis** | 1 November 2026 |
| **Total Scope** | **Tepat 44 Temuan (`IMP-001` s.d. `IMP-044`) — Zero Omission** |

---

## DAFTAR ISI
1. [Landasan Tata Kelola & Metodologi Resmi](#1-landasan-tata-kelola--metodologi-resmi)
2. [STAGE A: Asesmen Individual 44 Improvement Findings](#2-stage-a-asesmen-individual-44-improvement-findings)
   - [Kluster Portal Masuk & Onboarding (IMP-001 s.d. IMP-013)](#kluster-portal-masuk--onboarding-imp-001-sd-imp-013)
   - [Kluster Shell Navigasi, Profil, & RBAC (IMP-014 s.d. IMP-026)](#kluster-shell-navigasi-profil--rbac-imp-014-sd-imp-026)
   - [Kluster Transaksi Akuntabilitas Harian (IMP-027 s.d. IMP-039)](#kluster-transaksi-akuntabilitas-harian-imp-027-sd-imp-039)
   - [Kluster Manajemen Pelaporan Kendala / Blocker (IMP-040 s.d. IMP-044)](#kluster-manajemen-pelaporan-kendala--blocker-imp-040-sd-imp-044)
3. [STAGE B: Identifikasi Kandidat Solusi Terpadu](#3-stage-b-identifikasi-kandidat-solusi-terpadu)
4. [STAGE C: Evaluasi Kriteria Pengelompokan Berbasis Solusi](#4-stage-c-evaluasi-kriteria-pengelompokan-berbasis-solusi)
5. [Register Resolusi Temuan Status REVIEW](#5-register-resolusi-temuan-status-review)
6. [Ringkasan Rekomendasi Pengelompokan & Distribusi Status](#6-ringkasan-rekomendasi-pengelompokan--distribusi-status)
7. [Matriks Ketertelusuran Bukti & Verifikasi (Traceability Register)](#7-matriks-ketertelusuran-bukti--verifikasi-traceability-register)
8. [Batasan Tata Kelola & Stop Condition](#8-batasan-tata-kelola--stop-condition)

---

## 1. LANDASAN TATA KELOLA & METODOLOGI RESMI

Sesuai otorisasi dan ratifikasi formal dari Acceptance Owner (Pak Harry), dokumen ini menerapkan standar metodologis **`Clustering-Calibration-Refinement-Report.md` Version 1.1** sebagai acuan tunggal evaluasi.

### Prinsip Inti Tata Kelola:
1. **Solution Identity sebagai Prinsip Inti:** Suatu kelompok (*cluster*) hanya dibentuk jika terdapat satu paket remediasi teknis yang terdefinisi dengan jelas (*single cohesive remediation package*) yang secara langsung dan substansial menuntaskan kebutuhan utama seluruh anggota kelompok, tanpa memerlukan paket solusi independen yang terpisah.
2. **Tanpa Asumsi Kuota / Ukuran Kelompok:** Penetapan `GROUP` maupun `STANDALONE` murni mengikuti bukti kode aktual dan kebutuhan solusi nyata di lapangan, bukan atas dasar asumsi apriori (seperti target ukuran 2–4 temuan atau asumsi bahwa mayoritas harus standalone).
3. **Pembedaan Konsep Kunci:**
   - *Shared Remediation Work:* Pekerjaan rekayasa teknis yang diselesaikan secara terpadu dalam satu paket implementasi rilis.
   - *Independent Acceptance Criteria:* Kriteria pengujian individual yang tetap melekat pada masing-masing finding dan wajib diverifikasi oleh QA/UAT.
4. **Persyaratan Resolusi Wajib bagi Status REVIEW:** Setiap temuan yang berstatus `REVIEW` wajib memuat empat komponen: (1) Alasan, (2) Ketidakpastian, (3) Aksi Diperlukan, dan (4) Kondisi Penetapan Akhir.
5. **Zero Omission & Identity Preservation:** Seluruh 44 temuan (`IMP-001` s.d. `IMP-044`) tercakup lengkap dengan nomor ID asli, tanpa penggabungan identitas prematur.

---

## 2. STAGE A: ASESMEN INDIVIDUAL 44 IMPROVEMENT FINDINGS

Setiap temuan diperiksa secara independen mencakup 10 parameter wajib:

### Kluster Portal Masuk & Onboarding (IMP-001 s.d. IMP-013)

#### [IMP-001] Penyempurnaan Tagline Value Proposition Hero Login
1. **Finding ID & Judul Asli:** `IMP-001` — Penyempurnaan Tagline Value Proposition Hero Login
2. **Deskripsi Masalah Asli:** Tagline hero panel kiri form login belum sepenuhnya mencerminkan esensi sistem deteksi risiko dini dan transparansi kerja harian tim sesuai rancangan prototipe.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/auth/LoginView.vue` baris 80–82, paragraf narasi hero tertulis: *"Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur."*
4. **Expected Outcome:** Mengikuti Prototipe 01 (`01-Login-Activation.html` L64), narasi hero diperbarui menjadi: *"Transparansi pekerjaan, deteksi kendala lebih awal, dan evaluasi berbasis bukti untuk ritme kerja berintegritas."*
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran string teks narasi hero panel kiri pada template login.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L80–82; Prototipe `01-Login-Activation.html` L64; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Template Hero Panel).
8. **Perkiraan Jenis Perubahan Teknis:** Copywriting update pada komponen UI.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada (Fakta terverifikasi 100%).
10. **Acceptance Criteria Mandiri:** Paragraf hero memuat naskah mitigasi risiko dan transparansi persis sesuai naskah Prototipe 01.

#### [IMP-002] Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
1. **Finding ID & Judul Asli:** `IMP-002` — Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
2. **Deskripsi Masalah Asli:** Judul poin fitur 1 pada panel kiri hero login saat ini bertuliskan "Komitmen Pagi Tuntas", belum mencerminkan nilai akuntabilitas sepanjang hari.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 88, judul fitur 1 tertulis: `<strong>Komitmen Pagi Tuntas</strong>`.
4. **Expected Outcome:** Sesuai Prototipe 01 L72, judul diubah menjadi: `<strong>Komitmen Harian Menyeluruh</strong>`.
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran label judul fitur 1 pada array/markup fitur hero panel.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L88; Prototipe `01-Login-Activation.html` L72; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Pillar List Hero).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Judul poin fitur 1 menampilkan string `"Komitmen Harian Menyeluruh"`.

#### [IMP-003] Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
1. **Finding ID & Judul Asli:** `IMP-003` — Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
2. **Deskripsi Masalah Asli:** Subtitle poin fitur 1 berfokus sempit pada batasan jam kantor teknis ("sebelum batas jam cutoff kantor"), belum menekankan orientasi hasil kerja realistis.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 89, teks berbunyi: *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."*
4. **Expected Outcome:** Sesuai Prototipe 01 L73, subtitle berbunyi: *"Tetapkan 1–3 prioritas realistis dengan indikator jelas setiap pagi."*
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran subtitle deskripsi fitur 1 pada hero panel.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L89; Prototipe `01-Login-Activation.html` L73; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Pillar List Hero).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Deskripsi poin 1 memuat naskah prioritas realistis berindikator jelas.

#### [IMP-004] Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
1. **Finding ID & Judul Asli:** `IMP-004` — Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
2. **Deskripsi Masalah Asli:** Poin fitur 2 bertuliskan "Eskalasi Kendala Terukur" dan deskripsi berfokus pada pemetaan peran lead, berbeda dengan bahasa nilai prototipe.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 95–96, teks tertulis: *"Eskalasi Kendala Terukur"* dan *"Tiket hambatan langsung dipetakan ke Project Authority atau Squad Lead."*
4. **Expected Outcome:** Sesuai Prototipe 01 L80–81, teks menjadi: *"Eskalasi Kendala Cepat"* dan *"Laporkan blocker seketika agar hambatan segera direspons tim."*
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran judul dan subtitle poin fitur 2 pada hero panel.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L95–96; Prototipe `01-Login-Activation.html` L80–81; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Pillar List Hero).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Poin fitur 2 menampilkan judul "Eskalasi Kendala Cepat" dan subtitle respons seketika.

#### [IMP-005] Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
1. **Finding ID & Judul Asli:** `IMP-005` — Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
2. **Deskripsi Masalah Asli:** Poin fitur 3 bertuliskan "Evaluasi Objektif Bebas Bias" dengan narasi defensif mengenai manipulasi manual.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 102–103, teks tertulis: *"Evaluasi Objektif Bebas Bias"* dan *"Tinjauan berbasis bukti nyata transaksi harian tanpa manipulasi manual."*
4. **Expected Outcome:** Sesuai Prototipe 01 L88–89, naskah menjadi: *"Evaluasi Capaian Sore"* dan *"Tinjau progres, catat tugas tambahan, dan bangun integritas kerja."*
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran judul dan subtitle poin fitur 3 pada hero panel.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L102–103; Prototipe `01-Login-Activation.html` L88–89; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Pillar List Hero).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Poin fitur 3 menampilkan judul "Evaluasi Capaian Sore" dan narasi pembangunan integritas.

#### [IMP-006] Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
1. **Finding ID & Judul Asli:** `IMP-006` — Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
2. **Deskripsi Masalah Asli:** Ikon pada ketiga poin fitur panel hero kiri menggunakan karakter teks mentah Unicode (`✓`, `⚡`, `📊`), bukan ikon vektor SVG.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 86, 93, dan 100, tag `<div class="pillar-icon">` merender string simbol font karakter Unicode.
4. **Expected Outcome:** Sesuai Prototipe 01 L70–93, karakter Unicode diganti dengan vektor SVG terstandarisasi (CheckCircle, Zap, TrendingUp).
5. **Kebutuhan Solusi Remediasi:** Penggantian teks simbol dengan komponen ikon vektor SVG (misal dari pustaka `lucide-vue-next`).
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L86, L93, L100; Prototipe `01-Login-Activation.html` L70–93; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Pillar List Hero Iconography).
8. **Perkiraan Jenis Perubahan Teknis:** Penggantian elemen template dari text/char ke komponen SVG.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Ketiga poin fitur menampilkan ikon vektor SVG beresolusi tajam tanpa karakter Unicode mentah.

#### [IMP-007] Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
1. **Finding ID & Judul Asli:** `IMP-007` — Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur
2. **Deskripsi Masalah Asli:** Headline dan lead text form login di kolom kanan ("Masuk ke WorkPulse" dan "Masukkan kredensial email Dutamedia...") terasa kaku dan belum menyapa alur aktivasi bagi staf baru.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 126–127, teks berbunyi: `<h2>Masuk ke WorkPulse</h2>` dan `<p class="lead-text">Masukkan kredensial email Dutamedia dan kata sandi Anda.</p>`.
4. **Expected Outcome:** Sesuai Prototipe 01 L108–109, teks diselaraskan menjadi: `<h2>Selamat Datang Kembali</h2>` dan `<p class="lead-text">Gunakan akun email Dutamedia Anda untuk masuk atau aktivasi akun baru.</p>`.
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran string headline dan lead text pada form login kanan.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L126–127; Prototipe `01-Login-Activation.html` L108–109; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Right Form Heading).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Headline form kanan menampilkan "Selamat Datang Kembali" dan lead text menyapa alur aktivasi.

#### [IMP-008] Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
1. **Finding ID & Judul Asli:** `IMP-008` — Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form
2. **Deskripsi Masalah Asli:** Label versi sistem di footer kiri dan form kanan mencantumkan istilah kode teknis internal ("Clean-Slate Architecture"), bukan versi rilis produk yang profesional.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 110, teks footer kiri bertuliskan: *"WorkPulse v2.0 • Clean-Slate Architecture"*.
4. **Expected Outcome:** Label versi disederhanakan dan dibersihkan dari kode teknis arsitektur, misalnya cukup menampilkan `"WorkPulse v1.0 Enterprise"` atau mengambil nilai dinamis environment.
5. **Kebutuhan Solusi Remediasi:** Penghapusan teks "Clean-Slate Architecture" dan pemformatan label versi rilis yang bersih.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L110; Prototipe `01-Login-Activation.html` L98; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Brand Footer / Version Badge).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks statis atau binding variabel versi rilis.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Teks "Clean-Slate Architecture" tereliminasi dari seluruh antarmuka login.

#### [IMP-009] Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
1. **Finding ID & Judul Asli:** `IMP-009` — Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"
2. **Deskripsi Masalah Asli:** Eyebrow tag di atas judul form kanan menampilkan label teknis "PORTAL AKUNTABILITAS", belum selaras dengan identitas lingkungan kerja resmi "Internal Workspace Environment" pada prototipe.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 125, tag tertulis: `<span class="screen-tag">PORTAL AKUNTABILITAS</span>`.
4. **Expected Outcome:** Sesuai Prototipe 01 L106, tag diubah menjadi penanda lingkungan resmi: `<span class="screen-tag">INTERNAL WORKSPACE ENVIRONMENT</span>`.
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran string eyebrow tag form kanan.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L125; Prototipe `01-Login-Activation.html` L106; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Form Eyebrow Tag).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Screen tag di atas form kanan bertuliskan "INTERNAL WORKSPACE ENVIRONMENT".

#### [IMP-010] Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
1. **Finding ID & Judul Asli:** `IMP-010` — Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna
2. **Deskripsi Masalah Asli:** Bagian bawah form login menampilkan informasi teknis mekanisme keamanan internal ("Perlindungan sesi via HttpOnly & CSRF Double-Submit"), yang tidak memberikan nilai panduan bagi karyawan.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 205–207, elemen help hint tertulis: `<span>Perlindungan sesi via HttpOnly & CSRF Double-Submit</span>`.
4. **Expected Outcome:** Sesuai Prototipe 01 L155, jargon teknis diganti menjadi informasi bantuan operasional: *"Mengalami kendala akun? Hubungi Administrator IT / HRGA Dutamedia."*
5. **Kebutuhan Solusi Remediasi:** Penggantian string jargon teknis keamanan dengan tautan/kontak bantuan akses karyawan.
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L205–207; Prototipe `01-Login-Activation.html` L155; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` (Form Footer Help Text).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Jargon "HttpOnly & CSRF" tereliminasi dan digantikan oleh petunjuk bantuan akses IT/HRGA.

#### [IMP-011] Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
1. **Finding ID & Judul Asli:** `IMP-011` — Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
2. **Deskripsi Masalah Asli:** Formulir login tidak menyediakan prosedur atau tautan penanganan saat karyawan lupa kata sandi akunnya.
3. **Kondisi Aktual yang Ditemukan:** Pada `LoginView.vue` baris 189, baris opsi hanya menyediakan link: `<router-link to="/activate" class="forgot-link">Belum aktivasi akun?</router-link>`. Tidak ada opsi lupa kata sandi.
4. **Expected Outcome:** Karyawan yang lupa kata sandi memiliki jalur pemulihan resmi sesuai kebijakan organisasi (baik via dialog bantuan HRGA/IT Admin atau modul pemulihan mandiri).
5. **Kebutuhan Solusi Remediasi:** Bergantung pada kebijakan produk Acceptance Owner: penyediaan modal panduan bantuan administratif IT/HRGA (Alternatif A) atau pembangunan modul token reset email SMTP (Alternatif B).
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L184–190; Backlog UAT `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `LoginView.vue`, dan kondisional: modul email / backend auth token service.
8. **Perkiraan Jenis Perubahan Teknis:** Penambahan kontrol UI dan/atau pembangunan backend service pemulihan kata sandi.
9. **Ketidakpastian / Informasi Belum Tersedia:** Keputusan produk dari Acceptance Owner terkait arah kebijakan (Bantuan Administratif vs Self-service SMTP).
10. **Acceptance Criteria Mandiri:** Tersedia tautan/tombol "Lupa Kata Sandi?" yang memberikan alur pemulihan resmi yang sah bagi karyawan.

#### [IMP-012] Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
1. **Finding ID & Judul Asli:** `IMP-012` — Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
2. **Deskripsi Masalah Asli:** Terjadi perpindahan visual (*visual jumping*) dan inkonsistensi styling antara panel hero kiri halaman login (`LoginView.vue`) dan aktivasi (`ActivateView.vue`).
3. **Kondisi Aktual yang Ditemukan:** `ActivateView.vue` menduplikasi style `.brand-story` dari `LoginView.vue` dengan sedikit perbedaan padding dan variasi elemen pilar.
4. **Expected Outcome:** Panel hero kiri pada `/login` dan `/activate` memiliki dimensi layout, transisi, dan keselarasan visual yang harmonis saat berpindah tab.
5. **Kebutuhan Solusi Remediasi:** Harmonisasi styling layout atau pengabstraksian komponen layout hero bersama (*shared auth layout*).
6. **Bukti Pendukung & Lokasi Sumber:** `LoginView.vue` L70–110; `ActivateView.vue` L15–45; Test Case: `TC-AUTH-003`.
7. **Komponen Sistem Terdampak:** `LoginView.vue` dan `ActivateView.vue` (Layout Container).
8. **Perkiraan Jenis Perubahan Teknis:** Penyelarasan CSS grid/padding atau pembuatan shared layout component.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Pergantian tab antara Login dan Aktivasi tidak menimbulkan pergeseran posisi visual pada kolom hero kiri.

#### [IMP-013] Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit
1. **Finding ID & Judul Asli:** `IMP-013` — Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit
2. **Deskripsi Masalah Asli:** Skenario pengujian UAT manual belum secara eksplisit mendokumentasikan kasus uji untuk akun yang dinonaktifkan statusnya dan batasan laju percobaan login (*rate limiting*).
3. **Kondisi Aktual yang Ditemukan:** Sistem aplikasi telah memiliki penanganan error backend untuk akun nonaktif dan rate limit, namun kasus uji formalnya belum tercatat lengkap di dokumen checklist QA.
4. **Expected Outcome:** Dokumen test case dan automated test suite QA diperluas mencakup verifikasi penolakan login akun nonaktif dan proteksi brute-force.
5. **Kebutuhan Solusi Remediasi:** Penambahan test suite QA / test case documentation pada dokumen pengujian.
6. **Bukti Pendukung & Lokasi Sumber:** Dokumen `UAT-Manual-Test-Cases.md` `TC-AUTH-002`; Backlog `IMP-013`.
7. **Komponen Sistem Terdampak:** Test Documentation & QA Automation Suite (Bukan kode produk aplikasi).
8. **Perkiraan Jenis Perubahan Teknis:** Penulisan skenario uji / test script QA.
9. **Ketidakpastian / Informasi Belum Tersedia:** Ditangguhkan ke fase hardening pasca-remediasi.
10. **Acceptance Criteria Mandiri:** Tersedia skenario uji terverifikasi untuk akun nonaktif dan proteksi rate limiting.

---

### Kluster Shell Navigasi, Profil, & RBAC (IMP-014 s.d. IMP-026)

#### [IMP-014] Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar
1. **Finding ID & Judul Asli:** `IMP-014` — Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar
2. **Deskripsi Masalah Asli:** Header bar pada tampilan harian merender tautan teks biasa `"Profil"`, berbeda dari standar avatar inisial bulat pada prototipe desain.
3. **Kondisi Aktual yang Ditemukan:** Pada `MorningCommitmentView.vue` baris 13 (serta `AdditionalWorkView.vue` dan `EodOutcomeView.vue`), topbar kanan merender: `<AccessLink to="/profile" class="nav-btn">Profil</AccessLink>`.
4. **Expected Outcome:** Sesuai Prototipe 02 L88, tombol teks profil digantikan dengan avatar profil inisial bulat pengguna (`#top-avatar`).
5. **Kebutuhan Solusi Remediasi:** Penggantian elemen tombol teks profil menjadi avatar inisial bulat yang dapat diklik menuju `/profile`.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L13; Prototipe `02-Morning-Commitment.html` L88; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** Header bar tampilan harian (`MorningCommitmentView`, `AdditionalWorkView`, `EodOutcomeView`).
8. **Perkiraan Jenis Perubahan Teknis:** Penyesuaian template HTML/Vue topbar kontrol kanan.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Tombol teks "Profil" hilang dari topbar harian dan digantikan oleh avatar inisial bulat pengguna.

#### [IMP-015] Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
1. **Finding ID & Judul Asli:** `IMP-015` — Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
2. **Deskripsi Masalah Asli:** Header bar harian merender tombol teks `"Riwayat Saya"` di samping profil, bukan ikon lonceng notifikasi sesuai prototipe.
3. **Kondisi Aktual yang Ditemukan:** Pada `MorningCommitmentView.vue` baris 12, terdapat elemen `<AccessLink to="/daily/history" class="nav-btn">Riwayat Saya</AccessLink>`.
4. **Expected Outcome:** Tombol `Riwayat Saya` dieliminasi dan digantikan ikon lonceng notifikasi yang mengarahkan ke Notification Center atau memuat indikator badge aktif.
5. **Kebutuhan Solusi Remediasi:** Tergantung keputusan Acceptance Owner: pemasangan link ikon lonceng statis ke `/notifications` (Alternatif A) atau pengembangan widget unread counter reaktif (Alternatif B).
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L12; Prototipe `02-Morning-Commitment.html` L85–87; Test Case: `TC-DLYM-001`.
7. **Komponen Sistem Terdampak:** Header bar harian, Notification Center, dan kondisional: notification store/API.
8. **Perkiraan Jenis Perubahan Teknis:** Penggantian elemen template dan/atau integrasi data fetching notifikasi.
9. **Ketidakpastian / Informasi Belum Tersedia:** Keputusan kebijakan Acceptance Owner antara Alternatif A vs Alternatif B.
10. **Acceptance Criteria Mandiri:** Tombol "Riwayat Saya" tereliminasi dari topbar dan digantikan ikon lonceng notifikasi yang berfungsi.

#### [IMP-016] Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
1. **Finding ID & Judul Asli:** `IMP-016` — Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today
2. **Deskripsi Masalah Asli:** Tombol aksi pemicu pelaporan kendala belum diletakkan secara seragam dan konsisten pada baris tab ketiga halaman kerja harian.
3. **Kondisi Aktual yang Ditemukan:** Tombol pelaporan blocker pada tampilan harian memiliki penempatan dan perilaku yang bervariasi di antara tab Morning, Additional Work, dan EOD.
4. **Expected Outcome:** Sesuai Prototipe 02, 03, dan 04, tersedia satu tombol `+ Lapor Blocker` yang konsisten di baris tab pada ujung kanan batas margin halaman kerja harian.
5. **Kebutuhan Solusi Remediasi:** Penempatan tombol CTA `+ Lapor Blocker` yang seragam pada header tab harian.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue`, `AdditionalWorkView.vue`, `EodOutcomeView.vue`; Prototipe 02 L80; Test Case: `TC-DLYM-001`.
7. **Komponen Sistem Terdampak:** Workflow Step Bar / Tab Header pada ketiga view harian.
8. **Perkiraan Jenis Perubahan Teknis:** Penyelarasan template dan styling tombol aksi tab.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Ketiga halaman My Today menampilkan tombol "+ Lapor Blocker" pada posisi grid yang identik di ujung kanan baris tab.

#### [IMP-017] Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'
1. **Finding ID & Judul Asli:** `IMP-017` — Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'
2. **Deskripsi Masalah Asli:** Subtitle identitas brand di bagian atas sidebar enterprise bertuliskan *"Dutamedia Intranet"*, belum mencerminkan identitas akuntabilitas sistem.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/components/layout/EnterpriseSidebar.vue` baris 135, teks tertulis: `<span class="brand-sub">Dutamedia Intranet</span>`.
4. **Expected Outcome:** Sesuai naskah prototipe desain, subtitle diubah menjadi: `<span class="brand-sub">Dutamedia Accountability</span>`.
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran string teks statis tunggal pada header sidebar.
6. **Bukti Pendukung & Lokasi Sumber:** `EnterpriseSidebar.vue` L135; Prototipe 02 L40; Test Case: `TC-AUTH-001`.
7. **Komponen Sistem Terdampak:** `EnterpriseSidebar.vue` (Header Brand Subtitle).
8. **Perkiraan Jenis Perubahan Teknis:** Penggantian satu baris teks template Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Teks subtitle di bawah logo sidebar bertuliskan "Dutamedia Accountability".

#### [IMP-018] Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas
1. **Finding ID & Judul Asli:** `IMP-018` — Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas
2. **Deskripsi Masalah Asli:** Bar atas halaman profil akun menduplikasi logo dan brand "WP WorkPulse" di sebelah kiri, padahal logo aplikasi sudah terpampang jelas pada sidebar kiri.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/profile/ProfileView.vue` baris 88–93, header merender: `<div class="brand-badge">WP</div><span class="brand-name">WorkPulse</span>`.
4. **Expected Outcome:** Sesuai Prototipe 24, logo duplikat WP dihilangkan dari topbar dan digantikan oleh breadcrumb atau judul seksi bersih.
5. **Kebutuhan Solusi Remediasi:** Penghapusan elemen badge logo WP dari topbar `ProfileView.vue`.
6. **Bukti Pendukung & Lokasi Sumber:** `ProfileView.vue` L88–93; Prototipe `24-Profile-Settings.html` L60–75; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** `ProfileView.vue` (Header Topbar).
8. **Perkiraan Jenis Perubahan Teknis:** Penghapusan markup HTML lokal atau migrasi ke shared topbar.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Badge redundan "WP" dan teks "WorkPulse" tidak lagi muncul di header bar halaman profil akun.

#### [IMP-019] Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)
1. **Finding ID & Judul Asli:** `IMP-019` — Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)
2. **Deskripsi Masalah Asli:** Bar atas di berbagai modul sistem diimplementasikan secara terdesentralisasi dan tidak konsisten, memuat tombol logout/profil teks yang berulang.
3. **Kondisi Aktual yang Ditemukan:** Berbagai file view (`MorningCommitmentView`, `ProfileView`, `AdminUsersView`, `RaiseBlockerView`) memiliki implementasi `<header class="topbar">` atau `<header class="top-nav">` sendiri-sendiri dengan variasi tombol yang membingungkan.
4. **Expected Outcome:** Bar atas di seluruh sistem seragam mengikuti satu standar bersih: sisi kiri memuat hirarki lokasi (breadcrumb), sisi kanan memuat kontrol terstandarisasi (avatar inisial dan ikon notifikasi).
5. **Kebutuhan Solusi Remediasi:** Pembangunan komponen shell topbar terstandarisasi (`AppTopbar.vue`) dan migrasi seluruh view internal untuk mengadopsi komponen tersebut.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L4–15; `ProfileView.vue` L88–107; `AdminUsersView.vue` L1–15; Prototipe 08 dan 24; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** Shell Layout Global dan seluruh View Halaman Internal.
8. **Perkiraan Jenis Perubahan Teknis:** Pembuatan komponen Vue baru dan refaktorisasi integrasi layout view.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Seluruh halaman internal menggunakan pola topbar terstandarisasi bebas logo duplikat dengan posisi avatar konsisten.

#### [IMP-020] Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)
1. **Finding ID & Judul Asli:** `IMP-020` — Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)
2. **Deskripsi Masalah Asli:** Algoritma penjanaan inisial avatar belum konsisten; sebagian modul hanya mengambil 1 huruf pertama nama depan (`fullName?.charAt(0)`).
3. **Kondisi Aktual yang Ditemukan:** Pada `ProfileView.vue` baris 115, avatar merender: `{{ authStore.user?.fullName?.charAt(0) || 'U' }}` (hanya 1 huruf).
4. **Expected Outcome:** Avatar secara konsisten mengambil 2 huruf kapital (huruf pertama nama depan dan huruf pertama nama belakang, misal: "Budi Pratama" $\rightarrow$ "BP") di seluruh modul aplikasi.
5. **Kebutuhan Solusi Remediasi:** Pembuatan fungsi utilitas bersama `getAvatarInitials(fullName: string)` dan penerapannya pada seluruh komponen avatar.
6. **Bukti Pendukung & Lokasi Sumber:** `ProfileView.vue` L115; `EnterpriseSidebar.vue` L180; Prototipe 02 & 24; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** Helper Utility (`formatters.ts` atau `user.ts`) dan seluruh elemen rendering avatar.
8. **Perkiraan Jenis Perubahan Teknis:** Penulisan fungsi helper TypeScript dan binding pada komponen avatar.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Avatar profil menampilkan 2 huruf kapital untuk nama dua kata atau lebih.

#### [IMP-021] Pemisahan Nama Lengkap dan Jabatan pada Tampilan User
1. **Finding ID & Judul Asli:** `IMP-021` — Pemisahan Nama Lengkap dan Jabatan pada Tampilan User
2. **Deskripsi Masalah Asli:** Pada kartu profil pengguna, nama lengkap dan jabatan fungsional belum disajikan secara terpisah dengan hirarki tipografi yang jelas.
3. **Kondisi Aktual yang Ditemukan:** Pada `ProfileView.vue`, data nama dan jabatan masih digabungkan dalam satu baris heading tanpa pemisahan peran dan unit kerja yang tegas.
4. **Expected Outcome:** Sesuai Prototipe 24, nama lengkap ditampilkan menonjol sebagai judul utama (H2/H3), diikuti label jabatan fungsional dan unit kerja pada baris terpisah dengan styling sekunder.
5. **Kebutuhan Solusi Remediasi:** Restrukturisasi markup informasi pengguna pada kartu identitas profil.
6. **Bukti Pendukung & Lokasi Sumber:** `ProfileView.vue` L110–135; Prototipe `24-Profile-Settings.html` L80–95; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** `ProfileView.vue` (Identity Card).
8. **Perkiraan Jenis Perubahan Teknis:** Restrukturisasi template dan CSS kartu identitas profil.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Nama lengkap dan jabatan fungsional tampil dalam elemen terpisah dengan hirarki visual yang jelas.

#### [IMP-022] Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24
1. **Finding ID & Judul Asli:** `IMP-022` — Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24
2. **Deskripsi Masalah Asli:** Tata letak halaman profil belum tertata rapi ke dalam tiga seksi kanonikal yang proporsional sesuai acuan desain.
3. **Kondisi Aktual yang Ditemukan:** Pada `ProfileView.vue`, halaman hanya memuat grid dua kolom sederhana yang mencampuradukkan kartu identitas dan form ubah kata sandi tanpa seksi kebijakan akun.
4. **Expected Outcome:** Sesuai Prototipe 24, tata letak profil disusun terstruktur menjadi 3 seksi: (1) Informasi Pribadi & Organisasi, (2) Keamanan & Kata Sandi, dan (3) Riwayat Sesi & Kebijakan Akun.
5. **Kebutuhan Solusi Remediasi:** Restrukturisasi layout grid dan template halaman `ProfileView.vue` secara menyeluruh.
6. **Bukti Pendukung & Lokasi Sumber:** `ProfileView.vue` L109–240; Prototipe `24-Profile-Settings.html` L75–220; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** `ProfileView.vue` (Main Layout & Card Sections).
8. **Perkiraan Jenis Perubahan Teknis:** Restrukturisasi template HTML dan form styling pada halaman profil.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Halaman profil terbagi rapi ke dalam 3 seksi utama sesuai rancangan Prototipe 24.

#### [IMP-023] Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran
1. **Finding ID & Judul Asli:** `IMP-023` — Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran
2. **Deskripsi Masalah Asli:** Tombol pemulihan ("Kembali ke Beranda") pada layar 403 selalu mengarahkan pengguna ke `/dashboard`, yang menyebabkan error berulang (*circular 403*) bagi persona yang tidak memiliki izin dashboard (seperti STAFF biasa).
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/error/ErrorPageView.vue` baris 25–27, tombol kembali memiliki tautan statis: `<AccessLink to="/dashboard">Kembali ke Dashboard</AccessLink>`.
4. **Expected Outcome:** Tombol pemulihan mengarahkan pengguna ke rute pendaratan kanonikal sesuai perannya melalui fungsi utilitas `getLandingRouteForRole(user.role)` (misal: STAFF ke `/daily/morning`).
5. **Kebutuhan Solusi Remediasi:** Penyesuaian event handler navigasi tombol pemulihan pada `ErrorPageView.vue`.
6. **Bukti Pendukung & Lokasi Sumber:** `ErrorPageView.vue` L25–27; `router/navigation.ts` L30–45; Test Case: `TC-AUTH-006`.
7. **Komponen Sistem Terdampak:** `ErrorPageView.vue` (Error Recovery Action).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan binding route pada tombol error view.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Klik tombol pemulihan pada layar 403 mengarahkan staf biasa ke `/daily/morning` tanpa terjadi error 403 susulan.

#### [IMP-024] Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP
1. **Finding ID & Judul Asli:** `IMP-024` — Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP
2. **Deskripsi Masalah Asli:** Header modul panel administrasi menampilkan logo duplikat "WP" dan tag "Admin Panel", kehilangan orientasi navigasi hirarkis.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/admin/AdminUsersView.vue` baris 1–15, header merender: `<div class="brand-badge">WP</div><span class="brand-name">WorkPulse</span><span class="system-tag">Admin Panel</span>`.
4. **Expected Outcome:** Sesuai Prototipe 08, sisi kiri header admin menampilkan breadcrumb hirarkis bersih: `Admin / Manajemen Pengguna`.
5. **Kebutuhan Solusi Remediasi:** Penghapusan badge logo WP dan penerapan breadcrumb hirarkis pada header admin.
6. **Bukti Pendukung & Lokasi Sumber:** `AdminUsersView.vue` L1–15; Prototipe `08-Admin-Users.html` L55–70; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** Header modul admin (`AdminUsersView.vue`).
8. **Perkiraan Jenis Perubahan Teknis:** Penggantian markup header lokal dengan struktur breadcrumb atau shared topbar.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Sisi kiri header admin menampilkan breadcrumb hirarkis `Admin / Manajemen Pengguna` tanpa badge duplikat WP.

#### [IMP-025] Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat
1. **Finding ID & Judul Asli:** `IMP-025` — Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat
2. **Deskripsi Masalah Asli:** Sisi kanan topbar administrasi memuat tombol teks `"Profil Saya"` dan deretan link duplikat yang membingungkan.
3. **Kondisi Aktual yang Ditemukan:** Pada `AdminUsersView.vue` baris 10–14, area kanan topbar merender tombol teks: `<AccessLink to="/profile" class="nav-link">Profil Saya</AccessLink>`.
4. **Expected Outcome:** Sisi kanan topbar admin diselaraskan dengan standar aplikasi: memuat avatar profil inisial bulat tanpa tombol teks redundan.
5. **Kebutuhan Solusi Remediasi:** Penggantian tombol teks profil dengan avatar inisial pada header admin.
6. **Bukti Pendukung & Lokasi Sumber:** `AdminUsersView.vue` L10–14; Prototipe `08-Admin-Users.html` L70–80; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** `AdminUsersView.vue` (Header Right Actions).
8. **Perkiraan Jenis Perubahan Teknis:** Penyesuaian elemen topbar kanan admin atau adopsi shared topbar.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Tombol teks "Profil Saya" hilang dari header admin dan digantikan oleh avatar inisial bulat.

#### [IMP-026] Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
1. **Finding ID & Judul Asli:** `IMP-026` — Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'
2. **Deskripsi Masalah Asli:** Akun dengan persona `SYSTEM_ADMIN` masih melihat grup menu operasional 'Workspace' (My Today) pada sidebar, padahal admin sistem tidak menjalankan pelaporan komitmen kerja staf.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/router/navigation.ts` baris 50–63, grup navigasi `Workspace` tidak memiliki filter pengecualian untuk role `SYSTEM_ADMIN`.
4. **Expected Outcome:** Grup navigasi `Workspace` disembunyikan dari sidebar untuk role `SYSTEM_ADMIN` sehingga menu admin murni berfokus pada tata kelola sistem.
5. **Kebutuhan Solusi Remediasi:** Penambahan filter otorisasi peran pada konfigurasi router navigasi (`navigation.ts`).
6. **Bukti Pendukung & Lokasi Sumber:** `router/navigation.ts` L50–63; `EnterpriseSidebar.vue` L140–165; Test Case: `TC-AUTH-007`.
7. **Komponen Sistem Terdampak:** `router/navigation.ts` (RBAC Navigation Config).
8. **Perkiraan Jenis Perubahan Teknis:** Penyesuaian aturan filter peran pada router config.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Pengguna yang login sebagai `SYSTEM_ADMIN` tidak melihat grup menu 'Workspace' pada sidebar navigasi.

---

### Kluster Transaksi Akuntabilitas Harian (IMP-027 s.d. IMP-039)

#### [IMP-027] Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment
1. **Finding ID & Judul Asli:** `IMP-027` — Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment
2. **Deskripsi Masalah Asli:** Panel kartu konteks di atas formulir Morning Commitment menampilkan 4 kartu teknis yang padat dan redundan (Jadwal Kerja, Batas Waktu, Status Terlambat, dan Status Submit).
3. **Kondisi Aktual yang Ditemukan:** Pada `MorningCommitmentView.vue` baris 800–850, terdapat 4 kartu metrik dengan pembagian ruang yang sempit pada resolusi desktop standar.
4. **Expected Outcome:** Sesuai Prototipe 02 L95–110, panel disederhanakan menjadi 3 kartu kontekstual yang lapang: (1) Hari & Tanggal Kerja, (2) Waktu Batas Pengisian (Cutoff 09:00), dan (3) Status Komitmen Hari Ini.
5. **Kebutuhan Solusi Remediasi:** Restrukturisasi layout grid dan penyederhanaan komponen kartu metrik pagi.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L800–850; Prototipe `02-Morning-Commitment.html` L95–110; Test Case: `TC-DLYM-001`.
7. **Komponen Sistem Terdampak:** `MorningCommitmentView.vue` (Context Metric Cards).
8. **Perkiraan Jenis Perubahan Teknis:** Restrukturisasi template HTML dan grid CSS.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Panel metrik pagi menampilkan tepat 3 kartu konteks yang bersih sesuai rancangan Prototipe 02.

#### [IMP-028] Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)
1. **Finding ID & Judul Asli:** `IMP-028` — Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)
2. **Deskripsi Masalah Asli:** Banner peringatan saat karyawan mengisi komitmen melewati batas cutoff memuat istilah teknis bahasa Inggris *"Grace Period"*, yang menimbulkan kebingungan bagi staf.
3. **Kondisi Aktual yang Ditemukan:** Pada `MorningCommitmentView.vue` baris 865, teks peringatan memuat string: *"Anda mengisi dalam masa toleransi (Grace Period)..."*.
4. **Expected Outcome:** Sesuai Prototipe 02 L115, istilah asing dieliminasi dan digantikan penjelasan bahasa bisnis yang menenangkan: *"Pengisian Melewati Batas Waktu (09:00 WIB) — Catatan keterlambatan akan disertakan secara otomatis pada rekaman harian."*
5. **Kebutuhan Solusi Remediasi:** Pemutakhiran string microcopy banner keterlambatan formulir komitmen pagi.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L865; Prototipe `02-Morning-Commitment.html` L115; Test Case: `TC-DLYM-001`.
7. **Komponen Sistem Terdampak:** `MorningCommitmentView.vue` (Late Warning Banner).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan teks template Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Istilah "Grace Period" tereliminasi 100% dari banner keterlambatan dan berganti bahasa bisnis yang jelas.

#### [IMP-029] Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol
1. **Finding ID & Judul Asli:** `IMP-029` — Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol
2. **Deskripsi Masalah Asli:** Label checkbox deklarasi hari tanpa komitmen memuat string kode arsitektur internal `(Audit Rule DEC-004)`.
3. **Kondisi Aktual yang Ditemukan:** Pada `MorningCommitmentView.vue` baris 910, label checkbox tertulis: *"Hari ini saya tidak memiliki komitmen tugas terencana (Audit Rule DEC-004)"*.
4. **Expected Outcome:** Sesuai Prototipe 02 L140, string kode audit internal dibuang, sehingga label menjadi bersih: *"Hari ini saya tidak memiliki komitmen tugas terencana (Cuti, Sakit, atau Penugasan Khusus Luar Kantor)"*.
5. **Kebutuhan Solusi Remediasi:** Pembersihan string kode audit "DEC-004" dari label checkbox formulir.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L910; Prototipe `02-Morning-Commitment.html` L140; Test Case: `TC-DLYM-001`.
7. **Komponen Sistem Terdampak:** `MorningCommitmentView.vue` (Zero Commitment Checkbox).
8. **Perkiraan Jenis Perubahan Teknis:** Pembersihan teks template Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** String "DEC-004" hilang dari antarmuka formulir Morning Commitment.

#### [IMP-030] Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis
1. **Finding ID & Judul Asli:** `IMP-030` — Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis
2. **Deskripsi Masalah Asli:** Banner status ketika komitmen nol disubmit menampilkan kode enum mentah basis data `NOT_APPLICABLE_NO_COMMITMENT`.
3. **Kondisi Aktual yang Ditemukan:** Pada `MorningCommitmentView.vue` baris 940, pesan status menampilkan raw database enum string tersebut.
4. **Expected Outcome:** Enum mentah diterjemahkan menjadi penjelasan bahasa bisnis yang menenangkan: *"Hari ini tercatat sebagai hari bebas komitmen terencana. Tetap laporkan jika ada kendala mendesak melalui tombol Lapor Blocker."*
5. **Kebutuhan Solusi Remediasi:** Penerjemahan nilai enum basis data menjadi label bahasa bisnis ramah pengguna.
6. **Bukti Pendukung & Lokasi Sumber:** `MorningCommitmentView.vue` L940; Prototipe `02-Morning-Commitment.html` L145; Test Case: `TC-DLYM-001`.
7. **Komponen Sistem Terdampak:** `MorningCommitmentView.vue` (Post-Submit Zero Commitment State).
8. **Perkiraan Jenis Perubahan Teknis:** Penambahan fungsi formatter/mapping teks enum ke bahasa bisnis.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Enum `NOT_APPLICABLE_NO_COMMITMENT` tidak pernah terlihat oleh pengguna akhir di layar browser.

#### [IMP-031] Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work
1. **Finding ID & Judul Asli:** `IMP-031` — Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work
2. **Deskripsi Masalah Asli:** Subtitle halaman pekerjaan tambahan memuat string bocor nomor prototipe `(Prototipe 03)`.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/daily/AdditionalWorkView.vue` baris 210, heading subtitle tertulis: *"Catat Penugasan Mendadak Di Luar Komitmen Pagi (Prototipe 03)"*.
4. **Expected Outcome:** Sesuai Prototipe 03, string `(Prototipe 03)` dihapus sehingga menjadi: *"Catat penugasan mendadak atau pekerjaan insidental di luar komitmen pagi."*
5. **Kebutuhan Solusi Remediasi:** Pembersihan string nama prototipe pada subtitle halaman.
6. **Bukti Pendukung & Lokasi Sumber:** `AdditionalWorkView.vue` L210; Prototipe `03-Additional-Work.html` L70; Test Case: `TC-DLYA-001`.
7. **Komponen Sistem Terdampak:** `AdditionalWorkView.vue` (Page Heading Subtitle).
8. **Perkiraan Jenis Perubahan Teknis:** Pembersihan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** String "(Prototipe 03)" tereliminasi 100% dari halaman Additional Work.

#### [IMP-032] Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work
1. **Finding ID & Judul Asli:** `IMP-032` — Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work
2. **Deskripsi Masalah Asli:** Kolom dropdown atasan penugas mengalami penyempitan dan overflow horizontal saat menampilkan nama atasan atau email berformat panjang pada grid dua kolom.
3. **Kondisi Aktual yang Ditemukan:** Pada `AdditionalWorkView.vue` baris 320–350, kontainer form grid kaku menyebabkan dropdown terpotong (*overflow truncated*) pada layar laptop standar.
4. **Expected Outcome:** Sesuai rancangan responsif Prototipe 03, grid disesuaikan menggunakan `minmax` yang fleksibel atau breakpoint yang memindahkan kolom input atasan ke baris baru saat ruang sempit.
5. **Kebutuhan Solusi Remediasi:** Penyesuaian layout grid CSS pada baris input atasan penugas.
6. **Bukti Pendukung & Lokasi Sumber:** `AdditionalWorkView.vue` L320–350; Prototipe `03-Additional-Work.html` L120–140; Test Case: `TC-DLYA-001`.
7. **Komponen Sistem Terdampak:** `AdditionalWorkView.vue` (Form Grid Layout).
8. **Perkiraan Jenis Perubahan Teknis:** Modifikasi CSS Grid styling.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Nama atasan dan email panjang ditampilkan utuh tanpa terpotong atau menimbulkan scroll horizontal form.

#### [IMP-033] Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome
1. **Finding ID & Judul Asli:** `IMP-033` — Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome
2. **Deskripsi Masalah Asli:** Panel metrik waktu di halaman evaluasi sore menampilkan metrik teknis yang kurang relevan bagi evaluasi capaian kerja.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/daily/EodOutcomeView.vue` baris 410–440, kartu konteks waktu memuat 4 kartu padat yang mengulang informasi morning.
4. **Expected Outcome:** Sesuai Prototipe 04 L85–100, panel disederhanakan menjadi 3 kartu kontekstual evaluasi akhir hari yang bersih: (1) Tanggal Evaluasi, (2) Batas Waktu EOD (17:00 WIB), dan (3) Ringkasan Capaian Harian.
5. **Kebutuhan Solusi Remediasi:** Restrukturisasi layout grid dan kartu konteks waktu EOD.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L410–440; Prototipe `04-EOD-Outcome.html` L85–100; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Context Metric Cards).
8. **Perkiraan Jenis Perubahan Teknis:** Restrukturisasi template HTML dan grid CSS.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Panel metrik EOD menampilkan tepat 3 kartu konteks yang rapi sesuai Prototipe 04.

#### [IMP-034] Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome
1. **Finding ID & Judul Asli:** `IMP-034` — Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome
2. **Deskripsi Masalah Asli:** Subtitle halaman EOD Outcome memuat string bocor nomor prototipe `(Prototipe 04)`.
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 450, heading subtitle tertulis: *"Evaluasi Capaian Komitmen & Tugas Tambahan (Prototipe 04)"*.
4. **Expected Outcome:** Sesuai Prototipe 04, string `(Prototipe 04)` dihapus sehingga menjadi: *"Evaluasi capaian komitmen harian dan laporkan tugas tambahan dengan objektif."*
5. **Kebutuhan Solusi Remediasi:** Pembersihan string nama prototipe pada subtitle halaman.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L450; Prototipe `04-EOD-Outcome.html` L70; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Page Heading Subtitle).
8. **Perkiraan Jenis Perubahan Teknis:** Pembersihan teks template HTML/Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** String "(Prototipe 04)" tereliminasi 100% dari halaman EOD Outcome.

#### [IMP-035] Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD
1. **Finding ID & Judul Asli:** `IMP-035` — Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD
2. **Deskripsi Masalah Asli:** Label seksi catatan refleksi mandiri EOD mencantumkan kode arsitektur internal `(Audit DEC-003)`.
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 510, heading seksi refleksi tertulis: *"Catatan Refleksi Mandiri (Audit DEC-003)"*.
4. **Expected Outcome:** Sesuai Prototipe 04 L180, string `(Audit DEC-003)` dibuang dan digantikan narasi humanis yang mendorong pembelajaran profesional: *"Catatan Refleksi & Pembelajaran Mandiri"*.
5. **Kebutuhan Solusi Remediasi:** Pembersihan kode arsitektur internal dan penyempurnaan copywriting seksi refleksi.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L510; Prototipe `04-EOD-Outcome.html` L180; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Self-Reflection Section).
8. **Perkiraan Jenis Perubahan Teknis:** Pembersihan teks template Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** String "DEC-003" hilang dari seksi refleksi dan berganti label yang profesional.

#### [IMP-036] Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD
1. **Finding ID & Judul Asli:** `IMP-036` — Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD
2. **Deskripsi Masalah Asli:** Tombol radio status evaluasi komitmen menampilkan nama kode enum mentah basis data (`NOT_COMPLETED`, `CONTINUE`, `DO_NOT_CONTINUE`), bukan label bahasa bisnis.
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 620–660, opsi radio merender label kode enum mentah tanpa pemetaan bahasa Indonesia.
4. **Expected Outcome:** Sesuai Prototipe 04 L130–165, kode teknis digantikan label ramah: *"Selesai Sempurna"*, *"Tidak Selesai"*, *"Lanjut Esok Hari"*, dan *"Tidak Dilanjutkan"*.
5. **Kebutuhan Solusi Remediasi:** Pemetaan enum evaluasi menjadi label bahasa bisnis pada template formulir EOD.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L620–660; Prototipe `04-EOD-Outcome.html` L130–165; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Evaluation Radio Options).
8. **Perkiraan Jenis Perubahan Teknis:** Penambahan label mapping pada template radio input.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Seluruh nama enum mentah tergantikan label bahasa bisnis resmi pada opsi radio evaluasi EOD.

#### [IMP-037] Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)
1. **Finding ID & Judul Asli:** `IMP-037` — Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)
2. **Deskripsi Masalah Asli:** Textarea input alasan/kelanjutan tugas saat opsi "Lanjut Esok Hari" dipilih berukuran sempit dan terjepit di kolom kanan, menyulitkan pengetikan catatan panjang.
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 680–710, elemen textarea berbagi lebar kolom secara kaku dengan tombol radio.
4. **Expected Outcome:** Sesuai Prototipe 04 L170, textarea kelanjutan tugas membentang penuh 100% (*full-width block*) di bawah opsi radio dengan label vertikal yang ergonomis.
5. **Kebutuhan Solusi Remediasi:** Penyesuaian layout CSS dan penataan struktur form textarea catatan kelanjutan tugas.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L680–710; Prototipe `04-EOD-Outcome.html` L170; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Carry-Over Textarea Form Block).
8. **Perkiraan Jenis Perubahan Teknis:** Penyesuaian CSS styling form full-width.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Textarea catatan kelanjutan tugas membentang 100% lebar kontainer secara proporsional.

#### [IMP-038] Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)
1. **Finding ID & Judul Asli:** `IMP-038` — Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)
2. **Deskripsi Masalah Asli:** Pekerjaan tambahan pada evaluasi sore hanya menyediakan opsi "Selesai" dan "Belum Selesai", belum memiliki opsi "Dibatalkan" dan alur kelanjutan/alasan yang setara dengan komitmen utama.
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 750–790, blok evaluasi pekerjaan tambahan tidak memiliki radio status CANCELLED dan tidak memunculkan input alasan pembatalan/kelanjutan.
4. **Expected Outcome:** Sesuai PRD v1.6 §2.4 dan Prototipe 04 L190–210, pekerjaan tambahan memiliki opsi evaluasi yang setara: Selesai, Tidak Selesai (dengan opsi kelanjutan), dan Dibatalkan (dengan input alasan).
5. **Kebutuhan Solusi Remediasi:** Penambahan opsi radio status evaluasi pekerjaan tambahan dan conditional form input alasan/kelanjutan.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L750–790; Prototipe `04-EOD-Outcome.html` L190–210; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Additional Work Evaluation Logic & Form).
8. **Perkiraan Jenis Perubahan Teknis:** Penambahan state, validation, dan template input evaluasi pekerjaan tambahan.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Tersedia opsi "Dibatalkan" beserta input catatan pada setiap evaluasi pekerjaan tambahan.

#### [IMP-039] Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis
1. **Finding ID & Judul Asli:** `IMP-039` — Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis
2. **Deskripsi Masalah Asli:** Badge penanda alasan pekerjaan tambahan menampilkan string enum mentah basis data (misal: `CLIENT_REQUEST`, `URGENT_UNPLANNED`, `ASSIGNED_BY_SUPERVISOR`).
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 740, badge merender: `<span class="badge">{{ task.reasonCategory }}</span>` secara mentah.
4. **Expected Outcome:** Sesuai Prototipe 04 L195, enum mentah dipetakan menjadi label ramah: *"Permintaan Klien"*, *"Mendesak / Insidental"*, dan *"Penugasan Atasan"*.
5. **Kebutuhan Solusi Remediasi:** Penambahan fungsi formatter kamus data untuk menerjemahkan enum kategori alasan ke bahasa bisnis.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L740; Prototipe `04-EOD-Outcome.html` L195; Test Case: `TC-DLYE-001`.
7. **Komponen Sistem Terdampak:** `EodOutcomeView.vue` (Reason Category Badge Formatter).
8. **Perkiraan Jenis Perubahan Teknis:** Penambahan fungsi pemformatan label pada script/helper.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Seluruh badge alasan pekerjaan tambahan tampil dalam bahasa Indonesia resmi tanpa karakter garis bawah (_).

---

### Kluster Manajemen Pelaporan Kendala / Blocker (IMP-040 s.d. IMP-044)

#### [IMP-040] Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)
1. **Finding ID & Judul Asli:** `IMP-040` — Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)
2. **Deskripsi Masalah Asli:** Tombol "Lapor Blocker" pada sebagian tampilan harian memicu dialog modal pop-up lokal yang sempit dan redundant, alih-alih mengarahkan pengguna ke rute formulir resmi.
3. **Kondisi Aktual yang Ditemukan:** Pada `EodOutcomeView.vue` baris 480, klik tombol memicu dialog modal terisolasi dengan fungsionalitas terbatas.
4. **Expected Outcome:** Sesuai Prototipe 02, 03, dan 04, seluruh tombol `+ Lapor Blocker` mengarahkan navigasi langsung ke rute formulir resmi `/blockers/raise`.
5. **Kebutuhan Solusi Remediasi:** Pengalihan event handler tombol menjadi navigasi rute resmi dan eliminasi markup dialog modal lokal.
6. **Bukti Pendukung & Lokasi Sumber:** `EodOutcomeView.vue` L480; `MorningCommitmentView.vue` L810; Prototipe 05; Test Case: `TC-BLKR-001`.
7. **Komponen Sistem Terdampak:** Header tombol harian dan pembersihan modal dialog lokal.
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan binding router navigasi dan penghapusan modal component.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Klik tombol "+ Lapor Blocker" pada seluruh layar harian mengarahkan browser langsung ke `/blockers/raise`.

#### [IMP-041] Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)
1. **Finding ID & Judul Asli:** `IMP-041` — Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)
2. **Deskripsi Masalah Asli:** Halaman `/blockers/raise` belum memiliki tombol navigasi kembali, judul halaman tidak selaras, dan belum menerapkan sistem 2 tab (Buat Laporan & Blocker Saya) untuk memudahkan staf memantau tiket yang diajukannya.
3. **Kondisi Aktual yang Ditemukan:** Pada `frontend/src/views/blockers/RaiseBlockerView.vue` baris 175–220, halaman hanya menampilkan form vertikal tunggal tanpa tombol kembali dan tanpa tab pemantauan tiket staf.
4. **Expected Outcome:** Sesuai Prototipe 05 (`05-Raise-Instant-Blocker.html` L110–150), halaman memiliki: tombol kembali `"← Kembali ke My Today"`, judul `"Laporkan Kendala Seketika"`, dan sistem 2 tab (`Buat Laporan Baru` dan `Daftar Blocker Saya`).
5. **Kebutuhan Solusi Remediasi:** Restrukturisasi arsitektur template halaman `RaiseBlockerView.vue` dengan navigasi kembali dan sistem tab interaktif.
6. **Bukti Pendukung & Lokasi Sumber:** `RaiseBlockerView.vue` L175–220; Prototipe `05-Raise-Instant-Blocker.html` L110–150; Test Case: `TC-BLKR-001`.
7. **Komponen Sistem Terdampak:** `RaiseBlockerView.vue` (Page Structure & Tab Container).
8. **Perkiraan Jenis Perubahan Teknis:** Restrukturisasi template Vue dan state pengelolaan tab aktif.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Halaman `/blockers/raise` memiliki tombol kembali ke My Today dan sistem 2 tab yang berfungsi aktif.

#### [IMP-042] Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan
1. **Finding ID & Judul Asli:** `IMP-042` — Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan
2. **Deskripsi Masalah Asli:** Formulir pelaporan blocker staf memuat tombol `"Lihat Antrean Blocker Aktif"` yang mengarahkan ke halaman manajerial resolusi kendala, menimbulkan kebingungan wewenang peran staf biasa.
3. **Kondisi Aktual yang Ditemukan:** Pada `RaiseBlockerView.vue` baris 215, terdapat tombol sekunder menuju antrean manajerial `/blockers`.
4. **Expected Outcome:** Sesuai tata kelola peran PRD v1.6 §3.2 dan Prototipe 05, staf biasa tidak diarahkan ke antrean manajerial; tombol tersebut dieliminasi dari alur pelaporan staf.
5. **Kebutuhan Solusi Remediasi:** Penghapusan tombol tautan antrean manajerial dari tampilan pelaporan staf.
6. **Bukti Pendukung & Lokasi Sumber:** `RaiseBlockerView.vue` L215; Prototipe `05-Raise-Instant-Blocker.html` L125; Test Case: `TC-BLKR-001`.
7. **Komponen Sistem Terdampak:** `RaiseBlockerView.vue` (Header / Form Action Links).
8. **Perkiraan Jenis Perubahan Teknis:** Penghapusan elemen tombol pada template Vue.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Tombol "Lihat Antrean Blocker Aktif" tereliminasi dari formulir pelaporan kendala staf.

#### [IMP-043] Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi
1. **Finding ID & Judul Asli:** `IMP-043` — Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi
2. **Deskripsi Masalah Asli:** Breadcrumb kiri atas halaman blocker tertulis `Blocker / Laporkan Kendala Cepat (Prototipe 05)`, memuat string bocor prototipe; sisi kanan memuat tombol manajerial dan kehilangan avatar inisial.
3. **Kondisi Aktual yang Ditemukan:** Pada `RaiseBlockerView.vue` baris 155–172, header lokal memuat string `(Prototipe 05)` dan tombol teks `Antrean Tiket` serta `Aging Radar`.
4. **Expected Outcome:** Sesuai Prototipe 05 L75–82, topbar blocker menampilkan breadcrumb resmi `Workspace / Laporkan & Pantau Blocker` dan avatar inisial bulat standar.
5. **Kebutuhan Solusi Remediasi:** Penggantian header lokal blocker dengan integrasi komponen topbar terstandarisasi.
6. **Bukti Pendukung & Lokasi Sumber:** `RaiseBlockerView.vue` L155–172; Prototipe `05-Raise-Instant-Blocker.html` L75–82; Test Case: `TC-BLKR-001`.
7. **Komponen Sistem Terdampak:** `RaiseBlockerView.vue` (Header Topbar Area).
8. **Perkiraan Jenis Perubahan Teknis:** Penggantian tag `<header>` lokal dengan pemanggilan shared topbar.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** Breadcrumb bertuliskan "Workspace / Laporkan & Pantau Blocker" tanpa string "(Prototipe 05)", dan avatar inisial tampil di kanan.

#### [IMP-044] Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim
1. **Finding ID & Judul Asli:** `IMP-044` — Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim
2. **Deskripsi Masalah Asli:** Footer form blocker memuat referensi kode internal `(Audit Trail DEC-008)` dan tombol pembatalan mengarahkan kembali ke antrean tiket yang salah sasaran.
3. **Kondisi Aktual yang Ditemukan:** Pada `RaiseBlockerView.vue` baris 480–510, footer form mencantumkan teks `(Audit Trail DEC-008)` dan tombol Batal memiliki rute `router.push('/blockers')`.
4. **Expected Outcome:** Sesuai Prototipe 05 L310–330, string audit internal dibuang; tombol aksi diselaraskan menjadi tombol sekunder `"Bersihkan Formulir"` (reset field) dan tombol primer `"Kirim Laporan Blocker"`.
5. **Kebutuhan Solusi Remediasi:** Pembersihan teks kode audit dan konfigurasi ulang tombol aksi footer form blocker.
6. **Bukti Pendukung & Lokasi Sumber:** `RaiseBlockerView.vue` L480–510; Prototipe `05-Raise-Instant-Blocker.html` L310–330; Test Case: `TC-BLKR-001`.
7. **Komponen Sistem Terdampak:** `RaiseBlockerView.vue` (Form Footer Action Area).
8. **Perkiraan Jenis Perubahan Teknis:** Perubahan label, event handler reset form, dan pembersihan teks template.
9. **Ketidakpastian / Informasi Belum Tersedia:** Tidak ada.
10. **Acceptance Criteria Mandiri:** String "DEC-008" tereliminasi, tombol sekunder berfungsi sebagai reset form tanpa redirect ke antrean manajerial.

---

## 3. STAGE B: IDENTIFIKASI KANDIDAT SOLUSI TERPADU

Berdasarkan analisis individual di atas, tim software architect mengidentifikasi pasangan atau kelompok temuan yang **secara nyata memiliki tumpang-tindih solusi remediasi teknis (*remediation solution overlap*)**, serta memisahkannya dari temuan yang memerlukan solusi mandiri:

```
PETA IDENTIFIKASI KANDIDAT SOLUSI TERPADU:
====================================================================================================
Kandidat Kelompok Terpadu:
[KANDIDAT 1: Auth Hero Presentation]      --> IMP-001, IMP-002, IMP-003, IMP-004, IMP-005, IMP-006, IMP-012
[KANDIDAT 2: Login Form Microcopy]        --> IMP-007, IMP-008, IMP-009, IMP-010
[KANDIDAT 3: Global Shell Topbar Package] --> IMP-014, IMP-018, IMP-019, IMP-020, IMP-024, IMP-025, IMP-043
[KANDIDAT 4: Blocker Navigation Pointers] --> IMP-016, IMP-040
[KANDIDAT 5: Profile Layout & Account]    --> IMP-021, IMP-022
[KANDIDAT 6: Morning Policy Microcopy]    --> IMP-028, IMP-029, IMP-030
[KANDIDAT 7: EOD Evaluation Parity]       --> IMP-036, IMP-038, IMP-039
[KANDIDAT 8: Blocker Form Layout Clean]   --> IMP-041, IMP-042, IMP-044

Temuan yang Menunggu Keputusan / Bukti (REVIEW):
[REVIEW 1: Prosedur Lupa Kata Sandi]     --> IMP-011 (Menunggu Arah Produk Helpdesk vs SMTP)
[REVIEW 2: Lonceng Notifikasi Header]    --> IMP-015 (Menunggu Arah Produk Direct Link vs Live Counter)

Temuan Mandiri Murni (STANDALONE):
[STANDALONE] --> IMP-013 (QA Test Suite Hardening - Bukan Perubahan Kode Aplikasi)
[STANDALONE] --> IMP-017 (String Tunggal Sidebar Subtitle: EnterpriseSidebar.vue L135)
[STANDALONE] --> IMP-023 (Error Recovery Route 403: ErrorPageView.vue L25-27)
[STANDALONE] --> IMP-026 (RBAC Navigation Filter: router/navigation.ts L50-63)
[STANDALONE] --> IMP-027 (Restrukturisasi Kartu Metrik Pagi: MorningCommitmentView.vue Grid)
[STANDALONE] --> IMP-031 (Eliminasi Teks '(Prototipe 03)': AdditionalWorkView.vue Subtitle)
[STANDALONE] --> IMP-032 (Perbaikan CSS Grid Dropdown Atasan: AdditionalWorkView.vue CSS)
[STANDALONE] --> IMP-033 (Restrukturisasi Kartu Metrik EOD: EodOutcomeView.vue Grid)
[STANDALONE] --> IMP-034 (Eliminasi Teks '(Prototipe 04)': EodOutcomeView.vue Subtitle)
[STANDALONE] --> IMP-035 (Eliminasi Kode 'DEC-003' Refleksi: EodOutcomeView.vue Subtitle)
[STANDALONE] --> IMP-037 (Pelebaran Textarea 100% Full-Width: EodOutcomeView.vue CSS)
====================================================================================================
```

---

## 4. STAGE C: EVALUASI KRITERIA PENGELOMPOKAN BERBASIS SOLUSI

Setiap kandidat diuji secara ketat terhadap **Enam Kriteria Solution-Based Clustering Versi 1.1**:

### 1. Kandidat 1: Auth Hero Presentation Package (`IMP-001`, `IMP-002`, `IMP-003`, `IMP-004`, `IMP-005`, `IMP-006`, `IMP-012`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. Seluruhnya bersumber dari ketidakselarasan naskah narasi hero panel kiri, format icon Unicode, dan duplikasi styling antara login dan aktivasi.
  2. *Expected Outcome Convergence:* Memenuhi. Menghasilkan satu panel hero kiri kanonikal yang seragam, berikon SVG tajam, dan selaras antara login dan aktivasi.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI SECARA KUAT.** Satu paket pemutakhiran template hero panel kiri (atau pembuatan komponen terbagi `AuthHeroStory.vue`) secara langsung menuntaskan narasi hero (`IMP-001`), ketiga pilar teks (`IMP-002`, `IMP-003`, `IMP-004`, `IMP-005`), ikon SVG (`IMP-006`), dan keselarasan layout tab aktivasi (`IMP-012`) tanpa pekerjaan mandiri terpisah.
  4. *Remediation Package Cohesion:* Memenuhi. Satu paket perubahan file yang kohesif pada domain visual autentikasi.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup terisolasi penuh pada panel hero sisi kiri portal masuk.
  6. *Independent AC Preservation:* Memenuhi. Masing-masing teks pilar dan ikon SVG memiliki kriteria pengujian mandiri yang terverifikasi.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: Auth Hero Presentation)**

### 2. Kandidat 2: Login Form Microcopy Package (`IMP-007`, `IMP-008`, `IMP-009`, `IMP-010`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. Seluruhnya merupakan masalah redaksional kaku dan kebocoran istilah teknis pada kolom kanan form login `LoginView.vue`.
  2. *Expected Outcome Convergence:* Memenuhi. Menghasilkan form login kanan yang ramah, inklusif, dan bebas dari jargon teknis cookie/arsitektur.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI.** Satu sesi pembaruan naskah template pada form login kanan `LoginView.vue` secara langsung menyelesaikan headline inklusif (`IMP-007`), pembersihan versi rilis (`IMP-008`), label workspace (`IMP-009`), dan teks bantuan akses (`IMP-010`).
  4. *Remediation Package Cohesion:* Memenuhi. Seluruh perubahan berada pada blok template form kanan yang sama.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup sangat padat dan minim risiko teknis.
  6. *Independent AC Preservation:* Memenuhi. Setiap string teks diuji pemenuhannya secara terpisah.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: Login Form Microcopy)**

### 3. Kandidat 3: Global Shell Topbar Package (`IMP-014`, `IMP-018`, `IMP-019`, `IMP-020`, `IMP-024`, `IMP-025`, `IMP-043`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. Seluruhnya bersumber dari desentralisasi header bar di berbagai modul yang memicu inkonsistensi avatar, breadcrumb bocor, tombol teks duplikat, dan badge logo WP redundan.
  2. *Expected Outcome Convergence:* Memenuhi. Menghasilkan satu standar topbar global enterprise yang bersih: breadcrumb di kiri, avatar inisial bulat 2 huruf di kanan.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI SECARA WAJAR & KOHESIF.** Pembangunan komponen `AppTopbar.vue` didukung utilitas avatar 2 huruf (`IMP-020`) yang diintegrasikan ke seluruh view secara langsung menggantikan teks profil harian (`IMP-014`), membersihkan logo WP profil (`IMP-018`), menata breadcrumb dan avatar admin (`IMP-024`, `IMP-025`), serta mengeliminasi teks bocor prototipe dan tombol manajerial pada blocker (`IMP-043`). Tidak ada pekerjaan terpisah yang substansial.
  4. *Remediation Package Cohesion:* Memenuhi. Satu paket arsitektur shell dan migrasi komponen bersama.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup tegas pada area topbar navigasi atas aplikasi.
  6. *Independent AC Preservation:* Memenuhi. Setiap view mempertahankan kriteria pengujian breadcrumb dan elemen lokalnya (misal: verifikasi ketiadaan teks `(Prototipe 05)` pada blocker).
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: Global Shell Topbar Architecture)**

### 4. Kandidat 4: Blocker Navigation Pointers (`IMP-016`, `IMP-040`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. `IMP-016` menuntut tombol "+ Lapor Blocker" konsisten pada 3 tab harian, sedangkan `IMP-040` menuntut tombol tersebut mengarahkan langsung ke rute resmi `/blockers/raise` (tanpa modal popup).
  2. *Expected Outcome Convergence:* Memenuhi. Terwujud satu mekanisme pemicu eskalasi kendala yang seragam dan langsung mengalirkan staf ke form pelaporan resmi.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI.** Mengonfigurasi tombol CTA `+ Lapor Blocker` dengan event `router.push('/blockers/raise')` secara seragam pada ketiga tab harian menyelesaikan kedua temuan secara langsung dalam satu pekerjaan integrasi.
  4. *Remediation Package Cohesion:* Memenuhi. Perubahan menyentuh tombol aksi tab harian yang identik.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup sangat ramping dan berfokus pada pemicu navigasi.
  6. *Independent AC Preservation:* Memenuhi. Keterujian posisi tombol (AC IMP-016) dan rute navigasi (AC IMP-040) tetap independen.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: Blocker Navigation CTA Pointers)**

### 5. Kandidat 5: Profile Layout & Identity Presentation (`IMP-021`, `IMP-022`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. `IMP-021` memisahkan nama dan jabatan, sedangkan `IMP-022` menata ulang seluruh body profil menjadi 3 seksi sesuai Prototipe 24.
  2. *Expected Outcome Convergence:* Memenuhi. Halaman profil akun yang terstruktur rapi dengan penyajian identitas profesional yang bermartabat.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI.** Restrukturisasi layout template `ProfileView.vue` mengikuti Prototipe 24 secara alami mencakup penataan kartu identitas (pemisahan nama dan jabatan). Keduanya diselesaikan dalam satu kali perombakan template profil.
  4. *Remediation Package Cohesion:* Memenuhi. Terpusat pada satu file view `ProfileView.vue`.
  5. *Scope Coherence & Manageability:* Memenuhi. Terisolasi penuh pada modul pengaturan profil akun.
  6. *Independent AC Preservation:* Memenuhi. Kriteria pemisahan tipografi nama-jabatan dan pembagian 3 seksi tetap diverifikasi terpisah.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: User Profile Account Layout)**

### 6. Kandidat 6: Morning Policy Microcopy Package (`IMP-028`, `IMP-029`, `IMP-030`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. Ketiganya merupakan perbaikan bahasa kebijakan pada form komitmen pagi: banner late window (`IMP-028`), checkbox deklarasi nol (`IMP-029`), dan penjelasan enum komitmen nol (`IMP-030`).
  2. *Expected Outcome Convergence:* Memenuhi. Formulir komitmen pagi yang ramah, manusiawi, dan bebas dari istilah asing maupun kode audit internal.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI.** Satu sesi pembaruan naskah kebijakan pada komponen `MorningCommitmentView.vue` menyelesaikan pembersihan istilah "Grace Period", pembuangan kode "DEC-004", dan mapping enum `NOT_APPLICABLE_NO_COMMITMENT` menjadi bahasa bisnis.
  4. *Remediation Package Cohesion:* Memenuhi. Berada pada file dan domain logika form Morning yang sama.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup redaksional kebijakan yang padat dan aman.
  6. *Independent AC Preservation:* Memenuhi. Masing-masing pesan banner, checkbox, dan status memiliki verifikasi mandiri.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: Morning Policy Microcopy)**

### 7. Kandidat 7: EOD Evaluation Parity & Label Package (`IMP-036`, `IMP-038`, `IMP-039`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. Seluruhnya menyangkut logika penyajian evaluasi sore pada `EodOutcomeView.vue`: nama enum mentah evaluasi (`IMP-036`), ketiadaan opsi Dibatalkan tugas tambahan (`IMP-038`), dan format badge alasan tugas tambahan (`IMP-039`).
  2. *Expected Outcome Convergence:* Memenuhi. Form evaluasi sore yang lengkap fiturnya (setara antara komitmen utama dan pekerjaan tambahan) dan bersih dari kode teknis basis data.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI.** Paket pembaruan logika evaluasi tugas tambahan dan kamus data formatter label pada `EodOutcomeView.vue` secara terpadu menyediakan opsi CANCELLED beserta mapping label bisnis untuk seluruh opsi evaluasi sore.
  4. *Remediation Package Cohesion:* Memenuhi. Terpadu pada komponen formulir evaluasi sore.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup terkendali pada interaksi evaluasi hasil kerja staf.
  6. *Independent AC Preservation:* Memenuhi. Keberadaan opsi CANCELLED dan keterbacaan label bisnis diuji secara spesifik.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: EOD Outcome Evaluation Parity)**

### 8. Kandidat 8: Blocker Form Layout & Clean-up Package (`IMP-041`, `IMP-042`, `IMP-044`)
- **Uji Kriteria:**
  1. *Problem & Remediation Relatedness:* Memenuhi. Ketiganya merupakan rekonstruksi formulir pelaporan kendala pada `RaiseBlockerView.vue`: tombol kembali & sistem 2 tab (`IMP-041`), penghapusan tombol antrean manajerial (`IMP-042`), dan pembersihan footer dari kode DEC-008 serta perbaikan tombol reset/kirim (`IMP-044`).
  2. *Expected Outcome Convergence:* Memenuhi. Halaman `/blockers/raise` yang profesional sesuai Prototipe 05 dengan alur pelaporan mandiri staf yang ergonomis.
  3. *Solution Identity (Prinsip Inti):* **MEMENUHI.** Rekonstruksi struktur body halaman `RaiseBlockerView.vue` sesuai Prototipe 05 secara langsung menyediakan layout 2 tab, menghapus tombol antrean manajerial yang salah sasaran, membuang teks audit "DEC-008", dan membetulkan tombol aksi reset/kirim.
  4. *Remediation Package Cohesion:* Memenuhi. Seluruh perubahan terisolasi pada body file `RaiseBlockerView.vue`.
  5. *Scope Coherence & Manageability:* Memenuhi. Lingkup padat pada modul pelaporan kendala staf.
  6. *Independent AC Preservation:* Memenuhi. Fungsi tab, hilangnya tombol manajerial, dan aksi reset form diverifikasi terpisah.
- **Rekomendasi Keputusan:** **`GROUP` (Kluster Solusi: Blocker Form Body & Layout Clean-up)**

---

### 9. Evaluasi Temuan yang Tidak Memiliki Overlap Solusi Substansial (Ditetapkan `STANDALONE`)

Sebanyak **11 temuan** terbukti tidak memiliki tumpang-tindih solusi yang substansial dengan temuan lain dan **ditetapkan sebagai `STANDALONE` murni berdasarkan fakta teknis**:

1. **`IMP-013` (Skenario Uji Akun Nonaktif & Rate Limit):**  
   *Justifikasi:* Merupakan penambahan automated test suite dan dokumen QA, bukan perubahan kode aplikasi. Wajib mandiri.
2. **`IMP-017` (Caption Subtitle Brand Sidebar):**  
   *Justifikasi:* Perubahan satu baris teks statis pada `EnterpriseSidebar.vue` baris 135 (*"Dutamedia Intranet"* $\rightarrow$ *"Dutamedia Accountability"*). Tidak memiliki kesamaan solusi kode dengan topbar maupun formulir login.
3. **`IMP-023` (Rute Pemulihan Layar 403 Kanonikal Peran):**  
   *Justifikasi:* Terisolasi eksklusif pada fungsi navigasi tombol pemulihan error di `ErrorPageView.vue` baris 25–27.
4. **`IMP-026` (RBAC Workspace bagi SYSTEM_ADMIN):**  
   *Justifikasi:* Penegakan aturan otorisasi router navigasi pada `router/navigation.ts` baris 50–63. Murni konfigurasi keamanan hak akses.
5. **`IMP-027` (Restrukturisasi Kartu Metrik Morning Commitment):**  
   *Justifikasi:* Merupakan rekayasa layout grid dan penataan komponen kartu jadwal pagi (dari 4 menjadi 3 kartu). Solusi layout visual ini independen dari pembersihan naskah teks kebijakan (`IMP-028` s.d. `IMP-030`).
6. **`IMP-031` (Eliminasi Teks '(Prototipe 03)' pada Subtitle Additional Work):**  
   *Justifikasi:* Koreksi teks statis tunggal pada heading `AdditionalWorkView.vue` baris 210.
7. **`IMP-032` (Perbaikan CSS Grid Dropdown Atasan Penugas):**  
   *Justifikasi:* Bugfix layout CSS spesifik untuk mengatasi overflow horizontal pada kolom input atasan di `AdditionalWorkView.vue` baris 320–350. Tidak berbagi solusi kode dengan evaluasi EOD.
8. **`IMP-033` (Restrukturisasi Kartu Metrik Konteks Waktu EOD):**  
   *Justifikasi:* Rekayasa layout grid kartu waktu evaluasi sore pada `EodOutcomeView.vue` baris 410–440. Independen dari logika evaluasi tugas.
9. **`IMP-034` (Eliminasi Teks '(Prototipe 04)' pada Subtitle EOD Outcome):**  
   *Justifikasi:* Koreksi teks statis tunggal pada heading `EodOutcomeView.vue` baris 450.
10. **`IMP-035` (Eliminasi Kode 'DEC-003' Seksi Refleksi Mandiri):**  
    *Justifikasi:* Koreksi label statis pada heading refleksi `EodOutcomeView.vue` baris 510.
11. **`IMP-037` (Pelebaran Textarea Catatan Kelanjutan Tugas EOD 100%):**  
    *Justifikasi:* Bugfix styling CSS form block agar textarea kelanjutan membentang penuh 100% pada `EodOutcomeView.vue` baris 680–710.

---

## 5. REGISTER RESOLUSI TEMUAN STATUS REVIEW

Dua temuan ditetapkan berstatus **`REVIEW`** dan didokumentasikan lengkap sesuai 4 komponen resolusi wajib:

### 1. `IMP-011` — Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
- **Finding ID & Judul:** `IMP-011` — Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"
- **1. Alasan Status REVIEW:** Arah kebijakan produk organisasi mengenai penanganan lupa kata sandi belum ditetapkan oleh Acceptance Owner (apakah bantuan manual IT/HRGA atau sistem self-service).
- **2. Ketidakpastian / Bukti Belum Tersedia:** Belum ada keputusan apakah sistem WorkPulse intranet memerlukan integrasi SMTP email gateway untuk reset password atau cukup panduan bantuan administratif.
- **3. Keputusan / Investigasi yang Diperlukan:** Keputusan produk dari Acceptance Owner (Pak Harry) antara Alternatif A (Bantuan Administratif) atau Alternatif B (Modul Token SMTP).
- **4. Kondisi Penetapan Akhir:**
  - *Menjadi `GROUP` (bergabung dengan paket Login Form):* Jika dipilih **Alternatif A (Bantuan Administratif)**, karena penanganan cukup berupa modal info kontak HRGA/IT di form login.
  - *Menjadi `STANDALONE` (inisiatif mandiri baru):* Jika dipilih **Alternatif B (Self-Service SMTP)**, karena memerlukan backend service token reset, integrasi SMTP server, dan antarmuka input kata sandi baru.

---

### 2. `IMP-015` — Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
- **Finding ID & Judul:** `IMP-015` — Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah
- **1. Alasan Status REVIEW:** Kebutuhan fungsional ikon lonceng belum terdefinisi apakah sekadar jalan pintas navigasi langsung atau indikator aktif dengan unread counter badge.
- **2. Ketidakpastian / Bukti Belum Tersedia:** Belum ada penetapan arah fitur notifikasi oleh Acceptance Owner, dan belum ada kepastian ketersediaan kontrak backend API unread count.
- **3. Keputusan / Investigasi yang Diperlukan:** Penetapan arah fitur oleh Acceptance Owner antara Alternatif A (Direct Link) atau Alternatif B (Dynamic Counter).
- **4. Kondisi Penetapan Akhir:**
  - *Menjadi `GROUP` (bergabung dengan paket topbar `IMP-019`):* Jika dipilih **Alternatif A (Direct Link Shortcut)**, karena penambahan ikon lonceng statis diserap langsung ke template `AppTopbar.vue` tanpa pekerjaan data independen.
  - *Menjadi `STANDALONE`:* Jika dipilih **Alternatif B (Dynamic Counter Polling/Real-time)**, karena memerlukan pekerjaan backend API, reactive Pinia store, dan background polling yang substansial di luar cakupan topbar layout.

---

## 6. RINGKASAN REKOMENDASI PENGELOMPOKAN & DISTRIBUSI STATUS

Dari total **44 temuan improvement**, evaluasi berbasis solusi Versi 1.1 menghasilkan:
- **31 Temuan** terdistribusi ke dalam **8 Solusi Terpadu (Micro-Clusters)** (70.5%).
- **11 Temuan** berstatus murni **`STANDALONE`** (25.0%).
- **2 Temuan** berstatus transisi aktif **`REVIEW`** (4.5%).

```
REKAPITULASI HASIL EVALUASI SOLUSI:
Total Scope: 44 Improvement Findings (100% Zero Omission)
├── 8 Kluster Solusi Terpadu (31 Temuan)
│   ├── SOL-AUTH-HERO : Auth Hero Presentation Package (7 Temuan: IMP-001..006, IMP-012)
│   ├── SOL-AUTH-FORM : Login Form Microcopy Package (4 Temuan: IMP-007..010)
│   ├── SOL-SHLL-TOPB : Global Shell Topbar Package (7 Temuan: IMP-014, 018, 019, 020, 024, 025, 043)
│   ├── SOL-BLKR-NAVI : Blocker Navigation CTA Pointers (2 Temuan: IMP-016, IMP-040)
│   ├── SOL-PROF-LAYO : User Profile Account Layout (2 Temuan: IMP-021, IMP-022)
│   ├── SOL-DLYM-TEXT : Morning Policy Microcopy (3 Temuan: IMP-028, IMP-029, IMP-030)
│   ├── SOL-DLYE-EVAL : EOD Outcome Evaluation Parity (3 Temuan: IMP-036, IMP-038, IMP-039)
│   └── SOL-BLKR-FORM : Blocker Form Body & Layout Clean-up (3 Temuan: IMP-041, IMP-042, IMP-044)
├── Temuan Menunggu Keputusan (2 Temuan)
│   ├── REVIEW : IMP-011 (Prosedur Lupa Kata Sandi)
│   └── REVIEW : IMP-015 (Ikon Lonceng Notifikasi Header Bar)
└── Temuan Mandiri Murni (11 Temuan)
    ├── STANDALONE : IMP-013 (QA Automated Test Suite Hardening)
    ├── STANDALONE : IMP-017 (String Subtitle Sidebar: EnterpriseSidebar.vue L135)
    ├── STANDALONE : IMP-023 (Error Recovery Route 403: ErrorPageView.vue L25-27)
    ├── STANDALONE : IMP-026 (RBAC Navigation Filter: router/navigation.ts L50-63)
    ├── STANDALONE : IMP-027 (Restrukturisasi Grid Kartu Metrik Pagi: MorningCommitmentView.vue)
    ├── STANDALONE : IMP-031 (Eliminasi Teks '(Prototipe 03)': AdditionalWorkView.vue Subtitle)
    ├── STANDALONE : IMP-032 (Perbaikan CSS Grid Dropdown Atasan: AdditionalWorkView.vue CSS)
    ├── STANDALONE : IMP-033 (Restrukturisasi Grid Kartu Metrik EOD: EodOutcomeView.vue)
    ├── STANDALONE : IMP-034 (Eliminasi Teks '(Prototipe 04)': EodOutcomeView.vue Subtitle)
    ├── STANDALONE : IMP-035 (Eliminasi Kode 'DEC-003' Refleksi: EodOutcomeView.vue Subtitle)
    └── STANDALONE : IMP-037 (Pelebaran Textarea 100% Full-Width: EodOutcomeView.vue CSS)
```

---

## 7. MATRIKS KETERTELUSURAN BUKTI & VERIFIKASI (TRACEABILITY REGISTER)

Matriks berikut menjamin bahwa seluruh 44 temuan terpetakan tepat satu kali (*Zero Omission, Zero Duplication*) dan dapat ditelusuri ke bukti kode fisiknya:

| Finding ID | Judul Temuan Backlog | Rekomendasi Status | Penetapan Solusi / Alasan | File Sumber Kode Aktual & Verifikasi |
| :---: | :--- | :---: | :--- | :--- |
| **IMP-001** | Tagline Value Proposition Hero Login | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L80–82; Proto 01 L64 |
| **IMP-002** | Judul Poin Fitur 1 Komitmen Harian | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L88; Proto 01 L72 |
| **IMP-003** | Subtitle Poin Fitur 1 Komitmen Harian | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L89; Proto 01 L73 |
| **IMP-004** | Judul & Subtitle Poin Fitur 2 (Eskalasi) | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L95–96; Proto 01 L80–81 |
| **IMP-005** | Judul & Subtitle Poin Fitur 3 (Evaluasi) | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L102–103; Proto 01 L88–89 |
| **IMP-006** | Ikon Vektor SVG pada 3 Poin Fitur | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L86, L93, L100; Proto 01 |
| **IMP-007** | Headline & Lead Text Form Login | `GROUP` | `SOL-AUTH-FORM` | `LoginView.vue` L126–127; Proto 01 L108 |
| **IMP-008** | Label Versi Sistem di Header Form | `GROUP` | `SOL-AUTH-FORM` | `LoginView.vue` L110; Proto 01 L98 |
| **IMP-009** | Penanda Konteks Workspace Environment | `GROUP` | `SOL-AUTH-FORM` | `LoginView.vue` L125; Proto 01 L106 |
| **IMP-010** | Microcopy Bantuan Akses Pengguna | `GROUP` | `SOL-AUTH-FORM` | `LoginView.vue` L205–207; Proto 01 L155 |
| **IMP-011** | Penanganan Lupa Kata Sandi | `REVIEW` | Menunggu Keputusan Owner | `LoginView.vue` L189 (Register Resolusi 1) |
| **IMP-012** | Keselarasan Visual Hero Login & Aktivasi | `GROUP` | `SOL-AUTH-HERO` | `LoginView.vue` L70; `ActivateView.vue` L15 |
| **IMP-013** | Skenario Uji Akun Nonaktif & Rate Limit | `STANDALONE` | QA Test Hardening Suite | `UAT-Manual-Test-Cases.md` `TC-AUTH-002` |
| **IMP-014** | Tombol Profil Daily Topbar ke Avatar | `GROUP` | `SOL-SHLL-TOPB` | `MorningCommitmentView.vue` L13 |
| **IMP-015** | Lonceng Notifikasi di Header Bar | `REVIEW` | Menunggu Keputusan Owner | `MorningCommitmentView.vue` L12 (Register 2) |
| **IMP-016** | Tombol CTA Lapor Blocker pada 3 Tab | `GROUP` | `SOL-BLKR-NAVI` | `MorningCommitmentView.vue` L810; Proto 02 |
| **IMP-017** | Caption Subtitle Brand Sidebar | `STANDALONE` | Teks Statis Tunggal | `EnterpriseSidebar.vue` L135 |
| **IMP-018** | Eliminasi Badge Duplikat WP di Profil | `GROUP` | `SOL-SHLL-TOPB` | `ProfileView.vue` L88–93 |
| **IMP-019** | Standardisasi Navbar Global Bersih | `GROUP` | `SOL-SHLL-TOPB` (Anchor) | `DefaultLayout.vue` & View Headers |
| **IMP-020** | Algoritma Inisial Avatar 2 Huruf | `GROUP` | `SOL-SHLL-TOPB` (Utility) | `ProfileView.vue` L115; `formatters.ts` |
| **IMP-021** | Pemisahan Nama Lengkap & Jabatan | `GROUP` | `SOL-PROF-LAYO` | `ProfileView.vue` L110–135 |
| **IMP-022** | Restrukturisasi Body Profil 3 Seksi | `GROUP` | `SOL-PROF-LAYO` | `ProfileView.vue` L109–240; Proto 24 |
| **IMP-023** | Rute Pemulihan Error 403 Sesuai Role | `STANDALONE` | Error Navigasi Lokal | `ErrorPageView.vue` L25–27 |
| **IMP-024** | Breadcrumb Hirarkis Topbar Admin | `GROUP` | `SOL-SHLL-TOPB` | `AdminUsersView.vue` L1–15 |
| **IMP-025** | Konsolidasi Menu Duplikat Topbar Admin | `GROUP` | `SOL-SHLL-TOPB` | `AdminUsersView.vue` L10–14 |
| **IMP-026** | Penonaktifan Workspace bagi SYSTEM_ADMIN | `STANDALONE` | RBAC Navigation Policy | `router/navigation.ts` L50–63 |
| **IMP-027** | Restrukturisasi Kartu Konteks Morning | `STANDALONE` | Grid Layout Rework | `MorningCommitmentView.vue` L800–850 |
| **IMP-028** | Microcopy Banner Keterlambatan Morning | `GROUP` | `SOL-DLYM-TEXT` | `MorningCommitmentView.vue` L865 |
| **IMP-029** | Eliminasi Kode Internal DEC-004 | `GROUP` | `SOL-DLYM-TEXT` | `MorningCommitmentView.vue` L910 |
| **IMP-030** | Transformasi Teks Status Komitmen Nol | `GROUP` | `SOL-DLYM-TEXT` | `MorningCommitmentView.vue` L940 |
| **IMP-031** | Eliminasi Teks '(Prototipe 03)' | `STANDALONE` | Teks Statis Subtitle | `AdditionalWorkView.vue` L210 |
| **IMP-032** | Perbaikan Grid Input Atasan Penugas | `STANDALONE` | CSS Grid Truncation Fix | `AdditionalWorkView.vue` L320–350 |
| **IMP-033** | Restrukturisasi Kartu Konteks EOD | `STANDALONE` | Grid Layout Rework | `EodOutcomeView.vue` L410–440 |
| **IMP-034** | Eliminasi Teks '(Prototipe 04)' | `STANDALONE` | Teks Statis Subtitle | `EodOutcomeView.vue` L450 |
| **IMP-035** | Eliminasi Kode Internal DEC-003 | `STANDALONE` | Teks Statis Subtitle | `EodOutcomeView.vue` L510 |
| **IMP-036** | Eliminasi Nama Enum pada Label EOD | `GROUP` | `SOL-DLYE-EVAL` | `EodOutcomeView.vue` L620–660 |
| **IMP-037** | Pelebaran Textarea Catatan Kelanjutan | `STANDALONE` | CSS Full-Width Styling | `EodOutcomeView.vue` L680–710 |
| **IMP-038** | Kesetaraan Evaluasi Tugas Tambahan | `GROUP` | `SOL-DLYE-EVAL` | `EodOutcomeView.vue` L750–790 |
| **IMP-039** | Pemetaan Badge Alasan Kerja Tambahan | `GROUP` | `SOL-DLYE-EVAL` | `EodOutcomeView.vue` L740 |
| **IMP-040** | Pengalihan CTA Lapor Blocker ke Rute | `GROUP` | `SOL-BLKR-NAVI` | `EodOutcomeView.vue` L480; Proto 05 |
| **IMP-041** | Penataan Halaman Blocker (2 Tab) | `GROUP` | `SOL-BLKR-FORM` | `RaiseBlockerView.vue` L175–220 |
| **IMP-042** | Eliminasi Tombol Antrean Manajerial | `GROUP` | `SOL-BLKR-FORM` | `RaiseBlockerView.vue` L215 |
| **IMP-043** | Penyeragaman Topbar Blocker | `GROUP` | `SOL-SHLL-TOPB` | `RaiseBlockerView.vue` L155–172 |
| **IMP-044** | Pembersihan Footer Formulir Blocker | `GROUP` | `SOL-BLKR-FORM` | `RaiseBlockerView.vue` L480–510 |

---

## 8. BATASAN TATA KELOLA & STOP CONDITION

### Kepatuhan terhadap Batasan Ketat:
- Seluruh 44 temuan telah dievaluasi secara individual dan terpetakan dengan integritas 100% tanpa ada temuan yang hilang atau terduplikasi.
- Enam theme clusters lama tidak lagi digunakan sebagai baseline; pemetaan murni mengikuti prinsip *Solution Identity*.
- Tidak ada modifikasi kode sumber, skema basis data, atau data seeder aplikasi.
- Tidak ada perubahan nomor ID maupun deskripsi asli pada master improvement backlog.
- Berkas master ini diterbitkan resmi di `UAT-Lifecycle/Phase-2-Reconciliation/Theme-Clustering/Comprehensive-Solution-Based-Clustering-Report.md` dan dicadangkan ke `Phase-2-Assessment/Theme-Clustering/`.

### Stop Condition:
Evaluasi komprehensif 44 temuan telah selesai sepenuhnya. Sesuai mandat tata kelola, tim **MENGHENTIKAN SELURUH AKSI LANJUTAN** pada titik ini.

Kami menyerahkan laporan komprehensif ini kepada **Pak Harry (Acceptance Owner)** untuk ditinjau secara kritis dan disahkan sebagai baseline resmi pengelompokan sebelum melangkah ke tahapan **Remediation Planning (Cycle Definition)**.

