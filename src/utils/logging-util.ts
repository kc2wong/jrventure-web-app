import { trace, context } from '@opentelemetry/api';
import pino from 'pino';

import { runWithDefaultSpan } from './tracing';

interface Logger {
  info: (message: string) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

const pinoLogger = pino({
  browser: {
    asObject: true, // logs as objects instead of strings
  },
});

// Utility to format messages with traceId if available
const formatMessage = (message: string): string => {
  const span = trace.getSpan(context.active());
  const traceId = span?.spanContext().traceId;
  return traceId ? `[traceId=${traceId}] ${message}` : message;
};

export const logger: Logger = {
  info: (message: string) => runWithDefaultSpan(() => pinoLogger.info(formatMessage(message))),
  debug: (message: string) => runWithDefaultSpan(() => pinoLogger.debug(formatMessage(message))),
  warn: (message: string) => runWithDefaultSpan(() => pinoLogger.warn(formatMessage(message))),
  error: (message: string) => runWithDefaultSpan(() => pinoLogger.error(formatMessage(message))),
};
