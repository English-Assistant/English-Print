import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Course } from '../data/types/course';
import dexieStorage from './storage';

interface CourseStore {
  courses: Course[];
  getCourseById: (id: string) => Course | undefined;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  deleteCourse: (id: string) => void;
  updateCourse: (id: string, patch: Partial<Omit<Course, 'id'>>) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      getCourseById: (id) => get().courses.find((c) => c.id === id),
      addCourse: (course) =>
        set((state) => ({
          courses: [
            ...state.courses,
            {
              ...course,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateCourse: (id, patch) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => dexieStorage),
    },
  ),
);
