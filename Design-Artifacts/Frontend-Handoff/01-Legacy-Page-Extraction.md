# 01 — Complete Legacy UI Extraction
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-01 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Jumlah Berkas Dianalisis** | 30 Berkas HTML Prototipe (`Design-Artifacts/UI-UX-Design/*.html`) |
| **Tingkat Pemeriksaan** | 100% Ekstraksi Mendalam (DOM, CSS, JS, State, Handling) |
| **Metode Ekstraksi** | Programmatic Static AST & DOM Inspection (Strict Read-Only) |

---

## 1. Pengantar dan Metodologi Ekstraksi

Dokumen ini menyajikan ekstraksi lengkap dari **30 berkas prototipe HTML desain lama** WorkPulse yang berada di direktori `Design-Artifacts/UI-UX-Design/`.
Setiap prototipe HTML telah diperiksa dan diekstraksi ke dalam 4 dimensi spesifikasi terstruktur:
1. **Identitas Halaman**: ID stabil, judul, area fungsional, aktor pengguna, tujuan bisnis, dan relevansi terhadap spesifikasi akhir.
2. **Struktur Visual**: Tata letak page shell, header, sidebar, grid/kolom, section, card, tabel, form, modal/drawer, ragam state (empty, loading, disabled, locked), responsivitas, dan token desain yang diterapkan.
3. **Perilaku & Interaksi**: Event handler, manipulasi DOM, state transitions, validasi inline, simulasi data, mock logic, feedback banners, serta batasan antara fitur demonstrasi vs kebutuhan fungsional nyata.
4. **Ketergantungan**: Token CSS, font eksternal, inline icon vectors, pustaka JavaScript, dan konfigurasi.

---

## LEG-P01 — Login & Reset Password (`01-login.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/01-login.html`
- **File Size**: 17.430 bytes
- **Page Title (`<title>`)**: `WorkPulse — Sign in`
- **Product Area**: Authentication & Public Shell
- **Target Actors / Roles**: All Employees, Supervisors, Heads, HRGA, PM, Admins, Management
- **Tujuan Halaman**: Autentikasi akun pengguna dengan email/password, permintaan reset link password via email, dan notifikasi konfirmasi reset.
- **Status Relevansi Spesifikasi Final**: Relevan. Namun pada implementasi Vue SPA, form login dan reset password dipisah menjadi route mandiri (/login dan /reset-password) sesuai SAD 16.4.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Layout tanpa sidebar permanen.
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 2 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `e.g. budi.santoso`, `Enter your password`, `you@dutamedia.co.id`.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 5 tombol interaktif, mencakup aksi utama seperti: "Forgot password?", "Sign in", "Back to sign in", "Send reset link", "Back to sign in".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `submit`, `input`.
- **Fungsi JavaScript Tersemat**: `showView()`, `showToast()`, `setLoading()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P02 — Morning Commitment Check-in (`02-morning-commitment.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/02-morning-commitment.html`
- **File Size**: 50.481 bytes
- **Page Title (`<title>`)**: `WorkPulse — Morning Commitment`
- **Product Area**: Self-Service Core
- **Target Actors / Roles**: Employee, All Staff
- **Tujuan Halaman**: Pengisian 1-3 komitmen kerja harian, penentuan Initial Risk (GREEN/AMBER/RED) per komitmen, review draft carry-forward, dan penguncian baseline komitmen.
- **Status Relevansi Spesifikasi Final**: Relevan. Diimplementasikan sebagai section pagi di dalam MyTodayPage.vue (/today) dan terikat window sebelum cutoff jam 09:30.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `e.g. JIRA-1234 or paste a link`, `Who or what can help?`.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 18 tombol interaktif, mencakup aksi utama seperti: "Before cutoff — in progress", "Before cutoff — draft available", "After cutoff — locked", "My Today", "My History".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `focus`, `input`, `click`.
- **Fungsi JavaScript Tersemat**: `riskMeta()`, `esc()`, `render()`, `attachEditHandlers()`, `clearFieldError()`, `validateBeforeSave()`, `attachCorrectionHandlers()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `bellEsc()`, `renderBellDropdown()`, `renderBellBadge()`, `openBellDropdown()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P03 — Additional Work Ad-hoc Modal (`03-additional-work.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/03-additional-work.html`
- **File Size**: 39.224 bytes
- **Page Title (`<title>`)**: `WorkPulse — Additional Work`
- **Product Area**: Self-Service Core
- **Target Actors / Roles**: Employee, All Staff
- **Tujuan Halaman**: Pencatatan tugas tambahan di luar komitmen pagi yang muncul di tengah hari kerja, mencakup deskripsi, task reference, dan initial risk.
- **Status Relevansi Spesifikasi Final**: Relevan. Merupakan modal dialog tersemat (AdditionalWorkModal.vue) yang dipicu dari /today, bukan halaman terpisah.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `Who assigned this?`.
  - Elemen Dropdown (`<select>`): `reasonInput`.
  - Elemen Textarea: `descInput`.
- **Aksi & Tombol**: Ditemukan 11 tombol interaktif, mencakup aksi utama seperti: "With entries logged today", "No entries yet today", "My Today", "My History", "My Leave Request".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `input`, `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `reasonOptionsHtml()`, `render()`, `attachFormHandlers()`, `openForm()`, `closeForm()`, `saveForm()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `bellEsc()`, `renderBellDropdown()`, `renderBellBadge()`, `openBellDropdown()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P04 — EOD Outcome Check-in (`04-eod.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/04-eod.html`
- **File Size**: 50.342 bytes
- **Page Title (`<title>`)**: `WorkPulse — EOD Outcome`
- **Product Area**: Self-Service Core
- **Target Actors / Roles**: Employee, All Staff
- **Tujuan Halaman**: Evaluasi hasil kerja akhir hari untuk setiap komitmen dan pekerjaan tambahan: Outcome status, Continuation flag (Done/Continue), Today blocker log, dan Tomorrow priorities.
- **Status Relevansi Spesifikasi Final**: Relevan. Diimplementasikan sebagai section sore di dalam MyTodayPage.vue (/today) dan terikat window sebelum cutoff sore jam 18:00.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: `statusNoteInput`, `tomorrowInput`, `modalReasonInput`.
- **Aksi & Tombol**: Ditemukan 17 tombol interaktif, mencakup aksi utama seperti: "Normal fill-in", "Demo: status mismatch (triggers ValidationPromptModal)", "My Today", "My History", "My Leave Request".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `input`.
- **Fungsi JavaScript Tersemat**: `baseItems()`, `esc()`, `findItem()`, `clearItemError()`, `render()`, `attachItemHandlers()`, `computeSuggestedStatus()`, `validateItems()`, `validateFinalStatus()`, `itemsIncomplete()`, `finishSubmit()`, `openValidationModal()`, `closeValidationModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `bellEsc()`, `renderBellDropdown()`, `renderBellBadge()`, `openBellDropdown()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P05 — My Accountability History (`05-my-history.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/05-my-history.html`
- **File Size**: 43.867 bytes
- **Page Title (`<title>`)**: `WorkPulse — My History`
- **Product Area**: Self-Service History
- **Target Actors / Roles**: Employee, All Staff
- **Tujuan Halaman**: Melihat histori akuntabilitas personal, kepatuhan submission harian, filter rentang tanggal, status mingguan, dan detail kartu per hari.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /history (MyHistoryPage.vue).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): `periodFilter`, `statusFilter`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 10 tombol interaktif, mencakup aksi utama seperti: "History list", "Day detail (Tue, with Correction Request)", "My Today", "My History", "My Leave Request".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `change`.
- **Fungsi JavaScript Tersemat**: `esc()`, `timingBadgeHtml()`, `statusBadgeHtml()`, `leaveTagHtml()`, `currentDays()`, `renderList()`, `outcomeLabelHtml()`, `openDetail()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `bellEsc()`, `renderBellDropdown()`, `renderBellBadge()`, `openBellDropdown()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P06 — Notification Center (`06-notifications.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/06-notifications.html`
- **File Size**: 20.672 bytes
- **Page Title (`<title>`)**: `WorkPulse — Notifications`
- **Product Area**: Utility & Notification
- **Target Actors / Roles**: All Roles
- **Tujuan Halaman**: Pusat notifikasi web in-app untuk 13 trigger sistem (reminder komitmen, blocker update, koreksi status, delegasi reviewer, persetujuan cuti).
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /notifications (NotificationsPage.vue) serta popover drawer di navbar shell.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 5 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `iconSvg()`, `unreadCount()`, `renderBadge()`, `renderList()`, `renderDropdown()`, `openNotification()`, `openBellDropdown()`, `closeBellDropdown()`, `openSidebar()`, `closeSidebar()`, `showToast()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P07 — User Profile & Password Management (`07-profile.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/07-profile.html`
- **File Size**: 26.304 bytes
- **Page Title (`<title>`)**: `WorkPulse — Profile`
- **Product Area**: Self-Service Profile
- **Target Actors / Roles**: All Roles
- **Tujuan Halaman**: Menampilkan data diri karyawan, NIK, peran aktif, unit fungsi, penugasan manajer langsung/atasan hierarki, dan form perubahan kata sandi.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /profile (ProfilePage.vue).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `currentPw`, `newPw`, `confirmPw`.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 6 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `input`, `click`.
- **Fungsi JavaScript Tersemat**: `clearErr()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `bellEsc()`, `renderBellDropdown()`, `renderBellBadge()`, `openBellDropdown()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P08 — Raise Instant Blocker Modal (`08-raise-blocker.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/08-raise-blocker.html`
- **File Size**: 35.626 bytes
- **Page Title (`<title>`)**: `WorkPulse — Raise Instant Blocker`
- **Product Area**: Blocker Management
- **Target Actors / Roles**: All Employees, PM, Team Members
- **Tujuan Halaman**: Pelaporan kendala kerja seketika dengan deskripsi, tingkat keparahan (Low/Medium/High/Critical), pihak pendukung yang dibutuhkan (Org/Project), dan dampak.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi modal global (RaiseBlockerModal.vue) yang dapat diakses dari header navbar atau /today.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `resolutionDateInput`.
  - Elemen Dropdown (`<select>`): `typeInput`, `ownerSelect`.
  - Elemen Textarea: `impactInput`.
- **Aksi & Tombol**: Ditemukan 13 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `change`, `input`.
- **Fungsi JavaScript Tersemat**: `clearErr()`, `resetForm()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `bellEsc()`, `renderBellDropdown()`, `renderBellBadge()`, `openBellDropdown()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P09 — Team Blocker Queue (`09-blocker-queue.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/09-blocker-queue.html`
- **File Size**: 39.374 bytes
- **Page Title (`<title>`)**: `WorkPulse — Blocker Queue`
- **Product Area**: Team Leadership & Supervision
- **Target Actors / Roles**: Supervisor/TL, Head of Dept, PM
- **Tujuan Halaman**: Daftar antrean blocker aktif tingkat tim yang memerlukan penanganan, filter keparahan, pencarian pelapor, dan tombol aksi eskalasi/update.
- **Status Relevansi Spesifikasi Final**: Relevan. Dikonsolidasikan sebagai Tab 2 pada TeamPulsePage.vue (/team).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): `typeFilter`, `severityFilter`, `statusFilter`.
  - Elemen Textarea: `resolutionNoteInput`, `updateNote-`.
- **Aksi & Tombol**: Ditemukan 16 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `input`, `change`.
- **Fungsi JavaScript Tersemat**: `esc()`, `lifecycleLabel()`, `authorityTagHtml()`, `actionPanelHtml()`, `render()`, `renderExceptionCounts()`, `findBlocker()`, `attachActionHandlers()`, `openResolveModal()`, `closeResolveModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P10 — Blocker Detail & Action Panel (`10-blocker-detail.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/10-blocker-detail.html`
- **File Size**: 34.655 bytes
- **Page Title (`<title>`)**: `WorkPulse — Blocker Detail`
- **Product Area**: Blocker Management
- **Target Actors / Roles**: Supervisor/TL, Support Owner, Reporter, Head
- **Tujuan Halaman**: Inspeksi siklus hidup blocker lengkap: timeline aktivitas, dukungan yang dibutuhkan, tombol aksi transisi state (Acknowledge, Update, Resolve, Close, Accept Risk).
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi modal dialog interaktif BlockerActionModal.vue.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: `resolutionNoteInput`, `updateNoteInput`.
- **Aksi & Tombol**: Ditemukan 17 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `input`.
- **Fungsi JavaScript Tersemat**: `esc()`, `lifecycleLabel()`, `renderTimeline()`, `renderActionPanel()`, `openResolveModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P11 — Correction Request Modal (`11-correction-request.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/11-correction-request.html`
- **File Size**: 32.874 bytes
- **Page Title (`<title>`)**: `WorkPulse — Correction Request`
- **Product Area**: Accountability Governance
- **Target Actors / Roles**: Employee
- **Tujuan Halaman**: Pengajuan sanggahan atau koreksi komitmen/outcome yang telah terkunci pasca cut-off dengan klasifikasi otomatis (Minor/Material) dan alasan wajib.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi modal formulir CorrectionRequestModal.vue di /today.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `e.g. JIRA-1433-R2`.
  - Elemen Dropdown (`<select>`): `fieldSelect`.
  - Elemen Textarea: `afterText`, `reasonInput`.
- **Aksi & Tombol**: Ditemukan 13 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `click`, `input`.
- **Fungsi JavaScript Tersemat**: `esc()`, `renderHistory()`, `classify()`, `showResult()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P12 — Correction & Leave Review Queue (`12-correction-leave-review.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/12-correction-leave-review.html`
- **File Size**: 36.269 bytes
- **Page Title (`<title>`)**: `WorkPulse — Correction &amp; Leave Review`
- **Product Area**: Team Supervision & Governance
- **Target Actors / Roles**: Supervisor/TL, Authorized Reviewer
- **Tujuan Halaman**: Antrean terpadu peninjauan pengajuan koreksi (dengan countdown objection window 48 jam) dan pengajuan cuti anggota tim.
- **Status Relevansi Spesifikasi Final**: Relevan. Dikonsolidasikan sebagai Tab 3 pada TeamPulsePage.vue (/team).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `leaveDateFilter`.
  - Elemen Dropdown (`<select>`): `leaveEmployeeFilter`, `leaveStatusFilter`.
  - Elemen Textarea: `modalReasonInput`.
- **Aksi & Tombol**: Ditemukan 15 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `input`, `change`.
- **Fungsi JavaScript Tersemat**: `esc()`, `formatCountdown()`, `updateNavBadge()`, `renderObjections()`, `attachObjectionHandlers()`, `renderLeaves()`, `attachLeaveHandlers()`, `openReasonModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P13 — My Leave Request (`13-my-leave-request.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/13-my-leave-request.html`
- **File Size**: 23.813 bytes
- **Page Title (`<title>`)**: `WorkPulse — My Leave Request`
- **Product Area**: Self-Service Exemption
- **Target Actors / Roles**: Employee, All Staff
- **Tujuan Halaman**: Pengajuan permohonan cuti kerja mandiri, pemilihan tanggal mulai & selesai, tipe cuti, unggah dokumen pendukung, dan riwayat pengajuan.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /today/leave-request (MyLeaveRequestPage.vue).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `startDate`, `endDate`.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: `reasonInput`.
- **Aksi & Tombol**: Ditemukan 6 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `renderList()`, `todayStr()`, `formatDateRange()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P14 — Team Pulse Dashboard (`14-team-pulse.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/14-team-pulse.html`
- **File Size**: 28.706 bytes
- **Page Title (`<title>`)**: `WorkPulse — Team Pulse`
- **Product Area**: Team Leadership & Supervision
- **Target Actors / Roles**: Supervisor/TL, Head
- **Tujuan Halaman**: Dashboard pemantauan roster harian tim: status komitmen, submission timing, kartu status anggota tim, dan quick-action manager note.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 1 pada TeamPulsePage.vue (/team).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 8 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P15 — Function Pulse Dashboard (`15-function-pulse.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/15-function-pulse.html`
- **File Size**: 31.731 bytes
- **Page Title (`<title>`)**: `WorkPulse — Function Pulse`
- **Product Area**: Department Leadership
- **Target Actors / Roles**: Head of Department, Management
- **Tujuan Halaman**: Dashboard ringkasan kesehatan operasional seluruh departemen/fungsi, metrik agregasi tim, distribusi status, dan daftar pengecualian.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 1 pada FunctionPulsePage.vue (/function).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 10 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P16 — Function Escalations Queue (`16-function-escalations.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/16-function-escalations.html`
- **File Size**: 38.877 bytes
- **Page Title (`<title>`)**: `WorkPulse — Function Escalations`
- **Product Area**: Department Leadership
- **Target Actors / Roles**: Head of Department
- **Tujuan Halaman**: Antrean eskalasi blocker antar-fungsi dan kendala kritis yang memerlukan intervensi kepala departemen atau alokasi sumber daya.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 2 pada FunctionPulsePage.vue (/function).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): `typeFilter`, `severityFilter`, `statusFilter`.
  - Elemen Textarea: `resolutionNoteInput`, `updateNote-`.
- **Aksi & Tombol**: Ditemukan 16 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `input`, `change`.
- **Fungsi JavaScript Tersemat**: `esc()`, `lifecycleLabel()`, `authorityTagHtml()`, `actionPanelHtml()`, `cardHtml()`, `render()`, `renderExceptionCounts()`, `findBlocker()`, `attachActionHandlers()`, `openResolveModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P17 — Coaching Notes Modal (`17-coaching-notes.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/17-coaching-notes.html`
- **File Size**: 29.261 bytes
- **Page Title (`<title>`)**: `WorkPulse — Coaching Notes`
- **Product Area**: Performance & Coaching
- **Target Actors / Roles**: Supervisor/TL, Head of Department
- **Tujuan Halaman**: Modal pencatatan umpan balik pembinaan manajerial privat terhadap bawahan, kategori observasi, tindak lanjut, dan visibilitas.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi modal ManagerNoteModal.vue pada konteks /team dan /function.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `e.g. Tue, 8 Sep check-in, or BLK-1042`, `visibleToggle`.
  - Elemen Dropdown (`<select>`): `employeeSelect`.
  - Elemen Textarea: `noteInput`.
- **Aksi & Tombol**: Ditemukan 12 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `input`.
- **Fungsi JavaScript Tersemat**: `esc()`, `renderNotes()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P18 — Project Risk View (`18-project-risk.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/18-project-risk.html`
- **File Size**: 21.725 bytes
- **Page Title (`<title>`)**: `WorkPulse — Project Risk`
- **Product Area**: Project Delivery & Risk
- **Target Actors / Roles**: Project Manager (PM), Delivery Head
- **Tujuan Halaman**: Tampilan agregasi komitmen dan blocker lintas tim yang terkait dengan kode/tag proyek tertentu untuk mendeteksi risiko jadwal pengiriman.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /my-scope/project-risk (ProjectRiskPage.vue).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 6 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P19 — Management Pulse Executive Dashboard (`19-management-pulse.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/19-management-pulse.html`
- **File Size**: 31.571 bytes
- **Page Title (`<title>`)**: `WorkPulse — Management Pulse`
- **Product Area**: Executive Governance
- **Target Actors / Roles**: CEO, Direksi, Top Management
- **Tujuan Halaman**: Tampilan tingkat tinggi kesehatan operasional perusahaan, tren status komitmen lintas fungsi, metrik kepatuhan, dan isu strategis.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 1 / Section Utama pada ManagementPulsePage.vue (/management).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 5 tombol interaktif, mencakup aksi utama seperti: "Management Pulse", "Escalation Aging", "Reports", "View in Escalation Aging \u2192", "Full aging view \u2192".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P20 — Escalation Aging Queue (`20-management-escalation-aging.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/20-management-escalation-aging.html`
- **File Size**: 30.522 bytes
- **Page Title (`<title>`)**: `WorkPulse — Escalation Aging`
- **Product Area**: Executive Governance
- **Target Actors / Roles**: CEO, Direksi, Management
- **Tujuan Halaman**: Daftar blocker kritis dan eskalasi yang telah melampaui toleransi SLA waktu penanganan (aging analysis) di seluruh organisasi.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 2 pada ManagementPulsePage.vue (/management).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): `functionFilter`, `severityFilter`, `statusFilter`, `sortOrder`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 3 tombol interaktif, mencakup aksi utama seperti: "Management Pulse", "Escalation Aging", "Reports".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `ageLabel()`, `ageSince()`, `authorityTagHtml()`, `lifecycleLabel()`, `cardHtml()`, `render()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P21 — Compliance Queue (`21-compliance-queue.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/21-compliance-queue.html`
- **File Size**: 35.640 bytes
- **Page Title (`<title>`)**: `WorkPulse — Compliance Queue`
- **Product Area**: HRGA Governance
- **Target Actors / Roles**: HRGA, Compliance Officer
- **Tujuan Halaman**: Antrean pelanggaran kepatuhan pengisian komitmen (No Submission), log tindakan pembinaan berjenjang, dan eskalasi surat peringatan formal.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 1 pada CompliancePage.vue (/compliance).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `Search employee...`.
  - Elemen Dropdown (`<select>`): `functionFilter`, `statusFilter`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 12 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `change`, `input`.
- **Fungsi JavaScript Tersemat**: `esc()`, `evidenceSvg()`, `cardHtml()`, `render()`, `attachCardHandlers()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P22 — Exemption Management (`22-exemption-management.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/22-exemption-management.html`
- **File Size**: 43.032 bytes
- **Page Title (`<title>`)**: `WorkPulse — Exemption Management`
- **Product Area**: HRGA Governance
- **Target Actors / Roles**: HRGA, Admin
- **Tujuan Halaman**: Pengaturan hari libur bersama resmi kalender kerja dan pemberian dispensasi/pengecualian individual pengisian komitmen.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 2 pada CompliancePage.vue (/compliance).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `e.g. Independence Day`, `holidayStart`, `holidayEnd`, `e.g. Business travel to Surabaya (client onsite)`, `exemptionStart`, `exemptionEnd`.
  - Elemen Dropdown (`<select>`): `exemptionEmployee`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 20 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `fmtDate()`, `fmtRange()`, `computeStatus()`, `actionsHtml()`, `holidayRowHtml()`, `exemptionRowHtml()`, `render()`, `attachRowHandlers()`, `openDeactivateModal()`, `clearErrors()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Terdapat fungsi validasi form inline di sisi client sebelum submit (pengecekan input kosong, panjang karakter, dan format teks).
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P23 — Leave Approval Administration (`23-leave-approval.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/23-leave-approval.html`
- **File Size**: 35.301 bytes
- **Page Title (`<title>`)**: `WorkPulse — Leave Approval`
- **Product Area**: HRGA Governance
- **Target Actors / Roles**: HRGA, Admin
- **Tujuan Halaman**: Antrean tinjauan dan persetujuan formal izin/cuti karyawan tingkat organisasi, verifikasi kuota, dan status persetujuan.
- **Status Relevansi Spesifikasi Final**: Relevan. Dikonsolidasikan sebagai sub-panel pada CompliancePage.vue (/compliance).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `dateFilter`.
  - Elemen Dropdown (`<select>`): `functionFilter`, `employeeFilter`, `statusFilter`.
  - Elemen Textarea: `rejectReasonInput`.
- **Aksi & Tombol**: Ditemukan 15 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `change`.
- **Fungsi JavaScript Tersemat**: `esc()`, `initials()`, `updateExcCount()`, `renderLeaves()`, `attachHandlers()`, `openRejectModal()`, `closeRejectModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P24 — Coaching & Warning Records (`24-coaching-warning-records.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/24-coaching-warning-records.html`
- **File Size**: 40.332 bytes
- **Page Title (`<title>`)**: `WorkPulse — Coaching/Warning Records`
- **Product Area**: HRGA Governance
- **Target Actors / Roles**: HRGA, Management
- **Tujuan Halaman**: Buku register formal catatan pembinaan, teguran lisan, dan penerbitan Surat Peringatan (SP 1, SP 2, SP 3) berbasis riwayat kepatuhan.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 3 pada CompliancePage.vue (/compliance).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `logDate`.
  - Elemen Dropdown (`<select>`): `noteFunctionFilter`, `noteTypeFilter`, `noteEmployeeFilter`, `recFunctionFilter`, `recEmployeeFilter`.
  - Elemen Textarea: `logNote`.
- **Aksi & Tombol**: Ditemukan 16 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`, `change`.
- **Fungsi JavaScript Tersemat**: `esc()`, `initials()`, `renderNotes()`, `renderRecords()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P25 — Reports Hub (`25-reports.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/25-reports.html`
- **File Size**: 30.910 bytes
- **Page Title (`<title>`)**: `WorkPulse — Reports`
- **Product Area**: Analytics & Reporting
- **Target Actors / Roles**: Management, Heads, HRGA, PM, Supervisors
- **Tujuan Halaman**: Pusat 5 laporan operasional terpadu: Daily Exception, Weekly Team Summary, Monthly Trend, Individual Evidence, Blocker Root Cause, serta kontrol ekspor CSV/Excel.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /reports (ReportsPage.vue) dengan multi-tab laporan.

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: `periodFrom`, `periodTo`.
  - Elemen Dropdown (`<select>`): `employeeSelect`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 13 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P26 — Policy Settings (`26-policy-settings.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/26-policy-settings.html`
- **File Size**: 33.632 bytes
- **Page Title (`<title>`)**: `WorkPulse — Policy Settings`
- **Product Area**: System Administration & Governance
- **Target Actors / Roles**: Authorized Policy Owners, System Admin
- **Tujuan Halaman**: Pengaturan parameter kebijakan tata tertib kerja terbagi dalam 7 kategori (Cut-off times, Grace periods, Thresholds, Retention, SLA, Objection window).
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi route mandiri /policy-settings (PolicySettingsPage.vue).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 0 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 30 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `formatDate()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P27 — User & Role Management (`27-user-role-management.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/27-user-role-management.html`
- **File Size**: 47.173 bytes
- **Page Title (`<title>`)**: `WorkPulse — User &amp; Role Management`
- **Product Area**: System Administration
- **Target Actors / Roles**: System Admin
- **Tujuan Halaman**: Manajemen data master pengguna, aktivasi akun, penetapan sistem roles (Admin, HRGA, Head, Supervisor, PM, Employee), dan reset sandi administratif.
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 1 pada AdminUsersPage.vue (/admin/users).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 1 unit tabel data terstruktur.
  - Elemen Input Utama: `Search name or email\u2026`, `e.g. Putri Anandita`, `name@dutamedia.co.id`, `roleSupervisor`, `roleHead`, `rolePM`, `inviteDate`, `rolesDate`.
  - Elemen Dropdown (`<select>`): `roleFilter`, `functionFilter`, `statusFilter`, `inviteFunction`, `inviteManager`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 24 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `input`, `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `initials()`, `statusLabel()`, `actionsHtml()`, `rowHtml()`, `render()`, `findUser()`, `openModal()`, `closeModal()`, `attachRowHandlers()`, `formatDate()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P28 — Organization Mapping (`28-organization-mapping.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/28-organization-mapping.html`
- **File Size**: 44.938 bytes
- **Page Title (`<title>`)**: `WorkPulse — Organization Mapping`
- **Product Area**: System Administration
- **Target Actors / Roles**: System Admin, HRGA
- **Tujuan Halaman**: Pemetaan hierarki struktural atasan langsung (Supervisor -> Employee), struktur fungsi, dan penugasan kewenangan proyek (Project Authority).
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 2 pada AdminUsersPage.vue (/admin/users).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 2 unit tabel data terstruktur.
  - Elemen Input Utama: `Search name\u2026`, `reassignDate`, `e.g. Invoice Module (QA sign-off)`, `authorityDate`.
  - Elemen Dropdown (`<select>`): `orgFunctionFilter`, `reassignFunction`, `reassignManager`, `authorityPerson`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 22 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `input`, `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `initials()`, `orgRowHtml()`, `renderOrg()`, `findPerson()`, `findAuthority()`, `openModal()`, `closeModal()`, `attachOrgHandlers()`, `authRowHtml()`, `renderAuth()`, `attachAuthHandlers()`, `showHistory()`, `formatDate()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P29 — Temporary Reviewer Delegation (`29-temporary-reviewer.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/29-temporary-reviewer.html`
- **File Size**: 32.308 bytes
- **Page Title (`<title>`)**: `WorkPulse — Temporary Reviewer`
- **Product Area**: System Administration
- **Target Actors / Roles**: System Admin, Supervisor, Head
- **Tujuan Halaman**: Pendelegasian kewenangan reviewer sanggahan dan persetujuan cuti kepada pejabat pengganti selama periode waktu terbatas (dengan tanggal mulai & kedaluwarsa).
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 3 pada AdminUsersPage.vue (/admin/users).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 2 unit tabel data terstruktur.
  - Elemen Input Utama: `assignEffective`, `assignExpiry`.
  - Elemen Dropdown (`<select>`): `assignReviewer`, `assignScope`.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 16 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `initials()`, `formatDate()`, `daysLeft()`, `countdownHtml()`, `activeRowHtml()`, `pastRowHtml()`, `renderActive()`, `renderPast()`, `findAssign()`, `attachActiveHandlers()`, `openModal()`, `closeModal()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---

## LEG-P30 — Notification Setup (`30-notification-setup.html`)

### A. Identitas Halaman
- **Source File**: `Design-Artifacts/UI-UX-Design/30-notification-setup.html`
- **File Size**: 27.829 bytes
- **Page Title (`<title>`)**: `WorkPulse — Notification Setup`
- **Product Area**: System Administration
- **Target Actors / Roles**: System Admin
- **Tujuan Halaman**: Konfigurasi kanal notifikasi sistem untuk 13 pemicu bisnis (In-app, Browser Web Push, Email template, Webhook fallback).
- **Status Relevansi Spesifikasi Final**: Relevan. Menjadi Tab 4 pada AdminUsersPage.vue (/admin/users).

### B. Struktur Visual & Komposisi Layout
- **Page Shell & Layout**: Standalone shell terpusat (Full-page container). Memiliki Sidebar navigasi sisi kiri (lebar desktop 232px, adaptif).
- **Navigasi & Header**: Terdapat breadcrumb konteks hierarki, indikator profil pengguna, notifikasi badge bell, dan penanda role aktif.
- **Section & Hierarki Komponen**:
  - Halaman disusun secara modular dengan kontainer `max-width: 1200px` berjarak padding 24px (desktop) / 16px (mobile).
  - Terdapat panel kartu (`background: #FFFFFF`, border subtle `#DCE7E2`, border-radius `10px`).
  - Hierarki tipografi: Judul halaman `clamp(1.5rem, 3vw, 2rem)` Plus Jakarta Sans 700, sub-judul 1.25rem, body 0.9375rem.
- **Formulir, Tabel, & Input**:
  - Jumlah Form Terdeteksi: 0 unit form.
  - Jumlah Tabel Data: 1 unit tabel data terstruktur.
  - Elemen Input Utama: Tidak ada input teks standar.
  - Elemen Dropdown (`<select>`): Tidak ada dropdown native.
  - Elemen Textarea: Tidak ada textarea.
- **Aksi & Tombol**: Ditemukan 12 tombol interaktif, mencakup aksi utama seperti: "My Today", "My History", "My Leave Request", "Notifications", "Profile".
- **Permukaan Modal & Tab**: Tidak memiliki modal mandiri. Tidak ada struktur tab horizontal.
- **State Representation dalam Desain**:
  - **Empty State**: Menampilkan ikon SVG netral, teks keterangan sekunder (`#5C6E68`), dan tombol aksi pemicu.
  - **Locked State**: Dinyatakan via banner `LockedIndicator` warna slate netral dengan teks penanda batas cut-off (bukan warna merah peringatan).
  - **Status Badges**: Mengimplementasikan `StatusBadge` (Daily Status GREEN/AMBER/RED berlatar pill + dot) dan `SubmissionTimingBadge` (outline pill + icon) yang terpisah secara tegas.

### C. Analisis Perilaku & Interaktivitas Skrip
- **Event Listeners Terdeteksi**: `change`, `click`.
- **Fungsi JavaScript Tersemat**: `esc()`, `toggleCellHtml()`, `rowHtml()`, `render()`, `findTrigger()`, `attachRowHandlers()`, `setDirty()`, `openSidebar()`, `closeSidebar()`, `showToast()`, `bellIconSvg()`, `renderBellDropdown()`, `renderBellBadge()`, `closeBellDropdown()`.
- **Logika Validasi Form**: Mengandalkan validasi default browser / form submission.
- **Simulasi State & Mock API**: Menggunakan stimulasi delay (`setTimeout`) atau in-memory mock data untuk menyimulasikan feedback respon server dan toast notification.
- **Batasan Prototipe Historis**: Seluruh data yang ditampilkan bersifat hardcoded mock array. Aksi submit tidak melakukan persistensi ke database nyata dan hanya menampilkan visual toast feedback.

### D. Ketergantungan Aset & Desain
- **Font**: `Plus Jakarta Sans` (Google Fonts) & `JetBrains Mono` (Google Fonts).
- **CSS Styling**: CSS variables tersemat pada elemen root (`--bg`, `--surface`, `--accent-primary`, dsb.).
- **Ikon**: Menggunakan inline SVG tersemat (vector paths mandiri).
- **Pustaka Eksternal**: Mandiri tanpa dependensi framework runtime (Zero third-party JS runtime dependencies).

---
