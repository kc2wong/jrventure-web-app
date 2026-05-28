/* eslint-disable no-console */
import { getTraceId } from './otel';

export { clearTrace, initTrace } from './otel';

const formatTimestamp = (): string => {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const pad3 = (n: number) => String(n).padStart(3, '0');
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${pad3(d.getMilliseconds())}`
  );
};

const formatLine = (level: string, message: string): string =>
  `${formatTimestamp()}  ${level.padEnd(5)} [${getTraceId()}] --- [Browser] : ${message}`;

const log = (consoleFn: (...args: unknown[]) => void, level: string, message: string, obj?: unknown): void => {
  const line = formatLine(level, message);
  if (obj !== undefined) {
    consoleFn(line, obj);
  } else {
    consoleFn(line);
  }
};

const logger = {
  trace: (message: string, obj?: unknown) => log(console.debug, 'TRACE', message, obj),
  debug: (message: string, obj?: unknown) => log(console.debug, 'DEBUG', message, obj),
  info:  (message: string, obj?: unknown) => log(console.info,  'INFO',  message, obj),
  warn:  (message: string, obj?: unknown) => log(console.warn,  'WARN',  message, obj),
  error: (message: string, obj?: unknown) => log(console.error, 'ERROR', message, obj),
};

export { logger };
