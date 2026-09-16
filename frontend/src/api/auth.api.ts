import { apiClient } from './client.js';
import type {
  AuthUser,
  LoginCredentials,
  LoginResponseData,
  ResetPasswordPayload,
} from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const authApi = {
  /**
   * Autentikasi pengguna, menghasilkan session dan cookie (SAD §10.1).
   */
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<LoginResponseData>> {
    return apiClient.post<LoginResponseData>('auth/login', credentials);
  },

  /**
   * Mengambil data pengguna aktif dari sesi saat ini (SAD §10.1).
   */
  async getMe(): Promise<ApiResponse<AuthUser>> {
    return apiClient.get<AuthUser>('auth/me');
  },

  /**
   * Mencabut sesi aktif pengguna (SAD §10.1).
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('auth/logout');
  },

  /**
   * Mengubah password akun sendiri / reset password wajib (SAD §10.1).
   */
  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('auth/reset-password', payload);
  },
};
