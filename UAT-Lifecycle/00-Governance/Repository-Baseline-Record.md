# WorkPulse — Repository Baseline Record & GitHub Checkpoint

> **Dokumen:** Repository Baseline Record (Phase -1 Deliverable)  
> **Proyek:** WorkPulse — Daily Accountability & Blocker Log System  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Acceptance Owner:** Harry  
> **Tanggal Eksekusi:** 30 Oktober 2026 — 15:25 WIB  
> **Fase:** Phase -1 — Baseline Preservation & GitHub Checkpoint  
> **Status:** COMPLETED & VERIFIED ON GITHUB  

---

## 1. IDENTIFIKASI REPOSITORY (SUBPHASE -1.1)

| Parameter | Nilai Terverifikasi |
| :--- | :--- |
| **Repository Root** | `D:/PKL Duta Media/Dutamedia-WorkPulse` |
| **Repository Name** | `Dutamedia-WorkPulse` |
| **Remote Origin URL** | `https://github.com/harrymx1/Dutamedia-WorkPulse.git` |
| **Active Branch** | `main` |
| **Tracking Remote** | `origin/main` |
| **Active Release Tag** | `v1.0.0-rc1` |
| **Pre-Lifecycle Baseline Commit SHA** | `c9fb597135d7f7e951f9daa9eb33e33b7ef4df7b` (Short SHA: `c9fb597`) |
| **Parent Commit SHA** | `3bf9a7a67cbdbf279f061f22c836e4fba6ef9e95` (Short SHA: `3bf9a7a`) |
| **Commit Message** | `chore: preserve WorkPulse pre-lifecycle UAT baseline` |

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

## 3. PEMERIKSAAN KEAMANAN & PENGECUALIAN DATA SENSITIF (SUBPHASE -1.3)

| Kategori Pemeriksaan | Status | Hasil Verifikasi |
| :--- | :---: | :--- |
| **Pemindaian Kredensial Nyata** | **CLEAN** | Tidak ditemukan private keys, service role keys, API token rahasia, atau kredensial produksi pada file yang di-commit. Seluruh akun yang tercantum adalah akun demo sintetis (`dev.frontend@dutamedia.com`, dsb.). |
| **Proteksi File `.env`** | **EXCLUDED** | File lokal `.env.production` terbukti ada secara lokal dan berstatus **ignored** oleh aturan `.gitignore:18:.env.*`. File tersebut aman dan tidak pernah masuk ke Git. |
| **Secret Tracking Audit** | **CLEAN** | File env yang dilacak oleh Git hanya template contoh: `.env.example` dan `.env.production.example`. |

---

## 4. INVENTARISASI FILE SISA / SCRATCH LOKAL (REMAINING UNCOMMITTED)

Berikut adalah file yang sengaja tidak dimasukkan ke dalam commit baseline karena merupakan artefak kerja sementara:

| Nama File | Ukuran | Alasan Pengecualian |
| :--- | :---: | :--- |
| `UAT-Manual-Test-Cases.md` (root) | 149.4 KB | Salinan ekstraksi sementara (unpopulated) dari file zip; versi resmi yang aktif dan terisi tersimpan di `UAT/UAT-Manual-Test-Cases.md`. |
| `UAT.zip` (root) | 103.8 KB | Arsip zip cadangan paket UAT awal sebelum eksekusi dimulai; dipertahankan secara lokal sebagai arsip statis. |

---

## 5. VERIFIKASI REMOTE GITHUB (SUBPHASE -1.6)

Pemeriksaan sinkronisasi jarak jauh (*remote verification*) dilakukan segera setelah perintah `git push origin main`:

- **Perintah Verifikasi:** `git ls-remote origin main`
- **Hasil Remote Hash:** `c9fb597135d7f7e951f9daa9eb33e33b7ef4df7b`
- **Status Sinkronisasi:** `Your branch is up to date with 'origin/main'.` (100% Tersinkronisasi).
- **Integritas Remote:** Seluruh 18 artefak UAT kini telah tersimpan dengan aman dan dapat diakses pada repository GitHub PT Dutamedia Mandiri Pratama.

---

## 6. STATUS APPROVAL FASE -1

- **Exit Criteria Phase -1:** **TERPENUHI LENGKAP (ALL CRITERIA MET)**
  - [x] Seluruh perubahan UAT teridentifikasi dan di-stage secara selektif.
  - [x] Baseline commit berhasil dibuat (`c9fb597`).
  - [x] Push ke remote `origin main` sukses tanpa konflik atau force push.
  - [x] Remote commit terverifikasi sinkron pada GitHub.
  - [x] Tidak ada data sensitif / kredensial rahasia yang terpublikasi.
  - [x] Dokumen rekam jejak baseline selesai disusun.

---
*Dokumen ini diterbitkan secara formal oleh UAT Co-Pilot untuk ditinjau oleh Harry (Acceptance Owner).*
