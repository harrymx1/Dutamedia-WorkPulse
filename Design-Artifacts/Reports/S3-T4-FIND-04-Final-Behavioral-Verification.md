# S3-T4-FIND-04 Final Behavioral Verification Report
## Deep-Dive Behavioral Verification: Error Masking vs Empty State in `useBlockerOwnersQuery`

- **Tanggal Verifikasi**: 2026-10-09
- **Auditor / Evaluator**: Antigravity AI Pair Programmer
- **Mode Tata Kelola**: STRICT READ-ONLY BEHAVIORAL AUDIT (Zero Code Modification)
- **Target Subjek**: `S3-T4-FIND-04` (`useBlockerOwnersQuery` pada `frontend/src/queries/useBlockers.ts` dan `RaiseBlockerModal.vue`)
- **Fokus Pemeriksaan**: Memastikan apakah penanganan HTTP 403 menyamarkan kegagalan API sebagai kondisi tanpa data (*error masking*).
- **Verdict Perilaku**: **FAIL — ERROR MASKING IDENTIFIED (API Failure Silently Converted to Empty State)**

---

## 1. File dan Baris Kode yang Relevan

### 1.1 Implementasi Hook Query
Pada [frontend/src/queries/useBlockers.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/queries/useBlockers.ts#L39-L64):
```typescript
39: export function useBlockerOwnersQuery() {
40:   return useQuery<BlockerOwnerOption[]>({
41:     queryKey: BLOCKER_KEYS.owners(),
42:     queryFn: async (): Promise<BlockerOwnerOption[]> => {
43:       try {
44:         const res = await blockersApi.getPotentialOwners();
45:         const data = res.data as any;
46:         if (Array.isArray(data)) {
47:           return data;
48:         }
49:         if (data?.items && Array.isArray(data.items)) {
50:           return data.items;
51:         }
52:         if (data?.users && Array.isArray(data.users)) {
53:           return data.users;
54:         }
55:         return [];
56:       } catch {
57:         // Jika peran pengguna tidak memiliki izin membaca seluruh master users (HTTP 403)
58:         // atau request gagal, kembalikan array kosong agar queryFn tidak pernah melempar undefined.
59:         return [];
60:       }
61:     },
62:     staleTime: 1000 * 60 * 5, // 5 menit
63:   });
64: }
```

### 1.2 Pemanggilan API Client
Pada [frontend/src/api/blockers.api.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/api/blockers.api.ts#L101-L107):
```typescript
101:   /**
102:    * GET /api/v1/users (untuk dropdown owner blocker)
103:    */
104:   async getPotentialOwners(): Promise<ApiResponse<{ items?: BlockerOwnerOption[]; users?: BlockerOwnerOption[] } | BlockerOwnerOption[]>> {
105:     return apiClient.get('/users?limit=100&status=Active');
106:   },
```

### 1.3 Pembatasan Otorisasi Backend
Pada [backend/src/modules/identity/identity.controller.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/backend/src/modules/identity/identity.controller.ts#L32-L38):
```typescript
32:   /**
33:    * GET /api/v1/users (SAD §10.2)
34:    */
35:   @Get('users')
36:   @RequireRole(Role.SystemAdmin, Role.HRGA)
37:   async getUsers(@Query() query: QueryUsersDto) {
38:     return this.identityService.getUsers(query);
39:   }
```

### 1.4 Komponen Konsumen Utama (`RaiseBlockerModal.vue`)
Pada [frontend/src/components/self-service/RaiseBlockerModal.vue](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/frontend/src/components/self-service/RaiseBlockerModal.vue#L90-L103) dan baris 227–250:
```html
90:   <v-autocomplete
91:     v-model="targetOwnerUserId"
92:     label="Pemilik Wewenang Tindak Lanjut (Owner Needed) *"
93:     :items="ownerOptions"
94:     item-title="fullName"
95:     item-value="id"
96:     variant="outlined"
97:     density="comfortable"
98:     prepend-inner-icon="mdi-account-search"
99:     :loading="isLoadingOwners"
100:    :rules="[rules.required]"
101:    class="mt-2 mb-3"
102:    data-testid="blocker-owner-select"
103:  >
```
```typescript
227: const rules = {
228:   required: (v: string) => !!v || 'Field ini wajib diisi',
229: };
231: const { data: owners, isLoading: isLoadingOwners } = useBlockerOwnersQuery();
232: const ownerOptions = computed<BlockerOwnerOption[]>(() => owners.value || []);
...
246: async function handleSubmit() {
247:   const { valid } = await formRef.value.validate();
248:   if (!valid) return;
```

---

## 2. Penelusuran Perilaku Antarmuka (UI Behavior Trace)

Berdasarkan arsitektur TanStack Query dan implementasi reaktif Vue pada `RaiseBlockerModal.vue`, berikut adalah penelusuran perilaku antarmuka untuk 4 skenario:

### Skenario 1: API Berhasil dengan Data (Role: SystemAdmin / HRGA)
- Endpoint `GET /api/v1/users` mengembalikan `HTTP 200 OK` dengan payload `{ items: [...] }`.
- `queryFn` mengekstrak `data.items` dan mengembalikan array berisi objek pengguna.
- `ownerOptions` berisi daftar nama, email, dan chip role.
- Pengguna dapat memilih salah satu entri pada autocomplete dropdown.
- **Hasil UI**: **Berfungsi Normal**.

### Skenario 2: API Berhasil tetapi Koleksi Kosong (Role: SystemAdmin / HRGA)
- Endpoint `GET /api/v1/users` mengembalikan `HTTP 200 OK` dengan `items: []`.
- `queryFn` mengembalikan `[]`.
- `ownerOptions` bernilai `[]`. Autocomplete menampilkan "No data available".
- Pengguna tidak dapat memilih entri, dan saat klik "Laporkan Blocker", validasi gagal dengan teks merah *"Field ini wajib diisi"*.
- **Hasil UI**: **Empty State Valid (namun form terblokir karena field required)**.

### Skenario 3: API Mengembalikan HTTP 403 Forbidden (Role: Employee / Supervisor / Head / PM)
- Ketika peran non-admin (seperti Employee) membuka modal untuk melaporkan blocker, `GET /api/v1/users` ditolak oleh backend dengan `HTTP 403 Forbidden` (`@RequireRole(Role.SystemAdmin, Role.HRGA)`).
- Axios client melempar error HTTP 403.
- Blok `try...catch` pada `useBlockerOwnersQuery` menangkap error tersebut dan mengeksekusi `return []`.
- **Dampak pada TanStack Query**:
  - Karena fungsi query menyelesaikan eksekusi tanpa melempar error (*swallowed rejection*), TanStack Query menganggap query **SUKSES**:
    - `isSuccess === true`
    - `isError === false`
    - `error === null`
- **Dampak pada UI**:
  - Dropdown `v-autocomplete` menampilkan daftar kosong ("No data available").
  - **TIDAK ADA indikasi bahwa terjadi penolakan izin (HTTP 403)**.
  - Pengguna mengira sistem tidak memiliki data karyawan, padahal pengguna sebenarnya ditolak aksesnya oleh API.
  - Karena field memiliki aturan `:rules="[rules.required]"`, formulir tidak dapat dikirim (*submission blocked*), dan pengguna tidak pernah diberi tahu alasan mengapa daftar pemilik wewenang kosong.
- **Hasil UI**: **API Failure Silently Converted to Empty State**.

### Skenario 4: API Mengalami Kegagalan Jaringan atau Server (HTTP 500 / Network Error)
- Jika backend down atau terjadi timeout jaringan, blok `catch` pada `useBlockerOwnersQuery` juga dieksekusi dan mengembalikan `[]`.
- Tidak ada indikasi kegagalan server, retry feedback, maupun pesan error.
- **Hasil UI**: **Server Failure Silently Masked as Empty State**.

---

## 3. Evaluasi Requirement dan Kontrak Produk

Apakah konversi HTTP 403 menjadi `[]` merupakan requirement produk yang terdokumentasi?

### 3.1 Penelusuran Dokumen Desain
1. **Design System & UI/UX Principles (`03-UI-UX Spec & Flow Document.md` §1 Prinsip ke-4)**:
   > *"No silent state change — Sistem tidak pernah mengubah pilihan/data user tanpa konfirmasi eksplisit... Default-approve ≠ tanpa kontrol."*
   Prinsip ini secara filosofis menolak kegagalan sistem yang ditutup-tutupi secara sunyi di balik layar.
2. **Product Requirements Document (`02-PRD.md` FR-19)**:
   > *"Owner Needed pada blocker dapat ditentukan melalui Organizational Authority atau Project Authority (contextual), sesuai konteks pekerjaan terkait."*
3. **Software Architecture Document (`05-SAD.md` §10.4 BlockerModule, Baris 1136)**:
   > `POST /api/v1/blockers` | **Semua role** | `{ linkedCommitmentId?, type, severity, impact, ownerNeededType, expectedResolution? }` | Blocker baru (`Open`) | **FR-15–FR-19, owner diresolusi backend**
4. **Backend Implementation (`blocker.service.ts` baris 121–127)**:
   Backend WorkPulse secara otomatis menyelesaikan pemilik blocker (*Owner Needed*) melalui `BlockerOwnerResolverService` berdasarkan `ownerNeededType` dan `relatedScopeReference`.

### 3.2 Kesimpulan Kontrak
- **TIDAK ADA SATUPUN REQUIREMENT ATAU DOKUMEN ARSITEKTUR** yang memerintahkan bahwa HTTP 403 pada pencarian user harus ditelan menjadi array kosong `[]`.
- Endpoint `GET /api/v1/users` memang sengaja dilindungi hanya untuk SystemAdmin dan HRGA (SAD §10.2).
- Pemanggilan `GET /api/v1/users` oleh komponen self-service karyawan (`RaiseBlockerModal.vue`) merupakan ketidaksesuaian arsitektural hulu (*frontend-backend contract mismatch*): frontend berusaha meminta pengguna memilih ID user secara manual, padahal kontrak backend dan SAD mensyaratkan owner diselesaikan secara kontekstual oleh backend.
- Penanganan `catch { return []; }` yang diterapkan pada S3-T4 semata-mata merupakan **workaround teknis lokal** untuk menghilangkan peringatan TanStack Query `Query data cannot be undefined`, bukan implementasi yang memenuhi spesifikasi bisnis.

---

## 4. Evaluasi Test Suite yang Relevan

Test yang diperiksa pada `frontend/tests/s3-t4-remediation.spec.ts`:
```typescript
it('FIND-04: useBlockerOwnersQuery mengembalikan array kosong [] (bukan undefined) ketika API mengembalikan HTTP 403 Forbidden', async () => {
  vi.spyOn(blockersApi, 'getPotentialOwners').mockRejectedValue({
    response: { status: 403, data: { message: 'Forbidden' } },
  });

  const query = app.runWithContext(() => useBlockerOwnersQuery());
  await query.refetch();

  expect(query.data.value).toBeDefined();
  expect(query.data.value).toEqual([]);
});
```

### Analisis Hasil Test:
- Test ini **LULUS (PASS)** pada level unit test hook TanStack Query.
- Namun, test ini hanya membuktikan bahwa fungsi `queryFn` tidak mengembalikan `undefined` ke TanStack Query.
- Test ini **TIDAK PERNAH menguji perilaku antarmuka pengguna (`RaiseBlockerModal.vue`)** ketika terjadi HTTP 403, dan tidak menguji apakah formulir dapat disubmit oleh karyawan biasa.

---

## 5. Perbandingan Bukti Source Inspection vs Bukti Runtime

| Aspek | Bukti Source Inspection | Bukti Runtime |
|---|---|---|
| **Eliminasi Console Warning** | Kode `catch { return []; }` secara eksplisit memastikan nilai balik bukan `undefined`. | Terbukti di konsol: warning TanStack Query `Query data cannot be undefined` hilang. |
| **Status Query TanStack** | Kode menelan exception tanpa melempar ulang (`throw`). | Query melaporkan `isSuccess: true` dan `isError: false` meskipun API gagal. |
| **Feedback UI Pengguna** | Template `RaiseBlockerModal.vue` tidak memiliki `v-alert` atau banner error untuk `isErrorOwners`. | Dropdown autocomplete kosong tanpa pesan kegagalan izin. |
| **Kelayakan Submit Form** | Field ditandai `:rules="[rules.required]"`. Submit dicegat oleh validasi. | Karyawan non-admin terblokir dan tidak dapat mengajukan blocker. |

---

## 6. Klasifikasi Perilaku

Perilaku saat ini secara tegas diklasifikasikan sebagai:

### **MENYEMBUNYIKAN KEGAGALAN API SEBAGAI EMPTY STATE**
*(Hides API failure as an empty state)*

### Rincian Alasan:
1. Menghilangkan warning teknis dengan menelan HTTP 403 menghasilkan efek samping di mana kegagalan otorisasi disamarkan seolah-olah data pengguna memang tidak ada di database.
2. Pengguna akhir (karyawan) tidak mendapatkan transparansi sistem mengenai mengapa dropdown kosong, dan tidak dapat menyelesaikan alur pengajuan blocker.
3. Ini melanggar prinsip desain *"No silent failures"* dan tidak didasari oleh requirement produk yang sah.

---

## 7. Rekomendasi Tindakan Berikutnya

Sesuai aturan tata kelola (read-only verification), **tidak ada perubahan kode yang dilakukan saat ini**.  
Rekomendasi tindakan teknis terstruktur untuk siklus pengembangan berikutnya:

1. **Penyelarasan Arsitektur Formulir Blocker (Solusi Jangka Panjang / Otoritatif)**:
   - Sesuaikan `RaiseBlockerModal.vue` dengan SAD §10.4 dan `CreateBlockerDto`: ganti input autocomplete user (`targetOwnerUserId`) dengan radio/select `ownerNeededType` (*Organizational Authority* vs *Project Authority*) dan input teks opsional `relatedScopeReference`.
   - Dengan pendekatan ini, karyawan tidak perlu memanggil `GET /api/v1/users`, dan resolusi owner diserahkan sepenuhnya ke backend.
2. **Penanganan Error Transparan pada Hook (Solusi Taktis)**:
   - Jika endpoint daftar wewenang tetap digunakan, jangan menelan error di `queryFn`. Biarkan TanStack Query merekam `isError: true`.
   - Di `RaiseBlockerModal.vue`, tampilkan pesan error yang jelas jika query gagal:  
     `"Gagal memuat pemilik wewenang (Akses ditolak / Server error)."` alih-alih menampilkan dropdown kosong yang membingungkan.

---

## 8. Final Behavioral Verdict

### **FAIL — ERROR MASKING IDENTIFIED**

*(Implementasi saat ini terbukti menyamarkan penolakan HTTP 403 dan kegagalan jaringan menjadi array kosong tanpa indikasi error pada antarmuka pengguna. Hal ini membungkam warning teknis TanStack Query, namun melanggar integritas perilaku produk dan menghalangi karyawan menyelesaikan pengajuan blocker).*
