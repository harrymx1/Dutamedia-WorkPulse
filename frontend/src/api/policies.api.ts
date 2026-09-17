import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  PolicyItem,
  PolicyCategory,
  CreatePolicyPayload,
} from '../types/management.js';

export const policiesApi = {
  /**
   * GET /api/v1/policies (SAD §10.9)
   */
  async getPolicies(category?: PolicyCategory): Promise<ApiResponse<{ policies: PolicyItem[] }>> {
    const qs = category ? `?category=${category}` : '';
    return apiClient.get<{ policies: PolicyItem[] }>(`/policies${qs}`);
  },

  /**
   * POST /api/v1/policies (SAD §8.10, §10.9)
   */
  async createPolicy(payload: CreatePolicyPayload): Promise<ApiResponse<PolicyItem>> {
    return apiClient.post<PolicyItem>('/policies', payload);
  },

  /**
   * GET /api/v1/policies/:category/history (SAD §10.9)
   */
  async getPolicyHistory(category: PolicyCategory): Promise<ApiResponse<{ history: PolicyItem[] }>> {
    return apiClient.get<{ history: PolicyItem[] }>(`/policies/${category}/history`);
  },
};
