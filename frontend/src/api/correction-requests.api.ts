import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  CorrectionRequestItem,
  ObjectCorrectionPayload,
} from '../types/management.js';

export interface QueryCorrectionRequestsParams {
  userId?: string;
  dailyRecordId?: string;
  status?: string;
  classification?: string;
  scope?: string;
  page?: number;
  limit?: number;
}

export const correctionRequestsApi = {
  /**
   * GET /api/v1/correction-requests (SAD §10.5, EPIC-09-T2/T3)
   */
  async getCorrectionRequests(
    params: QueryCorrectionRequestsParams = {},
  ): Promise<ApiResponse<{ requests: CorrectionRequestItem[]; total: number }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ requests: CorrectionRequestItem[]; total: number }>(`/correction-requests${qs}`);
  },

  /**
   * GET /api/v1/correction-requests/:id (SAD §10.5)
   */
  async getCorrectionRequestById(id: string): Promise<ApiResponse<CorrectionRequestItem>> {
    return apiClient.get<CorrectionRequestItem>(`/correction-requests/${id}`);
  },

  /**
   * POST /api/v1/correction-requests/:id/object (SAD §9.6, §10.5, EPIC-09-T4)
   */
  async objectCorrection(
    id: string,
    payload: ObjectCorrectionPayload,
  ): Promise<ApiResponse<CorrectionRequestItem>> {
    return apiClient.post<CorrectionRequestItem>(`/correction-requests/${id}/object`, payload);
  },
};
