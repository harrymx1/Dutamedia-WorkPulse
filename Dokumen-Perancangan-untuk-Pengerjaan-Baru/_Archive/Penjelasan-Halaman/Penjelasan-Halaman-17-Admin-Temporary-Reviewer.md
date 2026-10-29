# Penjelasan Halaman 17: Penunjukan Penelaah Sementara (Admin Temporary Reviewer)

Dokumen ini merupakan panduan spesifikasi fungsional, aturan bisnis, alur kerja operasional, dan peta implementasi ideal untuk **Halaman 17: Penunjukan Penelaah Sementara (*Admin Temporary Reviewer*)** pada sistem **WorkPulse** (`17-Admin-Temporary-Reviewer.html` / `/admin/temporary-reviewers`).

---

# BAGIAN 1: IDENTIFIKASI KEBUTUHAN, ALUR, ATURAN BISNIS, & USER STORY

## 1.1 Maksud, Filosofi & Tujuan Halaman 17
Dalam dinamika organisasi perkantoran, selalu ada kondisi di mana atasan langsung atau pejabat struktural berhalangan sementara (misal: cuti panjang, sakit, dinas luar kota, atau transisi posisi kosong / *vacant*). 

Jika tidak ada mekanisme delegasi wewenang yang sah:
1. **Penyumbatan Alur Eskalasi (*Workflow Deadlock*):** Tiket blocker tim tidak ada yang meng-*acknowledge*, permohonan koreksi material tertahan tanpa ada penelaah, dan permohonan cuti terbengkalai.
2. **Ketiadaan Akuntabilitas (*Accountability Void*):** Rekan sejawat mengambil keputusan tanpa mandat resmi, merusak catatan audit trail.

**Solusi WorkPulse (PRD FR-33, SAD §4.3):**
* Menyediakan fitur penunjukan **Penelaah Sementara (*Temporary Reviewer Delegations*)** dengan tanggal mulai dan tanggal berakhir efektif yang pasti (*effective-dated & bounded*).
* Menjaga hierarki dasar: Penunjukan sementara **tidak mengubah struktur organisasi induk ataupun atasan langsung tetap karyawan**. Delegasi hanya berlaku pada lingkup dan jangka waktu yang ditentukan secara eksplisit.
* Rekam jejak audit yang kekal: Siapa yang menunjuk, siapa yang ditunjuk, lingkup penugasan, dan dasar surat tugas/alasan operasional tercatat permanen.

---

## 1.2 Aktor & Matriks Hak Akses (RBAC)

| Peran (*Role*) | Hak Akses pada Halaman 17 | Wewenang & Batasan Operasional |
| :--- | :--- | :--- |
| **System Administrator** | **Pengelola Penuh (*Full Authority*)** | Menerbitkan penunjukan baru, memperbarui tanggal kedaluwarsa, atau membatalkan delegasi sebelum waktunya dengan justifikasi resmi. |
| **HRGA / People Admin** | **Pengelola Bersama (*Co-Manager*)** | Menerbitkan penunjukan reviewer sementara saat ada pejabat struktural cuti atau mutasi. |
| **CEO / Direksi** | **Pemantau Eksekutif (*Executive Viewer*)** | Memantau seluruh mandat delegasi aktif di lingkungan perusahaan. |
| **Karyawan Biasa / Staf** | **Ditolak (*No Access - 403 Forbidden*)** | Tidak memiliki akses ke halaman ini. |

---

## 1.3 Aturan Bisnis & Kriteria Penerimaan (Engine Rules & AC)

1. **Aturan Anti-Backdating (BR-14):**
   * Tanggal mulai delegasi wajib $\ge$ hari ini (`startDate >= today`). Dilarang keras menunjuk penelaah sementara untuk tanggal lampau.
2. **Batas Waktu Wajib (*Mandatory Expiry Date*):**
   * Penunjukan penelaah sementara **wajib memiliki tanggal berakhir (*endDate*)** yang lebih besar dari tanggal mulai. Tidak boleh *open-ended* tanpa batas.
3. **Pencegahan Siklus Delegasi (*Anti-Delegation Cycle*):**
   * Pengguna A tidak dapat mendelegasikan wewenang kepada Pengguna B jika Pengguna B sedang berstatus mendelegasikan wewenangnya kepada Pengguna A.
4. **Otoritas Lingkup yang Jelas (*Scope Bound*):**
   * Delegasi dapat dibatasi pada unit kerja tertentu (misal: *Technology Squad A*, *Quality Assurance*) atau spesifik pada jenis persetujuan tertentu.

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
│    - Breadcrumb: Administration / Temporary Reviewer                        │
│    - Quick CTA: [Kembali ke Struktur Organisasi]                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PANEL STATISTIK DELEGASI (3 Kartu Metrik):                               │
│    - Delegasi Aktif Hari Ini (Hijau)                                        │
│    - Delegasi Mendatang (Biru)                                              │
│    - Berakhir Pekan Ini (Amber)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. FORMULIR PENUNJUKAN REVIEWER SEMENTARA (Panel Kiri / Modal):             │
│    - Pejabat yang Berhalangan (Pilih User)                                  │
│    - Pengganti Sementara / Delegated Reviewer (Pilih User)                  │
│    - Rentang Tanggal Efektif: Mulai & Berakhir                              │
│    - Lingkup Divisi / Wewenang yang Didelegasikan                           │
│    - Catatan / Nomor Surat Tugas / Alasan Bisnis                            │
│    - Tombol: [Terbitkan Delegasi Resmi]                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. TABEL DAFTAR PENUNJUKAN AKTIF & RIWAYAT DELEGASI:                        │
│    - Kolom: Pejabat Asli, Reviewer Pengganti, Lingkup, Periode, Status, Aksi│
│    - Status Badge: Aktif (Hijau), Terjadwal (Biru), Selesai/Batal (Netral)  │
│    - Aksi: [Batalkan Mandat] dengan konfirmasi modal                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# BAGIAN 3: KASUS UJI KONTRAKTUAL (TC)

* **TC-17-01 (Penerbitan Valid):** Admin memilih Bambang (Tech Lead) berhalangan, mendelegasikan ke Aditya (Senior Dev) selama 5 hari kerja ke depan, submit $\rightarrow$ status `ACTIVE` terbit, audit trail mencatat penunjukan.
* **TC-17-02 (Validasi Tanggal Lampau):** Admin memilih tanggal mulai kemarin $\rightarrow$ Form memunculkan validasi *"Tanggal mulai tidak boleh di masa lampau"*.
* **TC-17-03 (Pembatalan Lebih Awal):** Admin mengklik *Batalkan Mandat* pada penunjukan aktif $\rightarrow$ Modal konfirmasi muncul meminta alasan pembatalan $\rightarrow$ Status berubah menjadi `REVOKED`.
