# MATRIKS HUBUNGAN TEMA & EVALUASI KETERGANTUNGAN (PHASE 2)
## Ruang Lingkup: 44 Improvement Findings (IMP-001 s.d. IMP-044)

| Parameter Tata Kelola | Rincian Dokumen |
| :--- | :--- |
| **Siklus Lifecycle** | **Phase 2 — Finding Assessment & Remediation Planning** |
| **Aktivitas** | **Theme Relationship Classification & Dependency Refinement** |
| **Peran Penyusun** | Senior Software Architect & Product Analyst |
| **Penerima Otoritas** | Harry (Acceptance Owner & Lead Manual UAT Tester, PT Dutamedia Mandiri Pratama) |
| **Cabang Git Aktif** | `remediation/cycle-01-fixes` |
| **Status Dokumen** | **PROPOSED FOR ACCEPTANCE OWNER REVIEW (REFINED)** |
| **Tanggal Analisis** | 1 November 2026 |
| **Total Scope** | **Tepat 44 Temuan (`IMP-001` s.d. `IMP-044`)** |

---

## 1. MATRIKS PEMETAAN 44 TEMUAN KE TEMA / STATUS MANDIRI

Matriks berikut memetakan seluruh 44 temuan improvement ke dalam kelompok tema (`CLU-*`) atau status `STANDALONE`, lengkap dengan klasifikasi validitas hasil investigasi, jenis hubungan formal berdasarkan taksonomi 5 kategori, dan dasar keterkaitan analitisnya:

| Finding ID | Judul Temuan Backlog | Klasifikasi Validitas | Penetapan Tema / Status | Klasifikasi Sifat Hubungan | Dasar Hubungan Analitis |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **IMP-001** | Tagline Value Proposition Hero Login | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan pesan nilai mitigasi risiko dan transparansi pada panel hero login. |
| **IMP-002** | Judul Poin Fitur 1 Komitmen Harian | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan cakupan akuntabilitas harian secara utuh pada pilar hero login. |
| **IMP-003** | Subtitle Poin Fitur 1 Komitmen Harian | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan arahan komitmen realistis pada subtitle pilar hero login. |
| **IMP-004** | Judul & Subtitle Poin Fitur 2 (Eskalasi) | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan naskah pilar eskalasi kendala sesuai naskah Prototipe 01. |
| **IMP-005** | Judul & Subtitle Poin Fitur 3 (Evaluasi) | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan naskah pilar evaluasi sore sesuai naskah Prototipe 01. |
| **IMP-006** | Ikon Vektor SVG pada 3 Poin Fitur | VALID | `CLU-AUTH` | UI / Structural Relationship | Mengganti karakter unicode teks dengan ikon vektor SVG terstandarisasi. |
| **IMP-007** | Headline & Lead Text Form Login | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan keramahan teks sambutan form login kanan sesuai Prototipe 01. |
| **IMP-008** | Label Versi Sistem di Header Form | VALID | `CLU-AUTH` | UI / Structural Relationship | Menghilangkan kebocoran istilah arsitektur teknis internal dari label versi rilis. |
| **IMP-009** | Penanda Konteks Workspace Environment | VALID | `CLU-AUTH` | UI / Structural & Functional | Menyelaraskan label konteks portal kerja internal sesuai Prototipe 01. |
| **IMP-010** | Microcopy Bantuan Akses Pengguna | VALID | `CLU-AUTH` | Functional Relationship | Mengganti jargon teknis keamanan cookie/CSRF dengan kontak bantuan operasional. |
| **IMP-011** | Penanganan Lupa Kata Sandi | NEEDS CLARIFICATION | `STANDALONE` | Product Decision Influence | Menunggu keputusan Acceptance Owner (Bantuan Administratif vs Self-Service SMTP). |
| **IMP-012** | Keselarasan Visual Hero Login & Aktivasi | VALID | `CLU-AUTH` | UI / Structural Relationship | Menjamin keselarasan estetika hero panel kiri antara `/login` dan `/activate`. |
| **IMP-013** | Skenario Uji Akun Nonaktif & Rate Limit | DEFERRED CANDIDATE | `STANDALONE` | QA Testing Hardening | Usulan penguatan automated test suite QA, ditangguhkan ke fase pasca-remediasi. |
| **IMP-014** | Tombol Profil Daily Topbar ke Avatar | VALID | `CLU-SHELL` | UI / Structural Relationship | Mengganti tombol teks profil dengan avatar inisial pada 3 daily views. |
| **IMP-015** | Lonceng Notifikasi di Topbar | NEEDS CLARIFICATION | `STANDALONE` | Product Decision Influence | Menunggu keputusan Acceptance Owner (Pintasan Navigasi vs Live Unread Count). |
| **IMP-016** | Tombol CTA Lapor Blocker pada 3 Tab | VALID | `CLU-BLKR` | Functional Relationship | Menjamin ketersediaan pemicu pelaporan kendala konsisten di seluruh alur harian. |
| **IMP-017** | Caption Subtitle Brand Sidebar | VALID | `STANDALONE` | UI / Structural Relationship | Perubahan string statis tunggal pada `EnterpriseSidebar.vue` (Intranet -> Accountability). |
| **IMP-018** | Eliminasi Badge Duplikat WP di Profil | VALID | `CLU-SHELL` | UI / Structural Relationship | Menghilangkan redundansi logo aplikasi pada header halaman profil akun. |
| **IMP-019** | Standardisasi Navbar Global Bersih | VALID | `CLU-SHELL` | UI / Structural Relationship | Payung tata letak navigasi atas (topbar) terstandarisasi di seluruh view aplikasi. |
| **IMP-020** | Algoritma Inisial Avatar 2 Huruf | VALID | `CLU-SHELL` | Functional Relationship (Utility) | Logika pembentukan inisial 2 huruf kapital untuk seluruh avatar di aplikasi. |
| **IMP-021** | Pemisahan Nama Lengkap & Jabatan | VALID | `CLU-PROF` | Functional Relationship | Memisahkan entitas nama dan jabatan fungsional pada tampilan profil pengguna. |
| **IMP-022** | Restrukturisasi Body Profil 3 Seksi | VALID | `CLU-PROF` | UI / Structural Relationship | Menata ulang halaman profil menjadi 3 seksi komprehensif sesuai Prototipe 24. |
| **IMP-023** | Rute Pemulihan Error 403 Sesuai Role | VALID | `STANDALONE` | Functional Relationship | Terlokalisasi pada `ErrorPageView.vue`, navigasi pemulihan kanonikal peran. |
| **IMP-024** | Breadcrumb Hirarkis Topbar Admin | VALID | `CLU-SHELL` | UI / Structural Relationship | Menerapkan breadcrumb hirarkis bersih pada seluruh modul administrasi. |
| **IMP-025** | Konsolidasi Menu Duplikat Topbar Admin | VALID | `CLU-SHELL` | UI / Structural Relationship | Menghilangkan duplikasi menu sidebar horizontal pada topbar administrasi. |
| **IMP-026** | Penonaktifan Workspace bagi SYSTEM_ADMIN | VALID | `STANDALONE` | Functional Relationship (RBAC) | Konfigurasi otorisasi RBAC router untuk mengecualikan admin dari menu staf operasional. |
| **IMP-027** | Restrukturisasi Kartu Konteks Morning | VALID | `CLU-DLYM` | UI / Structural & Functional | Menyederhanakan kartu jadwal dari 4 metrik teknis menjadi 3 kartu kontekstual. |
| **IMP-028** | Microcopy Banner Keterlambatan Morning | VALID | `CLU-DLYM` | Functional Relationship | Mengeliminasi istilah ambigu 'Grace Period' pada banner pengisian terlambat. |
| **IMP-029** | Eliminasi Kode Internal DEC-004 | VALID | `CLU-DLYM` | Functional Relationship | Membuang string arsitektur 'DEC-004' dari checkbox komitmen nol dan validasi. |
| **IMP-030** | Transformasi Teks Status Komitmen Nol | VALID | `CLU-DLYM` | Functional Relationship | Mengganti string enum mentah `NOT_APPLICABLE_NO_COMMITMENT` dengan bahasa bisnis. |
| **IMP-031** | Eliminasi Teks '(Prototipe 03)' | VALID | `CLU-DLYE` | UI / Structural Relationship | Membuang kebocoran penanda nomor prototipe dari subtitle Additional Work. |
| **IMP-032** | Perbaikan Grid Input Atasan Penugas | VALID | `CLU-DLYE` | UI / Structural Relationship | Mengatasi penyempitan kolom saat dropdown atasan berformat nama/email panjang muncul. |
| **IMP-033** | Restrukturisasi Kartu Konteks EOD | VALID | `CLU-DLYE` | UI / Structural & Functional | Menata ulang kartu waktu evaluasi akhir hari sesuai rancangan Prototipe 04. |
| **IMP-034** | Eliminasi Teks '(Prototipe 04)' | VALID | `CLU-DLYE` | UI / Structural Relationship | Membuang kebocoran penanda nomor prototipe dari subtitle EOD Outcome. |
| **IMP-035** | Eliminasi Kode Internal DEC-003 | VALID | `CLU-DLYE` | Functional Relationship | Membuang string arsitektur 'DEC-003' dari seksi refleksi mandiri evaluasi sore. |
| **IMP-036** | Eliminasi Nama Enum pada Label EOD | VALID | `CLU-DLYE` | Functional Relationship | Membuang nama enum kode teknis (`NOT_COMPLETED`, dsb.) dari tombol radio capaian. |
| **IMP-037** | Pelebaran Textarea Catatan Kelanjutan | VALID | `CLU-DLYE` | UI / Structural Relationship | Memperbaiki styling textarea kelanjutan tugas agar melebar 100% secara vertikal. |
| **IMP-038** | Kesetaraan Evaluasi Tugas Tambahan | VALID | `CLU-DLYE` | Functional Relationship | Menyediakan opsi CANCELLED dan blok kelanjutan tugas pada evaluasi kerja tambahan. |
| **IMP-039** | Pemetaan Badge Alasan Kerja Tambahan | VALID | `CLU-DLYE` | Functional Relationship | Mengubah raw enum alasan pekerjaan tambahan menjadi label bahasa bisnis ramah. |
| **IMP-040** | Pengalihan CTA Lapor Blocker ke Rute | VALID | `CLU-BLKR` | Functional & Business Workflow | Menghilangkan modal pop-up lokal dan mengarahkan tombol langsung ke rute resmi. |
| **IMP-041** | Penataan Halaman Blocker (2 Tab) | VALID | `CLU-BLKR` | UI / Structural Relationship | Menyelaraskan struktur `/blockers/raise` dengan tombol kembali dan sistem 2 tab. |
| **IMP-042** | Eliminasi Tombol Antrean Manajerial | VALID | `CLU-BLKR` | Functional Relationship | Menghapus tombol antrean manajerial yang salah sasaran dari formulir pelaporan staf. |
| **IMP-043** | Penyeragaman Topbar Blocker | VALID | `CLU-SHELL` | UI / Structural Relationship | Breadcrumb bersih `Workspace / Laporkan & Pantau Blocker` dan avatar terstandarisasi. |
| **IMP-044** | Pembersihan Footer Formulir Blocker | VALID | `CLU-BLKR` | UI / Structural & Functional | Membuang string 'DEC-008' dan membetulkan rute tombol Batal agar tidak ke antrean. |

---

## 2. MATRIKS EVALUASI HUBUNGAN & KETERGANTUNGAN LINTAS KELOMPOK

Tabel berikut mengevaluasi seluruh keterkaitan antar-entitas, membedakan secara tegas antara keterkaitan konseptual/desain dengan **ketergantungan implementasi teknis sejati**:

| Entitas Sumber | Entitas Sasaran | Klasifikasi Hubungan Formal | Deskripsi Faktual Hubungan | Apakah Implementation Dependency Sejati? | Justifikasi Teknis & Arsitektural |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **`CLU-SHELL`** *(Topbar)* | **`CLU-DLYM`** *(Morning)* | **UI / Structural Relationship** | Kesamaan visual pada area header bar di `MorningCommitmentView.vue`. | **TIDAK** | Perbaikan formulir morning tidak diblokir secara kode oleh topbar. Shared topbar adalah opsi perancangan, bukan keharusan teknis mutlak. |
| **`CLU-SHELL`** *(Topbar)* | **`CLU-DLYE`** *(EOD & Addl)* | **UI / Structural Relationship** | Kesamaan visual pada area header bar di `AdditionalWorkView.vue` dan `EodOutcomeView.vue`. | **TIDAK** | Perbaikan grid input atasan dan textarea dapat dikerjakan tanpa menunggu shared topbar. |
| **`CLU-SHELL`** *(Topbar)* | **`CLU-BLKR`** *(Blocker)* | **UI / Structural Relationship** | Kesamaan pola breadcrumb dan avatar di `RaiseBlockerView.vue`. | **TIDAK** | Restrukturisasi tab blocker dapat dikembangkan secara mandiri di view terkait. |
| **`CLU-SHELL`** *(Topbar)* | **`CLU-PROF`** *(Profile)* | **UI / Structural Relationship** | Kesamaan pola topbar bersih tanpa logo duplikat di `ProfileView.vue`. | **TIDAK** | Layout 3 seksi profil dapat dikerjakan secara independen dari header global. |
| **`CLU-DLYM`** *(Morning)* | **`CLU-DLYE`** *(EOD & Addl)* | **Business Workflow Relationship** & **Functional Relationship** | Siklus kerja harian di mana komitmen pagi dievaluasi capaiannya pada sore hari. | **TIDAK** | Kode sumber dan store terisolasi (`MorningCommitmentView.vue` vs `EodOutcomeView.vue`). Tidak ada blocking dependensi kompilasi. |
| **`CLU-DLYM`** *(Morning)* | **`CLU-BLKR`** *(Blocker)* | **Functional Relationship** & **Business Workflow** | Tombol CTA `+ Lapor Blocker` (`IMP-016`) mengarahkan navigasi ke `/blockers/raise`. | **TIDAK** | Rute `/blockers/raise` sudah terdaftar. Mengubah tombol tidak memerlukan halaman blocker selesai direstrukturisasi terlebih dahulu. |
| **`CLU-DLYE`** *(EOD & Addl)* | **`CLU-BLKR`** *(Blocker)* | **Functional Relationship** & **Business Workflow** | Tombol CTA `+ Lapor Blocker` (`IMP-040`) mengarahkan navigasi ke `/blockers/raise`. | **TIDAK** | Pengalihan rute tombol bersifat independen dari perbaikan form pada halaman blocker. |
| **`STANDALONE IMP-026`** *(RBAC)* | **`CLU-DLYM`/`E`** *(Workspace)* | **Functional Relationship** (RBAC Policy) | Aturan filter menu router untuk menyembunyikan grup 'Workspace' dari `SYSTEM_ADMIN`. | **TIDAK** | Filter navigasi admin tidak mengubah fungsi internal transaksi form staf. |
| **`STANDALONE IMP-015`** *(Lonceng)* | **`CLU-SHELL`** *(Topbar)* | **Product Decision Influence** & **UI / Structural** | Keputusan Acceptance Owner menentukan apakah lonceng memuat link statis atau live badge. | **TIDAK** *(bagi topbar dasar)* | Topbar (breadcrumb, avatar) dapat distandarisasi tanpa menunggu keputusan counter notifikasi. |
| **`STANDALONE IMP-011`** *(Lupa Sandi)* | **`CLU-AUTH`** *(Auth/Login)* | **Product Decision Influence** & **Functional** | Keputusan Acceptance Owner menentukan apakah alur via bantuan IT/HRGA atau modul reset SMTP. | **TIDAK** | Naskah hero, ikon SVG, dan form login dapat diselesaikan tanpa menunggu arsitektur reset password. |

---

## 3. RINGKASAN INTEGRITAS ALOKASI

- **Total Temuan Terdaftar:** Tepat **44 Finding ID (`IMP-001` s.d. `IMP-044`)**.
- **Terpetakan ke Cluster:** **38 Temuan (86.4%)** terbagi dalam 6 Cluster logis.
- **Terpetakan ke Standalone:** **6 Temuan (13.6%)** dipertahankan mandiri secara objektif.
- **Duplikasi Alokasi:** **0 Temuan (0.0%)** — tidak ada ID yang tercatat lebih dari satu kali.
- **Temuan Terlewat:** **0 Temuan (0.0%)** — seluruh katalog tercover penuh (Zero Omission).
- **Temuan dengan Hard Blocking Dependency:** **0 Temuan (0.0%)** — seluruh kelompok dapat dijadwalkan secara fleksibel pada perencanaan siklus remediasi.
