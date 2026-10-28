# Playbook 01 — Metodologi UI/UX Design & Evaluasi Kritis Antarmuka WorkPulse

**Versi:** 1.0  
**Tanggal:** 28 Oktober 2026  
**Status:** FINAL — Aktif untuk Fase 1 & Fase 2  
**Dokumen Induk:** `00-Project-Charter-and-Governance.md`  
**Acuan Spesifikasi:** `01-PDD.md`, `02-PRD.md`, `03-UI-UX-Spec-Flow.md`, dan `04-Design-System.md`

---

## 1. Tujuan & Konteks Pengguna WorkPulse

Playbook ini menjadi pedoman praktis dalam menyempurnakan `03-UI-UX-Spec-Flow.md`, menjaga konsistensi `04-Design-System.md`, mengevaluasi prototipe HTML yang sudah dibuat (`01` s/d `16b`), serta merancang prototipe layar yang tersisa (`17` s/d `24`).

Berbeda dari situs pemasaran atau aplikasi konsumen umum, **WorkPulse adalah sistem disiplin operasional harian internal**. Keberhasilan desain UI/UX WorkPulse diukur dari empat hal nyata:

1. **Kecepatan & Beban Kognitif Rendah (`G4` PDD):** Karyawan dapat menyelesaikan Morning Check-in maupun EOD Check-in dalam **±2–3 menit** tanpa bingung membedakan mana yang wajib diisi, mana yang opsional, dan apa langkah berikutnya.
2. **Kejelasan Sinyal bagi Peninjau (`G1`, `G2` PDD):** Supervisor, Head, PM, HRGA, dan CEO dapat langsung menangkap *exception* (status `AMBER/RED`, blocker aktif, keterlambatan/ketidakhadiran, atau permohonan tertunda) dalam hitungan detik tanpa tenggelam dalam teks rutin yang berstatus aman.
3. **Kejujuran Semantik & Anti-*Fear Culture* (`G5`, `RG-01` s/d `RG-06`):** Antarmuka membantu refleksi, eskalasi hambatan sejak dini, dan pembinaan (*coaching*)—bukan menakut-nakuti pengguna, tidak menampilkan peringkat kompetitif antar-karyawan (*leaderboard*), tidak menghitung skor KPI otomatis, dan tidak mengunci pilihan pengguna di luar aturan bisnis yang sah.
4. **Kepatuhan Mutlak pada Kontrak Spesifikasi:** Prototipe visual adalah terjemahan setia dari `02-PRD.md`, `03-UI-UX-Spec-Flow.md`, dan `04-Design-System.md`—bukan tempat mengarang aturan bisnis baru secara diam-diam.

---

## 2. Prinsip Desain Antarmuka Operasional WorkPulse

### 2.1. Pemisahan Semantik Tiga Dimensi Status (Wajib Konsisten di Semua Layar)
Pengguna tidak boleh dibuat rancu antara risiko pekerjaan, disiplin waktu pengisian, dan status pengecualian hari kerja. Setiap halaman wajib memisahkan secara visual dan tekstual:
1. **Status Risiko & Akuntabilitas Pekerjaan (`Daily / Item Risk Status`):**
   - `GREEN`, `AMBER`, `RED` (menggunakan palet RAG resmi dari `04-Design-System.md`).
   - `NOT_APPLICABLE — NO_COMMITMENT` (menggunakan badge netral khusus saat karyawan sah melapor `0` komitmen disertai alasan).
2. **Status Ketepatan Waktu Pengisian (`Submission Timing Status`):**
   - `On-Time` (menggunakan warna *Info/Blue* sesuai `04-Design-System.md`—**dilarang menggunakan warna hijau RAG** agar status pengisian tepat waktu untuk pekerjaan berisiko `RED` tidak terlihat "hijau/aman").
   - `Late` (menggunakan aksen peringatan sekunder yang terbedakan jelas dari badge risiko `AMBER/RED`).
   - `No Submission` (menggunakan gaya netral/abu-abu tegas dengan ikon terpisah, bukan merah `RED` risiko proyek).
3. **Status Pengecualian Kewajiban (`Participation / Calendar Exception`):**
   - `Non-Workday`, `Public Holiday`, `Approved Leave`, dan `Bounded / Open-Ended Exemption` ditampilkan jelas sebagai pembebasan sah, sehingga tidak pernah tampak seperti kelalaian (`No Submission`).

### 2.2. Pengungkapan Bertahap (*Progressive Disclosure*) yang Tepat Guna
- Tampilkan field tambahan bersyarat **hanya ketika pemicunya aktif** (contoh: input *Known Blocker* dan *Support Needed* muncul seketika saat pengguna memilih risiko `AMBER` atau `RED`; alasan ketidakcapaian muncul saat *Outcome* bukan `Completed`; alasan pembatalan muncul saat `Cancelled`).
- Jangan menyembunyikan informasi krusial di balik *tooltip* tersembunyi bila informasi tersebut menentukan keabsahan submit (seperti hitung mundur/batas *On-Time Deadline* dan *Cut-Off*).

### 2.3. Kejelasan Wewenang & Cakupan (*Role & Effective Scope Clarity*)
- Menu sidebar, tab dashboard, dan tombol tindakan (*Acknowledge Blocker, Assign Support, Approve Correction, Add Manager/Coaching Note, Export*) hanya ditampilkan sesuai **peran dan cakupan efektif** pengguna sebagaimana ditetapkan pada `03-UI-UX-Spec-Flow.md` §2–§3.
- Pada layar peninjau (Supervisor/TL, Head, PM, Temporary Reviewer, CEO), selalu tampilkan indikator konteks cakupan yang sedang dilihat (misal: *Team Scope*, *Function: Engineering*, *Project Scope: Proyek X*, atau *Delegated Reviewer hingga [Tanggal]*).

---

## 3. Anatomi Wajib Setiap Spesifikasi & Prototipe Halaman

Sebelum sebuah halaman dinyatakan selesai di `03-UI-UX-Spec-Flow.md` maupun di `UI-UX-Design/*.html`, pastikan tujuh elemen berikut terdefinisi tanpa celah:

1. **Identitas & Tujuan Utama:** Kode layar, rute URL resmi, peran yang diizinkan mengakses, dan satu kalimat *Job-to-be-Done* utama pengguna di layar tersebut.
2. **Konteks Penggunaan:** Kapan layar ini dibuka (pagi sebelum deadline, siang saat muncul pekerjaan tambahan/blocker, sore saat EOD, atau tinjauan periodik manajer/admin) dan informasi apa yang paling pertama dicari mata pengguna.
3. **Hierarki Informasi & Tata Letak:** Urutan blok dari atas ke bawah / kiri ke kanan harus mencerminkan prioritas keputusan (status/peringatan waktu → tugas utama → konteks pendukung → riwayat/detail sekunder).
4. **Kepatuhan Aturan Bisnis & Microcopy:**
   - Seluruh batas input (`0–3` komitmen, aturan `Continue`, saran non-otomatis `AMBER` di EOD, penolakan penuh pasca-*Cut-Off*) tunduk pada `02-PRD.md` dan `DEC-002` s/d `DEC-005`.
   - Placeholder komitmen memakai kamus Bahasa Indonesia berorientasi tindakan sesuai `FR-12` (10 fungsi kanonikal + *fallback*).
   - Jam operasional di prototipe diberi penanda jelas sebagai nilai contoh kebijakan aktif (misal `09:00 WIB` dari *Policy*), bukan konstanta mati sistem.
5. **Kelengkapan *UI States* (Wajib Dipertimbangkan & Disimulasikan pada Layar Terkait):**
   - `Default / Ready` (kondisi kerja normal).
   - `With Pre-requisite / Contextual Banner` (misal: ada koleksi draf *Carry-Over* `FR-11`, ada catatan referensi *Tomorrow Priority*, atau sedang berada di jendela *Grace Period / Late*).
   - `Locked / Post-Cut-Off` (form terkunci untuk penulisan langsung + tombol pengarah yang jelas ke *Correction Request* bila berlaku).
   - `Exempted / Non-Workday / Approved Leave` (tampilan bebas lapor yang tenang dan informatif).
   - `Empty State` (belum ada data riwayat/blocker/notifikasi, disertai penjelasan singkat yang membantu).
   - `Loading / Submitting State` (mencegah klik ganda / *double submission*).
   - `Validation & Business Error State` (pesan kesalahan spesifik dalam Bahasa Indonesia di dekat field bermasalah).
6. **Aksesibilitas & Ergonomi Dasar:**
   - Kontras teks terhadap latar memenuhi minimal WCAG AA (mengikuti pasangan token resmi `04-Design-System.md`).
   - Setiap input memiliki `<label>` eksplisit (tidak hanya mengandalkan `placeholder`), area klik tombol/radio memadai, urutan navigasi `Tab` logis, dan status tidak pernah dibedakan hanya dengan warna semata (selalu sertakan teks label/ikon).
7. **Keterlacakan (*Traceability*):** Mencantumkan kode `FR-xx` dan `AC-xx` yang dipenuhi oleh layar tersebut di `03-UI-UX-Spec-Flow.md`.

---

## 4. Standar Teknis Prototipe HTML (`UI-UX-Design/*.html`)

Agar ke-25 file prototipe HTML bersih, seragam, dan menjadi acuan implementasi frontend yang presisi tanpa perlu membuat dokumen esai pendamping per halaman:

1. **Penamaan File Seragam:** Gunakan format `NN-Nama-Halaman-Kebab-Case.html` yang dipetakan 1-ke-1 dengan daftar layar resmi di `03-UI-UX-Spec-Flow.md` (rapikan penamaan file lama `17`–`24` yang masih memakai spasi/tanda kurung saat Fase 2 dijalankan).
2. **Satu Blok Token CSS Kanonikal:** Bagian `:root` pada setiap file HTML **wajib** menggunakan nama variabel dan nilai hex yang identik 100% dengan `04-Design-System.md` (antara lain `--color-brand-primary: #00674D`, `--color-canvas: #F7FAF9`, `--color-text-primary: #0E211B`, font `Plus Jakarta Sans` & `JetBrains Mono`). Dilarang memperkenalkan palet warna liar per halaman.
3. **Panel Simulasi State Prototipe (*Prototype State Switcher*):** Untuk halaman yang memiliki beberapa kondisi kritis (seperti Morning Commitment, EOD Check-in, Blocker Detail, Correction Request), sediakan bilah penguji prototipe kecil yang terpisah secara visual (misal *floating/top prototype bar* bertanda `[Mode Simulasi Prototipe]`) agar peninjau maupun developer dapat melihat perubahan *On-Time vs Grace Period vs Cut-Off Locked vs Zero Commitment vs Carry-Over* dalam satu file HTML secara transparan.
4. **Larangan Keras di Prototipe HTML:**
   - Dilarang menyisipkan spesifikasi skema database atau kontrak JSON endpoint backend (itu ranah eksklusif `05-SAD.md`).
   - Dilarang menampilkan grafik skor individu, persentase kepatuhan sebagai nilai rapor otomatis, atau peringkat antar-karyawan yang melanggar `RG-01` s/d `RG-06`.

---

## 5. Rubrik Evaluasi Kritis Halaman Eksisting (*Keep / Fix / Redesign*)

Sesuai Poin 14.3, seluruh halaman HTML yang telah ada (`01` s/d `24`) tidak langsung diterima begitu saja maupun langsung dibuang semuanya, melainkan dievaluasi secara objektif pada awal **Fase 2** menggunakan enam kriteria berikut:

| # | Kriteria Evaluasi | Pertanyaan Uji Kritis |
|---|---|---|
| **C1** | **Kepatuhan Aturan Bisnis & Guardrails** | Apakah seluruh perilaku form, batas waktu, status risiko, dan tombol aksinya patuh 100% pada `02-PRD.md` dan `DEC-002..005`? Apakah bebas dari fitur terlarang (`RG-01..06`)? |
| **C2** | **Kesesuaian Rute, Navigasi, & Peran** | Apakah struktur sidebar, header, rute, dan visibilitas aksi sesuai dengan matriks peran & scope efektif di `03-UI-UX-Spec-Flow.md`? |
| **C3** | **Efisiensi & Kejelasan Alur Kerja** | Apakah pengguna sasaran langsung paham apa yang harus dilakukan tanpa instruksi panjang? Untuk check-in harian, apakah realistis selesai dalam ±2–3 menit? |
| **C4** | **Kelengkapan *UI States*** | Apakah kondisi batas penting (*Grace Period, Locked, Carry-Over, Zero Commitment, Empty, Error, Exemption*) sudah terwakili dengan jelas? |
| **C5** | **Konsistensi Design System** | Apakah variabel CSS, warna permukaan, tipografi, spasi, komponen tabel/kartu/modal, dan pemisahan warna badge sudah patuh pada `04-Design-System.md`? |
| **C6** | **Kualitas Bahasa & Microcopy** | Apakah seluruh label, pesan bantuan, placeholder `FR-12`, dan pesan validasi menggunakan Bahasa Indonesia yang jelas, natural, dan konstruktif? |

### Keputusan Disposisi Hasil Evaluasi per Halaman:
- **KEEP (Pertahankan dengan Polesan Minor):** Lulus `C1`, `C2`, `C3` sepenuhnya; hanya memerlukan penyelarasan kecil pada variabel token (`C5`) atau perapihan redaksi teks (`C6`).
- **FIX (Perbaiki Terarah):** Tata letak utama, struktur informasi, dan alur kerjanya sudah baik (`C3` kuat), tetapi mengandung penyimpangan aturan bisnis tertentu (misal masih memuat *Amber Lock*, submit pasca-*Cut-Off*, sidebar lama, atau badge warna salah pada `C1/C2/C4/C5`) yang dapat diperbaiki secara bedah terarah tanpa merombak struktur halaman dari nol.
- **REDESIGN (Rancang Ulang Penuh):** Struktur informasi tidak menjawab kebutuhan pengguna di `03-UI-UX-Spec-Flow.md`, salah memodelkan alur bisnis secara mendasar, masih berupa rangka kasar generasi lama (seperti sebagian file `17–24`), atau lebih mahal ditambal daripada dibangun ulang di atas kerangka komponen `04-Design-System.md` yang bersih.

---

## Riwayat Perubahan
| Versi | Tanggal | Ringkasan Perubahan |
|---|---|---|
| 1.0 | 28 Oktober 2026 | Penerbitan perdana Playbook Metodologi UI/UX Design & Rubrik Evaluasi Kritis untuk Pengerjaan Baru WorkPulse. |

