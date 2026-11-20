# Daftar Perubahan Resmi Sistem Live Setelah Rancangan Awal (4 Paket Pasca-UAT + Perbaikan Uji Chrome)

> **Ditujukan untuk:** Harry (Pemilik Proyek) & Rekan Auditor  
> **Situs Live yang Diaudit:** `https://dutamedia-workpulse.vercel.app`  
> **Acuan Sebelumnya (Baseline & Prototype HTML):** 26 file gambar rancangan awal di folder `Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/*.html` dan dokumen spesifikasi `01-PDD.md` s/d `05-SAD.md`  
> **Versi Kondisi Sistem Live Saat Ini:** **`v1.2`** (Seluruh 4 Paket Pasca-UAT, perbaikan uji Chrome, dan penyesuaian awal audit prototype sudah aktif)  
> **Catatan Lanjutan:** Untuk perubahan hasil **Audit Halaman demi Halaman Prototype vs Sistem Live**, baca juga dokumen pendamping terbaru: [Daftar-Perubahan-Audit-Prototype-vs-Live.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Daftar-Perubahan-Audit-Prototype-vs-Live.md).

---

## Ringkasan Singkat (Baca Ini Dulu Sebelum Mulai Audit)

Saat membandingkan tampilan **situs live** dengan **26 file prototype HTML awal** dan dokumen lama, Anda pasti akan melihat beberapa perbedaan. **Sebagian besar perbedaan itu bukan kesalahan (*bug*), melainkan perubahan resmi yang memang diminta pemilik proyek dan HRGA setelah uji coba UAT selesai.**

Dokumen ini dibuat sebagai **daftar pembanding yang jujur dan konkret ("Dulu di Prototype/Dokumen Lama" vs "Sekarang di Situs Live")** supaya:
1. Anda dan Mas Harry tidak bingung atau salah mencatat perubahan resmi sebagai kesalahan sistem.
2. Sebaliknya, jika ada tampilan berantakan, tombol terpotong di ukuran layar HP/Tablet/Desktop/Layar Lebar, atau perbedaan di luar daftar di bawah ini, maka hal tersebut **sah sebagai temuan audit yang wajib dicatat**.

### 4 Jebakan Paling Sering Membuat Bingung Saat Audit (Wajib Tahu)
1. **Lokasi Asli 26 File Prototype HTML:** Di beberapa catatan lama ditulis singkat `UI-UX-Design/...html`, padahal lokasi lengkapnya di repositori ada di folder **`Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/`** (`01-Login-Activation.html` sampai `25-Admin-User-Invitation-Management.html`, termasuk `16a` dan `16b`).
2. **Nama Alamat Halaman Koreksi & Cuti di Aplikasi Asli:**
   - Dokumen lama sempat menulis `/corrections/submit` dan `/corrections/history` → di aplikasi live, alamat aslinya adalah **`/corrections/morning`** (*Koreksi Komitmen Pagi*) dan **`/corrections/eod`** (*Koreksi Evaluasi Sore*). Masing-masing halaman berisi formulir sekaligus tabel riwayatnya di bagian bawah.
   - Dokumen lama sempat menulis `/leave/request` → di aplikasi live, alamat aslinya adalah **`/leave/my`** (*Cuti Saya*).
3. **Akun Contoh Anak Magang (`Intern`) yang Benar:**
   - Akun `staff.finance@dutamedia.com` (**Oivi Deasepta**) berstatus **Karyawan Tetap**.
   - Akun anak magang (`Intern`) resmi untuk uji coba adalah **`intern.frontend@dutamedia.com`** (**Raka Pratama**) dan **`intern.finance@dutamedia.com`** (**Nisa Amelia**) dengan kata sandi `Password123!`.
4. **Satu Fitur yang Memang Belum Diubah di Versi `v1.1` Saat Ini:**
   - **Alur Persetujuan Cuti 3 Tahap HRGA (`HRGA → Head Divisi → Direktur`)** masih masuk antrean pengembangan berikutnya (*Backlog `v1.2`*). Di situs live sekarang, persetujuan cuti/izin masih berjalan **1 tahap** di halaman `/leave/queue` agar alur uji coba yang sudah lulus tidak rusak.

---

## Bagian 1 — Peta Lengkap Perubahan per Paket (Dulu vs Sekarang di Situs Live)

### 0. Pembaruan Pra-Paket: 16 Kategori Kendala, 9 Dampak (1–3 Pilihan), & Penanggung Jawab Kategori (`CR-018` / `DEC-017`)

| Bagian yang Berubah | Dulu di Prototype HTML / Dokumen Lama | Sekarang di Situs Live (`v1.1`) | Halaman Terkait |
|---|---|---|---|
| **Pilihan Kategori Kendala** | Hanya 6 kategori umum tanpa pengelompokan | **16 kategori kendala** yang tersusun rapi dalam **5 kelompok** (`Teknis & Sistem`, `Kantor & Perangkat`, `Orang & Keputusan`, `Pihak Luar, Uang & Hukum`, `Lainnya`). | `/raise-blockers`, `/blockers` |
| **Pilihan Dampak Kendala** | Dropdown pilihan tunggal (hanya pilih 1 dampak) | **Kotak centang (checkbox) 9 dampak** (wajib pilih **minimal 1**, **maksimal 3 dampak**). Jika sudah memilih 3, 6 kotak sisanya otomatis terkunci. | `/raise-blockers` |
| **Tampilan Kartu Tiket** | Ada pil/lencana singkatan kode bahasa Inggris kaku di atas kartu (misalnya `TECHNICAL`, `MILESTONE`) | Lencana singkatan kaku **dihapus** dari atas kartu. Sebagai gantinya, kategori dan 1–3 dampak ditampilkan lengkap dengan kalimat penjelasnya dalam Bahasa Indonesia di badan kartu. | `/raise-blockers?tab=mine`, `/blockers`, `/blockers/aging` |
| **Tujuan Pengarahan Otomatis** | Selalu mengarah ke Head/Atasan langsung | Tiket kategori teknis/spesifik langsung mengarah ke **staf spesialis Penanggung Jawab Kategori resmi** (misal *Fakhrizal* untuk Server/Jaringan, *Achmad Noer* untuk Hosting/Domain, *Rahian* untuk Perangkat/Akses, *Sugito* untuk Fasilitas Kantor, *Oivi* untuk Keuangan, *Hari Wibowo* untuk Klien Struktural). Staf spesialis tersebut kini **bisa membuka menu `/blockers` dan `/blockers/aging`**. Jika mereka sedang cuti resmi, tiket naik vertikal ke atasan langsungnya (bukan ke rekan sejajar). | `/raise-blockers`, `/blockers`, `/blockers/aging` |

---

### 1. Paket #1 + Perbaikan Chrome (`e452023` & `56cbead`): Status Karyawan (`Tetap` / `Kontrak` / `Intern`), Aturan Izin Magang, Kuota Cuti 12 Hari Kerja, & Filter Laporan

| Bagian yang Berubah | Dulu di Prototype HTML / Dokumen Lama | Sekarang di Situs Live (`v1.1`) | Halaman Terkait |
|---|---|---|---|
| **Status Karyawan di Organisasi & Pengguna** | Semua karyawan dianggap sama, belum ada pemisahan Tetap, Kontrak, dan Magang (`Intern`) | Ada 3 status resmi: **`Karyawan Tetap`**, **`Kontrak`**, dan **`Intern` (Magang)**. Khusus `Intern` **wajib mengisi Tanggal Selesai Magang**, tidak boleh menulis kata `"Intern"` di nama jabatan, dan otomatis mendapat **pil ungu `Intern`** di samping nama. *(Pop-up tambah penugasan organisasi juga sudah diberi pengguliran/scroll agar tidak terpotong di layar standar).* | `/admin/users`, `/admin/organization`, `/profile` |
| **Jumlah Akun & Populasi Laporan** | 23 akun pengguna; seluruh laporan menghitung semua orang jadi satu | Database awal berisi **25 akun** (ditambah *Raka Pratama* & *Nisa Amelia* berstatus `Intern`). Di Dashboard & Laporan, total karyawan operasional tercatat **25 orang** (`23 Tetap + 0 Kontrak + 2 Intern`). | `/dashboard`, `/reports`, `/admin/users` |
| **Hak Cuti Tahunan & Tampilan Akun `Intern` di Cuti Saya** | Semua akun melihat jenis cuti yang sama, tanpa kotak info kuota 12 hari, dan contoh lama sempat menulis panjang `.../ Kampus /...` | **Karyawan Tetap & Kontrak:** Melihat kotak **`Jatah Cuti Tahunan 2026`** (**12 hari kerja/tahun**, memotong hari disetujui & menunggu review) serta semua 6 jenis pengajuan.<br>**Karyawan `Intern`:** Kotak kuota 12 hari disembunyikan dan diganti kotak ungu **`Aturan Izin Karyawan Magang`**. Pilihan jenis hanya **2**: **`Izin (Keperluan Mendesak / Alasan Logis)`** (muat utuh tanpa terpotong `...`) dan **`Sakit`**. Pesan formulir memakai kata **"izin"** (contoh: *"Durasi izin:"* dan *"Alasan permohonan izin minimal 5 karakter."*). Jika mengirim Cuti Tahunan lewat cara lain, server menolak `400`. | `/leave/my` |
| **Rumus Hitung Hari Kerja Cuti/Izin** | Sempat menghitung semua hari kalender (termasuk Sabtu & Minggu) | Baik di layar form, di tabel antrean atasan, maupun di server, rumus sekarang **hanya menghitung hari kerja Senin–Jumat**. Contoh nyata: rentang `03 Des` s/d `22 Des 2026` dihitung tepat **`14 hari kerja`** (bukan 20 hari). | `/leave/my`, `/leave/queue` |
| **Bahasa Peninjauan Izin/Magang oleh Atasan** | Modal review atasan selalu menulis `"Alasan Cuti"` dan `"Permohonan cuti berhasil disetujui"` | Untuk pengajuan jenis `Izin` (`PERMIT`) atau dari pemohon `Intern`, modal menampilkan label **`Alasan Izin / Pengajuan`**, badge ungu **`Intern`** di samping nama pemohon, dan pesan toast **`Permohonan izin berhasil disetujui/ditolak`**. *(Catatan: Di situs live v1.1 sekarang persetujuan masih 1 tahap; 3 tahap masuk Backlog v1.2).* | `/leave/queue` |
| **Pengecualian `Intern` dari Jabatan Pengambil Keputusan** | Belum ada larangan memilih karyawan magang menjadi atasan/penanggung jawab | Akun berstatus `Intern` **otomatis disaring keluar dan ditolak server** dari 7 daftar pilihan wewenang: (1) Atasan Langsung, (2) Project Manager, (3) Escalation Reviewer proyek, (4) Reviewer Sementara, (5) Pemilik Kebijakan, (6) Penanggung Jawab Khusus Blocker termasuk kelompok paling bawah **`── Lainnya ──`** (`0` kemunculan *Raka/Nisa*), dan (7) Atasan penugas di Tugas Tambahan. | `/admin/organization`, `/admin/temporary-reviewers`, `/admin/policies`, `/raise-blockers`, `/daily/additional-work` |
| **Filter Status Karyawan di Dashboard, Laporan, & CSV** | Filter hanya Divisi dan Proyek | Tersedia dropdown filter **`Status Karyawan`** (*Semua Status*, *Karyawan Tetap*, *Kontrak*, *Intern*) di `/dashboard` dan `/reports`, disertai pil status di tabel dan kolom tambahan `Status Karyawan` pada file unduhan `.csv`. Jika filter menghasilkan **0 unit kerja** (seperti memilih `Kontrak`), tabel di `/reports` menampilkan pesan: **`"Belum ada data karyawan untuk status karyawan yang dipilih."`** | `/dashboard`, `/reports` |
| **Lokasi Kantor Resmi** | Dokumen tata kelola awal sempat tertulis Surabaya | Diperbarui menjadi **Malang** pada `Launch-Configuration-Register-Template.md`. | `Dokumen-Perancangan/.../Launch-Configuration-Register-Template.md` |

---

### 2. Paket #2 (`14dbd0f` & `555211e`): Penguncian Tugas Tambahan Pasca-EOD & Bahasa Lembur yang Ramah

| Bagian yang Berubah | Dulu di Prototype HTML / Dokumen Lama | Sekarang di Situs Live (`v1.1`) | Halaman Terkait |
|---|---|---|---|
| **Kunci Formulir Setelah Evaluasi Sore (EOD)** | Formulir Tugas Tambahan hanya terkunci jika cuti atau mencapai 5 tugas; tetap terbuka walau EOD sudah dikirim | Begitu karyawan mengirim **Evaluasi Sore (`/daily/eod`)** atau jam sudah melewati batas malam (`21:00 WIB`), formulir **Tugas Tambahan (`/daily/additional-work`) ikut terkunci otomatis** (baik di tampilan layar maupun ditolak `422` oleh server). | `/daily/additional-work`, `/daily/eod` |
| **Teks Spanduk & Panduan Lembur Mendadak** | Sempat memakai istilah kiasan `"tutup buku"` atau belum ada panduan kerja di luar jam | Menampilkan spanduk: **`"Evaluasi Sore (EOD) Hari Ini Telah Ditutup — Formulir Terkunci"`** (atau *"Batas Waktu EOD (21:00 WIB) Telah Berakhir — Formulir Terkunci"*), seluruh kotak isian tidak aktif, tombol berubah menjadi **`Terkunci Pasca-EOD`**, dan tersedia penjelasan ramah agar lembur mendadak dicatat di hari kerja berikutnya sementara **`Lapor Blocker`** tetap terbuka 24 jam via tautan aktif di spanduk tersebut. | `/daily/additional-work` |
| **Lencana Lembur di Halaman EOD** | Bertuliskan **`LATE (Lembur Fleksibel)`** (berkesan menghakimi terlambat) | Diganti menjadi **`Di Luar Jam Normal (Lembur Fleksibel)`** jika mengisi EOD antara pukul `17:01` sampai `21:00 WIB`. | `/daily/eod` |

---

### 3. Paket #3 (`c45f888` & `56cbead`): Penghapusan Kata Teknis `SLA` & Bahasa Inggris di Pengaturan Kebijakan

| Bagian yang Berubah | Dulu di Prototype HTML / Dokumen Lama | Sekarang di Situs Live (`v1.1`) | Halaman Terkait |
|---|---|---|---|
| **Istilah `SLA` di Kendala, Eskalasi, & Notifikasi** | Memakai kata `"SLA"` (*Target SLA*, *Status SLA*, *Pelanggaran SLA*, *Remaining SLA*) | Kata `SLA` **dihapus 100%** (`0` kemunculan) dan diganti istilah Bahasa Indonesia yang langsung dipahami karyawan: **`Target Respon`**, **`Batas Waktu Penanganan`**, **`Status Batas Waktu`**, **`Sisa Waktu 2j 52m`**, dan **`Lewat Batas Waktu`**. | `/raise-blockers`, `/blockers`, `/blockers/aging`, `/notifications` |
| **Tombol Template Cepat Catatan Coaching** | Memakai kata `SLA` pada tombol apresiasi cepat | Diubah menjadi **`Penanganan cepat kendala kritis layanan aktif (waktu respon < 45 menit)`**. | `/coaching` |
| **Kategori & Kolom Modal di Pengaturan Kebijakan** | 5 kategori memuat akhiran kurung bahasa Inggris (`(Check-in Timing)`, `(Blocker SLA)`, `(Compliance Threshold)`, `(Correction Window)`, `(Notification Reminder)`), dan kolom pop-up memakai bahasa Inggris (*Morning On-Time Deadline*, *Change Justification*) | Akhiran bahasa Inggris & kata `SLA` dihapus dari kartu, tabel Pemilik Kebijakan, dan dropdown modal (`Target Waktu Respon & Penanganan Kendala` / `Target Waktu Penanganan Kendala`, `Ambang Peringatan Batas Waktu Kendala (%) *`). Seluruh 6 kolom input dalam modal **Buat Versi Kebijakan Baru** kini berbahasa Indonesia: **`Batas Tepat Waktu Pagi *`**, **`Batas Kunci Pengisian Pagi (Cut-Off) *`**, **`Batas Tepat Waktu Sore (EOD) *`**, **`Batas Kunci Pengisian Sore (Cut-Off) *`**, **`Tanggal Mulai Berlaku *`**, dan **`Alasan Perubahan Kebijakan *`**. *(Catatan untuk auditor: pada 2 baris riwayat log audit lama tanggal 11 Nov 2026 di tabel paling bawah, masih terlihat kata "SLA" karena log sejarah tidak boleh diubah surut).* | `/admin/policies` |

---

### 4. Paket #4 (`f3e6e22` & `56cbead`): Format Waktu Seragam 24 Jam WIB Tanpa Detik & Tanpa Rumus Profil

| Bagian yang Berubah | Dulu di Prototype HTML / Dokumen Lama | Sekarang di Situs Live (`v1.1`) | Halaman Terkait |
|---|---|---|---|
| **Format Jam & Zona Waktu Lintas 19+ Halaman** | Beberapa layar masih memakai titik (`09.30`), ada detik (`:00`), `AM/PM`, atau mengikut jam perangkat browser pengguna | Seluruh jam sistem dikunci ke zona waktu resmi **WIB (`Asia/Jakarta`)**, format 24 jam, pemisah titik dua (`:`), tanpa detik, dan selalu memakai akhiran **`WIB`** (contoh: **`10:45 WIB`**, **`20 Nov 2026, 14:45 WIB`**, **`Evaluasi: 11:55 WIB`**), dengan lebar angka sejajar rapi (*tabular numerals*). *(Catatan: Jika di isi deskripsi tiket contoh lama masih ada tulisan `08.00 WIB`, itu murni teks ketikan pengguna pada data contoh, bukan format jam sistem).* | Seluruh 19 halaman bertanggal/jam (`/daily/*`, `/blockers*`, `/corrections/*`, `/leave/*`, `/notifications`, `/dashboard`, `/coaching`, `/compliance`, `/exemptions`, `/profile`, `/admin/*`) |
| **Kartu Aturan Pengingat di Profil Pengguna** | Panel 3 menuliskan rumus kurung siku teknis `([Deadline - 60m, Deadline))` | Rumus teknis dihapus, diganti kalimat sehari-hari: **`"...dikirim tepat 60 menit sebelum batas waktu tepat waktu dan berhenti tepat saat batas waktu tiba."`** | `/profile` |

---

## Bagian 2 — Peta Rute Live vs File Prototype HTML (Acuan Audit Halaman demi Halaman)

Gunakan tabel ini saat mengecek setiap halaman di Chrome (`375px`, `768/1024px`, `1440px`, `1920px`) dan membandingkannya dengan file rancangan HTML di `Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/`:

| No | Halaman & Rute di Situs Live | File Prototype HTML Asal | Status Perubahan dari Prototype | Catatan Khusus untuk Auditor |
|---|---|---|---|---|
| 1 | **Login** (`/login`) | `01-Login-Activation.html` | **Sesuai baseline + Audit #2** (`429`, logo HP, ingat email) | Teks pengantar 2 kolom, header logo HP/tablet, tombol mata lihat sandi, centang `Ingat email di perangkat ini` aktif, banner kuning `Batas Percobaan Terlampaui`, banner hijau pasca-aktivasi, & pesan merah jelas untuk akun `INVITED` / `INACTIVE`. Detail di [Daftar-Perubahan-Audit-Prototype-vs-Live.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Daftar-Perubahan-Audit-Prototype-vs-Live.md). |
| 2 | **Aktivasi Akun** (`/activate`) | `01-Login-Activation.html` | **Sesuai baseline + Audit #2** (`DEC-005`) | Header logo HP/tablet, **Kartu Pratinjau Akun** (`UNDANGAN AKTIF`), 4 garis + kotak **3 syarat kata sandi** wajib kombinasi huruf & angka, tombol mata konfirmasi, & banner kuning token `USED` / `REVOKED` / `EXPIRED`. Detail di [Daftar-Perubahan-Audit-Prototype-vs-Live.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Daftar-Perubahan-Audit-Prototype-vs-Live.md). |
| 3 | **Profil Pribadi** (`/profile`) | `24-Profile-Settings.html` | **Berubah (Paket #1, #4, Fix)** | Ada baris **Status Karyawan** (dan **Masa Magang Berakhir** jika `Intern`). Panel 3 bersih tanpa rumus kurung siku. |
| 4 | **Error 403 / 404** (`/forbidden`, `/*`) | Standar sistem | Baru setelah prototype | Menampilkan peran saat ini, halaman yang ditolak, & tombol kembali ke halaman awal peran. |
| 5 | **Komitmen Pagi** (`/daily/morning`) | `02-Morning-Commitment.html` | **Berubah (Paket #4 + Cuti + Audit #1)** | Format jam `HH:mm WIB`, spanduk hijau Cuti/Izin Resmi disetujui, opsi `0 Komitmen` (`DEC-004`), serta **Audit #1 (`dabb266`, `69bb068`)**: `Prioritas Kemarin Sore` persisten sebelum & sesudah submit, data H-1/H-2 nyata (`Carry-Over #2+ AMBER` + centang multi-item), `Simpan Draf` lokal tahan `F5`, & footer 1 baris. Detail lihat [Daftar-Perubahan-Audit-Prototype-vs-Live.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT/Daftar-Perubahan-Audit-Prototype-vs-Live.md). |
| 6 | **Tugas Tambahan** (`/daily/additional-work`) | `03-Additional-Work.html` | **Berubah (Paket #1, #2, #4)** | **Terkunci otomatis setelah EOD dikirim atau > 21:00 WIB** dengan tombol `Terkunci Pasca-EOD` dan tautan `Lapor Blocker`. Pilihan atasan bebas `Intern`. |
| 7 | **Evaluasi Sore EOD** (`/daily/eod`) | `04-EOD-Outcome.html` | **Berubah (Paket #2, #4)** | Lencana sore `17:01–21:00 WIB` tertulis **`Di Luar Jam Normal (Lembur Fleksibel)`**. Tombol `GREEN` tetap bisa dipilih (`DEC-003`). |
| 8 | **Riwayat Saya** (`/daily/history`) | `06-My-History-Weekly-Summary.html` | **Berubah ringan (Paket #3/#4)** | Kolom `Waktu Pagi` & `Waktu EOD` menampilkan status ketepatan (`ON_TIME`/`LATE`), rincian bisa dibuka–tutup, tolak unduh CSV jika kosong. |
| 9 | **Lapor & Pantau Blocker** (`/raise-blockers`) | `05-Raise-Instant-Blocker.html` | **Berubah Besar (CR-018, Paket #1, #3, #4)** | 2 tab (*Buat Laporan* & *Blocker Saya*), **16 kategori (5 grup)**, **9 kotak centang dampak (1–3)**, tanpa badge kode kaku, `0` kata `SLA`, format `HH:mm WIB`, serta **tidak ada nama `Intern`** di dropdown `#assignedOwner` (termasuk `── Lainnya ──`). |
| 10 | **Antrean Blocker** (`/blockers`) | `09-Blocker-Escalation-Queue.html` | **Berubah Besar (CR-018, Paket #3, #4)** | Terbuka bagi staf **Penanggung Jawab Kategori**, menampilkan 16 kategori & multi-dampak lengkap, tombol bertahap (`Terima & Tangani` → 3 tombol PIC, sedangkan Non-PIC hanya `Beri Bantuan`), `0` kata `SLA`, format `HH:mm WIB`. |
| 11 | **Penuaan & Eskalasi** (`/blockers/aging`) | `14-Escalation-Aging.html` | **Berubah (Paket #3, #4)** | Header, kartu, dan tabel bebas total dari kata `SLA` (*Keterlambatan Penanganan Blocker*), cap waktu evaluasi `HH:mm WIB`. |
| 12 | **Catatan Coaching** (`/coaching`) | `10-Manager-Note-Coaching-Record.html` | **Berubah (Paket #1, #3, #4)** | Chip template cepat memakai **`(waktu respon < 45 menit)`**, bukan `SLA`; dropdown karyawan bebas `Intern` sebagai atasan; waktu `HH:mm WIB`. |
| 13 | **Antrean Kepatuhan** (`/compliance`) | `11-Compliance-Queue-HRGA.html` | **Berubah ringan (Paket #4)** | Penanda pola pelanggaran 3x, aksi `Tindak Lanjuti`, pemutihan otomatis dari cuti/izin, waktu `HH:mm WIB`. |
| 14 | **Manajemen Dispensasi** (`/exemptions`) | `12-Exemption-Management.html` | **Berubah ringan (Paket #4)** | Dispensasi terikat rentang tanggal (`DEC-013`), format tanggal WIB. |
| 15 | **Koreksi Komitmen Pagi** (`/corrections/morning`) | `16a-Morning-Correction-Request.html` | **Berubah ringan (Paket #4)** | Halaman berisi formulir `MINOR` vs `MATERIAL` (di atas) dan tabel riwayat pengajuan pribadi (di bawah), format waktu `HH:mm WIB`. |
| 16 | **Koreksi Evaluasi Sore** (`/corrections/eod`) | `16b-EOD-Correction-Request.html` | **Berubah ringan (Paket #4)** | Halaman berisi formulir koreksi EOD + riwayat pribadi di bawah, penanda waktu `HH:mm WIB`. |
| 17 | **Review Koreksi** (`/corrections/review`) | `22-Correction-and-Leave-Review.html` | Sesuai baseline (+ **Paket #4**) | Pembandingan nilai Sebelum vs Diajukan (*Diff*) & persetujuan atasan / Reviewer Sementara. |
| 18 | **Cuti Saya** (`/leave/my`) | `20-My-Leave-Request.html` | **Berubah Besar (Paket #1, #4, Fix)** | Karyawan Tetap/Kontrak melihat kuota **12 hari kerja**; **`Intern` melihat kotak ungu Izin Magang & hanya pilihan `Izin (Keperluan Mendesak / Alasan Logis)` + `Sakit`**. Rumus hitung durasi hanya Senin–Jumat. |
| 19 | **Persetujuan Cuti** (`/leave/queue`) | `21-Leave-Approval-Queue.html` | **Berubah (Paket #1, #4, Fix)** | Pil ungu `Intern`, rumus hari kerja Senin–Jumat, label modal dinamis (`Alasan Izin / Pengajuan`), pesan sukses dinamis. Persetujuan di v1.1 masih 1 tahap (`Backlog v1.2` untuk 3 tahap). |
| 20 | **Pusat Notifikasi** (`/notifications`) | `07-Notification-Center-Browser-Push.html` | **Berubah (Paket #3, #4)** | `0` kata `SLA`, waktu `HH:mm WIB`, kategori & dampak di pesan blocker berbahasa Indonesia penuh, pengaman tombol halaman Admin bagi staf. |
| 21 | **Pulse Dashboard** (`/dashboard`) | `08-Pulse-Dashboard.html` | **Berubah (Paket #1, #4)** | Ditambah **filter Status Karyawan** (`Tetap`/`Kontrak`/`Intern`), pil ungu `Intern` pada baris karyawan magang, total 25 personil perusahaan. |
| 22 | **Radar Risiko Proyek** (`/projects/risk`) | `13-Project-Risk-View.html` | Sesuai baseline | Grid kartu proyek (`WP-CORE`, `PRJ-CORE`, dll.) dengan modal rincian saat kartu diklik. |
| 23 | **Laporan Eksekutif** (`/reports`) | `23-Reports.html` | **Berubah (Paket #1, Fix)** | Ditambah **filter & kolom Status Karyawan**, kolom baru pada ekspor `.csv`, serta pesan tabel kosong **`"Belum ada data karyawan untuk status karyawan yang dipilih."`** saat hasil filter 0 data. |
| 24 | **Kelola Pengguna** (`/admin/users`) | `25-Admin-User-Invitation-Management.html` | **Berubah (Paket #1, #4)** | Menampilkan 25 pengguna, pil ungu `Intern`, informasi `Selesai magang`, serta pilihan status karyawan di form tambah/edit. |
| 25 | **Undangan Karyawan** (`/admin/invitations`) | `15-Admin-Organizational-Mapping.html` / `25-...` | **Berubah ringan (Paket #4)** | Daftar undangan terpisah (`PENDING`/`ACCEPTED`/`EXPIRED`/`REVOKED`), salin token 72 jam, Kirim Ulang, Cabut. |
| 26 | **Struktur Organisasi** (`/admin/organization`) | `15-Admin-Organizational-Mapping.html` | **Berubah (Paket #1, #4, Fix)** | Tab 1 (Atasan Langsung + **Status Karyawan + wajib Tanggal Selesai untuk `Intern`** + larangan `Intern` jadi atasan) & Tab 2 (Kewenangan Proyek, bebas `Intern`). Modal kini bisa digulir rapi. |
| 27 | **Reviewer Sementara** (`/admin/temporary-reviewers`) | `17-Admin-Temporary-Reviewer.html` | **Berubah (Paket #1, #4)** | Pilihan delegasi melarang `SYSTEM_ADMIN` dan `Intern`. Penerima aktif mendapat akses `/leave/queue`, `/corrections/review`, `/blockers`. |
| 28 | **Kebijakan & Cut-Off** (`/admin/policies`) | `18-Policy-Settings.html` | **Berubah (Paket #1, #3, #4, Fix)** | Bebas `SLA` & bebas kurung bahasa Inggris di kategori, 6 kolom modal kebijakan baru sudah Bahasa Indonesia, tabel Pemilik Kebijakan melarang `Intern`, log audit `HH:mm WIB`. |
| 29 | **Saluran Notifikasi** (`/admin/notifications`) | `19-Admin-Notification-Channel-Setup.html` | Sesuai baseline | Kartu 3 kanal (In-App, Email SMTP, Web Push) + tombol uji kirim notifikasi + log pengiriman. |

---

## Panduan Singkat Saat Anda Mengaudit Layar Responsif (4 Ukuran)

Saat memeriksa halaman #1 sampai #29 di Chrome DevTools (`Device Toolbar`):
1. **Layar HP (`375px`):** Pastikan menu samping bisa dibuka/tutup dengan tombol garis tiga, form tidak melebar melebihi layar (*tidak muncul scroll kiri-kanan di seluruh halaman*), tombol tidak bertumpuk, dan jendela pop-up tetap bisa digulir sampai tombol Simpan.
2. **Layar Tablet (`768px` & `1024px`):** Pastikan kartu KPI atas tersusun 2 kolom yang rapi, filter tidak menabrak judul, dan daftar kiri + rincian kanan di `/blockers` tidak saling menjepit teks.
3. **Layar Desktop (`1440px`) & Layar Lebar (`1920px`):** Pastikan tata letak seimbang, tidak ada kolom dropdown sempit yang memotong teks (seperti dropdown jenis izin di `/leave/my`), dan jarak antar panel tetap rapi.
