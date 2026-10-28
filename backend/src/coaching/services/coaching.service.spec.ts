import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoachingService } from './coaching.service';
import { ManagerNoteType, NoteVisibility } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('CoachingService (WP-EP07 / Manager Coaching & 1-on-1 Notes - Prototipe 10)', () => {
  let service: CoachingService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      managerNote: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      complianceEvent: {
        findMany: vi.fn(),
      },
      organizationalAssignment: {
        findMany: vi.fn(),
      },
      notification: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T10:00:00.000Z')),
    };

    service = new CoachingService(mockPrisma, mockClock);
  });

  describe('createManagerNote', () => {
    it('rejects self-coaching note creation', async () => {
      await expect(
        service.createManagerNote('mgr-1', {
          subjectUserId: 'mgr-1',
          noteType: ManagerNoteType.COACHING,
          visibility: NoteVisibility.CONFIDENTIAL_MANAGER_ONLY,
          content: 'Catatan untuk diri sendiri yang tidak valid',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('rejects note creation when subject user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createManagerNote('mgr-1', {
          subjectUserId: 'usr-unknown',
          noteType: ManagerNoteType.COACHING,
          visibility: NoteVisibility.CONFIDENTIAL_MANAGER_ONLY,
          content: 'Catatan pembinaan',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('creates confidential manager note without sending employee notification', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-1', fullName: 'Budi Dev' });
      mockPrisma.managerNote.create.mockResolvedValue({
        id: 'note-1',
        authorUserId: 'mgr-1',
        subjectUserId: 'usr-1',
        noteType: ManagerNoteType.COACHING,
        visibility: NoteVisibility.CONFIDENTIAL_MANAGER_ONLY,
        content: 'Perlu bimbingan estimasi waktu tugas',
      });

      const note = await service.createManagerNote('mgr-1', {
        subjectUserId: 'usr-1',
        noteType: ManagerNoteType.COACHING,
        visibility: NoteVisibility.CONFIDENTIAL_MANAGER_ONLY,
        content: 'Perlu bimbingan estimasi waktu tugas',
      });

      expect(note.id).toBe('note-1');
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('creates shared note and triggers in-app notification to employee', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-1', fullName: 'Budi Dev' });
      mockPrisma.managerNote.create.mockResolvedValue({
        id: 'note-2',
        authorUserId: 'mgr-1',
        subjectUserId: 'usr-1',
        noteType: ManagerNoteType.RECOGNITION,
        visibility: NoteVisibility.SHARED_WITH_EMPLOYEE,
        content: 'Apresiasi atas resolusi blocker insiden production tepat waktu.',
      });

      const note = await service.createManagerNote('mgr-1', {
        subjectUserId: 'usr-1',
        noteType: ManagerNoteType.RECOGNITION,
        visibility: NoteVisibility.SHARED_WITH_EMPLOYEE,
        content: 'Apresiasi atas resolusi blocker insiden production tepat waktu.',
      });

      expect(note.id).toBe('note-2');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'usr-1',
            triggerType: 'MANAGER_NOTE_SHARED',
          }),
        }),
      );
    });
  });

  describe('getNotesForSubject', () => {
    it('restricts employee viewing own profile to only SHARED_WITH_EMPLOYEE notes', async () => {
      mockPrisma.managerNote.findMany.mockResolvedValue([]);

      await service.getNotesForSubject('usr-1', 'usr-1');

      expect(mockPrisma.managerNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjectUserId: 'usr-1',
            visibility: NoteVisibility.SHARED_WITH_EMPLOYEE,
          }),
        }),
      );
    });

    it('allows manager viewing direct report to see all notes including CONFIDENTIAL', async () => {
      mockPrisma.managerNote.findMany.mockResolvedValue([]);

      await service.getNotesForSubject('mgr-1', 'usr-1');

      expect(mockPrisma.managerNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            subjectUserId: 'usr-1',
          },
        }),
      );
    });
  });

  describe('getTeamOverview', () => {
    it('aggregates direct subordinates with notes and compliance stage', async () => {
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        {
          userId: 'usr-1',
          jobTitle: 'Backend Engineer',
          function: 'ENGINEERING',
          user: { id: 'usr-1', fullName: 'Budi Dev', email: 'budi@dutamedia.com', status: 'ACTIVE' },
        },
      ]);
      mockPrisma.managerNote.findMany.mockResolvedValue([
        { id: 'n1', content: 'Ulasan performa', noteType: ManagerNoteType.COACHING },
      ]);
      mockPrisma.complianceEvent.findMany.mockResolvedValue([
        { id: 'c1', stage: 'STAGE_1_REMINDER' },
      ]);
      mockPrisma.managerNote.count.mockResolvedValue(3);

      const overview = await service.getTeamOverview('mgr-1');
      expect(overview).toHaveLength(1);
      expect(overview[0].user.fullName).toBe('Budi Dev');
      expect(overview[0].totalNotes).toBe(3);
      expect(overview[0].lastComplianceStage).toBe('STAGE_1_REMINDER');
    });
  });
});

