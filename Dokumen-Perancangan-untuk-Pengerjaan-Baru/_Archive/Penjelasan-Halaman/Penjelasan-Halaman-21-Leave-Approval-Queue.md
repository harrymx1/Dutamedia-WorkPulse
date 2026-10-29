# Penjelasan Halaman 21: Antrean Persetujuan Cuti (Leave Approval Queue)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 21: Antrean Persetujuan Cuti (*Leave Approval Queue*)** pada sistem **WorkPulse** (`21-Leave-Approval-Queue.html` / `/leave/queue`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 21
Persetujuan cuti di WorkPulse bukan sekadar formalitas tanda tangan absensi, melainkan **penjagaan kapasitas operasional tim (*Capacity Guard*)**.

Melalui Halaman 21:
1. **Pencegahan Kekosongan Personil Kritis (*Staffing Conflict Prevention*):** Atasan langsung dan HRGA dapat melihat jadwal cuti bawahan secara komparatif untuk memastikan proyek penting tidak ditinggalkan oleh personil kunci secara bersamaan.
2. **Keterikatan Langsung ke Kalender Kerja:** Persetujuan cuti seketika memperbarui status keterlibatan harian karyawan pada kalender tim.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

| Peran (*Role*) | Hak Akses pada Halaman 21 | Wewenang Operasional |
| :--- | :--- | :--- |
| **Supervisor / Technical Lead** | **Penyetuju Lini Pertama (*First-line Approver*)** | Menyetujui atau menolak permohonan cuti personil tim langsungnya. |
| **Head of Department** | **Penyetuju Divisi (*Departmental Approver*)** | Menyetujui cuti supervisor atau cuti berdurasi panjang (> 5 hari kerja). |
| **HRGA / People Admin** | **Penyetuju Akhir & Arsiparis (*Final Authority*)** | Memvalidasi kepatuhan kuota cuti tahunan dan surat keterangan dokter. |
| **Karyawan Biasa** | **Ditolak (*403 Forbidden*)** | Menggunakan Halaman 20 untuk memantau status cuti sendiri. |

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Keputusan Persetujuan Resmi (*Approval Contract*):**
   * Pilihan keputusan hanya dua: `APPROVE` atau `REJECT`.
   * Jika memilih `REJECT`, kolom catatan alasan penolakan (*reviewNote*) **wajib diisi minimal 5 karakter**.
2. **Rekonsiliasi Retroaktif (DEC-007):**
   * Begitu disetujui, sistem memeriksa apakah ada tanggal cuti yang telah berlalu di mana karyawan tercatat *No-Submission*. Jika ada, statusnya diubah menjadi `Approved Leave` dengan keterangan `Superseded by Approved Leave`.

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
│    - Breadcrumb: Management / Leave Approval Queue                          │
│    - Quick Action: [Lihat Cuti Saya]                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. KARTU METRIK ANTREAN CUTI (3 Kartu):                                     │
│    - Menunggu Persetujuan: 3 Permohonan (Biru #075985)                      │
│    - Cuti Aktif Pekan Ini: 4 Karyawan (Hijau)                               │
│    - Rata-rata Waktu Respon: < 12 Jam (Netral)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. TABEL ANTREAN PERMOHONAN CUTI MENUNGGU KEPUTUSAN:                        │
│    - Kolom: Pemohon, Divisi, Jenis Cuti, Periode, Hari Kerja, Sisa Kuota,   │
│      Alasan, Aksi Cepat                                                     │
│    - Aksi Cepat: [Setujui (Hijau)] & [Tolak (Rose)]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. MODAL TINJAUAN & KONFIRMASI KEPUTUSAN:                                   │
│    - Ringkasan pemohon, sisa kuota cuti, dan surat bukti                    │
│    - Pilihan Radio: Setujui Permohonan / Tolak Permohonan                   │
│    - Kolom Catatan Reviewer: (Wajib jika menolak)                           │
│    - Tombol: [Konfirmasi Keputusan Resmi]                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-21-01 (Persetujuan Cuti):** Supervisor mengklik Setujui pada permohonan Budi $\rightarrow$ Status berubah menjadi `APPROVED`, rekonsiliasi presensi berjalan sukses.
* **TC-21-02 (Penolakan Tanpa Alasan):** Reviewer memilih Tolak tetapi mengosongkan catatan $\rightarrow$ Validasi form menolak submit *"Catatan penolakan wajib diisi"*.
