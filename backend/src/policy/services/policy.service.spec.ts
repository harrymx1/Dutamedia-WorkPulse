import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyService } from './policy.service';
import { PolicyCategory } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

describe('PolicyService (WP-EP04-TK001..TK005)', () => {
  let service: PolicyService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      policy: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      policyOwnerAssignment: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          id: 'poa-default',
          userId: 'usr-1',
          policyCategory: PolicyCategory.CHECKIN_TIMING,
        }),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
      },
      organizationalAssignment: {
        findMany: vi.fn().mockResolvedValue([{ role: 'CEO_MANAGEMENT' }]),
      },
      auditLog: {
        create: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 'marker-1', actionCode: 'POLICY_OWNERS_BASELINE_SYNCED_V1' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'usr-emp-1' },
          { id: 'usr-emp-2' },
        ]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T09:00:00.000Z')),
      todayString: vi.fn(() => '2026-10-28'),
    };

    service = new PolicyService(mockPrisma, mockClock);
  });

  describe('getActivePolicy', () => {
    it('returns canonical fallback when no policy is recorded in database (DEC-011)', async () => {
      mockPrisma.policy.findFirst.mockResolvedValue(null);

      const result = await service.getActivePolicy(PolicyCategory.CHECKIN_TIMING);

      expect(result.isFallback).toBe(true);
      expect(result.isIllustrative).toBe(true);
      expect(result.category).toBe(PolicyCategory.CHECKIN_TIMING);
      expect(result.configurationValues.morningLockCutoff).toBe('09:30');
      expect(result.configurationValues.eodLockCutoff).toBe('21:00');
    });

    it('returns database policy when an active record exists', async () => {
      const mockRecord = {
        id: 'pol-123',
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:45' },
        isIllustrative: false,
        effectiveDate: new Date('2026-10-01'),
        endDate: null,
        createdAt: new Date('2026-10-01'),
        createdBy: { id: 'usr-1', fullName: 'Direktur', email: 'director@test.com' },
      };
      mockPrisma.policy.findFirst.mockResolvedValue(mockRecord);

      const result = await service.getActivePolicy(PolicyCategory.CHECKIN_TIMING);

      expect(result.isFallback).toBe(false);
      expect(result.isIllustrative).toBe(false);
      expect(result.configurationValues.morningLockCutoff).toBe('09:45');
    });

    it('uses ClockService WIB date string when no targetDate is passed (avoids UTC early-morning drift)', async () => {
      mockClock.todayString.mockReturnValue('2026-11-23');
      mockPrisma.policy.findFirst.mockResolvedValue(null);

      await service.getActivePolicy(PolicyCategory.CHECKIN_TIMING);

      expect(mockClock.todayString).toHaveBeenCalledWith('Asia/Jakarta');
      expect(mockPrisma.policy.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            effectiveDate: { lte: new Date('2026-11-23') },
          }),
        }),
      );
    });
  });

  describe('createPolicyVersion (DEC-008 Anti-Backdating)', () => {
    it('throws BUSINESS_RULE_BACKDATING_FORBIDDEN when effectiveDate is in the past', async () => {
      const dto = {
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:30' },
        effectiveDate: '2026-10-20', // past date compared to 2026-10-28
        changeJustification: 'Alasan perubahan kebijakan operasional kantor',
      };

      await expect(
        service.createPolicyVersion('usr-1', dto),
      ).rejects.toThrowError(AppException);

      try {
        await service.createPolicyVersion('usr-1', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN);
        expect(err.getStatus()).toBe(422);
      }
    });

    it('successfully creates new version and logs audit trail when effectiveDate >= today', async () => {
      const dto = {
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:45' },
        effectiveDate: '2026-10-29',
        changeJustification: 'Penyesuaian jam masuk kerja selama sprint rilis Q4',
      };

      const mockOldPolicy = {
        id: 'old-pol-1',
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:30' },
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
      };

      mockPrisma.policy.findFirst.mockResolvedValue(mockOldPolicy);
      mockPrisma.policy.create.mockResolvedValue({
        id: 'new-pol-2',
        ...dto,
        effectiveDate: new Date('2026-10-29'),
        createdBy: { id: 'usr-1', fullName: 'Direktur', email: 'dir@test.com' },
      });

      const result = await service.createPolicyVersion('usr-1', dto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Vitest',
      });

      // Verifikasi penutupan kebijakan lama
      expect(mockPrisma.policy.update).toHaveBeenCalledWith({
        where: { id: 'old-pol-1' },
        data: { endDate: new Date('2026-10-28') },
      });

      // Verifikasi pencatatan jejak audit
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'POLICY_VERSION_CREATED',
            relatedEntityType: 'policies',
            actorUserId: 'usr-1',
          }),
        }),
      );

      expect(result.id).toBe('new-pol-2');
      expect(mockPrisma.notification.createMany).toHaveBeenCalledTimes(1);
    });

    it('broadcasts structured POLICY_UPDATED notification to active non-admin users with before/after diff (IMP-063)', async () => {
      const dto = {
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: {
          morningOnTimeCutoff: '09:30',
          morningLockCutoff: '10:00',
          eodOnTimeCutoff: '17:00',
          eodLockCutoff: '21:00',
        },
        effectiveDate: '2026-10-28',
        changeJustification: 'Penyesuaian jam kerja bulan Ramadhan 2026',
      };

      mockPrisma.policy.findFirst.mockResolvedValue({
        id: 'old-pol-1',
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: {
          morningOnTimeCutoff: '09:00',
          morningLockCutoff: '23:59',
          eodOnTimeCutoff: '17:00',
          eodLockCutoff: '21:00',
        },
        effectiveDate: new Date('2026-10-01'),
        endDate: null,
      });

      mockPrisma.policy.create.mockResolvedValue({
        id: 'new-pol-ramadhan',
        ...dto,
        effectiveDate: new Date('2026-10-28'),
        createdBy: { id: 'usr-admin', fullName: 'Sistem Administrator', email: 'admin@dutamedia.com' },
      });

      await service.createPolicyVersion('usr-admin', dto);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'usr-admin' },
            email: { not: 'admin@dutamedia.com' },
          }),
        }),
      );

      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            recipientUserId: 'usr-emp-1',
            triggerType: 'POLICY_UPDATED',
            title: 'Perubahan Kebijakan Jam Batas Pengisian (Cut-Off)',
            actionUrl: '/daily/morning',
            message: expect.stringContaining('09:00 → 09:30 WIB'),
          }),
        ]),
      });

      const createdNotifData = mockPrisma.notification.createMany.mock.calls[0][0].data[0];
      expect(createdNotifData.message).not.toContain('Tetap ');
    });

    it('rejects policy update when no parameter values changed compared to active non-illustrative policy', async () => {
      const dto = {
        category: PolicyCategory.BLOCKER_SLA,
        configurationValues: {
          level1Hours: 4,
          level2Hours: 8,
          autoEscalateAfterHours: 4,
        },
        effectiveDate: '2026-10-28',
        changeJustification: 'Menyimpan ulang nilai kebijakan yang sama persis',
      };

      mockPrisma.policy.findFirst.mockResolvedValue({
        id: 'active-sla-1',
        category: PolicyCategory.BLOCKER_SLA,
        configurationValues: {
          level1Hours: 4,
          level2Hours: 8,
          autoEscalateAfterHours: 4,
        },
        isIllustrative: false,
        effectiveDate: new Date('2026-10-01'),
        endDate: null,
      });

      await expect(
        service.createPolicyVersion('usr-admin', dto),
      ).rejects.toThrowError(AppException);
    });

    it('rejects policy creation when caller is not an active policy owner (BR-15, FR-34)', async () => {
      const dto = {
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '10:00' },
        effectiveDate: '2026-10-29',
        changeJustification: 'Perubahan jam masuk kantor oleh bukan pemilik',
      };

      // Simulasikan ada pemilik lain di database, tetapi bukan user pemanggil
      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.policyOwnerAssignment.count.mockResolvedValue(1);

      await expect(
        service.createPolicyVersion('usr-unauthorized', dto),
      ).rejects.toThrowError(AppException);

      try {
        await service.createPolicyVersion('usr-unauthorized', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.AUTH_FORBIDDEN_ROLE);
        expect(err.getStatus()).toBe(403);
      }
    });
  });

  describe('Policy Owners Governance (Multi-Owner & Revocation)', () => {
    it('allows assigning multiple active owners to the same policy category concurrently without deleting previous owners', async () => {
      const dto1 = {
        policyCategory: PolicyCategory.CHECKIN_TIMING,
        userId: 'usr-dewi',
        effectiveDate: '2026-10-28',
      };
      const dto2 = {
        policyCategory: PolicyCategory.CHECKIN_TIMING,
        userId: 'usr-hendra',
        effectiveDate: '2026-10-28',
      };

      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.policyOwnerAssignment.create.mockImplementation(({ data }: any) => ({
        id: `poa-${data.userId}`,
        ...data,
        user: { id: data.userId, fullName: data.userId === 'usr-dewi' ? 'Dewi Lestari' : 'Hendra Wijaya', email: 'test@dm.com' },
      }));

      const res1 = await service.assignPolicyOwner('usr-actor', dto1);
      const res2 = await service.assignPolicyOwner('usr-actor', dto2);

      expect(res1.userId).toBe('usr-dewi');
      expect(res2.userId).toBe('usr-hendra');
      // Verifikasi bahwa policyOwnerAssignment.delete dan update TIDAK dipanggil saat menambahkan owner lain
      expect(mockPrisma.policyOwnerAssignment.delete).not.toHaveBeenCalled();
      expect(mockPrisma.policyOwnerAssignment.create).toHaveBeenCalledTimes(2);
    });

    it('rejects duplicate assignment for the same user on the same category with 409 Conflict', async () => {
      const dto = {
        policyCategory: PolicyCategory.CHECKIN_TIMING,
        userId: 'usr-dewi',
        effectiveDate: '2026-10-28',
      };

      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue({
        id: 'poa-existing',
        userId: 'usr-dewi',
        policyCategory: PolicyCategory.CHECKIN_TIMING,
      });

      await expect(
        service.assignPolicyOwner('usr-actor', dto),
      ).rejects.toThrowError(AppException);

      try {
        await service.assignPolicyOwner('usr-actor', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.RESOURCE_CONFLICT);
        expect(err.getStatus()).toBe(409);
      }
    });

    it('revokes an individual owner assignment and logs audit trail without affecting others', async () => {
      mockPrisma.policyOwnerAssignment.findUnique.mockResolvedValue({
        id: 'poa-to-revoke',
        userId: 'usr-dewi',
        policyCategory: PolicyCategory.CHECKIN_TIMING,
        effectiveDate: new Date('2026-10-28'),
        user: { id: 'usr-dewi', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
      });

      const res = await service.revokePolicyOwner('usr-actor', 'poa-to-revoke');

      expect(res.success).toBe(true);
      expect(mockPrisma.policyOwnerAssignment.delete).toHaveBeenCalledWith({
        where: { id: 'poa-to-revoke' },
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'POLICY_OWNER_REVOKED',
            relatedEntityType: 'policy_owner_assignments',
            relatedEntityId: 'poa-to-revoke',
          }),
        }),
      );
    });

    it('updates an existing owner assignment (Update CRUD) and logs POLICY_OWNER_UPDATED', async () => {
      mockPrisma.policyOwnerAssignment.findUnique.mockResolvedValue({
        id: 'poa-1',
        userId: 'usr-dewi',
        policyCategory: PolicyCategory.CHECKIN_TIMING,
        effectiveDate: new Date('2026-10-28'),
        endDate: null,
        user: { id: 'usr-dewi', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
      });
      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.policyOwnerAssignment.update.mockResolvedValue({
        id: 'poa-1',
        userId: 'usr-arif',
        policyCategory: PolicyCategory.CHECKIN_TIMING,
        effectiveDate: new Date('2026-10-29'),
        endDate: null,
        user: { id: 'usr-arif', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
      });

      const updated = await service.updatePolicyOwner('usr-direktur', 'poa-1', {
        userId: 'usr-arif',
        effectiveDate: '2026-10-29',
      });

      expect(updated.userId).toBe('usr-arif');
      expect(mockPrisma.policyOwnerAssignment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'poa-1' },
          data: expect.objectContaining({
            userId: 'usr-arif',
            policyCategory: PolicyCategory.CHECKIN_TIMING,
          }),
        }),
      );
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'POLICY_OWNER_UPDATED',
            relatedEntityId: 'poa-1',
          }),
        }),
      );
    });

    it('runs one-time baseline sync for Direktur, Admin, and HRGA across all 5 categories even when 1 partial row already exists', async () => {
      // Simulasikan penanda belum ada di audit_logs, dan baru ada 1 baris (Dewi Lestari pada CHECKIN_TIMING)
      mockPrisma.auditLog.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'usr-dir', role: 'CEO_MANAGEMENT' },
        { userId: 'usr-adm', role: 'SYSTEM_ADMIN' },
        { userId: 'usr-hrga', role: 'HRGA' },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'usr-dir', email: 'direktur@dutamedia.com' },
        { id: 'usr-adm', email: 'admin@dutamedia.com' },
        { id: 'usr-hrga', email: 'hrga@dutamedia.com' },
      ]);
      mockPrisma.policyOwnerAssignment.findMany.mockResolvedValue([
        { userId: 'usr-hrga', policyCategory: PolicyCategory.CHECKIN_TIMING },
      ]);

      await service.getPolicyOwners();

      // 3 pemilik x 5 kategori = 15 total; 1 sudah ada -> 14 dibuat baru
      expect(mockPrisma.policyOwnerAssignment.create).toHaveBeenCalledTimes(14);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'POLICY_OWNERS_BASELINE_SYNCED_V1',
            relatedEntityId: 'usr-dir',
          }),
        }),
      );
    });

    it('does not re-add revoked baseline owners when prior owner mutation audit logs already exist for a category', async () => {
      // Penanda sync belum ada, tetapi sudah ada mutasi CRUD sebelumnya (mis. pencabutan)
      mockPrisma.auditLog.findFirst
        .mockResolvedValueOnce(null) // POLICY_OWNERS_BASELINE_SYNCED_V1 marker belum ada
        .mockResolvedValueOnce({ id: 'mut-1', actionCode: 'POLICY_OWNER_REVOKED' }); // sudah ada mutasi
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'usr-dir', role: 'CEO_MANAGEMENT' },
        { userId: 'usr-adm', role: 'SYSTEM_ADMIN' },
        { userId: 'usr-hrga', role: 'HRGA' },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([]);
      // Semua 5 kategori sudah punya minimal 1 pemilik aktif (mis. Direktur dicabut dari COMPLIANCE_THRESHOLD, sisa Admin & HRGA)
      mockPrisma.policyOwnerAssignment.findMany.mockResolvedValue([
        { userId: 'usr-adm', policyCategory: PolicyCategory.CHECKIN_TIMING },
        { userId: 'usr-adm', policyCategory: PolicyCategory.BLOCKER_SLA },
        { userId: 'usr-adm', policyCategory: PolicyCategory.COMPLIANCE_THRESHOLD },
        { userId: 'usr-adm', policyCategory: PolicyCategory.CORRECTION_WINDOW },
        { userId: 'usr-adm', policyCategory: PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD },
      ]);

      await service.getPolicyOwners();

      expect(mockPrisma.policyOwnerAssignment.create).not.toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'POLICY_OWNERS_BASELINE_SYNCED_V1',
            relatedEntityId: 'usr-dir',
          }),
        }),
      );
    });

    it('rejects revoking the last active owner of a category with 422 Unprocessable Entity', async () => {
      mockPrisma.policyOwnerAssignment.findUnique.mockResolvedValue({
        id: 'poa-last',
        userId: 'usr-dir',
        policyCategory: PolicyCategory.COMPLIANCE_THRESHOLD,
        effectiveDate: new Date('2026-10-28'),
        user: { id: 'usr-dir', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
      });
      mockPrisma.policyOwnerAssignment.count.mockResolvedValue(0);

      await expect(
        service.revokePolicyOwner('usr-dir', 'poa-last'),
      ).rejects.toThrowError(AppException);

      try {
        await service.revokePolicyOwner('usr-dir', 'poa-last');
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.VALIDATION_FAILED);
        expect(err.getStatus()).toBe(422);
        expect(err.message).toContain('Tetapkan pemilik kebijakan pengganti terlebih dahulu');
      }
      expect(mockPrisma.policyOwnerAssignment.delete).not.toHaveBeenCalled();
      expect(mockPrisma.policyOwnerAssignment.update).not.toHaveBeenCalled();
    });

    it('sends tailored line-separated notifications to Direktur, Admin, HRGA, and involved owners on assign, update (Arif -> Dharma), and revoke', async () => {
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'usr-dir', jobTitle: 'CEO / Direktur Utama', user: { id: 'usr-dir', fullName: 'Hendra Wijaya' } },
        { userId: 'usr-adm', jobTitle: 'System Administrator', user: { id: 'usr-adm', fullName: 'Sistem Administrator' } },
        { userId: 'usr-hrga', jobTitle: 'HRGA Lead', user: { id: 'usr-hrga', fullName: 'Dewi Lestari' } },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'usr-dir', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com', orgAssignments: [{ jobTitle: 'CEO / Direktur Utama' }] },
        { id: 'usr-adm', fullName: 'Sistem Administrator', email: 'admin@dutamedia.com', orgAssignments: [{ jobTitle: 'System Administrator' }] },
        { id: 'usr-hrga', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com', orgAssignments: [{ jobTitle: 'HRGA Lead' }] },
        { id: 'usr-arif', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com', orgAssignments: [{ jobTitle: 'Head of Engineering' }] },
        { id: 'usr-dharma', fullName: 'Dharma Putra', email: 'dharma@dutamedia.com', orgAssignments: [{ jobTitle: 'Backend Developer' }] },
      ]);

      // 1. ASSIGN Arif to BLOCKER_SLA
      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.policyOwnerAssignment.create.mockResolvedValue({
        id: 'poa-arif',
        userId: 'usr-arif',
        policyCategory: PolicyCategory.BLOCKER_SLA,
        effectiveDate: new Date('2026-10-28'),
        user: { id: 'usr-arif', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
      });

      await service.assignPolicyOwner('usr-dir', {
        policyCategory: PolicyCategory.BLOCKER_SLA,
        userId: 'usr-arif',
        effectiveDate: '2026-10-28',
      });

      const assignNotifs = mockPrisma.notification.createMany.mock.calls[0][0].data;
      expect(assignNotifs.map((n: any) => n.recipientUserId).sort()).toEqual(
        ['usr-adm', 'usr-arif', 'usr-dir', 'usr-hrga'].sort(),
      );
      const arifAssignNotif = assignNotifs.find((n: any) => n.recipientUserId === 'usr-arif');
      const hrgaAssignNotif = assignNotifs.find((n: any) => n.recipientUserId === 'usr-hrga');
      expect(arifAssignNotif.message).toContain('Anda telah ditetapkan sebagai Pemilik Kebijakan');
      expect(arifAssignNotif.message).toContain('\nKategori Kebijakan: Target Waktu Respon & Penanganan Kendala');
      expect(arifAssignNotif.message).not.toContain('SLA');
      expect(hrgaAssignNotif.message).toContain('Pemilik Kebijakan Baru: Arif Budiman (Head of Engineering)');

      // 2. UPDATE Arif -> Dharma on BLOCKER_SLA
      mockPrisma.notification.createMany.mockClear();
      mockPrisma.policyOwnerAssignment.findUnique.mockResolvedValue({
        id: 'poa-arif',
        userId: 'usr-arif',
        policyCategory: PolicyCategory.BLOCKER_SLA,
        effectiveDate: new Date('2026-10-28'),
        endDate: null,
        user: { id: 'usr-arif', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
      });
      mockPrisma.policyOwnerAssignment.update.mockResolvedValue({
        id: 'poa-arif',
        userId: 'usr-dharma',
        policyCategory: PolicyCategory.BLOCKER_SLA,
        effectiveDate: new Date('2026-10-28'),
        endDate: null,
        user: { id: 'usr-dharma', fullName: 'Dharma Putra', email: 'dharma@dutamedia.com' },
      });

      await service.updatePolicyOwner('usr-dir', 'poa-arif', {
        userId: 'usr-dharma',
      });

      const updateNotifs = mockPrisma.notification.createMany.mock.calls[0][0].data;
      expect(updateNotifs.map((n: any) => n.recipientUserId).sort()).toEqual(
        ['usr-adm', 'usr-arif', 'usr-dharma', 'usr-dir', 'usr-hrga'].sort(),
      );
      const arifUpdateNotif = updateNotifs.find((n: any) => n.recipientUserId === 'usr-arif');
      const dharmaUpdateNotif = updateNotifs.find((n: any) => n.recipientUserId === 'usr-dharma');
      const dirUpdateNotif = updateNotifs.find((n: any) => n.recipientUserId === 'usr-dir');
      expect(arifUpdateNotif.message).toContain('telah dialihkan kepada pejabat lain');
      expect(arifUpdateNotif.message).toContain('Dialihkan Kepada: Dharma Putra (Backend Developer)');
      expect(dharmaUpdateNotif.message).toContain('Anda kini ditetapkan sebagai Pemilik Kebijakan menggantikan pejabat sebelumnya');
      expect(dirUpdateNotif.message).toContain('Pemilik Sebelumnya: Arif Budiman (Head of Engineering)');
      expect(dirUpdateNotif.message).toContain('Pemilik Baru: Dharma Putra (Backend Developer)');

      // 3. REVOKE Dharma
      mockPrisma.notification.createMany.mockClear();
      mockPrisma.policyOwnerAssignment.findUnique.mockResolvedValue({
        id: 'poa-arif',
        userId: 'usr-dharma',
        policyCategory: PolicyCategory.BLOCKER_SLA,
        effectiveDate: new Date('2026-10-28'),
        user: { id: 'usr-dharma', fullName: 'Dharma Putra', email: 'dharma@dutamedia.com' },
      });

      await service.revokePolicyOwner('usr-dir', 'poa-arif');

      const revokeNotifs = mockPrisma.notification.createMany.mock.calls[0][0].data;
      expect(revokeNotifs.map((n: any) => n.recipientUserId).sort()).toEqual(
        ['usr-adm', 'usr-dharma', 'usr-dir', 'usr-hrga'].sort(),
      );
      const dharmaRevokeNotif = revokeNotifs.find((n: any) => n.recipientUserId === 'usr-dharma');
      const admRevokeNotif = revokeNotifs.find((n: any) => n.recipientUserId === 'usr-adm');
      expect(dharmaRevokeNotif.message).toContain('Wewenang Anda sebagai Pemilik Kebijakan untuk kategori berikut telah dicabut');
      expect(admRevokeNotif.message).toContain('Personil yang Dicabut: Dharma Putra (Backend Developer)');
    });
  });

  describe('Audit #18 Hardening — Parameter Validation, Reminder Notification, Audit Filter & Read Guard', () => {
    it('rejects inverted CHECKIN_TIMING cutoffs, invalid BLOCKER_SLA hours, and locking GREEN option with 400 VALIDATION_FAILED', async () => {
      await expect(
        service.createPolicyVersion('usr-1', {
          category: PolicyCategory.CHECKIN_TIMING,
          configurationValues: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '08:45',
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
          },
          effectiveDate: '2026-10-28',
          changeJustification: 'Uji batas kunci pagi mendahului batas tepat waktu',
        }),
      ).rejects.toMatchObject({ status: 400, code: ErrorCode.VALIDATION_FAILED });

      await expect(
        service.createPolicyVersion('usr-1', {
          category: PolicyCategory.BLOCKER_SLA,
          configurationValues: {
            level1Hours: 8,
            level2Hours: 4,
            autoEscalateAfterHours: 4,
          },
          effectiveDate: '2026-10-28',
          changeJustification: 'Uji jenjang lanjutan lebih cepat daripada jenjang pertama',
        }),
      ).rejects.toMatchObject({ status: 400, code: ErrorCode.VALIDATION_FAILED });

      await expect(
        service.createPolicyVersion('usr-1', {
          category: PolicyCategory.COMPLIANCE_THRESHOLD,
          configurationValues: {
            carryOverAmberDays: 3,
            allowGreenWithCarryOver: false,
          },
          effectiveDate: '2026-10-28',
          changeJustification: 'Uji coba larangan penguncian pilihan status hijau',
        }),
      ).rejects.toMatchObject({ status: 400, code: ErrorCode.VALIDATION_FAILED });

      await expect(
        service.createPolicyVersion('usr-1', {
          category: PolicyCategory.CORRECTION_WINDOW,
          configurationValues: { maxCorrectionDays: 0 },
          effectiveDate: '2026-10-28',
          changeJustification: 'Uji nilai jendela koreksi nol hari kerja',
        }),
      ).rejects.toMatchObject({ status: 400, code: ErrorCode.VALIDATION_FAILED });

      await expect(
        service.createPolicyVersion('usr-1', {
          category: PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD,
          configurationValues: {
            morningReminderMinutesBefore: 45,
            eodReminderMinutesBefore: 60,
            slaWarningPercent: 120,
          },
          effectiveDate: '2026-10-28',
          changeJustification: 'Uji persentase peringatan kendala di atas 99 persen',
        }),
      ).rejects.toMatchObject({ status: 400, code: ErrorCode.VALIDATION_FAILED });
    });

    it('sends complete notification diff for NOTIFICATION_REMINDER_THRESHOLD without technical SLA text', async () => {
      mockPrisma.policy.findFirst.mockResolvedValue({
        id: 'old-notif-1',
        category: PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD,
        configurationValues: {
          morningReminderMinutesBefore: 60,
          eodReminderMinutesBefore: 60,
          slaWarningPercent: 75,
        },
        isIllustrative: false,
        effectiveDate: new Date('2026-10-01'),
        endDate: null,
      });

      const dto = {
        category: PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD,
        configurationValues: {
          morningReminderMinutesBefore: 45,
          eodReminderMinutesBefore: 30,
          slaWarningPercent: 80,
        },
        effectiveDate: '2026-10-28',
        changeJustification: 'Penyesuaian jadwal pengingat pagi, sore, dan peringatan kendala',
      };

      mockPrisma.policy.create.mockResolvedValue({
        id: 'new-notif-2',
        ...dto,
        effectiveDate: new Date('2026-10-28'),
        createdBy: { id: 'usr-1', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
      });

      await service.createPolicyVersion('usr-1', dto);

      const notif = mockPrisma.notification.createMany.mock.calls[0][0].data[0];
      expect(notif.message).toContain('Pengingat Komitmen Pagi: 60 → 45 menit sebelum batas tepat waktu');
      expect(notif.message).toContain('Pengingat Evaluasi Sore (EOD): 60 → 30 menit sebelum batas tepat waktu');
      expect(notif.message).toContain('Ambang Peringatan Batas Waktu Kendala: 75 → 80 %');
      expect(notif.message).not.toContain('SLA');
    });

    it('filters getAuditTrail by requested category when category query is provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          timestamp: new Date('2026-10-28T02:00:00Z'),
          actor: { id: 'u1', fullName: 'Hendra', email: 'dir@dm.com' },
          actionCode: 'POLICY_VERSION_CREATED',
          valueBefore: {},
          valueAfter: {
            category: PolicyCategory.CHECKIN_TIMING,
            configurationValues: { morningLockCutoff: '09:45' },
            changeJustification: 'Ubah jam pagi',
          },
        },
        {
          id: 'log-2',
          timestamp: new Date('2026-10-28T01:00:00Z'),
          actor: { id: 'u2', fullName: 'Dewi', email: 'hrga@dm.com' },
          actionCode: 'POLICY_OWNER_ASSIGNED',
          valueBefore: null,
          valueAfter: {
            category: PolicyCategory.CORRECTION_WINDOW,
            userId: 'u2',
            userName: 'Dewi Lestari',
          },
        },
      ]);

      const filtered = await service.getAuditTrail(PolicyCategory.CHECKIN_TIMING);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('log-1');
    });

    it('restricts view access via assertCanViewPolicies to CEO_MANAGEMENT, SYSTEM_ADMIN, or active policy owners', async () => {
      await expect(
        service.assertCanViewPolicies({ id: 'usr-dir', role: 'CEO_MANAGEMENT' }),
      ).resolves.toBeUndefined();

      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValueOnce({ id: 'poa-owner' });
      await expect(
        service.assertCanViewPolicies({ id: 'usr-owner', role: 'HRGA' }),
      ).resolves.toBeUndefined();

      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.assertCanViewPolicies({ id: 'usr-emp', role: 'EMPLOYEE' }),
      ).rejects.toMatchObject({ status: 403, code: ErrorCode.AUTH_FORBIDDEN_ROLE });
    });
  });
});
