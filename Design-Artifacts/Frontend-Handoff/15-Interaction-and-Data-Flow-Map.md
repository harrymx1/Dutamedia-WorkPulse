# 15 — Interaction and Data Flow Map
## End-to-End Tracing: User Action to API Mutation and UI Updates

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-15 |
| **Versi** | 1.0.0 (GROUNDED REPOSITORY AUDIT) |
| **Tanggal Audit** | 11 Oktober 2026 |
| **Pola Alur** | `User Action → Event Handler → Validation → State/Mutation → API Request → Response Handling → UI Update` |
| **Basis Bukti Kode** | Implementasi fungsi aktual di `src/pages/`, `src/queries/`, `src/api/`, dan `src/stores/` |

---

## 1. Alur Interaksi Kritis End-to-End

Berikut adalah pelacakan terperinci langkah-demi-langkah dari aksi pengguna hingga pembaruan UI untuk 8 alur interaksi terpenting di WorkPulse:

### 1.1 Alur Autentikasi Pengguna (Login)
- **Aksi Pengguna**: Mengisi email dan password, lalu mengklik tombol "Masuk ke Sistem" pada [LoginPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/LoginPage.vue).
- **Event Handler**: `@click="handleLogin"` atau `@submit.prevent="handleLogin"` di [LoginPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/LoginPage.vue#L32).
- **Validasi Client**: Pengecekan `!email.value || !password.value`. Jika kosong, set `errorMessage.value = 'Email dan password wajib diisi'`.
- **State / Mutation Call**: Memanggil `authStore.login({ email: email.value, password: password.value })` di [src/stores/auth.store.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores/auth.store.ts#L64).
- **API Request**: `POST /api/v1/auth/login` melalui [src/api/auth.api.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/auth.api.ts) via [apiClient.post](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/client.ts).
- **Response Handling**:
  - Backend menetapkan HttpOnly Cookie sesi dan mengembalikan `response.data.user`.
  - `authStore.user.value = response.data.user` dan `authStore.isInitialized.value = true`.
- **Pembaruan UI & Navigasi**:
  - Jika `user.mustResetPassword === true`: `router.push('/reset-password')`.
  - Jika normal: `router.push(authStore.hasRole('Supervisor_TL') ? '/team' : '/today')`.
  - Navbar di [App.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/App.vue) beralih aktif (`showNavigation = true`) menampilkan inisial avatar pengguna.

### 1.2 Alur Morning Commitment Check-in
- **Aksi Pengguna**: Mengetik komitmen (slot 1 s.d. 3) atau mencentang opsi Zero Commitment, memilih Initial Risk (GREEN/AMBER/RED), lalu mengklik "Simpan Komitmen".
- **Event Handler**: `@click="submitMorningCommitment"` di [MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue#L680).
- **Validasi Client**:
  - Memeriksa batas kuota (`MAX_DAILY_COMMITMENTS = 3`).
  - Jika Zero Commitment dicentang: memvalidasi bahwa `zeroCommitmentReason.value` minimal 10 karakter.
  - Jika komitmen reguler: memastikan minimal 1 komitmen terisi dan memiliki teks deskripsi.
- **State / Mutation Call**: Memanggil `morningMutation.mutateAsync(payload)` dari [src/queries/useDailyRecords.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useDailyRecords.ts#L32).
- **API Request**: `POST /api/v1/daily-accountability-records/morning-checkin` membawa payload `MorningCommitmentInput`.
- **Response Handling**:
  - TanStack Query memicu `queryClient.invalidateQueries({ queryKey: ['daily', 'today'] })`.
  - Menampilkan notifikasi sukses via `uiStore.showToast('Komitmen pagi berhasil disimpan', 'success')`.
- **Pembaruan UI**: Form beralih dari state editable ke read-only (*locked baseline*), badge `SubmissionTimingBadge` menampilkan `On-Time` atau `Late`, dan Section 2 (Pekerjaan Ad-hoc) terbuka.

### 1.3 Alur Konfirmasi Draft Carry-Forward
- **Aksi Pengguna**: Mengklik tombol "Gunakan Draft" pada item di dalam `DraftBanner` di [MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue).
- **Event Handler**: `@click="applyDraft(item)"` di [MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue).
- **Validasi Client**: Memeriksa `remainingCommitmentCapacity > 0`. Jika kapasitas komitmen sudah 3/3, tampilkan `isMaxCapacityReached = true` alert.
- **State Update**: Menyalin deskripsi dan project reference dari `item` ke slot komitmen kosong pertama di form lokal. Item dihapus dari daftar draft yang belum terpakai.
- **API Request**: Tidak ada API request langsung (Client-side drafting). Permintaan API baru terjadi saat pengguna mengklik "Simpan Komitmen".
- **Pembaruan UI**: Slot input komitmen terisi, sisa kuota draft diperbarui, dan peringatan kapasitas dievaluasi ulang.

### 1.4 Alur Penambahan Pekerjaan Ad-hoc (Additional Work)
- **Aksi Pengguna**: Mengklik tombol "Tambah Pekerjaan Ad-hoc" di `/today`, mengisi formulir modal, dan mengklik "Simpan Pekerjaan".
- **Event Handler**:
  - Trigger: `@click="showAdditionalWorkModal = true"`.
  - Submit: `@submit="handleSaveAdditionalWork"` di [AdditionalWorkModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/self-service/AdditionalWorkModal.vue).
- **Validasi Client**: Deskripsi wajib diisi (minimal 5 karakter) dan initial risk wajib dipilih.
- **State / Mutation Call**: Memanggil `additionalWorkMutation.mutateAsync({ dailyRecordId, description, initialRisk, taskReference })`.
- **API Request**: `POST /api/v1/additional-work` via [api/daily-records.api.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/daily-records.api.ts).
- **Response Handling**: Invalidate query `['daily', 'today']`, modal ditutup (`modelValue = false`), toast sukses ditampilkan.
- **Pembaruan UI**: Item tugas ad-hoc muncul di tabel tugas hari ini dengan penanda tag `AdditionalWorkTag`.

### 1.5 Alur Pelaporan Kendala Seketika (Raise Instant Blocker)
- **Aksi Pengguna**: Mengklik tombol "Raise Instant Blocker" di header navbar atau halaman `/today`, mengisi form, dan mengklik "Kirim Laporan Kendala".
- **Event Handler**: `openInstantBlocker` -> `showRaiseBlockerModal = true` -> `submitBlocker` di [RaiseBlockerModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/self-service/RaiseBlockerModal.vue).
- **Validasi Client**: Deskripsi minimal 10 karakter, severity dipilih (Low/Medium/High/Critical), supportNeeded dipilih ('Org' atau 'Project').
- **State / Mutation Call**: Memanggil `useRaiseBlockerMutation()` dari [src/queries/useBlockers.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useBlockers.ts).
- **API Request**: `POST /api/v1/blockers` via [api/blockers.api.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/blockers.api.ts).
- **Response Handling**: Invalidate `['blockers']` dan `['daily', 'today']`, tutup modal, tampilkan toast "Blocker berhasil dilaporkan".
- **Pembaruan UI**: Blocker baru langsung muncul di daftar kendala aktif dan antrean tim.

### 1.6 Alur EOD Outcome & Heuristik Status Suggestion Override
- **Aksi Pengguna**: Memilih Outcome (Achieved/Partial/Not Achieved) dan Continuation (Done/Continue) untuk setiap tugas, lalu mengklik "Kirim Hasil EOD".
- **Event Handler**: `submitEod` di [MyTodayPage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/MyTodayPage.vue).
- **Validasi Client**: Memastikan seluruh item komitmen dan pekerjaan ad-hoc telah memiliki outcomeStatus dan continuationStatus yang valid.
- **Evaluasi Heuristik (ADR-018)**:
  - Sistem menghitung `suggestedStatus`: Jika ada tugas ber-outcome Not Achieved -> `RED`; jika Partial -> `AMBER`; jika Achieved semua -> `GREEN`.
  - Jika pilihan manual user berbeda dari heuristik deterministik sistem: Sistem **TIDAK** mengubah diam-diam, melainkan memunculkan [ValidationPromptModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/self-service/ValidationPromptModal.vue).
- **State / Mutation Call**:
  - Jika selaras: `eodMutation.mutateAsync(payload)`.
  - Jika override: `confirmOverrideMutation.mutateAsync({ userSelectedStatus, overrideReason })`.
- **API Request**: `POST /api/v1/daily-accountability-records/{id}/eod-checkin` atau sub-endpoint `/confirm-override`.
- **Response Handling**: Invalidate `['daily', 'today']`, rekam ditutup penuh (`isClosed: true`).
- **Pembaruan UI**: Chip status akhir (`finalStatus`) diperbarui, badge "EOD Selesai" tampil, dan form terkunci.

### 1.7 Alur Transisi Siklus Hidup Blocker (Acknowledge & Resolve)
- **Aksi Pengguna**: Supervisor/Support Owner mengklik tombol aksi pada kartu blocker di `/team` [Tab 2], membuka [BlockerActionModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/BlockerActionModal.vue), memasukkan catatan penyelesaian, dan mengklik "Selesaikan Kendala".
- **Event Handler**: `handleAction` di [BlockerActionModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/management/BlockerActionModal.vue).
- **Validasi Client**: Catatan resolusi (`resolutionNote`) wajib diisi minimal 5 karakter untuk aksi `resolve`.
- **State / Mutation Call**: Memanggil `useResolveBlockerMutation()` dari [src/queries/useBlockers.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useBlockers.ts).
- **API Request**: `POST /api/v1/blockers/{id}/resolve` membawa `{ resolutionNote }`.
- **Response Handling**: Invalidate `['blockers']`, modal ditutup, toast sukses ditampilkan.
- **Pembaruan UI**: Status blocker di tabel berubah menjadi `Resolved`, tombol "Confirm Closed" terbuka khusus untuk reporter asli.

### 1.8 Alur Sanggahan Koreksi (Objection Window)
- **Aksi Pengguna**: Supervisor melihat pengajuan koreksi di `/team` [Tab 3] dengan chip countdown 48 jam, mengklik "Tolak", memasukkan alasan sanggahan, dan mengonfirmasi penolakan.
- **Event Handler**: `confirmObjectCorrection` di [TeamPulsePage.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/pages/TeamPulsePage.vue).
- **Validasi Client**: Alasan sanggahan (`objectionReason`) wajib diisi dan countdown `ObjectionWindowIndicator` belum kedaluwarsa (`!isExpired`).
- **State / Mutation Call**: Memanggil `useObjectCorrectionMutation()` dari [src/queries/useCorrectionRequests.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useCorrectionRequests.ts).
- **API Request**: `POST /api/v1/correction-requests/{id}/object` membawa `{ objectionReason }`.
- **Response Handling**: Invalidate `['corrections']`, dialog ditutup, toast penolakan sanggahan ditampilkan.
- **Pembaruan UI**: Status koreksi beralih menjadi `Rejected`, entri audit objection tercatat.

---

## 2. Pembedaan Perilaku Terimplementasi vs Mock / Desain

| Fitur / Alur Kerja | Status Implementasi Kode | Keterangan Verifikasi Repositori |
|---|---|---|
| **Login & Logout** | **FULLY IMPLEMENTED** | Terverifikasi dengan cookie credentials HttpOnly dan router guard. |
| **Morning Checkin & Zero Commitments** | **FULLY IMPLEMENTED** | Terverifikasi di `MyTodayPage.vue` dan mutasi API backend. |
| **Draft Carry-forward Application** | **FULLY IMPLEMENTED** | Terverifikasi dengan filter draft lokal dan penegakan batas 3 slot. |
| **Additional Work Ad-hoc** | **FULLY IMPLEMENTED** | Terverifikasi di `AdditionalWorkModal.vue` dan endpoint backend. |
| **Status Suggestion Heuristic & Override** | **FULLY IMPLEMENTED** | Terverifikasi di `ValidationPromptModal.vue` dengan dialog seimbang. |
| **Blocker Lifecycle (Ack, Resolve, Close)** | **FULLY IMPLEMENTED** | Terverifikasi di `BlockerActionModal.vue` dengan pengecekan peran. |
| **Correction Request & Objection Window** | **FULLY IMPLEMENTED** | Terverifikasi di `ObjectionWindowIndicator.vue` dan mutasi object. |
| **Export Reporting ke File Blob** | **FULLY IMPLEMENTED** | Terverifikasi di `ExportButton.vue` mengunduh stream CSV/Blob. |
| **Browser Push Web Notifications** | **PARTIAL / DESIGN STUB** | UI konfigurasi tersedia di Admin, namun Service Worker push registration masih memerlukan integrasi VAPID browser publik. |
