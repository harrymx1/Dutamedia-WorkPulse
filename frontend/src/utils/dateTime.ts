/**
 * Pusat Pengatur Format Tanggal & Jam WorkPulse (Paket #4).
 *
 * Seluruh tampilan layar dikunci 100% ke zona waktu resmi kantor PT Dutamedia:
 * Asia/Jakarta (WIB / UTC+7), format 24 jam penuh, pemisah titik dua (:),
 * tanpa detik, dan selalu menyertakan akhiran "WIB" pada tampilan yang memuat jam.
 */

export const WORKPULSE_TIMEZONE = 'Asia/Jakarta';

const ID_MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

const ID_MONTH_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

const ID_WEEKDAY_LONG: Record<string, string> = {
  Sun: 'Minggu',
  Mon: 'Senin',
  Tue: 'Selasa',
  Wed: 'Rabu',
  Thu: 'Kamis',
  Fri: 'Jumat',
  Sat: 'Sabtu',
};

interface WibDateParts {
  year: string;
  monthIndex: number; // 0..11
  day: number;
  hour: string;
  minute: string;
  weekdayEn: string;
}

function parseDateInput(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  // Pure calendar date YYYY-MM-DD: parse at 00:00:00Z (07:00 WIB -> tanggal kalender sama persis)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

function extractWibParts(date: Date): WibDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: WORKPULSE_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  let hour = get('hour').padStart(2, '0');
  if (hour === '24') hour = '00';
  const minute = get('minute').padStart(2, '0');
  const monthNum = parseInt(get('month'), 10);
  const dayNum = parseInt(get('day'), 10);

  return {
    year: get('year'),
    monthIndex: Number.isFinite(monthNum) ? Math.max(0, Math.min(11, monthNum - 1)) : 0,
    day: Number.isFinite(dayNum) ? dayNum : 1,
    hour,
    minute,
    weekdayEn: get('weekday'),
  };
}

/**
 * Format 1 — Jam saja (24 jam WIB tanpa detik):
 * Contoh: "14:14 WIB"
 */
export function formatTimeWib(value?: string | Date | null, fallback = '-'): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const p = extractWibParts(date);
  return `${p.hour}:${p.minute} WIB`;
}

/**
 * Format 2 — Tanggal + Jam lengkap (24 jam WIB tanpa detik):
 * Contoh: "18 Nov 2026, 14:14 WIB"
 */
export function formatDateTimeWib(value?: string | Date | null, fallback = '-'): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const p = extractWibParts(date);
  return `${p.day} ${ID_MONTH_SHORT[p.monthIndex]} ${p.year}, ${p.hour}:${p.minute} WIB`;
}

/**
 * Format 3 — Tanggal pendek + Jam (ruang sempit, 24 jam WIB tanpa detik):
 * Contoh: "18 Nov, 14:14 WIB"
 */
export function formatShortDateTimeWib(value?: string | Date | null, fallback = '-'): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const p = extractWibParts(date);
  return `${p.day} ${ID_MONTH_SHORT[p.monthIndex]}, ${p.hour}:${p.minute} WIB`;
}

/**
 * Format 4 — Tanggal saja (dikunci ke kalender Asia/Jakarta):
 * Contoh: "18 Nov 2026"
 */
export function formatDateWib(value?: string | Date | null, fallback = '-'): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const p = extractWibParts(date);
  return `${p.day} ${ID_MONTH_SHORT[p.monthIndex]} ${p.year}`;
}

/**
 * Format rentang tanggal (cuti / dispensasi / periode), terkunci ke WIB:
 * - Tanggal sama: "18 Nov 2026"
 * - Tahun sama: "18 Nov – 20 Nov 2026"
 * - Beda tahun: "30 Des 2026 – 2 Jan 2027"
 */
export function formatDateRangeWib(
  start?: string | Date | null,
  end?: string | Date | null,
  fallback = '-',
): string {
  const sDate = parseDateInput(start);
  const eDate = parseDateInput(end);
  if (!sDate || !eDate) return fallback;
  const s = extractWibParts(sDate);
  const e = extractWibParts(eDate);
  if (s.year === e.year && s.monthIndex === e.monthIndex && s.day === e.day) {
    return `${s.day} ${ID_MONTH_SHORT[s.monthIndex]} ${s.year}`;
  }
  if (s.year === e.year) {
    return `${s.day} ${ID_MONTH_SHORT[s.monthIndex]} – ${e.day} ${ID_MONTH_SHORT[e.monthIndex]} ${e.year}`;
  }
  return `${s.day} ${ID_MONTH_SHORT[s.monthIndex]} ${s.year} – ${e.day} ${ID_MONTH_SHORT[e.monthIndex]} ${e.year}`;
}

/**
 * Format rentang tanggal dengan penghubung "s/d" (spanduk cuti):
 * Contoh: "19 Nov 2026 s/d 19 Nov 2026"
 */
export function formatDateSpanWib(
  start?: string | Date | null,
  end?: string | Date | null,
  fallback = '',
): string {
  const sText = formatDateWib(start, '');
  const eText = formatDateWib(end, '');
  if (!sText || !eText) return fallback;
  return `${sText} s/d ${eText}`;
}

/**
 * Format hari & tanggal lengkap bahasa Indonesia terkunci ke WIB (header konteks hari kerja):
 * Contoh: "Kamis, 19 November 2026"
 */
export function formatWeekdayDateWib(value?: string | Date | null, fallback = ''): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const p = extractWibParts(date);
  const weekday = ID_WEEKDAY_LONG[p.weekdayEn] || p.weekdayEn;
  return `${weekday}, ${p.day} ${ID_MONTH_LONG[p.monthIndex]} ${p.year}`;
}

/**
 * Tanggal hari ini format YYYY-MM-DD terkunci ke Asia/Jakarta (WIB).
 */
export function getTodayIsoWib(now: Date = new Date()): string {
  const p = extractWibParts(now);
  const mm = String(p.monthIndex + 1).padStart(2, '0');
  const dd = String(p.day).padStart(2, '0');
  return `${p.year}-${mm}-${dd}`;
}
