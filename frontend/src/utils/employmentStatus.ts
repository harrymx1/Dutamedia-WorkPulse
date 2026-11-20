export type EmploymentStatusCode = 'PERMANENT' | 'CONTRACT' | 'INTERN';

export const EMPLOYMENT_STATUS_OPTIONS: Array<{
  value: EmploymentStatusCode;
  label: string;
}> = [
  { value: 'PERMANENT', label: 'Karyawan Tetap' },
  { value: 'CONTRACT', label: 'Kontrak' },
  { value: 'INTERN', label: 'Intern (Magang)' },
];

export const EMPLOYMENT_STATUS_FILTER_OPTIONS: Array<{
  value: 'ALL' | EmploymentStatusCode;
  label: string;
}> = [
  { value: 'ALL', label: 'Semua Status Karyawan' },
  { value: 'PERMANENT', label: 'Karyawan Tetap' },
  { value: 'CONTRACT', label: 'Kontrak' },
  { value: 'INTERN', label: 'Intern (Magang)' },
];

export function formatEmploymentStatusLabel(status?: string | null): string {
  switch (String(status || '').toUpperCase()) {
    case 'INTERN':
      return 'Intern';
    case 'CONTRACT':
      return 'Kontrak';
    case 'PERMANENT':
    default:
      return 'Karyawan Tetap';
  }
}

export function isInternStatus(status?: string | null): boolean {
  return String(status || '').toUpperCase() === 'INTERN';
}

export function formatLeaveTypeLabel(type?: string | null): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Sakit';
    case 'PERMIT':
      return 'Izin';
    case 'SPECIAL_LEAVE':
      return 'Cuti Khusus';
    case 'MATERNITY':
      return 'Cuti Melahirkan';
    case 'UNPAID':
      return 'Cuti di Luar Tanggungan';
    default:
      return type || 'Cuti Tahunan';
  }
}
