import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PolicyCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';

@Injectable()
export class PolicyOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as CurrentUserPayload | undefined;

    if (!user || !user.userId) {
      throw new UnauthenticatedException(
        'Konteks pengguna tidak ditemukan pada request',
      );
    }

    // Ambil category dari body, params, atau query
    const rawCategory =
      request.body?.category ||
      request.params?.category ||
      request.query?.category;

    if (!rawCategory || !Object.values(PolicyCategory).includes(rawCategory)) {
      throw new ForbiddenException(
        'Kategori kebijakan tidak valid atau tidak disertakan untuk verifikasi wewenang',
      );
    }

    const targetCategory = rawCategory as PolicyCategory;
    const today = new Date();

    // SAD §8.10: Verifikasi wewenang spesifik kategori pada PolicyOwnerAssignment
    const assignment = await this.prisma.policyOwnerAssignment.findFirst({
      where: {
        userId: user.userId,
        policyCategory: targetCategory,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        `Anda bukan Authorized Policy Owner untuk kategori kebijakan '${targetCategory}' (BR-15)`,
      );
    }

    return true;
  }
}
