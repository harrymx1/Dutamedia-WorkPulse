import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplianceService } from './compliance.service';
import { ComplianceEventStage, NotificationChannel } from '@prisma/client';
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

  it('rejects follow-up note shorter than 5 characters with VALIDATION_FAILED', async () => {
    await expect(service.addressComplianceEvent('e1', 'ok', 'ceo-1')).rejects.toThrowError(
      AppException,
    );
    expect(mockPrisma.complianceEvent.update).not.toHaveBeenCalled();
  });

  it('attributes new follow-up note to actorUserId verbatim and sends notification to employee', async () => {
    mockPrisma.complianceEvent.findUnique.mockResolvedValue({
      id: 'e1',
      userId: 'emp-1',
      followUpStatus: 'OPEN',
    });
    mockPrisma.managerNote = {
      create: vi.fn().mockResolvedValue({
        id: 'note-new-1',
        authorUserId: 'ceo-1',
        authorUser: { id: 'ceo-1', fullName: 'Hendra Wijaya' },
      }),
    };
    mockPrisma.notification = {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };
    mockPrisma.complianceEvent.update.mockResolvedValue({
      id: 'e1',
      followUpStatus: 'ADDRESSED',
      followUpManagerNoteId: 'note-new-1',
    });

    const noteText = 'Sudah diingatkan langsung bersama kepala divisi';
    const res = await service.addressComplianceEvent('e1', noteText, 'ceo-1');

    expect(res.followUpStatus).toBe('ADDRESSED');
    expect(mockPrisma.managerNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subjectUserId: 'emp-1',
          authorUserId: 'ceo-1',
          content: noteText,
        }),
      }),
    );
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipientUserId: 'emp-1',
          triggerType: 'MANAGER_NOTE_SHARED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: 'Tindak Lanjut Kepatuhan & Pembinaan',
          message: `Hendra Wijaya mencatat tindak lanjut kepatuhan: "${noteText}"`,
          actionUrl: '/notifications',
          relatedEntityType: 'manager_notes',
          relatedEntityId: 'note-new-1',
        }),
      }),
    );
  });
});
