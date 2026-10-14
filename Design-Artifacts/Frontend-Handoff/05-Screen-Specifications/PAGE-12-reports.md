# PAGE-12 — Reports Hub Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-12` |
| **Page Slug** | `reports` |
| **Page Name** | Reports Hub Page |
| **Window Title** | `Reports — WorkPulse` |
| **Router Path** | `/reports` |
| **Route Name** | `Reports` |
| **Primary Actors** | Seluruh Peran (Akses data sesuai cakupan otorisasi) |
| **Role / Permission Scope** | `Supervisor_TL, Head, Head_Dept, HRGA, CEO_Management, CEO_Director, SystemAdmin` |
| **Business Spec Unit** | A 4.23 Reports Hub |
| **Legacy Source Files** | `25-reports.html` |
| **Dokumen Referensi** | PDD v1.1 G1, G3, G6, PRD v1.1 US-24, UI/UX Spec v1.2 A 4.23, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Pusat 5 laporan operasional terpadu sistem: Daily Exception Report, Weekly Team Summary, Monthly Trend Analysis, Individual Evidence Report, dan Blocker Root Cause Analysis, dilengkapi dengan filter multi-dimensi dan ekspor CSV/Excel.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Pusat Laporan & Analitik", Tombol "Ekspor Data" (ExportButton.vue)
- FilterBar: Pilihan Jenis Laporan, Pilihan Unit/Tim, Rentang Tanggal
- Tab Pilihan Laporan:
  - Tab 1: Daily Exception (Daftar deviasi harian: No Submission, status RED, blocker kritis)
  - Tab 2: Weekly Team Summary (Agregasi komitmen per tim per minggu)
  - Tab 3: Monthly Trend (Tren kepatuhan dan outcome bulanan)
  - Tab 4: Individual Evidence (Bukti riwayat komitmen karyawan spesifik untuk evaluasi objektif)
  - Tab 5: Blocker Root Cause (Analisis kategori akar penyebab hambatan operasional)
- DataTable Laporan dengan Pagination dan Density Control

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-12-01** | `ExportButton` | Tombol aksi download file blob CSV/Excel. | `reportType, params` | `export-start, export-complete` | Tersedia | `frontend/src/components/shared/ExportButton.vue` |
| **CMP-12-02** | `FilterBar` | Bilah filter laporan. | `modelValue, config` | `update:modelValue` | Tersedia | `frontend/src/components/shared/FilterBar.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Border #DCE7E2, Mono Font JetBrains Mono untuk ID & angka

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `reportType` | Tipe Laporan | `enum` | Wajib | Tabs | `daily-exception, weekly-summary, monthly-trend, evidence, root-cause` | `daily-exception` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-12-01** | Klik 'Ekspor CSV' | Filter laporan valid | GET /reports/{type}/export?format=csv | Ready | Downloading | `GET /api/v1/reports/{reportType}/export` | File browser download dialog | Loading spinner di tombol | None | Report export audit log | File CSV terunduh secara benar di browser. |

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
None
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu 'Reports'
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Reports Hub Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
