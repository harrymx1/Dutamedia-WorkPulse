import { PolicyCategory } from '@prisma/client';
import { CANONICAL_POLICY_FALLBACKS } from '../../policy/policy.constants';

export interface ActiveExemptionInfo {
  type: 'BOUNDED' | 'ROLE_INDEFINITE';
  category: string;
  startDate: string | null;
  endDate: string | null;
}

export interface ReminderScheduleInfo {
  leadMinutes: number;
  morningReminderTime: string;
  eodReminderTime: string;
  morningOnTimeCutoff: string;
  eodOnTimeCutoff: string;
}

function toIsoDateOnly(value?: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  return String(value).slice(0, 10);
}

export function subtractMinutesFromHHmm(hhmm: string, minutesToSubtract: number): string {
  const match = /^(\d{2}):(\d{2})$/.exec((hhmm || '').trim());
  if (!match) return '08:00';
  const totalMinutes = Number(match[1]) * 60 + Number(match[2]) - minutesToSubtract;
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const m = String(wrapped % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export async function resolveUserProfileExtras(
  prisma: any,
  userId: string,
  role: string,
  today: Date,
): Promise<{
  activeExemption: ActiveExemptionInfo | null;
  reminderSchedule: ReminderScheduleInfo;
}> {
  let activeExemption: ActiveExemptionInfo | null = null;

  if (prisma?.boundedExemption?.findFirst) {
    const ex = await prisma.boundedExemption.findFirst({
      where: {
        userId,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      orderBy: { endDate: 'desc' },
      select: {
        exemptionCategory: true,
        startDate: true,
        endDate: true,
      },
    });
    if (ex) {
      activeExemption = {
        type: 'BOUNDED',
        category: String(ex.exemptionCategory || 'Dispensasi Kerja'),
        startDate: toIsoDateOnly(ex.startDate),
        endDate: toIsoDateOnly(ex.endDate),
      };
    }
  }

  if (!activeExemption && (role === 'CEO_MANAGEMENT' || role === 'CEO')) {
    activeExemption = {
      type: 'ROLE_INDEFINITE',
      category: 'Pengecualian Peran Eksekutif',
      startDate: null,
      endDate: null,
    };
  }

  const timingFallback = CANONICAL_POLICY_FALLBACKS[PolicyCategory.CHECKIN_TIMING];
  let morningOnTimeCutoff: string = timingFallback.morningOnTimeCutoff;
  let eodOnTimeCutoff: string = timingFallback.eodOnTimeCutoff;

  if (prisma?.policy?.findFirst) {
    const activeTiming = await prisma.policy.findFirst({
      where: {
        category: PolicyCategory.CHECKIN_TIMING,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
      select: { configurationValues: true },
    });

    const cfg = activeTiming?.configurationValues as Record<string, any> | undefined;
    if (cfg) {
      if (typeof cfg.morningOnTimeCutoff === 'string' && /^\d{2}:\d{2}$/.test(cfg.morningOnTimeCutoff)) {
        morningOnTimeCutoff = cfg.morningOnTimeCutoff;
      }
      if (typeof cfg.eodOnTimeCutoff === 'string' && /^\d{2}:\d{2}$/.test(cfg.eodOnTimeCutoff)) {
        eodOnTimeCutoff = cfg.eodOnTimeCutoff;
      }
    }
  }

  const leadMinutes = 60;
  return {
    activeExemption,
    reminderSchedule: {
      leadMinutes,
      morningReminderTime: subtractMinutesFromHHmm(morningOnTimeCutoff, leadMinutes),
      eodReminderTime: subtractMinutesFromHHmm(eodOnTimeCutoff, leadMinutes),
      morningOnTimeCutoff,
      eodOnTimeCutoff,
    },
  };
}
