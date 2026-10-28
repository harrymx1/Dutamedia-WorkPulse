/**
 * Konstanta Aturan Tetap Produk untuk Compliance Domain (PDD §7, PRD BR-12, FR-29, ADR-008).
 * Ambang batas akumulasi kejadian NoSubmission untuk menerbitkan PatternFlag adalah aturan baku produk,
 * bukan parameter kebijakan (Policy) yang dapat dikonfigurasi.
 */
export const PATTERN_FLAG_THRESHOLD_COUNT = 3;
