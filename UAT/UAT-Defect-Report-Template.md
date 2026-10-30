# WorkPulse — Defect Report Template & Logging Guidelines

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Pengelola Pelaporan:** Harry (Manual Tester & Acceptance Owner)  
> **Tanggal:** 29 Oktober 2026  

---

## 1. PANDUAN PELAPORAN CACAT & ANOMALI SISTEM (DEFECT LOGGING)

Dokumen ini menyediakan standar formulir pelaporan cacat perangkat lunak (*Defect Report*) yang wajib digunakan apabila Anda (Harry) menemukan ketidaksesuaian antara hasil aktual di browser dengan kriteria penerimaan yang ditentukan dalam test case.

> [!IMPORTANT]
> - Jangan membuat kesimpulan status "Pass" jika ada langkah verifikasi yang gagal.
> - Setiap temuan wajib dilaporkan secara faktual dengan menyertakan bukti screenshot nyata.
> - Format pelaporan ini dirancang agar tim pengembang dapat mereproduksi bug dengan cepat tanpa kebingungan konteks.

---

## 2. PANDUAN MEMBEDAKAN SEVERITY VS PRIORITY

Untuk memastikan transparansi dampak teknis dan urgensi bisnis, gunakan panduan klasifikasi berikut:

### 2.1 Tingkat Keparahan Teknis (Severity)
Mengukur dampak kegagalan terhadap stabilitas sistem dan integritas data:
- **Critical / Blocker (S1):** Sistem crash, layar putih (*white screen*), kebocoran otentikasi/data sensitif, hilangnya data permanen, atau kegagalan alur utama yang tidak memiliki jalan keluar (*work-around*). Contoh: Tombol submit Morning Commitment tidak merespons sama sekali sehingga seluruh karyawan tidak bisa mengisi tugas.
- **Major (S2):** Fitur utama tidak berfungsi sesuai spesifikasi, tetapi sistem tidak crash dan ada cara alternatif (*work-around*). Contoh: Tombol copy-forward komitmen kemarin gagal menyalin teks, tetapi pengguna masih bisa mengetik manual.
- **Minor (S3):** Kegagalan fungsional pada fitur pendukung atau kondisi pengecualian yang jarang terjadi. Contoh: Filter tanggal pada antrean blocker tidak mengurutkan secara kronologis.
- **Cosmetic / Trivial (S4):** Masalah visual antarmuka, salah ketik label (*typo*), padding/margin yang sedikit bergeser, atau animasi transisi yang kaku. Contoh: Teks badge status agak terlalu rapat dengan ikon.

### 2.2 Urgensi Penanganan Bisnis (Priority)
Mengukur seberapa cepat tim pengembang harus menyelesaikan perbaikan:
- **P0 (Immediate / Blocker Launch):** Wajib diperbaiki saat ini juga sebelum sistem dinyatakan diterima (*Zero P0 Tolerance*).
- **P1 (High):** Wajib diselesaikan sebelum peluncuran resmi ke seluruh karyawan.
- **P2 (Medium):** Dapat diperbaiki pada rilis pemeliharaan berikutnya setelah peluncuran awal.
- **P3 (Low):** Penyempurnaan kosmetik yang dapat dijadwalkan pada siklus sprint berikutnya.

---

## 3. FORMULIR TEMPLATE PELAPORAN DEFECT (SIAP PAKAI)

Salin blok template di bawah ini setiap kali Anda mendokumentasikan temuan baru:

```markdown
# LAPORAN DEFECT: [DEF-xxx] — [Judul Ringkas Cacat yang Jelas]

### 1. Informasi Umum
- **Defect ID:** DEF-001 (sesuaikan urutan nomor)
- **Tanggal Ditemukan:** [DD/MM/YYYY — Jam:Menit WIB]
- **Pelapor (Tester):** Harry
- **Test Case ID Terkait:** [cth: TC-DLYM-001]
- **Requirement ID Terkait:** [cth: FR-09 / DEC-004]
- **Modul / Rute Halaman:** [cth: /daily/morning]
- **Peran yang Digunakan:** [cth: EMPLOYEE (dev.frontend@dutamedia.com)]

### 2. Lingkungan Pengujian (Environment)
- **URL Aplikasi:** http://localhost:5173/...
- **Browser & Versi:** Google Chrome Versi [xxx] / Microsoft Edge [xxx]
- **Sistem Operasi:** Windows 11
- **Resolusi Viewport:** Desktop 1440x900 / Mobile 375x812

### 3. Klasifikasi Cacat
- **Tingkat Keparahan (Severity):** [ ] Critical / Blocker | [ ] Major | [ ] Minor | [ ] Cosmetic
- **Urgensi Perbaikan (Priority):** [ ] P0 (Immediate) | [ ] P1 (High) | [ ] P2 (Medium) | [ ] P3 (Low)
- **Frekuensi Terjadinya (Reproduction Rate):** [ ] Selalu (100%) | [ ] Kadang-kadang / Intermiten | [ ] Terjadi Satu Kali

### 4. Prasyarat Pengujian (Preconditions)
[Tuliskan kondisi awal data atau status akun sebelum langkah pengujian dilakukan. Cth: Akun login sebagai Employee, belum ada komitmen pagi yang tersimpan hari ini.]

### 5. Langkah Reproduksi Masalah (Steps to Reproduce)
1. Buka halaman [...]
2. Masukkan nilai [...] pada field [...]
3. Klik tombol [...]
4. Amati reaksi antarmuka.

### 6. Hasil yang Diharapkan (Expected Result)
[Jelaskan perilaku yang seharusnya terjadi sesuai spesifikasi PRD / Test Case. Cth: Sistem menampilkan toast sukses dan komitmen tersimpan dengan badge On-Time.]

### 7. Hasil Aktual yang Terjadi (Actual Result)
[Jelaskan apa yang sebenarnya terjadi di layar browser. Cth: Tombol submit berputar terus (infinite loading spinner), tidak muncul pesan sukses, dan data tidak tersimpan di database.]

### 8. Dampak Terhadap Bisnis (Business Impact)
[Jelaskan dampak kegagalan ini terhadap karyawan atau operasional perusahaan Dutamedia. Cth: Karyawan terancam dicatat tidak disiplin (No Submission) karena komitmen paginya gagal tersimpan.]

### 9. Bukti Pendukung (Evidence)
- **Screenshot:** `UAT/evidence/DEF-001_screenshot_error.png`
- **Pesan Console Browser (F12) jika ada:** [Salin teks error merah di console jika tersedia]

### 10. Catatan Tambahan & Status Uji Ulang (Retest Tracking)
- **Status Tiket:** [ ] Open | [ ] In Progress Fix | [ ] Ready for Retest | [ ] Closed / Resolved
- **Tanggal Uji Ulang:** [DD/MM/YYYY]
- **Hasil Uji Ulang:** [ ] Retest Pass | [ ] Retest Fail
- **Catatan Penguji Pasca Retest:** [Tuliskan komentar jika bug sudah tuntas atau masih muncul]
```

---

## 4. CONTOH PENGISIAN FORMULIR DEFECT (REFERENSI ILUSTRATIF)

Berikut adalah contoh pengisian yang baik dan benar untuk memudahkan pemahaman:

```markdown
# LAPORAN DEFECT: [DEF-001] — Opsi Radio Button Hijau Dinonaktifkan Saat Ada Komitmen Blocked (Pelanggaran DEC-003)

### 1. Informasi Umum
- **Defect ID:** DEF-001
- **Tanggal Ditemukan:** 29/10/2026 — 16:45 WIB
- **Pelapor (Tester):** Harry
- **Test Case ID Terkait:** TC-DLYE-002
- **Requirement ID Terkait:** FR-23, DEC-003
- **Modul / Rute Halaman:** /daily/eod
- **Peran yang Digunakan:** EMPLOYEE (dev.frontend@dutamedia.com)

### 2. Lingkungan Pengujian (Environment)
- **URL Aplikasi:** http://localhost:5173/daily/eod
- **Browser & Versi:** Google Chrome 130.0.6723.70 (Official Build) 64-bit
- **Sistem Operasi:** Windows 11 Home
- **Resolusi Viewport:** Desktop 1440x900

### 3. Klasifikasi Cacat
- **Tingkat Keparahan (Severity):** Critical / Blocker (Pelanggaran Regulasi Arsitektural DEC-003)
- **Urgensi Perbaikan (Priority):** P0 (Immediate)
- **Frekuensi Terjadinya:** Selalu (100%)

### 4. Prasyarat Pengujian (Preconditions)
Pengguna login sebagai Employee. Formulir EOD memiliki 2 komitmen: Komitmen 1 ditandai Done, Komitmen 2 ditandai Blocked dengan alasan terisi.

### 5. Langkah Reproduksi Masalah
1. Buka halaman /daily/eod.
2. Tandai Komitmen 1 sebagai 'Done'.
3. Tandai Komitmen 2 sebagai 'Blocked' dan isi alasan kendala 'Vendor server down'.
4. Amati selector Status Harian Mandiri di bagian bawah.
5. Coba klik radio button 'Hijau'.

### 6. Hasil yang Diharapkan
Sesuai aturan DEC-003 (Anti-Lock Green), opsi Hijau dilarang dikunci. Pengguna harus tetap dapat mengklik radio button Hijau dan sistem memunculkan field input justifikasi override.

### 7. Hasil Aktual yang Terjadi
Radio button 'Hijau' dalam kondisi disabled (berwarna abu-abu, kursor not-allowed) dan tidak dapat diklik sama sekali. Pengguna dipaksa memilih Kuning atau Merah.

### 8. Dampak Terhadap Bisnis
Melanggar hak prerogatif profesional karyawan dan bertentangan dengan kebijakan manajemen Dutamedia bahwa sistem WorkPulse bersifat membimbing (heuristic), bukan otoriter.

### 9. Bukti Pendukung
- **Screenshot:** `UAT/evidence/DEF-001_green_locked.png`
- **Pesan Console Browser:** Tidak ada error console.

### 10. Catatan Tambahan & Status Uji Ulang
- **Status Tiket:** Open
- **Tanggal Uji Ulang:** -
- **Hasil Uji Ulang:** -
```

