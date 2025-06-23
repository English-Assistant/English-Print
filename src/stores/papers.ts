// src/stores/papers.ts (已优化)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// [修正] 从新的类型文件中导入 Paper
import type { Paper } from '@/data/types/paper';

interface PaperStore {
  papers: Paper[];
  // [修正] addPaper 的输入类型应不包含由store管理的字段
  addPaper: (p: Omit<Paper, 'id' | 'updatedAt'>) => void;
  deletePaper: (id: string) => void;
  updatePaper: (id: string, patch: Partial<Omit<Paper, 'id'>>) => void;
}

export const usePaperStore = create<PaperStore>()(
  persist(
    (set) => ({
      papers: [],
      addPaper: (p) =>
        set((state) => ({
          papers: [
            ...state.papers,
            {
              ...p, // 先展开传入的数据
              id: Date.now().toString(), // [修正] store负责生成ID
              updatedAt: new Date().toISOString(), // [修正] store负责生成初始时间戳
            },
          ],
        })),
      deletePaper: (id) =>
        set((state) => ({ papers: state.papers.filter((p) => p.id !== id) })),
      updatePaper: (id, patch) =>
        set((state) => ({
          papers: state.papers.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  updatedAt: new Date().toISOString(), // [修正] 每次更新都自动刷新时间戳
                }
              : p,
          ),
        })),
    }),
    { name: 'englishprint-paper-store' },
  ),
);
