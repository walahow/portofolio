import { create } from 'zustand';

interface TransitionState {
    isTransitioning: boolean;
    startTransition: () => void;
    endTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
    isTransitioning: false,
    startTransition: () => set({ isTransitioning: true }),
    endTransition: () => set({ isTransitioning: false }),
}));
