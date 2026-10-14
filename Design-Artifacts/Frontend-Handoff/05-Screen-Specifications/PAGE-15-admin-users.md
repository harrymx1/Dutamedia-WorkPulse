# PAGE-15 — Admin Master Data Hub Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-15` |
| **Page Slug** | `admin-users` |
| **Page Name** | Admin Master Data Hub |
| **Window Title** | `Admin Master Data — WorkPulse` |
| **Router Path** | `/admin/users` |
| **Route Name** | `AdminUsers` |
| **Primary Actors** | System Administrator |
| **Role / Permission Scope** | `SystemAdmin` |
| **Business Spec Unit** | SAD 16.4 Master User, A 4.15 Org Mapping, A 4.17 Temporary Reviewer, A 4.19 Notification Setup |
| **Legacy Source Files** | `27-user-role-management.html, 28-organization-mapping.html, 29-temporary-reviewer.html, 30-notification-setup.html` |
| **Dokumen Referensi** | PDD v1.1 Sec 4, PRD v1.1 US-19, US-20, US-25, UI/UX Spec v1.2 A 4.15, 4.17, 4.19, SAD v1.0 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Pusat administrasi teknis sistem terpadu: Tab 1 Manajemen Akun & Hak Akses Pengguna, Tab 2 Pemetaan Hierarki Organisasi & Otoritas Proyek (effective-dated), Tab 3 Pendelegasian Reviewer Berbatas Waktu, dan Tab 4 Konfigurasi Saluran Notifikasi Sistem untuk 13 pemicu.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Administrasi Sistem & Master Data"
- Navigation Tabs (VTabs):
  - Tab 1: Manajemen Pengguna & Peran (Tabel User, Tambah Pengguna, Edit Peran, Admin Reset Sandi)
  - Tab 2: Pemetaan Organisasi (Pemetaan Atasan Langsung, Struktur Divisi, Project Authority Mapping dengan tanggal efektif)
  - Tab 3: Pendelegasian Reviewer (Temporary Reviewer Assignments: Reviewer Asal, Pengganti, Tanggal Mulai, Tanggal Selesai)
  - Tab 4: Pengaturan Notifikasi (Tabel 13 Pemicu Sistem, Toggle In-App, Toggle Web Push, Konfigurasi Email)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-15-01** | `AdminUserManagementTab` | Sub-view administrasi akun pengguna. | `none` | `none` | Tersedia | `frontend/src/components/admin/AdminUserManagementTab.vue` |
| **CMP-15-02** | `AdminOrganizationTab` | Sub-view pemetaan hierarki atasan dan otoritas proyek. | `none` | `none` | Tersedia | `frontend/src/components/admin/AdminOrganizationTab.vue` |
| **CMP-15-03** | `AdminTemporaryReviewerTab` | Sub-view pendelegasian wewenang reviewer berbatas waktu. | `none` | `none` | Tersedia | `frontend/src/components/admin/AdminTemporaryReviewerTab.vue` |
| **CMP-15-04** | `AdminNotificationSetupTab` | Sub-view konfigurasi kanal notifikasi 13 trigger. | `none` | `none` | Tersedia | `frontend/src/components/admin/AdminNotificationSetupTab.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Border #DCE7E2, Mono Font JetBrains Mono untuk NIK & ID, Primary #00674D

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `nik` | NIK Karyawan | `string` | Wajib | Form Tambah User | `ID-XXXX` | `empty` |
| `systemRole` | Peran Sistem | `enum` | Wajib | Select | `Employee, Supervisor_TL, Head, HRGA, PM, Admin, Mgmt` | `Employee` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-15-01** | Tambah Pendelegasian Reviewer | Tanggal mulai <= tanggal selesai | POST /temporary-reviewer-assignments | Form | Saved | `POST /api/v1/temporary-reviewer-assignments` | Toast 'Delegasi reviewer berhasil ditetapkan' | Disable | None | Delegation audit log | Reviewer pengganti mendapatkan akses review hingga batas expiry. |

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
Defined in respective Tab components
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu 'Admin Master Data' (khusus SystemAdmin)
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Admin Master Data Hub
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
