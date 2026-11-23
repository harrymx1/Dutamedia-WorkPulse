# BUKU PANDUAN PENGGUNA — VERSI STAKEHOLDER (PIMPINAN, HRGA, DIREKTUR, & ADMIN SISTEM)
# WORKPULSE — SISTEM PENCATATAN KOMITMEN HARIAN & PENANGANAN KENDALA KERJA

**PT Dutamedia Mandiri Pratama — Malang (Waktu Indonesia Barat / WIB)**  
**Alamat Aplikasi:** `https://dutamedia-workpulse.vercel.app`  
**Versi Panduan:** `v1.5` *(Selaras 100% dengan Aplikasi Live & Dokumen Induk Alur Sistem)*

> [!NOTE]
> **Untuk Siapa Buku Panduan Ini?**  
> Buku ini khusus disusun untuk **Supervisor / Technical Lead**, **Project Manager**, **Kepala Divisi (`HEAD`)**, **Staf Spesialis Penanggung Jawab Kategori Kendala**, **Reviewer Sementara**, **Tim HRGA**, **Direktur / CEO**, dan **Administrator Sistem (`SYSTEM_ADMIN`)**.  
> Untuk panduan kerja harian karyawan & anak magang (`My Today`, `Lapor Blocker`, `Cuti Saya`), silakan baca dokumen pendamping: **`Buku-Panduan-Pengguna-Karyawan-dan-Magang.md`**.

---

## DAFTAR ISI

1. **BAB 1 — Peta Wewenang, Peran Ganda, & Pemisahan Tugas**
   - 1.1 Matriks Hak Akses Menu per Peran
   - 1.2 Lima Wewenang Dinamis (Mengapa Menu Bisa Bertambah/Berkurang Otomatis)
   - 1.3 Prinsip Pemisahan Tugas Administrator & Pengecualian Anak Magang (`Intern`)
2. **BAB 2 — Pemantauan Harian & Risiko Proyek (`Management`)**
   - 2.1 Membaca Pulse Dashboard, Filter Status Karyawan, & Tombol `Bantu Unblock` (`/dashboard`)
   - 2.2 Memantau Radar Risiko Proyek & Modal Rincian Risiko (`/projects/risk`)
   - 2.3 Membaca Laporan Eksekutif & Mengunduh CSV / Cetak PDF (`/reports`)
3. **BAB 3 — Penanganan Antrean Kendala & Pemantauan Batas Waktu (`Blocker Management`)**
   - 3.1 Mengelola Antrean Blocker 2 Panel (`/blockers`)
   - 3.2 Memantau Penuaan & Pelanggaran Batas Waktu (`/blockers/aging`)
   - 3.3 Aturan Cuti Vertikal & Pencegahan Pengarahan Diri Sendiri
4. **BAB 4 — Tinjauan Persetujuan Tim (`Persetujuan Cuti` & `Review Koreksi`)**
   - 4.1 Memutuskan Permohonan Cuti & Izin Magang (`/leave/queue`)
   - 4.2 Meninjau Permohonan Koreksi Laporan dengan Perbandingan Visual (`/corrections/review`)
5. **BAB 5 — Pengawasan Kepatuhan, Dispensasi, & Pembinaan (`HRGA` & `Atasan`)**
   - 5.1 Menangani Antrean Kepatuhan Harian: `Tindak Lanjut` & `Ubah Catatan` (`/compliance`)
   - 5.2 Menerbitkan & Mencabut Dispensasi Resmi (`/exemptions`)
   - 5.3 Mencatat Sesi Pembinaan / Coaching: `Dibagikan ke Karyawan` vs `Rahasia Manajemen` (`/coaching`)
   - 5.4 Kapan Menggunakan `Tindak Lanjut` di `/compliance` vs `Catat Pembinaan` di `/coaching`?
6. **BAB 6 — Tata Kelola Administrasi Organisasi & Kebijakan (`Administration`)**
   - 6.1 Kelola Pengguna & Penonaktifan Akun (`/admin/users`)
   - 6.2 Mengundang Karyawan Baru — Token 72 Jam (`/admin/invitations`)
   - 6.3 Struktur Organisasi, Wewenang Proyek, & Siklus Hidup Mutasi / Pengangkatan `Intern` (`/admin/organization`)
   - 6.4 Delegasi Reviewer Sementara (`/admin/temporary-reviewers`)
   - 6.5 Kebijakan Jam Kerja, Pemilik Kebijakan Multi-Owner, & Jejak Audit (`/admin/policies`)
   - 6.6 Saluran Notifikasi, 9 Pemicu Resmi, & Simulasi Uji Kirim (`/admin/notifications`)
7. **BAB 7 — Tanya-Jawab & Solusi Operasional Stakeholder (FAQ)**

---

# BAB 1: PETA WEWENANG, PERAN GANDA, & PEMISAHAN TUGAS

### 1.1 Matriks Hak Akses Menu per Peran

| Menu Sidebar | Alamat Halaman | Supervisor / Lead | Project Manager | Head Divisi | HRGA | Direktur (CEO) | System Admin |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Grup Workspace (`My Today`, `Lapor Blocker`, `Cuti Saya`, dll.)** | `/daily/*`, `/raise-blockers`, `/leave/my`, `/corrections/*` | Ya | Ya | Ya | Ya | Ya | **Diblokir (`403`)** |
| **Pulse Dashboard** | `/dashboard` | Ya *(Proyek)* | Ya *(Proyek)* | Ya *(Divisi)* | Ya *(Semua)* | Ya *(Semua)* | Ya |
| **Antrean Blocker** | `/blockers` | Ya | Ya | Ya | Ya | Ya | Ya |
| **Penuaan & Eskalasi** | `/blockers/aging` | Ya | Ya | Ya | Ya | Ya | Ya |
| **Radar Risiko Proyek** | `/projects/risk` | Ya *(Lead)* | Ya *(Lead)* | Ya | Ya | Ya | Ya |
| **Catatan Coaching** | `/coaching` | Jika Punya Bawahan | Jika Punya Bawahan | Ya | Ya | Ya | Jika Punya Bawahan |
| **Persetujuan Cuti** | `/leave/queue` | Jika Delegasi | Jika Delegasi | Ya | Jika Delegasi | Ya | Tidak |
| **Review Koreksi & Cuti** | `/corrections/review` | Jika Delegasi | Jika Delegasi | Ya | Jika Delegasi | Ya | Tidak |
| **Laporan Eksekutif** | `/reports` | Tidak | Tidak | Ya *(Divisi)* | Ya *(Semua)* | Ya *(Semua)* | Ya *(Semua)* |
| **Antrean Kepatuhan & Dispensasi** | `/compliance`, `/exemptions` | Tidak | Tidak | Tidak | Ya | Ya | Ya |
| **Pengguna, Undangan, Organisasi, Reviewer Sementara** | `/admin/users`, `/admin/invitations`, `/admin/organization`, `/admin/temporary-reviewers` | Tidak | Tidak | Tidak | Ya | Ya | Ya |
| **Kebijakan & Cut-off** | `/admin/policies` | Tidak | Tidak | Jika Pemilik Kebijakan | Jika Pemilik Kebijakan | **Penuh** | **Penuh** |
| **Saluran Notifikasi** | `/admin/notifications` | Tidak | Tidak | Tidak | Ya | Ya | Ya |

---

### 1.2 Lima Wewenang Dinamis (Mengapa Menu Bisa Bertambah/Berkurang Otomatis)

Selain peran dasar di atas, sistem otomatis membuka atau menutup menu sesuai 5 penugasan aktif berikut:
1. **Punya Bawahan Langsung Aktif:** Membuka menu **`Catatan Coaching` (`/coaching`)** — berlaku bahkan bagi staf senior berstatus `EMPLOYEE` yang membawahi staf lain (contoh: *Ratna Sari* di Divisi Finance).
2. **Pimpinan Proyek Aktif (`Project Lead`):** Siapa pun yang tercatat memimpin proyek di `/admin/organization` Tab 2 otomatis mendapat akses **`Pulse Dashboard`**, **`Radar Risiko Proyek`**, **`Antrean Blocker`**, dan **`Penuaan & Eskalasi`**. Begitu proyek ditutup lewat **`Tutup Wewenang`**, akses proyek otomatis berakhir.
3. **Penanggung Jawab Kategori Kendala Resmi:** Staf spesialis (contoh: *Fakhrizal*, *Achmad Noer*, *Rahian*, *Sugito*, *Oivi*, *Hari Wibowo*) otomatis mendapat akses **`Antrean Blocker` (`/blockers`)** dan **`Penuaan & Eskalasi` (`/blockers/aging`)** meski peran dasarnya `EMPLOYEE`.
4. **Reviewer Sementara Aktif:** Selama tanggal delegasi di `/admin/temporary-reviewers` sedang berlaku, penerima delegasi otomatis mendapat akses **`Persetujuan Cuti` (`/leave/queue`)**, **`Review Koreksi & Cuti` (`/corrections/review`)**, **`Antrean Blocker`**, dan **`Penuaan & Eskalasi`** untuk divisi pejabat yang digantikan.
5. **Pemilik Kebijakan Resmi (`Policy Owner`):** Pejabat yang ditunjuk di Seksi 7 `/admin/policies` berhak mengubah parameter hanya pada kategori kebijakan yang menjadi wewenangnya (kategori lain bertanda `[Terkunci: Bukan Pemilik]`).

---

### 1.3 Prinsip Pemisahan Tugas Administrator & Pengecualian Anak Magang (`Intern`)

- **Pemisahan Tugas Administrator (`SYSTEM_ADMIN`):** Akun `admin@dutamedia.com` dikhususkan untuk pengaturan teknis & tata kelola. Seluruh menu kerja harian `Workspace` disembunyikan dan diblokir (`403`), serta tidak boleh dipilih sebagai Reviewer Sementara agar statistik kinerja karyawan murni mencerminkan personel operasional.
- **Pengecualian Anak Magang (`Intern`):** Akun berstatus `Intern` (seperti *Raka Pratama* dan *Nisa Amelia*) otomatis disaring keluar dan ditolak sistem dari **7 jabatan pengambil keputusan**: (1) Atasan Langsung, (2) Project Manager, (3) Escalation Reviewer Proyek, (4) Reviewer Sementara, (5) Pemilik Kebijakan, (6) Penanggung Jawab Khusus Blocker, dan (7) Pemberi Tugas Tambahan.

---

# BAB 2: PEMANTAUAN HARIAN & RISIKO PROYEK (`MANAGEMENT`)

### 2.1 Membaca Pulse Dashboard, Filter Status Karyawan, & Tombol `Bantu Unblock` (`/dashboard`)

> **[Gambar `WP-SS-20` — Pulse Dashboard Cakupan Pimpinan (`/dashboard`)]**  
> *Tampilkan cakupan `Divisi Saya` / `Seluruh Perusahaan`, filter `Status Karyawan`, 4 kartu metrik utama, panel `Personil Butuh Bantuan Hari Ini` (dengan tombol `Bantu Unblock`), dan `Feed Dukungan Lintas Fungsi`.*

#### A. Cakupan Tampilan Otomatis
- **Supervisor / Project Manager:** Melihat cakupan **`Tim (Proyek)`** untuk anggota proyek yang dipimpin.
- **Kepala Divisi (`HEAD`):** Terkunci aman pada **`Divisi Saya`** (tidak bisa melihat data divisi lain).
- **Direktur (`CEO`) & HRGA:** Melihat **`Seluruh Perusahaan`** (25 personil aktif: 23 Karyawan Tetap + 2 Intern) dan bisa menyaring per Divisi maupun per **Status Karyawan** (*Semua Status*, *Karyawan Tetap*, *Kontrak*, *Intern*). Anggota magang ditandai pil ungu **`Intern`**.

#### B. Empat Kartu Metrik Utama
1. **`Belum Mengisi Komitmen`** — Jumlah anggota yang belum mengirim komitmen pagi.
2. **`Komitmen Waspada (Amber)`** — Komitmen dengan potensi risiko atau tugas berlanjut (`Carry-Over`).
3. **`Komitmen Kritis (Merah)`** — Komitmen yang membutuhkan bantuan pimpinan hari ini.
4. **`Blocker Belum Direspon`** — Tiket kendala aktif yang masih berstatus `Menunggu Respons`.

#### C. Alur Tombol `Bantu Unblock` → `Feed Dukungan Lintas Fungsi`
1. Pada bagian **`Personil Butuh Bantuan Hari Ini`**, klik tombol **`Bantu Unblock`** pada kartu kendala yang ingin Anda bantu.
2. Sistem langsung membuka halaman **`Antrean Blocker` (`/blockers`)** dengan tiket tersebut langsung terpilih di panel kanan.
3. Klik **`Beri Bantuan`**, tulis tindakan bantuan Anda (min. 5 karakter), lalu simpan.
4. Kontribusi bantuan Anda otomatis tercatat di riwayat tiket **sekaligus langsung muncul di panel `Feed Dukungan Lintas Fungsi`** pada halaman `/dashboard` lengkap dengan nama pemberi bantuan dan waktu tindakan.

---

### 2.2 Memantau Radar Risiko Proyek & Modal Rincian Risiko (`/projects/risk`)

> **[Gambar `WP-SS-24` — Radar Risiko Proyek & Modal Rincian (`/projects/risk`)]**  
> *Tampilkan kartu filter tingkat risiko, tabel daftar proyek, dan jendela modal `Rincian Risiko Proyek` yang terbuka.*

1. Buka menu **`Radar Risiko Proyek`** (`/projects/risk`).
2. Gunakan kartu filter atas (**`Normal / Rendah`**, **`Waspada / Sedang`**, **`Kritis / Tinggi`**, **`Macet Total`**) atau kolom pencarian kode/nama proyek/divisi.
3. Klik tombol **`Rincian`** pada baris proyek (misalnya `WP-CORE`) untuk membuka jendela **Rincian Risiko Proyek** yang menampilkan skor kesehatan, jumlah blocker aktif, kendala utama, serta tombol pintas **`Buka Antrean Blocker Terkait`**.

---

### 2.3 Membaca Laporan Eksekutif & Mengunduh CSV / Cetak PDF (`/reports`)

> **[Gambar `WP-SS-28` — Laporan Eksekutif & Ekspor CSV (`/reports`)]**  
> *Tampilkan pilihan periode (`Hari Ini`, `Pekan Ini`, `Bulan Ini`, `Kuartal Ini`), filter `Status Karyawan`, 4 kartu KPI, tabel performa antar-divisi, dan tombol `Unduh Laporan (CSV)`.*

1. Buka menu **`Laporan Eksekutif`** (`/reports`).
2. Pilih rentang waktu: **`Hari Ini`**, **`Pekan Ini`**, **`Bulan Ini`**, atau **`Kuartal Ini`**.
3. Gunakan filter **`Status Karyawan`** untuk memisahkan kepatuhan Karyawan Tetap, Kontrak, atau Intern *(jika memilih status yang belum memiliki anggota, tampil pesan informatif `"Belum ada data karyawan untuk status karyawan yang dipilih."`)*.
4. Laporan menyajikan ringkasan per divisi tanpa pemeringkatan individu (*non-punitive*).
5. Klik **`Unduh Laporan (CSV)`** untuk mengunduh berkas spreadsheet (kolom `Status Karyawan` ikut tersimpan di CSV), atau gunakan tombol **`Cetak / PDF`** untuk presentasi rapat.

---

# BAB 3: PENANGANAN ANTREAN KENDALA & PEMANTAUAN BATAS WAKTU (`BLOCKER MANAGEMENT`)

### 3.1 Mengelola Antrean Blocker 2 Panel (`/blockers`)

> **[Gambar `WP-SS-21` — Antrean Blocker 2 Panel (`/blockers`)]**  
> *Tampilkan panel kiri (daftar tiket dengan filter dan hitung mundur `Sisa Waktu`) berdampingan dengan panel kanan (rincian lengkap Kategori & 1–3 Dampak dalam Bahasa Indonesia beserta tombol aksi).*

> **[Gambar `WP-SS-22` — Modal Catat Bantuan / Progres Penanganan (`/blockers`)]**  
> *Tampilkan jendela modal `Beri Bantuan` dengan isian tindakan minimal 5 karakter dan catatan hasil progres.*

#### Langkah Menangani Tiket sebagai Penanggung Jawab (PIC):
1. Buka menu **`Antrean Blocker`** (`/blockers`). Gunakan filter **`Tugas Saya`**, filter Status, atau filter Kategori di panel kiri.
2. Pilih tiket berstatus **`Menunggu Respons`**, lalu klik **`Terima & Tangani`** → status berubah menjadi **`Sedang Ditangani`** dan 3 tombol kerja terbuka:
   - **`Beri Bantuan`** *(bisa juga diklik oleh pimpinan/rekan non-PIC kapan saja, bahkan sebelum tiket diterima)*: Mencatat bantuan bertahap (tindakan min. 5 karakter). Pelapor dan PIC otomatis mendapat notifikasi.
   - **`Selesaikan`:** Mengirim solusi akhir (catatan resolusi min. 10 karakter) → status menjadi **`Solusi Diberikan`**, menunggu pelapor menekan **`Konfirmasi & Tutup Tiket`** (atau **`Belum Memadai`** jika kendala masih terjadi).
   - **`Terima Risiko`:** Dipakai jika kendala berada di luar kendali internal (misalnya gangguan vendor/regulasi). Wajib isi **Justifikasi min. 15 karakter** dan **Rencana Mitigasi** → status menjadi **`Risiko Diterima`**.

---

### 3.2 Memantau Penuaan & Pelanggaran Batas Waktu (`/blockers/aging`)

> **[Gambar `WP-SS-23` — Radar Penuaan & Eskalasi (`/blockers/aging`)]**  
> *Tampilkan 4 kartu metrik batas waktu, filter keparahan & kotak centang `Hanya Lewat Batas Waktu`, serta tabel radar penuaan dengan lencana merah `Lewat Batas Waktu`.*

1. Buka menu **`Penuaan & Eskalasi`** (`/blockers/aging`, judul layar: **`Keterlambatan Penanganan Blocker`**).
2. Periksa **4 kartu ringkasan**: Total Tiket Aktif, Melewati Batas Waktu (*Breached*), Persentase Kepatuhan Batas Waktu, dan Tiket Kritis Aktif.
3. Centang **`Hanya Tampilkan Tiket Melewati Batas Waktu`** untuk langsung memfokuskan intervensi pada tiket yang melewati target (`Critical` 1 jam, `High` 4 jam, `Medium` 8 jam, `Low` 24 jam).
4. Klik tombol **`Buka`** di kanan baris tiket untuk langsung melompat ke halaman `/blockers` dan menyalurkan bantuan.

---

### 3.3 Aturan Cuti Vertikal & Pencegahan Pengarahan Diri Sendiri

- **Aturan Cuti Vertikal (`DEC-014` & `DEC-017`):** Jika penanggung jawab kategori sedang **Cuti Resmi (`APPROVED`)** dan tidak punya Reviewer Sementara aktif, tiket baru **tidak pernah turun ke bawahan/rekan**, melainkan otomatis **naik ke atasan langsungnya ($N+1 \rightarrow N+2 \rightarrow$ Direktur)**.
- **Pencegahan Pengarahan Diri Sendiri:** Jika penanggung jawab kategori itu sendiri yang membuat tiket pada kategorinya, tiket otomatis diarahkan ke atasan langsungnya.

---

# BAB 4: TINJAUAN PERSETUJUAN TIM (`PERSETUJUAN CUTI` & `REVIEW KOREKSI`)

### 4.1 Memutuskan Permohonan Cuti & Izin Magang (`/leave/queue`)

> **[Gambar `WP-SS-25` — Antrean Persetujuan Cuti & Modal Keputusan (`/leave/queue`)]**  
> *Tampilkan 4 kartu status antrean, tabel permohonan tim (termasuk pil ungu `Intern` bila ada pemohon magang), dan modal konfirmasi Setujui/Tolak.*

*Hak Akses:* Kepala Divisi (`HEAD`), Direktur (`CEO`), dan **Reviewer Sementara** yang sedang aktif. *(Catatan: Di sistem live saat ini berlaku persetujuan 1 tahap langsung; alur berjenjang 3 tahap dijadwalkan pada pengembangan berikutnya).*

1. Buka menu **`Persetujuan Cuti`** (`/leave/queue`).
2. Periksa detail pengajuan: nama pemohon (pil ungu **`Intern`** untuk anak magang), jenis cuti/izin, durasi **hari kerja Senin–Jumat**, dan alasannya.
3. Klik **`Setujui`** (catatan opsional) atau **`Tolak`** (**wajib** mengisi alasan penolakan minimal **5 karakter**), lalu klik **`Konfirmasi Keputusan`**.
4. **Dampak Otomatis Saat Disetujui:**
   - Pemohon otomatis bebas dari kewajiban laporan harian pada tanggal tersebut.
   - Jika disetujui siang/sore hari setelah cut-off pagi, catatan belum melapor hari itu **otomatis diputihkan** dari antrean kepatuhan HRGA.

---

### 4.2 Meninjau Permohonan Koreksi Laporan dengan Perbandingan Visual (`/corrections/review`)

> **[Gambar `WP-SS-26` — Halaman Review Koreksi & Perbandingan Visual (`/corrections/review`)]**  
> *Tampilkan daftar kartu permohonan koreksi `Menunggu Review`, kotak perbandingan visual `Sebelum` (merah) vs `Diajukan` (hijau), dan tombol `Setujui` / `Tolak`.*

1. Buka menu **`Review Koreksi & Cuti`** (`/corrections/review`).
2. Periksa kotak perbandingan visual **Sebelum** vs **Diajukan**, alasan dari karyawan, dan sisa waktu jendela tinjauan 24 jam.
3. Klik **`Setujui`** (isi catatan peninjau min. 5 karakter, lalu klik **`Konfirmasi Setujui`**) untuk langsung memperbarui data laporan harian karyawan secara resmi, atau klik **`Tolak`** (jendela **`Sampaikan Keberatan / Tolak Koreksi`**, wajib isi alasan penolakan min. 5 karakter, lalu klik **`Konfirmasi Tolak`**) agar karyawan dapat memperbaikinya lewat tombol `Gunakan Draf Sebelumnya & Sesuaikan`.

---

# BAB 5: PENGAWASAN KEPATUHAN, DISPENSASI, & PEMBINAAN (`HRGA` & `ATASAN`)

### 5.1 Menangani Antrean Kepatuhan Harian: `Tindak Lanjut` & `Ubah Catatan` (`/compliance`)

> **[Gambar `WP-SS-29` — Antrean Kepatuhan HRGA & Modal Tindak Lanjut (`/compliance`)]**  
> *Tampilkan 4 kartu jenjang kepatuhan, tabel daftar pelanggaran (`Belum Ditangani` / `Sudah Ditangani`), dan modal `Tindak Lanjut`.*

*Hak Akses:* HRGA, Direktur, dan Admin Sistem.

1. Buka menu **`Antrean Kepatuhan`** (`/compliance`).
2. Saring berdasarkan jenjang (**`Pola 3x`**, **`Peringatan Tertulis`**, **`Eskalasi Direksi`**, **`Tidak Check-in`**) dan status (`Belum Ditangani` / `Sudah Ditangani`).
3. Pada baris **`Belum Ditangani`**, klik **`Tindak Lanjut`**, tulis catatan tindak lanjut minimal **5 karakter** (dapat menyertakan ID Catatan Coaching atasan), lalu klik **`Simpan Tindak Lanjut`**. Status berubah menjadi **`Sudah Ditangani`** dan karyawan menerima notifikasi.
4. Pada baris **`Sudah Ditangani`**, Anda dapat mengeklik **`Ubah Catatan`** bila perlu memperbarui keterangan tindak lanjut.

---

### 5.2 Menerbitkan & Mencabut Dispensasi Resmi (`/exemptions`)

> **[Gambar `WP-SS-30` — Manajemen Dispensasi Resmi (`/exemptions`)]**  
> *Tampilkan tata letak 2 kolom: formulir pendaftaran dispensasi di kiri dan tabel daftar dispensasi aktif di kanan.*

*Hak Akses:* HRGA, Direktur, dan Admin Sistem.

1. Buka menu **`Manajemen Dispensasi`** (`/exemptions`).
2. Pilih **Karyawan Penerima Dispensasi**, **Rentang Tanggal Mulai–Selesai**, **Kategori** (*Dinas Luar, Pelatihan Eksternal, Gangguan Teknis/ISP, Penugasan Khusus Direksi*), **Nomor Surat Tugas** *(opsional)*, dan **Alasan Resmi** (min. 5 karakter).
3. Klik **`Daftarkan Dispensasi`**. Hari kerja pada rentang tersebut otomatis berstatus **`EXEMPT`** (tidak dianggap melanggar kepatuhan) dan karyawan menerima notifikasi.
4. Jika tugas luar selesai lebih cepat, klik **`Cabut / Nonaktifkan`** pada tabel sebelah kanan.

---

### 5.3 Mencatat Sesi Pembinaan / Coaching: `Dibagikan ke Karyawan` vs `Rahasia Manajemen` (`/coaching`)

> **[Gambar `WP-SS-27` — Halaman Catatan Coaching Manajerial (`/coaching`)]**  
> *Tampilkan kartu anggota tim di atas, formulir buat catatan di kiri (termasuk tombol template cepat & pilihan kerahasiaan), dan riwayat catatan di kanan.*

*Hak Akses:* Semua pengguna yang memiliki bawahan langsung aktif di bagan organisasi.

1. Buka menu **`Catatan Coaching`** (`/coaching`), lalu pilih anggota tim binaan Anda.
2. Pilih **Jenis Catatan**: **`Bimbingan (Coaching)`**, **`Apresiasi (Recognition)`**, atau **`Arahan Perbaikan (Corrective)`**.
3. Pilih **Tingkat Kerahasiaan**:
   - **`Dibagikan ke Karyawan`:** Isi catatan langsung masuk ke Pusat Notifikasi karyawan tersebut sebagai kesepakatan bersama.
   - **`Rahasia Manajemen`:** Hanya bisa dilihat oleh atasan pembuat, HRGA, dan Direktur — **tidak pernah muncul** di akun karyawan.
4. Ketik isi catatan (min. 10 karakter) atau gunakan tombol **template cepat** (*Bimbingan 1-on-1* / *Apresiasi Kinerja* / *Tindakan Korektif*), lalu klik **`Simpan Catatan Pembinaan`**.

---

### 5.4 Kapan Menggunakan `Tindak Lanjut` di `/compliance` vs `Catat Pembinaan` di `/coaching`?

| Aspek | `Tindak Lanjut` / `Ubah Catatan` di `/compliance` | `Catat Pembinaan` di `/coaching` |
|---|---|---|
| **Siapa yang Menggunakan** | **HRGA, Direktur, Admin Sistem** | **Atasan Langsung, Head Divisi, HRGA, Direktur** |
| **Tujuan Utama** | Mencatat bahwa pelanggaran ritme pelaporan pada tanggal tertentu sudah dikonfirmasi/ditangani oleh HRGA. | Mencatat hasil sesi bimbingan tatap muka (1-on-1), apresiasi kinerja, atau rencana perbaikan kerja bersama karyawan. |
| **Hubungan Keduanya** | Setelah atasan mencatat sesi pembinaan di `/coaching`, HRGA dapat menuliskan ringkasan/ID catatan tersebut saat menekan `Tindak Lanjut` di `/compliance`. | Menjadi bukti pembinaan berjenjang yang non-punitif. |

---

# BAB 6: TATA KELOLA ADMINISTRASI ORGANISASI & KEBIJAKAN (`ADMINISTRATION`)

### 6.1 Kelola Pengguna & Penonaktifan Akun (`/admin/users`)

> **[Gambar `WP-SS-31` — Direktori Kelola Pengguna (`/admin/users`)]**  
> *Tampilkan tombol `Undang Pengguna Baru`, filter status akun, tabel 25 pengguna (dengan pil ungu `Intern`), dan tombol `Nonaktifkan` / `Aktifkan`.*

- Menampilkan seluruh daftar pengguna (`ACTIVE`, `INVITED`, `INACTIVE`).
- Klik **`Nonaktifkan`** untuk membekukan akun karyawan yang keluar (seluruh sesi login aktifnya langsung dicabut seketika). Sistem melarang Anda menonaktifkan akun Anda sendiri (bertanda `Akun Anda`).
- Klik **`Aktifkan`** untuk memulihkan akses akun yang sebelumnya dinonaktifkan.

---

### 6.2 Mengundang Karyawan Baru — Token 72 Jam (`/admin/invitations`)

> **[Gambar `WP-SS-32` — Modal Undangan Karyawan Baru & Daftar Token (`/admin/invitations`)]**  
> *Tampilkan jendela modal `Undang Pengguna Baru` dengan pilihan Peran, Divisi, Status Karyawan, serta tabel token 72 jam dengan tombol `Salin Tautan`, `Kirim Ulang`, dan `Cabut`.*

1. Klik **`Undang Pengguna Baru`** di `/admin/users` atau `/admin/invitations`.
2. Isi Nama Lengkap, Email Perusahaan (harus unik), Peran Dasar, Divisi, Jabatan, dan **Status Karyawan** (*Karyawan Tetap, Kontrak, atau Intern*).
   - *Khusus status `Intern`:* Peran otomatis terkunci ke `EMPLOYEE` dan **wajib** mengisi **`Tanggal Selesai Magang`** (jangan menulis kata *"Intern"* di kolom Jabatan).
3. Klik **`Kirim Undangan`**. Sistem menerbitkan tautan aktivasi 64 karakter berlaku **72 jam**.
4. Klik **`Salin Tautan`** untuk dikirim ke calon pengguna. Di `/admin/invitations`, Anda bisa mengeklik **`Kirim Ulang`** jika token kedaluwarsa (`EXPIRED`) atau **`Cabut`** jika pendaftaran dibatalkan.

---

### 6.3 Struktur Organisasi, Wewenang Proyek, & Siklus Hidup Mutasi / Pengangkatan `Intern` (`/admin/organization`)

> **[Gambar `WP-SS-33` — Struktur Organisasi & 2 Tab Penugasan (`/admin/organization`)]**  
> *Tampilkan Tab 1 `Struktur & Penugasan Karyawan` (tabel garis pelaporan atasan langsung) dan terlihat Tab 2 `Kewenangan Proyek (Project Authority)`.*

#### A. Dua Tab Pengelolaan
- **Tab 1 — `Struktur & Penugasan Karyawan`:** Mengatur divisi, jabatan, status karyawan, dan **Atasan Langsung**. Sistem mencegah siklus atasan melingkar (*A melapor ke B, B melapor ke A*) dan menyaring keluar akun `Intern` dari pilihan atasan.
- **Tab 2 — `Kewenangan Proyek (Project Authority)`:** Menetapkan **Project Manager** dan **Escalation Reviewer** per proyek (keduanya wajib dua orang yang berbeda dan bukan `Intern`).

#### B. Panduan 3 Kasus Siklus Hidup Organisasi
1. **Karyawan Pindah Divisi atau Ganti Atasan Langsung:**
   - Buka **`/admin/organization`** Tab 1 → klik **`Atur Penugasan Baru`** untuk karyawan tersebut → pilih Divisi/Atasan Langsung baru beserta **Tanggal Mulai Efektif** → simpan. Sistem menutup penugasan lama tanpa menghapus riwayat laporan masa lalu.
2. **Anak Magang (`Intern`) Diangkat Menjadi `Karyawan Tetap` / `Kontrak`:**
   - Buka **`/admin/organization`** Tab 1 → buat penugasan baru dengan mengubah **Status Karyawan** menjadi **`Karyawan Tetap`** (atau `Kontrak`) mulai tanggal pengangkatan. Sejak tanggal efektif tersebut, pil ungu `Intern` hilang, kuota Cuti Tahunan 12 hari terbuka, dan akun tersebut boleh dipilih pada jabatan kepemimpinan bila diperlukan.
3. **Proyek Selesai atau Pergantian Pemimpin Proyek:**
   - Buka Tab 2 **`Kewenangan Proyek`**. Jika proyek selesai, klik **`Tutup Wewenang`** lalu konfirmasi pada jendela **`Konfirmasi Tutup Wewenang Proyek`**. Jika ganti PM/Escalation Reviewer, tambahkan penetapan baru dengan pejabat pengganti.

---

### 6.4 Delegasi Reviewer Sementara (`/admin/temporary-reviewers`)

> **[Gambar `WP-SS-34` — Delegasi Reviewer Sementara & Modal Penunjukan (`/admin/temporary-reviewers`)]**  
> *Tampilkan tabel daftar delegasi aktif dan jendela modal `Delegasikan Reviewer Sementara Baru` yang terisi contoh.*

1. Buka **`Reviewer Sementara`** (`/admin/temporary-reviewers`) dan klik **`Delegasikan Reviewer Baru`**.
2. Pilih **Pejabat yang Berhalangan**, periksa **Divisi Wewenang** (terisi otomatis), pilih **Pejabat Pengganti Sementara** *(melarang `SYSTEM_ADMIN` dan `Intern`)*, tentukan **Tanggal Mulai–Selesai**, dan isi **Alasan Penunjukan Resmi**.
3. Klik **`Terbitkan Delegasi`**. Sistem menolak jika ada delegasi lain yang tanggalnya bentrok di divisi yang sama.
4. Selama periode aktif, pejabat pengganti otomatis mendapat akses `/leave/queue`, `/corrections/review`, dan `/blockers`, lalu otomatis dicabut kembali saat tanggal berakhir (atau bila diklik **`Cabut`** lebih awal).

---

### 6.5 Kebijakan Jam Kerja, Pemilik Kebijakan Multi-Owner, & Jejak Audit (`/admin/policies`)

> **[Gambar `WP-SS-35` — Tata Kelola Kebijakan, Pemilik Kebijakan, & Audit Trail (`/admin/policies`)]**  
> *Tampilkan 4 kartu metrik jam cut-off, kartu 5 kategori kebijakan, tabel `Penugasan Pemilik Kebijakan`, dan tabel `Jejak Audit Perubahan Kebijakan`.*

1. **5 Kategori Kebijakan Resmi:** (1) Batas Waktu Komitmen Pagi, (2) Target Waktu Respon & Penanganan Kendala, (3) Batas Waktu Evaluasi Sore, (4) Batas Waktu Pengajuan Koreksi, dan (5) Kalender Kerja & Hari Libur.
2. **Aturan Pengubahan Parameter:**
   - Klik tombol **`+ Buat Versi Kebijakan Baru`** di kanan atas untuk menerbitkan pembaruan parameter pada kategori yang Anda miliki.
   - **Larangan Tanggal Mundur:** Tanggal mulai berlaku wajib hari ini atau masa depan.
   - **Wajib Ada Perubahan & Alasan:** Tidak boleh menyimpan tanpa mengubah angka, dan wajib mengisi **Alasan Perubahan minimal 15 karakter**.
3. **Mengelola Daftar Pemilik Kebijakan (Khusus Direktur & Admin):**
   - Pada bagian **Penugasan Pemilik Kebijakan**, klik **`Tetapkan Pemilik`**, **`Ubah`**, atau **`Cabut`**.
   - Sistem melarang mencabut **pemilik terakhir** pada suatu kategori agar setiap kebijakan selalu memiliki penanggung jawab sah.
4. **Jejak Audit:** Seluruh perubahan tersimpan permanen di tabel **Jejak Audit Perubahan Kebijakan** di bagian bawah dan dapat diunduh sebagai CSV.

---

### 6.6 Saluran Notifikasi, 9 Pemicu Resmi, & Simulasi Uji Kirim (`/admin/notifications`)

> **[Gambar `WP-SS-36` — Saluran Notifikasi & Alat Uji Kirim (`/admin/notifications`)]**  
> *Tampilkan 3 kartu status saluran (`In-App`, `Web Push`, `Email`), matriks 9 pemicu resmi, dan panel simulasi uji kirim.*

1. Memantau status jujur **3 saluran pengiriman**: **In-App Notification Center**, **Browser Push Notification**, dan **Email Transaksional** (menampilkan status **`Aktif`** atau **`Mode Simulasi Aktif`**).
2. Memeriksa **Tabel Matriks 9 Pemicu Resmi** lengkap dengan 4 tab penyaring untuk melihat saluran mana saja yang aktif pada setiap kejadian.
3. **Uji Coba Pengiriman:** Pilih saluran uji, skenario pesan, dan email penerima, lalu klik **`Kirim Notifikasi Uji Coba`**. Hasil pengiriman langsung tercatat pada tabel **`Log Pengiriman Uji Coba Terbaru`**.

---

# BAB 7: TANYA-JAWAB & SOLUSI OPERASIONAL STAKEHOLDER (FAQ)

| Pertanyaan Operasional | Jawaban & Langkah Solusi |
|---|---|
| **1. Mengapa akun `SYSTEM_ADMIN` diblokir `403` saat membuka `My Today` (`/daily/morning`)?** | Sesuai prinsip Pemisahan Tugas, akun Administrator Sistem dikhususkan untuk pengaturan teknis agar statistik kepatuhan kerja murni berisi karyawan operasional. |
| **2. Mengapa saya sebagai Kepala Divisi tidak bisa melihat data divisi lain di `/dashboard` dan `/reports`?** | Sistem menerapkan isolasi cakupan otomatis (`Divisi Saya`) agar tiap Kepala Divisi fokus pada timnya. Cakupan `Seluruh Perusahaan` khusus untuk Direktur, HRGA, dan Admin. |
| **3. Mengapa nama anak magang (`Intern`) tidak muncul di pilihan Atasan, Project Manager, atau Reviewer Sementara?** | Sesuai aturan perusahaan, status `Intern` dikecualikan dari seluruh 7 jabatan pengambil keputusan sampai yang bersangkutan diangkat menjadi Karyawan Tetap/Kontrak di `/admin/organization`. |
| **4. Bagaimana jika Kepala Divisi cuti 1 minggu — siapa yang menyetujui cuti dan koreksi timnya?** | HRGA/Admin/Direktur cukup menetapkan **Reviewer Sementara** di `/admin/temporary-reviewers` pada rentang tanggal cuti tersebut. |
| **5. Mengapa saya sebagai Pemilik Kebijakan tidak bisa mengubah semua 5 kategori di `/admin/policies`?** | Anda hanya dapat mengubah kategori yang secara resmi ditugaskan kepada Anda. Kategori lain bertanda `[Terkunci: Bukan Pemilik]`; hubungi Direktur/Admin bila perlu perluasan wewenang. |
| **6. Mengapa sistem menolak saat saya mencoba mencabut Pemilik Kebijakan di `/admin/policies`?** | Setiap kategori kebijakan wajib memiliki minimal 1 pemilik aktif. Tetapkan dulu pemilik pengganti sebelum mencabut pemilik lama. |
| **7. Bagaimana cara memutihkan catatan mangkir karyawan yang sedang dinas luar kota?** | Terbitkan **Dispensasi Resmi** di `/exemptions` lengkap dengan rentang tanggal dan nomor surat tugas (jangan menghapus data secara manual). |
| **8. Karyawan mengeluh lupa kata sandi dan sudah keluar dari semua perangkat. Apa tindakan Admin/HRGA?** | Bantu pemulihan akses akun secara resmi melalui prosedur internal Admin/HRGA, lalu arahkan karyawan segera mengganti kata sandi mandirinya di `/profile`. |
