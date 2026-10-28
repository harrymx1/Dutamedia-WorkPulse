import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplianceService } from './compliance.service';
import { ComplianceEventStage } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('ComplianceService (WP-EP08 / HRGA Compliance Queue - Prototipe 11)', () => {
  let service: ComplianceService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      complianceEvent: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T10:00:00.000Z')),
    };

    service = new ComplianceService(mockPrisma, mockClock);
  });

  it('aggregates compliance summary metrics by stage', async () => {
    mockPrisma.complianceEvent.findMany.mockResolvedValue([
      { id: 'e1', stage: ComplianceEventStage.PATTERN_FLAG_3X, followUpStatus: 'OPEN' },
      { id: 'e2', stage: ComplianceEventStage.PATTERN_FLAG_3X, followUpStatus: 'ADDRESSED' },
      { id: 'e3', stage: ComplianceEventStage.RECORDED_WARNING, followUpStatus: 'OPEN' },
      { id: 'e4', stage: ComplianceEventStage.FORMAL_HR_ESCALATION, followUpStatus: 'OPEN' },
    ]);

    const summary = await service.getComplianceSummary();
    expect(summary.totalEvents).toBe(4);
    expect(summary.openCount).toBe(3);
    expect(summary.patternCount).toBe(2);
    expect(summary.warningCount).toBe(1);
    expect(summary.escalationCount).toBe(1);
  });

  it('addresses compliance event by linking manager coaching note', async () => {
    mockPrisma.complianceEvent.findUnique.mockResolvedValue({ id: 'e1', followUpStatus: 'OPEN' });
    mockPrisma.complianceEvent.update.mockResolvedValue({
      id: 'e1',
      followUpStatus: 'ADDRESSED',
      followUpManagerNoteId: 'note-1',
    });

    const res = await service.addressComplianceEvent('e1', 'note-1');
    expect(res.followUpStatus).toBe('ADDRESSED');
    expect(mockPrisma.complianceEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: expect.objectContaining({
          followUpStatus: 'ADDRESSED',
          followUpManagerNoteId: 'note-1',
        }),
      }),
    );
  });
});
