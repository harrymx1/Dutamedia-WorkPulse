# PAGE-07 — My Leave Request Page Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-07` |
| **Page Slug** | `my-leave-request` |
| **Page Name** | My Leave Request Page |
| **Window Title** | `My Leave Request — WorkPulse` |
| **Router Path** | `/today/leave-request` |
| **Route Name** | `MyLeaveRequest` |
| **Primary Actors** | Seluruh Karyawan (Self-Service) |
| **Role / Permission Scope** | `All Authenticated Users` |
| **Business Spec Unit** | A 4.20 My Leave Request |
| **Legacy Source Files** | `13-my-leave-request.html` |
| **Dokumen Referensi** | PRD v1.1 US-21, UI/UX Spec v1.2 A 4.20, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Pengajuan permohonan cuti/izin mandiri oleh karyawan, pemilihan rentang tanggal izin, tipe cuti, unggah surat keterangan dokter/pendukung, dan riwayat status pengajuan.
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: "Pengajuan Cuti & Izin Kerja", Breadcrumb: My Today / Cuti
- Form Pengajuan Cuti:
  - Tipe Permohonan (Cuti Tahunan, Izin Sakit, Izin Khusus)
  - Tanggal Mulai & Tanggal Selesai (Date Picker)
  - Catatan / Keterangan Alasan
  - Unggah Dokumen Pendukung (opsional / wajib jika sakit > 1 hari)
  - Tombol Submit Permohonan
- Riwayat Pengajuan Cuti (Tabel Riwayat): Tanggal pengajuan, rentang cuti, status (Pending, Approved, Rejected), catatan reviewer

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-07-01** | `LeaveApplicationForm` | Form pengajuan izin cuti. | `none` | `submitted` | Tersedia | `frontend/src/pages/MyLeaveRequestPage.vue` |
| **CMP-07-02** | `LeaveHistoryTable` | Tabel riwayat permohonan cuti personal. | `history` | `none` | Tersedia | `frontend/src/pages/MyLeaveRequestPage.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, Border #DCE7E2, Status Pill Approved #15803D, Pending #475569, Rejected #B91C1C

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `leaveType` | Jenis Cuti / Izin | `enum` | Wajib | Select | `Annual, Sick, Special` | `Annual` |
| `startDate` | Tanggal Mulai | `date` | Wajib | Date Picker | `YYYY-MM-DD` | `today` |
| `endDate` | Tanggal Selesai | `date` | Wajib | Date Picker | `YYYY-MM-DD` | `today` |
| `reason` | Alasan Permohonan | `string` | Wajib | Textarea | `min 10 char` | `empty` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-07-01** | Klik 'Kirim Pengajuan Cuti' | Form terisi valid dan tanggal masuk akal | POST /exceptions/leave | Idle | Submitting | `POST /api/v1/exceptions/leave` | Toast 'Permohonan cuti terkirim ke atasan' | Disable submit button | Daftar riwayat disegarkan | Leave application created | Record pengecualian berstatus Pending terbuat di backend. |

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
  leaveType: z.enum(['ANNUAL', 'SICK', 'SPECIAL']),
  startDate: z.string().min(1, 'Tanggal mulai wajib dipilih'),
  endDate: z.string().min(1, 'Tanggal selesai wajib dipilih'),
  reason: z.string().min(10, 'Alasan permohonan minimal 10 karakter')
})
```
- **Perilaku Validasi**:
  - Validasi terjadi secara dinamis pada event `blur` dan diperiksa menyeluruh sebelum event `submit`.
  - Tombol submit dinonaktifkan saat mutasi sedang berjalan (*mutation.isPending*).
  - Pesan error server (HTTP 400/422) dinormalisasi dan dipetakan ke field formulir terkait.

---

## 9. Navigation Specification
- **Entry Points**: Entry: Link 'Ajukan Cuti' di My Today
- **Exit Points**:  Exit: Kembali ke /today
- **Breadcrumb Hierarchy**: Beranda > My Leave Request Page
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
