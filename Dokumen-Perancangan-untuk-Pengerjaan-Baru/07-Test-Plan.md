# Test Plan — WorkPulse

**Versi:** 1.2 (Terekonsiliasi Penuh DEC-011..013, Resolusi Temuan Audit Independen, Keterlacakan 100% 73 FR & 12 NFR)  
**Tanggal:** 28 Oktober 2026  
**Acuan:** `05-SAD.md` v2.1.0 (termasuk Lampiran A & B), `02-PRD.md` v1.6, `03-UI-UX-Spec-Flow.md` v2.0.0, `04-Design-System.md` v1.5.0, 26 prototipe HTML kanonikal, `DEC-001..013`, `06-Product-Backlog.md` v1.2.

> **Status seluruh isi dokumen ini: PERENCANAAN.** Belum ada satu pun tes yang dijalankan pada kode implementasi bersih; tidak ada hasil aktual. Kolom "Status" seluruhnya `PLANNED`. Dokumen ini tidak boleh dikutip sebagai bukti kelulusan pengujian riil sebelum fase eksekusi berjalan.

---

## 1. Pemisahan Jenis Informasi
| Jenis | Isi |
|---|---|
| Fakta terdokumentasi | Aturan bisnis dari DEC-002..013, PRD v1.6 (FR-01..73, NFR-01..12), dan SAD v2.1.0 (DDL, triggers, outbox) |
| Analisis | Penilaian risiko (R1..R8), pemetaan kasus uji per kategori, prioritas eksekusi (P1/P2/P3) |
| Rekomendasi | Tooling pengujian (Vitest, Playwright), ambang rekayasa internal P95 (transaksional ≤200ms, agregasi ≤500ms) |
| Perlu persetujuan | Pengesahan nilai produksi resmi oleh Direktur (`OPEN-04`, `DEC-011`) sebelum rilis publik (Gate 5) |

---

## 2. Ruang Lingkup
**In-Scope Pilot MVP:** Seluruh Epic EP01–EP11 backlog (fondasi, autentikasi, organisasi, policy engine, komitmen harian, blocker & eskalasi, koreksi & cuti, kepatuhan & manager note, notifikasi outbox, pulse dashboard, hardening).  
**Deferred Post-Pilot (Fase 1.5):** Epic EP12 — Individual Review Evidence & Rating kualitatif (`FR-56..59`, `DEC-012`).  
**Out-of-Scope:** SSO pihak ketiga, mobile native apps (iOS/Android murni), arsitektur multi-tenant (SAD I.2.2).

---

## 3. Status Isu Spesifikasi & Rekonsiliasi Testability
| ID | Deskripsi Isu | Status Rekonsiliasi | Resolusi Teknis untuk Pengujian |
|---|---|---|---|
| **TP-GAP-01** | Pengesahan Launch Configuration Register (`OPEN-04`, `DEC-011`) | **TERTAMPUNG PARAMETRIK & ILUSTRATIF** | Pengujian logika waktu (cutoff, grace, SLA) dieksekusi menggunakan nilai ilustratif bertanda `is_illustrative = TRUE`. Rilis publik diblokir bila register belum disahkan Direktur. |
| **TP-GAP-02** | Target Availability & Performa | **DISELARASKAN DENGAN PRD** | Ketersediaan diuji terhadap ambang PRD NFR-04 ($\ge 99\%$ uptime per bulan). Waktu respons diuji terhadap PRD NFR-03 ($< 2$ detik pada 50 user), dengan ambang P95 rekayasa $\le 200\text{ ms}$ (transaksional) dan $\le 500\text{ ms}$ (agregasi). |
| **TP-GAP-03** | Inkonsistensi target 99.5% vs 99% | **SELESAI (RESOLVED)** | Target ketersediaan dibakukan pada 99% sesuai PRD NFR-04. |
| **TP-GAP-04** | Skema tabel bukti investigasi `evidence_attachments` | **SELESAI (RESOLVED)** | DDL lengkap beserta status `PENDING_UPLOAD`, `UPLOADED`, `LINKED`, `REJECTED` dan batasan ukuran $\le 10\text{ MB}$ disahkan di `05-SAD.md` Lampiran A.2. |
| **TP-GAP-05** | Definisi presisi "hari kerja sebelumnya" (FR-11, DEC-013) | **SELESAI (RESOLVED)** | Didefinisikan sebagai hari kerja kalender aktif terakhir yang bukan hari libur/cuti. Bila hari itu No Submission, draft copy-forward bernilai kosong (SAD Lampiran B.2). |
| **TP-GAP-06** | Definisi presisi carry-over berulang $\ge 2$ hari (DEC-003/013) | **SELESAI (RESOLVED)** | Dilacak melalui rantai relasional `origin_commitment_id` dan penambahan counter `carry_over_days_count = parent + 1`. Nilai $\ge 2$ merekomendasikan min AMBER di EOD (AC-38). |
| **TP-GAP-07** | Filter proyek pada komitmen harian vs blocker (FR-37, DEC-013) | **SELESAI (RESOLVED)** | Komitmen harian bebas dari kolom proyek. Filter proyek diterapkan pada Blocker tickets dan Project Authority View (SAD Lampiran B.3). |
| **TP-GAP-08** | Penundaan FR-56..59 pasca-pilot (GAP-A, DEC-012) | **SELESAI (RESOLVED)** | Diuji via negative test: menu/API review tidak aktif di build MVP, larangan mutlak auto-rating / auto-scoring (FR-60..62). |

---

## 4. Strategi & Piramida Pengujian
| Level | Alat (Standar Industri) | Target Cakupan |
|---|---|---|
| **Unit** | Vitest | $\ge 80\%$ cakupan logika domain, kalkulator status, dan heuristik |
| **Integration** | Vitest + PostgreSQL test container | 100% endpoint katalog & transaksi ACID DB |
| **Kontrak API** | Supertest + JSON Schema validation | 100% keselarasan response envelope & error catalog SAD IV |
| **E2E UI** | Playwright | Skenario kritis lintas alur (Morning → Blocker → EOD → Koreksi) |
| **Non-Fungsional** | k6 (load test), OWASP ZAP (keamanan), axe-core (a11y) | P95 latency, zero vulnerability High/Critical, WCAG 2.1 AA |
| **Eksplorasi** | Sesi terjadwal manual per fase | Verifikasi visual 26 prototipe HTML kanonikal |

---

## 5. Pendekatan Berbasis Risiko
| Risiko | Kemungkinan | Dampak | Prioritas | Fokus Uji |
|---|---|---|---|---|
| **R1** Kebocoran data lintas-scope | Sedang | Tinggi | P1 | Matriks otorisasi ScopeResolverService & guard data |
| **R2** Cutoff keliru / penulisan pasca-cutoff | Sedang | Tinggi | P1 | Batas waktu deteksi server-side, clock injection |
| **R3** Manipulasi data audit / backdating | Rendah | Tinggi | P1 | Append-only trigger, larangan backdating DDL |
| **R4** Kondisi balapan (race condition) | Sedang | Sedang | P2 | Concurrency SELECT FOR UPDATE pada tiket blocker |
| **R5** Pelanggaran integritas cuti retroaktif | Sedang | Sedang | P2 | Transaksi pembatalan kepatuhan append-only `DEC-007` |
| **R6** Notifikasi ganda / starvasi batch | Sedang | Sedang | P2 | Outbox idempotency & kueri anti-starvasi `NOT EXISTS` |
| **R7** Kegagalan pemulihan data bencana | Rendah | Tinggi | P1 | Streaming backup drill & verifikasi restore DB |
| **R8** Deviasi visual & aksesibilitas UI | Tinggi | Rendah-Sedang | P3 | Audit kesesuaian 26 prototipe HTML & token CSS |

---

## 6. Kasus Uji Komprehensif (Deterministik & Terstruktur)

### 6.1. Timing, Cutoff & Jam Kerja (DEC-002, FR-05, FR-26)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-TIM-01 | Submit Morning Check-in tepat pada waktu = On-Time Deadline (D) | Status timing tercatat `ON_TIME` | DEC-002, FR-05 | P1 | PLANNED |
| TC-TIM-02 | Submit Morning Check-in pada D + 1 detik | Status timing tercatat `LATE` (Grace Period) | DEC-002, FR-05 | P1 | PLANNED |
| TC-TIM-03 | Submit Morning Check-in tepat pada waktu Cut-off (C = D + Grace) | Status timing tercatat `LATE` | DEC-002, FR-05 | P1 | PLANNED |
| TC-TIM-04 | Submit Morning Check-in pada C + 1 detik | Ditolak 422 `BUSINESS_RULE_CUTOFF_LOCKED`; tidak ada record tertulis | DEC-002, FR-26 | P1 | PLANNED |
| TC-TIM-05 | Konfigurasi kebijakan Grace Period = 0 menit | D = C; submit pada D + 1 detik langsung ditolak (0 valid) | ADR-018, DEC-002 | P1 | PLANNED |
| TC-TIM-06 | Manipulasi jam klien browser dimajukan/dimundurkan | Evaluasi timing mutlak menggunakan jam server terotorisasi | SAD IV, NFR-05 | P1 | PLANNED |
| TC-TIM-07 | Request dikirim sebelum C, diproses backend setelah C | Ditolak dalam transaksi atomik dengan re-check waktu server | SAD III.5, R2 | P2 | PLANNED |
| TC-TIM-08 | Karyawan tidak submit hingga jam Cutoff terlampaui | Worker otomatis menandai `NO_SUBMISSION` (idempoten 1x/hari) | DEC-002, FR-26 | P1 | PLANNED |

### 6.2. Komitmen Harian & EOD Outcome (DEC-003, DEC-004, DEC-009, DEC-013, FR-03, 04, 06..14, 51, 52, 63)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-COM-01 | Pengguna mencoba submit 4 komitmen harian | Ditolak oleh validasi UI dan backend (batas maksimum 3) | FR-03, PRD | P1 | PLANNED |
| TC-COM-02 | Submit 0 komitmen tanpa menyertakan alasan (*zero commitment*) | Ditolak 422; pesan error alasan wajib disertakan | FR-03, DEC-004 | P1 | PLANNED |
| TC-COM-03 | Submit 0 komitmen dengan alasan valid | Diterima; Initial Daily Status = `NOT_APPLICABLE_NO_COMMITMENT` | FR-51, DEC-004 | P1 | PLANNED |
| TC-COM-04 | Komitmen berisiko AMBER atau RED tanpa Known Blocker Note | Ditolak oleh API dan Check Constraint database | FR-04, SAD II.3 | P1 | PLANNED |
| TC-COM-05 | Salin komitmen hari kerja sebelumnya (FR-11): 2 item Continue, 1 Do Not Continue | Form pagi memuat tepat 2 draft eligible; item Do Not Continue diabaikan | FR-11, AC-23 | P1 | PLANNED |
| TC-COM-06 | EOD status suggestion: item carry-over $\ge 2$ hari, pengguna override ke GREEN | Modal konfirmasi muncul; tombol GREEN tidak pernah ter-disable; audit tercatat | FR-13, DEC-003 | P1 | PLANNED |
| TC-COM-07 | Outcome Partial/Not Completed + Continuation Continue tanpa alasan | Ditolak 422; Continuation Reason wajib diisi terlepas dari outcome | FR-09, SAD B.5 | P1 | PLANNED |
| TC-COM-08 | Outcome Cancelled tanpa Outcome Reason | Ditolak 422; Check Constraint DB `chk_cancelled_outcome_reason` aktif | FR-08, SAD II.3 | P1 | PLANNED |
| TC-COM-09 | Placeholder visual komitmen sesuai 10 fungsi kanonikal Dutamedia | Teks tampil miring (*italic*); input kosong tidak mengirim placeholder ke DB | DEC-009, FR-12 | P2 | PLANNED |
| TC-COM-10 | Input Tomorrow Priority (FR-52) pada EOD Check-in | Tersimpan terpisah; tampil pada pagi berikutnya tanpa memengaruhi draft FR-11 | FR-52, BR-20 | P2 | PLANNED |
| TC-COM-11 | Input komitmen generik ("meeting", "development", "follow-up") | Quality warning non-blocking muncul; submit tetap sah (tanpa auto-penalti) | FR-63, GAP-B | P2 | PLANNED |
| TC-COM-12 | Pencatatan Additional Work di siang hari (FR-06, FR-07) | Tersimpan pada tabel `additional_works`; tidak mencemari 3 komitmen pagi | FR-06, FR-07 | P2 | PLANNED |
| TC-COM-13 | Pelacakan rantai carry-over ID dan counter (DEC-013, SAD B.2) | `origin_commitment_id` tertaut; counter hari bertambah +1 secara deterministik | DEC-013, SAD B.2 | P1 | PLANNED |
| TC-COM-14 | Final Status AMBER/RED wajib penjelasan tingkat-hari (FR-10, SAD B.5) | EOD submit AMBER/RED tanpa penjelasan ditolak 422; DB constraint aktif | FR-10, SAD B.5 | P1 | PLANNED |

### 6.3. Autentikasi, Scope & Otorisasi Pengguna (R1, NFR-05, FR-01, 22, 36, 50, 54)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-AUT-01 | Karyawan biasa mencoba GET rekaman akuntabilitas karyawan lain | Ditolak 403 atau 404 (tidak membocorkan keberadaan record) | FR-36, SAD IV.4 | P1 | PLANNED |
| TC-AUT-02 | Supervisor mengakses data bawahan langsung vs karyawan tim lain | Data bawahan tampil; akses tim lain ditolak `AUTH_FORBIDDEN_SCOPE` | FR-36, SAD IV.4 | P1 | PLANNED |
| TC-AUT-03 | Head fungsi Engineering mengakses data fungsi Quality | Ditolak `AUTH_FORBIDDEN_SCOPE` (isolasi hierarki fungsi kanonikal) | DEC-009, SAD IV.4 | P1 | PLANNED |
| TC-AUT-04 | Reviewer sementara mengakses data di luar jendela waktu penugasan | Akses ditolak; pendelegasian kedaluwarsa | FR-25, SAD II.3 | P1 | PLANNED |
| TC-AUT-05 | Admin non-Policy Owner mencoba mengubah kebijakan Kategori Tertentu | Ditolak 403 oleh `PolicyOwnerGuard` (bukan satu admin berkuasa mutlak) | FR-34, PRD §3.7 | P1 | PLANNED |
| TC-AUT-06 | Mutasi state data via POST/PUT tanpa menyertakan `X-CSRF-Token` | Ditolak 403 `AUTH_CSRF_INVALID` | SAD IV.3, NFR-05 | P1 | PLANNED |
| TC-AUT-07 | Akun karyawan dinonaktifkan secara instan oleh Admin di `/admin/users` | Seluruh sesi aktif langsung hangus; request API berikutnya mengembalikan 401 | FR-22, DEC-005 | P1 | PLANNED |
| TC-AUT-08 | Upaya login gagal 5 kali berturut-turut dalam rentang 1 menit | Percobaan ke-6 di-throttle / rate-limited (keamanan brute force) | SAD IV.3, NFR-05 | P2 | PLANNED |
| TC-AUT-09 | Token undangan aktivasi akun (INV): kedaluwarsa >72 jam atau dipakai ulang | Aktivasi ditolak; status token ditandai EXPIRED / REVOKED | FR-01, FR-54 | P1 | PLANNED |
| TC-AUT-10 | Snapshot konteks organisasi saat submit komitmen (FR-02) | Snapshot tersimpan di JSONB; tidak bermutasi saat struktur organisasi berubah | FR-02, SAD II.3 | P1 | PLANNED |
| TC-AUT-11 | Pendelegasian reviewer sementara & audit logging (FR-24, FR-25) | Delegasi tercatat dengan rentang tanggal; mutasi delegasi tercatat di audit_logs | FR-24, FR-25 | P2 | PLANNED |

### 6.4. Integritas Struktur, Anti-Backdating & Organisasi (DEC-008, R5, FR-23)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-BKD-01 | INSERT penugasan organisasi / kebijakan bertanggal efektif kemarin | Ditolak oleh trigger `enforce_no_backdating` (error `BACKDATING_FORBIDDEN`) | DEC-008, SAD B.5 | P1 | PLANNED |
| TC-BKD-02 | INSERT penugasan organisasi bertanggal efektif hari ini (zona org) | Berhasil disimpan tanpa kendala | DEC-008, SAD II.4 | P1 | PLANNED |
| TC-BKD-03 | UPDATE `end_date` pada penugasan lama untuk menutup masa berlaku | Berhasil disimpan (memverifikasi bahwa trigger tidak memblokir UPDATE) | DEC-008, SAD II.4 | P1 | PLANNED |
| TC-BKD-04 | Penugasan Direct Manager yang membentuk siklus pelaporan (A → B → A) | Ditolak `BUSINESS_RULE_REPORTING_CYCLE` disertai rute siklus pelaporan | SAD III.1, EP03 | P1 | PLANNED |
| TC-BKD-05 | Karyawan ditugaskan sebagai direct manager untuk dirinya sendiri | Ditolak oleh constraint integritas basis data | SAD II.3, EP03 | P1 | PLANNED |

### 6.5. Tiket Kendala (Blocker), Eskalasi & Otoritas (R4, FR-15..21, 64, DEC-013)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-BLK-01 | Support owner menandai blocker `RESOLVED` tanpa resolution note | Ditolak 422; resolution note wajib dicantumkan | FR-18, PRD | P1 | PLANNED |
| TC-BLK-02 | Menetapkan status `ACCEPTED_RISK` tanpa justifikasi & mitigasi | Ditolak 422; hanya authority terkait yang berwenang menetapkan | FR-17, FR-18 | P1 | PLANNED |
| TC-BLK-03 | Karyawan lain yang bukan pelapor mencoba menandai blocker `CLOSED` | Ditolak 403; konfirmasi closed eksklusif milik pembuat tiket (`raisedByUserId`) | FR-18, PRD | P1 | PLANNED |
| TC-BLK-04 | Transisi state ilegal (misal langsung lompat dari `OPEN` ke `RESOLVED`) | Ditolak oleh state machine validator | FR-17, SAD III.2 | P1 | PLANNED |
| TC-BLK-05 | Kondisi balapan: Transisi acknowledge vs auto-escalate serentak | `SELECT FOR UPDATE` mengunci baris; tepat satu transisi yang sah berlaku | SAD III.5, R4 | P1 | PLANNED |
| TC-BLK-06 | Worker SLA auto-escalation dijalankan berulang pada waktu yang sama | Idempoten; tiket hanya dieskalasi satu kali per level eskalasi | FR-20, FR-21 | P1 | PLANNED |
| TC-BLK-07 | Unggah bukti pendukung blocker: file format `.exe` atau ukuran >10MB | Ditolak oleh validasi pre-signed URL (MIME whitelist & size boundary) | SAD IV.6, NFR-05 | P1 | PLANNED |
| TC-BLK-08 | Pembuatan instant blocker di luar EOD dengan metadata lengkap | Type, Severity, Impact tersimpan valid; lifecycle tiket dimulai dari `OPEN` | FR-15, FR-16 | P1 | PLANNED |
| TC-BLK-09 | Blocker Project Authority wajib menyertakan kode proyek (DEC-013) | `project_code_reference` wajib diisi jika authority context = Project | DEC-013, SAD B.3 | P1 | PLANNED |
| TC-BLK-10 | Notifikasi eskalasi SLA blocker otomatis ke penerima eskalasi | Worker menerbitkan notifikasi outbox ke direct manager / head terkait | FR-20, FR-21 | P2 | PLANNED |
| TC-BLK-11 | Pencatatan kontribusi bantuan silang fungsi SupportContribution (FR-64) | Kontribusi tersimpan dengan timestamp dan detail resolusi bantuan | FR-64, PRD | P2 | PLANNED |

### 6.6. Koreksi, Cuti & Penegakan Kepatuhan (DEC-007, R3, FR-27..30, 43..49, 70..73)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-COR-01 | Koreksi Minor (perbaikan typo komitmen di bawah ambang kata) | Status `AUTO_APPLIED` instan + audit log before/after dalam 1 transaksi | FR-44, SAD III.2 | P2 | PLANNED |
| TC-COR-02 | Koreksi Material tanpa ada keberatan hingga Objection Window berakhir | Worker otomatis menetapkan status `APPROVED` dan menerapkan perubahan | FR-43, FR-45 | P1 | PLANNED |
| TC-COR-03 | Koreksi Material diajukan keberatan (*objection*) oleh Reviewer | Status beralih ke `REJECTED`; data komitmen lama tidak berubah | FR-43, SAD III.2 | P1 | PLANNED |
| TC-COR-04 | Konkurensi keberatan reviewer vs auto-apply worker saat window kedaluwarsa | Transaksi terisolasi; salah satu menang secara konsisten tanpa state ganda | SAD III.5, R4 | P2 | PLANNED |
| TC-COR-05 | EOD Outcome Correction Request untuk log yang terkunci (FR-53, FR-55) | Mengikuti alur koreksi Material; perubahan outcome tersimpan via audit | FR-53, FR-55 | P2 | PLANNED |
| TC-LVE-01 | Cuti disetujui setelah jam Cutoff pada hari yang berstatus No Submission | Rekonsiliasi otomatis menjadi `APPROVED_LEAVE` + audit `SUPERSEDED_BY_APPROVED_LEAVE` | DEC-007, FR-47 | P1 | PLANNED |
| TC-LVE-02 | Hari yang telah direkonsiliasi cuti dievaluasi oleh worker kepatuhan | Hari cuti dikecualikan dari perhitungan ambang pelanggaran 3x No Submission | DEC-007, FR-29 | P1 | PLANNED |
| TC-CMP-01 | Karyawan mencapai 3 kali No Submission dalam rentang Coaching Window | Worker menerbitkan satu `PATTERN_FLAG_3X` untuk episode tersebut | FR-29, SAD III.2 | P1 | PLANNED |
| TC-CMP-02 | Worker pattern evaluation dijalankan berulang pada hari yang sama | Idempoten; tidak menerbitkan flag ganda untuk episode pelanggaran yang sama | FR-29, SAD III.2 | P1 | PLANNED |
| TC-CMP-03 | Aksi manual pencatatan peringatan disiplin (*recorded warning*) | Hanya dapat dieksekusi oleh peran HRGA/Management berwenang (bukan Supervisor) | FR-72, SAD III.1 | P2 | PLANNED |
| TC-CMP-04 | Pemeriksaan sistem terhadap penerbitan SP / sanksi otomatis | Sistem TIDAK PERNAH menerbitkan surat peringatan/sanksi otomatis (larangan mutlak) | FR-30, BR-05 | P1 | PLANNED |
| TC-CMP-05 | Pengecualian hari libur resmi & bounded exemption dari deteksi NoSub | Tidak ada status No Submission pada tanggal libur atau tanggal exempt aktif | FR-46, FR-48 | P1 | PLANNED |
| TC-CMP-06 | Alur pembinaan kepatuhan bertahap (FR-49, FR-70..73) | Pencatatan sesi pembinaan 1-on-1 tersimpan manual tanpa sanksi otomatis | FR-49, FR-70..73 | P2 | PLANNED |
| TC-CMP-07 | Hak akses Manager Note terisolasi secara ketat (FR-39, FR-40) | Hanya dapat dibaca oleh pembuat, supervisor berwenang, dan HRGA (karyawan 403) | FR-39, FR-40 | P1 | PLANNED |
| TC-AUD-01 | Upaya UPDATE atau DELETE langsung pada tabel `audit_logs` | Ditolak oleh permission database role aplikasi (hanya izinkan INSERT dan SELECT) | SAD II.4, R3 | P1 | PLANNED |
| TC-AUD-02 | Kegagalan penulisan baris audit log di tengah transaksi bisnis | Seluruh transaksi bisnis di-rollback secara atomik (data integrity mutlak) | SAD II.4, R3 | P1 | PLANNED |

### 6.7. Notifikasi, Audit & Pelaporan Manajerial (FR-28, 37, 38, 41, 42, 65..69)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-NTF-01 | 250 karyawan belum submit; scheduler pengingat 60 menit berjalan | Seluruh 250 karyawan menerima tepat 1 notifikasi; tidak ada starvasi batch | FR-28, SAD Lampiran A.3 | P1 | PLANNED |
| TC-NTF-02 | Karyawan berstatus cuti, libur resmi, atau exempt saat scheduler berjalan | Dikecualikan secara otomatis dari daftar target pengiriman notifikasi pengingat | FR-27, FR-28 | P1 | PLANNED |
| TC-NTF-03 | Pemrosesan baris notifikasi outbox status `QUEUED` oleh background worker | Baris diproses atomik (`FOR UPDATE SKIP LOCKED`), retry $\le 5$ bila gagal | SAD Lampiran A.3, FR-38 | P1 | PLANNED |
| TC-RPT-01 | Dashboard Pulse dan Executive Trend tidak menampilkan ranking individu | Bersih dari leaderboard individu / kompetisi tidak sehat (selaras filosofi PRD) | FR-41, FR-68 | P1 | PLANNED |
| TC-RPT-02 | Ekspor data dengan konfigurasi TTL Signed URL di luar rentang 1–60 menit | Permintaan ekspor dengan TTL 0 atau 61 menit ditolak oleh server | FR-42, ADR-009 | P2 | PLANNED |
| TC-RPT-03 | Kueri agregasi dashboard difilter berdasarkan scope pengguna | Data di luar wewenang scope tidak bocor pada ringkasan metrik | FR-41, SAD IV.4 | P1 | PLANNED |
| TC-RPT-04 | Filter proyek pada Blocker Dashboard & Project Authority View (FR-37) | Filter proyek menyaring tiket kendala secara presisi tanpa membebani komitmen | FR-37, DEC-013 | P2 | PLANNED |
| TC-RPT-05 | Tampilan pola carry-over berulang pada Weekly Summary (FR-65, 67, 68) | Menampilkan tren carry-over dan support contribution sebagai konteks obyektif | FR-65, FR-68 | P2 | PLANNED |
| TC-RPT-06 | Personal Weekly Accountability Summary untuk karyawan (FR-66) | Karyawan dapat melihat riwayat komitmen, blocker, dan status miliknya sendiri | FR-66, PRD | P2 | PLANNED |

### 6.8. Kebijakan Operasional, Register Peluncuran & Penundaan Pasca-Pilot (DEC-011, DEC-012, FR-31..35, 56..62)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-POL-01 | Perubahan parameter kebijakan operasional (FR-31, FR-32, FR-33) | Menghasilkan versi baru dengan effective date; data lama membaca versi historis | FR-31..33 | P1 | PLANNED |
| TC-POL-02 | Pengecualian terbuka tanpa batas waktu untuk Direktur/Eksekutif (FR-35) | Record exemption tersimpan `end_date = NULL` secara valid tanpa dipaksa tanggal | FR-35, PRD §3.7 | P2 | PLANNED |
| TC-POL-03 | Deteksi penanda nilai parameter operasional ilustratif (DEC-011, SAD B.1) | Endpoint `/admin/launch-readiness` mengembalikan `NOT_READY` selama ada `is_illustrative` | DEC-011, SAD B.1 | P1 | PLANNED |
| TC-REV-01 | Verifikasi penundaan modul evaluasi FR-56..59 pada MVP Pilot (DEC-012) | Tidak ada endpoint/antarmuka review yang aktif pada rilis pilot MVP | DEC-012 | P1 | PLANNED |
| TC-REV-02 | Larangan mutlak auto-rating / kalkulasi skor kinerja otomatis | Sistem TIDAK PERNAH menghitung skor kinerja atau pemotongan insentif otomatis | FR-60, FR-61, FR-62 | P1 | PLANNED |
| TC-REV-03 | Skema DDL provisional `review_records` tidak dimigrasikan pada pilot | Database pilot bersih dari tabel `review_records` hingga Gate 1 UI disahkan | DEC-012, SAD B.4 | P1 | PLANNED |

### 6.9. Antarmuka Pengguna, 7 State UI & Aksesibilitas (R8, NFR-01, NFR-02, NFR-08)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-UI-01 | Pengujian kontras warna teks terhadap latar belakang (WCAG 2.1 AA) | Seluruh teks memenuhi rasio kontras minimum 4.5:1 (3:1 untuk teks besar) | NFR-02, DS v1.5 | P2 | PLANNED |
| TC-UI-02 | Navigasi seluruh alur form menggunakan keyboard murni (Tab, Enter, Esc) | Focus indicator terlihat jelas, tidak ada keyboard trap; Esc menutup modal | NFR-02, DS v1.5 | P2 | PLANNED |
| TC-UI-03 | Verifikasi kelengkapan 7 state UI pada tabel & kartu data | State Idle, Loading, Empty, Error, Success, Updating, Disabled terverifikasi | SAD V.3, DS v1.5 | P2 | PLANNED |
| TC-UI-04 | Fitur auto-save draft komitmen pada local storage browser | Draf komitmen yang belum dikirim tidak hilang saat browser dimuat ulang | SAD V.4 | P2 | PLANNED |
| TC-UI-05 | Uji tampilan responsif pada breakpoint 360px (mobile) hingga 1440px (desktop) | Tampilan rapi, tanpa horizontal scrolling yang merusak tata letak | NFR-01, DS v1.5 | P2 | PLANNED |
| TC-UI-06 | Kompatibilitas lintas peramban modern (Chrome, Firefox, Safari, Edge) | 26 prototipe HTML kanonikal merender identik tanpa cacat fungsional | NFR-08 | P2 | PLANNED |

### 6.10. Non-Fungsional, Performa & Keandalan Operasional (NFR-03, 04, 06, 07, 09, 10, 11, 12)
| ID | Skenario Langkah Uji | Hasil Harapan | Sumber Acuan | P | Status |
|---|---|---|---|---|---|
| TC-NFR-01 | Uji beban transaksional 50 pengguna simultan submit komitmen pagi | Response time latency P95 $\le 200\text{ ms}$; tingkat keberhasilan 100% | NFR-03, SAD I.3 | P1 | PLANNED |
| TC-NFR-02 | Uji beban agregasi metrik Pulse Dashboard pada dataset 50 pengguna | Response time latency P95 $\le 500\text{ ms}$; kueri SQL teroptimasi indeks | NFR-03, SAD II.5 | P2 | PLANNED |
| TC-NFR-03 | Uji ketersediaan sistem berkesinambungan selama periode uji | Memenuhi target uptime $\ge 99\%$ per bulan kalender | NFR-04, PRD | P1 | PLANNED |
| TC-NFR-04 | Uji simulasi kegagalan kontainer aplikasi (liveness & readiness probes) | Kontainer me-restart otomatis; traffic dialihkan hanya saat `/health/ready` 200 | SAD VI.2 | P2 | PLANNED |
| TC-NFR-05 | Eksekusi restore drill basis data dari backup streaming `pg_dump` | Database baru berhasil dipulihkan lengkap dengan trigger dan data historis | NFR-07, SAD VI.3 | P1 | PLANNED |
| TC-NFR-06 | Verifikasi structured logging JSON (Pino) dengan Request ID & Redaction | Password, cookie token, dan data rahasia ter-redact otomatis di log server | NFR-12, SAD VI.1 | P2 | PLANNED |
| TC-NFR-07 | Uji keamanan ekspor data dengan Signed URL ber-TTL dinamis | URL kedaluwarsa setelah masa TTL (1–60 menit); akses pasca TTL menghasilkan 403 | NFR-11, FR-42 | P2 | PLANNED |
| TC-NFR-08 | Uji isolasi jam operasional sistem (NFR-09) | Penegakan batas cutoff dan ketersediaan form konsisten sesuai zona org | NFR-09 | P2 | PLANNED |

---

## 7. Matriks Keterlacakan Lengkap (Keputusan, 73 FR, 12 NFR → Test Cases)

Tabel berikut membuktikan bahwa **seluruh 13 Keputusan Desain (DEC-001..013), seluruh 73 Kebutuhan Fungsional (FR-01..73), dan seluruh 12 Kebutuhan Non-Fungsional (NFR-01..12)** memiliki kasus uji verifikasi langsung tanpa ada celah yang tertinggal:

| Kelompok Persyaratan | Rincian Kode & Deskripsi | Test Case Penanggung Jawab Verifikasi |
|---|---|---|
| **Keputusan DEC-001 s/d DEC-013** | DEC-001 (Baseline PRD v1.0 & Governance) | `TC-TIM-01..08`, `TC-COM-01..14` |
| | DEC-002 (Batas Waktu, Cutoff & Grace Period) | `TC-TIM-01`, `TC-TIM-02`, `TC-TIM-03`, `TC-TIM-04`, `TC-TIM-05`, `TC-TIM-08` |
| | DEC-003 (Carry-Over Rekomendasi AMBER, Green Never Locked) | `TC-COM-06`, `TC-COM-13` |
| | DEC-004 (Zero Commitment & Copy-Forward Eksklusif) | `TC-COM-02`, `TC-COM-03`, `TC-COM-05` |
| | DEC-005 (Manajemen Pengguna Terpusat di `/admin/users`) | `TC-AUT-07`, `TC-AUT-09` |
| | DEC-006 (Clean-Slate Architecture & Pengarsipan Kode Lama) | `TC-BKD-01..05`, `TC-NFR-05` |
| | DEC-007 (Rekonsiliasi Transaksional Cuti Pasca-Cutoff) | `TC-LVE-01`, `TC-LVE-02` |
| | DEC-008 (Larangan Backdating Struktur Organisasi & Kebijakan) | `TC-BKD-01`, `TC-BKD-02`, `TC-BKD-03` |
| | DEC-009 (Nama Kanonikal & Placeholder 10 Fungsi Dutamedia) | `TC-COM-09`, `TC-AUT-03` |
| | DEC-010 (Tata Kelola Tim 2 Pengembang + AI & SLA Defect) | `TC-NFR-01..08`, Verifikasi DoD |
| | DEC-011 (Launch Configuration Register Disahkan Direktur) | `TC-POL-03` |
| | DEC-012 (Penundaan FR-56..59 Pasca-Pilot Milestone Fase 1.5) | `TC-REV-01`, `TC-REV-02`, `TC-REV-03` |
| | DEC-013 (Filter Proyek Blocker/PA, Previous Workday, Origin ID) | `TC-COM-05`, `TC-COM-13`, `TC-BLK-09`, `TC-RPT-04` |
| **Kebutuhan Identitas & Sesi** | FR-01, FR-50, FR-54 (Akun, Login Kredensial, Token Undangan 72j) | `TC-AUT-07`, `TC-AUT-08`, `TC-AUT-09` |
| **Konteks Organisasi & Struktur** | FR-02, FR-22, FR-23, FR-24, FR-25 (Snapshot Org, Deaktivasi, Hirarki) | `TC-AUT-02`, `TC-AUT-03`, `TC-AUT-04`, `TC-AUT-10`, `TC-AUT-11`, `TC-BKD-01..05` |
| **Komitmen Pagi & Waktu** | FR-03, FR-04, FR-51 (Komitmen 0–3, Known Blocker, Initial Status) | `TC-COM-01`, `TC-COM-02`, `TC-COM-03`, `TC-COM-04` |
| | FR-05, FR-26 (Klasifikasi On-Time/Late, Kunci Pasca-Cutoff) | `TC-TIM-01`, `TC-TIM-02`, `TC-TIM-03`, `TC-TIM-04`, `TC-TIM-05`, `TC-TIM-08` |
| **Pekerjaan Tambahan & EOD** | FR-06, FR-07 (Additional Work di Luar Baseline Komitmen) | `TC-COM-12` |
| | FR-08, FR-09, FR-10 (Outcome, Continuation Terpisah, Final Status) | `TC-COM-07`, `TC-COM-08`, `TC-COM-14` |
| | FR-11, FR-52 (Copy-Forward Koleksi Utuh, Tomorrow Priority) | `TC-COM-05`, `TC-COM-10`, `TC-COM-13` |
| | FR-12 (Role-Based Output Prompt 10 Fungsi Kanonikal) | `TC-COM-09` |
| | FR-13, FR-14 (Heuristik Status EOD, Rekomendasi Min AMBER) | `TC-COM-06`, `TC-COM-13` |
| **Blocker, Eskalasi & Support** | FR-15, FR-16 (Blocker Instant, Type, Severity, Impact) | `TC-BLK-08` |
| | FR-17, FR-18 (Lifecycle Tiket, Acknowledge, Resolve, Accept Risk) | `TC-BLK-01`, `TC-BLK-02`, `TC-BLK-03`, `TC-BLK-04` |
| | FR-19, FR-19a/b/c (Authority Context: Org vs Project Authority) | `TC-BLK-09` |
| | FR-20, FR-21 (Notifikasi Eskalasi SLA Otomatis & Auto-Escalate) | `TC-BLK-05`, `TC-BLK-06`, `TC-BLK-10` |
| | FR-64 (Pencatatan Bantuan Silang Fungsi SupportContribution) | `TC-BLK-11` |
| **Pengecualian, Koreksi & Cuti** | FR-27, FR-46, FR-48 (Pengecualian Leave/Holiday/Exemption) | `TC-CMP-05`, `TC-NTF-02` |
| | FR-28 (Pengingat Otomatis 60 Menit Anti-Starvasi NOT EXISTS) | `TC-NTF-01` |
| | FR-29, FR-30, FR-49, FR-70..73 (Ambang 3x NoSub, Coaching, Anti-Auto-SP) | `TC-CMP-01`, `TC-CMP-02`, `TC-CMP-03`, `TC-CMP-04`, `TC-CMP-06`, `TC-LVE-02` |
| | FR-39, FR-40 (Manager Note dengan Hak Akses Terisolasi) | `TC-CMP-07` |
| | FR-43, FR-44, FR-45, FR-53, FR-55 (Koreksi Minor vs Material) | `TC-COR-01`, `TC-COR-02`, `TC-COR-03`, `TC-COR-04`, `TC-COR-05` |
| | FR-47 (Persetujuan Cuti & Rekonsiliasi Cuti Pasca-Cutoff DEC-007) | `TC-LVE-01`, `TC-LVE-02` |
| **Kebijakan & Pengaturan** | FR-31, FR-32, FR-33, FR-34, FR-35 (Policy Versioning, Owner, Exemption) | `TC-AUT-05`, `TC-POL-01`, `TC-POL-02`, `TC-POL-03` |
| **Pelaporan & Notifikasi** | FR-36, FR-37 (My History, Pencarian & Filter Proyek) | `TC-AUT-01`, `TC-RPT-04` |
| | FR-38 (Kanal Notifikasi Email Brevo, Web Push VAPID, In-App) | `TC-NTF-03` |
| | FR-41, FR-65, FR-66, FR-67, FR-68, FR-69 (Pulse Dashboard, Summary) | `TC-RPT-01`, `TC-RPT-03`, `TC-RPT-05`, `TC-RPT-06` |
| | FR-42 (Ekspor Laporan Signed URL dengan TTL Dinamis 1–60 Menit) | `TC-RPT-02`, `TC-NFR-07` |
| **Evaluasi Kualitatif (Post-Pilot)** | FR-56, FR-57, FR-58, FR-59 (Individual Review Evidence Ditunda DEC-012) | `TC-REV-01`, `TC-REV-03` |
| | FR-60, FR-61, FR-62 (Larangan Mutlak Auto-Rating & Pemotongan Insentif) | `TC-REV-02` |
| | FR-63 (Quality Warning Kontekstual Komitmen Generik) | `TC-COM-11` |
| **Kebutuhan Non-Fungsional (NFR)** | NFR-01 (Responsiveness & Mobile Friendly 360px–1440px) | `TC-UI-05` |
| | NFR-02 (Accessibility WCAG 2.1 AA Kontras 4.5:1 & Keyboard Nav) | `TC-UI-01`, `TC-UI-02` |
| | NFR-03 (Performance Latency P95 Transaksional <200ms, Agregasi <500ms) | `TC-NFR-01`, `TC-NFR-02` |
| | NFR-04 (Availability & Reliability $\ge 99\%$ Uptime Bulanan) | `TC-NFR-03` |
| | NFR-05 (Keamanan Auth: Argon2id, CSRF Double-Submit, Rate Limit) | `TC-AUT-06`, `TC-AUT-08`, `TC-BLK-07` |
| | NFR-06 (Integritas Data, Append-Only Audit & Anti-Backdating) | `TC-BKD-01..03`, `TC-AUD-01`, `TC-AUD-02` |
| | NFR-07 (Backup Streaming pg_dump & Verifikasi Restore Drill) | `TC-NFR-05` |
| | NFR-08 (Browser Compatibility Chrome, Firefox, Safari, Edge) | `TC-UI-06` |
| | NFR-09 (Jam Layanan Operasional Sistem & Penegakan Zona Waktu) | `TC-TIM-06`, `TC-NFR-08` |
| | NFR-10 (Concurrency Control SELECT FOR UPDATE & Race Defense) | `TC-BLK-05`, `TC-COR-04` |
| | NFR-11 (Exportability Security & Signed URL TTL Enforcement) | `TC-RPT-02`, `TC-NFR-07` |
| | NFR-12 (Observability, Pino Structured Logging, Request-ID) | `TC-NFR-06` |

---

## 8. Kriteria Kelulusan Pengujian (Quality Gates Criteria)
- **Entry Criteria:** Pipeline CI hijau, lingkungan uji terisolasi berbasis Docker siap, data seed sintetis terpasang deterministik.
- **Pass Kasus Uji:** Hasil aktual identik 100% dengan hasil harapan, dan berkas bukti log mentah tersimpan di `qa-evidence/`.
- **Exit Fase Increment (Gate 4):** 100% kasus uji P1 lulus, kasus P2 $\ge 95\%$ lulus tanpa ada defect Severity 1 atau Severity 2 yang masih terbuka.
- **Rilis Produksi (Gate 5):** Regression suite 100% pass, security audit bersih dari temuan High/Critical, restore drill sukses terbukti, Launch Configuration Register disahkan Direktur, dan UAT ditandatangani Harry.
- **Suspend Criteria:** Lingkungan uji tidak stabil atau terjadi kegagalan pipeline CI utama yang memblokir eksekusi tes otomatis.

---

## 9. Status Keputusan & Otoritas Pengesahan
- Seluruh spesifikasi teknis dan perbaikan DDL (`TP-GAP-01..08`, SameSite, DDL attachment, scheduler outbox, origin ID chain) telah disahkan pada SAD v2.1.0 Lampiran B.
- Status **`OPEN-04` (Launch Configuration Register)** adalah `IN-PROGRESS` berlandaskan `DEC-011`: Pemilik Kebijakan resmi adalah **Direktur Dutamedia**. Pengesahan parameter produksi wajib dituntaskan sebelum eksekusi rilis final (Gate 5).
