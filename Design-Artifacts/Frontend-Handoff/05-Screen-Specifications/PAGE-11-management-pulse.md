# PAGE-11 — Management Pulse Hub Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-11` |
| **Page Slug** | `management-pulse` |
| **Page Name** | Management Pulse Hub |
| **Window Title** | `Management Pulse — WorkPulse` |
| **Router Path** | `/management` |
| **Route Name** | `ManagementPulse` |
| **Primary Actors** | CEO, Direksi, Top Management |
| **Role / Permission Scope** | `CEO_Management, CEO_Director, SystemAdmin` |
| **Business Spec Unit** | A 4.8 Management Pulse Dashboard, A 4.14 Escalation Aging |
| **Legacy Source Files** | `19-management-pulse.html, 20-management-escalation-aging.html` |
| **Dokumen Referensi** | PDD v1.1 G1, PRD v1.1 US-17, UI/UX Spec v1.2 A 4.8, 4.14, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Dashboard eksekutif untuk Direksi dan CEO yang menyajikan visibilitas kesehatan operasional makro seluruh perusahaan, tren status komitmen lintas fungsi, metrik kepatuhan global, dan antrean penuaan eskalasi blocker yang melampaui SLA.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Management Pulse — Ikhtisar Operasional Eksekutif"
- KPI Widget Bar: Tingkat Kepatuhan Perusahaan (%), Total Komitmen Hari Ini, Blocker Terbuka Kritis, Rasio Penyelesaian
- Tabs:
  - Tab 1: Executive Pulse Overview (Grafik per divisi, perbandingan kinerja tim, highlight masalah besar)
  - Tab 2: Escalation Aging SLA (Daftar kendala yang belum terselesaikan melampaui batas SLA toleransi waktu)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-11-01** | `AgingBlockerTable` | Tabel blocker dengan indikator durasi keterlambatan SLA. | `blockers` | `escalate` | Tersedia | `frontend/src/pages/ManagementPulsePage.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Accent #00674D, Severity Critical Pill #B91C1C

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `dateScope` | Lingkup Waktu | `string` | Opsional | Dropdown | `today, week, month` | `today` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-11-01** | Filter aging blocker > 48 jam | User memilih filter aging | Refetch query blocker aging | All aging | Filtered > 48h | `GET /api/v1/blockers?minAgingHours=48` | Data terupdate | None | None | None | Tabel menampilkan kendala kritis menua. |

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
- **Entry Points**: Entry: Menu 'Management Pulse'
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Management Pulse Hub
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
