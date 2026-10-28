import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_ROLE,
        message: 'Akses ditolak. Anda tidak memiliki peran yang berwenang.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_ROLE,
        message: `Akses ditolak. Rute ini memerlukan salah satu dari peran: ${requiredRoles.join(', ')}. Peran Anda: ${user.role}.`,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}

