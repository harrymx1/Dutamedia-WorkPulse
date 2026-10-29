# Penjelasan Halaman 24: Pengaturan Profil & Keamanan Akun (Profile Settings)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 24: Pengaturan Profil & Keamanan Akun (*Profile Settings*)** pada sistem **WorkPulse** (`24-Profile-Settings.html` / `/profile`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 24
Halaman 24 adalah ruang pribadi setiap pengguna di WorkPulse untuk **mengelola identitas kerja, memeriksa parameter peran aktif, dan menjaga keamanan kredensial sesi**.

Fitur Utama:
1. **Verifikasi Hak Akses & Peran (*Role Transparency*):** Menampilkan identitas, divisi kanonikal, dan peran sistem secara transparan tanpa jargon teknis.
2. **Panduan Refleksi Berbasis Peran (*Role-Based Reflection Prompt*):** Menyajikan kutipan pengarah singkat yang memandu pengguna merumuskan komitmen sesuai fungsi kerjanya.
3. **Pengelolaan Kata Sandi Mandiri:** Mengubah kata sandi secara aman dengan validasi kata sandi saat ini dan pengecekan kekuatan kombinasi sandi baru.
4. **Verifikasi Sesi Peramban Aktif:** Menampilkan status keamanan koneksi terlindungi cookie `HttpOnly`, `SameSite=Strict`.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

* **Seluruh Pengguna Terautentikasi (*All Authenticated Users*):** Berhak mengakses halaman profil miliknya sendiri. Tidak dapat melihat atau mengedit profil pengguna lain.

---

## 1.3 Aturan Bisnis Baku (Engine Rules)

1. **Aturan Kata Sandi Baku:**
   * Minimal 8 karakter kombinasi huruf dan angka.
   * Kata sandi baru tidak boleh sama dengan kata sandi lama.
   * Konfirmasi kata sandi baru wajib cocok 100%.
2. **Validasi Sesi Aktif:**
   * Begitu kata sandi berhasil diubah, sesi lama di peramban lain otomatis kedaluwarsa demi keamanan akun.

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
│    - Breadcrumb: Workspace / Profile & Account Settings                     │
│    - Tombol Keluar Cepat: [Keluar Sesi]                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TATA LETAK GRID 2-KOLOM PROFIL:                                          │
│    - KOLOM KIRI (Kartu Identitas Pengguna):                                 │
│      * Avatar Inisial Besar [BP] (Hijau Lembut #E8F5E9)                     │
│      * Nama Lengkap: Budi Pratama (Software Engineer)                       │
│      * Email Kerja: dev.frontend@dutamedia.com                              │
│      * Badge Peran: EMPLOYEE | ACTIVE                                       │
│      * User ID & Hak Otoritas Sistem                                        │
│      * Callout Role-Based Reflection Prompt (Latar Hijau Lembut)            │
│    - KOLOM KANAN (Formulir Keamanan & Kata Sandi):                          │
│      * Input: Kata Sandi Saat Ini                                           │
│      * Input: Kata Sandi Baru (Disertai Indikator Kekuatan Sandi)           │
│      * Input: Konfirmasi Kata Sandi Baru                                    │
│      * Tombol: [Perbarui Kata Sandi] (Hijau #00674D)                        │
│      * Kartu Status Sesi Aktif: Terlindungi HttpOnly, SameSite=Strict       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-24-01 (Ganti Sandi Sukses):** Pengguna memasukkan sandi lama yang benar dan sandi baru valid $\rightarrow$ Sukses, pesan hijau muncul, form di-reset.
* **TC-24-02 (Sandi Lama Keliru):** Pengguna memasukkan sandi lama yang salah $\rightarrow$ Pesan error merah *"Kata sandi saat ini tidak valid"*.
