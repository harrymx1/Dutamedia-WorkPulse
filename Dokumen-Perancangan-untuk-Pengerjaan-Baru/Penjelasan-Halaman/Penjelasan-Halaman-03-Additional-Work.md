# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 03: MY TODAY — ADDITIONAL WORK

- **Berkas Prototipe:** [`03-Additional-Work.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/03-Additional-Work.html)
- **Rute Sistem:** `/today/additional`
- **Posisi Alur:** Langkah 2 dari Siklus Akuntabilitas Harian (*Daily Accountability Cycle*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. TUJUAN & FILOSOFI DESAIN

### 1.1 Tujuan Utama Halaman
Halaman **Additional Work** adalah ruang kerja fleksibel yang dirancang untuk menangkap dinamika pekerjaan riil di lapangan tanpa merusak integritas komitmen awal. Halaman ini berfungsi untuk:
1. **Mencatat Pekerjaan Tak Terduga (*Ad-hoc & Mid-day Tasks*):** Memfasilitasi karyawan mencatat penugasan mendadak dari atasan, insiden operasional, atau perubahan prioritas yang terjadi setelah batas pengisian komitmen pagi (*Morning Commitment*) terkunci.
2. **Menjaga Kemurnian Baseline Pagi (PRD FR-07 & BR-01):** Menegaskan prinsip tata kelola bahwa pekerjaan tambahan **bukan merupakan slot komitmen ke-4** dan **tidak pernah mengubah atau membatalkan baseline Morning Commitment** yang sudah dikunci.
3. **Penyetaraan Bobot Evaluasi Sore Hari (PRD FR-08 & 4.4):** Seluruh item yang dicatat di halaman ini secara otomatis disalurkan ke layar evaluasi sore (**Halaman 04: EOD Check-out**) dengan bobot perlakuan capaian (*Outcome & Continuation*) yang setara dengan komitmen utama.

### 1.2 Prinsip Desain & Batasan Ketat
- **Sifat Asinkron & Non-Mandatory:** Halaman ini bersifat opsional. Karyawan tidak diwajibkan mengisi jika sepanjang hari kerja tidak ada penugasan tambahan di luar rencana pagi.
- **NOL Emoticon / Emoji:** Murni menggunakan tipografi profesional dan ikon inline SVG monokrom (ikon jam, panah dropdown, centang, dan bendera).
- **Skema Warna Merah Lembut (*Soft Rose*):** Penanganan validasi kosong dan tombol hapus menggunakan nuansa merah lembut `#FFF8F8`, border `#FECDCA`, dan teks `#991B1B`.
- **Integrasi Sesi Pengguna Lintas Halaman:** Membaca identitas aktif dari `localStorage: workpulse_active_user` secara otomatis untuk mengisi sidebar, header, dan prompt hint kontekstual.

---

## 2. ANATOMI & KOMPONEN ANTARMUKA (UI COMPONENTS)

Halaman ini tersusun atas 8 blok komponen terintegrasi:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR & BREADCRUMB (My Today / Additional Work & Profil User Aktif)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. DAILY WORKFLOW STEP BAR (1. Morning [✓] -> 2. Additional [*] -> 3. EOD)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PAGE HEADING & QUICK CTA (Judul Bersih, Deskripsi, Tombol Lapor Blocker) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. NOTICE BOX REGULASI SISTEM (Penegasan Status Independen dari Baseline)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. FORMULIR PENCATATAN ADDITIONAL WORK:                                     │
│    - Kolom Kiri : Textarea Deskripsi, Prompt Hint Berbasis Peran, Ref Link, │
│                   Quality Warning Badge, Dropdown Picker Blocker Tim        │
│    - Kolom Kanan: Dropdown Alasan Resmi PRD (5 Enum), Panel 'Assigned By'   │
│    - Footer     : Tombol Kosongkan Isian & Tombol Simpan Pekerjaan Tambahan │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. DAFTAR LOG PEKERJAAN TERCATAT HARI INI:                                  │
│    - Header Counter: [N] Item Tercatat                                      │
│    - Kartu Pekerjaan: Jam Catat, Deskripsi, Chip Alasan, Pemberi Tugas, Hapus│
│    - State Kosong Elegan (*Empty State Box*)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. TOAST NOTIFIKASI SUKSES (Feedback Melayang Kanan Bawah)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. MODAL RE-AUTENTIKASI SESI (UF-03: Perlindungan Draf saat Sesi Habis)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BAKU & LOGIKA SISTEM

### 3.1 Taksonomi Alasan Resmi (*Reason Enum Taxonomy - PRD FR-06*)
Setiap pencatatan Additional Work wajib mengelompokkan asal pekerjaan ke dalam salah satu dari 5 enum resmi PRD:

| Nilai Enum Sistem | Label Tampilan UI | Perilaku Formulir & Aturan Validasi |
| :--- | :--- | :--- |
| **`Newly Assigned`** | Tugas Baru Ditugaskan *(Newly Assigned)* | **Wajib mengisi field "Pemberi Tugas (Assigned By)"**. Panel input otomatis terbuka secara kondisional. |
| **`Missed in Planning`** | Terlewat saat Perencanaan Pagi *(Missed in Planning)* | Field *Assigned By* tertutup. Digunakan jika pekerjaan sebenarnya sudah ada namun luput diidentifikasi saat jam 09:00. |
| **`Priority Change`** | Perubahan Prioritas Proyek *(Priority Change)* | Field *Assigned By* tertutup. Digunakan saat ada reposisi fokus mendadak dari tim/proyek. |
| **`Operational-Incident`**| Insiden Operasional Mendesak *(Operational-Incident)*| Field *Assigned By* tertutup. Digunakan untuk penanganan bug kritis production, server down, atau emergency ticket. |
| **`Other`** | Alasan Operasional Lainnya *(Other)* | Field *Assigned By* tertutup. |

### 3.2 Aturan Kondisional Bidang "Assigned By"
- Saat dropdown alasan memilih `Newly Assigned`:
  1. Panel `#assigned-by-panel` muncul dengan transisi animasi halus (`fadeIn`).
  2. Input `#work-assigned-by` diubah menjadi `required = true` dan kursor otomatis difokuskan ke input tersebut.
- Jika alasan diganti ke opsi lain:
  1. Panel `#assigned-by-panel` otomatis disembunyikan.
  2. Input dikosongkan dan atribut `required` dicabut.

### 3.3 Penegakan Kualitas Deskripsi Pekerjaan (*Quality Warning - FR-63*)
- Sistem mengevaluasi teks deskripsi secara langsung (*live oninput*):
  - Jika karakter $< 10$ atau hanya memuat kata generik (`kerja`, `task`, `meeting`, `review`, `coding`, `lanjut`, `bikin`, `followup`):
    - Muncul badge kuning edukatif di bawah textarea:  
      `⚠ Peringatan Kualitas: Deskripsi terdeteksi sangat singkat atau generik. Pastikan menyebutkan hasil kerja yang terukur agar mudah dievaluasi saat EOD.`
  - **Prinsip Non-blocking:** Peringatan ini **TIDAK mengunci tombol submit**. Karyawan tetap berhak menyimpan jika dirasa sudah cukup.

### 3.4 Mekanisme Integrasi Tiket Blocker Tim (*Quick Blocker Picker*)
- Pada kolom *Tautan Referensi (Opsional)*, tombol `Pilih Blocker Aktif ▾` membuka daftar tiket terbuka milik tim tanpa simbol petir.
- Saat tiket diklik:
  - Input referensi otomatis terisi: `[#BLK-014] Keterlambatan respons spesifikasi API dari klien X`.
  - *Smart Auto-fill:* Jika kotak deskripsi masih kosong, sistem otomatis menawarkan template: *"Menyelesaikan kendala #BLK-014: Keterlambatan respons spesifikasi API dari klien X"*.

### 3.5 Batasan Penghapusan Item (*Pre-EOD Deletion Rule*)
- Item Additional Work yang baru dicatat di halaman ini dapat dibatalkan/dihapus secara mandiri oleh karyawan menggunakan tombol `Hapus` pada kartu log selama formulir **EOD sore hari belum disubmit**.
- Setelah EOD disubmit dan terkunci, seluruh item Additional Work menjadi bagian dari audit trail permanen dan hanya dapat dikoreksi melalui *EOD Correction Request* (PRD FR-53).

---

## 4. KATALOG LENGKAP 14 SKENARIO SISTEM HALAMAN 3

Berikut adalah katalog seluruh skenario operasional pada Halaman 03:

### KELOMPOK 1: AKSES, NAVIGASI & SHELL IDENTITAS (3 Skenario)
#### Skenario 1.1: Navigasi Masuk Pasca-Morning Commitment
- **Kondisi:** Karyawan telah mengunci komitmen pagi di Halaman 02, lalu mengklik tab nomor 2 `Additional Work` pada Daily Step Bar.
- **Tampilan UI:** Layar Halaman 03 terbuka, step bar langkah 1 bertanda centang hijau selesai (`completed`), langkah 2 aktif hijau brand (`active`), dan identitas user membaca sesi aktif Budi Pratama.

#### Skenario 1.2: Navigasi Masuk Bebas Sepanjang Hari Kerja (Asinkron)
- **Kondisi:** Karyawan membuka rute `/today/additional` kapan saja antara pukul 09:30 hingga 17:00 WIB.
- **Tampilan UI:** Formulir selalu siaga menerima catatan tugas tambahan baru.

#### Skenario 1.3: Penggunaan Tombol Cepat Lapor Blocker di Kanan Atas
- **Kondisi:** Karyawan tiba-tiba mengalami kendala fatal saat hendak mencatat tugas tambahan.
- **Interaksi:** Karyawan mengklik tombol `Lapor Blocker` di sudut kanan atas $\rightarrow$ langsung dialihkan ke formulir eskalasi kendala [`05-Raise-Instant-Blocker.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/05-Raise-Instant-Blocker.html).

---

### KELOMPOK 2: INPUT, VALIDASI & KONDISIONAL (5 Skenario)
#### Skenario 2.1: Pencatatan Tugas Baru dari Pimpinan (Newly Assigned + Assigned By)
- **Kondisi:** Karyawan menerima tugas mendadak dari Engineering Manager di siang hari.
- **Alur Pengisian:**
  1. Karyawan mengisi deskripsi: *"Investigasi spike CPU 90% pada service otentikasi"*.
  2. Memilih alasan: *"Tugas Baru Ditugaskan (Newly Assigned)"*.
  3. Panel kondisional muncul $\rightarrow$ Karyawan mengisi nama: *"Pak Joko (Engineering Manager)"*.
  4. Menekan `Simpan Pekerjaan Tambahan`.
- **Hasil UI:** Toast konfirmasi muncul, form direset, dan kartu muncul di log dengan label `Pemberi Tugas: Pak Joko (Engineering Manager)`.

#### Skenario 2.2: Pencatatan Tugas Tambahan Mandiri (Insiden / Prioritas)
- **Kondisi:** Karyawan menangani insiden operasional mendesak tanpa penugasan langsung dari pihak luar.
- **Alur Pengisian:** Karyawan memilih alasan `Insiden Operasional Mendesak (Operational-Incident)`. Field *Assigned By* tetap tersembunyi. Form berhasil disimpan tanpa meminta nama pemberi tugas.

#### Skenario 2.3: Validasi Gagal — Deskripsi Pekerjaan Kosong
- **Kondisi:** Karyawan langsung menekan tombol simpan dengan textarea kosong.
- **Tindakan UI:** Muncul alert merah lembut `#FFF8F8`: *"Deskripsi pekerjaan tambahan wajib diisi."*, border textarea memerah, dan kursor difokuskan ke textarea.

#### Skenario 2.4: Validasi Gagal — Alasan Belum Dipilih
- **Kondisi:** Deskripsi sudah diisi tetapi dropdown alasan masih pada opsi default `-- Pilih Alasan Resmi --`.
- **Tindakan UI:** Muncul alert merah lembut: *"Silakan pilih alasan pekerjaan ini muncul."* dan dropdown difokuskan.

#### Skenario 2.5: Validasi Gagal — Newly Assigned Tanpa Nama Pemberi Tugas
- **Kondisi:** Alasan `Newly Assigned` dipilih, namun input *Assigned By* dibiarkan kosong.
- **Tindakan UI:** Muncul alert merah lembut: *"Pemberi tugas (Assigned By) wajib diisi untuk alasan Tugas Baru Ditugaskan."* dan kursor difokuskan ke input *Assigned By*.

---

### KELOMPOK 3: PANDUAN KUALITAS & REFERENSI TIKET (3 Skenario)
#### Skenario 3.1: Deteksi Deskripsi Sangat Singkat / Generik (Quality Warning)
- **Kondisi:** Karyawan mengetik kata generik seperti `"meeting"` atau `"kerja"`.
- **Tampilan UI:** Tepat di bawah input, muncul badge kuning peringatan kualitas:  
  `⚠ Peringatan Kualitas: Deskripsi terdeteksi sangat singkat atau generik. Pastikan menyebutkan hasil kerja yang terukur...`
- **Sifat:** Edukatif dan *non-blocking* (tombol simpan tetap aktif dan dapat disubmit).

#### Skenario 3.2: Menautkan Tiket Blocker Aktif Tim (Quick Picker)
- **Kondisi:** Karyawan ingin menghubungkan tugas tambahan ini dengan blocker `#BLK-014` yang sedang terjadi.
- **Interaksi:**
  1. Klik tombol `Pilih Blocker Aktif ▾`.
  2. Dropdown apung menampilkan daftar tiket tim tanpa ikon petir.
  3. Memilih item `#BLK-014` $\rightarrow$ kolom tautan terisi `[#BLK-014] Keterlambatan respons spesifikasi API...`.
  4. Jika deskripsi masih kosong, sistem otomatis mengisikan draf pembantu.

#### Skenario 3.3: Memasukkan Tautan URL Eksternal Bebas
- **Kondisi:** Karyawan mengetik tautan URL Jira atau PR GitHub secara manual (misal: `https://jira.dutamedia.com/browse/DEV-889`).
- **Hasil:** Tautan tersimpan di objek item dan dirender sebagai teks tautan biru pada kartu log.

---

### KELOMPOK 4: PENGELOLAAN LOG, RESET & SESI (3 Skenario)
#### Skenario 4.1: Menghapus / Membatalkan Item Tercatat (Pre-EOD)
- **Kondisi:** Karyawan menyadari salah mencatat tugas tambahan atau tugas dibatalkan sebelum sore hari.
- **Interaksi:** Karyawan menekan tombol merah lembut `Hapus` pada kartu log item.
- **Hasil UI:** Item dihapus dari daftar dan `localStorage`, counter berkurang, dan muncul toast: *"Item berhasil dihapus."*.

#### Skenario 4.2: Mengosongkan Formulir (Tombol Reset)
- **Kondisi:** Karyawan sedang mengetik draf tetapi ingin membatalkannya.
- **Interaksi:** Klik tombol `Kosongkan Isian`.
- **Hasil UI:** Textarea, dropdown alasan, panel *Assigned By*, dan kotak peringatan kualitas kembali ke kondisi awal bersih.

#### Skenario 4.3: Pemulihan Sesi di Tempat saat Sesi Habis (UF-03)
- **Kondisi:** Karyawan sedang mengetik deskripsi panjang di tengah jam kerja, tiba-tiba sesi token kedaluwarsa.
- **Tindakan UI:** Muncul dialog modal `#modal-session-timeout`. Karyawan memasukkan kata sandi dan menekan *"Pulihkan Sesi"*. Modal tertutup dan seluruh teks deskripsi yang sedang diketik tetap utuh di layar tanpa reset.

---

## 5. KONTRAK DATA & PANDUAN INTEGRASI BACKEND DEVELOPER

### 5.1 Skema Data Objek Additional Work (`localStorage: workpulse_additional_work_items`)
Setiap kali karyawan menyimpan item tambahan, data disimpan dalam bentuk array of objects:

```json
[
  {
    "id": 1791965872864,
    "description": "Investigasi spike CPU 90% pada service otentikasi",
    "reason": "Newly Assigned",
    "assignedBy": "Pak Joko (Engineering Manager)",
    "reference": "[#BLK-014] Keterlambatan respons spesifikasi API dari klien X",
    "time": "15:17"
  }
]
```

### 5.2 Spesifikasi Endpoint API Backend

#### 1. POST `/api/v1/today/additional-work`
- **Fungsi:** Menyimpan catatan pekerjaan tambahan ke database harian (append-only audit log).
- **Request Payload:**
  ```json
  {
    "description": "Investigasi spike CPU 90% pada service otentikasi",
    "reason": "Newly Assigned",
    "assigned_by": "Pak Joko (Engineering Manager)",
    "reference_url": "https://jira.dutamedia.com/browse/DEV-889"
  }
  ```
- **Response 201 Created:**
  ```json
  {
    "success": true,
    "data": {
      "item_id": "add_work_991823",
      "recorded_at": "2026-10-14T15:17:00+07:00",
      "created_by": "budi.pratama@dutamedia.com"
    }
  }
  ```

#### 2. DELETE `/api/v1/today/additional-work/{item_id}`
- **Fungsi:** Membatalkan/menghapus item sebelum EOD disubmit.
- **Aturan Otorisasi:** Hanya diizinkan jika status harian belum `EOD_SUBMITTED`.

---

*Dokumen ini merupakan spesifikasi implementasi resmi untuk Halaman 03 WorkPulse. Segala perubahan wajib diselaraskan dengan [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md).*
