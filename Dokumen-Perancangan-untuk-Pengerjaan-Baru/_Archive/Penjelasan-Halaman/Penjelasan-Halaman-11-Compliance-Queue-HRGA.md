# DOKUMEN PERANCANGAN & SPESIFIKASI HALAMAN 11
## HALAMAN 11: PENINJAUAN KETIDAKPATUHAN & PEMBINAAN TIM (COMPLIANCE QUEUE HRGA)

---

# BAGIAN 1: PERSYARATAN, ALUR KERJA & ATURAN BISNIS (LANGKAH 1)

## 1.1 Definisi, Peran & Filosofi Halaman 11

Halaman 11 (**Peninjauan Ketidakpatuhan & Pembinaan Tim / Compliance Queue**) adalah instrumen resmi bagi tim **HRGA (Human Resources & General Affairs)** dan **Pimpinan Terkait (Supervisor / Head of Department)** untuk memantau, meninjau, dan menindaklanjuti ketidakpatuhan pengisian akuntabilitas harian karyawan (*No Submission*) secara objektif, transparan, dialogis, dan adil.

### Filosofi Utama Produk (Product Philosophy §19 PRD):
> *"WorkPulse dirancang untuk membuat masalah terlihat lebih cepat, bukan menghukum karyawan lebih cepat. Sistem adalah instrumen pencatat bukti faktual (*evidence recorder*), bukan algojo otomatis yang memvonis atau menerbitkan surat peringatan (SP) secara sepihak."*

Halaman ini mengubah paradigma pengawasan: dari yang sebelumnya berupa kecurigaan atau tebak-tebakan manual, menjadi **rekam jejak berbasis data transparan** yang selalu mengedepankan dialog manusiawi melalui **Matriks Distingsi Kasus**.

---

## 1.2 Matriks Pengguna & Kontrol Hak Akses (RBAC)

Halaman 11 adalah antarmuka khusus di bawah kelompok navigasi **`MANAGEMENT`**. Hak aksesnya diatur secara ketat berdasarkan peran pengguna:

| Peran Pengguna | Lingkup Akses Pemantauan | Tindakan yang Diizinkan |
|---|---|---|
| **HRGA / People Admin**<br>*(Dewi Anggraeni / Rina Puspita)* | **Seluruh Perusahaan (Company-Wide)** | • Melihat seluruh antrean event kepatuhan lintas divisi.<br>• Memfasilitasi dialog evaluasi bersama manajer lini.<br>• Mencatat hasil sesi pembinaan dan status tindak lanjut.<br>• Merujuk berkas ke penegakan disiplin formal offline jika berulang. |
| **Head of Department**<br>*(Ayu Nirmala)* | **Satu Divisi Penuh (Division-Scoped)** | • Melihat antrean kepatuhan staf di bawah divisinya.<br>• Memberikan arahan bimbingan kepada supervisor terkait. |
| **Supervisor / Team Lead**<br>*(Ahmad Fauzan)* | **Satu Tim / Squad (Team-Scoped)** | • Melihat event kepatuhan anggota tim bawahan langsung.<br>• Melakukan sesi tatap muka (*coaching dialog*) dan mencatat kesepakatan solusi. |
| **CEO / Direksi**<br>*(Bambang Soedirgo)* | **Tingkat Eksekutif (Overview)** | • Memantau agregat tren kepatuhan perusahaan (melalui Halaman 08 / Pulse Dashboard & Halaman 23 / Reports). |
| **Staf Karyawan Biasa**<br>*(Budi Pratama)* | **DILARANG (403 Forbidden)** | • Menu `Compliance Queue` tidak ada di sidebar staf.<br>• Jika membuka URL langsung, sistem memblokir dengan layar **403 Akses Dibatasi**. |

---

## 1.3 Aturan Bisnis Kritis (Business Rules & Requirements)

Berdasarkan dokumen resmi PRD (FR-28 s/d FR-30, FR-70 s/d FR-73), PDD v1.4 (§7 & §8), dan Database Schema (`ComplianceEvent`), berikut adalah aturan baku yang mengatur Halaman 11:

### 1. Deteksi Kejadian Tanpa Laporan / No Submission (FR-28 & AC-39)
* Sistem mendeteksi *No Submission* jika karyawan tidak mengirimkan komitmen pagi (*Morning Check-in*) atau hasil evaluasi sore (*EOD Outcome*) melewati batas waktu toleransi (*grace period*) pada hari kerja resmi.
* **Pengecualian Sah (BR-07 & Exemption):** Karyawan yang tercatat sedang cuti (*approved leave*), hari libur nasional (*holiday*), atau memiliki dispensasi khusus (*exemption*) **TIDAK BOLEH** dideteksi sebagai *No Submission*.

### 2. Pembentukan Penanda Pola Berulang / Pattern Flag (FR-29 & AC-40)
* Jika seorang karyawan mengalami **3 kali kejadian No Submission dalam rentang 30 hari kerja kalender bergulir**, sistem secara otomatis membentuk **Pattern Flag**.
* Kejadian 1 atau 2 kali diperlakukan sebagai kelalaian administratif tunggal (*single miss*). Kejadian ke-3 mengubah statusnya menjadi *Pattern Flag*.

### 3. Prinsip Mutlak Non-Otomatisasi Sanksi (BR-08, FR-30, FR-72 & AC-70, AC-81)
* **DILARANG KERAS** ada tombol *"Terbitkan SP"*, *"Beri Sanksi"*, atau pemotongan insentif/gaji otomatis di dalam sistem.
* Sistem tidak boleh menyimpulkan karyawan bersalah tanpa verifikasi manusia.
* Seluruh penegakan sanksi disipliner formal (Surat Peringatan 1/2/3) **wajib berlangsung di luar sistem (offline HR process)** sesuai UU Ketenagakerjaan dan Peraturan Perusahaan, di mana data WorkPulse hanya berperan sebagai **bukti pendukung objektif (*supporting evidence*)**.

### 4. Review Event Kepatuhan Wajib Dialog (FR-70, FR-71 & AC-79, AC-80)
* Setiap *Pattern Flag* yang muncul wajib diselesaikan melalui **Sesi Dialog Tinjauan (*Review Event*)** antara HRGA, Manajer Lini, dan Karyawan bersangkutan.
* Formulir tindak lanjut wajib mencatat:
  1. Penjelasan/konteks kendala dari karyawan.
  2. Bentuk bimbingan (*coaching*) atau penyesuaian dukungan kerja yang disepakati.
  3. Penanggung jawab tindak lanjut (*action owner*) dan target tanggal pemantauan ulang.
  4. Stempel waktu (WIB), identitas pembuat, dan jejak audit yang tidak dapat dihapus (*append-only audit trail*).

### 5. Penerapan Matriks Distingsi Kasus (FR-73 & PRD §13.1)
Saat meninjau event kepatuhan, HRGA dan Manajer wajib membedakan kasus menggunakan 4 kuadran objektif:
* **Masalah Kapasitas / Teknis (*Performance Issue*):** Karyawan kewalahan karena beban sistem mati, insiden produksi, atau kurang pelatihan $\rightarrow$ *Tindakan:* Bantuan teknis & penyesuaian beban kerja.
* **Kelambatan Eskalasi / Koordinasi (*Accountability Issue*):** Karyawan menemui kendala pihak ketiga tapi terlambat melapor $\rightarrow$ *Tindakan:* Bimbingan manajemen waktu dan eskalasi dini.
* **Lupa Administratif Tunggal (*Administrative Miss*):** Karyawan bekerja penuh tetapi lupa menekan tombol submit $\rightarrow$ *Tindakan:* Pengingat ramah (*friendly reminder*).
* **Pola Pengabaian Berulang (*Discipline / Negligence Pattern*):** Karyawan berulang kali tidak mengisi tanpa alasan yang sah setelah sesi pembinaan diberikan $\rightarrow$ *Tindakan:* Pencatatan peringatan resmi (*recorded warning*) dan rujukan ke proses disipliner offline HR.

---

## 1.4 Alur Interaksi Pengguna (User Flow - UF-33)

Alur kerja operasional penanganan kepatuhan pada Halaman 11 berjalan melalui 5 tahapan berurutan:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TAHAP 1: DETEKSI SISTEM                                                                │
│ Sistem mendeteksi 3x No Submission dalam 30 hari kerja $\rightarrow$ Terbit "Pattern Flag"       │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TAHAP 2: PENINJAUAN DI ANTREAN KEPATUHAN (HALAMAN 11)                                  │
│ HRGA / Atasan membuka Halaman 11 $\rightarrow$ Melihat daftar event terurut prioritas urgency     │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TAHAP 3: DIALOG KARYAWAN & MATRIKS DISTINGSI KASUS                                     │
│ Pimpinan mengklik [Detail], memeriksa tanggal kejadian, lalu mengundang dialog tatap   │
│ muka untuk mendengarkan klarifikasi karyawan tanpa prasangka bersalah.                 │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TAHAP 4: PENCATATAN TINDAK LANJUT RESMI (MODAL INPUT)                                  │
│ HRGA/Manajer mengklik [+ Tindak Lanjut], memilih 1 dari 4 status siklus resmi,         │
│ menginput uraian kesepakatan solusi, dan menyimpan ke audit trail.                     │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TAHAP 5: SINKRONISASI ARSIP & PEMANTAUAN                                               │
│ Event berstatus selesai diperbarui di antrean. Jika berulang kembali di kemudian hari, │
│ riwayat ini menjadi bukti autentik untuk proses pembinaan lanjutan/offline HR.         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.5 Empat Status Siklus Tindak Lanjut Resmi (*Compliance Progression*)

Sesuai model data backend (`ComplianceEventType` & PDD §7), status penanganan kepatuhan bergerak melalui 4 status baku:

1. **`Reminder Sent` (Pengingat Terkirim):**  
   Pengingat resmi telah disampaikan kepada karyawan atas kelalaian pengisian. Status ini menegaskan belum ada sanksi apapun.
2. **`Coaching Scheduled` / `Coaching Recorded` (Pembinaan Terjadwal/Tercatat):**  
   Sesi dialog pembinaan tatap muka telah dijadwalkan atau dilaksanakan bersama atasan langsung, dengan kesepakatan perbaikan cara kerja.
3. **`Recorded Warning` (Peringatan Administratif Tercatat):**  
   Peringatan internal tercatat dalam sistem karena pola kelalaian tetap berulang setelah pembinaan diberikan. Catatan ini menjadi arsip internal manajemen & HRGA.
4. **`Escalated to Offline Disciplinary` (Eskalasi ke Proses Disiplin Formal Offline):**  
   Berkas kepatuhan diteruskan ke meja pimpinan HRGA untuk diproses penegakan disiplin ketenagakerjaan formal di dunia nyata (di luar sistem aplikasi).

---

## 1.6 Prinsip Kolaborasi Wajib (Tripartit: HRGA – Atasan Langsung – Karyawan)

Sesuai tata kelola PRD §13.2 dan PDD §7, penanganan kepatuhan pada Halaman 11 **BUKAN urusan sepihak tim HRGA saja**, melainkan mewajibkan kolaborasi aktif bersama Atasan Langsung:

1. **Mengapa HRGA Wajib Melibatkan dan Melaporkannya ke Atasan Langsung?**
   - **HRGA hanya memegang data administratif (kuantitatif):** HRGA mengetahui fakta bahwa karyawan 3x tidak check-in, tetapi tidak mengetahui beban kerja riil di lapangan.
   - **Atasan Langsung memegang konteks operasional (kualitatif):** Atasan langsung (Supervisor / Lead) adalah pihak yang mengetahui apakah karyawan sedang lembur darurat mengatasi insiden sistem, offsite meeting bersama klien, atau memang lalai.
   - **Mencegah sanksi salah sasaran (*unfair penalization*):** Karyawan tidak boleh dihukum atas kelalaian check-in jika atasan menugaskannya fokus darurat pada penyelamatan insiden krisis produksi.
   - **Fungsi pembinaan teknis (*coaching*):** Arahan solusi beban kerja dan manajemen waktu hanya bisa diberikan oleh Atasan Langsung unit kerja terkait.

2. **Pembagian Tanggung Jawab Operasional:**
   - **Peran HRGA (Fasilitator & Pengawal Tata Tertib):**
     - Memantau antrean Halaman 11 dan mendeteksi penanda pola berulang (*Pattern Flag*).
     - Menghubungi Atasan Langsung terkait untuk menginisiasi sesi dialog bersama.
     - Memastikan proses dialog mematuhi Matriks Distingsi Kasus secara adil dan objektif.
     - Mendokumentasikan hasil kesepakatan dan memelihara audit trail kepatuhan.
   - **Peran Atasan Langsung (Penilai Konteks & Coach):**
     - Mengikuti sesi dialog klarifikasi tatap muka bersama karyawan dan HRGA.
     - Menilai akar penyebab masalah secara substantif.
     - Merumuskan kesepakatan perbaikan cara kerja dan bertindak sebagai **Pemilik Pemantauan (*Action Owner*)**.
   - **Kapan HRGA Mengambil Alih Secara Mandiri?**
     - HRGA hanya memegang kendali penegakan disiplin sepihak jika karyawan telah melalui sesi pembinaan oleh atasan berkali-kali namun tetap mengabaikan kewajiban (*Pola Pengabaian Berulang*), sehingga status dinaikkan menjadi `Eskalasi Formal HR` untuk pemanggilan resmi penegakan Surat Peringatan (SP) offline.

---

# BAGIAN 2: PETA IMPLEMENTASI IDEAL SESUAI PEDOMAN KONSISTENSI (LANGKAH 2)

Bagian ini merumuskan bagaimana seluruh kebutuhan pada Bagian 1 diimplementasikan secara konkret pada antarmuka Halaman 11 agar selaras 100% dengan **Pedoman Konsistensi Desain dan Perilaku Lintas Halaman WorkPulse**.

---

## 2.1 Navigasi Shell & Standar Header

1. **Sidebar Navigation Shell Baku (§1 Pedoman Konsistensi):**
   * Logo WorkPulse dengan lencana hijau botol (`#0F5338`).
   * Kelompok menu **`WORKSPACE`** (*My Today, My Blockers, My History, My Leave, Notifications*).
   * Kelompok menu **`MANAGEMENT`** dengan menu **`Compliance Queue`** berstatus aktif (`.nav-link.active`).
   * Profil pengguna bawah: Menampilkan identitas HRGA aktif (*Dewi Anggraeni · HRGA Specialist · Compliance Scope*).
2. **Topbar & Header Terpadu (§2 Pedoman Konsistensi):**
   * *Breadcrumb:* `Workspace / Manajemen / Peninjauan Ketidakpatuhan`.
   * *Simulator Peran (QuickRoleSwitcher):* Memungkinkan pergantian akun untuk demonstrasi:
     - `dewi-anggraeni` (HRGA Specialist · Seluruh Perusahaan)
     - `ahmad-fauzan` (Supervisor Engineering · Squad A)
     - `ayu-nirmala` (Head of Engineering · Divisi Engineering)
     - `budi-pratama` (Staf Karyawan · Demonstrasi 403 Akses Dibatasi)
   * Tombol Aksi Kanan: Tombol Refresh Sinkronisasi, Tombol Notifikasi, dan Avatar Profil.
3. **Judul Halaman & Subtitle Manusiawi:**
   * Judul: `<h1>Peninjauan Ketidakpatuhan & Pembinaan Tim</h1>`
   * Subtitle: `Tinjau catatan ketidakpatuhan laporan harian dan sepakati langkah pembinaan bersama atasan secara adil dan transparan.`
   * *Scope Card Badge:* Menampilkan ruang lingkup wewenang sesi aktif (*Cakupan: Seluruh Perusahaan · HRGA Compliance Authority*).

---

## 2.2 Ringkasan Metrik Kepatuhan Interaktif (§3 Pedoman Konsistensi)

Di bawah header, dihadirkan **4 Kartu Metrik Ringkasan Interaktif** yang dapat diklik untuk menyaring antrean secara instan (*Click-to-Filter* dua arah):

```
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ KARTU 1 (AMBER)         │ │ KARTU 2 (MERAH)         │ │ KARTU 3 (HIJAU/TEAL)    │ │ KARTU 4 (UNGU/NETRAL)   │
│ Perlu Ditinjau          │ │ Pola Berulang (3x)      │ │ Dalam Pembinaan         │ │ Rujukan Formal HRGA     │
│ 4 Kasus                 │ │ 5 Kasus                 │ │ 2 Kasus                 │ │ 2 Kasus                 │
│ Menunggu jadwal dialog  │ │ 3x tanpa laporan 30 hr  │ │ Sesi perbaikan berjalan │ │ Penanganan resmi HRGA   │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

* **Perilaku Responsif:**
  - Kartu memiliki efek *hover* halus dan *active-filter indicator* (bingkai aksen saat dipilih).
  - Mengklik Kartu 1 otomatis menyaring tabel ke kasus yang berstatus *Perlu Ditinjau*.
  - Mengklik Kartu 2 menyaring tabel khusus ke kasus *Pola Berulang (3x)*.
  - Mengklik Kartu 3 menyaring tabel ke kasus yang sedang *Dalam Pembinaan*.
  - Mengklik Kartu 4 menyaring tabel ke kasus yang dirujuk ke *Penanganan Resmi HRGA*.

---

## 2.3 Bilah Filter Terpadu / Unified FilterBar (§4 Pedoman Konsistensi)

Tepat di atas tabel data, dihadirkan bilah kontrol pencarian dan penyaringan terpadu dengan judul panel **`Daftar Kasus Ketidakpatuhan Aktif`**:

1. **Kotak Pencarian Cerdas (*Live Search*):**
   * Placeholder: *"Cari nama karyawan, ID kasus, jabatan, catatan..."*
   * Menyaring data secara instan pada teks nama, NIK/ID kasus (`CMP-2026-XXXX`), jabatan, squad, divisi, dan isi catatan solusi tanpa perlu tombol Enter.
2. **Dropdown Kategori Kasus:**
   * `Semua Kategori Kasus` *(Default)*
   * `Pola Berulang (≥ 3x Tanpa Laporan)` *(Pattern Flag ≥3x)*
   * `Kelalaian Tunggal (1x Tanpa Laporan)` *(Single Miss)*
   * `Pelanggaran Prosedur Kerja` *(PRD §13.1 - Bypass QA/Release SOP)*
   * `Kelalaian Akuntabilitas` *(PRD §13.1 - Menyembunyikan Blocker Kritis)*
3. **Dropdown Status Tindak Lanjut:**
   * `Semua Status Tindak Lanjut` *(Default)*
   * `Menunggu Klarifikasi` *(Pending Clarification/Review)*
   * `Pengingat Terkirim` *(Reminder Sent)*
   * `Pembinaan Tercatat` *(Coaching Recorded)*
   * `Peringatan Tercatat` *(Recorded Warning)*
   * `Rujukan Formal HRGA` *(Escalated to Formal HRGA)*
   * `Selesai Pembinaan (Pulih)` *(Coaching Completed / Restored)*
   * `Klarifikasi Sah (Gugur)` *(Justified Exemption / Case Dismissed)*
4. **Dropdown Filter Divisi / Fungsi Organisasi:**
   * `Semua Divisi` *(Default)*
   * `Engineering & Delivery`
   * `Product & Design`
   * `Operations & Infrastructure`
   * `Business & Marketing`
   * `Finance & Corporate`
   * *Perilaku Cerdas Scope RBAC:* Dropdown divisi secara dinamis hanya menampilkan divisi yang berada di bawah wewenang pengguna aktif (misal: Supervisor hanya melihat divisinya sendiri, sedangkan HRGA melihat seluruh divisi perusahaan).
5. **Tombol Reset Filter:**
   * Mengembalikan semua dropdown ke posisi default, mengosongkan kotak pencarian, dan mereset filter metrik yang aktif.

---

## 2.4 Struktur Tabel Data Kepatuhan Baku (§5 Pedoman Konsistensi)

Setiap baris data kepatuhan disusun menggunakan standar keterbacaan tinggi yang memuat 6 kolom terstruktur:

| Kolom | Elemen yang Ditampilkan | Penjelasan Desain Baku |
|---|---|---|
| **1. Karyawan & Jabatan** | • Avatar bulat dengan inisial nama.<br>• Nama Lengkap Karyawan (Tebal).<br>• Jabatan & Divisi (Abu-abu sekunder).<br>• Nomor ID Kasus Monospace (`CMP-2026-XXXX`). | Memberikan identifikasi subjek yang jelas tanpa membingungkan. |
| **2. Klasifikasi Kasus** | • Lencana semantik jenis kasus:<br>  - `Pola Berulang` (Merah lembut `#FEF2F2`, teks merah `#991B1B`, jumlah kemunculan dinamis: 3x, 4x, dst).<br>  - `Kelalaian Tunggal` (Amber lembut `#FFFBEB`).<br>  - `Pelanggaran Prosedur / Akuntabilitas` (Ungu lembut `#FAF5FF`).<br>• Keterangan waktu: *30 hari kerja terakhir* atau *Minggu Berjalan*. | Membedakan secara visual antara pelanggaran berulang, kelalaian tunggal, dan isu proses. |
| **3. Tanggal Kejadian** | • Kapsul tanggal spesifik yang memicu kasus (misal: `12 Okt`, `18 Sep`, `10 Sep`).<br>• Tautan cek silang: *Bebas dari cuti/dispensasi*. | Menunjukkan transparansi fakta empiris, bukan tuduhan sepihak. |
| **4. Status Tindak Lanjut** | • Lencana status siklus resmi WorkPulse:<br>  - `Menunggu Klarifikasi` (Amber)<br>  - `Pengingat Terkirim` (Biru)<br>  - `Pembinaan Tercatat` (Hijau)<br>  - `Peringatan Tercatat` (Netral Gelap)<br>  - `Rujukan Formal HRGA` (Ungu)<br>  - `Selesai Pembinaan` (Hijau/Emerald)<br>  - `Klarifikasi Sah` (Teal lembut) | Menginformasikan tahap penyelesaian kepatuhan secara seketika dan transparan. |
| **5. Catatan Solusi Terakhir** | • Ringkasan teks pembinaan terakhir.<br>• Tanggal pembinaan & Nama atasan yang mendampingi. | Memastikan adanya transparansi bahwa karyawan telah diajak berdialog. |
| **6. Aksi Operasional** | • Tombol Sekunder: `Detail` (membuka modal detail lengkap tanggal & catatan).<br>• Tombol Primer: `+ Tindak Lanjut` (membuka modal pencatatan bimbingan). | Aksi langsung di tempat tanpa memuat ulang halaman (*in-place modal*). |

---

## 2.5 Modal Dialog Tindak Lanjut Kepatuhan Terpadu (§6 Pedoman Konsistensi)

Ketika tombol `+ Tindak Lanjut` diklik, muncul modal dialog modern dengan komponen:

1. **Header Modal:**
   * Judul: `Tindak Lanjut: [Nama Karyawan]`
   * Subtitle: Menampilkan ID Kasus, Jabatan, dan Squad yang sedang ditinjau.
2. **Pilihan Status Tindak Lanjut Baru (Dropdown):**
   * Memilih 1 dari 7 status resmi siklus kepatuhan WorkPulse:
     1. `Menunggu Klarifikasi` — Belum ada dialog dengan karyawan.
     2. `Pengingat Terkirim` — Tanpa sanksi, pemberitahuan awal.
     3. `Pembinaan Tercatat` — Dialog tatap muka & solusi disepakati.
     4. `Peringatan Tercatat` — Arsip internal jika kelalaian berulang.
     5. `Rujukan Formal HRGA` — Diteruskan ke penanganan resmi HRGA.
     6. `Selesai Pembinaan` — Masa evaluasi berhasil, komitmen kerja kembali 100%.
     7. `Klarifikasi Sah` — Terbukti ada dinas/alasan sah, kasus ditutup tanpa sanksi.
3. **Field Uraian Klarifikasi Karyawan & Arahan Pimpinan (Wajib):**
   * Textarea responsif dengan live character counter (Minimal 20 karakter, maksimal 2.000 karakter).
   * Placeholder kontekstual: *"Tuliskan rangkuman penjelasan karyawan, akar penyebab kendala, dan kesepakatan solusi bimbingan yang disepakati bersama atasan..."*
4. **Field Penanggung Jawab & Target Tanggal Evaluasi (Opsional tapi Direkomendasikan):**
   * Input nama penanggung jawab pemantauan (*Action Owner*: Atasan Langsung atau HRGA) dan pemilih tanggal (*Target Date Picker*).
5. **Tombol Aksi:**
   * `Batal` (Menutup modal tanpa perubahan).
   * `Simpan Catatan Tindak Lanjut` (Menyimpan data persisten ke `localStorage`, memicu toast notifikasi sukses, memberikan highlight visual kuning selama 2 detik pada baris tabel, dan memperbarui status baris tabel serta kartu metrik secara *real-time*).

---

## 2.6 Catatan Kaki Penegasan Batas Wewenang Sistem (§7 Pedoman Konsistensi)

Di bagian bawah tabel data antrean, disediakan **Catatan Kaki Batas Wewenang (*System Boundaries Footnote*)** yang ringan, bersih, dan menenangkan:
* Ikon Perisai Kepatuhan.
* Teks Baku:
  > **Prinsip Batas Wewenang:**  
  > *WorkPulse berfungsi sebagai pencatat fakta kerja objektif dan pendukung dialog pembinaan tim. Tindakan disipliner formal diproses secara terpisah di luar sistem oleh manajemen HRGA.*

---

## 2.7 Penanganan Akses Dibatasi untuk Karyawan (RBAC 403)

Konsisten dengan Halaman 08 dan Halaman 10:
* Jika sesi aktif diubah ke akun staf biasa (*Budi Pratama*), sistem menyembunyikan tabel dan bilah antrean, lalu menampilkan **Layar 403 Akses Dibatasi**:
  * Judul: `Halaman Khusus Manajemen HRGA (403)`
  * Penjelasan: *"Antrean Kepatuhan dirancang khusus sebagai alat kontrol bagi tim HRGA dan pimpinan unit kerja. Karyawan biasa tidak memiliki izin mengakses modul ini."*
  * Tombol Pengalihan: `[Buka My History ↗]` untuk melihat komitmen dan catatan evaluasi diri sendiri.
  * Tombol Demonstrasi: `[Beralih ke Akun HRGA (Simulasi)]`.

---

# BAGIAN 3: EVALUASI KONDISI KODE EKSISTING HALAMAN 11 (LANGKAH 3)

Berdasarkan pemeriksaan mendalam terhadap berkas eksisting [`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html) (yang saat ini hanya berukuran 66 baris kode minified kasar), ditemukan kesenjangan yang sangat masif dibandingkan peta implementasi ideal pada Bagian 2:

| No | Aspek Evaluasi | Kondisi Kode Eksisting Halaman 11 Saat Ini | Susunan Peta Implementasi Ideal yang Seharusnya | Tingkat Kesenjangan & Dampak |
|---|---|---|---|---|
| **1** | **Shell Navigasi & Sidebar** | • Berkas berupa 66 baris kode HTML minified padat.<br>• Ikon sidebar memakai karakter simbol teks mentah kuno (`◷`, `▤`, `▣`, `♧`, `◉`, `✓`, `✎`, `▥`).<br>• Seluruh tautan sidebar berupa anchor hash buntu (`#today`, `#history`, `#leave`, dll) bukan tautan berkas asli prototype.<br>• Sidebar di-hardcode ke user `Rina Puspita` tanpa simulasi multi-peran. | • Menggunakan shell standar WorkPulse yang bersih, terstruktur, dan elegan.<br>• Seluruh ikon menggunakan inline SVG standar WorkPulse (stroke 2px).<br>• Tautan terhubung langsung ke berkas prototype asli (`02-Morning-Commitment.html`, `06-My-History...`, `08-Pulse-Dashboard.html`, dll).<br>• Profil sesi terhubung ke registry pengguna dengan simulasi peran. | 🔴 **KRITIS**<br>Merusak konsistensi antar-halaman dan menciptakan tautan buntu (*broken links*). |
| **2** | **Kontrol Akses (RBAC) & Layar 403** | • Tidak ada pengecekan hak akses peran sama sekali.<br>• Akun staf (seperti Budi Pratama) dapat membuka halaman ini secara bebas tanpa peringatan pembatasan wewenang. | • Sistem memeriksa izin manajerial/HRGA aktif.<br>• Jika akun staf mencoba membuka halaman, sistem otomatis memblokir dan memunculkan **Layar 403 Akses Dibatasi** dengan tombol kembali ke *My History*. | 🔴 **KRITIS**<br>Melanggar klausul keamanan hak akses dan hierarki navigasi sidebar. |
| **3** | **Kartu Metrik Ringkasan Kepatuhan** | • 4 kartu metrik berbentuk kotak polos tanpa ikon semantik.<br>• Teks label mencampuradukkan bahasa Indonesia dan Inggris kaku (*"Perlu ditinjau"*, *"Repeated non-submission"*, *"Coaching tercatat"*, *"Escalated"*).<br>• Kartu metrik bersifat statis pasif (tidak bisa diklik untuk menyaring antrean). | • 4 Kartu Metrik terstandarisasi dengan ikon SVG dan palet warna semantik baku (*Amber, Merah, Hijau, Ungu*).<br>• Label baku Bahasa Indonesia manusiawi.<br>• Dilengkapi fitur **Click-to-Filter dua arah** yang otomatis menyaring tabel saat diklik. | 🟡 **SEDANG**<br>Mengurangi ergonomi dan efisiensi kerja tim HRGA dalam memilah kasus prioritas. |
| **4** | **Bilah Filter & Pencarian (FilterBar)** | • Filter sangat sederhana: hanya kotak cari, dropdown jenis event primitif, dropdown status, dan filter periode.<br>• Tidak ada filter menurut **Divisi / Unit Kerja** (padahal wajib sesuai PRD §FR-37).<br>• Kotak pencarian tidak menyaring nama divisi atau teks catatan secara mendalam. | • Bilah Filter Terpadu lengkap dengan pencarian cerdas 5 dimensi (Nama, ID, Jabatan, Divisi, Bukti).<br>• Dropdown Kategori Event, Dropdown Status Siklus Resmi, dan Dropdown Divisi Kerja.<br>• Tombol Reset yang membersihkan seluruh filter dalam sekali klik. | 🟡 **SEDANG**<br>Menyulitkan HRGA perusahaan besar saat mencari karyawan pada departemen tertentu. |
| **5** | **Struktur Tabel Antrean Kepatuhan** | • Tabel HTML mentah tanpa padding memadai.<br>• Kolom Karyawan hanya memuat tumpukan teks tanpa avatar inisial dan tanpa pemisah visual yang rapi.<br>• Kolom tanggal tidak menampilkan rincian tanggal kejadian yang memicu flag.<br>• Kolom aksi hanya berisi tombol kecil dengan aksi *Detail* yang sekadar memunculkan toast sementara. | • Tabel modern responsif dengan struktur 6 kolom baku WorkPulse.<br>• Kolom Karyawan dilengkapi avatar inisial, nama tebal, role, dan ID event monospace.<br>• Kolom tanggal memuat **kapsul tanggal kejadian spesifik** (misal: `12 Okt`, `18 Sep`, `10 Sep`).<br>• Kolom aksi menyediakan tombol `Detail Riwayat` lengkap dan `+ Tindak Lanjut`. | 🔴 **KRITIS**<br>Tampilan terlihat primitif, tidak informatif, dan tidak mencerminkan transparansi data PRD. |
| **6** | **Modal Dialog Tindak Lanjut Kepatuhan** | • Modal dialog sangat sederhana, hanya memuat dropdown status dan satu textarea mentah.<br>• Pilihan status memakai istilah bahasa Inggris (*Reminder Sent*, *Coaching*, *Recorded Warning*, *Escalated*).<br>• **Tidak ada panduan Matriks Distingsi Kasus (§13.1 PRD).**<br>• Tidak ada field *Action Owner* dan *Target Evaluation Date* (padahal diwajibkan oleh PRD §FR-71!).<br>• Tidak ada penghitung karakter (*character counter*) dan tidak ada validasi minimal karakter. | • Modal Dialog terpadu dengan panduan kontekstual Matriks Distingsi Kasus.<br>• Dropdown status siklus resmi berbahasa Indonesia manusiawi.<br>• Field lengkap: Uraian Klarifikasi Karyawan (min. 20 karakter), Pemilik Tindak Lanjut, dan Target Tanggal Evaluasi.<br>• Penegasan etika non-auto SP di dalam modal. | 🔴 **KRITIS**<br>Menghilangkan amanat inti PRD §13.1 dan PRD §FR-71 mengenai pencatatan bimbingan yang akuntabel. |
| **7** | **Persistensi Data & Deep-Linking** | • Data hanya disimpan dalam memori variabel array JavaScript lokal (`seedEvents`). Begitu browser di-refresh, seluruh perubahan tindak lanjut langsung lenyap.<br>• Tidak ada dukungan URL deep-linking (`?event_id=...` atau `?employee=...`). | • Persistensi penuh menggunakan `localStorage` (`workpulse_compliance_events`).<br>• Sinkronisasi audit trail dengan stempel waktu WIB autentik.<br>• Deep-linking otomatis membaca parameter URL dan membuka modal/filter terkait. | 🔴 **KRITIS**<br>Tidak memenuhi standar prototype fungsional WorkPulse dan tidak dapat diuji secara persisten. |
| **8** | **Kebocoran Bahasa Spesifikasi (Specification Leaks)** | • Memuat tulisan defensif programmer di badan halaman:<br>  - `<span class="pill neutral">Data contoh</span>`<br>  - `<div class="notice warning">Batas sistem: Compliance Queue mendokumentasikan fakta event... Tidak ada tombol SP...</div>`<br>  - `<div class="footnote">Prototype interaktif dengan data contoh lokal... belum terhubung ke server...</div>` | • Seluruh kalimat defensif pengembang dibersihkan 100%.<br>• Pesan etika sistem disampaikan melalui **Banner Batas Wewenang Sistem & Regulasi Ketenagakerjaan** yang berbobot profesional dan formal. | 🟡 **SEDANG**<br>Mengurangi kredibilitas visual antarmuka dan menimbulkan kesan belum selesai (*under construction*). |

---

# BAGIAN 4: PLAN PERBAIKAN HALAMAN 11 (LANGKAH 4)

Berdasarkan kesenjangan di atas, perbaikan Halaman 11 akan dijalankan melalui **5 Fase Kerja Berurutan**:

### Fase 1: Standarisasi Shell Navigasi, Topbar, & Proteksi Akses RBAC 403
1. Mengganti seluruh struktur shell usang dengan **WorkPulse Shell Baku**:
   - Memasukkan Google Fonts (*Plus Jakarta Sans* / *Inter*) dan palet token warna resmi (`--brand: #0F5338`, dsb).
   - Sidebar standar dengan ikon SVG murni, tautan navigasi prototype yang valid, dan menu aktif `Compliance Queue`.
   - Topbar dengan breadcrumb terstruktur (`Workspace / Manajemen / Antrean Kepatuhan`) dan simulator peran (`quickRoleSwitcher`).
2. Menghadirkan logika proteksi RBAC:
   - Jika peran aktif adalah Staf (*Budi Pratama*), sidebar menyembunyikan grup `Management`, dan layar utama menampilkan **Layar 403 Akses Dibatasi** dengan tombol pengalihan ke *My History*.

### Fase 2: Purifikasi Header, Penghapusan Kebocoran Spesifikasi & Penataan Metrik
1. Memperbarui judul dan copywriting header:
   - H1: `Antrean Kepatuhan & Pembinaan Disiplin`
   - Subtitle manusiawi: *"Pantau penanda pola non-submission dan dokumentasikan sesi pembinaan tim secara objektif, dialogis, dan transparan."*
   - Lencana ruang lingkup: `Cakupan Wewenang: Seluruh Perusahaan · HRGA Compliance Scope`.
2. Menghapus seluruh tulisan kebocoran spesifikasi (*"Data contoh"*, *"Prototype interaktif..."*, *"Footnote developer"*).
3. Menggantinya dengan **Banner Batas Wewenang Sistem & Regulasi Ketenagakerjaan** yang profesional di bawah tabel antrean.

### Fase 3: Rekonstruksi 4 Kartu Metrik Ringkasan Interaktif (*Click-to-Filter*)
1. Membangun 4 kartu metrik simetris dengan ikon semantik SVG:
   - **Kartu 1 (Amber):** `Perlu Ditinjau` (Event yang menunggu sesi dialog).
   - **Kartu 2 (Merah Lembut):** `Pola Berulang (3x)` (Karyawan dengan Pattern Flag).
   - **Kartu 3 (Hijau/Teal):** `Dalam Pembinaan` (Kasus dalam pendampingan aktif).
   - **Kartu 4 (Ungu/Netral):** `Eskalasi Disiplin HR` (Kasus yang dirujuk ke proses offline).
2. Menghubungkan kartu metrik dengan fungsi **Click-to-Filter dua arah**: mengklik kartu metrik langsung menyaring tabel data secara serentak.

### Fase 4: Modernisasi Bilah Filter Terpadu & Tabel Data Kepatuhan 6 Kolom Baku
1. Membangun **Unified FilterBar** responsif:
   - Kotak pencarian cerdas *real-time* (nama, ID, jabatan, divisi, catatan).
   - Dropdown Kategori Event (`Semua`, `Pola Berulang (3x)`, `Kelalaian Tunggal`).
   - Dropdown Status Siklus Tindak Lanjut (`Semua`, `Menunggu Review`, `Pengingat Terkirim`, `Pembinaan Tercatat`, `Peringatan Tercatat`, `Eskalasi Formal HR`).
   - Dropdown Divisi Kerja (`Semua Divisi`, `Engineering`, `Product`, `Operations`, dll).
   - Tombol Reset Filter yang membersihkan seluruh saringan dan parameter URL.
2. Menyusun **Tabel Data Kepatuhan 6 Kolom Baku**:
   - Kolom 1: Avatar bulat, Nama Lengkap, Jabatan, Divisi, dan Kode Monospace `CMP-2026-XXXX`.
   - Kolom 2: Lencana jenis event (`Pola Berulang` merah / `Kelalaian Tunggal` amber).
   - Kolom 3: Kapsul tanggal kejadian spesifik (misal: `12 Okt`, `08 Okt`, `03 Okt`).
   - Kolom 4: Lencana status siklus resmi WorkPulse.
   - Kolom 5: Kutipan ringkas pembinaan & nama pimpinan pendamping.
   - Kolom 6: Tombol aksi ganda `Detail Riwayat` dan `+ Tindak Lanjut`.
3. Membangun tampilan ramah saat data kosong (*Filtered Empty State*).

### Fase 5: Rekonstruksi Modal Dialog Tindak Lanjut, Persistensi `localStorage` & Deep-Linking
1. Membangun **Modal Dialog Tindak Lanjut Terpadu**:
   - Header modal dengan identitas subjek dan ID event.
   - Kotak panduan kontekstual **Matriks Distingsi Kasus (§13.1 PRD)**.
   - Pilihan status siklus resmi (4 status baku).
   - Textarea uraian klarifikasi & arahan solusi (minimal 20 karakter, live counter).
   - Input penanggung jawab tindak lanjut (*Action Owner*) dan pemilih tanggal (*Target Evaluation Date*).
   - Kotak penegasan etika non-auto SP.
2. Membangun **Modal Detail Riwayat Kejadian**:
   - Menampilkan kronologi lengkap tanggal-tanggal kejadian No Submission beserta catatan historisnya.
3. Menanamkan **Deep-Linking & Persistensi Penuh**:
   - Data tersimpan persisten di `localStorage: workpulse_compliance_events`.
   - Membaca URL parameter (misal: `?event_id=CMP-1048` atau `?filter=repeated`) secara reaktif.
   - Memberikan toast notification dan animasi highlight baris yang baru diperbarui.

---

# BAGIAN 5: KETERKAITAN DATA DENGAN HALAMAN LAIN (CROSS-PAGE CONTRACTS)

Halaman 11 berperan sebagai poros kepatuhan dan pembinaan disiplin kerja yang terhubung erat dengan seluruh siklus akuntabilitas WorkPulse:

| Halaman Terkait | Bentuk Keterkaitan & Aliran Data |
|---|---|
| **Halaman 01 (Login)** | Menerima pengalihan peran `HRGA` (Dewi Anggraeni) langsung ke antrean `/compliance`, serta memberlakukan proteksi Layar 403 jika diakses langsung oleh staf reguler. |
| **Halaman 02 & 04 (Morning & EOD)** | Ketiadaan penyerahan komitmen pagi atau evaluasi sore melewati batas toleransi resmi memicu pencatatan event *No Submission*. |
| **Halaman 06 (My History & Weekly Summary)** | Jejak ketidakhadiran laporan dan ringkasan dialog pembinaan tersinkronisasi sebagai bukti audit objektif pada riwayat personal karyawan. |
| **Halaman 08 (Pulse Dashboard)** | Menyuplai data kasus *Pattern Flag (3x)* aktif ke Widget 4 CEO/Management untuk pemantauan tata kelola kedisiplinan tingkat korporat. |
| **Halaman 10 (Manager Notes)** | Hasil dialog pembinaan kepatuhan dapat ditindaklanjuti atasan langsung menjadi *Coaching Record* resmi di Halaman 10. |
| **Halaman 12 (Exemption Management)** | Membaca master hari libur resmi dan dispensasi dinas luar kota agar karyawan berizin sah tidak keliru dideteksi sebagai *No Submission*. |
| **Halaman 15 (Admin Mapping)** | Menggunakan struktur atasan langsung (*Direct Manager*) dan departemen resmi untuk mengikutsertakan manajer lini dalam sesi evaluasi dialogis. |

---

# BAGIAN 6: STATUS KESIAPAN & VERIFIKASI AKHIR SISTEM (LANGKAH 5)

Seluruh spesifikasi pada berkas [`11-Compliance-Queue-HRGA.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/11-Compliance-Queue-HRGA.html) telah teruji secara visual dan fungsional di lingkungan peramban modern, bebas dari kesalahan konsol (*zero console errors*), serta siap diintegrasikan penuh ke dalam backend:
1. **Pemisahan Matriks Distingsi Kasus:** Terpasang lengkap di modal dialog tindak lanjut (membedakan kapasitas teknis vs kelalaian operasional).
2. **Prinsip Non-Otomatisasi Sanksi (Zero Auto-SP):** 100% patuh; tidak ada tombol terbitkan sanksi sepihak di sistem.
3. **Penyaringan Reaktif & Click-to-Filter:** 4 kartu ringkasan metrik dan single-row filter bar menyaring data antrean secara instan.
4. **Proteksi Wewenang RBAC & Layar 403:** Membatasi akses murni untuk peran manajemen (HRGA, Head, Supervisor) dan mengisolasi staf biasa.

