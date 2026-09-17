import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  ManagerNoteItem,
  CreateManagerNotePayload,
} from '../types/management.js';

export interface QueryManagerNotesParams {
  targetUserId?: string;
  category?: string;
  scope?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const managerNotesApi = {
  /**
   * GET /api/v1/manager-notes (SAD §10.7, BR-14, EPIC-11-T2)
   */
  async getManagerNotes(
    params: QueryManagerNotesParams = {},
  ): Promise<ApiResponse<{ notes: ManagerNoteItem[]; total: number }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ notes: ManagerNoteItem[]; total: number }>(`/manager-notes${qs}`);
  },

  /**
   * GET /api/v1/manager-notes/:id (SAD §10.7)
   */
  async getManagerNoteById(id: string): Promise<ApiResponse<ManagerNoteItem>> {
    return apiClient.get<ManagerNoteItem>(`/manager-notes/${id}`);
  },

  /**
   * POST /api/v1/manager-notes (SAD §10.7, §15.1, BR-14, EPIC-11-T1)
   */
  async createManagerNote(
    payload: CreateManagerNotePayload,
  ): Promise<ApiResponse<ManagerNoteItem>> {
    return apiClient.post<ManagerNoteItem>('/manager-notes', payload);
  },
};
