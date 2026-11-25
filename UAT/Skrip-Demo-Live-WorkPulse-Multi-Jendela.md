# SKRIP DEMO LIVE WORKPULSE — MULTI-JENDELA (100% SEMUA ALUR & KONDISI)

**Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Password Semua Akun Uji:** `Password123!` · **Zona Waktu:** WIB (`Asia/Jakarta`)

> **Cara Pakai Skrip Ini:**
> - **Bahasa obrolan sehari-hari & langsung klik:** Semua nama menu, tombol, pesan layar, dan teks isian sudah persis cocok dengan aplikasi. Tinggal ikuti urutannya.
> - **Arti `🎯 Sampaikan di Awal (Alasan & Aturan Sistem)`:** Naskah singkat (±2–3 kalimat padat untuk petinggi perusahaan) yang paling tepat disampaikan **tepat saat mulai masuk ke langkah/halaman tersebut** sebelum mulai mengklik, agar audiens langsung paham *mengapa* aturan itu dirancang demikian dan *bagaimana* sistem menegakkannya.
> - **Arti `[INTI]` vs `[CABANG]`:**
>   - **`[INTI]`** = alur utama dari awal sampai akhir (±30–35 menit). Tetap nyambung 100% meski semua `[CABANG]` dilewati.
>   - **`[CABANG]`** = variasi lain, validasi error (`400`/`403`/`404`/`409`/`422`), dan kasus khusus (total ±55–60 menit kalau dijalankan semua). Semua cabang ditaruh **sebelum tombol kirim** atau pakai **akun/tiket terpisah**, jadi **100% aman jalan lurus dari Babak 1 ke Babak 9 tanpa reset database di tengah demo**.

---

## 1. PETA 5 JENDELA CHROME (MAKSIMAL 5 BERSAMAAN)

Buka maksimal 5 jendela Chrome (boleh 4 profil Chrome + 1 Incognito) biar minim keluar-masuk akun:

| Jendela | Akun Login (`Password123!`) | Halaman Awal | Catatan Ganti Akun |
|---|---|---|---|
| **Jendela 1** | `direktur@dutamedia.com` — **Hendra Wijaya** (`CEO_MANAGEMENT`) | `/admin/policies` | **0x ganti akun** (Babak 1, 2, 7, 8, 9) |
| **Jendela 2** | Mulai `product@dutamedia.com` — **Bagas Saputra** (`PROJECT_MANAGER`) | `/daily/morning` | Ganti di **Babak 3B** ke `network.infra@dutamedia.com` (**Reza**), lalu **Babak 3C–7A** ke `dev.frontend@dutamedia.com` (**Aditya**) |
| **Jendela 3** | `head.eng@dutamedia.com` — **Arif Budiman** (`HEAD` Engineering) | `/dashboard` | **0x ganti akun** (Babak 3, 4, 6, 7) |
| **Jendela 4** | `hrga@dutamedia.com` — **Dewi Lestari** (`HRGA`) | `/admin/users` | **0x ganti akun** (Babak 1, 5, 6, 8) |
| **Jendela 5 (Incognito)** | Akun tamu & cabang terpisah (ganti per babak) | `/login` | Babak 1 (`Budi` → `admin@dutamedia.com`), 2B (`Nadia`), 2D (`Gilang`), 3A–B (`Raka`), 5 (`Intan`), 8C (`Rian`) |

---

## 2. PEMISAHAN DATA UJI (`seed.ts`) & CHECKLIST 5 MENIT PRA-DEMO

### A. Pemisahan Akun & Objek (`[INTI]` vs `[CABANG]`) — Anti-Bentrok State
| Akun / Data di `seed.ts` | Dipakai untuk Jalur | Kondisi Awal Setelah Reset Bersih |
|---|---|---|
| `product@dutamedia.com` (**Bagas Saputra**) | **`[INTI]`** Siklus Harian | Form pagi kosong + `Prioritas Kemarin Sore` + `Carry-Over #2 AMBER` & `#1 GREEN` |
| `dev.frontend@dutamedia.com` (**Aditya**) | **`[INTI]`** Blocker + Koreksi + Notif | Komitmen pagi sudah terkunci (`ON-TIME`) + tiket `OOM` (`WP-CORE`) + tiket `CROSS_TEAM` + tiket `NETWORK` + 2 catatan coaching |
| `intern.frontend@dutamedia.com` (**Raka**, `Intern`) | **`[INTI]`** `RED` Wajib Blocker + Jalan Pintas + `Intern` | Form pagi kosong + `Carry-Over #1` `WP-CORE` + punya izin tercatat `H+5` (`PERMIT`) |
| `specialist.it@dutamedia.com` (**Gilang**, PIC `HOSTING_DOMAIN`) | **`[INTI]`** Bukti Cuti Hari Ini + Cuti Vertikal | Cuti `APPROVED` hari ini → otomatis bebas check-in + blocker `HOSTING_DOMAIN` naik ke `Gunawan Setiawan` |
| `qa@dutamedia.com` (**Nadia**) | **`[CABANG]`** Kirim `0 Komitmen` | Form pagi kosong + 1 baris kepatuhan `H-2` berstatus `Sudah Ditangani` |
| `staff.finance@dutamedia.com` (**Intan**) | **`[CABANG]`** Uji live Cuti, Dispensasi, & Pengecualian Permanen | Form pagi kosong & jadwal normal → bisa dites dikunci sementara/permanen lalu di-Edit & di-Hapus kembali normal |
| `Reza` / `Gunawan` / `Dharma` / `Bambang` | PIC & Non-PIC Blocker | 6 tiket lintas kategori siap demo + 1 tiket `CRITICAL` lewat batas waktu (`-2 jam` di `WP-CORE`) |
| `Bayu Santoso` (`ST/HRGA/2026/XI/104`) | Data awal `/exemptions` | 1 dispensasi `Dinas Luar` (`H+2 s/d H+3`) siap tampil |

### B. Checklist 5 Menit Sebelum Demo
- [ ] Jalankan reset & seed bersih (`node backend/scripts/reset_live_seed.cjs` atau `npx prisma db seed`) agar seluruh nama akun terbaru, struktur pengecualian permanen, tanggal demo, dan catatan database yang bersih bebas kode internal langsung tersinkron di database live.
- [ ] Buka 5 jendela Chrome sesuai tabel di Bagian 1, login `Jendela 1–4` sekaligus.
- [ ] Cek cepat `Jendela 2` (`Bagas Saputra`): kalau ada sisa draf lokal dari latihan sebelumnya, klik **`Reset Draf`**.
- [ ] Nyalakan *Do Not Disturb* / *Focus Assist* di laptop sebelum *share screen*.

---

## 3. MATRIKS CAKUPAN 100% (BUKTI TIDAK ADA YANG TERLEWAT)

| Area / Fitur / Aturan / Percabangan | Dibuktikan di Babak |
|---|---|
| Undangan 72 jam + Cabut + Kirim Ulang + Aktivasi token 64 karakter + `/admin/invitations` | `1A`, `1A-C`, `1B` |
| Tolak login `INVITED`, `Ingat email`, `Show/Hide`, kunci `429` (dijelaskan), `/profile`, `403` & `404` | `1B`, `1C` |
| **Pemisahan Tugas CEO & Admin (Notifikasi Hybrid)** tanpa menu `Workspace` | `1C`, `7A` |
| Jam Cut-Off `LOCKED` + Jalur Cadangan `Additional Work` (`Komitmen Pagi Terlewat`) + Geser Cut-Off live + audit trail | `2A`, `9` |
| **Hari Bebas Komitmen (`0 Komitmen`)** | `2B` |
| **Pengingat `Prioritas Kemarin Sore`** + `Carry-Over #2+ AMBER` + `Simpan Draf` + batas 3 slot | `2C` |
| Validasi `< 3` huruf (`400`), `AMBER` tanpa uraian (`400`), **Aturan `AMBER` Tidak Wajib Tiket Blocker** | `2C` |
| **Pembebasan Check-In Otomatis (Cuti & Dispensasi)** mengunci `/daily/*` tanpa `0 komitmen` + **`Read-Only`** `/daily/history` | `2D`, `5A`, `5B`, `5C` |
| `Additional Work`: tambah tugas atasan (`Intern` 0x di list) + `Edit` + `Hapus` wajib alasan | `2E` |
| `EOD Outcome`: 4 hasil (`Selesai`, `Sebagian` → lanjut, `Belum Selesai` → stop wajib alasan, `Dibatalkan` → wajib alasan) + **Saran Status Akhir Hari Tanpa Paksaan** vs `Tetap Kirim sebagai AMBER` + kunci pasca-EOD | `2F` |
| `Riwayat Saya` (`/daily/history`): KPI, *expand row*, panel read-only cuti/dispensasi, `Unduh CSV` | `2G`, `5A`, `5C` |
| `RED` wajib blocker + tolak tanpa tiket + **Jalan Pintas Buat Tiket Blocker dari Form Pagi** (simpan draf → `/raise-blockers` → balik otomatis) | `3A` |
| 16 Kategori (5 grup) + 9 Dampak (maks `3/3`) + **Aturan Cuti Vertikal PIC (Naik ke Atasan)** (`Organizational Authority`) + **Penanggung Jawab Kategori (Staf Spesialis)** | `3A`, `3B` |
| Siklus Blocker penuh: `Terima & Tangani` → `Beri Bantuan` → `Membantu Sebagian` → `Selesaikan` → `Belum Memadai` → tutup; `Bantu Unblock` auto-scroll + non-PIC + `Feed Dukungan Lintas Fungsi` + `Terima Risiko` | `3B`, `3C` |
| **Ubah Divisi Tujuan Otomatis (*Dynamic Re-Routing*) & Hapus Tiket** (3 preset) + Radar `Aging` | `3D`, `3E` |
| Koreksi Pagi & EOD: `Minor` (`AUTO_APPLIED`) + `Material` (`Tolak` → revisi `Gunakan Draf Sebelumnya & Sesuaikan` → `Setujui`) | `4A`, `4B`, `4C` |
| `/admin/leaves` (Tambah, `:min`, tolak Sabtu–Minggu `400`, bentrok `409`, `Intern` `400`, Edit, Hapus) + `/exemptions` (Tambah, **Pengecualian Permanen — Bebas Komitmen Harian, `Lapor Blocker` Tetap Aktif**, Edit, Hapus) | `5A`, `5B`, `5C` |
| `/compliance` (`Tindak Lanjut`, validasi `< 5` huruf, `Ubah Catatan`) + `/coaching` (`Dibagikan` vs `Rahasia Manajemen`, template cepat) | `6A`, `6B` |
| `/notifications` (lencana sidebar/TopBar, isolasi `Rahasia`, **Pengecekan Hak Akses Tautan Otomatis** sembunyikan tombol `/admin/policies`, tab `Pengaturan Kanal`) | `7A` |
| `/dashboard` 3 cakupan (`PROJECT` / `DIVISION` / `COMPANY` + filter `Intern`) + `/projects/risk` + `/reports` (preset, filter `Kontrak`, CSV & PDF) | `7B`, `7C`, `7D` |
| `/admin/users` (`Nonaktifkan`/`Aktifkan Kembali`, `Akun Anda`), `/admin/organization` (`Intern` 0x, anti-siklus `422`, angkat `Intern`, `Project Authority` tolak PM=Reviewer), `/admin/temporary-reviewers` (bukti login `Review Koreksi` + `Antrean Blocker`), `/admin/policies` multi-owner, `/admin/notifications` uji kirim 9 trigger | `8A`–`8E` |

---

## 4. SKRIP 9 BABAK DEMO LIVE

---

### BABAK 1 — Onboarding, Login, Profil, `403/404`, & Pemisahan Tugas CEO & Admin (Notifikasi Hybrid)
> **Estimasi:** 5–6 menit · **Prasyarat:** Data hasil seed bersih · **Dampak:** Akun `Budi Santoso` aktif (total 25 user aktif).

#### `1A [INTI]` HRGA Undang Karyawan Baru `[Jendela 4 — Dewi Lestari (HRGA)]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"WorkPulse adalah sistem internal perusahaan, jadi sengaja tidak ada tombol daftar akun bebas dari luar, dan Admin atau HRGA pun tidak pernah membuatkan password untuk karyawan. Aksesnya hanya lewat undangan resmi berupa token 64 karakter sekali pakai yang berlaku 72 jam — kalau salah kirim atau bocor, token lama bisa langsung dicabut dan diterbitkan ulang."*
- **Aksi:** Di menu **`Kelola Pengguna`** (`/admin/users`), klik **`Undang Pengguna Baru`**, lalu isi:
  - **Nama Lengkap:** `Budi Santoso`
  - **Alamat Email Perusahaan:** `budi.santoso@dutamedia.com`
  - **Status Karyawan:** `Karyawan Tetap`
  - **Peran:** `Karyawan`
  - **Divisi:** `Engineering`
  - **Jabatan:** `Backend Engineer`
  - Klik **`Terbitkan Undangan (72 Jam)`**.
- **Lihat di layar:** Keluar kode token 64 karakter + tombol **`Salin Token Aktivasi`**. Klik **`Salin Token Aktivasi`** → **`Selesai`**.
- **Bilang singkat:** *"Begitu diterbitkan, token hanya muncul sekali ini untuk diserahkan ke karyawan yang bersangkutan."*

#### `1A-C [CABANG]` Uji Cabut & Kirim Ulang Token + Cek `/admin/invitations` `[Jendela 4 — HRGA]`
- **Aksi:**
  1. Pada baris `Budi Santoso`, klik **`Cabut`** → di modal `Cabut Undangan Aktivasi` klik **`Ya, Cabut Undangan`** → status berubah merah **`Dicabut`** (token lama hangus).
  2. Klik **`Kirim Ulang`** → di modal `Kirim Ulang Undangan Aktivasi` klik **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** (pakai token baru ini!) → **`Selesai`**.
  3. Klik menu **`Undangan Karyawan`** (`/admin/invitations`) sebentar buat nunjukin riwayat status undangan (*Menunggu*, *Dicabut*, *Sudah Diaktifkan*).
- **Bilang singkat:** *"Statusnya langsung tercatat rapi dari Menunggu, Dicabut, sampai Sudah Diaktifkan — token yang dicabut otomatis hangus."*

#### `1B [INTI]` Tolak Login `INVITED`, Aktivasi Token, Login, & Profil `[Jendela 5 — Incognito]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Akun yang belum diaktivasi akan ditolak otomatis saat mencoba masuk. Selain itu, kita sengaja tidak menyediakan fitur 'Lupa Kata Sandi' mandiri via email — pemulihan akun tetap dikendalikan lewat HRGA atau System Admin supaya keamanannya terjaga dan nggak bergantung ke server email luar."*
- **Aksi:**
  1. Buka `/login` (tab **`Masuk Sistem`**), ketik `budi.santoso@dutamedia.com` dan `Password123!` → klik tombol **`Masuk ke Sistem`**.
     - *Lihat di layar:* Ditolak merah **`"Akun Anda belum diaktifkan..."`**. Tunjuk ikon mata, centang `Ingat email di perangkat ini`, dan info kontak HRGA jika lupa sandi.
  2. Klik tab **`Aktivasi Akun`** (`/activate`): tempel token 64 karakter dari HRGA → isi sandi baru & konfirmasi `Password123!` → klik tombol **`Aktifkan Akun Saya`**.
     - *Lihat di layar:* Muncul pratinjau `Budi Santoso · Engineering` sebelum simpan, 3 syarat centang hijau + meteran `Sangat Kuat`, lalu layar **`Aktivasi Berhasil!`**.
  3. Klik **`Lanjut ke Halaman Masuk`**, login `budi.santoso@dutamedia.com` / `Password123!` → klik **`Masuk ke Sistem`** → mendarat otomatis di `/daily/morning`.
  4. Klik avatar **`BS`** di pojok kanan atas (`/profile`): tunjukkan **1. Kartu Identitas & Penugasan Aktif**, isi pratinjau kolom ganti sandi (`DutamediaBaru2026!`) untuk nunjukin 3 syarat centang hijau & opsi *Akhiri seluruh sesi aktif di perangkat lain* **(JANGAN klik `Simpan Kata Sandi Baru` biar password tetap `Password123!`)**, dan **3. Ringkasan Kanal Notifikasi Perangkat Ini**.
- **Bilang singkat:** *"Setelah aktivasi mandiri pakai token dan bikin sandi pribadi, karyawan baru bisa masuk ke halaman kerjanya dan kelola keamanan akunnya sendiri."*

#### `1C [CABANG]` Uji `403`/`404` & Pemisahan Tugas CEO + Admin (Notifikasi Hybrid) `[Jendela 5 & Jendela 1]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk Direktur dan System Admin, kami sengaja menghilangkan seluruh menu Workspace harian. Kenapa? Karena keduanya bukan peserta wajib lapor komitmen harian — kalau menu itu dibiarkan muncul, selain memenuhi layar, datanya berisiko mengotori metrik kepatuhan tim operasional. Untuk notifikasi, keduanya tetap punya akses cepat lewat ikon lonceng di pojok kanan atas."*
- **Aksi:**
  1. Masih sebagai **Budi (`Jendela 5`)**: ketik URL `/admin/policies` → tampil **`403 — Akses Dibatasi`** → klik **`Kembali ke Beranda`**. Ketik URL `/halaman-tidak-ada` → tampil **`404 — Halaman Tidak Ditemukan`** → klik **`Kembali ke Beranda`**, lalu klik **`Keluar Sesi`** (di `/profile` atau tombol keluar kiri bawah sidebar).
  2. Login **`Jendela 5`** sebagai **`admin@dutamedia.com`** (`SYSTEM_ADMIN`) → tunjuk sidebar kiri **tidak ada grup `Workspace`**, ketik URL `/daily/morning` → ditolak **`403 — Akses Dibatasi`**, lalu keluar akun.
  3. Tunjuk **`Jendela 1` (`Hendra Wijaya` — Direktur / `CEO_MANAGEMENT`)**: tunjuk sidebar kiri **grup `Workspace` juga sudah dihilangkan**, buka `/blockers` sebentar → tombol **`+ Laporkan Blocker Baru` tersembunyi**, ketik URL `/daily/morning` → ditolak **`403`**, lalu klik **ikon lonceng di TopBar kanan atas** untuk masuk ke `/notifications`.
- **Bilang singkat:** *"Pembatasannya dijaga di layar sekaligus di server — jadi meskipun URL-nya diketik langsung, tetap ditolak 403."*

---

### BABAK 2 — Kunci Pagi (`LOCKED`), Geser Jam Cut-Off, & Siklus Harian Lengkap
> **Estimasi:** 10 menit · **Prasyarat:** `Bagas` & `Nadia` belum isi form hari ini; `Gilang` cuti resmi hari ini · **Dampak:** `Bagas` selesai 1 siklus penuh (Morning → AddWork → EOD → History); `Nadia` tercatat `0 Komitmen`.

#### `2A [INTI]` Kunci Pagi (`LOCKED`), Jalur Cadangan `Additional Work`, & Geser Jam Cut-Off `[Jendela 2 ↔ Jendela 1]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Aturan waktu lapor pagi dibagi tiga: Tepat Waktu, Terlambat di masa tenggang, dan Terkunci otomatis begitu melewati batas Cut-Off. Kenapa harus dikunci? Supaya komitmen pagi betul-betul mencerminkan rencana kerja di awal hari, bukan baru dikarang sore harinya. Tapi jam batasnya tidak kami matikan kaku di kode — Pemilik Kebijakan bisa mengaturnya kapan saja lengkap dengan jejak audit, dan karyawan yang terlewat tetap punya jalur pencatatan kerja siang lewat Additional Work."*
- **Aksi:**
  1. Di **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**:
     - *Kalau jam demo sudah lewat `09:30 WIB` (paling sering):* langsung tampil spanduk merah **`LOCKED (Pasca Cut-Off)`**.
     - *Kalau demo dilakukan pagi sebelum `09:30 WIB`:* di **`Jendela 1 — Direktur`** (`/admin/policies`), ubah dulu sebentar *Batas Tepat Waktu* & *Batas Cut-Off Pagi* jadi 5 menit sebelum jam sekarang → refresh `Jendela 2` agar spanduk merah **`LOCKED (Pasca Cut-Off)`** muncul.
  2. Klik tab **`2. Additional Work`** (`/daily/additional-work`) → tunjuk formulir tetap terbuka dengan alasan otomatis **`Komitmen Pagi Terlewat`**.
  3. Pindah ke **`Jendela 1 — Direktur` (`/admin/policies`)**:
     - Klik **`+ Buat Versi Kebijakan Baru`**, ubah jam pagi biar longgar dari jam sekarang (misal demo malam jam 20:00 → set `23:40` & `23:50`; demo siang jam 13:00 → set `16:00` & `16:30`):
       - **Batas Tepat Waktu Pagi *:** *(1–2 jam setelah jam sekarang, misal `23:40`)*
       - **Batas Kunci Pengisian Pagi (Cut-Off) *:** *(lebih akhir, misal `23:50`)*
       - **Batas Tepat Waktu Sore (EOD) *:** `23:55` *(atau `17:00` jika siang)*
       - **Batas Kunci Pengisian Sore (Cut-Off) *:** `23:59`
       - **Tanggal Mulai Berlaku *:** *(hari ini WIB)*
       - **Alasan Perubahan Kebijakan *:**
         ```text
         Geser jam batas pengisian sebentar untuk keperluan demo live WorkPulse
         ```
     - Klik **`Simpan & Terapkan Versi Baru`**.
  4. Balik ke **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**, tekan **`F5`**.
- **Lihat di layar:** Status berubah hijau **`ON-TIME`** dan formulir terbuka. **⚡ Efek Lintas Jendela:** Lencana angka merah di menu sidebar **`Notifikasi`** & lonceng TopBar langsung nyala.
- **Bilang singkat:** *"Begitu Direktur simpan versi kebijakan baru, form karyawan langsung kebuka sesuai jadwal baru dan semua staf langsung dapat notifikasinya."*

#### `2B [CABANG]` Hari Bebas Komitmen (`0 Komitmen`) `[Jendela 5 — Nadia Kusuma (qa@dutamedia.com)]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Bagaimana kalau hari ini karyawan mengikuti pelatihan seharian atau agenda non-operasional tanpa target tugas harian biasa? Daripada memaksa mereka mengarang tugas palsu sekadar menggugurkan absen, sistem mengizinkan 0 Komitmen — syaratnya wajib isi alasan tertulis, dan statusnya dicatat netral sebagai Bebas Komitmen, bukan pelanggaran."*
- **Aksi:** Masuk sebagai `qa@dutamedia.com` di `/daily/morning` → centang kotak paling atas (`0 Komitmen`) → isi alasan wajib:
  ```text
  Ikut pelatihan keamanan aplikasi dan audit mutu bareng HRGA seharian penuh
  ```
  → klik **`Kirim Morning Commitment`**, lalu keluar akun.
- **Lihat di layar:** Tampil kartu hijau **`Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)`**.
- **Bilang singkat:** *"Statusnya tercatat rapi sebagai Bebas Komitmen yang disetujui, tanpa mengotori metrik risiko hijau-kuning-merah."*

#### `2C [INTI]` Pengingat `Prioritas Kemarin Sore`, `Carry-Over #2 AMBER`, Validasi `AMBER`, & `Simpan Draf` `[Jendela 2 — Bagas Saputra]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Komitmen pagi sengaja dibatasi maksimal 3 fokus utama agar pengisian cukup 2–3 menit dan bukan menjadi timesheet panjang. Tugas kemarin yang statusnya berlanjut otomatis masuk ke kotak draf pagi — bukan terkirim otomatis — dengan pengingat AMBER jika sudah tertunda 2 hari. Khusus risiko AMBER, karyawan cukup isi uraian kekhawatirannya tanpa wajib membuat tiket blocker dulu, supaya atasan tidak kebanjiran tiket kecil dan staf tetap jujur melapor AMBER alih-alih berpura-pura klik GREEN."*
- **Aksi:**
  1. Tunjuk kotak kuning **`Prioritas Kemarin Sore`** di bagian atas form.
  2. Klik **`Lihat Draf`** pada **`Draf Tugas Berlanjut dari Kemarin`** → tunjuk item **`Carry-Over #2 · Disarankan AMBER`** → centang kedua item → klik **`Gunakan Item Terpilih ke Slot Hari Ini`**.
  3. Klik **`Tambah Slot Komitmen (2/3)`** untuk membuka **Komitmen #3** (tombol tambah langsung hilang karena maksimal 3 komitmen).
  4. **`[CABANG]` Uji 2 Penolakan Sebelum Kirim (aman, tidak mengubah DB):**
     - Ketik `Te` di **Komitmen #3** → klik **`Kirim Morning Commitment`** → ditolak merah **`"Slot #3: Deskripsi komitmen wajib diisi minimal 3 karakter."`**
     - Pilih risiko **`AMBER`**, kosongkan **`Uraian Resiko atau Potensi Kendala *`**, klik **`Kirim Morning Commitment`** → ditolak merah **`"Slot #3: Komitmen dengan risiko AMBER wajib menyertakan uraian potensi kendala."`**
  5. **`[INTI]` Lengkapi Komitmen #3 + Buktikan Aturan `AMBER` Tidak Wajib Tiket Blocker:**
     - **Teks Komitmen Terukur *:**
       ```text
       Cek ulang urutan kolom file CSV laporan bulanan bareng tim Finance dan QA
       ```
     - **Proyek Terkait (Opsional):** `[WP-CORE] WorkPulse Platform Core 2026`
     - **Tautan Tiket Tugas atau Blocker (Opsional):** `https://github.com/dutamedia/workpulse/issues/230` *(tunjuk juga tombol **`Pilih Blocker Aktif`** di sebelahnya)*.
     - **Tingkat Risiko Tugas Hari Ini *:** Pastikan **`AMBER`**. Tunjuk dropdown **`Tiket Blocker Penyebab (Opsional)`** → biarkan **`-- Tidak Terkait Tiket Blocker Aktif (Risiko / Dependensi Ringan) --`**, dan tunjuk teks panduan kuning di bawahnya bahwa `AMBER` boleh dikirim tanpa menautkan tiket blocker.
     - **Uraian Resiko atau Potensi Kendala *:**
       ```text
       Urutan kolom status karyawan di file CSV masih nunggu konfirmasi tim Finance
       ```
     - **Tindakan / Bantuan yang Diharapkan (Opsional):**
       ```text
       Minta konfirmasi urutan kolom dari tim Finance sebelum jam 14.00 WIB
       ```
  6. Klik **`Simpan Draf`**, tekan **`F5`** (ketikan aman tersimpan), lalu klik **`Kirim Morning Commitment`**.
- **Lihat di layar:** Terkunci rapi berstatus **`SUBMITTED (Terkunci)`** + **`ON-TIME`** + tombol **`Ajukan Koreksi Komitmen`**.
- **Bilang singkat:** *"Begitu terkirim, baseline pagi langsung terkunci — perubahan setelah ini hanya bisa lewat permohonan koreksi resmi agar tidak ada perubahan diam-diam."*

#### `2D [INTI]` Pembebasan Check-In Otomatis untuk Karyawan Cuti Resmi `[Jendela 5 — Gilang Ramadhan (specialist.it@dutamedia.com)]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk karyawan yang sudah tercatat cuti resmi, sistem otomatis membebaskan kewajiban check-in harian tanpa perlu mereka repot membuka web sekadar memilih 0 Komitmen. Di laporan kepatuhan maupun dashboard, sistem juga otomatis mengecualikan mereka dari hitungan absen lapor."*
- **Aksi:** Login sebagai `specialist.it@dutamedia.com` → buka `/daily/morning`, klik tab `2. Additional Work` dan `3. EOD Outcome` sekilas → buka **`Riwayat Saya`** (`/daily/history`), lalu keluar akun.
- **Lihat di layar:** Ketiga halaman harian **otomatis terkunci** menampilkan spanduk hijau **`Masa Cuti Resmi (Cuti Tahunan)`**, dan di `/daily/history` tampil panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
- **Bilang singkat:** *"Semua tab harian langsung terkunci hijau menampilkan masa cutinya, dan arsipnya langsung terlihat hanya-baca di Riwayat Saya."*

#### `2E [INTI]` Pekerjaan Tambahan (`Additional Work`): Tugas Dadakan, `Intern` 0x di Daftar Atasan, `Edit`, & `Hapus` `[Jendela 2 — Bagas Saputra]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Additional Work ini awalnya tidak ada di PRD Baseline yang diberikan kepada kami. Tetapi setelah kami analisis, bagaimana jika setelah kirim komitmen pagi, ternyata muncul tugas tambahan baru yang prioritasnya lebih tinggi sehingga harus didahulukan dikerjakan? Itu sangat berpotensi membuat komitmen pagi awal tidak selesai penuh — bahkan tidak selesai — padahal karyawan memang punya pekerjaan baru yang lebih genting, bukan karena gagal. Karena itu kami sediakan pencatatan terpisah di sini tanpa mengubah baseline pagi, dan khusus pilihan pemberi tugasnya, akun magang otomatis kami kecualikan."*
- **Aksi:**
  1. Buka tab **`2. Additional Work`** (`/daily/additional-work`).
  2. Isi **Tugas Tambahan #1**:
     - **Deskripsi:** `Revisi daftar hak akses menu tagihan portal klien sesuai permintaan klien siang ini`
     - **Alasan:** `Penugasan Baru dari Atasan` → di dropdown **Ditugaskan Oleh**, tunjukkan **`Dharma Putra`** muncul dan nama anak magang (`Raka Pratama` / `Nisa Amelia`) **sama sekali tidak ada**. Pilih `Dharma Putra`.
     - **Proyek:** `[PRJ-PORTAL] Dutamedia Client Portal v2.4`
     - **Tautan:** `https://github.com/dutamedia/workpulse/issues/235`
     - Klik **`Tambahkan Pekerjaan`**.
  3. **`[CABANG]` Isi Tugas Tambahan #2 lalu uji `Edit` & `Hapus`:**
     - **Deskripsi:** `Siapkan draf agenda rapat mingguan tim Delivery`
     - **Alasan:** `Tugas Terlewat Dicatat Pagi` → Proyek: `-- Non-Proyek / Operasional Rutin --` → klik **`Tambahkan Pekerjaan`**.
     - Klik **`Edit`** pada Tugas #2 → ubah jadi: `Siapkan draf agenda dan checklist rapat mingguan tim Delivery` → klik **`Simpan Perubahan`**.
     - Klik **`Hapus`** pada Tugas #2 → isi alasan wajib: `Agenda rapatnya sudah digabung langsung ke dokumen review PRJ-PORTAL oleh PM` → klik **`Konfirmasi Hapus`**.
- **Bilang singkat:** *"Dengan pemisahan ini, evaluasi sore tetap adil membaca konteks kerjaan dadakan di siang hari tanpa merusak catatan rencana pagi."*

#### `2F [INTI]` Evaluasi Sore (`/daily/eod`): 4 Hasil, Lanjut/Stop, Saran Status Akhir Hari Tanpa Paksaan, & Kunci Pasca-EOD `[Jendela 2 — Bagas Saputra]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di evaluasi sore, kami memisahkan dua hal: Hasil Pekerjaan (Selesai, Sebagian, Belum Selesai, Dibatalkan) dan Kelanjutan Tugasnya (Lanjutkan Besok atau Tidak Dilanjutkan). Jika suatu tugas berhenti di tengah jalan atau dibatalkan, alasan tertulis wajib diisi agar tim tidak menebak-nebak. Untuk status akhir hari (GREEN/AMBER/RED), sistem akan memberi saran otomatis bila banyak tugas belum beres, tapi sengaja tidak pernah mengunci paksa pilihan GREEN — keputusan akhir tetap di tangan karyawan, sementara riwayat status paginya tetap terlihat atasan."*
- **Aksi:** Klik tab **`3. EOD Outcome`** (`/daily/eod`), isi 4 item secara berurutan:
  1. **Komitmen #1 (`Finalisasi spesifikasi...`):** Hasil **`Selesai`**.
  2. **Komitmen #2 (`Menyusun dokumen kriteria...`):** Hasil **`Sebagian`** → Kelanjutan **`Lanjutkan Besok (Tugas Berlanjut)`** → Catatan Kelanjutan *(opsional)*: `Tinggal beresin bagian skenario batas login paralel besok pagi`.
  3. **Komitmen #3 (`Cek ulang urutan kolom file CSV...`):** Hasil **`Belum Selesai`** → Kelanjutan **`Tidak Dilanjutkan`** → **Alasan Tidak Dilanjutkan \* (wajib):** `Pengecekan kolom CSV sudah diambil alih langsung oleh tim Finance, jadi nggak perlu dilanjut lagi`.
  4. **Pekerjaan Tambahan #1 (`Revisi daftar hak akses...`):** Hasil **`Dibatalkan`** → **Alasan Pembatalan Tugas \* (wajib):** `Klien jadi pakai aturan hak akses versi lama dulu sampai rilis tahap 1 beres`.
  5. **Status Refleksi Akhir Hari Ini:** Tunjuk bahwa pilihan **`GREEN` tetap aktif bisa diklik**, lalu pilih **`AMBER`** dan isi penjelasan wajib: `Satu tugas spesifikasi SSO masih perlu diselesaikan besok pagi sekitar 1 jam`.
  6. **Prioritas Utama Besok:** `Beresin dokumen syarat terima SSO dan dampingi tes PRJ-PORTAL bareng QA`.
  7. Klik **`Kirim Evaluasi EOD`**.
     - *Lihat di layar:* Karena 2 dari 4 item (= 50%) berstatus `Belum Selesai` / `Dibatalkan`, sistem memunculkan jendela **`Konfirmasi Pilihan Status Akhir Hari`** dengan saran **`RED`** (pilihan **`Ubah ke Saran (RED)`** atau **`Tetap Kirim sebagai AMBER`**) — membuktikan sistem memberi saran tapi tidak pernah memaksa.
  8. Klik **`Tetap Kirim sebagai AMBER`**, lalu klik sebentar tab **`2. Additional Work`** untuk bukti form terkunci pasca-EOD.
- **Bilang singkat:** *"Setelah EOD dikirim, pencatatan harian hari ini resmi tutup buku termasuk Additional Work — hanya fitur Lapor Blocker yang tetap terbuka 24 jam kalau ada kendala mendadak."*

#### `2G [INTI]` `Riwayat Saya` (`/daily/history`) `[Jendela 2 — Bagas Saputra]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Semua catatan harian, hasil evaluasi, dan arsip cuti maupun dispensasi dari HRGA terkumpul di halaman Riwayat Saya yang bersifat hanya-baca. Tujuannya memberi transparansi dua arah: karyawan punya bukti kerja objektif, dan atasan punya bahan pembinaan yang berbasis fakta."*
- **Aksi:** Buka **`Riwayat Saya`**, tunjuk 4 kartu KPI, klik **`Detail`** pada baris hari ini, tunjuk panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**, dan klik **`Unduh CSV`**.
- **Bilang singkat:** *"Datanya langsung bisa dibuka per hari maupun diunduh ke CSV kapan pun dibutuhkan."*

---

### BABAK 3 — Siklus Blocker Lengkap: `RED` Wajib Blocker (Jalan Pintas), 16 Kategori, 9 Dampak, Cuti Vertikal PIC, Kolaborasi 3 Peran, *Dynamic Re-Routing*, `Hapus`, & `Aging`
> **Estimasi:** 10 menit · **Prasyarat:** `Raka` & `Aditya` punya form/tiket sesuai seed · **Dampak:** Tiket baru Raka & tiket OOM Aditya ditutup (`Selesai Ditutup`), tiket `APPROVAL` menjadi `Risiko Diterima`, tiket `CROSS_TEAM` pindah ke Ops, tiket `NETWORK` terhapus.

#### `3A [INTI]` `RED` Wajib Blocker (Jalan Pintas dari Form Pagi), Cuti Vertikal PIC, & 16 Kategori / 9 Dampak `[Jendela 5 — Raka Pratama (intern.frontend@dutamedia.com)]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di sini ada tiga aturan penting. Pertama, komitmen pagi berstatus RED wajib ditautkan ke tiket blocker aktif supaya nggak ada 'RED siluman' yang hanya berupa status merah tanpa PIC dan target waktu penyelesaian — dan kami siapkan tombol jalan pintas agar draf paginya otomatis tersimpan tanpa harus ketik ulang. Kedua, 16 kategori kendala dan 1 sampai 3 pilihan dampak mengarahkan tiket ke Penanggung Jawab Kategori resmi. Ketiga, jika PIC sedang cuti resmi, sistem dilarang keras menunjuk rekan sejawat atau bawahan tanpa mandat — tiket otomatis naik vertikal ke atasannya sampai ke Direktur, kecuali ada Reviewer Sementara yang aktif."*
- **Aksi:**
  1. Login sebagai `intern.frontend@dutamedia.com` → di `/daily/morning`, klik **`Lihat Draf`** → klik **`Salin ke Slot`** pada tugas *`Implementasi tata letak kartu responsif...`* (`[WP-CORE]`).
  2. Ubah **`Tingkat Risiko Tugas Hari Ini *`** menjadi **`RED`**.
  3. **`[CABANG]` Uji Validasi `RED` Wajib Blocker:** Isi `Uraian Resiko`: `Server staging WP-CORE error 502`, biarkan dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`** kosong, lalu klik **`Kirim Morning Commitment`**.
     - *Lihat di layar:* Ditolak merah — tidak boleh ada status `RED` tanpa tiket blocker aktif!
  4. **`[INTI]` Jalan Pintas Buat Tiket Blocker dari Form Pagi:** Klik tombol **`+ Buat Tiket Blocker Sekarang`** di bawah dropdown.
     - *Lihat di layar:* Draf pagi otomatis tersimpan, halaman berpindah ke `/raise-blockers?returnTo=/daily/morning&slot=0` dengan spanduk konteks kembali ke Morning Commitment dan **`Project Authority` (`WP-CORE`)** otomatis terpilih karena berasal dari Slot #1 berproyek `WP-CORE`.
  5. **`[CABANG]` Uji Aturan Cuti Vertikal PIC (Naik ke Atasan) & Batas 3/3 Dampak (sebelum kirim):**
     - **PENTING — Ubah dulu Jalur Kewenangan ke `Organizational Authority (Struktural)`** *(karena kalau dibiarkan `Project Authority`, PIC akan tetap menuju Project Lead `WP-CORE`, bukan jalur kategori!)*.
     - Pilih kategori **`1. Teknis & Sistem` → `Hosting, Cloud & Domain (HOSTING_DOMAIN)`** → tunjuk **Panel Jalur Penanganan Otomatis**: karena PIC resminya (`Gilang Ramadhan`) sedang cuti hari ini, tiket **tidak turun ke rekan/bawahan, tapi langsung naik vertikal ke atasannya (`Gunawan Setiawan` — Head Ops & Infra)**.
     - Centang 3 kotak dampak untuk membuktikan kotak ke-4 s/d ke-9 otomatis terkunci (`3 / 3`), lalu lepas 1 sehingga tersisa **2 dampak**.
  6. **`[INTI]` Lengkapi & Kirim Tiket Staging `WP-CORE`:**
     - **Judul Kendala *:** `Server Staging WP-CORE Error 502 Bad Gateway Saat Tes Halaman Riwayat`
     - **Kategori *:** **`1. Teknis & Sistem` → `Server & Rilis Sistem (INFRA)`**
     - **Dampak * (2 kotak):** **`Target & Tenggat Waktu (MILESTONE)`** & **`Satu Tim / Divisi (TEAM)`**
     - **Tingkat Keparahan *:** **`High (Target 4 jam)`**
     - **Deskripsi Kendala & Upaya Mandiri *:**
       ```text
       Dari pagi server staging WP-CORE error 502 Bad Gateway pas buka halaman riwayat, jadi cek tampilan HP belum bisa jalan. Sudah coba clear cache tapi tetap sama.
       ```
     - **Bantuan Konkret yang Diharapkan (Opsional):**
       ```text
       Tolong restart container staging WP-CORE dan cek setting Nginx-nya
       ```
     - **Jalur Kewenangan *:** Pastikan **`Organizational Authority (Struktural)`** → **Penanggung Jawab Khusus:** biarkan `-- Ditentukan Otomatis oleh Sistem --` (tunjuk panel pratinjau langsung mengarah ke **`Reza Mahendra`**).
     - Klik **`Kirim Laporan Blocker`**.
- **Lihat di layar:** **⚡** Setelah kirim, browser **otomatis balik ke `/daily/morning`** dengan draf Raka utuh & tiket barusan otomatis terpilih di Slot #1! Klik **`Kirim Morning Commitment`** → beres terkirim!
- **Bilang singkat:** *"Draf pagi otomatis aman, tiket langsung punya PIC jelas, dan komitmen RED langsung terkirim dalam satu alur tanpa putus."*

#### `3B [INTI]` Penanggung Jawab Kategori (Staf Spesialis) & Siklus Penuh Tiket Lintas Jendela `[Jendela 2 → Reza ↔ Jendela 5 → Raka]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk jenis kendala teknis atau operasional tertentu, tiket tidak selalu harus menumpuk di Head Divisi — kami menetapkan Penanggung Jawab Kategori resmi agar staf spesialis seperti Network Engineer bisa langsung membuka Antrean Blocker tanpa perlu mengubah struktur atasannya di bagan perusahaan. Di dalam tiketnya, tombol 'Beri Bantuan' untuk progres bertahap/uji coba sengaja dipisah dari 'Selesaikan' (khusus solusi tuntas), dan PIC tidak bisa menutup tiket sepihak — pelapor sendirilah yang memverifikasi atau mengembalikannya jika masalah masih terjadi."*
- **Aksi:**
  1. Di **`Jendela 2`**, keluar dari Bagas lalu login **`network.infra@dutamedia.com`** (**Reza Mahendra** — staf yang ditunjuk resmi sebagai Penanggung Jawab Kategori `INFRA`) → buka **`Antrean Blocker`** (`/blockers`).
     - *Lihat di layar:* Lencana merah notifikasi nyala; menu `Antrean Blocker` & `Penuaan & Eskalasi` terbuka untuk staf spesialis tersebut. *(Bilang sekilas: kalau Reza sendiri yang lapor kendala `INFRA`, sistem otomatis naikkan ke atasannya `Gunawan` biar nggak nunjuk diri sendiri).*
  2. Pilih tiket **`Server Staging WP-CORE Error 502 Bad Gateway...`** → klik **`Terima & Tangani`** → klik **`Beri Bantuan`**:
     - **Tindakan Bantuan *:** `Restart container staging WP-CORE dan bersihin antrean Nginx`
     - **Catatan Hasil / Progres *:** `Halaman utama staging sudah hidup lagi, coba Raka akses sekarang`
     - Klik **`Simpan Kontribusi`**.
  3. **`⚡` Pindah ke `Jendela 5 — Raka Pratama`** di **`Lapor Blocker` → tab `Blocker Saya`** (`/raise-blockers?tab=mine`): klik **`Terima Bantuan (Membantu Sebagian)`**, isi:
     ```text
     Halaman utama sudah kebuka, tapi halaman riwayat cuti masih kena 502 pas panggil API
     ```
     → klik **`Kirim Catatan Membantu Sebagian`**.
  4. **Balik ke `Jendela 2 — Reza`**: klik **`Selesaikan`** → isi resolusi:
     ```text
     Koneksi Nginx ke API staging sudah dibenerin dan semua endpoint sudah lancar 200 OK
     ```
     → klik **`Kirim Solusi`**.
  5. **`[CABANG]` Kembalikan Solusi lalu Tutup Final (`Jendela 5 ↔ Jendela 2`):**
     - Di **`Jendela 5 — Raka`**: klik **`Belum Memadai (Kembalikan)`** → isi:
       ```text
       Daftar data sudah tampil, tapi pas pakai filter tanggal masih timeout setelah 10 detik
       ```
       → klik **`Kirim & Kembalikan ke PIC`** (status balik ke `Sedang Ditangani`).
     - Di **`Jendela 2 — Reza`**: klik **`Selesaikan`** → isi: `Batas timeout koneksi database staging sudah dinaikkan, tes filter sudah cepat di bawah 200ms` → **`Kirim Solusi`**.
     - Di **`Jendela 5 — Raka`**: klik **`Konfirmasi & Tutup Tiket`** (`Selesai Ditutup`). Buka sebentar `/profile` Raka untuk tunjuk pil ungu **`Intern`** & tanggal selesai magang, lalu klik **`Keluar Sesi`**.
- **Bilang singkat:** *"Seluruh progres uji coba, pengembalian solusi, sampai konfirmasi penutupan final terekam berurutan di linimasa tiket."*

#### `3C [INTI]` `Bantu Unblock` Auto-Scroll, Bantuan Non-PIC, & `Terima Risiko` `[Jendela 3 — Arif Budiman ↔ Jendela 2 — Aditya]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di WorkPulse kami pegang prinsip 'primary ownership bukan exclusive ownership': meskipun PIC utama tiketnya adalah Tech Lead, atasan atau rekan lintas fungsi bisa langsung menyalurkan bantuan kapan saja tanpa harus menunggu PIC. Dan bila ada kendala yang secara keputusan bisnis memang harus ditunda dulu — bukan tidak dikerjakan — atasan bisa memilih 'Terima Risiko' dengan justifikasi dan rencana mitigasi tertulis."*
- **Aksi:**
  1. Di **`Jendela 2`**, keluar dari Reza lalu login **`dev.frontend@dutamedia.com`** (**Aditya Nugroho**).
  2. Di **`Jendela 3 — Arif Budiman` (`/dashboard`)**: pada **`Personil Butuh Bantuan Hari Ini`**, klik **`Bantu Unblock`** pada kendala OOM milik Aditya.
     - *Lihat di layar:* Langsung pindah ke `/blockers`, **panel kiri otomatis terscroll pas ke kartu tiket terbawah** sambil **header panel kanan tetap utuh terlihat**!
  3. Meskipun PIC tiketnya `Bambang Pratama`, Arif (non-PIC) langsung klik **`Beri Bantuan`**:
     - **Tindakan Bantuan *:** `Naikkan limit memori container GitLab CI runner dari 2GB ke 6GB`
     - **Catatan Hasil *:** `Build frontend sudah dites ulang dan lolos tanpa error OOM`
     - Klik **`Simpan Kontribusi`**. Buka sebentar `/dashboard` → **⚡** bantuan Arif langsung muncul di **`Feed Dukungan Lintas Fungsi`**.
  4. **`⚡` Pindah ke `Jendela 2 — Aditya` (`/raise-blockers?tab=mine`)**: klik **`Terima sbg Penyelesaian (Tutup Tiket)`** → tiket langsung `Selesai Ditutup`.
  5. **`[CABANG]` Siklus `Terima Risiko` (`Jendela 3 — Arif` di `/blockers`):** Pilih tiket **`[Menunggu Persetujuan Rilis Arsitektur Database Baru]`** (`APPROVAL`, `WP-CORE`) → klik **`Terima & Tangani`** → klik **`Terima Risiko`**:
     - **Justifikasi *:** `Migrasi database tahap 2 kita geser ke rilis minggu depan supaya jadwal demo minggu ini tetap aman`
     - **Rencana Mitigasi *:** `Sementara tetap pakai skema tabel versi 1 dan dipantau query-nya tiap hari oleh Tech Lead`
     - Klik **`Tetapkan Terima Risiko`**.
- **Bilang singkat:** *"Bantuan lintas tim dari luar PIC bisa langsung menutup tiket bila memang menyelesaikan masalah, sementara penundaan strategis tetap tercatat resmi mitigasinya."*

#### `3D [CABANG]` `Edit Tiket` (*Dynamic Re-Routing*) & `Hapus Tiket` `[Jendela 2 — Aditya]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Karyawan bisa saja salah pilih divisi tujuan, duplikat bikin tiket, atau kendalanya keburu beres sendiri. Agar antrean PIC tidak penuh tiket salah alamat dan memicu alarm terlambat palsu, pelapor diizinkan mengedit atau menghapus tiket **hanya selama tiket masih aktif**. Begitu divisi tujuan diganti saat edit, PIC otomatis berpindah ke divisi yang benar; saat dihapus wajib pilih alasan dan seluruh pihak terkait langsung dapat notifikasi — tidak ada penghapusan diam-diam."*
- **Aksi:** Di `/raise-blockers?tab=mine`:
  1. Pada tiket **`[Menunggu Hasil Uji QA dari Tim Delivery]`** (`CROSS_TEAM`, PIC saat ini `Dharma Putra`), klik **`Edit Tiket`** → ubah **Divisi yang Sedang Ditunggu** ke **`Operations & Infrastructure`**, ubah deskripsi menjadi `Perbaikan navigasi sudah kelar, tapi masih nunggu pembukaan port firewall staging dari tim Operations & Infrastructure` → klik **`Simpan Perubahan`**.
     - *Lihat di layar:* PIC otomatis berpindah ke **`Gunawan Setiawan`** (*Head Ops & Infra*).
  2. Pada tiket **`[Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus]`**, klik **`Hapus Tiket`** → tunjuk 3 alasan preset (`Salah Input / Tiket Duplikat`, `Sudah Teratasi Mandiri`, `Kendala Tidak Jadi / Batal Relevan`) + `Alasan Lainnya` → pilih **`Sudah Teratasi Mandiri`** → klik **`Konfirmasi Hapus Tiket`**.
- **Bilang singkat:** *"Begitu tiket sudah masuk tahap Selesai atau Ditutup, tombol Edit dan Hapus otomatis dikunci agar arsip kerjanya tetap utuh."*

#### `3E [INTI]` Radar Keterlambatan (`Aging`) `[Jendela 3 — Arif Budiman]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Prinsip utama WorkPulse adalah 'No Surprise' — masalah boleh terjadi di proyek, tapi tidak boleh menjadi kejutan di akhir minggu. Tiket dengan tingkat keparahan tinggi yang melewati target waktu penyelesaian langsung disorot merah di Radar Penuaan ini supaya pimpinan cepat turun tangan."*
- **Aksi:** Buka **`Penuaan & Eskalasi`** (`/blockers/aging`), tunjuk kartu merah **`Lewat Batas Waktu: 1`** (tiket `CRITICAL` `WP-CORE`), centang **`Hanya Lewat Batas Waktu`**, klik **`Buka`**.
- **Bilang singkat:** *"Sekali klik 'Buka', atasan langsung dibawa ke tiket kritis yang paling butuh intervensi."*

---

### BABAK 4 — Koreksi Laporan: Minor (`AUTO_APPLIED`), Material (`Tolak` → Revisi → `Setujui`), & Koreksi EOD
> **Estimasi:** 4 menit · **Prasyarat:** `Aditya` sudah punya komitmen pagi terkunci · **Dampak:** Komitmen #1 langsung diperbarui otomatis, Komitmen #2 terupdate via persetujuan Head.

#### `4A [INTI]` Ajukan Perubahan Minor & Perubahan Material `[Jendela 2 — Aditya di /corrections/morning]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Komitmen yang sudah terkunci tidak boleh diedit bebas supaya baseline pagi tetap jujur. Tapi supaya proses koreksi nggak terlalu birokratis dan nggak membebani atasan, kami bagi dua: Perubahan Minor (seperti salah ketik atau tambah tautan PR) langsung diterapkan otomatis dengan jejak audit, sedangkan Perubahan Material (mengubah target atau tingkat risiko) harus melewati persetujuan Kepala Divisi."*
- **Aksi:**
  1. **Perubahan Minor:** Pilih **`[Komitmen #1]`** → klik **`Perubahan Minor`** → ubah deskripsi menjadi `Menyelesaikan implementasi komponen UI navigasi mobile responsif lintas 5 ukuran layar`, isi tautan `https://github.com/dutamedia/workpulse/pull/241`, isi alasan: `Tambah link PR nomor 241 dan perjelas info ukuran layar` → klik **`Kirim Permohonan Koreksi`**.
     - *Lihat di layar:* Langsung hijau **`AUTO_APPLIED`**.
  2. **Perubahan Material:** Pilih **`[Komitmen #2]`** → klik **`Perubahan Material`** → ubah deskripsi menjadi `Optimasi code-splitting Vite biar penggunaan memori build frontend turun`, ubah risiko ke **`GREEN (Lancar)`**, isi alasan: `Karena runner CI sudah lancar, fokus hari ini digeser ke optimasi code-splitting Vite` → klik **`Kirim Permohonan Koreksi`** (`Menunggu Persetujuan`).
- **Bilang singkat:** *"Perubahan Minor langsung diterapkan tanpa mengganggu atasan, sedangkan Perubahan Material langsung masuk ke meja review atasan."*

#### `4B [INTI]` Tolak, Revisi Cepat, & Setujui di `Review Koreksi` `[Jendela 3 — Arif ↔ Jendela 2 — Aditya]`
- **Aksi:**
  1. Di **`Jendela 3 — Arif`** (`/corrections/review`): tunjuk perbandingan **`Sebelum` vs `Diajukan`**, klik **`Tolak`**, isi alasan: `Tolong tambahin nomor tiket issue Vite biar gampang dicek tim QA` → **`Konfirmasi Tolak`**.
  2. **`⚡` Di `Jendela 2 — Aditya`** (`/corrections/morning`): pada baris `Ditolak`, klik **`Gunakan Draf Sebelumnya & Sesuaikan`** → tambahkan `[#245]` pada teks (`Optimasi code-splitting Vite [#245] biar penggunaan memori build frontend turun`), isi alasan: `Tambah nomor tiket [#245] sesuai catatan Head Engineering` → kirim.
  3. **Balik ke `Jendela 3 — Arif`**: klik **`Setujui`**, isi catatan: `Sip, nomor referensi [#245] sudah lengkap` → **`Konfirmasi Setujui`**.
- **Bilang singkat:** *"Atasan bisa melihat jelas perbandingan sebelum dan sesudah sebelum setuju, dan kalau ditolak, karyawan tinggal pakai tombol revisi cepat dari draf sebelumnya."*

#### `4C [CABANG]` Cek Tab `Koreksi Evaluasi Sore` `[Jendela 2 — Aditya]`
- **Aksi:** Klik sebentar menu **`Koreksi Evaluasi Sore`** (`/corrections/eod`) untuk nunjukin jendela sanggahan EOD (48 jam kerja) tersedia terpisah.

---

### BABAK 5 — Pencatatan Cuti Resmi (`/admin/leaves`) & Dispensasi (`/exemptions`) + Pengecualian Permanen
> **Estimasi:** 6 menit · **Prasyarat:** `Intan Permata` (`staff.finance@dutamedia.com`) tidak punya cuti/dispensasi Hari Ini · **Dampak:** Di akhir babak, data uji `Intan` dihapus lagi biar bersih dan menu hariannya pulih normal.
> *(Catatan praktis: Kalau latihan dilakukan pas hari Sabtu/Minggu, ganti "Hari Ini" di babak ini ke hari kerja Senin–Jumat terdekat karena cuti 0 hari kerja ditolak sistem).*

#### `5A [INTI]` Cek Daftar Cuti Resmi + Pagar Pengaman + Catat Cuti Sakit Live `[Jendela 4 — Dewi Lestari (HRGA)]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"WorkPulse sengaja tidak membuat alur pengajuan dan persetujuan cuti baru di dalam aplikasi agar HRGA dan atasan tidak perlu input dua kali dengan prosedur HR yang sudah berjalan di kantor. Begitu cuti sudah disetujui di jalur kantor, HRGA cukup mencatatnya satu pintu di sini dan akun karyawan otomatis dibebaskan — lengkap dengan pagar pengaman untuk menolak cuti akhir pekan (0 hari kerja), jadwal bentrok, serta pengajuan Cuti Tahunan bagi anak magang."*
- **Aksi:**
  1. Buka menu **`Pencatatan Cuti Resmi`** (`/admin/leaves`): tunjuk semua catatan langsung berstatus resmi (`Disetujui`), termasuk **`Raka Pratama` (`Izin Resmi`)** dan **`Gilang Ramadhan`**.
  2. **`[CABANG]` Uji 3 Pagar Pengaman (tanpa merusak data):**
     - Pilih **`Tanggal Mulai`** (misal hari ini) → buka pemilih kalender **`Tanggal Selesai`** dan tunjuk bahwa tanggal sebelum Tanggal Mulai otomatis nonaktif (`:min`). Lalu pilih rentang **Sabtu–Minggu** terdekat, isi keterangan `Tes akhir pekan` → klik **`Daftarkan Cuti Resmi`** → ditolak **`400`** (*0 hari kerja*).
     - Pilih **`Gilang Ramadhan`**, tanggal **Hari Ini**, keterangan `Tes bentrok cuti` → klik **`Daftarkan Cuti Resmi`** → ditolak **`409`** (bentrok dengan cuti aktif Gilang).
     - Pilih **`Raka Pratama` (`Intern`)**, jenis **`Cuti Tahunan`**, tanggal **hari kerja H+10**, keterangan `Tes hak cuti magang` → klik **`Daftarkan Cuti Resmi`** → ditolak **`400`** (`Intern` tidak berhak Cuti Tahunan).
  3. **`[INTI]` Catat Cuti Sakit Hari Ini untuk Intan:**
     - **Karyawan \*:** **`Intan Permata (staff.finance@dutamedia.com)`**
     - **Tanggal Mulai & Selesai \*:** **Hari Ini**
     - **Jenis Cuti / Izin \*:** **`Sakit`**
     - **Keterangan Resmi \*:** `Surat sakit dari klinik, sudah ACC atasan & HRGA`
     - Klik **`Daftarkan Cuti Resmi`**.
- **⚡ Efek Lintas Jendela (`Jendela 5`):** Login **`staff.finance@dutamedia.com`** (**Intan**): buka `/daily/morning`, `2. Additional Work`, `3. EOD Outcome` → semua **otomatis terkunci** menampilkan **`Masa Cuti Resmi (Cuti Sakit)`** tanpa perlu pilih `0 komitmen`! Buka **`Riwayat Saya`** (`/daily/history`) → muncul di panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**, plus notifikasi masuk.
- **Bilang singkat:** *"Seketika setelah dicatat HRGA, seluruh jadwal pengisian harian karyawan terkunci aman dan notifikasi langsung terkirim ke akun yang bersangkutan."*

#### `5B [INTI]` Uji `Edit` & `Hapus` Cuti Resmi `[Jendela 4 — HRGA ↔ Jendela 5 — Intan]`
- **Aksi:**
  1. Di **`Jendela 4` (`/admin/leaves`)**: pada baris **`Intan Permata`**, klik **`Edit`** → ubah keterangan jadi `Surat sakit dari klinik, sudah ACC atasan & HRGA (revisi HRGA)` → klik **`Simpan Perubahan Cuti`**.
  2. Klik **`Hapus`** pada baris `Intan Permata` → di modal **`Hapus Catatan Cuti Resmi?`** klik **`Ya, Hapus Catatan`**.
- **⚡ Efek Lintas Jendela:** Di **`Jendela 5 — Intan` (`/daily/morning`)**, tekan **`F5`** → form pagi langsung **terbuka kembali** normal!
- **Bilang singkat:** *"Kalau ada salah tanggal atau batal cuti, tinggal edit atau hapus di sini dan jadwal check-in karyawan langsung aktif lagi."*

#### `5C [INTI]` Manajemen Dispensasi (`/exemptions`): Tambah, Pengecualian Permanen (`Lapor Blocker` Tetap Aktif), `Edit`, & `Hapus` `[Jendela 4 — HRGA ↔ Jendela 5 — Intan]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Dispensasi seperti Dinas Luar, pelatihan sertifikasi, atau penugasan khusus eksekutif dipisahkan dari 0 Komitmen karena ini adalah penugasan resmi perusahaan berbasis surat tugas. Selain dispensasi bertanggal, kami juga menambahkan fitur **Pengecualian Permanen** (berlaku terus tanpa tanggal berakhir sampai diubah atau dihapus Admin): tujuannya jika ada individu atau peran tertentu yang memang dibebaskan seterusnya dari komitmen harian, HRGA/Admin tidak perlu menginput ulang berulang-ulang — menu komitmen harian & koreksinya otomatis disembunyikan, sementara `Lapor Blocker` sengaja tetap aktif supaya mereka tetap bisa melapor bila menghadapi kendala kerja."*
- **Aksi:**
  1. Buka **`Manajemen Dispensasi`** (`/exemptions`): tunjuk tabel kanan sudah ada **`Bayu Santoso` (`Dinas Luar`, `ST/HRGA/2026/XI/104`)**.
  2. Isi form kiri untuk **`Intan Permata`**:
     - **Tanggal Mulai & Selesai \*:** **Hari Ini**
     - **Kategori Pengecualian \*:** **`Dinas Luar (Penugasan Luar Kantor / Klien)`**
     - **Nomor Surat Tugas / Referensi:** `ST/HRGA/2026/XI/112`
     - **Alasan Resmi Dispensasi \*:** `Dampingi audit faktur dan rekonsiliasi pajak di kantor klien Surabaya`
     - Klik **`Daftarkan Dispensasi`**.
  3. **⚡** Refresh **`Jendela 5 — Intan` (`/daily/morning`)** → form harian langsung terkunci dengan spanduk **`Masa Dispensasi Resmi (Dinas Luar)`** & muncul read-only di `/daily/history`.
  4. **`[CABANG]` Uji Pengecualian Permanen (Bebas Komitmen Harian, `Lapor Blocker` Tetap Aktif):**
     - Di **`Jendela 4 — HRGA`** (`/exemptions`), pada baris `Intan Permata`, klik **`Edit`** → centang **`Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)`** *(perhatikan `Tanggal Selesai` otomatis nonaktif & muncul petunjuk: "Aktif terus mulai Tanggal Mulai. Menu komitmen harian & koreksi disembunyikan, sementara Lapor Blocker tetap aktif.")* → ubah **Kategori Pengecualian \*** ke **`Pengecualian Permanen (Bebas Komitmen Harian)`** → klik **`Simpan Perubahan Dispensasi`**.
     - *Lihat di tabel kanan `/exemptions`:* kolom Periode berubah menjadi **`Mulai <tanggal> (Permanen)`**.
     - **⚡ Efek Lintas Jendela (`Jendela 5 — Intan`):** Tekan **`F5`** (atau keluar & login ulang `staff.finance@dutamedia.com`):
       - Saat login langsung mendarat di **`/raise-blockers`** (bukan `/daily/morning`).
       - Di sidebar kiri, menu **`My Today`**, **`Koreksi Komitmen Pagi`**, dan **`Koreksi Evaluasi Sore`** **otomatis hilang** (jika URL `/daily/morning` atau `/corrections/morning` diketik manual → ditolak **`403 — Akses Dibatasi`**).
       - Menu **`Lapor Blocker`**, **`Riwayat Saya`** (menampilkan **`Mulai ... (Permanen)`** pada panel read-only), dan **`Notifikasi`** **tetap aktif**.
       - Buka sebentar **`/profile`** (Kartu Identitas): baris status dispensasi menampilkan **`Pengecualian Permanen: Pengecualian Permanen (Mulai ...) · Lapor Blocker tetap aktif`**.
  5. **Bersihkan kembali (`Hapus`):** Balik ke **`Jendela 4 — HRGA`**, pada baris `Intan` klik **`Hapus`** → di modal **`Hapus Catatan Dispensasi?`** klik **`Ya, Hapus Dispensasi`**. Refresh `Jendela 5` → seluruh menu harian Intan aktif normal kembali, lalu keluar akun di `Jendela 5`.
- **Bilang singkat:** *"Begitu pengecualian permanennya dicabut atau dihapus Admin, menu komitmen harian karyawan langsung aktif kembali normal seketika."*

---

### BABAK 6 — Pengawasan Kepatuhan HRGA (`/compliance`) & Coaching (`/coaching`)
> **Estimasi:** 4 menit · **Prasyarat:** `Siti Rahma` (Belum Ditangani) & `Nadia` (Sudah Ditangani) di `/compliance`; `Aditya` di `/coaching` · **Dampak:** `Siti Rahma` selesai ditindaklanjuti, catatan coaching baru tersimpan.

#### `6A [INTI]` Antrean Kepatuhan HRGA `[Jendela 4 — Dewi Lestari (HRGA)]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Satu hal yang sangat kami jaga: WorkPulse tidak pernah menerbitkan SP atau memotong insentif secara otomatis, supaya sistem tidak menciptakan budaya takut. Satu kali lupa atau terlambat mengisi bukanlah sanksi. Baru ketika terbentuk pola berulang — misalnya 3 kali berturut-turut — sistem memunculkannya di Antrean Kepatuhan HRGA sebagai sinyal pembinaan berbasis fakta."*
- **Aksi:**
  1. Buka **`Antrean Kepatuhan`** (`/compliance`).
  2. Pada baris **`Siti Rahma`** (`Belum Ditangani` · `Pola Terlambat 3x`), klik **`Tindak Lanjut`**.
     - `[CABANG]` Ketik 2 huruf `ok` → tombol **`Simpan Tindak Lanjut`** tetap nonaktif (wajib min. 5 karakter).
     - Isi catatan: `Sudah diingatkan bareng Head Engineering, sepakat pasang pengingat browser jam 08.00 biar nggak lupa lapor pagi` → klik **`Simpan Tindak Lanjut`**.
  3. Pada baris **`Nadia Kusuma`** (`Sudah Ditangani`), klik **`Ubah Catatan`**, tambah ` dan tidak berulang kembali.` di akhir kalimat → **`Simpan Tindak Lanjut`**.
- **Bilang singkat:** *"HRGA bisa mendokumentasikan hasil tindak lanjut atau memperbarui catatannya langsung sebagai riwayat pembinaan resmi."*

#### `6B [INTI]` Catatan Coaching (`Dibagikan` vs `Rahasia Manajemen`) `[Jendela 3 — Arif Budiman]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kami memisahkan jelas kewenangan HRGA dengan atasan langsung: HRGA fokus pada pola kepatuhan di `/compliance`, sedangkan atasan langsung mencatat bimbingan atau apresiasi 1-on-1 di `/coaching`. Setiap catatan bisa dipilih untuk Dibagikan ke Karyawan, atau dikunci sebagai Rahasia Manajemen yang 100% terisolasi sehingga tidak pernah muncul di notifikasi maupun akun staf."*
- **Aksi:**
  1. Buka **`Catatan Coaching`** (`/coaching`), klik kartu **`Aditya Nugroho`**. Tunjuk panel kanan sudah ada 2 catatan: **`Dibagikan ke Karyawan`** dan **`Rahasia Manajemen`**.
  2. Di panel kiri: pilih **`Aditya Nugroho`**, jenis **`Bimbingan`**, visibilitas **`Dibagikan ke Karyawan`**, lalu klik tombol template cepat **`Bimbingan 1-on-1`** → klik **`Simpan Catatan Pembinaan`**.
- **Bilang singkat:** *"Atasan cukup pakai tombol template cepat untuk mencatat sesi 1-on-1 dalam hitungan detik."*

---

### BABAK 7 — Notifikasi Hybrid, Dashboard 3 Cakupan, Radar Proyek, & Laporan Eksekutif
> **Estimasi:** 5 menit · **Prasyarat:** Semua notifikasi & skor sudah terbentuk dari babak sebelumnya · **Dampak:** Read-only & tandai dibaca notifikasi.

#### `7A [INTI]` Pusat Notifikasi, Isolasi `Rahasia Manajemen`, & Pengecekan Hak Akses Tautan Otomatis `[Jendela 2 — Aditya & Jendela 1 — Direktur]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di Pusat Notifikasi, sistem menjaga dua keamanan sekaligus: catatan `Rahasia Manajemen` tidak pernah bocor ke layar staf, dan tautan di dalam notifikasi — misalnya pemberitahuan perubahan kebijakan oleh Direktur — otomatis menyembunyikan tombol menuju `/admin/policies` bagi staf biasa agar karyawan tidak salah klik menuju halaman `403`."*
- **Aksi:**
  1. Di **`Jendela 2 — Aditya`**, buka **`Notifikasi`** (`/notifications`):
     - Tunjuk catatan **`Dibagikan ke Karyawan`** muncul, sedangkan **`Rahasia Manajemen`** **0% bocor**.
     - Klik notifikasi perubahan kebijakan cut-off: badge merah di sidebar **`Notifikasi`** & ikon lonceng langsung **berkurang 1**, dan tombol menuju `/admin/policies` **otomatis disembunyikan**.
     - Tunjuk tab **`Pengaturan Kanal & Perangkat`** & tombol **`Tandai semua dibaca`**.
  2. Tunjuk **`Jendela 1 — Direktur`**: buka `/notifications` lewat **ikon lonceng di TopBar** (akses notifikasi pola Hybrid).

#### `7B [INTI]` Pulse Dashboard Lintas Peran `[Jendela 3 — Arif vs Jendela 1 — Direktur]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Dashboard ini kami rancang berbasis pengecualian (exception-first), bukan papan peringkat atau leaderboard jumlah tugas, supaya karyawan tidak terjebak mengejar jumlah tugas palsu demi skor. Aksesnya juga terisolasi ketat per peran: Head hanya melihat divisinya sendiri, sedangkan Direktur melihat gambaran seluruh perusahaan — lengkap dengan pemisahan antara jumlah karyawan aktif dan karyawan yang benar-benar wajib lapor hari itu."*
- **Aksi:**
  1. **`Jendela 3 — Arif`** (`/dashboard`): cakupan terkunci **`Divisi Saya`** (`Engineering`), tidak bisa mengintip divisi lain.
  2. **`Jendela 1 — Direktur`** (`/dashboard`): cakupan **`Seluruh Perusahaan`** (**25 karyawan aktif** setelah Budi aktivasi; **24 wajib lapor** karena 1 orang — Gilang — sedang cuti resmi hari ini), coba filter **`Status Karyawan`** ke **`Intern`** (hanya tampil `Raka Pratama` & `Nisa Amelia`) → kembalikan ke **`Semua Status Karyawan`**.

#### `7C [INTI]` Radar Risiko Proyek `[Jendela 3 — Arif di /projects/risk]`
- **Aksi:** Ketik `Engineering` di kotak cari → klik **`Rincian`** pada **`WP-CORE`** → tunjukkan skor kesehatan & sorotan kendala `CRITICAL` lewat batas waktu + tombol **`Buka Antrean Blocker Terkait`**.

#### `7D [INTI]` Laporan Eksekutif, Filter `Kontrak`, CSV & PDF `[Jendela 1 — Direktur di /reports]`
- **Aksi:** Klik preset `Hari Ini` → `Pekan Ini` → `Bulan Ini` → `Kuartal Ini`. `[CABANG]` Pilih filter status **`Kontrak`** (tampil pesan kosong ramah: **`"Belum ada data karyawan untuk penyaring yang dipilih."`**), kembalikan ke **`Semua`**. Klik **`Unduh Laporan (CSV)`** dan tunjuk tombol **`Cetak / PDF`**.

---

### BABAK 8 — Tata Kelola Admin Lengkap (`Users`, `Organization`, `Temporary Reviewer`, `Policy Owners`, & `Channels`)
> **Estimasi:** 7 menit · **Prasyarat:** `Rian` tidak punya delegasi aktif · **Dampak:** Semua aksi uji dikembalikan / dibatalkan bersih di akhir babak.

#### `8A [CABANG]` Nonaktifkan & Aktifkan Akun `[Jendela 4 — HRGA di /admin/users]`
- **Aksi:** Pada baris **`Budi Santoso`**, klik **`Nonaktifkan`** → klik **`Ya, Nonaktifkan Akun`** (status `Nonaktif`, sesi otomatis putus) → klik **`Aktifkan Kembali`** → klik **`Ya, Aktifkan Kembali`**. Tunjuk baris **`Dewi Lestari`** bertanda **`Akun Anda`** (tidak bisa menonaktifkan diri sendiri).

#### `8B [INTI]` Struktur Organisasi 2 Tab, Anti-Siklus `422`, Angkat `Intern`, & `Project Authority` `[Jendela 4 — HRGA di /admin/organization]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Tata kelola organisasi dijaga oleh tiga pagar pengaman. Pertama, seluruh perubahan jabatan atau atasan berlaku mulai hari ini ke depan (anti-backdating) agar konteks laporan masa lalu tetap jujur sesuai kondisi saat itu. Kedua, sistem menolak penugasan melingkar dan menolak Project Manager merangkap Escalation Reviewer di proyek yang sama demi prinsip check-and-balance. Ketiga, akun Intern otomatis dikecualikan dari peran atasan, PM, maupun Reviewer sampai resmi diangkat menjadi karyawan tetap."*
- **Aksi:**
  1. **Tab 1 (`Struktur & Penugasan Karyawan`):** Klik **`Atur Penugasan Baru`**:
     - Buka dropdown **`Atasan Langsung`** → tunjuk **`Raka Pratama` & `Nisa Amelia` (`Intern`) 0x muncul**.
     - `[CABANG]` Uji anti-siklus `422`: pilih Karyawan **`Arif Budiman`**, pilih Atasan Langsung **`Aditya Nugroho`** (bawahannya), alasan `Tes cek validasi atasan melingkar` → klik **`Simpan Penugasan`** → **ditolak `422`**.
     - Pratinjau angkat `Intern`: pilih `Raka Pratama`, ubah status ke `Karyawan Tetap` → jelaskan hak jabatan & cuti langsung terbuka tanpa merusak riwayat magang → klik **`Batal`**.
  2. **Tab 2 (`Kewenangan Proyek (Project Authority)`):** Klik **`Tetapkan Wewenang Proyek`** → tunjuk `Intern` 0x di PM/Reviewer → `[CABANG]` pilih `WP-CORE` dengan PM = `Arif Budiman` & Escalation Reviewer = `Arif Budiman` → klik **`Tetapkan Proyek`** → ditolak (*tidak boleh dijabat oleh orang yang sama*) → klik **`Batal`**. Klik **`Tutup Wewenang`** sebentar untuk tunjuk modal konfirmasi → klik **`Batal`**.
- **Bilang singkat:** *"Aturan pengangkatannya tetap menjaga integritas data historis tanpa perlu membuat akun baru dari nol."*

#### `8C [INTI]` Delegasi Reviewer Sementara + Bukti Login Nyata `[Jendela 4 — HRGA ↔ Jendela 5 — Rian Kurniawan]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Jika seorang pimpinan divisi berhalangan atau sedang dinas dan ingin menunjuk pengganti sementara dari level di bawahnya atau divisi lain, tidak boleh hanya lewat pesan lisan — wajib lewat mandat Reviewer Sementara berbatas tanggal di sini. Akses review koreksi dan antrean blocker otomatis terbuka selama masa delegasi tanpa mengubah struktur permanen, dan langsung tertutup seketika saat dicabut."*
- **Aksi:**
  1. Di **`Jendela 4 — HRGA` (`/admin/temporary-reviewers`)**: klik **`Delegasikan Reviewer Baru`**:
     - **Pejabat yang Berhalangan \*:** `Gunawan Setiawan` *(divisi `Operations & Infrastructure` terisi otomatis)*
     - **Pejabat Pengganti \*:** `Rian Kurniawan` *(tunjuk `Sistem Administrator` & akun `Intern` 0x muncul di list!)*
     - **Tanggal Mulai:** Hari Ini · **Tanggal Selesai:** Besok
     - **Alasan \*:** `Gantikan review koreksi dan eskalasi kendala selama Head Ops audit luar kota`
     - Klik **`Terbitkan Delegasi`** (status `Aktif`).
  2. **⚡ Efek Lintas Jendela (`Jendela 5`):** Login **`lead.creative@dutamedia.com`** (**Rian Kurniawan**).
     - *Lihat di layar:* Meski perannya `SUPERVISOR`, di sidebar langsung terbuka menu **`Review Koreksi`** (`/corrections/review`), **`Antrean Blocker`**, dan **`Penuaan & Eskalasi`** *(tanpa menu Persetujuan Cuti)*! Setelah itu keluar akun.
  3. Balik ke **`Jendela 4 — HRGA`**: klik **`Cabut`** pada delegasi Rian → isi alasan: `Head Ops sudah balik kantor dan aktif bertugas lagi` → klik **`Cabut Wewenang Sekarang`**.
- **Bilang singkat:** *"Wewenang pengganti sementara langsung berhenti detik itu juga setelah dicabut."*

#### `8D [CABANG]` Pemilik Kebijakan Multi-Owner `[Jendela 1 — Direktur vs Jendela 4 — HRGA di /admin/policies]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kewenangan mengatur aturan sistem sengaja dibagi ke beberapa Pemilik Kebijakan sesuai kategorinya — bukan dipegang tunggal oleh satu Admin. Setiap kategori tidak boleh dibiarkan kosong tanpa pemilik aktif, dan tanggal mulai berlaku kebijakan maupun penugasan pemilik tidak pernah bisa diubah surut ke masa lampau."*
- **Aksi:** Di **`Jendela 1`** tunjuk seksi **`Penugasan Pemilik Kebijakan (Policy Owners)`** (bisa `Tetapkan Pemilik`/`Ubah`/`Cabut`, dan menolak pencabutan pemilik terakhir) + tombol **`Unduh Audit CSV`**. Di **`Jendela 4`** tunjuk HRGA hanya bisa mengubah kategori miliknya dan tabel pemilik berstatus **`Hanya Lihat (Direktur/Admin)`**.

#### `8E [INTI]` Saluran Notifikasi & Uji Kirim `[Jendela 1 — Direktur di /admin/notifications]`
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kami menampilkan status seluruh kanal notifikasi secara jujur di sini: pusat notifikasi dalam aplikasi sudah aktif penuh, sementara Email dan Browser Push ditampilkan dalam Mode Simulasi Aktif selama kunci server email resmi perusahaan belum dihubungkan — sehingga tidak ada status pengiriman luar yang dipalsukan, dan admin bisa langsung menguji pengirimannya."*
- **Aksi:** Tunjuk 3 kartu status saluran (**`In-App: Aktif`**, **`Email & Browser Push: Mode Simulasi Aktif`**) & **`Matriks Routing Kanal Per Trigger Event`** (9 trigger). Di panel **`Instrumen Uji Pengiriman Kanal Notifikasi`**, pilih kanal `Pusat Notifikasi In-App`, event `BLOCKER_RAISED`, penerima `dev.frontend@dutamedia.com` → klik **`Kirim Notifikasi Uji Coba`** → muncul di **`Log Pengiriman Uji Coba Terbaru`**.

---

### BABAK 9 — Penutupan: Kembalikan Jam Cut-Off Standar (`09:00 / 09:30 WIB`)
> **Estimasi:** 1 menit · **Jendela 1 — Hendra Wijaya (Direktur)**

- **Aksi:** Di **`Kebijakan & Cut-off`** (`/admin/policies`), klik **`+ Buat Versi Kebijakan Baru`**:
  - **Batas Tepat Waktu Pagi \*:** `09:00` · **Batas Kunci Pengisian Pagi (Cut-Off) \*:** `09:30`
  - **Batas Tepat Waktu Sore (EOD) \*:** `17:00` · **Batas Kunci Pengisian Sore (Cut-Off) \*:** `21:00`
  - **Tanggal Mulai Berlaku \*:** *(hari ini WIB)*
  - **Alasan Perubahan Kebijakan \*:**
    ```text
    Kembalikan jam cut-off pagi ke jadwal normal kantor setelah demo selesai
    ```
  - Klik **`Simpan & Terapkan Versi Baru`**, lalu tunjuk baris teratas di **`Jejak Audit Perubahan Kebijakan (Policy Audit Trail)`**.

---

## 5. PANDUAN DARURAT SALAH KLIK (QUICK RECOVERY)

| Kejadian Salah Klik Saat Demo | Solusi Cepat 10 Detik (Jangan Panik) |
|---|---|
| Terlanjur klik `Kirim Morning Commitment` di akun **Bagas** sebelum tunjuk validasi/draf | Jika masih perlu mendemokan validasi form pagi kosong, langsung gunakan akun cadangan **`Raka`** (sebelum Babak 3A) atau **`Intan`** (`staff.finance@dutamedia.com`). |
| Salah input saat bikin Cuti/Dispensasi di **Babak 5** | Tinggal klik tombol **`Edit`** atau **`Hapus`** langsung di baris tabel `/admin/leaves` atau `/exemptions`. |
| Lupa menghapus **Pengecualian Permanen** Intan di **Babak 5C** | Cukup klik **`Hapus`** → **`Ya, Hapus Dispensasi`** di `/exemptions` — menu harian (`My Today`, `Koreksi`) milik Intan langsung pulih seketika. |
| Lupa salin **Token Aktivasi 64 karakter** Budi di **Babak 1A** | Di tabel `/admin/users` baris Budi klik **`Kirim Ulang`** → **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** lagi. |
| Lupa cabut **Reviewer Sementara** Rian | Tinggal klik **`Cabut`** → **`Cabut Wewenang Sekarang`** di `/admin/temporary-reviewers` — aksesnya langsung tertutup detik itu juga. |
| Salah ketik nama/alur di tengah presentasi | Bilang santai: *"Ini sekaligus membuktikan validasi/audit sistem jalan,"* lalu pakai tombol `Edit`, `Hapus`, atau akun cadangan di Incognito. |

---

## 6. KARTU CONTEKAN TANYA-JAWAB STAKEHOLDER

- **Q: Kenapa pengajuan & persetujuan cuti nggak dilakukan di dalam WorkPulse saja?**
  > *Jawab:* "Sesuai cakupan awal proyek, WorkPulse fokus ke akuntabilitas harian dan penyelesaian kendala, bukan bikin HRIS baru. Jadi persetujuan cuti tetap di jalur HR yang biasa biar nggak *double-entry*. Begitu sudah ACC, HRGA tinggal catat di sistem — karyawan langsung bebas otomatis tanpa harus buka web pilih 0 komitmen."
- **Q: Bagaimana kalau ada karyawan atau peran khusus yang memang dibebaskan seterusnya dari kewajiban komitmen harian — apakah HRGA/Admin harus menginput dispensasi berulang-ulang?**
  > *Jawab:* "Nggak perlu. Di `Manajemen Dispensasi`, Admin, HRGA, atau Direktur cukup centang *Berlaku Permanen* tanpa tanggal berakhir. Menu komitmen harian dan koreksinya otomatis hilang sampai nanti diubah atau dihapus lagi oleh Admin, tetapi menu `Lapor Blocker` sengaja tetap aktif supaya mereka tetap bisa melapor jika menemui kendala kerja."
- **Q: Kenapa menu `Workspace` dihilangkan untuk Direktur (`CEO_MANAGEMENT`), lalu notifikasinya gimana?**
  > *Jawab:* "Direktur memang nggak isi komitmen harian dan EOD, jadi kalau `Workspace` muncul malah menuhin layar dan berisiko ngotorin statistik tim operasional. Untuk notifikasi, Direktur & Admin tetap pakai lonceng plus badge merah di pojok kanan atas (*Hybrid*), sementara staf biasa tetap punya shortcut di sidebar."
- **Q: Apa bedanya `AMBER` dengan `RED` di komitmen pagi? Kenapa `RED` wajib bikin tiket blocker dulu, sedangkan `AMBER` boleh tidak?**
  > *Jawab:* "Kalau `RED` artinya kerjaan sudah beneran macet atau terancam gagal hari ini — wajib bikin tiket blocker dulu biar langsung ada PIC, target waktu, dan eskalasi, nggak ada lagi 'RED siluman'. Kalau `AMBER`, itu peringatan awal atau tugas carry-over 2 hari; kalau tiap kekhawatiran kecil wajib bikin tiket, antrean atasan bakal kebanjiran dan karyawan malah takut lapor AMBER lalu milih bohong klik GREEN."
- **Q: Kenapa di EOD karyawan tetap dibolehin pilih `GREEN` meski pagi tadi sempat `AMBER`/`RED`?**
  > *Jawab:* "Karena kendala pagi hari bisa saja sudah selesai di siang hari. Status akhir tetap keputusan jujur karyawan, sementara seluruh riwayat status paginya tetap tercatat di log buat dilihat atasan."
- **Q: Kalau PIC blocker yang ditunjuk sistem lagi cuti, tiketnya lari ke mana?**
  > *Jawab:* "Tiket nggak pernah dikirim ke orang yang lagi cuti dan nggak pernah diturunkan ke rekan sejawat atau bawahan tanpa mandat resmi — otomatis naik ke atasan langsungnya (N+1) sampai ke Direktur."
- **Q: Bedanya `Antrean Kepatuhan` (`/compliance`) sama `Catatan Coaching` (`/coaching`)?**
  > *Jawab:* "`/compliance` khusus HRGA untuk menindaklanjuti pola telat atau mangkir lapor harian, sedangkan `/coaching` dipakai atasan langsung buat mencatat bimbingan atau apresiasi 1-on-1 ke bawahannya."
