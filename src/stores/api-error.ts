import type { AxiosError } from 'axios';

import type { Error as OpenApiError } from '@openapi/index.schemas';

// Re-exported with a distinct name to avoid conflict with the JS built-in Error.
type ApiError = OpenApiError;

const toApiError = (err: unknown): ApiError => {
  const axiosErr = err as AxiosError<ApiError>;
  if (axiosErr.response?.data && typeof axiosErr.response.data === 'object' && 'code' in axiosErr.response.data) {
    return axiosErr.response.data;
  }
  return { id: 'unknown', code: 'UNKNOWN_ERROR', message: String(err) };
};

export { toApiError };
export type { ApiError };
