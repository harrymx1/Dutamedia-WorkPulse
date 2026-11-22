import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoachingService } from './coaching.service';
import { CanonicalRole, ManagerNoteType, NoteVisibility, UserStatus } from '@prisma/client';
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

    it('returns all active company employees (excluding self and inactive) for HRGA/CEO/SYSTEM_ADMIN', async () => {
      mockPrisma.organizationalAssignment.findFirst = vi.fn().mockResolvedValue({
        userId: 'hrga-1',
        role: CanonicalRole.HRGA,
        function: 'HRGA',
      });
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        {
          userId: 'emp-1',
          jobTitle: 'Backend Engineer',
          function: 'ENGINEERING',
          effectiveDate: new Date('2026-01-01'),
          user: { id: 'emp-1', fullName: 'Andi Saputra', email: 'andi@dutamedia.com', status: UserStatus.ACTIVE },
        },
        {
          userId: 'emp-inactive',
          jobTitle: 'Ex Staff',
          function: 'DELIVERY',
          effectiveDate: new Date('2026-01-01'),
          user: { id: 'emp-inactive', fullName: 'Non Aktif', email: 'ex@dutamedia.com', status: UserStatus.INACTIVE },
        },
        {
          userId: 'hrga-1',
          jobTitle: 'HRGA Lead',
          function: 'HRGA',
          effectiveDate: new Date('2026-01-01'),
          user: { id: 'hrga-1', fullName: 'Dina HRGA', email: 'hrga@dutamedia.com', status: UserStatus.ACTIVE },
        },
      ]);
      mockPrisma.managerNote.findMany.mockResolvedValue([]);
      mockPrisma.complianceEvent.findMany.mockResolvedValue([]);
      mockPrisma.managerNote.count.mockResolvedValue(0);

      const overview = await service.getTeamOverview('hrga-1');

      expect(overview).toHaveLength(1);
      expect(overview[0].user.id).toBe('emp-1');
      expect(mockPrisma.organizationalAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: { not: 'hrga-1' },
            user: { status: UserStatus.ACTIVE },
          }),
        }),
      );
    });

    it('returns active division members (including indirect reports) for HEAD and excludes other divisions', async () => {
      mockPrisma.organizationalAssignment.findFirst = vi.fn().mockResolvedValue({
        userId: 'head-eng',
        role: CanonicalRole.HEAD,
        function: 'ENGINEERING',
      });
      mockPrisma.organizationalAssignment.findMany
        .mockResolvedValueOnce([
          {
            userId: 'lead-1',
            jobTitle: 'Technical Lead',
            function: 'ENGINEERING',
            effectiveDate: new Date('2026-01-01'),
            user: { id: 'lead-1', fullName: 'Rina Lead', email: 'rina@dutamedia.com', status: UserStatus.ACTIVE },
          },
          {
            userId: 'dev-1',
            jobTitle: 'Frontend Developer',
            function: 'ENGINEERING',
            effectiveDate: new Date('2026-01-01'),
            user: { id: 'dev-1', fullName: 'Budi Dev', email: 'budi@dutamedia.com', status: UserStatus.ACTIVE },
          },
        ])
        .mockResolvedValueOnce([
          {
            userId: 'lead-1',
            jobTitle: 'Technical Lead',
            function: 'ENGINEERING',
            effectiveDate: new Date('2026-01-01'),
            user: { id: 'lead-1', fullName: 'Rina Lead', email: 'rina@dutamedia.com', status: UserStatus.ACTIVE },
          },
        ])
        .mockResolvedValue([]);
      mockPrisma.managerNote.findMany.mockResolvedValue([]);
      mockPrisma.complianceEvent.findMany.mockResolvedValue([]);
      mockPrisma.managerNote.count.mockResolvedValue(0);

      const overview = await service.getTeamOverview('head-eng');

      expect(overview).toHaveLength(2);
      expect(overview.map((item) => item.user.id)).toEqual(['dev-1', 'lead-1']);
      expect(mockPrisma.organizationalAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: { not: 'head-eng' },
            function: 'ENGINEERING',
            user: { status: UserStatus.ACTIVE },
          }),
        }),
      );
    });

    it('collects multi-level active subordinates for direct supervisor via BFS', async () => {
      mockPrisma.organizationalAssignment.findFirst = vi.fn().mockResolvedValue({
        userId: 'mgr-1',
        role: CanonicalRole.SUPERVISOR,
        function: 'ENGINEERING',
      });
      mockPrisma.organizationalAssignment.findMany
        .mockResolvedValueOnce([
          {
            userId: 'lead-1',
            jobTitle: 'Team Lead',
            function: 'ENGINEERING',
            effectiveDate: new Date('2026-01-01'),
            user: { id: 'lead-1', fullName: 'Citra Lead', email: 'citra@dutamedia.com', status: UserStatus.ACTIVE },
          },
        ])
        .mockResolvedValueOnce([
          {
            userId: 'staff-1',
            jobTitle: 'QA Engineer',
            function: 'ENGINEERING',
            effectiveDate: new Date('2026-01-01'),
            user: { id: 'staff-1', fullName: 'Adi QA', email: 'adi@dutamedia.com', status: UserStatus.ACTIVE },
          },
          {
            userId: 'staff-off',
            jobTitle: 'Former QA',
            function: 'ENGINEERING',
            effectiveDate: new Date('2026-01-01'),
            user: { id: 'staff-off', fullName: 'Zaki Lama', email: 'zaki@dutamedia.com', status: UserStatus.INACTIVE },
          },
        ])
        .mockResolvedValue([]);
      mockPrisma.managerNote.findMany.mockResolvedValue([]);
      mockPrisma.complianceEvent.findMany.mockResolvedValue([]);
      mockPrisma.managerNote.count.mockResolvedValue(0);

      const overview = await service.getTeamOverview('mgr-1');

      expect(overview).toHaveLength(2);
      expect(overview.map((item) => item.user.fullName)).toEqual(['Adi QA', 'Citra Lead']);
    });
  });
});

