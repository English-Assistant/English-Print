import { create, type SetState } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  name: string;
}

export interface Paper {
  id: string;
  title: string;
  remark?: string;
  courseId?: string;
  preclassJson?: string;
  paperJson?: string;
  answerJson?: string;
  copyJson?: string;
  updatedAt: string; // ISO string
}

interface StoreState {
  courses: Course[];
  papers: Paper[];
  // course actions
  addCourse: (c: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, name: string) => void;
  deleteCourse: (id: string) => void;
  // paper actions
  addPaper: (p: Omit<Paper, 'id' | 'updatedAt'>) => void;
  deletePaper: (id: string) => void;
  updatePaper: (id: string, patch: Partial<Paper>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set: SetState<StoreState>) => ({
      courses: [],
      papers: [],
      addCourse: (c) =>
        set((state: StoreState) => ({
          courses: [...state.courses, { id: Date.now().toString(), ...c }],
        })),
      updateCourse: (id, name) =>
        set((state: StoreState) => ({
          courses: state.courses.map((cs: Course) =>
            cs.id === id ? { ...cs, name } : cs,
          ),
        })),
      deleteCourse: (id) =>
        set((state: StoreState) => ({
          courses: state.courses.filter((c: Course) => c.id !== id),
          papers: state.papers.map((p: Paper) =>
            p.courseId === id ? { ...p, courseId: undefined } : p,
          ),
        })),
      addPaper: (p) =>
        set((state: StoreState) => ({
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
        set((state: StoreState) => ({
          papers: state.papers.filter((p) => p.id !== id),
        })),
      updatePaper: (id, patch) =>
        set((state: StoreState) => ({
          papers: state.papers.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),
    }),
    {
      name: 'englishprint-store',
    },
  ),
);
