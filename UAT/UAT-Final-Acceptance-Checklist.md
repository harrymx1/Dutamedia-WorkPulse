# WorkPulse — Final UAT Acceptance Checklist & Sign-Off Document

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Rilis:** 1.0.0  
> **Acceptance Owner:** Harry  
> **Tanggal Evaluasi Akhir:** [Tanggal Diisi Saat Selesai Eksekusi]  

---

## 1. PANDUAN PENILAIAN PENERIMAAN AKHIR (ACCEPTANCE EVALUATION)

Dokumen ini merupakan instrumen formal penentu penerimaan (*Sign-Off*) sistem WorkPulse oleh Harry selaku penanggung jawab penerimaan produk. Penilaian dilakukan setelah seluruh rangkaian test case pada `UAT-Manual-Test-Cases.md` dan checklist `UAT-Execution-Checklist.md` selesai dieksekusi secara mandiri di browser.

---

## 2. CHECKLIST EVALUASI TINGKAT KELAIKAN (ACCEPTANCE GATES)

Berikan tanda centang `[x]` pada kriteria yang telah terpenuhi berdasarkan hasil pengujian aktual:

### Gate 1: Integritas Autentikasi, Akun, & Kontrol Akses (RBAC)
- [ ] Seluruh peran kanonikal (`EMPLOYEE`, `SUPERVISOR`, `HRGA`, `SYSTEM_ADMIN`, `CEO_MANAGEMENT`) berhasil login dan mendarat di landing route resmi masing-masing.
- [ ] Tombol darurat melayang `☰ Menu` terbukti telah dihilangkan permanen; navigasi sepenuhnya menggunakan sidebar enterprise 232px.
- [ ] Percobaan akses URL terlarang secara manual berhasil dihadang oleh router guard dan dialihkan ke layar Error 403 Forbidden.
- [ ] Aktivasi akun karyawan baru melalui token 72 jam berhasil dan token terbukti *single-use* (tidak dapat dipakai ulang).
- [ ] Pengakhiran sesi (Logout) membersihkan data secara tuntas dan tombol 'Back' browser tidak menampilkan data aplikasi.

### Gate 2: Akuntabilitas Harian (Morning, Ad-Hoc, EOD)
- [ ] Karyawan dapat merencanakan 1 hingga 3 komitmen harian tepat waktu dengan penandaan inisiatif/proyek yang jelas.
- [ ] Opsi 0 komitmen terbukti mewajibkan alasan minimal 10 karakter dan menolak isian kosong/pendek.
- [ ] Karyawan dapat mencatat tugas tambahan ad-hoc di siang hari dan otomatis terintegrasi ke evaluasi sore.
- [ ] Form evaluasi sore (EOD) berfungsi dengan baik dan status pencapaian tersimpan akurat.
- [ ] **Kepatuhan Aturan DEC-003 (Anti-Lock Green):** Radio button status Hijau terbukti **TETAP AKTIF DAN DAPAT DIPILIH** meskipun sistem menyarankan Kuning/Merah, dilengkapi catatan justifikasi.
- [ ] **Kepatuhan Aturan DEC-002 (Anti-Direct Edit):** Form komitmen pagi dan EOD terkunci dari penyuntingan langsung setelah melewati batas cut-off.

### Gate 3: Manajemen Blocker & SLA Eskalasi
- [ ] Pelaporan blocker kritis secara otomatis menetapkan target SLA respons 2 jam.
- [ ] Supervisor dapat mengonfirmasi penerimaan (*Acknowledge*) dan memberikan rencana intervensi bantuan.
- [ ] Penutupan blocker berstatus `RESOLVED` terbukti mewajibkan pengisian catatan solusi tuntas minimal 10 karakter.
- [ ] Radar eskalasi (`/blockers/aging`) berhasil menampilkan blocker yang melewati batas waktu SLA.

### Gate 4: Tata Kelola Kepatuhan & Permohonan Koreksi
- [ ] Karyawan yang terlewat cut-off dapat mengajukan permohonan koreksi resmi dengan alasan valid.
- [ ] Supervisor dapat meninjau perbandingan data usulan koreksi dan menyetujui atau menolak dengan alasan wajib >= 10 karakter.
- [ ] HRGA dapat memantau antrean kepatuhan dan mengidentifikasi pola pelanggaran berulang (ambang batas 3x).
- [ ] Penerbitan dispensasi resmi (Exemption) oleh HRGA berhasil menghapus catatan pelanggaran dan terekam dalam audit trail permanen.

### Gate 5: Rekonsiliasi Cuti Otomatis (DEC-008)
- [ ] Pengajuan cuti tahunan mandiri memotong kuota cuti dengan benar pasca disetujui atasan.
- [ ] **Kepatuhan Aturan DEC-008:** Karyawan yang cutinya telah disetujui resmi otomatis direkonsiliasi menjadi `Superseded by Approved Leave` pasca cut-off tanpa dikenakan catatan pelanggaran kepatuhan.

---

## 3. EVALUASI DEFECT TERSISA (RESIDUAL DEFECTS)

Catat ringkasan jumlah defect yang ditemukan selama eksekusi:

| Tingkat Keparahan (Severity) | Jumlah Ditemukan | Jumlah Diperbaiki (Closed) | Sisa Defect Terbuka (Open) | Ambang Batas Penerimaan |
| :--- | :---: | :---: | :---: | :---: |
| **Critical / Blocker (S1)** | [ ... ] | [ ... ] | [ ... ] | **Wajib 0 (Zero Tolerance)** |
| **Major (S2)** | [ ... ] | [ ... ] | [ ... ] | Maksimal 0 (kecuali ada work-around tertulis) |
| **Minor (S3)** | [ ... ] | [ ... ] | [ ... ] | Maksimal 3 (dijadwalkan rilis berikutnya) |
| **Cosmetic (S4)** | [ ... ] | [ ... ] | [ ... ] | Ditoleransi untuk penyempurnaan sprint |

---

## 4. KEPUTUSAN PENERIMAAN SISTEM (FINAL ACCEPTANCE DECISION)

Pilihlah salah satu dari tiga opsi keputusan di bawah ini:

### [ ] OPSI 1: DITERIMA PENUH TANPA SYARAT (FULLY ACCEPTED)
> Sistem WorkPulse memenuhi seluruh kriteria penerimaan fungsional, regulasi bisnis (DEC-001 s.d. DEC-013), keamanan otorisasi peran, dan standar visual 1:1. Sistem dinyatakan siap sepenuhnya untuk diluncurkan ke seluruh unit kerja PT Dutamedia Mandiri Pratama.

### [ ] OPSI 2: DITERIMA DENGAN SYARAT (CONDITIONALLY ACCEPTED)
> Sistem WorkPulse dapat digunakan secara operasional dengan catatan perbaikan minor berikut wajib diselesaikan oleh tim pengembang dalam tenggat waktu yang disepakati:
> 1. ........................................................................................................................
> 2. ........................................................................................................................

### [ ] OPSI 3: DITOLAK / PERLU PERBAIKAN MAYOR (REJECTED)
> Sistem WorkPulse belum dapat diterima karena masih terdapat cacat kritis berstatus Blocker/P0 yang menghalangi alur kerja operasional harian. Diperlukan rilis perbaikan menyeluruh sebelum pengujian ulang dilakukan.
> Alasan Penolakan:
> ........................................................................................................................

---

## 5. LEMBAR PENGESAHAN & TANDA TANGAN (SIGN-OFF)

| Pihak Penilai / Acceptance Owner | Perwakilan Tim Pengembang (Engineering) |
| :---: | :---: |
| <br><br><br>_________________________________________<br>**Harry**<br>Manual Tester & Acceptance Owner<br>PT Dutamedia Mandiri Pratama<br>Tanggal: ____ / ____ / 2026 | <br><br><br>_________________________________________<br>**Lead Software Engineer**<br>Tim Pengembang WorkPulse<br>PT Dutamedia Mandiri Pratama<br>Tanggal: ____ / ____ / 2026 |

