// src/stores/papers.ts (已优化)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// [修正] 从新的类型文件中导入 Paper
import type { Paper } from '@/data/types/paper';
import dexieStorage from './storage';

export interface PaperStore {
  papers: Paper[];
  getPaperById: (id: string) => Paper | undefined;
  // [修正] addPaper 的输入类型应为 Partial<Paper> 以增加灵活性
  addPaper: (p: Partial<Paper>) => void;
  deletePaper: (id: string) => void;
  updatePaper: (id: string, updatedFields: Partial<Omit<Paper, 'id'>>) => void;
  deletePapersByCourseId: (courseId: string) => void;
}

export const usePaperStore = create<PaperStore>()(
  persist(
    (set, get) => ({
      papers: [],
      getPaperById: (id) => get().papers.find((p) => p.id === id),
      addPaper: (p) => {
        const now = new Date().toISOString();
        const newPaper: Paper = {
          title: '',
          coreWords: '',
          keySentences: '',
          ...p,
          id: p.id || crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          papers: [...state.papers, newPaper],
        }));
      },
      deletePaper: (id) =>
        set((state) => ({ papers: state.papers.filter((p) => p.id !== id) })),
      updatePaper: (id, updatedFields) =>
        set((state) => ({
          papers: state.papers.map((p) =>
            p.id === id
              ? { ...p, ...updatedFields, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),
      deletePapersByCourseId: (courseId) =>
        set((state) => ({
          papers: state.papers.filter((p) => p.courseId !== courseId),
        })),
    }),
    {
      name: 'paper-storage',
      storage: createJSONStorage(() => dexieStorage),
    },
  ),
);

export { type Paper };
