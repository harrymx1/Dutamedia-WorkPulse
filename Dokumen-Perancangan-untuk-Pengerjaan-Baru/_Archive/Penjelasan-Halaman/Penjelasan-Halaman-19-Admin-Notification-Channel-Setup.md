# Penjelasan Halaman 19: Pengaturan Kanal Notifikasi Sistem (Notification Channel Setup)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 19: Pengaturan Kanal Notifikasi Sistem (*Notification Channel Setup*)** pada sistem **WorkPulse** (`19-Admin-Notification-Channel-Setup.html` / `/admin/notifications`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 19
Sistem akuntabilitas dan eskalasi kendala hanya bisa berfungsi jika para pemangku kepentingan menerima sinyal tepat waktu tanpa gangguan (*noise*). 

Di **WorkPulse**, sistem notifikasi menganut prinsip **Multi-Channel Delivery dengan Prioritas Bertingkat (PRD FR-36 s.d. FR-39, SAD §4.5)**:
1. **Tiga Kanal Notifikasi Resmi:**
   * **Web Notification Center:** Pusat riwayat notifikasi in-system di Halaman 07 (selalu aktif sebagai arsip internal).
   * **Web Push Browser (VAPID):** Notifikasi desktop seketika saat peramban terbuka, berfungsi nyata di MVP tanpa bergantung pada tab aktif.
   * **Email Transaksional (Brevo SMTP):** Pengiriman pesan resmi ke inbox karyawan/atasan untuk pemicu berkepentingan tinggi (*high-priority*).
2. **Matriks Perutean Berbasis Peristiwa (*Event-Driven Routing Matrix*):**
   * Administrator dapat mengatur kanal mana yang aktif untuk setiap jenis peristiwa kerja (misal: Blocker Kritis wajib Email + Web Push; Pengingat EOD hanya Web Push + In-System).
3. **Penyelamatan Kegagalan (*Graceful Fallback*):**
   * Jika pengguna memblokir izin Web Push di perambannya, sistem otomatis menyalurkan notifikasi penting melalui Email tanpa membuat alur sistem terhenti.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

| Peran (*Role*) | Hak Akses pada Halaman 19 | Wewenang Operasional |
| :--- | :--- | :--- |
| **System Administrator** | **Pengelola Penuh (*Full Authority*)** | Mengonfigurasi kredensial SMTP Brevo, mengelola kunci publik VAPID Web Push, dan mengatur matriks perutean kanal. |
| **HRGA / People Admin** | **Peninjau & Uji Saluran (*Channel Tester*)** | Melakukan uji kirim pesan (*Test Ping*) dan meninjau log kesehatan pengiriman notifikasi. |
| **Karyawan / Peran Lain** | **Ditolak (*No Access - 403 Forbidden*)** | Mengatur preferensi pribadi di Halaman 07/24, tidak memiliki akses ke pengaturan server Halaman 19. |

---

# BAGIAN 2: ANATOMI ANTARMUKA & TATA LETAK KOMPONEN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BILAH SIMULASI PROTOTIPE: [Mode Simulasi Prototipe]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SHELL APLIKASI: SIDEBAR 232px (Kiri) & KONTEN UTAMA (Kanan)              │
│    - Sidebar: Brand WP, 3 Grup (Workspace, Management, Administration)      │
│    - Sidebar Footer: Avatar BP, Nama, Peran, Tombol Logout                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. TOPBAR RESMI:                                                            │
│    - Breadcrumb: Administration / Notification Setup                        │
│    - Status Server: [Kanal Notifikasi: 3/3 Terhubung Normal]                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. KARTU KESEHATAN KANAL PENGIRIMAN (3 Kartu Status):                       │
│    - Web Push Server (VAPID): Status Online, 28 Perangkat Terdaftar         │
│    - Email Gateway (Brevo SMTP): Status Terhubung, Kuota Harian Aman        │
│    - In-System Notification Queue: 0 Antrean Tertunda, Respon < 200ms       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. MATRIKS PERUTEAN PERISTIWA (Tabel Konfigurasi Pemicu Notifikasi):        │
│    - Baris 1: Blocker Baru Diterbitkan -> In-System [v] | Push [v] | Mail [v]│
│    - Baris 2: Eskalasi Melewati SLA    -> In-System [v] | Push [v] | Mail [v]│
│    - Baris 3: Pengajuan Cuti Mandiri   -> In-System [v] | Push [ ] | Mail [v]│
│    - Baris 4: Pengingat Komitmen Pagi  -> In-System [v] | Push [v] | Mail [ ]│
│    - Baris 5: Pengingat Evaluasi Sore  -> In-System [v] | Push [v] | Mail [ ]│
│    - Baris 6: Objection Koreksi        -> In-System [v] | Push [v] | Mail [v]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. PANEL UJI PENGIRIMAN (Test Ping Console):                                │
│    - Kirim pesan diagnostik instan untuk menguji latensi dan integritas VAPID│
│    - Tombol: [Kirim Test Ping Diagnostik]                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-19-01 (Uji Diagnostik Web Push):** Admin menekan tombol *Test Ping* $\rightarrow$ Browser memunculkan notifikasi sistem operasi nyata dalam waktu < 2 detik.
* **TC-19-02 (Perubahan Matriks Perutean):** Admin mengaktifkan kanal Email untuk Pengingat Komitmen Pagi $\rightarrow$ Sistem menyimpan konfigurasi dengan pesan sukses dan mencatat audit perubahannya.
