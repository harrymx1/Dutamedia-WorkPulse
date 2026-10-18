# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 03: MY TODAY — ADDITIONAL WORK

- **Berkas Prototipe:** [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html)
- **Rute Sistem:** `/today/additional`
- **Posisi Alur:** Langkah 2 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [`Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [`02-PRD.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [`03-UI-UX-Spec-Flow.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [`04-Design-System.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Tujuan Utama Halaman
Halaman **Additional Work** adalah ruang kerja fleksibel yang dirancang untuk menangkap dinamika pekerjaan riil di lapangan tanpa merusak integritas komitmen awal. Halaman ini berfungsi untuk:
1. **Mencatat Pekerjaan Tak Terduga di Sela Jam Kerja (*Mid-day Ad-hoc Tasks*):** Memfasilitasi karyawan mencatat penugasan mendadak dari atasan, insiden operasional, atau perubahan prioritas yang terjadi setelah komitmen pagi (*Morning Commitment*) terkunci pada pukul 09:00 / 09:30 WIB.
2. **Menjaga Kemurnian Baseline Pagi (PRD FR-07 & BR-01):** Menegaskan prinsip tata kelola bahwa pekerjaan tambahan **bukan merupakan slot komitmen ke-4** dan **tidak pernah mengubah atau membatalkan baseline Morning Commitment** yang sudah dikunci.
3. **Penyetaraan Bobot Evaluasi Sore Hari (PRD FR-08 & 4.4):** Seluruh item yang dicatat di halaman ini secara otomatis disalurkan ke layar evaluasi sore (**Halaman 04: EOD Outcome**) dengan bobot perlakuan capaian hasil (*Outcome & Continuation*) yang setara dengan komitmen utama.

### 1.2 Prinsip Desain & Batasan Ketat
- **Sifat Asinkron & Fleksibel (Opsional):** Halaman ini bersifat opsional. Karyawan tidak diwajibkan mengisi jika sepanjang hari kerja tidak ada penugasan tambahan di luar rencana pagi. Jendela pencatatan aktif mulai 09:30 hingga 17:00 WIB.
- **NOL Emoticon / Emoji:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom (ikon jam, panah dropdown, gembok, chevron, centang, dan kalender).
- **Skema Warna Merah Lembut (*Soft Rose*):** Penanganan validasi error dan tombol hapus menggunakan nuansa merah lembut `#FFF8F8`, border `#FECDCA`, dan teks `#991B1B`.
- **Integrasi Sesi Pengguna Lintas Halaman:** Membaca identitas aktif dari `localStorage: workpulse_active_user` secara otomatis untuk mengisi profil sidebar, topbar, dan prompt hint kontekstual.
- **Penghematan Ruang Vertikal Maksimal (*Above-the-Fold Priority*):** Seluruh komponen sekunder (komitmen terkunci, form saat sudah ada item, status risiko) dirancang kompak dan terpadu agar kanvas kerja tetap lapang dan tidak menuntut scrolling berlebih.

---

## 2. ANATOMI & ARSITEKTUR KOMPONEN ANTARMUKA (5 PANEL UTAMA)

Halaman ini tersusun secara harmonis atas 5 panel struktural utama:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & SIKLUS ALUR KERJA (Daily Step Bar):                             │
│    [1. Morning Commitment ✓] -> [2. Additional Work ●] -> [3. EOD Outcome]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PANEL 1: KONTEKS JADWAL & STATUS RISIKO (Grid 4 Kolom Terpadu - Opsi 1): │
│    - Kolom 1: Tanggal Kerja [Hari Kerja Aktif]                              │
│    - Kolom 2: Jendela Pencatatan [09:30 – 17:00 WIB · Fleksibel]            │
│    - Kolom 3: Status Komitmen Pagi [Tersimpan · Tepat Waktu] (1 Baris)      │
│    - Kolom 4: Status Risiko Hari Ini [GREEN · Terkendali Mandiri]           │
│    - Catatan Kaki Terpadu (Notice Aturan Sistem FR-07 Ramping di Dasar)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL 3: KOMITMEN PAGI TERKUNCI (Read-Only Baseline Reference):          │
│    - Header Bersih: Judul [Komitmen Pagi Terkunci], Badge [1 Komitmen],     │
│                     Tombol Toggle [Lihat Komitmen / Tutup Komitmen]         │
│    - State: Collapsed by Default (Hemat Ruang Layar Drastis, Nol Emoji)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL 4: DAFTAR ADDITIONAL WORK & FORMULIR PENCATATAN (Inti Halaman):    │
│    - Kicker Baku: [PEKERJAAN DI LUAR KOMITMEN PAGI]                         │
│    - Header Panel: Counter Dinamis, Tombol Sinkron [+ Tambah / Tutup Form]  │
│    - Formulir Input (Tugas Tambahan Baru / Mode Sunting):                   │
│      * Target Hasil Kerja (Textarea + Role-Based Prompt Hint + Warning)     │
│      * Alasan Muncul (5 Enum PRD FR-06)                                     │
│      * Tautan Referensi / Tiket Tugas (Opsional) + Quick Blocker Picker     │
│      * Panel Kondisional 'Assigned By' (Aksen Hijau 3px saat Newly Assigned)│
│      * Aksi Form: Tombol [Batal / Tutup] & Tombol [Simpan Pekerjaan]        │
│    - Daftar Kartu Log: [ 1 ] Pekerjaan Tambahan #1, Waktu, Edit & Hapus     │
│    - Empty State Box: Horizontal Mini-Strip Ramping (~50px) saat 0 item     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. PANEL 5: KARTU TRANSISI MENUJU EOD OUTCOME (Next-Step Bridge):           │
│    - Ikon Jam, Judul Tahap, Badge Waktu Mulai [Mulai 16:30 WIB]             │
│    - Penjelasan Penyetaraan Capaian Hasil (Bebas Asteris Mentah)            │
│    - Tombol Aksi Primer: [Lanjut ke EOD Outcome >]                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI RINCI PANEL & LOGIKA SISTEM

### 3.1 Panel 1: Konteks Jadwal & Status Risiko (Grid 4-Kolom Terpadu)
- **Struktur Grid:** Mengadopsi tata letak `grid-template-columns: repeat(4, 1fr)` yang responsif (menjadi 2 kolom pada tablet $\le 900\text{px}$ dan 1 kolom pada mobile $\le 540\text{px}$).
- **Item 1: Tanggal Kerja:** Menampilkan hari dan tanggal kalender dengan subteks status dinamis **`Hari Kerja Aktif`** (didukung engine kalender adaptif: *Hari Kerja Aktif*, *Libur Nasional*, *Akhir Pekan*, *Cuti Disetujui*, atau *Dispensasi Khusus*).
- **Item 2: Jendela Pencatatan:** Menampilkan jam operasional aktif `09:30 – 17:00 WIB` dengan subteks *Fleksibel · Ada Tugas Baru*.
- **Item 3: Status Komitmen Pagi:** Mengindikasikan penyerahan sesi pagi secara adil:
  - *Tepat Waktu:* `.pill.green` $\rightarrow$ `Tersimpan · Tepat Waktu` dengan subteks 1 baris rapi: `Diserahkan pukul 08:45 WIB`.
  - *Masa Toleransi:* `.pill.amber` $\rightarrow$ `Masa Toleransi` (diserahkan antara 09:01–09:30 WIB).
  - *Terlambat:* `.pill.amber` $\rightarrow$ `Terlambat (Tetap Terisi)` dengan jam submit nyata.
  - *Tidak Ada Komitmen:* `.pill.neutral` $\rightarrow$ `Tidak Ada Komitmen Pagi` (netral dan tidak menggunakan kata kaku *Baseline*).
- **Item 4: Status Risiko Hari Ini:** Mengintegrasikan status risiko harian langsung ke dalam panel (`GREEN` / `AMBER` / `RED` beserta subteks *Terkendali Mandiri* / *Perhatian* / *Risiko Tinggi*).
- **Catatan Kaki Tata Kelola Terpadu (*Integrated Footer Notice*):** Diletakkan di dasar panel dengan border pemisah tipis:
  > *"Mencatat pekerjaan tambahan tidak mengubah komitmen pagi yang telah dikunci. Seluruh item akan dievaluasi saat EOD Outcome sore nanti."*

### 3.2 Panel 3: Komitmen Pagi Terkunci (Read-Only Reference)
- **Tujuan:** Memberikan rujukan cepat bagi karyawan untuk melihat apa yang sudah mereka komitkan di pagi hari tanpa harus berpindah halaman.
- **Default Tertutup (*Collapsed by Default*):** Menghemat ruang vertikal secara drastis ($\approx 150\text{px}$) sehingga atensi langsung tertuju pada Additional Work.
- **Interaksi Toggle:** Mengklik bilah panel atau tombol `Lihat Komitmen` membuka panel dengan animasi chevron $180^\circ$ dan mengubah label menjadi `Tutup Komitmen`.
- **Penanganan Empty State:** Jika karyawan tidak mengisi sesi pagi, panel menampilkan pesan informatif netral yang menegaskan bahwa seluruh pekerjaan tambahan yang dicatat siang ini tetap akan dievaluasi secara adil saat EOD Outcome.

### 3.3 Panel 4: Slot Pekerjaan Tambahan (Daftar & Formulir)
- **Kicker Baku:** `PEKERJAAN DI LUAR KOMITMEN PAGI` (bebas dari jargon teknis *Mid-Day Ad-hoc*).
- **Header Panel & Tombol Sinkron Dinamis:**
  - Saat formulir tertutup: tombol kanan atas menampilkan **`+ Tambah Pekerjaan Tambahan`**.
  - Saat formulir terbuka: tombol otomatis berganti menjadi **`Tutup Formulir`** dengan ikon silang tipis SVG monokrom.
- **Default State Cerdas:**
  - Jika **sudah ada item tersimpan**: formulir default-nya tertutup agar karyawan langsung melihat kartu tugas yang sudah tercatat.
  - Jika **belum ada item tersimpan**: formulir default-nya terbuka agar karyawan dapat langsung mengetik, didampingi *Empty State Box* ramping saat form ditutup.

#### Formulir Input Terstandarisasi:
1. **Target Hasil Kerja `*` (Wajib):**
   - Menggantikan istilah kaku lama *Rencana Hasil Kerja (Deliverable)*.
   - Textarea dengan placeholder komunikatif: *"Apa hasil nyata atau wujud selesai dari tugas tambahan ini?"*.
   - *Role-Based Prompt Hint:* Otomatis menampilkan contoh instruksi kerja sesuai divisi aktif karyawan (Engineering, Finance, HRGA, Delivery, Ops & Infra, Sales, atau Management).
   - *Quality Warning Badge (FR-63):* Muncul secara edukatif (*non-blocking*) jika input terdeteksi terlalu pendek ($< 10$ karakter) atau generik.
2. **Alasan Pekerjaan Muncul `*` (5 Enum Resmi PRD FR-06):**
   - `Newly Assigned` $\rightarrow$ Tugas Baru Ditugaskan *(Wajib mengisi Assigned By)*.
   - `Missed in Planning` $\rightarrow$ Terlewat saat Perencanaan Pagi.
   - `Priority Change` $\rightarrow$ Perubahan Prioritas Proyek.
   - `Operational-Incident` $\rightarrow$ Insiden Operasional Mendesak.
   - `Other` $\rightarrow$ Alasan Operasional Lainnya.
3. **Panel Kondisional 'Assigned By' (Pemberi Tugas):**
   - Muncul otomatis dengan **aksen visual border-left 3px hijau brand** (`#0B8061`) dan latar belakang `#F8FAFC` hanya saat alasan `Newly Assigned` dipilih. Wajib diisi nama pimpinan/stakeholder.
4. **Tautan Referensi / Tiket Tugas (Opsional) & Quick Blocker Picker:**
   - Input URL Jira/GitLab berdampingan dengan tombol `Pilih Blocker Aktif ▾` untuk menyalin tiket kendala tim aktif secara instan dengan *smart auto-fill*.
5. **Aksi Formulir Ergonomis:**
   - Tombol sekunder `Batal / Tutup` (mereset isian dan menutup form jika sudah ada item).
   - Tombol primer `+ Simpan Pekerjaan Tambahan`. Setelah berhasil disimpan, form otomatis menutup dan item baru langsung muncul di paling atas log.

#### Fitur Sunting (*In-Place Edit*) & Pembatalan:
- Setiap kartu log dilengkapi tombol `Edit` dan `Hapus` (border merah lembut `#FECDCA`).
- Mengklik `Edit` mengaktifkan **Mode Sunting**:
  - Judul form berubah menjadi *Ubah Detail Pekerjaan Tambahan* dengan ikon pensil `✎`.
  - Badge form berubah menjadi `Mode Sunting` (warna amber).
  - Tombol aksi berubah menjadi `Perbarui Pekerjaan Tambahan` dan `Batal Sunting`.
  - Formulir otomatis digulirkan (*smooth scroll*) ke tengah layar dan input langsung difokuskan.

#### Empty State Mini-Strip Ramping (Opsi 1 Terpilih):
- Saat belum ada item yang dicatat dan formulir ditutup, sistem menampilkan strip horizontal setinggi $\approx 50\text{px}$ (bukan kotak besar 190px).
- Ikon lingkaran plus 32px di kiri dan teks penjelas 1 baris di kanan:
  > **Belum ada pekerjaan tambahan hari ini.** *Jika di sela jam kerja muncul tugas mendadak di luar rencana komitmen pagi, silakan catat melalui tombol Tambah Pekerjaan Tambahan di atas.*

### 3.4 Panel 5: Kartu Transisi Menuju EOD Outcome
- **Tujuan:** Menghubungkan alur kerja siang hari secara mulus ke tahap akhir evaluasi hari kerja.
- **Badge Status Waktu:** Memuat badge waktu resmi di samping judul: **`Tahap Selanjutnya: EOD Outcome`** + badge **`Mulai 16:30 WIB`**.
- **Bahasa Baku Bersih:** Menghapus karakter asteris mentah `(*outcome*)` menjadi kalimat yang mengalir:
  > *"Seluruh komitmen pagi dan pekerjaan tambahan otomatis diikutsertakan untuk dievaluasi capaian hasilnya pada sesi evaluasi sore hari."*
- **Navigasi Cepat:** Tombol primer `Lanjut ke EOD Outcome >` mengarah langsung ke `04-EOD-Outcome.html`.

---

## 4. KATALOG 16 SKENARIO PENGUJIAN SISTEM HALAMAN 3

| ID | Kategori | Kondisi Pengujian | Perilaku & Hasil UI yang Diharapkan |
| :--- | :--- | :--- | :--- |
| **TC-01** | Navigasi | Masuk pasca-Morning Commitment | Tab 1 centang hijau (`completed`), Tab 2 aktif hijau (`active`), identitas user terhubung. |
| **TC-02** | Konteks | Kalender Hari Kerja Adaptif | Menampilkan `Hari Kerja Aktif` (atau jenis cuti/libur/dispensasi sesuai state sistem). |
| **TC-03** | Konteks | Subteks Status Pagi 1 Baris | Menampilkan `Diserahkan pukul 08:45 WIB` rapi dalam 1 baris tanpa wrapping teks. |
| **TC-04** | Konteks | Integrasi Status Risiko Grid 4-Kolom | Status risiko harian tampil terpadu di kolom ke-4 Panel 1 (GREEN/AMBER/RED). |
| **TC-05** | Referensi | Komitmen Pagi Collapsible | Default tertutup. Klik toggle membuka kartu komitmen dengan chevron berputar $180^\circ$. |
| **TC-06** | Referensi | Sesi Pagi Terlewat (*No Submission*) | Panel 3 menampilkan empty state netral dan suportif (bukan error). |
| **TC-07** | Form UX | Default State Form Dinamis | Form tertutup jika sudah ada item tersimpan, terbuka jika belum ada item tersimpan. |
| **TC-08** | Form UX | Sinkronisasi Tombol Header | Tombol berubah dinamis antara `+ Tambah Pekerjaan Tambahan` dan `Tutup Formulir`. |
| **TC-09** | Validasi | Target Hasil Kerja Kosong | Alert merah lembut `#FFF8F8`: *"Target hasil kerja pekerjaan tambahan wajib diisi."* |
| **TC-10** | Validasi | Alasan Belum Dipilih | Alert merah lembut: *"Silakan pilih alasan resmi pekerjaan ini muncul."* |
| **TC-11** | Kondisional | Pemilihan 'Newly Assigned' | Panel *Assigned By* muncul dengan border kiri hijau 3px, input berstatus `required`. |
| **TC-12** | Validasi | Newly Assigned Tanpa Pemberi Tugas | Alert merah lembut: *"Pemberi tugas (Assigned By) wajib diisi..."* dan input difokuskan. |
| **TC-13** | Edukasi | Deteksi Teks Pendek / Generik | Quality warning kuning muncul di bawah textarea secara *non-blocking*. |
| **TC-14** | Referensi | Quick-Picker Blocker Tim | Dropdown blocker aktif terbuka, klik tiket mengisi input referensi dan auto-fill deskripsi. |
| **TC-15** | Log & Edit | In-Place Edit Mode | Klik `Edit` mengubah form ke *Mode Sunting* (badge amber, tombol `Perbarui` & `Batal Sunting`). |
| **TC-16** | Empty State | Hapus Seluruh Item di Log | Item terhapus, counter menjadi 0, dan *Horizontal Mini-Strip Empty State* (~50px) muncul. |

---

## 5. KONTRAK DATA & SPESIFIKASI BACKEND

### 5.1 Skema Data Objek Additional Work (`localStorage: workpulse_additional_work_items`)
Setiap kali karyawan menyimpan item tambahan, data disimpan dalam bentuk array of objects:

```json
[
  {
    "id": 1792340655548,
    "description": "Pengujian performa query report transaksi bulanan",
    "reason": "Operational-Incident",
    "assignedBy": "",
    "reference": "[#BLK-014] Keterlambatan respons spesifikasi API dari klien X",
    "time": "14:25"
  }
]
```

### 5.2 Spesifikasi Endpoint API Backend

#### 1. POST `/api/v1/today/additional-work`
- **Fungsi:** Menyimpan catatan pekerjaan tambahan ke database harian (*append-only audit log*).
- **Request Payload:**
  ```json
  {
    "target_hasil_kerja": "Investigasi spike CPU 90% pada service otentikasi",
    "alasan": "Newly Assigned",
    "assigned_by": "Pak Joko (Engineering Manager)",
    "referensi_url": "https://jira.dutamedia.com/browse/DEV-889"
  }
  ```
- **Response 201 Created:**
  ```json
  {
    "success": true,
    "data": {
      "item_id": "adw_991823",
      "recorded_at": "2026-10-18T14:25:00+07:00",
      "recorded_by": "budi.pratama@dutamedia.com"
    }
  }
  ```

#### 2. PUT `/api/v1/today/additional-work/{item_id}`
- **Fungsi:** Memperbarui detail pekerjaan tambahan sebelum EOD disubmit (*in-place edit*).
- **Aturan Otorisasi:** Hanya diizinkan jika status harian belum `EOD_SUBMITTED`.

#### 3. DELETE `/api/v1/today/additional-work/{item_id}`
- **Fungsi:** Membatalkan/menghapus item sebelum evaluasi sore disubmit.
- **Aturan Otorisasi:** Hanya diizinkan sebelum batas waktu pengisian EOD Outcome terkunci.

---

*Dokumen ini merupakan spesifikasi implementasi resmi untuk Halaman 03 WorkPulse. Seluruh implementasi telah diselaraskan penuh dengan [`Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md).*
