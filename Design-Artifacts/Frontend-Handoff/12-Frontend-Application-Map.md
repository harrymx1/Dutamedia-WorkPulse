# 12 — Frontend Application Map & Architecture Grounding
## Grounded Architecture, Shell, Routing, and Shared Infrastructure

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-12 |
| **Versi** | 1.0.0 (GROUNDED REPOSITORY AUDIT) |
| **Tanggal Audit** | 11 Oktober 2026 |
| **Workspace Target** | `frontend/src/` |
| **Basis Bukti Kode** | `main.ts`, `App.vue`, `router/`, `stores/`, `plugins/`, `api/`, `queries/` |
| **Klasifikasi Bukti** | **VERIFIED IN SOURCE CODE** |

---

## 1. Application Entry Point & Bootstrap Sequence

Aplikasi WorkPulse di-bootstrap secara terprogram melalui berkas [frontend/src/main.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/main.ts) dan di-host oleh template HTML [frontend/index.html](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/index.html).

### Urutan Inisialisasi Runtime:
```typescript
// frontend/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from './router/index.js';
import { vuetify } from './plugins/vuetify.js';
import { vueQueryOptions } from './plugins/vue-query.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);                         // 1. Client State Management
app.use(VueQueryPlugin, vueQueryOptions); // 2. Server State & Caching Engine
app.use(router);                        // 3. SPA Route Navigation & Guards
app.use(vuetify);                       // 4. UI Component Framework & Theme

app.mount('#app');                      // 5. Mount ke DOM #app
```

### Bukti Konfigurasi Plugin:
1. **Pinia** ([frontend/src/stores/](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores)):
   - `auth.store.ts`: Mengelola sesi autentikasi pengguna, token, data user, dan kontrol otorisasi RBAC (`hasRole`).
   - `ui.store.ts`: Mengelola state UI murni sisi client (sidebar/drawer, active filter dictionary, dan global toast notifications).
2. **Vue Query** ([frontend/src/plugins/vue-query.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/plugins/vue-query.ts)):
   - Mengonfigurasi `QueryClient` dengan `staleTime: 60_000` (1 menit) dan `refetchOnWindowFocus: false`.
   - Mengatur mutasi dengan `retry: 0` untuk mencegah mutasi ganda pada aksi transaksi.
3. **Vuetify 3** ([frontend/src/plugins/vuetify.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/plugins/vuetify.ts)):
   - Mendaftarkan icon set MDI (`@mdi/font/css/materialdesignicons.css`).
   - Mengonfigurasi tema `light` yang memetakan warna Vuetify (`background`, `surface`, `primary`, `secondary`, `error`) ke nilai resmi di [frontend/src/styles/tokens.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/styles/tokens.ts).
   - Menetapkan `defaults` untuk komponen inti: `VBtn` (rounded 'lg', elevation 0), `VCard` (rounded 'lg', elevation 0), `VTextField` (outlined, comfortable), `VSelect` (outlined, comfortable).

---

## 2. Root Application Shell & Navigation ([src/App.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/App.vue))

WorkPulse tidak menggunakan layout wrapper terpisah bertingkat; seluruh arsitektur shell aplikasi disatukan secara elegan langsung di dalam [App.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/App.vue):

### Struktur Anatomi [App.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/App.vue):
- **`<v-app>`**: Kontainer induk Vuetify Single Page Application.
- **`<v-app-bar>` (Top Navigation Bar)**:
  - Dikontrol oleh computed `showNavigation`: Hanya dirender jika `authStore.isAuthenticated` bernilai `true` dan bukan berada pada rute publik (`/login` atau `/reset-password`).
  - **Brand Title**: Logo `mdi-pulse` dan teks "WorkPulse" yang terhubung ke `/today`.
  - **Menu Navigasi Desktop (`d-none d-md-flex`)**:
    - `My Today` (`/today`) — Tampil untuk semua pengguna.
    - `History` (`/history`) — Tampil untuk semua pengguna.
    - `Team` (`/team`) — Dikontrol oleh `authStore.hasRole(['Supervisor_TL', 'Head_Dept', 'CEO_Director', 'SystemAdmin'])`.
    - `Function` (`/function`) — Dikontrol oleh `authStore.hasRole(['Head_Dept', 'CEO_Director', 'SystemAdmin'])`.
    - `Compliance` (`/compliance`) — Dikontrol oleh `authStore.hasRole(['HRGA', 'CEO_Director', 'SystemAdmin'])`.
    - `Management` (`/management`) — Dikontrol oleh `authStore.hasRole(['CEO_Director', 'SystemAdmin'])`.
    - `Reports` (`/reports`) — Dikontrol oleh `authStore.hasRole(['Supervisor_TL', 'Head_Dept', 'HRGA', 'CEO_Director', 'SystemAdmin'])`.
    - `Admin` (`/admin/users`) — Dikontrol oleh `authStore.hasRole(['SystemAdmin'])`.
  - **Notification Bell**: Mengimpor dan merender komponen [NotificationBell.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/shared/NotificationBell.vue) yang menampilkan badge live jumlah unread notifikasi.
  - **User Avatar Menu (`v-menu`)**:
    - Menampilkan inisial email dalam `v-avatar` dan teks NIK/Role.
    - Dropdown navigasi: `Profil` (`/profile`), `Policy Settings` (`/policy-settings`), dan aksi `Keluar` (`handleLogout`).
- **`<v-main>`**:
  - Mewadahi `<router-view />` untuk me-render komponen tingkat rute aktif secara dinamis.
- **Global Toast Host (`<v-snackbar>`)**:
  - Loop `v-for="toast in uiStore.toasts"` yang merender snackbar di posisi `top right` dengan penutupan otomatis (`uiStore.dismissToast`).

---

## 3. Router Configuration & Security Guards

Rute didefinisikan pada [src/router/index.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/router/index.ts) dan diamankan oleh [src/router/guards.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/router/guards.ts).

### Aturan Guard Navigasi ([src/router/guards.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/router/guards.ts)):
1. **Sesi Bootstrap Awal**:
   Jika `!authStore.isInitialized`, router guard memanggil `await authStore.fetchMe()` untuk memeriksa apakah cookie sesi HttpOnly aktif di browser.
2. **Pencegahan Akses Tak Terautentikasi**:
   Jika rute membutuhkan autentikasi (`meta.requiresAuth !== false`) dan pengguna belum login, arahkan ke `/login?redirect=${fullPath}`.
3. **Penegakan Ubah Sandi Paksa (Mandatory Reset-Password Enforcement)**:
   Sesuai SAD A 17.2: Jika `authStore.mustResetPassword` bernilai `true`, seluruh navigasi dialihkan paksa ke `/reset-password`. Pengguna dilarang mengakses halaman operasional apa pun sebelum memperbarui sandi.
   Sebaliknya, jika `!authStore.mustResetPassword`, akses ke `/reset-password` dialihkan kembali ke beranda peran.
4. **Pengalihan Beranda Berbasis Peran (Dynamic Root Redirect)**:
   Akses ke rute akar `/` atau rute `/login` saat sudah terautentikasi dialihkan:
   - Jika memiliki peran `Supervisor_TL` -> dialihkan ke `/team`.
   - Untuk karyawan/staf lain -> dialihkan ke `/today`.
5. **Role-Based Access Control (RBAC)**:
   Jika rute mendefinisikan `meta.roles`, guard memvalidasi apakah pengguna memiliki salah satu dari peran yang diizinkan menggunakan `authStore.hasRole(allowedRoles)`. Jika tidak berhak, navigasi dibelokkan ke beranda default pengguna.
6. **Penanganan 401 Global Interceptor**:
   `guards.ts` mendaftarkan callback ke [api/client.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/client.ts) via `registerUnauthorizedHandler`. Ketika backend merespons 401, sesi di-reset dan browser dialihkan ke `/login`.

---

## 4. Infrastruktur Komunikasi API & Keamanan

### A. HTTP Client ([src/api/client.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/client.ts))
- **Base URL**: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'`.
- **Kredensial Sesi**: Menggunakan `credentials: 'include'` untuk mendukung cross-origin HttpOnly Cookie authentication (SAD A 16.2).
- **Double Submit Cookie CSRF Defense**: Untuk seluruh metode mutasi (`POST`, `PUT`, `PATCH`, `DELETE`), client membaca cookie `csrf_token` via `getCookie('csrf_token')` dan menyematkannya ke header permintaan `X-CSRF-Token` (SAD A 8.5).
- **Normalisasi Error**: Melempar objek terstruktur [ApiError](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/types/api.ts) (`status`, `code`, `message`, `details`).

### B. Penanganan Kesalahan Ramah Pengguna ([src/composables/useApiError.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/composables/useApiError.ts))
Composable `useApiError` menyediakan kamus penerjemahan kode error backend NestJS ke pesan bahasa Indonesia yang mudah dipahami pengguna:
- `RECORD_LOCKED` -> "Catatan telah terkunci setelah batas waktu cut-off."
- `DUPLICATE_COMMITMENT` -> "Komitmen serupa telah tercatat untuk hari ini."
- `INVALID_CUTOFF_WINDOW` -> "Pengisian berada di luar jendela waktu yang ditentukan."
- `OBJECTION_WINDOW_EXPIRED` -> "Batas waktu sanggahan 48 jam telah berakhir."
- `UNAUTHORIZED_REVIEWER` -> "Anda tidak memiliki wewenang peninjau untuk scope ini."

---

## 5. Hubungan State Server vs State Client

| Kategori State | Pengelola State | Bukti Berkas Implementasi | Contoh Data |
|---|---|---|---|
| **Sesi Pengguna & Otoritas** | Pinia Store | [src/stores/auth.store.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores/auth.store.ts) | `user`, `role`, `mustResetPassword`, `isAuthenticated` |
| **State UI Temporer Client** | Pinia Store | [src/stores/ui.store.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/stores/ui.store.ts) | `sidebarCollapsed`, `toasts[]`, `activeFilters` |
| **Data Akuntabilitas Harian** | TanStack Query | [src/queries/useDailyRecords.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useDailyRecords.ts) | `['daily', 'today']`, `['daily', 'records']` |
| **Siklus Hidup Blocker** | TanStack Query | [src/queries/useBlockers.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useBlockers.ts) | `['blockers', 'list']`, `['blockers', id]` |
| **Sanggahan Koreksi** | TanStack Query | [src/queries/useCorrectionRequests.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useCorrectionRequests.ts) | `['corrections', 'list']` |
| **Pengecualian & Cuti** | TanStack Query | [src/queries/useExceptions.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useExceptions.ts) | `['exceptions', 'list']` |
| **Pelanggaran Kepatuhan** | TanStack Query | [src/queries/useCompliance.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useCompliance.ts) | `['compliance', 'events']` |
| **Parameter Kebijakan** | TanStack Query | [src/queries/usePolicies.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/usePolicies.ts) | `['policies', 'active']` |
| **Laporan & Ekspor** | TanStack Query | [src/queries/useReporting.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useReporting.ts) | `['reporting', type, params]` |
| **Master Pengguna & Mapping** | TanStack Query | [src/queries/useUsers.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useUsers.ts) | `['users', 'list']`, `['users', id]` |

**Prinsip Arsitektural Terkonfirmasi**: Tidak ada cache data server yang diduplikasi ke dalam Pinia store. Seluruh data domain diambil, dicache, dan dimutasi menggunakan TanStack Query.
