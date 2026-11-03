import { describe, it, expect } from 'vitest';
import { getUserInitials } from './initials';

describe('getUserInitials (IMP-020 — Avatar Initials Standardization)', () => {
  it('handles 1-word name by taking first two characters', () => {
    expect(getUserInitials('Harry')).toBe('HA');
    expect(getUserInitials('admin')).toBe('AD');
    expect(getUserInitials('Budi')).toBe('BU');
  });

  it('handles 1-character name by returning that single character', () => {
    expect(getUserInitials('H')).toBe('H');
    expect(getUserInitials('A')).toBe('A');
  });

  it('handles 2-word name by taking first char of each word', () => {
    expect(getUserInitials('Harry Phalosa')).toBe('HP');
    expect(getUserInitials('Aditya Nugroho')).toBe('AN');
    expect(getUserInitials('Budi Pratama')).toBe('BP');
  });

  it('handles 3-word name by taking first char of first and last words', () => {
    expect(getUserInitials('Harry Aditya Phalosa')).toBe('HP');
    expect(getUserInitials('Muhammad Rizki Pratama')).toBe('MP');
  });

  it('handles 4+ words name by taking first char of first and last words', () => {
    expect(getUserInitials('Harry Aditya Nugroho Phalosa')).toBe('HP');
    expect(getUserInitials('Raden Mas Panji Sosrokartono')).toBe('RS');
  });

  it('ignores redundant whitespace at start, end, and in between', () => {
    expect(getUserInitials('   Harry    Phalosa   ')).toBe('HP');
    expect(getUserInitials('   Harry   Aditya   Phalosa  ')).toBe('HP');
    expect(getUserInitials('   Harry   ')).toBe('HA');
  });

  it('ignores parenthesized roles/positions within name string (IMP-021)', () => {
    expect(getUserInitials('Aditya Nugroho (Frontend Engineer)')).toBe('AN');
    expect(getUserInitials('Bambang Pratama (Tech Lead)')).toBe('BP');
    expect(getUserInitials('Dewi Lestari (Lead HRGA)')).toBe('DL');
    expect(getUserInitials('Hendra Wijaya (Direktur Utama)')).toBe('HW');
  });

  it('falls back to first two characters of email if name is missing or empty', () => {
    expect(getUserInitials(null, 'dev.frontend@dutamedia.com')).toBe('DE');
    expect(getUserInitials('', 'admin@dutamedia.com')).toBe('AD');
    expect(getUserInitials('   ', 'harry@example.com')).toBe('HA');
  });

  it('falls back to U if both name and email are missing or empty', () => {
    expect(getUserInitials(null, null)).toBe('U');
    expect(getUserInitials('', '')).toBe('U');
    expect(getUserInitials('   ', '   ')).toBe('U');
    expect(getUserInitials(undefined, undefined)).toBe('U');
  });
});
