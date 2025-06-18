import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Paper {
  id: string;
  title: string;
  remark?: string;
  courseId?: string;
  preclass?: string; // markdown
  copyJson?: string;
  examJson?: string;
  answerJson?: string;
  updatedAt: string;
}

interface PaperStore {
  papers: Paper[];
  addPaper: (p: Omit<Paper, 'id' | 'updatedAt'>) => void;
  deletePaper: (id: string) => void;
  updatePaper: (id: string, patch: Partial<Paper>) => void;
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
              id: Date.now().toString(),
              updatedAt: new Date().toISOString(),
              ...p,
            },
          ],
        })),
      deletePaper: (id) =>
        set((state) => ({ papers: state.papers.filter((p) => p.id !== id) })),
      updatePaper: (id, patch) =>
        set((state) => ({
          papers: state.papers.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),
    }),
    { name: 'englishprint-paper-store' },
  ),
);
