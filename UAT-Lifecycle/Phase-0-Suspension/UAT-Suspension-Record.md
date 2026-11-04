# WorkPulse — Rekaman Penangguhan Formal UAT (UAT Suspension Record)
## Deliverable Subphase 0.1 — UAT Suspension & Execution Preservation

> **Dokumen:** UAT Suspension Record (Phase 0 Deliverable)  
> **Sistem:** WorkPulse — Daily Accountability & Blocker Log System  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Acceptance Owner:** Harry  
> **UAT Co-Pilot:** Senior QA Engineer, UAT Architect & Test Manager  
> **Tanggal Efektif Penangguhan:** 30 Oktober 2026 — 15:20 WIB  
> **Dasar Hukum & Tata Kelola:** Master Directive DEC-001-UAT & Instruksi Pelaksanaan Phase 0  
> **Status Siklus UAT:** **SUSPENDED AT CONTROLLED CHECKPOINT (TC-BLKR-001 Step 16)**  

---

## 1. PERNYATAAN FORMAL PENANGGUHAN (SUSPENSION DECLARATION)

Berdasarkan wewenang tunggal Acceptance Owner (Harry) dan keputusan arsitektural **`DEC-001-UAT`**, pelaksanaan Manual User Acceptance Testing (UAT) untuk sistem **WorkPulse** rilis **`v1.0.0-rc1`** pada lingkungan **Production-Demo** secara resmi dinyatakan **DITANGGUHKAN SEMENTARA (*SUSPENDED*)**.

Penangguhan ini **BUKAN** merupakan pembatalan (*cancellation*) maupun penolakan (*rejection*) terhadap produk WorkPulse, melainkan penghentian terkendali (*controlled suspension*) untuk mengunci kondisi pengujian, mengamankan seluruh baseline, merekonsiliasi temuan, serta menerapkan siklus remediasi dan peningkatan terstruktur (*Controlled UAT Lifecycle & Continuous Improvement*).

---

## 2. PARAMETER LINGKUNGAN & RELEASE BASELINE PADA SAAT PENANGGUHAN

| Parameter Sistem | Kondisi Aktual pada Checkpoint Penangguhan |
| :--- | :--- |
| **Nama Aplikasi** | WorkPulse (Daily Accountability & Blocker Log System) |
| **Versi Rilis Aplikasi** | `v1.0.0-rc1` (Release Candidate 1) |
| **Versi Paket Dokumen UAT** | `v1.0.1-uat-pkg (Rev 1.2)` |
| **Target URL Frontend** | `https://dutamedia-workpulse.vercel.app` (Vercel Production Deployment) |
| **Target URL Backend API** | `https://dutamedia-workpulse-backend.onrender.com` (Render Web Service) |
| **Basis Data Engine** | PostgreSQL 15 on Supabase (`yzsischopwnhztjguoxs.supabase.co` - Singapore) |
| **Akun Penguji Aktif (Tester)** | Harry (menggunakan persona demo `dev.frontend@dutamedia.com` / Aditya Nugroho - EMPLOYEE) |
| **Checkpoint UAT Terakhir** | **`TC-BLKR-001` (Langkah 16) — Modul Blocker System pada rute `/blockers/raise`** |
| **Commit Git Baseline Preservasi** | `c9fb597135d7f7e951f9daa9eb33e33b7ef4df7b` (Short: `c9fb597`) |
| **Commit Git Remote HEAD Mutakhir** | `f3359f52226b9019c816c7658ac69309bcc905e0` (Short: `f3359f5`) |

---

## 3. RINGKASAN METRIK STATUS PENGUJIAN PADA CHECKPOINT

Pada saat pengujian dihentikan sementara, pengujian manual telah menguji 18 kasus uji yang tersebar pada 8 kelompok pengujian (Kelompok 1, 2, 3, dan 4 selesai penuh; Kelompok 5, 6, 7, dan 12 selesai sebagian), serta mencapai checkpoint pada langkah ke-16 kasus uji `TC-BLKR-001` (Kelompok 8):

| Status Eksekusi Kasus Uji | Jumlah Kasus Uji | Persentase | Rincian Kasus Uji Terkait |
| :--- | :---: | :---: | :--- |
| **PASS (Memenuhi Kriteria)** | **16** | 35.56% | `TC-AUTH-001` s.d. `TC-AUTH-008`, `TC-DLYM-003`, `TC-DLYM-005`, `TC-DLYM-006`, `TC-DLYA-001`, `TC-DLYA-002`, `TC-DLYE-002`, `TC-DLYE-003`, `TC-ADMN-002` |
| **FAIL / DEFECT (Cacat Sistem)** | **2** | 4.44% | `TC-DLYM-001` (`DEF-001` - Form Pagi tidak terkunci pasca-submit)<br>`TC-DLYE-001` (`DEF-002` - Form EOD tidak terkunci pasca-submit) |
| **PARTIALLY EXECUTED (Checkpoint)** | **1** | 2.22% | `TC-BLKR-001` (Step 16: Pengisian & Pengiriman Formulir Laporan Blocker Kritis pada `/blockers/raise`) |
| **NOT RUN / SUSPENDED** | **26** | 57.78% | `TC-DLYM-002`, `TC-DLYM-004`, `TC-DLYA-003`, `TC-DLYE-004`, `TC-BLKR-002` s.d. `TC-BLKR-005`, `TC-CORR-001` s.d. `TC-CORR-006`, `TC-LEAV-001` s.d. `TC-LEAV-003`, `TC-COAC-001`, `TC-DASH-001` s.d. `TC-DASH-003`, `TC-ADMN-001`, `TC-E2E-001` s.d. `TC-E2E-004` |
| **TOTAL TEST CASES** | **45** | **100.00%** | Seluruh 45 skenario formal UAT terpetakan deterministik |

---

## 4. JUSTIFIKASI & RASIONAL PENANGGUHAN

Keputusan penangguhan UAT didasarkan pada pertimbangan kualitas dan kepatuhan arsitektural berikut:

1. **Penemuan Cacat Fungsional Kritis pada Integritas Akuntabilitas Harian:**
   - **`DEF-001` (Morning Commitment Lock Failure):** Formulir komitmen pagi tetap dalam kondisi *editable* dan tombol submit tetap aktif setelah komitmen berhasil disimpan. Hal ini melanggar prinsip anti-retroactive editing dan integritas baseline harian (`FR-09`, `DEC-001`).
   - **`DEF-002` (EOD Outcome Lock Failure):** Formulir evaluasi sore (EOD) dan refleksi mandiri tetap dapat diubah serta disubmit ulang setelah kartu "Evaluasi EOD Berhasil Disimpan" muncul. Hal ini melanggar klausul finalitas penutupan hari kerja karyawan (`FR-21`, `DEC-003`).
2. **Akumulasi Calon Peningkatan Antarmuka & Alur Pengguna (UI/UX Divergence):**
   - Teridentifikasi sebanyak **44 item kandidat perbaikan (`IMP-001` s.d. `IMP-044`)** yang mencakup:
     - Kebocoran istilah teknis internal dan kode keputusan arsitektural pada antarmuka pengguna (`NEWLY_ASSIGNED`, `CONTINUE`, `DO_NOT_CONTINUE`, `NOT_COMPLETED`, `DEC-003`, `DEC-004`, `(Prototipe 03)`, `(Prototipe 04)`).
     - Ketidaksesuaian tata letak form textarea catatan kelanjutan tugas yang mengotak dan memotong placeholder.
     - Ketiadaan opsi "Dibatalkan" dan alur evaluasi tindak lanjut pada pekerjaan tambahan (*additional work*).
     - Inkonsistensi posisi tombol "Lapor Blocker" di tiga tab ruang kerja My Today dan ketidaksesuaian halaman `/blockers/raise` terhadap Prototipe 05.
3. **Pencegahan Penumpukan Kesenjangan (Anti-Gap Accumulation):**
   Melanjutkan pengujian manual hingga kelompok 15 tanpa memperbaiki 2 defect struktural dan menyelaraskan 44 calon perbaikan akan memperlebar gap antara dokumen pengujian dengan aplikasi riil, serta berisiko menghasilkan temuan regresi berulang.

---

## 5. PENCATATAN RISIKO KEAMANAN TERBUKA (OPEN SECURITY RISK — VERIF-FIND-001)

> [!WARNING]
> **STATUS RISIKO KEAMANAN: OPEN / ACTIVE (DALAM PENANGANAN LANGSUNG HARRY)**  
> Berdasarkan audit tata kelola pada *Post-Baseline Verification Report*, repositori GitHub `https://github.com/harrymx1/Dutamedia-WorkPulse` saat penangguhan masih berstatus **PUBLIC** (`HTTP 200`).  
> Kredensial aktif akun demo pada `UAT/UAT-Test-Data-Matrix.csv` dan `UAT/UAT-Manual-Test-Cases.md` masih berpotensi diakses publik.  
> Sesuai otorisasi `DEC-003-UAT`, penanganan pengubahan visibilitas repositori menjadi **Private** serta rotasi kredensial live demo berada di bawah penanganan mandiri Harry.  
> **Laporan Phase 0 ini secara tegas mencatat `VERIF-FIND-001` sebagai RISIKO KEAMANAN TERBUKA yang belum dimitigasi secara penuh.**

---

## 6. KONDISI PENGUNCIAN & INTEGRITAS SISTEM (SYSTEM PRESERVATION RULES)

Selama status UAT berada dalam kondisi *Suspended*, berlaku batasan ketat:
1. **Zero Source Code & Database Mutation:** Tidak ada berkas aplikasi (`frontend/`, `backend/`, `e2e/`, `supabase/`) yang boleh disentuh.
2. **No Data Destructive Operations:** Tidak diperbolehkan menjalankan script reset database, seeder ulang, maupun migrasi skema.
3. **State Preservation:** Kondisi basis data live demo di Supabase tetap dibiarkan memegang record pengujian Harry (3 komitmen pagi, 1 tugas tambahan ad-hoc, dan evaluasi EOD) sebagai baseline riil untuk pengetesan lanjutan saat Phase 7.

---
*Dokumen ini diterbitkan secara formal sebagai bukti penghentian sementara UAT WorkPulse dan ditandatangani oleh UAT Co-Pilot untuk persetujuan Acceptance Owner.*

