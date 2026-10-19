# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 01: AUTENTIKASI & AKTIVASI AKUN (LOGIN & ACTIVATION)

- **Berkas Prototipe:** [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html)
- **Rute Sistem:** `/login`, `/activate`, `/forgot-password`
- **Posisi Alur:** Gerbang Utama Akses Sistem (*System Gateway*) & Manajemen Identitas Pengguna
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Autentikasi Aman & Penyaluran Berbasis Peran (*Role Routing*):** Memverifikasi identitas pengguna dan menyalurkan pengguna secara otomatis ke ruang kerja yang relevan (Kontributor $\rightarrow$ Morning Commitment, Lead $\rightarrow$ Pulse Dashboard, HRGA $\rightarrow$ Compliance Queue).
2. **Onboarding Akun Baru Terpandu:** Membimbing karyawan baru menetapkan kata sandi pribadi yang kuat melalui verifikasi token undangan aktivasi.
3. **Perlindungan Sesi di Tempat (*In-Place Session Recovery*):** Menangani kedaluwarsa sesi melalui dialog modal tanpa me-redirect paksa, mencegah hilangnya draf yang sedang diketik.

### 1.2 Batasan Desain Baku
- **Strict 1-Screen Viewport (100vh):** Tata letak desktop tampil pas dalam 1 layar tanpa memicu scrollbar vertikal peramban.
- **Split-Screen Enterprise (45% Kiri : 55% Kanan):** Sisi kiri untuk narasi brand hijau hutan (`#0B3327`), sisi kanan untuk interaksi formulir di atas kanvas abu-abu lembut (`#F7FAF9`).
- **Nol Emoticon / Emoji & Bebas Ikon Petir:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom. Seluruh pilar blocker menggunakan ikon bendera kendala (*flag*) yang tenang, konsisten dengan Halaman 02 dan Halaman 03.
- **Label Inklusif:** Tombol utama menggunakan teks **`Masuk ke Ruang Kerja`** (menggantikan istilah bias `Masuk ke Dashboard`), mencerminkan rute tujuan riil karyawan.
- **100% Otentik Hasil Jadi Produksi & Nol Unsur Prototipe:** Bersih mutlak dari elemen pengujian/demo seperti tombol switcher peran (*demo role pills*), watermark prototipe, atau teks testing buatan. Semua interaksi berjalan otentik layaknya sistem enterprise nyata.

---

## 2. ANATOMI & KOMPONEN ANTARMUKA

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│              SISI KIRI                │              SISI KANAN               │
│       (Brand Storytelling 45%)        │      (Interactive Workspace 55%)      │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Logo & Identitas WorkPulse          │ • Mobile Brand Header (≤ 900px)       │
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

## 3. SPESIFIKASI ATURAN BAKU SISTEM

### 3.1 Penyaluran Rute Berbasis Peran (*Role Routing Matrix*)
Saat autentikasi berhasil, sistem menyusun objek `workpulse_active_user` di `localStorage` dan mengarahkan pengguna ke halaman tujuan:

| Peran Akun (*Role*) | Contoh Pengguna | Halaman Tujuan (*Landing Route*) | Status Pengecualian (*isExempt*) |
| :--- | :--- | :--- | :---: |
| **EMPLOYEE** (Staff) | `budi.pratama@dutamedia.com` | [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) | `false` |
| **SUPERVISOR** (Team Lead) | `siti.aminah@dutamedia.com` | [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html) | `false` |
| **HEAD_OF_DEPARTMENT** | `hendra.gunawan@dutamedia.com` | [`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html) | `false` |
| **HRGA** (Compliance) | `dewi.anggraeni@dutamedia.com` | [`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html) | `false` |
| **CEO / DIREKSI** | `bambang.soedirgo@dutamedia.com` | [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) | `true` (*Exemption Aktif*) |

### 3.2 Penyesuaian Responsif & Mobile Brand Header
- **Layar Desktop (> 900px):** Layout 2 kolom split-screen 100vh.
- **Layar Mobile ($\le$ 900px):** Panel kiri disembunyikan (`display: none`). Logo mini WorkPulse (`.mobile-brand-header`) otomatis muncul tepat di atas kartu form dengan lebar `width: min(100%, 440px)` yang sejajar presisi, menjaga identitas brand tetap utuh di smartphone.

### 3.3 Protokol Keamanan Anti Brute-Force
- **Ambang Batas:** Maksimal 5 kali kegagalan kombinasi kredensial berturut-turut.
- **Aksi Sistem:** Tombol submit dinonaktifkan (`disabled`), banner peringatan amber muncul, dan timer hitung mundur 60 detik berjalan otomatis. Form dibuka kembali setelah 60 detik berlalu.

### 3.4 Meteran Kekuatan Kata Sandi (*Password Strength Meter*)
Dievaluasi secara *real-time* pada layar aktivasi dengan skor 1 s.d. 4 (panjang $\ge 8$ karakter, kombinasi huruf besar-kecil, angka, simbol):
- **1 Bar (Merah `#EF4444`):** Terlalu Lemah $\rightarrow$ Tombol submit diblokir.
- **2 Bar (Amber `#F59E0B`):** Cukup $\rightarrow$ Ambang batas minimal valid.
- **3 Bar (Hijau `#10B981`):** Kuat $\rightarrow$ Memenuhi rekomendasi sistem.
- **4 Bar (Hijau Tua `#059669`):** Sangat Aman $\rightarrow$ Skor optimal.

---

## 4. KATALOG RINGKAS 8 SKENARIO PENGUJIAN SISTEM

| ID | Skenario | Kondisi Pemicu | Perilaku Antarmuka & Efek Sistem |
| :---: | :--- | :--- | :--- |
| **TC-01** | Login Staff | Kredensial Budi Pratama valid | Memverifikasi sesi $\rightarrow$ dialihkan ke `/today/morning` ([`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)). |
| **TC-02** | Login Supervisor | Kredensial Siti Aminah valid | Memverifikasi sesi $\rightarrow$ dialihkan ke `/dashboard` ([`08-Pulse-Dashboard.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/08-Pulse-Dashboard.html)). |
| **TC-03** | Login HRGA | Kredensial Dewi Anggraeni valid | Memverifikasi sesi $\rightarrow$ dialihkan ke `/compliance` ([`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html)). |
| **TC-04** | Login CEO (Exempt) | Kredensial Bambang Soedirgo | Dialihkan ke Halaman 02 dengan `isExempt: true` (*Exemption Banner* aktif). |
| **TC-05** | Kredensial Salah | Email/password tidak cocok | Muncul banner merah: *"Email atau kata sandi tidak sesuai"*. Counter bertambah. |
| **TC-06** | Lockout Brute-Force | 5x gagal berurutan | Tombol disabled, banner lockout aktif, hitung mundur 60 detik berjalan. |
| **TC-07** | Aktivasi Akun Baru | Buka tautan aktivasi karyawan | Muncul form aktivasi, live 4-bar password strength meter, validasi kecocokan sandi. |
| **TC-08** | Sesi Timeout (UF-03) | Token sesi habis saat kerja | Modal dialog re-autentikasi muncul di tempat; input password memulihkan sesi tanpa reload. |

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND

### 5.1 Endpoint Login Utama
`POST /api/v1/auth/login`

#### Payload Request (JSON):
```json
{
  "email": "budi.pratama@dutamedia.com",
  "password": "Dutamedia#2026",
  "rememberMe": true
}
```

#### Respons Sukses Server (HTTP 200 OK):
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

### 5.2 Endpoint Aktivasi Akun
`POST /api/v1/auth/activate`
- **Request:** `{ "token": "act_tok_88912", "newPassword": "SecurePassword#2026" }`
- **Response 200 OK:** `{ "success": true, "message": "Akun berhasil diaktifkan." }`

---

## 6. STATUS KESIAPAN PROTOTIPE

Dokumen ini adalah **acuan resmi tunggal (*single source of truth*)** untuk implementasi modul Autentikasi dan Aktivasi Akun WorkPulse. Seluruh spesifikasi pada berkas [`01-Login-Activation.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/01-Login-Activation.html) telah teruji secara visual di viewport desktop dan mobile, bebas error, serta selaras 100% dengan Halaman 02, Halaman 03, dan pedoman konsistensi sistem.
