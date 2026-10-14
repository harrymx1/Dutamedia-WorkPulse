# PAGE-06 — Profile Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-06` |
| **Page Slug** | `profile` |
| **Page Name** | Profile Page |
| **Window Title** | `Profil Pengguna — WorkPulse` |
| **Router Path** | `/profile` |
| **Route Name** | `Profile` |
| **Primary Actors** | Seluruh Pengguna Terautentikasi |
| **Role / Permission Scope** | `All Authenticated Users` |
| **Business Spec Unit** | SAD 16.4 Profile & Settings |
| **Legacy Source Files** | `07-profile.html` |
| **Dokumen Referensi** | PDD v1.1 Sec 4, SAD v1.0 Sec 16.4, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Menampilkan identitas pengguna, NIK, peran aktif, atasan langsung hierarkis, informasi tim, dan form perubahan kata sandi mandiri.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: Profil Pengguna
- Grid Dua Kolom:
  - Kolom 1 (Info Karyawan): Avatar inisial, Nama Lengkap, NIK, Email, Departemen, Peran Aktif, Atasan Langsung (Direct Manager)
  - Kolom 2 (Keamanan Akun): Form Ubah Kata Sandi (Kata Sandi Lama, Kata Sandi Baru, Konfirmasi Kata Sandi Baru, Tombol Simpan)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-06-01** | `UserProfileCard` | Menampilkan master data profil pegawai. | `user` | `none` | Tersedia | `frontend/src/pages/ProfilePage.vue` |
| **CMP-06-02** | `ChangePasswordForm` | Form ubah kata sandi dengan validasi keamanan. | `none` | `password-updated` | Tersedia | `frontend/src/pages/ProfilePage.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Border #DCE7E2, Accent #00674D, Input Radius 8px

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `oldPassword` | Kata Sandi Saat Ini | `string` | Wajib | User Input | `masked` | `empty` |
| `newPassword` | Kata Sandi Baru | `string` | Wajib | User Input | `min 8 char` | `empty` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-06-01** | Klik 'Ubah Kata Sandi' | Semua field sandi valid | POST /auth/reset-password | Idle | Submitting | `POST /api/v1/auth/reset-password` | Toast 'Kata sandi berhasil diperbarui' | Disable tombol | None | User password change event | Kata sandi berubah dan form di-reset. |

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
  oldPassword: z.string().min(1, 'Kata sandi lama wajib diisi'),
  newPassword: z.string().min(8, 'Minimal 8 karakter'),
  confirmNewPassword: z.string().min(1, 'Konfirmasi sandi wajib diisi')
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Konfirmasi sandi tidak sesuai',
  path: ['confirmNewPassword']
})
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu User di kanan atas navbar
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Profile Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
