# PAGE-14 — Policy Settings Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-14` |
| **Page Slug** | `policy-settings` |
| **Page Name** | Policy Settings Page |
| **Window Title** | `Policy Settings — WorkPulse` |
| **Router Path** | `/policy-settings` |
| **Route Name** | `PolicySettings` |
| **Primary Actors** | Authorized Policy Owners, System Administrator |
| **Role / Permission Scope** | `Authorized Policy Owners, SystemAdmin` |
| **Business Spec Unit** | A 4.18 Policy Settings |
| **Legacy Source Files** | `26-policy-settings.html` |
| **Dokumen Referensi** | PDD v1.1 G7, PRD v1.1 US-23, UI/UX Spec v1.2 A 4.18, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Konfigurasi parameter tata tertib kerja sistem yang terbagi ke dalam 7 kategori kebijakan mandiri dengan otoritas pemilik berbeda (Cut-off times, Grace periods, Thresholds, Retention, SLA, Objection window, System rules), lengkap dengan riwayat versi kebijakan.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Pengaturan Kebijakan Tata Tertib Kerja"
- Accordion / Multi-Section 7 Kategori Kebijakan:
  - 1. Jadwal & Cut-off (Morning Cutoff 09:30, EOD Cutoff 18:00, Grace Period 0 menit)
  - 2. Masa Sanggahan & Objection Window (Batas Sanggahan 48 jam)
  - 3. Ambang Batas Kepatuhan & Toleransi No-Submission
  - 4. SLA Eskalasi Blocker (Toleransi Aging Jam per Severity)
  - 5. Retensi Data & Audit History
  - 6. Pengaturan Hari Kerja & Jadwal Kerja
  - 7. Batasan Slot Komitmen (Maks 3 item)
- Komponen Drawer Riwayat: PolicyVersionHistory.vue (Catatan perubahan parameter, tanggal berlaku, pelaku perubahan)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-14-01** | `PolicyVersionHistory` | Drawer riwayat perubahan parameter kebijakan. | `category` | `close` | Tersedia | `frontend/src/components/management/PolicyVersionHistory.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Elevated #EFF5F2, Primary #00674D, Border #DCE7E2

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `morningCutoff` | Cut-off Pagi | `time` | Wajib | Input Time | `HH:mm` | `09:30` |
| `eodCutoff` | Cut-off Sore | `time` | Wajib | Input Time | `HH:mm` | `18:00` |
| `objectionWindowHours` | Batas Sanggahan (Jam) | `number` | Wajib | Input Number | `integer` | `48` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-14-01** | Simpan Nilai Kebijakan Baru | User memiliki hak Authorized Policy Owner kategori tersebut | POST /policies | Form edited | Saved & Audited | `POST /api/v1/policies` | Toast 'Kebijakan berhasil diperbarui' | Disable | None | Policy version change event | Versi kebijakan baru tersimpan di database. |

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
  category: z.string(),
  key: z.string(),
  value: z.any(),
  effectiveFrom: z.string().optional()
})
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu 'Policy Settings'
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Policy Settings Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
