# PAGE-05 — Notifications Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-05` |
| **Page Slug** | `notifications` |
| **Page Name** | Notifications Page |
| **Window Title** | `Notifikasi — WorkPulse` |
| **Router Path** | `/notifications` |
| **Route Name** | `Notifications` |
| **Primary Actors** | Seluruh Pengguna |
| **Role / Permission Scope** | `All Authenticated Users` |
| **Business Spec Unit** | A 4.7 Web Notification Center |
| **Legacy Source Files** | `06-notifications.html` |
| **Dokumen Referensi** | PRD v1.1 US-20, UI/UX Spec v1.2 A 4.7, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Menampilkan antrean notifikasi masuk untuk 13 pemicu bisnis sistem, filter belum dibaca, dan aksi tandai telah dibaca.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Pusat Notifikasi", Tombol "Tandai Semua Dibaca"
- Filter Tabs: "Semua", "Belum Dibaca", "Penting (Blocker & Review)"
- List Notifikasi: Tiap item memiliki icon kategori, judul pesan, waktu relatif, status unread indicator, dan tautan aksi kontekstual
- Empty State: Ilustrasi netral dan pesan "Tidak ada notifikasi baru"

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-05-01** | `NotificationItem` | Item baris notifikasi dengan penanda belum dibaca. | `notification` | `read, navigate` | Tersedia | `frontend/src/pages/NotificationsPage.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Elevated #EFF5F2, Unread dot Accent #00674D, Time Font JetBrains Mono

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `filter` | Kategori Notifikasi | `string` | Opsional | Tab Selection | `all/unread` | `all` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-05-01** | Klik 'Tandai Semua Dibaca' | Ada notifikasi unread | POST /notifications/mark-all-read | Unread count > 0 | Unread count = 0 | `POST /api/v1/notifications/mark-all-read` | Toast & counter reset | None | None | Notification state update | Semua notifikasi ditandai dibaca. |

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
None (Query params only)
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Bell icon di navbar atau link langsung /notifications
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Notifications Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
