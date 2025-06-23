import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Paper } from '@/data/types/exam';

interface PaperStore {
  papers: Paper[];
  addPaper: (p: Omit<Paper, 'id' | 'sections'>) => void;
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
              sections: [],
              ...p,
            },
          ],
        })),
      deletePaper: (id) =>
        set((state) => ({ papers: state.papers.filter((p) => p.id !== id) })),
      updatePaper: (id, patch) =>
        set((state) => ({
          papers: state.papers.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
    }),
    { name: 'englishprint-paper-store' },
  ),
);
