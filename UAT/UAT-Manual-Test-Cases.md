# WorkPulse — Manual UAT Test Cases Specification

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Target Penguji Manual:** Harry (Acceptance Owner)  
> **Format Standar:** Sesuai Phase 7 Master Prompt (Field Eksekusi Dikosongkan)  
> **Tanggal:** 29 Oktober 2026  

---

## PANDUAN EKSEKUTIF PENGUJIAN MANUAL

Dokumen ini memuat seluruh test case manual langkah-demi-langkah yang dirancang secara presisi berdasarkan dokumen spesifikasi dan kode sumber WorkPulse. Anda (Harry) dapat membuka browser, login dengan akun pengujian yang tertera, mengikuti setiap instruksi operasional, mengamati reaksi antarmuka, dan menentukan hasil pengujian sendiri.

> [!IMPORTANT]
> Seluruh kolom **Actual Result**, **Execution Status**, **Tester**, **Execution Date**, **Defect ID**, dan **Retest Result** pada dokumen ini sengaja **DIKOSONGKAN**. Pengisian dilakukan secara mandiri oleh Harry saat pengujian berlangsung di browser.

---

## MODUL 1: AUTENTIKASI, AKTIVASI AKUN, & KONTROL AKSES

---

### TC-AUTH-001: Login Kredensial Valid & Pendaratan Otomatis Peran
- **Test Case ID:** `TC-AUTH-001`
- **Scenario ID:** `SCN-AUTH-01`
- **Requirement ID:** `FR-01`, `FR-04`, `DEC-012`
- **Judul:** Login Kredensial Valid & Verifikasi Pendaratan Otomatis Berbasis Peran
- **Tujuan:** Memastikan pengguna dengan kredensial sah dapat masuk dan secara otomatis diarahkan ke halaman beranda kanonikal perannya tanpa perantara tombol navigasi melayang darurat.
- **Modul / Halaman:** Halaman Login (`/login`)
- **Kategori Pengujian:** Happy Path / RBAC / Navigation
- **Teknik Desain Test Case:** Equivalence Partitioning & Decision Table Testing
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Kegagalan pendaratan menyebabkan kebingungan alur harian karyawan dan merusak tata kelola navigasi enterprise.
- **Preconditions:** Server backend dan frontend aktif. Akun `dev.frontend@dutamedia.com` berstatus `ACTIVE` di database seeder.
- **Test Data ID:** `TD-AUTH-01` (`dev.frontend@dutamedia.com` / `Password123!`)
- **Persiapan Sebelum Tes:** Buka browser (Chrome/Edge) pada mode Incognito atau bersihkan cookie/cache aplikasi.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka URL aplikasi pada address bar browser.
   - **Lokasi:** Address bar browser menuju `http://localhost:5173/` atau URL staging WorkPulse.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem mendeteksi status belum login dan secara otomatis me-redirect browser ke rute `/login`. Formulir login tampil dengan layout bersih, logo WorkPulse, input email, input password, dan tombol "Masuk ke Sistem".
   - **Verifikasi:** Periksa URL di browser adalah `http://localhost:5173/login`. Tidak ada error 404 atau layar putih.
2. **Langkah 2**
   - **Aksi:** Masukkan email terdaftar dan kata sandi valid, lalu klik tombol "Masuk ke Sistem".
   - **Lokasi:** Halaman `/login` pada field Email (`#email-input`) dan Password (`#password-input`).
   - **Data:** Email: `dev.frontend@dutamedia.com`, Password: `Password123!`
   - **Hasil yang diharapkan:** Tombol login menampilkan animasi loading singkat, toast sukses "Login berhasil" muncul, dan aplikasi mengarahkan browser ke rute kanonikal Employee: `/daily/morning`.
   - **Verifikasi:** Periksa bahwa URL aktif adalah `/daily/morning`. Sidebar permanen 232px tampil di sisi kiri dengan 3 grup navigasi (*Workspace*, *Management*, *Administration*). Di bagian footer sidebar (`.side-bottom`), tertera nama "Aditya Nugroho" dengan badge peran "EMPLOYEE".
3. **Langkah 3**
   - **Aksi:** Periksa ketiadaan tombol darurat melayang pada antarmuka.
   - **Lokasi:** Sudut kiri bawah atau seluruh area viewport desktop.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Tidak ada tombol darurat melayang `☰ Menu` yang menutupi konten (telah dihilangkan permanen). Navigasi sepenuhnya menggunakan sidebar enterprise 232px.
   - **Verifikasi:** Amati sudut kiri bawah layar; area tersebut bersih dari elemen floating overlay.

- **Expected Final Result:** Pengguna berhasil masuk ke sistem, sesi autentikasi tersimpan aman, sidebar navigasi 232px aktif permanen, dan mendarat presisi di `/daily/morning`.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tampilan halaman setelah login (memperlihatkan URL `/daily/morning` dan sidebar).
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-AUTH-002: Penolakan Login Kredensial Tidak Sah / Password Salah
- **Test Case ID:** `TC-AUTH-002`
- **Scenario ID:** `SCN-AUTH-02`
- **Requirement ID:** `FR-01`
- **Judul:** Penolakan Login Kredensial Tidak Sah / Password Salah
- **Tujuan:** Memastikan sistem menolak autentikasi saat pengguna memasukkan kombinasi password keliru atau email yang tidak terdaftar, dengan pesan kesalahan yang informatif tanpa membocorkan celah keamanan.
- **Modul / Halaman:** Halaman Login (`/login`)
- **Kategori Pengujian:** Negative Testing / Security
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** Pengguna Tamu / Unauthenticated
- **Priority:** **High (P1)**
- **Risk Rationale:** Mencegah akses tidak sah (*unauthorized access*) dan serangan brute-force sederhana.
- **Preconditions:** Pengguna berada di halaman `/login` dalam status belum login.
- **Test Data ID:** `TD-AUTH-06` (`dev.frontend@dutamedia.com` / `SalahPassword999`)
- **Persiapan Sebelum Tes:** Pastikan tidak ada sesi aktif.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Masukkan email terdaftar tetapi ketikkan kata sandi yang salah pada field password.
   - **Lokasi:** Halaman `/login`.
   - **Data:** Email: `dev.frontend@dutamedia.com`, Password: `SalahPassword999`
   - **Hasil yang diharapkan:** Form menerima input tanpa masking yang rusak.
   - **Verifikasi:** Teks password tertutup karakter titik/bintang (type="password").
2. **Langkah 2**
   - **Aksi:** Klik tombol "Masuk ke Sistem".
   - **Lokasi:** Tombol submit login.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem menolak autentikasi. Muncul pesan peringatan/toast merah berbahasa Indonesia: "Kredensial tidak valid" atau "Email atau kata sandi salah". Pengguna tetap berada di halaman `/login`.
   - **Verifikasi:** URL browser tetap `/login`. Sesi tidak dibuat (local storage / cookies tidak berisi token JWT).

- **Expected Final Result:** Login gagal secara aman, tidak ada kebocoran data sesi, pesan kesalahan jelas dan ramah pengguna.
- **Bukti yang Perlu Dikumpulkan:** Screenshot toast/alert pesan kesalahan penolakan login.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-AUTH-003: Aktivasi Akun Karyawan Baru via Token Seeder 72 Jam
- **Test Case ID:** `TC-AUTH-003`
- **Scenario ID:** `SCN-AUTH-03`
- **Requirement ID:** `FR-02`, `DEC-005`
- **Judul:** Aktivasi Akun Karyawan Baru Menggunakan Token Undangan 72 Jam
- **Tujuan:** Memverifikasi bahwa karyawan baru berstatus `INVITED` dapat mengaktifkan akunnya menggunakan tautan ber-token 72 jam, membuat kata sandi baru yang valid, dan bertransisi menjadi `ACTIVE`.
- **Modul / Halaman:** Halaman Aktivasi (`/activate`)
- **Kategori Pengujian:** Happy Path / Lifecycle / Security
- **Teknik Desain Test Case:** Use Case Testing & State Transition Testing
- **Role:** `INVITED` (`calon.karyawan@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Kegagalan aktivasi menghambat proses orientasi karyawan baru (*onboarding blocker*).
- **Preconditions:** Akun `calon.karyawan@dutamedia.com` berstatus `INVITED` dengan token demo seeder: `wp_seed_invite_token_72h_demo_secret`.
- **Test Data ID:** `TD-AUTH-08`
- **Persiapan Sebelum Tes:** Salin URL aktivasi lengkap: `http://localhost:5173/activate?token=wp_seed_invite_token_72h_demo_secret`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka URL aktivasi lengkap dengan query param token di browser.
   - **Lokasi:** Address bar browser.
   - **Data:** `http://localhost:5173/activate?token=wp_seed_invite_token_72h_demo_secret`
   - **Hasil yang diharapkan:** Halaman aktivasi akun terbuka. Sistem memvalidasi token dan menampilkan informasi nama "Fajar Ramadhan (New Hire)" serta formulir pembuatan kata sandi baru (Kata Sandi Baru dan Konfirmasi Kata Sandi).
   - **Verifikasi:** Tidak ada pesan token kedaluwarsa. Form input password dalam keadaan aktif dan siap diisi.
2. **Langkah 2**
   - **Aksi:** Masukkan kata sandi baru yang memenuhi kriteria keamanan (minimal 8 karakter kombinasi huruf dan angka), ketik ulang di konfirmasi, lalu klik "Aktifkan Akun Saya".
   - **Lokasi:** Halaman `/activate`.
   - **Data:** Kata Sandi Baru: `PasswordBaru123!`, Konfirmasi: `PasswordBaru123!`
   - **Hasil yang diharapkan:** Sistem memproses aktivasi. Muncul pesan sukses "Akun berhasil diaktifkan". Sistem mengarahkan pengguna ke halaman login atau langsung masuk ke sesi aktif.
   - **Verifikasi:** Pengguna dapat login menggunakan password baru `PasswordBaru123!`.
3. **Langkah 3**
   - **Aksi:** Buka kembali URL aktivasi dengan token yang sama persis (`wp_seed_invite_token_72h_demo_secret`).
   - **Lokasi:** Address bar browser.
   - **Data:** URL yang sama seperti Langkah 1.
   - **Hasil yang diharapkan:** Sistem menolak aktivasi ulang sesuai prinsip *single-use token* (DEC-005). Menampilkan pesan "Token sudah tidak berlaku atau telah digunakan". Form pembuatan password tidak aktif.
   - **Verifikasi:** Token tidak dapat digunakan untuk kedua kalinya.

- **Expected Final Result:** Akun berhasil diaktifkan, password baru tersimpan dengan hashing aman, dan token langsung hangus (*single-use*).
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman aktivasi sukses dan pesan penolakan saat token dipakai ulang.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-AUTH-005: Proteksi Akses URL Ilegal Antarmuka & Layar Error 403
- **Test Case ID:** `TC-AUTH-005`
- **Scenario ID:** `SCN-AUTH-05`
- **Requirement ID:** `FR-08`, `DEC-012`
- **Judul:** Proteksi Otorisasi Antarmuka & Penanganan Halaman Terlarang (403 Forbidden)
- **Tujuan:** Memastikan pengguna dengan peran terbatas (cth: `EMPLOYEE`) yang mencoba mengakses rute administratif khusus (cth: `/admin/organization` atau `/compliance`) langsung dihadang dan dialihkan ke layar Error 403 Forbidden.
- **Modul / Halaman:** Router Guard & Halaman Error (`/forbidden`)
- **Kategori Pengujian:** Security / Authorization / RBAC
- **Teknik Desain Test Case:** Negative Testing / Boundary
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Pelanggaran akses (*privilege escalation*) dapat membocorkan konfigurasi organisasi rahasia ke level operasional.
- **Preconditions:** Pengguna telah login sebagai Employee (`dev.frontend@dutamedia.com`).
- **Test Data ID:** `TD-AUTH-01`
- **Persiapan Sebelum Tes:** Pastikan sesi login aktif sebagai Employee.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Periksa menu navigasi di sidebar kiri.
   - **Lokasi:** Sidebar grup *Management* dan *Administration*.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Menu administratif khusus seperti "Struktur Organisasi", "Kebijakan", dan "Antrean Kepatuhan" tidak ditampilkan atau disembunyikan untuk peran Employee.
   - **Verifikasi:** Tidak ada link `/admin/organization` di dalam DOM sidebar.
2. **Langkah 2**
   - **Aksi:** Ketikkan secara langsung di address bar browser: `http://localhost:5173/admin/organization` lalu tekan Enter.
   - **Lokasi:** Address bar browser.
   - **Data:** `http://localhost:5173/admin/organization`
   - **Hasil yang diharapkan:** Router guard mendeteksi pelanggaran peran (`EMPLOYEE` bukan `SYSTEM_ADMIN`/`HRGA`). Sistem secara otomatis mengalihkan pengguna ke layar Error 403 Forbidden (`/forbidden`).
   - **Verifikasi:** Halaman menampilkan kode kesalahan `403`, ilustrasi/badge peringatan akses ditolak, pesan "Akses Terbatas: Anda tidak memiliki izin untuk membuka halaman ini", dan tombol navigasi kembali "Kembali ke Beranda".
3. **Langkah 3**
   - **Aksi:** Klik tombol "Kembali ke Beranda" pada halaman error 403.
   - **Lokasi:** Halaman `/forbidden`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Aplikasi mengarahkan pengguna kembali ke halaman beranda kanonikalnya (`/daily/morning`) tanpa error.
   - **Verifikasi:** URL kembali ke `/daily/morning`.

- **Expected Final Result:** Rute terproteksi 100% aman dari akses ilegal manual via URL, layar 403 tampil elegan dan menyediakan navigasi pemulihan.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tampilan halaman Error 403 Forbidden saat Employee mencoba mengakses rute admin.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-AUTH-006: Pengakhiran Sesi Aman (Logout) & Pencegahan Back Cache
- **Test Case ID:** `TC-AUTH-006`
- **Scenario ID:** `SCN-AUTH-06`
- **Requirement ID:** `FR-07`
- **Judul:** Pengakhiran Sesi Aman (Logout) & Pencegahan Akses Kembali via Tombol Back
- **Tujuan:** Memastikan sesi otentikasi dihapus sepenuhnya saat logout, token dibersihkan, dan menekan tombol 'Back' di browser tidak menampilkan data aplikasi yang terlindungi.
- **Modul / Halaman:** Sidebar Footer & Halaman Login (`/login`)
- **Kategori Pengujian:** Security / Session Management
- **Teknik Desain Test Case:** Error Guessing & State Transition
- **Role:** Seluruh Peran (`EMPLOYEE` / `SUPERVISOR`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Komputer bersama di kantor dapat disalahgunakan rekan lain jika sesi tidak terhapus tuntas (*session residual hijacking*).
- **Preconditions:** Pengguna sedang login aktif.
- **Test Data ID:** `TD-AUTH-01`
- **Persiapan Sebelum Tes:** Berada di halaman internal aplikasi (misal `/daily/morning`).

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Klik tombol "Keluar" (Logout) pada panel footer sidebar kiri (`.side-bottom`).
   - **Lokasi:** Bagian bawah sidebar navigasi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Muncul dialog konfirmasi logout atau langsung memproses pengakhiran sesi. Sesi token di localStorage/cookie dihapus. Sistem me-redirect pengguna ke halaman `/login`.
   - **Verifikasi:** URL browser berubah menjadi `/login`. Form login kosong dan siap menerima input baru.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Back" (Kembali) pada toolbar browser.
   - **Lokasi:** Tombol navigasi browser (tanda panah kiri).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Router guard mendeteksi bahwa sesi sudah tidak ada (*unauthenticated*). Pengguna langsung ditendang kembali ke `/login`, tidak diizinkan melihat draf halaman `/daily/morning`.
   - **Verifikasi:** Halaman tetap berada di `/login`. Data sensitif sebelumnya tidak bocor di antarmuka.

- **Expected Final Result:** Logout menghancurkan sesi secara tuntas dan riwayat browser tidak dapat digunakan untuk membobol sistem.
- **Bukti yang Perlu Dikumpulkan:** Screenshot layar kembali ke `/login` saat tombol back ditekan.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 2: DAILY ACCOUNTABILITY — MORNING COMMITMENT

---

### TC-DLYM-001: Pengisian 1 s.d. 3 Komitmen Pagi Tepat Waktu (On-Time)
- **Test Case ID:** `TC-DLYM-001`
- **Scenario ID:** `SCN-DLYM-01`
- **Requirement ID:** `FR-09`, `FR-13`, `FR-16`, `DEC-001`, `DEC-004`
- **Judul:** Pengisian 1 s.d. 3 Komitmen Pagi Tepat Waktu (On-Time Submission)
- **Tujuan:** Memvalidasi bahwa karyawan dapat mengisi komitmen harian (1 hingga batas 3 komitmen) dengan tagging proyek dan estimasi durasi sebelum jam cut-off pagi, serta mendapatkan badge status *On-Time*.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Happy Path / Boundary Value Analysis
- **Teknik Desain Test Case:** Boundary Value Analysis (1, 2, 3 items) & Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Merupakan proses bisnis paling inti yang dilakukan seluruh karyawan Dutamedia setiap pagi.
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Hari kerja aktif sebelum jam cut-off pagi (09:00 WIB).
- **Test Data ID:** `TD-DLYM-01` dan `TD-DLYM-02`
- **Persiapan Sebelum Tes:** Pastikan belum ada komitmen yang disubmit untuk tanggal hari ini.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Morning Commitment via sidebar.
   - **Lokasi:** Menu "Komitmen Pagi" (`/daily/morning`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman terbuka dengan header tanggal hari ini, indikator waktu pengisian, dan kartu formulir komitmen item ke-1.
   - **Verifikasi:** Terdapat tombol "+ Tambah Komitmen", checkbox opsi 0 komitmen, dan tombol "Simpan & Kirim Komitmen Pagi".
2. **Langkah 2**
   - **Aksi:** Isi komitmen pertama: masukkan judul tugas, pilih kategori proyek/inisiatif dari dropdown, dan tentukan estimasi durasi.
   - **Lokasi:** Form Komitmen Item 1.
   - **Data:** Judul: `Menyelesaikan migrasi VAPID Push Notification`, Proyek: `Dutamedia Core / Internal`, Durasi: `4 Jam`.
   - **Hasil yang diharapkan:** Field terisi rapi tanpa error.
   - **Verifikasi:** Teks judul dan dropdown proyek terpilih sesuai data.
3. **Langkah 3**
   - **Aksi:** Klik tombol "+ Tambah Komitmen" untuk membuat item ke-2 dan item ke-3.
   - **Lokasi:** Tombol di bawah kartu komitmen.
   - **Data:** Item 2: `Code review PR modul leave approval` (2 Jam); Item 3: `Unit test coverage router guard` (2 Jam).
   - **Hasil yang diharapkan:** Kartu komitmen ke-2 dan ke-3 muncul. Setelah mencapai tepat 3 item, tombol "+ Tambah Komitmen" dinonaktifkan atau disembunyikan (DEC-004: batas maksimal 3 komitmen).
   - **Verifikasi:** Jumlah total kartu komitmen adalah tepat 3. Tidak dapat menambah item ke-4.
4. **Langkah 4**
   - **Aksi:** Klik tombol "Simpan & Kirim Komitmen Pagi".
   - **Lokasi:** Tombol aksi utama di bagian bawah form.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Muncul dialog konfirmasi pengiriman, pengguna mengonfirmasi, muncul toast sukses "Komitmen pagi berhasil disimpan". Formulir beralih ke tampilan *Summary Card* harian berstatus **On-Time** (Badge Hijau).
   - **Verifikasi:** Lakukan refresh browser (F5). Ketiga komitmen tetap tampil utuh dengan status On-Time.

- **Expected Final Result:** 3 Komitmen berhasil disimpan di database, status waktu tercatat *On-Time*, dan data persisten saat reload.
- **Bukti yang Perlu Dikumpulkan:** Screenshot ringkasan komitmen pagi yang memuat 3 item dan badge On-Time.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-DLYM-002: Opsi 0 Komitmen dengan Justifikasi Wajib >= 10 Karakter
- **Test Case ID:** `TC-DLYM-002`
- **Scenario ID:** `SCN-DLYM-02`
- **Requirement ID:** `FR-10`, `DEC-004`, `DEC-010`
- **Judul:** Opsi 0 Komitmen dengan Justifikasi Wajib (Anti-Bypass Rule)
- **Tujuan:** Memastikan karyawan yang tidak memiliki komitmen kerja operasional reguler dapat memilih opsi 0 komitmen, tetapi wajib menyertakan alasan justifikasi minimal 10 karakter.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Boundary Value Analysis / Negative & Positive Path
- **Teknik Desain Test Case:** Boundary Value Analysis (0 karakter, 4 karakter, 10 karakter)
- **Role:** `EMPLOYEE` (`dev.backend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Mencegah karyawan mengabaikan komitmen kerja tanpa alasan valid (*accountability loophole*).
- **Preconditions:** Login sebagai `dev.backend@dutamedia.com`. Belum mengisi komitmen hari ini.
- **Test Data ID:** `TD-DLYM-03` dan `TD-DLYM-04`
- **Persiapan Sebelum Tes:** Berada di halaman `/daily/morning`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Centang checkbox "Saya tidak memiliki komitmen tugas terencana hari ini (0 Komitmen)".
   - **Lokasi:** Bagian atas formulir komitmen pagi.
   - **Data:** Checkbox dicentang.
   - **Hasil yang diharapkan:** Kartu komitmen 1-3 disembunyikan/dinonaktifkan; muncul area textarea wajib: "Alasan Tidak Ada Komitmen (Minimal 10 karakter)".
   - **Verifikasi:** Textarea alasan muncul dengan indikator karakter counter (cth: `0/10`).
2. **Langkah 2**
   - **Aksi:** Biarkan textarea alasan kosong, lalu klik tombol "Kirim Komitmen".
   - **Lokasi:** Tombol submit.
   - **Data:** Teks kosong.
   - **Hasil yang diharapkan:** Form menolak pengiriman. Muncul pesan validasi merah: "Alasan wajib diisi minimal 10 karakter".
   - **Verifikasi:** Form tidak tersubmit, tidak ada notifikasi sukses.
3. **Langkah 3**
   - **Aksi:** Masukkan alasan pendek di bawah batas batas (cth: `Ijin`) lalu klik submit.
   - **Lokasi:** Textarea alasan.
   - **Data:** `Ijin` (4 karakter).
   - **Hasil yang diharapkan:** Form tetap menolak submit karena panjang karakter < 10.
   - **Verifikasi:** Pesan peringatan batas minimal 10 karakter tetap aktif.
4. **Langkah 4**
   - **Aksi:** Masukkan alasan valid dengan panjang minimal 10 karakter (cth: `Mengikuti workshop PostgreSQL indexing seharian`), lalu klik submit.
   - **Lokasi:** Textarea alasan.
   - **Data:** `Mengikuti workshop PostgreSQL indexing seharian` (44 karakter).
   - **Hasil yang diharapkan:** Validasi lolos, pengiriman berhasil diproses. Sistem mencatat status harian sebagai `NOT_APPLICABLE — NO_COMMITMENT` dengan alasan tersimpan rapi.
   - **Verifikasi:** Layar menampilkan kartu status 0 Komitmen dengan alasan workshop tertera jelas.

- **Expected Final Result:** Aturan batas 10 karakter berjalan ketat, mencegah bypass 0 komitmen tanpa pertanggungjawaban jelas.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pesan validasi gagal saat < 10 char dan screenshot kartu ringkasan saat >= 10 char sukses.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-DLYM-005: Penguncian Form Komitmen Pagi Pasca Cut-Off (Anti-Direct Edit)
- **Test Case ID:** `TC-DLYM-005`
- **Scenario ID:** `SCN-DLYM-05`
- **Requirement ID:** `FR-14`, `DEC-002`
- **Judul:** Penguncian Form Komitmen Pagi Pasca Cut-Off (Anti-Direct Edit DEC-002)
- **Tujuan:** Memvalidasi bahwa karyawan tidak dapat mengisi atau menyunting komitmen pagi secara langsung setelah batas waktu cut-off terlewati; antarmuka wajib mengarahkan ke permohonan koreksi resmi.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** State Transition / Business Rules
- **Teknik Desain Test Case:** Decision Table & State Transition
- **Role:** `EMPLOYEE`
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Menjaga integritas data komitmen dan kepatuhan waktu; mencegah kecurangan pengisian mundur (*backdating fraud*).
- **Preconditions:** Waktu sistem berada di luar jendela cut-off pagi (setelah jam cut-off + grace period, misal > 09:30 WIB) atau tanggal yang dibuka adalah tanggal kemarin yang belum diisi.
- **Test Data ID:** `TD-DLYM-01`
- **Persiapan Sebelum Tes:** Buka halaman `/daily/morning` untuk tanggal yang sudah terkunci.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Morning Commitment pada periode waktu yang telah melewati cut-off.
   - **Lokasi:** `/daily/morning`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Antarmuka mendeteksi status `NO_SUBMISSION` (Terkunci). Input teks, dropdown proyek, dan tombol submit dinonaktifkan (*disabled/read-only*).
   - **Verifikasi:** Seluruh field input tidak dapat diketik atau diubah.
2. **Langkah 2**
   - **Aksi:** Amati informasi peringatan pada halaman.
   - **Lokasi:** Banner pemberitahuan di atas form.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Muncul banner informatif berwarna kuning/abu-abu: "Batas waktu pengisian komitmen pagi telah berakhir. Perubahan data hanya dapat dilakukan melalui Pengajuan Koreksi".
   - **Verifikasi:** Terdapat tombol atau tautan yang jelas: "Ajukan Koreksi Pagi".
3. **Langkah 3**
   - **Aksi:** Klik tombol "Ajukan Koreksi Pagi".
   - **Lokasi:** Tombol pada banner penguncian.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Aplikasi mengarahkan pengguna ke halaman formulir permohonan koreksi pagi: `/corrections/morning`.
   - **Verifikasi:** URL browser berubah menjadi `/corrections/morning`.

- **Expected Final Result:** Direct edit diblokir total setelah cut-off sesuai regulasi DEC-002; pengalihan ke alur koreksi berjalan mulus.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman komitmen yang terkunci dengan banner instruksi koreksi.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 3: DAILY ACCOUNTABILITY — ADDITIONAL WORK

---

### TC-DLYA-001: Pencatatan Tugas Tambahan Ad-Hoc di Tengah Jam Kerja
- **Test Case ID:** `TC-DLYA-001`
- **Scenario ID:** `SCN-DLYA-01`
- **Requirement ID:** `FR-17`, `FR-18`, `FR-19`
- **Judul:** Pencatatan Tugas Tambahan Ad-Hoc di Siang Hari & Integrasi ke Rekap EOD
- **Tujuan:** Memastikan karyawan dapat mencatat tugas mendadak di luar rencana pagi hari dengan menyertakan pemberi instruksi, dan tugas tersebut otomatis terdaftar pada evaluasi sore (EOD).
- **Modul / Halaman:** Additional Work (`/daily/additional-work`)
- **Kategori Pengujian:** Happy Path / Inter-Module Integration
- **Teknik Desain Test Case:** Use Case Testing
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Tugas mendadak yang tidak tercatat membuat capaian kerja karyawan tidak terukur secara adil di mata manajemen.
- **Preconditions:** Komitmen pagi sudah diisi dan tersimpan.
- **Test Data ID:** `TD-DLYA-01`
- **Persiapan Sebelum Tes:** Login sebagai Employee dan buka `/daily/additional-work`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Tugas Tambahan" via sidebar kiri.
   - **Lokasi:** Menu navigasi `/daily/additional-work`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman terbuka menampilkan ringkasan komitmen pagi yang sudah ada dan form pencatatan tugas tambahan baru.
   - **Verifikasi:** Terdapat field Judul Tugas, Dropdown Pemberi Instruksi (Direct Manager, PM, dll.), Dropdown Proyek, dan Estimasi Durasi.
2. **Langkah 2**
   - **Aksi:** Isi detail tugas tambahan mendesak dari atasan.
   - **Lokasi:** Formulir Tugas Tambahan.
   - **Data:** Judul: `Hotfix urgent bug memory leak payment`, Pemberi Instruksi: `Bambang Pratama (Tech Lead)`, Proyek: `Core Payment`, Durasi: `2 Jam`.
   - **Hasil yang diharapkan:** Seluruh field terisi lengkap dan valid.
   - **Verifikasi:** Field tidak menampilkan indikator error.
3. **Langkah 3**
   - **Aksi:** Klik tombol "Simpan Tugas Tambahan".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast sukses muncul "Tugas tambahan berhasil dicatat". Item baru muncul pada daftar tugas ad-hoc hari ini dengan badge "Ad-Hoc / Tambahan".
   - **Verifikasi:** Item baru tercantum dalam tabel/kartu tugas tambahan di halaman tersebut.
4. **Langkah 4**
   - **Aksi:** Navigasi ke menu "Hasil Sore (EOD)" via sidebar.
   - **Lokasi:** Menu `/daily/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman EOD menampilkan daftar tugas yang harus dievaluasi, mencakup 3 komitmen pagi PLUS 1 tugas tambahan yang baru saja dicatat.
   - **Verifikasi:** Total item yang harus dievaluasi adalah 4 item (3 Komitmen Pagi + 1 Tugas Tambahan).

- **Expected Final Result:** Tugas ad-hoc berhasil dicatat dengan asosiasi instruktur yang jelas dan otomatis terintegrasi ke form EOD sore hari.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Additional Work dan screenshot halaman EOD yang menampilkan item tugas tambahan.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 4: DAILY ACCOUNTABILITY — END-OF-DAY (EOD) OUTCOME

---

### TC-DLYE-001: Pelaporan Evaluasi Hasil Kerja Sore Lengkap (EOD Outcome)
- **Test Case ID:** `TC-DLYE-001`
- **Scenario ID:** `SCN-DLYE-01`
- **Requirement ID:** `FR-21`, `FR-25`, `FR-26`, `DEC-001`
- **Judul:** Pelaporan Evaluasi Hasil Kerja Sore Lengkap Tepat Waktu (On-Time)
- **Tujuan:** Memvalidasi bahwa karyawan dapat mengisi status pencapaian untuk seluruh tugas harian, mencatat refleksi diri, dan mengirimkan laporan EOD sebelum cut-off sore dengan status *On-Time*.
- **Modul / Halaman:** EOD Outcome (`/daily/eod`)
- **Kategori Pengujian:** Happy Path
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Penutupan siklus akuntabilitas harian; data menjadi dasar pelaporan pimpinan dan evaluasi kinerja.
- **Preconditions:** Komitmen pagi telah terisi. Waktu pengujian berada dalam jendela waktu sore (sebelum cut-off 17:30 WIB).
- **Test Data ID:** `TD-DLYE-01`
- **Persiapan Sebelum Tes:** Login sebagai Employee dan buka `/daily/eod`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman EOD Outcome via sidebar.
   - **Lokasi:** `/daily/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman menampilkan daftar seluruh komitmen hari ini dengan radio button / dropdown pilihan status pencapaian: `Done`, `In Progress`, `Blocked`, `Cancelled`.
   - **Verifikasi:** Setiap item memiliki opsi status yang dapat diklik.
2. **Langkah 2**
   - **Aksi:** Pilih status `Done` untuk seluruh item komitmen.
   - **Lokasi:** Selector status pada setiap item komitmen.
   - **Data:** Status: `Done` untuk semua komitmen.
   - **Hasil yang diharapkan:** Indikator progres bergerak menjadi 100%. Panel Heuristic Suggestion menyarankan status risiko harian **HIJAU (GREEN)**.
   - **Verifikasi:** Badge saran sistem menampilkan "Saran: Hijau (Semua Komitmen Tuntas)".
3. **Langkah 3**
   - **Aksi:** Masukkan catatan refleksi harian pada textarea yang disediakan.
   - **Lokasi:** Textarea Refleksi Pembelajaran.
   - **Data:** `Hari ini pekerjaan integrasi selesai lebih cepat setelah refactoring modul VAPID. Besok fokus unit test.`
   - **Hasil yang diharapkan:** Teks refleksi terinput dengan baik.
   - **Verifikasi:** Tidak ada pembatasan yang menghalangi teks refleksi.
4. **Langkah 4**
   - **Aksi:** Klik tombol "Kirim Laporan Hasil Sore".
   - **Lokasi:** Tombol submit utama.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Konfirmasi pengiriman muncul, pengguna klik setuju. Toast sukses muncul "Laporan EOD berhasil dikirim". Tampilan beralih ke ringkasan harian berstatus **On-Time**.
   - **Verifikasi:** Muat ulang halaman (F5). Hasil evaluasi tetap tersimpan dan tidak kembali ke form kosong.

- **Expected Final Result:** Laporan EOD tersimpan rapi, berstatus On-Time, persisten pasca reload, dan status harian karyawan terverifikasi tuntas (Hijau).
- **Bukti yang Perlu Dikumpulkan:** Screenshot ringkasan EOD yang memuat status Done pada seluruh tugas dan badge On-Time.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-DLYE-002: Heuristic Status Suggestion & Hak Prerogatif Anti-Lock Green
- **Test Case ID:** `TC-DLYE-002`
- **Scenario ID:** `SCN-DLYE-02`
- **Requirement ID:** `FR-22`, `FR-23`, `DEC-003`
- **Judul:** Heuristic Status Suggestion & Verifikasi Regulasi Anti-Lock Green (DEC-003)
- **Tujuan:** Memvalidasi aturan baku DEC-003: meskipun salah satu tugas berstatus `Blocked` dan sistem secara heuristik menyarankan status Kuning/Merah, **OPSI HIJAU DILARANG DIKUNCI**. Karyawan tetap berhak memilih status Hijau dengan menyertakan justifikasi mandiri.
- **Modul / Halaman:** EOD Outcome (`/daily/eod`)
- **Kategori Pengujian:** Business Rules / Non-Binding Heuristics
- **Teknik Desain Test Case:** Decision Table Testing
- **Role:** `EMPLOYEE`
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Pelanggaran regulasi psikologis kerja; sistem tidak boleh bersikap otoriter mengunci status karyawan tanpa memberi ruang penjelasan profesional.
- **Preconditions:** Memiliki draf evaluasi EOD dengan minimal 1 komitmen berstatus `Blocked`.
- **Test Data ID:** `TD-DLYE-02` dan `TD-DLYE-03`
- **Persiapan Sebelum Tes:** Berada di form pengisian EOD.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Tandai komitmen 1 sebagai `Done`, dan tandai komitmen 2 sebagai `Blocked`. Isi alasan kendala pada komitmen 2.
   - **Lokasi:** Selector status komitmen di `/daily/eod`.
   - **Data:** Komitmen 2 Alasan: `Terkendala akses credential sandbox dari vendor payment`.
   - **Hasil yang diharapkan:** Sistem mendeteksi adanya blocker aktif. Panel kalkulasi heuristik otomatis menyarankan status harian **KUNING / MERAH**.
   - **Verifikasi:** Teks banner heuristik menampilkan saran: "Saran Sistem: Kuning/Merah (Terdapat komitmen terhambat)".
2. **Langkah 2**
   - **Aksi:** Periksa ketersediaan opsi radio button status harian akhir: Hijau, Kuning, Merah.
   - **Lokasi:** Selector Status Harian Mandiri.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Seluruh opsi (Hijau, Kuning, Merah) berstatus **AKTIF (ENABLED)**. Opsi Hijau TIDAK BOLEH berstatus disabled/dikunci/abu-abu.
   - **Verifikasi:** Elemen radio button Hijau dapat di-hover dan kursor berbentuk pointer (bukan `not-allowed`).
3. **Langkah 3**
   - **Aksi:** Klik opsi radio button **HIJAU (GREEN)**.
   - **Lokasi:** Radio button Hijau.
   - **Data:** Klik pilihan Hijau.
   - **Hasil yang diharapkan:** Pilihan Hijau terpilih. Muncul field textarea kontekstual: "Justifikasi Override Status Hijau (Wajib jika saran sistem bukan hijau)".
   - **Verifikasi:** Pilihan radio berpindah ke Hijau secara visual.
4. **Langkah 4**
   - **Aksi:** Masukkan catatan justifikasi override (cth: `Kendala vendor sudah dieskalasi ke atasan dan ada mitigasi offline, target harian esensial tercapai`), lalu klik submit.
   - **Lokasi:** Textarea justifikasi override dan tombol submit.
   - **Data:** Teks justifikasi profesional minimal 10 karakter.
   - **Hasil yang diharapkan:** Sistem menerima laporan dengan status akhir **HIJAU**. Laporan tersimpan di database beserta catatan justifikasi mandiri karyawan.
   - **Verifikasi:** Pada ringkasan laporan harian, status akhir tercatat Hijau dengan tag catatan justifikasi tertera.

- **Expected Final Result:** Aturan Anti-Lock Green (DEC-003) terbukti berfungsi 100%; sistem memandu tanpa mengunci hak prerogatif pengguna.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tampilan form saat sistem menyarankan Kuning tetapi opsi Hijau berhasil dipilih dan disubmit.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 5: MANAJEMEN HAMBATAN (BLOCKER) & ESKALASI SLA

---

### TC-BLKR-001: Pelaporan Hambatan Baru Tingkat Kritis dengan SLA 2 Jam
- **Test Case ID:** `TC-BLKR-001`
- **Scenario ID:** `SCN-BLKR-01`
- **Requirement ID:** `FR-29`, `FR-30`, `DEC-007`
- **Judul:** Pelaporan Hambatan Baru Tingkat Kritis (Raise Blocker) & Verifikasi Target SLA
- **Tujuan:** Memvalidasi bahwa setiap pengguna dapat melaporkan kendala teknis kritis, memilih tipe hambatan dan dampak organisasi, serta memverifikasi bahwa sistem menyematkan target SLA respons 2 jam secara otomatis.
- **Modul / Halaman:** Raise Blocker (`/blockers/raise`)
- **Kategori Pengujian:** Happy Path / Workflow Initialization
- **Teknik Desain Test Case:** Equivalence Partitioning & Decision Table
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Hambatan kritis yang tidak tercatat dengan SLA akurat berisiko menunda pengiriman proyek dan merugikan reputasi perusahaan.
- **Preconditions:** Login sebagai Employee.
- **Test Data ID:** `TD-BLKR-01`
- **Persiapan Sebelum Tes:** Buka menu "Lapor Blocker" via sidebar kiri (`/blockers/raise`).

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Raise Blocker.
   - **Lokasi:** `/blockers/raise`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Formulir pelaporan blocker terbuka dengan field: Judul Hambatan, Deskripsi Rinci, Tingkat Keparahan (Kritis, Tinggi, Sedang), Tipe Hambatan (Teknis, Infrastruktur, Dependensi, Vendor), dan Estimasi Dampak.
   - **Verifikasi:** Seluruh field dan dropdown dalam kondisi interaktif.
2. **Langkah 2**
   - **Aksi:** Isi detail hambatan tingkat kritis.
   - **Lokasi:** Formulir pelaporan blocker.
   - **Data:** Judul: `Database Staging Timeout & Redis Cache Corrupt`, Deskripsi: `Koneksi database pool staging terputus berulang kali menyebabkan integrasi terhenti total. Butuh restart service dan reset connection.`, Severity: `KRITIS`, Tipe: `INFRASTRUCTURE`, Dampak: `TEAM_BLOCKED`.
   - **Hasil yang diharapkan:** Sistem otomatis menampilkan kalkulasi target SLA: "Target Respons SLA: 2 Jam Kerja (Tingkat Kritis)".
   - **Verifikasi:** Indikator badge target 2 jam tampil jelas di sebelah pilihan Kritis.
3. **Langkah 3**
   - **Aksi:** Klik tombol "Kirim Laporan Hambatan".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast sukses muncul "Hambatan kritis berhasil dilaporkan". Aplikasi me-redirect pengguna ke halaman Antrean Blocker (`/blockers`).
   - **Verifikasi:** Blocker baru tercantum di bagian paling atas antrean dengan status `OPEN`, badge merah `KRITIS`, dan timer countdown SLA aktif.

- **Expected Final Result:** Blocker kritis tersimpan dengan status OPEN, SLA 2 jam terpasang deterministik, dan siap ditindaklanjuti oleh atasan.
- **Bukti yang Perlu Dikumpulkan:** Screenshot detail blocker di antrean dengan badge KRITIS dan SLA 2 Jam.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-BLKR-002: Konfirmasi Penerimaan Blocker oleh Atasan (Acknowledge)
- **Test Case ID:** `TC-BLKR-002`
- **Scenario ID:** `SCN-BLKR-02`
- **Requirement ID:** `FR-31`, `FR-32`, `DEC-007`
- **Judul:** Konfirmasi Penerimaan Blocker oleh Atasan (Acknowledge / Respons Awal)
- **Tujuan:** Memvalidasi bahwa Tech Lead / Supervisor dapat melihat blocker aktif anggota timnya dan mengonfirmasi penanganan (*Acknowledge*) sebelum batas waktu SLA kedaluwarsa.
- **Modul / Halaman:** Blocker Queue (`/blockers`)
- **Kategori Pengujian:** Workflow Transition / SLA Adherence
- **Teknik Desain Test Case:** State Transition Testing
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Tanpa acknowledgment tepat waktu, blocker dianggap terlantar (*SLA breach*) dan tereskalasi ke level direksi.
- **Preconditions:** Login sebagai `lead.tech@dutamedia.com`. Terdapat blocker `TC-BLKR-001` berstatus `OPEN` di antrean tim Engineering.
- **Test Data ID:** `TD-AUTH-02` dan `TD-BLKR-01`
- **Persiapan Sebelum Tes:** Masuk ke halaman `/blockers`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Blocker Queue via sidebar.
   - **Lokasi:** Menu "Antrean Blocker" (`/blockers`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Daftar blocker tim ditampilkan. Blocker `Database Staging Timeout` yang dilaporkan Aditya Nugroho muncul dengan badge `OPEN`.
   - **Verifikasi:** Tombol "Respons / Bantu" tersedia pada baris blocker tersebut.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Respons / Bantu" pada blocker kritis tersebut.
   - **Lokasi:** Tombol aksi pada kartu blocker.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal dialog "Respons Hambatan Tim" terbuka, memuat opsi tindakan intervensi dan kolom catatan tindakan awal.
   - **Verifikasi:** Modal terbuka dengan judul yang sesuai dan field catatan intervensi aktif.
3. **Langkah 3**
   - **Aksi:** Masukkan rencana tindakan awal dan klik "Konfirmasi Respons (Acknowledge)".
   - **Lokasi:** Modal dialog respons blocker.
   - **Data:** Catatan: `Saya sedang mengontak tim Infra DevOps untuk restart instance RDS staging sekarang.`
   - **Hasil yang diharapkan:** Modal menutup, toast sukses muncul, status blocker bertransisi dari `OPEN` menjadi `ACKNOWLEDGED` (atau `IN_PROGRESS`). SLA respons awal tercatat terpenuhi tepat waktu (*Within SLA*).
   - **Verifikasi:** Status badge pada blocker berubah warna menjadi biru/kuning dengan teks `ACKNOWLEDGED` / `IN_PROGRESS`.

- **Expected Final Result:** Transisi status berhasil, waktu respons awal tercatat di sistem audit, dan timer breached SLA berhenti.
- **Bukti yang Perlu Dikumpulkan:** Screenshot kartu blocker yang telah berubah status menjadi `ACKNOWLEDGED` dengan catatan supervisor tertera.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-BLKR-003: Resolusi Blocker dengan Catatan Solusi Tuntas >= 10 Karakter
- **Test Case ID:** `TC-BLKR-003`
- **Scenario ID:** `SCN-BLKR-03`
- **Requirement ID:** `FR-33`, `DEC-007`, `DEC-010`
- **Judul:** Resolusi Blocker dengan Catatan Solusi Tuntas (Anti-Empty Resolution)
- **Tujuan:** Memastikan penutupan blocker menjadi `RESOLVED` mewajibkan pengisian catatan solusi tuntas minimal 10 karakter agar ada transfer pengetahuan (*knowledge base*) bagi organisasi.
- **Modul / Halaman:** Blocker Queue (`/blockers`)
- **Kategori Pengujian:** Boundary Value & State Transition
- **Teknik Desain Test Case:** Boundary Value Analysis & Error Guessing
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Penutupan blocker tanpa solusi tertulis menghilangkan jejak penyelesaian masalah teknis dan menyulitkan audit pasca insiden (*post-mortem*).
- **Preconditions:** Blocker `TC-BLKR-001` dalam status `ACKNOWLEDGED` / `IN_PROGRESS`.
- **Test Data ID:** `TD-BLKR-03`
- **Persiapan Sebelum Tes:** Berada di halaman `/blockers`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Klik tombol "Tandai Selesai (Resolve)" pada blocker yang sedang ditangani.
   - **Lokasi:** Halaman `/blockers`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal "Penyelesaian Hambatan" terbuka dengan textarea wajib: "Deskripsi Solusi Tuntas (Minimal 10 karakter)".
   - **Verifikasi:** Modal terbuka dengan tombol "Konfirmasi Selesai".
2. **Langkah 2**
   - **Aksi:** Biarkan textarea solusi kosong atau isi teks pendek (cth: `Beres`), lalu klik "Konfirmasi Selesai".
   - **Lokasi:** Modal penyelesaian blocker.
   - **Data:** Teks: `Beres` (5 karakter).
   - **Hasil yang diharapkan:** Sistem menolak penutupan blocker. Pesan validasi muncul: "Deskripsi solusi tuntas wajib diisi minimal 10 karakter".
   - **Verifikasi:** Status blocker tetap tidak berubah (`IN_PROGRESS`).
3. **Langkah 3**
   - **Aksi:** Masukkan deskripsi solusi teknis yang jelas dan lengkap (>= 10 karakter), lalu klik "Konfirmasi Selesai".
   - **Lokasi:** Modal penyelesaian blocker.
   - **Data:** `Instance staging database telah direstart oleh DevOps dan parameter max_connections dinaikkan menjadi 200. Koneksi normal kembali.`
   - **Hasil yang diharapkan:** Validasi berhasil. Status blocker bertransisi menjadi `RESOLVED` (Badge Hijau). Blocker diarsipkan dari antrean aktif dan tercatat pada riwayat resolusi.
   - **Verifikasi:** Filter antrean aktif tidak lagi menampilkan blocker tersebut, tetapi dapat ditemukan saat tab filter diubah ke "Selesai (Resolved)".

- **Expected Final Result:** Transisi status ke RESOLVED sukses dengan bukti dokumentasi solusi tuntas di database.
- **Bukti yang Perlu Dikumpulkan:** Screenshot modal penolakan saat solusi < 10 char dan screenshot kartu blocker dengan status RESOLVED.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 6: KEPATUHAN & PERMOHONAN KOREKSI

---

### TC-CORR-001: Pengajuan Permohonan Koreksi Komitmen Pagi Pasca Cut-Off
- **Test Case ID:** `TC-CORR-001`
- **Scenario ID:** `SCN-CORR-01`
- **Requirement ID:** `FR-37`, `DEC-002`, `DEC-010`
- **Judul:** Pengajuan Permohonan Koreksi Komitmen Pagi Pasca Cut-Off
- **Tujuan:** Memvalidasi alur pengajuan permohonan koreksi komitmen pagi untuk tanggal yang telah terkunci, lengkap dengan usulan data komitmen baru dan alasan wajib minimal 10 karakter.
- **Modul / Halaman:** Morning Correction Request (`/corrections/morning`)
- **Kategori Pengujian:** Business Process / Exception Path
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Memungkinkan pemulihan kepatuhan karyawan yang terlambat dengan mekanisme akuntabel tanpa merusak batasan cut-off.
- **Preconditions:** Login sebagai Employee. Terdapat riwayat tanggal hari kerja sebelumnya yang berstatus `NO_SUBMISSION`.
- **Test Data ID:** `TD-CORR-01`
- **Persiapan Sebelum Tes:** Buka `/corrections/morning`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Morning Correction Request.
   - **Lokasi:** Menu "Koreksi Komitmen Pagi" (`/corrections/morning`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Formulir permohonan terbuka dengan pilihan tanggal komitmen yang dapat dikoreksi, input usulan komitmen baru, dan textarea alasan permohonan.
   - **Verifikasi:** Dropdown/kalender pemilihan tanggal terkunci tersedia.
2. **Langkah 2**
   - **Aksi:** Pilih tanggal yang ingin dikoreksi, masukkan 2 komitmen yang sebenarnya dikerjakan, dan isi alasan keterlambatan pengisian.
   - **Lokasi:** Formulir koreksi pagi.
   - **Data:** Tanggal: Kemarin, Usulan Komitmen 1: `Setup docker compose PostgreSQL staging`, Usulan Komitmen 2: `Analisis query slow log`, Alasan: `Koneksi internet kantor mengalami pemadaman total akibat kabel fiber optik terputus.`
   - **Hasil yang diharapkan:** Seluruh data terisi valid tanpa pesan error.
   - **Verifikasi:** Alasan memenuhi syarat minimal 10 karakter.
3. **Langkah 3**
   - **Aksi:** Klik tombol "Kirim Permohonan Koreksi".
   - **Lokasi:** Tombol submit koreksi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Muncul dialog konfirmasi bahwa permohonan akan dikirim ke Atasan Langsung (Bambang Pratama). Setelah dikonfirmasi, toast sukses muncul dan permohonan berstatus `PENDING`.
   - **Verifikasi:** Permohonan muncul pada tabel riwayat koreksi pribadi dengan badge kuning `MENUNGGU PERSETUJUAN (PENDING)`.

- **Expected Final Result:** Permohonan koreksi tersimpan berstatus PENDING dan siap ditinjau oleh atasan langsung di antrean review.
- **Bukti yang Perlu Dikumpulkan:** Screenshot riwayat permohonan koreksi dengan status PENDING.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-CORR-002: Persetujuan Permohonan Koreksi oleh Direct Manager
- **Test Case ID:** `TC-CORR-002`
- **Scenario ID:** `SCN-CORR-02`
- **Requirement ID:** `FR-39`, `DEC-006`, `DEC-013`
- **Judul:** Persetujuan Permohonan Koreksi oleh Atasan Langsung (Direct Manager Approval)
- **Tujuan:** Memvalidasi bahwa atasan langsung dapat melihat permohonan koreksi bawahan, membandingkan data usulan, menyetujui permohonan, dan memverifikasi data komitmen terbarui secara otomatis.
- **Modul / Halaman:** Correction Review (`/corrections/review`)
- **Kategori Pengujian:** Workflow Transition / Role Authority
- **Teknik Desain Test Case:** State Transition Testing
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Alur persetujuan yang gagal membuat data karyawan tetap berstatus melanggar aturan secara keliru.
- **Preconditions:** Login sebagai `lead.tech@dutamedia.com`. Terdapat pengajuan koreksi `TC-CORR-001` berstatus `PENDING` dari Aditya Nugroho.
- **Test Data ID:** `TD-AUTH-02` dan `TD-CORR-01`
- **Persiapan Sebelum Tes:** Buka `/corrections/review`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Correction Review via sidebar.
   - **Lokasi:** `/corrections/review`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Antrean peninjauan koreksi terbuka. Pengajuan dari "Aditya Nugroho" tampil dengan detail tanggal, alasan internet mati, dan tombol aksi: "Setujui" serta "Tolak".
   - **Verifikasi:** Data perbandingan sebelum (Kosong) vs sesudah (2 Komitmen) tampil transparan.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Setujui Permohonan".
   - **Lokasi:** Baris pengajuan Aditya Nugroho.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal konfirmasi persetujuan muncul, memberikan opsi penambahan catatan atasan (opsional saat setuju).
   - **Verifikasi:** Modal persetujuan terbuka.
3. **Langkah 3**
   - **Aksi:** Masukkan catatan singkat persetujuan (cth: `Disetujui. Kejadian insiden ISP kantor telah dikonfirmasi valid oleh tim GA.`) lalu klik "Konfirmasi Setujui".
   - **Lokasi:** Modal persetujuan.
   - **Data:** Catatan atasan.
   - **Hasil yang diharapkan:** Toast sukses muncul "Koreksi berhasil disetujui". Status pengajuan berubah menjadi `APPROVED`. Data komitmen tanggal terkait langsung terisi di riwayat kerja Aditya Nugroho.
   - **Verifikasi:** Pengajuan berpindah ke tab "Riwayat Disetujui". Jejak audit log permanen (DEC-013) mencatat ID atasan dan timestamp persetujuan.

- **Expected Final Result:** Koreksi disetujui, status bertransisi ke APPROVED, data komitmen tanggal bersangkutan terisi resmi, dan audit log tercatat abadi.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pengajuan di tab Disetujui dengan badge hijau APPROVED dan catatan supervisor.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-CORR-004: Pengawasan Kepatuhan & Deteksi Pola Pelanggaran 3x oleh HRGA
- **Test Case ID:** `TC-CORR-004`
- **Scenario ID:** `SCN-CORR-04`
- **Requirement ID:** `FR-41`, `FR-42`
- **Judul:** Pengawasan Kepatuhan & Deteksi Pola Pelanggaran 3x oleh HRGA (Compliance Radar)
- **Tujuan:** Memvalidasi bahwa tim HRGA dapat memantau akumulasi pelanggaran komitmen seluruh karyawan dan sistem secara otomatis menandai karyawan yang mencapai ambang batas pelanggaran 3x berturut-turut.
- **Modul / Halaman:** Compliance Queue (`/compliance`)
- **Kategori Pengujian:** Compliance & Risk Analytics
- **Teknik Desain Test Case:** Boundary Value & Heuristic Pattern Detection
- **Role:** `HRGA` (`hrga@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Kegagalan deteksi dini ketidakdisiplinan merusak budaya akuntabilitas organisasi.
- **Preconditions:** Login sebagai HRGA (`hrga@dutamedia.com`).
- **Test Data ID:** `TD-AUTH-03`
- **Persiapan Sebelum Tes:** Buka `/compliance`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Antrean Kepatuhan" via sidebar kiri.
   - **Lokasi:** `/compliance`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman Compliance Queue terbuka menampilkan statistik kepatuhan perusahaan: Tingkat Kepatuhan Organisasi (%), Jumlah Pelanggaran Hari Ini, dan Daftar Personil dalam Pengawasan Kepatuhan.
   - **Verifikasi:** Terdapat filter departemen dan tab kategori pelanggaran: 1x Pelanggaran, 2x Waspada, dan 3x Kritis (Ambang Intervensi).
2. **Langkah 2**
   - **Aksi:** Buka tab "Pola Kritis (>= 3x Pelanggaran)".
   - **Lokasi:** Tab filter antrean kepatuhan.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Menampilkan daftar personil yang memiliki akumulasi 3 hari tanpa pengisian komitmen. Kartu personil ditandai dengan badge merah berkedip "Perlu Tindakan HRGA / Panggilan Klarifikasi".
   - **Verifikasi:** Terdapat rincian tanggal-tanggal pelanggaran dan tombol opsi "Terbitkan Surat Peringatan" atau "Beri Dispensasi Resmi".

- **Expected Final Result:** Antrean kepatuhan menyajikan data akurat, deteksi pola pelanggaran 3x bekerja deterministik, dan opsi intervensi HRGA tersedia.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tampilan Compliance Queue dengan filter pola pelanggaran kritis.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 7: PENGELOLAAN CUTI & REKONSILIASI OTOMATIS

---

### TC-LEAV-001: Pengajuan Cuti Tahunan Mandiri oleh Karyawan
- **Test Case ID:** `TC-LEAV-001`
- **Scenario ID:** `SCN-LEAV-01`
- **Requirement ID:** `FR-45`, `FR-48`
- **Judul:** Pengajuan Cuti Tahunan Mandiri & Pengecekan Kuota Hak Cuti
- **Tujuan:** Memvalidasi bahwa karyawan dapat mengajukan cuti tahunan dengan rentang tanggal tertentu, sistem memverifikasi kecukupan kuota cuti yang tersisa, dan pengajuan masuk ke antrean persetujuan atasan.
- **Modul / Halaman:** My Leave Request (`/leave/my`)
- **Kategori Pengujian:** Happy Path / Boundary Value
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Pengajuan cuti yang macet mengganggu hak ketenagakerjaan dan perencanaan beban kerja tim.
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Sisa kuota cuti tahunan >= 2 hari.
- **Test Data ID:** `TD-LEAV-01`
- **Persiapan Sebelum Tes:** Buka `/leave/my`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Pengajuan Cuti Saya" via sidebar.
   - **Lokasi:** `/leave/my`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman menampilkan widget informasi: Sisa Kuota Cuti Tahunan (cth: `12 Hari`), Riwayat Cuti Lalu, dan Formulir Pengajuan Cuti Baru.
   - **Verifikasi:** Sisa kuota cuti bernilai positif dan form siap diisi.
2. **Langkah 2**
   - **Aksi:** Pilih Jenis Cuti: `Cuti Tahunan`, tentukan Tanggal Mulai dan Tanggal Selesai (rentang 2 hari kerja), dan tuliskan alasan permohonan.
   - **Lokasi:** Formulir pengajuan cuti.
   - **Data:** Jenis: `Cuti Tahunan`, Mulai: `Besok`, Selesai: `Lusa`, Alasan: `Keperluan keluarga dan renovasi rumah tinggal di luar kota`.
   - **Hasil yang diharapkan:** Sistem menghitung total hari kerja yang diajukan (2 Hari Kerja) dan memverifikasi kuota mencukupi.
   - **Verifikasi:** Teks ringkasan menampilkan: "Total pengajuan: 2 Hari Kerja. Kuota tersisa setelah cuti: 10 Hari".
3. **Langkah 3**
   - **Aksi:** Klik tombol "Kirim Pengajuan Cuti".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast sukses muncul "Pengajuan cuti berhasil dikirim". Permohonan tercatat di tabel riwayat cuti pribadi dengan status kuning `PENDING (Menunggu Persetujuan Atasan)`.
   - **Verifikasi:** Data tampil di daftar cuti aktif.

- **Expected Final Result:** Pengajuan cuti tersimpan berstatus PENDING, kalkulasi durasi hari kerja tepat, dan notifikasi terkirim ke atasan langsung.
- **Bukti yang Perlu Dikumpulkan:** Screenshot riwayat cuti mandiri dengan status PENDING dan sisa kuota.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-LEAV-003: Rekonsiliasi Cuti Otomatis Pasca Cut-Off (Superseded by Leave)
- **Test Case ID:** `TC-LEAV-003`
- **Scenario ID:** `SCN-LEAV-03`
- **Requirement ID:** `FR-47`, `DEC-008`
- **Judul:** Rekonsiliasi Cuti Otomatis Pasca Cut-Off (DEC-008 Superseded by Approved Leave)
- **Tujuan:** Memvalidasi aturan arsitektural DEC-008: karyawan yang memiliki pengajuan cuti resmi yang telah disetujui (Approved) dibebaskan dari kewajiban submit komitmen; sistem otomatis merekonsiliasi status menjadi `Superseded by Approved Leave` sehingga tidak dicatat sebagai pelanggaran kepatuhan.
- **Modul / Halaman:** Compliance Engine & My History (`/daily/history` & `/compliance`)
- **Kategori Pengujian:** Data Integrity / Business Rules Automation
- **Teknik Desain Test Case:** Decision Table & State Transition
- **Role:** Sistem / `HRGA` (`hrga@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Mencegah ketidakadilan data di mana karyawan yang sah sedang cuti disangka melakukan pelanggaran kerja (*false positive non-compliance*).
- **Preconditions:** Terdapat pengajuan cuti yang telah berstatus `APPROVED` untuk seorang karyawan (misal Maya Putri) pada hari ini. Karyawan tersebut tidak membuka sistem dan tidak mengisi komitmen pagi. Jam cut-off pagi telah terlewati.
- **Test Data ID:** `TD-LEAV-01` dan `TD-LEAV-02`
- **Persiapan Sebelum Tes:** Login sebagai HRGA (`hrga@dutamedia.com`).

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Antrean Kepatuhan via sidebar sebagai HRGA.
   - **Lokasi:** `/compliance`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Periksa daftar personil yang berstatus "Tidak Mengisi Komitmen".
   - **Verifikasi:** Karyawan yang cutinya telah disetujui (Maya Putri) **TIDAK MUNCUL** pada daftar pelanggaran kepatuhan (*excluded from non-compliance list*).
2. **Langkah 2**
   - **Aksi:** Login sebagai karyawan bersangkutan atau buka riwayat audit kepatuhan karyawan tersebut.
   - **Lokasi:** Halaman `/daily/history`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Pada kartu tanggal hari ini, status tidak tertulis "No Submission" atau "Pelanggaran", melainkan tersemat badge biru/netral resmi: **Superseded by Approved Leave** (Cuti Disetujui).
   - **Verifikasi:** Status kepatuhan tercatat bersih (Exempted) dan tidak mengurangi skor partisipasi bulanan karyawan.

- **Expected Final Result:** Rekonsiliasi cuti bekerja otomatis sesuai DEC-008, bebas dari false positive penalti, dan status audit log terjaga akurat.
- **Bukti yang Perlu Dikumpulkan:** Screenshot riwayat harian karyawan pada tanggal cuti yang menampilkan status Superseded by Approved Leave.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 8: DASBOR OPERASIONAL, RISIKO PROYEK, & ADMINISTRASI

---

### TC-DASH-001: Pemantauan Dasbor Operasional Tim (Team Pulse) oleh Supervisor
- **Test Case ID:** `TC-DASH-001`
- **Scenario ID:** `SCN-DASH-01`
- **Requirement ID:** `FR-50`, `FR-28`, `FR-36`
- **Judul:** Pemantauan Dasbor Operasional Tim (Team Pulse) oleh Supervisor
- **Tujuan:** Memvalidasi bahwa Supervisor yang login langsung mendarat di `/dashboard` dan disajikan metrik agregat tim: persentase partisipasi komitmen, kartu personil butuh bantuan, komitmen berisiko, dan feed dukungan lintas fungsi.
- **Modul / Halaman:** Pulse Dashboard (`/dashboard`)
- **Kategori Pengujian:** UI/UX / Aggregation & Visualization
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Dasbor operasional adalah pusat komando harian atasan untuk mengidentifikasi macetnya tugas tim.
- **Preconditions:** Login sebagai `lead.tech@dutamedia.com`. Anggota tim (Aditya dan Siti) telah memiliki data komitmen dan blocker di sistem.
- **Test Data ID:** `TD-AUTH-02`
- **Persiapan Sebelum Tes:** Masuk ke `/dashboard`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Dasbor Utama via navigasi.
   - **Lokasi:** `/dashboard`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Tab "Team Pulse" aktif secara default dengan badge peran "Supervisor". Di sudut kanan atas tertera indikator lingkup aktif: "TEAM (Divisi Engineering)".
   - **Verifikasi:** Header dan layout dashboard sesuai prototipe HTML 07.
2. **Langkah 2**
   - **Aksi:** Amati 4 kartu metrik operasional teratas.
   - **Lokasi:** Baris KPI ringkasan.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Menampilkan 4 kartu statistik:
     1. Belum Mengisi Komitmen (Jumlah & % Partisipasi)
     2. Komitmen Waspada (Kuning / Amber)
     3. Komitmen Kritis (Merah)
     4. Blocker Belum Direspon (dengan link "Buka Antrean Blocker")
   - **Verifikasi:** Nilai numerik pada kartu mencerminkan kondisi riil database seeder.
3. **Langkah 3**
   - **Aksi:** Periksa widget "Personil Butuh Bantuan Hari Ini".
   - **Lokasi:** Kolom kiri dashboard.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Daftar personil tim yang memiliki blocker kritis atau komitmen berisiko tampil dengan tombol aksi "Bantu" atau "Catat".
   - **Verifikasi:** Kartu Budi Pratama / Aditya Nugroho dengan blocker Redis/Staging tampil dengan badge Blocker Kritis.
4. **Langkah 4**
   - **Aksi:** Periksa widget "Feed Dukungan Lintas Fungsi".
   - **Lokasi:** Kolom kanan dashboard.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Menampilkan timeline catatan bantuan rekan kerja atau status kosong yang ramah jika belum ada interaksi hari ini.
   - **Verifikasi:** Widget ter-render rapi tanpa overflow horizontal.

- **Expected Final Result:** Dasbor Team Pulse menyajikan visibilitas operasional 360 derajat kondisi tim tanpa cacat visual.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman penuh Dashboard Team Pulse.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-ADMN-002: Konfigurasi Kebijakan Operasional Sistem (Policy Settings)
- **Test Case ID:** `TC-ADMN-002`
- **Scenario ID:** `SCN-ADMN-02`
- **Requirement ID:** `FR-55`
- **Judul:** Konfigurasi Kebijakan Operasional Sistem (Cut-Off, Grace Period, & SLA)
- **Tujuan:** Memvalidasi bahwa System Administrator dapat memperbarui parameter kebijakan operasional (jam cut-off pagi, cut-off sore, durasi grace period, dan SLA blocker) dan perubahannya berlaku sistemik.
- **Modul / Halaman:** Policy Settings (`/admin/policies`)
- **Kategori Pengujian:** Administration / Configuration Persistence
- **Teknik Desain Test Case:** Boundary Value & Persistence
- **Role:** `SYSTEM_ADMIN` (`admin@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Kesalahan penyimpanan konfigurasi kebijakan dapat mengunci seluruh karyawan di luar jam kerja yang semestinya.
- **Preconditions:** Login sebagai `admin@dutamedia.com`.
- **Test Data ID:** `TD-AUTH-04`
- **Persiapan Sebelum Tes:** Buka `/admin/policies`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Kebijakan Operasional" via sidebar grup *Administration*.
   - **Lokasi:** `/admin/policies`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman menampilkan daftar konfigurasi kebijakan aktif: Jam Cut-off Pagi (09:00 WIB), Grace Period Pagi (30 Menit), Jam Cut-off Sore (17:30 WIB), Grace Period Sore (30 Menit), SLA Blocker Kritis (2 Jam), dan Ambang Pelanggaran (3x).
   - **Verifikasi:** Seluruh parameter nilai tampil pada form konfigurasi.
2. **Langkah 2**
   - **Aksi:** Ubah salah satu parameter simulasi (cth: ubah Grace Period Pagi dari 30 menit menjadi 45 menit) lalu klik tombol "Simpan Kebijakan".
   - **Lokasi:** Form pengaturan kebijakan.
   - **Data:** Grace Period: `45 Menit`.
   - **Hasil yang diharapkan:** Muncul dialog konfirmasi perubahan kebijakan sistem. Setelah dikonfirmasi, toast sukses muncul "Konfigurasi kebijakan berhasil diperbarui".
   - **Verifikasi:** Nilai form berubah menjadi 45 menit.
3. **Langkah 3**
   - **Aksi:** Muat ulang halaman browser (F5) untuk memverifikasi persistensi data basis data.
   - **Lokasi:** Tombol refresh browser.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman termuat kembali dengan nilai Grace Period tetap 45 menit (tersimpan di database PostgreSQL).
   - **Verifikasi:** Nilai persisten, tidak kembali ke default 30 menit.
4. **Langkah 4 (Cleanup)**
   - **Aksi:** Kembalikan nilai Grace Period ke standar semula (30 Menit) dan simpan kembali.
   - **Lokasi:** Form pengaturan kebijakan.
   - **Data:** Grace Period: `30 Menit`.
   - **Hasil yang diharapkan:** Konfigurasi kembali ke standar baku Dutamedia.
   - **Verifikasi:** Nilai kembali 30 menit.

- **Expected Final Result:** Administrator dapat mengontrol parameter kebijakan operasional secara dinamis dan tersimpan persisten di basis data.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Policy Settings setelah penyimpanan data baru.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 9: SKENARIO PENGUJIAN END-TO-END (E2E JOURNEY)

---

### TC-E2E-001: Perjalanan Pengguna Siklus Harian Karyawan (Pagi -> Ad-Hoc -> Sore)
- **Test Case ID:** `TC-E2E-001`
- **Scenario ID:** `SCN-E2E-01`
- **Requirement ID:** `FR-09`, `FR-17`, `FR-21`, `FR-50`, `DEC-001`
- **Judul:** Siklus Harian Utuh Karyawan: Komitmen Pagi -> Tugas Tambahan -> Evaluasi EOD Sore -> Tinjauan Supervisor
- **Tujuan:** Memvalidasi kelancaran seluruh rantai proses bisnis harian seorang karyawan dari pagi hingga sore dan memastikan datanya tercermin secara real-time pada dasbor supervisor.
- **Modul / Halaman:** Lintas Modul (`/daily/morning` -> `/daily/additional-work` -> `/daily/eod` -> `/dashboard`)
- **Kategori Pengujian:** End-to-End User Journey / Cross-Module Integration
- **Teknik Desain Test Case:** Use Case Testing
- **Role:** Multi-Aktor (`EMPLOYEE` dilanjutkan `SUPERVISOR`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Membuktikan bahwa seluruh modul harian terhubung secara mulus tanpa data terputus di tengah jalan.
- **Preconditions:** Akun Employee (`dev.frontend@dutamedia.com`) dan Supervisor (`lead.tech@dutamedia.com`) siap digunakan.
- **Test Data ID:** `TD-AUTH-01`, `TD-DLYM-01`, `TD-DLYA-01`, `TD-DLYE-01`
- **Persiapan Sebelum Tes:** Mulai dengan login sebagai Employee.

**Langkah Pengujian:**
1. **Langkah 1 (Fase Pagi)**
   - **Aksi:** Login sebagai Employee (`dev.frontend@dutamedia.com`). Isi 2 komitmen pagi dan submit tepat waktu.
   - **Lokasi:** `/daily/morning`.
   - **Data:** Item 1: `Slicing prototipe UI 1:1`; Item 2: `Integrasi API Auth`.
   - **Hasil yang diharapkan:** Komitmen tersimpan On-Time.
   - **Verifikasi:** Ringkasan komitmen pagi tampil rapi.
2. **Langkah 2 (Fase Siang - Ad-Hoc)**
   - **Aksi:** Buka `/daily/additional-work`, catat 1 tugas mendesak dari Tech Lead.
   - **Lokasi:** `/daily/additional-work`.
   - **Data:** Judul: `Meeting darurat arsitektur database`, Instruksi: `Bambang Pratama`.
   - **Hasil yang diharapkan:** Tugas ad-hoc tersimpan dan masuk antrean kerja hari ini.
   - **Verifikasi:** Tugas ad-hoc tertera di daftar tugas aktif.
3. **Langkah 3 (Fase Sore - Evaluasi EOD)**
   - **Aksi:** Buka `/daily/eod`. Laporkan status: Item 1 (`Done`), Item 2 (`Done`), Item Ad-Hoc (`Done`). Tulis refleksi diri dan kirim laporan EOD.
   - **Lokasi:** `/daily/eod`.
   - **Data:** Semua Done. Status mandiri: Hijau.
   - **Hasil yang diharapkan:** Laporan EOD tersimpan sukses. Status harian karyawan berstatus On-Time dan Hijau.
   - **Verifikasi:** Ringkasan akhir harian tampil tuntas 100%.
4. **Langkah 4 (Fase Supervisi)**
   - **Aksi:** Logout dari akun Employee, lalu login sebagai Supervisor (`lead.tech@dutamedia.com`). Buka `/dashboard`.
   - **Lokasi:** `/dashboard`.
   - **Data:** Login `lead.tech@dutamedia.com` / `Password123!`.
   - **Hasil yang diharapkan:** Pada dasbor Team Pulse, metrik partisipasi bertambah, dan pada daftar komitmen tim, nama "Aditya Nugroho" tampil dengan status tuntas (Hijau) tanpa ada peringatan blocker.
   - **Verifikasi:** Supervisor melihat hasil kerja bawahan secara transparan dan akurat.

- **Expected Final Result:** Rantai siklus kerja harian 100% terintegrasi tanpa putus dari input pagi hingga tinjauan atasan sore hari.
- **Bukti yang Perlu Dikumpulkan:** Screenshot ringkasan EOD Employee dan screenshot dasbor Team Pulse Supervisor yang mencatat capaian bawahan.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-E2E-002: Siklus Blocker: Pelaporan -> SLA Escalation -> Resolusi
- **Test Case ID:** `TC-E2E-002`
- **Scenario ID:** `SCN-E2E-02`
- **Requirement ID:** `FR-29`, `FR-31`, `FR-32`, `FR-33`, `FR-34`, `DEC-007`
- **Judul:** Perjalanan Hambatan Kritis: Pelaporan oleh Karyawan -> Tinjauan Atasan -> Resolusi Tuntas
- **Tujuan:** Memvalidasi siklus hidup blocker dari pelaporan awal, masuknya ke antrean atasan dengan penghitung waktu SLA mundur, intervensi atasan, hingga penutupan resmi dengan catatan solusi teknis.
- **Modul / Halaman:** Lintas Modul (`/blockers/raise` -> `/blockers` -> `/blockers/aging`)
- **Kategori Pengujian:** End-to-End User Journey / State Transition
- **Teknik Desain Test Case:** Use Case Testing & State Transition
- **Role:** Multi-Aktor (`EMPLOYEE` dilanjutkan `SUPERVISOR`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Memastikan sistem eskalasi blocker benar-benar mampu mencegah keterlambatan penyelesaian hambatan teknis tim.
- **Preconditions:** Akun Employee dan Supervisor aktif.
- **Test Data ID:** `TD-BLKR-01` dan `TD-BLKR-03`
- **Persiapan Sebelum Tes:** Login sebagai Employee.

**Langkah Pengujian:**
1. **Langkah 1 (Pelaporan)**
   - **Aksi:** Login sebagai Employee, buka `/blockers/raise`. Buat laporan kendala kritis terkait akses jaringan API server.
   - **Lokasi:** `/blockers/raise`.
   - **Data:** Judul: `API Server Gateway Network Unreachable`, Severity: `KRITIS`, Dampak: `TEAM_BLOCKED`.
   - **Hasil yang diharapkan:** Blocker tersimpan berstatus `OPEN` dengan target SLA respons 2 jam.
   - **Verifikasi:** Muncul di antrean blocker pribadi.
2. **Langkah 2 (Intervensi Atasan)**
   - **Aksi:** Logout, lalu login sebagai Supervisor (`lead.tech@dutamedia.com`). Buka `/blockers`.
   - **Lokasi:** `/blockers`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Blocker jaringan kritis tampil di posisi teratas antrean tim. Supervisor klik "Respons / Bantu" dan memberikan catatan intervensi.
   - **Verifikasi:** Status blocker bertransisi menjadi `ACKNOWLEDGED`.
3. **Langkah 3 (Penyelesaian Tuntas)**
   - **Aksi:** Setelah perbaikan simulasi selesai, klik "Tandai Selesai (Resolve)". Masukkan deskripsi solusi minimal 10 karakter.
   - **Lokasi:** Modal penyelesaian blocker di `/blockers`.
   - **Data:** `Gateway network route telah di-reroute ke redundant subnet dan failover sukses.`
   - **Hasil yang diharapkan:** Status blocker bertransisi menjadi `RESOLVED`.
   - **Verifikasi:** Blocker ditutup dan tercatat di riwayat selesai.
4. **Langkah 4 (Verifikasi Karyawan)**
   - **Aksi:** Logout dan login kembali sebagai Employee. Buka riwayat blocker pribadi.
   - **Lokasi:** `/blockers`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Karyawan melihat blocker yang dilaporkannya telah berstatus `RESOLVED` lengkap dengan deskripsi solusi dari Tech Lead.
   - **Verifikasi:** Karyawan mendapatkan kepastian bahwa hambatannya telah diselesaikan oleh pimpinan.

- **Expected Final Result:** Alur eskalasi dan resolusi hambatan berjalan mulus, kolaboratif, dan terdokumentasi rapi.
- **Bukti yang Perlu Dikumpulkan:** Screenshot kartu blocker berstatus RESOLVED lengkap dengan riwayat intervensi atasan.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 
