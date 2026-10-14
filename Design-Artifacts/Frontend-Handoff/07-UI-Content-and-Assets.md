# 07 — UI Content, Copy, and Asset Inventory
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-07 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Bahasa Antarmuka Standar** | Bahasa Indonesia (Kecuali istilah domain/teknis yang dipertahankan) |
| **Sumber Kebenaran Copy** | PRD v1.1, UI/UX Spec v1.2, Design System v1.1 |

---

## 1. Panduan Bahasa & Nada Komunikasi (Tone of Voice)

Antarmuka WorkPulse dibangun dengan prinsip komunikasi internal yang **tenang, objektif, manusiawi, dan mendukung akuntabilitas**, bukan alat pengawasan (*surveillance tool*) yang menghakimi:
1. **Status Faktual**: Ketiadaan pengisian tidak disebut "Alfa" atau "Pelanggaran", melainkan secara faktual `No Submission`.
2. **Penguncian Bukan Kesalahan**: Penanda cut-off disebut `Baseline Terkunci` dengan latar slate netral, bukan pesan kesalahan berwarna merah.
3. **Pemberian Pilihan Berimbang**: Sistem memberikan saran (*heuristik deterministik*) tanpa nada mendikte. Tombol konfirmasi selalu memberikan bobot yang setara untuk mempertahankan pilihan pengguna atau menerima saran sistem.

---

## 2. Inventaris String Antarmuka (UI Copy Register)

| String ID | Komponen / Halaman | Teks Prototipe Lama | Teks Final Disahkan | Sumber Keputusan | Status Review | Catatan Semantik |
|---|---|---|---|---|---|---|
| **STR-01** | `LoginPage` | Sign in | Masuk ke Sistem | PRD FR-01, UI/UX 4.1 | **APPROVED** | Bahasa Indonesia baku untuk autentikasi. |
| **STR-02** | `LoginPage` | Email address | Email Kerja | UI/UX Spec A 4.1 | **APPROVED** | Menegaskan penggunaan email korporat. |
| **STR-03** | `LoginPage` | Password | Kata Sandi | UI/UX Spec A 4.1 | **APPROVED** | Standar UI Bahasa Indonesia. |
| **STR-04** | `LoginPage` | Forgot password? | Lupa kata sandi? | UI/UX Spec A 4.1 | **APPROVED** | Tautan pemulihan akun. |
| **STR-05** | `MyTodayPage` Header | Morning Commitment | Komitmen Pagi | PRD US-01, UI/UX 4.2 | **APPROVED** | Header sesi kerja pagi. |
| **STR-06** | `MyTodayPage` Banner | Baseline locked since 09:30 | Baseline terkunci sejak [waktu cut-off] | Design System 04 Sec 4 | **APPROVED** | Teks informatif LockedIndicator (Slate netral). |
| **STR-07** | `MyTodayPage` Form | Commitment #1 | Komitmen 1 (Maks. 3 komitmen) | PRD US-01, UI/UX 4.2 | **APPROVED** | Pembatasan eksplisit 3 slot. |
| **STR-08** | `MyTodayPage` Zero | I have no commitment today | Saya tidak memiliki komitmen harian | PRD US-01, PDD G3 | **APPROVED** | Opsi zero-commitment resmi dengan alasan wajib. |
| **STR-09** | `MyTodayPage` Action | Add ad-hoc work | Tambah Pekerjaan Ad-hoc | PRD US-02, UI/UX 4.3 | **APPROVED** | Pencatatan tugas tambahan di tengah hari. |
| **STR-10** | `MyTodayPage` Blocker | Raise Instant Blocker | Laporkan Kendala Seketika | PRD US-06, UI/UX 4.5 | **APPROVED** | Tindakan pelaporan hambatan kerja. |
| **STR-11** | `MyTodayPage` EOD | EOD Check-in | Evaluasi Akhir Hari (EOD) | PRD US-03, UI/UX 4.4 | **APPROVED** | Header sesi kerja sore. |
| **STR-12** | `MyTodayPage` Outcome | Achieved / Partial / Not Achieved | Tercapai / Sebagian / Belum Tercapai | PRD US-03, UI/UX 4.4 | **APPROVED** | Tiga nilai evaluasi pencapaian kerja. |
| **STR-13** | `MyTodayPage` Continuation | Done / Continue | Selesai / Lanjutkan Besok | PRD US-03, UI/UX 4.4 | **APPROVED** | Nilai flag kelanjutan untuk carry-forward. |
| **STR-14** | `ValidationPromptModal` | Keep my choice | Pertahankan Pilihan Saya (dengan alasan) | Design System 04 Sec 4 | **APPROVED** | Tombol penolakan rekomendasi status berimbang. |
| **STR-15** | `ValidationPromptModal` | Use suggested status | Gunakan Rekomendasi Sistem | Design System 04 Sec 4 | **APPROVED** | Tombol penerimaan rekomendasi heuristik. |
| **STR-16** | `BlockerActionModal` | Acknowledge | Akui Kendala (Acknowledge) | PRD US-09, UI/UX 4.9 | **APPROVED** | Transisi awal penanganan kendala oleh TL. |
| **STR-17** | `BlockerActionModal` | Mark as Resolved | Tandai Telah Teratasi (Resolved) | PRD US-09, UI/UX 4.9 | **APPROVED** | Memerlukan catatan solusi wajib (resolution note). |
| **STR-18** | `BlockerActionModal` | Confirm Closed | Konfirmasi Selesai (Closed) | PRD US-09, UI/UX 4.9 | **APPROVED** | HANYA dapat dilakukan oleh pelapor asli kendala. |
| **STR-19** | `BlockerActionModal` | Accept Risk | Terima Risiko (Accepted Risk) | PRD US-09, UI/UX 4.9 | **APPROVED** | Keputusan otoritas berwenang jika kendala tak dapat diatasi. |
| **STR-20** | `TeamPulsePage` Tab 1 | Team Pulse | Roster Akuntabilitas Tim | UI/UX Spec A 4.8 | **APPROVED** | Tab pemantauan komitmen tim harian. |
| **STR-21** | `TeamPulsePage` Tab 2 | Blocker Queue | Antrean Kendala Tim | UI/UX Spec A 4.9 | **APPROVED** | Tab daftar kendala kerja tim aktif. |
| **STR-22** | `TeamPulsePage` Tab 3 | Review | Tinjauan Koreksi & Cuti | UI/UX Spec A 4.22 | **APPROVED** | Tab tinjauan pengajuan koreksi dan izin cuti. |
| **STR-23** | `ObjectionWindow` Chip | 48h window remaining | Batas sanggahan: [HH:mm:ss] | Design System 04 Sec 4 | **APPROVED** | Format hitung mundur JetBrains Mono. |
| **STR-24** | `CompliancePage` Tab 1 | Compliance Violations | Antrean Kepatuhan Non-Submission | PRD US-13, UI/UX 4.11 | **APPROVED** | Tab pelanggaran tidak mengisi komitmen. |
| **STR-25** | `CompliancePage` Tab 2 | Exemptions & Holidays | Pengecualian & Hari Libur | PRD US-14, UI/UX 4.12 | **APPROVED** | Tab dispensasi dan kalender libur resmi. |
| **STR-26** | `CompliancePage` Tab 3 | Warning Records | Rekam Pembinaan & Surat Peringatan | PRD US-15, UI/UX 4.10 | **APPROVED** | Tab buku register catatan pembinaan dan SP. |
| **STR-27** | `ReportsPage` Hub | Reports Hub | Pusat Laporan Operasional | PRD US-24, UI/UX 4.23 | **APPROVED** | Header halaman analitik dan laporan. |
| **STR-28** | `PolicySettingsPage` | Work Policy Settings | Pengaturan Kebijakan Tata Tertib | PRD US-23, UI/UX 4.18 | **APPROVED** | Header pengaturan parameter 7 kategori. |
| **STR-29** | `AdminUsersPage` Tab 1 | User Management | Manajemen Pengguna & Peran | SAD 16.4 | **APPROVED** | Tab master user akun dan hak akses. |
| **STR-30** | `AdminUsersPage` Tab 2 | Org Mapping | Pemetaan Organisasi & Otoritas Proyek | PRD US-25, UI/UX 4.15 | **APPROVED** | Tab hierarki atasan dan otoritas proyek. |

---

## 3. Pesan Kesalahan Form (Validation Error Messages)

Semua pesan kesalahan menggunakan Bahasa Indonesia yang spesifik dan jelas:
- `ERR-VAL-01`: *"Email kerja wajib diisi."*
- `ERR-VAL-02`: *"Format email tidak valid (gunakan email korporat @dutamedia.com)."*
- `ERR-VAL-03`: *"Kata sandi wajib diisi."*
- `ERR-VAL-04`: *"Kata sandi baru minimal 8 karakter dan mengandung angka."*
- `ERR-VAL-05`: *"Konfirmasi kata sandi tidak cocok."*
- `ERR-VAL-06`: *"Deskripsi komitmen minimal 5 karakter."*
- `ERR-VAL-07`: *"Maksimal 3 komitmen harian diperbolehkan."*
- `ERR-VAL-08`: *"Alasan tanpa komitmen wajib diisi minimal 10 karakter."*
- `ERR-VAL-09`: *"Pilihan hasil kerja (Outcome) wajib ditentukan sebelum mengirim EOD."*
- `ERR-VAL-10`: *"Pilihan kelanjutan (Continuation) wajib ditentukan sebelum mengirim EOD."*
- `ERR-VAL-11`: *"Deskripsi kendala (Blocker) minimal 10 karakter."*
- `ERR-VAL-12`: *"Catatan solusi (Resolution note) wajib diisi saat menyelesaikan kendala."*
- `ERR-VAL-13`: *"Alasan sanggahan wajib diisi jika menolak pengajuan koreksi."*
- `ERR-VAL-14`: *"Tanggal mulai tidak boleh melebihi tanggal selesai cuti."*

---

## 4. Inventaris Ikon & Aset Visual

| Aset ID | Tipe | Nama / Nilai | Digunakan Pada | Sumber |
|---|---|---|---|---|
| **AST-01** | Font | Plus Jakarta Sans | Teks utama, judul, dan form inputs | Google Fonts CDN |
| **AST-02** | Font | JetBrains Mono | Kode ID, timestamps, countdown chip, metrik | Google Fonts CDN |
| **AST-03** | MDI Icon | `mdi-check-circle-outline` | SubmissionTimingBadge: On-Time | `@mdi/font` |
| **AST-04** | MDI Icon | `mdi-clock-outline` | SubmissionTimingBadge: Late | `@mdi/font` |
| **AST-05** | MDI Icon | `mdi-minus-circle-outline` | SubmissionTimingBadge: No Submission | `@mdi/font` |
| **AST-06** | MDI Icon | `mdi-lock-outline` | LockedIndicator banner strip | `@mdi/font` |
| **AST-07** | MDI Icon | `mdi-alert-circle` | Blocker critical severity indicator | `@mdi/font` |
| **AST-08** | MDI Icon | `mdi-bell-outline` | NotificationBell di navbar | `@mdi/font` |
| **AST-09** | MDI Icon | `mdi-download` | ExportButton unduh laporan | `@mdi/font` |
| **AST-10** | MDI Icon | `mdi-plus` | Tombol Tambah Komitmen / Ad-hoc / Blocker | `@mdi/font` |
