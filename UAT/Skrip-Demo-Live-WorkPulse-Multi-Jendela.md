# SKRIP DEMO LIVE WORKPULSE — MULTI-JENDELA (100% SEMUA ALUR & KONDISI)

**Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Password Semua Akun Uji:** `Password123!` · **Zona Waktu:** WIB (`Asia/Jakarta`)

> **Cara Pakai Skrip Ini:**
> - **Bahasa obrolan sehari-hari & langsung klik:** Semua nama menu, tombol, pesan layar, dan teks isian sudah persis cocok dengan aplikasi. Tinggal ikuti urutannya.
> - **Arti `🪟 Jendela & Akun`:** Penunjuk langsung di setiap langkah agar tidak bingung — menjelaskan jendela Chrome mana saja yang dipakai terbuka bersamaan, kapan **`✅ Tanpa Ganti Akun`**, kapan harus **`🔄 Ganti Akun`**, dan kapan **`🚪 Keluar Sesi`**.
> - **Arti `🎯 Sampaikan di Awal (Alasan & Aturan Sistem)`:** Naskah singkat (±2–3 kalimat padat untuk petinggi perusahaan) yang paling tepat disampaikan **tepat saat mulai masuk ke langkah/halaman tersebut** sebelum mulai mengklik, agar audiens langsung paham *mengapa* aturan itu dirancang demikian dan *bagaimana* sistem menegakkannya.
> - **Arti `[INTI]` vs `[CABANG]`:**
>   - **`[INTI]`** = alur utama dari awal sampai akhir (±30–35 menit). Tetap nyambung 100% meski semua `[CABANG]` dilewati.
>   - **`[CABANG]`** = variasi lain, validasi error (`400`/`403`/`404`/`409`/`422`), dan kasus khusus (total ±55–60 menit kalau dijalankan semua). Semua cabang ditaruh **sebelum tombol kirim** atau pakai **akun/tiket terpisah**, jadi **100% aman jalan lurus dari Babak 1 ke Babak 9 tanpa reset database di tengah demo**.

---

## 1. PETA 5 JENDELA CHROME (MAKSIMAL 5 BERSAMAAN)

Buka maksimal 5 jendela Chrome (boleh 4 profil Chrome + 1 Incognito) biar minim keluar-masuk akun:

| Jendela | Akun Login Awal (`Password123!`) | Halaman Awal | Ringkasan Perpindahan Akun |
|---|---|---|---|
| **Jendela 1** | `direktur@dutamedia.com` — **Hendra Wijaya** (`CEO_MANAGEMENT`) | `/admin/policies` | **0x ganti akun** (Babak `2A`, `7A`, `7B`, `7D`, `8D`, `8E`, `9`) |
| **Jendela 2** | `product@dutamedia.com` — **Bagas Saputra** (`PROJECT_MANAGER`) | `/daily/morning` | **`Bagas`** (`2A`–`2G`) → **`🔄 3B: Reza`** (`network.infra@`) → **`🔄 3C–7A: Aditya`** (`dev.frontend@`) |
| **Jendela 3** | `head.eng@dutamedia.com` — **Arif Budiman** (`HEAD` Engineering) | `/dashboard` | **0x ganti akun** (Babak `3C`, `3E`, `4B`, `6B`, `7B`, `7C`) |
| **Jendela 4** | `hrga@dutamedia.com` — **Dewi Lestari** (`HRGA`) | `/admin/users` | **0x ganti akun** (Babak `1A`, `5A`–`5C`, `6A`, `8A`–`8D`) |
| **Jendela 5 (Incognito)** | Akun tamu & cabang terpisah (selalu keluar sesi tiap selesai) | `/login` | **`1A–1B: Budi`** → **`2B: Nadia`** → **`2D: Gilang`** → **`3A–3B: Raka`** → **`5A–5C: Intan`** → **`8C: Rian`** |

### Jadwal Ganti Akun Sepanjang Demo (`Jendela 1, 3, 4 = 0x Ganti`)
| Momen Pindah | Jendela | Dari Akun | Ganti ke Akun (`Password123!`) | Dipakai Sampai |
|---|---|---|---|---|
| Awal Demo (Pra-Babak 1) | **J1–J4** | — | Login `Hendra` (**J1**), `Bagas` (**J2**), `Arif` (**J3**), `Dewi` (**J4**) sekaligus | J1, J3, J4 tetap sampai selesai |
| **Babak 1A–1B** | **J5** | kosong | Uji token `Budi` → aktivasi & login `budi.santoso@dutamedia.com` → selesai `1B` **Keluar Sesi** | Hanya Babak `1A`–`1B` |
| **Babak 2B & 2D** | **J5** | kosong | `2B`: `qa@dutamedia.com` (`Nadia`) → **Keluar** · `2D`: `specialist.it@dutamedia.com` (`Gilang`) → **Keluar** | Hanya langkah masing-masing |
| **Babak 3A** | **J5** | kosong | Login `intern.frontend@dutamedia.com` (**Raka**) | Tetap login sampai akhir `3B` → **Keluar** |
| **Babak 3B** | **J2** | `Bagas Saputra` | Keluar `Bagas` → Login `network.infra@dutamedia.com` (**Reza**) | Hanya Babak `3B` |
| **Babak 3C** | **J2** | `Reza Mahendra` | Keluar `Reza` → Login `dev.frontend@dutamedia.com` (**Aditya**) | Tetap login s/d **Babak 7A** |
| **Babak 5A–5C** | **J5** | kosong | Login `staff.finance@dutamedia.com` (**Intan**) | Tetap login `5A`–`5C` → akhir `5C` **Keluar** |
| **Babak 8C** | **J5** | kosong | Login `lead.creative@dutamedia.com` (**Rian**) → selesai **Keluar** | Hanya Babak `8C` |

---

## 2. DAFTAR AKUN DEMO & PERSIAPAN 2 MENIT SEBELUM MULAI

### A. Daftar Akun yang Dipakai Selama Demo (Semua Sandi: `Password123!`)
| Jendela | Nama & Jabatan di Layar | Email Login | Dipakai pada Babak |
|---|---|---|---|
| **Jendela 1** | **Hendra Wijaya** — Direktur Utama | `direktur@dutamedia.com` | Babak `2A`, `7A`, `7B`, `7D`, `8D`, `8E`, `9` |
| **Jendela 2** | **Bagas Saputra** — Product Manager<br>*(lalu ganti ke **Reza Mahendra**, lalu **Aditya Nugroho**)* | `product@dutamedia.com`<br>`network.infra@dutamedia.com`<br>`dev.frontend@dutamedia.com` | `Bagas`: Babak `2A`–`2G`<br>`Reza`: Babak `3B`<br>`Aditya`: Babak `3C`–`7A` |
| **Jendela 3** | **Arif Budiman** — Head of Engineering | `head.eng@dutamedia.com` | Babak `3C`, `3E`, `4B`, `6B`, `7B`, `7C` |
| **Jendela 4** | **Dewi Lestari** — HRGA & Corporate Legal Lead | `hrga@dutamedia.com` | Babak `1A`, `3A`, `5A`–`5C`, `6A`, `8A`–`8D` |
| **Jendela 5 (Incognito)** | Bergantian: **Budi Santoso** → **Nadia Kusuma** → **Gilang Ramadhan** → **Raka Pratama** → **Intan Permata** → **Rian Kurniawan** | `budi.santoso@dutamedia.com`<br>`qa@dutamedia.com`<br>`specialist.it@dutamedia.com`<br>`intern.frontend@dutamedia.com`<br>`staff.finance@dutamedia.com`<br>`lead.creative@dutamedia.com` | `Budi`: Babak `1A`–`1B`<br>`Nadia`: Babak `2B`<br>`Gilang`: Babak `2D`<br>`Raka`: Babak `3A`–`3B`<br>`Intan`: Babak `5A`–`5C`<br>`Rian`: Babak `8C` |

### B. Persiapan Singkat Sebelum Presentasi Dimulai
- [ ] Buka 5 jendela Chrome sesuai tabel di Bagian 1, lalu login **Jendela 1 sampai Jendela 4** lebih dulu (**Jendela 5 Incognito** biarkan terbuka di halaman `/login`).
- [ ] Di **Jendela 2 (`Bagas Saputra`)**, pastikan formulir komitmen pagi masih bersih (jika ada sisa ketikan latihan, klik **`Reset Draf`**).
- [ ] Nyalakan *Do Not Disturb* / *Focus Assist* di laptop sebelum mulai *share screen*.

---

## 3. RINGKASAN ALUR 9 BABAK DEMO

| Babak | Fokus Utama yang Ditunjukkan ke Audiens |
|---|---|
| **Babak 1** | HRGA mengundang karyawan baru (`Budi Santoso`), mencabut token lama hingga hangus, menerbitkan token baru, membuktikan login ditolak sebelum aktivasi, lalu aktivasi mandiri & cek halaman Profil. |
| **Babak 2** | Form pagi terkunci setelah lewat jam batas (`09:30 WIB`), Direktur melonggarkan jam batas secara langsung, laporan `0 Komitmen` (`Nadia`), siklus kerja harian lengkap (`Bagas`: Komitmen Pagi → Pekerjaan Tambahan → Evaluasi Sore dengan saran status `RED` vs pilihan `AMBER` → Riwayat Saya), serta bukti karyawan cuti (`Gilang`) otomatis bebas lapor harian. |
| **Babak 3** | Karyawan magang (`Raka`) melapor komitmen `RED` lewat tombol jalan pintas buat tiket blocker, bukti aturan cuti vertikal (`Gilang` cuti → otomatis naik ke atasannya `Gunawan` & tolak pilih manual `Gilang`), penanganan tiket oleh staf spesialis (`Reza`), bantuan lintas fungsi & Terima Risiko oleh Kepala Divisi (`Arif`), edit divisi tujuan & hapus tiket aktif (`Aditya`), serta Radar Penuaan & Eskalasi. |
| **Babak 4** | Karyawan (`Aditya`) mengajukan Koreksi Komitmen Pagi: Perubahan Minor (langsung diterapkan otomatis) dan Perubahan Material (ditolak dulu oleh Kepala Divisi `Arif`, direvisi cepat dari draf sebelumnya, lalu disetujui). |
| **Babak 5** | HRGA (`Dewi`) mencatat Cuti Resmi (uji tolak akhir pekan, bentrok jadwal, & cuti tahunan magang; catat cuti sakit `Intan`, edit, lalu hapus) serta mencatat Dispensasi Dinas Luar & Pengecualian Permanen (menu harian `Intan` hilang sementara `Lapor Blocker` tetap aktif, lalu dihapus hingga menu harian kembali normal). |
| **Babak 6** | HRGA (`Dewi`) mencatat tindak lanjut pola keterlambatan di Antrean Kepatuhan, dan Kepala Divisi (`Arif`) mencatat bimbingan 1-on-1 di Catatan Coaching (`Dibagikan ke Karyawan` vs `Rahasia Manajemen`). |
| **Babak 7** | Bukti keamanan Pusat Notifikasi (catatan rahasia tidak bocor ke staf & tombol halaman admin disembunyikan otomatis), perbandingan Dashboard Kepala Divisi vs Direktur, Radar Risiko Proyek, dan Laporan Eksekutif (CSV/PDF). |
| **Babak 8** | Pengelolaan akun pengguna (nonaktifkan & aktifkan kembali), Struktur Organisasi (tolak atasan melingkar & angkat anak magang), Kewenangan Proyek (tolak PM merangkap Reviewer), Delegasi Reviewer Sementara (`Rian`), Pemilik Kebijakan, dan Uji Kirim Notifikasi. |
| **Babak 9** | Direktur mengembalikan jam batas pengisian (Cut-Off) ke jadwal standar kantor (`09:00` / `09:30` & `17:00` / `21:00`) dan menunjukkan rekaman jejak auditnya. |

---

## 4. SKRIP 9 BABAK DEMO LIVE

---

### BABAK 1 — Pendaftaran Karyawan Baru, Uji Cabut & Kirim Ulang Token, serta Aktivasi Akun

#### `1A [INTI]` HRGA Menerbitkan Undangan 72 Jam & Membuktikan Pencabutan Token Secara Langsung
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — `hrga@dutamedia.com`)** & **Jendela 5 (Incognito — `/activate`)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"WorkPulse adalah sistem internal perusahaan, jadi sengaja tidak ada tombol daftar akun bebas dari luar, dan Admin atau HRGA pun tidak pernah membuatkan password untuk karyawan. Aksesnya hanya lewat undangan resmi berupa token 64 karakter sekali pakai yang berlaku 72 jam — kalau salah kirim atau bocor, token lama bisa langsung dicabut sehingga hangus dan diterbitkan ulang."*
- **Aksi (bolak-balik cepat J4 ↔ J5):**
  1. **Di `Jendela 4 — Dewi (HRGA)` (`/admin/users`):** Klik **`Undang Pengguna Baru`**, lalu isi seluruh kolom di modal **`Undang Pengguna Baru`** dari atas ke bawah:
     - **Nama Lengkap \*:** `Budi Santoso`
     - **Alamat Email Perusahaan \*:** `budi.santoso@dutamedia.com`
     - **Status Karyawan:** Pilih **`Karyawan Tetap`**
     - **Peran Awal (Role):** Pilih **`Karyawan`**
     - **Fungsi / Divisi:** Pilih **`Engineering`**
     - **Nama Jabatan (Job Title) \*:** `Backend Engineer`
     - Klik **`Terbitkan Undangan (72 Jam)`** → keluar kode token 64 karakter → klik **`Salin Token Aktivasi`** → **`Selesai`**.
  2. **⚡ Pindah ke `Jendela 5 (Incognito)`:** Buka `/login` → klik tab **`Aktivasi Akun`** (`/activate`) → tempel token tadi ke kolom **Token Aktivasi**.
     - *Lihat di layar:* Langsung muncul kartu pratinjau **`Budi Santoso · Engineering`** dengan tanda **`UNDANGAN AKTIF`** *(**JANGAN** klik `Aktifkan Akun Saya` dulu — ini untuk membuktikan token pertama memang aktif!)*.
  3. **Balik ke `Jendela 4 — Dewi (HRGA)`:** Pada baris `Budi Santoso`, klik **`Cabut`** → di modal `Cabut Undangan Aktivasi` klik **`Ya, Cabut Undangan`**.
     - *Lihat di layar:* Status berubah merah **`Dicabut`**. *(Opsional: klik sebentar menu **`Undangan Karyawan`** `/admin/invitations` di sidebar kiri untuk menunjukkan tabel riwayat status undangan, lalu kembali ke **`Pengguna & Peran`** `/admin/users`).*
  4. **⚡ Balik ke `Jendela 5 (/activate)`:** Tekan **`F5`** (refresh halaman), lalu tempel ulang **token lama** tadi ke kolom **Token Aktivasi**.
     - *Lihat di layar:* Langsung muncul kotak merah **`Undangan Tidak Berlaku`** — bukti nyata token yang sudah dicabut otomatis hangus!
  5. **Balik ke `Jendela 4 — Dewi (HRGA)` (`/admin/users`):** Pada baris `Budi Santoso`, klik **`Kirim Ulang`** → di modal `Kirim Ulang Undangan Aktivasi` klik **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** *(token baru ini yang dipakai di langkah `1B`)* → klik **`Selesai`**.
- **Bilang singkat:** *"Begitu diterbitkan ulang, token lama tetap mati dan hanya token terbaru yang berlaku."*

#### `1B [INTI]` Membuktikan Token Baru Aktif, Login Ditolak Sebelum Aktivasi, Aktivasi Akun, & Cek Profil
- **🪟 Jendela & Akun:** Pakai **Jendela 5 (Incognito)** · **🔄 Login Baru di J5:** aktivasi lalu login `budi.santoso@dutamedia.com` (`Password123!`) · **🚪 Selesai Langkah:** Klik **Keluar Sesi** di **J5**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Sekarang kita buktikan token barunya aktif, tapi selama karyawan belum menyelesaikan aktivasi dan membuat sandi pribadi, akunnya tetap ditolak saat mencoba masuk. Selain itu, kita sengaja tidak menyediakan fitur 'Lupa Kata Sandi' mandiri via email — pemulihan akun tetap dikendalikan lewat HRGA atau System Admin supaya keamanannya terjaga dan nggak bergantung ke server email luar."*
- **Aksi (semua di `Jendela 5 — Incognito`):**
  1. Di tab **`Aktivasi Akun`** (`/activate`): tempel **token baru** dari HRGA ke kolom **Token Aktivasi** → tunjuk kartu **`Budi Santoso · Engineering`** kembali bertanda **`UNDANGAN AKTIF`** *(**JANGAN** klik `Aktifkan Akun Saya` dulu — biarkan token baru masih tersimpan di clipboard)*.
  2. Pindah ke tab **`Masuk Sistem`** (`/login`): isi **Email Perusahaan** `budi.santoso@dutamedia.com` dan **Kata Sandi** `Password123!` → klik tombol **`Masuk ke Sistem`**.
     - *Lihat di layar:* Ditolak merah **`"Akun Anda belum diaktifkan..."`**. Tunjuk sekilas ikon mata (*Tampilkan/Sembunyikan sandi*), kotak centang `Ingat email di perangkat ini`, dan info kontak HRGA jika lupa sandi.
  3. Balik ke tab **`Aktivasi Akun`** (`/activate`):
     - **Token Aktivasi:** Tempel lagi **token baru** dari clipboard (muncul **`UNDANGAN AKTIF`**)
     - **Kata Sandi Baru:** Ketik `Password123!` *(tunjuk 3 syarat centang hijau + meteran `Sangat Kuat`)*
     - **Konfirmasi Kata Sandi Baru:** Ketik `Password123!`
     - Klik **`Aktifkan Akun Saya`** → muncul layar **`Aktivasi Berhasil!`**.
  4. Klik **`Lanjut ke Halaman Masuk`**, isi **Email Perusahaan** `budi.santoso@dutamedia.com` & **Kata Sandi** `Password123!` → klik **`Masuk ke Sistem`** → mendarat otomatis di `/daily/morning`.
  5. Klik bulatan inisial **`BS`** di pojok kanan atas (`/profile`): tunjukkan **1. Kartu Identitas & Penugasan Aktif**, ketik contoh `DutamediaBaru2026!` di kolom **Kata Sandi Baru** pada panel **2. Keamanan Akun & Ganti Kata Sandi** untuk menunjukkan 3 syarat centang hijau & kotak centang *Akhiri seluruh sesi aktif di perangkat lain* **(JANGAN klik `Simpan Kata Sandi Baru` agar sandi tetap `Password123!`)**, tunjuk panel **3. Ringkasan Kanal Notifikasi Perangkat Ini**, lalu klik tombol **`Keluar Sesi`** di pojok kanan atas.
- **Bilang singkat:** *"Setelah aktivasi mandiri dan bikin sandi pribadi, barulah karyawan bisa masuk ke halaman kerjanya dan mengatur keamanan akunnya sendiri."*

> **💬 Sampaikan Singkat (Pengecualian Admin & Direktur — Tidak Perlu Diuji Klik):**  
> *"Sebagai catatan tambahan sebelum lanjut ke Babak 2: hak akses setiap halaman dijaga di layar sekaligus di server. Khusus **System Admin** dan **Direktur**, seluruh menu `Workspace` harian memang dikecualikan dan dihilangkan dari sidebar karena keduanya bukan peserta wajib lapor komitmen harian — supaya metrik kepatuhan murni mengukur tim operasional, sedangkan notifikasinya tetap mudah diakses lewat ikon lonceng di pojok kanan atas."*

---

### BABAK 2 — Pengaturan Jam Cut-Off & Siklus Laporan Kerja Harian Lengkap

#### `2A [INTI]` Form Pagi Terkunci Lewat Jam Batas & Direktur Menggeser Jam Cut-Off
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Bagas Saputra` — `product@dutamedia.com`)** & **Jendela 1 (`Hendra Wijaya` — Direktur)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Aturan waktu lapor pagi dibagi tiga: Tepat Waktu, Terlambat di masa tenggang, dan Terkunci otomatis begitu melewati batas Cut-Off. Kenapa harus dikunci? Supaya komitmen pagi betul-betul mencerminkan rencana kerja di awal hari, bukan baru dikarang sore harinya. Tapi jam batasnya tidak kami matikan kaku di kode — Pemilik Kebijakan bisa mengaturnya kapan saja lengkap dengan jejak audit, dan karyawan yang terlewat tetap punya jalur pencatatan kerja siang lewat Additional Work."*
- **Aksi:**
  1. Di **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**:
     - Tunjukkan spanduk merah **`LOCKED (Pasca Cut-Off)`** karena waktu saat ini sudah melewati jam batas pagi standar kantor (`09:30 WIB`), sehingga formulir komitmen pagi terkunci.
  2. Klik tab **`2. Additional Work`** (`/daily/additional-work`) → tunjukkan formulir pekerjaan tambahan tetap terbuka dengan pilihan alasan otomatis **`Komitmen Pagi Terlewat`**. Lalu kembali klik tab **`1. Morning Commitment`** (`/daily/morning`).
  3. Pindah ke **`Jendela 1 — Direktur` (`/admin/policies`)**:
     - Klik tombol **`+ Buat Versi Kebijakan Baru`**, lalu isi seluruh kolom di modal **`Buat Versi Kebijakan Baru`** dari atas ke bawah dengan angka berikut agar formulir pagi langsung terbuka untuk demo sore ini:
       - **Kategori Kebijakan \*:** Biarkan **`1. Jam Kerja & Batas Waktu Check-In (Check-In Timing)`**
       - **Batas Tepat Waktu Pagi \*:** Ketik `23:30`
       - **Batas Kunci Pengisian Pagi (Cut-Off) \*:** Ketik `23:45`
       - **Batas Tepat Waktu Sore (EOD) \*:** Ketik `23:50`
       - **Batas Kunci Pengisian Sore (Cut-Off) \*:** Ketik `23:59`
       - **Tanggal Mulai Berlaku \*:** *(biarkan otomatis terisi tanggal hari ini — tunjuk tanggal kemarin dikunci tidak bisa dipilih)*
       - **Tanggal Berakhir (Opsional):** *(biarkan kosong)*
       - **Alasan Perubahan Kebijakan \*:**
         ```text
         Geser jam batas pengisian sebentar untuk keperluan demo live WorkPulse
         ```
     - Klik **`Simpan & Terapkan Versi Baru`**.
  4. Balik ke **`Jendela 2 — Bagas Saputra` (`/daily/morning`)**, tekan **`F5`**.
- **Lihat di layar:** Status langsung berubah hijau **`ON-TIME`** dan formulir komitmen pagi terbuka. **⚡ Efek Lintas Jendela:** Lencana angka merah di menu sidebar **`Notifikasi`** & lonceng pojok kanan atas langsung menyala.
- **Bilang singkat:** *"Begitu Direktur simpan versi kebijakan baru, form karyawan langsung kebuka sesuai jadwal baru dan semua staf langsung dapat notifikasinya."*

#### `2B [CABANG]` Karyawan Melaporkan Hari Bebas Komitmen (0 Komitmen)
- **🪟 Jendela & Akun:** Pakai **Jendela 5 (Incognito)** · **🔄 Login di J5:** `qa@dutamedia.com` (**Nadia Kusuma**, `Password123!`) · **🚪 Selesai Langkah:** Klik **Keluar Sesi** di **J5**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Bagaimana kalau hari ini karyawan mengikuti pelatihan seharian atau agenda non-operasional tanpa target tugas harian biasa? Daripada memaksa mereka mengarang tugas palsu sekadar menggugurkan absen, sistem mengizinkan 0 Komitmen — syaratnya wajib isi alasan tertulis, dan statusnya dicatat netral sebagai Bebas Komitmen, bukan pelanggaran."*
- **Aksi:** Masuk sebagai `qa@dutamedia.com` di `/daily/morning`, lalu isi:
  - Centang kotak paling atas **`Hari ini tidak ada komitmen harian khusus (0 Komitmen)`** *(formulir slot komitmen di bawahnya otomatis disembunyikan dan muncul kotak alasan wajib)*.
  - **Alasan Tidak Menetapkan Komitmen (Wajib Diisi) \* (min. 10 karakter):**
    ```text
    Ikut pelatihan keamanan aplikasi dan audit mutu bareng HRGA seharian penuh
    ```
  - Klik **`Kirim Morning Commitment`**, lalu **Keluar Sesi**.
- **Lihat di layar:** Tampil kartu hijau **`Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)`**.
- **Bilang singkat:** *"Statusnya tercatat rapi sebagai Bebas Komitmen yang disetujui, tanpa mengotori metrik risiko hijau-kuning-merah."*

#### `2C [INTI]` Karyawan Mengisi & Mengirim Komitmen Pagi (Tarik Tugas Kemarin, Simpan Draf, & Risiko AMBER)
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Bagas Saputra`)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Komitmen pagi sengaja dibatasi maksimal 3 fokus utama agar pengisian cukup 2–3 menit dan bukan menjadi timesheet panjang. Tugas kemarin yang statusnya berlanjut otomatis masuk ke kotak draf pagi — bukan terkirim otomatis — dengan pengingat AMBER jika sudah tertunda 2 hari. Khusus risiko AMBER, karyawan cukup isi uraian kekhawatirannya tanpa wajib membuat tiket blocker dulu, supaya atasan tidak kebanjiran tiket kecil dan staf tetap jujur melapor AMBER alih-alih berpura-pura klik GREEN."*
- **Aksi:**
  1. Tunjuk kotak kuning **`Prioritas Kemarin Sore`** di bagian atas form.
     - **🗣️ Jelaskan ke audiens:** *"Kotak kuning ini adalah catatan Prioritas Utama Besok yang kemarin sore ditulis sendiri oleh karyawan waktu kirim Evaluasi Sore. Fungsinya menjadi pengingat fokus paling atas setiap pagi supaya rencana kerja antarhari tetap nyambung dan hal paling penting dari kemarin sore nggak langsung terlupakan saat mulai kerja — tanpa memaksa harus masuk jadi slot komitmen baru."*
  2. Klik **`Lihat Draf`** pada **`Draf Tugas Berlanjut dari Kemarin`** → tunjuk item **`Carry-Over #2 · Disarankan AMBER`** → centang kedua item → klik **`Gunakan Item Terpilih ke Slot Hari Ini`** *(Slot Komitmen #1 dan Komitmen #2 otomatis terisi lengkap dari draf kemarin)*.
     - **🗣️ Jelaskan ke audiens:** *"Kalau kotak di atas tadi catatan prioritas dari sore, kotak Draf Tugas Berlanjut ini adalah daftar komitmen pagi kemarin yang pada evaluasi sorenya dipilih 'Lanjutkan Besok'. Fungsinya supaya karyawan tinggal centang untuk tarik ke slot hari ini tanpa ketik ulang dari nol, dan tidak pernah dikirim otomatis tanpa persetujuan karyawan. Kalau satu tugas sudah tertunda sampai hari ke-2 atau lebih, sistem otomatis memberi tanda **`Carry-Over #2 · Disarankan AMBER`** sebagai sinyal dini ke atasan."*
  3. Klik **`Tambah Slot Komitmen (2/3)`** untuk membuka **Komitmen #3** (tombol tambah langsung hilang karena maksimal 3 komitmen).
  4. **`[CABANG]` Uji 2 Penolakan Sebelum Kirim (aman, tidak mengubah DB):**
     - Ketik `Te` di kolom **Teks Komitmen Terukur \*** pada **Komitmen #3** → klik **`Kirim Morning Commitment`** → ditolak merah **`"Slot #3: Deskripsi komitmen wajib diisi minimal 3 karakter."`**
     - Pilih **Tingkat Risiko Tugas Hari Ini \*:** **`AMBER`**, kosongkan **`Uraian Resiko atau Potensi Kendala *`**, klik **`Kirim Morning Commitment`** → ditolak merah **`"Slot #3: Komitmen dengan risiko AMBER wajib menyertakan uraian potensi kendala."`**
  5. **`[INTI]` Lengkapi Seluruh Input Komitmen #3 dari Atas ke Bawah + Buktikan Aturan `AMBER` Tidak Wajib Tiket Blocker:**
     - **Teks Komitmen Terukur \*:**
       ```text
       Cek ulang urutan kolom file CSV laporan bulanan bareng tim Finance dan QA
       ```
     - **Proyek Terkait (Opsional):** Pilih **`[WP-CORE] WorkPulse Platform Core 2026`**
     - **Tautkan Tiket Tugas atau Blocker yang Ingin Dikerjakan (Opsional):** Ketik `https://github.com/dutamedia/workpulse/issues/230` *(tunjuk juga tombol **`Pilih Blocker Aktif`** di sebelah kanannya)*.
     - **Tingkat Risiko Tugas Hari Ini \*:** Pilih kartu **`AMBER`** *(maka 3 kolom detail risiko di bawahnya otomatis terbuka)*.
     - **Tiket Blocker Penyebab (Opsional):** Biarkan **`-- Tidak Terkait Tiket Blocker Aktif (Risiko / Dependensi Ringan) --`**, dan tunjuk teks panduan kuning di bawahnya bahwa `AMBER` boleh dikirim tanpa menautkan tiket blocker.
     - **Uraian Resiko atau Potensi Kendala \* (wajib untuk AMBER):**
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

#### `2D [INTI]` Karyawan yang Sedang Cuti Resmi Otomatis Bebas Check-In Harian
- **🪟 Jendela & Akun:** Pakai **Jendela 5 (Incognito)** · **🔄 Login di J5:** `specialist.it@dutamedia.com` (**Gilang Ramadhan**, `Password123!`) · **🚪 Selesai Langkah:** Klik **Keluar Sesi** di **J5**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk karyawan yang sudah tercatat cuti resmi, sistem otomatis membebaskan kewajiban check-in harian tanpa perlu mereka repot membuka web sekadar memilih 0 Komitmen. Di laporan kepatuhan maupun dashboard, sistem juga otomatis mengecualikan mereka dari hitungan absen lapor."*
- **Aksi:** Login sebagai `specialist.it@dutamedia.com` → buka `/daily/morning`, klik tab `2. Additional Work` dan `3. EOD Outcome` sekilas → buka **`Riwayat Saya`** (`/daily/history`), lalu **Keluar Sesi**.
- **Lihat di layar:** Ketiga halaman harian **otomatis terkunci** menampilkan spanduk hijau **`Masa Cuti Resmi (Cuti Tahunan)`**, dan di `/daily/history` tampil panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**.
- **Bilang singkat:** *"Semua tab harian langsung terkunci hijau menampilkan masa cutinya, dan arsipnya langsung terlihat hanya-baca di Riwayat Saya."*

#### `2E [INTI]` Karyawan Mencatat Pekerjaan Tambahan Siang Hari (Edit, Hapus, & Filter Pemberi Tugas)
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Bagas Saputra`)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Additional Work ini awalnya tidak ada di PRD Baseline yang diberikan kepada kami. Tetapi setelah kami analisis, bagaimana jika setelah kirim komitmen pagi, ternyata muncul tugas tambahan baru yang prioritasnya lebih tinggi sehingga harus didahulukan dikerjakan? Itu sangat berpotensi membuat komitmen pagi awal tidak selesai penuh — bahkan tidak selesai — padahal karyawan memang punya pekerjaan baru yang lebih genting, bukan karena gagal. Karena itu kami sediakan pencatatan terpisah di sini tanpa mengubah baseline pagi, dan khusus pilihan pemberi tugasnya, akun magang otomatis kami kecualikan."*
- **Aksi:**
  1. Buka tab **`2. Additional Work`** (`/daily/additional-work`).
  2. Isi seluruh kolom pada form **`Tambah Pekerjaan Baru`** untuk **Tugas Tambahan #1**:
     - **Deskripsi Pekerjaan Tambahan \*:**
       ```text
       Revisi daftar hak akses menu tagihan portal klien sesuai permintaan klien siang ini
       ```
     - **Alasan Pekerjaan Tambahan \*:** Pilih **`Penugasan Baru dari Atasan`** *(kolom **Ditugaskan Oleh** otomatis muncul di sebelahnya)*.
     - **Ditugaskan Oleh (Atasan Langsung/Lead) \*:** Buka dropdown-nya, tunjukkan **`Dharma Putra`** muncul dan nama anak magang (`Raka Pratama` / `Nisa Amelia`) **sama sekali tidak ada**. Pilih **`Dharma Putra (Head of Delivery & Project Operations)`**.
     - **Proyek Terkait (Opsional):** Pilih **`[PRJ-PORTAL] Dutamedia Client Portal v2.4`**
     - **Tautan Referensi / Tiket Tugas (Opsional):** Ketik `https://github.com/dutamedia/workpulse/issues/235`
     - Klik **`Tambahkan Pekerjaan`**.
  3. **`[CABANG]` Isi Tugas Tambahan #2 lalu uji `Edit` & `Hapus`:**
     - **Deskripsi Pekerjaan Tambahan \*:** `Siapkan draf agenda rapat mingguan tim Delivery`
     - **Alasan Pekerjaan Tambahan \*:** Pilih **`Tugas Terlewat Dicatat Pagi`**
     - **Proyek Terkait (Opsional):** Biarkan **`-- Non-Proyek / Operasional Rutin --`**
     - **Tautan Referensi / Tiket Tugas (Opsional):** *(kosongkan)*
     - Klik **`Tambahkan Pekerjaan`**.
     - Klik **`Edit`** pada kartu Tugas #2 → ubah **Deskripsi Pekerjaan Tambahan \*** menjadi: `Siapkan draf agenda dan checklist rapat mingguan tim Delivery` → klik **`Simpan Perubahan`**.
     - Klik **`Hapus`** pada kartu Tugas #2 → di kotak konfirmasi hapus, isi kolom **`Alasan Penghapusan (Wajib Diisi) *` (min. 5 karakter):** `Agenda rapatnya sudah digabung langsung ke dokumen review PRJ-PORTAL oleh PM` → klik **`Konfirmasi Hapus`**.
- **Bilang singkat:** *"Dengan pemisahan ini, evaluasi sore tetap adil membaca konteks kerjaan dadakan di siang hari tanpa merusak catatan rencana pagi."*

#### `2F [INTI]` Karyawan Mengisi Evaluasi Sore, Melihat Saran Status Akhir (`RED`) vs Pilihan Sendiri (`AMBER`), & Menutup Hari Kerja
- **🪟 Jendela & Akun:** Tetap di **Jendela 2 (`Bagas Saputra`)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di evaluasi sore, kami memisahkan dua hal: Hasil Pekerjaan (Selesai, Sebagian, Belum Selesai, Dibatalkan) dan Kelanjutan Tugasnya (Lanjutkan Besok atau Tidak Dilanjutkan). Jika suatu tugas berhenti di tengah jalan atau dibatalkan, alasan tertulis wajib diisi agar tim tidak menebak-nebak. Untuk status akhir hari (GREEN/AMBER/RED), begitu 50% atau lebih tugas hari ini berstatus Belum Selesai atau Dibatalkan, sistem langsung menampilkan **Saran Status Sistem: RED** — namun sengaja tidak pernah mengunci paksa pilihan GREEN atau AMBER. Keputusan akhir tetap di tangan karyawan sesuai kondisi nyata di lapangan, sementara riwayat status paginya tetap terlihat atasan."*
- **Aksi:** Klik tab **`3. EOD Outcome`** (`/daily/eod`), lalu isi ke-4 kartu pekerjaan dan panel refleksi di bawahnya secara berurutan:
  1. **Kartu Komitmen #1 (`Finalisasi spesifikasi kebutuhan fitur laporan eksekutif...`):**
     - **Hasil Pencapaian Komitmen \*:** Pilih **`Selesai`** *(kolom kelanjutan otomatis hilang karena tugas sudah tuntas)*.
  2. **Kartu Komitmen #2 (`Menyusun dokumen kriteria penerimaan (acceptance criteria) untuk modul autentikasi SSO...`):**
     - **Hasil Pencapaian Komitmen \*:** Pilih **`Sebagian`** *(panel **Keputusan Kelanjutan Tugas Besok** otomatis terbuka)*.
     - **Keputusan Kelanjutan Tugas Besok \*:** Pilih **`Lanjutkan Besok (Tugas Berlanjut)`** *(default)*.
     - **Catatan Kelanjutan (Opsional):**
       ```text
       Tinggal beresin bagian skenario batas login paralel besok pagi
       ```
  3. **Kartu Komitmen #3 (`Cek ulang urutan kolom file CSV laporan bulanan...`):**
     - **Hasil Pencapaian Komitmen \*:** Pilih **`Belum Selesai`** *(panel **Keputusan Kelanjutan Tugas Besok** otomatis terbuka)*.
     - **Keputusan Kelanjutan Tugas Besok \*:** Ubah dari `Lanjutkan Besok` ke **`Tidak Dilanjutkan`** *(kotak alasan wajib otomatis muncul)*.
     - **Alasan Tidak Dilanjutkan \* (wajib):**
       ```text
       Pengecekan kolom CSV sudah diambil alih langsung oleh tim Finance, jadi nggak perlu dilanjut lagi
       ```
  4. **Kartu Pekerjaan Tambahan #1 (`Revisi daftar hak akses menu tagihan portal klien...`):**
     - **Hasil Pencapaian \*:** Pilih **`Dibatalkan`** *(kotak alasan pembatalan wajib otomatis muncul)*.
     - **Alasan Pembatalan Pekerjaan Tambahan \* (wajib):**
       ```text
       Klien jadi pakai aturan hak akses versi lama dulu sampai rilis tahap 1 beres
       ```
  5. **Panel `Refleksi Akhir & Prioritas Esok Hari` (Perhatikan Kotak Merah `Saran Status Sistem: RED` yang Langsung Muncul!):**
     - *Lihat di layar:* Begitu item #3 (`Belum Selesai`) dan item #4 (`Dibatalkan`) dipilih (2 dari 4 item = 50%), tepat di atas pilihan status langsung muncul spanduk merah:
       > **`Saran Status Sistem: RED`**  
       > *"Minimal 50% target pekerjaan hari ini berstatus Belum Selesai atau Dibatalkan. Anda tetap bebas menentukan status refleksi akhir sesuai kondisi aktual."*
     - **🗣️ Jelaskan ke audiens:** *"Perhatikan sistem langsung menghitung otomatis: karena 2 dari 4 pekerjaan hari ini berstatus Belum Selesai dan Dibatalkan (50%), sistem menyarankan status **RED**. Tapi karena yang satu sudah diambil alih tim Finance dan yang satu ditunda atas permintaan klien — bukan karena proyek macet total — karyawan berhak memilih **AMBER** (bahkan tombol **GREEN** pun tetap terbuka dan tidak dikunci paksa)."*
     - **Status Refleksi Akhir Hari Ini \*:** Tunjuk bahwa kartu **`GREEN`** tetap aktif bisa diklik, lalu klik kartu **`AMBER`**.
     - **Penjelasan Risiko / Kendala Hari Ini \* (Wajib minimal 10 karakter saat memilih AMBER / RED):**
       ```text
       Dua tugas tidak dilanjutkan karena diambil alih Finance dan ditunda klien, hanya spesifikasi SSO yang masih lanjut besok pagi
       ```
     - **Prioritas Esok Hari (Tomorrow Priority) (Opsional):**
       ```text
       Beresin dokumen syarat terima SSO dan dampingi tes PRJ-PORTAL bareng QA
       ```
  6. Klik **`Kirim Evaluasi EOD`**.
     - *Lihat di layar:* Karena pilihan karyawan (`AMBER`) lebih ringan daripada saran sistem (`RED`), muncul kotak konfirmasi **`Konfirmasi Pilihan Status Akhir Hari`** dengan dua tombol: **`Ubah ke Saran (RED)`** atau **`Tetap Kirim sebagai AMBER`**.
  7. Klik **`Tetap Kirim sebagai AMBER`**, lalu klik sebentar tab **`2. Additional Work`** untuk membuktikan formulirnya ikut terkunci otomatis pasca-EOD.
- **Bilang singkat:** *"Setelah EOD dikirim, pencatatan harian hari ini resmi tutup buku termasuk Additional Work — hanya fitur Lapor Blocker yang tetap terbuka 24 jam kalau ada kendala mendadak."*

#### `2G [INTI]` Karyawan Meninjau Arsip Kerja & Mengunduh CSV di Riwayat Saya
- **🪟 Jendela & Akun:** Tetap di **Jendela 2 (`Bagas Saputra`)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Semua catatan harian, hasil evaluasi, dan arsip cuti maupun dispensasi dari HRGA terkumpul di halaman Riwayat Saya yang bersifat hanya-baca. Tujuannya memberi transparansi dua arah: karyawan punya bukti kerja objektif, dan atasan punya bahan pembinaan yang berbasis fakta."*
- **Aksi:** Buka **`Riwayat Saya`** (`/daily/history`), tunjuk 4 kartu KPI, klik **`Detail`** pada baris hari ini, tunjuk panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**, dan klik **`Unduh CSV`**.
- **Bilang singkat:** *"Datanya langsung bisa dibuka per hari maupun diunduh ke CSV kapan pun dibutuhkan."*

---

### BABAK 3 — Pelaporan Kendala (Blocker), Penanganan Lintas Tim, & Pemantauan Eskalasi

#### `3A [INTI]` Karyawan Melaporkan Komitmen RED via Jalan Pintas Blocker (16 Kategori, 9 Dampak, & Cuti Vertikal)
- **🪟 Jendela & Akun:** Pakai **Jendela 5 (Incognito)** & **Jendela 4 (`Dewi Lestari` — HRGA, untuk tunjuk bukti cuti Gilang)** · **🔄 Login di J5:** `intern.frontend@dutamedia.com` (**Raka Pratama**, `Password123!`) *(biarkan tetap login, langsung dipakai di langkah `3B`)*
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di sini ada tiga aturan penting. Pertama, komitmen pagi berstatus RED wajib ditautkan ke tiket blocker aktif supaya nggak ada 'RED siluman' yang hanya berupa status merah tanpa PIC dan target waktu penyelesaian — dan kami siapkan tombol jalan pintas agar draf paginya otomatis tersimpan tanpa harus ketik ulang. Kedua, 16 kategori kendala dan 1 sampai 3 pilihan dampak mengarahkan tiket ke Penanggung Jawab Kategori resmi. Ketiga, jika PIC sedang cuti resmi, sistem dilarang keras menunjuk rekan sejawat atau bawahan tanpa mandat — tiket otomatis naik vertikal ke atasannya sampai ke Direktur, dan pelapor pun ditolak kalau memaksa memilih manual orang yang sedang cuti."*
- **Aksi:**
  1. **Tarik Draf Tugas Pagi di `Jendela 5 — Raka` (`/daily/morning`):**
     - Login sebagai `intern.frontend@dutamedia.com` → di `/daily/morning`, klik **`Lihat Draf`** pada kotak **`Draf Tugas Berlanjut dari Kemarin`** → klik **`Salin ke Slot`** pada tugas *`Implementasi tata letak kartu responsif pada halaman riwayat cuti dan dispensasi`* *(Slot Komitmen #1 otomatis terisi Teks Komitmen, Proyek `[WP-CORE] WorkPulse Platform Core 2026`, dan Tautan PR `https://github.com/dutamedia/workpulse/pull/225`)*.
  2. **Ubah Risiko Slot #1 ke `RED`:**
     - Pada **Tingkat Risiko Tugas Hari Ini \*** di Slot #1, klik kartu **`RED`** *(maka kolom **Tiket Blocker Penyebab (Wajib untuk RED) \***, **Uraian Resiko atau Potensi Kendala \***, dan **Tindakan / Bantuan yang Diharapkan (Opsional)** otomatis muncul)*.
  3. **`[CABANG]` Uji Validasi `RED` Wajib Blocker (sebelum buat tiket):**
     - Isi dulu **Uraian Resiko atau Potensi Kendala \*:**
       ```text
       Server staging WP-CORE error 502 Bad Gateway sehingga pengujian tampilan responsif di layar HP belum bisa dilanjutkan
       ```
     - Biarkan dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`** tetap kosong (`-- Pilih Tiket Blocker Aktif Penyebab Risiko RED --`), lalu klik **`Kirim Morning Commitment`**.
     - *Lihat di layar:* Ditolak merah — tidak boleh ada komitmen `RED` tanpa tiket blocker aktif!
  4. **`[INTI]` Klik Jalan Pintas Buat Tiket Blocker dari Form Pagi:**
     - Klik tombol **`+ Buat Tiket Blocker Sekarang`** tepat di bawah dropdown **`Tiket Blocker Penyebab (Wajib untuk RED) *`**.
     - *Lihat di layar:* Draf komitmen pagi Raka otomatis disimpan di browser, dan halaman berpindah ke `/raise-blockers?returnTo=/daily/morning&slot=0`. Perhatikan karena berasal dari Slot #1 yang terikat ke proyek `WP-CORE`, di Panel 2 bagian bawah pilihan **Jalur Kewenangan \*** otomatis terpilih **`Project Authority (Kewenangan Proyek)`** (`WP-CORE`).
  5. **`[CABANG]` Uji Aturan Cuti Vertikal PIC (Naik ke Atasan) & Batas Maksimal `3/3` Dampak (sebelum kirim tiket):**
     - **Buktikan dulu Gilang sedang cuti hari ini (tanpa keluar dari Raka di J5):** Tunjuk sebentar **`Jendela 4 — Dewi (HRGA)`** di menu **`Pencatatan Cuti Resmi`** (`/admin/leaves`) → tunjuk baris **`Gilang Ramadhan — Cuti Tahunan — Hari Ini`** *(atau ingatkan bahwa di Babak `2D` tadi kita baru saja login sebagai Gilang dan melihat spanduk cuti resminya)*.
     - **Balik ke `Jendela 5 — Raka` (`/raise-blockers`):**
       - Gulir ke **Panel 2 (`Penanggung Jawab Awal & Jalur Kewenangan`)** → pada **Jalur Kewenangan \***, klik kartu **`Organizational Authority (Struktural)`** *(wajib dipilih dulu supaya sistem menggunakan jalur kategori struktural, bukan Project Lead `WP-CORE`)*.
       - Di **Panel 1**, pada dropdown **Kategori Kendala \***, pilih **`1. Teknis & Sistem` → `Hosting, Cloud & Domain (HOSTING_DOMAIN)`**.
       - *Lihat di Panel 2 (`Pratinjau Jalur Penanganan Otomatis`):* Karena PIC resmi `HOSTING_DOMAIN` (**`Gilang Ramadhan`**) sedang cuti hari ini, sistem **tidak menurunkan tiket ke rekan/bawahan**, melainkan **otomatis menaikkan vertikal ke atasan langsungnya: `Gunawan Setiawan` (`Head of Operations & Infrastructure`)**!
       - Pada **Dampak Kendala (Pilih 1–3 Dampak) \***, centang 3 kotak dampak sekaligus untuk menunjukkan penghitung berubah jadi **`3 / 3 dipilih`** dan kotak ke-4 s/d ke-9 otomatis terkunci nonaktif.
  6. **`[INTI]` Isi Lengkap Seluruh Input Formulir `/raise-blockers` (Panel 1 & Panel 2 dari Atas ke Bawah), Uji Paksa Pilih Manual `Gilang`, Lalu Kirim Tiket `INFRA`:**
     - **Bagian 1 — `Detail Kendala, Taksonomi & Dampak`:**
       1. **Judul Kendala \* (min. 10 karakter):**
          ```text
          Server Staging WP-CORE Error 502 Bad Gateway Saat Tes Halaman Riwayat
          ```
       2. **Tautkan ke Komitmen / Tugas Hari Ini (opsional):** Biarkan **`— Tidak Terkait Komitmen Hari Ini —`** *(karena komitmen pagi Raka masih berstatus draf belum terkirim; tiket akan otomatis tertaut ke Slot #1 begitu kembali ke `/daily/morning`)*.
       3. **Kategori Kendala \*:** Pilih grup **`1. Teknis & Sistem` → `Server & Rilis Sistem (INFRA)`** *(di bawahnya otomatis muncul kotak penjelasan biru arti & contoh kategori `Server & Rilis Sistem`)*.
       4. **Dampak Kendala (Pilih 1–3 Dampak) \*:** Pastikan hanya **2 kotak** yang dicentang (`2 / 3 dipilih`, lepas centang ke-3 jika tadi mencoba cabang `3/3`):
          - Centang **`Target & Tenggat Waktu`** (*Mengancam jadwal tenggat penting yang sudah disepakati...*)
          - Centang **`Satu Tim / Divisi`** (*Menghambat pekerjaan beberapa rekan kerja dalam satu tim yang sama.*)
       5. **Tingkat Keparahan (Severity) \*:** Klik kartu **`High`** (`Target: 4 jam`).
       6. **Deskripsi Kendala & Upaya Mandiri \* (min. 20 karakter):**
          ```text
          Dari pagi server staging WP-CORE error 502 Bad Gateway pas buka halaman riwayat, jadi cek tampilan HP belum bisa jalan. Sudah coba clear cache tapi tetap sama.
          ```
       7. **Bantuan Konkret yang Diharapkan (opsional):**
          ```text
          Tolong restart container staging WP-CORE dan cek setting Nginx-nya
          ```
     - **Bagian 2 — `Penanggung Jawab Awal & Jalur Kewenangan`:**
       8. **Jalur Kewenangan \*:** Pastikan terpilih kartu **`Organizational Authority (Struktural)`** *(jika tadi melewati Aksi 5 `[CABANG]`, ubah dulu dari `Project Authority` ke **`Organizational Authority (Struktural)`** agar memakai jalur Penanggung Jawab Kategori `INFRA` ke **`Reza Mahendra`**)*.
       9. **Penanggung Jawab Khusus (opsional):**
          - **`[CABANG]` Uji paksa pilih manual orang yang sedang cuti (`Gilang Ramadhan`):** Buka dropdown **Penanggung Jawab Khusus (opsional)**, gulir ke grup **`── Lainnya ──`**, pilih **`Gilang Ramadhan — IT Systems & Cloud Specialist`** → klik **`Kirim Laporan Blocker`**.
            - *Lihat di layar:* **Ditolak merah oleh server** (`"Gilang Ramadhan sedang dalam masa cuti resmi hari ini sehingga tidak dapat ditunjuk sebagai Penanggung Jawab..."`).
          - **`[INTI]` Kirim tiket sebenarnya ke PIC otomatis (`Reza Mahendra`):** Kembalikan dropdown **Penanggung Jawab Khusus (opsional)** ke pilihan paling atas **`— Ditentukan Otomatis: Reza Mahendra (Network & Infrastructure Engineer) —`** (pastikan **Kategori Kendala \*** tetap **`Server & Rilis Sistem (INFRA)`**) → klik **`Kirim Laporan Blocker`**.
  7. **`[INTI]` Otomatis Kembali ke `/daily/morning`, Lengkapi Slot #1 (`RED`), & Kirim Komitmen Pagi Raka:**
     - *Lihat di layar:* **⚡** Begitu tiket terkirim, browser **otomatis kembali ke `/daily/morning`** dengan spanduk hijau bahwa tiket blocker berhasil dibuat dan ditautkan ke **Komitmen #1**!
     - Periksa kelengkapan seluruh kolom pada **Slot Komitmen #1** sebelum menekan tombol kirim (terutama jika tadi melewati Aksi 3 `[CABANG]`):
       - **Teks Komitmen Terukur \*:** *(otomatis terisi dari draf: `Implementasi tata letak kartu responsif pada halaman riwayat cuti dan dispensasi`)*
       - **Proyek Terkait (Opsional):** *(otomatis terisi: `[WP-CORE] WorkPulse Platform Core 2026`)*
       - **Tautkan Tiket Tugas atau Blocker yang Ingin Dikerjakan (Opsional):** *(otomatis terisi: `https://github.com/dutamedia/workpulse/pull/225`)*
       - **Tingkat Risiko Tugas Hari Ini \*:** **`RED`**
       - **Tiket Blocker Penyebab (Wajib untuk RED) \*:** *(otomatis terpilih tiket `[HIGH] Server Staging WP-CORE Error 502 Bad Gateway Saat Tes Halaman Riwayat (OPEN)` yang barusan dibuat)*
       - **Uraian Resiko atau Potensi Kendala \* (wajib untuk RED):** *(jika sudah diisi di Aksi 3 otomatis masih ada; jika tadi melewati Aksi 3, wajib isi sekarang)*:
         ```text
         Server staging WP-CORE error 502 Bad Gateway sehingga pengujian tampilan responsif di layar HP belum bisa dilanjutkan
         ```
       - **Tindakan / Bantuan yang Diharapkan (Opsional):**
         ```text
         Butuh tim Network & Infra restart container staging WP-CORE dan perbaiki konfigurasi Nginx
         ```
     - Klik **`Kirim Morning Commitment`** → komitmen pagi `RED` milik Raka langsung terkirim dan terkunci!
- **Bilang singkat:** *"Draf pagi otomatis aman, tiket langsung punya PIC jelas, dan komitmen RED langsung terkirim dalam satu alur tanpa putus."*

#### `3B [INTI]` Staf Spesialis Menangani Tiket & Pelapor Memverifikasi Penyelesaian Hingga Ditutup
- **🪟 Jendela & Akun:** Pakai **Jendela 2** & **Jendela 5 (masih `Raka`)** · **🔄 Ganti Akun di J2:** Keluar `Bagas Saputra` → Login `network.infra@dutamedia.com` (**Reza Mahendra**, `Password123!`) · **🚪 Selesai Langkah:** Buka `/profile` Raka lalu klik **Keluar Sesi** di **J5**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Untuk jenis kendala teknis atau operasional tertentu, tiket tidak selalu harus menumpuk di Head Divisi — kami menetapkan Penanggung Jawab Kategori resmi agar staf spesialis seperti Network Engineer bisa langsung membuka Antrean Blocker tanpa perlu mengubah struktur atasannya di bagan perusahaan. Di dalam tiketnya, tombol 'Beri Bantuan' untuk progres bertahap/uji coba sengaja dipisah dari 'Selesaikan' (khusus solusi tuntas), dan PIC tidak bisa menutup tiket sepihak — pelapor sendirilah yang memverifikasi atau mengembalikannya jika masalah masih terjadi."*
- **Aksi:**
  1. Di **`Jendela 2 — Reza Mahendra`**: buka **`Antrean Blocker`** (`/blockers`).
     - *Lihat di layar:* Lencana merah notifikasi nyala; menu `Antrean Blocker` & `Penuaan & Eskalasi` terbuka untuk staf spesialis tersebut. *(Bilang sekilas: kalau Reza sendiri yang lapor kendala `INFRA`, sistem otomatis naikkan ke atasannya `Gunawan` biar nggak nunjuk diri sendiri).*
  2. Pilih kartu tiket **`Server Staging WP-CORE Error 502 Bad Gateway...`** → klik tombol **`Terima & Tangani`** → lalu klik tombol **`Beri Bantuan`** dan isi kedua kolom di modal **`Catat Pemberian Bantuan (Assist)`**:
     - **Aksi Bantuan yang Diberikan \*:**
       ```text
       Restart container staging WP-CORE dan bersihin antrean Nginx
       ```
     - **Hasil / Progres yang Dicapai \*:**
       ```text
       Halaman utama staging sudah hidup lagi, coba Raka akses sekarang
       ```
     - Klik **`Simpan Kontribusi`**.
  3. **`⚡` Pindah ke `Jendela 5 — Raka Pratama`** di menu **`Lapor Blocker` → tab `Blocker Saya`** (`/raise-blockers?tab=mine`): pada kartu tiket tersebut klik tombol **`Terima Bantuan (Membantu Sebagian)`**, lalu isi kotak catatan yang terbuka (min. 10 karakter):
     ```text
     Halaman utama sudah kebuka, tapi halaman riwayat cuti masih kena 502 pas panggil API
     ```
     → klik **`Kirim Catatan Membantu Sebagian`**.
  4. **Balik ke `Jendela 2 — Reza` (`/blockers`)**: klik tombol **`Selesaikan`**, lalu di modal **`Selesaikan Blocker (Resolve)`** isi kolom **`Catatan Resolusi / Tindakan Perbaikan *` (min. 10 karakter):**
     ```text
     Koneksi Nginx ke API staging sudah dibenerin dan semua endpoint sudah lancar 200 OK
     ```
     → klik **`Kirim Solusi`**.
  5. **`[CABANG]` Kembalikan Solusi lalu Tutup Final (`Jendela 5 ↔ Jendela 2`):**
     - Di **`Jendela 5 — Raka` (`/raise-blockers?tab=mine`)**: klik tombol **`Belum Memadai (Kembalikan)`** → isi kotak alasan pengembalian (min. 10 karakter):
       ```text
       Daftar data sudah tampil, tapi pas pakai filter tanggal masih timeout setelah 10 detik
       ```
       → klik **`Kirim & Kembalikan ke PIC`** (status tiket otomatis kembali ke `Sedang Ditangani`).
     - Di **`Jendela 2 — Reza` (`/blockers`)**: klik lagi **`Selesaikan`** → isi **`Catatan Resolusi / Tindakan Perbaikan *`:**
       ```text
       Batas timeout koneksi database staging sudah dinaikkan, tes filter sudah cepat di bawah 200ms
       ```
       → klik **`Kirim Solusi`**.
     - Di **`Jendela 5 — Raka` (`/raise-blockers?tab=mine`)**: klik **`Konfirmasi & Tutup Tiket`** (`Selesai Ditutup`). Buka sebentar `/profile` Raka untuk tunjuk pil ungu **`Intern`** & tanggal selesai magang, lalu klik **`Keluar Sesi`**.
- **Bilang singkat:** *"Seluruh progres uji coba, pengembalian solusi, sampai konfirmasi penutupan final terekam berurutan di linimasa tiket."*

#### `3C [INTI]` Kepala Divisi Membantu Tiket Lintas Tim dari Dashboard & Menetapkan Terima Risiko
- **🪟 Jendela & Akun:** Pakai **Jendela 3 (`Arif Budiman` — Head Eng)** & **Jendela 2** · **🔄 Ganti Akun di J2:** Keluar `Reza Mahendra` → Login `dev.frontend@dutamedia.com` (**Aditya Nugroho**, `Password123!`) *(Aditya tetap login s/d `7A`)*
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di WorkPulse kami pegang prinsip 'primary ownership bukan exclusive ownership': meskipun PIC utama tiketnya adalah Tech Lead, atasan atau rekan lintas fungsi bisa langsung menyalurkan bantuan kapan saja tanpa harus menunggu PIC. Dan bila ada kendala yang secara keputusan bisnis memang harus ditunda dulu — bukan tidak dikerjakan — atasan bisa memilih 'Terima Risiko' dengan justifikasi dan rencana mitigasi tertulis."*
- **Aksi:**
  1. Di **`Jendela 2`**: keluar dari akun Reza, lalu login **`dev.frontend@dutamedia.com`** (**Aditya Nugroho**).
  2. Di **`Jendela 3 — Arif Budiman` (`/dashboard`)**: pada daftar **`Personil Butuh Bantuan Hari Ini`**, klik tombol **`Bantu Unblock`** di baris **`Aditya Nugroho`** (tiket *`Gagal Build Pipeline Frontend di GitLab CI karena Out-of-Memory (OOM)`*).
     - *Lihat di layar:* Langsung pindah ke `/blockers`, **panel kiri otomatis terscroll pas ke kartu tiket tersebut** sambil **header panel kanan tetap utuh terlihat**!
  3. Meskipun PIC tiketnya `Bambang Pratama`, Arif (non-PIC) langsung klik **`Beri Bantuan`** dan isi modal **`Catat Pemberian Bantuan (Assist)`**:
     - **Aksi Bantuan yang Diberikan \*:**
       ```text
       Naikkan limit memori container GitLab CI runner dari 2GB ke 6GB
       ```
     - **Hasil / Progres yang Dicapai \*:**
       ```text
       Build frontend sudah dites ulang dan lolos tanpa error OOM
       ```
     - Klik **`Simpan Kontribusi`**. Buka sebentar `/dashboard` → **⚡** bantuan Arif langsung muncul di **`Feed Dukungan Lintas Fungsi`**.
  4. **`⚡` Pindah ke `Jendela 2 — Aditya` (`/raise-blockers?tab=mine`)**: pada kartu tiket *`Gagal Build Pipeline Frontend di GitLab CI karena Out-of-Memory (OOM)`* tersebut klik tombol **`Terima sbg Penyelesaian (Tutup Tiket)`** → tiket langsung `Selesai Ditutup`.
  5. **`[CABANG]` Siklus `Terima Risiko` (`Jendela 3 — Arif` di `/blockers`):** Pilih tiket **`Menunggu Persetujuan Rilis Arsitektur Database Baru`** (`APPROVAL`, `WP-CORE`) → klik **`Terima & Tangani`** → klik **`Terima Risiko`** dan isi kedua kolom di modal **`Penerimaan Risiko Resmi (Accept Risk)`**:
     - **Justifikasi Penerimaan Risiko \* (min. 10 karakter):**
       ```text
       Migrasi database tahap 2 kita geser ke rilis minggu depan supaya jadwal demo minggu ini tetap aman
       ```
     - **Rencana Mitigasi Sementara \* (min. 10 karakter):**
       ```text
       Sementara tetap pakai skema tabel versi 1 dan dipantau query-nya tiap hari oleh Tech Lead
       ```
     - Klik **`Tetapkan Terima Risiko`**.
- **Bilang singkat:** *"Bantuan lintas tim dari luar PIC bisa langsung menutup tiket bila memang menyelesaikan masalah, sementara penundaan strategis tetap tercatat resmi mitigasinya."*

#### `3D [CABANG]` Pelapor Mengubah Divisi Tujuan Tiket (PIC Pindah Otomatis) & Menghapus Tiket Aktif
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Aditya Nugroho` — `/raise-blockers?tab=mine`)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Karyawan bisa saja salah pilih divisi tujuan, duplikat bikin tiket, atau kendalanya keburu beres sendiri. Agar antrean PIC tidak penuh tiket salah alamat dan memicu alarm terlambat palsu, pelapor diizinkan mengedit atau menghapus tiket **hanya selama tiket masih aktif**. Begitu divisi tujuan diganti saat edit, PIC otomatis berpindah ke divisi yang benar; saat dihapus wajib pilih alasan dan seluruh pihak terkait langsung dapat notifikasi — tidak ada penghapusan diam-diam."*
- **Aksi:** Di `/raise-blockers?tab=mine`:
  1. Pada kartu tiket **`Menunggu Hasil Uji QA dari Tim Delivery`** (`CROSS_TEAM`, PIC saat ini `Dharma Putra`), klik **`Edit Tiket`**, lalu periksa/ubah kolom di modal **`Edit Tiket Kendala`**:
     - **Judul Kendala \* (min. 10 karakter):** *(biarkan judul yang sudah terisi)*
     - **Kategori Kendala \*:** Biarkan **`3. Orang & Keputusan` → `Menunggu Tim / Rekan Lain (CROSS_TEAM)`**
     - **Divisi yang Sedang Ditunggu \*:** Ubah dari `Product & Delivery` ke **`Operations & Infrastructure`**
     - **Dampak Kendala (Pilih 1–3 Dampak) \*:** *(biarkan dampak yang sudah tercentang)*
     - **Tingkat Keparahan (Severity) \*:** *(biarkan `Medium`)*
     - **Deskripsi Kendala & Upaya Mandiri \* (min. 20 karakter):** Ubah menjadi:
       ```text
       Perbaikan navigasi sudah kelar, tapi masih nunggu pembukaan port firewall staging dari tim Operations & Infrastructure
       ```
     - **Bantuan Konkret yang Diharapkan (opsional):** *(biarkan atau sesuaikan)*
     - Klik **`Simpan Perubahan`**.
     - *Lihat di layar:* PIC otomatis berpindah dari `Dharma Putra` ke **`Gunawan Setiawan`** (*Head Ops & Infra*).
  2. Pada kartu tiket **`Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus`**, klik **`Hapus Tiket`** → di modal **`Hapus Tiket Kendala`**, pada pilihan **`Kategori Alasan Penghapusan *`**, tunjuk 3 alasan preset (`Salah Input / Tiket Duplikat`, `Sudah Teratasi Mandiri`, `Kendala Tidak Jadi / Batal Relevan`) + `Alasan Lainnya` → klik **`Sudah Teratasi Mandiri`** *(kolom `Penjelasan Tambahan (opsional)` otomatis terisi kalimat preset)* → klik **`Konfirmasi Hapus Tiket`**.
- **Bilang singkat:** *"Begitu tiket sudah masuk tahap Selesai atau Ditutup, tombol Edit dan Hapus otomatis dikunci agar arsip kerjanya tetap utuh."*

#### `3E [INTI]` Kepala Divisi Memantau Tiket Kritis Lewat Batas Waktu di Radar Penuaan
- **🪟 Jendela & Akun:** Pakai **Jendela 3 (`Arif Budiman` — Head Eng)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Prinsip utama WorkPulse adalah 'No Surprise' — masalah boleh terjadi di proyek, tapi tidak boleh menjadi kejutan di akhir minggu. Tiket dengan tingkat keparahan tinggi yang melewati target waktu penyelesaian langsung disorot merah di Radar Penuaan ini supaya pimpinan cepat turun tangan."*
- **Aksi:**
  1. Di sidebar kiri, klik menu **`Penuaan & Eskalasi`** (`/blockers/aging`).
  2. Tunjuk kartu ringkasan merah **`Lewat Batas Waktu: 1`** dan baris tiket **`[CRITICAL] Gangguan Koneksi Database Staging menyebabkan Pengujian Integrasi Terhenti`** (`WP-CORE`).
  3. Centang kotak filter **`Hanya Lewat Batas Waktu`**, lalu klik tombol **`Buka`** di ujung kanan baris tiket tersebut untuk langsung masuk ke detail penanganannya.
- **Bilang singkat:** *"Sekali klik 'Buka', atasan langsung dibawa ke tiket kritis yang paling butuh intervensi."*

---

### BABAK 4 — Permohonan & Persetujuan Koreksi Laporan yang Sudah Terkunci

#### `4A [INTI]` Karyawan Mengajukan Koreksi Komitmen Pagi (Otomatis untuk Minor, Review untuk Material)
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Aditya Nugroho` — `dev.frontend@dutamedia.com`)** · **✅ Tanpa Ganti Akun** *(sudah login sejak Babak `3C`)*
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Komitmen yang sudah terkunci tidak boleh diedit bebas supaya baseline pagi tetap jujur. Tapi supaya proses koreksi nggak terlalu birokratis dan nggak membebani atasan, kami bagi dua: Perubahan Minor (seperti salah ketik atau tambah tautan PR) langsung diterapkan otomatis dengan jejak audit, sedangkan Perubahan Material (mengubah target atau tingkat risiko) harus melewati persetujuan Kepala Divisi."*
- **Aksi** (buka menu **`Koreksi Komitmen Pagi`** `/corrections/morning`):
  1. **Ajukan Perubahan Minor (Langsung Diterapkan Otomatis):** Isi formulir kiri dari atas ke bawah:
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
     - Klik **`Kirim Permohonan Koreksi`** → *Lihat di panel kanan:* langsung berstatus hijau **`Diterapkan Otomatis (AUTO_APPLIED)`**.
  2. **Ajukan Perubahan Material (Butuh Persetujuan Kepala Divisi):** Isi kembali formulir kiri dari atas ke bawah:
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
     - Klik **`Kirim Permohonan Koreksi`** → *Lihat di panel kanan:* berstatus kuning **`Menunggu Persetujuan`**.
- **Bilang singkat:** *"Perubahan Minor langsung diterapkan tanpa mengganggu atasan, sedangkan Perubahan Material langsung masuk ke meja review atasan."*

#### `4B [INTI]` Kepala Divisi Menolak Koreksi, Karyawan Merevisi Cepat, Lalu Koreksi Disetujui
- **🪟 Jendela & Akun:** Pakai **Jendela 3 (`Arif Budiman` — Head Eng)** & **Jendela 2 (`Aditya Nugroho`)** · **✅ Tanpa Ganti Akun**
- **Aksi:**
  1. Di **`Jendela 3 — Arif`** (buka menu **`Review Koreksi`** `/corrections/review`): tunjuk tabel perbandingan **`Sebelum` vs `Diajukan`**, klik tombol **`Tolak`**, lalu di modal **`Tolak Permohonan Koreksi`** isi kolom **`Catatan Review / Alasan Keputusan *` (min. 5 karakter):**
     ```text
     Tolong tambahin nomor tiket issue Vite biar gampang dicek tim QA
     ```
     → klik **`Konfirmasi Tolak`**.
  2. **`⚡` Pindah ke `Jendela 2 — Aditya`** (`/corrections/morning`):
     - Tekan **`F5`** → lihat kartu **`Komitmen #2 REJECTED MATERIAL`** di panel kanan (**`Riwayat Permohonan Koreksi`**), lalu klik tombol **`Gunakan Draf Sebelumnya & Sesuaikan`** langsung pada kartu tersebut *(otomatis memilih **`[Komitmen #2]`** & **`Perubahan Material`**, serta memuat kembali draf sebelumnya ke formulir kiri)*, kemudian sesuaikan:
       - **Deskripsi Komitmen Baru yang Diajukan \*:**
         ```text
         Optimasi code-splitting Vite [#245] biar penggunaan memori build frontend turun
         ```
       - **Tingkat Risiko Baru:** Pastikan **`GREEN (Lancar)`**
       - **Alasan Resmi Permohonan Koreksi \* (min. 10 karakter):**
         ```text
         Tambah nomor tiket [#245] sesuai catatan Head Engineering
         ```
     - Klik **`Kirim Permohonan Koreksi`**.
  3. **Balik ke `Jendela 3 — Arif` (`/corrections/review`)**: tekan **`F5`**, klik tombol **`Setujui`**, lalu di modal **`Setujui Permohonan Koreksi`** isi kolom **`Catatan Review / Alasan Keputusan *` (min. 5 karakter):**
     ```text
     Sip, nomor referensi [#245] sudah lengkap
     ```
     → klik **`Konfirmasi Setujui`**.
- **Bilang singkat:** *"Atasan bisa melihat jelas perbandingan sebelum dan sesudah sebelum setuju, dan kalau ditolak, karyawan tinggal pakai tombol revisi cepat dari draf sebelumnya."*

#### `4C [CABANG]` Menunjukkan Halaman Koreksi Evaluasi Sore (Batas 48 Jam Kerja)
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Aditya Nugroho`)** · **✅ Tanpa Ganti Akun**
- **Aksi:** Klik sebentar menu **`Koreksi Evaluasi Sore`** (`/corrections/eod`) di sidebar kiri untuk menunjukkan halaman permohonan koreksi laporan sore (batas waktu 48 jam kerja) tersedia terpisah.

---

### BABAK 5 — Pencatatan Cuti Resmi, Dispensasi Tugas, & Pengecualian Permanen

#### `5A [INTI]` HRGA Mencatat Cuti Sakit Karyawan (Beserta 3 Pagar Pengaman) & Membuktikan Form Langsung Terkunci
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (Incognito)** · **🔄 Login di J5:** `staff.finance@dutamedia.com` (**Intan Permata**, `Password123!`) *(biarkan tetap login untuk `5B` & `5C`)*
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"WorkPulse sengaja tidak membuat alur pengajuan dan persetujuan cuti baru di dalam aplikasi agar HRGA dan atasan tidak perlu input dua kali dengan prosedur HR yang sudah berjalan di kantor. Begitu cuti sudah disetujui di jalur kantor, HRGA cukup mencatatnya satu pintu di sini dan akun karyawan otomatis dibebaskan — lengkap dengan pagar pengaman untuk menolak cuti akhir pekan (0 hari kerja), jadwal bentrok, serta pengajuan Cuti Tahunan bagi anak magang."*
- **Aksi:**
  1. Di **`Jendela 4 — Dewi (HRGA)`**, buka menu **`Pencatatan Cuti Resmi`** (`/admin/leaves`): tunjuk tabel kanan di mana semua catatan langsung berstatus resmi **`Disetujui`**, termasuk **`Raka Pratama` (`Izin Resmi`)** dan **`Gilang Ramadhan` (`Cuti Tahunan`)**.
  2. **`[CABANG]` Uji 3 Pagar Pengaman di Form Kiri `Catat Cuti Resmi Baru` (tanpa merusak data):**
     - **Uji Tanggal Mundur & Tolak Akhir Pekan:** Pilih **Karyawan \*:** `Intan Permata (staff.finance@dutamedia.com)` → pilih **Tanggal Mulai \*:** **Hari Ini** → buka kalender **Tanggal Selesai \*** dan tunjukkan tanggal kemarin otomatis terkunci tidak bisa dipilih. Lalu ubah **Tanggal Mulai \*** & **Tanggal Selesai \*** ke hari **Sabtu dan Minggu minggu ini**, pilih **Jenis Cuti / Izin \*:** `Cuti Tahunan`, isi **Keterangan Resmi / Dasar Persetujuan \*:** `Tes akhir pekan` → klik **`Daftarkan Cuti Resmi`** → ditolak merah (*0 hari kerja*).
     - **Uji Bentrok Jadwal Cuti:** Pilih **Karyawan \*:** `Gilang Ramadhan (specialist.it@dutamedia.com)`, **Tanggal Mulai \*** & **Tanggal Selesai \*:** **Hari Ini**, **Jenis Cuti / Izin \*:** `Cuti Tahunan`, **Keterangan Resmi / Dasar Persetujuan \*:** `Tes bentrok cuti` → klik **`Daftarkan Cuti Resmi`** → ditolak merah (bentrok dengan jadwal cuti aktif Gilang).
     - **Uji Anak Magang (`Intern`) Ditolak Cuti Tahunan:** Pilih **Karyawan \*:** `Raka Pratama (intern.frontend@dutamedia.com)`, **Tanggal Mulai \*** & **Tanggal Selesai \*:** **Senin depan**, **Jenis Cuti / Izin \*:** `Cuti Tahunan`, **Keterangan Resmi / Dasar Persetujuan \*:** `Tes hak cuti magang` → klik **`Daftarkan Cuti Resmi`** → ditolak merah (*karyawan berstatus Intern tidak berhak mengambil Cuti Tahunan*).
  3. **`[INTI]` Catat Cuti Sakit Hari Ini untuk Intan Permata (isi seluruh kolom form kiri dari atas ke bawah):**
     - **Karyawan \*:** Pilih **`Intan Permata (staff.finance@dutamedia.com)`**
     - **Tanggal Mulai \*:** Pilih **tanggal hari ini**
     - **Tanggal Selesai \*:** Pilih **tanggal hari ini**
     - **Jenis Cuti / Izin \*:** Pilih **`Sakit`**
     - **Keterangan Resmi / Dasar Persetujuan \* (min. 5 karakter):**
       ```text
       Surat sakit dari klinik, sudah ACC atasan & HRGA
       ```
     - Klik **`Daftarkan Cuti Resmi`**.
  4. **⚡ Buktikan di `Jendela 5 (Incognito)`:** Login sebagai **`staff.finance@dutamedia.com`** (**Intan Permata**, `Password123!`):
     - Buka `/daily/morning`, klik tab `2. Additional Work` dan `3. EOD Outcome` → ketiganya **otomatis terkunci** menampilkan spanduk hijau **`Masa Cuti Resmi (Cuti Sakit)`** tanpa Intan perlu memilih `0 komitmen`.
     - Klik menu **`Riwayat Saya`** (`/daily/history`) → catatan cutinya langsung muncul di panel **`Riwayat Cuti & Dispensasi Resmi Tercatat` (`Read-Only`)**, dan notifikasi masuk di lonceng pojok kanan atas.
- **Bilang singkat:** *"Seketika setelah dicatat HRGA, seluruh jadwal pengisian harian karyawan terkunci aman dan notifikasi langsung terkirim ke akun yang bersangkutan."*

#### `5B [INTI]` HRGA Mengedit & Menghapus Catatan Cuti Agar Jadwal Karyawan Aktif Kembali
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (masih `Intan Permata`)** · **✅ Tanpa Ganti Akun**
- **Aksi:**
  1. Di **`Jendela 4 — Dewi (HRGA)` (`/admin/leaves`)**: pada baris **`Intan Permata`**, klik tombol **`Edit`** → di form kiri (`Edit Catatan Cuti Resmi`), ubah **Keterangan Resmi / Dasar Persetujuan \*** menjadi `Surat sakit dari klinik, sudah ACC atasan & HRGA (revisi HRGA)` → klik **`Simpan Perubahan Cuti`**.
  2. Masih pada baris **`Intan Permata`**, klik tombol **`Hapus`** → di jendela konfirmasi **`Hapus Catatan Cuti Resmi?`** klik **`Ya, Hapus Catatan`**.
  3. **⚡ Buktikan di `Jendela 5 — Intan` (`/daily/morning`)**: tekan **`F5`** → formulir komitmen pagi Intan langsung **terbuka kembali** seperti normal!
- **Bilang singkat:** *"Kalau ada salah tanggal atau batal cuti, tinggal edit atau hapus di sini dan jadwal check-in karyawan langsung aktif lagi."*

#### `5C [INTI]` HRGA Mendaftarkan Dispensasi Dinas Luar, Menguji Pengecualian Permanen, Lalu Menghapusnya
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (masih `Intan Permata`)** · **✅ Tanpa Ganti Akun** · **🚪 Selesai Langkah:** Klik **Keluar Sesi** Intan di **J5**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Dispensasi seperti Dinas Luar, pelatihan sertifikasi, atau penugasan khusus eksekutif dipisahkan dari 0 Komitmen karena ini adalah penugasan resmi perusahaan berbasis surat tugas. Selain dispensasi bertanggal, kami juga menambahkan fitur **Pengecualian Permanen** (berlaku terus tanpa tanggal berakhir sampai diubah atau dihapus Admin): tujuannya jika ada individu atau peran tertentu yang memang dibebaskan seterusnya dari komitmen harian, HRGA/Admin tidak perlu menginput ulang berulang-ulang — menu komitmen harian & koreksinya otomatis disembunyikan, sementara `Lapor Blocker` sengaja tetap aktif supaya mereka tetap bisa melapor bila menghadapi kendala kerja."*
- **Aksi:**
  1. Di **`Jendela 4 — Dewi (HRGA)`**, buka menu **`Manajemen Dispensasi`** (`/exemptions`): tunjuk di tabel kanan sudah ada contoh **`Bayu Santoso` (`Dinas Luar`, `ST/HRGA/2026/XI/104`)**.
  2. Isi seluruh kolom pada form kiri **`Tambah Dispensasi Resmi`** dari atas ke bawah:
     - **Karyawan Penerima Dispensasi \*:** Pilih **`Intan Permata (staff.finance@dutamedia.com)`**
     - **Tanggal Mulai \*:** Pilih **tanggal hari ini**
     - **Tanggal Selesai \*:** Pilih **tanggal hari ini**
     - **Kotak centang `Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)`:** *(biarkan tidak dicentang dulu untuk mendemokan dispensasi bertanggal)*
     - **Kategori Pengecualian \*:** Pilih **`Dinas Luar (Penugasan Luar Kantor / Klien)`**
     - **Nomor Surat Tugas / Referensi (opsional):** Ketik `ST/HRGA/2026/XI/112`
     - **Alasan Resmi Dispensasi \* (min. 5 karakter):**
       ```text
       Dampingi audit faktur dan rekonsiliasi pajak di kantor klien Surabaya
       ```
     - Klik **`Daftarkan Dispensasi`**.
  3. **⚡ Buktikan di `Jendela 5 — Intan` (`/daily/morning`)**: tekan **`F5`** → formulir harian langsung terkunci dengan spanduk **`Masa Dispensasi Resmi (Dinas Luar)`** dan tercatat di `/daily/history`.
  4. **`[CABANG]` Uji Pengecualian Permanen (Bebas Komitmen Harian, `Lapor Blocker` Tetap Aktif):**
     - Di **`Jendela 4 — Dewi (HRGA)`** (`/exemptions`), pada baris **`Intan Permata`**, klik tombol **`Edit`** → di form kiri (`Edit Dispensasi Resmi`):
       - Centang kotak **`Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)`** *(perhatikan kolom **Tanggal Selesai** otomatis nonaktif & muncul petunjuk: "Aktif terus mulai Tanggal Mulai. Menu komitmen harian & koreksi disembunyikan, sementara Lapor Blocker tetap aktif.")*.
       - Ubah **Kategori Pengecualian \*** ke **`Pengecualian Permanen (Bebas Komitmen Harian)`**.
       - Klik **`Simpan Perubahan Dispensasi`**.
     - *Lihat di tabel kanan `/exemptions`:* kolom Periode berubah menjadi **`Mulai [Tanggal Hari Ini] (Permanen)`**.
     - **⚡ Buktikan di `Jendela 5 — Intan`:** Tekan **`F5`** (atau keluar & login ulang `staff.finance@dutamedia.com`):
       - Halaman langsung diarahkan ke **`/raise-blockers`** (bukan `/daily/morning`).
       - Di sidebar kiri, menu **`My Today`**, **`Koreksi Komitmen Pagi`**, dan **`Koreksi Evaluasi Sore`** **otomatis hilang** (jika alamat `/daily/morning` diketik manual di browser → muncul halaman **`403 — Akses Dibatasi`**).
       - Menu **`Lapor Blocker`**, **`Riwayat Saya`**, dan **`Notifikasi`** **tetap aktif**.
       - Klik bulatan profil di pojok kanan atas (`/profile`): pada Kartu Identitas tertulis **`Pengecualian Permanen · Lapor Blocker tetap aktif`**.
  5. **Hapus Dispensasi Intan (Membuktikan Menu Harian Aktif Kembali):** Balik ke **`Jendela 4 — Dewi (HRGA)`** (`/exemptions`), pada baris **`Intan Permata`** klik tombol **`Hapus`** → di jendela konfirmasi **`Hapus Catatan Dispensasi?`** klik **`Ya, Hapus Dispensasi`**. Kembali ke **`Jendela 5 — Intan`**, tekan **`F5`** → tunjukkan seluruh menu komitmen harian Intan langsung muncul kembali, lalu klik **`Keluar Sesi`**.
- **Bilang singkat:** *"Begitu pengecualian permanennya dicabut atau dihapus Admin, menu komitmen harian karyawan langsung aktif kembali normal seketika."*

---

### BABAK 6 — Tindak Lanjut Kepatuhan HRGA & Catatan Pembinaan (Coaching) Atasan

#### `6A [INTI]` HRGA Menindaklanjuti Pola Terlambat Karyawan di Antrean Kepatuhan
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Satu hal yang sangat kami jaga: WorkPulse tidak pernah menerbitkan SP atau memotong insentif secara otomatis, supaya sistem tidak menciptakan budaya takut. Satu kali lupa atau terlambat mengisi bukanlah sanksi. Baru ketika terbentuk pola berulang — misalnya 3 kali berturut-turut — sistem memunculkannya di Antrean Kepatuhan HRGA sebagai sinyal pembinaan berbasis fakta."*
- **Aksi:**
  1. Buka **`Antrean Kepatuhan`** (`/compliance`).
  2. Pada baris **`Siti Rahma`** (`Belum Ditangani` · `Pola Terlambat 3x`), klik tombol **`Tindak Lanjut`** → di modal **`Catat Tindak Lanjut Kepatuhan`**:
     - `[CABANG]` Ketik 2 huruf `ok` di kolom **`Catatan Tindak Lanjut / Pembinaan *`** → tombol **`Simpan Tindak Lanjut`** tetap nonaktif (wajib min. 5 karakter).
     - Isi **`Catatan Tindak Lanjut / Pembinaan *` (min. 5 karakter):**
       ```text
       Sudah diingatkan bareng Head Engineering, sepakat pasang pengingat browser jam 08.00 biar nggak lupa lapor pagi
       ```
     - Klik **`Simpan Tindak Lanjut`**.
  3. Pada baris **`Nadia Kusuma`** (`Sudah Ditangani`), klik tombol **`Ubah Catatan`** → di modal **`Perbarui Catatan Tindak Lanjut`**, tambahkan ` dan tidak berulang kembali.` di akhir teks **`Catatan Tindak Lanjut / Pembinaan *`** → klik **`Simpan Tindak Lanjut`**.
- **Bilang singkat:** *"HRGA bisa mendokumentasikan hasil tindak lanjut atau memperbarui catatannya langsung sebagai riwayat pembinaan resmi."*

#### `6B [INTI]` Kepala Divisi Mencatat Bimbingan 1-on-1 untuk Bawahan (Dibagikan vs Rahasia Manajemen)
- **🪟 Jendela & Akun:** Pakai **Jendela 3 (`Arif Budiman` — Head Eng)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kami memisahkan jelas kewenangan HRGA dengan atasan langsung: HRGA fokus pada pola kepatuhan di `/compliance`, sedangkan atasan langsung mencatat bimbingan atau apresiasi 1-on-1 di `/coaching`. Setiap catatan bisa dipilih untuk Dibagikan ke Karyawan, atau dikunci sebagai Rahasia Manajemen yang 100% terisolasi sehingga tidak pernah muncul di notifikasi maupun akun staf."*
- **Aksi:**
  1. Buka **`Catatan Coaching`** (`/coaching`), klik kartu **`Aditya Nugroho`**. Tunjuk panel kanan sudah ada 2 catatan: **`Dibagikan ke Karyawan`** dan **`Rahasia Manajemen`**.
  2. Di panel kiri (`Catat Pembinaan Baru`), isi seluruh kolom dari atas ke bawah:
     - **Karyawan yang Dituju \*:** Pilih **`Aditya Nugroho`**
     - **Jenis Catatan \*:** Pilih kartu **`Bimbingan`**
     - **Tingkat Visibilitas \*:** Pilih **`Dibagikan ke Karyawan`**
     - **Isi Catatan Pembinaan \*:** Klik tombol template cepat **`Bimbingan 1-on-1`** *(kolom textarea otomatis terisi teks bimbingan 1-on-1)*
     - Klik **`Simpan Catatan Pembinaan`**.
- **Bilang singkat:** *"Atasan cukup pakai tombol template cepat untuk mencatat sesi 1-on-1 dalam hitungan detik."*

---

### BABAK 7 — Pusat Notifikasi, Dashboard Pemantauan, Radar Proyek, & Laporan Eksekutif

#### `7A [INTI]` Membuktikan Privasi Catatan Rahasia, Sembunyinya Tautan Admin, & Notifikasi Lonceng Direktur
- **🪟 Jendela & Akun:** Pakai **Jendela 2 (`Aditya Nugroho`)** & **Jendela 1 (`Hendra Wijaya` — Direktur)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Di Pusat Notifikasi, sistem menjaga dua keamanan sekaligus: catatan `Rahasia Manajemen` tidak pernah bocor ke layar staf, dan tautan di dalam notifikasi — misalnya pemberitahuan perubahan kebijakan oleh Direktur — otomatis menyembunyikan tombol menuju `/admin/policies` bagi staf biasa agar karyawan tidak salah klik menuju halaman `403`."*
- **Aksi:**
  1. Di **`Jendela 2 — Aditya`**, klik menu **`Notifikasi`** (`/notifications`) di sidebar kiri:
     - Tunjukkan notifikasi catatan pembinaan **`Dibagikan ke Karyawan`** muncul, sedangkan catatan **`Rahasia Manajemen`** sama sekali tidak muncul di layar karyawan.
     - Klik kartu notifikasi perubahan kebijakan cut-off: tunjukkan angka merah di sidebar **`Notifikasi`** & ikon lonceng pojok kanan atas langsung **berkurang 1**, dan tombol menuju halaman `/admin/policies` **otomatis disembunyikan** karena Aditya bukan Admin/Direktur.
     - Klik sebentar tab **`Pengaturan Kanal & Perangkat`** dan tunjuk tombol **`Tandai semua dibaca`**.
  2. Pindah ke **`Jendela 1 — Direktur`**: klik **ikon lonceng di pojok kanan atas (TopBar)** untuk menunjukkan Direktur mengakses halaman **`Notifikasi`** (`/notifications`) langsung dari lonceng atas tanpa menu `Workspace`.

#### `7B [INTI]` Membandingkan Tampilan Dashboard Kepala Divisi vs Direktur (Seluruh Perusahaan)
- **🪟 Jendela & Akun:** Pakai **Jendela 3 (`Arif Budiman` — Head Eng)** & **Jendela 1 (`Hendra Wijaya` — Direktur)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Dashboard ini kami rancang fokus menyoroti kendala dan anggota yang butuh perhatian, bukan papan peringkat jumlah tugas, supaya karyawan tidak terjebak mengejar jumlah tugas palsu demi skor. Aksesnya juga terisolasi ketat per peran: Head hanya melihat divisinya sendiri, sedangkan Direktur melihat gambaran seluruh perusahaan — lengkap dengan pemisahan antara jumlah karyawan aktif dan karyawan yang benar-benar wajib lapor hari itu."*
- **Aksi:**
  1. Di **`Jendela 3 — Arif (Head Engineering)`**, klik menu **`Dashboard`** (`/dashboard`): tunjukkan pilihan cakupan data terkunci pada **`Divisi Saya`** (`Engineering`) sehingga Kepala Divisi tidak bisa melihat data divisi lain.
  2. Pindah ke **`Jendela 1 — Direktur`**, klik menu **`Dashboard`** (`/dashboard`):
     - Tunjukkan cakupan data **`Seluruh Perusahaan`** yang menampilkan **25 karyawan aktif** (setelah Budi Santoso aktivasi di Babak 1) dan **24 karyawan wajib lapor** (karena 1 orang — Gilang Ramadhan — sedang cuti resmi hari ini).
     - Pada dropdown filter **`Status Karyawan`**, pilih **`Intern`** (tabel langsung menyaring hanya 2 anak magang: `Raka Pratama` & `Nisa Amelia`), lalu kembalikan ke **`Semua Status Karyawan`**.

#### `7C [INTI]` Kepala Divisi Memantau Kesehatan Proyek & Kendala Kritis di Radar Risiko Proyek
- **🪟 Jendela & Akun:** Pakai **Jendela 3 (`Arif Budiman` — Head Eng)** · **✅ Tanpa Ganti Akun**
- **Aksi:**
  1. Di **`Jendela 3 — Arif`**, klik menu **`Radar Risiko Proyek`** (`/projects/risk`) di sidebar kiri.
  2. Ketik `Engineering` pada kotak pencarian proyek, lalu pada baris proyek **`WP-CORE (WorkPulse Platform Core 2026)`** klik tombol **`Rincian`**.
  3. Tunjukkan skor kesehatan proyek, sorotan kendala `CRITICAL` yang lewat batas waktu, serta tombol **`Buka Antrean Blocker Terkait`**.

#### `7D [INTI]` Direktur Meninjau Laporan Eksekutif, Menguji Filter Status, & Mengunduh CSV/PDF
- **🪟 Jendela & Akun:** Pakai **Jendela 1 (`Hendra Wijaya` — Direktur)** · **✅ Tanpa Ganti Akun**
- **Aksi:**
  1. Di **`Jendela 1 — Direktur`**, klik menu **`Laporan Eksekutif`** (`/reports`) di sidebar kiri.
  2. Klik tombol rentang waktu secara berurutan: **`Hari Ini`** → **`Pekan Ini`** → **`Bulan Ini`** → **`Kuartal Ini`**.
  3. **`[CABANG]` Uji Filter Status Karyawan Kosong:** Pada filter status karyawan, pilih **`Kontrak`** → tunjukkan pesan ramah **`"Belum ada data karyawan untuk penyaring yang dipilih."`**, lalu kembalikan ke **`Semua`**.
  4. Klik tombol **`Unduh Laporan (CSV)`** dan tunjuk tombol **`Cetak / PDF`** di sebelahnya.

---

### BABAK 8 — Pengaturan Master Data, Struktur Organisasi, Delegasi, & Kanal Notifikasi

#### `8A [CABANG]` HRGA Menonaktifkan & Mengaktifkan Kembali Akun Karyawan
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** · **✅ Tanpa Ganti Akun**
- **Aksi:**
  1. Di **`Jendela 4 — Dewi (HRGA)`**, buka menu **`Pengguna & Peran`** (`/admin/users`).
  2. Pada baris **`Budi Santoso`**, klik tombol **`Nonaktifkan`** → di jendela konfirmasi klik **`Ya, Nonaktifkan Akun`** (status berubah menjadi `Nonaktif` dan sesi aktifnya otomatis diputus).
  3. Masih pada baris **`Budi Santoso`**, klik tombol **`Aktifkan Kembali`** → klik **`Ya, Aktifkan Kembali`** (status kembali `Aktif`).
  4. Tunjuk baris **`Dewi Lestari`** sendiri yang bertanda **`Akun Anda`** (tombol nonaktifkan dikunci agar admin tidak bisa menonaktifkan dirinya sendiri).

#### `8B [INTI]` HRGA Mengelola Struktur Organisasi, Aturan Anti-Siklus, Status Magang, & Wewenang Proyek
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Tata kelola organisasi dijaga oleh tiga pagar pengaman. Pertama, seluruh perubahan jabatan atau atasan berlaku mulai hari ini ke depan (anti-backdating) agar konteks laporan masa lalu tetap jujur sesuai kondisi saat itu. Kedua, sistem menolak penugasan melingkar dan menolak Project Manager merangkap Escalation Reviewer di proyek yang sama demi prinsip check-and-balance. Ketiga, akun Intern otomatis dikecualikan dari peran atasan, PM, maupun Reviewer sampai resmi diangkat menjadi karyawan tetap."*
- **Aksi** (di menu **`Struktur Organisasi`** `/admin/organization`):
  1. **Tab 1 (`Struktur & Penugasan Karyawan`):** Klik tombol **`Atur Penugasan Baru`**, lalu di modal **`Atur Penugasan Organisasi`**:
     - Buka dropdown **`Atasan Langsung (Direct Manager)`** → tunjukkan bahwa nama anak magang (**`Raka Pratama`** & **`Nisa Amelia`**) tidak muncul di daftar pilihan atasan.
     - **`[CABANG]` Uji anti-siklus atasan melingkar (`422`):** Isi seluruh kolom wajib di modal tersebut dari atas ke bawah:
       - **Karyawan:** Pilih **`Arif Budiman (head.eng@dutamedia.com)`**
       - **Nama Jabatan (Job Title) \*:** Ketik `Head of Engineering` *(wajib diisi!)*
       - **Status Karyawan:** Pilih **`Karyawan Tetap`**
       - **Peran Jabatan:** Pilih **`Head / Kepala Divisi`**
       - **Fungsi / Divisi:** Pilih **`Engineering`**
       - **Atasan Langsung (Direct Manager):** Pilih **`Aditya Nugroho (Senior Frontend Developer)`** *(bawahannya sendiri!)*
       - **Tanggal Efektif Penugasan:** *(otomatis hari ini WIB)*
       - **Alasan Penugasan (Audit Log) \*:** Ketik `Tes cek validasi atasan melingkar` *(wajib diisi!)*
       - Klik **`Simpan Penugasan`** → **ditolak merah** (siklus garis atasan melingkar terdeteksi).
     - **Pratinjau angkat `Intern`:** Ubah **Karyawan** ke **`Raka Pratama (intern.frontend@dutamedia.com)`**, ubah **Status Karyawan** ke **`Karyawan Tetap`** → jelaskan bahwa saat anak magang diangkat menjadi karyawan tetap, hak jabatan struktural & cuti tahunannya langsung terbuka tanpa merusak riwayat magang masa lalunya → klik **`Batal`**.
  2. **Tab 2 (`Kewenangan Proyek (Project Authority)`):** Klik tombol **`Tetapkan Wewenang Proyek`**, lalu di modal **`Tetapkan Kewenangan Proyek`**:
     - Buka dropdown **`Project Manager *`** & **`Escalation Reviewer *`** → tunjukkan bahwa nama anak magang (`Intern`) tidak muncul di daftar pilihan.
     - **`[CABANG]` Uji tolak PM merangkap Escalation Reviewer di proyek yang sama:** Isi seluruh kolom wajib di modal tersebut dari atas ke bawah:
       - **Kode Proyek \*:** Ketik `WP-CORE`
       - **Nama Proyek \*:** Ketik `WorkPulse Platform Core 2026`
       - **Project Manager \*:** Pilih **`Arif Budiman (Head of Engineering)`**
       - **Escalation Reviewer \*:** Pilih **`Arif Budiman (Head of Engineering)`** *(orang yang sama)*
       - **Fungsi Terlibat:** Pastikan **`Engineering`** tercentang
       - **Tanggal Efektif:** *(otomatis hari ini WIB)*
       - **Alasan Penunjukan (Audit Log) \*:** Ketik `Tes validasi PM dan Reviewer tidak boleh orang yang sama`
       - Klik **`Tetapkan Proyek`** → **ditolak merah** (`"Project Manager dan Escalation Reviewer tidak boleh dijabat oleh orang yang sama."`) → klik **`Batal`**.
     - Klik sebentar tombol **`Tutup Wewenang`** pada salah satu kartu proyek untuk menunjukkan modal konfirmasi penutupan proyek wajib isi alasan → klik **`Batal`**.
- **Bilang singkat:** *"Aturan pengangkatannya tetap menjaga integritas data historis tanpa perlu membuat akun baru dari nol."*

#### `8C [INTI]` HRGA Mendelegasikan Reviewer Sementara, Membuktikan Akses Login Pengganti, Lalu Mencabutnya
- **🪟 Jendela & Akun:** Pakai **Jendela 4 (`Dewi Lestari` — HRGA)** & **Jendela 5 (Incognito)** · **🔄 Login di J5:** `lead.creative@dutamedia.com` (**Rian Kurniawan**, `Password123!`) · **🚪 Selesai Langkah:** Klik **Keluar Sesi** di **J5**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Jika seorang pimpinan divisi berhalangan atau sedang dinas dan ingin menunjuk pengganti sementara dari level di bawahnya atau divisi lain, tidak boleh hanya lewat pesan lisan — wajib lewat mandat Reviewer Sementara berbatas tanggal di sini. Akses review koreksi dan antrean blocker otomatis terbuka selama masa delegasi tanpa mengubah struktur permanen, dan langsung tertutup seketika saat dicabut."*
- **Aksi:**
  1. Di **`Jendela 4 — HRGA` (`/admin/temporary-reviewers`)**: klik tombol **`Delegasikan Reviewer Baru`**, lalu isi seluruh kolom di modal **`Delegasikan Reviewer Sementara`** dari atas ke bawah:
     - **1. Pejabat yang Berhalangan (Yang Digantikan) \*:** Pilih **`Gunawan Setiawan — Head of Operations & Infrastructure (Operations & Infrastructure)`**
     - **2. Divisi Wewenang Peninjauan (Otomatis):** *(otomatis terisi `Operations & Infrastructure` mengikuti pejabat yang digantikan)*
     - **3. Pejabat Pengganti Sementara (Penerima Delegasi) \*:** Pilih **`Rian Kurniawan — Creative & UI/UX Lead (Engineering)`** *(tunjukkan bahwa `Sistem Administrator` dan anak magang tidak muncul di daftar pilihan)*
     - **Tanggal Efektif Mulai \*:** Pilih **tanggal hari ini**
     - **Batas Tanggal Kedaluwarsa \*:** Pilih **tanggal besok**
     - **Alasan Delegasi (Audit Trail) \*:**
       ```text
       Gantikan review koreksi dan eskalasi kendala selama Head Ops audit luar kota
       ```
     - Klik **`Terbitkan Delegasi`** (status `Aktif`).
  2. **⚡ Efek Lintas Jendela (`Jendela 5`):** Login **`lead.creative@dutamedia.com`** (**Rian Kurniawan**).
     - *Lihat di layar:* Meski perannya `SUPERVISOR`, di sidebar langsung terbuka menu **`Review Koreksi`** (`/corrections/review`), **`Antrean Blocker`**, dan **`Penuaan & Eskalasi`** *(tanpa menu Persetujuan Cuti)*! Setelah itu **Keluar Sesi**.
  3. Balik ke **`Jendela 4 — HRGA` (`/admin/temporary-reviewers`)**: klik tombol **`Cabut`** pada baris delegasi Rian → di modal **`Cabut Wewenang Reviewer Sementara`**, isi kolom **`Alasan Pencabutan Wewenang *`:**
     ```text
     Head Ops sudah balik kantor dan aktif bertugas lagi
     ```
     → klik **`Cabut Wewenang Sekarang`**.
- **Bilang singkat:** *"Wewenang pengganti sementara langsung berhenti detik itu juga setelah dicabut."*

#### `8D [CABANG]` Membandingkan Hak Kelola Pemilik Kebijakan antara Direktur dan HRGA
- **🪟 Jendela & Akun:** Pakai **Jendela 1 (`Hendra Wijaya` — Direktur)** & **Jendela 4 (`Dewi Lestari` — HRGA)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kewenangan mengatur aturan sistem sengaja dibagi ke beberapa Pemilik Kebijakan sesuai kategorinya — bukan dipegang tunggal oleh satu Admin. Setiap kategori tidak boleh dibiarkan kosong tanpa pemilik aktif, dan tanggal mulai berlaku kebijakan maupun penugasan pemilik tidak pernah bisa diubah surut ke masa lampau."*
- **Aksi:**
  1. Di **`Jendela 1 — Direktur`**, buka menu **`Kebijakan & Cut-off`** (`/admin/policies`): gulir ke bagian **`Penugasan Pemilik Kebijakan (Policy Owners)`** → tunjukkan Direktur bisa klik **`+ Tetapkan Pemilik`**, **`Ubah`**, atau **`Cabut`** (sistem otomatis menolak jika seseorang mencoba mencabut pemilik aktif terakhir di suatu kategori), serta tombol **`Unduh Audit CSV`** di bagian bawah.
  2. Bandingkan dengan **`Jendela 4 — Dewi (HRGA)`** di halaman **`Kebijakan & Cut-off`** (`/admin/policies`): tunjukkan HRGA hanya bisa membuat versi kebijakan pada kategori yang menjadi wewenangnya, sedangkan tabel penugasan pemilik di bawahnya terkunci **`Hanya Lihat (Direktur/Admin)`**.

#### `8E [INTI]` Direktur Memeriksa Status Saluran Notifikasi & Melakukan Uji Kirim
- **🪟 Jendela & Akun:** Pakai **Jendela 1 (`Hendra Wijaya` — Direktur)** · **✅ Tanpa Ganti Akun**
> **🎯 Sampaikan di Awal (Alasan & Aturan Sistem):**  
> *"Kami menampilkan status seluruh kanal notifikasi secara jujur di sini: pusat notifikasi dalam aplikasi sudah aktif penuh, sementara Email dan Browser Push ditampilkan dalam Mode Simulasi Aktif selama kunci server email resmi perusahaan belum dihubungkan — sehingga tidak ada status pengiriman luar yang dipalsukan, dan admin bisa langsung menguji pengirimannya."*
- **Aksi:** Di `/admin/notifications`, tunjuk 3 kartu status saluran (**`In-App: Aktif`**, **`Email & Browser Push: Mode Simulasi Aktif`**) & **`Matriks Routing Kanal Per Trigger Event`** (9 trigger). Di panel **`Instrumen Uji Pengiriman Kanal Notifikasi`**, isi ketiga kolom dari kiri ke kanan:
  - **Pilih Kanal Uji:** Pilih **`Pusat Notifikasi In-App`**
  - **Skenario Event:** Pilih **`BLOCKER_RAISED`**
  - **Target Penerima (Email / Identitas):** Ketik `dev.frontend@dutamedia.com`
  - Klik **`Kirim Notifikasi Uji Coba`** → hasil pengiriman langsung muncul di tabel **`Log Pengiriman Uji Coba Terbaru`**.

---

### BABAK 9 — Penutupan: Direktur Mengembalikan Jam Cut-Off ke Jadwal Standar Kantor

- **🪟 Jendela & Akun:** Pakai **Jendela 1 (`Hendra Wijaya` — Direktur)** · **✅ Tanpa Ganti Akun**
- **Aksi:** Di **`Kebijakan & Cut-off`** (`/admin/policies`), klik **`+ Buat Versi Kebijakan Baru`**, lalu isi seluruh kolom modal **`Buat Versi Kebijakan Baru`** dari atas ke bawah:
  - **Kategori Kebijakan \*:** Biarkan **`1. Jam Kerja & Batas Waktu Check-In (Check-In Timing)`**
  - **Batas Tepat Waktu Pagi \*:** `09:00`
  - **Batas Kunci Pengisian Pagi (Cut-Off) \*:** `09:30`
  - **Batas Tepat Waktu Sore (EOD) \*:** `17:00`
  - **Batas Kunci Pengisian Sore (Cut-Off) \*:** `21:00`
  - **Tanggal Mulai Berlaku \*:** *(biarkan otomatis terisi tanggal hari ini)*
  - **Tanggal Berakhir (Opsional):** *(biarkan kosong)*
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
