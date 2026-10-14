# PAGE-10 — Compliance & Governance Hub Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-10` |
| **Page Slug** | `compliance` |
| **Page Name** | Compliance & Governance Hub |
| **Window Title** | `Compliance & Exemption — WorkPulse` |
| **Router Path** | `/compliance` |
| **Route Name** | `Compliance` |
| **Primary Actors** | HRGA, Compliance Officer, Manajemen |
| **Role / Permission Scope** | `HRGA, CEO_Management, CEO_Director, SystemAdmin` |
| **Business Spec Unit** | A 4.11 Compliance Queue, A 4.12 Exemption Management, A 4.21 Leave Approval, A 4.10 Coaching SP Records |
| **Legacy Source Files** | `21-compliance-queue.html, 22-exemption-management.html, 23-leave-approval.html, 24-coaching-warning-records.html` |
| **Dokumen Referensi** | PDD v1.1 G3, G5, PRD v1.1 US-13 s.d US-15, UI/UX Spec v1.2 A 4.11, 4.12, 4.21, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Pusat tata kelola kepatuhan SDM: Tab 1 Antrean Pelanggaran Kepatuhan (No-Submission berulang, peringatan bertingkat), Tab 2 Manajemen Hari Libur & Dispensasi Individual, dan Tab 3 Buku Register Pembinaan & Surat Peringatan (SP 1, SP 2, SP 3).
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Kepatuhan & Tata Tertib Kerja (HRGA)"
- Tabs:
  - Tab 1: Antrean Kepatuhan (Daftar karyawan No-Submission, log tindakan: Kirim Pengingat, Jadwalkan Pembinaan, Rekam SP)
  - Tab 2: Pengecualian & Libur (Kalender Hari Libur Perusahaan, Tombol Tambah Hari Libur, Form Dispensasi Individual)
  - Tab 3: Rekam Pembinaan & SP (Tabel rekam SP formal, riwayat coaching, unduh berkas surat)
- Modals Tersemat:
  - CreateExemptionModal.vue (Modal pembuatan libur / dispensasi)
  - IssueWarningModal (Modal penerbitan SP)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-10-01** | `CreateExemptionModal` | Modal penetapan hari libur resmi atau dispensasi pegawai. | `modelValue` | `update:modelValue, created` | Tersedia | `frontend/src/components/management/CreateExemptionModal.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Pill Severity Critical #B91C1C, Warning #C2410C, Slate #475569

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `exemptionType` | Tipe Pengecualian | `enum` | Wajib | Modal | `HOLIDAY, INDIVIDUAL_EXEMPTION` | `HOLIDAY` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-10-01** | Terbitkan Surat Peringatan (SP) | Pelanggaran no-submission berulang tercatat | POST /compliance-events/{id}/record-warning | Violation | Warning Issued | `POST /api/v1/compliance-events/{id}/record-warning` | Toast 'Surat Peringatan tercatat' | Disable | None | Formal SP audit record | Event kepatuhan ditingkatkan ke SP dan tercatat di buku rekam. |

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
None (Container page)
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Menu 'Compliance & Exemption'
- **Exit Points**: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Compliance & Governance Hub
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
