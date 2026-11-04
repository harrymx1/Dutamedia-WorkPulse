# LAPORAN INVESTIGASI INDIVIDUAL TEMUAN IMPROVEMENT (PHASE 2) — RECONCILED
## WorkPulse — Sistem Akuntabilitas & Transparansi Kerja Harian

| Parameter Tata Kelola | Informasi Dokumen |
| :--- | :--- |
| **Fase Lifecycle** | **Phase 2 — Finding Assessment & Remediation Planning** |
| **Aktivitas** | **Investigasi Individual 44 Temuan Improvement (Reconciled)** |
| **Penyusun** | Lead Software Analyst, Senior QA Engineer, & UAT Architect |
| **Penerima Otoritas** | Harry (Acceptance Owner & Lead Manual UAT Tester, PT Dutamedia Mandiri Pratama) |
| **Cabang Git Aktif** | `remediation/cycle-01-fixes` |
| **Status Dokumen** | **FINAL RECONCILED — COMPLETED INDIVIDUAL DEEP-DIVE** |
| **Tanggal Pembaruan** | 1 November 2026 |

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & Rekonsiliasi Jumlah Temuan](#1-ringkasan-eksekutif--rekonsiliasi-jumlah-temuan)
2. [Metodologi & Pemisahan Tiga Dimensi Investigasi](#2-metodologi--pemisahan-tiga-dimensi-investigasi)
3. [Rekapitulasi Distribusi Validitas Final](#3-rekapitulasi-distribusi-validitas-final)
4. [Laporan Investigasi Terinci (IMP-001 s.d. IMP-044)](#4-laporan-investigasi-terinci-imp-001-sd-imp-044)
5. [Pemetaan Indikasi Hubungan & Overlap Struktural](#5-pemetaan-indikasi-hubungan--overlap-struktural)
6. [Klarifikasi Kebijakan Produk yang Diperlukan (IMP-011 & IMP-015)](#6-klarifikasi-kebijakan-produk-yang-diperlukan-imp-011--imp-015)

---

## 1. RINGKASAN EKSEKUTIF & REKONSILIASI JUMLAH TEMUAN

Menindaklanjuti mandat Acceptance Owner, tim analisis telah menyelesaikan rekonsiliasi dan investigasi individual mendalam terhadap seluruh temuan improvement yang tercatat dalam master backlog:
`UAT/UAT-Improvement-Backlog.md`

### Rekonsiliasi Faktual Jumlah Temuan:
1. **Total Entri Backlog Aktual:** Berkas `UAT/UAT-Improvement-Backlog.md` memuat secara utuh nomor seri **`IMP-001` hingga `IMP-044` (tepat 44 entri)** pada Seksi 4 (Spesifikasi Detail Temuan).
2. **Keterpisahan Defect:** Temuan cacat fungsi `DEF-001` dan `DEF-002` tercatat secara terpisah dalam `UAT/UAT-Defect-Log.md` dan tidak pernah menjadi bagian dari katalog `UAT-Improvement-Backlog.md`. Tidak ada pengurangan numerik antara defect dengan katalog improvement.
3. **Asal Muasal Angka 42:** Angka 42 secara historis merupakan jumlah total Test Case Operasional pada dokumen `UAT/UAT-Manual-Test-Cases.md` (*"Master Suite — 42 Test Cases"*).
4. **Keputusan Investigasi:** Untuk menjamin **Zero Omission (nol temuan yang terlewat)**, tim menginvestigasi secara individual **seluruh 44 entri (`IMP-001` s.d. `IMP-044`)**. Seluruh Finding ID asli dipertahankan secara utuh tanpa ada yang dihilangkan, diubah nomor serinya, atau digabung.

---

## 2. METODOLOGI & PEMISAHAN TIGA DIMENSI INVESTIGASI

Untuk mencegah perancuan antara status keabsahan masalah dengan penanganan teknis, evaluasi memisahkan secara tegas tiga dimensi:
1. **Klasifikasi Validitas Temuan:** Mengukur apakah kondisi yang dilaporkan benar-benar ada dan terverifikasi secara teknis pada sistem saat ini (`VALID`, `NEEDS CLARIFICATION`, `DEFERRED CANDIDATE`, `INVALID`, `ALREADY ADDRESSED`, `INSUFFICIENT EVIDENCE`).
2. **Indikasi Hubungan / Overlap:** Mengidentifikasi kesamaan area komponen atau berkas (misal: kluster topbar, kluster alur blocker) **tanpa menggugurkan status validitas masing-masing temuan**.
3. **Rekomendasi Analisis Awal:** Memberikan arahan penyelarasan konseptual berbasis bukti tanpa melompat mendikte kode implementasi atau menyusun rencana remediasi prematur.

Setiap temuan diperiksa melalui parameter baku yang membedakan fakta pemeriksaan, hipotesis penyebab, dan bukti dokumen acuan.

---

## 3. REKAPITULASI DISTRIBUSI VALIDITAS FINAL

Dari total **44 entri** yang diinvestigasi secara individual:

| Klasifikasi Validitas Utama | Jumlah Entri | Persentase | Keterangan Status |
| :--- | :---: | :---: | :--- |
| **VALID** | **41** | **93.2%** | Masalah nyata dan terverifikasi pada kode sumber / dokumen acuan. |
| **NEEDS CLARIFICATION** | **2** | **4.5%** | Memerlukan keputusan Acceptance Owner terkait arah kebijakan produk (`IMP-011` & `IMP-015`). |
| **DEFERRED CANDIDATE** | **1** | **2.3%** | Usulan peningkatan skenario QA non-blocking, ditangguhkan ke fase hardening (`IMP-013`). |
| **DUPLICATE CANDIDATE** | **0** | **0.0%** | Tidak ada temuan yang merupakan duplikat identik 1:1; kesamaan area dicatat pada atribut keterkaitan. |
| **INVALID** | **0** | **0.0%** | Seluruh temuan memiliki dasar pemeriksaan faktual. |
| **ALREADY ADDRESSED** | **0** | **0.0%** | Belum ada temuan improvement yang tertutup otomatis oleh Cycle 1. |
| **INSUFFICIENT EVIDENCE** | **0** | **0.0%** | Seluruh temuan memiliki bukti konkret pada kode sumber atau berkas desain. |
| **TOTAL** | **44** | **100.0%** | **Terverifikasi Penuh & Konsisten** |

---

## 4. LAPORAN INVESTIGASI TERINCI (IMP-001 s.d. IMP-044)

### IMP-001: Penyempurnaan Tagline Value Proposition Hero Login

1. **Finding ID:** `IMP-001`
2. **Deskripsi Asli:**
   > "Ubah copywriting menjadi lebih berfokus pada mitigasi risiko dan transparansi, contohnya: *"Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur."* atau formulasi nilai manfaat lain yang lebih tepat."
   *(Kondisi tercatat pada backlog: "Tagline berbunyi: *"Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur."*")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Hijau Kiri / Hero Section).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Teks tagline pada baris 81 file `frontend/src/views/auth/LoginView.vue` berbunyi: 'Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur.'
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan Prototipe 01 (`01-Login-Activation.html` L45-L48) dan PRD Seksi Value Proposition, narasi hero diarahkan untuk menonjolkan transparansi dan deteksi risiko dini tim operasional: 'Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur.' (Status Prototipe: Desain Acuan Resmi).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L80-L82; Acuan Desain: `Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html` L45-L48; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Hero Section Copywriting.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String teks tagline dikodekan secara statis (hardcoded) pada template Vue `LoginView.vue` baris 81.
   - *Hipotesis Penyebab:* Teks merupakan draf awal pengembangan antarmuka yang belum diselaraskan dengan naskah final pada prototipe desain.
9. **Dampak (Impact):** Rendah (Low) — Tidak mempengaruhi mekanisme autentikasi sistem; berdampak pada penekanan pesan nilai manfaat aplikasi bagi pengguna baru.
10. **Relevansi Pasca Cycle 1:** Relevan. Perbaikan Cycle 1 (DEF-001 & DEF-002) berfokus pada alur transaksi harian dan tidak menyentuh komponen hero login.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta perbedaan teks pada kode aktif terverifikasi secara objektif terhadap acuan prototipe resmi.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-002 s.d. IMP-006).
12. **Kesimpulan Investigasi:** Penyelarasan naskah tagline hero login direkomendasikan untuk memperjelas orientasi deteksi risiko dini sesuai dokumen acuan desain.

---

### IMP-002: Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh

1. **Finding ID:** `IMP-002`
2. **Deskripsi Asli:**
   > "Ganti frasa *"Komitmen Pagi Tuntas"* dengan istilah yang mencakup siklus komitmen secara utuh, bukan hanya pagi hari melainkan pemantauan kendala di tengah hari dan evaluasi di akhir hari."
   *(Kondisi tercatat pada backlog: "Judul poin pertama tertulis *"Komitmen Pagi Tuntas"*.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Kiri / Feature Pillar 1).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Judul pilar fitur 1 pada baris 88 `frontend/src/views/auth/LoginView.vue` tertulis: '<strong>Komitmen Pagi Tuntas</strong>'.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan ulasan UAT dan Prototipe 01 (`01-Login-Activation.html` L52-L56), judul pilar diharapkan merefleksikan siklus akuntabilitas kerja secara utuh (tidak hanya terbatas pada pagi hari): 'Komitmen Harian Terarah' atau formulasi sejenis.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L85-L91; Acuan Desain: `01-Login-Activation.html` L52-L56; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Feature Pillars Area.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String judul pilar fitur 1 dikodekan secara statis pada template Vue baris 88.
   - *Hipotesis Penyebab:* Penamaan mengadopsi istilah lama yang terlalu menitikberatkan pada sesi pagi (Morning Commitment) dibanding siklus harian lengkap.
9. **Dampak (Impact):** Rendah (Low) — Persepsi pengguna terhadap cakupan waktu penggunaan sistem akuntabilitas.
10. **Relevansi Pasca Cycle 1:** Relevan. Tidak tersentuh oleh perbaikan DEF-001 dan DEF-002 pada Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta judul pilar pada kode aktif terbukti menekankan sesi pagi dan dapat disempurnakan agar lebih komprehensif.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-001 s.d. IMP-006).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian judul pilar fitur 1 agar mencerminkan siklus komitmen kerja harian secara menyeluruh.

---

### IMP-003: Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian

1. **Finding ID:** `IMP-003`
2. **Deskripsi Asli:**
   > "Sesuaikan kalimat menjadi: *"Tentukan 1 hingga 3 komitmen harian yang berdampak dan realistis."* (atau diselaraskan setelah judul poin 1 disepakati)."
   *(Kondisi tercatat pada backlog: "Subtitle poin 1 berbunyi *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."*")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Kiri / Subtitle Pillar 1).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Subtitle pilar 1 pada baris 89 `frontend/src/views/auth/LoginView.vue` berbunyi: '<span>Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor.</span>'.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan masukan pengujian UAT dan Prototipe 01 (`01-Login-Activation.html` L54-L55), narasi diharapkan menekankan nilai dampak dan realisme komitmen: 'Tentukan 1 hingga 3 komitmen harian yang berdampak dan realistis.'
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L89; Acuan Desain: `01-Login-Activation.html` L54-L55; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Feature Pillars Subtitle.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String subtitle pilar fitur dikodekan secara statis pada template Vue baris 89.
   - *Hipotesis Penyebab:* Fokus redaksional awal lebih menonjolkan kepatuhan batas jam cutoff dibanding esensi komitmen kerja berdampak.
9. **Dampak (Impact):** Rendah (Low) — Nada komunikasi aplikasi terhadap motivasi pengguna.
10. **Relevansi Pasca Cycle 1:** Relevan. Independen dari perbaikan form locking Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta teks pada baris 89 terverifikasi bersifat administratif.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-001 s.d. IMP-006).
12. **Kesimpulan Investigasi:** Dianjurkan penyelarasan redaksional subtitle pilar 1 untuk memberikan dorongan komitmen kerja yang substantif.

---

### IMP-004: Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX

1. **Finding ID:** `IMP-004`
2. **Deskripsi Asli:**
   > "Samakan secara kanonikal dengan prototipe UI/UX:"
   *(Kondisi tercatat pada backlog: "Rumusan judul dan deskripsi poin 2 belum presisi sama dengan spesifikasi dokumen perancangan UI/UX.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Kiri / Feature Pillar 2).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 95-96 `frontend/src/views/auth/LoginView.vue` memuat judul 'Eskalasi Kendala Terukur' dan deskripsi 'Tiket hambatan langsung dipetakan ke Project Authority atau Squad Lead.'
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 01 (`01-Login-Activation.html` L58-L62), pilar 2 memuat judul 'Eskalasi Hambatan Cepat' dan deskripsi 'Laporkan kendala operasional seketika dan tetapkan penanggung jawab langsung.'
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L92-L98; Acuan Desain: `01-Login-Activation.html` L58-L62; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Feature Pillar 2.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Perbedaan redaksional statis antara template `LoginView.vue` dengan naskah Prototipe 01.
   - *Hipotesis Penyebab:* Penulisan redaksi dilakukan secara terpisah tanpa sinkronisasi teks final dari prototipe.
9. **Dampak (Impact):** Rendah (Low) — Konsistensi redaksional antara prototipe desain dan aplikasi aktif.
10. **Relevansi Pasca Cycle 1:** Relevan. Tidak terdampak Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi adanya selisih redaksional antara kode aktif dengan berkas desain acuan.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-001 s.d. IMP-006).
12. **Kesimpulan Investigasi:** Penyelarasan judul dan deskripsi pilar 2 disarankan mengikuti dokumen acuan prototipe.

---

### IMP-005: Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX

1. **Finding ID:** `IMP-005`
2. **Deskripsi Asli:**
   > "Samakan secara kanonikal dengan prototipe UI/UX:"
   *(Kondisi tercatat pada backlog: "Rumusan judul dan deskripsi poin 3 belum sepenuhnya mengadopsi teks resmi prototipe UI/UX.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Kiri / Feature Pillar 3).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 102-103 `frontend/src/views/auth/LoginView.vue` memuat judul 'Evaluasi Objektif Bebas Bias' dan deskripsi 'Tinjauan berbasis bukti nyata transaksi harian tanpa manipulasi manual.'
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 01 (`01-Login-Activation.html` L64-L68), pilar 3 memuat judul 'Evaluasi Sore Terukur' dan deskripsi 'Refleksikan pencapaian harian secara transparan dan tentukan status hari Anda.'
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L99-L105; Acuan Desain: `01-Login-Activation.html` L64-L68; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Feature Pillar 3.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String judul dan deskripsi pilar 3 dikodekan statis dan berbeda dari teks Prototipe 01.
   - *Hipotesis Penyebab:* Terjadi variasi redaksional saat implementasi komponen hero login.
9. **Dampak (Impact):** Rendah (Low) — Aspek konsistensi narasi fitur.
10. **Relevansi Pasca Cycle 1:** Relevan. Domain visual auth terpisah dari perbaikan Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta perbedaan teks pada baris 102-103 terbukti nyata terhadap berkas acuan desain.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-001 s.d. IMP-006).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian redaksional pilar 3 agar selaras dengan spesifikasi Prototipe 01.

---

### IMP-006: Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri

1. **Finding ID:** `IMP-006`
2. **Deskripsi Asli:**
   > "Ganti emoji dengan 3 ikon vektor SVG profesional sesuai icon set desain sistem (Lucide icons / Heroicons) yang dipakai pada prototipe UI/UX."
   *(Kondisi tercatat pada backlog: "Ketiga poin fitur saat ini menggunakan emotikon/emoji berwarna bawaan platform.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Kiri / Ikon Pilar Fitur).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 86, 93, 100 `frontend/src/views/auth/LoginView.vue` menggunakan karakter Unicode teks: `<div class="pillar-icon">✓</div>`, `<div class="pillar-icon">⚡</div>`, dan `<div class="pillar-icon">📊</div>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan standar desain sistem WorkPulse dan Prototipe 01 (L53, L59, L65), elemen visual pilar menggunakan ikon vektor SVG terstandarisasi (misal pustaka ikon `lucide-vue-next`).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L86, L93, L100; Acuan Desain: `01-Login-Activation.html` L53, L59, L65 (inline SVG); Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Visual Design & Styling` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Iconography Styling.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Elemen pilar menggunakan karakter unicode teks mentah, bukan komponen SVG.
   - *Hipotesis Penyebab:* Karakter unicode digunakan sebagai placeholder visual sementara pada tahap awal pengembangan antarmuka.
9. **Dampak (Impact):** Sedang (Medium) — Inkonsistensi rendering visual antar sistem operasi/browser (emoji/unicode tampil berbeda di Windows, Linux, dan macOS).
10. **Relevansi Pasca Cycle 1:** Relevan. Masalah visual rendering independen dari Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi secara visual dan kode sumber bahwa pilar menggunakan karakter teks unicode.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-012).
12. **Kesimpulan Investigasi:** Dianjurkan penggantian karakter unicode teks dengan ikon vektor SVG terstandarisasi untuk menjamin konsistensi lintas platform.

---

### IMP-007: Penyesuaian Headline Form Kanan Menjadi Lebih Inklusif Alur

1. **Finding ID:** `IMP-007`
2. **Deskripsi Asli:**
   > "Rumuskan kembali headline agar mencakup transparansi komitmen dan kolaborasi, tidak terkesan sempit pada pelaporan hasil akhir semata."
   *(Kondisi tercatat pada backlog: "Headline form berbunyi *"Fokus pada Hasil, Tuntaskan Kendala."*")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Form Kanan / Form Header).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 126 `frontend/src/views/auth/LoginView.vue` memuat headline `<h2>Masuk ke WorkPulse</h2>` dengan lead text 'Masukkan kredensial email Dutamedia dan kata sandi Anda.'
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan ulasan UAT dan Prototipe 01 (L80-L84), headline form diharapkan memberikan kesan sambutan yang lebih ramah dan terintegrasi dengan portal akuntabilitas perusahaan.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L125-L127; Acuan Desain: `01-Login-Activation.html` L80-L84; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Interactive Form Area Header.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Teks headline dan lead text diformulasikan secara statis pada template Vue baris 126-127.
   - *Hipotesis Penyebab:* Perbedaan gaya bahasa antara draf form login awal dengan prototipe interaktif.
9. **Dampak (Impact):** Rendah (Low) — Aspek keramahan antarmuka saat pengguna pertama kali mengakses aplikasi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi pada baris 126-127 `LoginView.vue`.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Login (berkaitan dengan IMP-008 s.d. IMP-011).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian headline dan lead text form kanan agar lebih komunikatif dan selaras dengan prototipe.

---

### IMP-008: Fleksibilitas & Penyesuaian Label Versi Sistem di Header Form

1. **Finding ID:** `IMP-008`
2. **Deskripsi Asli:**
   > "Ganti teks tersebut menjadi *"WorkPulse v1.5 · Dutamedia"* dan pastikan penomoran versi dapat terbaca secara fleksibel/dinamis dari konfigurasi rilis aplikasi."
   *(Kondisi tercatat pada backlog: "Label versi tertulis statis: *"WorkPulse v2.0 • Clean-Slate Architecture"*.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Panel Hero Footer).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 110 `frontend/src/views/auth/LoginView.vue` memuat label versi statis: `<span>WorkPulse v2.0 • Clean-Slate Architecture</span>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Label rilis produk diharapkan mencerminkan penomoran versi resmi (misal `WorkPulse v1.5 · Dutamedia` atau dinamis dari konfigurasi) tanpa mencantumkan istilah arsitektur internal pengembang.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L109-L112; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Visual Design & Styling` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Brand Footer.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String versi mengandung frasa 'Clean-Slate Architecture' yang tercatat statis pada template.
   - *Hipotesis Penyebab:* Istilah teknis internal masa refactoring arsitektur terbawa ke dalam template tampilan publik.
9. **Dampak (Impact):** Rendah (Low) — Profesionalitas presentasi branding aplikasi di mata pengguna internal.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terbukti adanya kebocoran istilah teknis internal arsitektur pada footer halaman publik.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Login (berkaitan dengan IMP-007 s.d. IMP-011).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan label versi dari istilah teknis internal dan penyelarasan nomor versi resmi.

---

### IMP-009: Penyesuaian Label Lingkungan Kerja "Internal Workspace Environment"

1. **Finding ID:** `IMP-009`
2. **Deskripsi Asli:**
   > "Ubah label penanda konteks menjadi *"Internal Workspace Environment"*."
   *(Kondisi tercatat pada backlog: "Header form login menampilkan nama badan usaha *"PT Dutamedia Mandiri Pratama"*.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Form Header Context Tag).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 125 `frontend/src/views/auth/LoginView.vue` menggunakan label konteks: `<span class="screen-tag">PORTAL AKUNTABILITAS</span>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 01 (`01-Login-Activation.html` L80), penanda lingkungan kerja menggunakan frasa: `INTERNAL WORKSPACE ENVIRONMENT` untuk menegaskan batas lingkungan kerja internal.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L125; Acuan Desain: `01-Login-Activation.html` L80; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Context Tag Badge.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Label konteks pada baris 125 menggunakan string 'PORTAL AKUNTABILITAS' bukan teks acuan prototipe.
   - *Hipotesis Penyebab:* Penerjemahan lokal label penanda konteks tanpa sinkronisasi terhadap prototipe 01.
9. **Dampak (Impact):** Rendah (Low) — Konsistensi terminologi penanda lingkungan aplikasi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta perbedaan teks screen-tag terverifikasi nyata terhadap prototipe acuan.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Login (berkaitan dengan IMP-007 s.d. IMP-011).
12. **Kesimpulan Investigasi:** Dianjurkan penyelarasan teks label konteks lingkungan kerja sesuai acuan prototipe resmi.

---

### IMP-010: Penggantian Microcopy Teknis Menjadi Bantuan Akses Pengguna

1. **Finding ID:** `IMP-010`
2. **Deskripsi Asli:**
   > "Ganti microcopy menjadi teks panduan praktis: *"Kendala akses akun? Hubungi Tim IT Support atau Tim HRGA."*"
   *(Kondisi tercatat pada backlog: "Footer menampilkan detail teknis implementasi keamanan: *"Perlindungan sesi via HttpOnly & CSRF Double-Submit"*.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Form Footer Help Hint).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Baris 205-207 `frontend/src/views/auth/LoginView.vue` menampilkan teks teknis backend: `<div class="help-hint"><span>Perlindungan sesi via HttpOnly & CSRF Double-Submit</span></div>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Area bantuan footer formulir diharapkan menyajikan panduan praktis bagi pengguna yang mengalami kesulitan akses: 'Kendala akses akun? Hubungi Tim IT / HRGA Dutamedia.' (Prototipe 01 L145-L148).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L205-L207; Acuan Desain: `01-Login-Activation.html` L145-L148; Test Case: `TC-AUTH-001`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), Help Hint Area.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Area help-hint memuat penjelasan mekanisme teknis keamanan cookie/CSRF alih-alih bantuan operasional pengguna.
   - *Hipotesis Penyebab:* Pengembang menempatkan status verifikasi keamanan teknis sebagai placeholder microcopy bantuan.
9. **Dampak (Impact):** Rendah (Low) — Informasi teknis membingungkan bagi pengguna non-teknis yang mengalami masalah login.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi microcopy teknis implementasi backend bocor ke antarmuka formulir pengguna.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Login (berkaitan dengan IMP-007 s.d. IMP-011).
12. **Kesimpulan Investigasi:** Dianjurkan penggantian teks teknis keamanan dengan informasi kontak bantuan operasional bagi staf.

---

### IMP-011: Penambahan Tombol & Prosedur Penanganan "Lupa Kata Sandi?"

1. **Finding ID:** `IMP-011`
2. **Deskripsi Asli:**
   > "Sediakan tombol/link *"Lupa kata sandi?"* yang memunculkan petunjuk resmi bagi pengguna (misal modal popover instruksi untuk menghubungi Admin/HRGA, atau integrasi alur reset terkontrol)."
   *(Kondisi tercatat pada backlog: "Belum tersedia tautan / tombol *"Lupa kata sandi?"* pada form login.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Login (`/login`, Opsi Formulir Kredensial).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 184-190 `frontend/src/views/auth/LoginView.vue`, hanya terdapat checkbox 'Ingat sesi saya' dan tautan 'Belum aktivasi akun?'. Tidak tersedia tautan atau prosedur pemulihan kata sandi.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Pengguna yang mengalami kendala lupa kata sandi memerlukan kejelasan prosedur pemulihan akun sesuai kebijakan keamanan organisasi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/LoginView.vue` L184-L190; Test Case: `TC-AUTH-001`; Backend: belum ada service pemulihan token via email.
   - **Kategori Backlog:** `Feature Enhancement` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-AUTH-001``
7. **Area Terdampak:** Frontend UI (`LoginView.vue`), dan potensi Backend Auth Service.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Antarmuka login belum menyediakan komponen pemicu alur lupa kata sandi.
   - *Hipotesis Penyebab:* WorkPulse dibangun sebagai sistem intranet di mana pengelolaan kredensial staf ditangani terpusat oleh Administrator, sehingga fitur pemulihan belum didefinisikan secara formal.
9. **Dampak (Impact):** Sedang (Medium) — Ketidakjelasan alur penanganan bagi karyawan yang lupa kata sandi berisiko memicu eskalasi manual tidak terstruktur.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`NEEDS CLARIFICATION`**
    - *Justifikasi:* Memerlukan penetapan arah kebijakan produk dari Acceptance Owner mengenai model pemulihan akun yang dikehendaki.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Login (berkaitan dengan IMP-007 s.d. IMP-010).
12. **Kesimpulan Investigasi:** Diperlukan klarifikasi Acceptance Owner untuk menentukan apakah prosedur lupa kata sandi ditangani melalui mekanisme panduan administratif (bantuan HRGA/IT) atau pemulihan mandiri berbasis email token.

---

### IMP-012: Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi

1. **Finding ID:** `IMP-012`
2. **Deskripsi Asli:**
   > "Samakan visual panel hijau kiri pada tab Aktivasi Akun persis dengan tab Masuk Sistem (desktop), termasuk implementasi perbaikan copywriting dan ikon SVG baru, dengan tetap menyembunyikannya pada viewport mobile."
   *(Kondisi tercatat pada backlog: "Pada tab Aktivasi Akun, panel hijau di sisi kiri belum memiliki keselarasan penuh dengan kondisi panel kiri pada tab Masuk Sistem.")*
3. **Konteks Temuan:** Modul Autentikasi — Halaman Aktivasi Akun (`/activate`) dan Login (`/login`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada `frontend/src/views/auth/ActivateView.vue` baris 115-130, panel hero kiri memuat 2 pilar dengan karakter unicode (`🔒`, `⏱️`), sedangkan `LoginView.vue` memuat 3 pilar. Terdapat ketidakseragaman layout visual saat pengguna berpindah tab.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan Prototipe 01, kedua tampilan (`/login` dan `/activate`) memiliki keselarasan struktur hero panel dan menggunakan ikonografi vektor yang serasi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/auth/ActivateView.vue` L115-L130; `frontend/src/views/auth/LoginView.vue` L84-L106; Acuan Desain: `01-Login-Activation.html` L50-L75; Test Case: `TC-AUTH-003`.
   - **Kategori Backlog:** `Layout & Spacing` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-003``
7. **Area Terdampak:** Frontend UI (`ActivateView.vue`), Layout Hero Section.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Struktur markup hero panel pada `ActivateView.vue` berbeda jumlah item dan styling-nya dari `LoginView.vue`.
   - *Hipotesis Penyebab:* Kedua view dikembangkan secara independen tanpa penggunaan komponen layout hero yang terbagi (shared layout).
9. **Dampak (Impact):** Rendah (Low) — Inkonsistensi visual saat berpindah antara tab Masuk Sistem dan Aktivasi Akun.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Perbedaan tata letak dan jenis ikon terverifikasi langsung pada kode sumber kedua file tampilan.
    - *Indikasi Hubungan / Overlap:* Kluster Hero Panel Login & Aktivasi (berkaitan dengan IMP-001 s.d. IMP-006).
12. **Kesimpulan Investigasi:** Dianjurkan penyelarasan visual hero panel pada halaman aktivasi agar memiliki estetika yang seragam dengan halaman login.

---

### IMP-013: Penambahan Skenario Uji Khusus State Akun Nonaktif & Rate Limit

1. **Finding ID:** `IMP-013`
2. **Deskripsi Asli:**
   > "Dokumentasikan kandidat skenario pengujian lanjutan pasca-UAT inti untuk memvalidasi keramahan pesan error saat akun dinonaktifkan oleh HRGA serta saat percobaan login melebihi batas rate limit."
   *(Kondisi tercatat pada backlog: "Skenario UAT saat ini berfokus pada salah password dasar; belum menguji secara khusus pesan error saat akun berstatus `INACTIVE` dan reaksi proteksi *Rate-Limit Lockout* (ThrottlerGuard).")*
3. **Konteks Temuan:** Penjaminan Mutu & Pengujian — Skenario Uji Autentikasi Lanjutan.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Skenario pengujian UAT pada `TC-AUTH-002` berfokus pada kesalahan kredensial dasar; belum ada skenario uji eksplisit dalam dokumen UAT untuk memverifikasi respons status akun nonaktif (`DEACTIVATED`) dan pembatasan frekuensi akses (rate limit HTTP 429).
5. **Kondisi yang Diharapkan (Dasar Acuan):** Tersedia dokumentasi skenario uji komprehensif dalam test suite untuk memvalidasi penanganan edge-case status akun dan pembatasan beban akses sistem.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `backend/src/auth/auth.service.ts` L110-L125; Berkas UAT Checklist `TC-AUTH-002`.
   - **Kategori Backlog:** `User Experience (UX)` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-002``
7. **Area Terdampak:** Dokumentasi Pengujian UAT, Automated Test Suite.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Skenario UAT manual yang terdokumentasi saat ini belum mencakup pengujian formal kondisi akun nonaktif dan throttling limit.
   - *Hipotesis Penyebab:* Fokus awal pelaksanaan UAT diprioritaskan pada alur bisnis utama pengguna aktif.
9. **Dampak (Impact):** Rendah (Low) — Tidak merepresentasikan bug fungsional aplikasi; merupakan peluang perluasan cakupan penjaminan mutu.
10. **Relevansi Pasca Cycle 1:** Relevan untuk kelengkapan pengujian sistem.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`DEFERRED CANDIDATE`**
    - *Justifikasi:* Bukan merupakan cacat antarmuka atau logika sistem yang mendesak bagi pengguna; tepat dialokasikan pada fase hardening dan perluasan test suite sekunder.
    - *Indikasi Hubungan / Overlap:* Mandiri (Aspek QA & Test Documentation).
12. **Kesimpulan Investigasi:** Direkomendasikan untuk menangguhkan penambahan skenario uji ini ke fase stabilisasi akhir dan penguatan pengujian otomatis.

---

### IMP-014: Penggantian Tombol Profil Kanan Atas Menggunakan Ikon Avatar

1. **Finding ID:** `IMP-014`
2. **Deskripsi Asli:**
   > "Ganti tombol teks dengan komponen avatar/ikon profil melingkar sesuai prototipe UI/UX Design."
   *(Kondisi tercatat pada backlog: "Tombol profil di ujung kanan atas berupa tombol teks / link standar.")*
3. **Konteks Temuan:** Shell Navigasi — Header Bar Halaman Akuntabilitas Harian (`MorningCommitmentView.vue`, `AdditionalWorkView.vue`, `EodOutcomeView.vue`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Topbar pada baris 11-14 `MorningCommitmentView.vue`, baris 11-14 `AdditionalWorkView.vue`, dan baris 11-14 `EodOutcomeView.vue` memuat tautan teks biasa `<AccessLink to="/profile" class="nav-btn">Profil</AccessLink>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan Prototipe 02, 03, dan 04, tautan profil pada sudut kanan atas disajikan dalam bentuk avatar bulat dengan inisial nama pengguna.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L13; `frontend/src/views/daily/AdditionalWorkView.vue` L13; `frontend/src/views/daily/EodOutcomeView.vue` L13; Acuan Desain: `02-Morning-Commitment.html` L88-L92; Test Case: `TC-DLYM-001`.
   - **Kategori Backlog:** `Visual Design & Styling` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-001`, `TC-DLYM-001``
7. **Area Terdampak:** Frontend UI (`MorningCommitmentView.vue`, `AdditionalWorkView.vue`, `EodOutcomeView.vue`), Topbar Section.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Elemen navigasi profil pada tampilan kerja harian dikodekan sebagai tombol teks biasa.
   - *Hipotesis Penyebab:* Layout daily view dibuat sebelum standarisasi komponen avatar profil global dirumuskan.
9. **Dampak (Impact):** Rendah (Low) — Ergonomi visual dan konsistensi antarmuka navigasi.
10. **Relevansi Pasca Cycle 1:** Relevan. Tidak tersentuh oleh perbaikan form locking Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi pada kode sumber bahwa ketiga tampilan harian menggunakan tombol teks profil dan bukan avatar inisial.
    - *Indikasi Hubungan / Overlap:* Kluster Topbar Global (berkaitan dengan IMP-019, IMP-024, IMP-025, IMP-043).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian tombol profil menjadi avatar inisial bulat sebagai bagian dari penataan header navigasi.

---

### IMP-015: Penggantian Tombol Riwayat Menjadi Ikon Notifikasi Ber-badge Merah

1. **Finding ID:** `IMP-015`
2. **Deskripsi Asli:**
   > "Ganti tombol tersebut menjadi tombol Ikon Notifikasi (lonceng) dengan indikator titik merah (*unread badge*) bila terdapat notifikasi baru, sesuai rancangan prototipe UI/UX Design."
   *(Kondisi tercatat pada backlog: "Header menampilkan tombol teks "Riwayat Saya" di samping tombol profil.")*
3. **Konteks Temuan:** Shell Navigasi — Topbar Kanan pada Tampilan Kerja Harian.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Topbar kanan pada tampilan harian merender tautan teks `Riwayat Saya` (`/daily/history`). Tidak tersedia ikon lonceng notifikasi pada area header.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan Prototipe 02 (`02-Morning-Commitment.html` L85-L87), topbar kanan memuat ikon lonceng notifikasi untuk mempermudah akses pemberitahuan.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L12; Acuan Desain: `02-Morning-Commitment.html` L85-L87; Test Case: `TC-DLYM-001`.
   - **Kategori Backlog:** `Navigation & Architecture` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-DLYM-001``
7. **Area Terdampak:** Frontend UI Topbar dan Pusat Notifikasi (`NotificationCenterView.vue`).
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Header bar tampilan harian belum mengintegrasikan komponen lonceng notifikasi.
   - *Hipotesis Penyebab:* Navigasi notifikasi awalnya hanya diletakkan pada menu sidebar utama.
9. **Dampak (Impact):** Sedang (Medium) — Kemudahan akses informasi eskalasi dan notifikasi bagi pengguna saat berada di formulir kerja harian.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`NEEDS CLARIFICATION`**
    - *Justifikasi:* Memerlukan penetapan kebutuhan fungsional dari Acceptance Owner mengenai perilaku lonceng notifikasi (apakah sekadar pintasan navigasi atau indikator unread count aktif).
    - *Indikasi Hubungan / Overlap:* Kluster Topbar Global (berkaitan dengan IMP-014, IMP-019, IMP-024, IMP-025, IMP-043).
12. **Kesimpulan Investigasi:** Diperlukan konfirmasi Acceptance Owner mengenai ekspektasi fungsional ikon notifikasi pada topbar sebelum perancangan komponen header dilakukan.

---

### IMP-016: Penempatan Tombol "Lapor Blocker" Konsisten pada 3 Tab My Today

1. **Finding ID:** `IMP-016`
2. **Deskripsi Asli:**
   > "Letakkan satu tombol "Lapor Blocker" yang konsisten pada masing-masing ketiga halaman My Today (Morning, Additional Work, EOD), diposisikan sejajar di baris tab 1, 2, 3 pada ujung kanan sesuai batas margin dan grid desain prototipe."
   *(Kondisi tercatat pada backlog: "Tombol Lapor Blocker saat ini hanya muncul di halaman EOD Outcome, dan terdapat potensi duplikasi penempatan di header bar dan konten dalam.")*
3. **Konteks Temuan:** Alur Kerja Harian — 3 Tab My Today (`/daily/morning`, `/daily/additional-work`, `/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Tombol tindakan '+ Laporkan Blocker Mendesak' hanya tersedia pada `EodOutcomeView.vue` baris 316-322. Halaman `MorningCommitmentView.vue` dan `AdditionalWorkView.vue` tidak memuat tombol CTA pelaporan kendala pada area heading.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai prinsip eskalasi tanpa menunggu pergantian hari (PRD v1.6 §3), tombol tindakan cepat pelaporan blocker diharapkan dapat diakses secara konsisten pada seluruh tahapan alur kerja harian.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L315-L322; `frontend/src/views/daily/AdditionalWorkView.vue` L160-L168; `frontend/src/views/daily/EodOutcomeView.vue` L316-L322; Test Case: `TC-DLYM-001`, `TC-DLYA-001`, `TC-BLKR-001`.
   - **Kategori Backlog:** `User Experience (UX)` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-DLYM-001`, `TC-BLKR-001``
7. **Area Terdampak:** Frontend UI (`MorningCommitmentView.vue`, `AdditionalWorkView.vue`), Page Heading Area.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Komponen tombol CTA blocker hanya dideklarasikan pada template EOD dan tidak disertakan pada Morning dan Additional Work.
   - *Hipotesis Penyebab:* Penempatan tombol CTA mengikuti prototipe per layar secara parsial tanpa standarisasi shared action header.
9. **Dampak (Impact):** Sedang (Medium) — Pengguna yang menghadapi kendala mendesak di pagi atau siang hari tidak memiliki pintasan langsung dari formulir aktifnya.
10. **Relevansi Pasca Cycle 1:** Relevan. Tidak tersentuh oleh perbaikan penguncian formulir Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi secara objektif ketiadaan tombol CTA pelaporan blocker pada dua tampilan kerja harian.
    - *Indikasi Hubungan / Overlap:* Kluster Alur Kerja Harian (berkaitan dengan IMP-027 s.d. IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penempatan tombol tindakan pelaporan kendala secara konsisten pada area heading seluruh tab kerja harian.

---

### IMP-017: Konsolidasi Menu Sidebar Induk "My Today" & Label 'Dutamedia'

1. **Finding ID:** `IMP-017`
2. **Deskripsi Asli:**
   > "1. Ubah teks di bawah logo menjadi **'Dutamedia'** saja."
   *(Kondisi tercatat pada backlog: "1. Teks di bawah logo WorkPulse di sidebar belum ringkas 'Dutamedia'.")*
3. **Konteks Temuan:** Navigasi Global — Enterprise Sidebar (`EnterpriseSidebar.vue`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 135 `frontend/src/components/EnterpriseSidebar.vue`, label caption brand tertulis `Dutamedia Intranet`. Sedangkan pada `LoginView.vue` dan `ActivateView.vue` tertulis `Dutamedia Accountability`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Identitas dan caption sistem diharapkan memiliki terminologi yang konsisten di seluruh shell aplikasi dan halaman autentikasi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/components/EnterpriseSidebar.vue` L135; `frontend/src/views/auth/LoginView.vue` L77, L101; Test Case: `TC-AUTH-004`.
   - **Kategori Backlog:** `Navigation & Architecture` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-AUTH-001`, `TC-DLYM-001``
7. **Area Terdampak:** Frontend UI (`EnterpriseSidebar.vue`), Brand Header.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String caption pada sidebar berbeda dengan caption pada halaman login/aktivasi.
   - *Hipotesis Penyebab:* Inkonsistensi penulisan label identitas brand saat pembuatan komponen sidebar enterprise.
9. **Dampak (Impact):** Rendah (Low) — Keseragaman identitas visual aplikasi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta perbedaan caption brand terverifikasi langsung pada kode sumber.
    - *Indikasi Hubungan / Overlap:* Mandiri (Aspek Branding Sidebar).
12. **Kesimpulan Investigasi:** Dianjurkan penyelarasan teks caption brand sidebar agar seragam dengan identitas resmi aplikasi.

---

### IMP-018: Eliminasi Badge Redundan "WP WorkPulse" pada Navbar Atas

1. **Finding ID:** `IMP-018`
2. **Deskripsi Asli:**
   > "Hilangkan badge "WP WorkPulse" dari topbar halaman `/profile` agar area navigasi atas lebih bersih dan fokus pada breadcrumb konteks halaman."
   *(Kondisi tercatat pada backlog: "Topbar atas menampilkan badge "WP WorkPulse" yang redundan karena logo WorkPulse sudah terpampang permanen di sidebar kiri.")*
3. **Konteks Temuan:** Halaman Profil Akun — Header Navigasi (`/profile`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 90-91 `frontend/src/views/profile/ProfileView.vue`, topbar menampilkan badge duplikat `<div class="brand-badge">WP</div><span class="brand-name">WorkPulse</span>` berdampingan dengan penanda halaman.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 24 (`24-Profile-Settings.html` L75-L82), header halaman profil tidak mengulang logo WorkPulse karena identitas aplikasi telah ditampilkan secara permanen pada sidebar utama.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/profile/ProfileView.vue` L88-L93; Acuan Desain: `24-Profile-Settings.html` L75-L82; Test Case: `TC-AUTH-004`.
   - **Kategori Backlog:** `Layout & Spacing` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-007``
7. **Area Terdampak:** Frontend UI (`ProfileView.vue`), Topbar Header.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Elemen badge logo WP disertakan pada template header halaman profil di dalam shell navigasi.
   - *Hipotesis Penyebab:* Pola header halaman profil diadopsi dari template mandiri (standalone) sebelum integrasi ke sidebar shell.
9. **Dampak (Impact):** Rendah (Low) — Redundansi visual pada area header.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta pengulangan logo pada topbar profil terbukti nyata pada baris 90-91 `ProfileView.vue`.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Profil (berkaitan dengan IMP-020 s.d. IMP-022).
12. **Kesimpulan Investigasi:** Dianjurkan penghapusan badge duplikat logo pada header halaman profil dan penggantian dengan penanda hirarkis yang bersih.

---

### IMP-019: Standardisasi Navbar Global Bersih (Avatar Inisial & Notifikasi)

1. **Finding ID:** `IMP-019`
2. **Deskripsi Asli:**
   > "Seragamkan bar atas di seluruh halaman sistem menjadi satu standar: menampilkan ikon notifikasi (lonceng dengan badge unread) dan tombol profil berupa avatar inisial pengguna, tanpa tombol teks profil/logout yang berulang di header, karena navigasi profil sudah tersedia di sudut kiri bawah sidebar."
   *(Kondisi tercatat pada backlog: "Bar atas halaman `/profile` berbeda dari halaman utama lainnya dan memuat elemen yang tidak konsisten.")*
3. **Konteks Temuan:** Shell Navigasi Global — Konsistensi Header Bar Seluruh Modul.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Setiap modul aplikasi mengimplementasikan header bar secara terpisah dengan susunan tombol, tata letak, dan styling yang bervariasi (sebagian tombol teks, sebagian link menu, sebagian tanpa avatar).
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan arsitektur antarmuka terpadu dan Prototipe 08 / 24, seluruh halaman di dalam shell aplikasi diharapkan memiliki struktur topbar yang konsisten (penanda lokasi/breadcrumb di kiri, notifikasi dan avatar profil di kanan).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L4-L15; `frontend/src/views/profile/ProfileView.vue` L88-L107; `frontend/src/views/admin/AdminUsersView.vue` L1-L15; Acuan Desain: Prototipe 08 dan 24.
   - **Kategori Backlog:** `Navigation & Architecture` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-AUTH-007``
7. **Area Terdampak:** Frontend Architecture, Shared Layout Shell.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Header bar dibuat secara terdesentralisasi di masing-masing file view tanpa komponen bersama (shared topbar).
   - *Hipotesis Penyebab:* Pengembangan modul dilakukan bertahap oleh beberapa pengembang tanpa abstraksi layout header bersama di level root.
9. **Dampak (Impact):** Sedang (Medium) — Variasi pengalaman visual dan biaya pemeliharaan styling di banyak file view.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta desentralisasi dan variasi implementasi header bar terverifikasi di seluruh modul aplikasi.
    - *Indikasi Hubungan / Overlap:* Kluster Topbar Global (menjadi payung struktural bagi IMP-014, IMP-024, IMP-025, IMP-043).
12. **Kesimpulan Investigasi:** Dianjurkan perancangan komponen header terstandarisasi untuk menyatukan struktur navigasi atas di seluruh modul.

---

### IMP-020: Konsistensi Penjanaan Huruf Inisial Avatar (2 Huruf Nama Lengkap)

1. **Finding ID:** `IMP-020`
2. **Deskripsi Asli:**
   > "Buat logika penjanaan inisial avatar yang konsisten mengambil 2 huruf (huruf pertama nama depan dan huruf pertama nama belakang, misal "AN") di seluruh komponen avatar aplikasi."
   *(Kondisi tercatat pada backlog: "Pada footer sidebar kiri inisial pengguna adalah 2 huruf "AN" (Aditya Nugroho), namun saat membuka halaman `/profile`, avatar besar hanya menampilkan 1 huruf "A".")*
3. **Konteks Temuan:** Komponen Avatar Pengguna — Sidebar dan Halaman Profil.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Di `frontend/src/views/profile/ProfileView.vue` baris 115, inisial hanya mengambil 1 karakter: `authStore.user?.fullName?.charAt(0) || 'U'`. Sedangkan di `EnterpriseSidebar.vue` baris 48 mengambil 2 karakter inisial nama lengkap.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai standar antarmuka aplikasi dan Prototipe 24, pembentukan inisial avatar diharapkan konsisten menggunakan 2 huruf kapital dari nama lengkap pengguna di seluruh aplikasi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/profile/ProfileView.vue` L114-L116; `frontend/src/components/EnterpriseSidebar.vue` L44-L51; Test Case: `TC-AUTH-004`.
   - **Kategori Backlog:** `Visual Design & Styling` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-AUTH-007``
7. **Area Terdampak:** Frontend Shared Utilities, Avatar Rendering.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Logika pembentukan inisial avatar ditulis ulang secara lokal di masing-masing komponen dengan algoritma berbeda.
   - *Hipotesis Penyebab:* Ketiadaan fungsi pembantu (helper utility) bersama untuk pemformatan nama pengguna.
9. **Dampak (Impact):** Rendah (Low) — Inkonsistensi tampilan inisial pengguna antar halaman.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Terverifikasi langsung perbedaan algoritma inisial (1 huruf di Profil vs 2 huruf di Sidebar).
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Profil (berkaitan dengan IMP-018, IMP-021, IMP-022).
12. **Kesimpulan Investigasi:** Dianjurkan standarisasi logika pembentukan inisial 2 huruf menggunakan utilitas bersama di seluruh komponen avatar.

---

### IMP-021: Pemisahan Nama Lengkap dan Jabatan pada Tampilan User

1. **Finding ID:** `IMP-021`
2. **Deskripsi Asli:**
   > "Pisahkan field nama lengkap pengguna ("Aditya Nugroho") dengan field jabatan ("Frontend Engineer") secara visual atau struktural, tanpa menggabungkan nama dan jabatan dalam tanda kurung pada satu string teks."
   *(Kondisi tercatat pada backlog: "Teks nama pengguna ditampilkan bersambung dengan tanda kurung jabatan, contohnya: "Aditya Nugroho (Frontend Engineer)".")*
3. **Konteks Temuan:** Halaman Profil Akun — Kartu Identitas Pengguna (`/profile`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 121 `frontend/src/views/profile/ProfileView.vue`, kartu profil menampilkan langsung kode enum role: `<span class="role-pill">{{ authStore.user?.role || 'EMPLOYEE' }}</span>`. Informasi jabatan struktural belum disajikan terpisah dari peran sistem.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 24 (`24-Profile-Settings.html` L95-L105), kartu identitas menampilkan Nama Lengkap, Jabatan Fungsional/Operasional, serta Departemen/Unit Kerja secara terstruktur, terpisah dari hak akses teknis.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/profile/ProfileView.vue` L117-L124; Acuan Desain: `24-Profile-Settings.html` L95-L105; Test Case: `TC-AUTH-004`.
   - **Kategori Backlog:** `Copywriting & Microcopy` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-AUTH-007``
7. **Area Terdampak:** Frontend UI (`ProfileView.vue`), User Identity Area.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Komponen identitas langsung menampilkan nilai enum role otorisasi tanpa penyajian jabatan kerja formal.
   - *Hipotesis Penyebab:* Implementasi antarmuka awal memetakan field data pengguna secara langsung dari payload auth store.
9. **Dampak (Impact):** Rendah (Low) — Kelengkapan representasi profil profesional pengguna.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta tampilan role enum mentah tanpa pemisahan jabatan kerja terbukti pada baris 121 `ProfileView.vue`.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Profil (berkaitan dengan IMP-018, IMP-020, IMP-022).
12. **Kesimpulan Investigasi:** Dianjurkan penataan informasi identitas profil agar menyajikan jabatan dan unit kerja secara jelas dan terpisah dari peran sistem.

---

### IMP-022: Penyelarasan Layout Body Profil Sesuai 3 Seksi Prototipe 24

1. **Finding ID:** `IMP-022`
2. **Deskripsi Asli:**
   > "Selaraskan struktur konten halaman `/profile` agar mengadopsi rancangan kanonikal Prototipe 24: Header judul dan subtitle halaman yang jelas, kotak ringkasan profil, serta 3 seksi konten terstruktur: (1) Kartu Identitas & Penugasan Efektif (Read-Only) mencakup Jabatan & Departemen resmi, (2) Keamanan & Pembaruan Kata Sandi Mandiri, dan (3) Ringkasan Kanal Notifikasi Perangkat Ini (dengan tetap mengabaikan elemen dummy simulasi khusus prototipe)."
   *(Kondisi tercatat pada backlog: "Body halaman `/profile` saat ini masih menggunakan layout dua kolom sederhana dengan prompt hint refleksi dan belum mengadopsi 3 seksi komprehensif prototipe 24 (`24-Profile-Settings.html`).")*
3. **Konteks Temuan:** Halaman Profil Akun — Tata Letak Body Halaman (`/profile`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 111-180 `frontend/src/views/profile/ProfileView.vue`, tata letak terdiri dari 2 kolom kartu sederhana (Identitas di kiri, Ubah Password di kanan).
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai rancangan Prototipe 24 (`24-Profile-Settings.html` L90-L240), halaman profil mencakup 3 seksi komprehensif: (1) Profil Pengguna & Organisasi, (2) Keamanan & Ganti Sandi, (3) Ringkasan Riwayat Sesi & Kebijakan Akun Pengguna.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/profile/ProfileView.vue` L111-L210; Acuan Desain: `24-Profile-Settings.html` L90-L240; Test Case: `TC-AUTH-004`.
   - **Kategori Backlog:** `Layout & Spacing` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-AUTH-007``
7. **Area Terdampak:** Frontend UI (`ProfileView.vue`), Page Grid Layout.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Struktur layout halaman saat ini hanya menyediakan 2 kartu dan belum memuat seksi riwayat sesi/kebijakan akun.
   - *Hipotesis Penyebab:* Pengembangan awal difokuskan pada pemenuhan fungsi perubahan kata sandi saja.
9. **Dampak (Impact):** Rendah (Low) — Kelengkapan fitur transparansi kebijakan akun bagi pengguna.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta perbedaan struktur layout (2 seksi vs 3 seksi pada prototipe) terverifikasi nyata.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Profil (berkaitan dengan IMP-018, IMP-020, IMP-021).
12. **Kesimpulan Investigasi:** Dianjurkan penataan ulang struktur halaman profil agar selaras dengan 3 seksi standar rancangan Prototipe 24.

---

### IMP-023: Pengalihan Tombol Pemulihan Layar 403 Mengikuti Rute Kanonikal Peran

1. **Finding ID:** `IMP-023`
2. **Deskripsi Asli:**
   > "Ubah rute tombol pemulihan agar memanggil helper navigasi berbasis peran (misal: `getRoleBasedHomeRoute(user.role)`), sehingga untuk peran EMPLOYEE tombol otomatis mengarahkan ke `/daily/morning`, sedangkan untuk peran manajerial mengarahkan ke `/dashboard`."
   *(Kondisi tercatat pada backlog: "Tombol "Kembali ke Dashboard" pada halaman Error 403 secara statis mengarahkan seluruh pengguna ke `/dashboard` (Pulse Dashboard), sehingga karyawan biasa (EMPLOYEE) mendarat di dashboard operasional manajerial dan bukan di halaman kerja kanonikalnya (`/daily/morning`).")*
3. **Konteks Temuan:** Penanganan Error Otorisasi — Halaman Akses Terlarang (`/forbidden` / `ErrorPageView.vue`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 25-27 `frontend/src/views/system/ErrorPageView.vue`, tombol pemulihan mengarahkan secara statis: `<router-link :to="auth.isAuthenticated ? '/dashboard' : '/login'" class="back-link">`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Tautan pemulihan halaman 403 diharapkan mengarahkan pengguna ke rute pendaratan kanonikal sesuai perannya (`getLandingRouteForRole()`), mengingat peran seperti `SYSTEM_ADMIN` memiliki rute pendaratan di modul administrasi, bukan dashboard.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/system/ErrorPageView.vue` L25-L27; `frontend/src/router/navigation.ts` L110-L135; Test Case: `TC-AUTH-005`.
   - **Kategori Backlog:** `Navigation & Architecture` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-AUTH-005``
7. **Area Terdampak:** Frontend UI (`ErrorPageView.vue`), Navigation Error Handling.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Nilai prop `to` pada tautan pemulihan dikodekan statis mengarah ke `/dashboard` jika terotentikasi.
   - *Hipotesis Penyebab:* Asumsi bahwa dashboard merupakan beranda universal untuk seluruh jenis peran pengguna.
9. **Dampak (Impact):** Sedang (Medium) — Pengguna dengan peran yang tidak memiliki akses ke `/dashboard` berisiko mengalami kendala navigasi berulang saat menekan tombol pemulihan.
10. **Relevansi Pasca Cycle 1:** Relevan untuk integritas navigasi otorisasi sistem.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta rute statis terbukti nyata pada baris 25 `ErrorPageView.vue`.
    - *Indikasi Hubungan / Overlap:* Mandiri (Aspek Error Handling & Navigation Routing).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian rute tombol pemulihan error 403 agar mengacu secara dinamis pada rute kanonikal masing-masing peran.

---

### IMP-024: Penyeragaman Topbar Administrasi Menggunakan Breadcrumb Hirarkis Menggantikan Badge Duplikat WP

1. **Finding ID:** `IMP-024`
2. **Deskripsi Asli:**
   > "Selaraskan topbar administrasi dengan standar global layout WorkPulse (seperti pada modul Management/Team Pulse), yaitu mengganti badge logo dengan breadcrumb hirarkis bersih (contoh: `Administration / Struktur Organisasi` atau `Administration / Kebijakan Operasional`)."
   *(Kondisi tercatat pada backlog: "Bar navigasi bagian atas pada halaman-halaman administrasi menampilkan badge logo statis "WP WorkPulse" beserta label tag modul, padahal logo dan nama brand WorkPulse sudah tersemat secara permanen di sidebar kiri.")*
3. **Konteks Temuan:** Modul Administrasi — Header Navigasi Modul Admin (`/admin/organization`, `/admin/policies`, `/admin/users`, `/admin/temporary-reviewers`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Seluruh halaman admin menampilkan logo badge WP di sisi kiri header dan teks judul statis tanpa penanda hirarki breadcrumb.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan standar rancangan antarmuka enterprise, area header diharapkan menyajikan breadcrumb hirarkis (contoh: `Administration / Struktur Organisasi`) untuk memperjelas posisi navigasi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/admin/OrgMappingView.vue` L2-L6; `frontend/src/views/admin/PolicySettingsView.vue` L2-L6; `frontend/src/views/admin/AdminUsersView.vue` L2-L6; Test Case: `TC-POL-001`, `TC-AUTH-005`.
   - **Kategori Backlog:** `Navigation & Consistency` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-ADMN-002`, `TC-ADMN-001``
7. **Area Terdampak:** Frontend Admin Views (`OrgMappingView.vue`, `PolicySettingsView.vue`, `AdminUsersView.vue`, `TempReviewerView.vue`).
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Struktur header pada seluruh tampilan admin menggunakan markup logo badge dan teks statis lokal.
   - *Hipotesis Penyebab:* Header pada halaman admin dibuat dengan menduplikasi struktur template awal tanpa penataan breadcrumb terpadu.
9. **Dampak (Impact):** Rendah (Low) — Orientasi navigasi pengguna saat berada di dalam modul administrasi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta ketiadaan breadcrumb hirarkis terverifikasi nyata pada seluruh file tampilan modul administrasi.
    - *Indikasi Hubungan / Overlap:* Kluster Topbar Global (berkaitan dengan IMP-014, IMP-019, IMP-025, IMP-043).
12. **Kesimpulan Investigasi:** Dianjurkan penerapan breadcrumb hirarkis pada modul administrasi guna meningkatkan kejelasan orientasi navigasi.

---

### IMP-025: Konsolidasi Topbar Administrasi: Eliminasi Tautan Navigasi Duplikat & Penggantian Teks Profil dengan Avatar Inisial Bulat

1. **Finding ID:** `IMP-025`
2. **Deskripsi Asli:**
   > "Bersihkan header atas dari tautan menu duplikat (cukup dikelola melalui sidebar). Di sisi kanan header atas, ganti teks "Profil Saya" dengan avatar inisial bulat standar (`SA` untuk System Admin) yang dilengkapi dropdown menu ringkas profil/logout serta ikon lonceng notifikasi terpadu."
   *(Kondisi tercatat pada backlog: "Topbar administrasi memuat tautan horizontal teks ('Kelola Pengguna', 'Reviewer Sementara', 'Pengaturan Kebijakan', 'Profil Saya') yang sepenuhnya menduplikasi menu yang telah tersedia di sidebar grup *Administration*. Tautan profil juga hanya berupa teks "Profil Saya" polos tanpa avatar maupun bel notifikasi.")*
3. **Konteks Temuan:** Modul Administrasi — Topbar Navigasi Kanan Modul Admin.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Topbar kanan pada halaman-halaman administrasi merender deretan tautan horizontal (`Kelola Pengguna`, `Reviewer Sementara`, `Profil Saya`) yang mengulang menu di sidebar.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Topbar kanan diharapkan bebas dari duplikasi menu sidebar dan diselaraskan dengan standar antarmuka yang bersih (hanya memuat notifikasi dan avatar profil).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/admin/OrgMappingView.vue` L7-L11; `frontend/src/views/admin/PolicySettingsView.vue` L7-L13; Test Case: `TC-POL-001`, `TC-AUTH-005`.
   - **Kategori Backlog:** `UI/UX & Information Architecture` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-ADMN-002`, `TC-AUTH-007``
7. **Area Terdampak:** Frontend Admin Views Topbar Area.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Elemen navigasi horizontal dideklarasikan langsung pada template header halaman admin.
   - *Hipotesis Penyebab:* Peninggalan navigasi gaya lama sebelum komponen enterprise sidebar dipasang secara permanen.
9. **Dampak (Impact):** Rendah (Low) — Kerapian tata letak dan pencegahan redundansi jalur navigasi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta keberadaan deretan tautan navigasi duplikat pada topbar admin terverifikasi nyata.
    - *Indikasi Hubungan / Overlap:* Kluster Topbar Global (berkaitan dengan IMP-014, IMP-019, IMP-024, IMP-043).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan deretan tautan duplikat pada header admin dan penyelarasan dengan elemen profil terstandarisasi.

---

### IMP-026: Tata Kelola Persona Akun SYSTEM_ADMIN: Penonaktifan Akses dan Grup Navigasi 'Workspace'

1. **Finding ID:** `IMP-026`
2. **Deskripsi Asli:**
   > "Terapkan pemisahan tugas (*Separation of Duties*) tegas pada tingkat navigasi dan hak akses: Akun `SYSTEM_ADMIN` adalah identitas pengelola sistem (bukan jabatan operasional karyawan perusahaan). Nonaktifkan grup navigasi *Workspace* untuk peran `SYSTEM_ADMIN`, sehingga akun admin murni hanya mengelola konfigurasi sistem (*Administration*) dan pemantauan eskalasi/audit (*Management*). Setiap PIC pengelola admin (misal HRGA/IT) yang memiliki kewajiban komitmen harian tetap menggunakan akun karyawan pribadinya masing-masing."
   *(Kondisi tercatat pada backlog: "Akun berkedudukan peran `SYSTEM_ADMIN` saat ini masih melihat dan memiliki akses ke grup menu *Workspace* (Morning Commitment, Additional Work, EOD Outcome, Lapor Blocker, Cuti Saya, Koreksi).")*
3. **Konteks Temuan:** Tata Kelola Peran Pengguna — Navigasi dan Hak Akses `SYSTEM_ADMIN`.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada `frontend/src/router/navigation.ts` baris 50-63, item dalam grup navigasi `Workspace` tidak memiliki atribut batasan `roles`, sehingga seluruh menu kerja harian staf (Morning Commitment, Additional Work, EOD Outcome) tampil pada persona `SYSTEM_ADMIN`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai prinsip pemisahan peran dan wewenang (PRD v1.6 §2.3), persona `SYSTEM_ADMIN` berfokus pada administrasi sistem dan struktur organisasi, bukan pengisian komitmen kerja harian operasional.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/router/navigation.ts` L50-L63, L122-L125; Test Case: `TC-AUTH-005`, `TC-POL-001`.
   - **Kategori Backlog:** `Architecture & Separation of Duties (IAM)` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-AUTH-005`, `TC-ADMN-002``
7. **Area Terdampak:** Frontend Router Navigation (`router/navigation.ts`), Role Navigation Config.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Konfigurasi navigasi grup `Workspace` tidak menyertakan filter peran pada item-itemnya sehingga otomatis diwariskan ke semua peran.
   - *Hipotesis Penyebab:* Konfigurasi grup navigasi awal dibuat terbuka untuk mempercepat pengujian antarmuka tanpa pembatasan peran staf.
9. **Dampak (Impact):** Sedang (Medium) — Menu operasional harian yang tidak relevan tampil pada sidebar System Administrator.
10. **Relevansi Pasca Cycle 1:** Relevan untuk penegakan tata kelola persona pengguna.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta ketiadaan filter peran pada grup Workspace terverifikasi pada kode sumber `navigation.ts`.
    - *Indikasi Hubungan / Overlap:* Mandiri (Aspek Tata Kelola Peran & Router Navigation).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian konfigurasi navigasi agar grup Workspace dikhususkan bagi peran operasional dan dikecualikan dari persona SYSTEM_ADMIN.

---

### IMP-027: Restrukturisasi & Pembersihan Kartu Metrik Konteks Hari Ini di Formulir Morning Commitment

1. **Finding ID:** `IMP-027`
2. **Deskripsi Asli:**
   > "1. Ganti label tag biru di sudut kanan atas menjadi Hari & Tanggal dinamis yang jelas (contoh: "Jumat, 30 Oktober 2026")."
   *(Kondisi tercatat pada backlog: "Kartu konteks jadwal memuat tag biru di kanan atas ("Kebijakan: On-Time ... Cut-off ..."), subkotak 1 memuat tanggal dengan subteks "Hari Kerja Aktif", subkotak 2 memuat batas on-time dengan subteks "Cut-Off Penguncian: ...", subkotak 3 memuat subteks "Jam Server: ...", dan subkotak 4 memuat subteks "Agregasi Tingkat Risiko". Layout terkesan padat dan redundan.")*
3. **Konteks Temuan:** Formulir Morning Commitment — Panel Konteks Hari Ini (`/daily/morning`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 334-365 `frontend/src/views/daily/MorningCommitmentView.vue`, panel Konteks Hari Ini menampilkan 4 kartu grid yang memuat metrik teknis 'Initial Daily Status' sebelum formulir disubmit.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan Prototipe 02 (`02-Morning-Commitment.html` L98-L135), kartu konteks dirancang fokus pada 3 informasi utama: (1) Tanggal Kerja & Jam Server, (2) Batas Waktu Komitmen (On-Time & Lock), (3) Status Pengisian Pengguna.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L324-L367; Acuan Desain: `02-Morning-Commitment.html` L98-L135; Test Case: `TC-DLYM-001`.
   - **Kategori Backlog:** `Layout & Visual Cleanliness` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYM-001`, `TC-DLYM-002``
7. **Area Terdampak:** Frontend UI (`MorningCommitmentView.vue`), Context Panel Grid.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Template panel konteks merender 4 elemen kartu termasuk kalkulasi kalkulatif 'Initial Daily Status'.
   - *Hipotesis Penyebab:* Penyusunan kartu metrik menyertakan visualisasi kalkulasi risiko dini yang belum tentu relevan sebelum komitmen dikirimkan.
9. **Dampak (Impact):** Rendah (Low) — Potensi kebingungan staf terhadap metrik status sebelum melakukan submission.
10. **Relevansi Pasca Cycle 1:** Relevan. Form locking Cycle 1 telah memverifikasi timestamp submission, sehingga status pengisian dapat ditampilkan dengan akurat.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta keberadaan 4 kartu metrik dengan istilah kalkulatif terverifikasi nyata pada baris 334-365.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Morning Commitment (berkaitan dengan IMP-028 s.d. IMP-030).
12. **Kesimpulan Investigasi:** Dianjurkan penyederhanaan panel konteks menjadi 3 kartu kontekstual yang relevan sesuai rancangan Prototipe 02.

---

### IMP-028: Penyempurnaan Microcopy Banner Keterlambatan Pengisian Komitmen (Eliminasi Istilah Grace Period yang Membingungkan)

1. **Finding ID:** `IMP-028`
2. **Deskripsi Asli:**
   > "Sederhanakan microcopy menjadi kalimat lugas, manusiawi, dan jelas, contohnya: `"Pengisian Melewati Batas Waktu: Batas waktu On-Time (09:00 WIB) telah berakhir, namun Anda masih dapat mengirimkan komitmen sebelum sistem terkunci pada pukul 23:59 WIB. Komitmen Anda hari ini akan dicatat dengan status Terlambat (LATE)."`"
   *(Kondisi tercatat pada backlog: "Banner amber pada kondisi keterlambatan menampilkan teks teknis: `"Jendela Grace Period / Late Aktif (09:00 – 23:59 WIB): Batas waktu On-Time telah terlewati, namun Anda masih berada sebelum batas cut-off penguncian. Komitmen yang dikirim sekarang langsung sah dengan status LATE."` Frasa "Jendela Grace Period / Late Aktif" dinilai membingungkan karyawan biasa.")*
3. **Konteks Temuan:** Formulir Morning Commitment — Banner Peringatan Keterlambatan (`/daily/morning`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 401 `frontend/src/views/daily/MorningCommitmentView.vue`, banner menampilkan istilah: `<strong>Jendela Grace Period / Late Aktif ({{ morningOnTimeCutoff }} – {{ morningLockCutoff }} WIB):</strong>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Microcopy banner diharapkan menggunakan bahasa operasional kerja yang lugas dan mudah dipahami, tanpa menggunakan jargon teknis 'Grace Period'.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L400-L404; Test Case: `TC-DLYM-002`.
   - **Kategori Backlog:** `Microcopy & UX Content` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYM-001`, `TC-DLYM-005``
7. **Area Terdampak:** Frontend UI (`MorningCommitmentView.vue`), Late Alert Banner.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String 'Grace Period' tercantum eksplisit pada markup template banner keterlambatan.
   - *Hipotesis Penyebab:* Istilah arsitektur kebijakan waktu toleransi diadopsi secara mentah ke dalam teks antarmuka pengguna.
9. **Dampak (Impact):** Rendah (Low) — Pemahaman staf mengenai status pengisian keterlambatan.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta penggunaan istilah 'Grace Period' terverifikasi nyata pada baris 401 `MorningCommitmentView.vue`.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Morning Commitment (berkaitan dengan IMP-027, IMP-029, IMP-030).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian redaksional banner keterlambatan menggunakan terminologi operasional yang komunikatif.

---

### IMP-029: Eliminasi Kode Keputusan Arsitektur Internal 'DEC-004' dari Label Checkbox Komitmen Nol

1. **Finding ID:** `IMP-029`
2. **Deskripsi Asli:**
   > "Hapus kode teknis `— DEC-004` dari antarmuka pengguna akhir (*end-user*). Ubah label menjadi bahasa bisnis yang bersih dan natural, contoh: `"Hari ini tidak ada komitmen harian terencana (0 Komitmen)"` atau `"Saya tidak memiliki komitmen harian terencana untuk hari ini"`."
   *(Kondisi tercatat pada backlog: "Label checkbox komitmen nol memuat kode arsitektur internal spesifikasi teknis: `"Hari ini tidak ada komitmen harian khusus (0 Komitmen / Zero Commitment — DEC-004)"`.")*
3. **Konteks Temuan:** Formulir Morning Commitment — Opsi Komitmen Nol (`/daily/morning`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 148, 163, 198, 203, dan 414 `frontend/src/views/daily/MorningCommitmentView.vue`, kode arsitektur internal `DEC-004` tercantum pada label checkbox dan pesan error antarmuka: `(0 Komitmen / Zero Commitment — DEC-004)`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai etika penyajian antarmuka enterprise, kode keputusan arsitektur internal tidak dicantumkan pada elemen teks yang dihadirkan kepada pengguna akhir.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L148, L163, L198, L203, L414; Test Case: `TC-DLYM-001`, `TC-DLYM-003`.
   - **Kategori Backlog:** `Copywriting & Polish` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYM-002``
7. **Area Terdampak:** Frontend UI (`MorningCommitmentView.vue`), Checkbox Label & Error Toasts.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Kode referensi arsitektur `DEC-004` tercantum pada teks label checkbox dan pesan toast validasi.
   - *Hipotesis Penyebab:* Penyematan nomor ADR dilakukan saat implementasi awal untuk memudahkan pelacakan acuan aturan bisnis.
9. **Dampak (Impact):** Rendah (Low) — Tampilan antarmuka memuat referensi teknis yang tidak relevan bagi pengguna umum.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta string 'DEC-004' terverifikasi muncul di 5 lokasi kode pada `MorningCommitmentView.vue`.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Morning Commitment (berkaitan dengan IMP-027, IMP-028, IMP-030).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan kode referensi internal 'DEC-004' dari seluruh label dan notifikasi validasi formulir.

---

### IMP-030: Transformasi Microcopy Penjelasan Komitmen Nol dari Enum Database Teknis Menjadi Bahasa Bisnis

1. **Finding ID:** `IMP-030`
2. **Deskripsi Asli:**
   > "Ubah narasi menjadi bahasa bisnis yang menenangkan dan mudah dipahami, contoh: `"Hari Anda akan dicatat resmi sebagai 'Bebas Komitmen (Disetujui)', sehingga Anda tetap aman dan terbebas dari catatan Pelanggaran Pengisian (No Submission)."`"
   *(Kondisi tercatat pada backlog: "Subteks penjelasan setelah checkbox komitmen nol dicentang berbunyi teknis: `"Status hari ini akan tercatat sebagai NOT_APPLICABLE — NO_COMMITMENT (bukan No Submission)."`, mengekspos nama enum basis data internal sistem.")*
3. **Konteks Temuan:** Formulir Morning Commitment — Deskripsi Status Komitmen Nol (`/daily/morning`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 431 `frontend/src/views/daily/MorningCommitmentView.vue`, teks penjelasan status berbunyi: `Status hari ini akan tercatat sebagai <strong>NOT_APPLICABLE — NO_COMMITMENT</strong> (bukan No Submission).`
5. **Kondisi yang Diharapkan (Dasar Acuan):** Teks penjelasan diharapkan menyajikan bahasa bisnis yang jelas dan menenangkan bagi staf yang memang tidak memiliki tugas khusus, tanpa mengekspos identifier enum database mentah.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/MorningCommitmentView.vue` L430-L433; Test Case: `TC-DLYM-003`.
   - **Kategori Backlog:** `Microcopy & UX Communication` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYM-002``
7. **Area Terdampak:** Frontend UI (`MorningCommitmentView.vue`), Zero Commitment Hint Box.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Template menampilkan langsung nama enum teknis database `NOT_APPLICABLE_NO_COMMITMENT`.
   - *Hipotesis Penyebab:* Penjelasan status ditulis dengan mengutip langsung nama konstanta teknis backend.
9. **Dampak (Impact):** Rendah (Low) — Keterbacaan dan kenyamanan pemahaman bagi pengguna non-teknis.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta kebocoran teks enum database mentah terverifikasi nyata pada baris 431.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Morning Commitment (berkaitan dengan IMP-027, IMP-028, IMP-029).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian deskripsi status komitmen nol ke dalam istilah bisnis yang lugas.

---

### IMP-031: Eliminasi Kebocoran Kode Desain '(Prototipe 03)' pada Subtitle Halaman Additional Work

1. **Finding ID:** `IMP-031`
2. **Deskripsi Asli:**
   > "Hapus frasa `(Prototipe 03)` dan sempurnakan copywriting menjadi kalimat bisnis profesional, contoh: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi."`"
   *(Kondisi tercatat pada backlog: "Subtitle halaman berbunyi: `"Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari tanpa mengubah baseline komitmen pagi (Prototipe 03)."` Terdapat kebocoran istilah dokumen desain internal developer "(Prototipe 03)".")*
3. **Konteks Temuan:** Halaman Additional Work — Subtitle Heading (`/daily/additional-work`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 165 `frontend/src/views/daily/AdditionalWorkView.vue`, subtitle memuat kode acuan perancangan: `... tanpa mengubah baseline komitmen pagi (Prototipe 03).`
5. **Kondisi yang Diharapkan (Dasar Acuan):** Teks antarmuka produksi diharapkan bersih dari keterangan referensi prototipe desain.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/AdditionalWorkView.vue` L164-L166; Test Case: `TC-DLYA-001`.
   - **Kategori Backlog:** `Copywriting & Polish` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYA-001`, `TC-DLYA-002``
7. **Area Terdampak:** Frontend UI (`AdditionalWorkView.vue`), Page Subtitle.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String '(Prototipe 03)' tercantum eksplisit pada baris 165 file `AdditionalWorkView.vue`.
   - *Hipotesis Penyebab:* Teks judul dan subtitle disalin langsung dari dokumen acuan prototipe beserta penanda berkasnya.
9. **Dampak (Impact):** Rendah (Low) — Kerapian teks antarmuka produksi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta keberadaan teks '(Prototipe 03)' terverifikasi nyata pada baris 165.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Additional Work (berkaitan dengan IMP-032, IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penghapusan teks penanda '(Prototipe 03)' dari subtitle halaman.

---

### IMP-032: Perbaikan Overflow Horizontal Kolom Input Atasan Penugas pada Grid Dua Kolom Additional Work

1. **Finding ID:** `IMP-032`
2. **Deskripsi Asli:**
   > "Tambahkan aturan CSS `min-width: 0;` pada elemen `.form-group` dan batasi lebar elemen `.input-control` select dengan `width: 100%; max-width: 100%; text-overflow: ellipsis;` serta filter daftar pilihan agar hanya memuat atasan/pejabat yang relevan (bukan diri sendiri atau karyawan baru)."
   *(Kondisi tercatat pada backlog: "Kolom select "Ditugaskan Oleh (Atasan Langsung/Lead) *" melebar melampaui batas tepi kanan panel kontainer induknya (*horizontal overflow*) karena teks nama lengkap, jabatan, dan email atasan cukup panjang, sementara grid kolom tidak memiliki pembatas lebar tegas (`min-width: 0`).")*
3. **Konteks Temuan:** Formulir Additional Work — Tata Letak Grid Input Atasan Penugas (`/daily/additional-work`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 202-223 dan 455-459 `frontend/src/views/daily/AdditionalWorkView.vue`, formulir menggunakan styling grid 2-kolom tetap (`grid-template-columns: 1fr 1fr;`). Ketika opsi 'Penugasan Baru dari Atasan' dipilih, dropdown atasan muncul dengan format nama dan email panjang, memicu penyempitan kolom dan potensi pemotongan teks pada layar tertentu.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Tata letak kolom formulir diharapkan fleksibel dan responsif sehingga data atasan penugas dapat dibaca secara utuh tanpa mengganggu keseimbangan visual antarmuka.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/AdditionalWorkView.vue` L202-L223, L455-L459; Test Case: `TC-DLYA-001`.
   - **Kategori Backlog:** `Layout & Responsive Styling` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-DLYA-002``
7. **Area Terdampak:** Frontend UI (`AdditionalWorkView.vue`), CSS Form Row Layout.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Aturan CSS `.form-row` menetapkan pembagian 2 kolom kaku tanpa penyesuaian saat field bersyarat muncul.
   - *Hipotesis Penyebab:* Styling form didesain untuk input berukuran pendek tanpa mempertimbangkan panjang string nama dan email pengguna.
9. **Dampak (Impact):** Sedang (Medium) — Keterbacaan dan kenyamanan pemilihan atasan saat mencatat pekerjaan tambahan.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta styling grid kaku dan potensi penyempitan teks terverifikasi nyata pada kode CSS dan template.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Additional Work (berkaitan dengan IMP-031, IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian tata letak grid agar lebih adaptif terhadap konten nama dan email atasan penugas.

---

### IMP-033: Restrukturisasi & Pembersihan Kartu Metrik Konteks Waktu EOD di Halaman EOD Outcome

1. **Finding ID:** `IMP-033`
2. **Deskripsi Asli:**
   > "Selaraskan dengan penyempurnaan kartu konteks pada Morning Commitment (`IMP-027`):"
   *(Kondisi tercatat pada backlog: "Kartu "Konteks Waktu EOD" memuat badge biru di kanan atas ("On-Time 17:00 · Cut-Off 21:00 WIB") serta 4 subkotak: Tanggal Kerja, Batas On-Time EOD, Status Waktu, dan Total Item Evaluasi. Formatnya serupa dengan halaman Morning Commitment yang dinilai terlalu padat.")*
3. **Konteks Temuan:** Halaman EOD Outcome — Panel Konteks Waktu EOD (`/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 335-358 `frontend/src/views/daily/EodOutcomeView.vue`, panel konteks waktu merender badge di header panel dan kartu grid yang mengulang informasi cut-off.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan Prototipe 04 (`04-EOD-Outcome.html` L95-L130), panel konteks waktu disajikan secara terstruktur dan proporsional (fokus pada tanggal kerja, batas evaluasi, dan rekapitulasi item yang dievaluasi).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L326-L359; Acuan Desain: `04-EOD-Outcome.html` L95-L130; Test Case: `TC-DLYE-001`.
   - **Kategori Backlog:** `Layout & Visual Cleanliness` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYE-001`, `TC-DLYA-001``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Context Panel Grid.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Panel konteks waktu merender beberapa penanda waktu yang berulang antara header dan isi kartu.
   - *Hipotesis Penyebab:* Pengembangan template EOD mengadopsi struktur awal tanpa perapian kartu metrik.
9. **Dampak (Impact):** Rendah (Low) — Kerapian penyajian informasi batas waktu evaluasi.
10. **Relevansi Pasca Cycle 1:** Relevan. Logika form lock EOD Cycle 1 telah aktif dan dapat terhubung secara harmonis dengan kartu konteks yang rapi.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta redundansi badge dan penyajian waktu terverifikasi nyata pada baris 335-358.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Evaluasi EOD (berkaitan dengan IMP-034 s.d. IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penataan panel konteks waktu EOD agar lebih proporsional dan selaras dengan rancangan prototipe.

---

### IMP-034: Eliminasi Kebocoran Kode Desain '(Prototipe 04)' pada Subtitle Halaman EOD Outcome

1. **Finding ID:** `IMP-034`
2. **Deskripsi Asli:**
   > "Hapus kode teks `(Prototipe 04)` dan poles kalimat menjadi elegan: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel."`"
   *(Kondisi tercatat pada backlog: "Subtitle halaman berbunyi: `"Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan kelanjutan tugas (Prototipe 04)."` Memuat teks kode artefak pengembang "(Prototipe 04)".")*
3. **Konteks Temuan:** Halaman EOD Outcome — Subtitle Heading (`/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 312 `frontend/src/views/daily/EodOutcomeView.vue`, subtitle memuat: `... dan tentukan kelanjutan tugas (Prototipe 04).`
5. **Kondisi yang Diharapkan (Dasar Acuan):** Teks subtitle antarmuka evaluasi sore diharapkan bersih dari kode penanda prototipe desain.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L310-L314; Test Case: `TC-DLYE-001`.
   - **Kategori Backlog:** `Copywriting & Polish` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYE-001``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Page Subtitle.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String '(Prototipe 04)' tercantum pada baris 312 file `EodOutcomeView.vue`.
   - *Hipotesis Penyebab:* Penanda nomor prototipe terbawa saat menyalin teks dari berkas desain HTML.
9. **Dampak (Impact):** Rendah (Low) — Kerapian teks antarmuka produksi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta string '(Prototipe 04)' terverifikasi nyata pada baris 312.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Evaluasi EOD (berkaitan dengan IMP-033, IMP-035 s.d. IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penghapusan teks penanda '(Prototipe 04)' dari subtitle halaman EOD.

---

### IMP-035: Eliminasi Kode Arsitektur 'DEC-003' & Penyempurnaan Narasi Humanis pada Seksi Refleksi Mandiri EOD

1. **Finding ID:** `IMP-035`
2. **Deskripsi Asli:**
   > "1. Ubah judul seksi menjadi bahasa bisnis yang bermartabat: `"Refleksi Mandiri Akhir Hari"` dengan badge keterangan `Penilaian Otonom Karyawan`."
   *(Kondisi tercatat pada backlog: "Judul seksi memuat: `"Refleksi Mandiri Karyawan (DEC-003)"` dengan badge `Proteksi Hak Opsi GREEN`. Paragraf penjelasnya berbunyi teknis dan defensif: `"Bagaimana penilaian mandiri Anda terhadap pencapaian keseluruhan hari ini? Sesuai DEC-003, sistem tidak pernah mengunci opsi GREEN secara punitif."`")*
3. **Konteks Temuan:** Halaman EOD Outcome — Seksi Refleksi Mandiri Karyawan (`/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 527 dan 534 `frontend/src/views/daily/EodOutcomeView.vue`, judul seksi memuat: `<div class="kicker">Refleksi Mandiri Karyawan (DEC-003)</div>` dan paragraf deskripsi menyebut `Sesuai DEC-003...`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Seksi refleksi mandiri diharapkan menggunakan penamaan bisnis yang profesional tanpa mencantumkan kode arsitektur internal `DEC-003` kepada pengguna akhir.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L527, L534; Test Case: `TC-DLYE-002`.
   - **Kategori Backlog:** `Microcopy & UX Communication` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-DLYE-002``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Self Reflection Area.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Kode referensi keputusan arsitektur `DEC-003` tercantum pada kicker dan narasi penjelasan seksi.
   - *Hipotesis Penyebab:* Penyebutan kode keputusan arsitektur dimaksudkan untuk menegaskan aturan anti-lock green secara internal, namun terbawa ke antarmuka produksi.
9. **Dampak (Impact):** Rendah (Low) — Tampilan memuat referensi teknis yang tidak perlu bagi karyawan.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta kemunculan string 'DEC-003' terverifikasi nyata pada baris 527 dan 534.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Evaluasi EOD (berkaitan dengan IMP-033, IMP-034, IMP-036 s.d. IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan kode 'DEC-003' dan penataan narasi refleksi mandiri secara profesional.

---

### IMP-036: Eliminasi Kode Enum Teknis 'CONTINUE', 'DO_NOT_CONTINUE', dan 'NOT_COMPLETED' pada Opsi Evaluasi EOD

1. **Finding ID:** `IMP-036`
2. **Deskripsi Asli:**
   > "Hapus seluruh nama enum berkode huruf besar dan bergaris bawah dari antarmuka pengguna akhir. Gunakan bahasa Indonesia bisnis yang natural dengan pemisah spasi:"
   *(Kondisi tercatat pada backlog: "Label pada tombol pilihan capaian dan keputusan kelanjutan memuat nama enum kode basis data internal sistem yang dipisahkan garis bawah (*underscore*), seperti: `"Belum Selesai (NOT_COMPLETED)"`, `"Lanjutkan Besok (CONTINUE → Carry-Over)"`, dan `"Jangan Lanjutkan (DO_NOT_CONTINUE)"`.")*
3. **Konteks Temuan:** Formulir EOD Outcome — Label Opsi Pilihan Capaian & Kelanjutan (`/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 432, 436, 460, 464 `frontend/src/views/daily/EodOutcomeView.vue`, label radio button menampilkan nama enum teknis: `Belum Selesai (NOT_COMPLETED)`, `Dibatalkan (CANCELLED)`, `Lanjutkan Besok (CONTINUE → Carry-Over)`, dan `Jangan Lanjutkan (DO_NOT_CONTINUE)`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Label opsi formulir diharapkan bersih dari nama identifier kode enum backend, menyajikan istilah bahasa Indonesia yang jelas bagi pengguna.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L432, L436, L460, L464; Test Case: `TC-DLYE-001`, `TC-DLYE-002`.
   - **Kategori Backlog:** `Copywriting & Polish` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYE-001`, `TC-DLYE-002``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Radio Option Labels.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Nama konstanta enum dikombinasikan secara eksplisit ke dalam teks label radio button.
   - *Hipotesis Penyebab:* Penamaan opsi ditujukan untuk memudahkan penyesuaian terhadap payload API saat awal pengkodean form.
9. **Dampak (Impact):** Rendah (Low) — Antarmuka tampak teknis dan kurang rapi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta nama identifier enum tercantum pada label radio terverifikasi nyata.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Evaluasi EOD (berkaitan dengan IMP-033 s.d. IMP-035, IMP-037 s.d. IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan nama identifier enum dari label opsi formulir evaluasi EOD.

---

### IMP-037: Perbaikan Tata Letak Kolom Textarea Catatan Kelanjutan Tugas EOD (Pelebaran 100% & Penyelarasan Label Vertikal)

1. **Finding ID:** `IMP-037`
2. **Deskripsi Asli:**
   > "Selaraskan styling `.mt-2` atau `.form-group` agar menggunakan layout vertikal (`display: flex; flex-direction: column; gap: 6px;`) dan terapkan `width: 100%;` pada textarea `.input-control` agar membentang memenuhi lebar kartu dengan placeholder yang terbaca penuh."
   *(Kondisi tercatat pada backlog: "Kotak input "Catatan Kelanjutan (Continuation Reason) *" saat opsi lanjutkan besok dipilih memiliki layout rusak: teks judul dan textarea berada dalam satu baris horizontal sejajar di bagian bawah (*baseline alignment*), dan textarea berukuran mengotak kecil (mengikuti default browser cols) sehingga teks placeholder terpotong dan ruang kosong lebar di sebelah kanannya terbuang sia-sia.")*
3. **Konteks Temuan:** Formulir EOD Outcome — Tata Letak Textarea Catatan Kelanjutan (`/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 468-478 `frontend/src/views/daily/EodOutcomeView.vue`, saat opsi 'Lanjutkan Besok' dipilih, textarea catatan kelanjutan berada dalam container `.mt-2` di dalam `.conditional-box` tanpa pengaturan lebar eksplisit 100%, sehingga terasa sempit pada viewport tertentu.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Kolom input textarea catatan kelanjutan diharapkan memiliki lebar penuh (100%) dan penataan label vertikal yang terstruktur rapi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L468-L478, L1034-L1070; Test Case: `TC-DLYE-001`.
   - **Kategori Backlog:** `Layout & Visual Polish` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-DLYE-001``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Conditional Box Styling.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Elemen `.input-control` pada konteks `.conditional-box` tidak memiliki deklarasi `width: 100%` secara tegas.
   - *Hipotesis Penyebab:* Penerapan styling textarea mewarisi batas lebar flex container induknya.
9. **Dampak (Impact):** Rendah (Low) — Kenyamanan pengetikan catatan rencana kelanjutan komitmen.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta tidak adanya lebar penuh pada textarea catatan kelanjutan terverifikasi pada CSS dan markup.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Evaluasi EOD (berkaitan dengan IMP-033 s.d. IMP-036, IMP-038, IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian styling textarea catatan kelanjutan agar memanfaatkan lebar penuh secara proporsional.

---

### IMP-038: Penyelarasan Kelengkapan Opsi Evaluasi Pekerjaan Tambahan (Opsi Dibatalkan & Alur Kelanjutan / Alasan)

1. **Finding ID:** `IMP-038`
2. **Deskripsi Asli:**
   > "Selaraskan kapabilitas evaluasi pekerjaan tambahan dengan evaluasi komitmen pagi:"
   *(Kondisi tercatat pada backlog: "Seksi "Evaluasi Pekerjaan Tambahan" di halaman EOD saat ini hanya menyediakan 3 opsi capaian (Selesai, Sebagian, Belum Selesai) tanpa opsi "Dibatalkan", dan jika pengguna memilih Sebagian atau Belum Selesai, tidak muncul form keputusan kelanjutan tugas maupun catatan alasan seperti halnya pada evaluasi komitmen pagi.")*
3. **Konteks Temuan:** Halaman EOD Outcome — Evaluasi Pekerjaan Tambahan (`/daily/eod`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 504-516 `frontend/src/views/daily/EodOutcomeView.vue`, kartu evaluasi pekerjaan tambahan hanya menyediakan 3 pilihan radio (`COMPLETED`, `PARTIALLY_COMPLETED`, `NOT_COMPLETED`). Opsi `CANCELLED` dan blok keputusan kelanjutan tugas belum dirender pada template, meskipun skema tipe data (baris 29) dan validasi script (baris 168) telah menyediakannya.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan prinsip kesetaraan evaluasi dan Prototipe 04 (`04-EOD-Outcome.html` L180-L215), evaluasi pekerjaan tambahan diharapkan memiliki kelengkapan opsi yang setara dengan komitmen pagi (termasuk opsi dibatalkan beserta alasannya, dan keputusan kelanjutan tugas).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L29, L168, L504-L516; Acuan Desain: `04-EOD-Outcome.html` L180-L215; Test Case: `TC-DLYE-001`, `TC-DLYA-001`.
   - **Kategori Backlog:** `Functional Consistency & Business Logic` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-DLYE-001`, `TC-DLYA-001``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Additional Work Evaluation Template.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Markup radio button opsi pembatalan dan blok kelanjutan tugas belum disertakan pada template perulangan pekerjaan tambahan di Vue.
   - *Hipotesis Penyebab:* Implementasi template evaluasi pekerjaan tambahan disederhanakan saat pembuatan awal komponen EOD.
9. **Dampak (Impact):** Sedang (Medium) — Karyawan tidak dapat mencatat pembatalan pekerjaan tambahan yang tidak jadi dieksekusi saat evaluasi sore.
10. **Relevansi Pasca Cycle 1:** Relevan. Berada pada komponen evaluasi EOD yang baru diperbaiki pengunciannya pada Cycle 1.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta ketiadaan opsi CANCELLED pada template terverifikasi nyata berbanding tipe data script.
    - *Indikasi Hubungan / Overlap:* Kluster Halaman Evaluasi EOD (berkaitan dengan IMP-033 s.d. IMP-037, IMP-039).
12. **Kesimpulan Investigasi:** Dianjurkan penambahan opsi evaluasi pembatalan dan keputusan kelanjutan pada seksi evaluasi pekerjaan tambahan agar memiliki kesetaraan fitur.

---

### IMP-039: Transformasi Format Badge Alasan Pekerjaan Tambahan dari Enum Raw Database Menjadi Bahasa Bisnis

1. **Finding ID:** `IMP-039`
2. **Deskripsi Asli:**
   > "Terapkan pemetaan label ramah pengguna (*human-friendly formatter*), contoh:"
   *(Kondisi tercatat pada backlog: "Badge status pada kartu pekerjaan tambahan menampilkan langsung nama enum raw basis data: `NEWLY_ASSIGNED`, `OPERATIONAL_INCIDENT`, dsb. yang menggunakan huruf kapital dan garis bawah (*underscore*).")*
3. **Konteks Temuan:** Seksi Evaluasi & Daftar Pekerjaan Tambahan (`/daily/eod` dan `/daily/additional-work`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 498 `frontend/src/views/daily/EodOutcomeView.vue` dan baris 258 `AdditionalWorkView.vue`, badge alasan pekerjaan tambahan mencetak langsung string enum mentah: `{{ w.reason }}` (misal: `NEWLY_ASSIGNED`, `OPERATIONAL_INCIDENT`, `MISSED_IN_PLANNING`).
5. **Kondisi yang Diharapkan (Dasar Acuan):** Badge alasan diharapkan menyajikan label ramah pengguna dalam bahasa Indonesia (contoh: 'Penugasan Baru Atasan', 'Insiden Operasional', 'Kebutuhan Lapangan').
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L498; `frontend/src/views/daily/AdditionalWorkView.vue` L258; Test Case: `TC-DLYA-001`.
   - **Kategori Backlog:** `Microcopy & UX Communication` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-DLYA-001``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`, `AdditionalWorkView.vue`), Enum Formatter Helper.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Elemen badge melakukan interpolasi langsung nilai enum database tanpa fungsi pemetaan label.
   - *Hipotesis Penyebab:* Ketiadaan fungsi pemformatan teks terpusat untuk kamus data alasan pekerjaan tambahan.
9. **Dampak (Impact):** Rendah (Low) — Keterbacaan dan kerapian penyajian data operasional.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta pencetakan langsung string enum mentah pada elemen badge terverifikasi nyata pada kedua view.
    - *Indikasi Hubungan / Overlap:* Kluster Formulir Additional Work & EOD (berkaitan dengan IMP-031, IMP-032, IMP-038).
12. **Kesimpulan Investigasi:** Dianjurkan penyediaan fungsi pemetaan label bahasa Indonesia untuk badge alasan pekerjaan tambahan.

---

### IMP-040: Pengalihan Tombol 'Lapor Blocker' Menjadi Navigasi Langsung ke /blockers/raise (Eliminasi Modal Pop-Up Redundan)

1. **Finding ID:** `IMP-040`
2. **Deskripsi Asli:**
   > "Hapus implementasi modal pop-up pada tombol tersebut. Selaraskan seluruh tombol "Lapor Blocker" pada 3 sub-halaman My Today agar secara konsisten langsung mengarahkan (*direct navigate*) ke halaman kanonikal `/blockers/raise` dengan posisi tata letak yang presisi di sisi kanan tab navigasi."
   *(Kondisi tercatat pada backlog: "Tombol "+ Laporkan Blocker Mendesak" di halaman EOD memunculkan modal dialog pop-up terpisah (`media_1793343838939_99a0aba8.png`), padahal sistem telah memiliki halaman formulir pelaporan mandiri resmi di `/blockers/raise`.")*
3. **Konteks Temuan:** Alur Pelaporan Kendala — Integrasi Tombol Blocker dari Halaman Kerja Harian.
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 316-322 `frontend/src/views/daily/EodOutcomeView.vue`, tombol '+ Laporkan Blocker Mendesak' mengaktifkan modal dialog lokal (`@click="isBlockerModalOpen = true"`) yang terpisah dari halaman pelaporan blocker kanonikal.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai alur kerja terpadu (Prototipe 05), tombol tindakan pelaporan blocker diharapkan mengarahkan pengguna secara konsisten ke halaman pelaporan resmi `/blockers/raise`.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/daily/EodOutcomeView.vue` L316-L322; Acuan Desain: `05-Raise-Instant-Blocker.html`; Test Case: `TC-BLKR-001`, `TC-DLYE-001`.
   - **Kategori Backlog:** `Navigation & Consistency` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-BLKR-001`, `TC-DLYE-001``
7. **Area Terdampak:** Frontend UI (`EodOutcomeView.vue`), Action Handler.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Event click tombol dikaitkan dengan variabel state lokal `isBlockerModalOpen`.
   - *Hipotesis Penyebab:* Bentuk eksperimen awal dialog pelaporan cepat yang belum diintegrasikan ke rute kanonikal blocker.
9. **Dampak (Impact):** Sedang (Medium) — Variasi alur di mana pelaporan blocker via modal terpisah dari alur resmi pelaporan kendala ber-SLA.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta event click memicu modal lokal redundan terverifikasi nyata pada baris 319.
    - *Indikasi Hubungan / Overlap:* Kluster Alur & Halaman Pelaporan Blocker (berkaitan dengan IMP-016, IMP-041 s.d. IMP-044).
12. **Kesimpulan Investigasi:** Dianjurkan penyelarasan aksi tombol pelaporan blocker agar mengarah secara langsung ke rute pelaporan resmi.

---

### IMP-041: Penyelarasan Menyeluruh Halaman Blocker Sesuai Prototipe 05: Tombol Kembali, Judul & 2 Tab (Buat Laporan & Blocker Saya)

1. **Finding ID:** `IMP-041`
2. **Deskripsi Asli:**
   > "Selaraskan 100% struktur konten halaman dengan acuan resmi Prototipe 05 (`05-Raise-Instant-Blocker.html`):"
   *(Kondisi tercatat pada backlog: "Halaman `/blockers/raise` saat ini hanya menampilkan form input tunggal statis dengan kicker "MANAJEMEN KENDALA & ESKALASI OTOMATIS", tanpa tombol tautan kembali ke My Today, serta tidak menyediakan tab "Blocker Saya" untuk memantau status blocker yang pernah dilaporkan karyawan.")*
3. **Konteks Temuan:** Modul Manajemen Kendala — Halaman Laporkan & Pantau Blocker (`/blockers/raise`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Halaman `frontend/src/views/blockers/RaiseBlockerView.vue` saat ini berupa formulir input tunggal tanpa tombol kembali ke workspace dan belum menyediakan sistem 2 tab sesuai Prototipe 05.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 05 (`05-Raise-Instant-Blocker.html` L85-L160), halaman pelaporan blocker dilengkapi tombol kembali ke workspace serta sistem 2 tab: 'Buat Laporan Kendala' (form aktif) dan 'Blocker Saya' (riwayat pemantauan tiket staf).
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/blockers/RaiseBlockerView.vue` L152-L220; Acuan Desain: `05-Raise-Instant-Blocker.html` L85-L160; Test Case: `TC-BLKR-001`, `TC-BLKR-005`.
   - **Kategori Backlog:** `Layout & Information Architecture` | **Prioritas Backlog:** `High` | **Test Case:** ``TC-BLKR-001`, `TC-BLKR-005``
7. **Area Terdampak:** Frontend UI (`RaiseBlockerView.vue`), Page Structure & Tab Navigation.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Halaman saat ini hanya mengimplementasikan form pengiriman tiket dan belum memuat markup tab pemantauan tiket pribadi.
   - *Hipotesis Penyebab:* Fokus awal pengembangan diarahkan pada penyelesaian fungsi pengiriman tiket kendala.
9. **Dampak (Impact):** Sedang (Medium) — Karyawan yang telah melaporkan kendala tidak dapat langsung memantau perkembangan status tiket pribadinya pada halaman yang sama.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta ketiadaan tombol navigasi kembali dan sistem 2 tab terverifikasi nyata terhadap acuan Prototipe 05.
    - *Indikasi Hubungan / Overlap:* Kluster Alur & Halaman Pelaporan Blocker (berkaitan dengan IMP-042 s.d. IMP-044).
12. **Kesimpulan Investigasi:** Dianjurkan penataan struktur halaman pelaporan blocker dengan menyertakan navigasi kembali dan sistem 2 tab sesuai acuan Prototipe 05.

---

### IMP-042: Eliminasi Tombol 'Lihat Antrean Blocker Aktif' dari Formulir Pelaporan Blocker Karyawan

1. **Finding ID:** `IMP-042`
2. **Deskripsi Asli:**
   > "Hapus tombol tersebut dari tampilan pengguna biasa (`EMPLOYEE`). Halaman antrean eskalasi blocker (`/blockers`) adalah wewenang pimpinan/manajemen yang telah diatur di navigasi *Management*. Karyawan biasa cukup memantau status tiketnya sendiri lewat Tab "Blocker Saya"."
   *(Kondisi tercatat pada backlog: "Di kanan atas halaman `/blockers/raise` terdapat tombol hijau outlined: `Lihat Antrean Blocker Aktif` yang jika diklik mengarahkan pengguna ke halaman antrean manajerial (`/blockers`).")*
3. **Konteks Temuan:** Modul Manajemen Kendala — Formulir Pelaporan Blocker Karyawan (`/blockers/raise`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 195-199 `frontend/src/views/blockers/RaiseBlockerView.vue`, area heading memuat tombol navigasi: `<AccessLink to="/blockers" class="btn-blocker-secondary">Lihat Antrean Blocker Aktif</AccessLink>`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Berdasarkan batasan hak akses (PRD v1.6 §3.2 dan `navigation.ts` L69), antrean blocker manajerial (`/blockers`) diperuntukkan bagi peran managerial (Lead/Supervisor/Head). Halaman staf diharapkan tidak memuat pintasan ke antrean manajerial.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/blockers/RaiseBlockerView.vue` L194-L200; `frontend/src/router/navigation.ts` L69; Test Case: `TC-BLKR-001`, `TC-AUTH-005`.
   - **Kategori Backlog:** `RBAC & Access Control` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-BLKR-001`, `TC-AUTH-005``
7. **Area Terdampak:** Frontend UI (`RaiseBlockerView.vue`), Heading Actions.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* Tautan ke rute manajerial `/blockers` disertakan pada tampilan umum staf tanpa pengecekan peran.
   - *Hipotesis Penyebab:* Penempatan tautan antrean blocker ditujukan sebagai jalan pintas pengujian selama fase awal pengembangan.
9. **Dampak (Impact):** Sedang (Medium) — Karyawan staf dapat mengklik tautan tersebut dan berpotensi menghadapi layar akses terlarang 403.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta tombol pintasan ke antrean manajerial tampil bebas pada form staf terverifikasi nyata.
    - *Indikasi Hubungan / Overlap:* Kluster Alur & Halaman Pelaporan Blocker (berkaitan dengan IMP-041, IMP-043, IMP-044).
12. **Kesimpulan Investigasi:** Dianjurkan penyesuaian tombol heading agar tautan antrean manajerial tidak ditampilkan pada persona staf biasa.

---

### IMP-043: Penyeragaman Topbar Blocker: Breadcrumb 'Workspace / Laporkan & Pantau Blocker', Avatar Inisial & Lonceng Notifikasi

1. **Finding ID:** `IMP-043`
2. **Deskripsi Asli:**
   > "1. Ubah breadcrumb menjadi: `Workspace / Laporkan & Pantau Blocker`."
   *(Kondisi tercatat pada backlog: "Breadcrumb kiri atas masih bertuliskan `Blocker / Laporkan Kendala Cepat (Prototipe 05)`. Sisi kanan atas memuat tombol teks `Antrean Tiket` dan `My Today` yang menempel di ujung layar peramban.")*
3. **Konteks Temuan:** Modul Manajemen Kendala — Header Topbar Halaman Blocker (`/blockers/raise`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 159 `frontend/src/views/blockers/RaiseBlockerView.vue`, breadcrumb tertulis `Blocker / Laporkan Kendala Cepat (Prototipe 05)`. Sisi kanan topbar merender deretan tombol pintasan manajerial.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Topbar diselaraskan dengan standar aplikasi: breadcrumb bersih `Workspace / Laporkan & Pantau Blocker` (tanpa kebocoran nama prototipe) dan elemen header terstandarisasi.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/blockers/RaiseBlockerView.vue` L155-L172; Acuan Desain: `05-Raise-Instant-Blocker.html` L75-L82; Test Case: `TC-BLKR-001`.
   - **Kategori Backlog:** `Navigation & Visual Consistency` | **Prioritas Backlog:** `Medium` | **Test Case:** ``TC-BLKR-001``
7. **Area Terdampak:** Frontend UI (`RaiseBlockerView.vue`), Topbar Header.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String '(Prototipe 05)' tercantum pada breadcrumb dan topbar kanan memuat tombol navigasi kustom.
   - *Hipotesis Penyebab:* Penyusunan header bar dilakukan secara mandiri dengan menyalin judul prototipe.
9. **Dampak (Impact):** Rendah (Low) — Kerapian breadcrumb dan konsistensi header aplikasi.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta kebocoran teks '(Prototipe 05)' dan ketidakselarasan header terverifikasi nyata pada baris 159.
    - *Indikasi Hubungan / Overlap:* Kluster Topbar Global (berkaitan dengan IMP-014, IMP-019, IMP-024, IMP-025).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan teks prototipe pada breadcrumb dan penyelarasan header blocker dengan standar topbar global.

---

### IMP-044: Pembersihan Footer Form Pelaporan Blocker: Penyesuaian Tombol Aksi Bersihkan & Kirim

1. **Finding ID:** `IMP-044`
2. **Deskripsi Asli:**
   > "Hapus teks referensi kode internal `(Audit Trail DEC-008)`. Selaraskan tombol aksi dengan Prototipe 05, yaitu tombol sekunder *"Bersihkan Formulir"* (reset) dan tombol primer *"Kirim Laporan Blocker"*."
   *(Kondisi tercatat pada backlog: "Bar aksi bawah memuat kalimat instruksi defensif: `"Pastikan fakta kendala akurat. Tiket yang diterbitkan tidak dapat dihapus (Audit Trail DEC-008)."` dengan tombol Batal dan Kirim Tiket Kendala.")*
3. **Konteks Temuan:** Modul Manajemen Kendala — Footer Aksi Formulir Blocker (`/blockers/raise`).
4. **Kondisi Aktual Sistem (Fakta Pemeriksaan):** Pada baris 477 `frontend/src/views/blockers/RaiseBlockerView.vue`, footer memuat teks: `Pastikan fakta kendala akurat. Tiket yang diterbitkan tidak dapat dihapus (Audit Trail DEC-008).` Tombol 'Batal' di baris 480 mengarahkan secara paksa ke rute manajerial `/blockers`.
5. **Kondisi yang Diharapkan (Dasar Acuan):** Sesuai Prototipe 05, footer formulir diharapkan bersih dari kode arsitektur internal `DEC-008`, dan tombol Batal/Reset difungsikan untuk membersihkan form atau kembali ke alur kerja sebelumnya, bukan melempar staf ke antrean manajerial.
6. **Bukti / Evidence:**
   - **Lokasi Kode & Desain:** `frontend/src/views/blockers/RaiseBlockerView.vue` L474-L490; Test Case: `TC-BLKR-001`.
   - **Kategori Backlog:** `Copywriting & Visual Cleanliness` | **Prioritas Backlog:** `Low` | **Test Case:** ``TC-BLKR-001``
7. **Area Terdampak:** Frontend UI (`RaiseBlockerView.vue`), Sticky Footer Bar.
8. **Akar Masalah (Root Cause):**
   - *Fakta Teknis:* String '(Audit Trail DEC-008)' tercantum pada petunjuk footer dan target rute tombol Batal mengarah ke `/blockers`.
   - *Hipotesis Penyebab:* Penyebutan kode keputusan audit trail dan penetapan rute pembatalan awal yang belum disesuaikan dengan alur staf.
9. **Dampak (Impact):** Sedang (Medium) — Karyawan yang membatalkan pengisian tiket diarahkan ke halaman antrean manajerial yang bukan wewenangnya.
10. **Relevansi Pasca Cycle 1:** Relevan.
11. **Penilaian Validitas & Keterkaitan:**
    - **Klasifikasi Validitas:** **`VALID`**
    - *Justifikasi:* Fakta kebocoran teks 'DEC-008' dan salah arah tautan pembatalan terverifikasi nyata pada kode sumber.
    - *Indikasi Hubungan / Overlap:* Kluster Alur & Halaman Pelaporan Blocker (berkaitan dengan IMP-040 s.d. IMP-042).
12. **Kesimpulan Investigasi:** Dianjurkan pembersihan kode 'DEC-008' dan penyesuaian aksi tombol pembatalan agar kembali ke alur kerja aktif pengguna.

---

## 5. PEMETAAN INDIKASI HUBUNGAN & OVERLAP STRUKTURAL

Berikut adalah pemetaan hubungan struktural antar temuan yang dianalisis secara terpisah:

1. **Kluster Penataan Topbar Global (5 Item VALID):**
   - `IMP-014`: Tautan profil teks menjadi avatar inisial pada 3 daily views.
   - `IMP-019`: Usulan penyelarasan arsitektur navbar global bersih.
   - `IMP-024`: Penanda breadcrumb hirarkis pada modul administrasi.
   - `IMP-025`: Eliminasi tautan navigasi duplikat pada topbar administrasi.
   - `IMP-043`: Breadcrumb dan penataan topbar pada modul pelaporan kendala.
   *Analisis Hubungan:* Kelima temuan berstatus VALID karena menunjuk pada masalah nyata di file yang berbeda. Jika di masa depan diterapkan komponen shared header, kelima aspek ini akan saling terkait dalam implementasinya.

2. **Kluster Alur Kerja & Halaman Blocker (4 Item VALID):**
   - `IMP-040`: Pengalihan tombol pelaporan kendala ke rute resmi.
   - `IMP-041`: Penataan navigasi kembali dan sistem 2 tab sesuai Prototipe 05.
   - `IMP-042`: Penyesuaian tombol antrean manajerial agar tidak tampil pada staf.
   - `IMP-044`: Pembersihan kode internal dan rute pembatalan pada footer blocker.
   *Analisis Hubungan:* Seluruh temuan berada pada domain alur pelaporan blocker dan halaman `RaiseBlockerView.vue`.

3. **Kluster Halaman Evaluasi Sore EOD (7 Item VALID):**
   - `IMP-033` s.d. `IMP-039`: Penataan konteks waktu, pembersihan kebocoran kode prototipe/arsitektur, pembersihan enum pada label, perbaikan lebar textarea, dan kelengkapan evaluasi pekerjaan tambahan.

---

## 6. KLARIFIKASI KEBIJAKAN PRODUK YANG DIPERLUKAN (IMP-011 & IMP-015)

Dua temuan berstatus `NEEDS CLARIFICATION` diserahkan kepada Acceptance Owner untuk penetapan arah kebijakan produk:

1. **`IMP-011` — Kebijakan Penanganan Lupa Kata Sandi:**
   - *Alternatif A (Dukungan Administratif Terpusat):* Menetapkan bahwa pemulihan kata sandi dilakukan secara terpusat melalui meja bantuan HRGA/IT Admin sesuai karakteristik intranet internal (UI login cukup menyediakan petunjuk resmi).
   - *Alternatif B (Pemulihan Mandiri via Email / Self-Service):* Menetapkan kebutuhan fitur baru pemulihan mandiri oleh staf via email perusahaan (memerlukan gateway email SMTP dan sistem token reset baru).

2. **`IMP-015` — Kebutuhan Fungsional Ikon Lonceng Notifikasi di Header Bar:**
   - *Alternatif A (Pintasan Navigasi Langsung):* Ikon lonceng bertindak sebagai jalan pintas navigasi langsung ke halaman Notification Center yang sudah ada.
   - *Alternatif B (Indikator Unread Count Real-Time):* Ikon lonceng dilengkapi badge penghitung notifikasi belum dibaca secara aktif dengan sinkronisasi background.
