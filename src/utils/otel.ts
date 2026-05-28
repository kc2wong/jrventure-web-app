import { type Context, type Span, context, trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

const provider = new WebTracerProvider();
// register() with no args sets up W3CTraceContextPropagator + W3CBaggagePropagator by default
provider.register();

// Use provider.getTracer() directly to avoid ProxyTracer delegation issues
const tracer = provider.getTracer('jrventure-web', '1.0.0');

let sessionSpan: Span | null = null;

const initTrace = (): void => {
  sessionSpan?.end();
  sessionSpan = tracer.startSpan('app-session');
};

const clearTrace = (): void => {
  sessionSpan?.end();
  sessionSpan = null;
};

// Read directly off the span to avoid the isSpanContextValid() guard in trace.getSpan()
const getTraceId = (): string => sessionSpan?.spanContext().traceId ?? '0'.repeat(32);

const getSessionContext = (): Context =>
  sessionSpan ? trace.setSpan(context.active(), sessionSpan) : context.active();

export { clearTrace, getSessionContext, getTraceId, initTrace, tracer };
