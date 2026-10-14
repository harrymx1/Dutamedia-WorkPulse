# 03 — Final Specification and Legacy Conflict Analysis
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-03 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Analisis** | 11 Oktober 2026 |
| **Dokumen Sumber Acuan Final** | PDD v1.1/v1.2, PRD v1.1/v1.2, UI/UX Spec v1.2/v1.5, Design System v1.1/v1.2, SAD v1.0 |
| **Dokumen Pembanding** | 30 Berkas HTML Prototipe (`Design-Artifacts/UI-UX-Design/*.html`) |
| **Tingkat Kepatuhan Arsitektur** | Strict Read-Only Extraction & Conflict Identification |

---

## 1. Ringkasan Eksekutif Analisis Konflik

Prototipe HTML lama dibuat sebagai alat bantu demonstrasi visual cepat kepada pemangku kepentingan (*rapid interactive prototype*). Oleh karena itu, terdapat sejumlah simplifikasi, hardcoded mockup logic, dan inkonsistensi arsitektural antara berkas HTML lama tersebut dengan **Spesifikasi Produk dan Arsitektur Final**.

Dokumen ini mencatat seluruh temuan divergensi, mengklasifikasikan jenis perbedaannya, menentukan tindakan korektif yang wajib diterapkan pada implementasi frontend Vue SPA, serta mengidentifikasi apakah keputusan tersebut sudah final atau memerlukan eskalasi lebih lanjut.

---

## 2. Register Temuan Konflik & Tindakan Korektif (Conflict Register)

| ID Temuan | Komponen / Area Terkena | Perilaku / Desain Prototipe Lama | Ketentuan Spesifikasi Final | Jenis Perbedaan | Tindakan Korektif Frontend | Tingkat Risiko | Referensi Dokumen | Status Otoritas |
|---|---|---|---|---|---|---|---|---|
| **DIFF-01** | Morning vs EOD Separation (`02-morning-commitment.html` & `04-eod.html`) | Menggunakan halaman HTML terpisah seolah-olah URL berbeda. Di `02`, EOD card terlihat dinonaktifkan secara statis. | Merupakan dua seksi alur bertahap dalam satu rute `/today` (`MyTodayPage.vue`). Morning aktif jam 06:00-09:30, EOD aktif jam 16:00-18:00. | Workflow & Architectural | Satukan ke dalam `MyTodayPage.vue` dengan render kondisional berbasis waktu sistem dan status record harian. | TINGGI | PRD US-01, US-03, UI/UX 4.2, 4.4 | **FINAL DECIDED** |
| **DIFF-02** | Zero Commitment Submission (`02-morning-commitment.html`) | Mengharuskan minimal 1 komitmen; tombol Simpan disable jika komitmen kosong. | Zero commitments diperbolehkan secara sah dengan alasan wajib. Initial status: `NOT_APPLICABLE — NO_COMMITMENT`. Ini adalah valid submission, bukan No Submission! | Business Rule & State | Sediakan opsi "Tidak ada komitmen hari ini" dengan field alasan wajib, menghasilkan submission valid tepat waktu. | KRITIS | PRD US-01, PDD G3, SAD 16.4 | **FINAL DECIDED** |
| **DIFF-03** | Copy-forward Collection (`02-morning-commitment.html`) | Prototipe mengambil draft carry-forward tanpa transparansi sumber dan ada tombol auto-apply satu klik. | Sumber HANYA Morning Commitment hari kerja sebelumnya dengan `continuation = Continue`. Tidak ada Additional Work di carry-forward. Tidak ada auto-submit. Maksimal 3 slot. | Data & Workflow | Tampilkan item carry-forward sebagai koleksi yang dapat ditinjau dan dipilih secara eksplisit oleh karyawan. | KRITIS | PRD US-01, BR-02, SAD 16.4 | **FINAL DECIDED** |
| **DIFF-04** | Tomorrow Priority Role (`04-eod.html`) | Input Tomorrow Priority di EOD diperlakukan sebagai auto-draft komitmen esok hari di beberapa mock script. | Tomorrow Priority adalah konteks catatan terpisah! Bukan sumber, selector, pengurut, pembuat, atau pengubah copy-forward. | Workflow & Data Contract | Simpan Tomorrow Priority sebagai array catatan kontekstual mandiri di endpoint EOD check-in, terpisah dari engine carry-forward. | TINGGI | PRD US-03, SAD 16.4 | **FINAL DECIDED** |
| **DIFF-05** | Correction Request Separation (`11-correction-request.html`) | Form koreksi generik tunggal tanpa pemisahan tegas antara koreksi Morning dan EOD. | Morning Correction Request dan EOD Correction Request adalah dua record dan alur kerja berbeda. Koreksi EOD tidak menghapus event No-Submission dan tidak mengubah baseline Morning. | Data, Audit & Workflow | Sediakan dua modal/form terpisah (`MorningCorrectionModal` vs `EODCorrectionModal`) atau parameter workflow type eksplisit. | TINGGI | PRD US-18, SAD 16.4 | **FINAL DECIDED** |
| **DIFF-06** | Status Suggestion Engine (`04-eod.html`, modal prompt) | Dialog menampilkan tombol "Gunakan Rekomendasi Sistem" yang lebih dominan secara visual dibanding pilihan user. | Status Suggestion adalah heuristic deterministik yang tidak boleh mengubah pilihan user secara diam-diam. Bobot visual kedua tombol harus seimbang. | UI/UX & Ethics | Desain `ValidationPromptModal.vue` dengan bobot tombol seimbang: "Pertahankan Pilihan Saya (dengan alasan)" dan "Gunakan Rekomendasi". | SEDANG | PDD G2, UI/UX 1.1, Design 04 | **FINAL DECIDED** |
| **DIFF-07** | Blocker Lifecycle Transisi (`10-blocker-detail.html`) | Semua tombol aksi (Resolve, Close, Accept Risk) terlihat aktif untuk semua pengguna di mock script. | Transisi terikat otoritas: Support Owner menandai Resolved; Reporter mengonfirmasi Closed; Authorized Authority menetapkan Accepted Risk. | Permission & State Machine | Di `BlockerActionModal.vue`, sembunyikan (hide, never just disable) tombol yang tidak diizinkan untuk peran pengguna aktif. | TINGGI | PRD US-09, SAD 8.2 | **FINAL DECIDED** |
| **DIFF-08** | Submission Timing Semantics (`02`, `04`, `05`) | Warna status Late kadang mirip dengan warna AMBER, dan status No Submission berwarna merah alarm. | 3 Bahasa Status Independen: Daily Status (pill terisi GREEN/AMBER/RED), Submission Timing (outline pill On-Time/Late/No Submission slate), Blocker Severity. | Design System & Token | Terapkan `StatusBadge.vue` dan `SubmissionTimingBadge.vue` secara berdampingan tanpa menggabungkan bentuk maupun warna. | SEDANG | Design System 04 Section 1 | **FINAL DECIDED** |
| **DIFF-09** | Push Notification Reality (`06-notifications.html`, `30-notification-setup.html`) | Menampilkan status "Browser Push Aktif" hanya dengan izin notifikasi browser (`Notification.permission === 'granted'`). | Permission granted bukan bukti push berhasil dikirim. Wajib membedakan Unsupported, Denied, No Subscription, dan Delivery Failure. | Technical & State | Implementasikan verifikasi Service Worker PushSubscription token aktual sebelum menampilkan badge status aktif. | SEDANG | PRD US-20, Known-Limitations | **FINAL DECIDED** |
| **DIFF-10** | Exemption vs Holiday vs Leave (`22-exemption-management.html` & `23-leave-approval.html`) | Tampilan menggabungkan kalender libur, permohonan cuti, dan dispensasi dalam satu tabel tak bertingkat. | Merupakan 3 entitas berbeda: Holiday (kalender resmi), Leave (permohonan mandiri berizin), dan Exemption (dispensasi individual non-submission). | Data & Architecture | Pisahkan sub-view di `CompliancePage.vue`: Tab Libur Resmi, Tab Dispensasi Karyawan, dan Panel Review Cuti. | TINGGI | PRD US-14, US-21, US-22 | **FINAL DECIDED** |
| **DIFF-11** | Effective-Dated Organization Mapping (`28-organization-mapping.html`) | Form mapping hanya input single select statis tanpa tanggal mulai/selesai berlaku. | Penugasan manajer langsung dan Project Authority bersifat effective-dated (memiliki masa berlaku tanggal). | Data Contract & Form | Tambahkan kontrol tanggal efektif (`effectiveFrom` & `effectiveTo`) pada form penugasan organisasi. | TINGGI | PRD US-25, SAD 16.4 | **FINAL DECIDED** |
| **DIFF-12** | Temporary Reviewer Expiry (`29-temporary-reviewer.html`) | Formulir pendelegasian tidak memvalidasi bentrok tanggal dan tidak menampilkan indikator kedaluwarsa. | Delegasi wewenang wajib memiliki tanggal mulai dan kedaluwarsa tegas. Sistem menonaktifkan hak review secara otomatis pasca expiry. | Business Rule & State | Tambahkan validasi Zod rentang tanggal dan indikator visual status aktif/kedaluwarsa pada tabel delegasi. | TINGGI | PRD US-19, SAD 16.4 | **FINAL DECIDED** |
| **DIFF-13** | Multi-category Policy Owner (`26-policy-settings.html`) | Menampilkan form setting flat yang dapat diubah sekaligus oleh System Admin tanpa cek kepemilikan kategori. | Kebijakan terbagi 7 kategori dengan Authorized Policy Owner berbeda per kategori (bukan satu peran global). | Permission & Governance | Sediakan kontrol edit hanya pada accordion/tab kategori kebijakan yang dimiliki oleh user yang sedang login. | SEDANG | PRD US-23, UI/UX 4.18 | **FINAL DECIDED** |
| **DIFF-14** | Reporting Granularity & Export (`25-reports.html`) | Prototipe hanya menampilkan grafik statis tanpa filter rentang tanggal dinamis dan tombol export tidak fungsional. | Mendukung 5 laporan operasional terpadu (Daily Exception, Weekly Summary, Monthly Trend, Evidence, Root Cause) + Export CSV/Excel. | Data & Reporting | Implementasikan TanStack Query untuk setiap tipe laporan dengan debounce filter dan pemicu download blob API export. | SEDANG | PRD US-24, OpenAPI /reports | **FINAL DECIDED** |
| **DIFF-15** | Role vs Job Role vs Function vs Direct Manager (`07-profile.html`, `27-user-role-management.html`) | Menggabungkan jabatan fungsional dan peran hak akses aplikasi ke dalam satu dropdown role. | Sistem memisahkan: System Role (RBAC hak akses), Job Role/Title (jabatan HR), Function (unit divisi), dan Direct Manager (atasan penilai). | Domain Model & Identity | Sediakan field terpisah pada form master user: System Role, Department/Function, Jabatan Pekerjaan, dan Atasan Langsung. | TINGGI | PDD 4, PRD 1, SAD 6.1 | **FINAL DECIDED** |

---

## 3. Matriks Kepatuhan Prinsip Utama WorkPulse

| Prinsip Utama | Status Kepatuhan Prototipe Lama | Penyesuaian Wajib pada Implementasi Vue Frontend |
|---|---|---|
| **Speed over completeness** | Sebagian (terlalu banyak field opsional di prototipe) | Form check-in harian dioptimalkan agar selesai dalam <= 2-3 menit. |
| **Status is always visible** | Terpenuhi secara visual | Pertahankan badge status pada header dan daftar roster tim. |
| **Exception-first, bukan report-first** | Sebagian (prototipe menampilkan tabel penuh tanpa default filter masalah) | Default filter di Team/Function Pulse langsung mengisolasi status RED/AMBER dan blocker aktif. |
| **No silent state change** | Terpenuhi pada spesifikasi, di prototipe ada risiko auto-select | Status Suggestion tidak pernah otomatis menimpa radio button pilihan pengguna. |
| **Locked != Hidden** | Terpenuhi | Gunakan banner `LockedIndicator` warna slate yang informatif saat form terkunci pasca cut-off. |
| **Role-first navigation** | Sebagian (prototipe menaruh semua menu di navbar) | Sidebar navigasi menyaring link rute secara dinamis berdasarkan peran aktif pengguna (`authStore.roles`). |
| **Escalation proximity** | Terpenuhi | Tombol Acknowledge dan Resolve blocker berada langsung di kartu/modal blocker terkait. |

---

## 4. Kesimpulan Analisis Selisih

Semua 15 temuan konflik telah memiliki panduan resolusi tegas berdasarkan dokumen spesifikasi final (PDD, PRD, UI/UX Spec, Design System, dan SAD). Tidak ada temuan yang memerlukan spekulasi produk baru. Agen implementasi berikutnya wajib mematuhi kolom **Tindakan Korektif Frontend** pada tabel di atas.
