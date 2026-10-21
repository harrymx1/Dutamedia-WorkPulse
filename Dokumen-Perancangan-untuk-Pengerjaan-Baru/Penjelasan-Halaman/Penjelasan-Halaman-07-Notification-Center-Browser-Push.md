# DOKUMEN SPESIFIKASI & PENJELASAN TEKNIS UI-UX
## HALAMAN 07: WEB NOTIFICATION CENTER & BROWSER PUSH

- **Berkas Prototipe:** [`07-Notification-Center-Browser-Push.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/07-Notification-Center-Browser-Push.html)
- **Rute Sistem:** `/notifications`
- **Posisi Alur:** Pusat Komunikasi, Pemantauan Pembaruan & Distribusi Notifikasi (*Notification & Communication Hub*)
- **Dokumen Terkait:** [Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/Pedoman-Konsistensi-Desain-dan-Perilaku-Lintas-Halaman.md), [02-PRD.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/02-PRD.md), [03-UI-UX-Spec-Flow.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/03-UI-UX-Spec-Flow.md), [04-Design-System.md](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/04-Design-System.md)

---

## 1. IKHTISAR, TUJUAN & FILOSOFI DESAIN

### 1.1 Fungsi Utama Halaman
1. **Pusat Notifikasi Terpadu In-System (PRD FR-38):** Menjadi wadah arsip terpusat bagi seluruh pembaruan operasional, eskalasi risiko, permohonan bantuan, persetujuan cuti, keputusan koreksi, dan pengingat jadwal kerja harian.
2. **Mandat Pengiriman Nyata MVP (*Real MVP Delivery*):** Mendukung pengiriman notifikasi nyata melalui **Browser Push** untuk pemicu-pemicu yang telah ditetapkan dalam PRD Section 8, bukan sekadar *mock/stub*.
3. **Pemisahan Tegas Status Dibaca vs Bukti Pengiriman (*Read $\ne$ Delivery*):** Menegaskan bahwa penandaan "Sudah Dibaca" di aplikasi murni status antarmuka dan tidak boleh disamakan dengan bukti pengiriman (*delivery confirmation*) pada kanal Email maupun Browser Push.
4. **Pemberian Izin Sadar Pengguna (*Explicit Opt-In*):** Permintaan izin browser push hanya dipicu oleh aksi eksplisit pengguna tanpa memblokir alur operasional utama saat izin ditolak atau tidak didukung.

### 1.2 Batasan Desain Baku
- **Nol Emoticon & Ikon Monokrom:** Seluruh visual menggunakan tipografi korporat dan inline SVG monokrom (`stroke-width="1.8-2.2"`).
- **Sidebar Workspace Resmi:** Mengintegrasikan menu *My Today*, *My Blockers* (ikon bendera + badge `2`), *My History*, *My Leave*, dan *Notifications* (aktif) dengan pembacaan profil dinamis *Budi Pratama* (`workpulse_active_user`).
- **Fluid Layout Seimbang:** Padding simetris `clamp(1.5rem, 4vw, 3.75rem)` tanpa satuan statis kaku, sejajar lurus dengan Halaman 02 s.d. 06.
- **100% Otentik Hasil Produksi:** Bersih mutlak dari elemen demo uji coba (*pure production-authentic*).

---

## 2. ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR:                                                                          │
│ [☰ Hamburger Mobile]  Breadcrumb: Workspace / Notifications                      │
│ [Lonceng Notifikasi + Dot Indikator Dinamis]   [Avatar Profil (BP)]              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. PAGE HEADING:                                                                 │
│    - Kicker: PUSAT KOMUNIKASI & PEMBARUAN                                        │
│    - Judul H1: Web Notification Center                                           │
│    - Subteks: Pantau pembaruan komitmen kerja, tindak lanjut blocker, status...  │
│    - Sisi Kanan: Badge Belum Dibaca [ ● 3 belum dibaca ] + [ Tandai Semua Dibaca]│
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. METRIC SUMMARY STRIP (Grid 3-Kolom):                                          │
│    ┌────────────────────────┐ ┌────────────────────────┐ ┌─────────────────────┐ │
│    │ Total Notifikasi       │ │ Belum Dibaca           │ │ Browser Push        │ │
│    │ 8                      │ │ 3                      │ │ Izin Aktif / Belum  │ │
│    │ Tercatat dalam riwayat │ │ Perlu peninjauan/aksi  │ │ Status pada browser │ │
│    └────────────────────────┘ └────────────────────────┘ └─────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. TOP GRID (Grid 2-Kolom):                                                      │
│    ┌───────────────────────────────────┐ ┌─────────────────────────────────────┐ │
│    │ KARTU 1: PREFERENSI PERANGKAT     │ │ KARTU 2: STATUS KANAL DISTRIBUSI    │ │
│    │ (Browser Push Permission Control) │ │ (Notification Channel Matrix PRD §8)│ │
│    │ - Badge State: [ Izin Aktif / ..] │ │ - Baris 1: Web Notification Center  │ │
│    │ - Ikon Lingkaran Lonceng SVG      │ │            [ Tersedia · Arsip Resmi]│ │
│    │ - Judul & Penjelasan Hak Akses    │ │ - Baris 2: Email Korporat           │ │
│    │ - Notice Box Edukatif 4-Varian    │ │            [ Aktif per Kebijakan ]  │ │
│    │ - Tombol: [Aktifkan Browser Push] │ │ - Baris 3: Browser Push             │ │
│    │   & [Periksa Status]              │ │            [ Status Izin Perangkat ]│ │
│    │ - Subtitle: Izin berlaku per gawai│ │ - Maklumat: Read status ≠ Delivery  │ │
│    └───────────────────────────────────┘ └─────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL UTAMA: SEMUA NOTIFIKASI (FEED & ARSIP IN-APP):                          │
│    - Header Panel: Judul "Semua Riwayat Notifikasi", Tombol Cepat Tandai Dibaca  │
│    - Toolbar Filter & Pencarian:                                                 │
│      • Tab Status: [ Semua (8) ]   [ Belum Dibaca (3) ]   [ Sudah Dibaca (5) ]   │
│      • Input Live Search: Pencarian real-time (judul, deskripsi, ID tiket)       │
│      • Dropdown Jenis: Semua / Blocker / Dukungan / Koreksi / Pengingat / Sistem │
│    - Feed Notifikasi (Notification Items):                                       │
│      • Ikon SVG Kategori Tematik (Merah/Risiko, Amber/Dukungan, Biru/Koreksi)    │
│      • Dot Indikator Belum Dibaca (Hijau Botol)                                  │
│      • Judul & Narasi Ringkas                                                    │
│      • Mini-Tag Semantik & Timestamp ISO Humanis                                 │
│      • Aksi Kartu: [ Lihat Detail → ] & [ Toggle Status Dibaca (SVG) ]           │
│    - Empty State Box: Ikon pencarian SVG, teks ramah, dan petunjuk filter       │
│    - Footer Panel: Counter hasil pencarian & maklumat otorisasi akun             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 5. MODAL DETAIL NOTIFIKASI & DEEP LINK RESOLVER:                                 │
│    - Dialog terisolasi dengan backdrop blur                                      │
│    - Rincian lengkap: Judul, Deskripsi, Metadata Dokumen, Waktu Lapor            │
│    - Tombol Aksi: [ Tutup ] & [ Buka Konteks Terkait > ]                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 6. CONTEXTUAL TOAST ENGINE: Notifikasi feedback sudut kanan bawah                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI ATURAN BISNIS & PERILAKU SISTEM (*ENGINE RULES*)

### 3.1 Pembedaan Status Dibaca vs Status Pengiriman (*Read $\ne$ Delivery*)
- Sesuai amanat **PRD FR-38** dan **UI/UX Spec §4.7**, penandaan status *Sudah Dibaca* di aplikasi murni mengubah status internal notifikasi (`isRead = true`).
- Status ini **DILARANG** diklaim atau disamakan sebagai bukti pengiriman (*delivery confirmation*) pada kanal Email maupun Browser Push.
- Maklumat tata kelola resmi selalu disematkan pada dasar panel kanal untuk menjaga integritas informasi.

### 3.2 Engine Kontrol Izin Browser Push (4 State Baku)
Sistem mengevaluasi status Web Notifications API secara *real-time*:
1. **`Unsupported`**: Platform/browser tidak mendukung API `Notification`. Tombol push dinonaktifkan (`disabled`), badge *Tidak Didukung* (amber), dan pengguna diedukasi untuk menggunakan Web Notification Center serta Email.
2. **`Default / Prompt`**: Browser mendukung namun izin belum pernah diminta. Badge *Belum Diaktifkan* (netral), tombol *Aktifkan Browser Push* siap diklik, dan notice menjelaskan bahwa izin hanya diminta atas tindakan sadar pengguna.
3. **`Granted`**: Pengguna telah memberikan izin pada peramban ini. Badge *Izin Aktif* (hijau), tombol *Izin Sudah Aktif* (`disabled`), notice hijau sukses tampil.
4. **`Denied / Blocked`**: Pengguna memblokir izin notifikasi pada level browser. Badge *Izin Diblokir* (merah), notice edukatif menjelaskan bahwa aplikasi tidak dapat mengubah izin browser secara sepihak dan memandu pengguna membuka ikon gembok URL browser.

### 3.3 Penolakan Izin Bersifat Non-Blocking
- Jika pengguna menolak izin push atau memblokirnya, sistem **DILARANG KERAS** memblokir alur operasional apa pun. Karyawan tetap dapat check-in, melapor blocker, melihat histori, dan menggunakan Notification Center secara bebas.

### 3.4 Matriks Distribusi Multi-Kanal (PRD Section 8)
Sistem mencatat notifikasi secara otomatis berdasarkan taksonomi pemicu:
- **Blocker Kritis / Instant Blocker:** Email + Browser Push + Web Notification Center.
- **AMBER + Kebutuhan Bantuan:** Email + Browser Push + Web Notification Center.
- **EOD / Morning Reminder Cutoff:** Email + Browser Push + Web Notification Center.
- **Koreksi Applied / Rejected:** Web Notification Center.
- **Perubahan Kebijakan / Organisasi:** Web Notification Center.
- **Permohonan Cuti:** Email + Browser Push (Pengajuan) / Email + Web Notification Center (Keputusan).

### 3.5 Deep Link Resolver Antar-Halaman
Setiap notifikasi memiliki target rute kontekstual (`targetRoute`) yang menyelesaikan navigasi secara tepat:
- Notifikasi Blocker $\rightarrow$ `05-Raise-Instant-Blocker.html#my-blockers`.
- Notifikasi Morning Commitment $\rightarrow$ `02-Morning-Commitment.html`.
- Notifikasi Additional Work $\rightarrow$ `03-Additional-Work.html`.
- Notifikasi EOD Outcome $\rightarrow$ `04-EOD-Outcome.html`.
- Notifikasi Weekly Summary / Histori $\rightarrow$ `06-My-History-Weekly-Summary.html`.
- Notifikasi Koreksi $\rightarrow$ `16a-Morning-Correction-Request.html` / `16b-EOD-Correction-Request.html`.
- Notifikasi Cuti $\rightarrow$ `20-My Leave Request (Employee).html`.
- Notifikasi Profil/Organisasi $\rightarrow$ `24-Profile-Settings.html`.

---

## 4. KATALOG SKENARIO PENGUJIAN SISTEM (*TEST CASES*)

| ID | Skenario Pengujian | Kondisi Masukan (*Input State*) | Respons Sistem & Efek Visual |
| :---: | :--- | :--- | :--- |
| **TC-01** | Pemuatan Awal Halaman | Halaman dibuka | Counter unread = 3, dot lonceng topbar menyala, 8 kartu ter-render dengan rapi, status izin browser diperiksa. |
| **TC-02** | Filter Tab: Belum Dibaca | Klik tab `Belum dibaca (3)` | Tepat 3 kartu unread tampil (latar hijau lembut halus dengan dot unread). Kartu read disembunyikan. |
| **TC-03** | Filter Tab: Sudah Dibaca | Klik tab `Sudah dibaca (5)` | Tepat 5 kartu berstatus dibaca tampil. Dot unread tidak ada pada kartu. |
| **TC-04** | Filter Dropdown: Blocker | Pilih opsi "Blocker & risiko" | Menampilkan 2 kartu blocker (BLK-0042 dan BLK-0031). Kategori lain disembunyikan. Counter hasil menampilkan "Menampilkan 2 notifikasi". |
| **TC-05** | Live Search Kata Kunci | Ketik "Blocker" di kotak pencarian | Menampilkan kartu yang memuat kata Blocker secara real-time. |
| **TC-06** | Tandai Semua Dibaca | Klik tombol [Tandai semua dibaca] | Seluruh kartu beralih ke status read, counter unread = 0, dot lonceng topbar padam, tombol tandai semua disabled, toast sukses hijau muncul. |
| **TC-07** | Toggle Baca/Belum Per Kartu | Klik tombol aksi centang/putar per kartu | Status kartu beralih instan antara read $\leftrightarrow$ unread, counter header & sidebar tersinkronisasi otomatis. |
| **TC-08** | Buka Modal Detail Notifikasi | Klik [Lihat Detail →] pada kartu | Modal pop-up muncul di tengah dengan backdrop blur, menampilkan rincian kendala/tugas dan tombol "Buka Konteks Terkait". |
| **TC-09** | Deep Link Konteks Blocker | Klik [Buka Konteks Terkait] di modal blocker | Modal tertutup, pengguna diarahkan ke rute `05-Raise-Instant-Blocker.html#my-blockers` dengan toast panduan. |
| **TC-10** | Interaksi Browser Push Engine | Klik tombol [Aktifkan Browser Push] | Sistem memicu `Notification.requestPermission()`. Jika disetujui, UI berubah seketika ke state *Izin Aktif* (badge hijau) dan toast sukses muncul. |

---

## 5. HUBUNGAN LINTAS HALAMAN (*CROSS-PAGE CONTRACTS*)

| Halaman Terkait | Sifat Keterhubungan (*Contractual Relationship*) |
| :--- | :--- |
| **Halaman 01 (Login)** | Membaca sesi aktif pengguna dari `localStorage: workpulse_active_user` untuk mengidentifikasi kepemilikan notifikasi. |
| **Halaman 02 (Morning Commitment)** | Menerima navigasi pengingat check-in pagi atau notifikasi tugas carry-over. |
| **Halaman 03 (Additional Work)** | Menjadi tujuan navigasi notifikasi tugas tambahan mendadak. |
| **Halaman 04 (EOD Outcome)** | Menerima navigasi pengingat check-out evaluasi sore (16:30–18:00 WIB). |
| **Halaman 05 (Raise Blocker)** | Menerima deep-link dari notifikasi tiket kendala kritis atau pembaruan status blocker (`#my-blockers`). |
| **Halaman 06 (My History)** | Menerima deep-link saat Weekly Summary atau Catatan Pimpinan telah terbit. |
| **Halaman 10 (Manager Notes)** | Catatan pimpinan yang dipublikasikan atasan memicu entri notifikasi apresiasi/bimbingan di Notification Center ini. |
| **Halaman 16a & 16b (Correction Requests)** | Menerima deep-link pemantauan status permohonan koreksi baseline yang diajukan atau disetujui. |
| **Halaman 19 (Admin Notification Channel)** | Konfigurasi matriks saluran di Halaman 19 menjadi acuan jalur distribusi notifikasi ke Halaman 07 ini. |
| **Halaman 20 (Leave Request)** | Menerima deep-link notifikasi persetujuan atau penolakan cuti karyawan. |

---

## 6. KONTRAK DATA & SPESIFIKASI INTEGRASI API (FRONTEND-BACKEND)

### 6.1 DTO TypeScript Notifikasi
```typescript
export interface NotificationItemDto {
  id: string;
  type: 'blocker' | 'support' | 'review' | 'system' | 'reminder';
  title: string;
  description: string;
  contextRoute: string; // Tautan tujuan deep-link
  contextLabel: string;
  createdAt: string;    // ISO 8601 DateTime
  isRead: boolean;
  priorityTone: 'red' | 'amber' | 'blue' | 'green' | 'neutral';
  tagLabel: string;
}

export interface NotificationCenterResponseDto {
  unreadCount: number;
  totalCount: number;
  notifications: NotificationItemDto[];
}
```

### 6.2 Endpoint REST API Backend

#### 1. GET `/api/v1/notifications`
- **Fungsi:** Mengambil daftar seluruh riwayat notifikasi pengguna aktif beserta status baca.
- **Query Params:** `filter=all|unread|read`, `type=all|blocker|support|review|reminder|system`, `search`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3,
    "totalCount": 8,
    "notifications": [
      {
        "id": "notif-001",
        "type": "blocker",
        "title": "Kendala Kritis BLK-2026-0042 Membutuhkan Tindak Lanjut",
        "description": "Kendala teknis Akses staging database timeout masih berstatus Open.",
        "contextRoute": "05-Raise-Instant-Blocker.html#my-blockers",
        "contextLabel": "Raise Instant Blocker · #BLK-2026-0042",
        "createdAt": "2026-10-14T09:12:00+07:00",
        "isRead": false,
        "priorityTone": "red",
        "tagLabel": "Critical Blocker"
      }
    ]
  }
}
```

#### 2. PUT `/api/v1/notifications/{id}/read`
- **Fungsi:** Memperbarui status baca notifikasi tunggal (`isRead: true/false`).

#### 3. POST `/api/v1/notifications/mark-all-read`
- **Fungsi:** Menandai seluruh notifikasi pengguna aktif sebagai telah dibaca secara massal.

#### 4. POST `/api/v1/notifications/push/subscribe`
- **Fungsi:** Mendaftarkan payload `PushSubscription` peramban klien ke backend untuk pengiriman Web Push nyata.

---

## 7. STATUS KESIAPAN & PANDUAN IMPLEMENTASI

Dokumen ini adalah **acuan resmi tunggal (*Single Source of Truth*)** untuk implementasi modul Web Notification Center & Browser Push. Seluruh komponen pada prototipe [`07-Notification-Center-Browser-Push.html`](file:///d:/PKL%20Duta%20Media/Dutamedia-WorkPulse/Dokumen-Perancangan-untuk-Pengerjaan-Baru/UI-UX-Design/07-Notification-Center-Browser-Push.html) telah teruji secara visual dan fungsional di peramban (0 console error), bebas emoji, responsif di seluruh breakpoint layar, dan siap diimplementasikan secara terpadu ke frontend dan backend.
