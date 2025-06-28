import axios, { type AxiosResponse } from 'axios';
import { message } from 'antd';

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code !== 0) {
      message.error(res.msg || 'Error');
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { service };
