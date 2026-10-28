import { SetMetadata } from '@nestjs/common';
import { CanonicalRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (CanonicalRole | string)[]) =>
  SetMetadata(ROLES_KEY, roles);

