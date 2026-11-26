# SKRIP DEMO LIVE WORKPULSE — MULTI-JENDELA (100% SEMUA ALUR & KONDISI)

**Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Password Semua Akun Uji:** `Password123!`  
**Zona Waktu:** WIB (`Asia/Jakarta`)

> **Panduan Membaca Skrip Ini Saat Presentasi:**
> - **Satu baris = satu aksi klik atau satu kolom input** (tidak ada lagi instruksi yang menumpuk panjang dalam satu paragraf).
> - **`🪟 Jendela & Akun`** di awal setiap langkah menunjukkan jendela Chrome mana yang dipakai dan apakah perlu ganti akun atau tidak.
> - **`🎯 Sampaikan di Awal`** adalah kalimat singkat (2–3 kalimat) untuk menjelaskan alasan aturan sistem kepada audiens sebelum mulai mengklik.
> - **`[INTI]`** = alur utama demo (±30–35 menit). Tetap nyambung 100% dari awal sampai akhir meskipun seluruh langkah **`[CABANG]`** dilewati.
> - **`[CABANG]`** = uji validasi penolakan sistem & kasus tambahan (semua ditaruh sebelum tombol kirim utama atau memakai akun terpisah, sehingga **100% aman jalan lurus dari Babak 1 sampai Babak 9 tanpa reset database di tengah demo**).

---

## 1. PETA 5 JENDELA CHROME (MAKSIMAL 5 BERSAMAAN)

Buka maksimal **5 jendela Chrome** (4 profil Chrome biasa + 1 jendela Incognito) agar hampir tidak perlu keluar-masuk akun selama presentasi:

| Jendela | Akun Login Awal (`Password123!`) | Halaman Awal | Ringkasan Perpindahan Akun Sepanjang Demo |
|---|---|---|---|
| **Jendela 1** | `direktur@dutamedia.com`<br>**Hendra Wijaya** (`CEO_MANAGEMENT`) | `/admin/policies` | **0x ganti akun** (Tetap Hendra di Babak `2A`, `7A`, `7B`, `7D`, `8D`, `8E`, `9`) |
| **Jendela 2** | `product@dutamedia.com`<br>**Bagas Saputra** (`PROJECT_MANAGER`) | `/daily/morning` | • **Babak `2A`–`2E`:** tetap **Bagas Saputra**<br>• **Babak `3B`:** ganti ke **Reza Mahendra** (`network.infra@dutamedia.com`)<br>• **Babak `3C`–`7A`:** ganti ke **Aditya Nugroho** (`dev.frontend@dutamedia.com`) |
| **Jendela 3** | `head.eng@dutamedia.com`<br>**Arif Budiman** (`HEAD` Engineering) | `/dashboard` | **0x ganti akun** (Tetap Arif di Babak `3C`, `3E`, `4B`, `6B`, `7B`, `7C`) |
| **Jendela 4** | `hrga@dutamedia.com`<br>**Dewi Lestari** (`HRGA`) | `/admin/users` | **0x ganti akun** (Tetap Dewi di Babak `1A`, `3A`, `5A`–`5C`, `6A`, `8A`–`8D`) |
| **Jendela 5 (Incognito)** | Belum login (`/login`)<br>*(Akun tamu/cabang, keluar sesi tiap selesai)* | `/login` | • **Babak `1A`–`1B`:** **Budi Santoso** (`budi.santoso@dutamedia.com`)<br>• **Babak `2F`:** **Nadia Kusuma** (`qa@dutamedia.com`)<br>• **Babak `2G`:** **Gilang Ramadhan** (`specialist.it@dutamedia.com`)<br>• **Babak `3A`–`3B`:** **Raka Pratama** (`intern.frontend@dutamedia.com`)<br>• **Babak `5A`–`5C`:** **Intan Permata** (`staff.finance@dutamedia.com`)<br>• **Babak `8C`:** **Rian Kurniawan** (`lead.creative@dutamedia.com`) |

### Jadwal Ganti Akun Sepanjang Demo (`Jendela 1, 3, 4 = Tidak Pernah Ganti Akun`)

| Urutan Waktu | Jendela yang Diganti | Dari Akun | Login ke Akun Baru (`Password123!`) | Dipakai Sampai |
|---|---|---|---|---|
| **Sebelum Mulai** | **Jendela 1 – 4** | — | Login **Hendra** (J1), **Bagas** (J2), **Arif** (J3), **Dewi** (J4) | J1, J3, J4 tetap sampai Babak 9 |
| **Babak `1A`–`1B`** | **Jendela 5** | Belum login | Aktivasi & login `budi.santoso@dutamedia.com` (**Budi**) | Akhir `1B` → klik **Keluar Sesi** |
| **Babak `2F`** | **Jendela 5** | Belum login | Login `qa@dutamedia.com` (**Nadia**) | Akhir `2F` → klik **Keluar Sesi** |
| **Babak `2G`** | **Jendela 5** | Belum login | Login `specialist.it@dutamedia.com` (**Gilang**) | Akhir `2G` → klik **Keluar Sesi** |
| **Babak `3A`** | **Jendela 5** | Belum login | Login `intern.frontend@dutamedia.com` (**Raka**) | Tetap login sampai akhir `3B` → **Keluar Sesi** |
| **Babak `3B`** | **Jendela 2** | **Bagas Saputra** | Keluar Bagas → Login `network.infra@dutamedia.com` (**Reza**) | Hanya selama Babak `3B` |
| **Babak `3C`** | **Jendela 2** | **Reza Mahendra** | Keluar Reza → Login `dev.frontend@dutamedia.com` (**Aditya**) | Tetap login sampai Babak `7A` |
| **Babak `5A`–`5C`** | **Jendela 5** | Belum login | Login `staff.finance@dutamedia.com` (**Intan**) | Tetap login sampai akhir `5C` → **Keluar Sesi** |
| **Babak `8C`** | **Jendela 5** | Belum login | Login `lead.creative@dutamedia.com` (**Rian**) | Akhir `8C` → klik **Keluar Sesi** |

---

## 2. CHECKLIST 2 MENIT SEBELUM MULAI DEMO

- [ ] Pastikan database baru saja di-seed bersih (`node backend/scripts/reset_live_seed.cjs`).
- [ ] Buka **Jendela 1 sampai Jendela 4** dan login sesuai tabel di atas.
- [ ] Buka **Jendela 5 (Incognito)** di halaman `/login` (biarkan belum login).
- [ ] Di **Jendela 2 (`Bagas Saputra` — `/daily/morning`)**, jika masih ada sisa ketikan draf di browser dari latihan sebelumnya, klik tombol **`Reset Draf`**.
- [ ] Nyalakan *Do Not Disturb* / *Focus Assist* di laptop sebelum mulai *share screen*.

---

## 3. RINGKASAN ALUR 9 BABAK DEMO

| Babak | Fokus Utama yang Ditunjukkan |
|---|---|
| **Babak 1** | HRGA mengundang karyawan baru (`Budi Santoso`), mencabut token pertama hingga hangus, menerbitkan token baru, membuktikan login ditolak sebelum aktivasi, lalu aktivasi mandiri & cek halaman Profil. |
| **Babak 2** | Pengaturan jam Cut-Off oleh Direktur (`Hendra`), lalu **1 siklus harian penuh tanpa putus** di akun `Bagas Saputra` (Komitmen Pagi → Pekerjaan Tambahan Siang → Evaluasi Sore dengan saran status `RED` vs pilihan `AMBER` → Riwayat Saya), diikuti contoh `0 Komitmen` (`Nadia`) dan contoh karyawan sedang Cuti Resmi (`Gilang`). |
| **Babak 3** | Karyawan magang (`Raka`) melapor komitmen `RED` lewat tombol jalan pintas buat tiket blocker, bukti aturan cuti vertikal (`Gilang` cuti → otomatis naik ke atasannya `Gunawan` & tolak pilih manual `Gilang`), penanganan tiket oleh staf spesialis (`Reza`), bantuan lintas fungsi & Terima Risiko oleh Kepala Divisi (`Arif`), edit divisi tujuan & hapus tiket aktif (`Aditya`), serta Radar Penuaan & Eskalasi. |
| **Babak 4** | Karyawan (`Aditya`) mengajukan Koreksi Komitmen Pagi: Perubahan Minor (langsung diterapkan otomatis) dan Perubahan Material (ditolak dulu oleh Kepala Divisi `Arif`, direvisi cepat dari draf sebelumnya, lalu disetujui). |
| **Babak 5** | HRGA (`Dewi`) mencatat Cuti Resmi (uji tolak akhir pekan, bentrok jadwal, & cuti tahunan magang; catat cuti sakit `Intan`, edit, lalu hapus) serta mencatat Dispensasi Dinas Luar & Pengecualian Permanen (menu harian `Intan` disembunyikan sementara `Lapor Blocker` tetap aktif, lalu dihapus hingga menu harian aktif kembali). |
| **Babak 6** | HRGA (`Dewi`) mencatat tindak lanjut pola keterlambatan di Antrean Kepatuhan, dan Kepala Divisi (`Arif`) mencatat bimbingan 1-on-1 di Catatan Coaching (`Dibagikan ke Karyawan` vs `Rahasia Manajemen`). |
| **Babak 7** | Bukti keamanan Pusat Notifikasi (catatan rahasia tidak muncul di staf & tombol halaman admin disembunyikan otomatis), perbandingan Dashboard Kepala Divisi vs Direktur, Radar Risiko Proyek, dan Laporan Eksekutif (CSV/PDF). |
| **Babak 8** | Pengelolaan akun pengguna (nonaktifkan & aktifkan kembali), Struktur Organisasi (tolak atasan melingkar & angkat anak magang), Kewenangan Proyek (tolak PM merangkap Reviewer), Delegasi Reviewer Sementara (`Rian`), Pemilik Kebijakan, dan Uji Kirim Notifikasi. |
| **Babak 9** | Direktur mengembalikan jam batas pengisian (Cut-Off) ke jadwal standar kantor (`09:00` / `09:30` & `17:00` / `21:00`) dan menunjukkan rekaman jejak auditnya. |

---

## 4. SKRIP LENGKAP 9 BABAK DEMO LIVE

---

### BABAK 1 — Pendaftaran Karyawan Baru, Uji Cabut & Kirim Ulang Token, serta Aktivasi Akun

---

#### `1A [INTI]` HRGA Menerbitkan Undangan 72 Jam & Membuktikan Pencabutan Token Secara Langsung

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (Incognito)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"WorkPulse adalah sistem internal perusahaan, jadi sengaja tidak ada tombol daftar akun bebas dari luar, dan Admin atau HRGA pun tidak pernah membuatkan password untuk karyawan. Aksesnya hanya lewat undangan resmi berupa token 64 karakter sekali pakai yang berlaku 72 jam — kalau salah kirim atau bocor, token lama bisa langsung dicabut sehingga hangus dan diterbitkan ulang."*

- **🖱️ Langkah Klik & Input:**

  1. **Buat Undangan Baru di `Jendela 4 — Dewi (HRGA)` (`/admin/users`):**
     - Klik tombol **`Undang Pengguna Baru`** di kanan atas.
     - Isi seluruh kolom pada modal **`Undang Pengguna Baru`** dari atas ke bawah:
       - **Nama Lengkap \*:**
         ```text
         Budi Santoso
         ```
       - **Alamat Email Perusahaan \*:**
         ```text
         budi.santoso@dutamedia.com
         ```
       - **Status Karyawan:** Pilih **`Karyawan Tetap`**
       - **Peran Awal (Role):** Pilih **`Karyawan`**
       - **Fungsi / Divisi:** Pilih **`Engineering`**
       - **Nama Jabatan (Job Title) \*:**
         ```text
         Backend Engineer
         ```
     - Klik tombol **`Terbitkan Undangan (72 Jam)`**.
     - Setelah kode token 64 karakter muncul, klik tombol **`Salin Token Aktivasi`**, lalu klik **`Selesai`**.

  2. **⚡ Buktikan Token Pertama Aktif di `Jendela 5 (Incognito)`:**
     - Pada halaman `/login`, klik tab **`Aktivasi Akun`** (`/activate`).
     - Tempel (*Paste*) token tadi ke kolom **Token Aktivasi**.
     - **👀 Tunjukkan di layar:** Muncul kartu pratinjau **`Budi Santoso · Engineering`** dengan lencana hijau **`UNDANGAN AKTIF`**.
     - *(**PENTING:** Jangan klik `Aktifkan Akun Saya` dulu — kita akan mencabut token pertama ini dari HRGA).*

  3. **Cabut Token Pertama dari `Jendela 4 — Dewi (HRGA)` (`/admin/users`):**
     - Pada baris **`Budi Santoso`**, klik tombol **`Cabut`**.
     - Di jendela konfirmasi **`Cabut Undangan Aktivasi`**, klik tombol **`Ya, Cabut Undangan`**.
     - **👀 Tunjukkan di layar:** Status baris Budi Santoso berubah menjadi merah **`Dicabut`**.
     - *(Opsional: klik sebentar menu **`Undangan Karyawan`** `/admin/invitations` di sidebar kiri untuk menunjukkan tabel riwayat undangan, lalu kembali ke menu **`Pengguna & Peran`** `/admin/users`).*

  4. **⚡ Buktikan Token Pertama Sudah Hangus di `Jendela 5 (/activate)`:**
     - Tekan **`F5`** (refresh halaman `/activate`).
     - Tempel (*Paste*) kembali **token pertama** yang masih ada di clipboard ke kolom **Token Aktivasi**.
     - **👀 Tunjukkan di layar:** Langsung muncul kotak peringatan merah **`Undangan Tidak Berlaku`** — bukti token yang sudah dicabut HRGA otomatis mati.

  5. **Terbitkan Ulang Token Baru dari `Jendela 4 — Dewi (HRGA)` (`/admin/users`):**
     - Pada baris **`Budi Santoso`**, klik tombol **`Kirim Ulang`**.
     - Di jendela **`Kirim Ulang Undangan Aktivasi`**, klik tombol **`Terbitkan Tautan Baru`**.
     - Klik tombol **`Salin Token Aktivasi`** *(token baru ini yang akan dipakai di langkah `1B`)*, lalu klik **`Selesai`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Begitu diterbitkan ulang, token lama tetap hangus dan hanya token terbaru yang bisa dipakai."*

---

#### `1B [INTI]` Membuktikan Token Baru Aktif, Login Ditolak Sebelum Aktivasi, Aktivasi Akun, & Cek Profil

- **🪟 Jendela Aktif:** **Jendela 5 (Incognito)**
- **🔄 Perpindahan Akun:**
  - **Login Baru di Jendela 5:** Aktivasi lalu login `budi.santoso@dutamedia.com` (`Password123!`)
  - **🚪 Di Akhir Langkah `1B`:** Klik **`Keluar Sesi`** di **Jendela 5**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Sekarang kita buktikan token barunya aktif, tapi selama karyawan belum menyelesaikan aktivasi dan membuat sandi pribadi, akunnya tetap ditolak saat mencoba masuk. Selain itu, kita sengaja tidak menyediakan fitur 'Lupa Kata Sandi' mandiri via email — pemulihan akun tetap dikendalikan lewat HRGA atau System Admin supaya keamanannya terjaga dan tidak bergantung ke server email luar."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 5 — Incognito`):**

  1. **Cek Token Baru Aktif di Tab `Aktivasi Akun` (`/activate`):**
     - Tempel (*Paste*) **token baru** dari HRGA ke kolom **Token Aktivasi**.
     - **👀 Tunjukkan di layar:** Kartu **`Budi Santoso · Engineering`** kembali muncul dengan lencana hijau **`UNDANGAN AKTIF`**.
     - *(Jangan klik `Aktifkan Akun Saya` dulu — biarkan token baru masih tersimpan di clipboard).*

  2. **Buktikan Login Ditolak Sebelum Aktivasi di Tab `Masuk Sistem` (`/login`):**
     - Klik tab **`Masuk Sistem`** (`/login`).
     - Isi seluruh kolom login:
       - **Email Perusahaan:**
         ```text
         budi.santoso@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```
     - Klik tombol **`Masuk ke Sistem`**.
     - **👀 Tunjukkan di layar:** Muncul penolakan merah **`"Akun Anda belum diaktifkan..."`**.
     - Tunjuk sekilas ikon mata (*Tampilkan/Sembunyikan sandi*), kotak centang **`Ingat email di perangkat ini`**, dan keterangan hubungi HRGA bila lupa kata sandi.

  3. **Selesaikan Aktivasi Akun di Tab `Aktivasi Akun` (`/activate`):**
     - Klik kembali tab **`Aktivasi Akun`** (`/activate`).
     - Isi seluruh kolom dari atas ke bawah:
       - **Token Aktivasi:** Tempel (*Paste*) lagi **token baru** dari clipboard (muncul **`UNDANGAN AKTIF`**).
       - **Kata Sandi Baru:**
         ```text
         Password123!
         ```
         *(Tunjuk 3 syarat kata sandi centang hijau dan indikator kekuatan sandi **`Sangat Kuat`**).*
       - **Konfirmasi Kata Sandi Baru:**
         ```text
         Password123!
         ```
     - Klik tombol **`Aktifkan Akun Saya`**.
     - **👀 Tunjukkan di layar:** Muncul tampilan hijau **`Aktivasi Berhasil!`**.

  4. **Login Pertama Kali sebagai Budi Santoso:**
     - Klik tombol **`Lanjut ke Halaman Masuk`**.
     - Isi kolom login:
       - **Email Perusahaan:**
         ```text
         budi.santoso@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```
     - Klik tombol **`Masuk ke Sistem`**.
     - **👀 Tunjukkan di layar:** Berhasil masuk dan otomatis diarahkan ke halaman `/daily/morning`.

  5. **Tinjau Halaman Profil & Keamanan Akun (`/profile`), Lalu Keluar Sesi:**
     - Klik bulatan inisial **`BS`** di pojok kanan atas untuk membuka halaman **`Profil & Keamanan Akun`** (`/profile`).
     - Tunjukkan **Panel 1 (`Kartu Identitas & Penugasan Aktif`)**.
     - Di **Panel 2 (`Keamanan Akun & Ganti Kata Sandi`)**, ketik contoh `DutamediaBaru2026!` pada kolom **Kata Sandi Baru** hanya untuk menunjukkan 3 syarat centang hijau & kotak centang **`Akhiri seluruh sesi aktif di perangkat lain`** *(**JANGAN** klik `Simpan Kata Sandi Baru` agar sandi tetap `Password123!`)*.
     - Tunjukkan **Panel 3 (`Ringkasan Kanal Notifikasi Perangkat Ini`)**.
     - Klik tombol **`Keluar Sesi`** di pojok kanan atas **Jendela 5**.

- **💬 Kalimat Penutup Singkat:**  
  *"Setelah aktivasi mandiri dan membuat kata sandi pribadi, barulah karyawan bisa masuk ke ruang kerjanya."*

> **💬 Catatan Tambahan untuk Disampaikan Lisan (Pengecualian Admin & Direktur — Tidak Perlu Diuji Klik):**  
> *"Khusus akun **System Admin** dan **Direktur**, seluruh menu `Workspace` harian sengaja dihilangkan dari sidebar karena keduanya bukan peserta wajib lapor komitmen harian — supaya metrik kepatuhan murni mengukur tim operasional, sedangkan notifikasinya tetap diakses lewat ikon lonceng di pojok kanan atas."*

---

### BABAK 2 — Pengaturan Jam Cut-Off & Siklus Laporan Kerja Harian Lengkap

> **Alur Babak 2:** Agar tidak lompat-lompat jendela, di babak ini kita selesaikan dulu **1 siklus kerja harian penuh milik `Bagas Saputra` di Jendela 2** (`2A` sampai `2E`), baru ditutup dengan 2 contoh kondisi khusus di **Jendela 5** yaitu **`Nadia Kusuma` (`0 Komitmen` — `2F`)** dan **`Gilang Ramadhan` (`Cuti Resmi Hari Ini` — `2G`)** yang langsung menyambung ke Babak 3.

---

#### `2A [INTI]` Form Pagi Terkunci Lewat Jam Batas & Direktur Menggeser Jam Cut-Off Secara Langsung

- **🪟 Jendela Aktif:** **Jendela 2 (`Bagas Saputra` — `product@dutamedia.com`)** & **Jendela 1 (`Hendra Wijaya` — Direktur)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Aturan waktu lapor pagi dibagi tiga: Tepat Waktu, Terlambat di masa tenggang, dan Terkunci otomatis begitu melewati batas Cut-Off (`09:30 WIB`). Kenapa harus dikunci? Supaya komitmen pagi betul-betul mencerminkan rencana kerja di awal hari, bukan baru dikarang sore harinya. Namun jam batasnya bisa diatur kapan saja oleh Pemilik Kebijakan lengkap dengan jejak audit, dan karyawan yang terlewat tetap punya jalur pencatatan kerja siang lewat Additional Work."*

- **🖱️ Langkah Klik & Input (Pilih Sesuai Jam Saat Demo Berlangsung):**

  - **☀️ KONDISI A — Jika Demo / Latihan Dilakukan PAGI HARI (Sebelum `09:30 WIB`):**
    1. Di **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**, tunjukkan bahwa sebelum pukul `09:30 WIB`, status formulir masih hijau **`ON-TIME`**.
    2. Untuk membuktikan formulir benar-benar mengunci otomatis saat jam batas terlewati, pindah ke **`Jendela 1 — Direktur` (`/admin/policies`)**:
       - Klik tombol **`+ Buat Versi Kebijakan Baru`**.
       - Ubah **Batas Tepat Waktu Pagi \*** ke `06:00` dan **Batas Kunci Pengisian Pagi (Cut-Off) \*** ke `06:30`.
       - Isi **Alasan Perubahan Kebijakan \*:** `Simulasi kunci otomatis pasca cut-off pagi` → klik **`Simpan & Terapkan Versi Baru`**.
    3. Kembali ke **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**, tekan **`F5`** → tunjukkan spanduk merah **`LOCKED (Pasca Cut-Off)`** langsung muncul dan formulir pagi terkunci!
    4. Klik tab **`2. Additional Work`** (`/daily/additional-work`) → tunjukkan formulir pekerjaan tambahan tetap terbuka dengan alasan otomatis **`Komitmen Pagi Terlewat`**, lalu kembali ke tab **`1. Morning Commitment`**.
    5. Sekarang lanjutkan ke **Langkah Buka Kunci** di bawah ini untuk membuka kembali formulir pagi.

  - **🌤️ KONDISI B — Jika Demo Dilakukan SIANG / SORE / MALAM (Lewat `09:30 WIB`):**
    1. Di **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**, tunjukkan bahwa karena waktu sudah melewati `09:30 WIB`, di layar langsung tampil spanduk merah **`LOCKED (Pasca Cut-Off)`** dan formulir pagi terkunci.
    2. Klik tab **`2. Additional Work`** (`/daily/additional-work`) → tunjukkan formulir pekerjaan tambahan tetap terbuka dengan alasan otomatis **`Komitmen Pagi Terlewat`**, lalu kembali ke tab **`1. Morning Commitment`**.
    3. Sekarang lanjutkan ke **Langkah Buka Kunci** di bawah ini.

  - **🔓 LANGKAH BUKA KUNCI — Direktur Melonggarkan Jam Cut-Off di `Jendela 1 — Direktur` (`/admin/policies`):**
    1. Klik tombol **`+ Buat Versi Kebijakan Baru`**.
    2. Isi seluruh kolom pada modal **`Buat Versi Kebijakan Baru`** dari atas ke bawah:
       - **Kategori Kebijakan \*:** Biarkan **`1. Jam Kerja & Batas Waktu Check-In (Check-In Timing)`**
       - **Batas Tepat Waktu Pagi \*:** Ketik `23:30`
       - **Batas Kunci Pengisian Pagi (Cut-Off) \*:** Ketik `23:45`
       - **Batas Tepat Waktu Sore (EOD) \*:** Ketik `23:50`
       - **Batas Kunci Pengisian Sore (Cut-Off) \*:** Ketik `23:59`
       - **Tanggal Mulai Berlaku \*:** *(biarkan otomatis terisi tanggal hari ini — tunjuk tanggal kemarin terkunci tidak bisa dipilih)*
       - **Tanggal Berakhir (Opsional):** *(biarkan kosong)*
       - **Alasan Perubahan Kebijakan \*:**
         ```text
         Geser jam batas pengisian sebentar untuk keperluan demo live WorkPulse
         ```
    3. Klik tombol **`Simpan & Terapkan Versi Baru`**.
    4. Kembali ke **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**, lalu tekan **`F5`**.

- **👀 Tunjukkan di Layar:**
  - Status di **Jendela 2 (`Bagas`)** langsung berubah hijau **`ON-TIME`** dan formulir komitmen pagi terbuka.
  - Lencana angka merah di menu sidebar **`Notifikasi`** & ikon lonceng pojok kanan atas langsung menyala.

- **💬 Kalimat Penutup Singkat:**  
  *"Begitu Direktur menyimpan versi kebijakan baru, formulir karyawan langsung terbuka sesuai jadwal baru dan semua staf langsung menerima notifikasinya."*

---

#### `2B [INTI]` Karyawan Mengisi & Mengirim Komitmen Pagi (Tarik Tugas Kemarin, Simpan Draf, & Risiko AMBER)

- **🪟 Jendela Aktif:** **Jendela 2 (`Bagas Saputra` — `/daily/morning`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Komitmen pagi sengaja dibatasi maksimal 3 fokus utama agar pengisian cukup 2–3 menit dan bukan menjadi timesheet panjang. Tugas kemarin yang statusnya berlanjut otomatis masuk ke kotak draf pagi — bukan terkirim otomatis — dengan pengingat AMBER jika sudah tertunda 2 hari. Khusus risiko AMBER, karyawan cukup mengisi uraian kekhawatirannya tanpa wajib membuat tiket blocker dulu, supaya atasan tidak kebanjiran tiket kecil dan staf tetap jujur melapor AMBER alih-alih berpura-pura klik GREEN."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 2 — Bagas Saputra`):**

  1. **Tunjuk Kotak Kuning `Prioritas Kemarin Sore` di Bagian Atas Form:**
     - **🗣️ Jelaskan ke audiens:**  
       *"Kotak kuning ini adalah catatan Prioritas Esok Hari yang kemarin sore ditulis sendiri oleh karyawan waktu menutup Evaluasi Sore. Fungsinya menjadi pengingat fokus paling atas setiap pagi supaya rencana kerja antarhari tetap nyambung dan hal terpenting dari kemarin sore tidak terlupakan — tanpa memaksa harus masuk jadi slot komitmen baru."*

  2. **Tarik 2 Tugas dari Kotak `Draf Tugas Berlanjut dari Kemarin`:**
     - Klik tombol **`Lihat Draf`** pada kotak **`Draf Tugas Berlanjut dari Kemarin`**.
     - Tunjuk lencana **`Carry-Over #2 · Disarankan AMBER`** pada item pertama.
     - Centang **kedua item** di daftar draf tersebut.
     - Klik tombol **`Gunakan Item Terpilih ke Slot Hari Ini`**.
     - **👀 Tunjukkan di layar:** **Slot Komitmen #1** dan **Slot Komitmen #2** langsung terisi otomatis lengkap dengan proyek, tautan, dan tingkat risikonya.
     - **🗣️ Jelaskan ke audiens:**  
       *"Kotak Draf Tugas Berlanjut ini berisi komitmen kemarin yang saat evaluasi sore dipilih 'Lanjutkan Besok'. Karyawan tinggal centang tanpa ketik ulang dari nol, dan kalau sudah tertunda sampai hari ke-2, sistem otomatis menyarankan status AMBER sebagai sinyal dini ke atasan."*

  3. **Buka Slot Komitmen #3 (Batas Maksimal 3 Komitmen):**
     - Klik tombol **`Tambah Slot Komitmen (2/3)`**.
     - **👀 Tunjukkan di layar:** Slot **Komitmen #3** terbuka, dan tombol tambah slot langsung hilang karena batas maksimal adalah 3 komitmen per hari.

  4. **`[CABANG]` Uji 2 Validasi Penolakan Sebelum Kirim (Aman, Tidak Mengubah Database):**
     - **Uji penolakan teks terlalu pendek (< 3 huruf):**
       - Pada **Komitmen #3**, ketik `Te` di kolom **Teks Komitmen Terukur \***.
       - Klik tombol **`Kirim Morning Commitment`**.
       - **👀 Tunjukkan di layar:** Ditolak merah **`"Slot #3: Deskripsi komitmen wajib diisi minimal 3 karakter."`**
     - **Uji penolakan risiko `AMBER` tanpa uraian kendala:**
       - Pada **Komitmen #3**, klik kartu risiko **`AMBER`**, biarkan kolom **`Uraian Resiko atau Potensi Kendala *`** kosong.
       - Klik tombol **`Kirim Morning Commitment`**.
       - **👀 Tunjukkan di layar:** Ditolak merah **`"Slot #3: Komitmen dengan risiko AMBER wajib menyertakan uraian potensi kendala."`**

  5. **`[INTI]` Isi Lengkap Seluruh Kolom pada Slot Komitmen #3 dari Atas ke Bawah:**
     - **Teks Komitmen Terukur \*:**
       ```text
       Cek ulang urutan kolom file CSV laporan bulanan bareng tim Finance dan QA
       ```
     - **Proyek Terkait (Opsional):** Pilih **`[WP-CORE] WorkPulse Platform Core 2026`**
     - **Tautkan Tiket Tugas atau Blocker yang Ingin Dikerjakan (Opsional):**
       ```text
       https://github.com/dutamedia/workpulse/issues/230
       ```
       *(Tunjuk juga tombol **`Pilih Blocker Aktif`** di sebelah kanannya).*
     - **Tingkat Risiko Tugas Hari Ini \*:** Pastikan terpilih kartu **`AMBER`** *(3 kolom detail risiko di bawahnya terbuka)*.
     - **Tiket Blocker Penyebab (Opsional):** Biarkan **`-- Tidak Terkait Tiket Blocker Aktif (Risiko / Dependensi Ringan) --`** *(tunjuk keterangan kuning di bawahnya bahwa risiko `AMBER` tidak wajib menautkan tiket blocker)*.
     - **Uraian Resiko atau Potensi Kendala \* (wajib untuk AMBER):**
       ```text
       Urutan kolom status karyawan di file CSV masih nunggu konfirmasi tim Finance
       ```
     - **Tindakan / Bantuan yang Diharapkan (Opsional):**
       ```text
       Minta konfirmasi urutan kolom dari tim Finance sebelum jam 14.00 WIB
       ```

  6. **Uji `Simpan Draf` Lokal Lalu Kirim Komitmen Pagi:**
     - Klik tombol **`Simpan Draf`**.
     - Tekan **`F5`** (refresh browser) untuk membuktikan seluruh ketikan di ke-3 slot tetap tersimpan aman.
     - Klik tombol **`Kirim Morning Commitment`**.

- **👀 Tunjukkan di Layar:**  
  Formulir pagi langsung terkunci dengan status **`SUBMITTED (Terkunci)`** + **`ON-TIME`** dan muncul tombol **`Ajukan Koreksi Komitmen`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Begitu dikirim, baseline pagi langsung terkunci — perubahan setelah ini hanya bisa lewat permohonan koreksi resmi agar tidak ada perubahan diam-diam."*

---

#### `2C [INTI]` Karyawan Mencatat Pekerjaan Tambahan Siang Hari (Edit, Hapus, & Filter Pemberi Tugas)

- **🪟 Jendela Aktif:** **Jendela 2 (`Bagas Saputra` — `/daily/additional-work`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Additional Work ini awalnya tidak ada di PRD Baseline yang diberikan kepada kami. Tetapi setelah kami analisis, bagaimana jika setelah kirim komitmen pagi, ternyata muncul tugas tambahan baru yang prioritasnya lebih tinggi sehingga harus didahulukan dikerjakan? Itu sangat berpotensi membuat komitmen pagi awal tidak selesai penuh — bahkan tidak selesai — padahal karyawan memang punya pekerjaan baru yang lebih genting, bukan karena gagal. Karena itu kami sediakan pencatatan terpisah di sini tanpa mengubah baseline pagi, dan khusus pilihan pemberi tugasnya, akun magang otomatis kami kecualikan."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 2 — Bagas Saputra`):**

  1. **Buka Halaman Pekerjaan Tambahan:**
     - Klik tab **`2. Additional Work`** (`/daily/additional-work`).

  2. **`[INTI]` Tambahkan Pekerjaan Tambahan #1 (Isi Seluruh Kolom dari Atas ke Bawah):**
     - **Deskripsi Pekerjaan Tambahan \*:**
       ```text
       Revisi daftar hak akses menu tagihan portal klien sesuai permintaan klien siang ini
       ```
     - **Alasan Pekerjaan Tambahan \*:** Pilih **`Penugasan Baru dari Atasan`** *(kolom **Ditugaskan Oleh** otomatis muncul di sebelahnya)*.
     - **Ditugaskan Oleh (Atasan Langsung/Lead) \*:**
       - Buka dropdown-nya dan tunjukkan bahwa nama anak magang (**`Raka Pratama`** & **`Nisa Amelia`**) **tidak muncul** di daftar pemberi tugas.
       - Pilih **`Dharma Putra (Head of Delivery & Project Operations)`**.
     - **Proyek Terkait (Opsional):** Pilih **`[PRJ-PORTAL] Dutamedia Client Portal v2.4`**
     - **Tautan Referensi / Tiket Tugas (Opsional):**
       ```text
       https://github.com/dutamedia/workpulse/issues/235
       ```
     - Klik tombol **`Tambahkan Pekerjaan`**.

  3. **`[CABANG]` Tambahkan Pekerjaan Tambahan #2 Lalu Uji `Edit` & `Hapus`:**
     - Isi form **`Tambah Pekerjaan Baru`** untuk tugas ke-2:
       - **Deskripsi Pekerjaan Tambahan \*:**
         ```text
         Siapkan draf agenda rapat mingguan tim Delivery
         ```
       - **Alasan Pekerjaan Tambahan \*:** Pilih **`Tugas Terlewat Dicatat Pagi`**
       - **Proyek Terkait (Opsional):** Biarkan **`-- Non-Proyek / Operasional Rutin --`**
       - **Tautan Referensi / Tiket Tugas (Opsional):** *(biarkan kosong)*
     - Klik tombol **`Tambahkan Pekerjaan`**.
     - **Uji Edit:**
       - Pada kartu Pekerjaan Tambahan #2 yang baru muncul di bawah, klik tombol **`Edit`**.
       - Ubah **Deskripsi Pekerjaan Tambahan \*** menjadi:
         ```text
         Siapkan draf agenda dan checklist rapat mingguan tim Delivery
         ```
       - Klik tombol **`Simpan Perubahan`**.
     - **Uji Hapus (Wajib Alasan):**
       - Masih pada kartu Pekerjaan Tambahan #2, klik tombol **`Hapus`**.
       - Isi kolom **`Alasan Penghapusan (Wajib Diisi) *` (min. 5 karakter):**
         ```text
         Agenda rapatnya sudah digabung langsung ke dokumen review PRJ-PORTAL oleh PM
         ```
       - Klik tombol **`Konfirmasi Hapus`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Dengan pemisahan ini, evaluasi sore tetap adil membaca konteks pekerjaan dadakan di siang hari tanpa merusak catatan rencana pagi."*

---

#### `2D [INTI]` Karyawan Mengisi Evaluasi Sore, Melihat Saran Status (`RED`) vs Pilihan Sendiri (`AMBER`), & Menutup Hari Kerja

- **🪟 Jendela Aktif:** **Jendela 2 (`Bagas Saputra` — `/daily/eod`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di evaluasi sore, kami memisahkan dua hal: Hasil Pekerjaan (Selesai, Sebagian, Belum Selesai, Dibatalkan) dan Kelanjutan Tugasnya (Lanjutkan Besok atau Tidak Dilanjutkan). Jika suatu tugas berhenti di tengah jalan atau dibatalkan, alasan tertulis wajib diisi agar tim tidak menebak-nebak. Untuk status akhir hari (GREEN/AMBER/RED), begitu 50% atau lebih tugas hari ini berstatus Belum Selesai atau Dibatalkan, sistem langsung menampilkan **Saran Status Sistem: RED** — namun sengaja tidak pernah mengunci paksa pilihan GREEN atau AMBER. Keputusan akhir tetap di tangan karyawan sesuai kondisi nyata di lapangan, sementara riwayat status paginya tetap terlihat atasan."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 2 — Bagas Saputra`):**

  1. **Buka Halaman Evaluasi Sore:**
     - Klik tab **`3. EOD Outcome`** (`/daily/eod`).

  2. **Isi Kartu Komitmen #1 (`Finalisasi spesifikasi kebutuhan fitur laporan eksekutif...`):**
     - **Hasil Pencapaian Komitmen \*:** Klik **`Selesai`** *(pilihan kelanjutan otomatis disembunyikan karena tugas sudah tuntas)*.

  3. **Isi Kartu Komitmen #2 (`Menyusun dokumen kriteria penerimaan (acceptance criteria) untuk modul autentikasi SSO...`):**
     - **Hasil Pencapaian Komitmen \*:** Klik **`Sebagian`** *(panel **Keputusan Kelanjutan Tugas Besok** otomatis terbuka)*.
     - **Keputusan Kelanjutan Tugas Besok \*:** Biarkan terpilih **`Lanjutkan Besok (Tugas Berlanjut)`**.
     - **Catatan Kelanjutan (Opsional):**
       ```text
       Tinggal beresin bagian skenario batas login paralel besok pagi
       ```

  4. **Isi Kartu Komitmen #3 (`Cek ulang urutan kolom file CSV laporan bulanan...`):**
     - **Hasil Pencapaian Komitmen \*:** Klik **`Belum Selesai`** *(panel **Keputusan Kelanjutan Tugas Besok** otomatis terbuka)*.
     - **Keputusan Kelanjutan Tugas Besok \*:** Klik **`Tidak Dilanjutkan`** *(kolom alasan wajib otomatis muncul)*.
     - **Alasan Tidak Dilanjutkan \* (wajib):**
       ```text
       Pengecekan kolom CSV sudah diambil alih langsung oleh tim Finance, jadi nggak perlu dilanjut lagi
       ```

  5. **Isi Kartu Pekerjaan Tambahan #1 (`Revisi daftar hak akses menu tagihan portal klien...`):**
     - **Hasil Pencapaian \*:** Klik **`Dibatalkan`** *(kolom alasan pembatalan wajib otomatis muncul)*.
     - **Alasan Pembatalan Pekerjaan Tambahan \* (wajib):**
       ```text
       Klien jadi pakai aturan hak akses versi lama dulu sampai rilis tahap 1 beres
       ```

  6. **Perhatikan Kemunculan Kotak Merah `Saran Status Sistem: RED` di Panel `Refleksi Akhir & Prioritas Esok Hari`:**
     - **👀 Tunjukkan di layar:** Begitu item ke-3 (`Belum Selesai`) dan item ke-4 (`Dibatalkan`) dipilih (2 dari 4 pekerjaan = 50%), tepat di atas pilihan status refleksi langsung muncul kotak merah:
       > **`Saran Status Sistem: RED`**  
       > *"Minimal 50% target pekerjaan hari ini berstatus Belum Selesai atau Dibatalkan. Anda tetap bebas menentukan status refleksi akhir sesuai kondisi aktual."*
     - **🗣️ Jelaskan ke audiens:**  
       *"Perhatikan sistem langsung menghitung otomatis: karena 2 dari 4 pekerjaan hari ini berstatus Belum Selesai dan Dibatalkan (50%), sistem menyarankan status **RED**. Tapi karena yang satu sudah diambil alih tim Finance dan yang satu ditunda atas permintaan klien — bukan karena proyek macet total — karyawan berhak memilih **AMBER** (bahkan kartu **GREEN** pun tetap terbuka dan tidak dikunci paksa)."*

  7. **Isi Kolom Refleksi Akhir & Prioritas Esok Hari:**
     - **Status Refleksi Akhir Hari Ini \*:** Tunjuk kartu **`GREEN`** masih aktif bisa diklik, lalu klik kartu **`AMBER`**.
     - **Penjelasan Risiko / Kendala Hari Ini \* (Wajib min. 10 karakter saat memilih AMBER / RED):**
       ```text
       Dua tugas tidak dilanjutkan karena diambil alih Finance dan ditunda klien, hanya spesifikasi SSO yang masih lanjut besok pagi
       ```
     - **Prioritas Esok Hari (Tomorrow Priority) (Opsional):**
       ```text
       Beresin dokumen syarat terima SSO dan dampingi tes PRJ-PORTAL bareng QA
       ```

  8. **Kirim Evaluasi Sore & Konfirmasi Pilihan `AMBER`:**
     - Klik tombol **`Kirim Evaluasi EOD`**.
     - **👀 Tunjukkan di layar:** Muncul jendela **`Konfirmasi Pilihan Status Akhir Hari`** dengan dua tombol: **`Ubah ke Saran (RED)`** atau **`Tetap Kirim sebagai AMBER`**.
     - Klik tombol **`Tetap Kirim sebagai AMBER`**.
     - Klik sebentar tab **`2. Additional Work`** (`/daily/additional-work`) untuk membuktikan formulir pekerjaan tambahan ikut terkunci otomatis setelah EOD dikirim.

- **💬 Kalimat Penutup Singkat:**  
  *"Setelah EOD dikirim, pencatatan harian hari ini resmi tutup buku termasuk Additional Work — hanya fitur Lapor Blocker yang tetap terbuka 24 jam kalau ada kendala mendadak."*

---

#### `2E [INTI]` Karyawan Meninjau Arsip Kerja & Mengunduh CSV di Riwayat Saya

- **🪟 Jendela Aktif:** **Jendela 2 (`Bagas Saputra` — `/daily/history`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Semua catatan harian, hasil evaluasi, dan arsip cuti maupun dispensasi dari HRGA terkumpul di halaman Riwayat Saya yang bersifat hanya-baca. Tujuannya memberi transparansi dua arah: karyawan punya bukti kerja objektif, dan atasan punya bahan pembinaan yang berbasis fakta."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 2 — Bagas Saputra`):**
  1. Di sidebar kiri, klik menu **`Riwayat Saya`** (`/daily/history`).
  2. Tunjuk **4 kartu ringkasan KPI** di bagian atas halaman.
  3. Tunjuk panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
  4. Pada baris rekor kerja **hari ini** di tabel bawah, klik tombol **`Detail`** untuk membuka rincian 3 komitmen pagi, 1 pekerjaan tambahan, dan evaluasi sore yang baru saja dikirim oleh Bagas.
  5. Klik tombol **`Unduh CSV`** di kanan atas tabel.

- **💬 Kalimat Penutup Singkat:**  
  *"Satu siklus kerja harian penuh dari pagi, siang, sore, sampai arsip CSV sudah selesai dalam satu alur."*

---

#### `2F [CABANG]` Karyawan Melaporkan Hari Bebas Komitmen (`0 Komitmen`)

- **🪟 Jendela Aktif:** **Jendela 5 (Incognito)**
- **🔄 Perpindahan Akun:**
  - **Login di Jendela 5:** `qa@dutamedia.com` (**Nadia Kusuma**, `Password123!`)
  - **🚪 Di Akhir Langkah `2F`:** Klik **`Keluar Sesi`** di **Jendela 5**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Bagaimana kalau hari ini karyawan mengikuti pelatihan seharian atau agenda non-operasional tanpa target tugas harian biasa? Daripada memaksa mereka mengarang tugas palsu sekadar menggugurkan absen, sistem mengizinkan 0 Komitmen — syaratnya wajib isi alasan tertulis, dan statusnya dicatat netral sebagai Bebas Komitmen, bukan pelanggaran."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 5 — Incognito`):**
  1. Login di `/login` sebagai:
     - **Email Perusahaan:**
       ```text
       qa@dutamedia.com
       ```
     - **Kata Sandi:**
       ```text
       Password123!
       ```
  2. Setelah masuk ke `/daily/morning`, centang kotak paling atas: **`Hari ini tidak ada komitmen harian khusus (0 Komitmen)`** *(seluruh slot komitmen di bawahnya otomatis disembunyikan)*.
  3. Isi kolom **`Alasan Tidak Menetapkan Komitmen (Wajib Diisi) *` (min. 10 karakter):**
     ```text
     Ikut pelatihan keamanan aplikasi dan audit mutu bareng HRGA seharian penuh
     ```
  4. Klik tombol **`Kirim Morning Commitment`**.
  5. **👀 Tunjukkan di layar:** Muncul kartu hijau **`Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)`**.
  6. Klik tombol **`Keluar Sesi`** di pojok kanan atas **Jendela 5**.

- **💬 Kalimat Penutup Singkat:**  
  *"Statusnya tercatat rapi sebagai Bebas Komitmen tanpa mengotori metrik risiko hijau-kuning-merah."*

---

#### `2G [INTI]` Karyawan yang Sedang Cuti Resmi Otomatis Bebas Check-In Harian (`Gilang Ramadhan`)

- **🪟 Jendela Aktif:** **Jendela 5 (Incognito)**
- **🔄 Perpindahan Akun:**
  - **Login di Jendela 5:** `specialist.it@dutamedia.com` (**Gilang Ramadhan**, `Password123!`)
  - **🚪 Di Akhir Langkah `2G`:** Klik **`Keluar Sesi`** di **Jendela 5**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk karyawan yang sudah tercatat cuti resmi oleh HRGA — seperti Gilang Ramadhan hari ini — sistem otomatis membebaskan kewajiban check-in harian tanpa perlu mereka membuka aplikasi sekadar memilih 0 Komitmen. Ingat juga bahwa Gilang ini adalah Penanggung Jawab resmi kategori Hosting, Cloud & Domain — sebentar lagi di Babak 3 kita lihat apa yang terjadi kalau ada karyawan melapor kendala ke kategori milik Gilang saat Gilang sedang cuti."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 5 — Incognito`):**
  1. Login di `/login` sebagai:
     - **Email Perusahaan:**
       ```text
       specialist.it@dutamedia.com
       ```
     - **Kata Sandi:**
       ```text
       Password123!
       ```
  2. Di halaman `/daily/morning`, tunjukkan formulir pagi **otomatis terkunci** menampilkan spanduk hijau **`Masa Cuti Resmi (Cuti Tahunan)`**.
  3. Klik sekilas tab **`2. Additional Work`** dan tab **`3. EOD Outcome`** → tunjukkan keduanya juga otomatis terkunci hijau selama masa cuti.
  4. Klik menu **`Riwayat Saya`** (`/daily/history`) di sidebar kiri → tunjukkan masa cuti Gilang tampil di panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
  5. Klik tombol **`Keluar Sesi`** di pojok kanan atas **Jendela 5**.

- **💬 Kalimat Penutup Singkat:**  
  *"Kita sudah lihat sendiri akun Gilang sedang cuti resmi hari ini. Sekarang kita masuk ke Babak 3."*

---

### BABAK 3 — Pelaporan Kendala (Blocker), Penanganan Lintas Tim, & Pemantauan Eskalasi

---

#### `3A [INTI]` Karyawan Melaporkan Komitmen RED via Jalan Pintas Blocker (16 Kategori, 9 Dampak, & Aturan Cuti Vertikal)

- **🪟 Jendela Aktif:** **Jendela 5 (Incognito)** *(dan boleh tunjuk sekilas **Jendela 4 — Dewi HRGA** jika ingin melihat daftar cuti)*
- **🔄 Perpindahan Akun:**
  - **Login di Jendela 5:** `intern.frontend@dutamedia.com` (**Raka Pratama**, `Password123!`)
  - **Tetap Login:** Biarkan **Raka** tetap login di **Jendela 5** sampai akhir langkah `3B`.

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di sini ada tiga aturan penting. Pertama, komitmen pagi berstatus RED wajib ditautkan ke tiket blocker aktif supaya tidak ada 'RED siluman' tanpa PIC dan target waktu — dan kami siapkan tombol jalan pintas agar draf paginya otomatis tersimpan. Kedua, 16 kategori kendala dan 1 sampai 3 pilihan dampak mengarahkan tiket ke Penanggung Jawab Kategori resmi. Ketiga, karena Gilang Ramadhan tadi sedang cuti resmi hari ini, sistem tidak boleh menurunkan tiket ke rekan atau bawahan — tiket otomatis naik vertikal ke atasannya (`Gunawan Setiawan`), dan sistem juga menolak jika pelapor memaksa memilih manual nama Gilang."*

- **🖱️ Langkah Klik & Input:**

  1. **Login sebagai `Raka Pratama` di `Jendela 5` & Tarik Draf Tugas Kemarin (`/daily/morning`):**
     - Login di `/login` sebagai:
       - **Email Perusahaan:**
         ```text
         intern.frontend@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```
     - Di halaman `/daily/morning`, klik tombol **`Lihat Draf`** pada kotak **`Draf Tugas Berlanjut dari Kemarin`**.
     - Klik tombol **`Salin ke Slot`** pada tugas *`Implementasi tata letak kartu responsif pada halaman riwayat cuti dan dispensasi`*.
     - **👀 Tunjukkan di layar:** **Slot Komitmen #1** langsung terisi otomatis dengan teks komitmen, proyek **`[WP-CORE] WorkPulse Platform Core 2026`**, dan tautan PR `https://github.com/dutamedia/workpulse/pull/225`.

  2. **Ubah Tingkat Risiko Slot #1 Menjadi `RED`:**
     - Pada **Tingkat Risiko Tugas Hari Ini \*** di Slot #1, klik kartu **`RED`**.
     - **👀 Tunjukkan di layar:** Kolom **`Tiket Blocker Penyebab (Wajib untuk RED) *`**, **`Uraian Resiko atau Potensi Kendala *`**, dan **`Tindakan / Bantuan yang Diharapkan (Opsional)`** langsung muncul.

  3. **`[CABANG]` Uji Penolakan Kirim Komitmen `RED` Tanpa Tiket Blocker:**
     - Isi dulu kolom **`Uraian Resiko atau Potensi Kendala *`:**
       ```text
       Server staging WP-CORE error 502 Bad Gateway sehingga pengujian tampilan responsif di layar HP belum bisa dilanjutkan
       ```
     - Biarkan dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`** tetap kosong (`-- Pilih Tiket Blocker Aktif Penyebab Risiko RED --`).
     - Klik tombol **`Kirim Morning Commitment`**.
     - **👀 Tunjukkan di layar:** Ditolak merah — komitmen berisiko `RED` tidak boleh dikirim tanpa menautkan tiket blocker aktif!

  4. **`[INTI]` Klik Tombol Jalan Pintas `+ Buat Tiket Blocker Sekarang`:**
     - Klik tombol **`+ Buat Tiket Blocker Sekarang`** tepat di bawah dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`**.
     - **👀 Tunjukkan di layar:** Draf komitmen pagi Raka otomatis tersimpan di browser dan halaman berpindah ke `/raise-blockers?returnTo=/daily/morning&slot=0`.

  5. **`[INTI]` Isi Formulir `/raise-blockers` dari Atas ke Bawah (Sekaligus Uji Cuti Vertikal `Gilang` & Batas `3/3` Dampak):**

     - **Bagian 1 — `Detail Kendala, Taksonomi & Dampak`:**
       1. **Judul Kendala \* (min. 10 karakter):**
          ```text
          Server Staging WP-CORE Error 502 Bad Gateway Saat Tes Halaman Riwayat
          ```
       2. **Tautkan ke Komitmen / Tugas Hari Ini (opsional):**
          - Biarkan **`— Tidak Terkait Komitmen Hari Ini —`** *(karena komitmen pagi Raka masih berupa draf belum terkirim; tiket akan otomatis tertaut ke Slot #1 begitu kembali ke `/daily/morning`)*.
       3. **Kategori Kendala \*:**
          - Untuk membuktikan aturan cuti vertikal milik **Gilang Ramadhan** yang tadi kita lihat sedang cuti di `2G`, pilih dulu **`1. Teknis & Sistem` → `Hosting, Cloud & Domain (HOSTING_DOMAIN)`**.
       4. **Dampak Kendala (Pilih 1–3 Dampak) \*:**
          - **`[CABANG]` Uji batas maksimal 3 dampak:** Centang 3 kotak dampak sekaligus → tunjukkan penghitung berubah menjadi **`3 / 3 dipilih`** dan kotak ke-4 s/d ke-9 otomatis terkunci nonaktif.
          - **`[INTI]` Sisakan 2 dampak yang dicentang (`2 / 3 dipilih`):**
            - Centang **`Target & Tenggat Waktu`**
            - Centang **`Satu Tim / Divisi`**
       5. **Tingkat Keparahan (Severity) \*:**
          - Klik kartu **`High`** (`Target: 4 jam`).
       6. **Deskripsi Kendala & Upaya Mandiri \* (min. 20 karakter):**
          ```text
          Dari pagi server staging WP-CORE error 502 Bad Gateway pas buka halaman riwayat, jadi cek tampilan HP belum bisa jalan. Sudah coba clear cache tapi tetap sama.
          ```
       7. **Bantuan Konkret yang Diharapkan (opsional):**
          ```text
          Tolong restart container staging WP-CORE dan cek setting Nginx-nya
          ```

     - **Bagian 2 — `Penanggung Jawab Awal & Jalur Kewenangan`:**
       8. **Jalur Kewenangan \*:**
          - Klik kartu **`Organizational Authority (Struktural)`** *(diubah dari `Project Authority` agar sistem memakai jalur Penanggung Jawab Kategori struktural)*.
       9. **Buktikan Aturan Cuti Vertikal Otomatis & Uji Paksa Pilih Manual `Gilang Ramadhan`:**
          - **👀 Bukti 1 (Otomatis Naik Vertikal ke Atasan):** Tunjuk kotak **`Pratinjau Jalur Penanganan Otomatis`** di bagian bawah — karena PIC resmi kategori `HOSTING_DOMAIN` (**`Gilang Ramadhan`**) sedang cuti resmi hari ini, sistem **tidak menurunkan tiket ke rekan atau bawahan**, melainkan **otomatis menaikkan vertikal ke atasannya: `Gunawan Setiawan` (`Head of Operations & Infrastructure`)**!
          - **👀 Bukti 2 (`[CABANG]` Tolak Pilih Manual Orang yang Sedang Cuti):**
            - Buka dropdown **`Penanggung Jawab Khusus (opsional)`**, gulir ke grup **`── Lainnya ──`**, lalu pilih **`Gilang Ramadhan — IT Systems & Cloud Specialist`**.
            - Klik tombol **`Kirim Laporan Blocker`**.
            - **👀 Tunjukkan di layar:** **Ditolak merah oleh sistem** (`"Gilang Ramadhan sedang dalam masa cuti resmi hari ini sehingga tidak dapat ditunjuk sebagai Penanggung Jawab..."`)!
       10. **`[INTI]` Arahkan ke Kategori `Server & Rilis Sistem (INFRA)` (`Reza Mahendra`) Lalu Kirim Tiket:**
           - Kembalikan dropdown **`Penanggung Jawab Khusus (opsional)`** ke pilihan paling atas (**`— Ditentukan Otomatis... —`**).
           - Pada dropdown **`Kategori Kendala *`** di Panel 1, ubah kategori menjadi **`1. Teknis & Sistem` → `Server & Rilis Sistem (INFRA)`**.
           - **👀 Tunjukkan di layar:** Pratinjau otomatis langsung menunjuk Penanggung Jawab Kategori `INFRA` yang aktif hari ini, yaitu **`Reza Mahendra` (`Network & Infrastructure Engineer`)**.
           - Klik tombol **`Kirim Laporan Blocker`**.

  6. **`[INTI]` Otomatis Kembali ke `/daily/morning` & Kirim Komitmen Pagi Raka:**
     - **👀 Tunjukkan di layar:** Begitu tiket blocker terkirim, browser **otomatis kembali ke `/daily/morning`** dengan spanduk hijau bahwa tiket baru berhasil ditautkan ke **Komitmen #1**!
     - Periksa **Slot Komitmen #1 (`RED`)** yang sudah terisi lengkap dari draf:
       - **Teks Komitmen Terukur \*:** `Implementasi tata letak kartu responsif pada halaman riwayat cuti dan dispensasi`
       - **Proyek Terkait (Opsional):** `[WP-CORE] WorkPulse Platform Core 2026`
       - **Tautkan Tiket Tugas atau Blocker yang Ingin Dikerjakan (Opsional):** `https://github.com/dutamedia/workpulse/pull/225`
       - **Tingkat Risiko Tugas Hari Ini \*:** **`RED`**
       - **Tiket Blocker Penyebab (Wajib untuk RED) \*:** *(otomatis terpilih tiket `[HIGH] Server Staging WP-CORE Error 502 Bad Gateway...` yang barusan dibuat)*
       - **Uraian Resiko atau Potensi Kendala \* (wajib untuk RED):** *(sudah otomatis terisi dari draf / dari tiket blocker)*
       - **Tindakan / Bantuan yang Diharapkan (Opsional):**
         ```text
         Butuh tim Network & Infra restart container staging WP-CORE dan perbaiki konfigurasi Nginx
         ```
     - Klik tombol **`Kirim Morning Commitment`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Draf pagi otomatis aman, aturan cuti vertikal terbukti menjaga tiket tidak jatuh ke orang yang sedang cuti, dan komitmen RED langsung terkirim dalam satu alur."*

---

#### `3B [INTI]` Staf Spesialis Menangani Tiket & Pelapor Memverifikasi Penyelesaian Hingga Ditutup

- **🪟 Jendela Aktif:** **Jendela 2** & **Jendela 5 (masih `Raka Pratama`)**
- **🔄 Perpindahan Akun:**
  - **🔄 Ganti Akun di Jendela 2:** Keluar dari `Bagas Saputra` → Login sebagai `network.infra@dutamedia.com` (**Reza Mahendra**, `Password123!`)
  - **🚪 Di Akhir Langkah `3B`:** Klik **`Keluar Sesi`** Raka di **Jendela 5**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk jenis kendala teknis atau operasional tertentu, tiket tidak selalu harus menumpuk di Head Divisi — kami menetapkan Penanggung Jawab Kategori resmi agar staf spesialis seperti Network Engineer bisa langsung membuka Antrean Blocker tanpa perlu mengubah struktur atasannya di bagan perusahaan. Di dalam tiketnya, tombol 'Beri Bantuan' untuk progres bertahap/uji coba sengaja dipisah dari 'Selesaikan' (khusus solusi tuntas), dan PIC tidak bisa menutup tiket sepihak — pelapor sendirilah yang memverifikasi atau mengembalikannya jika masalah masih terjadi."*

- **🖱️ Langkah Klik & Input:**

  1. **Login sebagai `Reza Mahendra` di `Jendela 2` & Buka `Antrean Blocker` (`/blockers`):**
     - Di **Jendela 2**, klik **`Keluar Sesi`** (keluar dari Bagas Saputra).
     - Login di `/login` sebagai:
       - **Email Perusahaan:**
         ```text
         network.infra@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```
     - Di sidebar kiri, klik menu **`Antrean Blocker`** (`/blockers`).
     - **👀 Tunjukkan di layar:** Menu **`Antrean Blocker`** dan **`Penuaan & Eskalasi`** terbuka bagi Reza karena ia adalah Penanggung Jawab Kategori `INFRA` & `NETWORK`.

  2. **Reza Menerima Tiket & Mencatat `Beri Bantuan` (Progres Bertahap):**
     - Klik kartu tiket **`Server Staging WP-CORE Error 502 Bad Gateway Saat Tes Halaman Riwayat`** di panel kiri.
     - Klik tombol **`Terima & Tangani`** di kanan atas detail tiket (status berubah menjadi **`Sedang Ditangani`**).
     - Klik tombol **`Beri Bantuan`**, lalu isi kedua kolom di modal **`Catat Pemberian Bantuan (Assist)`**:
       - **Aksi Bantuan yang Diberikan \*:**
         ```text
         Restart container staging WP-CORE dan bersihin antrean Nginx
         ```
       - **Hasil / Progres yang Dicapai \*:**
         ```text
         Halaman utama staging sudah hidup lagi, coba Raka akses sekarang
         ```
     - Klik tombol **`Simpan Kontribusi`**.

  3. **⚡ Raka Mencatat `Terima Bantuan (Membantu Sebagian)` di `Jendela 5` (`/raise-blockers?tab=mine`):**
     - Pindah ke **`Jendela 5 — Raka Pratama`**.
     - Di sidebar kiri, klik menu **`Lapor Blocker`**, lalu klik tab **`Blocker Saya`** (`/raise-blockers?tab=mine`).
     - Pada kartu tiket tersebut, klik tombol **`Terima Bantuan (Membantu Sebagian)`**.
     - Isi kotak catatan yang terbuka (min. 10 karakter):
       ```text
       Halaman utama sudah kebuka, tapi halaman riwayat cuti masih kena 502 pas panggil API
       ```
     - Klik tombol **`Kirim Catatan Membantu Sebagian`**.

  4. **Reza Mengirim Solusi Tuntas (`Selesaikan`) di `Jendela 2` (`/blockers`):**
     - Kembali ke **`Jendela 2 — Reza Mahendra`** (`/blockers`), tekan **`F5`**.
     - Klik tombol **`Selesaikan`**.
     - Di modal **`Selesaikan Blocker (Resolve)`**, isi kolom **`Catatan Resolusi / Tindakan Perbaikan *` (min. 10 karakter):**
       ```text
       Koneksi Nginx ke API staging sudah dibenerin dan semua endpoint sudah lancar 200 OK
       ```
     - Klik tombol **`Kirim Solusi`** (status berubah menjadi **`Menunggu Konfirmasi Pelapor`**).

  5. **`[CABANG]` Raka Mengembalikan Solusi (`Belum Memadai`) Lalu Reza Menyelesaikan Ulang:**
     - Pindah ke **`Jendela 5 — Raka Pratama`** (`/raise-blockers?tab=mine`), tekan **`F5`**.
     - Klik tombol **`Belum Memadai (Kembalikan)`**.
     - Isi kotak alasan pengembalian (min. 10 karakter):
       ```text
       Daftar data sudah tampil, tapi pas pakai filter tanggal masih timeout setelah 10 detik
       ```
     - Klik tombol **`Kirim & Kembalikan ke PIC`** (status tiket otomatis kembali ke **`Sedang Ditangani`**).
     - Kembali ke **`Jendela 2 — Reza Mahendra`** (`/blockers`), tekan **`F5`**, klik tombol **`Selesaikan`**, lalu isi **`Catatan Resolusi / Tindakan Perbaikan *`:**
       ```text
       Batas timeout koneksi database staging sudah dinaikkan, tes filter sudah cepat di bawah 200ms
       ```
     - Klik tombol **`Kirim Solusi`**.

  6. **`[INTI]` Raka Mengonfirmasi & Menutup Tiket di `Jendela 5`, Lalu Keluar Sesi:**
     - Di **`Jendela 5 — Raka Pratama`** (`/raise-blockers?tab=mine`), tekan **`F5`**.
     - Klik tombol **`Konfirmasi & Tutup Tiket`** (status tiket resmi **`Selesai Ditutup`**).
     - Klik sebentar bulatan profil **`RP`** di pojok kanan atas (`/profile`) untuk menunjukkan lencana ungu **`Intern`** beserta tanggal selesai magangnya.
     - Klik tombol **`Keluar Sesi`** di **Jendela 5**.

- **💬 Kalimat Penutup Singkat:**  
  *"Seluruh riwayat bantuan bertahap, pengembalian solusi, hingga konfirmasi penutupan final terekam berurutan di linimasa tiket."*

---

#### `3C [INTI]` Kepala Divisi Membantu Tiket Lintas Tim dari Dashboard & Menetapkan Terima Risiko

- **🪟 Jendela Aktif:** **Jendela 3 (`Arif Budiman` — Head Engineering)** & **Jendela 2**
- **🔄 Perpindahan Akun:**
  - **🔄 Ganti Akun di Jendela 2:** Keluar dari `Reza Mahendra` → Login sebagai `dev.frontend@dutamedia.com` (**Aditya Nugroho**, `Password123!`)
  - *(Biarkan **Aditya Nugroho** tetap login di **Jendela 2** sampai Babak `7A`).*

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di WorkPulse kami pegang prinsip 'primary ownership bukan exclusive ownership': meskipun PIC utama tiketnya adalah Tech Lead, atasan atau rekan lintas fungsi bisa langsung menyalurkan bantuan kapan saja tanpa harus menunggu PIC. Dan bila ada kendala yang secara keputusan bisnis memang harus ditunda dulu — bukan tidak dikerjakan — atasan bisa memilih 'Terima Risiko' dengan justifikasi dan rencana mitigasi tertulis."*

- **🖱️ Langkah Klik & Input:**

  1. **Login sebagai `Aditya Nugroho` di `Jendela 2`:**
     - Di **Jendela 2**, klik **`Keluar Sesi`** (keluar dari Reza Mahendra).
     - Login di `/login` sebagai:
       - **Email Perusahaan:**
         ```text
         dev.frontend@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```

  2. **Arif (Head Engineering) Klik `Bantu Unblock` dari Dashboard di `Jendela 3` (`/dashboard`):**
     - Pindah ke **`Jendela 3 — Arif Budiman`** di halaman **`Dashboard`** (`/dashboard`).
     - Pada tabel **`Personil Butuh Bantuan Hari Ini`**, klik tombol **`Bantu Unblock`** di baris **`Aditya Nugroho`** (kendala *`Gagal Build Pipeline Frontend di GitLab CI karena Out-of-Memory (OOM)`*).
     - **👀 Tunjukkan di layar:** Halaman langsung berpindah ke `/blockers`, **panel daftar kartu di kiri otomatis tergulir pas ke tiket tersebut**, sementara **header detail tiket di panel kanan tetap terlihat utuh**.

  3. **Arif (Non-PIC) Memberi Bantuan Langsung pada Tiket Tersebut (`/blockers`):**
     - Meskipun PIC tiketnya adalah `Bambang Pratama`, Arif langsung klik tombol **`Beri Bantuan`**.
     - Isi kedua kolom pada modal **`Catat Pemberian Bantuan (Assist)`**:
       - **Aksi Bantuan yang Diberikan \*:**
         ```text
         Naikkan limit memori container GitLab CI runner dari 2GB ke 6GB
         ```
       - **Hasil / Progres yang Dicapai \*:**
         ```text
         Build frontend sudah dites ulang dan lolos tanpa error OOM
         ```
     - Klik tombol **`Simpan Kontribusi`**.
     - Klik sebentar menu **`Dashboard`** (`/dashboard`) di sidebar kiri **Jendela 3** → tunjukkan kontribusi Arif langsung tampil di panel **`Feed Dukungan Lintas Fungsi`**.

  4. **⚡ Aditya Langsung Menutup Tiket dari Bantuan Non-PIC di `Jendela 2` (`/raise-blockers?tab=mine`):**
     - Pindah ke **`Jendela 2 — Aditya Nugroho`**.
     - Klik menu **`Lapor Blocker`** di sidebar kiri, lalu klik tab **`Blocker Saya`** (`/raise-blockers?tab=mine`).
     - Pada kartu tiket *`Gagal Build Pipeline Frontend di GitLab CI karena Out-of-Memory (OOM)`*, klik tombol **`Terima sbg Penyelesaian (Tutup Tiket)`**.
     - **👀 Tunjukkan di layar:** Tiket langsung berubah menjadi **`Selesai Ditutup`**.

  5. **`[CABANG]` Arif Menetapkan `Terima Risiko` pada Tiket Arsitektur di `Jendela 3` (`/blockers`):**
     - Kembali ke **`Jendela 3 — Arif Budiman`**, klik menu **`Antrean Blocker`** (`/blockers`).
     - Pilih kartu tiket **`Menunggu Persetujuan Rilis Arsitektur Database Baru`** (Kategori: `Persetujuan & Tanda Tangan`, Proyek: `WP-CORE`).
     - Klik tombol **`Terima & Tangani`**.
     - Klik tombol **`Terima Risiko`**, lalu isi kedua kolom di modal **`Penerimaan Risiko Resmi (Accept Risk)`**:
       - **Justifikasi Penerimaan Risiko \* (min. 10 karakter):**
         ```text
         Migrasi database tahap 2 kita geser ke rilis minggu depan supaya jadwal demo minggu ini tetap aman
         ```
       - **Rencana Mitigasi Sementara \* (min. 10 karakter):**
         ```text
         Sementara tetap pakai skema tabel versi 1 dan dipantau query-nya tiap hari oleh Tech Lead
         ```
     - Klik tombol **`Tetapkan Terima Risiko`** (status berubah menjadi **`Risiko Diterima`**).

- **💬 Kalimat Penutup Singkat:**  
  *"Bantuan lintas fungsi dari luar PIC bisa langsung menutup tiket bila memang menyelesaikan masalah, sementara penundaan strategis tetap tercatat resmi mitigasinya."*

---

#### `3D [CABANG]` Pelapor Mengubah Divisi Tujuan Tiket (PIC Pindah Otomatis) & Menghapus Tiket Aktif

- **🪟 Jendela Aktif:** **Jendela 2 (`Aditya Nugroho` — `/raise-blockers?tab=mine`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Karyawan bisa saja salah pilih divisi tujuan, duplikat bikin tiket, atau kendalanya keburu beres sendiri. Agar antrean PIC tidak penuh tiket salah alamat dan memicu alarm terlambat palsu, pelapor diizinkan mengedit atau menghapus tiket **hanya selama tiket masih aktif**. Begitu divisi tujuan diganti saat edit, PIC otomatis berpindah ke divisi yang benar; saat dihapus wajib pilih alasan dan seluruh pihak terkait langsung dapat notifikasi — tidak ada penghapusan diam-diam."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 2 — Aditya Nugroho` pada `/raise-blockers?tab=mine`):**

  1. **Edit Divisi Tujuan Tiket `CROSS_TEAM` (Membuktikan PIC Pindah Otomatis):**
     - Cari kartu tiket **`Menunggu Hasil Uji QA dari Tim Delivery`** (PIC saat ini: **`Dharma Putra`** — *Head of Delivery*).
     - Klik tombol **`Edit Tiket`** pada kartu tersebut.
     - Di modal **`Edit Tiket Kendala`**, periksa/ubah kolom berikut dari atas ke bawah:
       - **Judul Kendala \* (min. 10 karakter):** *(biarkan judul yang sudah ada)*
       - **Kategori Kendala \*:** Biarkan **`3. Orang & Keputusan` → `Menunggu Tim / Rekan Lain (CROSS_TEAM)`**
       - **Divisi yang Sedang Ditunggu \*:** Ubah dari `Product & Delivery` ke **`Operations & Infrastructure`**
       - **Dampak Kendala (Pilih 1–3 Dampak) \*:** *(biarkan yang sudah tercentang)*
       - **Tingkat Keparahan (Severity) \*:** *(biarkan `Medium`)*
       - **Deskripsi Kendala & Upaya Mandiri \* (min. 20 karakter):**
         ```text
         Perbaikan navigasi sudah kelar, tapi masih nunggu pembukaan port firewall staging dari tim Operations & Infrastructure
         ```
       - **Bantuan Konkret yang Diharapkan (opsional):** *(biarkan yang sudah ada)*
     - Klik tombol **`Simpan Perubahan`**.
     - **👀 Tunjukkan di layar:** PIC pada kartu tiket tersebut otomatis berpindah dari `Dharma Putra` ke **`Gunawan Setiawan`** (*Head of Operations & Infrastructure*).

  2. **Hapus Tiket Aktif yang Sudah Teratasi Mandiri:**
     - Cari kartu tiket **`Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus`**.
     - Klik tombol **`Hapus Tiket`** pada kartu tersebut.
     - Di modal **`Hapus Tiket Kendala`**, pada pilihan **`Kategori Alasan Penghapusan *`**, tunjuk 3 alasan preset (`Salah Input / Tiket Duplikat`, `Sudah Teratasi Mandiri`, `Kendala Tidak Jadi / Batal Relevan`) + `Alasan Lainnya`.
     - Klik kartu alasan **`Sudah Teratasi Mandiri`** *(kolom penjelasan di bawahnya otomatis terisi kalimat preset)*.
     - Klik tombol **`Konfirmasi Hapus Tiket`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Begitu tiket sudah masuk tahap Selesai atau Ditutup, tombol Edit dan Hapus otomatis dikunci agar arsip kerjanya tetap utuh."*

---

#### `3E [INTI]` Kepala Divisi Memantau Tiket Kritis Lewat Batas Waktu di Radar Penuaan

- **🪟 Jendela Aktif:** **Jendela 3 (`Arif Budiman` — Head Engineering)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Prinsip utama WorkPulse adalah 'No Surprise' — masalah boleh terjadi di proyek, tapi tidak boleh menjadi kejutan di akhir minggu. Tiket dengan tingkat keparahan tinggi yang melewati target waktu penyelesaian langsung disorot merah di Radar Penuaan ini supaya pimpinan cepat turun tangan."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 3 — Arif Budiman`):**
  1. Di sidebar kiri, klik menu **`Penuaan & Eskalasi`** (`/blockers/aging`).
  2. Tunjuk kartu ringkasan merah **`Lewat Batas Waktu: 1`** dan baris tiket **`[CRITICAL] Gangguan Koneksi Database Staging menyebabkan Pengujian Integrasi Terhenti`** (`WP-CORE`).
  3. Centang kotak filter **`Hanya Lewat Batas Waktu`**.
  4. Klik tombol **`Buka`** di ujung kanan baris tiket tersebut untuk langsung melompat ke detail penanganannya di `/blockers`.

- **💬 Kalimat Penutup Singkat:**  
  *"Sekali klik 'Buka', atasan langsung dibawa ke tiket kritis yang paling butuh intervensi."*

---

### BABAK 4 — Permohonan & Persetujuan Koreksi Laporan yang Sudah Terkunci

---

#### `4A [INTI]` Karyawan Mengajukan Koreksi Komitmen Pagi (Otomatis untuk Minor, Review untuk Material)

- **🪟 Jendela Aktif:** **Jendela 2 (`Aditya Nugroho` — `/corrections/morning`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun** *(Aditya sudah login di Jendela 2 sejak Babak `3C`)*

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Komitmen yang sudah terkunci tidak boleh diedit bebas supaya baseline pagi tetap jujur. Tapi supaya proses koreksi tidak birokratis dan tidak membebani atasan, kami bagi dua: Perubahan Minor (seperti salah ketik atau tambah tautan PR) langsung diterapkan otomatis dengan jejak audit, sedangkan Perubahan Material (mengubah target atau tingkat risiko) harus melewati persetujuan Kepala Divisi."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 2 — Aditya Nugroho`):**

  1. **Buka Halaman Koreksi Komitmen Pagi:**
     - Di sidebar kiri, klik menu **`Koreksi Komitmen Pagi`** (`/corrections/morning`).

  2. **Ajukan Perubahan Minor pada Komitmen #1 (Langsung Diterapkan Otomatis):**
     - Isi formulir di panel kiri dari atas ke bawah:
       - **Pilih Komitmen yang Ingin Dikoreksi \*:** Pilih **`[Komitmen #1] Menyelesaikan implementasi komponen UI navigasi mobile... (Risiko: GREEN)`**
       - **Klasifikasi Perubahan \*:** Klik kartu **`Perubahan Minor`** (`Diterapkan Otomatis · Audit Log`)
       - **Deskripsi Komitmen Baru yang Diajukan \*:**
         ```text
         Menyelesaikan implementasi komponen UI navigasi mobile responsif lintas 5 ukuran layar
         ```
       - **Tautan Referensi Baru (opsional):**
         ```text
         https://github.com/dutamedia/workpulse/pull/241
         ```
       - **Tingkat Risiko Baru:** Biarkan **`GREEN (Lancar)`** *(terkunci mengikuti risiko asli karena Perubahan Minor tidak boleh mengubah tingkat risiko)*
       - **Alasan Resmi Permohonan Koreksi \* (min. 10 karakter):**
         ```text
         Tambah link PR nomor 241 dan perjelas info ukuran layar
         ```
     - Klik tombol **`Kirim Permohonan Koreksi`**.
     - **👀 Tunjukkan di layar:** Di panel kanan (`Riwayat Permohonan Koreksi`), permohonan langsung berstatus hijau **`Diterapkan Otomatis (AUTO_APPLIED)`**.

  3. **Ajukan Perubahan Material pada Komitmen #2 (Menunggu Persetujuan Kepala Divisi):**
     - Isi kembali formulir di panel kiri dari atas ke bawah:
       - **Pilih Komitmen yang Ingin Dikoreksi \*:** Pilih **`[Komitmen #2] Investigasi dan perbaikan bug memory leak pada proses build frontend... (Risiko: RED)`**
       - **Klasifikasi Perubahan \*:** Klik kartu **`Perubahan Material`** (`Wajib Persetujuan Atasan`)
       - **Deskripsi Komitmen Baru yang Diajukan \*:**
         ```text
         Optimasi code-splitting Vite biar penggunaan memori build frontend turun
         ```
       - **Tautan Referensi Baru (opsional):** *(biarkan tautan PR yang sudah terisi)*
       - **Tingkat Risiko Baru:** Ubah dari `RED (Kritis)` ke **`GREEN (Lancar)`**
       - **Alasan Resmi Permohonan Koreksi \* (min. 10 karakter):**
         ```text
         Karena runner CI sudah lancar, fokus hari ini digeser ke optimasi code-splitting Vite
         ```
     - Klik tombol **`Kirim Permohonan Koreksi`**.
     - **👀 Tunjukkan di layar:** Di panel kanan muncul kartu baru berstatus kuning **`Menunggu Persetujuan`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Perubahan Minor langsung diterapkan tanpa mengganggu atasan, sedangkan Perubahan Material langsung masuk ke meja review Kepala Divisi."*

---

#### `4B [INTI]` Kepala Divisi Menolak Koreksi, Karyawan Merevisi Cepat, Lalu Koreksi Disetujui

- **🪟 Jendela Aktif:** **Jendela 3 (`Arif Budiman` — Head Engineering)** & **Jendela 2 (`Aditya Nugroho`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input:**

  1. **Arif Menolak Permohonan Koreksi Material di `Jendela 3` (`/corrections/review`):**
     - Pindah ke **`Jendela 3 — Arif Budiman`**, lalu klik menu **`Review Koreksi`** (`/corrections/review`) di sidebar kiri.
     - Tunjuk kotak perbandingan **`Sebelum` vs `Diajukan`** pada permohonan milik Aditya Nugroho.
     - Klik tombol **`Tolak`**.
     - Di modal **`Tolak Permohonan Koreksi`**, isi kolom **`Catatan Review / Alasan Keputusan *` (min. 5 karakter):**
       ```text
       Tolong tambahin nomor tiket issue Vite biar gampang dicek tim QA
       ```
     - Klik tombol **`Konfirmasi Tolak`**.

  2. **⚡ Aditya Merevisi Cepat dengan Tombol `Gunakan Draf Sebelumnya & Sesuaikan` di `Jendela 2` (`/corrections/morning`):**
     - Pindah ke **`Jendela 2 — Aditya Nugroho`** (`/corrections/morning`), lalu tekan **`F5`**.
     - Pada kartu **`Komitmen #2 · REJECTED · MATERIAL`** di panel kanan (atau setelah memilih **`[Komitmen #2]`** di dropdown kiri), klik tombol **`Gunakan Draf Sebelumnya & Sesuaikan`**.
     - **👀 Tunjukkan di layar:** Seluruh teks draf sebelumnya otomatis dimuat kembali ke formulir kiri tanpa perlu mengetik ulang dari awal!
     - Sesuaikan isian formulir kiri:
       - **Deskripsi Komitmen Baru yang Diajukan \*:**
         ```text
         Optimasi code-splitting Vite [#245] biar penggunaan memori build frontend turun
         ```
       - **Tingkat Risiko Baru:** Pastikan **`GREEN (Lancar)`**
       - **Alasan Resmi Permohonan Koreksi \* (min. 10 karakter):**
         ```text
         Tambah nomor tiket [#245] sesuai catatan Head Engineering
         ```
     - Klik tombol **`Kirim Permohonan Koreksi`**.

  3. **Arif Menyetujui Revisi Koreksi di `Jendela 3` (`/corrections/review`):**
     - Kembali ke **`Jendela 3 — Arif Budiman`** (`/corrections/review`), lalu tekan **`F5`**.
     - Klik tombol **`Setujui`** pada permohonan revisi Aditya.
     - Di modal **`Setujui Permohonan Koreksi`**, isi kolom **`Catatan Review / Alasan Keputusan *` (min. 5 karakter):**
       ```text
       Sip, nomor referensi [#245] sudah lengkap
       ```
     - Klik tombol **`Konfirmasi Setujui`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Atasan bisa melihat jelas perbandingan sebelum dan sesudah, dan kalau ditolak, karyawan tinggal memakai tombol revisi cepat dari draf sebelumnya."*

---

#### `4C [CABANG]` Menunjukkan Halaman Koreksi Evaluasi Sore (Batas 48 Jam Kerja)

- **🪟 Jendela Aktif:** **Jendela 2 (`Aditya Nugroho` — `/corrections/eod`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input:**
  1. Di sidebar kiri **Jendela 2**, klik menu **`Koreksi Evaluasi Sore`** (`/corrections/eod`).
  2. Tunjukkan bahwa halaman permohonan koreksi laporan sore tersedia terpisah dengan aturan batas pengajuan 48 jam kerja.

---

### BABAK 5 — Pencatatan Cuti Resmi, Dispensasi Tugas, & Pengecualian Permanen

---

#### `5A [INTI]` HRGA Mencatat Cuti Sakit Karyawan (Beserta 3 Pagar Pengaman) & Membuktikan Form Langsung Terkunci

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (Incognito)**
- **🔄 Perpindahan Akun:**
  - **Login di Jendela 5:** `staff.finance@dutamedia.com` (**Intan Permata**, `Password123!`)
  - *(Biarkan **Intan Permata** tetap login di **Jendela 5** untuk langkah `5B` dan `5C`).*

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"WorkPulse sengaja tidak membuat alur pengajuan dan persetujuan cuti baru di dalam aplikasi agar HRGA dan atasan tidak perlu input dua kali dengan prosedur HR yang sudah berjalan di kantor. Begitu cuti sudah disetujui di jalur kantor, HRGA cukup mencatatnya satu pintu di sini dan akun karyawan otomatis dibebaskan — lengkap dengan pagar pengaman untuk menolak cuti akhir pekan (0 hari kerja), jadwal bentrok, serta pengajuan Cuti Tahunan bagi anak magang."*

- **🖱️ Langkah Klik & Input:**

  1. **Buka Menu `Pencatatan Cuti Resmi` di `Jendela 4 — Dewi (HRGA)` (`/admin/leaves`):**
     - Di sidebar kiri, klik menu **`Pencatatan Cuti Resmi`** (`/admin/leaves`).
     - Tunjuk tabel di panel kanan di mana seluruh catatan langsung berstatus **`Disetujui`**, termasuk **`Raka Pratama` (`Izin Resmi`)** dan **`Gilang Ramadhan` (`Cuti Tahunan`)**.

  2. **`[CABANG]` Uji 3 Pagar Pengaman di Form Kiri `Catat Cuti Resmi Baru` (Tanpa Merusak Data):**

     - **Pagar 1 — Uji Tanggal Selesai Tidak Bisa Mundur & Tolak Cuti Akhir Pekan (`0 Hari Kerja`):**
       - **Karyawan \*:** Pilih **`Intan Permata (staff.finance@dutamedia.com)`**
       - **Tanggal Mulai \*:** Pilih **tanggal hari ini**
       - Buka kalender **Tanggal Selesai \*** → tunjukkan tanggal sebelum hari ini otomatis terkunci tidak bisa dipilih.
       - Sekarang ubah **Tanggal Mulai \*** dan **Tanggal Selesai \*** ke hari **Sabtu dan Minggu minggu ini**.
       - **Jenis Cuti / Izin \*:** Pilih **`Cuti Tahunan`**
       - **Keterangan Resmi / Dasar Persetujuan \*:**
         ```text
         Tes akhir pekan
         ```
       - Klik tombol **`Daftarkan Cuti Resmi`**.
       - **👀 Tunjukkan di layar:** Ditolak merah karena rentang Sabtu–Minggu bernilai **0 hari kerja**.

     - **Pagar 2 — Uji Tolak Bentrok Jadwal Cuti Aktif:**
       - **Karyawan \*:** Pilih **`Gilang Ramadhan (specialist.it@dutamedia.com)`**
       - **Tanggal Mulai \*:** Pilih **tanggal hari ini**
       - **Tanggal Selesai \*:** Pilih **tanggal hari ini**
       - **Jenis Cuti / Izin \*:** Pilih **`Cuti Tahunan`**
       - **Keterangan Resmi / Dasar Persetujuan \*:**
         ```text
         Tes bentrok cuti
         ```
       - Klik tombol **`Daftarkan Cuti Resmi`**.
       - **👀 Tunjukkan di layar:** Ditolak merah karena bentrok dengan jadwal cuti aktif Gilang hari ini.

     - **Pagar 3 — Uji Tolak Anak Magang (`Intern`) Mengambil `Cuti Tahunan`:**
       - **Karyawan \*:** Pilih **`Raka Pratama (intern.frontend@dutamedia.com)`**
       - **Tanggal Mulai \*:** Pilih **hari Senin depan**
       - **Tanggal Selesai \*:** Pilih **hari Senin depan**
       - **Jenis Cuti / Izin \*:** Pilih **`Cuti Tahunan`**
       - **Keterangan Resmi / Dasar Persetujuan \*:**
         ```text
         Tes hak cuti magang
         ```
       - Klik tombol **`Daftarkan Cuti Resmi`**.
       - **👀 Tunjukkan di layar:** Ditolak merah karena karyawan berstatus **`Intern`** hanya boleh dicatatkan `Sakit` atau `Izin Resmi`, bukan `Cuti Tahunan`.

  3. **`[INTI]` Catat Cuti Sakit Hari Ini untuk `Intan Permata` (Isi Seluruh Kolom dari Atas ke Bawah):**
     - **Karyawan \*:** Pilih **`Intan Permata (staff.finance@dutamedia.com)`**
     - **Tanggal Mulai \*:** Pilih **tanggal hari ini**
     - **Tanggal Selesai \*:** Pilih **tanggal hari ini**
     - **Jenis Cuti / Izin \*:** Pilih **`Sakit`**
     - **Keterangan Resmi / Dasar Persetujuan \* (min. 5 karakter):**
       ```text
       Surat sakit dari klinik, sudah ACC atasan & HRGA
       ```
     - Klik tombol **`Daftarkan Cuti Resmi`**.

  4. **⚡ Buktikan Efeknya Secara Langsung di `Jendela 5 (Incognito)`:**
     - Login di `/login` sebagai **Intan Permata**:
       - **Email Perusahaan:**
         ```text
         staff.finance@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```
     - **👀 Tunjukkan di layar:**
       - Halaman `/daily/morning`, tab `2. Additional Work`, dan tab `3. EOD Outcome` milik Intan **langsung terkunci hijau** menampilkan **`Masa Cuti Resmi (Cuti Sakit)`**.
       - Buka menu **`Riwayat Saya`** (`/daily/history`) → catatan cuti sakitnya langsung tampil di panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
       - Lencana notifikasi di pojok kanan atas juga langsung bertambah.

- **💬 Kalimat Penutup Singkat:**  
  *"Seketika setelah dicatat HRGA, seluruh halaman harian karyawan terkunci aman dan notifikasi langsung masuk ke akun yang bersangkutan."*

---

#### `5B [INTI]` HRGA Mengedit & Menghapus Catatan Cuti Agar Jadwal Karyawan Aktif Kembali

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (masih `Intan Permata`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input:**

  1. **Edit Catatan Cuti Intan di `Jendela 4 — Dewi (HRGA)` (`/admin/leaves`):**
     - Pada tabel kanan baris **`Intan Permata`**, klik tombol **`Edit`**.
     - Di formulir kiri (`Edit Catatan Cuti Resmi`), ubah kolom **`Keterangan Resmi / Dasar Persetujuan *`** menjadi:
       ```text
       Surat sakit dari klinik, sudah ACC atasan & HRGA (revisi HRGA)
       ```
     - Klik tombol **`Simpan Perubahan Cuti`**.

  2. **Hapus Catatan Cuti Intan di `Jendela 4 — Dewi (HRGA)` (`/admin/leaves`):**
     - Masih pada baris **`Intan Permata`**, klik tombol **`Hapus`**.
     - Di jendela konfirmasi **`Hapus Catatan Cuti Resmi?`**, klik tombol **`Ya, Hapus Catatan`**.

  3. **⚡ Buktikan Formulir Pagi Intan Aktif Kembali di `Jendela 5` (`/daily/morning`):**
     - Pindah ke **`Jendela 5 — Intan Permata`**, klik menu **`My Today`** (`/daily/morning`), lalu tekan **`F5`**.
     - **👀 Tunjukkan di layar:** Spanduk cuti hilang dan formulir komitmen pagi Intan langsung terbuka normal kembali!

- **💬 Kalimat Penutup Singkat:**  
  *"Kalau ada salah tanggal atau batal cuti, HRGA cukup edit atau hapus di sini dan jadwal check-in karyawan langsung aktif kembali."*

---

#### `5C [INTI]` HRGA Mendaftarkan Dispensasi Dinas Luar, Menguji Pengecualian Permanen, Lalu Menghapusnya

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (masih `Intan Permata`)**
- **🔄 Perpindahan Akun:**
  - **✅ Tanpa Ganti Akun** selama langkah berlangsung
  - **🚪 Di Akhir Langkah `5C`:** Klik **`Keluar Sesi`** Intan di **Jendela 5**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Dispensasi seperti Dinas Luar, pelatihan sertifikasi, atau penugasan khusus eksekutif dipisahkan dari 0 Komitmen karena ini adalah penugasan resmi perusahaan berbasis surat tugas. Selain dispensasi bertanggal, kami juga menyediakan fitur **Pengecualian Permanen** (berlaku terus tanpa tanggal berakhir sampai diubah atau dihapus Admin): tujuannya jika ada individu atau peran tertentu yang memang dibebaskan seterusnya dari komitmen harian, HRGA/Admin tidak perlu menginput ulang berulang-ulang — menu komitmen harian & koreksinya otomatis disembunyikan, sementara `Lapor Blocker` sengaja tetap aktif supaya mereka tetap bisa melapor bila menghadapi kendala kerja."*

- **🖱️ Langkah Klik & Input:**

  1. **Buka Menu `Manajemen Dispensasi` di `Jendela 4 — Dewi (HRGA)` (`/exemptions`):**
     - Di sidebar kiri, klik menu **`Manajemen Dispensasi`** (`/exemptions`).
     - Tunjuk pada tabel kanan sudah ada contoh dispensasi **`Bayu Santoso` (`Dinas Luar`, `ST/HRGA/2026/XI/104`)**.

  2. **Daftarkan Dispensasi Bertanggal (`Dinas Luar`) untuk `Intan Permata`:**
     - Isi seluruh kolom pada form kiri **`Tambah Dispensasi Resmi`** dari atas ke bawah:
       - **Karyawan Penerima Dispensasi \*:** Pilih **`Intan Permata (staff.finance@dutamedia.com)`**
       - **Tanggal Mulai \*:** Pilih **tanggal hari ini**
       - **Tanggal Selesai \*:** Pilih **tanggal hari ini**
       - **Kotak centang `Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)`:** *(biarkan tidak dicentang dulu)*
       - **Kategori Pengecualian \*:** Pilih **`Dinas Luar (Penugasan Luar Kantor / Klien)`**
       - **Nomor Surat Tugas / Referensi (opsional):**
         ```text
         ST/HRGA/2026/XI/112
         ```
       - **Alasan Resmi Dispensasi \* (min. 5 karakter):**
         ```text
         Dampingi audit faktur dan rekonsiliasi pajak di kantor klien Surabaya
         ```
     - Klik tombol **`Daftarkan Dispensasi`**.

  3. **⚡ Buktikan Dispensasi Dinas Luar di `Jendela 5 — Intan Permata` (`/daily/morning`):**
     - Pindah ke **`Jendela 5 — Intan Permata`** (`/daily/morning`), lalu tekan **`F5`**.
     - **👀 Tunjukkan di layar:** Formulir harian Intan langsung terkunci dengan spanduk **`Masa Dispensasi Resmi (Dinas Luar)`**.

  4. **`[CABANG]` Ubah Dispensasi Intan Menjadi `Pengecualian Permanen` & Buktikan Menu Hariannya Disembunyikan:**
     - Kembali ke **`Jendela 4 — Dewi (HRGA)`** (`/exemptions`).
     - Pada baris **`Intan Permata`** di tabel kanan, klik tombol **`Edit`**.
     - Di form kiri (`Edit Dispensasi Resmi`):
       - Centang kotak **`Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)`** *(tunjukkan kolom **Tanggal Selesai** otomatis nonaktif)*.
       - Ubah **Kategori Pengecualian \*** menjadi **`Pengecualian Permanen (Bebas Komitmen Harian)`**.
       - Klik tombol **`Simpan Perubahan Dispensasi`**.
     - **👀 Tunjukkan di tabel kanan `/exemptions`:** Kolom Periode berubah menjadi **`Mulai [Tanggal Hari Ini] (Permanen)`**.
     - **⚡ Pindah ke `Jendela 5 — Intan Permata`**, lalu tekan **`F5`** (atau keluar & login ulang):
       - **👀 Tunjukkan di layar:**
         1. Di sidebar kiri, menu **`My Today`**, **`Koreksi Komitmen Pagi`**, dan **`Koreksi Evaluasi Sore`** **otomatis disembunyikan**.
         2. Menu **`Lapor Blocker`**, **`Riwayat Saya`**, dan **`Notifikasi`** **tetap aktif**.
         3. Klik bulatan profil **`IP`** di pojok kanan atas (`/profile`) → pada Kartu Identitas tertulis **`Pengecualian Permanen · Lapor Blocker tetap aktif`**.

  5. **Hapus Dispensasi Intan & Buktikan Menu Harian Intan Pulih Normal:**
     - Kembali ke **`Jendela 4 — Dewi (HRGA)`** (`/exemptions`).
     - Pada baris **`Intan Permata`**, klik tombol **`Hapus`**.
     - Di jendela konfirmasi **`Hapus Catatan Dispensasi?`**, klik tombol **`Ya, Hapus Dispensasi`**.
     - Pindah ke **`Jendela 5 — Intan Permata`**, tekan **`F5`** → tunjukkan menu **`My Today`** dan menu koreksi langsung muncul kembali di sidebar kiri.
     - Klik tombol **`Keluar Sesi`** di **Jendela 5**.

- **💬 Kalimat Penutup Singkat:**  
  *"Begitu pengecualian permanennya dihapus Admin atau HRGA, seluruh menu komitmen harian karyawan langsung aktif kembali."*

---

### BABAK 6 — Tindak Lanjut Kepatuhan HRGA & Catatan Pembinaan (Coaching) Atasan

---

#### `6A [INTI]` HRGA Menindaklanjuti Pola Terlambat Karyawan di Antrean Kepatuhan

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA — `/compliance`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Satu hal yang sangat kami jaga: WorkPulse tidak pernah menerbitkan SP atau memotong insentif secara otomatis, supaya sistem tidak menciptakan budaya takut. Satu kali lupa atau terlambat mengisi bukanlah sanksi. Baru ketika terbentuk pola berulang — misalnya 3 kali berturut-turut — sistem memunculkannya di Antrean Kepatuhan HRGA sebagai sinyal pembinaan berbasis fakta."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 4 — Dewi HRGA`):**

  1. **Buka Halaman Antrean Kepatuhan:**
     - Di sidebar kiri, klik menu **`Antrean Kepatuhan`** (`/compliance`).

  2. **Catat Tindak Lanjut untuk `Siti Rahma` (`Belum Ditangani` · `Pola Terlambat 3x`):**
     - Pada baris **`Siti Rahma`**, klik tombol **`Tindak Lanjut`**.
     - Di modal **`Catat Tindak Lanjut Kepatuhan`**:
       - **`[CABANG]` Uji batas minimal 5 karakter:** Ketik 2 huruf `ok` pada kolom **`Catatan Tindak Lanjut / Pembinaan *`** → tunjukkan tombol **`Simpan Tindak Lanjut`** masih terkunci nonaktif.
       - **`[INTI]` Isi catatan lengkap:**
         ```text
         Sudah diingatkan bareng Head Engineering, sepakat pasang pengingat browser jam 08.00 biar nggak lupa lapor pagi
         ```
       - Klik tombol **`Simpan Tindak Lanjut`**.

  3. **Perbarui Catatan pada Baris `Nadia Kusuma` (`Sudah Ditangani`):**
     - Pada baris **`Nadia Kusuma`**, klik tombol **`Ubah Catatan`**.
     - Di modal **`Perbarui Catatan Tindak Lanjut`**, tambahkan kalimat ` dan tidak berulang kembali.` di ujung teks **`Catatan Tindak Lanjut / Pembinaan *`**.
     - Klik tombol **`Simpan Tindak Lanjut`**.

- **💬 Kalimat Penutup Singkat:**  
  *"HRGA bisa mendokumentasikan hasil tindak lanjut atau memperbarui catatannya langsung sebagai riwayat pembinaan resmi."*

---

#### `6B [INTI]` Kepala Divisi Mencatat Bimbingan 1-on-1 untuk Bawahan (Dibagikan vs Rahasia Manajemen)

- **🪟 Jendela Aktif:** **Jendela 3 (`Arif Budiman` — Head Engineering — `/coaching`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kami memisahkan jelas kewenangan HRGA dengan atasan langsung: HRGA fokus pada pola kepatuhan di `/compliance`, sedangkan atasan langsung mencatat bimbingan atau apresiasi 1-on-1 di `/coaching`. Setiap catatan bisa dipilih untuk Dibagikan ke Karyawan, atau dikunci sebagai Rahasia Manajemen yang 100% terisolasi sehingga tidak pernah muncul di notifikasi maupun akun staf."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 3 — Arif Budiman`):**

  1. **Buka Halaman Catatan Coaching & Tinjau Riwayat Aditya:**
     - Di sidebar kiri, klik menu **`Catatan Coaching`** (`/coaching`).
     - Klik kartu **`Aditya Nugroho`** untuk menyaring riwayat di panel kanan.
     - **👀 Tunjukkan di panel kanan:** Sudah ada 2 contoh catatan dengan lencana **`Dibagikan ke Karyawan`** dan **`Rahasia Manajemen`**.

  2. **Buat Catatan Pembinaan Baru di Panel Kiri (`Catat Pembinaan Baru`):**
     - Isi seluruh kolom dari atas ke bawah:
       - **Karyawan yang Dituju \*:** Pilih **`Aditya Nugroho`**
       - **Jenis Catatan \*:** Klik kartu **`Bimbingan`**
       - **Tingkat Visibilitas \*:** Pilih **`Dibagikan ke Karyawan`**
       - **Isi Catatan Pembinaan \*:** Klik tombol template cepat **`Bimbingan 1-on-1`** *(kolom textarea otomatis terisi teks bimbingan 1-on-1)*
     - Klik tombol **`Simpan Catatan Pembinaan`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Atasan cukup memakai tombol template cepat untuk mencatat hasil sesi 1-on-1 dalam hitungan detik."*

---

### BABAK 7 — Pusat Notifikasi, Dashboard Pemantauan, Radar Proyek, & Laporan Eksekutif

---

#### `7A [INTI]` Membuktikan Privasi Catatan Rahasia, Sembunyinya Tautan Admin, & Notifikasi Lonceng Direktur

- **🪟 Jendela Aktif:** **Jendela 2 (`Aditya Nugroho` — `/notifications`)** & **Jendela 1 (`Hendra Wijaya` — Direktur)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di Pusat Notifikasi, sistem menjaga dua keamanan sekaligus: catatan `Rahasia Manajemen` tidak pernah bocor ke layar staf, dan tautan di dalam notifikasi — misalnya pemberitahuan perubahan kebijakan oleh Direktur — otomatis menyembunyikan tombol menuju `/admin/policies` bagi staf biasa agar karyawan tidak salah klik menuju halaman `403`."*

- **🖱️ Langkah Klik & Input:**

  1. **Cek Pusat Notifikasi Staf di `Jendela 2 — Aditya Nugroho` (`/notifications`):**
     - Di sidebar kiri, klik menu **`Notifikasi`** (`/notifications`).
     - **👀 Bukti 1 (Isolasi Catatan Rahasia):** Tunjukkan notifikasi catatan pembinaan **`Dibagikan ke Karyawan`** muncul, sedangkan catatan **`Rahasia Manajemen`** sama sekali tidak pernah muncul di akun Aditya.
     - **👀 Bukti 2 (Tautan Halaman Admin Disembunyikan Otomatis):** Klik kartu notifikasi **`Perubahan Kebijakan Operasional`** → tunjukkan angka merah di sidebar **`Notifikasi`** & lonceng atas langsung **berkurang 1**, dan tombol menuju halaman `/admin/policies` **otomatis disembunyikan** karena Aditya bukan Admin/Direktur.
     - Klik sebentar tab **`Pengaturan Kanal & Perangkat`** dan tunjuk tombol **`Tandai semua dibaca`**.

  2. **Cek Akses Notifikasi Lonceng Direktur di `Jendela 1 — Direktur`:**
     - Pindah ke **`Jendela 1 — Direktur`**.
     - Klik **ikon lonceng di pojok kanan atas (TopBar)** untuk menunjukkan bahwa Direktur tetap menerima dan membuka halaman **`Notifikasi`** (`/notifications`) langsung dari lonceng atas meskipun tidak memiliki menu `Workspace` di sidebar.

---

#### `7B [INTI]` Membandingkan Tampilan Dashboard Kepala Divisi vs Direktur (Seluruh Perusahaan)

- **🪟 Jendela Aktif:** **Jendela 3 (`Arif Budiman` — Head Engineering)** & **Jendela 1 (`Hendra Wijaya` — Direktur)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Dashboard ini kami rancang fokus menyoroti kendala dan anggota yang butuh perhatian, bukan papan peringkat jumlah tugas, supaya karyawan tidak terjebak mengejar jumlah tugas palsu demi skor. Aksesnya juga terisolasi ketat per peran: Head hanya melihat divisinya sendiri, sedangkan Direktur melihat gambaran seluruh perusahaan — lengkap dengan pemisahan antara jumlah karyawan aktif dan karyawan yang benar-benar wajib lapor hari itu."*

- **🖱️ Langkah Klik & Input:**

  1. **Lihat Isolasi Divisi di `Jendela 3 — Arif Budiman` (`/dashboard`):**
     - Di sidebar kiri **Jendela 3**, klik menu **`Dashboard`** (`/dashboard`).
     - **👀 Tunjukkan di layar:** Pilihan cakupan data terkunci pada **`Divisi Saya`** (`Engineering`) sehingga Kepala Divisi tidak bisa mengintip data divisi lain.

  2. **Lihat Cakupan Seluruh Perusahaan & Filter `Intern` di `Jendela 1 — Direktur` (`/dashboard`):**
     - Pindah ke **`Jendela 1 — Direktur`**, lalu klik menu **`Dashboard`** (`/dashboard`) di sidebar kiri.
     - **👀 Tunjukkan di layar:** Cakupan **`Seluruh Perusahaan`** menampilkan **25 karyawan aktif** (setelah Budi Santoso aktivasi di Babak 1) dan **24 karyawan wajib lapor** (karena 1 orang — Gilang Ramadhan — sedang cuti resmi hari ini).
     - Pada dropdown filter **`Status Karyawan`**, pilih **`Intern`** → tunjukkan tabel langsung menyaring hanya 2 anak magang (**`Raka Pratama`** & **`Nisa Amelia`**).
     - Kembalikan filter ke **`Semua Status Karyawan`**.

---

#### `7C [INTI]` Kepala Divisi Memantau Kesehatan Proyek & Kendala Kritis di Radar Risiko Proyek

- **🪟 Jendela Aktif:** **Jendela 3 (`Arif Budiman` — Head Engineering — `/projects/risk`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input (Semua di `Jendela 3 — Arif Budiman`):**
  1. Di sidebar kiri, klik menu **`Radar Risiko Proyek`** (`/projects/risk`).
  2. Ketik `Engineering` pada kotak pencarian proyek.
  3. Pada baris proyek **`WP-CORE (WorkPulse Platform Core 2026)`**, klik tombol **`Rincian`**.
  4. **👀 Tunjukkan di layar:** Skor kesehatan proyek, sorotan kendala `CRITICAL` yang lewat batas waktu, serta tombol **`Buka Antrean Blocker Terkait`**.

---

#### `7D [INTI]` Direktur Meninjau Laporan Eksekutif, Menguji Filter Status, & Mengunduh CSV/PDF

- **🪟 Jendela Aktif:** **Jendela 1 (`Hendra Wijaya` — Direktur — `/reports`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input (Semua di `Jendela 1 — Direktur`):**
  1. Di sidebar kiri, klik menu **`Laporan Eksekutif`** (`/reports`).
  2. Klik tombol rentang waktu secara berurutan: **`Hari Ini`** → **`Pekan Ini`** → **`Bulan Ini`** → **`Kuartal Ini`**.
  3. **`[CABANG]` Uji Penyaring Status Karyawan Kosong:**
     - Pada filter status karyawan, klik **`Kontrak`**.
     - **👀 Tunjukkan di layar:** Muncul pesan kosong yang rapi **`"Belum ada data karyawan untuk penyaring yang dipilih."`**
     - Klik kembali filter **`Semua`**.
  4. Klik tombol **`Unduh Laporan (CSV)`** dan tunjuk tombol **`Cetak / PDF`** di sebelahnya.

---

### BABAK 8 — Pengaturan Master Data, Struktur Organisasi, Delegasi, & Kanal Notifikasi

---

#### `8A [CABANG]` HRGA Menonaktifkan & Mengaktifkan Kembali Akun Karyawan

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA — `/admin/users`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input (Semua di `Jendela 4 — Dewi HRGA`):**
  1. Di sidebar kiri, klik menu **`Pengguna & Peran`** (`/admin/users`).
  2. Pada baris **`Budi Santoso`**, klik tombol **`Nonaktifkan`**.
  3. Di jendela konfirmasi, klik tombol **`Ya, Nonaktifkan Akun`** (status berubah menjadi **`Nonaktif`** dan sesi aktifnya otomatis diputus).
  4. Masih pada baris **`Budi Santoso`**, klik tombol **`Aktifkan Kembali`**, lalu klik **`Ya, Aktifkan Kembali`** (status kembali **`Aktif`**).
  5. Tunjuk baris **`Dewi Lestari`** sendiri yang bertanda **`Akun Anda`** (tidak ada tombol nonaktifkan agar admin tidak bisa mengunci akunnya sendiri).

---

#### `8B [INTI]` HRGA Mengelola Struktur Organisasi, Aturan Anti-Siklus, Status Magang, & Wewenang Proyek

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA — `/admin/organization`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Tata kelola organisasi dijaga oleh tiga pagar pengaman. Pertama, seluruh perubahan jabatan atau atasan berlaku mulai hari ini ke depan (anti-backdating) agar konteks laporan masa lalu tetap jujur sesuai kondisi saat itu. Kedua, sistem menolak penugasan melingkar dan menolak Project Manager merangkap Escalation Reviewer di proyek yang sama demi prinsip check-and-balance. Ketiga, akun Intern otomatis dikecualikan dari peran atasan, PM, maupun Reviewer sampai resmi diangkat menjadi karyawan tetap."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 4 — Dewi HRGA` pada `/admin/organization`):**

  1. **Buka Menu `Struktur Organisasi` (`/admin/organization`):**
     - Di sidebar kiri, klik menu **`Struktur Organisasi`** (`/admin/organization`).

  2. **Tab 1 (`Struktur & Penugasan Karyawan`) — Uji Filter Magang, Anti-Siklus Atasan Melingkar, & Pratinjau Angkat `Intern`:**
     - Klik tombol **`Atur Penugasan Baru`** di kanan atas.
     - Di modal **`Atur Penugasan Organisasi`**:
       - **👀 Bukti 1 (Anak Magang Tidak Bisa Jadi Atasan):** Buka dropdown **`Atasan Langsung (Direct Manager)`** → tunjukkan bahwa nama anak magang (**`Raka Pratama`** & **`Nisa Amelia`**) tidak muncul di daftar pilihan atasan.
       - **👀 Bukti 2 (`[CABANG]` Uji Tolak Siklus Atasan Melingkar):** Isi seluruh kolom modal dari atas ke bawah:
         - **Karyawan:** Pilih **`Arif Budiman (head.eng@dutamedia.com)`**
         - **Nama Jabatan (Job Title) \*:**
           ```text
           Head of Engineering
           ```
         - **Status Karyawan:** Pilih **`Karyawan Tetap`**
         - **Peran Jabatan:** Pilih **`Head / Kepala Divisi`**
         - **Fungsi / Divisi:** Pilih **`Engineering`**
         - **Atasan Langsung (Direct Manager):** Pilih **`Aditya Nugroho (Senior Frontend Developer)`** *(bawahannya sendiri!)*
         - **Tanggal Efektif Penugasan:** *(biarkan otomatis tanggal hari ini)*
         - **Alasan Penugasan (Audit Log) \*:**
           ```text
           Tes cek validasi atasan melingkar
           ```
         - Klik tombol **`Simpan Penugasan`** → **ditolak merah** karena sistem mendeteksi siklus garis atasan melingkar!
       - **👀 Bukti 3 (Pratinjau Pengangkatan Anak Magang Menjadi Karyawan Tetap):**
         - Masih di modal yang sama, ubah dropdown **Karyawan** ke **`Raka Pratama (intern.frontend@dutamedia.com)`**, lalu ubah **Status Karyawan** ke **`Karyawan Tetap`**.
         - Jelaskan bahwa saat anak magang diangkat menjadi karyawan tetap, hak jabatan struktural & cuti tahunannya langsung terbuka tanpa merusak riwayat magang masa lalunya.
         - Klik tombol **`Batal`** untuk menutup modal.

  3. **Tab 2 (`Kewenangan Proyek (Project Authority)`) — Uji Tolak `Project Manager = Escalation Reviewer`:**
     - Klik tab **`Kewenangan Proyek (Project Authority)`**.
     - Klik tombol **`Tetapkan Wewenang Proyek`**.
     - Di modal **`Tetapkan Kewenangan Proyek`**:
       - Buka dropdown **`Project Manager *`** & **`Escalation Reviewer *`** → tunjukkan akun **`Intern`** tidak muncul di daftar pilihan.
       - **`[CABANG]` Uji tolak PM merangkap Escalation Reviewer di proyek yang sama:** Isi seluruh kolom dari atas ke bawah:
         - **Kode Proyek \*:**
           ```text
           WP-CORE
           ```
         - **Nama Proyek \*:**
           ```text
           WorkPulse Platform Core 2026
           ```
         - **Project Manager \*:** Pilih **`Arif Budiman (Head of Engineering)`**
         - **Escalation Reviewer \*:** Pilih **`Arif Budiman (Head of Engineering)`** *(orang yang sama)*
         - **Fungsi Terlibat:** Pastikan **`Engineering`** tercentang
         - **Tanggal Efektif:** *(biarkan otomatis tanggal hari ini)*
         - **Alasan Penunjukan (Audit Log) \*:**
           ```text
           Tes validasi PM dan Reviewer tidak boleh orang yang sama
           ```
       - Klik tombol **`Tetapkan Proyek`** → **ditolak merah** (`"Project Manager dan Escalation Reviewer tidak boleh dijabat oleh orang yang sama."`).
       - Klik tombol **`Batal`**.
     - Klik sebentar tombol **`Tutup Wewenang`** pada salah satu kartu proyek untuk menunjukkan modal konfirmasi penutupan proyek wajib mengisi alasan, lalu klik **`Batal`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Seluruh pagar pengaman struktur organisasi dan proyek menjaga pemisahan wewenang serta keutuhan data historis."*

---

#### `8C [INTI]` HRGA Mendelegasikan Reviewer Sementara, Membuktikan Akses Login Pengganti, Lalu Mencabutnya

- **🪟 Jendela Aktif:** **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (Incognito)**
- **🔄 Perpindahan Akun:**
  - **Login di Jendela 5:** `lead.creative@dutamedia.com` (**Rian Kurniawan**, `Password123!`)
  - **🚪 Di Akhir Langkah `8C`:** Klik **`Keluar Sesi`** Rian di **Jendela 5**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Jika seorang pimpinan divisi berhalangan atau sedang dinas dan ingin menunjuk pengganti sementara dari level di bawahnya atau divisi lain, tidak boleh hanya lewat pesan lisan — wajib lewat mandat Reviewer Sementara berbatas tanggal di sini. Akses review koreksi dan antrean blocker otomatis terbuka selama masa delegasi tanpa mengubah struktur permanen, dan langsung tertutup seketika saat dicabut."*

- **🖱️ Langkah Klik & Input:**

  1. **Terbitkan Delegasi Reviewer Sementara di `Jendela 4 — Dewi (HRGA)` (`/admin/temporary-reviewers`):**
     - Di sidebar kiri, klik menu **`Reviewer Sementara`** (`/admin/temporary-reviewers`).
     - Klik tombol **`Delegasikan Reviewer Baru`**.
     - Isi seluruh kolom pada modal **`Delegasikan Reviewer Sementara`** dari atas ke bawah:
       - **1. Pejabat yang Berhalangan (Yang Digantikan) \*:** Pilih **`Gunawan Setiawan — Head of Operations & Infrastructure (Operations & Infrastructure)`**
       - **2. Divisi Wewenang Peninjauan (Otomatis):** *(otomatis terisi `Operations & Infrastructure`)*
       - **3. Pejabat Pengganti Sementara (Penerima Delegasi) \*:**
         - Buka dropdown-nya → tunjukkan bahwa **`Sistem Administrator`** dan anak magang (**`Intern`**) tidak muncul di daftar pilihan.
         - Pilih **`Rian Kurniawan — Creative & UI/UX Lead (Engineering)`**.
       - **Tanggal Efektif Mulai \*:** Pilih **tanggal hari ini**
       - **Batas Tanggal Kedaluwarsa \*:** Pilih **tanggal besok**
       - **Alasan Delegasi (Audit Trail) \*:**
         ```text
         Gantikan review koreksi dan eskalasi kendala selama Head Ops audit luar kota
         ```
     - Klik tombol **`Terbitkan Delegasi`** (status baris menjadi hijau **`Aktif`**).

  2. **⚡ Buktikan Menu Review Terbuka di Akun `Rian Kurniawan` pada `Jendela 5 (Incognito)`:**
     - Login di `/login` sebagai **Rian Kurniawan**:
       - **Email Perusahaan:**
         ```text
         lead.creative@dutamedia.com
         ```
       - **Kata Sandi:**
         ```text
         Password123!
         ```
     - **👀 Tunjukkan di layar:** Meskipun peran dasar Rian adalah `SUPERVISOR`, di sidebar kiri langsung terbuka menu **`Review Koreksi`** (`/corrections/review`), **`Antrean Blocker`** (`/blockers`), dan **`Penuaan & Eskalasi`** (`/blockers/aging`).
     - Klik tombol **`Keluar Sesi`** di **Jendela 5**.

  3. **Cabut Wewenang Reviewer Sementara dari `Jendela 4 — Dewi (HRGA)` (`/admin/temporary-reviewers`):**
     - Kembali ke **`Jendela 4 — Dewi (HRGA)`** (`/admin/temporary-reviewers`).
     - Pada baris delegasi **`Rian Kurniawan`**, klik tombol **`Cabut`**.
     - Di modal **`Cabut Wewenang Reviewer Sementara`**, isi kolom **`Alasan Pencabutan Wewenang *`:**
       ```text
       Head Ops sudah balik kantor dan aktif bertugas lagi
       ```
     - Klik tombol **`Cabut Wewenang Sekarang`**.

- **💬 Kalimat Penutup Singkat:**  
  *"Wewenang pengganti sementara langsung berhenti detik itu juga setelah dicabut."*

---

#### `8D [CABANG]` Membandingkan Hak Kelola Pemilik Kebijakan antara Direktur dan HRGA

- **🪟 Jendela Aktif:** **Jendela 1 (`Hendra Wijaya` — Direktur)** & **Jendela 4 (`Dewi Lestari` — HRGA)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kewenangan mengatur aturan sistem sengaja dibagi ke beberapa Pemilik Kebijakan sesuai kategorinya — bukan dipegang tunggal oleh satu Admin. Setiap kategori tidak boleh dibiarkan kosong tanpa pemilik aktif, dan tanggal mulai berlaku kebijakan maupun penugasan pemilik tidak pernah bisa diubah surut ke masa lampau."*

- **🖱️ Langkah Klik & Input:**
  1. Di **`Jendela 1 — Direktur`**, klik menu **`Kebijakan & Cut-off`** (`/admin/policies`) di sidebar kiri.
  2. Gulir ke bagian **`Penugasan Pemilik Kebijakan (Policy Owners)`** → tunjukkan Direktur memiliki tombol **`+ Tetapkan Pemilik`**, **`Ubah`**, dan **`Cabut`** (sistem otomatis menolak jika seseorang mencoba mencabut pemilik aktif terakhir pada suatu kategori), serta tombol **`Unduh Audit CSV`** di bagian bawah.
  3. Bandingkan dengan **`Jendela 4 — Dewi (HRGA)`** di menu **`Kebijakan & Cut-off`** (`/admin/policies`): tunjukkan HRGA hanya bisa membuat versi kebijakan pada kategori yang menjadi wewenangnya, sedangkan tabel penugasan pemilik di bawahnya terkunci **`Hanya Lihat (Direktur/Admin)`**.

---

#### `8E [INTI]` Direktur Memeriksa Status Saluran Notifikasi & Melakukan Uji Kirim

- **🪟 Jendela Aktif:** **Jendela 1 (`Hendra Wijaya` — Direktur — `/admin/notifications`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kami menampilkan status seluruh kanal notifikasi secara jujur di sini: pusat notifikasi dalam aplikasi sudah aktif penuh, sementara Email dan Browser Push ditampilkan dalam Mode Simulasi Aktif selama kunci server email resmi perusahaan belum dihubungkan — sehingga tidak ada status pengiriman luar yang dipalsukan, dan admin bisa langsung menguji pengirimannya."*

- **🖱️ Langkah Klik & Input (Semua di `Jendela 1 — Direktur`):**
  1. Di sidebar kiri, klik menu **`Saluran Notifikasi`** (`/admin/notifications`).
  2. Tunjuk **3 kartu status saluran** di bagian atas (**`In-App: Aktif`**, **`Email: Mode Simulasi Aktif`**, **`Browser Push: Mode Simulasi Aktif`**) dan tabel **`Matriks Routing Kanal Per Trigger Event`** (9 skenario).
  3. Gulir ke panel **`Instrumen Uji Pengiriman Kanal Notifikasi`**, lalu isi ketiga kolom dari kiri ke kanan:
     - **Pilih Kanal Uji:** Pilih **`Pusat Notifikasi In-App`**
     - **Skenario Event:** Pilih **`BLOCKER_RAISED`**
     - **Target Penerima (Email / Identitas):**
       ```text
       dev.frontend@dutamedia.com
       ```
  4. Klik tombol **`Kirim Notifikasi Uji Coba`**.
  5. **👀 Tunjukkan di layar:** Hasil pengiriman langsung tercatat di tabel **`Log Pengiriman Uji Coba Terbaru`** di bagian bawah.

---

### BABAK 9 — Penutupan: Direktur Mengembalikan Jam Cut-Off ke Jadwal Standar Kantor

- **🪟 Jendela Aktif:** **Jendela 1 (`Hendra Wijaya` — Direktur — `/admin/policies`)**
- **🔄 Perpindahan Akun:** **✅ Tanpa Ganti Akun**

- **🖱️ Langkah Klik & Input (Semua di `Jendela 1 — Direktur`):**
  1. Di sidebar kiri, klik menu **`Kebijakan & Cut-off`** (`/admin/policies`).
  2. Klik tombol **`+ Buat Versi Kebijakan Baru`** di kanan atas.
  3. Isi seluruh kolom pada modal **`Buat Versi Kebijakan Baru`** dari atas ke bawah:
     - **Kategori Kebijakan \*:** Biarkan **`1. Jam Kerja & Batas Waktu Check-In (Check-In Timing)`**
     - **Batas Tepat Waktu Pagi \*:** Ketik `09:00`
     - **Batas Kunci Pengisian Pagi (Cut-Off) \*:** Ketik `09:30`
     - **Batas Tepat Waktu Sore (EOD) \*:** Ketik `17:00`
     - **Batas Kunci Pengisian Sore (Cut-Off) \*:** Ketik `21:00`
     - **Tanggal Mulai Berlaku \*:** *(biarkan otomatis terisi tanggal hari ini)*
     - **Tanggal Berakhir (Opsional):** *(biarkan kosong)*
     - **Alasan Perubahan Kebijakan \*:**
       ```text
       Kembalikan jam cut-off pagi ke jadwal normal kantor setelah demo selesai
       ```
  4. Klik tombol **`Simpan & Terapkan Versi Baru`**.
  5. **👀 Tunjukkan di layar:** Baris perubahan kebijakan terbaru langsung tercatat lengkap di tabel **`Jejak Audit Perubahan Kebijakan (Policy Audit Trail)`**.

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
