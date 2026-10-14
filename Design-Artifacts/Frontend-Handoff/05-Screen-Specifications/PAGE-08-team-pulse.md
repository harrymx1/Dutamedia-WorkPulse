# PAGE-08 — Team Pulse Hub Specification
## WorkPulse Screen Specification Package

| Metadata Halaman | Nilai |
|---|---|
| **Page ID** | `PAGE-08` |
| **Page Slug** | `team-pulse` |
| **Page Name** | Team Pulse Hub |
| **Window Title** | `Team Pulse — WorkPulse` |
| **Router Path** | `/team` |
| **Route Name** | `TeamPulse` |
| **Primary Actors** | Supervisor / Technical Lead, Head of Department, Project Manager |
| **Role / Permission Scope** | `Supervisor_TL, Head, Head_Dept, CEO_Management, SystemAdmin, PM` |
| **Business Spec Unit** | A 4.8 Team Pulse Dashboard, A 4.9 Blocker Queue, A 4.10 Manager Note, A 4.22 Correction & Leave Review |
| **Legacy Source Files** | `14-team-pulse.html, 09-blocker-queue.html, 10-blocker-detail.html, 12-correction-leave-review.html, 17-coaching-notes.html, 23-leave-approval.html` |
| **Dokumen Referensi** | PDD v1.1 G1-G2, PRD v1.1 US-07 s.d US-09, US-19, UI/UX Spec v1.2 A 4.8, 4.9, 4.22, Design System v1.1 |

---

## 1. Identity & Purpose
- **Tujuan Halaman**: Dashboard kepemimpinan tim terpadu dengan 3 tab: Tab 1 Roster Akuntabilitas Tim (monitoring status komitmen harian anggota tim, submission timing, quick note), Tab 2 Antrean Blocker Tim (pemantauan kendala terbuka, acknowledge, resolve), dan Tab 3 Tinjauan Koreksi & Cuti (review pengajuan sanggahan dengan objection window 48 jam dan approval cuti anggota tim).
- **Klasifikasi Arsitektur**: Single-Page Application (SPA) Vue 3 Page Component.

---

## 2. Page Anatomy & Hierarchy

- Header: Nama Tim / Scope Supervisi, Filter Tanggal, Quick Action "Beri Catatan Manajer"
- Tab Navigation (VTabs):
  - Tab 1: Roster Akuntabilitas Tim (Daftar anggota tim, avatar, nama, komitmen 1-3, status harian GREEN/AMBER/RED, submission timing, aksi)
  - Tab 2: Antrean Kendala Tim (Blocker Queue: filter severity, kartu kendala, tombol Acknowledge / Action)
  - Tab 3: Tinjauan Koreksi & Cuti (Tabel sanggahan koreksi dengan ObjectionWindowIndicator dan tabel pengajuan cuti anggota tim)
- Modal Tersemat:
  - BlockerActionModal.vue (Modal detail siklus hidup kendala)
  - ManagerNoteModal.vue (Modal dialog catatan pembinaan privat)

---

## 3. Component Inventory
| Component ID | Nama Komponen | Tujuan Komponen | Props | Emits | Status Repositori | Lokasi File |
|---|---|---|---|---|---|---|
| **CMP-08-01** | `TeamRosterTable` | Tabel roster akuntabilitas harian anggota tim. | `members, date` | `open-note, view-detail` | Tersedia | `frontend/src/pages/TeamPulsePage.vue` |
| **CMP-08-02** | `BlockerActionModal` | Modal transisi status kendala (Acknowledge, Resolve, Close). | `modelValue, blockerId` | `update:modelValue, status-updated` | Tersedia | `frontend/src/components/management/BlockerActionModal.vue` |
| **CMP-08-03** | `ManagerNoteModal` | Modal pencatatan umpan balik manajerial privat. | `modelValue, targetUserId` | `update:modelValue, saved` | Tersedia | `frontend/src/components/management/ManagerNoteModal.vue` |
| **CMP-08-04** | `ObjectionWindowIndicator` | Chip hitung mundur batas waktu sanggahan koreksi. | `expiresAt` | `expired` | Tersedia | `frontend/src/components/shared/ObjectionWindowIndicator.vue` |

---

## 4. Visual Specification
- Surface #FFFFFF, DailyStatus Pill (GREEN/AMBER/RED), Timing Pill Outline, Objection Chip JetBrains Mono

---

## 5. Data Specification
| Field Name | UI Label | Data Type | Required | Source of Truth | Format / Validation | Default State |
|---|---|---|---|---|---|---|
| `activeTab` | Tab Aktif | `string` | Wajib | Route / Tab | `roster, blockers, review` | `roster` |
| `filterRisk` | Filter Risiko | `enum` | Opsional | FilterBar | `ALL, RED, AMBER, GREEN` | `ALL` |

---

## 6. Interaction Specification
| Interaction ID | Trigger | Preconditions | User Action | Pre-State | Post-State | API Operation | Feedback UI | Locking Rule | Navigasi | Audit | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INT-08-01** | Klik 'Acknowledge Blocker' | Blocker berstatus Open | POST /blockers/{id}/acknowledge | Open | Acknowledged | `POST /api/v1/blockers/{id}/acknowledge` | Toast 'Blocker diakui' | Disable button | None | Blocker lifecycle audit | Status blocker berpindah ke Acknowledged dan support owner tercatat. |
| **INT-08-02** | Klik 'Tolak Koreksi (Object)' | Masih dalam objection window | POST /correction-requests/{id}/object | Pending | Rejected | `POST /api/v1/correction-requests/{id}/object` | Toast 'Sanggahan diajukan' | Disable button | None | Correction objection audit | Pengajuan koreksi berstatus ditolak. |

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
- **Entry Points**: Entry: Menu navigasi utama 'Team Pulse'
- **Exit Points**:  Exit: Navigasi sidebar
- **Breadcrumb Hierarchy**: Beranda > Team Pulse Hub
- **Guards**: Divalidasi oleh `setupRouterGuards` terhadap status otentikasi dan peran pengguna (`meta.roles`).

---

## 10. Acceptance Criteria (Dapat Diverifikasi)
1. Halaman dapat dirender tanpa kesalahan konsol pada resolusi Desktop (1280×800) dan Mobile (390×844).
2. Seluruh interaksi formulir mematuhi skema validasi Zod tanpa adanya *silent bypass*.
3. Status penguncian (Locked) dan kontrol waktu cut-off berfungsi secara deterministik.
4. Akses halaman ditolak dan dialihkan ke rute yang sesuai jika peran pengguna tidak memiliki otorisasi.
5. Permintaan data server mengalir melalui TanStack Query dengan mekanisme penanganan error yang andal.
