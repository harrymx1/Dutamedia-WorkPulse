# Daftar Perubahan Hasil Audit & Penyesuaian Prototype vs Sistem Live

> **Ditujukan untuk:** Harry (Pemilik Proyek) & Rekan Auditor  
> **Situs Live yang Diaudit:** `https://dutamedia-workpulse.vercel.app`  
> **Acuan Rancangan Awal:** 26 file HTML di folder `Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/` dan dokumen `01-PDD.md` s/d `05-SAD.md`  
> **Dokumen Terkait Wajib Dibaca Bersama:**
> - **Perubahan Resmi Sebelumnya (4 Paket Pasca-UAT):** [Daftar-Perubahan-Pasca-UAT-4-Paket.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Daftar-Perubahan-Pasca-UAT-4-Paket.md)
> - **Panduan Alur & Skenario Prosedural Lengkap:** [Dokumen-Induk-Alur-dan-Kondisi-Sistem.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Dokumen-Induk-Alur-dan-Kondisi-Sistem.md)
> - **Aturan Kerja Audit:** [aturan-audit-dan-penyesuaian-prototype-vs-live.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/.agents/rules/aturan-audit-dan-penyesuaian-prototype-vs-live.md)

---

## Ringkasan & Cara Membaca Dokumen Ini

Setelah seluruh **4 Paket Pasca-UAT** selesai (yang tercatat di [Daftar-Perubahan-Pasca-UAT-4-Paket.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Daftar-Perubahan-Pasca-UAT-4-Paket.md)), dilakukan pemeriksaan mendalam halaman demi halaman antara **kode desain awal (*prototype HTML*)** dengan **kode dan tampilan sistem live sekarang**.

Dokumen ini mencatat seluruh hasil audit tersebut dengan jujur:
1. Fitur/tampilan prototype mana saja yang sempat terlewat, belum punya data contoh di `seed.ts`, atau tata letaknya meleset lalu **diperbaiki**.
2. Perubahan mana yang memang berbeda dari prototype tetapi **dipertahankan** karena memiliki alasan bisnis dan keputusan resmi yang kuat.

---

## Bagian 1 — Peta Status Audit 26 File Prototype HTML

| No | File Prototype HTML (`UI-UX-Design/...`) | Halaman & Rute di Situs Live | Status Audit | Catatan Singkat |
|---|---|---|---|---|
| 1 | **`01-Login-Activation.html`** | **Login (`/login`) & Aktivasi (`/activate`)** | **`Selesai Diaudit & Disesuaikan`** | Diperbaiki pada `7f20e60` & `3904826` (`01-B1` s/d `01-B5`: logo mobile, ingat email, 3 syarat sandi + huruf & angka, pratinjau akun undangan, banner lockout & pasca-aktivasi). Lihat **Audit #2** di bawah. |
| 2 | **`02-Morning-Commitment.html`** | **Komitmen Pagi (`/daily/morning`)** | **`Selesai Diaudit & Disesuaikan`** | Diperbaiki pada `dabb266` & `69bb068` (`1a`, `1b`, `1c`, tata letak footer 1 baris, & data `H-1`/`H-2` di `seed.ts`). Lihat rincian **Audit #1** di bawah. |
| 3 | `03-Additional-Work.html` | Tugas Tambahan (`/daily/additional-work`) | `Menunggu Audit Detail` | Sudah mencakup Paket #2 kunci pasca-EOD; menunggu audit 6 dimensi lengkap. |
| 4 | `04-EOD-Outcome.html` | Evaluasi Sore EOD (`/daily/eod`) | `Menunggu Audit Detail` | — |
| 5 | `05-Blocker-Resolution-Queue.html` | Antrean Blocker (`/blockers`) | `Menunggu Audit Detail` | — |
| 6 | `06-My-History-Weekly-Summary.html` | Riwayat Saya (`/daily/history`) | `Menunggu Audit Detail` | — |
| 7 | `07-Notifications-Inbox.html` | Notifikasi (`/notifications`) | `Menunggu Audit Detail` | — |
| 8 | `08-Manager-Pulse-Dashboard.html` | Pulse Dashboard (`/dashboard`) | `Menunggu Audit Detail` | — |
| 9 | `09-Raise-Blocker.html` | Lapor Blocker & Blocker Saya (`/raise-blockers`) | `Menunggu Audit Detail` | — |
| 10 | `10-Manager-Coaching-Notes.html` | Catatan Coaching (`/coaching`) | `Menunggu Audit Detail` | — |
| 11 | `11-HRGA-Compliance-Queue.html` | Antrean Kepatuhan (`/compliance`) | `Menunggu Audit Detail` | — |
| 12 | `12-HRGA-Exemption-Management.html` | Manajemen Dispensasi (`/exemptions`) | `Menunggu Audit Detail` | — |
| 13 | `13-Project-Risk-Radar.html` | Radar Risiko Proyek (`/projects/risk`) | `Menunggu Audit Detail` | — |
| 14 | `14-Blocker-Escalation-Aging.html` | Penuaan & Eskalasi (`/blockers/aging`) | `Menunggu Audit Detail` | — |
| 15 | `15-Admin-Organizational-Mapping.html` | Struktur Organisasi (`/admin/organization`) | `Menunggu Audit Detail` | — |
| 16 | `16a-Morning-Correction-Request.html` | Koreksi Komitmen Pagi (`/corrections/morning`) | `Menunggu Audit Detail` | — |
| 17 | `16b-EOD-Correction-Request.html` | Koreksi Evaluasi Sore (`/corrections/eod`) | `Menunggu Audit Detail` | — |
| 18 | `17-Admin-Temporary-Reviewer.html` | Reviewer Sementara (`/admin/temporary-reviewers`) | `Menunggu Audit Detail` | — |
| 19 | `18-Policy-Settings.html` | Pengaturan Kebijakan (`/admin/policies`) | `Menunggu Audit Detail` | — |
| 20 | `19-Admin-Notification-Channel-Setup.html` | Saluran Notifikasi (`/admin/notifications`) | `Menunggu Audit Detail` | — |
| 21 | `20-Leave-Submission.html` | Cuti Saya (`/leave/my`) | `Menunggu Audit Detail` | — |
| 22 | `21-HRGA-Leave-Approval-Queue.html` | Persetujuan Cuti (`/leave/queue`) | `Menunggu Audit Detail` | — |
| 23 | `22-Review-Correction-Objection.html` | Review Koreksi (`/corrections/review`) | `Menunggu Audit Detail` | — |
| 24 | `23-Executive-Reports-Analytics.html` | Laporan Eksekutif (`/reports`) | `Menunggu Audit Detail` | — |
| 25 | `24-Profile-Settings.html` | Profil Akun (`/profile`) | `Menunggu Audit Detail` | — |
| 26 | `25-Admin-User-Invitation-Management.html` | Kelola Pengguna & Undangan (`/admin/users`, `/admin/invitations`) | `Menunggu Audit Detail` | — |

---

## Bagian 2 — Rincian Perubahan per Halaman yang Sudah Diaudit

### Audit #1: `02-Morning-Commitment.html` → Halaman Komitmen Pagi (`/daily/morning`)

- **Tanggal Selesai & Verifikasi Live:** 20 November 2026 (`commit dabb266` & `69bb068`)
- **Bukti Verifikasi Chrome Live:** `M1` s/d `M7` di folder artefak `screenshots/verifikasi-morning/` (diuji nyata pada akun **Dio Bayu Bagaskara** `product@dutamedia.com` dan **Aditya Nugroho** `dev.frontend@dutamedia.com`).

| Kode Temuan | Bagian yang Diaudit | Kondisi Sebelumnya di Sistem Live | Akar Penyebab | Penyesuaian yang Diterapkan (`dabb266` & `69bb068`) | Alasan / Keputusan |
|---|---|---|---|---|---|
| **`1a`** | **Prioritas Kemarin Sore (*Tomorrow Priority*) dari H-1 ke H** | Spanduk *Prioritas Kemarin Sore* sudah ada di kode, tetapi **tidak pernah muncul di situs live** dan langsung hilang setelah komitmen pagi dikirim. | 1) Data awal (`seed.ts`) tidak pernah membuat rekaman laporan hari kemarin (`H-1`), sehingga data kemarin selalu kosong.<br>2) `daily.service.ts` hanya mengambil `tomorrowPriority` jika komitmen hari ini belum dikirim. | 1) Menanamkan data `H-1` nyata di `seed.ts` (berikut mekanisme aman melewati kunci tanggal mundur) untuk **Dio Bayu Bagaskara**, **Raka Pratama**, dan **Aditya Nugroho**.<br>2) Memperbaiki `daily.service.ts` dan `MorningCommitmentView.vue` agar kotak kuning **`Prioritas Kemarin Sore`** (`Hanya Referensi`) **tetap tampil baik sebelum maupun sesudah komitmen pagi terkunci (`SUBMITTED`)**. | **Diperbaiki (Wajib):** Pengingat prioritas dari evaluasi sore kemarin harus nyata muncul di situs live dan tetap bisa dilihat sebagai rujukan sepanjang hari kerja. |
| **`1b`** | **Draf Pekerjaan Berlanjut dari Kemarin (*Carry-Over*)** | 1) Panel tidak pernah muncul di live karena tidak ada data `H-1`/`H-2`.<br>2) Layar menulis `"Carry-over 3+ hari"` (`>= 3`) sedangkan server sudah menyarankan kuning sejak hari ke-2 (`>= 2`).<br>3) Belum ada kotak centang pilih beberapa item sekaligus & tombol `Gunakan Item Terpilih ke Slot Hari Ini`, dan `Potensi Kendala` dibiarkan kosong saat tugas `AMBER` disalin. | 1) `seed.ts` belum menanam rantai `H-2 → H-1` dengan `CONTINUE`.<br>2) Ambang UI tidak sinkron dengan aturan resmi `DEC-003` (`>= 2`).<br>3) Mekanisme centang multi-item & info sumber di prototype `02` terlewat saat implementasi awal. | 1) Menanamkan rantai `H-2 → H-1` nyata pada **Dio Bayu** (`2 Tersedia`: **`Carry-Over #2` berisiko `AMBER`** & **`Carry-Over #1` berisiko `GREEN`**) dan `H-1` pada **Raka Pratama** (`1 Tersedia`).<br>2) Menyelaraskan teks & lencana kuning menjadi **`Carry-over 2+ hari berturut-turut — Disarankan AMBER`** (`>= 2`).<br>3) Menambahkan informasi **`Sumber: Komitmen Pagi Kemarin`**, **`Keputusan EOD: Dilanjutkan`**, **`Proyek`**, **kotak centang multi-item** + tombol **`Gunakan Item Terpilih ke Slot Hari Ini`** (di samping tombol cepat `Salin ke Slot` per item).<br>4) Mengisi otomatis kolom wajib **`Uraian Resiko atau Potensi Kendala *`** dengan isi **`Catatan EOD Kemarin`** saat tugas `AMBER`/`RED` disalin (pengguna tetap bebas mengeditnya). | **Diperbaiki (Wajib):** Menyelaraskan 100% dengan prototype `02-Morning-Commitment.html`, aturan `DEC-003`, dan memastikan pengalaman isi form yang praktis. *(Catatan: Tombol cepat `Salin ke Slot` per kartu tetap dipertahankan agar pengguna yang hanya menyalin 1 tugas cukup 1 kali klik).* |
| **`1c`** | **Fitur `Simpan Draf` Lokal** | Di halaman live hanya ada 1 tombol **`Kirim Morning Commitment`** di footer. Tidak ada tombol **`Simpan Draf`**. | Tombol `#btn-save-draft` & penyimpanan draf lokal (`localStorage` sesuai Pedoman Konsistensi Bagian 8.4) terlewat saat pembuatan awal halaman Vue. | Menambahkan tombol **`Simpan Draf`** yang menyimpan sementara isi formulir (slot 1–3 atau opsi `0 Komitmen`) ke browser (`localStorage` terikat akun & tanggal kerja hari itu), memunculkan lencana **`Draf tersimpan pukul HH:mm WIB`** + tombol **`Reset Draf`**, memulihkan ketikan otomatis saat halaman dimuat ulang (`F5`), dan membersihkan draf lokal otomatis saat komitmen resmi dikirim. | **Diperbaiki (Wajib):** Melindungi ketikan karyawan dari hilangnya data jika browser tertutup atau `F5` sebelum sempat mengirim komitmen resmi sebelum cut-off. |
| **`1c-layout`** | **Teks & Tata Letak 1 Baris `.action-footer`** | Kalimat footer sempat membawa jam cut-off (`... sebelum batas cut-off 23:59 WIB.`), dan tombol `Simpan Draf` + `Kirim Morning Commitment` sempat turun ke baris bawah teks pada layar desktop. | CSS `.action-footer` menambahkan `flex-wrap: wrap` tanpa `flex: 1` pada teks kiri, sehingga lebar gabungan teks panjang + 2 tombol melipat tombol ke baris kedua. | 1) Menyingkat teks menjadi persis **`"Pastikan seluruh komitmen telah diisi dengan akurat sebelum batas cut-off."`** (sesuai tampilan bersih di prototype).<br>2) Menghapus `flex-wrap: wrap` pada layar desktop agar teks di kiri dan tombol **`Simpan Draf`** + **`Kirim Morning Commitment`** di kanan selalu sejajar dalam **satu baris horizontal yang sama** (baik sebelum maupun sesudah draf tersimpan; hanya bertumpuk di layar ponsel `<= 768px`). | **Diperbaiki (Wajib — `69bb068`):** Menyamakan tata letak visual 1 baris dengan prototype `02-Morning-Commitment.html`. |

---

### Audit #2: `01-Login-Activation.html` → Halaman Masuk (`/login`) & Aktivasi Akun (`/activate`)

- **Tanggal Selesai & Verifikasi Live:** 20 November 2026 (`commit 7f20e60` & `3904826`)
- **Bukti Verifikasi Chrome Live:** `A1` s/d `A9` di folder artefak `screenshots/verifikasi-login-activate/`

| Kode Temuan | Bagian yang Diaudit | Kondisi Sebelumnya di Sistem Live | Akar Penyebab | Penyesuaian yang Diterapkan (`7f20e60` & `3904826`) | Alasan / Keputusan |
|---|---|---|---|---|---|
| **`01-B1`** | **Logo & Identitas WorkPulse di Layar HP/Tablet (`<= 900px`)** | Saat dibuka di HP/tablet, kotak hijau kiri disembunyikan sehingga nama dan logo **WorkPulse hilang total** dari `/login` dan `/activate`. | Elemen `.mobile-brand-header` pada prototype `01` terlupa dibuat di komponen Vue `LoginView.vue` dan `ActivateView.vue`. | Menambahkan `.mobile-brand-header` (logo `WP` + **`WorkPulse`** + **`Dutamedia Accountability`**) tepat di atas kartu formulir yang otomatis tampil pada layar `<= 900px`. | **Diperbaiki (Wajib):** Karyawan yang membuka aplikasi dari HP harus langsung melihat identitas aplikasi dengan jelas. |
| **`01-B2`** | **Kotak Centang `"Ingat email di perangkat ini"`** | Variabel centangnya sudah ada di kode, tetapi belum melakukan apa-apa (hanya pajangan mati). | Fungsi simpan/muat email ke `localStorage` terlewat saat implementasi awal. | Menghidupkan fungsi centang **`Ingat email di perangkat ini`**: email otomatis tersimpan saat login berhasil dan langsung terisi saat membuka `/login` lagi (lalu otomatis terhapus bila centang dilepas). | **Diperbaiki (Wajib):** Menghemat waktu karyawan saat masuk ulang pada perangkat pribadi/kantornya. |
| **`01-B3`** | **3 Syarat Kata Sandi, Wajib Huruf+Angka, & Tombol Mata Konfirmasi di `/activate`** | Validasi hanya mengecek minimal 8 huruf (sandi huruf-saja lolos), belum ada kotak 3 daftar periksa syarat, dan kolom konfirmasi tidak punya tombol mata. | Aturan `Matches` huruf+angka di backend/frontend, blok `.strength-checklist`, dan tombol mata kedua terlewat. | Menambahkan aturan wajib kombinasi huruf dan angka di backend (`ActivateDto` & `AuthService`) dan frontend, menampilkan kotak 3 syarat real-time (*Minimal 8 karakter*, *Kombinasi huruf & angka*, *Konfirmasi kata sandi cocok*), menghilangkan pesan error merah otomatis saat diketik ulang, serta menambah tombol mata pada *Konfirmasi Kata Sandi* + ruang aman kanan agar placeholder tidak menyentuh ikon di HP. | **Diperbaiki (Wajib):** Menjamin kata sandi aktivasi akun baru memenuhi standar keamanan minimum perusahaan. |
| **`01-B4`** | **Kartu Pratinjau Akun Undangan & Peringatan Token Tidak Berlaku** | Saat membuka link undangan `?token=...`, nama dan email karyawan yang diundang belum ditampilkan; peringatan token mati baru muncul setelah klik kirim. | Endpoint pratinjau token belum tersedia di backend. | Menambah endpoint publik `GET /api/v1/auth/invitation-preview` di backend dan menampilkan **Kartu Pratinjau Akun** (inisial, nama lengkap, email, divisi, lencana `UNDANGAN AKTIF`) untuk token `PENDING`, serta kotak kuning **`Undangan Tidak Berlaku`** saat token sudah terpakai (`USED`), dicabut (`REVOKED`), kedaluwarsa (`EXPIRED`), atau tidak dikenal (`NOT_FOUND`). | **Diperbaiki (Wajib):** Memberi kepastian kepada karyawan baru bahwa tautan undangan benar milik akunnya sebelum menetapkan kata sandi. |
| **`01-B5`** | **Banner Kuning Lockout & Banner Hijau Pasca-Aktivasi** | Saat terkunci 5x salah masih memakai banner merah biasa, dan berpindah dari selesai aktivasi ke `/login` belum membawa pesan sambutan & email. | Class banner `warning` / `info` dan parameter `?activated=1&email=...` belum dihubungkan. | Memisahkan kotak peringatan kuning **`Batas Percobaan Terlampaui`** saat terkunci sementara, serta membawa banner hijau **`Aktivasi berhasil! Silakan masuk dengan kata sandi baru Anda.`** + email otomatis saat lanjut ke `/login`. | **Diperbaiki (Wajib):** Selaras dengan prototype `01-Login-Activation.html` dan memberi umpan balik visual yang tepat per kondisi. |
| **`01-A1..A3`** | **Kalimat Hero (`Komitmen jelas, hambatan tuntas`), Tab `Masuk`/`Aktivasi`, & Tanpa Reset Password Email Publik** | Tetap dipertahankan sesuai implementasi live saat ini. | Ditetapkan lewat `IMP-007..012` dan `OPEN-05`. | Tidak diubah. | **Dipertahankan (Alasan Kuat):** Lebih sesuai untuk seluruh divisi serta alur aktivasi dan reset melalui Admin/HRGA & halaman Profil. |
