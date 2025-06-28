import { service, type ApiResponse } from '../utils/request';
import type { GenerationTask, TaskStatus } from '@english-print/types';

/**
 * 获取任务列表
 * @param status (可选) 按任务状态筛选
 */
export async function getTasks(status?: TaskStatus) {
  const params = status ? { status } : {};
  const res = await service.get<ApiResponse<GenerationTask[]>>('/tasks', {
    params,
  });
  return res.data;
}

/**
 * 重试一个失败的任务
 * @param id 任务ID
 */
export async function retryTask(id: number) {
  const res = await service.post<ApiResponse<GenerationTask>>(
    `/tasks/${id}/retry`,
  );
  return res.data;
}

/**
 * 取消一个正在进行中的任务
 * @param id 任务ID
 */
export async function cancelTask(id: number) {
  const res = await service.delete<ApiResponse<GenerationTask>>(`/tasks/${id}`);
  return res.data;
}
