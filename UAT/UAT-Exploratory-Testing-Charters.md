# WorkPulse — Exploratory Testing Charters

> **Sistem:** WorkPulse (Daily Accountability & Blocker Log System)  
> **Organisasi:** PT Dutamedia Mandiri Pratama  
> **Versi Dokumen:** 1.0.0  
> **Penguji Eksplorasi:** Harry (Acceptance Owner & Usability Evaluator)  
> **Tanggal:** 29 Oktober 2026  

---

## 1. PANDUAN PELAKSANAAN EXPLORATORY TESTING

Pengujian eksplorasi bertujuan untuk menemukan cacat tak terduga (*unexpected bugs*), gesekan pengalaman pengguna (*usability friction*), inkonsistensi antarmuka, atau anomali alur kerja yang sulit diidentifikasi hanya melalui test case formal skrip kaku.

Setiap piagam pengujian (*charter*) dibatasi oleh kotak waktu (*timeboxed*) antara 15 hingga 30 menit. Anda bebas mengeksplorasi antarmuka secara intuitif selama berada dalam koridor tujuan dan batasan piagam.

> [!TIP]
> Jika Anda menemukan kejanggalan atau bug selama eksplorasi:
> 1. Ambil tangkapan layar (screenshot) sebagai bukti.
> 2. Catat temuan ke dalam `UAT/UAT-Execution-Log.csv` dengan memberi tanda `Fail` atau catatan khusus.
> 3. Buat laporan rinci menggunakan template `UAT/UAT-Defect-Report-Template.md`.

---

## 2. DAFTAR PIAGAM UJI EKSPLORASI

---

### CH-EXP-01: Navigasi Cepat, Double Submission, & Penanganan Refresh Form
- **Charter ID:** `CH-EXP-01`
- **Area Eksplorasi:** Seluruh Formulir Input Utama (`/daily/morning`, `/daily/eod`, `/blockers/raise`, `/leave/my`).
- **Tujuan Eksplorasi:** Menguji ketahanan formulir terhadap pengiriman ganda (*double click submit*), hilangnya draf saat refresh browser tidak sengaja, dan navigasi bolak-balik antar menu saat form sedang terisi.
- **Hipotesis Risiko:** Pengguna yang tidak sengaja menekan tombol submit dua kali dapat menghasilkan duplikasi data komitmen atau blocker ganda di database.
- **Peran yang Digunakan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Durasi yang Disarankan:** 20 Menit
- **Prasyarat:** Sesi login Employee aktif.
- **Batasan Pengujian:** Gunakan data teks pengujian yang wajar, jangan merusak database seeder secara permanen.
- **Saran Tindakan Eksplorasi:**
  1. Isi form komitmen pagi, jangan klik submit, lalu klik menu navigasi lain (cth: "Tugas Tambahan"). Kembali lagi ke "Komitmen Pagi"; amati apakah sistem memperingatkan draf belum tersimpan atau mempertahankan isian.
  2. Isi form pelaporan blocker, klik tombol "Kirim Laporan" secara cepat dua kali berturut-turut (*double click*).
  3. Tekan F5 (Refresh) saat mengisi form EOD yang panjang.
- **Hal yang Perlu Diamati:**
  - Tombol submit harus langsung dalam kondisi disabled/loading begitu diklik pertama kali untuk mencegah *duplicate insert*.
  - Ketiadaan error teknis SQL/database yang bocor ke layar pengguna saat terjadi double event.
  - Kejelasan pesan konfirmasi saat berpindah halaman jika form belum tersimpan.

---

### CH-EXP-02: Konsistensi Visual Design System & Responsivitas Layout Mobile
- **Charter ID:** `CH-EXP-02`
- **Area Eksplorasi:** Sidebar Enterprise 232px, Header Navigasi, Badge Status, Kartu Ringkasan, dan Modal Dialog.
- **Tujuan Eksplorasi:** Memverifikasi kepatuhan visual terhadap Design System v1.5.0 (warna brand `#00674D`, tipografi Inter, radius 8px, padding 24px) pada resolusi Desktop (1440px) dan Mobile Viewport (375px).
- **Hipotesis Risiko:** Elemen layout tumpang tindih (*text overflow*), sidebar memotong konten utama, atau teks badge status tidak terbaca pada layar sempit.
- **Peran yang Digunakan:** `SUPERVISOR` (`lead.tech@dutamedia.com`) dan `EMPLOYEE`
- **Durasi yang Disarankan:** 25 Menit
- **Prasyarat:** Browser Google Chrome / Edge dengan Inspect Elements (DevTools).
- **Batasan Pengujian:** Fokus pada aspek visual, tata letak, keterbacaan (*readability*), dan kenyamanan interaksi sentuh.
- **Saran Tindakan Eksplorasi:**
  1. Buka Dasbor `/dashboard` pada desktop 1440x900. Periksa lebar sidebar tepat 232px dan konten tidak tertutup.
  2. Buka DevTools (F12), aktifkan Device Toolbar, pilih perangkat "iPhone SE" atau resolusi 375x812.
  3. Amati adaptasi menu: apakah sidebar berubah menjadi drawer overlay yang ramah sentuhan? Apakah kartu metrik tersusun vertikal secara rapi?
  4. Buka modal dialog pada layar mobile; periksa apakah tombol "Tutup" atau "Batal" mudah ditekan jari tanpa terpotong batas layar bawah.
- **Hal yang Perlu Diamati:**
  - Tidak ada scrolling horizontal yang tidak diinginkan pada viewport mobile (*no horizontal scroll overflow*).
  - Kontras warna teks di atas latar belakang memenuhi standar kenyamanan mata.
  - Ketiadaan elemen darurat melayang lama `☰ Menu` yang mengganggu estetika.

---

### CH-EXP-03: Kebingungan Alur Kerja & Kejelasan Pesan Kesalahan Form (Usability)
- **Charter ID:** `CH-EXP-03`
- **Area Eksplorasi:** Validasi Formulir Pagi, Alur Koreksi, dan Antrean Blocker.
- **Tujuan Eksplorasi:** Menilai keramahan pengalaman pengguna (*user empathy*): apakah instruksi mudah dipahami, apakah pesan validasi membimbing pengguna untuk memperbaiki kesalahan atau justru membingungkan.
- **Hipotesis Risiko:** Pesan kesalahan teknis berbahasa Inggris atau istilah kode (misal `P2002 Unique constraint failed`) membuat pengguna panik dan frustrasi.
- **Peran yang Digunakan:** `EMPLOYEE`
- **Durasi yang Disarankan:** 20 Menit
- **Prasyarat:** Sesi login aktif.
- **Batasan Pengujian:** Coba berbagai variasi isian tidak lazim (teks simbol aneh, angka negatif, spasi berlebih).
- **Saran Tindakan Eksplorasi:**
  1. Masukkan spasi kosong sebanyak 10 karakter pada field deskripsi komitmen lalu coba kirim.
  2. Masukkan tanggal masa depan yang tidak masuk akal pada form pengajuan cuti.
  3. Coba masukkan teks deskripsi sangat panjang (> 500 karakter) pada form blocker.
- **Hal yang Perlu Diamati:**
  - Apakah sistem memotong (*trim*) spasi kosong di awal/akhir input?
  - Apakah pesan kesalahan disajikan dalam Bahasa Indonesia yang santun, jelas, dan menunjukkan langkah perbaikan konkret?
  - Apakah posisi pesan error berada tepat di bawah field input yang bermasalah?

---

### CH-EXP-04: Sesi Multi-Tab & Persistensi Status Lintas Tab
- **Charter ID:** `CH-EXP-04`
- **Area Eksplorasi:** Seluruh Halaman Aplikasi.
- **Tujuan Eksplorasi:** Menguji ketahanan aplikasi ketika dibuka di dua tab browser secara bersamaan dengan peran yang sama atau saat logout dilakukan di salah satu tab.
- **Hipotesis Risiko:** Logout di Tab 1 tidak disadari oleh Tab 2 sehingga pengguna di Tab 2 mengira data masih tersimpan saat submit form.
- **Peran yang Digunakan:** `SUPERVISOR` / `EMPLOYEE`
- **Durasi yang Disarankan:** 15 Menit
- **Prasyarat:** Buka dua tab browser dalam jendela yang sama.
- **Batasan Pengujian:** Jangan menggunakan mode incognito terpisah untuk tes ini.
- **Saran Tindakan Eksplorasi:**
  1. Buka `/daily/morning` di Tab 1 dan `/blockers` di Tab 2.
  2. Di Tab 2, lakukan Logout dari aplikasi.
  3. Kembali ke Tab 1, coba lakukan submit komitmen atau klik menu lain.
- **Hal yang Perlu Diamati:**
  - Tab 1 harus mendeteksi token telah invalid/terhapus dan langsung me-redirect ke `/login` dengan notifikasi "Sesi Anda telah berakhir".
  - Mencegah data 'hantu' terkirim dalam kondisi unauthenticated.

---

### CH-EXP-05: Manipulasi URL Manual & Pencegahan Akses Lintas Hak
- **Charter ID:** `CH-EXP-05`
- **Area Eksplorasi:** Seluruh URL administratif dan manajerial.
- **Tujuan Eksplorasi:** Menjelajah seluruh kombinasi URL privat sebagai pengguna biasa untuk mencari celah kebocoran antarmuka.
- **Hipotesis Risiko:** Ada rute tersembunyi yang lupa dipasang router guard sehingga dapat diintip oleh peran operasional.
- **Peran yang Digunakan:** `EMPLOYEE` (`dev.frontend@dutamedia.com`)
- **Durasi yang Disarankan:** 20 Menit
- **Prasyarat:** Login sebagai Employee.
- **Batasan Pengujian:** Pengujian manual melalui address bar browser.
- **Saran Tindakan Eksplorasi:**
  1. Ketik `/admin/users`
  2. Ketik `/admin/organization`
  3. Ketik `/admin/policies`
  4. Ketik `/admin/temporary-reviewers`
  5. Ketik `/compliance`
  6. Ketik `/exemptions`
  7. Ketik rute acak yang tidak ada: `/halaman-palsu-123`
- **Hal yang Perlu Diamati:**
  - Seluruh rute administratif wajib mengarahkan ke layar Error 403 Forbidden (`/forbidden`).
  - Rute acak yang tidak terdaftar wajib mengarahkan ke layar Error 404 Not Found (`/not-found`) yang memiliki tombol navigasi kembali ke beranda.
  - Tidak ada komponen administratif yang sempat ter-render sekilas (*flicker leak*) sebelum diarahkan ke halaman error.

---

### CH-EXP-06: Simulasi Gangguan Koneksi Jaringan (Network Degradation)
- **Charter ID:** `CH-EXP-06`
- **Area Eksplorasi:** Form Submission di `/daily/morning`, `/daily/eod`, dan `/blockers/raise`.
- **Tujuan Eksplorasi:** Mengamati perilaku antarmuka ketika koneksi internet terputus atau lambat saat pengguna menekan tombol simpan.
- **Hipotesis Risiko:** Tombol loading gantung selamanya (*infinite spinner*) tanpa pesan batas waktu (*timeout*), membuat pengguna bingung apakah datanya sudah tersimpan atau belum.
- **Peran yang Digunakan:** `EMPLOYEE`
- **Durasi yang Disarankan:** 15 Menit
- **Prasyarat:** Browser DevTools -> Tab Network -> Throttling Preset ("Offline" atau "Slow 3G").
- **Batasan Pengujian:** Kembalikan throttling ke "No Throttling" setelah pengujian selesai.
- **Saran Tindakan Eksplorasi:**
  1. Isi form komitmen pagi lengkap.
  2. Di DevTools Tab Network, ubah preset menjadi "Offline".
  3. Klik tombol "Simpan Komitmen".
  4. Amati reaksi UI: apakah muncul toast kesalahan jaringan "Koneksi terputus. Silakan periksa jaringan internet Anda"?
  5. Kembalikan ke "No Throttling", lalu klik simpan kembali.
- **Hal yang Perlu Diamati:**
  - Sistem tidak crash/blank putih (*white screen of death*).
  - Teks isian pengguna tidak hilang saat terjadi kegagalan jaringan, sehingga pengguna tidak perlu mengetik ulang dari awal.

---

### CH-EXP-07: Integritas Transisi Status Blocker & Filter Antrean
- **Charter ID:** `CH-EXP-07`
- **Area Eksplorasi:** Halaman Blocker Queue (`/blockers`) dan Escalation Aging (`/blockers/aging`).
- **Tujuan Eksplorasi:** Menguji akurasi filter tab status (Semua, Open, In Progress, Resolved) dan konsistensi jumlah angka badge counter saat blocker berpindah status.
- **Hipotesis Risiko:** Blocker yang sudah diselesaikan (Resolved) masih muncul di tab Open atau angka counter antrean tidak berkurang secara reaktif.
- **Peran yang Digunakan:** `SUPERVISOR` (`lead.tech@dutamedia.com`)
- **Durasi yang Disarankan:** 20 Menit
- **Prasyarat:** Memiliki beberapa blocker aktif di database.
- **Batasan Pengujian:** Lakukan filter berdasarkan nama inisiatif dan tingkat keparahan.
- **Saran Tindakan Eksplorasi:**
  1. Catat angka counter pada tab "Open".
  2. Buka salah satu blocker Open, ubah status menjadi Resolved dengan mengisi solusi.
  3. Periksa apakah angka counter "Open" otomatis berkurang 1 dan counter "Resolved" bertambah 1.
  4. Gunakan kotak pencarian (search box) dengan mengetik nama pelapor atau kata kunci judul blocker.
- **Hal yang Perlu Diamati:**
  - Pemfilteran bekerja instan tanpa lag yang mengganggu.
  - Transisi status langsung mencerminkan data aktual di UI.
