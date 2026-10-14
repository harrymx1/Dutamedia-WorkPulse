# PAGE-02 — Reset Password Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-02` |
| **Page Slug** | `reset-password` |
| **Page Name** | Reset Password Page |
| **Window Title** | `Perbarui Password — WorkPulse` |
| **Router Path** | `/reset-password` |
| **Route Name** | `ResetPassword` |
| **Primary Actors** | Pengguna dengan status force password reset atau permintaan token lupa sandi |
| **Role / Permission Scope** | `Authenticated / Token Verified` |
| **Business Spec Unit** | SAD 16.4 & PRD FR-01 |
| **Legacy Source Files** | `01-login.html (Sub-view View 2 & 3)` |
| **Dokumen Referensi** | PRD v1.1 FR-01, SAD v1.0 Sec 16.4, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Memperbarui kata sandi akun pengguna baik karena kewajiban pertama kali login (force reset) maupun pemulihan lupa kata sandi.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Centered Container (Max-width 420px)
  - Card Surface
    - Header: "Perbarui Kata Sandi Anda"
    - Keterangan kebijakan keamanan (minimal 8 karakter, kombinasi huruf dan angka)
    - Field Kata Sandi Baru
    - Field Konfirmasi Kata Sandi Baru
    - Tombol "Simpan Kata Sandi Baru"
    - Link "Kembali ke Halaman Masuk"

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-02-01** | `ResetPasswordCard` | Container kartu formulir perbaruan kata sandi. | `None` | `submit` | Tersedia | `frontend/src/pages/ResetPasswordPage.vue` |
| **CMP-02-02** | `NewPasswordField` | Input password baru dengan indikator kekuatan sandi. | `label, modelValue` | `update:modelValue` | Tersedia | `Vuetify VTextField` |

---

## 4. Visual Specification
- Surface #FFFFFF, Border #DCE7E2, Primary Accent #00674D, Feedback Danger #DC2626

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `newPassword` | Kata Sandi Baru | `string` | Wajib | User Input | `min 8 char` | `empty` |
| `confirmPassword` | Konfirmasi Kata Sandi | `string` | Wajib | User Input | `match newPassword` | `empty` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-02-01** | Klik 'Simpan Kata Sandi Baru' | Password memenuhi aturan dan cocok | Submit POST /auth/reset-password | Idle | Loading -> Success | `POST /api/v1/auth/reset-password` | Toast 'Kata sandi berhasil diperbarui' | Disable saat proses simpan | Redirect ke /today | Password change event | Password baru tersimpan dan flag force-reset dinonaktifkan. |

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
  newPassword: z.string().min(8, 'Minimal 8 karakter').regex(/[0-9]/, 'Wajib mengandung angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi wajib diisi')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi sandi tidak cocok',
  path: ['confirmPassword']
})
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Guard redirect jika user
- **Exit Points**: mustResetPassword true
- **Breadcrumb Hierarchy**: Beranda > Reset Password Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
