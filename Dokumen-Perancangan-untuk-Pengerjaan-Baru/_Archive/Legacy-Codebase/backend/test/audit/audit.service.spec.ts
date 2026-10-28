import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import type { PrismaService } from '../../src/modules/prisma/prisma.service.js';

describe('AuditService (SAD §15.2)', () => {
  let auditService: AuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };
    auditService = new AuditService(mockPrisma as unknown as PrismaService);
  });

  it('harus mencatat audit log standalone menggunakan prisma client', async () => {
    const mockCreatedLog = {
      id: 'log-uuid-1',
      actorUserId: 'user-uuid-1',
      action: 'CORRECTION_APPLIED',
      relatedEntityType: 'CorrectionRequest',
      relatedEntityId: 'cr-uuid-1',
      valueBefore: { status: 'PENDING' },
      valueAfter: { status: 'APPROVED' },
      timestamp: new Date(),
    };

    mockPrisma.auditLog.create.mockResolvedValue(mockCreatedLog);

    const result = await auditService.record({
      actorUserId: 'user-uuid-1',
      action: 'CORRECTION_APPLIED',
      relatedEntityType: 'CorrectionRequest',
      relatedEntityId: 'cr-uuid-1',
      valueBefore: { status: 'PENDING' },
      valueAfter: { status: 'APPROVED' },
    });

    expect(result).toEqual(mockCreatedLog);
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CORRECTION_APPLIED',
        relatedEntityType: 'CorrectionRequest',
        relatedEntityId: 'cr-uuid-1',
        valueBefore: { status: 'PENDING' },
        valueAfter: { status: 'APPROVED' },
        actor: {
          connect: {
            id: 'user-uuid-1',
          },
        },
      }),
    });
  });

  it('harus mencatat audit log sistem (tanpa actorUserId) dengan benar', async () => {
    const mockCreatedLog = {
      id: 'log-uuid-2',
      actorUserId: null,
      action: 'BLOCKER_AUTO_ESCALATED',
      relatedEntityType: 'Blocker',
      relatedEntityId: 'b-uuid-1',
      valueBefore: { status: 'OPEN' },
      valueAfter: { status: 'ESCALATED' },
      timestamp: new Date(),
    };

    mockPrisma.auditLog.create.mockResolvedValue(mockCreatedLog);

    const result = await auditService.record({
      action: 'BLOCKER_AUTO_ESCALATED',
      relatedEntityType: 'Blocker',
      relatedEntityId: 'b-uuid-1',
      valueBefore: { status: 'OPEN' },
      valueAfter: { status: 'ESCALATED' },
    });

    expect(result).toEqual(mockCreatedLog);
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'BLOCKER_AUTO_ESCALATED',
        relatedEntityType: 'Blocker',
        relatedEntityId: 'b-uuid-1',
      }),
    });
    expect(
      (mockPrisma.auditLog.create.mock.calls[0][0].data as any).actor,
    ).toBeUndefined();
  });

  it('harus mencatat audit log di dalam transaction jika tx client disertakan', async () => {
    const mockTx = {
      auditLog: {
        create: vi.fn(),
      },
    };

    const mockCreatedLog = {
      id: 'log-uuid-3',
      actorUserId: 'user-uuid-1',
      action: 'POLICY_VERSION_CREATED',
      relatedEntityType: 'Policy',
      relatedEntityId: 'pol-uuid-1',
      timestamp: new Date(),
    };

    mockTx.auditLog.create.mockResolvedValue(mockCreatedLog);

    const result = await auditService.record(
      {
        actorUserId: 'user-uuid-1',
        action: 'POLICY_VERSION_CREATED',
        relatedEntityType: 'Policy',
        relatedEntityId: 'pol-uuid-1',
      },
      mockTx as any,
    );

    expect(result).toEqual(mockCreatedLog);
    expect(mockTx.auditLog.create).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('harus mengambil log berdasarkan entitas terkait (findByEntity)', async () => {
    const mockLogs = [{ id: '1' }, { id: '2' }];
    mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

    const result = await auditService.findByEntity('Blocker', 'b-uuid-1');

    expect(result).toEqual(mockLogs);
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        relatedEntityType: 'Blocker',
        relatedEntityId: 'b-uuid-1',
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
    });
  });
});
