# S3-T1 DEF-01 Remediation Implementation Report

**System**: WorkPulse — Daily Accountability & Blocker Log System  
**Stage**: Stage S3 — Jalankan Sistem Sungguhan  
**Task**: S3-T1 DEF-01 Remediation Implementation  
**Execution Timestamp**: 2026-10-07T15:28:00+07:00  
**Defect Reference**: `S3-T1-P2B1-DEF-01` (APPLICATION CONCURRENCY DEFECT — BLOCKING)  
**Remediation Option**: Option C — Defense-in-Depth (Partial Unique Index + Service Error Mapping)  
**Governing Documents**: `01-PDD.md`, `02-PRD.md`, `03-UI-UX Spec & Flow Document.md`, `05-SAD.md`, `08-ADR.md`, `09-Known-Limitations.md`, `10-S2-Audit-Findings-Register.md`, `S3-T1-Phase2B1-Independent-Verification.md`, `S3-T1-DEF01-Remediation-Design.md`, `S3-T1-DEF01-Architecture-Decision-Review.md`  
**Final Status**: **VERIFIED — CLOSED**

---

## 1. Executive Summary

Remediasi untuk cacat konkurensi **`S3-T1-P2B1-DEF-01`** telah selesai diimplementasikan secara penuh dan berhasil diverifikasi secara fisik terhadap PostgreSQL riil (versi 18-alpine).

Semua kondisi non-negotiable yang ditetapkan dalam *Architecture Decision Review* terpenuhi:
1. **Database Atomic Enforcement**: Ditambahkan PostgreSQL Partial Unique Index `unique_pending_correction_per_commitment` pada `correction_requests ("targetCommitmentId") WHERE status = 'Pending'`.
2. **Application Error Mapping**: Pelanggaran konkurensi di level database (`PrismaClientKnownRequestError` dengan `code === 'P2002'`) pada `createMaterialCorrection` ditangkap dan diterjemahkan menjadi domain `ConflictException` (HTTP 409).
3. **Retain Pre-Check**: Pre-check aplikasi `findFirst` tetap dipertahankan sebagai fast-path untuk penolakan sekuensial.
4. **Scope Control**: Tidak ada perombakan pada notifikasi, scheduler, atau modul lain. Notifikasi tetap dieksekusi pasca-commit transaksi.

Hasil verifikasi:
- Uji konkurensi simultan membuktikan tepat 1 request berhasil (201/Pending), tepat 1 request ditolak (409/ConflictException).
- Database katalog mengonfirmasi eksistensi indeks parsial unik.
- Negative test membuktikan direct SQL bypass ditolak langsung oleh storage engine PostgreSQL (`SQLSTATE 23505`).
- Seluruh 12 test suite integrasi riil (57 tes) dan 46 test suite unit (639 tes) lulus 100%.

---

## 2. DEF-01 Before State

Sebelum remediasi, pengujian independen Phase 2B-1 mengonfirmasi bahwa dua transaksi konkuren simultan pada komitmen target yang sama dapat secara bersamaan melewati pre-check aplikasi `findFirst({ where: { targetCommitmentId, status: 'Pending' } })` karena isolasi default PostgreSQL *READ COMMITTED* tidak mengunci baris saat non-locking SELECT.

Akibatnya:
- Dua baris `CorrectionRequest` berstatus `Pending` tersimpan untuk satu komitmen yang sama.
- Timbul risiko eksekusi auto-apply ganda yang saling menimpa (*conflicting double auto-apply*), penganuliran penolakan reviewer, dan duplikasi notifikasi.

---

## 3. Root Cause

1. **Ketiadaan Constraint Database**: Tabel `correction_requests` hanya memiliki B-tree index non-unik `("targetCommitmentId", status)` dan `(status, "objectionWindowEnd")`. Tidak ada keunikan parsial yang ditegakkan oleh storage engine.
2. **Time-of-Check to Time-of-Use (TOCTOU)**: Pre-check aplikasi dijalankan di luar transaksi penguncian, membuka celah balapan mikrodetik antara pembacaan status dan penyisipan baris.

---

## 4. Implemented Architecture

Menerapkan **Option C (Defense-in-Depth)**:

```text
[HTTP Client A]                      [HTTP Client B]
       │                                    │
       ├─ findFirst(Pending) -> NULL         ├─ findFirst(Pending) -> NULL  (Fast-path check)
       │                                    │
       ├─ BEGIN $transaction                ├─ BEGIN $transaction
       │                                    │
       ├─ INSERT status = 'Pending' ────────┼──────────────────────────────> PostgreSQL Partial Index
       │                                    ├─ INSERT status = 'Pending' ──> Collides on Partial Index!
       │                                    │                                (SQLSTATE 23505 / P2002)
       ├─ COMMIT $transaction               ├─ ROLLBACK $transaction
       │                                    │
       ├─ Post-commit Notification          ├─ Catch P2002 -> ConflictException (HTTP 409)
       └─ Return 201 Created                └─ Return 409 Conflict (Zero side-effects)
```

1. **Storage Engine Layer**: Menjadi jaring pengaman atomik absolut (*single source of truth*).
2. **Service Layer**: Mengisolasi create dan audit log dalam transaksi Prisma, lalu menangkap error P2002 untuk memetakan ke respons bisnis 409.
3. **Pre-check Layer**: Menyaring penolakan sekuensial sebelum menyentuh transaksi database.

---

## 5. Migration

Dibuat file migrasi Prisma baru:  
[migration.sql](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/backend/prisma/migrations/20261007153000_add_unique_pending_correction_per_commitment/migration.sql)

```sql
-- Safety Guard: Ensure no duplicate Pending records exist before applying index
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "correction_requests"
        WHERE "status" = 'Pending'
        GROUP BY "targetCommitmentId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Duplicate Pending CorrectionRequests found on targetCommitmentId. Canonicalization policy is UNDEFINED. Resolve duplicates before applying index.';
    END IF;
END $$;

-- Create partial unique index enforcing max 1 Pending CorrectionRequest per Commitment
CREATE UNIQUE INDEX "unique_pending_correction_per_commitment"
ON "correction_requests"("targetCommitmentId")
WHERE "status" = 'Pending';
```

Eksekusi migrasi: Berhasil diaplikasikan ke database terisolasi melalui `npm run test:db:migrate`.

---

## 6. Service Changes

Dimodifikasi method `createMaterialCorrection` pada [CorrectionRequestService.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/backend/src/modules/correction-request/services/correction-request.service.ts#L324-L375):

```typescript
    let correction: any;
    try {
      correction = await this.prisma.$transaction(async (tx) => {
        const created = await tx.correctionRequest.create({
          data: {
            targetCommitmentId: commitment.id,
            requestedByUserId: user.userId,
            requestedChange: dto.requestedChange,
            reason: dto.reason.trim(),
            classification: CorrectionClassification.Material,
            policySnapshot,
            status: CorrectionStatus.Pending,
            objectionWindowStart,
            objectionWindowEnd,
          },
          include: {
            targetCommitment: true,
            requestedBy: { select: { id: true, fullName: true, email: true } },
          },
        });

        await this.auditService.record(
          {
            actorUserId: user.userId,
            action: 'CORRECTION_REQUESTED',
            relatedEntityType: 'CorrectionRequest',
            relatedEntityId: created.id,
            valueAfter: {
              id: created.id,
              targetCommitmentId: commitment.id,
              requestedChange: dto.requestedChange,
              reason: dto.reason.trim(),
              classification: CorrectionClassification.Material,
              objectionWindowStart,
              objectionWindowEnd,
            },
          },
          tx,
        );

        return created;
      });
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini',
        );
      }
      throw err;
    }
```

Pre-check `findFirst` pada baris 109–120 tetap utuh tanpa modifikasi.

---

## 7. Error Mapping

- Error Prisma yang ditangkap: `PrismaClientKnownRequestError` dengan kode `'P2002'`.
- Domain Exception yang dilempar: `ConflictException` (HTTP 409).
- Pesan Exception: `'Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini'`.
- Ketahanan: Tidak mengandalkan parsing nama index/constraint atau teks error raw SQL.

---

## 8. Test Changes

Diperbarui skenario `C02` pada [matrix-concurrency-locking.spec.ts](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/backend/test/integration-real/matrix-concurrency-locking.spec.ts#L235-L480) menjadi 6 sub-skenario komprehensif:
1. `C02-A`: Negative Database Test (Direct SQL Bypass).
2. `C02-B`: Concurrent Duplicate Race & P2002 Domain Mapping.
3. `C02-C`: Sequential Duplicate Rejection (Fast Path Pre-Check).
4. `C02-D`: Status Transition Uniqueness Release (`Pending -> Rejected`).
5. `C02-E`: Status Transition Uniqueness Release (`Pending -> Applied`).
6. `C02-F`: Unrelated Commitments Independence.

---

## 9. Real PostgreSQL Concurrency Evidence

Eksekusi `C02-B`:
- Dua request simultan dijalankan via `Promise.allSettled`.
- Hasil:
  - `fulfilled.length`: 1 (Status: `Pending`, Classification: `Material`).
  - `rejected.length`: 1 (Error: `ConflictException`, status code: 409).
  - Jumlah baris Pending di PostgreSQL: **tepat 1**.

---

## 10. Database Catalog Evidence

Pemeriksaan `pg_indexes` pada tabel `correction_requests`:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'correction_requests';
```

Output aktual:
```text
indexname: unique_pending_correction_per_commitment
indexdef:  CREATE UNIQUE INDEX unique_pending_correction_per_commitment ON public.correction_requests USING btree ("targetCommitmentId") WHERE (status = 'Pending'::"CorrectionStatus")
```

---

## 11. Audit Evidence

Pada pengujian `C02-B`:
- Tabel `audit_logs` diperiksa langsung:
  ```typescript
  const auditLogs = await prisma.auditLog.findMany({
    where: { relatedEntityType: 'CorrectionRequest', relatedEntityId: winnerResult.id, action: 'CORRECTION_REQUESTED' },
  });
  expect(auditLogs.length).toBe(1);
  ```
- Request yang kalah dibatalkan secara atomik oleh rollback PostgreSQL, sehingga **tidak meninggalkan baris `AuditLog` palsu**.

---

## 12. Notification Evidence

Pada pengujian `C02-B`:
- Dispatch notifikasi dipanggil setelah `$transaction` selesai.
- Transaksi yang kalah melempar error di dalam `$transaction` dan langsung melompat ke blok catch handler, sehingga pemanggilan `notificationService.dispatch` **tidak pernah dieksekusi untuk request yang kalah**.
- Jumlah notifikasi yang tercatat di database: **tepat 1** (hanya untuk pemenang).

---

## 13. Sequential Regression Evidence

Pada pengujian `C02-C`:
- Request kedua yang dikirim setelah request pertama selesai langsung ditolak oleh pre-check `findFirst` aplikasi tanpa memicu tabrakan database.
- Hasil: `ConflictException` (409), count Pending tetap tepat 1.

---

## 14. Lifecycle Evidence

- **`C02-D` (Pending → Rejected)**:
  Setelah koreksi pertama ditolak oleh Reviewer (`objectCorrection`), pengajuan koreksi material baru untuk komitmen yang sama berhasil dibuat (`Pending`). Di database tercatat 1 Rejected dan 1 Pending.
- **`C02-E` (Pending → Applied)**:
  Setelah koreksi pertama diterapkan oleh Scheduler (`evaluateExpiredObjectionWindows`), pengajuan koreksi material baru untuk komitmen yang sama berhasil dibuat (`Pending`). Di database tercatat 1 Applied dan 1 Pending.

---

## 15. Negative Constraint Evidence

Pada pengujian `C02-A`:
- Dua sesi fisik terpisah (`PID A != PID B`) mengeksekusi direct SQL INSERT `status = 'Pending'` untuk komitmen yang sama tanpa melalui service aplikasi.
- Sesi A berhasil menyimpan baris.
- Sesi B digugurkan oleh mesin PostgreSQL dengan:
  - Error code: `'23505'` (`unique_violation`)
  - Constraint: `'unique_pending_correction_per_commitment'`
- Membuktikan bahwa invarian ditegakkan secara fisik pada level storage engine dan tidak dapat di-bypass.

---

## 16. Git Mutation Integrity

Perubahan yang dilakukan pada sesi ini strictly terbatas pada:
1. `backend/prisma/migrations/20261007153000_add_unique_pending_correction_per_commitment/migration.sql` (Migrasi baru partial unique index).
2. `backend/src/modules/correction-request/services/correction-request.service.ts` (Penambahan try/catch penangkap P2002).
3. `backend/test/integration-real/matrix-concurrency-locking.spec.ts` (Pembaruan skenario C02).
4. `Design-Artifacts/Reports/S3-T1-DEF01-Remediation-Implementation-Report.md` (Laporan implementasi ini).

Tidak ada modifikasi pada `frontend/`, `package.json`, `package-lock.json`, maupun modul backend lainnya.

---

## 17. Residual Risks

1. **Migrasi pada Data Produksi dengan Duplikat Eksisting**:
   - Skrip migrasi telah dilengkapi safety guard `DO $$ ... RAISE EXCEPTION ... $$;` yang akan membatalkan migrasi secara aman (*fail-closed*) jika ditemukan duplikat di lingkungan manapun.
   - Kebijakan kanonikalisasi tetap berstatus `UNDEFINED` dan memerlukan keputusan bisnis apabila diterapkan pada database produksi historis.
2. **Kesesuaian Skala**:
   - Partial unique index memiliki overhead memori dan komputasi mendekati nol byte untuk tabel dengan volume normal 30–60 user.

---

## 18. Final DEF-01 Status

Berdasarkan seluruh kriteria penutupan (Section 24):
- [x] Partial unique index exists in actual PostgreSQL catalog.
- [x] Index predicate applies only to Pending.
- [x] Existing test DB has zero duplicate Pending groups.
- [x] Sequential duplicate request returns ConflictException (409).
- [x] Concurrent duplicate request reproduces race safely.
- [x] Exactly one Pending survives concurrent race.
- [x] Losing request receives ConflictException (409).
- [x] No duplicate successful-create AuditLog.
- [x] No false successful-create Notification.
- [x] Pending → Applied allows new Pending.
- [x] Pending → Rejected allows new Pending.
- [x] Different Commitments can independently have Pending requests.
- [x] Direct DB bypass demonstrates second Pending is rejected with 23505.
- [x] Existing CorrectionRequest regression tests pass (29/29 unit, 2/2 integration).
- [x] Real PostgreSQL integration suite passes (12/12 files, 57/57 tests).
- [x] No unrelated code/schema/frontend changes.

### **STATUS DEF-01: VERIFIED — CLOSED**

> **FASE BERIKUTNYA**: S3-T1 Phase 2B-2 (Load Testing 30–60 user) **TETAP BERSTATUS NOT STARTED**.  
> Tahap selanjutnya yang diizinkan adalah Independent Verification terhadap hasil remediasi DEF-01 ini.
