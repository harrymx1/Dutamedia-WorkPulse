# Penjelasan Halaman 14: Keterlambatan Penanganan Blocker (Escalation Aging)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi antarmuka ideal untuk **Halaman 14: Keterlambatan Penanganan Blocker (`14-Escalation-Aging.html`)** pada sistem **WorkPulse**.

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY (LANGKAH 1)

## 1.1 Maksud & Filosofi Inti Halaman 14

Halaman ini merupakan **radar pengawasan eksekutif (*Executive Escalation Radar*)** yang dirancang khusus bagi **CEO / Direksi**, **General Management**, dan **Kepala Divisi (Head of Department)**.

### Prinsip Utama Sesuai Spesifikasi Produk (PDD §6–§7, PRD §1.2 & §3.5, serta UI/UX Spec §4.14 & UF-32):
1. **Deteksi Hambatan yang Menua Melampaui Batas Toleransi (*Aging Beyond Threshold SLA*):**
   * Di sistem WorkPulse, setiap kendala (*blocker*) yang dilaporkan oleh karyawan memiliki batas toleransi respons dan resolusi (*Service Level Agreement / SLA*).
   * Jika kendala tersebut tidak kunjung direspons (*unacknowledged*) atau tidak selesai dalam jangka waktu tertentu, sistem mencatat durasi keterlambatan tersebut sebagai **keterlambatan penanganan (*escalation aging*)**.
   * Layar ini mengumpulkan dan menyortir seluruh blocker yang tersumbat tersebut agar manajemen puncak mendapatkan visibilitas helikopter atas hambatan struktural yang berpotensi menggagalkan target bisnis atau rilis proyek.
2. **Pengurutan Tegas Berdasarkan Durasi Terlama (*Oldest Unresolved Sorting*):**
   * Sesuai UI/UX Spec §4.14, daftar blocker pada layar ini **wajib diurutkan dari blocker yang paling lama belum terselesaikan (*unresolved age terlama*)** di posisi paling atas. Blocker yang menua berhari-hari menjadi prioritas utama intervensi.
3. **Instrumen Pengawasan Tata Kelola (*Overview & Governance, Not Micro-Action*):**
   * Layar ini **bukanlah antrean tiket operasional harian** (antrean tiket operasional penanganan berada di Halaman 09: *Blocker Escalation Queue*).
   * UI/UX Spec §4.14 menegaskan: jabatan CEO/Direksi **tidak otomatis memberikan hak klik tombol Resolve atau Close langsung di layar ini** jika pimpinan tersebut bukan pihak yang memegang wewenang teknis atas blocker bersangkutan.
   * Intervensi manajemen puncak dilakukan melalui koordinasi strategis tingkat tinggi, relokasi sumber daya lintas divisi, atau arahan langsung kepada pimpinan yang memegang tanggung jawab (*authority owner*).
4. **Transparansi Garis Tanggung Jawab (*Authority Context Clarity*):**
   * Setiap blocker menua wajib memperlihatkan secara jelas siapa pejabat yang saat ini sedang memegang tanggung jawab penanganan (*Current Support Owner*), apa jabatannya, serta dalam konteks apa wewenang tersebut diemban:
     * **`Organizational Authority`**: Wewenang struktural fungsional (misal: Head of Engineering, Lead DevOps, VP Finance).
     * **`Project Authority`**: Wewenang berbasis pengiriman proyek (misal: Project Manager, Technical Delivery Lead).
5. **Visibilitas Rantai Eskalasi Otomatis (*Auto-Escalation Event Trail*):**
   * Jika blocker melewati batas waktu SLA tanpa tindakan, sistem WorkPulse secara otomatis memicu peristiwa eskalasi (*auto-escalation event*) ke jenjang yang lebih tinggi (Level 1 → Level 2 → Level 3 → Level 4).
   * Seluruh riwayat loncatan eskalasi tersebut dicatat secara transparan dan dapat ditelaah kronologinya oleh manajemen eksekutif.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Berdasarkan dokumen spesifikasi PRD §1 (Tabel 1.0) dan UI/UX Spec §2:

| Peran (*Role*) | Contoh Pengguna | Hak Akses Halaman 14 | Keterangan & Batasan Wewenang |
|---|---|---|---|
| **CEO / Direktur Utama** | Rian Suryadi (CEO) | **Akses Penuh Korporat (*Company-Wide*)** | **Aktor Utama.** Memantau seluruh penuaan blocker lintas divisi di seluruh perusahaan untuk pengambilan keputusan strategis dan intervensi dewan. |
| **Head of Department / VP** | Ayu Nirmala (Head of Eng) | **Akses Divisi (*Function Scoped*)** | Memantau penuaan blocker yang berkaitan dengan anggota divisi binaannya atau blocker lintas divisi yang membutuhkan bantuan timnya. |
| **Project Manager (PM)** | Ardi Pratama (PM 1) | **Akses Terbatas (*Project Scoped*)** | Memantau penuaan blocker yang berdampak langsung pada portofolio proyek binaannya. |
| **System Administrator** | Administrator | **Akses Konfigurasi (*Audit Access*)** | Memantau kepatuhan SLA eskalasi dan pengaturan ambang batas waktu (*escalation policy thresholds*). |
| **Staff / Employee Biasa** | Budi Pratama (Staff) | **Akses Ditolak (403 Forbidden)** | **Tidak memiliki akses.** Menu `Escalation Aging` disembunyikan dari sidebar staf. Jika rute dibuka langsung via URL, sistem menampilkan **Layar 403 Akses Dibatasi**. |

---

## 1.3 User Story & Kriteria Penerimaan Resmi (Acceptance Criteria)

### A. User Story Utama (PRD §2 & UI/UX Spec §4.14)
* **US-21 (Sebagai CEO / Manajemen Eksekutif):**  
  *"Sebagai CEO/Management, saya ingin melihat unresolved escalation aging, agar saya tahu mana kendala yang paling lama tersumbat dan membutuhkan intervensi strategis pimpinan."*
* **US-12 (Sebagai Head of Department):**  
  *"Sebagai Head, saya ingin memantau dan mengeskalasi kebutuhan bantuan lintas fungsi yang melampaui SLA, agar blocker anggota tim tidak terjebak di satu level tanpa kejelasan solusi."*
* **UF-32 (Alur Pengawasan Eksekutif Perusahaan):**  
  *"CEO membuka tab Escalation Aging pada `/management/escalations`, melihat daftar blocker belum selesai yang diurutkan dari durasi terlama, meninjau jenjang eskalasi saat ini (Level 1 s/d Level 4) beserta pimpinan yang bertanggung jawab, dan menginisiasi koordinasi percepatan."*

### B. Kriteria Penerimaan Resmi (PRD §5, FR-20, FR-69, AC-52, AC-77, AC-78)
* **FR-20 (Notifikasi & Aturan Keterlambatan Penanganan):**  
  Sistem mengirim notifikasi eskalasi berjenjang berdasarkan tingkat keparahan (*severity*), status, dan durasi penuaan (*aging*) sesuai ambang batas waktu yang dapat dikonfigurasi.
* **FR-69 & AC-78 (Pengawasan Eksekutif Tanpa Hukuman Otomatis):**  
  Layar menyajikan agregat keterlambatan penanganan perusahaan secara objektif untuk penyelesaian hambatan kerja, **dilarang keras menampilkan papan peringkat individu (*leaderboard/ranking*)** atau menjadikan durasi penuaan sebagai skor KPI hukuman otomatis karyawan.
* **AC-52 (Rantai Eskalasi & Pencatatan Transisi):**  
  Blocker yang tidak di-acknowledge atau tidak diselesaikan dalam batas threshold wajib memicu eskalasi ke level berikutnya, dan setiap lompatan eskalasi wajib tercatat rapi dalam riwayat audit (*audit trail*).
* **AC-77 (Pendekatan Exception-First):**  
  Penyajian keterlambatan penanganan wajib mengutamakan anomali paling gawat (*loud exceptions*) di baris teratas.

---

## 1.4 Aturan Bisnis & Siklus Hidup Keterlambatan Penanganan (*Escalation Lifecycle*)

### A. Kriteria Masuk Daftar (*Eligibility Rule*)
Hanya tiket kendala yang memenuhi **dua syarat** berikut yang masuk ke dalam Halaman 14:
1. **Status Tiket Belum Selesai (*Unresolved Status*):**  
   Hanya blocker berstatus **`Open`**, **`Acknowledged`**, atau **`In Progress`**.
   * Blocker berstatus `Resolved`, `Closed`, atau `Accepted Risk` **dikeluarkan otomatis** dari daftar penuaan aktif.
2. **Durasi Melewati Ambang Batas (*Exceeding SLA Threshold*):**  
   Durasi sejak blocker dilaporkan telah melampaui ambang batas waktu respons/penanganan standar (misal: > 24 jam untuk Level 2, > 48 jam untuk Level 3).

### B. Jenjang Rantai Eskalasi Standar WorkPulse (PDD §6 & PRD §1.2)
```
[ Level 1: Initial Support ]
    ├── Direct Lead / Assigned Support Owner
    └── Batas Threshold: 2 – 4 Jam Jam Kerja
           │
           ▼ (Jika Melewati Threshold Tanpa Respons)
[ Level 2: Department Escalation ]
    ├── Head of Department / Technical Lead Terkait
    └── Batas Threshold: 4 – 24 Jam Jam Kerja
           │
           ▼ (Jika Melewati Threshold Tanpa Penyelesaian)
[ Level 3: Cross-Functional Escalation ]
    ├── Principal Engineer / Head of Delivery / Project Authority
    └── Batas Threshold: 24 – 48 Jam Jam Kerja
           │
           ▼ (Jika Dampak Kritis ke Bisnis / Klien)
[ Level 4: Board & Executive Intervention ]
    ├── Direksi / CEO / General Management
    └── Lama Tertahan: > 48 Jam – 72 Jam (Intervensi Strategis)
```

### C. Skala Kategori Keterlambatan (*Aging Alert Tiers*)
1. 🟡 **Tertahan Moderat (24 – 48 Jam):**  
   Tiket telah dieskalasi ke pimpinan departemen (Level 2). Potensi risiko keterlambatan pengiriman sprint/mingguan.
2. 🔴 **Tertahan Kritis (> 48 Jam):**  
   Tiket telah masuk ke radar eksekutif (Level 3/4). Berdampak langsung pada tonggak pencapaian proyek (*project milestone*) atau komitmen rilis ke klien (*client SLA breach*).

---

# BAGIAN 2: PETA IMPLEMENTASI ANTARMUKA IDEAL (LANGKAH 2)

Bagian ini memetakan bagaimana seluruh kebutuhan, alur kerja, dan aturan bisnis Halaman 14 seharusnya diimplementasikan ke dalam antarmuka web modern yang memenuhi **Pedoman Konsistensi WorkPulse (*Calm UI: Muted Baseline, Loud Exceptions*)**.

---

## 2.1 Tata Letak Global & Header Halaman

### A. Bilah Navigasi Samping (*Sidebar Navigation*)
* Tautan menu aktif: **`Escalation Aging`** di bawah kelompok menu **`MANAGEMENT`** dengan indikator aktif beraksen brand toska (`var(--brand)` dan `var(--brand-tint)`).
* Seluruh navigasi sidebar wajib menggunakan tautan berkas prototipe nyata (100% *Anti-Deadlink*).

### B. Header Halaman (*Page Heading & Topbar*)
* **Breadcrumb:** `Manajemen / Keterlambatan Penanganan Blocker`.
* **Judul Halaman (H1):** `Keterlambatan Penanganan Blocker`  
  *(Menggunakan Bahasa Indonesia baku dan terfokus pada status penanganan kendala, menggantikan istilah asing maupun metafora yang tidak lazim).*
* **Deskripsi Subjudul:** `Pantau kendala operasional yang belum tuntas melampaui batas waktu toleransi yang ditetapkan. Daftar diurutkan dari keterlambatan terlama untuk percepatan intervensi pimpinan.`
* **Desain Header Tenang & Terfokus (*Calm UI Header Architecture*):**  
  * **Eliminasi Eyebrow Banner & Badge Redundan:** Judul H1 berdiri kokoh dan bersih tanpa banner berlebihan (*Executive Governance Radar* dengan ikon perisai yang bising) maupun lencana statis cakupan di samping teks judul.
  * **Konteks Hak Akses Dinamis:** Informasi yurisdiksi dan peran pengawasan diletakkan secara terstruktur pada profil akun di *topbar* serta dikontrol secara interaktif melalui *Scope Toggle Pills* (`[● Lingkup Divisi/Proyek Saya] [○ Seluruh Perusahaan]`) tepat di bawah subjudul bagi pimpinan divisi/PM.
* **Tombol Aksi Utama di Header:**  
  * Tombol `Ekspor Rekap Eskalasi (PDF / XLSX)` untuk mengunduh laporan rekapitulasi formal dewan direksi.

---

## 2.2 5 Kartu Ringkasan Metrik Eksekutif (*Click-to-Filter*)

Di bawah judul, disajikan 5 kartu metrik interaktif yang berfungsi sebagai instrumen pemindaian cepat satu-klik (*click-to-filter*):

```
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ SEMUA KENDALA       │ │ KRITIS (>48 JAM)    │ │ PERLU PERHATIAN     │ │ BELUM DITANGANI     │ │ ESKALASI SISTEM     │
│                     │ │                     │ │ (24–48 JAM)         │ │                     │ │                     │
│          5          │ │          2          │ │          2          │ │          2          │ │          3          │
│                     │ │                     │ │                     │ │                     │ │                     │
│ Lewat toleransi ≥4j │ │ Perlu intervensi bos│ │ Tingkat divisi/PM   │ │ Belum ada respons   │ │ Dinaikkan ke jenjang│
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

1. **Kartu 1 (Netral - Semua Kendala):**  
   Menampilkan total seluruh kendala aktif belum selesai yang melewati batas waktu toleransi respons awal ($\ge 4$ Jam).  
   *Cakupan:* Mencakup kendala di tingkat tim pelaksana (<24 jam), divisi/PM (24–48 jam), maupun pimpinan operasional (>48 jam).  
   *Klik:* Menampilkan seluruh daftar aktif tanpa filter kartu metrik.
2. **Kartu 2 (Merah - Kritis > 48 Jam):**  
   Menampilkan jumlah kendala yang tertahan melebihi 48 jam (**Level 3: Pimpinan Operasional**) dan berisiko tinggi menunda rilis/tujuan strategis sehingga memerlukan intervensi langsung pimpinan.  
   *Klik:* Menyaring instan hanya kendala dengan durasi > 48 jam.
3. **Kartu 3 (Amber - Perlu Perhatian 24–48 Jam):**  
   Menampilkan jumlah kendala yang tertahan antara 24 hingga 48 jam (**Level 2: Departemen & Project Manager**) yang memerlukan percepatan di tingkat pimpinan divisi sebelum statusnya meningkat menjadi kritis.  
   *Klik:* Menyaring instan kendala dengan durasi 24–48 jam.
4. **Kartu 4 (Biru - Belum Ditangani / Open):**  
   Menampilkan jumlah kendala yang masih berstatus `Open` (belum ada respons atasan atau belum diakui oleh pihak yang berwenang).  
   *Klik:* Menyaring instan tiket berstatus `Open`.
5. **Kartu 5 (Ungu - Eskalasi Sistem):**  
   Menampilkan jumlah tiket yang telah dinaikkan ke jenjang lebih tinggi secara otomatis oleh sistem akibat melampaui batas waktu toleransi penanganan di level sebelumnya.  
   *Klik:* Menyaring instan tiket yang memiliki riwayat `autoEvents.length > 0`.

---

### Aturan Bisnis & Logika Pemrosesan Data (*Dimensi 2 Compliance*)

1. **Aturan Kelayakan Mutlak (*Defensive Status Guard*):**  
   * Sesuai UI/UX Spec §4.14 dan PRD FR-17, hanya kendala dengan status aktif belum selesai (`Open`, `Acknowledged`, dan `In Progress`) yang diizinkan masuk ke radar penuaan.
   * Tiket berstatus `Resolved`, `Closed`, atau `Accepted Risk` otomatis ditolak oleh penjaga sistem (*defensive guard*) dan tidak diperhitungkan dalam total metrik maupun tabel penuaan.
2. **Algoritma Pengurutan Deterministik Multi-Tier (*Strict Multi-Tier Sorting Rule*):**  
   Untuk mencegah tampilan urutan acak (*layout jitter*) dan menjamin prioritas penanganan krisis yang adil dan objektif, sistem menerapkan 3 lapis pengurutan:
   * **Lapis 1 (Prioritas Utama):** Durasi penuaan terlama (`ageHours` secara *descending*).
   * **Lapis 2 (Tie-Breaker Bobot Risiko):** Jika jam keterlambatan sama, urutkan berdasarkan tingkat keparahan risiko tertinggi:
     $$\text{Critical (4)} > \text{High (3)} > \text{Medium (2)} > \text{Low (1)}$$
   * **Lapis 3 (Tie-Breaker FIFO):** Jika jam keterlambatan dan keparahannya identik, urutkan berdasarkan tiket yang masuk lebih awal (*First In First Out* berdasarkan kode ID tiket terkecil).
3. **Penyelarasan Hierarki Eskalasi 4 Jenjang (*Good Corporate Governance*):**  
   * **Level 1 (Tim Pelaksana / Direct Lead):** Penanganan awal oleh atasan langsung atau lead teknis tim (toleransi pengakuan 1–4 jam kerja).
   * **Level 2 (Departemen & PM):** Penanganan oleh Kepala Departemen atau Project Manager proyek strategis (toleransi 24–48 jam).
   * **Level 3 (Pimpinan Operasional Lintas Divisi):** Penanganan oleh General Management atau Head of Operations untuk hambatan lintas fungsi (>48 jam).
   * **Level 4 (Dewan Direksi):** Intervensi strategis CEO dan Board of Directors jika terjadi kegagalan sistemik tingkat korporat.

---

### Penanganan Kasus Ekstrem & Kondisi Khusus (*Dimensi 3 Compliance*)

1. **Arsitektur Dual Context-Aware Empty State:**  
   Sistem membedakan secara tegas antara dua kondisi ketiadaan data:
   * **Kondisi Nol Blocker Perusahaan (*Zero Aging State* — `eligibleBlockers.length === 0`):**  
     Menampilkan kartu keberhasilan operasional (*green hygiene*) dengan ikon perisai centang hijau lembut, judul *"Semua Kendala Operasional Tertangani Tepat Waktu"*, dan uraian apresiatif. Tombol reset disembunyikan otomatis untuk mengeliminasi klik buntu (*dead clicks*).
   * **Kondisi Saringan Terlalu Ketat (*Filtered Empty State* — `eligibleBlockers.length > 0 && filtered.length === 0`):**  
     Menampilkan kartu pencarian netral dengan judul *"Tidak Ada Blocker yang Sesuai Saringan"*, pesan solutif untuk melonggarkan filter, dan tombol *"Kembalikan Saringan Awal"*.
2. **Ketahanan Tata Letak Terhadap Teks Panjang Ekstrem (*Word-Break & Overflow Containment*):**  
   * Seluruh judul kendala (`.ticket-title`), penugasan proyek (`.context-path`), dan modal dialog (`#mdTitle`, `#mdSummary`) dilengkapi aturan `overflow-wrap: anywhere; word-break: break-word;` serta `min-width: 0;` pada kontainer flexbox.
   * String teknis panjang tanpa spasi (seperti error stack trace, nama method, atau URL endpoint) dijamin tidak akan merusak batas lebar kolom tabel maupun saling bertumpuk dengan badge keparahan.
3. **Proteksi Tombol Ekspor saat Bebas Keterlambatan (*Defensive Export Gatekeeper*):**  
   * Jika tidak ada blocker menua di perusahaan (`eligibleBlockers.length === 0`), tombol *Ekspor Rekap Eskalasi* di header otomatis berstatus nonaktif (*disabled*), dilengkapi tooltip informatif dan penjaga logika untuk mencegah pengunduhan berkas kosong.
   * Pada modal ekspor, opsi *"Hasil Saringan Aktif"* otomatis berstatus *disabled* jika filter aktif menghasilkan 0 tiket.
4. **Pemformatan Durasi Tiket Baru (< 1 Jam):**  
   * Tiket yang baru dilaporkan (< 1 jam) tidak ditampilkan dengan angka kaku "0 Jam", melainkan diformat secara manusiawi menjadi **`< 1 Jam`** dengan subteks **`Baru Dilaporkan (Penanganan Awal Tim)`**.

---

### Hak Akses & Pembatasan Wewenang Tata Kelola (*Dimensi 4 Compliance*)

1. **Enkapsulasi Keamanan Layar 403 (*Strict Security UX Containment*):**  
   * Ketika peran bukan manajemen (seperti `Budi Pratama - Staff Developer`) disimulasikan, kontainer dasbor analitis (`#mainDashboardContent`) disembunyikan sepenuhnya dan digantikan oleh `#forbiddenScreen`.
   * **Sinkronisasi Sidebar Navigasi:** Item menu `#navAging` disembunyikan otomatis dari sidebar staf (`display: none;`), membuktikan kepatuhan terhadap PRD §1 (Tabel 1.0) bahwa menu eskalasi tidak boleh tersedia bagi staf operasional.
   * **Penguncian Tombol Refresh Topbar:** Tombol `#refreshBtn` di topbar dikunci (`disabled`, opasitas redup `0.35`, kursor `not-allowed`) dengan proteksi guard logic untuk mencegah staf memicu penyegaran data analitis pimpinan.
2. **Koreksi Tautan Pemulihan Staf (*Accurate Workspace Fallback*):**  
   * Tombol aksi *"Buka My Today ↗"* pada kartu 403 diarahkan secara tepat ke `01-My-Today.html` (mengoreksi tautan lama yang keliru menuju `02-Morning-Commitment.html`).
3. **Umpan Balik Transisi Peran (*Role Transition Toast Notification*):**  
   * Setiap pergantian peran melalui dropdown `#roleSwitcher` memicu notifikasi toast informatif:
     * Manajemen: `✓ Beralih ke peran: [Nama] ([Jabatan])`
     * Staf: `⚠️ Akses Dibatasi: Halaman ini khusus untuk manajemen eksekutif.`
     * Tombol pemulihan: `✓ Beralih ke peran: Rian Suryadi (CEO / Direktur Utama)`
4. **Kepatuhan Asas Tata Kelola Eksekutif (*Read-Only Governance Radar* — FR-18 & Spec §4.14):**  
   * Sesuai mandat PRD FR-18, layar ini tidak menyediakan tombol aksi operasional sepihak (*Resolve*, *Close*, atau *Reassign*). Wewenang teknis tetap berada pada penanggung jawab operasional (*support owner*), sementara pimpinan fokus pada koordinasi strategis tingkat tinggi.
5. **Penyaringan Lingkup Hibrida (*Hybrid Scoped Radar Architecture* — Opsi 3):**  
   * **Default Scoped:** Saat pimpinan departemen (`Ayu Nirmala - Head of Engineering`) atau manajer proyek (`Ardi Pratama - Project Manager`) masuk, sistem otomatis menyaring kendala sesuai yurisdiksi tanggung jawab mereka (Ayu: 3 blocker divisi engineering; Ardi: 2 blocker portofolio proyek). Kartu metrik dan penghitung hasil menyesuaikan secara dinamis.
   * **Pill Toggle Fleksibel:** Disediakan kontrol pil toggle di bawah judul halaman (`#scopeToggleGroup`):
     * `[● Lingkup Divisi/Proyek Saya (X)]`: Menampilkan fokus pada tanggung jawab langsung.
     * `[○ Seluruh Perusahaan (Y)]`: Membuka wawasan korporat menyeluruh (*Executive Radar*) agar pimpinan dapat meninjau hambatan lintas fungsi yang berpotensi berdampak pada tim mereka.
   * **CEO Radar View:** Untuk peran `Rian Suryadi (CEO / Direktur Utama)`, toggle disembunyikan otomatis karena pimpinan tertinggi selalu mendapatkan visibilitas helikopter menyeluruh atas seluruh blocker korporat.

---

### Desain Visual, Kerapian Layout, & Kepatuhan Calm UI (*Dimensi 5 Compliance*)

1. **Tata Letak Tabel Bebas Overflow Horisontal (*Anti-Overflow Containment*):**  
   * **Pelepasan `white-space: nowrap`:** Subteks durasi penuaan (`.age-sub`) dibebaskan dari pembatasan satu baris kaku dan diberikan `line-height: 1.35; overflow-wrap: anywhere; word-break: break-word;` sehingga membungkus alami (*natural wrap*) saat layar menyempit.
   * **Restrukturisasi Dimensi Kolom:** Lebar minimum tabel diselaraskan menjadi `min-width: 960px` (dari sebelumnya `1050px`), dengan proporsi lebar `<th>` yang terukur:
     * Kendala & Identitas Tiket: `min-width: 260px;`
     * Status Tiket: `width: 150px;`
     * Lama Tertahan: `width: 150px;`
     * Penanggung Jawab & Jalur: `width: 230px;`
     * Eskalasi Sistem: `width: 160px;`
     * Aksi: `width: 90px; text-align: right;`
   * **Visibilitas Kolom Aksi:** Pada resolusi desktop standar (1440px dengan kontainer konten ~1120px), seluruh 6 kolom tabel tertampung 100% tanpa memicu bilah gulir horisontal (*horizontal scrollbar*), dan tombol *"Lihat Detail"* tampak utuh dan proporsional.
2. **Cincin Aktif Berbasis Semantik (*Semantic Active Rings*):**  
   * Menggantikan cincin hijau seragam (`var(--brand)`) dengan aksen semantik yang harmonis pada kartu metrik yang dipilih (*active state*):
      * *Semua Kendala (Netral):* Cincin hijau brand (`var(--brand)`) dengan latar lembut `#F8FAF9`.
      * *Kritis (>48 Jam):* Cincin merah krisis (`var(--red-border)`) dengan pendar halus `rgba(220, 38, 38, 0.25)` dan latar `#FEF7F7`.
      * *Perlu Perhatian (24–48 Jam):* Cincin amber peringatan (`var(--amber-border)`) dengan pendar halus `rgba(217, 119, 6, 0.25)` dan latar `#FFFDF8`.
      * *Belum Ditangani (Open):* Cincin biru informatif (`var(--blue-border)`) dengan pendar halus `rgba(2, 132, 199, 0.25)` dan latar `#F6FBFE`.
      * *Eskalasi Sistem:* Cincin ungu sistemik (`var(--purple-border)`) dengan pendar halus `rgba(147, 51, 234, 0.25)` dan latar `#FAF7FE`.
   * Memenuhi prinsip *Calm UI*: latar belakang tenang sebagai dasar (*muted baseline*), dengan aksentuasi visual tegas hanya pada kartu yang sengaja diaktifkan pimpinan (*loud exceptions*).
3. **Presisi Tipografi Angka Tabular (*Tabular Numbers Typography*):**  
   * Seluruh elemen berbasis angka live-counting (`.metric-value`, `.age-val`, `.scope-pill-count`, `.result-pill`, `.badge-count`) dilengkapi deklarasi `font-variant-numeric: tabular-nums;`.
   * Mencegah pergeseran tata letak mikro (*layout jitter/wiggle*) saat angka berubah akibat penapisan cepat atau peralihan peran.
4. **Tombol Tutup Modal Vektor Pixel-Perfect (*Vector SVG Close Buttons*):**  
   * Menggantikan karakter teks `'×'` pada `#closeDetailModalBtn` dan `#closeExportModalBtn` dengan ikon vektor SVG silang murni berkontur geometris (`viewBox="0 0 24 24"`, `stroke-width="2.2"`, `stroke-linecap="round"`).
   * Menjamin konsistensi visual 1:1 di semua sistem operasi dan resolusi layar (*HiDPI / Retina display*) tanpa kerentanan rendering font glyph.
5. **Keseimbangan Grid Kartu Responsif (*Balanced Responsive Grid*):**  
   * **Tablet (769px–1100px):** Menggunakan pola fluid `repeat(auto-fit, minmax(210px, 1fr))` sehingga 5 kartu terdistribusi proporsional tanpa meninggalkan slot kosong canggung di akhir baris.
   * **Mobile / Tablet Kecil (≤768px):** Mengatur grid 2 kolom dengan kartu ke-5 (*Total Tertahan*) merentang penuh 2 kolom (`grid-column: span 2;`), menyajikan rangkuman eksekutif yang kokoh dan seimbang di bagian dasar grid.

---

### Interaktivitas & Aksesibilitas Penuh (*Dimensi 6 Compliance*)

1. **Penguncian Siklus Fokus Dialog (*Modal Focus Trapping* — WCAG 2.1 SC 2.1.2):**  
   * Diterapkan fungsi deterministik `trapModalFocus(modalEl, e)` pada kedua modal (`#agingDetailModal` dan `#exportAgingModal`).
   * Saat modal aktif dan pengguna menekan tombol `Tab` pada elemen interaktif terakhir di modal, fokus secara otomatis diputar kembali (*looped*) ke elemen interaktif pertama (tombol tutup modal). Sebaliknya, kombinasi `Shift + Tab` pada elemen pertama memutar fokus ke elemen terakhir.
   * Mencegah kebocoran fokus (*keyboard focus escape*) ke elemen di balik layar modal, serta dilengkapi pemulihan fokus otomatis (`activeTriggerEl.focus()`) ke tombol pembuka saat modal ditutup.
2. **Aksesibilitas Kartu Metrik bagi Pengguna Keyboard & Screen Reader (WCAG 2.1 SC 2.1.1 & SC 4.1.2):**  
   * Seluruh 5 kartu metrik (`.metric-card`) kini dilengkapi atribut semantik ARIA tombol toggle: `role="button"`, `tabindex="0"`, dan `aria-pressed="true/false"`.
   * Mendukung penuh aktivasi menggunakan penekanan tombol keyboard `Enter` maupun `Space`.
   * Dilengkapi `aria-label` penjelas yang ramah pembaca layar (misal: *"Filter kendala tertahan kritis lebih dari 48 jam. Level 3 Intervensi Pimpinan"*).
   * Diberikan cincin fokus visual tegas dan tenang (`:focus-visible`) dengan varian warna semantik sesuai kategori kartu saat diakses via tombol Tab keyboard.
3. **Penyiar Status Dinamis Ramah Screen Reader (*Live Region Announcer* — WCAG 2.1 SC 4.1.3):**  
   * Disediakan elemen live announcer tersembunyi visual: `<div class="sr-only" aria-live="polite" aria-atomic="true" id="srStatusAnnouncer"></div>`.
   * Setiap kali saringan teks, filter dropdown, kartu metrik, atau toggle lingkup diubah, elemen ini secara otomatis mengumumkan pesan vokal (misal: *"Menampilkan 2 dari 5 kendala menua. Saringan aktif: Tertahan Kritis (>48 Jam)."* atau *"Tidak ada kendala operasional yang sesuai dengan kriteria saringan aktif."*).
4. **Semantik Struktur Tabel & Label Bantuan Tombol Aksi:**  
   * Seluruh 6 elemen `<th>` tabel dilengkapi atribut `scope="col"` untuk memastikan hierarki tabel terbaca akurat oleh alat bantu aksesibilitas.
   * Header kolom aksi ke-6 dilengkapi `aria-label="Aksi Pemeriksaan Blocker"`.
   * Setiap tombol *"Lihat Detail"* di baris data dilengkapi `aria-label` spesifik: `aria-label="Lihat rincian penuaan kendala BLK-XXX: [Judul Kendala]"` sehingga pengguna screen reader mengetahui tiket mana yang akan dibuka secara presisi.
5. **Navigasi Keyboard Radio Group pada Modal Ekspor:**  
   * Pilihan format laporan (*PDF vs XLSX*) dan cakupan data (*Seluruh Perusahaan vs Hasil Saringan*) kini mengadopsi semantik radio group standar W3C ARIA: `role="radiogroup"`, `aria-labelledby`, `role="radio"`, `tabindex="0"`, dan sinkronisasi dinamis `aria-checked="true/false"`.
   * Pengguna keyboard dapat memilih dan berpindah antar opsi menggunakan tombol panah (`ArrowRight`, `ArrowLeft`, `ArrowDown`, `ArrowUp`) serta tombol `Enter` dan `Space`.

---

## 2.3 Panel Tabel & Bilah Saringan Terpadu 1 Baris Datar (*Unified Filter Bar*)

Panel data kendala diawali dengan header panel yang ringkas dan bilah saringan datar 1 baris (*single-row layout*) tanpa tombol yang melompat ke baris kedua:

* **Judul Panel:** `Daftar Kendala Tertahan`  
  *(Menggantikan judul panjang lama yang berbelit-belit, dipertegas dengan subjudul informatif).*
* **Subjudul:** `Urutan baku: Kendala dengan keterlambatan terlama disajikan di baris paling atas.`
* **Badge Hasil Dinamis:** `Menampilkan X kendala` (atau `Menampilkan X dari Y kendala`).

```
┌─────────────────────────────────┬──────────────────┬──────────────────┬───────────────────┬───────────────────┬──────────┐
│ [🔍 Cari kendala, ID, orang...] │ [Semua Status ▾] │ [Semua Keparahan]│ [Semua Konteks ▾] │ [Eskalasi Sistem ▾│ [↺ Reset]│
└─────────────────────────────────┴──────────────────┴──────────────────┴───────────────────┴───────────────────┴──────────┘
```

1. **Kotak Pencarian Cepat (*Search Box*):**  
   Mencari berdasarkan teks ID tiket (`BLK-219`), judul kendala, nama pelapor, nama penanggung jawab, maupun konteks proyek. Placeholder: `Cari kendala, kode ID, pelapor, atau penanggung jawab...`
2. **Filter Status Kendala:**  
   `Semua Status`, `Baru (Open)`, `Diterima (Acknowledged)`, `Sedang Dikerjakan (In Progress)`.
3. **Filter Tingkat Keparahan (*Severity*):**  
   `Semua Keparahan`, `Kritis (Critical)`, `Tinggi (High)`, `Sedang (Medium)`, `Rendah (Low)`.
4. **Filter Jalur Wewenang (*Authority Context*):**  
   `Semua Jalur`, `Jalur Organisasi`, `Jalur Proyek`.
5. **Filter Eskalasi Sistem:**  
   `Semua Eskalasi Sistem`, `Pernah Dinaikkan Sistem`, `Belum Pernah Dinaikkan`.
6. **Tombol Reset:**  
   Mengembalikan seluruh input pencarian, dropdown saringan, dan kartu metrik ke kondisi netral awal dalam satu klik.

---

## 2.4 Struktur Tabel Keterlambatan Kendala (*Calm UI Table Design*)

Tabel menyajikan data yang bersih, tenang, mudah dibaca, dan bebas dari warna-warni berlebihan. Anomali waktu (*aging*) dan kendala kritis ditonjolkan secara tegas:

| No | Nama Kolom | Lebar Minimal | Komponen & Aturan Penyajian Visual |
|:---:|---|:---:|---|
| **1** | **Kendala & Identitas Tiket** | `260px` | • **Struktur 2 Baris Bersih:**<br>  - *Baris 1:* **Judul Kendala** (Teks tebal `font-weight: 750`, warna teks utama, leluasa membungkus alami tanpa badge terpotong).<br>  - *Baris 2:* **Metadata Datar 1 Baris:** Tag keparahan (`[KRITIS]`, `[TINGGI]`, `[SEDANG]`), ID tiket (`BLK-219`), nama pelapor, dan tanggal dibuat. |
| **2** | **Status Tiket** | `150px` | • **Badge Status Bahasa Indonesia Murni Selaras Dropdown:** `Baru` (merah lembut), `Diterima` (biru lembut), `Sedang Dikerjakan` (amber lembut).<br>• Dilengkapi dot status dan kontras tenang. |
| **3** | **Lama Tertahan (*Durasi Keterlambatan*)** | `150px` | • **Angka Durasi Jam:** Ditulis tebal hitam normal (`var(--text-main)`, font-weight 850, tabular numbers) yang kokoh dan tenang (misal: **`71 Jam`**, **`36 Jam`**, **`17 Jam`**).<br>• **Subteks Ambang Batas Toleransi SLA (1 Baris Bersih & Berwarna Semantik):** Penanda warna semantik diletakkan secara elegan pada subteks: `Lewat batas 48 jam` (merah crimson `#DC2626`), `Lewat batas 24 jam` (golden amber `#D97706`), `Lewat batas 4 jam` (abu-abu netral), atau `Dalam toleransi (≤4 jam)`.<br>• Dilengkapi tooltip header: perhitungan berbasis jam kerja operasional resmi (*Working Hours SLA*). |
| **4** | **Penanggung Jawab & Jalur Penanganan** | `230px` | • **Struktur 3 Baris Bersih:**<br>  - *Baris 1:* **Nama Pejabat** (Teks tebal `font-weight: 750`).<br>  - *Baris 2:* **Jabatan Formal** (`Head of Engineering`, `Platform Security Officer`, dll.).<br>  - *Baris 3:* **Pill Jalur + Lingkup Ringkas:** `[Jalur Organisasi]` `Divisi Engineering` atau `[Jalur Proyek]` `Project Atlas` (selaras 1:1 dengan filter dropdown, rapi 1 baris tanpa wrapping). |
| **5** | **Eskalasi Sistem** | `160px` | • **Tag Frekuensi Eskalasi Sistem:** Tag ungu lembut penanda berapa kali kenaikan wewenang dipicu otomatis oleh sistem, misal `1x Eskalasi Sistem` atau `2x Eskalasi Sistem`.<br>• **Subteks Waktu Eskalasi Terkini:** Menampilkan waktu peristiwa eskalasi terakhir yang paling mutakhir (misal: `12 Okt 2026 · 08:20 WIB`).<br>• **Kondisi Tanpa Eskalasi:** Tanda strip netral tenang (`—`) dilengkapi tooltip informatif *"Belum pernah dieskalasi otomatis oleh sistem (masih dalam penanganan awal)"*.<br>• **Tooltip Header:** Menjelaskan fungsi frekuensi kenaikan jenjang kewenangan yang dipicu otomatis oleh sistem akibat melampaui toleransi SLA. |
| **6** | **Aksi** | `90px` | • Tombol sekunder tenang: **`Lihat Detail`** di sisi kanan untuk membuka investigasi mendalam di modal dialog (100% mematuhi asas *Read-Only Governance* PRD FR-18). |

* **Catatan Kaki Tata Kelola Pemantauan (*Governance Footnote*):**  
  Di bagian paling dasar panel tabel, disajikan catatan penjelas tenang:  
  `ℹ Hanya kendala aktif berstatus Baru, Diterima, dan Sedang Dikerjakan yang dipantau keterlambatannya. Kendala yang telah diselesaikan atau disetujui risikonya otomatis dikeluarkan dari daftar pemantauan ini.`  
  Berfungsi mengelola ekspektasi manajemen agar memahami mengapa tiket yang sudah terselesaikan (`Resolved/Closed`) atau disetujui risikonya (`Accepted Risk`) otomatis tidak tampil di daftar pemantauan ini.

---

## 2.5 Modal Detail Investigasi Keterlambatan Blocker (`#agingDetailModal`)

Ketika tombol `Lihat Detail` diklik, sistem membuka modal terstruktur 5 seksi yang bebas dari bug pemotongan kartu (*anti-squash with smooth vertical scroll*):

```
┌────────────────────────────────────────────────────────────────────────┐
│  Rincian Keterlambatan Penanganan Blocker                       [ BLK-219 ] [X]│
│  Status: Open · Durasi Tertahan: 71 Jam (Melewati SLA)                │
├────────────────────────────────────────────────────────────────────────┤
│  1. IDENTITAS KENDALA & PELAPOR                                        │
│     • Judul Kendala     : Dependency kontrak API pembayaran            │
│     • Tingkat Keparahan : [CRITICAL]                                   │
│     • Pelapor           : Raka Aditya (DevOps Engineer)                │
│     • Waktu Dibuat      : 09 Okt 2026, 09:10 WIB                       │
├────────────────────────────────────────────────────────────────────────┤
│  2. STATUS PENANGANAN & PENANGGUNG JAWAB SAAT INI                      │
│     • Status Tiket      : Open (Belum Di-acknowledge)                 │
│     • Penanggung Jawab  : Ayu Nirmala (Head of Engineering)            │
│     • Konteks Wewenang  : Jalur Organisasi                                 │
│     • Domain Penugasan  : Divisi Engineering                               │
├────────────────────────────────────────────────────────────────────────┤
│  3. ANALISIS PENUAN DAN DAMPAK OPERASIONAL                             │
│     • Lama Tertahan    : 71 Jam (Melewati Threshold 24 Jam & 48 Jam)  │
│     • Tingkat Risiko    : Level 3 (Kritis - Berdampak pada Rilis Klien)│
│     • Uraian Hambatan   : Kontrak API belum tersedia untuk validasi..  │
├────────────────────────────────────────────────────────────────────────┤
│  4. RIWAYAT RANTAI ESKALASI OTOMATIS (TIMELINE AUDIT)                  │
│     • [12 Okt 08:20] Eskalasi Otomatis ke Level 2 (Ayu Nirmala)        │
│       Pemicu: Blocker unacknowledged melebihi batas toleransi 4 jam    │
│     • [09 Okt 09:10] Tiket Dibuat oleh Raka Aditya                     │
├────────────────────────────────────────────────────────────────────────┤
│  5. BATASAN WEWENANG MANAJEMEN (GOVERNANCE NOTE)                       │
│     ℹ Layar ini bersifat analitis murni (read-only). Hak penutupan     │
│       tiket tetap berada pada support owner dan pelapor yang sah.      │
├────────────────────────────────────────────────────────────────────────┤
│                                                        [ Tutup Rincian ]│
└────────────────────────────────────────────────────────────────────────┘
```

### Rincian 4 Seksi Tematik & Catatan Tata Kelola Footer:
1. **Seksi 1 (Identitas Kendala & Pelapor):** Menampilkan judul kendala secara penuh (`word-break: break-word;`), badge tingkat keparahan (`KRITIS`, `TINGGI`, `SEDANG`, `RENDAH`), identitas pelapor beserta jabatannya, tanggal & jam dibuat, serta **`ID Kendala`** (baku dan selaras).
2. **Seksi 2 (Status Penanganan & Penanggung Jawab Saat Ini):** Menyajikan status terkini (`Baru`, `Diterima`, `Sedang Dikerjakan`), **`Penanggung Jawab Saat Ini`**, pil konteks wewenang (`[Jalur Organisasi]` / `[Jalur Proyek]`), dan **`Unit Kerja Penugasan`** (misal: `Divisi Engineering`, `Project Atlas`).
3. **Seksi 3 (Analisis Keterlambatan & Dampak Operasional):** Menampilkan angka durasi keterlambatan dalam warna teks gelap tenang (**`71 Jam (Tertahan Sejak Dibuat)`**) dengan status kepatuhan SLA berwarna semantik (`Melampaui Batas Toleransi 48 Jam`), serta uraian dampak bisnis/teknis.
4. **Seksi 4 (Riwayat Rantai Eskalasi Otomatis / Timeline Audit):** Menampilkan garis waktu kronologi mundur. Node eskalasi paling atas ditandai dengan badge ungu **`Terkini`**. Node pembuatan tiket secara dinamis menyebutkan alokasi awal ke unit kerja terkait (*faktual, bukan asumsi kaku tim pelaksana*). Tiket tanpa eskalasi otomatis (0x) menampilkan narasi tenang bahwa tiket masih dalam penanganan awal.
5. **Catatan Kaki Tata Kelola di Footer Modal (Opsi B):** Alih-alih berupa banner besar yang memakan ruang di dalam tubuh modal, batasan wewenang diletakkan secara elegan sebagai catatan kaki tenang di sisi kiri footer modal berdampingan dengan tombol aksi:  
   `ℹ Rincian ini bersifat informasi. Penyelesaian kendala dilakukan langsung oleh penanggung jawab terkait.`  
   Berfungsi menjawab mengapa pimpinan tidak memiliki tombol penutupan sepihak (*read-only governance*) dengan bahasa yang sopan, manusiawi, dan mudah dipahami.

---

## 2.6 Modal Ekspor Rekapitulasi Eskalasi (`#exportAgingModal`)

Menyediakan sarana unduh dokumen formal untuk rapat dewan pimpinan mingguan:
1. **Pilihan Format Berkas:**  
   * `Ringkasan PDF`: Laporan visual eksekutif siap cetak/presentasi.
   * `Lembar Kerja XLSX`: Format data mentah untuk analisis tabular audit spreadsheet.
2. **Pilihan Cakupan Data Dinamis:**  
   * `Seluruh Blocker Menua Aktif`: Menghitung total seluruh blocker yang melampaui SLA.
   * `Hanya Hasil Saringan Aktif`: Menghitung blocker yang sedang disaring di layar.
   * *Penanganan Aman:* Jika saringan menghasilkan 0 item, opsi otomatis dinonaktifkan (*disabled*) guna mencegah pengunduhan berkas kosong.
3. **Metadata Cap Waktu Audit:** Menampilkan tanggal dan jam resmi penarikan dokumen serta nama pimpinan pemohon laporan.

---

## 2.7 Layar 403 Akses Dibatasi (*RBAC Simulator Screen*)

* **Role yang Ditolak:** `Budi Pratama (Staff Developer)` dan karyawan non-manajemen.
* **Perilaku Sistem:**
  1. Menu `Escalation Aging` otomatis disembunyikan dari sidebar pengguna.
  2. Jika dibuka secara langsung via URL, dashboard disembunyikan dan sistem menampilkan kartu tengah **403 · Akses Dibatasi**.
  3. Memuat tombol pengalihan cepat: `Buka My Today ↗` dan `Beralih ke Akun CEO / PM (Simulasi)`.

---

## 2.8 Pembersihan Bersih dari Kotak Khotbah (*Zero In-App Educational Banners*)

Sesuai pedoman konsistensi desain WorkPulse:
* Seluruh kotak nasihat teoritis (*notice disclaimer banner* dan panel *"Catatan Pembacaan"* yang ada pada kode purwarupa lama) **dihilangkan 100%**.
* Antarmuka bersih murni menyajikan data operasional riil yang profesional, elegan, dan bebas dari polusi teks petunjuk yang menggurui.

---

# BAGIAN 3: EVALUASI KOMPARATIF KONDISI KODE AKTUAL VS PETA IDEAL (LANGKAH 3)

Bagian ini mengevaluasi kondisi kode aktual pada berkas [`14-Escalation-Aging.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/14-Escalation-Aging.html) dan membandingkannya secara komprehensif terhadap peta implementasi ideal yang telah dirumuskan pada Bagian 2.

## 3.1 Ringkasan Temuan Evaluasi Global

Kondisi kode saat ini masih berupa **purwarupa awal yang sangat minimalis (hanya 39 baris padat)** dengan sejumlah kelemahan kritis:
1. **Navigasi Rusak & Penuh Link Mati (*Deadlinks*):** Sidebar hanya memuat 6 item menu, di mana hampir semuanya berupa tautan buntu (`href="#" data-inert`), tidak terhubung ke berkas prototipe riil WorkPulse.
2. **Tidak Ada Simulator Hak Akses (RBAC) & Layar 403:** Avatar profil hanya teks statis `CM` tanpa kemampuan simulasi pergantian peran (*role switcher*). Tidak ada mekanisme penolakan 403 untuk menguji pembatasan peran Staff.
3. **Pelanggaran Kebijakan *Zero In-App Educational Banners*:** Terdapat panel besar *"Catatan pembacaan"* di bagian bawah layar yang menguraikan definisi istilah secara teoritis, memakan ruang visual, dan menggurui pengguna.
4. **Metrik Ringkasan Statis & Redundan:** Kartu metrik hanya berjumlah 4, tidak interaktif (*tidak ada click-to-filter*), dan metrik ke-4 (*Authority context perlu dilihat*) redundan karena nilainya selalu identik dengan total data (5 tiket).
5. **Bilah Saringan Tidak Datar & Tidak Memiliki Filter Keparahan (*Severity*):** Filter terbagi ke dalam panel bertingkat yang memerlukan penekanan tombol manual `"Terapkan"` (`#applyFilters`). Tidak ada opsi filter berdasarkan tingkat keparahan (*Severity*).
6. **Penyajian Tabel Kurang Tegas Memisahkan Anomali Kritis:** Kolom penuaan hanya menampilkan angka jam biasa tanpa perbedaan kontras tajam antara macet kritis (> 48 jam) dan macet moderat (24–48 jam). Indikator keparahan disembunyikan sebagai subteks kecil.
7. **Modal Detail Belum Terstruktur 5 Seksi:** Rincian modal masih menggunakan grid 2 kolom abu-abu sederhana tanpa pemisahan seksi yang logis dan belum menerapkan arsitektur anti-terpotong (*anti-squash*).
8. **Tidak Ada Fitur Ekspor Sama Sekali:** Tombol dan modal ekspor rekapitulasi penuaan (PDF / XLSX) belum tersedia di antarmuka.

---

## 3.2 Matriks Perbandingan Komparatif (Aktual vs Ideal)

Berikut adalah tabel perbandingan mendalam antara implementasi aktual pada kode saat ini dengan spesifikasi implementasi ideal:

| No | Dimensi Antarmuka | Kondisi Aktual (`14-Escalation-Aging.html`) | Implementasi Ideal (Peta Bagian 2) | Status Kesenjangan |
|:---:|---|---|---|:---:|
| **1** | **Desain Sistem & CSS Tokens** | Menggunakan CSS terminifikasi ringkas (baris 5-7). Token warna terbatas, belum mengadopsi standar penuh token WorkPulse (variabel surface, border, brand tint, shadow bertingkat, dan status badges halus). | Menerapkan token CSS lengkap WorkPulse: `--brand`, `--brand-tint`, `--canvas`, `--surface`, `--border`, status badges tenang (*Muted Baseline*), dan teks berbobot kontras tinggi (*Plus Jakarta Sans*). | ❌ **Perlu Standardisasi** |
| **2** | **Navigasi Sidebar** | Hanya 6 item menu dengan tautan buntu (`href="#" data-inert`) dan rute `/management/escalations`. Tidak ada tautan ke berkas HTML lokal lainnya. | Menyajikan struktur 14 halaman prototipe lengkap WorkPulse (Workspace & Management) dengan tautan berkas lokal nyata (`01` s/d `14`). 100% *Anti-Deadlink*. | ❌ **Cacat Kritis** |
| **3** | **RBAC & Profil Pengguna** | Profil statis: Avatar bulat `CM`, nama `CEO / Management`, tanpa dropdown pergantian peran. | Avatar interaktif dengan **RBAC Simulator Switcher** (CEO Rian Suryadi, Head of Eng Ayu Nirmala, PM Ardi Pratama, Staff Budi Pratama). | ❌ **Belum Ada** |
| **4** | **Layar Pembatasan Akses (403)** | Tidak tersedia. Pengguna peran apa pun dapat melihat layar jika membuka berkas. | Tersedia **Layar 403 · Akses Dibatasi** yang otomatis muncul jika peran dialihkan ke Staff (`Budi Pratama`), lengkap dengan tombol pengalihan cepat. | ❌ **Belum Ada** |
| **5** | **Banner / Panel Edukasi** | Memuat panel khusus `<section class="panel">Catatan pembacaan...</section>` (baris 19) dengan poin-poin penjelasan definisi teoritis. | **Pembersihan 100% (*Zero In-App Educational Banners*)**. Seluruh kotak catatan teoritis dihapus total dari layar utama. | ❌ **Melanggar Pedoman** |
| **6** | **Header & Topbar** | Judul berbahasa Inggris `Escalation Aging`, breadcrumb `Management / Escalation Aging`, tanpa lencana lingkup wewenang, tanpa tombol aksi ekspor. | Judul resmi Bahasa Indonesia: **`Keterlambatan Penanganan Blocker`**, breadcrumb `Manajemen / Keterlambatan Penanganan Blocker`, tata letak header bersih Calm UI tanpa badge redundan, dan tombol `Ekspor Rekap Eskalasi (PDF / XLSX)`. | ❌ **Perlu Rekonstruksi** |
| **7** | **Kartu Ringkasan Metrik** | 4 kartu metrik statis: `Unresolved melewati threshold` (5), `Belum di-acknowledge` (2), `Auto-escalation tercatat` (3), dan `Authority context perlu dilihat` (5). Tidak ada interaksi klik. | **5 Kartu Interaktif (*Click-to-Filter*)**: `Semua Kendala` (Netral), `Kritis (>48 Jam)` (Merah), `Perlu Perhatian (24–48 Jam)` (Amber), `Belum Ditangani` (Biru), dan `Eskalasi Sistem` (Ungu). Klik instan menyaring tabel. | ❌ **Perlu Dirombak** |
| **8** | **Bilah Saringan (Filter Bar)** | Berada di dalam panel terpisah dengan tombol manual `#applyFilters`. Tidak ada filter tingkat keparahan (*Severity*). | **Bilah Saringan 1 Baris Datar (*Single-row Unified Filter Bar*)**: Kotak pencarian, Status (Baru, Diterima, Dikerjakan), Keparahan (Kritis s/d Rendah), Konteks Tanggung Jawab (Organisasi vs Proyek), Eskalasi Sistem, dan Tombol Reset. Live-filtering otomatis. | ❌ **Kurang Fitur & Kaku** |
| **9** | **Penyajian Tabel Keterlambatan Blocker** | Kolom: Blocker, Status, Belum terselesaikan, Authority context, Auto-escalation, Detail. Angka jam tidak memiliki penanda level SLA. Keparahan hanya teks kecil. | Tabel 6 kolom *Calm UI*: Angka durasi jam tebal dengan penanda level SLA (Merah untuk >48 jam, Amber untuk 24–48 jam), badge keparahan tebal di samping judul kendala, chip konteks wewenang elegan. | ❌ **Perlu Penyempurnaan Visual** |
| **10** | **Modal Detail Investigasi** | Modal sederhana dengan grid 2 kolom abu-abu dan ringkasan teks. Berisiko terpotong (*squashed*) jika isi timeline panjang. | Modal terstruktur **5 Seksi Tematik** dengan tata letak vertikal anti-terpotong (*anti-squash with smooth scroll*), timeline eskalasi vertikal bergaris tegas, dan catatan tata kelola pimpinan. | ❌ **Perlu Rekonstruksi** |
| **11** | **Modal Ekspor Laporan** | Tidak tersedia sama sekali. | Modal **Ekspor Rekapitulasi Eskalasi** lengkap dengan opsi PDF vs XLSX, pemilihan cakupan data (seluruh vs hasil saringan) dengan proteksi anti-kosong, dan metadata audit. | ❌ **Belum Ada** |

---

## 3.3 Daftar Rinci Defisiensi yang Wajib Dibenahi

Berdasarkan evaluasi di atas, berikut adalah 7 area defisiensi utama yang harus diselesaikan pada pengerjaan kode:

1. **Defisiensi Navigasi & Anti-Deadlink:** Seluruh link navigasi harus diarahkan ke berkas prototipe riil (misal `01-My-Today.html`, `09-Blocker-Escalation-Queue.html`, `13-Project-Risk-View.html`, dll.).
2. **Ketiadaan Pengujian RBAC:** Menghadirkan simulator peran di pojok kiri bawah (CEO, Head of Eng, PM, Staff) dan layar pembatas 403 saat Staff dipilih.
3. **Polusi Visual Banner Nasihat:** Menghapus panel "Catatan pembacaan" agar antarmuka bersih dan murni berorientasi data analitis.
4. **Metrik Pasif & Redundan:** Mengganti metrik redundan ke-4 dengan kartu `Macet Kritis (>48 Jam)` dan `Macet Moderat (24–48 Jam)`, serta melengkapi event listener `click` pada seluruh kartu metrik untuk penyaringan cepat.
5. **Ketiadaan Filter Severity:** Menambahkan dropdown filter *Tingkat Keparahan* (Critical, High, Medium, Low) pada bilah filter.
6. **Hierarki Visual Kolom Durasi & Keparahan:** Menegaskan visual jam keterlambatan (>48 jam warna merah dengan indikasi Level 3, 24–48 jam warna amber dengan indikasi Level 2) dan meletakkan badge keparahan di dekat judul kendala.
7. **Ketiadaan Fitur Ekspor:** Membangun tombol header `Ekspor Rekap Eskalasi (PDF / XLSX)` dan jendela modal `#exportAgingModal` interaktif.

---

# BAGIAN 4: RENCANA AKSI REKONSTRUKSI HALAMAN 14 (LANGKAH 4)

Rencana aksi ini dirancang dalam **9 fase eksekusi bertahap** untuk memastikan Halaman 14 dibangun ulang dengan standar keunggulan visual tertinggi, bebas kutu (*bug-free*), dan patuh pada pedoman konsistensi WorkPulse.

```
┌────────────────────────────────────────────────────────────────────────┐
│             ALUR 9 FASE REKONSTRUKSI KODE HALAMAN 14                  │
├────────────────────────────────────────────────────────────────────────┤
│ Fase 1: Standardisasi CSS Tokens & Desain Sistem Calm UI               │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 2: Rekonstruksi Navigasi Sidebar Anti-Deadlink Lengkap            │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 3: Header Eksekutif Calm UI, Scope Toggle Hibrida, & RBAC Switcher│
│    │                                                                   │
│    ▼                                                                   │
│ Fase 4: 5 Kartu Metrik Eksekutif Interaktif (Click-to-Filter)          │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 5: Bilah Saringan Terpadu 1 Baris Datar (Unified Single-Row)      │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 6: Tabel Keterlambatan Blocker Calm UI dengan Penanda Anomali Kritis   │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 7: Modal Investigasi Detail 5 Seksi Anti-Terpotong (Anti-Squash)  │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 8: Modal Ekspor Rekapitulasi Eskalasi Formal (PDF / XLSX)         │
│    │                                                                   │
│    ▼                                                                   │
│ Fase 9: Layar 403 Akses Dibatasi & Pembersihan Bersih 100% Banner      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4.1 Rincian 9 Fase Eksekusi

### Fase 1: Standardisasi CSS Tokens & Desain Sistem Calm UI
* Menyiapkan palet token CSS lengkap pada `:root` (`--canvas`, `--surface`, `--subtle`, `--muted`, `--border`, `--border-strong`, `--ink`, `--secondary`, `--brand`, `--brand-tint`, `--focus`, status tag colors).
* Memastikan tata letak dasar responsive (`grid-template-columns: 248px minmax(0, 1fr)`).
* Menetapkan tipografi profesional menggunakan Google Font *Plus Jakarta Sans*.

### Fase 2: Rekonstruksi Navigasi Sidebar Anti-Deadlink Lengkap
* Membangun daftar menu sidebar 14 halaman prototipe WorkPulse:
  * Kelompok **Workspace:** My Today (`01`), Daily Plan Editor (`02`), Time Block Tracker (`03`), Standup Board (`04`), EOD Summary (`05`), Overdue Items (`06`), Time Drift Audit (`07`), Commitment Reliability (`08`), Blocker Escalation Queue (`09`), Project & Team Management (`10`), Audit Log Compliance (`11`), Exemption Management (`12`).
  * Kelompok **Management:** Project Risk View (`13`), Escalation Aging (`14-Escalation-Aging.html` dengan status `class="active"`).
* Memastikan tidak ada satu pun tautan mati (`href="#" data-inert`).

### Fase 3: Header Eksekutif Calm UI, Scope Toggle Hibrida, & RBAC Role Simulator
* Mengubah judul halaman menjadi **`Keterlambatan Penanganan Blocker`** dengan subjudul yang jelas dan lugas, bebas dari banner berlebihan (*Executive Governance Radar*) dan bebas dari lencana statis redundan di samping judul.
* Menghadirkan kontrol **Scope Toggle Pills interaktif** (`[● Lingkup Divisi/Proyek Saya]` vs `[○ Seluruh Perusahaan]`) tepat di bawah subjudul bagi pimpinan departemen/PM (Hybrid Approach Opsi 3), sementara peran CEO langsung disajikan radar komprehensif seluruh korporasi.
* Menghadirkan **RBAC Simulator Switcher** di bagian topbar/sidebar dengan opsi 4 peran:
  * Rian Suryadi (CEO / Direksi)
  * Ayu Nirmala (Head of Department)
  * Ardi Pratama (Project Manager)
  * Budi Pratama (Staff Developer - trigger 403)
* Menambahkan tombol utama di header: **`Ekspor Rekap Eskalasi (PDF / XLSX)`**.

### Fase 4: 5 Kartu Metrik Eksekutif Interaktif (*Click-to-Filter*)
* Membangun 5 kartu metrik:
  1. `Semua Kendala` (Netral) -> Menyaring semua tiket.
  2. `Kritis (>48 Jam)` (Merah) -> Menyaring tiket dengan durasi > 48 jam.
  3. `Perlu Perhatian (24–48 Jam)` (Amber) -> Menyaring tiket dengan durasi 24–48 jam.
  4. `Belum Ditangani (Open)` (Biru) -> Menyaring tiket berstatus `Open`.
  5. `Eskalasi Sistem` (Ungu) -> Menyaring tiket yang dinaikkan ke jenjang lebih tinggi.
* Menambahkan indikator visual kartu aktif (garis tepi aksen warna semantik) saat kartu diklik untuk memudahkan pemindaian.

### Fase 5: Bilah Saringan Terpadu 1 Baris Datar (*Unified Single-Row Filter Bar*)
* Memadatkan seluruh input filter ke dalam **1 baris datar sempurna**:
  1. `Kotak Pencarian` (Cari kendala, ID, pelapor, atau penanggung jawab).
  2. `Status Kendala` (Semua Status, Baru, Diterima, Sedang Dikerjakan).
  3. `Tingkat Keparahan` (Semua Keparahan, Kritis, Tinggi, Sedang, Rendah).
  4. `Jalur Wewenang` (Semua Jalur, Jalur Organisasi, Jalur Proyek).
  5. `Eskalasi Sistem` (Semua, Pernah Dinaikkan Sistem, Belum Pernah Dinaikkan).
  6. `Tombol Reset` (Ikon putar / Reset filter).
* Mengintegrasikan *live filtering* otomatis saat input berubah tanpa perlu tombol "Terapkan" manual.

### Fase 6: Tabel Keterlambatan Blocker Calm UI dengan Penanda Anomali Kritis
* Mengimplementasikan tabel 6 kolom:
  1. **Kendala & Identitas Tiket:** Judul kendala tebal, badge keparahan tebal (`CRITICAL`, `HIGH`, dll.), kode ID tiket, pelapor, dan waktu pembuatan.
  2. **Status Tiket:** Badge status tenang (`Open`, `Acknowledged`, `In Progress`).
  3. **Lama Tertahan:** Angka jam tebal hitam normal (**`71 Jam`**, **`36 Jam`**, **`17 Jam`**) disertai subteks ambang batas toleransi SLA 1 baris berwarna semantik (`Lewat batas 48 jam` merah crimson, `Lewat batas 24 jam` golden amber, `Lewat batas 4 jam` netral).
  4. **Penanggung Jawab & Jalur:** Nama pejabat tebal, jabatan resmi, serta pill jalur ringkas (`[Jalur Organisasi]` / `[Jalur Proyek]`) berdampingan rapi dengan nama divisi/proyek.
  5. **Eskalasi Sistem:** Tag frekuensi kenaikan wewenang oleh sistem (`1x Eskalasi Sistem`, `2x Eskalasi Sistem`) beserta waktu peristiwa eskalasi terakhir yang paling mutakhir, atau strip netral (`—`) bertooltip.
  6. **Aksi:** Tombol tenang **`Lihat Detail`**.
* Memastikan daftar selalu terurut dari keterlambatan terlama (*oldest unresolved age*) di posisi teratas.
* Menampilkan state kosong (*empty state*) yang rapi jika pencarian/filter tidak menghasilkan data.

### Fase 7: Modal Investigasi Detail 5 Seksi Anti-Terpotong (*Anti-Squash*)
* Merancang ulang jendela modal `#modalBackdrop` menjadi tata letak 5 seksi tematik:
  * **Seksi 1:** Identitas Kendala & Pelapor (Judul, ID, Badge Keparahan, Pelapor, Waktu Dibuat).
  * **Seksi 2:** Status Penanganan & Penanggung Jawab Saat Ini (Status, Nama Pejabat, Jabatan, Konteks Wewenang).
  * **Seksi 3:** Analisis Keterlambatan & Dampak Operasional (Durasi jam, Pelanggaran threshold SLA, Ringkasan dampak).
  * **Seksi 4:** Riwayat Rantai Eskalasi Otomatis (Garis waktu kronologis / audit trail loncatan jenjang).
  * **Seksi 5:** Batasan Tata Kelola Manajemen (Catatan panduan tata kelola bahwa layar bersifat analitis pimpinan).
* Menggunakan properti `flex-shrink: 0;` dan `overflow-y: auto;` agar konten tidak pernah tergencet atau terpotong pada berbagai resolusi layar.

### Fase 8: Modal Ekspor Rekapitulasi Eskalasi Formal (PDF / XLSX)
* Membangun modal `#exportAgingModal`:
  * Pilihan format: Dokumen PDF Eksekutif vs Spreadsheet XLSX.
  * Pilihan cakupan data: Seluruh Tiket Menua vs Hanya Hasil Saringan Aktif.
  * Validasi cerdas: Menonaktifkan opsi saringan jika hasil saringan kosong (0 item).
  * Metadata laporan: Tanggal, jam penarikan, dan nama pimpinan pemohon.
  * Simulasi pengunduhan dengan umpan balik toast notifikasi elegan.

### Fase 9: Layar 403 Akses Dibatasi & Pembersihan Bersih 100% Banner
* Menghapus panel "Catatan pembacaan" dari layar secara total.
* Membangun komponen `#forbiddenScreen` yang menampilkan kartu 403 saat peran Staff dipilih:
  * Ikon gembok keamanan tenang.
  * Judul: `403 · Akses Terbatas untuk Manajemen Eksekutif`.
  * Penjelasan ramah mengenai kebijakan tata kelola WorkPulse.
  * Tombol aksi: `Kembali ke My Today ↗` dan `Simulasikan Akun CEO (Rian Suryadi)`.

---

## 4.2 Kriteria Keberhasilan Pengerjaan (Definition of Done)

Rekonstruksi kode Halaman 14 dinyatakan selesai dan sempurna jika memenuhi seluruh kriteria berikut:
1. Seluruh 14 tautan sidebar berfungsi tanpa tautan buntu (`#` data-inert).
2. Simulator peran berfungsi lancar, menampilkan lencana lingkup yang tepat, dan menampilkan layar 403 yang elegan saat peran Staff dipilih.
3. Seluruh kotak nasihat teoritis / catatan pembacaan 100% hilang dari layar utama.
4. Kelima kartu ringkasan metrik dapat diklik (*click-to-filter*) dan memperbarui saringan tabel secara instan.
5. Bilah filter tersusun rapi dalam 1 baris datar, memiliki filter tingkat keparahan (*Severity*), dan menyaring secara real-time.
6. Tabel menampilkan blocker terurut dari yang paling lama menua, dengan penekanan visual yang tegas pada durasi >48 jam dan keparahan kritis.
7. Modal detail 5 seksi menyajikan data secara lengkap, rapi, dan bebas dari isu pemotongan konten (*anti-squash*).
8. Modal ekspor berfungsi mulus dengan kalkulasi dinamis dan validasi proteksi data kosong.
9. Tampilan responsif pada resolusi desktop maupun layar sedang/kecil.

---

# BAGIAN 5: KETERKAITAN DATA DENGAN HALAMAN LAIN (CROSS-PAGE CONTRACTS)

Halaman 14 bertindak sebagai radar kendali eksekutif untuk mencegah stagnasi kendala kritis lintas divisi dan proyek:

| Halaman Terkait | Bentuk Keterkaitan & Aliran Data |
|---|---|
| **Halaman 01 (Login)** | Menerima pengalihan peran `CEO` (Rian Suryadi), `Head of Department` (Ayu Nirmala), dan `Project Manager` (Ardi Pratama), serta menerapkan proteksi Layar 403 bagi staf biasa. |
| **Halaman 05 & 09 (Blocker & Escalation)** | Memantau seluruh tiket kendala aktif dari Halaman 05 dan Halaman 09 yang mengalami penuaan waktu (*aging*) melebihi ambang toleransi respons 24 jam / 48 jam. |
| **Halaman 07 (Notifications)** | Memicu notifikasi darurat ke gawai pimpinan tingkat atas saat batas toleransi SLA pengakuan atau resolusi blocker terlampaui. |
| **Halaman 08 (Pulse Dashboard)** | Menyuplai data rekapitulasi keterlambatan penanganan kendala yang ditampilkan pada ringkasan kesehatan operasional pimpinan. |
| **Halaman 10 (Manager Notes)** | Pimpinan dapat langsung menerbitkan catatan bimbingan (*Coaching Record*) kepada pejabat yang terlambat menindaklanjuti kendala bawahannya. |
| **Halaman 13 (Project Risk View)** | Mengidentifikasi kendala-kendala berumur tua (*aging blockers*) yang menjadi penyebab utama terhambatnya pengiriman proyek. |
| **Halaman 15 (Admin Mapping)** | Menggunakan struktur hierarki pelaporan bertingkat (Level 1 s.d. Level 4) dan penugasan proyek resmi untuk menelusuri rantai eskalasi. |

---

# BAGIAN 6: STATUS KESIAPAN & VERIFIKASI AKHIR SISTEM (LANGKAH 5)

Seluruh spesifikasi pada berkas [`14-Escalation-Aging.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/14-Escalation-Aging.html) telah teruji secara visual dan fungsional di lingkungan peramban modern, bebas error, serta siap diintegrasikan penuh ke dalam arsitektur backend:
1. **Radar Keterlambatan Eksekutif Berbasis Durasi Jam:** Menyorot tiket yang tertahan >24 jam (amber) dan >48 jam (crimson).
2. **Penyaringan Reaktif & Click-to-Filter 5 Metrik:** Mengelompokkan status kendala kritis secara real-time.
3. **Modal Investigasi 5 Seksi Terstruktur:** Menampilkan kronologi rantai eskalasi otomatis tanpa pemotongan konten (*anti-squash*).
4. **Modal Ekspor Rekap Formal:** Mendukung unduhan laporan format PDF Eksekutif dan Spreadsheet XLSX.
5. **Proteksi Wewenang RBAC:** Memberlakukan Layar 403 Akses Dibatasi bagi peran staf karyawan.

