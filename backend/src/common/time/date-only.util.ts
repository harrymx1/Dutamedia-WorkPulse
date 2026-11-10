/**
 * Mengonversi objek Date (atau waktu saat ini) menjadi string tanggal kalender YYYY-MM-DD
 * sesuai zona waktu operasional (default: Asia/Jakarta / WIB).
 */
export function toJakartaDateString(
  date: Date = new Date(),
  timeZone = 'Asia/Jakarta',
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Mengonversi objek Date (atau waktu saat ini) menjadi objek Date pada pukul 00:00:00.000Z
 * dari tanggal kalender WIB (Asia/Jakarta).
 * Digunakan untuk perbandingan kolom PostgreSQL bertipe @db.Date (effectiveDate, expiryDate, endDate)
 * agar tetap aktif penuh sepanjang hari terakhir hingga pukul 23:59:59 WIB.
 */
export function toJakartaDateOnly(
  date: Date = new Date(),
  timeZone = 'Asia/Jakarta',
): Date {
  return new Date(toJakartaDateString(date, timeZone));
}

