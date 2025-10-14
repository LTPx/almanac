import { create } from "zustand";

type NoHeartsModalState = {
  isOpen: boolean;
  lessonName: string;
  open: (lessonName: string) => void;
  close: () => void;
};

export const useNoHeartsModal = create<NoHeartsModalState>((set) => ({
  isOpen: false,
  lessonName: "",
  open: (lessonName: string) => set({ isOpen: true, lessonName }),
  close: () => set({ isOpen: false, lessonName: "" })
}));
