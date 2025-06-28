import { service, type ApiResponse } from '../utils/request';
import type {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
} from '@english-print/types';

/**
 * 获取当前用户的所有课程
 */
export async function getCourses() {
  const res = await service.get<ApiResponse<Course[]>>('/courses');
  return res.data;
}

/**
 * 根据ID获取特定课程
 * @param id 课程ID
 */
export async function getCourseById(id: number) {
  const res = await service.get<ApiResponse<Course>>(`/courses/${id}`);
  return res.data;
}

/**
 * 创建新课程
 * @param data {CreateCourseDto}
 */
export async function createCourse(data: CreateCourseDto) {
  const res = await service.post<ApiResponse<Course>>('/courses', data);
  return res.data;
}

/**
 * 更新课程信息
 * @param id 课程ID
 * @param data {UpdateCourseDto}
 */
export async function updateCourse(id: number, data: UpdateCourseDto) {
  const res = await service.patch<ApiResponse<Course>>(`/courses/${id}`, data);
  return res.data;
}

/**
 * 删除课程
 * @param id 课程ID
 */
export async function deleteCourse(id: number) {
  const res = await service.delete<ApiResponse>(`/courses/${id}`);
  return res.data;
}
