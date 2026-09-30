import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  UserItem,
  QueryUsersParams,
  PaginatedUsersResult,
  CreateUserPayload,
  CreateUserResponseData,
  UpdateUserStatusPayload,
  OrganizationalAssignment,
  CreateOrgAssignmentPayload,
  ProjectAuthorityMappingItem,
  CreateProjectAuthorityPayload,
  UpdateProjectAuthorityPayload,
  TemporaryReviewerAssignmentItem,
  CreateTempReviewerPayload,
  QueryTempReviewersParams,
} from '../types/identity.js';

export const identityApi = {
  /**
   * GET /api/v1/users (SAD §10.2, FR-22)
   */
  async getUsers(params?: QueryUsersParams): Promise<ApiResponse<PaginatedUsersResult>> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page) searchParams.set('page', String(params.page));
      if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params.status) searchParams.set('status', params.status);
      if (params.role) searchParams.set('role', params.role);
      if (params.function) searchParams.set('function', params.function);
      if (params.search) searchParams.set('search', params.search);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    }
    const qs = searchParams.toString();
    return apiClient.get<PaginatedUsersResult>(`/users${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /api/v1/users/:id (SAD §10.2)
   */
  async getUserById(id: string): Promise<ApiResponse<UserItem>> {
    return apiClient.get<UserItem>(`/users/${id}`);
  },

  /**
   * POST /api/v1/users (SAD §10.2, FR-22, FR-50)
   */
  async createUser(payload: CreateUserPayload): Promise<ApiResponse<CreateUserResponseData>> {
    return apiClient.post<CreateUserResponseData>('/users', payload);
  },

  /**
   * PATCH /api/v1/users/:id (SAD §10.2, FR-22)
   */
  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload,
  ): Promise<ApiResponse<UserItem>> {
    return apiClient.patch<UserItem>(`/users/${id}`, payload);
  },

  /**
   * GET /api/v1/users/:id/organizational-assignments (SAD §10.2)
   */
  async getOrganizationalAssignments(
    userId: string,
  ): Promise<ApiResponse<OrganizationalAssignment[]>> {
    return apiClient.get<OrganizationalAssignment[]>(
      `/users/${userId}/organizational-assignments`,
    );
  },

  /**
   * POST /api/v1/organizational-assignments (SAD §10.2, BR-10)
   */
  async createOrganizationalAssignment(
    payload: CreateOrgAssignmentPayload,
  ): Promise<ApiResponse<OrganizationalAssignment>> {
    return apiClient.post<OrganizationalAssignment>('/organizational-assignments', payload);
  },

  /**
   * POST /api/v1/project-authority-mappings (SAD §10.2)
   */
  async createProjectAuthorityMapping(
    payload: CreateProjectAuthorityPayload,
  ): Promise<ApiResponse<ProjectAuthorityMappingItem>> {
    return apiClient.post<ProjectAuthorityMappingItem>(
      '/project-authority-mappings',
      payload,
    );
  },

  /**
   * PATCH /api/v1/project-authority-mappings/:id (SAD §10.2)
   */
  async updateProjectAuthorityMapping(
    id: string,
    payload: UpdateProjectAuthorityPayload,
  ): Promise<ApiResponse<ProjectAuthorityMappingItem>> {
    return apiClient.patch<ProjectAuthorityMappingItem>(
      `/project-authority-mappings/${id}`,
      payload,
    );
  },

  /**
   * GET /api/v1/temporary-reviewer-assignments (ADR-002, melengkapi SAD §10.2)
   */
  async getTemporaryReviewerAssignments(
    params?: QueryTempReviewersParams,
  ): Promise<ApiResponse<TemporaryReviewerAssignmentItem[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.scope) searchParams.set('scope', params.scope);
      if (params.activeOnly !== undefined) searchParams.set('activeOnly', String(params.activeOnly));
    }
    const qs = searchParams.toString();
    return apiClient.get<TemporaryReviewerAssignmentItem[]>(
      `/temporary-reviewer-assignments${qs ? `?${qs}` : ''}`,
    );
  },

  /**
   * POST /api/v1/temporary-reviewer-assignments (SAD §10.2, BR-11)
   */
  async createTemporaryReviewerAssignment(
    payload: CreateTempReviewerPayload,
  ): Promise<ApiResponse<TemporaryReviewerAssignmentItem>> {
    return apiClient.post<TemporaryReviewerAssignmentItem>(
      '/temporary-reviewer-assignments',
      payload,
    );
  },
};
