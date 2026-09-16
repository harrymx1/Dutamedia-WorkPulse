import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { Role, UserStatus, type User, type OrganizationalAssignment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import type { QueryUsersDto } from './dto/query-users.dto.js';
import type { CreateOrgAssignmentDto } from './dto/create-org-assignment.dto.js';
import type { CreateProjectAuthorityDto } from './dto/create-project-authority.dto.js';
import type { UpdateProjectAuthorityDto } from './dto/update-project-authority.dto.js';
import type { CreateTempReviewerDto } from './dto/create-temp-reviewer.dto.js';
import type { PaginatedResult } from '../shared/dto/base-response.dto.js';

export interface ActiveContext {
  assignmentId: string;
  role: Role;
  function: string;
  directManagerId: string | null;
}

export interface UserWithActiveAssignment extends User {
  activeAssignment?: (OrganizationalAssignment & {
    directManager?: { id: string; fullName: string; email: string } | null;
  }) | null;
}

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * EPIC-04-T1: Membuat user baru beserta initial assignment dan password sementara.
   * Menggunakan hashing Argon2id (SAD §8.2) dan atomic transaction.
   */
  async createUser(
    dto: CreateUserDto,
    creatorUserId?: string,
  ): Promise<{
    user: User;
    assignment: OrganizationalAssignment;
    temporaryPassword: string;
  }> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Cek email unik
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException(`Email '${normalizedEmail}' sudah terdaftar`);
    }

    // 2. Validasi directManager jika disertakan
    if (dto.directManagerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: dto.directManagerId },
      });
      if (!manager) {
        throw new NotFoundException('Direct manager yang dipilih tidak ditemukan');
      }
    }

    // 3. Generate password sementara yang aman (12 karakter hex acak)
    const temporaryPassword = randomBytes(6).toString('hex'); // 12 karakter hex
    const passwordHash = await argon2.hash(temporaryPassword, {
      type: argon2.argon2id,
    });

    const effectiveDate = new Date(dto.effectiveDate);

    // 4. Jalankan dalam transaksi atomik (User + Assignment + AuditLog)
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email: normalizedEmail,
          passwordHash,
          status: UserStatus.Active,
          mustResetPassword: true, // FR-50
        },
      });

      const assignment = await tx.organizationalAssignment.create({
        data: {
          userId: user.id,
          role: dto.initialRole,
          function: dto.function.trim(),
          directManagerId: dto.directManagerId ?? null,
          effectiveDate,
          endDate: null,
          createdByUserId: creatorUserId ?? user.id,
        },
      });

      await this.auditService.record(
        {
          actorUserId: creatorUserId ?? null,
          action: 'USER_CREATED',
          relatedEntityType: 'User',
          relatedEntityId: user.id,
          valueAfter: {
            fullName: user.fullName,
            email: user.email,
            initialRole: dto.initialRole,
            function: dto.function,
            directManagerId: dto.directManagerId ?? null,
            effectiveDate: dto.effectiveDate,
          },
        },
        tx,
      );

      this.logger.log(`Pengguna baru dibuat: ${user.email} (${user.id})`);

      return {
        user,
        assignment,
        temporaryPassword,
      };
    });
  }

  /**
   * EPIC-04-T1: Mengambil daftar pengguna dengan filter, pencarian, dan pagination.
   * Menyertakan OrganizationalAssignment aktif per hari ini.
   */
  async getUsers(
    query: QueryUsersDto,
  ): Promise<PaginatedResult<UserWithActiveAssignment>> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
    const skip = (page - 1) * pageSize;
    const today = new Date();

    const whereClause: any = {};

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.search) {
      whereClause.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role || query.function) {
      whereClause.organizationalAssignments = {
        some: {
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
          ...(query.role ? { role: query.role } : {}),
          ...(query.function
            ? { function: { contains: query.function, mode: 'insensitive' } }
            : {}),
        },
      };
    }

    const [totalItems, rawUsers] = await Promise.all([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
        include: {
          organizationalAssignments: {
            where: {
              effectiveDate: { lte: today },
              OR: [{ endDate: null }, { endDate: { gte: today } }],
            },
            orderBy: { effectiveDate: 'desc' },
            take: 1,
            include: {
              directManager: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
        },
      }),
    ]);

    const items: UserWithActiveAssignment[] = rawUsers.map((u) => {
      const { organizationalAssignments, ...userProps } = u;
      return {
        ...userProps,
        activeAssignment: organizationalAssignments[0] ?? null,
      };
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Mengambil detail satu user beserta assignment aktifnya
   */
  async getUserById(id: string): Promise<UserWithActiveAssignment> {
    const today = new Date();
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organizationalAssignments: {
          where: {
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
          orderBy: { effectiveDate: 'desc' },
          take: 1,
          include: {
            directManager: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Pengguna dengan ID '${id}' tidak ditemukan`);
    }

    const { organizationalAssignments, ...userProps } = user;
    return {
      ...userProps,
      activeAssignment: organizationalAssignments[0] ?? null,
    };
  }

  /**
   * EPIC-04-T1 & EPIC-04-T6: Update status user.
   * Deaktivasi user memicu pencabutan (revocation) seluruh Session aktif dalam 1 transaksi.
   */
  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    actorUserId?: string,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Pengguna dengan ID '${id}' tidak ditemukan`);
    }

    if (user.status === dto.status) {
      return user;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { status: dto.status },
      });

      // EPIC-04-T6: Jika di-deaktivasi, batalkan semua sesi aktif
      if (dto.status === UserStatus.Inactive) {
        await tx.session.updateMany({
          where: {
            userId: id,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });

        await this.auditService.record(
          {
            actorUserId: actorUserId ?? null,
            action: 'USER_DEACTIVATED',
            relatedEntityType: 'User',
            relatedEntityId: id,
            valueBefore: { status: user.status },
            valueAfter: { status: UserStatus.Inactive },
          },
          tx,
        );

        this.logger.warn(`Pengguna ${id} dinonaktifkan, seluruh sesi aktif dicabut.`);
      } else {
        await this.auditService.record(
          {
            actorUserId: actorUserId ?? null,
            action: 'USER_ACTIVATED',
            relatedEntityType: 'User',
            relatedEntityId: id,
            valueBefore: { status: user.status },
            valueAfter: { status: UserStatus.Active },
          },
          tx,
        );
      }

      return updatedUser;
    });
  }

  /**
   * EPIC-04-T2: Mengambil riwayat assignment organisasi user.
   */
  async getOrganizationalAssignments(
    userId: string,
  ): Promise<OrganizationalAssignment[]> {
    await this.getUserById(userId);

    return this.prisma.organizationalAssignment.findMany({
      where: { userId },
      orderBy: { effectiveDate: 'desc' },
      include: {
        directManager: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  /**
   * EPIC-04-T2: Membuat assignment baru dengan logika effective-dating (BR-10).
   * Menutup endDate assignment aktif lama dan menyisipkan assignment baru.
   */
  async createOrganizationalAssignment(
    dto: CreateOrgAssignmentDto,
    actorUserId?: string,
  ): Promise<OrganizationalAssignment> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`Pengguna dengan ID '${dto.userId}' tidak ditemukan`);
    }

    if (dto.directManagerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: dto.directManagerId },
      });
      if (!manager) {
        throw new NotFoundException('Direct manager yang dipilih tidak ditemukan');
      }
    }

    const effectiveDate = new Date(dto.effectiveDate);

    return this.prisma.$transaction(async (tx) => {
      // 1. Cari assignment aktif saat ini (endDate IS NULL atau endDate >= effectiveDate)
      const currentActive = await tx.organizationalAssignment.findFirst({
        where: {
          userId: dto.userId,
          effectiveDate: { lte: effectiveDate },
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });

      let previousAssignmentSnapshot: any = null;

      // 2. Tutup assignment lama: endDate = effectiveDate - 1 hari
      if (currentActive) {
        previousAssignmentSnapshot = {
          id: currentActive.id,
          role: currentActive.role,
          function: currentActive.function,
          effectiveDate: currentActive.effectiveDate,
        };

        const closingDate = new Date(effectiveDate);
        closingDate.setDate(closingDate.getDate() - 1);

        // Jika closingDate lebih awal dari tanggal mulai assignment lama, gunakan tanggal mulai lama
        const safeEndDate =
          closingDate < currentActive.effectiveDate
            ? currentActive.effectiveDate
            : closingDate;

        await tx.organizationalAssignment.update({
          where: { id: currentActive.id },
          data: { endDate: safeEndDate },
        });
      }

      // 3. Masukkan assignment baru
      const newAssignment = await tx.organizationalAssignment.create({
        data: {
          userId: dto.userId,
          role: dto.role,
          function: dto.function.trim(),
          directManagerId: dto.directManagerId ?? null,
          effectiveDate,
          endDate: null,
          createdByUserId: actorUserId ?? dto.userId,
        },
      });

      // 4. Catat AuditLog
      await this.auditService.record(
        {
          actorUserId: actorUserId ?? null,
          action: 'ORGANIZATIONAL_ASSIGNMENT_CREATED',
          relatedEntityType: 'OrganizationalAssignment',
          relatedEntityId: newAssignment.id,
          valueBefore: previousAssignmentSnapshot,
          valueAfter: {
            id: newAssignment.id,
            role: newAssignment.role,
            function: newAssignment.function,
            directManagerId: newAssignment.directManagerId,
            effectiveDate: dto.effectiveDate,
          },
        },
        tx,
      );

      this.logger.log(
        `Assignment baru untuk user ${dto.userId}: ${dto.role} (${dto.function}) efektif ${dto.effectiveDate}`,
      );

      return newAssignment;
    });
  }

  /**
   * EPIC-04-T3: Membuat mapping otoritas proyek baru (multi-concurrent).
   */
  async createProjectAuthorityMapping(
    dto: CreateProjectAuthorityDto,
    actorUserId?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`Pengguna dengan ID '${dto.userId}' tidak ditemukan`);
    }

    const effectiveDate = new Date(dto.effectiveDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate < effectiveDate) {
      throw new BusinessRuleViolationException('endDate tidak boleh mendahului effectiveDate');
    }

    return this.prisma.$transaction(async (tx) => {
      const mapping = await tx.projectAuthorityMapping.create({
        data: {
          userId: dto.userId,
          scopeReference: dto.scopeReference.trim(),
          effectiveDate,
          endDate,
          createdByUserId: actorUserId ?? dto.userId,
        },
      });

      await this.auditService.record(
        {
          actorUserId: actorUserId ?? null,
          action: 'PROJECT_AUTHORITY_MAPPING_CREATED',
          relatedEntityType: 'ProjectAuthorityMapping',
          relatedEntityId: mapping.id,
          valueAfter: {
            userId: dto.userId,
            scopeReference: dto.scopeReference,
            effectiveDate: dto.effectiveDate,
            endDate: dto.endDate ?? null,
          },
        },
        tx,
      );

      return mapping;
    });
  }

  /**
   * EPIC-04-T3: Mengakhiri mapping otoritas proyek via pengisian endDate (bukan delete).
   */
  async updateProjectAuthorityMapping(
    id: string,
    dto: UpdateProjectAuthorityDto,
    actorUserId?: string,
  ) {
    const existing = await this.prisma.projectAuthorityMapping.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Project authority mapping ID '${id}' tidak ditemukan`);
    }

    const endDate = new Date(dto.endDate);
    if (endDate < existing.effectiveDate) {
      throw new BusinessRuleViolationException(
        'endDate tidak boleh lebih awal dari effectiveDate mapping ini',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.projectAuthorityMapping.update({
        where: { id },
        data: { endDate },
      });

      await this.auditService.record(
        {
          actorUserId: actorUserId ?? null,
          action: 'PROJECT_AUTHORITY_MAPPING_ENDED',
          relatedEntityType: 'ProjectAuthorityMapping',
          relatedEntityId: id,
          valueBefore: { endDate: existing.endDate },
          valueAfter: { endDate: dto.endDate },
        },
        tx,
      );

      return updated;
    });
  }

  /**
   * EPIC-04-T4: Penugasan reviewer sementara dengan batas waktu ketat (BR-11).
   */
  async createTemporaryReviewerAssignment(
    dto: CreateTempReviewerDto,
    actorUserId?: string,
  ) {
    const reviewer = await this.prisma.user.findUnique({
      where: { id: dto.reviewerUserId },
    });
    if (!reviewer) {
      throw new NotFoundException(
        `Pengguna reviewer dengan ID '${dto.reviewerUserId}' tidak ditemukan`,
      );
    }

    const effectiveDate = new Date(dto.effectiveDate);
    const expiryDate = new Date(dto.expiryDate);

    // BR-11: expiryDate wajib dan harus bernilai lebih besar dari effectiveDate
    if (expiryDate <= effectiveDate) {
      throw new BusinessRuleViolationException(
        'Tanggal kadaluarsa (expiryDate) harus lebih besar dari tanggal efektif (effectiveDate) (BR-11)',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.temporaryReviewerAssignment.create({
        data: {
          reviewerUserId: dto.reviewerUserId,
          scope: dto.scope.trim(),
          reason: dto.reason.trim(),
          effectiveDate,
          expiryDate,
          createdByUserId: actorUserId ?? dto.reviewerUserId,
        },
      });

      await this.auditService.record(
        {
          actorUserId: actorUserId ?? null,
          action: 'TEMPORARY_REVIEWER_ASSIGNMENT_CREATED',
          relatedEntityType: 'TemporaryReviewerAssignment',
          relatedEntityId: assignment.id,
          valueAfter: {
            reviewerUserId: dto.reviewerUserId,
            scope: dto.scope,
            reason: dto.reason,
            effectiveDate: dto.effectiveDate,
            expiryDate: dto.expiryDate,
          },
        },
        tx,
      );

      return assignment;
    });
  }

  /**
   * EPIC-04-T5: Service resolusi role/scope aktif "AS OF tanggal".
   * Dipakai oleh AuthModule (EPIC-03), ScopeGuard (EPIC-05), dan module lain.
   */
  async resolveActiveContext(
    userId: string,
    asOfDate: Date = new Date(),
  ): Promise<ActiveContext | null> {
    const assignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId,
        effectiveDate: { lte: asOfDate },
        OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!assignment) {
      return null;
    }

    return {
      assignmentId: assignment.id,
      role: assignment.role,
      function: assignment.function,
      directManagerId: assignment.directManagerId,
    };
  }

  /**
   * EPIC-04-T5: Resolusi daftar Project Authority aktif "AS OF tanggal".
   */
  async resolveProjectAuthorities(
    userId: string,
    asOfDate: Date = new Date(),
  ): Promise<string[]> {
    const mappings = await this.prisma.projectAuthorityMapping.findMany({
      where: {
        userId,
        effectiveDate: { lte: asOfDate },
        OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
      },
      select: {
        scopeReference: true,
      },
    });

    return mappings.map((m) => m.scopeReference);
  }

  /**
   * EPIC-04-T5: Resolusi penugasan Reviewer Sementara aktif "AS OF tanggal".
   */
  async resolveTemporaryReviewers(
    userId: string,
    asOfDate: Date = new Date(),
  ) {
    return this.prisma.temporaryReviewerAssignment.findMany({
      where: {
        reviewerUserId: userId,
        effectiveDate: { lte: asOfDate },
        expiryDate: { gte: asOfDate },
      },
      select: {
        id: true,
        scope: true,
        reason: true,
        expiryDate: true,
      },
    });
  }
}
