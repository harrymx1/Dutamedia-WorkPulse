import type { paths, operations } from './schema.js';

export type { paths, operations };

export type ApiPaths = paths;
export type ApiOperations = operations;

// Helper generic untuk response data dari operationId
export type OperationResponse<T extends keyof operations> =
  operations[T] extends { responses: { 200: { content: { 'application/json': infer R } } } }
    ? R
    : operations[T] extends { responses: { 201: { content: { 'application/json': infer R } } } }
      ? R
      : operations[T] extends { responses: { 204: unknown } }
        ? void
        : unknown;

// Helper generic untuk request body dari operationId
export type OperationRequestBody<T extends keyof operations> =
  operations[T] extends { requestBody: { content: { 'application/json': infer B } } }
    ? B
    : operations[T] extends { requestBody?: { content: { 'application/json': infer B } } }
      ? B
      : undefined;

// Helper generic untuk query parameters dari operationId
export type OperationQueryParams<T extends keyof operations> =
  operations[T] extends { parameters: { query: infer Q } }
    ? Q
    : operations[T] extends { parameters?: { query?: infer Q } }
      ? Q
      : undefined;
