# PAGE-03 — My Today Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-03` |
| **Page Slug** | `my-today` |
| **Page Name** | My Today Page |
| **Window Title** | `My Today — WorkPulse` |
| **Router Path** | `/today` |
| **Route Name** | `MyToday` |
| **Primary Actors** | Seluruh Karyawan (Self-Service Core) |
| **Role / Permission Scope** | `All Authenticated Users` |
| **Business Spec Unit** | A 4.2 Morning Commitment, A 4.3 Add Additional Work, A 4.4 EOD Outcome, A 4.5 Raise Blocker, A 4.16 Correction Request |
| **Legacy Source Files** | `02-morning-commitment.html, 03-additional-work.html, 04-eod.html, 08-raise-blocker.html, 11-correction-request.html` |
| **Dokumen Referensi** | PDD v1.1 G1-G4, PRD v1.1 US-01 s.d US-04, UI/UX Spec v1.2 A 4.2-4.5, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Pusat akuntabilitas mandiri harian karyawan: pengisian komitmen pagi (1-3 komitmen atau zero komitmen beralasan), pencatatan pekerjaan ad-hoc, pengisian hasil evaluasi akhir hari (EOD outcome & continuation), penanganan copy-forward, raise instant blocker, dan pengajuan koreksi.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Top Page Header: Tanggal hari ini, Countdown batas cut-off (09:30 pagi / 18:00 sore), Status badge harian (GREEN/AMBER/RED) & Submission timing badge.
- LockedIndicator Banner (Jika waktu > cutoff atau submission sudah terkunci).
- DraftBanner (Jika terdapat komitmen carry-forward dari hari kerja sebelumnya).
- Section 1: Morning Commitment Form (Slot 1 s.d 3)
  - Tiap slot: Text komitmen, Project Reference Code (opsional), Initial Risk (GREEN / AMBER / RED segmented selector).
  - Opsi Zero Commitment ("Tidak ada komitmen harian") dengan textarea alasan wajib.
  - Tombol Submit Morning Commitment.
- Section 2: Mid-day & Additional Work Actions
  - Tombol "Tambah Pekerjaan Ad-hoc" -> membuka AdditionalWorkModal.
  - Tombol "Laporkan Kendala Seketika" -> membuka RaiseBlockerModal.
- Section 3: EOD Outcome Form (Aktif sore hari)
  - Tiap item komitmen & additional work: Outcome selector (Achieved, Partial, Not Achieved), Continuation selector (Done, Continue esok hari).
  - Today Blocker summary linkage.
  - Tomorrow Priorities (catatan kontekstual terpisah, maks 3 item).
  - Tombol Submit EOD Outcome.
- Modals Tersemat:
  - AdditionalWorkModal
  - RaiseBlockerModal
  - CorrectionRequestModal
  - ValidationPromptModal (Status suggestion override prompt)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-03-01** | `LockedIndicator` | Banner strip netral penanda form terkunci sejak cut-off. | `cutoffTime, isLocked` | `request-correction` | Tersedia | `frontend/src/components/shared/` |
| **CMP-03-02** | `CommitmentCard` | Komponen kartu komitmen harian dengan kontrol outcome dan continuation. | `item, readOnly, isAdditional` | `update:outcome, update:continuation` | Tersedia | `frontend/src/components/shared/CommitmentCard.vue` |
| **CMP-03-03** | `AdditionalWorkModal` | Dialog formulir penambahan tugas ad-hoc. | `modelValue` | `update:modelValue, submitted` | Tersedia | `frontend/src/components/self-service/AdditionalWorkModal.vue` |
| **CMP-03-04** | `RaiseBlockerModal` | Dialog pelaporan kendala seketika lintas otoritas. | `modelValue` | `update:modelValue, submitted` | Tersedia | `frontend/src/components/self-service/RaiseBlockerModal.vue` |
| **CMP-03-05** | `CorrectionRequestModal` | Dialog pengajuan koreksi setelah waktu cut-off. | `modelValue, recordId` | `update:modelValue, submitted` | Tersedia | `frontend/src/components/self-service/CorrectionRequestModal.vue` |
| **CMP-03-06** | `ValidationPromptModal` | Dialog konfirmasi Status Suggestion Engine jika pilihan user berbeda dari heuristik sistem. | `modelValue, suggestedStatus, userStatus` | `confirm-suggested, keep-choice` | Tersedia | `frontend/src/components/self-service/ValidationPromptModal.vue` |

---

## 4. Visual Specification
- Base #F7FAF9, Surface #FFFFFF, Accent #00674D, DailyStatus GREEN/AMBER/RED, Timing OnTime #0369A1, Late #C2410C, Slate #475569

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `commitments` | Komitmen Harian | `array (0-3 items)` | Wajib (atau zero-commitment) | User Input | `text, taskRef, initialRisk` | `empty` |
| `zeroCommitmentReason` | Alasan Tanpa Komitmen | `string` | Wajib jika 0 komitmen | User Input | `min 10 char` | `empty` |
| `outcome` | Hasil Akhir EOD | `enum (Achieved, Partial, NotAchieved)` | Wajib di EOD | User Input | `segmented` | `null` |
| `continuation` | Kelanjutan Besok | `enum (Done, Continue)` | Wajib di EOD | User Input | `segmented` | `null` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-03-01** | Klik 'Simpan Komitmen Pagi' | Komitmen 1-3 terisi atau zero-commitment beralasan | POST /daily-accountability-records/morning-checkin | Editable | Locked / Submitting | `POST /api/v1/daily-accountability-records/morning-checkin` | Toast 'Komitmen pagi tersimpan' | Terkunci pasca simpan | Tetap di /today dengan status terkunci | Morning submission event | Record tersimpan tepat waktu (OnTime) atau terlambat (Late). |
| **INT-03-02** | Klik 'Kirim Hasil EOD' | Seluruh outcome dan continuation terisi | POST /daily-accountability-records/{id}/eod-checkin | EOD Editable | Locked | `POST /api/v1/daily-accountability-records/{id}/eod-checkin` | Toast 'Evaluasi EOD selesai' | EOD form terkunci | Tetap di /today | EOD checkin event | Daily accountability record ditutup penuh. |

---

## 7. State Matrix
| State | Deskripsi Representasi Visual & Perilaku Sistem |
|---|---|
| **Initial / Pristine** | Halaman pertama kali dibuka, form dalam kondisi default atau memuat data draft lokal. |
| **Loading** | Menampilkan Vuetify skeleton loader atau progress circular saat query TanStack sedang fetching. |
| **Empty State** | Menampilkan ikon netral slate, teks instruksi ramah, dan tombol aksi pembuat (jika ada hak). |
| **Populated** | Seluruh data berhasil dimuat dari cache/server dan disajikan pada kartu/tabel. |
| **Validation Error** | Pesan kesalahan inline vee-validate berwarna merah danger `#DC2626` di bawah field terkait. |
| **API Error** | Alert banner berwarna merah dengan opsi tombol "Coba Lagi" (retry query). |
| **Permission Denied** | Komponen tersembunyi (*hidden*) atau navigasi dicegah oleh router guard `guards.ts`. |
| **Saving / Submitting** | Tombol aksi menampilkan spinner loading dan dinonaktifkan untuk mencegah *double submit*. |
| **Success** | Feedback visual toast / snackbar hijau `#15803D` selama 3 detik. |
| **Locked** | Banner `LockedIndicator` warna slate netral aktif; field input beralih menjadi teks baca-saja. |
| **Read-Only** | Kontrol aksi disembunyikan; data dapat dilihat dan disaring namun tidak dapat dimutasi. |
| **Disabled** | Tombol atau input berwarna redup dengan cursor not-allowed saat syarat validasi belum terpenuhi. |
| **Responsive (Mobile)** | Tata letak beradaptasi menjadi 1 kolom penuh, margin 16px, tombol berukuran minimum 44px tinggi touch target. |

---

## 8. Form Specification & Validasi
- **Integrasi Library**: `vee-validate` v4 + `@vee-validate/zod` + `zod` v4.
- **Skema Zod yang Diwajibkan**:
```typescript
z.object({
  commitments: z.array(z.object({
    description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
    taskReference: z.string().optional(),
    initialRisk: z.enum(['GREEN', 'AMBER', 'RED'])
  })).max(3, 'Maksimal 3 komitmen'),
  hasZeroCommitments: z.boolean().default(false),
  zeroCommitmentReason: z.string().optional()
}).refine(data => {
  if (data.hasZeroCommitments) return !!data.zeroCommitmentReason && data.zeroCommitmentReason.length >= 10;
  return data.commitments.length >= 1;
}, { message: 'Wajib mengisi komitmen atau menyertakan alasan valid', path: ['zeroCommitmentReason'] })
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu utama 'My Today' atau redirect root
- **Exit Points**:  Exit: Navigasi ke /history atau halaman lain
- **Breadcrumb Hierarchy**: Beranda > My Today Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
