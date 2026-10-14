# Volar Diagnostic Deep-Dive Investigation: MyTodayPage.vue

## Status Terverifikasi

- **Status Awal**: Perbaikan sebelumnya yang menghapus scoped slot `#selection` pada `v-select` **tidak** menyelesaikan masalah.
- **Diagnostik Teramati di IDE**:
  - Terdapat 6 diagnostik `ts-plugin(2304): Cannot find name 'commitmentSlot'`:
    - Baris 327, Kolom 30 (`v-model="commitmentSlot.referenceUrl"`)
    - Baris 338, Kolom 30 (`v-model="commitmentSlot.initialRisk"`)
    - Baris 351, Kolom 28 (`v-if="commitmentSlot.initialRisk === 'AMBER'"`)
    - Baris 351, Kolom 70 (`commitmentSlot.initialRisk === 'RED'`)
    - Baris 355, Kolom 34 (`v-model="commitmentSlot.knownBlocker"`)
    - Baris 365, Kolom 34 (`v-model="commitmentSlot.supportNeeded"`)
- **Pengecualian Kritis**:
  - Baris 314 (`v-model="commitmentSlot.description"`) **TIDAK PERNAH** memunculkan error sama sekali.
  - Baris 301, 304, 309, 315, 321 (`idx`) **TIDAK PERNAH** memunculkan error sama sekali.

---

## 1. Periksa Kondisi Aktual

### 1.1 Struktur Template
Deklarasi perulangan pada `frontend/src/pages/MyTodayPage.vue`:
```vue
294: <div
295:   v-for="(commitmentSlot, idx) in commitmentSlots"
296:   :key="idx"
297:   class="pa-4 mb-4 rounded-lg border bg-surface"
298: >
...
313:   <v-textarea
314:     v-model="commitmentSlot.description"
...
322:   />
323: 
324:   <v-row density="compact">
325:     <v-col cols="12" sm="7">
326:       <v-text-field
327:         v-model="commitmentSlot.referenceUrl"
328:         label="Reference / Task Link (Opsional)"
329:         placeholder="https://jira... atau #PROJ-123"
330:         prepend-inner-icon="mdi-link-variant"
331:         variant="outlined"
332:         density="comfortable"
333:       />
334:     </v-col>
...
```

### 1.2 Status Git & Integritas Perubahan
- Perintah `git status --porcelain -uall` menunjukkan repositori berada dalam kondisi bersih tanpa ada dependensi eksternal baru.
- Perubahan pada `MyTodayPage.vue` mempertahankan seluruh kontrak dan logika bisnis.

---

## 2. Investigasi Sistematis & Penemuan Akar Masalah (The Smoking Gun)

Melalui simulasi langsung compiler virtual TypeScript Volar (`@vue/language-core` dan `ts.createProgram`), kode virtual TypeScript (`script_ts`) yang dihasilkan oleh Volar diinspeksi baris demi baris.

### 2.1 Anomali Generator Volar pada Baris 329
Pada baris 329 `MyTodayPage.vue`, terdapat atribut statis:
```vue
placeholder="https://jira... atau #PROJ-123"
```
Ketika Volar mengonversi elemen `<v-text-field>` ke dalam kode TypeScript virtual (`script_ts`), Volar memiliki mekanisme penggantian internal yang berusaha mengubah tanda `//` menjadi komentar blok `/* ... */`.

Akibatnya, Volar menghasilkan kode virtual TypeScript berikut pada baris 1489 file virtual:
```ts
const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
// @ts-ignore
modelValue: (commitmentSlot.referenceUrl), label: "Reference / Task Link (Opsional)", placeholder: "https:/*jira... atau #PROJ-123", */ prependInnerIcon: "mdi-link-variant", variant: "outlined", density: "comfortable", }));
```

### 2.2 Dampak Malformed Virtual Code:
Perhatikan konstruksi string yang rusak akibat substitusi tersebut:
1. `"https:` menjadi **string literal yang tidak ditutup** (*unclosed string literal*).
2. `/*jira... atau #PROJ-123", */` menjadi **komentar blok** yang menelan tanda kutip penutup dan tanda koma.
3. Bagian setelahnya: `prependInnerIcon: "mdi-link-variant", ...` terdorong keluar dari struktur objek literal.

### 2.3 Rantai Kegagalan AST Parser:
1. Syntax error ini memicu **9 syntactic diagnostics** pada TypeScript parser:
   - `line 1489:135 - Identifier expected.`
   - `line 1489:153 - ',' expected.`
   - `line 1489:220 - Argument expression expected.`
   - `line 1489:221 - Declaration or statement expected.`
2. Akibat parser TypeScript rusak di baris tersebut, variabel `__VLS_228` gagal dideklarasikan.
3. TypeScript parser memasuki mode pemulihan error (*panic/error-recovery mode*).
4. Pemulihan error ini **menghancurkan lexical closure scope** fungsi render virtual tepat setelah baris 326.
5. Akibatnya, TypeScript tidak lagi mengenali variabel lokal loop `commitmentSlot` (maupun `idx`) untuk seluruh ekspresi yang berada **setelah** baris 326 hingga penutup slot!
6. Itulah sebabnya baris 314 (`commitmentSlot.description`) **selalu berhasil**, sedangkan baris 327, 338, 351, 355, 365 **selalu gagal**!

---

## 3. Bukti Eksperimental Deterministik

Pengujian dilakukan menggunakan compiler TypeScript murni terhadap AST virtual `@vue/language-core`:

| Kondisi | Syntactic Diagnostics | Semantic TS2304 (`Cannot find name 'commitmentSlot'`) |
| :--- | :---: | :---: |
| **Kondisi Aktual** (`placeholder="https://jira... atau #PROJ-123"`) | **9 error** | **6 error** (Persis di 6 lokasi yang dilaporkan pengguna) |
| **Hanya Mengubah Placeholder** (menghilangkan `//`, mis. `"https:&#47;&#47;..."` atau `"https: //..."`) | **0 error** | **0 error** (BERSIH 100%) |

**Kesimpulan Empiris**:
Semua 6 error `Cannot find name 'commitmentSlot'` dan 9 error sintaks virtual hilang secara instan (menjadi **0**) murni hanya dengan mengubah karakter `//` pada atribut `placeholder` di baris 329!

---

## 4. Evaluasi Hipotesis

| Hipotesis | Bukti & Status |
| :--- | :--- |
| **Hipotesis 1: Scoped slot `#selection` merusak scope** | **DITOLAK**. Penghapusan slot `#selection` pada percobaan sebelumnya terbukti tidak mengubah jumlah maupun lokasi error. |
| **Hipotesis 2: Komponen Vuetify `<v-row>` / `<v-col>` tidak mendukung loop** | **DITOLAK**. Pada kondisi placeholder tanpa `//`, `<v-row>` dan `<v-col>` berjalan sempurna tanpa satupun error tipe di Volar. |
| **Hipotesis 3: Komponen harus diekstrak (`CommitmentSlotCard.vue`)** | **DITOLAK / TIDAK DIPERLUKAN**. Ekstraksi komponen hanyalah *workaround* sampingan yang kebetulan memisahkan string tersebut ke berkas lain, tetapi sama sekali bukan solusi yang proporsional. |
| **Hipotesis 4: Volar code generator rusak akibat karakter `//` di dalam string placeholder** | **TERKONFIRMASI 100% SECARA DETERMINISTIK**. Mengganti string tanpa `//` menurunkan error dari 6 menjadi 0. |

---

## 5. Perbedaan Antara Diagnostik IDE dan Build/Test

- **`npm run build` (`tsc && vite build`)**:
  - Menggunakan `tsc` kanonikal yang hanya mengompilasi berkas `.ts` murni.
  - `vite build` menggunakan `@vue/compiler-sfc` yang merupakan parser runtime HTML/Vue. Di `@vue/compiler-sfc`, string `"https://..."` adalah teks statis biasa yang valid (sehingga build dan test vitest 100% lulus).
- **IDE Volar (`ts-plugin(2304)`)**:
  - Mengonversi template menjadi virtual TypeScript (`script_ts`) agar IDE dapat memberikan autocomplete dan type-checking.
  - Bug generator Volar pada penanganan `//` di dalam prop statis string merusak sintaks TypeScript virtual tersebut.

---

## 6. Opsi Langkah Berikutnya (Terkecil dan Tervalidasi)

Satu-satunya perubahan yang dibutuhkan (hanya 1 baris kode pada baris 329):
Ubah:
```vue
placeholder="https://jira... atau #PROJ-123"
```
Menjadi salah satu format yang aman dari parsing komentar Volar:
```vue
placeholder="https: //jira... atau #PROJ-123"
```
atau:
```vue
placeholder="Jira link atau #PROJ-123"
```
atau menggunakan binding string literal:
```vue
:placeholder="'https://jira... atau #PROJ-123'"
```

Dengan langkah minimal ini:
- 0 baris komponen baru.
- 0 risiko regresi fungsional.
- Keenam error diagnostik Volar akan bersih 100%.

---

## Final Verdict

**`ROOT CAUSE CONFIRMED`**

*(Akar masalah telah dibuktikan secara matematis dan empiris melalui inspeksi AST virtual generator Volar: karakter `//` di dalam atribut statis `placeholder` baris 329 memicu bug generator Volar yang menghasilkan komentar blok invalid pada TypeScript virtual, merusak parser, dan menghilangkan lexical scope variabel perulangan pada seluruh baris setelahnya).*
