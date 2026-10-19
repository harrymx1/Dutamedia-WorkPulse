# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 03: MY TODAY — ADDITIONAL WORK

- **Berkas Prototipe:** [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html)
- **Rute Sistem:** `/today/additional`
- **Posisi Alur:** Langkah 2 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Mencatat Tugas Tak Terduga di Sela Jam Kerja (*Mid-day Ad-hoc*):** Menampung penugasan mendadak, insiden operasional, atau perubahan prioritas yang terjadi setelah Morning Commitment dikunci (09:30–17:00 WIB).
2. **Menjaga Kemurnian Baseline Pagi (PRD FR-07 & BR-01):** Pekerjaan tambahan **bukan slot komitmen ke-4** dan **tidak pernah mengubah atau merusak baseline komitmen pagi** yang sudah terkunci.
3. **Penyetaraan Evaluasi Sore (PRD FR-08):** Seluruh item yang tercatat otomatis disalurkan ke evaluasi akhir (**Halaman 04: EOD Outcome**) dengan bobot capaian yang setara dengan komitmen utama.

### 1.2 Batasan Desain Baku
- **Bersifat Fleksibel & Opsional:** Karyawan tidak diwajibkan mengisi jika tidak ada tugas baru di sela jam kerja.
- **Nol Emoticon / Emoji:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom.
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada tombol hapus dan pesan error.
- **Penghematan Ruang Vertikal (*Above-the-Fold Priority*):** Komponen sekunder dirancang kompak agar fokus karyawan langsung tertuju ke log dan formulir pencatatan.

---

## 2. ANATOMI & KOMPONEN ANTARMUKA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & DAILY WORKFLOW STEP BAR:                                        │
│    [1. Morning Commitment ✓] -> [2. Additional Work ●] -> [3. EOD Outcome]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PANEL 1: KONTEKS JADWAL & STATUS RISIKO (Grid 4-Kolom Terpadu):          │
│    - Kolom 1: Tanggal Kerja [Hari Kerja Aktif]                              │
│    - Kolom 2: Jendela Pencatatan [09:30 – 17:00 WIB · Fleksibel]            │
│    - Kolom 3: Status Komitmen Pagi [Tersimpan · Tepat Waktu]                │
│    - Kolom 4: Status Risiko Hari Ini [GREEN / AMBER / RED]                  │
│    - Catatan Kaki Terpadu (Notice Aturan Sistem FR-07 Ramping di Dasar)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL 2: KOMITMEN PAGI TERKUNCI (Collapsible Baseline Reference):        │
│    - Header: Judul [Komitmen Pagi Terkunci], Badge [1 Komitmen],            │
│      Tombol Toggle [Lihat Komitmen / Tutup Komitmen] (Rotasi Chevron 180°)  │
│    - Default: Collapsed by Default (Hemat Ruang Layar Drastis, Nol Emoji)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL 3: DAFTAR & FORMULIR PENCATATAN (Inti Halaman):                    │
│    - Kicker: [PEKERJAAN DI LUAR KOMITMEN PAGI]                              │
│    - Header Panel: Counter Dinamis & Tombol Sinkron [+ Tambah / Tutup Form] │
│    - Formulir Input (Tugas Baru / Mode Sunting):                            │
│      * Target Hasil Kerja (Textarea + Role-Based Prompt Hint + Warning Box) │
│      * Alasan Pekerjaan Muncul (5 Enum Resmi PRD FR-06)                     │
│      * Panel Kondisional 'Assigned By' (Aksen Garis Hijau saat Newly Assign)│
│      * Tautan Referensi / Tiket Tugas (Opsional) + Quick Blocker Picker     │
│      * Aksi Form: Tombol [Batal / Tutup] & Tombol [Simpan Pekerjaan]        │
│    - Log Pekerjaan Tambahan: Kartu Tugas [ 1 ], Timestamp, Tombol Edit & Hapus│
│    - Empty State Box: Horizontal Mini-Strip Ramping (~50px) saat 0 item     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. PANEL 4: KARTU TRANSISI MENUJU EOD OUTCOME (Next-Step Bridge):           │
│    - Ikon Jam, Judul Tahap, Badge Waktu Mulai [Mulai 16:30 WIB]             │
│    - Penjelasan Penyetaraan Capaian Hasil & Tombol [Lanjut ke EOD Outcome >]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BAKU SISTEM

### 3.1 Penyatuan Status Risiko ke Grid 4-Kolom & Notice Terpadu
- **Tata Letak Seimbang:** Mengeliminasi kotak preview kedua yang bertumpuk. Status Risiko Hari Ini diintegrasikan langsung sebagai **kolom ke-4** pada grid jadwal (`repeat(4, 1fr)` desktop, `repeat(2, 1fr)` tablet, `1fr` mobile).
- **Catatan Kaki Tata Kelola (FR-07):** Diletakkan di dasar Panel 1 sebagai strip tipis pemisah:
  > *"Mencatat pekerjaan tambahan tidak mengubah komitmen pagi yang telah dikunci. Seluruh item akan dievaluasi saat EOD Outcome sore nanti."*
- **Dampak:** Menghemat $\approx 150\text{px}$ ruang vertikal dan menjaga keselarasan visual 100% dengan Halaman 02.

### 3.2 Panel Komitmen Pagi Terkunci (*Collapsible by Default*)
- **Default Tertutup:** Hanya menampilkan strip header ramping setinggi $\approx 50\text{px}$ dengan tombol toggle `Lihat Komitmen` $\leftrightarrow$ `Tutup Komitmen`.
- **Read-Only Context:** Karyawan dapat merujuk kembali target paginya kapan saja tanpa memakan ruang layar kerja harian.
- **Empty State Netral:** Jika sesi pagi tidak diisi (*No Submission*), menampilkan pesan informatif netral tanpa nada menghakimi.

### 3.3 Formulir Input & 5 Enum Resmi (PRD FR-06)
- **Target Hasil Kerja `*` (Wajib):** Textarea dengan teks bantuan berbasis peran (*Role-Based Prompt Hint*) dan *Quality Warning Badge* non-blocking jika teks $< 10$ karakter/generik.
- **5 Enum Alasan Resmi:**
  1. `Newly Assigned` $\rightarrow$ Tugas Baru Ditugaskan *(Wajib mengisi Assigned By)*.
  2. `Missed in Planning` $\rightarrow$ Terlewat saat Perencanaan Pagi.
  3. `Priority Change` $\rightarrow$ Perubahan Prioritas Proyek.
  4. `Operational-Incident` $\rightarrow$ Insiden Operasional Mendesak.
  5. `Other` $\rightarrow$ Alasan Operasional Lainnya.
- **Panel Kondisional 'Assigned By':** Otomatis muncul dengan border kiri hijau brand `3px solid #0B8061` dan latar `#F8FAFC` hanya saat alasan `Newly Assigned` dipilih.

### 3.4 Mode Sunting (*In-Place Edit*) & Empty State Ramping
- **Fitur Edit Fleksibel:** Mengklik `Edit` pada kartu log mengubah formulir ke **Mode Sunting** (badge amber, judul berubah dengan ikon pensil, tombol `Perbarui` & `Batal Sunting`), disertai *smooth scroll* otomatis.
- **Empty State Mini-Strip (~50px):** Jika belum ada item dan formulir ditutup, sistem menampilkan strip horizontal ramping satu baris dengan ikon plus, bukan kotak placeholder besar yang memboroskan layar.

### 3.5 Keseragaman Tipografi Header Panel (Konsistensi 100%)
Seluruh header panel utama menggunakan spesifikasi tipografi yang identik dengan Halaman 02:
- **Judul Utama (`h2`):** `font-size: 17px`, `font-weight: 800` (Extra Bold), warna `#0E211B`.
- **Kicker (`.section-kicker`):** `font-size: 11.5px`, `font-weight: 800`, huruf kapital, `letter-spacing: 0.05em`.

---

## 4. KATALOG RINGKAS 16 SKENARIO SISTEM

| ID | Kategori | Kondisi Pemicu | Perilaku Antarmuka & Efek Sistem |
| :---: | :--- | :--- | :--- |
| **TC-01** | Navigasi | Masuk pasca-Morning Commitment | Tab 1 centang hijau (`completed`), Tab 2 aktif (`active`), data profil terhubung. |
| **TC-02** | Konteks | Kalender Hari Kerja Adaptif | Menampilkan `Hari Kerja Aktif` (adaptif: libur/cuti/dispensasi). |
| **TC-03** | Konteks | Subteks Status Pagi 1 Baris | Menampilkan `Diserahkan pukul 08:45 WIB` rapi dalam 1 baris tanpa wrapping. |
| **TC-04** | Konteks | Status Risiko Grid 4-Kolom | Status risiko terpadu di kolom 4 Panel 1 (GREEN / AMBER / RED). |
| **TC-05** | Referensi | Komitmen Pagi Collapsible | Default tertutup. Klik toggle membuka kartu komitmen (rotasi chevron 180°). |
| **TC-06** | Referensi | Sesi Pagi Terlewat | Panel komitmen menampilkan pesan netral suportif (bukan error). |
| **TC-07** | Form UX | Default State Form Dinamis | Tertutup jika sudah ada item tersimpan; terbuka jika log masih kosong. |
| **TC-08** | Form UX | Sinkronisasi Tombol Header | Tombol berubah dinamis: `+ Tambah Pekerjaan Tambahan` $\leftrightarrow$ `Tutup Formulir`. |
| **TC-09** | Validasi | Target Hasil Kerja Kosong | Alert merah lembut: *"Target hasil kerja pekerjaan tambahan wajib diisi"*. |
| **TC-10** | Validasi | Alasan Belum Dipilih | Alert merah lembut: *"Silakan pilih alasan resmi pekerjaan ini muncul"*. |
| **TC-11** | Kondisional | Alasan 'Newly Assigned' Dipilih | Panel *Assigned By* muncul dengan border kiri hijau 3px; input wajib diisi. |
| **TC-12** | Validasi | Newly Assigned Tanpa Nama | Alert merah lembut: *"Pemberi tugas wajib diisi"* dan kursor difokuskan. |
| **TC-13** | Edukasi | Teks Singkat / Generik | Quality warning kuning muncul di bawah textarea (*non-blocking*). |
| **TC-14** | Referensi | Quick-Picker Blocker Tim | Dropdown blocker aktif terbuka; klik tiket auto-fill referensi & deskripsi. |
| **TC-15** | Log & Edit | In-Place Edit Mode | Klik `Edit` mengubah form ke *Mode Sunting* (badge amber, tombol `Perbarui`). |
| **TC-16** | Empty State | Log Kosong / Semua Terhapus | Menampilkan *Horizontal Mini-Strip Empty State* (~50px) hemat ruang. |

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND

### 5.1 Skema Data Objek Lokal (`localStorage: workpulse_additional_work_items`)
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

### 5.2 Endpoint REST API Backend

#### 1. POST `/api/v1/today/additional-work`
- **Fungsi:** Menyimpan catatan pekerjaan tambahan ke audit log harian.
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
- **Aturan Otorisasi:** Diizinkan hanya jika status harian belum `EOD_SUBMITTED`.

#### 3. DELETE `/api/v1/today/additional-work/{item_id}`
- **Fungsi:** Menghapus item pekerjaan tambahan dari log harian sebelum evaluasi sore dikunci.

---

## 6. STATUS KESIAPAN PROTOTIPE

Dokumen ini adalah **acuan resmi tunggal (*single source of truth*)** untuk implementasi modul Additional Work. Seluruh komponen pada prototipe [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html) telah teruji secara visual dan fungsional di browser modern, bebas error, dan selaras 100% dengan Halaman 02 serta panduan konsistensi sistem.
