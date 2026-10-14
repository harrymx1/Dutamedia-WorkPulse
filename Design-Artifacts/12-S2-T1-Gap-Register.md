# S2-T1 Traceability Gap Register
## WorkPulse — Daily Accountability & Blocker Log System

| Document Metadata | Value |
|---|---|
| Document Owner | Engineering Traceability & Audit Agent |
| Task Reference | S2-T1 — Final Traceability Matrix & Gap Register |
| Version | 1.0 (Audit Gate Release) |
| Date | 5 Oktober 2026 |
| Status | ACTIVE AUDIT REGISTER |
| Governing Documents | 02-PRD.md, 05-SAD.md, 08-ADR.md, 10-S2-Audit-Findings-Register.md, 11-S2-T1-Traceability-Matrix.md |

---

## 1. Summary of Identified Gaps

Audit penelusuran persyaratan (S2-T1) mengidentifikasi **6 item kesenjangan/tindak lanjut** yang terdiri dari:
- **0 CRITICAL**
- **0 HIGH**
- **1 MEDIUM** (Integration verification gate pending for FR-11)
- **2 LOW** (Test verification gate pending for FR-13 & FR-19)
- **3 INFORMATIONAL / ACCEPTED RISK** (Scalability debt accepted via ADR-015, empirical usability timing, multi-user load testing)

---

## 2. S2-T1 Gap Register Table

| Gap ID | Requirement | Gap | Severity | Evidence | Decision Needed |
|---|---|---|---|---|---|
| **GAP-01** | PRD FR-11 | **Carry-Over Draft Banner Frontend Integration Gate**: Backend `carryOverDraft` telah aktif dan mengembalikan komitmen hari sebelumnya. Wiring frontend pada `MyTodayPage.vue` (`carryOverDrafts`) dan test suite `frontend/tests/carry-over-draft.spec.ts` telah tersedia di working tree, namun finding `S2-FR-11-1` pada `10-S2-Audit-Findings-Register.md` masih berstatus `OPEN` (`TRIAGE / REMEDIATION REQUIRED`) dan belum melalui verifikasi independen resmi serta penutupan administratif. | **MEDIUM** | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:382-412`; `frontend/src/pages/MyTodayPage.vue:85-125, 938-950`; `frontend/tests/carry-over-draft.spec.ts` | Eksekusi Human Decision Gate untuk memverifikasi secara independen penutupan finding S2-FR-11-1 sebelum rilis final S2. |
| **GAP-02** | PRD FR-13 | **Status Suggestion Dedicated Test Suite Verification Gate**: Ambang batas penentuan saran status diakui sebagai Fixed Product Heuristic melalui ADR-013. File test mandiri `status-suggestion.service.spec.ts` telah tersedia di working tree, namun `S2-TEST-GAP-4` masih berstatus `OPEN` (dan `S2-FR-13-1` berstatus `REMEDIATION PLANNED`) pada `10-S2-Audit-Findings-Register.md` dan belum melalui penutupan administratif resmi. | **LOW** | `backend/src/modules/daily-accountability/services/status-suggestion.service.ts:50-130`; `backend/src/modules/daily-accountability/services/status-suggestion.service.spec.ts:1-352`; ADR-013 | Eksekusi penutupan administratif untuk S2-FR-13-1 dan S2-TEST-GAP-4 berdasarkan ADR-013 dan test suite yang lulus. |
| **GAP-03** | PRD FR-19 | **BlockerOwnerResolver Dedicated Test Suite Verification Gate**: Implementasi resolusi `OwnerNeededType.ProjectAuthority` vs `OrganizationalAuthority` telah ada di kode produksi. Test suite terdedikasi `blocker-owner-resolver.service.spec.ts` telah tersedia di working tree, namun finding `S2-TEST-GAP-5` masih berstatus `OPEN` pada `10-S2-Audit-Findings-Register.md` dan belum melalui penutupan administratif resmi. | **LOW** | `backend/src/modules/blocker/services/blocker-owner-resolver.service.ts:35-85`; `backend/src/modules/blocker/services/blocker-owner-resolver.service.spec.ts:1-506` | Eksekusi penutupan administratif untuk S2-TEST-GAP-5 berdasarkan test suite mandiri yang lulus. |
| **GAP-04** | PRD FR-28 | **Risiko Starvasi Batch Pengingat Cutoff (>200 User Active)**: Pemotongan kandidat in-memory `slice(0, limit)` pada `DailyAccountabilityService` sebelum deduplikasi notifikasi di `SchedulerService` dapat menyebabkan starvasi jika populasi karyawan aktif yang belum submit melampaui limit defensif 200 user. | **INFORMATIONAL** | `backend/src/modules/daily-accountability/services/daily-accountability.service.ts:1385`; `backend/src/modules/scheduler/services/scheduler.service.ts:318-348`; Finding `S2-PERF-FR28-1` | **ACCEPTED RISK / ADR**: Telah disetujui secara resmi oleh Human Authority melalui **ADR-015** dan **KL-10** sebagai utang teknis MVP yang aman untuk skala operasional awal 30–60 user. Tidak ada aksi remediasi pada fase S2. |
| **GAP-05** | PRD AC-17 / NFR-01 | **Pengukuran Empiris Usability Check-in (≤ 3 Menit)**: Desain antarmuka, pemilihan chip risiko cepat, ringkasan output template kontekstual, dan copy-forward draft telah meminimalkan interaksi pengetikan pengguna. Namun, pembuktian kuantitatif batas waktu penyelesaian normal (≤ 3 menit) memerlukan pengujian stopwatch empiris pada sesi pengujian internal pengguna. | **INFORMATIONAL** | `frontend/src/pages/MyTodayPage.vue`; `frontend/tests/role-based-prompt.spec.ts`; `frontend/tests/carry-over-draft.spec.ts` | Dijadwalkan sebagai bagian dari User Acceptance Testing (UAT) / Fase S3. |
| **GAP-06** | PRD NFR-03 | **Pengujian Beban Konkurensi Multi-User Response Time (< 2 Detik)**: Waktu respons API dan kueri database telah terbukti sub-detik (<100ms) pada eksekusi automated test suite terisolasi dengan pengindeksan gabungan PostgreSQL yang optimal. Namun, pembuktian kepatuhan waktu respons di bawah beban operasional riil konkuren perusahaan membutuhkan uji beban multi-user. | **INFORMATIONAL** | `backend/prisma/schema.prisma` (composite indexes); `backend/test/integration/concurrency.spec.ts` | Dijadwalkan sebagai bagian dari System Integration Testing (SIT) / Performance Benchmarking pada Fase S3. |

---

## 3. Governance Notes

1. Tidak ada gap baru berkategori **CRITICAL** atau **HIGH** yang memblokir penuntasan S2-T1. Seluruh invariant fungsional dan keamanan utama (otentikasi, baseline lock, EOD post-cutoff rejection, validasi kondisional, IDOR prevention, presigned URL TTL, immutable audit trail) telah terbukti dan tertutup.
2. Item **GAP-01**, **GAP-02**, dan **GAP-03** berasal dari finding S2 existing yang pekerjaan teknisnya (kode/test) telah selesai di working tree namun memerlukan formal gate verification dan register closure terpisah dari tugas penelusuran matriks ini.
3. Item **GAP-04** adalah risiko yang telah diterima secara sadar melalui ADR-015 dan KL-10.
4. Item **GAP-05** dan **GAP-06** adalah non-functional validation target yang secara alami mensyaratkan lingkungan operasional UAT/SIT di fase berikutnya (S3).
