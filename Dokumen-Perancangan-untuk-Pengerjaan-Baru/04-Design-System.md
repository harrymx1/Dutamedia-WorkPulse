# Design System — WorkPulse
## Daily Accountability & Blocker Log System (Dutamedia)

| Metadata | Nilai |
|---|---|
| Versi | 1.4.0 |
| Status | FINAL — Visual foundation; behavior baseline synchronized with PDD v1.4 FINAL, PRD v1.5 FINAL, and UI/UX Specification & Flow v1.9.0 FINAL |
| Pemilik Dokumen | Dutamedia |
| Tanggal | Oktober 2026 |
| Artefak | Design Artifact 04 |
| Baseline perilaku | PDD v1.4 FINAL; PRD v1.5 FINAL; UI/UX Specification & Flow v1.9.0 FINAL |

> Dokumen ini menetapkan fondasi visual, design tokens, komponen reusable, aturan layout, state visual, dan prinsip aksesibilitas WorkPulse. Dokumen ini **tidak mengubah product requirement atau user flow**. Jika perilaku belum ditetapkan di PDD/PRD/UI/UX Spec, Design System tidak boleh mengarangnya. Prototype harus menerapkan dokumen ini bersama UI/UX Specification & Flow v1.9.0 FINAL.

---

## 1. Tujuan dan prinsip visual

### 1.1 Karakter brand

WorkPulse adalah alat akuntabilitas internal yang **tenang, manusiawi, jelas, dan dapat dipercaya** — bukan dashboard pengawasan atau alat penghukuman. Visual perlu membantu orang memahami pekerjaan, risiko, blocker, dan tindak lanjut tanpa membuat seluruh aplikasi terasa mendesak.

- **Tenang dan suportif:** ruang putih cukup, struktur hierarki jelas, ornamen minimal.
- **Status mudah dibaca:** informasi status dapat dipahami sekilas, tetapi tidak hanya mengandalkan warna.
- **Konsisten:** status dan aksi yang sama selalu menggunakan pola visual yang sama.
- **Transparan:** locked, pending, gagal, dan perubahan yang menunggu keputusan memiliki label serta penjelasan.
- **Responsif:** pengalaman dapat digunakan pada desktop dan mobile browser; MVP bukan native mobile app.
- **Aksesibel:** kontras, keyboard focus, ukuran target sentuh, dan reduced motion menjadi bagian dari definisi komponen.

### 1.2 Aturan visual yang tidak boleh dilanggar

1. **Daily Status**, **Submission Timing**, **Blocker Severity**, dan **workflow status** merupakan dimensi berbeda. Jangan satukan menjadi satu badge atau satu makna warna.
2. Brand green adalah identitas merek, bukan status risiko GREEN.
3. Status selalu memiliki teks label. Warna, bentuk, dan ikon hanya memperkuat label, bukan menggantikannya.
4. `NOT_APPLICABLE — NO_COMMITMENT` tidak boleh tampak seperti GREEN atau No Submission.
5. No Submission adalah fakta submission/compliance, bukan vonis; gunakan gaya netral.
6. Additional Work mendapat bobot visual setara dengan Commitment, dengan label jenis yang berbeda.
7. Outcome dan Continuation selalu dua kontrol terpisah.
8. Tidak ada animasi untuk badge status; perubahan data tidak boleh disamarkan sebagai perubahan dekoratif.
9. Tidak ada leaderboard, peringkat jumlah task, gamifikasi, atau visual penghukuman otomatis.
10. Komponen tidak boleh menampilkan aksi yang tidak tersedia bagi aktor atau state tersebut. Otorisasi tetap ditegakkan oleh sistem; menyembunyikan tombol bukan kontrol keamanan.

---

## 2. Design tokens

### 2.1 Color tokens — base, surface, border, and text

| Token | Nilai | Penggunaan |
|---|---|---|
| `color.canvas` | `#F7FAF9` | Latar aplikasi |
| `color.surface` | `#FFFFFF` | Card, sidebar, panel, tabel |
| `color.surface-subtle` | `#EFF5F2` | Hover/selected surface dan area input bila sesuai |
| `color.surface-muted` | `#F1F5F4` | Area read-only, placeholder container, baris sekunder |
| `color.border-subtle` | `#DCE7E2` | Border default |
| `color.border-strong` | `#A9C7BC` | Border aktif yang bukan focus ring |
| `color.text-primary` | `#0E211B` | Judul dan teks utama |
| `color.text-secondary` | `#5C6E68` | Deskripsi dan metadata sekunder |
| `color.text-disabled` | `#66736E` | Teks nonaktif; tetap terbaca, tidak dipakai untuk konten wajib |
| `color.text-on-brand` | `#FFFFFF` | Teks di atas brand primary yang memenuhi kontras |
| `color.brand-primary` | `#00674D` | Primary action, active navigation, link penting |
| `color.brand-secondary` | `#12915F` | Aksen sekunder, dekorasi, progress, elemen non-teks |
| `color.brand-tint` | `#E6F4EE` | Selected surface dan brand background lembut |
| `color.focus-ring` | `#0B8061` | Focus ring dengan outline kontras dan offset |

**Kontras tombol:** tombol primary menggunakan `color.brand-primary` (`#00674D`) sebagai warna solid utama dengan teks putih. `color.brand-secondary` (`#12915F`) tidak boleh menjadi satu-satunya latar tombol berteks putih ukuran normal karena kontrasnya tidak memenuhi target 4.5:1. Gradient brand boleh digunakan untuk dekorasi atau permukaan yang tidak mengandalkan teks putih sebagai satu-satunya informasi; bila dipakai pada CTA, seluruh area teks harus tetap memenuhi kontras minimum.

### 2.2 Semantic color tokens

Semua kombinasi warna semantic harus mempertahankan kontras teks minimal **4.5:1** untuk teks normal dan **3:1** untuk teks besar atau komponen grafis penting. Warna latar di bawah adalah warna solid yang disarankan untuk memastikan hasil konsisten.

| Token | Foreground | Background | Border | Makna |
|---|---|---|---|---|
| `status.green.fg` | `#166534` | `#DCFCE7` | `#86EFAC` | Daily Status GREEN |
| `status.amber.fg` | `#92400E` | `#FEF3C7` | `#FCD34D` | Daily Status AMBER |
| `status.red.fg` | `#991B1B` | `#FEE2E2` | `#FCA5A5` | Daily Status RED |
| `timing.ontime.fg` | `#075985` | `#E0F2FE` | `#7DD3FC` | On-Time |
| `timing.late.fg` | `#9A3412` | `#FFEDD5` | `#FDBA74` | Late |
| `timing.no-submission.fg` | `#334155` | `#F1F5F9` | `#CBD5E1` | No Submission |
| `status.not-applicable.fg` | `#334155` | `#F1F5F9` | `#94A3B8` | `NOT_APPLICABLE — NO_COMMITMENT` |
| `severity.low.fg` | `#334155` | `#F1F5F9` | `#CBD5E1` | Blocker Low |
| `severity.medium.fg` | `#854D0E` | `#FEF3C7` | `#FCD34D` | Blocker Medium |
| `severity.high.fg` | `#9A3412` | `#FFEDD5` | `#FDBA74` | Blocker High |
| `severity.critical.fg` | `#991B1B` | `#FEE2E2` | `#FCA5A5` | Blocker Critical |
| `workflow.pending.fg` | `#075985` | `#E0F2FE` | `#7DD3FC` | Menunggu keputusan/tindakan |
| `workflow.applied.fg` | `#166534` | `#DCFCE7` | `#86EFAC` | Perubahan diterapkan |
| `workflow.approved.fg` | `#166534` | `#DCFCE7` | `#86EFAC` | Leave disetujui |
| `workflow.rejected.fg` | `#991B1B` | `#FEE2E2` | `#FCA5A5` | Pengajuan ditolak |
| `workflow.neutral.fg` | `#334155` | `#F1F5F9` | `#CBD5E1` | Status informasional |
| `workflow.accepted-risk.fg` | `#7C2D12` | `#FFEDD5` | `#FDBA74` | Accepted Risk — keputusan tersendiri |

**Aturan semantic:**
- Setiap badge menampilkan label yang sesuai dengan data sumber; jangan mengubah status domain hanya untuk menyesuaikan warna.
- Pending Correction Request, Pending Leave, dan Pending Objection dapat menggunakan keluarga warna pending yang sama, tetapi harus memiliki label dan konteks masing-masing.
- Applied, Approved, Rejected, Resolved, Closed, dan Accepted Risk bukan sinonim. Jangan memberi label generik “Selesai” untuk semua keadaan tersebut.
- Untuk Blocker `Resolved` dan `Closed`, gunakan label teks yang tepat. Bila keduanya memakai warna positif, tampilkan ikon/konteks berbeda agar perbedaan lifecycle tetap jelas.
- Status GREEN hanya digunakan untuk Initial Daily Status/Final Status yang benar-benar bernilai GREEN sesuai sumber data. Jangan mengubah `NOT_APPLICABLE — NO_COMMITMENT` menjadi GREEN.
- Hindari penggunaan merah untuk sekadar locked, empty, pending, atau No Submission.

### 2.3 Overlay, focus, and interaction colors

| Token | Nilai | Penggunaan |
|---|---|---|
| `overlay.modal` | `rgba(15, 23, 42, 0.55)` | Backdrop modal |
| `focus.outline-width` | `3px` | Focus ring keyboard |
| `focus.outline-offset` | `2px` | Jarak ring dari komponen |
| `interaction.hover` | `color.surface-subtle` | Hover pada komponen interaktif |
| `interaction.selected` | `color.brand-tint` | Item terpilih; sertakan indikator non-warna |
| `interaction.disabled` | `color.surface-muted` | Latar kontrol nonaktif |
| `border.error` | `#B91C1C` | Border field invalid, disertai teks error |
| `text.error` | `#991B1B` | Teks error |
| `border.success` | `#15803D` | Aksen sukses; bukan satu-satunya indikator sukses |

---

## 3. Typography

### 3.1 Font family

- **Heading dan body:** Plus Jakarta Sans.
- **Monospace:** JetBrains Mono hanya untuk timestamp, ID, nilai teknis, atau countdown yang membutuhkan alignment.
- Fallback: `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif untuk teks utama; `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace untuk teks teknis.
- Jika font web gagal dimuat, layout tidak boleh bergeser sampai menghalangi kontrol atau menyembunyikan informasi.

### 3.2 Type scale

| Token | Ukuran | Weight | Line-height | Penggunaan |
|---|---:|---:|---:|---|
| `type.display` | `32px` | 700 | 1.2 | Judul halaman utama bila diperlukan |
| `type.h1` | `28px` | 700 | 1.25 | Judul halaman |
| `type.h2` | `22px` | 700 | 1.3 | Judul section |
| `type.h3` | `18px` | 600 | 1.35 | Judul card/subsection |
| `type.body` | `16px` | 400 | 1.5 | Teks utama dan form |
| `type.body-strong` | `16px` | 600 | 1.5 | Penekanan teks utama |
| `type.body-compact` | `14px` | 400 | 1.45 | Tabel dan konten padat |
| `type.label` | `14px` | 600 | 1.4 | Label field, label kontrol |
| `type.caption` | `13px` | 400 | 1.4 | Metadata non-kritis |
| `type.badge` | `12px` | 600 | 1.3 | Badge status; tidak lebih kecil |
| `type.mono` | `12px` | 400 | 1.4 | Timestamp/ID/countdown |

**Aturan tipografi:**
- Teks utama tidak boleh diperkecil untuk memaksa tabel masuk ke layar; gunakan responsivitas, wrapping, atau pola tabel mobile.
- Label dan nilai harus dapat dibedakan tanpa hanya mengandalkan weight.
- Jangan gunakan seluruh huruf kapital untuk kalimat panjang. Gunakan kapitalisasi normal untuk UI berbahasa Indonesia.
- Teks error, instruksi penting, status, dan alasan wajib tidak boleh menggunakan caption terkecil.
- Nama status domain seperti `GREEN`, `AMBER`, `RED`, `On-Time`, `Late`, `No Submission`, `Continue`, `Do Not Continue`, `Pending`, `Applied`, `Rejected`, `Resolved`, `Closed`, dan `Accepted Risk` dapat dipertahankan sebagai istilah produk; label pendukung dan instruksi UI menggunakan Bahasa Indonesia.

---

## 4. Spacing, shape, elevation, and iconography

### 4.1 Spacing scale

Gunakan kelipatan basis 4 px:

`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 px`

| Token | Nilai | Penggunaan tipikal |
|---|---:|---|
| `space.1` | 4px | Jarak ikon dan label yang rapat |
| `space.2` | 8px | Jarak antar kontrol kecil |
| `space.3` | 12px | Jarak internal komponen kompak |
| `space.4` | 16px | Padding form/card kompak |
| `space.6` | 24px | Padding card utama dan jarak antar kelompok |
| `space.8` | 32px | Jarak section |
| `space.10` | 40px | Pemisah section besar |
| `space.12` | 48px | Jarak antar area utama |
| `space.16` | 64px | Spasi halaman lebar bila dibutuhkan |

### 4.2 Shape and elevation

| Token | Nilai |
|---|---:|
| `radius.input` | 8px |
| `radius.button` | 8px |
| `radius.card` | 10px |
| `radius.modal` | 14px |
| `radius.pill` | 999px |
| `shadow.card` | None by default |
| `shadow.popover` | Subtle, hanya untuk memisahkan layer |
| `shadow.modal` | Subtle, tidak menggantikan backdrop |

Card default memakai border `1px solid color.border-subtle`. Jangan menambah shadow besar atau efek 3D yang membuat aplikasi terasa gamified.

### 4.3 Iconography

- Gunakan satu keluarga ikon outline yang konsisten.
- Ukuran umum: 16px untuk inline metadata, 20px untuk kontrol, 24px untuk navigasi, 32px untuk empty state bila diperlukan.
- Ikon dekoratif boleh disembunyikan dari screen reader. Ikon yang menyampaikan makna wajib disertai teks atau accessible name.
- Jangan memakai ikon warna saja untuk status, severity, permission, atau hasil keputusan.
- Ikon aksi harus disertai tooltip/accessible name bila tidak ada label teks yang terlihat.
- Hindari emoji sebagai ikon antarmuka inti karena bentuk dan warna berbeda antar platform.

---

## 5. Layout and responsive behavior

### 5.1 Application shell

| Elemen | Aturan |
|---|---|
| Shell | Satu application shell; menu adaptif terhadap role/permission, bukan portal terpisah |
| Sidebar grouping | Kelompok `Workspace` untuk self-service dan `Management` untuk menu manajerial/governance bila relevan; kelompok kosong tidak ditampilkan |
| Account identity | Nama dan role aktif ringkas di area akun bagian bawah sidebar; hindari kartu konteks besar di bawah logo sebagai pola global |
| Scope/permission context | Tampilkan pada header/konteks halaman management yang memerlukannya; jangan duplikasi daftar permission sebagai chip global di sidebar. Halaman self-service tidak memerlukan daftar permission |
| Max content width | `1200px` |
| Desktop sidebar | `232px`, dapat diciutkan |
| Top navigation | Tinggi target `56px` pada desktop |
| Main content | `min-width: 0`; konten dapat scroll tanpa mendorong shell keluar viewport |
| Page padding desktop | `32px` |
| Page padding tablet | `24px` |
| Page padding mobile | `16px` |
| Self-service | Fokus pada tugas harian, satu kolom utama, whitespace cukup |
| Management/governance | Ringkasan exception, filter, lalu tabel/daftar dalam scope yang diizinkan |

### 5.1.1 Sidebar shell spacing (final baseline v1.2.2)

- Brand/logo ke label grup navigasi pertama: gunakan jarak vertikal yang terlihat dan konsisten (target desktop sekitar 24–28 px setelah brand block; nilai boleh menyesuaikan tinggi brand tetapi tidak boleh tampak menempel).
- Workspace ke Management: gunakan jarak antarkelompok eksplisit (target desktop sekitar 28–32 px), terpisah dari margin label dan jarak antaritem.
- Label grup mempunyai ruang kecil tersendiri sebelum item pertama (sekitar 8–10 px).
- Identitas akun ditempatkan di bagian paling bawah sidebar dengan separator tipis dan padding yang cukup. Jangan menggunakan kartu akun besar di bawah logo.
- Scope/permission bukan dekorasi global: tempatkan dalam konteks halaman yang relevan atau ringkasan akun bawah yang ringkas; jangan mengulang chip permission besar di bagian atas shell.
- Pada viewport pendek, jarak dapat diperkecil secara responsif; navigasi tetap dapat dicapai, tidak menimpa account footer, dan tidak menimbulkan overflow horizontal.

### 5.2 Breakpoints

Breakpoint ini adalah token layout untuk konsistensi prototype; bukan batasan bisnis.

| Nama | Lebar viewport | Pola |
|---|---|---|
| Mobile | `≤ 767px` | Satu kolom; sidebar menjadi drawer; filter menjadi panel/stack; aksi utama tetap terlihat |
| Tablet | `768–1023px` | Sidebar dapat diciutkan; dashboard menjadi grid lebih rapat; filter dapat wrap |
| Desktop | `≥ 1024px` | Sidebar dan konten berdampingan; grid dashboard penuh bila ruang memadai |

### 5.3 Responsive rules

- Tidak ada horizontal page overflow pada viewport mobile.
- Tabel lebar memakai kolom prioritas, row detail, atau container scroll yang jelas; jangan mengecilkan teks sampai tidak terbaca.
- Pada mobile, FilterBar boleh berpindah menjadi tombol **Filter** yang membuka panel. Filter aktif harus terlihat dan dapat dihapus satu per satu atau seluruhnya.
- Form panjang menjadi satu kolom pada mobile. Jangan menaruh dua kontrol wajib berdampingan bila label atau error menjadi terpotong.
- Modal form menjadi hampir selebar viewport dengan margin minimal 16px; jika konten panjang, body modal yang scroll, bukan seluruh halaman di belakangnya.
- Sidebar drawer dapat ditutup dengan tombol eksplisit, Escape, atau memilih rute; fokus dikembalikan ke pemicu setelah drawer ditutup.
- Elemen sticky tidak boleh menutupi field yang sedang fokus, pesan error, atau tombol submit.
- Layout tidak mengandalkan hover untuk menampilkan informasi atau aksi penting.

---

## 6. Accessibility and interaction foundations

### 6.1 Keyboard and focus

- Semua aksi tersedia dengan keyboard dan urutan tab mengikuti urutan baca.
- Focus ring `3px` dengan offset `2px` terlihat pada tombol, link, input, menu, tab, segmented control, dialog, dan elemen interaktif lain.
- Focus tidak dihapus hanya untuk alasan estetika.
- Modal/dialog memindahkan fokus ke konteks yang tepat, menjaga fokus di dalam dialog selama modal terbuka, mendukung Escape jika tidak ada alasan produk untuk mencegahnya, lalu mengembalikan fokus ke pemicu.
- Drawer dan menu dapat digunakan tanpa pointer.
- Selected state tidak ditunjukkan hanya melalui warna; gunakan border, check, marker, atau teks state.

### 6.2 Contrast and non-color meaning

- Teks normal minimal rasio kontras 4.5:1; teks besar dan batas/indikator komponen penting minimal 3:1.
- Warna foreground/background pada semantic tokens adalah pasangan yang ditetapkan; jangan mencampur foreground dari satu token dengan background token lain tanpa pengecekan kontras.
- Status wajib memuat label teks. Bentuk badge (filled/outlined), ikon, dan posisi ikut membedakan status.
- Error field memakai teks penjelas dan indikator field; border merah saja tidak cukup.
- Grafik harus menyediakan label, legenda, atau tabel ringkas yang setara. Jangan menjadikan warna satu-satunya cara membaca data.

### 6.3 Touch targets and text zoom

- Target sentuh minimum `44 × 44px` pada mobile; kontrol desktop umumnya minimal 40px tinggi.
- Link yang berdekatan memiliki jarak yang cukup untuk menghindari salah tekan.
- UI tetap berfungsi pada zoom browser 200%; konten tidak hilang dan aksi utama tidak tertutup.
- Teks tidak boleh dipotong jika pemotongan menghilangkan makna, alasan, atau status. Teks panjang boleh wrap; ellipsis hanya bila konten lengkap tetap bisa dibuka.

### 6.4 Motion

- Durasi transisi umum `150–200ms`, ease-out.
- Badge status tidak dianimasikan.
- Modal menggunakan fade singkat dan perpindahan kecil; toast tidak boleh menutupi aksi utama.
- Hormati `prefers-reduced-motion`: hilangkan pergerakan dekoratif, countdown tidak memakai animasi flourish.
- Tidak ada hover-lift, glow, confetti, atau gamified animation.

---

## 7. Component specifications

Komponen di bawah menentukan visual, struktur, dan state. Urutan bisnis, izin, dan transisi tetap mengikuti UI/UX Specification & Flow v1.7.2.

### 7.1 Button

| Variant | Visual | Penggunaan |
|---|---|---|
| Primary | Latar `color.brand-primary`, teks putih, kontras memadai | Satu aksi utama pada konteks |
| Secondary | Latar putih/transparent, border subtle/strong, teks primary | Aksi pendamping |
| Ghost | Tanpa fill, teks primary/secondary dengan hover surface | Aksi ringan seperti Cancel atau Export |
| Danger | Latar `#B91C1C`, teks putih | Konfirmasi aksi destruktif yang benar-benar ditetapkan sebagai destruktif |
| Link | Teks berwarna link dengan underline pada hover/focus | Navigasi inline |

- Satu primary action per area utama bila memungkinkan; aksi tambahan tidak boleh bersaing secara visual.
- Desktop: tinggi minimum 40px. Mobile: target minimum 44px.
- Sediakan state default, hover, focus-visible, pressed, disabled, loading, dan pending.
- Loading tidak boleh memungkinkan submit ganda; label tombol tetap dapat dipahami.
- Disabled state harus tetap terbaca. Bila aksi tidak berlaku untuk state/permission saat ini, lebih baik tidak dirender sesuai UI/UX Spec; disabled dipakai saat konteksnya memang membutuhkan penjelasan mengapa aksi sementara tidak tersedia.
- Jangan memakai Danger hanya untuk navigasi atau pilihan yang tidak destruktif.

### 7.2 Form fields

Mencakup text input, textarea, select, date picker, checkbox, radio, segmented control, dan search.

- Label selalu terlihat; placeholder bukan pengganti label.
- Required/optional dinyatakan dengan teks yang konsisten.
- Helper text ditempatkan dekat field; error ditempatkan dekat field dan terhubung secara aksesibel.
- Field invalid menggunakan border error, teks error, dan ikon bila membantu; jangan mengandalkan warna saja.
- Nilai yang telah diisi harus dipertahankan jika submission gagal.
- Field read-only dibedakan dari disabled: read-only masih bisa dibaca/dipilih bila sesuai; disabled menunjukkan kontrol tidak tersedia.
- Pada state saving, cegah submit berulang tanpa menghapus data pengguna.
- Tanggal efektif tidak boleh otomatis melarang tanggal lampau hanya karena komponen dipakai pada organizational assignment; aturan tanggal lampau mengikuti keputusan produk/policy yang disahkan. UI tetap menunjukkan tanggal dan preview dampak sesuai UI/UX Spec.
- Field alasan wajib memiliki ruang teks yang cukup dan tidak memakai caption sebagai label.

### 7.3 Card and list row

- Default: surface putih, border subtle 1px, radius 10px, tanpa shadow.
- Hover hanya pada card yang benar-benar interaktif; perubahan border/background cukup, tanpa lift.
- Selected row memiliki border/marker/label yang jelas.
- Read-only card tetap mempertahankan kontras dan bukan tampak disabled secara keseluruhan.
- Data padat memakai list row yang konsisten dengan label, nilai, status, dan aksi kontekstual.

### 7.4 StatusBadge — Daily Status

- Bentuk: filled soft-tint pill dengan label teks dan marker/ikon.
- Gunakan hanya untuk Daily Status `GREEN`, `AMBER`, `RED`.
- Warna memakai `status.green`, `status.amber`, atau `status.red`.
- Jangan gunakan badge ini untuk On-Time/Late/No Submission, severity blocker, atau status correction.
- `NOT_APPLICABLE — NO_COMMITMENT` menggunakan badge neutral terpisah dengan label yang jelas; bukan Daily Status GREEN.

### 7.5 SubmissionTimingBadge

- Bentuk: outlined pill dengan label teks dan ikon berbeda dari Daily Status.
- Nilai: `On-Time`, `Late`, `No Submission`.
- On-Time memakai check/clock-check; Late memakai clock; No Submission memakai ikon netral.
- No Submission selalu netral, tidak menggunakan red/danger treatment.
- Jika Final Status belum tersedia karena EOD belum ada, jangan menampilkan badge Final Status placeholder seolah-olah sudah dinilai.
- Jika Initial Daily Status dan submission timing ditampilkan bersama, keduanya tetap merupakan dua dimensi yang berbeda.

### 7.6 WorkflowStatusBadge

Gunakan untuk status workflow seperti Correction Request, Leave Request, dan lifecycle blocker. Selalu tampilkan label domain yang tepat.

| Domain | State | Treatment |
|---|---|---|
| Correction Request | Pending / menunggu Objection Window | Pending/info |
| Correction Request | Applied | Positive |
| Correction Request | Rejected | Negative |
| Leave Request | Pending | Neutral/info |
| Leave Request | Approved | Positive |
| Leave Request | Rejected | Negative |
| Blocker | Open | Neutral |
| Blocker | Acknowledged / In Progress | Info |
| Blocker | Resolved | Positive dengan label `Resolved` |
| Blocker | Closed | Positive dengan label `Closed` |
| Blocker | Accepted Risk | Amber/orange informational, bukan Closed |

`Resolved`, `Closed`, dan `Accepted Risk` tidak boleh diringkas menjadi satu state. Badge harus tetap disertai teks, bukan hanya ikon.

### 7.7 SeverityBadge

- Nilai mengikuti severity domain blocker: Low, Medium, High, Critical.
- Menggunakan token `severity.*` dan label teks.
- High dan Critical memiliki penekanan lebih tinggi, tetapi tidak membuat seluruh card berubah menjadi panel merah.
- Severity tidak sama dengan Daily Status: blocker Critical dapat memengaruhi saran status berdasarkan aturan produk, tetapi kedua label tetap ditampilkan terpisah bila keduanya relevan.

### 7.8 MorningCommitmentCard and EODWorkItemCard

Jangan memakai satu tampilan yang mencampur field Morning dan EOD tanpa konteks.

**MorningCommitmentCard**
- Menampilkan teks Commitment, Reference/Task Link jika ada, Initial Risk, dan field Known Blocker/Support Needed bila diwajibkan oleh risk.
- Mendukung slot 1–3 serta penanda draft copy-forward.
- Field EOD Outcome dan Continuation tidak ditampilkan sebagai kontrol editable pada form Morning.
- **RoleBasedPromptHint (FR-12 / AC-37 / ADR-016):**
  - Teks petunjuk kontekstual miring (*italic*), ukuran 13px, warna `color.text-secondary` (`#5C6E68`), padding/margin atas 4px.
  - Tampil tepat di bawah input teks Commitment saat field aktif atau diketik, menampilkan panduan sesuai 7 fungsi kanonikal Dutamedia (`Engineering`, `Ops & Infra`, `Finance`, `Sales Enablement`, `Delivery`, `HRGA`, `Management`) atau fallback netral.
  - Bersifat visual placeholder murni (non-binding); tidak mengontaminasi model input form dan tidak disimpan ke database.
- **QualityWarningBadge (FR-63 / AC-72 / UF-07):**
  - Banner peringatan inline non-blocking; muncul secara dinamis di bawah teks Commitment jika input terdeteksi terlalu pendek (<10 karakter) atau generik tanpa deliverable/output terukur.
  - Tampilan: latar kuning lembut/amber `color.status.amber-surface` (`#FFFBEB`), border amber halus `color.status.amber-border` (`#FDE68A`), teks amber gelap `color.status.amber-text` (`#92400E`), font size 12px, ikon info/warning kecil 14px.
  - Copy penjelas: *"Peringatan Kualitas: Komitmen terdeteksi sangat singkat atau generik. Pastikan menyebutkan deliverable terukur agar progres EOD dapat dievaluasi secara akurat."*
  - **Sifat:** Non-blocking warning (tidak mencegah pengguna menekan tombol Submit jika pengguna tetap memilih melanjutkan; bertujuan mengedukasi dan meningkatkan disiplin self-review).

**EODWorkItemCard**
- Menampilkan referensi item sumber (Morning Commitment atau Additional Work), Outcome dan Continuation sebagai dua kontrol terpisah.
- Continuation Reason muncul sebagai field terpisah saat diwajibkan oleh aturan produk.
- Reason untuk `Cancelled` ditampilkan sebagai field terpisah sesuai kebutuhan.
- Additional Work tetap berbobot visual setara dengan Commitment; label jenis item harus terlihat.
- Kartu historis atau locked bersifat read-only, dengan jalur koreksi yang sesuai bila tersedia.

### 7.9 Copy-forward collection and DraftBanner

- Draft collection diberi label bahwa item berasal dari Morning Commitment eligible hari kerja sebelumnya.
- Semua item eligible dapat ditinjau; item terpilih mengisi slot hari ini dan tetap dapat ditinjau/diedit.
- `Tomorrow Priority` ditampilkan dalam panel konteks tersendiri; tidak boleh digabung ke koleksi draft Commitment.
- Jangan memakai tombol `Confirm as-is` sebagai pengganti pemilihan dan review item. Memilih draft tidak mengirim submission.
- Item yang tidak dipilih tidak boleh terlihat seolah telah dihapus atau disubmit.
- DraftBanner bersifat informasional dan tidak menggunakan gaya warning/error.

### 7.10 Initial Daily Status and Tomorrow Priority

**Initial Daily Status**
- Tampilkan hasil agregasi dari Initial Risk dengan label yang eksplisit.
- Status bersifat read-only; UI tidak memberi kontrol untuk mengganti hasil agregasi secara manual.
- Bila tidak ada Commitment, tampilkan `NOT_APPLICABLE — NO_COMMITMENT` dan alasan yang tersimpan; jangan memakai warna GREEN.
- Bedakan Initial Daily Status dari Final Status EOD.

**Tomorrow Priority**
- Ditampilkan sebagai catatan konteks terpisah pada Morning hari kerja berikutnya bila tersedia.
- Gunakan panel info/summary dengan label `Tomorrow Priority`.
- Jangan menampilkannya sebagai Commitment, draft copy-forward, atau status risiko.

### 7.11 LockedIndicator, ExemptionBanner, and read-only states

**LockedIndicator**
- Gunakan banner netral dengan ikon lock dan label seperti “Terkunci setelah Cut-Off”.
- Tampilkan waktu Cut-Off bila tersedia dan relevan; format waktu mengikuti zona waktu yang ditetapkan.
- Jelaskan jalur yang sah: Morning Correction Request atau EOD Correction Request sesuai target.
- Jangan gunakan warna merah hanya karena record terkunci.
- Locked tidak sama dengan hidden, failed, atau disabled secara keseluruhan.

**ExemptionBanner (FR-35 / BR-07)**
- Banner tenang netral: latar `color.surface-muted` (`#F1F5F4`), border `color.border-subtle` (`#DCE7E2`), teks `color.text-secondary` (`#5C6E68`), ikon shield/info netral.
- Ditampilkan di bagian atas halaman `/today` untuk akun yang memiliki status Pengecualian Partisipasi Terbuka (Indefinite Role Exemption, misal CEO / Dewan Direksi).
- Copy penjelas: *"Akun Anda memiliki status Pengecualian Partisipasi Terbuka (Indefinite Role Exemption) sesuai kebijakan organisasi. Pengisian Check-in bersifat opsional."*
- Tidak menggunakan penekanan merah, warning mencolok, atau indikator hitung mundur yang mendesak.

### 7.12 Correction Request components

**CorrectionRequestCard**
- Menampilkan jenis target: Morning atau EOD; pemilik/ tanggal; ringkasan field yang diminta berubah; alasan; klasifikasi Minor/Material; status workflow; dan waktu penting.
- Jangan menampilkan data di luar scope pengguna.
- Nilai before/after disajikan berdampingan dengan label yang eksplisit; perubahan tidak boleh hanya ditandai warna.

**ClassificationTag**
- Minor: neutral.
- Material: informational blue dengan kontras yang memenuhi syarat.
- Label Minor/Material selalu terlihat; warna tidak boleh menyiratkan bahwa Material otomatis berarti kesalahan berat.

**ObjectionWindowIndicator**
- Menampilkan sisa waktu atau waktu berakhir sesuai data yang tersedia.
- Tampilan tetap netral pada sebagian besar window; penekanan amber hanya pada kondisi reminder akhir yang telah ditentukan.
- Jangan membuat countdown berkedip atau memakai merah sepanjang window.
- Jangan mengubah status menjadi Applied/Rejected secara visual sebelum event tersebut benar-benar terjadi.

### 7.13 BlockerCard and ActionPanel

- Header: judul/deskripsi blocker, severity, status lifecycle, waktu raised, dan impact.
- Body: Type, Impact, Owner Needed, Expected Resolution bila tersedia, dan resolution note jika sudah Resolved.
- `AuthorityTag` menampilkan sumber kewenangan yang relevan (Organizational atau Project) dalam teks yang terlihat; bukan tooltip saja.
- ActionPanel hanya menampilkan aksi yang valid untuk state dan authority aktor saat ini.
- `Resolved` menampilkan resolution note dan status menunggu konfirmasi pelapor jika sesuai; `Closed` dan `Accepted Risk` tetap dibedakan.
- Jangan menampilkan auto-close countdown atau visual yang menyiratkan blocker otomatis ditutup karena waktu berlalu.

**SupportContributionCard (FR-64 / AC-73 / UF-19)**
- Kartu pencatatan bukti dukungan rekan kerja / lintas tim yang membantu menyelesaikan blocker aktif.
- Menampilkan: Nama pendukung (Support Contributor), peran/tim kontributor, timestamp bantuan dicatat, catatan ringkas bentuk kontribusi (*Contribution Summary*), serta badge konfirmasi verifikasi dari Reporter/Owner.
- Tampilan: surface latar netral `color.surface-subtle` (`#EFF5F2`), border kiri aksen hijau `color.brand.primary` (`#1A5C47`) setebal 3px, font deskripsi 13px `color.text-primary`, dan timestamp sekunder 11px `color.text-secondary`.
- Kartu ini disematkan di dalam *Blocker Detail Activity Log* sebagai bukti kolaborasi nyata yang nantinya menjadi evidence objektif pada dimensi Collaboration framework review kinerja.

### 7.14 NotificationBell, NotificationCenter, and Push states

- NotificationBell menampilkan unread count tanpa menutupi ikon atau memanjang berlebihan.
- Preview dropdown boleh menampilkan item terbaru, tetapi full history berada di Notification Center sesuai UI/UX Spec.
- Unread dibedakan dengan surface tint dan indikator non-warna; tidak hanya menggunakan bold.
- Setiap item memiliki jenis event, ringkasan, waktu, read/unread state, dan deep link bila tersedia/berwenang.
- State Browser Push harus dibedakan: belum diminta, permission granted, permission denied, browser tidak mendukung, subscription tidak tersedia, permintaan/delivery gagal, atau status delivery belum diketahui.
- UI tidak boleh menampilkan Push berhasil hanya karena notification record dibuat. Izin Push adalah kondisi browser/perangkat user, bukan status global.
- Permission prompt hanya muncul setelah aksi pengguna yang jelas; penolakan tidak menghalangi workflow inti atau Notification Center.

### 7.15 FilterBar, DataTable, and ExportButton

**FilterBar**
- Desktop: filter utama di kiri, search di kanan jika diperlukan; boleh wrap jika ruang sempit.
- Mobile: tombol Filter membuka panel; filter aktif ditampilkan sebagai chip/summary yang dapat dihapus.
- Pilihan filter dan hasil tetap dibatasi permission scope.

**DataTable**
- Header kolom konsisten, alignment angka/tanggal konsisten, row hover hanya untuk baris interaktif.
- Sediakan state loading, empty result, load error, dan pagination bila diperlukan.
- Jangan membuat `No data`, `No results`, dan `Failed to load` tampak sama.
- Kolom status memakai badge sesuai domain; jangan menggabungkan Final Status dan Submission Timing.
- Mobile menggunakan pola tabel responsif yang tetap menjaga hubungan label dan nilai.

**ExportButton**
- Ghost/secondary action dengan ikon dan label `Export`.
- Posisi dekat judul/area data yang diekspor; hanya mengekspor data yang sesuai scope yang sedang terlihat dan izin pengguna.
- State: idle, preparing, success/download available, failed/expired bila relevan. Jangan menampilkan sukses sebelum file/tautan unduh benar-benar tersedia.
- Pesan kedaluwarsa tautan tidak boleh disamakan dengan kegagalan data sumber.

### 7.16 ExceptionSummaryWidget and dashboard panels

- Menampilkan jumlah dengan label yang eksplisit, rentang waktu, dan scope yang sedang dilihat.
- RED/AMBER, No Submission, dan blocker adalah kategori berbeda; jangan menjumlahkannya menjadi satu skor tanpa definisi requirement.
- Initial Daily Status `NOT_APPLICABLE — NO_COMMITMENT` tidak masuk hitungan GREEN dan bukan No Submission.
- Gunakan exception-first layout untuk membantu pengguna menemukan hal yang perlu ditindaklanjuti; jangan mengubahnya menjadi ranking orang atau jumlah task.
- Setiap ringkasan yang dapat diklik memiliki affordance dan mengarah ke daftar/detail dalam scope yang sama.

### 7.17 ManagerNote, CoachingRecord, and ComplianceRecord

- Note menampilkan jenis, tanggal, penulis yang berwenang, dan visibility sesuai policy.
- Perbedaan Recognition, Coaching, dan Corrective terlihat dari label, bukan hanya warna.
- Jangan menampilkan note disipliner ke aktor yang tidak berwenang.
- Note tidak boleh tampak seperti edit terhadap pernyataan asli employee.
- Compliance event `No Submission` ditampilkan sebagai evidence/fakta, bukan sanksi otomatis.
- Jangan menambahkan ilustrasi, iconografi, atau copy yang menyiratkan surat peringatan/sanksi otomatis.

### 7.18 Leave, Holiday, and Exemption components

- Leave Pending, Approved, dan Rejected memiliki label dan token workflow masing-masing.
- Pending Leave tidak ditampilkan seolah telah menjadi exception valid.
- Holiday dan individual Exemption memiliki label jenis dan effective period yang jelas.
- Jangan menjanjikan penghapusan/reklasifikasi diam-diam pada event No Submission yang sudah tercatat bila Leave disetujui kemudian; perilaku rekonsiliasi belum ditentukan di PDD/PRD.
- Aksi Approve/Reject hanya terlihat bagi Authorized Approver dalam scope; Reject menampilkan alasan sesuai UI/UX Spec.

### 7.19 EffectiveDatePicker and PolicyVersionHistory

- EffectiveDatePicker menampilkan tanggal efektif yang dipilih dan preview dampak bila disediakan UI/UX Spec.
- Jangan memblokir tanggal lampau secara default hanya karena komponen digunakan untuk organizational assignment; aturan tanggal lampau harus berasal dari keputusan produk/policy yang disahkan.
- PolicyVersionHistory menampilkan versi, effective date, owner, dan penanda current/active bila relevan.
- Nilai yang belum ditetapkan pada Launch Configuration Register tidak boleh diisi dengan default hasil tebakan.
- Kategori policy dan kontrol edit hanya muncul kepada Authorized Policy Owner untuk kategori yang sesuai.
- Aturan tetap produk/batas keamanan tidak boleh terlihat sebagai nilai policy yang bisa diedit.

### 7.20 Dialog, confirmation modal, and side panel

- Confirm dialog: lebar desktop maksimum `420px`; form dialog maksimum `560px`.
- Dialog lebar menyesuaikan viewport mobile dengan margin `16px`.
- Backdrop `overlay.modal`; fokus berada di dalam dialog saat terbuka.
- Teks menjelaskan aksi, objek yang terdampak, dan konsekuensi yang relevan. Label tombol spesifik (misalnya `Tolak pengajuan`) lebih baik daripada `Ya`.
- Cancel memakai secondary/ghost; confirm memakai primary atau danger sesuai konsekuensi.
- Danger hanya untuk tindakan destruktif. Objection pada Correction Request tidak boleh otomatis diberi visual destructive tanpa memperhatikan konteks; gunakan penekanan yang sesuai dan minta alasan jika diwajibkan.
- `ValidationPromptModal` pada EOD memberi pilihan mempertahankan pilihan pengguna atau mengikuti saran. Kedua pilihan tidak dibuat berat sebelah; tidak ada kewajiban alasan tambahan pada modal kecuali ditetapkan oleh requirement. Final Status AMBER/RED tetap memiliki field penjelasan risiko wajib.
- Jangan membuat modal menghilangkan data form yang telah diisi ketika ditutup atau gagal.

### 7.21 Toast and inline feedback

- Toast success: aksen positif, pesan ringkas, tidak menjadi satu-satunya bukti keberhasilan.
- Toast warning: warna amber dengan label yang jelas.
- Toast error: teks error yang dapat dibaca dan, bila perlu, tindakan pemulihan.
- Toast tidak boleh menutupi primary action atau field error.
- Sukses informasional dapat hilang otomatis setelah sekitar 4–6 detik; error penting tetap tersedia di halaman atau tidak otomatis hilang sebelum sempat dibaca.
- Error validasi ditampilkan inline dan tidak hanya melalui toast.
- Setelah submit gagal, input tetap terisi dan pengguna diberi langkah berikutnya yang jelas.

### 7.22 Empty, loading, error, and success states

Semua layar yang memuat data atau submit harus menentukan state berikut sesuai relevansi:

| State | Tampilan | Perilaku visual yang dilarang |
|---|---|---|
| Loading | Skeleton/indicator dengan ukuran mendekati konten yang dimuat | Menampilkan data lama seolah hasil baru bila tidak ditandai |
| Empty | Pesan konteks dan aksi berikutnya bila ada | Menyebut kegagalan teknis sebagai “tidak ada data” |
| No search results | Pesan bahwa filter/search tidak menemukan hasil dan opsi reset filter | Mengosongkan layar tanpa penjelasan |
| Error | Pesan yang jelas, mempertahankan input, opsi retry bila valid | Toast hilang sebagai satu-satunya bukti error |
| Saving/submitting | Indikator proses, aksi submit tidak bisa dipicu berulang | Mengklaim sukses sebelum server mengonfirmasi |
| Success | Konfirmasi sesuai hasil yang benar-benar diketahui | Menganggap notification record sebagai bukti Browser Push delivered |
| Read-only/locked | Data tetap terbaca, banner/label status, jalur koreksi bila tersedia | Menyembunyikan record atau memakai error merah untuk keadaan terkunci |

---

## 8. Page-level composition patterns

### 8.1 Self-service pages

Untuk My Today, History, Leave Request, Notification Center, dan Profile:

1. PageHeader: judul, konteks tanggal/periode bila relevan, primary action bila ada.
2. Context strip: deadline, locked state, Tomorrow Priority, atau informasi relevan lainnya bila berlaku.
3. Main task area: form, Commitment/EOD cards, history detail, atau list.
4. Secondary context: blocker, history, helper information.
5. Feedback state: validation, saving, success, failure, atau empty state.

Urutan aktual dan keberadaan elemen tetap mengikuti UI/UX Specification & Flow v1.7.2; pola ini tidak menambah alur baru.

### 8.2 Management and governance pages

Untuk Team/Function/Management Pulse, queues, Reports, Compliance, dan Policy Settings:

1. PageHeader dengan scope aktif yang eksplisit.
2. Exception summary bila relevan dan ditetapkan di UI/UX Spec.
3. FilterBar sesuai permission dan ukuran viewport.
4. Table/grouped list.
5. Detail panel atau route untuk pemeriksaan/aksi.
6. Export atau aksi tambahan hanya bila diizinkan.

Jangan menempatkan dashboard widget yang tidak diminta requirement hanya karena pola halaman lain memilikinya.

---

## 9. Motion and micro-interaction

| Elemen | Aturan |
|---|---|
| Hover/focus | Perubahan border/background yang halus; focus selalu jelas |
| Button press | Feedback singkat tanpa efek melompat |
| Card | Tidak ada hover lift atau glow |
| Modal | Fade + pergeseran vertikal kecil; patuhi reduced motion |
| Toast | Masuk singkat; tidak mengganggu keyboard focus |
| StatusBadge | Tidak dianimasikan |
| Countdown | Perubahan angka sederhana; tidak berkedip |
| Loading | Skeleton/spinner sederhana; tidak menyerupai perubahan status bisnis |
| State transition | Gunakan label/status baru hanya setelah data state benar-benar berubah |

---

## 10. Content and localization

- Bahasa UI utama adalah **Bahasa Indonesia**, dengan istilah teknis umum yang lazim dipakai tetap diperbolehkan.
- Label harus singkat, jelas, konsisten, dan menyatakan aksi. Hindari copy yang menyalahkan pengguna.
- Pesan error menjelaskan masalah dan cara memperbaikinya; jangan hanya menampilkan kode error teknis.
- Tanggal/waktu mengikuti zona waktu yang berlaku pada aplikasi dan menampilkan konteks tanggal/waktu secara eksplisit bila memengaruhi deadline atau audit.
- Jangan hardcode tanggal deadline, Grace Period, Objection Window, retention, escalation threshold, invitation expiry, atau nilai operasional lain yang harus berasal dari Launch Configuration Register.
- Gunakan istilah domain secara konsisten: Commitment, Additional Work, Initial Risk, Initial Daily Status, Final Status, Outcome, Continuation, Tomorrow Priority, Blocker, Correction Request, Leave Request, dan No Submission.
- Jangan mengganti istilah status untuk membuat tone terasa lebih ramah jika perubahan itu mengubah arti status produk.

---

## 11. Do and don't

### Do
- Selalu tampilkan label teks untuk status dan severity.
- Bedakan Daily Status dari Submission Timing secara bentuk, ikon, label, dan warna.
- Bedakan `NOT_APPLICABLE — NO_COMMITMENT` dari GREEN dan No Submission.
- Pertahankan bobot visual Commitment dan Additional Work yang setara.
- Pisahkan kontrol Outcome dan Continuation.
- Tampilkan AuthorityTag secara terlihat saat sumber authority penting bagi interpretasi.
- Berikan state loading, empty, error, success, locked, dan permission-denied sesuai konteks.
- Pastikan aksi berbahaya memiliki konteks dan konfirmasi yang tepat.
- Gunakan komponen responsive, keyboard-accessible, dan kontras memadai.
- Jaga data dan field yang sudah diisi saat request gagal.

### Don't
- Jangan gunakan warna brand green sebagai satu-satunya penanda Daily Status GREEN.
- Jangan gunakan merah untuk No Submission, locked, atau pending secara default.
- Jangan gabungkan Initial Daily Status, Final Status, Submission Timing, Severity, dan workflow state.
- Jangan membuat tombol `Confirm as-is` yang mengubah pemilihan draft menjadi submission.
- Jangan menampilkan RoleBasedPromptHint di luar 7 fungsi kanonikal Dutamedia yang telah ditetapkan pada PRD v1.5 atau menyimpannya sebagai data input form.
- Jangan memblokir tanggal lampau pada EffectiveDatePicker tanpa aturan produk yang disahkan.
- Jangan tampilkan success palsu saat request gagal atau delivery belum diketahui.
- Jangan memakai warna saja untuk error, selected state, status, atau grafik.
- Jangan memakai motion, glow, leaderboard, atau ranking jumlah task.
- Jangan membuat komponen visual seolah memberi kewenangan yang tidak dimiliki aktor.

---

## 12. Design QA checklist

Design System dianggap diterapkan dengan benar bila seluruh pemeriksaan berikut lolos pada prototype:

- [ ] Warna token dan pasangan foreground/background mengikuti tabel semantic; kombinasi teks normal memenuhi target kontras 4.5:1.
- [ ] Primary button memakai warna yang memenuhi kontras dengan teks putih.
- [ ] Focus keyboard terlihat di seluruh kontrol dan urutan tab logis.
- [ ] Semua status mempunyai label teks dan tidak hanya mengandalkan warna.
- [ ] Daily Status, Submission Timing, Severity, dan workflow state dibedakan.
- [ ] `NOT_APPLICABLE — NO_COMMITMENT` bukan GREEN dan bukan No Submission.
- [ ] MorningCommitmentCard tidak menampilkan kontrol Outcome/Continuation editable.
- [ ] RoleBasedPromptHint menampilkan petunjuk sesuai 7 fungsi kanonikal Dutamedia (atau fallback netral) secara murni visual tanpa mengontaminasi model input.
- [ ] EODWorkItemCard memisahkan Outcome dan Continuation.
- [ ] Draft copy-forward dapat dipilih dan ditinjau tanpa auto-submit; Tomorrow Priority terpisah.
- [ ] Locked state bersifat informatif, bukan error styling.
- [ ] ExemptionBanner tampil tenang dan informatif pada akun dengan Indefinite Role Exemption tanpa elemen intimidatif.
- [ ] Correction Request menampilkan target, alasan, klasifikasi, status, dan before/after sesuai hak akses.
- [ ] Blocker Resolved, Closed, dan Accepted Risk dibedakan.
- [ ] Push permission/delivery state tidak mengklaim keberhasilan yang belum diketahui.
- [ ] Loading, empty, no-results, error, saving, success, dan locked state memiliki perlakuan konsisten.
- [ ] Tampilan berfungsi pada mobile browser, zoom 200%, keyboard-only, dan reduced motion.
- [ ] Tidak ada dashboard ranking atau visual sanksi otomatis.
- [ ] Tidak ada nilai operasional yang dikarang; parameter yang belum ditetapkan ditandai menunggu Launch Configuration Register.

---

## 13. Batas dokumen

Dokumen ini menetapkan **visual system dan komponen**, bukan:
- business rules, role/permission, user flow, atau perubahan status produk;
- logika implementasi backend atau database;
- keputusan teknis seperti skema data, API, penyimpanan, atau arsitektur Browser Push;
- prototype final atau kontrak implementasi yang berada pada SAD/Product Backlog.

Jika sebuah visual state membutuhkan keputusan perilaku yang belum ditentukan PDD/PRD/UI/UX Spec, catat sebagai dependency dan jangan menutup kekosongan dengan asumsi desain.

---

## Riwayat Revisi

### Riwayat Revisi v1.2 — Final
- Menyelaraskan Design System dengan PDD v1.4 FINAL, PRD v1.4 FINAL, dan UI/UX Specification & Flow v1.7.2 FINAL.
- Memperbaiki konflik `ValidationPromptModal`, `DraftBanner`/copy-forward, dan `EffectiveDatePicker` yang sebelumnya mengunci perilaku yang tidak ditetapkan oleh baseline final.
- Memisahkan visual Morning Commitment dari EOD work item; menambahkan state `NOT_APPLICABLE — NO_COMMITMENT` dan panel `Tomorrow Priority`.
- Menambahkan token semantic untuk workflow status, correction, blocker lifecycle, dan Push state tanpa menggabungkan makna domain.
- Memperkuat kontras, keyboard focus, touch target, zoom, responsive layout, reduced motion, serta feedback/accessibility states.
- Menambahkan spesifikasi visual untuk correction, blocker, notifications, tables/filters/export, manager/compliance records, leave/exemption, dialogs, dan empty/error/loading states.
- Mempertahankan semua nilai bisnis dan batas yang ditetapkan pada PDD/PRD/UI/UX Spec; nilai operasional yang belum disahkan tidak dikarang.

### Riwayat Revisi v1.3.0 — FINAL
- Menyelaraskan Design System dengan **PDD v1.4 FINAL**, **PRD v1.5 FINAL**, dan **UI/UX Specification & Flow v1.8.0 FINAL**.
- Menambahkan spesifikasi visual komponen `RoleBasedPromptHint` (teks miring 13px, `color.text-secondary`, non-binding visual placeholder) untuk 7 fungsi kanonikal Dutamedia.
- Menambahkan spesifikasi visual komponen `ExemptionBanner` (`color.surface-muted`, border `color.border-subtle`, teks `color.text-secondary`) pada `/today` untuk akun eksekutif dengan Indefinite Role Exemption.
- Memastikan seluruh token semantic, badge, dan layout mendukung taksonomi Blocker 10 Type / 4 Severity / 7 Impact serta alur Reopen oleh pelapor.
