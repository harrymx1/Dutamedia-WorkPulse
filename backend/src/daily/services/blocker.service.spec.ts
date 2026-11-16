import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlockerService } from './blocker.service';
import {
  AuthorityContext,
  BlockerImpact,
  BlockerSeverity,
  BlockerStatus,
  BlockerType,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('BlockerService (WP-EP05 / Blocker Lifecycle & Auto-Escalation SLA)', () => {
  let service: BlockerService;
  let mockPrisma: any;
  let mockClock: any;
  let mockPolicy: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'owner-1', fullName: 'Budi Lead' }),
      },
      blockerTicket: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
      notification: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T09:00:00.000Z')),
    };

    mockPolicy = {
      getActivePolicy: vi.fn().mockResolvedValue({
        configurationValues: {
          level1Hours: 4,
          level2Hours: 8,
        },
      }),
    };

    service = new BlockerService(mockPrisma, mockClock, mockPolicy);
  });

  describe('raiseBlocker', () => {
    it('requires projectCodeReference when ownerNeededType is PROJECT_AUTHORITY (DEC-002)', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        description: 'Server database staging mengalami latency tinggi',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        assignedOwnerId: 'owner-1',
        // projectCodeReference missing
      };

      await expect(service.raiseBlocker('usr-1', dto as any)).rejects.toThrowError(AppException);
    });

    it('creates blocker ticket and notifies assigned owner with 4-hour SLA target', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        description: 'Server database staging mengalami latency tinggi',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        assignedOwnerId: 'owner-1',
        projectCodeReference: 'PRJ-PORTAL',
      };

      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.OPEN,
        ...dto,
      });

      const result = await service.raiseBlocker('usr-1', dto as any);

      expect(mockPrisma.blockerTicket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            raisedByUserId: 'usr-1',
            status: BlockerStatus.OPEN,
            assignedOwnerId: 'owner-1',
            projectCodeReference: 'PRJ-PORTAL',
          }),
        }),
      );

      // Verifikasi notifikasi dikirimkan
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'owner-1',
            triggerType: 'BLOCKER_RAISED',
          }),
        }),
      );

      expect(result.id).toBe('blk-1');
    });

    it('creates structured, untruncated BLOCKER_RAISED notification with clean title, reporter name, full description, and expected help', async () => {
      const longDescription =
        'Integrasi halaman komitmen pagi di frontend gagal menyimpan data karena endpoint POST /daily/commitments merespons HTTP 500 akibat deadlock query transaksi database.';
      const expectedHelp =
        'Perbaikan query transaksi di endpoint backend dan deploy hotfix ke server staging Engineering';
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.MILESTONE,
        description: `[Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form] ${longDescription} (Ekspektasi: ${expectedHelp})`,
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
        assignedOwnerId: 'owner-ab',
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'owner-ab', fullName: 'Arif Budiman' });
      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-structured-1',
        status: BlockerStatus.OPEN,
        ...dto,
        raisedBy: { id: 'emp-adit', fullName: 'Aditya Nugroho', email: 'dev.frontend@dutamedia.com' },
        assignedOwner: { id: 'owner-ab', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
      });

      await service.raiseBlocker('emp-adit', dto as any);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'owner-ab',
            triggerType: 'BLOCKER_RAISED',
            title: 'Kendala Baru Dialokasikan: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
            message: expect.stringContaining(longDescription),
          }),
        }),
      );

      const notifCall = mockPrisma.notification.create.mock.calls[0][0].data;
      expect(notifCall.message).toContain('Aditya Nugroho melaporkan kendala TECHNICAL (Tingkat HIGH, Dampak MILESTONE)');
      expect(notifCall.message).toContain('Judul Kendala: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form');
      expect(notifCall.message).toContain('Pelapor: Aditya Nugroho');
      expect(notifCall.message).toContain(`Ekspektasi Bantuan: ${expectedHelp}`);
    });

    it('sends immediate parallel escalation notification to next authority when severity is CRITICAL', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.CRITICAL,
        impact: BlockerImpact.PRODUCTION,
        description: 'Database produksi tidak dapat diakses oleh seluruh layanan',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
        assignedOwnerId: 'sup-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'sup-1', fullName: 'Bambang Supervisor' });
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'sup-1',
          role: 'SUPERVISOR',
          directManagerId: 'head-1',
        }),
      };
      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-crit-1',
        status: BlockerStatus.OPEN,
        ...dto,
      });

      await service.raiseBlocker('usr-1', dto as any);

      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'head-1',
            triggerType: 'BLOCKER_CRITICAL_ESCALATION',
          }),
        }),
      );
    });

    it('routes suggested owner to next manager up the chain when direct manager is on APPROVED leave', async () => {
      mockPrisma.organizationalAssignment = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            userId: 'emp-1',
            function: 'EngineeringProduct',
            directManagerId: 'sup-on-leave',
          })
          .mockResolvedValueOnce({
            userId: 'sup-on-leave',
            function: 'EngineeringProduct',
            directManagerId: 'head-active',
          }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-1', userId: 'sup-on-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'head-active',
        fullName: 'Arif Budiman',
        orgAssignments: [{ jobTitle: 'Head of Engineering' }],
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'TECHNICAL',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('head-active');
      expect(suggestion.reason).toBe('DIRECT_MANAGER');
      expect(suggestion.routingNote).toContain('cuti resmi');
    });

    it('prioritizes active Temporary Reviewer assigned by System Admin for reporter division', async () => {
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'emp-1',
          role: 'EMPLOYEE',
          function: 'Engineering',
          directManagerId: 'head-1',
        }),
      };
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'tmp-1',
            targetFunction: 'Engineering',
            delegateUserId: 'temp-rev-1',
            createdByUserId: 'admin-1',
          },
        ]),
      };
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.user.findFirst = vi.fn().mockImplementation((args: any) => {
        if (args?.select?.orgAssignments) {
          return Promise.resolve({
            id: 'temp-rev-1',
            fullName: 'Bambang Pratama',
            orgAssignments: [{ jobTitle: 'Technical Lead 1' }],
          });
        }
        return Promise.resolve({ id: 'temp-rev-1' });
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'TECHNICAL',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('temp-rev-1');
      expect(suggestion.routingNote).toContain('Reviewer Sementara');
    });

    it('does NOT route HEAD downward to division Temporary Reviewer; routes upward to CEO instead', async () => {
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'head-1',
          role: 'HEAD',
          function: 'Engineering',
          directManagerId: 'ceo-1',
        }),
      };
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([
          { id: 'tmp-1', targetFunction: 'Engineering', delegateUserId: 'staff-temp-1' },
        ]),
      };
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'ceo-1',
        fullName: 'Hendra Wijaya',
        orgAssignments: [{ jobTitle: 'CEO' }],
      });

      const suggestion = await service.resolveSuggestedOwner('head-1', {
        type: 'TECHNICAL',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('ceo-1');
      expect(mockPrisma.temporaryReviewerAssignment.findMany).not.toHaveBeenCalled();
    });

    it('does NOT route downward to division SUPERVISOR when INFRA division HEAD is on APPROVED leave without Temporary Reviewer; escalates upward to CEO instead (DEC-014)', async () => {
      mockPrisma.organizationalAssignment = {
        findMany: vi.fn().mockResolvedValue([
          { userId: 'ops-head-leave', role: 'HEAD', directManagerId: 'ceo-1' },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          userId: 'ops-head-leave',
          role: 'HEAD',
          function: 'OperationsInfrastructure',
          directManagerId: 'ceo-1',
        }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-ops', userId: 'ops-head-leave', status: 'APPROVED' })
          .mockResolvedValueOnce({ id: 'lv-ops', userId: 'ops-head-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'ceo-1',
        fullName: 'Hendra Wijaya',
        orgAssignments: [{ jobTitle: 'Chief Executive Officer' }],
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'INFRA',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('ceo-1');
      expect(suggestion.owner?.fullName).toBe('Hendra Wijaya');
      expect(suggestion.reason).toBe('DIVISION_HEAD');
      expect(suggestion.routingNote).toContain('atasan struktural di atasnya');
    });

    it('routes INFRA blocker to division SUPERVISOR ONLY when explicitly mandated as active Temporary Reviewer (DEC-014)', async () => {
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'tmp-ops-1',
            targetFunction: 'OperationsInfrastructure',
            delegateUserId: 'ops-sup-delegate',
            createdByUserId: 'admin-1',
          },
        ]),
      };
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.user.findFirst = vi.fn().mockImplementation((args: any) => {
        if (args?.select?.orgAssignments) {
          return Promise.resolve({
            id: 'ops-sup-delegate',
            fullName: 'Rian Kurniawan',
            orgAssignments: [{ jobTitle: 'Operations Supervisor' }],
          });
        }
        return Promise.resolve({ id: 'ops-sup-delegate' });
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'INFRA',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('ops-sup-delegate');
      expect(suggestion.owner?.fullName).toBe('Rian Kurniawan');
      expect(suggestion.reason).toBe('DIVISION_HEAD');
      expect(suggestion.routingNote).toContain('Reviewer Sementara aktif');
    });

    it('bypasses on-leave PROJECT_AUTHORITY project manager to available escalation reviewer', async () => {
      mockPrisma.projectAuthorityMapping = {
        findFirst: vi.fn().mockResolvedValue({
          projectCode: 'PRJ-PORTAL',
          projectManagerId: 'pm-on-leave',
          escalationReviewerId: 'head-delivery',
          involvedFunction: 'Delivery',
        }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-pm', userId: 'pm-on-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'head-delivery',
        fullName: 'Dharma Putra',
        orgAssignments: [{ jobTitle: 'Head of Delivery' }],
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'REQUIREMENT',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        projectCode: 'PRJ-PORTAL',
      });

      expect(suggestion.owner?.id).toBe('head-delivery');
      expect(suggestion.reason).toBe('PROJECT_LEAD');
      expect(suggestion.routingNote).toBeTruthy();
    });

    it('skips on-leave immediate manager during CRITICAL parallel escalation and notifies CEO directly', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.CRITICAL,
        impact: BlockerImpact.PRODUCTION,
        description: 'Database produksi mengalami deadlock masif',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
        assignedOwnerId: 'temp-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'temp-1', fullName: 'Bambang Pratama' });
      mockPrisma.organizationalAssignment = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            userId: 'temp-1',
            role: 'SUPERVISOR',
            function: 'Engineering',
            directManagerId: 'head-on-leave',
          })
          .mockResolvedValueOnce({
            userId: 'head-on-leave',
            role: 'HEAD',
            function: 'Engineering',
            directManagerId: 'ceo-1',
          }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-head', userId: 'head-on-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-crit-2',
        status: BlockerStatus.OPEN,
        ...dto,
      });

      await service.raiseBlocker('emp-1', dto as any);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'ceo-1',
            triggerType: 'BLOCKER_CRITICAL_ESCALATION',
          }),
        }),
      );
    });
  });

  describe('acknowledge and resolve', () => {
    it('acknowledges blocker ticket as assigned PIC, notifies reporter, and rejects non-PIC or reporter callers', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.OPEN,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Pool Timeout] Koneksi staging lambat',
        assignedOwner: { id: 'owner-1', fullName: 'Budi Lead' },
      });
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.ACKNOWLEDGED,
      });

      // Non-PIC peer tidak berhak Terima & Tangani
      await expect(service.acknowledgeBlocker('other-lead', 'blk-1')).rejects.toThrowError(
        AppException,
      );

      // Pelapor tidak berhak Terima & Tangani tiketnya sendiri
      await expect(service.acknowledgeBlocker('emp-1', 'blk-1')).rejects.toThrowError(
        AppException,
      );

      const res = await service.acknowledgeBlocker('owner-1', 'blk-1');
      expect(res.status).toBe(BlockerStatus.ACKNOWLEDGED);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_ACKNOWLEDGED',
            title: 'Tiket Kendala Sedang Ditangani: Pool Timeout',
            actionUrl: '/raise-blockers?tab=mine',
            relatedEntityId: 'blk-1',
            message: expect.stringContaining('Penanggung Jawab (PIC): Budi Lead'),
          }),
        }),
      );
    });

    it('resolves blocker ticket with mandatory resolution note', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Gateway 504] Timeout dari staging',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-res-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.RESOLVED });

      const res = await service.resolveBlocker('owner-1', 'blk-1', {
        resolutionNote: 'Kapasitas instance diperbesar dan indeks telah ditambahkan',
      });
      expect(res.status).toBe(BlockerStatus.RESOLVED);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-1',
            supporterUserId: 'owner-1',
            actionTaken: 'Solusi Diberikan oleh Penanggung Jawab',
            resultNote: 'Kapasitas instance diperbesar dan indeks telah ditambahkan',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION',
            actionUrl: '/raise-blockers?tab=mine',
          }),
        }),
      );
    });

    it('rejects resolve when ticket is already CLOSED', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-closed',
        status: BlockerStatus.CLOSED,
        assignedOwnerId: 'owner-1',
      });

      await expect(
        service.resolveBlocker('owner-1', 'blk-closed', {
          resolutionNote: 'Catatan resolusi tambahan setelah ditutup',
        }),
      ).rejects.toThrow();
    });

    it('accepts risk with mandatory justification and mitigation plan', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-risk',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Vendor API Terbatas] Quota API pihak ketiga habis',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-risk-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-risk',
        status: BlockerStatus.ACCEPTED_RISK,
      });

      const res = await service.acceptRiskBlocker('owner-1', 'blk-risk', {
        riskAcceptanceJustification: 'Penambahan kuota vendor membutuhkan persetujuan kuartal depan',
        riskMitigationPlan: 'Gunakan data cache harian dan batasi sinkronisasi ke jam malam',
      });

      expect(res.status).toBe(BlockerStatus.ACCEPTED_RISK);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-risk',
            supporterUserId: 'owner-1',
            actionTaken: '[PIC_ACCEPTED_RISK] Penambahan kuota vendor membutuhkan persetujuan kuartal depan',
            resultNote: 'Gunakan data cache harian dan batasi sinkronisasi ke jam malam',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION',
            actionUrl: '/raise-blockers?tab=mine',
          }),
        }),
      );
    });

    it('allows only original reporter to close RESOLVED/ACCEPTED_RISK ticket permanently', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-res',
        status: BlockerStatus.RESOLVED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Gateway 504] Timeout',
      });

      await expect(service.closeBlocker('owner-1', 'blk-res')).rejects.toThrow();

      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-close-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-res',
        status: BlockerStatus.CLOSED,
      });

      const closed = await service.closeBlocker('emp-1', 'blk-res');
      expect(closed.status).toBe(BlockerStatus.CLOSED);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-res',
            supporterUserId: 'emp-1',
            actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'owner-1',
            triggerType: 'BLOCKER_CLOSED_BY_REPORTER',
          }),
        }),
      );
    });

    it('reopens RESOLVED ticket back to ACKNOWLEDGED, preserves missing initial solution snapshot, and clears active resolution fields', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-reopen',
        status: BlockerStatus.RESOLVED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Gateway 504] Timeout',
        resolvedAt: new Date('2026-11-13T16:30:00.000Z'),
        resolutionNote: 'Solusi awal staging dicoba',
        riskAcceptanceJustification: null,
        riskMitigationPlan: null,
      });
      mockPrisma.supportContribution = {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'sup-reopen' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-reopen',
        status: BlockerStatus.ACKNOWLEDGED,
      });

      const reopened = await service.reopenBlocker('emp-1', 'blk-reopen', {
        reopenReason: 'Staging masih mengembalikan HTTP 504 saat load test',
      });

      expect(reopened.status).toBe(BlockerStatus.ACKNOWLEDGED);
      expect(mockPrisma.blockerTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BlockerStatus.ACKNOWLEDGED,
            resolvedAt: null,
            resolutionNote: null,
            riskAcceptanceJustification: null,
            riskMitigationPlan: null,
          }),
        }),
      );
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.supportContribution.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-reopen',
            supporterUserId: 'owner-1',
            resultNote: 'Solusi awal staging dicoba',
          }),
        }),
      );
      expect(mockPrisma.supportContribution.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-reopen',
            supporterUserId: 'emp-1',
            resultNote: 'Staging masih mengembalikan HTTP 504 saat load test',
          }),
        }),
      );
    });
  });

  describe('supportContribution and escalationAging (Prototipe 09 & 14)', () => {
    it('enforces OPEN lifecycle rules: blocks PIC/reporter support and PIC resolve/acceptRisk while OPEN, but allows non-PIC peer support while OPEN (DEC-015)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-open',
        status: BlockerStatus.OPEN,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Staging 502] Gateway gagal merespons',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({
          id: 'sup-open-peer-1',
          blockerId: 'blk-open',
          supporterUserId: 'usr-2',
          supporter: { id: 'usr-2', fullName: 'Charlie Ops', email: 'charlie@dutamedia.com' },
          actionTaken: 'Mengecek pool koneksi upstream',
          resultNote: 'Pool koneksi restart sementara untuk memulihkan staging',
        }),
      };

      // PIC tetap harus klik Terima & Tangani sebelum mencatat bantuan / resolve / accept-risk
      await expect(
        service.addSupportContribution(
          'owner-1',
          'blk-open',
          'Mengecek pool koneksi',
          'Belum ada perubahan',
        ),
      ).rejects.toThrowError(AppException);

      // Pelapor tidak boleh memberi bantuan pada tiketnya sendiri
      await expect(
        service.addSupportContribution(
          'emp-1',
          'blk-open',
          'Coba bantu sendiri',
          'Catatan',
        ),
      ).rejects.toThrowError(AppException);

      // Rekan lain (bukan PIC & bukan Pelapor) BOLEH memberi bantuan meskipun status masih OPEN
      const peerSupport = await service.addSupportContribution(
        'usr-2',
        'blk-open',
        'Mengecek pool koneksi upstream',
        'Pool koneksi restart sementara untuk memulihkan staging',
      );
      expect(peerSupport.id).toBe('sup-open-peer-1');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_SUPPORT_CONTRIBUTED',
            message: expect.stringContaining('Status Tiket: Menunggu Respons'),
          }),
        }),
      );

      // Resolve & AcceptRisk wajib ditolak saat OPEN maupun ketika dipanggil oleh bukan PIC
      await expect(
        service.resolveBlocker('owner-1', 'blk-open', {
          resolutionNote: 'Mencoba langsung resolve tanpa Terima & Tangani',
        }),
      ).rejects.toThrowError(AppException);

      await expect(
        service.acceptRiskBlocker('owner-1', 'blk-open', {
          riskAcceptanceJustification: 'Justifikasi risiko tanpa Terima & Tangani',
          riskMitigationPlan: 'Mitigasi sementara tanpa Terima & Tangani',
        }),
      ).rejects.toThrowError(AppException);

      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-ack-auth',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
      });
      await expect(
        service.resolveBlocker('usr-2', 'blk-ack-auth', {
          resolutionNote: 'Non-PIC mencoba menyelesaikan tiket orang lain',
        }),
      ).rejects.toThrowError(AppException);
      await expect(
        service.acceptRiskBlocker('usr-2', 'blk-ack-auth', {
          riskAcceptanceJustification: 'Non-PIC mencoba accept risk',
          riskMitigationPlan: 'Rencana mitigasi non-PIC',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('rejects addSupportContribution when ticket is RESOLVED or CLOSED', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-res',
        status: BlockerStatus.RESOLVED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
      });
      await expect(
        service.addSupportContribution('usr-2', 'blk-res', 'Tambahan aksi', 'Catatan hasil'),
      ).rejects.toThrowError(AppException);

      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-closed',
        status: BlockerStatus.CLOSED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
      });
      await expect(
        service.addSupportContribution('usr-2', 'blk-closed', 'Tambahan aksi', 'Catatan hasil'),
      ).rejects.toThrowError(AppException);
    });

    it('records peer support contribution on ACKNOWLEDGED ticket and notifies reporter (DEC-015)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Pool Timeout] Latency query database staging tinggi',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({
          id: 'sup-1',
          blockerId: 'blk-1',
          supporterUserId: 'usr-2',
          supporter: { id: 'usr-2', fullName: 'Charlie Ops', email: 'charlie@dutamedia.com' },
          actionTaken: 'Membantu migrasi koneksi pool',
          resultNote: 'Latency turun normal < 50ms',
        }),
      };

      const res = await service.addSupportContribution(
        'usr-2',
        'blk-1',
        'Membantu migrasi koneksi pool',
        'Latency turun normal < 50ms',
      );
      expect(res.id).toBe('sup-1');
      expect(mockPrisma.supportContribution.create).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_SUPPORT_CONTRIBUTED',
            actionUrl: '/raise-blockers?tab=mine',
            message: expect.stringContaining('Membantu migrasi koneksi pool'),
          }),
        }),
      );
    });

    it('allows reporter to accept support as final resolution and closes ticket without duplicating PIC_RESOLUTION (DEC-015)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-sup-close',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Token 403] Endpoint staging gagal akses',
        resolvedAt: null,
        resolutionNote: null,
      });
      mockPrisma.supportContribution = {
        findUnique: vi.fn().mockResolvedValue({
          id: 'sup-1',
          blockerId: 'blk-sup-close',
          supporterUserId: 'supporter-2',
          actionTaken: 'Mengaktifkan role policy staging-reader',
          resultNote: 'Endpoint staging kembali 200 OK',
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sup-1',
          actionTaken: '[SUPPORT_RESOLVED_CLOSED] Mengaktifkan role policy staging-reader',
        }),
        create: vi.fn().mockResolvedValue({ id: 'sup-closed-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-sup-close',
        status: BlockerStatus.CLOSED,
      });

      const res = await service.respondToSupportContribution('emp-1', 'blk-sup-close', 'sup-1', {
        decision: 'RESOLVE_AND_CLOSE',
      });

      expect(res.status).toBe(BlockerStatus.CLOSED);
      expect(mockPrisma.supportContribution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sup-1' },
          data: {
            actionTaken: '[SUPPORT_RESOLVED_CLOSED] Mengaktifkan role policy staging-reader',
          },
        }),
      );
      expect(mockPrisma.blockerTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'blk-sup-close' },
          data: expect.objectContaining({ status: BlockerStatus.CLOSED }),
        }),
      );
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'BLOCKER_CLOSED_BY_REPORTER',
          }),
        }),
      );

      // Verifikasi getBlockerQueue tidak mensintesis entri PIC_RESOLUTION palsu jika bantuan yang menutup
      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-sup-close',
          status: BlockerStatus.CLOSED,
          raisedAt: new Date('2026-11-15T08:00:00.000Z'),
          resolvedAt: new Date('2026-11-15T09:00:00.000Z'),
          closedAt: new Date('2026-11-15T09:00:00.000Z'),
          resolutionNote: 'Mengaktifkan role policy staging-reader — Endpoint staging kembali 200 OK',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
          assignedOwner: { id: 'owner-1', fullName: 'Gunawan Setiawan', email: 'ops@dutamedia.com' },
          supportContributions: [
            {
              id: 'sup-1',
              supporter: { id: 'supporter-2', fullName: 'Rekan Ops', email: 'rekan@dutamedia.com' },
              actionTaken: '[SUPPORT_RESOLVED_CLOSED] Mengaktifkan role policy staging-reader',
              resultNote: 'Endpoint staging kembali 200 OK',
              createdAt: new Date('2026-11-15T08:30:00.000Z'),
            },
            {
              id: 'sup-closed-1',
              supporter: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
              resultNote: 'Pelapor menerima bantuan sebagai penyelesaian.',
              createdAt: new Date('2026-11-15T09:00:00.000Z'),
            },
          ],
        },
      ]);
      const queue = await service.getBlockerQueue();
      expect(queue[0].supportContributions.map((e: any) => e.entryType)).toEqual([
        'PEER_SUPPORT',
        'REPORTER_CLOSED',
      ]);
    });

    it('allows reporter to accept support as partial progress while keeping ticket ACKNOWLEDGED (DEC-015)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-sup-acc',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Token 403] Endpoint staging gagal akses',
      });
      mockPrisma.supportContribution = {
        findUnique: vi.fn().mockResolvedValue({
          id: 'sup-2',
          blockerId: 'blk-sup-acc',
          supporterUserId: 'owner-1',
          actionTaken: 'Membuka firewall port staging',
          resultNote: 'Port sudah terbuka untuk koneksi internal',
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sup-2',
          actionTaken: '[SUPPORT_ACCEPTED_PROGRESS] Membuka firewall port staging',
        }),
      };

      const res = await service.respondToSupportContribution('emp-1', 'blk-sup-acc', 'sup-2', {
        decision: 'ACCEPT_AS_SUPPORT',
      });

      expect(res.status).toBe(BlockerStatus.ACKNOWLEDGED);
      expect(mockPrisma.supportContribution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            actionTaken: '[SUPPORT_ACCEPTED_PROGRESS] Membuka firewall port staging',
          },
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'owner-1',
            triggerType: 'BLOCKER_SUPPORT_ACCEPTED',
          }),
        }),
      );
    });

    it('validates minimum reason and rejects unhelpful support while keeping ticket ACKNOWLEDGED (DEC-015)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-sup-rej',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Token 403] Endpoint staging gagal akses',
        raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho' },
      });
      mockPrisma.supportContribution = {
        findUnique: vi.fn().mockResolvedValue({
          id: 'sup-3',
          blockerId: 'blk-sup-rej',
          supporterUserId: 'supporter-2',
          actionTaken: 'Reset password VPN pribadi',
          resultNote: 'Silakan dicoba ulang',
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sup-3',
          actionTaken: '[SUPPORT_REJECTED] Reset password VPN pribadi',
        }),
      };

      await expect(
        service.respondToSupportContribution('emp-1', 'blk-sup-rej', 'sup-3', {
          decision: 'REJECT_SUPPORT',
          reason: 'Gagal',
        }),
      ).rejects.toThrowError(AppException);

      // Penolakan oleh bukan pelapor wajib ditolak (FORBIDDEN)
      await expect(
        service.respondToSupportContribution('owner-1', 'blk-sup-rej', 'sup-3', {
          decision: 'ACCEPT_AS_SUPPORT',
        }),
      ).rejects.toThrowError(AppException);

      const res = await service.respondToSupportContribution('emp-1', 'blk-sup-rej', 'sup-3', {
        decision: 'REJECT_SUPPORT',
        reason: 'Masalahnya bukan di akun VPN melainkan role IAM policy vault.',
      });

      expect(res.status).toBe(BlockerStatus.ACKNOWLEDGED);
      expect(mockPrisma.supportContribution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            actionTaken: '[SUPPORT_REJECTED] Reset password VPN pribadi',
            resultNote:
              'Silakan dicoba ulang\n[CATATAN_PENOLAKAN_PELAPOR]: Masalahnya bukan di akun VPN melainkan role IAM policy vault.',
          },
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'BLOCKER_SUPPORT_REJECTED',
            title: 'Bantuan Belum Membantu: Token 403',
            message: expect.stringContaining('Pelapor: Aditya Nugroho'),
          }),
        }),
      );
      const rejectNotifMessage = mockPrisma.notification.create.mock.calls[0][0].data.message;
      expect(rejectNotifMessage).toContain('menginformasikan bahwa kendala masih berlanjut');
      expect(rejectNotifMessage).toContain('Status Tiket: Sedang Ditangani');
      expect(rejectNotifMessage).toContain('Bantuan yang Dicoba: Reset password VPN pribadi');
      expect(rejectNotifMessage).toContain('Catatan / Kendala yang Masih Terjadi:');
      expect(rejectNotifMessage).toContain('role IAM policy vault');
      expect(rejectNotifMessage).not.toContain('Tindak Lanjut Anda:');
      expect(rejectNotifMessage).not.toContain('Bantuan Ditolak Pelapor');
    });

    it('calculates escalation aging radar metrics and breach status correctly', async () => {
      const now = new Date('2026-10-28T14:00:00.000Z');
      mockClock.now.mockReturnValue(now);

      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-breached',
          description: 'Sertifikat SSL expired',
          type: BlockerType.INFRA,
          severity: BlockerSeverity.CRITICAL,
          impact: BlockerImpact.PRODUCTION,
          status: BlockerStatus.OPEN,
          raisedAt: new Date('2026-10-28T08:00:00.000Z'),
          targetResolutionAt: new Date('2026-10-28T12:00:00.000Z'), // Passed 2 hours ago -> Breached!
          raisedBy: { id: 'u1', fullName: 'Alice' },
          assignedOwner: { id: 'u2', fullName: 'Bob Lead' },
          projectCodeReference: 'PRJ-CORE',
        },
        {
          id: 'blk-ontime',
          description: 'Menunggu review PR',
          type: BlockerType.APPROVAL,
          severity: BlockerSeverity.HIGH,
          impact: BlockerImpact.TASK,
          status: BlockerStatus.ACKNOWLEDGED,
          raisedAt: new Date('2026-10-28T12:00:00.000Z'),
          targetResolutionAt: new Date('2026-10-28T16:00:00.000Z'), // Still 2 hours left
          raisedBy: { id: 'u3', fullName: 'Charlie' },
          assignedOwner: { id: 'u2', fullName: 'Bob Lead' },
          projectCodeReference: null,
        },
      ]);

      const metrics = await service.getEscalationAgingMetrics();
      expect(metrics.summary.totalOpen).toBe(2);
      expect(metrics.summary.breachedCount).toBe(1);
      expect(metrics.summary.criticalCount).toBe(1);
      expect(metrics.summary.slaComplianceRate).toBe(50);
      expect(metrics.blockers[0].isBreached).toBe(true);
      expect(metrics.blockers[1].isBreached).toBe(false);
    });

    it('orders blocker queue by newest raisedAt descending and tags entryType on contributions', async () => {
      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-q1',
          supportContributions: [
            {
              id: 'sc-peer',
              actionTaken: 'Cek routing subnet',
              resultNote: 'Ditemukan failover terputus',
              createdAt: new Date('2026-11-13T08:00:00.000Z'),
            },
            {
              id: 'sc-reopen',
              actionTaken: 'Dikembalikan oleh Pelapor (Belum Memadai)',
              resultNote: 'Endpoint /secrets/staging masih merespons 403.',
              createdAt: new Date('2026-11-13T09:00:00.000Z'),
            },
          ],
        },
      ]);

      const queue = await service.getBlockerQueue({ raisedByUserId: 'emp-1' });

      expect(mockPrisma.blockerTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { raisedByUserId: 'emp-1' },
          orderBy: [{ raisedAt: 'desc' }, { id: 'desc' }],
        }),
      );
      expect(queue[0].supportContributions.map((s: any) => s.entryType)).toEqual([
        'PEER_SUPPORT',
        'PIC_RESOLUTION',
        'REPORTER_REOPEN',
      ]);
    });

    it('synthesizes missing PIC resolution, accepted risk, and reporter closure entries chronologically for legacy tickets without duplicating recorded events', async () => {
      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-legacy-closed',
          status: BlockerStatus.CLOSED,
          raisedAt: new Date('2026-11-13T09:18:00.000Z'),
          resolvedAt: new Date('2026-11-13T09:55:00.000Z'),
          closedAt: new Date('2026-11-13T09:57:00.000Z'),
          resolutionNote: 'Permission role staging-reader telah ditambahkan ke IAM policy dev.frontend.',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
          assignedOwner: { id: 'head-1', fullName: 'Arif Budiman', email: 'arif@dutamedia.com' },
          supportContributions: [
            {
              id: 'sc-reopen',
              supporter: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              actionTaken: 'Dikembalikan oleh Pelapor (Belum Memadai)',
              resultNote: 'Endpoint /secrets/staging masih merespons 403.',
              createdAt: new Date('2026-11-13T09:37:00.000Z'),
            },
          ],
        },
        {
          id: 'blk-recorded-all',
          status: BlockerStatus.CLOSED,
          raisedAt: new Date('2026-11-14T08:00:00.000Z'),
          resolvedAt: new Date('2026-11-14T09:00:00.000Z'),
          closedAt: new Date('2026-11-14T09:15:00.000Z'),
          riskAcceptanceJustification: 'Menunggu approval vendor',
          riskMitigationPlan: 'Pakai backup cache',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
          assignedOwner: { id: 'head-1', fullName: 'Arif Budiman', email: 'arif@dutamedia.com' },
          supportContributions: [
            {
              id: 'sc-risk',
              supporter: { id: 'head-1', fullName: 'Arif Budiman', email: 'arif@dutamedia.com' },
              actionTaken: '[PIC_ACCEPTED_RISK] Menunggu approval vendor',
              resultNote: 'Pakai backup cache',
              createdAt: new Date('2026-11-14T09:00:00.000Z'),
            },
            {
              id: 'sc-close',
              supporter: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
              resultNote: 'Pelapor telah mengonfirmasi penyelesaian dan menutup tiket kendala secara permanen.',
              createdAt: new Date('2026-11-14T09:15:00.000Z'),
            },
          ],
        },
      ]);

      const queue = await service.getBlockerQueue();
      expect(queue[0].supportContributions.map((s: any) => s.entryType)).toEqual([
        'PIC_RESOLUTION',
        'REPORTER_REOPEN',
        'PIC_RESOLUTION',
        'REPORTER_CLOSED',
      ]);
      expect(queue[0].supportContributions[0].supporter.fullName).toBe('Arif Budiman');
      expect(queue[0].supportContributions[1].supporter.fullName).toBe('Aditya Nugroho');
      expect(queue[0].supportContributions[2].supporter.fullName).toBe('Arif Budiman');
      expect(queue[0].supportContributions[3].supporter.fullName).toBe('Aditya Nugroho');

      expect(queue[1].supportContributions.map((s: any) => s.entryType)).toEqual([
        'PIC_ACCEPTED_RISK',
        'REPORTER_CLOSED',
      ]);
      expect(queue[1].supportContributions).toHaveLength(2);
    });

    it('allows reporter to update active blocker ticket and notifies PIC, Head, and Supervisor (DEC-016)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-edit-1',
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        status: BlockerStatus.ACKNOWLEDGED,
        description: '[Judul Lama] Deskripsi lama kendala backend',
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        raisedAt: new Date('2026-11-16T01:00:00.000Z'),
        raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'dev.frontend@dutamedia.com' },
        assignedOwner: { id: 'owner-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
        supportContributions: [
          { supporterUserId: 'supporter-1' },
        ],
      });
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-edit-1',
        type: BlockerType.REQUIREMENT,
        severity: BlockerSeverity.CRITICAL,
        impact: BlockerImpact.MILESTONE,
        status: BlockerStatus.ACKNOWLEDGED,
        description: '[Judul Baru Revisi] Deskripsi baru lebih jelas (Ekspektasi: Review API)',
        raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'dev.frontend@dutamedia.com' },
        assignedOwner: { id: 'owner-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
      });
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'emp-1',
          function: 'Engineering',
          directManagerId: 'head-1',
        }),
        findMany: vi.fn().mockResolvedValue([
          { userId: 'head-1' },
          { userId: 'lead-1' },
        ]),
      };
      mockPrisma.auditLog = { create: vi.fn() };

      const res = await service.updateBlocker('emp-1', 'blk-edit-1', {
        type: BlockerType.REQUIREMENT,
        severity: BlockerSeverity.CRITICAL,
        impact: BlockerImpact.MILESTONE,
        description: '[Judul Baru Revisi] Deskripsi baru lebih jelas (Ekspektasi: Review API)',
      });

      expect(res.type).toBe(BlockerType.REQUIREMENT);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorUserId: 'emp-1',
            actionCode: 'BLOCKER_UPDATED_BY_REPORTER',
            relatedEntityId: 'blk-edit-1',
          }),
        }),
      );
      const notifRecipients = mockPrisma.notification.create.mock.calls.map(
        (c: any) => c[0].data.recipientUserId,
      );
      expect(notifRecipients).toEqual(
        expect.arrayContaining(['owner-1', 'head-1', 'lead-1', 'supporter-1']),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'BLOCKER_UPDATED_BY_REPORTER',
            actionUrl: '/blockers',
          }),
        }),
      );
    });

    it('allows reporter to delete active blocker with reason category and mandatory text, cleaning stale notifications and notifying stakeholders (DEC-016)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-del-1',
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.MILESTONE,
        status: BlockerStatus.OPEN,
        description: '[Salah Akun Saat Lapor] Tiket keliru dibuat dengan akun lain',
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        raisedBy: { id: 'emp-1', fullName: 'Bambang Pratama', email: 'lead.tech@dutamedia.com' },
        assignedOwner: { id: 'owner-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
        supportContributions: [{ supporterUserId: 'supporter-1' }],
      });
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'emp-1',
          function: 'Engineering',
          directManagerId: 'owner-1',
        }),
        findMany: vi.fn().mockResolvedValue([{ userId: 'owner-1' }, { userId: 'lead-2' }]),
      };
      mockPrisma.supportContribution = {
        findMany: vi.fn().mockResolvedValue([]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      };
      mockPrisma.notification.findMany = vi
        .fn()
        .mockResolvedValue([{ recipientUserId: 'pm-1' }]);
      mockPrisma.notification.deleteMany = vi.fn().mockResolvedValue({ count: 2 });
      mockPrisma.auditLog = { create: vi.fn() };
      mockPrisma.blockerTicket.delete.mockResolvedValue({ id: 'blk-del-1' });

      const res = await service.deleteBlocker('emp-1', 'blk-del-1', {
        reasonCategory: 'OTHER',
        reason: 'Tiket tidak sengaja terbit menggunakan akun tester lain saat demo.',
      });

      expect(res).toEqual({ deleted: true, id: 'blk-del-1' });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'BLOCKER_DELETED_BY_REPORTER',
            relatedEntityId: 'blk-del-1',
          }),
        }),
      );
      expect(mockPrisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { relatedEntityId: 'blk-del-1' },
      });
      expect(mockPrisma.supportContribution.deleteMany).toHaveBeenCalledWith({
        where: { blockerId: 'blk-del-1' },
      });
      expect(mockPrisma.blockerTicket.delete).toHaveBeenCalledWith({
        where: { id: 'blk-del-1' },
      });
      const notifRecipients = mockPrisma.notification.create.mock.calls.map(
        (c: any) => c[0].data.recipientUserId,
      );
      expect(notifRecipients).toEqual(
        expect.arrayContaining(['owner-1', 'lead-2', 'supporter-1', 'pm-1']),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'BLOCKER_DELETED_BY_REPORTER',
            message: expect.stringContaining('Kategori Alasan Hapus: Alasan Lainnya'),
          }),
        }),
      );
    });

    it('rejects edit and delete for non-reporter (403), settled tickets (409), and short delete reason (400)', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-guard-1',
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        status: BlockerStatus.ACKNOWLEDGED,
        description: '[Kendala Valid] Deskripsi cukup panjang',
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
      });

      // Non-reporter -> 403
      await expect(
        service.updateBlocker('other-user', 'blk-guard-1', {
          type: BlockerType.TECHNICAL,
          severity: BlockerSeverity.HIGH,
          impact: BlockerImpact.TASK,
          description: '[Update Tidak Sah] Deskripsi baru valid',
        }),
      ).rejects.toThrowError(AppException);

      await expect(
        service.deleteBlocker('other-user', 'blk-guard-1', {
          reasonCategory: 'WRONG_INPUT_OR_DUPLICATE',
          reason: 'Alasan cukup panjang untuk hapus tiket.',
        }),
      ).rejects.toThrowError(AppException);

      // Non-OTHER category deletes cleanly without requiring text reason
      mockPrisma.blockerTicket.delete.mockResolvedValue({ id: 'blk-guard-1' });
      const presetDeleteRes = await service.deleteBlocker('emp-1', 'blk-guard-1', {
        reasonCategory: 'WRONG_INPUT_OR_DUPLICATE',
      });
      expect(presetDeleteRes).toEqual({ deleted: true, id: 'blk-guard-1' });
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'BLOCKER_DELETED_BY_REPORTER',
            message: expect.stringContaining('Kategori Alasan Hapus: Salah Input / Tiket Duplikat'),
          }),
        }),
      );
      const presetMsg = mockPrisma.notification.create.mock.calls[0][0].data.message;
      expect(presetMsg).not.toContain('Detail Alasan Penghapusan:');

      // Delete reason < 10 chars when OTHER -> 400
      await expect(
        service.deleteBlocker('emp-1', 'blk-guard-1', {
          reasonCategory: 'OTHER',
          reason: 'Pendek',
        }),
      ).rejects.toThrowError(AppException);

      // Settled ticket (RESOLVED / ACCEPTED_RISK / CLOSED) -> 409
      for (const settledStatus of [
        BlockerStatus.RESOLVED,
        BlockerStatus.ACCEPTED_RISK,
        BlockerStatus.CLOSED,
      ]) {
        mockPrisma.blockerTicket.findUnique.mockResolvedValue({
          id: 'blk-settled',
          status: settledStatus,
          raisedByUserId: 'emp-1',
        });

        await expect(
          service.updateBlocker('emp-1', 'blk-settled', {
            type: BlockerType.TECHNICAL,
            severity: BlockerSeverity.HIGH,
            impact: BlockerImpact.TASK,
            description: '[Update Terlambat] Deskripsi baru valid',
          }),
        ).rejects.toThrowError(AppException);

        await expect(
          service.deleteBlocker('emp-1', 'blk-settled', {
            reasonCategory: 'NO_LONGER_RELEVANT',
            reason: 'Alasan penghapusan lebih dari sepuluh karakter.',
          }),
        ).rejects.toThrowError(AppException);
      }
    });
  });
});
