/**
 * Type definitions untuk IdentityModule & Admin Workspace (SAD §10.2, §5.3, EPIC-04)
 */

import type { Role } from './auth.js';

export type UserStatus = 'Active' | 'Inactive';

export interface OrganizationalAssignment {
  id: string;
  userId: string;
  role: Role;
  function: string;
  directManagerId: string | null;
  effectiveDate: string;
  endDate: string | null;
  createdByUserId: string;
  createdAt: string;
  directManager?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  mustResetPassword: boolean;
  createdAt: string;
  updatedAt: string;
  activeAssignment?: OrganizationalAssignment | null;
}

export interface QueryUsersParams {
  page?: number;
  pageSize?: number;
  status?: UserStatus;
  role?: Role;
  function?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsersResult {
  items: UserItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  initialRole: Role;
  function: string;
  directManagerId?: string | null;
  effectiveDate: string;
}

export interface CreateUserResponseData {
  user: UserItem;
  assignment: OrganizationalAssignment;
  temporaryPassword: string;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface CreateOrgAssignmentPayload {
  userId: string;
  role: Role;
  function: string;
  directManagerId?: string | null;
  effectiveDate: string;
}

export interface ProjectAuthorityMappingItem {
  id: string;
  userId: string;
  scopeReference: string;
  effectiveDate: string;
  endDate: string | null;
  createdByUserId: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateProjectAuthorityPayload {
  userId: string;
  scopeReference: string;
  effectiveDate: string;
  endDate?: string;
}

export interface UpdateProjectAuthorityPayload {
  endDate: string;
}

export interface TemporaryReviewerAssignmentItem {
  id: string;
  reviewerUserId: string;
  scope: string;
  reason?: string | null;
  effectiveDate: string;
  expiryDate: string;
  createdByUserId: string;
  createdAt: string;
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateTempReviewerPayload {
  reviewerUserId: string;
  scope: string;
  reason?: string;
  effectiveDate: string;
  expiryDate: string;
}

export interface QueryTempReviewersParams {
  scope?: string;
  activeOnly?: boolean;
}

