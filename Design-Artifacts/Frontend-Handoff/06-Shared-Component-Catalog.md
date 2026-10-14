# 06 — Shared Component Catalog
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-06 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Teknologi Komponen** | Vue 3 Single File Components (SFC), TypeScript, Vuetify 3, MDI Icons |
| **Status Repositori** | Terverifikasi terhadap basis kode aktual di `frontend/src/components/` |

---

## 1. Ikhtisar & Arsitektur Komponen Reusable

Katalog ini mendokumentasikan seluruh komponen antarmuka yang dapat digunakan kembali (*reusable components*) di berbagai halaman aplikasi WorkPulse.
Komponen dirancang mengikuti filosofi:
1. **Pemisahan Semantik Tegas**: Kategori status tidak pernah dicampur (Daily Status vs Submission Timing vs Severity vs Workflow Status).
2. **Aksesibilitas Tinggi (WCAG 2.1 AA)**: Memiliki kontras warna minimum 4.5:1, dukungan navigasi keyboard, dan atribut ARIA.
3. **Pemberian Token Terpusat**: Seluruh styling mengacu pada token resmi di `frontend/src/styles/tokens.ts`.

---

## 2. Status Badges & Tag System (Tiga Sistem Independen)

Sesuai aturan ketat Design System v1.1, WorkPulse memiliki 3 bahasa status visual independen yang tidak boleh disatukan:

### 2.1 Daily Status Badge (`StatusBadge.vue`)
- **ID Komponen**: `CMP-SHR-01`
- **Lokasi Aktual**: `frontend/src/components/shared/StatusBadge.vue`
- **Tujuan**: Menjawab pertanyaan *"Seberapa berisiko pekerjaan yang dikomit?"*
- **Tampilan Visual**: Pill terisi (`filled pill`), dot solid melingkar, font JetBrains Mono 0.75rem.
- **Varian**:
  - `GREEN`: Background `rgba(34, 197, 94, 0.12)`, Border `rgba(34, 197, 94, 0.3)`, Text/Dot `#15803D`
  - `AMBER`: Background `rgba(245, 158, 11, 0.12)`, Border `rgba(245, 158, 11, 0.3)`, Text/Dot `#B45309`
  - `RED`: Background `rgba(220, 38, 38, 0.12)`, Border `rgba(220, 38, 38, 0.3)`, Text/Dot `#B91C1C`
- **Props**: `status: 'GREEN' | 'AMBER' | 'RED'`, `dense?: boolean`
- **Emits**: None (Display only)
- **Halaman Pengguna**: `MyTodayPage`, `MyHistoryPage`, `TeamPulsePage`, `FunctionPulsePage`, `ProjectRiskPage`
- **Status**: **AKTUAL (Tersedia)**

### 2.2 Submission Timing Badge (`SubmissionTimingBadge.vue`)
- **ID Komponen**: `CMP-SHR-02`
- **Lokasi Aktual**: `frontend/src/components/shared/SubmissionTimingBadge.vue`
- **Tujuan**: Menjawab pertanyaan *"Apakah komitmen diserahkan tepat waktu?"*
- **Tampilan Visual**: Pill bergaris luar tanpa isian (`outlined pill`), icon MDI, font JetBrains Mono 0.75rem.
- **Varian**:
  - `On-Time`: Border & Text `#0369A1`, Icon `mdi-check-circle-outline`
  - `Late`: Border & Text `#C2410C`, Icon `mdi-clock-outline`
  - `No Submission`: Border & Text `#475569` (Slate netral, fakta obyektif bukan hukuman), Icon `mdi-minus-circle-outline`
- **Props**: `timing: 'ON_TIME' | 'LATE' | 'NO_SUBMISSION'`, `submittedAt?: string`
- **Emits**: None (Display only)
- **Halaman Pengguna**: `MyTodayPage`, `MyHistoryPage`, `TeamPulsePage`, `CompliancePage`
- **Status**: **AKTUAL (Tersedia)**

### 2.3 Blocker Severity & Lifecycle Tags
- **ID Komponen**: `CMP-SHR-03`
- **Lokasi Aktual**: `frontend/src/components/shared/ClassificationTag.vue` & `AuthorityTag.vue`
- **Tujuan**: Menandai tingkat keparahan kendala (Low/Medium/High/Critical) dan jenis otoritas bantuan (Org/Project).
- **Varian Severity**:
  - `Low`: Text `#475569`, Background `rgba(100, 116, 139, 0.1)`
  - `Medium`: Text `#A16207`, Background `rgba(202, 138, 4, 0.12)`
  - `High`: Text `#C2410C`, Background `rgba(194, 65, 12, 0.12)`
  - `Critical`: Text `#B91C1C`, Background `rgba(220, 38, 38, 0.12)`
- **Varian Authority**:
  - `Org`: Text `#00674D`, Background `rgba(0, 103, 77, 0.1)` (Struktural Organisasi)
  - `Project`: Text `#0369A1`, Background `rgba(3, 105, 161, 0.1)` (Otoritas Proyek)

---

## 3. Kartu dan Panel Data (Cards & Panels)

### 3.1 CommitmentCard (`CommitmentCard.vue`)
- **ID Komponen**: `CMP-SHR-04`
- **Lokasi Aktual**: `frontend/src/components/shared/CommitmentCard.vue`
- **Tujuan**: Menampilkan item komitmen harian atau pekerjaan tambahan, teks deskripsi, kode referensi proyek, initial risk selector, dan kontrol evaluasi akhir hari (outcome & continuation).
- **Props**:
  - `item: CommitmentItem` (id, description, taskReference, initialRisk, outcome, continuation)
  - `readOnly?: boolean`
  - `isAdditional?: boolean`
- **Emits**: `update:outcome`, `update:continuation`
- **Perilaku Khusus**:
  - Menampilkan tag kecil `AdditionalWorkTag` jika item merupakan tugas ad-hoc.
  - Outcome dan Continuation menggunakan dua kontrol segmented berdampingan, bukan dropdown gabungan.
- **Halaman Pengguna**: `MyTodayPage.vue`, `MyHistoryPage.vue`
- **Status**: **AKTUAL (Tersedia)**

### 3.2 BlockerCard (`BlockerCard.vue`)
- **ID Komponen**: `CMP-SHR-05`
- **Lokasi Aktual**: `frontend/src/components/shared/BlockerCard.vue`
- **Tujuan**: Menampilkan ringkasan kendala kerja, deskripsi, pelapor, severity badge, authority tag, dan status siklus hidup.
- **Props**: `blocker: Blocker`, `compact?: boolean`
- **Emits**: `click`, `action`
- **Halaman Pengguna**: `MyTodayPage.vue`, `TeamPulsePage.vue`, `FunctionPulsePage.vue`
- **Status**: **AKTUAL (Tersedia)**

### 3.3 ActionPanel (`ActionPanel.vue`)
- **ID Komponen**: `CMP-SHR-06`
- **Lokasi Aktual**: `frontend/src/components/shared/ActionPanel.vue`
- **Tujuan**: Panel aksi kontekstual yang merender HANYA tombol yang sah untuk state siklus hidup saat ini (hide, never just disable).
- **Props**: `actions: ActionItem[]`, `loading?: boolean`
- **Emits**: `action-click`
- **Status**: **AKTUAL (Tersedia)**

---

## 4. Modal Dialogs & Surfaces

### 4.1 AdditionalWorkModal (`AdditionalWorkModal.vue`)
- **ID Komponen**: `CMP-MDL-01`
- **Lokasi Aktual**: `frontend/src/components/self-service/AdditionalWorkModal.vue`
- **Tujuan**: Form dialog penambahan tugas tambahan di tengah hari kerja.
- **Fields**: Deskripsi pekerjaan tambahan (wajib), task reference (opsional), initial risk (GREEN/AMBER/RED).
- **Status**: **AKTUAL (Tersedia)**

### 4.2 RaiseBlockerModal (`RaiseBlockerModal.vue`)
- **ID Komponen**: `CMP-MDL-02`
- **Lokasi Aktual**: `frontend/src/components/self-service/RaiseBlockerModal.vue`
- **Tujuan**: Form pelaporan kendala seketika (Deskripsi, Severity: Low/Med/High/Critical, Support Needed: Org/Project).
- **Status**: **AKTUAL (Tersedia)**

### 4.3 CorrectionRequestModal (`CorrectionRequestModal.vue`)
- **ID Komponen**: `CMP-MDL-03`
- **Lokasi Aktual**: `frontend/src/components/self-service/CorrectionRequestModal.vue`
- **Tujuan**: Form pengajuan koreksi komitmen pasca cut-off dengan klasifikasi Minor vs Material dan alasan wajib.
- **Status**: **AKTUAL (Tersedia)**

### 4.4 ValidationPromptModal (`ValidationPromptModal.vue`)
- **ID Komponen**: `CMP-MDL-04`
- **Lokasi Aktual**: `frontend/src/components/self-service/ValidationPromptModal.vue`
- **Tujuan**: Dialog konfirmasi Status Suggestion Engine. Memiliki bobot visual tombol seimbang: "Pertahankan Pilihan Saya (dengan alasan)" dan "Gunakan Rekomendasi Sistem".
- **Status**: **AKTUAL (Tersedia)**

### 4.5 BlockerActionModal (`BlockerActionModal.vue`)
- **ID Komponen**: `CMP-MDL-05`
- **Lokasi Aktual**: `frontend/src/components/management/BlockerActionModal.vue`
- **Tujuan**: Dialog penanganan siklus kendala: Acknowledge, Update progress, Resolve dengan resolution note, Close oleh reporter, atau Accept Risk oleh otoritas berwenang.
- **Status**: **AKTUAL (Tersedia)**

### 4.6 ManagerNoteModal (`ManagerNoteModal.vue`)
- **ID Komponen**: `CMP-MDL-06`
- **Lokasi Aktual**: `frontend/src/components/management/ManagerNoteModal.vue`
- **Tujuan**: Dialog pencatatan umpan balik manajerial privat terhadap bawahan.
- **Status**: **AKTUAL (Tersedia)**

### 4.7 CreateExemptionModal (`CreateExemptionModal.vue`)
- **ID Komponen**: `CMP-MDL-07`
- **Lokasi Aktual**: `frontend/src/components/management/CreateExemptionModal.vue`
- **Tujuan**: Dialog penetapan hari libur resmi atau dispensasi no-submission individual oleh HRGA.
- **Status**: **AKTUAL (Tersedia)**

---

## 5. Komponen Utilitas, Filter, & Navigasi

| ID Komponen | Nama Komponen | Props | Emits | Status | Keterangan |
|---|---|---|---|---|---|
| **CMP-UTL-01** | `FilterBar.vue` | `modelValue, config` | `update:modelValue, reset` | AKTUAL | Bilah filter terpadu dengan input pencarian, dropdown status, dan date range. |
| **CMP-UTL-02** | `ExportButton.vue` | `reportType, params` | `export-start, export-complete` | AKTUAL | Tombol unduh laporan CSV/Excel dengan spinner mutasi. |
| **CMP-UTL-03** | `NotificationBell.vue` | `count: number` | `click` | AKTUAL | Lonceng notifikasi navbar dengan badge hitungan unread. |
| **CMP-UTL-04** | `ObjectionWindowIndicator.vue` | `expiresAt: string` | `expired` | AKTUAL | Chip hitung mundur masa sanggahan 48 jam (JetBrains Mono). |
| **CMP-UTL-05** | `PolicyVersionHistory.vue` | `category: string` | `close` | AKTUAL | Drawer riwayat versi perubahan parameter kebijakan. |

---

## 6. Kesimpulan Katalog Komponen

Seluruh 18 komponen reusable terdaftar di atas telah memiliki implementasi fisik di folder `frontend/src/components/` dan mematuhi aturan desain independen WorkPulse.
