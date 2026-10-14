import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  DailyAccountabilityRecord,
  TodayRecordResponse,
  MorningCheckinPayload,
  EodCheckinPayload,
  ConfirmOverridePayload,
  AdditionalWorkPayload,
  CorrectionRequestPayload,
} from '../types/daily-records.js';

export interface QueryDailyRecordsParams {
  date?: string;
  scope?: string;
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
  async getTodayRecord(): Promise<ApiResponse<TodayRecordResponse>> {
    return apiClient.get<TodayRecordResponse>(
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
   * POST /api/v1/correction-requests (SAD §10.5, §9.6, FR-43)
   */
  async requestCorrection(
    payload: CorrectionRequestPayload,
  ): Promise<ApiResponse<unknown>> {
    const targetCommitmentId = payload.targetCommitmentId || payload.commitmentId || '';
    const requestedChange =
      payload.requestedChange ||
      (payload.proposedDescription ? { text: payload.proposedDescription } : {});

    return apiClient.post('/correction-requests', {
      targetCommitmentId,
      requestedChange,
      reason: payload.reason,
    });
  },

  /**
   * GET /api/v1/daily-accountability-records
   */
  async getDailyRecords(
    params?: QueryDailyRecordsParams,
  ): Promise<ApiResponse<{ items: DailyAccountabilityRecord[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.date) {
      searchParams.set('startDate', params.date);
      searchParams.set('endDate', params.date);
    }
    if (params?.scope) searchParams.set('scope', params.scope);
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
