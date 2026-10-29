# Penjelasan Halaman 23: Laporan Eksekutif & Ekspor Audit (Executive Reports)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 23: Laporan Eksekutif & Ekspor Audit (*Executive Reports*)** pada sistem **WorkPulse** (`23-Reports.html` / `/reports`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 23
Laporan di WorkPulse bukan untuk membuat peringkat kompetisi karyawan (*leaderboard*), melainkan untuk **memberikan visibilitas objektif atas stabilitas operasional, kesehatan proyek, dan hambatan sistemik organisasi (PRD §5 Scope, FR-38, SAD §4.7)**.

Melalui Halaman 23:
1. **Penyelidikan Akar Masalah Blocker (*Root Cause Analysis*):** Mengidentifikasi apakah kendala kerja berulang kali disebabkan oleh infrastruktur server, dependensi pihak ketiga, atau ketidakjelasan spesifikasi.
2. **Keterlacakan Audit Trail Kekal:** Menyediakan data riwayat kepatuhan cutoff, evaluasi sore, dan dispensasi untuk dasar pembinaan berkala.
3. **Ekspor Data Terotorisasi:** Menyediakan fitur unduh arsip CSV resmi yang dibatasi ketat sesuai ruang lingkup wewenang pengguna.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Sesuai ketetapan keamanan backend (`ReportsController`):

| Peran (*Role*) | Hak Akses pada Halaman 23 | Cakupan Data (*Scope*) |
| :--- | :--- | :--- |
| **CEO / Direksi** | **Akses Penuh Perusahaan (*Company-Wide*)** | Melihat seluruh divisi, proyek, dan tren agregat lintas fungsi. |
| **Head of Department** | **Cakupan Departemen (*Function-Scoped*)** | Melihat agregat laporan khusus fungsi/divisinya sendiri. |
| **HRGA / People Admin** | **Cakupan Kepatuhan (*Compliance-Scoped*)** | Melihat metrik presensi, cuti, dispensasi, dan kepatuhan pengisian. |
| **System Administrator** | **Akses Penuh Audit (*System Audit*)** | Seluruh data untuk pemeliharaan sistem. |
| **Supervisor / Karyawan** | **Ditolak (*403 Forbidden*)** | Tidak memiliki hak akses laporan eksekutif. |

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Anti-Leakage Data Scope:**
   * Ekspor data CSV difilter ketat di sisi server; pengguna divisi Engineering tidak dapat mengunduh data divisi Finance.
2. **Filter Periode Baku:**
   * Hari Ini (`today`), Pekan Berjalan (`this-week`), Pekan Lalu (`last-week`), Bulan Ini (`this-month`).

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
│    - Breadcrumb: Management / Executive Reports                             │
│    - Tombol Aksi Kanan: [Ekspor CSV Resmi] (Hijau #00674D)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL FILTER LAPORAN:                                                    │
│    - Pilih Periode: [Hari Ini / Pekan Ini / Bulan Ini]                      │
│    - Pilih Divisi / Fungsi: [Semua Divisi / Engineering / Ops & Infra, dsb.]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. RINGKASAN METRIK KINERJA AGREGAT (4 Kartu Eksekutif):                   │
│    - Tingkat Partisipasi Pengisian: 94.2% (Hijau #166534)                   │
│    - Rasio Komitmen Tuntas: 88.5% (Biru #075985)                            │
│    - Total Blocker Dilaporkan: 14 Tiket (Amber #92400E)                     │
│    - Rata-rata Resolusi Blocker: 3.4 Jam (SLA Aman)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. TABEL RINCIAN PERFORMA PER DIVISI & DISTRIBUSI BLOCKER:                  │
│    - Kolom: Divisi, Personil Aktif, Partisipasi, Komitmen, Blocker, SLA %   │
│    - Visualisasi Bar Chart Sederhana (Monokrom / Brand Green)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-23-01 (Ekspor CSV):** Direktur menekan tombol *Ekspor CSV* dengan periode *this-week* $\rightarrow$ Server mengembalikan berkas `workpulse-audit-this-week.csv` dengan header MIME yang valid.
* **TC-23-02 (Blokir Supervisor):** Akun Supervisor mencoba menembak URL `/reports` $\rightarrow$ Router memblokir dan menampilkan layar 403 Forbidden.
