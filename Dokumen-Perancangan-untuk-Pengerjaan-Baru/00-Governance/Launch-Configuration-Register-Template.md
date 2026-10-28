# Formulir Pengesahan Nilai Operasional Peluncuran (MVP Launch Configuration Register)
## WorkPulse — Daily Accountability & Blocker Log System Dutamedia

**Nomor Dokumen:** WP-REG-LAUNCH-001  
**Status Dokumen:** FORMULIR RESMI PENETAPAN KEBIJAKAN OPERASIONAL (`OPEN-04`, `DEC-011`)  
**Dasar Ketetapan:** PRD v1.6 Bagian 3.7 (*Policy Configuration*) & SAD v2.1.0 Lampiran B.1  
**Pemilik Kebijakan (*Policy Owner*):** **Direktur Dutamedia**  
**Target Pengesahan:** Sebelum UAT (`WP-EP11-TK005`) dan Gerbang Peluncuran Publik (Gate 5)  

---

### PANDUAN PENGISIAN UNTUK DIREKTUR DUTAMEDIA
1. Dokumen ini menetapkan batasan operasional resmi yang akan diberlakukan oleh sistem WorkPulse untuk seluruh staf Dutamedia.
2. Kolom **"Nilai Default Rekayasa"** adalah parameter ilustratif yang saat ini aktif selama masa pembangunan sistem (Fase P0–P5) dengan penanda `is_illustrative = TRUE`.
3. Direktur berhak mempertahankan nilai default tersebut atau menetapkan angka baru pada kolom **"Nilai Resmi Disahkan"** sesuai dengan kultur jam kerja dan tata kelola internal Dutamedia.
4. Nilai resmi yang telah disahkan akan dimasukkan ke dalam basis data sebagai konfigurasi ber-versi (`policies`), dan sistem akan mengubah penanda kesiapan menjadi `READY` untuk rilis publik.

---

### TABEL REGISTER PARAMETER KEBIJAKAN OPERASIONAL

| No | Kategori Kebijakan | Deskripsi Parameter | Nilai Default Rekayasa (Ilustratif) | Nilai Resmi Disahkan Direktur | Catatan / Aturan Batasan |
|---|---|---|---|---|---|
| **1** | **Zona Waktu** | Standar zona waktu rujukan organisasi | `Asia/Jakarta (WIB)` | [ ............................ ] | Wajib format IANA time zone valid |
| **2** | **Hari Kerja** | Hari kerja wajib partisipasi reguler | `Senin s/d Jumat` | [ ............................ ] | Hari Sabtu/Minggu otomatis dikecualikan |
| **3** | **Jam Layanan** | Jendela operasional sistem (`NFR-09`) | `07:00 – 19:00 WIB` | [ ............................ ] | Form submission aktif dalam jendela ini |
| **4** | **Morning Deadline** | Batas waktu tepat waktu komitmen pagi | `09:00 WIB` | [ ............................ ] | Pengisian $\le$ jam ini berstatus `ON_TIME` |
| **5** | **Morning Grace** | Masa tenggang pengisian pagi | `30 Menit` | [ ............................ ] | Pengisian s.d. 09:30 WIB berstatus `LATE` |
| **6** | **Morning Cutoff** | Batas akhir mutlak pengisian pagi | `09:30 WIB` (Deadline + Grace) | [ ............................ ] | Lewat dari jam ini ditolak (`NO_SUBMISSION`) |
| **7** | **EOD Deadline** | Batas waktu tepat waktu log progres sore | `18:00 WIB` | [ ............................ ] | Pengisian $\le$ jam ini berstatus `ON_TIME` |
| **8** | **EOD Grace** | Masa tenggang pengisian sore | `30 Menit` | [ ............................ ] | Pengisian s.d. 18:30 WIB berstatus `LATE` |
| **9** | **EOD Cutoff** | Batas akhir mutlak pengisian sore | `18:30 WIB` (Deadline + Grace) | [ ............................ ] | Lewat jam ini form terkunci |
| **10** | **Objection Window** | Durasi pengajuan keberatan koreksi Material | `24 Jam Kerja` | [ ............................ ] | Jika waktu habis tanpa sanggahan $\rightarrow$ auto-approved |
| **11** | **Coaching Window** | Rentang evaluasi kepatuhan 3x NoSub | `14 Hari Kalender` | [ ............................ ] | Kejadian 3x NoSub dalam rentang ini memicu coaching |
| **12** | **SLA Blocker Critical** | Batas respon awal tiket kendala Kritis | `4 Jam Kerja` | [ ............................ ] | Lewat dari batas waktu otomatis eskalasi ke Level 2 |
| **13** | **SLA Blocker Standard** | Batas respon awal tiket kendala Normal | `24 Jam Kerja` (1 hari) | [ ............................ ] | Eskalasi bertahap bila tidak di-acknowledge |
| **14** | **Token Undangan** | Masa berlaku tautan aktivasi akun baru | `72 Jam` (3 hari kalender) | [ ............................ ] | Melewati batas waktu token hangus (*Expired*) |
| **15** | **Retensi Audit** | Masa penyimpanan minimum data transaksi | `365 Hari` (1 tahun) | [ ............................ ] | Data log dan audit append-only tidak boleh dihapus |

---

### PENGESAHAN PENETAPAN KEBIJAKAN

Dengan menandatangani dokumen ini, seluruh nilai operasional di atas dinyatakan **Sah, Mengikat, dan Berlaku Resmi** sebagai konfigurasi produksi sistem WorkPulse Dutamedia.

Ditetapkan di : **Semarang**  
Pada tanggal  : ............................................ 2026  

<br><br>

**Mengesahkan,**  
**Direktur PT Dutamedia Mandiri Unggul**  

<br><br><br><br>

( .................................................................... )  
*Tanda Tangan & Nama Terang*  

---
*Salinan formulir ini setelah ditandatangani wajib diarsipkan ke dalam repository proyek pada folder `00-Governance/Signed-Registers/` sebelum Gate 5 Production Release.*

