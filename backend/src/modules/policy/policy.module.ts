import { Module } from '@nestjs/common';
import {
  PolicyController,
  PolicyOwnerAssignmentController,
} from './policy.controller.js';
import { PolicyService } from './policy.service.js';
import { PolicyValueValidator } from './services/policy-value.validator.js';
import { PolicyOwnerGuard } from './guards/policy-owner.guard.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [AuditModule],
  controllers: [PolicyController, PolicyOwnerAssignmentController],
  providers: [PolicyService, PolicyOwnerGuard, PolicyValueValidator],
  exports: [PolicyService, PolicyOwnerGuard, PolicyValueValidator],
})
export class PolicyModule {}
