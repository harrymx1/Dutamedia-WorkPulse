# SKRIP DEMO LIVE KOMPREHENSIF MULTI-JENDELA — WORKPULSE (100% SEMUA ALUR, KONDISI, & INPUT SIAP SALIN)
# PANDUAN LATIHAN & PRESENTASI RESMI DI HADAPAN PIMPINAN PERUSAHAAN

**PT Dutamedia Mandiri Pratama — Malang (WIB)**  
**Alamat Aplikasi Live:** `https://dutamedia-workpulse.vercel.app`  
**Kata Sandi Semua Akun Uji:** `Password123!`  
**Prinsip Skrip Ini:** **0% Improvisasi Dadakan!** Setiap formulir, setiap dropdown, dan setiap jendela modal di **Babak 1 s/d Babak 9** sudah dilengkapi **isian teks siap salin (*copy-paste*) yang 100% logis** (selaras antara jabatan pelapor, divisi, proyek, tugas harian, kategori kendala, dan penanggung jawabnya).

---

## 1. MATRIKS PERSIAPAN DATA DUMMY (`seed.ts` — WAJIB DI-RESET BERSIH HARI-H)

| Elemen Data Dummy di Database Live | Akun / Objek Terkait | Fitur yang Langsung Terbukti di Layar Saat Demo |
|---|---|---|
| **25 Akun Resmi** (`23 Tetap + 2 Intern`) | Termasuk `Fajar Ramadhan` (`INVITED`), `Raka Pratama` & `Nisa Amelia` (`Intern`) | Direktori `/admin/users`, filter `Status Karyawan`, & pengecualian `Intern` dari 7 jabatan keputusan. |
| **Rantai `H-2 → H-1` Lengkap** | `product@dutamedia.com` *(Dio Bayu — Product Manager Delivery)* | Langsung muncul **`Prioritas Kemarin Sore`** + **`Draf Tugas Berlanjut dari Kemarin (2 Tersedia: Carry-Over #2 AMBER & #1 GREEN)`**. |
| **Formulir Pagi Kosong Siap Pakai** | `qa@dutamedia.com` *(Nadia — QA)* & `intern.frontend@dutamedia.com` *(Raka — Intern Frontend)* | Khusus demo kirim **`0 Komitmen Hari Ini`** sampai tuntas (`qa`) dan alur **Lapor Blocker → Tautkan ke Komitmen Pagi** (`Raka`, punya 1 Carry-Over `WP-CORE`). |
| **Komitmen Pagi Hari Ini Terkunci + `H-1`** | `dev.frontend@dutamedia.com` *(Aditya — Frontend Dev)* | Langsung tampil Kartu Ringkasan Terkunci (`ON-TIME`) + `Prioritas Kemarin Sore`, siap langsung untuk **Koreksi Pagi (`Minor` & `Material`)**. |
| **Cuti Resmi `APPROVED` Hari Ini** | `specialist.it@dutamedia.com` *(Achmad Noer — PIC `HOSTING_DOMAIN`)* | Sekaligus membuktikan **2 fitur**: (1) **Spanduk Hijau Bebas Check-In**, dan (2) **Aturan Cuti Vertikal Blocker** (`HOSTING_DOMAIN` otomatis naik ke `Gunawan Setiawan`!). |
| **6 Tiket Blocker + 1 Tiket `CRITICAL` Lewat Batas Waktu** | `WP-CORE` (`targetResolutionAt = -2 jam`), `NETWORK`, `OFFICE_FACILITY`, `CLIENT`, `APPROVAL`, `CROSS_TEAM` | `/blockers/aging` langsung menyala **`Lewat Batas Waktu: 1`**, `/projects/risk` menyorot risiko `WP-CORE`, dan tombol **`Bantu Unblock`** langsung aktif! |
| **3 Pengajuan Cuti/Izin `PENDING`** | `Siti Rahma` (`ANNUAL`), `Maya Putri` (`ANNUAL`), & **`Raka Pratama` (`PERMIT` — pil ungu `Intern`)** | `/leave/queue` Kepala Divisi Engineering langsung menampilkan Cuti Tahunan Karyawan Tetap **berdampingan** dengan Izin Anak Magang (`Intern`). |
| **2 Peristiwa Kepatuhan HRGA** | `Siti Rahma` (`PATTERN_FLAG_3X` — **`OPEN`**) & `Nadia Kusuma` (`NO_SUBMISSION` — **`ADDRESSED`**) | `/compliance` langsung membuktikan tombol **`Tindak Lanjut`** (baris `OPEN`) sekaligus tombol **`Ubah Catatan`** (baris `ADDRESSED`). |
| **2 Catatan Coaching Awal (2 Mode)** | `Aditya Nugroho` oleh `Arif Budiman` (**`Dibagikan ke Karyawan`** vs **`Rahasia Manajemen`**) | `/coaching` & `/notifications` langsung membuktikan catatan `Dibagikan` masuk ke akun karyawan, sementara `Rahasia Manajemen` 100% tersembunyi! |
| **1 Dispensasi Resmi Aktif** | `Hari Wibowo` (`DINAS_LUAR`, `ST/HRGA/2026/XI/104`, `H+2 s/d H+3`) | Panel kanan `/exemptions` langsung terisi tabel dispensasi aktif + tombol **`Cabut`**! |
| **5 Kebijakan Standar (`09:00 / 09:30 WIB`)** | Pemilik Kebijakan: Direktur, Admin, HRGA | **Babak 2A** membuktikan formulir pagi benar-benar `LOCKED` lewat `09:30 WIB`, lalu digeser live di depan atasan! |

---

## 2. STRATEGI 6 JENDELA BROWSER (TANPA BOLAK-BALIK LOGIN-LOGOUT)

| Jendela | Peran & Akun Login (`Password123!`) | Halaman Awal | Dipakai di Babak |
|---|---|---|---|
| **Jendela 1** | **Direktur / CEO** — `direktur@dutamedia.com` *(Hendra Wijaya)* | `/admin/policies` | Babak 2, 7, 8, 9 |
| **Jendela 2** | **Karyawan Utama** — Mulai `product@dutamedia.com` *(Dio Bayu)*; di Babak 3C–5 ganti `dev.frontend@dutamedia.com` *(Aditya)* | `/daily/morning` | Babak 2, 3, 4, 5, 7 |
| **Jendela 3** | **Spesialis Kategori (`isCategoryOwner`)** — `network.infra@dutamedia.com` *(Fakhrizal Asshiddiq)* | `/blockers` | Babak 3 |
| **Jendela 4** | **Kepala Divisi Engineering** — `head.eng@dutamedia.com` *(Arif Budiman)* | `/dashboard` | Babak 3, 4, 5, 6, 7 |
| **Jendela 5** | **HRGA** — `hrga@dutamedia.com` *(Dewi Lestari)* | `/admin/users` | Babak 1, 6, 8 |
| **Jendela 6 (Incognito)** | **Tamu / Karyawan Baru / QA / Cuti / Anak Magang / Reviewer Sementara** | `/login` | Babak 1 (`Budi`), Babak 2 (`Nadia`, `Achmad`), Babak 3 & 5 (`Raka`), Babak 8 (`Rian`) |

---

## 3. ALUR 9 BABAK DEMO LIVE — LENGKAP DENGAN SEMUA INPUT SIAP SALIN

---

### BABAK 1 — PEMBUKAAN: UNDANGAN 72 JAM, CABUT & KIRIM ULANG, TOKEN MURNI, AKTIVASI, LOGIN, PROFIL, 403/404, & PEMISAHAN TUGAS ADMIN *(6 Menit · Jendela 5 → Jendela 6)*

1. **1A — HRGA Membuat Undangan Karyawan Baru, Mencabut, & Menerbitkan Ulang Token (`Jendela 5 — hrga@dutamedia.com` di `/admin/users`)** *(Ambil **`WP-SS-31`** & **`WP-SS-32`**)*:
   - Klik tombol hijau **`Undang Pengguna Baru`**, lalu isi seluruh kolom berikut (siap salin):
     * **Nama Lengkap:** `Budi Santoso`
     * **Alamat Email Perusahaan:** `budi.santoso@dutamedia.com`
     * **Status Karyawan:** `Karyawan Tetap`
     * **Peran:** `Karyawan`
     * **Divisi:** `Engineering`
     * **Jabatan:** `Backend Engineer`
   - Klik **`Terbitkan Undangan (72 Jam)`** → tunjukkan kotak hasil yang menampilkan **kode token murni 64 karakter** + tombol **`Salin Token Aktivasi`** → klik **`Selesai`**.
   - **Demo Cabut Token & Kirim Ulang:**
     * Pada baris `Budi Santoso` (`Status Akun: Menunggu Aktivasi`), klik tombol **`Cabut`** → pada jendela konfirmasi klik **`Cabut Undangan`** *(tunjukkan ke atasan: jika token salah kirim/bocor, status undangan langsung berubah merah **`Dicabut`** dan token lama hangus)*.
     * Selanjutnya pada baris `Budi Santoso` yang sama, klik tombol **`Kirim Ulang`** → pada jendela konfirmasi klik **`Terbitkan Tautan Baru`** → klik **`Salin Token Aktivasi`** untuk menyalin token baru yang sah, lalu klik **`Selesai`**.

2. **1B — Uji Tolak Login `INVITED`, Aktivasi Token Murni, & Login Pertama Kali (`Jendela 6 — Incognito` di `/login` & `/activate`)** *(Ambil **`WP-SS-01`** & **`WP-SS-02`**)*:
   - Di **`/login`**, coba masuk sebelum aktivasi:
     * **Email Perusahaan:** `budi.santoso@dutamedia.com`
     * **Kata Sandi:** `Password123!`
     * Klik **`Masuk Sistem`** → tunjukkan pesan penolakan merah: **`"Akun Anda belum diaktifkan..."`**.
     * Tunjukkan juga tombol **ikon mata**, kotak centang **`Ingat email di perangkat ini`**, kunci tunggu otomatis (`429`) jika 5x salah sandi, dan petunjuk lupa kata sandi di bawah tombol masuk (hubungi HRGA/Admin).
   - Klik tab **`Aktivasi Akun`** (`/activate`), lalu isi seluruh kolom:
     * **Token Aktivasi:** *(Tempel / Paste kode token murni 64 karakter yang barusan disalin dari HRGA)* → tunjukkan langsung muncul **Kartu Pratinjau Akun (`Budi Santoso · Engineering · UNDANGAN AKTIF`)**.
     * **Kata Sandi Baru:** `Password123!` *(tunjukkan 3 syarat centang hijau & 4 bar meteran `Sangat Kuat` menyala)*.
     * **Konfirmasi Kata Sandi:** `Password123!`
     * Klik **`Aktivasi Akun`** → muncul kartu **Aktivasi Berhasil!** (token langsung berstatus `USED` / hangus).
   - Klik **`Lanjut ke Halaman Masuk`**, lalu masuk:
     * **Email Perusahaan:** `budi.santoso@dutamedia.com` | **Kata Sandi:** `Password123!` → klik **`Masuk Sistem`** → mendarat otomatis di `/daily/morning`!

3. **1C — Uji Profil (`/profile`), Layar `403`, Layar `404`, & Pemisahan Tugas Admin (`Jendela 6`):**
   - Klik avatar **`BS`** di kanan atas (`/profile`) *(Ambil **`WP-SS-17`**)*:
     * Tunjukkan **Panel 1 (Kartu Identitas & Penugasan Aktif)**.
     * Di **Panel 2 (Keamanan & Kata Sandi — Pembaruan Mandiri)**, tunjukkan pengisian (jangan klik simpan agar sandi tetap `Password123!`):
       - **Kata Sandi Saat Ini:** `Password123!`
       - **Kata Sandi Baru:** `DutamediaBaru2026!` *(tunjukkan 3 syarat centang hijau termasuk "Berbeda dari kata sandi saat ini")*
       - **Konfirmasi Kata Sandi Baru:** `DutamediaBaru2026!`
       - Tunjukkan kotak centang **`Akhiri seluruh sesi aktif di perangkat/peramban lain setelah kata sandi diperbarui`**.
     * Tunjukkan **Panel 3 (Ringkasan Kanal Notifikasi Perangkat Ini)**.
   - **Uji Layar `403` & `404`:**
     * Ketik manual di bilah alamat browser: `https://dutamedia-workpulse.vercel.app/admin/policies` → dicegat ke **`403 — Akses Dibatasi`** *(Ambil **`WP-SS-18`**)* → klik **`Kembali ke Beranda`**.
     * Ketik manual: `https://dutamedia-workpulse.vercel.app/halaman-tidak-ada` → tampil **`404 — Halaman Tidak Ditemukan`** → klik **`Kembali ke Beranda`**.
   - Klik tombol **`Keluar`** di pojok kiri bawah Jendela 6. *(Jelaskan juga bahwa akun `admin@dutamedia.com` / `SYSTEM_ADMIN` sengaja diblokir `403` dari menu `Workspace` agar statistik kepatuhan murni berisi karyawan operasional).*

---

### BABAK 2 — KUNCI OTOMATIS PAGI (`LOCKED`), GESER JAM KERJA TRANSPARAN, & SIKLUS LENGKAP HARIAN (`0 KOMITMEN`, `CARRY-OVER`, `CUTI RESMI`, `TUGAS TAMBAHAN`, `EOD`, & `RIWAYAT`) *(10 Menit · Jendela 2 ↔ Jendela 1 ↔ Jendela 6)*

1. **2A — Pembuktian Kunci Otomatis (`LOCKED`), Opsi A (`Komitmen Pagi Terlewat`), & Geser Jam Batas Pagi oleh Direktur (`Jendela 2 → Jendela 1 → Jendela 2`):**
   - Buka **Jendela 2 (`product@dutamedia.com` — Dio Bayu Bagaskara, Product Manager Delivery) di `/daily/morning`**:
     * Tunjukkan spanduk merah **`Terkunci (LOCKED)`** karena waktu demo sudah melewati batas pagi standar (`09:30 WIB`).
     * Klik tab **`2. Additional Work`** (`/daily/additional-work`) → tunjukkan bahwa meskipun Komitmen Pagi terkunci, formulir Tugas Tambahan tetap terbuka dengan alasan otomatis **`Komitmen Pagi Terlewat`** (Opsi A: disiplin pagi tetap jujur tercatat tidak lapor, namun hasil kerja siang–sore tetap terekam).
   - **Pindah ke Jendela 1 (`direktur@dutamedia.com` — Hendra Wijaya) di `/admin/policies`** *(Ambil **`WP-SS-35`**)*:
     * Klik tombol **`+ Buat Versi Kebijakan Baru`** di kanan atas, lalu isi seluruh 6 kolom modal (siap salin):
       - **Batas Tepat Waktu Pagi *:** `16:00` *(atau 1–2 jam di atas jam demo saat ini)*
       - **Batas Kunci Pengisian Pagi (Cut-Off) *:** `16:30`
       - **Batas Tepat Waktu Sore (EOD) *:** `17:00`
       - **Batas Kunci Pengisian Sore (Cut-Off) *:** `21:00`
       - **Tanggal Mulai Berlaku *:** *(Biarkan tanggal hari ini WIB)*
       - **Alasan Perubahan Kebijakan * (min. 15 karakter):**
         ```text
         Penyesuaian sementara jam batas pengisian pagi untuk demonstrasi live sistem WorkPulse di hadapan manajemen
         ```
     * Klik **`Simpan Versi Kebijakan`** → tunjukkan baris baru langsung tercatat di tabel **`Jejak Audit Perubahan Kebijakan`** di bagian bawah!
   - **Kembali ke Jendela 2 (`product@dutamedia.com` di `/daily/morning`) lalu tekan `F5` (Refresh):**
     * Formulir Komitmen Pagi langsung terbuka dengan status hijau **`ON-TIME`** (dan perhatikan lencana angka merah langsung muncul di menu sidebar **`Notifikasi`** & ikon lonceng kanan atas karena adanya notifikasi perubahan kebijakan!).

2. **2B — Kirim `0 Komitmen Hari Ini` Sampai Tuntas (`Jendela 6 — qa@dutamedia.com` / Nadia Kusuma di `/daily/morning`)** *(Ambil **`WP-SS-05`**)*:
   - Masuk di Jendela 6 sebagai **`qa@dutamedia.com`** (`Password123!`).
   - Sesuai urutan layar dari atas ke bawah, centang kotak paling atas: **`Hari ini tidak ada komitmen harian khusus (0 Komitmen)`**.
   - Isi kolom wajib **`Alasan Tidak Menetapkan Komitmen Spesifik *`** (min. 10 karakter — siap salin):
     ```text
     Mengikuti pelatihan sertifikasi pengujian keamanan aplikasi (OWASP) dan audit mutu internal seharian penuh bersama tim HRGA
     ```
   - Klik **`Kirim Morning Commitment`** → tampil kartu hijau **`Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)`**! Klik **Keluar** di Jendela 6.

3. **2C — Komitmen Pagi Lengkap: `Prioritas Kemarin Sore`, `Carry-Over #2 AMBER`, Slot #3 Logis, & `Simpan Draf` (`Jendela 2 — product@dutamedia.com` di `/daily/morning`)** *(Ambil **`WP-SS-03`** & **`WP-SS-04`**)*:
   - Di Jendela 2 (`Dio Bayu — Product Manager Delivery`), tunjukkan kotak kuning **`Prioritas Kemarin Sore`** (*"Selesaikan spesifikasi penagihan PRJ-PORTAL dan validasi kriteria UAT bersama QA sebelum pukul 14:00 WIB"*).
   - Klik **`Lihat Draf`** pada panel **`Draf Tugas Berlanjut dari Kemarin (2 Tersedia)`**:
     * Tunjukkan item pertama bertanda **`Carry-Over #2 · Disarankan AMBER`** (karena sudah berlanjut 2 hari berturut-turut dari `H-2` ke `H-1`).
     * Centang kedua item draf tersebut → klik **`Gunakan Item Terpilih ke Slot Hari Ini`** (Slot #1 otomatis terisi proyek `[PRJ-PORTAL]` berisiko `AMBER` lengkap dengan potensi kendalanya, dan Slot #2 otomatis terisi proyek `[PRJ-CORE]` berisiko `GREEN`).
   - Klik **`+ Tambah Slot Komitmen`** untuk membuka **Slot Komitmen #3** (tunjukkan tombol tambah slot hilang karena batas maksimum adalah 3 komitmen utama), lalu isi seluruh kolom Slot #3 secara logis sesuai peran Product Manager (siap salin):
     * **Teks Komitmen Terukur *:**
       ```text
       Menyelesaikan validasi struktur kolom ekspor laporan eksekutif CSV bersama tim Finance dan QA
       ```
     * **Proyek Terkait (Opsional):** Pilih **`[WP-CORE] WorkPulse Core Platform`**
     * **Tautan Tiket Tugas atau Blocker yang Ingin Dikerjakan (Opsional):**
       ```text
       https://github.com/dutamedia/workpulse/issues/230
       ```
       *(Tunjukkan juga tombol **`Pilih Blocker Aktif`** di sebelahnya — jelaskan tombol ini dipakai bila tugas hari ini adalah untuk membereskan sebuah tiket blocker aktif).*
     * **Tingkat Risiko Tugas Hari Ini *:** Pilih **`AMBER`**
     * **Potensi Kendala / Hambatan *:**
       ```text
       Urutan kolom status karyawan pada file CSV masih menunggu konfirmasi akhir dari Senior Finance Staff
       ```
     * **Tindakan / Bantuan yang Diharapkan (Opsional):**
       ```text
       Mohon konfirmasi persetujuan struktur kolom laporan dari tim Finance sebelum pukul 14:00 WIB
       ```
   - Klik tombol **`Simpan Draf`** di kiri bawah → tekan `F5` (Refresh) untuk membuktikan ketikan aman tersimpan di browser dan tidak hilang!
   - Klik tombol hijau **`Kirim Morning Commitment`** → formulir terkunci rapi (**`ON-TIME`**) dan menampilkan Kartu Ringkasan Terkunci + tombol **`Ajukan Koreksi Komitmen Pagi`** *(Ambil **`WP-SS-06`**)*.

4. **2D — Pembuktian Karyawan Sedang Cuti Resmi Disetujui (`Jendela 6 — specialist.it@dutamedia.com` / Achmad Noer Wahid):**
   - Masuk di Jendela 6 sebagai **`specialist.it@dutamedia.com`** (`Password123!`).
   - Tunjukkan layar `/daily/morning` langsung terkunci dengan **Spanduk Hijau `Masa Cuti Resmi Disetujui (Cuti Tahunan)`** — bebas dari kewajiban Komitmen Pagi, Tugas Tambahan, dan Evaluasi Sore! Klik **Keluar** di Jendela 6.

5. **2E — Pekerjaan Tambahan Siang Hari: Tambah 2 Tugas, Uji `Edit`, & Uji `Hapus` (`Jendela 2 — product@dutamedia.com` di `/daily/additional-work`)** *(Ambil **`WP-SS-07`**)*:
   - Klik tab **`2. Additional Work`** (`/daily/additional-work`), lalu isi **Tugas Tambahan #1** (siap salin — 100% logis untuk Product Manager Delivery di bawah Head of Delivery `Dharma Putra`):
     * **Deskripsi Pekerjaan Tambahan *:**
       ```text
       Menyusun revisi matriks hak akses modul portal penagihan klien atas permintaan mendadak klien
       ```
     * **Alasan Pekerjaan Tambahan *:** Pilih **`Penugasan Baru dari Atasan`**
     * **Ditugaskan Oleh (Atasan Langsung/Lead) *:** Pilih **`Dharma Putra`** *(Head of Delivery — tunjukkan bahwa nama anak magang `Raka Pratama` & `Nisa Amelia` 0 kali muncul di daftar atasan!)*
     * **Proyek Terkait (Opsional):** Pilih **`[PRJ-PORTAL]`**
     * **Tautan Referensi (Opsional):**
       ```text
       https://github.com/dutamedia/workpulse/issues/235
       ```
     * Klik **`Tambahkan Pekerjaan`**.
   - Sekarang isi **Tugas Tambahan #2** (khusus untuk mendemokan fitur **`Edit`** dan **`Hapus`** — siap salin):
     * **Deskripsi Pekerjaan Tambahan *:**
       ```text
       Menyiapkan draf agenda rapat sinkronisasi mingguan tim Delivery
       ```
     * **Alasan Pekerjaan Tambahan *:** Pilih **`Tugas Terlewat Dicatat Pagi`** *(jelaskan: dipakai bila sudah kirim komitmen pagi lalu baru teringat ada 1 tugas rutin yang lupa dimasukkan)*
     * **Proyek Terkait (Opsional):** Biarkan `-- Non-Proyek / Operasional Rutin --`
     * Klik **`Tambahkan Pekerjaan`**.
   - **Demo `Edit` Tugas Tambahan #2:**
     * Klik tombol **`Edit`** pada kartu *Menyiapkan draf agenda...*, ubah deskripsinya menjadi:
       ```text
       Menyiapkan draf agenda dan daftar periksa rapat sinkronisasi mingguan tim Delivery
       ```
     * Klik **`Simpan Perubahan`**.
   - **Demo `Hapus` Tugas Tambahan #2:**
     * Klik tombol **`Hapus`** pada kartu Tugas Tambahan #2 tersebut → isi kolom wajib **`Alasan Penghapusan *`** (min. 5 karakter — siap salin):
       ```text
       Agenda rapat sudah digabungkan langsung ke dokumen evaluasi proyek PRJ-PORTAL oleh Project Manager
       ```
     * Konfirmasi hapus *(jelaskan: jika yang diubah/dihapus adalah tugas pemberian atasan, atasan penugas otomatis menerima notifikasi di Pusat Notifikasi)*. Kini tersisa 1 Tugas Tambahan aktif (`Menyusun revisi matriks...`).

6. **2F — Evaluasi Sore (`/daily/eod`): 4 Hasil Capaian, `Lanjutkan Besok` (Opsional) vs `Tidak Dilanjutkan` (Wajib Alasan), Hak Pilih `GREEN` (`DEC-003`), & Kunci Pasca-EOD (`Jendela 2 — product@dutamedia.com`)** *(Ambil **`WP-SS-08`** & **`WP-SS-09`**)*:
   - Klik tab **`3. EOD Outcome`** (`/daily/eod`), lalu evaluasi ke-3 komitmen pagi dan 1 tugas tambahan secara berurutan:
     * **Komitmen #1 (`Finalisasi spesifikasi alur penagihan otomatis modul PRJ-PORTAL`):**
       - Pilih Hasil Pencapaian: **`Selesai`** *(tuntas 100%, tidak perlu mengisi alasan tambahan)*.
     * **Komitmen #2 (`Menyusun dokumen kriteria penerimaan fitur SSO Enterprise`):**
       - Pilih Hasil Pencapaian: **`Sebagian`**
       - Pilih Keputusan Kelanjutan: **`Lanjutkan Besok (Tugas Berlanjut)`** *(tunjukkan bahwa kolom **`Catatan Kelanjutan (Opsional)`** tidak wajib, namun bisa diisi sebagai pengingat besok pagi — siap salin)*:
         ```text
         Tinggal menyelesaikan bagian skenario batas waktu sesi login paralel besok pagi
         ```
     * **Komitmen #3 (`Menyelesaikan validasi struktur kolom ekspor laporan eksekutif CSV...`):**
       - Pilih Hasil Pencapaian: **`Belum Selesai`**
       - Pilih Keputusan Kelanjutan: **`Tidak Dilanjutkan`** *(tunjukkan aturan baru: karena dipilih **Tidak Dilanjutkan**, kolom **`Alasan Tidak Dilanjutkan *`** menjadi **WAJIB** diisi agar atasan tahu mengapa tugas yang belum beres dihentikan — siap salin)*:
         ```text
         Validasi kolom CSV diambil alih langsung oleh Senior Finance Staff sehingga tidak perlu dilanjutkan lagi oleh Product Manager
         ```
     * **Pekerjaan Tambahan #1 (`Menyusun revisi matriks hak akses modul portal penagihan klien...`):**
       - Pilih Hasil Pencapaian: **`Dibatalkan`**
       - Isi kolom wajib **`Alasan Pembatalan Pekerjaan Tambahan *`** (siap salin):
         ```text
         Klien memutuskan tetap memakai matriks hak akses versi awal hingga rilis tahap pertama selesai
         ```
   - **Pada Panel `Status Refleksi Akhir Hari Ini (Final Daily Status)`:**
     * Tunjukkan sistem memberi saran status berdasarkan risiko, namun sesuai **`DEC-003`**, karyawan **tetap bebas memilih `GREEN`** (tidak dikunci paksa).
     * Pilih **`AMBER`**, lalu isi kolom wajib **`Penjelasan Risiko / Kendala Hari Ini *`** (min. 10 karakter — siap salin):
       ```text
       Satu komitmen spesifikasi SSO masih perlu diselesaikan besok pagi sekitar 1 jam kerja
       ```
   - **Pada Kolom `Prioritas Utama Besok (Opsional)`** (siap salin):
     ```text
     Menuntaskan dokumen kriteria penerimaan SSO Enterprise dan mendampingi uji terima PRJ-PORTAL bersama QA
     ```
   - Klik **`Kirim Evaluasi EOD`** → tampil Kartu Ringkasan EOD Terkunci + tombol **`Ajukan Koreksi EOD`**.
   - **Buktikan Kunci Otomatis Pasca-EOD:** Klik kembali tab **`2. Additional Work`** (`/daily/additional-work`) → tunjukkan spanduk **`Evaluasi Sore (EOD) Hari Ini Telah Ditutup — Formulir Terkunci`** dan tombol berubah menjadi **`Terkunci Pasca-EOD`** (sedangkan tautan **`Lapor Blocker`** tetap aktif 24 jam!).

7. **2G — Riwayat Saya (`/daily/history` di Jendela 2)** *(Ambil **`WP-SS-10`**)*:
   - Klik menu **`Riwayat Saya`** (`/daily/history`) → tunjukkan 4 kartu ringkasan KPI (`Ketepatan Waktu Check-In`, `Hari Hijau`, `Hari Amber`, `Hari Merah`), klik baris tanggal hari ini (`24 Nov 2026`) atau kemarin (`23 Nov 2026`) untuk membuka rinciannya (*expand row*), lalu klik **`Unduh CSV`**.

---

### BABAK 3 — SIKLUS LENGKAP BLOCKER: 16 KATEGORI, 9 DAMPAK, CUTI VERTIKAL, LAPOR BLOCKER SEBELUM KOMITMEN PAGI, KOLABORASI 4 JENDELA, DYNAMIC RE-ROUTING, TERIMA RISIKO, HAPUS, & AGING *(9 Menit · Jendela 6 ↔ Jendela 3 ↔ Jendela 4 ↔ Jendela 2)*

1. **3A — Satu Alur Logis & Efektif: Pratinjau Cuti Vertikal, Buat 1 Tiket Blocker Sebelum Komitmen Pagi, Lalu Tautkan ke `Tiket Blocker Penyebab` (`Jendela 6 — intern.frontend@dutamedia.com` / Raka Pratama)** *(Ambil **`WP-SS-11`** & **`WP-SS-12`**)*:
   - Masuk di Jendela 6 sebagai **`intern.frontend@dutamedia.com`** (`Password123!` — *Raka Pratama, Frontend Developer Intern yang tugas `Carry-Over #1`-nya hari ini adalah menggarap tampilan modul pengajuan izin `WP-CORE` dan belum mengirim Komitmen Pagi*).
   - Buka menu **`Lapor Blocker`** (`/raise-blockers`):
     1. **Tunjukkan Aturan Cuti Vertikal (`DEC-014` & `DEC-017`):**
        - Pada dropdown **`Kategori Kendala *`**, pilih dulu **`1. Teknis & Sistem` → `Hosting, Cloud & Domain (HOSTING_DOMAIN)`**.
        - Tunjuk **Panel Jalur Penanganan Otomatis** di bagian bawah: karena PIC resminya (`Achmad Noer Wahid`) sedang **Cuti Resmi (`APPROVED`) hari ini**, tiket **tidak pernah jatuh ke orang yang sedang cuti dan tidak pernah turun ke rekan/bawahan**, melainkan otomatis **naik vertikal ke atasan langsungnya (`Gunawan Setiawan` — Head of Ops & Infra)**!
     2. **Isi Tiket Utama Demo (100% Logis & Nyambung dengan Tugas Frontend Raka di `WP-CORE` — Siap Salin):**
        - **Judul Kendala * (10–140 karakter):**
          ```text
          Server Staging WP-CORE Mengalami 502 Bad Gateway Saat Uji Tampilan Modul Pengajuan Izin
          ```
        - **Tautkan ke Komitmen / Tugas Hari Ini (Opsional):** *(Biarkan kosong karena Raka sengaja melapor Blocker lebih dulu sebelum mengisi Komitmen Pagi!)*
        - **Kategori Kendala *:** Ubah ke **`1. Teknis & Sistem` → `Server & Rilis Sistem (INFRA)`** *(tunjukkan 16 kategori dalam 5 kelompok)*.
        - **Dampak Kendala * (Pilih 1 s/d maksimal 3 dampak):**
          * Centang dulu 3 kotak untuk memperlihatkan ke atasan bahwa kotak ke-4 s/d ke-9 otomatis terkunci (`3 / 3 dipilih`), lalu lepas 1 kotak sehingga tersisa **2 dampak yang paling masuk akal untuk server staging internal**:
            - `[x]` **`Target & Tenggat Waktu (MILESTONE)`**
            - `[x]` **`Satu Tim / Divisi (TEAM)`**
        - **Tingkat Keparahan *:** Klik kartu **`High (Target 4 jam)`**
        - **Deskripsi Kendala & Upaya Mandiri * (min. 20 karakter):**
          ```text
          Sejak pukul 08:30 WIB server staging WP-CORE gagal memuat halaman modul pengajuan izin dengan pesan 502 Bad Gateway sehingga pengujian tampilan responsif belum bisa dilanjutkan. Sudah dicoba bersihkan cache browser dan cek dari perangkat rekan satu tim namun container staging tetap tidak merespons.
          ```
        - **Bantuan Konkret yang Diharapkan (Opsional):**
          ```text
          Mohon bantuan restart layanan container frontend-staging WP-CORE dan periksa konfigurasi reverse proxy Nginx
          ```
        - **Jalur Kewenangan *:** Pilih **`Organizational Authority (Struktural)`**
        - **Penanggung Jawab Khusus (Opsional):** Biarkan **`— Ditentukan Otomatis oleh Sistem —`** → tunjuk **Panel Jalur Penanganan Otomatis** yang langsung menunjuk staf spesialis **`Fakhrizal Asshiddiq`** (Network & Infrastructure)!
        - Klik tombol hijau **`Kirim Laporan Blocker`** → tampil Kartu Konfirmasi Tiket Terbit!
     3. **Langsung Tautkan Tiket Barusan ke Komitmen Pagi Raka (`/daily/morning`):**
        - Masih di Jendela 6 (`Raka Pratama`), klik menu **`My Today`** (`/daily/morning`).
        - Klik **`Lihat Draf`** pada panel **`Draf Tugas Berlanjut dari Kemarin (1 Tersedia)`** → klik **`Salin ke Slot`** pada tugas *`Implementasi tata letak kartu responsif pada modul pengajuan izin`* (`[WP-CORE]`).
        - Ubah **`Tingkat Risiko Tugas Hari Ini *`** menjadi **`RED`**, lalu isi seluruh kolom risiko (siap salin):
          * **Potensi Kendala / Hambatan *:**
            ```text
            Pengujian tampilan kartu responsif modul pengajuan izin tertahan karena server staging WP-CORE mengalami 502 Bad Gateway
            ```
          * **Tindakan / Bantuan yang Diharapkan (Opsional):**
            ```text
            Menunggu pemulihan container staging WP-CORE oleh tim Network & Infrastructure
            ```
          * **Tiket Blocker Penyebab (Opsional):** Klik dropdown → **pilih tiket `[BLK-...] Server Staging WP-CORE Mengalami 502 Bad Gateway...` yang baru saja dibuat Raka 30 detik lalu!**
        - Klik **`Kirim Morning Commitment`**.

2. **3B — Siklus Penuh Lintas Jendela pada Tiket yang Sama: Terima → Beri Bantuan → Membantu Sebagian → Selesaikan → Kembalikan → Tutup (`Jendela 3 — Fakhrizal` ↔ `Jendela 6 — Raka Pratama`):**
   - **Pindah ke Jendela 3 (`network.infra@dutamedia.com` — Fakhrizal Asshiddiq) di `/blockers`:**
     * Tunjukkan bahwa di menu sidebar **`Notifikasi`** & ikon lonceng Fakhrizal langsung muncul **lencana angka merah** karena tiket baru dari Raka masuk!
     * Tunjukkan juga bahwa Fakhrizal adalah staf berstatus **`EMPLOYEE`**, namun karena ditunjuk resmi sebagai **Penanggung Jawab Kategori (`isCategoryOwner`)**, menu **`Antrean Blocker`** dan **`Penuaan & Eskalasi`** otomatis terbuka di sidebar-nya. *(Jelaskan juga aturan **Anti-Self-Routing**: jika Fakhrizal sendiri yang melapor kendala kategori `INFRA` di `/raise-blockers`, sistem otomatis menaikkannya ke atasannya `Gunawan Setiawan` agar tidak menugaskan ke diri sendiri).*
     * Pada daftar kiri `/blockers`, pilih tiket **`Server Staging WP-CORE Mengalami 502 Bad Gateway...`** (bertanda **`Tugas Anda`**) → klik tombol biru **`Terima & Tangani`** (status berubah menjadi **`Sedang Ditangani`**).
     * Klik tombol **`Beri Bantuan`** *(Ambil **`WP-SS-22`**)*, lalu isi seluruh kolom modal (siap salin):
       - **Tindakan Bantuan * (min. 5 karakter):**
         ```text
         Merestart service container frontend-staging WP-CORE dan membersihkan antrean worker Nginx
         ```
       - **Catatan Hasil / Progres *:**
         ```text
         Halaman login staging sudah kembali hidup, silakan Raka coba akses kembali halaman modul pengajuan izin
         ```
       - Klik **`Simpan Kontribusi`**.
   - **Pindah ke Jendela 6 (`Raka Pratama`) di `/raise-blockers?tab=mine` (tab `Blocker Saya`):**
     * Tekan segarkan/buka tiket → tunjukkan 3 tombol tanggapan pelapor atas bantuan bertahap: (`Terima sbg Penyelesaian`, `Terima Bantuan (Membantu Sebagian)`, `Bantuan Belum Membantu`).
     * Klik **`Terima Bantuan (Membantu Sebagian)`**, lalu isi catatan wajib (min. 10 karakter — siap salin):
       ```text
       Halaman utama staging sudah bisa dibuka, namun saat membuka rute /leave/my masih muncul error 502 pada panggilan API
       ```
     * Klik kirim tanggapan (tiket tetap berstatus `Sedang Ditangani`).
   - **Kembali ke Jendela 3 (`Fakhrizal` di `/blockers`):**
     * Klik tombol hijau **`Selesaikan`**, lalu isi kolom wajib **`Catatan Resolusi *`** (min. 10 karakter — siap salin):
       ```text
       Koneksi upstream API pada reverse proxy staging WP-CORE telah diperbaiki dan seluruh endpoint /leave/my sudah diuji merespons 200 OK
       ```
     * Klik **`Kirim Solusi`** → status tiket berubah menjadi **`Solusi Diberikan`**.
   - **Kembali ke Jendela 6 (`Raka Pratama` di tab `Blocker Saya`):**
     * **Uji Pengembalian Solusi (`Belum Memadai`):** Klik tombol merah **`Belum Memadai (Kembalikan)`**, lalu isi kolom wajib **`Alasan Pengembalian *`** (min. 10 karakter — siap salin):
       ```text
       Endpoint daftar izin sudah berjalan, tetapi pengiriman form izin baru di staging masih timeout setelah 10 detik
       ```
     * Klik **`Kirim & Kembalikan ke PIC`** → tunjukkan status tiket otomatis kembali menjadi **`Sedang Ditangani`** di Jendela 3 (`Fakhrizal`)!
   - **Penutupan Final (`Jendela 3 → Jendela 6`):**
     * Di Jendela 3 (`Fakhrizal`), klik **`Selesaikan`** sekali lagi → isi **`Catatan Resolusi *`** (siap salin):
       ```text
       Batas timeout koneksi database staging pada modul pengajuan izin telah dinaikkan dan uji kirim form izin sudah berhasil di bawah 200ms
       ```
       Klik **`Kirim Solusi`**.
     * Di Jendela 6 (`Raka`), klik tombol hijau **`Konfirmasi & Tutup Tiket`** → status tiket resmi selesai menjadi **`Selesai Ditutup`**!

3. **3C — Bantuan Lintas Fungsi Non-PIC (`Bantu Unblock` → `Feed Dukungan Lintas Fungsi`), Penutupan Instan `Terima sbg Penyelesaian`, & Siklus `Terima Risiko` (`Jendela 4 — Arif Budiman` ↔ `Jendela 2 — Aditya Nugroho`):**
   - Di **Jendela 2**, keluar dari `Dio Bayu` lalu masuk sebagai **`dev.frontend@dutamedia.com` (Aditya Nugroho)** (`Password123!`).
   - **Pindah ke Jendela 4 (`head.eng@dutamedia.com` — Arif Budiman, Head of Engineering) di `/dashboard`:**
     * Pada kartu **`Personil Butuh Bantuan Hari Ini`**, klik tombol **`Bantu Unblock`** pada kendala Aditya (*`CI runner mengalami Out Of Memory (OOM) saat proses bundle minification`*) → otomatis melompat ke halaman **`/blockers`** *(Ambil **`WP-SS-21`**)*.
     * Meskipun PIC tiket tersebut adalah `Bambang Pratama` (Tech Lead) dan statusnya masih `Menunggu Respons`, Arif sebagai pimpinan/non-PIC langsung mengeklik **`Beri Bantuan`** dan mengisi (siap salin):
       - **Tindakan Bantuan *:**
         ```text
         Menaikkan batas memori container GitLab CI runner dari 2GB menjadi 6GB pada cluster build Engineering
         ```
       - **Catatan Hasil / Progres *:**
         ```text
         Pipeline build frontend sudah dijalankan ulang dan lolos tahap bundle minification tanpa error OOM
         ```
       - Klik **`Simpan Kontribusi`**.
     * Buka sebentar **`/dashboard`** di Jendela 4 → tunjukkan bantuan Arif barusan **otomatis muncul di panel kanan `Feed Dukungan Lintas Fungsi`**!
   - **Pindah ke Jendela 2 (`Aditya Nugroho` di `/raise-blockers?tab=mine`):**
     * Pada tiket `CI runner mengalami Out Of Memory...`, klik tombol hijau **`Terima sbg Penyelesaian (Tutup Tiket)`** pada bantuan Arif → tiket langsung tuntas menjadi **`Selesai Ditutup`**!
   - **Kembali ke Jendela 4 (`Arif Budiman` di `/blockers`) — Demo `Terima Risiko` (`ACCEPTED_RISK`):**
     * Pilih tiket **`[Menunggu Persetujuan Rilis Arsitektur Database Baru]`** (`WP-CORE`, pelapor: `Bambang Pratama`, PIC: `Arif Budiman`).
     * Klik **`Terima & Tangani`**, lalu klik tombol **`Terima Risiko`** dan isi seluruh kolom modal (siap salin):
       - **Justifikasi Penerimaan Risiko * (min. 15 karakter):**
         ```text
         Perubahan skema migrasi database tahap 2 ditunda ke rilis pekan depan agar tidak mengganggu stabilitas jadwal demo UAT klien minggu ini
         ```
       - **Rencana Mitigasi Risiko *:**
         ```text
         Tetap menggunakan skema tabel versi 1 yang sudah stabil disertai pemantauan performa indeks query harian oleh Technical Lead
         ```
       - Klik **`Tetapkan Terima Risiko`** → status tiket berubah menjadi **`Risiko Diterima`**.

4. **3D — `Edit Tiket` (*Dynamic Re-Routing* Lintas Divisi) & `Hapus Tiket` (`DEC-016`) (`Jendela 2 — Aditya Nugroho` di `/raise-blockers?tab=mine`):**
   - **Demo `Edit Tiket` & *Dynamic Re-Routing*:**
     * Pada tab **`Blocker Saya`** milik Aditya, cari tiket aktif **`[Menunggu Hasil Uji QA dari Tim Delivery]`** (Kategori: `Menunggu Tim / Rekan Lain`, saat ini mengarah ke `Dharma Putra` — Head of Delivery).
     * Klik tombol **`Edit Tiket`**, lalu ubah:
       - **Divisi yang Sedang Ditunggu *:** Ubah dari `Delivery` menjadi **`Operations & Infrastructure`**
       - **Deskripsi Kendala *:**
         ```text
         Perbaikan fitur navigasi sudah selesai, namun masih menunggu pembukaan port firewall staging dari tim Operations & Infrastructure
         ```
     * Klik simpan perubahan → tunjukkan bahwa mesin *Dynamic Re-Routing* **otomatis memindahkan Penanggung Jawab (PIC) tiket tersebut dari `Dharma Putra` ke `Gunawan Setiawan` (Head of Ops & Infra)** dan mengirim notifikasi ke PIC lama maupun PIC baru!
   - **Demo `Hapus Tiket` (`DEC-016`):**
     * Masih di tab **`Blocker Saya`** milik Aditya, pada tiket **`[Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus]`**, klik tombol merah **`Hapus Tiket`**.
     * Tunjukkan kepada atasan **3 pilihan alasan cepat (*preset*)** (*`Salah Input / Tiket Duplikat`*, *`Sudah Teratasi Mandiri`*, *`Kendala Tidak Jadi / Batal Relevan`*) dan pilihan ke-4 *`Alasan Lainnya`* (wajib min. 10 karakter).
     * Pilih **`Sudah Teratasi Mandiri`**, lalu konfirmasi hapus → tiket bersih dari antrean dan mantan PIC menerima notifikasi pembatalan.

5. **3E — Radar Keterlambatan Penanganan Blocker (`Jendela 4 — Arif Budiman` di `/blockers/aging`)** *(Ambil **`WP-SS-23`**)*:
   - Buka menu **`Penuaan & Eskalasi`** (`/blockers/aging`).
   - Tunjukkan 4 kartu ringkasan di atas, khususnya kartu merah **`Lewat Batas Waktu: 1`** (yaitu tiket `CRITICAL` proyek `WP-CORE`: *`[Server API Produksi WP-CORE Mengalami Lonjakan Timeout Database]`* dari `seed.ts`!).
   - Centang kotak **`Hanya Tampilkan Tiket Melewati Batas Waktu`**, lalu klik tombol **`Buka`** di ujung kanan baris tiket untuk langsung melompat ke tiket tersebut di `/blockers`.

---

### BABAK 4 — SIKLUS LENGKAP KOREKSI LAPORAN: MINOR OTOMATIS (`AUTO_APPLIED`), MATERIAL TOLAK + REVISI, & MATERIAL SETUJUI *(5 Menit · Jendela 2 ↔ Jendela 4)*

1. **4A — Mengajukan Koreksi Minor (`AUTO_APPLIED`) & Koreksi Material (`PENDING`) (`Jendela 2 — Aditya Nugroho` di `/corrections/morning`)** *(Ambil **`WP-SS-14`**)*:
   - Buka menu **`Koreksi Komitmen Pagi`** (`/corrections/morning`).
   - **Langkah 1 — Kirim Koreksi Minor (Langsung Berlaku Otomatis):**
     * **Pilih Komitmen yang Dikoreksi *:** Pilih **`[Komitmen #1] Menyelesaikan implementasi UI navigasi mobile responsive`**
     * **Klasifikasi Koreksi *:** Pilih **`Koreksi Minor (Perbaikan Pengetikan / Typo)`**
     * **Deskripsi Komitmen Baru *:**
       ```text
       Menyelesaikan implementasi komponen UI navigasi mobile responsif lintas 5 ukuran layar
       ```
     * **Tautan Referensi Baru (Opsional):**
       ```text
       https://github.com/dutamedia/workpulse/pull/241
       ```
     * **Alasan Permohonan Koreksi * (min. 10 karakter):**
       ```text
       Melengkapi tautan PR nomor 241 dan memperjelas keterangan 5 ukuran layar tanpa mengubah target kerja
       ```
     * Klik **`Kirim Permohonan Koreksi`** → tunjukkan di tabel riwayat kanan statusnya langsung hijau **`AUTO_APPLIED`** dan teks komitmen #1 langsung terbarui saat itu juga!
   - **Langkah 2 — Kirim Koreksi Material (Masuk Antrean Review Atasan 24 Jam):**
     * **Pilih Komitmen yang Dikoreksi *:** Pilih **`[Komitmen #2] Investigasi kegagalan memory build runner pada pipeline frontend`**
     * **Klasifikasi Koreksi *:** Pilih **`Koreksi Material (Perubahan Makna / Risiko / Lingkup)`**
     * **Deskripsi Komitmen Baru *:**
       ```text
       Menyelesaikan optimasi konfigurasi code-splitting Vite untuk menurunkan penggunaan memori build frontend
       ```
     * **Tingkat Risiko Awal Baru *:** Ubah dari `AMBER` menjadi **`GREEN`**
     * **Alasan Permohonan Koreksi * (min. 10 karakter):**
       ```text
       Setelah kapasitas runner dinaikkan oleh Head Engineering, fokus tugas hari ini dialihkan ke optimasi code-splitting Vite
       ```
     * Klik **`Kirim Permohonan Koreksi`** → berstatus kuning **`PENDING`** (jendela sanggahan 24 jam).
   - *(Klik sebentar tab **`Koreksi Evaluasi Sore`** `/corrections/eod` untuk mengambil **`WP-SS-15`** dan menunjukkan bahwa evaluasi sore juga memiliki formulir koreksi terpisah yang identik).*

2. **4B — Kepala Divisi Menolak Koreksi → Karyawan Merevisi dengan `Gunakan Draf Sebelumnya & Sesuaikan` → Kepala Divisi Menyetujui (`Jendela 4 ↔ Jendela 2`):**
   - **Pindah ke Jendela 4 (`head.eng@dutamedia.com` — Arif Budiman) di `/corrections/review`** *(Ambil **`WP-SS-26`**)*:
     * Tunjukkan kartu permohonan Aditya dengan **Perbandingan Visual `Sebelum` (merah) vs `Diajukan` (hijau)**.
     * Klik tombol merah **`Tolak`** (terbuka modal **`Sampaikan Keberatan / Tolak Koreksi`**), lalu isi kolom wajib **`Catatan Review / Alasan Keputusan *`** (min. 5 karakter — siap salin):
       ```text
       Mohon cantumkan juga nomor tiket issue optimasi Vite pada deskripsi komitmen agar mudah ditelusuri tim QA
       ```
     * Klik **`Konfirmasi Tolak`** → status menjadi **`Ditolak (REJECTED)`**.
   - **Kembali ke Jendela 2 (`Aditya Nugroho` di `/corrections/morning`):**
     * Tekan refresh/lihat tabel riwayat kanan: pada baris yang baru saja **`Ditolak`**, baca **`Catatan Peninjau`** dari Arif Budiman, lalu klik tombol **`Gunakan Draf Sebelumnya & Sesuaikan`**!
     * Formulir kiri langsung terisi otomatis dengan ketikan sebelumnya — cukup tambahkan nomor tiket `[#245]` pada **Deskripsi Komitmen Baru \*** (siap salin):
       ```text
       Menyelesaikan optimasi konfigurasi code-splitting Vite [#245] untuk menurunkan penggunaan memori build frontend
       ```
     * Dan pada **Alasan Permohonan Koreksi \*** (siap salin):
       ```text
       Menambahkan referensi nomor tiket [#245] sesuai catatan review dari Head of Engineering
       ```
     * Klik **`Kirim Permohonan Koreksi`**.
   - **Kembali ke Jendela 4 (`Arif Budiman` di `/corrections/review`):**
     * Klik tombol hijau **`Setujui`** pada permohonan revisi Aditya, isi **`Catatan Review *`** (siap salin):
       ```text
       Disetujui, nomor referensi tiket [#245] sudah lengkap dan sesuai arahan sprint
       ```
     * Klik **`Konfirmasi Setujui`** → status berubah menjadi **`Disetujui (APPROVED)`** dan data baseline komitmen pagi Aditya otomatis terbarui!

---

### BABAK 5 — CUTI KARYAWAN TETAP VS IZIN ANAK MAGANG (`INTERN`), VALIDASI, BATAL MANDIRI, & PERSETUJUAN ATASAN *(5 Menit · Jendela 2 ↔ Jendela 6 ↔ Jendela 4)*

1. **5A — Pengajuan Cuti Karyawan Tetap, Hitungan Hari Kerja Senin–Jumat, & Pembatalan Mandiri (`Jendela 2 — Aditya Nugroho` di `/leave/my`)** *(Ambil **`WP-SS-13`**)*:
   - Buka menu **`Cuti Saya`** (`/leave/my`).
   - Tunjukkan kotak hijau **`Jatah Cuti Tahunan 2026`** (`12 hari kerja`) dan 6 pilihan jenis cuti.
   - **Uji Validasi Tanggal Terbalik:** Pilih Tanggal Mulai `2026-12-10` dan Tanggal Selesai `2026-12-08` → tunjukkan peringatan merah bahwa tanggal selesai tidak boleh lebih awal dari tanggal mulai.
   - **Isi Permohonan Cuti Melewati Akhir Pekan (Siap Salin):**
     * **Jenis Cuti / Izin *:** `Cuti Tahunan`
     * **Tanggal Mulai *:** `2026-12-04` *(Jumat)*
     * **Tanggal Selesai *:** `2026-12-08` *(Selasa)*
     * *(Tunjukkan ke atasan: meskipun rentang kalendernya 5 hari dari Jumat sampai Selasa, sistem otomatis mengecualikan Sabtu & Minggu sehingga tertulis **`Durasi cuti: 3 hari kerja`**!)*
     * **Alasan * (min. 5 karakter):**
       ```text
       Menghadiri acara pernikahan keluarga kandung di Yogyakarta
       ```
     * Klik **`Ajukan Permohonan`** → muncul di tabel riwayat kanan berstatus **`Menunggu Review` (`PENDING`)**.
   - **Demo Pembatalan Mandiri (`Batalkan`):** Klik tombol **`Batalkan`** pada baris permohonan barusan → konfirmasi → status berubah menjadi **`Dibatalkan`** dan kuota 12 hari tetap utuh!

2. **5B — Tampilan Khusus Izin Anak Magang (`Intern`) (`Jendela 6 — Raka Pratama` di `/leave/my` & `/profile`)** *(Ambil **`WP-SS-19`**)*:
   - Di Jendela 6 (`intern.frontend@dutamedia.com`), buka **`/leave/my`**:
     * Tunjukkan kotak hijau 12 hari digantikan oleh kotak ungu **`Aturan Izin Karyawan Magang`**, dan dropdown jenis pengajuan hanya berisi **2 pilihan**: **`Izin (Keperluan Mendesak / Alasan Logis)`** dan **`Sakit`**.
     * Tunjukkan di tabel kanan sudah ada 1 permohonan `Izin` Raka yang sedang `Menunggu Review`.
   - Buka **`/profile`** Raka: tunjukkan pil ungu **`Intern`** dan baris **`Tanggal Selesai Magang: 18 Feb 2027`**.

3. **5C — Antrean Persetujuan Cuti & Izin Pimpinan (`Jendela 4 — Arif Budiman` di `/leave/queue`)** *(Ambil **`WP-SS-25`**)*:
   - Buka menu **`Persetujuan Cuti`** (`/leave/queue`).
   - Tunjukkan di tabel antrean langsung tampil berdampingan:
     1. **Raka Pratama** (dengan pil ungu **`Intern`**, jenis **`Izin`**)
     2. **Siti Rahma** (Karyawan Tetap, jenis **`Cuti Tahunan`**)
   - **Setujui Izin Anak Magang (`Raka Pratama`):**
     * Klik tombol hijau **`Setujui`** pada baris `Raka Pratama` *(tunjukkan modal otomatis menyesuaikan istilah menjadi "Permohonan Izin")*, isi **`Catatan Reviewer (Opsional)`** (siap salin):
       ```text
       Disetujui untuk menghadiri seminar tugas akhir kampus. Pastikan progres komponen frontend sudah di-push ke branch staging sehari sebelumnya
       ```
     * Klik **`Setujui Permohonan`**.
   - **Tolak Cuti (`Siti Rahma`):**
     * Klik tombol merah **`Tolak`** pada baris `Siti Rahma`, lalu isi kolom wajib **`Catatan Penolakan *`** (min. 5 karakter — siap salin):
       ```text
       Mohon dijadwalkan ulang pekan depan karena tanggal 25-26 November bertepatan dengan jadwal rilis integrasi backend utama
       ```
     * Klik **`Tolak Permohonan`**. *(Jelaskan juga aturan **`DEC-008`**: jika ada karyawan sakit mendadak pagi hari dan cuti sakitnya disetujui siang/sore hari, sistem otomatis memutihkan catatan belum melapor hari itu dari antrean kepatuhan HRGA).*

---

### BABAK 6 — KEPATUHAN HRGA (`TINDAK LANJUT` & `UBAH CATATAN`), DISPENSASI RESMI, & COACHING (`DIBAGIKAN` VS `RAHASIA MANAJEMEN`) *(5 Menit · Jendela 5 & Jendela 4)*

1. **6A — Antrean Kepatuhan HRGA: `Tindak Lanjut` & `Ubah Catatan` (`Jendela 5 — hrga@dutamedia.com` di `/compliance`)** *(Ambil **`WP-SS-29`**)*:
   - Buka menu **`Antrean Kepatuhan`** (`/compliance`).
   - **Pada baris `Siti Rahma` (`Status: Belum Ditangani` · `Pola 3x`):**
     * Klik tombol **`Tindak Lanjut`**.
     * Coba ketik 2 huruf `ok` → tunjukkan tombol simpan tetap nonaktif karena wajib minimal 5 karakter.
     * Isi **`Catatan Tindak Lanjut / Pembinaan *`** (siap salin):
       ```text
       Sudah dilakukan sesi pengingat disiplin pelaporan pagi bersama Head of Engineering dan disepakati pengaktifan alarm browser push pukul 08:00 WIB
       ```
     * Klik **`Simpan Tindak Lanjut`** → status berubah menjadi **`Sudah Ditangani`** dan tombol aksinya berubah menjadi **`Ubah Catatan`**!
   - **Pada baris `Nadia Kusuma` (`Status: Sudah Ditangani`):**
     * Klik tombol **`Ubah Catatan`**, tambahkan kalimat di belakang catatan yang sudah ada (siap salin):
       ```text
       Sudah dikonfirmasi bersama Head of Delivery: keterlambatan disebabkan kendala listrik pagi hari di lokasi kerja dan tidak berulang kembali.
       ```
     * Klik **`Simpan Tindak Lanjut`**.

2. **6B — Manajemen Dispensasi Resmi (`Jendela 5 — hrga@dutamedia.com` di `/exemptions`)** *(Ambil **`WP-SS-30`**)*:
   - Buka menu **`Manajemen Dispensasi`** (`/exemptions`).
   - Tunjukkan di tabel kanan sudah ada dispensasi aktif **`Hari Wibowo` (`ST/HRGA/2026/XI/104`)** beserta tombol **`Cabut`**.
   - Di formulir kiri (**`Daftarkan Dispensasi Baru`**), isi seluruh 6 kolom secara lengkap (siap salin):
     * **Karyawan Penerima Dispensasi *:** Pilih **`Dimas Prakoso`** *(Project Manager — Delivery)*
     * **Tanggal Mulai *:** `2026-11-26`
     * **Tanggal Selesai *:** `2026-11-27`
     * **Kategori Pengecualian *:** Pilih **`Dinas Luar (Penugasan Luar Kantor / Klien)`**
     * **Nomor Surat Tugas / Referensi (Opsional):**
       ```text
       ST/HRGA/2026/XI/112
       ```
     * **Alasan Resmi Dispensasi * (min. 5 karakter):**
       ```text
       Mendampingi pelaksanaan User Acceptance Test (UAT) on-site dan serah terima modul portal penagihan di kantor pusat klien Jakarta
       ```
   - Klik **`Daftarkan Dispensasi`** → langsung masuk ke tabel kanan dan Dimas Prakoso otomatis bebas dari catatan pelanggaran pada tanggal tersebut!

3. **6C — Catatan Coaching Manajerial: `Dibagikan ke Karyawan` vs `Rahasia Manajemen` (`Jendela 4 — Arif Budiman` di `/coaching`)** *(Ambil **`WP-SS-27`**)*:
   - Buka menu **`Catatan Coaching`** (`/coaching`).
   - Klik kartu anggota tim **`Aditya Nugroho`**:
     * Tunjukkan di panel kanan (**`Riwayat Catatan Evaluasi & Pembinaan`**) sudah ada 2 catatan dari `seed.ts`: satu bertanda **`Dibagikan ke Karyawan`** (*Apresiasi*) dan satu bertanda **`Rahasia Manajemen`** (*Bimbingan*).
     * Di panel kiri (**`Buat Catatan Pembinaan Baru`**), pilih:
       - **Karyawan yang Dituju *:** `Aditya Nugroho`
       - **Jenis Catatan *:** Pilih **`Bimbingan`**
       - **Tingkat Visibilitas *:** Pilih **`Dibagikan ke Karyawan`**
       - Klik tombol template cepat **`Bimbingan 1-on-1`** → tunjukkan kerangka 4 poin langsung terisi otomatis! Atau tempel isi catatan yang sudah dilengkapi berikut (siap salin):
         ```text
         [Fokus Pengembangan]: Pengelolaan prioritas saat menangani 2 modul frontend secara bersamaan.
         [Fakta Objektif]: Komitmen navigasi responsif selesai tepat waktu, namun investigasi runner CI sempat tertahan sebelum dieskalasi.
         [Saran Perbaikan]: Segera terbitkan tiket Blocker maksimal 1 jam setelah kendala infrastruktur ditemukan tanpa menunggu sore hari.
         [Target Evaluasi]: Seluruh komitmen sprint pekan depan tercatat ON-TIME dengan 0 keterlambatan eskalasi.
         ```
       - Klik **`Simpan Catatan Pembinaan`**.
     * *(Jelaskan perbedaan `/compliance` vs `/coaching`: `/compliance` dipakai HRGA untuk mencatat bahwa pelanggaran ritme tanggal tersebut sudah dihubungi, sedangkan `/coaching` dipakai Atasan Langsung untuk mencatat bimbingan 1-on-1 dan apresiasi kinerja).*

---

### BABAK 7 — PUSAT NOTIFIKASI (LENCANA SIDEBAR & PENGAMAN `canUserAccess`), 3 RUANG LINGKUP DASHBOARD, RADAR PROYEK, & LAPORAN EKSEKUTIF CSV/PDF *(5 Menit · Jendela 2, Jendela 4, Jendela 1)*

1. **7A — Pusat Notifikasi & Lencana Angka Merah Real-Time di Sidebar (`Jendela 2 — Aditya Nugroho` di `/notifications`)** *(Ambil **`WP-SS-16`**)*:
   - Tunjuk **lencana angka merah di menu sidebar kiri `Notifikasi`** dan di **ikon lonceng kanan atas** pada Jendela 2 (`Aditya`).
   - Klik menu **`Notifikasi`** (`/notifications`):
     * Tunjukkan bahwa catatan **`Dibagikan ke Karyawan`** dari Arif Budiman muncul di daftar notifikasi Aditya, sedangkan catatan **`Rahasia Manajemen`** **100% tidak pernah bocor ke akun Aditya**!
     * Klik kartu notifikasi **`Perubahan Kebijakan Jam Batas Pengisian (Cut-Off)`** → tunjukkan:
       1. Angka merah di menu sidebar **`Notifikasi`** dan ikon lonceng langsung **berkurang 1 secara otomatis**!
       2. Di dalam jendela rincian notifikasi kebijakan tersebut, isi pengumuman tampil lengkap, namun **tombol menuju `/admin/policies` otomatis disembunyikan (`canUserAccess` guard)** agar karyawan biasa tidak pernah tersesat ke layar `403 Forbidden`!
     * Tunjukkan juga tab ke-2 **`Pengaturan Kanal & Perangkat`** dan tombol **`Tandai semua dibaca`**.

2. **7B — 3 Ruang Lingkup Pulse Dashboard (`Jendela 4` vs `Jendela 1` di `/dashboard`):**
   - **Di Jendela 4 (`head.eng@dutamedia.com` — Kepala Divisi Engineering)** *(Ambil **`WP-SS-20`**)*:
     * Tunjukkan tab cakupan terkunci aman pada **`Divisi Saya`** (`Divisi Engineering` — tidak bisa mengintip divisi lain).
     * Tunjukkan 4 kartu metrik, daftar **`Personil Butuh Bantuan Hari Ini`**, dan **`Feed Dukungan Lintas Fungsi`**.
   - **Di Jendela 1 (`direktur@dutamedia.com` — Direktur / CEO):**
     * Buka **`/dashboard`** → tunjukkan cakupan **`Seluruh Perusahaan`** (**25 personil**: 23 Karyawan Tetap + 2 Intern, atau 26 jika `Budi Santoso` tadi diaktifkan).
     * Uji filter **`Status Karyawan`**: pilih **`Intern`** (hanya menampilkan `Raka Pratama` & `Nisa Amelia` dengan pil ungu `Intern`), lalu pilih **`Karyawan Tetap`**, dan kembalikan ke **`Semua Status Karyawan`**.

3. **7C — Radar Risiko Proyek (`Jendela 4 — Arif Budiman` di `/projects/risk`)** *(Ambil **`WP-SS-24`**)*:
   - Buka menu **`Radar Risiko Proyek`** (`/projects/risk`).
   - Ketik `"Engineering"` di kotak pencarian untuk menyaring proyek divisi Engineering, lalu klik tombol **`Rincian`** pada proyek **`WorkPulse Platform Core 2026 (WP-CORE)`**.
   - Tunjukkan jendela modal **`Rincian Risiko Proyek`**: menampilkan Skor Kesehatan Proyek, jumlah Blocker Aktif (termasuk sorotan kotak merah kendala `CRITICAL` yang melewati batas waktu!), dan tombol **`Buka Antrean Blocker Terkait`**.

4. **7D — Laporan Eksekutif, Filter Status Karyawan, & Ekspor CSV / Cetak PDF (`Jendela 1 — Direktur` di `/reports`)** *(Ambil **`WP-SS-28`**)*:
   - Buka menu **`Laporan Eksekutif`** (`/reports`).
   - Klik preset periode **`Hari Ini`**, **`Pekan Ini`**, **`Bulan Ini`**, dan **`Kuartal Ini`**.
   - Pada dropdown **`Status Karyawan`**, pilih **`Kontrak`** → tunjukkan pesan informatif ramah: **`"Belum ada data karyawan untuk status karyawan yang dipilih."`**, lalu kembalikan ke **`Semua Status Karyawan`**.
   - Klik tombol **`Unduh Laporan (CSV)`** (berkas `.csv` terunduh lengkap dengan kolom `Status Karyawan`) dan tunjukkan tombol **`Cetak / PDF`**.

---

### BABAK 8 — TATA KELOLA ORGANISASI, PENGANGKATAN `INTERN`, REVIEWER SEMENTARA (BUKTI LOGIN!), MULTI-OWNER PIC, & SALURAN NOTIFIKASI *(6 Menit · Jendela 5, Jendela 6, Jendela 1)*

1. **8A — Penonaktifan & Pengaktifan Akun (`Jendela 5 — hrga@dutamedia.com` di `/admin/users`):**
   - Pada baris **`Budi Santoso`**, klik tombol **`Nonaktifkan`** → pada jendela konfirmasi klik **`Nonaktifkan Akun`** (status berubah `Nonaktif` dan seluruh sesi login aktifnya langsung terputus).
   - Klik tombol **`Aktifkan`** kembali pada baris `Budi Santoso` → konfirmasi (status kembali `Aktif`).
   - Tunjukkan pada baris **`Dewi Lestari`** sendiri tertulis lencana **`Akun Anda`** (sistem melindungi agar pengguna tidak bisa menonaktifkan akunnya sendiri).

2. **8B — Struktur Organisasi 2 Tab, Anti-Siklus Melingkar, Pengangkatan `Intern`, & Kewenangan Proyek (`Jendela 5 — hrga@dutamedia.com` di `/admin/organization`)** *(Ambil **`WP-SS-33`**)*:
   - Buka menu **`Struktur Organisasi`** (`/admin/organization`).
   - **Di Tab 1 (`Struktur & Penugasan Karyawan`):**
     * Klik tombol **`Atur Penugasan Baru`**:
       1. Buka dropdown **`Atasan Langsung (Direct Manager)`** → tunjukkan bahwa nama **`Raka Pratama`** dan **`Nisa Amelia`** (`Intern`) **0 kali muncul** di daftar pilihan atasan!
       2. **Demo Uji Anti-Siklus Melingkar (`A → B → A`):** Pilih Karyawan **`Arif Budiman`** (Head of Engineering) dan coba pilih Atasan Langsung **`Aditya Nugroho`** (bawahannya sendiri) dengan alasan `Uji validasi siklus hierarki melingkar` → klik simpan → tunjukkan sistem **menolak tegas (`422`)** karena membentuk lingkaran pelaporan terlarang!
       3. **Tunjukkan Cara Pengangkatan `Intern` Menjadi `Karyawan Tetap` (Tanpa Perlu Klik Simpan jika ingin menjaga Raka tetap Intern):** Pilih Karyawan `Raka Pratama`, ubah **Status Karyawan** dari `Intern` menjadi **`Karyawan Tetap`**, pilih Tanggal Mulai Efektif → jelaskan bahwa begitu disimpan, pil ungu `Intern` hilang, kuota cuti 12 hari terbuka, dan riwayat magang masa lalunya tetap utuh. Klik **`Batal`**.
   - **Di Tab 2 (`Kewenangan Proyek / Project Authority`):**
     * Klik tab **`Kewenangan Proyek (Project Authority)`**, lalu klik tombol **`Tetapkan Wewenang Proyek`**:
       1. Tunjukkan bahwa akun `Intern` juga **0 kali muncul** di dropdown `Project Manager` maupun `Escalation Reviewer`.
       2. **Uji Validasi Orang yang Sama:** Pilih Proyek `WP-CORE`, pilih **Project Manager:** `Arif Budiman` dan **Escalation Reviewer:** `Arif Budiman` (orang yang sama) → tunjukkan sistem langsung menolak: **`"Project Manager dan Escalation Reviewer tidak boleh dijabat oleh orang yang sama."`** Klik **`Batal`**.
       3. Klik tombol **`Tutup Wewenang`** pada salah satu baris proyek → tunjukkan jendela konfirmasi in-app **`Konfirmasi Tutup Wewenang Proyek`** → klik **`Batal`** agar proyek tetap aktif.

3. **8C — Delegasi Reviewer Sementara + Bukti Login Nyata Penerima Delegasi (`Jendela 5 → Jendela 6` di `/admin/temporary-reviewers`)** *(Ambil **`WP-SS-34`**)*:
   - Di **Jendela 5 (`hrga@dutamedia.com`)**, buka menu **`Reviewer Sementara`** (`/admin/temporary-reviewers`), klik **`Delegasikan Reviewer Baru`**, lalu isi seluruh kolom (siap salin):
     * **1. Pejabat yang Berhalangan (Yang Digantikan) *:** Pilih **`Gunawan Setiawan`** *(Head of Ops & Infra — Divisi `Operations & Infrastructure` otomatis terisi)*
     * **3. Pejabat Pengganti Sementara (Penerima Delegasi) *:** Pilih **`Rian Kurniawan`** *(Operations Supervisor — tunjukkan bahwa `Sistem Administrator` dan akun `Intern` tidak muncul di daftar ini!)*
     * **Tanggal Mulai *:** *(Biarkan tanggal hari ini WIB)*
     * **Tanggal Selesai *:** *(Pilih tanggal besok WIB)*
     * **Alasan Penunjukan Resmi *:**
       ```text
       Pelimpahan wewenang persetujuan cuti, koreksi, dan eskalasi kendala selama Head of Ops & Infra bertugas audit data center luar kota
       ```
     * Klik **`Terbitkan Delegasi`** → tercatat berstatus **`Aktif`**.
   - **Bukti Login Nyata di Jendela 6 (Incognito):**
     * Masuk sebagai **`lead.creative@dutamedia.com` (Rian Kurniawan)** (`Password123!`).
     * Tunjuk **bilah menu kiri (Sidebar)** Rian: meskipun jabatan dasarnya adalah **`SUPERVISOR`** (yang normalnya tidak memiliki menu kepegawaian), karena sedang memegang mandat **Reviewer Sementara Aktif**, menu **`Persetujuan Cuti` (`/leave/queue`)** dan **`Review Koreksi & Cuti` (`/corrections/review`)** **otomatis muncul dan bisa diakses** untuk divisi Operations & Infrastructure!
     * Klik **Keluar** di Jendela 6.
   - Kembali ke **Jendela 5 (`HRGA`)** di `/admin/temporary-reviewers` → klik tombol **`Cabut`** pada baris delegasi Rian Kurniawan → pada modal konfirmasi isi alasan:
     ```text
     Head of Ops & Infra telah menyelesaikan kunjungan audit lebih cepat dan kembali bertugas aktif
     ```
     Klik **`Cabut Delegasi`**.

4. **8D — Pemilik Kebijakan Multi-Owner (`Direktur` vs `HRGA Non-Direktur` di `/admin/policies`):**
   - **Di Jendela 1 (`direktur@dutamedia.com` — Direktur):**
     * Gulir ke seksi **`Penugasan Pemilik Kebijakan (Policy Owners)`**: tunjukkan tombol **`Tetapkan Pemilik`**, **`Ubah`**, dan **`Cabut`** (lengkap dengan pagar pengaman yang menolak pencabutan apabila pejabat tersebut adalah pemilik terakhir pada suatu kategori kebijakan).
     * Tunjukkan tombol **`Unduh Audit CSV`** pada seksi **`Jejak Audit Perubahan Kebijakan`**.
   - **Di Jendela 5 (`hrga@dutamedia.com` — HRGA):**
     * Buka **`/admin/policies`** → tunjukkan bahwa HRGA hanya dapat mengubah kategori kebijakan yang ditugaskan kepadanya, sedangkan tabel Penugasan Pemilik Kebijakan terkunci dalam mode **`Hanya Lihat (Direktur/Admin)`**.

5. **8E — Saluran Notifikasi, 9 Pemicu Resmi, & Simulasi Uji Kirim (`Jendela 1 — Direktur` di `/admin/notifications`)** *(Ambil **`WP-SS-36`**)*:
   - Buka menu **`Saluran Notifikasi`** (`/admin/notifications`).
   - Tunjukkan 3 kartu status saluran di bagian atas (**`Pusat Notifikasi In-App: Aktif`**, **`Email Transaksional: Mode Simulasi Aktif`**, **`Browser Push: Mode Simulasi Aktif`** — jujur tanpa memalsukan status terkirim).
   - Tunjukkan **`Matriks Routing Kanal Per Trigger Event`** (9 pemicu resmi dengan 4 tab penyaring: *Semua*, *Komitmen & Pengingat*, *Blocker & Eskalasi*, *Tata Kelola & HR*).
   - Pada panel **`Instrumen Uji Pengiriman Kanal Notifikasi`**, isi seluruh kolom (siap salin):
     * **Pilih Kanal Uji:** Pilih **`Pusat Notifikasi In-App`** (atau `Email`)
     * **Skenario Event:** Pilih **`BLOCKER_RAISED`** (atau skenario pertama di daftar)
     * **Target Penerima Uji (Email):**
       ```text
       dev.frontend@dutamedia.com
       ```
     * Klik **`Kirim Notifikasi Uji Coba`** → tunjukkan kotak hasil **`Hasil Pengujian: BERHASIL`** dan baris baru langsung muncul di tabel **`Log Pengiriman Uji Coba Terbaru`** di bagian bawah!

---

### BABAK 9 — PENUTUPAN DEMO RESMI (KEMBALIKAN JAM BATAS PAGI KE STANDAR `09:00 / 09:30 WIB`) *(1 Menit · Jendela 1)*

1. Di **Jendela 1 (`direktur@dutamedia.com`)**, buka kembali **`Kebijakan & Cut-off` (`/admin/policies`)**:
   - Klik **`+ Buat Versi Kebijakan Baru`**, lalu isi seluruh kolom untuk mengembalikan jadwal resmi kantor (siap salin):
     * **Batas Tepat Waktu Pagi *:** `09:00`
     * **Batas Kunci Pengisian Pagi (Cut-Off) *:** `09:30`
     * **Batas Tepat Waktu Sore (EOD) *:** `17:00`
     * **Batas Kunci Pengisian Sore (Cut-Off) *:** `21:00`
     * **Tanggal Mulai Berlaku *:** *(Tanggal hari ini WIB)*
     * **Alasan Perubahan Kebijakan * (min. 15 karakter):**
       ```text
       Mengembalikan jam batas pengisian komitmen pagi ke jadwal kerja standar perusahaan (09:00 dan 09:30 WIB) setelah demonstrasi selesai
       ```
   - Klik **`Simpan Versi Kebijakan`** → tunjukkan di **`Jejak Audit Perubahan Kebijakan`** aturan sudah kembali ke `09:00 / 09:30 WIB`.

---

## 4. DAFTAR PERIKSA RESET BERSIH SEBELUM DEMO RESMI

- [ ] Jalankan reset bersih + `prisma db seed` agar seluruh 11 baris tabel Data Dummy pada Bagian 1 kembali 100% segar untuk tanggal hari ini.
- [ ] Pastikan 6 jendela browser sudah masuk sesuai tabel Bagian 2 (`Password123!`) dan draf lokal browser (`Reset Draf`) sudah bersih.
- [ ] Aktifkan *Do Not Disturb / Focus Assist* Windows sebelum membagikan layar (*Share Screen* / proyektor).
