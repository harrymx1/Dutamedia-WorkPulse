import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyCategory } from '@prisma/client';
import { PolicyValueValidator } from '../../src/modules/policy/services/policy-value.validator.js';
import { DEFAULT_POLICY_VALUES } from '../../src/modules/policy/policy.service.js';
import { BusinessRuleViolationException } from '../../src/modules/shared/exceptions/api.exception.js';

describe('PolicyValueValidator', () => {
  let validator: PolicyValueValidator;

  beforeEach(() => {
    validator = new PolicyValueValidator();
  });

  describe('1. Valid default value for every category (all 11 categories)', () => {
    for (const category of Object.values(PolicyCategory)) {
      it(`harus menerima DEFAULT_POLICY_VALUES untuk kategori ${category}`, () => {
        expect(() => {
          validator.validate(category, DEFAULT_POLICY_VALUES[category]);
        }).not.toThrow();
      });
    }
  });

  describe('2. Input structure & Category recognition', () => {
    it('harus menolak kategori yang tidak dikenali', () => {
      expect(() => {
        validator.validate('InvalidCategory' as any, {});
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak nilai non-object (null, undefined, array, primitive)', () => {
      expect(() => {
        validator.validate(PolicyCategory.Cutoff, null as any);
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.Cutoff, undefined as any);
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.Cutoff, [] as any);
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.Cutoff, '09:00' as any);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('3. Cutoff', () => {
    it('harus menerima format valid HH:mm (00:00 - 23:59)', () => {
      expect(() => {
        validator.validate(PolicyCategory.Cutoff, {
          morningOnTimeDeadline: '00:00',
          eodOnTimeDeadline: '23:59',
        });
      }).not.toThrow();

      expect(() => {
        validator.validate(PolicyCategory.Cutoff, {
          morningOnTimeDeadline: '09:00',
          eodOnTimeDeadline: '18:00',
        });
      }).not.toThrow();
    });

    it('harus menolak jika required field hilang', () => {
      try {
        validator.validate(PolicyCategory.Cutoff, {
          morningOnTimeDeadline: '09:00',
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'eodOnTimeDeadline',
              reason: 'MISSING_FIELD',
            }),
          ]),
        );
      }
    });

    it('harus menolak format tidak valid (9:00, 24:00, 18:60, abc, 09.00, 09:00:00)', () => {
      const invalidFormats = ['9:00', '24:00', '18:60', 'abc', '09.00', '09:00:00'];
      for (const format of invalidFormats) {
        expect(() => {
          validator.validate(PolicyCategory.Cutoff, {
            morningOnTimeDeadline: format,
            eodOnTimeDeadline: '18:00',
          });
        }).toThrow(BusinessRuleViolationException);
      }
    });

    it('harus menolak tipe data selain string', () => {
      expect(() => {
        validator.validate(PolicyCategory.Cutoff, {
          morningOnTimeDeadline: 900 as any,
          eodOnTimeDeadline: '18:00',
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak unknown field', () => {
      try {
        validator.validate(PolicyCategory.Cutoff, {
          morningOnTimeDeadline: '09:00',
          eodOnTimeDeadline: '18:00',
          extraField: 'unknown',
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'extraField',
              reason: 'UNKNOWN_FIELD',
            }),
          ]),
        );
      }
    });
  });

  describe('4. GracePeriod', () => {
    it('harus menerima nilai 0 (boundary non-negative)', () => {
      expect(() => {
        validator.validate(PolicyCategory.GracePeriod, {
          morningGraceMinutes: 0,
          eodGraceMinutes: 0,
        });
      }).not.toThrow();
    });

    it('harus menerima nilai pecahan/fractional (30.5)', () => {
      expect(() => {
        validator.validate(PolicyCategory.GracePeriod, {
          morningGraceMinutes: 30.5,
          eodGraceMinutes: 15.25,
        });
      }).not.toThrow();
    });

    it('harus menolak nilai negatif (< 0)', () => {
      expect(() => {
        validator.validate(PolicyCategory.GracePeriod, {
          morningGraceMinutes: -1,
          eodGraceMinutes: 30,
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak NaN dan Infinity', () => {
      expect(() => {
        validator.validate(PolicyCategory.GracePeriod, {
          morningGraceMinutes: NaN,
          eodGraceMinutes: 30,
        });
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.GracePeriod, {
          morningGraceMinutes: Infinity,
          eodGraceMinutes: 30,
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak missing required field', () => {
      expect(() => {
        validator.validate(PolicyCategory.GracePeriod, {
          morningGraceMinutes: 30,
        });
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('5. WorkdayCalendar', () => {
    it('harus menerima array valid integer 0..6 tanpa duplikasi', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [1, 2, 3, 4, 5],
        });
      }).not.toThrow();

      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [0, 1, 2, 3, 4, 5, 6],
        });
      }).not.toThrow();
    });

    it('harus menolak array kosong', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [],
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak duplikasi elemen', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [1, 2, 2, 3],
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak non-integer dalam array', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [1, 2.5, 3],
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak angka di luar 0..6', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [-1, 1, 2],
        });
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [1, 2, 7],
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak jika panjang array > 7', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: [0, 1, 2, 3, 4, 5, 6, 0],
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak jika workDays bukan array', () => {
      expect(() => {
        validator.validate(PolicyCategory.WorkdayCalendar, {
          workDays: '1,2,3,4,5' as any,
        });
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('6. EscalationThreshold', () => {
    it('harus menerima nilai positif dan fractional (0.5)', () => {
      expect(() => {
        validator.validate(PolicyCategory.EscalationThreshold, {
          unacknowledgedThresholdHours: 0.5,
        });
      }).not.toThrow();
    });

    it('harus menolak nilai 0', () => {
      expect(() => {
        validator.validate(PolicyCategory.EscalationThreshold, {
          unacknowledgedThresholdHours: 0,
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak nilai negatif', () => {
      expect(() => {
        validator.validate(PolicyCategory.EscalationThreshold, {
          unacknowledgedThresholdHours: -2,
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('harus menolak non-number (string/boolean)', () => {
      expect(() => {
        validator.validate(PolicyCategory.EscalationThreshold, {
          unacknowledgedThresholdHours: '2' as any,
        });
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('7. CoachingFollowUpPeriod & Regression Case B', () => {
    it('harus menerima nilai positif dan fractional (1.5)', () => {
      expect(() => {
        validator.validate(PolicyCategory.CoachingFollowUpPeriod, {
          coachingWindowDays: 1.5,
        });
      }).not.toThrow();
    });

    it('harus menolak 0 dan nilai negatif', () => {
      expect(() => {
        validator.validate(PolicyCategory.CoachingFollowUpPeriod, {
          coachingWindowDays: 0,
        });
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.CoachingFollowUpPeriod, {
          coachingWindowDays: -5,
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('Regression Case B: harus menolak patternThresholdCount sebagai UNKNOWN_FIELD', () => {
      try {
        validator.validate(PolicyCategory.CoachingFollowUpPeriod, {
          coachingWindowDays: 14,
          patternThresholdCount: 3,
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'patternThresholdCount',
              reason: 'UNKNOWN_FIELD',
            }),
          ]),
        );
      }
    });
  });

  describe('8. RetentionPeriod', () => {
    it('harus menerima nilai positif', () => {
      expect(() => {
        validator.validate(PolicyCategory.RetentionPeriod, {
          backupRetentionDays: 14,
          exportRetentionMinutes: 15,
        });
      }).not.toThrow();
    });

    it('harus menolak 0 dan nilai negatif untuk kedua field', () => {
      expect(() => {
        validator.validate(PolicyCategory.RetentionPeriod, {
          backupRetentionDays: 0,
          exportRetentionMinutes: 15,
        });
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.RetentionPeriod, {
          backupRetentionDays: 14,
          exportRetentionMinutes: -5,
        });
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('9. ExemptionRule & Regression Case C', () => {
    it('harus menerima objek kosong {}', () => {
      expect(() => {
        validator.validate(PolicyCategory.ExemptionRule, {});
      }).not.toThrow();
    });

    it('Regression Case C: harus menolak allowLeaveOnProbation sebagai UNKNOWN_FIELD', () => {
      try {
        validator.validate(PolicyCategory.ExemptionRule, {
          allowLeaveOnProbation: true,
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'allowLeaveOnProbation',
              reason: 'UNKNOWN_FIELD',
            }),
          ]),
        );
      }
    });
  });

  describe('10. ObjectionWindowDuration', () => {
    it('harus menerima nilai positif dan fractional (0.5)', () => {
      expect(() => {
        validator.validate(PolicyCategory.ObjectionWindowDuration, {
          durationHours: 0.5,
        });
      }).not.toThrow();
    });

    it('harus menolak 0 dan nilai negatif', () => {
      expect(() => {
        validator.validate(PolicyCategory.ObjectionWindowDuration, {
          durationHours: 0,
        });
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.ObjectionWindowDuration, {
          durationHours: -1,
        });
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('11. MinorMaterialThreshold & Regression Case A', () => {
    it('harus menerima 0 sebagai nilai valid (boundary non-negative)', () => {
      expect(() => {
        validator.validate(PolicyCategory.MinorMaterialThreshold, {
          wordsChangedThreshold: 0,
        });
      }).not.toThrow();
    });

    it('harus menerima nilai positif', () => {
      expect(() => {
        validator.validate(PolicyCategory.MinorMaterialThreshold, {
          wordsChangedThreshold: 10,
        });
      }).not.toThrow();
    });

    it('harus menolak nilai negatif (< 0)', () => {
      expect(() => {
        validator.validate(PolicyCategory.MinorMaterialThreshold, {
          wordsChangedThreshold: -1,
        });
      }).toThrow(BusinessRuleViolationException);
    });

    it('Regression Case A: harus menolak riskChangeAlwaysMaterial sebagai UNKNOWN_FIELD', () => {
      try {
        validator.validate(PolicyCategory.MinorMaterialThreshold, {
          wordsChangedThreshold: 10,
          riskChangeAlwaysMaterial: false,
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'riskChangeAlwaysMaterial',
              reason: 'UNKNOWN_FIELD',
            }),
          ]),
        );
      }
    });
  });

  describe('12. ParticipationRule & Regression Case D', () => {
    it('harus menerima objek kosong {}', () => {
      expect(() => {
        validator.validate(PolicyCategory.ParticipationRule, {});
      }).not.toThrow();
    });

    it('Regression Case D: harus menolak minCommitmentCount dan maxCommitmentCount sebagai UNKNOWN_FIELD', () => {
      try {
        validator.validate(PolicyCategory.ParticipationRule, {
          minCommitmentCount: 1,
          maxCommitmentCount: 3,
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'minCommitmentCount',
              reason: 'UNKNOWN_FIELD',
            }),
            expect.objectContaining({
              field: 'maxCommitmentCount',
              reason: 'UNKNOWN_FIELD',
            }),
          ]),
        );
      }
    });
  });

  describe('13. ReminderThreshold', () => {
    it('harus menerima nilai positif dan fractional (0.5, 12.5)', () => {
      expect(() => {
        validator.validate(PolicyCategory.ReminderThreshold, {
          objectionWindowReminderHours: 0.5,
          leavePendingReminderHours: 12.5,
        });
      }).not.toThrow();
    });

    it('harus menolak 0 dan nilai negatif', () => {
      expect(() => {
        validator.validate(PolicyCategory.ReminderThreshold, {
          objectionWindowReminderHours: 0,
          leavePendingReminderHours: 24,
        });
      }).toThrow(BusinessRuleViolationException);

      expect(() => {
        validator.validate(PolicyCategory.ReminderThreshold, {
          objectionWindowReminderHours: 2,
          leavePendingReminderHours: -1,
        });
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe('14. Error shape & Unknown keys not silently stripped', () => {
    it('harus mengumpulkan multiple errors dalam satu response', () => {
      try {
        validator.validate(PolicyCategory.ReminderThreshold, {
          objectionWindowReminderHours: -1,
          extraUnknownKey: 123,
        });
        expect.unreachable('Harus melempar exception');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.getStatus()).toBe(422);
        expect(err.code).toBe('BUSINESS_RULE_VIOLATION');
        expect(err.message).toBe('Nilai kebijakan tidak valid untuk kategori ReminderThreshold');
        expect(err.details.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
