import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Course } from '@/data/types/course';
import dexieStorage from './storage';
import dayjs from 'dayjs';
import { usePaperStore } from './papers';

export interface CourseStore {
  courses: Course[];
  addCourse: (course: Partial<Course>) => void;
  updateCourse: (id: string, updates: Partial<Omit<Course, 'id'>>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
}

export const useCourseStore = create(
  persist<CourseStore>(
    (set, get) => ({
      courses: [],
      addCourse: (course) => {
        const newCourse: Course = {
          id: course.id || `course-${dayjs().valueOf()}`,
          title: course.title || '',
          description: course.description || '',
          createdAt: dayjs().toISOString(),
        };
        set((state) => ({ courses: [...state.courses, newCourse] }));
      },
      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
      deleteCourse: (id) => {
        // 1. 先删除关联的试卷
        usePaperStore.getState().deletePapersByCourseId(id);
        // 2. 再删除课程本身
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        }));
      },
      getCourseById: (id) => {
        return get().courses.find((c) => c.id === id);
      },
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => dexieStorage),
    },
  ),
);

export { type Course };
