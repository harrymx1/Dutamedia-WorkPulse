export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Array<{ field?: string; issue: string }>;
  statusCode: number;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details: Array<{ field?: string; issue: string }>;
  public readonly statusCode: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.details = payload.details || [];
    this.statusCode = payload.statusCode;
  }
}

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: any }> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Double Submit Cookie: sematkan X-CSRF-Token pada mutasi data
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers.set('X-CSRF-Token', csrf);
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include', // Kirim HttpOnly access_token & csrf_token
  });

  let responseBody: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    const errObj = responseBody?.error || {};
    throw new ApiError({
      code: errObj.code || 'UNKNOWN_ERROR',
      message: errObj.message || responseBody?.message || 'Terjadi kesalahan jaringan atau server.',
      details: errObj.details || [],
      statusCode: response.status,
    });
  }

  // Unpack Standard Success Envelope (SAD IV.2.1)
  if (responseBody && typeof responseBody === 'object' && 'success' in responseBody) {
    return {
      data: responseBody.data,
      meta: responseBody.meta,
    };
  }

  return { data: responseBody };
}

