export const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const withMinDelay = <T>(promise: Promise<T>, ms = 1000): Promise<T> =>
  Promise.all([promise, delay(ms)]).then(([result]) => result);
