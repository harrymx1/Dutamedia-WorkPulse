# PEDOMAN KONSISTENSI DESAIN, PERILAKU & ATURAN LINTAS HALAMAN
## WORKPULSE — SISTEM AKUNTABILITAS HARIAN & MANAJEMEN RISIKO KERJA
**PT Duta Media Solusindo**

---

> [!IMPORTANT]
> **DOKUMEN INI ADALAH SINGLE SOURCE OF TRUTH (SSOT) KONSISTENSI LINTAS HALAMAN.**  
> Dokumen ini **WAJIB MENJADI ACUAN TUNGGAL UTAMA** dalam implementasi seluruh halaman ke dalam kode *frontend* maupun *backend*.  
> Setiap keputusan desain, pola interaksi, taksonomi data, atau aturan bisnis (*engine rules*) yang disepakati pada tiap halaman wajib dicatat secara presisi dan ditaati tanpa kontradiksi.

---

## DAFTAR ISI
1. [Prinsip Inti & Filosofi Desain Lintas Halaman](#1-prinsip-inti--filosofi-desain-lintas-halaman)
2. [Standar Warna & Palet Visual Baku](#2-standar-warna--palet-visual-baku)
3. [Standar Tipografi, Ikon & Larangan Visual](#3-standar-tipografi-ikon--larangan-visual)
4. [Standar Shell Aplikasi, Header & Navigasi](#4-standar-shell-aplikasi-header--navigasi)
5. [Standar Komponen Status, Badge & Pill](#5-standar-komponen-status-badge--pill)
6. [Standar Penyajian Informasi & Hierarki Data (3-Baris Baku)](#6-standar-penyajian-informasi--hierarki-data-3-baris-baku)
7. [Aturan Bisnis & Penegakan Sistem Lintas Halaman (*Engine Rules*)](#7-aturan-bisnis--penegakan-sistem-lintas-halaman-engine-rules)
8. [Standar Pola Interaksi Formulir & Validasi](#8-standar-pola-interaksi-formulir--validasi)
9. [Registri Keputusan Desain Tiap Halaman (Halaman 01 s.d. 07)](#9-registri-keputusan-desain-tiap-halaman)
10. [Checklist Wajib Sebelum Memulai Halaman Baru](#10-checklist-wajib-sebelum-memulai-halaman-baru)

---

## 1. PRINSIP INTI & FILOSOFI DESAIN LINTAS HALAMAN

1. **Akuntabilitas yang Membina, Bukan Menghakimi:**
   - Antarmuka dirancang untuk menumbuhkan kejujuran dan transparansi risiko sejak pagi, bukan menciptakan suasana kecemasan kerja atau pengawasan yang menekan.
   - Nada komunikasi selalu suportif, objektif, dan profesional.
2. **Kejelasan Maksimal (*Clarity over Cleverness*):**
   - Setiap elemen antarmuka (tombol, badge, teks bantuan) harus memiliki fungsi operasional yang nyata. Hindari ornamen dekoratif yang membingungkan alur kerja.
3. **Bahasa Manusiawi (*Zero Developer Jargon*):**
   - Dilarang keras menampilkan istilah mentah pemrograman seperti *null, string, payload, heuristic, endpoint, boolean, array, exception*.
   - Gunakan peristilahan perkantoran yang lugas: *Karyawan, Komitmen Kerja, Target Capaian Hasil, Kendala / Blocker, Tautan Referensi, Rekap Evaluasi Sore*.
4. **Tanpa Pengulangan Informasi (*Zero Redundancy*):**
   - Jika suatu informasi (misalnya tanggal evaluasi atau jumlah hari) sudah tercantum di baris metadata, informasi tersebut dilarang diulang kembali di dalam badge status atau judul kartu.
5. **100% Mirip Hasil Jadi Nyata (*Pure Production-Authentic UI*):**
   - Setiap halaman wajib disajikan 100% identik dengan hasil produksi nyata di mata pengguna akhir.
   - **Dilarang keras menyematkan unsur prototipe:** bilah pilih peran uji coba (*quick demo role pills*), tombol jalan pintas pengujian (*test shortcuts*), watermark *"Prototype / Draft"*, atau data testing buatan. Pengujian multi-peran dan multi-state dilakukan secara organik melalui kredensial riil atau state di balik layar (*backend / localStorage*).

---

## 2. STANDAR WARNA & PALET VISUAL BAKU

### 2.1 Palet Utama (Brand & Neutral)
- **Brand Green (Primary):**
  - Utama: `#0F5338` (Deep Forest Green)
  - Hover / Darker: `#0B3F2A`
  - Subtle Tint: `#E8F5E9` (latar aksen lembut)
  - Border Aksen: `#A7D5B8`
- **Background Utama Aplikasi:** `#F7F9FB` (Slate Canvas)
- **Surface / Card Background:** `#FFFFFF` murni dengan border `#E4E7EC` dan sudut lengkung baku `border-radius: 8px` / `10px`.
- **Tipografi Netral:**
  - Teks Utama / Judul: `#101828` / `#1D2939` (Slate 900)
  - Teks Sekunder / Label: `#475467` (Slate 600)
  - Teks Muted / Subteks: `#667085` / `#98A2B3`

### 2.2 Palet Semantik Status & Risiko
- **Status GREEN (Terkendali / Tuntas / Sukses):**
  - Background: `#E8F5E9` | Border: `#A7D5B8` | Teks: `#0F5338`
- **Status AMBER (Perhatian / Masa Toleransi / Berlanjut):**
  - Background: `#FEF3C7` | Border: `#FDE68A` / `#E8C77A` | Teks: `#92400E` / `#B45309`
- **Status RED (Kritis / Terlambat / Kendala Berat):**
  - Background: `#FFF8F8` (Soft Rose ramah mata) | Border: `#FECDCA` | Teks: `#DC2626` / `#991B1B`
- **Status Timing Biru WorkPulse (On-Time / Continue):**
  - Background: `#EFF8FF` | Border: `#B2DDFF` | Teks: `#175CD3`
- **Status Netral / Batal / Tanpa Laporan:**
  - Background: `#F1F5F9` | Border: `#E2E8F0` | Teks: `#475569`

---

## 3. STANDAR TIPOGRAFI, IKON & LARANGAN VISUAL

### 3.1 Aturan Ketat Ikon & Emoticon
- **NOL EMOTICON / EMOJI:** Dilarang keras menggunakan karakter emoji Unicode (seperti 🚀, ⚡, 💡, 📝, ⚠️, ❌, 🔴, 🟡, 🟢).
- **Inline SVG Monokrom:** Seluruh ikon wajib berupa SVG murni bergaya *line-stroke* (`stroke="currentColor"`, `stroke-width="1.8-2.2"`, `fill="none"`). Ukuran: `14px-16px` (tombol/label); `18px-20px` (header/sidebar).
- **Bebas Ikon Petir:** Tombol dan aksi operasional (seperti pelaporan atau pemilihan tiket kendala) menggunakan ikon bendera (*flag*) monokrom yang tenang, bukan ikon petir (`⚡`).

### 3.2 Hierarki Tipografi Halaman
- **Judul Utama Halaman (`h1`):** `font-size: 24px - 26px; font-weight: 800; color: #101828;`
- **Subjudul / Deskripsi Pengarah:** `font-size: 13.5px - 14px; color: #475467; line-height: 1.5;`
- **Judul Section / Panel Utama (`h2`):** `font-size: 17px; font-weight: 800; color: #0E211B;`
- **Kicker / Kategori Panel:** `font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;`
- **Subteks / Catatan Metadata:** `font-size: 12px - 12.5px; color: #475467;`

---

## 4. STANDAR SHELL APLIKASI, HEADER & NAVIGASI

### 4.1 Navigasi Sidebar Ruang Kerja Karyawan (*Employee Workspace Navigation*)
Seluruh halaman kerja karyawan (Halaman 02 s.d. 06, 07, 20, 24) menganut struktur menu navigasi sidebar yang 100% konsisten:
- **Grup Workspace:**
  1. **`My Today`** (Ikon jam kerja reguler): Mengarahkan ke alur kerja harian aktif.
  2. **`My Blockers`** (Ikon bendera / flag resmi monokrom `stroke-width="2"`, tanpa simbol petir): Mengarahkan langsung ke `05-Raise-Instant-Blocker.html#my-blockers` dengan indikator badge angka aktif (`2`) untuk meninjau status penanganan tiket kendala yang dilaporkan.
  3. **`My History`** (Ikon kalender agenda): Mengarahkan ke `06-My-History-Weekly-Summary.html` untuk meninjau arsip resmi akuntabilitas dan ringkasan performa mingguan.
  4. **`My Leave`** (Ikon kalender cuti): Mengarahkan ke `20-My Leave Request (Employee).html`.
- **Grup System:**
  - **`Notifications`** (Ikon lonceng + dot indikator): Mengarahkan ke `07-Notification-Center-Browser-Push.html`.
- **Area Dasar (*Sidebar Footer*):**
  - Kartu profil pengguna aktif: Inisial Avatar (BP), Nama Lengkap (Budi Pratama), Peran & Divisi, serta tombol Keluar (*Logout*) berikon SVG pintu keluar.

### 4.2 Daily Workflow Step Bar (Siklus 3 Langkah Harian)
Setiap halaman kerja harian (Halaman 02, 03, dan 04) wajib menampilkan bilah progres interaktif di bagian atas:
```
┌────────────────────────────────────────────────────────────────────────┐
│  [1] Morning Commitment   ──>   [2] Additional Work   ──>   [3] EOD Outcome    │
└────────────────────────────────────────────────────────────────────────┘
```
- Menandai langkah aktif dengan warna hijau brand (`.daily-step.active`).
- Langkah yang telah selesai ditandai dengan ikon centang SVG hijau (`.daily-step.completed`).

### 4.3 Breadcrumb Topbar
- Format baku: `Workspace / [Modul Utama] / [Nama Halaman]`
- Pada tampilan drill-down (seperti Detail Hari pada Halaman 06), breadcrumb bersifat dinamis dan interaktif: `Workspace / My History (dapat diklik kembali) / [Tanggal Hari Pilihan]`.

### 4.4 Tombol Aksi Cepat Header Kanan (*Quick CTA*)
- Pada seluruh halaman kerja harian, sudut kanan atas header secara konsisten menyediakan tombol darurat: **`Lapor Blocker`** berikon bendera resmi yang langsung membuka rute pelaporan `05-Raise-Instant-Blocker.html#report`.

### 4.5 Standar Responsivitas & Navigasi Multi-Device
1. **Desktop Reguler & Ultrawide (> 992px):**  
   Fluid Grid seimbang menggunakan unit relatif modern (`padding: 0 clamp(1.5rem, 4vw, 3.75rem);` dan pada konten: `padding: 2.25rem clamp(1.5rem, 4vw, 3.75rem) 4rem; width: 100%;`). Tepi kiri dan kanan kartu sejajar lurus dengan topbar dan step bar di setiap resolusi layar.
2. **Tablet / Layar Sedang (681px – 992px):**  
   Sidebar beralih menjadi **Off-Canvas Drawer** (`position: fixed; left: -290px; width: 280px; z-index: 500;`). Tombol hamburger muncul di topbar kiri, didampingi backdrop semi-transparan ber-blur. Grid 2 kolom di area konten mulai bertumpuk menjadi 1 kolom.
3. **Smartphone / Mobile ($\le$ 680px):**  
   Padding konten kompak (`16px 12px 48px`). Tombol aksi darurat header membungkus ke baris baru full-width di bawah judul. Formulir input beralih ke tata letak tumpuk 1 kolom vertikal.
4. **Standar Penjajaran Checklist & Checkbox (Anti-Top Floating):**  
   Pada kartu tugas, item draf carry-over, maupun opsi formulir di seluruh perangkat, **kotak centang (*checkbox*) WAJIB SELALU BERADA DI SAMPING KIRI TEKS JUDUL**, sejajar secara vertikal dengan baris pertama judul. Dilarang membuat kotak checklist melompat atau melayang sendirian di baris atas judul saat layar menyempit.

---

## 5. STANDAR KOMPONEN STATUS, BADGE & PILL

### 5.1 Badge Status Kelanjutan Draf Pekerjaan (*Carry-over Draft Badge*)
Pada kartu draf carry-over yang berasal dari hari sebelumnya:
- **Warna Badge:** Selalu menggunakan tema **Amber** (`.pill.amber`).
- **Pilihan Nilai Badge HANYA DUA:**
  1. **`Berlanjut`** $\rightarrow$ jika kemarin aktif masuk dalam komitmen harian dan berlanjut hari ini.
  2. **`Tertunda`** $\rightarrow$ jika kemarin sempat jeda / tidak masuk dalam komitmen hari sebelumnya.
- **Larangan Keras:** Dilarang menyertakan tanggal (misal *"Tertunda sejak 12 Okt"*) atau durasi hari (misal *"Total 3 Hari Kerja"*) di dalam badge. Seluruh rincian tanggal dan akumulasi durasi harus dipindahkan ke baris metadata.

### 5.2 Pill Status Jadwal Pengisian
- **Tepat Waktu:** `.pill.green` $\rightarrow$ `Tersimpan · Tepat Waktu` / `Tepat Waktu`
- **Masa Toleransi (Grace Period):** `.pill.amber` $\rightarrow$ `Masa Toleransi` (09:01 – 09:30 WIB)
- **Terlambat:** `.pill.red` $\rightarrow$ `Terlambat` (> 09:30 WIB)
- **Menunggu Pengisian:** `.pill.amber` $\rightarrow$ `● Menunggu Pengisian`

### 5.3 Standar Dual Badges Lintas Histori (Mandat PRD FR-67 & UI/UX Spec §4.6)
Setiap baris riwayat harian pada daftar histori (Halaman 06) **wajib menyajikan sepasang badge (*Dual Badges*) berdampingan**:
1. **Submission Timing Badge (Kepatuhan Waktu):**
   - **`On-Time`** (`.pill.timing` / biru WorkPulse): Diserahkan tepat waktu sesuai jendela reguler.
   - **`Late`** (`.pill.late` / amber): Diserahkan melewati batas toleransi reguler.
   - **`No Submission`** (`.pill.no-submission` / abu netral): Laporan tidak diserahkan pada hari kerja terkait.
2. **Final Status Badge (Evaluasi Hasil Kerja):**
   - **`Final Status · GREEN`** (`.pill.green` / hijau): Target kerja harian tuntas tanpa kendala.
   - **`Final Status · AMBER`** (`.pill.amber` / amber): Capaian sebagian atau terdapat risiko carry-over.
   - **`Final Status · RED`** (`.pill.red` / merah): Capaian minim atau terhambat blocker kritis.
   - **`Final Status belum tersedia`** (`.pill.neutral` / abu netral): Ditampilkan jika laporan berstatus *No Submission*.

### 5.4 Standar Semantic Badges Outcome & Continuation
Pada kartu rincian evaluasi harian (Halaman 04 dan Halaman 06), status hasil dan kelanjutan tugas wajib menggunakan kelas semantik baku:
- **Hasil Capaian (*Outcome*):**
  - `Outcome · Completed`: `.pill.green` (Hijau)
  - `Outcome · Partially Completed`: `.pill.amber` (Amber)
  - `Outcome · Not Completed`: `.pill.red` (Merah)
  - `Outcome · Cancelled`: `.pill.neutral` (Abu netral)
- **Kelanjutan Tugas (*Continuation*):**
  - `Continuation · Continue`: `.pill.timing` (Biru WorkPulse)
  - `Continuation · Do Not Continue`: `.pill.neutral` (Abu netral)

### 5.5 Standar 3 Jenis Catatan Pimpinan (Manager Notes — PRD FR-39, US-13, AC-43)
Catatan pembinaan dan manajerial dari atasan yang dipublikasikan ke karyawan wajib terikat pada 3 tipe baku berlabel dwibahasa dan ikon pembeda resmi:
1. **`Apresiasi (Recognition)`**: Badge `.pill.green` (hijau), mark background hijau botol, ikon lencana/bintang (`polygon 12-point`). Berfungsi mencatat pengakuan formal atas pencapaian luar biasa.
2. **`Bimbingan (Coaching)`**: Badge `.pill.amber` (amber), mark background amber, ikon kompas/target (`compass circle & polygon`). Berfungsi mencatat arahan konstruktif dan pengembangan cara kerja.
3. **`Tindakan Korektif (Corrective)`**: Badge `.pill.red` (merah), mark background merah rose, ikon perisai/tanda seru penegasan (`alert-circle`). Berfungsi mencatat penegasan disiplin atau evaluasi SOP tanpa menimpa data asli karyawan.

---

## 6. STANDAR PENYAJIAN INFORMASI & HIERARKI DATA (3-BARIS BAKU)

Setiap kartu tugas riwayat, draf pengerjaan, atau rekap log tugas di seluruh halaman WorkPulse wajib mengadopsi struktur 3 baris terpisah berikut:

```
[ ] [Judul Tugas Terukur]                   [Badge Status Kanan]  [Tombol Aksi]
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Chip Terakhir: ...]  [Chip Status: ...]  [Chip Total: ...] (Memanjang Penuh)│
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ CATATAN:                                                                 │ │
│ │ "[Kutipan Evaluasi / Alasan Terakhir]" (Callout Box Memanjang Penuh)     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ⓘ [Peringatan Aturan Sistem - misal: Status awal minimal AMBER]              │
└──────────────────────────────────────────────────────────────────────────────┘
```

1. **Baris 1 — Header Kartu:** Kotak checklist (`[ ]`) dan Judul Tugas Terukur (`font-weight: 700;`) di kiri; Status Amber (`Tertunda`/`Berlanjut`) dan Tombol Aksi (`Hentikan Pekerjaan`) di kanan.
2. **Baris 2 — Metadata Terstruktur (Mini-Tag / Chip Kapsul):** Mini-tag abu-abu (`background: #F1F5F9; border: 1px solid #E2E8F0; padding: 2.5px 7px;`) membentang selebar kartu.
3. **Baris 3 — Konteks Evaluasi Karyawan (Callout Box Lembut):** Teks catatan dibungkus dalam kotak lembut bersudut tumpul (`#F8FAFC`, border `#E2E8F0`), label kapital **`CATATAN:`** di atas, dan kutipan miring di bawahnya.
4. **Baris 4 — Penegakan Aturan Sistem (Jika Ada):** Ikon info monokrom `ⓘ` dengan teks amber tua `#B45309`.

---

## 7. ATURAN BISNIS & PENEGAKAN SISTEM LINTAS HALAMAN (*ENGINE RULES*)

### 7.1 Aturan Penguncian Risiko Minimal AMBER (*Amber Lock Engine*)
- Berlaku pada: Halaman 02 (Morning), Halaman 03 (Additional), Halaman 04 (EOD), dan Halaman 06 (Weekly).
- Jika riwayat `active_days_count >= 2` hari kerja:
  1. Radio/opsi pilihan **GREEN otomatis dinonaktifkan (*disabled*)**.
  2. Pilihan terkunci minimal pada status **AMBER** (atau RED jika ada kendala fatal).
  3. Baris peringatan aturan sistem muncul di UI.
  4. Kolom penjelasan faktor kendala/risiko menjadi **wajib diisi**.

### 7.2 Aturan Batas Waktu & Jam Kerja (*Time-Window Engine*)
- **08:00 – 09:00 WIB:** Jendela Tepat Waktu (*On-Time Window*).
- **09:01 – 09:30 WIB:** Masa Toleransi Resmi (*Grace Period*). Karyawan tetap dapat mengirim komitmen tanpa penalti *No Submission*, namun tercatat berstatus toleransi secara transparan.
- **> 09:30 WIB:** Jendela Keterlambatan (*Late Window*). Form mewajibkan pengisian alasan keterlambatan.
- **Integritas Waktu:** Status on-time/terlambat dihitung berdasarkan **timestamp server saat penyerahan (*submit*)**, bukan jam browser klien.

### 7.3 Kuota Slot Komitmen Harian
- Standar harian: **Minimal 1, Maksimal 3 Komitmen Utama**.
- Jika batas 3 slot tercapai, tombol penambahan slot dinonaktifkan.
- Jika hanya tersisa 1 slot, tombol hapus dinonaktifkan.

### 7.4 Opsi Tanpa Komitmen (*Zero Commitment Mode*)
- Jika karyawan mencentang tidak ada komitmen harian (karena training penuh hari, dinas luar, atau townhall):
  - Slot komitmen di bawahnya otomatis meredup dan nonaktif.
  - Dropdown alasan resmi wajib dipilih.
  - Status risiko harian menjadi **Netral**, terbebas dari penalti pengisian.

### 7.5 Status Baseline Terkunci & Jalur Koreksi Formal
- Setelah formulir pagi dikirim dan dikonfirmasi, seluruh form berubah menjadi *read-only* permanen. **Tidak ada fitur edit langsung di tempat (*no in-place edit*)**.
- Koreksi wajib diajukan melalui modul resmi **`16a-Morning-Correction-Request.html`** (pagi) atau **`16b-EOD-Correction-Request.html`** (sore).

### 7.6 Standar Sesi Pengguna & Rute Berbasis Peran
- Objek sesi aktif disimpan di `localStorage` dengan kunci baku: **`workpulse_active_user`**.
- Rute Pendaratan Otomatis:
  - `EMPLOYEE` $\rightarrow$ `02-Morning-Commitment.html`
  - `SUPERVISOR` / `HEAD_OF_DEPARTMENT` $\rightarrow$ `08-Pulse-Dashboard.html`
  - `HRGA` $\rightarrow$ `11-Compliance-Queue-HRGA.html`
  - Akun Pengecualian / CEO (`isExempt: true`) $\rightarrow$ `02-Morning-Commitment.html` dengan *Exemption Banner* aktif.

### 7.7 Standar Pemulihan Sesi di Tempat (*In-Place Session Recovery - UF-03*)
- Jika sesi token habis saat pengguna sedang mengetik formulir, sistem **dilarang me-redirect paksa ke layar login kosong**.
- Sistem wajib memunculkan **Modal Re-autentikasi di Tempat** (`#modal-session-timeout`) untuk verifikasi kata sandi kembali tanpa merusak draf yang belum terkirim.

### 7.8 Mandat Anti-Gamifikasi (PRD FR-66, AC-44, AC-75)
- Sistem WorkPulse **DILARANG KERAS** menyematkan mekanisme gamifikasi kompetitif: *streak counter* kompetitif, peringkat (*leaderboard*), perbandingan rekan kerja (*peer comparison*), atau lencana produktivitas semu.
- Seluruh ringkasan metrik difokuskan murni pada keandalan kerja (*reliability*), kedisiplinan waktu, dan refleksi pencapaian pribadi yang sehat.

### 7.9 Integritas Arsip Resmi Baca-Saja (*Official Read-Only Archive*)
- Seluruh data historis yang tersimpan (Halaman 06) bersifat **arsip resmi baca-saja (*read-only*)**.
- Jika terdapat permohonan koreksi yang disetujui, riwayat permohonan koreksi ditampilkan berdampingan secara transparan di bawah data asli tanpa menimpa catatan awal, menjaga audit trail tetap tak terbantahkan (*tamper-evident*).

### 7.10 Standar Ekspor Berkas CSV Resmi (AC-06 & DEF-05)
- Menggunakan standar RFC-4180 dengan **UTF-8 Byte Order Mark (`\ufeff`)** untuk kompatibilitas penuh Microsoft Excel dan Google Sheets tanpa distorsi aksen.

---

## 8. STANDAR POLA INTERAKSI FORMULIR & VALIDASI

### 8.1 Dropdown Pemilihan Blocker Tim (*Quick Blocker Picker*)
- Tombol pemantik ringkas: `Pilih Blocker Aktif` + panah dropdown (*chevron down*), tanpa ikon petir.
- Jika tiket dipilih, tanda bintang merah wajib (`*`) pada field penjelasan risiko berubah menjadi `(Opsional — tiket blocker telah dipilih)`.

### 8.2 Petunjuk Kontekstual Berbasis Peran (*Role-Based Prompt Hint*)
- Teks contoh miring (*italic*) di bawah textarea deliverable yang otomatis berganti mengikuti fungsi divisi akun karyawan (Engineering, Finance, HRGA, Sales, Ops).

### 8.3 Peringatan Kualitas Komitmen (*Soft Quality Warning*)
- Teks $< 10$ karakter atau kata umum memicu badge kuning edukatif yang bersifat **non-blocking** (tidak mengunci tombol submit).

### 8.4 Simpan Draf Lokal Otomatis
- Tombol `Simpan Draf` menyimpan seluruh state formulir ke `localStorage` untuk mencegah kehilangan data akibat kendala teknis atau peramban tertutup.

### 8.5 Standar Kontrol Kata Sandi & Indikator Kekuatan
- Dilengkapi tombol intip kata sandi (*eye / eye-off SVG*).
- Form penetapan sandi baru wajib menyajikan **Password Strength Bar** 4 segmen visual (Sangat Lemah, Cukup, Kuat, Sangat Aman) dengan kriteria minimal $\ge 8$ karakter kombinasi huruf besar, kecil, angka.

### 8.6 Standar Notifikasi Toast Kontekstual (*Contextual Toast Engine*)
- `success`: Ikon centang hijau emerald (`#34D399`) pada latar hijau botol tua (`#113426`).
- `warning`: Ikon segitiga peringatan amber (`#FBBF24`) pada latar cokelat gelap (`#2D1B08`).
- `error`: Ikon lingkaran seru merah rose (`#F87171`) pada latar merah marun (`#3B1212`).

---

## 9. REGISTRI KEPUTUSAN DESAIN TIAP HALAMAN

### Halaman 01: Login & Aktivasi Akun
- **Berkas Prototipe:** [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-01-Login-Activation.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-01-Login-Activation.md)
- **Keputusan Terkunci:**
  1. Strict 1-Screen Viewport 100vh desktop split-screen 45% brand storytelling : 55% interaktif form.
  2. Multi-screen state controller 7 sub-layar dalam satu DOM bersih.
  3. Role-based session engine menyimpan `workpulse_active_user` ke `localStorage`.
  4. Lockout anti brute-force 60 detik pasca 5x kegagalan berturut-turut.
  5. In-place session recovery dialog modal (UF-03).
  6. Bebas ikon petir pada pilar nilai korporat; menggunakan ikon bendera monokrom.
  7. Label tombol utama inklusif: **`Masuk ke Ruang Kerja`**.
  8. Mobile Brand Header selebar kartu login muncul otomatis saat layar $\le 900\text{px}$.

### Halaman 02: My Today — Morning Commitment
- **Berkas Prototipe:** [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-02-Morning-Commitment.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-02-Morning-Commitment.md)
- **Keputusan Terkunci:**
  1. Header bersih tanpa teks eyebrow redundan di atas judul `h1`.
  2. Penyatuan Status Risiko Hari Ini langsung ke dalam **Panel 1 Kolom ke-4** pada grid 4-kolom terpadu (mengeliminasi kotak preview bertumpuk).
  3. Panel Draf Carry-Over Akordeon **Default Tertutup** (~50px), menyajikan kartu asli lengkap saat dibuka.
  4. Penyematan Fokus Prioritas Kemarin Sore (*Embedded Context Hint Banner*) satu baris ramping persis di atas Slot Komitmen 1.
  5. Penegakan Amber Lock Engine: tugas $\ge 2$ hari kerja mengunci minimal AMBER.
  6. Standarisasi badge draf pool murni `Tertunda` atau `Berlanjut` (pill amber).
  7. Menghapus simbol petir dari tombol dropdown `Pilih Blocker Aktif ▾`.

### Halaman 03: My Today — Additional Work
- **Berkas Prototipe:** [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-03-Additional-Work.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-03-Additional-Work.md)
- **Keputusan Terkunci:**
  1. Bersifat independen dari Morning Commitment (FR-07 & BR-01), tidak mengubah baseline pagi.
  2. Taksonomi 5 alasan resmi baku PRD FR-06 (`Newly Assigned`, `Missed in Planning`, `Priority Change`, `Operational-Incident`, `Other`).
  3. Panel kondisional 'Assigned By' beraksen border hijau wajib muncul saat alasan `Newly Assigned`.
  4. Panel Konteks Harian Grid 4-Kolom Terpadu dengan catatan kaki tata kelola ramping di dasar.
  5. Panel Komitmen Pagi Terkunci Collapsible by Default (~50px) dengan pesan netral suportif jika terlewat.
  6. Empty state horizontal mini-strip ramping (~50px) saat belum ada item.
  7. Mode sunting di tempat (*in-place edit*) dengan tombol Edit dan Hapus yang ergonomis.
  8. Standarisasi istilah **`EOD Outcome`** di seluruh alur transisi.

### Halaman 04: My Today — EOD Outcome
- **Berkas Prototipe:** [`04-EOD-Outcome.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/04-EOD-Outcome.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-04-EOD-Outcome.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-04-EOD-Outcome.md)
- **Keputusan Terkunci:**
  1. Pemisahan ketat antara *Outcome* (Completed, Partially, Not Completed, Cancelled) dan *Continuation* (Continue, Do Not Continue).
  2. Kewajiban mengisi alasan kelanjutan jika memilih `Continue` (FR-09).
  3. Penyaluran otomatis seluruh tugas `Continue` ke koleksi draf pagi esok hari (FR-11).
  4. Deterministic Heuristic Suggestion Engine 6-cabang (FR-13 & AC-38).
  5. Protokol Anti-Silent Mutation melalui `ValidationPromptModal` (FR-14 & AC-39).
  6. Validasi kualitas penjelasan risiko harian $\ge 15$ karakter dengan live counter interaktif.
  7. Keterhubungan Tomorrow Priority ke Halaman 02 esok harinya (FR-52).
  8. Zero duplicate deliverable pada kartu komitmen pagi dan tugas tambahan.
  9. Standarisasi Contextual Toast Engine (sukses hijau, warning amber segitiga, error merah).

### Halaman 05: Raise Instant Blocker & My Blockers
- **Berkas Prototipe:** [`05-Raise-Instant-Blocker.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/05-Raise-Instant-Blocker.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-05-Raise-Instant-Blocker.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-05-Raise-Instant-Blocker.md)
- **Keputusan Terkunci:**
  1. Aksesibilitas 24/7 di luar siklus harian dan saat baseline terkunci (FR-15 & BR-04).
  2. Arsitektur Dual-Subpage Hash Router DOM: `#report` (form lapor baru) $\leftrightarrow$ `#my-blockers` (daftar arsip tiket saya).
  3. Menu sidebar resmi *My Blockers* berikon bendera monokrom dengan badge aktif `2`.
  4. Taksonomi 10 enum tipe kendala dan 7 kategori dampak utama baku PRD FR-16.
  5. Segmented Radio Cards untuk 4 tingkat keparahan (Critical, High, Medium, Low).
  6. Jalur kewenangan deterministik: Organizational Authority (Level 1) vs Project Authority (Project Lead).
  7. Live Route Preview Box menampilkan rute penugasan dan catatan SLA sebelum submit.
  8. Kartu Tiket Blocker Resmi berlatar hijau tua (#BLK-2026-XXXX) dengan timer hitung mundur SLA pengakuan.
  9. Validasi kualitas: deskripsi masalah minimal 15 karakter dengan live counter hijau.
  10. Filter status interaktif (`Semua`, `Open / Dalam Penanganan`, `Resolved`) dan modal detail tiket (`#modal-blocker-detail`).

### Halaman 06: My History & Weekly Summary
- **Berkas Prototipe:** [`06-My-History-Weekly-Summary.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/06-My-History-Weekly-Summary.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-06-My-History-Weekly-Summary.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-06-My-History-Weekly-Summary.md)
- **Keputusan Terkunci:**
  1. Hak akses audit personal penuh (*self-service*) dan kepatuhan mutlak pada mandat Anti-Gamifikasi (FR-66, AC-44, AC-75).
  2. Toolbar filter terpadu: preset periode dan filter kehadiran/submission.
  3. Weekly Summary Grid 7-Metrik seimbang: 6 kartu dalam 2 baris 3 kolom + Kartu 7 (*Catatan Pimpinan*) membentang selebar baris penuh (*full-width `grid-column: 1 / -1`*).
  4. Standar 3 tipe Catatan Pimpinan terpublikasi: *Apresiasi (Recognition)* (hijau/bintang), *Bimbingan (Coaching)* (amber/kompas), dan *Tindakan Korektif (Corrective)* (merah/seru).
  5. Mandat Dual Badges berdampingan pada daftar riwayat harian: *Submission Timing Badge* (`On-Time`, `Late`, `No Submission`) berdampingan dengan *Final Status Badge* (`GREEN`, `AMBER`, `RED`, `Final Status belum tersedia`).
  6. Arsitektur Dual-View State: Overview Mingguan $\leftrightarrow$ Day Detail View tanpa reload halaman.
  7. Semantic Badges Outcome (`Completed` hijau, `Partially` amber, `Not Completed` merah) dan Continuation (`Continue` biru, `Do Not Continue` netral).
  8. Banner audit khusus hari tanpa submission (*No Submission Audit Notice*).
  9. Breadcrumb topbar dinamis interaktif dan tombol kembali ganda di atas & bawah halaman detail.
  10. Ekspor CSV resmi berstandar RFC-4180 dengan UTF-8 Byte Order Mark (`\ufeff`).

### Halaman 07: Web Notification Center & Browser Push
- **Berkas Prototipe:** [`07-Notification-Center-Browser-Push.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/07-Notification-Center-Browser-Push.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-07-Notification-Center-Browser-Push.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-07-Notification-Center-Browser-Push.md)
- **Keputusan Terkunci:**
  1. **Mandat Pengiriman Nyata MVP (PRD FR-38 & PDD §2.2):** Sistem mendukung pengiriman Web Notification Browser Push riil pada MVP untuk pemicu batas waktu (Morning/EOD cutoff) dan kendala kritis (Critical Blocker).
  2. **Pemisahan Status Read vs Delivery (UI/UX Spec §4.7):** Status "Sudah Dibaca" di Notification Center murni penandaan in-app, bukan bukti bahwa notifikasi Email atau Browser Push telah sampai pada perangkat penerima.
  3. **Engine Kontrol Izin Browser Push 4-State:** Mengevaluasi ketersediaan dan izin `window.Notification` peramban: `Unsupported` (badge amber disabled), `Default / Prompt` (badge netral, tombol aktivasi eksplisit), `Granted` (badge hijau izin aktif), dan `Denied` (badge merah dengan panduan membuka kunci situs).
  4. **Prinsip Non-Intrusif & Non-Blocking:** Permintaan izin browser push hanya dipicu oleh klik sadar pengguna (*click-to-prompt*). Penolakan izin peramban dilarang menghambat operasional alur kerja lainnya.
  5. **Panel Matriks Saluran Distribusi (PRD §8):** Menyajikan status 3 saluran (*Web Notification Center*, *Email Korporat*, *Browser Push*) dengan maklumat tata kelola resmi.
  6. **Feed Interaktif Multi-Filter & Live Search:** Mendukung filter tab status (`Semua`, `Belum Dibaca`, `Sudah Dibaca`), dropdown filter kategori, dan pencarian teks instan pada judul/deskripsi/ID tiket.
  7. **Penandaan Massal Tunggal & Safety Undo:** Tombol *Tandai semua dibaca* terpusat pada Page Heading dengan proteksi tombol *Urungkan (Undo)* berdurasi 5 detik pada toast, didampingi tombol toggle status baca per baris.
  8. **Modal Detail & Context Deep-Link Resolver:** Dialog pop-up rincian notifikasi dengan tombol *Buka Konteks Terkait* yang mengarahkan pengguna secara akurat ke halaman sumber dokumen (Halaman 02, 03, 04, 05, 06, 16a/b, 20, 24).
  9. **Sinkronisasi Sesi Dinamis & Contextual Toast Engine:** Membaca profil aktif Budi Pratama dari `localStorage: workpulse_active_user` dan menyajikan feedback notifikasi 3 varian semantik (`success`, `warning`, `error`).
  10. **Arsitektur Tab Tampilan Utama (*Primary Tab Architecture*):** Memposisikan *Daftar Notifikasi* (Tab 1) langsung di bawah 3 kartu ringkasan metrik sebagai tampilan utama harian tanpa scrolling, sedangkan *Preferensi Perangkat* dan *Matriks Distribusi Kanal PRD §8* diisolasi rapi ke Tab 2 (*Pengaturan Kanal & Perangkat*). Ketiga kartu metrik bersifat interaktif (*click-to-filter* dan *click-to-tab*).
  11. **Standar Badge Notifikasi Lintas Sidebar (Halaman 02–07, 20, 24):** Menu sidebar resmi *Notifications* menyematkan pill amber aktif (`3`) yang sejajar dan konsisten dengan badge pada *My Blockers* (`2`), dan tersinkronisasi dinamis pada Halaman 07 saat notifikasi dibaca atau dipulihkan.
  12. **Desain Responsif Ultra-Compact 1-Row Mini Bar & Tab Navigasi Bebas Wrap:** 3 kartu ringkasan metrik dikunci tetap sejajar dalam 1 baris (3 kolom, $\approx 48\text{ px}$) pada layar smartphone dan tablet (menghemat 80% tinggi layar HP dibanding stacking vertikal). Tombol tab navigasi utama (*Daftar Notifikasi* & *Pengaturan Kanal & Perangkat*) otomatis menyesuaikan ukuran font ($9.5\text{ px} - 11\text{ px}$) dan padding secara proporsional sehingga muat presisi dalam 1 baris tanpa memakan 2 baris bahkan di layar smartphone kecil seperti iPhone SE ($375\text{ px}$).
  13. **Sistem Anti-Celah Matriks 22 Pemicu Komprehensif (PRD §8 Updated):** Menutup seluruh siklus hidup Blocker 2-arah (*Acknowledged*, *Resolved*, *Rejected*), kolaborasi tim (*Support Accepted*, *Support Declined*), penugasan tugas darurat siang hari (*Additional Work*), catatan pimpinan harian (*Manager Daily Note on EOD*), dan keamanan akun (*New Device Login*).
  14. **Tautan Otomatis Baca Email (*Smart Auto-Read Link: `?read=ID`*):** Tautan dari notifikasi email kantor secara otomatis menandai notifikasi terkait menjadi 'Sudah Dibaca' di Web Notification Center untuk mencegah kerja dua kali (*zero double work*).

---

## 10. CHECKLIST WAJIB SEBELUM MEMULAI HALAMAN BARU

Sebelum merancang atau mengimplementasikan halaman baru, lakukan pemeriksaan mandiri (*self-check*):

- [ ] **1. Apakah 100% Mirip Hasil Jadi & Bebas Unsur Prototipe?** Bersih dari role selector bar, tombol jalan pintas demo, watermark dummy, atau teks testing.
- [ ] **2. Apakah Bebas Emoji?** Murni menggunakan inline SVG monokrom `stroke-width="1.8-2.2"`.
- [ ] **3. Apakah Warna Merah Lembut?** Menggunakan latar `#FFF8F8`, border `#FECDCA`, teks `#991B1B` / `#DC2626`.
- [ ] **4. Apakah Header Bersih?** Tanpa teks eyebrow berulang yang redundan dengan breadcrumb atau step bar.
- [ ] **5. Apakah Format Metadata 3-Baris Dipatuhi?** Memisahkan baris header tugas, chip metadata kapsul, dan callout box catatan.
- [ ] **6. Apakah Badge Singkat & Padat?** Tidak memasukkan tanggal atau durasi hari ke dalam teks badge.
- [ ] **7. Apakah Amber Lock Engine Ditegakkan?** Tugas $\ge 2$ hari terkunci minimal AMBER.
- [ ] **8. Apakah Bebas Jargon Developer?** Menggunakan bahasa perkantoran yang mudah dimengerti seluruh divisi.
- [ ] **9. Apakah Bebas Ikon Petir?** Seluruh tombol dan modul kendala menggunakan ikon bendera (*flag*) monokrom.
- [ ] **10. Apakah Terkoneksi dengan Sesi & Halaman Lain?** Membaca `workpulse_active_user` dan menyelaraskan kontrak rute antar-halaman.

---
*Dokumen ini diperbarui secara berkala dan wajib dijaga kelengkapannya.*
