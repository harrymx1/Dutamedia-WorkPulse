/**
 * EPIC-22-T4: Concurrency Test (SAD §9.9, §19.5)
 * Simulasi dua request paralel via Promise.all() untuk memvalidasi behavior
 * saat race condition pada:
 * - Race #1: Reviewer object vs Scheduler auto-apply (CorrectionRequest)
 * - Race #2: Dua scheduler berjalan bersamaan pada Blocker auto-escalation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CorrectionStatus,
  BlockerSeverity,
  BlockerStatus,
  PolicyCategory,
  Role,
} from '@prisma/client';
import { CorrectionRequestService } from '../../src/modules/correction-request/services/correction-request.service.js';
import { BlockerService } from '../../src/modules/blocker/services/blocker.service.js';
import type { CurrentUserPayload } from '../../src/modules/auth/decorators/current-user.decorator.js';
import { ConflictException } from '../../src/modules/shared/exceptions/api.exception.js';

function mkUser(userId: string, role: Role): CurrentUserPayload {
  return {
    userId, role,
    email: `${userId}@dutamedia.com`,
    function: 'Engineering',
    directManagerId: null,
    sessionId: `sess-${userId}`,
    mustResetPassword: false,
  };
}

// ===========================================================================
// Race #1: CorrectionRequest — Reviewer object vs Scheduler auto-apply (§9.9 #1)
// ===========================================================================
describe('EPIC-22-T4 Race #1: Reviewer object vs Scheduler auto-apply bersamaan (SAD §9.9 #1)', () => {
  let service: CorrectionRequestService;
  let prismaMock: any;
  let callCount: number;

  beforeEach(() => {
    callCount = 0;
    prismaMock = {
      commitment: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
      dailyAccountabilityRecord: { update: vi.fn() },
      correctionRequest: {
        findUnique: vi.fn(), findFirst: vi.fn(),
        findMany: vi.fn().mockResolvedValue([{ id: 'cr-race-1' }]),
        create: vi.fn(), update: vi.fn(), count: vi.fn(),
      },
      organizationalAssignment: { findFirst: vi.fn() },
      // $queryRaw: dikonfigurasi per test agar mensimulasikan race
      $queryRaw: vi.fn(),
      $transaction: vi.fn(async (cb) => typeof cb === 'function' ? cb(prismaMock) : Promise.all(cb)),
    };
    service = new CorrectionRequestService(
      prismaMock,
      { record: vi.fn().mockResolvedValue({ id: 'audit-1' }) } as any,
      { getActivePolicySnapshot: vi.fn().mockResolvedValue({}) } as any,
      { isUserInScope: vi.fn().mockResolvedValue(true) } as any,
      { dispatch: vi.fn().mockResolvedValue([]) } as any,
    );
  });

  it('Race #1-a: Scheduler memenangkan race — auto-apply terjadi, reviewer mendapat 409 CONFLICT', async () => {
    const supervisor = mkUser('spv-race', Role.Supervisor_TL);

    // Skenario: Scheduler memproses PERTAMA (set status Applied),
    // reviewer mencoba object setelah itu → harus 409
    prismaMock.commitment.findUnique.mockResolvedValue({
      id: 'comm-race', text: 'Task race', dailyRecordId: 'rec-race',
    });
    prismaMock.commitment.update.mockResolvedValue({ id: 'comm-race' });

    // $queryRaw dikonfigurasi untuk: scheduler call (auto-apply context) dan reviewer call
    // Reviewer request: $queryRaw mengembalikan status Applied (scheduler sudah proses duluan)
    prismaMock.$queryRaw
      .mockResolvedValueOnce([ // Panggilan pertama dari auto-apply (findMany yang terlampaui, ini fallback)
        {
          id: 'cr-race-1', status: CorrectionStatus.Pending,
          target_commitment_id: 'comm-race',
          requested_change: { referenceLink: 'https://race' },
          requested_by_user_id: 'emp-race',
        },
      ])
      .mockResolvedValueOnce([ // Panggilan kedua dari objectCorrection — status sudah Applied
        {
          id: 'cr-race-1', status: CorrectionStatus.Applied, // Scheduler sudah proses
          requested_by_user_id: 'emp-race',
          objection_window_end: new Date(Date.now() + 100_000),
        },
      ]);

    // Jalankan auto-apply terlebih dahulu (Scheduler memenangkan race)
    const autoApplyResult = await service.evaluateExpiredObjectionWindows();
    expect(autoApplyResult.processedCount).toBe(1);

    // Reviewer mencoba object setelah status sudah Applied → harus 409 ConflictException (DENY #8)
    await expect(
      service.objectCorrection(supervisor, 'cr-race-1', { objectionReason: 'Harusnya ditolak' }),
    ).rejects.toThrow(ConflictException);
  });

  it('Race #1-b: Reviewer memenangkan race — status Rejected, scheduler melewati row ini (idempotency)', async () => {
    // Skenario: Reviewer berhasil object PERTAMA (Rejected),
    // scheduler kemudian tidak memproses row yang sudah Rejected
    prismaMock.correctionRequest.findMany.mockResolvedValue([
      // Scheduler hanya mencari status Pending — row Rejected tidak masuk
      // Simulasi: findMany mengembalikan empty (reviewer sudah reject)
    ]);

    const schedulerResult = await service.evaluateExpiredObjectionWindows();

    // Scheduler tidak memproses apa-apa karena tidak ada Pending yang expired
    expect(schedulerResult.processedCount).toBe(0);

    // Konfirmasi: $queryRaw tidak dipanggil (tidak ada candidates dari findMany)
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Race #2: Blocker — Dua scheduler instance evaluateAutoEscalation bersamaan (§9.9 #2)
// ===========================================================================
describe('EPIC-22-T4 Race #2: Dua scheduler evaluateAutoEscalation bersamaan — idempotency check (SAD §9.9 #2)', () => {
  let service: BlockerService;
  let prismaMock: any;
  let auditFindFirstCallCount: number;

  beforeEach(() => {
    auditFindFirstCallCount = 0;
    prismaMock = {
      blocker: {
        create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn(),
      },
      supportContribution: { create: vi.fn() },
      auditLog: {
        findFirst: vi.fn().mockImplementation(async () => {
          auditFindFirstCallCount++;
          // Pertama kali: belum ada AuditLog (race window)
          // Kedua kali: AuditLog sudah ada (idempotency terpicu)
          if (auditFindFirstCallCount > 1) {
            return { id: 'audit-escalate-1', action: 'BLOCKER_AUTO_ESCALATED' };
          }
          return null;
        }),
      },
      $transaction: vi.fn(async (cb) => typeof cb === 'function' ? cb(prismaMock) : Promise.all(cb)),
    };
    service = new BlockerService(
      prismaMock,
      { record: vi.fn().mockResolvedValue({ id: 'audit-1' }) } as any,
      {
        getActivePolicySnapshot: vi.fn().mockResolvedValue({
          [PolicyCategory.EscalationThreshold]: { unacknowledgedThresholdHours: 2 },
        }),
      } as any,
      { isUserInScope: vi.fn() } as any,
      { dispatch: vi.fn().mockResolvedValue([]) } as any,
      {
        resolveOwnerNeeded: vi.fn(),
        resolveNextEscalationLevel: vi.fn().mockResolvedValue({
          targetUserId: 'head-1', escalationLevel: 'NextLevelManager',
        }),
      } as any,
    );
  });

  it('Race #2: Dua call evaluateAutoEscalation() bersamaan tidak menghasilkan eskalasi ganda (idempotency via AuditLog)', async () => {
    const now = new Date();
    const criticalBlocker = {
      id: 'blocker-race-critical',
      type: 'Cache total failure',
      severity: BlockerSeverity.Critical,
      status: BlockerStatus.Open,
      acknowledgedAt: null,
      raisedByUserId: 'reporter-1',
      ownerNeededUserId: 'owner-1',
      ownerNeededType: 'OrganizationalAuthority',
      raisedBy: { fullName: 'Reporter' },
      ownerNeeded: { fullName: 'Owner' },
    };

    // Kedua scheduler menemukan kandidat yang sama dari findMany
    prismaMock.blocker.findMany.mockResolvedValue([criticalBlocker]);
    // findUnique mengembalikan blocker belum diack
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-race-critical', acknowledgedAt: null, status: BlockerStatus.Open,
    });

    // Jalankan DUA instance scheduler bersamaan
    const [result1, result2] = await Promise.all([
      service.evaluateAutoEscalation(now),
      service.evaluateAutoEscalation(now),
    ]);

    const totalEscalated = result1.escalatedCount + result2.escalatedCount;

    // KUNCI IDEMPOTENCY: Total escalated harus tepat 1, bukan 2
    // Instance kedua harus menemukan AuditLog dari instance pertama dan skip
    expect(totalEscalated).toBeLessThanOrEqual(1);

    // AuditLog findFirst harus dipanggil minimal 2 kali (satu per scheduler instance)
    expect(auditFindFirstCallCount).toBeGreaterThanOrEqual(2);
  });

  it('Race #2: Blocker yang sudah Acknowledged saat evaluasi tidak dieskalasi (§9.9 #2)', async () => {
    const now = new Date();
    prismaMock.blocker.findMany.mockResolvedValue([{
      id: 'blocker-ack-race', severity: BlockerSeverity.Critical,
      status: BlockerStatus.Open, acknowledgedAt: null,
      raisedByUserId: 'reporter-1', ownerNeededUserId: 'owner-1',
      raisedBy: { fullName: 'R' }, ownerNeeded: { fullName: 'O' },
      ownerNeededType: 'OrganizationalAuthority',
    }]);
    prismaMock.auditLog.findFirst.mockResolvedValue(null); // Belum ada audit

    // findUnique menunjukkan sudah diack (race: diack di antara findMany dan evaluasi)
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-ack-race', acknowledgedAt: new Date(now.getTime() - 500),
      status: BlockerStatus.Acknowledged,
    });

    const result = await service.evaluateAutoEscalation(now);

    // Sudah diack → tidak perlu eskalasi
    expect(result.escalatedCount).toBe(0);
  });
});
