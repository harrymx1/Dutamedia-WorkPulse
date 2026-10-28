import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  ComplianceEventItem,
  CoachPayload,
  RecordWarningPayload,
  EscalateFormalPayload,
} from '../types/management.js';

export interface QueryComplianceEventsParams {
  userId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  followUpStatus?: string;
  scope?: string;
  page?: number;
  limit?: number;
}

export const complianceApi = {
  /**
   * GET /api/v1/compliance-events (SAD §10.8, EPIC-12-T3)
   */
  async getComplianceEvents(
    params: QueryComplianceEventsParams = {},
  ): Promise<ApiResponse<{ events: ComplianceEventItem[]; total: number }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ events: ComplianceEventItem[]; total: number }>(`/compliance-events${qs}`);
  },

  /**
   * GET /api/v1/compliance-events/:id (SAD §10.8, EPIC-12-T3)
   */
  async getComplianceEventById(id: string): Promise<ApiResponse<ComplianceEventItem>> {
    return apiClient.get<ComplianceEventItem>(`/compliance-events/${id}`);
  },

  /**
   * POST /api/v1/compliance-events/:id/coach (SAD §9.7, §10.8, EPIC-12-T4)
   */
  async coach(id: string, payload: CoachPayload): Promise<ApiResponse<ComplianceEventItem>> {
    return apiClient.post<ComplianceEventItem>(`/compliance-events/${id}/coach`, payload);
  },

  /**
   * POST /api/v1/compliance-events/:id/record-warning (SAD §9.7, §10.8, EPIC-12-T5)
   */
  async recordWarning(id: string, payload: RecordWarningPayload): Promise<ApiResponse<ComplianceEventItem>> {
    return apiClient.post<ComplianceEventItem>(`/compliance-events/${id}/record-warning`, payload);
  },

  /**
   * POST /api/v1/compliance-events/:id/escalate-formal (SAD §9.7, §10.8, EPIC-12-T5)
   */
  async escalateFormal(id: string, payload: EscalateFormalPayload): Promise<ApiResponse<ComplianceEventItem>> {
    return apiClient.post<ComplianceEventItem>(`/compliance-events/${id}/escalate-formal`, payload);
  },
};
