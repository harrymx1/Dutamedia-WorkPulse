import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ForbiddenException } from '../../shared/exceptions/api.exception.js';

export interface AuthorityResolutionResult {
  authorized: boolean;
  authorityType: 'ProjectAuthority' | 'OrganizationalAuthority' | null;
  reason?: string;
}

@Injectable()
export class ProjectAuthorityService {
  private readonly logger = new Logger(ProjectAuthorityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolusi wewenang kontekstual sesuai alur SAD §8.9:
   * 1. Cek Project Authority Mapping berdasarkan scopeReference.
   * 2. Fallback cek Organizational Authority berdasarkan directManagerId.
   * 3. Jika keduanya tidak cocok, return authorized = false.
   */
  async resolveAuthority(
    actorUserId: string,
    targetEmployeeUserId: string,
    scopeReference?: string | null,
    asOfDate: Date = new Date(),
  ): Promise<AuthorityResolutionResult> {
    // 1. Cek wewenang Project Authority jika ada scopeReference
    if (scopeReference && scopeReference.trim().length > 0) {
      const projectMapping = await this.prisma.projectAuthorityMapping.findFirst({
        where: {
          userId: actorUserId,
          scopeReference: scopeReference.trim(),
          effectiveDate: { lte: asOfDate },
          OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
        },
      });

      if (projectMapping) {
        this.logger.debug(
          `Wewenang terkonfirmasi sebagai Project Authority untuk user ${actorUserId} pada scope '${scopeReference}'`,
        );
        return {
          authorized: true,
          authorityType: 'ProjectAuthority',
        };
      }
    }

    // 2. Fallback: Cek Organizational Authority (directManagerId pada assignment target)
    if (targetEmployeeUserId) {
      const orgAssignment =
        await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: targetEmployeeUserId,
            directManagerId: actorUserId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
        });

      if (orgAssignment) {
        this.logger.debug(
          `Wewenang terkonfirmasi sebagai Organizational Authority untuk manager ${actorUserId} terhadap target ${targetEmployeeUserId}`,
        );
        return {
          authorized: true,
          authorityType: 'OrganizationalAuthority',
        };
      }
    }

    // 3. Keduanya gagal
    this.logger.warn(
      `Resolusi wewenang gagal: user ${actorUserId} bukan Project Authority maupun Organizational Authority untuk target ${targetEmployeeUserId}`,
    );

    return {
      authorized: false,
      authorityType: null,
      reason:
        'Pengguna tidak memiliki wewenang Project Authority maupun Organizational Authority untuk tindakan ini',
    };
  }

  /**
   * Helper assertion: melempar ForbiddenException jika tidak berwenang (SAD §8.9 langkah 3).
   */
  async assertAuthority(
    actorUserId: string,
    targetEmployeeUserId: string,
    scopeReference?: string | null,
    asOfDate: Date = new Date(),
  ): Promise<AuthorityResolutionResult> {
    const result = await this.resolveAuthority(
      actorUserId,
      targetEmployeeUserId,
      scopeReference,
      asOfDate,
    );

    if (!result.authorized) {
      throw new ForbiddenException(result.reason);
    }

    return result;
  }
}
