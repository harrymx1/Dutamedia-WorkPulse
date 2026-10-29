# WorkPulse — UAT Test Scenario Catalog

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Penyusun:** Senior Quality Assurance Engineer & Manual Test Architect  
> **Tanggal:** 29 Oktober 2026  

---

## 1. STRUKTUR & METODOLOGI KATALOG SKENARIO

Katalog ini merangkum seluruh skenario pengujian fungsional, alur bisnis, batasan otorisasi peran, transisi status, dan integrasi lintas-modul. Setiap skenario dirancang untuk memvalidasi satu atau lebih kebutuhan spesifik (FR-01 s.d. FR-55 dan DEC-001 s.d. DEC-013) serta menjadi payung bagi test case terperinci.

### Skema Penomoran Skenario
- `SCN-AUTH-xx`: Modul Autentikasi, Aktivasi Akun, & Kontrol Sesi.
- `SCN-DLYM-xx`: Modul Daily Accountability — Morning Commitment.
- `SCN-DLYA-xx`: Modul Daily Accountability — Additional Work.
- `SCN-DLYE-xx`: Modul Daily Accountability — End-of-Day (EOD) Outcome.
- `SCN-BLKR-xx`: Modul Manajemen Blocker, SLA Aging, & Resolusi.
- `SCN-CORR-xx`: Modul Pengajuan & Review Koreksi (Morning & EOD).
- `SCN-LEAV-xx`: Modul Pengajuan, Review, & Rekonsiliasi Cuti.
- `SCN-COAC-xx`: Modul Bimbingan Manajer (Coaching Notes).
- `SCN-DASH-xx`: Modul Dasbor Operasional, Risiko Proyek, & Pelaporan.
- `SCN-ADMN-xx`: Modul Tata Kelola Pengguna, Organisasi, Delegasi, & Kebijakan.
- `SCN-E2E-xx`: Skenario Perjalanan Pengguna Lintas-Modul End-to-End.

---

## 2. KATALOG SKENARIO PENGUJIAN

### 2.1 Modul 1: Autentikasi, Aktivasi Akun, & Kontrol Akses (SCN-AUTH)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-AUTH-01** | Login Kredensial Valid & Pendaratan Otomatis | FR-01, FR-04, DEC-012 | Seluruh Peran | Happy Path / RBAC | **Critical** | Pengguna memasukkan email dan password valid. Sistem mengautentikasi dan mengarahkan ke landing route resmi peran (Employee -> `/daily/morning`, Supervisor -> `/dashboard`, HRGA -> `/compliance`, Admin -> `/admin/organization`). |
| **SCN-AUTH-02** | Penolakan Login Kredensial Tidak Sah | FR-01 | Pengguna Tak Sah | Negative Path | **High** | Memasukkan kombinasi email salah atau password salah. Sistem menolak login, tidak membuat sesi, dan menampilkan toast/pesan kesalahan spesifik bahasa Indonesia. |
| **SCN-AUTH-03** | Aktivasi Akun Karyawan Baru via Token 72 Jam | FR-02, DEC-005 | `INVITED` | Happy Path / Lifecycle | **Critical** | Membuka link `/activate?token=...` dengan token seeder 72 jam valid. Pengguna memasukkan kata sandi baru (min 8 char). Akun berhasil aktif, token hangus (*single-use*), dan diarahkan ke login/beranda. |
| **SCN-AUTH-04** | Penolakan Token Aktivasi Kedaluwarsa / Bekas Pakai | FR-03, DEC-005 | `INVITED`, Tamu | Negative / Security | **High** | Membuka link aktivasi dengan token palsu atau token yang sudah pernah digunakan. Sistem menampilkan banner penolakan aktivasi dan mengunci form pembuatan password baru. |
| **SCN-AUTH-05** | Proteksi Otorisasi Antarmuka & Halaman Terlarang (403) | FR-08, DEC-012 | `EMPLOYEE` | Security / Access Control | **Critical** | Login sebagai Employee, lalu mengetikkan rute `/admin/organization` secara langsung di URL browser. Sistem memblokir akses dan mengarahkan ke halaman Error 403 Forbidden. |
| **SCN-AUTH-06** | Pengakhiran Sesi Aman (Logout & History Check) | FR-07 | Seluruh Peran | Security / Session | **High** | Pengguna mengklik tombol Logout di footer sidebar. Sesi terhapus, redirect ke `/login`. Menekan tombol browser 'Back' tidak memunculkan data internal pengguna. |

---

### 2.2 Modul 2: Morning Commitment (SCN-DLYM)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-DLYM-01** | Pengisian 1 s.d. 3 Komitmen Pagi Tepat Waktu | FR-09, FR-13, FR-16, DEC-001, DEC-004 | `EMPLOYEE` | Happy Path | **Critical** | Karyawan mengisi 1-3 komitmen kerja sebelum batas cut-off pagi, memilih kategori proyek, dan mengirim form. Komitmen tersimpan dengan status *On-Time* dan tampil pada ringkasan harian. |
| **SCN-DLYM-02** | Opsi 0 Komitmen dengan Justifikasi Wajib | FR-10, DEC-004, DEC-010 | `EMPLOYEE` | Boundary & Exception | **High** | Mengaktifkan opsi "Tidak ada komitmen hari ini". Validasi form menolak jika alasan < 10 karakter. Pengiriman berhasil jika alasan >= 10 karakter (`NOT_APPLICABLE — NO_COMMITMENT`). |
| **SCN-DLYM-03** | Penandaan Indikasi Hambatan Dini (Early Blocker) | FR-11 | `EMPLOYEE` | Business Process | **High** | Karyawan mencentang indikator kendala pada komitmen pagi. Sistem menyematkan badge peringatan potensi blocker pada kartu komitmen yang dapat dilihat atasan. |
| **SCN-DLYM-04** | Salin Komitmen Hari Sebelumnya (Copy-Forward) | FR-12, DEC-011 | `EMPLOYEE` | Usability / Data Integrity | **Medium** | Mengklik "Salin dari Kemarin". Sistem hanya menyalin komitmen hari sebelumnya yang berstatus `Continue`, mengabaikan komitmen yang sudah berstatus `Done`. |
| **SCN-DLYM-05** | Penguncian Form Pagi Pasca Cut-Off | FR-14, DEC-002 | `EMPLOYEE` | State Transition / Business Rules | **Critical** | Membuka form komitmen pagi setelah jam cut-off terlewati. Form dinonaktifkan dari edit langsung; muncul instruksi untuk mengajukan Morning Correction Request. |
| **SCN-DLYM-06** | Validasi Panjang Deskripsi Komitmen | FR-15 | `EMPLOYEE` | Negative / Boundary | **Medium** | Memasukkan teks komitmen di bawah batas minimal 5 karakter (cth: "Tes"). Sistem menolak submit dan memunculkan pesan validasi field deskripsi. |

---

### 2.3 Modul 3: Additional Work (SCN-DLYA)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-DLYA-01** | Pencatatan Tugas Ad-Hoc di Tengah Jam Kerja | FR-17, FR-18, FR-19 | `EMPLOYEE` | Happy Path | **High** | Karyawan mencatat tugas mendesak dari atasan/klien pada siang hari. Data tersimpan, terintegrasi ke antrean kerja harian, dan siap dievaluasi pada form EOD sore. |
| **SCN-DLYA-02** | Validasi Wajib Pemberi Instruksi & Proyek | FR-18 | `EMPLOYEE` | Negative / Data Integrity | **Medium** | Mengirim form tugas tambahan tanpa memilih siapa yang menginstruksikan atau tanpa memilih proyek. Form menolak dan menandai field wajib. |
| **SCN-DLYA-03** | Batas Maksimum 5 Tugas Tambahan Per Hari | FR-20 | `EMPLOYEE` | Boundary Testing | **Medium** | Menambahkan tugas tambahan hingga mencapai batas maksimal 5 item. Tombol "Tambah Tugas Lain" terkunci/dinonaktifkan secara otomatis. |

---

### 2.4 Modul 4: End-of-Day Outcome (SCN-DLYE)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-DLYE-01** | Pelaporan Realisasi Hasil Kerja Sore Lengkap | FR-21, FR-26, DEC-001 | `EMPLOYEE` | Happy Path | **Critical** | Karyawan memilih status realisasi (`Done`, `In Progress`, dll.) untuk setiap komitmen sebelum cut-off sore. Hasil tersimpan dengan status *On-Time* dan dapat dilihat supervisor. |
| **SCN-DLYE-02** | Heuristic Suggestion & Verifikasi Anti-Lock Green | FR-22, FR-23, DEC-003 | `EMPLOYEE` | Business Rules / Heuristics | **Critical** | Salah satu tugas berstatus `Blocked` sehingga sistem merekomendasikan status Kuning/Merah. Namun opsi Hijau (**GREEN**) tetap aktif dan dapat dipilih oleh karyawan dengan alasan. |
| **SCN-DLYE-03** | Wajib Alasan pada Status Blocked / Cancelled | FR-24, DEC-010 | `EMPLOYEE` | Negative / Boundary | **High** | Memilih status komitmen `Blocked` atau `Cancelled` tanpa mengisi catatan kendala. Sistem menolak submit hingga catatan penjelasan terisi minimal 10 karakter. |
| **SCN-DLYE-04** | Penguncian Form Sore Pasca Cut-Off EOD | FR-27, DEC-002 | `EMPLOYEE` | State Transition | **Critical** | Membuka form EOD setelah jam cut-off sore terlewati. Form dalam status *read-only* dengan tautan untuk mengajukan EOD Correction Request. |

---

### 2.5 Modul 5: Blocker Management & Eskalasi (SCN-BLKR)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-BLKR-01** | Pelaporan Hambatan Baru (Raise Blocker Kritis) | FR-29, FR-30, DEC-007 | Seluruh Peran | Happy Path / Workflow | **Critical** | Karyawan melaporkan blocker berbobot Kritis terkait infrastruktur/DB. Blocker tersimpan dengan status `OPEN`, target SLA 2 jam terpasang, dan notifikasi terkirim ke atasan. |
| **SCN-BLKR-02** | Respons & Acknowledgment Blocker oleh Supervisor | FR-31, FR-32, DEC-007 | `SUPERVISOR` | Workflow / SLA | **Critical** | Tech Lead membuka `/blockers`, melihat blocker kritis, dan mengklik "Respons / Bantu" dalam jendela SLA. Status berubah menjadi `ACKNOWLEDGED` / `IN_PROGRESS`. |
| **SCN-BLKR-03** | Resolusi Blocker dengan Catatan Solusi Tuntas | FR-33, DEC-007, DEC-010 | `SUPERVISOR`, Pelapor | State Transition | **High** | Mengubah status blocker menjadi `RESOLVED`. Validasi menolak jika deskripsi solusi kosong atau < 10 karakter. Setelah diisi, blocker tertutup dan keluar dari antrean aktif. |
| **SCN-BLKR-04** | Radar Eskalasi Blocker Melewati Batas SLA (Aging) | FR-34, DEC-007 | `HEAD`, `CEO_MANAGEMENT` | Risk Management | **High** | Membuka `/blockers/aging`. Hambatan yang telah melewati batas waktu SLA ditandai dengan badge merah berkedip/jelas pada radar eskalasi pimpinan manajemen. |
| **SCN-BLKR-05** | Otoritas Blocker Proyek oleh Project Manager | FR-35, DEC-006 | `PM`, `SUPERVISOR` | Authority Context | **High** | Blocker yang diberi tag proyek eksternal diarahkan secara tepat ke antrean tindakan Project Manager proyek bersangkutan. |

---

### 2.6 Modul 6: Kepatuhan & Permohonan Koreksi (SCN-CORR)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-CORR-01** | Pengajuan Koreksi Komitmen Pagi Pasca Cut-Off | FR-37, DEC-002, DEC-010 | `EMPLOYEE` | Business Process | **High** | Karyawan mengajukan koreksi untuk tanggal yang terkunci dengan alasan valid (>= 10 karakter). Pengajuan berstatus `PENDING` pada antrean atasan. |
| **SCN-CORR-02** | Persetujuan Koreksi oleh Direct Manager | FR-39, DEC-006, DEC-013 | `SUPERVISOR` | Workflow Transition | **High** | Atasan membuka `/corrections/review`, memeriksa data sebelum vs sesudah, dan mengklik Setujui. Status komitmen terbarui dan tercatat di riwayat audit. |
| **SCN-CORR-03** | Penolakan Koreksi dengan Alasan Wajib | FR-40, DEC-010 | `SUPERVISOR` | Negative / Validation | **High** | Atasan mengklik Tolak pada permohonan koreksi tanpa menuliskan alasan (gagal validasi). Setelah mengisi alasan minimal 10 karakter, permohonan ditolak resmi. |
| **SCN-CORR-04** | Pemantauan Pelanggaran Kepatuhan oleh HRGA | FR-41, FR-42 | `HRGA` | Compliance & Risk | **High** | HRGA membuka `/compliance`, melihat daftar karyawan yang tidak submit atau terlambat berulang kali, dan mengidentifikasi pola 3x pelanggaran berturut-turut. |
| **SCN-CORR-05** | Pemberian Dispensasi Kepatuhan Resmi (Exemption) | FR-43, FR-44, DEC-013 | `HRGA`, `CEO_MANAGEMENT` | Governance / Audit | **High** | HRGA menerbitkan dispensasi kepatuhan untuk karyawan tertentu dengan alasan tugas luar kantor. Status pelanggaran dihapus dan jejak audit permanen tercatat. |

---

### 2.7 Modul 7: Pengelolaan Cuti & Rekonsiliasi Otomatis (SCN-LEAV)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-LEAV-01** | Pengajuan Cuti Mandiri oleh Karyawan | FR-45, FR-48 | `EMPLOYEE` | Happy Path | **High** | Karyawan membuka `/leave/my`, memilih jenis cuti tahunan, memilih tanggal berlaku, mengisi alasan, dan mengirim form. Permohonan masuk ke antrean atasan. |
| **SCN-LEAV-02** | Persetujuan Cuti oleh Atasan Langsung | FR-46 | `SUPERVISOR` | Workflow Transition | **High** | Atasan membuka `/leave/queue`, memverifikasi ketersediaan anggota tim lain, dan menyetujui pengajuan cuti. Sisa kuota cuti karyawan berkurang. |
| **SCN-LEAV-03** | Rekonsiliasi Cuti Otomatis Pasca Cut-Off | FR-47, DEC-008 | Sistem, `HRGA` | Data Integrity / Business Rules | **Critical** | Karyawan yang cutinya telah disetujui tidak mengisi komitmen harian. Sistem secara otomatis menyematkan status `Superseded by Approved Leave` tanpa catatan pelanggaran kepatuhan. |

---

### 2.8 Modul 8: Supervisi, Dasbor, & Administrasi Sistem (SCN-DASH & SCN-ADMN)

| Scenario ID | Judul & Tujuan Skenario | Requirement Terkait | Peran Aktor | Tipe Skenario | Prioritas | Ringkasan Alur & Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SCN-COAC-01** | Pemberian Catatan Bimbingan Manajer (Coaching Note) | FR-49, DEC-010 | `SUPERVISOR` | Usability / Coaching | **Medium** | Atasan membuka `/coaching`, memilih bawahan, dan menuliskan catatan bimbingan atau apresiasi kerja. Catatan tersimpan dan dapat dibaca oleh bawahan. |
| **SCN-DASH-01** | Dasbor Operasional Tim (Team Pulse) | FR-50 | `SUPERVISOR` | UI/UX / Aggregation | **High** | Membuka `/dashboard` sebagai Supervisor. Kartu ringkasan partisipasi, daftar personil butuh bantuan, dan feed dukungan lintas fungsi tampil presisi. |
| **SCN-DASH-02** | Radar Risiko Proyek Strategis (Project Risk Radar) | FR-51 | `PM`, `HEAD` | Risk Analytics | **High** | Membuka `/projects/risk`, memantau indikator status risiko proyek berdasarkan hambatan terbuka dan komitmen macet. |
| **SCN-DASH-03** | Pelaporan Eksekutif & Unduh Data Rekapitulasi | FR-52, FR-53 | `CEO_MANAGEMENT`, `HRGA` | Reporting | **Medium** | Membuka `/reports`, mengatur filter tanggal, memeriksa ringkasan metrik akuntabilitas, dan mengklik tombol unduh data. |
| **SCN-ADMN-01** | Penugasan Reviewer Sementara (Temporary Reviewer) | FR-54, DEC-009 | `SYSTEM_ADMIN`, `HRGA` | Governance / RBAC | **High** | Admin menetapkan pendelegasian wewenang review dari Supervisor A ke Supervisor B selama rentang tanggal tertentu. Supervisor B dapat melihat antrean A. |
| **SCN-ADMN-02** | Konfigurasi Kebijakan Operasional Sistem (Policy Settings) | FR-55 | `SYSTEM_ADMIN` | Administration | **Critical** | Membuka `/admin/policies`, mengubah parameter cut-off atau grace period simulasi, menyimpan konfigurasi, dan memvalidasi persistensi data. |

---

### 2.9 Modul 9: Skenario Perjalanan Pengguna Lintas-Modul End-to-End (SCN-E2E)

| Scenario ID | Judul Skenario End-to-End | Aktor Terlibat | Rantai Modul Terkait | Prioritas | Ringkasan User Journey |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **SCN-E2E-01** | Siklus Harian Karyawan: Pagi -> Ad-Hoc -> Sore | `EMPLOYEE`, `SUPERVISOR` | Auth -> Morning -> Additional -> EOD -> Dashboard | **Critical** | Karyawan login -> submit 2 komitmen pagi -> tambah 1 tugas ad-hoc di siang hari -> laporkan evaluasi EOD sore hari -> supervisor melihat hasil kerja tuntas di dasbor tim. |
| **SCN-E2E-02** | Rantai Blocker: Pelaporan Kritis -> SLA Escalation -> Resolusi | `EMPLOYEE`, `SUPERVISOR`, `CEO_MANAGEMENT` | Daily -> Blocker Raise -> Queue -> Aging Radar -> Resolution | **Critical** | Karyawan mengalami kendala mendesak -> raise blocker Kritis -> masuk antrean atasan -> atasan memberikan respons awal -> solusi teknis disepakati -> blocker ditutup berstatus Resolved. |
| **SCN-E2E-03** | Rantai Koreksi: Karyawan Terlambat -> Ajukan Koreksi -> Review Atasan | `EMPLOYEE`, `SUPERVISOR` | Morning Form (Locked) -> Correction Request -> Correction Review -> Audit Log | **High** | Karyawan terlewat cut-off pagi -> form terkunci -> ajukan Morning Correction dengan alasan -> atasan meninjau di `/corrections/review` -> atasan setujui -> data komitmen masuk riwayat. |
| **SCN-E2E-04** | Rantai Cuti & Rekonsiliasi Otomatis Non-Compliance | `EMPLOYEE`, `SUPERVISOR`, `HRGA` | My Leave -> Leave Queue -> Cut-Off Execution -> Compliance Audit | **Critical** | Karyawan ajukan cuti sakit -> atasan setujui -> hari berikutnya karyawan tidak submit komitmen -> sistem merekonsiliasi otomatis menjadi `Superseded by Approved Leave` tanpa penalti di compliance queue. |
