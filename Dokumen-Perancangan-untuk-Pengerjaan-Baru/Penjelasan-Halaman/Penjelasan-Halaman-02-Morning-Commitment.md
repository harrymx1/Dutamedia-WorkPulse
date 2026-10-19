# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 02: MY TODAY — MORNING COMMITMENT

- **Berkas Prototipe:** [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html)
- **Rute Sistem:** `/today/morning`
- **Posisi Alur:** Langkah 1 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Menetapkan Prioritas Terukur:** Mengunci 1 hingga 3 deliverable paling bernilai sebelum jam kerja dimulai.
2. **Transparansi Risiko Sejak Pagi:** Mengidentifikasi potensi kendala (AMBER) atau ancaman kritis (RED) secara terbuka agar tim dapat segera memberikan dukungan.
3. **Mencegah Stagnasi Tugas (*Anti-Slippage*):** Pekerjaan carry-over berulang secara otomatis dikunci minimal AMBER agar tidak disamarkan sebagai status hijau.

### 1.2 Batasan Desain Baku
- **Nol Emoticon / Emoji:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom.
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` (ramah mata, bebas alarmisme).
- **Bahasa Kerja Lugas:** Tanpa jargon teknis developer (*Zero Developer Jargon*).

---

## 2. ANATOMI & KOMPONEN ANTARMUKA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & DAILY WORKFLOW STEP BAR (1. Morning -> 2. Additional -> 3. EOD) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. EXEMPTION BANNER (Kondisional: Akun Pengecualian Terbuka / C-Level)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PANEL KONTEKS HARI INI (Grid 4-Kolom Terpadu: Tanggal Kerja, Batas Waktu,│
│    Status Pengisian, dan Live Agregasi Status Risiko Hari Ini)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. TIMING ALERT BANNER (Dinamis: Masa Toleransi Amber / Terlambat Merah)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ZERO COMMITMENT TOGGLE & PANEL ALASAN RESMI (Training, Dinas, Townhall)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. DRAF PEKERJAAN BERLANJUT (Panel Kolapsibel Default Tertutup, Kartu Asli) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. FORMULIR SLOT KOMITMEN (1-3 Slot) DENGAN EMBEDDED CONTEXT HINT PRIORITAS │
│    KEMARIN SORE (Deliverable, Prompt Hint, Risiko, Link Blocker)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. INPUT ALASAN KETERLAMBATAN (Kondisional: Wajib jika Kirim > 09:30 WIB)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. ACTION FOOTER BAR (Simpan Draf Lokal & Tombol Kirim Komitmen)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 10. MODAL KONFIRMASI (Konfirmasi Pengiriman & Modal Hentikan Pekerjaan Draf)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 11. DRAWER NAVIGASI MOBILE (Hamburger Topbar, Sidebar Off-Canvas, Backdrop) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BAKU SISTEM

### 3.1 Penyatuan Status Risiko ke Grid 4-Kolom Terpadu
- **Tata Letak:** Mengeliminasi kotak preview kedua yang sebelumnya bertumpuk di bawah Panel 1. Status Risiko Hari Ini diintegrasikan langsung sebagai **kolom ke-4** pada grid jadwal (`repeat(4, 1fr)` desktop, `repeat(2, 1fr)` tablet, `1fr` mobile).
- **Komponen:** Menampilkan badge pill dinamis (GREEN/AMBER/RED/Netral) lengkap dengan dot status dan subteks penjelasan (`Terkendali Mandiri`, `Perhatian (Pantau Berkala)`, `Risiko Tinggi (Eskalasi Diperlukan)`).
- **Dampak:** Menghemat $\approx 100\text{px}$ ruang vertikal dan selaras 100% dengan Halaman 03.

### 3.2 Panel Draf Carry-Over Kolapsibel (Default Tertutup)
- **Tampilan Default Tertutup (`is-collapsed`):** Panel berbentuk akordeon yang tertutup saat halaman dimuat. Hanya menampilkan strip header ramping setinggi $\approx 50\text{px}$ dengan badge `3 Item Tersedia` dan tombol interaktif `Lihat Draf` / `Tutup Draf` (rotasi chevron 180°).
- **Desain Kartu Asli Utuh Saat Dibuka:**
  - Checkbox pemilihan sejajar judul tugas di sisi kiri.
  - Chip metadata terpisah (`Terakhir: ...`, `Status: ...`, `Total Pengerjaan: ...`).
  - **Kotak Catatan Callout Abu-abu (`.copy-note`):** Box tersendiri latar `#F8FAFC` dengan label tebal `CATATAN: "..."` berisi konteks evaluasi kemarin.
  - **Warning Amber Tegas:** Muncul jika tugas telah aktif $\ge 2$ hari kerja.
  - Tombol aksi `Hentikan Pekerjaan` per kartu dan tombol bulk `Gunakan Item Terpilih ke Slot Hari Ini`.

### 3.3 Penyematan Fokus Prioritas Kemarin Sore (*Embedded Context Hint*)
- **Integrasi Langsung:** Menghilangkan panel independen memo kemarin. Disematkan sebagai strip banner ramping satu baris (`.tomorrow-priority-hint`) tepat di dalam panel formulir komitmen, persis di atas Slot Komitmen 1.
- **Anatomi Banner:** Aksen garis kiri amber `3.5px solid #D97706`, ikon SVG bookmark, label bold `Prioritas Kemarin Sore:`, kutipan teks miring, dan badge mini `Hanya Referensi`.
- **Dampak:** Memangkas $\approx 110\text{px}$ ruang vertikal dan menyajikan pengingat tepat saat karyawan mulai mengetik target kerja.

### 3.4 Keseragaman Tipografi Header Panel (Konsistensi 100%)
Seluruh header panel utama memiliki spesifikasi tipografi yang identik:
- **Judul Utama (`h2`):** `font-size: 17px`, `font-weight: 800` (Extra Bold), warna `#0E211B`. Berlaku setara pada *"Jadwal & Batas Pengisian Hari Ini"*, *"Draf Pekerjaan Berlanjut dari Kemarin"*, dan *"Daftar Komitmen Hari Ini (1/3)"*.
- **Kicker (`.section-kicker`):** `font-size: 11.5px`, `font-weight: 800`, huruf kapital, `letter-spacing: 0.05em`.

### 3.5 Penegakan Risiko Minimal AMBER (*Amber Lock Engine*)
- **Hari Kerja $< 2$ (Hari Pertama):** Karyawan bebas memilih GREEN, AMBER, atau RED.
- **Hari Kerja $\ge 2$:** Radio GREEN otomatis **dinonaktifkan (*disabled*)**, pilihan terkunci minimal AMBER, peringatan sistem aktif, dan panel penjelasan risiko wajib diisi.

---

## 4. KATALOG RINGKAS 33 SKENARIO SISTEM

| No | Skenario | Kondisi Pemicu | Perilaku Antarmuka & Efek Sistem |
| :---: | :--- | :--- | :--- |
| **K1** | **Dimensi Waktu & Kehadiran** | | |
| 1.1 | Tepat Waktu | Submit $\le$ 09:00 WIB | Status `Tersimpan · Tepat Waktu` (Pill Hijau), tanpa banner peringatan. |
| 1.2 | Masa Toleransi (*Grace Period*) | 09:01 – 09:30 WIB | Muncul banner toleransi amber; submit tanpa syarat alasan keterlambatan. |
| 1.3 | Terlambat | Submit > 09:30 WIB | Banner merah aktif; wajib mengisi textarea `Alasan Keterlambatan`. |
| 1.4 | Terlewat Hari (*No Submission*) | Tidak mengisi hingga berganti hari | Form terkunci permanen; tercatat pelanggaran disiplin *Missed Baseline*. |
| **K2** | **Hak Akses & Peran** | | |
| 2.1 | Karyawan Reguler | Akun standar (Budi Pratama) | Seluruh aturan batas waktu, kuota slot (1–3), dan penalti berlaku penuh. |
| 2.2 | Pengecualian Terbuka (*Exempt*) | Akun C-Level / Direksi | Muncul banner hijau; batas waktu bebas; pengisian bersifat opsional. |
| 2.3 | Sedang Cuti Resmi | Tanggal cuti disetujui HRGA | Akses formulir diblokir santun: *"Hari ini tercatat Cuti / Izin Resmi"*. |
| **K3** | **Draf Pekerjaan Berlanjut** | | |
| 3.1 | Draf Tertunda 1 Hari | Kemarin jeda, durasi 1 hari | Badge Amber `Tertunda`; bebas memilih GREEN jika dimasukkan ke slot. |
| 3.2 | Draf Berlanjut Aktif $\ge 2$ Hari | Beruntun aktif belum tuntas | Badge Amber `Berlanjut`; terkunci minimal AMBER di slot komitmen. |
| 3.3 | Draf Multi-Hari Sempat Jeda | Akumulasi durasi $\ge 2$ hari | Badge Amber `Tertunda`; tetap terkunci minimal AMBER saat dipilih. |
| 3.4 | Hentikan Pekerjaan (*Stop Draft*) | Klik `Hentikan Pekerjaan` | Buka modal; wajib isi alasan; tugas dihapus permanen dari pool. |
| 3.5 | Draf Kosong / Seluruhnya Stop | Tidak ada sisa tugas carry-over | Menampilkan teks netral: *"Tidak ada draf pekerjaan berlanjut saat ini"*. |
| **K4** | **Pengisian Slot Komitmen** | | |
| 4.1 | Kuota Slot (1 s.d. 3) | Klik `+ Tambah Slot Komitmen` | Maksimal 3 slot. Slot 1 wajib; tombol tambah nonaktif saat slot = 3. |
| 4.2 | Petunjuk Format Sesuai Peran | Berdasarkan fungsi divisi akun | Teks bisikan miring otomatis adaptif (Engineering, Finance, HRGA, dll). |
| 4.3 | Deteksi Teks Singkat/Generik | Input $< 10$ char / kata generik | Muncul warning box kuning edukatif; tidak memblokir tombol submit. |
| 4.4 | Konteks Kemarin (*Tomorrow Priority*) | Ada memo EOD kemarin sore | Tampil di banner `.tomorrow-priority-hint` di atas Slot 1 (hanya referensi). |
| **K5** | **Penilaian Risiko & Agregasi** | | |
| 5.1 | Bebas Risiko (GREEN) | Radio GREEN dipilih | Panel penjelasan risiko tersembunyi (*collapsed*). |
| 5.2 | Potensi Kendala (AMBER) | Radio AMBER dipilih/terkunci | Panel risiko amber terbuka; wajib menjelaskan faktor kendala. |
| 5.3 | Risiko Kritis (RED) | Radio RED dipilih | Panel risiko merah terbuka; wajib menjelaskan kendala kritis & eskalasi. |
| 5.4 | Aturan Anti-Stagnasi | Tugas aktif $\ge 2$ hari | Radio GREEN nonaktif; otomatis mengunci AMBER/RED. |
| 5.5 | Agregasi Risiko Harian | Real-time di kolom 4 Panel 1 | Mengikuti risiko tertinggi (RED > AMBER > GREEN > Netral). |
| **K6** | **Integrasi Tiket Blocker** | | |
| 6.1 | Tautkan Blocker Aktif | Klik `Pilih Blocker Aktif ▾` | Dropdown tiket aktif tim (`#BLK-014`); auto-fill deskripsi deliverable. |
| 6.2 | Relaksasi Teks Risiko | Tiket blocker terpilih | Tanda bintang wajib field risiko hilang (konteks terwakili tiket). |
| **K7** | **Opsi Tanpa Komitmen** | | |
| 7.1 | Zero Commitment (UF-10) | Centang *"Tidak ada komitmen"* | Slot komitmen meredup; wajib pilih alasan resmi (Dinas/Training/Townhall). |
| **K8** | **Pengiriman, Kunci & Koreksi** | | |
| 8.1 | Simpan Draf Lokal | Klik `Simpan Draf` | Data tersimpan di `localStorage`; tidak hilang jika browser tertutup. |
| 8.2 | Validasi Pra-Kirim | Klik `Kirim Komitmen` | Memeriksa kelengkapan target, alasan risiko, dan alasan telat (jika > 09:30). |
| 8.3 | Modal Konfirmasi | Validasi form lolos | Modal konfirmasi muncul menampilkan ringkasan status awal risiko. |
| 8.4 | Penguncian Pasca-Kirim | Konfirmasi disetujui | Form jadi *read-only*; panel *Next Actions* muncul di bawah layar. |
| 8.5 | Permohonan Koreksi Baseline | Salah input pasca-kirim | Akses form koreksi resmi di `/today/morning/correction-request` (UF-22). |
| **K9** | **Kasus Khusus & Edge Cases** | | |
| 9.1 | Submit Detik Batas Waktu | Buka 08:59, submit 09:02 | Status ditentukan oleh **server timestamp**, bukan jam di browser klien. |
| 9.2 | Kuota Penuh saat Ambil Draf | Slot sudah 2, pilih 2 draf | Sistem hanya memasukkan 1 draf (kuota 3 terpenuhi); sisanya tetap di pool. |
| 9.3 | Kegagalan Jaringan | Koneksi internet terputus | Form **tidak direset**; data aman; muncul notifikasi toast error jaringan. |
| 9.4 | Blocker Selesai Siang Hari | Tiket resolve di siang hari | Komitmen pagi tetap menjadi **snapshot historis valid** jam 09:00 WIB. |

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND

### 5.1 Endpoint Pengiriman Komitmen Pagi
`POST /api/v1/today/morning-commitment`

#### Payload Request (JSON):
```json
{
  "workDate": "2026-10-14",
  "isZeroCommitment": false,
  "zeroCommitmentReason": null,
  "zeroCommitmentDetail": null,
  "lateReason": "Kendala jaringan ISP kantor cabang padam pk 08:30-09:40",
  "clientSubmittedAt": "2026-10-14T09:45:12+07:00",
  "commitments": [
    {
      "slotNumber": 1,
      "deliverable": "Implementasi integrasi endpoint user profile dan validasi sesi",
      "initialRisk": "GREEN",
      "referenceLink": "https://jira.dutamedia.com/browse/DP-104",
      "linkedBlockerCode": null,
      "riskReason": null,
      "supportNeeded": null,
      "carryOverDraftId": null
    },
    {
      "slotNumber": 2,
      "deliverable": "Penyelesaian investigasi memory leak service otentikasi",
      "initialRisk": "AMBER",
      "referenceLink": "[#BLK-011] Staging server staging-db02 tidak dapat diakses",
      "linkedBlockerCode": "BLK-011",
      "riskReason": "Memerlukan akses shell staging yang saat ini masih terkendala",
      "supportNeeded": "Koordinasi dengan DevOps untuk restart pod",
      "carryOverDraftId": "draft-item-2"
    }
  ]
}
```

#### Respons Sukses Server (HTTP 201 Created):
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

## 6. STATUS KESIAPAN PROTOTIPE

Dokumen ini adalah **acuan resmi tunggal (*single source of truth*)** untuk implementasi modul Morning Commitment. Seluruh spesifikasi pada berkas [`02-Morning-Commitment.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/02-Morning-Commitment.html) telah teruji secara visual dan fungsional di lingkungan peramban modern, bebas error, serta siap diintegrasikan dengan modul backend.
