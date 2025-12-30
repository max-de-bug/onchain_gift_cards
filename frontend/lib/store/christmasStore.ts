import { create } from "zustand";

interface ChristmasState {
  isChristmasMode: boolean;
  setIsChristmasMode: (enabled: boolean) => void;
  toggleChristmasMode: () => void;
}

export const useChristmasStore = create<ChristmasState>((set) => ({
  isChristmasMode: false,
  setIsChristmasMode: (enabled) => set({ isChristmasMode: enabled }),
  toggleChristmasMode: () =>
    set((state) => ({ isChristmasMode: !state.isChristmasMode })),
}));

