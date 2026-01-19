import { create } from 'zustand';

interface TimerState {
    uptime: number;
    isOverheated: boolean;
    isSystemActive: boolean; // True when user has passed the HeroGate
    tick: () => void;
    resetSystem: () => void;
    setOverheated: (status: boolean) => void;
    setSystemActive: (status: boolean) => void;
    coolDown: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
    uptime: 0,
    isOverheated: false,
    isSystemActive: false,
    tick: () => set((state) => ({ uptime: state.uptime + 1 })),
    resetSystem: () => {
        console.log("TimerStore: RESET SYSTEM called");
        set({ uptime: 0, isOverheated: false });
    },
    setOverheated: (status) => set({ isOverheated: status }),
    setSystemActive: (status) => set({ isSystemActive: status }),
    coolDown: () => set((state) => {
        console.log("TimerStore: COOLDOWN called. Current Uptime:", state.uptime);
        return { isOverheated: false };
    }),
}));
