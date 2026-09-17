import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type { CreateBlockerPayload, Blocker } from '../types/daily-records.js';

export interface BlockerOwnerOption {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  function?: string;
}

export const blockersApi = {
  /**
   * POST /api/v1/blockers
   */
  async createBlocker(payload: CreateBlockerPayload): Promise<ApiResponse<Blocker>> {
    return apiClient.post<Blocker>('/blockers', payload);
  },

  /**
   * GET /api/v1/users (untuk dropdown owner blocker)
   */
  async getPotentialOwners(): Promise<ApiResponse<{ users: BlockerOwnerOption[] }>> {
    return apiClient.get<{ users: BlockerOwnerOption[] }>('/users?limit=100&status=Active');
  },
};
