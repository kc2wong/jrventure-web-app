import { context, propagation } from '@opentelemetry/api';

import { delay } from '@utils/date-util';
import { runWithDefaultSpan } from '@utils/tracing';
import type { _Error as Error } from '@webapi/';

import { createSystemError } from './error-util';
import { client } from '../__generated__/linkedup-web-api-client/client.gen';

client.setConfig({
  baseURL: import.meta.env.VITE_REACT_APP_WEB_API_URL,
  withCredentials: true,
});

let currentAuthorizationToken: string | undefined;
let currentTraceHeaders: Record<string, string> = {};

const setRequestHeaders = (authorizationToken?: string, traceCtx?: unknown) => {
  currentAuthorizationToken = authorizationToken;

  // If a context is provided, inject trace headers into currentTraceHeaders
  if (traceCtx) {
    currentTraceHeaders = {};
    propagation.inject(traceCtx as any, currentTraceHeaders);
  } else {
    currentTraceHeaders = {};
  }
};

client.instance.interceptors.request.use((config) => {
  // Inject trace headers from currentTraceHeaders
  for (const [key, value] of Object.entries(currentTraceHeaders)) {
    if (config.headers instanceof Headers) {
      config.headers.set(key, value);
    } else {
      config.headers[key] = value;
    }
  }

  // Inject Authorization header if present
  if (currentAuthorizationToken) {
    if (config.headers instanceof Headers) {
      config.headers.set('Authorization', `Bearer ${currentAuthorizationToken}`);
    } else {
      config.headers['Authorization'] = `Bearer ${currentAuthorizationToken}`;
    }
  }

  return config;
});

const minDurationMs = 300;

export const callRepo = async <T>(
  repoCall: () => Promise<{ data?: T; error?: any }>,
  authorizationToken?: string,
): Promise<T | Error> => {
  return runWithDefaultSpan(async () => {
    setRequestHeaders(authorizationToken, context.active());

    const startTime = Date.now();

    const { data, error } = await repoCall();

    const endTime = Date.now();
    const elapsed = endTime - startTime;
    if (elapsed < minDurationMs) {
      await delay(minDurationMs - elapsed);
    }

    if (error) {
      return createSystemError(error);
    }
    if (data === undefined) {
      throw new Error('Unexpected: No error, but data is undefined');
    }
    return data;
  });
};
