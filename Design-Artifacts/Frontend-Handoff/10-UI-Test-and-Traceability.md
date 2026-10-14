# 10 — UI Test and Traceability Package
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-10 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Framework Pengujian** | Vitest v4 (Unit/Component) + Playwright v1.48 (E2E & Responsive) |
| **Status Uji** | Test Case Specification & Execution Checklist (Non-Claimed) |

---

## 1. Matriks Penelusuran Persyaratan Lengkap (End-to-End Traceability Matrix)

| Kebutuhan PRD | Business Spec Unit | Screen Specification | Komponen Utama | Interaction ID | Acceptance Criteria | Test Case ID | Tipe Pengujian |
|---|---|---|---|---|---|---|---|
| **FR-01** (Autentikasi) | A 4.1 Login | `PAGE-01-login.md` | `LoginFormCard` | `INT-01-01` | User valid berhasil login dan token tersimpan | `TC-AUTH-01` | E2E / Component |
| **US-01** (Morning Checkin) | A 4.2 Morning | `PAGE-03-my-today.md` | `CommitmentCard` | `INT-03-01` | 1-3 komitmen tersimpan atau zero beralasan | `TC-MC-01` | E2E / Form Val |
| **BR-02** (Carry Forward) | A 4.2 Morning | `PAGE-03-my-today.md` | `DraftBanner` | `INT-03-01` | Carry forward hanya dari Continue kemarin | `TC-MC-02` | Component Unit |
| **US-02** (Additional Work) | A 4.3 Add Work | `PAGE-03-my-today.md` | `AdditionalWorkModal` | `INT-03-01` | Tugas ad-hoc tercatat dengan tag terpisah | `TC-AW-01` | Component Unit |
| **US-03** (EOD Outcome) | A 4.4 EOD | `PAGE-03-my-today.md` | `CommitmentCard` | `INT-03-02` | Outcome dan continuation terisi lengkap | `TC-EOD-01` | E2E / Form Val |
| **US-06** (Raise Blocker) | A 4.5 Blocker | `PAGE-03-my-today.md` | `RaiseBlockerModal` | `INT-03-01` | Blocker Open terbuat dengan otoritas Org/Prj | `TC-BLK-01` | E2E / Modal |
| **US-08** (Blocker Queue) | A 4.9 Queue | `PAGE-08-team-pulse.md` | `BlockerCard` | `INT-08-01` | Blocker tim ditampilkan dan filter severity | `TC-BLK-02` | Component Unit |
| **US-09** (Blocker Action) | A 4.9 Detail | `PAGE-08-team-pulse.md` | `BlockerActionModal` | `INT-08-01` | Transisi Ack -> Resolve -> Close dipatuhi | `TC-BLK-03` | E2E Lifecycle |
| **US-18** (Correction Req) | A 4.16 Correction | `PAGE-03-my-today.md` | `CorrectionRequestModal`| `INT-03-01` | Klasifikasi Minor/Material dan alasan | `TC-COR-01` | Component Unit |
| **US-19** (Review Koreksi) | A 4.22 Review | `PAGE-08-team-pulse.md` | `ObjectionIndicator` | `INT-08-02` | Objection window 48h dihitung mundur | `TC-COR-02` | Component Unit |
| **US-21** (Pengajuan Cuti) | A 4.20 Leave | `PAGE-07-my-leave.md` | `LeaveApplicationForm` | `INT-07-01` | Permohonan cuti pending terbuat | `TC-EXC-01` | Form Validation |
| **US-13** (Compliance NoSub) | A 4.11 Compliance| `PAGE-10-compliance.md`| `ComplianceTable` | `INT-10-01` | Rekam pelanggaran no-sub dan eskalasi SP | `TC-CMP-01` | Integration |
| **US-24** (Reporting Hub) | A 4.23 Reports | `PAGE-12-reports.md` | `ExportButton` | `INT-12-01` | 5 laporan operasional dan ekspor blob | `TC-REP-01` | E2E / Blob Test |
| **US-23** (Policy Settings) | A 4.18 Policy | `PAGE-14-policy.md` | `PolicyHistoryDrawer` | `INT-14-01` | Parameter 7 kategori terkonfigurasi | `TC-POL-01` | Form Validation |
| **US-25** (Org Mapping) | A 4.15 Mapping | `PAGE-15-admin.md` | `OrgMappingTab` | `INT-15-01` | Penugasan atasan effective-dated | `TC-ADM-01` | Component Unit |

---

## 2. Rincian Skenario Kritis End-to-End (Critical E2E Test Scenarios)

### Skenario 1: Login & Aktivasi Akun
- **Test ID**: `E2E-SCN-01`
- **Prekondisi**: User terdaftar dengan kata sandi acak dan flag `mustResetPassword = true`.
- **Langkah Uji**:
  1. Akses `/login`, masukkan email dan sandi.
  2. Sistem berhasil mengotentikasi dan mendeteksi flag force-reset.
  3. Router guard secara otomatis mengalihkan ke `/reset-password`.
  4. User memasukkan sandi baru yang memenuhi Zod schema.
  5. Sesi diperbarui dan dialihkan ke `/today`.
- **Kriteria Verifikasi**: Tidak ada kebocoran akses ke dashboard sebelum sandi diperbarui.

### Skenario 2: Morning Commitment Check-in
- **Test ID**: `E2E-SCN-02`
- **Prekondisi**: Jam sistem 08:30 WIB (sebelum cut-off 09:30).
- **Langkah Uji**:
  1. Masuk ke `/today`.
  2. Input 2 komitmen dengan Initial Risk GREEN dan AMBER.
  3. Klik Simpan Komitmen.
- **Kriteria Verifikasi**: Record tersimpan dengan status `SubmissionTiming = ON_TIME` dan Daily Status dihitung sebagai `AMBER` (karena ada 1 AMBER dan 0 RED). Form beralih ke state terkunci.

### Skenario 3: Zero Commitment Submission
- **Test ID**: `E2E-SCN-03`
- **Prekondisi**: Karyawan sedang off-duty atau pelatihan penuh hari ini.
- **Langkah Uji**:
  1. Centang opsi "Saya tidak memiliki komitmen harian".
  2. Input alasan: "Mengikuti sertifikasi internal full-day".
  3. Submit form.
- **Kriteria Verifikasi**: Submission berhasil diterima sebagai **valid submission** (bukan No Submission) dengan status `NOT_APPLICABLE — NO_COMMITMENT`.

### Skenario 4: Copy-forward Verification
- **Test ID**: `E2E-SCN-04`
- **Prekondisi**: Hari kerja kemarin memiliki 1 komitmen dengan continuation = `Continue`.
- **Langkah Uji**:
  1. Buka form Morning Commitment hari ini.
  2. Verifikasi `DraftBanner` muncul menampilkan item carry-forward kemarin.
  3. Karyawan memilih untuk mengonfirmasi item tersebut masuk ke Slot 1.
- **Kriteria Verifikasi**: Item carry-forward terisi di slot 1 dan tidak terjadi auto-submit tanpa izin.

### Skenario 5: EOD Outcome & Status Suggestion Override
- **Test ID**: `E2E-SCN-05`
- **Prekondisi**: Jam 17:00 WIB, Morning komitmen telah tersubmit.
- **Langkah Uji**:
  1. Pilih Outcome = `Achieved` untuk seluruh tugas.
  2. Pilih Continuation = `Done`.
  3. Kirim hasil EOD.
- **Kriteria Verifikasi**: Daily Status akhir menjadi `GREEN`, daily record ditutup penuh. Jika ada ketidaksesuaian, dialog `ValidationPromptModal` muncul dengan bobot seimbang.

### Skenario 6: Blocker Lifecycle Complete Flow
- **Test ID**: `E2E-SCN-06`
- **Langkah Uji**:
  1. Karyawan A submit Blocker via `RaiseBlockerModal` (Severity High, Support Needed Org).
  2. Supervisor B melihat kendala di `/team` [Tab 2 Blocker Queue] dan klik Acknowledge.
  3. Supervisor B menandai Resolved dan mengisi Resolution Note wajib.
  4. Karyawan A membuka modal dan klik "Confirm Closed".
- **Kriteria Verifikasi**: Blocker berpindah state secara sah dari Open -> Acknowledged -> Resolved -> Closed.

### Skenario 7: Correction Request & Objection Window
- **Test ID**: `E2E-SCN-07`
- **Langkah Uji**:
  1. Karyawan mengajukan koreksi komitmen pasca cut-off via `CorrectionRequestModal`.
  2. Supervisor melihat antrean koreksi di `/team` [Tab 3] dengan chip countdown `48h remaining`.
  3. Jika Supervisor tidak menolak dalam 48 jam, koreksi berstatus auto-applied (Material) atau reviewer dapat menyetujui langsung.
- **Kriteria Verifikasi**: Countdown JetBrains Mono akurat dan transisi tercatat di audit log.

### Skenario 8: Cuti & Dispensasi Exemption
- **Test ID**: `E2E-SCN-08`
- **Langkah Uji**:
  1. Karyawan submit cuti 3 hari via `/today/leave-request`.
  2. HRGA menyetujui di `/compliance`.
  3. Pada tanggal cuti tersebut, sistem tidak mencatat No-Submission violation.
- **Kriteria Verifikasi**: Evaluator scheduler mengenali record pengecualian aktif.

### Skenario 9: Team & Department Pulse Monitoring
- **Test ID**: `E2E-SCN-09`
- **Langkah Uji**:
  1. Login sebagai Supervisor_TL -> akses `/team`.
  2. Verifikasi roster anggota tim menampilkan badge status GREEN/AMBER/RED dan timing.
  3. Klik "Beri Catatan Manajer" dan simpan coaching note privat.
- **Kriteria Verifikasi**: Catatan manajer tersimpan dan hanya dapat dilihat oleh level manajerial.

### Skenario 10: Reporting Hub & Blob Export
- **Test ID**: `E2E-SCN-10`
- **Langkah Uji**:
  1. Buka `/reports`, pilih tab Daily Exception.
  2. Terapkan filter tanggal 7 hari terakhir.
  3. Klik tombol "Ekspor CSV".
- **Kriteria Verifikasi**: File stream blob diunduh dengan header kolom yang sesuai spesifikasi.

### Skenario 11: Administrasi Sistem & Mapping
- **Test ID**: `E2E-SCN-11`
- **Langkah Uji**:
  1. Login sebagai SystemAdmin -> akses `/admin/users`.
  2. Tambah pendelegasian Temporary Reviewer dengan tanggal mulai dan tanggal selesai.
  3. Pengganti login dan memverifikasi akses tab review terbuka selama rentang tanggal tersebut.
- **Kriteria Verifikasi**: Pendelegasian aktif dan berakhir otomatis pasca tanggal kedaluwarsa.

---

## 3. Checklist Verifikasi Visual & Aksesibilitas

- [ ] Resolusi Desktop 1280×800: Bebas overflow horizontal, sidebar fixed 232px.
- [ ] Resolusi Tablet 768×1024: Sidebar collapsible, padding grid 16px.
- [ ] Resolusi Mobile 390×844: Single-column stacked cards, touch target >= 44px.
- [ ] Kontras warna teks memenuhi minimum 4.5:1 (WCAG AA).
- [ ] Seluruh kontrol interaktif dapat dioperasikan penuh via keyboard (Tab / Shift+Tab / Enter / Space / Esc).
- [ ] Tidak ada perubahan state diam-diam (*No silent state change*).
