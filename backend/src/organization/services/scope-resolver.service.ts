import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationService } from './organization.service';
import { TemporaryReviewerService } from './temporary-reviewer.service';
import { ProjectAuthorityService } from './project-authority.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { CanonicalRole } from '@prisma/client';

@Injectable()
export class ScopeResolverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrganizationService,
    private readonly tempReviewerService: TemporaryReviewerService,
    private readonly projectAuthService: ProjectAuthorityService,
  ) {}

  /**
   * Menentukan apakah seorang pengguna (caller) berwenang mengakses atau meninjau data pengguna lain (target).
   * Menerapkan evaluasi 3 lapis otorisasi (RBAC + Scope + Temporal Validity) per SAD IV.4.
   */
  async canAccessUser(
    callerId: string,
    targetUserId: string,
    targetDate = new Date(),
  ): Promise<boolean> {
    // 1. Akses diri sendiri selalu diizinkan
    if (callerId === targetUserId) {
      return true;
    }

    const callerAssignment = await this.orgService.getUserActiveAssignment(
      callerId,
      targetDate,
    );

    const callerRole: string = callerAssignment?.role || CanonicalRole.EMPLOYEE;

    // 2. Peran dengan Scope Organisasi Universal
    if (
      callerRole === CanonicalRole.SYSTEM_ADMIN ||
      callerRole === CanonicalRole.CEO_MANAGEMENT ||
      callerRole === CanonicalRole.HRGA
    ) {
      return true;
    }

    const targetAssignment = await this.orgService.getUserActiveAssignment(
      targetUserId,
      targetDate,
    );

    // Jika target tidak memiliki penugasan aktif, non-admin tidak dapat mengakses
    if (!targetAssignment) {
      return false;
    }

    // 3. Evaluasi Wewenang Kepala Divisi (HEAD Scope)
    if (callerRole === CanonicalRole.HEAD) {
      if (callerAssignment && callerAssignment.function === targetAssignment.function) {
        return true;
      }
    }

    // 4. Evaluasi Wewenang Penyelia (SUPERVISOR Scope - Hierarchical Subordinates)
    if (callerRole === CanonicalRole.SUPERVISOR || callerRole === CanonicalRole.HEAD) {
      const isSubordinate = await this.isHierarchicalSubordinate(
        callerId,
        targetUserId,
        targetDate,
      );
      if (isSubordinate) {
        return true;
      }
    }

    // 5. Evaluasi Wewenang Peninjau Sementara (Temporal Reviewer Scope)
    const activeDelegations = await this.tempReviewerService.getActiveDelegationsForUser(
      callerId,
      targetDate,
    );

    for (const delegation of activeDelegations) {
      if (delegation.targetFunction === targetAssignment.function) {
        return true;
      }
    }

    return false;
  }

  /**
   * Menegakkan batasan scope: melempar galat AUTH_FORBIDDEN_SCOPE jika akses ditolak
   */
  async enforceUserScope(
    callerId: string,
    targetUserId: string,
    targetDate = new Date(),
  ): Promise<void> {
    const isAllowed = await this.canAccessUser(callerId, targetUserId, targetDate);
    if (!isAllowed) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message:
          'Anda tidak memiliki kewenangan untuk mengakses atau meninjau rekaman di luar fungsi/squad Anda.',
        statusCode: HttpStatus.FORBIDDEN,
        details: [
          {
            field: 'scope',
            issue: `Caller ${callerId} is outside supervision scope of target user ${targetUserId}`,
          },
        ],
      });
    }
  }

  /**
   * Menentukan wewenang akses terhadap konteks proyek
   */
  async canAccessProject(
    callerId: string,
    projectCode: string,
    targetDate = new Date(),
  ): Promise<boolean> {
    const callerAssignment = await this.orgService.getUserActiveAssignment(
      callerId,
      targetDate,
    );

    const callerRole: string = callerAssignment?.role || CanonicalRole.EMPLOYEE;

    if (
      callerRole === CanonicalRole.SYSTEM_ADMIN ||
      callerRole === CanonicalRole.CEO_MANAGEMENT ||
      callerRole === CanonicalRole.HRGA
    ) {
      return true;
    }

    const mapping = await this.projectAuthService.getAuthorityForProject(
      projectCode,
      targetDate,
    );

    if (
      mapping &&
      (mapping.projectManagerId === callerId ||
        mapping.escalationReviewerId === callerId)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Memeriksa apakah targetUserId adalah bawahan langsung atau berjenjang dari managerId
   */
  private async isHierarchicalSubordinate(
    managerId: string,
    targetUserId: string,
    targetDate: Date,
    maxDepth = 25,
  ): Promise<boolean> {
    let currentUserId: string | null = targetUserId;
    let depth = 0;
    const visited = new Set<string>();

    while (currentUserId && depth < maxDepth) {
      if (visited.has(currentUserId)) {
        break; // Cegah loop jika data anomali
      }
      visited.add(currentUserId);

      const assignment = await this.orgService.getUserActiveAssignment(
        currentUserId,
        targetDate,
      );

      if (!assignment || !assignment.directManagerId) {
        break;
      }

      if (assignment.directManagerId === managerId) {
        return true;
      }

      currentUserId = assignment.directManagerId;
      depth++;
    }

    return false;
  }
}
