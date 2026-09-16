import { Injectable, Logger } from '@nestjs/common';
import type {
  ResourceScopeChecker,
  ScopeCheckContext,
} from '../interfaces/scope-checker.interface.js';

@Injectable()
export class ScopeResolverService {
  private readonly logger = new Logger(ScopeResolverService.name);
  private readonly checkers = new Map<string, ResourceScopeChecker>();

  /**
   * Mendaftarkan checker spesifik untuk suatu tipe entitas domain (SAD §8.8).
   */
  registerChecker(resourceType: string, checker: ResourceScopeChecker): void {
    this.checkers.set(resourceType, checker);
    this.logger.debug(`Scope checker terdaftar untuk entitas: ${resourceType}`);
  }

  /**
   * Mengeksekusi verifikasi scope dengan mendelegasikan ke checker yang sesuai.
   */
  async checkScope(ctx: ScopeCheckContext): Promise<boolean> {
    const checker = this.checkers.get(ctx.resourceType);

    if (!checker) {
      this.logger.warn(
        `Tidak ada scope checker terdaftar untuk entitas '${ctx.resourceType}'. Akses ditolak secara aman.`,
      );
      return false;
    }

    return checker.checkScope(ctx);
  }
}
