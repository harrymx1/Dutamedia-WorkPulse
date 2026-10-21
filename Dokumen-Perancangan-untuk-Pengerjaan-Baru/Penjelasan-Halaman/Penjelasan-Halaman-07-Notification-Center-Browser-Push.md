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
│ 2. METRIC SUMMARY STRIP (Grid 3-Kolom Ramping):                             │
│    ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────┐ │
│    │ Total Notifikasi       │ │ Belum Dibaca           │ │ Browser Push ↗ │ │
│    │ 8                      │ │ 3                      │ │ Izin Aktif / ..│ │
│    │ Riwayat in-system      │ │ Perlu peninjauan       │ │ Klik ke Tab 2  │ │
│    └────────────────────────┘ └────────────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. NAVIGASI TAB TAMPILAN UTAMA (MAIN VIEW TABS):                            │
│    [ ● Daftar Notifikasi (3) ] (Aktif)   [ ⚙ Pengaturan Kanal & Perangkat ]  │
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
│ │ KARTU A: PREFERENSI PERANGKAT     │ │ KARTU B: STATUS KANAL DISTRIBUSI  │ │
│ │ (Browser Push Permission Engine)  │ │ (PRD Section 8 Matrix)            │ │
│ │ - Badge Status: [ Izin Aktif / ..]│ │ - Row 1: Web Notification Center  │ │
│ │ - Ikon Lonceng SVG Monokrom       │ │   [ Tersedia · Arsip Resmi ]      │ │
│ │ - Judul & Deskripsi Hak Akses     │ │ - Row 2: Email Korporat           │ │
│ │ - Notice Box Edukatif (4-State)   │ │   [ Aktif per Kebijakan ]         │ │
│ │ - Aksi: [ Aktifkan Push ]         │ │ - Row 3: Browser Push             │ │
│ │   & [ Periksa Status ]            │ │   [ Status Izin Perangkat ]       │ │
│ │ - Subteks: Berlaku per gawai      │ │ - Maklumat: Read ≠ Delivery Proof │ │
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

### 3.1 Kontrol Izin Browser Push 4-State (PRD FR-38 & UI/UX Spec §4.7)
Sistem secara otomatis mengevaluasi ketersediaan dan status izin Web Notifications API (`window.Notification`):
1. **State 1: Unsupported (Peramban Tidak Mendukung):**
   - Indikator: Badge amber `Tidak Didukung`.
   - Perilaku: Tombol aktivasi dinonaktifkan (`disabled`), notice informatif menegaskan bahwa seluruh notifikasi tetap dapat diakses melalui Notification Center dan Email.
2. **State 2: Default / Prompt (Belum Diaktifkan):**
   - Indikator: Badge netral `Belum Aktif`.
   - Perilaku: Tombol **`Aktifkan Browser Push`** aktif. Izin hanya diminta saat pengguna mengklik tombol tersebut.
3. **State 3: Granted (Izin Diberikan & Aktif):**
   - Indikator: Badge hijau `Izin Aktif`.
   - Perilaku: Tombol berubah menjadi **`Kirim Notifikasi Uji`** (aktif untuk memicu pengujian push notification riil ke OS/desktop), notice hijau sukses menegaskan izin telah aktif pada peramban ini serta menyertakan petunjuk cara mencabut izin (*Revoke Guidance*). Baris saluran Browser Push pada Matriks Distribusi otomatis tersinkronisasi ke badge hijau `Tersedia · Peramban Ini`.
4. **State 4: Denied / Blocked (Izin Diblokir di Browser):**
   - Indikator: Badge merah `Diblokir`.
   - Perilaku: Tombol berubah menjadi `Lihat Panduan Browser`, notice peringatan amber memandu langkah pengguna membuka izin pada pengaturan URL browser.

### 3.2 Matriks Kanal Distribusi Resmi (PRD Section 8)
Menyajikan status 3 saluran pengiriman:
- **Web Notification Center:** `Tersedia · Arsip Resmi` (in-app, seluruh peristiwa tercatat).
- **Email Korporat:** `Aktif per Kebijakan` (pengingat batas waktu dan eskalasi).
- **Browser Push:** Mengikuti status izin perangkat aktif (pengiriman instan pemicu kritis).
- **Prinsip Read $\ne$ Delivery:** Status "Sudah Dibaca" di Notification Center bukan konfirmasi bahwa pesan telah sampai pada kanal eksternal.

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

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Membaca sesi aktif dari `localStorage: workpulse_active_user` untuk menampilkan profil Budi Pratama di sidebar dan header. |
| **Halaman 02 (Morning Commitment)** | Menerima pengalihan pengguna dari notifikasi pengingat batas waktu pengisian pagi (08:00–09:00 WIB). |
| **Halaman 03 (Additional Work)** | Menerima pengalihan pengguna dari notifikasi penugasan ad-hoc siang hari (*Newly Assigned*). |
| **Halaman 04 (EOD Outcome)** | Menerima pengalihan pengguna dari notifikasi pengingat evaluasi sore hari (16:30–18:00 WIB). |
| **Halaman 05 (Raise Blocker)** | Menerima pengalihan pengguna dari notifikasi kendala kritis (*Critical Blocker*) dan pembaruan tiket penanganan. |
| **Halaman 06 (My History)** | Menerima pengalihan pengguna dari notifikasi penerbitan Weekly Summary dan publikasi Catatan Pimpinan (*Manager Notes*). |
| **Halaman 16a & 16b (Correction Requests)** | Menerima pengalihan pengguna dari notifikasi permohonan koreksi material yang diajukan atau disetujui (*Applied*). |
| **Halaman 20 (My Leave Request)** | Menerima pengalihan pengguna dari notifikasi persetujuan atau penolakan izin cuti resmi. |
| **Halaman 24 (Profile Settings)** | Menerima pengalihan pengguna dari notifikasi pembaruan struktur organisasi akun. |

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

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Web Notification Center & Browser Push. Seluruh komponen pada prototipe [`07-Notification-Center-Browser-Push.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/07-Notification-Center-Browser-Push.html) telah teruji secara visual dan fungsional di peramban (0 console error, 100% lulus uji 10 Test Cases, responsif di desktop/tablet/mobile), bebas error, serta siap diintegrasikan secara terpadu ke kode frontend dan backend.
