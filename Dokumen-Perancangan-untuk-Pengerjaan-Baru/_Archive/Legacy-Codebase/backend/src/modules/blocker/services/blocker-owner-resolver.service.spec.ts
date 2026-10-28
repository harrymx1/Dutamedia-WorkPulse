import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OwnerNeededType, Role } from '@prisma/client';
import { BlockerOwnerResolverService } from './blocker-owner-resolver.service.js';
import { BusinessRuleViolationException } from '../../shared/exceptions/api.exception.js';

describe('BlockerOwnerResolverService (SAD §5.5, §8.9, FR-19 & SAD §23.2.A4)', () => {
  let service: BlockerOwnerResolverService;
  let prismaMock: {
    projectAuthorityMapping: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    organizationalAssignment: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const reporterId = 'reporter-user-1';
  const ownerId = 'current-owner-user-1';
  const asOfDate = new Date('2026-10-02T10:00:00.000Z');

  beforeEach(() => {
    prismaMock = {
      projectAuthorityMapping: {
        findFirst: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
    };

    service = new BlockerOwnerResolverService(prismaMock as any);
  });

  describe('resolveOwnerNeeded (SAD §8.9, FR-19)', () => {
    // -------------------------------------------------------------------------
    // PATH 1: ProjectAuthority + missing relatedScopeReference
    // -------------------------------------------------------------------------
    describe('Path 1: ProjectAuthority dengan missing atau empty relatedScopeReference', () => {
      it('1.1 harus melempar BusinessRuleViolationException jika relatedScopeReference null atau undefined', async () => {
        await expect(
          service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.ProjectAuthority,
            null,
            asOfDate,
          ),
        ).rejects.toThrow(BusinessRuleViolationException);

        await expect(
          service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.ProjectAuthority,
            undefined,
            asOfDate,
          ),
        ).rejects.toThrow(
          'relatedScopeReference wajib diisi jika ownerNeededType adalah ProjectAuthority (FR-19)',
        );
      });

      it('1.2 harus melempar exception dengan reason REQUIRED_WHEN_PROJECT_AUTHORITY jika relatedScopeReference hanya whitespace', async () => {
        try {
          await service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.ProjectAuthority,
            '   ',
            asOfDate,
          );
          expect.unreachable('Harus melempar BusinessRuleViolationException');
        } catch (err: any) {
          expect(err).toBeInstanceOf(BusinessRuleViolationException);
          expect(err.details).toEqual([
            {
              field: 'relatedScopeReference',
              reason: 'REQUIRED_WHEN_PROJECT_AUTHORITY',
            },
          ]);
        }
      });
    });

    // -------------------------------------------------------------------------
    // PATH 2: ProjectAuthority + mapping ditemukan
    // -------------------------------------------------------------------------
    describe('Path 2: ProjectAuthority dengan mapping ditemukan', () => {
      it('2.1 harus meresolusi owner ke userId dari ProjectAuthorityMapping yang aktif', async () => {
        const scopeRef = 'Billing-Core-Module';
        const projectAuthorityUserId = 'pa-lead-user-uuid';

        prismaMock.projectAuthorityMapping.findFirst.mockResolvedValue({
          id: 'pam-1',
          scopeReference: scopeRef,
          userId: projectAuthorityUserId,
          effectiveDate: new Date('2026-01-01'),
          endDate: null,
        });

        const result = await service.resolveOwnerNeeded(
          reporterId,
          OwnerNeededType.ProjectAuthority,
          `  ${scopeRef}  `, // test trimming
          asOfDate,
        );

        expect(result).toEqual({
          ownerNeededUserId: projectAuthorityUserId,
          ownerNeededType: OwnerNeededType.ProjectAuthority,
          relatedScopeReference: scopeRef,
        });

        expect(prismaMock.projectAuthorityMapping.findFirst).toHaveBeenCalledWith({
          where: {
            scopeReference: scopeRef,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
        });
        // Tidak memanggil organizationalAssignment karena mapping sudah ditemukan
        expect(prismaMock.organizationalAssignment.findFirst).not.toHaveBeenCalled();
      });
    });

    // -------------------------------------------------------------------------
    // PATH 3: ProjectAuthority + mapping tidak ditemukan -> fallback ke Direct Manager reporter
    // -------------------------------------------------------------------------
    describe('Path 3: ProjectAuthority fallback ke Organizational Authority reporter saat mapping tidak ditemukan', () => {
      it('3.1 harus fallback ke direct manager reporter dan mempertahankan ownerNeededType ProjectAuthority', async () => {
        const scopeRef = 'Unmapped-Legacy-Tool';
        const directManagerId = 'reporter-manager-uuid';

        prismaMock.projectAuthorityMapping.findFirst.mockResolvedValue(null);
        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'org-assign-rep',
          userId: reporterId,
          directManagerId,
          effectiveDate: new Date('2026-01-01'),
          endDate: null,
        });

        const result = await service.resolveOwnerNeeded(
          reporterId,
          OwnerNeededType.ProjectAuthority,
          scopeRef,
          asOfDate,
        );

        expect(result).toEqual({
          ownerNeededUserId: directManagerId,
          ownerNeededType: OwnerNeededType.ProjectAuthority, // Tetap catat tipe aslinya walau fallback
          relatedScopeReference: scopeRef,
        });

        expect(prismaMock.organizationalAssignment.findFirst).toHaveBeenCalledWith({
          where: {
            userId: reporterId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });
      });
    });

    // -------------------------------------------------------------------------
    // PATH 4: ProjectAuthority + mapping tidak ditemukan + reporter tanpa manager
    // -------------------------------------------------------------------------
    describe('Path 4: ProjectAuthority fallback gagal karena reporter tidak memiliki Direct Manager', () => {
      it('4.1 harus melempar exception NO_DIRECT_MANAGER_FOUND jika org assignment reporter null', async () => {
        prismaMock.projectAuthorityMapping.findFirst.mockResolvedValue(null);
        prismaMock.organizationalAssignment.findFirst.mockResolvedValue(null);

        try {
          await service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.ProjectAuthority,
            'Scope-X',
            asOfDate,
          );
          expect.unreachable('Harus melempar exception');
        } catch (err: any) {
          expect(err).toBeInstanceOf(BusinessRuleViolationException);
          expect(err.message).toBe(
            'Tidak dapat menemukan Direct Manager (Organizational Authority) aktif untuk penugasan blocker ini',
          );
          expect(err.details).toEqual([
            { field: 'ownerNeededUserId', reason: 'NO_DIRECT_MANAGER_FOUND' },
          ]);
        }
      });

      it('4.2 harus melempar exception NO_DIRECT_MANAGER_FOUND jika org assignment ada tapi directManagerId null', async () => {
        prismaMock.projectAuthorityMapping.findFirst.mockResolvedValue(null);
        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'org-assign-rep',
          userId: reporterId,
          directManagerId: null,
        });

        await expect(
          service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.ProjectAuthority,
            'Scope-X',
            asOfDate,
          ),
        ).rejects.toThrow(BusinessRuleViolationException);
      });
    });

    // -------------------------------------------------------------------------
    // PATH 5: OrganizationalAuthority + direct manager ditemukan
    // -------------------------------------------------------------------------
    describe('Path 5: OrganizationalAuthority dengan Direct Manager ditemukan', () => {
      it('5.1 harus meresolusi owner ke directManagerId dari reporter', async () => {
        const directManagerId = 'org-manager-uuid-55';

        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'org-1',
          userId: reporterId,
          directManagerId,
          effectiveDate: new Date('2026-01-01'),
          endDate: null,
        });

        const result = await service.resolveOwnerNeeded(
          reporterId,
          OwnerNeededType.OrganizationalAuthority,
          null,
          asOfDate,
        );

        expect(result).toEqual({
          ownerNeededUserId: directManagerId,
          ownerNeededType: OwnerNeededType.OrganizationalAuthority,
          relatedScopeReference: null,
        });

        // Tidak memanggil projectAuthorityMapping untuk OrganizationalAuthority
        expect(prismaMock.projectAuthorityMapping.findFirst).not.toHaveBeenCalled();
        expect(prismaMock.organizationalAssignment.findFirst).toHaveBeenCalledWith({
          where: {
            userId: reporterId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });
      });

      it('5.2 harus menggunakan asOfDate default (new Date()) jika tidak disediakan', async () => {
        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'org-default-date',
          userId: reporterId,
          directManagerId: 'mgr-default',
        });

        const result = await service.resolveOwnerNeeded(
          reporterId,
          OwnerNeededType.OrganizationalAuthority,
        );

        expect(result.ownerNeededUserId).toBe('mgr-default');
        expect(prismaMock.organizationalAssignment.findFirst).toHaveBeenCalled();
      });
    });

    // -------------------------------------------------------------------------
    // PATH 6: OrganizationalAuthority + direct manager tidak ditemukan
    // -------------------------------------------------------------------------
    describe('Path 6: OrganizationalAuthority tanpa Direct Manager aktif', () => {
      it('6.1 harus melempar exception NO_DIRECT_MANAGER_FOUND jika assignment tidak ditemukan', async () => {
        prismaMock.organizationalAssignment.findFirst.mockResolvedValue(null);

        try {
          await service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.OrganizationalAuthority,
            null,
            asOfDate,
          );
          expect.unreachable('Harus melempar exception');
        } catch (err: any) {
          expect(err).toBeInstanceOf(BusinessRuleViolationException);
          expect(err.details).toEqual([
            { field: 'ownerNeededUserId', reason: 'NO_DIRECT_MANAGER_FOUND' },
          ]);
        }
      });

      it('6.2 harus melempar exception NO_DIRECT_MANAGER_FOUND jika directManagerId null (mis. CEO)', async () => {
        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'org-ceo',
          userId: reporterId,
          directManagerId: null,
        });

        await expect(
          service.resolveOwnerNeeded(
            reporterId,
            OwnerNeededType.OrganizationalAuthority,
            null,
            asOfDate,
          ),
        ).rejects.toThrow(BusinessRuleViolationException);
      });
    });
  });

  describe('resolveNextEscalationLevel (Open Item A4, SAD §23.2.A4)', () => {
    // -------------------------------------------------------------------------
    // PATH 7: OrganizationalAuthority + owner memiliki manager -> NextLevelManager
    // -------------------------------------------------------------------------
    describe('Path 7: OrganizationalAuthority eskalasi ke atasan dari current owner', () => {
      it('7.1 harus mengeskalasi ke directManagerId dari ownerNeededUserId dengan level NextLevelManager', async () => {
        const ownerManagerId = 'manager-above-owner-uuid';

        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'assign-owner',
          userId: ownerId,
          directManagerId: ownerManagerId,
          effectiveDate: new Date('2026-01-01'),
          endDate: null,
        });

        const blocker = {
          ownerNeededType: OwnerNeededType.OrganizationalAuthority,
          ownerNeededUserId: ownerId,
          raisedByUserId: reporterId,
        };

        const result = await service.resolveNextEscalationLevel(blocker, asOfDate);

        expect(result).toEqual({
          targetUserId: ownerManagerId,
          escalationLevel: 'NextLevelManager',
        });

        expect(prismaMock.organizationalAssignment.findFirst).toHaveBeenCalledWith({
          where: {
            userId: ownerId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });
      });
    });

    // -------------------------------------------------------------------------
    // PATH 8: ProjectAuthority + reporter memiliki manager -> ReporterManager
    // -------------------------------------------------------------------------
    describe('Path 8: ProjectAuthority eskalasi ke direct manager dari pelapor', () => {
      it('8.1 harus mengeskalasi ke directManagerId dari raisedByUserId dengan level ReporterManager', async () => {
        const reporterManagerId = 'reporter-manager-uuid-88';

        prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
          id: 'assign-rep',
          userId: reporterId,
          directManagerId: reporterManagerId,
          effectiveDate: new Date('2026-01-01'),
          endDate: null,
        });

        const blocker = {
          ownerNeededType: OwnerNeededType.ProjectAuthority,
          ownerNeededUserId: ownerId,
          raisedByUserId: reporterId,
        };

        const result = await service.resolveNextEscalationLevel(blocker, asOfDate);

        expect(result).toEqual({
          targetUserId: reporterManagerId,
          escalationLevel: 'ReporterManager',
        });

        expect(prismaMock.organizationalAssignment.findFirst).toHaveBeenCalledWith({
          where: {
            userId: reporterId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });
      });
    });

    // -------------------------------------------------------------------------
    // PATH 9: Tidak ada manager -> fallback ke active HRGA / CEO_Management
    // -------------------------------------------------------------------------
    describe('Path 9: Fallback eskalasi ke HRGA / CEO_Management saat direct manager tidak tersedia', () => {
      it('9.1 OrganizationalAuthority tanpa manager atasan harus eskalasi ke HRGA_Management', async () => {
        const hrgaUserId = 'hrga-executive-uuid';

        // Query 1: Owner tidak punya manager
        prismaMock.organizationalAssignment.findFirst
          .mockResolvedValueOnce({
            id: 'assign-owner-no-mgr',
            userId: ownerId,
            directManagerId: null,
          })
          // Query 2: Fallback ke HRGA / CEO_Management
          .mockResolvedValueOnce({
            id: 'assign-hrga',
            userId: hrgaUserId,
            role: Role.HRGA,
          });

        const blocker = {
          ownerNeededType: OwnerNeededType.OrganizationalAuthority,
          ownerNeededUserId: ownerId,
          raisedByUserId: reporterId,
        };

        const result = await service.resolveNextEscalationLevel(blocker, asOfDate);

        expect(result).toEqual({
          targetUserId: hrgaUserId,
          escalationLevel: 'HRGA_Management',
        });

        expect(prismaMock.organizationalAssignment.findFirst).toHaveBeenNthCalledWith(
          2,
          {
            where: {
              role: { in: [Role.HRGA, Role.CEO_Management] },
              effectiveDate: { lte: asOfDate },
              OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
            },
          },
        );
      });

      it('9.2 ProjectAuthority tanpa manager reporter harus eskalasi ke HRGA_Management', async () => {
        const ceoUserId = 'ceo-management-uuid';

        // Query 1: Reporter tidak punya manager
        prismaMock.organizationalAssignment.findFirst
          .mockResolvedValueOnce(null)
          // Query 2: Fallback ke CEO_Management
          .mockResolvedValueOnce({
            id: 'assign-ceo',
            userId: ceoUserId,
            role: Role.CEO_Management,
          });

        const blocker = {
          ownerNeededType: OwnerNeededType.ProjectAuthority,
          ownerNeededUserId: ownerId,
          raisedByUserId: reporterId,
        };

        const result = await service.resolveNextEscalationLevel(blocker, asOfDate);

        expect(result).toEqual({
          targetUserId: ceoUserId,
          escalationLevel: 'HRGA_Management',
        });
      });
    });

    // -------------------------------------------------------------------------
    // PATH 10: Tidak ada management assignment -> CurrentOwner_Unchanged
    // -------------------------------------------------------------------------
    describe('Path 10: Terminal fallback saat seluruh rantai eskalasi dan management tidak tersedia', () => {
      it('10.1 harus mengembalikan current owner dengan level CurrentOwner_Unchanged', async () => {
        // Query 1: Owner tidak punya manager
        prismaMock.organizationalAssignment.findFirst
          .mockResolvedValueOnce(null)
          // Query 2: HRGA / CEO_Management juga tidak ditemukan
          .mockResolvedValueOnce(null);

        const blocker = {
          ownerNeededType: OwnerNeededType.OrganizationalAuthority,
          ownerNeededUserId: ownerId,
          raisedByUserId: reporterId,
        };

        const result = await service.resolveNextEscalationLevel(blocker, asOfDate);

        expect(result).toEqual({
          targetUserId: ownerId,
          escalationLevel: 'CurrentOwner_Unchanged',
        });
      });

      it('10.2 harus menggunakan asOfDate default (new Date()) jika parameter tidak disediakan', async () => {
        prismaMock.organizationalAssignment.findFirst
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null);

        const blocker = {
          ownerNeededType: OwnerNeededType.OrganizationalAuthority,
          ownerNeededUserId: ownerId,
          raisedByUserId: reporterId,
        };

        const result = await service.resolveNextEscalationLevel(blocker);

        expect(result.targetUserId).toBe(ownerId);
        expect(result.escalationLevel).toBe('CurrentOwner_Unchanged');
      });
    });
  });
});
