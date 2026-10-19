# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 04: MY TODAY — EOD OUTCOME

- **Berkas Prototipe:** [`04-EOD-Outcome.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/04-EOD-Outcome.html)
- **Rute Sistem:** `/today/eod`
- **Posisi Alur:** Langkah 3 (Penutupan Siklus) dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Evaluasi Capaian Hasil Terpadu (PRD FR-08):** Memberikan ruang evaluasi menyeluruh terhadap seluruh tugas yang direncanakan pada pagi hari (*Morning Commitment*) dan pekerjaan tak terduga yang muncul di siang hari (*Additional Work*) secara setara dan adil.
2. **Pemisahan Tegas Hasil Capaian vs Kelanjutan Kerja (PRD FR-09):** Memisahkan status *Outcome* (`Completed`, `Partially Completed`, `Not Completed`, `Cancelled`) dari status *Continuation* (`Continue`, `Do Not Continue`). Keduanya tidak boleh digabung menjadi satu nilai status.
3. **Penyaluran Draf Otomatis ke Esok Hari (PRD FR-11):** Setiap tugas yang ditandai `Continue` otomatis masuk ke koleksi draf *copy-forward* pada Halaman 02 hari kerja berikutnya, lengkap dengan alasan kelanjutan (*continuation reason*).
4. **Penetapan Final Status & Akuntabilitas Harian (PRD FR-10 & FR-52):** Karyawan menetapkan status penutupan hari (`GREEN`, `AMBER`, `RED`) secara mandiri, didampingi rekomendasi sistem (*heuristic suggestion*), penjelasan risiko jika ada kendala, serta catatan prioritas opsional (*Tomorrow Priority*) untuk esok hari.

### 1.2 Batasan Desain Baku
- **100% Otentik Hasil Jadi Produksi:** Bersih mutlak dari elemen/gimmick prototipe (tanpa kotak toggle demo, tanpa pill switcher peran palsu). Pengujian dilakukan secara organik menggunakan data nyata di balik layar.
- **Nol Emoticon / Emoji:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom.
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada tombol bahaya, peringatan, dan badge error.
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa lebar statis kaku, sejajar lurus dengan Halaman 02 dan Halaman 03.

---

## 2. ANATOMI & KOMPONEN ANTARMUKA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & DAILY WORKFLOW STEP BAR:                                        │
│    [1. Morning Commitment ✓] ── [2. Additional Work ✓] ── [3. EOD Outcome ●]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PANEL 1: JADWAL & STATUS PENGISIAN HARI INI (Grid 4-Kolom Terpadu):      │
│    - Kolom 1: Tanggal Kerja [Senin, 19 Oktober 2026 · Hari Kerja Aktif]     │
│    - Kolom 2: Jendela EOD Outcome [16:30 – 18:00 WIB · Evaluasi Capaian]    │
│    - Kolom 3: Status Evaluasi [Sesi Dibuka / Draf / Diserahkan · Terkunci]   │
│    - Kolom 4: Status Risiko Harian [GREEN / AMBER / RED · Terkendali]       │
│    - Catatan Kaki Tata Kelola (Integrated Notice FR-08 & FR-09 di Dasar)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL 2: EVALUASI CAPAIAN MORNING COMMITMENT (FR-08, FR-09):             │
│    - Header: Judul [Capaian Morning Commitment], Counter [2 Komitmen]       │
│    - Kartu Evaluasi Komitmen (Grid 2-Kolom Kontrol Responsif):              │
│      * Deskripsi Tugas Pagi & Target Deliverable Terukur                    │
│      * Badge Initial Risk Pagi (GREEN / AMBER / RED) & Info Blocker Pagi    │
│      * Dropdown Outcome: Completed / Partially / Not / Cancelled            │
│      * Dropdown Continuation: Continue vs Do Not Continue                   │
│      * Panel Kondisional Alasan: Muncul otomatis saat Cancelled / Continue  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL 3: EVALUASI CAPAIAN ADDITIONAL WORK (FR-08, FR-09):                │
│    - Header: Judul [Capaian Additional Work], Counter [1 Tugas Tambahan]    │
│    - Kartu Evaluasi Tugas Tambahan (Kontrol Outcome & Continuation Setara)  │
│    - Empty State Box: Horizontal Mini-Strip Ramping (~50px) jika 0 item     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. PANEL 4: RINGKASAN HARIAN, FINAL STATUS & PRIORITAS (FR-10, FR-52):      │
│    - Rekomendasi Status Sistem (Kalkulasi Heuristik Otomatis)               │
│    - Radio Cards Final Status: [GREEN (Tuntas)] [AMBER] [RED (Risiko)]      │
│    - Penjelasan Risiko Harian (Wajib diisi jika status AMBER atau RED)      │
│    - Catatan Prioritas Esok Hari (Tomorrow Priority - Opsional)             │
│      (Otomatis tampil sebagai Context Hint Banner di Halaman 02 besok!)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. STICKY FOOTER BAR:                                                       │
│    - Ringkasan Kelengkapan Evaluasi (Counter realtime progres pengisian)    │
│    - Tombol Aksi: [Simpan Draf (Disket)] & [Kirim EOD Outcome (Panah →)]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ATURAN BISNIS & PERILAKU SISTEM

### 3.1 Pemisahan Tegas Outcome vs Continuation (FR-08 & FR-09)
Sistem memisahkan secara ketat penilaian hasil kerja dengan keputusan kelanjutan operasional:
- **Hasil Capaian (*Outcome*):**
  1. `Completed`: Seluruh target *deliverable* terselesaikan penuh.
  2. `Partially Completed`: Pekerjaan telah dikerjakan namun belum tuntas 100%.
  3. `Not Completed`: Pekerjaan sama sekali belum sempat tertangani hari ini.
  4. `Cancelled`: Pekerjaan dibatalkan atau dialihkan karena perubahan arah/prioritas.
- **Kelanjutan Pekerjaan (*Continuation*):**
  1. `Continue`: Pekerjaan membutuhkan tindak lanjut pada hari kerja berikutnya. Sesuai **FR-09**, jika `Continue` dipilih, karyawan **WAJIB** mengisi alasan kelanjutan (*continuation reason*) terlepas dari nilai outcome apa pun.
  2. `Do Not Continue`: Pekerjaan ditutup hari ini dan tidak perlu dilanjutkan besok.

### 3.2 Penyaluran ke Koleksi Draf Pagi Esok Hari (FR-11 Pipeline)
Saat EOD Outcome berhasil diserahkan:
- Seluruh tugas (baik dari Morning Commitment maupun Additional Work) yang memiliki `continuation = Continue` otomatis disimpan ke `localStorage: workpulse_carry_over_pool`.
- Data ini menjadi sumber draf *carry-over* resmi yang ditampilkan di Panel 2 pada Halaman 02 hari kerja berikutnya.
- Item `Additional Work` yang `Continue` tetap dapat disalurkan sebagai draf komitmen baru, namun **tidak pernah merusak histori komitmen hari ini**.

### 3.3 Deterministic Heuristic Suggestion Engine (PRD FR-13 & AC-38, ADR-013)
Sistem menyediakan pemandu heuristik (*system suggested status*) deterministik yang bereaksi secara real-time terhadap evaluasi capaian tugas melalui 6 cabang aturan baku:
1. **Cabang 1 (Active Critical Blocker):** Jika terdapat kendala kritis (*Critical Blocker*) yang masih aktif pada hari ini $\rightarrow$ Sistem menyarankan **`RED`** (*"Terdapat kendala kritis (Critical Blocker) yang aktif dan memengaruhi penyelesaian komitmen hari ini"*).
2. **Cabang 2 (Rasio Kegagalan $\ge 50\%$):** Jika persentase tugas `Not Completed` atau `Cancelled` mencapai $\ge 50\%$ dari total tugas yang dievaluasi $\rightarrow$ Sistem menyarankan **`RED`** (*"Sebanyak X% tugas hari ini berstatus Belum Selesai atau Dibatalkan"*).
3. **Cabang 3 (Carry-Over Berulang $\ge 2$ Hari / High Blocker):** Jika terdapat tugas komitmen berulang ($\ge 2$ hari berturut-turut) atau terdapat kendala berbobot tinggi (*High Blocker*) $\rightarrow$ Sistem menyarankan minimal **`AMBER`** (*"Terdapat tugas komitmen berulang (carry-over ≥ 2 hari) yang membutuhkan pengawalan operasional berkelanjutan"*).
4. **Cabang 4 (Partially Completed / Kegagalan $< 50\%$):** Jika terdapat tugas `Partially Completed` atau terdapat tugas `Not Completed` di bawah $50\%$ $\rightarrow$ Sistem menyarankan **`AMBER`** (*"Pekerjaan selesai sebagian (Partially Completed) atau terdapat penundaan tugas yang berlanjut ke esok hari"*).
5. **Cabang 5 (Completed Tanpa Blocker):** Jika seluruh komitmen pagi dan pekerjaan tambahan diselesaikan penuh (`Completed`) tanpa ada blocker tersisa $\rightarrow$ Sistem menyarankan **`GREEN`** (*"Seluruh komitmen pagi dan tugas tambahan diselesaikan penuh (Completed) tanpa kendala terbuka"*).
6. **Cabang 6 (Zero Evaluated Tasks):** Jika belum ada tugas yang dievaluasi $\rightarrow$ Sistem menampilkan status netral *Menghitung...* tanpa penetapan status prematur.

### 3.4 Protokol Anti-Silent Mutation & ValidationPromptModal (FR-14 & AC-39, ADR-013)
Sesuai prinsip etika enterprise WorkPulse, sistem **DILARANG KERAS** mengubah atau memaksa status pilihan pengguna secara sepihak (*Zero Silent Mutation*):
- Karyawan memiliki hak prerogatif penuh untuk menetapkan Final Status hariannya berdasarkan pertimbangan profesional di lapangan.
- Jika pengguna memilih status yang berbeda dari saran heuristik sistem (misalnya pengguna memilih `GREEN` padahal sistem menyarankan `RED` karena rasio kegagalan $\ge 50\%$, atau pengguna memilih `AMBER` padahal sistem menyarankan `GREEN`), sistem **tidak langsung mengunci form**.
- Sistem memunculkan **`ValidationPromptModal`** (`#modal-status-mismatch`) yang menyajikan:
  1. Komparasi visual berdampingan antara *Pilihan Anda* vs *Rekomendasi Sistem*.
  2. Dasar pertimbangan logis heuristik sistem.
  3. Pernyataan jaminan bahwa sistem menghargai independensi profesional pengguna.
  4. Dua pilihan aksi yang jelas:
     - **`Gunakan Saran Sistem (${suggestedStatus})`**: Menyelaraskan pilihan radio dengan rekomendasi sistem dan melanjutkan ke konfirmasi.
     - **`Pertahankan Pilihan Saya (${userStatus})`**: Mempertahankan keputusan mandiri pengguna dan melanjutkan ke konfirmasi penyerahan tanpa hambatan.

### 3.5 Jendela Waktu Penyerahan & Status Ketepatan Waktu (FR-26 & AC-25)
Panel 1 menyajikan indikator ketepatan waktu penyerahan (*Submission Timeliness Badge*) yang bereaksi secara real-time:
- **Tepat Waktu (*On-Time*):** Penyerahan dilakukan sebelum atau tepat pukul 18:00 WIB (Pill Hijau).
- **Masa Tenggang (*Grace Period*):** Penyerahan dilakukan antara pukul 18:00 – 18:30 WIB (Pill Kuning/Amber).
- **Terlambat (*Late Submission*):** Penyerahan melewati batas akhir 18:30 WIB (Pill Merah).

### 3.6 Penjelasan Risiko Harian Tingkat Hari (FR-10 Mandate)
- Jika Final Status ditetapkan sebagai **`AMBER`** atau **`RED`**, field `Penjelasan Risiko atau Kendala Tingkat Hari` menjadi **WAJIB DIISI**.
- Penjelasan ini mencakup evaluasi holistik harian (misal: penundaan rilis dari vendor eksternal, gangguan infrastruktur, atau kendala kapasitas tim).
- Form akan memblokir pengiriman dan menyorot input jika penjelasan risiko kosong.

### 3.7 Keterhubungan Tomorrow Priority ke Halaman 02 (FR-52)
- Input `Tomorrow Priority` bersifat opsional.
- Jika diisi, catatan ini disimpan ke `localStorage: workpulse_tomorrow_priority`.
- Pada Halaman 02 esok harinya, catatan ini langsung ditampilkan sebagai **Embedded Context Hint Banner** tepat di atas Slot Komitmen 1. Catatan ini murni referensi kontekstual dan tidak menjadi komitmen otomatis.

### 3.8 Penguncian Baseline EOD & Protokol Koreksi
- Setelah EOD diserahkan, status halaman berubah menjadi **`Diserahkan · Terkunci`**.
- Banner hijau locked muncul di bagian atas, seluruh field input dinonaktifkan (`disabled`), dan tombol submit dinonaktifkan.
- Jika terdapat kekeliruan pencatatan data pasca penutupan, perubahan wajib diajukan melalui rute **Halaman 16b: EOD Correction Request**.

---

## 4. KATALOG 12 SKENARIO PENGUJIAN SISTEM (TEST CASES)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respon Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Semua Tugas Completed | Outcome seluruh kartu disetel `Completed` + Continuation `Do Not Continue` | Rekomendasi sistem berubah ke `GREEN`. Form valid untuk submit dengan status `GREEN`. |
| **TC-02** | Tugas Berlanjut (Continue) | Memilih Continuation `Continue` pada kartu komitmen 1 | Panel alasan kelanjutan muncul otomatis dengan tanda bintang merah wajib (*). |
| **TC-03** | Tugas Dibatalkan (Cancelled) | Memilih Outcome `Cancelled` pada salah satu kartu | Panel alasan pembatalan tugas muncul otomatis dengan tanda bintang merah wajib (*). |
| **TC-04** | Validasi Field Alasan Kosong | Memilih `Continue` namun textarea alasan dibiarkan kosong saat submit | Sistem menampilkan toast peringatan, memberi border merah pada textarea, dan scroll ke elemen terkait. |
| **TC-05** | Final Status AMBER Tanpa Alasan | Memilih radio `AMBER`, textarea penjelasan risiko harian kosong | Form memblokir tombol submit dan memunculkan toast "Penjelasan risiko harian wajib diisi untuk status AMBER/RED". |
| **TC-06** | Final Status AMBER Lengkap | Memilih radio `AMBER` dan mengisi penjelasan risiko harian secara memadai | Field valid, status badge di Panel 1 otomatis sinkron menjadi `AMBER (Perhatian)`. |
| **TC-07** | Simpan Draf Lokal | Mengisi sebagian outcome lalu mengklik tombol [Simpan Draf] | Data tersimpan ke `localStorage: workpulse_eod_draft`, toast hijau muncul, data tidak hilang saat reload. |
| **TC-08** | Input Tomorrow Priority & Evidence Link | Mengisi prioritas esok hari dan tautan URL bukti kerja (PR Git / Doc) | Teks tersimpan ke `localStorage` dan siap dibaca oleh Halaman 02 serta tersimpan di payload evaluasi. |
| **TC-09** | Penyerahan Sukses & Penguncian | Memvalidasi seluruh field lalu mengonfirmasi submit di modal | Modal sukses muncul, status halaman terkunci (`locked`), seluruh form disabled, banner terkunci aktif. |
| **TC-10** | Penanganan 0 Additional Work | `localStorage` additional work kosong | Panel 3 menampilkan Horizontal Mini-Strip ramping nan elegan tanpa error. |
| **TC-11** | Inkonsistensi Status — Pertahankan Pilihan (FR-14) | Sistem menyarankan `GREEN`, pengguna memilih `AMBER` + alasan risiko | Sistem memunculkan `ValidationPromptModal`. Pengguna klik [Pertahankan Pilihan Saya], pilihan AMBER dipertahankan tanpa mutasi diam-diam, modal konfirmasi muncul. |
| **TC-12** | Inkonsistensi Status — Adopsi Rekomendasi (FR-14) | Sistem menyarankan `GREEN`, pengguna memilih `RED` | Sistem memunculkan `ValidationPromptModal`. Pengguna klik [Gunakan Saran Sistem], radio otomatis beralih ke `GREEN`, modal konfirmasi muncul dengan status `GREEN`. |

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND

### 5.1 Endpoint Penyerahan EOD Outcome
`POST /api/v1/daily-accountability/today/eod`

#### Payload Request (JSON):
```json
{
  "workDate": "2026-10-19",
  "finalStatus": "AMBER",
  "dailyRiskExplanation": "Integrasi API terhambat migration schema database yang belum disetujui Tech Lead, dijadwalkan selesai besok pagi.",
  "tomorrowPriority": "Menyelesaikan PR review modul otentikasi dan verifikasi migration database di staging.",
  "evaluations": [
    {
      "sourceType": "MORNING_COMMITMENT",
      "sourceId": "c1",
      "outcome": "Completed",
      "continuation": "Do Not Continue",
      "continuationReason": null,
      "evidenceLink": "https://github.com/company/repo/pull/142"
    },
    {
      "sourceType": "MORNING_COMMITMENT",
      "sourceId": "c2",
      "outcome": "Partially Completed",
      "continuation": "Continue",
      "continuationReason": "Perlu pengujian lanjutan pada endpoint history setelah skema disetujui.",
      "evidenceLink": null
    },
    {
      "sourceType": "ADDITIONAL_WORK",
      "sourceId": "a1",
      "outcome": "Completed",
      "continuation": "Do Not Continue",
      "continuationReason": null,
      "evidenceLink": "https://company.atlassian.net/browse/HOTFIX-881"
    }
  ]
}
```
```

#### Respons Sukses Server (HTTP 200 OK):
```json
{
  "status": "success",
  "message": "EOD Outcome record has been successfully locked and saved.",
  "data": {
    "recordId": "rec_eod_20261019_001",
    "submittedAt": "2026-10-19T17:45:00+07:00",
    "finalStatus": "AMBER",
    "carryOverCount": 1,
    "isLocked": true
  }
}
```
