import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './guards/role.guard.js';
import { ProjectAuthorityService } from './services/project-authority.service.js';
import { ScopeFilterService } from './services/scope-filter.service.js';
import { IdentityModule } from '../identity/identity.module.js';

@Global()
@Module({
  imports: [IdentityModule],
  providers: [
    ProjectAuthorityService,
    ScopeFilterService,
    RoleGuard,
    // Urutan eksekusi global guard: AuthGuard -> CsrfGuard -> RoleGuard (SAD §8.8)
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [
    ProjectAuthorityService,
    ScopeFilterService,
    RoleGuard,
  ],
})
export class AuthorizationModule {}
