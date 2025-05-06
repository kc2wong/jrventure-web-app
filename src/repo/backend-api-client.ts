import { WebApiClient } from '../__generated__/linkedup-web-api-client';

// Create the client instance with server and authentication details
const webApiClient = new WebApiClient({
  BASE: process.env.REACT_APP_WEB_API_URL,
  CREDENTIALS: 'include',
  WITH_CREDENTIALS: true,
});

export { webApiClient };
