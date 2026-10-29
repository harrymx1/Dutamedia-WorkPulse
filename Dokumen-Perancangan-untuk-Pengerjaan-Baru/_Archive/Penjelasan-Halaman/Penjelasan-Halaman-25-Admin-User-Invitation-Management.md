# Penjelasan Halaman 25: Pengelolaan Pengguna & Undangan Aktivasi (User & Invitation Management)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 25: Pengelolaan Pengguna & Undangan Karyawan (*User & Invitation Management*)** pada sistem **WorkPulse** (`25-Admin-User-Invitation-Management.html` / `/admin/users` & `/admin/invitations`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 25
Di WorkPulse, pendaftaran akun karyawan baru tidak dilakukan secara mandiri bebas tanpa kontrol (*self-registration*). 

Pengelolaan akun diatur melalui **Guided Onboarding & Invitation Lifecycle (PRD FR-47, FR-48, SAD §4.8)**:
1. **Undangan Resmi Sekali Pakai (*One-Time Activation Token*):**
   * Administrator atau HRGA menerbitkan undangan akun dengan memasukkan Nama Lengkap, Email Kantor, Divisi, dan Peran Sistem.
   * Sistem menerbitkan tautan aktivasi unik dengan **masa kedaluwarsa 72 jam**.
2. **Pemisahan Pengelolaan Akun vs Struktur Organisasi:**
   * Halaman 25 mengelola siklus hidup kredensial akun (*User Identity*).
   * Pemetaan atasan langsung dan otoritas proyek dilakukan secara terpisah di Halaman 15 (*Organizational Mapping*) agar riwayat akuntabilitas tidak tercampur.
3. **Manajemen Status Akun:**
   * Administrator dapat menonaktifkan akun karyawan yang telah resign (*SUSPENDED*) atau menerbitkan ulang token aktivasi yang kedaluwarsa (*Resend Invitation*).

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

| Peran (*Role*) | Hak Akses pada Halaman 25 | Wewenang Operasional |
| :--- | :--- | :--- |
| **System Administrator** | **Pengelola Master Akun (*Full Access*)** | Membuat akun, mengedit peran, menonaktifkan akun, menerbitkan token aktivasi. |
| **HRGA / People Admin** | **Pengelola Karyawan (*Staff Administrator*)** | Mendaftarkan karyawan baru dan mengirim ulang undangan aktivasi. |
| **CEO / Direksi** | **Pemantau Organisasi (*Executive Viewer*)** | Melihat seluruh daftar personil dan status keaktifan akun. |
| **Karyawan Biasa** | **Ditolak (*403 Forbidden*)** | Tidak memiliki akses ke pengelolaan akun sistem. |

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Format Email Unik:**
   * Email wajib berformat valid dan belum pernah terdaftar di basis data sistem.
2. **Masa Berlaku Token 72 Jam:**
   * Token aktivasi hanya dapat dipakai tepat satu kali (*single-use*). Begitu kata sandi pertama kali dibuat di Halaman 01, token otomatis kedaluwarsa.
3. **Suspensi Akun Aman:**
   * Karyawan yang berstatus `SUSPENDED` tidak dapat melakukan login, namun seluruh riwayat komitmen dan hasil kerja masa lalunya tetap tersimpan utuh di basis data (*no hard delete*).

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
│    - Breadcrumb: Administration / User Management & Invitations             │
│    - Tombol Aksi Kanan: [+ Undang Pengguna Baru] (Hijau #00674D)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL STATISTIK AKUN KARYAWAN (4 Kartu Ringkasan):                       │
│    - Total Pengguna Aktif: 28 Orang (Hijau #166534)                         │
│    - Menunggu Aktivasi: 2 Undangan (Amber #92400E)                          │
│    - Akun Ditangguhkan: 1 Akun (Netral)                                     │
│    - Tingkat Keberhasilan Aktivasi: 96.5% (Biru #075985)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. FORMULIR MODAL UNDANGAN PENGGUNA BARU:                                   │
│    - Nama Lengkap Karyawan: [Input Teks]                                    │
│    - Alamat Email Korporat: [Input Email]                                   │
│    - Divisi / Fungsi Organisasi: [Pilih dari 10 Fungsi Resmi]               │
│    - Peran Sistem (*Canonical Role*): [EMPLOYEE, SUPERVISOR, HEAD, dst.]    │
│    - Tombol: [Terbitkan Tautan Undangan 72 Jam]                             │
│    - Box Hasil: Menampilkan Token & Tautan Aktivasi untuk dibagikan         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. TABEL MASTER PENGGUNA & STATUS UNDANGAN:                                 │
│    - Kolom: Avatar, Nama & Email, Fungsi, Peran, Status Akun, Aksi          │
│    - Status Badge: ACTIVE (Hijau), INVITED (Amber), SUSPENDED (Netral)      │
│    - Aksi: [Kirim Ulang Undangan], [Ubah Status Akun], [Salin Token]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-25-01 (Undang Akun Baru):** Admin memasukkan data karyawan baru $\rightarrow$ Token 72 jam terbit, tautan aktivasi `https://.../login?token=...` tampil untuk disalin.
* **TC-25-02 (Cegah Duplikasi Email):** Admin memasukkan email yang sudah terdaftar $\rightarrow$ Form memunculkan error *"Alamat email sudah terdaftar dalam sistem"*.
