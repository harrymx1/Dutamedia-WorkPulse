# Architectural Decision Records (ADR)
## WorkPulse — Daily Accountability & Blocker Log System (Dutamedia)

| Dokumen | Nilai |
|---|---|
| Document Owner | Dutamedia |
| Version | 1.0 |
| Status | Active |
| Date | September 2026 |
| Classification | Internal & Confidential |
| Referensi | PDD v1.1, PRD v1.1, SAD v1.0, Product Backlog v1.0 |

> Dokumen ini mencatat **keputusan arsitektur yang dibuat selama fase implementasi** — khususnya keputusan yang menutup gap atau open item dari SAD §23.2. Setiap ADR bersifat permanen dan menjadi bagian dari kontrak desain yang mengikat seluruh fase implementasi berikutnya.

---

## ADR-001 — AdditionalWork Tidak Memiliki Lock Permanen

| Atribut | Nilai |
|---|---|
| **ID** | ADR-001 |
| **Tanggal** | 2026-09-16 |
| **Status** | ACCEPTED |
| **Menutup Open Item** | SAD §23.2.A1 |
| **Berlaku mulai** | EPIC-07-T6 (DailyAccountabilityModule) |

### Konteks

SAD §5.4 mendefinisikan kolom `AdditionalWork.isLocked = true` yang di-set oleh scheduled job bersamaan dengan `Commitment.isEodLocked`. SAD §9.8 kemudian mencatat bahwa tidak ada mekanisme koreksi untuk `AdditionalWork` yang sudah terkunci, dan mendaftarkannya sebagai open item (§23.2.A1) yang perlu dikonfirmasi: apakah keterbatasan ini disengaja, atau gap PRD?

Product Backlog §6.1 (Open Item A1) mewajibkan keputusan ini diambil **sebelum EPIC-07-T6** dikerjakan.

### Analisis terhadap PDD & PRD

| Dokumen | Bunyi | Implikasi |
|---|---|---|
| **PRD FR-06** | "Employee dapat mencatat Additional Work kapan saja setelah Morning Check-in" | Tidak ada batasan waktu untuk pencatatan — by design |
| **PDD §5** | "Additional Work — pencatatan pekerjaan material yang muncul setelah Morning Check-in" | Sifatnya tidak terprediksi; tidak memiliki konsep baseline Morning |
| **PRD FR-07** | "Additional Work tidak mengubah baseline Morning Commitment" | AdditionalWork adalah entitas independen dari baseline |
| **PRD FR-43** | "Employee dapat mengajukan Correction Request atas Morning Commitment yang sudah locked" | CorrectionRequest secara eksplisit hanya berlaku untuk Morning Commitment, bukan AdditionalWork |
| **PRD FR-08** | "Employee dapat mengisi EOD Outcome... untuk tiap Commitment dan Additional Work" | Outcome AdditionalWork diisi di EOD — bukan di Morning |

### Keputusan

**`AdditionalWork` TIDAK memiliki lock permanen yang memblokir pencatatan atau koreksi.**

Secara spesifik:

1. **Field `text`, `reason`, `assignedByUserId`** — dapat dibuat dan diedit tanpa batas waktu cutoff, karena `AdditionalWork` by design muncul kapan saja dan tidak memiliki konsep baseline yang perlu dilindungi.

2. **Field `outcome` dan `continuation`** — dapat diisi/diedit tanpa gating `CorrectionRequest`, karena `CorrectionRequest` secara PRD FR-43 hanya berlaku untuk `Morning Commitment` yang sudah locked.

3. **Setiap write (POST/PATCH) pada `AdditionalWork` wajib dicatat via `AuditService.record()`** — sebagai pengganti integritas historis yang setara. AuditLog bersifat immutable (append-only per SAD §5.10), sehingga seluruh riwayat perubahan tetap terlacak tanpa memblokir koreksi.

4. **Kolom `isLocked` pada skema Prisma** — kolom ini ada di skema (EPIC-01 sudah di-migrate), namun dalam implementasi endpoint EPIC-07-T6, `isLocked` tidak digunakan sebagai validator pemblokiran write. Kolom dipertahankan untuk kompatibilitas skema tanpa dihapus.

### Konsekuensi untuk Implementasi

| Area | Dampak |
|---|---|
| **EPIC-07-T6** (POST/PATCH /additional-work) | Endpoint tidak memvalidasi `isLocked`. Setiap write wajib memanggil `AuditService.record()` dalam transaction |
| **EPIC-15-T1** (Scheduler — Frequent Cycle) | Job `evaluateCutoffLock()` tetap men-set `AdditionalWork.isLocked = true` untuk konsistensi skema, namun tidak menjadi enforcer di level endpoint |
| **EPIC-09** (CorrectionRequestModule) | Scope CorrectionRequest tetap hanya Morning Commitment — tidak diperluas ke AdditionalWork |
| **EPIC-07-T2** (availableActions) | AdditionalWork selalu menampilkan aksi `edit` di `availableActions`, terlepas dari nilai `isLocked` |

### Alignment dengan Prinsip Sistem

Keputusan ini konsisten dengan prinsip utama WorkPulse dari PDD:

> "Audit Trail — immutable, mencakup perubahan commitment setelah cutoff, status, blocker, dan manager note" (PDD §5 In-Scope)

AuditLog yang immutable mengisi peran "pengaman integritas" tanpa perlu memblokir koreksi pada entitas yang by design tidak punya konsep baseline terkunci.

---

*Dokumen ini terbuka untuk ADR berikutnya seiring implementasi berlanjut.*
