# PAGE-04 — My History Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-04` |
| **Page Slug** | `my-history` |
| **Page Name** | My History Page |
| **Window Title** | `My History — WorkPulse` |
| **Router Path** | `/history` |
| **Route Name** | `MyHistory` |
| **Primary Actors** | Seluruh Karyawan (Self-Service) |
| **Role / Permission Scope** | `All Authenticated Users` |
| **Business Spec Unit** | A 4.6 My History & Weekly Summary |
| **Legacy Source Files** | `05-my-history.html` |
| **Dokumen Referensi** | PRD v1.1 US-05, UI/UX Spec v1.2 A 4.6, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Menampilkan riwayat harian komitmen, hasil EOD, status submission timing, filter rentang tanggal, dan kartu detail per tanggal kerja.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Page Header: Judul "My History & Weekly Summary"
- Weekly Metric Strip: Total komitmen, Tingkat penyelesaian (Achieved %), Tingkat kepatuhan waktu (On-time %)
- FilterBar: Date range picker (default 30 hari terakhir), Filter Status (GREEN/AMBER/RED)
- History List: Kartu per hari (Daily Record Card)
  - Tanggal, StatusBadge harian, SubmissionTimingBadge
  - Daftar komitmen dan outcome masing-masing
  - Log blocker yang terjadi pada hari tersebut
- Empty State jika tidak ada riwayat pada rentang waktu yang dipilih

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-04-01** | `FilterBar` | Komponen pencarian dan penyaringan data rentang waktu. | `modelValue, config` | `update:modelValue` | Tersedia | `frontend/src/components/shared/FilterBar.vue` |
| **CMP-04-02** | `StatusBadge` | Pill badge status harian. | `status` | `none` | Tersedia | `frontend/src/components/shared/StatusBadge.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Border #DCE7E2, Meta Font JetBrains Mono, Card Radius 10px

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `dateRange` | Rentang Tanggal | `date-range` | Opsional | Filter Input | `YYYY-MM-DD` | `30 days` |
| `statusFilter` | Status Harian | `enum` | Opsional | Filter Input | `GREEN/AMBER/RED` | `ALL` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-04-01** | Ubah filter tanggal | User memilih rentang baru | Refetch useDailyRecords query | Displaying | Loading -> Updated | `GET /api/v1/daily-accountability-records` | Data tersegarkan | None | None | None (read) | Daftar histori terfilter sesuai rentang tanggal. |

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
z.object({ startDate: z.string().optional(), endDate: z.string().optional() })
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu 'My History'
- **Exit Points**:  Exit: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > My History Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
