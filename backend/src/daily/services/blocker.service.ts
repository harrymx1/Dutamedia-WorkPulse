import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  AuthorityContext,
  BlockerStatus,
  CanonicalFunction,
  CanonicalRole,
  NotificationChannel,
  PolicyCategory,
} from '@prisma/client';
import { RaiseBlockerDto, ResolveBlockerDto } from '../dto/raise-blocker.dto';
import { BlockerSlaConfig, CANONICAL_POLICY_FALLBACKS } from '../../policy/policy.constants';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

// Kategori kendala yang membutuhkan keahlian divisi tertentu (bukan sekadar atasan langsung)
const BLOCKER_TYPE_DIVISION_ROUTING: Record<string, { function: CanonicalFunction; label: string }> = {
  INFRA: { function: CanonicalFunction.OperationsInfrastructure, label: 'Operations & Infrastructure' },
  FINANCE: { function: CanonicalFunction.Finance, label: 'Finance' },
  LEGAL: { function: CanonicalFunction.HRGA, label: 'HRGA & Legal' },
};

@Injectable()
export class BlockerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Mengajukan kendala baru (Instant Blocker atau via Form, Prototipe 05).
   */
  async raiseBlocker(userId: string, dto: RaiseBlockerDto) {
    if (
      dto.ownerNeededType === AuthorityContext.PROJECT_AUTHORITY &&
      (!dto.projectCodeReference || dto.projectCodeReference.trim().length === 0)
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Kendala dengan konteks Kewenangan Proyek WAJIB menyertakan kode proyek referensi (DEC-002, Prototipe 05).',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Resolusi assignedOwnerId jika tidak ditentukan secara eksplisit
    let targetOwnerId = dto.assignedOwnerId;
    if (!targetOwnerId) {
      const suggestion = await this.resolveSuggestedOwner(userId, {
        type: dto.type,
        ownerNeededType: dto.ownerNeededType,
        projectCode: dto.projectCodeReference,
      });
      targetOwnerId = suggestion.owner?.id;
    }

    if (!targetOwnerId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tidak dapat menentukan penanggung jawab eskalasi secara otomatis. Silakan pilih penanggung jawab khusus.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const assignedOwner = await this.prisma.user.findUnique({
      where: { id: targetOwnerId },
    });

    if (!assignedOwner) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna yang ditunjuk sebagai pemilik eskalasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Target respons SLA ditentukan oleh tingkat keparahan (satu sumber kebijakan)
    const slaMinutesMap = await this.getSlaMinutesMap();
    const slaMinutes = slaMinutesMap[dto.severity as keyof typeof slaMinutesMap];
    const slaLabel = slaMinutes % 60 === 0 ? `${slaMinutes / 60} jam` : `${slaMinutes} menit`;

    const raisedAt = this.clockService.now();
    const targetResolutionAt = new Date(raisedAt.getTime() + slaMinutes * 60 * 1000);
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.blockerTicket.create({
        data: {
          raisedByUserId: userId,
          linkedCommitmentId: dto.linkedCommitmentId || null,
          type: dto.type,
          severity: dto.severity,
          impact: dto.impact,
          description: dto.description.trim(),
          ownerNeededType: dto.ownerNeededType,
          assignedOwnerId: targetOwnerId,
          projectCodeReference: dto.projectCodeReference ? dto.projectCodeReference.trim() : null,
          status: BlockerStatus.OPEN,
          raisedAt,
          targetResolutionAt,
        },
        include: {
          raisedBy: { select: { id: true, fullName: true, email: true } },
          assignedOwner: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Kirim notifikasi in-app ke pemilik yang ditunjuk (Jenjang Pertama)
      await tx.notification.create({
        data: {
          recipientUserId: targetOwnerId,
          triggerType: 'BLOCKER_RAISED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Kendala Baru Dialokasikan: ${dto.severity} Impact ${dto.impact}`,
          message: `Kendala "${dto.description.slice(0, 100)}" telah dialokasikan kepada Anda dengan target respon ${slaLabel}.`,
          actionUrl: '/blockers',
          relatedEntityType: 'blocker_tickets',
          relatedEntityId: ticket.id,
        },
      });

      // Untuk kendala darurat (CRITICAL), kirim eskalasi paralel seketika ke jenjang pimpinan di atasnya tanpa menunggu batas waktu normal
      if (dto.severity === 'CRITICAL') {
        const nextAuthorityId = await this.resolveNextEscalationAuthority(
          targetOwnerId,
          dto.ownerNeededType,
          dto.projectCodeReference,
        );
        if (nextAuthorityId && nextAuthorityId !== targetOwnerId && nextAuthorityId !== userId) {
          await tx.notification.create({
            data: {
              recipientUserId: nextAuthorityId,
              triggerType: 'BLOCKER_CRITICAL_ESCALATION',
              channel: NotificationChannel.IN_APP_CENTER,
              title: `Eskalasi Darurat (CRITICAL): Kendala Impact ${dto.impact}`,
              message: `Kendala darurat "${dto.description.slice(0, 100)}" dilaporkan (target penyelesaian ${slaLabel}) dan diteruskan secara paralel kepada Anda sebagai pimpinan eskalasi.`,
              actionUrl: '/blockers',
              relatedEntityType: 'blocker_tickets',
              relatedEntityId: ticket.id,
            },
          });
        }
      }

      return ticket;
    });
  }

  private activeDateWhere(today: Date) {
    return {
      effectiveDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    };
  }

  private async isUserActive(userId: string): Promise<boolean> {
    if (!this.prisma.user?.findFirst) {
      return true;
    }
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, status: 'ACTIVE' },
        select: { id: true },
      });
      return Boolean(user);
    } catch {
      return false;
    }
  }

  private async isUserOnApprovedLeave(userId: string, today: Date): Promise<boolean> {
    if (!this.prisma.leaveRequest?.findFirst) {
      return false;
    }
    try {
      const activeLeave = await this.prisma.leaveRequest.findFirst({
        where: {
          userId,
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });
      return Boolean(activeLeave);
    } catch {
      return false;
    }
  }

  private async findActiveTemporaryDelegate(
    targetFunction: CanonicalFunction,
    excludeUserIds: string[],
    today: Date,
  ): Promise<string | null> {
    const repo = this.prisma.temporaryReviewerAssignment;
    if (!repo) {
      return null;
    }

    try {
      const candidates = repo.findMany
        ? await repo.findMany({
            where: {
              targetFunction,
              effectiveDate: { lte: today },
              expiryDate: { gte: today },
              delegateUserId: { notIn: excludeUserIds },
            },
            orderBy: { createdAt: 'desc' },
          })
        : repo.findFirst
          ? [
              await repo.findFirst({
                where: {
                  targetFunction,
                  effectiveDate: { lte: today },
                  expiryDate: { gte: today },
                  delegateUserId: { notIn: excludeUserIds },
                },
                orderBy: { createdAt: 'desc' },
              }),
            ].filter(Boolean)
          : [];

      for (const item of candidates) {
        const delegateId = item?.delegateUserId;
        if (!delegateId || excludeUserIds.includes(delegateId)) continue;
        if (!(await this.isUserActive(delegateId))) continue;
        if (await this.isUserOnApprovedLeave(delegateId, today)) continue;
        return delegateId;
      }
    } catch {
      // Lanjut ke jalur normal
    }
    return null;
  }

  /**
   * Menentukan pejabat eskalasi satu tingkat di atas penanggung jawab saat ini (N+1 -> N+2 -> Direksi),
   * serta otomatis melewati pejabat yang sedang cuti resmi.
   */
  private async resolveNextEscalationAuthority(
    currentOwnerId: string,
    ownerNeededType?: AuthorityContext,
    projectCode?: string | null,
  ): Promise<string | null> {
    const today = toJakartaDateOnly(this.clockService.now());

    try {
      if (
        ownerNeededType === AuthorityContext.PROJECT_AUTHORITY &&
        projectCode?.trim() &&
        this.prisma.projectAuthorityMapping?.findFirst
      ) {
        const mapping = await this.prisma.projectAuthorityMapping.findFirst({
          where: {
            projectCode: projectCode.trim(),
            ...this.activeDateWhere(today),
          },
          orderBy: { createdAt: 'desc' },
        });
        if (mapping?.escalationReviewerId && mapping.escalationReviewerId !== currentOwnerId) {
          const resolved = await this.resolveAvailableManagerChain(
            mapping.escalationReviewerId,
            currentOwnerId,
            mapping.involvedFunction,
            { skipTempDelegation: true, excludeUserIds: [currentOwnerId] },
          );
          if (resolved.userId && resolved.userId !== currentOwnerId) {
            return resolved.userId;
          }
        }
      }

      if (this.prisma.organizationalAssignment?.findFirst) {
        const ownerAssign = await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: currentOwnerId,
            ...this.activeDateWhere(today),
          },
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
        });
        if (ownerAssign?.directManagerId && ownerAssign.directManagerId !== currentOwnerId) {
          const resolved = await this.resolveAvailableManagerChain(
            ownerAssign.directManagerId,
            currentOwnerId,
            ownerAssign.function,
            { skipTempDelegation: true, excludeUserIds: [currentOwnerId] },
          );
          if (resolved.userId && resolved.userId !== currentOwnerId) {
            return resolved.userId;
          }
        }

        // Jika penanggung jawab saat ini bukan CEO, naik ke CEO / Direksi aktif yang tidak sedang cuti
        if (ownerAssign?.role !== CanonicalRole.CEO_MANAGEMENT) {
          const ceoAssign = await this.prisma.organizationalAssignment.findFirst({
            where: {
              role: CanonicalRole.CEO_MANAGEMENT,
              ...this.activeDateWhere(today),
              userId: { not: currentOwnerId },
              user: { status: 'ACTIVE' },
            },
            orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
          });
          if (
            ceoAssign?.userId &&
            ceoAssign.userId !== currentOwnerId &&
            !(await this.isUserOnApprovedLeave(ceoAssign.userId, today))
          ) {
            return ceoAssign.userId;
          }
        }
      }
    } catch {
      // Abaikan jika gagal menelusuri jenjang eskalasi berikutnya
    }
    return null;
  }

  /**
   * Memeriksa apakah kandidat penanggung jawab sedang cuti resmi (APPROVED Leave) atau memiliki
   * Reviewer Sementara aktif hari ini. Jika ada Reviewer Sementara aktif pada divisi terkait, alihkan ke
   * Reviewer Sementara (kecuali pelapor sudah setingkat HEAD/CEO); jika sedang cuti tanpa delegasi, naik
   * otomatis 1 tingkat ke atasan di atasnya (N+1 -> N+2 -> CEO).
   */
  private async resolveAvailableManagerChain(
    initialManagerId: string | null | undefined,
    reporterUserId: string,
    reporterFunction?: CanonicalFunction | null,
    options?: {
      reporterRole?: CanonicalRole | string | null;
      skipTempDelegation?: boolean;
      excludeUserIds?: string[];
    },
  ): Promise<{ userId: string | null; routingNote?: string }> {
    const today = toJakartaDateOnly(this.clockService.now());
    const excludeIds = Array.from(new Set([reporterUserId, ...(options?.excludeUserIds || [])]));

    // 1. Jika ada Reviewer Sementara aktif pada divisi pelapor (dan pelapor bukan HEAD/CEO yang naik ke Direksi), prioritaskan
    const canUseDivisionDelegation =
      !options?.skipTempDelegation &&
      Boolean(initialManagerId) &&
      Boolean(reporterFunction) &&
      options?.reporterRole !== CanonicalRole.HEAD &&
      options?.reporterRole !== CanonicalRole.CEO_MANAGEMENT;

    if (canUseDivisionDelegation && reporterFunction) {
      const activeDelegateId = await this.findActiveTemporaryDelegate(reporterFunction, excludeIds, today);
      if (activeDelegateId) {
        return {
          userId: activeDelegateId,
          routingNote: 'Dialihkan otomatis ke Reviewer Sementara aktif untuk fungsi terkait.',
        };
      }
    }

    // 2. Telusuri rantai atasan (maksimal 4 tingkat hingga CEO) jika kandidat sedang cuti resmi
    let currentCandidateId = initialManagerId || null;
    const visited = new Set<string>();
    let bypassedDueToLeave = false;

    for (let depth = 0; depth < 4 && currentCandidateId; depth++) {
      if (visited.has(currentCandidateId)) break;
      visited.add(currentCandidateId);

      const onLeave = await this.isUserOnApprovedLeave(currentCandidateId, today);

      if (!onLeave && !excludeIds.includes(currentCandidateId)) {
        return {
          userId: currentCandidateId,
          routingNote: bypassedDueToLeave
            ? 'Penanggung jawab utama sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke atasan struktural di atasnya.'
            : undefined,
        };
      }

      if (onLeave) {
        bypassedDueToLeave = true;
      }

      // Jika sedang cuti, cek apakah ada Reviewer Sementara aktif di fungsi terkait
      if (!options?.skipTempDelegation && reporterFunction) {
        const fallbackDelegateId = await this.findActiveTemporaryDelegate(
          reporterFunction,
          [...excludeIds, currentCandidateId],
          today,
        );
        if (fallbackDelegateId) {
          return {
            userId: fallbackDelegateId,
            routingNote:
              'Penanggung jawab utama sedang cuti resmi, sehingga dialihkan otomatis ke Reviewer Sementara aktif.',
          };
        }
      }

      // Naik 1 tingkat ke atasan di atasnya (N+1 -> N+2 -> CEO)
      if (this.prisma.organizationalAssignment?.findFirst) {
        const nextAssign = await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: currentCandidateId,
            ...this.activeDateWhere(today),
          },
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
        });
        currentCandidateId = nextAssign?.directManagerId || null;
      } else {
        break;
      }
    }

    const fallbackId =
      currentCandidateId && !excludeIds.includes(currentCandidateId)
        ? currentCandidateId
        : !bypassedDueToLeave
          ? initialManagerId || null
          : null;

    return {
      userId: fallbackId,
      routingNote:
        bypassedDueToLeave && fallbackId
          ? 'Penanggung jawab utama sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke atasan struktural di atasnya.'
          : undefined,
    };
  }

  /**
   * Peta target respons SLA (menit) per tingkat keparahan dari kebijakan aktif.
   */
  async getSlaMinutesMap(): Promise<Record<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', number>> {
    const fallback = (CANONICAL_POLICY_FALLBACKS[PolicyCategory.BLOCKER_SLA] as BlockerSlaConfig).severityMinutes!;
    try {
      const policy = await this.policyService.getActivePolicy(PolicyCategory.BLOCKER_SLA);
      const configured = (policy?.configurationValues as Partial<BlockerSlaConfig> | undefined)?.severityMinutes;
      return { ...fallback, ...(configured || {}) };
    } catch {
      return fallback;
    }
  }

  /**
   * Menentukan penanggung jawab yang paling tepat ketika pelapor tidak menunjuk siapa pun.
   * - Kewenangan Proyek: Pimpinan Proyek -> Reviewer Sementara / Pengarah Proyek -> rantai atasan hingga CEO (melewati yang cuti).
   * - Kewenangan Struktural: kendala lintas fungsi (INFRA, FINANCE, LEGAL) ke fungsi terkait (dengan cek cuti/delegasi/chain);
   *   selain itu ke Atasan Langsung / Reviewer Sementara / rantai atasan hingga CEO.
   */
  async resolveSuggestedOwner(
    userId: string,
    input: { type?: string; ownerNeededType?: AuthorityContext; projectCode?: string | null },
  ): Promise<{
    owner: { id: string; fullName: string; jobTitle: string | null } | null;
    reason: 'PROJECT_LEAD' | 'DIVISION_HEAD' | 'DIRECT_MANAGER' | 'NONE';
    divisionLabel?: string;
    routingNote?: string;
  }> {
    const today = toJakartaDateOnly(this.clockService.now());

    const pick = async (id?: string | null) => {
      if (!id) return null;
      const u = await this.prisma.user.findFirst({
        where: { id, status: 'ACTIVE' },
        select: {
          id: true,
          fullName: true,
          orgAssignments: {
            where: this.activeDateWhere(today),
            orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
            take: 1,
            select: { jobTitle: true },
          },
        },
      });
      return u ? { id: u.id, fullName: u.fullName, jobTitle: u.orgAssignments?.[0]?.jobTitle || null } : null;
    };

    if (input.ownerNeededType === AuthorityContext.PROJECT_AUTHORITY && input.projectCode?.trim()) {
      const mapping = await this.prisma.projectAuthorityMapping.findFirst({
        where: {
          projectCode: input.projectCode.trim(),
          ...this.activeDateWhere(today),
        },
        orderBy: { createdAt: 'desc' },
      });

      if (mapping) {
        if (mapping.projectManagerId && mapping.projectManagerId !== userId) {
          const pmOnLeave = await this.isUserOnApprovedLeave(mapping.projectManagerId, today);
          if (!pmOnLeave) {
            const pmOwner = await pick(mapping.projectManagerId);
            if (pmOwner) return { owner: pmOwner, reason: 'PROJECT_LEAD' };
          }
        }

        if (mapping.involvedFunction) {
          const tempDelegateId = await this.findActiveTemporaryDelegate(
            mapping.involvedFunction,
            [userId, mapping.projectManagerId].filter(Boolean) as string[],
            today,
          );
          if (tempDelegateId) {
            const delegateOwner = await pick(tempDelegateId);
            if (delegateOwner) {
              return {
                owner: delegateOwner,
                reason: 'PROJECT_LEAD',
                routingNote:
                  'Pimpinan proyek utama sedang cuti/tidak tersedia, sehingga dialihkan otomatis ke Reviewer Sementara aktif.',
              };
            }
          }
        }

        const escChain = await this.resolveAvailableManagerChain(
          mapping.escalationReviewerId,
          userId,
          mapping.involvedFunction,
          { skipTempDelegation: true },
        );
        const escOwner = await pick(escChain.userId);
        if (escOwner) {
          return {
            owner: escOwner,
            reason: 'PROJECT_LEAD',
            routingNote:
              escChain.routingNote ||
              (mapping.projectManagerId
                ? 'Pimpinan proyek utama sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke pengarah proyek (atasan pengesah cuti).'
                : undefined),
          };
        }
      }
    }

    if (input.ownerNeededType !== AuthorityContext.PROJECT_AUTHORITY) {
      const target = BLOCKER_TYPE_DIVISION_ROUTING[input.type || ''];
      if (target) {
        // 1. Prioritaskan Reviewer Sementara resmi jika telah diterbitkan mandat aktif (DEC-014)
        const divisionDelegateId = await this.findActiveTemporaryDelegate(target.function, [userId], today);
        if (divisionDelegateId) {
          const delegateOwner = await pick(divisionDelegateId);
          if (delegateOwner) {
            return {
              owner: delegateOwner,
              reason: 'DIVISION_HEAD',
              divisionLabel: target.label,
              routingNote: `Dialihkan otomatis ke Reviewer Sementara aktif untuk divisi ${target.label}.`,
            };
          }
        }

        // 2. Cari HANYA Pimpinan Utama Divisi (HEAD / HRGA). Dilarang keras menunjuk bawahan (SUPERVISOR / EMPLOYEE)
        //    secara otomatis tanpa mandat Reviewer Sementara (DEC-014).
        const divisionHeads = await this.prisma.organizationalAssignment.findMany({
          where: {
            function: target.function,
            ...this.activeDateWhere(today),
            userId: { not: userId },
            role: { in: [CanonicalRole.HEAD, CanonicalRole.HRGA] },
            user: { status: 'ACTIVE' },
          },
          select: { userId: true, role: true, directManagerId: true },
        });
        const rank = ['HEAD', 'HRGA'];
        divisionHeads.sort((a, b) => {
          const ra = rank.indexOf(a.role);
          const rb = rank.indexOf(b.role);
          return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
        });

        let primaryHeadOnLeaveId: string | null = null;
        for (const headCandidate of divisionHeads) {
          const onLeave = await this.isUserOnApprovedLeave(headCandidate.userId, today);
          if (!onLeave) {
            const owner = await pick(headCandidate.userId);
            if (owner) {
              return {
                owner,
                reason: 'DIVISION_HEAD',
                divisionLabel: target.label,
              };
            }
          } else if (!primaryHeadOnLeaveId) {
            primaryHeadOnLeaveId = headCandidate.userId;
          }
        }

        // 3. Jika Pimpinan Utama Divisi sedang cuti resmi tanpa Reviewer Sementara, tanggung jawab HANYA naik vertikal
        //    ke atasan struktural di atasnya / pengesah cuti (N+1 -> CEO), tidak pernah turun ke bawahan (DEC-014).
        if (primaryHeadOnLeaveId) {
          const chainResult = await this.resolveAvailableManagerChain(
            primaryHeadOnLeaveId,
            userId,
            target.function,
            { skipTempDelegation: true },
          );
          let chainOwner = await pick(chainResult.userId);
          if (!chainOwner && this.prisma.organizationalAssignment?.findFirst) {
            const ceoAssign = await this.prisma.organizationalAssignment.findFirst({
              where: {
                role: CanonicalRole.CEO_MANAGEMENT,
                ...this.activeDateWhere(today),
                userId: { notIn: [userId, primaryHeadOnLeaveId] },
                user: { status: 'ACTIVE' },
              },
              orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
            });
            if (ceoAssign?.userId && !(await this.isUserOnApprovedLeave(ceoAssign.userId, today))) {
              chainOwner = await pick(ceoAssign.userId);
            }
          }
          if (chainOwner) {
            return {
              owner: chainOwner,
              reason: 'DIVISION_HEAD',
              divisionLabel: target.label,
              routingNote: `Pimpinan utama divisi ${target.label} sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke atasan struktural di atasnya.`,
            };
          }
        }
      }
    }

    const orgAssign = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId,
        ...this.activeDateWhere(today),
      },
      orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
    });

    const effective = await this.resolveAvailableManagerChain(
      orgAssign?.directManagerId,
      userId,
      orgAssign?.function,
      { reporterRole: orgAssign?.role },
    );
    const manager = await pick(effective.userId);
    if (manager) {
      return {
        owner: manager,
        reason: 'DIRECT_MANAGER',
        routingNote: effective.routingNote,
      };
    }

    // Fallback vertikal untuk kondisi struktur pipih (tanpa directManagerId) atau ketika atasan di rantai sedang cuti:
    // hanya naik ke HEAD di divisi pelapor sendiri atau CEO_MANAGEMENT (tidak pernah ke HEAD divisi lain atau bawahan) (DEC-014)
    if (this.prisma.organizationalAssignment?.findFirst) {
      const allowedOr: any[] = [{ role: CanonicalRole.CEO_MANAGEMENT }];
      if (orgAssign?.function) {
        allowedOr.push({ role: CanonicalRole.HEAD, function: orgAssign.function });
      }
      const execCandidates = this.prisma.organizationalAssignment.findMany
        ? await this.prisma.organizationalAssignment.findMany({
            where: {
              AND: [
                this.activeDateWhere(today),
                { OR: allowedOr },
              ],
              userId: { not: userId },
              user: { status: 'ACTIVE' },
            },
            orderBy: { createdAt: 'asc' },
          })
        : [
            await this.prisma.organizationalAssignment.findFirst({
              where: {
                role: { in: [CanonicalRole.CEO_MANAGEMENT, CanonicalRole.HEAD] },
                ...this.activeDateWhere(today),
                userId: { not: userId },
                user: { status: 'ACTIVE' },
              },
              orderBy: { createdAt: 'asc' },
            }),
          ].filter(Boolean);

      for (const exec of execCandidates) {
        if (!exec?.userId) continue;
        if (await this.isUserOnApprovedLeave(exec.userId, today)) continue;
        const execOwner = await pick(exec.userId);
        if (execOwner) {
          return {
            owner: execOwner,
            reason: 'DIRECT_MANAGER',
            routingNote: effective.routingNote,
          };
        }
      }
    }

    return { owner: null, reason: 'NONE' };
  }
  /**
   * Memberikan konfirmasi resmi (Acknowledgement) terhadap tiket kendala.
   */
  async acknowledgeBlocker(actorUserId: string, blockerId: string) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    return this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.ACKNOWLEDGED,
        acknowledgedAt: this.clockService.now(),
      },
    });
  }

  /**
   * Menyelesaikan tiket kendala dengan catatan mitigasi/resolusi wajib.
   */
  async resolveBlocker(actorUserId: string, blockerId: string, dto: ResolveBlockerDto) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    return this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.RESOLVED,
        resolvedAt: this.clockService.now(),
        resolutionNote: dto.resolutionNote.trim(),
      },
    });
  }

  /**
   * Memastikan hanya pemilik eskalasi (assignedOwnerId), pelapor (raisedByUserId),
   * pejabat manajerial (SUPERVISOR/HEAD/PROJECT_MANAGER/HRGA/CEO/ADMIN), atau Project Lead aktif
   * yang dapat melakukan Acknowledge / Resolve terhadap tiket kendala.
   */
  private async verifyBlockerActionAuthority(actorUserId: string, ticket: any): Promise<void> {
    if (
      ticket.assignedOwnerId === actorUserId ||
      ticket.raisedByUserId === actorUserId
    ) {
      return;
    }

    if (!this.prisma.organizationalAssignment?.findFirst) {
      return;
    }

    const today = toJakartaDateOnly(this.clockService.now());
    const actorAssignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId: actorUserId,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const managerialRoles: string[] = [
      CanonicalRole.SYSTEM_ADMIN,
      CanonicalRole.CEO_MANAGEMENT,
      CanonicalRole.HRGA,
      CanonicalRole.HEAD,
      CanonicalRole.SUPERVISOR,
      CanonicalRole.PROJECT_MANAGER,
    ];

    if (actorAssignment?.role && managerialRoles.includes(actorAssignment.role)) {
      return;
    }

    if (this.prisma.projectAuthorityMapping?.count) {
      const leadCount = await this.prisma.projectAuthorityMapping.count({
        where: {
          OR: [
            { projectManagerId: actorUserId },
            { escalationReviewerId: actorUserId },
          ],
          effectiveDate: { lte: today },
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: today } }] }],
        },
      });
      if (leadCount > 0) {
        return;
      }
    }

    if (this.prisma.temporaryReviewerAssignment?.count) {
      const tempCount = await this.prisma.temporaryReviewerAssignment.count({
        where: {
          delegateUserId: actorUserId,
          effectiveDate: { lte: today },
          expiryDate: { gte: today },
        },
      });
      if (tempCount > 0) {
        return;
      }
    }

    throw new AppException({
      code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
      message:
        'Anda tidak memiliki wewenang untuk menindaklanjuti atau menyelesaikan tiket kendala ini.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }

  /**
   * Mengambil antrean tiket kendala.
   */
  async getBlockerQueue(filters?: {
    status?: BlockerStatus;
    assignedOwnerId?: string;
    raisedByUserId?: string;
  }) {
    return this.prisma.blockerTicket.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedOwnerId && { assignedOwnerId: filters.assignedOwnerId }),
        ...(filters?.raisedByUserId && { raisedByUserId: filters.raisedByUserId }),
      },
      include: {
        raisedBy: { select: { id: true, fullName: true, email: true } },
        assignedOwner: { select: { id: true, fullName: true, email: true } },
        linkedCommitment: true,
        supportContributions: {
          include: { supporter: { select: { id: true, fullName: true, email: true } } },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { raisedAt: 'desc' },
      ],
    });
  }

  /**
   * Menambahkan kontribusi bantuan (Support Contribution) lintas fungsi (Prototipe 09).
   */
  async addSupportContribution(
    supporterUserId: string,
    blockerId: string,
    actionTaken: string,
    resultNote: string,
  ) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.prisma.supportContribution.create({
      data: {
        blockerId,
        supporterUserId,
        actionTaken: actionTaken.trim(),
        resultNote: resultNote.trim(),
      },
      include: {
        supporter: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Mengambil metrik aging eskalasi kendala (Prototipe 14).
   */
  async getEscalationAgingMetrics() {
    const now = this.clockService.now();
    const openBlockers = await this.prisma.blockerTicket.findMany({
      where: {
        status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] },
      },
      include: {
        raisedBy: { select: { id: true, fullName: true } },
        assignedOwner: { select: { id: true, fullName: true } },
      },
      orderBy: { raisedAt: 'asc' },
    });

    const items = openBlockers.map((b) => {
      const elapsedHours = Math.max(
        0,
        Math.round((now.getTime() - b.raisedAt.getTime()) / (1000 * 3600)),
      );
      const isBreached = b.targetResolutionAt ? now > b.targetResolutionAt : false;
      const hoursRemaining = b.targetResolutionAt
        ? Math.round((b.targetResolutionAt.getTime() - now.getTime()) / (1000 * 3600))
        : null;

      return {
        id: b.id,
        description: b.description,
        type: b.type,
        severity: b.severity,
        impact: b.impact,
        status: b.status,
        raisedAt: b.raisedAt,
        targetResolutionAt: b.targetResolutionAt,
        elapsedHours,
        hoursRemaining,
        isBreached,
        raisedBy: b.raisedBy,
        assignedOwner: b.assignedOwner,
        projectCodeReference: b.projectCodeReference,
      };
    });

    const totalOpen = items.length;
    const breachedCount = items.filter((i) => i.isBreached).length;
    const criticalCount = items.filter((i) => i.severity === 'CRITICAL').length;
    const highCount = items.filter((i) => i.severity === 'HIGH').length;

    return {
      evaluatedAt: now.toISOString(),
      summary: {
        totalOpen,
        breachedCount,
        criticalCount,
        highCount,
        slaComplianceRate: totalOpen > 0 ? Math.round(((totalOpen - breachedCount) / totalOpen) * 100) : 100,
      },
      blockers: items,
    };
  }
}
