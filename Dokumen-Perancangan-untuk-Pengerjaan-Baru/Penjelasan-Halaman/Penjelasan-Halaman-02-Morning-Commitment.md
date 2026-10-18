# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 02: MY TODAY — MORNING COMMITMENT

- **Berkas Prototipe:** [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)
- **Rute Sistem:** `/today/morning`
- **Posisi Alur:** Langkah 1 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Tujuan Utama Halaman
Halaman **Morning Commitment** adalah gerbang pertama akuntabilitas harian bagi setiap karyawan WorkPulse di pagi hari. Halaman ini berfungsi untuk:
1. **Menetapkan Prioritas Terukur:** Membimbing karyawan mengunci 1 hingga 3 hasil kerja terpenting (*deliverable*) yang realistis dan terukur sebelum memulai pekerjaan.
2. **Transparansi Risiko Sejak Awal (*Early Risk Flagging*):** Mengidentifikasi potensi kendala (AMBER) atau ancaman kritis (RED) secara jujur di pagi hari agar pimpinan dan tim dapat segera memberikan dukungan sebelum terjadi kegagalan.
3. **Mencegah *"Silent Slippage"* & Stagnasi Tugas:** Menyaring pekerjaan lama yang belum selesai melalui aturan sistem otomatis (*Anti-stagnasi*), sehingga tugas yang berlarut-larut tidak dapat disembunyikan sebagai status hijau (GREEN).

### 1.2 Prinsip Desain & Batasan Ketat
- **NOL Emoticon / Emoji:** Seluruh antarmuka hanya menggunakan tipografi profesional dan ikon inline SVG monokrom.
- **Warna Merah Lembut (*Soft Rose*):** Menghindari merah terang menyilaukan; menggunakan latar `#FFF8F8`, border `#FECDCA`, dan teks `#DC2626` / `#991B1B` agar informatif tanpa menciptakan kepanikan visual.
- **Bahasa Manusiawi (*Zero Developer Jargon*):** Istilah sistem diterjemahkan ke dalam bahasa kerja sehari-hari yang profesional dan lugas.
- **Sidebar Tunggal Harian:** Hanya ada menu kerja tunggal `My Today` untuk alur kerja harian karyawan.

---

## 2. ANATOMI & KOMPONEN ANTARMUKA (UI COMPONENTS)

Halaman ini tersusun atas 11 blok komponen terintegrasi:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & DAILY WORKFLOW STEP BAR (1. Morning -> 2. Additional -> 3. EOD) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. EXEMPTION BANNER (Opsional: Hanya untuk Akun Pengecualian Terbuka / C-Level)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL KONTEKS HARI INI (Grid 4-Kolom Terpadu: Tanggal, Batas Waktu,       │
│    Status Pengisian, dan Live Agregasi Status Risiko Hari Ini)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TIMING ALERT BANNER (Dinamis: Masa Toleransi Amber / Keterlambatan Merah) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ZERO COMMITMENT TOGGLE & PANEL ALASAN RESMI (Training, Dinas, Townhall)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. DRAF PEKERJAAN BERLANJUT (Pool Carry-over dengan Formula Metadata Seragam)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. FOKUS PRIORITAS HARI INI (Catatan Konteks Non-binding dari EOD Kemarin)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. FORMULIR SLOT KOMITMEN (1-3 Slot: Deliverable, Prompt Hint, Risiko, Link)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. INPUT ALASAN KETERLAMBATAN (Kondisional: Wajib jika Pengisian > 09:30)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 10. ACTION FOOTER BAR (Simpan Draf Lokal & Tombol Kirim Komitmen)           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 11. MODAL KONFIRMASI (Konfirmasi Pengiriman & Modal Hentikan Pekerjaan Draf)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 12. DRAWER NAVIGASI MOBILE (Hamburger Topbar, Sidebar Off-Canvas, Backdrop) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BAKU (STANDAR FORMULA SISTEM)

### 3.1 Formula Baku Draf Pekerjaan Berlanjut (Metadata & Badge Status)
Untuk menjaga konsistensi 100% dan menghilangkan ambiguitas serta redundansi, draf carry-over wajib dirender dengan aturan baku berikut:

1. **Badge Status Kanan (Murni Status Kelanjutan):**
   - Menggunakan tema warna **Amber** (`.pill amber`) untuk seluruh item agar konsisten.
   - Nilai badge murni menunjukkan status kelanjutan:
     - **`Berlanjut`** $\rightarrow$ jika pekerjaan kemarin aktif dimasukkan ke komitmen dan berlanjut hari ini.
     - **`Tertunda`** $\rightarrow$ jika pekerjaan kemarin tidak dimasukkan ke komitmen / sempat jeda.
   - *Catatan Penting:* Badge **tidak boleh mencantumkan tanggal atau total hari** (misal bukan *"Tertunda sejak 12 Okt"* atau *"Total 3 Hari"*), karena seluruh rincian tanggal dan akumulasi durasi sudah tertata rapi di baris metadata.

2. **Baris Metadata & Catatan (Tersusun Seragam & Memanjang Penuh):**
   - **Baris Header:** Sisi kiri [Checkbox] + Judul Tugas, Sisi kanan Status Amber + Tombol Aksi (pada desktop/tablet $\ge$ 681px). Pada mobile $\le$ 680px, status dan tombol pindah ke baris paling bawah dengan pemisah bertitik.
   - **Baris Metadata:** Kapsul/Tag mini abu-abu (`[Terakhir: ...] [Status: ...] [Total: ...]`) membentang penuh selebar kartu di bawah judul.
   - **Baris Catatan Karyawan:** Callout Box lembut bersudut tumpul (`#F8FAFC`, border `#E2E8F0`) membentang penuh selebar kartu sampai batas padding kanan, dengan label `CATATAN:` di atas dan kutipan miring di bawahnya.
   - **Baris Aturan Sistem (jika Hari Kerja $\ge 2$):**  
     `ⓘ Status awal minimal AMBER (tidak dapat dilanjutkan dengan status GREEN).` membentang penuh di bawah Callout Catatan.

### 3.2 Aturan Penegakan Risiko Minimal AMBER (*Amber Lock Engine*)
Sistem secara matematis mengevaluasi atribut `active_days_count` pada setiap pekerjaan:
- **Jika Hari Kerja $< 2$ (Hari ke-1):** Karyawan bebas memilih GREEN, AMBER, atau RED. Baris peringatan sistem **tidak dirender**.
- **Jika Hari Kerja $\ge 2$:** Radio pilihan GREEN otomatis **dinonaktifkan (*disabled*)**, pilihan otomatis mengunci minimal AMBER, baris peringatan sistem muncul di draf pool dan kartu komitmen, serta panel *"Penjelasan Risiko"* wajib diisi.

### 3.3 Spesifikasi Tata Letak Responsif Multi-Device & Mobile Drawer
Halaman Morning Commitment diuji dan dioptimalkan secara presisi untuk 4 zona perangkat:

1. **Layar Ultrawide & Desktop Besar (> 1440px):**
   - Kontainer `.content` dikunci dengan batas lebar maksimum `max-width: 1140px; margin: 0 auto;`.
   - Mengeliminasi distorsi visual pada layar monitor 27"-34" ultrawide, menjaga proporsi form tetap elegan dan mudah dibaca tanpa peregangan berlebih.

2. **Layar Tablet (681px – 992px):**
   - **Navigasi Off-Canvas:** Sidebar disembunyikan di luar layar kiri (`left: -290px`) dan terbuka mulus sebagai *drawer slide-over* dengan menekan tombol hamburger di topbar.
   - **Backdrop Blur:** Menampilkan lapisan semi-transparan `rgba(15, 23, 42, 0.45)` dengan filter blur 2px yang menutup konten saat drawer aktif. Klik backdrop atau tekan `Esc` otomatis menutup drawer.
   - **Grid Adaptif:** Kolom grid 2-kolom (slot komitmen dan draf carry-over) otomatis bertransformasi menjadi 1 kolom vertikal yang leluasa.

3. **Layar Smartphone / Ponsel Pintar ($\le$ 680px):**
   - **Header & Action Stacking:** Tombol darurat header (`Lapor Blocker`) berpindah ke baris baru full-width tepat di bawah judul halaman.
   - **Panel Jadwal 1-Kolom:** Kartu jadwal pengisian 3 kolom beralih menjadi 1 kolom tumpuk vertikal dengan pemisah garis horizontal halus.
   - **Draf Carry-over Anti-Himpit (Checklist Sejajar di Kiri):** Kotak centang (*checkbox*) dijamin selalu berada di sebelah kiri teks judul (bukan melayang di atas), dengan arsitektur grid 2 kolom. Baris bawah memuat badge Amber dan tombol "Hentikan Pekerjaan" dengan pemisah garis atas bertitik, mencegah teks judul terpotong atau berdesakan sekaligus menjaga pengalaman to-do list yang natural.
   - **Formulir Full-Width Stack:** Radio button status risiko tersusun 3 kolom proporsional, sedangkan tombol `Pilih Blocker Aktif` dan kotak input `Tautan Referensi` tersusun 1 kolom penuh vertikal.
   - **Sticky Footer Action Bar (Thumb Zone):** Baris aksi bawah mengambang (*sticky bottom*), tombol primer `Kirim Morning Commitment` mengambil lebar penuh 100% pada area jangkauan jempol dengan tinggi sentuh ergonomis 44px.

---

## 4. KATALOG LENGKAP 33 KONDISI & SKENARIO SISTEM

Berikut adalah dokumentasi detail dari seluruh 33 skenario yang terbagi dalam 9 kelompok:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 1: DIMENSI WAKTU & SIKLUS KEHADIRAN (4 Skenario)                │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 1.1: Pengisian Tepat Waktu (*On-Time Window* $\le$ 09:00 WIB)
- **Kondisi:** Karyawan mengisi dan mengirim komitmen sebelum atau tepat pukul 09:00 WIB.
- **Tampilan Antarmuka:**
  - Panel Jadwal: `Batas Tepat Waktu: 09:00 WIB` | Subteks: `Masa toleransi s.d. 09:30 WIB`.
  - Status Pengisian: `Menunggu Pengisian` *(Pill Amber)* $\rightarrow$ Pasca-kirim: `Tersimpan · Tepat Waktu` *(Pill Hijau)*.
  - Banner peringatan waktu: **Tidak muncul**.
- **Efek Sistem:** Tercatat resmi sebagai kehadiran On-Time (100% tepat waktu). Baseline komitmen terkunci.

### Skenario 1.2: Pengisian Dalam Masa Toleransi (*Grace Period*: 09:01 – 09:30 WIB)
- **Kondisi:** Karyawan membuka formulir antara pukul 09:01 hingga 09:30 WIB (kebijakan toleransi 30 menit).
- **Tampilan Antarmuka:**
  - Status Pengisian: `Masa Toleransi` *(Pill Amber)* | Subteks: `Masa toleransi aktif s.d. 09:30 WIB`.
  - Muncul banner amber `#timing-grace-banner`: *"Masa Toleransi (Grace Period) Aktif: Batas tepat waktu pukul 09:00 WIB telah terlewati, namun Anda masih berada dalam masa toleransi 30 menit. Komitmen yang diserahkan dalam periode ini tetap dicatat sebagai pemenuhan kehadiran tanpa penalti."*
- **Efek Sistem:** Formulir dapat dikirim secara normal tanpa perlu mengisi alasan keterlambatan. Pasca-kirim berstatus `Tersimpan · Masa Toleransi` *(Pill Amber)*.

### Skenario 1.3: Pengisian Melewati Masa Toleransi / Terlambat (> 09:30 WIB)
- **Kondisi:** Karyawan membuka formulir setelah pukul 09:30 WIB pada hari kerja berjalan.
- **Tampilan Antarmuka:**
  - Status Pengisian: `Terlambat Mengisi` *(Pill Merah Lembut)* | Subteks: `Melewati batas toleransi 09:30 WIB`.
  - Muncul banner merah lembut `#timing-late-banner`: *"Pengisian Melewati Masa Toleransi (Terlambat): Batas toleransi pengisian (09:30 WIB) telah berakhir..."*
  - Di atas Action Footer muncul panel wajib: `#late-reason-panel` berisi `Alasan Keterlambatan Pengisian Komitmen *`.
- **Efek Sistem:** Tombol kirim memvalidasi isi textarea alasan keterlambatan. Jika kosong, pengiriman dicegah. Pasca-kirim berstatus `Tersimpan · Terlambat` *(Pill Merah)* dan alasan diteruskan ke laporan pemantauan Team Lead.

### Skenario 1.4: Lewat Hari Kerja Tanpa Mengisi (*No Submission / Missed Baseline*)
- **Kondisi:** Karyawan sama sekali tidak membuka atau mengirimkan komitmen hingga hari kerja berganti (evaluasi malam EOD terlewati).
- **Efek Sistem:** Sistem mencatat pelanggaran kedisiplinan *No Submission*. Form Morning hari tersebut ditutup permanen dengan status terkunci (*Locked - No Submission*). Karyawan tidak dapat mengisi mundur komitmen pagi hari sebelumnya.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 2: DIMENSI HAK AKSES & STATUS KARYAWAN (3 Skenario)             │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 2.1: Karyawan Reguler (Wajib Partisipasi Penuh)
- **Kondisi:** Akun standar non-eksekutif yang tidak sedang cuti (default profil: Budi Pratama).
- **Tampilan Antarmuka:** Seluruh form, batas waktu, slot maksimal 3, dan validasi penalti berlaku normal.

### Skenario 2.2: Pengecualian Terbuka (*Indefinite Role Exemption* — CEO / Dewan Direksi)
- **Kondisi:** Akun memiliki status jabatan struktural eksekutif tertinggi (`activeUser.isExempt = true`).
- **Tampilan Antarmuka:**
  - Di bagian paling atas muncul banner hijau `#exemption-banner`: *"Pengecualian Partisipasi Terbuka (Indefinite Role Exemption): Akun Anda memiliki status pengecualian terbuka sesuai kebijakan organisasi. Pengisian komitmen harian bersifat opsional dan tidak dibatasi oleh penalti Cut-Off."*
  - Panel Jadwal: `Batas Tepat Waktu: Bebas Batas Waktu`.
- **Efek Sistem:** Pimpinan tetap dapat mengisi komitmen jika ingin memberi teladan transparansi, namun sistem tidak pernah mencatat keterlambatan maupun penalti *No Submission*.

### Skenario 2.3: Karyawan Sedang Cuti / Izin Resmi (*On Leave*)
- **Kondisi:** Tanggal hari ini terdaftar pada data pengajuan cuti resmi yang telah disetujui HRGA.
- **Tampilan Antarmuka:** Akses ke formulir komitmen pagi diblokir oleh pelindung sistem (*route guard*). Halaman menyajikan kartu status santun: *"Hari ini Anda tercatat sedang Cuti Tahunan / Izin Resmi. Formulir komitmen dinonaktifkan."*

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 3: DIMENSI DRAF PEKERJAAN BERLANJUT (5 Skenario)                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 3.1: Draf Tertunda 1 Hari (Sempat Jeda / Kemarin Tidak Dikerjakan)
- **Kondisi:** Pekerjaan baru dikerjakan 1 hari sebelumnya, kemarin tidak masuk komitmen/jeda.
- **Tampilan UI:**
  - Baris 1: `Terakhir: Senin, 12 Okt | Status: Sebagian Selesai | Total Pengerjaan: 1 Hari Kerja`
  - Baris 2: `Catatan: "Menunggu verifikasi webhook sandbox"`
  - Badge Kanan: `Tertunda` *(Amber)*.
  - Baris Peringatan: **Tidak muncul**.
- **Efek di Slot Komitmen:** Jika dimasukkan ke slot, radio GREEN **tetap aktif** (karyawan boleh memilih GREEN jika hari ini diprediksi lancar), dengan badge slot `Tertunda`.

### Skenario 3.2: Draf Berlanjut Aktif Beruntun $\ge 2$ Hari
- **Kondisi:** Pekerjaan kemarin dikerjakan aktif tapi belum selesai, hari ini dilanjutkan kembali.
- **Tampilan UI:**
  - Baris 1: `Terakhir: Selasa, 13 Okt | Status: Belum Selesai | Total Pengerjaan: 2 Hari Kerja`
  - Baris 2: `Catatan: "Analisis dump log membutuhkan waktu tambahan"`
  - Baris 3: `ⓘ Status awal minimal AMBER (tidak dapat dilanjutkan dengan status GREEN).`
  - Badge Kanan: `Berlanjut` *(Amber)*.
- **Efek di Slot Komitmen:** Otomatis mengunci minimal AMBER (GREEN *disabled*), memunculkan badge slot `Berlanjut`, dan membuka panel penjelasan risiko.

### Skenario 3.3: Draf Akumulasi Multi-Hari yang Sempat Jeda (Kasus 3 Hari Kerja)
- **Kondisi:** Pernah dikerjakan aktif beberapa hari (misal 7–9 Okt, total 3 hari kerja), kemarin jeda, hari ini diambil lagi.
- **Tampilan UI:**
  - Baris 1: `Terakhir: Jumat, 9 Okt | Status: Sebagian Selesai | Total Pengerjaan: 3 Hari Kerja`
  - Baris 2: `Catatan: "Perlu refactor query sebelum sinkronisasi dijalankan"`
  - Baris 3: `ⓘ Status awal minimal AMBER (tidak dapat dilanjutkan dengan status GREEN).`
  - Badge Kanan: `Tertunda` *(Amber)*.
- **Efek di Slot Komitmen:** Otomatis mengunci minimal AMBER (GREEN *disabled*), memunculkan badge slot `Tertunda`, dan membuka panel penjelasan risiko.

### Skenario 3.4: Tindakan Penghentian Pekerjaan Draf (*Stop / Drop Task*)
- **Kondisi:** Karyawan memutuskan pekerjaan lama yang belum selesai tidak relevan lagi dilanjutkan (dibatalkan klien, dipindahkan ke divisi lain, dsb.).
- **Alur Interaksi:**
  1. Karyawan menekan tombol `Hentikan Pekerjaan` (stroke merah lembut `#FECACA`).
  2. Muncul modal konfirmasi resmi `#modal-confirm-stop-draft`.
  3. Karyawan **wajib mengisi alasan penghentian** pada `#stop-draft-reason`.
  4. Tombol `Ya, Hentikan Pekerjaan` diklik $\rightarrow$ item terhapus dari pool, counter berkurang, dan alasan penghentian tersimpan di *audit trail*. Tugas tidak akan pernah muncul lagi di hari berikutnya.

### Skenario 3.5: Seluruh Draf Dihentikan / Draf Kosong
- **Kondisi:** Karyawan menghentikan semua draf yang ada atau memang tidak memiliki sisa tugas kemarin.
- **Tampilan UI:** Daftar draf menampilkan pesan kosong elegan: *"Tidak ada draf pekerjaan berlanjut saat ini."* Tombol *"Gunakan Item Terpilih"* otomatis dinonaktifkan.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 4: DIMENSI PENGISIAN SLOT KOMITMEN (4 Skenario)                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 4.1: Alokasi & Batasan Slot (Batas Maksimal 3 Slot)
- **Kondisi Operasional:**
  - Saat layar dimuat: Slot 1 otomatis terbuka.
  - Karyawan dapat menekan `+ Tambah Slot Komitmen` hingga maksimal 3 slot.
  - Saat jumlah slot $= 3$: Tombol tambah slot otomatis dinonaktifkan (*disabled*) dan counter menunjukkan `3 / 3 Slot Terisi`.
  - Karyawan dapat menghapus kartu slot. Nomor urut slot otomatis diperbarui (*renumbering* 1, 2, 3). Tombol hapus slot dicegah jika hanya tersisa 1 slot (karena minimal 1 komitmen wajib ada).

### Skenario 4.2: Petunjuk Format Berbasis Peran (*Role-Based Prompt Hint*)
- **Kondisi:** Di bawah kotak teks hasil kerja (deliverable), muncul teks bisikan miring (*italic*) yang otomatis berganti mengikuti fungsi/divisi akun karyawan (`activeUser.function`):
  - *Engineering:* `"Contoh: Implementasi endpoint API login, refactor query optimasi, atau perbaikan bug ticket #123"`
  - *Finance:* `"Contoh: Rekonsiliasi mutasi bank invoice Q3, verifikasi laporan reimburse, atau closing pajak bulanan"`
  - *HRGA:* `"Contoh: Proses onboarding karyawan baru, pengadaan inventaris kantor, review absensi tim bulanan"`
  - *(serta divisi Ops, Sales, Delivery, Management)*.
- **Sifat:** Non-binding (hanya inspirasi pemandu visual), tidak ikut tersimpan ke database saat submit.

### Skenario 4.3: Deteksi Teks Generik / Terlalu Singkat (*Quality Warning Badge*)
- **Kondisi:** Karyawan mengetik deliverable yang terlalu abstrak/pendek ($< 10$ karakter atau hanya kata generik seperti: `kerja`, `task`, `meeting`, `review`, `coding`, `lanjut`, `bikin`, `followup`).
- **Tampilan UI:** Tepat di bawah input, muncul badge kuning peringatan kualitas:  
  `⚠ Peringatan Kualitas: Komitmen terdeteksi sangat singkat atau generik. Pastikan menyebutkan deliverable terukur agar progres EOD dapat dievaluasi secara akurat.`
- **Prinsip Penting:** Bersifat edukatif dan **TIDAK memblokir tombol submit**. Jika teks diperjelas, badge otomatis hilang seketika (*live dynamic evaluation*).

### Skenario 4.4: Konteks Referensi Kemarin (*Tomorrow Priority Context Note*)
- **Kondisi:** Jika kemarin sore saat EOD karyawan sempat mengisi catatan rencana esok hari (*Tomorrow Priority*).
- **Tampilan UI:** Ditampilkan di dalam panel memo berlatar krem lembut dengan badge *Hanya Referensi*.
- **Aturan Ketat (BR-20):** Memo ini murni pengingat pribadi. Sistem **dilarang keras** menggunakannya untuk auto-generate slot komitmen, auto-submit, atau memengaruhi status risiko awal.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 5: DIMENSI PENILAIAN RISIKO & ATURAN PENEGAKAN (5 Skenario)      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 5.1: Komitmen Bebas Risiko (GREEN)
- **Kondisi:** Karyawan memilih opsi radio GREEN.
- **Tampilan UI:** Panel *"Penjelasan Risiko & Kebutuhan Dukungan"* otomatis tersembunyi (*collapsed*).

### Skenario 5.2: Komitmen Berpotensi Kendala (AMBER)
- **Kondisi:** Karyawan memilih opsi radio AMBER (atau terkunci AMBER dari draf lanjutan).
- **Tampilan UI:**
  - Panel risiko terbuka dengan tema amber lembut (background `#FFFDF7`, border `#FEDF89`, judul `#92400E`).
  - Placeholder: *"Jelaskan faktor apa yang membuat target ini berisiko atau berpotensi tertunda..."*
  - Label Dukungan: *"Dukungan yang Diperlukan (Opsional)"*.

### Skenario 5.3: Komitmen Risiko Kritis / Terancam Gagal (RED)
- **Kondisi:** Karyawan memilih opsi radio RED.
- **Tampilan UI:**
  - Panel risiko terbuka dengan tema soft rose (background `#FFF8F8`, border `#FECDCA`, judul `#991B1B`).
  - Placeholder: *"Jelaskan kendala kritis yang menyebabkan komitmen ini berisiko tinggi gagal diselesaikan hari ini..."*
  - Label Dukungan: *"Dukungan Mendesak dari Lead / Tim (Disarankan)"*.

### Skenario 5.4: Penegakan Aturan Anti-Stagnasi (*Amber Lock Rule*)
- **Kondisi:** Komitmen berasal dari draf carry-over yang memiliki riwayat $\ge 2$ hari kerja.
- **Tindakan Sistem:**
  1. Radio GREEN otomatis dinonaktifkan (`disabled`).
  2. Radio otomatis terpilih AMBER (atau RED).
  3. Di bawah radio muncul catatan aturan: `Status awal minimal AMBER (tidak dapat dilanjutkan dengan status GREEN).`
  4. Panel penjelasan risiko otomatis terbuka dan wajib diisi.

### Skenario 5.5: Agregasi Status Risiko Hari Ini (*Initial Daily Status Heuristic*)
- **Penyajian UI:** Ditampilkan secara elegan di **kolom ke-4 Panel Konteks Hari Ini** (`repeat(4, 1fr)`), menggantikan kotak preview terpisah agar menghemat ruang vertikal dan selaras 100% dengan Halaman 03.
- **Kondisi:** Dihitung secara *real-time* berbasis aturan heuristik risiko tertinggi:
  - Jika ada minimal satu slot RED $\rightarrow$ **RED — Risiko Tinggi** *(Pill Merah: RED · Subteks: Risiko Tinggi (Eskalasi Diperlukan))*.
  - Jika tidak ada RED tetapi ada minimal satu AMBER $\rightarrow$ **AMBER — Perlu Perhatian** *(Pill Amber: AMBER · Subteks: Perhatian (Pantau Berkala))*.
  - Jika seluruh slot terisi berstatus GREEN $\rightarrow$ **GREEN — Terkendali** *(Pill Hijau: GREEN · Subteks: Terkendali Mandiri)*.
  - Jika opsi Zero Commitment aktif $\rightarrow$ **Netral — Tanpa Komitmen Khusus** *(Pill Netral: Netral · Subteks: Alasan Operasional Resmi)*.
  - Jika belum ada komitmen aktif $\rightarrow$ **Netral — Belum Diisi** *(Pill Netral: Belum Diisi · Subteks: Belum ada komitmen aktif)*.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 6: DIMENSI INTEGRASI TIKET BLOCKER & DEPENDENSI (2 Skenario)    │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 6.1: Menautkan Tiket Blocker Tim Aktif (Quick Picker)
- **Kondisi:** Karyawan ingin menautkan komitmennya dengan blocker tim yang sudah ada.
- **Interaksi:**
  1. Pada kolom *Tautan Referensi*, klik tombol `Pilih Blocker Aktif ▾`.
  2. Dropdown menu mengapung menampilkan tiket aktif tim (`#BLK-014`, `#BLK-011`, `#BLK-009`) lengkap dengan status badge (*Open, Acknowledged, In Progress*).
  3. Saat tiket diklik:
     - Kolom referensi otomatis terisi: `[#BLK-014] Keterlambatan respons spesifikasi API dari klien X`.
     - *Smart Auto-fill:* Jika kotak teks deliverable masih kosong, sistem otomatis menawarkan draf: *"Menyelesaikan kendala #BLK-014: Keterlambatan respons spesifikasi API dari klien X"*.

### Skenario 6.2: Kelonggaran Input Teks Risiko jika Tiket Blocker Dipilih
- **Kondisi:** Komitmen berstatus AMBER atau RED, dan karyawan memilih tiket blocker pada dropdown panel risiko.
- **Tindakan Sistem:**
  - Tanda bintang merah wajib (`*`) pada field *"Faktor Risiko yang Diantisipasi"* disembunyikan.
  - Teks instruksi berubah menjadi: `(Opsional — tiket blocker telah dipilih)`. Karyawan tidak diwajibkan mengetik ulang penjelasan kendala karena konteksnya sudah terangkum di dalam tiket blocker tersebut.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 7: DIMENSI OPSI TANPA KOMITMEN / ZERO COMMITMENT (1 Skenario)   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 7.1: Mengaktifkan Opsi No Commitment (UF-10)
- **Kondisi:** Karyawan mencentang checkbox *"Hari ini tidak ada komitmen harian khusus"* (misal karena training seharian atau dinas luar).
- **Tindakan UI:**
  1. Panel kartu komitmen di bawahnya otomatis meredup (opacity 0.45) dan seluruh input/tombol di dalamnya dinonaktifkan (*disabled*).
  2. Panel alasan resmi `#zero-reason-panel` terbuka, mewajibkan memilih dropdown: `Pelatihan / Training Penuh Hari`, `Kegiatan Perusahaan / Townhall`, `Dinas Luar / Penugasan Lapangan`, atau `Alasan Operasional Lainnya`.
  3. Jika opsi "Lainnya" dipilih, textarea penjelasan detail wajib diisi.
- **Hasil Sistem:** Status risiko hari ini menjadi Netral. Karyawan terbebas dari penalti absensi (*No Submission*) dan tidak dituntut mengisi capaian deliverable di sore hari.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 8: DIMENSI PENGIRIMAN, PENGUNCIAN & KOREKSI (5 Skenario)        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 8.1: Simpan Draf Lokal (*Draft Save*)
- **Kondisi:** Karyawan menekan tombol `Simpan Draf`.
- **Hasil Sistem:** Data formulir tersimpan di memori lokal peramban (*browser local storage*). Jika tab browser tertutup atau baterai habis sebelum sempat mengirim resmi, data komitmen tidak akan hilang saat dibuka kembali.

### Skenario 8.2: Validasi Formulir Sebelum Kirim (*Pre-Flight Checks*)
- **Kondisi:** Karyawan menekan tombol `Kirim Morning Commitment`.
- **Pemeriksaan Sistem:**
  1. Wajib ada minimal 1 komitmen aktif (atau opsi Zero Commitment aktif dengan alasan valid).
  2. Teks deliverable tidak boleh kosong atau hanya spasi.
  3. Untuk slot AMBER/RED: wajib memilih tiket blocker terkait ATAU mengisi teks faktor risiko.
  4. Jika waktu pengisian $> 09:30$ WIB: wajib mengisi alasan keterlambatan pengisian.
  - Jika ada field wajib yang belum lengkap, sistem menampilkan alert instruksi dan memfokuskan kursor ke field yang kurang.

### Skenario 8.3: Modal Konfirmasi Resmi (UF-06)
- **Kondisi:** Seluruh validasi formulir lolos.
- **Tampilan UI:** Muncul modal dialog `#modal-confirm-submit` yang menampilkan ringkasan akhir: `Initial Daily Status: [GREEN / AMBER / RED]` dan total komitmen yang akan dikunci.
- **Opsi:** Karyawan dapat menekan `Periksa Kembali` (kembali mengedit) atau `Ya, Kirim Komitmen` (mengunci final).

### Skenario 8.4: Penguncian Formulir Pasca-Kirim (*Post-Submit Lockout*)
- **Kondisi:** Pengiriman telah dikonfirmasi.
- **Tindakan Sistem:**
  1. Seluruh kartu komitmen berubah menjadi *read-only* (input teks, radio risiko, tombol hapus terkunci permanen).
  2. Tombol `Kirim Morning Commitment`, `Simpan Draf`, `Tambah Slot`, dan daftar draf dinonaktifkan.
  3. Status pengisian pada panel jadwal terkunci menjadi `Tersimpan · Tepat Waktu` (atau `Tersimpan · Masa Toleransi` / `Tersimpan · Terlambat`).
  4. Layar otomatis melakukan *smooth scroll* ke bawah dan menampilkan **`Next Actions Panel`** (jalan pintas ke *Additional Work*, *Lapor Blocker*, atau info *EOD Outcome* sore nanti).

### Skenario 8.5: Pengajuan Koreksi Baseline Pasca-Kirim (*Morning Correction Request*)
- **Kondisi:** Karyawan menyadari ada kesalahan fatal pada komitmen yang sudah terlanjur dikirim dan terkunci.
- **Aturan Tata Kelola (PRD 4.16a / UF-22):** Form komitmen pagi tidak menyediakan jalan pintas edit langsung. Karyawan harus mengajukan permohonan koreksi resmi melalui tautan rute `/today/morning/correction-request` ([16a-Morning-Correction-Request.html](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/16a-Morning-Correction-Request.html)):
  - Koreksi *Minor* (misal typo penulisan) dapat langsung diperbarui oleh sistem.
  - Koreksi *Material* (mengubah target utama atau menurunkan status risiko) membutuhkan masa peninjauan (*Objection Window*) oleh Team Lead sebelum baseline diubah.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KELOMPOK 9: KASUS KHUSUS & EDGE CASES (4 Skenario)                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Skenario 9.1: Penyerahan Tepat di Detik-Detik Batas (08:59:50 WIB)
- **Kondisi:** Karyawan membuka layar pukul 08:58 WIB, namun baru menekan tombol kirim pukul 09:02 WIB.
- **Penetapan Status:** Sistem mengevaluasi waktu berdasarkan **timestamp server saat request submit diterima**, bukan jam saat layar dibuka di browser. Maka komitmen secara adil dan transparan dicatat sebagai `Masa Toleransi (Grace Period)`, bukan ditolak atau dianggap error.

### Skenario 9.2: Kuota 3 Slot Penuh saat Mengambil Item Draf
- **Kondisi:** Di formulir sudah terisi 2 komitmen manual, lalu karyawan mencentang 2 item dari draf pool dan menekan `Gunakan Item Terpilih`.
- **Tindakan Sistem:** Sistem hanya memasukkan 1 item pertama untuk melengkapi slot ke-3 (batas maksimal 3), membatalkan centang pada item sisanya, dan memunculkan notifikasi halus: *"Slot telah mencapai batas maksimal (3 komitmen). Item draf selebihnya tetap tersimpan di daftar draf."*

### Skenario 9.3: Gangguan Koneksi Internet Saat Submit (*Network Failure*)
- **Kondisi:** Jaringan internet terputus tepat saat karyawan menekan tombol kirim.
- **Tindakan Sistem:** Formulir **TIDAK DIRESET**. Seluruh teks deliverable, radio risiko, dan catatan blocker tetap utuh di layar. Muncul toast merah: *"Gagal mengirim komitmen karena kendala jaringan. Seluruh data Anda tetap tersimpan, silakan periksa koneksi dan coba kirim ulang."*

### Skenario 9.4: Sikronisasi Blocker Tim yang Selesai di Siang Hari
- **Kondisi:** Karyawan menautkan tiket `#BLK-014` di pagi hari, namun di siang hari tiket tersebut ditutup (*resolved*) oleh tim infra.
- **Sifat Data:** Komitmen pagi bertindak sebagai **baseline historis (snapshot)**. Tautan `#BLK-014` tetap tercatat sebagai alasan risiko yang valid pada saat jam 09:00 pagi dibuat, tanpa mengalami distorsi data.

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND DEVELOPER

Untuk menghubungkan antarmuka [02-Morning-Commitment.html](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) ke REST API backend, developer wajib menggunakan struktur payload berikut:

### 5.1 Endpoint Pengiriman Komitmen Pagi
`POST /api/v1/today/morning-commitment`

#### Payload Request (JSON):
```json
{
  "workDate": "2026-10-14",
  "isZeroCommitment": false,
  "zeroCommitmentReason": null,
  "zeroCommitmentDetail": null,
  "lateReason": "Kendala jaringan ISP kantor cabang padam dari pk 08:30 hingga 09:40",
  "clientSubmittedAt": "2026-10-14T09:45:12+07:00",
  "commitments": [
    {
      "slotNumber": 1,
      "deliverable": "Implementasi integrasi endpoint user profile dan validasi sesi",
      "initialRisk": "GREEN",
      "referenceLink": "https://jira.dutamedia.com/browse/DP-104",
      "linkedBlockerCode": null,
      "riskReason": null,
      "supportNeeded": null,
      "carryOverDraftId": null
    },
    {
      "slotNumber": 2,
      "deliverable": "Penyelesaian investigasi memory leak service otentikasi",
      "initialRisk": "AMBER",
      "referenceLink": "[#BLK-011] Staging server staging-db02 tidak dapat diakses",
      "linkedBlockerCode": "BLK-011",
      "riskReason": "Memerlukan akses shell staging yang saat ini masih terkendala",
      "supportNeeded": "Koordinasi dengan DevOps untuk restart pod",
      "carryOverDraftId": "draft-item-2"
    }
  ]
}
```

#### Respons Sukses Server (HTTP 201 Created):
```json
{
  "success": true,
  "message": "Morning Commitment berhasil disimpan.",
  "data": {
    "submissionId": "mc-20261014-00128",
    "timingStatus": "ON_TIME", // Nilai: "ON_TIME" | "GRACE_PERIOD" | "LATE"
    "initialDailyStatus": "AMBER", // Nilai: "GREEN" | "AMBER" | "RED" | "NOT_APPLICABLE"
    "submittedAt": "2026-10-14T08:52:10+07:00",
    "isLocked": true
  }
}
```

---

## 6. KESIMPULAN & STATUS KESIAPAN

Dokumen ini menjadi **acuan resmi (source of truth)** untuk implementasi frontend dan backend modul Morning Commitment. File prototipe [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) telah memuat seluruh elemen visual, struktur HTML/CSS, dan skrip JavaScript yang merefleksikan ke-33 skenario di atas secara lengkap, presisi, dan siap dihubungkan ke API produksi.
