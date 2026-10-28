import { PolicyCategory } from '@prisma/client';

export interface CheckinTimingConfig {
  morningOnTimeCutoff: string; // e.g. "09:00"
  morningLockCutoff: string;   // e.g. "09:30"
  eodOnTimeCutoff: string;       // e.g. "17:00"
  eodLockCutoff: string;         // e.g. "21:00"
  timezone: string;              // "Asia/Jakarta"
}

export interface BlockerSlaConfig {
  level1Hours: number;           // 4 jam kerja
  level2Hours: number;           // 8 jam kerja
  autoEscalateAfterHours: number;// 4 jam kerja tanpa respon
  operatingHoursStart: string;   // "09:00"
  operatingHoursEnd: string;     // "17:00"
  countWeekends: boolean;        // false
}

export interface ComplianceThresholdConfig {
  carryOverAmberDays: number;            // 3 hari berturut-turut
  allowGreenWithCarryOver: boolean;      // true (DEC-003: Dilarang Lock Green)
  maxConsecutiveNoSubmissions: number;   // 2
  minCommitmentsPerDay: number;          // 0 (DEC-004)
  maxCommitmentsPerDay: number;          // 3 (DEC-004)
  zeroCommitmentRequiresReason: boolean; // true
}

export interface CorrectionWindowConfig {
  maxCorrectionDays: number;
  requireDirectManagerApproval: boolean;
  requireHrgaApproval: boolean;
}

export interface NotificationReminderConfig {
  morningReminderMinutesBefore: number; // 60 menit
  eodReminderMinutesBefore: number;     // 60 menit
  slaWarningPercent: number;            // 75% durasi SLA
}

export const CANONICAL_POLICY_FALLBACKS: Record<PolicyCategory, any> = {
  [PolicyCategory.CHECKIN_TIMING]: {
    morningOnTimeCutoff: '09:00',
    morningLockCutoff: '09:30',
    eodOnTimeCutoff: '17:00',
    eodLockCutoff: '21:00',
    timezone: 'Asia/Jakarta',
  } as CheckinTimingConfig,

  [PolicyCategory.BLOCKER_SLA]: {
    level1Hours: 4,
    level2Hours: 8,
    autoEscalateAfterHours: 4,
    operatingHoursStart: '09:00',
    operatingHoursEnd: '17:00',
    countWeekends: false,
  } as BlockerSlaConfig,

  [PolicyCategory.COMPLIANCE_THRESHOLD]: {
    carryOverAmberDays: 3,
    allowGreenWithCarryOver: true,
    maxConsecutiveNoSubmissions: 2,
    minCommitmentsPerDay: 0,
    maxCommitmentsPerDay: 3,
    zeroCommitmentRequiresReason: true,
  } as ComplianceThresholdConfig,

  [PolicyCategory.CORRECTION_WINDOW]: {
    maxCorrectionDays: 7,
    requireDirectManagerApproval: true,
    requireHrgaApproval: true,
  } as CorrectionWindowConfig,

  [PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD]: {
    morningReminderMinutesBefore: 60,
    eodReminderMinutesBefore: 60,
    slaWarningPercent: 75,
  } as NotificationReminderConfig,
};
