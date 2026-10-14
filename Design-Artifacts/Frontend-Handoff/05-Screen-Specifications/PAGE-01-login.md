# PAGE-01 — Login Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-01` |
| **Page Slug** | `login` |
| **Page Name** | Login Page |
| **Window Title** | `Masuk — WorkPulse` |
| **Router Path** | `/login` |
| **Route Name** | `Login` |
| **Primary Actors** | Semua Karyawan, Supervisor, Head, HRGA, PM, Manajemen, Administrator |
| **Role / Permission Scope** | `Public / Unauthenticated` |
| **Business Spec Unit** | A 4.1 Login |
| **Legacy Source Files** | `01-login.html` |
| **Dokumen Referensi** | PDD v1.1 Sec 4, PRD v1.1 FR-01, UI/UX Spec v1.2 A 4.1, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Autentikasi kredensial pengguna menggunakan email kerja dan kata sandi, inisiasi sesi pengguna dengan token JWT, serta navigasi ke alur lupa kata sandi.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Centered Authentication Container (Max-width 420px)
  - Logo & Brand Title (WorkPulse — Daily Accountability & Blocker Log System)
  - Header Subtext: "Masuk dengan akun Dutamedia Anda"
  - Form Login Container
    - Input Email Kerja (VTextField)
    - Input Kata Sandi (VTextField type password)
    - Link "Lupa kata sandi?"
    - Tombol Submit "Masuk ke Sistem" (VBtn variant gradient)
  - Footer & Hak Cipta Perusahaan (Dutamedia © 2026)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-01-01** | `LoginFormCard` | Wadah kartu formulir login dengan bayangan lembut dan sudut 10px. | `None` | `submit` | Tersedia | `frontend/src/pages/LoginPage.vue` |
| **CMP-01-02** | `EmailField` | Field input email dengan validasi email format kerja. | `label, modelValue, errorMessages` | `update:modelValue` | Tersedia | `Vuetify VTextField` |
| **CMP-01-03** | `PasswordField` | Field input kata sandi dengan toggle visibilitas ikon mata. | `label, modelValue, errorMessages` | `update:modelValue` | Tersedia | `Vuetify VTextField` |
| **CMP-01-04** | `LoginSubmitButton` | Tombol aksi submit dengan loading spinner indikator. | `loading, disabled, block` | `click` | Tersedia | `Vuetify VBtn` |

---

## 4. Visual Specification

- Background Base: #F7FAF9
- Card Surface: #FFFFFF, Border: 1px solid #DCE7E2, Border Radius: 10px
- Primary CTA: Gradient linear-gradient(135deg, #00674D 0%, #12915F 100%), Text: #FFFFFF
- Focus Ring: Border strong #A9C7BC
- Typography: Plus Jakarta Sans 600 (Header: 1.5rem, Inputs: 0.9375rem)

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `email` | Email Kerja | `string (email)` | Wajib | User Input | `name@dutamedia.com` | `empty` |
| `password` | Kata Sandi | `string` | Wajib | User Input | `masked text` | `empty` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-01-01** | Klik 'Masuk ke Sistem' / Enter | Email dan password terisi valid | Submit POST /auth/login | Idle | Loading -> Success/Error | `POST /api/v1/auth/login` | Toast 'Berhasil masuk' & redirect | Tombol disable saat loading | Redirect ke /team jika Supervisor_TL, atau /today | Auth audit log dicatat di backend | User terautentikasi dan token disimpan di Pinia authStore. |

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
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi')
})
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Direct URL /login atau redirect dari guard
- **Exit Points**:  Exit: /today atau /team pasca login
- **Breadcrumb Hierarchy**: Beranda > Login Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
