# Penjelasan Halaman 15: Pemetaan Struktur Organisasi & Kewenangan Proyek (Admin: Organizational Mapping)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi antarmuka ideal untuk **Halaman 15: Pemetaan Struktur Organisasi & Kewenangan Proyek (`15-Admin-Organizational-Mapping.html`)** pada sistem **WorkPulse**.

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY (LANGKAH 1)

## 1.1 Maksud, Filosofi & Tujuan Halaman 15

Halaman ini merupakan **Pusat Pengelolaan Data Induk Organisasi (*Organization Master Data & Authority Center*)** yang dirancang khusus bagi **System Administrator**, **HRGA / People Admin Berwenang**, dan **Manajemen Berwenang (Direksi / Pimpinan Operasional)**.

Dalam sistem WorkPulse, struktur organisasi bukan sekadar bagan formal, melainkan **fondasi penentu alur akuntabilitas harian dan jalur eskalasi kendala kerja**:
1. **Atasan Langsung (*Direct Manager*)** menentukan kepada siapa komitmen harian dilaporkan, siapa yang berhak memberikan catatan pembinaan (*Coaching Note*), dan siapa yang menjadi penanggung jawab awal kendala operasional (*Organizational Authority*).
2. **Fungsi Organisasi (*Organization Function*)** menentukan panduan pengisian komitmen harian (*Role-Based Prompt Hint*) dan klasifikasi pelaporan divisi.
3. **Kewenangan Proyek (*Project Authority*)** menentukan penanggung jawab kendala yang terikat pada inisiatif/proyek tertentu, terlepas dari hierarki struktural divisi karyawan.

### Prinsip Utama Sesuai Spesifikasi Produk (PDD §5, §6, §8; PRD §1, §3.1, §3.5; UI/UX Spec §4.15 & UF-40):
1. **Penanggalan Efektif Mutlak (*Strict Effective-Dated Governance - FR-23, NFR-08*):**
   * Setiap penambahan, mutasi divisi, promosi jabatan, pergantian atasan langsung, maupun penetapan kewenangan proyek **WAJIB menyertakan Tanggal Berlaku Efektif (*Effective Date*)**.
   * Perubahan tidak terjadi di ruang hampa; sistem wajib mengetahui dengan pasti mulai kapan susunan hierarki baru tersebut berlaku sah di perusahaan.
2. **Integritas Akuntabilitas Masa Lalu Tak Boleh Dirusak (*Historical Accountability Preservation - FR-24, AC-11, AC-54*):**
   * **DILARANG KERAS menimpa atau menghapus riwayat penugasan lama (*zero hard overwrite/deletion*)**.
   * Data komitmen harian, tinjauan risiko, pelaporan kendala (*blocker*), dan catatan pembinaan (*coaching record*) di masa lampau **selalu merujuk pada atasan langsung dan divisi yang sah pada tanggal kejadian**, bukan struktur jabatan terkini.
   * *Contoh:* Jika Budi Pratama berpindah divisi dari Engineering ke Delivery per 1 Oktober 2026 di bawah atasan baru Hendra Wijaya, seluruh rekaman komitmen dan kendala Budi pada bulan Agustus 2026 tetap menampilkan atasan lamanya (Ayu Nirmala di Engineering), bukan atasan barunya.
3. **Pratinjau Dampak Sebelum Penyimpanan (*Mandatory Impact Preview - UI/UX Spec §4.15 & UF-40*):**
   * Mengubah atasan langsung seorang pimpinan atau memutasi pejabat kunci akan berdampak langsung pada rantai pelaporan seluruh bawahannya.
   * Oleh karena itu, sebelum perubahan penugasan disimpan ke basis data, sistem **WAJIB menampilkan Dialog Pratinjau Dampak (*Impact Preview Modal*)** yang memperlihatkan daftar bawahan yang ikut terdampak beserta tanggal mulai berlakunya.
4. **Pemisahan Tegas Antara Struktur Organisasi dan Kewenangan Proyek (UI/UX Spec §4.15):**
   * **Kewenangan Proyek (*Project Authority*) BUKAN satu kolom teks tunggal di baris profil karyawan.**
   * Kewenangan proyek dikelola sebagai **pemetaan independen (*independent mapping*) per personil**.
   * Satu orang personil dapat memegang lebih dari satu kewenangan proyek aktif sekaligus untuk proyek/inisiatif yang berbeda (misal: Ardi Pratama menjadi *Project Lead* di Proyek Portal sekaligus *Project Sponsor* di Proyek Inti), tanpa mengubah atau menggantikan atasan langsung strukturalnya di divisi.
5. **Tata Kelola Akun Terpusat Tanpa Pendaftaran Mandiri Publik (*No Public Self-Registration - FR-50, FR-54, AC-34*):**
   * Seluruh akun karyawan dan penugasan perannya dibuat dan dikelola oleh Administrator melalui data induk organisasi ini.
   * Tidak ada tautan pendaftaran mandiri untuk umum. Karyawan baru diundang melalui token aktivasi resmi yang aman.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Berdasarkan dokumen spesifikasi PRD §1 (Tabel 1.0) dan UI/UX Spec §2:

| Peran (*Role*) | Contoh Pengguna | Hak Akses Halaman 15 | Keterangan & Batasan Wewenang |
|---|---|---|---|
| **System Administrator** | Administrator Sistem | **Akses Penuh Kelola (*Full Master Data Admin*)** | **Aktor Utama.** Mengelola seluruh entitas personil, pemetaan divisi, atasan langsung, master proyek, dan penugasan kewenangan proyek berpenanggalan efektif. |
| **HRGA / People Admin** | Siti Rahma (HRGA) | **Akses Kelola Penugasan (*HR Operations*)** | Mengelola mutasi divisi karyawan, pembaruan atasan langsung, pencatatan tanggal efektif kepegawaian, serta penerbitan undangan akun baru. |
| **Direksi / Management** | Rian Suryadi (CEO) | **Akses Tinjau & Otorisasi (*Executive Governance*)** | Meninjau seluruh bagan organisasi aktif, riwayat mutasi pejabat kunci, serta memberikan persetujuan restrukturisasi organisasi. |
| **Kepala Divisi (Head)** | Ayu Nirmala (Head Eng) | **Akses Dibatasi (Read-Only / Melalui Pulse Dashboard)** | Memantau struktur tim di bawah divisinya melalui dashboard; tidak memiliki hak administratif mengubah data induk seluruh perusahaan. |
| **Project Manager (PM)** | Ardi Pratama (PM) | **Akses Dibatasi (Khusus Proyeknya)** | Meninjau kewenangan proyek binaannya di menu Project Risk; tidak mengelola master data organisasi global. |
| **Karyawan Biasa / Staf** | Budi Pratama (Staf) | **Akses Ditolak (403 Forbidden)** | **Menu disembunyikan.** Akses URL langsung ke `/admin/organization` ditolak dan dialihkan ke `/today` (Halaman 02). |

---

## 1.3 User Story & Kriteria Penerimaan Resmi (Acceptance Criteria)

### A. User Story Terkait (PRD §2 & UI/UX Spec §7 UF-40)
* **US-24 (Sebagai Admin / Manajemen Berwenang):**  
  *"Sebagai Admin/Management berwenang, saya ingin mengubah struktur organisasi (person, role, direct manager, project authority) tanpa merusak histori accountability, agar perubahan organisasi riil tidak mendistorsi data masa lalu."*
* **US-22 (Sebagai System Admin):**  
  *"Sebagai System Admin, saya ingin mengelola data induk organisasi dan penugasan peran secara terpusat, agar sistem beroperasi sesuai dinamika struktur kerja nyata."*
* **US-31 (Sebagai Karyawan Baru):**  
  *"Sebagai karyawan, saya ingin mengaktifkan akun melalui undangan yang aman dan terikat pada akun yang dibuat Admin, agar saya dapat masuk tanpa self-registration publik."*
* **UF-40 (Alur Pemetaan Struktur Organisasi Berpenanggalan Efektif):**  
  *"Admin membuka rute `/admin/organization`, meninjau struktur aktif saat ini, memilih karyawan untuk mutasi/perubahan atasan, mengisi tanggal berlaku efektif dan alasan perubahan, menelaah pratinjau dampak bawahan, lalu mengonfirmasi penyimpanan dengan jejak historis yang tetap utuh."*

### B. Kriteria Penerimaan Resmi (Acceptance Criteria)
* **FR-01 & FR-02 (Snapshot Konteks Organisasi):**  
  Sistem memetakan peran dan fungsi per karyawan. Setiap rekaman akuntabilitas harian menyimpan snapshot organisasi (peran, divisi, atasan langsung) yang sah pada tanggal tersebut.
* **FR-22 & AC-54 (Kewenangan CRUD Master Data):**  
  Admin/Management berwenang dapat menambah, mengubah, mengaktifkan, menonaktifkan, dan menetapkan ulang person, role, function, direct manager, dan project authority.
* **FR-23 & AC-11 (Penanggalan Efektif & Anti-Overwrite):**  
  Setiap perubahan penugasan disimpan dengan **Effective Date** dan opsional **End Date**. Riwayat penugasan masa lalu tidak boleh dihapus atau ditimpa. Data sebelum tanggal efektif wajib tetap menampilkan konteks organisasi lama.
* **FR-24 (Konteks Historis Masa Lalu):**  
  Laporan dan riwayat akuntabilitas masa lalu selalu merujuk pada penugasan yang aktif pada tanggal kejadian tersebut.
* **AC-15 & NFR-06 (Jejak Audit Kekal / Immutable Audit Trail):**  
  Setiap perubahan struktur organisasi menghasilkan jejak audit yang mencatat: nama aktor pengubah, jenis aksi, stempel waktu (*timestamp*), alasan perubahan (*reason*), serta nilai sebelum dan sesudah (*before / after values*).
* **AC-46 & AC-58 s.d. AC-61 (Kewenangan Proyek Independen):**  
  Kewenangan proyek dapat dipilih untuk pelaporan kendala pada konteks proyek tertentu tanpa mengubah atasan langsung atau penugasan organisasi karyawan. Sistem memvalidasi keaktifan penugasan proyek pada tanggal kejadian.

---

## 1.4 Taksonomi Data Resmi & Arsitektur Fleksibilitas Organisasi (PT Duta Media Solusindo)

Sesuai dokumen baseline PDD §5, §6 dan PRD §1.1 serta mandat FR-22, data induk pada Halaman 15 memisahkan secara tegas antara **Tingkat Akses Sistem (System RBAC Tier)**, **Jabatan / Posisi Kerja Organisasi (Flexible Functional Role / Job Title)**, dan **Divisi Dinamis Terkonfigurasi (Configurable Divisions)**:

### A. Divisi / Fungsi Organisasi Dinamis (*Configurable Functions & Divisions - FR-22*)
Sistem menyediakan daftar divisi standar bawaan (*canonical baseline*) yang dapat ditambahkan dan dikonfigurasi secara dinamis oleh Admin melalui modal penambahan divisi tanpa mengubah struktur basis data:
1. **Engineering:** Divisi pengembangan perangkat lunak (Lead, Backend, Frontend, Fullstack, Mobile Developer, QA).
2. **Operations & Infrastructure (Ops & Infra):** Divisi infrastruktur server, jaringan, DevOps, dan operasional teknis.
3. **Quality:** Fungsi penjaminan kualitas independen (QA Lead, QC Specialist, Automation Engineer).
4. **Delivery:** Divisi manajemen proyek dan pengiriman solusi ke klien (Project Manager, Technical PM).
5. **Sales Enablement & Presales:** Divisi komersial, proposal teknis, solusi bisnis, dan kemitraan.
6. **Finance:** Divisi administrasi keuangan, penagihan (*invoicing*), pajak, dan akuntansi perusahaan.
7. **HRGA:** Divisi sumber daya manusia, kepatuhan personalia (*people operations*), dan urusan umum.
8. **Executive:** Khusus bagi Direksi, Dewan Komisaris, dan Pimpinan Tertinggi Organisasi.
9. **Divisi Baru Tambahan (Dinamis / User-Defined):** Contohnya divisi *Product & Design* (`DIV-PRO-DES`), *Data & AI Research* (`DIV-DAT-AIR`), dll. yang dapat dibuat sewaktu-waktu oleh Admin melalui antarmuka resmi.

### B. Pemisahan Peran Sistem (RBAC) vs Jabatan Organisasi (*Role vs Job Title Separation*)
Sistem memisahkan secara tegas antara hak otorisasi komputasi (*System Authorization*) dan identitas fungsional nyata (*Organizational Position*):
1. **Tingkat Akses Sistem Baku (*System RBAC Tiers - PRD §1*):**
   * Menentukan batas kewenangan menu, dashboard, matriks eskalasi tiket blocker, dan otorisasi persetujuan:
   * `Employee` (Karyawan Biasa / Staf Pelaksana)
   * `Supervisor / TL` (Technical Lead / Supervisor Operasional)
   * `Head` (Kepala Divisi / Function Owner)
   * `PM` (Project Manager)
   * `HRGA` (People / Compliance Admin)
   * `CEO / Management` (Direksi / Pimpinan Tertinggi)
   * `System Admin` (Administrator Pengelola Sistem)
2. **Jabatan / Posisi Kerja Organisasi (*Flexible Functional Role / Job Title*):**
   * Bersifat bebas dan dapat disesuaikan 100% dengan kebutuhan operasional perusahaan (contoh: *Lead UI/UX Designer*, *Senior Backend Engineer*, *Scrum Master*, *QA Automation Lead*, *Finance Specialist*, dll.).
   * Dilengkapi fitur rekomendasi saran pintar (*smart datalist suggestions*) tanpa membatasi admin untuk mengetikkan nama posisi jabatan spesifik baru.
   * Ditampilkan secara dominan pada tabel struktur organisasi dan linimasa karir, didampingi pill peran sistem di bawahnya.

### C. Klasifikasi Peran Kewenangan Proyek (*Project Authority Roles*)
1. **Pimpinan Proyek (Project Lead / PM):** Otoritas utama pengambil keputusan dan penanggung jawab pengiriman proyek.
2. **Penanggung Jawab Keahlian / Lead Spesialis:** Otoritas teknis/arsitektur utama pada inisiatif proyek.
3. **Penanggung Jawab Mitra / Klien (PIC Eksternal):** Penghubung dan penanggung jawab urusan pemangku kepentingan luar.
4. **Pengarah / Penjamin Proyek (Project Sponsor):** Pimpinan tingkat tinggi penjamin ketersediaan anggaran dan prioritas strategis proyek.

---

# BAGIAN 2: PETA IMPLEMENTASI IDEAL SESUAI PEDOMAN KONSISTENSI (LANGKAH 2)

Bagian ini memetakan bagaimana seluruh kebutuhan, alur, aturan, dan user story di atas **seharusnya diimplementasikan secara ideal, sempurna, dan konsisten** pada Halaman 15, mengacu penuh pada [Pedoman Konsistensi Desain dan Perilaku Lintas Halaman](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md).

---

## 2.1 Arsitektur Shell Halaman & Header Baku

### A. Topbar Breadcrumb
* Format baku: `Manajemen / Pemetaan Struktur Organisasi & Kewenangan Proyek`
* Menggunakan tautan breadcrumb yang tenang, lugas, dan konsisten dengan seluruh halaman administrasi.

### B. Page Heading & Deskripsi Pengarah
* **Judul Utama (`h1`):** `Pemetaan Struktur Organisasi & Kewenangan Proyek`
* **Deskripsi Pengarah:**  
  *Kelola penugasan struktur organisasi dan kewenangan proyek beserta riwayat perubahannya.*
* **Kicker Header:** Ditiadakan agar tata letak header tampil tenang, bersih (*Calm UI*), dan bebas dari kebisingan visual (*zero clutter*).

### C. Tombol Aksi Header Kanan (*Quick CTA Header*)
Di pojok kanan atas sejajar dengan judul, disediakan 2 tombol aksi utama yang beradaptasi dengan konteks tab:
1. **Tombol Sekunder:** `+ Daftarkan Proyek Baru` (membuka modal pendaftaran master proyek).
2. **Tombol Primer:** `+ Ubah Penugasan Organisasi` (membuka modal mutasi/penugasan berpenanggalan efektif).

---

## 2.2 4 Kartu Metrik Ringkasan Terpadu (*Single-Row 4-Metric Grid*)

Berada tepat di bawah header halaman, menyajikan ringkasan kapasitas organisasi dalam 1 baris seimbang (4 kolom di desktop):

| No | Nama Kartu Metrik | Nilai Default | Palet Warna | Fungsi & Interaktivitas |
|---|---|---|---|---|
| 1 | **Total Personil**<br><small style="color:#667085;">Terdaftar dalam sistem</small> | `10` Personil | Netral Slate (`#101828`) | Menampilkan jumlah seluruh karyawan yang terdaftar dalam sistem organisasi. Mengklik kartu ini memfokuskan daftar personil di Tab 1. |
| 2 | **Penugasan Aktif**<br><small style="color:#667085;">Terpetakan dalam struktur organisasi</small> | `10` Penugasan | Hijau Brand (`#0F5338`) | Menampilkan jumlah personil yang terpetakan dalam struktur penugasan organisasi aktif (termasuk pimpinan tertinggi/Direktur). Mengklik kartu ini memfokuskan daftar penugasan aktif di Tab 1. |
| 3 | **Proyek Aktif**<br><small style="color:#667085;">Sedang berjalan saat ini</small> | `3` Proyek | Biru Status (`#175CD3`) | Menampilkan inisiatif/proyek yang sedang berjalan saat ini sebagai rujukan resmi perusahaan. Mengklik kartu ini otomatis berpindah ke **Tab 2 (Direktori Proyek)**. |
| 4 | **Kewenangan Proyek**<br><small style="color:#667085;">Penanggung jawab proyek aktif</small> | `5` Penugasan | Amber Status (`#B45309`) | Menampilkan total penugasan penanggung jawab proyek yang aktif diemban personil. Mengklik kartu ini otomatis berpindah ke **Tab 3 (Kewenangan Proyek)**. |

---

## 2.3 Arsitektur 3 Tab Navigasi Utama (*Tab-Based Master View*)

Untuk mencegah tabel raksasa yang bercampur aduk, antarmuka dibagi menjadi **3 Tab Utama** yang terstruktur rapi:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [Tab 1: Struktur Organisasi (10)]   [Tab 2: Direktori Proyek (3)]   [Tab 3: Kewenangan Proyek (5)] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### TAB 1: STRUKTUR ORGANISASI (*ORGANIZATIONAL ASSIGNMENT*)
Menjadi tab default saat halaman pertama kali dibuka.

1. **Header Panel & Tombol Aksi Primer:**
   * **Judul Panel:** `Struktur Organisasi`
   * **Deskripsi Subtitle:** `Daftar penugasan personil, divisi, dan atasan langsung beserta riwayat masa berlakunya.`
   * **Tombol Aksi Tab 1:**
     * `+ Tambah Divisi` (`#btnAddDivision`): Membuka Modal Tambah Divisi Baru (`#modalAddDivisionBackdrop`) untuk konfigurasi divisi dinamis (FR-22).
     * `+ Tambah Personil ke Struktur` (`#btnAddPersonOrg`): Membuka Modal Pendaftaran Personil Baru (`#modalAddPersonBackdrop`) sesuai mandat PRD FR-22, FR-23, FR-50, dan FR-54.
   * *Tombol Aksi Header Global:* Di samping judul halaman terdapat `Tetapkan Penugasan Organisasi` (atau `Ubah Penugasan Organisasi`) untuk mutasi/penugasan global, serta tombol aksi `Ubah` dan `Riwayat` di setiap baris tabel.
2. **Toolbar & Single-Row Filter Bar:**
   * **Kotak Pencarian:** Input pencarian teks instan untuk nama atau ID personil (`#searchOrgPerson`).
   * **Dropdown Filter Divisi / Fungsi:** Terisi dinamis secara otomatis dari basis data divisi (`localStorage: workpulse_divisions_v3`), mencakup divisi kanonikal serta divisi dinamis kustom (misal: *Product & Design*).
   * **Dropdown Filter Peran Sistem:** Menyaring berdasarkan hak akses peran sistem (`Semua Peran`, `Employee`, `Supervisor / TL`, `Head`, `PM`, `HRGA Admin`, `CEO / Management`, `System Admin`).
   * **Dropdown Filter Status Penugasan:** Menyaring kondisi masa berlaku (`Semua Status`, `Aktif Saat Ini`, `Riwayat / Telah Berakhir`).
   * **Tombol Reset Filter:** Mengembalikan filter ke kondisi awal (`search = ''`, `divisi = all`, `peran = all`, `status = active`) dalam 1 klik.
3. **Tabel Struktur Organisasi (Format Baku 6 Kolom):**
   * **Kolom 1: Karyawan:** Menampilkan Avatar Inisial, Nama Lengkap tebal, dan ID Karyawan abu-abu di bawahnya (mengikuti hierarki 3-baris baku).
   * **Kolom 2: Jabatan & Peran:** Menampilkan Jabatan Fungsional Organisasi tebal di baris atas (misal: *Lead UI/UX Designer*, *Senior Backend Engineer*) dan pill Tingkat Akses Peran Sistem di baris bawah (misal: `Supervisor / TL`, `Employee`).
   * **Kolom 3: Fungsi / Divisi:** Menampilkan badge nama fungsi resmi (misal: `Engineering`, `Product & Design`).
   * **Kolom 4: Atasan Langsung (*Direct Manager*):**  
     * Menampilkan nama atasan langsung yang menjadi penanggung jawab akuntabilitas karyawan.
     * Jika personil adalah pucuk pimpinan (Direktur Utama / CEO), kolom menampilkan label tenang: *Dewan Komisaris / Pucuk Pimpinan (Tidak Ada Atasan Langsung)*.
   * **Kolom 5: Mulai Berlaku (*Effective Date*):** Menampilkan tanggal mulai berlakunya penugasan saat ini (format: `01 Jan 2025`) beserta badge status `Aktif` berwarna hijau.
   * **Kolom 6: Aksi:**  
     * Tombol `Ubah Penugasan`: Membuka formulir mutasi untuk personil bersangkutan.
     * Tombol `Lihat Riwayat`: Membuka modal linimasa historis penugasan masa lalu personil tersebut.
4. **Catatan Kaki Tata Kelola (*Footnote Notice*):**
   * Di bawah tabel disematkan catatan kaki informatif berlatar netral:  
     *ℹ Penugasan organisasi menentukan jalur pelaporan harian dan penanggung jawab awal kendala kerja. Setiap perubahan wajib menyertakan tanggal berlaku efektif dan tidak menghapus rekaman historis masa lalu.*

---

### TAB 2: DIREKTORI PROYEK (*PROJECT DIRECTORY*)
Mengelola daftar inisiatif dan proyek resmi perusahaan yang menjadi rujukan (*reference scope*) pelaporan blocker dan risiko kerja.

1. **Toolbar & Filter:**
   * Pencarian nama/kode proyek (`#searchProject`).
   * Dropdown filter status proyek (`Semua Status`, `Aktif`, `Selesai`).
   * Dropdown filter divisi penanggung jawab.
   * Tombol `+ Daftarkan Proyek Baru` di pojok kanan toolbar tabel.
2. **Tabel Direktori Proyek (Format Baku 5 Kolom):**
   * **Kolom 1: Kode Rujukan (*Scope Reference*):** Badge kode resmi unik (misal: `PRJ-PORTAL`, `PRJ-CORE`, `PRJ-MOBILE`).
   * **Kolom 2: Nama Proyek & Ruang Lingkup:** Nama lengkap inisiatif tebal beserta deskripsi ringkas tujuan proyek.
   * **Kolom 3: Divisi Penanggung Jawab:** Divisi induk proyek (misal: `Delivery`, `Engineering`).
   * **Kolom 4: Status Proyek:** Pill status semantik (`Aktif` hijau, `Selesai` netral abu-abu).
   * **Kolom 5: Aksi:**  
     * Tombol `Sunting`: Mengubah nama/deskripsi atau menutup status proyek.
     * Tombol `Kelola Wewenang`: Langsung memfilter Tab 3 untuk menampilkan personil yang memegang kewenangan di proyek ini.

---

### TAB 3: KEWENANGAN PROYEK (*PROJECT AUTHORITY MAPPING*)
Mengelola pemetaan wewenang personil pada proyek tertentu secara mandiri (terpisah dari garis atasan langsung divisi).

1. **Toolbar & Filter:**
   * Pencarian nama personil atau proyek (`#searchAuthText`).
   * Dropdown filter proyek terdaftar (`Semua Proyek`, `PRJ-PORTAL`, `PRJ-CORE`, dll.).
   * Dropdown filter status wewenang (`Semua Status`, `Aktif`, `Berakhir`).
   * Tombol `+ Tetapkan Kewenangan Proyek` di pojok kanan toolbar.
2. **Tabel Kewenangan Proyek (Format Baku 6 Kolom):**
   * **Kolom 1: Personil Terpilih:** Avatar, Nama Lengkap, dan jabatan struktural asal.
   * **Kolom 2: Proyek Rujukan:** Kode dan nama inisiatif proyek.
   * **Kolom 3: Peran Kewenangan Proyek:** Menampilkan salah satu dari 4 klasifikasi resmi (`Pimpinan Proyek (Project Lead / PM)`, `Penanggung Jawab Keahlian`, `PIC Klien / Eksternal`, `Pengarah / Sponsor`).
   * **Kolom 4: Tanggal Mulai Berlaku (*Effective Date*):** Tanggal resmi wewenang mulai diemban.
   * **Kolom 5: Tanggal Berakhir (*End Date*):** Tanggal selesai penugasan proyek (atau tanda strip `—` dengan keterangan *Berjalan Terbuka* jika tanpa batas waktu).
   * **Kolom 6: Aksi:** Tombol `Ubah` atau `Akhiri Penugasan`.
3. **Catatan Kaki Tata Kelola Kewenangan Proyek:**  
   *ℹ Kewenangan proyek menentukan penanggung jawab kendala kerja berbasis inisiatif proyek. Satu personil dapat memegang lebih dari satu kewenangan proyek aktif sekaligus tanpa mengubah atasan langsung fungsionalnya.*

---

## 2.4 Standar 10 Dialog Modal Terpadu

Halaman 15 memiliki **10 dialog modal terpadu** yang saling terhubung secara reaktif untuk menjamin kehati-hatian operasional, kelengkapan master data, fleksibilitas hierarki, penyaluran akun aman, dan integritas audit:

### MODAL 1: FORMULIR TAMBAH PERSONIL KE STRUKTUR ORGANISASI (`#modalAddPersonBackdrop`)
* **Dasar Mandat:** PRD FR-22 (Create Master Person & Role), FR-23 & NFR-08 (Effective-Dated), FR-50 & FR-54 (Centralized Account Onboarding tanpa registrasi mandiri publik).
* **Tujuan:** Mendaftarkan personil baru ke dalam master data organisasi dan langsung memetakan penugasan awalnya (jabatan fungsional, fungsi divisi dinamis, tingkat peran sistem, atasan langsung, dan tanggal mulai berlaku).
* **Elemen Formulir:**
  1. **Nama Lengkap Personil (`#inputAddPersonName` - Wajib):** Teks nama personil (min. 3 karakter).
  2. **ID Personil / NIK (`#inputAddPersonId` - Wajib):** Kode identitas unik otomatis (`USR-011`, `USR-012`, dst.) dan dapat disunting sesuai NIK internal.
  3. **Email Kantor (`#inputAddPersonEmail` - Wajib):** Alamat email resmi untuk penerbitan token undangan aktivasi akun aman (FR-54).
  4. **Jabatan / Posisi Kerja Organisasi (`#inputAddPersonJobTitle` - Wajib):** Posisi fungsional nyata karyawan (contoh: *Lead UI/UX Designer*, *Senior Backend Engineer*, *Scrum Master*, dll.) yang didukung saran pintar (*autocomplete datalist `#commonJobTitles`*).
  5. **Tingkat Peran Sistem / RBAC (`#selectAddPersonRole` - Wajib):** Batas otorisasi sistem: `Employee`, `Supervisor / TL`, `Head`, `PM`, `HRGA Admin`, `CEO / Management`, `System Admin`.
  6. **Divisi / Fungsi Organisasi (`#selectAddPersonFunction` - Wajib):** Dropdown divisi dinamis yang terisi otomatis dari `workpulse_divisions_v3`, dilengkapi opsi pintasan `+ Tambah Divisi Baru...` yang otomatis memicu Modal 3.
  7. **Atasan Langsung (*Direct Manager* - `#selectAddPersonManager`):** Dropdown dinamis daftar personil kepemimpinan aktif, atau opsi *"— Tidak Ada / Pucuk Pimpinan (CEO) —"*.
  8. **Tanggal Mulai Berlaku (*Effective Date* - `#inputAddPersonEffectiveDate` - Wajib):** Tanggal resmi mulai bertugas di perusahaan (default: hari ini).
  9. **Keterangan / Alasan Penugasan Awal (`#textareaAddPersonReason` - Wajib):** Catatan dasar penugasan karyawan baru.
* **Pemberitahuan Tata Kelola Akun (FR-50 & FR-54):** Disematkan callout info bahwa akun baru terdaftar secara terpusat dan siap diterbitkan undangan aktivasi satu-kali-pakai.
* **Dampak Sistem & Alur Lanjutan:** Data personil tersimpan ke `localStorage: workpulse_people_v3`, penugasan aktif tersimpan ke `workpulse_org_assignments_v3`, token aktivasi unik di-generate, dan sistem **langsung membuka Modal 2 (Penerbitan Tautan Aktivasi Akun)** secara otomatis.

---

### MODAL 2: PENERBITAN TAUTAN AKTIVASI AKUN KARYAWAN BARU (`#modalActivationBackdrop`)
* **Dasar Mandat:** PRD FR-50 (Zero Public Self-Registration), FR-54 & AC-34 (One-Time Activation Token Delivery).
* **Tujuan:** Menyediakan antarmuka resmi bagi Admin/HRGA untuk menyalin atau menguji tautan aktivasi akun ber-token aman yang akan dikirimkan kepada karyawan baru untuk pembuatan kata sandi pertamanya.
* **Pemicu Tampil:**
  1. Terbuka otomatis tepat setelah Admin berhasil menyimpan personil baru di Modal 1.
  2. Dapat dibuka sewaktu-waktu melalui tombol `Tautan Aktivasi` pada baris tabel Tab 1 bagi karyawan yang masih berstatus *Menunggu Aktivasi*.
* **Elemen & Konten Tampilan:**
  1. **Kartu Profil Personil Terdaftar:** Menampilkan Avatar Inisial, Nama Lengkap, Jabatan & Divisi, NIK Karyawan, Alamat Email Resmi, dan Badge Status `Menunggu Aktivasi`.
  2. **Petunjuk Operasional:** Penjelasan singkat bahwa tautan ini harus dibagikan ke karyawan agar mereka dapat membuat kata sandi sendiri di Halaman 01.
  3. **Input Tautan Aktivasi Ber-Token:** Input teks *read-only* berisi tautan URL lengkap:  
     `01-Login-Activation.html?view=activation&token=ACT-USR012-XXXXXX&email=...&name=...`
  4. **Tombol Salin Tautan (`#btnCopyActivationLink`):** Menyalin tautan langsung ke clipboard sistem dengan umpan balik visual instan: tombol berubah menjadi `✓ Tersalin!` selama 2,5 detik disertai toast sukses.
  5. **Kotak Info Keamanan & Validitas:** Keterangan batas masa berlaku token selama **72 jam (3 hari)** dengan stempel waktu kedaluwarsa eksplisit (*contoh: 31 Okt 2026, 23:59 WIB*).
* **Tombol Aksi Bawah:**
  * Tombol Sekunder: `Buka Layar Aktivasi ↗` (membuka rute aktivasi Halaman 01 di tab baru untuk keperluan pengujian / demo).
  * Tombol Primer: `Selesai` (menutup dialog modal dan kembali ke tampilan tabel aktif).

---

### MODAL 3: FORMULIR TAMBAH DIVISI BARU (`#modalAddDivisionBackdrop`)
* **Dasar Mandat:** PRD FR-22 (Configurable Function & Department Management).
* **Tujuan:** Memungkinkan Administrator dan Manajemen membuat divisi, unit kerja, atau fungsi baru secara fleksibel sesuai pertumbuhan organisasi tanpa memerlukan perubahan skema kode.
* **Elemen Formulir:**
  1. **Nama Divisi / Fungsi Baru (`#inputDivisionName` - Wajib):** Teks nama divisi resmi (contoh: *Product & Design*, *Data & AI Research*).
  2. **Kode Divisi (`#inputDivisionCode` - Wajib):** Kode unik divisi yang di-generate otomatis secara reaktif saat mengetik nama (contoh: `DIV-PRO-DES`), namun tetap dapat disunting manual bila ada penamaan kode internal khusus.
  3. **Deskripsi Ruang Lingkup Divisi (`#textareaDivisionDesc` - Wajib):** Uraian lingkup tanggung jawab unit kerja baru.
* **Dampak Sistem:**
  * Divisi baru disimpan secara permanen ke `localStorage: workpulse_divisions_v3`.
  * Secara otomatis memperbarui seluruh dropdown pilihan divisi di halaman secara *real-time* (`#filterOrgFunction`, `#selectAddPersonFunction`, `#selectOrgFunction`, `#selectProjectDiv`, dan `#editProjectDiv`).
  * Jika dipicu dari dropdown form karyawan/proyek via opsi `+ Tambah Divisi Baru...`, nilai divisi yang baru saja dibuat langsung terpilih secara otomatis (*auto-selected*).

---

### MODAL 4: FORMULIR UBAH PENUGASAN ORGANISASI (`#modalOrgBackdrop`)
* **Tujuan:** Menginisiasi mutasi, rotasi divisi, promosi jabatan fungsional, atau pergantian atasan langsung seorang personil.
* **Elemen Formulir:**
  1. **Pilih Personil:** Dropdown daftar karyawan aktif (atau otomatis terkunci jika dibuka dari baris tabel tertentu).
  2. **Jabatan / Posisi Kerja Organisasi Baru (`#inputOrgJobTitle` - Wajib):** Posisi fungsional baru personil dengan dukungan saran pintar datalist.
  3. **Tingkat Peran Sistem Baru (`#selectOrgRole` - Wajib):** Hak otorisasi RBAC sistem.
  4. **Fungsi / Divisi Baru (`#selectOrgFunction` - Wajib):** Pilihan divisi dinamis (lengkap dengan opsi buat divisi baru).
  5. **Atasan Langsung Baru (*Direct Manager*):** Dropdown daftar pejabat yang sah menjadi atasan (otomatis memfilter agar karyawan tidak dapat memilih dirinya sendiri maupun bawahannya sebagai atasan langsung).
  6. **Tanggal Berlaku Efektif (*Effective Date* - Wajib):** Input penanggalan kalender (`type="date"`). Dilarang kosong!
  7. **Alasan Perubahan Penugasan (*Reason* - Wajib):** Textarea penjelasan alasan resmi mutasi/promosi (minimal 10 karakter).
* **Peringatan Penanggalan Lampau (*Retroactive Warning Callout*):**  
  *Jika Admin memilih tanggal yang sudah lewat dari hari ini, sistem menampilkan callout peringatan tenang:*  
  *"Perhatian: Anda menetapkan tanggal berlaku efektif di masa lampau. Sistem akan menerapkan penugasan ini mulai tanggal tersebut ke depan. Catatan akuntabilitas harian yang telah terkunci sebelum tanggal tersebut tetap menggunakan konteks atasan dan divisi lama demi integritas audit."*
* **Tombol Aksi Bawah:**
  * Tombol Sekunder: `Batal`
  * Tombol Primer: **`Lihat Pratinjau Dampak ↗`** *(Tombol ini TIDAK LANGSUNG menyimpan data ke server, melainkan memvalidasi formulir lalu membuka Modal 5).*

---

### MODAL 5: PRATINJAU DAMPAK PERUBAHAN HIERARKI (`#modalPreviewBackdrop`)
* **Mandat Khusus:** UI/UX Spec §4.15 & Alur Pengguna UF-40.
* **Tujuan:** Menampilkan secara transparan siapa saja pihak yang terpengaruh oleh perubahan hierarki ini sebelum admin membuat keputusan final.
* **Konten Tampilan:**
  1. **Panel Komparasi Ringkas (*Before vs After*):**  
     Menampilkan kartu perbandingan berdampingan:
     * *Sebelumnya:* Jabatan & Peran lama, Divisi lama, Atasan langsung lama.
     * *Mulai [Tanggal Efektif]:* Jabatan & Peran baru, Divisi baru, Atasan langsung baru.
  2. **Daftar Bawahan yang Terdampak (*Affected Direct Reports*):**  
     * Jika personil yang diubah jabatannya memiliki bawahan langsung:  
       Menampilkan daftar nama-nama bawahan (dengan avatar, ID, dan jabatan) yang kini memiliki atasan baru atau terdampak perubahan rantai eskalasi.
     * Jika personil tidak memiliki bawahan langsung:  
       Menampilkan pesan tenang: *Perubahan ini bersifat individual dan tidak berdampak pada rantai pelaporan personil lain.*
  3. **Maklumat Notifikasi & Jejak Audit:**  
     Menjelaskan bahwa sistem akan mencatat peristiwa ini ke dalam riwayat audit kekal (*immutable audit log*) dan menerbitkan notifikasi resmi kepada pihak terkait per tanggal efektif.
* **Tombol Aksi Bawah:**
  * Tombol Sekunder: `← Kembali ke Formulir` (menutup pratinjau dan mengembalikan admin ke Modal 4 untuk perbaikan input tanpa kehilangan state formulir).
  * Tombol Primer: **`Konfirmasi & Terapkan Penugasan`** (menyimpan data ke sistem, memperbarui tabel, menutup modal, dan memunculkan toast sukses hijau).

---

### MODAL 6: PENDAFTARAN MASTER PROYEK BARU (`#modalProjectBackdrop`)
* **Tujuan:** Mendaftarkan rujukan inisiatif atau proyek resmi baru ke direktori perusahaan.
* **Elemen:** Kode Unik Proyek (kapital, misal `PRJ-FIN-APP`), Divisi Penanggung Jawab (dropdown dinamis), Nama Lengkap Inisiatif, Deskripsi Ruang Lingkup, dan Status Proyek Awal.

---

### MODAL 7: SUNTING DATA MASTER PROYEK (`#modalEditProjectBackdrop`)
* **Tujuan:** Memperbarui data proyek aktif atau menutup status inisiatif menjadi `Selesai`.
* **Dampak Bisnis:** Jika status proyek diubah menjadi `Selesai`, sistem secara otomatis mengakhiri seluruh penugasan kewenangan proyek yang aktif terkait proyek tersebut per tanggal penutupan.

---

### MODAL 8: PENETAPAN KEWENANGAN PROYEK BARU (`#modalAuthorityBackdrop`)
* **Tujuan:** Memetakan penugasan penanggung jawab proyek mandiri untuk penanganan kendala berbasis inisiatif.
* **Elemen:** Pilih Proyek Terdaftar, Pilih Karyawan Terdaftar, Pilih Klasifikasi Peran Kewenangan Proyek (4 pilihan resmi), Tanggal Mulai Efektif (Wajib), Tanggal Berakhir (Opsional - boleh kosong untuk penugasan terbuka).

---

### MODAL 9: KONFIRMASI AKHIRI KEWENANGAN PROYEK (`#modalEndAuthBackdrop`)
* **Tujuan:** Menghentikan atau mengakhiri penugasan wewenang proyek seorang personil secara beradab dan teratur (*Calm UI Modal*) tanpa menggunakan dialog bawaan browser (`confirm()`).
* **Elemen:** Tanggal Selesai Penugasan (`#inputEndAuthDate`), Alasan Pengakhiran Wewenang (`#inputEndAuthReason`).

---

### MODAL 10: RIWAYAT PENUGASAN ORGANISASI (*VIEW HISTORY MODAL - `#modalHistoryBackdrop`*)
* **Mandat Khusus:** PRD FR-23, FR-24, AC-11, AC-15, dan UI/UX Spec §4.15.
* **Tujuan:** Menyajikan jejak audit kekal (*immutable audit trail*) perjalanan karir, promosi jabatan fungsional, dan mutasi divisi personil terpilih.
* **Konten Tampilan:**
  1. Header modal menampilkan Avatar, Nama Lengkap Karyawan, dan ID Karyawan.
  2. **Linimasa Vertikal Riwayat (*Vertical History Timeline*):**
     * **Kartu Penugasan Terkini (Paling Atas):** Ditandai badge hijau `Penugasan Aktif Saat Ini`, menampilkan Jabatan Fungsional tebal, Pill Peran Sistem, Divisi, Atasan Langsung, Mulai Berlaku sejak tanggal X hingga sekarang, serta alasan penugasan.
     * **Kartu-kartu Penugasan Masa Lalu:** Ditandai badge netral abu-abu `Telah Berakhir`, menampilkan rentang tanggal berlaku (`[Tanggal Mulai] s.d. [Tanggal Selesai]`), jabatan dan peran pada periode tersebut, atasan lama, divisi lama, serta alasan mutasi dan stempel nama Admin pencatat.
* **Tombol Aksi Bawah:** Tombol tunggal `Tutup Riwayat`.

---

## 2.5 Standar Umpan Balik, Notifikasi & Perlindungan Kesalahan (*Calm UI & Error Prevention*)

1. **Umpan Balik Sukses (*Contextual Toast Engine*):**
   * Setiap penambahan proyek, pembaruan penugasan organisasi, atau penetapan wewenang proyek memicu toast hijau tenang di kanan bawah berdurasi 3,5 detik:  
     `✓ Penugasan organisasi untuk [Nama Karyawan] berhasil diperbarui per [Tanggal Efektif].`
2. **Pencegahan Siklus Hierarki Melingkar (*Circular Reporting Line Prevention*):**
   * Dropdown Atasan Langsung secara otomatis mengeluarkan nama karyawan yang sedang diedit agar seseorang tidak bisa menjadi atasan langsung bagi dirinya sendiri.
   * Sistem memvalidasi agar tidak terjadi relasi melingkar (A menjadi atasan B, lalu B menjadi atasan A).
3. **Bebas Jargon Pemrograman (*Zero Developer Jargon*):**
   * Seluruh label, pesan validasi, dan notifikasi menggunakan bahasa manajemen personalia yang lugas dan manusiawi:
     * *Dilarang:* `payload mutation failed`, `null pointer on manager_id`, `boolean active status`.
     * *Wajib:* `Atasan langsung tidak boleh kosong`, `Karyawan tidak dapat menjadi atasan bagi dirinya sendiri`, `Penugasan aktif saat ini`.
4. **Nol Emoticon & Ikon SVG Monokrom Baku:**
   * Seluruh tombol, badge, dan modal murni menggunakan ikon SVG monokrom `stroke-width="1.8-2.2"` (`fill="none"`). Tidak ada emoji grafis dan bebas dari simbol petir.

---

## 2.6 Ringkasan Alur Interaksi Pengguna (User Flow UF-40 Step-by-Step)

```
[ Buka Halaman 15: /admin/organization ]
                │
                ▼
[ Menelaah 4 Kartu Metrik & Tabel Struktur Organisasi ]
                │
                ▼
[ Klik Tombol "Ubah Penugasan" pada Baris Karyawan ]
                │
                ▼
[ Terbuka Modal 1: Form Ubah Penugasan Organisasi ]
   ├── Ubah Divisi / Jabatan / Atasan Langsung
   ├── Masukkan Tanggal Berlaku Efektif (Wajib)
   └── Tuliskan Alasan Resmi Perubahan (Wajib)
                │
                ▼
[ Klik Tombol "Lihat Pratinjau Dampak ↗" ]
                │
                ▼
[ Terbuka Modal 2: Dialog Pratinjau Dampak (Impact Preview) ]
   ├── Tinjau Komparasi Sebelum vs Sesudah
   ├── Periksa Daftar Bawahan yang Ikut Terdampak
   └── Pastikan Tanggal Efektif Sudah Tepat
          │                     │
  (Perlu Koreksi)         (Sudah Tepat)
          │                     │
          ▼                     ▼
[ Kembali ke Form ]     [ Klik "Konfirmasi & Terapkan" ]
                                │
                                ▼
                        [ Data Tersimpan ]
                        ├── Rekaman Lama Diarsipkan (End Date)
                        ├── Rekaman Baru Diterbitkan (Effective Date)
                        ├── Jejak Audit Kekal Tercatat (AC-15)
                        ├── Toast Sukses Hijau Muncul
                        └── Tabel Diperbarui Seketika
```

---

# BAGIAN 3: EVALUASI KONDISI KODE AKTUAL HALAMAN 15 (LANGKAH 3)

Berdasarkan inspeksi mendalam terhadap berkas kode aktual [`15-Admin-Organizational-Mapping.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/15-Admin-Organizational-Mapping.html) dan pengujian visual langsung di peramban, berikut adalah evaluasi komparatif antara kondisi saat ini dengan peta implementasi ideal (Langkah 2):

## 3.1 Poin-Poin yang Sudah Baik (*Strengths & Existing Compliances*)
1. **Arsitektur 3 Tab Terpisah:**  
   Kode telah mengimplementasikan 3 panel terpisah (`Struktur Organisasi`, `Direktori Proyek`, dan `Kewenangan Proyek`) dengan peralihan konten tanpa memuat ulang halaman (*clean tab-switching*).
2. **Kewenangan Proyek Terpisah dari Penugasan Struktural:**  
   Kewenangan proyek telah dimodelkan sebagai pemetaan independen (*many-to-many relationship per person*), sesuai dengan mandat UI/UX Spec §4.15.
3. **Keberadaan Modal Pratinjau Dampak (*Impact Preview Modal - UF-40*):**  
   Alur pengajuan penugasan baru di Modal 1 tidak langsung menulis data secara diam-diam, melainkan berhasil membuka Modal 2 untuk meninjau perbandingan sebelum vs sesudah dan mendeteksi apakah ada bawahan langsung yang melapor ke personil tersebut.
4. **Proteksi Anti-Memilih Diri Sendiri:**  
   Fungsi `updateManagerOptions` di JavaScript telah secara otomatis mengecualikan personil yang sedang diedit dari daftar pilihan atasan langsung sehingga mencegah relasi atasan melingkar (*self-referencing*).
5. **Modal Riwayat Linimasa Vertikal:**  
   Tersedia modal riwayat yang menampilkan perjalanan karir personil dengan penanda status aktif dan tanggal berlaku efektif.

---

## 3.2 Kesenjangan, Kekurangan & Masalah yang Ditemukan (*Identified Gaps & Flaws*)

### A. Kerapian Tipografi & Tampilan Teks (*Visual & Copywriting Polish*)
1. **Kebocoran Format Markdown Mentah (*Raw Markdown Asterisks Leak*):**  
   Di beberapa teks judul dan deskripsi panel, terdapat karakter bintang mentah yang tidak diparsing peramban:
   * Pada deskripsi header: `(*Direct Manager*)` dan `(*Effective Date*)`.
   * Pada judul dan deskripsi panel Tab 1: `peran (*Role*)`, `fungsi divisi (*Function*)`, dan `atasan langsung (*Direct Manager*)`.
   * Pada header Tab 2: `pelaporan kendala (*Blocker*)`.
   * Pada header Tab 3: `(*Project Authority Mapping*)`.
   * Pada notice modal pratinjau: `*Audit Log*`.  
   *Dampak:* Terlihat seperti draf mentah pengembang, tidak memenuhi standar aplikasi produksi (*zero developer artifacts*).
2. **Judul Utama Halaman:**  
   Saat ini tertulis `Pemetaan Organisasi & Proyek`. Sesuai spesifikasi resmi harus diselaraskan menjadi `Pemetaan Struktur Organisasi & Kewenangan Proyek`.
3. **Ketiadaan Badge Konteks Otoritas:**  
   Belum ada chip konteks tenang penanda hak akses: `MODUL TATA KELOLA ADMINISTRATOR`.

### B. Shell Aplikasi, Navigasi & Identitas Pengguna
1. **Menu Sidebar Belum Lengkap:**  
   Menu `My Blockers` (Halaman 05) dan `Notifications` (Halaman 07) hilang dari daftar navigasi sidebar. Ini melanggar Pedoman Konsistensi Navigasi Lintas Halaman §4.1.
2. **Profil Pengguna Sidebar Bawah Statis:**  
   Kartu pengguna di bagian bawah sidebar masih di-hardcode dengan nama Hendra Wijaya (CEO), belum terhubung secara reaktif dengan sesi penyimpanan lokal (`localStorage: workpulse_active_user`), dan belum memiliki tombol keluar (*Logout*) monokrom yang konsisten.
3. **Jam Sistem Topbar Statis:**  
   Jam di sudut kanan atas menampilkan teks statis `20 Okt 2026` alih-alih waktu dinamis terpadu.

### C. Kartu Metrik Ringkasan & Palet Warna
1. **Warna Metrik Tidak Standar (*Rogue Palette Color*):**  
   Kartu "Proyek Terdaftar" menggunakan warna ungu (`accent-purple: #7C3AED`). Warna ungu ini tidak ada dalam daftar palet resmi sistem WorkPulse (palet resmi: Brand Green `#0F5338`, Blue `#175CD3`, Amber `#B45309`, Slate `#101828`).
2. **Ketiadaan Interaktivitas (*Click-to-Filter / Click-to-Tab*):**  
   Keempat kartu metrik saat ini hanya elemen tampilan pasif. Mengklik kartu metrik tidak memicu aksi apa pun. Seharusnya mengklik kartu metrik langsung memindahkan tab aktif atau menyaring data yang relevan (misal klik "Proyek Terdaftar" otomatis membuka Tab 2).

### D. Tab 1 (Struktur Organisasi) & Pengelolaan Data
1. **Filter Status Penugasan Hilang:**  
   Filter bar Tab 1 hanya memiliki pencarian teks, filter divisi, dan filter peran. Tidak ada dropdown untuk memfilter status penugasan (`Semua Status`, `Aktif`, `Riwayat / Telah Berakhir`).
2. **Struktur Kolom Tabel Terlalu Padat:**  
   Kolom "Divisi & Jabatan" menggabungkan nama fungsi divisi dan peran sistem dalam satu sel bertumpuk. Peran sistem dan fungsi kanonikal sebaiknya disajikan dengan pembeda visual badge yang lebih tegas.
3. **Label Pucuk Pimpinan:**  
   Pada Hendra Wijaya (CEO), kolom atasan tertulis `Posisi Puncak (CEO)` dengan pill amber. Lebih tepat menggunakan teks kelembagaan yang lugas: `Dewan Komisaris / Pucuk Pimpinan`.
4. **Ketiadaan Catatan Kaki Tata Kelola (*Footnote Notice*):**  
   Tabel tidak memiliki callout note tata kelola di bagian bawah yang mengedukasi admin mengenai prinsip penanggalan efektif dan proteksi data historis.

### E. Tab 2 (Direktori Proyek) & Tab 3 (Kewenangan Proyek)
1. **Tidak Ada Fitur Sunting Master Proyek:**  
   Di Tab 2, admin hanya bisa mendaftarkan proyek baru dan melihat pemegang wewenang. Belum ada tombol `Sunting Proyek` untuk mengoreksi nama, deskripsi, atau mengubah status proyek dari `Aktif` menjadi `Selesai`.
2. **Penggunaan Dialog Bawaan Browser (`window.confirm`):**  
   Tombol "Akhiri Wewenang" di Tab 3 memicu fungsi `confirm(...)` bawaan peramban. Ini melanggar filosofi *Calm UI* dan standar antarmuka premium. Seharusnya menggunakan modal konfirmasi internal yang elegan dengan opsi memasukkan tanggal berakhir wewenang.

### F. Penanganan Kesalahan, Validasi & Persistensi
1. **Penggunaan `window.alert`:**  
   Validasi form (misal saat data kosong atau salah input) masih memunculkan dialog pop-up `alert(...)` bawaan browser.
2. **Ketiadaan Contoh Riwayat Historis Awal:**  
   Seluruh 10 personil di awal hanya memiliki 1 baris penugasan aktif tanpa ada rekaman penugasan masa lalu yang selesai. Akibatnya, saat modal riwayat dibuka pertama kali, pengguna tidak melihat demonstrasi nyata pergeseran jabatan masa lalu.
3. **Ketiadaan Persistensi Antar-Sesi (`localStorage`):**  
   Mutasi yang dilakukan admin (menambah proyek, mengubah penugasan, menetapkan wewenang) hanya disimpan di memori sementara JavaScript. Saat halaman dimuat ulang (*refresh*), data kembali ke bentuk awal.

---

# BAGIAN 4: PLAN PERBAIKAN HALAMAN 15 (LANGKAH 4)

Berdasarkan seluruh kesenjangan di atas, disusun rencana kerja perbaikan komprehensif dalam **5 Fase Kerja Terstruktur**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  FASE 1: Standardisasi Shell Aplikasi, Header & Navigasi Terpadu                        │
│  FASE 2: Harmonisasi 4 Kartu Metrik & Fitur Interaktif Click-to-Tab                    │
│  FASE 3: Penyempurnaan Tab 1 (Struktur Organisasi, Filter & Riwayat Autentik)          │
│  FASE 4: Penyempurnaan Tab 2 (Direktori Proyek) & Tab 3 (Kewenangan Proyek)            │
│  FASE 5: Eliminasi Dialog Bawaan Browser, Penyempurnaan Modal & Persistensi LocalStorage│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### FASE 1: Standardisasi Shell Aplikasi, Header & Navigasi Terpadu
1. **Menyelaraskan Sidebar Navigasi:**
   * Menambahkan menu `My Blockers` (Halaman 05) berikon bendera monokrom dengan badge `2`.
   * Menambahkan menu `Notifications` (Halaman 07) berikon lonceng dengan badge `3`.
   * Menambahkan menu `Temporary Reviewer` (Halaman 17) dan `Policy Settings` (Halaman 18) pada grup tata kelola.
   * Menghubungkan profil pengguna sidebar bawah dengan sesi `localStorage: workpulse_active_user` (default: Administrator Sistem) dan menyematkan tombol *Logout* SVG resmi.
2. **Menyempurnakan Topbar & Header Halaman:**
   * Memperbarui breadcrumb menjadi: `Manajemen / Pemetaan Struktur Organisasi & Kewenangan Proyek`.
   * Menghubungkan jam topbar dengan tanggal/waktu riil sistem.
   * Memperbarui judul halaman menjadi: `Pemetaan Struktur Organisasi & Kewenangan Proyek`.
   * Memperbarui subtitle deskripsi menjadi lugas dan manusiawi: *"Kelola penugasan struktur organisasi dan kewenangan proyek beserta riwayat perubahannya."*
   * Menghapus chip kicker redundant untuk meminimalkan beban visual (*Calm UI*).
   * Merapikan tombol header kanan agar tidak bertabrakan secara visual dengan tombol aksi di dalam panel.

### FASE 2: Harmonisasi 4 Kartu Metrik & Fitur Interaktif Click-to-Tab
1. **Standardisasi Palet Warna & Penamaan Metrik:**
   * Kartu 1 (Total Personil - *Terdaftar dalam sistem*): Netral Slate (`#101828`).
   * Kartu 2 (Penugasan Aktif - *Terpetakan dalam struktur organisasi*): Hijau Brand (`#0F5338`).
   * Kartu 3 (Proyek Aktif - *Sedang berjalan saat ini*): Biru Status (`#175CD3` - menggantikan warna ungu).
   * Kartu 4 (Kewenangan Proyek - *Penanggung jawab proyek aktif*): Amber Status (`#B45309`).
2. **Fitur Interaktivitas Kartu Metrik (*Click-to-Tab*):**
   * Menjadikan kartu metrik dapat diklik dengan indikator kursor pointer dan efek hover lembut.
   * Klik Kartu 1 atau Kartu 2 $\rightarrow$ fokus ke Tab 1 (Struktur Organisasi).
   * Klik Kartu 3 $\rightarrow$ otomatis berpindah ke Tab 2 (Direktori Proyek).
   * Klik Kartu 4 $\rightarrow$ otomatis berpindah ke Tab 3 (Kewenangan Proyek).

### FASE 3: Penyempurnaan Tab 1 (Struktur Organisasi, Filter & Riwayat Autentik)
1. **Pembersihan Teks Panel Header:**
   * Menghapus seluruh karakter raw markdown asterisks pada panel header Tab 1.
2. **Filter Bar Komprehensif:**
   * Menambahkan dropdown `Status Penugasan` (`Semua Status`, `Aktif`, `Riwayat / Diarsipkan`).
   * Menyelaraskan tata letak filter bar menjadi 1 baris seimbang (*single-row filter bar*) yang responsif.
3. **Penyempurnaan Tampilan Tabel:**
   * Memperbaiki hierarki tipografi kolom karyawan dan atasan langsung.
   * Memperjelas badge fungsi divisi (7 fungsi kanonikal) dan peran sistem.
   * Memperbarui teks posisi pucuk menjadi `Dewan Komisaris / Pucuk Pimpinan`.
4. **Penyertaan Riwayat Historis Nyata:**
   * Menambahkan data historis masa lalu untuk beberapa personil (misal: Rina Putri memiliki data promosi dari Developer menjadi Tech Lead, Dimas Prayoga memiliki rotasi divisi) sehingga saat modal riwayat dibuka, linimasa langsung menampilkan bukti nyata akuntabilitas masa lalu.
5. **Penyematan Catatan Kaki Tata Kelola (*Footnote Notice*):**
   * Menambahkan callout note informatif di dasar tabel tentang aturan mutlak penanggalan efektif dan anti-overwrite data masa lalu.

### FASE 4: Penyempurnaan Tab 2 (Direktori Proyek) & Tab 3 (Kewenangan Proyek)
1. **Pembersihan Teks Raw Markdown:**
   * Membersihkan karakter markdown di panel header Tab 2 dan Tab 3.
2. **Penyediaan Fitur Sunting Master Proyek:**
   * Menambahkan tombol `Sunting` pada baris proyek di Tab 2.
   * Mengembangkan modal sunting proyek (mengubah nama inisiatif, deskripsi, atau menutup status proyek menjadi `Selesai`).
3. **Penyempurnaan Aksi Kewenangan Proyek:**
   * Menyediakan formulir penetapan wewenang yang aman dan valid.
   * Menggantikan `confirm()` peramban dengan modal konfirmasi internal berlatar tenang (*Calm UI Modal*) yang memungkinkan admin menentukan tanggal berakhir wewenang (*End Date*) secara fleksibel.

### FASE 5: Eliminasi Dialog Bawaan Browser, Penyempurnaan Modal & Persistensi LocalStorage
1. **Eliminasi Total `window.alert`:**
   * Mengganti seluruh pesan validasi form dengan peringatan inline dan Toast Semantik (hijau sukses, amber peringatan, merah kesalahan).
2. **Penyempurnaan Modal Pratinjau Dampak (UF-40):**
   * Mempercantik visual daftar bawahan langsung yang terdampak dengan kartu identitas ber-avatar inisial, badge jabatan, dan keterangan status pelaporan.
   * Menghilangkan raw markdown asterisks pada kotak maklumat audit.
3. **Robust Date & Timezone Handling:**
   * Memastikan kalkulasi tanggal penutupan penugasan lama (`endDate = effectiveDate - 1 hari`) dihitung menggunakan waktu lokal yang aman dari pergeseran zona waktu ISO.
4. **Persistensi Data Lintas Sesi Multi-Entitas (`localStorage`):**
   * Mengintegrasikan penyimpanan lokal untuk entitas:
     * `workpulse_divisions_v3` (Master Divisi / Unit Kerja Dinamis & Terkonfigurasi)
     * `workpulse_people_v3` (Master Data Personil Dinamis)
     * `workpulse_org_assignments_v3` (Penugasan Organisasi Berpenanggalan Efektif)
     * `workpulse_projects_v3` (Direktori Proyek Resmi)
     * `workpulse_project_authorities_v3` (Pemetaan Kewenangan Proyek Mandiri)
   * Menjamin bahwa setiap divisi baru, personil baru, proyek baru, mutasi penugasan baru, dan penetapan wewenang baru tetap tersimpan secara permanen saat halaman di-refresh.

---

# BAGIAN 5: REALISASI REFAKTORISASI DAN IMPLEMENTASI KODE (LANGKAH 5)

Tahap refaktorisasi penuh telah diimplementasikan pada berkas produksi [`15-Admin-Organizational-Mapping.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/15-Admin-Organizational-Mapping.html). Seluruh rancangan ideal Langkah 2 dan rencana kerja Langkah 4 berhasil direalisasikan secara terpadu:

1. **Shell Navigasi Standar & Reaktivitas Sesi:**
   * Sidebar lengkap dengan 18 rute sistem terpadu, termasuk badge aktif untuk `My Blockers (2)` dan `Notifications (3)`.
   * Komponen pengguna bawah sidebar terintegrasi dinamis dengan sesi `localStorage: workpulse_active_user`.
   * Jam dinamis topbar diperbarui secara riil setiap 30 detik dalam format lokal: `DD Mmm YYYY, HH:mm WIB`.
2. **Harmonisasi 4 Kartu Metrik Interaktif (Click-to-Tab):**
   * Palet warna resmi terpasang: Total Personil (Netral Slate `#1E293B`), Penugasan Aktif (Hijau Brand `#0F5338`), Direktori Proyek (Biru Status `#1D4ED8`), dan Wewenang Proyek (Amber Status `#D97706`).
   * Setiap kartu metrik berfungsi sebagai pemindah tab dan filter cepat saat diklik atau diakses lewat keyboard.
3. **Arsitektur 3 Tab Terpadu & Konfigurasi Fleksibel:**
   * **Tab 1 (Struktur Organisasi):** Header panel dilengkapi tombol aksi ganda `+ Tambah Divisi` (`#btnAddDivision`) dan `+ Tambah Personil ke Struktur` (`#btnAddPersonOrg`). Single-row filter bar lengkap (Pencarian, Divisi Dinamis, Peran RBAC, dan Status Aktif/Riwayat) dengan tabel yang menyajikan avatar, nama, ID, jabatan fungsional tebal + peran sistem, divisi dinamis, atasan langsung, tanggal efektif, status, serta tombol aksi `Ubah` dan `Riwayat`.
   * **Tab 2 (Direktori Proyek):** Pengelolaan rujukan master inisiatif lengkap dengan kode unik, deskripsi terklem (*clamped*), divisi induk dinamis, penghitung wewenang aktif, dan status proyek.
   * **Tab 3 (Kewenangan Proyek):** Pemetaan wewenang mandiri per personil pada proyek tertentu dengan tanggal mulai efektif dan tanggal selesai.
4. **Sistem 10 Dialog Modal Terkoordinasi:**
   * **Modal 1:** Form Tambah Personil ke Struktur Organisasi dengan pemisahan Jabatan Fungsional (`#inputAddPersonJobTitle`) dan Peran Sistem RBAC (`#selectAddPersonRole`), serta pemilihan divisi dinamis.
   * **Modal 2:** Penerbitan Tautan Aktivasi Akun Karyawan Baru (`#modalActivationBackdrop`) dengan token acak unik aman, tombol salin ke papan klip instan, dan tautan uji layar aktivasi (PRD FR-50, FR-54, AC-34).
   * **Modal 3:** Form Tambah Divisi Baru (`#modalAddDivisionBackdrop`) dengan auto-generate kode divisi (PRD FR-22).
   * **Modal 4:** Form Ubah Penugasan Organisasi dengan peringatan retroaktif (*backdated assignment warning*) dan pembaruan jabatan organisasi.
   * **Modal 5:** Pratinjau Dampak Hierarki (*Impact Preview Modal - UF-40*) yang memperlihatkan komparasi *before vs after* dan daftar bawahan terdampak.
   * **Modal 6:** Pendaftaran Inisiatif / Master Proyek Baru.
   * **Modal 7:** Sunting Data Master Proyek (termasuk penutupan status proyek menjadi Selesai).
   * **Modal 8:** Penugasan Kewenangan Proyek Baru.
   * **Modal 9:** Konfirmasi Akhiri Kewenangan Proyek (*Calm UI Modal*) pengganti dialog `confirm()` bawaan browser.
   * **Modal 10:** Linimasa Riwayat Penugasan (*Career History Audit Trail*) lengkap dengan jabatan fungsional, peran sistem, dan stempel admin pencatat.
5. **Persistensi Data Multi-Entitas (`localStorage_v3`):**
   * Menyimpan `workpulse_divisions_v3`, `workpulse_people_v3`, `workpulse_org_assignments_v3`, `workpulse_projects_v3`, dan `workpulse_project_authorities_v3` dengan fallback data benih (*seed data*) otentik yang mencakup linimasa historis.

---

# BAGIAN 6: HASIL EVALUASI 6 DIMENSI MUTU & VERIFIKASI AKHIR SISTEM

Halaman 15 telah melalui proses audit, evaluasi objektif, dan penyempurnaan mendalam lintas 6 Dimensi Kualitas Perangkat Lunak:

### 1. Dimensi 1: Linguistik & Copywriting
* **Standardisasi Breadcrumb:** Topbar diselaraskan secara bersih menjadi `Manajemen / Pemetaan Struktur Organisasi & Kewenangan Proyek`.
* **Penyelarasan Dwi-Bahasa:** Menghapus label redundan bahasa Inggris pada judul kolom tabel (misalnya `(Direct Manager)` dan `(Effective Date)` dihapus, menggunakan istilah tunggal bahasa Indonesia baku `Atasan Langsung` dan `Mulai Berlaku`).
* **Frasa Status Konsisten:** Periode waktu berjalan distandarkan menjadi `s.d. Sekarang` dan penugasan wewenang tanpa batas akhir menjadi `— (Aktif Berkelanjutan)`.
* **Bahasa Peringatan Ramah (*Friendly Backdated Notice*):** Mengganti bahasa teknis menjadi maklumat yang menenangkan: *"Pemberitahuan: Anda Memilih Tanggal di Masa Lalu. Perubahan penugasan ini akan dihitung berlaku mundur..."*.
* **Eliminasi Total Raw Markdown:** Menghilangkan seluruh karakter bintang mentah `(*Role*)` dan `(*Function*)` pada antarmuka.

### 2. Dimensi 2: Aturan Bisnis & Spesifikasi Tata Kelola
* **Fleksibilitas Konfigurasi Organisasi Dinamis (PRD FR-22 & PDD §5):** Admin dan Manajemen Berwenang dapat sewaktu-waktu menambahkan divisi / unit kerja baru (`workpulse_divisions_v3`) yang langsung disinkronkan ke seluruh filter dan dropdown tanpa me-reload peramban.
* **Pemisahan Peran Sistem & Posisi Kerja Nyata:** Sistem RBAC (`Employee`, `Supervisor / TL`, `Head`, `PM`, dll.) tetap tegak mengawal gerbang akses dan jalur eskalasi, sementara posisi jabatan fungsional karyawan (*Job Title*) dapat diisi fleksibel sesuai kebutuhan riil perusahaan (misal: *Lead UI/UX Designer*, *Senior Backend Engineer*).
* **Pencegahan Hierarki Melingkar Rekursif (*Anti-Circular Reporting*):** Fungsi `getAllSubordinateIds` menelusuri seluruh rantai bawahan langsung maupun tidak langsung secara rekursif sehingga personil tidak dapat memilih dirinya sendiri maupun bawahannya sebagai atasan.
* **Kewajiban Memiliki Atasan bagi Non-Direksi:** Seluruh peran selain `CEO / Management` diwajibkan memilih atasan langsung yang sah sebelum formulir dapat diproses.
* **Validasi Kronologi Tanggal Efektif:** Tanggal berlaku efektif penugasan baru wajib lebih baru (`effectiveDate > curr.effectiveDate`) dari penugasan aktif saat ini.
* **Pencegahan Wewenang Proyek Duplikat:** Mencegah pendaftaran wewenang dengan personil, proyek, dan peran wewenang yang sama jika penugasan sebelumnya masih berstatus aktif.
* **Dampak Penutupan Proyek terhadap Kewenangan:** Mengubah status proyek menjadi `Selesai` otomatis mengakhiri seluruh kewenangan aktif yang terikat pada proyek tersebut pada hari penutupan.
* **Jejak Audit Kekal (*Immutable Audit Trail - AC-15*):** Setiap penugasan baru mencatat atribut `createdBy` (administrator yang bertugas) dan `createdAt` (stempel waktu ISO) yang ditampilkan transparan pada linimasa riwayat.

### 3. Dimensi 3: Desain Visual & Calm UI
* **Hierarki Warna Role Badge:** Peran visual distandarkan: `CEO / Management` (Amber), `Head` (Biru), `Supervisor / TL` dan `PM` (Hijau Brand), serta `Employee` dan `Admin` (Netral Slate).
* **Calm UI pada Dialog Pratinjau Dampak:** Menggantikan teks merah peringatan intimidatif (`#991B1B`) dengan chip ringkasan tenang `[X Anggota]` berlatar lembut.
* **Indikator Proyek Tanpa Penugasan:** Proyek dengan 0 wewenang kini menampilkan teks miring abu-abu *Belum ada penugasan* alih-alih badge hijau yang menyesatkan.
* **Refaktor Kelas CSS Arsitektur Bersih:** Seluruh gaya sebaris (*inline styles*) pada tombol reset dan kartu metrik dipindahkan ke kelas CSS terkelola (`.btn-filter-reset`, `.metric-card.accent-* .metric-icon`).
* **Pembatasan Baris Deskripsi Proyek (`.project-desc-clamp`):** Deskripsi proyek dibatasi maksimal 2 baris agar ketinggian baris tabel selalu simetris dan rapi.

### 4. Dimensi 4: Interaktivitas, Navigasi & Alur Operasional Pengguna
* **Preservasi State Form pada Tombol *← Kembali ke Form*:** Pengguna yang kembali dari Modal Pratinjau Dampak untuk mengoreksi isian tidak akan kehilangan data yang telah diketik sebelumnya.
* **Penutupan Modal Lewat Backdrop:** Seluruh 7 modal dialog kini dapat ditutup dengan mengklik area gelap luar modal (*backdrop*) selain menggunakan tombol `✕`, tombol `Batal`, maupun tombol `Escape`.
* **Aksesibilitas Keyboard pada Kartu Metrik:** Ditambahkan atribut `tabindex="0"`, `role="button"`, `aria-label`, pendengar tombol `Enter` / `Space`, dan cincin fokus visual (`:focus-visible`).
* **Fokus Otomatis Input Dialog:** Setiap modal yang terbuka langsung mengarahkan kursor (`focus`) ke input pertama secara otomatis.
* **Penyelarasan Nilai Default Reset Filter:** Tombol reset filter Tab 2 mengembalikan filter status proyek ke kondisi awal baku (`'Aktif'`), bukan `'all'`.
* **Reset Timer Penumpukan Toast:** Variabel `toastTimeout` dibersihkan sebelum memicu toast berikutnya agar durasi tampil tidak terpotong saat aksi beruntun.

### 5. Dimensi 5: Penanganan Kondisi Ekstrem & Edge Cases
* **Sanitasi Entitas Teks (`escapeHtml`):** Seluruh interpolasi teks dinamis disaring melalui fungsi `escapeHtml` untuk mencegah *malformed HTML* dan risiko injeksi karakter khusus.
* **Filter Kelayakan Atasan Langsung:** Pilihan atasan langsung di Modal 1 dibatasi secara ketat hanya untuk personil yang memiliki penugasan aktif dengan peran kepemimpinan (`CEO / Management`, `Head`, `Supervisor / TL`, `PM`).
* **Batas Rentang Kalender Logis:** Seluruh bidang isian tanggal memiliki atribut `min="2020-01-01"` dan `max="2099-12-31"`.
* **Pembungkusan Kata Teks Panjang (`.project-name-cell` & `.history-reason-box`):** Mencegah layout tabel atau linimasa pecah saat menerima teks proyek atau alasan mutasi yang sangat panjang.

### 6. Dimensi 6: Integritas Kode, Aksesibilitas Web & Kepatuhan Standar Perancangan
* **Semantik Header Tabel (`scope="col"`):** Seluruh elemen `<th>` pada ketiga tabel utama dilengkapi atribut `scope="col"` sesuai standar pembaca layar (WCAG 2.1 AA).
* **Label Kontekstual Tombol Aksi Tabel:** Seluruh tombol aksi dinamis (`Ubah`, `Riwayat`, `Sunting`, `Kelola Wewenang`, `Akhiri Wewenang`) dilengkapi atribut `aria-label` deskriptif yang mencantumkan nama personil atau nama proyek terkait.
* **Sinkronisasi Dokumentasi Menyeluruh:** Dokumen perancangan ini diperbarui secara komprehensif sehingga mencerminkan kondisi kode aktual sistem secara 100% presisi.
* **Nol Error Konsol (*Zero Console Errors*):** Seluruh fungsi terverifikasi berjalan tanpa kesalahan runtime atau peringatan uncaught exception pada pengujian peramban langsung.

---

# BAGIAN 7: KETERKAITAN DATA DENGAN HALAMAN LAIN (CROSS-PAGE CONTRACTS)

Halaman 15 berfungsi sebagai *Single Source of Truth* untuk tata kelola struktur organisasi dan kewenangan proyek di seluruh ekosistem WorkPulse:

| Halaman Terkait | Bentuk Keterkaitan & Aliran Data |
|---|---|
| **Halaman 01 (Login)** | Menerima rute pendaratan akun `ADMINISTRATOR` (Hendra Wijaya) ke `/admin/mapping`, serta menyuplai master akun untuk otentikasi peran. |
| **Halaman 02 & 03 (Morning & Additional Work)** | Menentukan hierarki atasan langsung dan rujukan delegasi penugasan ad-hoc siang hari (*Assigned By*). |
| **Halaman 05 (Raise Blocker)** | Menjadi dasar penetapan penanggung jawab otomatis pada formulir pelaporan kendala (*Organizational Authority* vs *Project Authority*). |
| **Halaman 08 (Pulse Dashboard)** | Menyuplai pengelompokan tim berdasarkan divisi dan squad fungsional untuk visualisasi Team Pulse dan Department Pulse. |
| **Halaman 09 (Escalation Queue)** | Rantai pelaporan struktural bertingkat (Level 1 $\rightarrow$ Level 2 $\rightarrow$ Level 3) menjadi fondasi logika auto-eskalasi SLA tiket kendala. |
| **Halaman 11 (Compliance HRGA)** | Menentukan atasan langsung yang wajib hadir mendampingi tim HRGA dalam sesi dialog tinjauan ketidakpatuhan. |
| **Halaman 12 (Exemption Management)** | Menggunakan data master personil dan departemen untuk menerbitkan dispensasi penugasan dinas atau cuti bersama. |
| **Halaman 13 (Project Risk View)** | Menyuplai direktori master inisiatif proyek aktif dan daftar pejabat pemegang wewenang proyek (*Project Authority*). |
| **Halaman 14 (Escalation Aging)** | Menjadi acuan pemetaan penanggung jawab tiket menua (*aging blockers*) lintas fungsi dan level wewenang. |
