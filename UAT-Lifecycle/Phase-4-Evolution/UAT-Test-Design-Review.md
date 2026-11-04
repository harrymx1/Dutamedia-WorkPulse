# REVIEW DESAIN KASUS UJI UAT PASCA-REMEDIASI
## WorkPulse — Phase 4: UAT Package Impact Analysis & Evolution
**Dokumen Referensi:** `UAT-WP-TEST-DESIGN-REV-001` (Rev 1.0)  
**Tanggal Penerbitan:** 04 November 2026  
**Penyusun:** Co-Pilot (Senior QA Engineer & UAT Architect)  
**Pemberi Mandat & Reviewer:** Harry (Acceptance Owner & Lead Manual UAT Tester)  
**Status Dokumen:** READY FOR OWNER REVIEW — PHASE 4 DELIVERABLE  

---

## 1. PENDAHULUAN & RUANG LINGKUP REVIEW

Dokumen ini memuat evaluasi dan peninjauan arsitektur desain kasus uji (*Test Design Review*) terhadap seluruh skenario Manual UAT WorkPulse pasca-pelaksanaan remediasi Phase 3 (Cycle 1 & Cycle 2).

Review ini bertujuan menjamin bahwa seluruh dokumen panduan pengujian manual merefleksikan perubahan antarmuka, penyempurnaan alur kerja, rute kanonikal baru, penegakan keamanan (*rate limiting*), serta pencegahan cacat fungsional (*locking guard*) secara presisi sebelum pengujian formal revalidasi (Phase 5) dijalankan.

---

## 2. PRINSIP EVOLUSI DESAIN TEST CASE

Dalam menyelaraskan paket kasus uji dari `v1.0.1-uat-pkg` menjadi `v1.1.0-uat-pkg`, tim penguji menerapkan empat pilar evolusi baku:

1. **Integritas Penomoran & Keterlacakan (Zero Renumbering):**  
   Seluruh 45 Test Case ID (`TC-AUTH-001` s.d. `TC-ADMN-004`) dipertahankan tanpa perubahan kode identitas untuk menjaga kesinambungan audit trail dan matriks keterlacakan (*Requirements Traceability Matrix*).
2. **Penyelarasan Rute & Lokasi Komponen (Path & Component Alignment):**  
   Memperbarui URL acuan pengujian yang mengalami migrasi kanonikal (misal: halaman pelaporan blocker beralih dari `/blockers/raise` menjadi `/raise-blockers`).
3. **Pembersihan Istilah Internal (Sanitization of Internal Design Codes):**  
   Menghapus seluruh referensi nomor prototipe internal (`Prototipe 01` s.d. `Prototipe 25`) dan kode keputusan arsitektur (`DEC-003`, `DEC-004`, `DEC-008`) dari expected results, digantikan dengan penamaan bisnis resmi dan fungsional.
4. **Verifikasi Dua Arah pada Area Cacat (Dual-State Verification for Defects):**  
   Menyisipkan sub-langkah pengujian eksplisit untuk membuktikan form terkunci dan menolak submission ulang pada komitmen pagi (`DEF-001`) dan evaluasi sore (`DEF-002`).

---

## 3. ANALISIS PERUBAHAN DESAIN KASUS UJI UTAMA

### 3.1. Modul Autentikasi & Akun Pengguna (`TC-AUTH-*`)
- **`TC-AUTH-001` (Halaman Login & Value Proposition):**  
  Expected result diperbarui untuk memverifikasi tagline inklusif baru: *"Platform transparansi kerja harian, identifikasi risiko lebih awal, dan eskalasi hambatan operasional tim secara objektif & terukur."* serta standardisasi 3 ikon SVG di panel kiri.
- **`TC-AUTH-002` (Keamanan Login & Rate Limiting):**  
  Menambahkan langkah uji penegakan keamanan: pengguna yang gagal memasukkan kredensial salah sebanyak 5 kali berturut-turut akan dikunci (*lockout*) selama 15 menit dan sistem menampilkan timer hitung mundur dinamis yang informatif.
- **`TC-AUTH-003` (Aktivasi Akun Karyawan):**  
  Menyelaraskan deskripsi visual panel kiri aktivasi agar identik dengan halaman login baru.
- **`TC-AUTH-005` (Penanganan Kesalahan Akses & Layar 403):**  
  Langkah uji tombol kembali pada layar 403 Access Denied kini memverifikasi rute kanonikal: peran `SYSTEM_ADMIN` diarahkan ke `/admin/users`, sedangkan peran `EMPLOYEE` diarahkan ke `/daily/morning`.
- **`TC-AUTH-007` (Profil Pengguna Mandiri):**  
  Desain langkah uji diselaraskan dengan tata letak 3 seksi Prototipe 24 (Data Pribadi, Data Pekerjaan, Sesi Login Aktif) serta memvalidasi nama pengguna yang bersih tanpa tanda kurung jabatan.

### 3.2. Modul Komitmen & Pekerjaan Harian (`TC-DLYM-*`, `TC-DLYA-*`, `TC-DLYE-*`)
- **`TC-DLYM-001` (Morning Commitment UI & Context Cards):**  
  Memverifikasi kehadiran tombol *"Laporkan Blocker"* di sisi kanan workflow bar, format badge tanggal dinamis bahasa Indonesia pada header panel konteks, dan microcopy banner keterlambatan yang objektif.
- **`TC-DLYM-002` (Komitmen Nol & Fleksibilitas Peran):**  
  Memverifikasi checkbox komitmen nol yang bersih tanpa kode arsitektur `DEC-004` dan opsi alasan komitmen nol dalam bahasa bisnis profesional.
- **`TC-DLYM-003` (Verifikasi Pencegahan Duplikasi Komitmen - DEF-001):**  
  Menambahkan langkah pengujian eksplisit: setelah komitmen diserahkan, pengguna mencoba merefresh halaman dan melakukan klik tombol submit ulang. Expected result memverifikasi bahwa form tetap terkunci persisten dan sistem backend menolak percobaan duplikasi.
- **`TC-DLYA-001` & `TC-DLYA-002` (Pekerjaan Tambahan):**  
  Memverifikasi subtitle halaman bersih tanpa label `(Prototipe 03)`, layout responsif form tanpa overflow horizontal, badge alasan dalam format bisnis (*Penugasan Baru Atasan*, *Perbaikan Error / Bug Kritis*, dll.), dan kewajiban mengisi keterangan saat memilih opsi *Lainnya*.
- **`TC-DLYE-001` & `TC-DLYE-002` (Evaluasi Sore EOD & Refleksi Mandiri):**  
  Memverifikasi tombol *"Laporkan Blocker"* yang mengarah langsung ke `/raise-blockers` tanpa modal dialog pop-up mati, opsi evaluasi tugas dalam bahasa bisnis alami (*Selesai*, *Sebagian*, *Belum Selesai*, *Dibatalkan*), kelengkapan alur kelanjutan tugas pada pekerjaan tambahan, seksi refleksi mandiri humanis ber-badge *"Penilaian Otonom Karyawan"*, serta penguncian permanen formulir EOD pasca-submit (**DEF-002**).

### 3.3. Modul Manajemen Kendala (`TC-BLKR-*`)
- **`TC-BLKR-001` (Pelaporan Blocker & Form 2 Tab):**  
  Memperbarui seluruh skenario pengujian langkah 1 s.d. 16 mengikuti arsitektur baru Prototipe 05:
  1. Tombol kembali: `← Kembali ke Ruang Kerja My Today`.
  2. Tab 1: Buat Laporan Blocker (Detail Kendala, Taksonomi, Dampak, dan Penanggung Jawab).
  3. Tab 2: Blocker Saya (daftar tiket yang dilaporkan pengguna beserta SLA aging).
  4. Footer aksi full-width fixed dengan tombol sekunder *Bersihkan Formulir* dan primer *Kirim Laporan Blocker*.
- **`TC-BLKR-002` & `TC-BLKR-005` (Antrean & Pemantauan Blocker):**  
  Memastikan karyawan biasa memantau kendala lewat Tab *"Blocker Saya"* di `/raise-blockers`, sedangkan tombol antrean manajerial `/blockers` hanya dapat diakses oleh peran pimpinan.

---

## 4. KESIMPULAN HASIL REVIEW

Desain kasus uji pada paket `v1.1.0-uat-pkg` telah dievaluasi secara komprehensif. Seluruh penyesuaian telah mematuhi prinsip kejelasan operasional (*operational clarity*), presisi kriteria penerimaan, dan bebas dari ambiguitas kode internal pengembang.

Paket kasus uji yang telah berevolusi siap dipublikasikan ke dalam master test document ([`UAT-Manual-Test-Cases.md`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/UAT-Manual-Test-Cases.md)) dan checklist pelaksanaan pengujian.

