import { type Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { getSessionContext, tracer } from './otel';

const spanMap = new WeakMap<InternalAxiosRequestConfig, Span>();

const applyOtelInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config) => {
    const span = tracer.startSpan(
      `HTTP ${(config.method ?? 'GET').toUpperCase()} ${config.url}`,
      { kind: SpanKind.CLIENT },
      getSessionContext(),
    );
    const { traceId, spanId, traceFlags } = span.spanContext();
    const flags = traceFlags.toString(16).padStart(2, '0');
    config.headers['traceparent'] = `00-${traceId}-${spanId}-${flags}`;
    spanMap.set(config, span);
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      spanMap.get(response.config)?.setStatus({ code: SpanStatusCode.OK });
      spanMap.get(response.config)?.end();
      return response;
    },
    (error) => {
      const span = error.config ? spanMap.get(error.config as InternalAxiosRequestConfig) : undefined;
      span?.setStatus({ code: SpanStatusCode.ERROR, message: String(error.message) });
      span?.end();
      return Promise.reject(error);
    },
  );
};

export { applyOtelInterceptors };
