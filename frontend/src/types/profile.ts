import type { Role } from './auth.js';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  role: Role | null;
  function: string | null;
  directManagerId: string | null;
  directManagerName?: string | null;
  mustResetPassword: boolean;
  permissionsSummary?: {
    projectAuthorities: Array<{
      id: string;
      projectScope: string;
      role: string;
    }>;
    temporaryReviewerScopes: string[];
  };
}

export interface ResetPasswordPayload {
  oldPassword?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface PolicyItem {
  id: string;
  category: string;
  policyKey: string;
  policyValue: Record<string, unknown> | string | number | boolean;
  version: number;
  effectiveDate: string;
}
