# 17 — Evidence and Provenance Register
## Grounded Verification, Provenance Tracking, and Five-Tier Classification

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-17 |
| **Versi** | 1.0.0 (GROUNDED REPOSITORY AUDIT) |
| **Tanggal Audit** | 11 Oktober 2026 |
| **Sistem Klasifikasi** | Lima Tingkat Provenance: Verified, Documented, Prototype-Only, Inferred, Conflicting |
| **Prinsip Utama** | Menghargai Seluruh Jejak Historis Tanpa Memilih Pemenang Diam-Diam |

---

## 1. Definisi Lima Tingkat Klasifikasi Provenance

Setiap artefak, relasi arsitektural, dan perilaku antarmuka diuji dan diklasifikasikan ke dalam 5 kategori kepastian:

1. **`[VERIFIED]` — Verified in Source Code**:
   Fitur, komponen, rute, guard, store, atau pemanggilan API terbukti ada secara fisik di repositori kode sumber ([frontend/src/](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src) atau [backend/](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/backend)).
2. **`[DOCUMENTED]` — Documented in Specification**:
   Fitur atau aturan bisnis yang didefinisikan secara resmi pada dokumen spesifikasi final ([01-PDD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/01-PDD.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/02-PRD.md), [03-UI-UX Spec.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/03-UI-UX%20Spec%20%26%20Flow%20Document.md), [04-DESIGN.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/04-DESIGN.md), [05-SAD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/05-SAD.md)), baik sudah diimplementasikan di kode maupun masih dalam antrean kerja.
3. **`[PROTOTYPE_ONLY]` — Present Only in Historical Prototype**:
   Elemen visual, form field, atau interaksi skrip yang hanya ditemukan pada 30 berkas HTML prototipe lama di [Design-Artifacts/UI-UX-Design/](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Design-Artifacts/UI-UX-Design), namun belum pernah disahkan di PRD/PDD final atau disederhanakan saat implementasi SPA.
4. **`[INFERRED]` — Inferred and Requiring Verification**:
   Asumsi logis dari tim analis/arsitek yang diturunkan untuk menjembatani kesenjangan teknis tetapi belum memiliki konfirmasi tertulis eksplisit dari pemilik produk.
5. **`[CONFLICTING]` — Unresolved or Conflicting**:
   Pertentangan langsung antara dokumen spesifikasi resmi, prototipe visual lama, dan/atau implementasi basis kode aktual. Kedua bukti dicatat tanpa memilih pemenang sepihak.

---

## 2. Register Penelusuran Bukti & Provenance Fitur (Provenance Matrix)

| Fitur / Komponen / Perilaku | Status Klasifikasi | Bukti Sumber Kode / Lokasi Fisik | Rujukan Dokumen Spesifikasi | Bukti Prototipe Historis | Analisis Provenance & Catatan Resolusi |
|---|---|---|---|---|---|
| **Top App Bar Shell** | `[VERIFIED]` | [src/App.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/App.vue#L3-L98) | SAD A 16.4 | `02` s.d. `30` (Navbar HTML) | Terbukti diimplementasikan sebagai top bar di `App.vue` dengan seleksi menu berbasis `authStore.hasRole`. |
| **Role Normalization Alias** | `[VERIFIED]` | [src/stores/auth.store.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores/auth.store.ts#L25-L35) | SAD A 16.4 | None (Backend-Frontend bridge) | Memetakan alias peran ganda: 'Head' <-> 'Head_Dept', 'CEO_Management' <-> 'CEO_Director' agar kompatibel dengan guard router. |
| **Double Submit CSRF Cookie** | `[VERIFIED]` | [src/api/client.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/client.ts#L43-L52) | SAD A 8.5 | None (Security layer) | Client membaca cookie `csrf_token` dan menyematkan header `X-CSRF-Token` pada seluruh request mutasi. |
| **Mandatory Password Reset** | `[VERIFIED]` | [src/router/guards.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/router/guards.ts#L36-L45) | PRD FR-01, SAD A 17.2 | `01-login.html` (View 2) | Terbukti ditegakkan: Jika `mustResetPassword = true`, seluruh rute dibelokkan paksa ke `/reset-password`. |
| **Zero-Commitment Submission** | `[VERIFIED]` | [src/pages/MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue#L680) | PRD US-01, PDD G3 | `02-morning-commitment.html` (Menolak zero-commitment) | **[CONFLICTING DENGAN PROTOTYPE LAMA]**: Prototipe lama mendisable tombol simpan jika kosong. Spesifikasi final dan kode aktual mengizinkan zero-commitment beralasan valid. |
| **Carry-Forward Collection** | `[VERIFIED]` | [src/pages/MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue#L85-L125) | PRD US-01, BR-02, SAD A 16.4 | `02-morning-commitment.html` (Auto draft form) | Ditampilkan sebagai koleksi di `DraftBanner` dengan batas kuota 3 slot komitmen. Tidak ada auto-submit tanpa izin. |
| **Status Suggestion Heuristic**| `[VERIFIED]` | [src/components/self-service/ValidationPromptModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/self-service/ValidationPromptModal.vue) | PDD G2, Design 04 Sec 4 | `04-eod.html` (Modal suggestion) | Dialog memberikan bobot visual seimbang antara mempertahankan pilihan pengguna vs menerima saran sistem. |
| **Blocker Lifecycle Authority**| `[VERIFIED]` | [src/components/management/BlockerActionModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/BlockerActionModal.vue) | PRD US-09, SAD 8.2 | `10-blocker-detail.html` (Aksi terbuka semua) | **[CONFLICTING DENGAN PROTOTYPE LAMA]**: Prototipe lama menampilkan semua tombol aksi. Kode aktual menyembunyikan tombol di luar hak peran pengguna aktif. |
| **Objection Window Countdown** | `[VERIFIED]` | [src/components/shared/ObjectionWindowIndicator.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/ObjectionWindowIndicator.vue) | PRD US-19, Design 04 Sec 4 | `12-correction-leave-review.html` | Menggunakan JetBrains Mono dan timer hitung mundur 48 jam yang memicu event `expired`. |
| **Separate Status Languages** | `[VERIFIED]` | [src/styles/tokens.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/styles/tokens.ts#L22-L65) | Design System v1.1 Sec 1 | `02`, `04`, `05` (Badge visual) | Daily Status (filled pill + dot) dan Submission Timing (outlined pill + icon) didefinisikan secara mandiri tanpa pencampuran. |
| **11 Kategori Kebijakan** | `[VERIFIED]` | [src/pages/PolicySettingsPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/PolicySettingsPage.vue#L22-L75) | SAD A 5.9, A 10.9 | `26-policy-settings.html` (7 Kategori) | **[CONFLICTING DENGAN PROTOTYPE LAMA]**: Prototipe awal hanya menampilkan 7 kategori; kode aktual mengimplementasikan 11 kategori sesuai enum backend `PolicyCategory`. |
| **Web Push Browser Gateway** | `[PROTOTYPE_ONLY]` | [src/components/admin/AdminNotificationSetupTab.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/admin/AdminNotificationSetupTab.vue) | PRD US-20, Known-Limitations | `30-notification-setup.html` | UI switch tersedia di frontend, namun Service Worker push registration masih memerlukan konfigurasi VAPID browser publik. |
| **Batas Waktu Dokumen Sakit** | `[INFERRED]` | [src/pages/MyLeaveRequestPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyLeaveRequestPage.vue) | PRD US-21 | `13-my-leave-request.html` | Diinferensikan bahwa dokumen dapat diunggah susulan hingga batas cuti berakhir dengan status *Document Pending*. |
| **Format Ekspor Excel (.xlsx)** | `[CONFLICTING]` | [src/components/shared/ExportButton.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/ExportButton.vue) | OpenAPI `/reports/{type}/export` | `25-reports.html` (Tombol Excel) | Prototipe menampilkan tombol Excel, namun backend OpenAPI mengembalikan streaming CSV (`text/csv`). |
