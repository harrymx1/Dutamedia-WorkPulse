import { ApiError } from '../types/api.js';
import type { ApiResponse, ApiErrorResponse } from '../types/api.js';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let onUnauthorizedHandler: (() => void) | null = null;

/**
 * Mendaftarkan callback saat backend mengembalikan 401 (SAD §17.2).
 */
export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorizedHandler = handler;
}

/**
 * Membaca nilai cookie berdasarkan nama (SAD §8.5).
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2] ?? '') : null;
}

/**
 * Wrapper request HTTP dasar dengan credentials: 'include', CSRF token, dan 401 interceptor.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers = new Headers(options.headers || {});

  // Default content type JSON jika ada body
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // Double Submit Cookie Pattern: Kirim X-CSRF-Token untuk state-changing request (SAD §8.5)
  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isStateChanging) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Wajib untuk cross-origin HttpOnly Cookie (SAD §16.2, §17.2)
  };

  try {
    const response = await fetch(url, config);

    // Penanganan global 401 UNAUTHENTICATED (SAD §17.2)
    if (response.status === 401) {
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler();
      }
    }

    // Jika response tidak ok, parse structured error
    if (!response.ok) {
      let errorPayload: ApiErrorResponse | null = null;
      try {
        errorPayload = (await response.json()) as ApiErrorResponse;
      } catch {
        // Body bukan JSON
      }

      const code = errorPayload?.error?.code || 'HTTP_ERROR';
      const message =
        errorPayload?.error?.message ||
        `Request gagal dengan status ${response.status} (${response.statusText})`;
      const details = errorPayload?.error?.details;

      throw new ApiError(response.status, code, message, details);
    }

    // Parse standard response envelope
    const data = (await response.json()) as ApiResponse<T>;
    return data;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : 'Koneksi jaringan gagal';
    throw new ApiError(0, 'NETWORK_ERROR', message);
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
