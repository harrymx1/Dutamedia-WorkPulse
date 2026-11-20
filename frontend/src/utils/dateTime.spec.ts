import { describe, it, expect } from 'vitest';
import {
  formatTimeWib,
  formatDateTimeWib,
  formatShortDateTimeWib,
  formatDateWib,
  formatDateRangeWib,
  formatDateSpanWib,
  formatWeekdayDateWib,
  getTodayIsoWib,
} from './dateTime';

describe('dateTime.ts (Paket #4 — Penguncian Zona Waktu WIB & Format 24 Jam Seragam)', () => {
  it('converts UTC timestamp to canonical 24-hour WIB formats with colon separator and no seconds', () => {
    // 07:14:54 UTC === 14:14:54 WIB (UTC+7)
    const utc = '2026-11-18T07:14:54.000Z';

    expect(formatTimeWib(utc)).toBe('14:14 WIB');
    expect(formatDateTimeWib(utc)).toBe('18 Nov 2026, 14:14 WIB');
    expect(formatShortDateTimeWib(utc)).toBe('18 Nov, 14:14 WIB');
    expect(formatDateWib(utc)).toBe('18 Nov 2026');
  });

  it('handles UTC midnight crossing into next Jakarta calendar day accurately (UTC+7)', () => {
    // 17:30:45 UTC on Nov 18 === 00:30:45 WIB on Nov 19
    const lateUtc = '2026-11-18T17:30:45.000Z';

    expect(formatTimeWib(lateUtc)).toBe('00:30 WIB');
    expect(formatDateTimeWib(lateUtc)).toBe('19 Nov 2026, 00:30 WIB');
    expect(formatShortDateTimeWib(lateUtc)).toBe('19 Nov, 00:30 WIB');
    expect(formatDateWib(lateUtc)).toBe('19 Nov 2026');
    expect(getTodayIsoWib(new Date(lateUtc))).toBe('2026-11-19');
  });

  it('handles exact 00:00 WIB without emitting 24:00', () => {
    // 17:00:00 UTC === 00:00 WIB next day
    expect(formatTimeWib('2026-11-18T17:00:00.000Z')).toBe('00:00 WIB');
  });

  it('formats pure YYYY-MM-DD calendar dates, ranges, spans, and Indonesian weekdays in WIB', () => {
    expect(formatDateWib('2026-11-19')).toBe('19 Nov 2026');
    expect(formatDateRangeWib('2026-11-19', '2026-11-19')).toBe('19 Nov 2026');
    expect(formatDateRangeWib('2026-11-24', '2026-11-25')).toBe('24 Nov – 25 Nov 2026');
    expect(formatDateRangeWib('2026-12-30', '2027-01-02')).toBe('30 Des 2026 – 2 Jan 2027');
    expect(formatDateSpanWib('2026-11-19', '2026-11-19')).toBe('19 Nov 2026 s/d 19 Nov 2026');
    expect(formatWeekdayDateWib('2026-11-19')).toBe('Kamis, 19 November 2026');
  });

  it('returns fallback cleanly for null, empty, or invalid inputs', () => {
    expect(formatTimeWib(null)).toBe('-');
    expect(formatDateTimeWib('')).toBe('-');
    expect(formatShortDateTimeWib('bukan-tanggal', 'Hari ini')).toBe('Hari ini');
    expect(formatDateWib(undefined, '-')).toBe('-');
  });
});
