import { service, type ApiResponse } from '../utils/request';
import type { LoginDto, RegisterDto, User } from '@english-print/types';

/**
 * 登录接口
 * @param data {LoginDto}
 * @returns access_token
 */
export async function login(data: LoginDto) {
  interface LoginRes {
    access_token: string;
  }

  const res = await service.post<ApiResponse<LoginRes>>('/auth/login', data);
  const token = res.data.data.access_token;

  if (token) {
    localStorage.setItem('auth_token', token);
  }

  return token;
}

/**
 * 注册接口
 * @param data {RegisterDto}
 */
export async function register(data: RegisterDto) {
  const res = await service.post<ApiResponse<Omit<User, 'password'>>>(
    '/auth/register',
    data,
  );
  return res.data;
}
