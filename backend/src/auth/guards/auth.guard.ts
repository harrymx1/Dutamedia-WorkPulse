import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../services/token.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { PrismaService } from '../../prisma/prisma.service';
import { toJakartaDateOnly } from '../../common/time/date-only.util';
import { ensurePolicyOwnersBaselineSynced } from '../../policy/policy-owner-sync.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token =
      request.cookies?.['access_token'] ||
      this.extractBearerToken(request.headers?.['authorization']);

    if (!token) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Sesi tidak ditemukan atau telah berakhir. Silakan login kembali.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    let payload: any;
    try {
      payload = this.tokenService.verifyAccessToken(token);
    } catch {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Token autentikasi tidak valid atau telah kedaluwarsa.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    // Verifikasi validitas sesi di basis data secara real-time
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      new Date(session.expiresAt) <= new Date()
    ) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Sesi telah dicabut atau tidak berlaku.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (session.user.status !== 'ACTIVE') {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Akun Anda dinonaktifkan. Hubungi administrator.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    let activeOrg: any = null;
    const today = toJakartaDateOnly();
    if (this.prisma.organizationalAssignment?.findFirst) {
      activeOrg = await this.prisma.organizationalAssignment.findFirst({
        where: {
          userId: session.user.id,
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        },
        orderBy: { effectiveDate: 'desc' },
        include: {
          directManager: { select: { fullName: true } },
        },
      });
    }

    const subordinateCount = this.prisma.organizationalAssignment?.count
      ? await this.prisma.organizationalAssignment.count({
          where: {
            directManagerId: session.user.id,
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        })
      : 0;

    const tempReviewerCount = this.prisma.temporaryReviewerAssignment?.count
      ? await this.prisma.temporaryReviewerAssignment.count({
          where: {
            delegateUserId: session.user.id,
            effectiveDate: { lte: today },
            expiryDate: { gte: today },
          },
        })
      : 0;

    const projectLeadCount = this.prisma.projectAuthorityMapping?.count
      ? await this.prisma.projectAuthorityMapping.count({
          where: {
            projectManagerId: session.user.id,
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        })
      : 0;

    await ensurePolicyOwnersBaselineSynced(this.prisma, today);

    const policyOwnerRecords = this.prisma.policyOwnerAssignment?.findMany
      ? await this.prisma.policyOwnerAssignment.findMany({
          where: {
            userId: session.user.id,
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
          select: { policyCategory: true },
        })
      : [];
    const ownedPolicyCategories = Array.from(
      new Set((policyOwnerRecords || []).map((r: any) => String(r.policyCategory))),
    );

    request.user = {
      ...payload,
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      status: session.user.status,
      role: activeOrg?.role || payload.role || 'EMPLOYEE',
      jobTitle: activeOrg?.jobTitle || null,
      function: activeOrg?.function || null,
      managerName: activeOrg?.directManager?.fullName || null,
      hasSubordinates: subordinateCount > 0,
      isTemporaryReviewer: tempReviewerCount > 0,
      isProjectLead: projectLeadCount > 0,
      isPolicyOwner: ownedPolicyCategories.length > 0,
      ownedPolicyCategories,
    };
    request.sessionId = session.id;

    return true;
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (typeof authHeader !== 'string') return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}

