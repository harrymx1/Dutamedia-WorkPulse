import { Injectable, Logger } from '@nestjs/common';
import { OwnerNeededType, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BusinessRuleViolationException } from '../../shared/exceptions/api.exception.js';

export interface BlockerOwnerResolutionResult {
  ownerNeededUserId: string;
  ownerNeededType: OwnerNeededType;
  relatedScopeReference?: string | null;
}

export interface EscalationTargetResult {
  targetUserId: string;
  escalationLevel: string;
}

@Injectable()
export class BlockerOwnerResolverService {
  private readonly logger = new Logger(BlockerOwnerResolverService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolusi kontekstual Owner Needed saat pembuatan Blocker (SAD §5.5, §8.9, FR-19).
   */
  async resolveOwnerNeeded(
    raisedByUserId: string,
    ownerNeededType: OwnerNeededType,
    relatedScopeReference?: string | null,
    asOfDate: Date = new Date(),
  ): Promise<BlockerOwnerResolutionResult> {
    // 1. Jalur Project Authority (SAD §8.9)
    if (ownerNeededType === OwnerNeededType.ProjectAuthority) {
      if (!relatedScopeReference || relatedScopeReference.trim().length === 0) {
        throw new BusinessRuleViolationException(
          'relatedScopeReference wajib diisi jika ownerNeededType adalah ProjectAuthority (FR-19)',
          [{ field: 'relatedScopeReference', reason: 'REQUIRED_WHEN_PROJECT_AUTHORITY' }],
        );
      }

      const cleanScope = relatedScopeReference.trim();
      const mapping = await this.prisma.projectAuthorityMapping.findFirst({
        where: {
          scopeReference: cleanScope,
          effectiveDate: { lte: asOfDate },
          OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
        },
      });

      if (mapping) {
        this.logger.debug(
          `Project Authority teresolusi untuk scope '${cleanScope}': user ${mapping.userId}`,
        );
        return {
          ownerNeededUserId: mapping.userId,
          ownerNeededType: OwnerNeededType.ProjectAuthority,
          relatedScopeReference: cleanScope,
        };
      }

      // Fallback ke Organizational Authority (SAD §8.9 langkah 3)
      this.logger.warn(
        `Project Authority tidak ditemukan untuk '${cleanScope}'. Melakukan fallback ke Organizational Authority`,
      );
    }

    // 2. Jalur Organizational Authority (directManagerId pelapor)
    const orgAssignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId: raisedByUserId,
        effectiveDate: { lte: asOfDate },
        OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!orgAssignment || !orgAssignment.directManagerId) {
      throw new BusinessRuleViolationException(
        'Tidak dapat menemukan Direct Manager (Organizational Authority) aktif untuk penugasan blocker ini',
        [{ field: 'ownerNeededUserId', reason: 'NO_DIRECT_MANAGER_FOUND' }],
      );
    }

    return {
      ownerNeededUserId: orgAssignment.directManagerId,
      ownerNeededType:
        ownerNeededType === OwnerNeededType.ProjectAuthority
          ? OwnerNeededType.ProjectAuthority // Tetap catat tipe aslinya walau fallback
          : OwnerNeededType.OrganizationalAuthority,
      relatedScopeReference: relatedScopeReference ?? null,
    };
  }

  /**
   * Resolusi target eskalasi level berikutnya untuk auto-eskalasi (Open Item A4, SAD §23.2.A4).
   */
  async resolveNextEscalationLevel(
    blocker: {
      ownerNeededType: OwnerNeededType;
      ownerNeededUserId: string;
      raisedByUserId: string;
    },
    asOfDate: Date = new Date(),
  ): Promise<EscalationTargetResult> {
    // 1. Jika OrganizationalAuthority: eskalasi ke atasan dari current owner
    if (blocker.ownerNeededType === OwnerNeededType.OrganizationalAuthority) {
      const ownerAssignment =
        await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: blocker.ownerNeededUserId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });

      if (ownerAssignment && ownerAssignment.directManagerId) {
        return {
          targetUserId: ownerAssignment.directManagerId,
          escalationLevel: 'NextLevelManager',
        };
      }
    }

    // 2. Jika ProjectAuthority: eskalasi ke direct manager dari pelapor (raisedByUserId)
    if (blocker.ownerNeededType === OwnerNeededType.ProjectAuthority) {
      const reporterAssignment =
        await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: blocker.raisedByUserId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });

      if (reporterAssignment && reporterAssignment.directManagerId) {
        return {
          targetUserId: reporterAssignment.directManagerId,
          escalationLevel: 'ReporterManager',
        };
      }
    }

    // 3. Fallback: eskalasi ke HRGA / CEO_Management
    const managementAssignment =
      await this.prisma.organizationalAssignment.findFirst({
        where: {
          role: { in: [Role.HRGA, Role.CEO_Management] },
          effectiveDate: { lte: asOfDate },
          OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
        },
      });

    if (managementAssignment) {
      return {
        targetUserId: managementAssignment.userId,
        escalationLevel: 'HRGA_Management',
      };
    }

    // Default ke current owner jika tidak ada jalur eskalasi lebih tinggi
    return {
      targetUserId: blocker.ownerNeededUserId,
      escalationLevel: 'CurrentOwner_Unchanged',
    };
  }
}
