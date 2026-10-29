# Penjelasan Halaman 18: Pengaturan Kebijakan & Tata Kelola Sistem (Policy Settings)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 18: Pengaturan Kebijakan Sistem (*Policy Settings*)** pada sistem **WorkPulse** (`18-Policy-Settings.html` / `/admin/policies`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 18
Sistem operasional perkantoran yang sehat membutuhkan parameter kerja yang jelas namun dapat beradaptasi terhadap perubahan kebijakan manajemen tanpa harus melakukan perubahan kode (*hard-coded re-deployment*).

Di **WorkPulse**, seluruh aturan waktu dan tata kelola diatur melalui **Policy Configuration Framework (PRD FR-34, FR-35, SAD §4.4)**:
1. **Kebijakan Fleksibel, Prinsip Tetap (*Configurable Values, Fixed Principles*):**
   * Jam cutoff masuk pagi, durasi masa toleransi, ambang batas hari carry-over, jam evaluasi sore, dan panjang jendela sanggahan dapat diubah oleh pejabat berwenang.
   * Batasan keamanan dan prinsip fundamental produk (seperti anti-backdating dan hak asasi GREEN tanpa gembok) tidak dapat dimatikan melalui kebijakan.
2. **Tata Kelola Versi Kebijakan (*Versioned Governance*):**
   * Setiap perubahan kebijakan melahirkan versi baru (`v1.0`, `v1.1`, dst.) dengan tanggal efektif yang pasti.
   * Data masa lalu tetap dinilai menggunakan aturan kebijakan yang berlaku saat data tersebut dibuat (*historical integrity*).

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

Sesuai UI/UX Spec §2 & FR-34, **Halaman 18 bukan menu eksklusif Administrator**, melainkan dapat diakses oleh peran manajerial sesuai kategori wewenangnya:

| Kategori Kebijakan | Pejabat Berwenang (*Authorized Policy Owner*) | Parameter yang Dikelola |
| :--- | :--- | :--- |
| **Submission & Cut-off** | **System Admin, HRGA, CEO** | Jam On-Time (09:00 WIB), Jam Cut-Off (09:30 WIB), Jendela EOD (16:00–18:00 WIB). |
| **Kalender Kerja & Libur**| **HRGA, System Admin** | Hari kerja aktif (Senin–Jumat), kalender libur nasional & cuti bersama. |
| **Eskalasi & SLA Blocker**| **Head of Department, CEO, Admin** | Batas SLA penanganan (Critical: 4 jam, High: 8 jam), target eskalasi. |
| **Koreksi & Sanggahan** | **CEO, HRGA, Admin** | Durasi Objection Window (24 jam kerja), kriteria perubahan Material. |

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Aturan Anti-Backdating Kebijakan (BR-15):**
   * Kebijakan baru hanya dapat berlaku mulai hari ini atau masa depan (`effectiveDate >= today`). Perubahan kebijakan tidak boleh berlaku surut untuk mengevaluasi ulang kepatuhan hari kemarin.
2. **Non-Overlapping Active Policies:**
   * Dalam satu kategori kebijakan yang sama, hanya boleh ada tepat 1 versi kebijakan yang berstatus `ACTIVE` pada satu tanggal kerja.
3. **Audit Trail Perubahan Kebijakan:**
   * Setiap rilis versi baru mencatat pejabat yang mengesahkan, tanggal pengesahan, ringkasan alasan perubahan (*rationale*), dan dokumen referensi SK Direksi jika ada.

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
│    - Breadcrumb: Administration / Policy Settings                           │
│    - Quick Status: [Versi Aktif: v1.5.0 • Berlaku Sejak 15 Okt 2026]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TAB KATEGORI KEBIJAKAN (Navigasi Horizontal):                            │
│    [Waktu & Cut-off] | [Kalender & Libur] | [SLA Blocker] | [Koreksi & Cuti] │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. FORMULIR PARAMETER KEBIJAKAN AKTIF (Panel Kiri):                         │
│    - Jam Batas On-Time Pagi: [09:00] WIB                                    │
│    - Jam Batas Kunci Cut-Off Pagi: [09:30] WIB                              │
│    - Jam Mulai Evaluasi Sore: [16:00] WIB                                   │
│    - Ambang Peringatan Carry-over: [2] Hari Kerja Berturut-turut            │
│    - Tanggal Mulai Berlaku: [Pilih Tanggal >= Hari Ini]                     │
│    - Justifikasi Perubahan / Catatan SK: [Textarea Wajib Diisi]             │
│    - Tombol: [Terbitkan Versi Kebijakan Baru] (Hijau #00674D)               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. PANEL RIWAYAT VERSI & AUDIT TRAIL KEBIJAKAN (Panel Kanan):               │
│    - Daftar versi historis: v1.5 (Aktif), v1.4 (Arsip), v1.3 (Arsip)        │
│    - Tanggal berlaku, Disahkan oleh, Alasan perubahan                       │
│    - Tombol: [Inspeksi Parameter Masa Lalu]                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-18-01 (Penerbitan Parameter Baru):** Admin mengubah jam On-Time dari 09:00 menjadi 09:15 mulai Senin depan $\rightarrow$ Sistem membuat draft versi v1.6 dengan status `SCHEDULED`.
* **TC-18-02 (Pencegahan Tanggal Surut):** Pengguna memilih tanggal berlaku kemarin $\rightarrow$ Validasi form menolak dengan pesan *"Kebijakan baru tidak dapat berlaku surut"*.
* **TC-18-03 (Filter Hak Akses):** Supervisor membuka halaman ini $\rightarrow$ Hanya tab SLA Blocker yang dapat diakses; tab Pengaturan Cut-off terkunci/disabled.
