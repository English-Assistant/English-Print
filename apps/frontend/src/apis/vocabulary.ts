import { service, type ApiResponse } from '../utils/request';
import type {
  Vocabulary,
  CreateVocabularyDto,
  UpdateVocabularyDto,
} from '@english-print/types';

interface PaginatedVocabularies {
  data: Vocabulary[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    lastPage: number;
  };
}

/**
 * 获取单词列表（分页）
 * @param page 页码
 * @param pageSize 每页数量
 */
export async function getVocabularies(page = 1, pageSize = 10) {
  const res = await service.get<ApiResponse<PaginatedVocabularies>>(
    '/vocabulary',
    {
      params: { page, pageSize },
    },
  );
  return res.data;
}

/**
 * 新增单词
 * @param data {CreateVocabularyDto}
 */
export async function createVocabulary(data: CreateVocabularyDto) {
  const res = await service.post<ApiResponse<Vocabulary>>('/vocabulary', data);
  return res.data;
}

/**
 * 获取单个单词详情
 * @param id 单词ID
 */
export async function getVocabularyById(id: number) {
  const res = await service.get<ApiResponse<Vocabulary>>(`/vocabulary/${id}`);
  return res.data;
}

/**
 * 更新单词
 * @param id 单词ID
 * @param data {UpdateVocabularyDto}
 */
export async function updateVocabulary(id: number, data: UpdateVocabularyDto) {
  const res = await service.patch<ApiResponse<Vocabulary>>(
    `/vocabulary/${id}`,
    data,
  );
  return res.data;
}

/**
 * 删除单词
 * @param id 单词ID
 */
export async function deleteVocabulary(id: number) {
  const res = await service.delete<ApiResponse<{ deletedId: number }>>(
    `/vocabulary/${id}`,
  );
  return res.data;
}
