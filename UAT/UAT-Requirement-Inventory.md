# WorkPulse — Requirement Inventory & Gap Analysis

> **Proyek:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Dokumen Sumber Acuan:** PDD v1.5, PRD v1.6, UI/UX Spec & Flow, Visual Design System v1.5.0, SAD  
> **Penyusun:** Senior Business Analyst & Requirements Engineer  
> **Tanggal:** 29 Oktober 2026  

---

## 1. PENDAHULUAN & METODOLOGI INVENTARISASI

Dokumen ini memuat inventarisasi lengkap seluruh kebutuhan fungsional (**FR-01 s.d. FR-55**), keputusan arsitektural inti (**DEC-001 s.d. DEC-013**), kebutuhan non-fungsional (**NFR-01 s.d. NFR-10**), serta analisis kesenjangan (*gap analysis*) hasil telaah statis antara dokumen spesifikasi dan implementasi kode sumber WorkPulse.

Setiap kebutuhan dianalisis dengan parameter:
- **Requirement ID & Nama:** Pengenal unik kanonikal.
- **Kategori & Sumber Dokumen:** Modul fungsional dan letak referensi spesifikasi.
- **Aktor Terkait:** Peran kanonikal yang memiliki otorisasi berinteraksi.
- **Aturan Bisnis & Kriteria Penerimaan (Acceptance Criteria):** Batasan operasional wajib.
- **Tingkat Risiko Kegagalan:** Dampak terhadap bisnis Dutamedia jika kebutuhan gagal berfungsi.
- **Status Kejelasan:** `Clear` (Jelas) atau `Needs Clarification` (Perlu konfirmasi stakeholder).
- **Status Implementasi Statis:** `Implemented` (Terimplementasi di kode sumber), `Partially Implemented`, atau `Not Implemented`.
- **Kebutuhan Pengujian UAT:** Fokus validasi yang harus dieksekusi secara manual oleh Harry.

---

## 2. INVENTARISASI ATURAN BISNIS ARSITEKTURAL UTAMA (DEC-001 s.d. DEC-013)

| Decision ID | Nama Keputusan Bisnis | Aturan Baku Sistem | Dampak Operasional & UAT | Status Statis |
| :--- | :--- | :--- | :--- | :---: |
| **DEC-001** | Klasifikasi Waktu Pengisian (Timing Status) | **On-Time:** Sebelum cut-off waktu kebijakan.<br>**Late (Grace Period):** Lewat cut-off hingga toleransi batas akhir.<br>**No Submission (Cut-off):** Melebihi grace period, pengisian terkunci otomatis. | Karyawan mengisi komitmen/EOD wajib melihat badge waktu yang sesuai dan akurat. | `Implemented` |
| **DEC-002** | Penguncian Pasca Cut-Off (Anti-Direct Edit) | Edit langsung dilarang begitu melewati cut-off. Perubahan data hanya dapat dilakukan melalui mekanisme resmi **Correction Request**. | Tombol edit dinonaktifkan; antarmuka hanya mengizinkan tombol "Ajukan Koreksi". | `Implemented` |
| **DEC-003** | Anti-Lock Green (Non-Binding Heuristic) | Sistem menyarankan status risiko (Hijau/Kuning/Merah) berdasarkan indikator heuristik, tetapi opsi **Hijau (GREEN) DILARANG DIKUNCI/DINONAKTIFKAN**. Karyawan memiliki hak prerogatif memilih status akhir dengan justifikasi. | Di form EOD Outcome, tombol/pilihan radio status Hijau harus selalu dapat diklik dan aktif. | `Implemented` |
| **DEC-004** | Aturan 0 s.d. 3 Komitmen Pagi | Karyawan dapat merencanakan 1 hingga 3 komitmen per hari. Jika mengisi 0 komitmen, sistem mewajibkan alasan valid minimal 10 karakter (`NOT_APPLICABLE — NO_COMMITMENT`). | Validasi form menolak submit jika 0 komitmen tanpa justifikasi >= 10 karakter. | `Implemented` |
| **DEC-005** | Skema Single-Use Token Aktivasi Karyawan Baru | Undangan karyawan baru menggunakan token aman sekali pakai (*single-use*) dengan masa berlaku tepat 72 jam. Token langsung hangus pasca aktivasi kata sandi. | Pengujian aktivasi dengan token valid, token kedaluwarsa, dan pemakaian ulang token yang sama. | `Implemented` |
| **DEC-006** | Konteks Otoritas Ganda (Authority Context) | Persetujuan koreksi atau tinjauan blocker didasarkan pada dua konteks: **Default Organizational Authority** (Direct Manager) dan **Contextual Project Authority** (Project Manager). | Direct Manager berwenang pada tugas umum divisi; PM berwenang pada komitmen proyek spesifik. | `Implemented` |
| **DEC-007** | Siklus Hidup Hambatan (Blocker Lifecycle & SLA) | Hambatan terbagi atas status: `OPEN` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `RESOLVED`. SLA respons atasan: Blocker Kritis maksimal 2 jam, Tinggi 4 jam. | Supervisor wajib merespons sebelum badge SLA berubah merah/menipis di Blocker Queue. | `Implemented` |
| **DEC-008** | Rekonsiliasi Cuti Otomatis Pasca Cut-Off | Jika karyawan tidak mengisi komitmen pagi tetapi memiliki pengajuan cuti yang disetujui, sistem merekonsiliasi status menjadi `Superseded by Approved Leave` (keluar dari pelanggaran kepatuhan). | Riwayat absensi/kepatuhan tidak mencatat penalti pada tanggal cuti resmi. | `Implemented` |
| **DEC-009** | Delegasi Wewenang Sementara (Temporary Reviewer) | Atasan yang cuti/berhalangan dapat mendelegasikan wewenang persetujuan kepada rekan selevel dengan rentang tanggal mulai dan selesai yang ketat. | Reviewer pengganti dapat menyetujui koreksi/blocker tim hanya dalam jendela tanggal aktif. | `Implemented` |
| **DEC-010** | Batasan Minimum Alasan & Feedback | Setiap penolakan (*Reject* koreksi/cuti), pemberian bimbingan (*Coaching*), atau pelaporan blocker wajib menyertakan catatan penjelasan minimal 10 karakter. | Form menolak aksi reject atau catatan kosong/hanya spasi. | `Implemented` |
| **DEC-011** | Pembatasan Copy-Forward Komitmen | Fitur bawaan copy-forward komitmen hanya diizinkan untuk komitmen hari kerja sebelumnya yang ditandai berstatus `Continue` (belum tuntas). | Mencegah komitmen yang sudah selesai (`Done`) diduplikasi tanpa sengaja. | `Implemented` |
| **DEC-012** | Navigasi Enterprise Berbasis Peran (Landing Route) | Arah pendaratan pasca-login ditentukan otomatis oleh peran kanonikal pengguna tanpa menampilkan tombol navigasi melayang (*floating button*). | Employee -> `/daily/morning`, Supervisor/Head/CEO -> `/dashboard`, HRGA -> `/compliance`, Admin -> `/admin/organization`. | `Implemented` |
| **DEC-013** | Audit Trail Permanen (Immutable Log) | Seluruh perubahan status kepatuhan, koreksi komitmen, dan dispensasi wajib tercatat dalam log audit yang tidak dapat diubah atau dihapus oleh siapapun. | Pengujian konsistensi riwayat audit di layar My History dan Executive Reports. | `Implemented` |

---

## 3. INVENTARISASI KEBUTUHAN FUNGSIONAL LENGKAP (FR-01 s.d. FR-55)

### 3.1 Modul 1: Autentikasi, Akun, & Orientasi Pengguna (FR-01 s.d. FR-08)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-01** | Autentikasi Pengguna & Kredensial | PRD v1.6 §3.1 | Seluruh Peran | Pengguna dapat masuk menggunakan email kerja `@dutamedia.com` dan kata sandi valid. Penolakan terhadap kredensial tidak valid dengan pesan kesalahan ramah pengguna. | Kritis | `Clear` | `Implemented` | Uji login sukses seluruh peran, uji kombinasi password salah, uji proteksi rute sebelum login. |
| **FR-02** | Aktivasi Karyawan Baru via Token Undangan | PRD v1.6 §3.1, DEC-005 | `INVITED` | Pengguna dengan status `INVITED` dapat mengaktifkan akun melalui link token 72 jam, membuat kata sandi baru (min. 8 karakter, kombinasi huruf & angka). Token langsung hangus setelah sukses. | Kritis | `Clear` | `Implemented` | Uji aktivasi akun calon karyawan via token demo, verifikasi pembuatan password dan transisi ke `ACTIVE`. |
| **FR-03** | Penanganan Token Undangan Kedaluwarsa/Tidak Sah | PRD v1.6 §3.1 | `INVITED`, Tamu | Jika token sudah melewati 72 jam atau sudah pernah digunakan, sistem menampilkan layar penolakan informatif dengan instruksi menghubungi HRGA. | Tinggi | `Clear` | `Implemented` | Buka URL aktivasi dengan token palsu atau token kedaluwarsa, pastikan form pembuatan password dicegah. |
| **FR-04** | Pendaratan Otomatis Sesuai Peran (Landing Route) | PRD v1.6 §3.1, DEC-012 | Seluruh Peran | Sistem mengarahkan pengguna ke halaman beranda kanonikal perannya pasca login berhasil tanpa kebingungan navigasi. | Tinggi | `Clear` | `Implemented` | Login bergantian sebagai Employee, Supervisor, HRGA, Admin, dan verifikasi URL tujuan pertama kali. |
| **FR-05** | Manajemen Profil Pribadi | PRD v1.6 §3.1 | Seluruh Peran | Pengguna dapat melihat data diri (Nama, Email, Jabatan, Departemen, Atasan Langsung) dan status akun. | Sedang | `Clear` | `Implemented` | Buka halaman `/profile`, verifikasi ketepatan data hierarki atasan langsung. |
| **FR-06** | Pembaruan Kata Sandi Mandiri | PRD v1.6 §3.1 | Seluruh Peran | Pengguna dapat mengganti kata sandi dengan memvalidasi kata sandi lama terlebih dahulu. | Tinggi | `Clear` | `Implemented` | Uji penggantian kata sandi dengan konfirmasi kata sandi baru. |
| **FR-07** | Manajemen Sesi & Logout Aman | PRD v1.6 §3.1 | Seluruh Peran | Pengguna dapat keluar dari sistem dengan aman; token sesi dibersihkan; tombol navigasi kembali di browser tidak membocorkan data sensitif. | Kritis | `Clear` | `Implemented` | Klik Logout pada footer sidebar, verifikasi redirect ke `/login`, lalu tekan tombol back browser. |
| **FR-08** | Proteksi Otorisasi Antarmuka & Halaman Terlarang (403 Forbidden) | PRD v1.6 §3.1 | Seluruh Peran | Akses manual via URL ke rute yang bukan hak peran pengguna langsung dialihkan ke halaman Error 403 Forbidden dengan opsi navigasi kembali. | Kritis | `Clear` | `Implemented` | Login sebagai Employee, ketik manual `/admin/users` atau `/compliance` di address bar browser. |

---

### 3.2 Modul 2: Daily Accountability — Morning Commitment (FR-09 s.d. FR-16)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-09** | Input 1 s.d. 3 Komitmen Kerja Pagi | PRD v1.6 §3.2, DEC-004 | `EMPLOYEE` | Karyawan dapat merencanakan 1 hingga 3 komitmen harian dengan field: Judul/Deskripsi tugas, Tagging Proyek/Inisiatif, dan Estimasi Durasi. | Kritis | `Clear` | `Implemented` | Input 1 komitmen, tambah menjadi 2 dan 3, verifikasi tombol tambah dinonaktifkan saat sudah 3 item. |
| **FR-10** | Opsi 0 Komitmen dengan Justifikasi Wajib | PRD v1.6 §3.2, DEC-004 | `EMPLOYEE` | Karyawan yang tidak memiliki komitmen harian wajib mencentang opsi 0 komitmen dan mengisi alasan minimal 10 karakter (cth: training, workshop, riset khusus). | Tinggi | `Clear` | `Implemented` | Pilih opsi 0 komitmen, kosongkan alasan (harus error), isi alasan 12 karakter (harus sukses). |
| **FR-11** | Deteksi Indikasi Hambatan Pagi (Early Blocker Flag) | PRD v1.6 §3.2 | `EMPLOYEE` | Pada setiap item komitmen, karyawan dapat menandai indikasi hambatan sejak pagi hari agar atasan dapat memantau potensi kendala lebih dini. | Tinggi | `Clear` | `Implemented` | Centang penanda kendala pada salah satu komitmen, simpan form, verifikasi tampilan penanda di ringkasan. |
| **FR-12** | Salin Komitmen Hari Sebelumnya (Copy-Forward) | PRD v1.6 §3.2, DEC-011 | `EMPLOYEE` | Pengguna dapat menarik data komitmen hari kerja sebelumnya yang ditandai berstatus `Continue` tanpa harus mengetik ulang dari awal. | Sedang | `Clear` | `Implemented` | Klik tombol "Salin dari Kemarin", verifikasi hanya item `Continue` yang disalin ke form komitmen baru. |
| **FR-13** | Penentuan Klasifikasi Waktu Submit Pagi | PRD v1.6 §3.2, DEC-001 | `EMPLOYEE` | Sistem mencatat waktu kirim dan menyematkan badge On-Time (sebelum cut-off) atau Late (dalam batas toleransi/grace period). | Kritis | `Clear` | `Implemented` | Submit komitmen sebelum cut-off, verifikasi status On-Time tercatat di kartu rekap. |
| **FR-14** | Penguncian Form Pagi Pasca Cut-Off | PRD v1.6 §3.2, DEC-002 | `EMPLOYEE` | Setelah batas cut-off pagi terlewati, form input komitmen terkunci dari penyuntingan langsung; sistem mengarahkan ke alur Koreksi Pagi. | Kritis | `Clear` | `Implemented` | Buka form di luar jam kebijakan pagi, verifikasi elemen form dinonaktifkan dan muncul banner info koreksi. |
| **FR-15** | Validasi Field Wajib Komitmen Pagi | PRD v1.6 §3.2 | `EMPLOYEE` | Setiap komitmen wajib memiliki teks deskripsi minimal 5 karakter dan asosiasi kategori/proyek yang jelas. | Tinggi | `Clear` | `Implemented` | Input teks 3 karakter, klik simpan, verifikasi pesan validasi muncul di bawah field terkait. |
| **FR-16** | Tampilan Ringkasan Komitmen Hari Ini | PRD v1.6 §3.2 | `EMPLOYEE`, `SUPERVISOR` | Komitmen yang telah terkirim ditampilkan dalam format kartu terstruktur beserta status pengerjaan yang dapat dilihat oleh karyawan dan atasannya. | Tinggi | `Clear` | `Implemented` | Refresh halaman setelah submit, pastikan data komitmen tetap persisten dan tampil lengkap. |

---

### 3.3 Modul 3: Daily Accountability — Additional Work & Ad-Hoc Tasks (FR-17 s.d. FR-20)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-17** | Pencatatan Tugas Tambahan Tak Terencana (Ad-Hoc) | PRD v1.6 §3.2 | `EMPLOYEE` | Karyawan dapat mencatat tugas penting yang muncul di tengah jam kerja di luar 3 komitmen pagi, dilengkapi justifikasi urgensi. | Tinggi | `Clear` | `Implemented` | Buka `/daily/additional-work`, input tugas mendesak dari atasan, simpan, pastikan masuk daftar tugas hari ini. |
| **FR-18** | Asosiasi Proyek & Pemberi Instruksi | PRD v1.6 §3.2 | `EMPLOYEE` | Setiap tugas tambahan wajib mencantumkan pihak yang menginstruksikan (Direct Manager, PM, atau Klien) dan proyek terkait. | Sedang | `Clear` | `Implemented` | Uji input tugas tambahan tanpa memilih pemberi instruksi (validasi gagal), pilih instruktur (sukses). |
| **FR-19** | Integrasi Tugas Tambahan ke Rekap EOD | PRD v1.6 §3.2 | `EMPLOYEE` | Tugas tambahan yang dicatat di siang hari otomatis muncul sebagai item evaluasi pada pelaporan hasil kerja sore hari (EOD Outcome). | Tinggi | `Clear` | `Implemented` | Submit tugas tambahan, navigasi ke `/daily/eod`, pastikan tugas tambahan terdaftar bersama komitmen pagi. |
| **FR-20** | Batas Maksimum Tugas Tambahan Harian | PRD v1.6 §3.2 | `EMPLOYEE` | Sistem membatasi jumlah tugas tambahan per hari (maksimal 5 item) untuk menjaga fokus kerja realistis dan mencegah kelebihan beban. | Sedang | `Clear` | `Implemented` | Tambahkan tugas tambahan hingga 5 item, verifikasi tombol penambahan dinonaktifkan pada item ke-5. |

---

### 3.4 Modul 4: Daily Accountability — End-of-Day (EOD) Outcome (FR-21 s.d. FR-28)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-21** | Pelaporan Realisasi Komitmen Sore Hari | PRD v1.6 §3.3 | `EMPLOYEE` | Karyawan wajib melaporkan status pencapaian untuk setiap komitmen: `Done`, `In Progress`, `Blocked`, atau `Cancelled`. | Kritis | `Clear` | `Implemented` | Buka `/daily/eod`, pilih status pencapaian untuk masing-masing komitmen pagi dan tugas tambahan. |
| **FR-22** | Rekomendasi Status Risiko Mandiri (Heuristic Suggestion) | PRD v1.6 §3.3, DEC-003 | `EMPLOYEE` | Sistem menghitung saran status risiko harian (Hijau jika seluruhnya selesai; Kuning jika ada in-progress/minor blocker; Merah jika ada blocker kritis). | Tinggi | `Clear` | `Implemented` | Pilih kombinasi status (cth: 1 Done, 1 Blocked), amati rekomendasi warna yang dihitung otomatis oleh sistem. |
| **FR-23** | Anti-Lock Green (Kebebasan Memilih Status Hijau) | PRD v1.6 §3.3, DEC-003 | `EMPLOYEE` | Sistem **DILARANG MENGUNCI OPSI HIJAU**. Karyawan tetap berhak memilih status Hijau meskipun sistem menyarankan Kuning/Merah, disertai catatan justifikasi. | Kritis | `Clear` | `Implemented` | Simulasi rekomendasi sistem Kuning/Merah, lalu klik tombol radio Hijau. Pastikan dapat dipilih dan disimpan. |
| **FR-24** | Wajib Justifikasi pada Status Tidak Tuntas | PRD v1.6 §3.3, DEC-010 | `EMPLOYEE` | Apabila komitmen ditandai `Blocked` atau `Cancelled`, karyawan wajib mengisi catatan kendala minimal 10 karakter. | Tinggi | `Clear` | `Implemented` | Tandai komitmen sebagai Blocked, kosongkan catatan kendala (gagal), isi alasan lengkap (sukses). |
| **FR-25** | Catatan Refleksi & Pembelajaran Mandiri | PRD v1.6 §3.3 | `EMPLOYEE` | Formulir menyediakan area input catatan refleksi harian untuk mendukung budaya perbaikan berkelanjutan (*continuous learning*). | Sedang | `Clear` | `Implemented` | Isi catatan refleksi harian, simpan, verifikasi teks refleksi tersimpan pada riwayat harian. |
| **FR-26** | Klasifikasi Waktu Pelaporan EOD | PRD v1.6 §3.3, DEC-001 | `EMPLOYEE` | Sistem menyematkan label On-Time (sebelum cut-off sore) atau Late (dalam rentang grace period sore). | Kritis | `Clear` | `Implemented` | Submit form EOD pada jam normal, verifikasi label waktu EOD tercatat On-Time pada kartu status. |
| **FR-27** | Penutupan Akses Langsung Pasca Cut-Off EOD | PRD v1.6 §3.3, DEC-002 | `EMPLOYEE` | Setelah cut-off sore berakhir, pelaporan hasil hanya dapat dilakukan melalui mekanisme resmi EOD Correction Request. | Kritis | `Clear` | `Implemented` | Buka halaman EOD saat periode terkunci, pastikan tombol submit terkunci dan tersedia tombol ajukan koreksi. |
| **FR-28** | Tinjauan Hasil Harian oleh Supervisor | PRD v1.6 §3.3 | `SUPERVISOR`, `HEAD` | Atasan langsung dapat melihat rekap pencapaian seluruh anggota tim pada dasbor pengawasan harian. | Tinggi | `Clear` | `Implemented` | Login sebagai Tech Lead, buka dasbor tim, pastikan hasil EOD anggota tim tampil transparan. |

---

### 3.5 Modul 5: Manajemen Hambatan & Eskalasi — Blocker System (FR-29 s.d. FR-36)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-29** | Pelaporan Hambatan Baru (Raise Blocker) | PRD v1.6 §3.4, DEC-007 | Seluruh Peran | Pengguna dapat melaporkan hambatan kerja kapan saja dengan detail: Judul, Deskripsi, Tingkat Keparahan (Kritis, Tinggi, Sedang), Tipe Hambatan, dan Dampak. | Kritis | `Clear` | `Implemented` | Buka `/blockers/raise`, isi data hambatan teknis baru lengkap dengan estimasi dampak, klik submit. |
| **FR-30** | Klasifikasi Tingkat Keparahan & SLA Blocker | PRD v1.6 §3.4, DEC-007 | Seluruh Peran | Blocker Kritis memiliki SLA respons 2 jam; Blocker Tinggi memiliki SLA 4 jam; Blocker Sedang memiliki SLA 8 jam kerja. | Kritis | `Clear` | `Implemented` | Buat blocker dengan severity Kritis, amati badge SLA dan penghitung waktu mundur pada antrean. |
| **FR-31** | Antrean Hambatan Terpusat (Blocker Queue) | PRD v1.6 §3.4 | `SUPERVISOR`, `HEAD`, `PM` | Antrean terpadu untuk memantau blocker aktif berdasarkan departemen, proyek, dan urgensi penanganan. | Tinggi | `Clear` | `Implemented` | Buka `/blockers`, uji filter berdasarkan status (Open, In Progress, Resolved) dan tingkat keparahan. |
| **FR-32** | Respons & Acknowledgment oleh Atasan | PRD v1.6 §3.4, DEC-007 | `SUPERVISOR`, `PM` | Atasan dapat mengonfirmasi penerimaan laporan (*Acknowledge*) dengan menambahkan rencana intervensi bantuan. | Kritis | `Clear` | `Implemented` | Login sebagai Supervisor, klik tombol "Bantu / Respons" pada blocker anggota tim, isi catatan tindakan awal. |
| **FR-33** | Transisi Status Siklus Hidup Blocker | PRD v1.6 §3.4, DEC-007 | `SUPERVISOR`, Pelapor | Transisi status legal: `OPEN` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `RESOLVED`. Transisi ke Resolved wajib menyertakan deskripsi solusi tuntas. | Kritis | `Clear` | `Implemented` | Jalankan transisi bertahap hingga Resolved; uji penolakan saat mencoba resolve tanpa mengisi solusi. |
| **FR-34** | Eskalasi Hambatan Menua (SLA Aging Radar) | PRD v1.6 §3.4 | `HEAD`, `CEO_MANAGEMENT` | Blocker yang melewati batas SLA otomatis ditandai merah (*Breached SLA*) dan dimunculkan pada radar eskalasi pimpinan eksekutif. | Kritis | `Clear` | `Implemented` | Buka `/blockers/aging`, verifikasi blocker yang melewati target SLA terkelompok pada tab eskalasi tinggi. |
| **FR-35** | Konteks Kewenangan Proyek vs Organisasi (DEC-006) | PRD v1.6 §3.4, DEC-006 | `PM`, `SUPERVISOR` | Blocker terkait proyek eksternal ditangani oleh PM proyek terkait, sedangkan blocker internal ditangani oleh direct manager. | Tinggi | `Clear` | `Implemented` | Buat blocker proyek, verifikasi notifikasi dan hak resolusi muncul pada antrean PM yang bersangkutan. |
| **FR-36** | Feed Dukungan Kolaborasi Lintas Fungsi | PRD v1.6 §3.4 | Seluruh Peran | Anggota tim dapat memberikan catatan bantuan atau informasi referensi pada blocker rekan sekerja untuk mempercepat solusi. | Sedang | `Clear` | `Implemented` | Buka detail blocker rekan tim, kirim komentar saran bantuan, verifikasi komentar muncul di feed diskusi. |

---

### 3.6 Modul 6: Tata Kelola Kepatuhan & Permohonan Koreksi (FR-37 s.d. FR-44)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-37** | Pengajuan Koreksi Komitmen Pagi (Morning Correction) | PRD v1.6 §3.5, DEC-002 | `EMPLOYEE` | Karyawan dapat mengajukan permohonan koreksi data komitmen pagi yang terlambat dengan alasan wajib minimal 10 karakter. | Tinggi | `Clear` | `Implemented` | Buka `/corrections/morning`, pilih tanggal yang terkunci, input usulan perubahan dan alasan, kirim pengajuan. |
| **FR-38** | Pengajuan Koreksi Realisasi EOD (EOD Correction) | PRD v1.6 §3.5, DEC-002 | `EMPLOYEE` | Karyawan dapat mengajukan permohonan perbaikan status hasil kerja sore pasca cut-off disertai penjelasan kendala teknis. | Tinggi | `Clear` | `Implemented` | Buka `/corrections/eod`, pilih tanggal, ubah status dari Blocked menjadi Done beserta lampiran penjelasan. |
| **FR-39** | Antrean Peninjauan Koreksi (Correction Review) | PRD v1.6 §3.5, DEC-006 | `SUPERVISOR`, `PM` | Atasan langsung menerima notifikasi dan dapat meninjau permohonan koreksi: Menyetujui (*Approve*) atau Menolak (*Reject*). | Kritis | `Clear` | `Implemented` | Login sebagai Supervisor, buka `/corrections/review`, verifikasi rincian perbandingan data sebelum vs sesudah. |
| **FR-40** | Alasan Wajib Penolakan Koreksi | PRD v1.6 §3.5, DEC-010 | `SUPERVISOR` | Penolakan permohonan koreksi wajib disertai alasan penolakan tertulis minimal 10 karakter agar karyawan memahami dasar keputusan. | Tinggi | `Clear` | `Implemented` | Klik tombol Tolak tanpa isi alasan (gagal validasi), masukkan alasan 15 karakter (sukses ditolak). |
| **FR-41** | Pengawasan Pelanggaran Kepatuhan (Compliance Queue) | PRD v1.6 §3.5 | `HRGA`, `CEO_MANAGEMENT` | HRGA dapat memantau daftar karyawan yang tidak mengisi komitmen, terlambat berulang, atau memiliki anomali kepatuhan harian. | Kritis | `Clear` | `Implemented` | Login sebagai HRGA, buka `/compliance`, amati daftar karyawan dengan pelanggaran 1x, 2x, hingga batas 3x. |
| **FR-42** | Deteksi Pola Ketidakpatuhan Berulang (Pattern Detection) | PRD v1.6 §3.5 | `HRGA` | Sistem mendeteksi otomatis karyawan yang melakukan pelanggaran tanpa komitmen sebanyak 3x berturut-turut untuk intervensi HRGA. | Tinggi | `Clear` | `Implemented` | Periksa indikator status peringatan pada kartu personil yang memiliki akumulasi pelanggaran di atas ambang batas. |
| **FR-43** | Pemberian Dispensasi Kepatuhan Resmi (Exemption) | PRD v1.6 §3.5 | `HRGA`, `CEO_MANAGEMENT` | HRGA atau Direksi berwenang memberikan dispensasi resmi (tugas luar kantor darurat, server down regional) untuk menghapus catatan pelanggaran. | Tinggi | `Clear` | `Implemented` | Buka `/exemptions`, buat dispensasi baru untuk seorang karyawan, verifikasi catatan kepatuhan karyawan pulih. |
| **FR-44** | Jejak Audit Perubahan Kepatuhan (Compliance Audit Trail) | PRD v1.6 §3.5, DEC-013 | `HRGA`, `SYSTEM_ADMIN` | Setiap persetujuan koreksi atau pemberian dispensasi tercatat permanen dalam audit log sistem dengan identitas eksekutor dan timestamp. | Kritis | `Clear` | `Implemented` | Periksa riwayat audit setelah dispensasi disetujui, pastikan nama eksekutor dan tanggal tercatat akurat. |

---

### 3.7 Modul 7: Pengelolaan Cuti & Rekonsiliasi Otomatis (FR-45 s.d. FR-48)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-45** | Formulir Pengajuan Cuti Mandiri | PRD v1.6 §3.6 | `EMPLOYEE` | Karyawan dapat mengajukan cuti tahunan, sakit, atau darurat dengan menentukan tanggal mulai, selesai, dan alasan pendukung. | Tinggi | `Clear` | `Implemented` | Buka `/leave/my`, pilih tipe cuti Tahunan, tentukan tanggal, isi alasan pengajuan, submit form. |
| **FR-46** | Antrean Persetujuan Cuti Tim (Leave Approval Queue) | PRD v1.6 §3.6 | `SUPERVISOR`, `HEAD`, `HRGA` | Atasan langsung menerima pengajuan cuti anggota timnya dan berwenang menyetujui atau menolak permohonan. | Tinggi | `Clear` | `Implemented` | Login sebagai Supervisor, buka `/leave/queue`, klik setujui pada pengajuan cuti anggota tim. |
| **FR-47** | Rekonsiliasi Cuti Otomatis Pasca Cut-Off (DEC-008) | PRD v1.6 §3.6, DEC-008 | Sistem, `HRGA` | Hari kerja yang tercover oleh cuti yang telah disetujui resmi ditandai otomatis sebagai `Superseded by Approved Leave` dan dibebaskan dari kewajiban submit. | Kritis | `Clear` | `Implemented` | Ajukan cuti untuk hari ini, setujui cuti, verifikasi status kepatuhan harian tidak berubah menjadi "No Submission". |
| **FR-48** | Sinkronisasi Kuota Cuti & Kalender Operasional | PRD v1.6 §3.6 | `HRGA`, `EMPLOYEE` | Sistem menampilkan sisa kuota hak cuti tahunan dan kalender libur nasional resmi Dutamedia. | Sedang | `Clear` | `Implemented` | Periksa widget sisa kuota cuti di halaman My Leave, pastikan kuota terpotong setelah cuti disetujui. |

---

### 3.8 Modul 8: Supervisi, Bimbingan, & Pelaporan Eksekutif (FR-49 s.d. FR-55)

| Req ID | Nama Kebutuhan | Sumber & Bagian | Peran Aktor | Aturan Bisnis & Kriteria Penerimaan | Risiko Kegagalan | Status Kejelasan | Status Statis | Kebutuhan Pengujian UAT |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **FR-49** | Pemberian Catatan Bimbingan Manajer (Coaching Note) | PRD v1.6 §3.7 | `SUPERVISOR`, `HEAD` | Atasan dapat menyematkan catatan bimbingan atau apresiasi kerja pada komitmen harian anggota tim dengan riwayat tersimpan rapi. | Sedang | `Clear` | `Implemented` | Buka `/coaching`, pilih salah satu bawahan, tulis catatan pembinaan, verifikasi catatan muncul di timeline. |
| **FR-50** | Dasbor Operasional Tim (Team Pulse Dashboard) | PRD v1.6 §3.7 | `SUPERVISOR` | Supervisor memiliki dasbor terpusat berisi ringkasan tingkat partisipasi komitmen, blocker aktif tim, dan komitmen berisiko kuning/merah. | Tinggi | `Clear` | `Implemented` | Login sebagai Supervisor, buka `/dashboard`, verifikasi metrik personil butuh bantuan dan rekap komitmen tim. |
| **FR-51** | Radar Risiko Proyek & Inisiatif (Project Risk Radar) | PRD v1.6 §3.7 | `PM`, `HEAD`, `CEO_MANAGEMENT` | Tampilan risiko agregat per inisiatif proyek strategis berdasarkan akumulasi blocker teknis dan hambatan eksternal. | Tinggi | `Clear` | `Implemented` | Buka `/projects/risk`, filter proyek strategis, amati skor risiko proyek dan daftar komitmen terkait. |
| **FR-52** | Dasbor Eksekutif & Direksi (Management Pulse) | PRD v1.6 §3.7 | `CEO_MANAGEMENT`, `HEAD` | Ringkasan kondisi makro seluruh divisi perusahaan, skor akuntabilitas organisasi, dan tren blocker menahun. | Tinggi | `Clear` | `Implemented` | Login sebagai CEO (`direktur@dutamedia.com`), buka tab Management Pulse, verifikasi statistik makro. |
| **FR-53** | Laporan Eksekutif & Ekspor Data Audit | PRD v1.6 §3.7 | `HRGA`, `CEO_MANAGEMENT` | Fitur ekspor laporan kepatuhan berkala (mingguan/bulanan) dalam format tabel terstruktur untuk kebutuhan evaluasi direksi. | Sedang | `Clear` | `Implemented` | Buka `/reports`, pilih rentang tanggal laporan, klik tombol ekspor/unduh, pastikan file data terunduh. |
| **FR-54** | Delegasi Peninjau Sementara (Temporary Reviewer) | PRD v1.6 §3.8, DEC-009 | `SYSTEM_ADMIN`, `HRGA` | Pendelegasian hak review atasan yang berhalangan ke atasan lain dengan batas waktu tanggal aktif yang ketat. | Tinggi | `Clear` | `Implemented` | Buka `/admin/temporary-reviewers`, buat delegasi dari Bambang ke Rian, verifikasi Rian dapat melihat queue Bambang. |
| **FR-55** | Konfigurasi Kebijakan Operasional Sistem (Policy Settings) | PRD v1.6 §3.8 | `SYSTEM_ADMIN`, `CEO_MANAGEMENT` | Pengaturan jam cut-off pagi, cut-off sore, durasi grace period, threshold kepatuhan 3x, dan SLA blocker. | Kritis | `Clear` | `Implemented` | Buka `/admin/policies`, ubah parameter batas waktu simulasi, pastikan perubahan tersimpan di database. |

---

## 4. ANALISIS KESENJANGAN STATIS (GAP & AMBIGUITY ANALYSIS)

Berdasarkan perbandingan silang antara spesifikasi perancangan dengan implementasi kode sumber aktual, ditemukan poin analisis kesenjangan berikut:

1. **Format Ekspor Laporan Eksekutif (FR-53):**
   - *Kondisi Dokumen:* Dokumen menyebutkan penyediaan laporan untuk direksi.
   - *Kondisi Kode Sumber:* Antarmuka menyediakan tombol trigger ekspor tabel data; backend merespons dengan agregat data terstruktur.
   - *Status UAT:* Pengujian manual memvalidasi kelengkapan filter rentang tanggal, tampilan metrik pada layar, dan ketiadaan error saat tombol ekspor diakses.
2. **Kanal Notifikasi Pihak Ketiga (WhatsApp / Email Eksternal):**
   - *Kondisi Dokumen:* PRD menyebutkan integrasi multi-kanal (In-App, Email, WhatsApp).
   - *Kondisi Kode Sumber:* Sistem internal mengelola in-app Notification Center (`/notifications`) dan mock/sandbox dispatcher channel setup (`/admin/notifications`).
   - *Status UAT:* Pengujian difokuskan pada keandalan in-app notification center dan perubahan status dispatcher tanpa memerlukan biaya kirim SMS/WhatsApp nyata.
3. **Penyesuaian Resolusi Viewport Responsive:**
   - *Kondisi Desain:* Visual Design System v1.5.0 mewajibkan grid sidebar 232px desktop dan adaptasi drawer mobile pada viewport <= 1024px.
   - *Kondisi Kode Sumber:* Telah disempurnakan pada Pilar 5 & 6 (sidebar 232px permanen pada desktop, drawer overlay pada mobile).
   - *Status UAT:* Skenario khusus pengujian tampilan desktop (1440px) dan mobile (375px) disertakan secara eksplisit dalam katalog test case.
