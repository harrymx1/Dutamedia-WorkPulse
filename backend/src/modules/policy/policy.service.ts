import { Injectable, Logger } from '@nestjs/common';
import {
  PolicyCategory,
  PolicyStatus,
  UserStatus,
  type Policy,
  type PolicyOwnerAssignment,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  BusinessRuleViolationException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
import type { CreatePolicyDto } from './dto/create-policy.dto.js';
import type { CreatePolicyOwnerAssignmentDto } from './dto/create-policy-owner-assignment.dto.js';
import type { QueryPoliciesDto } from './dto/query-policies.dto.js';

export const DEFAULT_POLICY_VALUES: Record<PolicyCategory, Record<string, any>> = {
  [PolicyCategory.Cutoff]: {
    morningOnTimeDeadline: '09:00',
    eodOnTimeDeadline: '18:00',
  },
  [PolicyCategory.GracePeriod]: {
    morningGraceMinutes: 30,
    eodGraceMinutes: 30,
  },
  [PolicyCategory.WorkdayCalendar]: {
    workDays: [1, 2, 3, 4, 5], // Senin - Jumat
  },
  [PolicyCategory.EscalationThreshold]: {
    unacknowledgedThresholdHours: 2,
  },
  [PolicyCategory.CoachingFollowUpPeriod]: {
    coachingWindowDays: 14,
  },
  [PolicyCategory.RetentionPeriod]: {
    backupRetentionDays: 14,
    exportRetentionMinutes: 15,
  },
  [PolicyCategory.ExemptionRule]: {
    allowLeaveOnProbation: true,
  },
  [PolicyCategory.ObjectionWindowDuration]: {
    durationHours: 24,
  },
  [PolicyCategory.MinorMaterialThreshold]: {
    wordsChangedThreshold: 10,
  },
  [PolicyCategory.ParticipationRule]: {
    minCommitmentCount: 1,
    maxCommitmentCount: 3,
  },
};

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * EPIC-06-T1: Mengambil daftar kebijakan aktif per tanggal asOfDate (SAD §10.9).
   */
  async getActivePolicies(query: QueryPoliciesDto): Promise<Policy[]> {
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

    return this.prisma.policy.findMany({
      where: {
        ...(query.category ? { category: query.category } : {}),
        status: PolicyStatus.Active,
        effectiveDate: { lte: asOfDate },
        OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
      },
      orderBy: { category: 'asc' },
    });
  }

  /**
   * EPIC-06-T1: Mengambil seluruh riwayat versi untuk kategori kebijakan tertentu (SAD §10.9).
   */
  async getPolicyHistory(category: PolicyCategory) {
    return this.prisma.policy.findMany({
      where: { category },
      orderBy: { effectiveDate: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * EPIC-06-T2: Membuat versi kebijakan baru dengan effective-dating (SAD §5.9, §10.9).
   * Menutup versi aktif sebelumnya secara otomatis dalam transaksi.
   */
  async createPolicy(dto: CreatePolicyDto, actorUserId: string): Promise<Policy> {
    const effectiveDate = new Date(dto.effectiveDate);

    return this.prisma.$transaction(async (tx) => {
      // 1. Cari versi aktif sebelumnya yang overlap
      const previousPolicy = await tx.policy.findFirst({
        where: {
          category: dto.category,
          status: PolicyStatus.Active,
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });

      // 2. Jika ada versi lama, tutup dengan endDate = effectiveDate baru - 1 hari
      if (previousPolicy) {
        const previousDay = new Date(effectiveDate);
        previousDay.setDate(previousDay.getDate() - 1);

        await tx.policy.update({
          where: { id: previousPolicy.id },
          data: { endDate: previousDay },
        });

        this.logger.log(
          `Versi kebijakan ${dto.category} (${previousPolicy.id}) ditutup per ${previousDay.toISOString()}`,
        );
      }

      // 3. Buat versi baru
      const newPolicy = await tx.policy.create({
        data: {
          category: dto.category,
          value: dto.value,
          effectiveDate,
          endDate: null,
          status: PolicyStatus.Active,
          createdByUserId: actorUserId,
        },
      });

      // 4. Catat ke Audit Trail (SAD §15.2)
      await this.auditService.record(
        {
          actorUserId,
          action: 'POLICY_VERSION_CREATED',
          relatedEntityType: 'Policy',
          relatedEntityId: newPolicy.id,
          valueBefore: previousPolicy
            ? {
                id: previousPolicy.id,
                value: previousPolicy.value,
                effectiveDate: previousPolicy.effectiveDate,
              }
            : null,
          valueAfter: {
            id: newPolicy.id,
            value: newPolicy.value,
            effectiveDate: newPolicy.effectiveDate,
          },
        },
        tx,
      );

      this.logger.log(
        `Versi baru kebijakan ${dto.category} berhasil dibuat (${newPolicy.id}) oleh user ${actorUserId}`,
      );

      return newPolicy;
    });
  }

  /**
   * EPIC-06-T3: Memberikan wewenang kepemilikan kategori kebijakan ke user (SAD §8.10, §10.9).
   */
  async createPolicyOwnerAssignment(
    dto: CreatePolicyOwnerAssignmentDto,
    actorAdminId: string,
  ): Promise<PolicyOwnerAssignment> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || user.status !== UserStatus.Active) {
      throw new NotFoundException(
        'Pengguna tidak ditemukan atau berstatus tidak aktif',
      );
    }

    const effectiveDate = new Date(dto.effectiveDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate <= effectiveDate) {
      throw new BusinessRuleViolationException(
        'Tanggal berakhir (endDate) harus lebih besar dari tanggal efektif (effectiveDate)',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Cari penugasan aktif sebelumnya untuk user dan kategori yang sama
      const previousAssignment = await tx.policyOwnerAssignment.findFirst({
        where: {
          userId: dto.userId,
          policyCategory: dto.policyCategory,
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
      });

      if (previousAssignment) {
        const previousDay = new Date(effectiveDate);
        previousDay.setDate(previousDay.getDate() - 1);

        await tx.policyOwnerAssignment.update({
          where: { id: previousAssignment.id },
          data: { endDate: previousDay },
        });
      }

      // 2. Buat assignment baru
      const newAssignment = await tx.policyOwnerAssignment.create({
        data: {
          userId: dto.userId,
          policyCategory: dto.policyCategory,
          effectiveDate,
          endDate,
        },
      });

      // 3. Catat audit trail
      await this.auditService.record(
        {
          actorUserId: actorAdminId,
          action: 'POLICY_OWNER_ASSIGNED',
          relatedEntityType: 'PolicyOwnerAssignment',
          relatedEntityId: newAssignment.id,
          valueAfter: {
            userId: dto.userId,
            policyCategory: dto.policyCategory,
            effectiveDate: dto.effectiveDate,
            endDate: dto.endDate ?? null,
          },
        },
        tx,
      );

      this.logger.log(
        `User ${dto.userId} berhasil ditugaskan sebagai Policy Owner untuk kategori ${dto.policyCategory}`,
      );

      return newAssignment;
    });
  }

  /**
   * EPIC-06-T4: Mengambil snapshot kebijakan aktif untuk daftar kategori tertentu (SAD §6.4).
   * Didependensi oleh 5 modul domain (DailyAccountability, Blocker, CorrectionRequest, Exception, Compliance).
   */
  async getActivePolicySnapshot(
    categories: PolicyCategory[],
    asOfDate: Date = new Date(),
  ): Promise<Record<PolicyCategory, any>> {
    if (!categories || categories.length === 0) {
      return {} as Record<PolicyCategory, any>;
    }

    const policies = await this.prisma.policy.findMany({
      where: {
        category: { in: categories },
        status: PolicyStatus.Active,
        effectiveDate: { lte: asOfDate },
        OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const snapshot: Record<string, any> = {};

    // 1. Isi dengan default value per kategori
    for (const cat of categories) {
      snapshot[cat] = DEFAULT_POLICY_VALUES[cat] ?? {};
    }

    // 2. Timpa dengan nilai aktif dari database jika ada
    for (const policy of policies) {
      snapshot[policy.category] = policy.value;
    }

    return snapshot as Record<PolicyCategory, any>;
  }
}
