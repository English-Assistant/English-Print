import { service, type ApiResponse } from '../utils/request';
import type {
  Paper,
  CreatePaperDto,
  UpdatePaperDto,
  GenerationTask,
} from '@english-print/types';

/**
 * 获取试卷列表，可选择按课程ID筛选
 * @param courseId (可选) 课程ID
 */
export async function getPapers(courseId?: number) {
  const params = courseId ? { courseId } : {};
  const res = await service.get<ApiResponse<Paper[]>>('/papers', { params });
  return res.data;
}

/**
 * 根据ID获取特定试卷
 * @param id 试卷ID
 */
export async function getPaperById(id: number) {
  const res = await service.get<ApiResponse<Paper>>(`/papers/${id}`);
  return res.data;
}

/**
 * 创建新试卷
 * @param data {CreatePaperDto}
 */
export async function createPaper(data: CreatePaperDto) {
  const res = await service.post<ApiResponse<Paper>>('/papers', data);
  return res.data;
}

/**
 * 更新试卷信息
 * @param id 试卷ID
 * @param data {UpdatePaperDto}
 */
export async function updatePaper(id: number, data: UpdatePaperDto) {
  const res = await service.patch<ApiResponse<Paper>>(`/papers/${id}`, data);
  return res.data;
}

/**
 * 删除试卷
 * @param id 试卷ID
 */
export async function deletePaper(id: number) {
  const res = await service.delete<ApiResponse>(`/papers/${id}`);
  return res.data;
}

/**
 * 为试卷异步生成内容
 * @param id 试卷ID
 */
export async function generatePaperContent(id: number) {
  const res = await service.post<ApiResponse<GenerationTask>>(
    `/papers/${id}/generate`,
  );
  return res.data;
}
