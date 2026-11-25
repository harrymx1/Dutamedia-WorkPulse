# SKRIP DEMO LIVE WORKPULSE — MULTI-JENDELA (100% SEMUA ALUR & KONDISI)

**Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Password Semua Akun Uji:** `Password123!` · **Zona Waktu:** WIB (`Asia/Jakarta`)

> **Cara Pakai Skrip Ini:**
> - **Bahasa obrolan sehari-hari & langsung klik:** Semua nama menu, tombol, pesan layar, dan teks isian sudah persis cocok dengan aplikasi. Tinggal ikuti urutannya.
> - **Arti `[INTI]` vs `[CABANG]`:**
>   - **`[INTI]`** = alur utama dari awal sampai akhir (±30 menit). Tetap nyambung 100% meski semua `[CABANG]` dilewati.
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

## 2. PEMISAHAN DATA DUMMY (`seed.ts`) & CHECKLIST 5 MENIT PRA-DEMO

### A. Pemisahan Akun & Objek (`[INTI]` vs `[CABANG]`) — Anti-Bentrok State
| Akun / Data di `seed.ts` | Dipakai untuk Jalur | Kondisi Awal Setelah Reset Bersih |
|---|---|---|
| `product@dutamedia.com` (**Bagas Saputra**) | **`[INTI]`** Siklus Harian | Form pagi kosong + `Prioritas Kemarin Sore` + `Carry-Over #2 AMBER` & `#1 GREEN` |
| `dev.frontend@dutamedia.com` (**Aditya**) | **`[INTI]`** Blocker + Koreksi + Notif | Komitmen pagi sudah terkunci (`ON-TIME`) + tiket `OOM` (`WP-CORE`) + tiket `CROSS_TEAM` + tiket `NETWORK` + 2 catatan coaching |
| `intern.frontend@dutamedia.com` (**Raka**, `Intern`) | **`[INTI]`** `RED` Cara A + Blocker + `Intern` | Form pagi kosong + `Carry-Over #1` `WP-CORE` + punya izin tercatat `H+5` (`PERMIT`) |
| `specialist.it@dutamedia.com` (**Gilang**, PIC `HOSTING_DOMAIN`) | **`[INTI]`** Bukti Cuti Hari Ini + Cuti Vertikal | Cuti `APPROVED` hari ini → otomatis bebas check-in + blocker `HOSTING_DOMAIN` naik ke `Gunawan Setiawan` |
| `qa@dutamedia.com` (**Nadia**) | **`[CABANG]`** Kirim `0 Komitmen` | Form pagi kosong + 1 baris kepatuhan `H-2` berstatus `Sudah Ditangani` (`ADDRESSED`) |
| `staff.finance@dutamedia.com` (**Intan**) | **`[CABANG]`** Uji live Cuti & Dispensasi Hari Ini | Form pagi kosong & jadwal normal → bisa dites dikunci lalu di-Edit & di-Hapus kembali normal |
| `Reza` / `Gunawan` / `Dharma` / `Bambang` | PIC & Non-PIC Blocker | 6 tiket lintas kategori siap demo + 1 tiket `CRITICAL` lewat batas waktu (`-2 jam` di `WP-CORE`) |
| `Bayu Santoso` (`ST/HRGA/2026/XI/104`) | Data awal `/exemptions` | 1 dispensasi `Dinas Luar` (`H+2 s/d H+3`) siap tampil |

### B. Checklist 5 Menit Sebelum Demo
- [ ] Jalankan reset & seed bersih (`node backend/scripts/reset_live_seed.cjs` atau `npx prisma db seed`) biar semua akun dan tanggal cocok dengan hari demo.
- [ ] Buka 5 jendela Chrome sesuai tabel di Bagian 1, login `Jendela 1–4` sekaligus.
- [ ] Cek cepat `Jendela 2` (`Bagas Saputra`): kalau ada sisa draf lokal dari latihan sebelumnya, klik **`Reset Draf`**.
- [ ] Nyalakan *Do Not Disturb* / *Focus Assist* di laptop sebelum *share screen*.

---

## 3. MATRIKS CAKUPAN 100% (BUKTI TIDAK ADA YANG TERLEWAT)

| Area / Fitur / Aturan / Percabangan | Dibuktikan di Babak |
|---|---|
| Undangan 72 jam + Cabut + Kirim Ulang + Aktivasi token 64 karakter + `/admin/invitations` | `1A`, `1A-C`, `1B` |
| Tolak login `INVITED`, `Ingat email`, `Show/Hide`, kunci `429` (dijelaskan), `/profile`, `403` & `404` | `1B`, `1C` |
| **`DEC-019`** Pemisahan tugas `SYSTEM_ADMIN` & `CEO_MANAGEMENT` tanpa `Workspace` + Notif Hybrid TopBar | `1C`, `7A` |
| Jam Cut-Off `LOCKED` + Opsi A (`Komitmen Pagi Terlewat`) + Geser Cut-Off live + audit trail | `2A`, `9` |
| `0 Komitmen Hari Ini` (`DEC-004`) | `2B` |
| `Prioritas Kemarin Sore` (`DEC-011`) + `Carry-Over #2+ AMBER` + `Simpan Draf` + batas 3 slot | `2C` |
| Validasi `< 3` huruf (`400`), `AMBER` tanpa uraian (`400`), **`DEC-021`** `AMBER` tanpa tiket aktif | `2C` |
| **`DEC-018`** Cuti & Dispensasi otomatis mengunci `/daily/*` tanpa `0 komitmen` + **`Read-Only`** `/daily/history` | `2D`, `5A`, `5B`, `5C` |
| `Additional Work`: tambah tugas atasan (`Intern` 0x di list) + `Edit` + `Hapus` wajib alasan | `2E` |
| `EOD Outcome`: 4 hasil (`Selesai`, `Sebagian` → lanjut, `Belum Selesai` → stop wajib alasan, `Dibatalkan` → wajib alasan) + **`DEC-003`** modal saran `RED` vs `Tetap Kirim sebagai AMBER` + kunci pasca-EOD | `2F` |
| `Riwayat Saya` (`/daily/history`): KPI, *expand row*, panel read-only cuti/dispensasi, `Unduh CSV` | `2G`, `5A` |
| **`DEC-020`** `RED` wajib blocker + tolak tanpa tiket + jalan pintas **Cara A** (simpan draf → `/raise-blockers` → balik otomatis) | `3A` |
| 16 Kategori (5 grup) + 9 Dampak (maks `3/3`) + **`DEC-014`/`DEC-017`** Cuti Vertikal PIC naik ke atasan (`Organizational Authority`) + `isCategoryOwner` staf biasa | `3A`, `3B` |
| Siklus Blocker penuh: `Terima & Tangani` → `Beri Bantuan` → `Membantu Sebagian` → `Selesaikan` → `Belum Memadai` → tutup; `Bantu Unblock` auto-scroll + non-PIC + `Feed Dukungan Lintas Fungsi` + `Terima Risiko` | `3B`, `3C` |
| **`DEC-016`** `Edit Tiket` (*Dynamic Re-Routing*) + `Hapus Tiket` (3 preset) + Radar `Aging` | `3D`, `3E` |
| Koreksi Pagi & EOD: `Minor` (`AUTO_APPLIED`) + `Material` (`Tolak` → revisi `Gunakan Draf Sebelumnya & Sesuaikan` → `Setujui`) | `4A`, `4B`, `4C` |
| **`DEC-018` & `DEC-022`** `/admin/leaves` (Tambah, `:min`, tolak Sabtu–Minggu `400`, bentrok `409`, `Intern` `400`, Edit, Hapus) + `/exemptions` (Tambah, **Permanen tanpa batas (`Lapor Blocker` tetap aktif)**, Edit, Hapus) | `5A`, `5B`, `5C` |
| `/compliance` (`Tindak Lanjut`, validasi `< 5` huruf, `Ubah Catatan`) + `/coaching` (`Dibagikan` vs `Rahasia Manajemen`, template cepat) | `6A`, `6B` |
| `/notifications` (lencana sidebar/TopBar, isolasi `Rahasia`, `canUserAccess` sembunyikan tombol `/admin/policies`, tab `Pengaturan Kanal`) | `7A` |
| `/dashboard` 3 cakupan (`PROJECT` / `DIVISION` / `COMPANY` + filter `Intern`) + `/projects/risk` + `/reports` (preset, filter `Kontrak`, CSV & PDF) | `7B`, `7C`, `7D` |
| `/admin/users` (`Nonaktifkan`/`Aktifkan Kembali`, `Akun Anda`), `/admin/organization` (`Intern` 0x, anti-siklus `422`, angkat `Intern`, `Project Authority` tolak PM=Reviewer), `/admin/temporary-reviewers` (bukti login `Review Koreksi` + `Antrean Blocker`), `/admin/policies` multi-owner, `/admin/notifications` uji kirim 9 trigger | `8A`–`8E` |

---

## 4. SKRIP 9 BABAK DEMO LIVE

---

### BABAK 1 — Onboarding, Login, Profil, `403/404`, & Pemisahan Tugas `CEO` + `Admin` (`DEC-019`)
> **Estimasi:** 5 menit · **Prasyarat:** Data hasil seed bersih · **Dampak:** Akun `Budi Santoso` aktif (total 25 user aktif).

#### `1A [INTI]` HRGA Undang Karyawan Baru `[Jendela 4 — Dewi Lestari (HRGA)]`
- **Aksi:** Di menu **`Kelola Pengguna`** (`/admin/users`), klik **`Undang Pengguna Baru`**, lalu isi:
  - **Nama Lengkap:** `Budi Santoso`
  - **Alamat Email Perusahaan:** `budi.santoso@dutamedia.com`
  - **Status Karyawan:** `Karyawan Tetap`
  - **Peran:** `Karyawan`
  - **Divisi:** `Engineering`
  - **Jabatan:** `Backend Engineer`
  - Klik **`Terbitkan Undangan (72 Jam)`**.
- **Lihat di layar:** Keluar kode token 64 karakter + tombol **`Salin Token Aktivasi`**. Klik **`Salin Token Aktivasi`** → **`Selesai`**.
- **Bilang singkat:** *"Karyawan baru nggak dibuatkan password langsung sama admin — mereka dikasih token undangan 72 jam yang cuma bisa dipakai sekali."*

#### `1A-C [CABANG]` Uji Cabut & Kirim Ulang Token + Cek `/admin/invitations` `[Jendela 4 — HRGA]`
- **Aksi:**
  1. Pada baris `Budi Santoso`, klik **`Cabut`** → di modal `Cabut Undangan Aktivasi` klik **`Ya, Cabut Undangan`** → status berubah merah **`Dicabut`** (token lama hangus).
  2. Klik **`Kirim Ulang`** → di modal `Kirim Ulang Undangan Aktivasi` klik **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** (pakai token baru ini!) → **`Selesai`**.
  3. Klik menu **`Undangan Karyawan`** (`/admin/invitations`) sebentar buat nunjukin riwayat status undangan (*Menunggu*, *Dicabut*, *Sudah Diaktifkan*).
- **Bilang singkat:** *"Kalau token salah kirim atau bocor, HRGA tinggal cabut dan kirim ulang — token lama otomatis nggak bisa dipakai."*

#### `1B [INTI]` Tolak Login `INVITED`, Aktivasi Token, Login, & Profil `[Jendela 5 — Incognito]`
- **Aksi:**
  1. Buka `/login` (tab **`Masuk Sistem`**), ketik `budi.santoso@dutamedia.com` dan `Password123!` → klik tombol **`Masuk ke Sistem`**.
     - *Lihat di layar:* Ditolak merah **`"Akun Anda belum diaktifkan..."`**. Tunjuk ikon mata, centang `Ingat email di perangkat ini`, dan info kontak HRGA jika lupa sandi.
  2. Klik tab **`Aktivasi Akun`** (`/activate`): tempel token 64 karakter dari HRGA → isi sandi baru & konfirmasi `Password123!` → klik tombol **`Aktifkan Akun Saya`**.
     - *Lihat di layar:* Muncul pratinjau `Budi Santoso · Engineering` sebelum simpan, 3 syarat centang hijau + meteran `Sangat Kuat`, lalu layar **`Aktivasi Berhasil!`**.
  3. Klik **`Lanjut ke Halaman Masuk`**, login `budi.santoso@dutamedia.com` / `Password123!` → klik **`Masuk ke Sistem`** → mendarat otomatis di `/daily/morning`.
  4. Klik avatar **`BS`** di pojok kanan atas (`/profile`): tunjukkan **1. Kartu Identitas & Penugasan Aktif**, isi pratinjau kolom ganti sandi (`DutamediaBaru2026!`) untuk nunjukin 3 syarat centang hijau & opsi *Akhiri seluruh sesi aktif di perangkat lain* **(JANGAN klik `Simpan Kata Sandi Baru` biar password tetap `Password123!`)**, dan **3. Ringkasan Kanal Notifikasi Perangkat Ini**.
- **Bilang singkat:** *"Akun yang belum diaktivasi pasti ketolak waktu login. Setelah aktivasi mandiri pakai token, baru bisa masuk dan kelola profilnya sendiri."*

#### `1C [CABANG]` Uji `403`/`404` & Pemisahan Tugas `CEO` + `Admin` (`DEC-019`) `[Jendela 5 & Jendela 1]`
- **Aksi:**
  1. Masih sebagai **Budi (`Jendela 5`)**: ketik URL `/admin/policies` → tampil **`403 — Akses Dibatasi`** → klik **`Kembali ke Beranda`**. Ketik URL `/halaman-tidak-ada` → tampil **`404 — Halaman Tidak Ditemukan`** → klik **`Kembali ke Beranda`**, lalu klik **`Keluar Sesi`** (di `/profile` atau tombol keluar kiri bawah sidebar).
  2. Login **`Jendela 5`** sebagai **`admin@dutamedia.com`** (`SYSTEM_ADMIN`) → tunjuk sidebar kiri **tidak ada grup `Workspace`**, ketik URL `/daily/morning` → ditolak **`403 — Akses Dibatasi`**, lalu keluar akun.
  3. Tunjuk **`Jendela 1` (`Hendra Wijaya` — Direktur / `CEO_MANAGEMENT`)**: tunjuk sidebar kiri **grup `Workspace` juga sudah dihilangkan (`DEC-019`)**, buka `/blockers` sebentar → tombol **`+ Laporkan Blocker Baru` tersembunyi**, ketik URL `/daily/morning` → ditolak **`403`**, lalu klik **ikon lonceng di TopBar kanan atas** untuk masuk ke `/notifications`.
- **Bilang singkat:** *"Admin sama Direktur nggak wajib isi komitmen harian, jadi menu Workspace sengaja dihilangkan biar metrik kepatuhan murni ngukur tim operasional. Buat notifikasi, keduanya tetap akses lewat lonceng pojok kanan atas — ini yang kita sebut pola Hybrid."*

---

### BABAK 2 — Kunci Pagi (`LOCKED`), Geser Jam Cut-Off, & Siklus Harian Lengkap
> **Estimasi:** 9 menit · **Prasyarat:** `Bagas` & `Nadia` belum isi form hari ini; `Gilang` cuti resmi hari ini · **Dampak:** `Bagas` selesai 1 siklus penuh (Morning → AddWork → EOD → History); `Nadia` tercatat `0 Komitmen`.

#### `2A [INTI]` Kunci Pagi (`LOCKED`), Opsi A `Additional Work`, & Geser Jam Cut-Off `[Jendela 2 ↔ Jendela 1]`
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
- **Bilang singkat:** *"Begitu lewat jam batas, form pagi memang kekunci — tapi kerjaan siang tetap bisa dicatat lewat Additional Work. Kalau ada penyesuaian jam, Direktur ubah lewat Kebijakan lengkap sama jejak auditnya."*

#### `2B [CABANG]` Kirim `0 Komitmen Hari Ini` (`DEC-004`) `[Jendela 5 — Nadia Kusuma (qa@dutamedia.com)]`
- **Aksi:** Masuk sebagai `qa@dutamedia.com` di `/daily/morning` → centang kotak paling atas (`0 Komitmen`) → isi alasan wajib:
  ```text
  Ikut pelatihan keamanan aplikasi dan audit mutu bareng HRGA seharian penuh
  ```
  → klik **`Kirim Morning Commitment`**, lalu keluar akun.
- **Lihat di layar:** Tampil kartu hijau **`Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)`**.
- **Bilang singkat:** *"Kalau ada karyawan lagi training seharian atau nggak ada target harian khusus, tinggal pilih 0 Komitmen dengan alasan jelas — nggak perlu ngarang tugas."*

#### `2C [INTI]` `Prioritas Kemarin Sore`, `Carry-Over #2 AMBER`, Validasi `AMBER` (`DEC-021`), & `Simpan Draf` `[Jendela 2 — Bagas Saputra]`
- **Aksi:**
  1. Tunjuk kotak kuning **`Prioritas Kemarin Sore`** di bagian atas form.
  2. Klik **`Lihat Draf`** pada **`Draf Tugas Berlanjut dari Kemarin`** → tunjuk item **`Carry-Over #2 · Disarankan AMBER`** → centang kedua item → klik **`Gunakan Item Terpilih ke Slot Hari Ini`**.
  3. Klik **`Tambah Slot Komitmen (2/3)`** untuk membuka **Komitmen #3** (tombol tambah langsung hilang karena maksimal 3 komitmen).
  4. **`[CABANG]` Uji 2 Penolakan Sebelum Kirim (aman, tidak mengubah DB):**
     - Ketik `Te` di **Komitmen #3** → klik **`Kirim Morning Commitment`** → ditolak merah **`"Slot #3: Deskripsi komitmen wajib diisi minimal 3 karakter."`**
     - Pilih risiko **`AMBER`**, kosongkan **`Uraian Resiko atau Potensi Kendala *`**, klik **`Kirim Morning Commitment`** → ditolak merah **`"Slot #3: Komitmen dengan risiko AMBER wajib menyertakan uraian potensi kendala."`**
  5. **`[INTI]` Lengkapi Komitmen #3 + Buktikan `DEC-021` (`AMBER` boleh tanpa tiket blocker):**
     - **Teks Komitmen Terukur *:**
       ```text
       Cek ulang urutan kolom file CSV laporan bulanan bareng tim Finance dan QA
       ```
     - **Proyek Terkait (Opsional):** `[WP-CORE] WorkPulse Platform Core 2026`
     - **Tautan Tiket Tugas atau Blocker (Opsional):** `https://github.com/dutamedia/workpulse/issues/230` *(tunjuk juga tombol **`Pilih Blocker Aktif`** di sebelahnya)*.
     - **Tingkat Risiko Tugas Hari Ini *:** Pastikan **`AMBER`**. Tunjuk dropdown **`Tiket Blocker Penyebab (Opsional)`** → biarkan **`-- Tidak Terkait Tiket Blocker Aktif (Risiko / Dependensi Ringan) --`**, dan tunjuk teks panduan kuning di bawahnya (`DEC-021`).
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
- **Bilang singkat:** *"Tugas yang ngegantung 2 hari kemarin otomatis masuk ke draf pagi dan disarankan AMBER. Khusus AMBER, karyawan nggak wajib bikin tiket blocker dulu supaya atasan nggak kebanjiran tiket untuk kekhawatiran ringan."*

#### `2D [INTI]` Karyawan Cuti Resmi Otomatis Bebas Check-In (`DEC-018`) `[Jendela 5 — Gilang Ramadhan (specialist.it@dutamedia.com)]`
- **Aksi:** Login sebagai `specialist.it@dutamedia.com` → buka `/daily/morning`, klik tab `2. Additional Work` dan `3. EOD Outcome` sekilas → buka **`Riwayat Saya`** (`/daily/history`), lalu keluar akun.
- **Lihat di layar:** Ketiga halaman harian **otomatis terkunci** menampilkan spanduk hijau **`Masa Cuti Resmi (Cuti Tahunan)`** (tanpa perlu pilih `0 komitmen`), dan di `/daily/history` tampil panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
- **Bilang singkat:** *"Begitu cuti dicatat resmi oleh HRGA, karyawan otomatis bebas tagihan check-in hari itu tanpa perlu buka web pilih 0 komitmen."*

#### `2E [INTI]` Pekerjaan Tambahan: Tambah Tugas, `Intern` 0x di Daftar Atasan, `Edit`, & `Hapus` `[Jendela 2 — Bagas Saputra]`
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
- **Bilang singkat:** *"Kerjaan dadakan siang hari dicatat terpisah di sini biar komitmen pagi tetap bersih. Anak magang juga nggak mungkin muncul di pilihan pemberi tugas."*

#### `2F [INTI]` Evaluasi Sore (`/daily/eod`): 4 Hasil, Lanjut/Stop, `DEC-003` Modal Konfirmasi, & Kunci Pasca-EOD `[Jendela 2 — Bagas Saputra]`
- **Aksi:** Klik tab **`3. EOD Outcome`** (`/daily/eod`), isi 4 item secara berurutan:
  1. **Komitmen #1 (`Finalisasi spesifikasi...`):** Hasil **`Selesai`**.
  2. **Komitmen #2 (`Menyusun dokumen kriteria...`):** Hasil **`Sebagian`** → Kelanjutan **`Lanjutkan Besok (Tugas Berlanjut)`** → Catatan Kelanjutan *(opsional)*: `Tinggal beresin bagian skenario batas login paralel besok pagi`.
  3. **Komitmen #3 (`Cek ulang urutan kolom file CSV...`):** Hasil **`Belum Selesai`** → Kelanjutan **`Tidak Dilanjutkan`** → **Alasan Tidak Dilanjutkan \* (wajib):** `Pengecekan kolom CSV sudah diambil alih langsung oleh tim Finance, jadi nggak perlu dilanjut lagi`.
  4. **Pekerjaan Tambahan #1 (`Revisi daftar hak akses...`):** Hasil **`Dibatalkan`** → **Alasan Pembatalan Tugas \* (wajib):** `Klien jadi pakai aturan hak akses versi lama dulu sampai rilis tahap 1 beres`.
  5. **Status Refleksi Akhir Hari Ini:** Tunjuk bahwa pilihan **`GREEN` tetap aktif bisa diklik** (`DEC-003`), lalu pilih **`AMBER`** dan isi penjelasan wajib: `Satu tugas spesifikasi SSO masih perlu diselesaikan besok pagi sekitar 1 jam`.
  6. **Prioritas Utama Besok:** `Beresin dokumen syarat terima SSO dan dampingi tes PRJ-PORTAL bareng QA`.
  7. Klik **`Kirim Evaluasi EOD`**.
     - *Lihat di layar:* Karena 2 dari 4 item (= 50%) berstatus `Belum Selesai` / `Dibatalkan`, sistem memunculkan jendela **`Konfirmasi Pilihan Status Akhir Hari`** dengan saran **`RED`** (pilihan **`Ubah ke Saran (RED)`** atau **`Tetap Kirim sebagai AMBER`**) — langsung membuktikan **`DEC-003`** bahwa sistem memberi saran tapi tidak pernah memaksa.
  8. Klik **`Tetap Kirim sebagai AMBER`**, lalu klik sebentar tab **`2. Additional Work`** untuk bukti form terkunci pasca-EOD.
- **Bilang singkat:** *"Kalau tugas belum beres dan nggak dilanjut besok, wajib isi alasan. Sistem juga kasih saran status akhir tapi keputusannya tetap di karyawan. Setelah kirim EOD, kerjaan harian tutup buku — kecuali lapor blocker yang aktif 24 jam."*

#### `2G [INTI]` `Riwayat Saya` (`/daily/history`) `[Jendela 2 — Bagas Saputra]`
- **Aksi:** Buka **`Riwayat Saya`**, tunjuk 4 kartu KPI, klik **`Detail`** pada baris hari ini, tunjuk panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**, dan klik **`Unduh CSV`**.
- **Bilang singkat:** *"Semua log harian plus arsip cuti dan dispensasi dari HRGA terkumpul di sini, bersifat hanya-baca."*

---

### BABAK 3 — Siklus Blocker Lengkap: `RED` Wajib Blocker (`DEC-020` Cara A), 16 Kategori, 9 Dampak, Cuti Vertikal, Kolaborasi 3 Peran, `Dynamic Re-Routing`, `Hapus`, & `Aging`
> **Estimasi:** 9 menit · **Prasyarat:** `Raka` & `Aditya` punya form/tiket sesuai seed · **Dampak:** Tiket baru Raka & tiket OOM Aditya ditutup (`CLOSED`), tiket `APPROVAL` jadi `ACCEPTED_RISK`, tiket `CROSS_TEAM` pindah ke Ops, tiket `NETWORK` terhapus.

#### `3A [INTI]` `RED` Wajib Blocker (Cara A), Cuti Vertikal (`DEC-014`/`DEC-017`), & 16 Kategori / 9 Dampak `[Jendela 5 — Raka Pratama (intern.frontend@dutamedia.com)]`
- **Aksi:**
  1. Login sebagai `intern.frontend@dutamedia.com` → di `/daily/morning`, klik **`Lihat Draf`** → klik **`Salin ke Slot`** pada tugas *`Implementasi tata letak kartu responsif...`* (`[WP-CORE]`).
  2. Ubah **`Tingkat Risiko Tugas Hari Ini *`** menjadi **`RED`**.
  3. **`[CABANG]` Uji Validasi `RED` Wajib Blocker:** Isi `Uraian Resiko`: `Server staging WP-CORE error 502`, biarkan dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`** kosong, lalu klik **`Kirim Morning Commitment`**.
     - *Lihat di layar:* Ditolak merah — tidak boleh ada status `RED` tanpa tiket blocker aktif!
  4. **`[INTI]` Jalankan Cara A (`DEC-020`):** Klik tombol **`+ Buat Tiket Blocker Sekarang`** di bawah dropdown.
     - *Lihat di layar:* Draf pagi otomatis tersimpan, halaman berpindah ke `/raise-blockers?returnTo=/daily/morning&slot=0` dengan spanduk konteks kembali ke Morning Commitment dan **`Project Authority` (`WP-CORE`)** otomatis terpilih karena berasal dari Slot #1 berproyek `WP-CORE`.
  5. **`[CABANG]` Uji Cuti Vertikal (`DEC-014` & `DEC-017`) & Batas 3/3 Dampak (sebelum kirim):**
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
- **Bilang singkat:** *"Untuk status RED, user wajib bikin tiket blocker dulu supaya nggak ada 'RED siluman' tanpa PIC. Pakai tombol shortcut tadi, draf komitmen paginya otomatis aman dan langsung ketaut pas balik."*

#### `3B [INTI]` Spesialis (`isCategoryOwner`) & Siklus Penuh Tiket Lintas Jendela `[Jendela 2 → Reza ↔ Jendela 5 → Raka]`
- **Aksi:**
  1. Di **`Jendela 2`**, keluar dari Bagas lalu login **`network.infra@dutamedia.com`** (**Reza Mahendra** — staf `EMPLOYEE` yang jadi PIC kategori `INFRA`) → buka **`Antrean Blocker`** (`/blockers`).
     - *Lihat di layar:* Lencana merah notifikasi nyala; menu `Antrean Blocker` & `Penuaan & Eskalasi` terbuka untuk staf spesialis (`isCategoryOwner`). *(Bilang sekilas: kalau Reza sendiri yang lapor kendala `INFRA`, sistem otomatis naikkan ke atasannya `Gunawan` biar nggak nunjuk diri sendiri).*
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
- **Bilang singkat:** *"PIC nggak bisa nutup tiket sepihak — pelapor sendiri yang konfirmasi apakah masalahnya beneran kelar atau perlu dikembalikan lagi."*

#### `3C [INTI]` `Bantu Unblock` Auto-Scroll, Bantuan Non-PIC, & `Terima Risiko` `[Jendela 3 — Arif Budiman ↔ Jendela 2 — Aditya]`
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
     - **Justifikasi *:** `Migrasi database tahap 2 kita geser ke rilis minggu depan supaya jadwal demo UAT minggu ini tetap aman`
     - **Rencana Mitigasi *:** `Sementara tetap pakai skema tabel versi 1 dan dipantau query-nya tiap hari oleh Tech Lead`
     - Klik **`Tetapkan Terima Risiko`**.
- **Bilang singkat:** *"Dari dashboard atasan tinggal klik Bantu Unblock, layar langsung mengarah tepat ke tiketnya tanpa ketutup. Kalau ada kendala yang secara bisnis diputuskan ditunda, atasan bisa tetapkan Risiko Diterima lengkap sama rencana mitigasinya."*

#### `3D [CABANG]` `Edit Tiket` (*Dynamic Re-Routing*) & `Hapus Tiket` (`DEC-016`) `[Jendela 2 — Aditya]`
- **Aksi:** Di `/raise-blockers?tab=mine`:
  1. Pada tiket **`[Menunggu Hasil Uji QA dari Tim Delivery]`** (`CROSS_TEAM`, PIC saat ini `Dharma Putra`), klik **`Edit Tiket`** → ubah **Divisi yang Sedang Ditunggu** ke **`Operations & Infrastructure`**, ubah deskripsi menjadi `Perbaikan navigasi sudah kelar, tapi masih nunggu pembukaan port firewall staging dari tim Operations & Infrastructure` → klik **`Simpan Perubahan`**.
     - *Lihat di layar:* PIC otomatis berpindah ke **`Gunawan Setiawan`** (*Head Ops & Infra*).
  2. Pada tiket **`[Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus]`**, klik **`Hapus Tiket`** → tunjuk 3 alasan preset (`Salah Input / Tiket Duplikat`, `Sudah Teratasi Mandiri`, `Kendala Tidak Jadi / Batal Relevan`) + `Alasan Lainnya` → pilih **`Sudah Teratasi Mandiri`** → klik **`Konfirmasi Hapus Tiket`**.
- **Bilang singkat:** *"Kalau salah pilih divisi tujuan, tinggal edit tiketnya dan PIC otomatis pindah ke divisi yang benar. Tiket yang nggak jadi juga bisa dihapus dengan alasan tercatat."*

#### `3E [INTI]` Radar Keterlambatan (`Aging`) `[Jendela 3 — Arif Budiman]`
- **Aksi:** Buka **`Penuaan & Eskalasi`** (`/blockers/aging`), tunjuk kartu merah **`Lewat Batas Waktu: 1`** (tiket `CRITICAL` `WP-CORE`), centang **`Hanya Lewat Batas Waktu`**, klik **`Buka`**.
- **Bilang singkat:** *"Tiket kritis yang lewat batas waktu langsung nyala merah di radar penuaan biar pimpinan cepat turun tangan."*

---

### BABAK 4 — Koreksi Laporan: Minor (`AUTO_APPLIED`), Material (`Tolak` → Revisi → `Setujui`), & Koreksi EOD
> **Estimasi:** 4 menit · **Prasyarat:** `Aditya` sudah punya komitmen pagi terkunci · **Dampak:** Komitmen #1 ter-auto-apply, Komitmen #2 terupdate via persetujuan Head.

#### `4A [INTI]` Ajukan Perubahan Minor & Perubahan Material `[Jendela 2 — Aditya di /corrections/morning]`
- **Aksi:**
  1. **Perubahan Minor:** Pilih **`[Komitmen #1]`** → klik **`Perubahan Minor`** → ubah deskripsi menjadi `Menyelesaikan implementasi komponen UI navigasi mobile responsif lintas 5 ukuran layar`, isi tautan `https://github.com/dutamedia/workpulse/pull/241`, isi alasan: `Tambah link PR nomor 241 dan perjelas info ukuran layar` → klik **`Kirim Permohonan Koreksi`**.
     - *Lihat di layar:* Langsung hijau **`AUTO_APPLIED`**.
  2. **Perubahan Material:** Pilih **`[Komitmen #2]`** → klik **`Perubahan Material`** → ubah deskripsi menjadi `Optimasi code-splitting Vite biar penggunaan memori build frontend turun`, ubah risiko ke **`GREEN (Lancar)`**, isi alasan: `Karena runner CI sudah lancar, fokus hari ini digeser ke optimasi code-splitting Vite` → klik **`Kirim Permohonan Koreksi`** (`PENDING`).
- **Bilang singkat:** *"Salah ketik atau tambah link tinggal pakai Perubahan Minor yang langsung otomatis update tanpa ganggu atasan. Kalau mengubah target atau risiko, wajib lewat persetujuan atasan."*

#### `4B [INTI]` Tolak, Revisi Cepat, & Setujui di `Review Koreksi` `[Jendela 3 — Arif ↔ Jendela 2 — Aditya]`
- **Aksi:**
  1. Di **`Jendela 3 — Arif`** (`/corrections/review`): tunjuk perbandingan **`Sebelum` vs `Diajukan`**, klik **`Tolak`**, isi alasan: `Tolong tambahin nomor tiket issue Vite biar gampang dicek tim QA` → **`Konfirmasi Tolak`**.
  2. **`⚡` Di `Jendela 2 — Aditya`** (`/corrections/morning`): pada baris `Ditolak`, klik **`Gunakan Draf Sebelumnya & Sesuaikan`** → tambahkan `[#245]` pada teks (`Optimasi code-splitting Vite [#245] biar penggunaan memori build frontend turun`), isi alasan: `Tambah nomor tiket [#245] sesuai catatan Head Engineering` → kirim.
  3. **Balik ke `Jendela 3 — Arif`**: klik **`Setujui`**, isi catatan: `Sip, nomor referensi [#245] sudah lengkap` → **`Konfirmasi Setujui`**.
- **Bilang singkat:** *"Kalau koreksi ditolak karena kurang lengkap, karyawan tinggal klik satu tombol buat revisi dari draf sebelumnya tanpa ngetik ulang dari nol."*

#### `4C [CABANG]` Cek Tab `Koreksi Evaluasi Sore` `[Jendela 2 — Aditya]`
- **Aksi:** Klik sebentar menu **`Koreksi Evaluasi Sore`** (`/corrections/eod`) untuk nunjukin jendela sanggahan EOD (48 jam kerja) tersedia terpisah.

---

### BABAK 5 — Pencatatan Cuti Resmi (`/admin/leaves`) & Dispensasi (`/exemptions`) + Pembebasan Otomatis (`DEC-018`)
> **Estimasi:** 5 menit · **Prasyarat:** `Intan Permata` (`staff.finance@dutamedia.com`) tidak punya cuti/dispensasi Hari Ini · **Dampak:** Di akhir babak, data uji `Intan` dihapus lagi biar bersih.
> *(Catatan praktis: Kalau latihan dilakukan pas hari Sabtu/Minggu, ganti "Hari Ini" di babak ini ke hari kerja Senin–Jumat terdekat karena cuti 0 hari kerja ditolak sistem).*

#### `5A [INTI]` Cek Daftar Cuti Resmi + Guardrails + Catat Cuti Sakit Live `[Jendela 4 — Dewi Lestari (HRGA)]`
- **Aksi:**
  1. Buka menu **`Pencatatan Cuti Resmi`** (`/admin/leaves`): tunjuk semua catatan langsung berstatus resmi (`APPROVED`), termasuk **`Raka Pratama` (`Izin Resmi`)** dan **`Gilang Ramadhan`**.
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
- **Bilang singkat:** *"Persetujuan cuti cukup di luar sistem. Begitu HRGA input yang sudah ACC di sini, akun karyawan otomatis bebas tagihan check-in harian dan mereka tinggal lihat arsipnya di Riwayat Saya."*

#### `5B [INTI]` Uji `Edit` & `Hapus` Cuti Resmi `[Jendela 4 — HRGA ↔ Jendela 5 — Intan]`
- **Aksi:**
  1. Di **`Jendela 4` (`/admin/leaves`)**: pada baris **`Intan Permata`**, klik **`Edit`** → ubah keterangan jadi `Surat sakit dari klinik, sudah ACC atasan & HRGA (revisi HRGA)` → klik **`Simpan Perubahan Cuti`**.
  2. Klik **`Hapus`** pada baris `Intan Permata` → di modal **`Hapus Catatan Cuti Resmi?`** klik **`Ya, Hapus Catatan`**.
- **⚡ Efek Lintas Jendela:** Di **`Jendela 5 — Intan` (`/daily/morning`)**, tekan **`F5`** → form pagi langsung **terbuka kembali** normal!
- **Bilang singkat:** *"Kalau ada salah tanggal atau batal cuti, tinggal edit atau hapus di sini dan jadwal check-in karyawan langsung aktif lagi."*

#### `5C [INTI]` Manajemen Dispensasi (`/exemptions`): Tambah, Pengecualian Permanen (`DEC-022`), `Edit`, & `Hapus` `[Jendela 4 — HRGA ↔ Jendela 5 — Intan]`
- **Aksi:**
  1. Buka **`Manajemen Dispensasi`** (`/exemptions`): tunjuk tabel kanan sudah ada **`Bayu Santoso` (`Dinas Luar`, `ST/HRGA/2026/XI/104`)**.
  2. Isi form kiri untuk **`Intan Permata`**:
     - **Tanggal Mulai & Selesai \*:** **Hari Ini**
     - **Kategori Pengecualian \*:** **`Dinas Luar (Penugasan Luar Kantor / Klien)`**
     - **Nomor Surat Tugas / Referensi:** `ST/HRGA/2026/XI/112`
     - **Alasan Resmi Dispensasi \*:** `Dampingi audit faktur dan rekonsiliasi pajak di kantor klien Surabaya`
     - Klik **`Daftarkan Dispensasi`**.
  3. **⚡** Refresh **`Jendela 5 — Intan` (`/daily/morning`)** → form harian langsung terkunci dengan spanduk **`Masa Dispensasi Resmi (Dinas Luar)`** & muncul read-only di `/daily/history`.
  4. **`[CABANG]` Uji Pengecualian Permanen (`DEC-022` — `Lapor Blocker` Tetap Aktif):**
     - Di **`Jendela 4 — HRGA`**, pada baris `Intan`, klik **`Edit`** → centang **`Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)`** (perhatikan `Tanggal Selesai` otomatis mati!), ubah Kategori ke **`Pengecualian Permanen (Bebas Komitmen Harian)`** → klik **`Simpan Perubahan Dispensasi`**.
     - **⚡ Efek Lintas Jendela (`Jendela 5 — Intan`):** Tekan **`F5`** (atau keluar & login ulang `staff.finance@dutamedia.com`): menu **`My Today`**, **`Koreksi Komitmen Pagi`**, dan **`Koreksi Evaluasi Sore`** **hilang dari sidebar** (`403` jika diketik manual; saat login langsung mendarat di `/raise-blockers`), sementara **`Lapor Blocker`**, **`Riwayat Saya`** (*`Mulai ... (Permanen)`*), dan **`Notifikasi`** **tetap aktif**!
  5. **Bersihkan kembali (`Hapus`):** Balik ke **`Jendela 4 — HRGA`**, pada baris `Intan` klik **`Hapus`** → di modal **`Hapus Catatan Dispensasi?`** klik **`Ya, Hapus Dispensasi`**. Refresh `Jendela 5` → menu harian Intan aktif normal kembali, lalu keluar akun di `Jendela 5`.
- **Bilang singkat:** *"Di Manajemen Dispensasi, Admin/HRGA/Direktur bisa kasih pengecualian sementara maupun permanen tanpa tanggal selesai — menu harian otomatis hilang, tapi karyawan masih bisa Lapor Blocker kalau nemu kendala. Kalau sudah nggak perlu dikecualikan, tinggal hapus dan normal lagi."*

---

### BABAK 6 — Pengawasan Kepatuhan HRGA (`/compliance`) & Coaching (`/coaching`)
> **Estimasi:** 4 menit · **Prasyarat:** `Siti Rahma` (`OPEN`) & `Nadia` (`ADDRESSED`) di `/compliance`; `Aditya` di `/coaching` · **Dampak:** `Siti Rahma` selesai ditindaklanjuti, catatan coaching baru tersimpan.

#### `6A [INTI]` Antrean Kepatuhan HRGA `[Jendela 4 — Dewi Lestari (HRGA)]`
- **Aksi:**
  1. Buka **`Antrean Kepatuhan`** (`/compliance`).
  2. Pada baris **`Siti Rahma`** (`Belum Ditangani` · `Pola Terlambat 3x`), klik **`Tindak Lanjut`**.
     - `[CABANG]` Ketik 2 huruf `ok` → tombol **`Simpan Tindak Lanjut`** tetap nonaktif (wajib min. 5 karakter).
     - Isi catatan: `Sudah diingatkan bareng Head Engineering, sepakat pasang pengingat browser jam 08.00 biar nggak lupa lapor pagi` → klik **`Simpan Tindak Lanjut`**.
  3. Pada baris **`Nadia Kusuma`** (`Sudah Ditangani`), klik **`Ubah Catatan`**, tambah ` dan tidak berulang kembali.` di akhir kalimat → **`Simpan Tindak Lanjut`**.
- **Bilang singkat:** *"Karyawan yang telat atau absen lapor 3x berturut-turut otomatis naik ke antrean HRGA buat ditindaklanjuti dan dicatat pembinaannya."*

#### `6B [INTI]` Catatan Coaching (`Dibagikan` vs `Rahasia Manajemen`) `[Jendela 3 — Arif Budiman]`
- **Aksi:**
  1. Buka **`Catatan Coaching`** (`/coaching`), klik kartu **`Aditya Nugroho`**. Tunjuk panel kanan sudah ada 2 catatan: **`Dibagikan ke Karyawan`** dan **`Rahasia Manajemen`**.
  2. Di panel kiri: pilih **`Aditya Nugroho`**, jenis **`Bimbingan`**, visibilitas **`Dibagikan ke Karyawan`**, lalu klik tombol template cepat **`Bimbingan 1-on-1`** → klik **`Simpan Catatan Pembinaan`**.
- **Bilang singkat:** *"HRGA pegang catatan kepatuhan di /compliance, sedangkan atasan langsung pegang bimbingan 1-on-1 di /coaching — dan yang bertanda Rahasia Manajemen 100% nggak bakal bocor ke akun staf."*

---

### BABAK 7 — Notifikasi Hybrid, Dashboard 3 Cakupan, Radar Proyek, & Laporan Eksekutif
> **Estimasi:** 5 menit · **Prasyarat:** Semua notifikasi & skor sudah terbentuk dari babak sebelumnya · **Dampak:** Read-only & mark-as-read notifikasi.

#### `7A [INTI]` Pusat Notifikasi, Isolasi `Rahasia Manajemen`, & `canUserAccess` `[Jendela 2 — Aditya & Jendela 1 — Direktur]`
- **Aksi:**
  1. Di **`Jendela 2 — Aditya`**, buka **`Notifikasi`** (`/notifications`):
     - Tunjuk catatan **`Dibagikan ke Karyawan`** muncul, sedangkan **`Rahasia Manajemen`** **0% bocor**.
     - Klik notifikasi perubahan kebijakan cut-off: badge merah di sidebar **`Notifikasi`** & ikon lonceng langsung **berkurang 1**, dan tombol menuju `/admin/policies` **otomatis disembunyikan (`canUserAccess`)** supaya karyawan tidak nyasar ke layar `403`.
     - Tunjuk tab **`Pengaturan Kanal & Perangkat`** & tombol **`Tandai semua dibaca`**.
  2. Tunjuk **`Jendela 1 — Direktur`**: buka `/notifications` lewat **ikon lonceng di TopBar** (`DEC-019` Hybrid).

#### `7B [INTI]` Pulse Dashboard Lintas Peran `[Jendela 3 — Arif vs Jendela 1 — Direktur]`
- **Aksi:**
  1. **`Jendela 3 — Arif`** (`/dashboard`): cakupan terkunci **`Divisi Saya`** (`Engineering`), tidak bisa mengintip divisi lain.
  2. **`Jendela 1 — Direktur`** (`/dashboard`): cakupan **`Seluruh Perusahaan`** (**25 karyawan aktif** setelah Budi aktivasi; **24 wajib lapor** karena 1 orang — Gilang — sedang cuti resmi hari ini), coba filter **`Status Karyawan`** ke **`Intern`** (hanya tampil `Raka Pratama` & `Nisa Amelia`) → kembalikan ke **`Semua Status Karyawan`**.

#### `7C [INTI]` Radar Risiko Proyek `[Jendela 3 — Arif di /projects/risk]`
- **Aksi:** Ketik `Engineering` di kotak cari → klik **`Rincian`** pada **`WP-CORE`** → tunjukkan skor kesehatan & sorotan kendala `CRITICAL` lewat batas waktu + tombol **`Buka Antrean Blocker Terkait`**.

#### `7D [INTI]` Laporan Eksekutif, Filter `Kontrak`, CSV & PDF `[Jendela 1 — Direktur di /reports]`
- **Aksi:** Klik preset `Hari Ini` → `Pekan Ini` → `Bulan Ini` → `Kuartal Ini`. `[CABANG]` Pilih filter status **`Kontrak`** (tampil pesan kosong ramah: **`"Belum ada data karyawan untuk penyaring yang dipilih."`**), kembalikan ke **`Semua`**. Klik **`Unduh Laporan (CSV)`** dan tunjuk tombol **`Cetak / PDF`**.

---

### BABAK 8 — Tata Kelola Admin Lengkap (`Users`, `Organization`, `Temporary Reviewer`, `Policy Owners`, & `Channels`)
> **Estimasi:** 6 menit · **Prasyarat:** `Rian` tidak punya delegasi aktif · **Dampak:** Semua aksi uji di-restore / dibatalkan bersih di akhir babak.

#### `8A [CABANG]` Nonaktifkan & Aktifkan Akun `[Jendela 4 — HRGA di /admin/users]`
- **Aksi:** Pada baris **`Budi Santoso`**, klik **`Nonaktifkan`** → klik **`Ya, Nonaktifkan Akun`** (status `Nonaktif`, sesi otomatis putus) → klik **`Aktifkan Kembali`** → klik **`Ya, Aktifkan Kembali`**. Tunjuk baris **`Dewi Lestari`** bertanda **`Akun Anda`** (tidak bisa menonaktifkan diri sendiri).

#### `8B [INTI]` Struktur Organisasi 2 Tab, Anti-Siklus `422`, Angkat `Intern`, & `Project Authority` `[Jendela 4 — HRGA di /admin/organization]`
- **Aksi:**
  1. **Tab 1 (`Struktur & Penugasan Karyawan`):** Klik **`Atur Penugasan Baru`**:
     - Buka dropdown **`Atasan Langsung`** → tunjuk **`Raka Pratama` & `Nisa Amelia` (`Intern`) 0x muncul**.
     - `[CABANG]` Uji anti-siklus `422`: pilih Karyawan **`Arif Budiman`**, pilih Atasan Langsung **`Aditya Nugroho`** (bawahannya), alasan `Tes cek validasi atasan melingkar` → klik **`Simpan Penugasan`** → **ditolak `422`**.
     - Pratinjau angkat `Intern`: pilih `Raka Pratama`, ubah status ke `Karyawan Tetap` → jelaskan hak jabatan & cuti langsung terbuka tanpa merusak riwayat magang → klik **`Batal`**.
  2. **Tab 2 (`Kewenangan Proyek (Project Authority)`):** Klik **`Tetapkan Wewenang Proyek`** → tunjuk `Intern` 0x di PM/Reviewer → `[CABANG]` pilih `WP-CORE` dengan PM = `Arif Budiman` & Escalation Reviewer = `Arif Budiman` → klik **`Tetapkan Proyek`** → ditolak (*tidak boleh dijabat oleh orang yang sama*) → klik **`Batal`**. Klik **`Tutup Wewenang`** sebentar untuk tunjuk modal konfirmasi → klik **`Batal`**.

#### `8C [INTI]` Delegasi Reviewer Sementara + Bukti Login Nyata `[Jendela 4 — HRGA ↔ Jendela 5 — Rian Kurniawan]`
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

#### `8D [CABANG]` Pemilik Kebijakan Multi-Owner `[Jendela 1 — Direktur vs Jendela 4 — HRGA di /admin/policies]`
- **Aksi:** Di **`Jendela 1`** tunjuk seksi **`Penugasan Pemilik Kebijakan (Policy Owners)`** (bisa `Tetapkan Pemilik`/`Ubah`/`Cabut`, dan menolak pencabutan pemilik terakhir) + tombol **`Unduh Audit CSV`**. Di **`Jendela 4`** tunjuk HRGA hanya bisa mengubah kategori miliknya dan tabel pemilik berstatus **`Hanya Lihat (Direktur/Admin)`**.

#### `8E [INTI]` Saluran Notifikasi & Uji Kirim `[Jendela 1 — Direktur di /admin/notifications]`
- **Aksi:** Tunjuk 3 kartu status saluran (**`In-App: Aktif`**, **`Email & Browser Push: Mode Simulasi Aktif`** — jujur tanpa memalsukan status kirim luar) & **`Matriks Routing Kanal Per Trigger Event`** (9 trigger). Di panel **`Instrumen Uji Pengiriman Kanal Notifikasi`**, pilih kanal `Pusat Notifikasi In-App`, event `BLOCKER_RAISED`, penerima `dev.frontend@dutamedia.com` → klik **`Kirim Notifikasi Uji Coba`** → muncul di **`Log Pengiriman Uji Coba Terbaru`**.

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
| Lupa salin **Token Aktivasi 64 karakter** Budi di **Babak 1A** | Di tabel `/admin/users` baris Budi klik **`Kirim Ulang`** → **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** lagi. |
| Lupa cabut **Reviewer Sementara** Rian | Tinggal klik **`Cabut`** → **`Cabut Wewenang Sekarang`** di `/admin/temporary-reviewers` — aksesnya langsung tertutup detik itu juga. |
| Salah ketik nama/alur di tengah presentasi | Bilang santai: *"Ini sekaligus membuktikan validasi/audit sistem jalan,"* lalu pakai tombol `Edit`, `Hapus`, atau akun cadangan di Incognito. |

---

## 6. KARTU CONTEKAN TANYA-JAWAB STAKEHOLDER

- **Q: Kenapa pengajuan & persetujuan cuti nggak dilakukan di dalam WorkPulse saja?**
  > *Jawab:* "Sesuai cakupan awal proyek, WorkPulse fokus ke akuntabilitas harian dan penyelesaian kendala, bukan bikin HRIS baru. Jadi persetujuan cuti tetap di jalur HR yang biasa biar nggak *double-entry*. Begitu sudah ACC, HRGA tinggal catat di sistem — karyawan langsung bebas otomatis tanpa harus buka web pilih 0 komitmen."
- **Q: Kenapa menu `Workspace` dihilangkan untuk Direktur (`CEO_MANAGEMENT`), lalu notifikasinya gimana?**
  > *Jawab:* "Direktur memang nggak isi komitmen harian dan EOD, jadi kalau `Workspace` muncul malah menuhin layar dan berisiko ngotorin statistik tim operasional. Untuk notifikasi, Direktur & Admin tetap pakai lonceng plus badge merah di pojok kanan atas (*Hybrid*), sementara staf biasa tetap punya shortcut di sidebar."
- **Q: Apa bedanya `AMBER` dengan `RED` di komitmen pagi? Kenapa `RED` wajib bikin tiket blocker dulu, sedangkan `AMBER` boleh tidak?**
  > *Jawab:* "Kalau `RED` artinya kerjaan sudah beneran macet atau terancam gagal hari ini — wajib bikin tiket blocker dulu biar langsung ada PIC, target waktu, dan eskalasi, nggak ada lagi 'RED siluman'. Kalau `AMBER`, itu peringatan awal atau tugas carry-over 2 hari; kalau tiap kekhawatiran kecil wajib bikin tiket, antrean atasan bakal kebanjiran dan karyawan malah takut lapor AMBER lalu milih bohong klik GREEN."
- **Q: Kenapa di EOD karyawan tetap dibolehin pilih `GREEN` (`DEC-003`) meski pagi tadi sempat `AMBER`/`RED`?**
  > *Jawab:* "Karena kendala pagi hari bisa saja sudah selesai di siang hari. Status akhir tetap keputusan jujur karyawan, sementara seluruh riwayat status paginya tetap tercatat di log buat dilihat atasan."
- **Q: Kalau PIC blocker yang ditunjuk sistem lagi cuti, tiketnya lari ke mana (`DEC-014` & `DEC-017`)?**
  > *Jawab:* "Tiket nggak pernah dikirim ke orang yang lagi cuti dan nggak pernah diturunkan ke rekan sejawat atau bawahan tanpa mandat resmi — otomatis naik ke atasan langsungnya (N+1) sampai ke Direktur."
- **Q: Bedanya `Antrean Kepatuhan` (`/compliance`) sama `Catatan Coaching` (`/coaching`)?**
  > *Jawab:* "`/compliance` khusus HRGA untuk menindaklanjuti pola telat atau mangkir lapor harian, sedangkan `/coaching` dipakai atasan langsung buat mencatat bimbingan atau apresiasi 1-on-1 ke bawahannya."
