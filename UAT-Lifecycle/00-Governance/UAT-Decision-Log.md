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

### [DEC-002-UAT] Rekomendasi Teknis Baseline Checkpoint `c9fb597` & Dokumen Governance (`5af797c`, `fbccbf0`)
- **Decision ID:** `DEC-002-UAT`
- **Tanggal:** 30/10/2026 — 15:27 WIB
- **Pengambil Keputusan:** Harry (Acceptance Owner) [Mandat Pelaksanaan Phase -1] & Co-Pilot [Pelaksana Teknis Checkpoint & Governance]
- **Konteks:** Pelaksanaan mandat Phase -1 untuk mengamankan 18 file artefak UAT pra-lifecycle ke repository GitHub serta menyusun kerangka kerja tata kelola Master Plan.
- **Opsi yang Dipertimbangkan:**
  1. Commit massal seluruh folder termasuk scratch files lokal.
  2. Explicit Staging Control (hanya men-stage artefak UAT resmi, mengecualikan scratch archive lokal dan file konfigurasi rahasia).
- **Tindakan Teknis yang Diambil:** Menerapkan **Explicit Staging Control**. Commit `c9fb597` mengamankan 18 file UAT, commit `5af797c` menyimpan deliverable `Repository-Baseline-Record.md`, dan commit `fbccbf0` menyimpan 5 master register & management plan.
- **Status Validasi:** Diserahkan kepada Acceptance Owner untuk audit lanjutan melalui `Post-Baseline-Verification-Report.md` (Catatan: Atribusi formal disempurnakan melalui koreksi `VERIF-FIND-004`).
- **Alasan:** Memastikan integritas working tree, isolasi file non-produksi, dan penyediaan kerangka tata kelola lengkap sebelum eksekusi lanjutan.
- **Fase Terkait:** Phase -1 (Subphase -1.1 s.d. -1.6) & Step 3 Governance Setup.

---

### [DEC-003-UAT] Otorisasi Koreksi Tata Kelola & Penanganan Mitigasi Keamanan
- **Decision ID:** `DEC-003-UAT`
- **Tanggal:** 30/10/2026 — 15:47 WIB
- **Pengambil Keputusan:** Harry (Acceptance Owner)
- **Konteks:** Peninjauan terhadap *Post-Baseline Governance Verification Report* yang mengidentifikasi temuan keamanan kritis (`VERIF-FIND-001`) dan 7 temuan tata kelola (`VERIF-FIND-002` s.d. `VERIF-FIND-008`).
- **Keputusan Strategis:**
  1. **Mitigasi Keamanan (`VERIF-FIND-001`):** Penanganan perubahan visibilitas repository (menjadi Private) dan rotasi kredensial demo diambil alih langsung oleh Acceptance Owner. Co-Pilot diinstruksikan melakukan verifikasi ulang setelah tindakan dinyatakan selesai. Status finding keamanan tetap OPEN sampai seluruh mitigasi terverifikasi.
  2. **Koreksi Tata Kelola (`VERIF-FIND-002` s.d. `VERIF-FIND-008`):** Memberikan otorisasi penuh kepada Co-Pilot untuk:
     - Menegaskan 44 improvement sebagai candidate scope (bukan scope aktif siklus sebelum Phase 2).
     - Memisahkan Application Release Version (`v1.0.0-rcX`) dan UAT Package Version (`v1.X.X-uat-pkg`).
     - Menyesuaikan klausul atribusi keputusan pada `DEC-002-UAT`.
     - Memperbarui `Repository-Baseline-Record.md` dan `UAT-Phase-Register.csv` dengan silsilah commit lengkap (`c9fb597`, `5af797c`, `fbccbf0`).
     - Mengategorikan seluruh perubahan governance sebagai `Governance Documentation` pada Change Register.
     - Menambahkan *Acceptance Owner Formal Waiver Protocol* pada exit criteria Phase 5.
     - Memperjelas exit criteria Phase 0 berfokus pada penguncian checkpoint, bukan penyelesaian test case.
     - Melengkapi rincian deliverables Phase 4 dan Phase 7 sesuai Master Directive.
  3. **Penegakan Change Control:** Tidak ada perubahan kode aplikasi, tidak ada modifikasi DB/seeder, dan tidak ada Git history rewriting.
- **Dampak:** Kerangka kerja tata kelola selaras 100% dengan prinsip akuntabilitas dan kontrol ketat Acceptance Owner.
- **Tindak Lanjut:** Memperbarui seluruh artefak governance terkait, memvalidasi status setiap finding, dan menyajikan laporan final untuk gerbang evaluasi Phase -1.

---
*Log keputusan ini akan terus diperbarui secara kronologis sepanjang siklus hidup UAT WorkPulse berlangsung.*
