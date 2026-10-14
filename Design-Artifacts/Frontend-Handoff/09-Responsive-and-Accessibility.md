# 09 — Responsive Layout and Accessibility Specification
## WorkPulse UI/UX Extraction & Frontend Handoff Package

| Metadata Dokumen | Nilai |
|---|---|
| **Dokumen ID** | WP-HND-09 |
| **Versi** | 1.0.0 (FINAL) |
| **Tanggal Ekstraksi** | 11 Oktober 2026 |
| **Standar Aksesibilitas** | W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA |
| **Sistem Grid** | Vuetify 3 Responsive Grid System (Flexbox 12-column) |

---

## 1. Sistem Breakpoint & Adaptasi Viewport

Sesuai spesifikasi resmi Design System v1.1 dan laporan audit visual S3-T4:

| Kategori Viewport | Rentang Resolusi | Representasi Target Device | Perilaku Layout Shell | Navigasi & Sidebar |
|---|---|---|---|---|
| **Desktop Standar** | `≥ 1024 px` | 1280 × 800, 1440 × 900, 1920 × 1080 | Multi-column grid (2-3 kolom), max content width 1200px terpusat. | Sidebar navigasi tetap (*fixed sidebar*) selebar 232px di sisi kiri. |
| **Tablet Portrait/Landscape**| `768 px – 1023 px` | 768 × 1024 (iPad Portrait), 1024 × 768 | Grid beradaptasi menjadi 1-2 kolom, padding kontainer 16px. | Sidebar dapat diciutkan (*collapsible drawer*) via hamburger menu. |
| **Mobile Standard & Compact** | `≤ 767 px` | 390 × 844 (iPhone 13/14), 375 × 667 (iPhone SE) | Single column layout (100% width), stack vertikal seluruh kartu/form. | Drawer navigasi melayang (*temporary modal drawer*) dengan overlay backdrop. |

---

## 2. Aturan Adaptasi Komponen pada Layar Bergerak (Mobile Rules)

### 2.1 Tabel Data & Overflow Alternatif
- **Desktop**: Vuetify `VDataTable` standar dengan sorting, multi-column data, dan pagination.
- **Mobile (`≤ 767 px`)**:
  - Tabel roster tim dan antrean kepatuhan otomatis beralih dari tampilan tabel tabular menjadi **kartu bertumpuk (*stacked card view*)**.
  - Setiap baris data menjadi satu unit kartu mandiri (`CommitmentCard` atau `BlockerCard`) dengan badge status di pojok kanan atas.
  - Meniadakan horizontal scrollbar yang tidak disengaja (`0 accidental horizontal overflow`).

### 2.2 Formulir & Kontrol Masukan
- Lebar form 100% di mobile dengan padding horizontal 16px.
- Tinggi target sentuh (*touch target*) untuk tombol dan input interaktif adalah **minimal 44 × 44 px** (WCAG Target Size).
- Tombol aksi utama (CTA) pada formulir `/today` diregangkan selebar kontainer (`block variant`) agar mudah dijangkau satu tangan.

### 2.3 Modal Dialog & Drawer
- **Desktop**: Dialog mengambang terpusat dengan `max-width: 480px` s.d. `640px`, radius sudut `14px`.
- **Mobile**: Dialog otomatis bertransformasi menjadi **bottom-sheet drawer** atau mengambil 95% lebar layar dengan tombol close yang mudah diakses.

---

## 3. Spesifikasi Aksesibilitas (WCAG 2.1 Level AA)

### 3.1 Komunikasi Status Non-Warna (Color-Blind Friendly)
WorkPulse melarang keras pengomunikasian status yang HANYA mengandalkan warna:
1. **Daily Status**: Memiliki indikator ganda berupa teks eksplisit (`GREEN`, `AMBER`, `RED`) + bentuk pill terisi + solid dot icon.
2. **Submission Timing**: Menggunakan bentuk berbeda secara struktural (**outline pill**) + ikon MDI pembeda (Centang untuk On-Time, Jam untuk Late, Minus untuk No Submission).
3. **Blocker Severity**: Disertai label teks tegas (`Low`, `Medium`, `High`, `Critical`) dan icon alert untuk Critical.

### 3.2 Rasio Kontras Warna (Minimum 4.5:1 untuk Teks Normal)
- Teks Utama (`#0E211B`) pada Background Base (`#F7FAF9`): Rasio kontras **13.8:1** (LULUS AAA).
- Teks Sekunder (`#5C6E68`) pada Surface Putih (`#FFFFFF`): Rasio kontras **5.1:1** (LULUS AA).
- Teks Tombol Accent (`#FFFFFF`) pada Accent Primary (`#00674D`): Rasio kontras **6.2:1** (LULUS AA).
- Teks GREEN (`#15803D`) pada Green Tint (`rgba(34,197,94,0.12)`): Rasio kontras **4.8:1** (LULUS AA).
- Teks RED (`#B91C1C`) pada Red Tint (`rgba(220,38,38,0.12)`): Rasio kontras **5.6:1** (LULUS AA).

### 3.3 Navigasi Keyboard & Fokus
- Seluruh elemen interaktif dapat dijangkau menggunakan tombol `Tab` dan `Shift+Tab`.
- Tombol dan form fields memiliki cincin fokus (*focus ring*) yang jelas: outline border strong `#A9C7BC` dengan offset 2px.
- Dialog modal menerapkan **focus trapping**: tombol Tab berputar di dalam modal saat dialog aktif dan tombol `Escape` menutup modal.

### 3.4 Screen Reader Support (ARIA)
- Komponen status memiliki `aria-label` deskriptif (misal: `aria-label="Status Harian: AMBER - Berisiko Terhambat"`).
- Input formulir wajib ditandai dengan `aria-required="true"` dan pesan kesalahan terhubung via `aria-describedby`.
- Chip hitung mundur masa sanggahan memiliki `aria-live="polite"` untuk mengumumkan pembaruan waktu tanpa menginterupsi pengguna.

### 3.5 Dukungan Zoom 200% & Reduced Motion
- Konten teks dapat diperbesar hingga 200% tanpa menyebabkan pemotongan teks (*text clipping*) atau kehilangan fungsionalitas.
- Sistem menghormati preferensi OS `prefers-reduced-motion: reduce` dengan menonaktifkan transisi animasi slide dan hanya menggunakan fade sederhana.
