import { create } from 'zustand';

interface IntroState {
    isEntered: boolean;
    hasLoaded: boolean;
    setEntered: (value: boolean) => void;
    setHasLoaded: (value: boolean) => void;
}

export const useIntroStore = create<IntroState>((set) => ({
    isEntered: false,
    hasLoaded: false,
    setEntered: (value) => set({ isEntered: value }),
    setHasLoaded: (value) => set({ hasLoaded: value }),
}));
