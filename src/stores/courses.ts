import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  name: string;
  description: string;
}

interface CourseStore {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Omit<Course, 'id'>>) => void;
  deleteCourse: (id: string) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      courses: [],
      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, { id: Date.now().toString(), ...course }],
        })),
      updateCourse: (id, course) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...course } : c,
          ),
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
