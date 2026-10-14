# PAGE-16 — Not Found 404 Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-16` |
| **Page Slug** | `not-found` |
| **Page Name** | Not Found 404 Page |
| **Window Title** | `Halaman Tidak Ditemukan — WorkPulse` |
| **Router Path** | `/:pathMatch(.*)*` |
| **Route Name** | `NotFound` |
| **Primary Actors** | Seluruh Pengguna |
| **Role / Permission Scope** | `Public / All` |
| **Business Spec Unit** | Design System & SAD Error Handling |
| **Legacy Source Files** | `None (Handled by SPA Framework)` |
| **Dokumen Referensi** | SAD v1.0 Sec 16.4, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Halaman penanganan kesalahan navigasi rute tidak dikenal (404) yang ramah pengguna dengan tombol kembali ke beranda aplikasi.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Centered Minimalist Shell
  - Kode Status: 404 (Besar, warna netral slate #475569)
  - Pesan Judul: "Halaman Tidak Ditemukan"
  - Deskripsi: "Tautan yang Anda tuju salah atau telah dipindahkan."
  - Tombol Utama: "Kembali ke Beranda" (mengarahkan ke /today atau /team)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-16-01** | `NotFoundView` | Tampilan error rute tidak ditemukan. | `none` | `navigate-home` | Tersedia | `frontend/src/pages/NotFoundPage.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Text Secondary #5C6E68, Button Accent #00674D

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|


---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-16-01** | Klik 'Kembali ke Beranda' | User berada di halaman 404 | router.push('/') | 404 Page | Home Route | `None` | None | None | Redirect ke /today atau /team | None | User kembali ke halaman utama terautentikasi. |

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
- **Entry Points**: Entry: URL sembarang yang tidak terdaftar
- **Exit Points**:  Exit: Redirect ke root
- **Breadcrumb Hierarchy**: Beranda > Not Found 404 Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
