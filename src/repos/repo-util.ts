import { client } from '../__generated__/linkedup-web-api-client/client.gen';
import { createSystemError } from './error-util';
import type { _Error as Error } from '@webapi/';
import { delay } from '@utils/date-util';

client.setConfig({
  baseURL: import.meta.env.VITE_REACT_APP_WEB_API_URL,
  withCredentials: true,
});

const minDurationMs = 300;
export const callRepo = async <T>(
  repoCall: () => Promise<{ data?: T; error?: any }>,
  authorizationToken?: string,
): Promise<T | Error> => {
  const startTime = Date.now();
  if (authorizationToken) {
    client.instance.interceptors.request.use((config) => {
      config.headers.set('Authorization', `Bearer ${authorizationToken}`);
      return config;
    });
  }
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
};
