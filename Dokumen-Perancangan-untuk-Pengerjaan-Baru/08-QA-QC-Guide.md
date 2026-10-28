# Panduan QA/QC — WorkPulse

**Versi:** 1.2 (Terekonsiliasi untuk Tim 2 Pengembang + AI Pair-Programming, Kalibrasi DEC-010..013)  
**Tanggal:** 28 Oktober 2026  
**Dokumen Induk:** `00-Project-Charter-and-Governance.md`  
**Selaras dengan:** `07-Test-Plan.md` v1.2, `05-SAD.md` v2.1.0 (Lampiran A & B), `06-Product-Backlog.md` v1.2, `Playbook-02` § 7, `DEC-001..013`.

> **Prinsip bukti:** sistem/fitur tidak boleh dinyatakan lulus tanpa bukti. Empat kategori WAJIB dipisah dalam laporan apa pun:
> 1. **Direncanakan** (Test Plan) → 2. **Dijalankan** (log eksekusi) → 3. **Hasil aktual** (pass/fail + output mentah) → 4. **Kesimpulan** (hanya ditarik dari bukti 2–3).
> Status saat ini: **semua pengujian = direncanakan; belum ada pengujian implementasi yang dijalankan.**

---

## 1. QA dalam Siklus Pengembangan
| Tahap | Aktivitas QA / Pengendalian Mutu | Keluaran yang Dihasilkan |
|---|---|---|
| Review kebutuhan & desain | Cek testability, validasi invarian bisnis, deteksi konflik antarartefak | Gap Register & mitigasi spesifikasi |
| Sebelum pengerjaan task | Pelajari Acceptance Criteria (Gherkin) & DoD, siapkan skenario data uji | Test notes & fixtures |
| Selama pengerjaan task | TDD (Test-Driven Development), unit testing, integration testing, self-review | Laporan eksekusi test lokal & CI |
| Merge Pull Request | Peer review silang (*Four-Eyes Principle*), verifikasi DoD (§ 2) | Persetujuan PR & artefak bukti |
| Akhir fase increment | Regression suite otomatis fase, Gate 4 Review | Laporan Kesiapan Increment Fase |
| Fase P6 (Hardening) | Regression penuh 100%, audit keamanan, restore drill, aksesibilitas, UAT | Dokumen Gate 5 Sign-Off Pack |

---

## 2. Checklist PR Wajib (Quality Gate Pra-Merge)
Setiap Pull Request yang diajukan ke branch utama (`main`) wajib memenuhi checklist:
- [ ] Pipeline CI hijau (linting Oxlint/ESLint, type-check TS strict, build sukses).
- [ ] Unit test baru mencakup logika domain dengan line coverage $\ge 80\%$.
- [ ] Integration test memverifikasi interaksi endpoint & transaksi database (DB PostgreSQL nyata terisolasi).
- [ ] Seluruh kriteria penerimaan (Acceptance Criteria Gherkin) terpenuhi dengan bukti log eksekusi dilampirkan.
- [ ] Skrip migrasi database dapat di-apply dari nol dan teruji rollback-nya.
- [ ] Dilarang ada operasi `DELETE FROM` pada tabel transaksi akuntabilitas, komitmen, atau audit trail (`DEC-007`).
- [ ] Aturan bisnis ditegakkan di server layer (bukan hanya validasi antarmuka peramban).
- [ ] Untuk PR antarmuka: mengimplementasikan 7 UI State lengkap, navigasi keyboard + focus outline, rasio kontras WCAG 2.1 AA, dan persis 100% dengan prototipe kanonikal terkait.
- [ ] Structured logging tidak mencetak kata sandi, token otentikasi, atau data rahasia (*redaction verified*).
- [ ] Kode yang di-generate oleh Agent AI telah diperiksa baris per baris oleh pengembang manusia.

---

## 3. Quality Gates
| Gate | Nama Gate | Syarat Kelulusan | Status Saat Ini | Penentu Keputusan |
|---|---|---|---|---|
| **Gate 1** | Product & Design Baseline Freeze | PDD v1.5, PRD v1.6, Spec v2.0.0, DS v1.5.0 final; 26 prototipe HTML kanonikal lulus 100% PASS (0 isu). | **TELAH DICAPAI** | Harry |
| **Gate 2** | Architecture & Contract Freeze | Dokumen `05-SAD.md` v2.1.0 (termasuk Lampiran A & B) disahkan, skema DB tuntas, kontrak API lengkap. | **TELAH DICAPAI** | Harry |
| **Gate 3** | Readiness Assessment & Go/No-Go | Backlog v1.2, Test Plan v1.2, Panduan QA final; lingkungan uji siap; pengesahan Direktur untuk `OPEN-04` & persetujuan Harry untuk P0. | **CONDITIONAL GO** *(Menunggu tanda tangan Direktur & Harry)* | Harry / Direktur |
| **Gate 4** | Increment Phase Sign-Off | Seluruh task fase memenuhi DoD; regression suite fase sebelumnya hijau 100%. | PLANNED (per akhir fase P0–P5) | Orang A & Orang B |
| **Gate 5** | Production Release Sign-Off | Regression penuh 100%; bebas kerentanan High/Critical; UAT ditandatangani; restore drill sukses; register produksi disahkan. | PLANNED (Fase P6) | Harry & Direktur |

---

## 4. Verifikasi Definition of Done (DoD)
Reviewer wajib menelusuri tiap butir DoD pada `06-Product-Backlog.md` § 1 dan membubuhkan tautan berkas bukti. Setiap butir tanpa bukti nyata dianggap belum selesai (*incomplete*).

---

## 5. Manajemen Defect (Dikalibrasi untuk Tim 2 Pengembang — `DEC-010`)
| Severity Level | Definisi Dampak Defect | SLA Tanggap & Investigasi | SLA Target Perbaikan Selesai |
|---|---|---|---|
| **Sev 1 — Blocker** | Kerusakan fatal (crash total), kebocoran data rahasia, gagal autentikasi total, atau kehilangan data transaksi akuntabilitas. | $\le 4$ jam kerja | $\le 8$ jam kerja (darurat) |
| **Sev 2 — Critical** | Fitur operasional utama gagal (misal gagal kirim Morning Check-in sebelum cutoff) dan tidak ada workaround. | $\le 8$ jam kerja | $\le 24$ jam kerja (1 hari kerja) |
| **Sev 3 — Major** | Fungsionalitas terganggu secara parsial, namun tersedia workaround yang dapat diterima. | $\le 24$ jam kerja | Diselesaikan dalam fase berjalan |
| **Sev 4 — Minor** | Isu kosmetik visual, tata bahasa teks, atau padding minor yang tidak menghambat alur kerja bisnis. | Iterasi berjalan | Prioritas backlog sprint berikutnya |

> **Catatan Kalibrasi:** SLA ini diselaraskan secara realistis untuk kapasitas tim 2 pengembang manusia (Orang A & Orang B) yang dibantu oleh Agent AI, sebagaimana disahkan dalam `DEC-010`.

**Siklus Hidup Defect:** `New` $\rightarrow$ `Triaged` $\rightarrow$ `In Fix` $\rightarrow$ `Ready for Retest` $\rightarrow$ `Verified / Reopened` $\rightarrow$ `Closed`.  
**Aturan Retest & Regression:** Verifikasi perbaikan wajib mengulang langkah reproduksi awal oleh orang selain pelaku perbaikan (*peer verification*). Setiap perbaikan Sev 1 & Sev 2 wajib disertai penambahan unit/integration test otomatis permanen untuk mencegah regresi di masa depan.

---

## 6. Strategi Regression Testing
- **Otomatisasi CI (Setiap PR):** Seluruh suite unit test dan integration test wajib dieksekusi otomatis pada setiap pull request.
- **Otomatisasi Nightly:** Pengujian alur kritis E2E (Playwright) dieksekusi otomatis setiap malam pada build staging.
- **Milestone Regression:** Pada setiap akhir fase (P0–P5), seluruh test case prioritas P1 dari fase-fase sebelumnya wajib dijalankan ulang secara komprehensif. Perubahan pada aturan waktu (`DEC-002`), wewenang scope, atau skema audit wajib memicu *full regression* pada area risiko terkait.

---

## 7. Standar Bukti Uji (Test Evidence Standards)
Setiap bukti uji wajib disimpan pada direktori terstruktur `qa-evidence/<fase>/<TC-ID>/`:
1. Metadata eksekusi: Tanggal, commit hash Git, versi Node.js/PostgreSQL, data seed yang digunakan.
2. Perintah eksekusi: Perintah eksak yang dijalankan pada terminal.
3. Berkas rekaman mentah: Salinan mentah *stdout/stderr* log eksekusi (bukan ringkasan manual).
4. Hasil aktual: Status kelulusan kasus uji (*Pass/Fail*). Tangkapan layar (*screenshot*) hanya bertindak sebagai dokumen pelengkap, bukan bukti utama.

---

## 8. Metrik Pengendalian Mutu
| Metrik Kualitas | Definisi Formula | Batas Ambang Gate Kelulusan |
|---|---|---|
| **Test Pass Rate** | $(\text{Total Kasus Pass} / \text{Total Kasus Dijalankan}) \times 100\%$ | $100\%$ untuk P1; $\ge 95\%$ untuk P2 (Gate 4) |
| **Domain Logic Coverage** | Persentase baris kode domain service yang tereksekusi unit test | $\ge 80\%$ (Playbook-02 § 7.2) |
| **Defect Backlog Terbuka** | Jumlah cacat yang belum terverifikasi selesai | $0$ Sev 1 dan $0$ Sev 2 untuk lolos Gate |
| **Defect Escape Rate** | Cacat yang baru ditemukan pasca-merge PR | Tren menurun menuju 0 |
| **Flaky Test Ratio** | Pengujian dengan hasil berubah-ubah tanpa perubahan kode | $0\%$ (Wajib segera diisolasi dan diperbaiki) |
| **Requirement Traceability** | Persentase requirement PRD dengan minimal 1 kasus uji aktif | $100\%$ terpetakan (73 FR & 12 NFR) |

---

## 9. Protokol Pelaporan Kualitas
1. **Laporan Berkala per Fase:** Menyajikan status terencana vs dijalankan vs lulus, daftar defect aktif, dan rekomendasi teknis Go/No-Go.
2. **Bahasa Integritas Objektif:** Laporan wajib menggunakan bahasa berbasis bukti nyata (contoh: *"Seluruh 42 kasus uji P1 berhasil dieksekusi dan lulus pada commit abc1234"*), dan **dilarang membuat pernyataan spekulatif** seperti *"Sistem dijamin sudah 100% aman dan bebas bug"*.
3. **Penyimpangan Spesifikasi:** Setiap ketidaksesuaian yang ditemukan saat pengujian dicatat sebagai Change Request formal yang memerlukan persetujuan Harry sebelum mengubah dokumen acuan.

---

## 10. Tata Kelola Peran Tim (2 Pengembang + Agent AI)
- **Orang A (Lead Backend & Keamanan / DevOps):** Bertanggung jawab atas migrasi database, logika domain, guard otorisasi, pipeline CI, serta bertindak sebagai Reviewer PR frontend.
- **Orang B (Lead Frontend & QA/QC Lead):** Bertanggung jawab atas komponen antarmuka Vue 3, kepatuhan WCAG 2.1 AA, skrip E2E Playwright, manajemen defect, serta bertindak sebagai Reviewer PR backend.
- **Agent AI (Pair-Programmer & Co-Pilot):** Membantu drafting unit test, fixtures, boilerplate DTO, dan audit konsistensi token desain. Agent AI **dilarang menjadi single-approver**; seluruh keluaran AI wajib diverifikasi dengan bukti log eksekusi nyata oleh Orang A atau Orang B.
- **Four-Eyes Principle:** Dilarang melakukan merge PR secara sepihak tanpa persetujuan dari rekan tim.

---

## 11. Status Penyelesaian Open Items QA/QC
- Alokasi peran tim berdua dan agent AI telah resmi disahkan oleh Harry (`DEC-010`).
- SLA penanganan defect telah diselaraskan realistis untuk tim 2 orang (`DEC-010`).
- Launch Configuration Register (`OPEN-04`) diposisikan berstatus `IN-PROGRESS` dengan Pemilik Kebijakan: **Direktur** (`DEC-011`).
- Penundaan modul evaluasi kinerja individu (`FR-56..59`) pasca-pilot disahkan sebagai Milestone Fase 1.5 (`DEC-012`).
- Presisi logika filter proyek, hari kerja sebelumnya, dan origin carry-over tracking telah disahkan (`DEC-013`).
- Standar penyimpanan bukti uji dan kriteria verifikasi DoD telah dibakukan.
