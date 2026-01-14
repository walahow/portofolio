import { create } from 'zustand';

interface PerformanceState {
    enableBlur: boolean;
    enableNoise: boolean;
    enableAnimations: boolean;
    toggleBlur: () => void;
    toggleNoise: () => void;
    toggleAnimations: () => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
    enableBlur: true,
    enableNoise: true,
    enableAnimations: true, // For heavy animations like text scrambles
    toggleBlur: () => set((state) => ({ enableBlur: !state.enableBlur })),
    toggleNoise: () => set((state) => ({ enableNoise: !state.enableNoise })),
    toggleAnimations: () => set((state) => ({ enableAnimations: !state.enableAnimations })),
}));
