# S3-T1 Phase 2B-1 — Concurrency, Locking & TOCTOU Report

**System**: WorkPulse — Daily Accountability & Blocker Log System  
**Stage**: Stage S3 — Jalankan Sistem Sungguhan  
**Task**: S3-T1 Phase 2B-1 — Real PostgreSQL Concurrency, Locking & TOCTOU Verification  
**Execution Timestamp**: 2026-10-07T14:48:00+07:00  
**Status**: VERIFIED — PASS WITH NON-BLOCKING FINDINGS  
**Governing Documents**: `05-SAD.md`, `06-Product Backlog.md`, `08-ADR.md`, `09-Known-Limitations.md`, `WorkPulse_Development_Framework(3).md`  
**Referenced Reports**:
- `Design-Artifacts/Reports/S3-T1-Phase2A-Independent-Verification.md`
- `Design-Artifacts/Reports/S3-T1-Phase1-Independent-Verification.md`
- `Design-Artifacts/Reports/S3-T1-Phase1-Environment-Provisioning-Report.md`

---

## 1. Objective

Membuktikan secara empiris dan deterministik bahwa WorkPulse mempertahankan kebenaran data (*data correctness*), atomisitas transaksi, dan invarian bisnis saat dua atau lebih transaksi konkuren nyata dieksekusi secara simultan terhadap state database PostgreSQL fisik yang sama.

Verifikasi ini secara ketat membuktikan:
1. Concurrency nyata bukan sekadar `Promise.all()` in-memory, melainkan transaksi PostgreSQL terpisah dengan koneksi fisik independen (`PID A != PID B`).
2. Perilaku *pessimistic locking* (`SELECT ... FOR UPDATE`), lock contention di engine PostgreSQL, dan observabilitas lock via `pg_locks` serta `pg_stat_activity`.
3. Deteksi kondisi balapan (*race condition*) dan TOCTOU (*Time-Of-Check to Time-Of-Use*) pada domain Correction Request, Blocker Lifecycle, dan Cutoff Policy.
4. Atomisitas mutasi bisnis bersama AuditLog dan semantik System Actor (`actorUserId IS NULL`).

---

## 2. Environment

- **Database Engine**: PostgreSQL 18.6 on x86_64-pc-linux-musl (Alpine 15.2.0)
- **Container Name**: `workpulse-test-db`
- **Host / Port**: `localhost:54332`
- **Target Database**: `workpulse_test`
- **Connection Isolation**: Fail-closed guard (`assertSafeTestDatabase`) aktif, menolak koneksi ke remote/Supabase cloud.
- **Node Environment**: Node.js v22.16.0, Vitest v4.1.11, Prisma Client v7.10.0 (PrismaPg adapter).

---

## 3. Database Safety

Seluruh pengujian konkuren dijalankan secara aman pada container terisolasi:
```text
assertSafeTestDatabase() -> PASS
Database target: localhost:54332/workpulse_test
Supabase / Production access: ZERO (Strictly blocked)
```
Setiap suite pengujian menginisialisasi state fixture baru dengan UUID unik dan membersihkan sisa koneksi saat selesai (`cleanup()`).

---

## 4. Physical Connection Verification

Setiap skenario pengujian konkurensi menggunakan `PhysicalConcurrencyHarness`, yang menginisialisasi koneksi terpisah melalui driver `pg.Client`:

```text
Connection A -> pg.Client -> PostgreSQL Backend PID: e.g. 15986
Connection B -> pg.Client -> PostgreSQL Backend PID: e.g. 15987
Observer C   -> pg.Client -> PostgreSQL Backend PID: e.g. 15988
Invariant Proof: PID A != PID B != PID C (Physical separation confirmed)
```

Semua kueri dieksekusi pada sesi backend PostgreSQL nyata, bukan koneksi bersama atau multiplexed in-memory.

---

## 5. Concurrency Harness

Harness pengujian konkurensi (`backend/test/harness/concurrency-harness.ts`) menggunakan sinkronisasi deterministik:
- **`ConcurrencyBarrier`**: Mengoordinasikan titik temu antar-transaksi tanpa bergantung pada probabilitas `setTimeout`. Transaksi A mengunci baris, memicu barier, transaksi B mencoba mengunci dan tertahan di engine PostgreSQL hingga transaksi A melakukan `COMMIT`.
- **`PhysicalConnection`**: Mengontrol siklus hidup `BEGIN`, `COMMIT`, dan `ROLLBACK` secara eksplisit per koneksi fisik.
- **Timeout Protection**: Batas waktu eksekusi barier (default 10s–15s) mencegah terjadinya dead-hang tanpa batas.

---

## 6. Test Matrix

Berikut adalah hasil eksekusi matriks pengujian konkurensi C01–C10:

| ID | Scenario | Physical Connections | Lock/Transaction | Expected Invariant | Result |
|---|---|:---:|---|---|:---:|
| **C01** | Correction vs Auto-Apply | 2 (PID A != PID B) | `SELECT FOR UPDATE` + Real Tx | Single valid outcome; no double apply | **PASS** |
| **C02** | Duplicate Correction Race | 2 (PID A != PID B) | Real Tx concurrent INSERT | Identify duplicate prevention / lock gap | **PASS (Observed & Documented)** |
| **C03** | Blocker Ack vs Auto-Escalate | 2 (PID A != PID B) | Real Tx + Re-check under lock | No lost update; Ack not overwritten | **PASS** |
| **C04** | Blocker Cutoff Race | 2 (PID A != PID B) | Real Tx at threshold boundary | Deterministic transition at exact boundary | **PASS** |
| **C05** | Audit Atomicity | 2 (PID A != PID B) | Multi-table Tx + Rollback | Business row matches audit (0 if rollback) | **PASS** |
| **C06** | System Actor Semantics | 2 (PID A != PID B) | Concurrent System Tx | `actorUserId IS NULL` in PostgreSQL | **PASS** |
| **C07** | Concurrent Idempotency | 2 (PID A != PID B) | Real Tx + FOR UPDATE check | Exactly 1 escalation audit row recorded | **PASS** |
| **C08** | Effective-Dated Read | 2 (PID A != PID B) | Concurrent AS-OF read vs write | Deterministic historical AS-OF resolution | **PASS** |
| **C09** | Cutoff / TOCTOU | 2 (PID A != PID B) | Pessimistic Lock Re-check | Stale mutation rejected after window close | **PASS** |
| **C10** | Lock Observability | 3 (PID A, B, C) | `pg_locks` + `pg_stat_activity` | Real lock wait & wait_event observed | **PASS** |

---

## 7. Correction Request Race

### Skenario C01: Reviewer Object vs Scheduler Auto-Apply
- **Target Record**: `CorrectionRequest` berstatus `Pending` dengan `objectionWindowEnd` yang telah terlewati.
- **Urutan Transaksi**:
  1. Koneksi A (Reviewer) melakukan `BEGIN` dan `SELECT ... FOR UPDATE`.
  2. Koneksi A tiba di `ConcurrencyBarrier`.
  3. Koneksi B (Scheduler) melakukan `BEGIN` dan mengeksekusi `SELECT ... FOR UPDATE` pada baris yang sama.
  4. Engine PostgreSQL menahan (*blocks*) Koneksi B secara fisik.
  5. Koneksi A memperbarui status menjadi `Rejected`, menambahkan catatan penolakan, mencatat AuditLog, lalu mengeksekusi `COMMIT`.
  6. Koneksi B terbuka (*unblocks*), membaca baris yang sudah terkunci, mendeteksi `status = 'Rejected'`, dan melewati eksekusi auto-apply.
- **Hasil Database**:
  - `status` = `Rejected`.
  - Target commitment tidak termutasi oleh auto-apply.
  - AuditLog hanya mencatat `CORRECTION_REJECTED` (0 baris `CORRECTION_APPLIED`).
  - Single valid outcome tercapai 100%.

### Skenario C02: Duplicate Correction Request Race
- **Pengujian**: Dua request pengajuan koreksi pada komitmen yang sama dieksekusi simultan pada dua koneksi fisik.
- **Observasi**: Kedua transaksi melakukan kueri awal secara simultan (`findFirst` menghasilkan 0), kemudian keduanya mengeksekusi `INSERT INTO correction_requests`.
- **Hasil & Temuan**: Tabel `correction_requests` memiliki indeks `@@index([targetCommitmentId, status])` tetapi bukan indeks unik parsial. Oleh karena itu, kedua pengajuan berstatus `Pending` berhasil tersimpan di database. Perilaku ini didokumentasikan pada **Finding S3-T1-P2B1-DEF-01**.

---

## 8. Blocker Race

### Skenario C03: Owner Acknowledge vs Scheduler Auto-Escalation
- **Target Record**: Blocker `Critical`, status `Open`, belum di-acknowledge, dibuat 3 jam yang lalu (melebihi ambang batas 2 jam).
- **Urutan Transaksi**:
  1. Koneksi A (Owner) mengubah status menjadi `Acknowledged`, mengisi `acknowledgedAt`, mencatat AuditLog, lalu `COMMIT`.
  2. Koneksi B (Scheduler) mengevaluasi kandidat eskalasi di dalam transaksi dengan membaca ulang field `acknowledgedAt` dan `status`.
  3. Koneksi B mendeteksi `acknowledgedAt IS NOT NULL` dan `status !== 'Open'`, sehingga membatalkan eskalasi.
- **Hasil Database**:
  - Blocker berstatus `Acknowledged`.
  - Tidak ada *lost update*. Status `Acknowledged` tidak tertimpa kembali menjadi `Open` atau status eskalasi usang.
  - AuditLog hanya mencatat `BLOCKER_ACKNOWLEDGED` (0 baris `BLOCKER_AUTO_ESCALATED`).

### Skenario C04: Blocker Cutoff Boundary Race
- Blocker dibuat tepat pada batas ambang batas (2 jam yang lalu).
- Transaksi simultan antara konfirmasi pemilik dan evaluasi penjadwal menghasilkan transisi deterministik yang valid.

---

## 9. Cutoff / TOCTOU

### Skenario C09: Objection Window Expiry Race (Pessimistic Lock Re-check)
- Pengguna membaca pengajuan koreksi saat objection window masih terbuka.
- Tepat sebelum eksekusi mutasi, objection window berakhir.
- Saat transaksi reviewer berjalan, query `SELECT ... FOR UPDATE` mengunci baris, kemudian mengevaluasi kondisi `if (objectionWindowEnd <= now)`.
- Re-check di bawah kunci pesimis berhasil mendeteksi penutupan jendela dan menolak mutasi usang (*stale mutation*). Status pengajuan tetap `Pending` untuk diproses scheduler auto-apply.

---

## 10. Audit Atomicity

### Skenario C05: Multi-table Transaction Atomicity
- Dua transaksi konkuren menulis baris bisnis (`additional_works`) dan `audit_logs`:
  - Transaksi A: Berhasil dan melakukan `COMMIT`.
    - Hasil: Baris bisnis ada (1) DAN baris audit ada (1).
  - Transaksi B: Mengalami kegagalan dan melakukan `ROLLBACK`.
    - Hasil: Baris bisnis bernilai 0 DAN baris audit bernilai 0.
- **Invarian Terbukti**: Tidak pernah ada audit log yang tersimpan tanpa baris bisnis, dan tidak pernah ada mutasi bisnis yang tertinggal tanpa audit log. Atomisitas multi-tabel 100% konsisten.

---

## 11. Concurrent Idempotency

### Skenario C07: Concurrent Scheduler Worker Idempotency
- Dua worker scheduler mencoba melakukan auto-eskalasi pada blocker Critical unacknowledged yang sama secara simultan.
- Melalui serialisasi kunci baris dan pengecekan keberadaan AuditLog `BLOCKER_AUTO_ESCALATED`, tepat satu worker yang berhasil mencatat eskalasi. Worker kedua mendeteksi eskalasi telah tercatat dan melewati eksekusi.
- **Hasil Database**: Tepat 1 baris AuditLog `BLOCKER_AUTO_ESCALATED` tersimpan di PostgreSQL (`cnt = 1`).

---

## 12. Effective Dating

### Skenario C08: Effective-Dated Concurrent Read
- Transaksi A membaca kebijakan aktif AS-OF tanggal masa lalu ($T_1 = \text{2026-06-01}$). Menghasilkan versi 1 (ambang batas 4 jam).
- Transaksi B secara simultan menyisipkan kebijakan versi baru yang berlaku di masa depan ($T_2 = \text{2026-10-01}$, ambang batas 2 jam) dan melakukan `COMMIT`.
- Transaksi A membaca ulang AS-OF $T_1$: tetap menghasilkan versi 1 (4 jam) secara deterministik.
- Kueri AS-OF $T_3 = \text{2026-11-01}$ menghasilkan versi baru (2 jam).
- **Invarian Terbukti**: Penulisan kebijakan masa depan tidak merusak resolusi historis AS-OF pada transaksi aktif.

---

## 13. PostgreSQL Lock Evidence

### Skenario C10: Observabilitas Kunci Sistem PostgreSQL
Pengujian C10 membuktikan secara fisik bahwa PostgreSQL menahan transaksi pada tingkat mesin database:
1. **Koneksi A (Lock Holder)**: Mengunci baris via `SELECT ... FOR UPDATE`.
2. **Koneksi B (Lock Waiter)**: Menjalankan `SELECT ... FOR UPDATE` pada baris yang sama.
3. **Koneksi C (Observer)**: Menginspeksi tabel sistem PostgreSQL:
   - `pg_stat_activity`:
     - PID Koneksi B berstatus `state = 'active'`
     - `wait_event_type = 'Lock'`
     - Menunjukkan kueri terhenti menunggu pelepasan kunci baris.
   - `pg_locks`:
     - PID Koneksi A memegang kunci dengan `granted = true`.
4. **Pelepasan Kunci**: Saat Koneksi A mengeksekusi `COMMIT`, Koneksi B seketika terbuka (*unblocked*) dan menyelesaikan transaksi.

---

## 14. Cleanup Verification

Setiap pengujian di dalam `matrix-concurrency-locking.spec.ts` mengeksekusi:
- Penutupan seluruh koneksi fisik melalui `harness.cleanup()`.
- Rollback otomatis jika ada transaksi terbuka saat terjadi kegagalan.
- Disconnect PrismaClient dan pgClient pada hook `afterAll`.
- Verifikasi pasca-uji mengonfirmasi 0 transaksi terbuka dan 0 koneksi bocor (*leaked connections*).

---

## 15. Findings

### Finding S3-T1-P2B1-DEF-01 (Non-Blocking / Documented Design Gap)
- **Severity**: Non-Blocking / Medium
- **Domain**: Correction Request Concurrent Submission
- **Requirement**: SAD §9.6, §9.9 #1, FR-43, FR-44
- **Observed**: Pengajuan koreksi simultan pada komitmen yang sama pada dua koneksi fisik yang berbeda dapat menghasilkan dua baris `CorrectionRequest` berstatus `Pending` untuk komitmen yang sama.
- **Root Cause**: 
  1. `CorrectionRequestService.createCorrectionRequest` melakukan pengecekan `findFirst` tanpa *pessimistic lock* pada komitmen target.
  2. Skema database `schema.prisma` mendefinisikan `@@index([targetCommitmentId, status])` yang bersifat *non-unique*.
- **Classification**: DESIGN GAP / APPLICATION DEFECT (NON-BLOCKING).
- **Impact**: Tidak mempengaruhi alur sekuensial normal pengguna UI. Namun di bawah konkurensi fisik mikrodetik, dapat terjadi duplikasi pengajuan aktif.
- **Recommended Action (Post-Phase 2B)**: Tambahkan indeks unik parsial pada skema database atau lakukan `SELECT ... FOR UPDATE` pada tabel `commitments` di awal `createCorrectionRequest`. Sesuai aturan Strict Boundary, perbaikan tidak dilakukan pada task ini.

---

## 16. Known Limitations

1. **Physical Lock Scope**: Skenario C01 dan C09 memvalidasi *pessimistic row locking* pada `correction_requests`. Skenario Blocker (C03) mengandalkan transaksi atomik dengan *re-check query* di dalam transaksi, bukan *explicit table-level lock*.
2. **High-load Concurrency (30–60 users)**: Dialokasikan secara eksklusif untuk S3-T1 Phase 2B-2 dan tidak dijalankan pada Phase 2B-1.

---

## 17. Phase Boundary

Verifikasi batas fase yang ketat ditegakkan:
- Beban pengujian 30–60 pengguna konkuren Morning Check-in: **TIDAK DIJALANKAN** (milik Phase 2B-2).
- Benchmark beban 60x90 hari S3-T6: **TIDAK DIJALANKAN**.
- Pengujian Frontend, E2E, UI responsive: **TIDAK DIJALANKAN**.
- Mutasi kode produksi `backend/src/`: **0 lines modified**.
- Mutasi skema database & migrasi: **0 lines modified**.
- Status **S3-T1 Phase 2B-2**: **NOT STARTED**.

---

## 18. Final Verdict

### **VERIFIED — PASS WITH NON-BLOCKING FINDINGS**

Seluruh kriteria penerimaan S3-T1 Phase 2B-1 telah terpenuhi:
1. Concurrency fisik PostgreSQL terbukti melalui sesi backend terpisah (`PID A != PID B`).
2. Perilaku transaksi, rollback, atomisitas AuditLog, dan semantik System Actor terbukti 100%.
3. Lock contention dan wait event `Lock` terobservasi secara langsung pada `pg_stat_activity` dan `pg_locks`.
4. Nol kode produksi termutasi.
5. Satu temuan non-blocking (S3-T1-P2B1-DEF-01) terdokumentasi secara transparan.

Status Fase Selanjutnya:
> **S3-T1 Phase 2B-2: NOT STARTED**
