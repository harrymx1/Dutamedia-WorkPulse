import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SCOPE_KEY = 'requireScope';

export interface RequireScopeOptions {
  /**
   * Nama entitas sumber daya (mis. 'DailyAccountabilityRecord', 'Blocker', 'CorrectionRequest')
   */
  resourceType: string;

  /**
   * Nama parameter ID pada request (default: 'id')
   */
  idParam?: string;

  /**
   * Lokasi pengambilan ID dari request: 'param' | 'body' | 'query' (default: 'param')
   */
  idSource?: 'param' | 'body' | 'query';
}

/**
 * Decorator untuk mengaktifkan validasi ScopeGuard pada endpoint (SAD §8.8).
 */
export const RequireScope = (options: RequireScopeOptions) =>
  SetMetadata(REQUIRE_SCOPE_KEY, options);
