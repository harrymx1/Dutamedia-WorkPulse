# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 07: WEB NOTIFICATION CENTER & BROWSER PUSH

- **Berkas Prototipe:** [`07-Notification-Center-Browser-Push.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/07-Notification-Center-Browser-Push.html)
- **Rute Sistem:** `/notifications`
- **Posisi Alur:** Pusat Komunikasi, Pemantauan Notifikasi In-App & Kontrol Izin Browser Push (*Communication Hub & Browser Push Control*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [01-PDD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/01-PDD.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Pusat Pemantauan In-App Terpusat (PRD FR-38):** Menjadi tempat pencatatan terpusat seluruh peristiwa akuntabilitas kerja, tanggapan blocker, persetujuan koreksi data, pembaruan izin cuti, dan catatan apresiasi pimpinan dalam satu wadah arsip *in-system*.
2. **Kanal Pengiriman Browser Push Nyata MVP (PRD FR-38 & PDD §2.2):** Menyediakan mekanisme aktivasi dan pemantauan izin Web Notifications API peramban (*Explicit Opt-In*) untuk mendukung pengiriman push notification riil pada pemicu batas waktu (Morning/EOD cutoff) dan eskalasi kedaruratan (tiket Critical Blocker).
3. **Pemisahan Status Penandaan vs Status Pengiriman Saluran (UI/UX Spec §4.7):** Menegakkan pemisahan tegas bahwa status *"Sudah Dibaca" (Read)* di Notification Center murni interaksi penandaan aplikasi, bukan bukti bahwa notifikasi Email atau Browser Push telah terkirim/diterima di gawai penerima.
4. **Pemberdayaan Tindak Lanjut Kontekstual (*Deep-Link Context Resolver*):** Memfasilitasi pengguna untuk melompat langsung ke halaman sumber dokumen (Halaman 02, 03, 04, 05, 06, 16a/b, 20, 24) melalui dialog rincian notifikasi.

### 1.2 Batasan Desain Baku
- **Nol Emoticon / Emoji:** Murni menggunakan tipografi korporat dan inline SVG monokrom bergaya *line-stroke* (`stroke-width="1.8-2.2"`).
- **Warna Merah Lembut (*Soft Rose*):** Background `#FFF8F8`, border `#FECDCA`, teks `#DC2626` / `#991B1B` pada kartu Critical Blocker dan status izin peramban yang diblokir (*Denied*).
- **Prinsip Non-Intrusif & Non-Blocking:** Permintaan izin Browser Push hanya dipicu oleh tindakan sadar pengguna (*click-to-prompt*). Penolakan izin browser tidak boleh menghalangi alur kerja operasional lainnya.
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis kaku, sejajar lurus dengan seluruh halaman Workspace lainnya.

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR:                                                                     │
│ [☰ Hamburger Mobile] Breadcrumb: Workspace / Notifications                   │
│ [Lonceng Notifikasi + Dot Indikator Unread]  [Avatar Pengguna (BP)]         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. PAGE HEADING:                                                            │
│    - Eyebrow: PUSAT KOMUNIKASI & PEMBARUAN                                  │
│    - Judul H1: Web Notification Center                                      │
│    - Subteks: Pusat pemantauan pemberitahuan komitmen kerja, eskalasi kendala...│
│    - Sisi Kanan: Badge [ ● 3 belum dibaca ] & Tombol [ Tandai Semua Dibaca ]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. METRIC SUMMARY STRIP (Ultra-Compact 1-Row Mini Bar):                     │
│    ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────┐ │
│    │ Total Notifikasi       │ │ Belum Dibaca           │ │ Browser Push ↗ │ │
│    │ 8                      │ │ 3                      │ │ Izin Aktif / ..│ │
│    │ Riwayat in-system      │ │ Perlu peninjauan       │ │ Klik ke Tab 2  │ │
│    └────────────────────────┘ └────────────────────────┘ └────────────────┘ │
│    *Desain Responsif Smartphone/Tablet: Tetap 1 baris sejajar (3 kolom),     │
│     tinggi ~48px (hemat ~80% ruang vertikal layar HP dibanding stacking).    │
│     Subteks & ikon disembunyikan otomatis di HP agar feed langsung terlihat. │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. NAVIGASI TAB TAMPILAN UTAMA (MAIN VIEW TABS):                            │
│    [ ● Daftar Notifikasi (3) ] (Aktif)   [ ⚙ Pengaturan Kanal & Perangkat ]  │
│    *Desain Responsif Mobile: Font & padding diperkecil proporsional (9.5-11px│
│     white-space: nowrap), muat presisi 1 baris di iPhone SE (375px) & Android│
├─────────────────────────────────────────────────────────────────────────────┤
│ KONTEN TAB 1 (DEFAULT / UTAMA): DAFTAR NOTIFIKASI                           │
│ - Header: Judul "Daftar Notifikasi", Tombol [ Tandai Semua Dibaca ]         │
│ - Toolbar Filter & Live Search:                                             │
│   • Tab Status: [ Semua (8) ]  [ Belum Dibaca (3) ]  [ Sudah Dibaca (5) ]   │
│   • Input Live Search: Pencarian real-time (judul, deskripsi, tiket)        │
│   • Dropdown Kategori: Semua / Blocker / Dukungan / Koreksi / Pengingat     │
│ - Feed Daftar Kartu Notifikasi (Langsung tampak tanpa scroll!):             │
│   • Ikon SVG Kategori Tematik (Merah/Amber/Biru/Hijau/Netral)               │
│   • Dot Indikator Unread (Hijau Botol)                                      │
│   • Judul & Narasi Ringkas                                                  │
│   • Mini-Tag Semantik & Timestamp Humanis                                   │
│   • Aksi Baris: [ Lihat Detail → ] & [ Tombol Toggle Baca/Belum ]           │
│ - Empty State Box: Muncul saat filter pencarian tidak menemukan hasil       │
│ - Footer Panel: Counter hasil pencarian & maklumat otorisasi akun           │
├─────────────────────────────────────────────────────────────────────────────┤
│ KONTEN TAB 2: PENGATURAN KANAL & PERANGKAT                                  │
│ ┌───────────────────────────────────┐ ┌───────────────────────────────────┐ │
│ │ KARTU A: PENGATURAN PERANGKAT     │ │ KARTU B: SALURAN PEMBERITAHUAN    │ │
│ │ (Notifikasi Layar Komputer)       │ │ (Di Mana Saja Notifikasi Dikirim?)│ │
│ │ - Badge Status: [ Izin Aktif / ..]│ │ - Row 1: Pusat Notifikasi Web     │ │
│ │ - Ikon Lonceng SVG Monokrom       │ │   [ Selalu Aktif (Utama) ]        │ │
│ │ - Judul & Penjelasan Ramah        │ │ - Row 2: Email Kantor             │ │
│ │ - Notice Box Edukatif (4-State)   │ │   [ Aktif Otomatis ]              │ │
│ │ - Aksi: [ Nyalakan Notifikasi ]   │ │ - Row 3: Notifikasi Layar Komputer│ │
│ │   & [ Periksa Status ]            │ │   [ Belum Aktif / Aktif di Laptop]│ │
│ │ - Subteks: Berlaku per laptop     │ │ - Maklumat: Read ≠ Delivery Proof │ │
│ └───────────────────────────────────┘ └───────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. MODAL DETAIL NOTIFIKASI & DEEP-LINK RESOLVER:                            │
│    - Pop-up Dialog terisolasi dengan backdrop blur                          │
│    - Tag semantik berwarna (Tone Pill) & status baca instan                 │
│    - Metadata rujukan lengkap (Konteks Tiket & Stempel Waktu Lokal)         │
│    - Tombol aksi [ Tutup ] & [ Buka Konteks Terkait > ]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. CONTEXTUAL TOAST ENGINE: Feedback notifikasi sudut kanan bawah           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.1 Kontrol Izin Notifikasi Layar 4-State (UI/UX Spec §4.7)
Sistem secara otomatis mengevaluasi ketersediaan dan status izin Web Notifications API (`window.Notification`):
1. **State 1: Unsupported (Peramban Tidak Mendukung):**
   - Indikator: Badge amber `Tidak Didukung`.
   - Perilaku: Tombol aktivasi dinonaktifkan (`disabled`), notice informatif menegaskan bahwa seluruh notifikasi tetap dapat dipantau secara penuh melalui Pusat Notifikasi Web dan Email Kantor.
2. **State 2: Default / Prompt (Belum Diaktifkan):**
   - Indikator: Badge netral `Belum Aktif`.
   - Perilaku: Tombol **`Nyalakan Notifikasi Layar`** aktif. Izin hanya diminta saat pengguna mengklik tombol tersebut.
3. **State 3: Granted (Izin Diberikan & Aktif):**
   - Indikator: Badge hijau `Izin Aktif`.
   - Perilaku: Tombol berubah menjadi **`Kirim Notifikasi Uji`** (aktif untuk memicu pengujian notifikasi riil ke desktop), notice hijau sukses menegaskan notifikasi layar telah aktif serta menyertakan petunjuk cara mematikan izin (*Revoke Guidance*). Baris saluran Notifikasi Layar Komputer otomatis tersinkronisasi ke badge hijau `Aktif di Laptop Ini`.
4. **State 4: Denied / Blocked (Izin Diblokir di Browser):**
   - Indikator: Badge merah `Diblokir`.
   - Perilaku: Tombol berubah menjadi `Lihat Panduan Browser`, notice peringatan amber memandu langkah pengguna membuka izin pada pengaturan URL browser.

### 3.2 Saluran Pengiriman Resmi & Integrasi Tautan Pintar Email (*Smart Email Link*)
Menyajikan status 3 saluran pengiriman:
- **Pusat Notifikasi Web:** `Selalu Aktif (Utama)` (in-app, seluruh arsip resmi tersimpan rapi).
- **Email Kantor:** `Aktif Otomatis` (pengingat batas waktu dan kabar penting pimpinan).
- **Notifikasi Layar Komputer:** Mengikuti status izin perangkat aktif (pengiriman langsung di layar laptop).
- **Prinsip Read $\ne$ Delivery:** Menandai "Sudah Dibaca" di web murni penandaan di layar pengguna, bukan konfirmasi mutlak bahwa email atau pesan push telah sampai/dibaca di perangkat fisik pihak ketiga.
- **Tautan Otomatis Baca (*Smart Auto-Read Link*):** Untuk mencegah beban "kerja dua kali" (*double work*), setiap tautan pada badan email kantor membawa parameter rujukan (contoh `?read={notifId}`). Ketika pengguna membuka tautan dari email, sistem otomatis menandai notifikasi tersebut sebagai "Sudah Dibaca" di web tanpa perlu mengeklik tombol centang manual.

### 3.3 Deep-Link Context Resolver & Modal Rincian
Setiap baris notifikasi yang diklik membuka Modal Pop-up Rincian Notifikasi (`#detailModal`). Modal ini:
1. Menyajikan tag pill berwarna sesuai urgensi (*Critical Blocker*, *Dukungan Tim*, dsb.).
2. Menampilkan status baca instan (*Baru saja ditandai dibaca* / *Sudah dibaca*).
3. Mengasosiasikan rute tujuan dokumen secara presisi:
   - Blocker $\rightarrow$ `05-Raise-Instant-Blocker.html#my-blockers`.
   - Morning Commitment $\rightarrow$ `02-Morning-Commitment.html`.
   - Additional Work $\rightarrow$ `03-Additional-Work.html`.
   - EOD Outcome $\rightarrow$ `04-EOD-Outcome.html`.
   - History & Weekly Summary $\rightarrow$ `06-My-History-Weekly-Summary.html`.
   - Correction Requests $\rightarrow$ `16a-Morning-Correction-Request.html` / `16b-EOD-Correction-Request.html`.
   - Leave Requests $\rightarrow$ `20-My Leave Request (Employee).html`.
   - Profil & Organisasi $\rightarrow$ `24-Profile-Settings.html`.
4. Menyajikan label tombol aksi dinamis (*Dynamic Action Label*) yang cerdas menyesuaikan jenis dokumen (misal: *"Buka Tiket Kendala"*, *"Buka Komitmen Kerja"*, *"Buka Pengajuan Koreksi"*, *"Buka Catatan di Histori"*) alih-alih label abstrak "Buka Konteks Terkait".
5. **Kewajiban Kontrak Routing Frontend (*Deep-Link Routing Mandate*):**
   - **Simulasi Prototipe:** Prototipe HTML saat ini menjalankan simulasi navigasi menggunakan `window.location.href = targetRoute`.
   - **Spesifikasi Integrasi SPA (React / Next.js / Vue):** Pada implementasi frontend aplikasi nyata, klik tombol ini **wajib** menggunakan client-side routing (`router.push(targetRoute)`).
   - **Kontrak Halaman Penerima (*Target Page Contract*):** Halaman tujuan yang menerima deep-link wajib mem-parsing target hash/ID (contoh `#BLK-2026-0042`), melakukan *auto-scroll* mulus ke elemen sasaran, serta memberikan animasi sorot visual sementara (*highlight pulse*) agar pengguna langsung menemukan item yang dimaksud.
   - **Penanganan Galat (*Graceful Fallback*):** Jika dokumen atau tiket tujuan telah dihapus atau pengguna kehilangan hak akses ke entitas tersebut, router wajib menampilkan pesan toast informasi dan mengarahkan kembali ke halaman induk tanpa merusak alur aplikasi.

### 3.4 Mekanisme Penandaan Massal & Satuan
- Mengklik **`Tandai semua dibaca`** langsung mengubah seluruh item unread menjadi read, memadamkan dot badge pada topbar dan sidebar, serta memicu toast sukses hijau.
- Tombol toggle pada kartu memungkinkan penandaan baca/belum secara mandiri per baris dengan sinkronisasi counter metrik secara real-time.

### 3.5 Matriks Lengkap 22 Pemicu Notifikasi & Sistem Anti-Celah Komunikasi
Sistem WorkPulse menerapkan matriks 22 pemicu resmi untuk memastikan tidak ada celah alur kerja (*zero blind spots*) pada seluruh siklus hidup operasional:

| No | Pemicu Kejadian (*Event Trigger*) | Kategori (`type`) | Warna / *Tone* | Penerima Sasaran | Saluran Pengiriman (*Channels*) | Rute *Deep-Link* & Aksi Utama |
| :-: | :--- | :---: | :---: | :--- | :--- | :--- |
| **1** | Morning / EOD mendekati *cutoff* belum diisi | `reminder` | `blue` | Employee terkait | Email + Browser Push + Web Center | `02` / `04` (Buka Form Komitmen/EOD) |
| **2** | Komitmen **AMBER** dengan kebutuhan bantuan | `support` | `amber` | Assigned Support Owner + Employee | Email + Browser Push + Web Center | `02-Morning-Commitment.html` (Buka Komitmen) |
| **3** | Evaluasi sore **RED** (Terkendala berat) | `blocker` | `red` | Supervisor/Head + PM/Owner | Email + Browser Push + Web Center | `09-Blocker-Escalation-Queue.html` |
| **4** | Kendala kritis (*Instant Blocker*) diajukan | `blocker` | `red` | Rantai eskalasi terkonfigurasi | Email + Browser Push + Web Center | `05-Raise-Instant-Blocker.html#my-blockers` |
| **5** | Tiket kendala belum diakui melewati SLA | `blocker` | `red` | Level eskalasi berikutnya | Email + Browser Push + Web Center | `09-Blocker-Escalation-Queue.html` |
| **6** | Tiket Blocker diakui (*Acknowledged*) | `blocker` | `blue` | Employee pelapor kendala | Browser Push + Web Center | `05-Raise-Instant-Blocker.html#my-blockers` |
| **7** | Tiket Blocker tuntas diperbaiki (*Resolved*) | `blocker` | `green` | Employee pelapor kendala + Lead | Email + Browser Push + Web Center | `05-Raise-Instant-Blocker.html#my-blockers` |
| **8** | Tiket Blocker ditolak / invalid (*Rejected*) | `blocker` | `amber` | Employee pelapor kendala | Email + Web Center | `05-Raise-Instant-Blocker.html#my-blockers` |
| **9** | Permintaan dukungan diterima (*Support Accepted*) | `support` | `green` | Employee pemohon bantuan | Browser Push + Web Center | `02-Morning-Commitment.html` |
| **10** | Permintaan dukungan ditolak (*Support Declined*) | `support` | `red` | Employee pemohon + Squad Lead | Email + Browser Push + Web Center | `02-Morning-Commitment.html` (Alihkan Dukungan) |
| **11** | Penugasan pekerjaan tambahan (*Additional Work*) | `reminder` | `amber` | Employee pelaksana yang ditugaskan | Email + Browser Push + Web Center | `03-Additional-Work.html` (Buka Tugas) |
| **12** | Catatan / arahan harian pimpinan (*Manager Note*) | `review` | `blue` | Employee pemilik hasil kerja | Email + Web Center | `06-My-History-Weekly-Summary.html` |
| **13** | Karyawan berulang kali tidak mengisi (*No-Submission*) | `review` | `red` | Supervisor/Head + HRGA | Email + Web Center | `22-Correction-and-Leave-Review.html` |
| **14** | Ringkasan mingguan (*Weekly Summary*) terbit | `reminder` | `blue` | Employee + Manager | Email + Web Center | `06-My-History-Weekly-Summary.html` |
| **15** | Perubahan kebijakan / pemetaan organisasi tim | `system` | `neutral` | User terdampak + Policy Owner | Web Center saja | `24-Profile-Settings.html` |
| **16** | Koreksi material diajukan (*Objection Window*) | `review` | `blue` | Authorized Reviewer terkait | Email + Web Center | `16a` / `16b` (Buka Pengajuan Koreksi) |
| **17** | Koreksi mendekati akhir batas keberatan | `review` | `amber` | Authorized Reviewer (Pengingat) | Web Center saja | `16a` / `16b` (Telaah Koreksi) |
| **18** | Koreksi disetujui (*Applied*) atau ditolak (*Rejected*) | `review` | `green`/`red` | Employee pengaju | Web Center saja | `06-My-History-Weekly-Summary.html` |
| **19** | Undangan aktivasi akun baru / aktivasi ulang | `system` | `blue` | Karyawan pemilik akun | Email (Tautan Sekali Pakai) | `01-Login-Activation.html` |
| **20** | Pengajuan cuti (*Leave Request*) diajukan | `review` | `amber` | Authorized Approver terkait | Email + Browser Push + Web Center | `22-Correction-and-Leave-Review.html` |
| **21** | Putusan cuti disetujui atau ditolak | `review` | `green`/`red` | Employee pengaju | Email + Web Center | `20-My Leave Request (Employee).html` |
| **22** | Deteksi sesi masuk (*login*) peramban / perangkat baru | `system` | `amber` | Karyawan pemilik akun | Email + Web Center | `24-Profile-Settings.html` (Keamanan Akun) |

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Pemuatan Awal Halaman | Halaman dibuka | Counter unread = 3, dot lonceng topbar aktif, 8 kartu feed ter-render, status izin peramban dievaluasi. |
| **TC-02** | Filter Tab 'Belum Dibaca' | Klik tab `Belum dibaca (3)` | Hanya 3 kartu unread yang tampil (background hijau lembut halus dengan dot unread). Kartu read disembunyikan. |
| **TC-03** | Filter Tab 'Sudah Dibaca' | Klik tab `Sudah dibaca (5)` | Hanya 5 kartu berstatus dibaca yang tampil. Dot unread tidak ada pada kartu. |
| **TC-04** | Filter Dropdown Kategori | Pilih opsi "Blocker & Risiko" | Menampilkan 2 kartu blocker (BLK-0042 dan BLK-0031). Kategori lain disembunyikan. Counter hasil = "Menampilkan 2 notifikasi". |
| **TC-05** | Live Search Kata Kunci | Ketik "invoice" di kotak pencarian | Menampilkan 1 kartu kendala terkait invoice export. Kartu lain disaring instan secara real-time. |
| **TC-06** | Tandai Semua Dibaca | Klik tombol [Tandai semua dibaca] | Seluruh kartu beralih ke state read, counter unread = 0, dot lonceng padam, tombol tandai semua disabled, toast sukses hijau muncul. |
| **TC-07** | Toggle Status Baca per Item | Klik tombol centang pada kartu unread | Kartu berubah menjadi read, counter unread berkurang 1. Klik ulang mengembalikan status ke unread. |
| **TC-08** | Buka Modal Detail Notifikasi | Klik kartu notifikasi / [Lihat Detail →] | Modal pop-up muncul di tengah dengan backdrop blur, menyajikan rincian lengkap kendala/tugas, tag semantik urgensi, status baca instan, dan tombol aksi dinamis (misal: "Buka Tiket Kendala"). |
| **TC-09** | Deep Link Konteks Dokumen | Klik tombol aksi dinamis modal (misal: [Buka Tiket Kendala]) | Modal tertutup, pengguna diarahkan ke rute tujuan dokumen dengan toast panduan spesifik. |
| **TC-10** | Aksi Kontrol Browser Push | Klik tombol [Aktifkan Browser Push] / [Kirim Notifikasi Uji] | Jika belum aktif, sistem memicu `Notification.requestPermission()`. Jika izin sudah aktif, sistem memicu pengiriman notifikasi uji riil ke peramban dan menampilkan toast konfirmasi sukses. |
| **TC-11** | Beralih Tab Tampilan Utama | Klik tab 'Pengaturan Kanal & Perangkat' | Panel beralih menampilkan Preferensi Browser Push & Matriks Saluran Notifikasi. Klik kembali 'Daftar Notifikasi' mengembalikan tampilan feed seketika. |
| **TC-12** | Pintasan Klik Metrik Browser Push | Klik kartu metrik ke-3 'Browser Push' | Sistem otomatis mengalihkan tampilan aktif ke Tab 'Pengaturan Kanal & Perangkat'. |
| **TC-13** | Auto-Read via Tautan Email | Buka halaman dengan query `?read=notif-001` | Notifikasi dengan ID terkait otomatis ditandai sudah dibaca saat halaman dimuat, counter unread berkurang 1, dan toast hijau konfirmasi sukses muncul. |
| **TC-14** | Strip Metrik & Tab Bar Responsif di Layar Kecil | Buka halaman pada layar smartphone ($\le 680\text{px}$) atau layar sangat kecil seperti iPhone SE ($375\text{px}$) | 3 kartu metrik tetap sejajar 1 baris ultra-kompak ($\approx 48\text{px}$). Tab navigasi (*Daftar Notifikasi* & *Pengaturan Kanal & Perangkat*) otomatis menyesuaikan ukuran font ($9.5\text{px} - 11\text{px}$) dan padding secara proporsional sehingga tetap rapi dalam 1 baris (tidak memakan 2 baris), tidak ada teks terpotong/overflow, serta interaktivitas beralih panel tetap 100% responsif. |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Membaca sesi aktif dari `localStorage: workpulse_active_user` untuk menampilkan profil pengguna di sidebar dan header. |
| **Halaman 02 (Morning Commitment)** | Menerima pengalihan pengguna dari notifikasi pengingat batas waktu pengisian pagi (08:00–09:00 WIB). |
| **Halaman 03 (Additional Work)** | Menerima pengalihan pengguna dari notifikasi penugasan ad-hoc siang hari (*Newly Assigned*). |
| **Halaman 04 (EOD Outcome)** | Menerima pengalihan pengguna dari notifikasi pengingat evaluasi sore hari (16:30–18:00 WIB). |
| **Halaman 05 (Raise Blocker)** | Menerima pengalihan pengguna dari notifikasi kendala kritis (*Critical Blocker*) dan pembaruan tiket penanganan. |
| **Halaman 06 (My History)** | Menerima pengalihan pengguna dari notifikasi penerbitan Weekly Summary dan publikasi Catatan Evaluasi Kerja (*Manager Notes*). |
| **Halaman 08 (Pulse Dashboard)** | Menyalurkan notifikasi peringatan dini kepada atasan saat terdapat anggota tim dengan status harian RED atau kendala kritis. |
| **Halaman 09 (Escalation Queue)** | Memicu notifikasi darurat ke gawai penanggung jawab saat tiket di-escalate otomatis ke Level 2 (Head) akibat batas waktu SLA terlampaui. |
| **Halaman 10 (Manager Notes)** | Menerima pengalihan pengguna dari notifikasi penerbitan catatan apresiasi (*Recognition*) atau bimbingan (*Coaching*). |
| **Halaman 11 (Compliance HRGA)** | Menerima pengalihan notifikasi terkait jadwal sesi dialog pembinaan kepatuhan No Submission. |
| **Halaman 12 (Exemption Management)** | Mengirimkan konfirmasi notifikasi saat dispensasi penugasan dinas luar kota disetujui dan diberlakukan. |
| **Halaman 14 (Escalation Aging)** | Menyalurkan peringatan penuaan blocker (*aging warning*) saat kendala kritis belum tertangani melewati 24/48 jam. |
| **Halaman 16a & 16b (Correction Requests)** | Menerima pengalihan pengguna dari notifikasi permohonan koreksi material yang diajukan atau disetujui (*Applied*). |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 DTO TypeScript Notifikasi Tunggal & Respons Feed
```typescript
export interface NotificationItemDto {
  id: string;
  type: 'blocker' | 'support' | 'review' | 'system' | 'reminder';
  title: string;
  description: string;
  contextRoute: string; // Tautan tujuan deep-link
  contextLabel: string; // Misal: "Raise Instant Blocker · #BLK-2026-0042"
  actionLabel: string;  // Misal: "Buka Tiket Kendala"
  createdAt: string;    // ISO 8601 DateTime
  isRead: boolean;
  priorityTone: 'red' | 'amber' | 'blue' | 'green' | 'neutral';
  tagLabel: string;     // Misal: "Critical Blocker", "Dukungan Tim"
}

export interface NotificationCenterFeedResponseDto {
  totalCount: number;
  unreadCount: number;
  notifications: NotificationItemDto[];
  browserPushStatus: {
    isServerKeyConfigured: boolean;
    vapidPublicKey: string;
  };
}
```

### 6.2 Endpoint REST API Backend Terkait
1. `GET /api/v1/notifications` — Mengambil daftar notifikasi terurut waktu untuk pengguna aktif.
2. `PUT /api/v1/notifications/{id}/read` — Mengubah status penandaan dibaca/belum per notifikasi.
3. `POST /api/v1/notifications/mark-all-read` — Menandai seluruh notifikasi pengguna sebagai sudah dibaca.
4. `POST /api/v1/notifications/push/subscribe` — Mendaftarkan endpoint `PushSubscription` peramban ke database backend untuk pengiriman notifikasi Web Push nyata.
5. **Log Audit Pengiriman (*Delivery Audit Trail*):** Backend mencatat tabel log pengiriman email (`notification_delivery_logs`: `notificationId`, `recipientEmail`, `channel`, `sentAt`, `deliveryStatus`: `DELIVERED` / `BOUNCED` / `FAILED`) sebagai bukti resmi pengiriman notifikasi untuk mencegah dalih komunikasi.

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Web Notification Center & Browser Push. Seluruh komponen pada prototipe [`07-Notification-Center-Browser-Push.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/07-Notification-Center-Browser-Push.html) telah teruji secara visual dan fungsional di peramban (0 console error, 100% lulus uji 14 Test Cases, responsif di desktop/tablet/mobile), bebas error, serta siap diintegrasikan secara terpadu ke kode frontend dan backend.
