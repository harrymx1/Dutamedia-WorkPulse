export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ResponseMeta {
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface StandardResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export interface ErrorDetail {
  field?: string;
  reason?: string;
  message?: string;
}

export interface ErrorBody {
  code: string;
  message: string;
  details?: ErrorDetail[];
}

export interface StandardErrorResponse {
  error: ErrorBody;
  meta: {
    timestamp: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
