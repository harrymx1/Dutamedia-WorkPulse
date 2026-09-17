import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type { CreateBlockerPayload, Blocker } from '../types/daily-records.js';
import type {
  BlockerItem,
  UpdateBlockerProgressPayload,
  ResolveBlockerPayload,
  AddSupportContributionPayload,
} from '../types/management.js';

export interface BlockerOwnerOption {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  function?: string;
}

export interface QueryBlockersParams {
  status?: string;
  severity?: string;
  authorityType?: string;
  raisedByUserId?: string;
  ownerNeededUserId?: string;
  scope?: string;
  page?: number;
  limit?: number;
}

export const blockersApi = {
  /**
   * POST /api/v1/blockers (SAD §10.4, EPIC-08-T1)
   */
  async createBlocker(payload: CreateBlockerPayload): Promise<ApiResponse<Blocker>> {
    return apiClient.post<Blocker>('/blockers', payload);
  },

  /**
   * GET /api/v1/blockers (SAD §10.4, EPIC-08-T2)
   */
  async getBlockers(params: QueryBlockersParams = {}): Promise<ApiResponse<{ blockers: BlockerItem[]; total: number }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ blockers: BlockerItem[]; total: number }>(`/blockers${queryString}`);
  },

  /**
   * GET /api/v1/blockers/:id (SAD §10.4, EPIC-08-T2)
   */
  async getBlockerById(id: string): Promise<ApiResponse<BlockerItem>> {
    return apiClient.get<BlockerItem>(`/blockers/${id}`);
  },

  /**
   * POST /api/v1/blockers/:id/acknowledge (SAD §10.4, EPIC-08-T3)
   */
  async acknowledge(id: string): Promise<ApiResponse<BlockerItem>> {
    return apiClient.post<BlockerItem>(`/blockers/${id}/acknowledge`);
  },

  /**
   * POST /api/v1/blockers/:id/update (SAD §10.4, EPIC-08-T3)
   */
  async updateProgress(id: string, payload: UpdateBlockerProgressPayload): Promise<ApiResponse<BlockerItem>> {
    return apiClient.post<BlockerItem>(`/blockers/${id}/update`, payload);
  },

  /**
   * POST /api/v1/blockers/:id/resolve (SAD §10.4, EPIC-08-T3)
   */
  async resolve(id: string, payload: ResolveBlockerPayload): Promise<ApiResponse<BlockerItem>> {
    return apiClient.post<BlockerItem>(`/blockers/${id}/resolve`, payload);
  },

  /**
   * POST /api/v1/blockers/:id/accept-risk (SAD §10.4, EPIC-08-T3)
   */
  async acceptRisk(id: string, payload: ResolveBlockerPayload): Promise<ApiResponse<BlockerItem>> {
    return apiClient.post<BlockerItem>(`/blockers/${id}/accept-risk`, payload);
  },

  /**
   * POST /api/v1/blockers/:id/close (SAD §9.4, §10.4, EPIC-08-T3)
   */
  async close(id: string): Promise<ApiResponse<BlockerItem>> {
    return apiClient.post<BlockerItem>(`/blockers/${id}/close`);
  },

  /**
   * POST /api/v1/blockers/:id/support (SAD §10.4, EPIC-08-T4)
   */
  async addSupportContribution(id: string, payload: AddSupportContributionPayload): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(`/blockers/${id}/support`, payload);
  },

  /**
   * GET /api/v1/users (untuk dropdown owner blocker)
   */
  async getPotentialOwners(): Promise<ApiResponse<{ users: BlockerOwnerOption[] }>> {
    return apiClient.get<{ users: BlockerOwnerOption[] }>('/users?limit=100&status=Active');
  },
};
