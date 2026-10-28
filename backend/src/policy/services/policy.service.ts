import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { PolicyCategory } from '@prisma/client';
import { CreatePolicyVersionDto } from '../dto/create-policy-version.dto';
import { AssignPolicyOwnerDto } from '../dto/assign-policy-owner.dto';
import { CANONICAL_POLICY_FALLBACKS } from '../policy.constants';

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil satu kebijakan aktif untuk kategori dan tanggal tertentu (default: hari ini).
   * Bila belum ada kebijakan di DB, mengembalikan nilai fallback kanonikal (DEC-011).
   */
  async getActivePolicy(category: PolicyCategory, targetDate?: Date) {
    const evalDate = targetDate || this.clockService.now();
    // Format YYYY-MM-DD
    const dateStr = evalDate.toISOString().split('T')[0];

    const policy = await this.prisma.policy.findFirst({
      where: {
        category,
        effectiveDate: { lte: new Date(dateStr) },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date(dateStr) } },
        ],
      },
      orderBy: [
        { effectiveDate: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (policy) {
      return {
        id: policy.id,
        category: policy.category,
        configurationValues: policy.configurationValues as Record<string, any>,
        isIllustrative: policy.isIllustrative,
        isFallback: false,
        effectiveDate: policy.effectiveDate,
        endDate: policy.endDate,
        createdBy: policy.createdBy,
        createdAt: policy.createdAt,
      };
    }

    // Fallback kanonikal bertanda ilustratif (DEC-011)
    return {
      id: `fallback-${category.toLowerCase()}`,
      category,
      configurationValues: CANONICAL_POLICY_FALLBACKS[category],
      isIllustrative: true,
      isFallback: true,
      effectiveDate: new Date('2026-01-01'),
      endDate: null,
      createdBy: {
        id: 'system',
        fullName: 'System Default (Kanonikal)',
        email: 'system@dutamedia.test',
      },
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
  }

  /**
   * Mengambil seluruh kebijakan aktif untuk ke-5 kategori kanonikal.
   */
  async getAllActivePolicies(targetDate?: Date) {
    const categories = Object.values(PolicyCategory);
    const results = await Promise.all(
      categories.map((cat) => this.getActivePolicy(cat, targetDate)),
    );

    // Ambil penugasan pemilik kebijakan aktif saat ini
    const owners = await this.getPolicyOwners();

    return {
      evaluatedAt: (targetDate || this.clockService.now()).toISOString(),
      policies: results,
      owners,
    };
  }

  /**
   * Membuat versi kebijakan baru dengan penegakan DEC-008 (Anti-Backdating).
   */
  async createPolicyVersion(
    actorUserId: string,
    dto: CreatePolicyVersionDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputEffectiveStr = dto.effectiveDate.split('T')[0];

    // Penegakan DEC-008: Dilarang backdating
    if (inputEffectiveStr < todayStr) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN,
        message: `Tanggal mulai berlaku kebijakan tidak boleh di masa lampau (${inputEffectiveStr} < ${todayStr}) sesuai DEC-008.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const effectiveDate = new Date(inputEffectiveStr);
    const endDate = dto.endDate ? new Date(dto.endDate.split('T')[0]) : null;

    if (endDate && endDate < effectiveDate) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal berakhir kebijakan tidak boleh mendahului tanggal mulai berlaku.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Cari kebijakan aktif sebelumnya untuk menutup masa berlakunya
      const currentActive = await tx.policy.findFirst({
        where: {
          category: dto.category,
          effectiveDate: { lte: effectiveDate },
          OR: [
            { endDate: null },
            { endDate: { gte: effectiveDate } },
          ],
        },
        orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
      });

      if (currentActive && currentActive.effectiveDate < effectiveDate) {
        // Tutup kebijakan sebelumnya pada hari sebelum tanggal efektif baru
        const previousEndDate = new Date(effectiveDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);

        await tx.policy.update({
          where: { id: currentActive.id },
          data: { endDate: previousEndDate },
        });
      }

      // 2. Buat versi kebijakan baru
      const created = await tx.policy.create({
        data: {
          category: dto.category,
          configurationValues: dto.configurationValues,
          isIllustrative: dto.isIllustrative ?? false,
          effectiveDate,
          endDate,
          createdByUserId: actorUserId,
        },
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      // 3. Catat di AuditLog
      await tx.auditLog.create({
        data: {
          actorUserId,
          actionCode: 'POLICY_VERSION_CREATED',
          relatedEntityType: 'policies',
          relatedEntityId: created.id,
          valueBefore: currentActive ? (currentActive.configurationValues as any) : undefined,
          valueAfter: {
            category: created.category,
            configurationValues: created.configurationValues,
            isIllustrative: created.isIllustrative,
            effectiveDate: created.effectiveDate,
            changeJustification: dto.changeJustification,
          },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return created;
    });
  }

  /**
   * Mengambil penugasan pemilik kebijakan (Policy Owner).
   */
  async getPolicyOwners() {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const today = new Date(todayStr);

    const assignments = await this.prisma.policyOwnerAssignment.findMany({
      where: {
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return assignments;
  }

  /**
   * Menugaskan pemilik kebijakan untuk suatu kategori (misal: Direktur/Head).
   */
  async assignPolicyOwner(
    actorUserId: string,
    dto: AssignPolicyOwnerDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputEffectiveStr = dto.effectiveDate.split('T')[0];

    if (inputEffectiveStr < todayStr) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN,
        message: `Tanggal penugasan pemilik kebijakan tidak boleh di masa lampau (${inputEffectiveStr} < ${todayStr}) sesuai DEC-008.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const effectiveDate = new Date(inputEffectiveStr);
    const endDate = dto.endDate ? new Date(dto.endDate.split('T')[0]) : null;

    return this.prisma.$transaction(async (tx) => {
      // Tutup penugasan pemilik aktif sebelumnya
      const currentActive = await tx.policyOwnerAssignment.findFirst({
        where: {
          policyCategory: dto.policyCategory,
          effectiveDate: { lte: effectiveDate },
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
        orderBy: [{ effectiveDate: 'desc' }],
      });

      if (currentActive && currentActive.effectiveDate < effectiveDate) {
        const previousEndDate = new Date(effectiveDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);

        await tx.policyOwnerAssignment.update({
          where: { id: currentActive.id },
          data: { endDate: previousEndDate },
        });
      }

      const created = await tx.policyOwnerAssignment.create({
        data: {
          userId: dto.userId,
          policyCategory: dto.policyCategory,
          effectiveDate,
          endDate,
          createdByUserId: actorUserId,
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          actionCode: 'POLICY_OWNER_ASSIGNED',
          relatedEntityType: 'policy_owner_assignments',
          relatedEntityId: created.id,
          valueBefore: currentActive ? { userId: currentActive.userId } : undefined,
          valueAfter: { userId: created.userId, category: created.policyCategory },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return created;
    });
  }

  /**
   * Mengambil riwayat jejak audit (Audit Trail) kebijakan.
   */
  async getAuditTrail(category?: PolicyCategory) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        relatedEntityType: 'policies',
      },
      include: {
        actor: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return logs.map((log) => {
      const valAfter = log.valueAfter as any;
      const valBefore = log.valueBefore as any;
      return {
        id: log.id,
        timestamp: log.timestamp,
        actor: log.actor || { fullName: 'System', email: 'system@workpulse' },
        actionCode: log.actionCode,
        category: valAfter?.category || category || 'GENERAL',
        effectiveDate: valAfter?.effectiveDate || null,
        changeJustification: valAfter?.changeJustification || 'Inisialisasi sistem',
        valueBefore: valBefore,
        valueAfter: valAfter?.configurationValues || valAfter,
      };
    });
  }

  /**
   * Melakukan seed parameter ilustratif bertanda is_illustrative = true (DEC-011)
   * bila database masih kosong.
   */
  async seedIllustrativePolicies(creatorUserId: string) {
    const existingCount = await this.prisma.policy.count();
    if (existingCount > 0) {
      return { seeded: false, count: existingCount };
    }

    const categories = Object.values(PolicyCategory);
    const createdPolicies = [];

    for (const category of categories) {
      const p = await this.prisma.policy.create({
        data: {
          category,
          configurationValues: CANONICAL_POLICY_FALLBACKS[category],
          isIllustrative: true,
          effectiveDate: new Date('2026-01-01'),
          createdByUserId: creatorUserId,
        },
      });
      createdPolicies.push(p);

      // Default owner assignment
      await this.prisma.policyOwnerAssignment.create({
        data: {
          userId: creatorUserId,
          policyCategory: category,
          effectiveDate: new Date('2026-01-01'),
          createdByUserId: creatorUserId,
        },
      });
    }

    return { seeded: true, count: createdPolicies.length };
  }
}
