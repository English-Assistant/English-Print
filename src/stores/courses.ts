import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  name: string;
}

interface CourseStore {
  courses: Course[];
  addCourse: (name: string) => void;
  updateCourse: (id: string, name: string) => void;
  deleteCourse: (id: string) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      courses: [],
      addCourse: (name) =>
        set((state) => ({
          courses: [...state.courses, { id: Date.now().toString(), name }],
        })),
      updateCourse: (id, name) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, name } : c)),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'englishprint-course-store',
    },
  ),
);
