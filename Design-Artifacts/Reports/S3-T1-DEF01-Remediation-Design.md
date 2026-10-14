# S3-T1 DEF-01 Remediation Design & Architecture Decision Analysis

**System**: WorkPulse — Daily Accountability & Blocker Log System  
**Stage**: Stage S3 — Jalankan Sistem Sungguhan  
**Task**: S3-T1 DEF-01 Remediation Design & Architecture Decision Analysis  
**Execution Timestamp**: 2026-10-07T15:05:00+07:00  
**Defect Reference**: `S3-T1-P2B1-DEF-01` (APPLICATION CONCURRENCY DEFECT — BLOCKING)  
**Status**: PROPOSED — AWAITING ARCHITECTURAL APPROVAL  
**Governing Documents**: `01-PDD.md`, `02-PRD.md`, `03-UI-UX Spec & Flow Document.md`, `05-SAD.md`, `08-ADR.md`, `09-Known-Limitations.md`, `10-S2-Audit-Findings-Register.md`, `S3-T1-Phase2B1-Independent-Verification.md`

---

## 1. Executive Summary

Dalam verifikasi independen S3-T1 Phase 2B-1, temuan **`S3-T1-P2B1-DEF-01`** telah dikonfirmasi dan direproduksi 100% menggunakan dua koneksi fisik PostgreSQL terpisah (`PID A != PID B`). 

Temuan tersebut membuktikan bahwa dua pengajuan koreksi konkuren yang diajukan pada komitmen target yang sama dapat secara simultan melewati pengecekan `findFirst` aplikasi dan menghasilkan **2 baris `CorrectionRequest` berstatus `Pending` untuk 1 komitmen target yang sama**.

Analisis otoritatif ini membuktikan:
1. **Business Invariant**: Sistem secara fundamental mengharuskan bahwa pada satu waktu **maksimal hanya 1 pengajuan koreksi berstatus `Pending` per komitmen**. Logika kode produksi (`CorrectionRequestService.ts` baris 108–120) secara eksplisit berniat menegakkan invarian ini melalui penolakan `ConflictException` (409).
2. **Ketiadaan Accepted Risk**: Tidak ada satu pun ADR, Product Requirements, atau Known Limitations yang mengizinkan atau menerima duplikasi pengajuan koreksi aktif sebagai risiko yang diterima (*Accepted Risk*).
3. **Konsekuensi Kegagalan Konkurensi**: Keberadaan 2 pengajuan `Pending` menyebabkan risiko berantai: eksekusi auto-apply ganda yang saling menimpa (*conflicting double auto-apply*), penganuliran penolakan reviewer secara diam-diam (*objection overwrite*), duplikasi notifikasi, dan kontradiksi jejak audit.
4. **Rekomendasi Arsitektur**: Merekomendasikan **Option C (Defense-in-Depth: Database Partial Unique Index + Application Transaction & Error Translation)** sebagai solusi definitif untuk menjamin invarian secara atomik, melindungi konsistensi jejak audit/notifikasi, serta menyediakan pemetaan error 409 yang mulus bagi pengguna.

---

## 2. Authoritative Evidence

Tabel berikut merangkum dasar bukti dari seluruh dokumen otoritatif sistem:

| Sumber Dokumen | Bagian / Pasal | Kutipan / Ketentuan Otoritatif | Implikasi Invarian |
|---|---|---|---|
| **02-PRD.md** | §3.9, FR-05, FR-43, FR-44, BR-02, BR-16 | *"Setelah Cut-Off, Morning Commitment terkunci sebagai baseline; perubahan apa pun wajib melalui Correction Request... Correction Request Material wajib melalui Objection Window — default-approve jika tidak ada objection eksplisit..."* | Komitmen terkunci memiliki satu baseline tunggal yang dilindungi satu alur koreksi aktif pada satu waktu. |
| **03-UI-UX Spec & Flow Document.md** | §5.3, §16.6 | Halaman MyToday/Review hanya menampilkan tombol "Ajukan Koreksi" jika komitmen belum memiliki koreksi aktif. Jika koreksi berstatus Pending, UI menampilkan kartu status Pending dengan tombol dinonaktifkan atau disembunyikan. | Kontrak antarmuka pengguna secara ketat mengasumsikan kardinalitas 1:1 antara komitmen dan koreksi Pending. |
| **05-SAD.md** | §5.6, §9.6, §9.9 | - §5.6: Relasi `Commitment 1 - N CorrectionRequest`<br>- §9.6: State Machine Correction Request Lifecycle<br>- §9.9: *"Setiap state transition yang bisa dipicu lebih dari satu jalur... memakai SELECT ... FOR UPDATE (pessimistic locking) di dalam transaction"* | Arsitektur secara tegas mensyaratkan mitigasi konkurensi berbasis database untuk mencegah transisi ilegal dan status ganda. |
| **08-ADR.md** | ADR-001 | Scope CorrectionRequest dibatasi secara ketat pada Morning Commitment locked sebagai baseline resmi. | Tidak ada keputusan ADR yang mengizinkan multiple active Pending corrections. |
| **09-Known-Limitations.md** | KL-02 | Mencatat technical debt mutasi langsung `tx.commitment.update()` di `CorrectionRequestService`, namun **tidak mencatat** toleransi terhadap duplikasi koreksi Pending. | Defect ini bukan Known Limitation yang diterima (*Unaccepted*). |
| **Kode Produksi Aktual** | `CorrectionRequestService.ts` L109–120 | `const existingPending = await this.prisma.correctionRequest.findFirst(...)`<br>`if (existingPending) throw new ConflictException(...)` | **Business intent sangat eksplisit**: menolak pengajuan baru jika masih terdapat pengajuan Pending. |

---

## 3. Current Invariant

### 3.1 Business Invariant yang Diharapkan
> **Aturan Bisnis Utama (SAD §9.6, PRD BR-16)**:  
> Untuk setiap record `Commitment`, pada setiap saat $t$, jumlah record `CorrectionRequest` yang berelasi dan memiliki status `Pending` harus memenuhi:
> $$\sum \text{CorrectionRequest}(\text{targetCommitmentId} = C, \text{status} = \text{'Pending'}) \le 1$$

Jika suatu komitmen telah memiliki 1 pengajuan koreksi dengan status `Pending` yang sedang berjalan dalam Objection Window, seluruh permintaan pengajuan koreksi baru berikutnya untuk komitmen tersebut **wajib ditolak** dengan status HTTP `409 Conflict`.

### 3.2 Siklus Hidup Uniqueness
Invarian keunikan ini bersifat **kondisional (status-dependent)**:
- Saat `status = 'Pending'`: Wajib unik per `targetCommitmentId`.
- Saat `status = 'Applied'` atau `'Rejected'`: Siklus hidup telah mencapai *terminal state*. Komitmen tersebut di masa mendatang secara bisnis diizinkan memiliki pengajuan koreksi baru jika komitmen terkunci kembali atau memerlukan koreksi berikutnya. Oleh karena itu, batasan keunikan **TIDAK BOLEH** bersifat global sepanjang masa, melainkan hanya berlaku untuk baris berstatus `Pending`.

---

## 4. Current Implementation

Alur eksekusi saat ini pada `CorrectionRequestService.createCorrectionRequest`:

```text
[HTTP Request A]                               [HTTP Request B]
       │                                              │
       ▼                                              ▼
1. findUnique(Commitment)                      1. findUnique(Commitment)
       │                                              │
       ▼                                              ▼
2. Validasi Lock & Kepemilikan                 2. Validasi Lock & Kepemilikan
       │                                              │
       ▼                                              ▼
3. findFirst(CorrectionRequest)                3. findFirst(CorrectionRequest)
   WHERE targetCommitmentId = C                   WHERE targetCommitmentId = C
     AND status = 'Pending'                         AND status = 'Pending'
   -> Hasil: NULL (0 baris)                       -> Hasil: NULL (0 baris)
       │                                              │
       ▼                                              ▼
4. (Lewat validasi duplicate)                  4. (Lewat validasi duplicate)
       │                                              │
       ▼                                              ▼
5. prisma.correctionRequest.create(...)        5. prisma.correctionRequest.create(...)
   INSERT status = 'Pending'                      INSERT status = 'Pending'
       │                                              │
       ▼                                              ▼
   -> SUCCESS (Row A tersimpan)                   -> SUCCESS (Row B tersimpan)
```

### Mengapa Aman pada Permintaan Sekuensial tetapi Gagal pada Konkurensi?
- **Sekuensial**: Request A selesai menulis ke database (`INSERT` selesai). Saat Request B datang kemudian, `findFirst` pada Request B membaca baris Row A yang sudah tersimpan, sehingga `existingPending` terisi dan melempar `ConflictException`.
- **Konkurensi**: Request A dan Request B mengeksekusi langkah 3 (`findFirst`) pada jendela waktu mikrodetik yang sama sebelum salah satu melakukan `INSERT`. Karena kueri `findFirst` tidak mengunci baris komitmen atau tabel koreksi (`SELECT` non-locking dalam mode *READ COMMITTED*), kedua request melihat 0 baris pending dan keduanya melanjutkan ke `INSERT`.

---

## 5. Current Database Constraints

Pemeriksaan fisik pada PostgreSQL 18.6 terhadap tabel `correction_requests`:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'correction_requests';
```

### Hasil Pemeriksaan:
1. `correction_requests_pkey`: `CREATE UNIQUE INDEX ... ON correction_requests USING btree (id)`
2. `correction_requests_targetCommitmentId_status_idx`: `CREATE INDEX ... ON correction_requests USING btree ("targetCommitmentId", status)` (NON-UNIQUE)
3. `correction_requests_status_objectionWindowEnd_idx`: `CREATE INDEX ... ON correction_requests USING btree (status, "objectionWindowEnd")` (NON-UNIQUE)

### Analisis Database Constraint:
- Kolom `targetCommitmentId` hanya dilindungi oleh Foreign Key ke tabel `commitments(id)` dengan `ON DELETE CASCADE`.
- Indeks gabungan `("targetCommitmentId", status)` adalah **B-Tree index biasa (non-unique)**.
- **Kesimpulan**: Database saat ini secara fisik **TIDAK MEMILIKI MEKANISME** untuk mencegah dua transaksi konkuren menyisipkan baris dengan `targetCommitmentId` yang sama dan `status = 'Pending'`.

---

## 6. Complete Correction Request Lifecycle

Berikut adalah pemetaan seluruh alur hidup dan mutasi status pada `CorrectionRequest`:

```text
                  [Employee Submit]
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
      [Minor Change]             [Material Change]
            │                           │
            ▼                           ▼
    status: Applied              status: Pending
 (Langsung update Commitment)    (Masuk Objection Window)
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                [Reviewer Object]            [Window Expired (5m job)]
                         │                             │
                         ▼                             ▼
                  status: Rejected              status: Applied
            (Commitment TIDAK berubah)   (Scheduler update Commitment)
```

### Kode Path yang Memodifikasi Status:
1. **`createCorrectionRequest`** (`POST /api/v1/correction-requests`):
   - Path Minor: Menyisipkan baris dengan `status = Applied`.
   - Path Material: Menyisipkan baris dengan `status = Pending`.
2. **`objectCorrectionRequest`** (`POST /api/v1/correction-requests/:id/object`):
   - Reviewer berwenang menolak: mengubah `status = Rejected`.
   - Dilindungi transaksi pesimis: `SELECT ... FOR UPDATE` pada `correction_requests`.
3. **`evaluateExpiredObjectionWindows`** (Scheduled Job #5 via `SchedulerService`):
   - Auto-apply saat `objectionWindowEnd <= now()`: mengubah `status = Applied`.
   - Dilindungi transaksi pesimis: `SELECT ... FOR UPDATE` pada `correction_requests`.
4. **Metode Lain**: Tidak ada alur *cancellation*, *soft-delete*, atau *re-open* pada spesifikasi saat ini. Status `Applied` dan `Rejected` bersifat final (*terminal state*).

---

## 7. Concurrency Failure Mechanism

Ketiadaan serialisasi pada tahap `createCorrectionRequest` menghasilkan kegagalan sistemik berikut:

```text
                  T1: Submit Material Koreksi A ("Text A")
                  T2: Submit Material Koreksi B ("Text B")
                                    │
                                    ▼
       Database memiliki 2 Koreksi Pending untuk Komitmen C
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[Skenario 1: Konflik Auto-Apply]               [Skenario 2: Anulir Penolakan Reviewer]
Job #5 berjalan saat window berakhir.          Reviewer menolak Koreksi A (Status -> Rejected).
1. Job mengunci Koreksi A -> Applied           Baseline komitmen seharusnya tetap "Original".
   Commitment diubah menjadi "Text A".         Namun Koreksi B masih berstatus Pending!
2. Job mengunci Koreksi B -> Applied           Saat window Koreksi B habis, Job #5 meng-apply B!
   Commitment ditimpa menjadi "Text B".        Commitment berubah menjadi "Text B".
Hasil: Penimpaan ganda tak terduga,            Hasil: Keputusan penolakan atasan dianulir
perhitungan worst-of DAR dieksekusi 2x.        secara diam-diam oleh scheduler.
```

---

## 8. Remediation Option A — Database-Level Partial Unique Index

### 8.1 Konsep Teknis
Menerapkan partial unique index murni pada tingkat mesin PostgreSQL:
```sql
CREATE UNIQUE INDEX unique_pending_correction_per_commitment 
ON correction_requests ("targetCommitmentId") 
WHERE status = 'Pending';
```

### 8.2 Analisis Mekanisme
- **Dukungan PostgreSQL**: Sangat presisi. Fitur *partial indexes* dengan predikat `WHERE status = 'Pending'` didukung secara bawaan oleh PostgreSQL.
- **Perilaku Race Condition**: Jika Transaksi 1 dan Transaksi 2 melakukan `INSERT` secara simultan untuk komitmen yang sama:
  - Transaksi 1 berhasil menyisipkan index tuple.
  - Transaksi 2 tertahan sejenak di buffer index. Begitu Transaksi 1 melakukan `COMMIT`, Transaksi 2 seketika gagal di tingkat kernel PostgreSQL dengan error:
    ```text
    ERROR: duplicate key value violates unique constraint "unique_pending_correction_per_commitment"
    DETAIL: Key ("targetCommitmentId")=(...) already exists.
    SQLSTATE: 23505 (unique_violation)
    ```
- **Prisma & Application Response**:
  - Prisma menangkap `23505` dan melempar `PrismaClientKnownRequestError` dengan kode `P2002`.
  - Jika tidak ada penanganan eksplisit, error ini akan diinterpretasikan oleh NestJS global filter sebagai HTTP `500 Internal Server Error` (atau pesan Prisma raw yang tidak ramah pengguna).
- **Lifecycle Compatibility**:
  - Sangat sempurna. Begitu status berubah dari `Pending` menjadi `Applied` atau `Rejected`, baris tersebut secara otomatis tidak lagi memenuhi kriteria `WHERE status = 'Pending'`. Index PostgreSQL melepaskan entri keunikan tersebut tanpa perlu drop index atau mutasi manual. Komitmen tersebut bebas menerima koreksi `Pending` baru di masa depan.
- **Tantangan Migrasi**: Jika database existing sudah memiliki duplikat baris pending, perintah `CREATE UNIQUE INDEX` akan gagal fatal (*migration fail*).

---

## 9. Remediation Option B — Pessimistic Locking on Commitment

### 9.1 Konsep Teknis
Menerapkan penguncian baris pesimis pada komitmen target di dalam transaksi service NestJS:
```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Kunci baris komitmen target
  const commitment = await tx.$queryRaw`
    SELECT id, "isMorningLocked", "isEodLocked" 
    FROM commitments 
    WHERE id = ${dto.targetCommitmentId}::uuid 
    FOR UPDATE;
  `;

  // 2. Cek apakah ada koreksi yang masih Pending
  const existingPending = await tx.correctionRequest.findFirst({
    where: {
      targetCommitmentId: dto.targetCommitmentId,
      status: CorrectionStatus.Pending,
    },
  });

  if (existingPending) {
    throw new ConflictException('Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini');
  }

  // 3. Insert CorrectionRequest
  return tx.correctionRequest.create({ ... });
});
```

### 9.2 Analisis Mekanisme
- **Serialisasi Antrian**: Transaksi 1 mengambil row lock pada tabel `commitments`. Transaksi 2 yang mencoba mengakses komitmen yang sama akan tertahan (*blocked*) pada kueri `SELECT ... FOR UPDATE`.
- Saat Transaksi 1 selesai dan `COMMIT`, Transaksi 2 memperoleh kunci, mengeksekusi `findFirst`, melihat baris pending yang baru dibuat Transaksi 1, dan melempar `ConflictException` (409) secara bersih.
- **Kelemahan & Risiko**:
  1. *Bypassable*: Jika terdapat mutasi langsung via raw query, seed script, atau module lain yang menyisipkan `correction_requests` tanpa mengambil kunci pada `commitments`, locking ini terabaikan sepenuhnya.
  2. *Deadlock Risk*: Perlu koordinasi ketat dengan `evaluateExpiredObjectionWindows()`. Scheduler mengunci `correction_requests` lalu meng-update `commitments`. Jika `createCorrectionRequest` mengunci `commitments` lalu menulis ke `correction_requests`, terdapat potensi teoritis *deadlock circular wait* jika kedua alur saling bersilangan.
  3. *Durasi Transaksi*: Membuka koneksi database transaksi lebih lama untuk menghitung snapshot kebijakan dan validasi teks.

---

## 10. Remediation Option C — Defense-in-Depth (Kombinasi Index Parsial + Transaksi Service & Error Translation)

### 10.1 Konsep Teknis
Menggabungkan keandalan mutlak mesin database dengan keramahan pengalaman pengguna di lapisan aplikasi:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   LAPISAN 1: SERVICE TRANSACTION                       │
│ - Bungkus pembuatan koreksi di dalam prisma.$transaction               │
│ - Pertahankan pre-check findFirst untuk fast-fail ramah pengguna (409) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LAPISAN 2: DATABASE INVARIANT                        │
│ - PostgreSQL Partial Unique Index:                                     │
│   CREATE UNIQUE INDEX unique_pending_correction_per_commitment         │
│   ON correction_requests ("targetCommitmentId")                        │
│   WHERE status = 'Pending';                                            │
│ - Menjadi "Benteng Terakhir" (Last Line of Defense) terhadap balapan   │
│   mikrodetik yang melewati Lapis 1.                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 LAPISAN 3: TRANSLASI ERROR DOMAIN                      │
│ - Tangkap exception Prisma P2002 khusus constraint tersebut            │
│ - Terjemahkan seketika menjadi ConflictException standar WorkPulse:    │
│   "Masih terdapat pengajuan koreksi yang berstatus Pending..."         │
│ - Pastikan AuditLog dan Notifikasi di-dispatch hanya saat commit lulus │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Analisis Mekanisme
- **Sumber Kebenaran (Source of Truth)**: PostgreSQL Partial Unique Index. Tidak ada celah bagi race condition, raw script, atau developer error untuk menyisipkan data korup.
- **Pengalaman Pengguna (User Experience)**: Klien API dan UI selalu menerima HTTP status `409 Conflict` dengan format JSON yang konsisten, baik penolakan terjadi di Lapisan 1 maupun Lapisan 2.
- **Konsistensi Efek Samping**: Dispatch notifikasi ditempatkan di luar transaksi database atau dieksekusi hanya jika `tx` berhasil di-commit, memastikan tidak ada notifikasi palsu yang terkirim jika terjadi tabrakan konkurensi.

---

## 11. Comparison Matrix

| Kriteria Evaluasi | Option A (Index Only) | Option B (Pessimistic Lock Only) | Option C (Defense-in-Depth) |
|---|:---:|:---:|:---:|
| **Jaminan Invarian di Level DB Engine** | **YA** (100% mutlak) | TIDAK (Tergantung aplikasi) | **YA** (100% mutlak) |
| **Keamanan Terhadap Race Condition** | TINGGI | SEDANG-TINGGI | **MAKSIMAL** |
| **Perlindungan Terhadap Semua Penulis (All Writers)** | **YA** (Script/SQL/API terlindungi) | TIDAK (Hanya code path ber-lock) | **YA** (Seluruh jalur terlindungi) |
| **Kompatibilitas Lifecycle Koreksi** | Sempurna (Lepas saat non-pending) | Sempurna | **Sempurna** |
| **Kompatibilitas Prisma ORM** | Perlu migrasi manual/custom SQL | Bawaan Prisma `$transaction` | **Sangat Baik** |
| **Kompleksitas Migrasi Data** | Memerlukan migrasi SQL terkurasi | Nol migrasi skema | Memerlukan migrasi SQL terkurasi |
| **Remidiasi Data Eksisting** | Wajib resolusi baris duplikat | Tidak mendeteksi duplikat lama | **Wajib resolusi baris duplikat** |
| **Pemetaan Error Pengguna (UX 409)** | BURUK (Bisa jadi 500/P2002 jika lolos) | BAIK (409 Conflict bawaan) | **SEMPURNA** (409 konsisten & terpetakan) |
| **Atomisitas Audit & Notifikasi** | Perlu penanganan manual | Atomik dalam transaksi | **100% Atomik & Terisolasi** |
| **Risiko Deadlock Database** | **NOL** | ADA (Potensi circular wait) | **SANGAT RENDAH** |
| **Dampak Performa** | Sangat Ringan (Index parsial kecil) | Penahanan row lock komitmen | **Sangat Ringan** |
| **Maintainability Kode** | Rendah di kode, tinggi di DB | Menengah di service layer | **Tinggi & Terdokumentasi Jelas** |
| **Failure Mode** | Raw Database Constraint Violation | Timeout / Lock contention | Domain Conflict Exception (409) |
| **Kesiapan Menuju Skala 30–60 User** | Cukup | Cukup | **Sangat Siap & Kokoh** |

---

## 12. Existing Data / Migration Analysis

Jika Partial Unique Index diterapkan pada database yang sudah berjalan, keberadaan duplikat data lama akan memicu kegagalan migrasi (`index build failure`). Oleh karena itu, prosedur migrasi wajib dirancang dengan urutan tahapan berikut:

### 12.1 Prosedur Audit Data Eksisting (Pre-Migration Query)
Sebelum mengeksekusi pembuatan index, migration script wajib menjalankan kueri deteksi:
```sql
SELECT "targetCommitmentId", count(*) AS duplicate_count
FROM correction_requests
WHERE status = 'Pending'
GROUP BY "targetCommitmentId"
HAVING count(*) > 1;
```

### 12.2 Prosedur Resolusi Baris Duplikat (Jika Ditemukan)
Jika ditemukan komitmen yang memiliki lebih dari 1 pengajuan pending:
1. **Aturan Penentuan Baris Kanonikal**:
   - Pilihan Kanonikal A: Baris dengan `createdAt` paling awal (pengajuan sah pertama yang masuk).
   - Pilihan Kanonikal B: Memerlukan intervensi manual manajemen jika kedua pengajuan memiliki nilai perubahan yang berbeda substansial.
2. **Penanganan Baris Non-Kanonikal**:
   - Baris kedua **TIDAK BOLEH DIHAPUS (HARD DELETE)** karena melanggar prinsip integritas audit trail (SAD §2.1 & DoD 5.1).
   - Baris non-kanonikal harus ditransisikan statusnya menjadi `Rejected` dengan alasan sistem:
     ```text
     "Ditolak otomatis oleh migrasi integritas sistem: Terdeteksi duplikasi pengajuan konkuren"
     ```
   - Dicatat entri pada `audit_logs` dengan `action = 'CORRECTION_REJECTED'` dan `actorUserId = NULL` (system action).
3. **Penerapan Index**:
   Setelah query audit memastikan `duplicate_count = 0`, baru index parsial dibuat secara aman.

---

## 13. Error Contract Analysis

Kontrak API WorkPulse untuk kegagalan duplikasi koreksi harus memenuhi standar SAD §10.5 & PRD:

### 13.1 Respons yang Diharapkan Saat Tabrakan Konkuren:
- **HTTP Status Code**: `409 Conflict`
- **Response Payload**:
  ```json
  {
    "statusCode": 409,
    "error": "Conflict",
    "message": "Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini"
  }
  ```

### 13.2 Mekanisme Penangkapan Prisma P2002:
Pada service layer, blok `createCorrectionRequest` wajib menangani kemungkinan pelanggaran index:
```typescript
try {
  // eksekusi pembuatan koreksi
} catch (error: any) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    (error.meta?.target as string[])?.includes('unique_pending_correction_per_commitment')
  ) {
    throw new ConflictException(
      'Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini',
    );
  }
  throw error;
}
```
Hal ini menjamin bahwa kegagalan di lapisan fisik database diterjemahkan 100% identik dengan validasi sekuensial aplikasi.

---

## 14. Audit, Notification & Idempotency Analysis

1. **AuditLog Atomicity**:
   - Pembuatan `CorrectionRequest` (Material) mencatat `CORRECTION_REQUESTED`.
   - Jika transaksi gagal karena pelanggaran keunikan index (Request B kalah balapan), transaksi database di-rollback seketika. Baris `audit_logs` untuk Request B otomatis tidak pernah tersimpan di PostgreSQL.
2. **Notification Dispatch Safety**:
   - `notificationService.dispatch()` untuk trigger `#9` (`CORRECTION_REQUEST_MATERIAL_SUBMITTED`) **TIDAK BOLEH** dipanggil di tengah-tengah transaksi sebelum commit dipastikan berhasil.
   - Notifikasi hanya didispatch setelah `tx` selesai di-commit. Dengan demikian, jika Request B kalah dan dibatalkan, reviewer tidak akan menerima email/notifikasi palsu.
3. **Idempotensi**:
   - Pengajuan ulang request yang identik secara tidak sengaja (misal double-click tombol submit pada jaringan lambat) akan ditolak secara aman oleh index tanpa menimbulkan *side effect* ganda.

---

## 15. Security & Authorization Impact

Remediasi ini bersifat **ortogonal terhadap otorisasi**:
- Tidak mengubah aturan RBAC (hanya Employee pemilik komitmen yang dapat memanggil create).
- Tidak memotong verifikasi contextual scope (Reviewer tetap diverifikasi via `ScopeFilterService`).
- Tidak mengubah tanggal berlaku (*effective dating*) kebijakan `MinorMaterialThreshold` dan `ObjectionWindowDuration`.
- Hak penolakan (*objection authority*) tetap berada pada supervisor/head/HRGA yang sah.

---

## 16. Proposed Test Strategy (Perencanaan Pengujian Pasca-Persetujuan)

Jika Option C disetujui untuk diimplementasikan pada task berikutnya, berikut rencana pengujian yang wajib membuktikannya:

### 1. Sequential Tests
- `SEQ-01`: Komitmen tanpa koreksi -> Submit koreksi Material -> Sukses (Status: `Pending`).
- `SEQ-02`: Komitmen yang sedang memiliki koreksi `Pending` -> Submit koreksi kedua -> Ditolak dengan HTTP `409 Conflict`.
- `SEQ-03`: Koreksi pertama ditolak Reviewer (`Rejected`) -> Submit koreksi baru -> Sukses (Status: `Pending`).
- `SEQ-04`: Koreksi pertama diterapkan Scheduler (`Applied`) -> Komitmen terkunci kembali -> Submit koreksi baru -> Sukses (Status: `Pending`).

### 2. Physical Concurrent Tests
- `CONC-01`: Dua sesi PostgreSQL fisik simultan (`PID A != PID B`) mencoba menyisipkan koreksi `Pending` untuk komitmen yang sama pada saat bersamaan.
  - Assertasi: Tepat 1 request berhasil (201/Pending), tepat 1 request ditolak (409 Conflict).
  - Assertasi Database: `SELECT count(*) ... WHERE status = 'Pending'` bernilai **tepat 1**.
  - Assertasi Audit: Tepat 1 baris `CORRECTION_REQUESTED`.
  - Assertasi Notifikasi: Tepat 1 notifikasi terkirim ke Reviewer.

### 3. Regression Tests
- Memastikan seluruh 52 pengujian integrasi eksisting tetap lulus 100%.

---

## 17. Recommended Architecture

### **Rekomendasi Utama: OPTION C (DEFENSE-IN-DEPTH)**

### Alasan Pemilihan:
1. **Integritas Absolut**: Menempatkan partial unique index di PostgreSQL adalah satu-satunya cara yang menjamin invarian data 100% tidak dapat ditembus oleh kondisi balapan konkuren, bypass service, maupun kesalahan skrip masa depan.
2. **Kesesuaian dengan Skala WorkPulse**: Skala 30–60 user dengan volume pengajuan koreksi beberapa kali per hari membuat *overhead* partial index bernilai mendekati nol byte dan zero latency impact.
3. **Penyelarasan UX & Kontrak API**: Penggabungan dengan penanganan error di `CorrectionRequestService` menjamin bahwa respons API tetap ramah, konsisten, dan memenuhi kontrak PRD/SAD tanpa mengekspos internal error database.
4. **Zero-Side-Effect Guarantee**: Menjamin tidak ada notifikasi ganda atau baris audit yatim jika terjadi perebutan pengajuan secara simultan.

---

## 18. ADR Draft — PROPOSED

```markdown
# ADR-003: Atomic Invariant Enforcement on Pending Correction Requests via Partial Unique Index

## Status
PROPOSED — AWAITING ARCHITECTURAL APPROVAL

## Context
Pada pengujian integrasi riil S3-T1 Phase 2B-1, teridentifikasi temuan S3-T1-P2B1-DEF-01:
Dua transaksi konkuren simultan pada komitmen yang sama dapat menghasilkan 2 record 
CorrectionRequest berstatus Pending secara bersamaan. Logika aplikasi findFirst 
gagal mencegah kondisi balapan mikrodetik karena ketiadaan penguncian fisik atau 
constraint database.

## Decision
Diputuskan untuk menerapkan strategi Defense-in-Depth:
1. Menambahkan Partial Unique Index pada tabel PostgreSQL `correction_requests`:
   CREATE UNIQUE INDEX unique_pending_correction_per_commitment 
   ON correction_requests ("targetCommitmentId") 
   WHERE status = 'Pending';
2. Membungkus eksekusi `CorrectionRequestService.createCorrectionRequest` dalam transaksi, 
   menangkap error Prisma P2002 pada constraint tersebut, dan menerjemahkannya secara 
   deterministik menjadi domain `ConflictException` (HTTP 409).
3. Menggeser dispatch notifikasi ke fase pasca-commit transaksi.

## Consequences
- Positif: Invarian 1 pending per komitmen terjamin secara mutlak di level PostgreSQL engine.
- Positif: Tidak ada risiko double auto-apply atau overwrite penolakan reviewer.
- Positif: Siklus hidup terminal (Applied/Rejected) otomatis melepaskan keunikan tanpa intervensi.
- Negatif: Penambahan migration kustom di Prisma yang mendefinisikan raw partial index.
```

---

## 19. Implementation Scope for Next Phase

Jika disetujui, lingkup implementasi remidiasi pada fase berikutnya akan mencakup:
1. **Prisma Migration**:
   - Membuat file migrasi baru (misal `add_partial_unique_index_pending_correction`).
   - Menyertakan query SQL `CREATE UNIQUE INDEX unique_pending_correction_per_commitment ... WHERE status = 'Pending'`.
2. **Service Layer Update (`backend/src/modules/correction-request/services/correction-request.service.ts`)**:
   - Menambahkan try-catch pembungkus Prisma P2002 untuk translasi ke `ConflictException`.
   - Memastikan notification dispatch terjadi setelah commit.
3. **Test Suite Verification**:
   - Memperbarui skenario `C02` pada `matrix-concurrency-locking.spec.ts` untuk mengassert bahwa 1 request berhasil dan 1 request mendapat 409, dengan tepat 1 baris tersimpan di database.
4. **Verifikasi Penuh**: Menjalankan ulang `npm run test:integration:real`.

---

## 20. Residual Risks / Open Questions

1. **Migrasi pada Data Lingkungan Nyata**:
   - Apakah staging/production database saat ini memiliki data riil dengan duplikasi status Pending? (Berdasarkan audit, database test saat ini bersih setelah reset; namun prosedur pra-migrasi tetap wajib disertakan).
2. **Kebutuhan Fitur Cancel Request**:
   - Apakah Employee di masa depan diizinkan membatalkan pengajuan koreksi Material yang masih berstatus Pending sebelum diproses Reviewer? (Saat ini out-of-scope, namun jika ada di masa depan, status `Cancelled` akan otomatis kompatibel dengan partial index).

---

## 21. Decision Gate

Remediasi ini siap untuk dieksekusi setelah mendapatkan persetujuan resmi:

> **STATUS GATE: MENUNGGU PERSETUJUAN KONSEPTUAL & ARSITEKTUR**  
> Implementasi kode, skema, dan migrasi **TIDAK DILAKUKAN** pada sesi ini sesuai dengan aturan *Absolute No-Code Rule*.  
> Tahap **S3-T1 Phase 2B-2 (Load Testing 30–60 user)** tetap berstatus **NOT STARTED**.
