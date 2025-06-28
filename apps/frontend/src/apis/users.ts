import { service, type ApiResponse } from '../utils/request';
import type { User, UpdateDifyConfigDto } from '@english-print/types';

/**
 * 获取当前登录用户的信息
 */
export async function getProfile() {
  const res = await service.get<ApiResponse<User>>('/users/me');
  return res.data;
}

/**
 * 更新当前用户的 Dify 配置
 * @param data {UpdateDifyConfigDto}
 */
export async function updateDifyConfig(data: UpdateDifyConfigDto) {
  const res = await service.patch<ApiResponse<User>>(
    '/users/me/dify-config',
    data,
  );
  return res.data;
}
