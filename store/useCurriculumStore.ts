import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurriculumState {
  selectedCurriculumId: string;
  setSelectedCurriculumId: (id: string) => void;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set) => ({
      selectedCurriculumId: "",
      setSelectedCurriculumId: (id: string) => set({ selectedCurriculumId: id })
    }),
    {
      name: "curriculum-storage"
    }
  )
);
