# Penjelasan Halaman 20: Pengajuan Cuti Mandiri Karyawan (My Leave Request)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 20: Pengajuan Cuti Mandiri Karyawan (*My Leave Request*)** pada sistem **WorkPulse** (`20-My-Leave-Request.html` / `/leave/my`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 20
Di tempat kerja, karyawan memiliki hak cuti dan kondisi berhalangan yang sah (cuti tahunan, sakit, izin keluarga). Namun jika permohonan cuti tidak terintegrasi dengan sistem akuntabilitas harian:
1. **False Alarm No-Submission:** Karyawan yang sah sedang cuti tercatat seolah-olah mangkir atau lalai mengisi komitmen pagi (*No Submission*).
2. **Ketiadaan Visibilitas Tim:** Rekan satu tim atau atasan tidak mengetahui bahwa yang bersangkutan sedang berhalangan resmi.

**Solusi WorkPulse (PRD FR-25, FR-26, SAD §4.6):**
* Menyediakan formulir pengajuan cuti mandiri yang sederhana, transparan, dan terhubung langsung ke kalender akuntabilitas harian.
* **Mekanisme Rekonsiliasi Otomatis (DEC-007):** Jika permohonan cuti baru disetujui setelah batas jam cutoff (sehingga event *No Submission* sempat tercatat otomatis), status hari tersebut otomatis direkonsiliasi menjadi `Approved Leave` dan event pelanggaran lama ditandai `Superseded by Approved Leave` pada audit trail (tidak dihitung dalam pola ketidakdisiplinan).

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

| Peran (*Role*) | Hak Akses pada Halaman 20 | Wewenang Operasional |
| :--- | :--- | :--- |
| **Seluruh Karyawan (*All Employees*)** | **Pengaju Cuti (*Requester*)** | Mengisi permohonan cuti untuk diri sendiri, memantau riwayat pengajuan, dan membatalkan permohonan yang masih berstatus `PENDING`. |
| **Atasan Langsung / HRGA** | **Penelaah / Penyetuju** | Meninjau permohonan yang masuk di Halaman 21 (`/leave/queue`) atau Halaman 22 (`/corrections/review`). |

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Jenis Cuti Kanonikal:**
   * `ANNUAL` (Cuti Tahunan)
   * `SICK_WITH_CERTIFICATE` (Sakit dengan Surat Dokter)
   * `MARRIAGE` (Pernikahan Karyawan)
   * `MATERNITY` (Cuti Melahirkan)
   * `BEREAVEMENT` (Duka Cita Keluarga Inti)
   * `UNPAID` (Izin Tanpa Upah)
2. **Validasi Rentang Tanggal:**
   * Tanggal selesai tidak boleh lebih awal dari tanggal mulai (`endDate >= startDate`).
   * Alasan cuti wajib diisi minimal 5 karakter deskriptif.
3. **Pencegahan Tumpang Tindih (*Anti-Overlapping Leave*):**
   * Pengguna tidak dapat mengajukan permohonan cuti baru pada rentang tanggal yang sudah memiliki permohonan cuti aktif (`PENDING` atau `APPROVED`).

---

# BAGIAN 2: ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BILAH SIMULASI PROTOTIPE: [Mode Simulasi Prototipe]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SHELL APLIKASI: SIDEBAR 232px (Kiri) & KONTEN UTAMA (Kanan)              │
│    - Sidebar: Brand WP, 3 Grup (Workspace, Management, Administration)      │
│    - Sidebar Footer: Avatar BP, Nama, Peran, Tombol Logout                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. TOPBAR RESMI:                                                            │
│    - Breadcrumb: Workspace / My Leave Request                               │
│    - Kuota Cuti: [Sisa Cuti Tahunan: 8 Hari Kerja]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. FORMULIR PENGAJUAN CUTI MANDIRI (Panel Kiri / Atas):                     │
│    - Jenis Cuti: [Dropdown: Cuti Tahunan, Sakit, dsb.]                      │
│    - Tanggal Mulai: [Datepicker]                                            │
│    - Tanggal Selesai: [Datepicker]                                          │
│    - Total Hari Kerja Dihitung Otomatis: [Contoh: 3 Hari Kerja Efektif]     │
│    - Alasan Permohonan: [Textarea Wajib Diisi]                              │
│    - Lampiran Surat Dokter / Bukti Pendukung: [Upload Dokumen Opsional]     │
│    - Tombol: [Ajukan Permohonan Cuti] (Hijau #00674D)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. TABEL RIWAYAT PERMOHONAN CUTI (Panel Bawah):                             │
│    - Kolom: Nomor Pengajuan, Jenis, Periode, Durasi, Status, Catatan Review │
│    - Status Badge: Menunggu (Biru #E0F2FE), Disetujui (Hijau), Ditolak (Rose)│
│    - Aksi: [Batalkan Pengajuan] (hanya aktif jika status PENDING)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-20-01 (Pengajuan Valid):** Karyawan mengajukan cuti tahunan 3 hari ke depan dengan alasan jelas $\rightarrow$ Tiket terbit dengan status `PENDING`, notifikasi terkirim ke atasan.
* **TC-20-02 (Pembatalan Mandiri):** Karyawan mengklik batalkan pada tiket `PENDING` $\rightarrow$ Status berubah menjadi `CANCELLED`.
