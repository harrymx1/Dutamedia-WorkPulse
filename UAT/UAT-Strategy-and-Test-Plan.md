# WorkPulse — UAT Strategy & Master Test Plan

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Penyusun:** Senior Quality Assurance Engineer & UAT Architect  
> **Eksekutor Pengujian:** Harry (Manual Tester / Product Owner Acceptance)  
> **Tanggal Efektif:** 29 Oktober 2026  

---

## 1. PENDAHULUAN & TUJUAN PENGUJIAN

Dokumen ini merupakan strategi dan rencana induk User Acceptance Testing (UAT) untuk sistem **WorkPulse** di lingkungan operasional PT Dutamedia Mandiri Pratama. 

Tujuan utama dari pengujian manual UAT ini adalah:
1. Memvalidasi bahwa seluruh fitur sistem beroperasi sesuai dengan **Product Definition Document (PDD v1.5)**, **Product Requirements Document (PRD v1.6)**, **UI/UX Specification & Flow**, serta **Visual Design System v1.5.0**.
2. Memastikan akuntabilitas harian (*Morning Commitment*, *Additional Work*, *End-of-Day Outcome*), mitigasi hambatan (*Blocker Lifecycle* & *Aging SLA*), tata kelola kepatuhan (*Compliance* & *Correction Request*), serta integrasi cuti (*Leave Reconciliation*) berfungsi secara andal bagi seluruh peran pengguna.
3. Memberikan kepastian bagi Harry selaku penguji dan penentu penerimaan (acceptance owner) bahwa sistem siap digunakan dalam aktivitas kerja harian tanpa risiko kegagalan fungsional, kebocoran otorisasi, maupun inkonsistensi data.

---

## 2. RUANG LINGKUP PENGUJIAN (SCOPE OF TESTING)

### 2.1 In-Scope (Fitur & Alur yang Diuji dalam Manual UAT)
Pengujian mencakup seluruh modul aplikasi web WorkPulse yang diakses melalui browser:
1. **Modul Autentikasi & Akun:** Login kredensial, aktivasi undangan karyawan baru via secure single-use token 72 jam, profil pengguna, dan session handling.
2. **Modul Daily Accountability:**
   - Morning Commitment (perencanaan 1-3 komitmen, opsi 0 komitmen dengan justifikasi minimal 10 karakter, penandaan indikasi blocker, tagging inisiatif/proyek).
   - Additional Work (pencatatan pekerjaan ad-hoc di luar rencana pagi).
   - End-of-Day (EOD) Outcome (pelaporan status komitmen: Done, In Progress, Blocked, Cancelled; penilaian mandiri non-binding heuristic Anti-lock Green).
   - My History (riwayat audit komitmen dan jejak kepatuhan pribadi).
3. **Modul Blocker & Eskalasi:**
   - Raise Blocker (pelaporan kendala berbobot: Kritis/Tinggi/Sedang, dampak tim/klien/biaya, usulan eskalasi atasan/lintas divisi).
   - Blocker Queue & SLA Aging (pemantauan antrean hambatan, respons atasan dalam SLA 2-4 jam, transisi status Open -> In Progress -> Resolved).
4. **Modul Kepatuhan & Koreksi:**
   - Morning & EOD Correction Request (pengajuan koreksi pasca cut-off dengan alasan valid, approval direct manager/PM).
   - Compliance Queue & Exemptions (pengawasan pelanggaran berulang, pemberian dispensasi resmi oleh HRGA/Direksi).
5. **Modul Cuti & Rekonsiliasi Otomatis:**
   - Pengajuan cuti terencana/mendadak, persetujuan atasan langsung, dan rekonsiliasi otomatis pasca cut-off (*Superseded by Approved Leave*).
6. **Modul Coaching & Supervisi:**
   - Catatan bimbingan manajer (*Manager Coaching Note*), tinjauan komitmen tim, serta koordinasi intervensi blocker.
7. **Modul Dasbor & Pelaporan Eksekutif:**
   - Pulse Dashboard (tampilan kondisional sesuai peran: Employee -> Daily Morning, Supervisor/Head/CEO -> Dashboard, HRGA -> Compliance Queue, Admin -> Organization Mapping).
   - Project Risk Radar & Executive Analytics.
8. **Modul Administrasi Sistem:**
   - Manajemen Pengguna, Struktur Organisasi (Hierarki Atasan-Bawahan), Penugasan Reviewer Sementara (*Temporary Reviewer Delegation*), Kebijakan Operasional (*Policy Settings*), dan Pengaturan Kanal Notifikasi.

### 2.2 Out-of-Scope (Bukan Merupakan Bagian Manual UAT Ini)
1. **Eksekusi Pengujian Otomatis:** Pengujian unit backend, integrasi Vitest, atau end-to-end runner Playwright di mesin server (telah ditangani pada fase pipeline teknis sebelumnya).
2. **Stress & Load Testing Skala Masif:** Pengujian jutaan concurrent request via alat benchmarking (JMeter/K6).
3. **Penetration Testing Eksternal Tingkat Lanjut:** Audit kerentanan jaringan perangkat keras atau simulasi serangan DDoS.
4. **Penyedia Layanan Pihak Ketiga Nyata:** Integrasi SMS Gateway berbayar aktual atau SMTP server live (cukup divalidasi melalui state UI dan respons mock/sandbox yang tersedia).

---

## 3. STRATEGI & 13 PENDEKATAN PENGUJIAN

Pengujian manual ini menerapkan 13 metodologi pengujian komprehensif yang dipetakan langsung pada fitur aktual WorkPulse:

| No | Pendekatan Pengujian | Tujuan Operasional pada WorkPulse | Fitur & Requirement yang Dicakup | Risiko Kritis yang Ditangani |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Requirements-Based Testing** | Memvalidasi setiap kriteria penerimaan fungsional secara langsung terhadap teks requirement PRD. | Seluruh FR-01 s.d. FR-55. | Fitur melenceng dari spesifikasi kontrak bisnis Dutamedia. |
| **2** | **Business Process-Based Testing** | Memverifikasi alur siklus kerja harian perusahaan dari pagi hingga sore secara utuh. | Siklus Pagi (07:00-09:00), Siang (Ad-hoc & Blocker), Sore (16:30-18:00), dan Rekonsiliasi Malam. | Putusnya rantai operasional antar tahapan kerja. |
| **3** | **Role-Based Testing (RBAC)** | Memastikan setiap peran hanya dapat melihat data dan mengeksekusi aksi yang diizinkan sesuai matriks kewenangan. | 8 Peran Kanonikal: `EMPLOYEE`, `SUPERVISOR`, `HEAD`, `PM`, `HRGA`, `CEO_MANAGEMENT`, `SYSTEM_ADMIN`, `INVITED`. | Eskalasi hak akses tidak sah (*Privilege Escalation*) atau kebocoran data rahasia. |
| **4** | **End-to-End User Journey Testing** | Menguji skenario kolaborasi multi-aktor secara sekuensial (cth: Karyawan melapor blocker -> Atasan merespons -> HRGA memantau aging). | Interaksi Employee, Supervisor, dan HRGA pada Modul Blocker, Koreksi, dan Cuti. | Ketidaksinkronan status antar layar pengguna yang berbeda. |
| **5** | **Happy Path Testing** | Memastikan sistem berjalan mulus dan responsif ketika pengguna memasukkan data valid pada waktu yang tepat. | Pengisian Morning Commitment tepat waktu, resolusi blocker normal, persetujuan cuti standar. | Hambatan operasional pada kondisi normal sehari-hari. |
| **6** | **Negative Testing** | Menguji responsivitas sistem dalam menolak data tidak sah, input kosong, format salah, atau aksi di luar batas wajar. | Form submission kosong, deskripsi komitmen < 5 karakter, format email tidak valid, token kedaluwarsa. | Kerusakan integritas data atau kegagalan sistem (*crash/unhandled exception*). |
| **7** | **Exception-Path Testing** | Memverifikasi penanganan kondisi darurat atau anomali operasional. | Karyawan sakit mendadak tanpa mengisi komitmen pagi, atasan berhalangan sehingga wewenang didelegasikan ke *Temporary Reviewer*. | Kebuntuan birokrasi dan ketidakadilan status kepatuhan karyawan. |
| **8** | **Exploratory Testing** | Menemukan cacat tak terduga melalui eksplorasi heuristik bebas oleh penguji manusia. | Responsivitas interaksi UI, transisi tab cepat, reload mendadak saat pengisian form panjang. | Cacat pengalaman pengguna (*UX friction*) yang lolos dari tes formal. |
| **9** | **UI/UX Acceptance Testing** | Memastikan kesesuaian tampilan dengan prototipe 232px, palet warna brand (`#00674D`), tipografi, dan responsivitas layout. | 25 Tampilan Halaman, Sidebar Enterprise, Badge Status, Modal Dialog, Toast Feedback. | Tampilan rusak, navigasi membingungkan, atau ketidaksesuaian visual dengan prototipe. |
| **10** | **Data Integrity Acceptance Testing** | Memverifikasi persistensi data setelah refresh browser, relasi database, dan keakuratan riwayat audit log. | Penyimpanan komitmen, riwayat audit koreksi, pencatatan delegasi wewenang. | Hilangnya draf input pengguna atau manipulasi riwayat audit secara ilegal. |
| **11** | **State Transition Testing** | Menguji kepatuhan status siklus hidup objek data terhadap aturan bisnis (hanya transisi legal yang diizinkan). | Blocker Lifecycle (`OPEN` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `RESOLVED`), Cuti, Koreksi. | Lonjakan status ilegal (misal blocker langsung resolved tanpa di-acknowledge). |
| **12** | **Regression-Oriented Manual Testing** | Memastikan perbaikan pada satu modul tidak merusak fungsi pada modul lain yang telah stabil. | Pengisian Additional Work tidak merusak komitmen pagi; persetujuan koreksi memperbarui riwayat audit. | Efek samping negatif pasca integrasi kode frontend. |
| **13** | **Nonfunctional Acceptance Testing** | Memvalidasi aspek non-fungsional dari kacamata pengguna manual: kejelasan pesan kesalahan, ketiadaan loading gantung, dan keamanan tampilan. | Ketiadaan kebocoran password di input teks, keterbacaan pesan kesalahan bahasa Indonesia yang baku. | Kebingungan pengguna dan potensi risiko keamanan kasat mata. |

---

## 4. PRIORITAS PENGUJIAN BERBASIS RISIKO (RISK-BASED PRIORITIZATION)

Setiap skenario dan test case diklasifikasikan ke dalam 4 tingkat prioritas:

1. **CRITICAL (P0):**
   - **Karakteristik:** Fitur inti (*blocking blocker*), autentikasi, integritas data kepatuhan karyawan, atau batasan akses keamanan.
   - **Contoh Kasus:** Login & Otorisasi RBAC, Penguncian Cut-Off (DEC-002), Anti-Lock Green (DEC-003), Resolusi Blocker Kritis, Rekonsiliasi Cuti Otomatis (DEC-008).
   - **Toleransi:** 0 Defect P0 diizinkan lolos ke fase produksi.
2. **HIGH (P1):**
   - **Karakteristik:** Alur kerja utama operasional harian yang digunakan seluruh karyawan.
   - **Contoh Kasus:** Pengisian Morning Commitment normal, Pelaporan Additional Work, Alur Pengajuan & Review Koreksi, Notifikasi SLA Blocker.
   - **Toleransi:** Wajib diselesaikan sebelum sign-off resmi, kecuali ada work-around yang disetujui direksi.
3. **MEDIUM (P2):**
   - **Karakteristik:** Fitur pendukung, filter pelaporan, pencarian riwayat, atau penugasan reviewer sementara.
   - **Contoh Kasus:** Delegasi wewenang sementara, ekspor log audit, filter antrean blocker berdasarkan inisiatif.
   - **Toleransi:** Boleh ditunda ke rilis minor jika tidak mengganggu pencatatan harian.
4. **LOW (P3):**
   - **Karakteristik:** Masalah kosmetik minor, spasi visual antar elemen yang sedikit meleset, atau penyempurnaan tooltip panduan.
   - **Contoh Kasus:** Kesejajaran ikon kecil pada footer, animasi transisi modal yang kurang mulus.

---

## 5. ENTRY & EXIT CRITERIA

### 5.1 Entry Criteria (Syarat Memulai Eksekusi UAT)
Pengujian manual oleh Harry dapat dimulai apabila kondisi berikut telah terpenuhi:
1. Lingkungan pengujian lokal (`localhost:5173` untuk frontend, `localhost:3000` untuk backend) atau staging telah aktif dan terhubung ke basis data PostgreSQL.
2. Database telah diinisialisasi menggunakan data seeder resmi (`backend/prisma/seed.ts`), sehingga seluruh akun acuan, kebijakan operasional, dan proyek demo telah tersedia.
3. Seluruh dokumen rancangan pengujian (16 artefak di folder `UAT/`) telah lengkap dan dapat diakses dengan mudah oleh Harry.
4. Browser modern (Google Chrome, Microsoft Edge, atau Mozilla Firefox) telah siap pada resolusi desktop standar (minimal 1440x900 atau 1920x1080) dan simulasi mobile viewport (375x812).

### 5.2 Exit Criteria (Syarat Penyelesaian & Penerimaan Sistem)
Sistem WorkPulse dinyatakan **DITERIMA (ACCEPTED)** apabila:
1. 100% test case berprioritas **CRITICAL (P0)** telah dieksekusi dengan hasil **PASS**.
2. Minimal 95% test case berprioritas **HIGH (P1)** telah dieksekusi dengan hasil **PASS**, dan tidak ada defect terbuka berstatus *Blocker/Critical*.
3. Seluruh defect yang ditemukan selama eksekusi telah dicatat rapi dalam `UAT-Execution-Log.csv` dan dilaporkan menggunakan format `UAT-Defect-Report-Template.md`.
4. Harry selaku penanggung jawab penerimaan telah menandatangani lembar `UAT-Final-Acceptance-Checklist.md`.

---

## 6. PERAN & TANGGUNG JAWAB (ROLES & RESPONSIBILITIES)

| Peran | Pihak Bertanggung Jawab | Deskripsi Tanggung Jawab Utama |
| :--- | :--- | :--- |
| **Manual Tester & Acceptance Owner** | Harry | Mengeksekusi setiap langkah pengujian di browser, mengamati hasil aktual, mengambil screenshot bukti (jika gagal), mengisi `Actual Result`, dan memutuskan status *Pass/Fail*. |
| **Senior QA & UAT Architect** | Agen Antigravity (AI) | Menyusun seluruh dokumen skenario, test case terperinci, matriks data uji, lembar pencatatan, dan audit cakupan tanpa mengeksekusi aplikasi atas nama penguji. |
| **Tech Lead & Engineering Team** | Tim Pengembang Dutamedia | Menerima laporan defect dari Harry, melakukan perbaikan kode sumber (*bug fixing*), dan merilis build perbaikan untuk diuji ulang (*retest*). |
| **Business Owner / Stakeholder** | Manajemen PT Dutamedia Mandiri Pratama | Memberikan klarifikasi atas kebijakan bisnis yang ambigu dan memberikan otorisasi akhir peluncuran sistem. |

