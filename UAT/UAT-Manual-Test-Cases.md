# WorkPulse — Manual UAT Test Cases Specification (Master Suite — 42 Test Cases)

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 2.1.0 (Evolved Master Suite — v1.1.0-uat-pkg)  
> **Target Penguji Manual:** Harry (Acceptance Owner)  
> **Format Standar:** Sesuai Phase 7 Master Prompt (Field Eksekusi Wajib Kosong)  
> **Tanggal Audit Remediasi:** 04 November 2026 (Phase 4 Package Evolution)  
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
   - **Hasil yang diharapkan:** Sistem mendeteksi status belum login dan secara otomatis me-redirect browser ke rute `/login`. Halaman login menampilkan panel hero hijau di sisi kiri dengan tagline: *"Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur."*, serta 3 poin fitur dengan ikon vektor SVG terstandarisasi. Formulir login di kanan tampil bersih dengan headline *"Masuk ke Workspace Akuntabilitas"*, badge versi sistem dinamis `v1.0.0-rc1`, indikator lingkungan `Internal Workspace Environment`, input email, input password, tombol "Masuk ke Sistem", dan tautan bantuan *"Kendala akses akun? Hubungi Admin System atau Tim HRGA."*.
   - **Verifikasi:** Periksa URL di browser adalah `http://localhost:5173/login`. Tidak ada error 404 atau teks build teknis yang bocor.
2. **Langkah 2**
   - **Aksi:** Masukkan email terdaftar dan kata sandi valid, lalu klik tombol "Masuk ke Sistem".
   - **Lokasi:** Halaman `/login` pada field Email (`#email-input`) dan Password (`#password-input`).
   - **Data:** Email: `dev.frontend@dutamedia.com`, Password: `Password123!`
   - **Hasil yang diharapkan:** Tombol login menampilkan animasi loading singkat, toast sukses "Login berhasil" muncul, dan aplikasi mengarahkan browser ke rute kanonikal Employee: `/daily/morning`.
   - **Verifikasi:** Periksa bahwa URL aktif adalah `/daily/morning`. Sidebar permanen 232px tampil di sisi kiri dengan brand caption "Dutamedia" yang ringkas dan menu terpadu "My Today". Di bagian footer sidebar (`.side-bottom`), tertera nama bersih "Aditya Nugroho" (tanpa tanda kurung peran). Topbar atas menampilkan avatar profil inisial "AN" dan ikon lonceng notifikasi terpadu.
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
3. **Langkah 3 (Verifikasi Proteksi Brute-Force & Rate Limiting - IMP-013)**
   - **Aksi:** Masukkan password salah sebanyak 5 kali berturut-turut pada akun yang sama.
   - **Lokasi:** Form login `/login`.
   - **Data:** Password: `SalahPassword999` (5x submit).
   - **Hasil yang diharapkan:** Pada kegagalan ke-5, form terkunci sementara (*lockout* 15 menit), tombol submit menjadi disabled, dan banner peringatan muncul dengan timer hitung mundur: "Akun dikunci sementara demi keamanan. Coba lagi dalam XXm XXd.".
   - **Verifikasi:** Tombol "Masuk ke Sistem" tidak dapat diklik selama timer berjalan.

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
- **Actual Result:** Halaman /profile berhasil diverifikasi: identitas resmi (Nama Aditya Nugroho, Email dev.frontend@dutamedia.com, Role EMPLOYEE, Status ACTIVE, User ID) terverifikasi tampil; kotak prompt hint pratinjau dieliminasi dari profil (Opsi A) agar halaman fokus pada identitas dan keamanan, catatan tata kelola dirapikan ke bahasa Indonesia resmi, dan bimbingan komitmen dipindahkan ke placeholder form Morning Commitment sesuai PRD v1.6 FR-12.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-10-30
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi eliminasi prompt-hint-box dari profil (CR-008), perapian catatan tata kelola, dan implementasi placeholder responsif peran komitmen pagi (PRD v1.6 FR-12).

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

### TC-AUTH-009: Penolakan Login Akun Pengguna Dinonaktifkan (Status INACTIVE)
- **Test Case ID:** `TC-AUTH-009`
- **Scenario ID:** `SCN-AUTH-09`
- **Requirement ID:** `FR-01`, `DEC-012`
- **Judul:** Penolakan Login Akun Pengguna Dinonaktifkan (Status INACTIVE)
- **Tujuan:** Memastikan pengguna dengan status akun INACTIVE (dinonaktifkan oleh administrator/HRGA) ditolak masuk ke dalam sistem dengan pesan penolakan yang ramah, informatif, dan tanpa kebocoran sesi JWT.
- **Modul / Halaman:** Halaman Login (`/login`)
- **Kategori Pengujian:** Negative Testing / Security / User Lifecycle
- **Teknik Desain Test Case:** Equivalence Partitioning & State Transition Testing
- **Role:** Pengguna Dinonaktifkan (`INACTIVE`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Kegagalan memblokir akun nonaktif membuka risiko akses ilegal oleh mantan karyawan atau akun yang disuspend.
- **Preconditions:** Server backend dan frontend aktif. Terdapat akun pengguna yang statusnya diubah menjadi `INACTIVE` di database atau via Admin Users (`inactive.user@dutamedia.com`).
- **Test Data ID:** `TD-AUTH-12` (`inactive.user@dutamedia.com` / `Password123!`)
- **Persiapan Sebelum Tes:** Buka halaman `/login` pada peramban private/incognito.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Masukkan alamat email akun berstatus INACTIVE dan kata sandi valid pada formulir login.
   - **Lokasi:** Halaman `/login` pada field Email dan Password.
   - **Data:** Email: `inactive.user@dutamedia.com`, Password: `Password123!`
   - **Hasil yang diharapkan:** Form login menerima input dengan aman.
   - **Verifikasi:** Karakter kata sandi tersamarkan (type="password").
2. **Langkah 2**
   - **Aksi:** Klik tombol "Masuk ke Sistem".
   - **Lokasi:** Tombol submit login (`#login-submit-btn`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem menolak autentikasi dengan status HTTP 401 Unauthorized. Muncul alert peringatan berwarna merah/amber dengan pesan spesifik: *"Akun Anda dinonaktifkan oleh administrator. Hubungi HRGA untuk informasi lebih lanjut."* Aplikasi tetap bertahan di halaman `/login` dan tidak ada sesi atau cookie JWT yang diterbitkan.
   - **Verifikasi:** URL peramban tetap `/login`. Local storage dan application cookies tidak memuat access token aktif.

- **Expected Final Result:** Pengguna dinonaktifkan secara mutlak diblokir dari akses sistem dan diberikan pesan instruksi kontak HRGA yang jelas.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar formulir login dengan pesan penolakan status akun dinonaktifkan.
- **Actual Result:** Pengguna akun berstatus INACTIVE (calon.karyawan@dutamedia.com) yang mencoba login ditolak secara tegas oleh backend dengan HTTP 401 dan antarmuka menampilkan pesan peringatan ramah 'Akun Anda dinonaktifkan oleh administrator. Hubungi HRGA untuk informasi lebih lanjut.' tanpa kebocoran sesi JWT.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-05
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi penonaktifan akun via admin dan penolakan login status INACTIVE sesuai FR-01 & DEC-012.

---

### TC-AUTH-010: Penolakan Login Akun Pengguna Belum Diaktivasi (Status INVITED)
- **Test Case ID:** `TC-AUTH-010`
- **Scenario ID:** `SCN-AUTH-10`
- **Requirement ID:** `FR-01`, `FR-02`, `DEC-012`
- **Judul:** Penolakan Login Akun Pengguna Belum Diaktivasi (Status INVITED)
- **Tujuan:** Memvalidasi bahwa pengguna yang baru diundang dan belum menyelesaikan aktivasi kata sandi tidak dapat langsung masuk melalui form login standar.
- **Modul / Halaman:** Halaman Login (`/login`)
- **Kategori Pengujian:** Negative Testing / Lifecycle State Verification
- **Teknik Desain Test Case:** Equivalence Partitioning & State Transition
- **Role:** Pengguna Diundang (`INVITED` / `calon.karyawan@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Akses akun sebelum pembuatan kredensial pribadi merusak rantai akuntabilitas identitas pengguna.
- **Preconditions:** Akun `calon.karyawan@dutamedia.com` berstatus `INVITED` di database seeder.
- **Test Data ID:** `TD-AUTH-13` (`calon.karyawan@dutamedia.com` / `Password123!`)
- **Persiapan Sebelum Tes:** Pastikan akun belum pernah diaktivasi melalui rute `/activate`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman `/login` dan masukkan email `calon.karyawan@dutamedia.com` beserta kata sandi sembarang.
   - **Lokasi:** Formulir login `/login`.
   - **Data:** Email: `calon.karyawan@dutamedia.com`, Password: `Password123!`
   - **Hasil yang diharapkan:** Nilai email dan sandi terisi pada input field.
   - **Verifikasi:** Tidak ada error validasi format email sebelum tombol submit ditekan.
2. **Langkah 2**
   - **Aksi:** Klik tombol "Masuk ke Sistem".
   - **Lokasi:** Tombol submit login.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Backend mengembalikan status HTTP 401 dengan error code `AUTH_UNAUTHENTICATED`. Muncul pesan informatif pada antarmuka: *"Akun Anda belum diaktifkan. Silakan periksa tautan aktivasi pada email Anda atau hubungi administrator."* Tidak ada sesi yang terbentuk.
   - **Verifikasi:** URL tetap `/login`, input password dikosongkan demi keamanan, dan pengguna tidak dialihkan ke rute internal apapun.

- **Expected Final Result:** Pengguna berstatus INVITED dipandu untuk melakukan aktivasi melalui email dan dicegah masuk ke sistem secara prematur.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar formulir login dengan pesan peringatan akun belum diaktifkan.
- **Actual Result:** Pengguna akun berstatus INVITED (karyawan.baru@dutamedia.com) yang mencoba login ditolak secara tegas oleh backend dengan HTTP 401 dan antarmuka menampilkan pesan peringatan ramah 'Akun Anda belum diaktifkan. Silakan periksa tautan aktivasi pada email Anda atau hubungi administrator.' tanpa kebocoran sesi JWT.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-05
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi penerbitan undangan baru via admin dan penolakan login status INVITED sesuai FR-01, FR-02 & DEC-012.

---

## MODUL 2: DAILY ACCOUNTABILITY — MORNING COMMITMENT (TC-DLYM)

---

### TC-DLYM-001: Pengisian 1 s.d. 3 Komitmen Pagi Tepat Waktu (On-Time)
- **Test Case ID:** `TC-DLYM-001`
- **Scenario ID:** `SCN-DLYM-01`
- **Requirement ID:** `FR-09`, `FR-13`, `FR-16`, `DEC-001`, `DEC-004`, `CR-013`
- **Judul:** Pengisian 1 s.d. 3 Komitmen Pagi Tepat Waktu (On-Time Submission) dengan Pemilih Proyek & Blocker Aktif Opsional
- **Tujuan:** Memvalidasi bahwa karyawan dapat mengisi komitmen harian (1 hingga batas 3 komitmen) lengkap dengan pemilih proyek opsional (`Proyek Terkait (Opsional)`), tombol pemilih cepat `Pilih Blocker Aktif` pada tautan referensi, serta tingkat risiko awal sebelum jam cut-off pagi, dan mendapatkan badge status *On-Time* dengan formulir yang langsung terkunci pasca-submit.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Happy Path / Boundary Value Analysis
- **Teknik Desain Test Case:** Boundary Value Analysis (1, 2, 3 items) & Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Merupakan proses bisnis paling inti yang dilakukan seluruh karyawan Dutamedia setiap pagi dan menjadi sumber pengaitan komitmen ke proyek (`scope=team`) pada Pulse Dashboard.
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Hari kerja aktif sebelum jam cut-off pagi.
- **Test Data ID:** `TD-DLYM-01` dan `TD-DLYM-02`
- **Persiapan Sebelum Tes:** Pastikan belum ada komitmen yang disubmit untuk tanggal hari ini.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Morning Commitment via sidebar.
   - **Lokasi:** Menu "Komitmen Pagi" (`/daily/morning`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman terbuka dengan header tanggal hari ini, indikator waktu pengisian, dan kartu formulir komitmen item ke-1. Pada setiap slot komitmen tampil: textarea `Teks Komitmen Terukur *`, dropdown `Proyek Terkait (Opsional)`, field `Tautan Dokumen / PR / Tiket (Opsional)` berdampingan dengan tombol inline `Pilih Blocker Aktif`, serta pilihan `Tingkat Risiko Awal & Potensi Kendala *` (`GREEN`, `AMBER`, `RED`).
   - **Verifikasi:** Terdapat tombol "+ Tambah Slot", checkbox opsi 0 komitmen, tombol "Kirim Morning Commitment", panel konteks waktu dengan badge tanggal dinamis Indonesia, dan tombol "Laporkan Blocker" di sisi kanan workflow bar (IMP-016, IMP-027, CR-013). Tidak ada overflow horizontal pada grup input tautan dan tombol `Pilih Blocker Aktif`.
2. **Langkah 2**
   - **Aksi:** Isi komitmen pertama: masukkan teks komitmen terukur, pilih proyek dari dropdown `Proyek Terkait (Opsional)`, dan klik tombol `Pilih Blocker Aktif` di samping input tautan untuk melihat daftar blocker aktif (atau isi tautan PR/tiket secara manual).
   - **Lokasi:** Form Komitmen Slot #1.
   - **Data:** Teks: `Menyelesaikan migrasi VAPID Push Notification`, Proyek: `[PRJ-CORE] Core Banking Settlement Engine` (atau proyek aktif yang tersedia), Risiko: `GREEN`.
   - **Hasil yang diharapkan:** Dropdown proyek menampilkan opsi `-- Non-Proyek / Operasional Rutin --` beserta daftar proyek resmi dengan posisi panah dropdown (chevron) yang proporsional. Saat tombol `Pilih Blocker Aktif` diklik, muncul popover daftar blocker aktif (atau info tidak ada blocker aktif) tanpa merusak lebar kolom. Jika blocker dipilih, field tautan otomatis terisi `#BLK-XXXXXX` dan dropdown proyek otomatis menyesuaikan proyek blocker terkait.
   - **Verifikasi:** Teks komitmen, dropdown proyek (`projectCode`), dan tautan referensi/blocker (`linkedBlockerId`) terpilih sesuai data.
3. **Langkah 3**
   - **Aksi:** Klik tombol "+ Tambah Slot" untuk membuat item ke-2 dan item ke-3.
   - **Lokasi:** Tombol di header daftar komitmen.
   - **Data:** Item 2: `Code review PR modul leave approval` (Proyek: `[PRJ-PORTAL]`); Item 3: `Unit test coverage router guard` (Proyek: `-- Non-Proyek / Operasional Rutin --`).
   - **Hasil yang diharapkan:** Kartu komitmen ke-2 dan ke-3 muncul. Setelah mencapai tepat 3 item, tombol "+ Tambah Slot" dinonaktifkan (DEC-004: batas maksimal 3 komitmen).
   - **Verifikasi:** Jumlah total kartu komitmen adalah tepat 3. Tidak dapat menambah item ke-4.
4. **Langkah 4**
   - **Aksi:** Klik tombol "Kirim Morning Commitment".
   - **Lokasi:** Tombol aksi utama di bagian bawah form.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Pengiriman diproses, banner sukses hijau tampil, dan formulir beralih ke state terkunci (read-only) berstatus **ON_TIME**.
   - **Verifikasi:** Lakukan refresh browser (F5). Ketiga komitmen beserta pilihan proyek dan tautan referensi tetap tampil utuh dalam kondisi terkunci.

- **Expected Final Result:** 3 Komitmen beserta metadata proyek (`projectCode`) dan blocker (`linkedBlockerId`) berhasil disimpan di database, status waktu tercatat *On-Time*, form terkunci, dan data persisten saat reload.
- **Bukti yang Perlu Dikumpulkan:** Screenshot ringkasan komitmen pagi yang memuat 3 item, pilihan proyek/blocker, dan badge On-Time.
- **Actual Result:** Pengiriman 3 komitmen berhasil diproses sistem (toast hijau muncul, banner Baseline Locked tampil, dan form terkunci read-only). Lakukan refresh browser (F5): data 3 komitmen, pilihan proyek, dan tingkat risiko tetap tersimpan utuh dan terkunci persisten. Tampilan pasca-submit telah ditingkatkan dari sekadar form disabled menjadi Mode Kartu Ringkasan Resmi (Executive Read-Only Summary Cards) tanpa elemen input form sehingga bersih dan tidak memberi impresi meminta isian lagi.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-06
- **Defect ID:** DEF-001 (Resolved & Verified)
- **Retest Result:** Pass
- **Catatan:** Lolos verifikasi Cycle 2. DEF-001 dan CR-013 tuntas. Form pasca-submit bertransformasi menjadi dedicated Read-Only Summary Cards.

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
- **Actual Result:** Terverifikasi 100% pada staging production oleh Harry pada 05 November 2026 menggunakan akun dev.backend@dutamedia.com. Checkbox 0 komitmen memunculkan textarea alasan; submit kosong dan submit teks pendek (< 10 karakter) ditolak validasi; pengisian alasan valid >= 10 karakter ('Mengikuti workshop PostgreSQL indexing seharian') berhasil disubmit, form terkunci, dan layar menampilkan ringkasan status NOT_APPLICABLE - NO_COMMITMENT.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-05
- **Defect ID:** -
- **Retest Result:** Pass
- **Catatan:** Aturan anti-bypass DEC-004 terverifikasi ketat.

---

### TC-DLYM-003: Penandaan Indikasi Hambatan Dini pada Komitmen Pagi
- **Test Case ID:** `TC-DLYM-003`
- **Scenario ID:** `SCN-DLYM-03`
- **Requirement ID:** `FR-11`, `CR-013`
- **Judul:** Penandaan Indikasi Hambatan Dini pada Komitmen Pagi (Early Blocker Flag & Penautan Blocker Menghambat)
- **Tujuan:** Memvalidasi bahwa karyawan dapat menandai potensi kendala/blocker sejak pagi hari (`AMBER` atau `RED`) pada item komitmen tertentu, menautkan blocker aktif yang menghambat tugas tersebut (opsional), serta mengisi catatan kendala dini sehingga atasan/Project Lead mendapatkan sinyal peringatan dini pada Pulse Dashboard.
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
   - **Aksi:** Isi komitmen 1: masukkan teks komitmen terukur dan pilih proyek dari dropdown `Proyek Terkait (Opsional)`.
   - **Lokasi:** Kartu komitmen item 1.
   - **Data:** Teks: `Integrasi webhook Brevo email dispatcher`, Proyek: `[PRJ-CORE] Core Banking Settlement Engine` (atau `WP-CORE`).
   - **Hasil yang diharapkan:** Data terinput dengan rapi.
   - **Verifikasi:** Teks komitmen dan proyek terpilih.
2. **Langkah 2**
   - **Aksi:** Pada bagian `Tingkat Risiko Tugas Hari Ini *`, klik kartu **`AMBER`** (Ada Dependensi / Potensi Hambatan) atau **`RED`** (Kritis / Memerlukan Intervensi Atasan).
   - **Lokasi:** Pemilih risiko awal pada kartu komitmen.
   - **Data:** Risiko: `AMBER`.
   - **Hasil yang diharapkan:** Muncul kotak kondisional kuning/merah yang memuat 3 field:
     1. Dropdown **`Tiket Blocker Penyebab (Opsional)`** (`data-testid="hindered-blocker-select-0"`) dengan opsi default `-- Tidak Terkait Tiket Blocker Aktif --` untuk memilih tiket blocker aktif jika hambatan berasal dari tiket blocker yang sudah ada.
     2. Field wajib **`Uraian Resiko atau Potensi Kendala *`**.
     3. Field opsional **`Tindakan / Bantuan yang Diharapkan (Opsional)`**.
   - **Verifikasi:** Ketiga field dalam kotak kondisional terbuka rapi, dan jika memilih salah satu blocker aktif pada dropdown, field uraian resiko atau potensi kendala otomatis terisi deskripsi blocker tersebut (jika sebelumnya kosong).
3. **Langkah 3**
   - **Aksi:** Pilih blocker aktif yang menghambat (jika ada) atau masukkan catatan singkat: `Menunggu credential API Brevo dari GA`, isi bantuan yang diharapkan: `Perlu follow-up ke tim GA`, lalu klik tombol kirim komitmen.
   - **Lokasi:** Formulir komitmen pagi.
   - **Data:** Catatan kendala & bantuan terisi.
   - **Hasil yang diharapkan:** Status awal hari (*Initial Daily Status*) di kartu konteks atas secara reaktif berubah menjadi **`AMBER — Berisiko`** (atau `RED — Terhambat`). Saat dikirim, komitmen tersimpan sukses.
   - **Verifikasi:** Indikasi kendala dini dan penautan blocker tersimpan utuh saat halaman dimuat ulang.

- **Expected Final Result:** Indikasi kendala dini beserta tautan blocker yang menghambat tercatat di database dan memicu penanda visual peringatan pada kartu konteks harian serta Pulse Dashboard.
- **Bukti yang Perlu Dikumpulkan:** Screenshot kartu komitmen dengan kotak kondisional AMBER/RED yang menampilkan dropdown Tiket Blocker Penyebab.
- **Actual Result:** Pemilihan risiko AMBER pada slot Komitmen #1 (Aditya Nugroho) berhasil memunculkan form input potensi kendala dan bantuan yang diharapkan. Status awal hari (Initial Daily Status) di kartu konteks atas secara instan dan reaktif berubah menjadi AMBER — Berisiko. Seluruh catatan kendala dini dan bantuan yang diharapkan tersimpan sukses ke database dan tampil presisi pada Mode Kartu Ringkasan Resmi (Summary Cards) pasca-submit (media_1793947468926_25c5ef16.png, media_1793947478503_74be81cf.jpg).
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-06
- **Defect ID:** 
- **Retest Result:** PASS (Cycle 2 / CR-013 Retest)
- **Catatan:** Lulus penuh pengujian empiris Cycle 2 pasca penyelarasan microcopy dan CR-013. Baseline terkunci rapi pada 13.44 WIB.

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
- **Actual Result:** Tombol 'Lihat Draf' menampilkan hanya komitmen kemarin yang berstatus Continue ('Optimasi query database index dan redis cache clustering') lengkap dengan Catatan Kelanjutan EOD dan badge Carry-Over #1. Tugas kemarin yang sudah Selesai (COMPLETED) terbukti diabaikan sesuai DEC-011. Tombol 'Salin ke Slot' menyalin tugas secara non-destruktif ke Slot #1, mengunci tombol menjadi 'Sudah Tersalin', dan komitmen berhasil disubmit serta terkunci resmi pada pukul 15.38 WIB (Baseline Locked) dengan badge Carry-Over #1, Proyek [PRJ-CORE], dan tautan referensi Jira tersimpan presisi. Bukti: media_1793954307867_2208b015.jpg, media_1793954329120_6e0eba95.png.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-06
- **Defect ID:** -
- **Retest Result:** PASS
- **Catatan:** DEC-011 terbukti berjalan akurat. Fitur salin komitmen kemarin aman dari duplikasi berulang dan mengadopsi proteksi penempatan slot non-destruktif. 

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

### TC-DLYM-007: Pencegahan Duplikasi Komitmen Pagi & Penguncian Atomik Multi-Tab (Resolusi DEF-001)
- **Test Case ID:** `TC-DLYM-007`
- **Scenario ID:** `SCN-DLYM-07`
- **Requirement ID:** `FR-09`, `FR-14`, `DEC-001`, `DEC-008`
- **Judul:** Pencegahan Duplikasi Komitmen Pagi & Penguncian Atomik Multi-Tab (Resolusi DEF-001)
- **Tujuan:** Menguji dan memvalidasi secara tuntas bahwa perbaikan cacat fungsional DEF-001 (penguncian atomik basis data dan penyelesaian konflik two-path) berhasil mencegah duplikasi komitmen pagi ketika form disubmit bersamaan dari 2 tab peramban atau ditekan ganda secara cepat.
- **Modul / Halaman:** Morning Commitment (`/daily/morning`)
- **Kategori Pengujian:** Concurrency / Atomic Lock / Defect Re-Validation (DEF-001)
- **Teknik Desain Test Case:** Race Condition Simulation & Boundary Value Testing
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Duplikasi komitmen harian merusak integritas pelaporan, memicu ketidakakuratan metrik kepatuhan tim, dan membingungkan evaluasi sore EOD.
- **Preconditions:** Jam sebelum cut-off pagi (sebelum 09:30). Form komitmen pagi pengguna belum disubmit hari ini (`morningSubmittedAt: null`). Buka 2 tab peramban berdampingan yang sama-sama membuka halaman `/daily/morning`.
- **Test Data ID:** `TD-DLYM-08` (Tab 1: Komitmen "Integrasi Push Notification VAPID", Tab 2: Komitmen "Refactor Vue Router")
- **Persiapan Sebelum Tes:** Pastikan kedua tab telah memuat formulir komitmen pagi yang masih bersih dan aktif.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Pada Tab 1, masukkan teks komitmen: `Selesaikan integrasi Push Notification VAPID pada Service Worker`. Tentukan risiko `GREEN`.
   - **Lokasi:** Tab 1 peramban pada rute `/daily/morning`.
   - **Data:** Teks: `Selesaikan integrasi Push Notification VAPID pada Service Worker`
   - **Hasil yang diharapkan:** Slot 1 terisi valid.
   - **Verifikasi:** Indikator tombol "Kirim Komitmen Pagi" aktif dan dapat diklik.
2. **Langkah 2**
   - **Aksi:** Pindah ke Tab 2, masukkan teks komitmen berbeda: `Refactoring konfigurasi Vue Router dan Navigation Guards`. Tentukan risiko `GREEN`.
   - **Lokasi:** Tab 2 peramban pada rute `/daily/morning`.
   - **Data:** Teks: `Refactoring konfigurasi Vue Router dan Navigation Guards`
   - **Hasil yang diharapkan:** Slot 1 pada Tab 2 terisi valid.
   - **Verifikasi:** Tombol "Kirim Komitmen Pagi" pada Tab 2 juga aktif.
3. **Langkah 3 (Eksekusi Penyerahan Pertama)**
   - **Aksi:** Klik tombol "Kirim Komitmen Pagi" pada Tab 1.
   - **Lokasi:** Tab 1 formulir komitmen pagi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem memproses penyerahan komitmen. Backend mencatat `morningSubmittedAt` dengan timestamp saat ini dan mengunci record komitmen secara atomik. Muncul toast sukses: "Komitmen pagi berhasil disimpan.", dan antarmuka Tab 1 beralih ke state terkunci dengan banner informasi stempel waktu penyerahan.
   - **Verifikasi:** Pada Tab 1, field input menjadi disabled, tombol submit hilang/tersembunyi, dan muncul tautan "Ajukan Koreksi Komitmen Pagi" jika perubahan diperlukan.
4. **Langkah 4 (Simulasi Pengiriman Bersamaan / Race Condition pada Tab 2)**
   - **Aksi:** Segera pindah ke Tab 2 (tanpa refresh) dan klik tombol "Kirim Komitmen Pagi".
   - **Lokasi:** Tab 2 formulir komitmen pagi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Backend mengevaluasi transaksi atomik dan mendeteksi bahwa `morningSubmittedAt` telah terisi (`morningSubmittedAt !== null`). Permintaan kedua ditolak secara mutlak dengan status HTTP 422 Unprocessable Entity dan kode galat `BUSINESS_RULE_ALREADY_SUBMITTED`. Pesan kesalahan ramah muncul: *"Komitmen pagi untuk tanggal kerja ini sudah diserahkan sebelumnya dan tidak dapat ditimpa langsung."* Antarmuka Tab 2 langsung menyinkronkan state ke status terkunci.
   - **Verifikasi:** Periksa database melalui API `/daily/today`: hanya terdapat 1 record komitmen (dari Tab 1). Tidak ada duplikasi baris atau data korup.

- **Expected Final Result:** Mekanisme atomic locking DEF-001 terbukti 100% kokoh mencegah duplikasi komitmen pagi dari multi-tab maupun klik ganda.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar banner sukses terkunci pada Tab 1 dan tangkapan layar penolakan 422 pada Tab 2.
- **Actual Result:** Concurrency lock DEF-001 terbukti kokoh 100%. Komitmen di Tab 1 berhasil disubmit dan baseline langsung terkunci resmi. Penyerahan kedua dari Tab 2 tanpa refresh halaman langsung ditolak mutlak oleh backend dengan status HTTP 422 BUSINESS_RULE_ALREADY_SUBMITTED dan pesan ramah pengguna: "Morning Commitment hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi." Antarmuka Tab 2 reaktif menyinkronkan state ke status baseline terkunci tanpa duplikasi baris di database.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-06
- **Defect ID:** DEF-001 (Resolved)
- **Retest Result:** PASS
- **Catatan:** Verifikasi tuntas resolusi DEF-001 pasca-remediasi Cycle 1.

---

## MODUL 3: DAILY ACCOUNTABILITY — ADDITIONAL WORK (TC-DLYA)

---

### TC-DLYA-001: Pencatatan Tugas Tambahan Ad-Hoc di Tengah Jam Kerja
- **Test Case ID:** `TC-DLYA-001`
- **Scenario ID:** `SCN-DLYA-01`
- **Requirement ID:** `FR-17`, `FR-18`, `FR-19`, `CR-013`
- **Judul:** Pencatatan Tugas Tambahan Ad-Hoc di Siang Hari (dengan Pemilih Proyek & Blocker Aktif Opsional) & Integrasi ke Rekap EOD
- **Tujuan:** Memastikan karyawan dapat mencatat tugas mendadak di luar rencana pagi hari dengan menyertakan pemberi instruksi, memilih proyek terkait secara opsional (`Proyek Terkait (Opsional)`), memilih blocker aktif melalui tombol `Pilih Blocker Aktif` pada tautan referensi, dan memastikan tugas tersebut otomatis terdaftar pada evaluasi sore (EOD).
- **Modul / Halaman:** Additional Work (`/daily/additional-work`)
- **Kategori Pengujian:** Happy Path / Inter-Module Integration
- **Teknik Desain Test Case:** Use Case Testing
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Tugas mendadak yang tidak tercatat membuat capaian kerja karyawan tidak terukur secara adil di mata manajemen dan Project Lead.
- **Preconditions:** Komitmen pagi sudah diisi dan tersimpan.
- **Test Data ID:** `TD-DLYA-01`
- **Persiapan Sebelum Tes:** Login sebagai Employee dan buka `/daily/additional-work`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka menu "Tugas Tambahan" via sidebar kiri.
   - **Lokasi:** Menu navigasi `/daily/additional-work`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman terbuka menampilkan ringkasan komitmen pagi yang sudah ada (beserta badge proyek jika ada) dan form pencatatan tugas tambahan baru.
   - **Verifikasi:** Terdapat field `Deskripsi Pekerjaan Tambahan *`, pilihan `Alasan Pekerjaan Tambahan *` (dan dropdown `Ditugaskan Oleh (Atasan Langsung/Lead) *` saat memilih `Penugasan Baru dari Atasan`), dropdown `Proyek Terkait (Opsional)`, serta field `Tautan Referensi / Tiket Tugas (Opsional)` yang berdampingan rapi dengan tombol inline `Pilih Blocker Aktif` tanpa overflow horizontal.
2. **Langkah 2**
   - **Aksi:** Isi detail tugas tambahan mendesak dari atasan, pilih proyek dari dropdown `Proyek Terkait (Opsional)`, dan uji klik tombol `Pilih Blocker Aktif` (atau isi tautan referensi).
   - **Lokasi:** Formulir Tugas Tambahan.
   - **Data:** Deskripsi: `Hotfix urgent bug memory leak payment`, Alasan: `Penugasan Baru dari Atasan (NEWLY_ASSIGNED)`, Ditugaskan Oleh: `Bambang Pratama`, Proyek: `[PRJ-CORE] Core Banking Settlement Engine` (opsional), Tautan Referensi / Blocker: pilih dari popover `Pilih Blocker Aktif` atau ketik `#BLK-73C5C7`.
   - **Hasil yang diharapkan:** Seluruh field terisi lengkap dan valid; popover `Pilih Blocker Aktif` tampil proporsional di bawah grup input dan otomatis mengisi kode tiket `#BLK-...` serta menyesuaikan proyek terkait saat dipilih.
   - **Verifikasi:** Field tidak menampilkan indikator error.
3. **Langkah 3**
   - **Aksi:** Klik tombol "+ Simpan Pekerjaan Tambahan".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Toast/banner sukses muncul. Item baru muncul pada daftar riwayat pekerjaan tambahan hari ini lengkap dengan badge alasan, badge proyek (misal `[PRJ-CORE]`), dan tautan referensi/blocker.
   - **Verifikasi:** Item baru tercantum dalam kartu daftar pekerjaan tambahan di halaman tersebut.
4. **Langkah 4**
   - **Aksi:** Navigasi ke menu "Hasil Sore (EOD)" via sidebar.
   - **Lokasi:** Menu `/daily/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman EOD menampilkan daftar tugas yang harus dievaluasi, mencakup komitmen pagi PLUS tugas tambahan yang baru saja dicatat.
   - **Verifikasi:** Total item yang harus dievaluasi bertambah sesuai jumlah tugas tambahan yang diinput.

- **Expected Final Result:** Tugas ad-hoc berhasil dicatat dengan asosiasi instruktur, metadata proyek (`projectCode`), dan tautan blocker (`linkedBlockerId`) yang jelas serta otomatis terintegrasi ke form EOD sore hari.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman Additional Work (memperlihatkan dropdown Proyek Terkait, tombol Pilih Blocker Aktif, dan kartu riwayat ad-hoc) serta screenshot halaman EOD.
- **Actual Result:** Lolos retest Cycle 2 (08 Nov 2026). Tugas tambahan ad-hoc ("Hotfix urgent bug memory leak payment") berhasil dicatat lengkap dengan proyek `[PRJ-CORE]`, atasan penugas `Arif Budiman`, dan referensi blocker aktif `[#BLK-1F1151]`. Kartu tampil rapi di daftar hari ini dengan total 2 pekerjaan tambahan (media_1794123275527_369ed019.png). Integrasi lintas modul ke form EOD sore hari (/daily/eod) terkonfirmasi sempurna: seksi Evaluasi Pekerjaan Tambahan memuat kedua tugas dan metric Total Item Evaluasi otomatis teragregasi menjadi 3 Tugas (1 pagi + 2 tambahan) (media_1794123328209_e71cc20d.png).
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-08
- **Defect ID:** -
- **Retest Result:** PASS
- **Catatan:** Lolos verifikasi penuh Cycle 2 pasca penyesuaian aturan CR-013.

---

### TC-DLYA-002: Validasi Field Wajib Pemberi Instruksi & Opsi Proyek Tugas Ad-Hoc
- **Test Case ID:** `TC-DLYA-002`
- **Scenario ID:** `SCN-DLYA-02`
- **Requirement ID:** `FR-18`, `CR-013`
- **Judul:** Validasi Field Wajib Pemberi Instruksi (`NEWLY_ASSIGNED`) & Fleksibilitas Proyek Opsional Tugas Ad-Hoc
- **Tujuan:** Memastikan karyawan tidak dapat menyimpan tugas tambahan dengan alasan `Penugasan Baru dari Atasan` tanpa memilih siapa yang menginstruksikan tugas tersebut, sekaligus memastikan field `Proyek Terkait (Opsional)` bersifat opsional (mendukung pekerjaan rutin divisi non-proyek maupun pekerjaan proyek).
- **Modul / Halaman:** Additional Work (`/daily/additional-work`)
- **Kategori Pengujian:** Negative Testing / Data Integrity
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Tugas penugasan baru yang tidak jelas pemberi instruksinya memicu distorsi akuntabilitas jam kerja, sementara pemaksaan proyek pada staf divisi non-proyek (misal HRGA/Finance) akan menghambat pencatatan tugas rutin.
- **Preconditions:** Berada di form pencatatan `/daily/additional-work`.
- **Test Data ID:** `TD-DLYA-03`
- **Persiapan Sebelum Tes:** Buka `/daily/additional-work`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Masukkan deskripsi tugas tambahan, pastikan alasan terpilih `Penugasan Baru dari Atasan`, tetapi kosongkan pilihan dropdown `Ditugaskan Oleh (Atasan Langsung/Lead) *`.
   - **Lokasi:** Form tugas tambahan.
   - **Data:** Deskripsi: `Investigasi performa rendering Vue`. Dropdown Ditugaskan Oleh: Kosong (`-- Pilih Nama Atasan / Lead --`).
   - **Hasil yang diharapkan:** Form terisi sebagian.
   - **Verifikasi:** Dropdown penugas berada pada nilai placeholder awal.
2. **Langkah 2**
   - **Aksi:** Klik tombol "+ Simpan Pekerjaan Tambahan".
   - **Lokasi:** Tombol submit.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Sistem memblokir penyimpanan karena atasan penugas wajib dipilih untuk kategori `Penugasan Baru dari Atasan`.
   - **Verifikasi:** Tidak ada penambahan data ke daftar tugas.
3. **Langkah 3**
   - **Aksi:** Pilih instruktur yang valid (`Bambang Pratama`), biarkan `Proyek Terkait (Opsional)` pada opsi default `-- Non-Proyek / Operasional Rutin --` (atau pilih proyek `[PRJ-CORE]`), lalu klik simpan kembali.
   - **Lokasi:** Form tugas tambahan.
   - **Data:** Instruktur: `Bambang Pratama`, Proyek: Opsional (`-- Non-Proyek / Operasional Rutin --` atau `[PRJ-CORE]`).
   - **Hasil yang diharapkan:** Validasi lolos dan tugas tambahan tersimpan sukses tanpa memaksa staf non-proyek memilih proyek.
   - **Verifikasi:** Data masuk ke daftar pekerjaan tambahan hari ini.

- **Expected Final Result:** Aturan wajib pemberi instruksi berjalan tegak untuk penugasan atasan, dan pemilihan proyek bersifat opsional sesuai struktur kerja PT Dutamedia Mandiri Pratama (CR-013).
- **Bukti yang Perlu Dikumpulkan:** Screenshot pesan validasi saat dropdown penugas dikosongkan dan saat berhasil disimpan.
- **Actual Result:** Lolos retest Cycle 2 (08 Nov 2026). Validasi CR-013 terbukti presisi: sistem memblokir submit form saat alasan `Penugasan Baru dari Atasan` dipilih tanpa menentukan instruktur dengan menampilkan browser tooltip `Please select an item in the list.` (media_1794123017594_f2b9f383.png). Setelah instruktur `Bambang Pratama` dipilih dan field `Proyek Terkait (Opsional)` dibiarkan kosong, tugas `#1 Investigasi performa rendering Vue` berhasil disimpan dan diterbitkan ke daftar hari ini tanpa memaksa pemilihan proyek (media_1794123081537_cf67c2c0.png).
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-08
- **Defect ID:** -
- **Retest Result:** PASS
- **Catatan:** Lolos verifikasi penuh Cycle 2 pasca penyesuaian aturan CR-013.

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
- **Actual Result:** Lolos verifikasi Cycle 2 (08 Nov 2026). Setelah tugas tambahan ke-5 berhasil disimpan (media_1794156671203_e3f38a23.jpg), form pencatatan langsung mengaktifkan banner batas maksimum, mendisable textarea dan seluruh dropdown, serta mengunci tombol submit menjadi 'Batas 5 Tugas Tercapai' (media_1794156676888_dee657fc.jpg). Sistem berhasil mencegah penambahan item ke-6.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-08
- **Defect ID:** -
- **Retest Result:** PASS
- **Catatan:** Batas atas beban kerja harian FR-20 terbukti presisi 100%.

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
   - **Hasil yang diharapkan:** Halaman menampilkan daftar seluruh komitmen hari ini dengan pilihan status bahasa bisnis: Selesai, Sebagian, Belum Selesai, Dibatalkan (tanpa kode enum teknis), tombol "Laporkan Blocker" di bar alur yang langsung mengarahkan ke /raise-blockers tanpa modal dialog pop-up mati, serta kolom catatan kelanjutan tugas selebar 100% (IMP-016, IMP-036, IMP-037, IMP-040).
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
- **Actual Result:** Lolos retest Cycle 2 (09 Nov 2026). Pengiriman evaluasi EOD untuk 6 tugas (1 komitmen pagi + 5 tugas tambahan) dengan status akhir GREEN dan refleksi harian berhasil disimpan dengan status waktu On-Time (media_1794188421001_7783a64a.png). Formulir langsung terkunci permanen (read-only): seluruh opsi radio capaian terkunci, badge status mandiri terkunci, tombol submit menghilang dan digantikan panel konfirmasi penutupan hari serta navigasi ke riwayat (media_1794188430654_30d5df4f.jpg, media_1794188457652_3df81dab.png). Pengujian muat ulang halaman (F5) membuktikan formulir tetap terkunci rapi (read-only) dan tidak kembali ke formulir aktif/dapat diedit. Defect DEF-002 resmi teratasi tuntas 100%. Catatan penyempurnaan UI form terkunci dicatat ke backlog IMP-045.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** -
- **Retest Result:** PASS
- **Catatan:** Lolos retest penuh Cycle 2. Penguncian penutupan hari kerja FR-26 dan persistensi F5 (DEF-002) terverifikasi kokoh 100%. Usulan tampilan kartu ringkasan resmi dicatat ke IMP-045.

---

### TC-DLYE-002: Heuristic Status Suggestion & Hak Prerogatif Anti-Lock Green
- **Test Case ID:** `TC-DLYE-002`
- **Scenario ID:** `SCN-DLYE-02`
- **Requirement ID:** `FR-22`, `FR-23`, `DEC-003`
- **Judul:** Heuristic Status Suggestion & Verifikasi Regulasi Anti-Lock Green (DEC-003)
- **Tujuan:** Memvalidasi hak otonom karyawan: meskipun salah satu tugas berstatus belum tuntas dan sistem secara heuristik menyarankan status Kuning/Merah, opsi Hijau tetap dapat dipilih secara bebas dengan badge "Penilaian Otonom Karyawan" dan narasi refleksi mandiri yang suportif tanpa istilah defensif/punitif (DEC-003, IMP-035). Karyawan tetap berhak memilih status Hijau dengan menyertakan justifikasi mandiri.
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
- **Actual Result:** Terverifikasi empiris via simulasi perubahan kebijakan cut-off EOD ke 09:00 WIB. Halaman `/daily/eod` pada akun dev.backend@dutamedia.com mendeteksi status waktu `LOCKED (Pasca 09:00 WIB)` (media_1794190824149_affe77d4.jpg), seluruh form dinonaktifkan, tombol submit disembunyikan, dan banner resmi penguncian menampilkan tombol "Ajukan Koreksi EOD". Mengklik tombol tersebut berhasil mengarahkan pengguna secara mulus ke formulir `/corrections/eod` (media_1794191447101_a17ddb21.jpg).
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** -
- **Retest Result:** PASS
- **Catatan:** Penguncian form EOD pasca cut-off dan navigasi pengalihan koreksi DEC-002 terverifikasi 100%.

---

### TC-DLYE-005: Penguncian Atomik Hasil Evaluasi Sore EOD & Pencegahan Timpa Ulang (Resolusi DEF-002)
- **Test Case ID:** `TC-DLYE-005`
- **Scenario ID:** `SCN-DLYE-05`
- **Requirement ID:** `FR-22`, `FR-27`, `DEC-002`, `DEC-008`
- **Judul:** Penguncian Atomik Hasil Evaluasi Sore EOD & Pencegahan Timpa Ulang (Resolusi DEF-002)
- **Tujuan:** Memvalidasi penegakan penguncian atomik evaluasi sore (DEF-002). Setelah evaluasi sore berhasil dikirim (`eodSubmittedAt` terisi), seluruh kontrol evaluasi terkunci permanen, tombol submit hilang, dan setiap request ulang langsung ditolak dengan status HTTP 422 `BUSINESS_RULE_ALREADY_SUBMITTED`.
- **Modul / Halaman:** EOD Outcome (`/daily/eod`)
- **Kategori Pengujian:** Concurrency / Atomic Lock / Defect Re-Validation (DEF-002)
- **Teknik Desain Test Case:** Race Condition Simulation & State Immutability Testing
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Pengubahan langsung hasil evaluasi sore tanpa prosedur koreksi resmi merusak audit trail kepatuhan harian dan membuka celah manipulasi capaian kerja.
- **Preconditions:** Komitmen pagi telah diserahkan hari ini. Berada di halaman `/daily/eod`. Evaluasi sore telah disubmit satu kali sebelumnya (`eodSubmittedAt !== null`).
- **Test Data ID:** `TD-DLYE-06` (Evaluasi sore kedua dengan percobaan mengubah status outcome secara langsung)
- **Persiapan Sebelum Tes:** Pastikan pengguna telah menyelesaikan evaluasi sore pertama dan form menampilkan status terkunci.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Evaluasi Sore pada rute `/daily/eod`.
   - **Lokasi:** Rute `/daily/eod`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman mendeteksi bahwa evaluasi sore telah diserahkan (`hasSubmittedEod = true`). Banner sukses berwarna hijau/kuning tampil dengan pesan: *"Evaluasi sore Anda telah tercatat pada pukul [XX:XX WIB]."* Seluruh tombol pilihan capaian tugas (`Selesai`, `Sebagian`, `Belum Selesai`, `Dibatalkan`), pilihan keputusan kelanjutan, dan indikator refleksi harian berada dalam status nonaktif (*disabled*). Tombol "Kirim Evaluasi Sore" tidak ditampilkan (*hidden*).
   - **Verifikasi:** Tidak ada elemen formulir yang dapat dimanipulasi secara interaktif. Terdapat tautan teks `Ajukan Koreksi Evaluasi Sore` menuju `/corrections/eod`.
2. **Langkah 2 (Pengujian Bypass API Langsung)**
   - **Aksi:** Buka Developer Tools (F12) Console atau gunakan cURL/Fetch untuk mengirimkan payload POST ulang ke endpoint `/daily/eod` dengan payload perubahan status capaian.
   - **Lokasi:** Developer Console atau API client.
   - **Data:** Payload: `{"workDate": "hari-ini", "outcomes": [...], "finalDailyStatus": "GREEN"}`
   - **Hasil yang diharapkan:** Backend menolak mutlak pembaruan langsung dengan status HTTP 422 Unprocessable Entity dan error code `BUSINESS_RULE_ALREADY_SUBMITTED`. Pesan galat berbunyi: *"Evaluasi sore untuk tanggal kerja ini sudah diserahkan dan terkunci secara atomik. Gunakan prosedur koreksi resmi."*
   - **Verifikasi:** Nilai database tidak berubah. Stempel waktu `eodSubmittedAt` asli tetap utuh dan data capaian tidak tertimpa.

- **Expected Final Result:** Evaluasi sore yang telah diserahkan terkunci secara mutlak baik di UI maupun di backend API (DEF-002 terverifikasi tuntas).
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar formulir terkunci di UI dan tangkapan layar respons API 422 pada tab Network console.
- **Actual Result:** Simulasi percobaan penyerahan ulang EOD (DEF-002) via DevTools Console terbukti ditolak mutlak oleh backend dengan status HTTP 422 Unprocessable Content. Respons API mengembalikan error code `BUSINESS_RULE_ALREADY_SUBMITTED`, pesan resmi: *"EOD Outcome hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi."*, timestamp `2026-11-09T02:03:14.972Z`, dan requestId `req_51023913`. Integritas database dan stempel waktu `eodSubmittedAt` asli pukul 08.40 WIB tetap terlindungi utuh 100%. Bukti: `media_1794189830130_27cb3eca.png`.
- **Execution Status:** PASS
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** DEF-002 (Resolved)
- **Retest Result:** PASS
- **Catatan:** Verifikasi tuntas resolusi DEF-002 pasca-remediasi Cycle 1 (Penguncian atomik sisi server terbukti kokoh).

---

## MODUL 5: MANAJEMEN HAMBATAN (BLOCKER) & ESKALASI SLA (TC-BLKR)

---

### TC-BLKR-001: Pelaporan Hambatan Baru Tingkat Kritis dengan SLA 2 Jam
- **Test Case ID:** `TC-BLKR-001`
- **Scenario ID:** `SCN-BLKR-01`
- **Requirement ID:** `FR-29`, `FR-30`, `DEC-007`
- **Judul:** Pelaporan Hambatan Baru Tingkat Kritis (Raise Blocker) & Verifikasi Target SLA
- **Tujuan:** Memvalidasi bahwa setiap pengguna dapat melaporkan kendala teknis kritis, memilih tipe hambatan dan dampak organisasi, serta memverifikasi bahwa sistem menyematkan target SLA respons 2 jam secara otomatis.
- **Modul / Halaman:** Raise Blocker (`/raise-blockers`)
- **Kategori Pengujian:** Happy Path / Workflow Initialization
- **Teknik Desain Test Case:** Equivalence Partitioning & Decision Table
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Hambatan kritis yang tidak tercatat dengan SLA akurat berisiko menunda pengiriman proyek dan merugikan reputasi perusahaan.
- **Preconditions:** Login sebagai Employee.
- **Test Data ID:** `TD-BLKR-01`
- **Persiapan Sebelum Tes:** Buka menu "Lapor Blocker" via sidebar kiri atau klik "Laporkan Blocker" dari My Today (`/raise-blockers`).

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Raise Blocker.
   - **Lokasi:** `/raise-blockers`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman Laporkan & Pantau Blocker terbuka di `/raise-blockers` dengan tautan navigasi `← Kembali ke Ruang Kerja My Today`, 2 Tab Navigasi (*Tab 1: Buat Laporan Blocker* dan *Tab 2: Blocker Saya*), formulir detail kendala lengkap, serta footer aksi full-width fixed dengan tombol sekunder "Bersihkan Formulir" dan primer "Kirim Laporan Blocker" (IMP-041, IMP-042, IMP-044).
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
   - **Hasil yang diharapkan:** Toast sukses muncul "Hambatan kritis berhasil dilaporkan". Aplikasi menampilkan toast sukses dan mengarahkan pelapor (EMPLOYEE) langsung ke Tab 2 "Blocker Saya" pada halaman `/raise-blockers` untuk memantau tiket kendala aktifnya secara transparan (tanpa tombol antrean manajerial).
   - **Verifikasi:** Blocker baru tercantum di bagian paling atas antrean dengan status `OPEN`, badge merah `KRITIS`, dan timer countdown SLA aktif.

- **Expected Final Result:** Blocker kritis tersimpan dengan status OPEN, SLA 2 jam terpasang deterministik, dan siap ditindaklanjuti oleh atasan.
- **Bukti yang Perlu Dikumpulkan:** Screenshot detail blocker di antrean dengan badge KRITIS dan SLA 2 Jam.
- **Actual Result:** Tiket blocker kritis (#e101c2e3) "Akses VPN Staging & Server Redis Gateway Terputus Total" berhasil diterbitkan dengan status OPEN (Menunggu Respons Penanggung Jawab), badge Tingkat CRITICAL, Dampak PROJECT, kategori INFRA, dan timer countdown SLA aktif terpasang deterministik 2 Jam (Sisa SLA 2j 0m). Tiket siap ditindaklanjuti di antrean blocker.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Formula dan countdown SLA aktif deterministik 2 jam (120 menit). Form raise blocker disempurnakan dengan pemisahan direktori wewenang, opsi kelompok 'Lainnya', dan label default netral (IMP-046).

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
- **Actual Result:** Tombol 'Acknowledge' pada tiket kritis #e101c2e3 berhasil diklik. Status tiket bertransisi sukses dari OPEN menjadi ACKNOWLEDGED (badge biru aktif pada kartu list dan panel detail), tombol Acknowledge hilang dan menyisakan tombol 'Beri Bantuan' & 'Selesaikan', serta respons awal tercatat dalam SLA 2 jam.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Alur konfirmasi penerimaan kendala kritis oleh atasan berhasil 100% dan memenuhi ketentuan SLA.

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
- **Actual Result:** Validasi batas negatif (< 10 karakter) berhasil menolak input 'Beres' (5/10 karakter) dengan pesan error merah 'Catatan resolusi wajib diisi minimal 10 karakter' dan modal tetap terbuka. Penyelesaian positif (>= 10 karakter) berhasil memproses tiket #e101c2e3 menjadi RESOLVED (badge hijau aktif), metrik kritis aktif berkurang (2 -> 1), metrik aktif berkurang (4 -> 3), serta catatan resolusi akhir tersimpan dan tampil pada panel detail.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Aturan anti-empty resolution (DEC-007, DEC-010) terbukti efektif menegakkan dokumentasi knowledge base penyelesaian insiden. Modal UI telah dipoles dengan live counter 10 karakter min (IMP-047).

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

### TC-BLKR-006: Pemantauan Status & Kontribusi Bantuan pada Tab "Blocker Saya" oleh Karyawan
- **Test Case ID:** `TC-BLKR-006`
- **Scenario ID:** `SCN-BLKR-06`
- **Requirement ID:** `FR-29`, `FR-32`, `FR-33`, `DEC-007`
- **Judul:** Pemantauan Status & Kontribusi Bantuan pada Tab "Blocker Saya" oleh Karyawan
- **Tujuan:** Memvalidasi alur pemantauan mandiri kendala karyawan pada Tab 2 ("Blocker Saya") di rute `/raise-blockers`, termasuk filter status, hitung mundur SLA, serta verifikasi bahwa karyawan dapat membaca kontribusi bantuan (*Support Contribution*) dan catatan resolusi tanpa perlu akses ke menu manajerial `/blockers`.
- **Modul / Halaman:** Laporkan & Pantau Blocker (`/raise-blockers`)
- **Kategori Pengujian:** Happy Path / UI Inspection / Workspace Role Isolation
- **Teknik Desain Test Case:** Equivalence Partitioning & State Inspection
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Karyawan membutuhkan visibilitas terhadap tindak lanjut kendala yang dilaporkannya tanpa melanggar batasan akses menu manajerial tim.
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Pengguna telah melaporkan minimal 1 tiket kendala sebelumnya (`TC-BLKR-001`). Atasan telah memberikan respons (*Acknowledge*) dan rekan kerja telah menambahkan kontribusi bantuan.
- **Test Data ID:** `TD-BLKR-06` (Tiket kendala aktif yang memiliki riwayat bantuan)
- **Persiapan Sebelum Tes:** Akses menu "Lapor Blocker" via sidebar atau navigasi ke `/raise-blockers`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman `/raise-blockers` dan klik tab "Blocker Saya".
   - **Lokasi:** Header tab di bagian atas formulir blocker.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Tampilan beralih ke Tab 2 ("Blocker Saya"). Muncul kartu ringkasan jumlah tiket (Semua, Aktif, Selesai, Ditutup). Daftar tiket kendala yang dilaporkan oleh pengguna ditampilkan secara kronologis.
   - **Verifikasi:** Tiket `Database Staging Timeout` yang dilaporkan sebelumnya tampil dengan badge severity merah (`CRITICAL`), badge status kuning/biru (`ACKNOWLEDGED` / `IN_PROGRESS`), dan indikator target SLA.
2. **Langkah 2**
   - **Aksi:** Periksa rincian kartu kendala dan riwayat kontribusi bantuan.
   - **Lokasi:** Kartu tiket kendala pada Tab "Blocker Saya".
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Kartu menampilkan rincian: deskripsi masalah, konteks wewenang, nama atasan yang mengonfirmasi (*acknowledged by*), serta blok riwayat kontribusi bantuan (*Support Contributions*) yang memuat nama rekan pembantu, tindakan yang diambil, dan hasil bantuan.
   - **Verifikasi:** Kontribusi bantuan dari rekan kerja terbaca dengan jelas dan terformat rapi.
3. **Langkah 3**
   - **Aksi:** Gunakan tombol filter status: klik filter "Selesai" dan "Aktif".
   - **Lokasi:** Tombol filter di atas daftar kartu kendala.
   - **Data:** Filter: `Aktif`, kemudian `Selesai`.
   - **Hasil yang diharapkan:** Daftar tiket menyaring secara instan (*reactive client-side filter*) sesuai status yang dipilih tanpa memuat ulang halaman.
   - **Verifikasi:** Filter "Aktif" hanya menampilkan tiket dengan status OPEN, ACKNOWLEDGED, atau IN_PROGRESS.

- **Expected Final Result:** Karyawan dapat memonitor seluruh status, progres penanganan SLA, dan kontribusi bantuan atas kendala yang dilaporkannya secara mandiri melalui Tab "Blocker Saya".
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar Tab 2 "Blocker Saya" memperlihatkan kartu tiket berstatus aktif beserta riwayat bantuan.
- **Actual Result:** Tab "Blocker Saya" berhasil memuat antrean tiket kendala mandiri (4 tiket). Filter reaktif instan (Semua: 4, Aktif: 4, Menunggu Konfirmasi: 0, Selesai/Ditutup: 0) berfungsi tanpa reload, dan menampilkan kartu Empty State terstandar saat kategori kosong. Kartu tiket aktif menampilkan badge keparahan, status penanganan, penanggung jawab, serta countdown SLA berjalan akurat.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-09
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Seluruh kriteria penerimaan pemantauan mandiri karyawan terpenuhi 100%. Riwayat catatan resolusi/bantuan akan terus terupdate saat tiket ditindaklanjuti pada TC-BLKR-002 dan TC-BLKR-003.

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

### TC-CORR-002: Persetujuan Permohonan Koreksi oleh Direct Manager (Head of Engineering)
- **Test Case ID:** `TC-CORR-002`
- **Scenario ID:** `SCN-CORR-02`
- **Requirement ID:** `FR-39`, `DEC-006`, `DEC-013`
- **Judul:** Persetujuan Permohonan Koreksi oleh Atasan Langsung (Direct Manager Approval)
- **Tujuan:** Memvalidasi bahwa atasan langsung (`Head of Engineering`) dapat melihat permohonan koreksi bawahan langsungnya di divisi Engineering, membandingkan data usulan, menyetujui permohonan, dan memverifikasi data komitmen terbarui secara otomatis.
- **Modul / Halaman:** Correction Review (`/corrections/review`)
- **Kategori Pengujian:** Workflow Transition / Role Authority
- **Teknik Desain Test Case:** State Transition Testing
- **Role:** `HEAD` / Direct Manager (`head.eng@dutamedia.com` - Arif Budiman, Head of Engineering)
- **Priority:** **High (P1)**
- **Risk Rationale:** Alur persetujuan yang gagal membuat data karyawan tetap berstatus melanggar aturan secara keliru.
- **Preconditions:** Login sebagai `head.eng@dutamedia.com` (Arif Budiman). Terdapat pengajuan koreksi `TC-CORR-001` berstatus `PENDING` dari Aditya Nugroho.
- **Test Data ID:** `TD-AUTH-02` dan `TD-CORR-01`
- **Persiapan Sebelum Tes:** Buka `/corrections/review`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Correction Review via sidebar.
   - **Lokasi:** `/corrections/review`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Antrean peninjauan koreksi terbuka. Pengajuan dari "Aditya Nugroho" tampil dengan detail tanggal, alasan internet mati, dan tombol aksi: "Setujui" serta "Tolak".
   - **Verifikasi:** Data perbandingan sebelum vs sesudah tampil transparan.
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
   - **Verifikasi:** Pengajuan berpindah ke tab "Riwayat Disetujui". Jejak audit log permanen (DEC-013) mencatat ID atasan (`Arif Budiman`) dan timestamp persetujuan.

- **Expected Final Result:** Koreksi disetujui, status bertransisi ke APPROVED, data komitmen tanggal bersangkutan terisi resmi, dan audit log tercatat abadi.
- **Bukti yang Perlu Dikumpulkan:** Screenshot pengajuan di tab Disetujui dengan badge hijau APPROVED dan catatan atasan.
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
- **Tujuan:** Memvalidasi bahwa atasan langsung yang menolak permohonan koreksi bawahan wajib menyertakan alasan penolakan tertulis minimal 10 karakter agar ada transparansi evaluasi bagi karyawan.
- **Modul / Halaman:** Correction Review (`/corrections/review`)
- **Kategori Pengujian:** Negative Testing / Boundary Value
- **Teknik Desain Test Case:** Boundary Value Analysis (< 10 char vs >= 10 char)
- **Role:** `HEAD` / Direct Manager (`head.eng@dutamedia.com` - Arif Budiman, Head of Engineering)
- **Priority:** **High (P1)**
- **Risk Rationale:** Penolakan sepihak tanpa alasan tertulis memicu ketidakpastian dan ketegangan hubungan kerja antara atasan dan bawahan.
- **Preconditions:** Login sebagai Atasan Langsung (`head.eng@dutamedia.com`). Terdapat permohonan koreksi berstatus `PENDING`.
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

### TC-LEAV-002: Persetujuan Permohonan Cuti oleh Atasan Langsung (Head of Engineering)
- **Test Case ID:** `TC-LEAV-002`
- **Scenario ID:** `SCN-LEAV-02`
- **Requirement ID:** `FR-46`
- **Judul:** Persetujuan Permohonan Cuti Tim oleh Atasan Langsung & Pemotongan Kuota
- **Tujuan:** Memvalidasi bahwa atasan langsung (`Head of Engineering`) dapat melihat antrean permohonan cuti bawahannya di divisi Engineering, memverifikasi ketersediaan personil pengganti, menyetujui permohonan, dan memverifikasi bahwa sisa kuota cuti karyawan terpotong secara tepat.
- **Modul / Halaman:** Leave Approval Queue (`/leave/queue`)
- **Kategori Pengujian:** Workflow Transition / State Transition
- **Teknik Desain Test Case:** State Transition Testing
- **Role:** `HEAD` / Direct Manager (`head.eng@dutamedia.com` - Arif Budiman, Head of Engineering)
- **Priority:** **High (P1)**
- **Risk Rationale:** Hambatan pada persetujuan cuti menyebabkan ketidakpastian izin kerja karyawan dan kekacauan jadwal proyek.
- **Preconditions:** Login sebagai `head.eng@dutamedia.com` (Arif Budiman). Terdapat pengajuan cuti berstatus `PENDING` dari Aditya Nugroho (`TC-LEAV-001`) atau Siti Rahma.
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

### TC-LEAV-004: Validasi Tumpang Tindih Tanggal Cuti & Pembatalan Mandiri Permohonan Cuti Pending
- **Test Case ID:** `TC-LEAV-004`
- **Scenario ID:** `SCN-LEAV-04`
- **Requirement ID:** `FR-40`, `FR-41`, `DEC-007`
- **Judul:** Validasi Tumpang Tindih Tanggal Cuti & Pembatalan Mandiri Permohonan Cuti Pending
- **Tujuan:** Memastikan sistem menolak pengajuan cuti yang bertabrakan (*overlapping*) dengan permohonan cuti aktif lain milik karyawan yang sama (HTTP 409 Conflict), serta memvalidasi bahwa karyawan berhak membatalkan permohonan cuti mandirinya selama statusnya masih `PENDING`.
- **Modul / Halaman:** Cuti Saya (`/leave/my`)
- **Kategori Pengujian:** Negative Testing & Alternative Lifecycle Workflow
- **Teknik Desain Test Case:** Boundary Value Analysis & State Transition
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Pengajuan cuti tumpang tindih menyebabkan kekacauan kuota cuti dan anomali perhitungan kehadiran harian.
- **Preconditions:** Login sebagai `dev.frontend@dutamedia.com`. Karyawan telah memiliki 1 permohonan cuti berstatus `PENDING` pada rentang tanggal 10 s.d. 12 November 2026.
- **Test Data ID:** `TD-LEAV-04` (Pengajuan cuti tumpang tindih: tanggal 11 s.d. 13 November 2026)
- **Persiapan Sebelum Tes:** Masuk ke halaman `/leave/my`.

**Langkah Pengujian:**
1. **Langkah 1 (Pengujian Validasi Tumpang Tindih)**
   - **Aksi:** Pada formulir pengajuan cuti baru, pilih tanggal mulai `2026-11-11` dan tanggal selesai `2026-11-13`. Masukkan alasan: `Keperluan keluarga mendesak`. Klik tombol "Ajukan Permohonan Cuti".
   - **Lokasi:** Formulir pengajuan cuti `/leave/my`.
   - **Data:** Mulai: `2026-11-11`, Selesai: `2026-11-13`, Alasan: `Keperluan keluarga mendesak`
   - **Hasil yang diharapkan:** Backend mendeteksi irisan tanggal dengan cuti yang sudah ada. Pengajuan ditolak dengan status HTTP 409 Conflict. Muncul pesan galat berwarna merah: *"Terdapat permohonan cuti aktif yang tumpang tindih pada rentang tanggal tersebut."*
   - **Verifikasi:** Permohonan tidak ditambahkan ke daftar riwayat cuti.
2. **Langkah 2 (Pengujian Pembatalan Mandiri Permohonan Cuti Pending)**
   - **Aksi:** Temukan baris permohonan cuti tanggal 10-12 November 2026 yang berstatus `PENDING` pada tabel riwayat cuti. Klik tombol aksi "Batalkan Permohonan".
   - **Lokasi:** Tabel riwayat cuti saya (`/leave/my`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Muncul dialog konfirmasi pembatalan: "Apakah Anda yakin ingin membatalkan permohonan cuti ini?". Klik "Ya, Batalkan".
   - **Verifikasi:** Sistem memproses pembatalan. Status permohonan berubah menjadi `CANCELLED` (atau terhapus dari antrean aktif), dan muncul toast sukses: "Permohonan cuti berhasil dibatalkan."

- **Expected Final Result:** Sistem secara kokoh mencegah pengajuan cuti bertanggal tumpang tindih dan mendukung siklus pembatalan mandiri cuti pending.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar pesan penolakan tumpang tindih 409 dan status cuti berubah menjadi CANCELLED.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

## MODUL 8: SUPERVISI, BIMBINGAN, DASBOR, & ADMINISTRASI (TC-COAC, TC-DASH, TC-ADMN)

---

### TC-COAC-001: Pemberian Catatan Bimbingan Manajer (Coaching Note)
- **Test Case ID:** `TC-COAC-001`
- **Scenario ID:** `SCN-COAC-01`
- **Requirement ID:** `FR-49`, `DEC-010`
- **Judul:** Pemberian Catatan Bimbingan Manajer (Manager Coaching Note DEC-010)
- **Tujuan:** Memvalidasi bahwa atasan langsung (`Head of Engineering`) dapat menyematkan catatan bimbingan atau apresiasi kerja pada komitmen bawahan dengan catatan tertulis minimal 10 karakter, dan bawahan dapat membaca catatan tersebut di timeline kerjanya.
- **Modul / Halaman:** Manager Note Coaching (`/coaching`)
- **Kategori Pengujian:** Usability / Coaching & Feedback
- **Teknik Desain Test Case:** Boundary Value & Use Case Testing
- **Role:** `HEAD` / Direct Manager (`head.eng@dutamedia.com` - Arif Budiman, Head of Engineering)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Ketiadaan media bimbingan manajer membuat evaluasi kerja harian menjadi transaksional dan mengabaikan pembinaan SDM.
- **Preconditions:** Login sebagai `head.eng@dutamedia.com` (Arif Budiman). Bawahan langsungnya di divisi Engineering (Aditya Nugroho, Siti Rahma, Bambang Pratama) terdaftar di sistem.
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

### TC-DASH-001: Pemantauan Dasbor Operasional Tim Proyek (Team Pulse) oleh Project Lead / Supervisor
- **Test Case ID:** `TC-DASH-001`
- **Scenario ID:** `SCN-DASH-01`
- **Requirement ID:** `FR-50`, `FR-28`, `FR-36`, `CR-013`
- **Judul:** Pemantauan Dasbor Operasional Tim Proyek (`Tim (Proyek)`) oleh Project Lead / Supervisor
- **Tujuan:** Memvalidasi bahwa Project Lead / Supervisor yang login langsung mendarat di `/dashboard` pada tab lingkup **`Tim (Proyek)`** (`scope=team`), dapat memfilter berdasarkan proyek yang dipimpinnya, serta disajikan metrik agregat riil dari database (bukan teks statis/hardcode): jumlah belum mengisi komitmen, komitmen waspada (Amber), komitmen kritis (Red), blocker belum direspon, dan daftar dinamis personil yang butuh bantuan.
- **Modul / Halaman:** Pulse Dashboard (`/dashboard`)
- **Kategori Pengujian:** UI/UX / Aggregation & Visualization
- **Teknik Desain Test Case:** Equivalence Partitioning
- **Role:** `SUPERVISOR` / Project Lead (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Dasbor operasional adalah pusat komando harian pimpinan proyek untuk mengidentifikasi macetnya tugas tim proyek lintas fungsi.
- **Preconditions:** Login sebagai `lead.tech@dutamedia.com` (berperan `SUPERVISOR` / Project Lead, bukan `HEAD`). Anggota tim telah memiliki data komitmen dan blocker di sistem.
- **Test Data ID:** `TD-AUTH-02`
- **Persiapan Sebelum Tes:** Masuk ke `/dashboard`.

**Langkah Pengujian:**
1. **Langkah 1 (Verifikasi Tab Scope & Filter Proyek)**
   - **Aksi:** Buka halaman Dasbor Utama via navigasi (`/dashboard`). Amati tab scope dan dropdown filter di bagian header.
   - **Lokasi:** `/dashboard`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Hanya tab **"Tim (Proyek)"** (`data-testid="scope-tab-team"`) yang tampil dan aktif secara default (tab *Divisi Saya* dan *Seluruh Perusahaan* disembunyikan karena pengguna bukan Head Divisi maupun CEO). Tersedia dropdown filter proyek (`data-testid="filter-project-select"`) untuk menyaring proyek yang dipimpin.
   - **Verifikasi:** Header, tab scope `Tim (Proyek)`, dan filter proyek tampil rapi sesuai arsitektur 3-Scope CR-013.
2. **Langkah 2 (Verifikasi 4 Kartu Metrik Operasional Dinamis)**
   - **Aksi:** Amati 4 kartu metrik operasional teratas.
   - **Lokasi:** Baris KPI ringkasan.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Menampilkan 4 kartu statistik dinamis dari database:
     1. `Belum Mengisi Komitmen` (Jumlah belum submit & % Tingkat penyelesaian / sudah submit)
     2. `Komitmen Waspada (Kuning)` (`amberCommitmentsCount`)
     3. `Komitmen Kritis (Merah)` (`redCommitmentsCount`)
     4. `Blocker Belum Direspon` (`unacknowledgedBlockersCount` dengan link "Buka Antrean Blocker")
   - **Verifikasi:** Nilai numerik pada keempat kartu sinkron 100% dengan payload API `/api/v1/dashboard/pulse?scope=team`.
3. **Langkah 3 (Verifikasi Daftar Dinamis Personil Butuh Bantuan Hari Ini)**
   - **Aksi:** Periksa widget "Personil Butuh Bantuan Hari Ini" di kolom kiri.
   - **Lokasi:** Kolom kiri dashboard.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Daftar menampilkan personil nyata dari database (`attentionItems`) yang sedang memiliki blocker terbuka atau komitmen berisiko (`AMBER`/`RED`) lengkap dengan kode proyek `[PRJ-...]`, judul kendala, dan tombol aksi "Tanggapi" / "Catat Coaching". Jika tidak ada kendala aktif, menampilkan pesan status kosong yang bersih (tidak menampilkan nama hardcode statis seperti Budi Pratama / Citra Lestari).
   - **Verifikasi:** Kartu anggota tim tampil dinamis sesuai kondisi riil database.
4. **Langkah 4 (Verifikasi Feed Dukungan Lintas Fungsi)**
   - **Aksi:** Periksa widget "Feed Dukungan Lintas Fungsi" di kolom kanan.
   - **Lokasi:** Kolom kanan dashboard.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Menampilkan timeline catatan bantuan rekan kerja (`supportLogs`) atau status kosong yang ramah jika belum ada interaksi hari ini.
   - **Verifikasi:** Widget ter-render rapi tanpa overflow horizontal.

- **Expected Final Result:** Dasbor `Tim (Proyek)` menyajikan visibilitas operasional proyek secara real-time dan akurat sesuai CR-013.
- **Bukti yang Perlu Dikumpulkan:** Screenshot halaman penuh Dashboard `Tim (Proyek)`.
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

### TC-NOTF-001: Pusat Notifikasi, Pembaruan Lencana TopBar, & Penandaan Terbaca
- **Test Case ID:** `TC-NOTF-001`
- **Scenario ID:** `SCN-NOTF-01`
- **Requirement ID:** `FR-38`, `DEC-013`
- **Judul:** Pusat Notifikasi, Pembaruan Lencana TopBar, & Penandaan Terbaca
- **Tujuan:** Memvalidasi fungsi Pusat Notifikasi (`/notifications`): penampilan lencana belum terbaca (*unread badge counter*) di TopBar, daftar notifikasi in-app tersusun kronologis, serta fungsionalitas tombol "Tandai Terbaca" dan "Tandai Semua Terbaca" yang mereset hitungan lencana secara presisi.
- **Modul / Halaman:** Pusat Notifikasi (`/notifications`) & TopBar Komponen
- **Kategori Pengujian:** Happy Path / In-App Notification Workflow
- **Teknik Desain Test Case:** State Synchronization Testing
- **Role:** `EMPLOYEE` (`dev.frontend@dutamedia.com`) / Seluruh Peran
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Keterlambatan atau kegagalan penyampaian notifikasi membuat karyawan tidak mengetahui adanya respons blocker, persetujuan cuti, atau catatan coaching dari atasan.
- **Preconditions:** Login sebagai pengguna yang memiliki minimal 2 notifikasi belum terbaca di sistem (misal notifikasi respons kendala dan notifikasi koreksi disetujui).
- **Test Data ID:** `TD-NOTF-01` (Notifikasi aktif di database)
- **Persiapan Sebelum Tes:** Perhatikan ikon lonceng pada TopBar bagian kanan atas sebelum memulai pengujian.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Periksa tampilan TopBar pada sudut kanan atas layar.
   - **Lokasi:** Komponen `TopBar.vue` pada header aplikasi.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Ikon lonceng notifikasi menampilkan lencana angka merah (*badge counter*) yang menunjukkan jumlah pesan belum terbaca (misal: badge `2`).
   - **Verifikasi:** Lencana merah terlihat jelas di atas ikon lonceng.
2. **Langkah 2**
   - **Aksi:** Klik ikon lonceng notifikasi atau pilih menu "Notifikasi" pada sidebar.
   - **Lokasi:** Ikon lonceng TopBar atau link sidebar `/notifications`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Aplikasi mengarahkan ke halaman Pusat Notifikasi (`/notifications`). Daftar pesan notifikasi ditampilkan secara kronologis dengan ikon jenis notifikasi, judul pesan, isi ringkasan, dan stempel waktu relatif (misal: "10 menit yang lalu"). Pesan belum terbaca memiliki latar belakang visual pembeda (highlight biru/hijau muda) dan titik indikator belum dibaca.
   - **Verifikasi:** URL aktif adalah `/notifications`.
3. **Langkah 3**
   - **Aksi:** Klik tombol centang satu notifikasi untuk menandai sebagai terbaca ("Tandai Terbaca").
   - **Lokasi:** Tombol aksi pada kartu notifikasi baris pertama.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Status notifikasi berubah menjadi terbaca. Lencana angka pada TopBar berkurang 1 secara reaktif.
   - **Verifikasi:** Highlight kartu notifikasi memudar dan angka lencana TopBar terbarui.
4. **Langkah 4**
   - **Aksi:** Klik tombol "Tandai Semua Terbaca" di sudut kanan atas halaman notifikasi.
   - **Lokasi:** Tombol utama di header halaman `/notifications`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Seluruh notifikasi dalam daftar beralih ke status terbaca. Lencana merah pada ikon lonceng TopBar hilang/menjadi nol.
   - **Verifikasi:** Lencana merah pada TopBar lenyap dan daftar menampilkan status "Semua notifikasi telah dibaca".

- **Expected Final Result:** Siklus notifikasi in-app sinkron sempurna antara halaman notifikasi dan indikator lencana TopBar.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar TopBar dengan lencana angka sebelum dan sesudah aksi "Tandai Semua Terbaca".
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-SUPV-001: Penegakan Batasan Scope Project Lead / Technical Lead (`Tim Proyek`) & Isolasi Kepegawaian (403)
- **Test Case ID:** `TC-SUPV-001`
- **Scenario ID:** `SCN-SUPV-01`
- **Requirement ID:** `FR-08`, `FR-35`, `FR-41`, `DEC-010`, `CR-013`
- **Judul:** Penegakan Batasan Scope Project Lead / Technical Lead (`Tim Proyek`) & Isolasi Kepegawaian Lintas Wewenang (403)
- **Tujuan:** Memvalidasi pemisahan tegas antara kepemimpinan **Tim Proyek (`scope=team`)** dan wewenang **Kepegawaian Divisi (`HEAD`)** sesuai struktur resmi PT Dutamedia Mandiri Pratama (`CR-013`): memastikan Technical Lead 1 (`Bambang Pratama` - `lead.tech@dutamedia.com`) yang sejajar dengan Developer di bawah Head of Engineering dan memimpin proyek `WP-CORE` & `PRJ-CORE` hanya melihat tab **`Tim (Proyek)`** di `/dashboard` (serta ditolak HTTP 403 `AUTH_FORBIDDEN_SCOPE` jika mengakses `scope=function` atau `scope=management`), tidak mencampuri antrean persetujuan cuti kepegawaian di `/leave/queue`, dan ditolak HTTP 403 `AUTH_FORBIDDEN_SCOPE` jika mencoba me-review cuti staf lain via API.
- **Modul / Halaman:** Pulse Dashboard (`/dashboard`), Persetujuan Cuti (`/leave/queue`), & Review Koreksi (`/corrections/review`)
- **Kategori Pengujian:** RBAC / Scope Enforcement / Security Boundary Testing
- **Teknik Desain Test Case:** Decision Table & Boundary Value Testing
- **Role:** `SUPERVISOR` / Project Lead (`lead.tech@dutamedia.com` - Bambang Pratama, Technical Lead 1)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Pelanggaran batasan scope proyek vs divisi merusak tata kelola organisasi PT Dutamedia Mandiri Pratama (di mana Tech Lead memimpin eksekusi teknis proyek, sedangkan urusan kepegawaian berada di tangan Head of Engineering).
- **Preconditions:** Bambang Pratama (`lead.tech@dutamedia.com`) berperan `SUPERVISOR` (`Technical Lead 1`) yang sejajar dengan `Aditya Nugroho` (`Frontend Developer`) dan `Siti Rahma` (`Backend Developer`) di bawah **Arif Budiman (`head.eng@dutamedia.com` - Head of Engineering)**, serta terdaftar sebagai Project Lead untuk `WP-CORE` dan `PRJ-CORE`. Terdapat permohonan cuti `PENDING` dari Siti Rahma (Engineering) dan Maya Putri (`designer@dutamedia.com` - Principal Engineer R&D).
- **Test Data ID:** `TD-SUPV-01` (ID Permohonan Cuti milik Maya Putri / Siti Rahma)
- **Persiapan Sebelum Tes:** Login sebagai Bambang Pratama (`lead.tech@dutamedia.com` / `Password123!`).

**Langkah Pengujian:**
1. **Langkah 1 (Verifikasi Pembatasan Tab Scope `Tim (Proyek)` pada Pulse Dashboard `/dashboard`)**
   - **Aksi:** Login sebagai `lead.tech@dutamedia.com` dan mendarat di `/dashboard`. Amati pilihan tab scope yang tampil di sudut kanan atas header, serta uji pemanggilan API `/api/dashboard/pulse?scope=function` dan `/api/dashboard/pulse?scope=management` via Console.
   - **Lokasi:** Rute `/dashboard`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:**
     - Pada UI `/dashboard`, hanya tab **`Tim (Proyek)`** (`data-testid="scope-tab-team"`) yang muncul beserta dropdown filter proyek (`Semua Proyek Saya`, `[WP-CORE]`, `[PRJ-CORE]`). Tab **`Divisi Saya`** dan **`Seluruh Perusahaan`** TIDAK muncul karena Bambang bukan `HEAD` dan bukan `CEO_MANAGEMENT`.
     - Kartu "Personil Butuh Bantuan Hari Ini" menampilkan anggota tim proyek `WP-CORE` yang sedang mengalami kendala (`Aditya Nugroho`).
     - Jika dipanggil paksa via API, `GET /api/dashboard/pulse?scope=function` dan `GET /api/dashboard/pulse?scope=management` ditolak oleh backend dengan status **HTTP 403 Forbidden (`AUTH_FORBIDDEN_SCOPE`)**.
   - **Verifikasi:** Visibilitas tab UI dan proteksi endpoint backend `/dashboard/pulse` terkunci ketat pada `scope=team`.
2. **Langkah 2 (Verifikasi Isolasi Wewenang Kepegawaian pada `/leave/queue`)**
   - **Aksi:** Buka menu "Persetujuan Cuti" pada rute `/leave/queue`.
   - **Lokasi:** Rute `/leave/queue`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Karena sesuai bagan organisasi PT Dutamedia Mandiri Pratama urusan kepegawaian (cuti) berada di bawah wewenang **Head of Engineering (`Arif Budiman`)** dan Technical Lead 1 sejajar dengan Developer, antrean `/leave/queue` pada akun Bambang Pratama tidak menampilkan permohonan cuti milik Maya Putri (R&D) maupun rekan sejajarnya.
   - **Verifikasi:** Tidak ada kebocoran data cuti lintas divisi/wewenang di tampilan Bambang.
3. **Langkah 3 (Simulasi Percobaan Akses Langsung API / Review Cuti di Luar Wewenang)**
   - **Aksi:** Melalui Developer Console, kirimkan permintaan POST untuk me-review permohonan cuti milik Maya Putri (`/api/v1/leave/requests/{id-cuti-maya}/review`) dengan keputusan `APPROVE`.
   - **Lokasi:** Endpoint `/api/v1/leave/requests/:id/review`.
   - **Data:** ID: ID Permohonan Cuti Maya Putri, Decision: `APPROVE`, ReviewNote: `Test bypass lintas divisi oleh Technical Lead`
   - **Hasil yang diharapkan:** Backend mengevaluasi wewenang melalui `ScopeResolverService.canAccessUser`. Karena Bambang bukan atasan langsung Maya dan tidak memiliki delegasi reviewer sementara di fungsi R&D, backend menolak akses dengan status **HTTP 403 Forbidden** dan kode galat `AUTH_FORBIDDEN_SCOPE`.
   - **Verifikasi:** Permohonan cuti Maya Putri tetap dalam status aslinya dan tidak berubah.

- **Expected Final Result:** Sistem secara mutlak menegakkan bahwa Project Lead / Technical Lead hanya mengakses scope `Tim (Proyek)` pada dashboard dan menggagalkan akses kepegawaian `Divisi Saya` / `Seluruh Perusahaan` maupun intervensi cuti lintas kewenangan dengan status HTTP 403 `AUTH_FORBIDDEN_SCOPE`.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar `/dashboard` pada akun Bambang (`Technical Lead 1`) yang hanya menampilkan tab `Tim (Proyek)` serta tangkapan layar penolakan 403 `AUTH_FORBIDDEN_SCOPE` pada Console.
- **Actual Result:** Terverifikasi penuh sesuai struktur resmi PT Dutamedia Mandiri Pratama (CR-013): Bambang Pratama (`lead.tech@dutamedia.com` - Technical Lead 1, role SUPERVISOR) pada `/dashboard` hanya melihat tab `Tim (Proyek)` beserta dropdown proyek (`WP-CORE`, `PRJ-CORE`) tanpa tab `Divisi Saya` atau `Seluruh Perusahaan`; pemanggilan paksa `GET /api/dashboard/pulse?scope=function` dan `GET /api/dashboard/pulse?scope=management` ditolak backend dengan HTTP 403 (`AUTH_FORBIDDEN_SCOPE`); halaman `/leave/queue` bersih dari permohonan cuti luar wewenang dan percobaan review cuti Maya Putri (R&D) via API ditolak dengan HTTP 403 (`AUTH_FORBIDDEN_SCOPE`).
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-05
- **Defect ID:** -
- **Retest Result:** Pass
- **Catatan:** Lulus penuh pasca penyelarasan 3-Scope Dashboard (`CR-013`) dan struktur organisasi resmi PT Dutamedia Mandiri Pratama.

---

### TC-COAC-002: Validasi Kerahasiaan Catatan Bimbingan & Larangan Pembuatan Catatan untuk Diri Sendiri
- **Test Case ID:** `TC-COAC-002`
- **Scenario ID:** `SCN-COAC-02`
- **Requirement ID:** `FR-35`, `FR-36`, `DEC-004`
- **Judul:** Validasi Kerahasiaan Catatan Bimbingan & Larangan Pembuatan Catatan untuk Diri Sendiri
- **Tujuan:** Memvalidasi aturan bisnis pencatatan manajerial: sistem menolak pembuatan catatan pembinaan/manajerial untuk diri sendiri, serta memverifikasi bahwa catatan bertipe `CONFIDENTIAL_MANAGER_ONLY` tidak dapat dilihat oleh karyawan saat login, sedangkan catatan `SHARED_WITH_EMPLOYEE` dapat dibaca secara transparan.
- **Modul / Halaman:** Catatan Coaching (`/coaching`)
- **Kategori Pengujian:** Negative Testing & Confidentiality Access Control
- **Teknik Desain Test Case:** Equivalence Partitioning & Decision Table Testing
- **Role:** `HEAD` (`head.eng@dutamedia.com` - Arif Budiman, Head of Engineering) dilanjutkan `EMPLOYEE` (`dev.frontend@dutamedia.com` - Aditya Nugroho)
- **Priority:** **High (P1)**
- **Risk Rationale:** Kebocoran catatan rahasia manajerial (*Confidential*) ke staf dapat memicu friksi internal tim; pembiaran pembuatan catatan diri sendiri merusak integritas evaluasi atasan.
- **Preconditions:** Arif Budiman (`head.eng@dutamedia.com`) login sebagai Head of Engineering. Aditya Nugroho login di peramban terpisah sebagai Employee.
- **Test Data ID:** `TD-COAC-02` (Payload catatan rahasia dan catatan bersama)
- **Persiapan Sebelum Tes:** Buka halaman `/coaching` sebagai Arif Budiman (`head.eng@dutamedia.com`).

**Langkah Pengujian:**
1. **Langkah 1 (Uji Larangan Catatan untuk Diri Sendiri)**
   - **Aksi:** Coba buat catatan manajerial dengan memilih nama diri sendiri (Arif Budiman) atau kirimkan request API dengan `subjectUserId` sama dengan ID pembuat.
   - **Lokasi:** Formulir `/coaching` atau endpoint `/coaching/notes`.
   - **Data:** `subjectUserId`: ID Arif Budiman, Content: `Evaluasi performa diri sendiri triwulan ini.`
   - **Hasil yang diharapkan:** Dropdown subjek di UI menyaring nama atasan sendiri sehingga tidak dapat dipilih. Jika dikirim melalui API, backend menolak dengan HTTP 400 Bad Request dan pesan: *"Atasan tidak dapat membuat catatan pembinaan/manajerial untuk dirinya sendiri."*
   - **Verifikasi:** Tidak ada catatan yang terbentuk untuk diri sendiri.
2. **Langkah 2 (Pembuatan Catatan Rahasia Manajerial)**
   - **Aksi:** Pilih subjek Aditya Nugroho, tipe catatan `CORRECTIVE`, pilih visibilitas `CONFIDENTIAL_MANAGER_ONLY`. Masukkan konten: `Perlu peningkatan ketelitian saat merge pull request ke branch staging.` Klik "Simpan Catatan Manajerial".
   - **Lokasi:** Formulir pembuatan catatan di `/coaching`.
   - **Data:** Subjek: Aditya Nugroho, Visibilitas: `CONFIDENTIAL_MANAGER_ONLY`
   - **Hasil yang diharapkan:** Catatan berhasil disimpan. Catatan muncul pada feed coaching Arif Budiman dengan label badge gembok merah *"Rahasia Manajerial (Internal Atasan)"*.
   - **Verifikasi:** Catatan tersimpan dengan visibilitas konfidensial.
3. **Langkah 3 (Verifikasi Isolasi pada Sisi Karyawan Tanpa Bawahan)**
   - **Aksi:** Beralih ke sesi login Aditya Nugroho (`dev.frontend@dutamedia.com`). Periksa sidebar (menu `Catatan Coaching` tidak tampil karena Aditya tidak memiliki bawahan), coba akses URL `/coaching`, dan panggil API `GET /api/coaching/users/{id-aditya}` via Console.
   - **Lokasi:** Rute `/coaching` & endpoint `/api/coaching/users/:id` pada akun Aditya Nugroho.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Karena Aditya tidak memiliki bawahan (`hasSubordinates = false`), menu `Catatan Coaching` tidak tampil di sidebar dan akses langsung ke `/coaching` dialihkan ke `/forbidden` (`403 — Akses Dibatasi`). Selain itu, respons API `GET /api/coaching/users/{id-aditya}` menyaring keluar catatan `CONFIDENTIAL_MANAGER_ONLY` sehingga hanya mengembalikan catatan `SHARED_WITH_EMPLOYEE`.
   - **Verifikasi:** Catatan rahasia manajerial tidak bocor ke sisi staf bersangkutan baik di UI maupun API.

- **Expected Final Result:** Sistem secara sempurna menegakkan larangan pembuatan catatan diri sendiri dan menjaga kerahasiaan catatan manajerial konfidensial dari penglihatan staf.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar feed catatan pada akun Head of Engineering (memperlihatkan badge rahasia) dan tangkapan layar feed pada akun Employee (memperlihatkan catatan rahasia tersembunyi).
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-HEAD-001: Pengawasan Lintas Anggota dalam Satu Divisi (`Divisi Saya`), Wewenang Kepegawaian, & Penegakan Batasan Lintas Fungsi oleh Head
- **Test Case ID:** `TC-HEAD-001`
- **Scenario ID:** `SCN-HEAD-01`
- **Requirement ID:** `FR-08`, `FR-48`, `FR-51`, `DEC-010`, `CR-013`
- **Judul:** Pengawasan Seluruh Anggota Divisi (`Divisi Saya`), Wewenang Kepegawaian, & Penegakan Batasan Lintas Fungsi oleh Head of Engineering
- **Tujuan:** Memvalidasi wewenang Kepala Divisi (`HEAD` Scope per SAD IV.4 & `CR-013`) menggunakan akun resmi **Head of Engineering (`head.eng@dutamedia.com` - Arif Budiman)**: memastikan Head langsung melihat tab **`Divisi Saya`** (`scope=function`) pada `/dashboard` yang merangkum seluruh anggota divisinya (`Bambang Pratama`, `Aditya Nugroho`, `Siti Rahma`, `Fajar Ramadhan`) tanpa tab `Seluruh Perusahaan`, memegang wewenang kepegawaian divisinya (`/leave/queue`, `/corrections/review`) serta `/coaching` (karena memiliki bawahan), **TIDAK** melihat grup `Administration` (dan ditolak 403 di `/admin/policies`), serta ditolak dengan **HTTP 403 (`AUTH_FORBIDDEN_SCOPE`)** jika mencoba mengakses data staf divisi lain (`Maya Putri` - `RnD`) atau `scope=management`.
- **Modul / Halaman:** Pulse Dashboard (`/dashboard`), Persetujuan Cuti (`/leave/queue`), Catatan Coaching (`/coaching`), & Proteksi Administrasi (`/admin/policies`)
- **Kategori Pengujian:** RBAC / Function-Wide Scope Enforcement
- **Teknik Desain Test Case:** Equivalence Partitioning & Scope Boundary Testing
- **Role:** `HEAD` (`head.eng@dutamedia.com` - Arif Budiman, Head of Engineering)
- **Priority:** **High (P1)**
- **Risk Rationale:** Head memerlukan visibilitas makro dan wewenang kepegawaian atas seluruh anggota yang sejajar di bawah divisinya tanpa melanggar yurisdiksi divisi lain atau wewenang CEO.
- **Preconditions:** Login sebagai **Arif Budiman (`head.eng@dutamedia.com` / `Password123!`)** yang berperan `HEAD` pada divisi `Engineering`. Di bawah Arif Budiman terdapat Technical Lead 1 (`Bambang Pratama`) dan para Developer (`Aditya Nugroho`, `Siti Rahma`, `Fajar Ramadhan`). Di luar divisi Engineering terdapat `Maya Putri` (`designer@dutamedia.com` - Principal Engineer pada divisi `RnD`).
- **Test Data ID:** `TD-HEAD-01` (Data divisi Engineering dan data divisi R&D)
- **Persiapan Sebelum Tes:** Login sebagai `head.eng@dutamedia.com` (`Password123!`) dan buka `/dashboard`.

**Langkah Pengujian:**
1. **Langkah 1 (Pengawasan Seluruh Anggota Divisi pada Tab `Divisi Saya` & Antrean Cuti Divisi)**
   - **Aksi:** Buka Pulse Dashboard (`/dashboard`) dan amati tab scope yang aktif, lalu cek sekilas `/leave/queue`.
   - **Lokasi:** Rute `/dashboard` dan `/leave/queue`.
   - **Data:** Scope: `Divisi Saya` (`scope=function`)
   - **Hasil yang diharapkan:**
     - Pada `/dashboard`, hanya tab **"Divisi Saya"** (`data-testid="scope-tab-function"`) yang tampil dan aktif secara default (tab **"Seluruh Perusahaan"** TIDAK muncul karena Arif bukan CEO, dan tab **"Tim (Proyek)"** tidak muncul karena Arif adalah Escalation Reviewer/Head Divisi, bukan Project Lead langsung).
     - Dasbor menampilkan metrik konsolidasi seluruh anggota divisi Engineering beserta kartu "Personil Butuh Bantuan Hari Ini" (`Aditya Nugroho`).
     - Pada `/leave/queue`, tampil permohonan cuti bawahan langsungnya di divisi Engineering (`Siti Rahma`), namun TIDAK menampilkan permohonan cuti `Maya Putri` (divisi `RnD`).
   - **Verifikasi:** Data personel dan kepegawaian divisi Engineering tampil utuh dalam cakupan `HEAD` of Engineering.
2. **Langkah 2 (Verifikasi Aturan Sidebar & Hak Akses Halaman: Poin 1, 2, dan 3)**
   - **Aksi:** Amati grup dan menu yang tampil pada sidebar kiri akun `HEAD` (`Arif Budiman`), lalu coba akses langsung URL `/admin/policies` melalui address bar browser.
   - **Lokasi:** Sidebar kiri & rute `/admin/policies`, `/leave/queue`, `/corrections/review`, `/coaching`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:**
     - **Poin 1 (Isolasi Grup `Administration`):** Grup navigasi **`Administration` TIDAK MUNCUL** di sidebar akun `HEAD` (hanya muncul untuk `SYSTEM_ADMIN`, `HRGA`, dan `CEO_MANAGEMENT`). Saat `HEAD` mencoba mengakses `/admin/policies` via URL, router guard mencegat dan mengalihkan ke `/forbidden` (`403 — Akses Dibatasi`).
     - **Poin 2 (Menu Kepegawaian di Grup `Management`):** Menu `Persetujuan Cuti` (`/leave/queue`) dan `Review Koreksi & Cuti` (`/corrections/review`) tampil dan dapat diakses oleh `HEAD` (`Arif Budiman`) serta `CEO_MANAGEMENT` (dan Reviewer Sementara aktif), namun disembunyikan & ditolak 403 bagi akun selain itu (seperti `SUPERVISOR` / Tech Lead murni).
     - **Poin 3 (`Catatan Coaching` Berbasis Kepemilikan Bawahan):** Menu `Catatan Coaching` (`/coaching`) tampil dan dapat diakses karena `Arif Budiman` memiliki bawahan langsung aktif (`hasSubordinates = true`), serta disembunyikan & ditolak 403 bagi akun yang tidak memiliki bawahan.
   - **Verifikasi:** Visibilitas sidebar dan proteksi halaman berjalan sinkron 100% sesuai aturan Role & Kewenangan.
3. **Langkah 3 (Penolakan Akses Lintas Batas Divisi & Scope CEO)**
   - **Aksi:** Melalui Developer Console, coba panggil:
     a. Data riwayat komitmen staf divisi R&D (`Maya Putri` - `designer@dutamedia.com`) via `GET /api/daily/history?userId={id-maya}` (atau review cuti Maya Putri via `POST /api/v1/leave/requests/{id-cuti-maya}/review`).
     b. Dashboard scope CEO (`GET /api/dashboard/pulse?scope=management`) dan filter divisi lain (`GET /api/dashboard/pulse?scope=function&function=RnD`).
   - **Lokasi:** Browser Developer Console (F12).
   - **Data:** ID Pengguna Maya Putri (divisi `RnD`) & query scope lintas batas.
   - **Hasil yang diharapkan:** Backend `ScopeResolverService` dan `DashboardController` menolak seluruh permintaan lintas batas tersebut dengan status **HTTP 403 Forbidden (`AUTH_FORBIDDEN_SCOPE`)**.
   - **Verifikasi:** Tidak ada kebocoran data komitmen/cuti divisi R&D maupun akses scope CEO kepada Head of Engineering.

- **Expected Final Result:** Head of Engineering (`head.eng@dutamedia.com`) berhasil menjalankan pengawasan terpadu seluruh staf di bawah divisinya melalui tab `Divisi Saya`, `/leave/queue`, `/corrections/review`, dan `/coaching`, tidak melihat grup `Administration` (403 pada `/admin/policies`), serta dibatasi secara presisi dari intrusi data divisi lain maupun scope CEO (HTTP 403).
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar Pulse Dashboard tab `Divisi Saya` pada akun `head.eng@dutamedia.com` dan tangkapan layar penolakan 403 saat memanggil data lintas divisi/scope.
- **Actual Result:** Terverifikasi 100% pada staging production (`dutamedia-workpulse.vercel.app`) oleh Harry pada 05 November 2026. Langkah 1: Tab scope "Divisi Saya" aktif mandiri tanpa kebocoran scope atau tab tidak sah; antrean cuti menampilkan anggota divisi Engineering. Langkah 2: Sidebar grup `Administration` bersih (tidak tampil bagi Head) dan akses langsung `/admin/policies` dialihkan 403 /forbidden; menu kepegawaian `/leave/queue` dan `/corrections/review` tampil dan dapat diakses; menu `/coaching` tampil karena memiliki bawahan langsung. Langkah 3: Eksekusi console fetch ke riwayat Maya Putri (RnD), scope CEO (`scope=management`), dan filter divisi luar (`scope=function&function=RnD`) seluruhnya ditolak backend dengan HTTP 403 Forbidden (`AUTH_FORBIDDEN_SCOPE`).
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-05
- **Defect ID:** -
- **Retest Result:** Pass
- **Catatan:** Menggunakan akun resmi Head of Engineering (`head.eng@dutamedia.com` - Arif Budiman) tanpa perlu mengubah role akun lain.

---

### TC-PM-001: Pengelolaan Kendala Berkonteks Otoritas Proyek & Pemantauan Radar Risiko oleh Project Manager
- **Test Case ID:** `TC-PM-001`
- **Scenario ID:** `SCN-PM-01`
- **Requirement ID:** `FR-30`, `FR-31`, `FR-49`, `DEC-002`, `DEC-010`
- **Judul:** Pengelolaan Kendala Berkonteks Otoritas Proyek & Pemantauan Radar Risiko oleh Project Manager
- **Tujuan:** Memvalidasi kapabilitas spesifik Project Manager (Project Authority Scope per SAD IV.4 & Prototipe 05): memantau Radar Risiko Proyek (`/projects/risk`) untuk proyek yang diampunya, memeriksa indikator Health Score dan Top Blocker, serta memiliki wewenang sah untuk mengonfirmasi (*Acknowledge*) dan menyelesaikan (*Resolve*) kendala yang diajukan dengan konteks `PROJECT_AUTHORITY` dan kode proyek penugasan.
- **Modul / Halaman:** Radar Risiko Proyek (`/projects/risk`) & Antrean Blocker (`/blockers`)
- **Kategori Pengujian:** Happy Path / Project Authority Governance
- **Teknik Desain Test Case:** Decision Table & Functional Workflow
- **Role:** `PROJECT_MANAGER` (`pm@dutamedia.com` - Dimas Prakoso, Project Manager 1) / Project Authority Lead (`lead.tech@dutamedia.com` - Bambang Pratama, Technical Lead 1 untuk proyek `WP-CORE` & `PRJ-CORE`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Hambatan berkonteks proyek yang tidak dapat diintervensi oleh PM/Project Lead akan menghambat milestone rilis klien dan memicu keterlambatan deliverables.
- **Preconditions:** Login sebagai pengguna yang memiliki penugasan Project Authority aktif pada proyek `WP-CORE` (`lead.tech@dutamedia.com`) atau `PRJ-PORTAL` (`pm@dutamedia.com`). Terdapat 1 tiket kendala yang dilaporkan oleh karyawan dengan memilih konteks wewenang `PROJECT_AUTHORITY` dan kode proyek `WP-CORE`.
- **Test Data ID:** `TD-PM-01` (Tiket kendala proyek `WP-CORE` dan proyek penugasan)
- **Persiapan Sebelum Tes:** Masuk ke halaman `/projects/risk`.

**Langkah Pengujian:**
1. **Langkah 1 (Pemantauan Radar Risiko Proyek)**
   - **Aksi:** Buka menu "Radar Risiko Proyek" pada rute `/projects/risk`.
   - **Lokasi:** Rute `/projects/risk`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman menampilkan kartu portofolio proyek. Proyek `WP-CORE` (WorkPulse Core Engine) tampil dengan indikator Health Score numerik, badge tingkat risiko (`HIGH` atau `CRITICAL`), jumlah komitmen aktif anggota proyek, dan teks kendala utama (*Top Blocker Title*).
   - **Verifikasi:** Kartu proyek menampilkan data yang relevan dengan kendala proyek yang sedang aktif.
2. **Langkah 2 (Pemeriksaan Detail Risiko Proyek)**
   - **Aksi:** Klik pada kartu proyek `WP-CORE` untuk membuka modal dialog rincian risiko.
   - **Lokasi:** Modal rincian proyek pada `/projects/risk`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal dialog terbuka menampilkan daftar anggota tim proyek yang sedang terhambat, rincian kendala kritis, serta tombol navigasi cepat `Tangani Blocker di Antrean`.
   - **Verifikasi:** Modal menampilkan data terpadu dan tautan menuju antrean blocker berfungsi.
3. **Langkah 3 (Penyelesaian Kendala Berkonteks Otoritas Proyek)**
   - **Aksi:** Buka halaman `/blockers`, temukan tiket kendala berlabel tag `[WP-CORE]`, dan klik tombol "Tandai Selesai (Resolve)". Masukkan deskripsi resolusi proyek: `Mitigasi dependensi API telah disepakati bersama pihak ketiga; credential staging baru telah aktif.` Klik "Konfirmasi Selesai".
   - **Lokasi:** Halaman `/blockers` pada tiket bertanda `PROJECT_AUTHORITY`.
   - **Data:** Resolusi: `Mitigasi dependensi API telah disepakati bersama pihak ketiga; credential staging baru telah aktif.` (>= 10 karakter).
   - **Hasil yang diharapkan:** PM berwenang penuh menyelesaikan kendala proyek tersebut. Status tiket berubah menjadi `RESOLVED`, stempel waktu `resolvedAt` terisi, dan catatan solusi tersimpan permanen di database.
   - **Verifikasi:** Status tiket terbarui menjadi hijau `RESOLVED` dan kartu risiko proyek pada `/projects/risk` menghitung penurunan risiko (Health Score meningkat).

- **Expected Final Result:** Project Manager berhasil mengawasi kesehatan proyek dan menyelesaikan hambatan operasional berbasis otoritas proyek secara independen.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar kartu radar risiko proyek dan tangkapan layar modal penyelesaian blocker proyek berstatus RESOLVED.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-HRGA-001: Pengawasan Antrean Peristiwa Kepatuhan & Penindakan via Catatan Pembinaan oleh HRGA
- **Test Case ID:** `TC-HRGA-001`
- **Scenario ID:** `SCN-HRGA-01`
- **Requirement ID:** `FR-35`, `FR-44`, `FR-45`, `DEC-007`
- **Judul:** Pengawasan Antrean Peristiwa Kepatuhan & Penindakan via Catatan Pembinaan oleh HRGA
- **Tujuan:** Memvalidasi fungsi utama Antrean Kepatuhan HRGA (`/compliance`): memverifikasi pendaratan kanonikal HRGA di `/compliance`, memfilter peristiwa pelanggaran berdasarkan tahap (*stage*) dan status tindak lanjut, memeriksa ringkasan metrik kepatuhan (*Compliance Summary*), serta menindaklanjuti (*address*) peristiwa kepatuhan dengan menautkan ID catatan pembinaan manajerial.
- **Modul / Halaman:** Antrean Kepatuhan (`/compliance`)
- **Kategori Pengujian:** Happy Path / Compliance Governance
- **Teknik Desain Test Case:** Equivalence Partitioning & Workflow Testing
- **Role:** `HRGA` (`hrga@dutamedia.com` - Dewi Lestari)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Kegagalan fungsi antrean kepatuhan membuat pelanggaran harian (tidak submit pagi/EOD) tidak terpantau dan tidak tertindaklanjuti secara resmi oleh HRGA.
- **Preconditions:** Dewi Lestari login sebagai HRGA dan mendarat di `/compliance`. Di database terdapat minimal 1 peristiwa kepatuhan `NO_SUBMISSION` dan 1 peristiwa berulang `PATTERN_FLAG_3X`. Telah ada ID catatan pembinaan manajerial yang valid.
- **Test Data ID:** `TD-HRGA-01` (Peristiwa kepatuhan aktif dan ID Manager Note tindak lanjut)
- **Persiapan Sebelum Tes:** Pastikan akun login adalah `hrga@dutamedia.com`.

**Langkah Pengujian:**
1. **Langkah 1 (Verifikasi Pendaratan Kanonikal & Kartu Ringkasan Kepatuhan)**
   - **Aksi:** Login sebagai `hrga@dutamedia.com` dan amati halaman yang pertama kali terbuka.
   - **Lokasi:** Pendaratan login pertama kali.
   - **Data:** Email: `hrga@dutamedia.com`, Password: `Password123!`
   - **Hasil yang diharapkan:** Sistem secara otomatis mengarahkan peramban ke rute kanonikal HRGA: `/compliance`. Di bagian atas halaman, tampil kartu ringkasan kepatuhan (*Compliance Summary Cards*): Total Peristiwa, Pelanggaran Terbuka (*Open*), Pola Berulang >= 3x (*Pattern Flag*), Peringatan Tercatat (*Warning*), dan Eskalasi Formal (*Escalation*).
   - **Verifikasi:** URL browser adalah `/compliance` dan seluruh kartu metrik menampilkan data numerik valid.
2. **Langkah 2 (Pengujian Filter Tahap Pelanggaran / Stage Filter)**
   - **Aksi:** Gunakan dropdown filter "Tahap Pelanggaran", pilih opsi `PATTERN_FLAG_3X` (Pola Berulang 3 Hari).
   - **Lokasi:** Dropdown filter tahap di atas tabel antrean kepatuhan.
   - **Data:** Filter: `PATTERN_FLAG_3X`
   - **Hasil yang diharapkan:** Tabel antrean kepatuhan menyaring baris secara instan dan hanya menampilkan peristiwa yang berada pada tahap pola berulang 3 hari dengan badge peringatan merah tua.
   - **Verifikasi:** Seluruh baris yang tampil memiliki badge tahap `PATTERN_FLAG_3X`.
3. **Langkah 3 (Tindak Lanjut Peristiwa via Penautan Catatan Pembinaan)**
   - **Aksi:** Klik tombol "Tindak Lanjuti (Address)" pada salah satu baris peristiwa pelanggaran terbuka. Pada modal yang muncul, masukkan ID Catatan Pembinaan Manajerial yang sah dan klik "Konfirmasi Tindak Lanjut".
   - **Lokasi:** Modal tindak lanjut peristiwa kepatuhan.
   - **Data:** `managerNoteId`: ID catatan coaching yang telah dibuat atasan.
   - **Hasil yang diharapkan:** Sistem memproses penautan. Status tindak lanjut (*followUpStatus*) berubah menjadi `ADDRESSED`, stempel waktu diperbarui, dan nama atasan pembina tertera pada kolom tindak lanjut. Muncul toast sukses: "Peristiwa kepatuhan berhasil ditindaklanjuti."
   - **Verifikasi:** Peristiwa tersebut beralih status dari *OPEN* menjadi *ADDRESSED* dan kartu metrik pelanggaran terbuka berkurang 1.

- **Expected Final Result:** HRGA dapat memantau seluruh dinamika kepatuhan perusahaan dan menyelesaikan siklus penindakan pelanggaran secara akuntabel.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar halaman `/compliance` dengan kartu ringkasan dan tangkapan layar status peristiwa kepatuhan yang berhasil diubah menjadi ADDRESSED.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-HRGA-002: Pemberian Dispensasi Resmi Terikat Waktu & Validasi Formulir oleh HRGA
- **Test Case ID:** `TC-HRGA-002`
- **Scenario ID:** `SCN-HRGA-02`
- **Requirement ID:** `FR-46`, `FR-47`, `DEC-007`
- **Judul:** Pemberian Dispensasi Resmi Terikat Waktu & Validasi Formulir oleh HRGA
- **Tujuan:** Memvalidasi pengelolaan dispensasi terikat waktu oleh HRGA (`/exemptions`): memastikan HRGA dapat menerbitkan dispensasi resmi (Dinas Luar, Tugas Khusus, dsb.) dengan nomor referensi kedinasan yang sah agar karyawan tidak terkena pencatatan pelanggaran kepatuhan otomatis, serta memvalidasi penolakan sistem saat formulir diisi dengan tanggal tidak valid atau data wajib yang kosong.
- **Modul / Halaman:** Manajemen Dispensasi (`/exemptions`)
- **Kategori Pengujian:** Happy Path & Negative Validation Testing
- **Teknik Desain Test Case:** Equivalence Partitioning & Boundary Value Analysis
- **Role:** `HRGA` (`hrga@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Kesalahan pencatatan dispensasi menyebabkan karyawan yang bertugas dinas luar secara sah tetap tercatat sebagai pelanggar disiplin kerja harian.
- **Preconditions:** Login sebagai `hrga@dutamedia.com`. Masuk ke menu "Manajemen Dispensasi" (`/exemptions`).
- **Test Data ID:** `TD-HRGA-02` (Karyawan penerima, tanggal mulai 5 hari ke depan, tanggal selesai 8 hari ke depan, Kategori: 'Dinas Luar', No Ref: 'ST/2026/XI/088', Alasan: 'Pelaksanaan instalasi server on-site di kantor klien Surabaya')
- **Persiapan Sebelum Tes:** Berada di halaman `/exemptions`.

**Langkah Pengujian:**
1. **Langkah 1 (Uji Validasi Tanggal Terbalik / Negative Validation)**
   - **Aksi:** Pada formulir pembuatan dispensasi, pilih karyawan (Aditya Nugroho), masukkan tanggal mulai `2026-11-20` dan tanggal selesai `2026-11-15` (tanggal selesai lebih awal). Klik tombol "Terbitkan Dispensasi".
   - **Lokasi:** Formulir pembuatan dispensasi `/exemptions`.
   - **Data:** Mulai: `2026-11-20`, Selesai: `2026-11-15`
   - **Hasil yang diharapkan:** Sistem menolak pengiriman formulir. Muncul pesan galat validasi: *"Tanggal selesai dispensasi tidak boleh lebih awal dari tanggal mulai."*
   - **Verifikasi:** Tidak ada data dispensasi baru yang tersimpan di tabel.
2. **Langkah 2 (Penerbitan Dispensasi Resmi yang Sah / Happy Path)**
   - **Aksi:** Perbaiki tanggal formulir: tanggal mulai `2026-11-15`, tanggal selesai `2026-11-20`. Pilih kategori `Dinas Luar`, masukkan Nomor Surat Tugas: `ST/2026/XI/088`, dan masukkan alasan: `Pelaksanaan instalasi server on-site di kantor klien Surabaya`. Klik "Terbitkan Dispensasi".
   - **Lokasi:** Formulir `/exemptions`.
   - **Data:** Karyawan: Aditya Nugroho, Mulai: `2026-11-15`, Selesai: `2026-11-20`, Kategori: `Dinas Luar`, No Ref: `ST/2026/XI/088`, Alasan: `Pelaksanaan instalasi server on-site di kantor klien Surabaya`.
   - **Hasil yang diharapkan:** Dispensasi berhasil diterbitkan. Muncul toast sukses: "Dispensasi resmi terikat waktu berhasil diterbitkan." Baris dispensasi baru muncul pada tabel riwayat dispensasi lengkap dengan nama karyawan, kategori, rentang tanggal, nomor referensi, dan identitas pembuat (Dewi Lestari).
   - **Verifikasi:** Baris dispensasi aktif terdaftar dan tersimpan di database. Selama rentang tanggal tersebut, sistem background tidak akan menerbitkan event NO_SUBMISSION untuk karyawan bersangkutan.

- **Expected Final Result:** HRGA dapat menerbitkan dispensasi resmi terikat waktu secara tertib administrasi dan sistem menolak input tanggal yang tidak logis.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar pesan validasi tanggal salah dan tangkapan layar tabel riwayat dispensasi memuat baris baru yang berhasil diterbitkan.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-HRGA-003: Pendelegasian Wewenang Peninjau Sementara (Temporal Reviewer) oleh HRGA
- **Test Case ID:** `TC-HRGA-003`
- **Scenario ID:** `SCN-HRGA-03`
- **Requirement ID:** `FR-08`, `FR-52`, `DEC-010`
- **Judul:** Pendelegasian Wewenang Peninjau Sementara (Temporal Reviewer) oleh HRGA
- **Tujuan:** Memvalidasi pengelolaan peninjau sementara (*Temporal Reviewer Assignment* per SAD IV.4): memastikan HRGA dapat menugaskan seorang pejabat peninjau sementara lintas divisi untuk rentang tanggal tertentu (misal menggantikan Team Lead yang cuti), dan memverifikasi bahwa pejabat yang ditunjuk memperoleh hak akses sah untuk meninjau data divisi sasaran selama jendela waktu aktif.
- **Modul / Halaman:** Reviewer Sementara (`/admin/temporary-reviewers`)
- **Kategori Pengujian:** Happy Path / Delegation Governance
- **Teknik Desain Test Case:** Role Transition & Time-Window Access Testing
- **Role:** `HRGA` (`hrga@dutamedia.com`) dilanjutkan `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Kegagalan pendelegasian reviewer sementara membuat antrean persetujuan cuti dan review koreksi macet saat atasan definitif berhalangan/cuti panjang.
- **Preconditions:** Login sebagai `hrga@dutamedia.com`. Rian Kurniawan (Creative Lead) sedang cuti. Bambang Pratama (Tech Lead) akan ditugaskan sebagai reviewer sementara untuk divisi Creative/RnD.
- **Test Data ID:** `TD-HRGA-03` (Delegasi: Bambang Pratama, Fungsi Target: `RnD / Creative`, Rentang: Hari ini s.d. 7 hari ke depan, Alasan: `Pelimpahan wewenang peninjauan sementara selama Creative Lead cuti tahunan`)
- **Persiapan Sebelum Tes:** Masuk ke halaman `/admin/temporary-reviewers`.

**Langkah Pengujian:**
1. **Langkah 1 (Penerbitan Delegasi Reviewer Sementara oleh HRGA)**
   - **Aksi:** Buka halaman `/admin/temporary-reviewers`. Pada formulir delegasi baru, pilih pengguna peninjau: Bambang Pratama, pilih fungsi target peninjauan: `RnD` (atau `Engineering`), tentukan tanggal mulai: hari ini, tanggal selesai: 7 hari ke depan, dan masukkan catatan justifikasi kedinasan. Klik "Tetapkan Peninjau Sementara".
   - **Lokasi:** Formulir `/admin/temporary-reviewers`.
   - **Data:** Peninjau: Bambang Pratama, Target: `RnD`, Rentang: 7 hari aktif, Catatan: `Pelimpahan wewenang peninjauan sementara selama Creative Lead cuti tahunan`.
   - **Hasil yang diharapkan:** Backend mencatat penugasan ke tabel `TemporaryReviewerAssignment`. Muncul toast sukses: "Peninjau sementara berhasil ditetapkan." Daftar riwayat peninjau sementara menampilkan baris penugasan aktif Bambang Pratama untuk fungsi RnD.
   - **Verifikasi:** Penugasan tercatat aktif (`isActive = true` dan tanggal berada dalam rentang berlaku).
2. **Langkah 2 (Verifikasi Wewenang Akses Sah oleh Pejabat Terdelegasi)**
   - **Aksi:** Logout dari HRGA dan login kembali sebagai Bambang Pratama (`lead.tech@dutamedia.com`). Buka antrean persetujuan cuti atau koreksi yang memuat data staf Creative (Maya Putri).
   - **Lokasi:** Halaman `/leave/queue` atau `/corrections/review` pada akun Bambang Pratama.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Berkat evaluasi lapisan ke-5 pada `ScopeResolverService.canAccessUser` (*activeDelegations*), Bambang Pratama kini **DIIZINKAN** mengakses dan meninjau data permohonan staf Creative tanpa menghasilkan galat 403.
   - **Verifikasi:** Permohonan staf fungsi RnD/Creative terbuka dengan status aksi aktif (dapat di-Approve/Reject).

- **Expected Final Result:** Mekanisme peninjau sementara terbukti berjalan mulus dari penetapan oleh HRGA hingga perluasan wewenang akses sah pada sisi pejabat terdelegasi.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar tabel pendelegasian reviewer sementara di HRGA dan tangkapan layar akun Bambang berhasil mengakses data fungsi Creative.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-CEO-001: Pengawasan Eksekutif Universal (`Seluruh Perusahaan` + Filter Divisi/Proyek), Ekspor Berkas Audit, & Tata Kelola Kebijakan oleh Direksi
- **Test Case ID:** `TC-CEO-001`
- **Scenario ID:** `SCN-CEO-01`
- **Requirement ID:** `FR-08`, `FR-48`, `FR-50`, `DEC-010`, `CR-013`
- **Judul:** Pengawasan Eksekutif Universal (`Seluruh Perusahaan` + Filter Divisi/Proyek), Ekspor Berkas Audit, & Tata Kelola Kebijakan oleh Direksi
- **Tujuan:** Memvalidasi hak akses dan wewenang tingkat tertinggi Direksi / CEO (`CEO_MANAGEMENT`): memastikan Direktur memiliki visibilitas universal pada `/dashboard` melalui tab **`Seluruh Perusahaan`** (`scope=management`) lengkap dengan **Filter Divisi** (`data-testid="filter-division-select"`) dan **Filter Proyek** (`data-testid="filter-project-select"`), dapat mengunduh berkas ekspor audit data resmi perusahaan (`/api/v1/reports/export`), serta memiliki wewenang menetapkan penugasan pemilik kebijakan (*Policy Owner Assignment*) di `/admin/policies`.
- **Modul / Halaman:** Pulse Dashboard (`/dashboard`), Laporan Eksekutif (`/reports`), & Kebijakan (`/admin/policies`)
- **Kategori Pengujian:** Happy Path / Executive Governance & Universal Scope Testing
- **Teknik Desain Test Case:** Universal Boundary & Data Export Verification
- **Role:** `CEO_MANAGEMENT` (`direktur@dutamedia.com` - Hendra Wijaya)
- **Priority:** **High (P1)**
- **Risk Rationale:** Pimpinan tertinggi membutuhkan jaminan kelancaran akses audit menyeluruh lintas 7 divisi dan seluruh proyek tanpa terhalang sekat fungsional operasional.
- **Preconditions:** Login sebagai `direktur@dutamedia.com` (Hendra Wijaya) dan mendarat di `/dashboard`.
- **Test Data ID:** `TD-CEO-01` (Kredensial Direktur dan parameter ekspor periode '2026-11')
- **Persiapan Sebelum Tes:** Pastikan akun login adalah `direktur@dutamedia.com`.

**Langkah Pengujian:**
1. **Langkah 1 (Verifikasi Visibilitas Universal Pulse Dashboard & Filter Divisi/Proyek)**
   - **Aksi:** Buka halaman Pulse Dashboard (`/dashboard`). Periksa tab scope yang aktif secara default (`Seluruh Perusahaan`), lalu uji pergantian dropdown **Filter Divisi** (`Semua Divisi`, `Divisi Engineering`, `Divisi R&D & Technical Advisory`, dll.) serta **Filter Proyek** (`Semua Proyek`, `[PRJ-CORE]`, dll.).
   - **Lokasi:** Rute `/dashboard`.
   - **Data:** Scope: `Seluruh Perusahaan` (`scope=management`), Filter Divisi: `Engineering` & `RnD`, Filter Proyek: `PRJ-CORE`.
   - **Hasil yang diharapkan:** Tab **`Seluruh Perusahaan`** (`data-testid="scope-tab-management"`) aktif secara default. Dropdown Filter Divisi (`data-testid="filter-division-select"`) dan Filter Proyek (`data-testid="filter-project-select"`) tampil dan memperbarui metrik agregat perusahaan serta daftar "Personil Butuh Bantuan Hari Ini" secara dinamis sesuai divisi/proyek yang dipilih tanpa galat scope boundary (403).
   - **Verifikasi:** Direktur dapat memfilter dan melihat detail data staf divisi maupun proyek manapun secara langsung.
2. **Langkah 2 (Pengujian Unduh Ekspor Berkas Audit Resmi / Export Report)**
   - **Aksi:** Buka menu "Laporan Eksekutif" pada rute `/reports`. Pilih periode laporan (misal: Bulan Berjalan) dan klik tombol "Ekspor Berkas Audit (CSV/JSON)".
   - **Lokasi:** Halaman `/reports` pada tombol aksi ekspor.
   - **Data:** Periode: `2026-11` (Bulan berjalan).
   - **Hasil yang diharapkan:** Backend memproses endpoint `/api/v1/reports/export?period=2026-11`. Peramban secara otomatis memulai pengunduhan berkas lampiran dengan header `Content-Disposition: attachment; filename="audit-report-2026-11.csv"`. Berkas terunduh secara utuh dan memuat rekapitulasi komitmen, kendala, dan kepatuhan karyawan.
   - **Verifikasi:** Berkas terunduh di folder Downloads peramban dengan ukuran $> 0$ bytes dan format kolom valid.
3. **Langkah 3 (Penetapan Pemilik Kebijakan / Policy Owner Assignment)**
   - **Aksi:** Buka menu "Kebijakan & Cut-off" pada rute `/admin/policies`. Gulir ke bagian "Penugasan Pemilik Kebijakan (Policy Owners)". Klik tombol "Tetapkan Pemilik", pilih kategori `CHECKIN_TIMING`, dan pilih nama Dewi Lestari (HRGA) sebagai penanggung jawab kebijakan. Klik "Simpan Penugasan".
   - **Lokasi:** Bagian Policy Owners di `/admin/policies`.
   - **Data:** Kategori: `CHECKIN_TIMING`, Pemilik: Dewi Lestari.
   - **Hasil yang diharapkan:** Permintaan POST ke `/policies/owners` berhasil diproses berkat peran `@Roles(CanonicalRole.CEO_MANAGEMENT)`. Pemilik kebijakan terbarui di antarmuka dan tercatat pada log audit sistem.
   - **Verifikasi:** Nama Dewi Lestari tertera sebagai pemilik resmi kategori kebijakan waktu komitmen.

- **Expected Final Result:** Direksi memiliki kendali pengawasan eksekutif universal tanpa batas, dapat mengekspor data audit kepatuhan resmi, dan menetapkan pemilik kebijakan operasional.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar ringkasan Laporan Eksekutif, tangkapan layar berkas ekspor audit yang berhasil diunduh, dan kartu penetapan pemilik kebijakan.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-ADMN-003: Penegakan Pemisahan Tugas (Separation of Duties - IMP-026) & Pemblokiran Total Akses Workspace Admin
- **Test Case ID:** `TC-ADMN-003`
- **Scenario ID:** `SCN-ADMN-03`
- **Requirement ID:** `FR-08`, `FR-50`, `DEC-010`
- **Judul:** Penegakan Pemisahan Tugas (Separation of Duties - IMP-026) & Pemblokiran Total Akses Workspace Admin
- **Tujuan:** Menguji dan memvalidasi secara ketat penegakan Prinsip Pemisahan Tugas (Separation of Duties - IMP-026) untuk peran SYSTEM_ADMIN: memastikan sidebar navigasi admin tidak memuat grup menu 'Workspace' sama sekali, serta memverifikasi bahwa upaya mengakses URL operasional harian (`/daily/morning`, `/daily/eod`, `/daily/history`, `/raise-blockers`, `/leave/my`, `/corrections/*`) secara sengaja via address bar peramban diblokir total oleh Route Guard dan dialihkan ke halaman Error 403 `/forbidden`.
- **Modul / Halaman:** Navigasi Sidebar, Route Guard, & Halaman Error (`/forbidden`)
- **Kategori Pengujian:** Security / RBAC / Separation of Duties (IMP-026)
- **Teknik Desain Test Case:** Negative Testing & Route Access Boundary Testing
- **Role:** `SYSTEM_ADMIN` (`admin@dutamedia.com` - Sistem Administrator)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Memberikan akses operasional harian (input komitmen tugas) kepada persona System Administrator merusak prinsip tata kelola pemisahan wewenang antara pengatur sistem dan pekerja operasional yang diawasi.
- **Preconditions:** Server backend dan frontend aktif. Login sebagai `admin@dutamedia.com`.
- **Test Data ID:** `TD-ADMN-03` (URL Workspace Operasional: `/daily/morning`, `/daily/additional-work`, `/daily/eod`, `/daily/history`, `/raise-blockers`, `/leave/my`, `/corrections/morning`, `/corrections/eod`)
- **Persiapan Sebelum Tes:** Masuk ke sistem sebagai `admin@dutamedia.com` dan pastikan mendarat di `/admin/organization`.

**Langkah Pengujian:**
1. **Langkah 1 (Verifikasi Ketiadaan Grup Menu Workspace di Sidebar)**
   - **Aksi:** Login sebagai System Admin dan amati seluruh item menu yang ada pada sidebar navigasi enterprise di sisi kiri.
   - **Lokasi:** Sidebar navigasi kiri (`EnterpriseSidebar.vue`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Berkat fungsi `navForRole` (IMP-026), grup menu "Workspace" (yang berisi *My Today*, *Lapor Blocker*, *Riwayat Saya*, *Cuti Saya*, *Koreksi*) disaring dan dibuang sepenuhnya. Sidebar hanya memuat grup menu **Management** dan **Administration**.
   - **Verifikasi:** Tidak ada satu pun tautan rute `/daily/*`, `/leave/my`, atau `/raise-blockers` pada sidebar admin.
2. **Langkah 2 (Pengujian Pembatasan Rute /daily/morning via URL Langsung)**
   - **Aksi:** Pada address bar peramban, ketik URL secara manual: `http://localhost:5173/daily/morning` dan tekan Enter.
   - **Lokasi:** Address bar peramban.
   - **Data:** URL: `/daily/morning`
   - **Hasil yang diharapkan:** Navigation guard di `router/index.ts` memeriksa `meta.roles` pada rute `/daily/morning` yang didefinisikan sebagai `OPERATIONAL_ROLES`. Karena peran `SYSTEM_ADMIN` tidak termasuk dalam `OPERATIONAL_ROLES`, akses dicegat seketika (*interception*). Peramban dialihkan (*redirect*) ke rute `/forbidden?from=%2Fdaily%2Fmorning`.
   - **Verifikasi:** URL peramban adalah `/forbidden`. Halaman menampilkan antarmuka *ErrorPageView* berjenis Akses Ditolak (403 Forbidden) dengan judul "Akses Ditolak / Wewenang Tidak Mencukupi" dan tombol "Kembali ke Beranda Administrasi".
3. **Langkah 3 (Pengujian Pembatasan Rute Operasional Lainnya)**
   - **Aksi:** Uji URL operasional lainnya secara berturut-turut pada address bar:
     a. `/daily/eod`
     b. `/raise-blockers`
     c. `/leave/my`
     d. `/corrections/morning`
   - **Lokasi:** Address bar peramban.
   - **Data:** Daftar URL di atas.
   - **Hasil yang diharapkan:** Seluruh rute tersebut secara konsisten dicegat oleh guard dan dialihkan ke `/forbidden`. Tidak ada celah bagi System Admin untuk mengisi komitmen kerja harian atau mengajukan cuti mandiri.
   - **Verifikasi:** Seluruh 4 rute di atas menghasilkan pengalihan presisi ke `/forbidden`.

- **Expected Final Result:** Prinsip Pemisahan Tugas (IMP-026) terbukti ditegakkan 100% sempurna baik pada elemen antarmuka sidebar maupun pada penjaga rute peramban (*Router Guards*).
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar sidebar admin (tanpa menu Workspace) dan tangkapan layar halaman `/forbidden` saat mencoba mengakses `/daily/morning`.
- **Actual Result:** Prinsip Pemisahan Tugas (Separation of Duties - IMP-026) terbukti ditegakkan: sidebar admin@dutamedia.com bersih total dari kelompok menu WORKSPACE (hanya memuat Management dan Administration), dan percobaan akses URL langsung ke /daily/morning berhasil dicegat oleh client router guard dengan pengalihan ke /forbidden (403 — Akses Dibatasi). Tombol 'Kembali ke Beranda' berhasil mengembalikan admin ke /admin/organization.
- **Execution Status:** Pass
- **Tester:** Harry
- **Execution Date:** 2026-11-05
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** Terverifikasi pemisahan tugas IAM dan proteksi route guard rute operasional untuk persona SYSTEM_ADMIN.

---

### TC-ADMN-004: Konfigurasi Ambang Batas Cut-Off & Jam SLA Blocker dengan Jejak Audit oleh Admin
- **Test Case ID:** `TC-ADMN-004`
- **Scenario ID:** `SCN-ADMN-04`
- **Requirement ID:** `FR-50`, `DEC-008`, `DEC-010`
- **Judul:** Konfigurasi Ambang Batas Cut-Off & Jam SLA Blocker dengan Jejak Audit oleh Admin
- **Tujuan:** Memvalidasi pengelolaan master kebijakan operasional sistem (`/admin/policies`): memastikan System Admin dapat membuat versi kebijakan baru untuk mengubah jam cut-off komitmen pagi/sore dan jam ambang batas SLA eskalasi kendala, serta memverifikasi bahwa perubahan tersebut tercatat lengkap dalam tabel jejak audit (*Audit Trail*) dan langsung aktif mempengaruhi pengguna lain.
- **Modul / Halaman:** Kebijakan & Cut-off (`/admin/policies`)
- **Kategori Pengujian:** Happy Path / System Configuration & Audit Trail
- **Teknik Desain Test Case:** Configuration Change & Audit Verification
- **Role:** `SYSTEM_ADMIN` (`admin@dutamedia.com`)
- **Priority:** **High (P1)**
- **Risk Rationale:** Parameter kebijakan cut-off dan SLA yang tidak dapat diperbarui secara dinamis melumpuhkan fleksibilitas operasional perusahaan saat jam kerja khusus berlaku.
- **Preconditions:** Login sebagai `admin@dutamedia.com`. Masuk ke menu "Kebijakan & Cut-off" (`/admin/policies`).
- **Test Data ID:** `TD-ADMN-04` (Perubahan jam cut-off pagi dari `09:30` menjadi `10:00`, jam on-time dari `09:00` menjadi `09:30`, Justifikasi: 'Penyesuaian jam kerja bulan Ramadhan 2026')
- **Persiapan Sebelum Tes:** Berada di halaman `/admin/policies`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Pada halaman `/admin/policies`, klik tombol "+ Buat Versi Kebijakan Baru".
   - **Lokasi:** Tombol utama di header halaman `/admin/policies`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Modal dialog "Buat Versi Kebijakan Operasional Baru" terbuka.
   - **Verifikasi:** Modal memuat pilihan kategori kebijakan, tanggal mulai berlaku, kolom konfigurasi parameter dinamis, dan textarea alasan perubahan (*Change Justification*).
2. **Langkah 2**
   - **Aksi:** Pilih kategori `CHECKIN_TIMING` (Waktu Komitmen & Evaluasi). Tentukan tanggal mulai berlaku hari ini. Ubah batas tepat waktu pagi menjadi `09:30` dan batas cut-off pagi menjadi `10:00`. Masukkan justifikasi: `Penyesuaian jam kerja bulan Ramadhan 2026`. Klik tombol "Simpan & Terapkan Kebijakan".
   - **Lokasi:** Modal formulir kebijakan baru.
   - **Data:** Kategori: `CHECKIN_TIMING`, Jam Ontime: `09:30`, Jam Cutoff: `10:00`, Justifikasi: `Penyesuaian jam kerja bulan Ramadhan 2026`.
   - **Hasil yang diharapkan:** Kebijakan baru berhasil disimpan ke database. Muncul toast sukses: "Versi kebijakan baru berhasil disimpan dan diterapkan." Daftar kebijakan aktif memperbarui parameter cut-off pagi menjadi 10:00 WIB.
   - **Verifikasi:** Versi kebijakan baru berstatus aktif dan ditandai sebagai kebijakan terkini.
3. **Langkah 3 (Verifikasi Jejak Audit / Audit Trail Log)**
   - **Aksi:** Gulir ke tabel "Jejak Audit Perubahan Kebijakan (Audit Trail)" di bagian bawah halaman.
   - **Lokasi:** Tabel jejak audit pada `/admin/policies`.
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Baris audit baru tercatat pada posisi paling atas, memuat: stempel waktu presisi, nama pembuat (Sistem Administrator), kategori `CHECKIN_TIMING`, teks alasan perubahan (*Justification*), serta rekaman snapshot nilai sebelum dan nilai sesudah (*Value Before & Value After*).
   - **Verifikasi:** Jejak audit mencerminkan perubahan secara transparan dan tidak dapat dihapus/diubah.

- **Expected Final Result:** Kebijakan cut-off sistem berhasil diperbarui secara dinamis dan seluruh jejak riwayat perubahannya terekam akuntabel di audit trail.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar formulir pembuatan kebijakan baru dan tangkapan layar baris tabel audit trail yang merekam perubahan tersebut.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

---

### TC-ADMN-005: Konfigurasi & Pengujian Pengiriman Saluran Notifikasi Integrasi oleh Admin
- **Test Case ID:** `TC-ADMN-005`
- **Scenario ID:** `SCN-ADMN-05`
- **Requirement ID:** `FR-38`, `FR-50`, `DEC-013`
- **Judul:** Konfigurasi & Pengujian Pengiriman Saluran Notifikasi Integrasi oleh Admin
- **Tujuan:** Memvalidasi pengelolaan saluran pengiriman notifikasi sistem (`/admin/notifications`): memastikan System Admin dapat memantau status konfigurasi saluran notifikasi (In-App, Email SMTP, Webhook) serta menjalankan fungsi uji pengiriman pesan (*Test Channel Delivery*) untuk menjamin integrasi pengiriman berjalan tanpa galat.
- **Modul / Halaman:** Saluran Notifikasi (`/admin/notifications`)
- **Kategori Pengujian:** Happy Path / Infrastructure & Notification Integration
- **Teknik Desain Test Case:** Integration Health Check & Action Verification
- **Role:** `SYSTEM_ADMIN` (`admin@dutamedia.com`)
- **Priority:** **Medium (P2)**
- **Risk Rationale:** Saluran notifikasi yang tidak teruji dapat menyebabkan pesan eskalasi blocker darurat gagal terkirim ke email/webhook penerima.
- **Preconditions:** Login sebagai `admin@dutamedia.com`. Masuk ke menu "Saluran Notifikasi" (`/admin/notifications`).
- **Test Data ID:** `TD-ADMN-05` (Saluran: `EMAIL`, Penerima: `admin@dutamedia.com` / Uji Webhook)
- **Persiapan Sebelum Tes:** Berada di halaman `/admin/notifications`.

**Langkah Pengujian:**
1. **Langkah 1**
   - **Aksi:** Buka halaman Saluran Notifikasi pada rute `/admin/notifications`.
   - **Lokasi:** Menu sidebar Administration -> Saluran Notifikasi (`/admin/notifications`).
   - **Data:** Tidak ada.
   - **Hasil yang diharapkan:** Halaman menampilkan kartu-kartu status saluran komunikasi: In-App Notification (Aktif/Default), Email Delivery SMTP (Aktif/Simulasi), dan Slack/Webhook Integration.
   - **Verifikasi:** Kartu memuat status koneksi, konfigurasi endpoint, dan tombol "Uji Pengiriman".
2. **Langkah 2**
   - **Aksi:** Pada kartu saluran Email, klik tombol "Uji Pengiriman (Test Delivery)". Masukkan alamat email tujuan: `admin@dutamedia.com` pada modal yang muncul dan klik "Kirim Pesan Uji".
   - **Lokasi:** Tombol uji pengiriman pada kartu notifikasi email.
   - **Data:** Email tujuan: `admin@dutamedia.com`
   - **Hasil yang diharapkan:** Backend memproses endpoint `/notifications/channels/test` (atau `/notifications/test-delivery`). Pengiriman disimulasikan sukses. Muncul toast/banner hijau: *"Pesan uji coba berhasil dikirim ke saluran EMAIL (Penerima: admin@dutamedia.com)."* Stempel waktu pengujian terakhir terbarui pada kartu.
   - **Verifikasi:** Muncul respons sukses tanpa galat koneksi atau kegagalan transport.

- **Expected Final Result:** System Administrator berhasil menguji keandalan infrastruktur pengiriman notifikasi sistem secara terpadu.
- **Bukti yang Perlu Dikumpulkan:** Tangkapan layar status saluran notifikasi dan tangkapan layar modal hasil sukses uji pengiriman pesan.
- **Actual Result:** 
- **Execution Status:** Not Run
- **Tester:** Harry
- **Execution Date:** 
- **Defect ID:** -
- **Retest Result:** -
- **Catatan:** -

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
- **Role:** Multi-Aktor (`EMPLOYEE`: `dev.frontend@dutamedia.com`, `HEAD`: `head.eng@dutamedia.com` / `SUPERVISOR` Project Lead: `lead.tech@dutamedia.com`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Membuktikan bahwa seluruh modul harian terhubung secara mulus tanpa data terputus di tengah jalan.
- **Preconditions:** Akun Employee (`dev.frontend@dutamedia.com`), Head of Engineering (`head.eng@dutamedia.com`), dan Project Lead (`lead.tech@dutamedia.com`) siap digunakan.
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
- **Modul / Halaman:** Lintas Modul (`/raise-blockers` -> `/blockers` -> `/blockers/aging`)
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
   - **Aksi:** Login sebagai Employee, buka `/raise-blockers`. Buat laporan kendala kritis terkait akses jaringan API server.
   - **Lokasi:** `/raise-blockers`.
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
3. **Langkah 3 (Peninjauan oleh Atasan Langsung / Head of Engineering)**
   - **Aksi:** Logout dari Employee, lalu login sebagai Head of Engineering (`head.eng@dutamedia.com` - Arif Budiman). Buka menu `/corrections/review`.
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
- **Tujuan:** Memvalidasi seluruh perjalanan pengguna terkait izin cuti: pengajuan cuti mandiri oleh karyawan, persetujuan oleh atasan langsung (`Head of Engineering`), pemotongan kuota, dan verifikasi otomatis bahwa saat hari cuti tiba karyawan dibebaskan dari pengisian komitmen dengan status *Superseded by Approved Leave* (DEC-008).
- **Modul / Halaman:** Lintas Modul (`/leave/my` -> `/leave/queue` -> `/compliance` -> `/daily/history`)
- **Kategori Pengujian:** End-to-End User Journey / Automated Reconciliation
- **Teknik Desain Test Case:** Use Case Testing & Decision Table
- **Role:** Multi-Aktor (`EMPLOYEE`, `HEAD`, `HRGA`)
- **Priority:** **Critical (P0)**
- **Risk Rationale:** Membuktikan bahwa integrasi modul cuti dan mesin kepatuhan bekerja sinkron tanpa menghasilkan penalti palsu (*false penalty*) bagi karyawan yang cuti resmi.
- **Preconditions:** Akun Employee (`dev.frontend@dutamedia.com`) memiliki kuota cuti tahunan >= 1 hari. Akun Head of Engineering (`head.eng@dutamedia.com`) dan HRGA (`hrga@dutamedia.com`) aktif.
- **Test Data ID:** `TD-LEAV-01` dan `TD-LEAV-02`
- **Persiapan Sebelum Tes:** Login sebagai Employee.

**Langkah Pengujian:**
1. **Langkah 1 (Pengajuan Cuti Karyawan)**
   - **Aksi:** Login sebagai Employee, buka `/leave/my`. Ajukan cuti tahunan untuk tanggal hari ini (atau simulasi tanggal cuti aktif) dengan alasan jelas.
   - **Lokasi:** `/leave/my`.
   - **Data:** Jenis: `Cuti Tahunan`, Tanggal: Hari ini, Alasan: `Urusan administrasi kependudukan keluarga di luar kota`.
   - **Hasil yang diharapkan:** Pengajuan cuti tersimpan dengan status `PENDING`.
   - **Verifikasi:** Permohonan muncul di tabel riwayat cuti pribadi.
2. **Langkah 2 (Persetujuan oleh Atasan Langsung / Head of Engineering)**
   - **Aksi:** Logout, lalu login sebagai Head of Engineering (`head.eng@dutamedia.com` - Arif Budiman). Buka `/leave/queue`. Klik "Setujui" pada pengajuan cuti Aditya Nugroho.
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
