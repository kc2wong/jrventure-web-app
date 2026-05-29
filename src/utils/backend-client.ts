import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { applyOtelInterceptors } from './otel-axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

applyOtelInterceptors(axiosInstance);

const backendMutator = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config).then(({ data }) => data as T);
};

export { backendMutator };
