export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiMeta {
  timestamp: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  reason: string;
  [key: string]: unknown;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
  meta: {
    timestamp: string;
  };
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  public readonly statusCode: number;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
