import { client } from '../__generated__/linkedup-web-api-client/client.gen';

client.setConfig({
  baseURL: process.env.REACT_APP_WEB_API_URL,
  withCredentials: true,
});
