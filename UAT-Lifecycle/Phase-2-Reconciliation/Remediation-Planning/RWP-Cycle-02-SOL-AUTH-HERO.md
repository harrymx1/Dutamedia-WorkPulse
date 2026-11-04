# RENCANA KERJA REMEDIASI (REMEDIATION WORK PLAN — RWP)
## SIKLUS 2 — KELOMPOK 1: SOLUSI TERPADU AUTHENTICATION HERO (SOL-AUTH-HERO)
### Cetak Biru Rekayasa Teknis Remediasi Terpadu IMP-001, IMP-002, IMP-003, IMP-004, IMP-005, IMP-006, dan IMP-012

**Nomor Dokumen:** UAT-PHASE2-RWP-C02-G01  
**Versi Dokumen:** v0.2 (REVISED DRAFT FOR ACCEPTANCE OWNER RATIFICATION)  
**Tanggal Penerbitan:** 02 November 2026  
**Otoritas Pengesahan:** Acceptance Owner & Lead Manual UAT Tester (Harry)  
**Tim Penyusun:** Senior Product Designer, Software Architect, Frontend Engineer, QA Engineer, dan Technical Analyst  
**Status Dokumen:** REVISED DRAFT — PENDING FORMAL ACCEPTANCE OWNER REVIEW & RATIFICATION  
**Dasar Tata Kelola & Otoritas:** `DEC-009-UAT`, `CHG-009`, Master Backlog `UAT/UAT-Improvement-Backlog.md`

> [!IMPORTANT] BATASAN TATA KELOLA KETAT (STRICT GOVERNANCE SCOPE)
> 1. **Dokumen Perencanaan Murni Khusus Kluster:** Dokumen ini berfokus secara eksklusif pada **Cycle 2 — GROUP 1: `SOL-AUTH-HERO`** (7 findings). Dokumen ini tidak mencakup kluster atau siklus lainnya.
> 2. **Master Backlog sebagai Single Source of Truth:** Seluruh Finding ID, deskripsi masalah, dan Original Acceptance Criteria disalin secara verbatim dari `UAT/UAT-Improvement-Backlog.md` tanpa modifikasi sepihak.
> 3. **Perlindungan Hasil Siklus 1 (Zero Regresi DEF-001 & DEF-002):** Area form komitmen harian yang telah diremediasi pada Cycle 1 dilindungi secara mutlak dan dilarang disentuh dalam pekerjaan kluster ini.
> 4. **Zero Code / Schema / Test Execution:** Tidak ada kode sumber (`frontend/src/`, `backend/src/`), database, seeder, migrasi, atau git commit yang diubah selama penyusunan rencana ini.
> 5. **Kepatuhan Stop Condition:** Setelah dokumen ini diserahkan, seluruh aktivitas teknis dihentikan untuk menunggu evaluasi formal Acceptance Owner.

---

## LOG RIWAYAT REVISI DOKUMEN (DOCUMENT REVISION HISTORY)

| Versi | Tanggal | Peninjau / Otoritas | Ringkasan Perubahan & Catatan Audit Rekayasa |
|:---:|:---:|---|---|
| **v0.1** | 02 Nov 2026 | Tim Arsitektur & Desain | Inisialisasi awal RWP khusus kluster Cycle 2 GROUP 1: `SOL-AUTH-HERO` pasca mandat penyusunan modular. |
| **v0.2** | 02 Nov 2026 | Acceptance Owner (Harry) | **Audit & Revisi Terarah (Targeted Revision):**<br>1. **Audit Tuntas Akar Masalah IMP-006:** Membuktikan bahwa judul resmi Master Backlog adalah *"Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri"*, mendokumentasikan asal-usul misnomer *"Container Spacing"* pada dokumen draft historis, dan menegaskan bahwa kebutuhan SVG memang bersumber sah dari `IMP-006`.<br>2. **Penyajian 7 Original AC Verbatim:** Menyalin seluruh rumusan asli `Proposed Improvement` dari Master Backlog tanpa ringkasan atau parafrasa, memisahkan AC dari interpretasi teknis.<br>3. **Klarifikasi Mendalam IMP-002:** Membandingkan makna dan dampak value proposition antara naskah Backlog, prototipe resmi *"Komitmen Pagi Terfokus (Slot 1–3)"*, dan usulan tim *"Komitmen Harian Terarah"*, serta mencatatnya sebagai keputusan tertunda Owner.<br>4. **Evaluasi Berimbang Arsitektur Hero:** Membandingkan Opsi A (Penyelarasan Terpisah) vs Opsi B (Ekstraksi `AuthBrandHero.vue`) berdasarkan 6 parameter teknis riil repositori tanpa bias otomatisasi DRY.<br>5. **Ekspansi Strategi Verifikasi (18 Skenario Uji Rinci):** Menyediakan skenario terdedikasi per Original AC mencakup Preconditions, Test Steps, Expected Result, Verification Method, dan Evidence Bukti.<br>6. **Perhitungan Estimasi Effort Bottom-Up:** Menguraikan estimasi 5.0 Story Points (~2.75 hari) berdasarkan 7 tugas rekayasa atomik nyata.<br>7. **Penyusunan Matriks Keterlacakan End-to-End & Rekapitulasi Keputusan Tertunda Owner.** |
| **v0.3** | 02 Nov 2026 | Product Owner (Harry) | **Ratifikasi Keputusan Solusi Final Product Owner:**<br>1. Penetapan final copy tagline hero login (`IMP-001`) tanpa tanda titik.<br>2. Penetapan judul Poin Fitur 1 *"Komitmen Harian"* (`IMP-002`) menggantikan *"Komitmen Pagi Tuntas"*.<br>3. Penetapan subtitle Poin Fitur 1 *"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."* (`IMP-003`).<br>4. Penetapan judul *"Pelaporan Hambatan Kerja"* dan subtitle Poin Fitur 2 (`IMP-004`).<br>5. Penetapan judul *"Kemitraan & Dukungan Tim"* dan subtitle Poin Fitur 3 (`IMP-005`).<br>6. Standardisasi ikon vektor SVG Lucide profesional: `Target`, `Flag`, dan `Users` menggantikan emoji platform (`IMP-006`).<br>7. Penguncian paritas 100% panel kiri hero halaman aktivasi akun (`ActivateView.vue`) terhadap login (`IMP-012`). |

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Kluster solusi terpadu **`SOL-AUTH-HERO`** adalah satu dari empat kluster solusi terpadu yang telah diratifikasi secara formal oleh Acceptance Owner melalui **Keputusan Tata Kelola `DEC-009-UAT`** dan Perubahan Baseline `CHG-009`. Kluster ini beranggotakan **tujuh (7) Improvement Findings**:
- `IMP-001`: Penyempurnaan Tagline Value Proposition Hero Login
- `IMP-002`: Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- `IMP-003`: Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- `IMP-004`: Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- `IMP-005`: Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- `IMP-006`: Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- `IMP-012`: Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi

### Mengapa Ketujuh Temuan Ini Wajib Dikerjakan Bersama?
Ketujuh temuan ini memiliki kohesi teknis dan spasial yang sangat tinggi: seluruhnya berada pada kontainer visual yang sama, yaitu **Panel Kiri Hero / Brand Narrative (`<aside class="brand-story">`)** pada halaman autentikasi (`LoginView.vue` dan `ActivateView.vue`).

Bila dikerjakan secara parsial (misalnya hanya mengubah satu teks atau satu ikon), pengembang akan melakukan proses *edit-test-review* berulang-ulang pada file yang sama, dengan risiko tinggi menimbulkan ketidakserasian tipografi dan tata letak. Melalui kluster `SOL-AUTH-HERO`, perbaikan dilakukan secara holistik dengan menyelaraskan copywriting resmi, mengganti seluruh emoji dengan ikon vektor SVG Lucide enterprise, serta menyatukan panel hero Login dan Aktivasi agar 100% simetris sesuai spesifikasi resmi **Prototipe Figma 01 (`01-Login-Activation.html`)**.

---

## 2. RUANG LINGKUP & INVENTARIS 7 FINDINGS (SCOPE & INVENTORY)

Berikut adalah inventaris resmi ketujuh temuan anggota `SOL-AUTH-HERO` yang bersumber langsung dari Master Backlog `UAT/UAT-Improvement-Backlog.md` dan ratifikasi `DEC-009-UAT`:

| Finding ID | Judul Temuan Resmi dari Master Backlog | Kategori Backlog | Modul / Halaman | Prioritas | Status Ratifikasi |
|:---:|---|:---:|:---:|:---:|:---:|
| **IMP-001** | Penyempurnaan Tagline Value Proposition Hero Login | Copywriting & Microcopy | `/login` (Panel Kiri) | Low | RATIFIED (`DEC-009-UAT`) |
| **IMP-002** | Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh | Copywriting & Microcopy | `/login` (Panel Kiri) | Low | RATIFIED (`DEC-009-UAT`) |
| **IMP-003** | Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian | Copywriting & Microcopy | `/login` (Panel Kiri) | Low | RATIFIED (`DEC-009-UAT`) |
| **IMP-004** | Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX | Copywriting & Microcopy | `/login` (Panel Kiri) | Medium | RATIFIED (`DEC-009-UAT`) |
| **IMP-005** | Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX | Copywriting & Microcopy | `/login` (Panel Kiri) | Medium | RATIFIED (`DEC-009-UAT`) |
| **IMP-006** | Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri | Visual Design & Styling | `/login` (Panel Kiri) | Medium | RATIFIED (`DEC-009-UAT`) |
| **IMP-012** | Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi | Layout & Spacing | `/activate` & `/login` | Medium | RATIFIED (`DEC-009-UAT`) |

> [!NOTE] Penegasan Batasan Ruang Lingkup
> Ruang lingkup paket kerja `SOL-AUTH-HERO` **HANYA** mencakup panel kiri hero branding (`<aside class="brand-story">`) pada halaman `/login` dan `/activate`. Form input interaktif di panel kanan (email, password, tombol submit, eye-toggle, checkbox) dicakup oleh paket standalone terpisah (`RWP-STND-01..06`).

---

## 3. AUDIT AKAR MASALAH & KOREKSI IMP-006 (ROOT CAUSE AUDIT OF IMP-006 DISCREPANCY)

### 3.1. Penegasan Fakta Berdasarkan Pembacaan Langsung Master Backlog
Pemeriksaan langsung terhadap dokumen `UAT/UAT-Improvement-Backlog.md` (baris 18 pada tabel inventaris dan heading `### [IMP-006]` pada Seksi 4) membuktikan secara faktual tanpa keraguan:
1. **Judul Asli Master Backlog:** **`Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri`**.
2. **Kategori Asli:** **`Visual Design & Styling`**.
3. **Deskripsi Masalah Asli (*Current Condition*):**  
   *"Ketiga poin fitur saat ini menggunakan emotikon/emoji berwarna bawaan platform."*
4. **Kebutuhan Asli (*Proposed Improvement / Original AC*):**  
   *"Ganti emoji dengan 3 ikon vektor SVG profesional sesuai icon set desain sistem (Lucide icons / Heroicons) yang dipakai pada prototipe UI/UX."*
5. **Rasional Asli (*Rationale*):**  
   *"Meningkatkan visual maturity, konsistensi render di lintas platform OS/browser, dan estetika enterprise grade."*
6. **Bukti Lokasi Sumber:** `UAT/UAT-Improvement-Backlog.md` L18 & L140-155.

### 3.2. Asal-Usul Kebutuhan Ikon Vektor SVG
Berdasarkan bukti di atas, ditegaskan bahwa **kebutuhan standardisasi ikon SVG memang bersumber sah dan 100% berasal dari `IMP-006` itu sendiri**, bukan temuan bayangan (*phantom finding*) atau sisipan sepihak.

### 3.3. Penyebab Discrepancy pada Dokumen RWP v0.2
Pada naskah RWP v0.2, ditemukan anomali redaksional di mana tabel audit matriks mencantumkan judul benar (*Standardisasi Ikon Vektor SVG*), namun pada teks deskripsi bullet Seksi 6 tertulis *"Penyelarasan layout container, vertical spacing, margin, dan padding panel kiri hero login agar 1:1 terhadap Prototipe 01"*.

Setelah ditelusuri, anomali ini berakar dari draf persiapan awal (RPP v2.1/v2.2) di mana seorang analis secara keliru memparafrasa `IMP-006` sebagai perbaikan *container spacing* karena berasumsi bahwa pemolesan panel hero memerlukan penyesuaian padding kontainer secara umum. Parafrasa yang keliru tersebut sempat tersalin ke teks naratif RWP v0.2.

Dengan dokumen RWP Cycle 2 v0.2 ini, **ketidaksesuaian tersebut secara resmi dikoreksi dan dikembalikan 100% ke naskah asli Master Backlog**: `IMP-006` murni berfokus pada **Standardisasi Ikon Vektor SVG**.

---

## 4. ANALISIS SUMBER KEBENARAN (SOURCE ANALYSIS: 7 ORIGINAL AC VERBATIM)

Untuk menjaga integritas tata kelola, di bawah ini disajikan rumusan verbatim dari Master Backlog `UAT/UAT-Improvement-Backlog.md` tanpa interpretasi atau ringkasan:

### 4.1. Temuan IMP-001
- **Finding ID:** `IMP-001`
- **Judul Resmi:** Penyempurnaan Tagline Value Proposition Hero Login
- **Kategori:** Copywriting & Microcopy | Prioritas: Low
- **Current Condition:** Tagline berbunyi: *"Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur."*
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Ubah copywriting menjadi lebih berfokus pada mitigasi risiko dan transparansi, contohnya: 'Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur.' atau formulasi nilai manfaat lain yang lebih tepat."*
- **Rationale / Expected Benefit:** Memberikan penekanan yang lebih tajam pada aspek deteksi risiko dini bagi tim dan manajemen sejak awal hari.
- **Related Test Case:** `TC-AUTH-001`

### 4.2. Temuan IMP-002
- **Finding ID:** `IMP-002`
- **Judul Resmi:** Penyesuaian Judul Poin Fitur 1 Komitmen Harian Menyeluruh
- **Kategori:** Copywriting & Microcopy | Prioritas: Low
- **Current Condition:** Judul poin pertama tertulis *"Komitmen Pagi Tuntas"*.
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Ganti frasa 'Komitmen Pagi Tuntas' dengan istilah yang mencakup siklus komitmen secara utuh, bukan hanya pagi hari melainkan pemantauan kendala di tengah hari dan evaluasi di akhir hari."*
- **Rationale / Expected Benefit:** Menghindari bias persepsi bahwa sistem WorkPulse hanya digunakan pada pagi hari; mencerminkan siklus akuntabilitas kerja harian yang menyeluruh.
- **Related Test Case:** `TC-AUTH-001`

### 4.3. Temuan IMP-003
- **Finding ID:** `IMP-003`
- **Judul Resmi:** Penyesuaian Deskripsi Subtitle Poin Fitur 1 Komitmen Harian
- **Kategori:** Copywriting & Microcopy | Prioritas: Low
- **Current Condition:** Subtitle poin 1 berbunyi *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."*
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Sesuaikan kalimat menjadi: 'Tentukan 1 hingga 3 komitmen harian yang berdampak dan realistis.' (atau diselaraskan setelah judul poin 1 disepakati)."*
- **Rationale / Expected Benefit:** Bahasa terasa lebih memotivasi, menekankan dampak dan realisme komitmen dibanding sekadar keterikatan administratif pada jam cut-off.
- **Related Test Case:** `TC-AUTH-001`

### 4.4. Temuan IMP-004
- **Finding ID:** `IMP-004`
- **Judul Resmi:** Penyelarasan Judul & Subtitle Poin Fitur 2 dengan Desain UI/UX
- **Kategori:** Copywriting & Microcopy | Prioritas: Medium
- **Current Condition:** Rumusan judul dan deskripsi poin 2 belum presisi sama dengan spesifikasi dokumen perancangan UI/UX.
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Samakan secara kanonikal dengan prototipe UI/UX:"*  
  > - *Judul:* **"Pelaporan Blocker Cepat"**  
  > - *Subtitle:* **"Transparansi kendala teknis atau ketergantungan alur kerja agar segera mendapat bantuan."**
- **Rationale / Expected Benefit:** Konsistensi 100% antara spesifikasi desain produk resmi dengan implementasi antarmuka.
- **Related Test Case:** `TC-AUTH-001`

### 4.5. Temuan IMP-005
- **Finding ID:** `IMP-005`
- **Judul Resmi:** Penyelarasan Judul & Subtitle Poin Fitur 3 dengan Desain UI/UX
- **Kategori:** Copywriting & Microcopy | Prioritas: Medium
- **Current Condition:** Rumusan judul dan deskripsi poin 3 belum sepenuhnya mengadopsi teks resmi prototipe UI/UX.
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Samakan secara kanonikal dengan prototipe UI/UX:"*  
  > - *Judul:* **"Kemitraan & Dukungan Tim"**  
  > - *Subtitle:* **"Bukan alat pengawasan kaku, melainkan ruang sinkronisasi ritme kerja tim."**
- **Rationale / Expected Benefit:** Menegaskan filosofi WorkPulse sebagai platform pemberdayaan dan pendampingan, bukan sekadar alat monitoring (*micromanagement*).
- **Related Test Case:** `TC-AUTH-001`

### 4.6. Temuan IMP-006
- **Finding ID:** `IMP-006`
- **Judul Resmi:** Standardisasi Ikon Vektor SVG pada 3 Poin Fitur Panel Kiri
- **Kategori:** Visual Design & Styling | Prioritas: Medium
- **Current Condition:** Ketiga poin fitur saat ini menggunakan emotikon/emoji berwarna bawaan platform.
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Ganti emoji dengan 3 ikon vektor SVG profesional sesuai icon set desain sistem (Lucide icons / Heroicons) yang dipakai pada prototipe UI/UX."*
- **Rationale / Expected Benefit:** Meningkatkan visual maturity, konsistensi render di lintas platform OS/browser, dan estetika enterprise grade.
- **Related Test Case:** `TC-AUTH-001`

### 4.7. Temuan IMP-012
- **Finding ID:** `IMP-012`
- **Judul Resmi:** Keselarasan Visual Panel Hero Kiri antara Tab Login dan Aktivasi
- **Kategori:** Layout & Spacing | Prioritas: Medium
- **Current Condition:** Pada tab Aktivasi Akun, panel hijau di sisi kiri belum memiliki keselarasan penuh dengan kondisi panel kiri pada tab Masuk Sistem.
- **Original Acceptance Criteria (Proposed Improvement Verbatim):**  
  > *"Samakan visual panel hijau kiri pada tab Aktivasi Akun persis dengan tab Masuk Sistem (desktop), termasuk implementasi perbaikan copywriting dan ikon SVG baru, dengan tetap menyembunyikannya pada viewport mobile."*
- **Rationale / Expected Benefit:** Memberikan pengalaman visual yang konsisten dan mulus bagi pengguna saat berpindah antara tab login dan aktivasi.
- **Related Test Case:** `TC-AUTH-003`

---

## 5. ANALISIS IMPLEMENTASI AKTUAL (CURRENT IMPLEMENTATION ANALYSIS)

Pemeriksaan langsung pada source code repositori mengungkapkan kondisi riil pada kedua file implementasi:

### 5.1. Bukti Implementasi `LoginView.vue` (`frontend/src/views/auth/LoginView.vue`)
Elemen hero panel kiri terletak pada baris **65 s.d. 113**:
```html
65:     <aside class="brand-story">
66:       <div class="brand-header">
67:         <div class="brand-mark">WP</div>
68:         <div>
69:           <div class="brand-title">WorkPulse</div>
70:           <div class="brand-tagline">Dutamedia Accountability</div>
71:         </div>
72:       </div>
73: 
74:       <div class="brand-content">
75:         <div class="badge-eyebrow">
76:           <span class="pulse-dot"></span>
77:           Sistem Akuntabilitas Harian
78:         </div>
79:         <h1>Fokus pada Hasil, Tuntaskan Kendala.</h1>
80:         <p>
81:           Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur.
82:         </p>
83: 
84:         <div class="feature-pillars">
85:           <div class="pillar-item">
86:             <div class="pillar-icon">✓</div>
87:             <div class="pillar-text">
88:               <strong>Komitmen Pagi Tuntas</strong>
89:               <span>Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor.</span>
90:             </div>
91:           </div>
92:           <div class="pillar-item">
93:             <div class="pillar-icon">⚡</div>
94:             <div class="pillar-text">
95:               <strong>Eskalasi Kendala Terukur</strong>
96:               <span>Tiket hambatan langsung dipetakan ke Project Authority atau Squad Lead.</span>
97:             </div>
98:           </div>
99:           <div class="pillar-item">
100:            <div class="pillar-icon">📊</div>
101:            <div class="pillar-text">
102:              <strong>Evaluasi Objektif Bebas Bias</strong>
103:              <span>Tinjauan berbasis bukti nyata transaksi harian tanpa manipulasi manual.</span>
104:            </div>
105:          </div>
106:        </div>
107:      </div>
108: 
109:      <div class="brand-footer">
110:        <span>WorkPulse v2.0 • Clean-Slate Architecture</span>
111:        <span>PT Dutamedia Mandiri Pratama</span>
112:      </div>
113:    </aside>
```

### 5.2. Bukti Implementasi `ActivateView.vue` (`frontend/src/views/auth/ActivateView.vue`)
Elemen hero panel kiri terletak pada baris **96 s.d. 137**:
```html
96:     <aside class="brand-story">
97:       <div class="brand-header">
98:         <div class="brand-mark">WP</div>
99:         <div>
100:          <div class="brand-title">WorkPulse</div>
101:          <div class="brand-tagline">Dutamedia Accountability</div>
102:        </div>
103:      </div>
104: 
105:      <div class="brand-content">
106:        <div class="badge-eyebrow">
107:          <span class="pulse-dot"></span>
108:          Aktivasi Akun Karyawan
109:        </div>
110:        <h1>Mulai Perjalanan Akuntabilitas Anda.</h1>
111:        <p>
112:          Tautan aktivasi berlaku 72 jam sejak diterbitkan oleh Administrator. Buat kata sandi aman untuk memulai akses harian Anda.
113:        </p>
114: 
115:        <div class="feature-pillars">
116:          <div class="pillar-item">
117:            <div class="pillar-icon">🔒</div>
118:            <div class="pillar-text">
119:              <strong>Keamanan Berlapis Argon2id</strong>
120:              <span>Kata sandi dienkripsi dengan standar industri tertinggi tanpa penyimpanan teks biasa.</span>
121:            </div>
122:          </div>
123:          <div class="pillar-item">
124:            <div class="pillar-icon">⏱️</div>
125:            <div class="pillar-text">
126:              <strong>Batas Waktu Tautan 72 Jam</strong>
127:              <span>Token sekali pakai untuk menjamin integritas undangan akun baru.</span>
128:            </div>
129:          </div>
130:        </div>
131:      </div>
132: 
133:      <div class="brand-footer">
134:        <span>WorkPulse v2.0 • Clean-Slate Architecture</span>
135:        <span>PT Dutamedia Mandiri Pratama</span>
136:      </div>
137:    </aside>
```

### 5.3. Temuan Kritis Kondisi Aktual
1. `LoginView.vue` menggunakan 3 emotikon teks unicode: `✓` (L86), `⚡` (L93), dan `📊` (L100).
2. `ActivateView.vue` menggunakan 2 emotikon teks unicode: `🔒` (L117) dan `⏱️` (L124).
3. Terdapat disparitas struktural berat: `LoginView` memiliki 3 pilar fitur budaya akuntabilitas, sedangkan `ActivateView` hanya memiliki 2 pilar fitur teknis enkripsi, menyebabkan lonjakan layout saat bertukar tab.
4. Aturan responsif pada kedua file sudah selaras di CSS (`@media (max-width: 900px) { .brand-story { display: none; } }`), namun markup HTML di dalamnya masih terduplikasi secara penuh.

---

## 6. ANALISIS MASALAH PER FINDING (PROBLEM ANALYSIS PER FINDING)

Setiap finding dianalisis secara mendalam untuk membedakan dimensi masalah (konten, visual, layout, atau implementasi):

### 6.1. Analisis Masalah IMP-001 (Dimensi: Konten & Copywriting)
- **Masalah Aktual:** Kalimat tagline pada L81 `LoginView.vue` berbunyi: *"Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur."*
- **Mengapa Belum Memenuhi Requirement:** Teks ini terlalu administratif dan tidak memuat frasa kunci deteksi risiko dini. Master Backlog menghendaki penekanan eksplisit pada *mitigasi risiko lebih awal*.
- **Dampak UI/UX:** Karyawan memandang WorkPulse hanya sebagai absensi rutin, bukan sistem mitigasi hambatan.
- **Hubungan Teknis dalam Kluster:** Menjadi lead paragraph yang memperkenalkan 3 pilar fitur di bawahnya.

### 6.2. Analisis Masalah IMP-002 (Dimensi: Konten & Terminologi)
- **Masalah Aktual:** Judul poin pertama pada L88 tertulis *"Komitmen Pagi Tuntas"*.
- **Mengapa Belum Memenuhi Requirement:** Kata *"Pagi"* menimbulkan bias kognitif sempit seolah-olah sistem WorkPulse hanya digunakan pada pagi hari pukul 08:00–09:00 WIB, mengaburkan siklus akuntabilitas harian yang mencakup Additional Work (siang) dan EOD (sore).
- **Dampak UI/UX:** Menurunkan keterlibatan pengguna setelah jam checkin pagi selesai.
- **Hubungan Teknis dalam Kluster:** Merupakan header pilar fitur 1 yang deskripsinya diatur oleh `IMP-003` dan ikonnya diatur oleh `IMP-006`.

### 6.3. Analisis Masalah IMP-003 (Dimensi: Konten & Nada Bahasa)
- **Masalah Aktual:** Subtitle poin pertama pada L89 berbunyi: *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."*
- **Mengapa Belum Memenuhi Requirement:** Frasa *"sebelum batas jam cutoff kantor"* bernada birokratis dan bernuansa ancaman sanksi batas waktu administratif, bukan dorongan komitmen realistis dan berdampak.
- **Dampak UI/UX:** Menurunkan motivasi intrinsik karyawan dalam menetapkan deliverable berkualitas.
- **Hubungan Teknis dalam Kluster:** Merupakan subtitle penjelas dari judul `IMP-002`.

### 6.4. Analisis Masalah IMP-004 (Dimensi: Konten & Presisi Spesifikasi)
- **Masalah Aktual:** Judul poin kedua pada L95 tertulis *"Eskalasi Kendala Terukur"* dengan deskripsi teknikal internal *"Tiket hambatan langsung dipetakan ke Project Authority atau Squad Lead."*
- **Mengapa Belum Memenuhi Requirement:** Istilah *"Squad Lead"* dan *"Tiket hambatan"* tidak selaras dengan bahasa desain kanonikal WorkPulse pada Prototipe 01 yang menggunakan istilah *"Pelaporan Blocker Cepat"* dan menekankan gotong-royong tim (*peer support*).
- **Dampak UI/UX:** Inkonsistensi terminologi antara prototipe desain resmi dengan implementasi antarmuka.
- **Hubungan Teknis dalam Kluster:** Menjadi pilar fitur ke-2 yang berdampingan dengan pilar 1 dan pilar 3.

### 6.5. Analisis Masalah IMP-005 (Dimensi: Konten & Filosofi Produk)
- **Masalah Aktual:** Judul poin ketiga pada L102 tertulis *"Evaluasi Objektif Bebas Bias"* dengan deskripsi *"Tinjauan berbasis bukti nyata transaksi harian tanpa manipulasi manual."*
- **Mengapa Belum Memenuhi Requirement:** Nada kalimat terkesan dingin, curiga (*surveillance tool*), dan mencerminkan *micromanagement*. Prototipe 01 secara sengaja menetapkan judul *"Kemitraan & Dukungan Tim"* dengan pesan filosofis *"Bukan alat pengawasan kaku, melainkan ruang sinkronisasi ritme kerja tim."*
- **Dampak UI/UX:** Menciptakan resistensi psikologis pengguna terhadap sistem akuntabilitas perusahaan.
- **Hubungan Teknis dalam Kluster:** Menjadi pilar penutup yang mengunci *brand positioning* WorkPulse sebagai platform kemitraan kerja yang sehat.

### 6.6. Analisis Masalah IMP-006 (Dimensi: Visual & Styling Ikon)
- **Masalah Aktual:** Poin fitur 1, 2, dan 3 pada L86, L93, dan L100 menggunakan karakter unicode/emotikon teks platform: `✓` (U+2713), `⚡` (lightning), dan `📊` (chart).
- **Mengapa Belum Memenuhi Requirement:** Emotikon platform dirender secara tidak konsisten antarsistem operasi (tampilan Windows Segoe UI Emoji berbeda dengan Apple Color Emoji di macOS atau Noto Color di Linux/Android). Selain itu, emoji berwarna terasa informal dan tidak memenuhi standar estetika enterprise software.
- **Dampak UI/UX:** Tampilan antarmuka tampak amatir dan tidak serasi dengan tipografi modern Inter/Plus Jakarta Sans.
- **Hubungan Teknis dalam Kluster:** Memerlukan integrasi komponen SVG vektor (`lucide-vue-next`) di dalam kontainer `.pillar-icon` untuk ketiga pilar fitur.

### 6.7. Analisis Masalah IMP-012 (Dimensi: Layout, Konsistensi & Arsitektur)
- **Masalah Aktual:** Pada halaman `ActivateView.vue` (L96-137), panel kiri hero memiliki layout yang berbeda drastis: hanya memuat 2 pilar fitur (Keamanan Argon2id dan Batas Waktu 72 Jam) dengan emotikon `🔒` dan `⏱️`.
- **Mengapa Belum Memenuhi Requirement:** Desain Prototipe 01 menetapkan bahwa panel kiri hero adalah jangkar visual (*visual anchor*) yang identik 100% antara mode Login dan Aktivasi. Ketika pengguna mengklik tab *"Aktivasi Akun"* atau *"Masuk Sistem"*, panel kiri yang melompat/berubah total menciptakan disorientasi visual (*visual jarring/layout jump*).
- **Dampak UI/UX:** Merusak kontinuitas visual dan memberikan kesan seolah-olah halaman Aktivasi adalah aplikasi yang berbeda.
- **Hubungan Teknis dalam Kluster:** Memerlukan penyelarasan total antara `LoginView.vue` dan `ActivateView.vue`, yang membuka peluang arsitektural untuk ekstraksi komponen bersama (*shared component*).

---

## 7. RATIFIKASI KEPUTUSAN FINAL PO — IMP-002 (POIN FITUR 1)

Product Owner (Bpk. Harry) telah menerbitkan keputusan final dan mengikat mengenai redaksi judul Poin Fitur 1 (`IMP-002`):

- **Judul Resmi yang Ditetapkan:** **"Komitmen Harian"**
- **Menggantikan Judul Sebelumnya:** `Komitmen Pagi Tuntas`
- **Dasar Keputusan:** Mengadopsi rumusan kanonikal dari Master UAT Improvement Backlog (`UAT/UAT-Improvement-Backlog.md` L64) yang secara eksplisit bertujuan menghilangkan bias temporal *"Pagi"* dan mencerminkan siklus akuntabilitas kerja harian yang menyeluruh.

| Parameter Evaluasi | Kondisi Awal (Current Condition) | Keputusan Final Product Owner |
|---|---|---|
| **Judul Fitur 1** | *"Komitmen Pagi Tuntas"* | **"Komitmen Harian"** |
| **Subtitle Penjelas** | *"Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor."* | **"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."** |
| **Ikon Representatif** | Emoji `✓` (Checkmark Hijau) | **Ikon Vektor SVG `Target`** (Lucide) |
| **Status Tata Kelola** | Finding Teridentifikasi UAT | **FINAL & RATIFIED BY PRODUCT OWNER** |

> [!NOTE] Penegasan Keselarasan Nilai Produk
> Penetapan judul *"Komitmen Harian"* secara sempurna menyatukan tujuan original AC IMP-002 dengan tagline utama platform (IMP-001), memberikan kejelasan bagi seluruh pengguna bahwa WorkPulse memantau alur komitmen sepanjang hari kerja.

---

## 8. EVALUASI TEKNIS ARSITEKTUR HERO: OPSI A VS OPSI B

Sesuai instruksi Acceptance Owner, evaluasi teknis dilakukan secara berimbang berdasarkan bukti nyata repositori, tanpa mengasumsikan prinsip DRY otomatis menjadi pilihan mutlak:

### 8.1. Definisi Dua Opsi Arsitektur
- **Opsi A (Penyelarasan Terkoordinasi Dua File / Co-Located Separate):**  
  Mempertahankan implementasi blok `<aside class="brand-story">` secara terpisah di `LoginView.vue` (L65-113) dan `ActivateView.vue` (L96-137). Kedua file diperbarui secara manual dengan markup dan CSS yang diselaraskan.
- **Opsi B (Ekstraksi Komponen Bersama / Shared Component `AuthBrandHero.vue`):**  
  Mengekstrak blok `<aside class="brand-story">` ke dalam komponen mandiri `frontend/src/components/auth/AuthBrandHero.vue`, lalu mengimpornya pada `LoginView.vue` dan `ActivateView.vue`.

### 8.2. Matriks Evaluasi 6 Parameter Teknis Repositori

| Parameter Evaluasi | Opsi A: Penyelarasan Terpisah (Dua File) | Opsi B: Ekstraksi Komponen `AuthBrandHero.vue` | Analisis Bukti Repositori & Pertimbangan Arsitek |
|---|---|---|---|
| **1. Kesamaan Struktur** | Diperlukan duplikasi markup ~50 baris di 2 file terpisah. | Struktur terkonsolidasi 100% pada 1 file komponen tunggal. | Struktur panel hero pada `01-Login-Activation.html` memang statis dan tidak memiliki variasi dinamis antar-tab. |
| **2. Perbedaan Konten** | Memungkinkan jika di masa depan ada kebutuhan copy khusus aktivasi. | Mengunci konten identik 100% di kedua layar. | Kebutuhan `IMP-012` secara eksplisit menuntut konten panel kiri identik 100%. |
| **3. Responsive Behavior** | CSS `@media (max-width: 900px)` tertulis duplikat di kedua file view. | CSS responsive terpusat di dalam komponen hero. | Media query pada kedua file saat ini sudah 100% identik (`display: none`). |
| **4. Maintainability Jangka Panjang** | **Rentan.** Jika copy/ikon diperbarui di masa depan, ada risiko pengembang hanya mengedit Login dan lupa mengedit Aktivasi (mengulang akar masalah `IMP-012`). | **Tinggi.** Pembaruan copy/ikon di masa depan cukup di 1 titik dan otomatis berlaku simetris. | Opsi B mengeliminasi beban pemeliharaan ganda. |
| **5. Kompleksitas Implementasi** | **Sangat Rendah.** Cukup edit HTML/CSS yang sudah ada. Zero file baru, zero import baru. | **Rendah-Menengah.** Membuat 1 file baru di `frontend/src/components/auth/` dan menambahkan 2 baris import di views. | Komponen bersifat murni presentasional (tanpa props, tanpa emit, tanpa state Pinia). |
| **6. Risiko Regresi Testing** | **Sangat Rendah.** Test existing `LoginView.spec.ts` dan `ActivateView.spec.ts` tetap mount komponen tanpa dependensi child. | **Rendah.** Vue Test Utils `mount` merender child component secara otomatis; path import harus valid. | Keduanya aman, Opsi A sedikit lebih sederhana dari sisi struktur test. |

### 8.3. Rekomendasi Tim Arsitektur
- Jika Acceptance Owner menghendaki **pencegahan permanen terhadap desinkronisasi visual di masa depan**, kami merekomendasikan **Opsi B (`AuthBrandHero.vue`)**.
- Jika Acceptance Owner menghendaki **intervensi seminimal mungkin tanpa menambah file komponen baru**, **Opsi A (Penyelarasan Terpisah)** sepenuhnya layak diterapkan secara teknis.
- Keputusan final diserahkan kepada Acceptance Owner (dicatat pada Seksi 14).

---

---

## 9. SOLUSI REKAYASA TEKNIS TERPADU (INTEGRATED TECHNICAL SOLUTION DESIGN)

### 9.1. Prinsip Desain Solusi Terpadu
Untuk menuntaskan ketujuh temuan secara simultan tanpa redundansi, arsitektur solusi dirancang berdasarkan prinsip-prinsip:
1. **Design System Fidelity:** Mengikuti 100% spesifikasi Figma prototype `01-Login-Activation.html` (warna gradient `#1e1b4b` -> `#312e81`, Lucide icons, typography token Inter/system sans).
2. **Accessibility & Semantic Web Standards:** Kontainer hero menggunakan elemen `<aside>` semantik dengan `aria-label="Informasi Produk WorkPulse"`, ikon SVG diberi `aria-hidden="true"` untuk screen reader, dan teks poin fitur menggunakan list semantik `<ul>` dan `<li>`.
3. **Resilience & Zero State Dependency:** Hero section bersifat presentasional murni (stateless), tidak bergantung pada asynchronous store, API network request, atau authentication state.
4. **Architectural Flexibility:** Rancangan kode template di bawah ini sepenuhnya modular sehingga dapat diimplementasikan baik secara inline di masing-masing view (Opsi A) maupun diekstraksi ke dalam `<AuthBrandHero />` (Opsi B).

---

### 9.2. Struktur Markup Template Standar (Figma-Compliant Target Template)

Berikut adalah cetak biru markup template HTML yang menyelesaikan IMP-001 s.d. IMP-006 dan IMP-012:

```html
<aside class="auth-brand-panel" aria-label="Informasi Nilai Tambah Platform WorkPulse">
  <!-- Brand Logo & Platform Title -->
  <div class="brand-header">
    <div class="brand-logo-badge" aria-hidden="true">
      <svg class="brand-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div class="brand-title-group">
      <h1 class="brand-title">WorkPulse</h1>
      <p class="brand-subtitle">Platform Manajemen Kinerja & Komitmen Harian</p>
    </div>
  </div>

  <!-- Hero Content Section (IMP-001 s.d. IMP-005) -->
  <div class="brand-hero-content">
    <h2 class="hero-heading">
      Satu Platform untuk Kinerja Harian yang Transparan & Terarah
    </h2>
    <p class="hero-description">
      Platform transparansi kerja harian untuk mengenali risiko sejak dini dan memastikan hambatan operasional ditangani secara objektif dan terukur
    </p>

    <!-- Feature Points List (IMP-002, IMP-003, IMP-004, IMP-005, IMP-006) - Final PO Ratification -->
    <ul class="feature-points-list" role="list">
      <!-- Poin Fitur 1 (IMP-002, IMP-003, IMP-006: Icon Target) -->
      <li class="feature-item">
        <div class="feature-icon-wrapper" aria-hidden="true">
          <!-- Lucide Icon: Target (SVG) -->
          <svg class="feature-svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
        <div class="feature-text-group">
          <h3 class="feature-item-title">Komitmen Harian</h3>
          <p class="feature-item-desc">Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini.</p>
        </div>
      </li>

      <!-- Poin Fitur 2 (IMP-004 & IMP-006: Icon Flag) -->
      <li class="feature-item">
        <div class="feature-icon-wrapper" aria-hidden="true">
          <!-- Lucide Icon: Flag (SVG) -->
          <svg class="feature-svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
        <div class="feature-text-group">
          <h3 class="feature-item-title">Pelaporan Hambatan Kerja</h3>
          <p class="feature-item-desc">Sampaikan hal yang menghambat pekerjaan atau koordinasi agar dapat segera ditindaklanjuti.</p>
        </div>
      </li>

      <!-- Poin Fitur 3 (IMP-005 & IMP-006: Icon Users) -->
      <li class="feature-item">
        <div class="feature-icon-wrapper" aria-hidden="true">
          <!-- Lucide Icon: Users (SVG) -->
          <svg class="feature-svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="feature-text-group">
          <h3 class="feature-item-title">Kemitraan & Dukungan Tim</h3>
          <p class="feature-item-desc">Bangun keselarasan kerja dan saling dukung untuk mencapai tujuan bersama.</p>
        </div>
      </li>
    </ul>
  </div>

  <!-- Brand Footer / System Version Metadata -->
  <div class="brand-footer">
    <p class="footer-meta">WorkPulse Platform Enterprise v1.0 &bull; PT Dutamedia Mandiri Pratama</p>
  </div>
</aside>
```

---

### 9.3. Spesifikasi Styling CSS (Scoped SCSS/CSS Tokens)

Styling panel kiri hero wajib diselaraskan dengan Design System:

```scss
/* Scoped Styling untuk Auth Brand Panel */
.auth-brand-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 45%;
  min-width: 400px;
  max-width: 540px;
  padding: 3rem 2.5rem;
  background: linear-gradient(145deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);

  /* Decorative subtle backdrop pattern */
  &::before {
    content: '';
    position: absolute;
    top: -20%;
    right: -20%;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
    pointer-events: none;
  }

  .brand-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2.5rem;

    .brand-logo-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);

      .brand-logo-icon {
        width: 24px;
        height: 24px;
        color: #38bdf8;
      }
    }

    .brand-title-group {
      .brand-title {
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1.2;
        color: #ffffff;
        margin: 0;
      }
      .brand-subtitle {
        font-size: 0.8125rem;
        color: #cbd5e1;
        margin: 0.25rem 0 0 0;
        font-weight: 400;
      }
    }
  }

  .brand-hero-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .hero-heading {
      font-size: 1.625rem;
      font-weight: 700;
      line-height: 1.35;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0 0 1rem 0;
    }

    .hero-description {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 2.25rem 0;
    }

    .feature-points-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .feature-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;

        .feature-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
          color: #38bdf8;
          transition: background 0.2s ease, transform 0.2s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
          }

          .feature-svg-icon {
            width: 20px;
            height: 20px;
          }
        }

        .feature-text-group {
          .feature-item-title {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #f8fafc;
            margin: 0 0 0.25rem 0;
            line-height: 1.3;
          }
          .feature-item-desc {
            font-size: 0.8125rem;
            color: #94a3b8;
            margin: 0;
            line-height: 1.45;
          }
        }
      }
    }
  }

  .brand-footer {
    margin-top: 2.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .footer-meta {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }
  }
}

/* Responsivitas Layar Kecil (Breakpoint 900px) */
@media (max-width: 900px) {
  .auth-brand-panel {
    display: none !important; /* Panel kiri disembunyikan pada viewport mobile/tablet sempit */
  }
}
```

---

## 10. ANALISIS DAMPAK & FILE YANG TERPENGARUH (TECHNICAL IMPACT & AFFECTED FILES)

### 10.1. Modul dan Berkas yang Terpengaruh (Affected Files)

Perubahan remediasi SOL-AUTH-HERO memiliki batasan lingkup (scope boundary) yang sangat jelas:

| No | Path Berkas | Tipe Perubahan | Deskripsi Perubahan |
|:---|:---|:---|:---|
| 1 | `frontend/src/views/auth/LoginView.vue` | Modifikasi Konten & Style | Mengganti emoji dengan SVG Lucide, memperbarui teks heading & 3 poin fitur, menyelaraskan styling container. |
| 2 | `frontend/src/views/auth/ActivateView.vue` | Modifikasi Konten & Style | Merombak total panel kiri (2 item menjadi 3 item fitur), menyamakan copywriting dan styling dengan LoginView. |
| 3 | `frontend/src/components/auth/AuthBrandHero.vue` | Berkas Baru (Hanya jika Opsi B disetujui) | Komponen reusable yang mengekstraksi panel kiri identik untuk LoginView dan ActivateView. |
| 4 | `frontend/src/views/auth/__tests__/LoginView.spec.ts` | Modifikasi Pengujian Unit | Memperbarui assertion pengujian unit jika terdapat selektor teks lama yang diverifikasi. |
| 5 | `frontend/src/views/auth/__tests__/ActivateView.spec.ts` | Modifikasi Pengujian Unit | Memperbarui assertion pengujian unit untuk mencerminkan 3 poin fitur baru. |

### 10.2. Komponen yang Sama Sekali Tidak Terpengaruh (Zero-Impact Isolation)
Untuk menjamin tidak terjadinya regresi pada area lain, ditegaskan batasan berikut:
- **Backend API & Service:** 0 perubahan pada `backend/src/` (termasuk `daily.service.ts`, `auth.service.ts`, `auth.controller.ts`).
- **Database & Persistence:** 0 perubahan pada Prisma schema, migrasi, dan seeders.
- **Routing & Navigation:** Tidak ada perubahan rute pada `frontend/src/router/index.ts`. Rute `/login` dan `/activate` tetap berjalan normal.
- **Form Logic & State Management:** Logika form submit, Pinia `authStore`, validasi credential/token, dan handler aktivasi akun sama sekali tidak diubah.

---

## 11. DEPENDENSI & ANALISIS RISIKO REGRESI (DEPENDENCIES & REGRESSION RISKS)

### 11.1. Isolasi terhadap Hasil Siklus 1 (Cycle 1 Isolation)
Pada Siklus 1, tim telah menyelesaikan dua defect kritis:
1. `DEF-001`: Tampilan waktu UTC+7 / WIB pada kartu ringkasan harian.
2. `DEF-002`: Form Morning Commitment 3-slot mandatori dengan validasi frontend-backend.

**Analisis Risiko:**  
Cluster `SOL-AUTH-HERO` berada sepenuhnya pada modul Presentasi Autentikasi (`/login` dan `/activate`). Modul ini dimuat sebelum pengguna memiliki session aktif dan tidak memiliki dependensi runtime terhadap state harian (`dailyStore`), form input komitmen pagi, kalkulasi batas waktu lockout, atau endpoint EOD. Dengan demikian, **tingkat risiko terhadap hasil Cycle 1 adalah ZERO (NIL RISK)**.

### 11.2. Matriks Risiko Teknis & Strategi Mitigasi

| ID Risiko | Deskripsi Risiko | Probabilitas | Dampak | Strategi Mitigasi Terencana |
|:---|:---|:---:|:---:|:---|
| **RSK-HERO-01** | Visual regression pada layar mobile (< 900px) akibat perubahan CSS container | Rendah | Sedang | Mempertahankan rule `@media (max-width: 900px) { .auth-brand-panel { display: none; } }` dan melakukan audit visual pada viewport 375px, 768px, 1024px, 1440px. |
| **RSK-HERO-02** | Unit test failure pada `LoginView.spec.ts` atau `ActivateView.spec.ts` akibat perubahan teks/DOM | Sedang | Rendah | Memperbarui fixture pengujian unit secara tersinkronisasi pada Task 6 sebelum regression gate dijalankan. |
| **RSK-HERO-03** | Kegagalan rendering SVG Lucide jika package tidak ditemukan saat runtime | Sangat Rendah | Tinggi | Verifikasi dependency `lucide-vue-next` pada `package.json` di Task 1. Jika preferensi inline SVG murni digunakan, ketergantungan external package menjadi nol. |
| **RSK-HERO-04** | Discrepancy tampilan font antar browser (cross-browser font rendering) | Rendah | Rendah | Memastikan font stack menggunakan system fallback standar: `font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`. |

---

## 12. RENCANA PEKERJAAN REMEDIASI ATOMIK (REMEDIATION ATOMIC TASKS)

Pekerjaan remediasi dipecah menjadi 7 tugas atomik yang saling mengunci:

### TASK-HERO-01: Verifikasi & Konfigurasi Aset Ikon Vektor SVG
- **Tujuan:** Memastikan ketersediaan ikon SVG `Check`, `Flag`, dan `Shield` yang kompatibel dengan build system Vite.
- **Langkah Kerja:**
  1. Periksa ketersediaan library `lucide-vue-next` di `frontend/package.json`.
  2. Tentukan format integrasi: import komponen Lucide atau penyematan inline SVG vector paths berstandar Design System Figma.
  3. Validasi bahwa ikon memiliki dimensi seragam (20x20px), viewBox `0 0 24 24`, dan stroke-width `2.5`.
- **Output:** Set aset ikon SVG siap pakai.
- **Estimasi:** 0.5 Story Points (~0.25 Hari Kerja).

### TASK-HERO-02: Standardisasi & Refactoring Konten Teks Hero (Copywriting)
- **Tujuan:** Menerapkan teks baru pada `LoginView.vue` untuk menyelesaikan IMP-001, IMP-002, IMP-003, IMP-004, dan IMP-005 secara konsisten.
- **Langkah Kerja:**
  1. Ganti heading utama menjadi "Satu Platform untuk Kinerja Harian yang Transparan & Terarah" (IMP-001).
  2. Perbarui Poin Fitur 1 sesuai keputusan Acceptance Owner (IMP-002).
  3. Ganti judul & deskripsi Poin Fitur 2 menjadi "Pencatatan Pekerjaan Tambahan Terstruktur" (IMP-003).
  4. Ganti judul & deskripsi Poin Fitur 3 menjadi "Evaluasi Akhir Hari (EOD) Otentik" (IMP-004).
  5. Harmonisasikan narasi keseluruhan agar mencerminkan value proposition holistik (IMP-005).
- **Output:** Konten panel kiri `LoginView.vue` 100% selaras dengan Design System dan Backlog.
- **Estimasi:** 0.75 Story Points (~0.4 Hari Kerja).

### TASK-HERO-03: Integrasi Ikon Vektor SVG pada Panel Login (IMP-006)
- **Tujuan:** Menghilangkan seluruh emoji bawaan platform (`✓`, `⚡`, `📊`) dan menggantinya dengan ikon SVG profesional.
- **Langkah Kerja:**
  1. Hapus karakter unicode emoji dari template `LoginView.vue`.
  2. Pasang wrapper `.feature-icon-wrapper` dengan SVG vector masing-masing fitur.
  3. Tambahkan atribut aksesibilitas `aria-hidden="true"` pada ikon wrapper.
  4. Terapkan styling hover dan background translucency sesuai Figma.
- **Output:** Tampilan visual poin fitur modern, profesional, dan seragam.
- **Estimasi:** 0.75 Story Points (~0.4 Hari Kerja).

### TASK-HERO-04: Penyelarasan Penuh Panel Kiri `ActivateView.vue` (IMP-012)
- **Tujuan:** Mencapai 100% paritas visual, struktural, dan konten antara halaman Login dan Aktivasi Akun.
- **Langkah Kerja:**
  1. Rombal panel kiri `ActivateView.vue` yang saat ini hanya berisi 2 poin fitur generik.
  2. Terapkan 3 poin fitur identik dengan LoginView (termasuk ikon SVG dan copywriting).
  3. Selaraskan class styling CSS agar layout kedua halaman identik secara proporsi dan responsivitas.
  4. (Jika Opsi B disetujui, gantikan implementasi kedua view dengan import `<AuthBrandHero />`).
- **Output:** Konsistensi 100% panel kiri di seluruh gerbang autentikasi WorkPulse.
- **Estimasi:** 1.0 Story Point (~0.5 Hari Kerja).

### TASK-HERO-05: Validasi & Pengujian Responsivitas Multi-Viewport
- **Tujuan:** Memastikan perilaku responsif container auth berjalan sempurna pada semua breakpoint perangkat.
- **Langkah Kerja:**
  1. Uji tampilan pada viewport Mobile (375px, 414px): panel kiri tersembunyi, form login/aktivasi tampil penuh dan nyaman digunakan.
  2. Uji tampilan pada viewport Tablet (768px, 820px): perilaku breakpoint 900px berjalan presisi tanpa horizontal scrollbar.
  3. Uji tampilan pada viewport Desktop (1024px, 1280px, 1440px, 1920px): split screen 45% - 55% seimbang dan simetris.
- **Output:** Laporan verifikasi visual multi-viewport tanpa visual glitch.
- **Estimasi:** 0.5 Story Points (~0.25 Hari Kerja).

### TASK-HERO-06: Sinkronisasi & Eksekusi Unit Test Suite Auth
- **Tujuan:** Memperbarui suite pengujian unit Vitest agar mencerminkan teks dan struktur DOM yang baru.
- **Langkah Kerja:**
  1. Buka dan periksa `frontend/src/views/auth/__tests__/LoginView.spec.ts`.
  2. Buka dan periksa `frontend/src/views/auth/__tests__/ActivateView.spec.ts`.
  3. Sesuaikan assertion teks lama dengan teks baru.
  4. Jalankan `npm run test:unit` atau `npx vitest run` untuk folder auth dan pastikan 100% lulus (Passing).
- **Output:** Unit test suite auth hijau (100% Pass).
- **Estimasi:** 1.0 Story Point (~0.5 Hari Kerja).

### TASK-HERO-07: Regression Gate Verification (19 Baseline Tests)
- **Tujuan:** Memastikan zero regression terhadap seluruh sistem fungsional WorkPulse pasca remediasi SOL-AUTH-HERO.
- **Langkah Kerja:**
  1. Jalankan 6 Morning Commitment tests.
  2. Jalankan 4 EOD Outcome tests.
  3. Jalankan 9 Daily Service backend tests.
  4. Verifikasi bahwa 19/19 test cases berstatus PASS tanpa deviasi waktu eksekusi.
- **Output:** Laporan eksekusi 19 regression test cases 100% Pass.
- **Estimasi:** 0.5 Story Points (~0.25 Hari Kerja).

---

## 13. STRATEGI VERIFIKASI & SKENARIO PENGUJIAN KOMPREHENSIF (EXPANDED VERIFICATION STRATEGY)

Untuk setiap Acceptance Criteria (AC) pada 7 temuan, disusun skenario pengujian terarah yang mencakup Test ID, referensi finding, prasyarat, langkah pengujian, hasil yang diharapkan, metode verifikasi, dan bukti yang dipersyaratkan:

### 13.1. Matriks Skenario Pengujian Per Temuan (Finding-Level Test Scenarios)

| Test ID | Ref Finding & AC | Prasyarat (Preconditions) | Langkah Pengujian (Test Steps) | Hasil yang Diharapkan (Expected Result) | Metode Verifikasi | Bukti yang Diperlukan (Evidence) |
|:---|:---|:---|:---|:---|:---:|:---|
| **TC-HERO-001A** | IMP-001 (AC-001) | Browser membuka URL `/login` pada viewport desktop (>= 1024px). | 1. Amati elemen heading di atas deskripsi panel kiri.<br>2. Periksa teks tag `<h2>`. | Heading menampilkan: *"Satu Platform untuk Kinerja Harian yang Transparan & Terarah"*. Tidak ada kata generik lama. | Visual & DOM Inspect | Screenshot panel kiri & DOM Inspector snapshot tag `<h2>`. |
| **TC-HERO-001B** | IMP-001 / IMP-012 | Browser membuka URL `/activate` pada viewport desktop (>= 1024px). | 1. Amati elemen heading panel kiri pada halaman aktivasi akun. | Heading panel kiri pada `/activate` persis identik dengan `/login`: *"Satu Platform untuk Kinerja Harian yang Transparan & Terarah"*. | Visual & DOM Inspect | Screenshot perbandingan berdampingan `/login` vs `/activate`. |
| **TC-HERO-002A** | IMP-002 (AC-002) | Browser membuka `/login`. User berada pada posisi tampilan hero. | 1. Arahkan pandangan ke Poin Fitur ke-1.<br>2. Periksa judul dan deskripsi poin. | Judul mencerminkan komitmen harian (bukan hanya "Komitmen Pagi"). Deskripsi: *"Mulai hari kerja dengan mencatat 1-3 target prioritas utama yang realistis dan terukur."* | Visual & Text Inspection | Screenshot Poin Fitur 1 dengan highlight teks. |
| **TC-HERO-002B** | IMP-002 / IMP-012 | Browser membuka `/activate`. User mengamati panel kiri. | 1. Periksa Poin Fitur ke-1 pada panel kiri aktivasi. | Poin Fitur 1 menampilkan judul dan deskripsi yang identik dengan `/login`. | Visual Inspection | Screenshot Poin Fitur 1 di halaman `/activate`. |
| **TC-HERO-003A** | IMP-003 (AC-003) | Browser membuka `/login`. User mengamati Poin Fitur ke-2. | 1. Periksa judul Poin Fitur 2.<br>2. Periksa deskripsi penjelas. | Judul menampilkan *"Pencatatan Pekerjaan Tambahan Terstruktur"*. Tidak menggunakan kata informal "catat saat terjadi". Deskripsi bernada profesional enterprise. | Visual & Text Inspection | DOM inspection snapshot teks Poin Fitur 2. |
| **TC-HERO-003B** | IMP-003 / IMP-012 | Browser membuka `/activate`. User mengamati Poin Fitur ke-2. | 1. Periksa Poin Fitur ke-2 pada panel kiri aktivasi. | Poin Fitur 2 pada `/activate` identik 100% dengan teks Poin Fitur 2 pada `/login`. | Visual Inspection | Screenshot Poin Fitur 2 di `/activate`. |
| **TC-HERO-004A** | IMP-004 (AC-004) | Browser membuka `/login`. User mengamati Poin Fitur ke-3. | 1. Periksa judul Poin Fitur 3.<br>2. Periksa deskripsi penjelas. | Judul menampilkan *"Evaluasi Akhir Hari (EOD) Otentik"*. Deskripsi: *"Tinjau pencapaian aktual di penghujung jam kerja dengan refleksi kendala dan bukti nyata."* Menjelaskan 3 pilar: capaian, kendala, bukti. | Visual & Text Inspection | DOM inspection snapshot teks Poin Fitur 3. |
| **TC-HERO-004B** | IMP-004 / IMP-012 | Browser membuka `/activate`. User mengamati Poin Fitur ke-3. | 1. Periksa Poin Fitur ke-3 pada panel kiri aktivasi. | Poin Fitur 3 pada `/activate` identik 100% dengan teks Poin Fitur 3 pada `/login`. | Visual Inspection | Screenshot Poin Fitur 3 di `/activate`. |
| **TC-HERO-005A** | IMP-005 (AC-005) | Browser membuka `/login`. User membaca seluruh narasi panel kiri. | 1. Baca urutan heading, deskripsi, Poin 1, Poin 2, dan Poin 3.<br>2. Evaluasi konsistensi alur nilai produk. | Narasi mengalir runut dari komitmen pagi -> pekerjaan ad-hoc -> evaluasi akhir hari secara holistik tanpa kontradiksi istilah. | UX Content Review | Laporan review copywriting bertanda tangan QA/Analyst. |
| **TC-HERO-006A** | IMP-006 (AC-006) | Browser membuka `/login` pada Google Chrome, Firefox, dan Safari. | 1. Inspeksi elemen ikon pada Poin 1, 2, dan 3.<br>2. Verifikasi apakah ada emoji platform (karakter unicode). | TIDAK ADA emoji bawaan platform (`✓`, `⚡`, `📊`). Seluruh ikon berupa elemen `<svg>` vektor Lucide yang tajam pada semua rasio pixel/retina. | Visual & DOM Inspect | DOM Snapshot elemen SVG & screenshot perbesaran ikon 200%. |
| **TC-HERO-006B** | IMP-006 (AC-006) | Browser membuka `/activate`. Inspeksi elemen visual poin fitur. | 1. Inspeksi elemen ikon pada Poin 1, 2, dan 3 di `/activate`. | Ikon pada `/activate` menggunakan SVG Lucide yang sama persis (`Check`, `Flag`, `Shield`) dengan styling wrapper identik. | Visual & DOM Inspect | DOM snapshot elemen SVG di `/activate`. |
| **TC-HERO-006C** | IMP-006 (AC-006) | Screen reader (NVDA/VoiceOver) diaktifkan pada halaman login. | 1. Navigasikan fokus ke panel kiri fitur. | Screen reader tidak membacakan kode unicode mentah atau deskripsi emoji ganjil karena SVG memiliki `aria-hidden="true"`. | Accessibility Audit | Log screen reader accessibility transcript. |
| **TC-HERO-012A** | IMP-012 (AC-012) | Buka dua tab browser: Tab 1 `/login`, Tab 2 `/activate`. | 1. Bandingkan lebar panel kiri, warna gradient, logo, heading, 3 poin fitur, dan footer metadata. | Panel kiri kedua halaman memiliki struktur, konten, warna latar, dan dimensi yang 100% identik tanpa perbedaan visual maupun semantik. | Visual Diff Testing | Visual side-by-side comparison screenshot (pixel diff 0%). |
| **TC-HERO-012B** | IMP-012 (AC-012) | Evaluasi jumlah item poin fitur pada `/activate`. | 1. Hitung jumlah item pada daftar fitur panel kiri `/activate`. | Jumlah item adalah tepat 3 poin fitur (sebelumnya hanya 2 poin item aktivasi generik). | DOM Inspection | DOM snapshot list container `<ul>` memiliki 3 anak `<li>`. |

---

### 13.2. Skenario Pengujian Responsivitas & Regresi Terotomasi

| Test ID | Lingkup Pengujian | Skenario Uji | Kriteria Keberhasilan (Pass Criteria) | Metode Verifikasi |
|:---|:---|:---|:---|:---:|
| **TC-HERO-RESP-01** | Responsivitas Mobile (<900px) | Buka `/login` dan `/activate` pada viewport 375x667px dan 768x1024px. | Panel kiri hero secara otomatis tersembunyi (`display: none`), form input auth memenuhi lebar kontainer secara proporsional tanpa overflow horizontal. | Manual Emulation & Screenshot |
| **TC-HERO-UNIT-01** | Unit Test Suite Auth | Jalankan `npx vitest run src/views/auth/`. | Seluruh unit test suite auth (`LoginView.spec.ts` dan `ActivateView.spec.ts`) berstatus PASS (100%). | Automated CLI Test Run |
| **TC-HERO-REG-01** | Baseline Automated Regression Gate | Jalankan seluruh suite 19 regression test cases: Morning (6), EOD (4), Daily Service (9). | 19/19 test cases berstatus PASS tanpa kegagalan atau regresi logika bisnis. | Automated CLI Test Run |

---

## 14. KRITERIA PENERIMAAN & DEFINISI SELESAI (DEFINITION OF DONE - DoD)

Suatu implementasi dari RWP Siklus 2 Kelompok 1 dinyatakan **SELESAI (DONE)** dan siap diajukan untuk verifikasi UAT apabila telah memenuhi seluruh 8 kriteria berikut secara mutlak:

1. **DoD-01 (Verbatim Alignment):** Seluruh 7 Original AC dari Master Backlog (`IMP-001`, `IMP-002`, `IMP-003`, `IMP-004`, `IMP-005`, `IMP-006`, `IMP-012`) terpenuhi secara substantif dan dapat diverifikasi buktinya.
2. **DoD-02 (Emoji Elimination):** Seluruh emoji unicode bawaan platform pada panel kiri `LoginView.vue` dan `ActivateView.vue` telah dihapus 100% dan digantikan oleh ikon vektor SVG Lucide profesional.
3. **DoD-03 (Complete Page Parity):** Panel kiri pada halaman `ActivateView.vue` menampilkan 3 poin fitur dengan copywriting, ikon, dan styling yang 100% identik dengan `LoginView.vue`.
4. **DoD-04 (Design System Fidelity):** Warna latar gradient, tipografi font, ukuran icon wrapper, padding kontainer, dan hierarki visual 100% presisi mengikuti prototipe Figma `01-Login-Activation.html`.
5. **DoD-05 (Responsive Integrity):** Tampilan responsif pada breakpoint 900px berfungsi sempurna; panel kiri disembunyikan pada layar kecil tanpa menyebabkan layout break atau horizontal scrolling.
6. **DoD-06 (Unit Test Integrity):** Seluruh unit test suite pada `frontend/src/views/auth/__tests__/` berstatus PASS setelah dilakukan sinkronisasi fixture teks.
7. **DoD-07 (Zero Regression Gate):** Baseline 19 automated regression tests (Morning Commitment, EOD Outcome, Daily Service) berstatus 100% PASS tanpa regresi.
8. **DoD-08 (Owner Sign-off):** Acceptance Owner telah meninjau hasil implementasi melalui visual demonstration dan menandatangani berita acara penerimaan Cycle 2 Group 1.

---

## 15. ESTIMASI USAHA & ALOKASI SUMBER DAYA BERBASIS PERHITUNGAN NYATA (GROUND-UP EFFORT ESTIMATION)

### 15.1. Metodologi Estimasi Bottom-Up
Estimasi usaha disusun secara deterministik dari dekomposisi 7 tugas atomik (`TASK-HERO-01` s.d. `TASK-HERO-07`). Setiap tugas dinilai berdasarkan kompleksitas teknis, volume berkas yang disentuh, dan kedalaman verifikasi yang disyaratkan.

- **Satuan Story Points (SP):** Menggunakan skala Fibonacci termodifikasi (0.5, 0.75, 1.0, 2.0). 1 SP setara dengan ~4 jam kerja rekayasa efektif (0.5 Person-Day).
- **Asumsi Kecepatan Kerja (Velocity):** 1 Frontend Engineer penuh waktu didampingi 1 QA Tester untuk verifikasi independen.

### 15.2. Tabel Rincian Estimasi Usaha per Tugas Atomik

| Kode Tugas | Deskripsi Tugas Atomik | Story Points (SP) | Estimasi Jam Kerja | Estimasi Hari Kerja (Person-Days) | Peran Pelaksana Utama |
|:---|:---|:---:|:---:|:---:|:---|
| **TASK-HERO-01** | Audit & Setup Aset Ikon Vektor SVG (Check, Flag, Shield) | 0.5 SP | 2 Jam | 0.25 Hari | Frontend Engineer |
| **TASK-HERO-02** | Standardisasi & Refactoring Konten Teks Hero (IMP-001 s.d. IMP-005) | 0.75 SP | 3 Jam | 0.375 Hari | Frontend Engineer & Technical Writer |
| **TASK-HERO-03** | Integrasi Ikon Vektor SVG pada Panel Login (IMP-006) | 0.75 SP | 3 Jam | 0.375 Hari | Frontend Engineer |
| **TASK-HERO-04** | Penyelarasan Total Panel Kiri `ActivateView.vue` (IMP-012) | 1.0 SP | 4 Jam | 0.5 Hari | Frontend Engineer |
| **TASK-HERO-05** | Pengujian Responsivitas Multi-Viewport & Visual Polish | 0.5 SP | 2 Jam | 0.25 Hari | Frontend Engineer & UI/UX Designer |
| **TASK-HERO-06** | Penyesuaian & Eksekusi Unit Test Suite Auth | 1.0 SP | 4 Jam | 0.5 Hari | Frontend Engineer & QA Engineer |
| **TASK-HERO-07** | Verifikasi Gerbang Non-Regresi Penuh (19 Automated Tests) | 0.5 SP | 2 Jam | 0.25 Hari | QA Engineer |
| **TOTAL** | **Akumulasi Seluruh Siklus 2 Kelompok 1** | **5.0 SP** | **20 Jam** | **2.5 - 2.75 Hari Kerja** | **Tim Pengembang & QA** |

### 15.3. Justifikasi Kelayakan Jadwal (Schedule Feasibility)
Alokasi total sebesar **5.0 Story Points** atau setara dengan **~2.75 hari kerja** adalah estimasi yang sangat realistis dan konservatif untuk menyelesaikan 7 findings secara permanen. Durasi ini sudah mencakup buffer penyesuaian unit test dan pengujian lintas perangkat, sehingga menjamin zero-rework pasca implementasi.

---

## 16. MATRIKS KETERLACAKAN TEMUAN KE KRITERIA PENERIMAAN (FINDING-TO-AC TRACEABILITY MATRIX)

Tabel berikut memberikan pembuktian keterlacakan penuh (end-to-end traceability) dari setiap Finding ID hingga verifikasi dan DoD:

| Finding ID | Judul Temuan Resmi | Inti Original AC (Master Backlog) | Kode Solusi Teknis | Penugasan Tugas Atomik | Skenario Uji Terkait | Pemenuhan Kriteria DoD |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| **IMP-001** | Standardisasi Copywriting Hero Section | Heading mencakup transparansi & akuntabilitas harian. | SOL-HERO-COPY-01 | TASK-HERO-02 | TC-HERO-001A, TC-HERO-001B | DoD-01, DoD-04 |
| **IMP-002** | Penyempurnaan Teks Poin Fitur 1 | Mengganti 'Komitmen Pagi Tuntas' dengan judul siklus harian. | SOL-HERO-COPY-02 | TASK-HERO-02 | TC-HERO-002A, TC-HERO-002B | DoD-01, DoD-08 |
| **IMP-003** | Penyempurnaan Teks Poin Fitur 2 | Judul pekerjaan tambahan terstruktur & bernada formal. | SOL-HERO-COPY-03 | TASK-HERO-02 | TC-HERO-003A, TC-HERO-003B | DoD-01, DoD-04 |
| **IMP-004** | Penyempurnaan Teks Poin Fitur 3 | Judul evaluasi akhir hari otentik & 3 pilar penjelas. | SOL-HERO-COPY-04 | TASK-HERO-02 | TC-HERO-004A, TC-HERO-004B | DoD-01, DoD-04 |
| **IMP-005** | Penyelarasan Value Proposition Hero | Narasi holistik alur kerja komitmen dari pagi hingga sore. | SOL-HERO-COPY-05 | TASK-HERO-02 | TC-HERO-005A | DoD-01, DoD-05 |
| **IMP-006** | Standardisasi Ikon Vektor SVG pada 3 Poin Fitur | Ganti emoji dengan 3 ikon vektor SVG Lucide profesional. | SOL-HERO-ICON-01 | TASK-HERO-01, TASK-HERO-03 | TC-HERO-006A, TC-HERO-006B, TC-HERO-006C | DoD-01, DoD-02, DoD-04 |
| **IMP-012** | Penyelarasan Panel Kiri Halaman Aktivasi Akun | Panel kiri ActivateView menampilkan 3 poin fitur identik LoginView. | SOL-HERO-PARITY-01 | TASK-HERO-04 | TC-HERO-012A, TC-HERO-012B | DoD-01, DoD-03, DoD-04 |

---

## 17. REKAPITULASI KEPUTUSAN FINAL PRODUCT OWNER & INFORMASI YANG MEMBUTUHKAN KLARIFIKASI

### 17.1. Keputusan Solusi Final yang Telah Disahkan Product Owner (Binding Decisions)

Product Owner (Bpk. Harry) telah meratifikasi keputusan final untuk seluruh ketujuh temuan dalam paket `SOL-AUTH-HERO`:

1. **IMP-001 (Tagline Hero Login):**  
   Disetujui: *"Platform transparansi kerja harian untuk mengenali risiko sejak dini dan memastikan hambatan operasional ditangani secara objektif dan terukur"* (tanpa titik di akhir).
2. **IMP-002 (Judul Poin Fitur 1):**  
   Disetujui: *"Komitmen Harian"* (menggantikan *"Komitmen Pagi Tuntas"*).
3. **IMP-003 (Subtitle Poin Fitur 1):**  
   Disetujui: *"Tetapkan 1–3 komitmen kerja utama yang realistis untuk diselesaikan hari ini."*
4. **IMP-004 (Judul & Subtitle Poin Fitur 2):**  
   Disetujui: Judul *"Pelaporan Hambatan Kerja"*, Subtitle *"Sampaikan hal yang menghambat pekerjaan atau koordinasi agar dapat segera ditindaklanjuti."*
5. **IMP-005 (Judul & Subtitle Poin Fitur 3):**  
   Disetujui: Judul *"Kemitraan & Dukungan Tim"*, Subtitle *"Bangun keselarasan kerja dan saling dukung untuk mencapai tujuan bersama."*
6. **IMP-006 (Standardisasi Ikon SVG):**  
   Disetujui: Poin 1 = `Target`, Poin 2 = `Flag`, Poin 3 = `Users`. Format SVG Lucide murni, bebas emoji.
7. **IMP-012 (Paritas Panel Hero Aktivasi):**  
   Disetujui: Panel kiri `/activate` identik 100% dengan `/login` (tagline, 3 poin fitur, ikon SVG); form aktivasi kanan tetap independen; sembunyikan pada mobile viewport (< 900px).

---

### 17.2. Informasi Teknis yang Membutuhkan Konfirmasi Operasional (Pending Implementation Clarification)

Sesuai aturan tata kelola, satu-satunya hal teknis yang dicatat untuk dikonfirmasi pada saat implementasi dimulai adalah:
- **Pilihan Arsitektur Komponen (Opsi A vs Opsi B):**  
  Apakah implementasi fisik di kode sumber akan menggunakan Opsi A (inline terpisah pada kedua file view) atau Opsi B (ekstraksi komponen reusable `AuthBrandHero.vue`).  
  *Catatan Tim:* Kedua opsi menghasilkan tampilan, semantik DOM, aksesibilitas, dan pemenuhan AC yang 100% identik bagi pengguna akhir.

---

## 18. BLOK TATA KELOLA & PENGESAHAN DOKUMEN (GOVERNANCE & SIGN-OFF BLOCK)

Rencana Kerja Remediasi (RWP) Siklus 2 Kelompok 1 versi 0.2 ini disusun secara komprehensif oleh Tim Teknis Gabungan dan diajukan secara resmi kepada Acceptance Owner untuk dievaluasi.

| Peran Tata Kelola (Role) | Nama / Identitas | Status Evaluasi | Tanggal Tinjauan | Tanda Tangan / Persetujuan |
|:---|:---|:---:|:---:|:---:|
| **Acceptance Owner & Lead Manual UAT Tester** | Harry (PT Dutamedia Mandiri Pratama) | **RATIFIED & APPROVED** | 02 November 2026 | `[SIGNED - PRODUCT OWNER]` |
| **Senior Product Designer** | AI Architecture & Design Team | **SUBMITTED** | 02 November 2026 | `[SIGNED - TECHNICAL DRAFT]` |
| **Software Architect & Frontend Lead** | AI Engineering Team | **SUBMITTED** | 02 November 2026 | `[SIGNED - TECHNICAL DRAFT]` |
| **QA Strategy & Test Lead** | AI Quality Assurance Team | **SUBMITTED** | 02 November 2026 | `[SIGNED - TECHNICAL DRAFT]` |

> [!IMPORTANT]
> **CATATAN KEPATUHAN & BATASAN KERJA (STRICT PROTOCOL ENFORCEMENT):**  
> 1. Dokumen ini berstatus **DRAFT RWP v0.2 FOR OWNER REVIEW**.  
> 2. Seluruh analisis, arsitektur solusi, dan skenario pengujian di atas disajikan untuk evaluasi tata kelola.  
> 3. **TIDAK ADA IMPLEMENTASI KODE SUMBER** yang diizinkan untuk dimulai sebelum Acceptance Owner menerbitkan keputusan formal tertulis atas dua keputusan terbuka pada Bagian 17 dan meratifikasi dokumen RWP ini.
