import { create } from "zustand";

type NoHeartsTestModalState = {
  isOpen: boolean;
  onRefill?: () => void;
  onExit?: () => void;
  open: (onRefill: () => void, onExit: () => void) => void;
  close: () => void;
};

export const useNoHeartsTestModal = create<NoHeartsTestModalState>((set) => ({
  isOpen: false,
  onRefill: undefined,
  onExit: undefined,
  open: (onRefill: () => void, onExit: () => void) =>
    set({ isOpen: true, onRefill, onExit }),
  close: () => set({ isOpen: false, onRefill: undefined, onExit: undefined })
}));
