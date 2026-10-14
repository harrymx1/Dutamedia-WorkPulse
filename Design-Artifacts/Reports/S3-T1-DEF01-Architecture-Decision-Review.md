# S3-T1 DEF-01 Architecture Decision Review

**System**: WorkPulse — Daily Accountability & Blocker Log System  
**Stage**: Stage S3 — Jalankan Sistem Sungguhan  
**Task**: S3-T1 DEF-01 Architecture Decision Review  
**Execution Timestamp**: 2026-10-07T15:15:00+07:00  
**Defect Reference**: `S3-T1-P2B1-DEF-01` (APPLICATION CONCURRENCY DEFECT — BLOCKING)  
**Reviewed Artifact**: `Design-Artifacts/Reports/S3-T1-DEF01-Remediation-Design.md`  
**Governing Documents**: `01-PDD.md`, `02-PRD.md`, `03-UI-UX Spec & Flow Document.md`, `05-SAD.md`, `08-ADR.md`, `09-Known-Limitations.md`, `10-S2-Audit-Findings-Register.md`, `S3-T1-Phase2B1-Independent-Verification.md`

---

## 1. Executive Verdict

| Evaluasi | Hasil Peninjauan | Keterangan |
|---|---|---|
| **Status Keputusan Arsitektur** | **APPROVED WITH CONDITIONS** | Desain Option C (Defense-in-Depth) secara fundamental kokoh dan tepat sasaran. Memerlukan penyesuaian batasan scope dan penanganan kondisi data eksisting sebelum implementasi. |
| **Business Invariant** | **CONFIRMED** | $\sum \text{Pending} \le 1$ per commitment didukung penuh oleh PRD, SAD, dan kode produksi. |
| **Database Enforcement** | **PASS** | PostgreSQL Partial Unique Index terbukti secara matematis dan fisik mencegah balapan konkuren. |
| **Transaction Boundary** | **PASS** | `createMaterialCorrection` telah mengisolasi insert dan audit dalam `$transaction`. |
| **Notification Scope** | **NOT REQUIRED (ALREADY POST-COMMIT)** | Kode produksi saat ini **sudah** mengeksekusi notifikasi pasca-commit transaksi. Scope tidak boleh diperluas. |
| **Existing-Data Safety** | **CONDITIONAL** | Database uji riil terbukti saat ini mengandung **2 komitmen dengan 4 baris duplikat Pending**. Migrasi wajib memiliki safety guard. |
| **Canonicalization Policy** | **UNDEFINED** | Dokumen sumber tidak mendefinisikan aturan pemeliharaan baris kanonikal jika terjadi duplikasi historis. |

---

## 2. Reviewed Proposal

Proposal yang ditinjau adalah **Option C (Defense-in-Depth)** dari dokumen `Design-Artifacts/Reports/S3-T1-DEF01-Remediation-Design.md`:
1. **Database Level**: Pembuatan PostgreSQL Partial Unique Index:
   ```sql
   CREATE UNIQUE INDEX unique_pending_correction_per_commitment 
   ON correction_requests ("targetCommitmentId") 
   WHERE status = 'Pending';
   ```
2. **Application Level**: Mempertahankan pre-check `findFirst` aplikasi untuk jalur cepat (fast-path user-friendly rejection), dan menambahkan penanganan error `P2002` (`PrismaClientKnownRequestError`) pada `CorrectionRequestService.createMaterialCorrection` untuk diterjemahkan menjadi domain `ConflictException` (HTTP 409).
3. **Audit & Notification**: Menjamin atomisitas mutasi bisnis dan jejak audit via `$transaction`, serta menjaga agar notifikasi hanya terkirim jika transaksi berhasil di-commit.

---

## 3. Business Invariant Verification

Berdasarkan tinjauan kritis terhadap seluruh artefak dan kode produksi:

| Sumber Otoritatif | Temuan / Bukti Lapangan | Evaluasi |
|---|---|---|
| **02-PRD.md** (FR-05, FR-43, FR-44, BR-16) | Morning Commitment terkunci sebagai baseline resmi. Perubahan material membuka Objection Window tunggal. Tidak ada konsep antrean ganda pada komitmen yang sama. | **VALID** |
| **03-UI-UX Spec** (§5.3, §16.6) | Antarmuka pengguna mengasumsikan kardinalitas 1:1 saat status Pending (tombol pengajuan koreksi dinonaktifkan/disembunyikan saat ada koreksi aktif). | **VALID** |
| **05-SAD.md** (§5.6, §9.6, §9.9) | - §5.6: Relasi `Commitment 1 — N CorrectionRequest` (Kardinalitas 1:N ada untuk mengakomodasi riwayat `Applied`/`Rejected` sepanjang masa).<br>- §9.6 & §9.9: State machine melarang transisi paralel dan mensyaratkan mitigasi konkurensi database. | **VALID & KONSISTEN** |
| **08-ADR.md** & **09-Known-Limitations.md** | Tidak ada ADR maupun Known Limitation yang mengizinkan atau menerima multiple active Pending correction requests sebagai *Accepted Risk*. | **VALID** |
| **Kode Produksi** (`CorrectionRequestService.ts` L109–120) | Kode produksi secara eksplisit mengecek: `if (existingPending) throw new ConflictException(...)`. | **INTENT TERBUKTI** |

**Kesimpulan Invarian**: Invarian $\sum \text{Pending} \le 1$ per komitmen adalah **CONFIRMED** dan merupakan aturan bisnis inti WorkPulse.

---

## 4. Database Enforcement Review

### 4.1 Mekanisme PostgreSQL Engine
PostgreSQL mengelola partial unique index melalui mekanisme penguncian tuple pada level B-tree index:
- Saat transaksi $T_1$ mengeksekusi `INSERT INTO correction_requests ... status = 'Pending'`, tuple index disisipkan.
- Jika transaksi konkuren $T_2$ secara simultan mengeksekusi `INSERT` dengan `targetCommitmentId` yang sama dan `status = 'Pending'`, B-tree insertion routine PostgreSQL mendeteksi kesamaan kunci.
- PostgreSQL memaksa $T_2$ untuk menunggu (*wait for transaction*) penyelesaian transaksi $T_1$.
- Saat $T_1$ melakukan `COMMIT`, $T_2$ langsung digugurkan dengan error:
  `ERROR: duplicate key value violates unique constraint "unique_pending_correction_per_commitment"` (`SQLSTATE 23505`).
- Jika $T_1$ melakukan `ROLLBACK`, $T_2$ diizinkan melanjutkan operasinya.

Pencegahan kondisi balapan ini terbukti **100% atomik dan fail-closed** di level storage engine, independen dari thread pool atau connection pool aplikasi.

### 4.2 Siklus Hidup Pelepasan Keunikan (Status Transitions)
Berdasarkan `backend/prisma/schema.prisma` (L91–95), enum `CorrectionStatus` hanya memiliki 3 nilai:
```prisma
enum CorrectionStatus {
  Applied
  Pending
  Rejected
}
```
- Transisi `Pending → Applied` terjadi di `evaluateExpiredObjectionWindows` (L624).
- Transisi `Pending → Rejected` terjadi di `objectCorrection` (L474).
- Pada model MVCC PostgreSQL, perubahan kolom `status` dari `Pending` ke `Applied` atau `Rejected` menyebabkan tuple versi baru **tidak lagi memenuhi predicate** `WHERE status = 'Pending'`.
- Akibatnya, entri indeks tersebut otomatis dilepaskan dari partial index.
- Komitmen yang sama di masa mendatang **seketika eligible** untuk menerima koreksi baru berstatus `Pending`.
- Tidak diperlukan pemicu (*trigger*) manual atau kompensasi aplikasi untuk merawat indeks.

---

## 5. Transaction Boundary Review

Pemeriksaan terhadap implementasi aktual [CorrectionRequestService.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/backend/src/modules/correction-request/services/correction-request.service.ts) menunjukkan sekuens aktual:

```text
createCorrectionRequest(user, dto)
  │
  ├─ 1. findUnique(Commitment) [NON-TRANSACTIONAL READ]
  ├─ 2. Validasi Ownership (employeeUserId === user.userId)
  ├─ 3. Validasi Lock State (isMorningLocked / isEodLocked)
  ├─ 4. Pre-Check: findFirst(CorrectionRequest Pending) [NON-TRANSACTIONAL READ]
  ├─ 5. Validasi Rule Kondisional & Hitung Snapshot Kebijakan
  ├─ 6. Klasifikasi Minor vs Material
  │
  └─ Branch:
       ├─ Minor: applyMinorCorrection()
       │    └─ this.prisma.$transaction(tx => {
       │         tx.commitment.update(...)
       │         tx.correctionRequest.create(Applied)
       │         auditService.record(tx)
       │       })
       │       └─ notificationService.dispatch() [POST-COMMIT]
       │
       └─ Material: createMaterialCorrection()
            └─ this.prisma.$transaction(tx => {
                 tx.correctionRequest.create(Pending)
                 auditService.record(tx)
               })
               └─ notificationService.dispatch() [POST-COMMIT]
```

### Evaluasi Batasan Transaksi:
1. Mutasi penyisipan record `CorrectionRequest` dan pencatatan `AuditLog` **telah terbungkus dalam `this.prisma.$transaction`** secara atomik di dalam `createMaterialCorrection`.
2. Jika terjadi kegagalan di dalam `$transaction` (misalnya constraint violation `P2002`), PostgreSQL me-rollback seluruh mutasi data koreksi dan log audit secara otomatis.
3. Yang belum ada saat ini adalah **blok penangkap error (catch handler) untuk menangkap `P2002`** dan menerjemahkannya menjadi `ConflictException`.

---

## 6. P2002 Handling Review

Ketika partial unique index dilanggar, PostgreSQL melemparkan kode error `23505`. Prisma Client menerjemahkan ini menjadi instance `PrismaClientKnownRequestError` dengan properti:
- `code`: `'P2002'`
- `meta`: Berisi informasi constraint/target.

### Pertimbangan Penanganan:
- **Tantangan Metadata**: Pada indeks parsial kustom yang dibuat via raw SQL migration (bukan anotasi `@unique` skema Prisma bawaan), `meta.target` pada Prisma Client dapat mengembalikan nama indeks (`unique_pending_correction_per_commitment`) alih-alih nama kolom `['targetCommitmentId']`.
- **Rekomendasi Pemetaan Aman**:
  Penanganan error tidak boleh mengandalkan pencocokan string kolom yang rapuh (*brittle string matching*). Karena dalam lingkup method `createMaterialCorrection`, satu-satunya constraint unik pada tabel `correction_requests` (selain Primary Key UUID `id`) adalah partial unique index ini, maka pengecekan:
  ```typescript
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    throw new ConflictException(
      'Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini',
    );
  }
  ```
  terbukti kokoh, deterministik, dan aman.

---

## 7. Pre-Check Review

### Haruskah `findFirst` aplikasi dipertahankan?
**YA, WAJIB DIPERTAHANKAN.**

**Alasan Teknis & Arsitektural**:
1. **Fast Path Efficiency**: Pada alur normal (pengguna mengklik pengajuan ulang secara tidak sengaja), `findFirst` menggugurkan request di awal tanpa perlu membuka koneksi transaksi, mengeksekusi kalkulasi snapshot kebijakan, atau memicu tabrakan pada mesin database.
2. **Defense-in-Depth Principle**: Validasi aplikasi bertindak sebagai filter garis depan (*coarse-grained validator*), sedangkan database constraint bertindak sebagai jaring pengaman atomik mutlak (*fine-grained concurrency enforcer*).
3. **Zero Overhead**: Penghapusan pre-check tidak memberikan keuntungan terukur dan justru meningkatkan beban error log database pada skenario pengajuan berulang sekuensial.

---

## 8. Existing Data Review

Pemeriksaan fisik langsung terhadap database PostgreSQL uji (`workpulse-test-db` pada port 54332):

```sql
SELECT id, "targetCommitmentId", status, "createdAt" 
FROM correction_requests 
WHERE status = 'Pending';
```

### Hasil Temuan Lapangan:
Terdapat total **7 record** berstatus `Pending`, dengan **2 komitmen target memiliki data duplikat aktif**:

| Target Commitment ID | ID Koreksi Pending | Waktu Dibuat (`createdAt`) | Sumber Duplikasi |
|---|---|---|---|
| `5d4be680-f789-4ce4-b272-4446dff24700` | `aaad117f-df45-4198-8b49-e0f853e0ea83`<br>`425e3e07-d2b6-486f-8be3-4a82023f32cf` | `2026-10-07 07:57:41.080`<br>`2026-10-07 07:57:41.083` | Eksekusi reproduksi independen S3-T1-P2B1-DEF-01 |
| `d81acc75-5a98-4bba-af5e-b2ee20b8dd68` | `e979bbb9-eb85-4990-b282-ba94dc88968a`<br>`ab1badd4-538d-4b0f-b996-c9d3a02b5c38` | `2026-10-07 07:55:02.063`<br>`2026-10-07 07:55:02.063` | Eksekusi test `matrix-concurrency-locking.spec.ts` |

### Dampak Langsung:
Jika skrip `CREATE UNIQUE INDEX ...` dijalankan saat ini pada database, migrasi akan **GAGAL TOTAL DENGAN ERROR DUPLIKASI KUNCI**.

Oleh karena itu:
- Klaim bahwa *Existing-data migration required: YES* adalah **FAKTA TERBUKTI**.
- Diperlukan mekanisme penanganan / reset lingkungan uji sebelum migrasi parsial dapat diterapkan.

---

## 9. Canonicalization Policy Review

### Pertanyaan: Manakah pengajuan yang menjadi *canonical record* bila ada duplikat?
Pemeriksaan terhadap `01-PDD.md`, `02-PRD.md`, `05-SAD.md`, dan `08-ADR.md`:

> **STATUS: CANONICALIZATION POLICY = UNDEFINED**

Tidak ada satu pun dokumen otoritatif yang menentukan apakah sistem harus memilih record pertama (*oldest timestamp*), record terakhir (*newest timestamp*), atau menyerahkan keputusan ke reviewer.

### Implikasi Keputusan:
- **Untuk Lingkungan Uji**: Karena data duplikat berasal dari pengujian konkurensi sintetis, lingkungan uji aman di-reset menggunakan `seed.test.ts` atau pembersihan uji otomatis.
- **Untuk Lingkungan Produksi / Staging**: Jika di kemudian hari sistem akan diterapkan ke database produksi yang memiliki duplikat riil, **dilarang melakukan auto-delete sepihak**. Tim arsitektur dan bisnis wajib menetapkan kebijakan formal sebelum skrip resolusi dijalankan.

---

## 10. Notification Scope Review

Laporan desain awal menyebutkan rekomendasi: *"Menggeser dispatch notifikasi ke fase pasca-commit transaksi"*.

### Temuan Peninjauan:
Berdasarkan baris 363–395 pada `CorrectionRequestService.ts`:
```typescript
const correction = await this.prisma.$transaction(async (tx) => {
  // create & audit
  return created;
});

// Baris 366: Dispatch notifikasi dipanggil DI LUAR transaksi setelah $transaction selesai!
try {
  await this.notificationService.dispatch({ ... });
} catch (err) { ... }
```

### Kesimpulan Scope:
Dispatch notifikasi **SUDAH BERADA DI LUAR / PASCA TRANSAKSI**.  
Ketika transaksi gagal akibat pelanggaran constraint, alur program melempar exception di dalam `$transaction` dan **tidak pernah mencapai blok pengiriman notifikasi**.

**REKOMENDASI SCOPE**:
> **JANGAN MEMPERLUAS SCOPE NOTIFIKASI.**  
> Tidak ada perubahan yang dibutuhkan pada arsitektur notifikasi.

---

## 11. Audit Atomicity Review

| Skenario | CorrectionRequest | AuditLog | Notification | HTTP Response | Status Atomisitas |
|---|---|---|---|---|---|
| **Winning Request** | Created | Created (`CORRECTION_REQUESTED`) | Dispatched ke Reviewer | 201 Created | **PASS (Atomik)** |
| **Losing Request** | Rollback | Rollback (Tidak ada audit) | Skipped (Tidak terpanggil) | 409 Conflict | **PASS (Zero Side-Effect)** |
| **App Error / Rollback** | Rollback | Rollback | Skipped | 500 / Error | **PASS** |

Atomisitas jejak audit dan isolasi efek samping pada Option C berstatus **PASS**.

---

## 12. Concurrency Sequence Review

### Scenario A: Dua Pengajuan Konkuren Simultan (Request A vs Request B)
```text
Client A (PID 101)                 Client B (PID 102)                 PostgreSQL Engine
       │                                  │                                   │
       ├─ findFirst(Pending) -> NULL       │                                   │
       │                                  ├─ findFirst(Pending) -> NULL       │
       ├─ BEGIN $transaction              │                                   │
       │                                  ├─ BEGIN $transaction               │
       ├─ INSERT status = 'Pending' ─────┼───────────────────────────────────┼─> Menyimpan tuple A di partial index
       │                                  ├─ INSERT status = 'Pending' ───────┼─> Menemukan duplikasi di index!
       │                                  │   (Tersuspensi menunggu PID 101)  │   (PostgreSQL wait lock)
       ├─ COMMIT $transaction ───────────┼───────────────────────────────────┼─> Tuple A resmi committed
       │                                  │                                   │   Tuple B ditolak: ERROR 23505!
       │                                  ├─ Prisma throws P2002              │
       │                                  ├─ Catch handler -> ConflictException│
       ├─ Dispatch Notifikasi A           │                                   │
       └─ Return 201 Created              └─ Return 409 Conflict (Tanpa efek samping audit/notif)
```

### Scenario B: Pending → Applied → Pengajuan Baru
1. Scheduled job `evaluateExpiredObjectionWindows` mengupdate status menjadi `Applied`.
2. PostgreSQL MVCC memperbarui tuple dan menghapus referensi dari partial index `WHERE status = 'Pending'`.
3. Pengajuan baru berikutnya mengeksekusi `createCorrectionRequest`.
4. Pre-check lolos (tidak ada Pending), INSERT berhasil lolos partial unique index.

### Scenario C: Pending → Rejected → Pengajuan Baru
1. Reviewer mengeksekusi `objectCorrection`, mengupdate status menjadi `Rejected`.
2. Partial unique index otomatis melepaskan kunci untuk komitmen tersebut.
3. Pengajuan baru berikutnya berhasil tersimpan.

### Scenario D: Pengajuan Konkuren vs Auto-Apply
1. Scheduler mengunci baris koreksi lama dengan `SELECT ... FOR UPDATE WHERE id = ...`.
2. Jika pengajuan baru masuk saat scheduler sedang bekerja:
   - Jika scheduler belum commit: pengajuan baru tertolak di `findFirst` aplikasi (karena baris lama masih `Pending`).
   - Jika scheduler baru saja commit `Applied`: pengajuan baru melihat baris lama sudah `Applied`, sehingga lolos dan membuat baris `Pending` baru.
3. Tidak ada potensi deadlock karena urutan penguncian berbeda tabel (`correction_requests` vs `commitments`).

---

## 13. Migration Safety Review

Prosedur migrasi aman yang disyaratkan untuk fase implementasi:
1. **Pre-check Query**: Query pendeteksian duplikat sebelum pembuatan indeks:
   ```sql
   SELECT "targetCommitmentId", count(*) 
   FROM correction_requests 
   WHERE status = 'Pending' 
   GROUP BY "targetCommitmentId" 
   HAVING count(*) > 1;
   ```
2. **Safety Abort**: Jika count > 0 pada lingkungan produksi, migrasi wajib berhenti (*fail-closed*) sampai resolusi kanonikal disetujui.
3. **Execution**: Penerapan DDL `CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_correction_per_commitment ON correction_requests ("targetCommitmentId") WHERE status = 'Pending';`.
4. **Post-check Verification**: Memvalidasi eksistensi indeks melalui `pg_indexes`.

---

## 14. Test Strategy Review

Rencana pengujian yang diajukan sudah komprehensif. Ditambahkan satu skenario pelengkap:
- `SEQ-01`: Create Material -> Berhasil (Pending).
- `SEQ-02`: Create Material kedua secara sekuensial -> Tertolak 409 (via `findFirst`).
- `SEQ-03`: Rejected -> Create Material baru -> Berhasil (Pending).
- `SEQ-04`: Applied -> Create Material baru -> Berhasil (Pending).
- `CONC-01`: Dua sesi konkuren simultan (`PID A != PID B`) -> Tepat 1 berhasil (201), tepat 1 tertolak (409 via P2002), database berisi tepat 1 Pending, AuditLog tepat 1.
- `CONC-02 (Tambahan)`: Pengajuan Minor konkurensi dengan Material: Memastikan pengajuan Minor (langsung Applied) tidak terblokir oleh indeks parsial komitmen lain.
- `REG-01`: Seluruh 52 integration tests eksisting tetap green.

---

## 15. Scope Control Review

Tinjauan batasan implementasi (*Narrow Scope*):

| Komponen | Direkomendasikan Berubah? | Rationale |
|---|---|---|
| **Database Migration** | **YA** | Menambahkan 1 file migrasi SQL untuk Partial Unique Index. |
| **CorrectionRequestService** | **YA (Minimal)** | Menambahkan blok `try / catch` penangkap `P2002` di `createMaterialCorrection`. |
| **NotificationService** | **TIDAK** | Sudah berada pasca-commit; dilarang diubah. |
| **SchedulerService** | **TIDAK** | Sudah menggunakan `SELECT FOR UPDATE`; tidak perlu disentuh. |
| **Frontend** | **TIDAK** | Kontrak API 409 sudah didukung; tidak ada perubahan UI. |
| **Prisma Schema** | **TIDAK PERLU PERUBAHAN ENUM / MODEL** | Cukup migrasi raw SQL karena Prisma schema DSL tidak memiliki sintaks native untuk partial index predicate `WHERE`. |

---

## 16. Conditions for Implementation

Implementasi remidiasi pada task berikutnya diizinkan dengan ketentuan wajib (*Mandatory Conditions*):

1. **Condition 1 (Clean Environment Baseline)**:
   Sebelum menjalankan migrasi di lingkungan uji, 4 record duplikat yang tercipta saat pengujian independen harus dibersihkan secara sah melalui reset harness `npm run db:test:reset` atau seeding ulang.
2. **Condition 2 (Narrow Scope Service Edit)**:
   Perubahan pada `CorrectionRequestService.ts` **hanya diperbolehkan** untuk menangkap `P2002` dan menerjemahkannya ke `ConflictException`. Dilarang merombak alur notifikasi atau method lain.
3. **Condition 3 (Safe P2002 Mapping)**:
   Pemetaan error `P2002` tidak boleh bergantung pada string parsing `meta.target` yang rapuh.
4. **Condition 4 (Preserve Pre-Check)**:
   Validasi `findFirst` yang sudah ada pada baris 109–120 **wajib tetap dipertahankan**.

---

## 17. Final Architecture Decision

### **VERDICT: APPROVED WITH CONDITIONS**

Arsitektur **Option C (Defense-in-Depth)** dinyatakan disetujui secara teknis dan konseptual untuk diterapkan pada fase remediasi mendatang, dengan tunduk sepenuhnya pada 4 ketentuan di atas.

---

## 18. Remaining Decision Blockers

Tidak ada blocker konseptual yang tersisa.  
Implementasi fisik dapat dimulai segera setelah otorisasi fase implementasi diberikan.

**CATATAN BATASAN KERJA**:
- Implementasi kode, pembuatan migrasi, dan modifikasi skema **BELUM DILAKUKAN** pada task ini.
- S3-T1 Phase 2B-2 (Load Testing 30–60 user) **TETAP BERSTATUS NOT STARTED**.
