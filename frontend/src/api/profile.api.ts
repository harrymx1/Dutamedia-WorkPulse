import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type { UserProfile, ResetPasswordPayload, PolicyItem } from '../types/profile.js';

export const profileApi = {
  /**
   * GET /api/v1/auth/me
   */
  async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/auth/me');
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  async changePassword(payload: ResetPasswordPayload): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/reset-password', payload);
  },

  /**
   * GET /api/v1/policies
   */
  async getActivePolicies(): Promise<ApiResponse<PolicyItem[]>> {
    return apiClient.get<PolicyItem[]>('/policies');
  },
};
