import { Injectable } from '@nestjs/common';

@Injectable()
export class ClockService {
  private mockedDate: Date | null = null;

  /**
   * Mengembalikan waktu saat ini.
   * Bila waktu di-mock (selama pengujian batas waktu / cutoff), mengembalikan mockedDate.
   */
  now(): Date {
    return this.mockedDate ? new Date(this.mockedDate.getTime()) : new Date();
  }

  /**
   * Mengembalikan timestamp milidetik.
   */
  nowMillis(): number {
    return this.now().getTime();
  }

  /**
   * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD sesuai zona waktu yang diberikan.
   */
  todayString(timeZone = 'Asia/Jakarta'): string {
    const d = this.now();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  }

  /**
   * Khusus Pengujian: Injeksi waktu server secara deterministik (DEC-002, SAD III.3).
   */
  setMockTime(date: Date | string): void {
    this.mockedDate = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  }

  /**
   * Khusus Pengujian: Reset waktu kembali ke jam sistem riil.
   */
  reset(): void {
    this.mockedDate = null;
  }

  /**
   * Memeriksa apakah waktu saat ini sedang di-mock.
   */
  isMocked(): boolean {
    return this.mockedDate !== null;
  }
}

