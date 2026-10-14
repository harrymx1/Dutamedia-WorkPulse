# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 01: AUTENTIKASI & AKTIVASI AKUN (LOGIN & ACTIVATION)

- **Berkas Prototipe:** [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html)
- **Rute Sistem:** `/login`, `/activate`, `/forgot-password`
- **Posisi Alur:** Gerbang Utama Akses Sistem (*System Gateway*) & Manajemen Identitas Pengguna
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Tujuan Utama Halaman
Halaman **Login & Aktivasi Akun** adalah pintu gerbang tunggal yang aman, profesional, dan ramah bagi seluruh tingkatan pengguna di PT Duta Media Solusindo. Halaman ini berfungsi untuk:
1. **Autentikasi Aman & Cepat:** Memberikan akses instan bagi karyawan aktif ke ruang kerja digital WorkPulse tanpa rintangan birokrasi yang rumit.
2. **Onboarding Akun Baru yang Terpandu:** Membimbing karyawan baru yang menerima tautan undangan aktivasi dari HRGA/Admin untuk menetapkan kata sandi pribadi yang kuat secara mandiri.
3. **Penyaluran Rute Berbasis Peran (*Role-Based Routing*):** Mengidentifikasi jabatan dan peran akun secara instan saat login berhasil, lalu menyalurkan pengguna langsung ke ruang kerja operasional yang relevan (misal: Kontributor langsung ke *Morning Commitment*, Pimpinan Tim ke *Pulse Dashboard*, HRGA ke *Compliance Queue*).
4. **Perlindungan Sesi Kerja di Tempat (*In-Place Session Protection*):** Melindungi data kerja yang sedang diisi melalui modal re-autentikasi tanpa me-redirect paksa yang dapat menghapus draf pekerjaan.

### 1.2 Prinsip Desain & Batasan Ketat
- **Strict 1-Screen Viewport (100vh):** Tampilan desktop dirancang pas dalam 1 layar tanpa memicu *scrollbar* vertikal peramban, memberikan kesan aplikasi kelas enterprise yang modern dan kokoh.
- **Tata Letak Terpisah (*Split Screen Narrative*):**
  - **Sisi Kiri (Brand Narrative - 45%):** Berlatar hijau hutan gelap (`#0B3327`), menyampaikan filosofi kerja terarah, transparansi blocker, dan pilar kolaborasi yang sehat.
  - **Sisi Kanan (Interactive Workspace - 55%):** Berlatar putih bersih dengan elevasi halus untuk seluruh alur interaksi formulir.
- **NOL Emoticon / Emoji:** Bebas dari karakter emoji; seluruh elemen grafis menggunakan ikon inline SVG monokrom bergaris tajam (ikon gembok, mata intip, centang, dan perisai).
- **Bahasa Manusiawi & Menenangkan (*Calm & Reassuring Tone*):** Menghindari pesan kesalahan yang menyalahkan pengguna. Kesalahan kredensial disampaikan secara objektif, dan akun terkunci disertai hitung mundur transparan.

---

## 2. ANATOMI & KOMPONEN ANTARMUKA (7 SUB-LAYAR TERPADU)

Seluruh proses autentikasi dikemas dalam satu arsitektur DOM tunggal dengan sistem pengalih layar terpadu (`showScreen(id)`):

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│              SISI KIRI                │              SISI KANAN               │
│       (Brand Storytelling 45%)        │      (Interactive Forms 55%)          │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Logo & Identitas Brand WorkPulse    │ [Screen 1] Login Utama (UF-01)        │
│ • Tagline: "Kerja Terarah,            │   - Input Email & Kata Sandi          │
│   Kolaborasi yang Sehat"              │   - Toggle Intip Sandi (SVG Eye)      │
│ • 3 Pilar Nilai Kerja:                │   - Opsi "Ingat Email"                │
│   1. Komitmen Pagi Terfokus           │   - Link "Lupa kata sandi?"           │
│   2. Pelaporan Blocker Cepat          ├───────────────────────────────────────┤
│   3. Kemitraan & Dukungan Tim         │ [Screen 2] Aktivasi Akun Baru         │
│ • Footer Lingkungan Kerja Internal    │   - Kartu Konfirmasi Identitas & Divisi│
│                                       │   - Input Kata Sandi Baru & Konfirmasi│
│                                       │   - 4-Bar Password Strength Meter     │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 3] Atur Ulang Kata Sandi      │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 4] Sukses Kirim Reset Link    │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 5] Sukses Aktivasi Akun       │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 6] Undangan Kedaluwarsa       │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 7] Akses Ditolak (403 State)  │
│                                       ├───────────────────────────────────────┤
│                                       │ [Modal] Re-autentikasi Sesi (UF-03)   │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BAKU & FORMULA KEAMANAN

### 3.1 Algoritma Evaluasi Kekuatan Kata Sandi (*Password Strength Engine*)
Setiap pengetikan kata sandi baru dievaluasi secara dinamis (*oninput*) dengan skor 1 s.d. 4:
- **Kriteria Skor:**
  1. Panjang $\ge 8$ karakter (+1 skor).
  2. Kombinasi huruf besar (`A-Z`) DAN huruf kecil (`a-z`) (+1 skor).
  3. Memuat minimal satu digit angka (`0-9`) (+1 skor).
  4. Memuat minimal satu simbol khusus/karakter non-alfanumerik (+1 skor).
- **Indikator Visual 4-Bar:**
  - **Skor 1 (Terlalu Lemah):** 1 bar merah (`#EF4444`) $\rightarrow$ *Formulir diblokir*.
  - **Skor 2 (Cukup):** 2 bar amber (`#F59E0B`) $\rightarrow$ *Memenuhi syarat minimum*.
  - **Skor 3 (Kuat):** 3 bar hijau (`#10B981`) $\rightarrow$ *Direkomendasikan*.
  - **Skor 4 (Sangat Aman):** 4 bar hijau tua (`#059669`) $\rightarrow$ *Optimal*.

### 3.2 Protokol Pencegahan Brute-Force (*Lockout Engine*)
- Jika pengguna memasukkan kombinasi email/password salah sebanyak **5 kali berturut-turut**:
  1. Tombol `Masuk ke Dashboard` otomatis **dinonaktifkan (*disabled*)**.
  2. Banner peringatan amber muncul: *"Batas Percobaan Terlampaui. Akun sementara terkunci demi keamanan. Silakan coba lagi dalam [N] detik."*
  3. Timer hitung mundur (*countdown*) 60 detik berjalan otomatis.
  4. Setelah 60 detik habis, banner tertutup otomatis, counter kesalahan direset, dan tombol submit aktif kembali.

### 3.3 Penyaluran Halaman Berbasis Peran (*Role Routing Matrix*)
Setelah kredensial terverifikasi, sistem menyusun objek sesi `workpulse_active_user` di `localStorage` dan mengarahkan pengguna ke halaman pendaratan yang sesuai:

| Peran Akun (*Role*) | Contoh Pengguna | Halaman Pendaratan (*Landing Route*) | Status Pengecualian (*isExempt*) |
| :--- | :--- | :--- | :--- |
| **EMPLOYEE** (Kontributor) | Budi Pratama | [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) | `false` |
| **SUPERVISOR** (Team Lead) | Siti Aminah | [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html) | `false` |
| **HEAD_OF_DEPARTMENT** (Manajemen) | Hendra Gunawan | [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html) | `false` |
| **HRGA** (Kepatuhan) | Dewi Anggraeni | [`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html) | `false` |
| **CEO / DIREKSI** (Eksekutif) | Ir. Bambang Soedirgo | [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) | `true` (*Exemption Banner Aktif*) |

### 3.4 Mekanisme Re-Autentikasi di Tempat (*In-Place Session Recovery - UF-03*)
- Saat token sesi kedaluwarsa di tengah aktivitas kerja pengguna, antarmuka memunculkan dialog modal `#modal-session-timeout`.
- Pengguna cukup memasukkan ulang kata sandinya di dalam modal.
- Jika kata sandi benar, modal tertutup seketika dan pengguna dapat langsung melanjutkan pekerjaan tanpa kehilangan teks draf yang sedang diketik.

---

## 4. KATALOG LENGKAP SKENARIO SISTEM HALAMAN 1

Berikut adalah 10 skenario pengujian fungsional dan perilaku antarmuka pada Halaman 01:

### Skenario 1.1: Login Berhasil Kontributor Mandiri (Standard Employee)
- **Kondisi:** Karyawan memasukkan email terdaftar `@dutamedia.com` dan kata sandi valid.
- **Tindakan UI:**
  - Tombol submit menampilkan status pemuatan: *"Memverifikasi Sesi..."*.
  - Objek sesi tersimpan ke `localStorage.setItem('workpulse_active_user', ...)`.
  - Browser melakukan pengalihan instan ke `02-Morning-Commitment.html`.

### Skenario 1.2: Login Berhasil Akun Eksekutif / CEO (Role Exemption)
- **Kondisi:** Email yang dimasukkan merupakan akun Direksi/CEO (misal: `bambang.soedirgo@dutamedia.com`).
- **Tindakan UI:**
  - Atribut sesi `isExempt` disetel `true`.
  - Browser diarahkan ke `02-Morning-Commitment.html`.
  - Halaman 02 mendeteksi nilai `isExempt: true` dan otomatis menampilkan *Exemption Banner* biru lembut di bagian atas layar.

### Skenario 1.3: Login Gagal Format Email / Kosong
- **Kondisi:** Pengguna mengosongkan input email atau mengetik email tanpa karakter `@`.
- **Tindakan UI:**
  - Input email diberi border merah dan atribut `aria-invalid="true"`.
  - Di bawah input muncul teks error: *"Masukkan alamat email kerja yang valid (@dutamedia.com)"*.
  - Kursor otomatis difokuskan ke field email.

### Skenario 1.4: Login Gagal Kredensial Salah
- **Kondisi:** Email dan kata sandi diisi tetapi tidak cocok dengan database server.
- **Tindakan UI:**
  - Muncul banner error merah lembut `#FFF8F8` di atas formulir: *"Email atau kata sandi tidak sesuai. Periksa kembali kredensial Anda."*
  - Counter kegagalan bertambah 1.

### Skenario 1.5: Penguncian Sementara Akun (Brute-Force Lockout)
- **Kondisi:** Percobaan login gagal mencapai 5 kali berturut-turut.
- **Tindakan UI:**
  - Muncul banner peringatan amber `#FFFDF7` dengan ikon segitiga peringatan.
  - Teks: *"Batas Percobaan Terlampaui. Akun sementara terkunci demi keamanan. Silakan coba lagi dalam [N] detik."*
  - Tombol masuk terkunci *disabled* dan hitung mundur berjalan mundur dari 60 detik hingga 0.

### Skenario 1.6: Alur Aktivasi Akun Pertama Kali (First-time Activation)
- **Kondisi:** Karyawan baru membuka tautan aktivasi dari email undangan (`?view=activation`).
- **Tindakan UI:**
  - Layar otomatis menampilkan **Screen 2: Aktivasi Akun Baru**.
  - Kartu identitas menyajikan nama karyawan (`Ayu Rahmadani`), email, divisi (`Product Design`), dan badge status `UNDANGAN AKTIF`.
  - Pengguna mengetik kata sandi baru: bar kekuatan sandi bergerak dinamis dari merah hingga hijau.
  - Jika kata sandi memenuhi kriteria ($\ge 8$ karakter kombinasi) dan konfirmasi cocok, tombol aktivasi berhasil mengalihkan ke **Screen 5: Aktivasi Selesai**.

### Skenario 1.7: Aktivasi Gagal — Kata Sandi Terlalu Lemah
- **Kondisi:** Pengguna mengetik kata sandi $< 8$ karakter (misal: `12345`).
- **Tindakan UI:**
  - Bar kekuatan sandi hanya terisi 1 bar merah (*Sangat Lemah*).
  - Teks error muncul: *"Kata sandi minimal 8 karakter dengan kombinasi angka/huruf."*
  - Formulir dicegah dari submit.

### Skenario 1.8: Aktivasi Gagal — Tautan Undangan Kedaluwarsa
- **Kondisi:** Pengguna membuka tautan aktivasi yang sudah kadaluwarsa $> 72$ jam atau token sudah pernah dipakai (`?view=expired`).
- **Tindakan UI:**
  - Layar beralih ke **Screen 6: Undangan Kedaluwarsa**.
  - Menampilkan kartu peringatan amber: *"Tautan aktivasi ini sudah melewati batas waktu berlaku atau telah digunakan sebelumnya. Hubungi Administrator untuk meminta undangan baru."*
  - Tombol mengarahkan kembali ke halaman login utama.

### Skenario 1.9: Permintaan Atur Ulang Kata Sandi (Forgot Password)
- **Kondisi:** Pengguna mengklik *"Lupa kata sandi?"* pada formulir login.
- **Tindakan UI:**
  - Layar beralih mulus ke **Screen 3: Atur Ulang Kata Sandi**.
  - Email yang sebelumnya diketik di form login otomatis di-copy ke input form reset.
  - Saat disubmit, sistem menampilkan **Screen 4: Instruksi Pemulihan Terkirim** dengan pesan keamanan terstandar (tidak mengonfirmasi apakah email terdaftar atau tidak demi mencegah *email enumeration attack*).

### Skenario 1.10: Re-autentikasi Sesi Kedaluwarsa di Tempat (UF-03)
- **Kondisi:** Sesi token habis saat pengguna sedang bekerja di halaman sistem.
- **Tindakan UI:**
  - Dialog modal `#modal-session-timeout` muncul di atas layar kerja saat ini dengan efek latar redup (*backdrop blur*).
  - Karyawan memasukkan kata sandi dan menekan *"Pulihkan Sesi & Lanjut Kerja"*.
  - Modal tertutup dan status kerja tetap aman tanpa kehilangan draf yang sedang diketik.

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND DEVELOPER

### 5.1 Skema Objek Sesi Pengguna (`localStorage: workpulse_active_user`)
Setiap kali proses login berhasil, backend wajib mengembalikan struktur JSON terstandar berikut untuk disimpan di sisi peramban:

```json
{
  "name": "Budi Pratama",
  "email": "budi.pratama@dutamedia.com",
  "role": "EMPLOYEE",
  "roleLabel": "Software Engineer",
  "function": "Engineering",
  "department": "Technology Squad A",
  "isExempt": false,
  "avatar": "BP",
  "targetPage": "02-Morning-Commitment.html"
}
```

### 5.2 Spesifikasi Endpoint API Autentikasi

#### 1. POST `/api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "budi.pratama@dutamedia.com",
    "password": "SecretPassword#2026",
    "remember_me": true
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { ... }
  }
  ```
- **Response 401 Unauthorized:**
  ```json
  {
    "success": false,
    "error_code": "INVALID_CREDENTIALS",
    "message": "Email atau kata sandi tidak sesuai.",
    "attempts_left": 2
  }
  ```
- **Response 429 Too Many Requests:**
  ```json
  {
    "success": false,
    "error_code": "ACCOUNT_TEMPORARILY_LOCKED",
    "lockout_seconds": 60
  }
  ```

#### 2. POST `/api/v1/auth/activate`
- **Request Body:**
  ```json
  {
    "activation_token": "act_tok_99182371",
    "password": "StrongPassword#2026",
    "password_confirmation": "StrongPassword#2026"
  }
  ```

#### 3. POST `/api/v1/auth/reauth`
- **Request Body:**
  ```json
  {
    "password": "SecretPassword#2026"
  }
  ```
- **Response 200 OK:** Memperpanjang masa aktif *access token* tanpa mengubah sesi yang sedang berjalan.

---

*Dokumen ini merupakan spesifikasi implementasi resmi untuk Halaman 01 WorkPulse. Segala perubahan wajib diselaraskan dengan [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md).*
