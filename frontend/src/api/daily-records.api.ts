import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  DailyAccountabilityRecord,
  MorningCheckinPayload,
  EodCheckinPayload,
  ConfirmOverridePayload,
  AdditionalWorkPayload,
  CorrectionRequestPayload,
} from '../types/daily-records.js';

export interface QueryDailyRecordsParams {
  startDate?: string;
  endDate?: string;
  employeeUserId?: string;
  limit?: number;
  offset?: number;
}

export const dailyRecordsApi = {
  /**
   * GET /api/v1/daily-accountability-records/today
   */
  async getTodayRecord(): Promise<ApiResponse<DailyAccountabilityRecord | null>> {
    return apiClient.get<DailyAccountabilityRecord | null>(
      '/daily-accountability-records/today',
    );
  },

  /**
   * POST /api/v1/daily-accountability-records/morning-checkin
   */
  async submitMorningCheckin(
    payload: MorningCheckinPayload,
  ): Promise<ApiResponse<DailyAccountabilityRecord>> {
    return apiClient.post<DailyAccountabilityRecord>(
      '/daily-accountability-records/morning-checkin',
      payload,
    );
  },

  /**
   * POST /api/v1/daily-accountability-records/:id/eod-checkin
   */
  async submitEodCheckin(
    id: string,
    payload: EodCheckinPayload,
  ): Promise<ApiResponse<DailyAccountabilityRecord>> {
    return apiClient.post<DailyAccountabilityRecord>(
      `/daily-accountability-records/${id}/eod-checkin`,
      payload,
    );
  },

  /**
   * POST /api/v1/daily-accountability-records/:id/eod-checkin/confirm-override
   */
  async confirmOverride(
    id: string,
    payload: ConfirmOverridePayload,
  ): Promise<ApiResponse<DailyAccountabilityRecord>> {
    return apiClient.post<DailyAccountabilityRecord>(
      `/daily-accountability-records/${id}/eod-checkin/confirm-override`,
      payload,
    );
  },

  /**
   * POST /api/v1/additional-work
   */
  async createAdditionalWork(
    payload: AdditionalWorkPayload,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.post('/additional-work', payload);
  },

  /**
   * POST /api/v1/commitments/:id/request-correction
   */
  async requestCorrection(
    payload: CorrectionRequestPayload,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.post(
      `/commitments/${payload.commitmentId}/request-correction`,
      {
        proposedDescription: payload.proposedDescription,
        reason: payload.reason,
      },
    );
  },

  /**
   * GET /api/v1/daily-accountability-records
   */
  async getDailyRecords(
    params?: QueryDailyRecordsParams,
  ): Promise<ApiResponse<{ items: DailyAccountabilityRecord[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.employeeUserId) searchParams.set('employeeUserId', params.employeeUserId);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));

    const qs = searchParams.toString();
    return apiClient.get<{ items: DailyAccountabilityRecord[]; total: number }>(
      `/daily-accountability-records${qs ? `?${qs}` : ''}`,
    );
  },
};
