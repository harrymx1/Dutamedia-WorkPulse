import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './guards/role.guard.js';
import { ScopeGuard } from './guards/scope.guard.js';
import { ScopeResolverService } from './services/scope-resolver.service.js';
import { ProjectAuthorityService } from './services/project-authority.service.js';
import { ScopeFilterService } from './services/scope-filter.service.js';
import { IdentityModule } from '../identity/identity.module.js';

@Global()
@Module({
  imports: [IdentityModule],
  providers: [
    ScopeResolverService,
    ProjectAuthorityService,
    ScopeFilterService,
    RoleGuard,
    ScopeGuard,
    // Urutan eksekusi global guard: AuthGuard -> CsrfGuard -> RoleGuard -> ScopeGuard (SAD §8.8)
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopeGuard,
    },
  ],
  exports: [
    ScopeResolverService,
    ProjectAuthorityService,
    ScopeFilterService,
    RoleGuard,
    ScopeGuard,
  ],
})
export class AuthorizationModule {}
