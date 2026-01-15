import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LessonState = "completed" | "available" | "locked";

export interface LessonStateInfo {
  unitId: number;
  name: string;
  state: LessonState;
  position: number;
  mandatory: boolean;
  isFirstMandatory?: boolean;
  isHighestPosition?: boolean;
  isOptionalHighest?: boolean;
}

interface LessonStatesStore {
  lessonStates: Record<string, LessonStateInfo[]>;

  setLessonStates: (
    curriculumId: string | number,
    lessons: LessonStateInfo[]
  ) => void;

  getLessonStates: (curriculumId: string | number) => LessonStateInfo[];

  getAvailableLessons: (curriculumId: string | number) => LessonStateInfo[];

  getCompletedLessons: (curriculumId: string | number) => LessonStateInfo[];

  getLockedLessons: (curriculumId: string | number) => LessonStateInfo[];

  getLessonState: (
    curriculumId: string | number,
    unitId: number
  ) => LessonStateInfo | undefined;

  updateLessonState: (
    curriculumId: string | number,
    unitId: number,
    state: LessonState
  ) => void;

  clearCurriculumStates: (curriculumId: string | number) => void;

  clearAll: () => void;
}

const normalizeId = (id: string | number): string => String(id);

export const useLessonStatesStore = create<LessonStatesStore>()(
  persist(
    (set, get) => ({
      lessonStates: {},

      setLessonStates: (curriculumId, lessons) => {
        const key = normalizeId(curriculumId);
        set((state) => ({
          lessonStates: {
            ...state.lessonStates,
            [key]: lessons
          }
        }));
      },

      getLessonStates: (curriculumId) => {
        const key = normalizeId(curriculumId);
        const state = get();
        return state.lessonStates[key] || [];
      },

      getAvailableLessons: (curriculumId) => {
        const key = normalizeId(curriculumId);
        const state = get();
        const lessons = state.lessonStates[key] || [];
        return lessons.filter((lesson) => lesson.state === "available");
      },

      getCompletedLessons: (curriculumId) => {
        const key = normalizeId(curriculumId);
        const state = get();
        const lessons = state.lessonStates[key] || [];
        return lessons.filter((lesson) => lesson.state === "completed");
      },

      getLockedLessons: (curriculumId) => {
        const key = normalizeId(curriculumId);
        const state = get();
        const lessons = state.lessonStates[key] || [];
        return lessons.filter((lesson) => lesson.state === "locked");
      },

      getLessonState: (curriculumId, unitId) => {
        const key = normalizeId(curriculumId);
        const state = get();
        const lessons = state.lessonStates[key] || [];
        return lessons.find((lesson) => lesson.unitId === unitId);
      },

      updateLessonState: (curriculumId, unitId, newState) => {
        const key = normalizeId(curriculumId);
        set((state) => {
          const lessons = state.lessonStates[key] || [];
          const updatedLessons = lessons.map((lesson) =>
            lesson.unitId === unitId ? { ...lesson, state: newState } : lesson
          );

          return {
            lessonStates: {
              ...state.lessonStates,
              [key]: updatedLessons
            }
          };
        });
      },

      clearCurriculumStates: (curriculumId) => {
        const key = normalizeId(curriculumId);
        set((state) => {
          const newStates = { ...state.lessonStates };
          delete newStates[key];
          return { lessonStates: newStates };
        });
      },

      clearAll: () => set({ lessonStates: {} })
    }),
    {
      name: "lesson-states-storage"
    }
  )
);
