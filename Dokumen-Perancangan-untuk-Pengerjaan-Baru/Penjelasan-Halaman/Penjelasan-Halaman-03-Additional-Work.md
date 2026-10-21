# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 03: MY TODAY — ADDITIONAL WORK

- **Berkas Prototipe:** [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html)
- **Rute Sistem:** `/today/additional`
- **Posisi Alur:** Langkah 2 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Pencatatan Tugas Tak Terduga di Sela Jam Kerja (*Mid-Day Ad-Hoc*):** Menampung penugasan mendadak, insiden operasional, atau perubahan prioritas yang terjadi setelah Morning Commitment dikunci (jendela kerja 09:30–17:00 WIB).
2. **Perlindungan Kemurnian Baseline Pagi (PRD FR-07 & BR-01):** Pekerjaan tambahan **bukan slot komitmen ke-4** dan **tidak pernah mengubah atau merusak baseline komitmen pagi** yang telah dikunci.
3. **Penyetaraan Evaluasi Sore (PRD FR-08):** Seluruh item yang dicatat otomatis disalurkan ke evaluasi akhir (**Halaman 04: EOD Outcome**) dengan bobot pertanggungjawaban yang setara dengan komitmen utama.

### 1.2 Batasan Desain Baku
- **Bersifat Fleksibel & Opsional:** Karyawan tidak diwajibkan mengisi jika tidak ada tugas baru yang muncul di siang hari.
- **Nol Emoticon & Ikon Monokrom:** Murni menggunakan tipografi korporat dan inline SVG monokrom (`stroke-width="1.8-2.2"`).
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada tombol hapus dan pesan error.
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis kaku.

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & DAILY WORKFLOW STEP BAR:                                        │
│    [1. Morning Commitment ✓] ──> [2. Additional Work ●] ──> [3. EOD Outcome]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PANEL 1: KONTEKS JADWAL & RISIKO (Grid 4-Kolom Terpadu):                 │
│    - Kolom 1: Tanggal Kerja [Hari Kerja Aktif]                              │
│    - Kolom 2: Jendela Pencatatan [09:30 – 17:00 WIB · Fleksibel]            │
│    - Kolom 3: Status Komitmen Pagi [Tersimpan · Tepat Waktu]                │
│    - Kolom 4: Status Risiko Hari Ini [GREEN / AMBER / RED]                  │
│    - Catatan Kaki Tata Kelola (Integrated Notice FR-07 Ramping di Dasar)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL 2: KOMITMEN PAGI TERKUNCI (Collapsible by Default ~50px):          │
│    - Header: Judul [Komitmen Pagi Terkunci], Badge Count [1 Komitmen],      │
│      Tombol Toggle [Lihat Komitmen / Tutup Komitmen] (Rotasi Chevron 180°)  │
│    - Konten (Saat Dibuka): Kartu Baca-Saja Rencana Target Pagi & Status     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL 3: DAFTAR & FORMULIR PENCATATAN (Inti Halaman):                    │
│    - Kicker: [PEKERJAAN DI LUAR KOMITMEN PAGI]                              │
│    - Header: Counter Item & Tombol Sinkron [+ Tambah / Tutup Form]          │
│    - Formulir Input (Tugas Baru / Mode Sunting):                            │
│      * Target Hasil Kerja (Textarea + Role Prompt Hint + Warning Box)       │
│      * Alasan Resmi Munculnya Pekerjaan (5 Enum Baku PRD FR-06)             │
│      * Panel Kondisional 'Assigned By' (Border Hijau saat Newly Assigned)   │
│      * Tautan Referensi / Tiket Tugas (Opsional) + Quick Blocker Picker     │
│      * Tombol Aksi: [Batal / Tutup] & [Simpan Pekerjaan]                    │
│    - Log Tugas Tambahan Tersimpan: Kartu Tugas [ 1 ], Timestamp, Edit/Hapus │
│    - Empty State Box: Horizontal Mini-Strip Ramping (~50px) saat 0 item     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. PANEL 4: KARTU TRANSISI MENUJU EOD OUTCOME (Next-Step Bridge):           │
│    - Ikon Jam, Judul Tahap, Badge Waktu Mulai [Mulai 16:30 WIB]             │
│    - Penjelasan Penyetaraan Capaian Hasil & Tombol [Lanjut ke EOD Outcome >]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.1 Penyatuan Status Risiko ke Grid 4-Kolom & Notice Terpadu
- Mengintegrasikan Status Risiko Hari Ini langsung sebagai **kolom ke-4** pada Panel 1 (`repeat(4, 1fr)`).
- Menempatkan maklumat aturan sistem (*Governance Notice FR-07*) sebagai catatan kaki terpadu di dasar Panel 1:
  > *"Mencatat pekerjaan tambahan tidak mengubah komitmen pagi yang telah dikunci. Seluruh item akan dievaluasi saat EOD Outcome sore nanti."*
- Menghemat $\approx 150\text{px}$ ruang vertikal kanvas kerja dan selaras 100% dengan Halaman 02.

### 3.2 Panel Komitmen Pagi Terkunci (*Collapsible by Default*)
- **Default Tertutup:** Hanya menampilkan strip header ramping setinggi $\approx 50\text{px}$ dengan tombol toggle `Lihat Komitmen` $\leftrightarrow$ `Tutup Komitmen`.
- **Konteks Baca-Saja:** Membantu karyawan meninjau target paginya kapan saja tanpa memakan ruang layar kerja.
- **Empty State Netral:** Jika sesi pagi tidak diisi (*No Submission*), menampilkan pesan informatif netral tanpa nada menghakimi.

### 3.3 Formulir Input & 5 Enum Resmi Alasan (PRD FR-06)
- **Target Hasil Kerja `*` (Wajib):** Textarea dengan teks bantuan adaptif (*Role-Based Prompt Hint*) dan *Quality Warning* non-blocking jika teks $< 10$ karakter/generik.
- **5 Enum Baku Alasan Tugas:**
  1. `Newly Assigned` $\rightarrow$ Tugas Baru Ditugaskan *(Wajib mengisi Assigned By)*.
  2. `Missed in Planning` $\rightarrow$ Terlewat saat Perencanaan Pagi.
  3. `Priority Change` $\rightarrow$ Perubahan Prioritas Proyek.
  4. `Operational-Incident` $\rightarrow$ Insiden Operasional Mendesak.
  5. `Other` $\rightarrow$ Alasan Operasional Lainnya.
- **Panel Kondisional 'Assigned By':** Otomatis tampil dengan aksen border kiri hijau (`#0B8061`) dan latar `#F8FAFC` hanya saat alasan `Newly Assigned` dipilih.

### 3.4 Mode Sunting (*In-Place Edit*) & Empty State Ramping
- **Fitur Sunting Fleksibel:** Tombol `Edit` pada kartu log mengubah formulir ke **Mode Sunting** (badge amber, ikon pensil, tombol `Perbarui` & `Batal Sunting`), disertai *smooth scroll* otomatis.
- **Horizontal Mini-Strip Empty State (~50px):** Jika belum ada item dan formulir tertutup, sistem menampilkan strip horizontal ramping satu baris dengan ikon plus, bukan kotak placeholder besar yang memboroskan layar.

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Navigasi Siklus Harian | Masuk pasca-Morning Commitment | Tab 1 centang hijau (`completed`), Tab 2 aktif (`active`), data profil tersambung. |
| **TC-02** | Status Risiko Grid 4-Kolom | Sesi pagi tersimpan | Status risiko terpadu di kolom 4 Panel 1 (GREEN / AMBER / RED). |
| **TC-03** | Komitmen Pagi Collapsible | Default tertutup | Klik toggle membuka rincian kartu komitmen pagi (rotasi chevron 180°). |
| **TC-04** | Validasi Target Kosong | Submit form tugas tambahan kosong | Tampil alert merah lembut: *"Target hasil kerja pekerjaan tambahan wajib diisi"*. |
| **TC-05** | Validasi Alasan Belum Dipilih | Alasan tugas belum ditentukan | Tampil alert merah lembut: *"Silakan pilih alasan resmi pekerjaan ini muncul"*. |
| **TC-06** | Alasan 'Newly Assigned' | Radio Newly Assigned dipilih | Panel *Assigned By* muncul dengan border hijau; input wajib diisi. |
| **TC-07** | Validasi Assigned By Kosong | Newly Assigned tanpa nama delegator | Tampil alert merah: *"Pemberi tugas wajib diisi"* dan kursor difokuskan. |
| **TC-08** | Deteksi Teks Generik | Input $< 10$ karakter atau kata umum | Tampil banner kuning edukatif di bawah textarea (*non-blocking*). |
| **TC-09** | Quick-Picker Blocker Tim | Dropdown blocker aktif dibuka | Klik tiket auto-fill referensi & deskripsi ke formulir. |
| **TC-10** | Mode Sunting (*In-Place Edit*) | Klik tombol `Edit` pada kartu tugas | Form beralih ke Mode Sunting (badge amber, tombol `Perbarui Pekerjaan`). |
| **TC-11** | Hapus Item Tugas | Klik tombol `Hapus` pada kartu tugas | Item dihapus dari daftar; jika kosong, tampil Horizontal Mini-Strip (~50px). |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Menggunakan sesi pengguna aktif dari `localStorage: workpulse_active_user`. |
| **Halaman 02 (Morning Commitment)** | Menampilkan komitmen pagi sebagai referensi baca-saja tanpa mengubah baselinenya. |
| **Halaman 04 (EOD Outcome)** | Seluruh item pekerjaan tambahan yang tersimpan otomatis dimuat di Panel 3 Halaman 04 untuk dievaluasi setara dengan komitmen utama. |
| **Halaman 05 (Raise Blocker)** | Tugas tambahan dapat mengaitkan tiket blocker aktif yang dilaporkan di Halaman 05. |
| **Halaman 06 (My History)** | Pekerjaan tambahan yang diselesaikan terekam pada riwayat harian dan laporan mingguan. |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 Skema Data Objek Lokal (`localStorage: workpulse_additional_work_items`)
```typescript
interface AdditionalWorkItemLocal {
  id: number; // Timestamp Unix ms
  description: string;
  reason: 'Newly Assigned' | 'Missed in Planning' | 'Priority Change' | 'Operational-Incident' | 'Other';
  assignedBy: string;
  reference: string;
  time: string; // Format HH:mm
}
```

### 6.2 Endpoint REST API Backend

#### 1. POST `/api/v1/today/additional-work`
- **Fungsi:** Menyimpan catatan pekerjaan tambahan ke log harian.
- **Request Payload (JSON):**
```json
{
  "deliverableTarget": "Investigasi spike CPU 90% pada service otentikasi",
  "reasonCategory": "Newly Assigned",
  "assignedBy": "Joko Sasongko (Engineering Manager)",
  "referenceUrl": "https://jira.dutamedia.com/browse/DEV-889"
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "data": {
    "itemId": "adw_991823",
    "recordedAt": "2026-10-18T14:25:00+07:00",
    "recordedBy": "budi.pratama@dutamedia.com"
  }
}
```

#### 2. PUT `/api/v1/today/additional-work/{itemId}`
- **Fungsi:** Memperbarui detail pekerjaan tambahan sebelum EOD diserahkan (*in-place edit*).
- **Aturan Otorisasi:** Diizinkan hanya jika status harian belum `EOD_SUBMITTED`.

#### 3. DELETE `/api/v1/today/additional-work/{itemId}`
- **Fungsi:** Menghapus item pekerjaan tambahan dari log harian sebelum evaluasi sore dikunci.

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Additional Work. Seluruh komponen pada prototipe [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html) telah teruji secara visual dan fungsional di browser modern, bebas error, dan selaras 100% dengan Halaman 02 serta Halaman 04.
