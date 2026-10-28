# Project Charter, Governance, & Working Agreement — WorkPulse

**Versi:** 1.0  
**Tanggal:** 28 Oktober 2026  
**Status:** FINAL — Aktif Mengikat  
**Pemilik Proyek & Otoritas Keputusan:** Harry (mewakili mandat Manajemen Dutamedia)  
**Dokumen Pasangan:** `00-Project-Continuity-and-Decision-Log.md`

---

## 1. Tujuan Akhir & Kompas Keputusan

Tujuan utama pengerjaan ulang (**Pengerjaan Baru**) proyek **Dutamedia WorkPulse** bukan sekadar menghasilkan dokumen yang panjang atau menyelesaikan daftar tugas secara administratif, melainkan membangun sistem **Daily Accountability & Blocker Log** yang:

1. **Tepat Secara Bisnis & Budaya:** Memenuhi ekspektasi Harry dan manajemen Dutamedia sesuai Baseline v1.0—mendorong visibilitas harian, eskalasi hambatan sejak dini, dan bukti akuntabilitas objektif dalam waktu pengisian ±2–3 menit, tanpa berubah menjadi alat pengawasan mikro (*fear culture* / *timesheet* / kalkulator KPI otomatis).
2. **Kokoh Secara Rekayasa:** Memiliki arsitektur yang proporsional, aman, menjaga keutuhan jejak audit (*immutable audit trail*), akurat terhadap zona waktu dan kalender kerja, mudah dipelihara, dapat diuji secara otomatis maupun manual, dan siap digunakan di lingkungan *production*.
3. **Berbasis Bukti Terverifikasi:** Setiap klaim kesiapan desain, kesesuaian implementasi, maupun kelulusan pengujian wajib didukung bukti nyata yang dapat diperiksa ulang—bukan asumsi atau klaim sepihak AI Agent.

Setiap keputusan produk, desain, arsitektur, pengujian, dan implementasi wajib menimbang keseimbangan antara **nilai bagi pengguna, ketepatan aturan bisnis, risiko teknis/keamanan, kualitas, waktu pengerjaan, dan kemudahan pemeliharaan jangka panjang**.

---

## 2. Prinsip Efektivitas & Efisiensi (*Fit for Purpose*)

Seluruh pekerjaan pada proyek WorkPulse wajib menerapkan prinsip **Fit for Purpose** dan **Minimum Sufficient Complexity** (cukup mendalam untuk menjamin ketepatan, namun tidak lebih rumit daripada yang dibutuhkan):

1. **Uji Manfaat Sebelum Menambah Beban:** Sebelum membuat dokumen, tabel, diagram, abstraksi kode, atau proses baru, evaluasi empat hal: *(a) keputusan apa yang didukung, (b) risiko nyata apa yang dikurangi, (c) apakah sudah tercakup di artefak lain, dan (d) berapa biaya pemeliharaannya*. Jika manfaatnya tidak sebanding, jangan dibuat.
2. **Satu Informasi, Satu Sumber Utama:** Dilarang menyalin ulang aturan yang sama di banyak dokumen sekunder. Gunakan rujukan eksplisit ke dokumen sumber kebenarannya (*Single Source of Truth*).
3. **Solusi Paling Sederhana yang Memenuhi Syarat:** Untuk skala operasional Dutamedia (±30 pengguna awal dengan proyeksi pertumbuhan moderat 100–250 pengguna), pilih arsitektur dan pola teknis paling lugas yang tetap memenuhi standar keamanan, keandalan, dan kemudahan pengujian.
4. **Tanpa Kompromi pada Area Berisiko Tinggi:** Efisiensi **dilarang** mengorbankan ketepatan pada lima area kritis WorkPulse:
   - Akurasi evaluasi batas waktu (*Deadline, Grace Period, Cut-Off, Timezone, Workday Calendar*).
   - Keutuhan *immutable audit trail* dan pemisahan rekaman asli vs koreksi.
   - Penegakan hak akses berbasis peran dan cakupan efektif (*Role + Effective Organizational/Project/Delegated Scope*).
   - Keamanan kredensial, token aktivasi sekali pakai, lampiran bukti, dan tautan ekspor.
   - Pagar budaya produk (*Cultural Guardrails* `RG-01` s/d `RG-06`).

---

## 3. Arsitektur Dokumen, Batas Fungsi, & *Single Source of Truth* (SSOT)

### 3.1. Hierarki & Urutan Pembentukan Artefak
Aliran ketergantungan kebenaran berjalan dari hulu ke hilir:

`Baseline Management v1.0` → `01-PDD.md` → `02-PRD.md` → `03-UI-UX-Spec-Flow.md` & `04-Design-System.md` → `UI-UX-Design/*.html` → `05-SAD.md` → `06-Product-Backlog.md` ↔ (`07-Test-Plan.md` & `08-QA-QC-Guide.md`) → `09-Readiness-Assessment.md` → `Source Code & Test Evidence`.

### 3.2. Matriks Fungsi dan Batas Setiap Artefak

| Artefak | Lokasi Resmi | Pemilik Keputusan | Sumber Input | Sumber Kebenaran Tunggal (SSOT) Atas: | Batasan Tegas (Dilarang Memuat): |
|---|---|---|---|---|---|
| **Baseline Management** | `PRD_Dutamedia_Work_Pulse_v1.0.docx` | Manajemen Dutamedia | Kebutuhan bisnis organisasi | Mandat awal & ekspektasi manajemen | Perubahan langsung (dokumen referensi *read-only*) |
| **Governance & Continuity** | `00-Governance/` | Harry | Kesepakatan kerja proyek | Tata kelola, aturan kerja, log keputusan lintas sesi, & *playbook* tahap | Spesifikasi fitur aplikasi pengganti PRD/SAD |
| **01 — PDD** | `01-PDD.md` | Harry | Baseline v1.0 | Visi, masalah bisnis, tujuan (`G1–G7`), persona, batas *in/out-of-scope* MVP, pagar budaya, & target skala | Validasi field detail, warna UI, skema tabel DB, atau kontrak API |
| **02 — PRD** | `02-PRD.md` | Harry | Baseline v1.0, `01-PDD.md` | **Seluruh `FR`, aturan bisnis domain, matriks *role/scope*, kebijakan vs aturan tetap, `NFR`, `AC`, & *Launch Config Register*** | Kode warna CSS, anatomi komponen UI, skema SQL, atau payload JSON API |
| **03 — UI/UX Spec & Flow** | `03-UI-UX-Spec-Flow.md` | Harry | `01-PDD.md`, `02-PRD.md` | **Peta rute & akses layar, struktur navigasi, *user flow*, serta perilaku & state tiap halaman** | Aturan bisnis baru yang bertentangan dengan PRD, nilai hex mentah, atau kontrak endpoint REST |
| **04 — Design System** | `04-Design-System.md` | Harry | `03-UI-UX-Spec-Flow.md` | **Design tokens (warna, tipografi, spasi, radius), aturan semantik badge, aksesibilitas visual, & katalog varian komponen** | Aturan jadwal operasional atau logika validasi bisnis |
| **05 — UI/UX Design** | `UI-UX-Design/*.html` | Harry | `03-UI-UX-Spec-Flow.md`, `04-Design-System.md` | **Wujud tata letak visual konkret, hierarki elemen, & simulasi interaksi layar** | Aturan bisnis baru di luar PRD/UI-UX Spec atau acuan skema API backend |
| **06 — SAD** | `05-SAD.md` | Harry | Artefak `01` s/d `04` & `UI-UX-Design` | **Seluruh keputusan arsitektur, pemilihan teknologi, model data & indeks, kontrak API & error code, auth/scope engine, scheduler, storage, security, observability, & deployment** | Perubahan sepihak atas requirement bisnis atau penghilangan fitur wajib PRD |
| **07 — Product Backlog** | `06-Product-Backlog.md` | Harry | Artefak `01` s/d `05-SAD.md`, diselaraskan `07` & `08` | **Urutan fase eksekusi, Epic, cakupan task, dependensi, keterlacakan implementasi, & *Definition of Done*** | Keputusan arsitektur baru yang belum disahkan di `05-SAD.md` |
| **08 — Test Plan** | `07-Test-Plan.md` | Harry | Artefak `01` s/d `06` | **Strategi uji berbasis risiko, matriks keterlacakan ke *Test Case*, skenario uji, expected result, & kriteria lulus/gagal** | Persyaratan karangan sendiri atau klaim hasil pengujian sebelum dijalankan |
| **09 — Panduan QA/QC** | `08-QA-QC-Guide.md` | Harry | `07-Test-Plan.md`, `05-SAD.md`, `06-Product-Backlog.md` | **Proses kendali mutu dari desain s/d rilis, *quality gates*, siklus defect, *retest/regression*, standar *test evidence*, & metrik rilis** | Pengulangan tabel *Test Case* detail milik `07-Test-Plan.md` |
| **10 — Readiness Assessment** | `09-Readiness-Assessment.md` | Harry | Seluruh artefak `01` s/d `08` | **Status kelayakan pra-implementasi (*Blocker* vs *Deferred* vs *Accepted Risk*)** | Pernyataan siap tanpa verifikasi konsistensi dan prasyarat nyata |

### 3.3. Kemandirian Artefak Pengerjaan Baru
Seluruh dokumen di dalam `Dokumen-Perancangan-untuk-Pengerjaan-Baru/` wajib **100% mandiri (*self-contained*)**. Dilarang menggantungkan aturan bisnis atau teknis pada dokumen di folder Pengerjaan Lama (`Design-Artifacts/`). Keputusan lama yang masih valid wajib diserap secara eksplisit ke dalam dokumen baru yang relevan.

### 3.4. Penanganan Konflik & Prosedur Perubahan (*Change Control*)
1. **Deteksi Konflik:** Apabila saat mengerjakan dokumen hilir (misal prototipe HTML, SAD, Test Plan, atau kode) ditemukan kontradiksi, celah spesifikasi, atau ide perbaikan terhadap dokumen hulu:
   - **Berhenti dari asumsi sepihak**—dilarang menimpa aturan secara diam-diam di dokumen hilir.
   - Laporkan temuan tersebut secara transparan kepada Harry beserta analisis dampak dan opsi solusinya.
2. **Eksekusi Perubahan yang Disetujui:**
   - Jika disepakati mengubah aturan hulu: perbarui dokumen SSOT hulunya terlebih dahulu, naikkan versinya, catat di `00-Project-Continuity-and-Decision-Log.md`, lalu selaraskan dokumen hilir yang terdampak.
   - Jika disepakati mempertahankan aturan hulu: koreksi dokumen hilir agar patuh 100% pada dokumen hulu.

---

## 4. Standar Penyusunan, Pemeliharaan, & Keterlacakan Dokumen

### 4.1. Metadata & Versioning Wajib
Setiap artefak utama (`01` s/d `09`) wajib mencantumkan blok header standar di bagian atas:
- **Versi:** Format `MAJOR.MINOR` (misal `1.5`, `2.0`). Naikkan `MINOR` untuk penajaman/perbaikan konsistensi; naikkan `MAJOR` untuk perombakan struktural atau perubahan baseline pasca-beku. Header dokumen dan tabel *Changelog* di bagian akhir **wajib selalu sinkron**.
- **Status:** `DRAFT` (sedang disusun), `IN REVIEW` (menunggu evaluasi/persetujuan Harry), atau `FINAL` (telah disetujui pada *Gate* terkait).
- **Acuan Hulu:** Mencantumkan nama dan versi spesifik dokumen hulu yang menjadi dasarnya.

### 4.2. Rantai Keterlacakan (*End-to-End Traceability*)
Setiap elemen hilir wajib dapat ditelusuri balik ke alasan keberadaannya menggunakan kode pengenal yang konsisten:
- `Goal (G1–G7)` & `Guardrail (RG-01–RG-06)` → `Requirement (FR-xx, NFR-xx)` & `Acceptance Criteria (AC-xx)` → `Screen/Route ID` → `Architecture Component / API / Table` → `Backlog Task (EPIC-xx-Ty)` → `Test Case (TC-xxx)` → `Test Evidence`.

### 4.3. Gerbang Persetujuan (*Quality & Freeze Gates*)
Perpindahan fase besar dikendalikan melalui tiga gerbang persetujuan eksplisit oleh Harry:
1. **Gate 1 — Product & Design Baseline Freeze:** `01-PDD.md`, `02-PRD.md`, `03-UI-UX-Spec-Flow.md`, `04-Design-System.md`, dan seluruh `UI-UX-Design/*.html` bebas konflik internal, tidak ada rute/layar wajib yang terlewat, dan semua keputusan produk tingkat desain telah dikunci.
2. **Gate 2 — Architecture Freeze:** `05-SAD.md` menerjemahkan seluruh kebutuhan `01–04` tanpa celah keputusan teknis, serta status pengarsipan kode lama telah ditetapkan.
3. **Gate 3 — Implementation Readiness (Go / No-Go):** `06-Product-Backlog.md`, `07-Test-Plan.md`, `08-QA-QC-Guide.md`, dan `09-Readiness-Assessment.md` telah selaras, memiliki **0 Blocker terbuka**, nilai *Launch Configuration Register* untuk pengembangan/pengujian telah tersedia, dan lingkungan dasar siap dieksekusi.

---

## 5. Working Agreement & Batas Kewenangan AI Agent

### 5.1. Pembagian Kewenangan Keputusan
- **Keputusan yang Boleh Diambil Mandiri oleh AI Agent:** Penataan redaksi/format dokumen agar lebih rapi tanpa mengubah makna, penyusunan struktur kode mikro internal yang sepenuhnya tunduk pada `05-SAD.md`, penulisan skenario uji detail yang diturunkan langsung dari `FR/AC`, dan perbaikan cacat editorial nyata (seperti salah ketik atau duplikasi paragraf identik) dengan tetap melaporkannya secara transparan.
- **Keputusan yang WAJIB Meminta Klarifikasi & Persetujuan Harry:**
  1. Menambah, mengurangi, atau mengubah aturan bisnis, ruang lingkup fitur, hak akses peran, atau alur kerja pengguna.
  2. Memilih di antara dua alternatif arsitektur/teknologi yang memiliki konsekuensi biaya, keamanan, operasional, atau pemeliharaan.
  3. Menetapkan nilai parameter bisnis pada *MVP Launch Configuration Register* jika belum terdokumentasi.
  4. Mengubah urutan fase, cakupan Epic/Task, atau *Definition of Done* pada Product Backlog yang telah disetujui.
  5. Menerima suatu keterbatasan teknis sebagai *Accepted Risk / Known Limitation*.

### 5.2. Larangan Mutlak (*Hard Constraints*)
1. **DILARANG melakukan `git commit`, `git push`, pembuatan/penghapusan branch, atau operasi mutasi riwayat Git apa pun kecuali Harry memberikan instruksi eksplisit pada giliran kerja tersebut.**
2. **DILARANG** mengubah requirement, desain, arsitektur, atau Product Backlog secara diam-diam demi mempermudah penulisan kode atau meloloskan pengujian.
3. **DILARANG** mengarang spesifikasi teknis, memalsukan data bukti uji, atau menyatakan suatu fitur/tahap "Lulus / Siap" tanpa verifikasi faktual.
4. **DILARANG** mengklaim suatu pendekatan sebagai "standar industri universal" atau "solusi sempurna tanpa kelemahan"; setiap rekomendasi metode/arsitektur wajib disertai alasan relevansi dan konsekuensinya (*trade-off*) bagi WorkPulse.

### 5.3. Protokol Kepatuhan Awal & Akhir Pekerjaan
- **Sebelum memulai pekerjaan penting:** Periksa aturan aktif di dokumen ini, periksa status terkini di `00-Project-Continuity-and-Decision-Log.md`, dan baca *Playbook* tahap terkait.
- **Sebelum menyatakan suatu tahap selesai:** Lakukan pemeriksaan silang terhadap SSOT hulu, pastikan tidak ada konflik baru yang tercipta, perbarui `00-Project-Continuity-and-Decision-Log.md`, dan sajikan ringkasan hasil beserta hal yang memerlukan keputusan Harry.

---

## 6. Standar Komunikasi & Penulisan

1. **Bahasa:** Seluruh diskusi, dokumentasi, dan teks antarmuka aplikasi menggunakan **Bahasa Indonesia** yang jelas, natural, profesional, dan lugas. Istilah teknis umum dalam bahasa Inggris (seperti *cut-off, grace period, carry-over, blocker, scope, immutable, endpoint, idempotent*) tetap boleh digunakan, dengan penjelasan singkat saat pertama kali muncul apabila berpotensi menimbulkan salah tafsir.
2. **Kejujuran Epistemik (Pemisahan Kategori Informasi):** Dalam setiap analisis, laporan review, Test Plan, maupun Readiness Assessment, pisahkan secara eksplisit antara:
   - **Fakta Terdokumentasi** (apa yang tertulis nyata di dokumen/kode saat ini);
   - **Keputusan yang Telah Disetujui** (ketetapan resmi Harry / Baseline);
   - **Hasil Analisis** (kesimpulan logis dari pemeriksaan silang fakta);
   - **Rekomendasi** (usulan tindakan beserta alasan & *trade-off*);
   - **Asumsi** (hal yang dipakai sementara karena belum ada ketetapan);
   - **Risiko** (potensi masalah beserta dampak & mitigasinya);
   - **Pertanyaan Terbuka** (keputusan yang masih membutuhkan konfirmasi Harry).
3. **Gaya Uraian:** Hindari kalimat abstrak bertele-tele, pengulangan isi dokumen lain, jargon kosong, dan pujian berlebihan. Tulis secukupnya hingga tidak ambigu dan siap dipakai bekerja.

---

## 7. Indeks Dokumen Tata Kelola (*Hub-and-Spoke Index*)

Dokumen ini bertindak sebagai **Indeks Induk**. Pedoman operasional khusus dipisahkan secara modular sesuai fasenya:

1. **`00-Project-Continuity-and-Decision-Log.md`** *(Aktif sejak Fase 0)* — Sumber status terkini proyek lintas percakapan, daftar versi artefak, log keputusan resmi (`DEC-xxx`), disposisi ADR lama, dan pelacak isu terbuka.
2. **`Playbook-01-UI-UX-Design-and-Evaluation.md`** *(Aktif sejak Fase 0/1)* — Metodologi perancangan UI/UX operasional WorkPulse, standar kelengkapan state layar, aturan prototipe HTML, dan rubrik evaluasi kritis *Keep / Fix / Redesign*.
3. **`Playbook-02-Architecture-Backlog-and-QA-Standards.md`** *(Dibuat Just-in-Time pada awal Fase 3)* — Standar perancangan `05-SAD.md`, standar pemecahan `06-Product-Backlog.md` berbasis risiko, serta standar `07-Test-Plan.md`, `08-QA-QC-Guide.md`, *Quality Gates*, dan *Definition of Done*.
4. **`Playbook-03-Implementation-and-Delivery-Guide.md`** *(Dibuat Just-in-Time menjelang Fase 6)* — Panduan teknis eksekusi coding, konvensi kode & struktur folder sesuai SAD, manajemen konfigurasi & *secrets*, aturan Git/review, eksekusi *automated testing* & pengumpulan *evidence*, pengelolaan defect, deployment, dan verifikasi *production*.

---

## Riwayat Perubahan
| Versi | Tanggal | Ringkasan Perubahan |
|---|---|---|
| 1.0 | 28 Oktober 2026 | Penerbitan perdana Project Charter, Governance, & Working Agreement untuk Pengerjaan Baru WorkPulse; menggantikan `WorkPulse_Development_Framework.md` awal. |

