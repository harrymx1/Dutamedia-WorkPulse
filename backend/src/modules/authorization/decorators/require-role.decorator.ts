import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator untuk menentukan daftar peran (Role) yang diizinkan mengakses endpoint (SAD §8.8).
 */
export const RequireRole = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
