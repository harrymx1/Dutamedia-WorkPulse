# Penjelasan Halaman 05: Raise Instant Blocker

## 1. IKHTISAR & PERAN DALAM SISTEM WORKPULSE

**Halaman 05 (`05-Raise-Instant-Blocker.html`)** adalah gerbang pelaporan kedaruratan operasional (*Emergency & Fast-Track Support Gateway*) yang berfungsi memfasilitasi karyawan (*Reporter*) untuk melaporkan kendala kritis, dependensi tertahan, atau risiko operasional kapan saja sepanjang siklus hari kerja.

### Posisi Strategis Halaman 05:
1. **Aksesibilitas 24/7 di Luar Siklus Harian (PRD FR-15 & BR-04):** Dapat diakses kapan saja tanpa harus menunggu waktu check-in Morning Commitment (08:00–09:00 WIB) atau EOD Outcome (16:30–18:00 WIB), bahkan saat status harian sudah terkunci (*locked state*).
2. **Pemicu Notifikasi Instan (*Immediate Multi-Channel Dispatch* — PRD FR-20):** Laporan dengan keparahan *Critical* atau *High* langsung mengirimkan notifikasi instan (**Email + Browser Push**) ke gawai penanggung jawab berwenang (*Owner Needed*).
3. **Penyedia Pool Tiket Blocker Tim:** Setiap laporan sukses menghasilkan nomor tiket unik (format: `#BLK-YYYY-XXXX`) yang otomatis tersimpan ke `localStorage: workpulse_active_blockers` dan dapat langsung dipilih pada dropdown *Pilih Blocker Aktif* di Halaman 02, 03, dan 04.
4. **Pemicu Siklus Akuntabilitas Eskalasi (PRD FR-17 & FR-21):** Menginisiasi timer batas waktu pengakuan (*Acknowledgment SLA Threshold*). Jika kendala *Critical* tidak diakui atasan dalam batas waktu yang ditentukan, sistem secara otomatis mengeksekusi *Auto-Escalate* ke tingkat pimpinan divisi (*Level 2: Head of Department*).

---

## 2. ANATOMI TATA LETAK & HIERARKI VISUAL

Tata letak halaman dirancang dengan arsitektur **Fluid Single-Column Canvas** yang bersih, bebas dari unsur prototipe, dan selaras 100% dengan Halaman 01 s/d 04:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Breadcrumb (Workspace / Blocker & Support / Raise Instant Blocker)  │
│         [Lonceng Notifikasi + Dot]  [Avatar Pengguna Dinamis (AD)]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ HEADER: Kicker: BLOCKER & ESCALATION MANAGEMENT                             │
│         Judul: Raise Instant Blocker                                        │
│         Subteks: Laporkan hambatan operasional, dependensi teknis...        │
│         Badges: [● Akses Kapan Saja (24/7)] [Tiket Resmi]                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ BANNER PANDUAN: Penjelasan Jalur Cepat Kedaruratan (FR-15 & BR-04)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. PANEL 1: DETAIL KENDALA & DAMPAK (FR-16 & AC-55)                         │
│    - Tautan Komitmen Hari Ini (Opsional - linkedCommitmentId)                │
│    - Judul Blocker (Maks. 140 karakter) [Live Counter: 0 / 140]             │
│    - Tipe Kendala (10 Enum Taksonomi Baku PRD FR-16)                        │
│    - Tingkat Keparahan (Severity 4 Segmented Cards: Critical/High/Med/Low)  │
│    - Kategori Dampak Utama (7 Enum Taksonomi Baku PRD FR-16)                │
│    - Target Waktu Penyelesaian (Opsional - ISO Date YYYY-MM-DD)             │
│    - Deskripsi Masalah & Upaya [Live Counter: 0 / 15 karakter minimal]       │
│    - Tindakan / Bantuan Konkret yang Diharapkan (Opsional)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PANEL 2: PENANGGUNG JAWAB AWAL & RUTE PENUGASAN (FR-19 & AC-58..61)      │
│    - Authority Context: [● Organizational Authority] vs [○ Project Authority]│
│    - Dropdown Proyek Terdaftar (Kondisional wajib jika Project Authority)   │
│    - Pemilihan Orang Tertentu (Opsional — default: Tidak memilih orang)     │
│    - Live Route Preview Box (Rute penugasan deterministik + SLA hint)       │
│    - Notice Protokol Eskalasi Otomatis (FR-20 & FR-21)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. STICKY FOOTER BAR:                                                       │
│    - Status Awal: Open · SLA Timer aktif pasca pengiriman                   │
│    - Tombol Aksi: [Bersihkan Formulir] & [Kirim Laporan Blocker (Panah →)]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. KARTU TIKET BLOCKER RESMI (Tampil Pasca Submit Sukses):                  │
│    - Header Hijau Hutan: Nomor Tiket (#BLK-2026-XXXX) & Status Open          │
│    - Ringkasan 4 Kolom: Tipe, Kategori Dampak, Owner Needed, Waktu Lapor    │
│    - Kutipan Deskripsi Masalah                                               │
│    - SLA Timer Banner: Hitung mundur sisa waktu sebelum eskalasi otomatis   │
│    - Tombol Tindakan: [+ Laporkan Blocker Lain] & [Kembali ke Ruang Kerja]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ATURAN BISNIS & INTEGRASI SISTEM (ENGINE RULES)

### 3.1 Taksonomi 10 Tipe Resmi Blocker (PRD FR-16 & AC-55)
Formulir menerapkan 10 enum resmi PRD tanpa penambahan opsi spekulatif di luar spesifikasi:
1. **`Technical`**: Masalah teknis, bug kode sumber, arsitektur data, atau kegagalan kompilasi.
2. **`Requirement`**: Kebutuhan fitur ambigu, spesifikasi PRD berubah, atau kriteria penerimaan belum jelas.
3. **`Client`**: Keterlambatan umpan balik, approval tertahan, atau perubahan sepihak dari pihak klien.
4. **`Vendor`**: Ketergantungan pada pihak ketiga, API eksternal mengalami gangguan, atau masalah lisensi.
5. **`Resource`**: Keterbatasan personil, beban kerja overload, atau ketiadaan alat kerja.
6. **`Approval`**: Dokumen atau izin manajerial menunggu verifikasi atau tanda tangan resmi.
7. **`Infra`**: Server down, lingkungan staging tidak stabil, kendala jaringan VPN, atau gangguan cloud.
8. **`Finance`**: Pembayaran tertunda, pengadaan anggaran macet, atau termin pembayaran invoice.
9. **`Legal`**: Kepatuhan hukum, perjanjian kerahasiaan (NDA), atau sengketa klausul kontrak.
10. **`Other`**: Kendala operasional lainnya di luar 9 kategori di atas.

### 3.2 Taksonomi 7 Kategori Dampak Utama (PRD FR-16 & AC-55)
Pengguna wajib mengklasifikasikan skala dampak hambatan:
1. **`Task`**: Menghambat penyelesaian 1 tugas komitmen tertentu.
2. **`Milestone`**: Mengancam target tonggak capaian fase atau sprint berjalan.
3. **`Project`**: Berisiko menunda jadwal keseluruhan proyek.
4. **`Production`**: Mengganggu operasional live produk atau lingkungan pengguna akhir (*outage*).
5. **`Client`**: Berpotensi merusak kepuasan, kepercayaan, atau kontrak dengan klien.
6. **`Financial`**: Berpotensi menimbulkan pembengkakan biaya atau penalti denda keterlambatan.
7. **`Compliance`**: Berisiko melanggar regulasi eksternal atau standar kepatuhan internal.

### 3.3 Tingkat Keparahan (Severity) 4 Segmen Visual (PRD FR-16)
Penyajian tingkat kedaruratan menggunakan **Segmented Radio Cards** kontras:
* **`Critical` (Merah Marun `#991B1B`):** Pekerjaan terhenti total, memicu notifikasi instan push & email ke atasan dan memulai timer auto-eskalasi ketat.
* **`High` (Amber `#B45309`):** Hambatan berat pada target utama harian/mingguan tanpa solusi alternatif mandiri.
* **`Medium` (Biru Lembut `#1D4ED8`):** Hambatan parsial, karyawan masih dapat mengerjakan tugas komitmen lainnya.
* **`Low` (Slate Netral `#475569`):** Kendala minor atau ketidaknyamanan operasional berisiko rendah.

### 3.4 Jalur Kewenangan & Penentuan Owner Needed (PRD FR-19 & AC-58..61)
Sistem menerapkan protokol penentuan penanggung jawab yang deterministik:
1. **Organizational Authority (Default):**
   - Menugaskan secara otomatis kepada **Direct Manager (Level 1)** pelapor.
   - Pilihan orang manual dibatasi pada atasan dalam struktur hierarki yang sah.
2. **Project Authority (Eksplisit):**
   - Wajib memilih proyek terdaftar (`relatedScopeReference`).
   - Sistem menugaskan secara otomatis kepada **Project Lead / Authority** yang aktif pada pemetaan proyek tersebut.
3. **Penunjukan Orang Tertentu Bersifat Opsional (FR-19 & AC-60):**
   - Label default: **`"Tidak memilih orang tertentu (Sistem menentukan otomatis)"`**.
   - Dilarang membuat opsi terpisah "Biarkan sistem menentukan". Jika dikosongkan, kotak preview rute langsung menampilkan nama penanggung jawab hasil kalkulasi sistem.
4. **Live Route Preview Box:**
   - Menampilkan identitas penerima, status rute (*Ditentukan Otomatis* vs *Ditunjuk Manual*), serta catatan SLA pengakuan.

### 3.5 Validasi Kualitas Masukan (Input Quality Gates)
- **Judul Blocker:** Wajib diisi, maksimal 140 karakter dengan live counter.
- **Deskripsi Masalah:** Wajib diisi, **minimal 15 karakter**. Live counter interaktif akan berubah hijau saat mencapai $\ge 15$ karakter untuk mencegah masukan teks asal atau tidak bermakna.
- **Validasi Proyek:** Jika memilih Project Authority, pemilihan proyek menjadi wajib.

### 3.6 Konfirmasi Pasca-Submit & Integrasi Antar-Halaman
- Setelah berhasil disubmit, formulir berganti ke **Kartu Tiket Blocker Resmi** yang memuat:
  - Nomor Tiket Unik `#BLK-2026-XXXX`.
  - Status awal **`Open`**.
  - Rincian metadata 4 kolom dan ringkasan deskripsi masalah.
  - Timer hitung mundur SLA pengakuan.
- Data tiket otomatis disimpan ke `localStorage: workpulse_active_blockers` sehingga langsung muncul di dropdown *Pilih Blocker Aktif* di Halaman 02, 03, dan 04.

---

## 4. KATALOG 10 SKENARIO PENGUJIAN SISTEM (TEST CASES)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respon Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Validasi Form Kosong | Mengklik tombol submit tanpa mengisi field apa pun | Tombol submit memicu toast peringatan amber ("Lengkapi seluruh field wajib bertanda bintang merah"), border merah menyala pada field wajib, fokus melompat ke Judul. |
| **TC-02** | Validasi Deskripsi < 15 Karakter | Mengisi judul dan tipe, tapi deskripsi hanya "server mati" (11 karakter) | Live counter deskripsi berwarna merah ("11 / 15 karakter minimal"), form memblokir submit, pesan error field muncul. |
| **TC-03** | Live Counter Deskripsi $\ge 15$ Karakter | Mengetik deskripsi hingga 15 karakter atau lebih | Live counter deskripsi seketika berubah warna menjadi hijau (`#0B8061`), pesan error hilang otomatis. |
| **TC-04** | Segmented Severity Switcher | Mengklik kartu keparahan Critical (merah) | Kartu Critical menyala merah marun dengan lingkaran centang putih, radio value terekam sebagai `Critical`. |
| **TC-05** | Organizational Authority Default Route | Memilih Organizational Authority + Tidak memilih orang tertentu | Live Route Preview menampilkan: *Rina Putri — Direct Manager (Level 1)* dengan badge *Ditentukan Otomatis · Level 1*. |
| **TC-06** | Project Authority Wajib Pilih Proyek | Mengklik Project Authority tanpa memilih proyek dari dropdown | Dropdown proyek muncul dengan label wajib (*), Live Route Preview menampilkan state peringatan amber ("Konteks Proyek Diperlukan"), submit diblokir jika proyek belum dipilih. |
| **TC-07** | Project Authority Deterministic Routing | Memilih proyek "Website Customer Portal & Client Billing" | Live Route Preview otomatis berganti menampilkan *Bima Santoso — Project Lead Portal* dengan badge *Ditentukan Otomatis · Project Lead*. |
| **TC-08** | Penunjukan Orang Tertentu (Manual Selection) | Memilih personil manual dari dropdown penanggung jawab | Live Route Preview berubah mode: ikon centang ungu/biru, judul "Penerima Dipilih Secara Manual", badge *Ditunjuk Manual · Terverifikasi*. |
| **TC-09** | Pengiriman Sukses (End-to-End Submit) | Seluruh field wajib terisi lengkap $\rightarrow$ klik submit | Form utama disembunyikan, Kartu Tiket Blocker Resmi (#BLK-2026-XXXX) muncul dengan animasi lembut, status Open, dan toast sukses hijau muncul di kanan bawah. |
| **TC-10** | Bersihkan Formulir (Reset Form) | Mengklik tombol [Bersihkan Formulir] | Seluruh field kembali kosong, radio kembali ke default (Medium & Organizational), seluruh pesan error terhapus, counter ter-reset ke 0, dan toast sukses muncul. |

---

## 5. HUBUNGAN DENGAN HALAMAN LAIN (CROSS-PAGE CONTRACTS)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Halaman 05 membaca profil pengguna aktif dari `localStorage: workpulse_active_user` (nama, avatar, departemen) untuk menentukan hierarki atasan langsung secara akurat. |
| **Halaman 02 (Morning Commitment)** | Tombol darurat merah di kanan atas Halaman 02 mengarahkan langsung ke Halaman 05. Tiket baru yang terdaftar di Halaman 05 otomatis menjadi opsi tiket di dropdown *Pilih Blocker Aktif* Halaman 02. |
| **Halaman 03 (Additional Work)** | Tugas tambahan dapat mengaitkan tiket blocker aktif yang dilaporkan di Halaman 05 ini. |
| **Halaman 04 (EOD Outcome)** | Evaluasi sore hari membaca blocker aktif (Open/Acknowledged/In Progress) untuk menentukan kalkulasi Rekomendasi Status Sistem (Critical Blocker $\rightarrow$ RED). |
| **Halaman 07 (Notifications)** | Tiket blocker Critical yang dibuat di Halaman 05 memicu entri notifikasi push berprioritas tinggi pada Notification Center. |
| **Halaman 09 (Blocker Escalation Queue)** | Tiket baru berstatus `Open` langsung masuk ke dalam antrean tinjauan manajer pada Halaman 09 untuk dilakukan *Acknowledge* atau penugasan *Support Contribution*. |

---
*Dokumen ini merupakan bagian resmi dari spesifikasi teknis dan perancangan antarmuka WorkPulse.*
