import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectAuthorityDto } from '../dto/project-authority.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

@Injectable()
export class ProjectAuthorityService {
  constructor(private readonly prisma: PrismaService) {}

  async createProjectAuthority(
    dto: CreateProjectAuthorityDto,
    adminUserId: string,
  ) {
    const [pm, reviewer] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.projectManagerId } }),
      this.prisma.user.findUnique({ where: { id: dto.escalationReviewerId } }),
    ]);

    if (!pm) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna Project Manager yang dipilih tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (!reviewer) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna Escalation Reviewer yang dipilih tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const effectiveDate = new Date(dto.effectiveDate);

    // Tutup wewenang aktif proyek sebelumnya jika ada dalam satu transaksi
    return await this.prisma.$transaction(async (tx) => {
      const activeMappings = await tx.projectAuthorityMapping.findMany({
        where: {
          projectCode: dto.projectCode.trim().toUpperCase(),
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
      });

      for (const old of activeMappings) {
        const closingDate = new Date(effectiveDate);
        closingDate.setDate(closingDate.getDate() - 1);

        const safeClosingDate =
          closingDate >= old.effectiveDate ? closingDate : old.effectiveDate;

        await tx.projectAuthorityMapping.update({
          where: { id: old.id },
          data: {
            endDate: safeClosingDate,
            updatedAt: new Date(),
          },
        });
      }

      return await tx.projectAuthorityMapping.create({
        data: {
          projectCode: dto.projectCode.trim().toUpperCase(),
          projectName: dto.projectName.trim(),
          projectManagerId: dto.projectManagerId,
          escalationReviewerId: dto.escalationReviewerId,
          involvedFunction: dto.involvedFunction,
          effectiveDate,
          assignmentReason: dto.assignmentReason.trim(),
          createdByUserId: adminUserId,
        },
        include: {
          projectManager: { select: { id: true, fullName: true, email: true } },
          escalationReviewer: { select: { id: true, fullName: true, email: true } },
        },
      });
    });
  }

  async listProjectAuthorities(options: {
    page?: number;
    limit?: number;
    search?: string;
    activeOnly?: boolean;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.search) {
      const q = options.search.trim();
      where.OR = [
        { projectCode: { contains: q, mode: 'insensitive' } },
        { projectName: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (options.activeOnly) {
      const today = new Date();
      where.effectiveDate = { lte: today };
      where.OR = [{ endDate: null }, { endDate: { gte: today } }];
    }

    const [totalRecords, data] = await Promise.all([
      this.prisma.projectAuthorityMapping.count({ where }),
      this.prisma.projectAuthorityMapping.findMany({
        where,
        skip,
        take: limit,
        orderBy: { effectiveDate: 'desc' },
        include: {
          projectManager: { select: { id: true, fullName: true, email: true } },
          escalationReviewer: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    };
  }

  async endProjectAuthority(id: string, _adminUserId: string) {
    const existing = await this.prisma.projectAuthorityMapping.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pemetaan wewenang proyek tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const today = new Date();
    return await this.prisma.projectAuthorityMapping.update({
      where: { id },
      data: {
        endDate: today,
        updatedAt: new Date(),
      },
    });
  }

  async getAuthorityForProject(projectCode: string, targetDate = new Date()) {
    return await this.prisma.projectAuthorityMapping.findFirst({
      where: {
        projectCode: projectCode.toUpperCase(),
        effectiveDate: { lte: targetDate },
        OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
      },
      orderBy: { effectiveDate: 'desc' },
      include: {
        projectManager: true,
        escalationReviewer: true,
      },
    });
  }
}
