# PEDOMAN KONSISTENSI DESAIN, PERILAKU & ATURAN LINTAS HALAMAN
## WORKPULSE — SISTEM AKUNTABILITAS HARIAN & MANAJEMEN RISIKO KERJA
**PT Duta Media Solusindo**

---

> [!IMPORTANT]
> **DOKUMEN INI ADALAH SINGLE SOURCE OF TRUTH (SSOT) KONSISTENSI LINTAS HALAMAN.**  
> Dokumen ini **WAJIB DIBACA DAN DICERMATI TERLEBIH DAHULU** setiap kali hendak memulai perancangan atau pengerjaan halaman baru di WorkPulse.  
> Setiap keputusan desain baru, komponen baku, atau aturan perilaku (*behavior*) yang diputuskan pada halaman berikutnya **harus langsung dicatatkan ke dalam dokumen ini** agar seluruh halaman dan dokumen perancangan saling terhubung dengan rapi, harmonis, dan tidak bertolak belakang.

---

## DAFTAR ISI
1. [Prinsip Inti & Filosofi Desain Lintas Halaman](#1-prinsip-inti--filosofi-desain-lintas-halaman)
2. [Standar Warna & Palet Visual Baku](#2-standar-warna--palet-visual-baku)
3. [Standar Tipografi, Ikon & Larangan Visual](#3-standar-tipografi-ikon--larangan-visual)
4. [Standar Shell Aplikasi, Header & Navigasi](#4-standar-shell-aplikasi-header--navigasi)
5. [Standar Komponen Status, Badge & Pill](#5-standar-komponen-status-badge--pill)
6. [Standar Penyajian Informasi & Hirarki Data (3-Baris Baku)](#6-standar-penyajian-informasi--hirarki-data-3-baris-baku)
7. [Aturan Bisnis & Penegakan Sistem Lintas Halaman (*Engine Rules*)](#7-aturan-bisnis--penegakan-sistem-lintas-halaman-engine-rules)
8. [Standar Pola Interaksi Formulir & Validasi](#8-standar-pola-interaksi-formulir--validasi)
9. [Registri Keputusan Desain Tiap Halaman](#9-registri-keputusan-desain-tiap-halaman)
   - [Halaman 01: Login & Aktivasi Akun](#halaman-01-login--aktivasi-akun)
   - [Halaman 02: My Today — Morning Commitment](#halaman-02-my-today--morning-commitment)
   - [Halaman 03: My Today — Additional Work (Siap Diisi)](#halaman-03-my-today--additional-work)
   - [Halaman 04: My Today — EOD Outcome (Siap Diisi)](#halaman-04-my-today--eod-outcome)
   - [Halaman 05 s.d. 24: (Area Registri Bertahap)](#halaman-berikutnya-registri-bertahap)
10. [Checklist Wajib Sebelum Memulai Halaman Baru](#10-checklist-wajib-sebelum-memulai-halaman-baru)

---

## 1. PRINSIP INTI & FILOSOFI DESAIN LINTAS HALAMAN

1. **Akuntabilitas yang Membina, Bukan Menghakimi:**
   - Antarmuka dirancang untuk mendorong kejujuran dan transparansi risiko sejak pagi, bukan membuat karyawan merasa diawasi seperti pesakitan.
   - Nada komunikasi selalu suportif, objektif, dan profesional.
2. **Kejelasan Maksimal (*Clarity over Cleverness*):**
   - Hindari elemen dekoratif yang tidak memiliki fungsi operasional. Setiap tombol, badge, dan teks harus memiliki tujuan kerja yang jelas.
3. **Bahasa Manusiawi (*Zero Developer Jargon*):**
   - Dilarang keras memunculkan istilah pengembang seperti *null, string, payload, heuristic engine, endpoint, exception, trigger, boolean, array*.
   - Gunakan terminologi perkantoran yang manusiawi: *Karyawan, Komitmen Kerja, Hasil Kerja Terukur (Deliverable), Kendala / Blocker, Tautan Referensi, Rekap Evaluasi Sore*.
4. **Tidak Mengulang Informasi yang Sama (*Zero Redundancy*):**
   - Jika suatu informasi (misal tanggal evaluasi atau total hari kerja) sudah tertata di subteks metadata, informasi tersebut **dilarang diulang kembali** di dalam badge atau judul kartu.
5. **100% Mirip Hasil Jadi Nyata & Nol Unsur Prototipe (*Pure Production-Authentic UI*):**
   - Setiap halaman wajib dirancang dan disajikan 100% identik dengan hasil jadi (*production-ready*) aplikasi enterprise sesungguhnya di mata pengguna akhir.
   - **DILARANG KERAS** menyematkan unsur atau *gimmick* prototipe apa pun ke dalam antarmuka, seperti: bilah pilih akun demo (*quick demo role pills/bars*), tombol pintas pengujian (*test shortcuts*), watermark *"Prototype / Draft"*, atau teks penguji buatan.
   - Pengujian skenario multi-peran, kondisi waktu, atau variasi *state* sistem wajib dilakukan secara organik melalui kredensial akun riil (misal login menggunakan email karyawan yang bersangkutan), parameter URL bawaan (*query params*), atau *state* di balik layar (*backend / localStorage*), tanpa pernah menodai atau mengorbankan otentisitas kanvas antarmuka kerja pengguna.

---

## 2. STANDAR WARNA & PALET VISUAL BAKU

Seluruh halaman wajib mematuhi sistem warna terkurasi berikut:

### 2.1 Palet Utama (Brand & Neutral)
- **Brand Green (Primary):**
  - Utama: `#0F5338` (Deep Forest Green)
  - Hover / Darker: `#0B3F2A`
  - Subtle Tint: `#E8F5E9` (latar aksen lembut)
- **Background Utama Aplikasi:** `#F7F9FB` (Slate Canvas)
- **Surface / Card Background:** `#FFFFFF` murni dengan border `#E4E7EC` dan sudut lengkung baku `border-radius: 8px` / `10px`.
- **Tipografi Netral:**
  - Teks Utama / Judul: `#101828` / `#1D2939` (Slate 900)
  - Teks Sekunder / Label: `#475467` (Slate 600)
  - Teks Muted / Subteks: `#667085` / `#98A2B3`


---

## 3. STANDAR TIPOGRAFI, IKON & LARANGAN VISUAL

### 3.1 Aturan Ketat Ikon & Emoticon
- **NOL EMOTICON / EMOJI:** Dilarang keras menggunakan emoji bawaan Unicode sistem operasi (seperti 🚀, ⚡, 💡, 📝, ⚠️, ❌, 🔴, 🟡, 🟢).
- **Semua Ikon Adalah Inline SVG Monokrom:**
  - Ikon wajib berupa SVG murni dengan gaya *line-stroke* (`stroke="currentColor"`, `stroke-width="1.8 - 2.2"`, `fill="none"`).
  - Ukuran standar: `14px - 16px` untuk tombol/label; `18px - 20px` untuk header/sidebar.
- **Bebas Simbol Petir / Dekorasi Game:** Tombol dan aksi operasional (misal pemilihan tiket blocker) tidak boleh menggunakan ikon petir (`⚡`), melainkan murni teks profesional dan panah navigasi (*chevron*).

### 3.2 Hierarki Tipografi Halaman
- **Judul Utama Halaman (`h1`):** `font-size: 24px - 26px; font-weight: 800; color: #101828;`
- **Subjudul / Deskripsi Pengarah:** `font-size: 13.5px - 14px; color: #475467; line-height: 1.5;`
- **Judul Section / Panel Utama (`h2`):** `font-size: 15px; font-weight: 700; color: #101828;`
- **Judul Memo / Catatan Konteks Tambahan:** `font-size: 14.5px; font-weight: 700; color: #78350F;` (Harus sedikit di bawah atau seimbang dengan panel aksi utama agar tidak mendominasi).
- **Kicker / Section Category:** `font-size: 11px; font-weight: 750; text-transform: uppercase; letter-spacing: 0.5px;`
- **Subteks / Catatan Metadata:** `font-size: 12px - 12.5px; color: #475467;`

---

## 4. STANDAR SHELL APLIKASI, HEADER & NAVIGASI

### 4.1 Navigasi Sidebar Tunggal (*Single Parent Sidebar*)
- Seluruh alur kerja harian karyawan dikelompokkan dalam menu tunggal: **`My Today`** (ikon jam kerja reguler).
- Sub-tahapan harian tidak boleh dipecah menjadi tautan sidebar terpisah, melainkan dikendalikan melalui **Daily Workflow Step Bar**.
- Di bagian bawah sidebar wajib tersedia kartu profil pengguna aktif: Inisial Avatar, Nama Lengkap, Peran & Divisi, serta tombol Keluar (*Logout*).

### 4.2 Daily Workflow Step Bar (Siklus 3 Langkah Harian)
Setiap halaman kerja harian (Halaman 02, 03, dan 04) wajib menampilkan bilah progres interaktif di bagian atas:
```
┌────────────────────────────────────────────────────────────────────────┐
│  [1] Morning Commitment   ──>   [2] Additional Work   ──>   [3] EOD Outcome    │
└────────────────────────────────────────────────────────────────────────┘
```
- Menandai langkah aktif dengan warna hijau brand (`.daily-step.active`).
- Langkah yang belum aktif atau sudah lewat tetap dapat diklik untuk navigasi cepat sesuai hak akses dan status hari kerja.

### 4.3 Breadcrumb Topbar
- Format baku: `Workspace / [Modul Utama] / [Nama Halaman]`
- Contoh: `My Today / Morning Commitment`, `My Today / Additional Work`, `My Today / EOD Outcome`.

### 4.4 Tombol Aksi Cepat Header Kanan (*Quick CTA*)
- Pada seluruh halaman kerja harian, sudut kanan atas header secara konsisten menyediakan tombol darurat: **`Lapor Blocker`** (warna merah bata `#991B1B` / latar lembut `#FFF8F8` atau tombol solid) yang langsung membuka modal atau rute `05-Raise-Instant-Blocker.html`.

### 4.5 Kebersihan Header (Tanpa Eyebrow Berlebih)
- Jika suatu halaman sudah memiliki breadcrumb dan *Daily Step Bar* di atasnya, **dilarang menambahkan teks eyebrow berulang** (seperti *"Siklus Akuntabilitas Harian"*) tepat di atas judul `h1`. Biarkan judul utama `h1` tampil bersih, lega, dan langsung *to-the-point*.

### 4.6 Standar Responsivitas & Navigasi Multi-Device (Mobile, Tablet, Desktop)
Setiap halaman WorkPulse wajib mengadopsi sistem layout responsif adaptif di seluruh rentang ukuran layar:

1. **Sistem Breakpoint Baku:**
   - **Ultrawide & Large Desktop (> 1440px) & Desktop Reguler (993px – 1440px):**  
     Bilah Atas (`.topbar`), Navigasi Alur (`.daily-workflow-bar`), dan Konten (`.content`) menganut **Fluid Grid Seimbang Responsif** menggunakan unit relatif modern non-statis (`padding: 0 clamp(1.5rem, 4vw, 3.75rem);` dan pada konten: `padding: 2.25rem clamp(1.5rem, 4vw, 3.75rem) 4rem; width: 100%; margin: 0;`):
     - **Tanpa Satuan Statis `px`:** Menggunakan kombinasi unit `rem` (skalabilitas aksesibilitas font pengguna) dan `vw` (proporsi viewport dinamis) untuk menghindari layout yang kaku/statis.
     - **Breathing Room Lebih Lega:** Skala ideal `4vw` dengan batas maksimum `3.75rem` (~60px) memberikan ruang napas yang lebih luas dan elegan dibandingkan nilai kaku 48px sebelumnya, tanpa membuat kanvas tampak kopong.
     - **Tepi Kiri:** Teks *Breadcrumb*, tab *Step Bar* (`.daily-step:first-child { padding-left: 0; }`), teks judul halaman (*H1*), dan tepi kiri kartu panel jatuh tepat di satu sumbu garis lurus vertikal yang sama dari batas kanan sidebar.
     - **Tepi Kanan:** Ikon notifikasi & avatar profil, tombol *Lapor Blocker*, dan tepi kanan kartu panel jatuh tepat di satu garis lurus vertikal yang sama dari tepi kanan layar.
     - **Keseimbangan Simetris:** Jarak sela dari sidebar ke konten selalu sama persis dengan jarak sela dari kartu ke tepi kanan layar di setiap resolusi layar desktop.
   - **Tablet / Layar Sedang (681px – 992px):**  
     Sidebar beralih menjadi **Off-Canvas Drawer** (`position: fixed; left: -290px; width: 280px; z-index: 500;`). Tombol hamburger (`#btn-open-sidebar`) muncul di topbar kiri, dan elemen backdrop (`#sidebar-backdrop`) menutupi konten saat drawer dibuka. Grid 2 kolom di area konten mulai bertumpuk menjadi 1 kolom.
   - **Smartphone / Mobile ($\le$ 680px):**  
     Padding konten diminimalkan (`16px 12px 48px`). Topbar kompak (tinggi 58px). Tombol aksi darurat header (`Lapor Blocker`) membungkus ke baris baru full-width di bawah judul. Form input, radio button risiko, picker blocker, dan tautan referensi beralih ke tata letak tumpuk 1 kolom vertikal (*full-width vertical stack*).

2. **Aturan Drawer Navigasi Mobile:**
   - **Tombol Pemicu:** Tombol hamburger SVG monokrom di sudut kiri topbar.
   - **Tombol Tutup:** Tombol silang SVG monokrom (`#btn-close-sidebar`) di header sidebar sebelah logo WorkPulse.
   - **Backdrop:** Background semi-transparan `rgba(15, 23, 42, 0.45)` dengan efek `backdrop-filter: blur(2px)`. Klik di area luar drawer wajib menutup drawer secara otomatis.
   - **Aksesibilitas & Keyboard:** Menekan tombol `Escape` menutup drawer secara mulus.

3. **Zona Sentuh Jempol (*Thumb Zone Action Bar*):**
   - Pada layar smartphone, action bar footer berada di posisi bawah dengan tombol utama (`Kirim Komitmen` / `Kirim Evaluasi`) berukuran 100% lebar layar (*full-width*) dengan tinggi sentuh ergonomis (minimal `42px` - `44px`).

4. **Standar Penjajaran Checklist & Checkbox (Anti-Top Floating):**
   - Pada kartu tugas, item draf carry-over, maupun opsi formulir di seluruh perangkat (desktop, tablet, maupun smartphone), **kotak centang (*checkbox*) WAJIB SELALU BERADA DI SAMPING KIRI TEKS JUDUL**, sejajar secara vertikal dengan baris pertama teks judul.
   - **LARANGAN KERAS:** Dilarang membuat kotak checklist melompat atau melayang sendirian di baris atas judul (*floating above header*) saat layar menyempit. Gunakan arsitektur CSS Grid 2 kolom (`grid-template-columns: 20px 1fr`) atau Flexbox baris yang memindahkan badge status dan tombol tindakan sekunder ke baris bawah kartu, bukan memindahkan kotak checklist-nya.

---

## 5. STANDAR KOMPONEN STATUS, BADGE & PILL

Untuk mencegah inkonsistensi teks yang membuat pengguna bingung, komponen status wajib mematuhi ketentuan berikut:

### 5.1 Badge Status Kelanjutan Draf Pekerjaan (*Carry-over Draft Badge*)
Pada kartu draf carry-over yang berasal dari hari sebelumnya:
- **Warna Badge:** Selalu menggunakan tema **Amber** (`.pill.amber`).
- **Pilihan Nilai Badge HANYA DUA:**
  1. **`Berlanjut`** $\rightarrow$ jika kemarin aktif masuk dalam komitmen harian dan berlanjut hari ini.
  2. **`Tertunda`** $\rightarrow$ jika kemarin sempat jeda / tidak masuk dalam komitmen hari sebelumnya.
- **LARANGAN KERAS:** Dilarang menyertakan tanggal (misal *"Tertunda sejak 12 Okt"*) atau durasi hari (misal *"Total 3 Hari Kerja"* / *"2 Hari Beruntun"*) di dalam badge. Seluruh rincian tanggal dan akumulasi durasi harus dipindahkan ke baris metadata.

### 5.2 Pill Status Jadwal Pengisian
- **Tepat Waktu:** `.pill.green` $\rightarrow$ `Tersimpan · Tepat Waktu` / `Tepat Waktu`
- **Masa Toleransi (Grace Period):** `.pill.amber` $\rightarrow$ `Masa Toleransi` (09:01 – 09:30 WIB)
- **Terlambat:** `.pill.red` $\rightarrow$ `Terlambat` (> 09:30 WIB)
- **Menunggu Pengisian:** `.pill.amber` $\rightarrow$ `● Menunggu Pengisian`

### 5.3 Tombol Penghapusan / Penghentian Tugas
- Gaya baku: Border tipis merah lembut `#FECACA`, warna teks `#B42318`, background transparan/putih.
- Wajib memiliki tooltip penjelasan atau memicu modal konfirmasi dengan alasan operasional.

---

## 6. STANDAR PENYAJIAN INFORMASI & HIRARKI DATA (3-BARIS BAKU)

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

1. **Baris 1 — Header Kartu:**
   - Sisi Kiri: Kotak checklist (`[ ]`) dan Judul Tugas Terukur (`font-weight: 700;`).
   - Sisi Kanan: Status Amber (`Tertunda`/`Berlanjut`) dan Tombol Aksi (`Hentikan Pekerjaan`).
   - *Catatan Responsif Mobile ($\le$ 680px):* Status Amber dan Tombol Aksi berpindah ke baris paling bawah dengan garis pemisah bertitik (*dashed border*).
2. **Baris 2 — Metadata Terstruktur (Mini-Tag / Chip Kapsul):**
   - Setiap atribut metadata dibungkus dalam kapsul abu-abu mini (`background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 4px; padding: 2.5px 7px;`).
   - Membentang penuh selebar kartu di bawah baris header (*full-width* sampai batas padding kanan).
3. **Baris 3 — Konteks Evaluasi Karyawan (Callout Box Lembut):**
   - Teks catatan dibungkus dalam kotak lembut bersudut tumpul (*radius 6px*, latar abu-abu muda `#F8FAFC`, garis tepi tipis `#E2E8F0`).
   - Membentang penuh 100% selebar kartu sampai batas padding kanan (tidak terpotong oleh status di baris atas).
   - Label kecil kapital **`CATATAN:`** berada di atas, dan isi kutipan miring (*italic*) berada di baris bawahnya.
4. **Baris 4 — Penegakan Aturan Sistem (Jika Ada):**
   - Menggunakan ikon info monokrom `ⓘ` dengan warna teks amber tua `#B45309`, membentang penuh di bawah Callout Box Catatan.

---

## 7. ATURAN BISNIS & PENEGAKAN SISTEM LINTAS HALAMAN (*ENGINE RULES*)

Aturan-aturan berikut bersifat universal dan saling mengikat antar-halaman:

### 7.1 Aturan Penguncian Risiko Minimal AMBER (*Amber Lock Engine*)
- **Berlaku pada:** Halaman 02 (Morning), Halaman 03 (Additional), Halaman 04 (EOD), dan Halaman 06 (Weekly).
- **Aturan Matematis:**  
  Jika riwayat `active_days_count >= 2` hari kerja:
  1. Radio/opsi pilihan **GREEN otomatis dinonaktifkan (*disabled*)**.
  2. Pilihan terkunci minimal pada status **AMBER** (atau RED jika ada kendala fatal).
  3. Baris peringatan aturan sistem muncul di UI.
  4. Kolom penjelasan faktor kendala/risiko menjadi **wajib diisi**.
- **Tujuan:** Mencegah *"silent slippage"* di mana pekerjaan yang berlarut-larut disamarkan seolah-olah berjalan mulus dan lancar.

### 7.2 Aturan Batas Waktu & Jam Kerja (*Time-Window Engine*)
- **08:00 – 09:00 WIB:** Jendela Tepat Waktu (*On-Time Window*).
- **09:01 – 09:30 WIB:** Masa Toleransi Resmi (*Grace Period*). Karyawan tetap dapat mengirim komitmen tanpa penalti *No Submission*, namun tercatat berstatus toleransi secara transparan.
- **> 09:30 WIB:** Jendela Keterlambatan (*Late Window*). Form mewajibkan pengisian alasan keterlambatan.
- **Aturan Integritas Waktu:** Status on-time/terlambat dihitung berdasarkan **timestamp server saat penyerahan (*submit*)**, bukan jam saat layar pertama kali dibuka di browser.

### 7.3 Kuota Slot Komitmen Harian
- Standar harian: **Minimal 1, Maksimal 3 Komitmen Utama**.
- Jika batas 3 slot tercapai, tombol penambahan slot dinonaktifkan.
- Jika hanya tersisa 1 slot, tombol hapus dinonaktifkan (karyawan tidak boleh menghapus slot terakhir kecuali mencentang opsi resmi *Zero Commitment*).

### 7.4 Opsi Tanpa Komitmen (*Zero Commitment Mode*)
- Jika karyawan mencentang tidak ada komitmen harian (karena training penuh hari, dinas luar, atau townhall):
  - Slot komitmen di bawahnya otomatis meredup dan nonaktif.
  - Dropdown alasan resmi wajib dipilih.
  - Status risiko harian menjadi **Netral**, dan karyawan terbebas dari penalti pengisian tanpa mengacaukan statistik tim.

### 7.5 Status Baseline Terkunci & Jalur Koreksi Formal
- Setelah formulir pagi dikirim dan dikonfirmasi, seluruh form berubah menjadi *read-only* permanen.
- **Tidak ada fitur edit langsung di tempat (*no in-place edit*)**.
- Jika ada kesalahan ketik atau revisi target, karyawan wajib diarahkan melalui modul resmi **`16a-Morning-Correction-Request.html`** demi menjaga integritas audit trail perusahaan.

### 7.6 Standar Sesi Pengguna & Rute Berbasis Peran (*Role-Based Session Engine*)
- Objek sesi aktif disimpan di `localStorage` dengan kunci baku: **`workpulse_active_user`**.
- Struktur data wajib memuat atribut: `name`, `email`, `role`, `roleLabel`, `function`, `department`, `isExempt`, `avatar`, dan `targetPage`.
- **Rute Pendaratan Otomatis Pasca-Login:**
  - `EMPLOYEE` (Kontributor Individual) $\rightarrow$ diarahkan langsung ke `02-Morning-Commitment.html`.
  - `SUPERVISOR` / `HEAD_OF_DEPARTMENT` (Pimpinan Tim/Divisi) $\rightarrow$ diarahkan ke `08-Pulse-Dashboard.html`.
  - `HRGA` (Petugas Kepatuhan) $\rightarrow$ diarahkan ke `11-Compliance-Queue-HRGA.html`.
  - Akun Eksekutif/CEO (`isExempt: true`) $\rightarrow$ diarahkan ke `02-Morning-Commitment.html` dengan *Exemption Banner* aktif.
- **Konsistensi UI:** Seluruh halaman wajib membaca sesi ini untuk menampilkan inisial avatar, nama, dan unit kerja pada sidebar kiri bawah, serta menyesuaikan petunjuk teks berbasis divisi (`activeUser.function`).

### 7.7 Standar Pemulihan Sesi di Tempat (*In-Place Session Recovery - UF-03*)
- Jika sesi kerja pengguna habis di tengah pengisian formulir di halaman mana pun, sistem **DILARANG me-redirect paksa ke layar login kosong** yang dapat menghapus draf pekerjaan.
- Sistem wajib memunculkan **Modal Re-autentikasi di Tempat** (`#modal-session-timeout`):
  - Karyawan hanya diminta memasukkan ulang kata sandi.
  - Setelah diverifikasi, modal tertutup dan seluruh draf teks yang sedang diketik tetap utuh di layar.

---

## 8. STANDAR POLA INTERAKSI FORMULIR & VALIDASI

### 8.1 Dropdown Pemilihan Blocker Tim (*Quick Blocker Picker*)
- Tombol pemantik berbentuk ringkas: `Pilih Blocker Aktif` + panah dropdown (*chevron down*), tanpa ikon petir.
- Menampilkan daftar tiket aktif tim (`#BLK-XXX`), nama kendala, dan badge status tiket (*Open, Acknowledged, In Progress*).
- **Kelonggaran Input Otomatis:** Jika tiket blocker dipilih, tanda bintang merah wajib (`*`) pada field penjelasan risiko disembunyikan dan berubah menjadi `(Opsional — tiket blocker telah dipilih)` agar karyawan tidak mengetik ulang hal yang sudah tercatat di tiket.

### 8.2 Petunjuk Kontekstual Berbasis Peran (*Role-Based Prompt Hint*)
- Di bawah kotak input hasil kerja (*deliverable*), sediakan teks contoh miring (*italic*) yang otomatis berganti mengikuti divisi akun karyawan (Engineering, Finance, HRGA, Sales, Ops).
- Sifat: Murni pemandu visual non-binding (tidak ikut tersimpan ke database).

### 8.3 Peringatan Kualitas Komitmen (*Soft Quality Warning*)
- Jika teks komitmen terdeteksi $< 10$ karakter atau hanya kata umum (`meeting`, `coding`, `kerja`, `bikin`), tampilkan badge kuning edukatif:  
  `⚠ Peringatan Kualitas: Komitmen terdeteksi sangat singkat atau generik. Pastikan menyebutkan deliverable terukur...`
- **Aturan Desain:** Peringatan ini bersifat edukatif dan **TIDAK memblokir tombol submit** (*non-blocking*).

### 8.4 Simpan Draf Lokal Otomatis
- Tombol `Simpan Draf` menyimpan seluruh state formulir ke `localStorage` peramban untuk mencegah kehilangan data akibat mati listrik atau browser tertutup.

### 8.5 Standar Kontrol Kata Sandi & Indikator Kekuatan
- Setiap field kata sandi wajib dilengkapi tombol intip (*toggle visibility*) dengan ikon SVG mata terbuka (`eye`) dan mata tercoret (`eye-off`).
- Setiap formulir penetapan kata sandi baru (Aktivasi / Reset) wajib menyajikan **Password Strength Bar** 4 segmen visual:
  - Skor 1: *Sangat Lemah* (Merah `#EF4444`)
  - Skor 2: *Cukup* (Amber `#F59E0B`)
  - Skor 3: *Kuat* (Hijau `#10B981`)
  - Skor 4: *Sangat Aman* (Hijau Tua `#059669`)
- Kriteria minimum valid: $\ge 8$ karakter dengan kombinasi huruf besar, huruf kecil, dan angka.

---

## 9. REGISTRI KEPUTUSAN DESAIN TIAP HALAMAN

Bagian ini mencatat detail keputusan yang telah disepakati pada setiap halaman. **Wajib ditambah setiap kali halaman baru diselesaikan.**

### Halaman 01: Login & Aktivasi Akun
- **Berkas Prototipe:** [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-01-Login-Activation.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-01-Login-Activation.md)
- **Keputusan Utama yang Diambil:**
  1. **Strict 1-Screen Viewport (100vh):** Tata letak split grid 2 kolom (`minmax(360px, 0.92fr) minmax(500px, 1.08fr)`). Kolom kiri untuk *Brand Storytelling* hijau tua (`#0B3327`), kolom kanan untuk formulir interaktif bersih tanpa scrollbar vertikal di desktop.
  2. **Multi-Screen State Controller:** Mengintegrasikan 7 sub-layar dalam satu arsitektur DOM tunggal (`login`, `activation`, `reset`, `reset-success`, `act-success`, `invalid-token`, `access-denied`) yang dikendalikan fungsi `showScreen(id)`.
  3. **Pengenalan Peran Otomatis (*Realistic Account Matcher*):** Sistem mengenali peran dan divisi akun secara cerdas saat login, lalu menyimpan payload `workpulse_active_user` ke `localStorage`.
  4. **Protokol Keamanan Brute-Force:** Menerapkan penguncian sementara (*lockout*) 60 detik dengan hitung mundur otomatis jika terjadi kegagalan berulang.
  5. **Modal Re-autentikasi di Tempat (UF-03):** Melindungi sesi kerja karyawan tanpa merusak draf yang belum terkirim.
  6. **Penyelarasan Simbol Blocker (Bebas Ikon Petir):** Mengganti ikon petir (`⚡`) pada pilar nilai kerja sisi kiri menjadi ikon bendera (*flag*) monokrom yang tenang, selaras 100% dengan Halaman 02 dan Halaman 03.
  7. **Standarisasi Label Tombol Submit:** Mengubah `Masuk ke Dashboard` menjadi **`Masuk ke Ruang Kerja`** agar inklusif dan akurat untuk seluruh peran (terutama kontributor yang diarahkan ke Morning Commitment, bukan dashboard).
  8. **Identitas Brand Mobile Header:** Menyematkan logo mini WorkPulse di atas formulir login yang otomatis tampil pada layar ponsel/tablet ($\le 900\text{px}$) saat panel kiri disembunyikan.
  9. **Penyempurnaan Copywriting & Standarisasi Tombol:** Menghilangkan seluruh istilah teknis/jargon pengembang (seperti *kredensial* $\rightarrow$ *email dan kata sandi*, *dependensi* $\rightarrow$ *ketergantungan alur kerja*), melunakkan nada pilar (menghilangkan kata sensitif *otoriter* $\rightarrow$ *kaku*), serta menyeragamkan seluruh tombol pembatalan sub-layar menjadi baku **`Kembali ke Halaman Login`** dan modal timeout menjadi **`Keluar Akun`**.

### Halaman 02: My Today — Morning Commitment
- **Berkas Prototipe:** [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-02-Morning-Commitment.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-02-Morning-Commitment.md)
- **Keputusan Utama yang Diambil:**
  1. Menghapus teks eyebrow *"Siklus Akuntabilitas Harian"* di atas judul `h1` agar header bersih dan fokus pada *Morning Commitment*.
  2. Menyeragamkan badge draf pool menjadi murni **`Tertunda`** atau **`Berlanjut`** (Pill Amber), dan membersihkan teks tanggal/hari dari badge ke subteks metadata 3-baris.
  3. Menghapus simbol petir (`⚡`) dari tombol dropdown `Pilih Blocker Aktif`.
  4. **Penyematan Fokus Prioritas Kemarin Sore (*Embedded Context Hint Banner*):** Menghilangkan kotak panel independen bertingkat yang sebelumnya memakan ruang vertikal $\approx 130\text{px}$ di antara draf carry-over dan formulir komitmen. Fokus kemarin sore kini disematkan langsung sebagai *context hint banner* satu baris yang ramping (`.tomorrow-priority-hint`) tepat di atas Slot Komitmen 1 di dalam panel formulir, menampilkan label tegas `Prioritas Kemarin Sore:`, kutipan teks miring, dan badge mini `Hanya Referensi`. Menempatkan pengingat tepat saat karyawan mengetik komitmen dan menghemat lebih dari $70\%$ ruang vertikal.
  5. Menerapkan 33 skenario lengkap yang mencakup dimensi waktu, peran, draf, penegakan AMBER, hingga penanganan kegagalan jaringan.
  6. **Arsitektur Responsif Lengkap Multi-Device:** Menyesuaikan tampilan di semua ukuran layar (Desktop Ultrawide > 1440px dengan container terkunci 1140px; Tablet 681px - 992px dengan sidebar drawer off-canvas dan grid 1 kolom; Smartphone <= 680px dengan hamburger drawer, backdrop blur, stacked carry-over card metadata, dan thumb-zone sticky footer bar 100% width).
  7. **Penyatuan Status Risiko ke Grid 4-Kolom Terpadu (Menghapus Kotak Preview Bertumpuk):** Mengikuti solusi yang telah diterapkan di Halaman 03, kotak kedua (`.status-preview`) yang sebelumnya berdiri sendiri dan memakan ruang vertikal berlebih di bawah Panel 1 telah dihapus total. *Status Risiko Hari Ini* kini terintegrasi langsung ke dalam **Panel 1 (Konteks Jadwal & Batas Pengisian)** sebagai kolom ke-4 pada grid 4-kolom terpadu (`repeat(4, 1fr)` di desktop, `repeat(2, 1fr)` di tablet, dan `1fr` di mobile). Kolom ke-4 ini menampilkan badge pill status (GREEN/AMBER/RED/Netral) dengan dot indikator dan subteks dinamis (`Terkendali Mandiri`, `Perhatian (Pantau Berkala)`, `Risiko Tinggi (Eskalasi Diperlukan)`), menghemat lebih dari 100px ruang layar dan menciptakan keselarasan visual 100% dengan Halaman 03.
  8. **Panel Draf Carry-Over Kolapsibel (Default Tertutup, Desain Kartu Asli Utuh):** Mengembalikan desain kartu draf ke format aslinya yang kaya konteks (lengkap dengan kotak abu-abu callout `CATATAN: ...`, chip metadata terstruktur, dan peringatan AMBER), namun membungkus seluruh panel ke dalam akordeon kolapsibel yang **tertutup secara default** (`is-collapsed`) mirip dengan panel *"Komitmen Pagi Terkunci"* di Halaman 03. Pengguna disajikan header ringkas setinggi $\approx 50\text{px}$ dengan badge count (`3 Item Tersedia`), tombol toggle interaktif (`Lihat Draf` $\leftrightarrow$ `Tutup Draf`), dan animasi chevron rotasi 180°. Ruang vertikal layar tetap terbebas drastis saat halaman pertama kali dibuka sehingga formulir komitmen langsung tampak, namun saat dibuka pengguna mendapatkan kejelasan visual penuh dari catatan evaluasi dan peringatan carry-over.

---

### Halaman 03: My Today — Additional Work
- **Berkas Prototipe:** [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-03-Additional-Work.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-03-Additional-Work.md)
- **Keputusan Utama yang Diambil:**
  1. **Independensi dari Komitmen Pagi (FR-07 & BR-01):** Additional Work dicatat terpisah dan bukan merupakan slot komitmen ke-4, sehingga tidak pernah mengubah atau merusak komitmen pagi yang telah dikunci.
  2. **Taksonomi Alasan Resmi (5 Enum PRD FR-06):** Menerapkan 5 alasan baku (`Newly Assigned`, `Missed in Planning`, `Priority Change`, `Operational-Incident`, `Other`).
  3. **Panel Kondisional 'Assigned By':** Field nama pemberi tugas wajib muncul dan wajib diisi hanya jika alasan `Newly Assigned` dipilih.
  4. **Penyelarasan Fluid Grid Seimbang Non-Statis:** Mengadopsi padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis `px`, menjaga sumbu kiri dan kanan sejajar lurus dengan Halaman 02.
  5. **Panel Konteks Harian Humanis & Adil:**
     - Penamaan Tanggal Kerja dengan subteks adaptif **`Hari Kerja Aktif`** (menggantikan istilah pasif *Hari Kerja Reguler*, didukung adaptasi multi-state kalender: *Hari Kerja Aktif*, *Libur Nasional*, *Akhir Pekan*, *Cuti Disetujui*, dan *Dispensasi Khusus*).
     - Penamaan *Jendela Pencatatan (09:30 – 17:00 WIB)* dengan subteks *Fleksibel · Hanya Jika Ada Tugas Baru*.
     - Pengenalan status komitmen pagi multi-state adil: pembedaan jelas antara terlambat (`● Terlambat (Tetap Terisi)` dengan jam submit) vs tidak mengisi (`● Tidak Ada Komitmen Pagi` netral), menghindari kata kaku "Baseline".
     - Subtitle ramah: *"Bersifat opsional — catat pekerjaan baru atau tugas mendadak yang muncul setelah komitmen pagi dikunci..."*
  6. **Standarisasi Istilah 'EOD Outcome':** Mengganti istilah sempit *"EOD Check-out"* (yang bias presensi kehadiran) menjadi **`EOD Outcome`** di seluruh alur navigasi step bar dan kartu transisi alur kerja.
  7. **Fitur Sunting (Edit) & Pembatalan:** Setiap kartu Additional Work yang tersimpan dapat disunting kembali (*inline edit mode*) sebelum EOD dengan tombol `Edit` dan `Hapus` yang ergonomis.
  8. **Kartu Transisi Alur Kerja Menuju EOD Outcome:** Di bawah log tugas terdapat kartu transisi berpenampilan elegan yang menghubungkan langsung karyawan ke `04-EOD-Outcome.html` dengan badge jam mulai `Mulai 16:30 WIB`, tipografi bersih tanpa tanda bintang mentah markdown, dan penegasan bahwa seluruh komitmen pagi dan pekerjaan tambahan akan dievaluasi capaian hasilnya secara setara.
  9. **Integrasi Tiket Blocker Tanpa Simbol Petir:** Tombol `Pilih Blocker Aktif ▾` menyediakan quick-picker tiket blocker tim aktif dengan smart auto-fill deskripsi.
  10. **Kesiapan Penyaluran ke EOD (Halaman 04):** Seluruh item yang tersimpan di `localStorage: workpulse_additional_work_items` siap dimuat otomatis di Halaman 04 untuk evaluasi capaian (*Outcome*) setara dengan Morning Commitment.
  11. **Panel Referensi Komitmen Pagi Terkunci (Collapsible by Default & Zero Emoji):**
      - Judul bersih **`Komitmen Pagi Terkunci`** tanpa eyebrow berulang, badge ringkas `1 Komitmen`, dan penanda kartu `Terkunci`.
      - **Nol emoticon/emoji:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom (ikon gembok dan chevron).
      - **Default tertutup (*collapsed by default*):** Menghemat ruang layar vertikal secara drastis sehingga fokus karyawan langsung mengarah ke formulir *Additional Work*, disertai tombol interaktif *Lihat Komitmen* / *Tutup Komitmen*.
      - **Penanganan Empty State:** Tampilan netral dan suportif jika sesi pagi terlewat (*No Submission*) atau *Zero Commitment*.
  12. **Penyederhanaan Status Risiko & Notice Tata Kelola (Opsi 1 Terpilih):**
      - Menghilangkan 2 kotak besar bertumpuk yang sebelumnya memakan ruang vertikal berlebih di antara Panel 1 dan Panel 3.
      - Mengintegrasikan *Status Risiko Hari Ini* langsung ke dalam **Panel 1 (Konteks Jadwal)** sebagai kolom ke-4 pada grid 4-kolom (`repeat(4, 1fr)`).
      - Menempatkan maklumat aturan sistem (*Governance Notice FR-07*) sebagai catatan kaki terpadu (*integrated footer notice*) yang bersih dan tipis di bagian dasar Panel 1.
      - Menghemat lebih dari 150px ruang vertikal kanvas kerja, menciptakan alur tatap muka yang ringkas, terpadu, dan langsung mengarahkan atensi karyawan ke formulir pencatatan.
  13. **Standarisasi Formulir & Log Slot Pekerjaan Tambahan (Panel 4):**
      - **Kicker Baku:** Menggunakan `PEKERJAAN DI LUAR KOMITMEN PAGI` (menghapus istilah teknis *Mid-Day Ad-hoc*).
      - **Sinkronisasi Tombol Header:** Tombol di kanan atas selalu sinkron dengan kondisi formulir (`+ Tambah Pekerjaan Tambahan` saat formulir tertutup vs `Tutup Formulir` saat formulir terbuka).
      - **Default State Cerdas:** Jika sudah terdapat item tersimpan, formulir default tertutup agar karyawan langsung melihat daftar log tugas yang tercatat tanpa perlu scroll.
      - **Bebas Redundansi Judul Kartu:** Menghilangkan pengulangan simbol ganda `#1`, diformat baku menjadi `[ 1 ] Pekerjaan Tambahan #1`.
      - **Penamaan Badge Form:** Mengganti jargon *Pra-EOD Ad-hoc* menjadi `Tugas Tambahan Baru` (mode baru) dan `Mode Sunting` (mode edit).
      - **Standarisasi Label 'Target Hasil Kerja':** Mengganti istilah kaku *Rencana Hasil Kerja (Deliverable)* menjadi **`Target Hasil Kerja`** (menghapus kata 'Rencana' yang tidak cocok untuk tugas ad-hoc siang hari serta menghapus jargon asing dalam tanda kurung agar ramah bagi seluruh divisi kerja).
      - **Aksen Kondisional 'Assigned By':** Panel pemberi tugas muncul secara dinamis saat alasan `Newly Assigned` dipilih, dengan aksen visual border kiri hijau (`#0B8061`).
      - **Empty State Mini-Strip Ramping (Opsi 1):** Mengganti kotak vertikal bertumpuk (~190px) dengan *Horizontal Mini-Strip* setinggi $\approx 50\text{px}$ (ikon lingkaran plus 32px di kiri dan teks penjelas 1 baris di kanan), menghemat ruang vertikal hingga 75% saat belum ada data.

### Halaman 04: My Today — EOD Outcome
- **Berkas Prototipe:** [`04-EOD-Outcome.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/04-EOD-Outcome.html)
- **Dokumen Penjelasan Detail:** [`Penjelasan-Halaman-04-EOD-Outcome.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Penjelasan-Halaman/Penjelasan-Halaman-04-EOD-Outcome.md)
- **Keputusan Utama yang Diambil:**
  1. **Penyelarasan Desain Sistem & Fluid Grid (100% Selaras):** Mengadopsi palet warna baku *Deep Forest Green*, tipografi *Plus Jakarta Sans*, dan padding fluid simetris `clamp(1.5rem, 4vw, 3.75rem)` yang sejajar lurus dengan Halaman 02 dan Halaman 03.
  2. **Daily Stepper Bar Langkah 3:** Langkah 1 (*Morning Commitment*) dan Langkah 2 (*Additional Work*) berstatus `completed` (tanda centang SVG hijau), dan Langkah 3 (*EOD Outcome*) berstatus `active` dengan nomor urut 3 dan garis bawah hijau tua.
  3. **Penyatuan Konteks Hari Ini ke Grid 4-Kolom Terpadu (Panel 1):** Mengintegrasikan Tanggal Kerja (Hari Kerja Aktif), Jendela EOD Outcome (16:30 – 18:00 WIB), Status Evaluasi, dan Status Risiko Harian ke dalam grid 4-kolom terpadu dengan catatan kaki tata kelola di dasar panel.
  4. **Pemisahan Ketat Outcome vs Continuation (FR-08 & FR-09):** Setiap kartu evaluasi memiliki 2 dropdown mandiri: *Hasil Capaian (Outcome)* (`Completed`, `Partially Completed`, `Not Completed`, `Cancelled`) dan *Kelanjutan Pekerjaan (Continuation)* (`Continue`, `Do Not Continue`). Keduanya tidak boleh disatukan menjadi satu status.
  5. **Panel Alasan Kondisional Dinamis (FR-09):** Jika memilih `Continue`, field alasan kelanjutan wajib muncul dan wajib diisi (untuk dasar pertimbangan draf pagi esok hari). Jika memilih `Cancelled`, field alasan pembatalan wajib diisi.
  6. **Penyaluran Otomatis ke Koleksi Draf Pagi Esok Hari (FR-11):** Seluruh item yang ditandai `Continue` otomatis disimpan ke `localStorage: workpulse_carry_over_pool` untuk menjadi kumpulan draf komitmen pada Halaman 02 hari berikutnya.
  7. **Rekomendasi Status Sistem vs Kemandirian Final Status (FR-10):** Sistem menghitung saran status secara heuristik (*GREEN/AMBER/RED*), namun karyawan memiliki hak mandiri untuk memilih radio card Final Status hariannya.
  8. **Kewajiban Penjelasan Risiko Harian (FR-10):** Field textarea penjelasan risiko harian otomatis muncul dan wajib diisi jika Final Status yang dipilih adalah `AMBER` atau `RED`.
  9. **Keterhubungan Tomorrow Priority (FR-52):** Catatan prioritas esok hari disimpan ke `localStorage: workpulse_tomorrow_priority` dan otomatis muncul sebagai *Embedded Context Hint Banner* di Halaman 02 hari berikutnya.
  10. **Pembersihan Total Elemen Prototipe:** Seluruh kotak coba blocker demo dan toggle penguji lama telah dihapus total. Antarmuka 100% otentik mencerminkan produk enterprise nyata dengan tombol Simpan Draf dan Kirim EOD Outcome yang mengunci form secara permanen.
  11. **Deterministic Heuristic Suggestion Engine 6-Cabang (FR-13 & AC-38, ADR-013):** Rekomendasi status sistem dihitung secara presisi mengikuti 6 cabang deterministik: (1) Active Critical Blocker $\rightarrow$ RED, (2) Rasio Not Completed/Cancelled $\ge 50\%$ $\rightarrow$ RED, (3) Carry-over $\ge 2$ hari / High Blocker $\rightarrow$ AMBER, (4) Partially Completed / kegagalan $< 50\%$ $\rightarrow$ AMBER, (5) Selesai penuh tanpa kendala $\rightarrow$ GREEN, (6) 0 tugas dievaluasi $\rightarrow$ status netral menghitung.
  12. **Protokol Anti-Silent Mutation & ValidationPromptModal (FR-14 & AC-39, ADR-013):** Sistem dilarang keras mengubah status pilihan karyawan secara sepihak. Jika karyawan memilih status yang berbeda dari saran sistem, modal `#modal-status-mismatch` muncul untuk menyajikan perbandingan visual dan memberikan opsi adil: *Gunakan Saran Sistem* vs *Pertahankan Pilihan Saya*.
  13. **Indikator Ketepatan Waktu Penyerahan (FR-26) & Tautan Bukti Kerja Opsional (FR-08):** Panel 1 menyajikan badge realtime *Tepat Waktu (On-Time)* $\le$ 18:00 WIB, *Masa Tenggang (Grace Period)* 18:00 – 18:30 WIB, dan *Terlambat* > 18:30 WIB. Setiap kartu tugas juga dilengkapi field opsional *Tautan Bukti Kerja (Evidence Link)* untuk melampirkan PR Git, dokumen, atau tiket pelengkap.
  14. **Integritas Konten Komitmen Pagi & Tugas Tambahan (Zero Duplicate Deliverable):** Menghilangkan baris kedua fiktif (*Target Deliverable*) baik pada kartu komitmen pagi maupun tugas tambahan. Baik Halaman 02 maupun Halaman 03 murni hanya memiliki satu input teks utama (*Rencana Hasil Kerja* di pagi hari dan *Target Hasil Kerja* di siang hari). Di Halaman 04, teks ini langsung ditampilkan sebagai isi tugas utama. Metadata tugas tambahan seperti badge alasan resmi, tautan referensi/blocker (`reference`), serta nama delegator (`assignedBy` khusus alasan `Newly Assigned`) disajikan sebagai metadata terpadu tanpa kotak callout ganda yang redundan.
  15. **Penyempurnaan Ergonomi Panel 4 (Penetapan Final Status & Validasi Kualitas):**
      - **Keterbacaan State Saran Sistem:** Mengganti label awal *Menghitung...* menjadi badge informatif `● Menunggu Evaluasi Tugas` disertai ikon neraca analitik SVG monokrom dan teks panduan edukatif.
      - **Selection Mark Radio Card:** Menambahkan indikator centang lingkaran radio di pojok kanan atas masing-masing kartu status (GREEN, AMBER, RED) yang memberikan kepastian visual tegas saat kartu aktif.
      - **Validasi Kualitas Risiko Harian (Min. 15 Karakter):** Dilengkapi live counter interaktif (`0 / 15 karakter minimal`) yang otomatis berubah warna hijau saat syarat terpenuhi, mencegah masukan kosong atau teks asal.
      - **Peringatan Dini Carry-over $\ge 2$ Hari:** Menampilkan notice kontekstual otomatis pada kartu GREEN jika terdapat tugas carry-over $\ge 2$ hari sebagai edukasi sebelum submit.

### Halaman Berikutnya (Registri Bertahap):
- `05-Raise-Instant-Blocker.html`
- `06-My-History-Weekly-Summary.html`
- `07-Notification-Center-Browser-Push.html`
- `08-Pulse-Dashboard.html`
- `09-Blocker-Escalation-Queue.html`
- `10-Manager-Note-Coaching-Record.html`
- `11-Compliance-Queue-HRGA.html`
- `12-Exemption-Management.html`
- `13-Project-Risk-View.html`
- `14-Escalation-Aging.html`
- `15-Admin-Organizational-Mapping.html`
- `16a-Morning-Correction-Request.html`
- `16b-EOD-Correction-Request.html`
- `17-Admin-Temporary-Reviewer.html`
- `18-Policy-Settings.html`
- `19-Admin-Notification-Channel-Setup.html`
- `20-My Leave Request (Employee).html`
- `21-Leave Approval Queue (ReviewerHRGA).html`
- `22-Correction-and-Leave-Review.html`
- `23-Reports.html`
- `24-Profile-Settings.html`

---

## 10. CHECKLIST WAJIB SEBELUM MEMULAI HALAMAN BARU

Sebelum menulis atau mengedit berkas HTML/CSS halaman baru, lakukan pemeriksaan mandiri (*self-check*):

- [ ] **1. Apakah 100% Mirip Hasil Jadi & Bebas Unsur Prototipe?** Pastikan antarmuka bersih mutlak dari tombol demo, bilah pemilih peran uji coba (*role selector tooling*), watermark dummy, atau gimmick penguji. Seluruh interaksi harus mencerminkan produk enterprise yang nyata.
- [ ] **2. Apakah Bebas Emoji?** Pastikan tidak ada karakter emoji sama sekali. Gunakan SVG monokrom.
- [ ] **3. Apakah Warna Merah Lembut?** Pastikan semua elemen error/warning/bahaya menggunakan latar `#FFF8F8`, border `#FECDCA`, dan teks `#991B1B`.
- [ ] **4. Apakah Header Bersih?** Pastikan tidak ada eyebrow teks yang redundan dengan breadcrumb atau step bar.
- [ ] **5. Apakah Format Metadata 3-Baris Dipatuhi?** Pisahkan metadata, catatan, dan aturan sistem secara vertikal dengan pembatas vertikal yang jelas.
- [ ] **6. Apakah Badge Singkat & Padat?** Jangan masukkan tanggal atau hitungan hari ke dalam badge status jika sudah ada di subteks.
- [ ] **7. Apakah Aturan Amber Lock Terintegrasi?** Jika ada penanganan tugas $\ge 2$ hari, pastikan radio GREEN terkunci dan penjelasan risiko wajib diisi.
- [ ] **8. Apakah Bahasa Bebas Jargon?** Periksa teks placeholder, alert, dan label agar mudah dimengerti karyawan non-teknis.
- [ ] **9. Apakah Tombol Aksi Bersih dari Simbol Petir?** Gunakan teks lugas dan panah navigasi standar.
- [ ] **10. Apakah Terkoneksi dengan Halaman Terkait?** Periksa rute tautan (`href`), state navigasi, dan kontrak data antar-halaman.

---
*Dokumen ini diperbarui secara berkala dan wajib dijaga kelengkapannya.*
