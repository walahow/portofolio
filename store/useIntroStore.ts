import { create } from 'zustand';

interface IntroState {
    isEntered: boolean;
    setEntered: (value: boolean) => void;
}

export const useIntroStore = create<IntroState>((set) => ({
    isEntered: false,
    setEntered: (value) => set({ isEntered: value }),
}));
