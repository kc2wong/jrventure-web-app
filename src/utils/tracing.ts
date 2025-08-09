import { Context, context, propagation, trace } from '@opentelemetry/api';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

// Must set propagator first
propagation.setGlobalPropagator(new B3Propagator());

// Create a provider with span processors
const provider = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new InMemorySpanExporter())],
});
provider.register({
  contextManager: new ZoneContextManager(), // 👈 keeps context across awaits
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation(), new FetchInstrumentation()],
});

const tracer = trace.getTracer('default-root-tracer');

// Create a single root span once (e.g., on app start)
const defaultRootSpan = tracer.startSpan('default-root-span');

// Create a context with that span set active
let defaultCtx: Context | undefined;

export const resetRootSpan = () => {
  const defaultRootSpan = tracer.startSpan('default-root-span');
  defaultCtx = trace.setSpan(context.active(), defaultRootSpan);
};

// Helper function to run code inside default root span context
export const runWithDefaultSpan = <T>(fn: () => Promise<T> | T): Promise<T> | T => {
  return context.with(defaultCtx ?? context.active(), fn);
};

// When app unloads, end the root span
window.addEventListener('beforeunload', () => {
  defaultRootSpan.end();
});
