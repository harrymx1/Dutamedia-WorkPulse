import { Global, Module } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { ProjectAuthorityService } from './services/project-authority.service';
import { TemporaryReviewerService } from './services/temporary-reviewer.service';
import { ScopeResolverService } from './services/scope-resolver.service';
import { OrganizationController } from './controllers/organization.controller';
import { ProjectAuthorityController } from './controllers/project-authority.controller';
import { TemporaryReviewerController } from './controllers/temporary-reviewer.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [
    OrganizationController,
    ProjectAuthorityController,
    TemporaryReviewerController,
  ],
  providers: [
    OrganizationService,
    ProjectAuthorityService,
    TemporaryReviewerService,
    ScopeResolverService,
  ],
  exports: [
    OrganizationService,
    ProjectAuthorityService,
    TemporaryReviewerService,
    ScopeResolverService,
  ],
})
export class OrganizationModule {}

