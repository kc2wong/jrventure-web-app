import { client } from '../__generated__/linkedup-web-api-client/client.gen';
import { createSystemError } from './error-util';

client.setConfig({
  baseURL: process.env.REACT_APP_WEB_API_URL,
  withCredentials: true,
});

export const callRepo = async <T>(
  repoCall: () => Promise<{ data?: T; error?: any }>,
  authorizationToken?: string,
): Promise<T> => {
  if (authorizationToken) {
    client.instance.interceptors.request.use((config) => {
      config.headers.set('Authorization', `Bearer ${authorizationToken}`);
      return config;
    });
  }
  const { data, error } = await repoCall();
  if (error) {
    throw createSystemError(error);
  }
  if (data === undefined) {
    throw new Error('Unexpected: No error, but data is undefined');
  }
  return data;
};
