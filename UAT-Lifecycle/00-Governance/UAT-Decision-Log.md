# WorkPulse — Master Decision Log & Architectural Rulings

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Acceptance Owner:** Harry  
> **Tanggal Mulai:** 30 Oktober 2026  
> **Tujuan:** Sumber kebenaran tunggal (*Single Source of Truth*) pencatatan seluruh keputusan strategis, arsitektural, dan tata kelola pengujian yang ditetapkan oleh Acceptance Owner.

---

## DAFTAR KEPUTUSAN FORMAL ACCEPTANCE OWNER

### [DEC-001-UAT] Penangguhan Sementara Manual UAT untuk Penerapan Controlled Lifecycle
- **Decision ID:** `DEC-001-UAT`
- **Tanggal:** 30/10/2026 — 15:20 WIB
- **Pengambil Keputusan (Decision Maker):** Harry (Acceptance Owner)
- **Konteks:** Manual UAT telah berjalan hingga Kelompok 8 (`TC-BLKR-001` Langkah 16). Terkumpul 2 defect resmi (`DEF-001`, `DEF-002`) dan 44 kandidat perbaikan (`IMP-001` s.d. `IMP-044`).
- **Opsi yang Dipertimbangkan:**
  1. *Opsi 1:* Melanjutkan UAT manual hingga selesai tanpa memperbaiki bug dan feedback UI/UX di tengah jalan.
  2. *Opsi 2:* Menangguhkan sementara UAT, mengamankan seluruh baseline di GitHub, merekonsiliasi temuan, menyusun rencana perbaikan produk, memperbarui paket UAT, melakukan verifikasi teknis, lalu melanjutkan UAT secara terstruktur (*Controlled Lifecycle*).
- **Keputusan:** Memilih **Opsi 2**. Menerbitkan Master Directive pelaksanaan *Controlled UAT Lifecycle & Continuous Improvement*.
- **Alasan (Rationale):** Menjaga integritas data pengujian, mencegah penumpukan gap antara dokumen dan aplikasi riil, serta memastikan kualitas rilis WorkPulse memenuhi standar tertinggi sebelum diluncurkan ke seluruh karyawan.
- **Dampak (Impact):** Status UAT beralih menjadi `SUSPENDED` pada checkpoint `TC-BLKR-001`. Pengujian manual dijeda hingga Phase 0–6 diselesaikan dan disetujui Harry.
- **Fase / Temuan Terkait:** Seluruh Fase Lifecycle, `DEF-001` s.d. `DEF-002`, `IMP-001` s.d. `IMP-044`.
- **Tindak Lanjut:** Melaksanakan Phase -1 (Pengamanan Baseline GitHub) dan menyusun Master Plan sebelum meminta persetujuan untuk memasuki Phase 0.

---

### [DEC-002-UAT] Penetapan Baseline Checkpoint pada `c9fb597` & Pencatatan Governance pada `5af797c`
- **Decision ID:** `DEC-002-UAT`
- **Tanggal:** 30/10/2026 — 15:27 WIB
- **Pengambil Keputusan:** Harry (Acceptance Owner) via Master Directive Mandat Phase -1
- **Konteks:** Menyelamatkan seluruh progres 18 file artefak UAT yang telah dimodifikasi dan dibuat selama sesi pengujian tanggal 30 Oktober 2026 ke repository GitHub sebelum lifecycle dimulai.
- **Opsi yang Dipertimbangkan:**
  1. Commit massal seluruh folder termasuk scratch files lokal.
  2. Explicit Staging Control (hanya men-stage artefak UAT resmi, mengecualikan scratch archive lokal dan file konfigurasi rahasia).
- **Keputusan:** Menerapkan **Explicit Staging Control**. Commit `c9fb597` mengamankan 18 file UAT, dan commit `5af797c` mengamankan dokumen rekam jejak `Repository-Baseline-Record.md`.
- **Alasan:** Mencegah pencemaran repositori dari file sampah dan memastikan tidak ada kredensial sensitif yang terpublikasi.
- **Dampak:** Kondisi pre-lifecycle project tersimpan 100% aman dan terverifikasi di GitHub remote `origin/main`.
- **Fase Terkait:** Phase -1 (Subphase -1.1 s.d. -1.6).
- **Tindak Lanjut:** Melaporkan hasil baseline record kepada Harry dan menyusun Master Lifecycle Management Plan.

---
*Log keputusan ini akan terus diperbarui secara kronologis sepanjang siklus hidup UAT WorkPulse berlangsung.*
