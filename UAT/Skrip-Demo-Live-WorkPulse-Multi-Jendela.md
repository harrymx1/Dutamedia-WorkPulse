# SKRIP DEMO LIVE WORKPULSE — MULTI-JENDELA (100% SEMUA ALUR & KONDISI)

**Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Password Semua Akun Uji:** `Password123!` · **Zona Waktu:** WIB (`Asia/Jakarta`)

> **Cara Pakai Skrip Ini:**
> - **Bahasa simpel & siap klik:** Tinggal ikuti jendela, menu, tombol, dan teks *copy-paste* yang ada. Tidak perlu mengarang isian di tempat.
> - **Arti `[INTI]` vs `[CABANG]`:**
>   - **`[INTI]`** = alur utama dari awal sampai akhir (±30 menit). Aman berdiri sendiri meski semua `[CABANG]` dilewati.
>   - **`[CABANG]`** = variasi lain, validasi error (`400`/`403`/`404`/`409`/`422`), dan kasus khusus (total ±55–60 menit kalau dijalankan semua). Semua cabang sengaja ditaruh **sebelum tombol kirim** atau pakai **akun/tiket terpisah**, jadi **100% aman jalan lurus dari Babak 1 ke Babak 9 tanpa reset database di tengah demo**.

---

## 1. PETA 5 JENDELA CHROME (MAKSIMAL 5 BERSAMAAN)

Buka maksimal 5 jendela Chrome (boleh pakai 5 profil Chrome atau 4 profil + 1 Incognito) supaya minim keluar-masuk akun:

| Jendela | Akun Login (`Password123!`) | Halaman Awal | Catatan Ganti Akun |
|---|---|---|---|
| **Jendela 1** | `direktur@dutamedia.com` — **Hendra Wijaya** (`CEO_MANAGEMENT`) | `/admin/policies` | **0x ganti akun** (dipakai Babak 1, 2, 7, 8, 9) |
| **Jendela 2** | Mulai `product@dutamedia.com` — **Dio Bayu** (`PROJECT_MANAGER`) | `/daily/morning` | Ganti di **Babak 3B** ke `network.infra@dutamedia.com` (**Fakhrizal**), lalu **Babak 3C–7A** ke `dev.frontend@dutamedia.com` (**Aditya**) |
| **Jendela 3** | `head.eng@dutamedia.com` — **Arif Budiman** (`HEAD` Engineering) | `/dashboard` | **0x ganti akun** (dipakai Babak 3, 4, 6, 7) |
| **Jendela 4** | `hrga@dutamedia.com` — **Dewi Lestari** (`HRGA`) | `/admin/users` | **0x ganti akun** (dipakai Babak 1, 5, 6, 8) |
| **Jendela 5 (Incognito)** | Akun tamu & cabang terpisah (ganti sesuai babak) | `/login` | Babak 1A–C (`Budi` → `admin@dutamedia.com`), 2B (`Nadia`), 2D (`Achmad`), 3A–B (`Raka`), 5 (`Oivi`), 8C (`Rian`) |

---

## 2. PEMISAHAN DATA DUMMY (`seed.ts`) & CHECKLIST 5 MENIT PRA-DEMO

### A. Pemisahan Akun & Objek (`[INTI]` vs `[CABANG]`) — Anti-Bentrok State
| Akun / Data di `seed.ts` | Dipakai untuk Jalur | Kondisi Awal Setelah Reset Bersih |
|---|---|---|
| `product@dutamedia.com` (**Dio Bayu**) | **`[INTI]`** Siklus Harian | Form pagi kosong + `Prioritas Kemarin Sore` + `Carry-Over #2 AMBER` & `#1 GREEN` |
| `dev.frontend@dutamedia.com` (**Aditya**) | **`[INTI]`** Blocker + Koreksi + Notif | Komitmen pagi sudah terkunci (`ON-TIME`) + tiket `OOM` (`WP-CORE`) + tiket `CROSS_TEAM` + tiket `NETWORK` + 2 catatan coaching |
| `intern.frontend@dutamedia.com` (**Raka**, `Intern`) | **`[INTI]`** `RED` Cara A + Blocker + `Intern` | Form pagi kosong + `Carry-Over #1` `WP-CORE` + punya izin tercatat `H+5` (`PERMIT`) |
| `specialist.it@dutamedia.com` (**Achmad**, PIC `HOSTING_DOMAIN`) | **`[INTI]`** Bukti Cuti Hari Ini + Cuti Vertikal | Cuti `APPROVED` hari ini → otomatis bebas check-in + blocker `HOSTING_DOMAIN` naik ke `Gunawan Setiawan` |
| `qa@dutamedia.com` (**Nadia**) | **`[CABANG]`** Kirim `0 Komitmen` | Form pagi kosong + 1 baris kepatuhan `H-2` berstatus `Sudah Ditangani` (`ADDRESSED`) |
| `staff.finance@dutamedia.com` (**Oivi**) | **`[CABANG]`** Uji live Cuti & Dispensasi Hari Ini | Form pagi kosong & jadwal normal → bisa dites dikunci lalu di-Edit & di-Hapus kembali normal |
| `Fakhrizal` / `Gunawan` / `Dharma` / `Bambang` | PIC & Non-PIC Blocker | 6 tiket lintas kategori siap demo + 1 tiket `CRITICAL` lewat batas waktu (`-2 jam` di `WP-CORE`) |
| `Hari Wibowo` (`ST/HRGA/2026/XI/104`) | Data awal `/exemptions` | 1 dispensasi `Dinas Luar` (`H+2 s/d H+3`) siap tampil |

### B. Checklist 5 Menit Sebelum Demo
- [ ] Jalankan reset & seed bersih (`node backend/scripts/reset_live_seed.cjs` atau `npx prisma db seed`) supaya semua akun & tanggal kembali pas dengan hari demo.
- [ ] Buka 5 jendela Chrome sesuai tabel di Bagian 1, login `Jendela 1–4` sekaligus.
- [ ] Cek cepat `Jendela 2` (`Dio Bayu`): kalau ada sisa draf lokal dari latihan kemarin, klik **`Reset Draf`**.
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
| `EOD Outcome`: 4 hasil (`Selesai`, `Sebagian` → lanjut, `Belum Selesai` → stop wajib alasan, `Dibatalkan` → wajib alasan) + **`DEC-003`** `GREEN` tidak dikunci + kunci pasca-EOD | `2F` |
| `Riwayat Saya` (`/daily/history`): KPI, *expand row*, panel read-only cuti/dispensasi, `Unduh CSV` | `2G`, `5A` |
| **`DEC-020`** `RED` wajib blocker + tolak tanpa tiket + jalan pintas **Cara A** (simpan draf → `/raise-blockers` → balik otomatis) | `3A` |
| 16 Kategori (5 grup) + 9 Dampak (maks `3/3`) + **`DEC-014`/`DEC-017`** Cuti Vertikal PIC naik ke atasan + `isCategoryOwner` staf biasa | `3A`, `3B` |
| Siklus Blocker penuh: `Terima & Tangani` → `Beri Bantuan` → `Membantu Sebagian` → `Selesaikan` → `Belum Memadai` → tutup; `Bantu Unblock` auto-scroll + non-PIC + `Feed Dukungan Lintas Fungsi` + `Terima Risiko` | `3B`, `3C` |
| **`DEC-016`** `Edit Tiket` (*Dynamic Re-Routing*) + `Hapus Tiket` (3 preset) + Radar `Aging` | `3D`, `3E` |
| Koreksi Pagi & EOD: `Minor` (`AUTO_APPLIED`) + `Material` (`Tolak` → revisi `Gunakan Draf Sebelumnya` → `Setujui`) | `4A`, `4B`, `4C` |
| **`DEC-018`** `/admin/leaves` (Tambah, validasi `Intern` tanpa `Cuti Tahunan` `400`, tanggal terbalik `400`, bentrok `409`, Edit, Hapus) + `/exemptions` (Tambah, Edit, Hapus) | `5A`, `5B`, `5C` |
| `/compliance` (`Tindak Lanjut`, validasi `< 5` huruf, `Ubah Catatan`) + `/coaching` (`Dibagikan` vs `Rahasia Manajemen`, template cepat) | `6A`, `6B` |
| `/notifications` (lencana sidebar/TopBar, isolasi `Rahasia`, `canUserAccess` sembunyikan tombol `/admin/policies`, tab `Pengaturan Kanal`) | `7A` |
| `/dashboard` 3 cakupan (`PROJECT` / `DIVISION` / `COMPANY` + filter `Intern`) + `/projects/risk` + `/reports` (preset, filter `Kontrak`, CSV & PDF) | `7B`, `7C`, `7D` |
| `/admin/users` (Nonaktifkan/Aktifkan, `Akun Anda`), `/admin/organization` (`Intern` 0x, anti-siklus `422`, angkat `Intern`, `Project Authority` tolak PM=Reviewer), `/admin/temporary-reviewers` (bukti login `Review Koreksi` + `Antrean Blocker`), `/admin/policies` multi-owner, `/admin/notifications` uji kirim 9 trigger | `8A`–`8E` |

---

## 4. SKRIP 9 BABAK DEMO LIVE

---

### BABAK 1 — Onboarding, Login, Profil, `403/404`, & Pemisahan Tugas `CEO` + `Admin` (`DEC-019`)
> **Estimasi:** 5 menit · **Prasyarat:** Data hasil seed bersih · **Dampak:** Akun `Budi Santoso` aktif (nambah 1 user aktif di direktori).

#### `1A [INTI]` HRGA Undang Karyawan Baru `[Jendela 4 — Dewi Lestari (HRGA)]`
- **Aksi:** Di menu **`Kelola Pengguna`** (`/admin/users`), klik **`Undang Pengguna Baru`**, lalu isi:
  - **Nama Lengkap:** `Budi Santoso`
  - **Alamat Email Perusahaan:** `budi.santoso@dutamedia.com`
  - **Status Karyawan:** `Karyawan Tetap`
  - **Peran:** `Karyawan`
  - **Divisi:** `Engineering`
  - **Jabatan:** `Backend Engineer`
  - Klik **`Terbitkan Undangan (72 Jam)`**.
- **Lihat di layar:** Keluar token murni 64 karakter + tombol **`Salin Token Aktivasi`**. Klik **`Salin Token Aktivasi`** → **`Selesai`**.
- **Bilang singkat:** *"Karyawan baru nggak langsung dibuatkan password oleh admin — mereka dikasih token undangan 72 jam yang cuma bisa dipakai sekali."*

#### `1A-C [CABANG]` Uji Cabut & Kirim Ulang Token + Cek `/admin/invitations` `[Jendela 4 — HRGA]`
- **Aksi:**
  1. Pada baris `Budi Santoso`, klik **`Cabut`** → **`Cabut Undangan`** → status berubah merah **`Dicabut`** (token lama langsung hangus).
  2. Klik **`Kirim Ulang`** → **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** (pakai token baru ini!) → **`Selesai`**.
  3. Klik menu **`Undangan Karyawan`** (`/admin/invitations`) sebentar buat nunjukin riwayat status undangan (*Aktif*, *Dicabut*, *Terpakai*).
- **Bilang singkat:** *"Kalau token salah kirim atau bocor, HRGA tinggal cabut dan terbitkan ulang — token lama otomatis nggak laku."*

#### `1B [INTI]` Tolak Login `INVITED`, Aktivasi Token, Login, & Profil `[Jendela 5 — Incognito]`
- **Aksi:**
  1. Buka `/login`, masukkan `budi.santoso@dutamedia.com` dan `Password123!` → klik **`Masuk Sistem`**.
     - *Lihat di layar:* Ditolak merah **`"Akun Anda belum diaktifkan..."`**. Tunjukkan sekilas tombol ikon mata, centang `Ingat email di perangkat ini`, dan info kontak HRGA jika lupa sandi.
  2. Klik tab **`Aktivasi Akun`** (`/activate`): tempel token 64 karakter dari HRGA → isi sandi baru & konfirmasi `Password123!` → klik **`Aktivasi Akun`**.
     - *Lihat di layar:* Muncul pratinjau `Budi Santoso · Engineering` sebelum simpan, 3 syarat centang hijau + meteran `Sangat Kuat`, lalu layar **Aktivasi Berhasil!**.
  3. Klik **`Lanjut ke Halaman Masuk`**, login `budi.santoso@dutamedia.com` / `Password123!` → mendarat otomatis di `/daily/morning`.
  4. Klik avatar **`BS`** di kanan atas → **`/profile`**: tunjukkan **Kartu Identitas & Penugasan Aktif**, isi pratinjau kolom Ganti Kata Sandi (`DutamediaBaru2026!`) untuk nunjukin centang syarat & opsi *Akhiri seluruh sesi aktif di perangkat lain* **(JANGAN klik simpan supaya password tetap `Password123!`)**, dan **Ringkasan Kanal Notifikasi**.
- **Bilang singkat:** *"Akun yang belum aktivasi pasti ketolak saat login. Setelah aktivasi mandiri pakai token, sandi baru langsung aktif dan user bisa pantau profilnya sendiri."*

#### `1C [CABANG]` Uji `403`/`404` & Pemisahan Tugas `CEO` + `Admin` (`DEC-019`) `[Jendela 5 & Jendela 1]`
- **Aksi:**
  1. Masih sebagai **Budi (`Jendela 5`)**: ketik URL `/admin/policies` → tampil **`403 — Akses Dibatasi`** → klik **`Kembali ke Beranda`**. Ketik URL `/halaman-tidak-ada` → tampil **`404 — Halaman Tidak Ditemukan`** → klik **`Kembali ke Beranda`**, lalu klik **`Keluar`**.
  2. Login **`Jendela 5`** sebagai **`admin@dutamedia.com`** (`SYSTEM_ADMIN`) → tunjukkan di sidebar kiri **tidak ada grup `Workspace`**, ketik URL `/daily/morning` → ditolak **`403`**, lalu klik **`Keluar`**.
  3. Tunjuk **`Jendela 1` (`Hendra Wijaya` — Direktur / `CEO_MANAGEMENT`)**: tunjukkan di sidebar kiri **grup `Workspace` juga sudah tidak ada (`DEC-019`)**, buka `/blockers` sebentar → tombol **`+ Laporkan Blocker Baru` tersembunyi**, ketik URL `/daily/morning` → ditolak **`403`**, lalu klik **ikon lonceng di TopBar kanan atas** untuk masuk ke `/notifications`.
- **Bilang singkat:** *"Baik Admin maupun Direktur nggak wajib isi komitmen harian, jadi menu Workspace-nya kita hilangkan supaya data kepatuhan murni ngukur tim operasional. Untuk notifikasi, mereka tetap punya tombol lonceng di kanan atas — pola ini kita sebut Hybrid Notification."*

---

### BABAK 2 — Kunci Pagi (`LOCKED`), Geser Jam Cut-Off, & Siklus Harian Lengkap
> **Estimasi:** 9 menit · **Prasyarat:** `Dio` & `Nadia` belum isi form hari ini; `Achmad` cuti resmi hari ini · **Dampak:** `Dio` selesai 1 siklus penuh (Morning → AddWork → EOD → History); `Nadia` tercatat `0 Komitmen`.

#### `2A [INTI]` Kunci Pagi (`LOCKED`), Opsi A `Additional Work`, & Geser Jam Cut-Off `[Jendela 2 ↔ Jendela 1]`
- **Aksi:**
  1. Di **`Jendela 2 — Dio Bayu` (`/daily/morning`)**:
     - *Jika jam demo sudah lewat `09:30 WIB` (paling sering):* langsung terlihat spanduk merah **`LOCKED (Pasca Cut-Off)`**.
     - *Jika demo dilakukan pagi sebelum `09:30 WIB`:* minta **`Jendela 1 — Direktur`** ubah sementara *Batas Tepat Waktu* & *Batas Cut-Off Pagi* ke 5 menit sebelum jam sekarang di `/admin/policies` → refresh `Jendela 2` agar spanduk merah **`LOCKED`** muncul.
  2. Klik tab **`2. Additional Work`** (`/daily/additional-work`) → tunjukkan formulir tetap terbuka dengan alasan otomatis **`Komitmen Pagi Terlewat`**.
  3. Pindah ke **`Jendela 1 — Direktur` (`/admin/policies`)**:
     - Klik **`+ Buat Versi Kebijakan Baru`**, ubah jam pagi supaya longgar dari jam sekarang (misal demo malam jam 20:00 → set `23:40` & `23:50`; demo siang jam 13:00 → set `16:00` & `16:30`):
       - **Batas Tepat Waktu Pagi *:** *(1–2 jam setelah jam sekarang, misal `23:40`)*
       - **Batas Kunci Pengisian Pagi (Cut-Off) *:** *(lebih akhir, misal `23:50`)*
       - **Batas Tepat Waktu Sore (EOD) *:** `23:55` *(atau `17:00` jika siang)*
       - **Batas Kunci Pengisian Sore (Cut-Off) *:** `23:59`
       - **Tanggal Mulai Berlaku *:** *(hari ini WIB)*
       - **Alasan Perubahan Kebijakan *:**
         ```text
         Penyesuaian sementara jam cut-off untuk demonstrasi live sistem WorkPulse di hadapan pimpinan
         ```
     - Klik **`Simpan & Terapkan Versi Baru`**.
  4. Balik ke **`Jendela 2 — Dio Bayu` (`/daily/morning`)**, tekan **`F5`**.
- **Lihat di layar:** Status berubah hijau **`ON-TIME`** dan formulir terbuka. **⚡ Efek Lintas Jendela:** Lencana angka merah di menu sidebar **`Notifikasi`** & lonceng TopBar langsung nyala.
- **Bilang singkat:** *"Kalau sudah lewat cut-off, form pagi memang kekunci jujur — tapi pekerjaan siang tetap bisa dicatat lewat Additional Work. Dan kalau ada penyesuaian jam kerja, Direktur bisa ubah di kebijakan dengan jejak audit, nggak asal tembak database."*

#### `2B [CABANG]` Kirim `0 Komitmen Hari Ini` (`DEC-004`) `[Jendela 5 — Nadia Kusuma (qa@dutamedia.com)]`
- **Aksi:** Masuk sebagai `qa@dutamedia.com` di `/daily/morning` → centang **`Hari ini tidak ada komitmen harian khusus (0 Komitmen)`** → isi alasan wajib:
  ```text
  Mengikuti pelatihan pengujian keamanan aplikasi dan audit mutu internal seharian penuh bersama tim HRGA
  ```
  → klik **`Kirim Morning Commitment`**, lalu **`Keluar`**.
- **Lihat di layar:** Tampil kartu hijau **`0 KOMITMEN`**.
- **Bilang singkat:** *"Untuk yang lagi training atau tugas non-komitmen seharian, nggak perlu ngarang tugas — tinggal pilih 0 Komitmen dengan alasan jelas."*

#### `2C [INTI]` `Prioritas Kemarin Sore`, `Carry-Over #2 AMBER`, Validasi `AMBER` (`DEC-021`), & `Simpan Draf` `[Jendela 2 — Dio Bayu]`
- **Aksi:**
  1. Tunjuk kotak kuning **`Prioritas Kemarin Sore`** di bagian atas form.
  2. Klik **`Lihat Draf`** pada **`Draf Tugas Berlanjut dari Kemarin (2 Tersedia)`** → tunjuk item **`Carry-Over #2 · Disarankan AMBER`** → centang kedua item → klik **`Gunakan Item Terpilih ke Slot Hari Ini`**.
  3. Klik **`+ Tambah Slot Komitmen`** untuk membuka **Slot #3** (tombol tambah langsung hilang karena maksimal 3 slot).
  4. **`[CABANG]` Uji 2 Penolakan Sebelum Kirim (aman, tidak mengubah DB):**
     - Ketik `Te` di Slot #3 → klik **`Kirim Morning Commitment`** → ditolak merah *minimal 3 karakter*.
     - Pilih risiko **`AMBER`**, kosongkan **`Uraian Resiko atau Potensi Kendala *`**, klik **`Kirim Morning Commitment`** → ditolak merah *komitmen AMBER wajib isi potensi kendala*.
  5. **`[INTI]` Lengkapi Slot #3 + Buktikan `DEC-021` (`AMBER` boleh tanpa tiket blocker):**
     - **Teks Komitmen Terukur *:**
       ```text
       Menyelesaikan validasi struktur kolom ekspor laporan eksekutif CSV bersama tim Finance dan QA
       ```
     - **Proyek Terkait (Opsional):** `[WP-CORE] WorkPulse Platform Core 2026`
     - **Tautan Referensi (Opsional):** `https://github.com/dutamedia/workpulse/issues/230` *(tunjuk juga tombol **`Pilih Blocker Aktif`** di sebelahnya)*.
     - **Tingkat Risiko:** Pastikan **`AMBER`**. Tunjuk dropdown **`Tiket Blocker Penyebab (Opsional)`** → biarkan **`-- Tidak Terkait Tiket Blocker Aktif (Risiko / Dependensi Ringan) --`**, dan tunjuk teks petunjuk kuning di bawahnya (`DEC-021`).
     - **Uraian Resiko atau Potensi Kendala *:**
       ```text
       Urutan kolom status karyawan pada file CSV masih menunggu konfirmasi akhir dari Senior Finance Staff
       ```
     - **Tindakan / Bantuan yang Diharapkan (Opsional):**
       ```text
       Mohon konfirmasi struktur kolom laporan dari tim Finance sebelum pukul 14:00 WIB
       ```
  6. Klik **`Simpan Draf`**, tekan **`F5`** (ketikan aman tersimpan), lalu klik **`Kirim Morning Commitment`**.
- **Lihat di layar:** Terkunci rapi berstatus **`SUBMITTED (Terkunci)`** + **`ON-TIME`** + tombol **`Ajukan Koreksi Komitmen`**.
- **Bilang singkat:** *"Tugas yang ngegantung 2 hari kemarin otomatis ditarik ke draf pagi dan disarankan AMBER. Khusus AMBER, karyawan nggak dipaksa bikin tiket blocker dulu supaya atasan nggak kebanjiran tiket untuk hal-hal kecil."*

#### `2D [INTI]` Karyawan Cuti Resmi Otomatis Bebas Check-In (`DEC-018`) `[Jendela 5 — Achmad Noer (specialist.it@dutamedia.com)]`
- **Aksi:** Login sebagai `specialist.it@dutamedia.com` → buka `/daily/morning`, klik tab `/daily/additional-work` dan `/daily/eod` sekilas → buka **`Riwayat Saya`** (`/daily/history`), lalu **`Keluar`**.
- **Lihat di layar:** Ketiga form harian **otomatis terkunci** menampilkan spanduk hijau **`Masa Cuti Resmi (Cuti Tahunan)`** (tanpa perlu klik `0 komitmen`), dan di `/daily/history` tampil panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
- **Bilang singkat:** *"Begitu cuti dicatat resmi oleh HRGA, yang bersangkutan otomatis bebas tagihan check-in hari itu tanpa harus buka web pilih 0 komitmen."*

#### `2E [INTI]` Pekerjaan Tambahan: Tambah Tugas, `Intern` 0x di Daftar Atasan, `Edit`, & `Hapus` `[Jendela 2 — Dio Bayu]`
- **Aksi:**
  1. Buka tab **`2. Additional Work`** (`/daily/additional-work`).
  2. Isi **Tugas Tambahan #1**:
     - **Deskripsi:** `Menyusun revisi matriks hak akses modul portal penagihan klien atas permintaan mendadak klien`
     - **Alasan:** `Penugasan Baru dari Atasan` → di dropdown **Ditugaskan Oleh**, tunjukkan nama **`Dharma Putra`** muncul dan nama anak magang (`Raka Pratama` / `Nisa Amelia`) **sama sekali tidak ada**. Pilih `Dharma Putra`.
     - **Proyek:** `[PRJ-PORTAL] Dutamedia Client Portal v2.4`
     - **Tautan:** `https://github.com/dutamedia/workpulse/issues/235`
     - Klik **`Tambahkan Pekerjaan`**.
  3. **`[CABANG]` Isi Tugas Tambahan #2 lalu uji `Edit` & `Hapus`:**
     - **Deskripsi:** `Menyiapkan draf agenda rapat sinkronisasi mingguan tim Delivery`
     - **Alasan:** `Tugas Terlewat Dicatat Pagi` → Proyek: `-- Non-Proyek --` → klik **`Tambahkan Pekerjaan`**.
     - Klik **`Edit`** pada Tugas #2 → tambah kata ` dan daftar periksa` → **`Simpan Perubahan`**.
     - Klik **`Hapus`** pada Tugas #2 → isi alasan wajib: `Agenda rapat sudah digabungkan langsung ke dokumen evaluasi proyek PRJ-PORTAL oleh Project Manager` → konfirmasi hapus.
- **Bilang singkat:** *"Kerjaan mendadak di siang hari dicatat terpisah di sini supaya komitmen pagi nggak tercemar. Anak magang juga nggak mungkin muncul di daftar pemberi tugas."*

#### `2F [INTI]` Evaluasi Sore (`/daily/eod`): 4 Hasil, Lanjut/Stop, `DEC-003`, & Kunci Pasca-EOD `[Jendela 2 — Dio Bayu]`
- **Aksi:** Klik tab **`3. EOD Outcome`** (`/daily/eod`), isi 4 item secara berurutan:
  1. **Komitmen #1 (`Finalisasi spesifikasi...`):** Hasil **`Selesai`**.
  2. **Komitmen #2 (`Menyusun dokumen kriteria...`):** Hasil **`Sebagian`** → Kelanjutan **`Lanjutkan Besok (Tugas Berlanjut)`** → Catatan *(opsional)*: `Tinggal menyelesaikan bagian skenario batas waktu sesi login paralel besok pagi`.
  3. **Komitmen #3 (`Validasi struktur kolom CSV...`):** Hasil **`Belum Selesai`** → Kelanjutan **`Tidak Dilanjutkan`** → **Alasan Tidak Dilanjutkan \* (wajib):** `Validasi kolom CSV diambil alih langsung oleh Senior Finance Staff sehingga tidak perlu dilanjutkan lagi oleh Product Manager`.
  4. **Pekerjaan Tambahan #1 (`Menyusun revisi matriks...`):** Hasil **`Dibatalkan`** → **Alasan Pembatalan \* (wajib):** `Klien memutuskan tetap memakai matriks hak akses versi awal hingga rilis tahap pertama selesai`.
  5. **Refleksi Akhir Hari:** Tunjuk bahwa pilihan **`GREEN` tetap bisa diklik** (`DEC-003`), lalu pilih **`AMBER`** dan isi penjelasan wajib: `Satu komitmen spesifikasi SSO masih perlu diselesaikan besok pagi sekitar 1 jam kerja`.
  6. **Prioritas Utama Besok:** `Menuntaskan dokumen kriteria penerimaan SSO Enterprise dan mendampingi uji terima PRJ-PORTAL bersama QA`.
  7. Klik **`Kirim Evaluasi EOD`**, lalu klik sebentar tab **`2. Additional Work`** untuk bukti form terkunci pasca-EOD.
- **Bilang singkat:** *"Kalau tugas belum beres dan nggak mau dilanjut besok, alasan wajib diisi. Setelah EOD dikirim, kerjaan harian tutup buku — kecuali lapor blocker yang tetap aktif kapan saja."*

#### `2G [INTI]` `Riwayat Saya` (`/daily/history`) `[Jendela 2 — Dio Bayu]`
- **Aksi:** Buka **`Riwayat Saya`**, tunjuk 4 kartu KPI, klik **Detail** pada baris hari ini, tunjuk panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**, dan klik **`Unduh CSV`**.
- **Bilang singkat:** *"Semua catatan harian plus riwayat cuti atau dispensasi yang dicatat HRGA bisa dipantau di satu tempat, bersifat hanya-baca."*

---

### BABAK 3 — Siklus Blocker Lengkap: `RED` Wajib Blocker (`DEC-020` Cara A), 16 Kategori, 9 Dampak, Cuti Vertikal, Kolaborasi 3 Peran, `Dynamic Re-Routing`, `Hapus`, & `Aging`
> **Estimasi:** 9 menit · **Prasyarat:** `Raka` & `Aditya` punya form/tiket sesuai seed · **Dampak:** Tiket baru Raka & tiket OOM Aditya ditutup (`CLOSED`), tiket `APPROVAL` jadi `ACCEPTED_RISK`, tiket `CROSS_TEAM` pindah ke Ops, tiket `NETWORK` terhapus.

#### `3A [INTI]` `RED` Wajib Blocker (Cara A), Cuti Vertikal (`DEC-014`/`DEC-017`), & 16 Kategori / 9 Dampak `[Jendela 5 — Raka Pratama (intern.frontend@dutamedia.com)]`
- **Aksi:**
  1. Login sebagai `intern.frontend@dutamedia.com` → di `/daily/morning`, klik **`Lihat Draf`** → klik **`Salin ke Slot`** pada tugas *`Implementasi tata letak kartu responsif...`* (`[WP-CORE]`).
  2. Ubah **`Tingkat Risiko Tugas Hari Ini *`** menjadi **`RED`**.
  3. **`[CABANG]` Uji Validasi `RED` Wajib Blocker:** Isi `Uraian Resiko`: `Server staging WP-CORE mati 502 Bad Gateway`, biarkan dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`** kosong, lalu klik **`Kirim Morning Commitment`**.
     - *Lihat di layar:* Sistem menolak tegas — tidak boleh ada status `RED` tanpa tiket blocker aktif!
  4. **`[INTI]` Jalankan Cara A (`DEC-020`):** Klik tombol **`+ Buat Tiket Blocker Sekarang`** di bawah dropdown.
     - *Lihat di layar:* Draf pagi otomatis tersimpan, halaman langsung berpindah ke `/raise-blockers?returnTo=/daily/morning&slot=0` dengan spanduk konteks kembali ke Morning Commitment & proyek `WP-CORE` sudah terisi!
  5. **`[CABANG]` Uji Cuti Vertikal (`DEC-014` & `DEC-017`) & Batas 3/3 Dampak (sebelum kirim):**
     - Pilih kategori **`1. Teknis & Sistem` → `Hosting, Cloud & Domain (HOSTING_DOMAIN)`** → tunjuk **Panel Jalur Penanganan Otomatis**: karena PIC resminya (`Achmad Noer`) sedang cuti hari ini, tiket **tidak turun ke rekan/bawahan, tapi naik ke atasannya (`Gunawan Setiawan` — Head Ops & Infra)**.
     - Centang 3 kotak dampak untuk membuktikan kotak ke-4 s/d ke-9 otomatis terkunci (`3 / 3 dipilih`), lalu lepas 1 sehingga tersisa **2 dampak**.
  6. **`[INTI]` Lengkapi & Kirim Tiket Staging `WP-CORE`:**
     - **Judul Kendala *:** `Server Staging WP-CORE Mengalami 502 Bad Gateway Saat Uji Tampilan`
     - **Kategori *:** **`1. Teknis & Sistem` → `Server & Rilis Sistem (INFRA)`**
     - **Dampak * (2 kotak):** **`Target & Tenggat Waktu (MILESTONE)`** & **`Satu Tim / Divisi (TEAM)`**
     - **Keparahan *:** **`High (Target 4 jam)`**
     - **Deskripsi & Upaya Mandiri *:**
       ```text
       Sejak pagi server staging WP-CORE gagal memuat halaman riwayat dengan pesan 502 Bad Gateway sehingga uji responsif belum bisa dilanjutkan. Sudah dicoba bersihkan cache browser namun container staging tetap tidak merespons.
       ```
     - **Bantuan yang Diharapkan:**
       ```text
       Mohon bantuan restart container frontend-staging WP-CORE dan periksa konfigurasi Nginx
       ```
     - **Jalur Kewenangan *:** `Organizational Authority (Struktural)` → **Penanggung Jawab:** biarkan `-- Ditentukan Otomatis --` (tunjuk panel pratinjau langsung mengarah ke **`Fakhrizal Asshiddiq`**).
     - Klik **`Kirim Laporan Blocker`**.
- **Lihat di layar:** **⚡** Setelah kirim, browser **otomatis balik ke `/daily/morning`** dengan draf Raka utuh & tiket barusan sudah otomatis terpilih di Slot #1! Klik **`Kirim Morning Commitment`** → beres terkirim!
- **Bilang singkat:** *"Untuk status RED, user wajib bikin tiket blocker dulu supaya nggak ada 'RED siluman' tanpa PIC. Pakai tombol shortcut tadi, draf komitmen paginya otomatis aman dan langsung ketaut pas balik."*

#### `3B [INTI]` Spesialis (`isCategoryOwner`) & Siklus Penuh Tiket Lintas Jendela `[Jendela 2 → Fakhrizal ↔ Jendela 5 → Raka]`
- **Aksi:**
  1. Di **`Jendela 2`**, keluar dari Dio lalu login **`network.infra@dutamedia.com`** (**Fakhrizal Asshiddiq** — staf `EMPLOYEE` yang jadi PIC kategori `INFRA`) → buka **`Antrean Blocker`** (`/blockers`).
     - *Lihat di layar:* Lencana merah notifikasi nyala; menu `Antrean Blocker` & `Penuaan & Eskalasi` terbuka untuk staf spesialis (`isCategoryOwner`). *(Bilang sekilas: kalau Fakhrizal sendiri yang lapor kendala `INFRA`, sistem otomatis naikkan ke atasannya `Gunawan` biar nggak nunjuk diri sendiri).*
  2. Pilih tiket **`Server Staging WP-CORE Mengalami 502 Bad Gateway...`** → klik **`Terima & Tangani`** → klik **`Beri Bantuan`**:
     - **Tindakan Bantuan *:** `Merestart service container frontend-staging WP-CORE dan membersihkan antrean worker Nginx`
     - **Catatan Hasil / Progres *:** `Halaman utama staging sudah kembali hidup, silakan Raka coba akses kembali`
     - Klik **`Simpan Kontribusi`**.
  3. **`⚡` Pindah ke `Jendela 5 — Raka Pratama`** di **`Lapor Blocker` → tab `Blocker Saya`** (`/raise-blockers?tab=mine`): klik **`Terima Bantuan (Membantu Sebagian)`**, isi:
     ```text
     Halaman utama staging sudah bisa dibuka, tetapi halaman riwayat cuti masih error 502 pada panggilan API
     ```
     → kirim.
  4. **Balik ke `Jendela 2 — Fakhrizal`**: klik **`Selesaikan`** → isi resolusi:
     ```text
     Koneksi upstream API pada reverse proxy staging WP-CORE telah diperbaiki dan seluruh endpoint merespons 200 OK
     ```
     → **`Kirim Solusi`**.
  5. **`[CABANG]` Kembalikan Solusi lalu Tutup Final (`Jendela 5 ↔ Jendela 2`):**
     - Di **`Jendela 5 — Raka`**: klik **`Belum Memadai (Kembalikan)`** → isi:
       ```text
       Daftar data sudah tampil, namun filter tanggal di staging masih timeout setelah 10 detik
       ```
       → **`Kirim & Kembalikan ke PIC`** (status balik ke `Sedang Ditangani`).
     - Di **`Jendela 2 — Fakhrizal`**: klik **`Selesaikan`** → isi: `Batas timeout koneksi database staging telah dinaikkan dan uji filter sudah di bawah 200ms` → **`Kirim Solusi`**.
     - Di **`Jendela 5 — Raka`**: klik **`Konfirmasi & Tutup Tiket`** (`Selesai Ditutup`). Buka sebentar `/profile` Raka untuk tunjuk pil ungu **`Intern`** & tanggal selesai magang, lalu **`Keluar`**.
- **Bilang singkat:** *"Penanggung jawab nggak bisa sepihak nutup tiket — pelapor sendiri yang mengonfirmasi apa solusinya beneran mempan atau perlu dikembalikan lagi."*

#### `3C [INTI]` `Bantu Unblock` Auto-Scroll, Bantuan Non-PIC, & `Terima Risiko` `[Jendela 3 — Arif Budiman ↔ Jendela 2 — Aditya]`
- **Aksi:**
  1. Di **`Jendela 2`**, keluar dari Fakhrizal lalu login **`dev.frontend@dutamedia.com`** (**Aditya Nugroho**).
  2. Di **`Jendela 3 — Arif Budiman` (`/dashboard`)**: pada **`Personil Butuh Bantuan Hari Ini`**, klik **`Bantu Unblock`** pada kendala OOM milik Aditya.
     - *Lihat di layar:* Langsung pindah ke `/blockers`, **panel kiri otomatis terscroll pas ke kartu tiket terbawah** dan **header panel kanan tetap utuh terlihat**!
  3. Meskipun PIC tiketnya `Bambang Pratama`, Arif (non-PIC) langsung klik **`Beri Bantuan`**:
     - **Tindakan Bantuan *:** `Menaikkan batas memori container GitLab CI runner dari 2GB menjadi 6GB`
     - **Catatan Hasil *:** `Pipeline build frontend sudah dijalankan ulang dan lolos tanpa error OOM`
     - Klik **`Simpan Kontribusi`**. Buka sebentar `/dashboard` → **⚡** bantuan Arif langsung muncul di **`Feed Dukungan Lintas Fungsi`**.
  4. **`⚡` Pindah ke `Jendela 2 — Aditya` (`/raise-blockers?tab=mine`)**: klik **`Terima sbg Penyelesaian (Tutup Tiket)`** → tiket langsung `Selesai Ditutup`.
  5. **`[CABANG]` Siklus `Terima Risiko` (`Jendela 3 — Arif` di `/blockers`):** Pilih tiket **`[Menunggu Persetujuan Rilis Arsitektur Database Baru]`** (`APPROVAL`, `WP-CORE`) → klik **`Terima & Tangani`** → klik **`Terima Risiko`**:
     - **Justifikasi *:** `Perubahan skema migrasi database tahap 2 ditunda ke rilis pekan depan agar jadwal demo UAT minggu ini tetap stabil`
     - **Rencana Mitigasi *:** `Tetap memakai skema tabel versi 1 disertai pemantauan indeks query harian oleh Technical Lead`
     - Klik **`Tetapkan Terima Risiko`**.
- **Bilang singkat:** *"Dari dashboard atasan tinggal klik Bantu Unblock, layar langsung mengarah tepat ke tiketnya tanpa ketutup. Kalau memang ada kendala yang secara bisnis diputuskan ditunda, atasan bisa tetapkan Risiko Diterima lengkap dengan mitigasinya."*

#### `3D [CABANG]` `Edit Tiket` (*Dynamic Re-Routing*) & `Hapus Tiket` (`DEC-016`) `[Jendela 2 — Aditya]`
- **Aksi:** Di `/raise-blockers?tab=mine`:
  1. Pada tiket **`[Menunggu Hasil Uji QA dari Tim Delivery]`** (`CROSS_TEAM`, PIC saat ini `Dharma Putra`), klik **`Edit Tiket`** → ubah **Divisi yang Ditunggu** ke **`Operations & Infrastructure`**, ubah deskripsi menjadi `Menunggu pembukaan port firewall staging dari tim Operations & Infrastructure` → simpan.
     - *Lihat di layar:* PIC otomatis berpindah ke **`Gunawan Setiawan`** (*Head Ops & Infra*).
  2. Pada tiket **`[Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus]`**, klik **`Hapus Tiket`** → tunjukkan 3 alasan preset (`Salah Input / Tiket Duplikat`, `Sudah Teratasi Mandiri`, `Kendala Tidak Jadi`) + `Alasan Lainnya` → pilih **`Sudah Teratasi Mandiri`** → konfirmasi hapus.
- **Bilang singkat:** *"Kalau divisi tujuan salah pilih pas lapor, tinggal edit tiketnya dan PIC otomatis pindah ke divisi yang benar. Tiket yang batal juga bisa dihapus dengan alasan tercatat."*

#### `3E [INTI]` Radar Keterlambatan (`Aging`) `[Jendela 3 — Arif Budiman]`
- **Aksi:** Buka **`Penuaan & Eskalasi`** (`/blockers/aging`), tunjuk kartu merah **`Lewat Batas Waktu: 1`** (tiket `CRITICAL` `WP-CORE`), centang **`Hanya Tampilkan Tiket Melewati Batas Waktu`**, klik **`Buka`**.
- **Bilang singkat:** *"Tiket kritis yang lewat batas waktu langsung nyala merah di radar penuaan supaya pimpinan bisa cepat turun tangan."*

---

### BABAK 4 — Koreksi Laporan: Minor (`AUTO_APPLIED`), Material (`Tolak` → Revisi → `Setujui`), & Koreksi EOD
> **Estimasi:** 4 menit · **Prasyarat:** `Aditya` sudah punya komitmen pagi terkunci · **Dampak:** Komitmen #1 ter-auto-apply, Komitmen #2 terupdate via persetujuan Head.

#### `4A [INTI]` Ajukan Koreksi Minor & Koreksi Material `[Jendela 2 — Aditya di /corrections/morning]`
- **Aksi:**
  1. **Koreksi Minor:** Pilih **`[Komitmen #1]`** → **`Koreksi Minor (Perbaikan Pengetikan / Typo)`** → ubah teks menjadi `Menyelesaikan implementasi komponen UI navigasi mobile responsif lintas 5 ukuran layar`, isi tautan `https://github.com/dutamedia/workpulse/pull/241`, isi alasan: `Melengkapi tautan PR nomor 241 dan memperjelas keterangan layar` → klik **`Kirim Permohonan Koreksi`**.
     - *Lihat di layar:* Langsung hijau **`AUTO_APPLIED`**.
  2. **Koreksi Material:** Pilih **`[Komitmen #2]`** → **`Koreksi Material (Perubahan Makna / Risiko / Lingkup)`** → ubah teks menjadi `Menyelesaikan optimasi konfigurasi code-splitting Vite untuk menurunkan penggunaan memori build frontend`, ubah risiko ke **`GREEN`**, isi alasan: `Setelah kapasitas runner dinaikkan, fokus dialihkan ke optimasi code-splitting Vite` → klik **`Kirim Permohonan Koreksi`** (`PENDING`).
- **Bilang singkat:** *"Salah ketik minor langsung otomatis berlaku tanpa mengganggu atasan. Tapi kalau mengubah target atau risiko, wajib lewat review atasan dulu."*

#### `4B [INTI]` Tolak, Revisi Cepat, & Setujui di `Review Koreksi` `[Jendela 3 — Arif ↔ Jendela 2 — Aditya]`
- **Aksi:**
  1. Di **`Jendela 3 — Arif`** (`/corrections/review`): tunjuk perbandingan **`Sebelum` vs `Diajukan`**, klik **`Tolak`**, isi alasan wajib: `Mohon cantumkan nomor tiket issue optimasi Vite agar mudah dilacak tim QA` → **`Konfirmasi Tolak`**.
  2. **`⚡` Di `Jendela 2 — Aditya`** (`/corrections/morning`): pada baris `Ditolak`, klik **`Gunakan Draf Sebelumnya & Sesuaikan`** → tambahkan `[#245]` pada teks (`Menyelesaikan optimasi konfigurasi code-splitting Vite [#245] untuk menurunkan penggunaan memori build frontend`), isi alasan: `Menambahkan referensi tiket [#245] sesuai catatan Head Engineering` → kirim.
  3. **Balik ke `Jendela 3 — Arif`**: klik **`Setujui`**, isi catatan: `Disetujui, referensi tiket [#245] sudah lengkap` → **`Konfirmasi Setujui`**.
- **Bilang singkat:** *"Kalau koreksi ditolak karena kurang detail, karyawan tinggal klik satu tombol untuk revisi dari ketikan terakhir tanpa ketik ulang dari nol."*

#### `4C [CABANG]` Cek Tab `Koreksi Evaluasi Sore` `[Jendela 2 — Aditya]`
- **Aksi:** Klik sebentar menu **`Koreksi Evaluasi Sore`** (`/corrections/eod`) untuk nunjukin jendela sanggahan EOD (48 jam kerja) tersedia terpisah.

---

### BABAK 5 — Pencatatan Cuti Resmi (`/admin/leaves`) & Dispensasi (`/exemptions`) + Pembebasan Otomatis (`DEC-018`)
> **Estimasi:** 5 menit · **Prasyarat:** `Oivi Deasepta` (`staff.finance@dutamedia.com`) tidak punya cuti/dispensasi Hari Ini · **Dampak:** Di akhir babak cuti & dispensasi uji pada `Oivi` dihapus lagi supaya data bersih.

#### `5A [INTI]` Cek Daftar Cuti Resmi + Guardrails + Catat Cuti Sakit Live `[Jendela 4 — Dewi Lestari (HRGA)]`
- **Aksi:**
  1. Buka menu **`Pencatatan Cuti Resmi`** (`/admin/leaves`): tunjuk semua data langsung berstatus resmi (`APPROVED`), termasuk **`Raka Pratama` (`Izin Resmi`)** dan **`Achmad`**.
  2. **`[CABANG]` Uji 3 Pagar Pengaman (tanpa merusak data):**
     - Pilih karyawan mana saja, isi Tanggal Selesai lebih awal dari Tanggal Mulai → ditolak.
     - Pilih **`Achmad Noer Wahid`**, isi tanggal **Hari Ini**, alasan `Tes bentrok` → klik **`Daftarkan Cuti Resmi`** → ditolak **`409`** (bentrok dengan cuti aktif Achmad).
     - Pilih **`Raka Pratama` (`Intern`)**, jenis **`Cuti Tahunan`**, tanggal **H+10**, alasan `Tes hak cuti magang` → klik **`Daftarkan Cuti Resmi`** → ditolak **`400`** (karyawan magang tidak berhak Cuti Tahunan).
  3. **`[INTI]` Catat Cuti Sakit Hari Ini untuk Oivi:**
     - **Karyawan \*:** **`Oivi Deasepta (staff.finance@dutamedia.com)`**
     - **Tanggal Mulai & Selesai \*:** **Hari Ini**
     - **Jenis \*:** **`Sakit`**
     - **Keterangan Resmi \*:** `Surat keterangan sakit dari klinik (sudah disetujui HRGA)`
     - Klik **`Daftarkan Cuti Resmi`**.
- **⚡ Efek Lintas Jendela (`Jendela 5`):** Login **`staff.finance@dutamedia.com`** (**Oivi**): buka `/daily/morning`, `/daily/additional-work`, `/daily/eod` → semua **otomatis terkunci** menampilkan **`Masa Cuti Resmi (Sakit)`** tanpa perlu pilih `0 komitmen`! Buka **`Riwayat Saya`** (`/daily/history`) → muncul di panel **read-only** `Riwayat Cuti & Dispensasi Resmi Tercatat`, plus notifikasi masuk.
- **Bilang singkat:** *"Persetujuan cuti cukup di luar sistem. Begitu HRGA input yang sudah ACC di sini, akun karyawan langsung otomatis dikunci dari tagihan laporan harian dan mereka tinggal lihat arsipnya di Riwayat Saya."*

#### `5B [INTI]` Uji `Edit` & `Hapus` Cuti Resmi `[Jendela 4 — HRGA ↔ Jendela 5 — Oivi]`
- **Aksi:**
  1. Di **`Jendela 4` (`/admin/leaves`)**: pada baris **`Oivi Deasepta`**, klik **`Edit`** → tambah kata ` (revisi HRGA)` di keterangan → klik **`Simpan Perubahan Cuti`**.
  2. Klik **`Hapus`** pada baris `Oivi Deasepta` → di modal `Hapus Catatan Cuti Resmi?` klik **`Ya, Hapus Catatan`**.
- **⚡ Efek Lintas Jendela:** Di **`Jendela 5 — Oivi` (`/daily/morning`)**, tekan **`F5`** → form pagi langsung **terbuka kembali** normal!
- **Bilang singkat:** *"Kalau ada salah tanggal atau batal cuti, tinggal edit atau hapus di sini dan jadwal kerja normal karyawan langsung aktif lagi."*

#### `5C [INTI]` Manajemen Dispensasi (`/exemptions`): Tambah, Pembebasan Otomatis, `Edit`, & `Hapus` `[Jendela 4 — HRGA ↔ Jendela 5 — Oivi]`
- **Aksi:**
  1. Buka **`Manajemen Dispensasi`** (`/exemptions`): tunjuk di tabel kanan sudah ada **`Hari Wibowo` (`Dinas Luar`, `ST/HRGA/2026/XI/104`)**.
  2. Isi form kiri untuk **`Oivi Deasepta`**:
     - **Tanggal Mulai & Selesai \*:** **Hari Ini**
     - **Kategori \*:** **`Dinas Luar (Penugasan Luar Kantor / Klien)`**
     - **No. Surat Tugas:** `ST/HRGA/2026/XI/112`
     - **Alasan \*:** `Pendampingan audit faktur dan rekonsiliasi pajak di kantor klien Surabaya`
     - Klik **`Daftarkan Dispensasi`**.
  3. **⚡** Refresh **`Jendela 5 — Oivi` (`/daily/morning`)** → form harian langsung terkunci dengan spanduk **`Masa Dispensasi Resmi (Dinas Luar)`** & muncul read-only di `/daily/history`.
  4. Balik ke **`Jendela 4 — HRGA`**: pada baris `Oivi`, klik **`Edit`** → ubah nomor referensi menjadi `ST/HRGA/2026/XI/112-REV` → **`Simpan Perubahan Dispensasi`**, lalu klik **`Hapus`** → **`Ya, Hapus Dispensasi`**. (Refresh Oivi kembali normal, lalu **`Keluar`** di `Jendela 5`).
- **Bilang singkat:** *"Sama seperti cuti, dispensasi dinas luar atau training bisa langsung ditambah, diubah, atau dihapus oleh HRGA, dan langsung membebaskan check-in harian karyawan."*

---

### BABAK 6 — Pengawasan Kepatuhan HRGA (`/compliance`) & Coaching (`/coaching`)
> **Estimasi:** 4 menit · **Prasyarat:** `Siti Rahma` (`OPEN`) & `Nadia` (`ADDRESSED`) di `/compliance`; `Aditya` di `/coaching` · **Dampak:** `Siti Rahma` selesai ditindaklanjuti, catatan coaching baru tersimpan.

#### `6A [INTI]` Antrean Kepatuhan HRGA `[Jendela 4 — Dewi Lestari (HRGA)]`
- **Aksi:**
  1. Buka **`Antrean Kepatuhan`** (`/compliance`).
  2. Pada baris **`Siti Rahma`** (`Belum Ditangani` · `Pola Terlambat 3x`), klik **`Tindak Lanjut`**.
     - `[CABANG]` Ketik 2 huruf `ok` → tombol simpan tetap nonaktif (wajib min. 5 karakter).
     - Isi catatan: `Sudah dilakukan sesi pengingat disiplin pelaporan pagi bersama Head of Engineering dan disepakati pengaktifan alarm browser pukul 08:00 WIB` → klik **`Simpan Tindak Lanjut`**.
  3. Pada baris **`Nadia Kusuma`** (`Sudah Ditangani`), klik **`Ubah Catatan`**, tambah ` dan tidak berulang kembali.` di akhir kalimat → **`Simpan Tindak Lanjut`**.
- **Bilang singkat:** *"Karyawan yang telat atau absen lapor 3x berturut-turut otomatis naik ke antrean HRGA untuk dibina, sekaligus bisa dicatat tindak lanjutnya."*

#### `6B [INTI]` Catatan Coaching (`Dibagikan` vs `Rahasia Manajemen`) `[Jendela 3 — Arif Budiman]`
- **Aksi:**
  1. Buka **`Catatan Coaching`** (`/coaching`), klik kartu **`Aditya Nugroho`**. Tunjuk panel kanan sudah ada 2 catatan: **`Dibagikan ke Karyawan`** dan **`Rahasia Manajemen`**.
  2. Di panel kiri: pilih **`Aditya Nugroho`**, jenis **`Bimbingan`**, visibilitas **`Dibagikan ke Karyawan`**, lalu klik tombol template cepat **`Bimbingan 1-on-1`** → klik **`Simpan Catatan Coaching`**.
- **Bilang singkat:** *"HRGA pegang catatan kepatuhan di /compliance, sedangkan atasan langsung pegang catatan bimbingan 1-on-1 di /coaching — dan yang bertanda Rahasia Manajemen 100% nggak bakal bocor ke akun staf."*

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
  1. **`Jendela 3 — Arif`** (`/dashboard`): cakupan terkunci **`Divisi Saya`** (`Engineering`), tidak bisa lihat divisi lain.
  2. **`Jendela 1 — Direktur`** (`/dashboard`): cakupan **`Seluruh Perusahaan`** (26 personil termasuk `Budi`), coba filter **`Status Karyawan`** ke **`Intern`** (hanya tampil `Raka Pratama` & `Nisa Amelia`) → kembalikan ke **`Semua Status Karyawan`**.

#### `7C [INTI]` Radar Risiko Proyek `[Jendela 3 — Arif di /projects/risk]`
- **Aksi:** Ketik `Engineering` di pencarian → klik **`Rincian`** pada **`WP-CORE`** → tunjukkan skor kesehatan & sorotan kendala `CRITICAL` lewat batas waktu + tombol **`Buka Antrean Blocker Terkait`**.

#### `7D [INTI]` Laporan Eksekutif, Filter `Kontrak`, CSV & PDF `[Jendela 1 — Direktur di /reports]`
- **Aksi:** Klik preset `Hari Ini` → `Pekan Ini` → `Bulan Ini` → `Kuartal Ini`. `[CABANG]` Pilih filter status **`Kontrak`** (tampil pesan kosong ramah *"Belum ada data karyawan untuk status karyawan yang dipilih"*), kembalikan ke **`Semua`**. Klik **`Unduh Laporan (CSV)`** dan tunjukkan tombol **`Cetak / PDF`**.

---

### BABAK 8 — Tata Kelola Admin Lengkap (`Users`, `Organization`, `Temporary Reviewer`, `Policy Owners`, & `Channels`)
> **Estimasi:** 6 menit · **Prasyarat:** `Rian` tidak punya delegasi aktif · **Dampak:** Semua aksi uji di-restore / dibatalkan bersih di akhir babak.

#### `8A [CABANG]` Nonaktifkan & Aktifkan Akun `[Jendela 4 — HRGA di /admin/users]`
- **Aksi:** Pada baris **`Budi Santoso`**, klik **`Nonaktifkan`** → konfirmasi (status `Nonaktif`, sesi otomatis putus) → klik **`Aktifkan`** lagi → konfirmasi. Tunjuk baris **`Dewi Lestari`** bertanda **`Akun Anda`** (tidak bisa menonaktifkan diri sendiri).

#### `8B [INTI]` Struktur Organisasi 2 Tab, Anti-Siklus `422`, Angkat `Intern`, & `Project Authority` `[Jendela 4 — HRGA di /admin/organization]`
- **Aksi:**
  1. **Tab 1 (`Struktur & Penugasan Karyawan`):** Klik **`Atur Penugasan Baru`**:
     - Buka dropdown **`Atasan Langsung`** → tunjuk **`Raka Pratama` & `Nisa Amelia` (`Intern`) 0x muncul**.
     - `[CABANG]` Uji anti-siklus `422`: pilih Karyawan **`Arif Budiman`**, pilih Atasan Langsung **`Aditya Nugroho`** (bawahannya), alasan `Uji validasi siklus hierarki` → simpan → **ditolak `422`**.
     - Pratinjau angkat `Intern`: pilih `Raka Pratama`, ubah status ke `Karyawan Tetap` → jelaskan kuota & hak jabatan langsung terbuka tanpa merusak riwayat magang → klik **`Batal`**.
  2. **Tab 2 (`Kewenangan Proyek`):** Klik **`Tetapkan Wewenang Proyek`** → tunjuk `Intern` 0x di PM/Reviewer → `[CABANG]` pilih `WP-CORE` dengan PM = `Arif Budiman` & Reviewer = `Arif Budiman` → ditolak (`orang tidak boleh sama`) → klik **`Batal`**. Klik **`Tutup Wewenang`** sebentar untuk tunjuk modal konfirmasi → klik **`Batal`**.

#### `8C [INTI]` Delegasi Reviewer Sementara + Bukti Login Nyata `[Jendela 4 — HRGA ↔ Jendela 5 — Rian Kurniawan]`
- **Aksi:**
  1. Di **`Jendela 4 — HRGA` (`/admin/temporary-reviewers`)**: klik **`Delegasikan Reviewer Baru`**:
     - **Pejabat yang Berhalangan \*:** `Gunawan Setiawan` *(divisi `Operations & Infrastructure` terisi otomatis)*
     - **Pejabat Pengganti \*:** `Rian Kurniawan` *(tunjuk `Sistem Administrator` & akun `Intern` 0x muncul di list!)*
     - **Tanggal Mulai:** Hari Ini · **Tanggal Selesai:** Besok
     - **Alasan \*:** `Pelimpahan wewenang review koreksi dan eskalasi kendala selama Head of Ops & Infra audit luar kota`
     - Klik **`Terbitkan Delegasi`** (status `Aktif`).
  2. **⚡ Efek Lintas Jendela (`Jendela 5`):** Login **`lead.creative@dutamedia.com`** (**Rian Kurniawan**).
     - *Lihat di layar:* Meski perannya `SUPERVISOR`, di sidebar langsung terbuka menu **`Review Koreksi`** (`/corrections/review`), **`Antrean Blocker`**, dan **`Penuaan & Eskalasi`** *(tanpa menu Persetujuan Cuti)*! Setelah itu klik **`Keluar`**.
  3. Balik ke **`Jendela 4 — HRGA`**: klik **`Cabut`** pada delegasi Rian → isi alasan: `Head of Ops & Infra sudah menyelesaikan audit dan kembali bertugas` → **`Cabut Delegasi`**.

#### `8D [CABANG]` Pemilik Kebijakan Multi-Owner `[Jendela 1 — Direktur vs Jendela 4 — HRGA di /admin/policies]`
- **Aksi:** Di **`Jendela 1`** tunjuk seksi **`Penugasan Pemilik Kebijakan`** (bisa *Tetapkan/Ubah/Cabut*, dan menolak pencabutan pemilik terakhir) + tombol **`Unduh Audit CSV`**. Di **`Jendela 4`** tunjuk HRGA hanya bisa mengubah kategori miliknya dan tabel pemilik berstatus **`Hanya Lihat (Direktur/Admin)`**.

#### `8E [INTI]` Saluran Notifikasi & Uji Kirim `[Jendela 1 — Direktur di /admin/notifications]`
- **Aksi:** Tunjuk 3 kartu status saluran (**`In-App: Aktif`**, **`Email & Browser Push: Mode Simulasi Aktif`** — jujur tanpa memalsukan status kirim luar) & **`Matriks Routing 9 Trigger`**. Di panel uji coba, pilih kanal `Pusat Notifikasi In-App`, event `BLOCKER_RAISED`, penerima `dev.frontend@dutamedia.com` → klik **`Kirim Notifikasi Uji Coba`** → muncul di **`Log Pengiriman Uji Coba Terbaru`**.

---

### BABAK 9 — Penutupan: Kembalikan Jam Cut-Off Standar (`09:00 / 09:30 WIB`)
> **Estimasi:** 1 menit · **Jendela 1 — Hendra Wijaya (Direktur)**

- **Aksi:** Di **`Kebijakan & Cut-off`** (`/admin/policies`), klik **`+ Buat Versi Kebijakan Baru`**:
  - **Batas Tepat Waktu Pagi \*:** `09:00` · **Cut-Off Pagi \*:** `09:30`
  - **Batas Tepat Waktu Sore \*:** `17:00` · **Cut-Off Sore \*:** `21:00`
  - **Tanggal Mulai Berlaku \*:** *(hari ini WIB)*
  - **Alasan Perubahan Kebijakan \*:**
    ```text
    Mengembalikan jam batas pengisian komitmen pagi ke jadwal standar perusahaan setelah demonstrasi selesai
    ```
  - Klik **`Simpan & Terapkan Versi Baru`**, lalu tunjuk baris teratas di **Jejak Audit Perubahan Kebijakan**.

---

## 5. PANDUAN DARURAT SALAH KLIK (QUICK RECOVERY)

| Kejadian Salah Klik Saat Demo | Solusi Cepat 10 Detik (Jangan Panik) |
|---|---|
| Terlanjur klik `Kirim Morning Commitment` sebelum tunjuk validasi/draf pada **Dio** | Pakai akun cadangan **`product@dutamedia.com`? Sudah habis** → kalau masih butuh tes validasi form pagi kosong, langsung pakai **`Raka`** (sebelum Babak 3A) atau **`staff.finance@dutamedia.com` (Oivi)**! |
| Salah input saat bikin Cuti/Dispensasi di **Babak 5** | Tinggal klik tombol **`Edit`** atau **`Hapus`** langsung di baris tabel `/admin/leaves` atau `/exemptions`. |
| Lupa salin **Token Aktivasi 64 karakter** Budi di **Babak 1A** | Di tabel `/admin/users` baris Budi klik **`Kirim Ulang`** → **`Terbitkan Tautan Baru`** → salin lagi. |
| Lupa cabut **Reviewer Sementara** Rian | Tinggal klik **`Cabut`** di `/admin/temporary-reviewers` — aksesnya langsung tertutup detik itu juga. |
| Salah ketik nama/alur di tengah presentasi | Bilang santai: *"Ini sekaligus membuktikan validasi/audit sistem bekerja,"* lalu gunakan fitur `Edit`, `Hapus`, atau akun cadangan di Incognito. |

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
