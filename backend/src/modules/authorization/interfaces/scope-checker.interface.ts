import type { ExecutionContext } from '@nestjs/common';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';

export interface ScopeCheckContext {
  user: CurrentUserPayload;
  resourceId: string;
  resourceType: string;
  executionContext: ExecutionContext;
  additionalParams?: Record<string, unknown>;
}

/**
 * Interface untuk delegasi verifikasi scope ke service module pemilik entity (SAD §8.8).
 */
export interface ResourceScopeChecker {
  /**
   * Mengembalikan true jika pengguna berwenang mengakses record tersebut, false jika tidak.
   */
  checkScope(ctx: ScopeCheckContext): Promise<boolean>;
}
