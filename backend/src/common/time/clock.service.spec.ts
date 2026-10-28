import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClockService } from './clock.service';

describe('ClockService (Clock Injection Mechanism - SAD III.3)', () => {
  let clockService: ClockService;

  beforeEach(() => {
    clockService = new ClockService();
  });

  afterEach(() => {
    clockService.reset();
  });

  it('should return current system date by default when not mocked', () => {
    const before = Date.now();
    const now = clockService.now().getTime();
    const after = Date.now();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
    expect(clockService.isMocked()).toBe(false);
  });

  it('should return injected mock time precisely when set', () => {
    const mockIso = '2026-10-28T09:15:00.000+07:00';
    clockService.setMockTime(mockIso);

    expect(clockService.isMocked()).toBe(true);
    expect(clockService.now().toISOString()).toBe(new Date(mockIso).toISOString());
    expect(clockService.todayString('Asia/Jakarta')).toBe('2026-10-28');
  });

  it('should restore real system clock upon reset()', () => {
    clockService.setMockTime('2020-01-01T00:00:00.000Z');
    expect(clockService.isMocked()).toBe(true);

    clockService.reset();
    expect(clockService.isMocked()).toBe(false);
    expect(clockService.now().getFullYear()).toBeGreaterThanOrEqual(2026);
  });
});

