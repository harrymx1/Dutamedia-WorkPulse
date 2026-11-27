export function truncateOptionText(text: string, maxLen = 44): string {
  const trimmed = (text || '').trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1).trimEnd()}…`;
}

export function formatCorrectionStatusLabel(status?: string): string {
  switch (status) {
    case 'AUTO_APPLIED':
      return 'Diterapkan Otomatis';
    case 'PENDING':
      return 'Menunggu Persetujuan';
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    default:
      return status || '-';
  }
}

export function formatCorrectionClassificationLabel(classification?: string): string {
  switch (classification) {
    case 'MINOR':
      return 'Perubahan Minor';
    case 'MATERIAL':
      return 'Perubahan Material';
    default:
      return classification || '-';
  }
}
