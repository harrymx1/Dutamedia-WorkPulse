# Arsip Dokumen Pendamping Pra-Rekonsiliasi (`_Archive`)

| Metadata | Nilai |
|---|---|
| Status Direktori | **ARSIP HISTORIS — BUKAN SINGLE SOURCE OF TRUTH (NON-NORMATIF)** |
| Tanggal Pengarsipan | 28 Oktober 2026 |
| Dasar Keputusan | `DEC-001` pada `00-Governance/00-Project-Continuity-and-Decision-Log.md` |

## Tujuan Pengarsipan

Berkas dan direktori di dalam folder `_Archive/` ini merupakan catatan eksplorasi dan pedoman pendamping awal saat penyusunan draf prototipe HTML halaman `01` s/d `16b`:
1. `Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md`
2. `Penjelasan-Halaman/` (`01` s/d `16`)

Pada **Fase 1 (Rekonsiliasi & Penguncian Spesifikasi Mandiri)**:
- Seluruh pola ergonomi, komponen reusable, dan interaksi antarmuka yang **valid** dari berkas-berkas tersebut telah diekstraksi dan dilebur secara resmi ke dalam **`03-UI-UX-Spec-Flow.md` (v2.0.0 FINAL)** serta **`04-Design-System.md` (v1.5.0 FINAL)**.
- Seluruh aturan liar (*spec split-brain*) yang bertentangan dengan keputusan proyek (`DEC-001` s/d `DEC-009`) — seperti penguncian paksa radio `GREEN` (*Amber Lock Engine*), tombol *"Hentikan Pekerjaan"* di pagi hari, penyatuan `/admin/users` ke `/admin/organization`, token warna liar `#1A5C47` / `#0F5338`, maupun CRUD entitas proyek di luar scope MVP — telah **dibatalkan secara resmi**.

## Aturan Penggunaan

> **PERINGATAN:** Dilarang menggunakan berkas di dalam folder `_Archive/` ini sebagai acuan desain UI/UX, arsitektur (`05-SAD.md`), backlog (`06-Product-Backlog.md`), pengujian (`07-Test-Plan.md`), maupun implementasi kode. Acuan tunggal yang sah (*Single Source of Truth*) berada pada dokumen bernomor resmi di direktori induk `Dokumen-Perancangan-untuk-Pengerjaan-Baru/`.

