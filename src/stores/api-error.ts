import type { Error as OpenApiError } from '@openapi/types.gen';

// Re-exported with a distinct name to avoid conflict with the JS built-in Error.
type ApiError = OpenApiError;

export type { ApiError };
