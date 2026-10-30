# WorkPulse — Repository Baseline Record & GitHub Checkpoint

> **Dokumen:** Repository Baseline Record (Phase -1 Deliverable)  
> **Proyek:** WorkPulse — Daily Accountability & Blocker Log System  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Acceptance Owner:** Harry  
> **Tanggal Eksekusi Awal:** 30 Oktober 2026 — 15:25 WIB  
> **Tanggal Penyelarasan Akhir:** 30 Oktober 2026 — 16:15 WIB (Revisi 1.2 per Evaluasi DEC-003-UAT)  
> **Fase:** Phase -1 — Baseline Preservation & GitHub Checkpoint  
> **Status Fase -1:** IN PROGRESS / PARTIALLY MET (Technical Checkpoint Done, Security Mitigation Pending)  
> **Status Persetujuan Owner:** PENDING PHASE -1 CLOSURE GATE (Governance Corrections Authorized via DEC-003-UAT)  

---

## 1. IDENTIFIKASI REPOSITORY & SIKLUS COMMIT (SUBPHASE -1.1 & VERIF-FIND-005)

| Parameter | Nilai Terverifikasi |
| :--- | :--- |
| **Repository Root** | `D:/PKL Duta Media/Dutamedia-WorkPulse` |
| **Repository Name** | `Dutamedia-WorkPulse` |
| **Remote Origin URL** | `https://github.com/harrymx1/Dutamedia-WorkPulse.git` |
| **Active Branch** | `main` |
| **Tracking Remote** | `origin/main` |
| **Active Release Tag** | `v1.0.0-rc1` (Application) / `v1.0.1-uat-pkg` (UAT Baseline) |
| **Parent Commit SHA (Pre-UAT)** | `3bf9a7a67cbdbf279f061f22c836e4fba6ef9e95` (Short: `3bf9a7a`) |
| **Pre-Lifecycle Baseline Commit SHA** | `c9fb597135d7f7e951f9daa9eb33e33b7ef4df7b` (Short: `c9fb597`) |
| **Governance Deliverable Commit SHA** | `5af797c25bf98b54e8c8459018603d93b9ceabba` (Short: `5af797c`) |
| **Master Governance Framework Commit SHA** | `fbccbf0c5f27fa2691debfe19db1e982be424ba5` (Short: `fbccbf0`) |
| **Governance Corrections Commit SHA** | `cb1d02dcca51e6976c9ec796575111297c35da79` (Short: `cb1d02d`) |
| **Governance Alignment (CHG-004) Commit SHA** | `bd795ed3cf9938c7653e7807024f9cbfc40aea89` (Short: `bd795ed`) |
| **Current Remote HEAD SHA** | `bd795ed3cf9938c7653e7807024f9cbfc40aea89` |

---

## 2. INVENTARISASI ARTEFAK UAT YANG DIAMANKAN (SUBPHASE -1.2 & -1.4)

Sebanyak **18 file artefak UAT** telah di-stage secara eksplisit (*Explicit Staging Control*) dan disimpan ke dalam GitHub pada commit `c9fb597`:

| No | Path File | Jenis Perubahan | Deskripsi Konten yang Diamankan |
| :---: | :--- | :---: | :--- |
| 1 | `UAT/UAT-Execution-Checklist.md` | Modified | Checklist eksekusi riil UAT mencakup hasil uji Kelompok 1–4 (Pass), Kelompok 5 (DLYM-005 Pass, DLYM-006 Pass, DLYM-001 Defect DEF-001, DLYM-003 Pass), Kelompok 6 (DLYA-002 Pass, DLYA-001 Pass), Kelompok 7 (DLYE-003 Pass, DLYE-002 Pass, DLYE-001 Defect DEF-002), dan Kelompok 12 (ADMN-002 Pass). |
| 2 | `UAT/UAT-Execution-Log.csv` | Modified | Log eksekusi primer individual dengan catatan aktual, tanggal, nama penguji (Harry), dan referensi bukti tangkapan layar. |
| 3 | `UAT/UAT-Manual-Test-Cases.md` | Modified | Kasus uji manual lengkap yang telah disinkronkan hasil aktualnya per langkah pengujian. |
| 4 | `UAT/UAT-Defect-Log.md` | **New File** | Log cacat resmi mencakup `DEF-001` (Form Morning Commitment tidak terkunci pasca-submit) dan `DEF-002` (Form EOD Outcome tidak terkunci pasca-submit). |
| 5 | `UAT/UAT-Improvement-Backlog.md` | **New File** | Backlog peningkatan komprehensif memuat **44 item kandidat improvement (`IMP-001` s.d. `IMP-044`)** dari observasi Harry. |
| 6 | `UAT/UAT-Coverage-Audit.md` | Modified | Audit cakupan pengujian UAT. |
| 7 | `UAT/UAT-Progress-Tracker.md` | Modified | Pelacak progres pengujian UAT. |
| 8 | `UAT/UAT-Requirement-Inventory.md` | Modified | Inventaris kebutuhan FR-01 s.d. FR-55. |
| 9 | `UAT/UAT-Requirement-Traceability-Matrix.csv` | Modified | Matriks keterlacakan kebutuhan sistem. |
| 10 | `UAT/UAT-Test-Data-Matrix.csv` | Modified | Matriks data pengujian akun dan kredensial demo. |
| 11 | `UAT/UAT-Test-Scenario-Catalog.md` | Modified | Katalog skenario pengujian. |
| 12 | `UAT/UAT-Role-Action-Matrix.csv` | Modified | Matriks aksi dan peran pengguna. |
| 13 | `UAT/UAT-Workflow-Transition-Matrix.csv` | Modified | Matriks transisi status alur kerja. |
| 14 | `UAT/UAT-Strategy-and-Test-Plan.md` | Modified | Rencana strategi pengujian UAT. |
| 15 | `UAT/UAT-Exploratory-Testing-Charters.md` | Modified | Piagam pengujian eksploratori. |
| 16 | `UAT/UAT-Final-Acceptance-Checklist.md` | Modified | Kriteria akhir penerimaan UAT. |
| 17 | `UAT/UAT-Defect-Report-Template.md` | Modified | Template baku pelaporan cacat. |
| 18 | `UAT/UAT-README.md` | Modified | Panduan induk paket dokumen UAT. |

---

## 3. PEMERIKSAAN KEAMANAN & PENGECUALIAN DATA SENSITIF (SUBPHASE -1.3 & VERIF-FIND-001)

| Kategori Pemeriksaan | Status | Hasil Verifikasi & Tindak Lanjut |
| :--- | :---: | :--- |
| **Pemindaian Rahasia Produksi** | **CLEAN** | Tidak ditemukan private keys, service role keys, API token rahasia, atau kredensial produksi pada file yang di-commit. |
| **Proteksi File `.env`** | **EXCLUDED** | File lokal `.env.production` terbukti ada secara lokal dan berstatus **ignored** oleh aturan `.gitignore:18:.env.*`. File tersebut aman dan tidak pernah masuk ke Git. |
| **Kredensial Akun Live Demo (`VERIF-FIND-001`)** | **MITIGATION IN PROGRESS** | Ditemukan kredensial akun demo aktif pada repositori publik di `UAT-Test-Data-Matrix.csv` dan `UAT-Manual-Test-Cases.md`. Sesuai otorisasi `DEC-003-UAT`, mitigasi perubahan visibilitas repo menjadi **Private** dan rotasi akun live demo ditangani langsung oleh Harry. |

---

## 4. INVENTARISASI FILE SISA / SCRATCH LOKAL (REMAINING UNCOMMITTED)

Berikut adalah file yang sengaja tidak dimasukkan ke dalam commit baseline karena merupakan artefak kerja sementara:

| Nama File | Ukuran | Alasan Pengecualian |
| :--- | :---: | :--- |
| `UAT-Manual-Test-Cases.md` (root) | 149.4 KB | Salinan ekstraksi sementara (unpopulated) dari file zip; versi resmi yang aktif dan terisi tersimpan di `UAT/UAT-Manual-Test-Cases.md`. |
| `UAT.zip` (root) | 103.8 KB | Arsip zip cadangan paket UAT awal sebelum eksekusi dimulai; dipertahankan secara lokal sebagai arsip statis. |

---

## 5. VERIFIKASI REMOTE GITHUB (SUBPHASE -1.6)

Pemeriksaan sinkronisasi jarak jauh (*remote verification*) membuktikan:

- **Perintah Verifikasi:** `git ls-remote origin main`
- **Hasil Remote Hash Terkini:** `bd795ed3cf9938c7653e7807024f9cbfc40aea89`
- **Status Sinkronisasi:** `Your branch is up to date with 'origin/main'`. (Commit remote CHG-004 `bd795ed` tersinkronisasi 100% di remote).
- **Integritas Remote:** Seluruh 18 artefak baseline dan dokumen tata kelola tersimpan utuh di repositori GitHub PT Dutamedia Mandiri Pratama.

---

## 6. VERIFIKASI MITIGASI KEAMANAN & PENILAIAN EXIT CRITERIA (SUBPHASE -1.7)

| Dimensi Penilaian | Kriteria Evaluasi | Status Evaluasi | Catatan Validasi |
| :--- | :--- | :---: | :--- |
| **Git Baseline Integrity** | Commit baseline `c9fb597` tersimpan, linear, dan sinkron di remote. | **MET (100%)** | Silsilah linear terverifikasi utuh (`3bf9a7a` $\rightarrow$ `c9fb597` $\rightarrow$ `5af797c` $\rightarrow$ `fbccbf0` $\rightarrow$ `cb1d02d` $\rightarrow$ `bd795ed`). |
| **Documentation Completeness** | 18 file artefak UAT pra-lifecycle terinventarisasi utuh. | **MET (100%)** | Seluruh file tercatat di Change Register `CHG-000` s.d. `CHG-004`. |
| **Technical Validation** | Validasi integritas kode sumber aplikasi dan status working tree. | **MET (100%)** | **Application Source Code:** Clean / Zero Diff pada `frontend/`, `backend/`, `e2e/`, dan `supabase/`.<br>**Overall Git Working Tree:** Clean. |
| **Security Compliance** | Resolusi celah paparan kredensial demo pada repositori publik (`VERIF-FIND-001`). | **NOT MET (Pending Owner Action)** | Menunggu penyelesaian perubahan visibilitas repo menjadi Private & rotasi kredensial oleh Harry. |
| **Formal Owner Approval** | Pengesahan formal oleh Harry selaku Acceptance Owner. | **PENDING PHASE -1 CLOSURE GATE** | Otorisasi `DEC-003-UAT` mengesahkan koreksi tata kelola, bukan penutupan Phase -1. Penutupan fase resmi menunggu penyelesaian Subphase -1.7. |

### KESIMPULAN PENILAIAN EXIT CRITERIA PHASE -1:
**STATUS: IN PROGRESS / PARTIALLY MET (BELUM MEMENUHI SELURUH KRITERIA WAJIB).**  
Phase -1 **TIDAK DAPAT** dinyatakan selesai (*Completed*) sebelum dimensi **Security Compliance** pada Subphase -1.7 diverifikasi tuntas oleh Co-Pilot dan disahkan melalui Phase -1 Closure Gate oleh Harry.

---
*Dokumen ini diperbarui secara formal oleh UAT Co-Pilot berdasarkan arahan resmi Acceptance Owner pada evaluasi keputusan DEC-003-UAT.*
