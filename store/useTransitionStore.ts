import { create } from 'zustand';

interface TransitionState {
    isTransitioning: boolean;
    shouldReveal: boolean; // New state to manual trigger reveal
    direction: 'up' | 'down';
    startTransition: (direction?: 'up' | 'down') => void;
    endTransition: () => void;
    triggerReveal: () => void; // New action to manual trigger reveal
}

export const useTransitionStore = create<TransitionState>((set) => ({
    isTransitioning: false,
    shouldReveal: false,
    direction: 'up',
    startTransition: (direction = 'up') => set({ isTransitioning: true, shouldReveal: false, direction }),
    endTransition: () => set({ isTransitioning: false, shouldReveal: false, direction: 'up' }),
    triggerReveal: () => set({ shouldReveal: true }),
}));
