import { create } from 'zustand';

interface TransitionState {
    isTransitioning: boolean;
    shouldReveal: boolean; // New state to manual trigger reveal
    direction: 'up' | 'down';
    targetTheme: 'light' | 'dark' | null;
    lastTransitionTime: number;
    startTransition: (direction?: 'up' | 'down', targetTheme?: 'light' | 'dark' | null) => void;
    endTransition: () => void;
    triggerReveal: () => void; // New action to manual trigger reveal
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
    isTransitioning: false,
    shouldReveal: false,
    direction: 'up',
    targetTheme: null,
    lastTransitionTime: 0,
    startTransition: (direction = 'up', targetTheme = null) => {
        const now = Date.now();
        if (now - get().lastTransitionTime < 500) return; // 0.2s cooldown
        set({ isTransitioning: true, shouldReveal: false, direction, targetTheme, lastTransitionTime: now });
    },
    endTransition: () => set({ isTransitioning: false, shouldReveal: false, direction: 'up', targetTheme: null }),
    triggerReveal: () => set({ shouldReveal: true }),
}));
