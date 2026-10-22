# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 08: PULSE DASHBOARD (TEAM PULSE / FUNCTION PULSE / MANAGEMENT PULSE)

- **Berkas Prototipe:** [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html)
- **Rute Sistem:** 
  - `/team` (Team Pulse — Supervisor / Technical Lead)
  - `/function` (Function Pulse — Head of Department / Function Owner)
  - `/management` (Management Pulse — CEO / Direksi / General Management)
- **Posisi Alur:** Pusat Pemantauan Operasional & Intervensi Cepat Pimpinan (*Operational Command Center & Rapid Intervention Hub*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [01-PDD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/01-PDD.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md) (FR-68, FR-69, BR-08), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md) (§4.8, UF-30, UF-31, UF-32), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Pusat Deteksi Anomali Operasional Cepat (*Rapid Exception Detection*):** Memampukan para pimpinan organisasi memantau kesehatan operasional tim dalam hitungan detik tanpa perlu meminta laporan manual, tanpa rapat harian berkepanjangan, dan tanpa memeriksa ratusan kartu kerja satu per satu.
2. **Pola Desain *Exception-First* (Masalah Utama di Atas):** Menempatkan kondisi berisiko tinggi (*RED*, *Blocker Unacknowledged*, *No Submission*, dan *Carry-over Berulang*) di posisi visual paling atas dan paling mencolok, sehingga tindakan mitigasi dan pembinaan dapat segera diarahkan ke titik masalah.
3. **Penyajian 2 Dimensi Independen (Anti-Bias & Obyektif):** Memisahkan secara tegas antara **Status Risiko Kerja** (`GREEN`, `AMBER`, `RED`, `NOT_APPLICABLE — NO_COMMITMENT`) dengan **Ketepatan Waktu Pengiriman** (`On-Time`, `Late`, `No Submission`). Sistem menegaskan bahwa *No Submission* adalah fakta pengiriman, bukan status risiko otomatis dan bukan vonis pelanggaran disipliner.
4. **Pemberdayaan Dukungan dan Bukan Pengawasan Ketat (*Empowerment over Surveillance*):** Berfungsi sebagai alat bagi pimpinan untuk membantu dan membuka sumbatan kerja (*unblock*) anggota tim, mencatat dukungan lintas tim, serta menyeimbangkan kapasitas tim secara manusiawi.

### 1.2 Batasan Desain Baku & Guardrails Bisnis
- **Anti-Gamifikasi & Dilarang Menampilkan Leaderboard (FR-66, FR-68, FR-69, BR-08):** DILARANG MUTLAK menyajikan papan peringkat (*leaderboard*), perankingan nama karyawan tercepat/terbanyak menyelesaikan tugas, atau skor KPI otomatis.
- **Prinsip Non-Otomatisasi Sanksi (FR-30, FR-72):** Sistem DILARANG memiliki tombol "Terbitkan SP" atau sanksi otomatis. Status merah atau kelalaian pengisian hanya menjadi data faktual untuk pembinaan manusiawi secara langsung (*offline HR process*).
- **Integritas Komitmen Karyawan:** Pimpinan DILARANG mengedit, mengubah, atau menghapus teks komitmen harian bawahan secara sepihak. Koreksi hanya dapat diajukan oleh karyawan melalui alur resmi *Correction Request*.
- **Nol Emoji / Emoticon:** 100% menggunakan SVG monokrom profesional berbasis garis (*line-stroke 1.8–2.2*) yang senada dengan bahasa desain WorkPulse.

---

## 2. HAK AKSES & MATRIKS PERAN PENGGUNA

Halaman ini diakses melalui satu item menu navigasi di sidebar bernama **"Pulse Dashboard"**, namun rute dan cakupan data yang disajikan disaring ketat berdasarkan peran dan wewenang pengguna:

| Peran Pengguna | Tingkat Tampilan (*Scope*) | Cakupan Data yang Berhak Dilihat | Rute Akses |
|---|---|---|---|
| **Supervisor / Technical Lead** | **Team Pulse** | Hanya anggota tim/proyek langsung yang berada di bawah wewenangnya. | `/team` |
| **Head of Department / Function Owner** | **Function Pulse** | Seluruh anggota, sub-tim, dan proyek dalam satu fungsi/divisi (misal: Divisi Engineering). | `/function` |
| **CEO / Direksi / General Management** | **Management Pulse** | Agregat tren operasional tingkat perusahaan secara lintas divisi (*company-wide*). | `/management` |
| **Employee Biasa** | *Tidak Ada Akses* | Menu sidebar disembunyikan. Akses URL langsung dialihkan ke `/today` (Halaman 02). | – |
| **PM / HRGA / System Admin** | *Kewenangan Khusus* | Hanya jika diberikan hak dashboard eksplisit; secara default diarahkan ke ruang kerja masing-masing (Project Risk / Compliance / Org Mapping). | Sesuai delegasi |

### 2.1 Peringatan Keras Arsitektur: Pendekatan Prototipe Multi-Scope vs Implementasi Produksi (Karena X Supaya Y)

> [!WARNING]
> ### PERINGATAN KERAS ARSITEKTUR: PENDEKATAN PROTOTIPE MULTI-SCOPE vs IMPLEMENTASI PRODUKSI
>
> **Mengapa Berkas Mockup `08-Pulse-Dashboard.html` Mengadopsi Pendekatan Tab Switcher 3-in-1 yang Bebas Diklik?**
> * **KARENA (X):** Halaman 08 mencakup 3 rute arsitektural yang berbeda (`/team`, `/function`, `/management`) dengan struktur data yang adaptif terhadap hierarki organisasi (Supervisor, Head of Department, dan CEO/Direksi). Jika rancangan ini dipecah ke dalam 3 berkas HTML terpisah, akan terjadi redundansi kode dan markup sebesar ~85%, fragmentasi evaluasi desain, serta pemborosan waktu dalam memvalidasi konsistensi tata letak visual.
> * **SUPAYA (Y):** Tim pengembang, desainer, dan pemangku kepentingan (*stakeholders*) dapat menguji, mengevaluasi responsivitas tata letak, dan mendemonstrasikan perilaku adaptif ketiga tingkat cakupan manajerial secara instan dalam **satu berkas master terpadu**, tanpa harus repot melakukan siklus *logout-login* berulang kali menggunakan tiga akun kredensial yang berbeda (`siti`, `hendra`, `bambang_ceo`).
>
> ---
>
> ### PANDUAN IMPLEMENTASI KODE PRODUKSI (ANTI-SALAH KAPRAH):
> 1. **Dilarang Menampilkan Tab Secara Bebas pada Pengguna Tunggal (PRD §AC-62):**
>    Pada sistem produksi nyata, seorang **Supervisor biasa (Siti Aminah)** TIDAK PERNAH melihat tab *Function Pulse* apalagi *Management Pulse*. Prinsip *Least-Privilege Access* melarang keras bawahan mengintip data agregat strategis di atasnya.
> 2. **Aturan Rendering Kondisional Frontend (PRD §AC-63):**
>    Komponen `.scope-bar` di frontend (Angular/React/dsb) **WAJIB bersifat kondisional**:
>    - Jika `currentUser.allowedScopes.length <= 1` (mayoritas pimpinan single-role): Bar tab switcher **TIDAK DIRENDER SAMA SEKALI (HIDDEN)**. Sistem langsung menampilkan rute aktifnya (`/team` atau `/function`).
>    - Jika `currentUser.allowedScopes.length > 1` (kasus khusus multi-role, misal Head of Dept merangkap Plt. Team Lead, atau CEO): Sistem **HANYA merender tab-tab yang secara eksplisit diizinkan** dalam array `allowedScopes`.
> 3. **Pemisahan Rute Mandiri (*Protected Route Guards*):**
>    Ketiga cakupan bukan sekadar pergantian *tab state* lokal, melainkan 3 rute mandiri yang dilindungi pengawal rute (*Route Guard*):
>    - /team -> RoleGuard([Role.Supervisor_TL, Role.Head, Role.CEO_Management])
>    - /function -> RoleGuard([Role.Head, Role.CEO_Management])
>    - /management -> RoleGuard([Role.CEO_Management])
> 4. **Otorisasi Server-Side Mutlak (*Zero-Trust Backend*):**
>    Backend (`ScopeFilterService`) **TIDAK PERNAH** mempercayai parameter scope yang dikirimkan oleh frontend. Endpoint query selalu mengekstrak identitas pengguna dari JWT Payload dan menerapkan filter cakupan `getAccessibleUserIds()` secara ketat. Upaya pemanggilan paksa ke level di atas haknya akan langsung ditolak dengan `403 ForbiddenException`.

---

## 3. ANATOMI ANTARMUKA & TATA LETAK WIDGET

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR:                                                                     │
│ [☰ Hamburger Mobile] Breadcrumb: Pulse Dashboard / Team Pulse                │
│ [Lonceng Notifikasi + Dot Indikator Unread]  [Avatar Pengguna & Role Tag]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. PAGE HEADING & CONTEXT BAR:                                              │
│    - Eyebrow: DASHBOARD OPERASIONAL (Bersih tanpa ikon)                     │
│    - Judul H1: Team Pulse (atau Function Pulse / Management Pulse)          │
│    - Subteks: Ringkasan kondisi tim dan hal yang membutuhkan perhatian...   │
│    - Sisi Kanan: [Solid Badge: LINGKUP UNIT / Tim Produk Digital]           │
│    - Banner Wewenang: Informasi cakupan data yang berhak diakses akun aktif │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SCOPE SWITCHER & FILTER BAR:                                             │
│    - Switcher Mode: [ Team Pulse ]  [ Function Pulse ]  [ Management Pulse ]│
│    - Filter Cepat: Dropdown Proyek / Sub-Tim | Dropdown Periode (Hari Ini)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. METRIC SUMMARY STRIP (4 Emergency Cards - Exception-First):              │
│    ┌──────────────────┐ ┌──────────────────┐ ┌───────────────┐ ┌──────────┐ │
│    │ Final Status RED │ │ Blocker Belum Res│ │ No Submission │ │ AMBER    │ │
│    │ 3                │ │ 2 (SLA Alert)    │ │ 4             │ │ 5        │ │
│    │ EOD Kritis       │ │ Perlu tindakan   │ │ Belum check-in│ │ Waspada  │ │
│    └──────────────────┘ └──────────────────┘ └───────────────┘ └──────────┘ │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 4. PERLU PERHATIAN SEGERA            │ 7. OPEN BLOCKERS BY SUPPORT OWNER    │
│    (Exception-First Action List)     │    - Daftar personil penanggung jawab│
│    - Raka Aditya: RED (Backend down) │    - Total blocker aktif per PIC     │
│    - Nadia: Blocker API unresponded  │    - Indikator waktu SLA             │
│    - Aksi: [Lihat Detail Komitmen ↗] │    - Tautan: [Buka Antrean Blocker ↗]│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 5. RINGKASAN STATUS HARIAN           │ 8. TREN CARRY-OVER (CONTINUATION)    │
│    (Tabel 2 Dimensi Independen)      │    - Histogram 5 hari kerja (Sen-Jum)│
│    Tabel 1: Status Risiko            │    - Sorotan tugas Continue >= 2 hari│
│    • GREEN: 18  • AMBER: 5  • RED: 3 │    - Analisis kapasitas beban kerja  │
│    • NOT_APPLICABLE (0 Komitmen): 2  ├──────────────────────────────────────┤
│    Tabel 2: Ketepatan Waktu          │ 9. KONTRIBUSI DUKUNGAN LINTAS TIM    │
│    • On-Time: 21  • Late: 3  • No: 4 │    (Cross-Project Support - FR-64)   │
│    Catatan: No Submission != RED     │    - Catatan apresiasi gotong royong │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 6. RINGKASAN MINGGUAN KEANDALAN TIM  │ 10. ANTREAN REVIEW DALAM LINGKUP     │
│    (Weekly Team Reliability - FR-68) │    (Khusus Supervisor/Head Reviewer) │
│    - Rasio penyelesaian komitmen     │    - Pending Correction Request (2)  │
│    - Rasio penanganan blocker tepat  │    - Pending Leave Request (1)       │
│    - Tampilan tanpa perangkingan     │    - Tautan: [Buka Meja Review ↗]    │
└──────────────────────────────────────┴──────────────────────────────────────┘
* Khusus Mode Management Pulse (CEO): Ditambahkan Widget Top Recurring Blockers (10 Kategori) & Escalation Aging Snapshot.
```

---

## 4. PENJELASAN RINCI SETIAP KOMPONEN / WIDGET

### 4.1 Header, Scope Switcher & Filter Bar
* **Scope Pill & Banner:** Menampilkan secara transparan batasan data yang sedang disajikan kepada pimpinan guna menjamin privasi dan *least privilege access*.
* **Scope Switcher Tabs:** Memfasilitasi pimpinan dengan kewenangan ganda (*multi-role*) untuk beralih perspektif secara cepat (misal dari level operasional tim ke level manajerial divisi).
* **Filter Bar:** Memungkinkan penyaringan cepat berdasarkan nama proyek atau tim spesifik untuk melokalisir sumber anomali.

### 4.2 4 Kartu Metrik Anomali Paling Atas (*The 4 Emergency Cards*)
* **Kartu 1 — Final Status RED:** Menghitung jumlah entri EOD yang menandai risiko berat atau kegagalan pencapaian target hari ini. Menggunakan palet lembut `#FDE9E7` dengan angka merah tegas `#9B2923`.
* **Kartu 2 — Blocker Belum Diakui (*Unacknowledged Blocker*):** Menghitung tiket blocker aktif yang belum disentuh oleh penerima tugas bantuan (*Support Owner*). Ini merupakan indikator kunci terancamnya SLA resolusi.
* **Kartu 3 — No Submission:** Menghitung jumlah anggota tim aktif yang belum melakukan check-in Morning/EOD. Warna kartu netral (`#EFF2F1` / `#46534E`) untuk menegaskan bahwa ini murni fakta pengiriman.
* **Kartu 4 — Final Status AMBER:** Menghitung jumlah entri EOD yang menandai adanya kendala operasional yang masih dapat dimitigasi.

### 4.3 Section "Perlu Perhatian Segera" (*Exception-First Action List*)
* Menyajikan ringkasan nama anggota, jabatan, label anomali, dan ringkasan kendala.
* Mengklik baris akan memunculkan **Modal Detail Anggota Tim** yang menampilkan komitmen lengkap hari ini, alasan risiko, kebutuhan bantuan, serta catatan tindak lanjut tanpa meninggalkan halaman.

### 4.4 Section "Ringkasan Status Harian" (Pemisahan 2 Dimensi Independen)
* **Tabel Status Risiko:** Merekap data hanya dari EOD yang telah diserahkan (`GREEN`, `AMBER`, `RED`), ditambah baris khusus `NOT_APPLICABLE — NO_COMMITMENT` bagi anggota yang secara sah tidak memiliki komitmen harian (misal dalam pelatihan atau standby operasional).
* **Tabel Waktu Pengiriman:** Merekap ketepatan waktu pengiriman (`On-Time`, `Late` dalam grace period, dan `No Submission`).
* **Catatan Edukatif:** Footer panel menegaskan aturan PRD bahwa status risiko dan waktu adalah dua dimensi independen.

### 4.5 Section "Open Blockers by Support Owner" (Distribusi Beban Hambatan)
* Mengelompokkan blocker terbuka berdasarkan personil yang ditunjuk membantu (*Support Owner*).
* Menampilkan avatar, nama, fungsi, total blocker aktif, dan tag peringatan jika ada blocker yang mendekati ambang auto-eskalasi (*SLA warning*).
* Dilengkapi tautan cepat menuju Halaman 09 (*Blocker & Escalation Queue*).

### 4.6 Section "Tren Pekerjaan Tertunda" (*Continuation Trend*)
* Menampilkan visualisasi batang 5 hari kerja terakhir (Senin s/d Jumat) mengenai jumlah pekerjaan yang ditandai `Continuation = Continue`.
* Membantu pimpinan mendeteksi pola carry-over yang berulang $\rightarrow$\ge 2$\rightarrow$ hari berturut-turut sebagai indikasi beban kerja berlebih (*overcapacity*) atau estimasi yang tidak akurat.

### 4.7 Section "Dukungan Lintas Tim/Proyek" (*Cross-Project Support - FR-64*)
* Menampilkan rekaman kontribusi anggota tim yang memberikan bantuan pada proyek atau tim lain di luar penugasan utamanya.
* Menumbuhkan budaya kolaboratif dan apresiasi kerja gotong royong.

### 4.8 Section "Ringkasan Mingguan Keandalan Tim" (*Weekly Team Reliability - FR-68*)
* Menyajikan ringkasan keandalan komitmen tim secara agregat (misal: 88% komitmen selesai sesuai rencana, 92% blocker terespons tepat waktu).
* Format murni statistik agregat tim, bebas dari pemeringkatan individu.

### 4.9 Section "Antrean Review dalam Lingkup" (*Reviewer Snapshot*)
* Kotak ringkas yang menghitung pengajuan *Morning/EOD Correction Request* dan *Leave Request* yang sedang menunggu respon atau masuk dalam masa sanggah (*objection window*).
* Menyediakan jalan pintas (*deep-link*) menuju Halaman 22 (*Correction & Leave Review*). Otomatis disembunyikan pada mode Management Pulse.

### 4.10 Section Khusus Management Pulse (Direksi / CEO - FR-69)
* **Top Recurring Blockers (10 Taksonomi Resmi):** Visualisasi kategori masalah paling sering muncul (Technical, Requirement, Client, Vendor, Resource, Approval, Infra, Finance, Legal, Other).
* **Unresolved Escalation Aging Snapshot:** Pemantauan tiket blocker menua yang belum terselesaikan di jenjang Level 2, 3, atau 4.

---

## 5. SKENARIO PENGGUNAAN & ALUR INTERAKSI UTAMA

### Skenario 1: Supervisor Melakukan Mitigasi Pagi & Sore (UF-30)
1. Supervisor membuka `/team` melalui menu sidebar "Pulse Dashboard".
2. Meninjau 4 kartu metrik di bagian atas: mendapati 1 kasus *RED* dan 2 *Blocker Belum Diakui*.
3. Mengklik baris anomali pada panel *Perlu Perhatian Segera* $\rightarrow$\rightarrow$\rightarrow$ Modal detail anggota terbuka $\rightarrow$\rightarrow$\rightarrow$ membaca bahwa anggota terhambat akses database server klien.
4. Mengklik tautan *"Buka Antrean Blocker"* $\rightarrow$\rightarrow$\rightarrow$ dialihkan ke Halaman 09 untuk segera meng-acknowledge atau me-reassign bantuan ke tim infrastruktur.

### Skenario 2: Kepala Divisi Memantau Tren Carry-Over (UF-31)
1. Head of Department membuka `/function` melalui menu sidebar.
2. Memeriksa panel *Tren Continuation*: melihat lonjakan carry-over pada hari Kamis dan Jumat di area Frontend.
3. Membuka filter proyek untuk mengisolasi tim mana yang mengalami lonjakan carry-over.
4. Menemukan bahwa dependensi API pihak ketiga terlambat diserahkan, sehingga Head dapat menjadwalkan koordinasi teknis penyesuaian jadwal rilis.

### Skenario 3: CEO Memeriksa Kesehatan Organisasi & Eskalasi (UF-32)
1. CEO membuka `/management` melalui menu sidebar.
2. Memeriksa ringkasan anomali lintas fungsi: Divisi Operasi dan Finance hijau stabil, Divisi Delivery memiliki beberapa blocker terkait vendor luar.
3. Memeriksa grafik *Top Recurring Blockers*: kategori `Vendor` dan `Client Approval` mendominasi 60% hambatan.
4. Meninjau *Escalation Aging*: melihat 1 eskalasi Level 3 yang menua $\rightarrow$\ge 48$\rightarrow$ jam yang memerlukan keputusan dewan direksi.

---

## 6. KETERKAITAN DATA DENGAN HALAMAN LAIN

| Halaman Asal / Tujuan | Bentuk Keterkaitan Data |
|---|---|
| **Halaman 01 (Login)** | Menentukan rute pendaratan awal: Karyawan ke Hal 02, Supervisor ke Hal 08 (`/team`), Head ke Hal 08 (`/function`), CEO ke Hal 08 (`/management`). |
| **Halaman 02 & 03 (Morning & Additional Work)** | Menyuplai data baseline komitmen harian, initial risk, dan beban kerja tambahan anggota tim. |
| **Halaman 04 (EOD Outcome)** | Menyuplai data Final Status (`GREEN`/`AMBER`/`RED`), hasil outcome, dan alasan risiko sore. |
| **Halaman 05 & 09 (Blocker & Escalation)** | Menyuplai data tiket blocker aktif, penghitungan SLA respon, dan daftar Support Owner. |
| **Halaman 06 (My History & Weekly Summary)** | Menyuplai histori tren `Continuation = Continue` berulang $\rightarrow$\ge 2$\rightarrow$ hari dan statistik keandalan mingguan. |
| **Halaman 07 (Notification Center)** | Memicu notifikasi in-app kepada pimpinan saat ada status RED atau blocker baru tim. |
| **Halaman 10 (Manager Notes)** | Pimpinan dari Hal 08 dapat menindaklanjuti temuan anomali dengan membuat catatan apresiasi (*Recognition*) atau bimbingan (*Coaching*). |
| **Halaman 22 (Correction & Leave Review)** | Menerima pengalihan dari kotak antrean review Hal 08 untuk pemrosesan persetujuan koreksi atau cuti. |

---

## 7. PANDUAN DESAIN RESPONSIF & KONSISTENSI LINTAS HALAMAN

1. **Tata Letak Desktop ($\rightarrow$\ge 1024\text{px}$\rightarrow$):**
   * Grid utama 2-kolom asimetris (`1.2fr : 0.8fr`) dengan celah `18px`.
   * 4 kartu metrik anomali sejajar 4 kolom dalam satu baris horizontal.
2. **Tata Letak Layar Sedang & Tablet ($\rightarrow$720\text{px} - 1023\text{px}$\rightarrow$):**
   * Grid utama berubah menjadi 1 kolom bertumpuk rapi (*single column stack*).
   * 4 kartu metrik anomali berubah menjadi 2 kolom x 2 baris.
3. **Tata Letak Smartphone ($\rightarrow$\le 680\text{px}$\rightarrow$):**
   * Padding luar dibatasi `clamp(14px, 4vw, 20px)` dengan `overflow-x: hidden` terkunci pada kontainer induk.
   * Dropdown filter dan scope switcher dapat digeser horizontal dengan rapi atau bertumpuk vertikal dengan target sentuh $\rightarrow$\ge 42\text{px}$\rightarrow$.
   * Modal detail anggota memenuhi 94% lebar layar dengan tombol tutup yang mudah dijangkau ibu jari.
4. **Standardisasi Ikonografi:** Seluruh ikon navigasi, status, filter, dan aksi wajib menggunakan SVG monokrom standar WorkPulse dengan ketebalan garis 1.8–2.2. Dilarang menggunakan karakter unicode teks mentah.
