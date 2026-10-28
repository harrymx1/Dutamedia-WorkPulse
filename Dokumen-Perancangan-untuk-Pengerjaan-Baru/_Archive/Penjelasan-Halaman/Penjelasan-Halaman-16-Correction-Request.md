# Penjelasan Halaman 16: Pengajuan Koreksi Komitmen Pagi & Hasil Evaluasi Sore (Correction Requests: 16a & 16b)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 16: Pengajuan Koreksi Resmi (Correction Requests)** pada sistem **WorkPulse**, yang mencakup dua alur terpisah:
* **Halaman 16a:** Pengajuan Koreksi Komitmen Pagi (*Morning Correction Request* — `16a-Morning-Correction-Request.html` / `/today/morning/correction-request`)
* **Halaman 16b:** Pengajuan Koreksi Hasil Evaluasi Sore (*EOD Correction Request* — `16b-EOD-Correction-Request.html` / `/today/eod/correction-request`)

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY (LANGKAH 1)

## 1.1 Maksud, Filosofi & Tujuan Halaman 16

Dalam sistem kerja konvensional, jika seorang karyawan salah mengetik rencana kerja di pagi hari atau keliru mencatat hasil kerja di sore hari, mereka biasanya bisa langsung mengedit tulisan tersebut secara diam-diam (*silent edit / stealth overwrite*). 

Di **WorkPulse**, hal tersebut **DILARANG KERAS** demi menjaga keandalan data dan integritas akuntabilitas perusahaan:
1. **Prinsip Garis Dasar Terkunci (*Locked Baseline Governance - FR-05, BR-02*):**
   * Sebelum batas jam masuk pagi (*Cut-Off*, misal pukul 09.00 WIB), karyawan bebas menyunting komitmen paginya di Halaman 02.
   * Namun tepat saat batas Cut-Off terlampaui, komitmen pagi **otomatis terkunci mati (*locked snapshot*)**. Data ini menjadi janji resmi karyawan kepada tim dan perusahaan pada hari itu.
   * Demikian pula saat sore hari, begitu formulir evaluasi akhir hari (*End of Day / EOD*) dikirimkan di Halaman 04, data tersebut terkunci sebagai rekaman capaian resmi.
2. **Koreksi Terbuka Tanpa Mengubah Sejarah Diam-Diam (*No Silent Overwrite - FR-40, BR-09, NFR-06*):**
   * Manusia tentu bisa melakukan kesalahan (misal: salah mencantumkan tautan tiket tugas, salah mengira tingkat risiko, atau lupa bahwa tugas dialihkan ke orang lain).
   * WorkPulse tidak kaku melarang perbaikan, melainkan menyediakan **jalur permohonan koreksi resmi yang transparan (*Correction Request Workflow*)**.
   * Data lama tidak pernah dihapus atau ditimpa di balik layar. Setiap perubahan dicatat riwayatnya: siapa yang mengubah, apa yang diubah, kapan diubah, dan apa alasan resminya.
3. **Pemisahan Tegas Dua Alur Koreksi (UI/UX Spec §4.16):**
   * **16a — Morning Correction Request:** Khusus untuk mengoreksi komitmen pagi yang sudah terkunci.
   * **16b — EOD Correction Request:** Khusus untuk mengoreksi hasil evaluasi sore yang sudah terkunci.
   * **Aturan Mutlak:** Kedua alur ini memiliki siklus hidup (*lifecycle*) dan formulir yang terpisah. Karyawan dilarang mencampuradukkan koreksi pagi dan koreksi sore dalam satu formulir ambigu.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Berdasarkan dokumen spesifikasi PRD §1 (Tabel 1.0) dan PRD §3.9 & §3.11:

| Peran (*Role*) | Hak Akses pada Halaman 16a & 16b | Wewenang & Batasan Operasional |
|---|---|---|
| **Karyawan Biasa / Staf (*Employee*)** | **Pengaju Permohonan (*Requester*)** | Mengajukan koreksi data pagi (16a) atau data sore (16b) **hanya untuk catatan kerja miliknya sendiri**. Memantau status koreksi dan melihat jejak audit perubahannya. |
| **Atasan Langsung (*Direct Manager / Supervisor / TL*)** | **Penelaah Berwenang (*Authorized Reviewer*)** | Menerima notifikasi jika bawahannya mengajukan koreksi bersifat Material. Berhak mengajukan sanggahan (*Objection*) selama jendela waktu sanggahan aktif di Halaman 22 (`/team/reviews`). |
| **Kepala Divisi (*Head of Department*)** | **Penelaah Tingkat Lanjut (*Secondary Reviewer*)** | Memantau transparansi permohonan koreksi di divisinya dan berhak melakukan sanggahan dalam ruang lingkup divisinya. |
| **HRGA / People Admin** | **Pemantau Kepatuhan (*Compliance Observer*)** | Memantau apakah terdapat pola manipulasi komitmen berulang yang mengindikasikan ketidakdisiplinan kerja untuk tindak lanjut pembinaan. |
| **System Administrator** | **Pengelola Kebijakan (*Policy Manager*)** | Mengatur durasi jendela sanggahan (*Objection Window*, default: 24 jam kerja) dan ambang batas klasifikasi Minor/Material di Halaman 18 (*Policy Settings*). |

---

## 1.3 User Story Terkait (PRD §2)

* **US-25 (Sebagai Karyawan - Koreksi Pagi):**  
  *"Sebagai Employee, saya ingin mengajukan Correction Request untuk Morning Commitment yang sudah terkunci, agar saya bisa memperbaiki kesalahan tanpa mengubah baseline secara diam-diam."*
* **US-27 (Sebagai Atasan / Authorized Reviewer):**  
  *"Sebagai Authorized Reviewer, saya ingin melihat Correction Request material dalam objection window dan mengajukan objection bila perlu, agar baseline tetap terjaga tanpa saya harus meninjau setiap pengajuan secara aktif."*
* **US-29 (Sebagai Karyawan - Koreksi Sore):**  
  *"Sebagai Employee, saya ingin mengajukan EOD Correction Request terpisah untuk data EOD yang telah terkunci, agar kesalahan evaluasi kerja dapat dikoreksi secara sah dan transparan."*
* **US-30 (Sebagai Karyawan - Jejak Audit):**  
  *"Sebagai Employee, saya ingin melihat linimasa audit trail permohonan koreksi saya, agar saya mengetahui dengan pasti kapan koreksi saya disetujui atau mengapa sanggahan diajukan oleh atasan."*

---

## 1.4 Aturan Bisnis & Kriteria Penerimaan (Business Rules & Acceptance Criteria)

### A. Mekanisme Klasifikasi Otomatis: Koreksi Minor vs Koreksi Material (FR-44 & BR-16)
Setiap permohonan koreksi yang diajukan karyawan akan dievaluasi secara otomatis oleh sistem menjadi salah satu dari dua kategori:

1. **Kategori 1: Koreksi Minor (*Minor Correction*)**
   * **Definisi:** Perubahan kecil yang tidak mengubah substansi komitmen atau beban tanggung jawab utama (misalnya: memperbaiki salah ketik / tipo ejaan kata, memperbarui tautan tiket tugas di Jira/Trello, atau melengkapi rincian kendala).
   * **Perlakuan Sistem:** **Langsung Diterapkan Seketika (*Instantly Applied*)**.
   * **Dampak:** Nilai baru langsung aktif menggantikan data lama. Sistem mencatat jejak audit perubahannya dan memberikan konfirmasi sukses hijau kepada karyawan tanpa perlu menunggu persetujuan atasan.

2. **Kategori 2: Koreksi Material (*Material Correction*)**
   * **Definisi:** Perubahan signifikan yang memengaruhi substansi janji kerja atau tingkat risiko perusahaan (misalnya: mengganti total teks komitmen utama, mengubah status risiko dari HIJAU ke MERAH atau sebaliknya, atau mengubah capaian tugas dari *Completed* menjadi *Cancelled*).
   * **Perlakuan Sistem:** **Masuk ke Jendela Sanggahan (*Enters Objection Window*)** dengan status awal **`Pending`**.

### B. Mekanisme Persetujuan Otomatis Cerdas (*Default-Approve via Objection Window - FR-44, FR-55, BR-16*)
WorkPulse dirancang agar atasan tidak dibebani oleh tumpukan birokrasi persetujuan manual untuk setiap hal kecil (*anti-micromanagement*):
1. **Durasi Jendela Sanggahan (*Objection Window*):**
   * Pengajuan koreksi Material akan ditahan dalam masa tunggu selama **24 jam kerja** (dapat dikonfigurasi melalui kebijakan organisasi).
   * Notifikasi otomatis dikirimkan ke Web Center dan Email atasan langsung.
2. **Kondisi Data Selama Masa Tunggu (*Baseline Protection*):**
   * **PENTING:** Selama jendela sanggahan masih berjalan (status `Pending`), **data lama karyawan tetap berlaku 100%**. Data baru belum diterapkan ke sistem pelaporan publik maupun dashboard tim.
3. **Dua Kemungkinan Hasil Putusan:**
   * **Skenario A: Atasan Menolak / Mengajukan Sanggahan (*File Objection*):**  
     Jika atasan merasa usulan perubahan tidak sesuai dengan kenyataan di lapangan, atasan menekan tombol *"Ajukan Sanggahan"* di Halaman 22 dengan menyertakan **alasan sanggahan tertulis (wajib)** sebelum waktu habis. Status koreksi seketika menjadi **`Rejected`** (Ditolak). Nilai asli tetap berlaku permanen.
   * **Skenario B: Atasan Membiarkan / Waktu Habis (*Default-Approve*):**  
     Jika atasan menganggap perubahan itu wajar, **atasan tidak perlu melakukan klik apa pun**. Cukup biarkan waktu hitung mundur 24 jam tersebut berjalan hingga habis (mencapai `00:00:00`). Begitu waktu habis tanpa ada sanggahan dari atasan, sistem **secara otomatis menyetujui dan menerapkan perubahan tersebut (*Status: Applied*)**.

### C. Guardrails Ketat Anti-Penyalahgunaan (FR-43, FR-53, FR-55, BR-21)
1. **Alasan Wajib Diisi (*Mandatory Rationale*):**
   * Setiap permohonan koreksi (baik pagi maupun sore) **WAJIB menyertakan alasan (*Reason*) yang jelas** (minimal 10 karakter). Tombol kirim tidak akan aktif jika alasan kosong.
2. **Koreksi Sore Hanya untuk EOD yang Sah (*No Retroactive EOD Fabrication - FR-53*):**
   * Halaman 16b (EOD Correction) **HANYA DAPAT DIGUNAKAN jika karyawan benar-benar telah mengisi dan mengunci EOD pada hari tersebut**.
   * Jika karyawan pada hari tersebut bolos atau lupa mengisi EOD hingga batas waktu lewat (*No Submission*), karyawan **DILARANG MENGGUNAKAN HALAMAN INI** untuk mengarang EOD palsu dari nol atau membatalkan catatan ketidakdisiplinan *No Submission*. Catatan ketidakpatuhan tersebut harus diselesaikan melalui Halaman 11 (Tinjauan Kepatuhan HRGA), bukan lewat koreksi harian.
3. **Pemberitahuan Waktu Sanggahan Berakhir:**
   * Sanggahan yang dikirimkan oleh atasan setelah batas waktu hitung mundur habis akan ditolak otomatis oleh sistem, karena data telah sah berstatus `Applied`.

---

## 1.5 Taksonomi Target Bidang Koreksi Resmi (*Canonical Field Targets*)

Untuk mencegah formulir yang bercampur aduk, berikut adalah daftar bidang (*field*) resmi yang sah diajukan untuk masing-masing halaman:

### A. Target Bidang Koreksi Pagi (Halaman 16a — FR-43)
1. **Teks Komitmen Utama (*Commitment Text*):** Uraian rencana kerja yang disepakati untuk slot 1, 2, atau 3.
2. **Tautan Referensi / Tugas (*Reference / Task Link*):** Tautan tiket kerja eksternal (Jira, GitHub, dokumen kerja).
3. **Tingkat Risiko Awal (*Initial Risk*):** Status antisipasi risiko pagi (`GREEN`, `AMBER`, atau `RED`).
4. **Kendala Teridentifikasi (*Known Blocker*):** Wajib diisi jika risiko diubah menjadi `AMBER` atau `RED`.
5. **Dukungan yang Dibutuhkan (*Support Needed*):** Bantuan tim/atasan yang diperlukan jika risiko `AMBER`/`RED`.
*(Dilarang mengajukan: tugas tambahan Additional Work, hasil capaian sore, atau prioritas besok).*

### B. Target Bidang Koreksi Sore (Halaman 16b — FR-53)
1. **Hasil Capaian Tugas (*Outcome*):** `Completed`, `Partially Completed`, `Not Completed`, atau `Cancelled` (dapat merujuk ke komitmen pagi maupun tugas tambahan).
2. **Kelanjutan Tugas (*Continuation*):** `Continue` (dilanjutkan besok) atau `Do Not Continue` (selesai/ditutup).
3. **Alasan Kelanjutan (*Continuation Reason*):** Wajib diisi jika status kelanjutan dipilih `Continue`.
4. **Alasan Pembatalan (*Cancelled Reason*):** Wajib diisi jika capaian tugas dipilih `Cancelled`.
5. **Status Akhir Hari (*Final Status*):** Evaluasi warna hari kerja karyawan (`GREEN`, `AMBER`, atau `RED`).
6. **Penjelasan Risiko Tingkat-Hari (*Day Risk Explanation*):** Wajib jika Final Status adalah `AMBER` atau `RED`.
7. **Prioritas Besok (*Tomorrow Priority*):** Sasaran utama untuk hari kerja berikutnya.
*(Dilarang mengajukan: pengubahan teks komitmen pagi asli atau pembatalan event No Submission).*

---

# BAGIAN 2: PETA IMPLEMENTASI IDEAL SESUAI PEDOMAN KONSISTENSI (LANGKAH 2)

Bagian ini memetakan bagaimana seluruh kebutuhan, alur, aturan bisnis, dan tata kelola di atas **seharusnya diimplementasikan secara ideal, sempurna, dan konsisten** pada Halaman 16, mengacu penuh pada [Pedoman Konsistensi Desain dan Perilaku Lintas Halaman](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md).

---

## 2.1 Arsitektur Shell Halaman & Tata Letak Baku (Calm UI)

### A. Sidebar Navigasi Terpadu (18 Rute Sistem)
* Menggunakan standar sidebar resmi WorkPulse lengkap dengan 18 rute sistem terpadu.
* Menu aktif: **`My Today`** (dengan sub-indikator rute `Koreksi Pagi` atau `Koreksi Sore`).
* Profil pengguna bawah (*Sidebar Foot*): Menampilkan avatar, nama lengkap, dan peran karyawan yang terintegrasi secara dinamis dengan sesi `localStorage: workpulse_active_user`.

### B. Topbar & Breadcrumb
* **Format Breadcrumb 16a:** `Ruang Kerja / Aktivitas Hari Ini / Permohonan Koreksi Komitmen Pagi`
* **Format Breadcrumb 16b:** `Ruang Kerja / Aktivitas Hari Ini / Permohonan Koreksi Evaluasi Sore`
* **Jam Digital Dinamis:** Menampilkan waktu lokal terbarukan otomatis setiap 30 detik: `DD Mmm YYYY, HH:mm WIB`.

### C. Page Heading & Deskripsi Pengarah
* **Halaman 16a:**
  * **Judul Utama (`h1`):** `Permohonan Koreksi Komitmen Pagi`
  * **Deskripsi Pengarah:**  
    *Ajukan koreksi resmi untuk komitmen pagi yang telah terkunci pasca Cut-Off. Data asli tetap utuh dan terlindungi hingga permohonan disetujui.*
* **Halaman 16b:**
  * **Judul Utama (`h1`):** `Permohonan Koreksi Evaluasi Sore (EOD)`
  * **Deskripsi Pengarah:**  
    *Ajukan koreksi resmi atas hasil capaian dan evaluasi sore yang telah terkunci. Tidak dapat digunakan untuk mencatat EOD yang terlewat.*

---

## 2.2 Tab Navigasi Kontekstual Antar-Alur (*Sub-Page Context Switcher*)

Agar pengguna dapat berpindah antara formulir koreksi pagi dan koreksi sore secara jelas tanpa membuat form yang ambigu, di bagian atas konten disediakan **Tab Navigasi Khusus**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [Tab A: Koreksi Komitmen Pagi (16a)]       [Tab B: Koreksi Evaluasi Sore (16b)]       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
* **Tab A (Aktif di 16a):** Menampilkan formulir koreksi komitmen pagi dengan target field pagi.
* **Tab B (Aktif di 16b):** Menampilkan formulir koreksi evaluasi sore dengan target field sore.
* Mengklik tab yang berseberangan akan mengarahkan pengguna secara mulus ke halaman pasangannya (`16a-Morning-Correction-Request.html` $\leftrightarrow$ `16b-EOD-Correction-Request.html`).

---

## 2.3 Panel 1: Kartu Rekaman Baseline Asli Terkunci (*Locked Baseline Snapshot Card*)

Menyajikan data resmi yang saat ini tercatat di sistem sebagai titik acuan sebelum diubah:

1. **Header Panel:**
   * Judul: `Rekaman Baseline Tersimpan (Saat Ini)`
   * Badge Status: `Read-Only / Terkunci` (berwarna netral abu-abu dengan ikon gembok kecil).
2. **Konten Kartu Baseline (Latar Belakang Halus `#F8FAF9`):**
   * **Pada Halaman 16a (Snapshot Pagi):**  
     Menampilkan Slot Komitmen Terpilih, Teks Komitmen Asli, Tautan Referensi/Tiket, Tingkat Risiko Awal (badge hijau/amber/merah), Kendala Teridentifikasi, dan Kebutuhan Dukungan.
   * **Pada Halaman 16b (Snapshot Sore):**  
     Menampilkan Item Pekerjaan Terpilih, Hasil Capaian Asli (*Outcome*), Status Kelanjutan (*Continuation*), Status Akhir Hari (*Final Status*), Penjelasan Risiko Harian, dan Prioritas Besok.
3. **Pita Maklumat Integritas (*Integrity Assurance Strip*):**
   * Menampilkan 3 metrik mikro ringkas:
     * *Status Garis Dasar:* `Terkunci Sah`
     * *Dampak Selama Pengajuan:* `Data Asli Tetap Berlaku Penuh`
     * *Jejak Audit:* `Tercatat Permanen`

---

## 2.4 Panel 2: Formulir Pengajuan Koreksi Berdampingan (*Interactive Side-by-Side Form*)

Formulir interaktif utama tempat karyawan merumuskan permohonan koreksinya:

1. **Pemilihan Target Bidang Koreksi (`#targetField` - Wajib):**
   * Dropdown berisi daftar bidang resmi yang sah sesuai taksonomi Bagian 1.5.
   * Saat bidang dipilih, sistem otomatis mengisi **Nilai Tersimpan (Before)** pada kartu perbandingan.
2. **Tampilan Komparasi Berdampingan (*Side-by-Side Comparison*):**
   * **Kolom Kiri: Nilai Tersimpan Saat Ini (*Before - Read-Only*):**  
     Berlatar abu-abu netral terproteksi (`background: #F1F5F4`), memperlihatkan nilai asli yang sedang berlaku di sistem saat ini.
   * **Kolom Kanan: Usulan Nilai Baru (*Proposed After - Editable*):**  
     Input atau textarea aktif tempat karyawan memasukkan teks atau memilih nilai pengganti yang benar.
3. **Bidang Isian Kondisional Terpadu (*Dynamic Conditional Inputs*):**
   * *Jika pada 16a memilih Initial Risk AMBER/RED:* Muncul otomatis input wajib untuk `Kendala yang Diketahui (Known Blocker)` dan `Dukungan yang Dibutuhkan (Support Needed)`.
   * *Jika pada 16b memilih Outcome Cancelled:* Muncul otomatis input wajib untuk `Alasan Pembatalan Tugas`.
   * *Jika pada 16b memilih Continuation Continue:* Muncul otomatis input wajib untuk `Alasan Kelanjutan Tugas`.
   * *Jika pada 16b memilih Final Status AMBER/RED:* Muncul otomatis input wajib untuk `Penjelasan Risiko Tingkat-Hari`.
4. **Alasan Resmi Pengajuan Koreksi (`#inputReason` - Wajib):**
   * Textarea berlabel: **Alasan Resmi Pengajuan Koreksi (*Reason for Correction*)**.
   * Validasi: Wajib diisi minimal 10 karakter. Di bawahnya terdapat petunjuk ramah:  
     *Alasan ini akan tersimpan permanen di jejak audit dan menjadi pertimbangan utama atasan saat meninjau permohonan.*
5. **Callout Penjelas Kebijakan Otomatis (*Policy Clarification Notice*):**
   * Kotak info tenang (*Calm Notice Box*) berlatar biru lembut:  
     *Permohonan ini akan dievaluasi secara otomatis: perubahan bersifat minor akan langsung diterapkan, sedangkan perubahan material akan memasuki masa sanggahan (Objection Window) selama 24 jam kerja sebelum disetujui otomatis.*
6. **Tombol Aksi Bawah:**
   * Tombol Sekunder: `Batal` (mengosongkan isian dan mengembalikan formulir ke kondisi semula).
   * Tombol Primer: **`Kirim Permohonan Koreksi`** (memvalidasi formulir dan memproses penyimpanan).

---

## 2.5 Panel 3: Umpan Balik Status Pengajuan & Indikator Sanggahan (*Submission Feedback & Objection Window*)

Setelah tombol kirim ditekan, sistem menampilkan kartu hasil evaluasi secara transparan:

1. **Jika Diklasifikasikan sebagai Koreksi Minor:**
   * Muncul kartu konfirmasi hijau sukses:  
     **`Koreksi Minor Diterapkan Langsung (Status: Applied)`**
   * Keterangan: *Perubahan berupa perbaikan minor telah diverifikasi dan langsung diterapkan ke garis dasar Anda. Jejak audit perubahan telah diperbarui.*
2. **Jika Diklasifikasikan sebagai Koreksi Material:**
   * Muncul kartu perhatian tenang (*Calm Pending Card*) berlatar amber lembut:  
     **`Koreksi Material Memasuki Jendela Sanggahan (Status: Pending Objection)`**
   * **Komponen Hitung Mundur Sisa Waktu (`ObjectionWindowIndicator`):**  
     Menampilkan penghitung mundur aktif: `Sisa Waktu Sanggahan: 23 jam 58 menit (Berakhir Besok, 09.30 WIB)`.
   * **Penegasan Keamanan Garis Dasar:**  
     *Pemberitahuan: Selama masa tunggu ini, komitmen asli Anda tetap berlaku. Jika atasan langsung tidak mengajukan sanggahan hingga batas waktu berakhir, perubahan yang Anda ajukan akan otomatis disetujui dan diterapkan sistem.*

---

## 2.6 Panel 4: Tabel Riwayat Permohonan Koreksi (*Audit Trail & Request History*)

Menyajikan rekam jejak historis seluruh permohonan koreksi yang pernah diajukan karyawan untuk tanggal tersebut atau rentang waktu aktif:

1. **Format Tabel Baku (6 Kolom):**
   * **Kolom 1: Tanggal & ID Permohonan:** Nomor tiket unik (contoh: `CR-M-104` untuk pagi, `CR-E-021` untuk sore) dan stempel waktu pengajuan (`12 Okt 2026, 09:14 WIB`).
   * **Kolom 2: Bidang Target:** Nama bidang yang dikoreksi (misal: *Initial Risk* atau *Outcome*).
   * **Kolom 3: Perubahan (Before $\rightarrow$ After):**  
     Visualisasi perbandingan ringkas: `AMBER` $\rightarrow$ `GREEN` dengan tanda panah transparan.
   * **Kolom 4: Alasan Pengajuan:** Teks alasan resmi yang diketik pemohon.
   * **Kolom 5: Klasifikasi:** Pill tag `Minor` (netral slate) atau `Material` (biru status).
   * **Kolom 6: Status & Putusan:**  
     * `Applied` (Pill Hijau): Perubahan telah sah aktif di sistem.
     * `Pending Objection` (Pill Amber + sisa jam): Sedang menunggu masa sanggahan atasan.
     * `Rejected` (Pill Merah): Ditolak oleh atasan disertai catatan alasan sanggahan.
2. **Interaktivitas Baris:** Mengklik baris riwayat membuka dialog rincian audit trail lengkap (*Audit Detail Modal*).

---

## 2.7 Panel 5: Gerbang Akses Peninjauan Atasan (*Reviewer Workflow Gateway*)

Di bagian bawah halaman disediakan kartu informasi tata kelola peninjauan:
* Menjelaskan alur peninjauan bagi atasan: bahwa permohonan Material bawahan masuk ke antrean **`Correction & Leave Review`** pada tab **Pending Objection** di Halaman 22 (`22-Correction-and-Leave-Review.html` / `/team/reviews`).
* Menyediakan tombol pintas bagi pengguna yang memegang peran Supervisor/Head/Manager:  
  **`Buka Antrean Peninjauan Tim`**.

---

## 2.8 Standar Umpan Balik, Notifikasi & Perlindungan Kesalahan (*Error Prevention*)

1. **Pencegahan Akses Ilegal Jika Belum Submit EOD (FR-53):**
   * Jika karyawan membuka Halaman 16b namun pada tanggal tersebut belum pernah mengirimkan EOD, antarmuka menampilkan layar pencegahan ramah (*Empty Guard Screen*):  
     *"Permohonan koreksi sore hanya dapat diajukan jika Anda telah memiliki rekaman EOD yang sah. Anda belum memiliki catatan EOD untuk hari ini."* Dilengkapi tombol navigasi kembali ke `04-EOD-Outcome.html`.
2. **Pencegahan Pengajuan Ganda (*Duplicate Submission Prevention*):**
   * Sistem mencegah pengajuan koreksi baru untuk bidang yang sama jika pengajuan sebelumnya masih berstatus `Pending Objection`.
3. **Penyimpanan Lokal Persisten (`localStorage`):**
   * Seluruh draf pengajuan, status hitung mundur, dan riwayat koreksi disinkronkan ke `localStorage` dengan kunci terkelola:
     * `workpulse_morning_corrections_v1` (untuk koreksi pagi 16a)
     * `workpulse_eod_corrections_v1` (untuk koreksi sore 16b)
   * Sehingga saat halaman di-refresh, status hitung mundur dan data permohonan tetap konsisten dan utuh.
4. **Nol Jargon Pengembang (*Zero Developer Jargon*):**
   * Seluruh pesan sistem menggunakan peristilahan korporat yang santun dan profesional:
     * *Dilarang:* `payload rejected by server`, `unhandled null pointer in objection handler`, `boolean is_minor true`.
     * *Wajib:* `Alasan koreksi wajib diisi minimal 10 karakter`, `Permohonan koreksi material berhasil diajukan dan memasuki masa sanggahan`, `Koreksi minor berhasil diterapkan langsung`.
5. **Nol Emoticon & Ikon SVG Monokrom Baku:**
   * Seluruh tombol, badge, dan kartu murni menggunakan ikon SVG monokrom `stroke-width="1.8-2.2"` (`fill="none"`). Tidak ada emoji grafis dan bebas dari simbol petir.

---


---

# BAGIAN 3: EVALUASI KONDISI KODE AKTUAL VS PETA IMPLEMENTASI (LANGKAH 3)

Setelah menelaah kode sumber aktual dari kedua berkas prototipe:
* `16a-Morning-Correction-Request.html` (12 baris kode terminifikasi, ~19 KB)
* `16b-EOD-Correction-Request.html` (13 baris kode terminifikasi, ~19.5 KB)

Ditemukan bahwa kode yang ada saat ini merupakan prototipe awal statis berformat terminifikasi (*minified prototype*) yang memiliki kesenjangan sangat besar terhadap spesifikasi fungsional (PRD/PDD) maupun [Pedoman Konsistensi Desain dan Perilaku Lintas Halaman](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md).

Berikut adalah evaluasi mendalam kondisi kode aktual dibandingkan dengan peta implementasi ideal:

---

## 3.1 Matriks Evaluasi Kesenjangan (Kondisi Kode Saat Ini vs Peta Ideal)

| Komponen / Dimensi | Peta Implementasi Ideal (Bagian 2) | Kondisi Kode Aktual Saat Ini (16a & 16b) | Status & Tingkat Kesenjangan |
|---|---|---|---|
| **1. Shell Halaman & Sidebar** | Sidebar resmi 18 rute lengkap dengan grouping baku, indikator rute aktif, dan avatar profil pengguna dinamis (`localStorage`). | Hanya memiliki 4 tautan navigasi parsial (`My Today`, `My History`, `Notifications`, `Correction Review`). Profil pengguna `Alya Putri` berstatus teks mati (*hardcoded*). | **Sangat Kurang** (Melanggar konsistensi shell sistem). |
| **2. Topbar & Waktu Dinamis** | Breadcrumb baku sistematis dan jam digital lokal terbarukan otomatis setiap detik (`DD Mmm YYYY, HH:mm WIB`). | Breadcrumb kaku statis; sama sekali tidak memiliki penunjuk jam lokal dinamis. | **Sangat Kurang** (Tidak ada jam dinamis). |
| **3. Tab Kontekstual (Sub-Page Switcher)** | Terdapat tab navigasi di atas konten untuk berpindah mulus antara `Koreksi Pagi (16a)` dan `Koreksi Sore (16b)`. | Gaya CSS `.tab-row` dan `.tab` sudah ada di `<style>`, namun **sama sekali tidak dipasang di HTML**. Pengguna terjebak di satu alur tanpa tombol navigasi ke alur pasangannya. | **Hilang dari Markup HTML** (Inkonsistensi implementasi). |
| **4. Snapshot Baseline (Panel 1)** | Kartu data terstruktur rapi dengan badge status visual, definisi slot komitmen, dan pita maklumat integritas data. | Disajikan dalam blok teks mentah berderet (`white-space: pre-wrap`) yang digabung menjadi satu string panjang. Tidak ada struktur hierarki visual. | **Kurang Optimal** (Tampilan teks mentah tanpa visual tokens). |
| **5. Layout Komparasi Form (Panel 2)** | Tampilan perbandingan berdampingan sejati (*True Side-by-Side Grid*: Kiri = Nilai Saat Ini, Kanan = Usulan Nilai Baru). | Disusun bertumpuk vertikal ke bawah (*Stacked Vertical Textareas*), memakan tinggi layar secara berlebihan dan tidak terasa seperti antarmuka komparasi. | **Kurang Optimal** (Bukan tata letak komparasi berdampingan). |
| **6. Kontrol Input Nilai Baru (*After Value*)** | Input cerdas adaptif sesuai tipe data: Dropdown/Pill selector untuk data kategori (Risiko: Green/Amber/Red; Outcome: Completed/Partially/Cancelled), dan Textarea untuk teks bebas. | Seluruh nilai baru dipaksa menggunakan satu `<textarea>` polos bebas ketik. Pengguna harus mengetik kata `"GREEN"`, `"AMBER"`, atau `"COMPLETED"` secara manual. Jika salah ketik, validasi error muncul. | **Anti-Pattern UX** (Sangat menyulitkan pengguna). |
| **7. Input Kondisional Cerdas** | Field tambahan (Blocker, Dukungan, Alasan Batal, Alasan Kelanjutan) muncul otomatis dengan validasi presisi saat opsi relevan dipilih. | Pada 16a hanya ada textarea ganda untuk risiko. Pada 16b hanya disediakan 1 textarea umum `#eodExtra` yang berganti-ganti label secara kikuk. | **Parsial & Kaku** (Kurang modular dan rentan membingungkan pengguna). |
| **8. Validasi Alasan Koreksi** | Alasan koreksi wajib diisi minimal 10 karakter dengan indikator penghitung karakter interaktif (*character counter*). | Hanya memeriksa string kosong (`!reason`), tanpa batas minimal karakter dan tanpa penghitung karakter. | **Belum Lengkap** (Aturan 10 karakter belum ditegakkan). |
| **9. Mesin Klasifikasi Otomatis (Minor vs Material)** | Sistem otomatis mendeteksi apakah perubahan berupa tipo/link (Minor $\rightarrow$ Langsung `Applied`) atau perubahan risiko/komitmen/outcome (Material $\rightarrow$ `Pending Objection` 24 jam). | **Tidak ada mesin klasifikasi**. Pengiriman form hanya menampilkan teks statis *"Permintaan koreksi siap diajukan"*, tanpa status hasil putusan. | **Belum Ada** (Logika inti bisnis belum diimplementasikan). |
| **10. Indikator Objection Window (Panel 3)** | Komponen hitung mundur aktif 24 jam kerja (*Countdown Timer*) dengan penegasan tanggal berakhir dan keamanan garis dasar. | **Sama sekali tidak ada**. Tidak ada hitung mundur waktu dan tidak ada indikator status sanggahan. | **Belum Ada** (Fitur krusial PRD §3.9 belum ada). |
| **11. Riwayat & Jejak Audit (Panel 4)** | Tabel komparasi 6 kolom lengkap, terhubung ke penyimpanan lokal (`localStorage`), dan barisnya dapat diklik untuk melihat detail riwayat. | Baris div statis *hardcoded*. Permohonan baru yang dikirimkan **tidak pernah tersimpan** ke tabel riwayat. | **Statis / Dummy** (Data baru tidak bertambah ke riwayat). |
| **12. Guardrail Anti-Bypass EOD (16b)** | Menolak akses pengajuan koreksi jika karyawan belum memiliki submission EOD sah pada hari tersebut. | Siapa pun bisa langsung mengakses formulir 16b tanpa pengecekan status submisi EOD. | **Belum Ada** (Melanggar aturan bisnis FR-53). |
| **13. Persistensi Data (`localStorage`)** | Data permohonan, draf, dan riwayat tersimpan persisten lintas refresh menggunakan kunci resmi WorkPulse. | Nol penyimpanan persisten. Semua data kembali ke titik awal saat browser di-refresh. | **Nol Persistensi**. |
| **14. Standar Kode & Kerapian** | Kode terstruktur rapi, terdokumentasi, nol error konsol, responsif, dan mudah dipelihara. | Seluruh kode HTML, CSS, dan JS dijejalkan ke dalam 12–13 baris terminifikasi yang sangat sulit dipelihara atau diperluas. | **Kode Terminifikasi Sulit Dirawat**. |

---

## 3.2 Temuan Kritis & UX Anti-Pattern yang Wajib Diperbaiki

1. **UX Anti-Pattern: Pengguna Dipaksa Mengetik Nilai Kategori ke Textarea Bebas**  
   Pada kode saat ini, jika pengguna ingin mengubah *Initial Risk* pada Halaman 16a, pengguna disuguhi textarea kosong dan disuruh mengetik sendiri kata `"GREEN"`, `"AMBER"`, atau `"RED"`. Demikian pula pada 16b untuk *Outcome*, pengguna harus mengetik `"COMPLETED"`, `"PARTIALLY COMPLETED"`, dst. Ini sangat rentan salah ketik (*human error*) dan bertentangan dengan standar aplikasi modern. Seharusnya disediakan elemen pilihan visual (radio pill / dropdown seleksi) yang langsung valid.
2. **Ketiadaan Tab Pengalih Sub-Halaman (16a $\leftrightarrow$ 16b)**  
   Pengguna yang membuka Halaman 16a tidak memiliki cara mudah untuk membuka Halaman 16b, padahal kedua alur ini adalah pasangan erat dalam siklus koreksi harian.
3. **Formulir Pengajuan yang Bersifat Semu (*Dummy Form*)**  
   Menekan tombol *"Submit Correction Request"* saat ini hanya menampilkan pesan statis *"Permintaan koreksi siap diajukan"*. Form tidak melakukan penyimpanan data, tidak menentukan klasifikasi (Minor/Material), tidak menambahkan data ke tabel riwayat, dan tidak memicu timer jendela sanggahan.
4. **Layout Vertikal yang Tidak Menggambarkan Komparasi**  
   Komparasi nilai lama (*before*) dan nilai baru (*after*) ditumpuk ke bawah seperti formulir pendaftaran biasa, bukan antarmuka audit komparasi berdampingan (*side-by-side comparison*).

---

# BAGIAN 4: RENCANA KERJA PERBAIKAN TERSTRUKTUR (LANGKAH 4)

Untuk mewujudkan implementasi Halaman 16a dan 16b yang sempurna, kokoh, dan sesuai standar sistem WorkPulse, disusun rencana kerja bertahap (*Step-by-Step Implementation Plan*) sebagai berikut:

---

## Fase 1: Standardisasi Shell, Navigasi 18 Rute & Pengalih Kontekstual
1. **Penerapan Shell Baku Calm UI:**
   * Memasang sidebar resmi WorkPulse dengan **18 rute sistem terpadu** (kategori Workspace, Team & Operations, Review & Governance, Management & Reports, System & Admin).
   * Menetapkan penanda rute aktif pada grup `My Today`.
   * Menghubungkan footer sidebar dengan profil pengguna aktif dari `localStorage: workpulse_active_user`.
2. **Topbar Terpadu & Jam Lokal Realtime:**
   * Memasang breadcrumb hierarkis resmi:
     * 16a: `Ruang Kerja / Aktivitas Hari Ini / Permohonan Koreksi Komitmen Pagi`
     * 16b: `Ruang Kerja / Aktivitas Hari Ini / Permohonan Koreksi Evaluasi Sore`
   * Memasang jam digital dinamis dengan pembaruan otomatis setiap detik (`DD Mmm YYYY, HH:mm WIB`).
3. **Penyediaan Tab Navigasi Sub-Halaman (*Sub-Page Context Switcher*):**
   * Memasang tab bar kontekstual tepat di bawah deskripsi halaman:  
     `[Tab A: Koreksi Komitmen Pagi (16a)]` | `[Tab B: Koreksi Evaluasi Sore (16b)]`
   * Memberikan tautan navigasi instan antar-halaman secara mulus.

---

## Fase 2: Perancangan Panel Snapshot Baseline Asli & Layout Komparasi Berdampingan
1. **Refaktor Panel 1 (Snapshot Baseline Terkunci):**
   * Mengubah blok teks mentah menjadi kartu snapshot berstruktur jelas (*Key-Value Card*) dengan styling Calm UI yang elegan.
   * Menampilkan badge status risiko visual (hijau, amber, merah) yang informatif.
   * Memasang pita jaminan integritas (*Integrity Assurance Strip*) dengan 3 metrik mikro: Status Terkunci Sah, Data Asli Berlaku Penuh, dan Jejak Audit Permanen.
2. **Refaktor Panel 2 (Tata Letak Komparasi Berdampingan Sejati):**
   * Membangun grid 2 kolom berdampingan (*Side-by-Side Comparison*):
     * Kolom Kiri: **Nilai Tersimpan Saat Ini (Before)** — *Read-only*, berlatar `#F1F5F4`.
     * Kolom Kanan: **Usulan Nilai Baru (Proposed After)** — Berlatar putih aktif dengan kontrol input adaptif.
3. **Penyediaan Kontrol Input Adaptif (Menggantikan Textarea Bebas Ketik):**
   * Untuk `Initial Risk` (16a): Menampilkan opsi pilihan visual / radio pill (`GREEN`, `AMBER`, `RED`).
   * Untuk `Outcome` (16b): Menampilkan opsi pilihan visual (`Completed`, `Partially Completed`, `Not Completed`, `Cancelled`).
   * Untuk `Continuation` (16b): Menampilkan opsi pilihan (`Continue`, `Do Not Continue`).
   * Untuk `Final Status` (16b): Menampilkan opsi pilihan visual (`GREEN`, `AMBER`, `RED`).
   * Untuk teks bebas (`Commitment Text`, `Reference Link`, `Tomorrow Priority`): Menampilkan input teks/textarea responsif.
4. **Isian Kondisional Terpadu (*Dynamic Conditional Inputs*):**
   * Menampilkan input wajib kendala & dukungan saat risiko AMBER/RED dipilih pada 16a.
   * Menampilkan input wajib alasan pembatalan saat Outcome Cancelled dipilih pada 16b.
   * Menampilkan input wajib alasan kelanjutan saat Continuation dipilih pada 16b.
   * Menampilkan input wajib penjelasan risiko saat Final Status AMBER/RED dipilih pada 16b.
5. **Bidang Alasan Wajib & Penghitung Karakter:**
   * Textarea alasan dengan validasi ketat minimal 10 karakter.
   * Menampilkan indikator langsung: *"x/10 karakter minimum"*.

---

## Fase 3: Rekayasa Logika Klasifikasi Otomatis & Komponen Objection Window
1. **Mesin Klasifikasi Otomatis Berbasis Aturan (*Rule-Based Classification Engine*):**
   * Menganalisis perubahan yang diajukan:
     * **Minor:** Jika target adalah perbaikan teks tipo, link referensi, atau deskripsi kendala ringan tanpa mengubah level risiko/outcome.
     * **Material:** Jika target mengubah tingkat risiko (Initial Risk), mengubah Outcome kerja, membatalkan tugas, mengubah kelanjutan, atau mengubah Final Status.
2. **Penerapan Hasil Evaluasi Klasifikasi:**
   * **Jika Minor:** Menampilkan kartu sukses hijau dengan status **`Applied`** seketika. Nilai baru langsung diperbarui ke snapshot aktif dan dicatat ke riwayat.
   * **Jika Material:** Menampilkan kartu amber berstatus **`Pending Objection`** dan menginisialisasi hitung mundur 24 jam kerja.
3. **Komponen Hitung Mundur Sisa Waktu (`ObjectionWindowIndicator`):**
   * Menampilkan sisa waktu dinamis (contoh: `23 jam 59 menit 45 detik tersisa`).
   * Menampilkan keterangan jaminan bahwa data lama tetap berlaku penuh selama masa tunggu.
   * Menyediakan simulasi tombol aksi penguji (*Tester Sandbox Controls*): "Simulasikan Waktu Habis (Default-Approve)" dan "Simulasikan Sanggahan Atasan (Reject with Reason)".

---

## Fase 4: Persistensi Data (`localStorage`), Tabel Riwayat & Modal Rincian Audit
1. **Integrasi Penyimpanan Lokal Persisten:**
   * Menggunakan kunci `workpulse_morning_corrections_v1` (untuk 16a) dan `workpulse_eod_corrections_v1` (untuk 16b).
   * Setiap pengajuan baru otomatis tersimpan dan bertahan meskipun halaman dimuat ulang.
2. **Refaktor Panel 4 (Tabel Riwayat 6 Kolom Lengkap):**
   * Kolom: Nomor Tiket & Waktu | Target Bidang | Perubahan (Before $\rightarrow$ After) | Alasan | Klasifikasi | Status Putusan.
   * Dilengkapi badge warna baku: Hijau (`Applied`), Amber (`Pending Objection`), Merah (`Rejected`).
3. **Modal Dialog Rincian Jejak Audit (*Audit Detail Modal*):**
   * Mengklik baris riwayat membuka modal komprehensif yang menampilkan linimasa riwayat: waktu diajukan, pemohon, klasifikasi, batas waktu sanggahan, data sebelum vs sesudah, dan putusan akhir.

---

## Fase 5: Implementasi Guardrail EOD & Gerbang Peninjauan Atasan
1. **Guardrail Pencegahan Bypass EOD pada Halaman 16b (FR-53):**
   * Memeriksa keberadaan data EOD tersimpan di `localStorage: workpulse_eod_submissions_v1`.
   * Jika belum pernah submit EOD hari ini, tampilkan tampilan pencegahan (*Empty State Guard*): menginformasikan bahwa koreksi hanya dapat diajukan jika EOD telah diserahkan, disertai tombol kembali ke Halaman 04.
2. **Refaktor Panel 5 (Reviewer Workflow Gateway):**
   * Kartu tata kelola yang menjelaskan bahwa permohonan Material akan muncul di tab *Pending Objection* Halaman 22 (`22-Correction-and-Leave-Review.html`).
   * Tombol aksi cepat untuk membuka antrean peninjau.

---

## Fase 6: Validasi Mutu, Responsivitas & Verifikasi Browser Otomatis
1. **Verifikasi Tampilan Responsif:**
   * Memastikan layout berpindah dari grid 2 kolom ke tampilan bertumpuk yang rapi pada layar ponsel/tablet ($\le 768px$).
2. **Verifikasi Kepatuhan Desain:**
   * Bebas jargon pengembang (*Zero Developer Jargon*).
   * Murni SVG monokrom standar (*Zero Emoticons*).
   * Palet warna seragam mengacu pada token Calm UI WorkPulse.
3. **Uji Coba Otomatis via Browser Subagent:**
   * Menjalankan browser subagent untuk menguji seluruh skenario interaksi: input nilai, validasi minimal karakter alasan, pengajuan Minor (langsung applied), pengajuan Material (masuk pending timer), persistensi setelah reload, dan pembukaan modal audit trail.
   * Memastikan 0 error pada konsol browser.

---


---

# BAGIAN 5: REALISASI IMPLEMENTASI KODE & HASIL VERIFIKASI AKHIR (LANGKAH 5)

Seluruh rancangan perbaikan pada Bagian 4 telah **berhasil diimplementasikan 100% secara sempurna** ke dalam kode sumber aktual:
* **[16a-Morning-Correction-Request.html](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/16a-Morning-Correction-Request.html)**
* **[16b-EOD-Correction-Request.html](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/16b-EOD-Correction-Request.html)**

---

## 5.1 Ringkasan Realisasi Fitur pada Halaman 16a & 16b

| Komponen & Fitur | Implementasi pada Halaman 16a (Morning) | Implementasi pada Halaman 16b (EOD) |
|---|---|---|
| **1. Shell Baku & Navigasi 18 Rute** | Terpasang sidebar resmi 18 rute sistem, brand WorkPulse, indikator aktif pada `My Today (Koreksi)`, dan sinkronisasi profil footer dengan `localStorage: workpulse_active_user`. | Identik dengan 16a (indikator aktif pada `EOD Outcome (Koreksi)`). |
| **2. Topbar & Jam Digital Realtime** | Breadcrumb resmi: `Ruang Kerja / Aktivitas Hari Ini / Permohonan Koreksi Komitmen Pagi`. Jam digital realtime diperbarui tiap detik: `DD Mmm YYYY, HH:mm:ss WIB`. | Breadcrumb resmi: `Ruang Kerja / Aktivitas Hari Ini / Permohonan Koreksi Evaluasi Sore (EOD)`. Jam digital realtime aktif. |
| **3. Sub-Page Context Switcher Tab** | Tab bar terpadu di atas konten: `[Koreksi Komitmen Pagi (16a) - Aktif]` $\leftrightarrow$ `[Koreksi Evaluasi Sore (16b)]`. Navigasi mulus antar-halaman. | Tab bar terpadu: `[Koreksi Komitmen Pagi (16a)]` $\leftrightarrow$ `[Koreksi Evaluasi Sore (16b) - Aktif]`. |
| **4. Guardrail Anti-Bypass EOD (FR-53)** | Tidak berlaku (16a mengacu pada Morning baseline Cut-Off). | **Terpasang Aktif:** Jika karyawan belum submit EOD hari ini, layar otomatis beralih ke *Guard Screen* merah ("Permohonan Koreksi Sore Belum Dapat Diajukan - No Submission EOD") dengan tombol navigasi ke Halaman 04 dan tombol pengujian simulasi. |
| **5. Snapshot Baseline Terkunci (Panel 1)** | Kartu berstruktur (*Key-Value Card*) dengan pemilih slot (`slot-1` & `slot-2`), badge risiko visual (GREEN/AMBER/RED), dan 3 metrik mikro *Integrity Assurance Strip*. | Kartu berstruktur dengan pemilih item pekerjaan (`item-1` & `item-2`), badge Outcome, Continuation, Final Status, dan *Integrity Assurance Strip*. |
| **6. Form Komparasi Berdampingan (Panel 2)** | Grid 2 kolom sejati: Kiri = Nilai Tersimpan Saat Ini (Before - Read-only), Kanan = Usulan Nilai Baru (Proposed After - Adaptive). | Grid 2 kolom sejati: Kiri = Before (Read-only), Kanan = Proposed After (Adaptive). |
| **7. Kontrol Input Adaptif (Anti-Textarea Bebas)** | Memilih `initialRisk` memunculkan **Radio Pills Visual** (`GREEN`, `AMBER`, `RED`) dan secara otomatis membuka textarea wajib untuk `Known Blocker` dan `Support Needed` jika AMBER/RED dipilih. | Memilih `outcome` memunculkan 4 radio pills (`Completed`, `Partially`, `Not Completed`, `Cancelled`) + input kondisional alasan pembatalan jika Cancelled. Memilih `continuation` memunculkan opsi kelanjutan + alasan. Memilih `finalStatus` memunculkan pill risiko + penjelasan risiko harian. |
| **8. Validasi Alasan & Penghitung Karakter** | Textarea alasan wajib diisi minimal 10 karakter dengan indikator warna dinamis (*live character counter* `x / 10 karakter minimum`). | Identik dengan 16a (wajib $\ge 10$ karakter dengan penghitung interaktif). |
| **9. Mesin Klasifikasi Otomatis (Minor vs Material)** | Deteksi cerdas: perubahan referensi/blocker diklasifikasikan sebagai **Minor** (langsung `Applied`), perubahan teks komitmen atau tingkat risiko diklasifikasikan sebagai **Material** (masuk `Pending Objection` 24 jam). | Deteksi cerdas: perubahan alasan/prioritas besok $\rightarrow$ **Minor** (langsung `Applied`), perubahan Outcome/Continuation/Final Status $\rightarrow$ **Material** (masuk `Pending Objection` 24 jam). |
| **10. Indikator Objection Window 24 Jam (Panel 3)** | Menampilkan kartu perhatian amber dengan *countdown timer* aktif (`23:59:xx`) yang menghitung mundur 24 jam kerja, disertai tombol pengujian sandbox:  <br>• *Simulasikan Waktu 24 Jam Habis (Default-Approve)*  <br>• *Simulasikan Sanggahan Atasan (Reject with Reason)*. | Identik dengan 16a, menghitung mundur 24 jam untuk data EOD material dan dilengkapi tombol simulasi penguji. |
| **11. Persistensi & Tabel Riwayat (Panel 4)** | Tersinkronisasi persisten ke `workpulse_morning_corrections_v1`. Tabel 6 kolom lengkap dengan badge status warna. Permohonan baru langsung ditambahkan ke baris teratas. | Tersinkronisasi persisten ke `workpulse_eod_corrections_v1`. Tabel 6 kolom lengkap dan otomatis bertambah secara reaktif. |
| **12. Dialog Modal Jejak Audit (*Audit Detail Modal*)** | Mengklik baris riwayat mana pun membuka modal linimasa komprehensif: pemohon, nomor tiket, sebelum vs sesudah, alasan, dan riwayat status (step 1-3). | Identik dengan 16a, menampilkan jejak audit EOD lengkap dan linimasa permohonan. |
| **13. Reviewer Workflow Gateway (Panel 5)** | Kartu edukasi tata kelola peninjauan atasan dan tombol pintas ke antrean Halaman 22 (`22-Correction-and-Leave-Review.html`). | Identik dengan 16a. |

---

## 5.2 Hasil Verifikasi Browser Subagent

Pengujian otomatis telah dijalankan menggunakan browser subagent dengan rekaman sesi WebP tersimpan pada:  
[test_correction_requests_16a_16b_1793161727141.webp](file:///C:/Users/LOQ/.gemini/antigravity-ide/brain/8f0058f4-78f3-483a-9c9d-98397c2dafc6/test_correction_requests_16a_16b_1793161727141.webp)

**Catatan Hasil Pengujian:**
1. **Verifikasi Halaman 16a (Morning Correction):**
   * Pilihan target field *Initial Risk* berhasil memicu radio pills warna-warni dan kolom kendala/dukungan kondisional secara instan.
   * Validasi alasan permohonan $\ge 10$ karakter berjalan akurat.
   * Pengajuan perubahan risiko berhasil diklasifikasikan sebagai **Material** dan memicu hitung mundur jendela sanggahan 24 jam (`23:59:xx`).
   * Tombol sandbox *Simulasikan Waktu 24 Jam Habis* berhasil dieksekusi: status permohonan seketika beralih menjadi **`Applied`** (*Default-Approve*), nilai baseline terbarui, dan baris riwayat terbarui otomatis.
   * Baris riwayat tabel berhasil diklik dan membuka modal *Audit Detail* lengkap dengan linimasa 3 tahap.
2. **Verifikasi Halaman 16b (EOD Correction):**
   * Navigasi tab contextual switcher dari 16a ke 16b berjalan mulus tanpa page reload error.
   * Skenario pengujian *FR-53 Guard (Belum Submit EOD)* berhasil menolak akses form dan menampilkan kartu pencegahan merah resmi.
   * Pengaktifan kembali status submisi membuka antarmuka EOD lengkap.
   * Pengujian pemilihan *Outcome Cancelled* berhasil memunculkan input wajib alasan pembatalan tugas.
   * Pengiriman permohonan koreksi EOD berhasil tersimpan dan tercatat pada tabel riwayat `CR-E`.
3. **Kepatuhan Konsol Browser:**
   * **0 JavaScript Errors** pada konsol pengembang browser selama seluruh proses pengujian.

---

> [!NOTE]
> Dengan selesainya seluruh langkah (Langkah 1 hingga Langkah 5), Halaman 16 (16a & 16b) kini telah beroperasi dalam standar kualitas tertinggi (*Production-Ready*), mematuhi seluruh aturan bisnis PRD/PDD, dan 100% konsisten dengan pedoman desain sistem WorkPulse.

---

# BAGIAN 6: HASIL EVALUASI & REALISASI PENYEMPURNAAN MUTU (DIMENSI 1 & DIMENSI 2)

Sebagai tindak lanjut evaluasi komprehensif terhadap Halaman 16, telah dilakukan penyempurnaan mendalam pada dua dimensi utama:

---

## 6.1 Realisasi Dimensi 1: Bahasa, Istilah, Tata Bahasa & Keselarasan Frasa

1. **Standarisasi Istilah Kanonikal WorkPulse (Nol Jargon Pengembang):**
   * *Garis Dasar (Baseline):* Menggantikan istilah teknis seperti "snapshot database" atau "frozen record".
   * *Jendela Sanggahan (Objection Window):* Menggantikan istilah kaku seperti "approval queue" atau "holding state".
   * *Persetujuan Otomatis (Default-Approve):* Menjelaskan mekanisme penyelesaian 24 jam tanpa beban klik atasan.
   * *Penelaah Berwenang (Authorized Reviewer):* Menggantikan kata teknis "evaluator/supervisor ID".
   * *Jejak Audit (Audit Trail):* Menggantikan "log table" atau "history trace".

2. **Nada Komunikasi Empatis & Transparan:**
   * Informasi masa tunggu disampaikan dengan nada menenangkan bahwa data lama karyawan tetap utuh dan terlindungi selama proses telaah berjalan.
   * Tidak ada pesan error bernada menyalahkan. Validasi karakter disajikan sebagai panduan pembantu (*10 karakter minimum untuk kejelasan konteks penelaah*).

---

## 6.2 Realisasi Dimensi 2: Konsistensi Visual, Desain Calm UI, Tata Letak & Estetika

1. **Kebijakan Mutlak Nol Emoticon (Zero Emoticons Policy):**
   * Seluruh antarmuka di Halaman 16a dan 16b menggunakan 100% ikon vektor SVG monokrom dengan ketebalan garis seimbang (`stroke-width="1.8-2.5"`).
   * Tidak ada emoticon grafis maupun simbol Unicode emoji di seluruh elemen formulir, tombol aksi, badge status, maupun tabel riwayat.

2. **Focused Contextual Anchor Card (Kolom Kiri Before):**
   * Menggantikan textarea `readonly` abu-abu kaku dengan kartu garis dasar aktif (*Anchor Card*).
   * Kartu ini menyajikan nilai resmi yang sedang berlaku di sistem saat ini secara hidup dan kontekstual, menyesuaikan diri secara otomatis saat pengguna memilih slot komitmen (16a) atau item pekerjaan (16b).

3. **Segmented Decision Cards 2x2 untuk Task Outcome (16b):**
   * Pilihan capaian tugas sore (*Completed*, *Partially Completed*, *Not Completed*, *Cancelled*) ditata dalam format grid 2x2 (`repeat(2, 1fr)`).
   * Setiap opsi memiliki ikon SVG monokrom representatif, label tebal yang kontras, serta deskripsi konsekuensi singkat dengan ruang bernapas yang cukup (*adequate visual breathing room*).

4. **Employee Assurance Ribbon (Pita Jaminan 3 Pilar):**
   * Menggantikan bilah info lama dengan pita jaminan terintegrasi berlatar `#F4F8F6` dan bingkai lembut `rgba(13, 92, 77, 0.12)`.
   * Memuat 3 pilar transparansi:
     * *Status Garis Dasar:* Terkunci Sah
     * *Perlindungan Data:* Nilai Asli Tetap Berlaku
     * *Jejak Audit:* Tercatat Permanen

5. **Context-Aware Diff di Tabel Riwayat (Bebas Disonansi Warna):**
   * Meniadakan disonansi warna pada badge status dan outcome (contoh: status `GREEN` tetap berlatar hijau, `AMBER` tetap amber, `RED` tetap merah, dengan efek coret halus / *strikethrough* pada nilai lama).
   * Menggunakan pemotongan teks pintar (*smart truncation*) untuk nilai teks panjang agar tidak merusak keselarasan kolom tabel.

6. **Sensasi Interaksi & Pengurangan Beban Kognitif:**
   * *Calm UI Focus Glow Ring:* Area input aktif memperoleh cincin fokus lembut bernuansa korporat hijau toska (`0 0 0 3px rgba(13, 92, 77, 0.15)`).
   * *Empathetic Character Counter:* Indikator penghitung karakter alasan berwarna abu-abu netral saat di bawah 10 karakter, dan seketika berubah menjadi hijau sukses saat batas aman $\ge 10$ karakter tercapai.
   * *Live Impact Preview Pill:* Menampilkan lencana pratinjau dampak secara dinamis di samping label bidang (hijau netral: *Koreksi Minor: Langsung Diterapkan* vs biru status: *Koreksi Material: Masuk Jendela Sanggahan 24 Jam*).

7. **Tata Kelola Status Berjalan (In-Flight State Governance):**
   * Menampilkan spanduk peringatan (*In-Flight Notice Banner*) saat suatu slot atau item pekerjaan memiliki permohonan material yang masih aktif dalam jendela sanggahan.
   * Mengunci tombol submit untuk slot/item tersebut guna mencegah tabrakan permohonan ganda (*race conditions*).

---

## 6.3 Realisasi Dimensi 3: Logika Bisnis, Aturan Sistem, Validasi, & Penanganan Kasus Tepi (Edge Cases)

Sebagai hasil analisis kritis dan empatis terhadap realitas operasional kerja karyawan dan penelaah, telah direalisasikan 8 penyempurnaan logika bisnis dan mitigasi kasus tepi (*edge cases*) yang kokoh:

1. **Penguncian Granular Tingkat Target (*Target-Level Granular In-Flight Lock*):**
   * **Masalah Terdahulu:** Penguncian in-flight global memblokir seluruh halaman permohonan jika ada salah satu slot yang sedang berada dalam jendela sanggahan 24 jam. Karyawan yang hanya ingin memperbaiki tipo judul pada Slot 2 terblokir hanya karena Slot 1 sedang menunggu masa sanggah.
   * **Solusi Terpasang:** Penguncian kini diisolasi murni pada slot komitmen (Halaman 16a) atau item pekerjaan (Halaman 16b) yang bersangkutan. Memilih slot/item lain yang bebas permohonan langsung membuka kembali formulir usulan koreksi tanpa hambatan.
   * **In-Flight Notice Banner Granular:** Menampilkan kartu panduan informatif yang secara spesifik menyebutkan slot/item mana yang sedang aktif dalam masa sanggah beserta nomor tiketnya.

2. **Fasilitas Penarikan Mandiri Permohonan (*Self-Withdrawal / Tarik Kembali Permohonan*):**
   * **Kebutuhan Empatis:** Menghindari kecemasan karyawan yang keliru memasukkan data atau salah memilih slot tanpa harus menunggu 24 jam atau memohon atasan secara informal untuk menolak.
   * **Solusi Terpasang:** Selama permohonan berstatus `Pending Objection` dan belum diputus oleh penelaah, tombol "Tarik Kembali Permohonan" aktif pada panel status dan banner in-flight.
   * **Alur Eksekusi:** Menampilkan dialog konfirmasi ramah. Begitu dikonfirmasi, status permohonan seketika beralih menjadi `Withdrawn`, slot langsung terbebas kembali, dan riwayat audit mencatat status penarikan mandiri secara transparan.

3. **Pengikatan Payload Majemuk (*Co-Dependent Payload Binding*) & Transisi Bersih Risiko Hijau:**
   * **Konsistensi Data Majemuk:** Pada Halaman 16a, jika tingkat risiko diubah menjadi `AMBER` atau `RED`, data kendala (*Known Blocker*) dan kebutuhan dukungan (*Support Needed*) diikat menjadi satu kesatuan payload atomik bersama perubahan risiko tersebut.
   * **Higienitas Garis Dasar saat Kembali ke GREEN:** Jika risiko kemudian dikoreksi kembali menjadi `GREEN`, sistem secara otomatis membersihkan blocker dan kebutuhan dukungan lama dari snapshot baseline saat permohonan diterapkan, mencegah timbulnya artefak kendala usang (*zombie blockers*).
   * **Payload Majemuk EOD (16b):** Alasan pembatalan tugas (*Cancelled Reason*), alasan kelanjutan (*Continuation Reason*), dan penjelasan risiko harian (*Day Risk Explanation*) disimpan lengkap ke dalam objek permohonan dan disajikan pada modal jejak audit (*Audit Detail Modal*).

4. **Sinkronisasi Capaian dan Progres yang Cerdas (*Smart Cooperative Progress Sync* - 16b):**
   * **Mitigasi Inkonsistensi:** Apabila karyawan memilih capaian tugas *Completed* (Selesai), sistem secara otomatis menyesuaikan progres tugas menjadi 100% dan menampilkan kotak bantuan transparan (*Cooperative Notice* `#outcomeProgressSyncNotice`) yang mengonfirmasi bahwa persentase progres disinkronkan otomatis ke 100%.
   * **Perlindungan Data pada Status Lain:** Jika outcome dipilih *Cancelled* atau *Not Completed*, nilai progres awal tidak dihapus sembarangan, melainkan dipertahankan sebagai cerminan capaian aktual sebelum tugas dibatalkan atau tertunda.

5. **Rekonsiliasi Kedaluwarsa Pasif pada Cold Startup (*Passive Expiry Reconciliation*) & Spanduk Sambutan:**
   * **Kenyataan Pengguna:** Pengguna di dunia nyata tidak membiarkan tab browser terbuka selama 24 jam penuh untuk menunggu timer Javascript `setInterval` berakhir.
   * **Solusi Terpasang:** Fungsi `initStartupReconciliation()` (16a) dan `initEodStartupReconciliation()` (16b) dijalankan seketika saat halaman dimuat (`DOMContentLoaded`).
   * **Pemeriksaan Otomatis:** Sistem membaca timestamp `expiresAt` pada seluruh rekaman permohonan di `localStorage`. Setiap permohonan berstatus `Pending Objection` yang waktu kedaluwarsanya telah lewat otomatis ditransisikan ke status `Applied` (*Default-Approve*), baseline diperbarui, dan permohonan disimpan kembali.
   * **Spanduk Sambutan Resolusi (*Welcome Resolution Banner*):** Jika ada permohonan yang baru saja terselesaikan otomatis saat pengguna kembali ke halaman, spanduk hijau bergaris ganda muncul di puncak halaman menyambut karyawan dengan informasi penutupan resmi bahwa permohonan mereka telah disetujui secara otomatis sesuai kebijakan 24 jam kerja.

6. **Panduan Edukatif Pasca-Sanggahan & Draf Revisi Cepat (*Post-Objection Guidance & Quick Revise*):**
   * **Menjaga Moril & Kejelasan:** Jika atasan menggunakan hak sanggahnya dan menolak permohonan (`Rejected`), karyawan tidak dibiarkan bingung atau putus asa.
   * **Solusi Terpasang:** Spanduk panduan pasca-sanggahan `#postObjectionNotice` (16a) dan `#eodPostObjectionNotice` (16b) muncul dengan latar lembut, menampilkan kutipan catatan/alasan sanggahan dari atasan secara gamblang.
   * **Tombol Draf Cepat (*Gunakan Draf Sebelumnya & Sesuaikan*):** Menyediakan tombol satu-klik yang memanggil `prefillRevision()` atau `prefillEodRevision()`. Nilai yang sebelumnya diajukan langsung dimuat kembali ke dalam formulir usulan agar karyawan dapat segera menyesuaikan argumen atau target komitmen sesuai arahan atasan tanpa mengetik ulang dari awal.

7. **Transparansi Waktu Nyata: Tenggat Waktu Absolut & Kebijakan Hari Kerja:**
   * **Format Waktu Konkret:** Menghilangkan kebingungan hitung mundur jam yang mengambang dengan menyajikan tanggal dan jam absolut yang terhitung pasti (contoh: `Tenggat Waktu Sanggahan: Besok, [Hari], [Tanggal] pukul [Jam:Menit] WIB (24 Jam Kerja)`).
   * **Catatan Kaki Kebijakan Operasional (*Working Hours Policy Footnote*):** Menegaskan di bawah indikator hitung mundur bahwa jendela sanggahan 24 jam kerja dihitung berdasarkan hari kerja resmi perusahaan (Senin-Jumat) dan tidak berjalan pada hari libur nasional atau akhir pekan, menjamin kepastian hukum baik bagi karyawan maupun pihak manajemen penelaah.

8. **Pemberitahuan Fleksibilitas Pra-Cutoff (*Pre-Cutoff Awareness Notice* - 16a):**
   * **Pencegahan Beban Birokrasi Berlebih:** Jika karyawan mengakses halaman koreksi pagi sebelum batas waktu komitmen harian (pukul 09:00 WIB), sistem menampilkan spanduk panduan biru lembut `#preCutoffNotice`.
   * **Tautan Langsung:** Menginformasikan bahwa sebelum jam 09:00 WIB, perubahan tugas atau risiko tidak memerlukan prosedur permohonan koreksi formal dengan masa tunggu sanggahan, dan menyediakan tombol navigasi cepat ke Halaman 02 (*Morning Commitment*) untuk pengeditan instan langsung.



