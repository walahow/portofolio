import { create } from 'zustand';

interface TimerState {
    uptime: number;
    isOverheated: boolean;
    isSystemActive: boolean; // True when user has passed the HeroGate
    tick: () => void;
    reset: () => void;
    setOverheated: (status: boolean) => void;
    setSystemActive: (status: boolean) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
    uptime: 0,
    isOverheated: false,
    isSystemActive: false,
    tick: () => set((state) => ({ uptime: state.uptime + 1 })),
    reset: () => set({ uptime: 0, isOverheated: false }),
    setOverheated: (status) => set({ isOverheated: status }),
    setSystemActive: (status) => set({ isSystemActive: status }),
}));
