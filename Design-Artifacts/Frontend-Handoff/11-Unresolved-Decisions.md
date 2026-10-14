# 11 — Unresolved Decisions and Quality Gate Register
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-11 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Analisis** | 11 Oktober 2026 |
| **Status Register** | ACTIVE GOVERNANCE & QUALITY GATE |
| **Prinsip Utama** | Dokumentasikan Kekosongan Informasi & Gap Sumber — Jangan Mengarang Keputusan Produk |

---

## 1. Register Keputusan yang Belum Selesai (Unresolved Decisions Register)

Daftar berikut mencatat seluruh keputusan produk, teknis, atau izin yang belum disahkan atau belum memiliki kontrak backend definitif:

| ID Keputusan | Deskripsi Ketidakpastian / Gap | Dampak pada Frontend | Sumber Terkait | Status Blocking | Pihak Berwenang / Otoritas Keputusan | Rekomendasi Teknis Frontend | Status Saat Ini |
|---|---|---|---|---|---|---|---|
| **UND-01** | **Batas Waktu Pengunggahan Berkas Cuti**: Belum ada aturan batas waktu toleransi upload surat dokter susulan untuk izin sakit yang telah diajukan. | Form pengajuan cuti tidak tahu kapan harus mengunci upload file. | PRD US-21, SAD 16.4 | Non-Blocking | HRGA Policy Owner | Izinkan upload susulan hingga batas cuti berakhir dengan status *Document Pending*. | **OPEN / UNRESOLVED** |
| **UND-02** | **Format Ekspor Laporan Excel (.xlsx)**: Endpoint backend saat ini di OpenAPI mengembalikan stream CSV (`text/csv`), namun prototipe menampilkan opsi Excel (.xlsx). | Tombol ExportButton perlu mengetahui apakah format .xlsx didukung backend atau diformat client-side. | OpenAPI `/reports/{type}/export`, Prototipe 25 | Non-Blocking | Backend Architect / Lead Dev | Gunakan format standar CSV terlebih dahulu sebagai baseline MVP yang terkonfirmasi. | **OPEN / UNRESOLVED** |
| **UND-03** | **Kebijakan Push Notification di Safari iOS**: Apple WebKit iOS memerlukan web app ditambahkan ke Home Screen (PWA mode) untuk mendukung Web Push. | Indikator status Web Push di `/admin/users` dapat membingungkan pengguna mobile browser jika tidak diberi peringatan. | Known-Limitations Sec 4, Prototipe 30 | Non-Blocking | Product Owner & Tech Lead | Tampilkan banner peringatan ramah: "Notifikasi Web Push di iOS memerlukan aplikasi disimpan ke Home Screen". | **OPEN / UNRESOLVED** |
| **UND-04** | **Batas Maksimum Karakter Catatan Manajer**: Panjang karakter maksimum field `noteContent` di modal `ManagerNoteModal` belum ditentukan secara eksplisit di skema Zod backend. | Validasi form frontend saat ini mengasumsikan max 1000 karakter. | PRD US-12, SAD 16.4 | Non-Blocking | Lead Architect / Product Owner | Batasi 1000 karakter di sisi frontend dengan counter sisa karakter. | **OPEN / UNRESOLVED** |
| **UND-05** | **Durasi Retensi Notifikasi Web In-App**: Kapan notifikasi yang telah dibaca diarsip atau dihapus dari antrean pengguna belum diatur di policy. | Query `/notifications` dapat membengkak jika data tidak dipaginasi atau tidak dibatasi retensinya. | PRD US-20, SAD 16.4 | Non-Blocking | System Admin Policy Owner | Terapkan paginasi default 50 item terakhir pada komponen `NotificationsPage.vue`. | **OPEN / UNRESOLVED** |
| **UND-06** | **Toleransi Multi-Device Session**: Apakah pengguna diizinkan login bersamaan di desktop dan mobile web tanpa membatalkan token sebelumnya (*concurrent sessions*). | Logika store otentikasi `auth.store.ts` terhadap penanganan refresh token. | SAD 6.1, ADR-005 | Non-Blocking | Security Architect / Tech Lead | Dukung concurrent login via stateless JWT dengan masa berlaku 24 jam. | **OPEN / UNRESOLVED** |

---

## 2. Status Quality Gate Frontend Handoff Package

Sesuai kriteria penyelesaian Section 8 Master Prompt:

| # | Syarat Kelulusan Quality Gate | Status | Bukti / Dokumen Referensi |
|---|---|---|---|
| 1 | Seluruh berkas sumber telah diinventarisasi tanpa asumsi | **LULUS** | `00-Source-Inventory.md` (15 Dokumen Inti, 30 HTML, 63 Endpoints) |
| 2 | Seluruh 30 HTML lama telah diperiksa secara mendalam | **LULUS** | `01-Legacy-Page-Extraction.md` (30 Subbagian stabil lengkap DOM & JS) |
| 3 | Pemetaan Legacy -> Business Spec -> Vue SPA dapat ditelusuri | **LULUS** | `02-Page-Route-Reconciliation.md` (Matriks 30 -> 23 -> 16 -> 17 terbukti) |
| 4 | Seluruh konflik terhadap spesifikasi final terdokumentasi | **LULUS** | `03-Legacy-to-Final-Design-Diff.md` (15 Temuan konflik dengan tindakan) |
| 5 | Setiap halaman memiliki spesifikasi terstruktur 10 dimensi | **LULUS** | `05-Screen-Specifications/` (16 Dokumen PAGE-01 s.d PAGE-16) |
| 6 | Katalog komponen reusable terdokumentasi rapi tanpa mencampur status | **LULUS** | `06-Shared-Component-Catalog.md` (18 Komponen terdefinisi dengan token) |
| 7 | Struktur file frontend dibedakan antara kondisi aktual dan rekomendasi | **LULUS** | `04-Frontend-Architecture-and-File-Map.md` (Tabel status AKTUAL vs USULAN) |
| 8 | Kebutuhan API dipetakan ke kontrak terkonfirmasi di OpenAPI | **LULUS** | `08-Frontend-Data-and-API-Requirements.md` (26 Operasi data terpetakan) |
| 9 | Spesifikasi responsif & aksesibilitas WCAG AA terdokumentasi | **LULUS** | `09-Responsive-and-Accessibility.md` (Breakpoints, kontras, keyboard, ARIA) |
| 10 | Matriks pengujian & kriteria penerimaan dapat diverifikasi | **LULUS** | `10-UI-Test-and-Traceability.md` (15 Traceability rows, 11 Skenario E2E) |
| 11 | Seluruh unresolved decisions tercatat tanpa spekulasi produk | **LULUS** | `11-Unresolved-Decisions.md` (6 Item dengan mitigasi non-blocking) |
| 12 | Tidak ada dokumen sumber yang termutasi, ditimpa, atau dihapus | **LULUS** | Read-only mode dipatuhi 100% pada seluruh berkas sumber |
| 13 | Tidak ada klaim kelulusan tes yang belum benar-benar dieksekusi | **LULUS** | Seluruh test cases dinyatakan sebagai spesifikasi uji |

---

## 3. Pernyataan Penutupan Gerbang Kualitas (Gate Closure Verdict)

Frontend Handoff Package WorkPulse telah memenuhi seluruh standar arsitektur dan dokumentasi teknis. Paket ini dinyatakan **SIAP DAN VALID (QUALITY GATE PASSED)** untuk diserahkan kepada tim pengembang / AI agent pelaksana berikutnya.
