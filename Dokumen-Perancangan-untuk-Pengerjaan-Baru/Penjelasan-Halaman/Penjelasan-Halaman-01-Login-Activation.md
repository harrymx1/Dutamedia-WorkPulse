# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 01: AUTENTIKASI & AKTIVASI AKUN (LOGIN & ACTIVATION)

- **Berkas Prototipe:** [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html)
- **Rute Sistem:** `/login`, `/activate`, `/forgot-password`
- **Posisi Alur:** Gerbang Utama Akses Sistem (*System Gateway*) & Manajemen Kredensial Pengguna
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Autentikasi Aman & Penyaluran Berbasis Peran (*Role-Based Routing*):** Memverifikasi identitas pengguna secara aman dan mendistribusikan pengguna langsung ke ruang kerja operasional yang relevan (Karyawan $\rightarrow$ Morning Commitment, Supervisor/HOD $\rightarrow$ Pulse Dashboard, HRGA $\rightarrow$ Compliance Queue).
2. **Aktivasi Akun Karyawan Baru Terpandu (*Guided Onboarding*):** Memandu staf baru membuat kata sandi pertama yang kuat melalui validasi token undangan email.
3. **Pemulihan Sesi di Tempat (*In-Place Session Recovery* — UF-03):** Menangani kedaluwarsa token sesi (*JWT expiration*) melalui dialog modal di layar aktif tanpa me-redirect paksa, menjaga draf kerja karyawan tidak hilang.

### 1.2 Batasan Desain Baku
- **Strict 1-Screen Viewport (100vh):** Tata letak desktop tampil presisi dalam 1 layar tanpa memicu scrollbar vertikal browser.
- **Split-Screen Enterprise (45% Kiri : 55% Kanan):** Sisi kiri untuk narasi nilai korporat berlatar hijau hutan (`#0B3327`), sisi kanan untuk interaksi formulir di atas kanvas bersih (`#F7FAF9`).
- **Nol Emoticon & Ikon Monokrom:** Seluruh visual menggunakan tipografi korporat dan inline SVG monokrom (`stroke-width="1.8-2.2"`). Pilar kendala menggunakan ikon bendera (*flag*), selaras dengan modul pelaporan blocker.
- **Label Inklusif:** Tombol utama berlabel **`Masuk ke Ruang Kerja`** (bukan *Masuk ke Dashboard*), mencerminkan rute riil kontributor.
- **100% Otentik Hasil Produksi:** Bersih mutlak dari elemen demo (tanpa role switcher bar, watermark prototipe, atau tombol jalan pintas uji coba).

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│              SISI KIRI                │              SISI KANAN               │
│       (Brand Storytelling 45%)        │      (Interactive Workspace 55%)      │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Logo & Identitas WorkPulse          │ • Mobile Brand Header (Tampil ≤900px) │
│ • Tagline: "Kerja terarah.            ├───────────────────────────────────────┤
│   Kolaborasi yang sehat."             │ [Screen 1] Login Utama:               │
│ • 3 Pilar Nilai Kerja:                │   - Input Email & Kata Sandi + Toggle │
│   1. Komitmen Pagi Terfokus (Slot 1–3)│   - Opsi "Ingat email" & Lupa Sandi   │
│   2. Pelaporan Blocker Cepat (Flag SVG│   - Tombol: [Masuk ke Ruang Kerja]    │
│   3. Kemitraan & Dukungan Tim (Shield)│   - Panduan Bantuan IT Support / HRGA │
│ • Footer: v1.5 PT Dutamedia           ├───────────────────────────────────────┤
│                                       │ [Screen 2] Aktivasi Akun Baru         │
│                                       │   - Preview Akun & Password Meter 4-Bar│
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 3] Atur Ulang Kata Sandi      │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 4] Sukses Kirim Reset Link    │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 5] Sukses Aktivasi Akun       │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 6] Undangan Kedaluwarsa       │
│                                       ├───────────────────────────────────────┤
│                                       │ [Screen 7] Akses Ditolak (403)        │
│                                       ├───────────────────────────────────────┤
│                                       │ [Modal] Re-autentikasi Sesi (UF-03)   │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.1 Penyaluran Rute Berbasis Peran (*Role Routing Matrix*)
Saat login berhasil, sistem menyusun objek `workpulse_active_user` pada `localStorage` dan mengarahkan pengguna ke halaman pendaratan:

| Peran Akun (*Role*) | Contoh Kredensial | Halaman Tujuan (*Landing Route*) | Status Pengecualian (*isExempt*) |
| :--- | :--- | :--- | :---: |
| **EMPLOYEE** | `budi.pratama@dutamedia.com` | [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) | `false` |
| **SUPERVISOR** | `siti.aminah@dutamedia.com` | [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html) | `false` |
| **HEAD_OF_DEPARTMENT** | `hendra.gunawan@dutamedia.com` | [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html) | `false` |
| **HRGA** | `dewi.anggraeni@dutamedia.com` | [`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html) | `false` |
| **EXECUTIVE / DIREKSI** | `bambang.soedirgo@dutamedia.com` | [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) | `true` (*Exemption Aktif*) |

### 3.2 Penyesuaian Responsif & Mobile Brand Header
- **Desktop (> 900px):** Layout 2 kolom split-screen 100vh.
- **Mobile ($\le$ 900px):** Panel kiri di-*hide* (`display: none`). Logo mini WorkPulse (`.mobile-brand-header`) otomatis muncul tepat di atas formulir login selebar kartu (`width: min(100%, 440px)`).

### 3.3 Proteksi Brute-Force & Lockout
- **Ambang Batas:** Maksimal 5 kali kegagalan kombinasi email/kata sandi berturut-turut.
- **Aksi Sistem:** Tombol submit dinonaktifkan (`disabled`), banner peringatan amber aktif, dan timer hitung mundur 60 detik berjalan otomatis. Form dibuka kembali setelah waktu habis.

### 3.4 Indikator Kekuatan Sandi (*Password Strength Meter*)
Dievaluasi secara *real-time* pada aktivasi akun (panjang $\ge 8$ karakter, huruf kapital, huruf kecil, angka, simbol):
- **1 Bar (Merah `#EF4444`):** Terlalu Lemah $\rightarrow$ Tombol submit dinonaktifkan.
- **2 Bar (Amber `#F59E0B`):** Cukup $\rightarrow$ Ambang batas minimal valid.
- **3 Bar (Hijau `#10B981`):** Kuat $\rightarrow$ Memenuhi standar keamanan sistem.
- **4 Bar (Hijau Botol `#059669`):** Sangat Aman $\rightarrow$ Skor optimal.

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Login Karyawan Reguler | Kredensial Budi Pratama valid | Sesi tersimpan $\rightarrow$ dialihkan ke `/today/morning` ([`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)). |
| **TC-02** | Login Supervisor Tim | Kredensial Siti Aminah valid | Sesi tersimpan $\rightarrow$ dialihkan ke `/dashboard` ([`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html)). |
| **TC-03** | Login Verifikator HRGA | Kredensial Dewi Anggraeni valid | Sesi tersimpan $\rightarrow$ dialihkan ke `/compliance` ([`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html)). |
| **TC-04** | Login Akun Pengecualian | Kredensial Bambang Soedirgo | Dialihkan ke Halaman 02 dengan `isExempt: true` (*Exemption Banner* aktif). |
| **TC-05** | Kredensial Tidak Valid | Email atau sandi salah | Tampil banner merah lembut: *"Email atau kata sandi tidak sesuai"*. Counter percobaan bertambah. |
| **TC-06** | Lockout Percobaan Login | 5x gagal berurutan | Tombol submit dikunci, banner lockout aktif, timer mundur 60 detik berjalan. |
| **TC-07** | Aktivasi Akun Baru | Buka rute aktivasi dengan token | Formulir aktivasi terbuka, live 4-bar password strength meter aktif, validasi konfirmasi sandi. |
| **TC-08** | Pemulihan Sesi (UF-03) | Token sesi habis saat kerja | Modal dialog re-autentikasi muncul di tempat; input sandi memulihkan sesi tanpa reload. |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 02 (Morning Commitment)** | Menerima pengalihan peran `EMPLOYEE` dan menyajikan data profil pengguna pada sidebar bawah dari `localStorage: workpulse_active_user`. |
| **Halaman 08 (Pulse Dashboard)** | Menerima pengalihan peran `SUPERVISOR` dan `HEAD_OF_DEPARTMENT`. |
| **Halaman 11 (Compliance HRGA)** | Menerima pengalihan peran `HRGA`. |
| **Halaman 24 (Profile Settings)** | Menjadi tujuan pengelolaan profil lanjutan dan penggantian kata sandi setelah masuk ke sistem. |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 Endpoint Login
- **Rute:** `POST /api/v1/auth/login`
- **Request Payload (JSON):**
```json
{
  "email": "budi.pratama@dutamedia.com",
  "password": "Dutamedia#2026",
  "rememberMe": true
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Autentikasi berhasil.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 28800,
    "user": {
      "id": "usr_1001",
      "name": "Budi Pratama",
      "email": "budi.pratama@dutamedia.com",
      "role": "EMPLOYEE",
      "roleLabel": "Software Engineer",
      "function": "Engineering",
      "department": "Technology Squad A",
      "isExempt": false,
      "landingRoute": "/today/morning"
    }
  }
}
```

### 6.2 Endpoint Aktivasi Akun Baru
- **Rute:** `POST /api/v1/auth/activate`
- **Request Payload (JSON):**
```json
{
  "token": "act_tok_88912",
  "newPassword": "SecurePassword#2026"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Akun berhasil diaktifkan. Silakan masuk menggunakan kata sandi baru Anda."
}
```

### 6.3 Endpoint Re-autentikasi Sesi di Tempat (UF-03)
- **Rute:** `POST /api/v1/auth/refresh-session`
- **Request Payload (JSON):**
```json
{
  "email": "budi.pratama@dutamedia.com",
  "password": "Dutamedia#2026"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
    "expiresIn": 28800
  }
}
```

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Autentikasi dan Aktivasi Akun WorkPulse. Seluruh spesifikasi pada berkas [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html) telah divalidasi responsif di desktop maupun smartphone, bebas error, serta siap diimplementasikan ke dalam komponen frontend dan controller backend.
