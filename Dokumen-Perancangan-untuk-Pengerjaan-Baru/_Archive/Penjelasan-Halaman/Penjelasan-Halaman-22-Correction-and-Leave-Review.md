# Penjelasan Halaman 22: Tinjauan Terpadu Koreksi & Cuti (Correction & Leave Review)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 22: Tinjauan Terpadu Koreksi & Cuti (*Correction & Leave Review*)** pada sistem **WorkPulse** (`22-Correction-and-Leave-Review.html` / `/corrections/review`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 22
Bagi seorang Supervisor atau Head of Department, membuka banyak halaman terpisah hanya untuk meninjau permohonan staf harian menimbulkan beban kognitif tinggi.

Halaman 22 dirancang sebagai **Portal Tinjauan Terpadu (*Unified Managerial Inbox*)** yang menyatukan:
1. **Permohonan Koreksi Material (Halaman 16a & 16b):** Menampilkan permohonan koreksi komitmen pagi atau evaluasi sore yang sedang berada dalam masa sanggahan (*Objection Window*).
2. **Permohonan Cuti Personil Tim (Halaman 20):** Menampilkan antrean permohonan cuti bawahan langsung.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

| Peran (*Role*) | Hak Akses pada Halaman 22 | Wewenang Operasional |
| :--- | :--- | :--- |
| **Supervisor / Tech Lead** | **Penelaah Tim (*Team Reviewer*)** | Mengajukan sanggahan atas koreksi bawahan atau menyetujui permohonan dalam timnya. |
| **Head of Department** | **Penelaah Divisi (*Function Reviewer*)** | Memantau seluruh antrean dalam lingkup departemennya. |
| **HRGA / People Admin** | **Pemantau Kepatuhan (*Compliance Reviewer*)** | Memantau kepatuhan rekonsiliasi dan sanggahan. |
| **Karyawan Biasa** | **Ditolak (*403 Forbidden*)** | Tidak memiliki hak akses manajerial. |

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Aturan Sanggahan Koreksi (*Objection Filing*):**
   * Koreksi Material yang tidak disanggah hingga jendela waktu habis (default: 24 jam) akan otomatis disetujui (*Default-Approved*).
   * Jika atasan mengajukan sanggahan, status berubah menjadi `REJECTED_BY_OBJECTION` dengan alasan sanggahan yang wajib diisi.
2. **Tab Terisolasi Tanpa Kebocoran Data:**
   * Tab 1: Antrean Koreksi Komitmen & EOD.
   * Tab 2: Antrean Persetujuan Cuti.

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
│    - Breadcrumb: Management / Correction & Leave Review                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TAB NAVIGASI MODUL TINJAUAN:                                             │
│    [Permohonan Koreksi (3 Menunggu)] | [Persetujuan Cuti (2 Menunggu)]      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. DAFTAR KARTU TINJAUAN KOMPARATIF KOREKSI:                                │
│    - Header Kartu: Nama Karyawan, Divisi, Sisa Jendela Sanggahan [18 Jam]   │
│    - Kolom Kiri: Baseline Terkunci (Teks Lama & Risiko Asli)                │
│    - Kolom Kanan: Usulan Perubahan Baru (Teks Baru & Risiko Baru)           │
│    - Catatan Justifikasi Karyawan                                           │
│    - Tombol Aksi: [Konfirmasi Setujui Sekarang] & [Ajukan Sanggahan Resmi]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. MODAL PENGAJUAN SANGGAHAN (*Objection Modal*):                           │
│    - Alasan Keberatan Manajerial (Wajib Diisi)                              │
│    - Arahan Pembinaan Tindak Lanjut                                         │
│    - Tombol: [Kirim Sanggahan Resmi] (Warna Rose)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-22-01 (Persetujuan Cepat Sebelum Window Habis):** Atasan mengklik *Konfirmasi Setujui Sekarang* $\rightarrow$ Koreksi langsung berstatus `APPROVED` tanpa menunggu sisa jendela waktu.
* **TC-22-02 (Pengajuan Sanggahan):** Atasan memasukkan alasan sanggahan $\rightarrow$ Status berubah menjadi `REJECTED_BY_OBJECTION`, data lama karyawan tetap terkunci aman.
