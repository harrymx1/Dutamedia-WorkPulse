# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 05: RAISE INSTANT BLOCKER & MY BLOCKERS

- **Berkas Prototipe:** [`05-Raise-Instant-Blocker.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/05-Raise-Instant-Blocker.html)
- **Rute Sistem:** `/blockers/raise` (`#report`), `/blockers/my-list` (`#my-blockers`)
- **Posisi Alur:** Jalur Kedaruratan & Pemantauan Kendala Kerja (*Emergency Escalation & Support Gateway*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Aksesibilitas 24/7 di Luar Siklus Harian (PRD FR-15 & BR-04):** Memfasilitasi karyawan (*Reporter*) untuk melaporkan hambatan kritis, dependensi tertahan, atau risiko operasional kapan saja sepanjang hari tanpa terikat jam check-in pagi/sore atau status penguncian harian.
2. **Pemicu Notifikasi Instan Multi-Kanal (PRD FR-20):** Laporan berkategori *Critical* atau *High* memicu pengiriman notifikasi instan (**Email + Browser Push**) ke gawai penanggung jawab berwenang (*Owner Needed*).
3. **Penyedia Pool Tiket Kendala Tim:** Setiap laporan menghasilkan tiket resmi (`#BLK-YYYY-XXXX`) yang otomatis tersimpan ke `localStorage: workpulse_active_blockers` dan dapat langsung dipilih pada dropdown *Pilih Blocker Aktif* di Halaman 02, 03, dan 04.
4. **Pemicu Siklus Akuntabilitas Eskalasi (PRD FR-17 & FR-21):** Menginisiasi penghitung mundur batas waktu pengakuan (*Acknowledgment SLA Threshold*). Jika kendala *Critical* tidak diakui atasan dalam batas waktu yang ditentukan, sistem mengeksekusi *Auto-Escalate* ke tingkat pimpinan divisi (*Level 2: Head of Department*).

### 1.2 Batasan Desain Baku
- **Arsitektur SPA Dual-Subpage Hash Router:** Mengintegrasikan formulir pembuatan laporan baru (`#report`) dan daftar pemantauan blocker pribadi (`#my-blockers`) tanpa reload halaman (*zero-reload*).
- **Nol Emoticon & Ikon Monokrom:** Seluruh tombol dan label blocker menggunakan ikon bendera (*flag*) monokrom (`stroke-width="1.8-2.2"`), bersih total dari simbol petir (`⚡`).
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada kartu Critical dan pesan error.
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis kaku.

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Breadcrumb (Workspace / My Blockers atau Raise Instant Blocker)     │
│         [Lonceng Notifikasi + Dot]  [Avatar Pengguna Dinamis (BP)]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ TAB ROUTER NAVIGASI ATAS:                                                   │
│ [ Buat Laporan Baru (#report) ]   [ Daftar Blocker Saya (#my-blockers) (2) ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ =========================================================================== │
│ SUB-TAMPILAN 1: FORMULIR PELAPORAN BLOCKER (#report)                        │
│ =========================================================================== │
│ 1. HEADER: Kicker: BLOCKER & ESCALATION MANAGEMENT                          │
│    Judul: Raise Instant Blocker                                             │
│    Badges: [● Akses Kapan Saja (24/7)] [Tiket Resmi Sistem]                 │
│ 2. BANNER PANDUAN: Maklumat Jalur Cepat Kedaruratan (FR-15 & BR-04)         │
│ 3. PANEL 1: DETAIL KENDALA & DAMPAK (FR-16 & AC-55):                        │
│    - Tautan Komitmen Hari Ini (Opsional - linkedCommitmentId)               │
│    - Judul Blocker (Maks. 140 karakter) [Live Counter: 0 / 140]            │
│    - Tipe Kendala (10 Enum Taksonomi Baku PRD FR-16)                       │
│    - Tingkat Keparahan (Severity 4 Segmented Cards: Critical/High/Med/Low) │
│    - Kategori Dampak Utama (7 Enum Taksonomi Baku PRD FR-16)               │
│    - Target Waktu Penyelesaian (Opsional - ISO Date YYYY-MM-DD)            │
│    - Deskripsi Masalah & Upaya [Live Counter: 0 / 15 karakter minimal]      │
│    - Tindakan / Bantuan Konkret yang Diharapkan (Opsional)                 │
│ 4. PANEL 2: PENANGGUNG JAWAB AWAL & RUTE PENUGASAN (FR-19 & AC-58..61):     │
│    - Authority Context: [● Organizational Authority] vs [○ Project Auth]    │
│    - Dropdown Proyek Terdaftar (Kondisional wajib jika Project Authority)  │
│    - Pemilihan Orang Tertentu (Opsional — default: Tidak memilih orang)    │
│    - Live Route Preview Box (Rute penugasan deterministik + SLA hint)      │
│    - Notice Protokol Eskalasi Otomatis (FR-20 & FR-21)                     │
│ 5. STICKY FOOTER BAR:                                                      │
│    - Status Awal: Open · SLA Timer aktif pasca pengiriman                  │
│    - Tombol Aksi: [Bersihkan Formulir] & [Kirim Laporan Blocker (Panah →)] │
│ 6. KARTU TIKET BLOCKER RESMI (Tampil Pasca Submit Sukses):                 │
│    - Header Hijau Hutan: Nomor Tiket (#BLK-2026-XXXX) & Status Open         │
│    - Ringkasan 4 Kolom: Tipe, Kategori Dampak, Owner Needed, Waktu Lapor   │
│    - Kutipan Deskripsi Masalah                                              │
│    - SLA Timer Banner: Hitung mundur sisa waktu sebelum eskalasi otomatis  │
│    - Tombol Tindakan: [+ Laporkan Blocker Lain] & [Lihat Daftar Blocker Saya]│
├─────────────────────────────────────────────────────────────────────────────┤
│ =========================================================================== │
│ SUB-TAMPILAN 2: DAFTAR BLOCKER SAYA (#my-blockers)                          │
│ =========================================================================== │
│ 1. HEADER: Kicker: BLOCKER & SUPPORT ARCHIVE, Judul: Daftar Blocker Saya    │
│    Aksi Kanan: [ + Buat Laporan Baru ]                                      │
│ 2. FILTER PILLS TOOLBAR:                                                    │
│    [ Semua (3) ]   [ Open / Dalam Penanganan (2) ]   [ Resolved (1) ]       │
│ 3. DAFTAR KARTU BLOCKER:                                                    │
│    - Nomor Tiket (#BLK-2026-0042) · Badge Severity & Status                │
│    - Judul Kendala, Authority Context, & Tanggal Lapor                      │
│    - Countdown SLA Pengakuan / Resolusi                                     │
│    - Tombol Aksi: [ Buka Detail Tiket ]                                     │
│ 4. MODAL DETAIL TIKET BLOCKER (#modal-blocker-detail):                      │
│    - Dialog terisolasi dengan backdrop blur                                 │
│    - Rincian lengkap: Kronologi SLA, Dampak, Owner, Respon Atasan          │
│    - Tombol Tutup dialog                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.1 Taksonomi 10 Tipe Resmi Blocker (PRD FR-16 & AC-55)
1. **`Technical`**: Masalah teknis, bug kode sumber, arsitektur data, atau kegagalan kompilasi.
2. **`Requirement`**: Kebutuhan fitur ambigu, spesifikasi PRD berubah, atau kriteria penerimaan belum jelas.
3. **`Client`**: Keterlambatan umpan balik, approval tertahan, atau perubahan sepihak dari klien.
4. **`Vendor`**: Ketergantungan pada pihak ketiga, API eksternal gangguan, atau masalah lisensi.
5. **`Resource`**: Keterbatasan personil, beban kerja overload, atau ketiadaan alat kerja.
6. **`Approval`**: Dokumen atau izin manajerial menunggu verifikasi atau tanda tangan resmi.
7. **`Infra`**: Server down, lingkungan staging tidak stabil, kendala jaringan VPN/cloud.
8. **`Finance`**: Pembayaran tertunda, pengadaan anggaran macet, atau invoice tertahan.
9. **`Legal`**: Kepatuhan hukum, perjanjian kerahasiaan (NDA), atau sengketa klausul kontrak.
10. **`Other`**: Kendala operasional lainnya di luar 9 kategori di atas.

### 3.2 Taksonomi 7 Kategori Dampak Utama (PRD FR-16 & AC-55)
1. **`Task`**: Menghambat penyelesaian 1 tugas komitmen tertentu.
2. **`Milestone`**: Mengancam target tonggak capaian fase atau sprint berjalan.
3. **`Project`**: Berisiko menunda jadwal keseluruhan proyek.
4. **`Production`**: Mengganggu operasional live produk atau lingkungan pengguna akhir (*outage*).
5. **`Client`**: Berpotensi merusak kepuasan, kepercayaan, atau kontrak klien.
6. **`Financial`**: Berpotensi menimbulkan pembengkakan biaya atau denda keterlambatan.
7. **`Compliance`**: Berisiko melanggar regulasi eksternal atau standar kepatuhan internal.

### 3.3 Tingkat Keparahan (Severity) 4 Segmen Visual (PRD FR-16)
* **`Critical` (Merah Marun `#991B1B`):** Pekerjaan terhenti total; memicu notifikasi instan push & email ke atasan dan memulai timer auto-eskalasi ketat.
* **`High` (Amber `#B45309`):** Hambatan berat pada target utama tanpa solusi alternatif mandiri.
* **`Medium` (Biru Lembut `#1D4ED8`):** Hambatan parsial; karyawan masih dapat mengerjakan tugas lain.
* **`Low` (Slate Netral `#475569`):** Kendala minor atau ketidaknyamanan operasional berisiko rendah.

### 3.4 Jalur Kewenangan & Penentuan Owner Needed (PRD FR-19 & AC-58..61)
1. **Organizational Authority (Default):**
   - Menugaskan secara otomatis kepada **Direct Manager (Level 1)** pelapor.
   - Pilihan orang manual dibatasi pada atasan dalam struktur hierarki yang sah.
2. **Project Authority (Eksplisit):**
   - Wajib memilih proyek terdaftar (`relatedScopeReference`).
   - Sistem menugaskan secara otomatis kepada **Project Lead / Authority** aktif pada pemetaan proyek tersebut.
3. **Penunjukan Orang Tertentu Opsional (FR-19 & AC-60):**
   - Label default: **`"Tidak memilih orang tertentu (Sistem menentukan otomatis)"`**.
4. **Live Route Preview Box:** Menampilkan identitas penerima, status rute, dan catatan SLA secara real-time.

### 3.5 Validasi Kualitas Masukan (Input Quality Gates)
- **Judul Blocker:** Wajib diisi, maksimal 140 karakter dengan live counter.
- **Deskripsi Masalah:** Wajib diisi, **minimal 15 karakter**. Live counter interaktif berubah warna hijau saat $\ge 15$ karakter untuk mencegah masukan teks asal.
- **Validasi Proyek:** Jika memilih Project Authority, pemilihan proyek menjadi wajib.

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Validasi Form Kosong | Klik submit tanpa mengisi field apa pun | Toast peringatan amber muncul, border merah pada field wajib, fokus melompat ke Judul. |
| **TC-02** | Validasi Deskripsi < 15 Karakter | Deskripsi hanya 11 karakter (misal: "server mati") | Live counter berwarna merah ("11 / 15 karakter minimal"), submit diblokir, error teks tampil. |
| **TC-03** | Counter Deskripsi $\ge 15$ Karakter | Ketik deskripsi hingga 15 karakter atau lebih | Live counter berubah hijau (`#0B8061`), pesan error hilang otomatis. |
| **TC-04** | Segmented Severity Switcher | Klik kartu keparahan Critical (merah) | Kartu Critical aktif menyala merah marun dengan lingkaran centang putih. |
| **TC-05** | Organizational Default Route | Organizational Auth + Tanpa orang tertentu | Live Route Preview menampilkan: *Rina Putri — Direct Manager (Level 1)* (Ditentukan Otomatis). |
| **TC-06** | Project Auth Wajib Pilih Proyek | Klik Project Auth tanpa memilih proyek | Dropdown proyek bertanda bintang wajib, Live Route Preview amber, submit diblokir jika kosong. |
| **TC-07** | Project Deterministic Routing | Memilih proyek "Customer Portal" | Live Route Preview berganti menampilkan: *Bima Santoso — Project Lead Portal*. |
| **TC-08** | Penunjukan Orang Manual | Memilih personil dari dropdown | Live Route Preview berubah mode: ikon centang ungu, badge *Ditunjuk Manual · Terverifikasi*. |
| **TC-09** | Pengiriman Sukses | Seluruh field wajib terisi $\rightarrow$ klik submit | Form disembunyikan, Kartu Tiket Blocker Resmi (#BLK-2026-XXXX) muncul dengan animasi lembut, status Open. |
| **TC-10** | Bersihkan Formulir (Reset Form) | Klik tombol [Bersihkan Formulir] | Seluruh field kembali kosong, radio kembali ke default (Medium & Organizational), counter reset ke 0. |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Membaca profil aktif dari `localStorage: workpulse_active_user` untuk menentukan hierarki atasan langsung. |
| **Halaman 02 (Morning Commitment)** | Tombol darurat merah di kanan atas Halaman 02 mengarahkan langsung ke Halaman 05. Tiket baru otomatis muncul di dropdown *Pilih Blocker Aktif* Halaman 02. |
| **Halaman 03 (Additional Work)** | Tugas tambahan dapat mengaitkan tiket blocker aktif yang dilaporkan di Halaman 05. |
| **Halaman 04 (EOD Outcome)** | Membaca blocker aktif untuk kalkulasi Rekomendasi Status Sistem (Critical Blocker $\rightarrow$ RED). |
| **Halaman 06 (My History)** | Tiket blocker dan riwayat resolusinya ditampilkan pada panel kendala di rincian histori harian. |
| **Halaman 07 (Notifications)** | Tiket Critical memicu notifikasi push berprioritas tinggi pada Notification Center. |
| **Halaman 08 (Pulse Dashboard)** | Menyuplai data blocker aktif tim ke Widget 3 (*Blockers by Support Owner*) dan Widget 2 (*Top Recurring Blockers*). |
| **Halaman 09 (Escalation Queue)** | Tiket baru berstatus `Open` langsung masuk ke antrean tinjauan manajer pada Halaman 09 untuk diakui (*Acknowledge*) atau ditindaklanjuti. |
| **Halaman 13 (Project Risk View)** | Kendala yang mengaitkan proyek terdaftar otomatis terhubung ke matriks pemantauan risiko pengiriman proyek. |
| **Halaman 14 (Escalation Aging)** | Menyuplai data kendala yang mengalami penuaan waktu (*aging*) melebihi ambang batas toleransi respon SLA (24 jam / 48 jam). |
| **Halaman 15 (Admin Mapping)** | Menggunakan struktur atasan langsung (*Organizational Authority*) dan penanggung jawab proyek (*Project Authority*) yang dipetakan di Halaman 15. |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 Endpoint Pembuatan Tiket Blocker Baru
- **Rute:** `POST /api/v1/blockers`
- **Request Payload (JSON):**
```json
{
  "title": "Akses staging database timeout sejak pk 13:00",
  "blockerType": "Infra",
  "severity": "Critical",
  "impactCategory": "Production",
  "targetResolutionDate": "2026-10-21",
  "description": "Koneksi ke instance staging-db-01 menolak koneksi socket pool, menghambat verifikasi hotfix.",
  "expectedSupport": "Restart service PostgreSQL dan verifikasi firewall internal dari tim DevOps.",
  "authorityContext": "Organizational",
  "projectId": null,
  "assignedPersonId": null,
  "linkedCommitmentId": "mc-slot-1"
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Tiket Blocker berhasil dilaporkan.",
  "data": {
    "ticketId": "BLK-2026-0045",
    "status": "Open",
    "reporter": {
      "id": "usr_1001",
      "name": "Budi Pratama"
    },
    "ownerNeeded": {
      "id": "usr_2004",
      "name": "Rina Putri",
      "role": "Direct Manager (Level 1)",
      "isManual": false
    },
    "createdAt": "2026-10-21T13:15:00+07:00",
    "acknowledgmentSlaMinutes": 60,
    "slaDeadline": "2026-10-21T14:15:00+07:00"
  }
}
```

### 6.2 Endpoint Daftar Blocker Saya (*My Blockers List*)
- **Rute:** `GET /api/v1/blockers/my-list`
- **Query Parameters:** `status=all|open|resolved`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "ticketId": "BLK-2026-0042",
      "title": "Staging server staging-db02 tidak dapat diakses",
      "blockerType": "Infra",
      "severity": "Critical",
      "status": "In Progress",
      "authorityContext": "Organizational",
      "ownerName": "Rina Putri",
      "createdAt": "2026-10-21T09:12:00+07:00",
      "slaRemainingMinutes": 25
    }
  ]
}
```

### 6.3 Endpoint Rincian Tiket Blocker (*Blocker Detail Modal*)
- **Rute:** `GET /api/v1/blockers/{ticketId}`
- **Response Success (HTTP 200 OK):** Mengembalikan rincian lengkap kendala, kronologi penanganan SLA, riwayat eskalasi, dan catatan respons atasan.

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Raise Instant Blocker dan Daftar Blocker Saya. Seluruh spesifikasi pada berkas [`05-Raise-Instant-Blocker.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/05-Raise-Instant-Blocker.html) telah teruji secara visual dan fungsional di peramban, bebas error, serta siap diintegrasikan secara terpadu ke frontend dan backend.
