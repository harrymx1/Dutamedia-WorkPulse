import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CommitmentOutcome,
  Continuation,
  CorrectionClassification,
  CorrectionStatus,
  DailyStatus,
  PolicyCategory,
  Role,
} from '@prisma/client';
import { CorrectionRequestService } from './services/correction-request.service.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

function createMockUser(
  partial: Partial<CurrentUserPayload> & { userId: string; role: Role },
): CurrentUserPayload {
  return {
    email: `${partial.userId}@dutamedia.com`,
    function: partial.function ?? 'Engineering',
    directManagerId: null,
    sessionId: `session-${partial.userId}`,
    mustResetPassword: false,
    ...partial,
  };
}

describe('CorrectionRequestService (EPIC-09)', () => {
  let service: CorrectionRequestService;
  let prismaMock: any;
  let auditMock: any;
  let policyMock: any;
  let scopeFilterMock: any;
  let notificationMock: any;

  beforeEach(() => {
    prismaMock = {
      commitment: {
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      dailyAccountabilityRecord: {
        update: vi.fn(),
      },
      correctionRequest: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
      $queryRaw: vi.fn(),
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue({ id: 'audit-uuid-1' }),
    };

    policyMock = {
      getActivePolicySnapshot: vi.fn().mockResolvedValue({
        [PolicyCategory.MinorMaterialThreshold]: { wordsChangedThreshold: 10 },
        [PolicyCategory.ObjectionWindowDuration]: { durationHours: 24 },
      }),
    };

    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['emp-1', 'sub-1']),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };

    notificationMock = {
      dispatch: vi.fn().mockResolvedValue([]),
    };

    service = new CorrectionRequestService(
      prismaMock,
      auditMock,
      policyMock,
      scopeFilterMock,
      notificationMock,
    );
  });

  describe('createCorrectionRequest (EPIC-09-T1, T2, T3)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
      function: 'Engineering',
    });

    const mockCommitment = {
      id: 'comm-1',
      dailyRecordId: 'rec-1',
      sequenceNo: 1,
      text: 'Selesaikan modul autentikasi',
      referenceLink: 'https://jira/DM-101',
      initialRisk: DailyStatus.GREEN,
      knownBlockerNote: null,
      supportNeeded: null,
      outcome: null,
      outcomeReason: null,
      continuation: null,
      continuationReason: null,
      isMorningLocked: true,
      isEodLocked: false,
      dailyRecord: {
        id: 'rec-1',
        employeeUserId: 'emp-1',
      },
    };

    it('harus melempar NotFoundException jika komitmen target tidak ditemukan', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue(null);

      await expect(
        service.createCorrectionRequest(employeeUser, {
          targetCommitmentId: 'non-existent-id',
          requestedChange: { text: 'Perubahan' },
          reason: 'Typo',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus melempar ForbiddenException jika komitmen bukan milik user yang login (SAD §10.5)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        ...mockCommitment,
        dailyRecord: { id: 'rec-2', employeeUserId: 'other-user' },
      });

      await expect(
        service.createCorrectionRequest(employeeUser, {
          targetCommitmentId: 'comm-1',
          requestedChange: { text: 'Perubahan' },
          reason: 'Koreksi milik orang lain',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus melempar ConflictException jika field Morning belum terkunci (isMorningLocked=false)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        ...mockCommitment,
        isMorningLocked: false,
      });

      await expect(
        service.createCorrectionRequest(employeeUser, {
          targetCommitmentId: 'comm-1',
          requestedChange: { text: 'Perubahan teks' },
          reason: 'Belum cutoff',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('harus melempar ConflictException jika masih ada koreksi berstatus Pending untuk komitmen ini', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue(mockCommitment);
      prismaMock.correctionRequest.findFirst.mockResolvedValue({
        id: 'cr-pending',
        status: CorrectionStatus.Pending,
      });

      await expect(
        service.createCorrectionRequest(employeeUser, {
          targetCommitmentId: 'comm-1',
          requestedChange: { referenceLink: 'https://jira/DM-102' },
          reason: 'Update link',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('harus melempar BusinessRuleViolationException jika hasil gabungan melanggar FR-04 (AMBER tanpa knownBlockerNote)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue(mockCommitment);
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.createCorrectionRequest(employeeUser, {
          targetCommitmentId: 'comm-1',
          requestedChange: { initialRisk: DailyStatus.AMBER },
          reason: 'Risiko meningkat',
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus melempar BusinessRuleViolationException jika hasil gabungan melanggar FR-09 (PartiallyCompleted + Continue tanpa continuationReason)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        ...mockCommitment,
        isEodLocked: true,
      });
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.createCorrectionRequest(employeeUser, {
          targetCommitmentId: 'comm-1',
          requestedChange: {
            outcome: CommitmentOutcome.PartiallyCompleted,
            continuation: Continuation.Continue,
          },
          reason: 'Belum selesai penuh',
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('EPIC-09-T2: Jalur Minor — harus langsung berstatus Applied dalam satu transaksi bersama AuditLog', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue(mockCommitment);
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);

      const updatedCommitment = {
        ...mockCommitment,
        referenceLink: 'https://jira/DM-102',
      };
      prismaMock.commitment.update.mockResolvedValue(updatedCommitment);

      const createdCorrection = {
        id: 'cr-minor-1',
        targetCommitmentId: 'comm-1',
        requestedByUserId: 'emp-1',
        requestedChange: { referenceLink: 'https://jira/DM-102' },
        reason: 'Perbaikan tautan tugas',
        classification: CorrectionClassification.Minor,
        status: CorrectionStatus.Applied,
        appliedAt: new Date(),
        targetCommitment: updatedCommitment,
        requestedBy: { id: 'emp-1', fullName: 'Budi', email: 'budi@dutamedia.com' },
      };
      prismaMock.correctionRequest.create.mockResolvedValue(createdCorrection);

      const result = await service.createCorrectionRequest(employeeUser, {
        targetCommitmentId: 'comm-1',
        requestedChange: { referenceLink: 'https://jira/DM-102' },
        reason: 'Perbaikan tautan tugas',
      });

      expect(result.status).toBe(CorrectionStatus.Applied);
      expect(result.classification).toBe(CorrectionClassification.Minor);
      expect(prismaMock.commitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comm-1' },
          data: expect.objectContaining({ referenceLink: 'https://jira/DM-102' }),
        }),
      );
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CORRECTION_APPLIED',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: 'cr-minor-1',
        }),
        prismaMock,
      );
    });

    it('EPIC-09-T3: Jalur Material — harus berstatus Pending, membuka Objection Window, dan mengirim notifikasi #9', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue(mockCommitment);
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        directManagerId: 'spv-1',
      });

      const createdCorrection = {
        id: 'cr-material-1',
        targetCommitmentId: 'comm-1',
        requestedByUserId: 'emp-1',
        requestedChange: {
          initialRisk: DailyStatus.RED,
          knownBlockerNote: 'Database production down tidak dapat diakses',
        },
        reason: 'Ada insiden server kritis',
        classification: CorrectionClassification.Material,
        status: CorrectionStatus.Pending,
        objectionWindowStart: new Date(),
        objectionWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        targetCommitment: mockCommitment,
        requestedBy: { id: 'emp-1', fullName: 'Budi', email: 'budi@dutamedia.com' },
      };
      prismaMock.correctionRequest.create.mockResolvedValue(createdCorrection);

      const result = await service.createCorrectionRequest(employeeUser, {
        targetCommitmentId: 'comm-1',
        requestedChange: {
          initialRisk: DailyStatus.RED,
          knownBlockerNote: 'Database production down tidak dapat diakses',
        },
        reason: 'Ada insiden server kritis',
      });

      expect(result.status).toBe(CorrectionStatus.Pending);
      expect(result.classification).toBe(CorrectionClassification.Material);
      expect(prismaMock.commitment.update).not.toHaveBeenCalled();
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'CORRECTION_MATERIAL_REQUESTED',
          recipientUserId: 'spv-1',
        }),
      );
    });

    it('EPIC-09-T5: Recompute initialStatus — jika initialRisk berubah pada jalur Minor, initialStatus parent dihitung ulang', async () => {
      policyMock.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.MinorMaterialThreshold]: {
          wordsChangedThreshold: 100,
          riskChangeAlwaysMaterial: false,
        },
        [PolicyCategory.ObjectionWindowDuration]: { durationHours: 24 },
      });

      prismaMock.commitment.findUnique.mockResolvedValue(mockCommitment);
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);
      prismaMock.commitment.findMany.mockResolvedValue([
        { id: 'comm-1', initialRisk: DailyStatus.AMBER },
        { id: 'comm-2', initialRisk: DailyStatus.GREEN },
      ]);
      prismaMock.commitment.update.mockResolvedValue({ ...mockCommitment, initialRisk: DailyStatus.AMBER });
      prismaMock.correctionRequest.create.mockResolvedValue({
        id: 'cr-minor-risk',
        classification: CorrectionClassification.Minor,
        status: CorrectionStatus.Applied,
      });

      await service.createCorrectionRequest(employeeUser, {
        targetCommitmentId: 'comm-1',
        requestedChange: {
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Menunggu kredensial API',
        },
        reason: 'Update risiko dengan blocker',
      });

      expect(prismaMock.dailyAccountabilityRecord.update).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        data: { initialStatus: DailyStatus.AMBER },
      });
    });
  });

  describe('objectCorrection (EPIC-09-T4)', () => {
    const supervisorUser = createMockUser({
      userId: 'spv-1',
      role: Role.Supervisor_TL,
      function: 'Engineering',
    });

    it('harus menolak keberatan jika pengajuan koreksi tidak ditemukan di database', async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      await expect(
        service.objectCorrection(supervisorUser, 'cr-1', {
          objectionReason: 'Tidak setuju',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus menolak keberatan jika status koreksi sudah bukan Pending (ConflictException)', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'cr-1',
          status: CorrectionStatus.Applied,
          requested_by_user_id: 'emp-1',
          objection_window_end: new Date(Date.now() + 100000),
        },
      ]);

      await expect(
        service.objectCorrection(supervisorUser, 'cr-1', {
          objectionReason: 'Sudah terlambat',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('harus menolak keberatan jika objection window telah berakhir (ConflictException)', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'cr-1',
          status: CorrectionStatus.Pending,
          requested_by_user_id: 'emp-1',
          objection_window_end: new Date(Date.now() - 5000), // Sudah expired
        },
      ]);

      await expect(
        service.objectCorrection(supervisorUser, 'cr-1', {
          objectionReason: 'Lewat waktu',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('harus menolak jika pemohon koreksi mencoba mengajukan keberatan pada pengajuannya sendiri (ForbiddenException)', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'cr-1',
          status: CorrectionStatus.Pending,
          requested_by_user_id: 'spv-1', // User sama
          objection_window_end: new Date(Date.now() + 100000),
        },
      ]);

      await expect(
        service.objectCorrection(supervisorUser, 'cr-1', {
          objectionReason: 'Diri sendiri',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus menolak jika reviewer bukan authorized reviewer dalam scope (ForbiddenException)', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'cr-1',
          status: CorrectionStatus.Pending,
          requested_by_user_id: 'emp-outside',
          objection_window_end: new Date(Date.now() + 100000),
        },
      ]);
      scopeFilterMock.isUserInScope.mockResolvedValue(false);

      await expect(
        service.objectCorrection(supervisorUser, 'cr-1', {
          objectionReason: 'Di luar tim',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus berhasil memproses keberatan, mengubah status menjadi Rejected dan mencatat AuditLog', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'cr-1',
          status: CorrectionStatus.Pending,
          requested_by_user_id: 'emp-1',
          objection_window_end: new Date(Date.now() + 100000),
        },
      ]);
      scopeFilterMock.isUserInScope.mockResolvedValue(true);

      const rejectedCr = {
        id: 'cr-1',
        status: CorrectionStatus.Rejected,
        reviewedByUserId: 'spv-1',
        objectionReason: 'Perubahan baseline tidak beralasan',
      };
      prismaMock.correctionRequest.update.mockResolvedValue(rejectedCr);

      const result = await service.objectCorrection(supervisorUser, 'cr-1', {
        objectionReason: 'Perubahan baseline tidak beralasan',
      });

      expect(result.status).toBe(CorrectionStatus.Rejected);
      expect(prismaMock.correctionRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cr-1' },
          data: expect.objectContaining({
            status: CorrectionStatus.Rejected,
            reviewedByUserId: 'spv-1',
            objectionReason: 'Perubahan baseline tidak beralasan',
          }),
        }),
      );
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CORRECTION_REJECTED',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: 'cr-1',
        }),
        prismaMock,
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'CORRECTION_REJECTED',
          recipientUserId: 'emp-1',
        }),
      );
    });
  });

  describe('determineClassification — branch coverage tambahan (EPIC-09-T2/T3)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
      function: 'Engineering',
    });

    const mockCommitmentBase = {
      id: 'comm-2',
      dailyRecordId: 'rec-2',
      text: 'Selesaikan modul auth',
      referenceLink: null,
      initialRisk: DailyStatus.GREEN,
      knownBlockerNote: null,
      supportNeeded: null,
      outcome: null,
      outcomeReason: null,
      continuation: null,
      continuationReason: null,
      isMorningLocked: true,
      isEodLocked: false,
      dailyRecord: { id: 'rec-2', employeeUserId: 'emp-1' },
    };

    it('T1-A: riskChangeAlwaysMaterial=false — perubahan initialRisk TETAP MENJADI Minor (SAD §9.6)', async () => {
      // Policy dikonfigurasi: riskChangeAlwaysMaterial=false → risk change = Minor
      policyMock.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.MinorMaterialThreshold]: {
          wordsChangedThreshold: 10,
          riskChangeAlwaysMaterial: false,
        },
        [PolicyCategory.ObjectionWindowDuration]: { durationHours: 24 },
      });

      prismaMock.commitment.findUnique.mockResolvedValue(mockCommitmentBase);
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);

      const createdCorrection = {
        id: 'cr-risk-minor',
        classification: CorrectionClassification.Minor,
        status: CorrectionStatus.Applied,
        targetCommitment: mockCommitmentBase,
        requestedBy: { id: 'emp-1', fullName: 'Budi', email: 'budi@dutamedia.com' },
      };
      prismaMock.correctionRequest.create.mockResolvedValue(createdCorrection);
      prismaMock.commitment.update.mockResolvedValue({
        ...mockCommitmentBase,
        initialRisk: DailyStatus.AMBER,
      });
      prismaMock.commitment.findMany.mockResolvedValue([
        { id: 'comm-2', initialRisk: DailyStatus.AMBER },
      ]);

      const result = await service.createCorrectionRequest(employeeUser, {
        targetCommitmentId: 'comm-2',
        requestedChange: {
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Menunggu review PR',
        },
        reason: 'Risiko meningkat karena review belum selesai',
      });

      expect(result.classification).toBe(CorrectionClassification.Minor);
      expect(result.status).toBe(CorrectionStatus.Applied);
    });

    it('T1-B: perubahan teks melebihi wordsChangedThreshold — harus diklasifikasikan Material (SAD §9.6)', async () => {
      policyMock.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.MinorMaterialThreshold]: { wordsChangedThreshold: 3 },
        [PolicyCategory.ObjectionWindowDuration]: { durationHours: 24 },
      });

      prismaMock.commitment.findUnique.mockResolvedValue({
        ...mockCommitmentBase,
        text: 'Satu dua tiga',
      });
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        directManagerId: 'spv-1',
      });

      const createdMaterial = {
        id: 'cr-text-material',
        classification: CorrectionClassification.Material,
        status: CorrectionStatus.Pending,
        objectionWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        targetCommitment: mockCommitmentBase,
        requestedBy: { id: 'emp-1', fullName: 'Budi', email: 'budi@dutamedia.com' },
      };
      prismaMock.correctionRequest.create.mockResolvedValue(createdMaterial);

      const result = await service.createCorrectionRequest(employeeUser, {
        targetCommitmentId: 'comm-2',
        requestedChange: { text: 'Satu dua tiga empat lima enam tujuh delapan' },
        reason: 'Perbaikan deskripsi lengkap',
      });

      expect(result.classification).toBe(CorrectionClassification.Material);
      expect(result.status).toBe(CorrectionStatus.Pending);
    });

    it('T1-C: perubahan teks di BAWAH wordsChangedThreshold — diklasifikasikan Minor (SAD §9.6)', async () => {
      policyMock.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.MinorMaterialThreshold]: { wordsChangedThreshold: 10 },
        [PolicyCategory.ObjectionWindowDuration]: { durationHours: 24 },
      });

      prismaMock.commitment.findUnique.mockResolvedValue({
        ...mockCommitmentBase,
        text: 'Selesaikan modul autentikasi hari ini',
      });
      prismaMock.correctionRequest.findFirst.mockResolvedValue(null);

      const createdMinor = {
        id: 'cr-text-minor',
        classification: CorrectionClassification.Minor,
        status: CorrectionStatus.Applied,
        targetCommitment: mockCommitmentBase,
        requestedBy: { id: 'emp-1', fullName: 'Budi', email: 'budi@dutamedia.com' },
      };
      prismaMock.correctionRequest.create.mockResolvedValue(createdMinor);
      prismaMock.commitment.update.mockResolvedValue({
        ...mockCommitmentBase,
        text: 'Selesaikan modul autentikasi besok',
      });

      const result = await service.createCorrectionRequest(employeeUser, {
        targetCommitmentId: 'comm-2',
        requestedChange: { text: 'Selesaikan modul autentikasi besok' },
        reason: 'Koreksi jadwal ringan',
      });

      expect(result.classification).toBe(CorrectionClassification.Minor);
    });
  });

  describe('evaluateExpiredObjectionWindows (EPIC-09-T6)', () => {
    it('harus memproses auto-apply pada koreksi yang objection window-nya sudah lewat', async () => {
      prismaMock.correctionRequest.findMany.mockResolvedValue([{ id: 'cr-expired-1' }]);
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'cr-expired-1',
          status: CorrectionStatus.Pending,
          target_commitment_id: 'comm-1',
          requested_change: { text: 'Teks diperbarui' },
          requested_by_user_id: 'emp-1',
        },
      ]);
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        text: 'Teks lama',
        dailyRecordId: 'rec-1',
      });
      prismaMock.commitment.update.mockResolvedValue({
        id: 'comm-1',
        text: 'Teks diperbarui',
      });

      const result = await service.evaluateExpiredObjectionWindows();

      expect(result.processedCount).toBe(1);
      expect(prismaMock.commitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comm-1' },
          data: expect.objectContaining({ text: 'Teks diperbarui' }),
        }),
      );
      expect(prismaMock.correctionRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cr-expired-1' },
          data: expect.objectContaining({ status: CorrectionStatus.Applied }),
        }),
      );
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CORRECTION_AUTO_APPLIED',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: 'cr-expired-1',
        }),
        prismaMock,
      );
    });

    it('harus mengembalikan processedCount=0 jika tidak ada koreksi yang expired', async () => {
      prismaMock.correctionRequest.findMany.mockResolvedValue([]);

      const result = await service.evaluateExpiredObjectionWindows();
      expect(result.processedCount).toBe(0);
    });
  });

  describe('findAll & findById (EPIC-09-T1/T2/T3)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
      function: 'Engineering',
    });

    const adminUser = createMockUser({
      userId: 'admin-1',
      role: Role.SystemAdmin,
      function: 'IT',
    });

    it('harus menolak SystemAdmin dari mengakses daftar koreksi operasional (ForbiddenException)', async () => {
      await expect(
        service.findAll(adminUser, { page: 1, limit: 10 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Employee hanya dapat melihat pengajuan koreksi miliknya sendiri', async () => {
      prismaMock.correctionRequest.count.mockResolvedValue(1);
      prismaMock.correctionRequest.findMany.mockResolvedValue([
        {
          id: 'cr-1',
          requestedByUserId: 'emp-1',
          status: CorrectionStatus.Pending,
          objectionWindowEnd: new Date(Date.now() + 100000),
        },
      ]);

      const result = await service.findAll(employeeUser, { page: 1, limit: 10 });

      expect(prismaMock.correctionRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ requestedByUserId: 'emp-1' }),
        }),
      );
      expect(result.data).toHaveLength(1);
      // Pemohon tidak melihat aksi 'object' untuk dirinya sendiri
      expect(result.data[0].availableActions).toEqual([]);
    });

    it('findById harus mengembalikan detail beserta availableActions=[object] untuk reviewer berwenang', async () => {
      const supervisorUser = createMockUser({
        userId: 'spv-1',
        role: Role.Supervisor_TL,
        function: 'Engineering',
      });

      prismaMock.correctionRequest.findUnique.mockResolvedValue({
        id: 'cr-1',
        requestedByUserId: 'emp-1',
        status: CorrectionStatus.Pending,
        objectionWindowEnd: new Date(Date.now() + 100000),
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(true);

      const result = await service.findById(supervisorUser, 'cr-1');

      expect(result.id).toBe('cr-1');
      expect(result.availableActions).toEqual(['object']);
    });
  });
});
