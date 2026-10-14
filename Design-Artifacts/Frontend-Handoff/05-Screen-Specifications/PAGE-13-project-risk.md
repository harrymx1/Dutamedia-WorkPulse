# PAGE-13 — Project Risk Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-13` |
| **Page Slug** | `project-risk` |
| **Page Name** | Project Risk Page |
| **Window Title** | `Project Risk View — WorkPulse` |
| **Router Path** | `/my-scope/project-risk` |
| **Route Name** | `ProjectRisk` |
| **Primary Actors** | Project Manager (PM), Delivery Head, Manajemen |
| **Role / Permission Scope** | `PM, SystemAdmin, CEO_Management, CEO_Director, Head_Dept, Head, Supervisor_TL` |
| **Business Spec Unit** | A 4.13 Project Risk View |
| **Legacy Source Files** | `18-project-risk.html` |
| **Dokumen Referensi** | PRD v1.1 US-16, UI/UX Spec v1.2 A 4.13, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Tampilan agregasi pasif seluruh komitmen harian dan blocker lintas fungsi yang mencantumkan kode/tag proyek tertentu untuk memberikan visibilitas langsung risiko pengiriman proyek kepada PM.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Project Risk View — Agregasi Komitmen Proyek"
- Filter Selector: Dropdown Pilihan Kode Proyek (misal PRJ-ALPHA, PRJ-BETA), Pilihan Rentang Waktu
- Project Health Summary: Total Komitmen Terkait, Komitmen Berisiko (AMBER/RED), Blocker Terkait Aktif
- Tabel Komitmen Proyek: Nama Karyawan, Tim Asal, Teks Komitmen, Initial Risk, Outcome, Blocker Terkait

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-13-01** | `ProjectCommitmentTable` | Tabel agregasi komitmen berbasis referensi proyek. | `items` | `none` | Tersedia | `frontend/src/pages/ProjectRiskPage.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Tag Project Accent #0369A1, DailyStatus Pill

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `projectCode` | Kode Proyek | `string` | Wajib | Dropdown | `PRJ-XXX` | `ALL` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-13-01** | Pilih Proyek dari Dropdown | User memilih kode proyek | Fetch komitmen dengan taskReference matching | Displaying | Updated | `GET /api/v1/daily-accountability-records?taskRef={code}` | Data terseleksi | None | None | None | Tabel hanya menampilkan komitmen bertag proyek tersebut. |

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
- **Entry Points**: Entry: Menu 'Project Risk'
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Project Risk Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
