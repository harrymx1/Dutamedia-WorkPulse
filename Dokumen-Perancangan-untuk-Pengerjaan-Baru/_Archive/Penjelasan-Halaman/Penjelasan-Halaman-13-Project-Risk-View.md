# Penjelasan Halaman 13: Pemantauan Risiko Proyek

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi antarmuka ideal untuk **Halaman 13: Pemantauan Risiko Proyek (`13-Project-Risk-View.html`)** pada sistem **WorkPulse**.

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY (LANGKAH 1)

## 1.1 Maksud & Filosofi Inti Halaman 13

Halaman ini merupakan **layar pemantauan risiko pengiriman (*delivery risk monitoring hub*)** yang dirancang khusus bagi **Project Manager (PM)**, **Head of Delivery**, dan **Manajemen Eksekutif (CEO/Direksi)**.

### Prinsip Utama Sesuai Spesifikasi Produk (PDD §4, PRD §3.5, & UI/UX Spec §4.13):
1. **Bersifat Pasif & Derivatif (*Read-Only Aggregation*):**
   * Pada rilis MVP, sistem WorkPulse **secara sengaja tidak memiliki entitas `Project` CRUD formal** (tidak ada tabel master proyek, penetapan alokasi anggaran, atau gantt chart).
   * Seluruh data proyek pada halaman ini ditarik secara **turunan (derivatif)** dari data pengisian harian karyawan, yaitu kolom teks **`Reference / Task Link`** (misal: *"Melon Hidroponik"*, *"Client Portal / API Integration"*, *"Core Payment Engine"*) yang dituliskan saat Morning Check-in atau Additional Work.
   * **Tidak Ada Tombol Mutasi:** PM tidak membuat proyek baru, tidak mengedit komitmen orang lain, dan tidak mengubah status tugas di halaman ini. Layar ini murni instrumen pemantauan (*read-only*).
2. **Menghilangkan Beban Pelaporan Ganda (*Zero Administrative Burden - Goal G4*):**
   * PM tidak perlu meminta laporan manual mingguan via spreadsheet atau memaksa tim operasional mengisi *timesheet* kedua. Visibilitas pengiriman langsung terbentuk dari komitmen harian yang sudah diisi tim dalam 2–3 menit setiap harinya.
3. **Penyajian Berorientasi Sinyal Bahaya (*Exception-First & Risk Signals*):**
   * Halaman ini memprioritaskan penyorotan masalah (*exception*) daripada menampilkan daftar panjang yang monoton. Sistem secara proaktif menyaring dan memperingatkan PM atas 4 sinyal bahaya:
     * **Sinyal 1 — Komitmen Kritis (RED):** Tugas yang dinilai berisiko tinggi gagal atau mengalami blocker teknis darurat.
     * **Sinyal 2 — Komitmen Berisiko (AMBER):** Tugas dengan kendala moderat atau ketergantungan yang berpotensi meleset.
     * **Sinyal 3 — Tugas Tersendat Berulang (*Repeated Continuation*):** Tugas yang ditandai `Continue` berturut-turut pada referensi proyek yang sama, menandakan adanya pekerjaan yang jalan di tempat (*stalled delivery*).
     * **Sinyal 4 — Blocker Proyek Aktif:** Kendala lapangan yang belum terselesaikan oleh penanggung jawab (*Owner Needed*).
4. **Pembedaan Otoritas Proyek vs Struktural (*Authority Context* — FR-19, US-16):**
   * Ketika anggota tim melaporkan kendala/blocker terkait suatu proyek, pelapor dapat menunjuk PM terkait sebagai **Project Authority** untuk membantu menyelesaikan masalah, meskipun PM tersebut bukan atasan langsung (*Direct Manager*) struktural karyawan.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Berdasarkan dokumen spesifikasi PRD §1 (Tabel 1.0) dan UI/UX Spec §2:

| Peran (*Role*) | Contoh Pengguna | Hak Akses Halaman 13 | Keterangan & Tindakan yang Diizinkan |
|---|---|---|---|
| **Project Manager (PM)** | Ardi Pratama (PM 1) | **Akses Penuh (Project Scoped)** | **Aktor Utama.** Memantau seluruh komitmen, status risiko, dan blocker anggota tim lintas divisi yang tercatat dengan referensi proyek dalam wewenangnya. |
| **Head of Delivery / Head of Dept** | Ayu Nirmala / Hendra Gunawan | **Akses Pantau Fungsi (Read-Only)** | Memantau seluruh risiko proyek yang melibatkan anggota divisi binaannya untuk koordinasi kapasitas dan sumber daya lintas tim. |
| **CEO / Manajemen Eksekutif** | Rian Suryadi (CEO) | **Akses Pantau Korporat (Company-Wide)** | Melihat agregasi risiko pengiriman proyek tingkat perusahaan (*cross-project portfolio view*) sebagai dasar keputusan strategis. |
| **Supervisor / Technical Lead** | Ahmad Fauzan | **Akses Bersyarat (Team / Reference)** | Hanya dapat melihat referensi proyek yang melibatkan anggota tim binaannya; fokus utama atasan langsung tetap di *Team Pulse*. |
| **Staff / Employee Biasa** | Budi Pratama | **Akses Ditolak (403 Forbidden)** | **Tidak memiliki akses.** Menu `Project Risk View` disembunyikan dari sidebar staf. Jika rute dibuka langsung, tampil **Layar 403 Akses Dibatasi**. |

---

## 1.3 User Story & Kriteria Penerimaan Resmi (Acceptance Criteria)

### A. User Story Utama (PRD §2)
* **US-15 (Sebagai Project Manager):**  
  *"Sebagai PM, saya ingin melihat risiko proyek yang menjadi tanggung jawab saya lintas anggota tim dari berbagai divisi, agar saya memiliki visibilitas delivery tanpa membebani tim dengan rapat laporan status harian."*
* **US-16 (Sebagai PM — Eskalasi Berbasis Proyek):**  
  *"Sebagai PM, saya ingin menerima notifikasi dan visibilitas atas eskalasi blocker yang berdampak pada proyek saya meskipun saya bukan atasan langsung struktural pelapor, agar keputusan teknis dan alokasi bantuan proyek dapat segera dijalankan."*

### B. Kriteria Penerimaan Resmi (PRD §5, SAD §8.9, UI/UX Spec §4.13)
* **AC-46 (Konteks Otoritas Proyek):**  
  Sistem mampu memisahkan konteks wewenang organisasi (*Direct Manager*) dengan wewenang kontekstual proyek (*Project Authority*). Pada Halaman 13, data dikelompokkan secara visual berdasarkan nilai teks `Reference / Task Link`.
* **AC-P13-01 (Kerapian Agregasi Referensi):**  
  Sistem mengelompokkan komitmen dan pekerjaan tambahan ke dalam kartu kelompok proyek yang bersih, menampilkan jumlah item, status kesehatan proyek, serta indikator sinyal bahaya.
* **AC-P13-02 (Penandaan Sinyal Carry-Over Berulang):**  
  Setiap item dengan status kelanjutan `Continue` yang muncul berulang kali pada kelompok proyek yang sama wajib diberi lencana visual khusus (*Repeated Continue Tag*) sebagai peringatan dini keterlambatan rilis.
* **AC-P13-03 (Ekspor Ringkasan Portofolio):**  
  Menyediakan aksi ekspor ringkasan risiko proyek untuk mendukung bahan rapat koordinasi mingguan (*weekly delivery sync*) tanpa menampilkan data di luar wewenang pengguna.

---

## 1.4 Anatomi Data & Sinyal Risiko di Halaman 13

Setiap entri yang muncul di layar ini memiliki 5 atribut data penting:
1. **Identitas Pekerjaan (*Work Item*):** Jenis entri (`Morning Commitment` atau `Additional Work`), ID unik, dan teks deskripsi pekerjaan yang direncanakan.
2. **Pelaksana (*Owner / Assignee*):** Nama karyawan, jabatan teknis, dan fungsi/divisi asal (misal: *Backend Engineer · Engineering* atau *QA Tester · Quality*).
3. **Status Risiko Harian (*Risk Assessment*):**
   * 🟢 **GREEN**: Pekerjaan berjalan lancar sesuai rencana tanpa hambatan.
   * 🟡 **AMBER**: Ada potensi hambatan atau risiko ketergantungan antar-tim.
   * 🔴 **RED**: Hambatan kritis, kegagalan integrasi, atau insiden yang menghentikan progres.
4. **Hasil Kerja & Kelanjutan (*Outcome & Continuation*):**
   * *Outcome*: `Completed`, `Partially Completed`, `Not Completed`, atau `Cancelled`.
   * *Continuation*: `Continue` (pekerjaan berlanjut ke hari berikutnya) atau `Do Not Continue` (pekerjaan selesai/ditutup).
5. **Konteks Hambatan (*Blocker Context*):** Keterangan kendala, tingkat keparahan (*Severity: Low/Medium/High/Critical*), dan penanggung jawab penyelesaian (*Owner Needed*).

---

# BAGIAN 2: PETA IMPLEMENTASI IDEAL SESUAI PEDOMAN KONSISTENSI (LANGKAH 2)

Agar antarmuka Halaman 13 tampil selaras, profesional, modern, dan setara dengan standar keunggulan Halaman 08–12, berikut adalah susunan peta implementasi yang ideal:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo WorkPulse | Breadcrumb | Simulasi Peran (Optgroup) | Refresh | Lonceng | Profil│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PAGE HEADING:                                                                          │
│ [Judul: Pemantauan Risiko Proyek]               [Cakupan: Proyek Tanggung Jawab Aktif] │
│ [Subjudul: Pantau risiko delivery & blocker...] [⬇ Ekspor Ringkasan (PDF / XLSX)]       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5 SUMMARY METRIC CARDS (Click-to-Filter):                                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────┐ │
│ │ Kelompok Proyek  │ │ Komitmen Kritis  │ │ Risiko Moderat   │ │ Tugas Tersendat     │ │
│ │    4 Proyek      │ │   3 Item RED     │ │   3 Item AMBER   │ │  3 Pola Continue    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FILTER BAR TERPADU:                                                                    │
│ [Cari proyek, tugas, anggota...] [Semua Proyek ▾] [Status Risiko ▾] [Sinyal ▾] [🔄 Reset]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DAFTAR KELOMPOK PROYEK & ANGGOTA (Reference Group Cards):                              │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ⌁ Melon Hidroponik (IoT Sensor Telemetry)             [Tag: 3 Item] [Mode Pantau]  │ │
│ │ Sinyal: [1 Kritis] [1 Moderat] [Continue Berulang] [1 Blocker Aktif]               │ │
│ │ ────────────────────────────────────────────────────────────────────────────────── │ │
│ │ • [Commitment] Validasi API Telemetry Sensor — Budi Santoso (Backend)               │ │
│ │   Risiko: RED | Hasil: Partially Completed | Kelanjutan: Continue (Berulang)      │ │
│ │   Blocker: Validasi payload tertahan (High) -> Aksi: [Lihat Detail]                │ │
│ │                                                                                    │ │
│ │ • [Additional] Regression Test Alur Sensor — Dina Maharani (QA)                     │ │
│ │   Risiko: AMBER | Hasil: Not Completed | Kelanjutan: Continue -> Aksi: [Lihat Detail]│
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ⌁ Client Portal / API Integration                     [Tag: 3 Item] [Mode Pantau]  │ │
│ │ Sinyal: [1 Kritis] [1 Moderat] [1 Blocker Aktif]                                    │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.1 Struktur Tata Letak (Layout) & Navigasi Bilah Samping (*Sidebar*)

1. **Pemisahan Navigasi Standar:**
   * **Workspace:** *My Today*, *My History*, *My Leave*, *Notifications*.
   * **Management:** *Pulse Dashboard*, *Blocker Queue*, *Coaching Notes*, *Compliance Queue*, *Holiday / Exemption*, **Project Risk View (Menu Aktif)**, *Review Queue*, *Reports*.
2. **Keterhubungan Tautan Nyata (100% Anti-Deadlink):**
   * Seluruh menu diarahkan ke berkas prototipe nyata (`08-Pulse-Dashboard.html`, `09-Blocker-Escalation-Queue.html`, `12-Exemption-Management.html`, dll.), bukan tautan buntu tanda pagar (`href="#"`).
3. **Drawer Responsif Seluler:**
   * Bilah samping dapat dibuka-tutup dengan lancar pada layar ponsel/tablet menggunakan tombol menu hamburger dan latar redup (*backdrop overlay*).
4. **Profil Akun Bawah Dinamis:**
   * Menampilkan nama dan peran pengguna aktif (misal: *Ardi Pratama · Project Manager*) yang berubah secara sinkron saat simulator peran beralih.

---

## 2.2 Header Atas (*Topbar*) & Simulator Peran Lintas Hirarki (RBAC)

1. **Jalur Navigasi (*Breadcrumb*):** `Manajemen / Pemantauan Risiko Proyek`.
2. **Dropdown Simulasi Peran (*Role Switcher*) Berkelompok (*Optgroup*):**
   * **Pengelola Proyek & Pengiriman (Akses Utama):**
     * `Ardi Pratama` (Project Manager · Scope Proyek Aktif) $\rightarrow$ *Tampilan pemantauan risiko penuh*.
   * **Pimpinan Fungsi & Eksekutif (Mode Pantau):**
     * `Ayu Nirmala` (Head of Engineering · Pantau Fungsi Teknis) $\rightarrow$ *Melihat seluruh komitmen proyek divisi Engineering*.
     * `Rian Suryadi` (CEO / Direktur · Pantau Korporat) $\rightarrow$ *Melihat seluruh portofolio risiko proyek perusahaan*.
   * **Peran Non-Wewenang (Simulasi 403 Akses Dibatasi):**
     * `Budi Pratama` (Staff Developer) $\rightarrow$ *Menu Project Risk disembunyikan dari sidebar; akses langsung memicu Layar 403 (pengalihan ke My Today)*.
3. **Tombol Penyegaran Data (*Refresh Button*):**
   * Ikon putar dengan animasi $360^\circ$ selama 0,5 detik disertai toast konfirmasi keberhasilan pembaruan data.
4. **Ikon Notifikasi & Avatar Pengguna Terintegrasi.**

---

## 2.3 Area Judul & Informasi Cakupan Wewenang

1. **Judul Utama (H1):** `Pemantauan Risiko Proyek`.
2. **Subjudul:** *"Pantau risiko pengiriman, kendala komitmen, dan blocker lintas fungsi pada seluruh proyek aktif."*
3. **Lencana Cakupan (*Scope Badge*):**
   Terletak di area `.heading-actions` di kanan atas dengan ikon SVG pengguna bersih dan teks cakupan dinamis per peran aktif:
   * *Project Manager (Ardi Pratama):* `Cakupan: Proyek Tanggung Jawab Aktif`
   * *Head of Engineering (Ayu Nirmala):* `Cakupan: Divisi Engineering`
   * *CEO / Direktur (Rian Suryadi):* `Cakupan: Seluruh Perusahaan`
4. **Tombol Tindakan Cepat:**
   * Tombol `Ekspor Ringkasan (PDF / XLSX)`: Menghasilkan unduhan rekap risiko proyek untuk bahan koordinasi mingguan.

---

## 2.4 Kartu Ringkasan Metrik Risiko (5 *Summary Metric Cards - Click-to-Filter*)

Menyajikan metrik penting di bagian atas halaman dengan interaktivitas klik untuk menyaring daftar secara instan:
1. **Kartu 1 (Netral/Slate):** `Kelompok Proyek` — Nilai: `4` · Subteks: `Referensi proyek aktif` (menampilkan total referensi unik dan berfungsi sebagai tombol jangkar reset saringan / tampilkan semua tanpa mengulang angka).
2. **Kartu 2 (Merah/Red):** `Komitmen Kritis` — Nilai: `3` · Subteks: `Perlu mitigasi rilis segera` (pekerjaan dinilai berstatus RED).
3. **Kartu 3 (Amber/Kuning):** `Risiko Moderat` — Nilai: `3` · Subteks: `Potensi kendala & dependensi` (pekerjaan dinilai berstatus AMBER).
4. **Kartu 4 (Ungu/Indigo):** `Tersendat Berulang` — Nilai: `3` · Subteks: `Carry-over ≥ 2 hari berturut-turut` (ambang batas eksak deteksi pekerjaan yang mengalami *stalled delivery*).
5. **Kartu 5 (Biru/Blue):** `Blocker Aktif` — Nilai: `6` · Subteks: `Kendala tim butuh bantuan` (agregasi tiket kendala lapangan yang masih berstatus aktif).

---

## 2.5 Bilah Saringan Terpadu (*Unified Filter Bar*)

Menyediakan pencarian komprehensif tanpa memuat ulang halaman (*real-time reactive filter*):
1. **Input Pencarian Bebas:** Menyaring teks berdasarkan nama proyek, deskripsi komitmen, nama pelaksana, peran, atau keterangan blocker.
2. **Saringan Proyek (*Project Selector*):** Dropdown pilihan referensi proyek spesifik (`Semua Proyek`, `Melon Hidroponik`, `Client Portal`, dll.).
3. **Saringan Status Risiko:** `Semua Status`, `RED`, `AMBER`, `GREEN`.
4. **Saringan Tipe Item:** `Semua Tipe`, `Morning Commitment`, `Additional Work`.
5. **Saringan Sinyal Bahaya:** `Semua Sinyal Bahaya`, `Hanya Berisiko (AMBER / RED)`, `Hanya Continue Berulang`, `Ada Blocker Aktif`, `Blocker Kritis (Critical / High)`, `Hasil Belum Tuntas (Partially / Not Completed)`.
6. **Tombol Reset Saringan:** Mengembalikan seluruh kriteria saringan ke kondisi semula dengan satu klik.

---

## 2.6 Penyajian Berkelompok Kartu Proyek (*Grouped Project Cards & Table*)

Komponen utama penyajian data risiko pengiriman yang dikelompokkan berdasarkan nama referensi proyek (*reference-based project grouping*). Komponen ini dirancang dengan prinsip **Calm UI (*Muted Baseline, Loud Exceptions*)** untuk memastikan antarmuka tetap tenang, rapi, bebas dari kelelahan visual (*visual fatigue*), tanpa emotikon teks mentah, dan memprioritaskan pemindaian cepat (*glanceable scanning*):

### A. Prinsip Desain Antarmuka Tenang (*Calm UI Principles*)
1. **Muted Baseline:** Kondisi normal atau pekerjaan yang berjalan lancar (selesai 100%, tanpa blocker, tidak carry-over) ditampilkan dengan elemen minimalis dan tenang (tipografi abu-abu netral atau tanda strip tenang `—`).
2. **Loud Exceptions:** Warna semantik (merah, amber, ungu) dialokasikan secara ketat dan tajam hanya untuk anomali nyata yang membutuhkan perhatian mendesak Project Manager (komitmen RED, blocker aktif kritis, dan tugas carry-over berulang).
3. **Eliminasi Karnaval Lencana (*Badge Overload Elimination*):** Menghilangkan tumpukan kapsul badge tebal warna-warni yang sebelumnya memenuhi setiap baris tabel. Rincian lengkap dialokasikan ke tombol `Lihat Detail`.
4. **Nol Emotikon Teks Mentah:** Seluruh indikator visual menggunakan ikon SVG resmi beresolusi tajam atau tag teks rapi, melarang penggunaan karakter simbol mentah seperti `⚑`, `⚡`, `🔴`, atau `⚠️`.

---

### B. Kepala Kelompok Proyek (*Group Header*)
Setiap kelompok referensi proyek dibingkai dalam kartu elegan dengan kepala kartu yang memuat:
1. **Nama Referensi Proyek:** Disajikan secara tegas dan bersih dengan tipografi tebal (misal: `Melon Hidroponik (IoT Sensor Telemetry)`) tanpa hiasan ikon denyut atau simbol grafis yang mengalihkan fokus.
2. **Lencana Jumlah Item Aktif:** Tag jumlah tugas yang lolos saringan (misal: `3 Item`). Menghilangkan kode internal teknis (seperti `RG-01`) agar judul kartu tetap bersih dan tidak menimbulkan kebingungan bagi pengguna.
3. **Lencana Sinyal Bahaya Agregat (*Group Hazard Signals*):**
   * `[X Kritis]` — Menghitung jumlah item berstatus RED dalam proyek tersebut (merah).
   * `[Y Moderat]` — Menghitung jumlah item berstatus AMBER (amber).
   * `[Z Continue Berulang]` — Menghitung tugas carry-over $\ge 2$ hari berturut-turut (ungu).
   * `[W Blocker Aktif]` — Menghitung blocker yang belum terselesaikan (biru).
4. **Indikator Proyek Sehat (*Healthy Project State*):**
   * Jika sebuah proyek tidak memiliki anomali sama sekali (0 Kritis, 0 Moderat, 0 Continue Berulang, 0 Blocker), seluruh lencana bahaya digantikan oleh satu lencana hijau tenang: **`Semua Komitmen Lancar`**.
5. **Kebersihan Tampilan:** Menghilangkan duplikasi lencana `Mode Pantau` dari setiap kepala kartu kelompok proyek, karena penanda status pasif sudah diwakili oleh lencana `Mode Pantau` pada *Result Indicator Bar*.

---

### C. Arsitektur 6 Kolom Tabel Komitmen yang Ditenangkan (*Calm Table Architecture*)
Di dalam setiap kartu proyek, komitmen disajikan dalam tabel bergaris tipis dengan 6 kolom terstruktur:

| No | Kolom Tabel | Format Tampilan & Tipografi | Penanganan Kondisi Tenang (*Calm UI*) | Penanganan Kondisi Anomali (*Exception*) |
|---|---|---|---|---|
| **1** | **Komitmen & Pekerjaan** | Judul tugas tebal (`font-weight: 700`, warna `#0F172A`) + subteks tipografi abu-abu netral di bawahnya. | Teks bersih tanpa kapsul badge tebal. Subteks jenis item: `Morning Commitment` atau `Additional Work` (kode ID item dialokasikan ke Modal Detail agar tabel bebas beban visual). | Tetap rapi dengan pembatasan lebar teks maksimum (*max-width*) agar tidak merusak tata letak. |
| **2** | **Pelaksana & Divisi** | Nama pelaksana (`font-weight: 700`) + subteks peran & divisi (`${role} · ${division}`). | Nama divisi ditulis abu-abu netral (`#64748B`), mengeliminasi teks hijau mencolok yang sebelumnya bertabrakan dengan status GREEN. | Menampilkan unit kerja/squad spesifik tanpa warna latar mencolok. |
| **3** | **Status Risiko & Hasil** | Indikator titik status semantik (*Dot Indicator*) + subteks hasil sore (*Outcome*). | Status GREEN: Dot hijau muda tenang + teks `● GREEN`, subteks: `Completed (100%)`. | Status RED / AMBER: Dot merah/oranye dengan bayangan halus semantik (`● RED`, `● AMBER`), subteks: `Partially Completed (xx%)` atau `Not Completed (0%)`. Derajat risiko mencerminkan ancaman rilis/keparahan blocker, sedangkan subteks mencatat persentase progres fisik secara eksak. |
| **4** | **Kelanjutan (*Continuation*)** | Penanda status penerusan komitmen ke esok hari. | Jika tugas tidak dilanjutkan (`Do Not Continue`), cukup ditampilkan tanda strip tenang (**`—`**), mengeliminasi badge abu-abu tebal. | Jika carry-over hari pertama: Tag oranye ramping **`Continue`**. Jika carry-over berulang ($\ge 2$ hari): Cukup satu tag ungu terpadu tunggal **`Continue (3x)`** tanpa menumpuk dua tag terpisah, menjaga tinggi baris tetap rata dan seragam. |
| **5** | **Blocker & Bantuan** | Ringkasan kendala lapangan dan kebutuhan eskalasi lintas fungsi. | Jika tidak ada kendala lapangan (`blocker === null`), cukup ditampilkan tanda strip tenang (**`—`**). | Judul blocker menggunakan teks warna standar diawali tag keparahan ringkas (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), diikuti subteks `Bantuan: ${ownerNeeded}`. Tanpa latar merah mencolok. |
| **6** | **Aksi** | Tombol minimalis `Lihat Detail`. | Tombol berlatar putih bersih dengan garis tepi tipis halus (`border: 1px solid var(--border-strong)`). | Menjadi gerbang utama untuk melihat seluruh informasi rinci, riwayat, dan hubungan wewenang pada modal pop-up. |

---

## 2.7 Modal Detail Risiko Komitmen (*Risk Detail Modal*)

Ketika tombol `Detail` diklik, muncul modal interaktif yang menyajikan data operasional lengkap:
1. **Rincian Pekerjaan:** Judul komitmen, jenis item, dan nama referensi proyek.
2. **Identitas Pelaksana:** Nama karyawan, peran, squad, dan atasan langsung.
3. **Evaluasi Akuntabilitas:** Nilai komitmen pagi, risiko awal, hasil sore hari, dan alasan kendala tingkat-hari.
4. **Penanganan Blocker & Authority Context:** Menjelaskan apakah kendala ditangani atasan langsung struktural atau didelegasikan kepada Project Authority.
5. **Jejak Audit & Histori Kelanjutan:** Rekam waktu submit dan riwayat keberlanjutan tugas.

---

## 2.8 Proteksi Akses & Layar 403 (*RBAC Protection Screen*)

1. **Dinamika Bilah Samping (*Sidebar*):**
   * Bagi akun staf (*Budi Pratama*), menu `Project Risk View` disembunyikan secara visual.
2. **Layar 403 Akses Dibatasi:**
   * Jika rute URL dibuka langsung oleh peran staf, panel pemantauan disembunyikan dan muncul layar 403 resmi:
     * Judul: `403 · Akses Dibatasi (Staff Developer)`.
     * Penjelasan Kontekstual: Menginformasikan bahwa modul ini khusus untuk fungsi koordinasi proyek (PM, Head, Manajemen) dan mengarahkan staf kembali ke menu kerja harian.
     * Tombol Aksi Cepat: `Buka My Today ↗` dan `Beralih ke Akun PM (Simulasi)`.

---

## 2.9 Antarmuka Bersih & Bebas Kotak Nasihat (*Zero In-App Educational Banners*)

Sesuai aturan baku perancangan antarmuka WorkPulse yang telah disepakati:
1. **Tidak Ada Banner Nasihat / Kotak Khotbah di Layar:** Elemen teks disclaimer panjang seperti *"Prinsip Batas Prosedur"* atau instruksi tata cara teoritis ditiadakan dari tampilan.
2. **Panduan Dialokasikan ke Buku Panduan Terpisah:** Seluruh tata cara penggunaan dan pedoman kerja disajikan dalam *User Manual / Guide* resmi pasca-pengembangan sistem, sehingga antarmuka tetap bersih, rapi, dan murni fokus pada efisiensi kerja pengguna.

---

# BAGIAN 3: EVALUASI KONDISI KODE EKSISTING HALAMAN 13 (LANGKAH 3)

Berdasarkan audit teknis mendalam terhadap berkas eksisting [`13-Project-Risk-View.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/13-Project-Risk-View.html) (yang saat ini hanya berukuran 104 baris kode terkompresi tanpa mengikuti standar desain WorkPulse terbaru), ditemukan kesenjangan (*gaps*) signifikan jika dibandingkan dengan susunan peta implementasi ideal pada Bagian 2:

| No | Aspek Komponen | Kondisi Kode Eksisting Halaman 13 Saat Ini | Susunan Peta Implementasi Ideal yang Seharusnya | Tingkat Kesenjangan & Dampak |
|---|---|---|---|---|
| **1** | **Arsitektur Kode & Desain Sistem** | Terdiri dari 104 baris kode kasar dengan JavaScript terkompresi menggunakan variabel satu huruf (`q`, `g`, `i`, `its`, `$`, `esc`). Skrip sulit dibaca dan dirawat. Desain CSS ad-hoc belum mengadopsi token sistem WorkPulse yang seragam dengan Halaman 08–12. | Mengadopsi arsitektur CSS modern berbasis token (`--brand: #00674D`, `--canvas: #F8FAFC`, radius, bayangan halus, tipografi Plus Jakarta Sans), serta JavaScript yang modular, rapi, dan terstruktur. | **Kritis (Tampilan Usang & Kode Sulit Dikelola)** |
| **2** | **Navigasi Sidebar & Tautan Menu** | Seluruh tautan menu menggunakan **tautan buntu tanda pagar (`href="#my-today"`, `href="#pulse"`, `href="#blockers"`)**. Pengguna terkunci dan tidak bisa berpindah halaman. Profil di sudut bawah di-hardcode kaku ke "Ardi Pratama". | Tautan aktif 100% terhubung ke berkas prototipe nyata (`01-My-Today-Submission.html`, `08-Pulse-Dashboard.html`, `09-Blocker-Escalation-Queue.html`, dll.). Profil dinamis sesuai sesi pengguna aktif. | **Kritis (Tautan Buntu / 100% Deadlinks)** |
| **3** | **Simulator Peran (Role Switcher RBAC)** | **Tidak ada simulator peran.** Topbar hanya memuat tombol dummy `♧` dan teks tombol `PM`. Pengguna tidak dapat menguji tampilan untuk peran lain (PM vs Head vs CEO vs Staf). | Memiliki dropdown simulator peran terpadu (`#quickRoleSwitcher`) di topbar terkelompok dalam *optgroup*, tombol penyegaran (*refresh*) beranimasi putar $360^\circ$, dan toast konfirmasi. | **Tinggi (Tidak Dapat Diuji Lintas Peran)** |
| **4** | **Area Header & Tombol Ekspor (UF-36)** | Elemen `.heading-actions` dibiarkan kosong melompong. Tidak ada lencana cakupan wewenang dan **tidak ada tombol ekspor ringkasan portofolio**, padahal diwajibkan oleh spesifikasi UF-36 & AC-P13-03. | Header memuat lencana cakupan (*Solid Scope Badge*) dan tombol aksi `Ekspor Ringkasan (PDF / XLSX)` yang memicu notifikasi unduhan rekap risiko pengiriman proyek. | **Tinggi (Kehilangan Fitur Ekspor Spesifikasi)** |
| **5** | **Kartu Ringkasan Metrik (Summary Cards)** | Hanya memiliki 4 kartu statis (*Reference groups shown*, *RED items*, *AMBER items*, *Repeated Continue pattern*). Kartu bersifat pasif (tidak bisa diklik untuk menyaring) dan tidak menampilkan metrik penting *Blocker Terkait Aktif*. | Memiliki **5 Kartu Ringkasan Interaktif (Click-to-Filter)** dengan penambahan metrik blocker aktif. Mengklik kartu langsung menyaring data secara reaktif disertai penanda batas aktif (*active border*). | **Tinggi (Kehilangan Interaktivitas & Sinyal Kunci)** |
| **6** | **Bilah Saringan (Filter Bar)** | Hanya menyediakan pencarian bebas dan 3 dropdown sederhana (Risk, Jenis, Sinyal). **Tidak ada pemilih referensi proyek spesifik** (misal: hanya ingin melihat proyek *Melon Hidroponik*). Memuat teks disclaimer panjang di bawah input. | Menyediakan bilah saringan terpadu lengkap: Pencarian bebas, Dropdown Pemilih Proyek Spesifik, Status Risiko, Jenis Item, dan Sinyal Bahaya, serta tombol Reset Saringan satu-klik tanpa polusi teks nasihat. | **Sedang (Fleksibilitas Penyaringan Terbatas)** |
| **7** | **Penyajian Data Kelompok Proyek** | Baris data hanya disajikan sebagai blok teks biasa dalam grid 3 kolom sempit. Informasi divisi/departemen tidak ada. Blocker hanya ditulis sebagai teks detail kecil. Tidak ada tombol aksi untuk melihat konteks mendalam. | Kartu kelompok proyek tersusun rapi dengan indikator lencana sinyal bahaya, hierarki anggota tim (nama, peran, divisi), pembedaan status risiko & hasil, penanda continue berulang, serta tombol aksi `[Detail]`. | **Tinggi (Tampilan Mentah & Hirarki Kurang Jelas)** |
| **8** | **Modal Detail Risiko Komitmen** | **Tidak ada modal detail sama sekali.** Pengguna tidak dapat melihat konteks utuh komitmen, alasan hambatan, hubungan *Direct Manager* vs *Project Authority*, maupun jejak waktu submit. | Dilengkapi **Modal Detail Risiko Komitmen (`#riskDetailModal`)** yang menampilkan evaluasi akuntabilitas pagi-sore, penanganan blocker, penunjukan authority context, dan riwayat keberlanjutan tugas. | **Kritis (Ketiadaan Instrumen Analisis Mendalam)** |
| **9** | **Proteksi Akses & Layar 403 (RBAC)** | **Nol sistem keamanan peran.** Siapa pun yang membuka berkas ini dapat melihat seluruh data risiko proyek tanpa pembatasan. | Dilengkapi deteksi peran cerdas: Jika dibuka oleh akun staf biasa (*Budi Pratama*), panel disembunyikan dan dialihkan ke **Layar 403 Akses Dibatasi** dengan tombol kembali ke *My Today*. | **Kritis (Celah Akses / Security Leak)** |
| **10** | **Kebersihan Tampilan dari Kotak Nasihat** | Mengandung kalimat defensif/nasihat pada subjudul dan catatan kaki: *"Tidak ada aksi edit, assign, resolve, atau perubahan status di halaman ini. Tindak lanjut dilakukan melalui alur lain..."* | Bersih dari seluruh teks khotbah / disclaimer tutorial in-app. Antarmuka murni menyajikan data operasional, sedangkan penjelasan tata cara dialokasikan ke dokumen panduan (*user guide*). | **Sedang (Pelanggaran Prinsip Desain Bersih)** |

---

### Rangkuman Temuan Evaluasi (Gap Analysis)
Kode eksisting `13-Project-Risk-View.html` saat ini masih berstatus **prototipe statis generasi awal yang sangat mentah**:
1. Mengalami **100% tautan buntu (*deadlinks*)** pada bilah samping.
2. Tidak memiliki kemampuan **simulasi peran (RBAC)** dan **Layar 403 Proteksi Akses**.
3. Kartu ringkasan metrik **bersifat pasif** (tidak interaktif click-to-filter).
4. Tidak memiliki **Modal Detail Risiko** untuk menelaah kendala dan konteks wewenang (*Project Authority*).
5. Belum menyediakan **fitur Ekspor Ringkasan (UF-36)**.
6. Masih menyisakan **teks catatan disclaimer/nasihat** yang mengotori estetika halaman.

Diperlukan rekonstruksi komprehensif agar Halaman 13 mencapai standar kualitas, estetika visual, interaktivitas, dan keandalan sistem yang setara dengan Halaman 08–12 yang telah kita sempurnakan.

---

# BAGIAN 4: RENCANA AKSI & PLAN PERBAIKAN HALAMAN 13 (LANGKAH 4)

Guna menuntaskan seluruh kesenjangan pada Langkah 3 dan mewujudkan antarmuka ideal pada Langkah 2, berikut adalah rencana perbaikan bertahap (9 Fase Kerja) yang siap dieksekusi pada Langkah 5:

---

### Fase 1: Standarisasi Fondasi CSS, Desain Token, & Navigasi Sidebar
1. Menerapkan sistem desain CSS standar WorkPulse:
   * Palet warna resmi: `--brand: #00674D`, `--canvas: #F8FAFC`, `--surface: #FFFFFF`, status colors (Green, Amber, Red, Blue, Indigo/Purple).
   * Tipografi modern: Plus Jakarta Sans, kontras ramah mata, pembagian hierarki font yang jelas.
2. Memperbaiki seluruh navigasi bilah samping (*sidebar*): mengeliminasi 100% tautan buntu tanda pagar (`href="#..."`) dan menghubungkannya ke berkas prototipe nyata:
   * *Workspace:*
     - `My Today` $\rightarrow$ `01-My-Today-Submission.html`
     - `My History` $\rightarrow$ `02-My-History.html`
     - `My Leave` $\rightarrow$ `20-My Leave Request (Employee).html`
     - `Notifications` $\rightarrow$ `07-Notification-Center.html`
   * *Management:*
     - `Pulse Dashboard` $\rightarrow$ `08-Pulse-Dashboard.html`
     - `Blocker Queue` $\rightarrow$ `09-Blocker-Escalation-Queue.html`
     - `Coaching Notes` $\rightarrow$ `10-Manager-Note-Coaching-Record.html`
     - `Compliance Queue` $\rightarrow$ `11-Compliance-Queue-HRGA.html`
     - `Holiday / Exemption` $\rightarrow$ `12-Exemption-Management.html`
     - `Project Risk View` $\rightarrow$ `13-Project-Risk-View.html` *(Menu Aktif)*
     - `Review Queue` $\rightarrow$ `14-Review-Queue.html`
     - `Reports` $\rightarrow$ `17-Export-and-Reports.html`
3. Menyediakan navigasi drawer responsif untuk perangkat bergerak (*mobile drawer*) lengkap dengan tombol hamburger dan *backdrop overlay*.
4. Menghubungkan profil pengguna di pojok kiri bawah secara dinamis sesuai sesi simulasi peran aktif.

---

### Fase 2: Standarisasi Topbar, Simulator Peran (Optgroup), & Tombol Refresh
1. Menyusun *breadcrumb* navigasi standar: `Workspace / Manajemen / Project Risk View`.
2. Membangun dropdown simulator peran (`#quickRoleSwitcher`) di topbar terkelompok rapi dalam *optgroup*:
   * **Pengelola Proyek & Pengiriman (Akses Utama):**
     - `Ardi Pratama` (Project Manager · Scope Proyek Aktif) $\rightarrow$ *Akses penuh pemantauan risiko proyek*.
   * **Pimpinan Fungsi & Eksekutif (Mode Pantau):**
     - `Ayu Nirmala` (Head of Engineering · Pantau Fungsi Teknis) $\rightarrow$ *Mode pantau proyek divisi Engineering*.
     - `Rian Suryadi` (CEO / Direktur · Pantau Korporat) $\rightarrow$ *Mode pantau seluruh portofolio proyek perusahaan*.
   * **Peran Non-Wewenang (Simulasi 403 Akses Dibatasi):**
     - `Budi Pratama` (Staff Developer) $\rightarrow$ *Menu disembunyikan dari sidebar; jika diakses memicu Layar 403*.
3. Menambahkan tombol penyegaran (*refresh button* `#refreshBtn`) dengan animasi putaran halus $360^\circ$ selama 0,5 detik disertai toast konfirmasi pembaruan data.
4. Menambahkan ikon lonceng notifikasi interaktif dan lencana avatar peran.

---

### Fase 3: Rekonstruksi Area Header, Lencana Cakupan, & Fitur Ekspor (UF-36)
1. Memperbarui Judul Halaman (H1): `Pemantauan Risiko Proyek` (Bahasa Indonesia resmi, dengan label menu bilah samping tetap mempertahankan taksonomi bahasa Inggris konsisten `Project Risk View`).
2. Menyusun subjudul profesional yang lugas: *"Pantau risiko pengiriman, kendala komitmen, dan blocker lintas fungsi pada seluruh proyek aktif."*
3. Menambahkan **Lencana Cakupan (*Scope Badge*)** dinamis sesuai simulasi peran aktif:
   * *Project Manager:* `Cakupan: Proyek Tanggung Jawab Aktif`
   * *Head of Engineering:* `Cakupan: Divisi Engineering`
   * *CEO / Direktur:* `Cakupan: Seluruh Perusahaan`
4. Menambahkan tombol aksi utama: **`Ekspor Ringkasan (PDF / XLSX)`** sesuai spesifikasi UF-36 & AC-P13-03, yang memicu modal dialog ekspor untuk mengunduh rekap ringkasan portofolio risiko proyek.

---

### Fase 4: Pembangunan 5 Kartu Ringkasan Metrik Interaktif (Click-to-Filter)
1. Merancang 5 kartu ringkasan bergrid simetris yang responsif dan terhubung dengan filter:
   * **Kartu 1 (Netral/Slate):** `Kelompok Proyek` — Nilai: `4` · Subteks: `Referensi proyek aktif` (menampilkan total referensi unik dan berfungsi sebagai reset filter tanpa mengulang angka).
   * **Kartu 2 (Merah/Red):** `Komitmen Kritis` — Nilai: `3` · Subteks: `Perlu mitigasi rilis segera`.
   * **Kartu 3 (Amber/Kuning):** `Risiko Moderat` — Nilai: `3` · Subteks: `Potensi kendala & dependensi`.
   * **Kartu 4 (Ungu/Indigo):** `Tersendat Berulang` — Nilai: `3` · Subteks: `Carry-over ≥ 2 hari berturut-turut`.
   * **Kartu 5 (Biru/Blue):** `Blocker Aktif` — Nilai: `6` · Subteks: `Kendala tim butuh bantuan`.
2. Mengimplementasikan fitur **Click-to-Filter dua arah**:
   * Mengklik salah satu kartu otomatis menerapkan kriteria filter pada daftar kelompok proyek.
   * Memberikan efek visual batas aktif (*active filter border*) pada kartu yang sedang dipilih.
   * Jika filter diubah via dropdown atau pencarian, status aktif kartu otomatis kembali netral (*all*).

---

### Fase 5: Pembangunan Bilah Saringan Terpadu Real-Time (Unified Filter Bar)
1. Menyediakan kolom input pencarian teks langsung untuk nama proyek, tugas komitmen, nama pelaksana, peran, atau kendala blocker.
2. Menyediakan **Dropdown Pemilih Proyek Spesifik (`#projectFilter`)**:
   * Pilihan: `Semua Proyek`, `Melon Hidroponik (IoT Sensor Telemetry)`, `Client Portal / API Integration`, `Core Payment Engine Modernization`, `Internal Reporting Refresh`.
3. Menyediakan dropdown status risiko (`#riskFilter`): `Semua Status Risiko`, `RED (Kritis)`, `AMBER (Moderat)`, `GREEN (Lancar)`.
4. Menyediakan dropdown tipe item (`#workTypeFilter`): `Semua Jenis Item`, `Morning Commitment`, `Additional Work`.
5. Menyediakan dropdown sinyal bahaya (`#signalFilter`) dengan 6 kondisi lengkap:
   * `Semua Sinyal Bahaya`
   * `Hanya Berisiko (AMBER / RED)`
   * `Hanya Continue Berulang`
   * `Ada Blocker Aktif`
   * `Blocker Kritis (Critical / High)`
   * `Hasil Belum Tuntas (Partially / Not Completed)`
6. Menambahkan tombol reset saringan satu-klik (`Reset`) yang mengembalikan seluruh parameter pencarian ke kondisi default.
7. Mengoptimalkan tata letak CSS (`max-width` dan `text-overflow: ellipsis`) sehingga seluruh 4 dropdown, search input, dan tombol reset berada dalam **satu baris datar sempurna** tanpa melipat canggung di layar desktop.

---

### Fase 6: Rekonstruksi Kartu Kelompok Proyek & Tabel Item Komitmen (Calm UI)
1. Merancang kartu kelompok proyek (*Reference Group Card*) yang elegan dan tenang:
   * **Kepala Kartu (*Group Header*):**
     - Nama referensi proyek dengan tipografi tebal bersih tanpa hiasan ikon grafis.
     - Lencana jumlah item aktif (`3 Item`) tanpa kode teknis internal (`RG-01`).
     - Lencana sinyal bahaya dinamis: `[X Kritis]`, `[Y Moderat]`, `[Z Continue Berulang]`, `[W Blocker Aktif]`.
     - Lencana proyek sehat: Jika proyek 100% lancar, ditampilkan chip hijau tenang: `Semua Komitmen Lancar`.
     - Menghapus duplikasi lencana `Mode Pantau` dari kepala kartu.
2. Merancang 6 kolom tabel komitmen dengan arsitektur antarmuka tenang (*Calm UI: Muted Baseline, Loud Exceptions*):
   * **Komitmen & Pekerjaan:** Judul pekerjaan tebal bersih + subteks jenis item abu-abu netral (`Morning Commitment` / `Additional Work`). Kode ID item (`TSK-101`) dialokasikan ke modal rincian detail agar tabel tetap tenang.
   * **Pelaksana & Divisi:** Nama pelaksana tebal + subteks peran dan divisi abu-abu netral (`${role} · ${division}`). Menghilangkan teks hijau mencolok pada nama divisi.
   * **Status Risiko & Hasil:** Indikator titik status semantik (`● RED`, `● AMBER`, `● GREEN`) dipadukan dengan subteks hasil sore hari (`Completed (100%)`, `Partially Completed (xx%)`, `Not Completed (0%)`, `Cancelled`). Menetapkan aturan tetap: derajat risiko mencerminkan keparahan blocker/ancaman pengiriman, sedangkan subteks hasil mencatat progres fisik secara konsisten.
   * **Kelanjutan:** Tanda strip tenang (`—`) untuk tugas non-lanjut, tag oranye ramping untuk `Continue` (hari ke-1), dan tag ungu terpadu tunggal `Continue (3x)` untuk carry-over berulang tanpa pemborosan tinggi baris tabel.
   * **Blocker & Bantuan:** Tanda strip tenang (`—`) untuk komitmen tanpa kendala. Judul blocker teks normal diawali tag keparahan ringkas (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), serta subteks pemilik bantuan (`Bantuan: ${ownerNeeded}`).
   * **Tombol Aksi:** Tombol minimalis `Lihat Detail` dengan garis tepi tipis halus.
3. Menyediakan dataset representatif (10 item dari 4 kelompok proyek lintas fungsi: IoT Squad, Squad Core, FinTech Squad, Platform & Infrastructure, Quality Assurance, Product Design).
4. Menyediakan tampilan *Empty State* yang ramah jika hasil saringan nihil dengan tombol reset instan.

---

### Fase 7: Pembangunan & Penyempurnaan Modal Detail Risiko Komitmen (`#riskDetailModal`)
1. **Solusi Struktural CSS & Responsivitas:**
   * Mencegah pemotongan kartu (*anti-squash*) dengan menyematkan `flex-shrink: 0;` pada `.prop-card`.
   * Mengaktifkan *vertical smooth scrolling* pada `.modal-body` (`flex: 1; min-height: 0; overflow-y: auto;`) agar ke-5 kartu properti dapat digulir secara leluasa tanpa ada baris data yang terpenggal.
   * Menghilangkan *zebra striping* rapuh (`:nth-child(even)`) dan menerapkan latar belakang putih bersih berseragam dengan batas bawah halus (`#E2E8F0`) sesuai prinsip *Calm UI*.
   * Memperlebar kolom label menjadi `180px` untuk menjaga proporsi ruang teks panjang.
2. **Penyajian 5 Seksi Informasi Terstruktur:**
   * **Seksi 1 (Uraian Pekerjaan & Referensi Proyek):** Judul tugas, jenis penugasan resmi (`Morning Commitment` / `Additional Work`), dan nama modul proyek target.
   * **Seksi 2 (Pelaksana & Hubungan Wewenang Matriks):** 
     - Nama lengkap pelaksana dan jabatan + divisi/squad.
     - Penegasan garis komando ganda: `Atasan Struktural` (*Direct Manager*) vs `Akuntabilitas Rilis` (*Project Authority* — amanat FR-19 & US-16).
   * **Seksi 3 (Evaluasi Akuntabilitas Harian):** 
     - Status risiko harian dengan dot semantik tenang (`● RED`, `● AMBER`, `● GREEN`).
     - Hasil sore (*Outcome*) dengan taksonomi standar: `Completed (100%)`, `Partially Completed (xx%)`, `Not Completed (0%)`, atau `Cancelled (Dibatalkan)`.
     - Catatan rincian teknis dan justifikasi evaluasi kerja.
   * **Seksi 4 (Konteks Blocker & Eskalasi Lapangan):** 
     - Indikator kendala aktif / lancar.
     - Uraian blocker teknis dan tingkat keparahan (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`).
     - `Pihak Bantuan` yang dibutuhkan beserta konteks eskalasinya, dilengkapi *fallback default*: *"Perlu Arahan & Koordinasi Project Manager"* jika belum terdefinisi.
   * **Seksi 5 (Jejak Waktu & Pola Kelanjutan Tugas):** 
     - Status kelanjutan (`Continue` terpadu dengan deteksi pola repetitif multi-hari).
     - Pemisahan baris log audit: `Waktu Check-in Pagi` dan `Waktu Check-out Sore` (dengan penanganan ramah jika karyawan belum check-out sore).
3. **Tombol Aksi Penutup:** Tombol sekunder tenang `Tutup Rincian` dan tombol silang `X`. Tanpa tombol manipulasi status buatan, menjaga sifat analitis murni (*read-only*).

---

### Fase 8: Pembangunan & Penyempurnaan Modal Ekspor Portofolio Risiko (`#exportModal`)
1. **Dua Format Berkas Profesional:**
   * `Ringkasan PDF`: Format eksekutif dengan tata letak visual siap cetak untuk presentasi rapat koordinasi mingguan (*Weekly Delivery Sync*).
   * `Lembar Kerja XLSX`: Format data tabular mentah lengkap untuk analisis spreadsheet (*sorting, filtering, pivot table*) dan pengolahan data mendalam.
2. **Kalkulasi Cakupan Ekspor yang Dinamis & Responsif:**
   * `Seluruh Portofolio Proyek Aktif`: Menghitung total proyek dan komitmen aktif secara otomatis sesuai profil peran pengguna yang sedang login.
   * `Hanya Hasil Saringan Aktif`: Menghitung jumlah proyek dan komitmen yang sedang lolos saringan aktif di layar secara *realtime*.
   * **Penanganan Aman (*Defensive Edge Case*):** Jika saringan menghasilkan 0 item (tidak ada data cocok), opsi saringan otomatis dinonaktifkan (*disabled*) dengan teks peringatan merah lembut, dan pilihan dipindahkan ke seluruh portofolio guna mencegah pengunduhan berkas kosong.
3. **Desain Kartu Pilihan Interaktif (*Active State Feedback*):**
   * Menggunakan komponen kartu `.export-option-card` dengan umpan balik visual yang jelas: kartu yang dipilih mendapatkan garis tepi berwarna brand (`#0D9488`), latar belakang hijau toska lembut (`#F0FDFA`), dan penegasan tipografi.
4. **Catatan Metadata Penarikan Dokumen (*Snapshot Audit Trail*):**
   * Bagian bawah modal menyajikan informasi cap waktu resmi penarikan berkas (tanggal dan jam WIB) serta nama dan peran pemohon (*generator identity*), menjamin keabsahan dokumen saat dibagikan ke pihak luar/manajemen.
5. **Tombol Aksi & Notifikasi:** Tombol sekunder `Batal` dan tombol primer `Unduh Dokumen` dengan ikon SVG unduhan, disertai simulasi unduhan berkas dan umpan balik *toast* yang mengonfirmasi nama berkas serta jumlah item yang diekspor.

---

### Fase 9: Penerapan Sistem Keamanan Peran (Layar RBAC 403) & Uji 5 Dimensi
1. Mengintegrasikan logika pengalihan wewenang sesuai matriks hak akses:
   * **Project Manager (`Ardi Pratama`):** Akses penuh pemantauan risiko pada proyek-proyek aktif dalam lingkup wewenangnya.
   * **Head of Engineering (`Ayu Nirmala`):** Mode pantau fungsi; melihat komitmen seluruh tim teknis pada proyek berjalan.
   * **CEO / Direktur (`Rian Suryadi`):** Mode pantau korporat; melihat agregasi portofolio seluruh proyek perusahaan.
   * **Staff Developer (`Budi Pratama`):**
     - Menu `Project Risk View` disembunyikan secara otomatis dari bilah samping (*sidebar*).
     - Jika rute dibuka langsung, seluruh panel disembunyikan dan sistem menampilkan **Layar 403 Akses Dibatasi**:
       * Ikon gembok pembatasan hak akses.
       * Judul: `403 · Akses Dibatasi (Staff Developer)`.
       * Penjelasan bahwa pemantauan risiko pengiriman proyek dikhususkan untuk fungsi manajemen (PM, Head, Direksi).
       * Tombol pengalihan cepat: `Buka My Today ↗` dan `Beralih ke Akun PM (Simulasi)`.
2. **Pembersihan Bersih dari Kotak Nasihat (*Zero In-App Banners*):** Memastikan tidak ada lagi kotak teks khotbah atau disclaimer teoritis di seluruh antarmuka.
3. **Uji Integritas 5 Dimensi Standar WorkPulse:**
   * *Dimensi 1 (Redaksi Teks & Bahasa):* Tata bahasa profesional, lugas, konsisten, dan mudah dipahami.
   * *Dimensi 2 (Keselarasan Aturan Bisnis):* 100% patuh pada prinsip derivatif read-only, exception-first, dan authority context.
   * *Dimensi 3 (Estetika Visual & Kerapian):* Tampilan modern, palet warna elegan, spasi proporsional, dan tata letak simetris.
   * *Dimensi 4 (Interaktivitas & Kenyamanan UX):* Click-to-filter responsif, modal detail mulus, dan tombol reset satu-klik.
   * *Dimensi 5 (RBAC, Keamanan, & Anti-Deadlink):* Seluruh menu sidebar terhubung ke berkas nyata, proteksi 403 aktif, dan simulator peran berjalan sempurna.

---

# STATUS EKSEKUSI LANGKAH 5 (IMPLEMENTASI KODE SELESAI)

Kode [`13-Project-Risk-View.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/13-Project-Risk-View.html) telah sepenuhnya direkonstruksi dan telah berhasil mengimplementasikan seluruh kebutuhan fungsional dan estetika standar WorkPulse:
1. **100% Tautan Nyata (Anti-Deadlink):** Seluruh navigasi sidebar terhubung ke berkas prototipe fungsional.
2. **Simulator Peran Lintas Hirarki (RBAC):** Mendukung pengujian transparan untuk PM (*Ardi Pratama*), Head (*Ayu Nirmala*), CEO (*Rian Suryadi*), dan Layar 403 Akses Dibatasi untuk Staf (*Budi Pratama*).
3. **5 Kartu Ringkasan Metrik Interaktif:** Dilengkapi mekanisme *click-to-filter* dua arah yang responsif.
4. **Bilah Saringan Terpadu Real-Time:** Saringan multi-parameter instan tanpa perlu reload halaman.
5. **Modal Detail Risiko Komitmen (`#riskDetailModal`):** Menampilkan rincian evaluasi akuntabilitas, pemisahan *Direct Manager* vs *Project Authority* (FR-19 & US-16), konteks blocker, dan riwayat carry-over berulang.
6. **Modal Ekspor Portofolio Risiko (`#exportModal`):** Memenuhi amanat spesifikasi UF-36 & AC-P13-03.
7. **Antarmuka Bersih & Bebas Kotak Nasihat (*Zero In-App Educational Banners*):** Tampilan murni menyajikan data operasional yang rapi dan elegan.

---

# BAGIAN 6: KETERKAITAN DATA DENGAN HALAMAN LAIN (CROSS-PAGE CONTRACTS)

Halaman 13 menjadi instrumen utama tata kelola matriks silang fungsi (*cross-functional delivery matrix*) yang menghubungkan akuntabilitas individu dengan kesehatan portofolio proyek:

| Halaman Terkait | Bentuk Keterkaitan & Aliran Data |
|---|---|
| **Halaman 01 (Login)** | Menerima pengalihan peran `Project Manager` (Ardi Pratama), `Head of Department` (Ayu Nirmala), dan `CEO` (Rian Suryadi), serta menerapkan proteksi Layar 403 bagi staf biasa. |
| **Halaman 02 & 03 (Morning & Additional Work)** | Menghimpun seluruh komitmen dan penugasan ad-hoc anggota tim yang mengaitkan rujukan inisiatif proyek (`projectScopeReference`). |
| **Halaman 04 (EOD Outcome)** | Membaca hasil akhir capaian tugas (*Outcome*) dan status risiko sore untuk mengevaluasi ancaman penundaan milestone proyek. |
| **Halaman 05 & 09 (Blocker & Escalation)** | Kendala kritis berjalur wewenang proyek (*Project Authority*) langsung tercermin pada metrik peringatan dini proyek bersangkutan. |
| **Halaman 08 (Pulse Dashboard)** | Menyuplai perspektif matriks risiko proyek yang melengkapi sudut pandang lini struktural departemen (*Department Pulse*). |
| **Halaman 14 (Escalation Aging)** | Menjadi instrumen investigasi lanjutan bagi tiket kendala proyek yang mengalami penuaan respon eskalasi melebihi batas waktu SLA. |
| **Halaman 15 (Admin Mapping)** | Menggunakan data master inisiatif proyek (`workpulse_projects`) dan pemetaan wewenang proyek (`workpulse_project_authorities`) yang dikonfigurasi admin. |


