import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ForbiddenException } from '../../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';

@Injectable()
export class ScopeFilterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengembalikan daftar userId yang berada dalam cakupan (scope) user saat ini
   * berdasarkan peran dan tanggal efektif (SAD §8.11).
   *
   * Nilai balik:
   * - string[]: Kumpulan ID spesifik yang boleh diakses (Employee, Supervisor, Head).
   * - null: Bebas filter / company-wide (HRGA, CEO_Management).
   * - Throws ForbiddenException: Jika SystemAdmin mencoba mengakses data operasional.
   */
  async getAccessibleUserIds(
    user: CurrentUserPayload,
    asOfDate: Date = new Date(),
  ): Promise<string[] | null> {
    if (!user || !user.role) {
      throw new ForbiddenException('Konteks peran pengguna tidak ditemukan');
    }

    // SAD §8.11: SystemAdmin tidak berlaku untuk data operasional
    if (user.role === Role.SystemAdmin) {
      throw new ForbiddenException(
        'SystemAdmin tidak memiliki kewenangan mengakses data operasional (SAD §8.11)',
      );
    }

    // HRGA & CEO_Management memiliki akses operasional lintas perusahaan (PRD §7)
    if (user.role === Role.HRGA || user.role === Role.CEO_Management) {
      return null;
    }

    // Employee hanya boleh mengakses record miliknya sendiri
    if (user.role === Role.Employee) {
      return [user.userId];
    }

    // Supervisor_TL boleh mengakses data dirinya dan seluruh subordinat langsungnya (effective-dated)
    if (user.role === Role.Supervisor_TL) {
      const subordinates =
        await this.prisma.organizationalAssignment.findMany({
          where: {
            directManagerId: user.userId,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          select: { userId: true },
        });

      const subordinateIds = subordinates.map((s) => s.userId);
      return Array.from(new Set([user.userId, ...subordinateIds]));
    }

    // Head boleh mengakses seluruh data anggota dalam fungsi organisasinya
    if (user.role === Role.Head) {
      if (!user.function) {
        return [user.userId];
      }

      const functionMembers =
        await this.prisma.organizationalAssignment.findMany({
          where: {
            function: user.function,
            effectiveDate: { lte: asOfDate },
            OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
          },
          select: { userId: true },
        });

      const memberIds = functionMembers.map((m) => m.userId);
      return Array.from(new Set([user.userId, ...memberIds]));
    }

    // PM (Project Manager): default ke dirinya sendiri untuk query berbasis employee
    if (user.role === Role.PM) {
      return [user.userId];
    }

    return [user.userId];
  }

  /**
   * Helper query builder untuk endpoint list: menghasilkan klausul Prisma `where`
   * untuk field tertentu (default: 'employeeUserId') sesuai SAD §8.11.
   */
  async buildScopeFilter(
    user: CurrentUserPayload,
    fieldName: string = 'employeeUserId',
    asOfDate: Date = new Date(),
  ): Promise<Record<string, unknown>> {
    const accessibleIds = await this.getAccessibleUserIds(user, asOfDate);

    // null = company-wide (tidak ada filter pembatas pada fieldName)
    if (accessibleIds === null) {
      return {};
    }

    if (accessibleIds.length === 1) {
      return { [fieldName]: accessibleIds[0] };
    }

    return {
      [fieldName]: {
        in: accessibleIds,
      },
    };
  }

  /**
   * Memeriksa apakah targetUserId berada di dalam cakupan user saat ini (SAD §8.11).
   */
  async isUserInScope(
    user: CurrentUserPayload,
    targetUserId: string,
    asOfDate: Date = new Date(),
  ): Promise<boolean> {
    if (user.userId === targetUserId) {
      return true;
    }

    const accessibleIds = await this.getAccessibleUserIds(user, asOfDate);

    if (accessibleIds === null) {
      return true;
    }

    return accessibleIds.includes(targetUserId);
  }
}
