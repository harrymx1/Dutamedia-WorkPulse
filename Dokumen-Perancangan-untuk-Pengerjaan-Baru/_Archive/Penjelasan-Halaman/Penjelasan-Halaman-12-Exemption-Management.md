# Penjelasan Halaman 12: Manajemen Hari Libur & Dispensasi (Exemption Management)

Dokumen ini merupakan panduan spesifikasi fungsional, alur kerja operasional, aturan bisnis, dan peta implementasi antarmuka ideal untuk **Halaman 12: Manajemen Hari Libur & Dispensasi (`12-Exemption-Management.html`)** pada sistem **WorkPulse**.

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY (LANGKAH 1)

## 1.1 Maksud & Tujuan Utama Halaman 12
Halaman ini dirancang sebagai **pusat kendali administratif (*administrative control center*)** bagi manajemen HRGA dan Administrator Sistem untuk menetapkan kalender hari libur resmi perusahaan serta dispensasi pengecualian pelaporan harian bagi karyawan atau jabatan tertentu.

Tujuan utamanya adalah menjamin keadilan sistemik pelaporan kerja:
1. **Mencegah Vonis Keliru (*Zero False Non-Submission*):** Karyawan yang sedang libur resmi, bertugas dinas ke luar kota, menghadiri konferensi lapangan, atau memegang jabatan eksekutif yang dikecualikan secara terbuka **tidak boleh ditandai sebagai lalai/absen (*No Submission*)** oleh sistem WorkPulse.
2. **Penerapan Langsung Tanpa Birokrasi Tambahan (*Direct Effective Implementation*):** Berbeda dengan pengajuan cuti yang memerlukan persetujuan atasan berjenjang, penetapan hari libur dan dispensasi dinas oleh HRGA **langsung aktif dan berlaku seketika** begitu disimpan ke dalam sistem.
3. **Penyelarasan Hak Akses Eksekutif (*Indefinite Role Exemption*):** Memberikan payung hukum operasional bagi peran pimpinan puncak (seperti CEO dan Dewan Direksi) agar akun mereka berstatus bebas pelaporan harian tanpa batas kedaluwarsa secara otomatis.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Berdasarkan dokumen spesifikasi PRD §1 dan PDD §4, hak akses pada halaman ini diatur sebagai berikut:

| Peran (*Role*) | Contoh Pengguna | Hak Akses Halaman 12 | Keterangan & Tindakan yang Diizinkan |
|---|---|---|---|
| **HRGA / People Admin** | Dewi Anggraeni | **Akses Penuh (Read & Write)** | **Pengelola Utama.** Menerbitkan hari libur perusahaan, dispensasi dinas individual, mengedit tanggal, dan menonaktifkan pengecualian tanpa memerlukan approval tambahan (FR-46, AC-45). |
| **System Administrator** | Hendra Wijaya | **Akses Penuh (Config & Policy)** | Mengonfigurasi master kalender, kebijakan pengecualian, dan penetapan pengecualian jabatan struktural terbuka (*Indefinite Role Exemption*). |
| **CEO / Direktur** | Rian Suryadi | **Akses Terbatas (Read Only)** | Memantau seluruh kalender libur dan dispensasi tingkat perusahaan (*company-wide governance*). Tombol tambah/edit/hapus disembunyikan. |
| **Supervisor / Lead** | Ahmad Fauzan | **Akses Ditolak (403 Forbidden)** | **Tidak memiliki akses.** Menu `Holiday / Exemption` tidak muncul di sidebar Supervisor. Persetujuan cuti bawahan dikelola melalui menu `Review Queue` (A 4.22). |
| **Head of Department** | Ayu Nirmala | **Akses Ditolak (403 Forbidden)** | **Tidak memiliki akses.** Menu `Holiday / Exemption` tidak muncul di sidebar Head. Tinjauan dan eskalasi cuti divisi dikelola melalui menu `Review Queue` (A 4.22). |
| **Staff / Employee** | Budi Pratama | **Akses Ditolak (403 Forbidden)** | **Tidak memiliki akses.** Menu grup Management tidak muncul di sidebar Staf. Pengajuan cuti pribadi dilakukan mandiri melalui menu `My Leave Request` (A 4.20). |

---

## 1.3 User Story & Kriteria Penerimaan (Acceptance Criteria)

### A. User Story Utama
* **US-18 (Sebagai HRGA):**  
  *"Sebagai tim HRGA, saya ingin mengelola hari libur resmi dan dispensasi penugasan individual secara terpusat, agar sistem pelaporan tidak salah mendeteksi karyawan sebagai tidak lapor (No Submission) pada hari-hari mereka bertugas sah di luar kantor atau sedang libur nasional."*
* **US-19 (Sebagai Atasan Langsung):**  
  *"Sebagai Supervisor/Team Lead, saya ingin melihat siapa saja anggota tim saya yang memiliki dispensasi dinas aktif hari ini, agar saya dapat mengatur ulang distribusi tugas harian tanpa khawatir rekam jejak kepatuhan mereka tercoreng."*

### B. Kriteria Penerimaan Resmi (PRD & PDD Baseline)
* **AC-45 (Penerbitan Langsung Tanpa Approval Tambahan):**  
  HRGA dan Admin berwenang dapat menambah, mengubah, dan menonaktifkan catatan hari libur serta dispensasi individual. Perubahan langsung berlaku efektif sejak tanggal yang ditentukan tanpa menunggu antrean persetujuan atasan.
* **AC-46 (Pengecualian Otomatis dari No Submission):**  
  Setiap tanggal yang tercakup dalam rentang hari libur atau dispensasi yang sah otomatis dikecualikan dari kalkulasi denda, penalti keterlambatan, pengingat otomatis (*reminder*), dan catatan ketidakpatuhan harian.
* **AC-47 (Dukungan Pengecualian Terbuka / Indefinite Exemption):**  
  Sistem wajib mendukung penetapan dispensasi tanpa batas waktu akhir (*open-ended / no expiry date*) khusus untuk peran eksekutif (CEO/Direksi), yang berlaku permanen hingga dicabut secara eksplisit melalui kebijakan baru.

---

## 1.4 Tiga Kategori Pengecualian Resmi di WorkPulse

Sistem membedakan tiga klasifikasi pengecualian dengan karakteristik yang tegas:

```
┌────────────────────────────────────────────────────────────────────────┐
│             KLASIFIKASI HARI LIBUR & PENSIUNAN WORKPULSE               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
1. COMPANY HOLIDAY            2. DISPENSASI DINAS             3. PENSIUNAN JABATAN
 (Hari Libur Bersama)        (Individual Bounded)             (Indefinite Role)
 • Berlaku seluruh kantor    • Berlaku 1 karyawan             • Berlaku peran tertentu
 • Tanggal tunggal / rentang • Ada tanggal mulai & akhir      • Tanpa tanggal akhir
 • Contoh: Libur Nasional    • Contoh: Dinas Luar, Workshop   • Contoh: CEO, Direksi
```

1. **Hari Libur Resmi Perusahaan (*Company Holiday*):**
   * **Cakupan:** Berlaku untuk seluruh karyawan di semua divisi tanpa terkecuali (*company-wide*).
   * **Bentuk:** Tanggal tunggal (misal *Hari Kemerdekaan 17 Agustus*) atau rentang tanggal (misal *Cuti Bersama Idulfitri*).
   * **Dampak Sistem:** Menonaktifkan seluruh pengingat komitmen pagi dan evaluasi sore untuk seluruh organisasi pada tanggal tersebut.
2. **Dispensasi Tugas Lapangan (*Individual Bounded Exemption*):**
   * **Cakupan:** Diberikan khusus kepada satu orang karyawan tertentu yang mendapatkan penugasan dinas.
   * **Bentuk:** Wajib memiliki batas waktu yang jelas, yaitu **Tanggal Mulai (*Effective Date*)** dan **Tanggal Berakhir (*Expiry Date*)**.
   * **Contoh Kasus:** Penugasan instalasi jaringan di kantor klien luar kota, delegasi pameran/workshop, atau tugas operasional darurat.
   * **Dampak Sistem:** Akun karyawan terkait dibebaskan dari kewajiban mengisi pelaporan pada rentang tanggal tersebut tanpa dianggap bolos.
3. **Pengecualian Jabatan Terbuka (*Indefinite Role Exemption*):**
   * **Cakupan:** Melekat pada profil jabatan pimpinan tertentu sesuai ketetapan organisasi (CEO, Komisaris, Dewan Direksi).
   * **Bentuk:** Memiliki tanggal mulai berlaku, namun **tanpa tanggal kedaluwarsa (*open-ended / no expiry date*)**.
   * **Dampak Sistem:** Akun tetap dapat membuka halaman kerja harian secara sukarela (*self-commitment*), namun tidak pernah dibebani batas waktu hitung mundur (*no cutoff countdown*), tidak ada sanksi keterlambatan, dan tidak pernah memicu event ketidakpatuhan.

---

## 1.5 Perbedaan Tegas: Dispensasi (Exemption) vs Cuti Karyawan (Leave)

Untuk mencegah kerancuan operasional, sistem menetapkan batas distingsi yang tegas:

| Aspek Pembeda | Dispensasi & Hari Libur (Halaman 12) | Cuti Karyawan (Halaman 20 & 21) |
|---|---|---|
| **Inisiator / Pembuat** | Diterbitkan oleh **Manajemen HRGA / Admin**. | Diajukan secara mandiri oleh **Karyawan**. |
| **Konteks Penggunaan** | Hari libur nasional, dinas kantor, tugas offsite, pameran, penugasan proyek luar. | Hak istirahat tahunan pribadi, cuti menikah, cuti sakit, atau urusan keluarga. |
| **Alur Persetujuan** | **Berlaku Langsung (*Direct Active*)** tanpa approval tambahan. | **Wajib Persetujuan Berjenjang (*Multi-Step Approval*)** oleh Supervisor/Head & HRGA. |
| **Pengurangan Kuota** | **Tidak mengurangi** jatah hak cuti tahunan karyawan. | **Mengurangi** kuota saldo cuti tahunan karyawan. |

### 1.5.1 Pemisahan Tegas Modul Dispensasi HRGA dan Modul Cuti Karyawan (Arsitektur Opsi 2)
Sesuai arahan arsitektur antarmuka (Opsi 2):
1. **Pemisahan Modul Bersih:** Halaman 12 murni mengelola **Hari Libur Perusahaan & Dispensasi Dinas/Eksekutif** yang diterbitkan langsung oleh HRGA.
2. **Data Cuti Pribadi Dikelola Mandiri:** Seluruh permohonan cuti tahunan, cuti sakit, atau izin keperluan keluarga diproses dan dipantau secara mandiri di modul Cuti (Halaman 20, 21, dan 22), dan tidak dicampur ke dalam tabel Halaman 12.
3. **Keseragaman Kolom Aksi 100%:** Karena seluruh baris pada tabel Halaman 12 murni diterbitkan oleh HRGA, seluruh baris memiliki susunan kolom Aksi yang seragam dan konsisten: **`Detail` | `Edit` | `Hapus`**, tanpa ada tombol yang hilang, terlempar, atau berlabel ganjil.

---

## 1.6 Aturan Bisnis & Integrasi Sistem (Business Logic)

1. **BR-07 (Zero Auto-SP on Valid Exception):**  
   Hari libur atau dispensasi yang sah membatalkan seluruh evaluasi anomali ketidakpatuhan. Data pada Halaman 11 (*Compliance Queue*) dilarang keras memunculkan nama karyawan yang sedang dalam masa dispensasi sah.
2. **Validasi Tanggal Kronologis:**  
   Tanggal akhir dispensasi tidak boleh lebih lampau daripada tanggal mulai (`endDate >= startDate`).
3. **Perekaman Jejak Audit Menyeluruh (*Comprehensive Audit Trail*):**  
   Setiap kali data libur atau dispensasi dibuat, diubah, atau dinonaktifkan, sistem mencatat:
   * Nama penerbit (*Created By / Updated By*).
   * Stempel waktu presisi dalam Waktu Indonesia Barat (`DD Mmm YYYY · HH:mm WIB`).
   * Alasan/konteks penugasan resmi minimal 10 karakter.
4. **Keberlakuan Otomatis Status Periode (*Auto-Calculated Period Status*):**  
   Status periode dihitung secara dinamis terhadap tanggal kalender hari ini:
   * **Sedang Berlaku (*Active*):** `startDate <= Hari_Ini <= endDate` (atau tanpa tanggal akhir untuk peran terbuka).
   * **Akan Datang (*Upcoming*):** `startDate > Hari_Ini`.
   * **Telah Berakhir (*Ended*):** `endDate < Hari_Ini`.
   * **Dinonaktifkan (*Deactivated*):** Rekam jejak dispensasi aktif/lampau yang dicabut secara sah oleh HRGA tanpa dihapus permanen demi kepatuhan jejak audit.

---

# BAGIAN 2: PETA IMPLEMENTASI IDEAL SESUAI PEDOMAN KONSISTENSI (LANGKAH 2)

Agar antarmuka Halaman 12 tampil selaras, profesional, dan setara dengan standar keunggulan Halaman 08, 09, 10, dan 11, berikut adalah susunan arsitektur implementasi yang seharusnya:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo WorkPulse | Breadcrumb | Simulasi Peran | Refresh (Spin) | Lonceng | Profil│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PAGE HEADING:                                                                          │
│ [Judul: Kelola Hari Libur & Dispensasi Tim]             [Cakupan: Seluruh Perusahaan] │
│ [Subjudul: Kelola kalender libur dan dispensasi...]   [+ Tambah Libur / Dispensasi]    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4 SUMMARY METRIC CARDS (Click-to-Filter):                                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────┐ │
│ │ Hari Libur Resmi │ │ Dispensasi Aktif │ │ Pengecualian     │ │ Periode Mendatang   │ │
│ │   4 Hari Libur   │ │   3 Karyawan     │ │ Jabatan (2 Akun) │ │   2 Jadwal Libur    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DAFTAR HARI LIBUR & DISPENSASI (Tabel Terpadu):                                        │
│ [Cari Nama/Agenda...] [Semua Jenis ▾] [Semua Status ▾] [Semua Unit ▾] [🔄 Reset]       │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ AGENDA / KONTEKS  │ JENIS       │ BERLAKU UNTUK    │ PERIODE EFEKTIF│ STATUS│ AKSI │ │
│ │ Hari Kemerdekaan  │ Hari Libur  │ Seluruh Kantor   │ 17 Agu 2026    │ Selesai│Edit │ │
│ │ Dinas Luar Kota   │ Dispensasi  │ Raka Aditya      │ 12-14 Okt 2026 │ Aktif │Edit │ │
│ │ Pengecualian CEO  │ Bebas Peran │ Budi Santoso     │ Berlaku Terbuka│ Aktif │Edit │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│ Catatan Kaki: Pengecualian dinas berlaku langsung. Pengajuan cuti diproses di Cuti.    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.1 Struktur Tata Letak (Layout) & Navigasi Terintegrasi
1. **Sidebar Navigasi:**  
   Menggunakan komponen standar WorkPulse dengan pembagian menu:
   * **Workspace:** *My Today*, *My Blockers*, *My History*, *My Leave*, *Notifications*.
   * **Management:** *Pulse Dashboard*, *Blocker Queue*, *Coaching Notes*, *Compliance Queue*, **Holiday / Exemption (Aktif)**, *Reports*.
   * Profil pengguna aktif di pojok kiri bawah.
   * Dukungan penuh drawer navigasi mobile responsif (*sidebar drawer* dengan *backdrop overlay*).

---

## 2.2 Header Atas (Topbar) & Simulator Peran Lintas Hirarki
Topbar sticky dengan efek kaca (*glassmorphism*) memuat:
1. **Breadcrumb:** `Workspace / Manajemen / Kelola Hari Libur & Dispensasi`.
2. **Dropdown Simulasi Peran (*Role Switcher*):**  
   Menyediakan uji coba simulasi peran terstruktur sesuai matriks RBAC sistem (PDD §4 & PRD §1):
   * **Pengelola Berwenang (Akses Penuh):**
     * `Dewi Anggraeni` (HRGA Specialist · Pengelola Utama) $\rightarrow$ *Akses Penuh Tambah, Edit, dan Hapus*.
     * `Hendra Wijaya` (System Administrator · Hak Penuh) $\rightarrow$ *Akses Penuh Konfigurasi & Indefinite Role Exemption*.
   * **Manajemen Eksekutif (Mode Pantau):**
     * `Rian Suryadi` (CEO / Direktur · Pantau / Read-Only) $\rightarrow$ *Akses Pantau Seluruh Perusahaan (Tombol Tambah/Edit/Hapus disembunyikan)*.
   * **Peran Operasional Lainnya (Simulasi 403 Akses Dibatasi):**
     * `Ahmad Fauzan` (Supervisor Engineering) $\rightarrow$ *Menu Holiday/Exemption disembunyikan dari sidebar; akses langsung memicu Layar 403 (pengalihan ke Review Queue)*.
     * `Ayu Nirmala` (Head of Department) $\rightarrow$ *Menu Holiday/Exemption disembunyikan dari sidebar; akses langsung memicu Layar 403 (pengalihan ke Review Queue)*.
     * `Budi Pratama` (Staff Developer) $\rightarrow$ *Grup menu Management disembunyikan dari sidebar; akses langsung memicu Layar 403 (pengalihan ke My Leave Request)*.
3. **Tombol Refresh Data:**  
   Ikon panah melingkar dengan animasi putaran halus (*smooth spin animation 0.5s*) dan notifikasi toast keberhasilan.
4. **Ikon Notifikasi & Avatar Pengguna.**

---

## 2.3 Judul Halaman & Lencana Lingkup Wewenang
* **Judul Utama (H1):** `Kelola Hari Libur & Dispensasi Tim`
* **Subjudul:** *"Tetapkan kalender hari libur resmi dan dispensasi penugasan kerja individual agar evaluasi akuntabilitas berjalan adil dan objektif."*
* **Lencana Lingkup Wewenang (*Solid Card Scope Badge*):**  
  Menampilkan kotak putih bersih berborder halus dengan teks dua baris: `CAKUPAN WEWENANG` dan `Seluruh Perusahaan · Cakupan HRGA`.
* **Tombol Aksi Utama:**  
  Tombol hijau botol mencolok: `+ Tambah Hari Libur / Dispensasi` (teks bersih dengan tanda tambah, tanpa ikon SVG redundan).

---

## 2.4 Empat Kartu Ringkasan Metrik (Click-to-Filter)
Empat kartu ringkasan interaktif yang berfungsi sebagai pintasan filter satu-klik:

1. **Kartu 1: Hari Libur Perusahaan (*Company Holidays*)**  
   * Angka total hari libur resmi yang terdaftar.  
   * Ikon kalender biru laut (`#E0F2FE` / `#075985`).  
   * Sub-label: *Hari libur nasional & kantor*.
2. **Kartu 2: Dispensasi Khusus Aktif (*Active Individual Exemptions*)**  
   * Angka karyawan yang hari ini sedang dalam masa penugasan luar/offsite.  
   * Ikon orang bertugas ungu lavender (`#F3E8FF` / `#6B21A8`).  
   * Sub-label: *Sedang bertugas luar hari ini*.
3. **Kartu 3: Dispensasi Eksekutif (*Executive Role Exemptions*)**  
   * Angka akun eksekutif yang dibebaskan permanen (misal CEO & Direksi).  
   * Ikon bintang/lencana emas amber (`#FEF3C7` / `#92400E`).  
   * Sub-label: *Bebas kewajiban tanpa batas waktu*.
4. **Kartu 4: Periode Mendatang (*Upcoming Schedules*)**  
   * Angka agenda libur atau penugasan yang akan tiba dalam waktu dekat.  
   * Ikon jam/jadwal hijau botol (`#DCFCE7` / `#166534`).  
   * Sub-label: *Terjadwal dalam periode depan*.

---

## 2.5 Bilah Saringan & Pencarian Komprehensif (Filter Bar)
Terletak tepat di atas tabel data:
* **Kolom Pencarian Teks Bebas:** Mencari berdasarkan nama karyawan, judul agenda, atau alasan penugasan.
* **Dropdown Jenis Catatan:** *Semua Jenis Catatan*, *Hari Libur Perusahaan*, *Dispensasi Dinas Luar*, *Dispensasi Eksekutif*.
* **Dropdown Status Periode:** *Semua Status Periode*, *Sedang Berlaku*, *Mendatang*, *Telah Berakhir*.
* **Dropdown Divisi / Unit:** *Semua Divisi / Unit*, *Seluruh Perusahaan*, *Engineering*, *Operations*, *Commercial*, *Executive*.
* **Tombol Reset:** Mengembalikan seluruh kriteria saringan ke posisi awal.

---

## 2.6 Tabel Data Induk Hari Libur & Dispensasi
Tabel menyajikan data secara terstruktur dan mudah dipindai mata:

1. **Kolom 1: Agenda / Konteks Kegiatan:**  
   Nama kegiatan/libur (teks tebal), disertai ID rujukan (`#EX-2026-XXXX`) dan ringkasan alasan penugasan.
2. **Kolom 2: Jenis Pengecualian:**  
   Lencana kategori (*Category Badge*):
   * `Hari Libur` (Biru Lembut)
   * `Dispensasi Dinas` (Ungu Lembut)
   * `Dispensasi Eksekutif` (Amber Lembut)
3. **Kolom 3: Berlaku Untuk:**  
   Menampilkan `Seluruh Kantor` (untuk libur), `Divisi [Nama]` (untuk divisi), atau `Nama Karyawan + Unit Kerja` (untuk dispensasi dinas/eksekutif).
4. **Kolom 4: Periode Berlaku:**  
   Rentang tanggal efektif (`12 Okt 2026 – 14 Okt 2026`) atau tanda `Berlaku Terbuka (Tanpa Batas Waktu)` untuk eksekutif.
5. **Kolom 5: Status Keberlakuan:**  
   Lencana status dinamis:
   * `Sedang Berlaku` (Hijau Segar)
   * `Akan Datang` (Biru Info)
   * `Periode Berakhir` (Abu-abu Netral)
6. **Kolom 6: Aksi:**  
   Seragam 3 tombol aksi di seluruh baris tabel: **`Detail`** (inspeksi modal lengkap), **`Edit`** (formulir pengubahan data), dan **`Hapus`** (konfirmasi penonaktifan atau hapus permanen).

---

## 2.7 Modal Dialog Tambah / Edit Terpadu

Ketika tombol `+ Tambah Hari Libur / Dispensasi` atau tombol `Edit` diklik, muncul dialog modal interaktif:

1. **Header Modal:**  
   Judul `Tambah Pengecualian Baru` / `Edit Pengecualian: [Nama Agenda]` dengan tombol silang `✕`.
2. **Pemilih Jenis Pengecualian (4 Kartu Radio Modern):**
   * *Opsi A: Hari Libur Resmi (Company Holiday)* $\rightarrow$ Otomatis mengunci cakupan ke seluruh kantor.
   * *Opsi B: Dispensasi Dinas (Individual Exemption)* $\rightarrow$ Memunculkan dropdown pemilih karyawan dengan tanggal berakhir berbatas.
   * *Opsi C: Dispensasi Divisi (Department Exemption)* $\rightarrow$ Memilih divisi/tim kerja penugasan.
   * *Opsi D: Dispensasi Eksekutif (Indefinite Role Exemption)* $\rightarrow$ Memilih peran struktural pimpinan/direksi dengan masa berlaku terbuka tanpa tanggal akhir.
3. **Field Nama Agenda / Konteks Kegiatan (Wajib):**  
   Input teks ringkas (contoh: *"Hari Libur Kemerdekaan"* atau *"Penugasan Audit Teknis Lapangan PT Bank Mandiri"*).
4. **Field Karyawan Terpilih (Kondisional):**  
   Dropdown karyawan (hanya aktif jika memilih tipe dispensasi individual).
5. **Field Rentang Tanggal Efektif:**  
   * *Tanggal Mulai (Wajib):* Pemilih tanggal mulai berlaku.
   * *Tanggal Berakhir:* Pemilih tanggal selesai, didukung kotak centang (*checkbox*):  
     **`[✓] Berlaku terbuka tanpa batas waktu akhir (Khusus Jabatan Eksekutif / Indefinite)`**. Jika dicentang, tanggal akhir otomatis dinonaktifkan.
6. **Field Uraian Konteks / Dasar Penugasan (Wajib Minimal 10 Karakter):**  
   Textarea penjelasan penugasan atau nomor surat tugas kantor.
7. **Footer Modal (Tombol Aksi):**  
   Tombol `Batal` dan Tombol `Simpan Pengecualian`. Begitu disimpan, data masuk ke penyimpanan persisten (*localStorage*), tabel disegarkan seketika, dan toast konfirmasi muncul.

---

## 2.8 Penanganan Akses Dibatasi (RBAC 403 Screen & Proteksi Sidebar)

Sesuai aturan arsitektur UI/UX Spec §2 & PRD §1, peran operasional di luar HRGA, Admin, dan CEO tidak memiliki menu maupun izin untuk membuka modul ini:

1. **Dinamika Menu Sidebar:**
   * **Staf (*Budi Pratama*):** Seluruh kelompok menu `Management` disembunyikan dari sidebar (hanya memiliki menu `Workspace`).
   * **Supervisor (*Ahmad Fauzan*) & Head (*Ayu Nirmala*):** Menu `Holiday / Exemption` dan `Compliance Queue` **disembunyikan dari section bar Management**, mencerminkan bahwa modul kepatuhan/dispensasi korporat bukan wewenang operasional unit kerja.
2. **Layar 403 Akses Dibatasi (Jika Rute Diakses Langsung):**
   * Panel data dan tabel disembunyikan seketika.
   * Tampil **Layar 403 Akses Dibatasi**:
     * Ikon perisai pembatasan wewenang.
     * Judul: `403 · Akses Dibatasi ([Nama Peran])`.
     * Penjelasan Kontekstual: Menginformasikan bahwa penetapan hari libur dan dispensasi perusahaan dikelola terpusat oleh HRGA & Administrator Sistem.
     * Tombol Aksi Relevan:
       * Untuk Supervisor / Head: `Buka Review Queue (Cuti Tim) ↗` (menuju `22-Correction-and-Leave-Review.html`).
       * Untuk Staf: `Buka My Leave Request ↗` (menuju `20-My Leave Request (Employee).html`).
       * Tombol kembali: `Beralih ke Akun HRGA (Simulasi)`.

---

## 2.9 Antarmuka Bersih & Ringkas (Bebas Catatan Penjelasan / Panduan In-App)

Sesuai prinsip desain sistem WorkPulse:
1. **Tidak Ada Banner / Kotak Edukasi di Antarmuka**: Seluruh kotak teks atau catatan kaki berbau tutorial/penjelasan (seperti *"Prinsip Batas Prosedur"* atau instruksi tata cara) ditiadakan dari tampilan sistem.
2. **Panduan Pengguna Terpisah**: Panduan teknis dan operasional untuk pengguna akan disusun dalam buku panduan (*user manual/guide*) tersendiri pasca-implementasi sistem selesai, sehingga antarmuka sistem murni difokuskan pada fungsionalitas kerja, efisiensi operasional, dan data operasional yang bersih tanpa polusi visual.

---

# BAGIAN 3: EVALUASI KONDISI KODE EKSISTING HALAMAN 12 (LANGKAH 3)

Berdasarkan audit mendalam terhadap berkas eksisting [`12-Exemption-Management.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/12-Exemption-Management.html) (yang saat ini hanya berukuran 193 baris kode kasar/terkompresi tanpa mengikuti standar desain WorkPulse terbaru), ditemukan kesenjangan (*gaps*) yang sangat masif dibandingkan dengan peta implementasi ideal pada Bagian 2:

| No | Aspek Komponen | Kondisi Kode Eksisting Halaman 12 Saat Ini | Susunan Peta Implementasi Ideal yang Seharusnya | Tingkat Kesenjangan & Dampak |
|---|---|---|---|---|
| **1** | **Arsitektur Kode & Desain Sistem** | Terdiri dari 193 baris kode CSS/JS kasar dengan variabel satu huruf (`r`, `b`, `t`). Tidak menggunakan variabel token warna, radius, dan tipografi modern yang seragam dengan Halaman 08–11. | Mengadopsi arsitektur modular standar industri dengan token CSS terpadu, tipografi Plus Jakarta Sans, kontras ramah mata, dan struktur bersih yang mudah dirawat. | **Kritis (Tampilan Usang & Ketinggalan Zaman)** |
| **2** | **Navigasi Sidebar & Tautan Menu** | Seluruh tautan menu menggunakan **tautan buntu tanda pagar (`href="#today"`, `href="#compliance"`, `href="#records"`)**. Pengguna terkunci dan tidak bisa berpindah halaman. Profil hardcoded kaku "Rina Puspita". | Tautan aktif 100% terhubung ke berkas prototipe nyata (`08-Pulse-Dashboard.html`, `11-Compliance-Queue-HRGA.html`, dll.). Profil dinamis sesuai sesi aktif. | **Kritis (Tautan Buntu / Deadlinks)** |
| **3** | **Simulator Peran (Role Switcher RBAC)** | **Tidak ada simulator peran sama sekali.** Topbar hanya memuat tombol dummy `♧` dan `HR`. Tidak bisa mendemonstrasikan pengujian antar-peran. | Memiliki dropdown simulator peran terpadu (Dewi Anggraeni, Ahmad Fauzan, Ayu Nirmala, dan Budi Pratama) di topbar dengan tombol refresh beranimasi dan toast. | **Tinggi (Tidak Dapat Diuji Antar-Peran)** |
| **4** | **Kartu Ringkasan Metrik (Summary Cards)** | Hanya memiliki 3 kartu angka statis (*Company Holidays*, *Individual Exemptions*, *Currently Effective*). Kartu bersifat pasif (tidak bisa diklik untuk memfilter tabel). | Memiliki **4 Kartu Ringkasan Interaktif (Click-to-Filter)** dengan penambahan kategori penting: *Pengecualian Jabatan Eksekutif (Indefinite)* dan penanda filter aktif. | **Tinggi (Kehilangan Fitur & Interaktivitas)** |
| **5** | **Pengecualian Jabatan Terbuka (FR-35 & BR-07)** | **Hilang sama sekali.** Sistem mewajibkan tanggal akhir selalu diisi (`required=""`). Tidak ada konsep pengecualian terbuka (*open-ended*) tanpa tanggal kedaluwarsa untuk CEO/Direksi. | Mendukung opsi **`Pengecualian Jabatan Terbuka (Indefinite Role Exemption)`** dengan checkbox khusus tanpa batas waktu akhir, melindungi akun eksekutif dari false No Submission. | **Kritis (Pelanggaran Spesifikasi PRD FR-35)** |
| **6** | **Bilah Saringan (Filter Bar)** | Hanya menyediakan pencarian teks dan dropdown jenis/status sederhana. Tidak ada filter Divisi/Unit dan tidak ada tombol Reset Saringan. | Menyediakan bilah saringan lengkap: Pencarian multi-parameter, Jenis Pengecualian, Status Keberlakuan, Pilihan Divisi, dan tombol Reset satu-klik. | **Sedang (Fleksibilitas Data Terbatas)** |
| **7** | **Tabel Data Induk Pengecualian** | Format tabel polos tanpa informasi unit kerja/divisi karyawan. Data contoh hanya 5 baris. Tombol aksi hanya ada "Lihat / Edit", tanpa opsi penonaktifan. | Tabel data profesional dengan lencana kategori berwarna semantik, kolom "Berlaku Untuk" yang jelas, rentang tanggal rapi, dan tombol aksi seragam (*Detail*, *Edit*, *Hapus*). | **Tinggi (Tampilan Mentah & Kurang Informatif)** |
| **8** | **Modal Dialog Tambah & Edit** | Desain modal sempit. Pilihan tipe hanya 2 radio button polos. Textarea tidak memiliki live character counter. Tidak ada validasi minimal 10 karakter. | Modal dialog modern dengan 3 kartu radio semantik (Holiday, Individual, Role Indefinite), pemilih dinamis karyawan, checkbox open-ended, dan counter karakter langsung. | **Tinggi (Form Kaku & Rentan Salah Input)** |
| **9** | **Penyimpanan Persisten (localStorage)** | Data hanya disimpan pada variabel array RAM lokal di memori browser. Begitu halaman di-refresh, seluruh perubahan data pengguna langsung hilang (*wiped out*). | Terintegrasi penyimpanan lokal persisten (`localStorage`) dengan manajemen versi data (`VERSION_KEY`), menjamin data demo tersimpan aman lintas reload peramban. | **Tinggi (Data Hilang Saat Refresh)** |
| **10** | **Proteksi Akses Karyawan (RBAC 403)** | **Nol proteksi hak akses.** Siapa pun yang membuka halaman ini dapat melihat dan mengedit kalender libur perusahaan. | Dilengkapi deteksi peran cerdas: Jika dibuka oleh peran Staf (*Budi Pratama*), tabel disembunyikan dan dialihkan ke **Layar Edukasi 403 Akses Dibatasi** dengan tombol kembali. | **Kritis (Celah Akses / Security Leak)** |

---

### Rangkuman Temuan Evaluasi (Gap Analysis)
Kode eksisting Halaman 12 saat ini masih berupa **kode purwarupa awal yang sangat mentah, tidak terhubung dengan halaman lain, belum mengimplementasikan aturan PRD mengenai Indefinite Role Exemption (FR-35), dan tidak memiliki sistem keamanan peran (RBAC 403)**.

Diperlukan perombakan menyeluruh (*comprehensive overhaul*) agar Halaman 12 mencapai standar keunggulan, estetika, dan keandalan sistem yang setara dengan Halaman 08, 09, 10, dan 11 yang telah kita sempurnakan.

---

# BAGIAN 4: RENCANA AKSI PERBAIKAN & REKONSTRUKSI HALAMAN 12 (LANGKAH 4)

Guna menjembatani seluruh kesenjangan pada Langkah 3 dan mewujudkan arsitektur antarmuka ideal pada Langkah 2, berikut adalah rencana aksi (*action plan*) rekonstruksi bertahap yang akan dieksekusi pada Langkah 5:

---

### Fase 1: Rekonstruksi Fondasi Tata Letak, Token CSS, & Sidebar Navigasi
1. Mengadopsi arsitektur modular standar industri lengkap dengan token CSS WorkPulse (`--brand: #00674D`, `--canvas: #F8FAFC`, radius, bayangan, tipografi Plus Jakarta Sans).
2. Memperbaiki seluruh navigasi sidebar: mengeliminasi 100% tautan buntu tanda pagar (`href="#..."`) dan menghubungkannya ke berkas prototipe nyata:
   * *Pulse Dashboard* $\rightarrow$ `08-Pulse-Dashboard.html`
   * *Blocker Queue* $\rightarrow$ `09-Blocker-Escalation-Queue.html`
   * *Coaching Notes* $\rightarrow$ `10-Manager-Note-Coaching-Record.html`
   * *Compliance Queue* $\rightarrow$ `11-Compliance-Queue-HRGA.html`
   * *Holiday / Exemption* $\rightarrow$ `12-Exemption-Management.html` (Aktif)
3. Mengimplementasikan sidebar drawer responsif dengan tombol toggle mobile dan backdrop overlay redup.
4. Menghubungkan profil pengguna di pojok kiri bawah secara dinamis sesuai sesi peran yang aktif.

---

### Fase 2: Standarisasi Topbar & Simulator Peran Lintas Hirarki (RBAC)
1. Menyusun breadcrumb navigasi: `Workspace / Manajemen / Kelola Hari Libur & Dispensasi`.
2. Mengintegrasikan dropdown simulator peran (`#quickRoleSwitcher`) di topbar terkelompok dalam *optgroup*:
   * **Pengelola Berwenang (Akses Penuh):** `Dewi Anggraeni` (HRGA Specialist) & `Hendra Wijaya` (System Administrator).
   * **Manajemen Eksekutif (Mode Pantau):** `Rian Suryadi` (CEO / Direktur · Read-Only).
   * **Peran Operasional (Simulasi 403 Dibatasi):** `Ahmad Fauzan` (Supervisor Engineering), `Ayu Nirmala` (Head of Department), dan `Budi Pratama` (Staff Developer).
3. Menambahkan tombol refresh (`#refreshBtn`) beranimasi putaran halus $360^\circ$ selama 0,5 detik disertai toast notifikasi keberhasilan sinkronisasi.
4. Menambahkan ikon lonceng notifikasi dan avatar pengguna terpadu.

---

### Fase 3: Rekonstruksi Area Judul & Lencana Cakupan Wewenang
1. Memperbarui Judul Halaman (H1) menjadi: `Kelola Hari Libur & Dispensasi Tim`.
2. Menyusun subjudul edukatif yang lugas tanpa kebocoran kode pengembang teknis.
3. Menggantikan *eyebrow* lama dengan **Solid Card Scope Badge** berlatar putih bersih:  
   `CAKUPAN WEWENANG: Seluruh Perusahaan · HRGA Scope`.
4. Menyediakan tombol aksi utama mencolok: `+ Tambah Hari Libur / Dispensasi` untuk memicu modal pembuatan.

---

### Fase 4: Pembangunan 4 Kartu Ringkasan Metrik (Click-to-Filter)
1. Merancang 4 kartu ringkasan bergrid simetris:
   * **Kartu 1 (Biru):** `Hari Libur Resmi` (Total hari libur perusahaan).
   * **Kartu 2 (Ungu):** `Dispensasi Aktif` (Karyawan bertugas dinas/offsite hari ini).
   * **Kartu 3 (Amber):** `Pengecualian Jabatan` (Penegakan FR-35: Akun CEO/Direksi berstatus bebas permanen).
   * **Kartu 4 (Hijau):** `Jadwal Mendatang` (Agenda libur/dinas yang akan datang).
2. Mengimplementasikan fitur **Click-to-Filter dua arah**:
   * Mengklik kartu otomatis menyaring baris tabel yang bersesuaian.
   * Memberikan efek visual batas aktif (*active filter border*) pada kartu yang dipilih.
   * Mendukung navigasi keyboard (*Enter / Space*).

---

### Fase 5: Pembangunan Bilah Saringan & Pencarian Lengkap
1. Menyediakan kolom input pencarian teks langsung untuk nama karyawan, judul agenda, atau alasan penugasan.
2. Menyediakan dropdown saringan kategori jenis catatan:
   * *Semua Jenis*, *Hari Libur Perusahaan*, *Dispensasi Tugas Lapangan*, *Pengecualian Jabatan (Terbuka)*.
3. Menyediakan dropdown status periode:
   * *Semua Periode*, *Sedang Berlaku (Aktif)*, *Akan Datang (Mendatang)*, *Telah Berakhir*.
4. Menyediakan dropdown saringan unit kerja / divisi.
5. Menambahkan tombol reset saringan satu-klik (`🔄 Reset`) yang mengembalikan seluruh kriteria ke kondisi default.

---

### Fase 6: Penyempurnaan Tabel Data Induk & Mock Data Realistis
1. Menyusun struktur kolom tabel:
   * *Agenda / Konteks Kegiatan & ID Rujukan*
   * *Jenis Pengecualian (Lencana Semantik)*
   * *Berlaku Untuk (Seluruh Kantor / Divisi / Karyawan)*
   * *Periode Berlaku (Rentang Tanggal / Status Terbuka)*
   * *Status Periode (Aktif / Mendatang / Berakhir)*
   * *Aksi Seragam 3 Tombol (Detail | Edit | Hapus)*
2. Menyediakan 7–8 dataset contoh representatif yang mencakup:
   * Hari Libur Nasional (Kemerdekaan RI, Tahun Baru).
   * Cuti Bersama Resmi Perusahaan (SKB 3 Menteri).
   * Penugasan Dinas Luar Kota Karyawan (misal: Raka Aditya, Dina Maharani, Hendra Gunawan).
   * Pengecualian Terbuka Jabatan Eksekutif (CEO: Budi Santoso).
3. Mengimplementasikan animasi kilap kuning (*highlight*) selama 2 detik pada baris tabel yang baru saja diperbarui.
4. Menyediakan tampilan *Empty State* yang ramah jika hasil saringan nihil.

---

### Fase 7: Pembangunan Modal Dialog Tambah, Edit, Detail, & Konfirmasi
1. Merancang modal dialog modern dengan latar redup (*backdrop blur*).
2. Menyediakan **Kartu Radio Pemilih Kategori (4 Kategori Resmi)**:
   * `Hari Libur Resmi` $\rightarrow$ Mengunci cakupan ke seluruh kantor.
   * `Dispensasi Dinas` $\rightarrow$ Menampilkan dropdown pemilih karyawan dengan tanggal berakhir berbatas.
   * `Dispensasi Divisi` $\rightarrow$ Menampilkan dropdown pemilih departemen/divisi dengan tanggal berakhir berbatas.
   * `Dispensasi Eksekutif` $\rightarrow$ Mode pimpinan terbuka (*indefinite*); otomatis menyembunyikan input tanggal berakhir secara bersih tanpa kotak teks tambahan yang membebani form.
3. Menyediakan kontrol tanggal efektif:
   * Input *Tanggal Mulai (Wajib)*.
   * Input *Tanggal Berakhir* (otomatis disembunyikan jika memilih `Dispensasi Eksekutif`).
4. Menyediakan textarea uraian konteks resmi dengan *live character counter* dan validasi wajib minimal 10 karakter.
5. **Modal Konfirmasi Custom (`#confirmModal`)**: Menggantikan dialog native `window.confirm()` dengan konfirmasi modern yang membedakan antara *Hapus Permanen* (untuk data masa depan / draft) dan *Nonaktifkan* (untuk data aktif / berulang agar rekam jejak audit evaluasi FR-46 tetap utuh).
6. **Modal Detail Informasi Pengecualian (`#detailModal`)**: Menampilkan seluruh data pengecualian secara lengkap, bersih, dan transparan tanpa elemen dekorasi yang tidak perlu:
   * **Header Agenda**: Judul Agenda Pengecualian, ID Rujukan Sistem, serta lencana semantik Jenis Pengecualian & Status Periode.
   * **Tabel Informasi Terstruktur**:
     - **Berlaku Untuk**: Target penerima (nama karyawan, divisi, atau seluruh kantor) beserta lingkup penugasannya.
     - **Periode Berlaku**: Rentang tanggal efektif dan keterangan durasi kalender/berlaku terbuka.
     - **Dasar Pengecualian**: Menampilkan seluruh alasan resmi, dasar hukum, nomor SK, SPK, atau surat tugas secara utuh tanpa terpotong.
   * **Informasi Jejak Audit**: Stempel waktu penerbitan, petugas pembuat, riwayat perubahan, atau catatan penonaktifan.
   * **Tombol Aksi**: Tombol pintas `Edit Catatan` (khusus peran HRGA/Admin) dan tombol `Tutup`.
7. Mengintegrasikan tombol simpan dengan penyimpanan persisten dan notifikasi toast.

---

### Fase 8: Penerapan Sistem Keamanan Peran (Layar RBAC 403 & Mode Pantau Eksekutif)
1. Mengintegrasikan logika proteksi wewenang pada modul sesuai PRD & PDD:
   * **Pengelola Berwenang (*Dewi Anggraeni* / *Hendra Wijaya*):**
     * Akses penuh ke seluruh tabel, tombol `+ Tambah Hari Libur / Dispensasi` aktif, dan aksi baris memuat `[Detail] [Edit] [Hapus]`.
   * **Manajemen Eksekutif (*Rian Suryadi - CEO / Direktur*):**
     * Akses pantau terbuka ke seluruh entri kalender & dispensasi korporat.
     * Tombol `+ Tambah Hari Libur / Dispensasi` disembunyikan.
     * Lencana `Mode Pantau Eksekutif (Hanya Baca)` ditampilkan.
     * Aksi tabel hanya memunculkan tombol `Detail` (tanpa tombol Edit atau Hapus).
   * **Peran Operasional Luar Wewenang (*Ahmad Fauzan*, *Ayu Nirmala*, *Budi Pratama*):**
     * Menu `Holiday / Exemption` otomatis disembunyikan dari section bar Management (dan seluruh grup Management disembunyikan untuk staf).
     * Jika rute URL dibuka langsung, seluruh panel data disembunyikan dan sistem menampilkan **Layar 403 Akses Dibatasi**:
       * Ikon perisai pembatasan wewenang dan judul `403 · Akses Dibatasi ([Nama Peran])`.
       * Penjelasan kontekstual mengenai batas wewenang modul dan rute yang benar.
       * Tombol aksi pengalihan: `Buka Review Queue (Cuti Tim) ↗` bagi Supervisor/Head, atau `Buka My Leave Request ↗` bagi Staf.
       * Tombol pintas simulasi: `Beralih ke Akun HRGA (Simulasi)`.

---

### Fase 9: Eliminasi Catatan Penjelasan / Edukasi In-App
1. Menjaga antarmuka tetap bersih, profesional, dan fokus pada data fungsional tanpa elemen catatan kaki edukatif atau kotak tutorial.
2. Seluruh panduan operasional pengguna dialokasikan ke dokumen panduan (*user manual*) terpisah yang disusun setelah sistem selesai dikembangkan.

---

### Fase 10: Integrasi Penyimpanan Persisten (localStorage) & Stempel Audit
1. Mengikat seluruh siklus CRUD ke `localStorage` dengan kunci:
   * `DATA_KEY = 'workpulse_exemption_records_v3'`
   * `VERSION_KEY = 'workpulse_exemption_app_version'`
2. Merekam stempel waktu resmi Indonesia (`DD Mmm YYYY · HH:mm WIB`) serta nama petugas pembuat/pengubah pada setiap transaksi data.

*Halaman 12 telah melalui rekonstruksi menyeluruh dan lulus audit integritas 5 Dimensi: Dimensi 1 (Redaksi Teks & Terminologi), Dimensi 2 (Keselarasan Aturan Bisnis & Logika Sistem), Dimensi 3 (Estetika Visual, Tata Letak, & Kerapian Antarmuka), Dimensi 4 (Interaktivitas & Kenyamanan Alur Pengguna), serta Dimensi 5 (Pembatasan Hak Akses / RBAC, Keamanan, & Tautan Lintas Halaman).*

---

# BAGIAN 5: KETERKAITAN DATA DENGAN HALAMAN LAIN (CROSS-PAGE CONTRACTS)

Halaman 12 berfungsi sebagai basis data aturan pengecualian terpusat yang melindungi keadilan sistemik di seluruh modul operasional WorkPulse:

| Halaman Terkait | Bentuk Keterkaitan & Aliran Data |
|---|---|
| **Halaman 01 (Login)** | Menerima pengalihan peran `HRGA` (Dewi Anggraeni) dan `Administrator` (Hendra Wijaya), serta mengisolasi staf dan supervisor luar wewenang via Layar 403. |
| **Halaman 02 (Morning Commitment)** | Menyuplai status dispensasi aktif yang memunculkan *Exemption Banner* hijau di atas formulir komitmen pagi karyawan terkait. |
| **Halaman 08 (Pulse Dashboard)** | Membaca master kalender hari libur dan dispensasi dinas sehingga karyawan berizin resmi tidak keliru dihitung sebagai mangkir pada histogram dan widget keandalan. |
| **Halaman 11 (Compliance HRGA)** | Menjadi acuan validasi absolut (AC-46 & BR-07) agar karyawan dengan dispensasi sah tidak memicu pencatatan event *No Submission* atau *Pattern Flag*. |
| **Halaman 15 (Admin Mapping)** | Menggunakan daftar master personil, fungsi divisi, dan peran struktural untuk penetapan target dispensasi individual maupun dispensasi divisi. |

---

# BAGIAN 6: STATUS KESIAPAN & VERIFIKASI AKHIR SISTEM (LANGKAH 5)

Seluruh spesifikasi pada berkas [`12-Exemption-Management.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/12-Exemption-Management.html) telah teruji secara visual dan fungsional di lingkungan peramban modern, bebas error, serta siap diintegrasikan penuh ke dalam arsitektur backend:
1. **Dukungan 4 Kategori Pengecualian Resmi:** Hari Libur Resmi, Dispensasi Dinas Individual, Dispensasi Divisi, dan Dispensasi Eksekutif Terbuka (*Indefinite*).
2. **Penerapan Langsung Tanpa Birokrasi:** Mutasi data langsung aktif seketika tanpa antrean persetujuan atasan (FR-46 & AC-45).
3. **Penyaringan Multi-Parameter & Click-to-Filter:** 4 kartu metrik dan filter bar menyaring data secara instan tanpa reload halaman.
4. **Proteksi Wewenang RBAC & Layar 403:** Membatasi hak edit hanya untuk HRGA/Admin, mode pantau read-only untuk CEO, dan proteksi 403 bagi peran lainnya.


