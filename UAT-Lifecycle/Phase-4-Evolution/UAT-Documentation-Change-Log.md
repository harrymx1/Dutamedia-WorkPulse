# LOG PERUBAHAN DOKUMEN PAKET UAT (DOCUMENTATION CHANGE LOG)
## WorkPulse — Phase 4: UAT Package Impact Analysis & Evolution
**Dokumen Referensi:** `UAT-WP-DOC-CHG-LOG-001` (Rev 1.0)  
**Versi Rilis Paket UAT:** `v1.0.1-uat-pkg` $\longrightarrow$ `v1.1.0-uat-pkg` (Evolved Package)  
**Tanggal Penerbitan:** 04 November 2026  
**Penyusun:** Co-Pilot (Senior QA Engineer & UAT Architect)  
**Pemberi Mandat:** Harry (Acceptance Owner & Lead Manual UAT Tester)  
**Status Otorisasi:** READY FOR ACCEPTANCE OWNER SIGN-OFF  

---

## 1. IKHTISAR TRANSISI PAKET DOKUMEN UAT

Dalam rangka menyelaraskan paket dokumentasi pengujian manual pasca-pelaksanaan remediasi Phase 3 (Cycle 1 & Cycle 2) yang telah digabungkan ke branch `main`, paket dokumen pengujian UAT secara resmi ditingkatkan dari baseline **`v1.0.1-uat-pkg`** menjadi versi **`v1.1.0-uat-pkg`**.

Peningkatan ini mencerminkan eliminasi total 2 cacat fungsional (`DEF-001`, `DEF-002`) dan adopsi 44 perbaikan desain, copywriting, keamanan, serta konsistensi navigasi (`IMP-001` s.d. `IMP-044`).

---

## 2. INVENTARISASI PERUBAHAN BERKAS DOKUMEN

| No | Nama Berkas Dokumen | Jalur Berkas (*Path*) | Kategori Perubahan | Ringkasan Penyesuaian Utama |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `UAT-Manual-Test-Cases.md` | `UAT/` & Root `/` | Content & Steps Update | Penyelarasan langkah uji, URL kanonikal `/raise-blockers`, verifikasi form lock, timer lockout 15 menit, dan eliminasi kode internal. |
| 2 | `UAT-Requirement-Traceability-Matrix.csv` | `UAT/` | Traceability Update | Penegakan pemetaan anti-duplikasi `DEF-001` & `DEF-002`, pelaporan blocker 2-tab, dan standardisasi shell. |
| 3 | `UAT-Test-Data-Matrix.csv` | `UAT/` | Test Data Alignment | Penyelarasan data uji login gagal (5 attempt lockout), data pelaporan blocker mandiri, dan opsi alasan Lainnya. |
| 4 | `UAT-Execution-Checklist.md` | `UAT/` | Execution Checklist | Pembaruan panduan checkpoint pelaksanaan pasca-remediasi untuk persiapan Phase 5 dan Phase 7. |
| 5 | `UAT-Progress-Tracker.md` | `UAT/` | Governance Tracking | Pembaruan status eksekusi UAT: Phase 3 Completed, Phase 4 Completed, Phase 5 Ready to Enter. |
| 6 | `UAT-Phase-Register.csv` | `UAT-Lifecycle/00-Governance/` | Phase Status Update | Menandai `PHASE-3` sebagai Completed dan `PHASE-4` sebagai In Progress / Completed. |
| 7 | `UAT-Decision-Log.md` | `UAT-Lifecycle/00-Governance/` | Decision Ratification | Mencatat keputusan formal `DEC-010-UAT` (pengesahan penyelesaian Phase 3 dan pembukaan Phase 4). |

---

## 3. RINCIAN MODIFIKASI PER ELEMEN PENGUJIAN

### 3.1. Penyesuaian Langkah & Hasil yang Diharapkan (`UAT-Manual-Test-Cases.md`)
1. **`TC-AUTH-001`:** Menyelaraskan teks tagline hero login baru, 3 poin fitur dengan ikon SVG, headline login dua baris, badge `Internal Workspace Environment`, dan kebersihan footer sidebar tanpa kurung peran.
2. **`TC-AUTH-002`:** Menambahkan langkah uji ke-3 untuk memverifikasi penegakan proteksi brute-force: 5 kali kesalahan login berturut-turut memicu penguncian akun 15 menit dengan timer hitung mundur.
3. **`TC-AUTH-003`:** Menyelaraskan tampilan panel hero kiri aktivasi agar identik dengan halaman login.
4. **`TC-AUTH-005`:** Memperbarui rute tombol pemulihan layar 403 sesuai peran pengguna (`SYSTEM_ADMIN` ke `/admin/users`, `EMPLOYEE` ke `/daily/morning`).
5. **`TC-AUTH-007`:** Memperbarui struktur verifikasi profil mengikuti 3 seksi Prototipe 24 dan memvalidasi sanitasi gelar jabatan.
6. **`TC-DLYM-001` & `TC-DLYM-002`:** Menambahkan verifikasi tombol *Laporkan Blocker* di kanan workflow bar, format badge tanggal dinamis Indonesia, pembersihan kode `DEC-004`, dan narasi bisnis opsi komitmen nol.
7. **`TC-DLYM-003`:** Menambahkan verifikasi dua arah untuk membuktikan penguncian formulir persisten pasca-submit (**DEF-001**).
8. **`TC-DLYA-001` & `TC-DLYA-002`:** Memperbarui subtitle tanpa `Prototipe 03`, memverifikasi box containment form input, format badge alasan bisnis, dan kewajiban input teks keterangan jika alasan `Lainnya`.
9. **`TC-DLYE-001` & `TC-DLYE-002`:** Memperbarui tombol blocker langsung ke `/raise-blockers` tanpa modal mati, opsi evaluasi dalam bahasa bisnis (*Selesai*, *Sebagian*, *Belum Selesai*, *Dibatalkan*), tata letak full-width textarea catatan kelanjutan, refleksi mandiri humanis ber-badge *Penilaian Otonom Karyawan*, serta pembuktian penguncian EOD (**DEF-002**).
10. **`TC-BLKR-001` & `TC-BLKR-005`:** Menyelaraskan langkah uji dengan rute `/raise-blockers`, tombol kembali, 2 tab (*Buat Laporan* vs *Blocker Saya*), ketiadaan tombol manajerial bagi karyawan biasa, dan fixed full-width footer aksi.

---

## 4. LEMBAR PENGESAHAN (SIGN-OFF BLOCK)

Paket dokumen pengujian manual `v1.1.0-uat-pkg` dinyatakan telah selaras 100% dengan kondisi kode sumber terkini pada branch `main`.

| Peran | Nama | Jabatan | Tanggal | Tanda Tangan / Status |
| :--- | :--- | :--- | :---: | :---: |
| **Penyusun Teknis** | Co-Pilot | Senior QA Engineer & UAT Architect | 04/11/2026 | **VERIFIED (COMPLETED)** |
| **Acceptance Owner** | Harry | Lead Manual UAT Tester & Acceptance Owner | 04/11/2026 | **PENDING FORMAL APPROVAL** |

