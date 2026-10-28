/**
 * Konstanta Aturan Tetap Produk untuk Daily Accountability (PDD §8, PRD BR-01).
 * Batas jumlah komitmen harian adalah aturan baku produk, bukan parameter kebijakan (Policy).
 */
export const MIN_DAILY_COMMITMENTS = 1;
export const MAX_DAILY_COMMITMENTS = 3;

/**
 * ADR-014: Ambang lead-time pengingat batas waktu penyerahan (cutoff).
 * Aturan baku produk MVP: 60 menit sebelum On-Time Deadline [OnTimeDeadline - 60m, OnTimeDeadline).
 */
export const CUTOFF_REMINDER_LEAD_TIME_MINUTES = 60;

/**
 * Batas defensif jumlah kandidat per batch pengingat untuk mencegah alokasi memori tak terbatas.
 * Bukan batas mutlak kapasitas organisasi.
 */
export const DEFAULT_MAX_REMINDER_BATCH = 200;

