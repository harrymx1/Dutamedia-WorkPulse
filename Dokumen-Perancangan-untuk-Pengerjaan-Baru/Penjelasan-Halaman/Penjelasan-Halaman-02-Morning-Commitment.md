# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 02: MY TODAY — MORNING COMMITMENT

- **Berkas Prototipe:** [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)
- **Rute Sistem:** `/today/morning`
- **Posisi Alur:** Langkah 1 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Penetapan Prioritas Terukur (PRD FR-01):** Mengunci 1 hingga 3 target capaian kerja (*deliverables*) utama sebelum aktivitas operasional dimulai.
2. **Keterbukaan Risiko Dini (PRD FR-02 & FR-04):** Mendorong pengungkapan potensi hambatan (AMBER) atau risiko kritis (RED) sejak pagi hari agar tim dan atasan dapat segera memberikan dukungan.
3. **Pencegahan Stagnasi Tugas (*Anti-Slippage Engine* — PRD FR-03):** Tugas carry-over yang telah aktif $\ge 2$ hari kerja secara otomatis dikunci minimal berstatus AMBER dan dilarang disamarkan sebagai status GREEN.

### 1.2 Batasan Desain Baku
- **Nol Emoticon & Ikon Monokrom:** Seluruh visual menggunakan tipografi korporat dan inline SVG monokrom (`stroke-width="1.8-2.2"`).
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada tombol hapus, badge penalti, dan pesan error.
- **Bahasa Kerja Lugas (*Zero Developer Jargon*):** Tanpa istilah mentah pemrograman; menggunakan istilah perkantoran manusiawi.
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis kaku.

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & DAILY WORKFLOW STEP BAR:                                        │
│    [1. Morning Commitment ●] ──> [2. Additional Work] ──> [3. EOD Outcome]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. EXEMPTION BANNER (Kondisional: Akun C-Level / Direksi dengan isExempt)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL 1: KONTEKS JADWAL & RISIKO (Grid 4-Kolom Terpadu):                 │
│    - Kolom 1: Tanggal Kerja [Hari Kerja Aktif]                              │
│    - Kolom 2: Batas Pengisian [08:00 – 09:00 WIB]                           │
│    - Kolom 3: Status Pengisian [● Menunggu Pengisian / Tersimpan]           │
│    - Kolom 4: Status Risiko Hari Ini [Live Aggregation: Netral/GREEN/AMBER] │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TIMING ALERT BANNER (Dinamis: Masa Toleransi Amber / Terlambat Merah)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ZERO COMMITMENT TOGGLE & ALASAN RESMI (Training, Dinas Luar, Townhall)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. PANEL 2: DRAF PEKERJAAN BERLANJUT (Akordeon Default Tertutup ~50px):     │
│    - Header: Badge Count [3 Item Tersedia], Toggle [Lihat Draf / Tutup Draf]│
│    - Konten (Saat Dibuka): Kartu Tugas 3-Baris (Checkbox, Metadata Chips,   │
│      Callout Box Abu-abu [CATATAN: ...], Warning Amber, Aksi Hentikan/Ambil)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. PANEL 3: DAFTAR SLOT KOMITMEN (1 s.d. 3 Slot):                           │
│    - Context Hint Banner Prioritas Kemarin Sore (Tepat di Atas Slot 1)      │
│    - Slot Komitmen: Target Hasil Kerja (Textarea + Role Prompt + Warning),  │
│      Pilihan Risiko (GREEN / AMBER / RED), Panel Penjelasan Risiko          │
│      (Kondisional Amber/Red), Tautan Referensi + Dropdown Blocker Aktif     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. PANEL ALASAN KETERLAMBATAN (Kondisional: Wajib Muncul jika Jam > 09:30)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. ACTION FOOTER BAR: [Simpan Draf (Disket)] & [Kirim Komitmen (Panah →)]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 10. MODAL KONFIRMASI (Konfirmasi Pengiriman & Modal Hentikan Draf Tugas)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.1 Penyatuan Status Risiko ke Grid 4-Kolom Terpadu
- Mengintegrasikan indikator *Status Risiko Hari Ini* langsung sebagai **kolom ke-4** pada Panel 1 (`repeat(4, 1fr)` desktop, `repeat(2, 1fr)` tablet, `1fr` mobile).
- Menampilkan badge pill status secara dinamis dengan dot indikator dan subteks penjelas (`Terkendali Mandiri`, `Perhatian (Pantau Berkala)`, `Risiko Tinggi (Eskalasi Diperlukan)`), menghemat $\approx 100\text{px}$ ruang vertikal dan selaras 100% dengan Halaman 03 & 04.

### 3.2 Panel Draf Carry-Over Kolapsibel (Default Tertutup)
- **Tampilan Default Tertutup (`is-collapsed`):** Berbentuk akordeon ramping setinggi $\approx 50\text{px}$ dengan tombol toggle `Lihat Draf` $\leftrightarrow$ `Tutup Draf` (rotasi chevron 180°).
- **Desain Kartu 3-Baris Lengkap Saat Dibuka:**
  - Baris 1: Checkbox seleksi sejajar judul tugas di sisi kiri, badge Amber (`Tertunda`/`Berlanjut`), dan tombol `Hentikan Pekerjaan`.
  - Baris 2: Mini-tag metadata terpisah (`Terakhir: ...`, `Status: ...`, `Total Pengerjaan: ...`).
  - Baris 3: Kotak catatan callout abu-abu lembut (`.copy-note`, latar `#F8FAFC`) berisi evaluasi kemarin.
  - Peringatan Amber jika tugas telah aktif $\ge 2$ hari kerja.
  - Tombol aksi: `Gunakan Item Terpilih ke Slot Hari Ini`.

### 3.3 Context Hint Prioritas Kemarin Sore (*Embedded Context Hint*)
- Disematkan sebagai strip banner satu baris ramping (`.tomorrow-priority-hint`) tepat di atas Slot Komitmen 1.
- Memuat ikon bookmark, label tegas `Prioritas Kemarin Sore:`, kutipan teks miring dari memo EOD kemarin, dan badge `Hanya Referensi`.

### 3.4 Penegakan Risiko Minimal AMBER (*Amber Lock Engine*)
- Jika tugas carry-over telah aktif $\ge 2$ hari kerja berturut-turut:
  - Opsi radio GREEN otomatis **dinonaktifkan (*disabled*)**.
  - Pilihan terkunci minimal pada status **AMBER** (atau RED).
  - Field penjelasan faktor risiko menjadi wajib diisi.

### 3.5 Jendela Waktu Penyerahan (PRD FR-05)
- **08:00 – 09:00 WIB:** Tepat Waktu (*On-Time*).
- **09:01 – 09:30 WIB:** Masa Toleransi (*Grace Period* — banner amber aktif).
- **> 09:30 WIB:** Terlambat (*Late* — banner merah aktif, textarea alasan keterlambatan wajib diisi).

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Pengiriman Tepat Waktu | Submit $\le$ 09:00 WIB | Status `Tersimpan · Tepat Waktu` (Pill Hijau), tanpa banner peringatan. |
| **TC-02** | Masa Toleransi (*Grace*) | Submit 09:01 – 09:30 WIB | Banner toleransi amber aktif; submit dapat dilakukan tanpa penalti alasan. |
| **TC-03** | Pengiriman Terlambat | Submit > 09:30 WIB | Banner merah aktif; textarea alasan keterlambatan wajib diisi. |
| **TC-04** | Akun Pengecualian (Exempt) | Akun C-Level / Direksi | Banner hijau exemption aktif; batas waktu bersifat opsional. |
| **TC-05** | Ambil Draf Carry-Over | Pilih 1 draf dari akordeon | Draf terpindah ke Slot 1; jika tugas $\ge 2$ hari, status terkunci AMBER. |
| **TC-06** | Hentikan Draf Carry-Over | Klik tombol `Hentikan Pekerjaan` | Modal alasan muncul; setelah diisi, tugas terhapus permanen dari pool. |
| **TC-07** | Opsi Zero Commitment | Centang *"Tidak ada komitmen"* | Slot formulir meredup; wajib memilih alasan resmi (Dinas/Training/Townhall). |
| **TC-08** | Deteksi Teks Generik | Input $< 10$ karakter atau kata umum | Banner peringatan kualitas kuning edukatif muncul (*non-blocking*). |
| **TC-09** | Tautkan Tiket Blocker | Pilih tiket `#BLK-014` dari dropdown | Tanda bintang merah wajib pada penjelasan risiko berubah menjadi opsional. |
| **TC-10** | Simpan Draf Lokal | Klik tombol [Simpan Draf] | Data tersimpan ke `localStorage`; notifikasi toast sukses hijau muncul. |
| **TC-11** | Penguncian Pasca-Kirim | Konfirmasi pengiriman disetujui | Formulir menjadi *read-only* permanen; panel aksi transisi berikutnya tampil. |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Menerima identitas pengguna aktif dan status hak akses (`isExempt`). |
| **Halaman 03 (Additional Work)** | Menyediakan baseline komitmen yang ditampilkan secara *read-only* di Panel 2 Halaman 03. |
| **Halaman 04 (EOD Outcome)** | Komitmen pagi menjadi input evaluasi capaian tugas pada Panel 2 Halaman 04. |
| **Halaman 05 (Raise Blocker)** | Tombol darurat merah di kanan atas mengarahkan ke formulir pelaporan blocker; tiket aktif menjadi sumber dropdown picker. |
| **Halaman 06 (My History)** | Komitmen yang dikirimkan tercatat permanen pada arsip riwayat harian dan ringkasan mingguan. |
| **Halaman 16a (Morning Correction)** | Menjadi rute permohonan koreksi resmi jika terdapat kekeliruan data pasca formulir dikunci. |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 Endpoint Pengiriman Komitmen Pagi
- **Rute:** `POST /api/v1/today/morning-commitment`
- **Request Payload (JSON):**
```json
{
  "workDate": "2026-10-14",
  "isZeroCommitment": false,
  "zeroCommitmentReason": null,
  "zeroCommitmentDetail": null,
  "lateReason": null,
  "clientSubmittedAt": "2026-10-14T08:52:10+07:00",
  "commitments": [
    {
      "slotNumber": 1,
      "deliverable": "Penyelesaian modul otentikasi token JWT dan session recovery",
      "initialRisk": "GREEN",
      "referenceLink": "https://jira.dutamedia.com/browse/DP-101",
      "linkedBlockerCode": null,
      "riskReason": null,
      "supportNeeded": null,
      "carryOverDraftId": null
    },
    {
      "slotNumber": 2,
      "deliverable": "Investigasi query report performa transaksi",
      "initialRisk": "AMBER",
      "referenceLink": "[#BLK-011] Staging server lambat merespons",
      "linkedBlockerCode": "BLK-011",
      "riskReason": "Akses staging terbatas akibat maintenance jaringan internal",
      "supportNeeded": "Bantuan tim DevOps untuk koordinasi akses",
      "carryOverDraftId": "draft-2"
    }
  ]
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Morning Commitment berhasil disimpan.",
  "data": {
    "submissionId": "mc-20261014-00128",
    "timingStatus": "ON_TIME",
    "initialDailyStatus": "AMBER",
    "submittedAt": "2026-10-14T08:52:10+07:00",
    "isLocked": true
  }
}
```

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Morning Commitment. Seluruh spesifikasi pada berkas [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) telah teruji secara visual dan fungsional di lingkungan browser modern, bebas error, dan siap diimplementasikan secara terpadu ke frontend dan backend.
