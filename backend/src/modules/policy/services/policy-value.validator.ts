import { Injectable } from '@nestjs/common';
import { PolicyCategory } from '@prisma/client';
import { BusinessRuleViolationException } from '../../shared/exceptions/api.exception.js';
import type { ErrorDetail } from '../../shared/dto/base-response.dto.js';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const ALLOWED_KEYS: Record<PolicyCategory, readonly string[]> = {
  [PolicyCategory.Cutoff]: ['morningOnTimeDeadline', 'eodOnTimeDeadline'],
  [PolicyCategory.GracePeriod]: ['morningGraceMinutes', 'eodGraceMinutes'],
  [PolicyCategory.WorkdayCalendar]: ['workDays'],
  [PolicyCategory.EscalationThreshold]: ['unacknowledgedThresholdHours'],
  [PolicyCategory.CoachingFollowUpPeriod]: ['coachingWindowDays'],
  [PolicyCategory.RetentionPeriod]: ['backupRetentionDays', 'exportRetentionMinutes'],
  [PolicyCategory.ExemptionRule]: [],
  [PolicyCategory.ObjectionWindowDuration]: ['durationHours'],
  [PolicyCategory.MinorMaterialThreshold]: ['wordsChangedThreshold'],
  [PolicyCategory.ParticipationRule]: [],
  [PolicyCategory.ReminderThreshold]: ['objectionWindowReminderHours', 'leavePendingReminderHours'],
};

const REQUIRED_KEYS: Record<PolicyCategory, readonly string[]> = {
  [PolicyCategory.Cutoff]: ['morningOnTimeDeadline', 'eodOnTimeDeadline'],
  [PolicyCategory.GracePeriod]: ['morningGraceMinutes', 'eodGraceMinutes'],
  [PolicyCategory.WorkdayCalendar]: ['workDays'],
  [PolicyCategory.EscalationThreshold]: ['unacknowledgedThresholdHours'],
  [PolicyCategory.CoachingFollowUpPeriod]: ['coachingWindowDays'],
  [PolicyCategory.RetentionPeriod]: ['backupRetentionDays', 'exportRetentionMinutes'],
  [PolicyCategory.ExemptionRule]: [],
  [PolicyCategory.ObjectionWindowDuration]: ['durationHours'],
  [PolicyCategory.MinorMaterialThreshold]: ['wordsChangedThreshold'],
  [PolicyCategory.ParticipationRule]: [],
  [PolicyCategory.ReminderThreshold]: ['objectionWindowReminderHours', 'leavePendingReminderHours'],
};

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value);
}

@Injectable()
export class PolicyValueValidator {
  /**
   * Validates policy category values against the locked domain contract.
   * Throws BusinessRuleViolationException (HTTP 422) if validation fails.
   */
  validate(category: PolicyCategory, value: Record<string, any>): void {
    if (!Object.values(PolicyCategory).includes(category)) {
      throw new BusinessRuleViolationException(
        `Kategori kebijakan '${category}' tidak dikenali`,
        [
          {
            field: 'category',
            reason: 'INVALID_VALUE',
            message: `Kategori kebijakan '${category}' tidak dikenali`,
          },
        ],
      );
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BusinessRuleViolationException(
        `Nilai kebijakan tidak valid untuk kategori ${category}`,
        [
          {
            reason: 'INVALID_TYPE',
            message: 'Nilai kebijakan harus berupa objek JSON',
          },
        ],
      );
    }

    const errors: ErrorDetail[] = [];
    const valueKeys = Object.keys(value);
    const allowed = ALLOWED_KEYS[category] || [];
    const required = REQUIRED_KEYS[category] || [];

    // 1. Unknown keys check (Closed schema for all 11 categories)
    for (const key of valueKeys) {
      if (!allowed.includes(key)) {
        errors.push({
          field: key,
          reason: 'UNKNOWN_FIELD',
          message: `Field '${key}' tidak diizinkan pada kategori ${category}`,
        });
      }
    }

    // 2. Missing required keys check
    for (const reqKey of required) {
      if (!(reqKey in value) || value[reqKey] === undefined || value[reqKey] === null) {
        errors.push({
          field: reqKey,
          reason: 'MISSING_FIELD',
          message: `Field '${reqKey}' wajib diisi pada kategori ${category}`,
        });
      }
    }

    // 3. Category-specific semantic validation for present fields
    switch (category) {
      case PolicyCategory.Cutoff: {
        for (const field of ['morningOnTimeDeadline', 'eodOnTimeDeadline']) {
          if (field in value && value[field] !== undefined && value[field] !== null) {
            if (typeof value[field] !== 'string') {
              errors.push({
                field,
                reason: 'INVALID_TYPE',
                message: `Field '${field}' harus bertipe string`,
              });
            } else if (!TIME_REGEX.test(value[field])) {
              errors.push({
                field,
                reason: 'INVALID_FORMAT',
                message: `Format '${field}' harus berupa HH:mm (00:00 - 23:59)`,
              });
            }
          }
        }
        break;
      }

      case PolicyCategory.GracePeriod: {
        for (const field of ['morningGraceMinutes', 'eodGraceMinutes']) {
          if (field in value && value[field] !== undefined && value[field] !== null) {
            if (!isValidNumber(value[field])) {
              errors.push({
                field,
                reason: 'INVALID_TYPE',
                message: `Field '${field}' harus bertipe number yang valid`,
              });
            } else if (value[field] < 0) {
              errors.push({
                field,
                reason: 'OUT_OF_RANGE',
                message: `Field '${field}' harus bernilai >= 0`,
              });
            }
          }
        }
        break;
      }

      case PolicyCategory.WorkdayCalendar: {
        if ('workDays' in value && value.workDays !== undefined && value.workDays !== null) {
          if (!Array.isArray(value.workDays)) {
            errors.push({
              field: 'workDays',
              reason: 'INVALID_TYPE',
              message: `Field 'workDays' harus berupa array`,
            });
          } else if (value.workDays.length === 0) {
            errors.push({
              field: 'workDays',
              reason: 'OUT_OF_RANGE',
              message: `Field 'workDays' tidak boleh kosong`,
            });
          } else if (value.workDays.length > 7) {
            errors.push({
              field: 'workDays',
              reason: 'OUT_OF_RANGE',
              message: `Field 'workDays' maksimal memiliki 7 elemen`,
            });
          } else {
            let hasInvalidElem = false;
            let hasDuplicate = false;
            const seen = new Set<number>();

            for (const day of value.workDays) {
              if (!isValidNumber(day) || !Number.isInteger(day) || day < 0 || day > 6) {
                hasInvalidElem = true;
              } else if (seen.has(day)) {
                hasDuplicate = true;
              } else {
                seen.add(day);
              }
            }

            if (hasInvalidElem) {
              errors.push({
                field: 'workDays',
                reason: 'OUT_OF_RANGE',
                message: `Setiap elemen 'workDays' harus berupa integer antara 0 (Minggu) sampai 6 (Sabtu)`,
              });
            }
            if (hasDuplicate) {
              errors.push({
                field: 'workDays',
                reason: 'OUT_OF_RANGE',
                message: `Elemen 'workDays' tidak boleh mengandung duplikasi`,
              });
            }
          }
        }
        break;
      }

      case PolicyCategory.EscalationThreshold: {
        const field = 'unacknowledgedThresholdHours';
        if (field in value && value[field] !== undefined && value[field] !== null) {
          if (!isValidNumber(value[field])) {
            errors.push({
              field,
              reason: 'INVALID_TYPE',
              message: `Field '${field}' harus bertipe number yang valid`,
            });
          } else if (value[field] <= 0) {
            errors.push({
              field,
              reason: 'OUT_OF_RANGE',
              message: `Field '${field}' harus bernilai > 0`,
            });
          }
        }
        break;
      }

      case PolicyCategory.CoachingFollowUpPeriod: {
        const field = 'coachingWindowDays';
        if (field in value && value[field] !== undefined && value[field] !== null) {
          if (!isValidNumber(value[field])) {
            errors.push({
              field,
              reason: 'INVALID_TYPE',
              message: `Field '${field}' harus bertipe number yang valid`,
            });
          } else if (value[field] <= 0) {
            errors.push({
              field,
              reason: 'OUT_OF_RANGE',
              message: `Field '${field}' harus bernilai > 0`,
            });
          }
        }
        break;
      }

      case PolicyCategory.RetentionPeriod: {
        if ('backupRetentionDays' in value && value.backupRetentionDays !== undefined && value.backupRetentionDays !== null) {
          if (!isValidNumber(value.backupRetentionDays)) {
            errors.push({
              field: 'backupRetentionDays',
              reason: 'INVALID_TYPE',
              message: `Field 'backupRetentionDays' harus bertipe number yang valid`,
            });
          } else if (value.backupRetentionDays <= 0) {
            errors.push({
              field: 'backupRetentionDays',
              reason: 'OUT_OF_RANGE',
              message: `Field 'backupRetentionDays' harus bernilai > 0`,
            });
          }
        }

        if ('exportRetentionMinutes' in value && value.exportRetentionMinutes !== undefined && value.exportRetentionMinutes !== null) {
          if (!isValidNumber(value.exportRetentionMinutes)) {
            errors.push({
              field: 'exportRetentionMinutes',
              reason: 'INVALID_TYPE',
              message: `Field 'exportRetentionMinutes' harus bertipe number yang valid`,
            });
          } else if (value.exportRetentionMinutes < 1 || value.exportRetentionMinutes > 60) {
            errors.push({
              field: 'exportRetentionMinutes',
              reason: 'OUT_OF_RANGE',
              message: `Field 'exportRetentionMinutes' harus bernilai antara 1 dan 60 (ADR-009)`,
            });
          }
        }
        break;
      }

      case PolicyCategory.ExemptionRule: {
        // ExemptionRule is empty object {} per ADR-005. Unknown keys already gathered.
        break;
      }

      case PolicyCategory.ObjectionWindowDuration: {
        const field = 'durationHours';
        if (field in value && value[field] !== undefined && value[field] !== null) {
          if (!isValidNumber(value[field])) {
            errors.push({
              field,
              reason: 'INVALID_TYPE',
              message: `Field '${field}' harus bertipe number yang valid`,
            });
          } else if (value[field] <= 0) {
            errors.push({
              field,
              reason: 'OUT_OF_RANGE',
              message: `Field '${field}' harus bernilai > 0`,
            });
          }
        }
        break;
      }

      case PolicyCategory.MinorMaterialThreshold: {
        const field = 'wordsChangedThreshold';
        if (field in value && value[field] !== undefined && value[field] !== null) {
          if (!isValidNumber(value[field])) {
            errors.push({
              field,
              reason: 'INVALID_TYPE',
              message: `Field '${field}' harus bertipe number yang valid`,
            });
          } else if (value[field] < 0) {
            errors.push({
              field,
              reason: 'OUT_OF_RANGE',
              message: `Field '${field}' harus bernilai >= 0`,
            });
          }
        }
        break;
      }

      case PolicyCategory.ParticipationRule: {
        // ParticipationRule is empty object {} per ADR-006. Unknown keys already gathered.
        break;
      }

      case PolicyCategory.ReminderThreshold: {
        for (const field of ['objectionWindowReminderHours', 'leavePendingReminderHours']) {
          if (field in value && value[field] !== undefined && value[field] !== null) {
            if (!isValidNumber(value[field])) {
              errors.push({
                field,
                reason: 'INVALID_TYPE',
                message: `Field '${field}' harus bertipe number yang valid`,
              });
            } else if (value[field] <= 0) {
              errors.push({
                field,
                reason: 'OUT_OF_RANGE',
                message: `Field '${field}' harus bernilai > 0`,
              });
            }
          }
        }
        break;
      }
    }

    if (errors.length > 0) {
      throw new BusinessRuleViolationException(
        `Nilai kebijakan tidak valid untuk kategori ${category}`,
        errors,
      );
    }
  }
}
