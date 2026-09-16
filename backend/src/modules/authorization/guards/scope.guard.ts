import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  REQUIRE_SCOPE_KEY,
  type RequireScopeOptions,
} from '../decorators/require-scope.decorator.js';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator.js';
import { ScopeResolverService } from '../services/scope-resolver.service.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly scopeResolverService: ScopeResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const options = this.reflector.getAllAndOverride<RequireScopeOptions>(
      REQUIRE_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as CurrentUserPayload | undefined;

    if (!user) {
      throw new UnauthenticatedException(
        'Konteks pengguna tidak ditemukan pada request',
      );
    }

    const idParam = options.idParam || 'id';
    const idSource = options.idSource || 'param';

    let resourceId: string | undefined;
    if (idSource === 'param') {
      const raw = request.params?.[idParam];
      resourceId = Array.isArray(raw) ? raw[0] : raw;
    } else if (idSource === 'body') {
      resourceId = (request.body as any)?.[idParam];
    } else if (idSource === 'query') {
      const raw = request.query?.[idParam];
      resourceId = Array.isArray(raw)
        ? (raw[0] as string | undefined)
        : (raw as string | undefined);
    }

    if (!resourceId) {
      throw new ForbiddenException(
        `Identifikasi sumber daya (${idParam}) tidak ditemukan pada request`,
      );
    }

    const isAuthorized = await this.scopeResolverService.checkScope({
      user,
      resourceId,
      resourceType: options.resourceType,
      executionContext: context,
    });

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak akses (scope) terhadap sumber daya ini',
      );
    }

    return true;
  }
}
