# Arsip Codebase Lama (Legacy Codebase) — WorkPulse

**Tanggal Pengarsipan:** 28 Oktober 2026  
**Status Direktori:** **READ-ONLY / NON-SSOT (NON-CANONICAL)**  
**Dasar Keputusan Arsitektur:** `00-Governance/00-Project-Continuity-and-Decision-Log.md` — **`DEC-006` (Clean-Slate Architecture)**  
**Pedoman Pelaksanaan:** `00-Governance/Playbook-03-Clean-Slate-Implementation-and-Delivery.md` (§ 2 `WP-EP01-TK001`)  
**Penanggung Jawab:** Harry (Project Lead WorkPulse)  

---

## 1. Latar Belakang Pengarsipan

Sesuai evaluasi forensik dan keputusan resmi manajemen Dutamedia pada `DEC-006`, iterasi pengerjaan lama WorkPulse diarsipkan secara utuh untuk memutus rantai utang teknis (*technical debt*), ketergantungan library usang, dan inkonsistensi terhadap Baseline Manajemen `PRD_Dutamedia_Work_Pulse_v1.0.docx`.

Pembangunan kembali WorkPulse (*Pengerjaan Baru*) dilaksanakan dengan pendekatan **Clean-Slate**, di mana seluruh baris kode aplikasi ditulis dari awal berdasarkan dokumen perancangan yang telah dibekukan (*Frozen Baselines*):
- `01-PDD.md` v1.5
- `02-PRD.md` v1.6
- `03-UI-UX-Spec-Flow.md` v2.0.0
- `04-Design-System.md` v1.5.0
- 26 Prototipe HTML Kanonikal (`UI-UX-Design/`)
- `05-SAD.md` v2.1.0 (termasuk Lampiran A & B)
- `06-Product-Backlog.md` v1.2
- `07-Test-Plan.md` v1.2
- `08-QA-QC-Guide.md` v1.2

---

## 2. Struktur Isi Direktori Arsip

Direktori ini memuat salinan utuh dari codebase lama sebelum fase eksekusi bersih dimulai:
```
Dokumen-Perancangan-untuk-Pengerjaan-Baru/_Archive/Legacy-Codebase/
├── README.md               # Berkas penjelas ini
├── backend/                # Kode sumber backend lama (NestJS / Prisma v5 / Redis)
└── frontend/               # Kode sumber frontend lama (Vue 3 / Vite)
```

---

## 3. Ketentuan Penggunaan & Larangan Keras

> ### PERINGATAN INTEGRITAS REKAYASA:
> 1. **Dilarang Melakukan Impor Langsung:** Kode sumber di dalam folder ini **TIDAK BOLEH** diimpor (`import ... from '../_Archive/...'`) oleh aplikasi baru.
> 2. **Bukan Sumber Kebenaran (*Not SSOT*):** Segala aturan bisnis, skema basis data, tipe enum, atau logika otentikasi di folder ini telah digantikan oleh `05-SAD.md` v2.1.0.
> 3. **Tujuan Referensi Pasif:** Folder ini hanya dipertahankan sebagai artefak jejak audit historis dan pembanding jika diperlukan penelusuran regresi.

