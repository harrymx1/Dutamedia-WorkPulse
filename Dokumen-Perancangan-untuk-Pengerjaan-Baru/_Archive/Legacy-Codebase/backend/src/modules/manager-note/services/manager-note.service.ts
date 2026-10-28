import { Injectable, Logger } from '@nestjs/common';
import {
  ManagerNoteVisibility,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import type { CreateManagerNoteDto } from '../dto/create-manager-note.dto.js';
import type { QueryManagerNotesDto } from '../dto/query-manager-notes.dto.js';
import {
  BusinessRuleViolationException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';

@Injectable()
export class ManagerNoteService {
  private readonly logger = new Logger(ManagerNoteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly scopeFilterService: ScopeFilterService,
  ) {}

  /**
   * EPIC-11-T1: Buat Manager Note baru (SAD §5.8a, §10.7, §15.1, BR-14, FR-39).
   * Hanya diizinkan untuk peran Supervisor_TL, Head, dan HRGA.
   * Catatan bersifat permanen tanpa endpoint edit/hapus.
   */
  async createManagerNote(
    user: CurrentUserPayload,
    dto: CreateManagerNoteDto,
  ) {
    const asOfDate = new Date();

    // 1. Validasi peran pembuat catatan (SAD §10.7)
    const allowedRoles: (string | null)[] = [
      Role.Supervisor_TL,
      Role.Head,
      Role.HRGA,
    ];
    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Hanya Supervisor, Head, atau HRGA yang memiliki wewenang membuat catatan manajerial (SAD §10.7)',
      );
    }

    // 2. Validasi subjek catatan bukan diri sendiri (Anti-self note)
    if (user.userId === dto.aboutUserId) {
      throw new BusinessRuleViolationException(
        'Manajer tidak dapat membuat catatan manajerial untuk diri sendiri',
        [{ field: 'aboutUserId', reason: 'SELF_NOTE_NOT_ALLOWED' }],
      );
    }

    // 3. Validasi keberadaan pengguna subjek catatan di database
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.aboutUserId },
      select: { id: true, fullName: true, status: true },
    });

    if (!targetUser) {
      throw new NotFoundException(
        'Pengguna subjek catatan tidak ditemukan di sistem',
      );
    }

    // 4. Validasi cakupan wewenang organisasi (Scope check) untuk Supervisor dan Head
    if (user.role === Role.Supervisor_TL || user.role === Role.Head) {
      const inScope = await this.scopeFilterService.isUserInScope(
        user,
        dto.aboutUserId,
        asOfDate,
      );

      if (!inScope) {
        throw new ForbiddenException(
          'Pengguna subjek catatan berada di luar cakupan wewenang organisasi aktif Anda',
        );
      }
    }

    // 5. Eksekusi penyimpanan dalam transaksi atomik bersama AuditLog (SAD §15.1, §15.2)
    return this.prisma.$transaction(async (tx) => {
      const visibility =
        dto.visibility ?? ManagerNoteVisibility.PrivateToManagement;

      const note = await tx.managerNote.create({
        data: {
          aboutUserId: dto.aboutUserId,
          createdByUserId: user.userId,
          type: dto.type,
          note: dto.note.trim(),
          visibility,
          relatedEntityType: dto.relatedEntityType ?? null,
          relatedEntityId: dto.relatedEntityId ?? null,
        },
        include: {
          aboutUser: {
            select: { id: true, fullName: true, email: true },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'MANAGER_NOTE_CREATED',
          relatedEntityType: 'ManagerNote',
          relatedEntityId: note.id,
          valueAfter: {
            id: note.id,
            aboutUserId: note.aboutUserId,
            createdByUserId: note.createdByUserId,
            type: note.type,
            visibility: note.visibility,
            relatedEntityType: note.relatedEntityType,
            relatedEntityId: note.relatedEntityId,
          },
        },
        tx,
      );

      this.logger.log(
        `Manager Note (${dto.type}, ${visibility}) berhasil dibuat oleh ${user.userId} untuk ${dto.aboutUserId} (id: ${note.id})`,
      );

      return note;
    });
  }

  /**
   * EPIC-11-T2: List Manager Notes sesuai Scope & Strict Visibility (SAD §8.11, §10.7, BR-14).
   */
  async findAll(user: CurrentUserPayload, query: QueryManagerNotesDto) {
    const asOfDate = new Date();

    // 1. SystemAdmin tidak memiliki akses ke data operasional (SAD §8.11)
    if (user.role === Role.SystemAdmin) {
      throw new ForbiddenException(
        'SystemAdmin tidak memiliki kewenangan mengakses data operasional (SAD §8.11)',
      );
    }

    const where: Prisma.ManagerNoteWhereInput = {};

    // 2. Evaluasi Visibilitas & Scope per peran pengguna (BR-14)
    if (user.role === Role.Employee) {
      // Employee hanya boleh melihat catatan tentang dirinya sendiri yang berstatus VisibleToEmployee
      if (query.aboutUserId && query.aboutUserId !== user.userId) {
        return this.buildEmptyPaginatedResponse(query);
      }

      if (
        query.visibility &&
        query.visibility === ManagerNoteVisibility.PrivateToManagement
      ) {
        return this.buildEmptyPaginatedResponse(query);
      }

      where.aboutUserId = user.userId;
      where.visibility = ManagerNoteVisibility.VisibleToEmployee;
    } else if (
      user.role === Role.Supervisor_TL ||
      user.role === Role.Head ||
      user.role === Role.PM
    ) {
      const accessibleUserIds =
        await this.scopeFilterService.getAccessibleUserIds(user, asOfDate);

      const subordinateIds = (accessibleUserIds || []).filter(
        (id) => id !== user.userId,
      );

      // Supervisor/Head dapat melihat:
      // a. Catatan yang mereka buat sendiri
      // b. Catatan subordinat dalam scope aktif (baik PrivateToManagement maupun VisibleToEmployee)
      // c. Catatan tentang diri mereka sendiri jika VisibleToEmployee
      const scopeConditions: Prisma.ManagerNoteWhereInput[] = [
        { createdByUserId: user.userId },
        { aboutUserId: { in: subordinateIds } },
        {
          aboutUserId: user.userId,
          visibility: ManagerNoteVisibility.VisibleToEmployee,
        },
      ];

      if (query.aboutUserId) {
        if (query.aboutUserId === user.userId) {
          where.aboutUserId = user.userId;
          where.visibility = ManagerNoteVisibility.VisibleToEmployee;
        } else if (subordinateIds.includes(query.aboutUserId)) {
          where.aboutUserId = query.aboutUserId;
          if (query.visibility) {
            where.visibility = query.visibility;
          }
        } else {
          // Target user di luar scope subordinat
          return this.buildEmptyPaginatedResponse(query);
        }
      } else {
        where.OR = scopeConditions;
        if (query.visibility) {
          where.visibility = query.visibility;
        }
      }
    } else if (
      user.role === Role.HRGA ||
      user.role === Role.CEO_Management
    ) {
      // Company-wide access (PRD §7)
      if (query.aboutUserId) {
        where.aboutUserId = query.aboutUserId;
      }
      if (query.visibility) {
        where.visibility = query.visibility;
      }
    }

    // 3. Filter tipe catatan jika diminta
    if (query.type) {
      where.type = query.type;
    }

    // 4. Pagination & Query execution
    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const [totalItems, notes] = await Promise.all([
      this.prisma.managerNote.count({ where }),
      this.prisma.managerNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          aboutUser: {
            select: { id: true, fullName: true, email: true },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: notes,
      meta: {
        totalItems,
        totalPages,
        page,
        limit,
      },
    };
  }

  /**
   * EPIC-11-T2: Detail Manager Note dengan Strict Visibility & Scope (SAD §7.7, §10.7, BR-14).
   * Menghasilkan 404 Not Found jika berada di luar cakupan atau visibilitas.
   */
  async findById(user: CurrentUserPayload, id: string) {
    const asOfDate = new Date();

    if (user.role === Role.SystemAdmin) {
      throw new ForbiddenException(
        'SystemAdmin tidak memiliki kewenangan mengakses data operasional (SAD §8.11)',
      );
    }

    const note = await this.prisma.managerNote.findUnique({
      where: { id },
      include: {
        aboutUser: {
          select: { id: true, fullName: true, email: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Manager note tidak ditemukan');
    }

    // Evaluasi izin akses
    const isAllowed = await this.canViewNote(user, note, asOfDate);
    if (!isAllowed) {
      // SAD §7.7 & §10.7: Merespons 404 (bukan 403) jika di luar visibilitas untuk mencegah information leakage
      throw new NotFoundException('Manager note tidak ditemukan');
    }

    return note;
  }

  /**
   * Helper internal untuk memverifikasi hak akses pembacaan catatan manajerial.
   */
  private async canViewNote(
    user: CurrentUserPayload,
    note: {
      aboutUserId: string;
      createdByUserId: string;
      visibility: ManagerNoteVisibility;
    },
    asOfDate: Date,
  ): Promise<boolean> {
    // 1. HRGA dan CEO_Management memiliki akses company-wide
    if (
      user.role === Role.HRGA ||
      user.role === Role.CEO_Management
    ) {
      return true;
    }

    // 2. Pembuat catatan selalu dapat melihat catatan yang dibuatnya
    if (note.createdByUserId === user.userId) {
      return true;
    }

    // 3. Employee subject hanya boleh melihat jika visibility = VisibleToEmployee
    if (note.aboutUserId === user.userId) {
      return note.visibility === ManagerNoteVisibility.VisibleToEmployee;
    }

    // 4. Supervisor / Head / PM dapat melihat catatan subordinat dalam scope aktif
    if (
      user.role === Role.Supervisor_TL ||
      user.role === Role.Head ||
      user.role === Role.PM
    ) {
      const inScope = await this.scopeFilterService.isUserInScope(
        user,
        note.aboutUserId,
        asOfDate,
      );
      return inScope;
    }

    return false;
  }

  private buildEmptyPaginatedResponse(query: QueryManagerNotesDto) {
    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    return {
      data: [],
      meta: {
        totalItems: 0,
        totalPages: 0,
        page,
        limit,
      },
    };
  }
}
