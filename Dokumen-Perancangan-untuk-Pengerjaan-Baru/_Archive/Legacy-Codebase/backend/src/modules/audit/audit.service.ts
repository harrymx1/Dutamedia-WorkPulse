import { Injectable, Logger } from '@nestjs/common';
import type { Prisma, AuditLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RecordAuditLogDto } from './dto/record-audit-log.dto.js';

export type AuditLogWithActor = Prisma.AuditLogGetPayload<{
  include: {
    actor: {
      select: {
        id: true;
        fullName: true;
        email: true;
        status: true;
      };
    };
  };
}>;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Universal audit recording pattern sesuai SAD §15.2.
   * Mendukung transactional linkage bila dipanggil di dalam $transaction.
   */
  async record(
    dto: RecordAuditLogDto,
    tx?: Prisma.TransactionClient,
  ): Promise<AuditLog> {
    const client = tx ?? this.prisma;

    const data: Prisma.AuditLogCreateInput = {
      action: dto.action,
      relatedEntityType: dto.relatedEntityType,
      relatedEntityId: dto.relatedEntityId,
      valueBefore: dto.valueBefore ?? undefined,
      valueAfter: dto.valueAfter ?? undefined,
      timestamp: dto.timestamp ?? new Date(),
    };

    if (dto.actorUserId) {
      data.actor = {
        connect: {
          id: dto.actorUserId,
        },
      };
    }

    const auditLog = await client.auditLog.create({ data });

    this.logger.debug(
      `AuditLog tercatat: [${dto.action}] entity=${dto.relatedEntityType}:${dto.relatedEntityId} actor=${dto.actorUserId ?? 'SYSTEM'}`,
    );

    return auditLog;
  }

  /**
   * Mengambil audit trail untuk entitas tertentu (SAD §15.4)
   */
  async findByEntity(
    relatedEntityType: string,
    relatedEntityId: string,
  ): Promise<AuditLogWithActor[]> {
    return this.prisma.auditLog.findMany({
      where: {
        relatedEntityType,
        relatedEntityId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Mengambil riwayat aktivitas berdasarkan aktor pengguna (SAD §15.4)
   */
  async findByActor(
    actorUserId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        actorUserId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}
