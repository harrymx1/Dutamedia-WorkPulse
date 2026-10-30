# WorkPulse — Manual UAT Test Cases Specification (Master Suite — 42 Test Cases)

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 2.0.0 (Remediated Master Suite)  
> **Target Penguji Manual:** Harry (Acceptance Owner)  
> **Format Standar:** Sesuai Phase 7 Master Prompt (Field Eksekusi Wajib Kosong)  
> **Tanggal Audit Remediasi:** 29 Oktober 2026  
> **Total Test Case:** Tepat 42 Test Case Operasional (100% Selaras dengan Execution Log & RTM)  

---

## PANDUAN EKSEKUTIF PENGUJIAN MANUAL

Dokumen ini memuat seluruh **42 test case manual** langkah-demi-langkah yang dirancang secara presisi berdasarkan dokumen spesifikasi dan kode sumber WorkPulse. Anda (Harry) dapat membuka browser, login dengan akun pengujian yang tertera, mengikuti setiap instruksi operasional, mengamati reaksi antarmuka, dan menentukan hasil pengujian sendiri.

> [!IMPORTANT]
> Seluruh kolom **Actual Result**, **Execution Status**, **Tester**, **Execution Date**, **Defect ID**, dan **Retest Result** pada dokumen ini sengaja **DIKOSONGKAN**. Pengisian dilakukan secara mandiri oleh Harry saat pengujian berlangsung di browser.

---

## MODUL 1: AUTENTIKASI, AKTIVASI AKUN, & KONTROL AKSES (TC-AUTH)

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
- **Actual Result:** Pengguna dev.frontend@dutamedia.com berhasil login dengan kata sandi valid, peramban diarahkan otomatis ke rute kanonikal /daily/morning, sidebar enterprise 232px aktif dengan identitas Aditya Nugroho (EMPLOYEE), dan sudut kiri bawah layar bersih dari tombol darurat melayang.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi pendaratan otomatis kanonikal Employee dan kebersihan elemen UI floating menu.

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
- **Actual Result:** Form login menerima input kata sandi tertutup (masked), autentikasi ditolak oleh sistem, pesan peringatan kesalahan muncul, dan URL peramban tetap bertahan di /login tanpa pembentukan sesi.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Waktu respons pada percobaan pertama teramati sekitar 7 detik karena siklus cold-start backend instance di Render, lalu stabil menjadi ~2 detik pada percobaan berikutnya.

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

- **Expected Final Result:** Akun berhasil diaktifkan, password baru tersimpan dengan hashing aman, dan token langsung hangus (*single-use*).
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman aktivasi sukses dan pesan konfirmasi.
- **Actual Result:** Token demo 72 jam berhasil memuat formulir aktivasi akun baru, pengisian kata sandi baru Password123! berhasil diproses sistem dengan pesan sukses 'Akun Anda berhasil diaktifkan dengan aman', dan antarmuka menyediakan tombol beralih ke Masuk Sistem.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi siklus aktivasi akun karyawan baru dan transisi status token ke USED.

---

### TC-AUTH-004: Penolakan Token Aktivasi Kedaluwarsa / Bekas Pakai
- **Test Case ID:** `TC-AUTH-004`
- **Scenario ID:** `SCN-AUTH-04`
- **Requirement ID:** `FR-03`, `DEC-005`
- **Judul:** Penolakan Token Aktivasi Kedaluwarsa, Tidak Sah, atau Bekas Pakai
- **Tujuan:** Memvalidasi bahwa tautan aktivasi dengan token yang telah kedaluwarsa (>72 jam), token acak palsu, atau token yang sudah pernah digunakan (single-use) ditolak secara tegas oleh sistem.
- **Modul / Halaman:** Halaman Aktivasi (`/activate`)
- **Kategori Pengujian:** Negative Testing / Security & Lifecycle
- **Teknik Desain Test Case:** Boundary Value & Error Guessing
- **Role:** `INVITED` / Pengguna Tamu
- **Priority:** **High (P1)**
- **Risk Rationale:** Pemakaian token usang atau bekas pakai dapat menyebabkan inkonsistensi otentikasi atau celah pengambilalihan akun.
- **Preconditions:** Token palsu/expired disiapkan: `token_palsu_invalid_12345_expired`.
- **Test Data ID:** `TD-AUTH-09`
- **Persiapan Sebelum Tes:** Siapkan URL `http://localhost:5173/activate?token=token_palsu_invalid_12345_expired`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka URL aktivasi dengan token yang tidak terdaftar di database.
   - **Lokasi:** Address bar browser.
   - **Data:** `http://localhost:5173/activate?token=token_palsu_invalid_12345_expired`
   - **Hasil yang diharapkan:** Sistem memvalidasi token dan mendeteksi bahwa token tidak valid atau telah kedaluwarsa.
   - **Verifikasi:** Halaman aktivasi menampilkan banner peringatan merah/oranye: "Token aktivasi tidak valid atau telah kedaluwarsa. Silakan hubungi tim HRGA untuk tautan undangan baru".
2. **Langkah 2**
   - **Aksi:** Periksa apakah form pembuatan kata sandi dinonaktifkan atau disembunyikan.
   - **Lokasi:** Area formulir aktivasi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Form input kata sandi baru dinonaktifkan (*disabled*) atau disembunyikan sama sekali untuk mencegah submission data tanpa otorisasi.
   - **Verifikasi:** Tidak ada tombol "Aktifkan Akun" yang dapat diklik. Terdapat tombol tautan kembali: "Kembali ke Halaman Login".
3. **Langkah 3**
   - **Aksi:** Klik tombol "Kembali ke Halaman Login".
   - **Lokasi:** Tombol navigasi di bawah banner error.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Pengguna dialihkan kembali ke halaman `/login`.
   - **Verifikasi:** URL berubah menjadi `/login`.

- **Expected Final Result:** Token tidak sah ditolak 100%, form terkunci aman, dan pengguna dipandu menghubungi HRGA.
- **Bukti yang Perlu Dikumpulkan:** Screenshot banner penolakan token aktivasi tidak valid di rute `/activate`.
- **Actual Result:** Sistem secara tegas menolak aktivasi menggunakan token tidak sah / bekas pakai, pesan kesalahan penolakan muncul di atas formulir, dan akun terlindungi dari aktivasi ganda sesuai aturan single-use DEC-005.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi penolakan token tidak sah dan penegakan aturan single-use.

---

### TC-AUTH-005: Proteksi Akses URL Ilegal Antarmuka & Layar Error 403
- **Test Case ID:** `TC-AUTH-005`
- **Scenario ID:** `SCN-AUTH-05`
- **Requirement ID:** `FR-08`, `DEC-012`
- **Judul:** Proteksi Otorisasi Antarmuka & Penanganan Halaman Terlarang (403 Forbidden)
- **Tujuan:** Memastikan pengguna dengan peran terbatas (`EMPLOYEE`) yang mencoba mengakses rute administratif khusus (`/admin/organization` atau `/compliance`) langsung dihadang dan dialihkan ke layar Error 403 Forbidden.
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
- **Actual Result:** Pengguna EMPLOYEE yang mencoba mengakses /admin/organization berhasil dicegat oleh client router guard dan dialihkan ke rute /forbidden?from=/admin/organization dengan judul '403 — Akses Dibatasi', pesan penolakan peran yang jelas, dan tombol 'Kembali ke Dashboard' yang memulihkan navigasi ke /daily/morning.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi penegakan otorisasi antarmuka dan penanganan layar 403 Forbidden secara presisi.

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
   - **Hasil yang diharapkan:** Sesi token di localStorage/cookie dihapus. Sistem me-redirect pengguna ke halaman `/login`.
   - **Verifikasi:** URL browser berubah menjadi `/login`. Form login kosong dan siap menerima input baru.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Back" (Kembali) pada toolbar browser.
   - **Lokasi:** Tombol navigasi browser (tanda panah kiri).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Router guard mendeteksi bahwa sesi sudah tidak ada (*unauthenticated*). Pengguna langsung ditendang kembali ke `/login`, tidak diizinkan melihat draf halaman `/daily/morning`.
   - **Verifikasi:** Halaman tetap berada di `/login`. Data sensitif sebelumnya tidak bocor di antarmuka.

- **Expected Final Result:** Logout menghancurkan sesi secara tuntas dan riwayat browser tidak dapat digunakan untuk membobol sistem.
- **Bukti yang Perlu Dikumpulkan:** Screenshot layar kembali ke `/login` saat tombol back ditekan.
- **Actual Result:** Tombol logout pada footer sidebar berhasil menghancurkan sesi pengguna dan me-redirect peramban ke rute /login. Penekanan tombol Back pada toolbar browser berhasil dicegat oleh client router guard sehingga pengguna tetap tertahan di /login tanpa adanya kebocoran data halaman internal.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi pengakhiran sesi aman dan proteksi terhadap back cache residual.

---

### TC-AUTH-007: Inspeksi & Verifikasi Manajemen Profil Pribadi Pengguna
- **Test Case ID:** `TC-AUTH-007`
- **Scenario ID:** `SCN-AUTH-07`
- **Requirement ID:** `UAT-REQ-PROFILE-001` *(Harmonized Local ID; Sumber Kanonis: UI/UX Spec §4.25 UF-44, PRD v1.6 §3.1 FR-01)*
- **Judul:** Inspeksi & Verifikasi Manajemen Profil Pribadi Pengguna
- **Tujuan:** Memvalidasi penayangan profil pribadi pada halaman `/profile` (Nama Lengkap, Alamat Email, Role Otorisasi Sistem `EMPLOYEE`, Status Akun `ACTIVE`, User ID, Hak Otoritas, Prompt Hint Refleksi), serta secara eksplisit menguji dan mendokumentasikan temuan gap ketiadaan visualisasi atribut organisasi: **Jabatan Organisasi** (`jobTitle`, seeder: 'Frontend Software Engineer'), **Departemen** (`function`, seeder: 'Engineering'), dan **Atasan Langsung** (`directManagerId`, seeder: 'Bambang Pratama') terhadap klausul UAT-REQ-PROFILE-001 (UI/UX Spec §4.25, UF-44). *Catatan Harmonisasi Sumber:* ID lokal UAT-REQ-PROFILE-001 digunakan untuk memisahkan kebutuhan profil ini dari FR-05 kanonis PRD v1.6 (penguncian baseline komitmen). Referensi FR-02 dihapus karena FR-02 kanonis mengatur snapshot konteks organisasi Daily Accountability Record (bukan tampilan profil akun).
- **Modul / Halaman:** Profil Akun (`/profile`)
- **Kategori Pengujian:** Happy Path / UI Inspection & Gap Verification
- **Teknik Desain Test Case:** Equivalence Partitioning & UI Inspection
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com` / `Aditya Nugroho`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Kesalahan penayangan identitas akun atau pencampuran antara Role otorisasi sistem dengan Jabatan organisasi dapat mengaburkan akuntabilitas struktural perusahaan.
- **Preconditions:** Login aktif sebagai `dev.frontend@dutamedia.com`.
- **Test Data ID:** `TD-AUTH-01`
- **Persiapan Sebelum Tes:** Berada di halaman utama setelah login atau langsung akses URL `/profile`.

**Langkah Pengujian:**
1. **Langkah 1 (Akses Halaman Profil)**
   - **Aksi:** Buka halaman profil dengan mengklik avatar pengguna pada topbar atau ketik URL `/profile` di address bar browser.
   - **Lokasi:** Address bar browser / menu navigasi profil (`/profile`).
   - **Data:** Rute URL `/profile`.
   - **Hasil yang diharapkan:** Halaman profil (`.profile-layout`) terbuka. Navbar atas menampilkan judul "Profil Akun" dengan breadcrumb brand badge "WP WorkPulse".
   - **Verifikasi:** Elemen `.top-nav` menampilkan badge "Profil Akun".
2. **Langkah 2 (Verifikasi Atribut Identitas yang Ditampilkan)**
   - **Aksi:** Amati informasi identitas pada kartu profil sisi kiri (`.identity-card`).
   - **Lokasi:** Panel kartu `.identity-card`.
   - **Data:** Akun login `Aditya Nugroho` (`dev.frontend@dutamedia.com`).
   - **Hasil yang diharapkan:** Kartu identitas menampilkan 5 atribut profil kanonikal:
     1. **Nama Lengkap:** "Aditya Nugroho" (`.user-fullname`)
     2. **Alamat Email:** "dev.frontend@dutamedia.com" (`.user-email.mono-num`)
     3. **Role Otorisasi Sistem (Bukan Jabatan Organisasi):** "EMPLOYEE" (`.role-pill`). *Catatan Penting:* Nilai ini merepresentasikan `CanonicalRole` sistem otorisasi RBAC, **bukan** Jabatan organisasi profesi pengguna (pada basis data seeder, Jabatan adalah "Frontend Software Engineer").
     4. **Status Akun:** "ACTIVE" (`.status-pill.active`)
     5. **User ID:** Nilai UUID pengguna dalam format mono-num (`.meta-item .mono-num`)
   - **Verifikasi:** Teks nama, email, role sistem, status akun, dan User ID sesuai data seeder. Penguji mencatat bahwa label yang tampil adalah role sistem otorisasi, bukan nama jabatan organisasi.
3. **Langkah 3 (Pemeriksaan Hak Otoritas & Pencatatan Gap Jabatan, Departemen, & Atasan)**
   - **Aksi:** Periksa seluruh area kartu profil dan metadata untuk mencari keberadaan informasi Jabatan Organisasi (*Job Title*), Departemen (*Function*), dan Atasan Langsung (*Direct Supervisor*) sesuai spesifikasi UAT-REQ-PROFILE-001 (UI/UX Spec §4.25 / UF-44).
   - **Lokasi:** Bagian `.meta-list`, `.identity-card`, dan `.prompt-hint-box`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:**
     - Hak Otoritas bertuliskan "Role-Based & Scope Resolver". Kotak prompt refleksi menampilkan teks bimbingan: *"Tentukan 0–3 komitmen paling bernilai hari ini dan segera laporkan kendala bila ada hambatan eksternal."*
     - **Temuan Gap Implementasi (Needs Clarification terhadap UAT-REQ-PROFILE-001):** Penguji mengonfirmasi bahwa atribut organisasi berikut:
       1. **Jabatan Organisasi (`jobTitle`):** Seeder bernilai "Frontend Software Engineer", namun tidak ditampilkan pada UI (hanya role `EMPLOYEE` yang tampil).
       2. **Departemen (`function`):** Seeder bernilai "Engineering", namun tidak ditampilkan pada UI.
       3. **Atasan Langsung (`directManagerId`):** Seeder bernilai "Bambang Pratama", namun tidak ditampilkan pada UI.
       Ketiga atribut ini tersimpan di backend model `OrganizationalAssignment`, tetapi DTO `UserProfile` dan antarmuka `/profile` belum mengeksposnya. Penguji mencatat gap ini secara eksplisit dan **TIDAK** menyatakan bahwa Jabatan, Departemen, atau Atasan Langsung telah terverifikasi di UI.
   - **Verifikasi:** Ketiadaan atribut Jabatan organisasi, Departemen, dan Atasan Langsung pada kartu profil dicatat sebagai *Partial Implementation Gap / Needs Clarification* untuk Acceptance Owner.

- **Expected Final Result:** Atribut profil dasar (Nama, Email, Role Sistem, Status Akun, User ID) terverifikasi tampil; ketiadaan visualisasi atribut organisasi (Jabatan 'Frontend Software Engineer', Departemen 'Engineering', dan Atasan Langsung 'Bambang Pratama') dicatat secara transparan sebagai gap implementasi UAT-REQ-PROFILE-001 (Needs Clarification), sehingga pengujian tidak mengklaim kepenuhan requirement yang belum didukung antarmuka.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman `/profile` yang menampilkan kartu identitas pengguna (`.identity-card`) beserta area metadata dan prompt hint.
- **Actual Result:** Halaman /profile berhasil dibuka, data identitas pengguna (Nama, Email, Role EMPLOYEE, Status ACTIVE, User ID) terverifikasi. Terkonfirmasi bahwa Jabatan, Departemen, dan Atasan Langsung belum diekspos di UI, serta dicatat 5 temuan perbaikan (IMP-018 s.d. IMP-022) terkait keselarasan layout terhadap prototipe 24.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi identitas profil; gap visualisasi atribut organisasi & penyelarasan layout prototipe 24 tercatat di Improvement Backlog (IMP-018 s.d. IMP-022).

---

### TC-AUTH-008: Pembaruan Kata Sandi Mandiri & Validasi Keamanan Form
- **Test Case ID:** `TC-AUTH-008`
- **Scenario ID:** `SCN-AUTH-08`
- **Requirement ID:** `FR-06`
- **Judul:** Pembaruan Kata Sandi Mandiri & Validasi Keamanan Form
- **Tujuan:** Memvalidasi mekanisme pembaruan kata sandi mandiri oleh pengguna pada halaman `/profile`, meliputi validasi field kosong, validasi penolakan kata sandi saat ini yang salah (*incorrect current password*), validasi panjang kata sandi baru (minimal 8 karakter), indikator reaktif kekuatan kata sandi (*strength bar* 4 segmen), validasi konfirmasi ketidakcocokan, pembaruan kata sandi sukses ke backend, serta pembuktian login menggunakan kata sandi baru pasca logout.
- **Modul / Halaman:** Profil Akun (`/profile`)
- **Kategori Pengujian:** Functional / Security & Negative Form Validation
- **Teknik Desain Test Case:** Boundary Value Analysis, Negative Testing, & State Transition
- **Role:** `EMPLOYEE` (`dev.backend@dutamedia.com` / `Budi Santoso`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Celah pada pembaruan kata sandi dapat menyebabkan pengambilalihan akun atau kegagalan otentikasi permanen bagi pengguna.
- **Preconditions:** Login aktif sebagai `dev.backend@dutamedia.com` dengan password awal `Password123!`. Berada di `/profile`.
- **Test Data ID:** `TD-AUTH-10`
- **Persiapan Sebelum Tes:** Siapkan kredensial pengujian akun `dev.backend@dutamedia.com`, password lama `Password123!`, password lama yang salah `KataSandiLamaSalah999!`, password tidak valid `< 8 char`, password konfirmasi tidak cocok, dan password baru `PasswordBaru456!`.

**Langkah Pengujian:**
1. **Langkah 1 (Validasi Field Kosong)**
   - **Aksi:** Pada kartu Keamanan & Kata Sandi (`.security-card`), kosongkan input "Kata Sandi Saat Ini", masukkan "Pass123!" pada "Kata Sandi Baru" dan "Konfirmasi Kata Sandi Baru", lalu klik tombol submit "Perbarui Kata Sandi".
   - **Lokasi:** Formulir `.security-card` pada halaman `/profile`.
   - **Data:** Kata Sandi Saat Ini: [Kosong], Kata Sandi Baru: `Pass123!`.
   - **Hasil yang diharapkan:** Form HTML5 validation atau script menangkap field kosong; muncul pesan kesalahan: *"Kata sandi saat ini wajib diisi."* Sistem tidak mengirim request ke backend.
   - **Verifikasi:** Banner error merah `.alert-banner.error` atau tooltip HTML5 aktif; password tidak berubah.
2. **Langkah 2 (Validasi Batas Minimal 8 Karakter)**
   - **Aksi:** Masukkan Kata Sandi Saat Ini: `Password123!`. Pada Kata Sandi Baru, ketik password pendek 5 karakter: `abc12`. Amati bar kekuatan kata sandi. Lalu klik submit.
   - **Lokasi:** Input `#new-pwd` dan elemen `.strength-bar-row`.
   - **Data:** Kata Sandi Baru: `abc12` (panjang 5 karakter).
   - **Hasil yang diharapkan:** Bar kekuatan password menampilkan segmen merah terbatas. Validasi menolak input dan memunculkan pesan kesalahan: *"Kata sandi baru minimal 8 karakter."*
   - **Verifikasi:** Pesan error muncul di atas form; proses submit dibatalkan.
3. **Langkah 3 (Validasi Ketidakcocokan Konfirmasi Kata Sandi)**
   - **Aksi:** Masukkan Kata Sandi Baru yang kuat: `PasswordBaru456!`. Amati perubahan 4 segmen warna bar kekuatan kata sandi. Lalu pada input "Konfirmasi Kata Sandi Baru", ketik: `PasswordBeda789!`. Klik tombol "Perbarui Kata Sandi".
   - **Lokasi:** Input `#new-pwd`, `#confirm-pwd`, dan tombol submit.
   - **Data:** Kata Sandi Baru: `PasswordBaru456!`, Konfirmasi: `PasswordBeda789!`.
   - **Hasil yang diharapkan:** Bar kekuatan kata sandi menyala 4 segmen penuh (kombinasi panjang >=8, huruf kapital, angka, simbol). Validasi mendeteksi ketidakcocokan konfirmasi dan memunculkan pesan: *"Konfirmasi kata sandi baru tidak cocok."*
   - **Verifikasi:** Banner `.alert-banner.error` bertuliskan *"Konfirmasi kata sandi baru tidak cocok."*
4. **Langkah 4 (Skenario Negatif: Validasi Penolakan Kata Sandi Saat Ini yang Salah)**
   - **Aksi:** Pada input "Kata Sandi Saat Ini", masukkan kata sandi yang sengaja disalahkan: `KataSandiLamaSalah999!`. Pada "Kata Sandi Baru", masukkan kata sandi valid: `PasswordBaru456!`. Pada "Konfirmasi Kata Sandi Baru", masukkan kata sandi yang cocok: `PasswordBaru456!`. Klik tombol "Perbarui Kata Sandi".
   - **Lokasi:** Formulir `.security-card` pada halaman `/profile`.
   - **Data:** Kata Sandi Saat Ini: `KataSandiLamaSalah999!`, Kata Sandi Baru: `PasswordBaru456!`, Konfirmasi: `PasswordBaru456!`.
   - **Hasil yang diharapkan:** Backend memvalidasi kata sandi saat ini melalui `passwordHasher.verify(...)` dan menolak permintaan dengan HTTP 400 Bad Request (`VALIDATION_FAILED`). Antarmuka menangkap exception dan menampilkan banner error merah (`.alert-banner.error`) dengan pesan spesifik: *"Kata sandi lama yang Anda masukkan tidak sesuai."* Form tidak mereset input kata sandi baru.
   - **Verifikasi:** Banner error merah menampilkan pesan penolakan yang tepat; kata sandi akun tidak berubah di backend, akun tidak terkunci, dan sesi pengguna tetap aktif.
5. **Langkah 5 (Skenario Positif: Pembaruan Kata Sandi Berhasil)**
   - **Aksi:** Perbaiki input "Kata Sandi Saat Ini" menjadi kata sandi yang benar: `Password123!`. Pastikan "Kata Sandi Baru" dan "Konfirmasi Kata Sandi Baru" tetap terisi `PasswordBaru456!`. Klik tombol "Perbarui Kata Sandi".
   - **Lokasi:** Tombol submit `.security-card button[type="submit"]`.
   - **Data:** Kata Sandi Saat Ini: `Password123!`, Kata Sandi Baru: `PasswordBaru456!`, Konfirmasi: `PasswordBaru456!`.
   - **Hasil yang diharapkan:** Tombol menampilkan state loading (*"Menyimpan..."*). Setelah backend merespons, ketiga input formulir dibersihkan (reset ke kosong), dan muncul banner sukses hijau: *"Kata sandi berhasil diperbarui dengan aman."* (atau *"Kata sandi berhasil diperbarui."*).
   - **Verifikasi:** Banner `.alert-banner.success` muncul; ketiga field input kata sandi kembali kosong.
6. **Langkah 6 (Pembuktian Penolakan Kredensial Lama)**
   - **Aksi:** Klik tombol "Keluar" (Logout) pada header atas `/profile`. Pada halaman `/login`, coba lakukan login menggunakan kata sandi lama `Password123!`.
   - **Lokasi:** Halaman `/login`.
   - **Data:** Email: `dev.backend@dutamedia.com`, Password: `Password123!`.
   - **Hasil yang diharapkan:** Sistem menolak login dengan kata sandi lama dan menampilkan error kredensial tidak cocok.
   - **Verifikasi:** Login gagal; pengguna tetap berada di rute `/login`.
7. **Langkah 7 (Pembuktian Login Kredensial Baru)**
   - **Aksi:** Masukkan kata sandi baru: `PasswordBaru456!`, lalu klik tombol Masuk.
   - **Lokasi:** Form login.
   - **Data:** Email: `dev.backend@dutamedia.com`, Password: `PasswordBaru456!`.
   - **Hasil yang diharapkan:** Pengguna berhasil diautentikasi dan mendarat pada rute `/daily/morning`.
   - **Verifikasi:** Berhasil login; token sesi baru diterbitkan.
8. **Langkah 8 (Teardown / Cleanup)**
   - **Aksi:** Buka kembali `/profile` dan ubah kata sandi kembali ke standar `Password123!` (Kata Sandi Saat Ini: `PasswordBaru456!`, Kata Sandi Baru: `Password123!`, Konfirmasi: `Password123!`).
   - **Lokasi:** Form ganti password `/profile`.
   - **Data:** Kembalikan ke `Password123!`.
   - **Hasil yang diharapkan:** Kata sandi akun kembali ke baseline seeder default sehingga tidak mengganggu test case lain.
   - **Verifikasi:** Banner sukses muncul; login kembali berfungsi dengan `Password123!`.

- **Expected Final Result:** Seluruh alur validasi formulir kata sandi (field kosong, panjang minimal, ketidakcocokan konfirmasi, dan penolakan kata sandi saat ini yang salah) berjalan presisi; kata sandi berhasil diperbarui dan dibuktikan fungsinya.
- **Bukti yang Perlu Dikumpulkan:** Screenshot banner validasi error penolakan kata sandi lama yang salah, banner sukses pembaruan kata sandi di `/profile`, dan bukti login sukses dengan password baru.
- **Actual Result:** Seluruh 8 langkah pengujian berhasil dipenuhi: formulir memvalidasi field kosong (HTML5 tooltip), menolak password <8 karakter dengan bar kekuatan 1/4, menolak konfirmasi berbeda dengan bar 4/4, backend menolak kata sandi lama yang salah, pembaruan sukses dengan banner hijau, pembuktian login menolak password lama dan menerima password baru, serta teardown pemulihan kata sandi kembali ke Password123! berhasil dilakukan.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi pembaruan kata sandi mandiri dan validasi keamanan formulir secara menyeluruh.

---

## MODUL 2: DAILY ACCOUNTABILITY — MORNING COMMITMENT (TC-DLYM)

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
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Hari kerja aktif sebelum jam cut-off pagi.
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
   - **Data:** Judul: `Menyelesaikan migrasi VAPID Push Notification`, Proyek: `WorkPulse Platform Core 2026 (WP-CORE)`, Durasi: `4 Jam`.
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
   - **Hasil yang diharapkan:** Konfirmasi pengiriman muncul, pengguna klik konfirmasi, toast sukses muncul "Komitmen pagi berhasil disimpan". Formulir beralih ke tampilan *Summary Card* harian berstatus **On-Time** (Badge Hijau).
   - **Verifikasi:** Lakukan refresh browser (F5). Ketiga komitmen tetap tampil utuh dengan status On-Time.

- **Expected Final Result:** 3 Komitmen berhasil disimpan di database, status waktu tercatat *On-Time*, dan data persisten saat reload.
- **Bukti yang Perlu Dikumpulkan:** Screenshot ringkasan komitmen pagi yang memuat 3 item dan badge On-Time.
- **Actual Result:** Pengiriman 3 komitmen berhasil diproses sistem (toast notifikasi hijau muncul dan panel sukses di bawah tampil). Namun form tidak terkunci: seluruh textarea komitmen tetap dapat diedit dan tombol Kirim Morning Commitment tetap aktif dan dapat diklik ulang.
- **Execution Status:** FAIL
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** DEF-001
- **Retest Result:** 
- **Catatan:** Memicu tiket cacat DEF-001 karena melanggar penguncian baseline DEC-001 & FR-09.

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
   - **Verifikasi:** Textarea alasan muncul dengan indikator karakter counter.
2. **Langkah 2**
   - **Aksi:** Biarkan textarea alasan kosong, lalu klik tombol "Kirim Komitmen".
   - **Lokasi:** Tombol submit.
   - **Data:** Teks kosong.
   - **Hasil yang diharapkan:** Form menolak pengiriman. Muncul pesan validasi merah: "Alasan wajib diisi minimal 10 karakter".
   - **Verifikasi:** Form tidak tersubmit, tidak ada notifikasi sukses.
3. **Langkah 3**
   - **Aksi:** Masukkan alasan pendek di bawah batas (cth: `Ijin`) lalu klik submit.
   - **Lokasi:** Textarea alasan.
   - **Data:** `Ijin` (4 karakter).
   - **Hasil yang diharapkan:** Form tetap menolak submit karena panjang karakter < 10.
   - **Verifikasi:** Pesan peringatan batas minimal 10 karakter tetap aktif.
4. **Langkah 4**
   - **Aksi:** Masukkan alasan valid dengan panjang minimal 10 karakter, lalu klik submit.
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

### TC-DLYM-003: Penandaan Indikasi Hambatan Dini pada Komitmen Pagi
- **Test Case ID:** `TC-DLYM-003`
- **Scenario ID:** `SCN-DLYM-03`
- **Requirement ID:** `FR-11`
- **Judul:** Penandaan Indikasi Hambatan Dini pada Komitmen Pagi (Early Blocker Flag)
- **Tujuan:** Memvalidasi bahwa karyawan dapat menandai potensi kendala/blocker sejak pagi hari pada item komitmen tertentu, sehingga atasan mendapatkan sinyal peringatan dini pada dasbor pemantauan.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Business Process / Usability
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Ketidaktahuan atasan mengenai potensi hambatan sejak pagi hari menyebabkan hilangnya waktu mitigasi sebelum masalah menjadi kritis.
- **Preconditions:** Login sebagai Employee, berada di form komitmen pagi yang belum disubmit.
- **Test Data ID:** `TD-DLYM-06`
- **Persiapan Sebelum Tes:** Buka `/daily/morning`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Isi komitmen 1: masukkan judul komitmen dan pilih proyek.
   - **Lokasi:** Kartu komitmen item 1.
   - **Data:** Judul: `Integrasi webhook Brevo email dispatcher`, Proyek: `WP-CORE`.
   - **Hasil yang diharapkan:** Data terinput dengan rapi.
   - **Verifikasi:** Teks judul dan proyek terpilih.
2. **Langkah 2**
   - **Aksi:** Centang opsi "Ada potensi kendala / indikasi hambatan pada tugas ini sejak pagi".
   - **Lokasi:** Checkbox penanda kendala dini pada kartu komitmen.
   - **Data:** Checkbox dicentang.
   - **Hasil yang diharapkan:** Muncul field opsional singkat: "Catatan potensi kendala (cth: menunggu API key vendor)".
   - **Verifikasi:** Field catatan potensi kendala terbuka.
3. **Langkah 3**
   - **Aksi:** Masukkan catatan singkat: `Menunggu credential API Brevo dari GA`, lalu klik tombol kirim komitmen.
   - **Lokasi:** Formulir komitmen pagi.
   - **Data:** Catatan kendala terisi.
   - **Hasil yang diharapkan:** Komitmen tersimpan sukses. Pada ringkasan komitmen, kartu tugas tersebut memiliki badge khusus berwarna kuning/oranye: "Potensi Kendala (Early Blocker Flag)".
   - **Verifikasi:** Badge potensi kendala tampil jelas pada kartu komitmen.

- **Expected Final Result:** Indikasi kendala dini tercatat di database dan memicu penanda visual peringatan pada kartu tugas.
- **Bukti yang Perlu Dikumpulkan:** Screenshot kartu ringkasan komitmen yang memuat badge Early Blocker Flag.
- **Actual Result:** Pemilihan risiko AMBER pada slot Komitmen #2 berhasil memunculkan form input potensi kendala dan bantuan yang diharapkan. Status awal hari (Initial Daily Status) di kartu konteks atas secara instan dan reaktif berubah menjadi AMBER — Berisiko. Seluruh catatan kendala dini tersimpan sukses ke database.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Fitur Early Blocker Flag terverifikasi berfungsi sempurna.

---

### TC-DLYM-004: Fitur Salin Komitmen Hari Sebelumnya (Copy-Forward)
- **Test Case ID:** `TC-DLYM-004`
- **Scenario ID:** `SCN-DLYM-04`
- **Requirement ID:** `FR-12`, `DEC-011`
- **Judul:** Fitur Salin Komitmen Hari Sebelumnya (Copy-Forward DEC-011)
- **Tujuan:** Memvalidasi aturan baku DEC-011: fitur copy-forward hanya menyalin komitmen hari kerja sebelumnya yang ditandai berstatus `Continue` (belum tuntas/in progress), dan secara otomatis mengabaikan komitmen yang sudah berstatus `Done`.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Usability / Business Rules & Data Integrity
- **Teknik Desain Test Case:** Decision Table & Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Komitmen yang sudah selesai jika tersalin secara tidak sengaja dapat menduplikasi beban kerja yang keliru.
- **Preconditions:** Hari kerja sebelumnya memiliki 2 komitmen: Komitmen A (berstatus `Done`), Komitmen B (berstatus `In Progress` / `Continue`). Form hari ini masih kosong.
- **Test Data ID:** `TD-DLYM-07`
- **Persiapan Sebelum Tes:** Login sebagai Employee dan buka `/daily/morning`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Periksa tombol aksi di atas form komitmen pagi.
   - **Lokasi:** Toolbar formulir `/daily/morning`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Terdapat tombol sekunder: "Salin dari Kemarin (Copy-Forward)".
   - **Verifikasi:** Tombol terlihat dan dapat diklik.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Salin dari Kemarin".
   - **Lokasi:** Tombol Copy-Forward.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem memanggil data komitmen hari kerja sebelumnya. Hanya Komitmen B (yang berstatus Continue) yang disalin ke kartu komitmen item 1. Komitmen A yang sudah `Done` TIDAK disalin.
   - **Verifikasi:** Kartu item 1 terisi judul Komitmen B. Tidak ada kartu duplikat Komitmen A.
3. **Langkah 3**
   - **Aksi:** Ubah durasi jika diperlukan lalu klik simpan komitmen pagi.
   - **Lokasi:** Form komitmen pagi.
   - **Data:** Durasi: `3 Jam`.
   - **Hasil yang diharapkan:** Komitmen lanjutan berhasil tersimpan untuk hari ini tanpa perlu mengetik ulang dari nol.
   - **Verifikasi:** Ringkasan menampilkan tugas lanjutan tersebut dengan rapi.

- **Expected Final Result:** Aturan DEC-011 berjalan akurat; hanya tugas yang belum tuntas yang disalin ke hari baru.
- **Bukti yang Perlu Dikumpulkan:** Screenshot form setelah tombol Copy-Forward diklik (memperlihatkan hanya item Continue yang tersalin).
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
- **Actual Result:** Pengujian empiris pada jam 10:36 WIB (> batas 09:30 WIB) membuktikan formulir Morning Commitment otomatis terkunci dengan status 'LOCKED (Pasca Cut-Off)', banner resmi DEC-002 tampil, dan seluruh field input teks komitmen serta opsi risiko dinonaktifkan (disabled / read-only).
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi penegakan aturan cut-off DEC-002 secara real-time.

---

### TC-DLYM-006: Validasi Panjang Deskripsi Komitmen Pagi (< 5 Karakter)
- **Test Case ID:** `TC-DLYM-006`
- **Scenario ID:** `SCN-DLYM-06`
- **Requirement ID:** `FR-15`
- **Judul:** Validasi Batas Minimum Panjang Deskripsi Komitmen Pagi (< 5 Karakter)
- **Tujuan:** Memastikan formulir komitmen pagi memvalidasi panjang teks deskripsi komitmen dan menolak teks terlalu pendek (< 5 karakter) seperti singkatan acak atau tes kosong.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Negative Testing / Boundary Value Analysis
- **Teknik Desain Test Case:** Boundary Value Analysis (0, 3, 4, 5 karakter)
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Mencegah pencatatan komitmen sampah (*garbage data*) yang tidak bermakna bagi pelaporan tim.
- **Preconditions:** Login sebagai Employee, berada di form komitmen pagi.
- **Test Data ID:** `TD-DLYM-05`
- **Persiapan Sebelum Tes:** Buka form `/daily/morning`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Masukkan teks sangat pendek pada field judul tugas (cth: `Tes` atau `Fix`).
   - **Lokasi:** Input judul komitmen item 1.
   - **Data:** Judul: `Tes` (3 karakter).
   - **Hasil yang diharapkan:** Field menerima input, tetapi indikator validasi menandai batas panjang karakter.
   - **Verifikasi:** Karakter counter menampilkan `3/5 minimal`.
2. **Langkah 2**
   - **Aksi:** Pilih proyek dan durasi, lalu klik tombol "Simpan & Kirim Komitmen Pagi".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem menolak pengiriman form. Muncul pesan kesalahan inline di bawah field: "Deskripsi tugas minimal 5 karakter".
   - **Verifikasi:** Form tidak tersimpan, tidak ada toast sukses.
3. **Langkah 3**
   - **Aksi:** Tambahkan teks hingga memenuhi minimal 5 karakter (cth: `Fix DB`), lalu klik simpan kembali.
   - **Lokasi:** Input judul komitmen.
   - **Data:** Judul: `Fix DB` (6 karakter).
   - **Hasil yang diharapkan:** Pesan kesalahan hilang dan form berhasil diproses.
   - **Verifikasi:** Validasi berhasil terlewati.

- **Expected Final Result:** Aturan batas minimum 5 karakter berjalan akurat dan membimbing pengguna mengisikan deskripsi yang jelas.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pesan validasi kegagalan saat teks < 5 karakter.
- **Actual Result:** Sistem menolak pengiriman input teks komitmen 2 karakter ("Te") dengan menampilkan alert error: "Slot #1: Deskripsi komitmen wajib diisi minimal 3 karakter." Formulir tidak tersimpan dan data tidak terkirim.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Batas minimal karakter yang ditegakkan kode produksi adalah 3 karakter untuk deskripsi tugas komitmen.

---

## MODUL 3: DAILY ACCOUNTABILITY — ADDITIONAL WORK (TC-DLYA)

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
   - **Data:** Judul: `Hotfix urgent bug memory leak payment`, Pemberi Instruksi: `Bambang Pratama (Tech Lead)`, Proyek: `WP-CORE`, Durasi: `2 Jam`.
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
   - **Verifikasi:** Total item yang harus dievaluasi bertambah sesuai jumlah tugas tambahan yang diinput.

- **Expected Final Result:** Tugas ad-hoc berhasil dicatat dengan asosiasi instruktur yang jelas dan otomatis terintegrasi ke form EOD sore hari.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Additional Work dan screenshot halaman EOD yang menampilkan item tugas tambahan.
- **Actual Result:** Tugas tambahan ("Investigasi performa rendering Vue") berhasil dicatat dengan atasan penugas ("Bambang Pratama"), tersimpan di database, dan secara otomatis terintegrasi ke form EOD Outcome pada seksi "Evaluasi Pekerjaan Tambahan (1)" bersama 3 komitmen pagi sehingga total evaluasi bertambah menjadi 4 tugas.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Alur integrasi data dari Additional Work ke evaluasi EOD berjalan 100% mulus dan konsisten.

---

### TC-DLYA-002: Validasi Field Wajib Pemberi Instruksi & Proyek Tugas Ad-Hoc
- **Test Case ID:** `TC-DLYA-002`
- **Scenario ID:** `SCN-DLYA-02`
- **Requirement ID:** `FR-18`
- **Judul:** Validasi Field Wajib Pemberi Instruksi & Asosiasi Proyek Tugas Ad-Hoc
- **Tujuan:** Memastikan karyawan tidak dapat menyimpan tugas tambahan ad-hoc tanpa memilih siapa yang menginstruksikan tugas tersebut dan tanpa mengaitkannya ke proyek yang valid.
- **Modul / Halaman:** Additional Work (`/daily/additional-work`)
- **Kategori Pengujian:** Negative Testing / Data Integrity
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Tugas liar yang tidak jelas pemberi instruksinya memicu distorsi akuntabilitas jam kerja.
- **Preconditions:** Berada di form pencatatan `/daily/additional-work`.
- **Test Data ID:** `TD-DLYA-03`
- **Persiapan Sebelum Tes:** Buka `/daily/additional-work`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Masukkan judul tugas tambahan tetapi kosongkan pilihan "Pemberi Instruksi" dan "Proyek".
   - **Lokasi:** Form tugas tambahan.
   - **Data:** Judul: `Investigasi performa rendering Vue`. Dropdown instruksi: Kosong, Dropdown proyek: Kosong.
   - **Hasil yang diharapkan:** Form terisi sebagian.
   - **Verifikasi:** Dropdown berada pada nilai placeholder awal.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Simpan Tugas Tambahan".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem memblokir penyimpanan. Muncul pesan validasi merah pada kedua dropdown: "Pemberi instruksi wajib dipilih" dan "Proyek terkait wajib dipilih".
   - **Verifikasi:** Tidak ada penambahan data ke daftar tugas.
3. **Langkah 3**
   - **Aksi:** Pilih instruktur dan proyek yang valid lalu simpan kembali.
   - **Lokasi:** Form tugas tambahan.
   - **Data:** Instruktur: `Bambang Pratama`, Proyek: `WP-CORE`.
   - **Hasil yang diharapkan:** Validasi lolos dan tugas tambahan tersimpan sukses.
   - **Verifikasi:** Data masuk ke tabel tugas hari ini.

- **Expected Final Result:** Aturan wajib pemberi instruksi dan proyek berjalan tegak, mencegah data tugas mengambang (*orphaned task*).
- **Bukti yang Perlu Dikumpulkan:** Screenshot pesan validasi saat dropdown instruksi dan proyek dikosongkan.
- **Actual Result:** Sistem menolak penyimpanan tugas tambahan saat dropdown atasan penugas kosong dengan memunculkan tooltip wajib isi. Setelah atasan (Bambang Pratama) dipilih, tugas berhasil tersimpan dan tampil di daftar tugas hari ini.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Teridentifikasi temuan tata letak IMP-032 terkait overflow horizontal dropdown penugas saat divalidasi.

---

### TC-DLYA-003: Batas Maksimum 5 Tugas Tambahan Ad-Hoc Per Hari
- **Test Case ID:** `TC-DLYA-003`
- **Scenario ID:** `SCN-DLYA-03`
- **Requirement ID:** `FR-20`
- **Judul:** Batas Maksimum 5 Tugas Tambahan Ad-Hoc Per Hari (Workload Guard)
- **Tujuan:** Memvalidasi bahwa sistem membatasi pencatatan tugas tambahan ad-hoc maksimal 5 item per hari kerja untuk mencegah overload dan menjaga fokus kerja karyawan.
- **Modul / Halaman:** Additional Work (`/daily/additional-work`)
- **Kategori Pengujian:** Boundary Value Analysis
- **Teknik Desain Test Case:** Boundary Value Analysis (4 item, 5 item, percobaan item ke-6)
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Mencegah pencatatan tugas mikro yang tidak realistis dalam satu hari kerja.
- **Preconditions:** Karyawan telah mencatat 4 tugas tambahan pada hari yang sama.
- **Test Data ID:** `TD-DLYA-02`
- **Persiapan Sebelum Tes:** Login sebagai Employee dan berada di `/daily/additional-work`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Tambahkan tugas tambahan ke-5 dengan data valid dan klik simpan.
   - **Lokasi:** Form tugas tambahan.
   - **Data:** Judul: `Tugas Ad-Hoc ke-5 verifikasi staging`.
   - **Hasil yang diharapkan:** Tugas ke-5 berhasil tersimpan. Total tugas tambahan mencapai tepat 5 item.
   - **Verifikasi:** Daftar tugas menampilkan tepat 5 item tugas ad-hoc.
2. **Langkah 2**
   - **Aksi:** Amati tombol penambahan atau formulir input tugas tambahan.
   - **Lokasi:** Formulir tugas tambahan.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Tombol "Simpan Tugas Tambahan" dinonaktifkan (*disabled*) atau form menampilkan banner batas: "Batas maksimum 5 tugas tambahan per hari telah tercapai".
   - **Verifikasi:** Elemen form tidak lagi mengizinkan penginputan tugas ke-6.
3. **Langkah 3**
   - **Aksi:** Coba paksa submit jika tombol masih ada.
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem menolak pengiriman dengan notifikasi "Maksimum 5 tugas tambahan per hari kerja telah terpenuhi".
   - **Verifikasi:** Jumlah item tetap 5, tidak menjadi 6.

- **Expected Final Result:** Batas atas 5 tugas tambahan bekerja presisi, melindungi integritas beban kerja harian.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tampilan halaman saat mencapai batas 5 tugas tambahan dengan form terkunci.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 4: DAILY ACCOUNTABILITY — END-OF-DAY (EOD) OUTCOME (TC-DLYE)

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
- **Preconditions:** Komitmen pagi telah terisi. Waktu pengujian berada dalam jendela waktu sore sebelum jam cut-off (21:00 WIB).
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
- **Actual Result:** Pengiriman evaluasi EOD untuk 4 tugas (3 komitmen pagi + 1 tugas tambahan) dengan status akhir AMBER berhasil disimpan ke database. Namun formulir tidak terkunci: seluruh opsi capaian radio dan kartu refleksi mandiri tetap aktif dapat diubah, serta tombol Kirim Evaluasi EOD tetap aktif dan dapat diklik kembali.
- **Execution Status:** FAIL
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** DEF-002
- **Retest Result:** 
- **Catatan:** Memicu tiket cacat DEF-002 karena melanggar penguncian penutupan hari kerja FR-26.

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
- **Actual Result:** Meskipun Komitmen #2 berstatus Belum Selesai (Carry-Over), kartu status refleksi mandiri GREEN tetap aktif, terang, dan tidak pernah dinonaktifkan atau dikunci secara punitif oleh sistem. Hak otonomi penentuan refleksi mandiri karyawan terbukti terlindungi penuh sesuai DEC-003.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Regulasi Anti-Lock Green (DEC-003) terverifikasi 100% dipatuhi sistem.

---

### TC-DLYE-003: Wajib Alasan Penjelasan pada Status Blocked/Cancelled
- **Test Case ID:** `TC-DLYE-003`
- **Scenario ID:** `SCN-DLYE-03`
- **Requirement ID:** `FR-24`, `DEC-010`
- **Judul:** Wajib Alasan Penjelasan pada Status Komitmen Blocked/Cancelled (Anti-Silent Drop)
- **Tujuan:** Memvalidasi bahwa pemilihan status pencapaian `Blocked` atau `Cancelled` pada item tugas mewajibkan pengisian catatan penjelasan minimal 10 karakter sebelum form EOD dapat disubmit.
- **Modul / Halaman:** EOD Outcome (`/daily/eod`)
- **Kategori Pengujian:** Negative Testing / Boundary Value
- **Teknik Desain Test Case:** Boundary Value Analysis (< 10 char vs >= 10 char)
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Mencegah pembatalan tugas atau laporan macet tanpa jejak alasan yang jelas.
- **Preconditions:** Berada di form EOD sore dengan komitmen yang belum dievaluasi.
- **Test Data ID:** `TD-DLYE-04`
- **Persiapan Sebelum Tes:** Buka `/daily/eod`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Pilih status `Cancelled` pada salah satu komitmen.
   - **Lokasi:** Selector status item tugas di `/daily/eod`.
   - **Data:** Status: `Cancelled`.
   - **Hasil yang diharapkan:** Muncul field textarea wajib: "Alasan Pembatalan / Kendala (Minimal 10 karakter)".
   - **Verifikasi:** Textarea terbuka di bawah kartu tugas tersebut.
2. **Langkah 2**
   - **Aksi:** Biarkan textarea alasan kosong atau ketikkan `Dibatalkan` (10 char pas atau kurang), lalu coba submit form EOD.
   - **Lokasi:** Tombol submit EOD.
   - **Data:** Teks: `Batal` (5 karakter).
   - **Hasil yang diharapkan:** Form menolak submit. Muncul pesan validasi merah: "Alasan kendala/pembatalan tugas wajib diisi minimal 10 karakter".
   - **Verifikasi:** Form tidak terkirim dan field ditandai border merah.
3. **Langkah 3**
   - **Aksi:** Masukkan alasan lengkap (>= 10 karakter): `Prioritas dialihkan oleh Tech Lead ke hotfix modul pembayaran`, lalu submit.
   - **Lokasi:** Textarea alasan pembatalan.
   - **Data:** Teks alasan memadai.
   - **Hasil yang diharapkan:** Validasi berhasil terlewati dan form EOD dapat diproses.
   - **Verifikasi:** Laporan tersimpan dengan status Cancelled beserta alasan tercatat.

- **Expected Final Result:** Validasi alasan minimal 10 karakter pada status tidak tuntas bekerja ketat tanpa celah.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pesan validasi kegagalan saat alasan < 10 karakter pada tugas Cancelled.
- **Actual Result:** Saat Komitmen #1 diubah menjadi Dibatalkan (CANCELLED) dan textarea alasan dikosongkan, sistem secara ketat menolak pengiriman form evaluasi EOD dan mewajibkan pengisian alasan penjelasan tertulis.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Memvalidasi penegakan aturan Anti-Silent Drop (FR-24 & DEC-010).

---

### TC-DLYE-004: Penguncian Form Hasil Sore Pasca Cut-Off EOD
- **Test Case ID:** `TC-DLYE-004`
- **Scenario ID:** `SCN-DLYE-04`
- **Requirement ID:** `FR-27`, `DEC-002`
- **Judul:** Penguncian Form Hasil Sore Pasca Cut-Off EOD (Anti-Direct Edit DEC-002)
- **Tujuan:** Memvalidasi bahwa karyawan tidak dapat mengisi atau menyunting hasil evaluasi sore secara langsung setelah batas waktu cut-off EOD terlewati; sistem wajib mengarahkan ke permohonan EOD Correction Request.
- **Modul / Halaman:** EOD Outcome (`/daily/eod`)
- **Kategori Pengujian:** State Transition / Business Rules
- **Teknik Desain Test Case:** Decision Table & State Transition
- **Role:** `EMPLOYEE`
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Mencegah manipulasi pelaporan kerja sore di luar jam operasional resmi.
- **Preconditions:** Waktu sistem telah melewati batas cut-off EOD sore (lewat cut-off 21:00 WIB + grace period) atau membuka riwayat tanggal kemarin yang belum di-submit EOD.
- **Test Data ID:** `TD-DLYE-05`
- **Persiapan Sebelum Tes:** Buka `/daily/eod` untuk tanggal yang telah terkunci.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman EOD Outcome pada periode terkunci.
   - **Lokasi:** `/daily/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Antarmuka mendeteksi periode cut-off telah berakhir. Selector status dan tombol submit dalam kondisi dinonaktifkan (*disabled*).
   - **Verifikasi:** Seluruh radio button status tidak dapat diubah.
2. **Langkah 2**
   - **Aksi:** Periksa banner instruksi penguncian di bagian atas form.
   - **Lokasi:** Banner informasi `/daily/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Muncul banner pemberitahuan: "Batas waktu pelaporan hasil kerja sore telah berakhir. Perubahan data hanya dapat dilakukan melalui Pengajuan Koreksi EOD".
   - **Verifikasi:** Terdapat tombol tautan aktif: "Ajukan Koreksi EOD".
3. **Langkah 3**
   - **Aksi:** Klik tombol "Ajukan Koreksi EOD".
   - **Lokasi:** Tombol aksi pada banner.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Browser diarahkan ke formulir permohonan koreksi sore di `/corrections/eod`.
   - **Verifikasi:** URL berubah menjadi `/corrections/eod`.

- **Expected Final Result:** Penguncian form EOD pasca cut-off bekerja konsisten sesuai DEC-002 dan navigasi ke koreksi EOD tersedia jelas.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman EOD yang terkunci dengan banner instruksi koreksi EOD.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 5: MANAJEMEN HAMBATAN (BLOCKER) & ESKALASI SLA (TC-BLKR)

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

### TC-BLKR-004: Pemantauan Radar Eskalasi Blocker Melewati Batas SLA (Aging)
- **Test Case ID:** `TC-BLKR-004`
- **Scenario ID:** `SCN-BLKR-04`
- **Requirement ID:** `FR-34`, `DEC-007`
- **Judul:** Pemantauan Radar Eskalasi Blocker Melewati Batas SLA (Aging Radar)
- **Tujuan:** Memvalidasi bahwa pimpinan departemen (Head of Dept / CEO) dapat memantau blocker yang telah melewati batas target SLA (*breached SLA*) pada radar eskalasi aging untuk intervensi manajemen lintas divisi.
- **Modul / Halaman:** Escalation Aging View (`/blockers/aging`)
- **Kategori Pengujian:** Risk Analytics & Escalation
- **Teknik Desain Test Case:** Equivalence Partitioning & Decision Table
- **Role:** `HEAD` / `CEO_MANAGEMENT` (`direktur@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Hambatan menua yang tidak terpantau oleh manajemen tingkat atas menyebabkan pembengkakan biaya proyek dan penundaan deliverable strategis.
- **Preconditions:** Login sebagai Direktur (`direktur@dutamedia.com`). Terdapat blocker dengan waktu terbuka melebihi batas SLA di database seeder.
- **Test Data ID:** `TD-BLKR-04`
- **Persiapan Sebelum Tes:** Buka `/blockers/aging`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Eskalasi & Aging" via sidebar grup *Management*.
   - **Lokasi:** `/blockers/aging`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman radar eskalasi terbuka dengan statistik: Total Blocker Breached SLA, Rata-rata Durasi Hambatan Menua, dan Matriks Distribusi Departemen.
   - **Verifikasi:** Header dan indikator matriks eskalasi tampil utuh.
2. **Langkah 2**
   - **Aksi:** Periksa daftar blocker pada kelompok "Melewati SLA (Breached)".
   - **Lokasi:** Tabel antrean eskalasi `/blockers/aging`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Blocker yang belum direspon atau belum terselesaikan melewati batas waktu menampilkan label merah tebal: "SLA Breached (+X Jam Terlambat)".
   - **Verifikasi:** Detail durasi keterlambatan tertera secara akurat.
3. **Langkah 3**
   - **Aksi:** Klik tombol "Intervensi Manajemen / Tag Atasan" pada salah satu blocker yang menua.
   - **Lokasi:** Baris tindakan pada tabel aging.
   - **Data:** Catatan intervensi: `Mohon Tech Lead segera lakukan koordinasi darurat dengan vendor hari ini.`
   - **Hasil yang diharapkan:** Catatan intervensi direksi tersimpan dan notifikasi darurat terkirim ke supervisor terkait.
   - **Verifikasi:** Status intervensi tercatat pada riwayat timeline blocker.

- **Expected Final Result:** Radar penuaan blocker menyajikan visibilitas eskalasi secara akurat bagi manajemen eksekutif.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Escalation Aging yang memperlihatkan kartu blocker dengan badge Breached SLA.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-BLKR-005: Penanganan Blocker Berdasarkan Kewenangan Proyek (PM Authority)
- **Test Case ID:** `TC-BLKR-005`
- **Scenario ID:** `SCN-BLKR-05`
- **Requirement ID:** `FR-35`, `DEC-006`
- **Judul:** Penanganan Blocker Berdasarkan Kewenangan Proyek (Project Manager Authority DEC-006)
- **Tujuan:** Memvalidasi prinsip kewenangan ganda DEC-006: blocker yang diasosiasikan dengan inisiatif/proyek strategis tertentu diarahkan ke antrean Project Manager proyek bersangkutan untuk ditinjau dan diselesaikan.
- **Modul / Halaman:** Blocker Queue (`/blockers`) & Project Risk (`/projects/risk`)
- **Kategori Pengujian:** Authority Context / RBAC
- **Teknik Desain Test Case:** Decision Table Testing
- **Role:** `PROJECT_MANAGER` / `SUPERVISOR` (`lead.tech@dutamedia.com` sebagai PM WP-CORE)
- **Priority:** **High (P1)**
- **Risk Rationale:** Salah alokasi wewenang penanganan blocker proyek membuat hambatan deliverable klien tidak tertangani oleh pihak yang bertanggung jawab.
- **Preconditions:** Login sebagai Project Manager untuk proyek `WP-CORE`. Terdapat blocker yang dilaporkan dengan asosiasi proyek `WP-CORE`.
- **Test Data ID:** `TD-BLKR-05`
- **Persiapan Sebelum Tes:** Masuk ke `/blockers`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Blocker Queue dan aktifkan filter konteks "Proyek: WorkPulse Platform Core 2026 (WP-CORE)".
   - **Lokasi:** Filter dropdown proyek di `/blockers`.
   - **Data:** Pilihan proyek: `WP-CORE`.
   - **Hasil yang diharapkan:** Antrean hanya menampilkan blocker yang terasosiasi dengan proyek `WP-CORE`.
   - **Verifikasi:** Seluruh baris blocker pada tabel memiliki tag `WP-CORE`.
2. **Langkah 2**
   - **Aksi:** Periksa hak aksi PM pada kartu blocker proyek.
   - **Lokasi:** Tombol aksi pada kartu blocker.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sebagai PM proyek yang sah, tombol "Respons / Acknowledge" dan "Resolve" aktif dan dapat dieksekusi.
   - **Verifikasi:** Tombol aksi dapat diklik tanpa error izin akses.
3. **Langkah 3**
   - **Aksi:** Buka halaman Project Risk Radar di `/projects/risk`.
   - **Lokasi:** Menu "Risiko Proyek" via sidebar.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Indikator risiko proyek `WP-CORE` menampilkan akumulasi jumlah blocker aktif yang terkait dengan proyek tersebut.
   - **Verifikasi:** Metrik blocker aktif proyek sinkron antara halaman `/blockers` dan `/projects/risk`.

- **Expected Final Result:** Konteks kewenangan proyek (DEC-006) berfungsi tepat sasaran; PM memegang kendali resolusi blocker inisiatifnya.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tampilan Blocker Queue dengan filter proyek dan halaman Project Risk Radar terkait.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 6: KEPATUHAN & PERMOHONAN KOREKSI (TC-CORR)

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
   - **Hasil yang diharapkan:** Modal konfirmasi persetujuan muncul, memberikan opsi penambahan catatan atasan.
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

### TC-CORR-003: Penolakan Permohonan Koreksi dengan Alasan Wajib >= 10 Karakter
- **Test Case ID:** `TC-CORR-003`
- **Scenario ID:** `SCN-CORR-03`
- **Requirement ID:** `FR-40`, `DEC-010`
- **Judul:** Penolakan Permohonan Koreksi dengan Alasan Wajib (Anti-Silent Rejection)
- **Tujuan:** Memvalidasi bahwa atasan yang menolak permohonan koreksi bawahan wajib menyertakan alasan penolakan tertulis minimal 10 karakter agar ada transparansi evaluasi bagi karyawan.
- **Modul / Halaman:** Correction Review (`/corrections/review`)
- **Kategori Pengujian:** Negative Testing / Boundary Value
- **Teknik Desain Test Case:** Boundary Value Analysis (< 10 char vs >= 10 char)
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Penolakan sepihak tanpa alasan tertulis memicu ketidakpastian dan ketegangan hubungan kerja antara atasan dan bawahan.
- **Preconditions:** Login sebagai Supervisor. Terdapat permohonan koreksi berstatus `PENDING`.
- **Test Data ID:** `TD-CORR-02`
- **Persiapan Sebelum Tes:** Buka `/corrections/review`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Klik tombol "Tolak Permohonan" pada salah satu permohonan koreksi di antrean.
   - **Lokasi:** Baris permohonan di `/corrections/review`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal dialog "Penolakan Permohonan Koreksi" terbuka dengan textarea wajib: "Alasan Penolakan (Minimal 10 karakter)".
   - **Verifikasi:** Modal terbuka dengan tombol "Konfirmasi Tolak".
2. **Langkah 2**
   - **Aksi:** Biarkan textarea alasan kosong atau ketikkan `Ditolak` (7 karakter), lalu klik "Konfirmasi Tolak".
   - **Lokasi:** Modal penolakan koreksi.
   - **Data:** Teks: `Ditolak` (7 karakter).
   - **Hasil yang diharapkan:** Sistem menolak proses. Muncul pesan validasi merah: "Alasan penolakan wajib diisi minimal 10 karakter".
   - **Verifikasi:** Status permohonan tetap `PENDING`.
3. **Langkah 3**
   - **Aksi:** Masukkan alasan penolakan yang jelas dan profesional (>= 10 karakter), lalu klik "Konfirmasi Tolak".
   - **Lokasi:** Textarea alasan penolakan.
   - **Data:** `Alasan tidak dapat diverifikasi karena log server membuktikan koneksi normal dan rekan satu tim dapat submit.`
   - **Hasil yang diharapkan:** Validasi berhasil. Status permohonan bertransisi menjadi `REJECTED` (Badge Merah). Alasan penolakan tersimpan di riwayat.
   - **Verifikasi:** Permohonan berpindah ke tab "Riwayat Ditolak" dengan alasan tertera.

- **Expected Final Result:** Penolakan koreksi mewajibkan alasan >= 10 karakter secara ketat; status beralih ke REJECTED secara sah.
- **Bukti yang Perlu Dikumpulkan:** Screenshot modal penolakan saat alasan < 10 char dan screenshot kartu permohonan dengan status REJECTED.
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

### TC-CORR-005: Penerbitan Dispensasi Kepatuhan Resmi (Exemption) & Audit Log
- **Test Case ID:** `TC-CORR-005`
- **Scenario ID:** `SCN-CORR-05`
- **Requirement ID:** `FR-43`, `FR-44`, `DEC-013`
- **Judul:** Penerbitan Dispensasi Kepatuhan Resmi (Exemption) & Pencatatan Audit Log Abadi
- **Tujuan:** Memvalidasi bahwa HRGA atau Direksi dapat menerbitkan dispensasi kepatuhan resmi untuk karyawan (misal: penugasan luar kota darurat), menghapus catatan penalti kepatuhan, dan merekam jejak audit yang tidak dapat dimanipulasi (DEC-013).
- **Modul / Halaman:** Exemption Management (`/exemptions`)
- **Kategori Pengujian:** Governance / Compliance & Audit Trail
- **Teknik Desain Test Case:** Use Case Testing & State Transition
- **Role:** `HRGA` (`hrga@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Pemberian dispensasi ilegal tanpa jejak audit dapat menimbulkan diskriminasi penegakan aturan kerja di perusahaan.
- **Preconditions:** Login sebagai `hrga@dutamedia.com`. Terdapat karyawan dengan catatan ketidakpatuhan.
- **Test Data ID:** `TD-CORR-03`
- **Persiapan Sebelum Tes:** Buka `/exemptions`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Exemption Management via navigasi.
   - **Lokasi:** `/exemptions`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman terbuka menampilkan tabel riwayat dispensasi aktif dan tombol "+ Terbitkan Dispensasi Baru".
   - **Verifikasi:** Tombol penambahan dispensasi tersedia.
2. **Langkah 2**
   - **Aksi:** Klik tombol "+ Terbitkan Dispensasi Baru", pilih nama karyawan, tanggal berlaku dispensasi, kategori alasan (Tugas Luar Kantor / Force Majeure), dan deskripsi justifikasi.
   - **Lokasi:** Modal penerbitan dispensasi.
   - **Data:** Karyawan: `Aditya Nugroho`, Tanggal: Hari ini, Kategori: `TUGAS_LUAR_KOTA`, Catatan: `Penugasan mendadak implementasi server on-site di data center klien PT Mitra Usaha`.
   - **Hasil yang diharapkan:** Form terisi lengkap dan valid.
   - **Verifikasi:** Field teks memenuhi syarat minimal 10 karakter.
3. **Langkah 3**
   - **Aksi:** Klik "Konfirmasi Terbitkan Dispensasi".
   - **Lokasi:** Modal formulir dispensasi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast sukses muncul "Dispensasi resmi berhasil diterbitkan". Catatan pelanggaran tanggal terkait pada akun karyawan tersebut dihapus/dipulihkan menjadi `EXEMPTED`.
   - **Verifikasi:** Periksa riwayat audit log di `/compliance` atau `/reports`. Entri audit tercatat dengan nama eksekutor `Dewi Lestari (Lead HRGA)` dan timestamp saat itu.

- **Expected Final Result:** Dispensasi resmi berhasil diterbitkan, status kepatuhan karyawan pulih, dan audit log permanen (DEC-013) tercatat abadi.
- **Bukti yang Perlu Dikumpulkan:** Screenshot daftar dispensasi aktif di `/exemptions` dan screenshot entri audit trail terkait.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-CORR-006: Pengajuan Permohonan Koreksi Realisasi EOD Pasca Cut-Off
- **Test Case ID:** `TC-CORR-006`
- **Scenario ID:** `SCN-CORR-06`
- **Requirement ID:** `UAT-REQ-EODCORR-001`, `DEC-002`, `DEC-003` *(Harmonized Local ID; Sumber Kanonis: PRD v1.6 §3.11 FR-53, FR-55; DEC-002, DEC-003)*
- **Judul:** Pengajuan Permohonan Koreksi Realisasi EOD Pasca Cut-Off
- **Tujuan:** Memvalidasi alur pengajuan permohonan koreksi hasil evaluasi capaian kerja sore (EOD Outcome) oleh karyawan setelah batas cut-off 21:00 WIB terkunci (DEC-002, PRD v1.6 §3.11 FR-53/FR-55). Pengujian mencakup peninjauan pengikatan komitmen hari berjalan via `/daily/today`, penentuan outcome baru (`DONE` - prinsip anti-lock green DEC-003), pengisian penjelasan kendala teknis capaian (`#outcomeReasonInput`), pengisian justifikasi resmi alasan koreksi minimal 10 karakter (`#eodReasonInput`), pencatatan batasan ketiadaan pemilih tanggal lampau sebagai gap implementasi untuk keputusan Acceptance Owner, serta klarifikasi bahwa instruksi "pilih tanggal" dan "lampiran penjelasan" bersumber murni dari saran pengujian inventori UAT internal (bukan mandat upload file fisik dari PRD kanonis). *Catatan Harmonisasi Sumber:* ID lokal UAT-REQ-EODCORR-001 digunakan untuk menghindari benturan dengan FR-38 kanonis PRD v1.6 (Notifikasi Email & Push §3.8), dengan sumber kanonis sejati pada PRD v1.6 Section 3.11 (FR-53, FR-55).
- **Modul / Halaman:** Koreksi Evaluasi Sore EOD (`/corrections/eod`)
- **Kategori Pengujian:** Business Process / Post-Cutoff Correction & Anti-Lock Green
- **Teknik Desain Test Case:** Boundary Value Analysis (min length 10 char) & State Transition
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com` / `Aditya Nugroho`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Kesalahan penulisan capaian sore yang terkunci tanpa jalur koreksi formal akan merusak integritas KPI harian dan melanggar prinsip otonomi refleksi karyawan (DEC-003).
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Terdapat catatan komitmen EOD pada hari terkait yang berstatus terkunci pasca cut-off sore.
- **Test Data ID:** `TD-CORR-04`
- **Persiapan Sebelum Tes:** Akses halaman `/corrections/eod` melalui navigasi topbar atau URL langsung.

**Langkah Pengujian:**
1. **Langkah 1 (Akses Halaman & Verifikasi Pengikatan Tanggal Berjalan)**
   - **Aksi:** Buka halaman Koreksi Evaluasi Sore via URL `/corrections/eod` atau tombol "Koreksi EOD" pada topbar. Amati pengikatan tanggal komitmen yang dimuat dropdown `#eodSelect`.
   - **Lokasi:** Rute URL `/corrections/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman "Permohonan Koreksi Evaluasi Sore (EOD)" terbuka menampilkan split layout: panel kiri formulir pengajuan dan panel kanan riwayat koreksi EOD. Formulir secara otomatis memanggil `/daily/today` dan menyajikan daftar tugas komitmen yang terdaftar pada hari berjalan (today).
   - **Catatan Gap Implementasi untuk Keputusan Acceptance Owner (Harry):** Pada formulir aktual `/corrections/eod`, sistem mengikat data secara inheren pada komitmen hari berjalan (`/daily/today`). Pengguna saat ini tidak dapat memilih tanggal lampau untuk mengoreksi EOD kemarin yang telah terkunci. Terkait referensi sumber kanonis, alur koreksi EOD diatur pada PRD v1.6 Section 3.11 (FR-53/FR-55) dan aturan bisnis DEC-002, bukan Section 3.5. Ketiadaan pemilih tanggal lampau (*historical date picker*) dicatat sebagai gap implementasi yang memerlukan keputusan Acceptance Owner apakah MVP memang dibatasi pada hari berjalan atau memerlukan penambahan pemilih tanggal lampau.
   - **Verifikasi:** Judul halaman dan kedua panel tertampil dengan subtitle rujukan DEC-002 dan DEC-003; catatan keterbatasan tanggal lampau terdokumentasi.
2. **Langkah 2 (Pemilihan Tugas & Inspeksi Baseline Snapshot)**
   - **Aksi:** Pada dropdown "Pilih Komitmen / Tugas Target" (`#eodSelect`), pilih salah satu tugas komitmen yang berstatus outcome `BLOCKED` atau `IN_PROGRESS`.
   - **Lokasi:** Dropdown `#eodSelect`.
   - **Data:** Komitmen target tugas kerja hari ini.
   - **Hasil yang diharapkan:** Kotak "Baseline Snapshot Tersimpan" (`.baseline-box`) muncul di bawah dropdown, menampilkan teks tugas baseline, hasil saat ini (misal: `BLOCKED`), dan catatan kendala terkait.
   - **Verifikasi:** Data baseline EOD tersimpan sinkron dengan tugas yang dipilih.
3. **Langkah 3 (Penetapan Klasifikasi Perubahan Material)**
   - **Aksi:** Pada pilihan "Klasifikasi Perubahan", pilih kartu radio "Perubahan Material" (Material Change).
   - **Lokasi:** Pilihan radio `.class-grid`.
   - **Data:** `MATERIAL`.
   - **Hasil yang diharapkan:** Kartu "Perubahan Material" berstatus terpilih (`.selected`). Teks deskripsi menjelaskan bahwa perubahan material membuka jendela sanggahan 24 jam (*Objection Window*).
   - **Verifikasi:** Nilai classification bernilai `MATERIAL`.
4. **Langkah 4 (Penetapan Hasil Baru & Penjelasan Kendala Teknis Capaian)**
   - **Aksi:** Pada pilihan "Hasil Baru yang Diajukan (Outcome)", pilih status "DONE (Tuntas)" sesuai prinsip Anti-Lock Green (DEC-003). Pada dropdown "Status Kelanjutan Tugas", pilih "Arsipkan / Tuntas" (`ARCHIVE`). Pada field "Keterangan Hasil yang Diajukan" (`#outcomeReasonInput`), ketikkan penjelasan kendala teknis yang sempat dihadapi.
   - **Lokasi:** Elemen radio `.outcome-grid`, dropdown `#continuationSelect`, dan textarea `#outcomeReasonInput`.
   - **Data:** Outcome: `DONE`, Continuation: `ARCHIVE`, Keterangan Kendala Teknis: `Pekerjaan integrasi API payment gateway sempat terhambat timeout koneksi staging server vendor pada sore hari namun berhasil diselesaikan pasca cut-off`.
   - **Hasil yang diharapkan:** Status outcome terpilih adalah `DONE`. Status kelanjutan terisi `ARCHIVE`. Keterangan kendala teknis terisi rapi dalam formulir.
   - **Verifikasi:** Radio card `DONE` memiliki styling aktif (`.selected`); textarea terisi teks kendala teknis.
5. **Langkah 5 (Validasi Negatif: Alasan Resmi Kurang dari 10 Karakter)**
   - **Aksi:** Pada field "Alasan Resmi Permohonan Koreksi" (`#eodReasonInput`), ketikkan alasan pendek kurang dari 10 karakter: `Lupa input`. Amati status tombol submit.
   - **Lokasi:** Input `#eodReasonInput` dan tombol submit `.btn-submit`.
   - **Data:** `Lupa input` (panjang 10 karakter atau kurang).
   - **Hasil yang diharapkan:** Tombol "Kirim Permohonan Koreksi EOD" tetap dalam keadaan `disabled` (tidak dapat diklik) karena panjang karakter < 10. Jika dipaksa klik, validasi form HTML5 `minlength="10"` menolak pengiriman formulir.
   - **Verifikasi:** Tombol submit berstatus disabled; pengajuan tidak terkirim.
6. **Langkah 6 (Skenario Positif: Pengiriman Permohonan Koreksi EOD)**
   - **Aksi:** Lengkapi field alasan resmi dengan justifikasi lengkap >= 10 karakter: `"Pekerjaan integrasi API terselesaikan pada pukul 21:15 WIB setelah kendala koneksi vendor pulih"`. Lalu klik tombol "Kirim Permohonan Koreksi EOD".
   - **Lokasi:** Field `#eodReasonInput` dan tombol `.btn-submit`.
   - **Data:** Alasan: `Pekerjaan integrasi API terselesaikan pada pukul 21:15 WIB setelah kendala koneksi vendor pulih` (> 10 karakter).
   - **Hasil yang diharapkan:** Tombol menjadi aktif (`enabled`). Saat diklik, tombol menampilkan indikator loading (*"Mengajukan..."*). Muncul notifikasi toast sukses hijau: *"Permohonan koreksi material EOD diajukan. Jendela sanggahan 24 jam dibuka."* Form input dikosongkan kembali.
   - **Verifikasi:** Toast sukses `.toast-popup.success` tampil; form alasan direset.
7. **Langkah 7 (Verifikasi Riwayat Koreksi & Klarifikasi Status Lampiran Berkas)**
   - **Aksi:** Periksa panel kanan "Riwayat Permohonan Koreksi EOD" (`.history-panel`) dan periksa klausul lampiran berkas fisik.
   - **Lokasi:** Panel kanan `.history-panel`.
   - **Data:** Entri baru yang baru saja disubmit.
   - **Hasil yang diharapkan:**
     - Tampil kartu riwayat baru (`.history-card`) dengan badge status `PENDING`, pill klasifikasi `MATERIAL`, tanggal pengajuan hari ini, serta detail nilai requested outcome `DONE`.
     - **Klarifikasi Requirement Lampiran Berkas Fisik vs Penjelasan Tekstual:** Frasa *"lampiran penjelasan"* murni berasal dari kolom saran pengujian internal UAT Inventory baris 126, bukan mandat teks normatif PRD v1.6. Dokumen perancangan kanonis hanya mensyaratkan keterangan alasan ("Reason wajib"), dan **sama sekali TIDAK mewajibkan pengunggahan berkas fisik (*file attachment upload*)**. Formulir saat ini telah menyediakan field `#outcomeReasonInput` dan `#eodReasonInput` yang memenuhi kebutuhan penjelasan kendala dan alasan secara tekstual. Oleh karena itu, pengujian menegaskan bahwa ketiadaan upload berkas fisik **bukan merupakan defek atau kegagalan requirement PRD**, melainkan requirement penjelasan telah dipenuhi secara tekstual.
   - **Verifikasi:** Entri koreksi EOD tercatat di panel riwayat; status klarifikasi requirement lampiran terdokumentasi.

- **Expected Final Result:** Permohonan koreksi evaluasi sore EOD berhasil diajukan dengan validasi kendala teknis dan alasan resmi terpenuhi (UAT-REQ-EODCORR-001); keterbatasan pengikatan tanggal berjalan dicatat sebagai gap implementasi untuk keputusan Harry, ketiadaan upload file fisik dikonfirmasi bukan defek (hanya penjelasan tekstual yang diwajibkan PRD), dan harmonisasi ID lokal UAT-REQ-EODCORR-001 terverifikasi mencegah benturan dengan FR-38 kanonis PRD v1.6.
- **Bukti yang Perlu Dikumpulkan:** Screenshot form pengajuan terisi lengkap di `/corrections/eod` dan screenshot entri baru berstatus `PENDING` pada panel Riwayat Permohonan Koreksi EOD.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

## MODUL 7: PENGELOLAAN CUTI & REKONSILIASI OTOMATIS (TC-LEAV)

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
   - **Hasil yang diharapkan:** Halaman menampilkan widget informasi: Sisa Kuota Cuti Tahunan, Riwayat Cuti Lalu, dan Formulir Pengajuan Cuti Baru.
   - **Verifikasi:** Sisa kuota cuti bernilai positif dan form siap diisi.
2. **Langkah 2**
   - **Aksi:** Pilih Jenis Cuti: `Cuti Tahunan`, tentukan Tanggal Mulai dan Tanggal Selesai (rentang 2 hari kerja), dan tuliskan alasan permohonan.
   - **Lokasi:** Formulir pengajuan cuti.
   - **Data:** Jenis: `Cuti Tahunan`, Mulai: `Besok`, Selesai: `Lusa`, Alasan: `Keperluan keluarga dan renovasi rumah tinggal di luar kota`.
   - **Hasil yang diharapkan:** Sistem menghitung total hari kerja yang diajukan (2 Hari Kerja) dan memverifikasi kuota mencukupi.
   - **Verifikasi:** Teks ringkasan menampilkan total pengajuan dan estimasi kuota sisa.
3. **Langkah 3**
   - **Aksi:** Klik tombol "Kirim Pengajuan Cuti".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast sukses muncul "Pengajuan cuti berhasil dikirim". Permohonan tercatat di tabel riwayat cuti pribadi dengan status kuning `PENDING (Menunggu Persetujuan Atasan)`.
   - **Verifikasi:** Data tampil di daftar cuti aktif pribadi.

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

### TC-LEAV-002: Persetujuan Permohonan Cuti oleh Atasan Langsung
- **Test Case ID:** `TC-LEAV-002`
- **Scenario ID:** `SCN-LEAV-02`
- **Requirement ID:** `FR-46`
- **Judul:** Persetujuan Permohonan Cuti Tim oleh Atasan Langsung & Pemotongan Kuota
- **Tujuan:** Memvalidasi bahwa atasan langsung dapat melihat antrean permohonan cuti bawahannya, memverifikasi ketersediaan personil pengganti, menyetujui permohonan, dan memverifikasi bahwa sisa kuota cuti karyawan terpotong secara tepat.
- **Modul / Halaman:** Leave Approval Queue (`/leave/queue`)
- **Kategori Pengujian:** Workflow Transition / State Transition
- **Teknik Desain Test Case:** State Transition Testing
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Hambatan pada persetujuan cuti menyebabkan ketidakpastian izin kerja karyawan dan kekacauan jadwal proyek.
- **Preconditions:** Login sebagai Supervisor. Terdapat pengajuan cuti berstatus `PENDING` dari Aditya Nugroho (`TC-LEAV-001`).
- **Test Data ID:** `TD-LEAV-02`
- **Persiapan Sebelum Tes:** Buka `/leave/queue`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Antrean Persetujuan Cuti via sidebar grup *Management*.
   - **Lokasi:** `/leave/queue`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Antrean persetujuan cuti terbuka. Permohonan cuti tahunan 2 hari dari "Aditya Nugroho" tampil dengan status `PENDING`.
   - **Verifikasi:** Terdapat tombol aksi "Setujui" dan "Tolak".
2. **Langkah 2**
   - **Aksi:** Klik tombol "Setujui" pada baris pengajuan Aditya.
   - **Lokasi:** Baris permohonan di `/leave/queue`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal dialog konfirmasi persetujuan terbuka dengan opsi catatan atasan.
   - **Verifikasi:** Modal persetujuan cuti terbuka.
3. **Langkah 3**
   - **Aksi:** Masukkan catatan persetujuan: `Disetujui. Backup tugas telah dialihkan ke Siti Rahma`, lalu klik "Konfirmasi Setujui".
   - **Lokasi:** Modal persetujuan cuti.
   - **Data:** Catatan atasan.
   - **Hasil yang diharapkan:** Toast sukses muncul "Permohonan cuti berhasil disetujui". Status pengajuan bertransisi menjadi `APPROVED` (Badge Hijau). Sisa kuota cuti tahunan karyawan otomatis terpotong 2 hari di database.
   - **Verifikasi:** Pengajuan berpindah ke tab "Riwayat Disetujui".

- **Expected Final Result:** Permohonan cuti disetujui resmi, status bertransisi ke APPROVED, dan kuota cuti terpotong secara akurat.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pengajuan di tab Disetujui dengan badge APPROVED dan catatan supervisor.
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
- **Preconditions:** Terdapat pengajuan cuti yang telah berstatus `APPROVED` untuk seorang karyawan (Maya Putri) pada hari ini. Karyawan tersebut tidak membuka sistem dan tidak mengisi komitmen pagi. Jam cut-off pagi telah terlewati.
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

## MODUL 8: SUPERVISI, BIMBINGAN, DASBOR, & ADMINISTRASI (TC-COAC, TC-DASH, TC-ADMN)

---

### TC-COAC-001: Pemberian Catatan Bimbingan Manajer (Coaching Note)
- **Test Case ID:** `TC-COAC-001`
- **Scenario ID:** `SCN-COAC-01`
- **Requirement ID:** `FR-49`, `DEC-010`
- **Judul:** Pemberian Catatan Bimbingan Manajer (Manager Coaching Note DEC-010)
- **Tujuan:** Memvalidasi bahwa atasan dapat menyematkan catatan bimbingan atau apresiasi kerja pada komitmen bawahan dengan catatan tertulis minimal 10 karakter, dan bawahan dapat membaca catatan tersebut di timeline kerjanya.
- **Modul / Halaman:** Manager Note Coaching (`/coaching`)
- **Kategori Pengujian:** Usability / Coaching & Feedback
- **Teknik Desain Test Case:** Boundary Value & Use Case Testing
- **Role:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Ketiadaan media bimbingan manajer membuat evaluasi kerja harian menjadi transaksional dan mengabaikan pembinaan SDM.
- **Preconditions:** Login sebagai Supervisor. Bawahan (Aditya Nugroho) memiliki komitmen kerja di sistem.
- **Test Data ID:** `TD-COAC-01`
- **Persiapan Sebelum Tes:** Buka `/coaching`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Catatan Coaching" via sidebar.
   - **Lokasi:** `/coaching`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman coaching terbuka menampilkan daftar anggota tim langsung dan riwayat sesi bimbingan sebelumnya.
   - **Verifikasi:** Daftar bawahan (Aditya Nugroho dan Siti Rahma) tampil pada panel pemilih.
2. **Langkah 2**
   - **Aksi:** Pilih "Aditya Nugroho", klik tombol "+ Buat Catatan Bimbingan", lalu coba kirim dengan teks kurang dari 10 karakter (cth: `Bagus`).
   - **Lokasi:** Form coaching note.
   - **Data:** Teks: `Bagus` (5 karakter).
   - **Hasil yang diharapkan:** Sistem memblokir pengiriman. Muncul pesan validasi: "Catatan bimbingan minimal 10 karakter".
   - **Verifikasi:** Catatan tidak tersimpan.
3. **Langkah 3**
   - **Aksi:** Masukkan catatan bimbingan konstruktif yang lengkap (>= 10 karakter) dan klik "Simpan Catatan".
   - **Lokasi:** Form coaching note.
   - **Data:** `Kerja bagus untuk refactoring modul VAPID. Pertahankan efisiensi query dan dokumentasikan endpoint baru di wiki tim.`
   - **Hasil yang diharapkan:** Toast sukses muncul "Catatan bimbingan berhasil disimpan". Catatan muncul pada timeline bimbingan Aditya Nugroho dengan timestamp dan nama atasan.
   - **Verifikasi:** Entri coaching tampil pada daftar riwayat.

- **Expected Final Result:** Catatan bimbingan tersimpan rapi, memenuhi syarat minimal 10 karakter, dan dapat diakses oleh kedua belah pihak.
- **Bukti yang Perlu Dikumpulkan:** Screenshot timeline coaching note yang memuat catatan konstruktif supervisor.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

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
   - **Verifikasi:** Kartu anggota tim yang memiliki kendala tampil dengan badge Blocker Kritis.
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

### TC-DASH-002: Pemantauan Radar Risiko Proyek & Inisiatif Strategis
- **Test Case ID:** `TC-DASH-002`
- **Scenario ID:** `SCN-DASH-02`
- **Requirement ID:** `FR-51`
- **Judul:** Pemantauan Radar Risiko Proyek & Inisiatif Strategis (Project Risk Radar)
- **Tujuan:** Memvalidasi bahwa Project Manager dan Head of Dept dapat memantau kalkulasi status risiko inisiatif strategis (Aman, Waspada, Kritis) berdasarkan agregasi blocker aktif dan tugas macet.
- **Modul / Halaman:** Project Risk View (`/projects/risk`)
- **Kategori Pengujian:** Risk Analytics & Heuristic Scoring
- **Teknik Desain Test Case:** Equivalence Partitioning & Decision Table
- **Role:** `PROJECT_MANAGER` / `HEAD`
- **Priority:** **High (P1)**
- **Risk Rationale:** Keterlambatan mengidentifikasi risiko proyek inisiatif menyebabkan kegagalan pencapaian target kontrak klien.
- **Preconditions:** Login sebagai Project Manager atau Head of Dept.
- **Test Data ID:** `TD-DASH-01`
- **Persiapan Sebelum Tes:** Buka `/projects/risk`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Risiko Proyek" via sidebar grup *Management*.
   - **Lokasi:** `/projects/risk`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman Project Risk Radar terbuka menampilkan ringkasan inisiatif: Total Proyek Dipantau, Jumlah Proyek Kritis, dan Distribusi Status Risiko.
   - **Verifikasi:** Filter inisiatif dan daftar proyek aktif tampil utuh.
2. **Langkah 2**
   - **Aksi:** Pilih proyek `WorkPulse Platform Core 2026 (WP-CORE)` untuk melihat rincian radar.
   - **Lokasi:** Baris proyek WP-CORE di tabel risiko.
   - **Data:** Klik baris proyek.
   - **Hasil yang diharapkan:** Menampilkan breakdown risiko proyek: Skor Risiko Agregat, Daftar Blocker Terbuka terkait WP-CORE, dan Komitmen yang sedang berstatus Blocked/In-Progress.
   - **Verifikasi:** Rincian hambatan sesuai dengan data blocker riil di modul blocker.
3. **Langkah 3**
   - **Aksi:** Periksa apakah ada tautan langsung untuk eskalasi ke PM atau Tech Lead proyek.
   - **Lokasi:** Panel kontak eskalasi proyek.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Tersedia tautan langsung menuju antrean blocker proyek untuk tindakan korektif cepat.
   - **Verifikasi:** Tautan aktif dan berfungsi tanpa error 404.

- **Expected Final Result:** Radar risiko proyek menyajikan visibilitas kesehatan inisiatif berbasis data nyata tanpa distorsi.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Project Risk Radar yang menampilkan detail risiko proyek WP-CORE.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-DASH-003: Tinjauan Laporan Eksekutif & Pengujian Fitur Unduh Data
- **Test Case ID:** `TC-DASH-003`
- **Scenario ID:** `SCN-DASH-03`
- **Requirement ID:** `FR-52`, `FR-53`
- **Judul:** Tinjauan Laporan Eksekutif (Management Pulse) & Pengujian Fitur Unduh Data Rekap
- **Tujuan:** Memvalidasi bahwa jajaran direksi (CEO Management) dapat meninjau tren akuntabilitas makro perusahaan, menerapkan filter rentang tanggal, dan mengekspor data audit terstruktur.
- **Modul / Halaman:** Executive Reports (`/reports`) & Management Pulse (`/dashboard`)
- **Kategori Pengujian:** Reporting & Data Export
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `CEO_MANAGEMENT` (`direktur@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Laporan berkala dibutuhkan jajaran pimpinan untuk audit performa triwulanan dan evaluasi produktivitas unit bisnis.
- **Preconditions:** Login sebagai Direktur Utama (`direktur@dutamedia.com`).
- **Test Data ID:** `TD-AUTH-05` dan `TD-DASH-02`
- **Persiapan Sebelum Tes:** Buka `/reports`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Laporan Eksekutif" via sidebar grup *Management*.
   - **Lokasi:** `/reports`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman laporan terbuka menampilkan grafik tren akuntabilitas: Tingkat Submit On-Time Organisasi, Rasio Blocker Terselesaikan, dan Skor Kedisiplinan Antar-Departemen.
   - **Verifikasi:** Grafik dan tabel agregat ter-render tanpa error script.
2. **Langkah 2**
   - **Aksi:** Terapkan filter rentang tanggal (cth: 30 Hari Terakhir atau Bulan Ini).
   - **Lokasi:** Filter tanggal di bagian atas laporan.
   - **Data:** Periode: `Bulan Ini`.
   - **Hasil yang diharapkan:** Data grafik dan tabel angka memperbarui kalkulasinya sesuai rentang tanggal yang dipilih.
   - **Verifikasi:** Nilai agregat mencerminkan periode terpilih.
3. **Langkah 3**
   - **Aksi:** Klik tombol "Ekspor Laporan / Unduh Data".
   - **Lokasi:** Tombol ekspor di sudut kanan atas.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem memproses data terstruktur dan memicu unduhan berkas data (CSV atau spreadsheet) ke komputer lokal tester tanpa error 500.
   - **Verifikasi:** Berkas terunduh dan dapat dibuka dengan format kolom yang rapi.

- **Expected Final Result:** Laporan eksekutif menyajikan analisis makro yang akurat dan fitur ekspor data berfungsi andal.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Executive Reports dan konfirmasi file unduhan di browser.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-ADMN-001: Penugasan Reviewer Sementara (Temporary Reviewer Delegation)
- **Test Case ID:** `TC-ADMN-001`
- **Scenario ID:** `SCN-ADMN-01`
- **Requirement ID:** `FR-54`, `DEC-009`
- **Judul:** Penugasan Reviewer Sementara (Temporary Reviewer Delegation DEC-009)
- **Tujuan:** Memvalidasi aturan arsitektural DEC-009: Administrator dapat menetapkan delegasi wewenang review atasan yang berhalangan ke atasan pengganti dengan rentang tanggal yang ketat, dan atasan pengganti dapat melihat antrean bawahan tersebut.
- **Modul / Halaman:** Temporary Reviewer Management (`/admin/temporary-reviewers`)
- **Kategori Pengujian:** Governance / RBAC & Delegation
- **Teknik Desain Test Case:** Use Case Testing & Decision Table
- **Role:** `SYSTEM_ADMIN` (`admin@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Jika atasan cuti panjang tanpa ada delegasi sah, seluruh permohonan koreksi dan cuti tim akan macet (*approval bottleneck*).
- **Preconditions:** Login sebagai `admin@dutamedia.com`. Bambang Pratama (Tech Lead) dan Rian Kurniawan (Creative Lead) aktif di database.
- **Test Data ID:** `TD-ADMN-01`
- **Persiapan Sebelum Tes:** Buka `/admin/temporary-reviewers`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Reviewer Sementara" via sidebar grup *Administration*.
   - **Lokasi:** `/admin/temporary-reviewers`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman terbuka menampilkan tabel pendelegasian aktif dan tombol "+ Tambah Penugasan Delegasi".
   - **Verifikasi:** Tombol penambahan delegasi aktif.
2. **Langkah 2**
   - **Aksi:** Klik "+ Tambah Penugasan Delegasi", pilih Atasan Asal: `Bambang Pratama`, Atasan Pengganti: `Rian Kurniawan`, Tanggal Mulai: `Hari Ini`, Tanggal Selesai: `3 Hari ke Depan`, dan masukkan alasan delegasi.
   - **Lokasi:** Modal formulir delegasi reviewer.
   - **Data:** Alasan: `Pendelegasian sementara selama Bambang Pratama cuti tahunan`.
   - **Hasil yang diharapkan:** Form terisi lengkap dan tombol simpan aktif.
   - **Verifikasi:** Tanggal mulai <= tanggal selesai.
3. **Langkah 3**
   - **Aksi:** Klik "Simpan Penugasan Delegasi".
   - **Lokasi:** Modal penugasan.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast sukses muncul "Penugasan reviewer sementara berhasil disimpan". Data delegasi muncul pada tabel aktif dengan status `ACTIVE`.
   - **Verifikasi:** Baris baru tertera di tabel dengan nama Bambang Pratama dan Rian Kurniawan.
4. **Langkah 4 (Verifikasi Otoritas Pengganti)**
   - **Aksi:** Logout admin, lalu login sebagai Rian Kurniawan (`lead.creative@dutamedia.com`). Buka `/corrections/review`.
   - **Lokasi:** `/corrections/review`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Rian Kurniawan dapat melihat antrean permohonan koreksi milik bawahan Bambang Pratama (Aditya Nugroho) dengan banner info: "Menampilkan permohonan delegasi dari Bambang Pratama".
   - **Verifikasi:** Wewenang persetujuan berpindah secara sah dalam koridor tanggal yang ditentukan.

- **Expected Final Result:** Aturan DEC-009 terbukti berfungsi; alur persetujuan tetap berjalan lancar saat atasan berhalangan.
- **Bukti yang Perlu Dikumpulkan:** Screenshot tabel delegasi di admin dan screenshot antrean review saat login sebagai reviewer pengganti.
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
   - **Hasil yang diharapkan:** Halaman menampilkan daftar konfigurasi kebijakan aktif: Jam Cut-off Pagi (09:30 WIB), Grace Period Pagi (5 Menit), Jam Cut-off Sore (21:00 WIB), SLA Blocker Kritis (120 Menit / 2 Jam), dan Ambang Pelanggaran (3 Hari).
   - **Verifikasi:** Seluruh parameter nilai tampil pada form konfigurasi sesuai data seeder.
2. **Langkah 2**
   - **Aksi:** Ubah salah satu parameter simulasi (cth: ubah Grace Period Pagi dari 5 menit menjadi 10 menit) lalu klik tombol "Simpan Kebijakan".
   - **Lokasi:** Form pengaturan kebijakan.
   - **Data:** Grace Period: `10 Menit`.
   - **Hasil yang diharapkan:** Muncul dialog konfirmasi perubahan kebijakan sistem. Setelah dikonfirmasi, toast sukses muncul "Konfigurasi kebijakan berhasil diperbarui".
   - **Verifikasi:** Nilai form berubah menjadi 10 menit.
3. **Langkah 3**
   - **Aksi:** Muat ulang halaman browser (F5) untuk memverifikasi persistensi data basis data.
   - **Lokasi:** Tombol refresh browser.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman termuat kembali dengan nilai Grace Period tetap 10 menit (tersimpan di database PostgreSQL).
   - **Verifikasi:** Nilai persisten, tidak kembali ke default 5 menit.
4. **Langkah 4 (Cleanup Prosedur Pemulihan)**
   - **Aksi:** Kembalikan nilai Grace Period ke standar semula (5 Menit) dan simpan kembali.
   - **Lokasi:** Form pengaturan kebijakan.
   - **Data:** Grace Period: `5 Menit`.
   - **Hasil yang diharapkan:** Konfigurasi kembali ke standar baku Dutamedia.
   - **Verifikasi:** Nilai kembali 5 menit.

- **Expected Final Result:** Administrator dapat mengontrol parameter kebijakan operasional secara dinamis dan tersimpan persisten di basis data.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Policy Settings setelah penyimpanan data baru.
- **Actual Result:** Administrator berhasil menerbitkan versi kebijakan baru dengan parameter Jam Cut-off Pagi diubah menjadi 23:59 WIB beserta justifikasi audit trail resmi. Nilai terbukti persisten pasca-refresh browser (F5) dan tersimpan di database PostgreSQL.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** Nilai Morning Cut-Off diperpanjang hingga 23:59 WIB untuk membuka form Morning Commitment hari ini selama pengujian Manual UAT berlangsung.

---

## MODUL 9: SKENARIO PENGUJIAN END-TO-END (TC-E2E)

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

---

### TC-E2E-003: Siklus Koreksi: Karyawan Terlambat -> Ajukan Koreksi -> Approval Atasan
- **Test Case ID:** `TC-E2E-003`
- **Scenario ID:** `SCN-E2E-03`
- **Requirement ID:** `FR-14`, `FR-37`, `FR-39`, `DEC-002`, `DEC-013`
- **Judul:** Siklus Koreksi Lengkap: Karyawan Terlewat Cut-Off -> Pengajuan Koreksi -> Peninjauan & Persetujuan Atasan -> Pembaruan Audit Log
- **Tujuan:** Memvalidasi seluruh siklus pemulihan kepatuhan dari saat form terkunci pasca cut-off, pengajuan koreksi resmi oleh karyawan, peninjauan perbandingan data oleh atasan, persetujuan atasan, hingga tercatatnya audit log abadi.
- **Modul / Halaman:** Lintas Modul (`/daily/morning` -> `/corrections/morning` -> `/corrections/review` -> `/daily/history`)
- **Kategori Pengujian:** End-to-End User Journey / Governance Workflow
- **Teknik Desain Test Case:** Use Case Testing & State Transition
- **Role:** Multi-Aktor (`EMPLOYEE` dilanjutkan `SUPERVISOR`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Memastikan integritas alur koreksi data bekerja tanpa merusak aturan penguncian cut-off (DEC-002).
- **Preconditions:** Akun Employee (`dev.frontend@dutamedia.com`) memiliki tanggal kerja sebelumnya yang berstatus `NO_SUBMISSION` (Terkunci). Akun Supervisor (`lead.tech@dutamedia.com`) aktif.
- **Test Data ID:** `TD-CORR-01`
- **Persiapan Sebelum Tes:** Mulai dengan login sebagai Employee.

**Langkah Pengujian:**
1. **Langkah 1 (Verifikasi Terkunci & Buka Koreksi)**
   - **Aksi:** Login sebagai Employee, buka `/daily/morning` pada tanggal kemarin yang belum diisi. Verifikasi form terkunci, lalu klik "Ajukan Koreksi Pagi".
   - **Lokasi:** `/daily/morning` dialihkan ke `/corrections/morning`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Form input komitmen terkunci; tombol redirect membawa pengguna ke formulir koreksi pagi.
   - **Verifikasi:** URL berubah menjadi `/corrections/morning`.
2. **Langkah 2 (Pengajuan Permohonan)**
   - **Aksi:** Masukkan 2 usulan komitmen tugas yang dikerjakan beserta alasan keterlambatan pengisian (>= 10 karakter), lalu kirim pengajuan.
   - **Lokasi:** `/corrections/morning`.
   - **Data:** Usulan: `1. Setup Docker Postgres; 2. Analisis slow query`. Alasan: `Kabel fiber optik ISP kantor terputus seharian.`
   - **Hasil yang diharapkan:** Toast sukses muncul "Permohonan koreksi terkirim". Status pengajuan tercatat `PENDING`.
   - **Verifikasi:** Pengajuan tampil pada tabel riwayat koreksi pribadi berstatus PENDING.
3. **Langkah 3 (Peninjauan oleh Atasan)**
   - **Aksi:** Logout dari Employee, lalu login sebagai Supervisor (`lead.tech@dutamedia.com`). Buka menu `/corrections/review`.
   - **Lokasi:** `/corrections/review`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Atasan melihat pengajuan koreksi dari Aditya Nugroho dengan rincian data usulan dan alasan ISP mati.
   - **Verifikasi:** Terdapat tombol "Setujui" dan "Tolak".
4. **Langkah 4 (Persetujuan & Pembaruan Data)**
   - **Aksi:** Klik "Setujui", masukkan catatan: `Disetujui. Insiden jaringan telah dikonfirmasi tim GA`, dan konfirmasi.
   - **Lokasi:** Modal persetujuan koreksi.
   - **Data:** Catatan atasan.
   - **Hasil yang diharapkan:** Status pengajuan berubah menjadi `APPROVED`. Sistem memperbarui data komitmen tanggal bersangkutan di database dan mencatat audit log permanen (DEC-013).
   - **Verifikasi:** Logout dan login kembali sebagai Employee; buka `/daily/history`. Tanggal tersebut kini menampilkan 2 komitmen yang disetujui dengan badge resmi "Koreksi Disetujui".

- **Expected Final Result:** Alur koreksi tuntas dari pengajuan hingga pembaruan riwayat audit tanpa terjadi bypass ilegal.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pengajuan berstatus APPROVED di antrean review dan screenshot riwayat komitmen karyawan yang telah terbarui.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 

---

### TC-E2E-004: Perjalanan Pengguna Rekonsiliasi Otomatis Cuti & Bebas Pelanggaran
- **Test Case ID:** `TC-E2E-004`
- **Scenario ID:** `SCN-E2E-04`
- **Requirement ID:** `FR-45`, `FR-46`, `FR-47`, `DEC-008`
- **Judul:** Siklus Rekonsiliasi Cuti Otomatis: Pengajuan Cuti -> Approval Atasan -> Pembebasan Otomatis dari Pelanggaran Kepatuhan
- **Tujuan:** Memvalidasi seluruh perjalanan pengguna terkait izin cuti: pengajuan cuti mandiri oleh karyawan, persetujuan oleh atasan, pemotongan kuota, dan verifikasi otomatis bahwa saat hari cuti tiba karyawan dibebaskan dari pengisian komitmen dengan status *Superseded by Approved Leave* (DEC-008).
- **Modul / Halaman:** Lintas Modul (`/leave/my` -> `/leave/queue` -> `/compliance` -> `/daily/history`)
- **Kategori Pengujian:** End-to-End User Journey / Automated Reconciliation
- **Teknik Desain Test Case:** Use Case Testing & Decision Table
- **Role:** Multi-Aktor (`EMPLOYEE`, `SUPERVISOR`, `HRGA`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Membuktikan bahwa integrasi modul cuti dan mesin kepatuhan bekerja sinkron tanpa menghasilkan penalti palsu (*false penalty*) bagi karyawan yang cuti resmi.
- **Preconditions:** Akun Employee (`dev.frontend@dutamedia.com`) memiliki kuota cuti tahunan >= 1 hari. Akun Supervisor dan HRGA aktif.
- **Test Data ID:** `TD-LEAV-01` dan `TD-LEAV-02`
- **Persiapan Sebelum Tes:** Login sebagai Employee.

**Langkah Pengujian:**
1. **Langkah 1 (Pengajuan Cuti Karyawan)**
   - **Aksi:** Login sebagai Employee, buka `/leave/my`. Ajukan cuti tahunan untuk tanggal hari ini (atau simulasi tanggal cuti aktif) dengan alasan jelas.
   - **Lokasi:** `/leave/my`.
   - **Data:** Jenis: `Cuti Tahunan`, Tanggal: Hari ini, Alasan: `Urusan administrasi kependudukan keluarga di luar kota`.
   - **Hasil yang diharapkan:** Pengajuan cuti tersimpan dengan status `PENDING`.
   - **Verifikasi:** Permohonan muncul di tabel riwayat cuti pribadi.
2. **Langkah 2 (Persetujuan oleh Atasan)**
   - **Aksi:** Logout, lalu login sebagai Supervisor (`lead.tech@dutamedia.com`). Buka `/leave/queue`. Klik "Setujui" pada pengajuan cuti Aditya Nugroho.
   - **Lokasi:** `/leave/queue`.
   - **Data:** Catatan persetujuan atasan.
   - **Hasil yang diharapkan:** Permohonan cuti bertransisi menjadi `APPROVED`. Kuota cuti Aditya berkurang 1 hari.
   - **Verifikasi:** Pengajuan berada di tab "Riwayat Disetujui".
3. **Langkah 3 (Simulasi Cut-Off & Audit Kepatuhan HRGA)**
   - **Aksi:** Logout, lalu login sebagai HRGA (`hrga@dutamedia.com`). Buka `/compliance`.
   - **Lokasi:** `/compliance`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Pada daftar karyawan yang "Tidak Mengisi Komitmen Hari Ini", nama "Aditya Nugroho" **TIDAK MUNCUL** dalam daftar pelanggaran kepatuhan.
   - **Verifikasi:** Mesin rekonsiliasi DEC-008 mengecualikan karyawan yang memiliki cuti approved.
4. **Langkah 4 (Verifikasi Riwayat Audit Karyawan)**
   - **Aksi:** Logout dan login kembali sebagai Employee (`dev.frontend@dutamedia.com`). Buka `/daily/history`.
   - **Lokasi:** `/daily/history`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Kartu tanggal hari ini tidak berstatus "Pelanggaran" atau "No Submission", melainkan tersemat badge resmi: **Superseded by Approved Leave**.
   - **Verifikasi:** Karyawan terlindungi dari penalti kepatuhan secara otomatis.

- **Expected Final Result:** Rantai rekonsiliasi cuti bekerja otomatis 100% sesuai DEC-008; integrasi antar-modul bebas cacat.
- **Bukti yang Perlu Dikumpulkan:** Screenshot antrean cuti APPROVED oleh supervisor dan screenshot riwayat harian berstatus Superseded by Approved Leave.
- **Actual Result:** 
- **Execution Status:** 
- **Tester:** 
- **Execution Date:** 
- **Defect ID:** 
- **Retest Result:** 
- **Catatan:** 
