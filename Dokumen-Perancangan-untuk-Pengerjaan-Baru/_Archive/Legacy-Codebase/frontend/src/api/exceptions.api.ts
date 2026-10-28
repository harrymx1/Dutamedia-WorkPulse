import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  ExceptionItem,
  CreateLeavePayload,
  CreateHolidayPayload,
  CreateExemptionPayload,
  RejectLeavePayload,
} from '../types/management.js';

export interface QueryExceptionsParams {
  userId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const exceptionsApi = {
  /**
   * GET /api/v1/exceptions (SAD §10.6, EPIC-10-T2)
   */
  async getExceptions(
    params: QueryExceptionsParams = {},
  ): Promise<ApiResponse<{ exceptions: ExceptionItem[]; total: number }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ exceptions: ExceptionItem[]; total: number }>(`/exceptions${qs}`);
  },

  /**
   * GET /api/v1/exceptions/:id (SAD §10.6, EPIC-10-T2)
   */
  async getExceptionById(id: string): Promise<ApiResponse<ExceptionItem>> {
    return apiClient.get<ExceptionItem>(`/exceptions/${id}`);
  },

  /**
   * POST /api/v1/exceptions/leave (SAD §10.6, FR-47, EPIC-10-T1)
   */
  async createLeave(payload: CreateLeavePayload): Promise<ApiResponse<ExceptionItem>> {
    return apiClient.post<ExceptionItem>('/exceptions/leave', payload);
  },

  /**
   * POST /api/v1/exceptions/holiday (SAD §10.6, BR-18, EPIC-10-T1)
   */
  async createHoliday(payload: CreateHolidayPayload): Promise<ApiResponse<ExceptionItem>> {
    return apiClient.post<ExceptionItem>('/exceptions/holiday', payload);
  },

  /**
   * POST /api/v1/exceptions/exemption (SAD §10.6, BR-18, EPIC-10-T1)
   */
  async createExemption(payload: CreateExemptionPayload): Promise<ApiResponse<ExceptionItem>> {
    return apiClient.post<ExceptionItem>('/exceptions/exemption', payload);
  },

  /**
   * POST /api/v1/exceptions/:id/approve (SAD §10.6, EPIC-10-T3)
   */
  async approveLeave(id: string): Promise<ApiResponse<ExceptionItem>> {
    return apiClient.post<ExceptionItem>(`/exceptions/${id}/approve`);
  },

  /**
   * POST /api/v1/exceptions/:id/reject (SAD §10.6, EPIC-10-T3)
   */
  async rejectLeave(id: string, payload: RejectLeavePayload): Promise<ApiResponse<ExceptionItem>> {
    return apiClient.post<ExceptionItem>(`/exceptions/${id}/reject`, payload);
  },
};
