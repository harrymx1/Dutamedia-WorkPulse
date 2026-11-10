import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignOrgDto } from '../dto/assign-org.dto';
import { HierarchyCycleDetector } from '../utils/hierarchy-cycle.detector';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { CanonicalFunction, CanonicalRole } from '@prisma/client';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async assignUser(dto: AssignOrgDto, adminUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna yang akan ditugaskan tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (dto.directManagerId) {
      if (dto.userId === dto.directManagerId) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Karyawan tidak dapat ditugaskan sebagai atasan langsung bagi dirinya sendiri.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      const manager = await this.prisma.user.findUnique({
        where: { id: dto.directManagerId },
      });

      if (!manager) {
        throw new AppException({
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Atasan langsung yang dipilih tidak ditemukan.',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      // Deteksi Siklus Pelaporan Hierarki (WP-EP03-TK003)
      const effectiveDateParsed = new Date(dto.effectiveDate);
      const cycleResult = await HierarchyCycleDetector.detectCycle(
        dto.userId,
        dto.directManagerId,
        async (userId) => {
          const active = await this.getUserActiveAssignment(userId, effectiveDateParsed);
          return active?.directManagerId || null;
        },
      );

      if (cycleResult.hasCycle) {
        throw new AppException({
          code: ErrorCode.BUSINESS_RULE_REPORTING_CYCLE,
          message: `Penugasan ditolak: terdeteksi siklus pelaporan hierarki melingkar (${cycleResult.cyclePath.join(' -> ')}).`,
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          details: [
            {
              field: 'directManagerId',
              issue: `Reporting loop detected: ${cycleResult.cyclePath.join(' -> ')}`,
            },
          ],
        });
      }
    }

    const effectiveDate = new Date(dto.effectiveDate);

    // Eksekusi Effective-Dating dalam Satu Transaksi (WP-EP03-TK002)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Cari penugasan aktif sebelumnya yang bersinggungan
      const activeAssignments = await tx.organizationalAssignment.findMany({
        where: {
          userId: dto.userId,
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
      });

      // 2. Tutup penugasan lama (set endDate = effectiveDate - 1 hari)
      for (const oldAssignment of activeAssignments) {
        const closingDate = new Date(effectiveDate);
        closingDate.setDate(closingDate.getDate() - 1);

        const safeClosingDate =
          closingDate >= oldAssignment.effectiveDate
            ? closingDate
            : oldAssignment.effectiveDate;

        await tx.organizationalAssignment.update({
          where: { id: oldAssignment.id },
          data: {
            endDate: safeClosingDate,
            updatedAt: new Date(),
          },
        });
      }

      // 3. Masukkan baris penugasan baru
      const newAssignment = await tx.organizationalAssignment.create({
        data: {
          userId: dto.userId,
          jobTitle: dto.jobTitle.trim(),
          role: dto.role,
          function: dto.function,
          directManagerId: dto.directManagerId || null,
          effectiveDate,
          assignmentReason: dto.assignmentReason.trim(),
          createdByUserId: adminUserId,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          directManager: { select: { id: true, fullName: true, email: true } },
        },
      });

      return newAssignment;
    });
  }

  async getUserActiveAssignment(userId: string, targetDate = new Date()) {
    const dateOnly = toJakartaDateOnly(targetDate);
    return await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId,
        effectiveDate: { lte: dateOnly },
        OR: [{ endDate: null }, { endDate: { gte: dateOnly } }],
      },
      orderBy: { effectiveDate: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        directManager: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async listAssignments(options: {
    page?: number;
    limit?: number;
    function?: CanonicalFunction;
    role?: CanonicalRole;
    activeOnly?: boolean;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.function) where.function = options.function;
    if (options.role) where.role = options.role;
    if (options.activeOnly) {
      const today = toJakartaDateOnly();
      where.effectiveDate = { lte: today };
      where.OR = [{ endDate: null }, { endDate: { gte: today } }];
    }

    const [totalRecords, data] = await Promise.all([
      this.prisma.organizationalAssignment.count({ where }),
      this.prisma.organizationalAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { effectiveDate: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, status: true } },
          directManager: { select: { id: true, fullName: true, email: true } },
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

  async listActiveUsers(): Promise<Array<{
    id: string;
    fullName: string;
    email: string;
    jobTitle?: string | null;
    role?: CanonicalRole | null;
    function?: CanonicalFunction | null;
    directManagerId?: string | null;
  }>> {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        fullName: true,
        email: true,
        orgAssignments: {
          where: { endDate: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            jobTitle: true,
            role: true,
            function: true,
            directManagerId: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      jobTitle: u.orgAssignments?.[0]?.jobTitle || null,
      role: u.orgAssignments?.[0]?.role || null,
      function: u.orgAssignments?.[0]?.function || null,
      directManagerId: u.orgAssignments?.[0]?.directManagerId || null,
    }));
  }
}

