# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 08: PULSE DASHBOARD (TEAM PULSE / FUNCTION PULSE / MANAGEMENT PULSE)

- **Berkas Prototipe:** [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html)
- **Rute Sistem:** 
  - `/team` (Team Pulse — Supervisor / Technical Lead)
  - `/function` (Function Pulse — Head of Department / Function Owner)
  - `/management` (Management Pulse — CEO / Direksi / General Management)
- **Posisi Alur:** Pusat Pemantauan Operasional & Intervensi Cepat Pimpinan (*Operational Command Center & Rapid Intervention Hub*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [01-PDD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/01-PDD.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md) (§FR-11, §FR-16, §FR-21, §FR-29, §FR-30, §FR-37, §FR-39, §FR-64, §FR-65, §FR-68, §FR-69, §FR-70, §FR-71, §FR-72, §FR-73, §AC-62, §AC-63, §AC-78), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md) (§4.8, UF-30, UF-31, UF-32), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Pusat Deteksi Kendala Operasional Cepat (*Rapid Exception Detection*):** Memampukan pimpinan organisasi memantau kesehatan operasional tim dalam hitungan detik tanpa perlu meminta laporan status manual, tanpa rapat harian berkepanjangan, dan tanpa memeriksa ratusan kartu kerja satu per satu.
2. **Pola Desain *Exception-First* (Masalah Utama di Atas):** Menempatkan kondisi berisiko tinggi (*RED*, *Blocker Unacknowledged*, *No Submission*, dan *Carry-over Berulang*) di posisi visual paling atas dan paling mencolok, sehingga tindakan mitigasi dan pembinaan dapat segera diarahkan ke titik masalah.
3. **Penyajian 2 Dimensi Independen (Anti-Bias & Obyektif):** Memisahkan secara tegas antara **Status Risiko Kerja** (`GREEN`, `AMBER`, `RED`, `NOT_APPLICABLE — NO_COMMITMENT`) dengan **Ketepatan Waktu Pengiriman** (`On-Time`, `Late`, `No Submission`). Sistem menegaskan bahwa *No Submission* adalah fakta pengiriman, bukan status risiko otomatis dan bukan vonis pelanggaran disipliner.
4. **Pemberdayaan Dukungan dan Bukan Pengawasan Ketat (*Empowerment over Surveillance*):** Berfungsi sebagai alat bagi pimpinan untuk membantu dan membuka sumbatan kerja (*unblock*) anggota tim, mencatat dukungan lintas tim, serta menyeimbangkan kapasitas tim secara manusiawi.

### 1.2 Batasan Desain Baku & Guardrails Bisnis
- **Anti-Gamifikasi & Dilarang Menampilkan Leaderboard (FR-66, FR-68, FR-69, BR-08):** DILARANG MUTLAK menyajikan papan peringkat (*leaderboard*), perankingan nama karyawan tercepat/terbanyak menyelesaikan tugas, atau skor KPI otomatis.
- **Prinsip Non-Otomatisasi Sanksi (FR-30, FR-72):** Sistem DILARANG memiliki tombol "Terbitkan SP" atau sanksi otomatis. Status merah atau kelalaian pengisian hanya menjadi data faktual untuk pembinaan manusiawi secara langsung (*offline HR process*).
- **Integritas Komitmen Karyawan:** Pimpinan DILARANG mengedit, mengubah, atau menghapus teks komitmen harian bawahan secara sepihak. Koreksi hanya dapat diajukan oleh karyawan melalui alur resmi *Correction Request*.
- **Nol Emoji / Emoticon:** 100% menggunakan SVG monokrom profesional berbasis garis (*line-stroke 1.8–2.2*) yang senada dengan bahasa desain WorkPulse.

---

## 2. HAK AKSES, MATRIKS PERAN & REGISTER KOMPONEN MOCK

### 2.1 Hak Akses & Matriks Peran Pengguna

Halaman ini diakses melalui satu item menu navigasi di sidebar bernama **"Pulse Dashboard"**, namun rute dan cakupan data yang disajikan disaring ketat berdasarkan peran dan wewenang pengguna:

| Peran Pengguna | Tingkat Tampilan (*Scope*) | Cakupan Data yang Berhak Dilihat | Rute Akses |
|---|---|---|---|
| **Supervisor / Technical Lead** | **Team Pulse** | Hanya anggota tim/proyek langsung yang berada di bawah wewenangnya. | `/team` |
| **Head of Department / Function Owner** | **Function Pulse** | Seluruh anggota, sub-tim, dan proyek dalam satu fungsi/divisi (misal: Divisi Engineering). | `/function` |
| **CEO / Direksi / General Management** | **Management Pulse** | Agregat tren operasional tingkat perusahaan secara lintas divisi (*company-wide*). | `/management` |
| **Employee Biasa** | *Tidak Ada Akses* | Menu sidebar disembunyikan. Akses URL langsung dialihkan ke `/today` (Halaman 02). | – |
| **PM / HRGA / System Admin** | *Kewenangan Khusus* | Hanya jika diberikan hak dashboard eksplisit; secara default diarahkan ke ruang kerja masing-masing (Project Risk / Compliance / Org Mapping). | Sesuai delegasi |

---

### 2.2 PANDUAN LENGKAP REGISTER KOMPONEN MOCK / MODE PROTOTIPE (DESIGN-ONLY COMPROMISES) VS IMPLEMENTASI PRODUKSI

Dokumen ini secara transparan mendata seluruh teknik mock, mode demonstrasi, dan kompromi prototipe visual yang diterapkan pada berkas `08-Pulse-Dashboard.html`, disertai alasan teknis yang kuat (*karena X supaya Y*) dan spesifikasi implementasi backend produksi yang wajib ditegakkan:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ REGISTER KOMPONEN MOCK / MODE PROTOTIPE PADA HALAMAN 08                                                │
├──────────────────────────┬──────────────────────────────────────────┬──────────────────────────────────┤
│ Komponen / Perilaku Mock │ Alasan Desain Prototipe (Karena X Supaya │ Panduan Implementasi Produksi    │
│                          │ Y)                                       │ (Wajib / Nyata)                  │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 1. Parameter URL         │ KARENA: Menguji 3 level hierarki         │ PADA PRODUKSI: Parameter ini     │
│    `?demo=all`           │ (Supervisor, Head, CEO) membutuhkan      │ DITIADAKAN MUTLAK. Akses scope   │
│                          │ siklus logout-login berulang jika        │ sepenuhnya ditentukan oleh token │
│                          │ diproteksi kaku.                         │ sesi JWT/auth cookie pengguna    │
│                          │ SUPAYA: Desainer, QA, dan pimpinan       │ (PRD §AC-62). Jika bukan CEO, tab│
│                          │ dapat mengevaluasi responsivitas ketiga  │ Management tidak boleh muncul.   │
│                          │ mode dalam 1 tab browser secara instan.  │                                  │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 2. Tab Switcher 3-in-1   │ KARENA: Halaman 08 memiliki 85% kesamaan │ PADA PRODUKSI: Bar tab switcher  │
│    (`.scope-bar`)        │ layout antarmuka dasar lintas scope.     │ TIDAK DIRENDER (HIDDEN) bagi     │
│                          │ SUPAYA: Tidak terjadi redundansi kode    │ pimpinan ber-role tunggal        │
│                          │ pada 3 file HTML terpisah dan konsistensi│ (Supervisor biasa hanya melihat  │
│                          │ visual tetap terjaga 100%.               │ `/team`). Hanya multi-role/CEO   │
│                          │                                          │ yang melihat tab switcher.       │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 3. Master Data Object    │ KARENA: Prototipe HTML berjalan mandiri  │ PADA PRODUKSI: Data dimuat       │
│    (`mockData`,          │ tanpa backend database aktif.            │ dinamis via endpoint REST/GraphQL│
│    `companyFunctionData`,│ SUPAYA: Angka metrik, kendala operasional,│ (misal: `GET /api/v1/pulse/      │
│    `riskTrendData`, dsb.)│ tren risiko, dan widget CEO disimulasikan│ dashboard?scope=...`) dengan     │
│                          │ secara realistis dan interaktif.         │ query SQL terindeks & Redis.     │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 4. Drill-down Modal Data │ KARENA: Memerlukan contoh konkret format │ PADA PRODUKSI: Data komitmen     │
│    (`openMemberModal`)   │ peninjauan komitmen bawahan (UF-30).     │ diambil dinamis via API:         │
│                          │ SUPAYA: Penguji dapat memvalidasi tombol │ `GET /api/v1/commitments/daily/  │
│                          │ coaching, histori, dan tiket blocker.    │ :memberId?date=:date`.           │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 5. Filter Proyek Lokal   │ KARENA: Penyaringan data dilakukan di    │ PADA PRODUKSI: Perubahan filter  │
│    (`applyProjectFilter`)│ memori browser klien (*client-side*).    │ memicu request query parameter ke│
│                          │ SUPAYA: Interaksi filter responsif instan│ server (`?project_id=123`) atau  │
│                          │ tanpa jeda network pada prototipe.       │ state store (Redux/Pinia/NgRx).  │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 6. Deep-Link Berkas Statis│ KARENA: Berkas antarmuka berbentuk HTML │ PADA PRODUKSI: Menggunakan       │
│    (`.html` link)        │ statis mandiri dalam folder lokal.       │ rute SPA internal (`router.push` │
│                          │ SUPAYA: Pengguna dapat berpindah halaman │ `/reviews`, `/blockers`, dsb.)   │
│                          │ secara mulus saat mendemonstrasikan alur.│ dengan konteks ID yang relevan.  │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────┤
│ 7. Demo Role Switcher &  │ KARENA: Jika pengguna sedang login       │ PADA PRODUKSI: Karyawan biasa    │
│    Modal Restriksi Akses │ sebagai Budi Pratama (EMPLOYEE), PRD     │ yang membuka URL `/pulse`        │
│    (`quickRoleSwitcher` &│ §AC-62 melarang akses ke dashboard ini.  │ langsung menerima HTTP 403 /     │
│    `employeeAccessModal`)│ SUPAYA: Penguji prototipe tidak terjebak │ redirect server-side ke `/today` │
│                          │ dalam auto-redirect loop dan dapat       │ tanpa opsi switch peran bebas.   │
│                          │ beralih menjadi Supervisor/Head/CEO      │ Peran murni ditentukan oleh      │
│                          │ dengan 1 klik atau via URL `?role=...`.  │ otorisasi backend dan IdP.       │
└──────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────┘
```

---

## 3. ANATOMI ANTARMUKA & TATA LETAK 3 CAKUPAN (MULTI-SCOPE LAYOUT)

Antarmuka ditata dalam 3 mode cakupan independen dengan **jarak bernapas (*whitespace*) yang lapang (gap 24–32px)** agar pimpinan dapat membaca informasi dengan nyaman tanpa merasa pusing atau lelah:

---

### 3.1 Mode 1: Team Pulse (`/team`) — Supervisor / Technical Lead
> **Fokus Utama:** Pemantauan langsung anak buah, penyelesaian hambatan hari ini, dan pemeriksaan laporan harian.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [☰ Hamburger Mobile] Breadcrumb: Pulse Dashboard / Team Pulse  [Demo Switcher] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PAGE HEADING & LINGKUP UNIT (Eyebrow: Dashboard Operasional, H1: Team Pulse, Lingkup) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SCOPE SWITCHER & FILTER BAR: [Team Pulse*] [Function Pulse] [Management Pulse]         │
│ Filter: [Semua Proyek & Inisiatif ▼]  [Hari Ini (21 Okt 2026) ▼]                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ BARIS 1: 4 KARTU ANGKA DARURAT HARI INI (EXCEPTION-FIRST)                              │
│ [ Belum Lapor: 4 ]  [ Status Amber: 5 ]  [ Status Merah: 3 ]  [ Blocker Belum Direspon: 2 ]
├──────────────────────────────────────────────────────────┬─────────────────────────────┤
│ BARIS 2 (KOLOM KIRI - 65% LEBAR UTAMA)                   │ BARIS 2 (KOLOM KANAN - 35%) │
│                                                          │                             │
│ ▌ WIDGET 1: DAFTAR ORANG BUTUH PERTOLONGAN HARI INI      │ ▌ WIDGET 3: HAMBATAN        │
│   • Raka Aditya (RED · EOD - DB Connection Timeout)      │   NYANGKUT DI SIAPA?        │
│     Aksi Cepat: [Detail ↗]                               │   • Dimas Putra (Ops): 3    │
│   • Nadia Safitri (AMBER · Blocker SLA - API Gateway)    │   • Nadia Safitri (FE): 2   │
│     Aksi Cepat: [Detail ↗]                               │   • Raka Aditya (BE): 1     │
│   • Bambang Pamungkas (RED - Memory leak worker)         │   (Progress bar proporsional│
│   • Farhan Maulana (No Submission - Offsite testing)     │                             │
│                                                          ├─────────────────────────────┤
│ ▌ WIDGET 2: ANTREAN PEMERIKSAAN LAPORAN (Review Queue)   │ ▌ WIDGET 4: CATATAN SALING  │
│   • Tabel simpel pengajuan komitmen/koreksi bawahan      │   BANTU LINTAS TIM (FR-64)  │
│   • Dimas Putra (Morning Commitment) -> [✓ Setujui]      │   • Feed kabar gotong royong│
│   • Nadia Safitri (Koreksi Komitmen) -> [Tinjau ↗]       │   • Bantuan Dimas & Nadia   │
│   • Farhan Maulana (Izin Uji Lapangan) -> [✓ Setujui]    │                             │
├──────────────────────────────────────────────────────────┴─────────────────────────────┤
│ BARIS 3: EVALUASI & TREN MINGGUAN (Bagi 2 Kolom Seimbang: 50% - 50%)                   │
│                                                          │                             │
│ ▌ WIDGET 5: GRAFIK TUGAS MOLOR 5 HARI (Carry-Over Trend) │ ▌ WIDGET 6: KEANDALAN       │
│   • Histogram 5 hari kerja (Senin–Jumat)                 │   KOMITMEN MINGGUAN TIM     │
│   • Sorotan 2 tugas tertunda >= 2 hari beruntun          │   • Rasio Tuntas: 89%       │
│   • Sinyal objektif evaluasi kapasitas tim               │   • Respon Blocker SLA: 94% │
│                                                          │   • 100% Bebas Ranking      │
└──────────────────────────────────────────────────────────┴─────────────────────────────┘
```

---

### 3.2 Mode 2: Function Pulse (`/function`) — Head of Department
> **Fokus Utama:** Perbandingan beban antar-subtim dalam divisi, penanganan eskalasi antar-departemen, dan pembinaan anggota.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BARIS 1: BANNER PELIMPAHAN SEMENTARA & 4 KARTU KONDISI SKALA DIVISI                    │
│ [ℹ Pelimpahan Peninjau Sementara Aktif (US-14): SPV Mobile cuti -> Dialihkan ke Rian]  │
│ [ Belum Lapor: 9 ]  [ Amber Divisi: 11 ]  [ Merah Divisi: 7 ]  [ Blocker Divisi: 4 ]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ BARIS 2: TABEL PERBANDINGAN KESEHATAN ANTAR-TIM DALAM DIVISI (Lebar Penuh 100%)        │
│ ▌ MATRIKS SUB-TIM:                                                                     │
│   • Tim Frontend Engineering : 16 Staf | 12 Hijau, 3 Kuning, 1 Merah | Stabil (94%)    │
│   • Tim Core Backend & Arch  : 18 Staf | 11 Hijau, 4 Kuning, 3 Merah | Butuh Perhatian │
│   • Tim Mobile Application   : 14 Staf |  9 Hijau, 2 Kuning, 2 Merah | Butuh Perhatian │
│   • Tim QA & Automation Test : 16 Staf | 10 Hijau, 2 Kuning, 1 Merah | Stabil (90%)    │
├──────────────────────────────────────────────────────────┬─────────────────────────────┤
│ BARIS 3 (KOLOM KIRI - 60% LEBAR)                         │ BARIS 3 (KOLOM KANAN - 40%) │
│                                                          │                             │
│ ▌ MASALAH BERAT & ESKALASI LINTAS DIVISI (US-12)         │ ▌ AKAR HAMBATAN TERSERING   │
│   • Butuh Finance: Lisensi DB Cloud Tertahan (26 Jam)    │   • Vendor Lambat: 38%      │
│     Aksi: [Hubungi Head Finance ↗]                       │   • Spek Berubah : 28%      │
│   • Butuh HRGA: Perjanjian NDA Sandbox Vendor (18 Jam)   │   • Koneksi Server: 20%     │
│     Aksi: [Hubungi Head HRGA ↗]                          ├─────────────────────────────┤
│                                                          │ ▌ CATATAN PEMBINAAN &       │
│                                                          │   APRESIASI DIVISI (US-13)  │
│                                                          │   • Farhan (Coaching Jadwal)│
│                                                          │   • Nadia (Apresiasi Kinerja│
│                                                          │   • Aksi: [+ Tulis Catatan] │
└──────────────────────────────────────────────────────────┴─────────────────────────────┘
```

---

### 3.3 Mode 3: Management Pulse (`/management`) — CEO / Direksi
> **Fokus Utama:** Radar risiko bisnis perusahaan, penuaan tiket menua (Aging SLA), tren risiko proyek strategis, dan taksonomi akar masalah korporat.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BARIS 1: 4 KARTU METRIK EKSEKUTIF UTAMA (COMPANY-WIDE)                                 │
│ [ Proyek Risiko: 2 ] [ Tiket Menua >24h: 3 ] [ Kepatuhan: 94.2% ] [ Insiden Klien: 1 ] │
├──────────────────────────────────────────────────────────┬─────────────────────────────┤
│ BARIS 2: KESEHATAN 4 DIVISI & PENUAAN ESKALASI (55% : 45%)                             │
│ ▌ WIDGET 1 (FR-69): KESEHATAN 4 DIVISI UTAMA             │ ▌ WIDGET 5 (FR-69): PENUAAN │
│   • Divisi Engineering : 64 Staf | Exc: 28.1% | Sub: 86% │   TIKET MENUA (AGING)       │
│   • Divisi Commercial  : 40 Staf | Exc: 20.0% | Sub: 93% │   [<24h: 5] [24-48h: 2]     │
│   • Divisi Ops & Infra : 37 Staf | Exc: 24.3% | Sub: 89% │   [🚨 >48h: 1 KRITIS BERKEDIP│
│   • Divisi Product     : 35 Staf | Exc: 14.3% | Sub: 94% │   • Sertifikasi API Auditor │
├──────────────────────────────────────────────────────────┴─────────────────────────────┤
│ BARIS 3: TREN RISIKO 5 HARI & 10 AKAR MASALAH (Bagi 2 Kolom Seimbang: 50% - 50%)       │
│ ▌ WIDGET 2 (FR-69): TREN RISIKO PROYEK STRATEGIS 5 HARI  │ ▌ WIDGET 3 (FR-69): 10 AKAR │
│   • Core Payment Engine : 6 RED, 10 AMBER (▲ Meningkat)  │   MASALAH UTAMA PERUSAHAAN  │
│   • Merchant Portal Web : 4 RED,  8 AMBER (■ Stabil)     │   • Tech & Architecture: 28%│
│   • Divisi Engineering  : 7 RED, 11 AMBER (▼ Menurun)    │   • Requirement Unclear: 18%│
│   • Divisi Ops Delivery : 4 RED,  5 AMBER (■ Stabil)     │   • Client / Stakeholder:14%│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ BARIS 4: KEPATUHAN & INSIDEN KLIEN (Bagi 2 Kolom Seimbang: 50% - 50%)                  │
│ ▌ WIDGET 4 (FR-69 & §13): KEPATUHAN & PATTERN FLAGS      │ ▌ WIDGET 6 (FR-69): INSIDEN │
│   • Kepatuhan Perusahaan: 94.2% (Target >= 90%)          │   BERDAMPAK KLIEN (SLA)     │
│   • 2 Review Event Aktif (Kasus 3x No-Sub / 30 Hari)     │   • Sertifikasi API Auditor │
│   • Farhan Maulana & Budi Santoso (Non-Auto SP)          │     SLA: Tersisa 1 Jam 45 M │
└────────────────────────────────────────────────────────────────────────────────────────┘
```��──────────────────────────────────────────────────────────────────────────┤
│ 3. 4 EMERGENCY METRIC CARDS (Urutan Logis & Bebas Ambigu):                  │
│    [ Belum Kirim: 4 ]  [ AMBER: 5 ]      [ RED: 3 ]            [ Blocker: 2]│
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 4. PERLU PERHATIAN SEGERA            │ 7. OPEN BLOCKERS BY SUPPORT OWNER    │
│    (Exception-First Action List)     │    - PIC penanggung jawab kendala    │
│    - Raka Aditya: RED (Backend DB)   │    - Hitung mundur SLA respon        │
│    - Nadia: AMBER (API Vendor SLA)   │    - Aksi: [Buka Antrean Blocker ↗]  │
│    - Aksi: [Detail Komitmen ↗]       ├──────────────────────────────────────┤
├──────────────────────────────────────┤ 8. TREN CARRY-OVER (CONTINUATION)    │
│ 5. RINGKASAN STATUS HARIAN           │    - Histogram 5 hari kerja (Sen-Jum)│
│    (Tabel 2 Dimensi Independen)      │    - Sorotan tugas Continue >= 2 hari│
│    Tabel 1: Status Risiko            ├──────────────────────────────────────┤
│    • GREEN: 18  • AMBER: 5  • RED: 3 │ 9. KEANDALAN KOMITMEN MINGGUAN       │
│    • NOT_APPLICABLE (0 Komitmen): 2  │    (Weekly Reliability - FR-68)      │
│    Tabel 2: Ketepatan Waktu          │    - 89% Komitmen Tuntas             │
│    • On-Time: 21  • Late: 3  • No: 4 │    - 94% Blocker Respon Tepat Waktu  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 6. DUKUNGAN LINTAS TIM (FR-64)       │ 10. ANTREAN REVIEW DALAM LINGKUP     │
│    (Cross-Project Support Record)    │    - 2 Koreksi Morning / EOD         │
│    - Catatan gotong royong antar tim │    - 1 Pengajuan Cuti                │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 3.2 Mode Manajemen Eksekutif (Management Pulse `/management` — CEO Dashboard)

Mode ini menyajikan **6 Widget Resmi CEO (FR-69 & AC-78)** tingkat perusahaan:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. 4 METRIK KONDISI KRITIS PERUSAHAAN (NoSub: 17, AMB: 26, RED: 14, Blk: 8) │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 2. WIDGET 1 (FR-69):                 │ 5. WIDGET 3 (FR-69):                 │
│    Ringkasan Kendala Lintas Divisi   │    Akar Masalah Dominan              │
│    (Company-Wide Exception Overview) │    (10 Taksonomi Blocker Resmi 100%) │
│    - Matriks 4 Divisi Utama          │    - Tech, Req, Client, Vendor, Res, │
│    - Total Tim, G/A/R, Exc & Sub Rate│      Infra, Approval, Finance, Legal │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 3. WIDGET 2 (FR-69):                 │ 6. WIDGET 4 (FR-69 & §13 PRD):       │
│    Tren Risiko RED/AMBER Lintas      │    Tren Kepatuhan & Kasus Disiplin   │
│    Fungsi & Proyek Strategis         │    - Compliance Rate: 94.2%          │
│    - Core Payment, Merchant Portal   │    - 2 Kasus Pattern Flag Aktif      │
│    - Arah Trajektori (Naik/Turun)    │    - Tautan Review Pembinaan         │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 4. WIDGET 6 (FR-69 & FR-16):         │ 7. WIDGET 5 (FR-69):                 │
│    Insiden Berdampak Klien & Proyek  │    Penuaan Eskalasi Belum Selesai    │
│    - Blocker Kritis Client SLA       │    (Unresolved Escalation Aging)     │
│    - Blocker Milestone Project       │    - Tiket Menua >24 Jam & >48 Jam   │
│    - Sisa Waktu SLA & Status L2/L3   │    - PIC Pimpinan & Level Eskalasi   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 8. RINGKASAN STATUS 2 DIMENSI        │ 9. KEANDALAN KOMITMEN PERUSAHAAN     │
│    (128 Green, 26 Amber, 14 Red)     │    - 84% Komitmen, 88% Blocker SLA   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 4. PENJELASAN RINCI SETIAP KOMPONEN / WIDGET

### 4.1 Header, Scope Switcher & Filter Bar
* **Kartu Lingkup Unit:** Menampilkan secara transparan batasan unit kerja yang sedang disajikan kepada pimpinan (`Tim Produk Digital`, `Divisi Engineering`, atau `Company-Wide`) guna menjamin privasi dan *least privilege access*.
* **Scope Switcher Tabs:** Memfasilitasi pimpinan dengan kewenangan ganda (*multi-role*) untuk beralih perspektif secara cepat. Tombol tab dilengkapi proteksi RBAC: jika pengguna tidak berwenang, tombol ditampilkan redup dengan ikon gembok dan kursor *not-allowed*. Mengklik tab terlarang memunculkan toast penolakan ramah tanpa kebocoran data.
* **ATURAN KRUSIAL: Preservasi Status Tab Aktif (*Active Tab State Persistence*):**
  > [!IMPORTANT]
  > **Persistensi Tab Terakhir yang Dikunjungi (Auto-Restore on Reload / Return):**  
  > Ketika pimpinan beralih ke tab tertentu (misalnya berpindah dari *Team Pulse* ke *Function Pulse* atau *Management Pulse*), sistem **wajib menyimpan state cakupan tab aktif tersebut** (melalui `sessionStorage` dengan kunci `workpulse_last_active_scope` dan sinkronisasi parameter URL `?scope=...`).  
  > Saat pimpinan **me-refresh browser** atau **kembali lagi ke Halaman 08** dari modul lain (seperti setelah meninjau arsip di Halaman 06, menindaklanjuti blocker di Halaman 09, atau memberi bimbingan di Halaman 10), antarmuka **wajib secara otomatis membuka kembali tab cakupan terakhir yang dikunjungi**, bukan mereset paksa kembali ke tab bawaan (*Team Pulse*). Hal ini menjamin kontinuitas alur kerja manajerial agar pimpinan tidak frustrasi harus memilih ulang tab setiap kali kembali ke dashboard.
* **Filter Bar:** Memungkinkan penyaringan cepat berdasarkan nama proyek atau tim spesifik untuk melokalisir sumber kendala. Nilai tabel 2 dimensi dan kartu darurat terkalkulasi ulang secara reaktif.

### 4.2 4 Kartu Metrik Kondisi Kritis Paling Atas (*The 4 Emergency Cards*)
Urutan kartu disusun secara bertahap dari partisipasi harian, peringatan dini, risiko berat, hingga hambatan yang memerlukan intervensi langsung. Seluruh kartu kini berfungsi sebagai **tombol filter instan (*quick interactive filter*)** yang dilengkapi satuan angka jelas, teks petunjuk aksi, dan indikator aktif (*highlight border*):

1. **Belum Mengisi Komitmen (4 Orang):**  
   Menghitung jumlah anggota tim aktif yang belum melakukan check-in komitmen Morning atau laporan hasil EOD sore. Menggunakan warna netral (`#FFFFFF` dengan border halus) dan lencana *"Perlu Diingatkan"*, menegaskan prinsip WorkPulse bahwa belum melapor adalah fakta pengiriman untuk pengingat ramah (*gentle reminder*), bukan vonis kesalahan. Mengklik kartu ini otomatis menggulirkan layar (*smooth scroll*) ke panel *"Perlu Perhatian Segera"*, menyaring daftar hanya untuk 4 anggota tersebut, serta memicu efek denyut bingkai menyala (*pulse highlight*) berwarna hijau netral.
2. **Komitmen Waspada / Amber (5 Tugas):**  
   Menghitung rencana kerja/tugas yang sedang menghadapi kendala sedang atau potensi keterlambatan ringan yang masih dapat dimitigasi. Menggunakan latar kuning lembut (`#FFF3D9`) dengan lencana *"Perlu Pantauan"*. Mengklik kartu ini menyaring daftar hanya untuk 5 tugas waspada serta memicu denyut bingkai menyala warna kuning/amber pada panel *"Perlu Perhatian Segera"*.
3. **Komitmen Kritis / Merah (3 Tugas Macet):**  
   Menghitung tugas kerja atau hasil EOD dengan tingkat risiko berat (*hard blocker*) atau terancam gagal total tanpa bantuan pimpinan. Menggunakan latar merah lembut (`#FFF8F8`) dengan lencana *"Kritis"*. Mengklik kartu ini menyaring daftar hanya untuk 3 kasus macet serta memicu denyut bingkai menyala warna merah darurat pada panel *"Perlu Perhatian Segera"*.
4. **Blocker Belum Direspon (2 Blocker):**  
   Menghitung tiket blocker aktif anggota tim yang belum direspons atau belum ditindaklanjuti oleh penanggung jawab (*Support Owner*). Menggunakan latar oranye lembut (`#FFFBF5` dengan border `#FED7AA`) dan lencana *"Perlu Respon"* dengan ikon jam pengingat waktu tindakan. Mengklik kartu ini otomatis menggulirkan layar (*smooth scroll*) ke widget *"Penanggung Jawab Blocker Aktif"* (kolom kanan) dan memicu efek denyut bingkai menyala (*pulse highlight*) warna oranye, sementara widget *"Perlu Perhatian Segera"* tetap tenang mempertahankan batas preview normal 4 item tanpa melompat menampilkan seluruh kendala.

* **Aturan Isolasi Animasi Denyut (*Single-Pulse & Opposing Cancellation*):**  
  Seluruh efek animasi bingkai menyala (*pulse highlight*) pada keempat kartu metrik diatur secara deterministik dengan aturan isolasi ketat:
  - **Hanya 1 Kali Denyut (*Single Iteration*):** Setiap kali kartu diklik, animasi hanya berjalan tepat 1 siklus halus (durasi 1.0 detik), tidak berulang kali.
  - **Pembatalan Instan Efek Berseberangan (*Instant Opposing Cancellation*):**  
    - Mengklik Kartu 1, 2, atau 3 **hanya menyalakan Widget Kiri (*Perlu Perhatian Segera*)** dan seketika membatalkan/membersihkan efek menyala pada Widget Kanan (*Penanggung Jawab Blocker Aktif*).
    - Mengklik Kartu 4 **hanya menyalakan Widget Kanan (*Penanggung Jawab Blocker Aktif*)** dan seketika membatalkan/membersihkan efek menyala pada Widget Kiri (*Perlu Perhatian Segera*).
  - Tidak akan pernah terjadi kondisi di mana kedua widget menyala bersamaan, berkedip berkali-kali, atau denyut tertinggal akibat pergantian klik cepat (*rapid clicking*).

### 4.3 Section "Perlu Perhatian Segera" (*Exception-First Action List*)
* **Fungsi Utama:** Menyajikan daftar konkret anggota tim yang membutuhkan perhatian dan bantuan pimpinan hari ini (nama anggota, jabatan lengkap, lencana kategori kendala baku, dan ringkasan inti kendala).
* **Standar Taksonomi Lencana (*Exception Tag Taxonomy*):**  
  Seluruh lencana pada baris kendala wajib mengikuti formula baku: `[TINGKAT RISIKO] • [SUMBER / SEVERITY]`. Dilarang keras mencampurkan deskripsi masalah teknis (seperti *"Deploy Failed"* atau *"ETL Pipeline"*) ke dalam lencana.
  
  | Kategori Lencana | Asal Sumber Data | Arti & Karakteristik Data |
  | :--- | :--- | :--- |
  | **`RED • EOD`** | **Laporan Sore EOD (Halaman 04)** | **Final Status harian anggota bernilai RED** (bukan per tugas). Menandakan evaluasi capaian kerja hari ini gagal mencapai target utama. Sesuai aturan heuristik **FR-13**, Final Status RED disarankan jika $\ge 50\%$ tugas hari itu berstatus *Not Completed* atau *Cancelled*. |
  | **`RED • Blocker High` / `Critical`** | **Tiket Blocker Aktif (Halaman 05 / FR-16)** | **Tiket kendala darurat aktif** dengan keparahan (*Severity*) = *High* atau *Critical* yang membutuhkan bantuan penanggung jawab luar (*Support Owner*) untuk membuka sumbatan kerja. |
  | **`AMBER • EOD`** | **Laporan Sore EOD (Halaman 04)** | Final Status harian anggota bernilai AMBER (capaian sebagian atau membawa potensi risiko/carry-over yang masih dapat dimitigasi). |
  | **`AMBER • Blocker SLA` / `Medium`** | **Tiket Blocker Aktif (Halaman 05 / FR-16)** | Tiket kendala dengan tingkat keparahan sedang atau mendekati batas waktu toleransi respon (*SLA Warning*). |
  | **`No Submission`** | **Kepatuhan Penyerahan (Partisipasi)** | Anggota belum melakukan check-in Morning atau EOD hingga batas cutoff. |

* **Prinsip Independensi EOD RED vs Blocker:**  
  * **Apakah Final Status EOD RED selalu memiliki Blocker?** $\rightarrow$ **TIDAK SELALU.** Karyawan bisa saja menetapkan Final Status EOD = RED murni karena salah estimasi waktu, kelelahan, atau kesulitan internal tanpa ada orang lain yang menghalangi (tidak ada tiket blocker).
  * Sebaliknya, keberadaan *Critical Blocker* aktif otomatis membuat sistem menyarankan Final Status = RED (**FR-13 Cabang 1**).

* **Standar Baku Subteks Inti Kendala (*Exception One-Liner Summary Specification*):**  
  Subteks pada baris kedua kartu kendala berfungsi sebagai ringkasan penjelas tercepat (*3-second executive triage*) yang mendampingi pill nama proyek. Seluruh subteks wajib mengikuti kontrak data dan aturan ekstraksi sistem berikut:
  1. **Aturan Tanpa Awalan Redundan (*Zero-Prefix Rule*):**  
     Subteks **DILARANG KERAS** mengulang label status yang sudah ada pada lencana di baris atas. Dilarang menulis *"Final Status EOD Merah: ..."* atau *"Final Status EOD Amber: ..."*. Subteks wajib langsung menyajikan fakta operasional nyata secara lugas (contoh: *"Database connection pool staging failure saat stress test"*).
  2. **Matriks Sumber Data Ekstraksi Sistem:**  
     - **Jalur Tiket Blocker (`RED/AMBER • Blocker ...`):** Diambil langsung dari kolom `blocker_tickets.title` (judul hambatan yang diinput pelapor).
     - **Jalur Evaluasi Sore (`RED/AMBER • EOD`):** Diambil dari kalimat pertama kolom `daily_evaluations.eod_notes` (catatan evaluasi sore) yang telah disanitasi.
     - **Jalur Kepatuhan (`No Submission`):** Dihasilkan otomatis oleh sistem (*system-generated*) dengan template status ramah.
  3. **Penanganan 7 Kasus Kritis Lapangan (*Edge-Case Handling Rules*):**  
     - *Kasus Konflik Ganda (EOD Merah + Punya Blocker):* Jika anggota memiliki tiket blocker berstatus `Critical` atau `High`, sistem memprioritaskan judul blocker karena membutuhkan tindakan pertolongan pihak lain (*unblocker action*).
     - *Sanitasi Teks (Linebreaks & Bullets):* Sistem otomatis menghapus karakter baris baru (`\n`, `\r`) dan format bullet (`- `, `* `), memotong pada tanda titik pertama atau maksimal 80 karakter dengan ellipsis `...`.
     - *Fallback Catatan Kosong / Minim (< 10 Karakter):* Jika karyawan hanya mengetik tanda strip `-` atau `ok`, sistem otomatis beralih menampilkan fallback: `Tugas komitmen utama tidak selesai: [Judul Tugas #1]`.
     - *Kasus Multi-Blocker:* Jika anggota memiliki >1 tiket blocker aktif, sistem mengambil tiket dengan *Severity* tertinggi (atau sisa SLA paling mendesak) dan menyematkan indikator penjelas: `[Judul Blocker] (+1 blocker lainnya)`.
     - *Sensitivitas Waktu (No Submission):* Pagi hari menyajikan *"Belum check-in komitmen pagi hari ini"*, sore hari menyajikan *"Belum ada laporan komitmen maupun evaluasi sore (Seharian penuh)"*.
     - *Cuti Resmi & Izin Disetujui:* Karyawan cuti/sakit resmi tidak dimasukkan ke daftar pelanggaran komitmen (atau berstatus khusus: *"Sedang cuti resmi disetujui"*).
     - *Pengikatan Proyek Dinamis (*Dynamic Project Binding*):* Pill nama proyek di samping subteks diikat langsung pada proyek tempat kendala tersebut terjadi, bukan proyek utama default karyawan.

* **Batasan Preview Tampilan Awal (4 Item Teratas) & Akses Data Lengkap:**  
  * **Tujuan Layout:** Daftar awal saat posisi normal (tidak difilter) menampilkan **4 item kendala teratas** secara ringkas agar dashboard tetap padat, fokus, dan tidak membebani atensi pimpinan di layar utama.
  * **Hierarki Urutan Prioritas (*Priority Sorting Hierarchy*):**
    1. **Prioritas 1 (Paling Atas) - Kasus Merah (`RED`):** Tugas macet total atau kegagalan target yang mengancam proyek hari ini.
    2. **Prioritas 2 (Tengah) - Kasus Kuning (`AMBER`):** Tugas berisiko sedang sebagai deteksi dini (*early warning*).
    3. **Prioritas 3 (Paling Bawah) - Kasus Abu-abu (`No Submission`):** Anggota belum mengisi komitmen (pengingat administratif ramah).
  * **Akses Data Lengkap Melalui Tombol Header:** Sisa kendala lainnya diakses secara terpusat melalui tombol header **`Lihat Semua (12) ➔`** yang membuka modal dialog interaktif (`#allExceptionsModal`). Tidak ada lagi tombol inline tambahan di bagian bawah daftar agar tampilan tetap bersih dan konsisten.
* **Tautan & Modal "Perlu Perhatian Segera" (`#allExceptionsModal`):**  
  Membuka dialog daftar lengkap seluruh kendala tim (`Lihat Semua (12) ➔`) dengan penyempurnaan antarmuka:
  - **Bilah Kontrol 2 Tingkat:** Kotak pencarian selebar penuh (*full-width*) dengan ikon internal untuk menyaring nama anggota atau kendala secara instan, dipadukan dengan 4 filter chip status semantik (`Semua (12)`, `Hanya RED (3)`, `Hanya AMBER (5)`, `No Submission (4)`) yang memiliki status visual aktif solid dan tegas sesuai warnanya.
  - **Hierarki Baris Terstruktur (Anti-Wrapping):** Baris 1 memuat identitas anggota dan lencana risiko baku, Baris 2 memadukan pill proyek dengan deskripsi inti masalah, memastikan nama proyek tidak pernah patah canggung berapapun panjangnya nama anggota.
  - **Dimensi Responsif & Tata Letak Ramping (Tanpa Footer Redundan):** Menggunakan lebar fluid berbasis satuan dinamis **`min(92vw, 58rem)`** (tanpa satuan statis pixel) sehingga jauh lebih lega di layar monitor pimpinan dan otomatis beradaptasi proporsional di layar tablet/laptop. Menerapkan desain *footerless dialog* yang bersih tanpa tombol tutup atau teks counter ganda di bagian bawah, memberikan ruang vertikal ekstra untuk *custom slim scrollbar* halus (6px) dengan kapasitas pantau lebih banyak kendala. Mengklik baris langsung membuka Modal Detail Anggota (`#memberModal`) dengan menyimpan riwayat asal pembukaan (*navigation stack*).
* **Modal Detail Anggota Tim (`#memberModal` - UF-30 Step 4 Drilldown):**  
  Pop-up inspeksi mendalam komitmen individu dengan penjaminan konsistensi data dan navigasi:
  - **Sinkronisasi Data Dinamis 100%:** Data nama anggota, jabatan, avatar, status risiko, nama proyek (seperti *Core Payment Engine*, *WorkPulse Mobile PWA*, *Merchant Portal Web*), komitmen pagi, hasil evaluasi sore, tiket blocker, dan prioritas esok hari terpetakan 1-ke-1 secara presisi sesuai kartu kendala yang diklik.
  - **Konsistensi Lebar Fluid Antar-Modal:** Lebar modal detail disamakan persis dengan modal Daftar Lengkap menggunakan satuan dinamis **`min(92vw, 58rem)`** sehingga transisi antar-modal berjalan mulus tanpa lompatan ukuran (*jarring size shifts*), memberikan ruang baca yang lapang untuk rincian komitmen, catatan evaluasi, dan tiket blocker.
  - **Alur Navigasi Bertingkat Cerdas (*Smart Stack Back-Navigation*):** Jika modal detail dibuka dari dialog *Perlu Perhatian Segera*, tombol silang **`[X]`** di kanan atas ditiadakan dan posisinya digantikan oleh tombol **`[← Daftar Kendala]`** untuk mundur 1 langkah kembali ke dialog daftar dengan kondisi filter dan teks pencarian yang tetap tersimpan utuh. Jika modal dibuka langsung dari widget dashboard utama, header menampilkan tombol silang **`[X]`** presisi untuk menutup dan kembali ke dashboard. Pada kedua alur tersebut, footer modal detail tidak pernah menampilkan tombol "Tutup" redundan di bagian bawah, melainkan secara konsisten dan eksklusif menyajikan tombol aksi terpadu (*Histori Anggota ↗*, *Beri Coaching Note ↗*, dan *Tindak Lanjut Blocker →* / *Kirim Pengingat ↗*).
  - **Informasi Operasional & Tindakan:**
    - Komitmen pagi (*Morning Baseline*) & Hasil sore (*EOD Outcome & Risiko*).
    - Prioritas Esok Hari (*Tomorrow Priority* - FR-11) untuk konteks rencana kerja lanjutan.
    - **Standarisasi Kontrak 3 Metadata Tiket Blocker Terkait:** Baris detail blocker diseragamkan secara konsisten di seluruh anggota menggunakan skema universal: **`Owner Needed · Severity · Status`**. Menghindari pencampuran dimensi status proses dengan penghitung waktu SLA. Aturan penentuan sistem (*state machine*):
      - *Owner Needed:* Menampilkan personil spesifik yang ditugaskan (`Nama (Divisi)`), departemen penanganan (`Tim Terkait (Pending Assignment)`), atau `-` jika tanpa tiket aktif.
      - *Severity:* Tingkat dampak pada komitmen (`Critical`, `High`, `Medium`, `Low`, atau `None`).
      - *Status:* Mengevaluasi siklus hidup riil blocker: `Menunggu Respon (Dalam SLA)` saat tiket baru dibuat dalam rentang toleransi waktu; `Menunggu Respon (SLA Kritis)` jika personil terlambat merespons; `In Progress (Sedang Ditangani)` saat investigasi teknis aktif internal; `In Progress (Menunggu Vendor)` bila penanganan terhambat pihak ketiga; `Dieskalasi ke Lead` saat dinaikkan ke level manajerial; atau `Tidak Ada Blocker` untuk kasus keterlambatan administratif non-teknis / pergantian shift.
    - **Alur & Integrasi 3 Tombol Aksi Terpadu (Footer Modal Detail):**
      - **1. Tombol `Histori Anggota ↗` (Aksi Analisis Tren Historis):**
        - *Target URL:* `06-My-History-Weekly-Summary.html?user={userSlug}&view=manager_audit`
        - *Parameter Konteks:* Mengirimkan `userSlug` identitas anggota dan mode audit manajerial.
        - *Tindakan di Halaman Tujuan:* Membuka rekam jejak historis komitmen harian anggota selama 1–4 minggu ke belakang. Memungkinkan manajer memeriksa rasio keberhasilan (*delivery ratio*), apakah kendala hari ini merupakan anomali baru atau carry-over kronis, sehingga pimpinan tidak mengambil penilaian performa secara reaktif hanya dari snapshot 1 hari.
      - **2. Tombol `Beri Coaching Note ↗` (Aksi Pembinaan & Apresiasi Terstruktur):**
        - *Target URL:* `10-Manager-Daily-Note-Coaching.html?user={userSlug}&ref_date=today&type=coaching`
        - *Parameter Konteks:* Mengirimkan `userSlug`, tanggal aktif, dan tipe pembinaan (*coaching*).
        - *Tindakan di Halaman Tujuan:* Membuka formulir bimbingan manajerial 1-on-1 yang otomatis terisi (*pre-filled*) dengan konteks kendala anggota hari ini. Manajer merumuskan arahan teknis, komitmen perbaikan, atau apresiasi resmi yang otomatis masuk ke buku log pengembangan performa anggota dan mengirimkan notifikasi langsung.
      - **3. Tombol `Tindak Lanjut Blocker →` (Aksi Intervensi & Eskalasi Hambatan):**
        - *Target URL:* `09-Blocker-Escalation-Queue.html?ticket_id={ticketId}&highlight={ticketId}`
        - *Parameter Konteks:* Mengirimkan ID unik tiket blocker (misal `BLK-20261023-004`).
        - *Tindakan di Halaman Tujuan:* Membuka meja kerja antrean eskalasi blocker di mana pimpinan dapat melakukan intervensi aktif: melakukan *re-assign / ping* pada *Support Owner* yang terlambat merespons (SLA terlampaui), menaikkan eskalasi lintas departemen/manajemen untuk kendala vendor eksternal, atau menandai penyelesaian (*Resolve*) saat hambatan telah tuntas.
      - **Logika Kondisional Kasus Tanpa Blocker (Kecerdasan Sistem):**
        - Jika anggota **tidak memiliki tiket blocker aktif** (seperti kasus *No Submission* karena shift kerja atau tugas offsite pada Farhan, Anita, dan Reza), tombol primer hijau `Tindak Lanjut Blocker →` disembunyikan otomatis oleh sistem agar tidak mengarah ke antrean kosong.
        - Posisinya digantikan oleh tombol **`Kirim Pengingat ↗`** yang memicu pengiriman notifikasi pengingat pengisian laporan komitmen ke anggota bersangkutan secara instan via sistem pesan/push notification.

### 4.4 Section "Ringkasan Status Harian" (Pemisahan 2 Dimensi Independen)
* **Tabel Status Risiko:** Merekap data hanya dari EOD yang telah diserahkan (`GREEN`, `AMBER`, `RED`), ditambah baris khusus `NOT_APPLICABLE — NO_COMMITMENT` bagi anggota yang secara sah tidak memiliki komitmen harian.
* **Tabel Waktu Pengiriman:** Merekap ketepatan waktu pengiriman (`On-Time`, `Late` dalam grace period, dan `No Submission`).

### 4.5 Section "Penanggung Jawab Blocker Aktif" (*Open Blockers by Support Owner*)
* **Tujuan Operasional:** Mengidentifikasi titik sumbatan kerja (*bottleneck*) dengan memetakan personil yang sedang ditunggu bantuannya oleh anggota tim lain, bebas dari budaya saling menyalahkan (*blame culture*).
* **Desain Minimalis Eksekutif (*Calm Dashboard UI*):**
  - **Tata Letak Seimbang:** Menggunakan grid 50% : 50% (`1fr 1fr`), memberikan ruang bernapas lega di kolom kanan.
  - **Bebas Polusi Warna:** Menghapus seluruh garis tepi tebal warna-warni dan tombol aksi berdesakan. Setiap baris berupa kartu putih bersih dengan avatar sage seragam.
  - **Navigasi 1-Klik:** Seluruh baris dapat diklik langsung membuka meja antrean di Halaman 09 (`09-Blocker-Escalation-Queue.html?owner={slug}`).
* **Sumber Data & Pemrosesan Sistem (*Data Pipeline*):**
  - **Tabel Sumber:** Diagregasi dari `blocker_tickets` (status aktif), `users` & `departments` (organisasi), `attendance_leave_records` (deteksi cuti), dan `external_partners` (vendor/mitra).
  - **Penyaringan Reaktif:** Otomatis menghitung ulang saat filter proyek topbar diubah.
  - **Formula Subtitel Baku (Satu Baris Bersih):**
    - *Internal:* `{Jabatan} · Internal` (contoh: *Backend Lead · Internal*)
    - *Lintas Tim:* `{Jabatan} · Lintas Tim` (contoh: *Ops & Infra · Lintas Tim*)
    - *Sedang Cuti:* `{Jabatan} · Sedang Cuti` (contoh: *Mobile Lead · Sedang Cuti*)
    - *Pihak Luar:* `Mitra Eksternal · PIC: {Nama Penghubung}` (contoh: *Mitra Eksternal · PIC: Maya Dwi*)
    - *Belum Ada PIC:* `Menunggu penunjukan PIC oleh pimpinan`
* **5 Aturan Logika Terkunci Sistem (*Locked Business Rules*):**
  1. **Kepemilikan Tunggal (*Single Primary Owner*):** 1 tiket blocker hanya dihitung pada 1 penanggung jawab utama. Menjamin jumlah total blocker di seluruh layar sinkron 100% tanpa risiko duplikasi.
  2. **Perhitungan Jam Kerja Resmi (*Working Hours Only*):** Batas waktu toleransi respon hanya berjalan pada jam kantor resmi (08:30–17:00). Tiket yang masuk mendekati jam pulang otomatis di-pause dan dilanjutkan esok pagi. Karyawan tidak akan pernah berstatus merah di luar jam kerja.
  3. **Peralihan Status Respon Awal (*Initial Response Transition*):** Status `Perlu Respon` (Merah) hanya berlaku jika PIC belum merespon sama sekali. Begitu PIC memberikan respon penanganan pertama (*In Progress*), status otomatis beralih ke `Waktu Aman`.
  4. **Batasan Maksimal 5 Baris (*Max 5 Rows Truncation*):** Menampilkan maksimal 5 penanggung jawab teratas berdasarkan kegentingan. Jika lebih, dimunculkan tautan rapi di footer: `+X Penanggung Jawab Lainnya di Antrean Blocker ↗` untuk menjaga tinggi widget tetap simetris.
  5. **Korelasi Presisi Kartu Metrik 4 (*Metric-4 Parity*):** Tiket berstatus `Perlu Respon` berkorelasi langsung dengan angka pada Kartu Metrik ke-4 (*Blocker Belum Direspon*).
* **Kondisi Tanpa Hambatan (*Positive Empty State*):** Jika hasil saringan menghasilkan 0 kendala, menampilkan ilustrasi centang hijau tenang:  
  `✓ Alur Kerja Bersih & Lancar — Tidak ada hambatan tertahan pada proyek ini.`

### 4.6 Section "Tren Pekerjaan Tertunda" (*Continuation Trend*)
* Menampilkan visualisasi batang 5 hari kerja terakhir (Senin s/d Jumat) mengenai jumlah pekerjaan yang ditandai `Continuation = Continue`.
* Membantu pimpinan mendeteksi pola carry-over yang berulang $\ge 2$ hari berturut-turut sebagai indikasi beban kerja berlebih (*overcapacity*).

### 4.7 Section "Dukungan Lintas Tim/Proyek" (*Cross-Project Support - FR-64*)
* Menampilkan rekaman kontribusi anggota tim yang memberikan bantuan pada proyek atau tim lain di luar penugasan utamanya untuk menumbuhkan budaya kolaboratif.

### 4.8 Section "Ringkasan Mingguan Keandalan Tim" (*Weekly Team Reliability - FR-68*)
* Menyajikan ringkasan keandalan komitmen tim secara agregat (misal: 89% komitmen tuntas, 94% blocker terespons tepat waktu), bebas dari pemeringkatan individu.

### 4.9 Section "Antrean Review dalam Lingkup" (*Reviewer Snapshot*)
* Kotak ringkas yang menghitung pengajuan *Morning/EOD Correction Request* dan *Leave Request* yang sedang menunggu respon atau masuk dalam masa sanggah (*objection window*).

### 4.10 Section Khusus Management Pulse: 6 Widget Resmi CEO (FR-69 & AC-78)
1. **Widget 1 — Ringkasan Pengecualian & Kendala Lintas Divisi (*Company-Wide Exception Overview by Function*):** Matriks kesehatan komparatif 4 divisi utama (Engineering, Commercial & Sales, Operations & Infra, Product & Design) memuat jumlah tim, distribusi risiko (Green/Amber/Red/NA), persentase exception rate, dan tingkat submission rate.
2. **Widget 2 — Tren Risiko RED/AMBER Lintas Fungsi & Proyek Strategis:** Menampilkan trajektori pergerakan risiko 5 hari kerja pada proyek-proyek strategis (Core Payment, Merchant Portal) dan divisi utama dengan indikator arah tren (Meningkat, Stabil, Menurun).
3. **Widget 3 — Akar Masalah Dominan (*Top Recurring Blockers* - 10 Taksonomi Resmi):** Visualisasi persentase distribusi 10 kategori hambatan enum resmi PRD §FR-16 (`Technical & Architecture` 28%, `Requirement & Scope Unclear` 18%, `Client & External` 14%, `Vendor & Cloud` 12%, `Resource & Capacity` 8%, `Infrastructure & Network` 7%, `Approval & Governance` 5%, `Finance & Budget` 4%, `Legal & Compliance` 2%, `Other / Uncategorized` 2%) dengan total tepat 100%.
4. **Widget 4 — Tren Kepatuhan & Kasus Disiplin Berulang (*No-Submission Trend & Repeated Compliance Cases*):** Metrik kepatuhan pengisian perusahaan (94.2%), tren mingguan insiden no-submission, serta daftar kasus **Pattern Flag Aktif (3x No-Sub / 30 Hari)** yang sedang menjalani sesi *Review Event* pembinaan dialogis bersama pimpinan & HRGA sesuai PRD §13 & FR-70.
5. **Widget 5 — Penuaan Eskalasi Belum Selesai (*Unresolved Escalation Aging Snapshot*):** Pemantauan tiket eskalasi aktif yang menua $> 24$ jam (amber) dan $> 48$ jam (merah) lengkap dengan ID tiket, judul blocker, jenjang eskalasi (*Level 2 / Level 3*), divisi asal, support owner saat ini, dan tautan ke antrean eskalasi dewan.
6. **Widget 6 — Insiden Berdampak Klien & Milestone Proyek (*Project-Impact & Client-Impact Incidents*):** Daftar blocker aktif berkepentingan tinggi dengan dampak langsung SLA klien atau target rilis proyek (FR-16 Impact enum & FR-69) lengkap dengan sisa batas toleransi SLA.

---

## 5. SKENARIO PENGGUNAAN & ALUR INTERAKSI UTAMA

### Skenario 1: Supervisor Melakukan Mitigasi Pagi & Sore (UF-30)
1. Supervisor membuka `/team` melalui menu sidebar "Pulse Dashboard".
2. Meninjau 4 kartu metrik di bagian atas: mendapati 1 kasus *RED* dan 2 *Blocker Belum Diakui*.
3. Mengklik baris kendala pada panel *Perlu Perhatian Segera* $\rightarrow$ Modal detail anggota terbuka $\rightarrow$ membaca bahwa anggota terhambat akses database server staging.
4. Mengklik tautan *"Buka Antrean Blocker"* $\rightarrow$ dialihkan ke Halaman 09 untuk segera meng-acknowledge atau me-reassign bantuan ke tim infrastruktur.

### Skenario 2: Kepala Divisi Memantau Tren Carry-Over (UF-31)
1. Head of Department membuka `/function` melalui menu sidebar.
2. Memeriksa panel *Tren Continuation*: melihat lonjakan carry-over pada hari Kamis dan Jumat di area Frontend.
3. Membuka filter proyek untuk mengisolasi tim mana yang mengalami lonjakan carry-over.
4. Menemukan bahwa dependensi API pihak ketiga terlambat diserahkan, sehingga Head dapat menjadwalkan koordinasi teknis penyesuaian jadwal rilis.

### Skenario 3: CEO Memeriksa Kesehatan Organisasi & Mengambil Tindakan Strategis (UF-32)
1. CEO membuka `/management` melalui menu sidebar.
2. Memeriksa matriks Widget 1: Divisi Commercial dan Product hijau stabil (exception rate rendah), Divisi Engineering dan Operations memiliki tingkat exception moderat (~24-28%).
3. Memeriksa Widget 3 (Akar Masalah Dominan): mendapati kategori `Technical & Architecture` (28%) dan `Requirement Unclear` (18%) mendominasi hampir separuh masalah perusahaan.
4. Meninjau Widget 5 (Penuaan Eskalasi) dan Widget 6 (Insiden Klien): melihat 1 eskalasi Level 3 terkait sertifikasi perbankan yang menua 52 jam dengan sisa SLA kurang dari 2 jam. CEO langsung berkoordinasi dengan Direktur Delivery untuk intervensi kebijakan.

---

## 6. KETERKAITAN DATA DENGAN HALAMAN LAIN

| Halaman Asal / Tujuan | Bentuk Keterkaitan Data |
|---|---|
| **Halaman 01 (Login)** | Menentukan rute pendaratan awal: Karyawan ke Hal 02, Supervisor ke Hal 08 (`/team`), Head ke Hal 08 (`/function`), CEO ke Hal 08 (`/management`). |
| **Halaman 02 & 03 (Morning & Additional Work)** | Menyuplai data baseline komitmen harian, initial risk, dan beban kerja tambahan anggota tim. |
| **Halaman 04 (EOD Outcome)** | Menyuplai data Final Status (`GREEN`/`AMBER`/`RED`), hasil outcome, dan alasan risiko sore ke widget *"Perlu Perhatian Segera Hari Ini"*. |
| **Halaman 05 & 09 (Blocker & Escalation)** | Menyuplai data tiket blocker aktif, penghitungan SLA respon, penuaan eskalasi, dan daftar Support Owner. |
| **Halaman 06 (My History & Weekly Summary)** | Menyuplai histori tren `Continuation = Continue` berulang $\ge 2$ hari dan statistik keandalan mingguan. |
| **Halaman 07 (Notification Center)** | Memicu notifikasi in-app kepada pimpinan saat ada status RED atau blocker baru tim. |
| **Halaman 10 (Manager Notes)** | Pimpinan dari Hal 08 dapat menindaklanjuti temuan kendala kritis atau review pattern flag dengan membuat catatan apresiasi (*Recognition*) atau bimbingan (*Coaching*). |
| **Halaman 11 (Compliance HRGA)** | Widget 4 CEO menampilkan kasus *Pattern Flag* 3x No Submission yang terhubung ke antrean pembinaan tim HRGA. |
| **Halaman 12 (Exemption Management)** | Membaca master hari libur dan dispensasi dinas agar karyawan tidak keliru ditandai mangkir di dashboard. |
| **Halaman 13 (Project Risk View)** | Menghubungkan agregat risiko departemen dengan matriks risiko pengiriman portofolio proyek. |
| **Halaman 14 (Escalation Aging)** | Menjadi rujukan analitis pimpinan untuk memantau blocker yang mengalami penuaan waktu (*aging*) melebihi ambang batas toleransi. |
| **Halaman 15 (Admin Mapping)** | Menggunakan struktur hierarki organisasi (*squad/departemen*) dan kepemimpinan inisiatif proyek yang dikonfigurasi admin. |

---

## 7. PANDUAN DESAIN RESPONSIF & KONSISTENSI LINTAS HALAMAN

1. **Tata Letak Desktop ($\ge 1024\text{px}$):**
   * Grid utama 2-kolom asimetris (`1.22fr : 0.78fr`) dengan celah `20px`.
   * 4 kartu metrik kondisi kritis sejajar 4 kolom dalam satu baris horizontal.
2. **Tata Letak Layar Sedang & Tablet ($720\text{px} - 1023\text{px}$):**
   * Grid utama berubah menjadi 1 kolom bertumpuk rapi (*single column stack*).
   * 4 kartu metrik kondisi kritis berubah menjadi 2 kolom x 2 baris.
3. **Tata Letak Smartphone ($\le 680\text{px}$):**
   * Padding luar dibatasi `clamp(14px, 4vw, 20px)` dengan `overflow-x: hidden` terkunci pada kontainer induk.
   * Dropdown filter dan scope switcher dapat digeser horizontal dengan rapi atau bertumpuk vertikal dengan target sentuh $\ge 42\text{px}$.
   * Modal detail anggota memenuhi 94% lebar layar dengan tombol tutup yang mudah dijangkau ibu jari.
4. **Standardisasi Ikonografi:** Seluruh ikon navigasi, status, filter, dan aksi wajib menggunakan SVG monokrom standar WorkPulse dengan ketebalan garis 1.8–2.2. Dilarang menggunakan karakter unicode teks mentah.

---

## 8. MATRIKS BUKTI PEMENUHAN 18 REQUIREMENT RESMI (100% TERBUKTI TEPAT)

Seluruh 18 butir requirement yang relevan dengan Halaman 08 telah diaudit secara forensik dan terbukti patuh 100% berbasis baris kode aktual dan verifikasi runtime browser:

| No | ID Req / Aturan | Klausul Requirement | Bukti Implementasi pada `08-Pulse-Dashboard.html` | Status Audit |
|---|---|---|---|---|
| 1 | **FR-11** | Tomorrow Priority tersimpan sebagai konteks pengingat non-binding | Baris 1658–1664: Elemen `#modalTomorrowPriority` dengan styling hijau lembut `#F0FDF4`. | **100% TERBUKTI TEPAT** |
| 2 | **FR-16** | Taksonomi Blocker lengkap (10 Type resmi PRD) | Baris 1843–1854: Array `taxonomyData` memuat persis 10 kategori enum PRD yang menjumlah total 100%. | **100% TERBUKTI TEPAT** |
| 3 | **FR-21** | Auto-escalation berbasis SLA mengikuti hierarki bawaan 4 jenjang | Baris 1205–1211, 1856–1861, 2217–2231: Chip hitung mundur SLA dan penuaan Level 2, Level 3, Level 4. | **100% TERBUKTI TEPAT** |
| 4 | **FR-29** | Deteksi pola berulang 3x No Submission dalam 30 hari (Pattern Flag) | Baris 1876–1884, 2199–2214: Widget 4 CEO menampilkan 2 kasus Pattern Flag aktif dalam status review. | **100% TERBUKTI TEPAT** |
| 5 | **FR-30** | Tidak ada sanksi atau surat peringatan otomatis dari sistem | Baris 1603–1606: Footer widget menegaskan larangan SP otomatis dan penegakan pembinaan manusiawi §13. | **100% TERBUKTI TEPAT** |
| 6 | **FR-37** | Filter antrean dan dashboard yang sadar izin akses | Baris 2253–2327, 2494–2507: `#projectFilter` menyaring baris kendala dan tabel status 2 dimensi secara reaktif. | **100% TERBUKTI TEPAT** |
| 7 | **FR-39** | Pencatatan tindak lanjut manajerial (Manager Note / Coaching) | Baris 1673–1675: Tombol `#modalCoachingBtn` menautkan langsung ke `10-Manager-Daily-Note-Coaching.html`. | **100% TERBUKTI TEPAT** |
| 8 | **FR-64** | Kontribusi dukungan lintas tim/proyek dicatat sebagai Support Contribution | Baris 1428–1444, 2008–2017: Panel `#crossSupportPanel` menyajikan riwayat bantuan gotong royong anggota tim. | **100% TERBUKTI TEPAT** |
| 9 | **FR-65** | Dashboard menampilkan pola continuation berulang dan support contribution | Baris 1472–1498: Histogram 5 hari `#trendBars` dengan penanda amber tugas berlanjut $\ge 2$ hari. | **100% TERBUKTI TEPAT** |
| 10 | **FR-68 (W1-W6)** | 6 Widget resmi dashboard Head / Supervisor | Baris 1192–1530: Lengkap memuat 6 widget resmi (Status summary, Exceptions first, Blockers by owner, Carry-over trend, Cross-project support, Weekly reliability summary). | **100% TERBUKTI TEPAT** |
| 11 | **FR-69 (W1-W6)** | 6 Widget resmi CEO / Management Dashboard | Baris 1261–1355, 1565–1620, 2045–2251: Lengkap memuat 6 widget agregat perusahaan resmi PRD §FR-69. | **100% TERBUKTI TEPAT** |
| 12 | **FR-70** | Pattern flag No Submission menghasilkan review event pembinaan | Baris 1876–1884, 2199–2214: Widget 4 menyajikan kasus Farhan & Budi dalam tahap *Coaching Review*. | **100% TERBUKTI TEPAT** |
| 13 | **FR-71** | Pencatatan review, pembinaan, tindak lanjut, dan audit trail | Baris 2209: Tautan *"Catat Review ↗"* mengarahkan ke form catatan pembinaan di Halaman 10. | **100% TERBUKTI TEPAT** |
| 14 | **FR-72** | Rujukan formal hanya melalui aktor berwenang; sistem tanpa auto-SP | Baris 1603–1606: Penjelasan tegas aturan produk PRD §13 tercantum pada catatan kaki widget kepatuhan. | **100% TERBUKTI TEPAT** |
| 15 | **FR-73** | Penegakan Matriks Distingsi Kasus (§13.1 PRD) | Baris 1603–1606 & Register Mock: Pembinaan terpisah antara kendala kapasitas, kendala teknis, dan kelalaian. | **100% TERBUKTI TEPAT** |
| 16 | **AC-62** | Hak akses scope dashboard diproteksi RBAC | Baris 1900–1919, 1940–1945: Sesi Employee dialihkan otomatis, peran Supervisor terkunci pada Team Pulse. | **100% TERBUKTI TEPAT** |
| 17 | **AC-63** | Scope switcher kondisional dan membatasi tab | Baris 1920–1939, 2430–2442: Tab terkunci diberi gembok SVG dan klik memicu toast penolakan ramah tanpa bocor. | **100% TERBUKTI TEPAT** |
| 18 | **AC-78** | Monthly Management Trend tanpa leaderboard dan tanpa KPI otomatis | Baris 1261–1355, 1565–1620: Seluruh data disajikan secara agregat organisasi, bebas dari gamifikasi atau skor KPI. | **100% TERBUKTI TEPAT** |
