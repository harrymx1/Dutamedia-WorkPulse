# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 06: MY HISTORY & WEEKLY SUMMARY

- **Berkas Prototipe:** [`06-My-History-Weekly-Summary.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/06-My-History-Weekly-Summary.html)
- **Rute Sistem:** `/history`, `/history/{recordId}`
- **Posisi Alur:** Pusat Transparansi & Refleksi Akuntabilitas Kinerja Pribadi (*Personal Accountability Archive & Weekly Self-Reflection Hub*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Hak Akses Audit Pribadi Penuh (*Self-Service Audit Log* — PRD US-06 & FR-36):** Karyawan berhak mengakses, memeriksa, dan menelusuri seluruh riwayat komitmen kerja, tugas tambahan, evaluasi sore (EOD), catatan kendala, dan masukan atasan miliknya sendiri tanpa perantara administratif.
2. **Mandat Anti-Gamifikasi Mutlak (PRD FR-66, AC-44, AC-75):** Sistem dilarang keras menyajikan mekanisme gamifikasi kompetitif seperti penghitung streak hari berturut-turut (*streak counter*), skor peringkat (*leaderboard*), perbandingan dengan rekan kerja (*peer comparison*), atau lencana produktivitas semu. Fokus halaman murni pada keandalan kerja (*reliability*), kedisiplinan waktu, dan refleksi pencapaian pribadi yang sehat.
3. **Integritas Arsip Resmi Baca-Saja (*Official Read-Only Archive*):** Seluruh data pada halaman ini berstatus arsip permanen yang tidak dapat disunting langsung di tempat (*no in-place mutation*). Jika terdapat kesalahan data di masa lalu, koreksi hanya dapat diajukan melalui mekanisme formal *Correction Request* yang tercatat secara transparan di jejak audit (*audit trail*).
4. **Alat Bukti Kinerja Mandiri (*Exportable Performance Evidence* — AC-06 & DEF-05):** Menyediakan fitur ekspor data terstruktur (format CSV berstandar RFC-4180 dengan UTF-8 BOM) untuk kebutuhan laporan kerja berkala, klaim lembur/tugas, atau lampiran penilaian kinerja resmi.

### 1.2 Batasan Desain Baku
- **Arsitektur Dual-View State:** Navigasi instan antara Tampilan Ringkasan Mingguan (*Weekly Summary Overview*) dan Tampilan Detail Hari Kerja (*Day Detail View*) tanpa reload halaman.
- **Nol Emoticon & Ikon Monokrom:** Seluruh visual menggunakan tipografi korporat dan inline SVG monokrom (`stroke-width="1.8-2.2"`).
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada status RED dan badge keterlambatan.
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis kaku.

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR:                                                                     │
│ Breadcrumb Dinamis: Workspace / My History (atau / Tanggal Hari Pilihan)     │
│ [Lonceng Notifikasi + Dot]  [Avatar Profil Pengguna (BP)]                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ =========================================================================== │
│ TAMPILAN 1: RINGKASAN MINGGUAN & DAFTAR HARI (HISTORY OVERVIEW)             │
│ =========================================================================== │
│ 1. BAGIAN 1: HEADER & TOOLBAR FILTER GLOBAL PERIODE                         │
│    - Eyebrow: CATATAN PRIBADI                                               │
│    - Judul: My History & Weekly Summary                                     │
│    - Tombol Aksi Kanan: [ ⬇ Export Histori ] (Unduh CSV Periode Aktif)      │
│    - Toolbar Filter Global:                                                 │
│      • Filter Periode: [ Minggu Sebelumnya · 5–9 Okt ▼ ] (Preset Dropdown)  │
│      • Keterangan Tanggal: Senin, 5 Oktober – Jumat, 9 Oktober 2026         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. BAGIAN 2: NAVIGASI TAB UTAMA (KONSISTEN DENGAN HALAMAN 07)               │
│    ┌───────────────────────────────────┬──────────────────────────────────┐ │
│    │ [📅 Riwayat Harian  (5)] (ACTIVE) │ [📊 Ringkasan Mingguan (1 Catatan│ │
│    └───────────────────────────────────┴──────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. TAB PANEL 1: DAFTAR RIWAYAT HARI PER HARI (DAILY HISTORY LIST)           │
│    - Panel Header:                                                          │
│      • Sisi Kiri : Kicker "Rincian per Hari", Counter [ 5 hari ], Judul,    │
│                    dan Keterangan resmi baca-saja (*read-only*).            │
│      • Sisi Kanan: Sub-Filter Kehadiran [ Semua Hari Kerja ▼ ]              │
│                    (Opsi: Semua Hari Kerja / Ada Submission / Tanpa Sub)    │
│    - Baris Harian (Senin s/d Jumat):                                        │
│      • Sisi Kiri : Tanggal Lengkap & Sublabel "Riwayat Harian Resmi"        │
│      • Sisi Tengah: Rangkuman Tugas & Mandat Dual Badges Berdampingan:      │
│                     [ On-Time / Late / No Sub ] [ Final Status · GREEN/.. ] │
│                     Metadata: Jam Morning · Jam EOD · Jumlah Komitmen/Tugas │
│      • Sisi Kanan: [ Tombol: Lihat Detail → ]                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TAB PANEL 2: KARTU RINGKASAN ANGKA MINGGUAN (WEEKLY SUMMARY GRID)        │
│    [Baris 1: Kartu Utama Lebar Penuh (Top Hero Card grid-column: 1 / -1)]   │
│    ┌──────────────────────────────────────────────────────────────────────┐ │
│    │ 1. Catatan Evaluasi Kerja (Manager Notes)                            │ │
│    │    [Ikon Lencana] [Pill: Apresiasi (Recognition)] · Budi Santoso     │ │
│    │    "Terima kasih sudah mengantisipasi kebutuhan checkout..."         │ │
│    │    Jumat, 9 Oktober 2026 · Terverifikasi Sistem                      │ │
│    │    (Atau: Empty state netral jika belum ada catatan pada periode tsb)│ │
│    └──────────────────────────────────────────────────────────────────────┘ │
│    [Baris 2: 3 Kolom Metrik Utama]                                          │
│    ┌──────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐ │
│    │ 2. Komitmen Pagi     │ │ 3. Distribusi Hasil  │ │ 4. Evaluasi Harian │ │
│    │    7 Komitmen        │ │    7 Selesai (Hijau) │ │    2 GREEN (Hijau) │ │
│    │    (Morning Baseline)│ │    2 Sebagian (Amber)│ │    1 AMBER (Amber) │ │
│    │                      │ │    0 Belum (Merah)   │ │    1 RED (Merah)   │ │
│    └──────────────────────┘ └──────────────────────┘ └────────────────────┘ │
│    [Baris 3: 3 Kolom Metrik Kepatuhan & Pola Kerja]                         │
│    ┌──────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐ │
│    │ 5. Kepatuhan Waktu   │ │ 6. Pola Pekerjaan    │ │ 7. Dukungan &      │ │
│    │    3 Tepat Waktu(Biru│ │    Berlanjut         │ │    Eskalasi        │ │
│    │    1 Terlambat(Amber)│ │    2 Hari Berurutan  │ │    1 Dukungan Diber│ │
│    │    1 Tanpa Laporan   │ │    Chips: Continue(3)│ │    1 Eskalasi Buka │ │
│    └──────────────────────┘ └──────────────────────┘ └────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ =========================================================================== │
│ TAMPILAN 2: RINCIAN HARI KERJA (DAY DETAIL VIEW / DRILL-DOWN)               │
│ =========================================================================== │
│ 4. HEADER DETAIL HARI:                                                      │
│    - Tombol Kembali Atas: [ ← Kembali ke Histori ]                          │
│    - Judul Tanggal: Senin, 5 Oktober 2026                                   │
│    - Status Badges: [ On-Time ] [ Final Status · GREEN ] [ Initial Status ] │
│    - Tombol Aksi Kanan: [ ⬇ Export Hari Ini ] (Unduh CSV 1 Hari Penuh)      │
│ 5. BANNER AUDIT NO SUBMISSION (Kondisional: Hanya jika No Submission)       │
│ 6. PANEL 1: MORNING COMMITMENT (Target Awal Pagi Hari & Status)             │
│ 7. PANEL 2: EOD OUTCOME & CONTINUATION (Semantic Badges Outcome/Continue)   │
│ 8. PANEL 3: KENDALA & DUKUNGAN (Blocker & Eskalasi Terkait)                 │
│ 9. PANEL 4: PERMOHONAN KOREKSI (Kondisional: Koreksi Berstatus Applied)     │
│ 10. PANEL 5: CATATAN EVALUASI KERJA (Kondisional: Apresiasi/Bimbingan/Korektif)│
│ 11. FOOTER DETAIL HARI: Tombol Kembali Bawah: [ ← Kembali ke Histori ]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.0 Arsitektur Tab Navigasi Utama (Riwayat Harian vs Ringkasan Mingguan)
Guna meningkatkan kenyamanan membaca (*ergonomics*) dan mencegah kejenuhan menggulir (*scrolling fatigue*) di layar kecil/mobile, antarmuka gambaran histori dipecah menjadi 2 tab navigasi baku yang konsisten dengan standar Halaman 07:
1. **Tab 1: Riwayat Harian (`#panelDailyHistory` — Default Active):**
   - Menampilkan daftar catatan kerja per hari (Senin s/d Jumat) secara langsung di layar pertama (*above the fold*).
   - Dilengkapi badge hitungan hari (`#tabDaysBadge`) dan sub-filter kehadiran (`#recordFilter`: *Semua Hari Kerja*, *Ada Submission*, *Tanpa Submission*) di sisi kanan header panel harian.
2. **Tab 2: Ringkasan Mingguan (`#panelWeeklySummary`):**
   - Menampilkan kartu utama *Catatan Evaluasi Kerja (Manager Notes)* di baris teratas (*Top Hero Card*), disusul 6 kartu ringkasan metrik kinerja mingguan di bawahnya sebagai data pendukung.
   - **Fitur Pengingat Otomatis (*Smart Reminder Badge*):** Jika pada periode yang aktif terdapat Catatan Evaluasi Kerja resmi dari atasan, tombol Tab 2 otomatis memunculkan badge amber pengingat: `[1 Catatan]`. Jika tidak ada catatan, badge disembunyikan secara otomatis.
3. **Preservasi Status Tab:**
   - Ketika pengguna masuk ke rincian hari melalui tombol *Lihat Detail →* dan kemudian menekan tombol *Kembali ke Histori*, sistem secara otomatis memulihkan tampilan ke Tab 1 (Riwayat Harian).

### 3.1 Aturan Mandat Dual Badges Berdampingan (PRD FR-67 & UI/UX Spec §4.6)
Setiap baris hari pada Daftar Riwayat Harian **wajib menyajikan sepasang badge (*Dual Badges*) berdampingan**:
1. **Submission Timing Badge:**
   - **`On-Time`** (`.pill.timing` / Biru): Laporan pagi & sore diserahkan tepat waktu sesuai jendela reguler.
   - **`Late`** (`.pill.late` / Amber): Diserahkan melewati batas toleransi reguler.
   - **`No Submission`** (`.pill.no-submission` / Abu netral): Karyawan tidak mengisi laporan pada hari tersebut.
2. **Final Status Badge:**
   - **`Final Status · GREEN`** (`.pill.green` / Hijau): Target komitmen tercapai dengan baik.
   - **`Final Status · AMBER`** (`.pill.amber` / Amber): Capaian sebagian atau terdapat carry-over.
   - **`Final Status · RED`** (`.pill.red` / Merah): Target tidak tercapai atau terhambat blocker fatal.
   - **`Final Status belum tersedia`** (`.pill.neutral` / Abu netral): Ditampilkan jika timing bernilai *No Submission*.

### 3.2 Standar Semantic Badges Outcome & Continuation
Pada kartu tugas di tampilan detail sore hari, status capaian wajib menerapkan diferensiasi warna semantik:
- **`Outcome · Completed`** $\rightarrow$ `.pill.green` (Hijau botol)
- **`Outcome · Partially Completed`** $\rightarrow$ `.pill.amber` (Amber)
- **`Outcome · Not Completed`** $\rightarrow$ `.pill.red` (Merah marun)
- **`Outcome · Cancelled`** $\rightarrow$ `.pill.neutral` (Abu netral)
- **`Continuation · Continue`** $\rightarrow$ `.pill.timing` (Biru WorkPulse)
- **`Continuation · Do Not Continue`** $\rightarrow$ `.pill.neutral` (Abu netral)

### 3.3 Standar 3 Jenis Catatan Evaluasi Kerja (Manager Notes — PRD FR-39, US-13, AC-43)
Sistem mendukung 3 jenis catatan manajerial resmi dengan identitas visual terstandarisasi:
1. **`Apresiasi (Recognition)`**:
   - Badge: `.pill.green` berlabel `Apresiasi (Recognition)`.
   - Ikon Mark: Bintang lencana (`polygon points="12 2..."`).
   - Warna Latar Mark: Hijau lembut (`#E8F5E9`) dengan border `#A7D5B8`.
2. **`Bimbingan (Coaching)`**:
   - Badge: `.pill.amber` berlabel `Bimbingan (Coaching)`.
   - Ikon Mark: Kompas pengarah (`circle & polygon`).
   - Warna Latar Mark: Amber lembut (`#FEF3C7`) dengan border `#E8C77A`.
3. **`Tindakan Korektif (Corrective)`**:
   - Badge: `.pill.red` berlabel `Tindakan Korektif (Corrective)`.
   - Ikon Mark: Perisai / tanda seru penegasan (`alert-circle`).
   - Warna Latar Mark: Merah lembut (`#FEE2E2`) dengan border `#E8B1AC`.

### 3.4 Standar Ekspor Berkas CSV Resmi (AC-06 & DEF-05)
1. **Format Berkas:** Comma-Separated Values (`.csv`) berstandar RFC-4180.
2. **Encoding:** Wajib menyertakan **UTF-8 Byte Order Mark (`\ufeff`)** agar karakter khusus terbaca sempurna di Microsoft Excel, Google Sheets, dan LibreOffice tanpa distorsi karakter.
3. **Kolom Baku Ekspor:**
   - `Tanggal`, `Submission Timing`, `Initial Status`, `Final Status`, `Morning Commitments`, `Additional Work`, `Correction Request`.
4. **Umpan Balik:** Menampilkan notifikasi toast hijau di kanan bawah pasca pengunduhan berkas.

### 3.5 Sinkronisasi Navigasi Breadcrumb Dinamis
1. **Kondisi Ringkasan Mingguan:** `Workspace` $\rightarrow$ `My History` (statis tebal).
2. **Kondisi Detail Hari Kerja:** `Workspace` $\rightarrow$ `My History` (tautan bergaris bawah interaktif) $\rightarrow$ `[Tanggal Hari Pilihan]` (statis tebal). Mengklik teks *My History* pada breadcrumb langsung mengembalikan layar ke overview mingguan.

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Filter: Minggu Sebelumnya | Pilih opsi "Minggu Sebelumnya · 5–9 Okt" | Kartu ringkasan terisi metrik lengkap, Card 7 menampilkan Apresiasi dari Budi Santoso, daftar hari menampilkan 5 hari kerja (5–9 Okt). |
| **TC-02** | Filter: Minggu Ini (Empty) | Pilih opsi "Minggu Ini · 12–16 Okt" | Angka metrik menampilkan strip netral ("—"), Card 7 menampilkan pesan netral belum ada catatan evaluasi kerja dari atasan, daftar hari empty state. |
| **TC-03** | Filter Kehadiran: Ada Submission | Pilih "Ada Submission" pada filter kehadiran | Daftar harian menyaring instan dan hanya menampilkan Senin–Kamis (4 hari). Hari Jumat (No Submission) disembunyikan. Counter badge = "4 hari". |
| **TC-04** | Filter Kehadiran: No Submission | Pilih "Tanpa Submission" pada filter kehadiran | Daftar harian hanya menampilkan 1 hari (Jumat, 9 Okt). Counter badge = "1 hari". |
| **TC-05** | Buka Detail Hari: Senin | Klik [Lihat Detail →] pada baris Senin, 5 Okt | Layar beralih ke Detail Hari Senin. Breadcrumb memuat tanggal. Badges memuat `On-Time` & `GREEN`. Panel Morning & EOD tampil dengan Semantic Badges. |
| **TC-06** | Detail Hari: Koreksi Applied | Klik [Lihat Detail →] pada baris Selasa, 6 Okt | Menampilkan badge `AMBER`. Panel Permohonan Koreksi tampil otomatis dengan tiket `EOD-2026-1006-01` (`Applied`). Panel Catatan Evaluasi Kerja menampilkan `Bimbingan`. |
| **TC-07** | Detail Hari: No Submission | Klik [Lihat Detail →] pada baris Jumat, 9 Okt | Banner Audit Sistem biru/abu-abu muncul di atas detail hari. Panel Morning & EOD menampilkan status Tidak Ada Submission. Card Catatan Evaluasi Kerja tetap tampil. |
| **TC-08** | Tombol Kembali Ganda | Klik [← Kembali ke Histori] di atas atau di bawah | Layar detail disembunyikan, overview mingguan dipulihkan, breadcrumb kembali, posisi layar scroll halus ke paling atas. |
| **TC-09** | Navigasi Breadcrumb | Klik teks `My History` pada breadcrumb | Mengeksekusi fungsi pemulihan yang sama dengan tombol kembali, mengembalikan pengguna ke overview mingguan. |
| **TC-10** | Ekspor Berkas CSV | Klik [Export Histori] atau [Export Hari Ini] | Peramban mengunduh berkas `.csv` UTF-8 BOM sesuai periode/tanggal. Toast notifikasi hijau muncul mengonfirmasi baris yang diekspor. |
| **TC-11** | Navigasi Tab Utama | Klik tab [Ringkasan Mingguan] lalu klik [Riwayat Harian] | Tampilan beralih mulus antara 6 kartu metrik + kartu evaluasi pimpinan dan daftar hari kerja tanpa reload halaman. Tab aktif ditandai background putih & bayangan elevasi. |
| **TC-12** | Sinkronisasi Smart Badge Catatan | Ganti periode ke "Minggu Sebelumnya" $\leftrightarrow$ "Minggu Ini" | Pada Minggu Sebelumnya, badge amber `1 Catatan` muncul di tab Ringkasan Mingguan. Pada Minggu Ini (belum ada catatan), badge amber disembunyikan otomatis. |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Membaca sesi aktif dari `localStorage: workpulse_active_user` untuk mengunci tampilan pada riwayat personal pelapor. |
| **Halaman 02 (Morning Commitment)** | Menjadi sumber data untuk panel *Morning Commitment* (fakta awal target kerja terukur). |
| **Halaman 03 (Additional Work)** | Menjadi sumber data untuk sub-bagian *Pekerjaan Tambahan* yang muncul di luar komitmen pagi. |
| **Halaman 04 (EOD Outcome)** | Menjadi sumber data untuk *Final Status*, jam penyerahan sore, evaluasi capaian (*Outcome*), kelanjutan kerja (*Continuation*), dan justifikasi risiko harian. |
| **Halaman 05 (Raise Blocker)** | Menjadi sumber data riwayat kendala (*blockers*) yang dilaporkan atau ditindaklanjuti pada hari bersangkutan. |
| **Halaman 07 (Notifications)** | Aksi publikasi catatan manajer (*Manager Note*) atau persetujuan koreksi menghasilkan notifikasi yang terhubung ke arsip Halaman 06. |
| **Halaman 10 (Manager Notes)** | Catatan evaluasi kerja (Manager Notes) berstatus `visible: true` yang dibuat oleh manajer pada Halaman 10 otomatis mengalir ke Card 7 ringkasan mingguan dan Panel 5 detail harian. |
| **Halaman 16a & 16b (Correction Requests)** | Permohonan koreksi pagi atau sore yang berstatus `Applied` ditampilkan secara berdampingan di Panel 4 untuk menjaga integritas jejak audit tanpa menimpa data asli. |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 Endpoint Ringkasan Mingguan (*Weekly Summary Endpoint*)
- **Rute:** `GET /api/v1/daily-records/history/summary`
- **Query Parameters:** `period=last-week|this-week|this-month|custom`, `startDate`, `endDate`, `filter=all|submitted|no-submission`
- **Struktur Respons JSON (DTO):**
```typescript
interface WeeklySummaryResponseDto {
  periodCaption: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string;   // ISO Date YYYY-MM-DD
  metrics: {
    totalCommitments: number | null;
    completedCount: number | null;
    partiallyCompletedCount: number | null;
    notCompletedCount: number | null;
    greenDaysCount: number | null;
    amberDaysCount: number | null;
    redDaysCount: number | null;
    onTimeDaysCount: number | null;
    lateDaysCount: number | null;
    noSubmissionDaysCount: number | null;
    recurringContinuationDaysCount: number | null;
    continueTasksCount: number | null;
    stopTasksCount: number | null;
    supportGivenCount: number | null;
    openEscalationsCount: number | null;
  };
  managerNote: {
    type: 'Recognition' | 'Coaching' | 'Corrective';
    authorName: string;
    authorRole: string;
    noteContent: string;
    publishedDate: string; // ISO DateTime
    isSystemVerified: boolean;
  } | null;
  dailyRecords: Array<{
    recordId: string;
    date: string; // ISO Date YYYY-MM-DD
    formattedDate: string;
    weekdayName: string;
    submissionTiming: 'On-Time' | 'Late' | 'No Submission';
    finalStatus: 'GREEN' | 'AMBER' | 'RED' | null;
    initialStatus: 'GREEN' | 'AMBER' | 'RED' | null;
    morningSubmittedAt: string | null;
    eodSubmittedAt: string | null;
    commitmentsCount: number;
    additionalWorkCount: number;
  }>;
}
```

### 6.2 Endpoint Rincian Hari Tunggal (*Day Detail Drill-Down Endpoint*)
- **Rute:** `GET /api/v1/daily-records/{recordId}/detail`
- **Struktur Respons JSON (DTO):**
```typescript
interface DailyRecordDetailResponseDto {
  recordId: string;
  date: string; // ISO Date YYYY-MM-DD
  formattedDate: string;
  weekdayName: string;
  submissionTiming: 'On-Time' | 'Late' | 'No Submission';
  initialStatus: 'GREEN' | 'AMBER' | 'RED' | null;
  finalStatus: 'GREEN' | 'AMBER' | 'RED' | null;
  isNoSubmission: boolean;
  morningCommitment: {
    submittedAt: string | null;
    stateLabel: 'Tercatat' | 'Tidak Ada Submission' | 'Zero Commitment';
    items: Array<{
      orderIndex: number;
      title: string;
      technicalDescription: string;
    }>;
  };
  additionalWork: Array<{
    orderIndex: number;
    title: string;
    reasonCategory: 'Newly Assigned' | 'Missed in Planning' | 'Priority Change' | 'Operational-Incident' | 'Other';
    assignedBy: string | null;
    outcome: 'Completed' | 'Partially Completed' | 'Not Completed' | 'Cancelled';
    continuation: 'Continue' | 'Do Not Continue';
  }>;
  eodEvaluation: {
    submittedAt: string | null;
    riskSummaryText: string | null;
    items: Array<{
      title: string;
      isAdditional: boolean;
      outcome: 'Completed' | 'Partially Completed' | 'Not Completed' | 'Cancelled';
      continuation: 'Continue' | 'Do Not Continue';
      continuationReason: string | null;
      evidenceUrl: string | null;
    }>;
  } | null;
  blockersAndSupport: {
    blockerNotes: string;
    activeBlockerTickets: Array<{
      ticketId: string;
      title: string;
      severity: 'Critical' | 'High' | 'Medium' | 'Low';
      status: 'Open' | 'Acknowledged' | 'In Progress' | 'Resolved';
    }>;
  };
  appliedCorrections: Array<{
    correctionId: string;
    correctionType: 'Morning' | 'EOD';
    status: 'Applied';
    justification: string;
    appliedAt: string; // ISO DateTime
    reviewerName: string;
  }>;
  publishedNotes: Array<{
    noteId: string;
    type: 'Recognition' | 'Coaching' | 'Corrective';
    authorName: string;
    authorRole: string;
    noteContent: string;
    publishedAt: string; // ISO DateTime
    isSystemVerified: boolean;
  }>;
}
```

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul My History & Weekly Summary. Seluruh komponen pada prototipe [`06-My-History-Weekly-Summary.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/06-My-History-Weekly-Summary.html) telah teruji secara visual dan fungsional di peramban, bebas error, dan siap diimplementasikan ke dalam kode frontend dan backend.
